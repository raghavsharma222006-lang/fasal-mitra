import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please wait a moment.' },
});

const SYSTEM_PROMPT = 
  'You are Fasal Mitra, an expert AI agricultural advisor specializing in Punjab farming. ' +
  'You give practical, concise advice for farmers. Use emojis and local context where helpful. ' +
  'Support both English and Punjabi queries. Always prioritize safety and PAU guidelines.';

let anthropic;
function getAnthropicClient() {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

let openai;
function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

let groq;
function getGroqClient() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

async function callAnthropic(prompt, imageBase64) {
  const client = getAnthropicClient();
  if (!client) throw new Error('Anthropic not configured');

  const content = [];
  if (imageBase64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
    });
  }
  content.push({ type: 'text', text: prompt });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  return message.content?.[0]?.text ?? 'No response generated.';
}

async function callOpenAI(prompt, imageBase64) {
  const client = getOpenAIClient();
  if (!client) throw new Error('OpenAI not configured');

  const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

  if (imageBase64) {
    messages.push({
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        { type: 'text', text: prompt },
      ],
    });
  } else {
    messages.push({ role: 'user', content: prompt });
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages,
  });

  return completion.choices?.[0]?.message?.content ?? 'No response generated.';
}

async function callGroq(prompt, imageBase64) {
  const client = getGroqClient();
  if (!client) throw new Error('Groq not configured');

  let fullPrompt = prompt;
  if (imageBase64) {
    fullPrompt += '\n\n[Note: An image was provided but Groq free tier does not support image analysis. Please provide general advice based on the description.]';
  }

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: fullPrompt },
    ],
  });

  return completion.choices?.[0]?.message?.content ?? 'No response generated.';
}

function isCreditError(err) {
  const msg = err.message || err.error?.message || '';
  return msg.includes('credit balance') || 
         msg.includes('billing') ||
         msg.includes('insufficient_quota');
}

router.post('/ask', aiLimiter, async (req, res, next) => {
  try {
    const { prompt, image } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'prompt is required.' });
    }
    if (prompt.length > 4000) {
      return res.status(400).json({ success: false, error: 'prompt too long (max 4000 chars).' });
    }
    if (image && typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'image must be a base64 string.' });
    }

    let answer;
    let usedProvider = 'anthropic';
    const errors = [];

    try {
      const anthropicClient = getAnthropicClient();
      if (anthropicClient) {
        answer = await callAnthropic(prompt, image);
      } else {
        throw new Error('Anthropic not configured');
      }
    } catch (anthropicErr) {
      errors.push({ provider: 'anthropic', error: anthropicErr.message });
      console.log('[AI] Anthropic failed:', anthropicErr.message);

      try {
        const openaiClient = getOpenAIClient();
        if (openaiClient) {
          console.log('[AI] Trying OpenAI fallback...');
          answer = await callOpenAI(prompt, image);
          usedProvider = 'openai';
        } else {
          throw new Error('OpenAI not configured');
        }
      } catch (openaiErr) {
        errors.push({ provider: 'openai', error: openaiErr.message });
        console.log('[AI] OpenAI failed:', openaiErr.message);

        try {
          const groqClient = getGroqClient();
          if (groqClient) {
            console.log('[AI] Trying Groq fallback...');
            answer = await callGroq(prompt, image);
            usedProvider = 'groq';
          } else {
            throw new Error('Groq not configured');
          }
        } catch (groqErr) {
          errors.push({ provider: 'groq', error: groqErr.message });
          throw groqErr;
        }
      }
    }

    res.json({ 
      success: true, 
      answer,
      provider: usedProvider,
      ...(usedProvider !== 'anthropic' && { usedFallback: true })
    });

  } catch (err) {
    console.error('[AI] All providers failed:', err.message);
    
    if (isCreditError(err)) {
      return res.status(402).json({ 
        success: false, 
        errorType: 'CREDIT_LOW',
        error: 'AI service temporarily unavailable. All providers have insufficient credits.'
      });
    }
    
    if (err?.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    
    next(err);
  }
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    providers: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
