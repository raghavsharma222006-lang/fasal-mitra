import cors from 'cors';

const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    'http://127.0.0.1:5177',
  ];
  
  if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL);
  if (process.env.RENDER_EXTERNAL_URL) origins.push(process.env.RENDER_EXTERNAL_URL);
  
  return origins;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    if (origin.includes('vercel.app') || origin.includes('netlify.app')) return callback(null, true);
    
    callback(new Error(`CORS: Origin "${origin}" not allowed.`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
