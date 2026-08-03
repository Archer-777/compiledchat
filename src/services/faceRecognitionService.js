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
      console.log('[FaceAPI] All 3 neural network models loaded successfully');
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
 * Detect a face from a canvas element and extract its 128-D descriptor.
 * We use canvas instead of video directly because CSS mirror transform
 * on the video element confuses the face detection neural network.
 * @param {HTMLCanvasElement} canvasElement - Canvas with video frame drawn on it
 * @returns {Object|null} - { descriptor: Float32Array(128), detection, landmarks } or null
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
      .withFaceDescriptor();

    if (!result) {
      // Retry with larger input size
      result = await fapi
        .detectSingleFace(canvasElement, new fapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.2,
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();
    }

    if (!result) {
      console.log('[FaceAPI] No face detected in frame');
      return null;
    }

    return {
      descriptor: result.descriptor, // Float32Array(128)
      detection: result.detection,
      landmarks: result.landmarks,
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

export default {
  loadModels,
  detectFaceFromCanvas,
  detectFaceFromVideo,
  drawVideoToCanvas,
  euclideanDistance,
  matchFaceAgainstStored,
  isLoaded: () => modelsLoaded,
};
