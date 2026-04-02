/**
 * ============================================================
 * get-stats.js
 * Netlify Serverless Function — Ethan Reyes Portfolio
 * Public read endpoint — returns all portfolio metrics as JSON.
 * Used by: Power BI, Unity globe, Python ETL script.
 * Endpoint: /.netlify/functions/get-stats
 * ============================================================
 */

const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    // Handle Pre-flight requests for Power BI/Web queries
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    try {
        // Explicitly use credentials for the Cloud environment
        const store = getStore({
            name: "portfolio-stats",
            siteID: process.env.NETLIFY_SITE_ID,
            token: process.env.NETLIFY_AUTH_TOKEN
        });

        // Fetch values individually with fallbacks to avoid Promise.all crashes
        // This ensures that if a key doesn't exist yet, the code doesn't break
        const visitorCount    = await store.get("visitor-count")    || "0";
        const resumeDownloads = await store.get("resume-downloads") || "0";
        const visitorLog      = await store.get("visitor-log")      || "[]";
        const countrySummary  = await store.get("country-summary")  || "{}";

        let log, summary;
        try {
            // Safety check: parse only if data exists, otherwise use empty defaults
            log = JSON.parse(visitorLog);
            summary = JSON.parse(countrySummary);
        } catch (e) {
            console.error("Parsing error:", e);
            log = [];
            summary = {};
        }

        // Build country list for Unity globe
        const countryList = Object.entries(summary)
            .map(([country, visits]) => ({ country, visits }))
            .sort((a, b) => b.visits - a.visits);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                generatedAt: new Date().toISOString(),
                totals: {
                    visitors:         parseInt(visitorCount)    || 0,
                    resumeDownloads: parseInt(resumeDownloads) || 0
                },
                countrySummary: countryList,
                recentVisits: log.slice(-50).reverse() // last 50, newest first
            })
        };

    } catch (error) {
        // This log will appear in your Netlify Functions dashboard
        console.error("get-stats critical error:", error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: "Could not retrieve stats.",
                error: error.message 
            })
        };
    }
};