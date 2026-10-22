/**
 * Pack & Plan • DSA Budget & Packing Optimizer
 * Frontend Application Controller
 * Handles REST APIs, 3D Wireframe Bin Packing Simulation, SVG AVL Tree, and Dynamic Donut Charts
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    catalog: [],
    cart: { items: [], totalCost: 0, totalUtility: 0, totalWeight: 0 },
    undoStack: [],
    redoStack: [],
    boxCapacity: 64.0,
    courierFee: 120.0,
    activePreset: 'ENTERPRISE_K8S',
    activeTab: 'tab-dashboard',
    dashboardMode: 'knapsack',
    selectedCategory: 'ALL',
    searchKeyword: '',
    
    // Simulation Engine State
    packingResult: null,
    simulation: {
      timer: null,
      isRunning: false,
      speedMs: 500,
      unpackedQueue: [],
      placedItems: [],
      selectedAlgo: 'FFD'
    }
  };

  // Color Palette for 3D Packed Blocks (from Reference Design)
  const BLOCK_COLORS = [
    { bg: '#f472b6', border: '#ec4899', text: '#fff' }, // Pink
    { bg: '#f87171', border: '#ef4444', text: '#fff' }, // Coral
    { bg: '#fbbf24', border: '#f59e0b', text: '#000' }, // Gold / Amber
    { bg: '#34d399', border: '#10b981', text: '#000' }, // Emerald
    { bg: '#60a5fa', border: '#3b82f6', text: '#fff' }, // Sky Blue
    { bg: '#a78bfa', border: '#8b5cf6', text: '#fff' }, // Violet
    { bg: '#22d3ee', border: '#06b6d4', text: '#000' }, // Cyan
    { bg: '#fb923c', border: '#f97316', text: '#fff' }, // Orange
    { bg: '#e879f9', border: '#d946ef', text: '#fff' }, // Fuchsia
    { bg: '#4ade80', border: '#22c55e', text: '#000' }  // Mint
  ];

  // DOM Elements Cache
  const el = {
    // Header KPIs
    kpiCartCost: document.getElementById('kpiCartCost'),
    kpiBudgetProgress: document.getElementById('kpiBudgetProgress'),
    kpiSpaceUtil: document.getElementById('kpiSpaceUtil'),
    kpiWeightRatio: document.getElementById('kpiWeightRatio'),
    kpiUtilProgress: document.getElementById('kpiUtilProgress'),
    kpiCartBoxes: document.getElementById('kpiCartBoxes'),
    kpiBoxesProgress: document.getElementById('kpiBoxesProgress'),
    kpiCourierCostSub: document.getElementById('kpiCourierCostSub'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    appSidebar: document.getElementById('appSidebar'),
    btnQuickUndo: document.getElementById('btnQuickUndo'),
    btnQuickRedo: document.getElementById('btnQuickRedo'),
    undoBadge: document.getElementById('undoBadge'),
    redoBadge: document.getElementById('redoBadge'),
    scenarioBtns: document.querySelectorAll('.scenario-btn'),
    navItems: document.querySelectorAll('.nav-item'),
    tabPanels: document.querySelectorAll('.tab-panel'),

    // Dashboard Executive
    dispBudgetLimit: document.getElementById('dispBudgetLimit'),
    dispCartCost: document.getElementById('dispCartCost'),
    dispCartUtility: document.getElementById('dispCartUtility'),
    dispRemainingBudget: document.getElementById('dispRemainingBudget'),
    btnModeKnapsack: document.getElementById('btnModeKnapsack'),
    btnModeBinpack: document.getElementById('btnModeBinpack'),
    modeStatusText: document.getElementById('modeStatusText'),
    dashboardKnapsackView: document.getElementById('dashboardKnapsackView'),
    dashboardBinpackView: document.getElementById('dashboardBinpackView'),
    btnToggleDp: document.getElementById('btnToggleDp'),
    btnToggleGreedy: document.getElementById('btnToggleGreedy'),
    categoryDonutSvg: document.getElementById('categoryDonutSvg'),
    donutSlicesGroup: document.getElementById('donutSlicesGroup'),
    donutCenterCount: document.getElementById('donutCenterCount'),
    donutLegendContainer: document.getElementById('donutLegendContainer'),
    budgetInput: document.getElementById('budgetInput'),
    btnRunKnapsack: document.getElementById('btnRunKnapsack'),
    optInsightBanner: document.getElementById('optInsightBanner'),
    optInsightText: document.getElementById('optInsightText'),
    cartTableBody: document.getElementById('cartTableBody'),
    cartEmptyState: document.getElementById('cartEmptyState'),
    btnClearCart: document.getElementById('btnClearCart'),
    btnOpenAddItemModal: document.getElementById('btnOpenAddItemModal'),
    btnOpenAddItemModal2: document.getElementById('btnOpenAddItemModal2'),
    categoryFilterChips: document.getElementById('categoryFilterChips'),
    catalogSearchInput: document.getElementById('catalogSearchInput'),

    // 3D Wireframe Packer & Simulation
    dispBoxCapTag: document.getElementById('dispBoxCapTag'),
    packerBoxCountBadge: document.getElementById('packerBoxCountBadge'),
    packerCourierCostBadge: document.getElementById('packerCourierCostBadge'),
    binsWireframeStage: document.getElementById('binsWireframeStage'),
    unpackedItemsCount: document.getElementById('unpackedItemsCount'),
    itemQueueContainer: document.getElementById('itemQueueContainer'),
    packerAlgoSelect: document.getElementById('packerAlgoSelect'),
    boxCapacitySelect: document.getElementById('boxCapacitySelect'),
    simSpeedSlider: document.getElementById('simSpeedSlider'),
    speedLabel: document.getElementById('speedLabel'),
    btnPlayVisualizer: document.getElementById('btnPlayVisualizer'),
    btnStepVisualizer: document.getElementById('btnStepVisualizer'),
    btnResetVisualizer: document.getElementById('btnResetVisualizer'),
    btnProceedCheckout: document.getElementById('btnProceedCheckout'),

    // Tab 2: Knapsack DP
    ksDpUtility: document.getElementById('ksDpUtility'),
    ksDpCost: document.getElementById('ksDpCost'),
    ksGreedyUtility: document.getElementById('ksGreedyUtility'),
    ksGreedyCost: document.getElementById('ksGreedyCost'),
    ksOptimalityGap: document.getElementById('ksOptimalityGap'),
    ksRuntime: document.getElementById('ksRuntime'),
    ksExplanationAlert: document.getElementById('ksExplanationAlert'),
    ksExplanationText: document.getElementById('ksExplanationText'),
    dpMatrixBody: document.getElementById('dpMatrixBody'),
    ksDpItemsList: document.getElementById('ksDpItemsList'),
    ksGreedyItemsList: document.getElementById('ksGreedyItemsList'),

    // Tab 3: Bin Packing Benchmark
    ffdBoxCount: document.getElementById('ffdBoxCount'),
    ffdUtil: document.getElementById('ffdUtil'),
    ffdCost: document.getElementById('ffdCost'),
    bfdBoxCount: document.getElementById('bfdBoxCount'),
    bfdUtil: document.getElementById('bfdUtil'),
    bfdCost: document.getElementById('bfdCost'),
    wfdBoxCount: document.getElementById('wfdBoxCount'),
    wfdUtil: document.getElementById('wfdUtil'),
    wfdCost: document.getElementById('wfdCost'),
    nfBoxCount: document.getElementById('nfBoxCount'),
    nfUtil: document.getElementById('nfUtil'),
    nfCost: document.getElementById('nfCost'),
    packingSavingsText: document.getElementById('packingSavingsText'),
    boxesDetailedGrid: document.getElementById('boxesDetailedGrid'),
    algoCardFfd: document.getElementById('algoCardFfd'),
    algoCardBfd: document.getElementById('algoCardBfd'),
    algoCardWfd: document.getElementById('algoCardWfd'),
    algoCardNf: document.getElementById('algoCardNf'),
    hostNodeSectionTitle: document.getElementById('hostNodeSectionTitle'),

    // Tab 4: AVL Tree
    avlTotalNodes: document.getElementById('avlTotalNodes'),
    avlHeight: document.getElementById('avlHeight'),
    avlTreeGraph: document.getElementById('avlTreeGraph'),
    avlRangeMin: document.getElementById('avlRangeMin'),
    avlRangeMax: document.getElementById('avlRangeMax'),
    btnExecuteRangeSearch: document.getElementById('btnExecuteRangeSearch'),
    rangeResultsList: document.getElementById('rangeResultsList'),
    formInsertAvlItem: document.getElementById('formInsertAvlItem'),
    avlItemName: document.getElementById('avlItemName'),
    avlItemPrice: document.getElementById('avlItemPrice'),
    avlItemUtility: document.getElementById('avlItemUtility'),
    avlItemWeight: document.getElementById('avlItemWeight'),
    minPriceSlider: document.getElementById('minPriceSlider'),
    maxPriceSlider: document.getElementById('maxPriceSlider'),
    priceRangeLabel: document.getElementById('priceRangeLabel'),
    btnResetPriceFilter: document.getElementById('btnResetPriceFilter'),
    avlNodeCountBadge: document.getElementById('avlNodeCountBadge'),
    catalogContainer: document.getElementById('catalogItemsContainer'),

    // Tab 5: Stack
    btnInspectUndo: document.getElementById('btnInspectUndo'),
    btnInspectRedo: document.getElementById('btnInspectRedo'),
    undoStackDepth: document.getElementById('undoStackDepth'),
    redoStackDepth: document.getElementById('redoStackDepth'),
    undoStackList: document.getElementById('undoStackList'),
    redoStackList: document.getElementById('redoStackList'),

    // Tab 6: Huffman
    checkoutCustomerName: document.getElementById('checkoutCustomerName'),
    checkoutOrgName: document.getElementById('checkoutOrgName'),
    btnGenerateInvoiceNow: document.getElementById('btnGenerateInvoiceNow'),
    compOriginalBits: document.getElementById('compOriginalBits'),
    compOriginalBytes: document.getElementById('compOriginalBytes'),
    compEncodedBits: document.getElementById('compEncodedBits'),
    compEncodedBytes: document.getElementById('compEncodedBytes'),
    compRatio: document.getElementById('compRatio'),
    compBitsPerChar: document.getElementById('compBitsPerChar'),
    rawInvoiceDisplay: document.getElementById('rawInvoiceDisplay'),
    encodedBitstreamDisplay: document.getElementById('encodedBitstreamDisplay'),
    decompressedTextDisplay: document.getElementById('decompressedTextDisplay'),
    bitLengthBadge: document.getElementById('bitLengthBadge'),
    huffmanCodeTableBody: document.getElementById('huffmanCodeTableBody'),
    btnCopyInvoice: document.getElementById('btnCopyInvoice'),
    btnPrintInvoicePdf: document.getElementById('btnPrintInvoicePdf'),
    btnExportInvoiceWord: document.getElementById('btnExportInvoiceWord'),
    btnPrintDecompressedPdf: document.getElementById('btnPrintDecompressedPdf'),
    btnExportDecompressedWord: document.getElementById('btnExportDecompressedWord'),
    customCompressInput: document.getElementById('customCompressInput'),
    btnCompressCustomText: document.getElementById('btnCompressCustomText'),

    // Bottom Terminal
    terminalToggleBtn: document.getElementById('terminalToggleBtn'),
    terminalLogBody: document.getElementById('terminalLogBody'),
    terminalArrow: document.getElementById('terminalArrow'),

    // Modal
    modalAddItem: document.getElementById('modalAddItem'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    formAddCatalogItem: document.getElementById('formAddCatalogItem'),
    modalItemName: document.getElementById('modalItemName'),
    modalItemCategory: document.getElementById('modalItemCategory'),
    modalItemDesc: document.getElementById('modalItemDesc'),
    modalItemPrice: document.getElementById('modalItemPrice'),
    modalItemUtility: document.getElementById('modalItemUtility'),
    modalItemWeight: document.getElementById('modalItemWeight')
  };

  // ==========================================
  // INITIALIZATION & EVENT BINDINGS
  // ==========================================

  function init() {
    setupThemeToggle();
    setupDashboardModeSwitcher();
    setupSidebarNavigation();
    setupScenarioSwitching();
    setupCatalogFilter();
    setupCartActions();
    setupKnapsackTrigger();
    setupSimulationControls();
    setupStackInspector();
    setupHuffmanControls();
    setupTerminalLogger();
    setupModal();

    // Initial data load
    fetchInitialData();
  }



  // Day / Night Theme Toggle Controller

  function setupThemeToggle() {
    const savedTheme = localStorage.getItem('packplan_theme') || 'dark';
    applyTheme(savedTheme, false);

    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme, true);
      });

      el.themeToggleBtn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          el.themeToggleBtn.click();
        }
      });
    }
  }

  function applyTheme(theme, logChange = true) {
    const isLight = theme === 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('light-theme', isLight);
    try {
      localStorage.setItem('packplan_theme', theme);
    } catch (e) {}

    if (el.themeToggleBtn) {
      el.themeToggleBtn.setAttribute('aria-checked', isLight ? 'true' : 'false');
      el.themeToggleBtn.setAttribute('title', isLight ? 'Switch to Night Theme (Dark)' : 'Switch to Day Theme (Light)');
      el.themeToggleBtn.classList.toggle('is-day', isLight);
      el.themeToggleBtn.classList.toggle('is-night', !isLight);
    }

    if (logChange) {
      addLog(`[Theme] Switched to ${isLight ? 'Day Theme (Light)' : 'Night Theme (Dark)'}`, isLight ? 'amber' : 'blue');
    }

    // Refresh dynamic AVL tree if active so nodes match theme
    if (state.activeTab === 'tab-avl') {
      fetchAndRenderAvlTree();
    }
  }


  // Sidebar Navigation Tabs & Hamburger Drawer Menu

  function closeSidebar() {
    if (el.appSidebar) el.appSidebar.classList.remove('open');
    if (el.sidebarBackdrop) el.sidebarBackdrop.classList.remove('active');
    if (el.sidebarToggleBtn) {
      el.sidebarToggleBtn.classList.remove('active');
      el.sidebarToggleBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function openSidebar() {
    if (el.appSidebar) el.appSidebar.classList.add('open');
    if (el.sidebarBackdrop) el.sidebarBackdrop.classList.add('active');
    if (el.sidebarToggleBtn) {
      el.sidebarToggleBtn.classList.add('active');
      el.sidebarToggleBtn.setAttribute('aria-expanded', 'true');
    }
  }

  function toggleSidebar() {
    if (el.appSidebar && el.appSidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  function setupSidebarNavigation() {
    // Hamburger button toggle
    if (el.sidebarToggleBtn) {
      el.sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
      });
    }

    // Close button ('X') inside sidebar header
    if (el.sidebarCloseBtn) {
      el.sidebarCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeSidebar();
      });
    }

    // Backdrop click closes sidebar
    if (el.sidebarBackdrop) {
      el.sidebarBackdrop.addEventListener('click', () => {
        closeSidebar();
      });
    }

    // Keyboard ESC key closes sidebar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && el.appSidebar && el.appSidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    // Clicking any menu option selects it and closes the drawer
    el.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        el.navItems.forEach(t => t.classList.remove('active'));
        el.tabPanels.forEach(p => p.classList.remove('active'));

        item.classList.add('active');
        const activePanel = document.getElementById(targetTab);
        if (activePanel) activePanel.classList.add('active');
        state.activeTab = targetTab;

        // Auto-close sidebar so selected view is immediately displayed full-width
        closeSidebar();

        addLog(`[Navigation] Switched view to: ${targetTab.replace('tab-', '').toUpperCase()}`, 'cyan');

        if (targetTab === 'tab-avl') {
          fetchAndRenderAvlTree();
        } else if (targetTab === 'tab-packing') {
          triggerBinPacking();
        } else if (targetTab === 'tab-huffman') {
          triggerCheckout();
        } else if (targetTab === 'tab-dashboard') {
          triggerBinPacking();
        }
      });
    });

    if (el.btnProceedCheckout) {
      el.btnProceedCheckout.addEventListener('click', () => {
        const huffmanNav = document.querySelector('[data-tab="tab-huffman"]');
        if (huffmanNav) huffmanNav.click();
      });
    }
  }


  // Domain Scenario Switcher

  function setupScenarioSwitching() {
    el.scenarioBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const preset = btn.getAttribute('data-preset');
        el.scenarioBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activePreset = preset;
        closeSidebar();

        if (preset === 'FINTECH_AI_CLOUD') {
          if (el.checkoutOrgName) el.checkoutOrgName.value = 'Apex FinTech & Quantitative Trading (AWS US-East-1)';
          if (el.checkoutCustomerName) el.checkoutCustomerName.value = 'Harsh (Chief Cloud Architect)';
          addLog('[Scenario] Switched domain to: High-Frequency Trading & AI Cluster', 'amber');
        } else {
          if (el.checkoutOrgName) el.checkoutOrgName.value = 'Global SaaS Enterprise Infrastructure (K8s Multi-Region)';
          if (el.checkoutCustomerName) el.checkoutCustomerName.value = 'Harsh (DevOps & FinOps Lead)';
          addLog('[Scenario] Switched domain to: Enterprise Kubernetes Microservices & APIs', 'amber');
        }

        try {
          const res = await apiPost('/api/presets/load', { preset });
          if (res.success) {
            state.catalog = res.catalog || [];
            state.selectedCategory = 'ALL';
            state.searchKeyword = '';
            if (el.catalogSearchInput) el.catalogSearchInput.value = '';
            renderCategoryChips();
            applyCatalogFilters();
            await fetchCart();
            await triggerBinPacking();
            if (state.activeTab === 'tab-avl') fetchAndRenderAvlTree();
          }
        } catch (err) {
          console.error('Error loading preset:', err);
        }
      });
    });
  }


  // Catalog Filter, Instant Search & Dynamic Category Chips

  function renderCategoryChips() {
    if (!el.categoryFilterChips) return;
    const uniqueCats = ['ALL'];
    const seen = new Set();
    (state.catalog || []).forEach(it => {
      if (it.category && !seen.has(it.category)) {
        seen.add(it.category);
        uniqueCats.push(it.category);
      }
    });

    el.categoryFilterChips.innerHTML = '';
    uniqueCats.forEach(cat => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `filter-chip ${(state.selectedCategory || 'ALL').toLowerCase() === cat.toLowerCase() ? 'active' : ''}`;
      chip.setAttribute('data-cat', cat);
      chip.textContent = cat;
      chip.addEventListener('click', () => {
        state.selectedCategory = cat;
        const allChips = el.categoryFilterChips.querySelectorAll('.filter-chip');
        allChips.forEach(c => {
          c.classList.toggle('active', (c.getAttribute('data-cat') || '').toLowerCase() === cat.toLowerCase());
        });
        applyCatalogFilters();
      });
      el.categoryFilterChips.appendChild(chip);
    });
  }

  function applyCatalogFilters() {
    let filtered = state.catalog || [];
    if (state.selectedCategory && state.selectedCategory !== 'ALL') {
      filtered = filtered.filter(it => it.category && it.category.toLowerCase() === state.selectedCategory.toLowerCase());
    }
    if (state.searchKeyword) {
      const term = state.searchKeyword.toLowerCase();
      filtered = filtered.filter(it => 
        (it.name && it.name.toLowerCase().includes(term)) ||
        (it.category && it.category.toLowerCase().includes(term)) ||
        (it.description && it.description.toLowerCase().includes(term)) ||
        (it.id && it.id.toLowerCase().includes(term)) ||
        (String(it.price).includes(term))
      );
    }
    renderCatalog(filtered);
    if (el.avlNodeCountBadge) {
      el.avlNodeCountBadge.textContent = `${filtered.length} of ${state.catalog.length} items available`;
    }
  }

  function setupCatalogFilter() {
    if (el.catalogSearchInput) {
      el.catalogSearchInput.addEventListener('input', (e) => {
        state.searchKeyword = e.target.value.trim();
        applyCatalogFilters();
      });
    }

    if (el.minPriceSlider && el.maxPriceSlider) {
      const updateFilter = async () => {
        let minP = parseFloat(el.minPriceSlider.value);
        let maxP = parseFloat(el.maxPriceSlider.value);
        if (minP > maxP) {
          const temp = minP; minP = maxP; maxP = temp;
        }
        if (el.priceRangeLabel) {
          el.priceRangeLabel.textContent = `$${minP.toLocaleString()} - $${maxP.toLocaleString()}`;
        }

        try {
          const res = await apiGet(`/api/catalog?minPrice=${minP}&maxPrice=${maxP}`);
          renderCatalog(res.items);
          if (el.avlNodeCountBadge) {
            el.avlNodeCountBadge.textContent = `${res.count} of ${state.catalog.length} items (AVL Range)`;
          }
        } catch (err) {
          console.error('Filter query error:', err);
        }
      };

      el.minPriceSlider.addEventListener('input', updateFilter);
      el.maxPriceSlider.addEventListener('input', updateFilter);

      if (el.btnResetPriceFilter) {
        el.btnResetPriceFilter.addEventListener('click', () => {
          el.minPriceSlider.value = 0;
          el.maxPriceSlider.value = 15000;
          if (el.priceRangeLabel) el.priceRangeLabel.textContent = '$0 - $15,000';
          applyCatalogFilters();
        });
      }
    }
  }


  // Cluster Actions & Undo/Redo

  function setupCartActions() {
    el.btnClearCart.addEventListener('click', async () => {
      await apiPost('/api/cart/clear', {});
      addLog('[Rollout Stack] Stack Action: CLEAR_CART pushed to Undo Stack', 'amber');
      await fetchCart();
      await triggerBinPacking();
    });

    const doUndo = async () => {
      await apiPost('/api/cart/undo', {});
      addLog('[Rollout Stack] POP Undo Stack -> Transaction reversed and pushed to Redo Stack', 'cyan');
      await fetchCart();
      await triggerBinPacking();
    };

    const doRedo = async () => {
      await apiPost('/api/cart/redo', {});
      addLog('[Rollout Stack] POP Redo Stack -> Transaction re-applied', 'cyan');
      await fetchCart();
      await triggerBinPacking();
    };

    el.btnQuickUndo.addEventListener('click', doUndo);
    el.btnQuickRedo.addEventListener('click', doRedo);
    el.btnInspectUndo.addEventListener('click', doUndo);
    el.btnInspectRedo.addEventListener('click', doRedo);
  }


  // Knapsack Optimizer Trigger

  function setupKnapsackTrigger() {
    el.btnRunKnapsack.addEventListener('click', async () => {
      const budget = parseFloat(el.budgetInput.value) || 10000;
      el.btnRunKnapsack.disabled = true;
      el.btnRunKnapsack.innerHTML = 'Computing 0/1 Knapsack DP...';

      addLog(`[Knapsack DP] Evaluating optimal subset for cash budget $${budget.toLocaleString()}...`, 'green');

      try {
        const res = await apiPost('/api/knapsack', { budget, applyToCart: true });
        renderKnapsackResult(res.result);
        await fetchCart();
        await triggerBinPacking();

        el.optInsightBanner.style.display = 'flex';
        el.optInsightText.textContent = res.result.optimalityExplanation;
        addLog(`[Knapsack DP] Solved! Optimal Utility: ${res.result.totalUtility} pts under $${res.result.totalCost}`, 'green');
      } catch (err) {
        console.error('Knapsack failed:', err);
      } finally {
        el.btnRunKnapsack.disabled = false;
        el.btnRunKnapsack.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Auto-Maximize Cart (0/1 Knapsack)
        `;
      }
    });

    // Dashboard utilizes strictly globally-optimal 0/1 Knapsack DP
  }



  function getActivePackingResult(comp) {
    if (!comp) return null;
    const algo = state.simulation.selectedAlgo || 'FFD';
    if (algo === 'BFD' && comp.bfd) return comp.bfd;
    if (algo === 'WFD' && comp.worstFit) return comp.worstFit;
    if (algo === 'NF' && comp.nextFit) return comp.nextFit;
    return comp.ffd || comp.optimalChoice;
  }

  function syncPackingAlgorithm(algo) {
    state.simulation.selectedAlgo = algo;
    if (el.packerAlgoSelect) el.packerAlgoSelect.value = algo;

    const cards = [
      { id: 'algoCardFfd', code: 'FFD', name: 'First Fit Decreasing (FFD)' },
      { id: 'algoCardBfd', code: 'BFD', name: 'Best Fit Decreasing (BFD)' },
      { id: 'algoCardWfd', code: 'WFD', name: 'Worst Fit Decreasing (WFD)' },
      { id: 'algoCardNf',  code: 'NF',  name: 'Next Fit (NF)' }
    ];

    cards.forEach(c => {
      const cardEl = document.getElementById(c.id);
      if (cardEl) {
        if (c.code === algo) {
          cardEl.classList.add('active-winner');
        } else {
          cardEl.classList.remove('active-winner');
        }
      }
    });

    const activeDef = cards.find(c => c.code === algo);
    if (el.hostNodeSectionTitle && activeDef) {
      el.hostNodeSectionTitle.textContent = `Consolidated Bare-Metal Host Node Allocation (${activeDef.name})`;
    }
  }


  // Dashboard Mode Switcher Controller (Knapsack FinOps vs 3D Bin Packing)

  function setupDashboardModeSwitcher() {
    function switchDashboardMode(mode) {
      state.dashboardMode = mode;
      if (mode === 'binpack') {
        if (el.btnModeBinpack) el.btnModeBinpack.classList.add('active');
        if (el.btnModeKnapsack) el.btnModeKnapsack.classList.remove('active');
        if (el.dashboardBinpackView) el.dashboardBinpackView.style.display = 'flex';
        if (el.dashboardKnapsackView) el.dashboardKnapsackView.style.display = 'none';
        if (el.modeStatusText) el.modeStatusText.textContent = 'Host Node Bin Packing Visualizer & 3D Server Allocations';
        addLog('[Dashboard View] Switched to 3D Host Node Bin Packing stage (Catalog hidden)', 'cyan');
        triggerBinPacking();
      } else {
        if (el.btnModeKnapsack) el.btnModeKnapsack.classList.add('active');
        if (el.btnModeBinpack) el.btnModeBinpack.classList.remove('active');
        if (el.dashboardKnapsackView) el.dashboardKnapsackView.style.display = 'flex';
        if (el.dashboardBinpackView) el.dashboardBinpackView.style.display = 'none';
        if (el.modeStatusText) el.modeStatusText.textContent = '0/1 Knapsack Workload Planner (Catalog & Allocations)';
        addLog('[Dashboard View] Switched to 0/1 Knapsack Workload Planner & Catalog', 'cyan');
      }
    }

    if (el.btnModeKnapsack) {
      el.btnModeKnapsack.addEventListener('click', () => switchDashboardMode('knapsack'));
    }
    if (el.btnModeBinpack) {
      el.btnModeBinpack.addEventListener('click', () => switchDashboardMode('binpack'));
    }
  }

  // 3D Wireframe Bin Packing Simulation Controls

  function setupSimulationControls() {
    // Algorithm dropdown
    el.packerAlgoSelect.addEventListener('change', (e) => {
      const algo = e.target.value;
      syncPackingAlgorithm(algo);
      addLog(`[Host Node Scheduler] Packing heuristic switched to: ${algo}`, 'cyan');
      triggerBinPacking();
    });

    // Hook click handlers onto the 4 algorithm benchmark cards in Tab 3
    [
      { id: 'algoCardFfd', code: 'FFD' },
      { id: 'algoCardBfd', code: 'BFD' },
      { id: 'algoCardWfd', code: 'WFD' },
      { id: 'algoCardNf',  code: 'NF' }
    ].forEach(item => {
      const cardEl = document.getElementById(item.id);
      if (cardEl) {
        cardEl.addEventListener('click', () => {
          syncPackingAlgorithm(item.code);
          addLog(`[Host Node Scheduler] Switched placement heuristic to ${item.code}`, 'cyan');
          triggerBinPacking();
        });
      }
    });

    // Host node RAM capacity select
    el.boxCapacitySelect.addEventListener('change', async (e) => {
      const cap = parseFloat(e.target.value);
      state.boxCapacity = cap;
      el.dispBoxCapTag.textContent = `${cap.toFixed(1)} GB RAM`;
      addLog(`[Host Node Scheduler] Standard host node RAM limit set to: ${cap.toFixed(1)} GB`, 'cyan');
      await triggerBinPacking();
    });

    // Speed slider
    el.simSpeedSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.simulation.speedMs = val;
      if (val < 300) el.speedLabel.textContent = 'Fast';
      else if (val > 800) el.speedLabel.textContent = 'Slow';
      else el.speedLabel.textContent = 'Normal';
    });

    // Step Forward
    el.btnStepVisualizer.addEventListener('click', () => {
      stepSimulationForward();
    });

    // Run Visualizer / Pause
    el.btnPlayVisualizer.addEventListener('click', () => {
      if (state.simulation.isRunning) {
        pauseSimulation();
      } else {
        startSimulation();
      }
    });

    // Reset
    el.btnResetVisualizer.addEventListener('click', () => {
      resetSimulation();
    });
  }


  // Stack Inspector Controls

  function setupStackInspector() {
    // Buttons hooked in setupCartActions
  }


  // Huffman Controls

  function setupHuffmanControls() {
    if (el.btnGenerateInvoiceNow) {
      el.btnGenerateInvoiceNow.addEventListener('click', triggerCheckout);
    }

    if (el.btnCopyInvoice) {
      el.btnCopyInvoice.addEventListener('click', () => {
        navigator.clipboard.writeText(el.rawInvoiceDisplay.textContent);
        el.btnCopyInvoice.textContent = 'Copied!';
        setTimeout(() => { el.btnCopyInvoice.textContent = 'Copy Text'; }, 2000);
      });
    }

    if (el.btnPrintInvoicePdf) {
      el.btnPrintInvoicePdf.addEventListener('click', () => {
        const text = el.rawInvoiceDisplay.textContent;
        printInvoiceDocument(text, 'Digital Order Raw Invoice');
      });
    }

    if (el.btnExportInvoiceWord) {
      el.btnExportInvoiceWord.addEventListener('click', () => {
        const text = el.rawInvoiceDisplay.textContent;
        exportInvoiceAsWord(text, 'Raw_Order_Invoice');
      });
    }

    if (el.btnPrintDecompressedPdf) {
      el.btnPrintDecompressedPdf.addEventListener('click', () => {
        const text = el.decompressedTextDisplay.textContent;
        printInvoiceDocument(text, 'Lossless Decompressed Bill (Huffman Recovery)');
      });
    }

    if (el.btnExportDecompressedWord) {
      el.btnExportDecompressedWord.addEventListener('click', () => {
        const text = el.decompressedTextDisplay.textContent;
        exportInvoiceAsWord(text, 'Lossless_Decompressed_Bill');
      });
    }

    if (el.btnCompressCustomText) {
      el.btnCompressCustomText.addEventListener('click', async () => {
        const text = el.customCompressInput.value.trim();
        if (!text) return;
        try {
          const res = await apiPost('/api/huffman/custom', { text });
          const comp = res.compression || res.result || res;
          if (comp) {
            renderCheckoutResult({
              invoice: { rawInvoiceText: text },
              compression: comp
            });
            addLog(`[Huffman Coding] Custom text compressed: ${(comp.compressionRatio || 0).toFixed(1)}% savings`, 'green');
          }
        } catch (err) {
          console.error('Custom compression error:', err);
        }
      });
    }
  }


  // Bottom Terminal Console

  function setupTerminalLogger() {
    el.terminalToggleBtn.addEventListener('click', () => {
      const isCollapsed = el.terminalLogBody.classList.contains('collapsed');
      if (isCollapsed) {
        el.terminalLogBody.classList.remove('collapsed');
        el.terminalArrow.innerHTML = '&#9660;';
      } else {
        el.terminalLogBody.classList.add('collapsed');
        el.terminalArrow.innerHTML = '&#9650;';
      }
    });
  }

  function addLog(msg, color = 'muted') {
    if (!el.terminalLogBody) return;
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = `log-line text-${color}`;
    line.textContent = `[${time}] ${msg}`;
    el.terminalLogBody.appendChild(line);
    el.terminalLogBody.scrollTop = el.terminalLogBody.scrollHeight;
  }


  // Add Item Modal

  function setupModal() {
    const openModal = () => { if (el.modalAddItem) el.modalAddItem.style.display = 'flex'; };
    const closeModal = () => { if (el.modalAddItem) el.modalAddItem.style.display = 'none'; };

    if (el.btnOpenAddItemModal) el.btnOpenAddItemModal.addEventListener('click', openModal);
    if (el.btnOpenAddItemModal2) el.btnOpenAddItemModal2.addEventListener('click', openModal);
    if (el.btnCloseModal) el.btnCloseModal.addEventListener('click', closeModal);
    if (el.btnCancelModal) el.btnCancelModal.addEventListener('click', closeModal);

    if (el.formAddCatalogItem) {
      el.formAddCatalogItem.addEventListener('submit', async (e) => {
        e.preventDefault();
        const itemData = {
          name: el.modalItemName.value,
          category: el.modalItemCategory.value,
          description: el.modalItemDesc ? el.modalItemDesc.value.trim() : '',
          price: parseFloat(el.modalItemPrice.value),
          utility: parseInt(el.modalItemUtility.value),
          weight: parseFloat(el.modalItemWeight.value)
        };

        const autoAddCheckbox = document.getElementById('modalAutoAddToCart');
        const autoAdd = autoAddCheckbox ? autoAddCheckbox.checked : true;

        try {
          const res = await apiPost('/api/catalog/item', itemData);
          if (res.success) {
            closeModal();
            el.formAddCatalogItem.reset();
            await fetchCatalogData();
            addLog(`[AVL Tree] Dynamically inserted custom microservice: "${itemData.name}" ($${itemData.price}/mo, ${itemData.weight}GB RAM, +${itemData.utility}pts SLA)`, 'white');

            if (autoAdd && res.item && res.item.id) {
              await apiPost('/api/cart/add', { itemId: res.item.id });
              addLog(`[Cluster Action] Automatically scheduled custom pod "${itemData.name}" into cluster packing`, 'white');
              await fetchCart();
              await triggerBinPacking();
            }

            if (state.activeTab === 'tab-avl') fetchAndRenderAvlTree();
          }
        } catch (err) {
          console.error('Failed to add custom item:', err);
        }
      });
    }

    // AVL Tab Form
    el.formInsertAvlItem.addEventListener('submit', async (e) => {
      e.preventDefault();
      const itemData = {
        name: el.avlItemName.value,
        category: 'Custom Node',
        price: parseFloat(el.avlItemPrice.value),
        utility: parseInt(el.avlItemUtility.value),
        weight: parseFloat(el.avlItemWeight.value)
      };

      try {
        const res = await apiPost('/api/catalog/item', itemData);
        if (res.success) {
          el.formInsertAvlItem.reset();
          await fetchCatalogData();
          fetchAndRenderAvlTree();
          addLog(`[AVL Tree] Invariant verified after insertion. Heights re-calculated.`, 'green');
        }
      } catch (err) {
        console.error('Failed to insert AVL item:', err);
      }
    });

    el.btnExecuteRangeSearch.addEventListener('click', async () => {
      const minP = parseFloat(el.avlRangeMin.value) || 0;
      const maxP = parseFloat(el.avlRangeMax.value) || 100000;

      try {
        const res = await apiGet(`/api/catalog?minPrice=${minP}&maxPrice=${maxP}`);
        el.rangeResultsList.innerHTML = '';
        if (res.items.length === 0) {
          el.rangeResultsList.innerHTML = '<li class="range-item-row" style="color: var(--text-muted)">No items found in this range.</li>';
        } else {
          res.items.forEach(it => {
            const li = document.createElement('li');
            li.className = 'range-item-row';
            li.innerHTML = `
              <span>${it.name}</span>
              <strong style="color: var(--accent-neon-green)">$${it.price.toLocaleString()}</strong>
            `;
            el.rangeResultsList.appendChild(li);
          });
        }
        highlightAvlTreeRange(minP, maxP);
        addLog(`[AVL Range Query] Pruned in-order traversal: matched ${res.items.length} items in [$${minP}, $${maxP}]`, 'cyan');
      } catch (err) {
        console.error('Range search error:', err);
      }
    });
  }

  // ==========================================
  // HTTP REST API CALLS
  // ==========================================

  async function apiGet(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  async function apiPost(url, data) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  // ==========================================
  // DATA FETCHING & SYNCHRONIZATION
  // ==========================================

  async function fetchInitialData() {
    try {
      await fetchCatalogData();
      await fetchCart();
      await triggerBinPacking();
      fetchAndRenderAvlTree();
      triggerCheckout();
    } catch (err) {
      console.error('Initialization fetch error:', err);
    }
  }

  async function fetchCatalogData() {
    const res = await apiGet('/api/catalog');
    state.catalog = res.items || [];
    renderCategoryChips();
    applyCatalogFilters();
    if (el.avlNodeCountBadge) {
      el.avlNodeCountBadge.textContent = `${state.catalog.length} items in AVL Tree`;
    }
  }

  async function fetchCart() {
    const res = await apiGet('/api/cart');
    state.cart = (res && res.items) ? res : (res.cart || { items: [], totalCost: 0, totalUtility: 0, totalWeight: 0 });
    state.undoStack = res.undoStack || [];
    state.redoStack = res.redoStack || [];

    renderCart(state.cart);
    renderStackVisualizer(state.undoStack, state.redoStack);
    renderCategoryDonut(state.cart.items);
  }

  async function triggerBinPacking() {
    try {
      const cap = state.boxCapacity;
      const fee = state.courierFee;
      const res = await apiGet(`/api/binpack?capacity=${cap}&fee=${fee}`);
      if (res.comparison) {
        state.packingResult = res.comparison;
        renderPackingComparison(res.comparison);
        
        // Initialize 3D Wireframe Simulation with the specifically selected algorithm
        const activePack = getActivePackingResult(res.comparison);
        initPackingSimulation(activePack);
      }
    } catch (err) {
      console.error('Bin packing fetch error:', err);
    }
  }

  async function triggerCheckout() {
    const customer = el.checkoutCustomerName ? el.checkoutCustomerName.value : 'Customer';
    const org = el.checkoutOrgName ? el.checkoutOrgName.value : 'Event';
    try {
      const res = await apiPost('/api/checkout', {
        customerName: customer,
        organizationName: org
      });
      if (res) {
        state.latestCheckout = res;
        renderCheckoutResult(res);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  }

  // ==========================================
  // 3D WIREFRAME BIN PACKING SIMULATION ENGINE
  // ==========================================

  function initPackingSimulation(packingData, preFill = true) {
    pauseSimulation();

    // Prepare unpacked queue
    state.simulation.unpackedQueue = [];
    state.simulation.placedItems = [];

    if (!packingData || !packingData.boxes || packingData.boxes.length === 0) {
      el.binsWireframeStage.innerHTML = `
        <div class="empty-state-card" style="grid-column: span 3; padding: 2.5rem 1rem;">
          <p style="color: var(--text-muted); margin-bottom: 0.85rem; font-size: 0.82rem;">Your cluster allocation is empty. Deploy microservices from the catalog or auto-schedule with Knapsack DP.</p>
          <button class="btn-stark-white" id="btnPopulateCartPrompt" style="margin: 0 auto;">
            ⚡ Auto-Maximize Workloads (0/1 Knapsack DP)
          </button>
        </div>
      `;
      const btnPrompt = document.getElementById('btnPopulateCartPrompt');
      if (btnPrompt) btnPrompt.addEventListener('click', () => el.btnRunKnapsack.click());
      el.itemQueueContainer.innerHTML = '<span class="text-muted" style="font-size: 0.72rem;">No pending items.</span>';
      el.unpackedItemsCount.textContent = '0 pending';
      updatePackerKpis(packingData);
      return;
    }

    // Build the queue of items to be placed
    let colorIdx = 0;
    packingData.boxes.forEach(box => {
      box.items.forEach(it => {
        const color = BLOCK_COLORS[colorIdx % BLOCK_COLORS.length];
        colorIdx++;
        state.simulation.unpackedQueue.push({
          item: it,
          targetBoxId: box.boxId,
          color: color,
          dimText: generateDimensionLabel(it.weight)
        });
      });
    });

    // Render empty 3D wireframe boxes
    renderEmpty3DBins(packingData.boxes);

    if (preFill) {
      // Pre-fill the boxes immediately so the user sees the packed 3D cartons right away!
      while (state.simulation.unpackedQueue.length > 0) {
        stepSimulationForward(false);
      }
      addLog(`[3D Visualizer] Loaded ${packingData.boxes.length} cartons with ${state.simulation.placedItems.length} items. Ready to run simulation.`, 'white');
    } else {
      renderUnpackedQueue();
    }

    // Update KPI metrics
    updatePackerKpis(packingData);
  }

  function generateDimensionLabel(weight) {
    const w = Math.round(weight * 8);
    const h = Math.round(weight * 5);
    return `${w} x ${h}"`;
  }

  function renderEmpty3DBins(boxes) {
    el.binsWireframeStage.innerHTML = '';

    if (!boxes || boxes.length === 0) {
      el.binsWireframeStage.innerHTML = '<div class="empty-state-card" style="grid-column: span 3">No cartons dispatched yet. Add items to cart.</div>';
      return;
    }

    boxes.forEach(box => {
      const col = document.createElement('div');
      col.className = 'bin-col-container';
      col.id = `binCol_${box.boxId}`;

      col.innerHTML = `
        <div class="bin-header-label">
          <span>Bin ${box.boxId}</span>
          <span class="bin-pct-tag" id="binPctTag_${box.boxId}">0% Full</span>
        </div>
        <div class="wireframe-container-3d">
          <svg class="wireframe-box-svg" viewBox="0 0 160 250" preserveAspectRatio="none">
            <!-- Back Face (Recessed) -->
            <polygon points="18,16 142,16 142,224 18,224" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.12)" stroke-dasharray="3,3" />
            <!-- Perspective Corner Lines -->
            <line x1="0" y1="36" x2="18" y2="16" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />
            <line x1="160" y1="36" x2="142" y2="16" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />
            <line x1="0" y1="250" x2="18" y2="224" stroke="rgba(255,255,255,0.16)" stroke-width="1" stroke-dasharray="2,2" />
            <line x1="160" y1="250" x2="142" y2="224" stroke="rgba(255,255,255,0.16)" stroke-width="1" stroke-dasharray="2,2" />
            <!-- Top Opening Rim (Angled Perspective Trapezoid) -->
            <polygon points="0,36 18,16 142,16 160,36" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.32)" stroke-width="1.2" />
            <!-- Front Face Frame -->
            <polygon points="0,36 160,36 160,250 0,250" fill="transparent" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" />
          </svg>
          <div class="wireframe-3d-box" id="wireframeBox_${box.boxId}">
            <!-- Dropped blocks stack here from bottom -->
          </div>
        </div>
      `;

      el.binsWireframeStage.appendChild(col);
    });
  }

  function renderUnpackedQueue() {
    el.itemQueueContainer.innerHTML = '';
    const queue = state.simulation.unpackedQueue;
    el.unpackedItemsCount.textContent = `${queue.length} pending`;

    if (queue.length === 0) {
      el.itemQueueContainer.innerHTML = '<span class="text-muted" style="font-size: 0.72rem;">All items packed into shipping cartons.</span>';
      return;
    }

    queue.forEach(qItem => {
      const chip = document.createElement('div');
      chip.className = 'queue-chip';
      chip.style.backgroundColor = qItem.color.bg;
      chip.style.borderColor = qItem.color.border;
      chip.style.color = qItem.color.text;
      chip.innerHTML = `
        <span>${qItem.item.name.substring(0, 14)}</span>
        <span style="opacity: 0.85; font-size: 0.62rem">(${qItem.item.weight} GB)</span>
      `;
      el.itemQueueContainer.appendChild(chip);
    });
  }

  function stepSimulationForward(animate = true) {
    if (state.simulation.unpackedQueue.length === 0) {
      pauseSimulation();
      return false;
    }

    // Pop the next item
    const next = state.simulation.unpackedQueue.shift();
    state.simulation.placedItems.push(next);

    // Place into target 3D box
    const boxContainer = document.getElementById(`wireframeBox_${next.targetBoxId}`);
    if (boxContainer) {
      const block = document.createElement('div');
      block.className = 'packed-block';
      if (!animate) block.style.animation = 'none';
      block.style.backgroundColor = next.color.bg;
      block.style.borderColor = next.color.border;
      block.style.color = next.color.text;

      // Height proportional to weight
      const heightPx = Math.max(26, Math.min(65, Math.round(next.item.weight * 6)));
      block.style.height = `${heightPx}px`;

      block.innerHTML = `
        <span class="block-label">${next.item.name}</span>
        <span class="block-dim">${next.dimText} • ${next.item.weight} GB RAM</span>
      `;
      boxContainer.appendChild(block);

      // Update box header pct
      updateSingleBoxPercentage(next.targetBoxId);
    }

    // Refresh queue display
    renderUnpackedQueue();
    return true;
  }

  function updateSingleBoxPercentage(boxId) {
    const activePack = getActivePackingResult(state.packingResult);
    if (!activePack || !activePack.boxes) return;
    const boxDef = activePack.boxes.find(b => b.boxId === boxId);
    if (!boxDef) return;

    // Calculate current RAM footprint of placed items in this host node
    const placedInThisBox = state.simulation.placedItems.filter(p => p.targetBoxId === boxId);
    const currWt = placedInThisBox.reduce((sum, p) => sum + p.item.weight, 0);
    const pct = Math.min(100, Math.round((currWt / boxDef.maxCapacity) * 100));

    const tag = document.getElementById(`binPctTag_${boxId}`);
    if (tag) {
      tag.textContent = `${pct}% RAM (${currWt.toFixed(1)} GB)`;
      if (pct >= 85) tag.style.color = '#fff';
      else tag.style.color = 'var(--text-secondary)';
    }
  }

  function startSimulation() {
    const activePack = getActivePackingResult(state.packingResult);
    // If all items are already placed (like on initial load), reset to queue first!
    if (state.simulation.unpackedQueue.length === 0 && state.simulation.placedItems.length > 0) {
      if (activePack) {
        initPackingSimulation(activePack, false);
      }
    }

    state.simulation.isRunning = true;
    el.btnPlayVisualizer.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      Pause
    `;

    addLog('[Bin Packing Simulation] Visualizer running...', 'white');

    state.simulation.timer = setInterval(() => {
      const hasMore = stepSimulationForward(true);
      if (!hasMore) {
        pauseSimulation();
        addLog('[Bin Packing Simulation] All workloads scheduled onto host nodes!', 'white');
      }
    }, state.simulation.speedMs);
  }

  function pauseSimulation() {
    state.simulation.isRunning = false;
    if (state.simulation.timer) {
      clearInterval(state.simulation.timer);
      state.simulation.timer = null;
    }
    el.btnPlayVisualizer.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Run Visualizer
    `;
  }

  function resetSimulation() {
    pauseSimulation();
    const activePack = getActivePackingResult(state.packingResult);
    if (activePack) {
      initPackingSimulation(activePack, false);
      addLog('[Bin Packing Simulation] Reset cluster host nodes. All workloads queued.', 'muted');
    }
  }

  function updatePackerKpis(packingData) {
    const boxCount = packingData.boxes ? packingData.boxes.length : 0;
    const nodeCost = packingData.courierCost || 0;
    const avgUtil = packingData.averageUtilization || 0;

    el.packerBoxCountBadge.textContent = `${boxCount} Nodes Active`;
    el.packerCourierCostBadge.textContent = `Node Spend: $${nodeCost.toFixed(2)}`;

    // Header KPIs
    el.kpiCartBoxes.textContent = `${boxCount} Host Nodes`;
    el.kpiCourierCostSub.textContent = `Host Nodes: $${nodeCost.toFixed(2)}`;
    el.kpiSpaceUtil.textContent = `${avgUtil}% Efficiency`;
    el.kpiUtilProgress.style.width = `${avgUtil}%`;
    el.kpiBoxesProgress.style.width = `${Math.min(100, boxCount * 25)}%`;
  }

  // ==========================================
  // DYNAMIC CATEGORY DONUT CHART (SVG)
  // ==========================================

  function renderCategoryDonut(cartItems) {
    if (!el.donutSlicesGroup || !el.donutLegendContainer) return;
    el.donutSlicesGroup.innerHTML = '';
    el.donutLegendContainer.innerHTML = '';

    const items = cartItems || [];
    el.donutCenterCount.textContent = items.length;

    if (items.length === 0) {
      el.donutLegendContainer.innerHTML = '<span class="text-muted" style="font-size: 0.74rem;">Cart empty.</span>';
      return;
    }

    // Tally by category
    const catCounts = {};
    items.forEach(it => {
      const cat = it.category || 'General';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    const categories = Object.keys(catCounts);
    const total = items.length;
    const radius = 60;
    const circumference = 2 * Math.PI * radius; // ~376.99

    let accumulatedPct = 0;
    const sliceColors = ['#06b6d4', '#00f59b', '#8b5cf6', '#f59e0b', '#f43f5e', '#ec4899', '#3b82f6'];

    categories.forEach((cat, idx) => {
      const count = catCounts[cat];
      const pct = count / total;
      const strokeLength = pct * circumference;
      const strokeDashoffset = -(accumulatedPct * circumference);
      const color = sliceColors[idx % sliceColors.length];

      // SVG Slice Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '80');
      circle.setAttribute('cy', '80');
      circle.setAttribute('r', radius);
      circle.setAttribute('fill', 'transparent');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '24');
      circle.setAttribute('stroke-dasharray', `${strokeLength} ${circumference}`);
      circle.setAttribute('stroke-dashoffset', strokeDashoffset);
      el.donutSlicesGroup.appendChild(circle);

      accumulatedPct += pct;

      // Legend Item
      const legendChip = document.createElement('div');
      legendChip.className = 'legend-chip';
      legendChip.innerHTML = `
        <span class="legend-color-dot" style="background: ${color}"></span>
        <span>${cat} <strong style="color: var(--text-white)">(${Math.round(pct * 100)}%)</strong></span>
      `;
      el.donutLegendContainer.appendChild(legendChip);
    });
  }

  // ==========================================
  // RENDERERS (CATALOG, CART, KNAPSACK, AVL, STACK, HUFFMAN)
  // ==========================================

  function renderCatalog(items) {
    if (!el.catalogContainer) return;
    el.catalogContainer.innerHTML = '';

    if (!items || items.length === 0) {
      el.catalogContainer.innerHTML = '<div class="empty-state-card" style="grid-column: span 3; padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No products match your search or category filter.</div>';
      return;
    }

    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'catalog-item-card';
      const desc = it.description || 'High-availability containerized cloud microservice with automated autoscaling and health probing.';
      const ramVal = (typeof it.weight === 'number') ? it.weight.toFixed(1) : it.weight;
      const costVal = Math.round(it.price).toLocaleString();

      card.innerHTML = `
        <div class="item-card-header">
          <span class="item-card-id-badge">${it.id || 'POD'}</span>
          <span class="item-card-cat">${it.category || 'General'}</span>
        </div>
        <h4 class="item-card-title" title="${it.name}">${it.name}</h4>
        <p class="item-card-desc">${desc}</p>
        <div class="item-card-specs-row">
          <span class="spec-pill spec-ram" title="Container Memory Footprint">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="6" y1="18" x2="6" y2="18.01"/><line x1="10" y1="18" x2="10" y2="18.01"/><line x1="14" y1="18" x2="14" y2="18.01"/><line x1="18" y1="18" x2="18" y2="18.01"/></svg>
            <strong>${ramVal} GB RAM</strong>
          </span>
          <span class="spec-pill spec-sla" title="Service Level Agreement Score">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <strong>+${it.utility} pts SLA</strong>
          </span>
        </div>
        <div class="item-card-footer">
          <div class="item-card-price-box">
            <span class="price-val">$${costVal}</span>
            <span class="price-unit">/ mo</span>
          </div>
          <button class="btn-sm btn-stark-white btn-add-cart" data-id="${it.id}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Deploy Pod
          </button>
        </div>
      `;

      const btnAdd = card.querySelector('.btn-add-cart');
      btnAdd.addEventListener('click', async () => {
        try {
          btnAdd.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Deploying...
          `;
          btnAdd.disabled = true;
          await apiPost('/api/cart/add', { itemId: it.id });
          addLog(`[Cluster Action] Manually scheduled "${it.name}" ($${costVal}/mo, ${ramVal}GB RAM, +${it.utility}pts SLA)`, 'white');
          await fetchCart();
          await triggerBinPacking();
          btnAdd.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Scheduled ✓
          `;
          setTimeout(() => {
            btnAdd.innerHTML = `
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Deploy Pod
            `;
            btnAdd.disabled = false;
          }, 900);
        } catch (err) {
          console.error('Failed to add item to cart:', err);
          btnAdd.innerHTML = `
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Deploy Pod
          `;
          btnAdd.disabled = false;
        }
      });

      el.catalogContainer.appendChild(card);
    });
  }

  function renderCart(cart) {
    el.cartTableBody.innerHTML = '';
    const items = cart.items || [];

    if (items.length === 0) {
      el.cartEmptyState.style.display = 'block';
    } else {
      el.cartEmptyState.style.display = 'none';
      items.forEach((it, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${it.name}</strong> <span style="color: var(--text-muted); font-size: 0.68rem">(${it.category})</span></td>
          <td class="text-right">$${it.price.toLocaleString()}</td>
          <td class="text-right" style="color: #34d399; font-weight: 700;">+${it.utility} pts</td>
          <td class="text-right" style="color: var(--text-secondary); font-family: var(--font-mono);">${it.weight} GB RAM</td>
          <td class="text-center">
            <button class="btn-xs btn-outline-danger btn-del-cart" data-index="${idx}" title="Remove item">&times;</button>
          </td>
        `;

        tr.querySelector('.btn-del-cart').addEventListener('click', async () => {
          await apiPost('/api/cart/remove', { index: idx });
          addLog(`[Cart] Removed "${it.name}"`, 'amber');
          await fetchCart();
          await triggerBinPacking();
        });

        el.cartTableBody.appendChild(tr);
      });
    }

    // Top Header & Financial Cards
    const budgetLimit = parseFloat(el.budgetInput.value) || 10000;
    const spent = cart.totalCost || 0;
    const remaining = Math.max(0, budgetLimit - spent);
    const budgetPct = Math.min(100, Math.round((spent / budgetLimit) * 100));

    el.dispBudgetLimit.textContent = `$${budgetLimit.toLocaleString()}`;
    el.dispCartCost.textContent = `$${spent.toLocaleString()}`;
    el.dispCartUtility.textContent = `${cart.totalUtility || 0} pts`;
    el.dispRemainingBudget.textContent = `$${remaining.toLocaleString()}`;

    // Header Ribbon KPIs
    el.kpiCartCost.textContent = `$${spent.toLocaleString()} / $${budgetLimit.toLocaleString()}`;
    el.kpiBudgetProgress.style.width = `${budgetPct}%`;
    el.kpiWeightRatio.textContent = `${(cart.totalWeight || 0).toFixed(1)} GB Total RAM`;

    // Quick Undo/Redo Badges
    el.undoBadge.textContent = state.undoStack.length;
    el.redoBadge.textContent = state.redoStack.length;
    el.btnQuickUndo.disabled = state.undoStack.length === 0;
    el.btnQuickRedo.disabled = state.redoStack.length === 0;
    el.btnInspectUndo.disabled = state.undoStack.length === 0;
    el.btnInspectRedo.disabled = state.redoStack.length === 0;
  }

  function renderPackingComparison(comp) {
    el.ffdBoxCount.textContent = comp.ffd.boxCount;
    el.ffdUtil.textContent = `${comp.ffd.averageUtilization}%`;
    el.ffdCost.textContent = `$${comp.ffd.courierCost}`;

    el.bfdBoxCount.textContent = comp.bfd.boxCount;
    el.bfdUtil.textContent = `${comp.bfd.averageUtilization}%`;
    el.bfdCost.textContent = `$${comp.bfd.courierCost}`;

    el.wfdBoxCount.textContent = comp.worstFit.boxCount;
    el.wfdUtil.textContent = `${comp.worstFit.averageUtilization}%`;
    el.wfdCost.textContent = `$${comp.worstFit.courierCost}`;

    el.nfBoxCount.textContent = comp.nextFit.boxCount;
    el.nfUtil.textContent = `${comp.nextFit.averageUtilization}%`;
    el.nfCost.textContent = `$${comp.nextFit.courierCost}`;

    if (comp.savingsVersusNaive > 0) {
      el.packingSavingsText.textContent = `FFD Bin Packing saves $${comp.savingsVersusNaive.toFixed(2)} in host server provisioning costs compared to naive Next Fit scheduling (${comp.ffd.boxCount} nodes vs ${comp.nextFit.boxCount} nodes).`;
    } else {
      el.packingSavingsText.textContent = `FFD achieved optimal host node allocation (${comp.ffd.boxCount} nodes used at ${comp.ffd.averageUtilization}% average capacity).`;
    }

    // Keep active algorithm card highlighted
    syncPackingAlgorithm(state.simulation.selectedAlgo || 'FFD');

    // Detailed Boxes Grid in Tab 3 rendered for the ACTIVE algorithm
    const activePack = getActivePackingResult(comp);
    el.boxesDetailedGrid.innerHTML = '';
    if (activePack && activePack.boxes) {
      activePack.boxes.forEach(box => {
        const card = document.createElement('div');
        card.className = 'dash-card';
        let chips = '';
        box.items.forEach(it => {
          chips += `<span class="queue-chip" style="background: var(--bg-surface); border: 1px solid var(--border-light);">${it.name} (${it.weight} GB)</span>`;
        });
        card.innerHTML = `
          <div class="dash-card-header">
            <span class="dash-card-title">Host Node #${box.boxId}</span>
            <span class="badge-pill-cyan">${box.currentWeight} / ${box.maxCapacity} GB RAM</span>
          </div>
          <div class="kpi-progress-bar" style="height: 6px; margin: 0.5rem 0;">
            <div class="kpi-progress-fill fill-green" style="width: ${box.utilizationPercentage}%"></div>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.5rem;">${chips}</div>
        `;
        el.boxesDetailedGrid.appendChild(card);
      });
    }
  }

  function renderKnapsackResult(result) {
    el.ksDpUtility.textContent = `${result.totalUtility} pts`;
    el.ksDpCost.textContent = `Total Spend: $${result.totalCost.toLocaleString()} (Rem: $${result.remainingBudget})`;

    el.ksGreedyUtility.textContent = `${result.greedyUtility} pts`;
    el.ksGreedyCost.textContent = `Total Spend: $${result.greedyCost.toLocaleString()}`;

    const diff = result.totalUtility - result.greedyUtility;
    el.ksOptimalityGap.textContent = diff >= 0 ? `+${diff} pts` : `${diff} pts`;

    const runtimeMs = (result.computationTimeNanos / 1_000_000).toFixed(2);
    el.ksRuntime.textContent = `${runtimeMs} ms`;
    el.ksExplanationText.textContent = result.optimalityExplanation;

    // DP Matrix Rows
    el.dpMatrixBody.innerHTML = '';
    if (result.dpSampleRows) {
      result.dpSampleRows.forEach(row => {
        const tr = document.createElement('tr');
        let valsHtml = '';
        row.valuesAtKeyBudgets.forEach(val => {
          valsHtml += `<td>${val}</td>`;
        });
        tr.innerHTML = `
          <td>${row.itemName}</td>
          <td>$${row.cost}</td>
          <td style="color: var(--accent-neon-green)">${row.utility}</td>
          ${valsHtml}
        `;
        el.dpMatrixBody.appendChild(tr);
      });
    }

    // Optimal vs Greedy Lists
    el.ksDpItemsList.innerHTML = '';
    result.selectedItems.forEach(it => {
      const card = document.createElement('div');
      card.className = 'item-tag-card';
      card.innerHTML = `
        <strong>${it.name}</strong>
        <span>$${it.price.toLocaleString()} • <span style="color: var(--accent-neon-green)">+${it.utility} pts</span></span>
      `;
      el.ksDpItemsList.appendChild(card);
    });

    el.ksGreedyItemsList.innerHTML = '';
    result.greedyItems.forEach(it => {
      const card = document.createElement('div');
      card.className = 'item-tag-card';
      card.innerHTML = `
        <strong>${it.name}</strong>
        <span>$${it.price.toLocaleString()} • <span style="color: var(--accent-amber)">+${it.utility} pts</span></span>
      `;
      el.ksGreedyItemsList.appendChild(card);
    });
  }

  function renderStackVisualizer(undoStack, redoStack) {
    el.undoStackDepth.textContent = undoStack ? undoStack.length : 0;
    el.redoStackDepth.textContent = redoStack ? redoStack.length : 0;

    el.undoStackList.innerHTML = '';
    if (!undoStack || undoStack.length === 0) {
      el.undoStackList.innerHTML = '<div class="stack-empty-msg">Undo Stack is empty. Mutate cluster workloads to push actions.</div>';
    } else {
      for (let i = undoStack.length - 1; i >= 0; i--) {
        const act = undoStack[i];
        const card = document.createElement('div');
        card.className = 'stack-element-card';
        
        let typeStr = 'ACTION';
        if (typeof act.type === 'string') {
          typeStr = act.type.replace(/_/g, ' ');
        } else if (act.type && typeof act.type.name === 'string') {
          typeStr = act.type.name.replace(/_/g, ' ');
        }
        
        let detailText = act.description || 'Cluster Workload Mutation';
        let podName = detailText;
        if (detailText.includes(':')) {
          podName = detailText.split(':').slice(1).join(':').trim();
        }
        const podCount = act.nextItems ? `${act.nextItems.length} active pods` : '';

        card.innerHTML = `
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 0.45rem; margin-bottom: 2px;">
              <strong style="color: var(--accent-neon-green); font-size: 0.76rem; letter-spacing: 0.04em;">${typeStr}</strong>
              <span style="font-size: 0.65rem; color: var(--text-muted);">${podCount}</span>
            </div>
            <span style="color: #ffffff; font-weight: 600; font-size: 0.78rem; display: block; word-break: break-word;">${podName}</span>
          </div>
          <span class="badge-pill-green" style="flex-shrink: 0;">TOS #${i + 1}</span>
        `;
        el.undoStackList.appendChild(card);
      }
    }

    el.redoStackList.innerHTML = '';
    if (!redoStack || redoStack.length === 0) {
      el.redoStackList.innerHTML = '<div class="stack-empty-msg">Redo Stack is empty. Undo an action to push here.</div>';
    } else {
      for (let i = redoStack.length - 1; i >= 0; i--) {
        const act = redoStack[i];
        const card = document.createElement('div');
        card.className = 'stack-element-card';
        
        let typeStr = 'ACTION';
        if (typeof act.type === 'string') {
          typeStr = act.type.replace(/_/g, ' ');
        } else if (act.type && typeof act.type.name === 'string') {
          typeStr = act.type.name.replace(/_/g, ' ');
        }
        
        let detailText = act.description || 'Cluster Workload Mutation';
        let podName = detailText;
        if (detailText.includes(':')) {
          podName = detailText.split(':').slice(1).join(':').trim();
        }
        const podCount = act.nextItems ? `${act.nextItems.length} active pods` : '';

        card.innerHTML = `
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 0.45rem; margin-bottom: 2px;">
              <strong style="color: var(--accent-neon-blue); font-size: 0.76rem; letter-spacing: 0.04em;">${typeStr}</strong>
              <span style="font-size: 0.65rem; color: var(--text-muted);">${podCount}</span>
            </div>
            <span style="color: #ffffff; font-weight: 600; font-size: 0.78rem; display: block; word-break: break-word;">${podName}</span>
          </div>
          <span class="badge-pill-cyan" style="flex-shrink: 0;">TOS #${i + 1}</span>
        `;
        el.redoStackList.appendChild(card);
      }
    }
  }


  // SVG AVL Tree Visualizer

  async function fetchAndRenderAvlTree() {
    try {
      const res = await apiGet('/api/catalog/tree');
      if (res && res.tree) {
        if (el.avlTotalNodes) el.avlTotalNodes.textContent = res.nodeCount || 0;
        if (el.avlHeight) el.avlHeight.textContent = res.height || 0;
        renderAvlTreeSvg(res.tree);
        if (el.btnExecuteRangeSearch) {
          el.btnExecuteRangeSearch.click();
        }
      } else {
        renderAvlTreeSvg(null);
      }
    } catch (err) {
      console.error('AVL fetch error:', err);
    }
  }

  function renderAvlTreeSvg(rootNode) {
    if (!el.avlTreeGraph) return;
    el.avlTreeGraph.innerHTML = '';
    if (!rootNode) {
      el.avlTreeGraph.innerHTML = '<div class="empty-state-card" style="margin: auto;">AVL Tree is empty.</div>';
      return;
    }

    // 1. Gather all nodes with depth and branches using in-order traversal to guarantee zero horizontal collisions
    const inOrderNodes = [];
    function inOrder(node, depth, parentNode, branch) {
      if (!node) return;
      node._depth = depth;
      node._parent = parentNode;
      node._branch = branch;

      const children = node.children || [];
      const leftChild = children.find(c => c.branch === 'L');
      const rightChild = children.find(c => c.branch === 'R');

      if (leftChild) inOrder(leftChild, depth + 1, node, 'L');
      inOrderNodes.push(node);
      if (rightChild) inOrder(rightChild, depth + 1, node, 'R');
    }

    inOrder(rootNode, 0, null, null);

    const totalNodes = inOrderNodes.length;
    let maxDepth = 0;
    inOrderNodes.forEach(n => {
      if (n._depth > maxDepth) maxDepth = n._depth;
    });

    // Dynamic canvas dimensions: spacious and uncrowded
    const nodeSpacingX = Math.max(76, Math.min(100, Math.floor(1450 / Math.max(1, totalNodes))));
    const svgWidth = Math.max(1200, (totalNodes + 1) * nodeSpacingX);
    const levelHeight = 96;
    const svgHeight = Math.max(540, (maxDepth + 1) * levelHeight + 90);

    // Map each node to (x, y) coordinates
    inOrderNodes.forEach((node, rank) => {
      node._x = Math.round(nodeSpacingX + rank * ((svgWidth - (nodeSpacingX * 2)) / Math.max(1, totalNodes - 1)));
      node._y = Math.round(55 + node._depth * levelHeight);
    });

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.style.minWidth = `${Math.min(svgWidth, 1200)}px`;

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // 2. Draw smooth curved connector edges
    inOrderNodes.forEach(node => {
      if (node._parent) {
        const path = document.createElementNS(svgNS, 'path');
        const x1 = node._parent._x;
        const y1 = node._parent._y + 28;
        const x2 = node._x;
        const y2 = node._y - 28;
        const cy1 = y1 + Math.round((y2 - y1) * 0.5);
        const cy2 = y2 - Math.round((y2 - y1) * 0.5);
        
        path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', isLight ? '#cbd5e1' : '#262626');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);

        // Branch indicator badge (L or R) halfway along the curve
        const midX = Math.round((x1 + x2) / 2);
        const midY = Math.round((y1 + y2) / 2);
        const branchText = document.createElementNS(svgNS, 'text');
        branchText.setAttribute('x', midX);
        branchText.setAttribute('y', midY);
        branchText.setAttribute('text-anchor', 'middle');
        branchText.setAttribute('dominant-baseline', 'central');
        branchText.setAttribute('font-family', 'JetBrains Mono, monospace');
        branchText.setAttribute('font-size', '9px');
        branchText.setAttribute('font-weight', '700');
        branchText.setAttribute('fill', isLight ? '#94a3b8' : '#525252');
        branchText.textContent = node._branch || '';
        svg.appendChild(branchText);
      }
    });

    // 3. Draw Enlarged, Sleek AVL Nodes
    inOrderNodes.forEach((node, idx) => {
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'tree-node-group');
      g.setAttribute('id', `avl_node_${node.id || idx}`);
      g.style.cursor = 'pointer';

      const isRoot = (node === rootNode);

      // Rich Tooltip
      const title = document.createElementNS(svgNS, 'title');
      title.textContent = `[${node.id || 'POD'}] ${node.name || 'Workload'}\n` +
        `Monthly Cost: $${node.price}/mo\n` +
        `RAM Footprint: ${node.weight} GB RAM\n` +
        `SLA Utility: +${node.utility} pts\n` +
        `Tree Depth: Level ${node._depth}\n` +
        `Subtree Height: ${node.height}\n` +
        `Balance Factor: ${node.balance || 0}`;
      g.appendChild(title);

      // Node Circle (Enlarged: radius 30px)
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', node._x);
      circle.setAttribute('cy', node._y);
      circle.setAttribute('r', '30');
      circle.setAttribute('class', 'tree-node-circle');
      circle.setAttribute('data-price', node.price);

      if (isRoot) {
        circle.setAttribute('fill', isLight ? '#0f172a' : '#ffffff');
        circle.setAttribute('stroke', isLight ? '#0284c7' : '#38bdf8');
        circle.setAttribute('stroke-width', '2.5');
      } else {
        circle.setAttribute('fill', isLight ? '#ffffff' : '#141414');
        circle.setAttribute('stroke', isLight ? '#cbd5e1' : '#2b2b2b');
        circle.setAttribute('stroke-width', '2');
      }
      g.appendChild(circle);

      // Balance Factor mini badge top right of circle
      const bfVal = node.balance || 0;
      const bfBadge = document.createElementNS(svgNS, 'rect');
      bfBadge.setAttribute('x', node._x + 14);
      bfBadge.setAttribute('y', node._y - 28);
      bfBadge.setAttribute('width', '20');
      bfBadge.setAttribute('height', '13');
      bfBadge.setAttribute('rx', '3');
      bfBadge.setAttribute('fill', Math.abs(bfVal) > 1 ? '#ef4444' : (isLight ? '#f1f5f9' : '#1f1f1f'));
      bfBadge.setAttribute('stroke', isLight ? '#cbd5e1' : '#333333');
      bfBadge.setAttribute('stroke-width', '1');
      g.appendChild(bfBadge);

      const bfText = document.createElementNS(svgNS, 'text');
      bfText.setAttribute('x', node._x + 24);
      bfText.setAttribute('y', node._y - 21);
      bfText.setAttribute('text-anchor', 'middle');
      bfText.setAttribute('dominant-baseline', 'central');
      bfText.setAttribute('font-family', 'JetBrains Mono, monospace');
      bfText.setAttribute('font-size', '8px');
      bfText.setAttribute('font-weight', '700');
      bfText.setAttribute('fill', Math.abs(bfVal) > 1 ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'));
      bfText.textContent = (bfVal >= 0 ? '+' : '') + bfVal;
      g.appendChild(bfText);

      // Price Label (Enlarged, Bold JetBrains Mono)
      const textPrice = document.createElementNS(svgNS, 'text');
      textPrice.setAttribute('x', node._x);
      textPrice.setAttribute('y', node._y - 5);
      textPrice.setAttribute('text-anchor', 'middle');
      textPrice.setAttribute('dominant-baseline', 'central');
      textPrice.setAttribute('font-family', 'JetBrains Mono, monospace');
      textPrice.setAttribute('font-size', '12px');
      textPrice.setAttribute('font-weight', '800');
      textPrice.setAttribute('fill', isRoot ? (isLight ? '#ffffff' : '#000000') : (isLight ? '#0f172a' : '#ffffff'));
      textPrice.textContent = `$${Math.round(node.price)}`;
      g.appendChild(textPrice);

      // Microservice ID or Short Title
      const textName = document.createElementNS(svgNS, 'text');
      textName.setAttribute('x', node._x);
      textName.setAttribute('y', node._y + 11);
      textName.setAttribute('text-anchor', 'middle');
      textName.setAttribute('dominant-baseline', 'central');
      textName.setAttribute('font-family', 'JetBrains Mono, monospace');
      textName.setAttribute('font-size', '9px');
      textName.setAttribute('font-weight', '700');
      textName.setAttribute('fill', isRoot ? (isLight ? '#93c5fd' : '#475569') : (isLight ? '#0284c7' : '#38bdf8'));
      textName.textContent = node.id || 'POD';
      g.appendChild(textName);

      // Pod name below circle
      const labelText = document.createElementNS(svgNS, 'text');
      labelText.setAttribute('x', node._x);
      labelText.setAttribute('y', node._y + 44);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('font-size', '9.5px');
      labelText.setAttribute('font-weight', '500');
      labelText.setAttribute('fill', isLight ? '#475569' : '#94a3b8');
      const itemTitle = node.name || '';
      labelText.textContent = itemTitle.length > 15 ? itemTitle.substring(0, 13) + '…' : itemTitle;
      g.appendChild(labelText);

      // Click interaction
      g.addEventListener('click', () => {
        if (el.avlRangeMin && el.avlRangeMax) {
          el.avlRangeMin.value = Math.max(0, Math.round(node.price - 75));
          el.avlRangeMax.value = Math.round(node.price + 75);
          if (el.btnExecuteRangeSearch) el.btnExecuteRangeSearch.click();
        }
        addLog(`[AVL Node Inspected] "${node.name}" (${node.id}) — $${node.price}/mo, ${node.weight} GB RAM, SLA: +${node.utility} pts, Tree Depth: Level ${node._depth}, BF: ${node.balance || 0}`, 'white');
      });

      svg.appendChild(g);
    });

    el.avlTreeGraph.appendChild(svg);
  }

  function highlightAvlTreeRange(minP, maxP) {
    if (!el.avlTreeGraph) return;
    const groups = el.avlTreeGraph.querySelectorAll('.tree-node-group');
    const isLightH = document.documentElement.getAttribute('data-theme') === 'light';
    groups.forEach(g => {
      const circle = g.querySelector('.tree-node-circle');
      if (!circle) return;

      const price = parseFloat(circle.getAttribute('data-price'));
      if (price >= minP && price <= maxP) {
        circle.setAttribute('stroke', isLightH ? '#0284c7' : '#38bdf8');
        circle.setAttribute('stroke-width', '3');
        circle.style.filter = isLightH ? 'drop-shadow(0 2px 6px rgba(2, 132, 199, 0.3))' : 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.5))';
      } else {
        circle.setAttribute('stroke', isLightH ? '#cbd5e1' : '#2b2b2b');
        circle.setAttribute('stroke-width', '2');
        circle.style.filter = 'none';
      }
    });
  }

  // Huffman Compression & Checkout Result

  function renderCheckoutResult(data) {
    if (!data) return;
    const invoice = data.invoice || {};
    const comp = data.compression || data.result || data;

    const rawText = invoice.rawInvoiceText || comp.originalText || '';
    const bitString = comp.encodedBitString || comp.encodedBitstream || '';
    const decodedText = comp.decodedText || comp.decompressedInvoiceText || rawText;
    const bitLen = comp.compressedSizeBits !== undefined ? comp.compressedSizeBits : (comp.encodedTotalBits !== undefined ? comp.encodedTotalBits : bitString.length);
    const origBits = comp.originalSizeBits !== undefined ? comp.originalSizeBits : (comp.originalTotalBits !== undefined ? comp.originalTotalBits : (rawText.length * 8));
    const origBytes = comp.originalSizeBytes !== undefined ? comp.originalSizeBytes : (comp.originalTotalBytes !== undefined ? comp.originalTotalBytes : rawText.length);
    const compBytes = comp.compressedSizeBytes !== undefined ? comp.compressedSizeBytes : (comp.encodedPayloadBytes !== undefined ? comp.encodedPayloadBytes : Math.ceil(bitLen / 8));
    const ratio = comp.compressionRatio !== undefined ? comp.compressionRatio : 0;
    const bpc = comp.bitsPerCharacter !== undefined ? comp.bitsPerCharacter : (comp.averageBitsPerChar !== undefined ? comp.averageBitsPerChar : 0);
    const isLossless = comp.lossless !== undefined ? comp.lossless : (comp.isLossless !== undefined ? comp.isLossless : (comp.losslessVerified !== undefined ? comp.losslessVerified : true));
    const codes = comp.codeTable || comp.prefixCodes || [];

    if (el.rawInvoiceDisplay) el.rawInvoiceDisplay.textContent = rawText;
    if (el.encodedBitstreamDisplay) el.encodedBitstreamDisplay.textContent = bitString;
    if (el.decompressedTextDisplay) el.decompressedTextDisplay.textContent = decodedText;
    if (el.bitLengthBadge) el.bitLengthBadge.textContent = `${bitLen} bits`;

    renderHuffmanMetrics({
      originalTotalBits: origBits,
      originalTotalBytes: origBytes,
      encodedTotalBits: bitLen,
      encodedPayloadBytes: compBytes,
      compressionRatio: ratio,
      averageBitsPerChar: bpc,
      losslessVerified: isLossless
    });

    renderHuffmanCodesTable(codes);
    addLog(`[Huffman Coding] Lossless compressed invoice: ${ratio.toFixed(1)}% space savings (${bitLen} bits vs ${origBits} bits ASCII)`, 'green');
  }

  function renderHuffmanMetrics(res) {
    if (el.compOriginalBits) el.compOriginalBits.textContent = `${(res.originalTotalBits || 0).toLocaleString()} bits`;
    if (el.compOriginalBytes) el.compOriginalBytes.textContent = `(${(res.originalTotalBytes || 0)} bytes ASCII)`;

    if (el.compEncodedBits) el.compEncodedBits.textContent = `${(res.encodedTotalBits || 0).toLocaleString()} bits`;
    if (el.compEncodedBytes) el.compEncodedBytes.textContent = `(${(res.encodedPayloadBytes || 0)} bytes payload)`;

    if (el.compRatio) el.compRatio.textContent = `${(res.compressionRatio || 0).toFixed(1)}%`;
    if (el.compBitsPerChar) el.compBitsPerChar.textContent = `${(res.averageBitsPerChar || 0).toFixed(2)} bits/char`;

    if (el.compLosslessBadge) el.compLosslessBadge.textContent = res.losslessVerified ? 'Verified 100%' : 'Mismatch';
  }

  function renderHuffmanCodesTable(codes) {
    if (!el.huffmanCodeTableBody) return;
    el.huffmanCodeTableBody.innerHTML = '';
    if (!codes || codes.length === 0) {
      el.huffmanCodeTableBody.innerHTML = '<tr><td colspan="5" style="color: var(--text-muted); text-align: center; padding: 1.5rem;">No prefix codes available.</td></tr>';
      return;
    }

    codes.forEach(c => {
      const tr = document.createElement('tr');
      const dispChar = c.characterDisplay || (c.character === '\n' ? '\\n (Newline)' : (c.character === ' ' ? '␣ (Space)' : c.character || c.rawChar));
      const freq = c.frequency || 0;
      const code = c.huffmanCode || '';
      const bitLen = c.codeLength || c.bitLength || code.length;
      const savings = Math.max(0, Math.round((1 - bitLen / 8) * 100));

      tr.innerHTML = `
        <td><strong style="color: var(--text-white)">${dispChar}</strong></td>
        <td>${freq}</td>
        <td><code style="color: var(--accent-cyan); font-weight: 700;">${code}</code></td>
        <td>${bitLen} bits</td>
        <td style="color: var(--accent-neon-green)">8b &rarr; ${bitLen}b (${savings}% save)</td>
      `;
      el.huffmanCodeTableBody.appendChild(tr);
    });
  }


  // Print & Word Document Export Handlers

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function printInvoiceDocument(text, title = 'Digital Order Invoice') {
    if (!text || text.trim() === '' || text.includes('Loading invoice...')) {
      alert('Invoice is still loading. Please click "Generate & Compress Invoice" and try again.');
      return;
    }

    const customer = (el.checkoutCustomerName && el.checkoutCustomerName.value) || 'Valued Customer';
    const org = (el.checkoutOrgName && el.checkoutOrgName.value) || 'Event Logistics';
    const dateStr = new Date().toLocaleString();

    const printableHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 24px;
            font-size: 11pt;
            line-height: 1.45;
          }
          .header-bar {
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .org-title {
            font-size: 16pt;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .sub-title {
            font-size: 9.5pt;
            color: #444;
            margin: 0;
          }
          .badge-pill {
            display: inline-block;
            background: #000;
            color: #fff;
            font-size: 8.5pt;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 4px;
            letter-spacing: 0.5px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            background: #f7f7f7;
            border: 1px solid #ddd;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 18px;
            font-size: 9.5pt;
          }
          .meta-item {
            margin-bottom: 4px;
          }
          .meta-item strong {
            color: #111;
            display: inline-block;
            width: 120px;
          }
          .section-title {
            font-size: 11pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 18px 0 8px 0;
            border-left: 3px solid #000;
            padding-left: 8px;
          }
          .raw-bill-box {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 9.5pt;
            white-space: pre-wrap;
            background: #fff;
            border: 1px solid #111;
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 20px;
            line-height: 1.35;
          }
          .signature-row {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            padding: 0 30px;
          }
          .sig-line {
            border-top: 1px solid #000;
            width: 200px;
            text-align: center;
            padding-top: 6px;
            font-size: 9pt;
            font-weight: 600;
          }
          .footer-bar {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            color: #666;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <h1 class="org-title">SMART PROCUREMENT &amp; WAREHOUSE DISPATCH</h1>
            <p class="sub-title">Algorithmic Laboratory Capstone • Lossless Decompressed Digital Invoice</p>
          </div>
          <div style="text-align: right;">
            <span class="badge-pill">LOSSLESS VERIFIED 100%</span>
            <div style="font-size: 8pt; color: #555; margin-top: 4px;">Huffman Coding Decompressed</div>
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-item"><strong>Client / Buyer:</strong> ${escapeHtml(customer)}</div>
            <div class="meta-item"><strong>Organization:</strong> ${escapeHtml(org)}</div>
          </div>
          <div>
            <div class="meta-item"><strong>Date &amp; Time:</strong> ${escapeHtml(dateStr)}</div>
            <div class="meta-item"><strong>Algorithmic Solvers:</strong> 0/1 Knapsack • FFD Bin Pack</div>
          </div>
        </div>

        <div class="section-title">Official Lossless Order Bill</div>
        <div class="raw-bill-box">${escapeHtml(text)}</div>

        <div class="signature-row">
          <div class="sig-line">Warehouse Logistics Officer</div>
          <div class="sig-line">Client Authorization</div>
        </div>

        <div class="footer-bar">
          <span>Generated by Smart Procurement &amp; Packer • Localhost Service</span>
          <span>Print / PDF Document Layout</span>
        </div>
      </body>
      </html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(printableHtml);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
      setTimeout(() => {
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      }, 2000);
    }, 400);

    addLog(`[Print] Opened native Print / Save as PDF dialog for: ${title}`, 'white');
  }

  function exportInvoiceAsWord(text, title = 'Digital_Order_Invoice') {
    if (!text || text.trim() === '' || text.includes('Loading invoice...')) {
      alert('Invoice is still loading. Please click "Generate & Compress Invoice" and try again.');
      return;
    }

    const customer = (el.checkoutCustomerName && el.checkoutCustomerName.value) || 'Valued Customer';
    const org = (el.checkoutOrgName && el.checkoutOrgName.value) || 'Event Logistics';
    const dateStr = new Date().toLocaleString();

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${escapeHtml(title)}</title>
        <!--[if gte mso 9]>
        <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #111; margin: 30pt; }
          h1 { font-size: 18pt; color: #000; border-bottom: 2pt solid #000; padding-bottom: 5pt; margin-bottom: 6pt; }
          .subtitle { font-size: 10pt; color: #555; margin-bottom: 15pt; }
          .meta-box { background: #f7f7f7; border: 1pt solid #ccc; padding: 10pt; margin-bottom: 15pt; }
          pre { font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; background: #fafafa; border: 1pt solid #ccc; padding: 12pt; white-space: pre-wrap; line-height: 1.35; }
          .sig-table { width: 100%; margin-top: 35pt; border: none; }
          .sig-table td { border: none; padding-top: 30pt; font-size: 10pt; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>SMART PROCUREMENT &amp; WAREHOUSE DISPATCH</h1>
        <div class="subtitle">Official Order Manifest &amp; Lossless Decompressed Bill (Huffman Coding Module 4)</div>
        
        <div class="meta-box">
          <p style="margin: 3pt 0;"><strong>Customer / Buyer:</strong> ${escapeHtml(customer)}</p>
          <p style="margin: 3pt 0;"><strong>Organization / Event:</strong> ${escapeHtml(org)}</p>
          <p style="margin: 3pt 0;"><strong>Export Date:</strong> ${escapeHtml(dateStr)}</p>
          <p style="margin: 3pt 0;"><strong>Algorithmic Verification:</strong> 0/1 Knapsack Optimal &bull; FFD Host Node Packing &bull; Huffman Coding 100% Lossless Recovery</p>
        </div>

        <h3 style="margin-top: 15pt; margin-bottom: 6pt;">DECOMPRESSED INVOICE MANIFEST:</h3>
        <pre>${escapeHtml(text)}</pre>

        <table class="sig-table">
          <tr>
            <td style="border-top: 1pt solid #000; width: 42%; text-align: center;">Warehouse Logistics Signature</td>
            <td style="width: 16%;"></td>
            <td style="border-top: 1pt solid #000; width: 42%; text-align: center;">Client Authorization Signature</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_${Date.now()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog(`[Word Export] Downloaded lossless bill as Word Document: ${a.download}`, 'green');
  }

  // ==========================================
  // LAUNCH APP
  // ==========================================
  init();
});
