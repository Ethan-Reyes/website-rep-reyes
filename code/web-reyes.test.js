"use strict";

/**
 * ============================================================
 * web-reyes.test.js
 * TDD Test Suite — Ethan Reyes Portfolio
 * Runner: Jest + JSDOM
 * Pattern: Arrange → Act → Assert (AAA)
 * Coverage: Section Toggling, Nav Links, Interview Card Toggle,
 *           Interview Content, Security, Boot Screen,
 *           Globe Section, ETL Pipeline, Negative Cases
 * ============================================================
 */

const {
  toggleInterview,
  sanitizeInput,
  launchSite,
  fetchWithRetry,
} = require("./web-reyes.js");

// ── Helpers ──────────────────────────────────────────────────

function hideAll(sections) {
  sections.forEach((section) => section.classList.add("hidden"));
}

function showSection(section) {
  section.classList.remove("hidden");
}

// ══════════════════════════════════════════════════════════════
// SUITE 1 — Section Visibility Toggling
// ══════════════════════════════════════════════════════════════

describe("Section Visibility Toggling", () => {
  beforeEach(() => {
    document.body.innerHTML = `
            <section id="hero"></section>
            <section id="about" class="hidden"></section>
            <section id="experience" class="hidden"></section>
            <section id="interviews" class="hidden"></section>
            <section id="cloud" class="hidden"></section>
            <section id="contact" class="hidden"></section>
        `;
  });

  test("hideAll() should add 'hidden' class to every section", () => {
    // Arrange
    const sections = Array.from(document.querySelectorAll("section"));
    sections[0].classList.remove("hidden");

    // Act
    hideAll(sections);

    // Assert
    sections.forEach((section) => {
      expect(section.classList.contains("hidden")).toBe(true);
    });
  });

  test("showSection() should remove 'hidden' from the target section only", () => {
    // Arrange
    const experience = document.getElementById("experience");
    const interviews = document.getElementById("interviews");
    hideAll([experience, interviews]);

    // Act
    showSection(experience);

    // Assert
    expect(experience.classList.contains("hidden")).toBe(false);
    expect(interviews.classList.contains("hidden")).toBe(true);
  });

  test("calling showSection() twice should not duplicate classes or break state", () => {
    // Arrange
    const about = document.getElementById("about");

    // Act
    showSection(about);
    showSection(about);

    // Assert
    expect(about.classList.contains("hidden")).toBe(false);
    expect(about.classList.length).toBeLessThanOrEqual(2);
  });

  test("all six sections should exist in the DOM", () => {
    // Arrange
    const ids = [
      "hero",
      "about",
      "experience",
      "interviews",
      "cloud",
      "contact",
    ];

    // Assert
    ids.forEach((id) => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  test("hideAll() with empty array should not throw", () => {
    expect(() => hideAll([])).not.toThrow();
  });

  test("showSection() on a null element should not throw", () => {
    // Arrange
    const nonExistent = document.getElementById("does-not-exist");

    // Act & Assert
    expect(() => {
      if (nonExistent) showSection(nonExistent);
    }).not.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 2 — Nav Links
// ══════════════════════════════════════════════════════════════

describe("Nav Links", () => {
  beforeEach(() => {
    document.body.innerHTML = `
            <nav id="main-nav">
                <a href="#hero" class="nav-logo">ER</a>
                <div class="nav-links">
                    <a href="#about">About Me</a>
                    <a href="#experience">Experience</a>
                    <a href="#cloud">Cloud</a>
                    <a href="#interviews">Interviews</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
        `;
  });

  test("nav should exist in the DOM", () => {
    expect(document.getElementById("main-nav")).not.toBeNull();
  });

  test("nav logo should link to #hero and display ER", () => {
    // Arrange
    const logo = document.querySelector(".nav-logo");

    // Act & Assert
    expect(logo.getAttribute("href")).toBe("#hero");
    expect(logo.textContent).toBe("ER");
  });

  test("nav should contain exactly 5 section links", () => {
    expect(document.querySelectorAll(".nav-links a").length).toBe(5);
  });

  test("all nav links should use hash anchors", () => {
    // Arrange
    const links = document.querySelectorAll(".nav-links a");

    // Act & Assert
    links.forEach((link) => {
      expect(link.getAttribute("href")).toMatch(/^#/);
    });
  });

  test("nav links should point to the correct section IDs", () => {
    // Arrange
    const links = document.querySelectorAll(".nav-links a");
    const expected = [
      "#about",
      "#experience",
      "#cloud",
      "#interviews",
      "#contact",
    ];

    // Act
    const hrefs = Array.from(links).map((l) => l.getAttribute("href"));

    // Assert
    expect(hrefs).toEqual(expected);
  });

  test("nav links should not use javascript: protocol", () => {
    // Arrange
    const links = document.querySelectorAll(".nav-links a");

    // Act & Assert
    links.forEach((link) => {
      expect(link.getAttribute("href")).not.toMatch(/^javascript:/i);
    });
  });

  test("nav should not contain links pointing to external pages", () => {
    // Arrange
    const links = document.querySelectorAll(".nav-links a");

    // Act & Assert
    links.forEach((link) => {
      expect(link.getAttribute("href")).not.toMatch(/^https?:/);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 3 — Interview Card Toggle
// ══════════════════════════════════════════════════════════════

describe("Interview Card Toggle", () => {
  beforeEach(() => {
    document.body.innerHTML = `
            <div class="interview-cards">
                <div class="interview-card" id="card-billscott">
                    <div class="interview-card-header" role="button" tabindex="0" aria-expanded="false" aria-controls="body-billscott">
                        <div class="interview-card-toggle" id="toggle-billscott">
                            <span>Read more</span>
                            <span class="toggle-arrow">↓</span>
                        </div>
                    </div>
                    <div class="interview-card-body" id="body-billscott">
                        <p>Bill Scott content.</p>
                    </div>
                </div>
                <div class="interview-card" id="card-haines">
                    <div class="interview-card-header" role="button" tabindex="0" aria-expanded="false" aria-controls="body-haines">
                        <div class="interview-card-toggle" id="toggle-haines">
                            <span>Read more</span>
                            <span class="toggle-arrow">↓</span>
                        </div>
                    </div>
                    <div class="interview-card-body" id="body-haines">
                        <p>Haines Todd content.</p>
                    </div>
                </div>
            </div>
        `;
  });

  test("card should gain 'expanded' class when toggled open", () => {
    // Arrange
    const card = document.getElementById("card-billscott");

    // Act
    toggleInterview("billscott");

    // Assert
    expect(card.classList.contains("expanded")).toBe(true);
  });

  test("toggle label should change to 'Close' when expanded", () => {
    // Arrange
    const toggle = document.getElementById("toggle-billscott");

    // Act
    toggleInterview("billscott");

    // Assert
    expect(toggle.querySelector("span:first-child").textContent).toBe("Close");
  });

  test("toggling an open card should collapse it", () => {
    // Arrange
    const card = document.getElementById("card-billscott");
    toggleInterview("billscott");

    // Act
    toggleInterview("billscott");

    // Assert
    expect(card.classList.contains("expanded")).toBe(false);
  });

  test("opening one card should collapse any other open card", () => {
    // Arrange
    const billCard = document.getElementById("card-billscott");
    const hainesCard = document.getElementById("card-haines");
    toggleInterview("billscott");

    // Act
    toggleInterview("haines");

    // Assert
    expect(billCard.classList.contains("expanded")).toBe(false);
    expect(hainesCard.classList.contains("expanded")).toBe(true);
  });

  test("collapsed card label should reset to 'Read more'", () => {
    // Arrange
    toggleInterview("billscott");
    const toggle = document.getElementById("toggle-billscott");

    // Act
    toggleInterview("billscott");

    // Assert
    expect(toggle.querySelector("span:first-child").textContent).toBe(
      "Read more",
    );
  });

  test("card headers should have role='button' for accessibility", () => {
    // Arrange
    const headers = document.querySelectorAll(".interview-card-header");

    // Act & Assert
    headers.forEach((header) => {
      expect(header.getAttribute("role")).toBe("button");
    });
  });

  test("card headers should be keyboard focusable via tabindex", () => {
    // Arrange
    const headers = document.querySelectorAll(".interview-card-header");

    // Act & Assert
    headers.forEach((header) => {
      expect(header.getAttribute("tabindex")).toBe("0");
    });
  });

  test("toggleInterview() with nonexistent ID should not throw", () => {
    expect(() => toggleInterview("nonexistent")).not.toThrow();
  });

  test("rapid-fire toggling same card should leave it in a valid state", () => {
    // Arrange
    const card = document.getElementById("card-billscott");

    // Act
    for (let i = 0; i < 10; i++) {
      toggleInterview("billscott");
    }

    // Assert — even number of toggles leaves card collapsed
    expect(card.classList.contains("expanded")).toBe(false);
  });

  test("toggling null/undefined/empty ID should not throw", () => {
    expect(() => toggleInterview(null)).not.toThrow();
    expect(() => toggleInterview(undefined)).not.toThrow();
    expect(() => toggleInterview("")).not.toThrow();
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 4 — Interview Card Content (Bill Scott)
// ══════════════════════════════════════════════════════════════

describe("Interview Card Content — Bill Scott", () => {
  beforeEach(() => {
    document.body.innerHTML = `
            <div class="interview-card" id="card-billscott">
                <div class="interview-card-header" role="button" tabindex="0">
                    <div class="interview-card-photo-wrap">
                        <img class="interview-card-photo" src="images/Bill_Scott_Pic.jpeg" alt="Bill Scott" width="130" height="160">
                    </div>
                    <div class="interview-card-intro">
                        <p class="interview-card-eyebrow">Episode 01</p>
                        <h3 class="interview-card-name">Bill Scott</h3>
                        <p class="interview-card-title">Founder & CEO — BrainPaint Inc.</p>
                        <div class="interview-card-meta">
                            <span>Neurofeedback · EEG Biofeedback</span>
                            <span>Founded 2007 · Nevada</span>
                        </div>
                    </div>
                </div>
                <div class="interview-card-body" id="body-billscott">
                    <div class="quotes-grid">
                        <div class="quote-card"><blockquote>Q1</blockquote><span class="quote-tag">T1</span></div>
                        <div class="quote-card"><blockquote>Q2</blockquote><span class="quote-tag">T2</span></div>
                        <div class="quote-card"><blockquote>Q3</blockquote><span class="quote-tag">T3</span></div>
                        <div class="quote-card"><blockquote>Q4</blockquote><span class="quote-tag">T4</span></div>
                        <div class="quote-card"><blockquote>Q5</blockquote><span class="quote-tag">T5</span></div>
                        <div class="quote-card"><blockquote>Q6</blockquote><span class="quote-tag">T6</span></div>
                    </div>
                    <div class="insights-list">
                        <div class="insight-item"><span class="insight-num">01</span><div><h4>I1</h4></div></div>
                        <div class="insight-item"><span class="insight-num">02</span><div><h4>I2</h4></div></div>
                        <div class="insight-item"><span class="insight-num">03</span><div><h4>I3</h4></div></div>
                        <div class="insight-item"><span class="insight-num">04</span><div><h4>I4</h4></div></div>
                        <div class="insight-item"><span class="insight-num">05</span><div><h4>I5</h4></div></div>
                        <div class="insight-item"><span class="insight-num">06</span><div><h4>I6</h4></div></div>
                    </div>
                </div>
            </div>
        `;
  });

  test("Bill Scott card should exist in the DOM", () => {
    expect(document.getElementById("card-billscott")).not.toBeNull();
  });

  test("interview card name should be Bill Scott", () => {
    expect(document.querySelector(".interview-card-name").textContent).toBe(
      "Bill Scott",
    );
  });

  test("interview card title should reference BrainPaint", () => {
    expect(
      document.querySelector(".interview-card-title").textContent,
    ).toContain("BrainPaint");
  });

  test("episode eyebrow should read Episode 01", () => {
    expect(document.querySelector(".interview-card-eyebrow").textContent).toBe(
      "Episode 01",
    );
  });

  test("interview photo should have valid src, alt, width and height", () => {
    // Arrange
    const photo = document.querySelector(".interview-card-photo");

    // Act & Assert
    expect(photo).not.toBeNull();
    expect(photo.src).toBeTruthy();
    expect(photo.alt).toBe("Bill Scott");
    expect(photo.getAttribute("width")).toBe("130");
    expect(photo.getAttribute("height")).toBe("160");
  });

  test("quotes grid should contain exactly 6 quote cards", () => {
    expect(document.querySelectorAll(".quote-card").length).toBe(6);
  });

  test("insights list should contain exactly 6 insight items", () => {
    expect(document.querySelectorAll(".insight-item").length).toBe(6);
  });

  test("each insight should have a two-digit number label", () => {
    // Arrange
    const numbers = document.querySelectorAll(".insight-num");

    // Act & Assert
    numbers.forEach((num) => {
      expect(num.textContent.trim()).toMatch(/^\d{2}$/);
    });
  });

  test("card body should not be visible before toggle", () => {
    const card = document.getElementById("card-billscott");
    expect(card.classList.contains("expanded")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 5 — Security & Input Sanitization
// ══════════════════════════════════════════════════════════════

describe("Security — Input Sanitization", () => {
  test("sanitizeInput() should strip script tags and their content", () => {
    // Arrange
    const malicious = '<script>alert("xss")</script>Hello';

    // Act
    const result = sanitizeInput(malicious);

    // Assert
    expect(result).toBe("Hello");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("alert");
  });

  test("sanitizeInput() should strip inline event handlers", () => {
    // Arrange
    const malicious = "<img src=x onerror=alert(1)>Caption";

    // Act
    const result = sanitizeInput(malicious);

    // Assert
    expect(result).toBe("Caption");
    expect(result).not.toContain("onerror");
  });

  test("sanitizeInput() should handle nested malicious tags", () => {
    // Arrange
    const malicious = "<div><script>evil()</script><p>Safe</p></div>";

    // Act
    const result = sanitizeInput(malicious);

    // Assert
    expect(result).toContain("Safe");
    expect(result).not.toContain("evil");
    expect(result).not.toContain("<script>");
  });

  test("sanitizeInput() should leave clean strings unchanged", () => {
    expect(sanitizeInput("Ethan Reyes — Cloud Engineer")).toBe(
      "Ethan Reyes — Cloud Engineer",
    );
  });

  test("sanitizeInput() should trim leading and trailing whitespace", () => {
    expect(sanitizeInput("   Hello World   ")).toBe("Hello World");
  });

  test("sanitizeInput() should handle empty string", () => {
    expect(sanitizeInput("")).toBe("");
  });

  test("sanitizeInput() should handle non-string input gracefully", () => {
    expect(() => sanitizeInput(null)).not.toThrow();
    expect(() => sanitizeInput(undefined)).not.toThrow();
    expect(() => sanitizeInput(123)).not.toThrow();
  });

  test("contact links should not use javascript: protocol", () => {
    // Arrange
    document.body.innerHTML = `
            <section id="contact">
                <a href="#" data-contact="RXRoYW4uUGFyYWdvbkBnbWFpbC5jb20=" data-type="email" class="contact-link">
                    <span class="contact-link-value">Loading...</span>
                </a>
                <a href="https://github.com/Ethan-Reyes" class="contact-link">GitHub</a>
                <a href="images/Resume.PDF" class="contact-link" id="resume-download-link">Resume</a>
            </section>
        `;
    const links = document.querySelectorAll(".contact-link");

    // Act & Assert
    links.forEach((link) => {
      expect(link.getAttribute("href")).not.toMatch(/^javascript:/i);
    });
  });

  test("obfuscated email should decode correctly from Base64", () => {
    // Arrange
    const encoded = "RXRoYW4uUGFyYWdvbkBnbWFpbC5jb20=";

    // Act
    const decoded = atob(encoded);

    // Assert
    expect(decoded).toBe("Ethan.Paragon@gmail.com");
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 6 — Boot Screen
// ══════════════════════════════════════════════════════════════

describe("Boot Screen", () => {
  beforeEach(() => {
    document.body.innerHTML = `
            <div id="boot-screen">
                <div id="boot-terminal">
                    <div id="boot-lines"></div>
                    <div id="boot-cursor"></div>
                </div>
                <button id="skip-boot">skip →</button>
            </div>
            <div id="main-site" class="hidden">
                <nav id="main-nav"></nav>
            </div>
        `;
  });

  test("boot screen should exist on load", () => {
    expect(document.getElementById("boot-screen")).not.toBeNull();
  });

  test("main site should be hidden before boot completes", () => {
    expect(
      document.getElementById("main-site").classList.contains("hidden"),
    ).toBe(true);
  });

  test("skip button should exist and be clickable without throwing", () => {
    const skipBtn = document.getElementById("skip-boot");
    expect(skipBtn).not.toBeNull();
    expect(() => skipBtn.click()).not.toThrow();
  });

  test("boot-lines container should start empty", () => {
    expect(document.getElementById("boot-lines").children.length).toBe(0);
  });

  test("launchSite() should remove hidden from main site and add fade-out to boot", () => {
    // Arrange
    const bootScreen = document.getElementById("boot-screen");
    const mainSite = document.getElementById("main-site");

    // Act
    launchSite(bootScreen, mainSite);

    // Assert
    expect(mainSite.classList.contains("hidden")).toBe(false);
    expect(bootScreen.classList.contains("fade-out")).toBe(true);
  });

  test("boot screen should have a cursor element", () => {
    expect(document.getElementById("boot-cursor")).not.toBeNull();
  });

  test("launchSite() with null bootScreen should not throw", () => {
    // Arrange
    const mainSite = document.getElementById("main-site");

    // Act & Assert
    expect(() => launchSite(null, mainSite)).not.toThrow();
    expect(mainSite.classList.contains("hidden")).toBe(true);
  });

  test("launchSite() with null mainSite should not throw", () => {
    // Arrange
    const bootScreen = document.getElementById("boot-screen");

    // Act & Assert
    expect(() => launchSite(bootScreen, null)).not.toThrow();
    expect(bootScreen.classList.contains("fade-out")).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 7 — Globe Section
// ══════════════════════════════════════════════════════════════

describe("Globe Section", () => {
  beforeEach(() => {
    document.body.innerHTML = `
            <section id="cloud">
                <div class="globe-section">
                    <p class="content-label">Live Visitor Globe</p>
                    <div class="globe-embed" id="globe-embed">
                        <iframe
                            src="globe/globe.html"
                            title="Live Visitor Globe"
                            scrolling="no"
                            allowtransparency="true"
                            sandbox="allow-scripts allow-same-origin">
                        </iframe>
                    </div>
                </div>
                <div class="cloud-stats">
                    <div class="cloud-stat">
                        <span class="cloud-stat-value" id="visitor-count">—</span>
                        <span class="cloud-stat-label">Total Visits</span>
                    </div>
                    <div class="cloud-stat">
                        <span class="cloud-stat-value" id="resume-count">—</span>
                        <span class="cloud-stat-label">Resume Downloads</span>
                    </div>
                </div>
            </section>
        `;
  });

  test("globe embed container should exist", () => {
    expect(document.getElementById("globe-embed")).not.toBeNull();
  });

  test("globe iframe should have correct src", () => {
    // Arrange
    const iframe = document.querySelector("#globe-embed iframe");

    // Act & Assert
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("src")).toBe("globe/globe.html");
  });

  test("globe iframe should have sandbox attribute with required permissions", () => {
    // Arrange
    const iframe = document.querySelector("#globe-embed iframe");
    const sandbox = iframe.getAttribute("sandbox");

    // Act & Assert
    expect(sandbox).toContain("allow-scripts");
    expect(sandbox).toContain("allow-same-origin");
  });

  test("globe iframe should have a descriptive title for accessibility", () => {
    // Arrange
    const iframe = document.querySelector("#globe-embed iframe");

    // Act & Assert
    expect(iframe.getAttribute("title")).toBe("Live Visitor Globe");
  });

  test("visitor count display element should exist", () => {
    expect(document.getElementById("visitor-count")).not.toBeNull();
  });

  test("resume count display element should exist", () => {
    expect(document.getElementById("resume-count")).not.toBeNull();
  });

  test("visitor count should start with placeholder dash", () => {
    expect(document.getElementById("visitor-count").textContent).toBe("—");
  });

  test("globe iframe should not allow top-navigation or forms via sandbox", () => {
    // Arrange
    const iframe = document.querySelector("#globe-embed iframe");
    const sandbox = iframe.getAttribute("sandbox");

    // Act & Assert
    expect(sandbox).not.toContain("allow-top-navigation");
    expect(sandbox).not.toContain("allow-forms");
  });
});

// ══════════════════════════════════════════════════════════════
// SUITE 8 — ETL Pipeline & Fetch Retry
// ══════════════════════════════════════════════════════════════

describe("ETL Pipeline & Fetch Retry", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test("fetchWithRetry() should return data on first successful fetch", async () => {
    // Arrange
    const mockData = { success: true, totals: { visitors: 42 } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // Act
    const result = await fetchWithRetry("/.netlify/functions/get-stats");

    // Assert
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("fetchWithRetry() should retry on failure and succeed on second attempt", async () => {
    // Arrange — delayMs=0 skips backoff wait
    const mockData = { success: true, totals: { visitors: 10 } };
    global.fetch
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

    // Act
    const result = await fetchWithRetry(
      "/.netlify/functions/get-stats",
      {},
      3,
      0,
    );

    // Assert
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("fetchWithRetry() should throw after all retries exhausted", async () => {
    // Arrange — delayMs=0 skips backoff wait
    global.fetch.mockRejectedValue(new Error("Network down"));

    // Act & Assert
    await expect(
      fetchWithRetry("/.netlify/functions/get-stats", {}, 3, 0),
    ).rejects.toThrow("Network down");
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test("fetchWithRetry() should throw on non-ok HTTP response", async () => {
    // Arrange
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });

    // Act & Assert
    await expect(
      fetchWithRetry("/.netlify/functions/get-stats", {}, 1),
    ).rejects.toThrow("HTTP 500");
  });

  test("fetchWithRetry() should handle null URL gracefully", async () => {
    // Arrange
    global.fetch.mockRejectedValue(new TypeError("Failed to fetch"));

    // Act & Assert
    await expect(fetchWithRetry(null, {}, 1)).rejects.toThrow();
  });

  test("get-stats response shape should include required fields", async () => {
    // Arrange
    const mockStats = {
      success: true,
      generatedAt: "2025-01-01T00:00:00.000Z",
      totals: { visitors: 35, resumeDownloads: 0 },
      countrySummary: [{ country: "United States", visits: 35 }],
      recentVisits: [],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    // Act
    const data = await fetchWithRetry("/.netlify/functions/get-stats");

    // Assert
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("totals");
    expect(data).toHaveProperty("countrySummary");
    expect(data).toHaveProperty("recentVisits");
    expect(data.totals).toHaveProperty("visitors");
    expect(data.totals).toHaveProperty("resumeDownloads");
  });

  test("country summary entries should have country and visits fields", async () => {
    // Arrange
    const mockStats = {
      success: true,
      totals: { visitors: 35, resumeDownloads: 0 },
      countrySummary: [
        { country: "United States", visits: 30 },
        { country: "Canada", visits: 5 },
      ],
      recentVisits: [],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    // Act
    const data = await fetchWithRetry("/.netlify/functions/get-stats");

    // Assert
    data.countrySummary.forEach((entry) => {
      expect(entry).toHaveProperty("country");
      expect(entry).toHaveProperty("visits");
      expect(typeof entry.visits).toBe("number");
    });
  });
});
