const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // console.log("Clients route file is loaded!"); // Debugging log

    // Fetch all clients with their contacts
    router.get("/", (req, res) => {
        // console.log("Received request to fetch all clients");

        const clientQuery = `
            SELECT Clients.client_id, Clients.auth_id, Auth.username, Auth.role,
                   Clients.company_name, Clients.contact_person, Clients.email,
                   Clients.gstin, Clients.pan_number, Clients.profile_pic,
                   Clients.created_at, Clients.updated_at
            FROM Clients
            INNER JOIN Auth ON Clients.auth_id = Auth.auth_id;
        `;

        db.query(clientQuery, (err, clientResults) => {
            if (err) {
                console.error("Database error while fetching clients:", err);
                return res.status(500).json({ error: "Database error" });
            }

            const clientIds = clientResults.map(client => client.client_id);
            if (clientIds.length === 0) return res.json([]);

            const contactQuery = `
                SELECT * FROM ClientContacts
                WHERE client_id IN (?)
            `;

            db.query(contactQuery, [clientIds], (err, contactResults) => {
                if (err) {
                    console.error("Database error while fetching contacts:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                // Group contacts by client_id
                const contactsMap = {};
                contactResults.forEach(contact => {
                    if (!contactsMap[contact.client_id]) {
                        contactsMap[contact.client_id] = [];
                    }
                    contactsMap[contact.client_id].push(contact);
                });

                // Attach contacts to respective clients
                const clientsWithContacts = clientResults.map(client => ({
                    ...client,
                    contacts: contactsMap[client.client_id] || []
                }));

                res.json(clientsWithContacts);
            });
        });
    });

    // Fetch a specific client with their contacts by auth_id
    router.get("/:id", (req, res) => {
        const { id } = req.params;
        // console.log(`Received request to fetch client with auth_id: ${id}`);

        const clientQuery = `
            SELECT * FROM Clients WHERE auth_id = ?
        `;

        db.query(clientQuery, [id], (err, clientResults) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (clientResults.length === 0) {
                return res.status(404).json({ error: "Client not found" });
            }

            const client = clientResults[0];

            const contactQuery = `
                SELECT * FROM ClientContacts WHERE client_id = ?
            `;

            db.query(contactQuery, [client.client_id], (err, contactResults) => {
                if (err) {
                    console.error("Database error while fetching contacts:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                res.json({
                    ...client,
                    contacts: contactResults
                });
            });
        });
    });

    return router;
};
