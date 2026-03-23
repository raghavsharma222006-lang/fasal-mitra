import { useState, useRef } from 'react';
import Sheet from './Sheet.jsx';
import { askClaude, fileToBase64 } from '../../utils/api.js';
import { Skeleton } from '../Skeleton.jsx';

export default function CameraSheet({ title, icon, prompt, onClose }) {
  const [image, setImage]     = useState(null);   // { src, b64 }
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRef              = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, HEIC).');
      return;
    }
    // Validate size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please use a photo under 5 MB.');
      return;
    }

    setError('');
    setResult('');
    try {
      const img = await fileToBase64(file);
      setImage(img);
    } catch {
      setError('Could not read the image file. Please try again.');
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult('');
    const r = await askClaude(prompt, image.b64);
    setResult(r);
    setLoading(false);
  };

  const handleReset = () => {
    setImage(null);
    setResult('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Sheet title={title} icon={icon} onClose={onClose}>

      {/* Drop zone */}
      <div
        className="drop-zone"
        onClick={() => inputRef.current?.click()}
        style={{ marginBottom: 14, position: 'relative' }}
      >
        {image ? (
          <>
            <img
              src={image.src}
              alt="Preview"
              style={{
                maxHeight: 220,
                maxWidth: '100%',
                borderRadius: 12,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
            <p style={{ fontSize: 12, color: '#1a6b2f', marginTop: 10, fontWeight: 600 }}>
              ✅ Image loaded — tap to replace
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{icon}</div>
            <p style={{ fontWeight: 700, color: '#1a6b2f', fontSize: 15, marginBottom: 4 }}>
              Tap to capture or upload photo
            </p>
            <p style={{ color: '#94a3b8', fontSize: 12 }}>
              JPG, PNG, HEIC · Max 5 MB
            </p>
          </>
        )}
      </div>

      {/* Hidden file input — camera capture on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {/* Error message */}
      {error && (
        <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>⚠️ {error}</p>
      )}

      {/* Action buttons */}
      {image && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            className="btn btn-green"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ flex: 1, fontSize: 14 }}
          >
            {loading
              ? <><span className="spin-anim">🔍</span> Analysing…</>
              : '🤖 Analyse with AI'}
          </button>
          <button
            onClick={handleReset}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: 12,
              padding: '0 16px',
              cursor: 'pointer',
              fontSize: 13,
              color: '#64748b',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            🔄 Reset
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <Skeleton height={60} marginTop={0} />
          <Skeleton height={80} />
          <Skeleton height={60} />
          <Skeleton height={80} />
        </>
      )}

      {/* AI result */}
      {result && <div className="ai-box">{result}</div>}

      {/* Empty state */}
      {!image && !loading && (
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 12,
            padding: '16px',
            fontSize: 13,
            color: '#475569',
            lineHeight: 1.7,
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: 6 }}>📸 How to use:</p>
          <p>1. Tap the area above to open your camera or gallery.</p>
          <p>2. Capture a clear, well-lit photo of the crop or plant.</p>
          <p>3. Tap <strong>"Analyse with AI"</strong> for instant results.</p>
        </div>
      )}
    </Sheet>
  );
}
