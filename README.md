# 🌾 Fasal Mitra – Punjab Crop Advisor
### ਫ਼ਸਲ ਮਿੱਤਰ – AI-Powered Farming App for Punjab

Full-stack AI crop advisory web app for Punjab farmers.

## 🗂 Project Structure
```
fasal-mitra/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/         Page1.jsx  Page2.jsx  Page3.jsx
│   │   ├── components/
│   │   │   └── sheets/    CropPredSheet.jsx  ManureSheet.jsx
│   │   │                  CameraSheet.jsx    FertSheet.jsx
│   │   ├── utils/         api.js  helpers.js
│   │   └── styles/        global.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/           # Node.js + Express
│   ├── routes/        ai.js  weather.js
│   ├── middleware/    cors.js  errorHandler.js
│   ├── index.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit http://localhost:5173

## 🔑 Required .env (backend)
```
ANTHROPIC_API_KEY=your_key_here
PORT=4000
FRONTEND_URL=http://localhost:5173
```

## ✨ Features
- Animated landing page with Punjab farming theme
- Location form (Village / District / State)
- Live weather via Open-Meteo (free, no key needed)
- AI Search Bar (ask anything)
- Crop Prediction, Manure, Disease Finder, Fertilizer Guide
- Camera-based Crop Identifier & Disease Detector
- Amazon.in buy links for fertilizers

## 🛠 Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Node.js, Express
- AI: Anthropic Claude API
- Weather: Open-Meteo
