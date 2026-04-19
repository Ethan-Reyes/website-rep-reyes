"use strict";

/* ============================================================
   web-reyes.js — Ethan Reyes Portfolio
   Fixes: ghost boot lines, global namespace pollution,
          retry logic, XSS sanitization, contact obfuscation
   ============================================================ */

// ── Boot Sequence ─────────────────────────────────────────────

const BOOT_LINES = [
  {
    text: "BIOS v2.26.0 · T.A.L.I.O.N.I.S Tech Systems",
    type: "output",
    delay: 0,
  },
  { text: "Initializing hardware...", type: "output", delay: 300 },
  { text: "CPU: Cloud Computing Core · 4.0GHz", type: "output", delay: 600 },
  { text: "RAM: 16GB · AWS Certified", type: "output", delay: 850 },
  { text: "Storage: GitHub Repository mounted", type: "output", delay: 1100 },
  { text: "──────────────────────────────────", type: "output", delay: 1350 },
  { text: "$ whoami", type: "prompt", delay: 1700 },
  {
    text: "ethan_reyes · data_engineer · software_dev",
    type: "success",
    delay: 2050,
  },
  { text: "$ ls ./certifications", type: "prompt", delay: 2500 },
  {
    text: "aws_cloud_practitioner.cert  pcep_python.cert  tdd_jest.cert",
    type: "output",
    delay: 2850,
  },
  { text: "$ cat ./mission.txt", type: "prompt", delay: 3300 },
  {
    text: "Bridging heavy-industry data with cloud-native applications.",
    type: "output",
    delay: 3650,
  },
  { text: "$ ./launch_portfolio.sh", type: "prompt", delay: 4200 },
  { text: "Loading portfolio...", type: "output", delay: 4550 },
  { text: "✓ Portfolio ready. Welcome.", type: "highlight", delay: 5000 },
];

const BOOT_DURATION = 5600;

/**
 * Tracks all active setTimeout IDs so they can be
 * cancelled immediately when skip is pressed —
 * prevents ghost lines rendering after launch.
 */
const _bootTimers = [];

function runBootSequence() {
  const bootScreen = document.getElementById("boot-screen");
  const bootLines = document.getElementById("boot-lines");
  const skipBtn = document.getElementById("skip-boot");
  const mainSite = document.getElementById("main-site");

  if (!bootScreen || !mainSite) return;

  BOOT_LINES.forEach(({ text, type, delay }) => {
    const id = setTimeout(() => {
      const span = document.createElement("span");
      span.classList.add("line", type);
      span.textContent = text;
      bootLines.appendChild(span);
      bootLines.scrollTop = bootLines.scrollHeight;
    }, delay);
    _bootTimers.push(id);
  });

  const launchId = setTimeout(
    () => launchSite(bootScreen, mainSite),
    BOOT_DURATION,
  );
  _bootTimers.push(launchId);

  skipBtn.addEventListener("click", () => {
    _bootTimers.forEach((id) => clearTimeout(id));
    _bootTimers.length = 0;
    launchSite(bootScreen, mainSite);
  });
}

/**
 * Fades out boot screen and reveals main site.
 * Guards against null arguments for testability.
 */
function launchSite(bootScreen, mainSite) {
  if (!bootScreen || !mainSite) return;
  bootScreen.classList.add("fade-out");
  mainSite.classList.remove("hidden");
  setTimeout(() => {
    bootScreen.style.display = "none";
  }, 650);
}

// ── Interview Card Toggle ─────────────────────────────────────

/**
 * Core toggle logic — exported for test suite.
 * @param {string} id - interview identifier e.g. 'billscott'
 */
