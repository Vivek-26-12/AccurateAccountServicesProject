const express = require("express");
const router = express.Router();

module.exports = (db) => {
  router.post("/uploadimportant", (req, res) => {
    const { doc_id, fileUrl } = req.body;

    if (!doc_id || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: doc_id and fileUrl",
      });
    }

    const checkSql = "SELECT * FROM ImportantDocuments WHERE doc_id = ?";
    db.query(checkSql, [doc_id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Important document not found",
        });
      }

      const updateSql = "UPDATE ImportantDocuments SET doc_data = ? WHERE doc_id = ?";
      db.query(updateSql, [fileUrl, doc_id], (err) => {
        if (err) {
          console.error("Update error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to update document",
            error: err.message,
          });
        }

        res.json({
          success: true,
          message: "Important document updated successfully",
        });
      });
    });
  });

  return router;
};
