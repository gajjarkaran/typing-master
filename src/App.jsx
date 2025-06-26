import React, { useState } from "react";
import TypingTest from "./TypingTest";
import { FiHash, FiPercent, FiClock, FiType, FiMessageCircle, FiWind, FiEdit3, FiChevronDown } from "react-icons/fi";
import "./App.scss";

const DURATIONS = [15, 30, 60, 120];
const WORD_COUNTS = [10, 25, 50, 100];

const MODES = [
  { key: "time", icon: <FiClock />, aria: "Time mode", title: "Time mode", label: "Time" },
  { key: "words", icon: <FiType />, aria: "Words mode", title: "Words mode", label: "Words" },
  { key: "quote", icon: <FiMessageCircle />, aria: "Quote mode", title: "Quote mode", label: "Quote" },
  { key: "zen", icon: <FiWind />, aria: "Zen mode", title: "Zen mode", label: "Zen" },
  { key: "custom", icon: <FiEdit3 />, aria: "Custom mode", title: "Custom mode", label: "Custom" },
];

const QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "Simplicity is the ultimate sophistication.",
  "Stay hungry, stay foolish.",
];

const THEMES = [
  { name: "blueberry dark", class: "theme-blueberry", description: "Professional blue-gray" },
  { name: "dracula", class: "theme-dracula", description: "Vibrant purple theme" },
  { name: "solarized light", class: "theme-solarized", description: "Gentle cream theme" },
  { name: "github light", class: "theme-github", description: "Clean white theme" },
];

export default function App() {
  const [duration, setDuration] = useState(60);
  const [wordCount, setWordCount] = useState(25);
  const [mode, setMode] = useState("time");
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [customText, setCustomText] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(QUOTES[0]);
  const [currentTheme, setCurrentTheme] = useState(0);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // When switching to quote mode, pick a random quote
  React.useEffect(() => {
    if (mode === "quote") {
      setSelectedQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }
  }, [mode]);

  // Reset punctuation and numbers when entering quote, zen, or custom mode
  React.useEffect(() => {
    if (["quote", "zen", "custom"].includes(mode)) {
      setPunctuation(false);
      setNumbers(false);
    }
  }, [mode]);

  // When switching away from custom, clear custom text
  React.useEffect(() => {
    if (mode !== "custom") setCustomText("");
  }, [mode]);

  const selectTheme = (themeIndex) => {
    setCurrentTheme(themeIndex);
    setThemeDropdownOpen(false);
  };

  const toggleThemeDropdown = () => {
    setThemeDropdownOpen(!themeDropdownOpen);
  };

  return (
    <div className={`app-container ${THEMES[currentTheme].class}`}>
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Typing Master Ultra Pro Max</h1>
        <div className="settings-bar with-labels">
          <div className="settings-icon-label">
            <button
              className={`settings-btn${punctuation ? " active" : ""}`}
              onClick={() => setPunctuation((p) => !p)}
              disabled={mode === "quote" || mode === "zen" || mode === "custom"}
              aria-label="Toggle punctuation"
              title="Toggle punctuation"
            >
              <FiPercent />
            </button>
            <span className="settings-label">Punctuation</span>
          </div>
          <div className="settings-icon-label">
            <button
              className={`settings-btn${numbers ? " active" : ""}`}
              onClick={() => setNumbers((n) => !n)}
              disabled={mode === "quote" || mode === "zen" || mode === "custom"}
              aria-label="Toggle numbers"
              title="Toggle numbers"
            >
              <FiHash />
            </button>
            <span className="settings-label">Numbers</span>
          </div>
          {MODES.map((m) => (
            <div className="settings-icon-label" key={m.key}>
              <button
                className={`settings-btn${mode === m.key ? " active" : ""}`}
                onClick={() => setMode(m.key)}
                aria-label={m.aria}
                title={m.title}
              >
                {m.icon}
              </button>
              <span className="settings-label">{m.label}</span>
            </div>
          ))}
        </div>
        {/* Timer/WordCount controls only for time/words mode */}
        {mode === "time" && (
          <div className="timer-bar">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`timer-btn${duration === d ? " active" : ""}`}
                onClick={() => setDuration(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}
        {mode === "words" && (
          <div className="timer-bar">
            {WORD_COUNTS.map((c) => (
              <button
                key={c}
                className={`timer-btn${wordCount === c ? " active" : ""}`}
                onClick={() => setWordCount(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {/* Custom text input for custom mode */}
        {mode === "custom" && (
          <div className="custom-input-bar">
            <textarea
              className="custom-textarea"
              placeholder="Enter your custom text here..."
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </header>

      {/* Typing Test Area */}
      <main className="main-content">
        <TypingTest
          mode={mode}
          duration={duration}
          wordCount={wordCount}
          punctuation={punctuation}
          numbers={numbers}
          quote={mode === "quote" ? selectedQuote : undefined}
          customText={mode === "custom" ? customText : undefined}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="theme-selector">
            <button className="theme-toggle-btn" onClick={toggleThemeDropdown}>
              {THEMES[currentTheme].name}
              <FiChevronDown className={`dropdown-icon ${themeDropdownOpen ? 'open' : ''}`} />
            </button>
            {themeDropdownOpen && (
              <div className="theme-dropdown">
                {THEMES.map((theme, index) => (
                  <button
                    key={theme.class}
                    className={`theme-option ${currentTheme === index ? 'active' : ''}`}
                    onClick={() => selectTheme(index)}
                  >
                    <span className="theme-name">{theme.name}</span>
                    <span className="theme-description">{theme.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="developer-info">
            v0.1.0 : vibe coded by karangajjar_
          </div>
        </div>
      </footer>
    </div>
  );
}
