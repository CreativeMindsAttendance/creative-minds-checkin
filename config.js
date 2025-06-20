// إحداثيات معهد Creative Minds
const DEST_LAT = 16.889264;
const DEST_LON = 42.548691;

// المسافة المسموحة بالكيلومتر
const allowedDistance = 0.2;

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

const existingName = hasCheckedInToday();

if (existingName) {
  const message = translations[currentLang].already.replace("{name}", existingName);
  statusMessage.textContent = message;
  return;
}

// إذا ما تم تحضيره من قبل:
saveAttendance(name); // نحفظ اسمه في localStorage
