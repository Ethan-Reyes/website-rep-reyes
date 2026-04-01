/**
 * ============================================================
 * resume-tracker.js
 * Netlify Serverless Function — Ethan Reyes Portfolio
 * Logs resume download events with timestamp and user agent.
 * Endpoint: /.netlify/functions/resume-tracker
 * ============================================================
 */

const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    try {
        const store = getStore("portfolio-stats");

        // Increment download count
        const current = await store.get("resume-downloads");
        const count = current ? parseInt(current) + 1 : 1;
        await store.set("resume-downloads", String(count));

        // Log the download event with timestamp
        const logsRaw = await store.get("resume-download-log");
        const logs = logsRaw ? JSON.parse(logsRaw) : [];

        logs.push({
            timestamp: new Date().toISOString(),
            userAgent: event.headers["user-agent"] || "unknown",
            referrer: event.headers["referer"] || "direct",
            downloadNumber: count
        });

        // Keep only the last 100 download events
        if (logs.length > 100) logs.splice(0, logs.length - 100);
        await store.set("resume-download-log", JSON.stringify(logs));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                count,
                message: `Resume download #${count} logged.`
            })
        };

    } catch (error) {
        console.error("Resume tracker error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: "Could not log resume download."
            })
        };
    }
};