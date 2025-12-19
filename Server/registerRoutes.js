const express = require("express");
const bcrypt = require("bcrypt");

module.exports = (db) => {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    const {
      username,
      password,
      role,
      first_name,
      last_name,
      email,
      phone,
      profile_pic,
      company_name,
      contact_person,
      gstin,
      pan_number,
      contacts
    } = req.body;

    try {
      // Validate required fields
      const requiredFields = ['username', 'password', 'role'];
      if (role === 'client') {
        requiredFields.push('company_name', 'contact_person');
      } else {
        requiredFields.push('first_name', 'last_name');
      }

      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Check if username or email already exists
      const [existingUser] = await db.promise().query(
        `SELECT username FROM Auth WHERE username = ? 
          UNION 
          SELECT email FROM Users WHERE email = ? 
          UNION 
          SELECT email FROM Clients WHERE email = ?`,
        [username, email, email]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ error: "Username or email already exists" });
      }

      // const hashedPassword = await bcrypt.hash(password, 10);

      // Start transaction
      await db.promise().query("START TRANSACTION");

      // Insert into Auth table
      const [authResult] = await db.promise().query(
        "INSERT INTO Auth (username, password, role) VALUES (?, ?, ?)",
        [username, password, role]
      );

      const auth_id = authResult.insertId;

      if (role === "admin" || role === "employee") {
        // Insert into Users table
        await db.promise().query(
          `INSERT INTO Users 
            (auth_id, first_name, last_name, email, phone, profile_pic)
            VALUES (?, ?, ?, ?, ?, ?)`,
          [auth_id, first_name, last_name, email, phone, profile_pic || null]
        );
      } else if (role === "client") {
        // Insert into Clients table
        const [clientResult] = await db.promise().query(
          `INSERT INTO Clients 
            (auth_id, company_name, contact_person, email, gstin, pan_number, profile_pic)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            auth_id,
            company_name,
            contact_person,
            email,
            gstin || null,
            pan_number || null,
            profile_pic || null
          ]
        );
        const client_id = clientResult.insertId;

        // Insert default important documents (Aadhar Card and PAN Card)
        await db.promise().query(
          `INSERT INTO ImportantDocuments (doc_type, client_id, folder_id) VALUES (?, ?, ?)`,
          ['Aadhar Card', client_id, 1]
        );
        await db.promise().query(
          `INSERT INTO ImportantDocuments (doc_type, client_id, folder_id) VALUES (?, ?, ?)`,
          ['PAN Card', client_id, 1]
        );


        // Insert client contacts if they exist
        if (contacts && contacts.length > 0) {
          for (const contact of contacts) {
            await db.promise().query(
              `INSERT INTO ClientContacts 
                (client_id, contact_name, phone, email)
                VALUES (?, ?, ?, ?)`,
              [clientResult.insertId, contact.contact_name, contact.phone, contact.email]
            );
          }
        }
      }

      await db.promise().query("COMMIT");
      res.status(201).json({ message: "Registration successful" });

    } catch (err) {
      await db.promise().query("ROLLBACK");
      console.error("Registration error:", err);
      res.status(500).json({
        error: "Internal server error",
        details: err.message
      });
    }
  });

  return router;
};