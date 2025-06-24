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
const newDhikrBtn = document.getElementById("newDhikrBtn"); // Optional button for new Dhikr
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
    // This check is crucial because `config.js` loads first
    if (typeof translations === 'undefined') {
        console.error("Error: 'translations' object not found. Make sure config.js is loaded correctly.");
        // Attempt to re-load config.js if possible or halt execution
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
    submitBtn.textContent = t.submit;
    dailyDhikrDisplay.style.direction = (currentLang === "ar" ? "rtl" : "ltr"); // Ensure Dhikr text direction is correct
    newDhikrBtn.textContent = t.newDhikrButton; // Update text for new Dhikr button
    locationText.textContent = t.location;
    emailText.textContent = t.email;
    websiteText.textContent = t.website;

    // Apply specific text direction (RTL/LTR) to relevant input/message elements
    // This avoids flipping the entire page layout while still ensuring text reads correctly.
    nameInput.style.direction = (currentLang === "ar" ? "rtl" : "ltr");
    statusMessage.style.direction = (currentLang === "ar" ? "rtl" : "ltr");


    // Update the language switcher UI (active state and slider position)
    langToggle.dataset.activeLang = currentLang; // CSS uses this data attribute for slider positioning
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
    bodyElement.classList.toggle("dark-mode", isDarkMode); // Toggle dark-mode class on body
    modeToggle.classList.toggle("active", isDarkMode); // Update the visual state of the toggle switch
    localStorage.setItem("darkMode", isDarkMode); // Save preference
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
    const dLat = (lat2 - lat1) * Math.PI / 180; // Delta Latitude in radians
    const dLon = (lon2 - lon1) * Math.PI / 180; // Delta Longitude in radians
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
    statusMessage.innerHTML = msg; // Set message text
    statusMessage.className = `status-message show ${type}`; // Apply classes for styling and visibility
    clearTimeout(statusMessage.hideTimeout); // Clear any previous auto-hide timeout

    // Adjust duration for error messages to give user more time to read
    if (type === "error") {
        duration = 5000;
    }

    // Set a new auto-hide timeout
    statusMessage.hideTimeout = setTimeout(() => {
        statusMessage.classList.remove("show");
    }, duration);
}

/**
 * Immediately hides the status message.
 */
function hideMessage() {
    statusMessage.classList.remove("show"); // Remove 'show' class to hide
    clearTimeout(statusMessage.hideTimeout); // Clear any pending auto-hide timeout
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
        const today = new Date().toISOString().split("T")[0]; // Get current date in "YYYY-MM-DD" format
        return date === today ? name : false; // Return name if date matches, else false
    } catch (e) {
        console.error("Error parsing attendance record from localStorage:", e);
        localStorage.removeItem("attendanceRecord"); // Clear corrupted record to prevent future issues
        return false;
    }
}

/**
 * Saves the attendance record to localStorage for the current day.
 * @param {string} name - The name of the person checking in.
 */
function saveAttendance(name) {
    const today = new Date().toISOString().split("T")[0]; // Get current date
    const record = {
        name: name.trim(), // Store trimmed name
        date: today,
        timestamp: new Date().toISOString() // Store full timestamp for more detail
    };
    localStorage.setItem("attendanceRecord", JSON.stringify(record)); // Save as JSON string
}

/**
 * Main function to handle attendance submission.
 * Validates input, checks for previous check-ins, verifies location, and saves data.
 */
