import { DISTRICT_COORDS } from './constants';

export function getCoords(district) {
  return DISTRICT_COORDS[district] || { lat: 31.1048, lon: 77.1734 };
}

export function getSeason() {
  const month = new Date().getMonth() + 1;
  if (month >= 10 || month <= 3) {
    return {
      name:  "Rabi Season",
      namePa:"ਰਬੀ ਸੀਜ਼ਨ",
      crops: "Wheat, Mustard, Gram, Barley, Chickpea",
      emoji: "🌾",
      bg:    "#fef9c3",
      text:  "#92400e",
    };
  }
  if (month >= 4 && month <= 6) {
    return {
      name:  "Zaid Season",
      namePa:"ਜ਼ੈਦ ਸੀਜ਼ਨ",
      crops: "Vegetables, Melons, Watermelon, Cucumbers, Sunflower",
      emoji: "🥬",
      bg:    "#dcfce7",
      text:  "#166534",
    };
  }
  return {
    name:  "Kharif Season",
    namePa:"ਖ਼ਰੀਫ਼ ਸੀਜ਼ਨ",
    crops: "Paddy, Maize, Cotton, Sugarcane, Groundnut",
    emoji: "🌿",
    bg:    "#d1fae5",
    text:  "#065f46",
  };
}

export function decodeWeatherCode(code) {
  if (code === 0)              return { desc: "Clear Sky",      emoji: "☀️" };
  if (code <= 3)               return { desc: "Partly Cloudy",  emoji: "⛅" };
  if (code <= 48)              return { desc: "Foggy",          emoji: "🌫️" };
  if (code <= 67)              return { desc: "Rainy",          emoji: "🌧️" };
  if (code <= 77)              return { desc: "Snowy",          emoji: "❄️" };
  if (code <= 82)              return { desc: "Rain Showers",   emoji: "🌦️" };
  return                              { desc: "Thunderstorm",   emoji: "⛈️" };
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
