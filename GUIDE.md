# FRONTEND

1. **"Whole Session" Recording:**
* From the moment the page loads, the script starts listening.
* It uses `document.addEventListener`, which means it captures **every** mouse move or key press anywhere on the page, not just inside the text boxes.

2. **"Put in Array":**
* Every single event is immediately pushed into one of three lists (arrays) that sit in the browser's memory:
* `mousePath` (accumulates thousands of `[x, y, time]` points).
* `clickTimestamps` (accumulates times).
* `keystrokeTimestamps` (accumulates times).

3. **"Sent when Click happens":**
* The browser waits passively until you hit the **"Verify & Login"** button.
* Only **then** does the `btn.addEventListener('click', ...)` function run.
* It takes a **snapshot** of those arrays at that exact moment, packages them into a JSON `payload`, and fires the `fetch` command to send it to Python.

So, the Python backend doesn't know you exist until you click that button. Until then, the browser is just silently taking notes.

This `index.html` file acts as the **Sensor**. While it looks like a simple login page to the user, it is silently recording their physical behavior in the background.

Here is the breakdown of exactly **what** metrics are being traced and **which lines** do the work.

### 1. The Sensors (The Spy Code)

This section captures the raw data. It doesn't calculate anything (no math here); it just records timestamps and coordinates to send to Python later.

#### **A. Mouse Movement (Tracing the Path)**

* **What is traced:** The X coordinate, Y coordinate, and the exact Time (in milliseconds) every time the mouse moves.
* **Why?** To calculate **Speed**, **Efficiency** (straight vs. wobbly lines), and **Curvature**.
* **The Code (Lines 47–55):**
```javascript
// Listener A: Track Mouse Movement
document.addEventListener('mousemove', (e) => {
    mousePath.push([
        e.clientX,  // Where is the mouse horizontally?
        e.clientY,  // Where is the mouse vertically?
        Date.now()  // Exact time (ms)
    ]);
});

```



#### **B. Click Mechanics (Tracing "Dwell Time")**

* **What is traced:** The exact millisecond you press the button down (`mousedown`) and the exact millisecond you let go (`mouseup`).
* **Why?** To calculate **Click Dwell Time**.
* *Human:* Presses down, holds for ~100ms, lets go.
* *Bot:* often has 0ms difference (mechanical switch).


* **The Code (Lines 58–59):**
```javascript
// Listener B: Track Clicks
document.addEventListener('mousedown', () => clickTimestamps.push(Date.now()));
document.addEventListener('mouseup', () => clickTimestamps.push(Date.now()));

```



#### **C. Typing Rhythm (Tracing "Flight Time")**

* **What is traced:** The timestamp of every key press on the keyboard.
* **Why?** To calculate **Typing Flight Time** (the gap between keys).
* *Human:* Has a rhythm (e.g., 100ms... 120ms... 90ms).
* *Bot:* Instant paste (0ms gap) or perfect timing (exactly 50ms every time).


* **The Code (Line 62):**
```javascript
// Listener C: Track Typing Speed
document.addEventListener('keydown', () => keystrokeTimestamps.push(Date.now()));

```



---

### 2. The Packaging (Preparing for Python)

When the user clicks "Verify & Login," the code stops recording and packages the data into a single parcel (JSON object) to ship to the backend.

* **The Code (Lines 73–77):**
```javascript
const payload = {
    mouse_path: mousePath,                   // The array of [x, y, t]
    click_timestamps: clickTimestamps,       // The array of click times
    keystroke_timestamps: keystrokeTimestamps // The array of typing times
};

```



---

### 3. The Transmission (Talking to Flask)

This is the bridge. JavaScript uses the `fetch` command to send that `payload` to your Python `app.py`.

* **The Code (Lines 81–85):**
```javascript
const response = await fetch('http://127.0.0.1:5000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload) // Converts the JS object to text
});

```


* **`http://127.0.0.1:5000/predict`**: This matches the `@app.route('/predict')` line in your `app.py`.



### Summary Table

| Metric | HTML/JS Variable | Python Feature (in `app.py`) |
| --- | --- | --- |
| **Cursor Position** | `e.clientX`, `e.clientY` | `path_efficiency`, `curvature_sum` |
| **Movement Speed** | `Date.now()` (in mousemove) | `movement_time`, `speed_variance` |
| **Clicking** | `mousedown`, `mouseup` | `click_dwell` |
| **Typing** | `keydown` | `typing_flight_avg` |

# BACKEND

This `app.py` is the **Central Nervous System** of your project. It acts as the bridge between the user's browser (frontend) and your trained AI model.

Here is the step-by-step breakdown of what happens inside this code:

### 1. Setup & Imports (Lines 1–9)

This section sets up the server and imports the necessary tools.

* **`Flask`**: Creates the web server.
* **`CORS(app)`**: **Crucial.** This allows your HTML file (which runs on a browser) to send data to this Python script without getting blocked by security rules.
* **`joblib`**: This is the tool used to load your saved "brain" (`model.pkl`).
* **`numpy`**: The heavy lifter for all the math calculations.