function submitAttendance() {
    const name = nameInput.value.trim();
    const t = translations[currentLang]; // Get current language translations

    // Disable inputs and buttons during processing to prevent multiple submissions
    nameInput.disabled = true;
    submitBtn.disabled = true;
    newDhikrBtn.disabled = true; // Disable new Dhikr button
    submitBtn.classList.add("loading"); // Show loading spinner on submit button

    // Validate if name input is empty
    if (!name) {
        showMessage(t.required, "error");
        // Re-enable elements if validation fails
        nameInput.disabled = false;
        submitBtn.disabled = false;
        newDhikrBtn.disabled = false; // Re-enable new Dhikr button
        submitBtn.classList.remove("loading");
        nameInput.focus(); // Focus back on input for user to correct
        return;
    }

    // Check if the user has already checked in today
    const existingName = hasCheckedInToday();
    if (existingName) {
        // If a different name is used by someone who already checked in
        if (name.toLowerCase() !== existingName.toLowerCase()) {
            showMessage(t.nameMismatch.replace("{name}", existingName), "error");
        } else {
            // Same name, already checked in
            showMessage(t.already.replace("{name}", existingName), "warning");
        }
        // Re-enable elements
        nameInput.disabled = false;
        submitBtn.disabled = false;
        newDhikrBtn.disabled = false; // Re-enable new Dhikr button
        submitBtn.classList.remove("loading");
        return;
    }

    // Access location constants from the global scope (defined in config.js)
    const DEST_LAT_GLOBAL = window.DEST_LAT;
    const DEST_LON_GLOBAL = window.DEST_LON;
    const ALLOWED_DISTANCE_KM_GLOBAL = window.ALLOWED_DISTANCE_KM;
    const ALLOWED_OUTSIDE_NAMES_GLOBAL = window.ALLOWED_OUTSIDE_NAMES;


    // Check if the user's name is in the allowed list for outside check-ins
    if (ALLOWED_OUTSIDE_NAMES_GLOBAL.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        saveAttendance(name); // Save attendance without GPS check
        showMessage(t.success, "success");
        nameInput.value = ""; // Clear input
    } else {
        // If Geolocation API is not available in the browser
        if (!navigator.geolocation) {
            showMessage(t.geoError, "error");
            // Re-enable elements
            nameInput.disabled = false;
            submitBtn.disabled = false;
            newDhikrBtn.disabled = false; // Re-enable new Dhikr button
            submitBtn.classList.remove("loading");
            return;
        }

        showMessage(t.loading, "info"); // Show loading message while checking location

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                // Use the global constants for distance calculation
                const distance = getDistanceFromLatLonInKm(userLat, userLon, DEST_LAT_GLOBAL, DEST_LON_GLOBAL);

                if (distance <= ALLOWED_DISTANCE_KM_GLOBAL) {
                    saveAttendance(name); // Save attendance if within allowed distance
                    showMessage(t.success, "success");
                    nameInput.value = ""; // Clear input
                } else {
                    showMessage(t.outOfRange, "error"); // User is too far from the institute
                }
                // Always re-enable elements after a successful or failed location check
                nameInput.disabled = false;
                submitBtn.disabled = false;
                newDhikrBtn.disabled = false; // Re-enable new Dhikr button
                submitBtn.classList.remove("loading");
            },
            (error) => {
                console.error("Geolocation error:", error); // Log detailed error to console
                let errorMessage = t.geoError; // Default error message
                // Provide more specific error messages based on Geolocation API error codes
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = t.permissionDenied || t.geoError;
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    errorMessage = t.positionUnavailable || t.geoError;
                } else if (error.code === error.TIMEOUT) {
                    errorMessage = t.timeout || t.geoError;
                }
                showMessage(errorMessage, "error"); // Display specific error message
                // Always re-enable elements after an error
                nameInput.disabled = false;
                submitBtn.disabled = false;
                newDhikrBtn.disabled = false; // Re-enable new Dhikr button
                submitBtn.classList.remove("loading");
            },
            {
                enableHighAccuracy: true, // Request the most accurate position
                timeout: 10000, // Maximum time (10 seconds) to wait for a position
                maximumAge: 0 // Do not use a cached position; request a fresh one
            }
        );
    }
}

/**
 * Displays a random Dhikr from the pre-defined list in config.js.
 */
function displayRandomDhikr() {
    // Ensure `adhkar` array is available from config.js
    if (typeof adhkar === 'undefined' || adhkar.length === 0) {
        dailyDhikrDisplay.textContent = translations[currentLang].adhkarError;
        return;
    }
    const randomIndex = Math.floor(Math.random() * adhkar.length);
    dailyDhikrDisplay.textContent = adhkar[randomIndex];
    dailyDhikrDisplay.style.direction = (currentLang === "ar" ? "rtl" : "ltr"); // Ensure Dhikr text direction is correct
}

/**
 * Initializes the application: loads preferences, sets up event listeners.
 */
function init() {
    // Load and apply dark mode preference from localStorage
    isDarkMode = localStorage.getItem("darkMode") === "true";
    applyDarkMode();

    // Load and apply language preferences from localStorage
    loadLang();

    // Display initial random Dhikr
    displayRandomDhikr();

    // Optional: Auto-change Dhikr every X seconds
    // clearInterval(dhikrInterval); // Clear any existing interval before setting a new one
    // dhikrInterval = setInterval(displayRandomDhikr, 10000); // Change every 10 seconds

    // Event listener for language toggle button
    langToggle.addEventListener("click", () => {
        // Toggle language between Arabic and English
        currentLang = (currentLang === "ar" ? "en" : "ar");
        localStorage.setItem("lang", currentLang); // Save new language preference
        loadLang(); // Reload UI with new language
        displayRandomDhikr(); // Display a new Dhikr relevant to the language
    });

    // Event listener for dark mode toggle button
    modeToggle.addEventListener("click", () => {
        isDarkMode = !isDarkMode; // Toggle the boolean state (true/false)
        applyDarkMode(); // Apply new dark mode state
    });

    // Event listener for the "Submit Attendance" button
    submitBtn.addEventListener("click", submitAttendance);

    // Event listener for the "New Dhikr" button (if visible)
    if (newDhikrBtn) {
        newDhikrBtn.addEventListener("click", displayRandomDhikr);
    }

    // Allow "Enter" key press in the name input field to submit attendance
    nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            submitAttendance();
        }
    });

    // Clear status message when user starts typing in the name input
    nameInput.addEventListener("input", hideMessage);

    // Set initial focus on the name input field for better user experience
    nameInput.focus();
}

// Start the application once the DOM (Document Object Model) is fully loaded
document.addEventListener("DOMContentLoaded", init);
