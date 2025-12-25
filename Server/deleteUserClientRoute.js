const express = require("express");

module.exports = (db, io) => {
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
                if (!user.length) {
                    await db.promise().rollback();
                    return res.status(404).json({ message: "User not found" });
                }

                const authId = user[0].auth_id;

                // Delete all user related data
                await db.promise().query(`DELETE FROM ClientUserRelations WHERE user_id = ?`, [id]);

                // Delete "Seen" records for messages sent BY this user (because we are about to delete the messages)
                await db.promise().query(`DELETE FROM GroupChatMessageSeen WHERE message_id IN (SELECT message_id FROM GroupChatMessages WHERE sender_id = ?)`, [id]);

                // Delete "Seen" records created BY this user
                await db.promise().query(`DELETE FROM GroupChatMessageSeen WHERE user_id = ?`, [id]);

                await db.promise().query(`DELETE FROM GroupChatMessages WHERE sender_id = ?`, [id]);
                await db.promise().query(`DELETE FROM GroupChatMembers WHERE user_id = ?`, [id]);
                await db.promise().query(`DELETE FROM PersonalChats WHERE sender_id = ? OR receiver_id = ?`, [id, id]);
                await db.promise().query(`DELETE FROM Tasks WHERE assigned_by = ? OR assigned_to = ?`, [id, id]);

                // Handle GroupChats created by user - set created_by to NULL to preserve group for others
                // If created_by is not nullable, this might fail, but it's the safest first attempt without deleting shared groups.
                // If the user wants groups deleted, we would DELETE FROM GroupChats WHERE created_by = ?
                // But typically we don't delete shared resources.
                try {
                    await db.promise().query(`UPDATE GroupChats SET created_by = NULL WHERE created_by = ?`, [id]);
                } catch (e) {
                    // If update fails (e.g. not null constraint), we might have to ignore or delete.
                    // Proceeding assuming it's either nullable or not enforced stricly against delete blocking on updates.
                    console.warn("Could not set created_by to NULL (might be non-nullable or no usage):", e.message);
                }

                await db.promise().query(`DELETE FROM Users WHERE user_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Announcements WHERE auth_id = ?`, [authId]);
                await db.promise().query(`DELETE FROM Auth WHERE auth_id = ?`, [authId]);
            }

            if (type === "client") {
                const [client] = await db.promise().query(`SELECT auth_id FROM Clients WHERE client_id = ?`, [id]);
                if (!client.length) {
                    await db.promise().rollback();
                    return res.status(404).json({ message: "Client not found" });
                }

                const authId = client[0].auth_id;

                await db.promise().query(`DELETE FROM ClientUserRelations WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Feedback WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM ClientContacts WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM ImportantDocuments WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM OtherDocuments WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM FolderConnections WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Clients WHERE client_id = ?`, [id]);
                await db.promise().query(`DELETE FROM Auth WHERE auth_id = ?`, [authId]);
            }

            await db.promise().commit();
            io.emit("user_deleted", { id, type });
            res.status(200).json({ status: "success", message: `${type === "user" ? "User" : "Client"} and related data deleted successfully.` });

        } catch (err) {
            await db.promise().rollback();
            console.error(`Error deleting ${type} with ID ${id}:`, err);
            // Check for foreign key constraint failure
            if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
                return res.status(409).json({ status: "error", message: "Cannot delete: This record is referenced by other data that was not cleaned up.", error: err.message });
            }
            res.status(500).json({ status: "error", message: "Error deleting data.", error: err.message });
        }
    });

    return router;
};
