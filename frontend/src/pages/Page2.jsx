import { useState } from 'react';
import { motion } from 'framer-motion';
import { DISTRICTS } from '../utils/constants';

export default function Page2({ onBack, onNext }) {
  const [village,  setVillage]  = useState('');
  const [district, setDistrict] = useState('');
  const [state,    setState]    = useState('Punjab');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!village.trim())  e.village  = 'Village name is required';
    if (!district)        e.district = 'Please select a district';
    if (!state.trim())    e.state    = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onNext({ village: village.trim(), district, state: state.trim() });
    setLoading(false);
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:7 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ color:'#dc2626', fontSize:11, marginTop:4 }}>⚠️ {error}</p>}
    </div>
  );

  const inputStyle = (hasError) => ({
    width:'100%', padding:'13px 16px',
    border: `2px solid ${hasError ? '#dc2626' : '#e2e8f0'}`,
    borderRadius:12, fontSize:14,
    fontFamily:"'Poppins',sans-serif", outline:'none',
    transition:'border-color .3s, box-shadow .3s',
    background:'#fff', color:'#1a1a1a',
  });

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg,#f0fdf4,#dcfce7 50%,#bbf7d0)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <motion.div
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.6 }}
        style={{
          background:'#fff', borderRadius:24, padding:'40px 32px',
          maxWidth:460, width:'100%',
          boxShadow:'0 20px 60px rgba(0,0,0,.1)',
        }}
      >
        <button
          onClick={onBack}
          style={{ background:'none', border:'none', color:'#64748b', fontSize:13, cursor:'pointer', marginBottom:20, padding:0, fontFamily:"'Poppins',sans-serif", display:'flex', alignItems:'center', gap:6 }}
        >← Back to Home</button>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:56, marginBottom:10 }} className="animate-float">📍</div>
          <h2 style={{ fontSize:24, fontWeight:700, color:'#1a1a1a' }}>Your Farm Location</h2>
          <p style={{ color:'#64748b', fontSize:13, marginTop:6 }}>
            We personalise AI advice based on your exact area
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <Field label="🏘️ Village / Town Name" error={errors.village}>
            <input
              style={inputStyle(errors.village)}
              placeholder="e.g. Majitha, Kartarpur, Phillaur…"
              value={village}
              onChange={e => { setVillage(e.target.value); setErrors(p=>({...p,village:''})); }}
            />
          </Field>

          <Field label="🏙️ District Name" error={errors.district}>
            <select
              style={{ ...inputStyle(errors.district), appearance:'none',
                backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%231a6b2f' d='M5 7L0 2h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:36
              }}
              value={district}
              onChange={e => { setDistrict(e.target.value); setErrors(p=>({...p,district:''})); }}
            >
              <option value="">— Select District —</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

          <Field label="🗺️ State" error={errors.state}>
            <input
              style={inputStyle(errors.state)}
              value={state}
              onChange={e => { setState(e.target.value); setErrors(p=>({...p,state:''})); }}
            />
          </Field>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submit}
            disabled={loading}
            style={{
              marginTop:6, padding:'14px 0', borderRadius:50, border:'none',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg,#1a6b2f,#2d9e47)',
              color:'#fff', fontWeight:700, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily:"'Poppins',sans-serif",
              boxShadow: loading ? 'none' : '0 6px 20px rgba(26,107,47,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}
          >
            {loading
              ? <><span className="animate-spin-slow" style={{display:'inline-block'}}>⏳</span> Loading…</>
              : 'Proceed to Dashboard →'
            }
          </motion.button>
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'#94a3b8', marginTop:18 }}>
          🔒 Your data stays on your device — never shared
        </p>
      </motion.div>
    </div>
  );
}