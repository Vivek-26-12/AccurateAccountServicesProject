// feedbackRoutes.js
const express = require("express");
const router = express.Router();

module.exports = (db) => {
    // Submit feedback (Only Clients)
    router.post("/submit", (req, res) => {
        const { client_id, message } = req.body;

        if (!client_id || !message) {
            return res.status(400).json({ error: "Client ID and message are required." });
        }

        const query = "INSERT INTO Feedback (client_id, message) VALUES (?, ?)";
        db.query(query, [client_id, message], (err, result) => {
            if (err) {
                console.error("Error submitting feedback:", err);
                return res.status(500).json({ error: "Failed to submit feedback." });
            }
            res.status(201).json({ success: true, message: "Feedback submitted successfully." });
        });
    });

    // Get all feedbacks (For admin)
    router.get("/all", (req, res) => {
        const query = `
            SELECT f.feedback_id, f.message, f.created_at, c.company_name, c.contact_person
            FROM Feedback f
            JOIN Clients c ON f.client_id = c.client_id
            ORDER BY f.created_at DESC
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching feedbacks:", err);
                return res.status(500).json({ error: "Failed to retrieve feedbacks." });
            }
            res.json(results);
        });
    });

    router.get("/count", (req, res) => {
        const query = `SELECT COUNT(*) AS feedbackCount FROM Feedback`;

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching feedback count:", err);
                return res.status(500).json({ error: "Failed to retrieve feedback count." });
            }

            const count = results[0].feedbackCount;
            res.status(200).json({ count });
        });
    });

    // ✅ Count of feedbacks from previous day
    // ✅ Count of feedbacks from previous day
    router.get("/count/yesterday", (req, res) => {
        const query = `
        SELECT COUNT(*) AS yesterdayCount
        FROM Feedback
        WHERE created_at >= CURDATE() - INTERVAL 1 DAY
          
    `;

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching yesterday's feedback count:", err);
                return res.status(500).json({ error: "Failed to retrieve yesterday's count." });
            }

            const count = results[0].yesterdayCount;
            res.status(200).json({ count });
        });
    });


    return router;
};
