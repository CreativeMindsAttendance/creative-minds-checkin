// Global variables
let currentLang = localStorage.getItem("lang") || "ar"; // Renamed from 'lang' to avoid conflict
let isDarkMode = localStorage.getItem("darkMode") === "true"; // Renamed from 'submittedToday' to avoid confusion

// DOM elements (cached for performance)
const htmlElement = document.documentElement;
const bodyElement = document.body;
const langToggle = document.getElementById("lang-toggle");
const langOptions = langToggle.querySelectorAll(".lang-option");
const modeToggle = document.getElementById("mode-toggle");
const modeToggleIcon = modeToggle.querySelector(".toggle-icon");
const siteTitleCreative = document.getElementById("site-title-creative");
const siteTitleMinds = document.getElementById("site-title-minds");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");
const locationText = document.getElementById("location-text");
const emailText = document.getElementById("email-text");
const websiteText = document.getElementById("website-text");


// Load language and apply translations
function loadLang() {
    const t = translations[currentLang];

    // Update HTML lang attribute (important for accessibility and browser behavior)
    htmlElement.lang = currentLang;

    // Update text content
    siteTitleCreative.textContent = t.siteTitleCreative;
    siteTitleMinds.textContent = t.siteTitleMinds;
    formTitle.textContent = t.title;
    nameInput.placeholder = t.placeholder;
    submitBtn.textContent = t.submit;
    locationText.textContent = t.location;
    emailText.textContent = t.email;
    websiteText.textContent = t.website;

    // Manage text direction for specific elements that are language-sensitive
    // Only apply 'rtl' or 'ltr' to these specific elements, not the whole body
    nameInput.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    statusMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    // The main site title has its font handled by CSS based on html[lang]

    // Update language switcher active state and slider position
    langToggle.dataset.activeLang = currentLang; // Set data attribute for CSS
    langOptions.forEach(option => {
        option.classList.toggle("active", option.dataset.lang === currentLang);
    });

    hideMessage(); // Clear any existing messages on language change
}

// Apply or remove dark mode
function applyDarkMode() {
    bodyElement.classList.toggle("dark-mode", isDarkMode);
    modeToggle.classList.toggle("active", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
}

// Distance calculation using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Show message with animation and auto-hide
function showMessage(msg, type = "info", duration = 3000) {
    statusMessage.innerHTML = msg;
    statusMessage.className = `status-message show ${type}`; // Apply type class
    clearTimeout(statusMessage.hideTimeout); // Clear any previous timeout

    if (type === "error") {
        duration = 5000; // Show error messages longer
    }

    statusMessage.hideTimeout = setTimeout(() => {
        statusMessage.classList.remove("show");
    }, duration);
}

// Hide message (immediately)
function hideMessage() {
    statusMessage.classList.remove("show");
    clearTimeout(statusMessage.hideTimeout); // Ensure timeout is cleared
}

// Check if user has already checked in today
function hasCheckedInToday() {
    const record = localStorage.getItem("attendanceRecord");
    if (!record) return false;

    try {
        const { name, date } = JSON.parse(record);
        const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
        return date === today ? name : false;
    } catch (e) {
        console.error("Error parsing attendance record:", e);
        localStorage.removeItem("attendanceRecord"); // Clear corrupted record
        return false;
    }
}

// Save attendance record
function saveAttendance(name) {
    const today = new Date().toISOString().split("T")[0];
    const record = {
        name: name.trim(),
        date: today,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem("attendanceRecord", JSON.stringify(record));
}

// Main attendance submission function
function submitAttendance() {
    const name = nameInput.value.trim();
    const t = translations[currentLang];

    // Disable input and button to prevent multiple submissions
    nameInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    // Validate name input
    if (!name) {
        showMessage(t.required, "error");
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        nameInput.focus();
        return;
    }

    // Check if already checked in today
    const existingName = hasCheckedInToday();
    if (existingName) {
        if (name.toLowerCase() !== existingName.toLowerCase()) {
            showMessage(t.nameMismatch.replace("{name}", existingName), "error");
        } else {
            showMessage(t.already.replace("{name}", existingName), "warning");
        }
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        return;
    }

    // Check if user is in allowed list (can check in from anywhere)
    if (ALLOWED_OUTSIDE_NAMES.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        saveAttendance(name);
        showMessage(t.success, "success");
        nameInput.value = ""; // Clear input after successful check-in
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        return;
    }

    // Check location for regular users
    if (!navigator.geolocation) {
        showMessage(t.geoError, "error");
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        return;
    }

    showMessage(t.loading, "info"); // Show loading message

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT, DEST_LON);

            if (distance <= ALLOWED_DISTANCE_KM) {
                saveAttendance(name);
                showMessage(t.success, "success");
                nameInput.value = ""; // Clear input after successful check-in
            } else {
                showMessage(t.outOfRange, "error");
            }
            nameInput.disabled = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        },
        (error) => {
            console.error("Geolocation error:", error);
            let errorMessage = t.geoError;
            if (error.code === error.PERMISSION_DENIED) {
                errorMessage = t.permissionDenied || t.geoError;
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMessage = t.positionUnavailable || t.geoError;
            } else if (error.code === error.TIMEOUT) {
                errorMessage = t.timeout || t.geoError;
            }
            showMessage(errorMessage, "error");
            nameInput.disabled = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0 // Do not use cached positions
        }
    );
}

// Initialize the application
function init() {
    // Load dark mode preference
    isDarkMode = localStorage.getItem("darkMode") === "true"; // Ensure isDarkMode variable is updated
    applyDarkMode();

    // Load language
    loadLang();

    // Event listeners for language toggle
    langToggle.addEventListener("click", () => {
        currentLang = (currentLang === "ar" ? "en" : "ar");
        localStorage.setItem("lang", currentLang);
        loadLang();
    });

    // Event listener for dark mode toggle
    modeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode; // Toggle the boolean state
        applyDarkMode();
    });

    // Event listener for submit button
    submitBtn.addEventListener("click", submitAttendance);

    // Allow Enter key to submit
    nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            submitAttendance();
        }
    });

    // Clear message when user starts typing
    nameInput.addEventListener("input", hideMessage);

    nameInput.focus(); // Focus on name input when page loads
}

// Start the application when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
