document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const submitBtn = document.getElementById('submitBtn');
    const adhkarMessage = document.getElementById('adhkarMessage');
    const statusMessage = document.getElementById('statusMessage');
    const langToggle = document.getElementById('lang-toggle');
    const langOptions = langToggle.querySelectorAll('.lang-option');
    const modeToggle = document.getElementById('mode-toggle');
    const siteTitle = document.getElementById('site-title');
    const formTitle = document.getElementById('form-title');

    // Function to get a random Adhkar/Tip
    const getRandomAdhkar = () => {
        const currentLang = localStorage.getItem('language') || 'en';
        // Use the adhkar array from the translations object
        const adhkarList = window.translations[currentLang].adhkar || [];
        if (adhkarList.length > 0) {
            const randomIndex = Math.floor(Math.random() * adhkarList.length);
            return adhkarList[randomIndex];
        }
        return window.translations[currentLang].adhkarNotFound || "No Adhkar available.";
    };

    // Function to update text content based on current language
    const updateContent = (lang) => {
        // Site title "Creative Minds" is intentionally hardcoded in HTML/CSS to always be English,
        // so we don't translate it here.
        formTitle.textContent = window.translations[lang].formTitle;
        nameInput.placeholder = window.translations[lang].inputPlaceholder;
        submitBtn.textContent = window.translations[lang].submitButton;
        // dailyTipBtn.innerHTML = `${window.translations[lang].dailyTipButton} <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M0 0h24v24H0z' fill='none'/><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/></svg>" class="star-icon">`; // If daily tip button is re-added
        statusMessage.textContent = ''; // Clear status message on language change
        adhkarMessage.textContent = ''; // Clear adhkar message on language change

        // Update active language option
        langOptions.forEach(option => {
            if (option.dataset.lang === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Update slider position for language toggle
        langToggle.dataset.activeLang = lang;
        
        // Set body direction based on language
        document.body.dir = (lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = lang; // Set lang attribute on <html> tag
    };

    // Load saved language or default to English
    const savedLang = localStorage.getItem('language') || 'en';
    updateContent(savedLang);

    // Language Toggle Event Listener
    langToggle.addEventListener('click', () => {
        const currentLang = langToggle.dataset.activeLang;
        const newLang = currentLang === 'en' ? 'ar' : 'en';
        localStorage.setItem('language', newLang);
        updateContent(newLang);
    });

    // Dark Mode Toggle
    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        // Update the toggle icon's position
        modeToggle.classList.toggle('active', isDarkMode);
    };

    // Load saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.classList.add('active'); // Set active class for correct icon position
    }

    modeToggle.addEventListener('click', toggleDarkMode);

    // Submit Button Event Listener
    submitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const currentLang = localStorage.getItem('language') || 'en';

        if (name) {
            statusMessage.textContent = ''; // Clear any previous status message
            statusMessage.classList.remove('success', 'error', 'warning', 'info'); // Clear previous classes
            adhkarMessage.textContent = window.translations[currentLang].adhkarLoading;
            adhkarMessage.classList.add('info', 'show'); // Show loading message with info style

            // Simulate API call for Adhkar
            setTimeout(() => {
                try {
                    const adhkar = getRandomAdhkar();
                    adhkarMessage.textContent = adhkar;
                    adhkarMessage.classList.remove('info');
                    adhkarMessage.classList.add('success'); // Assume success if adhkar is loaded
                } catch (error) {
                    console.error("Error loading Adhkar:", error);
                    adhkarMessage.textContent = window.translations[currentLang].adhkarError;
                    adhkarMessage.classList.remove('success');
                    adhkarMessage.classList.add('error');
                }
            }, 1000); // Simulate network delay
        } else {
            statusMessage.textContent = window.translations[currentLang].emptyNameError;
            statusMessage.classList.add('warning', 'show'); // Show warning message
            adhkarMessage.textContent = ''; // Clear adhkar message if name is empty
            adhkarMessage.classList.remove('success', 'error', 'info', 'show');
        }
    });

    // Daily Tip Button Event Listener (commented out as button is removed from HTML)
    /*
    if (dailyTipBtn) {
        dailyTipBtn.addEventListener('click', () => {
            const currentLang = localStorage.getItem('language') || 'en';
            adhkarMessage.textContent = window.translations[currentLang].adhkarLoading;
            adhkarMessage.classList.add('info', 'show');
            setTimeout(() => {
                try {
                    const adhkar = getRandomAdhkar();
                    adhkarMessage.textContent = adhkar;
                    adhkarMessage.classList.remove('info');
                    adhkarMessage.classList.add('success');
                } catch (error) {
                    console.error("Error loading daily tip:", error);
                    adhkarMessage.textContent = window.translations[currentLang].adhkarError;
                    adhkarMessage.classList.remove('success');
                    adhkarMessage.classList.add('error');
                }
            }, 1000);
        });
    }
    */
});
