diff --git a/script.js b/script.js
index 836573a23b0db3216f920bc994b01ae0f3554cf5..e0ab42d595eaceb2a6b8273bd1d909613b6dc655 100644
--- a/script.js
+++ b/script.js
@@ -25,107 +25,115 @@ function loadLang() {
 }
 
 // === الوضع الليلي ===
 function toggleDarkMode() {
   const isDark = document.body.classList.toggle("dark");
   document.getElementById("mode-toggle").classList.toggle("active", isDark);
   localStorage.setItem("darkMode", isDark);
 }
 
 // === المسافة بين نقطتين ===
 function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
   const R = 6371;
   const dLat = deg2rad(lat2 - lat1);
   const dLon = deg2rad(lon2 - lon1);
   const a = Math.sin(dLat / 2) ** 2 +
             Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
             Math.sin(dLon / 2) ** 2;
   return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
 }
 
 function deg2rad(deg) {
   return deg * (Math.PI / 180);
 }
 
 // === رسائل المستخدم ===
-function showMessage(msg, isError = false) {
+function showMessage(msg, type = "success") {
   const el = document.getElementById("statusMessage");
   el.innerHTML = msg;
-  el.style.color = isError ? "crimson" : "green";
+  el.classList.add("show");
+  el.classList.remove("success", "warning", "error");
+  if (type === "error") {
+    el.classList.add("error");
+  } else if (type === "warning") {
+    el.classList.add("warning");
+  } else {
+    el.classList.add("success");
+  }
 }
 
 // === تخزين الحضور في localStorage ===
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
 
 // === تسجيل الحضور ===
 async function submitAttendance() {
   const name = document.getElementById("nameInput").value.trim();
   const statusMessage = document.getElementById("statusMessage");
   const t = translations[lang];
 
-  if (!name) return showMessage(t.required, true);
+  if (!name) return showMessage(t.required, "error");
 
   const existingName = hasCheckedInToday();
 if (existingName) {
   if (name !== existingName) {
-    return showMessage(t.nameMismatch.replace("{name}", existingName), true);
+    return showMessage(t.nameMismatch.replace("{name}", existingName), "error");
   } else {
-    return showMessage(t.already.replace("{name}", existingName), true);
+    return showMessage(t.already.replace("{name}", existingName), "warning");
   }
 }
 
   if (allowedOutsideNames.includes(name)) {
     saveAttendance(name);
     return showMessage(t.success);
   }
 
-  showMessage(t.loading);
+  showMessage(t.loading, "warning");
 
-  if (!navigator.geolocation) return showMessage(t.geoError, true);
+  if (!navigator.geolocation) return showMessage(t.geoError, "error");
 
   navigator.geolocation.getCurrentPosition(
     (pos) => {
       const d = getDistanceFromLatLonInKm(pos.coords.latitude, pos.coords.longitude, DEST_LAT, DEST_LON);
       if (d <= allowedDistance) {
         saveAttendance(name);
         showMessage(t.success);
       } else {
-        showMessage(t.outOfRange, true);
+        showMessage(t.outOfRange, "error");
       }
     },
-    () => showMessage(t.geoError, true)
+    () => showMessage(t.geoError, "error")
   );
 }
 
 // === عند تحميل الصفحة ===
 document.addEventListener("DOMContentLoaded", () => {
   const langToggle = document.getElementById("lang-toggle");
   const modeToggle = document.getElementById("mode-toggle");
   const submitBtn = document.getElementById("submitBtn");
 
   if (localStorage.getItem("darkMode") === "true") {
     document.body.classList.add("dark");
   }
 
   loadLang();
 
   langToggle.addEventListener("click", () => {
     lang = lang === "ar" ? "en" : "ar";
     localStorage.setItem("lang", lang);
     langToggle.classList.toggle("active");
     loadLang();
   });
 
   modeToggle.addEventListener("click", toggleDarkMode);
   submitBtn.addEventListener("click", submitAttendance);
 });