function toggleInterview(id) {
  const card = document.getElementById(`card-${id}`);
  const toggle = document.getElementById(`toggle-${id}`);

  if (!card || !toggle) return;

  const isExpanded = card.classList.contains("expanded");

  document.querySelectorAll(".interview-card.expanded").forEach((c) => {
    c.classList.remove("expanded");
    const t = c.querySelector(".interview-card-toggle span:first-child");
    if (t) t.textContent = "Read more";
  });

  if (!isExpanded) {
    card.classList.add("expanded");
    const label = toggle.querySelector("span:first-child");
    if (label) label.textContent = "Close";

    setTimeout(() => {
      // Guard against JSDOM not supporting scrollIntoView
      if (typeof card.scrollIntoView === "function") {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }
}

/**
 * Attaches delegated click AND keyboard listeners
 * to the interview cards container — fixes accessibility.
 */
function initInterviewCards() {
  const container = document.querySelector(".interview-cards");
  if (!container) return;

  document.querySelectorAll(".interview-card-header").forEach((header) => {
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.removeAttribute("onclick");
  });

  container.addEventListener("click", (e) => {
    const header = e.target.closest(".interview-card-header");
    if (!header) return;
    const card = header.closest(".interview-card");
    if (!card || card.classList.contains("interview-card--soon")) return;
    const id = card.id.replace("card-", "");
    toggleInterview(id);
  });

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const header = e.target.closest(".interview-card-header");
    if (!header) return;
    e.preventDefault();
    const card = header.closest(".interview-card");
    if (!card || card.classList.contains("interview-card--soon")) return;
    const id = card.id.replace("card-", "");
    toggleInterview(id);
  });
}

// ── Serverless Functions with Retry ──────────────────────────

/**
 * Fetch with exponential backoff retry.
 * @param {string} url
 * @param {object} options - fetch options
 * @param {number} retries - max retry attempts
 * @param {number|null} delayMs - override delay for testing (pass 0 to skip wait)
 */
async function fetchWithRetry(url, options = {}, retries = 3, delayMs = null) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      const wait = delayMs !== null ? delayMs : 500 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

/**
 * Tracks the current visit and updates the visitor count display.
 * Shows a failed state if all retries are exhausted.
 */
async function trackVisitor() {
  const el = document.getElementById("visitor-count");
  try {
    const data = await fetchWithRetry("/.netlify/functions/visitor-counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (data.success && el) {
      el.textContent = data.count.toLocaleString();
    }
  } catch (error) {
    console.warn("Visitor counter unavailable after retries:", error.message);
    if (el) {
      el.textContent = "—";
      el.title = "Stats temporarily unavailable";
    }
  }
}

/**
 * Tracks resume download clicks with retry and failed UI state.
 */
function initResumeTracker() {
  const resumeLink = document.getElementById("resume-download-link");
  if (!resumeLink) return;

  resumeLink.addEventListener("click", async () => {
    const el = document.getElementById("resume-count");
    try {
      const data = await fetchWithRetry("/.netlify/functions/resume-tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (data.success && el) {
        el.textContent = data.count.toLocaleString();
      }
    } catch (error) {
      console.warn("Resume tracker unavailable after retries:", error.message);
      if (el) {
        el.textContent = "—";
        el.title = "Stats temporarily unavailable";
      }
    }
  });
}

// ── XSS Sanitization ─────────────────────────────────────────

/**
 * Sanitizes input using DOMParser to safely strip HTML.
 * Strips script tags and content first before parsing.
 * @param {string} input
 * @returns {string} sanitized plain text
 */
function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  const stripped = input.replace(/<script[\s\S]*?<\/script>/gi, "");
  const doc = new DOMParser().parseFromString(stripped, "text/html");
  return (doc.body.textContent || "").trim();
}

// ── Contact Info Obfuscation ──────────────────────────────────

/**
 * Decodes Base64-obfuscated contact strings at runtime.
 * Prevents plain-text scraping of email and phone from HTML.
 */
function initContactObfuscation() {
  document.querySelectorAll("[data-contact]").forEach((el) => {
    try {
      const decoded = atob(el.dataset.contact);
      const type = el.dataset.type;
      if (type === "email") {
        el.href = `mailto:${decoded}`;
        el.querySelector(".contact-link-value").textContent = `${decoded} →`;
      } else if (type === "tel") {
        el.href = `tel:${decoded}`;
      }
    } catch (e) {
      console.warn("Contact decode failed:", e.message);
    }
  });
}

// ── Active Nav Highlight on Scroll ───────────────────────────

/**
 * Uses IntersectionObserver with viewport-relative margins
 * calculated at runtime to handle non-standard viewport heights.
 */
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");

  if (!sections.length || !navLinks.length) return;

  const vh = window.innerHeight;
  const topMargin = `-${Math.round(vh * 0.4)}px`;
  const bottomMargin = `-${Math.round(vh * 0.55)}px`;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            link.style.color =
              link.getAttribute("href") === `#${id}` ? "var(--amber)" : "";
          });
        }
      });
    },
    { rootMargin: `${topMargin} 0px ${bottomMargin} 0px` },
  );

  sections.forEach((s) => observer.observe(s));
}

// ── Nav Compact on Scroll ─────────────────────────────────────

function initNavCompact() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  window.addEventListener(
    "scroll",
    () => {
      nav.style.padding = window.scrollY > 60 ? "12px 40px" : "20px 40px";
    },
    { passive: true },
  );
}

// ── Exports for test suite ────────────────────────────────────
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    toggleInterview,
    sanitizeInput,
    launchSite,
    fetchWithRetry,
  };
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  runBootSequence();
  initInterviewCards();
  initNavHighlight();
  initNavCompact();
  initResumeTracker();
  initContactObfuscation();
  trackVisitor();
});
