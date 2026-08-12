/**
 * VS Code Portfolio — Main Application Script
 * Handles tabs, sidebar, project filtering, theme toggle, and search
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────
  const state = {
    activeTab: 'home',
    openTabs: ['home'],
    theme: localStorage.getItem('portfolio-theme') || 'dark',
    sidebarCollapsed: false,
  };

  const tabLabels = {
    home: 'index.html',
    about: '02_ABOUT_ME.html',
    projects: '03_PROJECTS.html',
    skills: '04_SKILLS.html',
    experience: '05_EXPERIENCE.html',
    education: '06_EDUCATION.html',
    certifications: '07_CERTIFICATIONS.html',
    contact: '08_CONTACT.html',
    data: 'portfolio-data.json',
    readme: 'README.md',
  };

  const tabIcons = {
    home: 'html',
    about: 'html',
    projects: 'html',
    skills: 'html',
    experience: 'html',
    education: 'html',
    certifications: 'html',
    contact: 'html',
    data: 'json',
    readme: 'md',
  };

  // ── DOM References ─────────────────────────────────────
  const app = document.getElementById('app');
  const tabBar = document.getElementById('tabBar');
  const editorContent = document.getElementById('editorContent');
  const breadcrumbFile = document.getElementById('breadcrumbFile');
  const themeToggle = document.getElementById('themeToggle');
  const sidebarCollapse = document.getElementById('sidebarCollapse');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const statusTime = document.getElementById('statusTime');
  const jsonDisplay = document.getElementById('jsonDisplay');
  const projectsGridAll = document.getElementById('projectsGridAll');
  const skillsFullGrid = document.getElementById('skillsFullGrid');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobilePanelBtn = document.getElementById('mobilePanelBtn');
  const mobilePanel = document.getElementById('mobilePanel');
  const mobilePanelOverlay = document.getElementById('mobilePanelOverlay');
  const mobilePanelClose = document.getElementById('mobilePanelClose');
  const mobilePanelContent = document.getElementById('mobilePanelContent');
  const mobileTitle = document.getElementById('mobileTitle');
  const rightSidebar = document.getElementById('rightSidebar');
  const projectModal = document.getElementById('projectModal');
  const projectModalOverlay = document.getElementById('projectModalOverlay');
  const projectModalClose = document.getElementById('projectModalClose');
  const imageLightbox = document.getElementById('imageLightbox');
  const imageLightboxImg = document.getElementById('imageLightboxImg');
  const imageLightboxClose = document.getElementById('imageLightboxClose');
  const imageLightboxPrev = document.getElementById('imageLightboxPrev');
  const imageLightboxNext = document.getElementById('imageLightboxNext');
  const imageLightboxCounter = document.getElementById('imageLightboxCounter');

  let projectsData = [];
  let lightboxOpen = false;

  const MOBILE_BREAKPOINT = 768;

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  // ── Init ───────────────────────────────────────────────
  function init() {
    applyTheme(state.theme);
    initFolderHeights();
    buildSkillsFullGrid();
    buildMobilePanel();
    loadPortfolioData();
    bindEvents();
    updateStatusTime();
    setInterval(updateStatusTime, 30000);
  }

  function initFolderHeights() {
    document.querySelectorAll('.tree-files').forEach((el) => {
      if (el.closest('.tree-folder.open, .tree-section')?.querySelector('.tree-folder.open')) {
        el.style.maxHeight = el.scrollHeight + 'px';
      }
    });
  }

  // ── Theme Toggle ───────────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // ── Tab Management ─────────────────────────────────────
  function openTab(tabId) {
    if (!tabLabels[tabId]) return;

    if (!state.openTabs.includes(tabId)) {
      state.openTabs.push(tabId);
      renderTabs();
    }

    activateTab(tabId);
  }

  function activateTab(tabId) {
    state.activeTab = tabId;

    // Update tab bar
    tabBar.querySelectorAll('.tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    // Update panels
    editorContent.querySelectorAll('.tab-panel').forEach((p) => {
      p.classList.toggle('active', p.dataset.tab === tabId);
    });

    // Update sidebar file highlights
    document.querySelectorAll('.tree-file[data-tab]').forEach((f) => {
      f.classList.toggle('active', f.dataset.tab === tabId);
    });

    // Update breadcrumb & mobile title
    breadcrumbFile.textContent = tabLabels[tabId] || tabId;
    if (mobileTitle) {
      mobileTitle.textContent = tabLabels[tabId] || tabId;
    }

    // Scroll editor to top
    editorContent.scrollTop = 0;

    if (isMobile()) {
      closeMobileSidebar();
    }
  }

  function closeTab(tabId) {
    if (state.openTabs.length <= 1) return;

    const idx = state.openTabs.indexOf(tabId);
    if (idx === -1) return;

    state.openTabs.splice(idx, 1);

    if (state.activeTab === tabId) {
      const newActive = state.openTabs[Math.max(0, idx - 1)];
      activateTab(newActive);
    }

    renderTabs();
  }

  function renderTabs() {
    tabBar.innerHTML = '';

    state.openTabs.forEach((tabId) => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (tabId === state.activeTab ? ' active' : '');
      tab.dataset.tab = tabId;

      const iconClass = tabIcons[tabId] || 'html';
      tab.innerHTML = `
        <span class="tab-icon ${iconClass}">${getTabIconChar(iconClass)}</span>
        <span class="tab-label">${tabLabels[tabId]}</span>
        <button class="tab-close" aria-label="Close tab">&times;</button>
      `;

      tab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('tab-close')) {
          activateTab(tabId);
        }
      });

      tab.querySelector('.tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tabId);
      });

      tabBar.appendChild(tab);
    });
  }

  function getTabIconChar(type) {
    const icons = { html: '<>', json: '{ }', md: '#' };
    return icons[type] || '<>';
  }

  // ── Sidebar Folders ────────────────────────────────────
  function toggleFolder(btn) {
    btn.classList.toggle('open');
    const content = btn.nextElementSibling;
    if (content && content.classList.contains('tree-files')) {
      if (btn.classList.contains('open')) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0';
      }
    }
  }

  function toggleSidebar() {
    if (isMobile()) {
      toggleMobileSidebar();
      return;
    }

    state.sidebarCollapsed = !state.sidebarCollapsed;
    app.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  }

  function toggleMobileSidebar() {
    const isOpen = app.classList.toggle('sidebar-open');
    sidebarOverlay?.classList.toggle('visible', isOpen);
    sidebarOverlay?.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('drawer-open', isOpen);
    if (isOpen) closeMobilePanel();
  }

  function openMobileSidebar() {
    if (!isMobile()) return;
    app.classList.add('sidebar-open');
    sidebarOverlay?.classList.add('visible');
    sidebarOverlay?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    closeMobilePanel();
  }

  function closeMobileSidebar() {
    app.classList.remove('sidebar-open');
    sidebarOverlay?.classList.remove('visible');
    sidebarOverlay?.setAttribute('aria-hidden', 'true');
    if (!mobilePanel?.classList.contains('open')) {
      document.body.classList.remove('drawer-open');
    }
  }

  function toggleMobilePanel() {
    if (mobilePanel?.classList.contains('open')) {
      closeMobilePanel();
    } else {
      openMobilePanel();
    }
  }

  function openMobilePanel() {
    closeMobileSidebar();
    mobilePanel?.classList.add('open');
    mobilePanel?.setAttribute('aria-hidden', 'false');
    mobilePanelOverlay?.classList.add('visible');
    mobilePanelOverlay?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  }

  function closeMobilePanel() {
    mobilePanel?.classList.remove('open');
    mobilePanel?.setAttribute('aria-hidden', 'true');
    mobilePanelOverlay?.classList.remove('visible');
    mobilePanelOverlay?.setAttribute('aria-hidden', 'true');
    if (!app.classList.contains('sidebar-open')) {
      document.body.classList.remove('drawer-open');
    }
  }

  function closeAllDrawers() {
    closeMobileSidebar();
    closeMobilePanel();
  }

  function buildMobilePanel() {
    if (!mobilePanelContent || !rightSidebar) return;
    mobilePanelContent.innerHTML = rightSidebar.innerHTML;
  }

  function handleResize() {
    if (!isMobile()) {
      closeAllDrawers();
      app.classList.remove('sidebar-open');
      document.body.classList.remove('drawer-open');
    }
    handleHomeResize();
  }

  // ── Project Filtering ──────────────────────────────────
  function filterProjects(filter, container) {
    const grid = container || document.getElementById('projectsGridAll');
    if (!grid) return;

    grid.querySelectorAll('.project-card').forEach((card) => {
      const tags = card.dataset.tags || '';
      if (filter === 'all' || tags.includes(filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function handleFilterClick(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const bar = btn.closest('.filter-bar');
    bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    if (bar.id === 'projectFilter') {
      renderHomeProjectsCarousel(filter);
      return;
    }

    const grid = bar.nextElementSibling;
    filterProjects(filter, grid);
  }

  // ── Project Rendering ──────────────────────────────────
  function getProjectImages(project) {
    if (project.images && project.images.length) return project.images;
    if (project.image) return [project.image];
    return [
      'assets/projects/' + project.id + '-1.png',
      'assets/projects/' + project.id + '-2.png',
      'assets/projects/' + project.id + '-3.png',
    ];
  }

  function createProjectCard(project) {
    const article = document.createElement('article');
    article.className = 'project-card';
    article.dataset.tags = (project.filters || [project.category || 'mobile']).join(' ');
    article.dataset.projectId = project.id;

    const thumb = getProjectImages(project)[0];
    const tagsHtml = (project.tags || [])
      .map((tag) => '<span class="tag ' + getTagClass(tag) + '">' + tag + '</span>')
      .join('');

    article.innerHTML =
      '<div class="project-thumb">' +
        '<img src="' + thumb + '" alt="' + project.name + '" onerror="this.parentElement.classList.add(\'placeholder-thumb\')">' +
      '</div>' +
      '<div class="project-body">' +
        '<h3>' + project.name + '</h3>' +
        '<p>' + project.description + '</p>' +
        '<div class="tech-tags">' + tagsHtml + '</div>' +
        '<button type="button" class="project-link">View Project &rarr;</button>' +
      '</div>';

    return article;
  }

  function renderProjects() {
    renderHomeProjectsCarousel(homeProjectsFilter);
    renderAllProjectsGrid();
  }

  function getFilteredProjects(filter) {
    if (filter === 'all') return projectsData;
    return projectsData.filter((project) => {
      const tags = ((project.filters || []).join(' ') + ' ' + (project.category || '')).toLowerCase();
      return tags.includes(filter);
    });
  }

  function getHomeCarouselPerPage() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1200) return 2;
    return 3;
  }

  const homeCarouselState = { index: 0, pages: 1, filter: 'all' };
  let homeProjectsFilter = 'all';

  function renderHomeProjectsCarousel(filter) {
    const track = document.getElementById('projectsCarouselTrack');
    if (!track) return;

    if (filter !== undefined) {
      homeProjectsFilter = filter;
      homeCarouselState.filter = filter;
      homeCarouselState.index = 0;
    }

    const projects = getFilteredProjects(homeProjectsFilter);
    const perPage = getHomeCarouselPerPage();

    track.innerHTML = '';
    if (projects.length === 0) {
      track.innerHTML = '<p class="projects-carousel-empty">No projects match this filter.</p>';
      homeCarouselState.pages = 0;
      updateHomeCarouselUI();
      return;
    }

    for (let i = 0; i < projects.length; i += perPage) {
      const slide = document.createElement('div');
      slide.className = 'projects-carousel-slide';
      projects.slice(i, i + perPage).forEach((project) => {
        slide.appendChild(createProjectCard(project));
      });
      track.appendChild(slide);
    }

    homeCarouselState.pages = Math.ceil(projects.length / perPage);
    if (homeCarouselState.index >= homeCarouselState.pages) {
      homeCarouselState.index = 0;
    }
    updateHomeCarouselPosition();
    updateHomeCarouselUI();
  }

  function renderAllProjectsGrid() {
    const grid = document.getElementById('projectsGridAll');
    if (!grid) return;
    grid.innerHTML = '';
    projectsData.forEach((project) => {
      grid.appendChild(createProjectCard(project));
    });
  }

  function updateHomeCarouselPosition() {
    const track = document.getElementById('projectsCarouselTrack');
    if (!track) return;
    track.style.transform = 'translateX(-' + homeCarouselState.index * 100 + '%)';
  }

  function updateHomeCarouselUI() {
    const prevBtn = document.getElementById('homeProjectsPrev');
    const nextBtn = document.getElementById('homeProjectsNext');
    const status = document.getElementById('homeProjectsStatus');
    const perPage = getHomeCarouselPerPage();
    const projects = getFilteredProjects(homeProjectsFilter);
    const total = projects.length;

    if (prevBtn) prevBtn.disabled = homeCarouselState.pages <= 1;
    if (nextBtn) nextBtn.disabled = homeCarouselState.pages <= 1;

    if (status) {
      if (total === 0) {
        status.textContent = '0 projects';
      } else {
        const start = homeCarouselState.index * perPage + 1;
        const end = Math.min(start + perPage - 1, total);
        status.textContent = 'Showing ' + start + '–' + end + ' of ' + total + ' projects';
      }
    }
  }

  function homeCarouselPrev() {
    if (homeCarouselState.pages <= 1) return;
    homeCarouselState.index = homeCarouselState.index <= 0
      ? homeCarouselState.pages - 1
      : homeCarouselState.index - 1;
    updateHomeCarouselPosition();
    updateHomeCarouselUI();
  }

  function homeCarouselNext() {
    if (homeCarouselState.pages <= 1) return;
    homeCarouselState.index = homeCarouselState.index >= homeCarouselState.pages - 1
      ? 0
      : homeCarouselState.index + 1;
    updateHomeCarouselPosition();
    updateHomeCarouselUI();
  }

  function handleHomeResize() {
    if (projectsData.length) {
      renderHomeProjectsCarousel(homeProjectsFilter);
    }
  }

  // ── Project Modal & Carousel ───────────────────────────
  const carouselState = { index: 0, images: [], projectName: '' };

  function getTagClass(tag) {
    const map = {
      'react.js': 'react',
      'node.js': 'node',
      'android': 'android',
      'kotlin': 'kotlin',
      'sqlite': 'sqlite',
      'postgresql': 'postgres',
      'python': 'python',
      'tensorflow': 'tensorflow',
      'firebase': 'firebase',
      'google maps': 'google-maps',
    };
    return map[tag.toLowerCase()] || tag.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-');
  }

  function renderCarousel() {
    const track = document.getElementById('carouselTrack');
    const dots = document.getElementById('carouselDots');
    const counter = document.getElementById('carouselCounter');
    const preview = document.getElementById('projectModalPreview');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!track || !preview) return;

    const images = carouselState.images;
    preview.classList.toggle('no-image', images.length === 0);

    track.innerHTML = '';
    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = carouselState.projectName + ' screenshot ' + (i + 1);
      img.onerror = () => {
        slide.classList.add('placeholder');
        slide.dataset.label = 'Screenshot ' + (i + 1);
        img.remove();
      };
      img.addEventListener('click', () => {
        carouselState.index = i;
        goToSlide(i);
        openImageLightbox();
      });
      slide.appendChild(img);
      track.appendChild(slide);
    });

    if (dots) {
      dots.innerHTML = '';
      images.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (i === carouselState.index ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
        dot.addEventListener('click', () => goToSlide(i));
        dots.appendChild(dot);
      });
    }

    goToSlide(carouselState.index, false);
    updateCarouselControls(prevBtn, nextBtn, counter, images.length);
  }

  function goToSlide(index, animate) {
    const track = document.getElementById('carouselTrack');
    const dots = document.getElementById('carouselDots');
    const total = carouselState.images.length;
    if (!track || total === 0) return;

    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    carouselState.index = index;

    if (animate === false) {
      track.style.transition = 'none';
    }
    track.style.transform = 'translateX(-' + index * 100 + '%)';
    if (animate === false) {
      track.offsetHeight;
      track.style.transition = '';
    }

    dots?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    const counter = document.getElementById('carouselCounter');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    updateCarouselControls(prevBtn, nextBtn, counter, total);
    if (lightboxOpen) updateLightboxImage();
  }

  function getCurrentCarouselImageSrc() {
    return carouselState.images[carouselState.index] || '';
  }

  function isCurrentSlidePlaceholder() {
    const track = document.getElementById('carouselTrack');
    const slide = track?.children[carouselState.index];
    return slide?.classList.contains('placeholder');
  }

  function openImageLightbox() {
    if (!imageLightbox || isCurrentSlidePlaceholder()) return;
    lightboxOpen = true;
    imageLightbox.classList.add('open');
    imageLightbox.setAttribute('aria-hidden', 'false');
    updateLightboxImage();
  }

  function closeImageLightbox() {
    lightboxOpen = false;
    imageLightbox?.classList.remove('open');
    imageLightbox?.setAttribute('aria-hidden', 'true');
    imageLightbox?.classList.remove('placeholder-stage');
  }

  function updateLightboxImage() {
    if (!imageLightboxImg || !imageLightbox) return;
    const src = getCurrentCarouselImageSrc();
    const total = carouselState.images.length;

    if (isCurrentSlidePlaceholder() || !src) {
      imageLightbox.classList.add('placeholder-stage');
      imageLightboxImg.removeAttribute('src');
    } else {
      imageLightbox.classList.remove('placeholder-stage');
      imageLightboxImg.src = src;
      imageLightboxImg.alt = carouselState.projectName + ' screenshot ' + (carouselState.index + 1);
    }

    if (imageLightboxCounter) {
      imageLightboxCounter.textContent = total
        ? carouselState.index + 1 + ' / ' + total
        : '';
    }

    if (imageLightboxPrev) imageLightboxPrev.disabled = total <= 1;
    if (imageLightboxNext) imageLightboxNext.disabled = total <= 1;
  }

  function lightboxGoPrev() {
    goToSlide(carouselState.index - 1);
  }

  function lightboxGoNext() {
    goToSlide(carouselState.index + 1);
  }

  function updateCarouselControls(prevBtn, nextBtn, counter, total) {
    if (counter) counter.textContent = total ? carouselState.index + 1 + ' / ' + total : '';
    if (prevBtn) prevBtn.disabled = total <= 1;
    if (nextBtn) nextBtn.disabled = total <= 1;
  }

  function initCarousel(project) {
    carouselState.images = getProjectImages(project);
    carouselState.index = 0;
    carouselState.projectName = project.name;
    renderCarousel();
  }

  function openProjectModal(projectId) {
    const project = projectsData.find((p) => p.id === projectId);
    if (!project || !projectModal) return;

    const tabName = document.getElementById('projectModalTabName');
    const title = document.getElementById('projectModalTitle');
    const year = document.getElementById('projectModalYear');
    const description = document.getElementById('projectModalDescription');
    const features = document.getElementById('projectModalFeatures');
    const tags = document.getElementById('projectModalTags');
    const github = document.getElementById('projectModalGithub');
    const demo = document.getElementById('projectModalDemo');

    if (tabName) tabName.textContent = project.id + '.html';
    if (title) title.textContent = project.name;
    if (year) year.textContent = '// ' + (project.year || '');
    if (description) {
      description.textContent = project.longDescription || project.description;
    }

    if (features) {
      features.innerHTML = '';
      (project.features || []).forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        features.appendChild(li);
      });
    }

    if (tags) {
      tags.innerHTML = '';
      (project.tags || []).forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'tag ' + getTagClass(tag);
        span.textContent = tag;
        tags.appendChild(span);
      });
    }

    initCarousel(project);

    if (github) {
      github.href = project.github || '#';
      github.classList.toggle('hidden', !project.github || project.github === '#');
    }
    if (demo) {
      demo.href = project.demo || '#';
      demo.classList.toggle('hidden', !project.demo || project.demo === '#');
    }

    projectModal.classList.add('open');
    projectModalOverlay?.classList.add('visible');
    projectModalOverlay?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  }

  function closeProjectModal() {
    closeImageLightbox();
    projectModal?.classList.remove('open');
    projectModalOverlay?.classList.remove('visible');
    projectModalOverlay?.setAttribute('aria-hidden', 'true');
    if (!app.classList.contains('sidebar-open') && !mobilePanel?.classList.contains('open')) {
      document.body.classList.remove('drawer-open');
    }
  }

  function handleProjectLinkClick(e) {
    const link = e.target.closest('.project-link');
    if (!link) return;

    e.preventDefault();
    const card = link.closest('.project-card');
    const projectId = card?.dataset.projectId;
    if (projectId) openProjectModal(projectId);
  }

  // ── Skills Full Grid ───────────────────────────────────
  function buildSkillsFullGrid() {
    if (!skillsFullGrid) return;

    const sections = document.querySelectorAll('.right-sidebar .skills-section');
    sections.forEach((section) => {
      const clone = document.createElement('div');
      clone.className = 'skills-full-section';
      clone.innerHTML = section.innerHTML;
      skillsFullGrid.appendChild(clone);
    });
  }

  // ── Portfolio Data ─────────────────────────────────────
  async function loadPortfolioData() {
    try {
      const res = await fetch('portfolio-data.json');
      const data = await res.json();
      projectsData = data.projects || [];
      renderProjects();
      if (jsonDisplay) {
        jsonDisplay.textContent = JSON.stringify(data, null, 2);
      }
    } catch {
      if (jsonDisplay) {
        jsonDisplay.textContent = '// portfolio-data.json could not be loaded';
      }
    }
  }

  // ── Search ─────────────────────────────────────────────
  function buildSearchIndex() {
    const items = [];
    document.querySelectorAll('.tree-file[data-tab]').forEach((f) => {
      items.push({ type: 'Page', label: f.textContent.trim(), tab: f.dataset.tab });
    });
    projectsData.forEach((p) => {
      items.push({ type: 'Project', label: p.name, tab: 'projects' });
    });
    document.querySelectorAll('.skill-item').forEach((s) => {
      items.push({ type: 'Skill', label: s.textContent.trim(), tab: 'skills' });
    });
    return items;
  }

  function handleSearch(query) {
    if (!searchResults) return;
    searchResults.innerHTML = '';

    if (!query.trim()) return;

    const q = query.toLowerCase();
    const searchIndex = buildSearchIndex();
    const matches = searchIndex.filter((item) =>
      item.label.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = '<p style="padding:8px;color:var(--text-muted);font-size:12px;">No results found</p>';
      return;
    }

    matches.slice(0, 10).forEach((item) => {
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.innerHTML = `<div>${item.label}</div><div class="result-type">${item.type}</div>`;
      el.addEventListener('click', () => {
        openTab(item.tab);
        switchSidebarPanel('explorer');
        searchInput.value = '';
        searchResults.innerHTML = '';
        closeMobileSidebar();
      });
      searchResults.appendChild(el);
    });
  }

  // ── Activity Bar Panels ────────────────────────────────
  function switchSidebarPanel(panel) {
    document.querySelectorAll('.activity-btn[data-panel]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.panel === panel);
    });
    document.querySelectorAll('.sidebar-panel').forEach((p) => {
      p.classList.toggle('active', p.dataset.panel === panel);
    });
  }

  // ── Scroll / Navigate ──────────────────────────────────
  function scrollToSection(sectionId) {
    openTab('home');
    setTimeout(() => {
      const el = document.getElementById('section-' + sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (sectionId === 'about') {
        openTab('about');
      } else if (sectionId === 'contact') {
        openTab('contact');
      } else if (sectionId === 'education') {
        openTab('education');
      } else if (sectionId === 'certifications') {
        openTab('certifications');
      }
    }, 100);
  }

  // ── Status Bar Clock ───────────────────────────────────
  function updateStatusTime() {
    if (!statusTime) return;
    const now = new Date();
    statusTime.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // ── Event Bindings ─────────────────────────────────────
  function bindEvents() {
    // Theme toggle
    themeToggle?.addEventListener('click', toggleTheme);

    // Sidebar collapse (desktop)
    sidebarCollapse?.addEventListener('click', toggleSidebar);

    // Mobile toolbar
    mobileMenuBtn?.addEventListener('click', () => {
      switchSidebarPanel('explorer');
      toggleMobileSidebar();
    });

    mobilePanelBtn?.addEventListener('click', toggleMobilePanel);
    mobilePanelClose?.addEventListener('click', closeMobilePanel);
    mobilePanelOverlay?.addEventListener('click', closeMobilePanel);
    sidebarOverlay?.addEventListener('click', closeMobileSidebar);

    // Activity bar
    document.querySelectorAll('.activity-btn[data-panel]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isMobile() && btn.dataset.panel !== 'extensions') {
          switchSidebarPanel(btn.dataset.panel);
          if (btn.dataset.panel === 'explorer' || btn.dataset.panel === 'search') {
            openMobileSidebar();
          }
        } else if (!isMobile()) {
          switchSidebarPanel(btn.dataset.panel);
        }
      });
    });

    // Tree files → open tabs
    document.querySelectorAll('.tree-file[data-tab]').forEach((file) => {
      file.addEventListener('click', () => openTab(file.dataset.tab));
    });

    // Folder toggles
    document.querySelectorAll('.tree-folder').forEach((folder) => {
      folder.addEventListener('click', () => toggleFolder(folder));
    });

    // Outline links
    document.querySelectorAll('.outline-link').forEach((link) => {
      link.addEventListener('click', () => {
        scrollToSection(link.dataset.scroll);
        closeMobileSidebar();
      });
    });

    // Hero CTA
    document.querySelectorAll('[data-scroll]').forEach((el) => {
      if (el.classList.contains('btn') || el.classList.contains('outline-link')) {
        el.addEventListener('click', () => scrollToSection(el.dataset.scroll));
      }
    });

    // Project filters
    document.querySelectorAll('.filter-bar').forEach((bar) => {
      bar.addEventListener('click', handleFilterClick);
    });

    // Project modal — event delegation for home + projects tab
    document.addEventListener('click', handleProjectLinkClick);
    projectModalClose?.addEventListener('click', closeProjectModal);
    projectModalOverlay?.addEventListener('click', closeProjectModal);

    document.getElementById('carouselPrev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(carouselState.index - 1);
    });
    document.getElementById('carouselNext')?.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(carouselState.index + 1);
    });
    document.getElementById('carouselExpand')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openImageLightbox();
    });

    document.querySelector('.project-modal-preview .carousel-viewport')?.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') openImageLightbox();
    });

    imageLightboxClose?.addEventListener('click', closeImageLightbox);
    imageLightbox?.addEventListener('click', (e) => {
      if (e.target === imageLightbox) closeImageLightbox();
    });
    imageLightboxPrev?.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxGoPrev();
    });
    imageLightboxNext?.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxGoNext();
    });

    document.getElementById('homeProjectsPrev')?.addEventListener('click', homeCarouselPrev);
    document.getElementById('homeProjectsNext')?.addEventListener('click', homeCarouselNext);
    document.getElementById('viewAllProjectsBtn')?.addEventListener('click', () => openTab('projects'));

    const homeCarouselViewport = document.querySelector('.projects-carousel-viewport');
    let homeTouchStartX = 0;
    homeCarouselViewport?.addEventListener('touchstart', (e) => {
      homeTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    homeCarouselViewport?.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - homeTouchStartX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) homeCarouselNext();
        else homeCarouselPrev();
      }
    }, { passive: true });

    const carouselViewport = document.querySelector('.project-modal-preview .carousel-viewport');
    let carouselTouchStartX = 0;
    carouselViewport?.addEventListener('touchstart', (e) => {
      carouselTouchStartX = e.touches[0].clientX;
    }, { passive: true });
    carouselViewport?.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - carouselTouchStartX;
      if (Math.abs(delta) > 50) {
        goToSlide(carouselState.index + (delta < 0 ? 1 : -1));
      }
    }, { passive: true });

    // Search
    searchInput?.addEventListener('input', (e) => handleSearch(e.target.value));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          closeImageLightbox();
          return;
        }
        closeAllDrawers();
        closeProjectModal();
      }
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        switchSidebarPanel('search');
        if (isMobile()) openMobileSidebar();
        searchInput?.focus();
      }
    });

    // Resize
    window.addEventListener('resize', handleResize);

    // Swipe down to close mobile panel
    let touchStartY = 0;
    mobilePanel?.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    mobilePanel?.addEventListener('touchend', (e) => {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (deltaY > 60) closeMobilePanel();
    }, { passive: true });
  }

  // ── Boot ───────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
