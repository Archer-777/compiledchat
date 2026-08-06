const { generateGrokResponse } = require('../config/grok');
const supabase = require('../config/supabase');

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

module.exports = {
  chatCompletion,
  getChatHistory
};
