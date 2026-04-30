const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// Constants
const API_KEY = 'selovasx2024';
const BASE_API = 'https://pasayloakomego.onrender.com/api/facebook/share';

// Share endpoint - your backend calls the external API
app.post('/api/share', async (req, res) => {
    const { cookie, url, amount = 1, interval = 5 } = req.body;

    // Validation
    if (!cookie || !url) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: cookie and url are required' 
        });
    }

    if (amount < 1 || amount > 100) {
        return res.status(400).json({ 
            success: false, 
            error: 'Amount must be between 1 and 100' 
        });
    }

    try {
        // Encode cookie for URL
        const encodedCookie = encodeURIComponent(cookie);
        const encodedUrl = encodeURIComponent(url);
        
        // Build API URL
        const apiUrl = `${BASE_API}?apikey=${API_KEY}&cookie=${encodedCookie}&url=${encodedUrl}&amount=${amount}&interval=${interval}`;
        
        console.log(`🚀 Sending share request: ${amount}x to ${url}`);
        console.log(`📡 API URL: ${apiUrl.substring(0, 200)}...`);
        
        // Call the external API
        const response = await axios.get(apiUrl, {
            timeout: 30000, // 30 second timeout
            headers: {
                'User-Agent': 'ShareBoost-V6/1.0',
                'Accept': 'application/json'
            }
        });
        
        // Return success response
        res.json({
            success: true,
            data: response.data,
            message: `Successfully sent ${amount} share(s)`
        });
        
    } catch (error) {
        console.error('API Error:', error.message);
        
        // Handle different error types
        if (error.response) {
            // The API responded with an error status
            res.status(error.response.status).json({
                success: false,
                error: `API Error: ${error.response.data?.message || error.response.statusText}`,
                details: error.response.data
            });
        } else if (error.request) {
            // No response received
            res.status(503).json({
                success: false,
                error: 'Service unavailable. The share API is not responding.'
            });
        } else {
            // Other errors
            res.status(500).json({
                success: false,
                error: `Internal error: ${error.message}`
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ ShareBoost Backend running on port ${PORT}`);
    console.log(`📍 Frontend: http://localhost:${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api/share`);
});
