// إحداثيات معهد Creative Minds
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;

// المسافة المسموحة بالكيلومتر
const allowedDistance = 0.2;

window.addEventListener("DOMContentLoaded", () => {
  const existingName = hasCheckedInToday();
  if (existingName) {
    const statusMessage = document.getElementById("statusMessage");
    const message = translations[currentLang].already.replace("{name}", existingName);
    statusMessage.textContent = message;

    // اختياري: عطّل الزر أو خفّيه بعد التسجيل
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("submitBtn").style.opacity = 0.5;

    // اختياري: عبِّ الاسم تلقائيًا (ما يقدر يغيره)
    document.getElementById("nameInput").value = existingName;
    document.getElementById("nameInput").disabled = true;
  }
});

function hasCheckedInToday() {
  const record = localStorage.getItem("attendanceRecord");
  if (!record) return false;

  const { name, date } = JSON.parse(record);
  const today = new Date().toISOString().split("T")[0];
  return date === today ? name : false;
}

function saveAttendance(name) {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("attendanceRecord", JSON.stringify({ name, date: today }));
}

async function submitAttendance() {
  const name = document.getElementById("nameInput").value.trim();
  const statusMessage = document.getElementById("statusMessage");

  if (!name) {
    statusMessage.textContent = translations[currentLang].required;
    return;
  }

  const existingName = hasCheckedInToday();

  if (existingName) {
    const message = translations[currentLang].already.replace("{name}", existingName);
    statusMessage.textContent = message;
    return;
  }

  // بعد ما نتحقق من الموقع الجغرافي وغيره، وسجّل الحضور فعلاً:
  saveAttendance(name);
  statusMessage.textContent = translations[currentLang].success;
}
