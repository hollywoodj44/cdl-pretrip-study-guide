# CDL Pre-Trip Inspection Master Study Guide & Practice Lab

An interactive CDL Pre-Trip Inspection web application designed for commercial drivers preparing for the official state DMV exam (Class A & B).

Built directly from student study notes and state examination scoring criteria.

---

## 🌟 Key Features

1. **Exact Word Fill-in-the-Blank Cloze Drill**:
   - Practice recalling the exact words, descriptors, and defect criteria for 34+ checklist items (e.g., *lenses: color, clean, missing, broken*, *rims: damage cracked, bent, welding, rust trails, elongated*, *battery: secure lid, secure, tight, corrosion, cracked, worn, frayed*).
   - **Per-Blank Instant Validation** with green success badges.
   - **2-Miss Hint Unlock**: After 2 incorrect attempts, hints unlock with first-letter cues, clickable word bank chips, and study notes.

2. **Official "Say & Point" Verbal Walkthrough**:
   - Complete step-by-step examiner scripts with highlighted **`*` Automatic Failure** warnings for the Air Brake Check (PLAB).
   - Hands-free **Web Speech Voice Guide** to listen aloud while practicing in the cab or yard.

3. **Interactive Mock Inspection Simulator**:
   - Real-time test scoring (0–100%) and automatic test failure detection.
   - Practice under realistic test timing with the built-in CDL exam timer.

4. **3D Flip Study Flashcards**:
   - Quick recall for critical numbers: 4/32" vs 2/32" tread depths, 60 PSI low air warning, 20–45 PSI pop-out valves, cotter pins on castle nuts, and 5 MPH service brake tests.

5. **Timed CDL Knowledge Quiz**:
   - Multiple-choice examination questions with immediate explanations.

6. **Original Study Sheet Photo Reference**:
   - High-definition interactive zoom/pan photo viewer directly referencing the original handwritten study checklist.

7. **Universal Mnemonics Cheat Sheet**:
   - PLAB, ICD, PMS, CDL, and L-R-4-C-H-L memory keys.

---

## 🚀 Getting Started

Simply open `index.html` in any web browser, or launch a local server:

```bash
# Python 3
python3 -m http.server 8080

# Or using any static file server
```

Then visit `http://localhost:8080` in your browser.

---

## 🛠️ Built With

- **HTML5**: Semantic layout, accessible inputs, and audio controls.
- **Vanilla CSS**: Custom dark cockpit theme, responsive layouts, glassmorphism, micro-animations.
- **Vanilla JavaScript**: State machines for cloze blanks, speech synthesis, sound effects synthesizer, and exam scoring.
