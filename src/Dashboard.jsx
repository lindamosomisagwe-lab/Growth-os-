import React, { useEffect, useRef } from "react";
import { auth } from "./firebase-config";
import "./index.css";

const Dashboard = ({ user }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // We need to inject the script dynamically so it runs
    // Since React dangerouslySetInnerHTML doesn't execute script tags
    const script = document.createElement("script");
    script.innerHTML = `
    /* ══════════════════════════════════════════
       FIREBASE INITIALIZATION
       ══════════════════════════════════════════ */
    const firebaseConfig = {
      apiKey:            'AIzaSyBdxjq14Ky6a3n9IMj4LdO_lagVggqKnRY',
      authDomain:        'growth-os-c892b.firebaseapp.com',
      projectId:         'growth-os-c892b',
      storageBucket:     'growth-os-c892b.firebasestorage.app',
      messagingSenderId: '903565722912',
      appId:             '1:903565722912:web:a72984814f4fc7f4820345',
      measurementId:     'G-GYE4W6HVS5'
    };

    const fbApp     = firebase.initializeApp(firebaseConfig);
    const analytics = firebase.analytics();
    const db        = firebase.firestore();
    const auth      = firebase.auth();
    let firestoreUserId = null;   // set after anonymous sign-in

    /* ══════════════════════════════════════════
       PAGE COLOUR SYSTEM
       ══════════════════════════════════════════ */
    const PAGE_COLORS = {
      home:    { accent: '#7C5CFC', grad: 'linear-gradient(135deg,#7C5CFC,#5B3FD4)', bg: 'linear-gradient(160deg,#1a0533 0%,#2d0f55 40%,#09080F 100%)' },
      balance: { accent: '#4FACFE', grad: 'linear-gradient(135deg,#4FACFE,#00C6FF)', bg: 'linear-gradient(160deg,#0c2a4a 0%,#0f3d6e 40%,#09080F 100%)' },
      goals:   { accent: '#F05A7E', grad: 'linear-gradient(135deg,#F05A7E,#E83B6A)', bg: 'linear-gradient(160deg,#2d0a1e 0%,#5c1035 40%,#09080F 100%)' },
      today:   { accent: '#43E97B', grad: 'linear-gradient(135deg,#43E97B,#38F9D7)', bg: 'linear-gradient(160deg,#052e16 0%,#0a4a26 40%,#09080F 100%)' },
      vault:   { accent: '#A78BFA', grad: 'linear-gradient(135deg,#A78BFA,#8B5CF6)', bg: 'linear-gradient(160deg,#1a0c2e 0%,#2e1555 40%,#09080F 100%)' }
    };

    const PAGE_HEADINGS = {
      home:    { h: 'Home.',           sub: 'Your personal growth dashboard' }, // actual greeting set by applyHomeHeading()
      balance: { h: 'Life Balance.',   sub: 'Wheel of Life Assessment' },
      goals:   { h: 'Goals Map.',      sub: 'Chapter 1 — Foundation' },
      today:   { h: "Today's Log.",    sub: 'Check in, track your day' },
      vault:   { h: 'Time Vault.',     sub: 'Letters to your future self' }
    };

    /* ══════════════════════════════════════════
       DYNAMIC GREETING — time-aware home heading
       ══════════════════════════════════════════ */
    function getDynamicHomeHeading() {
      const now  = new Date();
      const hour = now.getHours();

      // Greeting + emoji based on time of day
      let greeting, emoji;
      if (hour >= 5 && hour < 12) {
        greeting = 'Good morning.'; emoji = '☀️';
      } else if (hour >= 12 && hour < 17) {
        greeting = 'Good afternoon.'; emoji = '🌤️';
      } else if (hour >= 17 && hour < 21) {
        greeting = 'Good evening.'; emoji = '🌇';
      } else {
        greeting = 'Good night.'; emoji = '🌛';
      }

      // Real formatted date: "Monday, June 1"
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      return { h: greeting, sub: dateStr, emoji };
    }

    function applyHomeHeading() {
      const { h, sub, emoji } = getDynamicHomeHeading();
      const headingEl  = document.getElementById('page-heading');
      const dateEl     = document.getElementById('heading-date');   // date span
      const subEl      = document.getElementById('page-subheading');
      const emojiEl    = document.getElementById('greeting-emoji');

      if (headingEl) headingEl.textContent = h;
      if (dateEl)    dateEl.textContent    = sub;   // only the date portion
      if (emojiEl)   emojiEl.textContent   = emoji;

      // On non-date subheadings (other pages) sub is just a plain element with textContent;
      // only override when subEl has no children (i.e. other pages)
    }

    /* Live clock — ticks every second inside #live-clock */
    function tickClock() {
      const el = document.getElementById('live-clock');
      if (!el) return;
      const now = new Date();
      const hh  = String(now.getHours()).padStart(2, '0');
      const mm  = String(now.getMinutes()).padStart(2, '0');
      const ss  = String(now.getSeconds()).padStart(2, '0');
      el.textContent = \`\${hh}:\${mm}:\${ss}\`;
    }

    let currentPage = 'home';

    function setPageColor(page) {
      const c    = PAGE_COLORS[page];
      const root = document.documentElement;
      const shell = document.querySelector('.app-shell');

      // 1. Update CSS accent/gradient variables (buttons, cards, rings, etc.)
      root.style.setProperty('--color-accent', c.accent);
      root.style.setProperty('--grad-accent',  c.grad);
      root.style.setProperty('--bg-page',      c.bg);

      if (shell) {
        // 2. Crossfade technique for smooth background transitions.
        //    CSS gradients can't tween, so we set the new bg on the ::before
        //    overlay and fade it in, then commit and reset.
        shell.style.setProperty('--bg-next', c.bg);
        shell.classList.add('transitioning');
        clearTimeout(shell._bgTimer);
        shell._bgTimer = setTimeout(() => {
          shell.style.background = c.bg;
          shell.classList.remove('transitioning');
          shell.style.removeProperty('--bg-next');
        }, 700);
      }

      // 3. Logo mark gradient
      const logoMark = document.getElementById('logo-mark');
      if (logoMark) logoMark.style.background = c.grad;

      // 4. Page heading glow in section colour
      const heading = document.getElementById('page-heading');
      if (heading) heading.style.textShadow =
        \`0 0 40px color-mix(in srgb, \${c.accent} 60%, transparent)\`;
    }


    function navigateTo(page) {
      if (page === currentPage) return;
      currentPage = page;

      // Switch nav active state
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const navEl = document.getElementById('nav-' + page);
      if (navEl) navEl.classList.add('active');

      // Update page colour
      setPageColor(page);

      // Update heading — home gets dynamic greeting, other pages use static labels
      if (page === 'home') {
        applyHomeHeading();
        // Show the live clock on home
        const clockEl = document.getElementById('live-clock');
        if (clockEl) clockEl.style.display = '';
        const dateEl  = document.getElementById('heading-date');
        if (dateEl) dateEl.style.display = '';
      } else {
        const h = PAGE_HEADINGS[page];
        const headingEl    = document.getElementById('page-heading');
        const subheadingEl = document.getElementById('page-subheading');
        const emojiEl      = document.getElementById('greeting-emoji');
        if (headingEl)    headingEl.textContent    = h.h;
        // For other pages write directly into page-subheading text
        // (the inner spans remain but we just swap heading-date text)
        const dateEl = document.getElementById('heading-date');
        if (dateEl) dateEl.textContent = h.sub;
        // Hide clock on non-home pages
        const clockEl = document.getElementById('live-clock');
        if (clockEl) clockEl.style.display = 'none';
        if (emojiEl) emojiEl.textContent = ''; // clear emoji on non-home pages
      }

      // Switch page view
      document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
      const targetPage = document.getElementById('page-' + page);
      if (targetPage) targetPage.classList.add('active');

      // Stagger card entrances
      staggerCards(targetPage);
    }

    function staggerCards(container) {
      if (!container) return;
      const cards = container.querySelectorAll('.card');
      cards.forEach((card, i) => {
        card.style.animation = 'none';
        card.style.opacity = '0';
        card.style.transform = 'translateY(14px)';
        // Force reflow
        void card.offsetWidth;
        card.style.animation = '';
        card.classList.remove('entering');
        setTimeout(() => {
          card.classList.add('entering');
        }, i * 75);
      });
    }

    /* ══════════════════════════════════════════
       NUMBER TICKER
       ══════════════════════════════════════════ */
    function tickNumber(element, from, to, duration = 620) {
      const start = performance.now();
      function update(time) {
        const progress = Math.min((time - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(from + (to - from) * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    /* ══════════════════════════════════════════
       XP FLOAT
       ══════════════════════════════════════════ */
    function spawnXPFloat(x, y, amount) {
      const el = document.createElement('div');
      el.className = 'xp-float-el';
      el.textContent = '+' + amount + ' XP';
      el.style.left = (x - 30) + 'px';
      el.style.top  = (y - 20) + 'px';
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }

    /* ══════════════════════════════════════════
       STREAK BOUNCE
       ══════════════════════════════════════════ */
    function bounceStreak() {
      const el = document.getElementById('streak-emoji');
      el.classList.remove('streak-bounce');
      void el.offsetWidth;
      el.classList.add('streak-bounce');
      el.addEventListener('animationend', () => el.classList.remove('streak-bounce'), { once: true });
    }

    /* ══════════════════════════════════════════
       TOAST
       ══════════════════════════════════════════ */
    function showToast(message, page) {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast';
      const pageColor = page ? PAGE_COLORS[page]?.accent : PAGE_COLORS[currentPage]?.accent;
      toast.style.borderLeftColor = pageColor || 'var(--color-accent)';
      toast.innerHTML = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('dismissing');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
      }, 2800);
    }

    /* ══════════════════════════════════════════
       CLAIM REWARD
       ══════════════════════════════════════════ */
    function claimReward(e) {
      const btn = document.getElementById('claim-btn');
      if (btn.disabled) return;
      btn.disabled = true;

      // XP float
      spawnXPFloat(e.clientX, e.clientY, 150);

      // Streak bounce
      bounceStreak();

      // Tick XP
      const xpEl = document.getElementById('xp-count');
      tickNumber(xpEl, 1240, 1390);

      // Gift animation stop
      const gift = document.getElementById('gift-box');
      gift.style.animation = 'none';
      gift.textContent = '✨';

      // Button update
      btn.textContent = '🎉 Reward Claimed!';
      btn.style.background = 'linear-gradient(135deg,#2D6A4F,#1B4332)';
      btn.style.borderBottomColor = '#0d2b1f';

      showToast('🎁 <strong>+150 XP</strong> added to your account!', 'home');
      syncToFirestore();
    }

    /* ══════════════════════════════════════════
       COMPLETE QUEST
       ══════════════════════════════════════════ */
    function completeQuest(e, btn) {
      spawnXPFloat(e.clientX, e.clientY, 75);
      bounceStreak();
      const xpEl = document.getElementById('xp-count');
      const cur = parseInt(xpEl.textContent.replace(/,/g,''));
      tickNumber(xpEl, cur, cur + 75);

      // Progress bar to 100%
      const fill = btn.closest('.card').querySelector('.quest-fill');
      if (fill) fill.style.width = '100%';

      btn.textContent = '✓ Done!';
      btn.disabled = true;
      showToast('⚔️ Quest complete! <strong>+75 XP</strong>', 'today');
      syncToFirestore();
    }

    /* ══════════════════════════════════════════
       MOOD LOG
       ══════════════════════════════════════════ */
    function selectMood(btn) {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    }

    function logMood(e, btn) {
      const selected = document.querySelector('.mood-btn.selected');
      if (!selected) { showToast('👆 Select a mood first!', 'today'); return; }
      // Persist today's mood in the weekly strip data
      MOODS[adjustedToday] = 'logged-' + selected.dataset.mood;
      buildWeeklyStrip();
      spawnXPFloat(e.clientX, e.clientY, 30);
      const xpEl = document.getElementById('xp-count');
      const cur = parseInt(xpEl.textContent.replace(/,/g,''));
      tickNumber(xpEl, cur, cur + 30);
      btn.textContent = '✅ Mood Logged!';
      btn.disabled = true;
      showToast(\`\${selected.querySelector('.mood-emoji').textContent} Mood logged! <strong>+30 XP</strong>\`, 'today');
      syncToFirestore();
    }

    /* ══════════════════════════════════════════
       SLIDER SYNC
       ══════════════════════════════════════════ */
    function updateSlider(input) {
      const row = input.closest('.slider-row');
      if (row) row.querySelector('.slider-score').textContent = input.value;
      updateBalanceRing();
    }

    /* ══════════════════════════════════════════
       WEEKLY MOOD STRIP
       ══════════════════════════════════════════ */
    const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayDow = new Date().getDay();
    const adjustedToday = todayDow === 0 ? 6 : todayDow - 1;
    const MOODS = [null, 'logged-happy', 'logged-content', null, 'logged-neutral', null, null];
    const MOOD_EMOJI = {
      'logged-happy':   '😊',
      'logged-content': '😌',
      'logged-neutral': '😐',
      'logged-sad':     '😢',
      'logged-angry':   '😠'
    };

    function buildWeeklyStrip() {
      const strip = document.getElementById('weekly-strip');
      strip.innerHTML = '';
      DAYS.forEach((day, i) => {
        const isToday = i === adjustedToday;
        const mood = MOODS[i];

        const col = document.createElement('div');
        col.className = 'day-col';

        const circle = document.createElement('div');
        circle.className = 'day-circle' + (mood ? ' ' + mood : '');
        if (mood && MOOD_EMOJI[mood]) circle.textContent = MOOD_EMOJI[mood];

        const label = document.createElement('div');
        label.className = 'day-label' + (isToday ? ' today' : '');
        label.textContent = day;

        col.append(circle, label);
        if (isToday) {
          const dot = document.createElement('div');
          dot.className = 'today-dot';
          col.appendChild(dot);
        }
        strip.appendChild(col);
      });
    }

    /* ══════════════════════════════════════════
       HYDRATION GLASSES
       ══════════════════════════════════════════ */
    let filledGlasses = 0;
    const TOTAL_GLASSES = 8;

    function buildGlasses() {
      const container = document.getElementById('water-glasses');
      if (!container) return;
      container.innerHTML = '';
      for (let i = 0; i < TOTAL_GLASSES; i++) {
        const g = document.createElement('div');
        g.className = 'water-glass' + (i < filledGlasses ? ' filled' : '');
        const fill = document.createElement('div');
        fill.className = 'water-fill';
        g.appendChild(fill);
        g.onclick = () => toggleGlass(i);
        container.appendChild(g);
      }
      const lbl = document.getElementById('water-label');
      if (lbl) lbl.textContent = \`\${filledGlasses} of \${TOTAL_GLASSES} glasses\`;
    }

    function toggleGlass(idx) {
      filledGlasses = filledGlasses === idx + 1 ? idx : idx + 1;
      buildGlasses();
      syncToFirestore();
    }

    /* ══════════════════════════════════════════
       DAILY TASKS
       ══════════════════════════════════════════ */
    const TASKS = [
      { text: '5 min meditation', done: false },
      { text: 'Journal entry',    done: true  },
      { text: 'Evening walk',     done: false },
    ];

    function buildTasks() {
      const list = document.getElementById('task-list');
      if (!list) return;
      list.innerHTML = '';
      TASKS.forEach((task, i) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; align-items:center; gap:12px; cursor:pointer;';
        row.onclick = () => toggleTask(i, row);

        const checkbox = document.createElement('div');
        checkbox.style.cssText = \`width:22px; height:22px; border-radius:6px; border:2px solid \${task.done ? 'var(--color-today)' : 'rgba(255,255,255,0.25)'}; background:\${task.done ? 'rgba(67,233,123,0.25)' : 'transparent'}; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s;\`;
        if (task.done) {
          checkbox.innerHTML = \`<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path class="check-path" d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>\`;
        }

        const label = document.createElement('span');
        label.textContent = task.text;
        label.style.cssText = \`font-size:14px; font-weight:500; color:\${task.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)'}; position:relative; transition:color 0.2s;\`;
        if (task.done) label.classList.add('task-done');

        row.append(checkbox, label);
        list.appendChild(row);
      });
    }

    function toggleTask(i, row) {
      TASKS[i].done = !TASKS[i].done;
      buildTasks();
      if (TASKS[i].done) {
        const rect = row.getBoundingClientRect();
        spawnXPFloat(rect.left + 20, rect.top, 20);
        const xpEl = document.getElementById('xp-count');
        const cur = parseInt(xpEl.textContent.replace(/,/g,''));
        tickNumber(xpEl, cur, cur + 20);
      }
      syncToFirestore();
    }

    /* ══════════════════════════════════════════
       BALANCE RING — live update from slider values
       ══════════════════════════════════════════ */
    function updateBalanceRing() {
      const sliders = document.querySelectorAll('.balance-range');
      if (!sliders.length) return;
      const values = Array.from(sliders).map(s => parseInt(s.value));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const circumference = 138.2;  /* 2π × r(22) */
      const dashoffset = circumference * (1 - avg / 10);
      const circle = document.getElementById('balance-ring-circle');
      const label  = document.getElementById('balance-ring-label');
      if (circle) circle.style.strokeDashoffset = dashoffset.toFixed(1);
      if (label)  label.textContent = avg.toFixed(1);
    }

    /* ══════════════════════════════════════════
       VAULT DAYS — days since last sealed letter
       ══════════════════════════════════════════ */
    function updateVaultDays() {
      const el = document.getElementById('vault-days');
      if (!el) return;
      const stored = localStorage.getItem('lm_lastLetterTs');
      if (!stored) { el.textContent = '0 days'; return; }
      const days = Math.floor((Date.now() - parseInt(stored)) / 86_400_000);
      el.textContent = days === 0 ? 'today' : \`\${days} day\${days !== 1 ? 's' : ''}\`;
    }

    /* ══════════════════════════════════════════
       MODAL SYSTEM
       ══════════════════════════════════════════ */
    function openModal(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('open');
      // Focus first input for accessibility
      const input = el.querySelector('input, textarea, select');
      if (input) setTimeout(() => input.focus(), 180);
    }
    function closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.classList.remove('open');
    }

    /* ══════════════════════════════════════════
       SETTINGS
       ══════════════════════════════════════════ */
    function showSettings() { openModal('settings-modal'); }

    function exportData() {
      const data = {
        exportedAt: new Date().toISOString(),
        streak:     parseInt(document.getElementById('streak-count').textContent),
        xp:         parseInt(document.getElementById('xp-count').textContent.replace(/,/g, '')),
        tasks:      TASKS,
        moods:      MOODS
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`lifemart-export-\${new Date().toISOString().slice(0,10)}.json\`;
      a.click();
      showToast('📁 Data exported!', 'vault');
    }

    /* ══════════════════════════════════════════
       ADD GOAL
       ══════════════════════════════════════════ */
    function addGoal() { openModal('goal-modal'); }

    function submitGoal() {
      const title = document.getElementById('goal-title-input').value.trim();
      if (!title) { showToast('👆 Enter a goal title first!', 'goals'); return; }
      showToast(\`🎯 Goal "\${title}" added!\`, 'goals');
      document.getElementById('goal-title-input').value = '';
      document.getElementById('goal-desc-input').value = '';
      closeModal('goal-modal');
    }

    /* ══════════════════════════════════════════
       WRITE LETTER
       ══════════════════════════════════════════ */
    function writeLetter() { openModal('letter-modal'); }

    function submitLetter() {
      const body = document.getElementById('letter-body-input').value.trim();
      if (!body) { showToast('✏️ Write something first!', 'vault'); return; }
      const days = parseInt(document.getElementById('letter-open-select').value);
      const openDate = new Date();
      openDate.setDate(openDate.getDate() + days);
      const dateStr = openDate.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
      localStorage.setItem('lm_lastLetterTs', Date.now().toString());
      updateVaultDays();
      syncToFirestore();
      showToast(\`✉️ Letter sealed! Opens \${dateStr}\`, 'vault');
      document.getElementById('letter-body-input').value = '';
      closeModal('letter-modal');
    }

    /* ══════════════════════════════════════════
       ADD TASK
       ══════════════════════════════════════════ */
    function addTask() { openModal('task-modal'); }

    function submitTask() {
      const input = document.getElementById('task-title-input');
      const text = input.value.trim();
      if (!text) { showToast('👆 Enter a task name first!', 'today'); return; }
      TASKS.push({ text, done: false });
      buildTasks();
      input.value = '';
      closeModal('task-modal');
      showToast('✅ Task added!', 'today');
      syncToFirestore();
    }

    /* ══════════════════════════════════════════
       FIRESTORE SYNC
       ══════════════════════════════════════════ */

    /**
     * Write the full app state to Firestore under the anonymous user's doc.
     * Called after every user action. Silent on error.
     */
    async function syncToFirestore() {
      if (!firestoreUserId) return;
      const streak = parseInt(document.getElementById('streak-count').textContent) || 0;
      const xp     = parseInt(document.getElementById('xp-count').textContent.replace(/,/g, '')) || 0;
      const payload = {
        streak,
        xp,
        tasks:        TASKS,
        weekMoods:    [...MOODS],
        hydration:    filledGlasses,
        lastLetterTs: parseInt(localStorage.getItem('lm_lastLetterTs') || '0') || null,
        updatedAt:    firebase.firestore.FieldValue.serverTimestamp()
      };
      try {
        await db.collection('users').doc(firestoreUserId).set(payload, { merge: true });
      } catch (err) {
        console.warn('Firestore sync error:', err);
      }
    }

    /**
     * Load saved state from Firestore and hydrate all UI components.
     * Called once after sign-in.
     */
    async function loadFromFirestore() {
      if (!firestoreUserId) return;
      try {
        const snap = await db.collection('users').doc(firestoreUserId).get();
        if (!snap.exists) return;
        const d = snap.data();

        if (d.streak !== undefined) document.getElementById('streak-count').textContent = d.streak;
        if (d.xp     !== undefined) document.getElementById('xp-count').textContent     = d.xp.toLocaleString();

        if (Array.isArray(d.tasks) && d.tasks.length) {
          TASKS.length = 0;
          TASKS.push(...d.tasks);
          buildTasks();
        }
        if (Array.isArray(d.weekMoods) && d.weekMoods.length) {
          MOODS.length = 0;
          MOODS.push(...d.weekMoods);
          buildWeeklyStrip();
        }
        if (typeof d.hydration === 'number') {
          filledGlasses = d.hydration;
          buildGlasses();
        }
        if (d.lastLetterTs) {
          localStorage.setItem('lm_lastLetterTs', String(d.lastLetterTs));
          updateVaultDays();
        }

        showToast('☁️ Data synced from cloud!', 'home');
      } catch (err) {
        console.warn('Firestore load error:', err);
      }
    }

    /** Update the Cloud Sync chip in Settings to reflect connection status. */
    function updateCloudSyncStatus(enabled) {
      const el = document.getElementById('cloud-sync-status');
      if (!el) return;
      el.textContent = enabled ? '✓ Enabled' : 'Connecting…';
      el.style.color = enabled ? 'var(--color-today)' : 'rgba(255,255,255,0.4)';
    }

    /* ══════════════════════════════════════════
       INIT
       ══════════════════════════════════════════ */
      // Paint the app shell immediately with the home background
      // (setPageColor uses a crossfade timer, so we seed the base directly here)
      const shell = document.querySelector('.app-shell');
      if (shell) shell.style.background = PAGE_COLORS.home.bg;

      // Set initial CSS variable colour state
      setPageColor('home');


      // Apply dynamic time-based greeting on load
      applyHomeHeading();

      // Start live clock
      tickClock();
      setInterval(tickClock, 1000);

      // Refresh greeting every minute (handles midnight/noon/5pm crossover)
      setInterval(applyHomeHeading, 60_000);

      // Build dynamic components
      buildWeeklyStrip();
      buildGlasses();
      buildTasks();

      // Sync balance ring with initial slider values
      updateBalanceRing();

      // Calculate vault days from localStorage
      updateVaultDays();

      // Close modals when clicking the overlay backdrop
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
          if (e.target === overlay) closeModal(overlay.id);
        });
      });

      // Escape key closes any open modal
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
        }
      });

      // Firebase: sign in anonymously → get a persistent user ID → load cloud data
      auth.onAuthStateChanged(user => {
        if (user) {
          firestoreUserId = user.uid;
          loadFromFirestore();
          updateCloudSyncStatus(true);
        }
      });
      auth.signInAnonymously().catch(err => console.warn('Firebase auth:', err));

      window.getDynamicHomeHeading = getDynamicHomeHeading;
window.applyHomeHeading = applyHomeHeading;
window.tickClock = tickClock;
window.setPageColor = setPageColor;
window.navigateTo = navigateTo;
window.staggerCards = staggerCards;
window.tickNumber = tickNumber;
window.update = update;
window.spawnXPFloat = spawnXPFloat;
window.bounceStreak = bounceStreak;
window.showToast = showToast;
window.claimReward = claimReward;
window.completeQuest = completeQuest;
window.selectMood = selectMood;
window.logMood = logMood;
window.updateSlider = updateSlider;
window.buildWeeklyStrip = buildWeeklyStrip;
window.buildGlasses = buildGlasses;
window.toggleGlass = toggleGlass;
window.buildTasks = buildTasks;
window.toggleTask = toggleTask;
window.updateBalanceRing = updateBalanceRing;
window.updateVaultDays = updateVaultDays;
window.openModal = openModal;
window.closeModal = closeModal;
window.showSettings = showSettings;
window.exportData = exportData;
window.addGoal = addGoal;
window.submitGoal = submitGoal;
window.writeLetter = writeLetter;
window.submitLetter = submitLetter;
window.addTask = addTask;
window.submitTask = submitTask;
window.syncToFirestore = syncToFirestore;
window.loadFromFirestore = loadFromFirestore;
window.updateCloudSyncStatus = updateCloudSyncStatus;
      // Stagger initial home cards
      setTimeout(() => staggerCards(document.getElementById('page-home')), 50);
    });
  `;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: `
  <!-- Toast container -->
  <div id="toast-container"></div>

  <!-- ═══ SETTINGS MODAL ═══ -->
  <div class="modal-overlay" id="settings-modal" role="dialog" aria-modal="true" aria-label="Settings">
    <div class="modal-box">
      <div class="modal-header">
        <p class="t-primary" style="font-weight:800; font-size:18px; margin:0;">⚙️ Settings</p>
        <button class="modal-close" onclick="closeModal('settings-modal')" aria-label="Close">×</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div class="settings-row">
          <div>
            <p class="t-primary" style="margin:0 0 2px; font-size:14px;">Dark Mode</p>
            <p class="t-tertiary" style="margin:0; font-size:12px;">Always active in LifeSmart OS</p>
          </div>
          <span style="color:var(--color-today); font-weight:700; font-size:12px;">✓ Active</span>
        </div>
        <div class="settings-row">
          <div>
            <p class="t-primary" style="margin:0 0 2px; font-size:14px;">Reduced Motion</p>
            <p class="t-tertiary" style="margin:0; font-size:12px;">Follows system preference</p>
          </div>
          <span style="color:rgba(255,255,255,0.4); font-weight:700; font-size:12px;">Auto</span>
        </div>
        <div class="settings-row">
          <div>
            <p class="t-primary" style="margin:0 0 2px; font-size:14px;">Export Data</p>
            <p class="t-tertiary" style="margin:0; font-size:12px;">Download your progress as JSON</p>
          </div>
          <button class="btn-secondary" style="padding:7px 16px; font-size:12px;" onclick="exportData()">Export</button>
        </div>
        <div class="settings-row">
          <div>
            <p class="t-primary" style="margin:0 0 2px; font-size:14px;">Cloud Sync</p>
            <p class="t-tertiary" style="margin:0; font-size:12px;">Sync across devices</p>
          </div>
          <span id="cloud-sync-status" style="color:rgba(255,255,255,0.4); font-weight:700; font-size:12px;">Connecting…</span>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal('settings-modal')">Close</button>
      </div>
    </div>
  </div>

  <!-- ═══ ADD GOAL MODAL ═══ -->
  <div class="modal-overlay" id="goal-modal" role="dialog" aria-modal="true" aria-label="Add Goal">
    <div class="modal-box">
      <div class="modal-header">
        <p class="t-primary" style="font-weight:800; font-size:18px; margin:0;">🎯 Add New Goal</p>
        <button class="modal-close" onclick="closeModal('goal-modal')" aria-label="Close">×</button>
      </div>
      <div class="modal-field">
        <span class="t-label">Goal Title</span>
        <input type="text" id="goal-title-input" class="modal-input" placeholder="e.g. Read 12 books this year" maxlength="60">
      </div>
      <div class="modal-field">
        <span class="t-label">Description <span style="color:rgba(255,255,255,0.3); font-weight:400; text-transform:none; letter-spacing:0;">(optional)</span></span>
        <textarea id="goal-desc-input" class="modal-input" placeholder="What does achieving this look like?" rows="3" maxlength="200"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal('goal-modal')">Cancel</button>
        <button class="btn-primary" onclick="submitGoal()">🎯 Add Goal</button>
      </div>
    </div>
  </div>

  <!-- ═══ WRITE LETTER MODAL ═══ -->
  <div class="modal-overlay" id="letter-modal" role="dialog" aria-modal="true" aria-label="Write Letter">
    <div class="modal-box">
      <div class="modal-header">
        <p class="t-primary" style="font-weight:800; font-size:18px; margin:0;">✉️ Write to Future You</p>
        <button class="modal-close" onclick="closeModal('letter-modal')" aria-label="Close">×</button>
      </div>
      <div class="modal-field">
        <span class="t-label">Open this letter in</span>
        <select id="letter-open-select" class="modal-input" style="cursor:pointer;">
          <option value="30">30 days</option>
          <option value="90">3 months</option>
          <option value="180">6 months</option>
          <option value="365" selected>1 year</option>
        </select>
      </div>
      <div class="modal-field">
        <span class="t-label">Your letter</span>
        <textarea id="letter-body-input" class="modal-input" placeholder="Dear future me..." rows="6" maxlength="1000"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal('letter-modal')">Cancel</button>
        <button class="btn-primary" onclick="submitLetter()">✉️ Seal Letter</button>
      </div>
    </div>
  </div>

  <!-- ═══ ADD TASK MODAL ═══ -->
  <div class="modal-overlay" id="task-modal" role="dialog" aria-modal="true" aria-label="Add Task">
    <div class="modal-box">
      <div class="modal-header">
        <p class="t-primary" style="font-weight:800; font-size:18px; margin:0;">✅ Add Task</p>
        <button class="modal-close" onclick="closeModal('task-modal')" aria-label="Close">×</button>
      </div>
      <div class="modal-field">
        <span class="t-label">Task name</span>
        <input type="text" id="task-title-input" class="modal-input" placeholder="e.g. 10 min meditation" maxlength="80"
               onkeydown="if(event.key==='Enter') submitTask()">
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal('task-modal')">Cancel</button>
        <button class="btn-primary" onclick="submitTask()">Add Task</button>
      </div>
    </div>
  </div>

  <div class="app-shell">

    <!-- ═══════════════════════════ SIDEBAR ═══════════════════════════ -->
    <aside class="sidebar">
      <div class="logo-mark" id="logo-mark">G</div>

      <nav class="sidebar-nav">
        <div class="nav-item active"
             id="nav-home"
             data-page="home"
             style="--nav-color: var(--color-home)"
             title="Home"
             onclick="navigateTo('home')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </div>

        <div class="nav-item"
             id="nav-balance"
             data-page="balance"
             style="--nav-color: var(--color-balance)"
             title="Life Balance"
             onclick="navigateTo('balance')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M12 3v9m0 0l6 6m-6-6l-6 6"/>
            <circle cx="12" cy="12" r="9"/>
          </svg>
        </div>

        <div class="nav-item"
             id="nav-goals"
             data-page="goals"
             style="--nav-color: var(--color-goals)"
             title="Goals Map"
             onclick="navigateTo('goals')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="5"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
          </svg>
        </div>

        <div class="nav-item"
             id="nav-today"
             data-page="today"
             style="--nav-color: var(--color-today)"
             title="Today"
             onclick="navigateTo('today')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="17" rx="2"/>
            <path stroke-linecap="round" d="M8 2v3M16 2v3M3 9h18"/>
          </svg>
        </div>

        <div class="nav-item"
             id="nav-vault"
             data-page="vault"
             style="--nav-color: var(--color-vault)"
             title="Vault"
             onclick="navigateTo('vault')">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="7" width="18" height="14" rx="2"/>
            <path stroke-linecap="round" d="M16 7V5a2 2 0 0 0-4 0v2"/>
            <circle cx="12" cy="14" r="2"/>
          </svg>
        </div>
      </nav>

      <div class="sidebar-spacer"></div>

      <div class="sidebar-settings" title="Settings" onclick="showSettings()" role="button" tabindex="0">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path stroke-linecap="round" d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </div>
    </aside>
    <!-- ═══════════════════════ END SIDEBAR ═══════════════════════ -->

    <!-- ═══════════════════════ MAIN ═══════════════════════ -->
    <main class="main-scroll">
      <div class="content-wrap">

        <!-- HUD Top Bar -->
        <div class="hud-bar">
          <div style="display:flex; flex-direction:column; gap:2px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <!-- Greeting emoji — JS sets content based on hour -->
              <span id="greeting-emoji"
                    aria-hidden="true"
                    style="font-size:28px; line-height:1;
                           filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
                           transition: opacity 0.4s ease;"></span>
              <h1 class="page-heading" id="page-heading">Good night.</h1>
            </div>
            <!-- Subheading: real date + live clock -->
            <p class="page-subheading" id="page-subheading" style="display:flex; align-items:center; gap:8px;">
              <span id="heading-date">Sunday, June 1</span>
              <span style="color:rgba(255,255,255,0.2);">·</span>
              <span id="live-clock"
                    style="font-variant-numeric:tabular-nums; letter-spacing:0.02em;"></span>
            </p>
          </div>
          <div class="hud-chips">
            <div class="hud-chip hud-streak">
              <span class="hud-chip-emoji" id="streak-emoji">🔥</span>
              <span class="hud-chip-number" id="streak-count">7</span>
              <span class="hud-chip-label">Streak</span>
            </div>
            <div class="hud-chip hud-xp">
              <span class="hud-chip-emoji">⚡</span>
              <span class="hud-chip-number" id="xp-count">1240</span>
              <span class="hud-chip-label">XP</span>
            </div>
            <div class="hud-chip hud-chapter">
              <span class="hud-chip-emoji">📖</span>
              <span class="hud-chip-number">Ch.1</span>
            </div>
          </div>
        </div>

        <!-- ══ PAGE: HOME ══ -->
        <div id="page-home" class="page-view active">
          <div class="dashboard-grid" id="home-grid">

            <!-- Daily Reward -->
            <div class="card card-home card-hero" style="padding: 24px; display:flex; flex-direction:column; gap:12px;">
              <div class="t-label">Daily Reward Available</div>
              <div style="display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:12px;">
                <!-- 🎁 sits in a dark pill so it never blends into the purple card gradient -->
                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.14); border-radius:20px; padding:12px 16px; display:inline-flex;">
                  <span class="gift-shimmer" id="gift-box">🎁</span>
                </div>
                <div style="text-align:center;">
                  <p class="t-primary" style="font-weight:700; font-size:18px; margin:0 0 4px;">Claim Your Reward</p>
                  <p class="t-secondary" style="font-size:14px; margin:0;">Tap to claim your XP bonus</p>
                </div>
                <span class="countdown-badge">⏱ Expires tonight · 11:59 PM</span>
              </div>
              <button class="btn-primary" style="width:100%;" id="claim-btn" onclick="claimReward(event)">🎁 Claim +150 XP</button>
            </div>

            <!-- Today's Quest -->
            <div class="card card-today card-hero" style="padding: 24px; display:flex; flex-direction:column; gap:16px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <!-- 🎯 in dark pill — green card could wash out a green emoji -->
                <div class="emoji-container" style="width:28px; height:28px; border-radius:8px; font-size:14px;">🎯</div>
                <span class="t-label">Today's Quest</span>
              </div>
              <div>
                <p class="t-primary" style="font-weight:700; font-size:18px; margin:0 0 6px;">Less Stressed</p>
                <p class="t-secondary" style="font-size:14px; margin:0 0 4px;">Part of: <span style="color:rgba(255,255,255,0.85);">Emotional Wellness</span></p>
                <p class="t-tertiary" style="font-size:13px; margin:0;">3 of 5 steps completed</p>
              </div>
              <div>
                <div class="quest-track">
                  <div class="quest-fill" style="width:60%;"></div>
                </div>
                <p class="t-tertiary" style="font-size:12px; margin-top:6px;">60% complete</p>
              </div>
              <div style="display:flex; gap:10px;">
                <button class="btn-primary" style="flex:1;" onclick="completeQuest(event, this)">Done ✓</button>
                <button class="btn-secondary" style="flex:1;">Tomorrow</button>
              </div>
            </div>

            <!-- Weekly Mood Strip -->
            <div class="card card-home col-span-2" style="padding: 24px; display:flex; flex-direction:column; gap:16px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <span class="t-label">This Week's Mood</span>
                <span style="background:rgba(124,92,252,0.22); border:1px solid rgba(124,92,252,0.45); color:#A78BFA; font-size:12px; font-weight:700; padding:4px 12px; border-radius:999px;">Weekly log</span>
              </div>
              <div id="weekly-strip" style="display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;"></div>
            </div>

            <!-- Life Balance Stat Card -->
            <div class="card card-balance" style="padding: 20px; display:flex; align-items:center; gap:16px;">
              <div class="balance-ring-wrap">
                <svg viewBox="0 0 58 58">
                  <circle cx="29" cy="29" r="22" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
                  <circle id="balance-ring-circle" cx="29" cy="29" r="22" fill="none" stroke="#4FACFE" stroke-width="8"
                          stroke-dasharray="138.2" stroke-dashoffset="55.3" stroke-linecap="round"
                          style="transition: stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)"/>
                </svg>
                <div class="balance-ring-label" id="balance-ring-label">5.8</div>
              </div>
              <div>
                <div class="t-label" style="margin-bottom:4px;">Balance</div>
                <p class="t-primary" style="font-weight:700; font-size:16px; margin:0 0 3px;">Wheel of Life</p>
                <p class="t-tertiary" style="font-size:12px; margin:0;">Last updated today</p>
              </div>
              <!-- ⚖️ in dark pill — blue card could wash out lighter emoji -->
              <div class="card-icon" style="margin-left:auto; font-size:24px;">⚖️</div>
            </div>

            <!-- Today Stat Card -->
            <div class="card card-today" style="padding: 20px; display:flex; align-items:center; gap:16px;">
              <!-- 📋 in a dark circle — mint green card background could clash with green-tinted emoji -->
              <div class="card-icon" style="border-radius:50%; width:52px; height:52px; font-size:24px;">📋</div>
              <div>
                <div class="t-label" style="margin-bottom:4px;">Today</div>
                <p class="t-primary" style="font-weight:700; font-size:16px; margin:0 0 3px;">Not yet logged</p>
                <p class="t-tertiary" style="font-size:12px; margin:0;">Tap to start your check-in</p>
              </div>
              <div style="margin-left:auto;">
                <button class="btn-primary" style="padding:9px 18px; font-size:13px;" onclick="navigateTo('today')">Log</button>
              </div>
            </div>

            <!-- Vault Nudge -->
            <div class="card card-vault col-span-2" style="padding: 24px; display:flex; align-items:center; gap:20px;">
              <!-- 🔒 in dark pill — lavender vault card; lock emoji can blend into purple tones -->
              <div class="card-icon" style="width:52px; height:52px; font-size:28px; border-radius:16px; background:rgba(0,0,0,0.35); box-shadow:0 0 16px rgba(167,139,250,0.3);">🔒</div>
              <div style="flex:1;">
                <div class="t-label" style="margin-bottom:6px;">Vault</div>
                <p class="t-primary" style="font-weight:700; font-size:16px; margin:0 0 5px;">Time Vault — Your Letters</p>
                <p style="color:rgba(255,255,255,0.8); font-size:14px; font-weight:500; margin:0; line-height:1.5;">
                  It's been <strong id="vault-days" style="color:var(--color-vault);">0 days</strong> since your last letter to your future self. Write one tonight?
                </p>
              </div>
              <button class="btn-primary" style="white-space:nowrap; flex-shrink:0;" onclick="navigateTo('vault')">Open Vault</button>
            </div>

          </div>
        </div>

        <!-- ══ PAGE: LIFE BALANCE ══ -->
        <div id="page-balance" class="page-view">
          <div class="dashboard-grid" id="balance-grid">

            <div class="card card-balance col-span-2" style="padding:28px; display:flex; flex-direction:column; gap:20px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <div class="t-label" style="margin-bottom:4px;">Life Balance</div>
                  <p class="t-primary" style="font-weight:700; font-size:20px; margin:0;">Wheel of Life</p>
                </div>
                <button class="btn-primary" onclick="showToast('✅ Balance saved!', 'balance')">💾 Save Balance</button>
              </div>

              <div class="balance-slider-wrap">
                <div class="slider-row">
                  <span class="slider-label">Health</span>
                  <input type="range" class="balance-range" min="1" max="10" value="7" oninput="updateSlider(this)">
                  <span class="slider-score">7</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Career</span>
                  <input type="range" class="balance-range" min="1" max="10" value="5" oninput="updateSlider(this)">
                  <span class="slider-score">5</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Finance</span>
                  <input type="range" class="balance-range" min="1" max="10" value="4" oninput="updateSlider(this)">
                  <span class="slider-score">4</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Family</span>
                  <input type="range" class="balance-range" min="1" max="10" value="8" oninput="updateSlider(this)">
                  <span class="slider-score">8</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Growth</span>
                  <input type="range" class="balance-range" min="1" max="10" value="6" oninput="updateSlider(this)">
                  <span class="slider-score">6</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Social</span>
                  <input type="range" class="balance-range" min="1" max="10" value="3" oninput="updateSlider(this)">
                  <span class="slider-score">3</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Fun</span>
                  <input type="range" class="balance-range" min="1" max="10" value="6" oninput="updateSlider(this)">
                  <span class="slider-score">6</span>
                </div>
                <div class="slider-row">
                  <span class="slider-label">Purpose</span>
                  <input type="range" class="balance-range" min="1" max="10" value="7" oninput="updateSlider(this)">
                  <span class="slider-score">7</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ══ PAGE: GOALS MAP ══ -->
        <div id="page-goals" class="page-view">
          <div class="dashboard-grid" id="goals-grid">

            <div class="card card-goals col-span-2" style="padding:28px; display:flex; flex-direction:column; gap:20px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <div class="t-label" style="margin-bottom:4px;">Goals Map</div>
                  <p class="t-primary" style="font-weight:700; font-size:20px; margin:0;">Chapter 1: Foundation</p>
                </div>
                <button class="btn-primary" onclick="addGoal()">🎯 Add Goal</button>
              </div>

              <!-- Goals path SVG -->
              <div style="position:relative; display:flex; flex-direction:column; gap:16px; padding: 8px 0;">
                <svg style="position:absolute; left:25px; top:0; height:100%; width:4px; overflow:visible;" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#F05A7E"/>
                      <stop offset="100%" stop-color="#E83B6A"/>
                    </linearGradient>
                  </defs>
                  <line x1="2" y1="26" x2="2" y2="95%" stroke="url(#pathGrad)" stroke-width="3" stroke-linecap="round" class="goals-path" style="--path-length:400;"/>
                </svg>

                <!-- Goal nodes —
                     ✅ is high-contrast on any background.
                     🎯 is inside a coral coloured node so it's fine.
                     🔐 is dark on dark; swap to ⛔ which has a red ring for contrast.
                -->
                <div style="display:flex; align-items:center; gap:16px; padding-left:8px;">
                  <div class="goal-node completed">✅</div>
                  <div>
                    <p class="t-primary" style="font-weight:700; font-size:15px; margin:0 0 3px;">Morning Routine</p>
                    <p class="t-tertiary" style="font-size:12px; margin:0;">Completed · 7 days streak</p>
                  </div>
                  <div style="margin-left:auto; background:rgba(240,90,126,0.18); border:1px solid rgba(240,90,126,0.4); color:#F05A7E; font-size:12px; font-weight:700; padding:3px 10px; border-radius:999px;">+200 XP</div>
                </div>

                <div style="display:flex; align-items:center; gap:16px; padding-left:8px;">
                  <div class="goal-node active">
                    <div class="pulse-ring"></div>
                    🎯
                  </div>
                  <div>
                    <p class="t-primary" style="font-weight:700; font-size:15px; margin:0 0 3px;">Less Stressed</p>
                    <p class="t-tertiary" style="font-size:12px; margin:0;">In progress · 3 of 5 steps</p>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:16px; padding-left:8px;">
                  <!-- 🔐 dark on dark → swap to ⛔ (red ring, high contrast) -->
                  <div class="goal-node locked">⛔</div>
                  <div>
                    <p style="color:rgba(255,255,255,0.4); font-weight:600; font-size:15px; margin:0 0 3px;">Read 12 Books</p>
                    <p class="t-tertiary" style="font-size:12px; margin:0;">Locked — complete above first</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        <!-- ══ PAGE: TODAY ══ -->
        <div id="page-today" class="page-view">
          <div class="dashboard-grid" id="today-grid">

            <!-- Mood check-in -->
            <!-- Note: mood emoji (😄😊😐😢😤) are all inherently
                 high-contrast multi-colour glyphs — safe on any dark bg.
                 They sit in their own coloured mood-btn containers.
                 The dark overlay on the card is enough separation. -->
            <div class="card card-today col-span-2" style="padding:28px; display:flex; flex-direction:column; gap:20px;">
              <div>
                <div class="t-label" style="margin-bottom:4px;">Today's Check-in</div>
                <p class="t-primary" style="font-weight:700; font-size:20px; margin:0;">How are you feeling?</p>
              </div>

              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button class="mood-btn" data-mood="happy" onclick="selectMood(this)">
                  <span class="mood-emoji">😄</span>
                  <span class="mood-label">Happy</span>
                </button>
                <button class="mood-btn" data-mood="content" onclick="selectMood(this)">
                  <span class="mood-emoji">😊</span>
                  <span class="mood-label">Content</span>
                </button>
                <button class="mood-btn" data-mood="neutral" onclick="selectMood(this)">
                  <span class="mood-emoji">😐</span>
                  <span class="mood-label">Neutral</span>
                </button>
                <button class="mood-btn" data-mood="sad" onclick="selectMood(this)">
                  <span class="mood-emoji">😢</span>
                  <span class="mood-label">Sad</span>
                </button>
                <button class="mood-btn" data-mood="angry" onclick="selectMood(this)">
                  <span class="mood-emoji">😤</span>
                  <span class="mood-label">Stressed</span>
                </button>
              </div>

              <button class="btn-primary" style="align-self:flex-start;" onclick="logMood(event, this)">Log Mood +30 XP</button>
            </div>

            <!-- Hydration -->
            <div class="card card-today" style="padding:24px; display:flex; flex-direction:column; gap:16px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <!-- 💧 in dark pill — green card bg can wash out blue-tinted emoji -->
                <div class="card-icon" style="width:36px; height:36px; border-radius:10px; font-size:18px;">💧</div>
                <div>
                  <div class="t-label" style="margin-bottom:2px;">Hydration</div>
                  <p class="t-primary" style="font-weight:700; font-size:16px; margin:0;">Water intake</p>
                </div>
              </div>
              <div class="glass-container" id="water-glasses"></div>
              <p class="t-tertiary" style="font-size:12px;" id="water-label">0 of 8 glasses</p>
            </div>

            <!-- Daily tasks -->
            <div class="card card-today" style="padding:24px; display:flex; flex-direction:column; gap:14px;">
              <!-- ✅ checkmark emoji in tasks is high-contrast (white+green). Safe. -->
              <div class="t-label">Daily Tasks</div>
              <div id="task-list" style="display:flex; flex-direction:column; gap:10px;"></div>
              <button class="btn-secondary" style="align-self:flex-start; padding:8px 16px; font-size:13px;" onclick="addTask()">+ Add task</button>
            </div>

          </div>
        </div>

        <!-- ══ PAGE: VAULT ══ -->
        <div id="page-vault" class="page-view">
          <div class="dashboard-grid" id="vault-grid">

            <div class="card card-vault col-span-2" style="padding:28px; display:flex; flex-direction:column; gap:20px;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <div>
                  <div class="t-label" style="margin-bottom:4px;">Time Vault</div>
                  <p class="t-primary" style="font-weight:700; font-size:20px; margin:0;">Letters to Future You</p>
                </div>
                <!-- ✉️ is high-contrast white/cream envelope — safe on purple vault bg.
                     Replaces 💌 (pink on purple would clash). -->
                <button class="btn-primary" onclick="writeLetter()">✉️ Write Letter</button>
              </div>

              <!-- Letter cards -->
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div class="letter-card">
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <p class="t-primary" style="font-weight:700; margin:0;">To future me in 1 year</p>
                    <!-- 🔒 dark emoji on lavender pill → swap to text + icon for clarity -->
                    <span class="letter-sealed">📬 Sealed</span>
                  </div>
                  <p style="color:rgba(255,255,255,0.55); font-size:13px; margin:0;">Opens on June 1, 2027</p>
                </div>

                <div class="letter-card">
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                    <p class="t-primary" style="font-weight:700; margin:0;">My 30-day reflection</p>
                    <!-- 🔓 is fine on green — open lock has good contrast -->
                    <span class="letter-sealed" style="background:rgba(67,233,123,0.15); border-color:rgba(67,233,123,0.4); color:#43E97B;">🔓 Open</span>
                  </div>
                  <p style="color:rgba(255,255,255,0.7); font-size:13px; margin:0; line-height:1.6;">"I committed to showing up every day no matter how small the step..."</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </main>
    <!-- ═══════════════════════ END MAIN ═══════════════════════ -->

  </div>

  
` }} />;
};

export default Dashboard;
