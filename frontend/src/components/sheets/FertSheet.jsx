import { useState } from 'react';
import Sheet from './Sheet.jsx';
import { askClaude } from '../../utils/api.js';
import { Skeleton } from '../Skeleton.jsx';

const POPULAR = [
  { name: 'Urea',  emoji: '🟡' },
  { name: 'DAP',   emoji: '🔵' },
  { name: 'MOP',   emoji: '🟤' },
  { name: 'SSP',   emoji: '⚪' },
  { name: 'ZnSO4', emoji: '🟣' },
  { name: 'NPK',   emoji: '🟢' },
];

export default function FertSheet({ onClose }) {
  const [query, setQuery]     = useState('');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState('');

  const handleSearch = async (fertName) => {
    const name = fertName || query.trim();
    if (!name) return;
    setQuery(name);
    setLoading(true);
    setResult('');
    setSearched(name);

    const prompt =
      `You are a fertilizer expert for Indian Punjab agriculture.\n` +
      `Provide detailed information about "${name}" fertilizer:\n\n` +
      `1🧪 Full chemical name & composition\n` +
      `2📊 NPK ratio breakdown\n` +
      `3📅 When & how to apply (timing, method)\n` +
      `4⚖️ Recommended dosage per acre for major Punjab crops\n` +
      `5⚠️ Precautions, overdose risks & side effects\n` +
      `6🌱 Organic farming compatibility\n` +
      `7🌾 Best suited crops in Punjab\n` +
      `8💰 Approximate price per bag in India\n\n` +
      `Use emojis, be practical and specific for Punjab farmers.`;

    const r = await askClaude(prompt);
    setResult(r);
    setLoading(false);
  };

  const amazonLink = searched
    ? `https://www.amazon.in/s?k=${encodeURIComponent(searched + ' fertilizer India')}`
    : '';

  return (
    <Sheet title="Fertilizer Guide" icon="🧪" onClose={onClose}>

      {/* Popular fertilizer chips */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Popular fertilizers:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {POPULAR.map((f) => (
            <button
              key={f.name}
              onClick={() => handleSearch(f.name)}
              style={{
                background: searched === f.name ? '#1a6b2f' : '#f0fdf4',
                color: searched === f.name ? '#fff' : '#1a6b2f',
                border: `1px solid ${searched === f.name ? '#1a6b2f' : '#bbf7d0'}`,
                borderRadius: 20,
                padding: '5px 14px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                transition: 'all .2s',
              }}
            >
              {f.emoji} {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input
          className="fm-input"
          placeholder="Or type fertilizer name (e.g. Potash, Boron)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          className="btn btn-green btn-sm"
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
        >
          {loading ? <span className="spin-anim">⏳</span> : 'Search'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <>
          <Skeleton height={60} marginTop={0} />
          <Skeleton height={80} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </>
      )}

      {/* Results */}
      {result && (
        <>
          <div className="ai-box" style={{ marginBottom: 16 }}>{result}</div>

          {/* Amazon buy button */}
          <a
            href={amazonLink}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'linear-gradient(135deg,#FF9900,#e68900)',
              color: '#fff',
              padding: 15,
              borderRadius: 14,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "'Poppins', sans-serif",
              boxShadow: '0 6px 20px rgba(255,153,0,0.45)',
              transition: 'transform .2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🛒 Buy <strong>"{searched}"</strong> on Amazon India ↗
          </a>

          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
            Opens Amazon.in in a new tab with search results
          </p>
        </>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            padding: '28px 16px',
            fontSize: 14,
          }}
        >
          🧪 Select or search any fertilizer to get<br />
          detailed info + a direct Amazon.in buy link
        </div>
      )}
    </Sheet>
  );
}
