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
  // Scope subtabs/subviews to their immediate container (page-content or journey-page)
  [...document.querySelectorAll('.page-content'), ...document.querySelectorAll('.journey-page')].forEach((container) => {
    const subtabs = container.querySelectorAll(':scope > nav.subtabs .subtab');
    const subviews = container.querySelectorAll(':scope > .subview');
    subtabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-sub');
        subtabs.forEach((t) => t.classList.toggle('active', t === tab));
        subviews.forEach((v) => v.classList.toggle('active', v.getAttribute('data-view') === key));
      });
    });
  });

  // ---- Journey Page Switcher (Overview) ----
  (function () {
    const navPills = document.querySelectorAll('.journey-nav-pill');
    const journeyPages = document.querySelectorAll('.journey-page');
    navPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const key = pill.getAttribute('data-journey-page');
        navPills.forEach(p => p.classList.toggle('active', p === pill));
        journeyPages.forEach(jp => jp.classList.toggle('active', jp.getAttribute('data-journey-page') === key));
        clearStage();
      });
    });
  })();

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

  // ---- Generic journey stage select/clear (for B2B New, B2B AS, B2C AS) ----
  window.selectStageJourney = function (journeyKey, stageKey) {
    const panelId  = 'pipeline-detail-' + journeyKey;
    const nameId   = 'ds-name-'   + journeyKey;
    const convId   = 'ds-conv-'   + journeyKey;
    const volId    = 'ds-vol-'    + journeyKey;
    const insightId= 'ds-insight-'+ journeyKey;
    const gridId   = 'ds-grid-'   + journeyKey;
    document.querySelectorAll('.sc').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.sc[data-stage="${stageKey}"]`);
    if (card) card.classList.add('selected');
    const name    = document.getElementById(nameId);
    const conv    = document.getElementById(convId);
    const vol     = document.getElementById(volId);
    const insight = document.getElementById(insightId);
    const grid    = document.getElementById(gridId);
    if (name)    name.textContent    = card ? card.querySelector('.sc-name')?.textContent || stageKey : stageKey;
    if (conv)    conv.textContent    = '';
    if (vol)     vol.textContent     = card ? card.querySelector('.sc-mv')?.textContent || '—' : '—';
    if (insight) insight.innerHTML   = '';
    if (grid)    grid.innerHTML      = '';
    const panel = document.getElementById(panelId);
    if (panel) { panel.style.display = 'block'; panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  };
  window.clearStageJourney = function (journeyKey) {
    document.querySelectorAll('.sc').forEach(c => c.classList.remove('selected'));
    const panel = document.getElementById('pipeline-detail-' + journeyKey);
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

  // ---- Journey Selector (replaced by Journey Page Switcher above) ----

  // ---- Stage data for Used Cars ----
  const STAGES_USED = {
    'used-sourcing':   { name: 'Lead Sourcing',       vol: '18,240', conv: 'Entry point · 100% of used-car leads', insight: '<strong>Web and social</strong> dominate used-car leads. 4.9% duplicate rate — lower than new cars, likely because used-car customers are more deliberate.', nodes: [{ label:'Web', count:'10,940', pct:'60.0%', cls:'blue' },{ label:'Social Media', count:'5,840', pct:'32.0%', cls:'blue' },{ label:'Walk-in', count:'1,248', pct:'6.8%', cls:'' },{ label:'Unique Leads', count:'17,348', pct:'95.1%', cls:'green' },{ label:'Duplicate Leads', count:'892', pct:'4.9%', cls:'red' }] },
    'used-inspection': { name: 'Vehicle Inspection',  vol: '17,112', conv: '65.7% proceed to offer stage', insight: '<strong>34.3% drop-off at inspection</strong> is the primary funnel leak. Key drivers: vehicle condition mismatch, pricing expectations, and availability gaps. Review inspection-to-offer conversion by model.', nodes: [{ label:'Inspection Booked', count:'14,820', pct:'86.6%', cls:'green' },{ label:'Inspection Completed', count:'12,340', pct:'72.1%', cls:'green' },{ label:'Condition: Pass', count:'11,240', pct:'65.7%', cls:'green' },{ label:'Condition: Fail', count:'1,100', pct:'6.4%', cls:'red' },{ label:'No-show', count:'2,480', pct:'14.5%', cls:'red' },{ label:'Pending', count:'1,450', pct:'8.5%', cls:'' }] },
    'used-offer':      { name: 'Offer & Negotiation', vol: '11,240', conv: '69.9% offer acceptance rate', insight: '<strong>18.7% decline rate</strong> at offer stage suggests pricing or perceived value gaps. Accepted offers convert well through to payment — the negotiation phase is the key leverage point.', nodes: [{ label:'Offer Sent', count:'11,240', pct:'100%', cls:'green' },{ label:'Accepted', count:'7,860', pct:'69.9%', cls:'green' },{ label:'Negotiating', count:'1,276', pct:'11.3%', cls:'' },{ label:'Declined', count:'2,104', pct:'18.7%', cls:'red' }] },
    'used-finance':    { name: 'Finance & Payment',   vol: '7,860',  conv: '71.4% finance arranged', insight: '<strong>7.9% failure rate</strong> at finance stage — lower than new-car credit checks, likely due to lower loan amounts. 20.7% pending warrants a follow-up campaign.', nodes: [{ label:'Finance Arranged', count:'5,612', pct:'71.4%', cls:'green' },{ label:'Cash Purchase', count:'1,840', pct:'23.4%', cls:'blue' },{ label:'Pending', count:'1,630', pct:'20.7%', cls:'' },{ label:'Failed', count:'618', pct:'7.9%', cls:'red' }] },
    'used-handover':   { name: 'Handover',            vol: '5,612',  conv: '88.7% handover completion rate', insight: '<strong>88.7% completion</strong> is strong. 580 units pending are likely logistics or registration-related delays — follow up on lead time by dealer.', nodes: [{ label:'Handover Completed', count:'4,980', pct:'88.7%', cls:'green' },{ label:'Pending', count:'580', pct:'10.3%', cls:'' },{ label:'Cancelled Post-Payment', count:'52', pct:'0.9%', cls:'red' }] },
  };

  // ---- Stage data for Lease Cars ----
  const STAGES_LEASE = {
    'lease-sourcing':  { name: 'Lead Sourcing',       vol: '9,450',  conv: 'Entry point · 100% of lease leads', insight: '<strong>Corporate fleet</strong> accounts for 42% of lease leads — significantly different to retail. Ensure CEC teams are equipped with fleet qualification scripts.', nodes: [{ label:'Corporate/Fleet', count:'3,969', pct:'42.0%', cls:'blue' },{ label:'Individual', count:'5,169', pct:'54.7%', cls:'blue' },{ label:'Unique Leads', count:'9,138', pct:'96.7%', cls:'green' },{ label:'Duplicate', count:'312', pct:'3.3%', cls:'red' }] },
    'lease-cec':       { name: 'CEC Qualification',   vol: '8,960',  conv: '53.8% qualified after CEC contact', insight: '<strong>40.6% unreachable</strong> — slightly better than new cars but still the dominant drop-off. Lease customers are often corporate contacts; schedule callbacks during business hours.', nodes: [{ label:'Qualified', count:'4,820', pct:'53.8%', cls:'green' },{ label:'Unreachable', count:'3,640', pct:'40.6%', cls:'red' },{ label:'Not Interested', count:'870', pct:'9.7%', cls:'red' },{ label:'Pending', count:'500', pct:'5.6%', cls:'' }] },
    'lease-proposal':  { name: 'Lease Proposal',      vol: '4,820',  conv: '68.1% proposal acceptance rate', insight: '<strong>19.7% rejection rate</strong> at proposal stage. Top reason: monthly payment too high. Consider introducing a lower-mileage or shorter-term tier to capture price-sensitive customers.', nodes: [{ label:'Proposal Sent', count:'4,610', pct:'95.6%', cls:'green' },{ label:'Accepted', count:'3,280', pct:'68.1%', cls:'green' },{ label:'Rejected', count:'892', pct:'18.5%', cls:'red' },{ label:'Pending Review', count:'438', pct:'9.1%', cls:'' }] },
    'lease-credit':    { name: 'Credit Assessment',   vol: '3,280',  conv: '65.2% credit approval rate', insight: '<strong>23.8% pending</strong> at credit stage indicates processing delays. 11.0% declined — monitor by brand and tenure length, as longer leases attract higher credit scrutiny.', nodes: [{ label:'Approved', count:'2,140', pct:'65.2%', cls:'green' },{ label:'Pending', count:'780', pct:'23.8%', cls:'' },{ label:'Declined', count:'360', pct:'11.0%', cls:'red' }] },
    'lease-contract':  { name: 'Contract Signed',     vol: '2,140',  conv: '62.7% contract completion rate', insight: '<strong>1,342 contracts signed</strong> this period. 29.0% remain pending — likely awaiting final documentation or vehicle availability. 8.3% lapsed; re-engage within 14 days before intent cools.', nodes: [{ label:'Signed', count:'1,342', pct:'62.7%', cls:'green' },{ label:'Pending', count:'620', pct:'29.0%', cls:'' },{ label:'Lapsed', count:'178', pct:'8.3%', cls:'red' }] },
  };

  function selectStageUsed(key) {
    const stage = STAGES_USED[key]; if (!stage) return;
    document.querySelectorAll('.journey-page[data-journey-page="used"] .sc').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.journey-page[data-journey-page="used"] .sc[data-stage="${key}"]`);
    if (card) card.classList.add('selected');
    document.getElementById('ds-name-used').textContent  = stage.name;
    document.getElementById('ds-conv-used').textContent  = stage.conv;
    document.getElementById('ds-vol-used').textContent   = stage.vol;
    document.getElementById('ds-insight-used').innerHTML = stage.insight;
    const grid = document.getElementById('ds-grid-used');
    grid.innerHTML = stage.nodes.map(n => `<div class="detail-node ${n.cls}"><div class="dn-label">${n.label}</div><div class="dn-count">${n.count}</div><div class="dn-pct">${n.pct}</div></div>`).join('');
    const panel = document.getElementById('pipeline-detail-used');
    if (panel) { panel.style.display = 'block'; panel.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
  }
  function clearStageUsed() {
    document.querySelectorAll('.journey-page[data-journey-page="used"] .sc').forEach(c => c.classList.remove('selected'));
    const panel = document.getElementById('pipeline-detail-used');
    if (panel) panel.style.display = 'none';
  }

  function selectStageLease(key) {
    const stage = STAGES_LEASE[key]; if (!stage) return;
    document.querySelectorAll('.journey-page[data-journey-page="lease"] .sc').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`.journey-page[data-journey-page="lease"] .sc[data-stage="${key}"]`);
    if (card) card.classList.add('selected');
    document.getElementById('ds-name-lease').textContent  = stage.name;
    document.getElementById('ds-conv-lease').textContent  = stage.conv;
    document.getElementById('ds-vol-lease').textContent   = stage.vol;
    document.getElementById('ds-insight-lease').innerHTML = stage.insight;
    const grid = document.getElementById('ds-grid-lease');
    grid.innerHTML = stage.nodes.map(n => `<div class="detail-node ${n.cls}"><div class="dn-label">${n.label}</div><div class="dn-count">${n.count}</div><div class="dn-pct">${n.pct}</div></div>`).join('');
    const panel = document.getElementById('pipeline-detail-lease');
    if (panel) { panel.style.display = 'block'; panel.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
  }
  function clearStageLease() {
    document.querySelectorAll('.journey-page[data-journey-page="lease"] .sc').forEach(c => c.classList.remove('selected'));
    const panel = document.getElementById('pipeline-detail-lease');
    if (panel) panel.style.display = 'none';
  }

  // expose so onclick= works
  window.selectStageUsed  = selectStageUsed;
  window.clearStageUsed   = clearStageUsed;
  window.selectStageLease = selectStageLease;
  window.clearStageLease  = clearStageLease;

  // Wire Used/Lease stage onclick handlers
  document.querySelectorAll('.journey-page[data-journey-page="used"] .sc').forEach(card => {
    card.onclick = () => selectStageUsed(card.getAttribute('data-stage'));
  });
  document.querySelectorAll('.journey-page[data-journey-page="lease"] .sc').forEach(card => {
    card.onclick = () => selectStageLease(card.getAttribute('data-stage'));
  });

  // ---- Showroom Configuration (Test Drive subtab) ----
  (function () {
    const showroomsList  = document.getElementById('sc-showrooms-list');
    const searchInput    = document.getElementById('sc-search-input');
    const bannerName     = document.getElementById('sc-banner-name');
    const bannerMeta     = document.getElementById('sc-banner-meta');
    const commSubtitle   = document.getElementById('sc-comm-subtitle');
    const daysRow        = document.getElementById('sc-days-row');
    const commRows       = document.getElementById('sc-comm-rows');
    if (!showroomsList) return;

    const SHOWROOMS = [
      { name: 'Dubai Festival City',     city: 'Dubai',     status: 'green'  },
      { name: 'Abu Dhabi Madinat Zayed', city: 'Abu Dhabi', status: 'green'  },
      { name: 'Ajman Downtown',          city: 'Ajman',     status: 'red'    },
      { name: 'Al Ain Central',          city: 'Al Ain',    status: 'green'  },
      { name: 'Dubai Al Quoz',           city: 'Dubai',     status: 'green'  },
      { name: 'Abu Dhabi Airport Road',  city: 'Abu Dhabi', status: 'red'    },
      { name: 'Dubai SZR',               city: 'Dubai',     status: 'green'  },
      { name: 'Fujairah City',           city: 'Fujairah',  status: 'green'  },
      { name: 'Ras Al Khaimah',          city: 'RAK',       status: 'green'  },
      { name: 'Sharjah Al Wahda',        city: 'Sharjah',   status: 'yellow' },
    ];
    let activeShowroom = 0;
    let filterText = '';

    function renderShowrooms() {
      const filtered = SHOWROOMS
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => s.name.toLowerCase().includes(filterText.toLowerCase()));
      showroomsList.innerHTML = filtered.map(({ s, idx }) => `
        <div class="sc-showroom-item${idx === activeShowroom ? ' active' : ''}" data-idx="${idx}">
          <span class="sc-showroom-dot ${s.status}"></span>
          <div class="sc-showroom-text">
            <div class="sc-showroom-name">${s.name}</div>
            <div class="sc-showroom-city">${s.city}</div>
          </div>
        </div>
      `).join('');
      showroomsList.querySelectorAll('.sc-showroom-item').forEach(el => {
        el.addEventListener('click', () => {
          activeShowroom = parseInt(el.getAttribute('data-idx'), 10);
          renderAll();
        });
      });
    }
    function renderBanner() {
      const s = SHOWROOMS[activeShowroom];
      bannerName.textContent = s.name;
      commSubtitle.textContent = '· ' + s.name;
      const colors = { green: 'var(--green)', red: 'var(--red)', yellow: 'var(--amber)' };
      document.getElementById('sc-banner').style.borderLeftColor = colors[s.status];
      bannerMeta.style.color = colors[s.status];
    }

    // Days
    const DAYS = ['S','M','T','W','T','F','S'];
    const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let activeDays = [false, true, true, true, true, true, true];
    function renderDays() {
      daysRow.innerHTML = DAYS.map((d, i) => `
        <button class="sc-day${activeDays[i] ? ' active' : ''}" data-day="${i}" title="${DAY_NAMES[i]}">${d}</button>
      `).join('');
      daysRow.querySelectorAll('.sc-day').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.getAttribute('data-day'), 10);
          activeDays[i] = !activeDays[i];
          renderDays();
        });
      });
    }

    // Toggles
    document.querySelectorAll('[data-toggle]').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('on'));
    });

    // Communications log
    const COMMS = [
      { id:1, customer:'Mohammed Al Rashidi',  channel:'WhatsApp', type:'Booking Confirmation',  status:'Delivered', time:'Today 09:14',     vehicle:'Lexus LX 600' },
      { id:2, customer:'Sara Al Mansoori',     channel:'Email',    type:'24-hr Reminder',        status:'Opened',    time:'Today 08:50',     vehicle:'Toyota Camry' },
      { id:3, customer:'Khalid Bin Hamdan',    channel:'Call',     type:'Qualification Call',    status:'Answered',  time:'Yesterday 16:22', vehicle:'Lexus NX 350' },
      { id:4, customer:'Fatima Al Zaabi',      channel:'WhatsApp', type:'No-Show Alert',         status:'Sent',      time:'Yesterday 11:05', vehicle:'Honda Accord' },
      { id:5, customer:'Omar Al Suwaidi',      channel:'Email',    type:'Booking Confirmation',  status:'Bounced',   time:'Apr 14 · 14:30',  vehicle:'Jeep Wrangler' },
      { id:6, customer:'Aisha Al Blooshi',     channel:'Call',     type:'Qualification Call',    status:'No Answer', time:'Apr 14 · 10:12',  vehicle:'BYD Seal' },
      { id:7, customer:'Hamad Al Mazrouei',    channel:'WhatsApp', type:'24-hr Reminder',        status:'Read',      time:'Apr 13 · 09:55',  vehicle:'Volvo XC90' },
    ];
    const CH_META = {
      WhatsApp: { cls:'wa',    icon:'WA' },
      Email:    { cls:'email', icon:'EM' },
      Call:     { cls:'call',  icon:'CL' },
    };
    const STATUS_CLS = {
      Delivered:'ok', Read:'ok', Opened:'ok', Answered:'ok',
      Sent:'info', Bounced:'bad', 'No Answer':'bad',
    };
    let channelFilter = 'All';

    function renderComms() {
      const filtered = channelFilter === 'All' ? COMMS : COMMS.filter(c => c.channel === channelFilter);
      commRows.innerHTML = filtered.length === 0
        ? `<div style="text-align:center;padding:24px 0;color:var(--ink-3);font-family:'Inter Tight',sans-serif;font-size:13px;">No communications match the filter.</div>`
        : filtered.map(c => {
            const ch = CH_META[c.channel];
            const scls = STATUS_CLS[c.status] || 'info';
            return `
              <div class="sc-comm-row">
                <div class="sc-comm-icon ${ch.cls}">${ch.icon}</div>
                <div>
                  <div class="sc-comm-customer">${c.customer}</div>
                  <div class="sc-comm-vehicle">${c.vehicle}</div>
                </div>
                <span class="sc-comm-channel ${ch.cls}">${c.channel}</span>
                <span class="sc-comm-type">${c.type}</span>
                <span class="sc-comm-status ${scls}">${c.status}</span>
                <span class="sc-comm-time">${c.time}</span>
              </div>`;
          }).join('');
    }

    document.querySelectorAll('.sc-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.sc-pill').forEach(p => p.classList.toggle('active', p === pill));
        channelFilter = pill.getAttribute('data-ch');
        renderComms();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', e => {
        filterText = e.target.value;
        renderShowrooms();
      });
    }

    function renderAll() {
      renderShowrooms();
      renderBanner();
    }
    renderAll();
    renderDays();
    renderComms();
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
