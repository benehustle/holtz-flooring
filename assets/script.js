/* Holtz Flooring — site behaviour */

function setFooterYear() {
  const fy = document.getElementById("footer-year");
  if (fy) fy.textContent = String(new Date().getFullYear());
}

/* ——— loadIncludes ——— */
async function loadIncludes() {
  const headerPh = document.getElementById("header-placeholder");
  const footerPh = document.getElementById("footer-placeholder");
  if (!headerPh || !footerPh) return;

  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch("includes/header.html"),
      fetch("includes/footer.html"),
    ]);
    if (headerRes.ok) {
      headerPh.innerHTML = await headerRes.text();
    }
    if (footerRes.ok) {
      footerPh.innerHTML = await footerRes.text();
    }
  } catch (e) {
    console.error("Could not load header/footer includes.", e);
  }

  setFooterYear();

  initNav();
  setActiveNavLink();
}

/* ——— initNav ——— */
function initNav() {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".drawer");
  const overlay = document.querySelector(".drawer-overlay");

  if (toggle && drawer && overlay) {
    const openDrawer = () => {
      toggle.setAttribute("aria-expanded", "true");
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const closeDrawer = () => {
      toggle.setAttribute("aria-expanded", "false");
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    toggle.addEventListener("click", () => {
      if (drawer.classList.contains("is-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    overlay.addEventListener("click", closeDrawer);

    drawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });

    // Mobile accordion
    const accordionToggle = drawer.querySelector(".drawer__accordion-toggle");
    const accordionBody = drawer.querySelector(".drawer__accordion-body");
    if (accordionToggle && accordionBody) {
      accordionToggle.addEventListener("click", () => {
        const isOpen = accordionBody.classList.contains("is-open");
        accordionBody.classList.toggle("is-open", !isOpen);
        accordionToggle.setAttribute("aria-expanded", String(!isOpen));
      });
    }
  }

  // Desktop dropdown
  const dropdownToggle = document.querySelector(".nav__dropdown-toggle");
  const dropdownMenu = document.querySelector(".nav__dropdown-menu");
  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.contains("is-open");
      dropdownMenu.classList.toggle("is-open", !isOpen);
      dropdownToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    document.addEventListener("click", () => {
      dropdownMenu.classList.remove("is-open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    });

    dropdownMenu.addEventListener("click", (e) => e.stopPropagation());
  }

  if (!header) return;

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        header.classList.toggle("header--scrolled", window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ——— setActiveNavLink ——— */
function setActiveNavLink() {
  const path = window.location.pathname;
  let file = path.split("/").pop();
  if (!file || file === "") file = "index.html";

  const normalized = file.toLowerCase();

  document.querySelectorAll(".nav__link, .drawer__link").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("tel:") || href.startsWith("mailto:")) return;
    const linkFile = href.split("/").pop().toLowerCase();
    link.classList.toggle("is-active", linkFile === normalized);
  });
}

/* ——— initSmoothScroll ——— */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const id = anchor.getAttribute("href");
    if (!id || id === "#") return;

    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector(".header")?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ——— initScrollAnimations ——— */
function initScrollAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

  document.querySelectorAll(".animate-stagger").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      observer.observe(child);
    });
  });
}

/* ——— initCounters ——— */
function animateCounter(el) {
  const raw = el.dataset.target;
  const target = parseFloat(String(raw).trim());
  const suffix = el.dataset.suffix || "";
  const decimals = parseInt(el.dataset.decimals, 10) || 0;

  if (raw === undefined || raw === "" || Number.isNaN(target)) {
    el.textContent = (raw !== undefined && raw !== "" ? String(raw) : "0") + suffix;
    return;
  }

  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = target * eased;
    const num =
      decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toString();
    el.textContent = num + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const section = document.querySelector(".stats-section");
  if (!section) return;

  const numbers = section.querySelectorAll(".stat-number");
  if (!numbers.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    numbers.forEach((el) => {
      el.textContent = (el.dataset.target || "0") + (el.dataset.suffix || "");
    });
    return;
  }

  let started = false;
  const run = () => {
    if (started) return;
    started = true;
    numbers.forEach((el) => animateCounter(el));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run();
      });
    },
    { threshold: [0, 0.05, 0.1, 0.2], rootMargin: "60px 0px 80px 0px" }
  );

  observer.observe(section);
}

