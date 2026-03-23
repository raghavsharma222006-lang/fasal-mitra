import { Router } from 'express';
import Anthropic   from '@anthropic-ai/sdk';
import OpenAI      from 'openai';
import Groq        from 'groq-sdk';
import rateLimit   from 'express-rate-limit';

const router = Router();

// ─── Rate limiter: max 30 AI requests per minute per IP ───────
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please wait a moment.' },
});

// ─── SYSTEM PROMPT ────────────────────────────────────────────
const SYSTEM_PROMPT = 
  'You are Fasal Mitra, an expert AI agricultural advisor specializing in Punjab farming. ' +
  'You give practical, concise advice for farmers. Use emojis and local context where helpful. ' +
  'Support both English and Punjabi queries. Always prioritize safety and PAU guidelines.';

// Lazy-init Anthropic client
let anthropic;
function getAnthropicClient() {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

// Lazy-init OpenAI client (fallback)
let openai;
function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

// Lazy-init Groq client (free tier - no credit card required!)
let groq;
function getGroqClient() {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

// ─── Call Anthropic API ──────────────────────────────────────
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

// ─── Call OpenAI API (fallback) ──────────────────────────────
async function callOpenAI(prompt, imageBase64) {
  const client = getOpenAIClient();
  if (!client) throw new Error('OpenAI not configured');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // OpenAI vision format
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

// ─── Call Groq API (FREE - no credit card required) ──────────
async function callGroq(prompt, imageBase64) {
  const client = getGroqClient();
  if (!client) throw new Error('Groq not configured');

  // Note: Groq doesn't support vision yet, so we append image info to text
  let fullPrompt = prompt;
  if (imageBase64) {
    fullPrompt += '\n\n[Note: An image was provided but Groq free tier does not support image analysis. Please provide general advice based on the description.]';
  }

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',  // Fast and free on Groq
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: fullPrompt },
    ],
  });

  return completion.choices?.[0]?.message?.content ?? 'No response generated.';
}

// ─── Check if error is credit-related ────────────────────────
function isCreditError(err) {
  const msg = err.message || err.error?.message || '';
  return msg.includes('credit balance') || 
         msg.includes('billing') ||
         msg.includes('insufficient_quota');
}

/**
 * POST /api/ai/ask
 * Body: { prompt: string, image?: string (base64 JPEG/PNG) }
 * Returns: { answer: string }
 */
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

    // Try Anthropic first
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

      // Try OpenAI as fallback
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

        // Try Groq as final fallback (FREE - no credit card required!)
        try {
          const groqClient = getGroqClient();
          if (groqClient) {
            console.log('[AI] Trying Groq fallback (free tier)...');
            answer = await callGroq(prompt, image);
            usedProvider = 'groq';
          } else {
            throw new Error('Groq not configured. Get a free API key at https://console.groq.com');
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
    
    // Check if it's a credit error from any provider
    if (isCreditError(err)) {
      return res.status(402).json({ 
        success: false, 
        errorType: 'CREDIT_LOW',
        error: 'AI service temporarily unavailable. All providers have insufficient credits. Get a FREE Groq API key (no credit card) at https://console.groq.com'
      });
    }
    
    // Generic API errors
    if (err?.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    
    next(err);
  }
});

/**
 * GET /api/ai/health
 * Quick health-check — does NOT hit any AI API.
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    providers: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,  // FREE - no credit card required!
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
