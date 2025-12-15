import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    uploadImage,
    uploadJSON,
    getJSON,
    getImage,
    initializeHelia,
    shutdown
} from './ipfs-client.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// API Key Authentication Middleware
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        console.error('ERROR: API_KEY not configured in environment variables');
        return res.status(500).json({
            error: 'Server configuration error',
            message: 'API key not configured'
        });
    }

    if (!apiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'API key is required'
        });
    }

    if (apiKey !== validApiKey) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid API key'
        });
    }

    next();
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'IPFS server is running' });
});

/**
 * POST /api/upload-image
 * Upload a raw image to IPFS
 * 
 * Form data:
 * - image: file
 */
app.post('/api/upload-image', apiKeyAuth, upload.single('image'), async (req, res) => {
    try {
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({
                error: 'Missing image file'
            });
        }

        console.log(`\n=== Upload Image Request ===`);
        console.log(`Image size: ${imageFile.size} bytes`);

        // Upload image to IPFS
        const imageCID = await uploadImage(imageFile.buffer);

        // Construct image URL using server endpoint
        const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
        const imageURL = `${serverUrl}/api/image/${imageCID}`;

        console.log(`Image CID: ${imageCID}`);
        console.log(`=== Upload Complete ===\n`);

        res.json({
            success: true,
            imageCID,
            imageURL
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload image',
            message: error.message
        });
    }
});

/**
 * POST /api/upload-json
 * Upload generic JSON data to IPFS
 * 
 * Body: JSON object
 */
app.post('/api/upload-json', apiKeyAuth, async (req, res) => {
    try {
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                error: 'Missing or empty JSON body'
            });
        }

        console.log(`\n=== Upload JSON Request ===`);

        // Upload JSON to IPFS
        const dataCID = await uploadJSON(data);

        console.log(`Data CID: ${dataCID}`);
        console.log(`=== Upload Complete ===\n`);

        res.json({
            success: true,
            dataCID
        });
    } catch (error) {
        console.error('Upload JSON error:', error);
        res.status(500).json({
            error: 'Failed to upload JSON',
            message: error.message
        });
    }
});

/**
 * POST /api/upload
 * Legacy support: Upload name, description, and image to IPFS
 * 
 * Form data:
 * - name: string
 * - description: string
 * - image: file
 */
app.post('/api/upload', apiKeyAuth, upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const imageFile = req.file;

        // Validation
        if (!name || !description || !imageFile) {
            return res.status(400).json({
                error: 'Missing required fields: name, description, and image are required'
            });
        }

        console.log(`\n=== Upload Request ===`);
        console.log(`Name: ${name}`);
        console.log(`Description: ${description}`);
        console.log(`Image size: ${imageFile.size} bytes`);

        // Upload image to IPFS
        const imageCID = await uploadImage(imageFile.buffer);

        // Construct image URL using server endpoint
        const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
        const imageURL = `${serverUrl}/api/image/${imageCID}`;

        // Create JSON metadata
        const metadata = {
            name,
            description,
            image: imageCID,
            imageURL,
            timestamp: new Date().toISOString(),
        };

        // Upload JSON to IPFS
        const dataCID = await uploadJSON(metadata);

        console.log(`Data CID: ${dataCID}`);
        console.log(`Image CID: ${imageCID}`);
        console.log(`=== Upload Complete ===\n`);

        // Return CIDs
        res.json({
            success: true,
            dataCID,
            imageCID,
            imageURL,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload to IPFS',
            message: error.message
        });
    }
});

/**
 * GET /api/data/:cid
 * Retrieve JSON data from IPFS by CID
 */
app.get('/api/data/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        console.log(`\n=== Retrieving Data ===`);
        console.log(`CID: ${cid}`);

        const data = await getJSON(cid);

        console.log(`Data retrieved successfully`);
        console.log(`=== Retrieval Complete ===\n`);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Data retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve data from IPFS',
            message: error.message
        });
    }
});

/**
 * GET /api/image/:cid
 * Retrieve image from IPFS by CID
 */
app.get('/api/image/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        console.log(`\n=== Retrieving Image ===`);
        console.log(`CID: ${cid}`);

        const imageData = await getImage(cid);

        console.log(`Image retrieved successfully (${imageData.length} bytes)`);
        console.log(`=== Retrieval Complete ===\n`);

        // Set appropriate content type
        res.set('Content-Type', 'image/jpeg');
        res.send(Buffer.from(imageData));
    } catch (error) {
        console.error('Image retrieval error:', error);
        res.status(500).json({
            error: 'Failed to retrieve image from IPFS',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Initialize Helia and start server
async function startServer() {
    try {
        console.log('Starting IPFS server...');

        // Initialize Helia
        await initializeHelia();

        const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

        // Start Express server
        app.listen(PORT, host, () => {
            console.log(`\n✅ IPFS server running on http://${host}:${PORT}`);
            console.log(`\nAvailable endpoints:`);
            console.log(`  GET  /health`);
            console.log(`  POST /api/upload-image`);
            console.log(`  POST /api/upload-json`);
            console.log(`  POST /api/upload (Legacy)`);
            console.log(`  GET  /api/data/:cid`);
            console.log(`  GET  /api/image/:cid\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nShutting down server...');
    await shutdown();
    process.exit(0);
});

// Start the server
startServer();
