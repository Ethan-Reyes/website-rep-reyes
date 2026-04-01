/**
 * ============================================================
 * visitor-counter.js
 * Netlify Serverless Function — Ethan Reyes Portfolio
 * Tracks unique visitor count using Netlify Blobs storage.
 * Endpoint: /.netlify/functions/visitor-counter
 * ============================================================
 */

const { getStore } = require("@netlify/blobs");

exports.handler = async (event, context) => {

    // CORS headers so the frontend can call this function
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    try {
        // Get the visitors store from Netlify Blobs
        const store = getStore("portfolio-stats");

        // Retrieve current count, default to 0 if not set yet
        const current = await store.get("visitor-count");
        const count = current ? parseInt(current) + 1 : 1;

        // Save updated count
        await store.set("visitor-count", String(count));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                count,
                message: `Visit #${count} recorded.`
            })
        };

    } catch (error) {
        console.error("Visitor counter error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: "Could not update visitor count."
            })
        };
    }
};