/* ——— initCallBar ——— */
function initCallBar() {
  const bar = document.querySelector(".call-bar");
  if (!bar) return;

  /* Call bar CSS is display:none !important until phone number is live */
  const cs = window.getComputedStyle(bar);
  if (cs.display === "none") return;

  const storageKey = "holtzCallBarDismissed";
  if (sessionStorage.getItem(storageKey) === "1") {
    return;
  }

  window.setTimeout(() => {
    bar.classList.add("is-visible");
    document.body.classList.add("has-call-bar");
  }, 2000);

  const dismiss = bar.querySelector(".call-bar__dismiss");
  dismiss?.addEventListener("click", () => {
    bar.classList.remove("is-visible");
    document.body.classList.remove("has-call-bar");
    sessionStorage.setItem(storageKey, "1");
  });
}

/* ——— initContactForm ——— */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const successEl = document.getElementById("contactFormSuccess");
  const errorEl = document.getElementById("contactFormError");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("is-visible");
    }
    if (successEl) {
      successEl.classList.remove("is-visible");
      successEl.innerHTML = "";
    }

    let valid = true;
    const fields = [
      { id: "contactName", group: "groupName" },
      { id: "contactCompany", group: "groupCompany" },
      { id: "contactEmail", group: "groupEmail", type: "email" },
      { id: "contactPhone", group: "groupPhone" },
      { id: "contactLocation", group: "groupLocation" },
      { id: "contactFlooring", group: "groupFlooring", isSelect: true },
      { id: "contactDescription", group: "groupDescription" },
    ];

    fields.forEach(({ id, group, type, isSelect }) => {
      const input = document.getElementById(id);
      const wrap = document.getElementById(group);
      if (!input || !wrap) return;

      wrap.classList.remove("is-invalid");
      let ok = true;
      const v = (input.value || "").trim();

      if (!v) ok = false;
      if (type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        ok = false;
        const err = wrap.querySelector(".form-error");
        if (err) err.textContent = "Enter a valid email address.";
      }
      if (isSelect && (!input.value || input.value === "")) ok = false;

      if (!ok) {
        valid = false;
        wrap.classList.add("is-invalid");
      }
    });

    const role = document.getElementById("contactRole");
    const roleGroup = document.getElementById("groupRole");
    if (role && roleGroup) {
      roleGroup.classList.remove("is-invalid");
      if (!role.value) {
        valid = false;
        roleGroup.classList.add("is-invalid");
      }
    }

    if (!valid) return;

    const formData = new FormData(form);
    if (submitBtn) submitBtn.disabled = true;

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submit failed");
        form.style.display = "none";
        if (successEl) {
          successEl.textContent =
            "Thank you, we will be in touch within one business day. For urgent project enquiries, include your phone number in the form or contact us again via this page.";
          successEl.classList.add("is-visible");
        }
      })
      .catch(() => {
        if (errorEl) {
          errorEl.textContent =
            "Something went wrong sending your enquiry. Please try again in a moment, or call us on 03 7503 1533.";
          errorEl.classList.add("is-visible");
        }
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

/* ——— initFaq ——— */
function initFaq() {
  /* Smooth open/close handled in CSS via max-height on .faq__answer */
}

/* ——— DOMContentLoaded ——— */
document.addEventListener("DOMContentLoaded", () => {
  setFooterYear();

  loadIncludes().then(() => {
    initSmoothScroll();
    setFooterYear();
  });

  initScrollAnimations();
  /* Double rAF so layout/intersection rects are stable before observing */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initCounters();
    });
  });
  initCallBar();
  initContactForm();
  initFaq();
});
