import { Router } from 'express';

const router = Router();

// District → coordinates map (Punjab, India)
const COORDS = {
  'Amritsar':               { lat: 31.634, lon: 74.872 },
  'Barnala':                { lat: 30.378, lon: 75.548 },
  'Bathinda':               { lat: 30.210, lon: 74.945 },
  'Faridkot':               { lat: 30.674, lon: 74.757 },
  'Fatehgarh Sahib':        { lat: 30.648, lon: 76.388 },
  'Fazilka':                { lat: 30.403, lon: 74.022 },
  'Ferozepur':              { lat: 30.923, lon: 74.615 },
  'Gurdaspur':              { lat: 32.039, lon: 75.406 },
  'Hoshiarpur':             { lat: 31.535, lon: 75.913 },
  'Jalandhar':              { lat: 31.326, lon: 75.576 },
  'Kapurthala':             { lat: 31.380, lon: 75.380 },
  'Ludhiana':               { lat: 30.901, lon: 75.857 },
  'Malerkotla':             { lat: 30.529, lon: 75.879 },
  'Mansa':                  { lat: 29.988, lon: 75.397 },
  'Moga':                   { lat: 30.817, lon: 75.171 },
  'Mohali (SAS Nagar)':     { lat: 30.704, lon: 76.717 },
  'Muktsar':                { lat: 30.476, lon: 74.511 },
  'Nawanshahr':             { lat: 31.125, lon: 76.116 },
  'Pathankot':              { lat: 32.274, lon: 75.652 },
  'Patiala':                { lat: 30.339, lon: 76.386 },
  'Rupnagar':               { lat: 30.965, lon: 76.525 },
  'Sangrur':                { lat: 30.244, lon: 75.844 },
  'Shahid Bhagat Singh Nagar': { lat: 31.125, lon: 76.116 },
  'Tarn Taran':             { lat: 31.451, lon: 74.928 },
};

/**
 * GET /api/weather?district=Amritsar
 * Proxies Open-Meteo (free, no API key required).
 */
router.get('/', async (req, res, next) => {
  try {
    const { district } = req.query;

    const coords = COORDS[district] || { lat: 31.1048, lon: 77.1734 };
    const { lat, lon } = coords;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw Object.assign(new Error('Weather API request failed'), { status: 502 });
    }

    const data = await response.json();
    res.json({ success: true, district: district || 'Unknown', current: data.current });

  } catch (err) {
    next(err);
  }
});

export default router;
