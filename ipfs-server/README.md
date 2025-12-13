# IPFS Server

Node.js server for handling IPFS operations using Helia. Provides REST API endpoints for uploading and retrieving data from IPFS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (optional):
```bash
# .env file is already created with defaults
PORT=3001

# Server URL for generating gateway URLs
# For local development:
SERVER_URL=http://localhost:3001

# For production (after deployment):
# SERVER_URL=https://your-ipfs-server.railway.app
```

## Running the Server

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Upload Data
```
POST /api/upload
Content-Type: multipart/form-data

Fields:
- name: string
- description: string
- image: file (jpeg/png)

Response:
{
  "success": true,
  "dataCID": "bafyrei...",
  "imageCID": "bafkrei...",
  "imageURL": "https://ipfs.io/ipfs/bafkrei..."
}
```

### Get JSON Data
```
GET /api/data/:cid

Response:
{
  "success": true,
  "data": {
    "name": "...",
    "description": "...",
    "image": "...",
    "imageURL": "...",
    "timestamp": "..."
  }
}
```

### Get Image
```
GET /api/image/:cid

Response: Binary image data (image/jpeg)
```

## Testing

Test with curl:

```bash
# Health check
curl http://localhost:3001/health

# Upload (replace with actual image path)
curl -X POST http://localhost:3001/api/upload \
  -F "name=Test Upload" \
  -F "description=Testing IPFS upload" \
  -F "image=@/path/to/image.jpg"

# Get data (replace CID)
curl http://localhost:3001/api/data/bafyrei...

# Get image (replace CID)
curl http://localhost:3001/api/image/bafkrei... --output image.jpg
```

## Architecture

- **server.js** - Express server with API routes
- **ipfs-client.js** - Helia IPFS client utilities
- **package.json** - Dependencies and scripts
- **.env** - Environment configuration

## Dependencies

- `express` - Web server framework
- `helia` - IPFS implementation for Node.js
- `@helia/unixfs` - File system operations
- `@helia/json` - JSON operations
- `multer` - File upload handling
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables

## Notes

- Helia initializes on first request (may take a few seconds)
- Data is stored on IPFS network and retrievable via CID
- Server handles graceful shutdown with SIGINT/SIGTERM
