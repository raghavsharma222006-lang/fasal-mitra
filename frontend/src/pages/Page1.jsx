import { motion } from 'framer-motion';

const floatingEmojis = [
  { e: '🌾', left: '8%',  top: '12%' },
  { e: '🌿', left: '88%', top: '18%' },
  { e: '🌻', left: '15%', top: '70%' },
  { e: '🌽', left: '82%', top: '72%' },
  { e: '🌱', left: '45%', top: '8%'  },
  { e: '🍀', left: '50%', top: '85%' },
];

export default function Page1({ onNext }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#071f0e 0%,#0f3d1f 25%,#1a6b2f 55%,#2d9e47 80%,#f5c518 100%)',
      backgroundSize: '200% 200%',
      animation: 'gradientShift 8s ease infinite',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 20, overflow: 'hidden', position: 'relative',
    }}>
      {[120, 200, 290, 380].map((size, i) => (
        <div key={i} style={{
          position: 'absolute', width: size, height: size,
          border: `1px solid rgba(255,255,255,${0.06 + i * 0.03})`,
          borderRadius: '50%', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          animation: `pulse ${2.5 + i * 0.6}s ease-in-out infinite`,
          animationDelay: `${i * 0.35}s`,
        }} />
      ))}

      {floatingEmojis.map(({ e, left, top }, i) => (
        <div key={i} style={{
          position: 'absolute', left, top,
          fontSize: 28,
          animation: `floatY ${3 + i * 0.5}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          opacity: 0.65,
        }}>{e}</div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', zIndex: 10 }}
      >
        <div style={{ fontSize: 88, marginBottom: 8 }} className="animate-float">🌾</div>

        <h1 style={{
          color: '#fff',
          fontSize: 'clamp(32px,8vw,60px)',
          fontWeight: 800,
          letterSpacing: '-1px',
          lineHeight: 1.1,
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>Fasal Mitra</h1>

        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 'clamp(14px,3.5vw,20px)', marginTop: 6, fontWeight: 300, letterSpacing: '0.5px' }}>
          ਫ਼ਸਲ ਮਿੱਤਰ – ਪੰਜਾਬ ਕਰੌਪ ਅਡਵਾਈਜ਼ਰ
        </p>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginTop: 6, marginBottom: 40, maxWidth: 360 }}>
          AI-Powered Crop Advisory for Punjab's New Generation Farmers
        </p>

        <motion.button
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          style={{
            padding: '16px 48px', borderRadius: 50, border: 'none',
            background: 'linear-gradient(135deg,#f5c518,#e6ac00)',
            color: '#1a1a1a', fontWeight: 800, fontSize: 18,
            cursor: 'pointer', fontFamily: "'Poppins',sans-serif",
            boxShadow: '0 8px 28px rgba(245,197,24,0.55)',
          }}
        >
          🚀 Get Started
        </motion.button>

        <div style={{ marginTop: 36, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['🤖 AI-Powered', '🌦 Weather Smart', '🌾 Punjab Focused', '🗣 Punjabi Ready'].map(tag => (
            <span key={tag} style={{
              background: 'rgba(255,255,255,.12)',
              color: '#fff', padding: '5px 14px', borderRadius: 20,
              fontSize: 12, border: '1px solid rgba(255,255,255,.25)',
            }}>{tag}</span>
          ))}
        </div>
      </motion.div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70 }}>
        <svg viewBox="0 0 800 70" style={{ width: '100%', height: 70 }} preserveAspectRatio="none">
          <path d="M0,40 Q100,20 200,40 Q300,60 400,40 Q500,20 600,40 Q700,60 800,40 L800,70 L0,70Z"
            fill="rgba(0,0,0,.25)" />
        </svg>
      </div>
    </div>
  );
}