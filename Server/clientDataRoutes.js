const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const clientId = req.query.client_id;

    const baseQuery = `
  SELECT 
    c.client_id,
    c.auth_id,
    c.company_name,
    c.contact_person,
    c.email,
    c.gstin,
    c.pan_number,
    c.profile_pic,

    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'folder_id', f.folder_id,
          'folder_name', f.folder_name
        )
      )
      FROM FolderConnections fc
      JOIN Folders f ON f.folder_id = fc.folder_id
      WHERE fc.client_id = c.client_id
    ) AS folders,

    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'doc_id', id.doc_id,
          'doc_type', id.doc_type,
          'doc_data', id.doc_data,
          'client_id', id.client_id,
          'folder_id', id.folder_id
        )
      )
      FROM ImportantDocuments id
      WHERE id.client_id = c.client_id
    ) AS importantDocuments,

    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'doc_id', od.doc_id,
          'doc_name', od.doc_name,
          'doc_data', od.doc_data,
          'client_id', od.client_id,
          'folder_id', od.folder_id
        )
      )
      FROM OtherDocuments od
      WHERE od.client_id = c.client_id
    ) AS otherDocuments

  FROM Clients c
  ${clientId ? "WHERE c.client_id = ?" : ""}
`;


    db.query(baseQuery, clientId ? [clientId] : [], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const formattedResults = results.map((client) => {
        // Initialize the response structure
        const response = {
          client_id: client.client_id,
          auth_id: client.auth_id,
          company_name: client.company_name,
          contact_person: client.contact_person,
          email: client.email,
          gstin: client.gstin,
          pan_number: client.pan_number,
          profile_pic: client.profile_pic,
          importantDocuments: client.importantDocuments || [],
          folders: (client.folders || []).map(folder => ({
            folder_id: folder.folder_id,
            folder_name: folder.folder_name,
            importantDocuments: [],
            otherDocuments: []
          })),
          otherDocuments: []
        };


        // Process important documents - assign to folders if they have folder_id
        client.importantDocuments.forEach(doc => {
          if (doc.folder_id) {
            const folder = response.folders.find(f => f.folder_id === doc.folder_id);
            if (folder) {
              folder.importantDocuments.push(doc);
            }
          } else {
            // Keep in root importantDocuments if no folder_id
            response.importantDocuments.push(doc);
          }
        });

        // Process other documents - assign to folders if they have folder_id
        client.otherDocuments.forEach(doc => {
          if (doc.folder_id) {
            const folder = response.folders.find(f => f.folder_id === doc.folder_id);
            if (folder) {
              folder.otherDocuments.push(doc);
            }
          } else {
            // Keep in root otherDocuments if no folder_id
            response.otherDocuments.push(doc);
          }
        });

        return response;
      });

      res.json(clientId ? formattedResults[0] || {} : formattedResults);
    });
  });

  return router;
};