const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // Authentication route
    router.post("/", (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password required" });
        }

        const query = "SELECT * FROM Auth WHERE username = ?";

        db.query(query, [username], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const user = results[0];

            if (user.password !== password) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            res.json({ message: "Login successful", user });
        });
    });

    return router;
};
