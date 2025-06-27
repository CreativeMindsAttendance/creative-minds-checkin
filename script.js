// Translations object (from config.js, ensure it's loaded before this script)
// const translations = {}; // This line should be in config.js or ensure config.js is loaded first.

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const submitBtn = document.getElementById('submitBtn');
    const adhkarMessage = document.getElementById('adhkarMessage');
    const statusMessage = document.getElementById('statusMessage');
    const langToggle = document.getElementById('lang-toggle');
    const langOptions = langToggle.querySelectorAll('.lang-option');
    const modeToggle = document.getElementById('mode-toggle');
    const toggleIcon = modeToggle.querySelector('.toggle-icon'); // Get the icon element
    const siteTitle = document.getElementById('site-title');
    const formTitle = document.getElementById('form-title');
    const dailyTipBtn = document.getElementById('dailyTipBtn');

    // Function to get a random Adhkar/Tip
    const getRandomAdhkar = () => {
        const currentLang = localStorage.getItem('language') || 'en';
        const adhkarList = translations[currentLang].adhkar || [];
        if (adhkarList.length > 0) {
            const randomIndex = Math.floor(Math.random() * adhkarList.length);
            return adhkarList[randomIndex];
        }
        return translations[currentLang].adhkarNotFound || "No Adhkar available.";
    };

    // Function to update text content based on current language
    const updateContent = (lang) => {
        siteTitle.textContent = translations[lang].siteTitle;
        formTitle.textContent = translations[lang].formTitle;
        nameInput.placeholder = translations[lang].inputPlaceholder;
        submitBtn.textContent = translations[lang].submitButton;
        dailyTipBtn.innerHTML = `${translations[lang].dailyTipButton} <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'><path d='M0 0h24v24H0z' fill='none'/><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/></svg>" class="star-icon">`;
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
        document.body.classList.toggle('ar', lang === 'ar');
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

        // Update the toggle icon based on dark mode state
        // The background-image for the icon is handled by CSS, we just need to ensure the class is correct
        // which is done by toggling 'dark-mode' on body.
    };

    // Load saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    modeToggle.addEventListener('click', toggleDarkMode);

    // Submit Button Event Listener
    submitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const currentLang = localStorage.getItem('language') || 'en';

        if (name) {
            statusMessage.textContent = ''; // Clear any previous status message
            adhkarMessage.textContent = translations[currentLang].adhkarLoading;
            
            // Simulate API call for Adhkar
            setTimeout(() => {
                try {
                    const adhkar = getRandomAdhkar();
                    adhkarMessage.textContent = adhkar;
                } catch (error) {
                    console.error("Error loading Adhkar:", error);
                    adhkarMessage.textContent = translations[currentLang].adhkarError;
                }
            }, 1000); // Simulate network delay
        } else {
            statusMessage.textContent = translations[currentLang].emptyNameError;
            adhkarMessage.textContent = ''; // Clear adhkar message if name is empty
        }
    });

    // Daily Tip Button Event Listener (Added from previous versions)
    dailyTipBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('language') || 'en';
        adhkarMessage.textContent = translations[currentLang].adhkarLoading;
        setTimeout(() => {
            try {
                const adhkar = getRandomAdhkar();
                adhkarMessage.textContent = adhkar;
            } catch (error) {
                console.error("Error loading daily tip:", error);
                adhkarMessage.textContent = translations[currentLang].adhkarError;
            }
        }, 1000);
    });
});

