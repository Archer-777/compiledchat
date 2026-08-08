/**
 * SAI (Spiritualise AI) — Streaming client via backend proxy with Typewriter Pacer
 *
 * The browser cannot call aicredits.in directly (CORS).
 * All requests are proxied through localhost:4000 /api/v1/chat/sai/stream
 * which relays the SSE stream back to the client.
 *
 * Includes a smooth Typewriter Pacer so fast models like deepseek-v4-flash
 * stream smoothly word-by-word / token-by-token instead of dumping all text at once.
 */

const BACKEND_STREAM_URL = 'http://localhost:4000/api/v1/chat/sai/stream';

/**
 * Stream SAI response tokens smoothly to the caller via callbacks.
 * @param {Array} messages - [{ sender: 'user'|'ai', text: string }]
 * @param {Function} onChunk - (displayedText) => void
 * @param {Function} onDone - (fullText) => void
 * @param {Function} onError - (err) => void
 */
export async function sendToSAIStream(messages, onChunk, onDone, onError) {
  let targetText = '';
  let currentDisplayed = '';
  let isNetworkDone = false;
  let timer = null;

  try {
    // Start smooth typewriter loop every 20ms
    timer = setInterval(() => {
      if (currentDisplayed.length < targetText.length) {
        const backlog = targetText.length - currentDisplayed.length;
        // Dynamically adjust step size: 1-5 chars per interval for a smooth, natural typing pace
        const step = backlog > 100 ? 8 : backlog > 40 ? 4 : backlog > 15 ? 2 : 1;
        currentDisplayed = targetText.substring(0, currentDisplayed.length + step);
        onChunk(currentDisplayed);
      } else if (isNetworkDone && currentDisplayed.length >= targetText.length) {
        if (timer) clearInterval(timer);
        onDone(targetText || '...');
      }
    }, 20);

    const response = await fetch(BACKEND_STREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      if (timer) clearInterval(timer);
      throw new Error(`Backend error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const raw = line.slice(5).trim();

        if (raw === '[DONE]') {
          isNetworkDone = true;
          break;
        }
        if (raw.startsWith('[ERROR]')) {
          if (timer) clearInterval(timer);
          throw new Error(raw);
        }

        try {
          const parsed = JSON.parse(raw);
          const token = parsed?.choices?.[0]?.delta?.content ?? '';
          if (token) {
            targetText += token;
          }
        } catch {
          // skip
        }
      }
    }

    isNetworkDone = true;
  } catch (err) {
    if (timer) clearInterval(timer);
    console.error('sendToSAIStream error:', err);
    onError(err);
  }
}
