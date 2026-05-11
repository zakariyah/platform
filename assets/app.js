// ============================================================
// AFA Command Center — Platform Observability
// Shared client behavior: live clock + count jitter
// ============================================================

(function () {
  // ---- Top-level tab switching (Overview / Test Drive / etc.) ----
  const tabbarTabs = document.querySelectorAll('.tabbar-tab');
  const pages = document.querySelectorAll('.page-content');

  tabbarTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-page');
      tabbarTabs.forEach((t) => t.classList.toggle('active', t === tab));
      pages.forEach((p) => p.classList.toggle('active', p.getAttribute('data-page') === key));
    });
  });

  // ---- Per-page subtab switching ----
  // Each page-content has its own .subtab + .subview elements
  pages.forEach((page) => {
    const subtabs = page.querySelectorAll('.subtab');
    const subviews = page.querySelectorAll('.subview');
    subtabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-sub');
        subtabs.forEach((t) => t.classList.toggle('active', t === tab));
        subviews.forEach((v) => v.classList.toggle('active', v.getAttribute('data-view') === key));
      });
    });
  });

  // ---- Stage data for Business Flow detail panel ----
  const STAGES = {
    sourcing: {
      name: 'Lead Sourcing',
      vol: '37,815',
      conv: 'Entry point · 100% of total leads',
      insight: '<strong>Web channels</strong> drive 64% of all leads. Social Media contributes 32.2%. Duplicate leads account for 5.9% — confirm de-duplication is running correctly.',
      nodes: [
        { label: 'Web',                count: '24,195', pct: '64.0%', cls: 'blue'  },
        { label: 'Social Media',       count: '12,167', pct: '32.2%', cls: 'blue'  },
        { label: 'Showroom Promo',     count: '1,318',  pct: '3.5%',  cls: ''      },
        { label: 'Others',             count: '147',    pct: '0.0%',  cls: ''      },
        { label: 'Unique Leads',       count: '35,600', pct: '94.1%', cls: 'green' },
        { label: 'Duplicate Leads',    count: '2,215',  pct: '5.9%',  cls: 'red'   },
      ]
    },
    cec: {
      name: 'Call Center Processing',
      vol: '35,426',
      conv: '93.7% of total leads reached CEC',
      insight: '<strong>51.6% unreachable</strong> is the largest single drop-off in the funnel — nearly 1 in 2 leads cannot be contacted. This is the primary lever for improving downstream conversion.',
      nodes: [
        { label: 'CEC Actioned',     count: '35,426', pct: '99.95%', cls: 'green' },
        { label: 'CEC Not Actioned', count: '174',    pct: '0.05%',  cls: 'red'   },
        { label: 'Reachable',        count: '17,271', pct: '48.8%',  cls: 'green' },
        { label: 'Pending',          count: '2,763',  pct: '7.8%',   cls: ''      },
        { label: 'Unreachable',      count: '18,265', pct: '51.6%',  cls: 'red'   },
      ]
    },
    se: {
      name: 'Showroom Visit',
      vol: '19,130',
      conv: '98.1% of opportunities SE-assigned',
      insight: '<strong>98.1% assignment rate</strong> is strong. However, 83.9% of total opportunities are classified as No Opportunity — investigate qualification criteria to improve upstream filtering.',
      nodes: [
        { label: 'Walk-In Opportunity', count: '10,932', pct: '100%',  cls: 'amber' },
        { label: 'Walk-In Enquiry',     count: '10,932', pct: '100%',  cls: 'amber' },
        { label: 'Total Opportunity',   count: '14,013', pct: '100%',  cls: 'green' },
        { label: 'No Opportunity',      count: '16,024', pct: '83.9%', cls: 'red'   },
        { label: 'SE Not Assigned',     count: '371',    pct: '1.9%',  cls: 'red'   },
        { label: 'SE Assigned',         count: '19,130', pct: '98.1%', cls: 'green' },
        { label: 'Digital Opps',        count: '3,081',  pct: '16.1%', cls: 'green' },
        { label: 'SE Actioned',         count: '19,105', pct: '99.9%', cls: 'green' },
      ]
    },
    td: {
      name: 'Test Drive',
      vol: '6,442',
      conv: '47.3% booking rate from SE-assigned leads',
      insight: '<strong>17.3% no-show rate</strong> is worth monitoring. Of those who attend, 82.7% complete the drive — strong intent signal. Consider SMS reminders to reduce no-shows.',
      nodes: [
        { label: 'Test Drive Booked', count: '6,442', pct: '47.3%', cls: ''      },
        { label: 'Completed',         count: '5,325', pct: '82.7%', cls: 'green' },
        { label: 'No Show',           count: '1,117', pct: '17.3%', cls: 'red'   },
      ]
    },
    ordering: {
      name: 'Reservations',
      vol: '4,527',
      conv: '32.3% of test drives convert to a reservation',
      insight: '<strong>32.3% test-drive-to-reservation rate</strong> is the key commercial conversion. One in three test drives produces a reservation — benchmark against prior months to detect drift.',
      nodes: [
        { label: 'Total Reservations', count: '4,527', pct: '32.3%', cls: 'green' },
      ]
    },
    invoicing: {
      name: 'Invoicing',
      vol: '3,334',
      conv: '73.6% of orders are invoiced',
      insight: '<strong>26.4% of orders are not yet invoiced</strong>. Investigate whether these represent processing delays, cancellations, or pending documentation — each has a different operational response.',
      nodes: [
        { label: 'Invoiced',     count: '3,334', pct: '73.6%', cls: 'green' },
        { label: 'Not Invoiced', count: '1,193', pct: '26.4%', cls: 'red'   },
      ]
    }
  };

  // ---- Select a stage card ----
  window.selectStage = function (key) {
    const stage = STAGES[key];
    if (!stage) return;

    // Highlight selected card
    document.querySelectorAll('.sc').forEach((c) => c.classList.remove('selected'));
    const activeCard = document.querySelector(`.sc[data-stage="${key}"]`);
    if (activeCard) activeCard.classList.add('selected');

    // Populate detail panel
    document.getElementById('ds-name').textContent  = stage.name;
    document.getElementById('ds-conv').textContent  = stage.conv;
    document.getElementById('ds-vol').textContent   = stage.vol;
    document.getElementById('ds-insight').innerHTML = stage.insight;

    const grid = document.getElementById('ds-grid');
    grid.innerHTML = stage.nodes.map((n) => `
      <div class="detail-node ${n.cls}">
        <div class="dn-label">${n.label}</div>
        <div class="dn-count">${n.count}</div>
        <div class="dn-pct">${n.pct}</div>
      </div>`).join('');

    const panel = document.getElementById('pipeline-detail');
    if (panel) {
      panel.style.display = 'block';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  window.clearStage = function () {
    document.querySelectorAll('.sc').forEach((c) => c.classList.remove('selected'));
    const panel = document.getElementById('pipeline-detail');
    if (panel) panel.style.display = 'none';
  };

  // ---- Date Selector ----
  (function () {
    const trigger  = document.getElementById('ds-trigger');
    const dropdown = document.getElementById('ds-dropdown');
    const display  = document.getElementById('ds-display');
    const fromIn   = document.getElementById('ds-from');
    const toIn     = document.getElementById('ds-to');
    const selLabel = document.getElementById('ds-selected-label');
    const applyBtn = document.getElementById('ds-apply');
    if (!trigger) return;

    const TODAY = new Date('2026-05-11');

    const PRESETS = {
      today:  () => { const d = fmt(TODAY); return [d, d]; },
      wtd:    () => { const d = new Date(TODAY); d.setDate(d.getDate() - d.getDay()); return [fmt(d), fmt(TODAY)]; },
      mtd:    () => [fmt(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)), fmt(TODAY)],
      qtd:    () => { const q = Math.floor(TODAY.getMonth()/3); return [fmt(new Date(TODAY.getFullYear(), q*3, 1)), fmt(TODAY)]; },
      ytd:    () => [fmt(new Date(TODAY.getFullYear(), 0, 1)), fmt(TODAY)],
      last7:  () => { const d = new Date(TODAY); d.setDate(d.getDate()-6); return [fmt(d), fmt(TODAY)]; },
      last30: () => { const d = new Date(TODAY); d.setDate(d.getDate()-29); return [fmt(d), fmt(TODAY)]; },
      last90: () => { const d = new Date(TODAY); d.setDate(d.getDate()-89); return [fmt(d), fmt(TODAY)]; },
      lastq:  () => { const q = Math.floor(TODAY.getMonth()/3); const s = new Date(TODAY.getFullYear(), (q-1)*3, 1); const e = new Date(TODAY.getFullYear(), q*3, 0); return [fmt(s), fmt(e)]; },
      lasty:  () => [fmt(new Date(TODAY.getFullYear()-1, 0, 1)), fmt(new Date(TODAY.getFullYear()-1, 11, 31))],
    };

    function fmt(d) {
      return d.toISOString().split('T')[0];
    }
    function friendly(from, to) {
      const f = new Date(from), t = new Date(to);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const days = Math.round((t-f)/(1000*60*60*24)) + 1;
      if (f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth()) {
        return `${months[f.getMonth()]} ${f.getDate()} – ${t.getDate()}, ${f.getFullYear()} · ${days}d`;
      }
      return `${months[f.getMonth()]} ${f.getDate()} – ${months[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()} · ${days}d`;
    }

    function applyRange(from, to) {
      fromIn.value = from;
      toIn.value   = to;
      const label  = friendly(from, to);
      display.textContent   = label.split(' ·')[0];
      selLabel.textContent  = label;
    }

    // Preset buttons
    document.querySelectorAll('.ds-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ds-preset').forEach(b => b.classList.remove('ds-active'));
        btn.classList.add('ds-active');
        const key = btn.getAttribute('data-preset');
        if (PRESETS[key]) {
          const [f, t] = PRESETS[key]();
          applyRange(f, t);
        }
      });
    });

    // Update label when inputs change
    [fromIn, toIn].forEach(inp => {
      inp.addEventListener('change', () => {
        document.querySelectorAll('.ds-preset').forEach(b => b.classList.remove('ds-active'));
        document.querySelector('.ds-preset[data-preset="custom"]') &&
          document.querySelector('.ds-preset[data-preset="custom"]').classList.add('ds-active');
        if (fromIn.value && toIn.value) {
          selLabel.textContent = friendly(fromIn.value, toIn.value);
        }
      });
    });

    // Apply
    applyBtn.addEventListener('click', () => {
      if (fromIn.value && toIn.value) {
        display.textContent = friendly(fromIn.value, toIn.value).split(' ·')[0];
      }
      close();
    });

    // Toggle open/close
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      isOpen ? close() : open();
    });
    document.addEventListener('click', (e) => {
      if (!document.getElementById('ds-wrap').contains(e.target)) close();
    });
    function open()  { trigger.classList.add('open');  dropdown.classList.add('open'); }
    function close() { trigger.classList.remove('open'); dropdown.classList.remove('open'); }
  })();

  // ---- Brand Selector ----
  (function () {
    const BRANDS = [
      { id: 'toyota',   name: 'Toyota',      color: '#eb0a1e', group: 'Japanese' },
      { id: 'lexus',    name: 'Lexus',       color: '#1c6b8a', group: 'Japanese' },
      { id: 'honda',    name: 'Honda',       color: '#cc0000', group: 'Japanese' },
      { id: 'volvo',    name: 'Volvo',       color: '#003057', group: 'European' },
      { id: 'jeep',     name: 'Jeep',        color: '#4a7c20', group: 'American' },
      { id: 'dodge',    name: 'Dodge',       color: '#e8002d', group: 'American' },
      { id: 'chrysler', name: 'Chrysler',    color: '#5a7395', group: 'American' },
      { id: 'ram',      name: 'RAM',         color: '#cc3300', group: 'American' },
      { id: 'byd',      name: 'BYD',         color: '#27ae60', group: 'Electric' },
    ];

    // Default selected: Toyota, Lexus, Honda, Volvo, Fiat, Jeep, Dodge, BYD
    const DEFAULT_ON = new Set(['toyota','lexus','honda','volvo','jeep','dodge','byd']);
    const checked = new Set(DEFAULT_ON);

    const trigger  = document.getElementById('bs-trigger');
    const dropdown = document.getElementById('bs-dropdown');
    const display  = document.getElementById('bs-display');
    const listEl   = document.getElementById('bs-list');
    const countEl  = document.getElementById('bs-count');
    const applyBtn = document.getElementById('bs-apply-btn');
    const selAllBtn = document.getElementById('bs-select-all');
    const clearBtn  = document.getElementById('bs-clear-all');
    if (!trigger) return;

    let activeCountry = 'UAE';

    // Country → brands mapping (which brands operate in that market)
    const COUNTRY_BRANDS = {
      UAE:       ['toyota','lexus','honda','volvo','jeep','dodge','chrysler','ram','byd'],
      Egypt:     ['toyota','honda','jeep','dodge','byd'],
      Singapore: ['toyota','lexus','honda','volvo','byd'],
      Pakistan:  ['toyota','honda'],
    };

    function visibleBrands() {
      const allowed = new Set(COUNTRY_BRANDS[activeCountry] || []);
      return BRANDS.filter(b => allowed.has(b.id));
    }

    function render() {
      const visible = visibleBrands();
      listEl.innerHTML = visible.map(b => `
        <label class="bs-brand-item" data-id="${b.id}">
          <span class="bs-check${checked.has(b.id) ? ' checked' : ''}"></span>
          <span class="bs-swatch" style="background:${b.color}"></span>
          <span class="bs-bname">${b.name}</span>
        </label>`).join('');

      listEl.querySelectorAll('.bs-brand-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-id');
          if (checked.has(id)) checked.delete(id); else checked.add(id);
          item.querySelector('.bs-check').classList.toggle('checked', checked.has(id));
          updateCount();
        });
      });
      updateCount();
    }

    function updateCount() {
      const total = visibleBrands().length;
      const sel   = visibleBrands().filter(b => checked.has(b.id)).length;
      countEl.textContent = `${sel} of ${total} selected`;
    }

    function updateDisplay() {
      const sel = BRANDS.filter(b => checked.has(b.id)).length;
      display.textContent = `${sel} Brand${sel !== 1 ? 's' : ''} · ${activeCountry}`;
    }

    document.querySelectorAll('.bs-country').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bs-country').forEach(b => b.classList.remove('bs-c-active'));
        btn.classList.add('bs-c-active');
        activeCountry = btn.getAttribute('data-country');
        render();
      });
    });

    selAllBtn.addEventListener('click', () => {
      visibleBrands().forEach(b => checked.add(b.id));
      render();
    });
    clearBtn.addEventListener('click', () => {
      visibleBrands().forEach(b => checked.delete(b.id));
      render();
    });

    applyBtn.addEventListener('click', () => {
      updateDisplay();
      close();
    });

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.contains('open') ? close() : open();
    });
    document.addEventListener('click', e => {
      if (!document.getElementById('bs-wrap').contains(e.target)) close();
    });
    function open()  { trigger.classList.add('open');  dropdown.classList.add('open'); }
    function close() { trigger.classList.remove('open'); dropdown.classList.remove('open'); }

    render();
    updateDisplay();
  })();

  // ---- Auto-expand Lead Sourcing on load ----
  selectStage('sourcing');

  // ---- Live GST clock ----
  function tick() {
    const el = document.getElementById('clock');
    if (!el) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    el.textContent = `${hh}:${mm}:${ss} GST`;
  }
  tick();
  setInterval(tick, 1000);

  // ---- Simulated live count jitter on flow stages ----
  // Keeps stalled stages tense (no drift), gently moves healthy/warn counts.
  const counters = document.querySelectorAll('.stage-count');
  setInterval(() => {
    counters.forEach((c) => {
      const stage = c.parentElement;
      if (!stage) return;
      if (stage.classList.contains('stalled')) return;
      const n = parseInt(c.textContent.replace(/,/g, ''), 10);
      if (isNaN(n) || n === 0) return;
      const drift = Math.floor((Math.random() - 0.5) * Math.max(2, n * 0.03));
      const next = Math.max(0, n + drift);
      c.textContent = next.toLocaleString();
    });
  }, 4000);
})();