### 2. Loading the Brain (Lines 11–14)

```python
model = joblib.load('model.pkl')

```

* **What it does:** When you start the app, it immediately loads your pre-trained **Random Forest** model into memory.
* **Why:** We load it *once* at the start so that when a user clicks login, the prediction happens instantly (milliseconds) without needing to reload the file every time.

---

### 3. The Math Engine: `extract_features` (Lines 17–75)

This is the most important function. It translates raw **physics** (coordinates and time) into **metrics** the AI can understand.

It receives raw data: `mouse_path` (List of X, Y, Time), `click_timestamps`, and `keystroke_timestamps`.

#### **A. Mouse Features (Lines 29–60)**

This checks *how* the mouse moved.

1. **`movement_time`**: (Line 38)
* *Formula:* `End Time - Start Time`.
* *Logic:* If this is extremely small (near 0), it's a **Teleport Bot**.


2. **`speed_variance`** (Lines 41–45):
* *Formula:* Standard Deviation of speeds.
* *Logic:* Humans accelerate and decelerate (high variance). Bots often move at a constant perfect speed (0 variance).


3. **`path_efficiency`** (Lines 48–50):
* *Formula:* `Straight Line Distance / Total Distance Traveled`.
* *Logic:*
* **1.0:** Perfect straight line (**Linear Bot**).
* **< 1.0:** Wobbly path (**Human**).




4. **`curvature_sum`** (Lines 53–60):
* *Formula:* Sum of angles between movement segments.
* *Logic:* Humans move in arcs (high curvature). Linear bots move straight (0 curvature).



#### **B. Click Features (Lines 63–67)**

* **`click_dwell`**:
* *Formula:* `MouseUp Time - MouseDown Time`.
* *Logic:* Humans hold the click for ~100ms. Bots click instantly (0–5ms).



#### **C. Typing Features (Lines 71–76)**

* **`typing_flight_avg`**:
* *Formula:* Average time between key presses.
* *Logic:* Humans have a rhythm. Bots paste text instantly (0ms gap).



---

### 4. The Decision Maker: `/predict` (Lines 79–106)

This is the "Door" that the frontend knocks on.

1. **`raw_data = request.json`**: It grabs the JSON package sent by your `index.html`.
2. **`features = extract_features(raw_data)`**: It runs the math engine above to get the "6 Golden Numbers."
3. **`model.predict([features])`**:
* The model looks at the 6 numbers and votes: **0 (Human)** or **1 (Bot)**.


4. **`model.predict_proba(...)`**:
* It asks the model: "How sure are you?" (e.g., 99.5% sure).


5. **`jsonify(result)`**:
* It packages the verdict back into JSON to send to the browser so the `alert()` can pop up.



### Summary Flow

1. **Frontend** sends Raw Data (lists of numbers).
2. **App.py** calculates Physics (Speed, Curves, Efficiency).
3. **Model.pkl** judges the Physics (Human vs. Bot).
4. **App.py** replies with a Verdict.



# BOTS 
Based on the code in the three bot files, here is the character profile for each of your "attackers." I have broken them down by their **Strategy**, **How they Code it**, and **Why they get caught**.

### 1. The "Teleport" Bot (`bot_teleport.py`)

This is the laziest but fastest bot. It doesn't even try to use the mouse; it cheats by injecting code directly into the browser.

* **Behavior:** It instantly fills the text boxes and clicks the login button without moving the cursor pixel.
* **The Code:**
* Instead of `send_keys` (typing), it uses JavaScript execution: `driver.execute_script("document.getElementById('aadhar').value = '...'")`.
* Instead of `click()`, it uses `driver.execute_script("...click();")`.


* **How it gets caught:**
* **Movement Time = 0:** Since no `mousemove` events are fired, your `app.py` sees an empty array or a time difference of 0.
* **Verdict:** The model sees this as "Impossible Physics" and flags it instantly.



### 2. The "Linear" Bot (`bot_linear.py`)

This bot tries to play by the rules (it actually moves the mouse), but it is too perfect. It moves like a machine.

* **Behavior:** It slides the mouse from the OTP box to the Login button in a perfectly straight line.
* **The Code:**
* It uses **Linear Interpolation**. It calculates 50 steps between Start (A) and End (B).
* *The Math:* `curr_x = start_x + (end_x - start_x) * t`. This is the definition of a straight line equation.
* *The Timing:* It waits exactly `0.01` seconds (10ms) between every step.


