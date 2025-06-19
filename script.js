let lang = 'ar';
let translations = {};
let submittedToday = false;
let storedName = '';
const allowedDistance = 0.2; // بالكيلومتر

async function loadLang(file) {
  const res = await fetch(file);
  translations = await res.json();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.getElementById('title').textContent = translations.title;
  document.getElementById('nameInput').placeholder = translations.placeholder;
  document.getElementById('submitBtn').textContent = translations.submit;
  document.getElementById('lang-toggle').textContent = lang.toUpperCase();
}

function switchLang() {
  lang = lang === 'ar' ? 'en' : 'ar';
  loadLang(`lang-${lang}.json`);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('dark', isDark ? '1' : '0');
}

function distance(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function showMessage(msg, isError = false) {
  const el = document.getElementById('statusMessage');
  el.textContent = msg;
  el.style.color = isError ? 'crimson' : 'green';
}

async function checkIn(name, lat, lon) {
  if (!name) return showMessage(translations.required, true);
  if (submittedToday) return showMessage(translations.already.replace('{name}', storedName), true);

  // استثناء خاص لسليمان
  const override = name.trim() === "سليمان أحمد النجدي";

  const dist = distance(lat, lon, DEST_LAT, DEST_LON);
  if (dist > allowedDistance && !override)
    return showMessage(translations.outOfRange, true);

  submittedToday = true;
  storedName = name.trim();

  // بعد التحقق، عرض رسالة النجاح
  showMessage(translations.success);
}

function detectLocation(name) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      checkIn(name, latitude, longitude);
    },
    () => showMessage(translations.geoError, true)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  loadLang(`lang-${lang}.json`);

  const savedDark = localStorage.getItem('dark');
  if (savedDark === '1') document.body.classList.add('dark');

  document.getElementById('lang-toggle').onclick = switchLang;
  document.getElementById('mode-toggle').onclick = toggleDarkMode;

  document.getElementById('submitBtn').onclick = () => {
    const name = document.getElementById('nameInput').value.trim();
    showMessage(translations.loading);
    detectLocation(name);
  };
});
