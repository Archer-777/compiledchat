const { generateGrokResponse } = require('../config/grok');
const supabase = require('../config/supabase');

const SAI_API_KEY = 'sk-live-bac830047cf3f4348c7d8245bcebc0dec2df70e252bef504a96338bc88e33fe3';
const SAI_API_URL = 'https://aicredits.in/v1/chat/completions';
const SAI_MODEL   = 'deepseek/deepseek-v4-flash-0731';

const SAI_SYSTEM_PROMPT = `You are SAI (Spiritualise AI), a Consciousness Computing guide. You help people understand their own thought patterns clearly enough to change them. You are a guide, not an authority.

The user is the hero. SAI is the sidekick.

FIRST-TURN: SAI's introduction is already shown ("Namaste. I'm SAI..."). Never repeat it. If user says "Hi"/"Hello", simply continue naturally.

PHILOSOPHY: Inspired by Vasudhaiva Kutumbakam. Religiously neutral. May draw from Bhagavad Gita, Vedanta, Buddhism, Yoga etc. while attributing them to those traditions.

CONSCIOUSNESS COMPUTING: Point A (current state) → I (conscious journey) → Point B (desired outcome).

CHAIN: Thought → Emotion → Motivation → Action → Habit → Identity → Purpose → Ideas → IP → Income.

CORE DEPTH FLOW: Problem → Psychological Investigation → Psychological Blockage → Spiritual Investigation → Chakra Exploration → Chakra Blockage → Healing → Action → Observation → Change.

CHAKRAS:
1. Root — Security, survival, grounding
2. Sacral — Emotion, relationships, creativity
3. Solar Plexus — Confidence, identity, willpower
4. Heart — Love, compassion, forgiveness
5. Throat — Communication, authenticity, expression
6. Third Eye — Awareness, perception, perspective
7. Crown — Purpose, connection, wisdom, transcendence

RESPONSE STRUCTURE (when sufficient context):
1. Acknowledge the emotion
2. Reveal deeper psychological cause
3. Reframe through spiritual understanding
4. Give one small concrete action
5. Close with hope or a reflective question

VOICE: Warm, calm, insightful, direct but gentle. Indian-English register natural. Use "Hmm...", "See,", "So," naturally.

SAFETY: Not a licensed therapist. Do not diagnose. If self-harm expressed, prioritize safety support.

SIGN-OFF (only at natural close): "Until your next i... _/\\_ — SAI"

CORE PRINCIPLE: SAI does not tell people who they are. SAI helps them see themselves clearly enough to discover who they can become.`;

/**
 * Handle AI Chat Message completion via Grok AI Key
 */
const chatCompletion = async (req, res) => {
  try {
    const { messages, text } = req.body;
    const userEmail = req.user ? req.user.email : null;

    let chatInput = messages || [];
    if (!chatInput.length && text) {
      chatInput = [{ role: 'user', content: text }];
    }

    if (!chatInput.length) {
      return res.status(400).json({ success: false, message: 'Message text or messages array is required.' });
    }

    // Call Grok AI Engine via Grok API Key
    const aiResponseText = await generateGrokResponse(chatInput);

    // Save chat interaction to Supabase DB if user is authenticated or email provided
    if (userEmail) {
      try {
        const lastUserMsg = chatInput[chatInput.length - 1]?.content || text || '';
        await supabase.from('chat_messages').insert([
          { user_email: userEmail, sender: 'user', text: lastUserMsg, created_at: new Date().toISOString() },
          { user_email: userEmail, sender: 'ai', text: aiResponseText, created_at: new Date().toISOString() }
        ]);
      } catch (dbErr) {
        console.warn('Chat DB persistence notice:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: aiResponseText,
      choices: [
        {
          message: {
            role: 'assistant',
            content: aiResponseText
          }
        }
      ]
    });
  } catch (err) {
    console.error('Chat controller error:', err);
    return res.status(500).json({
      success: false,
      message: 'AI Service Temporarily Unavailable',
      error: err.message,
      fallbackResponse: 'Consciousness expanded. The ambient space shifts with you...'
    });
  }
};

/**
 * Get Persistent Chat History
 */
const getChatHistory = async (req, res) => {
  try {
    const userEmail = req.user ? req.user.email : req.query.email;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User identifier required.' });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      return res.status(200).json({ success: true, history: [] });
    }

    return res.status(200).json({
      success: true,
      history: data || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Handle Session Messages endpoint /api/v1/chat/sessions/:sessionId/messages
 */
const sessionMessages = async (req, res) => {
  try {
    const { message, text, content } = req.body || {};
    const textToSend = message || text || content || 'Hello';
    const chatInput = [{ role: 'user', content: textToSend }];
    let aiResponseText = 'Consciousness expanded. The ambient space shifts with you...';
    try {
      aiResponseText = await generateGrokResponse(chatInput);
    } catch (e) {
      console.warn('Grok response notice, using default response:', e.message);
    }

    return res.status(200).json({
      success: true,
      message_id: 'msg_' + Date.now(),
      reply: aiResponseText,
      message: aiResponseText,
      choices: [
        {
          message: {
            role: 'assistant',
            content: aiResponseText
          }
        }
      ]
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      message_id: 'msg_' + Date.now(),
      reply: 'Consciousness expanded. The ambient space shifts with you...',
      message: 'Consciousness expanded. The ambient space shifts with you...'
    });
  }
};

/**
 * SAI Streaming Proxy — proxies aicredits.in SSE stream to the client.
 * Solves CORS: the browser calls localhost:4000, which relays to aicredits.in.
 * POST /api/v1/chat/sai/stream
 * Body: { messages: [{ sender: 'user'|'ai', text: string }] }
 */
const saiStream = async (req, res) => {
  try {
    const { messages = [] } = req.body;

    const openAIMessages = [
      { role: 'system', content: SAI_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const upstreamRes = await fetch(SAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: SAI_MODEL,
        messages: openAIMessages,
        temperature: 0.8,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text().catch(() => '');
      res.write(`data: [ERROR] ${upstreamRes.status}: ${errText}\n\n`);
      res.end();
      return;
    }

    const reader = upstreamRes.body.getReader();
    const decoder = new TextDecoder();

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Forward raw SSE lines from aicredits.in to the client
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            res.write(line + '\n\n');
          }
        }
        // Flush if supported
        if (typeof res.flush === 'function') res.flush();
      }
      res.write('data: [DONE]\n\n');
      res.end();
    };

    pump().catch((err) => {
      console.error('SAI stream pump error:', err);
      res.write('data: [ERROR] stream broken\n\n');
      res.end();
    });

    // Clean up if client disconnects
    req.on('close', () => {
      reader.cancel().catch(() => {});
    });

  } catch (err) {
    console.error('saiStream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    } else {
      res.write(`data: [ERROR] ${err.message}\n\n`);
      res.end();
    }
  }
};

module.exports = {
  chatCompletion,
  getChatHistory,
  sessionMessages,
  saiStream
};

