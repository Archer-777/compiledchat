const Groq = require('groq-sdk');
require('dotenv').config();

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_MODEL = process.env.GROK_MODEL || 'llama-3.3-70b-versatile';

let groqClient = null;

try {
  if (GROK_API_KEY) {
    groqClient = new Groq({ apiKey: GROK_API_KEY });
  }
} catch (e) {
  console.warn('⚠️ Grok AI SDK Initialization notice:', e.message);
}

/**
 * Generate AI Chat Response using Grok API Key
 */
const generateGrokResponse = async (messages, options = {}) => {
  if (!groqClient) {
    throw new Error('Grok API Key not configured on backend.');
  }

  const systemPrompt = {
    role: 'system',
    content: 'You are Spiritualize AI — an empathetic, elevated consciousness AI companion for Next Archer. Provide inspiring, concise, and deep reflections.'
  };

  const formattedMessages = [
    systemPrompt,
    ...messages.map(m => ({
      role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
      content: m.content || m.text || ''
    }))
  ];

  const completion = await groqClient.chat.completions.create({
    messages: formattedMessages,
    model: options.model || GROK_MODEL,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1024
  });

  return completion.choices[0]?.message?.content || 'Consciousness expanded. The ambient space shifts with you...';
};

module.exports = {
  groqClient,
  generateGrokResponse,
  GROK_MODEL
};
