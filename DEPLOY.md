# Deploy Fasal Mitra to Render

## Quick Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fasal-mitra.git
git push -u origin main
```

### 2. Deploy on Render

#### Backend Service:
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: fasal-mitra-backend
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `ANTHROPIC_API_KEY`: your_anthropic_key (optional)
   - `GROQ_API_KEY`: your_groq_key (**required for free AI**)
   - `OPENAI_API_KEY`: your_openai_key (optional)
   - `FRONTEND_URL`: https://fasal-mitra-frontend.onrender.com
6. Click "Create Web Service"

#### Frontend Service:
1. Click "New +" → "Static Site"
2. Connect same GitHub repo
3. Configure:
   - **Name**: fasal-mitra-frontend
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. Add Environment Variable:
   - `VITE_BACKEND_URL`: https://fasal-mitra-backend.onrender.com
5. Click "Create Static Site"

### 3. Update Backend CORS
After frontend deploys, copy the frontend URL and update backend environment variable:
- `FRONTEND_URL`: https://your-frontend-url.onrender.com

## Free AI with Groq

Get your **FREE** Groq API key (no credit card required):
1. Go to https://console.groq.com
2. Sign up with email
3. Create API key
4. Add to backend environment variables

## Live URLs

After deployment, your app will be at:
- **Frontend**: https://fasal-mitra-frontend.onrender.com
- **Backend API**: https://fasal-mitra-backend.onrender.com

## Features

- AI crop advisory for Punjab farmers
- Weather integration (Open-Meteo)
- Camera-based crop/disease detection
- Fertilizer guide with Amazon links
- Works on mobile and desktop
- **Free AI using Groq fallback**
