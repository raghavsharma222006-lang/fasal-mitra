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

const staticPath = path.resolve(__dirname, '../frontend/dist');
import { existsSync, statSync } from 'fs';
let hasFrontend = existsSync(staticPath) && statSync(staticPath).isDirectory();

if (hasFrontend) {
  app.use(express.static(staticPath, { 
    dotfiles: 'ignore'
  }));
  app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

app.use('/api', corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP. Try again later.' },
});
app.use(globalLimiter);

app.use('/api/ai', aiRouter);
app.use('/api/weather', weatherRouter);

if (hasFrontend) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      app: 'Fasal Mitra API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        ai: 'POST /api/ai/ask',
        weather: 'GET /api/weather?district=Amritsar',
        health: 'GET /api/ai/health',
      },
    });
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
