# Real-Ones

# 🛡️ RealOnes: Behavioral Bot Detection System

**RealOnes** is a multi-layered, non-intrusive security framework designed to distinguish between human users and automated scripts (bots) without using annoying CAPTCHAs.

It leverages **Behavioral Biometrics** (Mouse Dynamics & Keystroke Rhythm) combined with **Environmental Fingerprinting** to create a "Defense-in-Depth" architecture. The system includes a real-time **Security Operations Center (SOC) Dashboard** for monitoring threats.

---

## 🏗 Project Architecture

The system is built on a decoupled architecture separating data collection, analysis, and visualization.

* **Frontend (React + Vite):**
* **`useBehaviorTracking` Hook:** Custom hook that records mouse coordinates `(x, y, timestamp)`, click dwell times, and keystroke flight times at 60fps.
* **Traps:** Invisible DOM elements and sensors to detect non-human execution environments.


* **Backend (Flask + Python):**
* **Feature Extraction:** Converts raw raw biometric arrays into statistical features (Efficiency, Curvature, Jitter).
* **Inference Engine:** Runs a pre-trained **Random Forest Classifier** (`model.pkl`).
* **Logger:** Asynchronous logging to SQLite for the Admin Dashboard.


* **Database (SQLite):**
* Stores `login_attempts` with full forensic data (Raw mouse paths, trigger sources, timestamps) for replay and analysis.



---

## 🛡️ The Defense Layers

RealOnes uses a funnel approach. Fast, cheap checks run first; complex ML runs last.

### Layer 1: Environmental Pre-Checks (The Physics)

These checks detect if the "User" is actually a script running in a non-human environment.

* **👻 The Ghost Window Check:** Detects **Headless Browsers**.
* *Logic:* Humans use monitors. If `window.outerWidth === 0` or dimensions are impossible (e.g., larger than screen), it is a bot.


* **🧛 The Vampire Check:** Detects **Background Scripts**.
* *Logic:* Humans must see the page to click. If `document.visibilityState === 'hidden'` when the login event fires, the script is running in a background tab.


* **🍯 The Honeypot:** Detects **DOM Scrapers**.
* *Logic:* An invisible input field (`middle_name`) is placed in the DOM. Humans can't see it; Bots scan the HTML and fill it. If filled, immediate block.



### Layer 2: Heuristic Traps (The Logic)

These checks detect impossible human behavior without needing AI.

* **🔮 The Telepathy/Statue Check:** Detects **Script Injection**.
* *Logic:* If the "Name" field is filled but **0 keystrokes** were recorded, or the Login button is clicked with **0 mouse movements**, the user "teleported" data via JavaScript (`document.value = ...`).


* **⚡ The Speed Trap:** Detects **Superhuman Speed**.
* *Logic:* If the entire form is filled and submitted in `< 2.5 seconds`, it is physically impossible for a human.



### Layer 3: Machine Learning Model (The Brain)

If a user passes all above checks, their behavioral data is sent to the Random Forest Model.

* **Input:** Array of Mouse Paths `[[x,y,t]...]` and Keystrokes.
* **Key Features Calculated:**
1. **Path Efficiency:** Straight line vs. Human curve. (Bots are perfectly efficient; Humans are not).
2. **Curvature Sum:** The total angular change of the movement.
3. **Speed Variance:** Humans accelerate and decelerate (Fitts' Law); Bots often move at constant speed.
4. **Flight Time:** Average time between key presses.



---

## 🤖 Bot Taxonomy (The "Zoo")

This project includes a suite of attack scripts to test the defense layers.

| Bot Name | Script File | Attack Strategy | Detection Method |
| --- | --- | --- | --- |
| **The Linear Bot** | `bot_linear.py` | Uses Selenium to move the mouse to coordinates. Moves in perfectly straight lines. | **ML Model** (High Efficiency, Low Curvature). |
| **The Teleport Bot** | `bot_teleport.py` | Uses JavaScript Injection to fill fields instantly without using the keyboard or mouse. | **Statue Check** (Zero Event Logs). |
| **The Greedy Bot** | `bot_honeypot.py` | Scrapes the entire DOM and fills every input field found, including hidden ones. | **Honeypot Trap** (Middle Name filled). |
| **The Ghost Bot** | `bot_ghost.py` | Runs in Headless mode (no UI) or manipulates window size to 0x0 to save resources. | **Ghost Window Check** (Dimensions). |
| **The Vampire Bot** | `bot_vampire.py` | Waits for a timer and triggers the login click while the tab is in the background. | **Vampire Check** (Visibility API). |

---

## 📊 Admin Dashboard & Analytics

The project features a **Security Operations Center (SOC)** dashboard accessible at `/admin`.

**Key Modules:**

1. **Live Threat Feed:** Real-time ticker showing blocked attempts with Confidence Scores and Attack Vectors.
2. **Cron Job Detector (Heatmap):** Visualizes attack density by hour (IST adjusted). Helps identify automated scripts running on scheduled timers (e.g., spikes at 3:00 AM).
3. **Attack Funnel:** Visualizes defense efficiency. Shows how many bots are stopped by cheap Frontend Traps vs. the expensive ML Model.
4. **Bot Classification (The Zoo):** Breakdown of bot types (Ghosts vs. Statues vs. Mimics).
5. **Traffic Volume:** Comparative area chart of Human vs. Bot traffic over time.

---
