const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || "mysql-3f0678b1-vivekdhanwani26122004-19b3.b.aivencloud.com",
    port: process.env.DB_PORT || 20875,
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD || "AVNS_B095vviE7FXOIMNUQq1",
    database: process.env.DB_NAME || "defaultdb",
    ssl: {
        rejectUnauthorized: false, // Only for development
        ca: fs.readFileSync("aiven-ca.pem"), // Use Aiven's SSL certificate
    },
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database.");
    }
});

module.exports = db;
