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
        // Updated to explicitly use credentials for the Cloud environment
        const store = getStore({
            name: "portfolio-stats",
            siteID: process.env.NETLIFY_SITE_ID,
            token: process.env.NETLIFY_AUTH_TOKEN
        });

        // Fetch all stored data in parallel
        const [
            visitorCount,
            resumeDownloads,
            visitorLog,
            countrySummary
        ] = await Promise.all([
            store.get("visitor-count"),
            store.get("resume-downloads"),
            store.get("visitor-log"),
            store.get("country-summary")
        ]);

        const log     = visitorLog     ? JSON.parse(visitorLog)     : [];
        const summary = countrySummary ? JSON.parse(countrySummary) : {};

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
        console.error("get-stats error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: "Could not retrieve stats.",
                error: error.message // Added for easier debugging in the Python terminal
            })
        };
    }
};