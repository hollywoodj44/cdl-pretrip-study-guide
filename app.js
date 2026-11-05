/**
 * CDL Pre-Trip Inspection Master Study Guide & Practice Lab
 * Logic & Interactive Systems
 */

// =============================================================================
// Web Audio Effects Synthesizer (Zero External Dependencies)
// =============================================================================
const SoundFX = (() => {
  let ctx = null;

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  return {
    click() {
      try {
        const audio = getContext();
        if (!audio) return;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audio.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audio.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start();
        osc.stop(audio.currentTime + 0.05);
      } catch (e) {
        // Silently fail if audio permissions blocked
      }
    },
    success() {
      try {
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    },
    buzzer() {
      try {
        const audio = getContext();
        if (!audio) return;
        const now = audio.currentTime;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }
  };
})();

// HTML sanitizer helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// =============================================================================
// Speech Synthesis (Audio Narration)
// =============================================================================
const VoiceGuide = (() => {
  let isSpeaking = false;
  let activeBtn = null;

  function stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (activeBtn) {
      activeBtn.classList.remove('playing');
      activeBtn = null;
    }
    isSpeaking = false;
    updateGlobalBtn();
  }

  function speak(text, btnElement = null) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking && activeBtn === btnElement) {
      stop();
      return;
    }

    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95; // Slightly slower for clear CDL exam articulation
    utterance.pitch = 1.0;

    // Pick a good clear English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Google')));
    if (preferredVoice) utterance.voice = preferredVoice;

    if (btnElement) {
      activeBtn = btnElement;
      activeBtn.classList.add('playing');
    }
    isSpeaking = true;
    updateGlobalBtn();

    utterance.onend = () => {
      stop();
    };

    utterance.onerror = () => {
      stop();
    };

    window.speechSynthesis.speak(utterance);
  }

  function updateGlobalBtn() {
    const globalBtn = document.getElementById('global-speech-btn');
    const label = document.getElementById('speech-btn-label');
    if (!globalBtn) return;
    if (isSpeaking) {
      globalBtn.classList.add('speaking');
      if (label) label.textContent = 'Stop Audio';
    } else {
      globalBtn.classList.remove('speaking');
      if (label) label.textContent = 'Voice Guide';
    }
  }

  return { speak, stop, isSpeaking: () => isSpeaking };
})();

// =============================================================================
// Navigation Tabs
// =============================================================================
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      SoundFX.click();
      const targetId = `pane-${tab.dataset.tab}`;

      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// =============================================================================
// Audio Buttons on Cards
// =============================================================================
function initAudioButtons() {
  const audioButtons = document.querySelectorAll('.btn-audio-speak');
  audioButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      SoundFX.click();
      const text = btn.dataset.text;
      if (text) {
        VoiceGuide.speak(text, btn);
      }
    });
  });

  const globalSpeechBtn = document.getElementById('global-speech-btn');
  if (globalSpeechBtn) {
    globalSpeechBtn.addEventListener('click', () => {
      SoundFX.click();
      if (VoiceGuide.isSpeaking()) {
        VoiceGuide.stop();
      } else {
        // Read intro guide summary
        const introText = "Welcome to the CDL Pre-Trip Inspection Master Study Guide. Tap the Listen button on any inspection card to hear the verbatim script examiners require you to say. Remember, the Air Brake Check is an automatic failure if not performed correctly.";
        VoiceGuide.speak(introText, globalSpeechBtn);
      }
    });
  }
}

