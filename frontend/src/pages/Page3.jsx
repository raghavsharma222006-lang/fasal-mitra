import { useState, useEffect } from 'react';
import { getSeason, decodeWeatherCode } from '../utils/helpers.js';
import { Skeleton } from '../components/Skeleton.jsx';
import { askClaude, fetchWeather } from '../utils/api.js';
import CropPredSheet from '../components/sheets/CropPredSheet.jsx';
import ManureSheet   from '../components/sheets/ManureSheet.jsx';
import CameraSheet   from '../components/sheets/CameraSheet.jsx';
import FertSheet     from '../components/sheets/FertSheet.jsx';

const FEATURES = [
  {
    key: 'crop',
    icon: '🌱',
    title: 'Crop Prediction',
    desc: 'AI suggests best crops for your area & season',
  },
  {
    key: 'manure',
    icon: '🌿',
    title: 'Manure Techniques',
    desc: 'Smart fertilization & composting guide',
  },
  {
    key: 'cam',
    icon: '📷',
    title: 'Crop Identifier',
    desc: 'Snap a photo — AI identifies crop & planting guide',
  },
  {
    key: 'disease',
    icon: '🦠',
    title: 'Disease Finder',
    desc: 'Camera-based AI diagnosis of crop diseases',
  },
  {
    key: 'fert',
    icon: '🧪',
    title: 'Fertilizer Guide',
    desc: 'Full fertilizer info + Amazon.in buy link',
  },
];

