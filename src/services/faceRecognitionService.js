/**
 * Face Recognition Service using @vladmandic/face-api (TensorFlow.js-based)
 * 
 * Provides real ML-based face detection, 68-point landmark detection,
 * and 128-dimensional face descriptor extraction for accurate face matching.
 */

let fapi = null;
let modelsLoaded = false;
let loadingPromise = null;

/**
 * Dynamically import face-api and load neural network models
 */
async function loadModels() {
  if (modelsLoaded) return true;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      // Dynamic import for web compatibility
      fapi = await import('@vladmandic/face-api');
      
      // Try loading from local public/models first, fallback to CDN
      const MODEL_URLS = [
        '/models',
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model',
      ];

      let loaded = false;
      for (const url of MODEL_URLS) {
        try {
          console.log(`[FaceAPI] Trying to load models from: ${url}`);
          await Promise.all([
            fapi.nets.tinyFaceDetector.loadFromUri(url),
            fapi.nets.faceLandmark68Net.loadFromUri(url),
            fapi.nets.faceRecognitionNet.loadFromUri(url),
            fapi.nets.faceExpressionNet.loadFromUri(url),
          ]);
          loaded = true;
          console.log(`[FaceAPI] Models loaded from: ${url}`);
          break;
        } catch (e) {
          console.warn(`[FaceAPI] Failed to load from ${url}:`, e.message);
        }
      }

      if (!loaded) {
        throw new Error('Could not load models from any URL');
      }

      modelsLoaded = true;
      console.log('[FaceAPI] All 4 neural network models (including Face Expressions) loaded successfully');
      return true;
    } catch (err) {
      console.error('[FaceAPI] Model loading failed:', err);
      modelsLoaded = false;
      loadingPromise = null;
      return false;
    }
  })();

  return loadingPromise;
}

/**
 * Detect a face from a canvas element and extract its 128-D descriptor and emotions/expressions.
 * We use canvas instead of video directly because CSS mirror transform
 * on the video element confuses the face detection neural network.
 * @param {HTMLCanvasElement} canvasElement - Canvas with video frame drawn on it
 * @returns {Object|null} - { descriptor: Float32Array(128), detection, landmarks, expressions, dominantEmotion } or null
 */
async function detectFaceFromCanvas(canvasElement) {
  if (!modelsLoaded || !fapi || !canvasElement) return null;

  try {
    // Try with TinyFaceDetector first (fast)
    let result = await fapi
      .detectSingleFace(canvasElement, new fapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.3,
      }))
      .withFaceLandmarks()
      .withFaceExpressions()
      .withFaceDescriptor();

    if (!result) {
      // Retry with larger input size
      result = await fapi
        .detectSingleFace(canvasElement, new fapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.2,
        }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();
    }

    if (!result) {
      console.log('[FaceAPI] No face detected in frame');
      return null;
    }

    let dominantEmotion = null;
    let expressions = result.expressions || null;

    if (expressions) {
      if (typeof expressions.asSortedArray === 'function') {
        const sorted = expressions.asSortedArray();
        if (sorted && sorted.length > 0) {
          dominantEmotion = {
            expression: sorted[0].expression,
            probability: Math.round(sorted[0].probability * 100) / 100,
          };
        }
      } else {
        let topExpr = '';
        let topProb = -1;
        for (const [expr, prob] of Object.entries(expressions)) {
          if (prob > topProb) {
            topProb = prob;
            topExpr = expr;
          }
        }
        if (topExpr) {
          dominantEmotion = {
            expression: topExpr,
            probability: Math.round(topProb * 100) / 100,
          };
        }
      }
    }

    return {
      descriptor: result.descriptor, // Float32Array(128)
      detection: result.detection,
      landmarks: result.landmarks,
      expressions: expressions,
      dominantEmotion: dominantEmotion,
      score: result.detection.score,
    };
  } catch (err) {
    console.error('[FaceAPI] Face detection error:', err);
    return null;
  }
}

