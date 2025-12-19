// index.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const authRoutes = require("./authRoutes");
const clientRoutes = require("./clientRoutes");
const userRoutes = require("./userRoutes");
const registerRoute = require("./registerRoutes");
const clientDataRoutes = require("./clientDataRoutes");
const uploadImportantRoutes = require("./uploadImportantRoutes");
const uploadOtherRoutes = require("./uploadOtherRoutes");
const updateRoutes = require("./updateRoutes"); // Add this line
const folderRoutes = require("./folderRoutes"); // Add this line
const feedbackRoutes = require("./feedbackRoutes"); // 👈 import
const chatRoutes = require("./chatRoutes");
const taskRoutes = require("./taskRoutes");
const guestMessageRoutes = require("./guestMessageRoutes"); // 👈 import
const announcementsRouter = require('./announcements');
const clientRelationRoutes = require("./clientRelationRoutes");
const deleteUserClientRoutes = require("./deleteUserClientRoute");
const unseenMessagesRoutes = require("./unseenMessagesRoutes");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "mysql-3f0678b1-vivekdhanwani26122004-19b3.b.aivencloud.com",
    port: process.env.DB_PORT || 20875,
    user: process.env.DB_USER || "avnadmin",
    password: process.env.DB_PASSWORD || "AVNS_B095vviE7FXOIMNUQq1",
    database: process.env.DB_NAME || "defaultdb",
    ssl: {
        rejectUnauthorized: false,
    },
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database.");
    }
});

app.get("/", (req, res) => {
    res.send("Node.js server is running!");
});

app.use("/auth", authRoutes(db));
app.use("/clients", clientRoutes(db));
app.use("/users", userRoutes(db));
app.use("/", registerRoute(db));
app.use("/clientDataRoutes", clientDataRoutes(db));
app.use("/", uploadImportantRoutes(db));
app.use("/", uploadOtherRoutes(db));
app.use("/update", updateRoutes(db)); // Add this line
app.use("/folders", folderRoutes(db)); // Mount the route at /folders
app.use("/feedback", feedbackRoutes(db)); // 👈 mount
app.use("/chats", chatRoutes(db));
app.use("/", unseenMessagesRoutes(db));
app.use("/", taskRoutes(db));
app.use("/guest-messages", guestMessageRoutes(db)); // 👈 mount route
app.use('/announcements', announcementsRouter(db));
app.use("/client-relations", clientRelationRoutes(db));
app.use("/delete", deleteUserClientRoutes(db)); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});