export default function Page3({ location, onBack }) {
  const [weather, setWeather]     = useState(null);
  const [wLoading, setWLoading]   = useState(true);
  const [query, setQuery]         = useState('');
  const [aiAnswer, setAiAnswer]   = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [modal, setModal]         = useState(null); // key of open feature

  const season = getSeason();

  useEffect(() => {
    fetchWeather(location.district)
      .then((w) => { setWeather(w); setWLoading(false); })
      .catch(() => setWLoading(false));
  }, [location.district]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    const answer = await askClaude(
      `You are Fasal Mitra, an expert Punjab farming AI assistant. ` +
      `Answer concisely for a farmer in ${location.village}, ${location.district}, ${location.state}. ` +
      `Be practical and use emojis. Answer in 4-6 sentences.\n\nQuestion: ${query}`
    );
    setAiAnswer(answer);
    setAiLoading(false);
  };

  const wi = weather ? decodeWeatherCode(weather.weather_code) : null;

  const cropCamPrompt =
    `You are a botanist and Punjab farming expert. Analyze this crop/plant image and provide:\n` +
    `1🌾 Crop/plant name\n` +
    `2📅 Cropping season in Punjab\n` +
    `3🌱 Step-by-step planting guide (5 steps)\n` +
    `4📍 Best districts in Punjab for this crop\n` +
    `5⏰ Expected growth timeline\n` +
    `Use emojis and be practical for Punjab farmers.`;

  const diseaseCamPrompt =
    `You are a plant pathologist for Punjab crops. Analyze this diseased crop image:\n` +
    `1🦠 Disease name\n` +
    `2🌾 Affected crop type\n` +
    `3⚠️ Main causes & visible symptoms\n` +
    `4💊 Treatment methods & prevention\n` +
    `5🚦 Urgency level: 🟢 Low | 🟡 Moderate | 🔴 Critical\n` +
    `Be specific, practical, use emojis.`;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f7f3' }}>

      <div className="top-bar">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 10,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <h1 style={{ color: '#fff', fontSize: 19, fontWeight: 800, letterSpacing: '-0.5px' }}>
                🌾 Fasal Mitra
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>
                📍 {location.village}, {location.district}, {location.state}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span className="season-pill">{season.emoji} {season.name}</span>
              <button className="back-btn" onClick={onBack}>← Change Location</button>
            </div>
          </div>

          <div className="search-wrap">
            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              🤖 Ask AI Anything About Farming
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="fm-input"
                placeholder="e.g. When to sow wheat? Best fertilizer for paddy?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                style={{ flex: 1, fontSize: 13, padding: '10px 14px' }}
              />
              <button
                className="btn btn-green btn-sm"
                onClick={handleAsk}
                disabled={aiLoading}
              >
                {aiLoading ? <span className="spin-anim">🔍</span> : 'Ask'}
              </button>
            </div>
            {aiLoading && <Skeleton height={55} marginTop={10} />}
            {aiAnswer && (
              <div className="ai-box" style={{ marginTop: 10, fontSize: 13 }}>
                {aiAnswer}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 14px 60px' }}>

        <div className="weather-card fade-up" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>Live Weather</p>
              <p style={{ fontSize: 15, fontWeight: 700 }}>{location.district}, {location.state}</p>
              {wLoading
                ? <Skeleton height={32} marginTop={6} />
                : weather && (
                  <p style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                    {Math.round(weather.temperature_2m)}°C{' '}
                    <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.8 }}>{wi?.description}</span>
                  </p>
                )
              }
            </div>
            <div style={{ fontSize: 52 }}>{wLoading ? '⏳' : wi?.emoji}</div>
          </div>

          {weather && (
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, opacity: 0.85 }}>
                💧 {weather.relative_humidity_2m}% Humidity
              </span>
              <span style={{ fontSize: 12, opacity: 0.85 }}>
                💨 {weather.wind_speed_10m} km/h Wind
              </span>
            </div>
          )}

          <div
            style={{
              marginTop: 12,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <p style={{ fontSize: 12 }}>
              {season.emoji} <strong>{season.name}</strong> — Ideal crops:{' '}
              <em>{season.crops}</em>
            </p>
          </div>
        </div>

        <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>
          🛠️ Smart Farming Tools
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 12,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.key}
              className="fm-card fm-card-hover fade-up"
              onClick={() => setModal(f.key)}
              style={{
                padding: '22px 16px',
                textAlign: 'center',
                gridColumn: i === 4 ? 'span 2' : undefined,
                animationDelay: `${i * 0.09}s`,
              }}
            >
              <div style={{ fontSize: 42, marginBottom: 8 }}>{f.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                {f.title}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div
          className="fade-up"
          style={{
            marginTop: 14,
            background: `linear-gradient(135deg,${season.bgColor},#fef9c3)`,
            borderRadius: 18,
            padding: '16px 18px',
            border: '1px solid #fcd34d',
            animationDelay: '0.5s',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: season.textColor, marginBottom: 6 }}>
            💡 Season Advisory for {location.district}
          </p>
          <p style={{ fontSize: 13, color: season.textColor, lineHeight: 1.7 }}>
            It's <strong>{season.name}</strong> ({season.punjabi}). Your district{' '}
            <strong>{location.district}</strong> is best suited for{' '}
            <strong>{season.crops}</strong> right now. Use{' '}
            <em>Crop Prediction</em> below for AI-personalised recommendations.
          </p>
        </div>

        <div
          className="fm-card fade-up"
          style={{ marginTop: 14, padding: '16px 18px', animationDelay: '0.6s' }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>
            ℹ️ About Fasal Mitra
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              'AI Crop Advice', 'Disease Detection', 'Camera Analysis',
              'Weather-Aware', 'PAU Guidelines', 'Amazon Buy Links',
              'Punjabi Support', 'Fertilizer Guide', 'Season Detection',
            ].map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {modal === 'crop' && <CropPredSheet location={location} season={season} onClose={() => setModal(null)} />}
      {modal === 'manure'  && <ManureSheet   location={location} onClose={() => setModal(null)} />}
      {modal === 'cam'     && (
        <CameraSheet
          title="Crop Identifier"
          icon="📷"
          prompt={cropCamPrompt}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'disease' && (
        <CameraSheet
          title="Disease Finder"
          icon="🦠"
          prompt={diseaseCamPrompt}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'fert'    && <FertSheet onClose={() => setModal(null)} />}
    </div>
  );
}
