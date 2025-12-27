const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- ROUTE 1: GET (Used by the EA to Check License) ---
app.get('/', (req, res) => {
    const searchId = req.query.id;
    
    if (!searchId) {
        return res.json({ status: "error", message: "No ID provided" });
    }

    // Read database
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading DB:", err);
            return res.json({ status: "error", message: "Server Error" });
        }

        let licenses = [];
        try {
            licenses = JSON.parse(data);
        } catch (e) {
            licenses = [];
        }

        // Find the license
        const found = licenses.find(lic => lic.id === searchId);

        if (found) {
            res.json({ status: "found", data: found });
        } else {
            res.json({ status: "not_found", message: "Invalid License Key" });
        }
    });
});

// --- ROUTE 2: POST (Used by Control Panel to Update DB) ---
app.post('/', (req, res) => {
    const newData = req.body;

    if (!newData) {
        return res.status(400).json({ status: "error", message: "No data received" });
    }

    // Overwrite the database file
    fs.writeFile(DB_FILE, JSON.stringify(newData, null, 2), (err) => {
        if (err) {
            console.error("Error writing DB:", err);
            return res.status(500).json({ status: "error", message: "Write Failed" });
        }
        console.log("Database updated successfully.");
        res.json({ status: "success", message: "Database updated!" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});