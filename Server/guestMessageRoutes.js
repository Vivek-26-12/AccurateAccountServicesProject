// guestMessageRoutes.js
const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // Route to add a guest message
    router.post("/", (req, res) => {
        const { guest_name, guest_email, message } = req.body;

        if (!guest_name || !guest_email || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const query = `
            INSERT INTO GuestMessages (guest_name, guest_email, message)
            VALUES (?, ?, ?)
        `;

        db.query(query, [guest_name, guest_email, message], (err, result) => {
            if (err) {
                console.error("Error inserting guest message:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            res.status(201).json({ message: "Message sent successfully!" });
        });
    });

    // Route to get all guest messages (admin use)
    router.get("/", (req, res) => {
        const query = `SELECT * FROM GuestMessages ORDER BY created_at DESC`;

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching guest messages:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            res.status(200).json(results);
        });
    });

    router.get("/count", (req, res) => {
        const query = `SELECT COUNT(*) AS messageCount FROM GuestMessages`;

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching message count:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            const count = results[0].messageCount;
            res.status(200).json({ count });
        });
    });

    router.get("/count/yesterday", (req, res) => {
        const query = `
            SELECT COUNT(*) AS yesterdayCount
            FROM GuestMessages
            WHERE DATE(created_at) >= CURDATE() - INTERVAL 1 DAY
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching yesterday's guest message count:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            const count = results[0].yesterdayCount;
            res.status(200).json({ count });
        });
    });

    return router;
};