/**
 * Helper: Draw video frame to a canvas for detection
 * This avoids issues with CSS transforms on the video element
 * @param {HTMLVideoElement} videoElement
 * @param {HTMLCanvasElement} canvasElement
 */
function drawVideoToCanvas(videoElement, canvasElement) {
  if (!videoElement || !canvasElement) return false;
  const vw = videoElement.videoWidth;
  const vh = videoElement.videoHeight;
  if (!vw || !vh) return false;
  
  canvasElement.width = vw;
  canvasElement.height = vh;
  const ctx = canvasElement.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, vw, vh);
  return true;
}

/**
 * Legacy/Fallback: Detect face directly from video by creating a temporary canvas
 * @param {HTMLVideoElement} videoElement
 */
async function detectFaceFromVideo(videoElement) {
  if (!videoElement) return null;
  const tempCanvas = document.createElement('canvas');
  const drawn = drawVideoToCanvas(videoElement, tempCanvas);
  if (!drawn) return null;
  return await detectFaceFromCanvas(tempCanvas);
}

/**
 * Compute Euclidean distance between two 128-D face descriptors
 * @param {Float32Array|number[]} d1 
 * @param {Float32Array|number[]} d2 
 * @returns {number} - Distance (lower = more similar, <0.6 = same person)
 */
function euclideanDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Match a face descriptor against an array of stored descriptors
 * @param {Float32Array|number[]} currentDescriptor - The face to match
 * @param {Array} storedFaces - Array of { id, descriptor: number[], ... }
 * @param {number} threshold - Max distance to consider a match (default 0.6)
 * @returns {Object} - { matched: boolean, bestMatch, distance, confidence }
 */
function matchFaceAgainstStored(currentDescriptor, storedFaces, threshold = 0.6) {
  if (!currentDescriptor || !storedFaces || storedFaces.length === 0) {
    return { matched: false, bestMatch: null, distance: Infinity, confidence: 0 };
  }

  let bestDistance = Infinity;
  let bestMatch = null;

  for (const stored of storedFaces) {
    let storedDesc = stored.descriptor;
    
    // Parse if stored as JSON string
    if (typeof storedDesc === 'string') {
      try {
        storedDesc = JSON.parse(storedDesc);
      } catch (_) {
        continue;
      }
    }

    // Handle nested signature objects
    if (storedDesc && typeof storedDesc === 'object' && !Array.isArray(storedDesc)) {
      if (storedDesc.descriptor) storedDesc = storedDesc.descriptor;
      else continue;
    }

    if (!Array.isArray(storedDesc) && !(storedDesc instanceof Float32Array)) continue;
    if (storedDesc.length !== 128) continue;

    const dist = euclideanDistance(currentDescriptor, storedDesc);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = stored;
    }
  }

  const matched = bestDistance < threshold;
  // Convert distance to confidence percentage (0.0 = 100%, 0.6 = 0%)
  const confidence = Math.max(0, Math.round((1 - bestDistance / threshold) * 100));

  return { matched, bestMatch, distance: bestDistance, confidence };
}

/**
 * Remove background from canvas frame using face landmarks contour hull
 * and composite vibrant, multi-layered glowing aura field matching the predicted aura theme.
 * @param {HTMLCanvasElement} targetCanvas - Canvas to draw composited result
 * @param {HTMLVideoElement|HTMLCanvasElement} sourceMedia - Source video or canvas frame
 * @param {Object} faceResult - Face detection output containing landmarks
 * @param {Object} auraColors - Color palette object { bgGradient, primary, border, glow }
 * @returns {string|null} - Base64 Data URL of composited image
 */