// =============================================================================
// Mock Inspection Simulator Engine
// =============================================================================
const Simulator = (() => {
  const items = [
    {
      id: 'plab',
      title: '* Air Brake Check (POOPSLAB)',
      desc: 'Pressure drop (1 min), Low air buzzer (60 PSI), Valve pop-out (20-45 PSI), Build-up & cut-out (120-140 PSI)',
      critical: true,
      category: 'In-Cab'
    },
    {
      id: 'parking_tug',
      title: 'Parking & Trailer Brake Check',
      desc: 'Tug test in low gear to verify parking and trailer brakes hold vehicle firmly',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'service_brake',
      title: 'Service Brake Check (5 MPH)',
      desc: 'Pull forward 5 mph, apply service brake, stops straight without pulling left/right',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'dash_indicators',
      title: 'Lighting Indicators (L, R, 4-Way, High Beam, ABS, DEF)',
      desc: 'Verify dashboard indicator lights and ABS cycling properly',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'emergency_gear',
      title: 'Emergency Equipment (Fuses, Extinguisher, Triangles)',
      desc: 'Spare fuses, fully charged fire extinguisher with pin, 3 red reflective triangles',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'windshield_mirrors',
      title: 'Windshield & Traffic Monitoring Mirrors',
      desc: 'Clean, no illegal stickers/obstructions, no damage or cracks, mirrors adjusted',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'wipers_washers',
      title: 'Wipers & Washers',
      desc: 'Securely mounted, blades not torn/dry-rotted, squirts fluid and sweeps clean',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'heater_defroster',
      title: 'Heater & Defroster',
      desc: 'Verify blower operation at top windshield defroster and lower cab floor',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'horns',
      title: 'Horn(s) - City & Air',
      desc: 'Both electric city horn and overhead air horn sound loud and clear',
      critical: false,
      category: 'In-Cab'
    },
    {
      id: 'external_lights',
      title: 'External Lights Sequence (L-R-4-C-H-L)',
      desc: 'Left, right, 4-ways, clearance lights, headlights high/low, tail and brake lights',
      critical: false,
      category: 'Lights'
    },
    {
      id: 'lenses_front',
      title: 'Lenses (Clean, Not Missing, NOT BROKEN)',
      desc: 'All forward lenses amber/clear, clean, unbroken, none missing',
      critical: false,
      category: 'Engine'
    },
    {
      id: 'fluid_levels',
      title: 'Fluid Levels (Coolant, Oil, Power Steering)',
      desc: 'Coolant reservoir, engine oil dipstick between min/max, power steering level checked',
      critical: false,
      category: 'Engine'
    },
    {
      id: 'leaks_puddles',
      title: 'Fluid & Air Leaks (Puddles & Hisses)',
      desc: 'Check ground for puddles of oil/coolant/fuel; listen for audible air leaks',
      critical: false,
      category: 'Engine'
    },
    {
      id: 'steering_hardware',
      title: 'Steering System & COTTER PINS',
      desc: 'Gear box, hoses, pitman arm, drag link, tie rod; castle nuts tight with cotter pins in place',
      critical: false,
      category: 'Engine'
    },
    {
      id: 'tires_icd',
      title: 'Tires ICD (Inflation, Condition, 4/32" & 2/32" Depth)',
      desc: 'Pressure checked with gauge, no cuts/bulges, min 4/32" steer depth, min 2/32" drive depth',
      critical: false,
      category: 'Suspension'
    },
    {
      id: 'rims_lugs',
      title: 'Rims, Lug Nuts & Studs',
      desc: 'No cracks, welds, or rust trails; all lug nuts present and tight (no shiny threads)',
      critical: false,
      category: 'Suspension'
    },
    {
      id: 'suspension_shocks',
      title: 'Springs, Mounts, U-Bolts & Shocks (Level Stance)',
      desc: 'Truck sits level; leaf springs aligned; U-bolts tight; shocks mounted with no oil leaks',
      critical: false,
      category: 'Suspension'
    },
    {
      id: 'brake_lines_contaminates',
      title: 'Brake Lines, Hoses & Contaminates',
      desc: 'Air hoses not cracked or leaking; brake drums/linings free of oil and grease',
      critical: false,
      category: 'Suspension'
    },
    {
      id: 'battery_box',
      title: 'Battery Box (Corrosion & Frayed Wires)',
      desc: 'Cover secured; terminals tight and free of corrosion; wires not worn or frayed',
      critical: false,
      category: 'Side'
    },
    {
      id: 'fuel_def_frame',
      title: 'Fuel & DEF Tanks, Truck Frame',
      desc: 'Tanks securely mounted, caps tight, no leaks top/bottom; frame has no cracks or welds',
      critical: false,
      category: 'Side'
    }
  ];

  let completedState = {};
  let timerInterval = null;
  let timerSeconds = 0;
  let timerRunning = false;

  function init() {
    renderItems();
    bindTimer();
    updateDashboard();
  }

  function renderItems() {
    const list = document.getElementById('sim-items-list');
    if (!list) return;

    list.innerHTML = items.map((item, idx) => `
      <div class="sim-item-card ${completedState[item.id] ? 'completed' : ''}" data-id="${item.id}">
        <div class="sim-checkbox">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="sim-item-content">
          <h4>${item.title}</h4>
          <p class="sim-item-desc">${item.desc}</p>
          ${item.critical ? '<span class="sim-item-badge critical-badge">* Automatic Fail Item</span>' : ''}
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.sim-item-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        completedState[id] = !completedState[id];
        if (completedState[id]) {
          SoundFX.click();
        }
        renderItems();
        updateDashboard();
      });
    });
  }

  function updateDashboard() {
    const completedCount = Object.values(completedState).filter(Boolean).length;
    const totalCount = items.length;
    const completedEl = document.getElementById('sim-completed-count');
    const totalEl = document.getElementById('sim-total-count');
    const progressBar = document.getElementById('sim-progress-bar');
    const plabStatus = document.getElementById('sim-plab-status');
    const verdictEl = document.getElementById('sim-verdict');
    const verdictSub = document.getElementById('sim-verdict-sub');
    const failAlert = document.getElementById('sim-fail-alert');

    if (completedEl) completedEl.textContent = completedCount;
    if (totalEl) totalEl.textContent = totalCount;

    const percent = Math.round((completedCount / totalCount) * 100);
    if (progressBar) progressBar.style.width = `${percent}%`;

    const plabDone = Boolean(completedState['plab']);

    if (plabStatus) {
      if (plabDone) {
        plabStatus.textContent = 'VERIFIED & PASSED';
        plabStatus.className = 'status-badge status-passed';
      } else {
        plabStatus.textContent = 'NOT COMPLETED';
        plabStatus.className = 'status-badge status-pending';
      }
    }

    if (verdictEl && verdictSub) {
      if (completedCount === totalCount && plabDone) {
        verdictEl.textContent = 'PASSED (100%)';
        verdictEl.className = 'verdict-display verdict-pass';
        verdictSub.textContent = 'Excellent! Ready for State Exam.';
        SoundFX.success();
        if (failAlert) failAlert.classList.add('hidden');
      } else if (completedCount > 10 && !plabDone) {
        verdictEl.textContent = 'FAIL (AUTO-FAIL)';
        verdictEl.className = 'verdict-display verdict-fail';
        verdictSub.textContent = 'Air Brake Check not completed!';
        if (failAlert) failAlert.classList.remove('hidden');
      } else {
        verdictEl.textContent = 'IN PROGRESS';
        verdictEl.className = 'verdict-display verdict-inprogress';
        verdictSub.textContent = `${completedCount} of ${totalCount} checked`;
        if (failAlert) failAlert.classList.add('hidden');
      }
    }
  }

  function bindTimer() {
    const timerBtn = document.getElementById('btn-timer-toggle');
    const resetBtn = document.getElementById('btn-sim-reset');
    const timerDisplay = document.getElementById('sim-timer');

    if (timerBtn) {
      timerBtn.addEventListener('click', () => {
        SoundFX.click();
        if (timerRunning) {
          clearInterval(timerInterval);
          timerRunning = false;
          timerBtn.textContent = 'Resume Timer';
        } else {
          timerRunning = true;
          timerBtn.textContent = 'Pause Timer';
          timerInterval = setInterval(() => {
            timerSeconds++;
            const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
            const secs = String(timerSeconds % 60).padStart(2, '0');
            if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
          }, 1000);
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        SoundFX.click();
        completedState = {};
        clearInterval(timerInterval);
        timerRunning = false;
        timerSeconds = 0;
        if (timerDisplay) timerDisplay.textContent = '00:00';
        if (timerBtn) timerBtn.textContent = 'Start Timer';
        renderItems();
        updateDashboard();
      });
    }
  }

  return { init };
})();

// =============================================================================
// Flashcards Lab
// =============================================================================
const FlashcardsLab = (() => {
  const cards = [
    {
      category: 'critical',
      catLabel: '🚨 CRITICAL AIR BRAKES',
      question: 'What does POOPSLAB stand for and why is it critical?',
      sub: 'Recall all 8 steps and automatic failure penalty.',
      answer: `<strong>P - Purge:</strong> With engine running, build pressure. Governor cuts OUT between <strong>120–140 PSI</strong> with a purge sneeze.<br><br>
               <strong>O - Off:</strong> Turn engine OFF.<br><br>
               <strong>O - On (Accessories):</strong> Turn key to ON/Accessories position.<br><br>
               <strong>P - Push Pedal:</strong> Hold foot brake firmly for <strong>60 seconds</strong>. Max <strong>3 PSI</strong> drop.<br><br>
               <strong>S - Settle:</strong> Let gauges settle — confirm no more than 3 PSI lost.<br><br>
               <strong>L - Low Air Warning:</strong> Fan brake pedal. Warning buzzer &amp; red light activate at or above <strong>60 PSI</strong>.<br><br>
               <strong>A - Alarm Pop-Out:</strong> Continue fanning down. Spring brake valves pop out between <strong>20–40 PSI</strong>.<br><br>
               <strong>B - Build-Up:</strong> Start engine. Pressure builds back to <strong>120–140 PSI</strong>. Governor cuts out — truck is ready.<br><br>
               <em>* Automatic failure if any step is missed or recited incorrectly!</em>`
    },
    {
      category: 'tires',
      catLabel: '🛞 TIRES & WHEEL END',
      question: 'What are the minimum tire tread depths for steer vs other tires?',
      sub: 'Circled on Dillon Mitchell\'s study sheet.',
      answer: `<strong>Steer Tires (Front Axle):</strong> Minimum <strong>4/32 inch</strong> tread depth. Must be evenly worn, virgin rubber (no recaps).<br><br>
               <strong>All Other Tires (Drive & Trailer):</strong> Minimum <strong>2/32 inch</strong> tread depth. May be recapped/retreaded.<br><br>
               <em>Measured with a tread depth gauge in every major tread groove.</em>`
    },
    {
      category: 'engine',
      catLabel: '⚙️ STEERING HARDWARE',
      question: 'What critical hardware was circled under Steering linkage?',
      sub: 'Hint: prevents castle nuts from backing off.',
      answer: `<strong>Cotter Pin!</strong><br><br>
               Castle nuts on the pitman arm, drag link, steering arm, and tie rod joints <strong>MUST have cotter pins</strong> properly installed and spread.<br><br>
               <em>Examiner script: "All castle nuts are tight and all COTTER PINS are present and secure."</em>`
    },
    {
      category: 'incab',
      catLabel: '🚚 IN-CAB BRAKE CHECKS',
      question: 'How do you perform the Parking Brake and Service Brake tests?',
      sub: 'Tug test & 5 MPH stopping test.',
      answer: `<strong>Parking Brake (Tug Test):</strong> Set parking brake, put truck in low gear, gently tug forward against the brake. Vehicle must hold firm.<br><br>
               <strong>Service Brake (5 MPH Test):</strong> Accelerate to <strong>5 MPH</strong>, apply foot brake firmly. Vehicle stops smoothly without pulling to the left or right.`
    },
    {
      category: 'side',
      catLabel: '🔋 BATTERY & ELECTRICAL',
      question: 'What two specific defects were circled under the Battery section?',
      sub: 'Look at the circled words on the study sheet.',
      answer: `<strong>1. Corrosion</strong> - Terminals and cables must be clean and free of white or green corrosive build-up.<br><br>
               <strong>2. Frayed</strong> - Battery cables and wiring must have intact insulation with no cuts, exposed wires, or frayed strands.<br><br>
               <em>Also verify battery lid is secure and batteries are held tight.</em>`
    },
    {
      category: 'incab',
      catLabel: '🚨 EMERGENCY EQUIPMENT',
      question: 'What are the 3 mandatory emergency safety items inside the cab?',
      sub: 'F - E - T mnemonic.',
      answer: `<strong>1. Spare Fuses:</strong> Spare electrical fuses of each rating used in the vehicle.<br><br>
               <strong>2. Fire Extinguisher:</strong> Fully charged (needle in green), pin and seal intact, rated at least 10 B:C or 5 B:C, securely mounted.<br><br>
               <strong>3. Reflective Triangles:</strong> Three (3) red emergency warning triangles in good condition.`
    },
    {
      category: 'tires',
      catLabel: '🛞 TIRES (ICD RULE)',
      question: 'What does the ICD mnemonic stand for on tires?',
      sub: 'Standard CDL inspection rule.',
      answer: `<strong>I - Inflation:</strong> Checked cold with tire pressure gauge at accessible valve stem; valve cap not missing, broken, or damaged.<br><br>
               <strong>C - Condition:</strong> Even tread wear; NO cuts, exposed cords/wires, bumps, or bulges in sidewall or tread.<br><br>
               <strong>D - Depth:</strong> Min 4/32" on steer tires, min 2/32" on all other tires.`
    },
    {
      category: 'tires',
      catLabel: '🛞 RIMS & LUG NUTS',
      question: 'What visual clues indicate loose lug nuts on truck wheels?',
      sub: 'Steel wheels vs aluminum wheels.',
      answer: `<strong>1. Rust Trails:</strong> Reddish rust streaks spreading outward from lug nut holes indicate loose nuts on steel rims.<br><br>
               <strong>2. Shiny Metal Threads:</strong> Shiny metal around bolt holes or visible threads indicates loose lug nuts on aluminum rims.<br><br>
               <em>Also verify no lug nuts are missing and studs are not stripped or broken.</em>`
    },
    {
      category: 'engine',
      catLabel: '⚙️ ENGINE COMPARTMENT',
      question: 'What 3 fluid levels must you check under the hood?',
      sub: 'Daily pre-trip fluids.',
      answer: `<strong>1. Engine Coolant:</strong> Reservoir level between add and full marks (or visible in sight glass).<br><br>
               <strong>2. Engine Oil:</strong> Dipstick pulled, wiped clean, reinserted; level between ADD and FULL operating marks.<br><br>
               <strong>3. Power Steering Fluid:</strong> Dipstick or sight glass checked, level above minimum line.`
    },
    {
      category: 'incab',
      catLabel: '💡 LIGHTS SEQUENCE',
      question: 'What is the external lights walkaround code from the sheet?',
      sub: 'L-R-4-C-H-L pattern.',
      answer: `<strong>L - R - 4 - C - H - L:</strong><br>
               Left Turn, Right Turn, 4-Way Hazard Flashers, Clearance Lights, Headlights High Beam, Headlights Low Beam.<br><br>
               <em>Rear: Tail Lights, Brake Lights, 4-Ways, Left/Right Turn, License Plate Light. Amber in front/sides, Red in rear!</em>`
    },
    {
      category: 'engine',
      catLabel: '⚙️ FRONT LENSES',
      question: 'What was circled under front lenses on the study sheet?',
      sub: 'Color, clean, missing, broken.',
      answer: `<strong>"Broken"</strong> was circled!<br><br>
               Lenses must be clean, proper color (amber in front/side, clear headlights), none missing, and <strong>none cracked or broken</strong>.`
    },
    {
      category: 'side',
      catLabel: '🚚 FRAME & DECK',
      question: 'What do you inspect on the truck frame and floor deck?',
      sub: 'Structural integrity points.',
      answer: `<strong>Frame Rails & Crossmembers:</strong> No cracks, broken welds, bends, unauthorized drilled holes, or structural damage.<br><br>
               <strong>Floor / Decking:</strong> Solid with no holes in the floor, no missing floorboards, capable of carrying cargo safely.`
    }
  ];

  let currentIdx = 0;
  let activeFilter = 'all';
  let filteredCards = [...cards];
  let isFlipped = false;

  function init() {
    bindEvents();
    applyFilter('all');
  }

  function applyFilter(filter) {
    activeFilter = filter;
    if (filter === 'all') {
      filteredCards = [...cards];
    } else {
      filteredCards = cards.filter(c => c.category === filter);
    }
    currentIdx = 0;
    isFlipped = false;
    renderCard();
  }

  function renderCard() {
    const cardEl = document.getElementById('active-flashcard');
    const curIdxEl = document.getElementById('fc-current-index');
    const totIdxEl = document.getElementById('fc-total-index');
    const catLabelEl = document.getElementById('fc-category-label');
    const frontTitle = document.getElementById('fc-front-title');
    const frontSub = document.getElementById('fc-front-subtitle');
    const backContent = document.getElementById('fc-back-content');

    if (!cardEl || filteredCards.length === 0) return;

    if (isFlipped) {
      cardEl.classList.remove('is-flipped');
      isFlipped = false;
    }

    const item = filteredCards[currentIdx];

    if (curIdxEl) curIdxEl.textContent = currentIdx + 1;
    if (totIdxEl) totIdxEl.textContent = filteredCards.length;
    if (catLabelEl) catLabelEl.textContent = item.catLabel;
    if (frontTitle) frontTitle.textContent = item.question;
    if (frontSub) frontSub.textContent = item.sub;
    if (backContent) backContent.innerHTML = item.answer;
  }

  function flipCard() {
    const cardEl = document.getElementById('active-flashcard');
    if (!cardEl) return;
    SoundFX.click();
    isFlipped = !isFlipped;
    cardEl.classList.toggle('is-flipped', isFlipped);
  }

  function nextCard() {
    SoundFX.click();
    currentIdx = (currentIdx + 1) % filteredCards.length;
    renderCard();
  }

  function prevCard() {
    SoundFX.click();
    currentIdx = (currentIdx - 1 + filteredCards.length) % filteredCards.length;
    renderCard();
  }

  function bindEvents() {
    const container = document.getElementById('flashcard-container');
    if (container) {
      container.addEventListener('click', flipCard);
    }

    const nextBtn = document.getElementById('fc-btn-next');
    const prevBtn = document.getElementById('fc-btn-prev');
    const reviewBtn = document.getElementById('fc-btn-review');
    const masteredBtn = document.getElementById('fc-btn-mastered');

    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    if (prevBtn) prevBtn.addEventListener('click', prevCard);

    if (reviewBtn) {
      reviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundFX.buzzer();
        nextCard();
      });
    }

    if (masteredBtn) {
      masteredBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundFX.success();
        nextCard();
      });
    }

    const filterBtns = document.querySelectorAll('.fc-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.click();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.fcFilter);
      });
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      const flashcardsTab = document.getElementById('pane-flashcards');
      if (flashcardsTab && flashcardsTab.classList.contains('active')) {
        if (e.code === 'Space') {
          e.preventDefault();
          flipCard();
        } else if (e.code === 'ArrowRight') {
          nextCard();
        } else if (e.code === 'ArrowLeft') {
          prevCard();
        }
      }
    });
  }

  return { init };
})();

// =============================================================================
// Exam Quiz Challenge
// =============================================================================
const QuizLab = (() => {
  const questions = [
    {
      q: 'During the Air Brake Check (POOPSLAB), what is the maximum allowable air pressure loss during the 1-minute applied pressure test on a single commercial vehicle?',
      options: [
        'No more than 2 PSI in 1 minute',
        'No more than 3 PSI in 1 minute',
        'No more than 5 PSI in 1 minute',
        'No more than 10 PSI in 1 minute'
      ],
      correct: 1,
      explanation: 'For a single commercial vehicle, the applied service brake pressure drop test must not lose more than 3 PSI in 1 minute (4 PSI for a combination vehicle).'
    },
    {
      q: 'At what air pressure must the low air warning light and buzzer activate during the fanning test?',
      options: [
        'At or above 60 PSI (typically 55-75 PSI)',
        'Exactly 100 PSI',
        'Between 20 and 45 PSI',
        'Below 15 PSI'
      ],
      correct: 0,
      explanation: 'The low air warning indicator (light and buzzer) must activate at or above 60 PSI (typically between 55 and 75 PSI) before air pressure drops to emergency levels.'
    },
    {
      q: 'What is the minimum legal tread depth required on front steer tires on a commercial motor vehicle?',
      options: [
        '2/32 of an inch',
        '3/32 of an inch',
        '4/32 of an inch',
        '6/32 of an inch'
      ],
      correct: 2,
      explanation: 'Steer tires require a minimum tread depth of 4/32" (circled on Dillon Mitchell\'s checklist). All other drive and trailer tires require 2/32".'
    },
    {
      q: 'Under the steering linkage hardware inspection, what critical safety item was circled on the study sheet?',
      options: [
        'Lock washers',
        'Cotter pin on castle nuts',
        'Zip ties',
        'Thread seal tape'
      ],
      correct: 1,
      explanation: 'Cotter Pin was explicitly circled. Castle nuts on steering linkage must have their cotter pin inserted and spread to prevent nuts from vibrating loose.'
    },
    {
      q: 'At what speed should the driver conduct the Service Brake stop test to check for pulling?',
      options: [
        '5 MPH',
        '15 MPH',
        '25 MPH',
        '35 MPH'
      ],
      correct: 0,
      explanation: 'The service brake test is performed at 5 MPH. You pull forward at 5 mph, press the brake pedal firmly, and verify the truck stops smoothly without pulling left or right.'
    },
    {
      q: 'What are the two specific defects circled under the Battery section on the study sheet?',
      options: [
        'Missing label and cold fluid',
        'Corrosion on terminals and frayed cables',
        'Dead alternator and weak belt',
        'Low acid level and loose strap'
      ],
      correct: 1,
      explanation: '"Corrosion" and "Frayed" were circled. You must inspect battery terminals for corrosion and battery cables for frayed or exposed wires.'
    },
    {
      q: 'What three items make up the mandatory in-cab emergency equipment?',
      options: [
        'First aid kit, flashlight, emergency blanket',
        'Spare fuses, charged fire extinguisher (10 B:C / 5 B:C), 3 red reflective triangles',
        'Jumper cables, tow strap, wheel chocks',
        'Hard hat, safety vest, work gloves'
      ],
      correct: 1,
      explanation: 'Federal regulations require: spare electrical fuses, properly charged and mounted fire extinguisher, and three red reflective warning triangles.'
    },
    {
      q: 'What visual sign indicates a loose lug nut on a steel wheel rim?',
      options: [
        'Rust trails spreading from the lug nut',
        'Black soot on the tire sidewall',
        'White chalk marks',
        'Blue heat discoloration on the hub'
      ],
      correct: 0,
      explanation: 'Rust trails extending from lug nuts indicate looseness on steel rims. On aluminum wheels, look for shiny metal threads or gaps around the nut.'
    },
    {
      q: 'At what pressure range should the emergency spring brake valves (yellow and red knobs) pop out automatically?',
      options: [
        'Between 80 and 90 PSI',
        'Between 60 and 75 PSI',
        'Between 20 and 45 PSI',
        'Between 0 and 10 PSI'
      ],
      correct: 2,
      explanation: 'The tractor parking valve and trailer supply valve must pop out automatically into emergency set position between 20 and 45 PSI as pressure drops.'
    },
    {
      q: 'What is the air compressor governor cut-out pressure range during the build-up test?',
      options: [
        '90 - 100 PSI',
        '100 - 110 PSI',
        '120 - 140 PSI',
        '150 - 175 PSI'
      ],
      correct: 2,
      explanation: 'The air compressor governor cuts OUT when pressure reaches between 120 and 140 PSI, signified by the audible air dryer purge sneeze.'
    }
  ];

  let currentQ = 0;
  let score = 0;
  let answered = false;

  function init() {
    renderQuestion();
    bindEvents();
  }

  function renderQuestion() {
    const qBox = document.getElementById('quiz-question-box');
    const curNumEl = document.getElementById('quiz-current-num');
    const scoreEl = document.getElementById('quiz-score');
    const nextBtn = document.getElementById('quiz-btn-next');
    const restartBtn = document.getElementById('quiz-btn-restart');

    if (!qBox) return;

    if (currentQ >= questions.length) {
      // Quiz complete
      qBox.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <h3 style="font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">Exam Completed!</h3>
          <p style="font-size: 1.25rem; color: ${score >= 8 ? '#a7f3d0' : '#fca5a5'}; margin-bottom: 1.5rem;">
            You scored <strong>${score} out of ${questions.length}</strong> (${Math.round((score / questions.length) * 100)}%)
          </p>
          <p style="color: #9ca3af; max-width: 500px; margin: 0 auto 1.5rem;">
            ${score >= 8 ? 'Outstanding job! You have mastered the key test criteria, numbers, and circled notes from the study sheet.' : 'Keep practicing! Review the Verbal Walkthrough and Flashcards to master the 4/32" tread, POOPSLAB steps, and cotter pin items.'}
          </p>
        </div>
      `;
      if (nextBtn) nextBtn.classList.add('hidden');
      if (restartBtn) restartBtn.classList.remove('hidden');
      return;
    }

    answered = false;
    if (curNumEl) curNumEl.textContent = currentQ + 1;
    if (scoreEl) scoreEl.textContent = score;
    if (nextBtn) nextBtn.classList.add('hidden');
    if (restartBtn) restartBtn.classList.add('hidden');

    const item = questions[currentQ];

    qBox.innerHTML = `
      <div class="quiz-question-title">${currentQ + 1}. ${item.q}</div>
      <div class="quiz-options">
        ${item.options.map((opt, i) => `
          <button class="quiz-option" data-idx="${i}">
            <span style="font-weight: 700; color: #f59e0b; width: 24px;">${String.fromCharCode(65 + i)}.</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <div class="quiz-explanation hidden" id="q-explanation">
        <strong>Explanation:</strong> ${item.explanation}
      </div>
    `;

    qBox.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const selectedIdx = parseInt(btn.dataset.idx, 10);
        const isCorrect = selectedIdx === item.correct;

        if (isCorrect) {
          btn.classList.add('correct');
          score++;
          SoundFX.success();
        } else {
          btn.classList.add('incorrect');
          SoundFX.buzzer();
          // Highlight correct one
          const options = qBox.querySelectorAll('.quiz-option');
          if (options[item.correct]) options[item.correct].classList.add('correct');
        }

        if (scoreEl) scoreEl.textContent = score;
        const exp = document.getElementById('q-explanation');
        if (exp) exp.classList.remove('hidden');
        if (nextBtn) nextBtn.classList.remove('hidden');
      });
    });
  }

  function bindEvents() {
    const nextBtn = document.getElementById('quiz-btn-next');
    const restartBtn = document.getElementById('quiz-btn-restart');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        SoundFX.click();
        currentQ++;
        renderQuestion();
      });
    }

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        SoundFX.click();
        currentQ = 0;
        score = 0;
        renderQuestion();
      });
    }

    // Toggle Quiz Questions Cheat Sheet
    const toggleCsBtn = document.getElementById('btn-toggle-quiz-cheatsheet');
    const csContainer = document.getElementById('quiz-cheatsheet-container');
    const csList = document.getElementById('quiz-cs-list');

    if (toggleCsBtn && csContainer) {
      toggleCsBtn.addEventListener('click', () => {
        SoundFX.click();
        const isHidden = csContainer.classList.contains('hidden');
        if (isHidden) {
          csContainer.classList.remove('hidden');
          toggleCsBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            Hide Quiz Answer Key Cheat Sheet
          `;
          if (csList && !csList.children.length) {
            csList.innerHTML = questions.map((q, i) => `
              <div class="quiz-cs-card">
                <div class="quiz-cs-q-title">Question ${i + 1}: ${escapeHtml(q.q)}</div>
                <div class="quiz-cs-correct-ans">✓ Correct Answer: <strong>${escapeHtml(q.options[q.correct])}</strong></div>
                <div class="quiz-cs-expl"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>
              </div>
            `).join('');
          }
        } else {
          csContainer.classList.add('hidden');
          toggleCsBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            📋 Show Quiz Answer Key Cheat Sheet
          `;
        }
      });
    }
  }

  return { init };
})();

// =============================================================================
// Original Study Photo Viewer with Zoom & Hotspot Focus
// =============================================================================
function initPhotoViewer() {
  const photo = document.getElementById('study-photo');
  const frame = document.getElementById('photo-frame');
  const zoomIn = document.getElementById('btn-zoom-in');
  const zoomOut = document.getElementById('btn-zoom-out');
  const zoomReset = document.getElementById('btn-zoom-reset');

  if (!photo || !frame) return;

  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function updateTransform() {
    photo.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  if (zoomIn) {
    zoomIn.addEventListener('click', () => {
      SoundFX.click();
      scale = Math.min(scale + 0.35, 3.5);
      updateTransform();
    });
  }

  if (zoomOut) {
    zoomOut.addEventListener('click', () => {
      SoundFX.click();
      scale = Math.max(scale - 0.35, 1);
      if (scale === 1) {
        posX = 0;
        posY = 0;
      }
      updateTransform();
    });
  }

  if (zoomReset) {
    zoomReset.addEventListener('click', () => {
      SoundFX.click();
      scale = 1;
      posX = 0;
      posY = 0;
      updateTransform();
    });
  }

  // Dragging / panning
  frame.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch panning
  let initialTouchDist = 0;
  frame.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    }
  }, { passive: true });

  frame.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      updateTransform();
    }
  }, { passive: true });

  frame.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Hotspot clicks in sidebar
  const legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach(item => {
    item.addEventListener('click', () => {
      SoundFX.click();
      const focusType = item.dataset.focus;
      scale = 2.0;

      // Pan to relevant area on Dillon Mitchell's checklist photo
      switch (focusType) {
        case 'airbrakes':
          posX = 0;
          posY = 280;
          break;
        case 'cotterpin':
          posX = 0;
          posY = 50;
          break;
        case 'tread':
          posX = 0;
          posY = -100;
          break;
        case 'battery':
          posX = 0;
          posY = -280;
          break;
        case 'lenses':
          posX = 0;
          posY = 120;
          break;
        case 'blackout':
          posX = 0;
          posY = -380;
          break;
        default:
          posX = 0;
          posY = 0;
      }
      updateTransform();
    });
  });
}

// =============================================================================
// Cloze Fill-in-the-Blank Exact Word Memory Drill Engine
// =============================================================================
const ClozeFillDrill = (() => {
  const clozeItems = [
    // Section 1: In-Vehicle / Engine Start
    {
      id: 'plab_check',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: '*air brake check',
      circled: '* Automatic failure if not performed correctly',
      instruction: 'Fill in the 8-letter mnemonic for the Air Brake Check:',
      blanks: [
        { label: 'Step Mnemonic', answer: 'POOPSLAB', accepted: ['poopslab', 'p o o p s l a b', 'p-o-o-p-s-l-a-b'], hint: 'Purge, Off, On, Push, Settle, Low air warning, Alarm pop-out, Build-up' }
      ],
      audioText: 'Air brake check: P-O-O-P-S-L-A-B. Purge, Off, On accessories, Push pedal, Settle, Low air warning, Alarm pop-out, Build-up.'
    },
    {
      id: 'parking_tug',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'parking & trailer brake check',
      circled: '',
      instruction: 'Fill in the test action from the checklist:',
      blanks: [
        { label: 'Action', answer: 'tug', accepted: ['tug', 'tug test'], hint: 'Gentle pull against brake in low gear' }
      ],
      audioText: 'Parking and trailer brake check: tug.'
    },
    {
      id: 'service_brake_speed',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'service brake check',
      circled: '',
      instruction: 'Fill in the speed required for the service brake check:',
      blanks: [
        { label: 'Speed', answer: '5mph', accepted: ['5mph', '5 mph', '5 miles per hour'], hint: 'Low driving speed in yard' }
      ],
      audioText: 'Service brake check: 5 miles per hour.'
    },
    {
      id: 'lighting_indicators',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'lighting indicators',
      circled: '',
      instruction: 'Fill in all 6 dashboard indicators checked during startup:',
      blanks: [
        { label: 'Indicator 1', answer: 'left', accepted: ['left', 'left turn'], hint: 'Left turn signal' },
        { label: 'Indicator 2', answer: 'right', accepted: ['right', 'right turn'], hint: 'Right turn signal' },
        { label: 'Indicator 3', answer: '4 way', accepted: ['4 way', '4-way', '4way', 'hazard'], hint: 'Hazard flashers' },
        { label: 'Indicator 4', answer: 'high beam', accepted: ['high beam', 'high beams', 'brights'], hint: 'Blue dashboard light' },
        { label: 'Indicator 5', answer: 'ABS', accepted: ['abs', 'a.b.s.'], hint: 'Anti-lock braking system light' },
        { label: 'Indicator 6', answer: 'DEF', accepted: ['def', 'd.e.f.'], hint: 'Diesel exhaust fluid gauge light' }
      ],
      audioText: 'Lighting indicators: left, right, 4 way, high beam, ABS, DEF.'
    },
    {
      id: 'emergency_equipment',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'emergency equipment',
      circled: '',
      instruction: 'Fill in the 3 mandatory emergency safety items:',
      blanks: [
        { label: 'Item 1', answer: 'fuses', accepted: ['fuses', 'spare fuses', 'fuse'], hint: 'Electrical circuit protectors' },
        { label: 'Item 2', answer: 'extinguisher', accepted: ['extinguisher', 'fire extinguisher'], hint: 'Charged fire fighting cylinder' },
        { label: 'Item 3', answer: 'triangles', accepted: ['triangles', 'warning triangles', 'reflective triangles'], hint: 'Three red roadside markers' }
      ],
      audioText: 'Emergency equipment: fuses, extinguisher, triangles.'
    },
    {
      id: 'windshield_devices',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'windshield & traffic monitoring devices',
      circled: '',
      instruction: 'Fill in the 5 glass and mirror inspection terms:',
      blanks: [
        { label: 'Glass 1', answer: 'clean', accepted: ['clean'], hint: 'Free of dirt' },
        { label: 'Glass 2', answer: 'obstruction', accepted: ['obstruction', 'obstructions', 'no obstruction'], hint: 'No stickers or blockage' },
        { label: 'Glass 3', answer: 'damage/cracks or flaws', accepted: ['damage', 'cracks', 'damage/cracks', 'damage/cracks or flaws', 'flaws'], hint: 'No spidering or cracks' },
        { label: 'Mirrors 1', answer: 'clean', accepted: ['clean'], hint: 'Wiped clear' },
        { label: 'Mirrors 2', answer: 'adjusted', accepted: ['adjusted', 'properly adjusted'], hint: 'Positioned for driver view' }
      ],
      audioText: 'Windshield and traffic monitoring devices: clean, obstruction, damage/cracks or flaws, clean, adjusted.'
    },
    {
      id: 'wipers_washers',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'wipers & washers',
      circled: '',
      instruction: 'Fill in the 3 wiper inspection words:',
      blanks: [
        { label: 'Word 1', answer: 'secure', accepted: ['secure', 'securely mounted'], hint: 'Arms mounted tight' },
        { label: 'Word 2', answer: 'damage', accepted: ['damage', 'no damage', 'undamaged'], hint: 'Blades not torn or rotted' },
        { label: 'Word 3', answer: 'work/squirt', accepted: ['work/squirt', 'squirt', 'work', 'working'], hint: 'Fluid spray operation' }
      ],
      audioText: 'Wipers and washers: secure, damage, work/squirt.'
    },
    {
      id: 'heater_defroster',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'heater & defroster',
      circled: '',
      instruction: 'Fill in the required condition word:',
      blanks: [
        { label: 'Condition', answer: 'working', accepted: ['working', 'works', 'operational'], hint: 'Blowing hot air properly' }
      ],
      audioText: 'Heater and defroster: working.'
    },
    {
      id: 'horns',
      category: 'incab',
      catBadge: 'In-Vehicle / Engine Start',
      name: 'horn(s)',
      circled: '',
      instruction: 'Fill in the 2 types of horns that must be tested:',
      blanks: [
        { label: 'Horn 1', answer: 'City', accepted: ['city', 'electric'], hint: 'Electric steering wheel horn' },
        { label: 'Horn 2', answer: 'Air', accepted: ['air', 'air horn'], hint: 'Overhead lanyard pneumatic horn' }
      ],
      audioText: 'Horns: City, Air.'
    },
    {
      id: 'external_lights_pattern',
      category: 'incab',
      catBadge: 'Lights Operations Check',
      name: 'all external lights',
      circled: '',
      instruction: 'Fill in the 4 external lights sequence codes:',
      blanks: [
        { label: 'Code 1 (Front)', answer: 'L-R-4-C-H-L', accepted: ['l-r-4-c-h-l', 'lr4chl', 'l r 4 c h l'], hint: 'Left, Right, 4-Way, Clearance, High, Low' },
        { label: 'Code 2 (Side)', answer: 'L-4-C', accepted: ['l-4-c', 'l4c', 'l 4 c'], hint: 'Left, 4-Way, Clearance' },
        { label: 'Code 3 (Rear)', answer: 'L-R-4-TL-BL', accepted: ['l-r-4-tl-bl', 'lr4tlbl', 'l r 4 tl bl'], hint: 'Left, Right, 4-Way, Tail, Brake' },
        { label: 'Code 4 (Side)', answer: 'R-4-C', accepted: ['r-4-c', 'r4c', 'r 4 c'], hint: 'Right, 4-Way, Clearance' }
      ],
      audioText: 'All external lights: L-R-4-C-H-L, L-4-C, L-R-4-TL-BL, R-4-C.'
    },

    // Section 2: Front of Vehicle / Engine Area
    {
      id: 'lenses_front',
      category: 'engine',
      catBadge: 'Front of Vehicle / Engine Area',
      name: 'lenses',
      circled: 'Circled on Study Sheet: broken',
      instruction: 'Fill in the 4 exact words for checking lenses:',
      blanks: [
        { label: 'Word 1', answer: 'color', accepted: ['color', 'proper color'], hint: 'Amber in front, clear headlights' },
        { label: 'Word 2', answer: 'clean', accepted: ['clean'], hint: 'Free of grime' },
        { label: 'Word 3', answer: 'missing', accepted: ['missing', 'none missing', 'not missing'], hint: 'All covers present' },
        { label: 'Word 4 (Circled!)', answer: 'broken', accepted: ['broken', 'not broken', 'cracked'], hint: 'Circled on sheet! No cracks or breaks' }
      ],
      audioText: 'Lenses: color, clean, missing, broken.'
    },
    {
      id: 'fluid_levels',
      category: 'engine',
      catBadge: 'Front of Vehicle / Engine Area',
      name: 'fluid levels',
      circled: '',
      instruction: 'Fill in the 3 engine fluids checked:',
      blanks: [
        { label: 'Fluid 1', answer: 'Coolant', accepted: ['coolant', 'radiator coolant', 'antifreeze'], hint: 'Radiator reservoir fluid' },
        { label: 'Fluid 2', answer: 'Oil', accepted: ['oil', 'engine oil'], hint: 'Checked with dipstick' },
        { label: 'Fluid 3', answer: 'Power Steering', accepted: ['power steering', 'power steering fluid'], hint: 'Hydraulic steering fluid' }
      ],
      audioText: 'Fluid levels: Coolant, Oil, Power Steering.'
    },
    {
      id: 'fluid_air_leaks',
      category: 'engine',
      catBadge: 'Front of Vehicle / Engine Area',
      name: 'fluid & air leaks',
      circled: '',
      instruction: 'Fill in the 3 leak detection words from the sheet:',
      blanks: [
        { label: 'Word 1', answer: 'puddles', accepted: ['puddles', 'puddle'], hint: 'Liquid on the ground' },
        { label: 'Word 2', answer: 'eng/trans', accepted: ['eng/trans', 'engine/transmission', 'eng trans', 'engine trans'], hint: 'Engine and transmission' },
        { label: 'Word 3', answer: 'air', accepted: ['air', 'air leaks', 'air leak'], hint: 'Audible hissing' }
      ],
      audioText: 'Fluid and air leaks: puddles, engine and transmission, air.'
    },
    {
      id: 'steering_box',
      category: 'engine',
      catBadge: 'Front of Vehicle / Steering systems',
      name: 'Steering systems: Box',
      circled: '',
      instruction: 'Fill in the 2 inspection words for the steering box:',
      blanks: [
        { label: 'Word 1', answer: 'secure', accepted: ['secure', 'securely mounted'], hint: 'Bolted tight to frame' },
        { label: 'Word 2', answer: 'leaks', accepted: ['leaks', 'no leaks', 'leak'], hint: 'No hydraulic fluid escaping' }
      ],
      audioText: 'Steering box: secure, leaks.'
    },
    {
      id: 'steering_hoses',
      category: 'engine',
      catBadge: 'Front of Vehicle / Steering systems',
      name: 'Steering systems: Hoses',
      circled: '',
      instruction: 'Fill in the 3 hose defect terms:',
      blanks: [
        { label: 'Word 1', answer: 'cracked', accepted: ['cracked', 'crack'], hint: 'Rubber surface fissures' },
        { label: 'Word 2', answer: 'leak', accepted: ['leak', 'leaks', 'leaking'], hint: 'Fluid seepage' },
        { label: 'Word 3', answer: 'worn', accepted: ['worn', 'wear', 'chafed'], hint: 'Rubbing or abrasive thinning' }
      ],
      audioText: 'Steering hoses: cracked, leak, worn.'
    },
    {
      id: 'steering_linkage',
      category: 'engine',
      catBadge: 'Front of Vehicle / Steering systems',
      name: 'Links/Arms/Rods/Joints/Socket',
      circled: '',
      instruction: 'Fill in the 3 mechanical linkage defect terms:',
      blanks: [
        { label: 'Word 1', answer: 'cracked', accepted: ['cracked', 'crack'], hint: 'Structural metal fractures' },
        { label: 'Word 2', answer: 'loose', accepted: ['loose', 'looseness'], hint: 'Excessive joint play' },
        { label: 'Word 3', answer: 'worn', accepted: ['worn', 'wear'], hint: 'Joint friction deterioration' }
      ],
      audioText: 'Steering links, arms, rods, joints, socket: cracked, loose, worn.'
    },
    {
      id: 'steering_hardware',
      category: 'engine',
      catBadge: 'Front of Vehicle / Steering systems',
      name: 'Hardware',
      circled: 'Circled on Study Sheet: cotter pin',
      instruction: 'Fill in the 3 fasteners (pay attention to the circled item!):',
      blanks: [
        { label: 'Fastener 1', answer: 'bolts', accepted: ['bolts', 'bolt'], hint: 'Threaded mounting fasteners' },
        { label: 'Fastener 2', answer: 'castle nuts', accepted: ['castle nuts', 'castle nut'], hint: 'Slotted steering nuts' },
        { label: 'Fastener 3 (Circled!)', answer: 'cotter pin', accepted: ['cotter pin', 'cotter pins', 'cotterpin'], hint: 'Circled on sheet! Wire pin through castle nut' }
      ],
      audioText: 'Hardware: bolts, castle nuts, cotter pin.'
    },

    // Section 3: Tires & Wheel End
    {
      id: 'tires_inflation',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Tires',
      name: 'tires: I (Inflation)',
      circled: '',
      instruction: 'Fill in the 2 inflation inspection words:',
      blanks: [
        { label: 'Tool', answer: 'gauge', accepted: ['gauge', 'air gauge', 'tire gauge'], hint: 'Air pressure measurement tool' },
        { label: 'Accessibility', answer: 'accessible', accepted: ['accessible', 'access'], hint: 'Valve stem easy to reach' }
      ],
      audioText: 'Tires inflation: gauge, accessible.'
    },
    {
      id: 'tires_condition',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Tires',
      name: 'tires: C (Condition)',
      circled: '',
      instruction: 'Fill in the 2 tire condition defect terms:',
      blanks: [
        { label: 'Defect 1', answer: 'cuts/expose wires', accepted: ['cuts/expose wires', 'cuts', 'expose wires', 'exposed wires', 'cuts/exposed wires'], hint: 'Tread/sidewall gashes and wires' },
        { label: 'Defect 2', answer: 'bumps/bulges', accepted: ['bumps/bulges', 'bumps', 'bulges', 'bumps bulges'], hint: 'Sidewall blisters or swelling' }
      ],
      audioText: 'Tires condition: cuts/expose wires, bumps/bulges.'
    },
    {
      id: 'tires_valvecap',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Tires',
      name: 'Valve Cap',
      circled: '',
      instruction: 'Fill in the 3 valve cap status terms:',
      blanks: [
        { label: 'Status 1', answer: 'not missing', accepted: ['not missing', 'present'], hint: 'Cap is on the stem' },
        { label: 'Status 2', answer: 'broken', accepted: ['broken', 'not broken'], hint: 'Not cracked' },
        { label: 'Status 3', answer: 'damaged', accepted: ['damaged', 'not damaged'], hint: 'Threads in good shape' }
      ],
      audioText: 'Valve cap: not missing, broken, damaged.'
    },
    {
      id: 'tires_depth',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Tires',
      name: 'tires: D (Depth)',
      circled: 'Circled on Study Sheet: 4/32, 2/32',
      instruction: 'Fill in the measurement tool and the 2 circled minimum depths:',
      blanks: [
        { label: 'Tool', answer: 'gauge', accepted: ['gauge', 'tread gauge', 'depth gauge'], hint: 'Tread measurement tool' },
        { label: 'Steer Min (Circled!)', answer: 'min 4/32', accepted: ['min 4/32', '4/32', '4/32"', '4/32 in'], hint: 'Steer tire minimum tread depth' },
        { label: 'Other Min (Circled!)', answer: '2/32', accepted: ['2/32', '2/32"', '2/32 in', 'min 2/32'], hint: 'Drive and trailer tire minimum depth' }
      ],
      audioText: 'Tires depth: gauge, minimum 4/32, 2/32.'
    },
    {
      id: 'rims',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Rims',
      name: 'rims',
      circled: '',
      instruction: 'Fill in the 5 rim defect words following "damage":',
      blanks: [
        { label: 'Defect 1', answer: 'cracked', accepted: ['cracked', 'crack'], hint: 'Metal fracturing' },
        { label: 'Defect 2', answer: 'bent', accepted: ['bent', 'bend', 'dents'], hint: 'Deformed rim lip' },
        { label: 'Defect 3', answer: 'welding', accepted: ['welding', 'welds', 'illegal welds'], hint: 'Unauthorized repair beads' },
        { label: 'Defect 4', answer: 'rust trails', accepted: ['rust trails', 'rust streaks', 'rust'], hint: 'Streaks from loose fit' },
        { label: 'Defect 5', answer: 'elongated', accepted: ['elongated', 'elongated holes'], hint: 'Oval bolt holes' }
      ],
      audioText: 'Rims: damage cracked, bent, welding, rust trails, elongated.'
    },
    {
      id: 'lug_nuts',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Lug Nuts',
      name: 'lug nuts',
      circled: '',
      instruction: 'Fill in the 4 lug nut inspection words:',
      blanks: [
        { label: 'Word 1', answer: 'present', accepted: ['present', 'all present'], hint: 'None missing' },
        { label: 'Word 2', answer: 'loose', accepted: ['loose', 'not loose'], hint: 'Tightened firmly' },
        { label: 'Word 3', answer: 'shiny threads', accepted: ['shiny threads', 'shiny', 'shiny metal'], hint: 'Indicates loose nut on aluminum' },
        { label: 'Word 4', answer: 'rust trails', accepted: ['rust trails', 'rust streaks', 'rust'], hint: 'Indicates loose nut on steel' }
      ],
      audioText: 'Lug nuts: present, loose, shiny threads, rust trails.'
    },
    {
      id: 'wheel_studs',
      category: 'tires',
      catBadge: 'Front of Vehicle / Engine Area &bull; Lug Nuts',
      name: 'Studs',
      circled: '',
      instruction: 'Fill in the 3 stud defect words:',
      blanks: [
        { label: 'Word 1', answer: 'missing', accepted: ['missing', 'none missing', 'not missing'], hint: 'Stud in wheel hub' },
        { label: 'Word 2', answer: 'loose', accepted: ['loose', 'not loose'], hint: 'Firmly anchored' },
        { label: 'Word 3', answer: 'broken', accepted: ['broken', 'not broken', 'sheared'], hint: 'Not snapped off' }
      ],
      audioText: 'Studs: missing, loose, broken.'
    },

    // Section 4: Suspension & Brakes
    {
      id: 'suspension_level',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Suspension',
      name: 'Springs/Mounts & U-Bolts, & Shocks',
      circled: '',
      instruction: 'Fill in the truck stance level check phrase:',
      blanks: [
        { label: 'Stance Check', answer: 'side/side front/back', accepted: ['side/side front/back', 'side to side front to back', 'side side front back'], hint: 'Truck not leaning in any direction' }
      ],
      audioText: 'Level side/side front/back.'
    },
    {
      id: 'leaf_spring',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Suspension',
      name: 'spring',
      circled: '',
      instruction: 'Fill in the 4 leaf spring defect words:',
      blanks: [
        { label: 'Word 1', answer: 'secure', accepted: ['secure', 'securely mounted'], hint: 'Clamped properly' },
        { label: 'Word 2', answer: 'shifted', accepted: ['shifted', 'not shifted'], hint: 'Leaves not scissored out of alignment' },
        { label: 'Word 3', answer: 'missing', accepted: ['missing', 'none missing'], hint: 'No leaf absent' },
        { label: 'Word 4', answer: 'broken', accepted: ['broken', 'not broken'], hint: 'No fractured metal leaves' }
      ],
      audioText: 'Spring: secure, shifted, missing, broken.'
    },
    {
      id: 'spring_mounts',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Suspension',
      name: 'mounts',
      circled: '',
      instruction: 'Fill in the 3 spring hanger/mount defect terms:',
      blanks: [
        { label: 'Word 1', answer: 'broken', accepted: ['broken', 'not broken'], hint: 'Fractured metal' },
        { label: 'Word 2', answer: 'cracked', accepted: ['cracked', 'not cracked'], hint: 'Surface fissures' },
        { label: 'Word 3', answer: 'missing parts', accepted: ['missing parts', 'missing', 'missing hardware'], hint: 'Bushings or bolts absent' }
      ],
      audioText: 'Mounts: broken, cracked, missing parts.'
    },
    {
      id: 'u_bolts',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Suspension',
      name: 'U-bolts',
      circled: '',
      instruction: 'Fill in the 3 U-bolt defect terms:',
      blanks: [
        { label: 'Word 1', answer: 'missing', accepted: ['missing', 'none missing'], hint: 'Both U-bolts in place' },
        { label: 'Word 2', answer: 'loose', accepted: ['loose', 'not loose'], hint: 'Nuts torqued tight' },
        { label: 'Word 3', answer: 'broken', accepted: ['broken', 'not broken'], hint: 'No sheared rods' }
      ],
      audioText: 'U-bolts: missing, loose, broken.'
    },
    {
      id: 'shocks',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Suspension',
      name: 'Shocks',
      circled: '',
      instruction: 'Fill in the 3 shock absorber inspection terms:',
      blanks: [
        { label: 'Word 1', answer: 'mounted', accepted: ['mounted', 'securely mounted'], hint: 'Bolted top and bottom' },
        { label: 'Word 2', answer: 'damage', accepted: ['damage', 'no damage', 'undamaged'], hint: 'No dents on cylinder' },
        { label: 'Word 3', answer: 'leaks', accepted: ['leaks', 'no leaks', 'leak'], hint: 'No hydraulic fluid weeping' }
      ],
      audioText: 'Shocks: mounted, damage, leaks.'
    },
    {
      id: 'brake_lines_hoses',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Brakes',
      name: 'brake lines or hoses & leaks',
      circled: '',
      instruction: 'Fill in the air line inspection words:',
      blanks: [
        { label: 'Word 1', answer: 'supply air', accepted: ['supply air', 'supplying air', 'air'], hint: 'Delivers compressed air' },
        { label: 'Word 2', answer: 'leaks', accepted: ['leaks', 'no leaks', 'leak'], hint: 'No air hissing' },
        { label: 'Word 3', answer: 'cracked', accepted: ['cracked', 'crack'], hint: 'No rubber splits' },
        { label: 'Word 4', answer: 'frayed', accepted: ['frayed', 'fray'], hint: 'No exposed braid' },
        { label: 'Word 5', answer: 'worn', accepted: ['worn', 'wear'], hint: 'No abrasion' },
        { label: 'Word 6', answer: 'coupling/fittings secure', accepted: ['coupling/fittings secure', 'fittings secure', 'couplings secure', 'fittings'], hint: 'Brass connections tight' }
      ],
      audioText: 'Brake lines or hoses and leaks: supply air, leaks, cracked, frayed, worn hoses, coupling and fittings secure.'
    },
    {
      id: 'brake_contaminates',
      category: 'suspension',
      catBadge: 'Front of Vehicle / Brakes',
      name: 'brake contaminates',
      circled: '',
      instruction: 'Fill in the 2 substances that must NOT contaminate brakes:',
      blanks: [
        { label: 'Substance 1', answer: 'oil', accepted: ['oil'], hint: 'Engine or hub lubricant' },
        { label: 'Substance 2', answer: 'grease', accepted: ['grease'], hint: 'Heavy chassis lubricant' }
      ],
      audioText: 'Brake contaminates: oil, grease.'
    },

    // Section 5: Side of Vehicle, Battery & Frame
    {
      id: 'side_lenses_reflectors',
      category: 'side',
      catBadge: 'Side of Vehicle',
      name: 'lenses & reflectors',
      circled: '',
      instruction: 'Fill in the 4 side lens/reflector inspection words:',
      blanks: [
        { label: 'Word 1', answer: 'color', accepted: ['color', 'proper color'], hint: 'Amber front, red rear' },
        { label: 'Word 2', answer: 'clean', accepted: ['clean'], hint: 'Visible and wiped clean' },
        { label: 'Word 3', answer: 'broken', accepted: ['broken', 'not broken'], hint: 'No cracks or breaks' },
        { label: 'Word 4', answer: 'missing', accepted: ['missing', 'not missing'], hint: 'All markers present' }
      ],
      audioText: 'Lenses and reflectors: color, clean, broken, missing.'
    },
    {
      id: 'side_traffic_devices',
      category: 'side',
      catBadge: 'Side of Vehicle',
      name: 'traffic monitoring devices',
      circled: '',
      instruction: 'Fill in the 5 mirror/bracket terms:',
      blanks: [
        { label: 'Word 1', answer: 'clean', accepted: ['clean'], hint: 'Clear glass' },
        { label: 'Word 2', answer: 'cracked', accepted: ['cracked', 'not cracked'], hint: 'No glass or frame cracks' },
        { label: 'Word 3', answer: 'bent', accepted: ['bent', 'not bent'], hint: 'Brackets straight' },
        { label: 'Word 4', answer: 'secure', accepted: ['secure', 'securely mounted'], hint: 'Rigid mounting' },
        { label: 'Word 5', answer: 'missing parts', accepted: ['missing parts', 'missing hardware'], hint: 'No lost hardware' }
      ],
      audioText: 'Traffic monitoring devices: clean, cracked, bent, secure, missing parts.'
    },
    {
      id: 'battery_box_defects',
      category: 'side',
      catBadge: 'Side of Vehicle',
      name: 'battery',
      circled: 'Circled on Study Sheet: corrosion, frayed',
      instruction: 'Fill in the 7 words (pay special attention to the TWO CIRCLED items!):',
      blanks: [
        { label: 'Word 1', answer: 'secure lid', accepted: ['secure lid', 'lid secure', 'lid'], hint: 'Box cover locked' },
        { label: 'Word 2', answer: 'secure', accepted: ['secure'], hint: 'Box rigidly mounted' },
        { label: 'Word 3', answer: 'tight', accepted: ['tight', 'connections tight'], hint: 'Terminals clamped firmly' },
        { label: 'Word 4 (Circled!)', answer: 'corrosion', accepted: ['corrosion', 'no corrosion'], hint: 'Circled on sheet! No white/green battery acid buildup' },
        { label: 'Word 5', answer: 'cracked', accepted: ['cracked', 'not cracked'], hint: 'Battery case not cracked' },
        { label: 'Word 6', answer: 'worn', accepted: ['worn', 'not worn'], hint: 'Insulation not rubbed thin' },
        { label: 'Word 7 (Circled!)', answer: 'frayed', accepted: ['frayed', 'not frayed'], hint: 'Circled on sheet! No exposed or shredded wires' }
      ],
      audioText: 'Battery: secure lid, secure, tight, corrosion, cracked, worn, frayed.'
    },
    {
      id: 'fuel_def_tanks',
      category: 'side',
      catBadge: 'Side of Vehicle',
      name: 'fuel tank(s)/DEF tank',
      circled: '',
      instruction: 'Fill in the 3 tank inspection words:',
      blanks: [
        { label: 'Word 1', answer: 'secure', accepted: ['secure', 'securely mounted'], hint: 'Straps and brackets tight' },
        { label: 'Word 2', answer: 'tight', accepted: ['tight', 'cap tight'], hint: 'Caps sealed firmly' },
        { label: 'Word 3', answer: 'leaks top/bottom', accepted: ['leaks top/bottom', 'leaks', 'top/bottom', 'leaks top bottom'], hint: 'No fuel or DEF weeping' }
      ],
      audioText: 'Fuel tank and DEF tank: secure, tight, leaks top/bottom.'
    },
    {
      id: 'truck_frames',
      category: 'side',
      catBadge: 'Side of Vehicle',
      name: 'frame(s)',
      circled: '',
      instruction: 'Fill in the 5 truck frame and floor inspection terms:',
      blanks: [
        { label: 'Term 1', answer: 'truck cracks', accepted: ['truck cracks', 'cracks', 'crack'], hint: 'No fractures in frame rails' },
        { label: 'Term 2', answer: 'broken welds', accepted: ['broken welds', 'welds', 'broken weld'], hint: 'No separated structural beads' },
        { label: 'Term 3', answer: 'holes', accepted: ['holes', 'unauthorized holes', 'hole'], hint: 'No illegal drilled holes' },
        { label: 'Term 4', answer: 'damage to other parts', accepted: ['damage to other parts', 'damage', 'other parts'], hint: 'Crossmembers intact' },
        { label: 'Term 5', answer: 'holes in floor', accepted: ['holes in floor', 'floor holes', 'floor'], hint: 'Floor decking solid' }
      ],
      audioText: 'Frames: truck cracks, broken welds, holes, damage to other parts, holes in floor.'
    }
  ];

  let currentIdx = 10; // Start directly at "lenses" (item 11) as requested by user!
  let activeFilter = 'all';
  let filteredItems = [...clozeItems];
  let wrongAttempts = {}; // { [itemId]: count }
  let masteredState = {}; // { [itemId]: boolean }
  let hintsShown = {};    // { [itemId]: boolean }

  function init() {
    populateDropdown();
    bindEvents();
    applyFilter('all');
  }

  function populateDropdown() {
    const select = document.getElementById('cloze-item-select');
    if (!select) return;

    select.innerHTML = clozeItems.map((item, i) => `
      <option value="${i}">[${item.catBadge}] ${item.name} (${item.blanks.length} blanks)</option>
    `).join('');

    select.value = currentIdx;
    select.addEventListener('change', () => {
      SoundFX.click();
      currentIdx = parseInt(select.value, 10);
      renderCloze();
    });
  }

  function applyFilter(filter) {
    activeFilter = filter;
    if (filter === 'all') {
      filteredItems = [...clozeItems];
    } else {
      filteredItems = clozeItems.filter(item => item.category === filter);
    }
    currentIdx = 0;
    renderCloze();
  }

  function getCurrentItem() {
    return filteredItems[currentIdx] || clozeItems[0];
  }

  function renderCloze() {
    const item = getCurrentItem();
    if (!item) return;

    // Elements
    const catBadge = document.getElementById('type-category-badge');
    const curIdxEl = document.getElementById('type-current-idx');
    const totIdxEl = document.getElementById('type-total-idx');
    const navIndicator = document.getElementById('type-nav-indicator');
    const circledPill = document.getElementById('type-circled-pill');
    const audioBtn = document.getElementById('type-audio-btn');
    const itemTitle = document.getElementById('cloze-item-title');
    const itemInstruction = document.getElementById('cloze-item-instruction');
    const blanksContainer = document.getElementById('cloze-blanks-container');
    const feedbackBox = document.getElementById('type-feedback-box');
    const hintReveal = document.getElementById('type-hint-reveal');
    const attemptDisplay = document.getElementById('type-attempt-display');
    const hintStatCard = document.getElementById('type-hint-status');
    const masteredCountEl = document.getElementById('type-mastered-count');
    const select = document.getElementById('cloze-item-select');

    // Update Dropdown sync
    if (select) {
      const globalIdx = clozeItems.findIndex(ci => ci.id === item.id);
      if (globalIdx !== -1) select.value = globalIdx;
    }

    // Populate Headers
    if (catBadge) catBadge.textContent = item.catBadge;
    if (curIdxEl) curIdxEl.textContent = currentIdx + 1;
    if (totIdxEl) totIdxEl.textContent = filteredItems.length;
    if (navIndicator) navIndicator.textContent = `Item ${currentIdx + 1} of ${filteredItems.length}: ${item.name}`;

    if (circledPill) {
      if (item.circled) {
        circledPill.style.display = 'inline-block';
        circledPill.textContent = item.circled;
      } else {
        circledPill.style.display = 'none';
      }
    }

    if (itemTitle) itemTitle.textContent = item.name;
    if (itemInstruction) {
      itemInstruction.textContent = item.instruction || `Fill in the ${item.blanks.length} exact words from the study checklist:`;
    }

    if (audioBtn) {
      audioBtn.onclick = () => {
        SoundFX.click();
        VoiceGuide.speak(item.audioText, audioBtn);
      };
    }

    // Attempts and Hint State for this item
    const misses = wrongAttempts[item.id] || 0;
    if (attemptDisplay) attemptDisplay.textContent = `${misses}/2`;
    updateHintButtonState(misses);

    // Reset Feedback
    if (feedbackBox) feedbackBox.classList.add('hidden');
    if (hintReveal) hintReveal.classList.add('hidden');
    hintsShown[item.id] = false;

    // Render the Interactive Blanks
    renderBlanks(item);

    // Update Mastered Count
    const masteredTotal = Object.values(masteredState).filter(Boolean).length;
    if (masteredCountEl) masteredCountEl.textContent = `${masteredTotal} / ${clozeItems.length}`;
  }

  function renderBlanks(item) {
    const container = document.getElementById('cloze-blanks-container');
    if (!container) return;

    container.innerHTML = item.blanks.map((b, i) => `
      <div class="cloze-blank-group">
        <label for="cloze-input-${i}" class="cloze-slot-label">Blank ${i + 1}: ${b.label}</label>
        <div class="cloze-input-row">
          <input 
            type="text" 
            id="cloze-input-${i}" 
            class="cloze-input" 
            data-index="${i}"
            placeholder="[ Type Word ]"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
          >
          ${i < item.blanks.length - 1 ? '<span class="cloze-separator">,</span>' : ''}
        </div>
        <div class="cloze-cue-text" id="cloze-cue-${i}"></div>
      </div>
    `).join('');

    // Focus first blank
    const firstInput = document.getElementById('cloze-input-0');
    if (firstInput) firstInput.focus();

    // Auto-tab on Enter or Comma
    const inputs = container.querySelectorAll('.cloze-input');
    inputs.forEach((input, idx) => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (idx < inputs.length - 1) {
            inputs[idx + 1].focus();
          } else {
            checkAnswers();
          }
        }
      });

      input.addEventListener('input', (e) => {
        // If comma entered, jump to next input
        if (input.value.includes(',')) {
          input.value = input.value.replace(/,/g, '').trim();
          if (idx < inputs.length - 1) {
            inputs[idx + 1].focus();
          }
        }
      });
    });
  }

  function updateHintButtonState(misses) {
    const hintBtn = document.getElementById('btn-type-hint');
    const hintBtnText = document.getElementById('hint-btn-text');
    const hintStatCard = document.getElementById('type-hint-status');

    if (!hintBtn) return;

    if (misses >= 2) {
      hintBtn.disabled = false;
      hintBtn.className = 'btn btn-hint unlocked';
      if (hintBtnText) hintBtnText.textContent = '💡 Show Hint (Unlocked!)';
      hintBtn.title = 'Click to reveal first-letter clues and word bank';
      if (hintStatCard) hintStatCard.textContent = 'UNLOCKED';
    } else {
      hintBtn.disabled = true;
      hintBtn.className = 'btn btn-hint locked';
      if (hintBtnText) hintBtnText.textContent = `Hint Locked (${misses}/2 Misses)`;
      hintBtn.title = 'Attempt twice to unlock the hint';
      if (hintStatCard) hintStatCard.textContent = 'LOCKED';
    }
  }

  function checkAnswers() {
    const item = getCurrentItem();
    if (!item) return;

    const container = document.getElementById('cloze-blanks-container');
    const feedbackBox = document.getElementById('type-feedback-box');
    const attemptDisplay = document.getElementById('type-attempt-display');
    if (!container || !feedbackBox) return;

    const inputs = container.querySelectorAll('.cloze-input');
    let allFilled = true;
    let correctCount = 0;
    const missingWords = [];
    const matchedWords = [];

    // Check each blank
    item.blanks.forEach((b, i) => {
      const input = inputs[i];
      if (!input) return;

      const userVal = input.value.trim().toLowerCase();
      if (!userVal) {
        allFilled = false;
      }

      // Check against accepted patterns
      const isCorrect = b.accepted.some(acc => {
        const cleanAcc = acc.toLowerCase().trim();
        return userVal === cleanAcc || 
               userVal.replace(/[^a-z0-9]/g, '') === cleanAcc.replace(/[^a-z0-9]/g, '');
      });

      if (isCorrect) {
        input.className = 'cloze-input correct';
        correctCount++;
        matchedWords.push(b.answer);
      } else {
        input.className = 'cloze-input incorrect';
        missingWords.push(b.answer);
      }
    });

    const isAllCorrect = correctCount === item.blanks.length;
    feedbackBox.classList.remove('hidden');

    if (isAllCorrect) {
      // SUCCESS!
      SoundFX.success();
      masteredState[item.id] = true;
      feedbackBox.className = 'type-feedback-container type-feedback-success';
      feedbackBox.innerHTML = `
        <div class="feedback-head">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>PERFECT CHECKLIST RECALL! (${item.blanks.length} / ${item.blanks.length} MATCHED)</span>
        </div>
        <p class="feedback-details">You accurately typed every exact word for <strong>${item.name}</strong> from Dillon Mitchell's study sheet: <em>${item.blanks.map(b => b.answer).join(', ')}</em></p>
        <div style="margin-top: 1rem;">
          <button class="btn btn-primary" id="btn-next-after-cloze-success">Next Item &rarr;</button>
        </div>
      `;

      const nextBtn = document.getElementById('btn-next-after-cloze-success');
      if (nextBtn) {
        nextBtn.onclick = () => {
          SoundFX.click();
          nextItem();
        };
      }

      // Update mastered count
      const masteredTotal = Object.values(masteredState).filter(Boolean).length;
      const masteredCountEl = document.getElementById('type-mastered-count');
      if (masteredCountEl) masteredCountEl.textContent = `${masteredTotal} / ${clozeItems.length}`;

    } else {
      // WRONG / RETRY
      SoundFX.buzzer();
      wrongAttempts[item.id] = (wrongAttempts[item.id] || 0) + 1;
      const currentMisses = wrongAttempts[item.id];

      if (attemptDisplay) attemptDisplay.textContent = `${currentMisses}/2`;
      updateHintButtonState(currentMisses);

      feedbackBox.className = 'type-feedback-container type-feedback-retry';
      feedbackBox.innerHTML = `
        <div class="feedback-head">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>INCORRECT BLANKS (${currentMisses} / 2 Misses)</span>
        </div>
        <p class="feedback-details">
          ${currentMisses >= 2 
            ? '<strong>💡 HINT UNLOCKED!</strong> You missed 2 times. Click the glowing "Show Hint" button to reveal the exact <strong>Answer Key of the words you missed</strong>!' 
            : `You got ${correctCount} of ${item.blanks.length} words correct. Fix the red blanks and try again! (Hint unlocks after 2 misses).`}
        </p>
        <div class="keyword-chips-row">
          ${matchedWords.map(m => `<span class="kw-chip kw-matched">✓ ${escapeHtml(m)}</span>`).join('')}
          ${missingWords.map(m => `<span class="kw-chip kw-missing">✗ Needs Correction</span>`).join('')}
        </div>
      `;
    }
  }

  function toggleHint() {
    const item = getCurrentItem();
    if (!item) return;

    const hintReveal = document.getElementById('type-hint-reveal');
    const hintContent = document.getElementById('type-hint-content');
    if (!hintReveal || !hintContent) return;

    SoundFX.click();

    if (!hintReveal.classList.contains('hidden')) {
      hintReveal.classList.add('hidden');
      return;
    }

    hintReveal.classList.remove('hidden');

    const container = document.getElementById('cloze-blanks-container');
    const inputs = container ? container.querySelectorAll('.cloze-input') : [];

    // Analyze each blank to see which ones the user missed or left blank
    const missedList = [];
    const correctList = [];

    item.blanks.forEach((b, i) => {
      const input = inputs[i];
      const userVal = input ? input.value.trim() : '';
      const userValLower = userVal.toLowerCase();

      const isCorrect = b.accepted.some(acc => {
        const cleanAcc = acc.toLowerCase().trim();
        return userValLower === cleanAcc || 
               userValLower.replace(/[^a-z0-9]/g, '') === cleanAcc.replace(/[^a-z0-9]/g, '');
      });

      if (isCorrect) {
        correctList.push({
          idx: i,
          blankNum: i + 1,
          label: b.label,
          answer: b.answer
        });
      } else {
        missedList.push({
          idx: i,
          blankNum: i + 1,
          label: b.label,
          answer: b.answer,
          userVal: userVal,
          hint: b.hint
        });
      }
    });

    // 1. Update inline cues beneath each blank input
    item.blanks.forEach((b, i) => {
      const cueEl = document.getElementById(`cloze-cue-${i}`);
      if (!cueEl) return;

      const isMissed = missedList.some(m => m.idx === i);
      if (isMissed) {
        cueEl.innerHTML = `
          <span class="cue-missed-highlight">
            ❌ Missed: Answer is <strong>"${escapeHtml(b.answer)}"</strong>
            <button class="btn-quick-fill-cue" data-idx="${i}" data-word="${escapeHtml(b.answer)}" title="Fill this blank">Fill</button>
          </span>
        `;
      } else {
        cueEl.innerHTML = `
          <span class="cue-correct-highlight">
            ✓ Correct! (${escapeHtml(b.answer)})
          </span>
        `;
      }
    });

    // 2. Build the Missed Words Answer Key HTML
    let missedHtml = '';
    if (missedList.length > 0) {
      missedHtml = `
        <div class="hint-missed-keys-box">
          <div class="missed-keys-header">
            <div class="mkh-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2l-2 2m-6 6l7-7m-7 7l-2 2m-2-2l2 2m-6 6l7-7m-7 7l-2 2m-2-2l2 2"/></svg>
              <span>🎯 ANSWER KEY FOR THE WORD${missedList.length > 1 ? 'S' : ''} YOU MISSED:</span>
            </div>
            <button class="btn-fill-all-missed" id="btn-fill-all-missed" title="Auto-fill all missed words into blanks">
              ⚡ Auto-Fill Missed Words
            </button>
          </div>
          <div class="missed-keys-list">
            ${missedList.map(m => `
              <div class="missed-key-row">
                <div class="mkr-left">
                  <span class="mkr-slot">Blank ${m.blankNum} (${escapeHtml(m.label)}):</span>
                  <span class="mkr-answer-word">${escapeHtml(m.answer)}</span>
                  ${m.userVal ? `<span class="mkr-your-attempt">(You typed: <del>${escapeHtml(m.userVal)}</del>)</span>` : '<span class="mkr-empty-note">(Left blank)</span>'}
                </div>
                <button class="btn-insert-single-answer" data-idx="${m.idx}" data-word="${escapeHtml(m.answer)}">
                  Insert "${escapeHtml(m.answer)}" &rarr;
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      missedHtml = `
        <div class="hint-missed-keys-box" style="border-color: var(--emerald-primary);">
          <div class="mkh-title" style="color: #6ee7b7;">
            <span>✓ All ${item.blanks.length} blanks are currently filled correctly! Click "Check My Words" to lock in your score!</span>
          </div>
        </div>
      `;
    }

    // 3. Word Bank Chips
    const words = item.blanks.map(b => b.answer);
    const shuffled = [...words].sort(() => 0.5 - Math.random());

    hintContent.innerHTML = `
      ${missedHtml}
      
      <div class="full-key-summary">
        <strong>Full Checklist Answer Key for ${escapeHtml(item.name)}:</strong> 
        ${item.blanks.map((b, i) => `Blank ${i + 1}: <strong>${escapeHtml(b.answer)}</strong>`).join(' &bull; ')}
      </div>

      <div style="margin-top: 1rem;">
        <p style="margin-bottom: 0.5rem; font-size: 0.88rem; color: #fde68a;"><strong>Clickable Word Bank:</strong></p>
        <div class="cloze-hint-chips">
          ${shuffled.map(w => `<button class="hint-word-tag" data-word="${escapeHtml(w)}">${escapeHtml(w)}</button>`).join('')}
        </div>
      </div>

      <p style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-dim);">
        <strong>Examiner Guidance:</strong> ${item.blanks.map((b, i) => `<em>Blank ${i + 1}: ${escapeHtml(b.hint)}</em>`).join(' &bull; ')}
      </p>

      ${item.circled ? `<div class="note-box" style="margin-top: 0.75rem;"><strong>📌 Dillon Mitchell's Study Sheet Note:</strong> ${escapeHtml(item.circled)}</div>` : ''}
    `;

    // 4. Attach Click Handlers for Instant Insert Buttons
    // Auto-fill all missed
    const fillAllBtn = document.getElementById('btn-fill-all-missed');
    if (fillAllBtn) {
      fillAllBtn.addEventListener('click', () => {
        SoundFX.click();
        missedList.forEach(m => {
          if (inputs[m.idx]) {
            inputs[m.idx].value = m.answer;
            inputs[m.idx].className = 'cloze-input correct';
          }
          const cueEl = document.getElementById(`cloze-cue-${m.idx}`);
          if (cueEl) cueEl.innerHTML = `<span class="cue-correct-highlight">✓ Inserted: ${escapeHtml(m.answer)}</span>`;
        });
      });
    }

    // Insert single answer from hint row
    hintContent.querySelectorAll('.btn-insert-single-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.click();
        const idx = parseInt(btn.dataset.idx, 10);
        const word = btn.dataset.word;
        if (inputs[idx]) {
          inputs[idx].value = word;
          inputs[idx].className = 'cloze-input correct';
          inputs[idx].focus();
        }
        const cueEl = document.getElementById(`cloze-cue-${idx}`);
        if (cueEl) cueEl.innerHTML = `<span class="cue-correct-highlight">✓ Inserted: ${escapeHtml(word)}</span>`;
      });
    });

    // Quick fill from cue below inputs
    container.querySelectorAll('.btn-quick-fill-cue').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.click();
        const idx = parseInt(btn.dataset.idx, 10);
        const word = btn.dataset.word;
        if (inputs[idx]) {
          inputs[idx].value = word;
          inputs[idx].className = 'cloze-input correct';
          inputs[idx].focus();
        }
        const cueEl = document.getElementById(`cloze-cue-${idx}`);
        if (cueEl) cueEl.innerHTML = `<span class="cue-correct-highlight">✓ Inserted: ${escapeHtml(word)}</span>`;
      });
    });

    // Word Bank Tag click
    hintContent.querySelectorAll('.hint-word-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        SoundFX.click();
        const word = tag.dataset.word;
        for (let input of inputs) {
          if (!input.value.trim() || input.classList.contains('incorrect')) {
            input.value = word;
            input.focus();
            break;
          }
        }
      });
    });
  }

  function nextItem() {
    SoundFX.click();
    currentIdx = (currentIdx + 1) % filteredItems.length;
    renderCloze();
  }

  function prevItem() {
    SoundFX.click();
    currentIdx = (currentIdx - 1 + filteredItems.length) % filteredItems.length;
    renderCloze();
  }

  function clearBlanks() {
    SoundFX.click();
    const container = document.getElementById('cloze-blanks-container');
    if (!container) return;
    const inputs = container.querySelectorAll('.cloze-input');
    inputs.forEach(input => {
      input.value = '';
      input.className = 'cloze-input';
    });
    const cues = container.querySelectorAll('.cloze-cue-text');
    cues.forEach(c => c.textContent = '');
    const feedbackBox = document.getElementById('type-feedback-box');
    if (feedbackBox) feedbackBox.classList.add('hidden');
    if (inputs[0]) inputs[0].focus();
  }

  function bindEvents() {
    const submitBtn = document.getElementById('btn-type-submit');
    const clearBtn = document.getElementById('btn-type-clear');
    const hintBtn = document.getElementById('btn-type-hint');
    const nextBtn = document.getElementById('btn-type-next');
    const prevBtn = document.getElementById('btn-type-prev');

    if (submitBtn) submitBtn.addEventListener('click', checkAnswers);
    if (clearBtn) clearBtn.addEventListener('click', clearBlanks);
    if (hintBtn) hintBtn.addEventListener('click', toggleHint);
    if (nextBtn) nextBtn.addEventListener('click', nextItem);
    if (prevBtn) prevBtn.addEventListener('click', prevItem);

    // Section Filters
    const chips = document.querySelectorAll('.type-filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        SoundFX.click();
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilter(chip.dataset.typeFilter);
      });
    });
  }

  function jumpToItem(itemId) {
    const globalIdx = clozeItems.findIndex(ci => ci.id === itemId);
    if (globalIdx === -1) return;

    activeFilter = 'all';
    filteredItems = [...clozeItems];
    const chips = document.querySelectorAll('.type-filter-chip');
    chips.forEach(c => {
      if (c.dataset.typeFilter === 'all') c.classList.add('active');
      else c.classList.remove('active');
    });

    currentIdx = globalIdx;
    renderCloze();

    // Switch to typing pane if needed
    const typingTab = document.querySelector('.nav-tab[data-tab="typing"]');
    if (typingTab && !typingTab.classList.contains('active')) {
      typingTab.click();
    }

    const clozeCard = document.getElementById('cloze-card');
    if (clozeCard) {
      clozeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return { 
    init, 
    jumpToItem, 
    getAllItems: () => clozeItems 
  };
})();

// =============================================================================
// Question Cheat Sheet Engine (Modal & Tab 7 Master Table)
// =============================================================================
const QuestionCheatSheet = (() => {
  let currentModalFilter = 'all';
  let currentModalSearch = '';

  function init() {
    bindModalEvents();
    bindTab7Events();
    renderModalCards();
    renderTab7Table();
  }

  function bindModalEvents() {
    const modal = document.getElementById('cheatsheet-modal');
    const openBtn = document.getElementById('btn-open-question-cheatsheet');
    const closeBtn = document.getElementById('btn-close-cheatsheet');
    const doneBtn = document.getElementById('btn-cheatsheet-done');
    const searchInput = document.getElementById('cheatsheet-search-input');
    const pills = document.querySelectorAll('#cheatsheet-pills .cs-pill');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        SoundFX.click();
        openModal();
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (doneBtn) doneBtn.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentModalSearch = searchInput.value.trim().toLowerCase();
        renderModalCards();
      });
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        SoundFX.click();
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentModalFilter = pill.dataset.csFilter;
        renderModalCards();
      });
    });
  }

  function openModal() {
    const modal = document.getElementById('cheatsheet-modal');
    if (modal) {
      modal.classList.remove('hidden');
      renderModalCards();
      const input = document.getElementById('cheatsheet-search-input');
      if (input) input.focus();
    }
  }

  function closeModal() {
    SoundFX.click();
    const modal = document.getElementById('cheatsheet-modal');
    if (modal) modal.classList.add('hidden');
  }

  function filterItems(items, filter, search) {
    return items.filter(item => {
      const matchesCat = filter === 'all' || item.category === filter;
      if (!matchesCat) return false;
      if (!search) return true;

      const nameMatch = item.name.toLowerCase().includes(search);
      const catMatch = item.catBadge.toLowerCase().includes(search);
      const wordsMatch = item.blanks.some(b => b.answer.toLowerCase().includes(search) || (b.hint && b.hint.toLowerCase().includes(search)));
      const noteMatch = item.circled && item.circled.toLowerCase().includes(search);
      return nameMatch || catMatch || wordsMatch || noteMatch;
    });
  }

  function renderModalCards() {
    const container = document.getElementById('cheatsheet-items-container');
    if (!container) return;

    const allItems = ClozeFillDrill.getAllItems();
    const filtered = filterItems(allItems, currentModalFilter, currentModalSearch);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; color: var(--text-dim);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">No questions matched your search "${escapeHtml(currentModalSearch)}".</p>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Try searching by component (e.g. lenses, rims, battery, lug nuts, belt).</span>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const globalIdx = allItems.findIndex(ci => ci.id === item.id);
      return `
        <div class="cs-item-card">
          <div>
            <div class="cs-item-header">
              <div class="cs-item-title-box">
                <span class="cs-item-num">#${globalIdx + 1}</span>
                <span class="cs-item-name">${escapeHtml(item.name)}</span>
              </div>
              <span class="cs-zone-badge">${escapeHtml(item.catBadge)}</span>
            </div>
            
            <div class="cs-answer-keys-row" style="margin-top: 0.75rem;">
              <span class="cs-answer-label">Exact Answer Key Words:</span>
              <div class="cs-answer-chips">
                ${item.blanks.map(b => `<span class="cs-word-tag">${escapeHtml(b.answer)}</span>`).join('')}
              </div>
            </div>

            ${item.circled ? `<div class="cs-item-note"><strong>Study Note:</strong> ${escapeHtml(item.circled)}</div>` : ''}
          </div>

          <div class="cs-item-actions">
            <button class="btn-practice-item" data-id="${item.id}">
              ✍️ Practice In Drill &rarr;
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-practice-item').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.click();
        const id = btn.dataset.id;
        closeModal();
        ClozeFillDrill.jumpToItem(id);
      });
    });
  }

  function bindTab7Events() {
    const searchInput = document.getElementById('tab7-search-input');
    const pills = document.querySelectorAll('#tab7-pills .cs-pill');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderTab7Table();
      });
    }

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        SoundFX.click();
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderTab7Table();
      });
    });
  }

  function renderTab7Table() {
    const tbody = document.getElementById('master-questions-tbody');
    if (!tbody) return;

    const searchInput = document.getElementById('tab7-search-input');
    const search = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const activePill = document.querySelector('#tab7-pills .cs-pill.active');
    const filter = activePill ? activePill.dataset.tab7Filter : 'all';

    const allItems = ClozeFillDrill.getAllItems();
    const filtered = filterItems(allItems, filter, search);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-dim);">
            No checklist questions matched "${escapeHtml(search)}".
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const globalIdx = allItems.findIndex(ci => ci.id === item.id);
      return `
        <tr>
          <td><span class="table-num-badge">#${globalIdx + 1}</span></td>
          <td><span class="cs-zone-badge">${escapeHtml(item.catBadge)}</span></td>
          <td>
            <span class="table-item-name">${escapeHtml(item.name)}</span>
            ${item.circled ? `<div style="font-size: 0.78rem; color: var(--amber-light); margin-top: 0.2rem;">${escapeHtml(item.circled)}</div>` : ''}
          </td>
          <td>
            <div class="table-answer-chips">
              ${item.blanks.map(b => `<span class="table-word-pill">${escapeHtml(b.answer)}</span>`).join('')}
            </div>
          </td>
          <td>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${item.blanks.map(b => escapeHtml(b.hint)).join('; ')}</span>
          </td>
          <td style="text-align: center;">
            <button class="btn btn-xs btn-outline btn-tab7-practice" data-id="${item.id}">
              Practice &rarr;
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-tab7-practice').forEach(btn => {
      btn.addEventListener('click', () => {
        SoundFX.click();
        ClozeFillDrill.jumpToItem(btn.dataset.id);
      });
    });
  }

  return { init, openModal, closeModal, renderModalCards, renderTab7Table };
})();

// =============================================================================
// App Initialization
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAudioButtons();
  ClozeFillDrill.init();
  QuestionCheatSheet.init();
  Simulator.init();
  FlashcardsLab.init();
  QuizLab.init();
  initPhotoViewer();
});

