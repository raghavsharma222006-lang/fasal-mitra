import { getCoords } from './helpers.js';

const BACKEND = import.meta.env.VITE_BACKEND_URL || '';
const apiUrl = (path) => `${BACKEND}/api${path}`;

export async function askClaude(prompt, imageBase64 = null) {
  try {
    const body = { prompt };
    if (imageBase64) body.image = imageBase64;

    const res = await fetch(apiUrl('/ai/ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    if (!res.ok) {
      if (data.errorType === 'CREDIT_LOW' || res.status === 402) {
        return '💳 AI service temporarily unavailable.\n\nThe API credit balance is low. Please add credits to your Anthropic account:\n👉 https://console.anthropic.com/account/billing/overview';
      }
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    
    return data.answer || '⚠️ No response received.';
  } catch (err) {
    console.error('askClaude error:', err);
    return '⚠️ Could not connect to AI server. Make sure the backend is running.';
  }
}

export async function fetchWeather(district) {
  try {
    const { lat, lon } = getCoords(district);
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API ${res.status}`);
    const data = await res.json();
    return data.current;
  } catch (err) {
    console.error('fetchWeather error:', err);
    return null;
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      resolve({ src: e.target.result, b64: base64 });
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
