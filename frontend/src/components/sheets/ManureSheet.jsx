import { useState } from 'react';
import Sheet from './Sheet.jsx';
import { askClaude } from '../../utils/api.js';
import { Skeleton } from '../Skeleton.jsx';

const QUICK_CROPS = ['Wheat', 'Paddy', 'Cotton', 'Mustard', 'Maize', 'Sugarcane'];

export default function ManureSheet({ location, onClose }) {
  const [crop, setCrop]       = useState('');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (cropName) => {
    const name = cropName || crop.trim();
    if (!name) return;
    setCrop(name);
    setLoading(true);
    setResult('');

    const prompt =
      `You are a Punjab agricultural manure and composting expert from PAU.\n` +
      `Provide a detailed manure guide for "${name}" crop in ${location.district}, Punjab:\n\n` +
      `1🌿 Organic vs Chemical manure comparison\n` +
      `2📅 Application schedule (sowing, 30 days, 60 days, flowering)\n` +
      `3⚖️ Quantity per acre (kg or tonnes)\n` +
      `4🏫 PAU-recommended manure practices\n` +
      `5🌱 Soil-specific tips for Punjab's soil types\n` +
      `6♻️ Green manure & bio-fertilizer options\n\n` +
      `Use emojis, be practical and specific.`;

    const r = await askClaude(prompt);
    setResult(r);
    setLoading(false);
  };

  return (
    <Sheet title="Manure Techniques" icon="🌿" onClose={onClose}>

      {/* Quick crop chips */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Quick select:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_CROPS.map((c) => (
            <button
              key={c}
              onClick={() => handleSearch(c)}
              style={{
                background: crop === c ? '#1a6b2f' : '#f0fdf4',
                color: crop === c ? '#fff' : '#1a6b2f',
                border: `1px solid ${crop === c ? '#1a6b2f' : '#bbf7d0'}`,
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                transition: 'all .2s',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Custom input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          className="fm-input"
          placeholder="Or type crop name (e.g. Basmati, Chickpea)…"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          className="btn btn-green btn-sm"
          onClick={() => handleSearch()}
          disabled={loading || !crop.trim()}
        >
          {loading ? <span className="spin-anim">⏳</span> : 'Get Tips'}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <>
          <Skeleton height={60} marginTop={0} />
          <Skeleton height={80} />
          <Skeleton height={60} />
          <Skeleton height={80} />
        </>
      )}

      {result && <div className="ai-box">{result}</div>}

      {!result && !loading && (
        <div
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            padding: '32px 16px',
            fontSize: 14,
          }}
        >
          🌿 Select a crop above or type your own to get<br />tailored manure & composting advice
        </div>
      )}
    </Sheet>
  );
}
