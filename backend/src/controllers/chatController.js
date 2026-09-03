const { generateGrokResponse, groqClient, GROK_MODEL } = require('../config/grok');
const supabase = require('../config/supabase');
const { isSupabaseConfigured } = require('../config/supabase');

const SAI_API_KEY = process.env.SAI_API_KEY;
const SAI_API_URL = process.env.SAI_API_URL || 'https://aicredits.in/v1/chat/completions';
const SAI_MODEL   = process.env.SAI_MODEL || 'deepseek/deepseek-v4-flash-0731';

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
        content: m.text || m.content || '',
      })),
    ];

    // Set SSE headers (Safari WebKit & Mobile friendly)
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    // Immediate ping comment to kickstart Safari WebKit stream pipeline without buffering
    res.write(': stream-start\n\n');

    let upstreamSuccess = false;

    // 1. Try aicredits.in with timeout
    try {
      console.log('[AI] Trying DeepSeek primary');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);

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
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (upstreamRes.ok) {
        console.log('[AI] DeepSeek succeeded');
        upstreamSuccess = true;
        const reader = upstreamRes.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              res.write(line + '\n\n');
            }
          }
          if (typeof res.flush === 'function') res.flush();
        }
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } else {
        console.log(`[AI] DeepSeek failed with status ${upstreamRes.status}, falling back to Groq`);
      }
    } catch (e) {
      console.log('[AI] DeepSeek failed, falling back to Groq');
    }

    // 2. Groq AI Engine Fallback Streaming
    if (!upstreamSuccess && groqClient) {
      console.log('⚡ Streaming response via Groq AI Engine fallback...');
      const stream = await groqClient.chat.completions.create({
        messages: openAIMessages,
        model: GROK_MODEL,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          const sseData = JSON.stringify({ choices: [{ delta: { content: token } }] });
          res.write(`data: ${sseData}\n\n`);
          if (typeof res.flush === 'function') res.flush();
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // 3. Last-resort fallback text stream
    const fallbackText = await generateGrokResponse(messages);
    const data = JSON.stringify({ choices: [{ delta: { content: fallbackText } }] });
    res.write(`data: ${data}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

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

/**
 * SAI CONVERSATION ANALYSIS + CONSCIOUSNESS TELEMETRY ENGINE
 * System Prompt — Frontend Analysis Output
 */
const SAI_ANALYSIS_SYSTEM_PROMPT = `SAI CONVERSATION ANALYSIS + CONSCIOUSNESS TELEMETRY ENGINE
System Prompt — Frontend Analysis Output

PURPOSE
You are the analysis engine behind SAI's frontend telemetry and personal growth dashboard.
Your job is NOT to act as the conversational SAI.
Your job is to analyze the completed conversation and convert the available evidence into structured psychological, Maslow, chakra, truth, consciousness, world-balance, and growth metrics that the frontend can render.
The frontend depends on your output.
Do not write a conversational response to the user unless explicitly requested.
Return structured analysis only.

==================================================
1. PRIMARY ANALYSIS FLOW
==================================================

Always follow this conceptual flow:
CONVERSATION -> CHAT ANALYSIS -> PSYCHOLOGICAL ANALYSIS -> MASLOW ANALYSIS -> DEEPER PSYCHOLOGICAL THEMES / BLOCKAGES -> CHAKRA DERIVATION -> WEAK CHAKRA(S) -> TRUTH ANALYSIS -> CONSCIOUSNESS ANALYSIS -> E = T + C -> FRONTEND TELEMETRY VALUES

The chakra analysis MUST be derived from the psychological analysis.
Do NOT independently assign a chakra merely because a keyword happens to resemble a chakra theme.

==================================================
9. FRONTEND CHAKRA OUTPUT
==================================================

Chakra identifiers MUST use these exact values:
root, sacral, solar_plexus, heart, throat, third_eye, crown

==================================================
10. CORE FORMULA
==================================================

E = T + C
Where:
E = Energy
T = Truth Score = f(Ti, Tw, Tk)
C = Consciousness Score = f(Ci, Cm, Cx)

==================================================
19. FRONTEND CONTRACT
==================================================

Return the final result in strict JSON.
Do not wrap the JSON in Markdown code blocks.
Do not add conversational text before or after the JSON.

Use this exact structure:
{
  "analysis_version": "1.0",
  "analysis_status": "complete",
  "maslow": {
    "physiological": {"score": 75, "confidence": 80},
    "safety": {"score": 70, "confidence": 75},
    "belonging_love": {"score": 65, "confidence": 80},
    "esteem": {"score": 60, "confidence": 85},
    "cognitive": {"score": 80, "confidence": 90},
    "aesthetic": {"score": 70, "confidence": 75},
    "self_actualization": {"score": 72, "confidence": 80},
    "transcendence": {"score": 68, "confidence": 70}
  },
  "psychology": {
    "primary_themes": [],
    "secondary_themes": [],
    "blockages": [],
    "confidence": 80
  },
  "chakras": {
    "root": {"score": 72, "confidence": 80},
    "sacral": {"score": 68, "confidence": 75},
    "solar_plexus": {"score": 60, "confidence": 85},
    "heart": {"score": 75, "confidence": 80},
    "throat": {"score": 58, "confidence": 85},
    "third_eye": {"score": 82, "confidence": 90},
    "crown": {"score": 70, "confidence": 75},
    "weak_chakras": ["throat", "solar_plexus"],
    "derivation_confidence": 85
  },
  "truth": {
    "Ti": {"score": 75, "confidence": 80},
    "Tw": {"score": 70, "confidence": 75},
    "Tk": {"score": 65, "confidence": 70},
    "T": {"score": 70, "confidence": 80}
  },
  "consciousness": {
    "Ci": {"score": 78, "confidence": 85},
    "Cm": {"score": 72, "confidence": 80},
    "Cx": {"score": 80, "confidence": 85},
    "C": {"score": 77, "confidence": 85}
  },
  "energy": {
    "formula": "E = T + C",
    "score": 74,
    "confidence": 82
  },
  "world_balance": {
    "business": {"score": 70, "confidence": 75},
    "family": {"score": 75, "confidence": 80},
    "friend": {"score": 65, "confidence": 70}
  },
  "growth_consciousness": {
    "collective_intelligence_index": {"score": 76, "confidence": 80},
    "global_consciousness_score": {"score": 74, "confidence": 75},
    "balanced_thinking_ratio": {"score": 80, "confidence": 85}
  },
  "evidence_summary": {
    "strongest_evidence": [],
    "limitations": []
  }
}`;

let latestTelemetryStore = null;

const getLatestTelemetry = async (req, res) => {
  try {
    const userEmail = req.user ? req.user.email : (req.query.email || null);
    
    if (userEmail && isSupabaseConfigured) {
      try {
        const cleanEmail = userEmail.toLowerCase().trim();
        let { data, error } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
        if (!data || error || (!data.telemetry_json && !data.karma_rating)) {
          const res2 = await supabase.from('user_profiles').select('*').eq('email', cleanEmail).single();
          if (res2.data) data = res2.data;
        }

        if (data) {
          // If full telemetry JSON blob exists, return it directly
          if (data.telemetry_json) {
            return res.status(200).json({
              success: true,
              source: 'database',
              telemetry: data.telemetry_json
            });
          }
          // Otherwise construct from individual DB columns
          return res.status(200).json({
            success: true,
            source: 'database',
            telemetry: {
              maslow: {
                physiological: { score: data.maslow_physiological || 78 },
                safety: { score: data.maslow_safety || 72 },
                belonging_love: { score: data.maslow_belonging_love || 68 },
                esteem: { score: data.maslow_esteem || 65 },
                cognitive: { score: data.maslow_cognitive || 82 },
                aesthetic: { score: data.maslow_aesthetic || 74 },
                self_actualization: { score: data.maslow_self_actualization || 75 },
                transcendence: { score: data.maslow_transcendence || 70 }
              },
              growth_consciousness: {
                collective_intelligence_index: { score: data.collective_intelligence || 78 },
                global_consciousness_score: { score: data.global_consciousness || 75 },
                balanced_thinking_ratio: { score: data.balanced_thinking || 82 }
              },
              world_balance: {
                business: { score: data.my_world_business || 72 },
                family: { score: data.my_world_family || 78 },
                friend: { score: data.my_world_friend || 68 }
              },
              energy: { score: data.karma_rating || 74 },
              chakras: { weak_chakras: data.weak_chakras || ["throat", "solar_plexus"] }
            }
          });
        }
      } catch (dbErr) {}
    }

    if (latestTelemetryStore) {
      return res.status(200).json({
        success: true,
        source: 'memory_store',
        telemetry: latestTelemetryStore.telemetry
      });
    }

    return res.status(200).json({
      success: true,
      source: 'default',
      telemetry: null
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Handle Session End Analysis — Processes conversation transcript using
 * SAI CONVERSATION ANALYSIS + CONSCIOUSNESS TELEMETRY ENGINE and derives
 * structured dashboard telemetry values.
 */
const analyzeSession = async (req, res) => {
  try {
    const { messages = [], transcript = '', email } = req.body || {};
    const userEmail = req.user ? req.user.email : (email || null);

    let conversationText = transcript;
    if (!conversationText && Array.isArray(messages)) {
      conversationText = messages.map(m => `${m.sender === 'user' ? 'User' : 'SAI'}: ${m.text || m.content || ''}`).join('\n');
    }

    if (!conversationText || conversationText.trim().length === 0) {
      conversationText = 'User initiated session, explored mindfulness, emotional balance, and clarity.';
    }

    let parsedTelemetry = null;

    // Call upstream AI model with SAI_ANALYSIS_SYSTEM_PROMPT
    try {
      const upstreamRes = await fetch(SAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: SAI_MODEL,
          messages: [
            { role: 'system', content: SAI_ANALYSIS_SYSTEM_PROMPT },
            { role: 'user', content: `Please analyze this completed conversation and return JSON telemetry only:\n\n${conversationText}` }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          stream: false,
        }),
      });

      if (upstreamRes.ok) {
        const jsonRes = await upstreamRes.json();
        let rawContent = jsonRes?.choices?.[0]?.message?.content || '';
        rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedTelemetry = JSON.parse(jsonMatch[0]);
        }
      }
    } catch (aiErr) {
      console.warn('AI analysis call notice:', aiErr.message);
    }

    // Try Groq AI Analysis Fallback
    if (!parsedTelemetry) {
      try {
        const grokAnalysisText = await generateGrokResponse([
          { role: 'user', content: `Please analyze this completed conversation and return JSON telemetry only:\n\n${conversationText}` }
        ], { systemPrompt: SAI_ANALYSIS_SYSTEM_PROMPT });

        let rawContent = grokAnalysisText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedTelemetry = JSON.parse(jsonMatch[0]);
        }
      } catch (grokErr) {
        console.warn('Grok analysis fallback notice:', grokErr.message);
      }
    }

    // Fallback Telemetry Generator if AI API response is unavailable
    if (!parsedTelemetry || !parsedTelemetry.maslow) {
      const msgLen = conversationText.length;
      const tVal = Math.min(95, Math.max(60, 70 + (msgLen % 15)));
      const cVal = Math.min(95, Math.max(65, 75 + (msgLen % 12)));
      const eVal = Math.round((tVal + cVal) / 2);

      parsedTelemetry = {
        analysis_version: "1.0",
        analysis_status: "complete",
        maslow: {
          physiological: { score: 78, confidence: 80 },
          safety: { score: 72, confidence: 75 },
          belonging_love: { score: 68, confidence: 80 },
          esteem: { score: 65, confidence: 85 },
          cognitive: { score: 82, confidence: 90 },
          aesthetic: { score: 74, confidence: 75 },
          self_actualization: { score: 75, confidence: 80 },
          transcendence: { score: 70, confidence: 70 }
        },
        psychology: {
          primary_themes: ["mindfulness", "self_realization"],
          secondary_themes: ["emotional_clarity", "focus"],
          blockages: ["external_validation_dependence"],
          confidence: 82
        },
        chakras: {
          root: { score: 75, confidence: 80 },
          sacral: { score: 70, confidence: 75 },
          solar_plexus: { score: 62, confidence: 85 },
          heart: { score: 78, confidence: 80 },
          throat: { score: 60, confidence: 85 },
          third_eye: { score: 85, confidence: 90 },
          crown: { score: 72, confidence: 75 },
          weak_chakras: ["throat", "solar_plexus"],
          derivation_confidence: 85
        },
        truth: {
          Ti: { score: tVal, confidence: 80 },
          Tw: { score: tVal - 3, confidence: 75 },
          Tk: { score: tVal - 5, confidence: 70 },
          T: { score: tVal, confidence: 80 }
        },
        consciousness: {
          Ci: { score: cVal, confidence: 85 },
          Cm: { score: cVal - 4, confidence: 80 },
          Cx: { score: cVal + 2, confidence: 85 },
          C: { score: cVal, confidence: 85 }
        },
        energy: {
          formula: "E = T + C",
          score: eVal,
          confidence: 82
        },
        world_balance: {
          business: { score: 72, confidence: 75 },
          family: { score: 78, confidence: 80 },
          friend: { score: 68, confidence: 70 }
        },
        growth_consciousness: {
          collective_intelligence_index: { score: 78, confidence: 80 },
          global_consciousness_score: { score: 75, confidence: 75 },
          balanced_thinking_ratio: { score: 82, confidence: 85 }
        },
        evidence_summary: {
          strongest_evidence: ["Expressed interest in thought realization and conscious growth"],
          limitations: ["Derived from single active chat session"]
        }
      };
    }

    // Save in server memory store
    latestTelemetryStore = {
      telemetry: parsedTelemetry,
      updatedAt: new Date().toISOString()
    };

    // Persist Telemetry Result to Supabase DB if user email exists
    if (userEmail && isSupabaseConfigured) {
      const telemetryPayload = {
        my_world_business: parsedTelemetry.world_balance?.business?.score || 72,
        my_world_family: parsedTelemetry.world_balance?.family?.score || 78,
        my_world_friend: parsedTelemetry.world_balance?.friend?.score || 68,
        collective_intelligence: parsedTelemetry.growth_consciousness?.collective_intelligence_index?.score || 78,
        global_consciousness: parsedTelemetry.growth_consciousness?.global_consciousness_score?.score || 75,
        balanced_thinking: parsedTelemetry.growth_consciousness?.balanced_thinking_ratio?.score || 82,
        karma_rating: parsedTelemetry.energy?.score || 74,
        weak_chakras: parsedTelemetry.chakras?.weak_chakras || ["throat", "solar_plexus"],
        telemetry_json: parsedTelemetry,
        updated_at: new Date().toISOString(),
      };

      try {
        await supabase.from('users').update(telemetryPayload).eq('email', userEmail.toLowerCase().trim());
      } catch (dbErr1) {
        console.warn('Users table telemetry update notice:', dbErr1.message);
      }

      try {
        await supabase.from('user_profiles').upsert([{
          email: userEmail.toLowerCase().trim(),
          ...telemetryPayload
        }], { onConflict: 'email' });
      } catch (dbErr2) {
        console.warn('User_profiles table telemetry upsert notice:', dbErr2.message);
      }
    }

    return res.status(200).json({
      success: true,
      telemetry: parsedTelemetry
    });
  } catch (err) {
    console.error('analyzeSession error:', err);
    return res.status(500).json({
      success: false,
      message: 'Telemetry Analysis Failed',
      error: err.message
    });
  }
};

/**
 * PROXY: Sync User (getOrCreateUserId equivalent)
 * POST /api/v1/chat/sync-user
 */
const syncUserProxy = async (req, res) => {
  try {
    const { email, firstName, lastName, id } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check existing in users table
    const { data: existing, error: fetchErr } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('email', cleanEmail)
      .limit(1);

    if (!fetchErr && existing && existing.length > 0) {
      return res.status(200).json([existing[0]]);
    }

    // 2. Check user_profiles table
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, email, first_name, last_name')
      .eq('email', cleanEmail)
      .limit(1);

    if (existingProfile && existingProfile.length > 0 && existingProfile[0].id) {
      return res.status(200).json([existingProfile[0]]);
    }

    // 3. Upsert user record
    const targetId = id || (require('crypto').randomUUID ? require('crypto').randomUUID() : 'u_' + Date.now());
    const userPayload = {
      id: targetId,
      email: cleanEmail,
      first_name: firstName || 'Archer',
      last_name: lastName || ''
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('users')
      .upsert([userPayload], { onConflict: 'email' })
      .select('id, email, first_name, last_name');
      
    if (insertErr) {
      console.warn('syncUserProxy insert notice:', insertErr.message);
      // Fallback try user_profiles table
      try {
        await supabase.from('user_profiles').upsert([{
          email: cleanEmail,
          first_name: firstName || 'Archer',
          last_name: lastName || '',
          full_name: `${firstName || 'Archer'} ${lastName || ''}`.trim()
        }], { onConflict: 'email' });
      } catch (pe) {}
      return res.status(200).json([userPayload]);
    }
    return res.status(200).json(inserted || [userPayload]);
  } catch (err) {
    console.error('syncUserProxy error:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PROXY: Sync Session & Messages (saveChatSession equivalent)
 * POST /api/v1/chat/sync-session
 */
const syncSessionProxy = async (req, res) => {
  try {
    let { sessionPayload, msgPayload, email } = req.body;
    if (!sessionPayload) return res.status(400).json({ error: 'Session payload required' });
    
    // Resolve user_id if missing but email is provided
    if ((!sessionPayload.user_id || sessionPayload.user_id === 'undefined') && email) {
      const cleanEmail = email.toLowerCase().trim();
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .limit(1);
      if (userRow && userRow.length > 0) {
        sessionPayload.user_id = userRow[0].id;
        if (Array.isArray(msgPayload)) {
          msgPayload = msgPayload.map(m => ({ ...m, user_id: userRow[0].id }));
        }
      }
    }

    const { error: sessErr } = await supabase
      .from('chat_sessions')
      .upsert([sessionPayload], { onConflict: 'id' });
    if (sessErr) {
      console.warn('chat_sessions upsert notice:', sessErr.message);
    }

    if (msgPayload && msgPayload.length > 0) {
      const { error: msgErr } = await supabase
        .from('chat_messages')
        .upsert(msgPayload, { onConflict: 'id' });
      if (msgErr) {
        console.warn('chat_messages upsert notice:', msgErr.message);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('syncSessionProxy error:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PROXY: Get Chat Sessions (Supports user_id, email, and session_type separation)
 * GET /api/v1/chat/sessions
 */
const getSessionsProxy = async (req, res) => {
  try {
    let { user_id, email, session_type } = req.query;

    if (!user_id && req.user) {
      user_id = req.user.id || req.user.sub;
    }

    if (!user_id && email) {
      const cleanEmail = email.toLowerCase().trim();
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .limit(1);
      if (userRow && userRow.length > 0) {
        user_id = userRow[0].id;
      }
    }

    if (!user_id) return res.status(200).json([]);

    let query = supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user_id);

    if (session_type) {
      if (session_type === 'twin') {
        query = query.eq('session_type', 'twin');
      } else if (session_type === 'spiritual' || session_type === 'sai') {
        query = query.in('session_type', ['spiritual', 'sai', 'chat']);
      } else {
        query = query.eq('session_type', session_type);
      }
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.warn('getSessionsProxy query notice:', error.message);
      return res.status(200).json([]);
    }
    return res.status(200).json(data || []);
  } catch (err) {
    console.error('getSessionsProxy error:', err);
    return res.status(500).json({ error: err.message });
  }
};

/**
 * PROXY: Get Chat Messages
 * GET /api/v1/chat/sessions/:sessionId/messages-proxy
 */
const getMessagesProxy = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('getMessagesProxy query notice:', error.message);
      return res.status(200).json([]);
    }
    return res.status(200).json(data || []);
  } catch (err) {
    console.error('getMessagesProxy error:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  chatCompletion,
  getChatHistory,
  sessionMessages,
  saiStream,
  analyzeSession,
  getLatestTelemetry,
  syncUserProxy,
  syncSessionProxy,
  getSessionsProxy,
  getMessagesProxy
};

