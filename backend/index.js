import 'dotenv/config';
import express     from 'express';
import helmet      from 'helmet';
import morgan      from 'morgan';
import rateLimit   from 'express-rate-limit';

import { corsMiddleware }            from './middleware/cors.js';
import { errorHandler, notFound }    from './middleware/errorHandler.js';
import aiRouter                      from './routes/ai.js';
import weatherRouter                 from './routes/weather.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Logging ───────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ─── CORS ─────────────────────────────────────────────────────
app.use(corsMiddleware);

// ─── Body parsing ─────────────────────────────────────────────
// 10 MB limit to handle base64-encoded images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Global rate limiter ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP. Try again later.' },
});
app.use(globalLimiter);

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'Fasal Mitra API 🌾',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      ai:      'POST /api/ai/ask',
      weather: 'GET  /api/weather?district=Amritsar',
      health:  'GET  /api/ai/health',
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/ai',      aiRouter);
app.use('/api/weather', weatherRouter);

// ─── 404 & Error handling ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🌾  Fasal Mitra Backend');
  console.log(`📡  Listening on http://localhost:${PORT}`);
  console.log(`🔑  API key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
  console.log(`🌐  Allowed origin:     ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('─────────────────────────────────\n');
});

export default app;
