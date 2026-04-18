/**
 * ============================================================
 * visitor-counter.js
 * Netlify Serverless Function — Ethan Reyes Portfolio
 * Tracks visitor count AND captures geolocation data
 * from Netlify request headers for Power BI / Unity globe.
 * Endpoint: /.netlify/functions/visitor-counter
 * ============================================================
 */

const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  try {
    // Updated to use the credentials you saved in Netlify UI
    const store = getStore({
      name: "portfolio-stats",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_AUTH_TOKEN,
    });

    // ── Increment visitor count ──────────────────────────
    const current = await store.get("visitor-count");
    const count = current ? parseInt(current) + 1 : 1;
    await store.set("visitor-count", String(count));

    // ── Capture geolocation from Netlify headers ─────────
    // Netlify injects these headers automatically on their CDN
    const country = event.headers["x-country"] || "Unknown";
    const city = event.headers["x-city"] || "Unknown";
    const region = event.headers["x-nf-geo-subdivision"] || "Unknown";
    const ip = event.headers["x-nf-client-connection-ip"] || "Unknown";
    const timezone = event.headers["x-timezone"] || "Unknown";

    // ── Build visit event object ─────────────────────────
    const visitEvent = {
      visitNumber: count,
      timestamp: new Date().toISOString(),
      country,
      city,
      region,
      timezone,
      // Store hashed IP for deduplication — never store raw IPs
      ipHash:
        ip !== "Unknown"
          ? Buffer.from(ip).toString("base64").slice(0, 12)
          : "Unknown",
      userAgent: (event.headers["user-agent"] || "").slice(0, 120),
    };

    // ── Append to visit log ──────────────────────────────
    const logsRaw = await store.get("visitor-log");
    let logs = [];
    try {
      logs = logsRaw ? JSON.parse(logsRaw) : [];
    } catch (e) {
      logs = [];
    }

    logs.push(visitEvent);

    // Keep last 500 visit events
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    await store.set("visitor-log", JSON.stringify(logs));

    // ── Update country summary for quick lookups ─────────
    const summaryRaw = await store.get("country-summary");
    let summary = {};
    try {
      summary = summaryRaw ? JSON.parse(summaryRaw) : {};
    } catch (e) {
      summary = {};
    }

    summary[country] = (summary[country] || 0) + 1;
    await store.set("country-summary", JSON.stringify(summary));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count,
        location: { country, city, region, timezone },
        message: `Visit #${count} recorded from ${city}, ${country}.`,
      }),
    };
  } catch (error) {
    console.error("Visitor counter error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Could not update visitor count.",
        error: error.message,
      }),
    };
  }
};
