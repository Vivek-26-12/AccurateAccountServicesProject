const express = require("express");
const router = express.Router();

module.exports = (db) => {

  // ➕ Create a new other document
  router.post("/other/create", (req, res) => {
    const { client_id, folder_id, doc_name, fileUrl } = req.body;
  
    if (!client_id || !folder_id || !doc_name) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: client_id, folder_id, doc_name",
      });
    }
  
    const insertSql = `
      INSERT INTO OtherDocuments (client_id, folder_id, doc_name, doc_data)
      VALUES (?, ?, ?, ?)
    `;
  
    // If fileUrl is missing or empty, insert null
    const fileData = fileUrl && fileUrl.trim() !== "" ? fileUrl : null;
  
    db.query(insertSql, [client_id, folder_id, doc_name, fileData], (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to insert document",
          error: err.message,
        });
      }
  
      res.status(201).json({
        success: true,
        message: "Other document inserted successfully",
        insertedId: result.insertId,
      });
    });
  });
  

  // 🔁 Update an existing document
  router.post("/other/update", (req, res) => {
    const { doc_id, fileUrl } = req.body;

    if (!doc_id || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: doc_id, fileUrl",
      });
    }

    const checkSql = "SELECT * FROM OtherDocuments WHERE doc_id = ?";
    db.query(checkSql, [doc_id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Other document not found" });
      }

      const updateSql = "UPDATE OtherDocuments SET doc_data = ? WHERE doc_id = ?";
      db.query(updateSql, [fileUrl, doc_id], (err) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({ success: false, message: "Failed to update document", error: err.message });
        }

        res.json({ success: true, message: "Other document updated successfully" });
      });
    });
  });

  // 🔍 Get document by doc_id
  router.get("/other/get/:doc_id", (req, res) => {
    const { doc_id } = req.params;

    const selectSql = "SELECT * FROM OtherDocuments WHERE doc_id = ?";
    db.query(selectSql, [doc_id], (err, results) => {
      if (err) {
        console.error("Select error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch document", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Document not found" });
      }

      res.json({
        success: true,
        data: results[0],
      });
    });
  });

  // 🔍 Get all documents for a client
  router.get("/other/getByClient/:client_id", (req, res) => {
    const { client_id } = req.params;

    const selectSql = "SELECT * FROM OtherDocuments WHERE client_id = ?";
    db.query(selectSql, [client_id], (err, results) => {
      if (err) {
        console.error("Select error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch documents", error: err.message });
      }

      res.json({
        success: true,
        documents: results,
      });
    });
  });

  return router;
};
