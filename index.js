const express = require('express');
const redis = require('redis');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const cors = require('cors');
const geoip = require('geoip-lite');


app.use(cors()); // This lets our React app talk to our Node app

app.use(express.json());

// --- DATABASE CONNECTIONS ---
const MONGO_URI = 'mongodb+srv://adarshkgupta07_db_user:adarshkgupta07_db_user@cluster0.b8k02yl.mongodb.net/?appName=Cluster0';
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const logSchema = new mongoose.Schema({
    ipAddress: String,
    endpoint: String,
    actionTaken: String,
    riskScore: Number, 
    location: String,
    timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model('AuditLog', logSchema);

const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().then(() => console.log('✅ Connected to Redis!')).catch(console.error);


// --- 1. THE VIP LANE: DASHBOARD LOGS ---
// Because this is ABOVE the traffic cop, it doesn't get rate limited.
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

// --- THE SMART TRAFFIC COP ---
app.use(async (req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const requestedPath = req.path;
    
    try {
        const visits = await redisClient.incr(clientIp);
        if (visits === 1) await redisClient.expire(clientIp, 60);

        // --- NEW: ASK THE PYTHON BRAIN ---
        let riskScore = 0.0;
        
        try {
            // Node.js sends a message to Port 8000 (Python)
            const brainResponse = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip_address: clientIp,
                    endpoint: requestedPath,
                    recent_visits: visits
                })
            });
            
            // Extract the score from Python's reply
            const brainData = await brainResponse.json();
            riskScore = brainData.risk_score;
            
        } catch (brainError) {
            console.error("⚠️ Brain is offline! Letting traffic pass.", brainError.message);
        }

        let action = 'ALLOWED';

        const geo = geoip.lookup(clientIp);
        const userLocation = geo ? `${geo.city}, ${geo.country}` : 'Local Network';

        // --- NEW: SMART BOUNCER LOGIC ---
        // If Python says the score is 0.7 or higher, it's a bot!
        if (riskScore >= 0.7) {
            action = 'BLOCKED';
            console.log(`🚨 BLOCKED: ${clientIp} | Score: ${riskScore} | Path: ${requestedPath}`);
            
            AuditLog.create({ 
                ipAddress: clientIp, endpoint: requestedPath, actionTaken: action, riskScore: riskScore, location: userLocation})
                .catch(err => console.error("Failed to save log:", err));

            return res.status(403).json({ error: "Suspicious behavior detected. Connection dropped." });
        }

        console.log(`🟢 ALLOWED: ${clientIp} | Score: ${riskScore} | Path: ${requestedPath}`);
        
        AuditLog.create({ ipAddress: clientIp, endpoint: requestedPath, actionTaken: action, riskScore: riskScore, location: userLocation })
            .catch(err => console.error("Failed to save log:", err));

        next(); 
        
    } catch (error) {
        console.error("System error:", error);
        next();
    }
});

// --- API ENDPOINTS ---
app.post('/api/login', (req, res) => res.json({ message: "Login attempt received." }));
app.get('/api/data', (req, res) => res.json({ data: "Sensitive data." }));

// --- NEW ENDPOINT FOR THE DASHBOARD ---
app.get('/api/logs', async (req, res) => {
    try {
        // Grab the 50 most recent logs from MongoDB
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

app.listen(PORT, () => {
    console.log(`🛡️  Server running on http://localhost:${PORT}`);
});