const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const DB_FILE = 'database.json';

// Helper to read DB
const readDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE));
        }
        return [];
    } catch (e) {
        console.error("Error reading DB:", e);
        return [];
    }
};

// Helper to write DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        console.log("Database updated.");
    } catch (e) {
        console.error("Error writing DB:", e);
    }
};

// --- UPDATED ROUTE: HANDLES POST ---
app.post('/', (req, res) => {
    try {
        // 1. Check if body exists
        if (!req.body) {
            return res.status(400).json({status:"error", message:"No Body Data (JSON missing)"});
        }

        // 2. Parse JSON Body
        const data = JSON.parse(req.body);
        const id = data.id;

        console.log(`Received POST request with ID: ${id}`);

        // 3. Read DB
        const licenses = readDB();

        // 4. Check Logic
        const license = licenses.find(l => l.id === id);

        if (license) {
            // Found - Return success
            return res.json({status:"found", data:license});
        } else {
            // Not Found - Return error
            return res.json({status:"error", message:"Invalid License Key"});
        }

    } catch (e) {
        console.error("Server Error:", e);
        return res.status(500).json({status:"error", message:"Internal Server Error"});
    }
});

// --- OPTIONAL: GET FALLBACK (Keeps old compatibility for simple browsers) ---
app.get('/', (req, res) => {
    // If you want to support the old GET method as well, keep this.
    const id = req.query.id;
    if (id) {
        console.log(`Received GET request with ID: ${id}`);
        const licenses = readDB();
        const license = licenses.find(l => l.id === id);
        return res.json(license ? {status:"found", data:license} : {status:"error", message:"Invalid License Key"});
    } else {
        return res.send("License API is running. Use POST for verification.");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
});
