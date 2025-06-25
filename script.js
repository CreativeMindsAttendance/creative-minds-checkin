// Global variables for application state
let currentLang = localStorage.getItem("lang") || "ar"; // Current language, defaults to Arabic
let isDarkMode = localStorage.getItem("darkMode") === "true"; // Dark mode state, defaults to false
let dhikrInterval; // Variable to hold the interval for changing dhikr

// Configuration for location services and allowed names:
// These constants are now accessed from the global `window` object,
// as they are declared in `config.js` and become globally available when `config.js` loads.
// DO NOT re-declare them here to avoid "already been declared" errors.

// Cached DOM elements for efficient access
const htmlElement = document.documentElement;
const bodyElement = document.body;
const langToggle = document.getElementById("lang-toggle");
const langOptions = langToggle.querySelectorAll(".lang-option");
const modeToggle = document.getElementById("mode-toggle");
const formTitle = document.getElementById("form-title");
const nameInput = document.getElementById("nameInput");
const submitBtn = document.getElementById("submitBtn");
const dailyDhikrDisplay = document.getElementById("dailyDhikr"); // Element to display Dhikr
const statusMessage = document.getElementById("statusMessage");
const locationText = document.getElementById("location-text");
const emailText = document.getElementById("email-text");
const websiteText = document.getElementById("website-text");


/**
 * Loads and applies the current language translations to the UI.
 * Updates HTML lang attribute and specific text directions.
 */
function loadLang() {
    // Ensure `translations` object is available from config.js
    if (typeof translations === 'undefined') {
        console.error("Error: 'translations' object not found. Make sure config.js is loaded correctly.");
        return;
    }
    const t = translations[currentLang]; // Get translations for the current language

    // Update HTML lang attribute for accessibility and browser features
    htmlElement.lang = currentLang;

    // Update UI text content based on selected language
    // Note: The site title "Creative Minds" is intentionally NOT translated here,
    // as per user requirement, and remains English.
    formTitle.textContent = t.title;
    nameInput.placeholder = t.placeholder;
    submitBtn.querySelector('.check-in').textContent = t.submit; // Updated to target the span inside button

    locationText.textContent = t.location;
    emailText.textContent = t.email;
    websiteText.textContent = t.website;

    // Apply specific text direction (RTL/LTR) to relevant input/message elements
    nameInput.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    statusMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    // Dhikr direction is handled in displayRandomDhikr()

    // Update the language switcher UI (active state and slider position)
    langToggle.dataset.activeLang = currentLang;
    langOptions.forEach(option => {
        option.classList.toggle("active", option.dataset.lang === currentLang);
    });

    hideMessage(); // Clear any previous status messages on language change
}

/**
 * Applies or removes the dark mode class from the body and updates the toggle switch UI.
 * Saves the dark mode preference to localStorage.
 */
function applyDarkMode() {
    bodyElement.classList.toggle("dark-mode", isDarkMode);
    modeToggle.classList.toggle("active", isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point.
 * @param {number} lon1 - Longitude of the first point.
 * @param {number} lat2 - Latitude of the second point.
 * @param {number} lon2 - Longitude of the second point.
 * @returns {number} Distance in kilometers.
 */
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

/**
 * Displays a status message to the user with a specified type and auto-hide duration.
 * @param {string} msg - The message to display.
 * @param {string} type - The type of message (e.g., "success", "error", "warning", "info").
 * @param {number} [duration=3000] - Duration in milliseconds before the message hides.
 */
function showMessage(msg, type = "info", duration = 3000) {
    statusMessage.innerHTML = msg;
    statusMessage.className = `status-message show ${type}`;
    clearTimeout(statusMessage.hideTimeout);

    if (type === "error") {
        duration = 5000;
    }

    statusMessage.hideTimeout = setTimeout(() => {
        statusMessage.classList.remove("show");
    }, duration);
}

/**
 * Immediately hides the status message.
 */
function hideMessage() {
    statusMessage.classList.remove("show");
    clearTimeout(statusMessage.hideTimeout);
}

/**
 * Checks if a user has already checked in today based on localStorage record.
 * @returns {string|boolean} The name of the user if checked in today, otherwise false.
 */
function hasCheckedInToday() {
    const record = localStorage.getItem("attendanceRecord");
    if (!record) return false;

    try {
        const { name, date } = JSON.parse(record);
        const today = new Date().toISOString().split("T")[0];
        return date === today ? name : false;
    } catch (e) {
        console.error("Error parsing attendance record from localStorage:", e);
        localStorage.removeItem("attendanceRecord");
        return false;
    }
}

/**
 * Saves the attendance record to localStorage for the current day.
 * @param {string} name - The name of the person checking in.
 */
function saveAttendance(name) {
    const today = new Date().toISOString().split("T")[0];
    const record = {
        name: name.trim(),
        date: today,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem("attendanceRecord", JSON.stringify(record));
}

/**
 * Main function to handle attendance submission.
 * Validates input, checks for previous check-ins, verifies location, and saves data.
 */
function submitAttendance() {
    const name = nameInput.value.trim();
    const t = translations[currentLang];

    nameInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");

    if (!name) {
        showMessage(t.required, "error");
        nameInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove("loading");
        nameInput.focus();
        return;
    }

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

    const DEST_LAT_GLOBAL = window.DEST_LAT;
    const DEST_LON_GLOBAL = window.DEST_LON;
    const ALLOWED_DISTANCE_KM_GLOBAL = window.ALLOWED_DISTANCE_KM;
    const ALLOWED_OUTSIDE_NAMES_GLOBAL = window.ALLOWED_OUTSIDE_NAMES;

    if (ALLOWED_OUTSIDE_NAMES_GLOBAL.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        saveAttendance(name);
        showMessage(t.success, "success");
        nameInput.value = "";
    } else {
        if (!navigator.geolocation) {
            showMessage(t.geoError, "error");
            nameInput.disabled = false;
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
            return;
        }

        showMessage(t.loading, "info");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT_GLOBAL, DEST_LON_GLOBAL);

                if (distance <= ALLOWED_DISTANCE_KM_GLOBAL) {
                    saveAttendance(name);
                    showMessage(t.success, "success");
                    nameInput.value = "";
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
                maximumAge: 0
            }
        );
    }
}

/**
 * Displays a random Dhikr from the pre-defined list in config.js.
 */
function displayRandomDhikr() {
    if (typeof adhkar === 'undefined' || adhkar.length === 0) {
        dailyDhikrDisplay.textContent = translations[currentLang].adhkarError;
        return;
    }
    const randomIndex = Math.floor(Math.random() * adhkar.length);
    dailyDhikrDisplay.textContent = adhkar[randomIndex];
    dailyDhikrDisplay.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
}

/**
 * Initializes the application: loads preferences, sets up event listeners.
 */
function init() {
    isDarkMode = localStorage.getItem("darkMode") === "true";
    applyDarkMode();

    loadLang();

    displayRandomDhikr();

    // Auto-change Dhikr every 10 seconds
    clearInterval(dhikrInterval);
    dhikrInterval = setInterval(displayRandomDhikr, 10000);

    langToggle.addEventListener("click", () => {
        currentLang = (currentLang === "ar" ? "en" : "ar");
        localStorage.setItem("lang", currentLang);
        loadLang();
        displayRandomDhikr();
    });

    modeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        applyDarkMode();
    });

    submitBtn.addEventListener("click", submitAttendance);

    nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            submitAttendance();
        }
    });

    nameInput.addEventListener("input", hideMessage);

    nameInput.focus();
}

document.addEventListener("DOMContentLoaded", init);
