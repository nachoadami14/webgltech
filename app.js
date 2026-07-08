'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initTabs();
  initProductFilters();
  initTimeline();
  initScrollReveal();
  initCounters();
  initContactForm();
  initFooterYear();
});

/* ==========================================================================
   Header: fondo sólido al hacer scroll
   ========================================================================== */
function initHeader() {
  const header = document.getElementById('glHeader');
  if (!header) return;

  const toggleScrolled = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };

  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });
}

/* ==========================================================================
   Menú móvil (hamburguesa)
   ========================================================================== */
function initMobileMenu() {
  const toggler = document.getElementById('navToggler');
  const menu = document.getElementById('glNavMenu');
  if (!toggler || !menu) return;

  const closeMenu = () => {
    toggler.classList.remove('open');
    menu.classList.remove('open');
    toggler.setAttribute('aria-expanded', 'false');
  };

  toggler.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggler.classList.toggle('open', isOpen);
    toggler.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar menú al navegar (enlaces internos)
  menu.querySelectorAll('a.nav-link, .gl-dropdown a, .gl-btn-cta').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Dropdown "Soluciones" tocable en mobile
  const dropdownParent = menu.querySelector('.dropdown-hover');
  if (dropdownParent) {
    const dropdownTrigger = dropdownParent.querySelector('.nav-link');
    dropdownTrigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 991) {
        e.preventDefault();
        dropdownParent.classList.toggle('open');
      }
    });
  }

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ==========================================================================
   Tabs de Soluciones (Comunicaciones / Ingeniería)
   ========================================================================== */
function initTabs() {
  const tabs = document.querySelectorAll('.gl-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      const targetPanel = document.getElementById(targetId);
      if (!targetPanel) return;

      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.gl-tab-panel').forEach((panel) => {
        panel.classList.remove('active');
        panel.hidden = true;
      });
      targetPanel.classList.add('active');
      targetPanel.hidden = false;
    });
  });
}

/* ==========================================================================
   Filtro interactivo de productos
   ========================================================================== */
function initProductFilters() {
  const buttons = document.querySelectorAll('.gl-filter-btn');
  const items = document.querySelectorAll('.gl-product-item');
  const emptyState = document.getElementById('emptyState');
  if (!buttons.length || !items.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      items.forEach((item) => {
        const matches = filter === 'all' || item.dataset.category === filter;
        if (matches) {
          item.classList.remove('hide');
          item.classList.remove('entering');
          void item.offsetWidth; // reflow para reiniciar animación
          item.classList.add('entering');
          visibleCount++;
        } else {
          item.classList.add('hide');
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('d-none', visibleCount !== 0);
      }
    });
  });
}

/* ==========================================================================
   Línea de tiempo interactiva
   ========================================================================== */
function initTimeline() {
  const timeline = document.getElementById('timeline');
  const progress = document.getElementById('timelineProgress');
  const items = document.querySelectorAll('.gl-timeline-item');
  if (!timeline || !items.length) return;

  // Expandir/colapsar contenido al hacer clic en el punto
  items.forEach((item) => {
    const dot = item.querySelector('.gl-timeline-dot');
    if (!dot) return;
    dot.addEventListener('click', () => {
      const expanded = dot.getAttribute('aria-expanded') === 'true';
      dot.setAttribute('aria-expanded', String(!expanded));
      item.classList.toggle('expanded', !expanded);
    });
  });

  // Resaltar ítems visibles y animar barra de progreso
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    },
    { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' }
  );
  items.forEach((item) => observer.observe(item));

  const updateProgress = () => {
    const rect = timeline.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    const scrolled = Math.min(Math.max(viewportH * 0.6 - rect.top, 0), total);
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (progress) progress.style.height = `${pct}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

/* ==========================================================================
   Animaciones de aparición al hacer scroll (fade-in)
   ========================================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .fade-in-up');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    observer.observe(el);
  });
}

/* ==========================================================================
   Contadores animados (estadísticas del hero)
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.gl-stat-num');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('es-AR');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('es-AR');
      }
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   Validación en tiempo real del formulario de contacto
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');
  const fields = Array.from(form.querySelectorAll('.gl-input'));

  const validateField = (field) => {
    const isValid = field.checkValidity();
    field.classList.toggle('is-invalid', !isValid);
    field.classList.toggle('is-valid', isValid && field.value.trim() !== '');
    return isValid;
  };

  fields.forEach((field) => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let allValid = true;

    fields.forEach((field) => {
      const valid = validateField(field);
      if (!valid) allValid = false;
    });

    if (!allValid) {
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      if (successMsg) successMsg.classList.remove('show');
      return;
    }

    // Simulación de envío exitoso (sin backend conectado)
    if (successMsg) {
      successMsg.classList.add('show');
    }
    form.reset();
    fields.forEach((field) => {
      field.classList.remove('is-valid', 'is-invalid');
    });

    setTimeout(() => {
      if (successMsg) successMsg.classList.remove('show');
    }, 5000);
  });
}

/* ==========================================================================
   Año dinámico en el footer
   ========================================================================== */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
