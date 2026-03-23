import { useState, useEffect } from 'react';
import Sheet from './Sheet.jsx';
import { askClaude } from '../../utils/api.js';
import { Skeleton } from '../Skeleton.jsx';

export default function CropPredSheet({ location, season, onClose }) {
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prompt =
      `You are an expert Punjab agricultural advisor from PAU (Punjab Agricultural University).\n` +
      `Suggest the TOP 5 most suitable crops for:\n` +
      `- Location: ${location.village}, ${location.district}, ${location.state}\n` +
      `- Current Season: ${season.name} (${new Date().toLocaleString('default', { month: 'long' })})\n\n` +
      `For each crop provide:\n` +
      `✅ Crop name & Punjabi name\n` +
      `📊 Expected yield per acre\n` +
      `📅 Sowing & harvesting dates\n` +
      `💧 Water requirement (low/medium/high)\n` +
      `📈 Market demand in Punjab\n` +
      `💰 Approximate MSP or market price\n\n` +
      `Use emojis, be practical and specific to Punjab conditions.`;

    askClaude(prompt).then((r) => {
      setResult(r);
      setLoading(false);
    });
  }, []);

  return (
    <Sheet title="Crop Prediction" icon="🌱" onClose={onClose}>
      {/* Location context pill */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 12,
          padding: '10px 14px',
          fontSize: 13,
          color: '#166534',
          marginBottom: 14,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span>📍 {location.village}, {location.district}</span>
        <span style={{ opacity: 0.5 }}>•</span>
        <span>{season.emoji} {season.name}</span>
      </div>

      {/* Skeleton while loading */}
      {loading ? (
        <>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
            🤖 AI is analysing your location and season…
          </p>
          <Skeleton height={70} marginTop={0} />
          <Skeleton height={70} />
          <Skeleton height={70} />
          <Skeleton height={70} />
          <Skeleton height={70} />
        </>
      ) : (
        <div className="ai-box">{result}</div>
      )}
    </Sheet>
  );
}