function removeBackgroundAndCompositeAura(targetCanvas, sourceMedia, faceResult, auraColors = {}) {
  if (!targetCanvas || !sourceMedia) return null;
  
  const width = targetCanvas.width || 320;
  const height = targetCanvas.height || 400;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return null;

  const primaryColor = auraColors.primary || '#8b5cf6';
  const borderColor = auraColors.border || '#c084fc';
  const glowColor = auraColors.glow || 'rgba(192, 132, 252, 0.9)';

  // 1. Draw Deep Space Background (Completely removes real room background)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#040611');
  bgGrad.addColorStop(0.5, '#0b0f24');
  bgGrad.addColorStop(1, '#020308');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Twinkling Star Particles in Deep Space Background
  ctx.save();
  for (let i = 0; i < 45; i++) {
    const sx = (Math.sin(i * 99 + 12) * 0.5 + 0.5) * width;
    const sy = (Math.cos(i * 33 + 7) * 0.5 + 0.5) * height;
    const sr = (i % 3 === 0) ? 1.8 : 1.0;
    ctx.fillStyle = i % 2 === 0 ? primaryColor : '#ffffff';
    ctx.globalAlpha = (i % 5 === 0) ? 0.9 : 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Determine Subject Center & Dimensions
  const centerX = width / 2;
  const centerY = height * 0.42;
  let fx = centerX;
  let fy = centerY;
  let rx = width * 0.36;
  let ry = height * 0.46;

  if (faceResult && faceResult.detection && faceResult.detection.box) {
    const box = faceResult.detection.box;
    fx = box.x + box.width / 2;
    fy = box.y + box.height / 2;
    rx = Math.max(box.width * 1.35, width * 0.32);
    ry = Math.max(box.height * 1.65, height * 0.42);
  }

  // 3. BOLD & VIBRANT MULTI-LAYERED AURA FIELD BEHIND PERSON
  ctx.save();
  
  // Layer A: Massive Radiance Field (Outer Aura Cloud)
  const outerGlow = ctx.createRadialGradient(fx, fy, rx * 0.2, fx, fy, rx * 2.2);
  outerGlow.addColorStop(0, primaryColor);
  outerGlow.addColorStop(0.35, glowColor);
  outerGlow.addColorStop(0.7, primaryColor + '55');
  outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(fx, fy, rx * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Layer B: Intense Inner Neon Energy Core
  const innerCore = ctx.createRadialGradient(fx, fy, 5, fx, fy, rx * 1.3);
  innerCore.addColorStop(0, '#ffffff');
  innerCore.addColorStop(0.3, primaryColor);
  innerCore.addColorStop(0.8, glowColor);
  innerCore.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = innerCore;
  ctx.beginPath();
  ctx.arc(fx, fy, rx * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Layer C: Pulsing Concentric Energy Rings
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.arc(fx, fy, rx * 1.15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(fx, fy, rx * 1.45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // 4. Clean Background Removal for Person (Soft Silhouette Clipping)
  if (faceResult && faceResult.landmarks) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const mctx = maskCanvas.getContext('2d');

    // Draw source camera frame onto mask canvas
    mctx.drawImage(sourceMedia, 0, 0, width, height);

    // Apply smooth destination-in cutout for person
    mctx.globalCompositeOperation = 'destination-in';
    const cutoutMask = mctx.createRadialGradient(fx, fy, rx * 0.4, fx, fy, rx * 1.35);
    cutoutMask.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
    cutoutMask.addColorStop(0.75, 'rgba(0, 0, 0, 0.95)');
    cutoutMask.addColorStop(0.95, 'rgba(0, 0, 0, 0.3)');
    cutoutMask.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    mctx.fillStyle = cutoutMask;
    mctx.beginPath();
    mctx.ellipse(fx, fy + ry * 0.15, rx * 1.25, ry * 1.35, 0, 0, Math.PI * 2);
    mctx.fill();

    // 5. Draw Neon Glow Halo Contour around Person
    ctx.save();
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 30;
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  } else {
    // Fallback if landmarks unavailable
    ctx.drawImage(sourceMedia, 0, 0, width, height);
  }

  // 6. Draw Holographic Border Frame
  ctx.save();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 3;
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);
  ctx.restore();

  return targetCanvas.toDataURL('image/jpeg', 0.92);
}

export default {
  loadModels,
  detectFaceFromCanvas,
  detectFaceFromVideo,
  drawVideoToCanvas,
  euclideanDistance,
  matchFaceAgainstStored,
  removeBackgroundAndCompositeAura,
  isLoaded: () => modelsLoaded,
};
