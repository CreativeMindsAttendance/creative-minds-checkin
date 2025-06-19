
document.addEventListener("DOMContentLoaded", function() {
  const today = new Date();
  const day = today.toLocaleDateString("en-US", { weekday: 'long' });
  const date = today.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById("header-title").textContent = `Check-In for ${day} – ${date}`;
});

document.getElementById("attendance-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const messageDiv = document.getElementById("message");

  if (!name) {
    messageDiv.textContent = "Please enter your full name.";
    return;
  }

  navigator.geolocation.getCurrentPosition(function(position) {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    const instLat = 16.8891667;
    const instLon = 42.5619444;
    const distance = getDistanceFromLatLonInMeters(userLat, userLon, instLat, instLon);
    const insideRange = distance <= 50;

    if (!insideRange) {
      messageDiv.textContent = "❌ You are outside the allowed range.";
      return;
    }

    if (localStorage.getItem("attendance_submitted") === new Date().toDateString()) {
      messageDiv.textContent = "✅ You have already checked in today.";
      return;
    }

    localStorage.setItem("attendance_submitted", new Date().toDateString());
    messageDiv.textContent = "✅ Attendance confirmed!";
  }, function() {
    messageDiv.textContent = "Unable to retrieve your location.";
  });
});

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
