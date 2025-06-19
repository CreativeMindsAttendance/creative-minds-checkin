
document.addEventListener("DOMContentLoaded", function() {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const today = new Date();
  const dayName = days[today.getDay()];
  const fullDate = today.toLocaleDateString("ar-SA");
  document.getElementById("header-title").textContent = `تحضير يوم ${dayName} - ${fullDate}`;
});

document.getElementById("attendance-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const messageDiv = document.getElementById("message");

  if (!name) {
    messageDiv.textContent = "يرجى إدخال الاسم الثلاثي";
    return;
  }

  if (localStorage.getItem("attendance_submitted") === new Date().toDateString()) {
    messageDiv.textContent = "تم تسجيل حضورك مسبقًا اليوم ✅";
    return;
  }

  navigator.geolocation.getCurrentPosition(function(position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    const instLat = 16.8891667;
    const instLon = 42.5619444;

    const distance = getDistanceFromLatLonInMeters(userLat, userLon, instLat, instLon);

    const insideRange = distance <= 50;
    const now = new Date();
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString();

    console.log({ name, date, time, insideRange });
    messageDiv.textContent = insideRange ? "تم تسجيل حضورك ✅" : "❌ أنت خارج نطاق المعهد";
    localStorage.setItem("attendance_submitted", new Date().toDateString());
  }, function(error) {
    messageDiv.textContent = "تعذر الحصول على الموقع الجغرافي.";
  });
});

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
