import React, { useState, useEffect, useRef } from "react";
import { FiRotateCcw } from "react-icons/fi";
import "./TypingTest.scss";

const BASE_WORDS = [
    "never", "and", "order", "present", "group", "from", "course", "hold", "or", "good",
    "just", "world", "must", "all", "another", "thing", "into", "person", "plan", "own",
    "the", "down", "then", "face", "work", "in", "life", "too"
];
const PUNCTUATION = [".", ",", "?", "!", ":", ";", "'", '"', "-", "(", ")"];
const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function getWordPool({ punctuation, numbers }) {
    let pool = [...BASE_WORDS];
    if (punctuation) pool = pool.concat(PUNCTUATION);
    if (numbers) pool = pool.concat(NUMBERS);
    return pool;
}

function getRandomWords(count, options) {
    const pool = getWordPool(options);
    return Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]);
}

export default function TypingTest({ mode = "time", duration = 60, wordCount = 25, punctuation = false, numbers = false, quote, customText, onTestEnd }) {
    function getInitialWords() {
        if (mode === "quote" && quote) return quote.split(" ");
        if (mode === "custom" && customText) return customText.trim().split(/\s+/);
        if (mode === "words") return getRandomWords(wordCount, { punctuation, numbers });
        if (mode === "zen") return getRandomWords(100, { punctuation, numbers });
        return getRandomWords(50, { punctuation, numbers });
    }

    const [words, setWords] = useState(getInitialWords);
    const [input, setInput] = useState("");
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [timer, setTimer] = useState(duration);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);
    const [correctEntries, setCorrectEntries] = useState(0);
    const [incorrectEntries, setIncorrectEntries] = useState(0);
    const containerRef = useRef(null);
    const [caretPos, setCaretPos] = useState(0);

    // Start timer when typing starts (time mode)
    useEffect(() => {
        if (!started || finished || mode !== "time") return;
        if (timer === 0) {
            setFinished(true);
            onTestEnd && onTestEnd({ correctEntries, incorrectEntries, total: currentWordIdx });
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [started, timer, finished, mode]);

    // Focus container on mount
    useEffect(() => {
        if (containerRef.current) containerRef.current.focus();
    }, []);

    // Reset when options change
    useEffect(() => {
        setWords(getInitialWords());
        setInput("");
        setCurrentWordIdx(0);
        setTimer(duration);
        setStarted(false);
        setFinished(false);
        setCorrectEntries(0);
        setIncorrectEntries(0);
        setCaretPos(0);
    }, [duration, wordCount, punctuation, numbers, mode, quote, customText]);

    // Keyboard input handler
    function handleKeyDown(e) {
        if (finished && mode !== "zen") return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (!started) setStarted(true);
        if (e.key === "Tab") {
            e.preventDefault();
            restartTest();
            return;
        }
        if (e.key === "Backspace") {
            if (input.length > 0) {
                setInput(input.slice(0, -1));
                setCaretPos(Math.max(0, caretPos - 1));
            }
            return;
        }
        if (e.key === " " || e.key === "Spacebar") {
            // On space, check word
            const trimmed = input.trim();
            if (trimmed === words[currentWordIdx]) {
                setCorrectEntries((c) => c + 1);
            } else {
                setIncorrectEntries((c) => c + 1);
            }
            setCurrentWordIdx((idx) => idx + 1);
            setInput("");
            setCaretPos(0);
            return;
        }
        if (e.key.length === 1) {
            setInput(input + e.key);
            setCaretPos(caretPos + 1);
        }
    }

    // End test in words/quote/custom mode when all words are typed
    useEffect(() => {
        if ((mode === "words" || mode === "quote" || (mode === "custom" && customText)) && currentWordIdx >= words.length && !finished) {
            setFinished(true);
            onTestEnd && onTestEnd({ correctEntries, incorrectEntries, total: currentWordIdx });
        }
    }, [mode, currentWordIdx, words.length, finished, correctEntries, incorrectEntries, onTestEnd, customText]);

    function restartTest() {
        setWords(getInitialWords());
        setInput("");
        setCurrentWordIdx(0);
        setTimer(duration);
        setStarted(false);
        setFinished(false);
        setCorrectEntries(0);
        setIncorrectEntries(0);
        setCaretPos(0);
        if (containerRef.current) containerRef.current.focus();
    }

    // Zen mode: infinite words, never finish
    useEffect(() => {
        if (mode === "zen" && currentWordIdx >= words.length - 10) {
            setWords((prev) => [...prev, ...getRandomWords(50, { punctuation, numbers })]);
        }
    }, [mode, currentWordIdx, words.length, punctuation, numbers]);

    // Calculate stats
    const timeElapsed = mode === "time" ? duration - timer : (started ? (currentWordIdx / correctEntries) * 60 : 1);
    const wpm = mode === "time"
        ? Math.round((correctEntries / (duration - timer || 1)) * 60)
        : Math.round((correctEntries / (timeElapsed || 1)) * 60);
    const accuracy = correctEntries + incorrectEntries === 0 ? 100 : Math.round((correctEntries / (correctEntries + incorrectEntries)) * 100);

    // Render caret
    function renderCaret(idx) {
        return <span className="typing-caret" key={"caret-" + idx} />;
    }

    return (
        <div
            className="typing-test-container"
            tabIndex={0}
            ref={containerRef}
            onKeyDown={handleKeyDown}
        >
            <div className="typing-test-header">
                {mode === "time" && <div className="typing-timer">Time: {timer}s</div>}
                {mode === "words" && <div className="typing-timer">Words: {currentWordIdx}/{words.length}</div>}
                {mode === "quote" && <div className="typing-timer">Quote Mode</div>}
                {mode === "custom" && <div className="typing-timer">Custom Mode</div>}
                {mode === "zen" && <div className="typing-timer">Zen Mode</div>}
                <button onClick={restartTest} className="typing-restart-btn">
                    <FiRotateCcw />
                </button>
            </div>
            <div className="typing-words">
                {words.map((word, idx) => {
                    let className = "typing-word";
                    if (idx < currentWordIdx) className += " completed";
                    if (idx === currentWordIdx) {
                        // Per-letter coloring for current word, with caret
                        return (
                            <span key={idx} className={className}>
                                {word.split("").map((char, i) => {
                                    let letterClass = "";
                                    if (input.length > i) {
                                        letterClass = input[i] === char ? "correct-letter" : "incorrect-letter";
                                    }
                                    // Render caret at the current position
                                    if (i === caretPos) {
                                        return [renderCaret(i), <span key={i} className={letterClass}>{char}</span>];
                                    }
                                    return <span key={i} className={letterClass}>{char}</span>;
                                })}
                                {/* Caret at end if needed */}
                                {caretPos === word.length && renderCaret("end")}
                                {/* Extra letters typed by user */}
                                {input.length > word.length && input.slice(word.length).split("").map((char, i) => (
                                    <span key={word.length + i} className="incorrect-letter">{char}</span>
                                ))}
                            </span>
                        );
                    }
                    return <span key={idx} className={className}>{word}</span>;
                })}
            </div>
            {finished && mode !== "zen" && (
                <div className="typing-results">
                    <div className="results-title">Results</div>
                    <div className="results-wpm">WPM: <span>{wpm}</span></div>
                    <div className="results-accuracy">Accuracy: <span>{accuracy}%</span></div>
                    <div className="results-correct">Correct: <span>{correctEntries}</span></div>
                    <div className="results-incorrect">Incorrect: <span>{incorrectEntries}</span></div>
                </div>
            )}
        </div>
    );
} 