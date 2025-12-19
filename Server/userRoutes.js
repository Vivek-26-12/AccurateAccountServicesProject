console.log("Users route file is loaded!");

const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Fetch all users with their roles
  router.get("/", (req, res) => {
    console.log("Received request to fetch all users with roles");
    const query = `
      SELECT 
        Users.user_id, 
        Users.auth_id, 
        Auth.username, 
        Auth.role, 
        Users.first_name, 
        Users.last_name, 
        Users.email, 
        Users.phone, 
        Users.profile_pic, 
        Users.created_at, 
        Users.updated_at 
      FROM Users 
      INNER JOIN Auth ON Users.auth_id = Auth.auth_id
      ORDER BY Users.user_id ASC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch users" });
      }
      console.log(`Fetched ${results.length} users with roles`);
      res.json(results);
    });
  });

  // Fetch a specific user by ID with role
  router.get("/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Fetching user with ID: ${id}`);
    
    const query = `
      SELECT 
        Users.user_id, 
        Users.auth_id, 
        Auth.username, 
        Auth.role, 
        Users.first_name, 
        Users.last_name, 
        Users.email, 
        Users.phone, 
        Users.profile_pic, 
        Users.created_at, 
        Users.updated_at 
      FROM Users 
      INNER JOIN Auth ON Users.auth_id = Auth.auth_id
      WHERE Users.user_id = ?
    `;
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        console.log(`User with ID ${id} not found`);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("Fetched user:", results[0]);
      res.json(results[0]);
    });
  });

  // Fetch user by auth_id with role
  router.get("/auth/:auth_id", (req, res) => {
    const { auth_id } = req.params;
    console.log(`Fetching user with auth_id: ${auth_id}`);
    
    const query = `
      SELECT 
        Users.user_id, 
        Users.auth_id, 
        Auth.username, 
        Auth.role, 
        Users.first_name, 
        Users.last_name, 
        Users.email, 
        Users.phone, 
        Users.profile_pic, 
        Users.created_at, 
        Users.updated_at 
      FROM Users 
      INNER JOIN Auth ON Users.auth_id = Auth.auth_id
      WHERE Users.auth_id = ?
    `;
    
    db.query(query, [auth_id], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        console.log(`User with auth_id ${auth_id} not found`);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("Fetched user:", results[0]);
      res.json(results[0]);
    });
  });

  return router;
};