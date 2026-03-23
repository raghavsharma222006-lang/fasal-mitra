import 'dotenv/config';
import express     from 'express';
import helmet      from 'helmet';
import morgan      from 'morgan';
import rateLimit   from 'express-rate-limit';
import path        from 'path';
import { fileURLToPath } from 'url';

import { corsMiddleware }            from './middleware/cors.js';
import { errorHandler, notFound }    from './middleware/errorHandler.js';
import aiRouter                      from './routes/ai.js';
import weatherRouter                 from './routes/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 4000;

// ─── Security & Logging ───────────────────────────────────────
// Configure Helmet to allow React app to work
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api.open-meteo.com"],
    },
  },
}));
app.use(morgan('dev'));

// ─── Serve Frontend (Static Files) - BEFORE CORS to avoid blocking same-origin ────────────────────────────
// In production, serve the built frontend from ../frontend/dist
const staticPath = path.resolve(__dirname, '../frontend/dist');

// Check if dist folder exists
import { existsSync, statSync } from 'fs';
let hasFrontend = existsSync(staticPath) && statSync(staticPath).isDirectory();

console.log(`[DEBUG] __dirname: ${__dirname}`);
console.log(`[DEBUG] staticPath: ${staticPath}`);
console.log(`[DEBUG] hasFrontend: ${hasFrontend}`);

if (hasFrontend) {
  // Serve static files without CORS (same-origin)
  app.use(express.static(staticPath, { 
    dotfiles: 'ignore'
  }));
  
  // Explicitly serve index.html for root path
  app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
  
  console.log('[DEBUG] Static files served from:', staticPath);
} else {
  console.log('[DEBUG] Frontend dist not found at:', staticPath);
}

// ─── CORS (only for API routes) ─────────────────────────────────────
app.use('/api', corsMiddleware);

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

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/ai',      aiRouter);
app.use('/api/weather', weatherRouter);

// ─── SPA Fallback - Serve index.html for all non-API routes ────────────────────────────
if (hasFrontend) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexPath = path.join(staticPath, 'index.html');
    console.log('[DEBUG] Serving index.html for:', req.path);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('[DEBUG] Error sending index.html:', err);
        next(err);
      }
    });
  });
} else {
  // If no frontend build, show API info
  app.get('/', (req, res) => {
    res.json({
      app: 'Fasal Mitra API 🌾',
      version: '1.0.0',
      status: 'running',
      message: 'Frontend not built. Run "npm run build" in frontend folder.',
      endpoints: {
        ai:      'POST /api/ai/ask',
        weather: 'GET  /api/weather?district=Amritsar',
        health:  'GET  /api/ai/health',
      },
    });
  });
}

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
