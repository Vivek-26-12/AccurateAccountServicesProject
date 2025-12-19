// unseenMessagesRoutes.js
const express = require("express");
const router = express.Router();

module.exports = (db) => {
    // Route: GET /unseen-messages/all?user_id=1
    router.get("/unseen-messages/all", (req, res) => {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }

        // Object to store all unseen counts
        const unseenCounts = {
            personal_chats: {},
            group_chats: {}
        };

        // First query: Get all unseen personal messages counts
        const personalQuery = `
            SELECT sender_id, COUNT(*) as unseen_count
            FROM PersonalChats
            WHERE receiver_id = ? AND is_seen = FALSE
            GROUP BY sender_id
        `;

        // Second query: Get all unseen group messages counts
        const groupQuery = `
            SELECT group_id, COUNT(*) as unseen_count
            FROM GroupChatMessageSeen
            WHERE user_id = ? AND is_seen = FALSE
            GROUP BY group_id
        `;

        // Execute both queries in parallel
        db.query(personalQuery, [user_id], (personalErr, personalResults) => {
            if (personalErr) {
                console.error("Error fetching unseen personal messages:", personalErr);
                return res.status(500).json({ error: "Database error fetching personal messages" });
            }

            // Store personal chat results
            personalResults.forEach(row => {
                unseenCounts.personal_chats[row.sender_id] = row.unseen_count;
            });

            db.query(groupQuery, [user_id], (groupErr, groupResults) => {
                if (groupErr) {
                    console.error("Error fetching unseen group messages:", groupErr);
                    return res.status(500).json({ error: "Database error fetching group messages" });
                }

                // Store group chat results
                groupResults.forEach(row => {
                    unseenCounts.group_chats[row.group_id] = row.unseen_count;
                });

                res.json(unseenCounts);
            });
        });
    });

    // Route: GET /unseen-messages?user_id=1&group_id=2 (original single group check)
    router.get("/unseen-messages", (req, res) => {
        const { user_id, group_id } = req.query;

        if (!user_id || !group_id) {
            return res.status(400).json({ error: "user_id and group_id are required" });
        }

        const query = `
            SELECT COUNT(*) AS unseen_count
            FROM GroupChatMessageSeen
            WHERE user_id = ? AND group_id = ? AND is_seen = FALSE
        `;

        db.query(query, [user_id, group_id], (err, results) => {
            if (err) {
                console.error("Error fetching unseen messages:", err);
                return res.status(500).json({ error: "Database error" });
            }

            res.json({ unseen_count: results[0].unseen_count });
        });
    });

    // Mark personal messages as seen
    router.post("/mark-personal-messages-seen", (req, res) => {
        const { sender_id, receiver_id } = req.body;
    
        if (!sender_id || !receiver_id) {
            return res.status(400).json({ error: "sender_id and receiver_id are required" });
        }
    
        const query = `
            UPDATE PersonalChats 
            SET is_seen = TRUE 
            WHERE sender_id = ? AND receiver_id = ?
        `;
    
        db.query(query, [sender_id, receiver_id], (err) => {
            if (err) {
                console.error("Error marking messages as seen:", err);
                return res.status(500).json({ error: "Error updating messages" });
            }
            res.json({ success: true });
        });
    });
    
    // Mark group messages as seen
    router.post("/mark-group-messages-seen", (req, res) => {
        const { user_id, group_id } = req.body;
    
        if (!user_id || !group_id) {
            return res.status(400).json({ error: "user_id and group_id are required" });
        }
    
        const query = `
            UPDATE GroupChatMessageSeen
            SET is_seen = TRUE 
            WHERE user_id = ? AND group_id = ? AND is_seen = FALSE
        `;
    
        db.query(query, [user_id, group_id], (err) => {
            if (err) {
                console.error("Error marking group messages as seen:", err);
                return res.status(500).json({ error: "Error updating messages" });
            }
            res.json({ success: true });
        });
    });
    
    // GET unseen personal message count (single chat)
    router.get("/messages/unseen-count", (req, res) => {
        const { user_id, receiver_id } = req.query;

        if (!user_id || !receiver_id) {
            return res.status(400).json({ error: "user_id and receiver_id are required" });
        }

        const query = `
            SELECT COUNT(*) as unseen_count
            FROM PersonalChats
            WHERE sender_id = ? AND receiver_id = ? AND is_seen = 0
        `;

        db.query(query, [user_id, receiver_id], (err, results) => {
            if (err) {
                console.error("Error fetching unseen message count:", err);
                return res.status(500).json({ error: "Error fetching unseen count" });
            }
            res.json(results[0]);
        });
    });

    return router;
};