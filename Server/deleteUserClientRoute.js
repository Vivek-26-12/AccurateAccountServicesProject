const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // Middleware to attach db to request
    router.use((req, res, next) => {
        req.db = db;
        next();
    });

    // DELETE route to delete a user (employee/admin) or a client
    router.delete("/:type/:id", async (req, res) => {
        const { type, id } = req.params;
        const db = req.db;

        if (!["user", "client"].includes(type)) {
            return res.status(400).json({ message: "Invalid type. Must be 'user' or 'client'." });
        }

        try {
            await db.promise().beginTransaction();

            if (type === "user") {
                const [user] = await db.promise().query(`SELECT auth_id FROM Users WHERE user_id = ?`, [id]);
                if (!user.length) return res.status(404).json({ message: "User not found" });

                const authId = user[0].auth_id;

                await db.promise().query(`DELETE FROM GroupChatMessages WHERE sender_id = ?`, [id]);
                await db.promise().query(`DELETE FROM GroupChatMembers WHERE user_id = ?`, [id]);
                await db.promise().query(`DELETE FROM PersonalChats WHERE sender_id = ? OR receiver_id = ?`, [id, id]);
                await db.promise().query(`DELETE FROM Tasks WHERE assigned_by = ? OR assigned_to = ?`, [id, id]);
                await db.promise().query(`DELETE FROM Users WHERE user_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Auth WHERE auth_id = ?`, [authId]);
            }

            if (type === "client") {
                const [client] = await db.promise().query(`SELECT auth_id FROM Clients WHERE client_id = ?`, [id]);
                if (!client.length) return res.status(404).json({ message: "Client not found" });

                const authId = client[0].auth_id;

                await db.promise().query(`DELETE FROM Feedback WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM ClientContacts WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM ImportantDocuments WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM OtherDocuments WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM FolderConnections WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Clients WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Auth WHERE auth_id = ?`, [authId]);
            }

            await db.promise().commit();
            res.status(200).json({ status: "success", message: `${type === "user" ? "User" : "Client"} and related data deleted successfully.` });

        } catch (err) {
            await db.promise().rollback();
            console.error(`Error deleting ${type} with ID ${id}:`, err);
            res.status(500).json({ status: "error", message: "Error deleting data.", error: err.message });
        }
    });

    return router;
};
