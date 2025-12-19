const express = require("express");
const router = express.Router();

// Days after which recent relations expire
const RECENT_EXPIRY_DAYS = 7;

module.exports = (db) => {
    // 🔁 Clean up expired recent relations
    const removeOldRecents = () => {
        const query = `
            DELETE FROM ClientUserRelations 
            WHERE relation_type = 'Recent' 
            AND created_at < (NOW() - INTERVAL ? DAY)
        `;
        db.query(query, [RECENT_EXPIRY_DAYS], (err) => {
            if (err) {
                console.error("Failed to delete old recent relations:", err);
            }
        });
    };

    // 📌 Add Favourite
    router.post("/favourite", (req, res) => {
        const { user_id, client_id } = req.body;
        const query = `
            INSERT INTO ClientUserRelations (user_id, client_id, relation_type) 
            VALUES (?, ?, 'Favourite')
            ON DUPLICATE KEY UPDATE relation_type = 'Favourite', created_at = NOW()
        `;
        db.query(query, [user_id, client_id], (err) => {
            if (err) return res.status(500).send("Error adding to favourite.");
            res.send("Client marked as favourite.");
        });
    });

    // ❌ Remove Favourite
    router.delete("/favourite", (req, res) => {
        const { user_id, client_id } = req.body;
        const query = `
            DELETE FROM ClientUserRelations 
            WHERE user_id = ? AND client_id = ? AND relation_type = 'Favourite'
        `;
        db.query(query, [user_id, client_id], (err) => {
            if (err) return res.status(500).send("Error removing from favourite.");
            res.send("Client removed from favourite.");
        });
    });

    // ⚡ Add Recent (auto-deletes older ones via cleanup)
    router.post("/recent", (req, res) => {
        const { user_id, client_id } = req.body;

        removeOldRecents(); // Clean expired recents before insert

        const query = `
            INSERT INTO ClientUserRelations (user_id, client_id, relation_type) 
            VALUES (?, ?, 'Recent')
            ON DUPLICATE KEY UPDATE created_at = NOW()
        `;
        db.query(query, [user_id, client_id], (err) => {
            if (err) return res.status(500).send("Error adding to recent.");
            res.send("Client added to recent.");
        });
    });

    // 📄 Get all relations for a user
    router.get("/:userId", (req, res) => {
        const userId = req.params.userId;

        removeOldRecents(); // Optional: clean up every time we fetch

        const query = `
            SELECT r.client_id, r.relation_type, c.company_name, c.contact_person, c.email, c.profile_pic
            FROM ClientUserRelations r
            JOIN Clients c ON r.client_id = c.client_id
            WHERE r.user_id = ?
        `;
        db.query(query, [userId], (err, results) => {
            if (err) return res.status(500).send("Error fetching client relations.");
            res.json(results);
        });
    });

    return router;
};