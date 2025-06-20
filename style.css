/* === الأساسيات === */
body {
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center; /* ← يوسّط كل شيء على محور X */
  height: 100vh;
  margin: 0;
  padding: 0;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dark {
  background-color: #1c1c1e;
  color: #f2f2f2;
}

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.container {
  max-width: 400px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2xl;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.dark .container {
  background: rgba(28, 28, 30, 0.85);
}

.logo {
  width: 80px;
  height: auto;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
}

#nameInput {
  width: 100%;
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  outline: none;
  margin-bottom: 1rem;
  transition: border-color 0.2s;
  direction: ltr;
  text-align: center;
}

input[type="text"]:focus {
  border-color: #007aff;
}

button {
  padding: 0.8rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 9999px;
  background-color: #007aff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

button:hover {
  background-color: #005ecb;
  transform: scale(1.05);
}

#statusMessage {
  margin-top: 1rem;
  min-height: 1.5rem;
  font-weight: 500;
}

/* === زر اللغة و الوضع الليلي === */
.top-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* === الفوتر === */
footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 1.3rem;
  direction: ltr !important;
  width: max-content;
  margin-bottom: 10px;
}

/* === زر اللغة === */
#lang-toggle {
  width: 60px;
  height: 30px;
  background-color: #e5e5ea;
  border: none;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

#lang-toggle::before {
  content: "";
  position: absolute;
  width: 26px;
  height: 26px;
  top: 2px;
  left: 2px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

#lang-toggle.active::before {
  transform: translateX(30px);
}

#lang-toggle::after {
  content: attr(data-label);
  position: absolute;
  top: 5px;
  left: 34px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #333;
  transition: opacity 0.3s ease;
}

.dark #lang-toggle {
  background-color: #333;
}

.dark #lang-toggle::after {
  color: #f2f2f2;
}

/* === زر الوضع الليلي الجديد === */
#mode-toggle {
  width: 60px;
  height: 30px;
  border: none;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: background 0.4s ease-in-out;
  background: linear-gradient(135deg, #a1c4fd, #c2e9fb);
}

.dark #mode-toggle {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
}

#mode-toggle::before {
  content: "☀️";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  transition: transform 0.4s ease-in-out, background-color 0.4s;
  z-index: 2;
}

.dark #mode-toggle::before {
  content: "🌙";
  transform: translateX(30px);
}

#mode-toggle::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(white 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
  z-index: 1;
}

.dark #mode-toggle::after {
  opacity: 0.3;
}

/* Media Query للجوال */
@media (max-width: 480px) {
  .container {
    margin: 60px auto;
    padding: 1.5rem;
  }
}
