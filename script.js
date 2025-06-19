(function(){
const nameField = document.getElementById("name");
const messageDiv = document.getElementById("message");
const distanceDiv = document.getElementById("distance");
const langBtn = document.getElementById("langBtn");
const modeBtn = document.getElementById("modeBtn");
const strings = {
  en: {
    placeholder: "Enter your full name",
    button: "Check In",
    outOfRange: "❌ You are outside the institute range. You must be at the institute to check in.",
    alreadyChecked: "✅ You have already checked in today.",
    confirmed: "✅ Attendance confirmed!",
    header: () => {
      const today = new Date();
      const day = today.toLocaleDateString("en-US", { weekday: 'long' });
      const date = today.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
      return `Check-In for ${day} – ${date}`;
    }
  },
  ar: {
    placeholder: "الاسم الثلاثي",
    button: "تسجيل الحضور",
    outOfRange: "❌ أنت خارج نطاق المعهد، يجب أن تكون في المعهد ليتم تسجيل حضورك",
    alreadyChecked: "✅ تم تسجيل حضورك مسبقًا اليوم",
    confirmed: "✅ تم تسجيل حضورك",
    header: () => {
      const today = new Date();
      const date = today.toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `تحضير يوم ${date}`;
    }
  }
};
let currentLang = localStorage.getItem("lang") || "ar";
let isDark = localStorage.getItem("darkmode") === "true";
function applyLang() {
  const t = strings[currentLang];
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
  document.getElementById("header-title").textContent = t.header();
  nameField.placeholder = t.placeholder;
  document.getElementById("submitBtn").textContent = t.button;
  langBtn.textContent = currentLang === "ar" ? "🌐 English" : "🌐 عربي";
}
applyLang();
langBtn.onclick = () => {
  currentLang = currentLang === "ar" ? "en" : "ar";
  localStorage.setItem("lang", currentLang);
  applyLang();
};
function toggleDarkMode(force = null) {
  const body = document.body;
  if (force !== null) {
    isDark = force;
  } else {
    isDark = !isDark;
  }
  body.classList.toggle("dark", isDark);
  localStorage.setItem("darkmode", isDark);
}
toggleDarkMode(isDark);
modeBtn.onclick = () => toggleDarkMode();
document.getElementById("attendance-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = nameField.value.trim();
  const todayKey = new Date().toDateString();
  const t = strings[currentLang];
  if (!name) {
    messageDiv.textContent = currentLang === "ar" ? "يرجى إدخال الاسم" : "Please enter your name";
    return;
  }
  if (localStorage.getItem("attendance_submitted") === todayKey) {
    messageDiv.textContent = t.alreadyChecked;
    return;
  }
  navigator.geolocation.getCurrentPosition(function(pos) {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const instLat = 16.8891667;
    const instLon = 42.5619444;
    const distance = getDistance(lat, lon, instLat, instLon);
    distanceDiv.textContent = (currentLang === "ar" ? "تبعد عن المعهد: " : "Distance from institute: ") + distance.toFixed(1) + " m";
    const isInside = distance <= 50;
    const isSuleiman = name === "سليمان أحمد النجدي";
    if (!isInside && !isSuleiman) {
      messageDiv.textContent = t.outOfRange;
      return;
    }
    localStorage.setItem("attendance_submitted", todayKey);
    messageDiv.textContent = isSuleiman ? t.confirmed + " (استثناء إداري)" : t.confirmed;
    console.log("Fingerprint:", navigator.userAgent, screen.width, screen.height);
  }, () => {
    messageDiv.textContent = currentLang === "ar" ? "تعذر تحديد الموقع" : "Could not determine location.";
  });
});
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = deg2rad(lat2-lat1);
  const dLon = deg2rad(lon2-lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function deg2rad(d) {
  return d * (Math.PI/180);
}
})();