* **How it gets caught:**
* **Path Efficiency = 1.0:** Humans cannot draw straight lines. We wobble. This bot's efficiency is mathematically perfect (1.0).
* **Speed Variance = 0:** It moves at a constant speed. Humans accelerate at the start and slow down (decelerate) before clicking (Fitts' Law).



### 3. The "Smart" Bot (`bot_smart.py`)

This is your most dangerous enemy. It knows how the detection system works and tries to trick it.

* **Behavior:** It moves in a curve (arc) and shakes its hand (adds noise) to look human.
* **The Code:**
* *The Curve:* It uses a Sine Wave to create an arc: `curve_offset = 50 * math.sin(t * math.pi)`.
* *The Jitter:* It adds random noise to every point: `random.uniform(-2, 2)`. This mimics a human hand trembling.


* **How it gets caught:**
* **It's still too smooth:** Even with the `random.uniform` noise, the underlying math is a perfect Sine Wave. Human curvature is irregular; this bot's curvature is mathematically predictable.
* **Rhythm:** The `time.sleep(0.02)` is constant. Real humans vary their speed significantly (fast in the middle, slow at the end). Your `speed_variance` feature likely catches this consistency.



### Summary of the lineup

| Bot Name | Strategy | Key Weakness |
| --- | --- | --- |
| **Teleport** | JavaScript Injection | **No Movement Data** (Time = 0) |
| **Linear** | Straight Line Path | **Perfect Efficiency** (Efficiency = 1.0) |
| **Smart** | Sine Wave + Jitter | **Predictable Speed/Curve** (Low Speed Variance) |

# MODEL

Based on the `3jan-trained-model.ipynb` notebook you uploaded, here is the deep dive into the "Brain" of your project.

You are using a **Random Forest Classifier**. Think of this not as one single smart brain, but as a **parliament of 100 judges** (decision trees) that vote on whether a user is a human or a bot.

### 1. The Algorithm: Why Random Forest?

Your code initializes the model with this line:

```python
model = RandomForestClassifier(n_estimators=100, random_state=42)

```

* **`n_estimators=100`**: This means you created **100 Decision Trees**.
* **How it works:**
* Tree #1 might look at "Speed Variance" and say: "Too steady -> **BOT**".
* Tree #2 might look at "Click Dwell" and say: "Too fast -> **BOT**".
* Tree #3 might look at "Curvature" and say: "Wobbly path -> **HUMAN**".
* **Final Verdict:** If 95 trees say BOT and 5 say HUMAN, the model outputs **BOT** with **95% Confidence**.



---

### 2. The "Bot Killers" (Feature Importance)

The most important part of your notebook is the **Feature Importance** chart. This tells you exactly *what* gave the bots away. According to your training results, these are the top 3 clues:

#### **#1. Click Dwell Time (~33% Importance)**

* **The Logic:** Humans naturally hold the mouse button down for about 80ms–150ms. It's physical; a finger takes time to press and release.
* **The Catch:** Your bots (especially Teleport and Linear) often click instantly (0–5ms).
* **The Rule:** If `click_dwell < 10ms` → **IMMEDIATE BOT FLAG**.

#### **#2. Typing Flight Time (~32% Importance)**

* **The Logic:** "Flight time" is the milliseconds between two keystrokes. Humans have a rhythm (e.g., 100ms gap).
* **The Catch:** Bots "paste" text, meaning the gap between keys is 0ms.
* **The Rule:** If `typing_flight_avg < 10ms` → **IMMEDIATE BOT FLAG**.

#### **#3. Curvature Sum (~19% Importance)**

* **The Logic:** This measures how much the mouse path "bends." Humans rarely move in straight lines; we arc our hands.
* **The Catch:**
* **Linear Bots** have `curvature = 0` (Straight line).
* **Teleport Bots** have no path.


* **The Rule:** If `curvature_sum is extremely low` → **BOT**.

---

### 3. The "Confidence" Score

Your notebook calculates a probability, not just a yes/no:

```python
probs = model.predict_proba([features])[0]
bot_probability = probs[1]

```

* **What this means:** This is the percentage of the 100 trees that voted "Bot".
* **Why it matters:**
* A **Linear Bot** is obvious: 100/100 trees vote Bot (100% Confidence).
* A **Smart Bot** (the mimic) is harder: Maybe only 70/100 trees vote Bot (70% Confidence). It tricked 30 trees, but the majority still caught it.



### 4. How it Catches *Your* Specific Bots

| Bot Type | The "Tell" (Why it gets caught) |
| --- | --- |
| **Teleport Bot** | **Missing Data:** It has `movement_time` ≈ 0 and `path_efficiency` = 1.0. The model has never seen a human move instantly. |
| **Linear Bot** | **Perfection:** It has `path_efficiency` = 1.0 (perfect line) and `curvature` = 0. Humans are *never* this perfect. |
| **Smart Bot** | **Consistency:** Even though it adds curves, its `speed_variance` is often too consistent compared to the erratic motion of a real human hand. |

### Summary

Your model is essentially a **"Perfection Detector."**

* If the user is too fast (Typing/Clicking) → **BOT**.
* If the user is too straight (Movement) → **BOT**.
* If the user is too smooth (Speed) → **BOT**.

Real humans are messy, slow, and wobbly. That is your security key!

