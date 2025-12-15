/**
 * IPFS client that communicates with Node.js server
 * Avoids React Native compatibility issues by delegating IPFS operations to a Node.js backend
 */

// Server URL - configured via environment variable
// For local: http://localhost:3001
// For production: https://your-deployed-server.com
const SERVER_URL = process.env.EXPO_PUBLIC_IPFS_SERVER_URL || 'http://localhost:3001';
const API_KEY = process.env.EXPO_PUBLIC_IPFS_API_KEY;

/**
 * Upload image file to IPFS via server
 * @param imageUri - Local URI of the image
 * @returns CID of the uploaded image
 */
export async function uploadImage(imageUri: string): Promise<string> {
    try {
        const formData = new FormData();

        // Add image file
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        } as any);

        const response = await fetch(`${SERVER_URL}/api/upload-image`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY || '',
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        return result.imageCID;
    } catch (error) {
        console.error('Error uploading image to IPFS:', error);
        throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get IPFS gateway URL for an image CID
 * @param cidString - CID string
 * @returns Gateway URL for image
 */
export function getIPFSGatewayURL(cidString: string): string {
    return `${SERVER_URL}/api/image/${cidString}`;
}

/**
 * Get IPFS data URL for a data CID (JSON metadata)
 * @param cidString - CID string
 * @returns URL for retrieving JSON data
 */
export function getIPFSDataURL(cidString: string): string {
    return `${SERVER_URL}/api/data/${cidString}`;
}

/**
 * Upload complete data object (name, description, image) to IPFS via server
 * @param name - Name field
 * @param description - Description field
 * @param imageUri - Local URI of the image
 * @returns Object containing the data CID and image CID
 */
export async function uploadData(
    name: string,
    description: string,
    imageUri: string
): Promise<{ dataCID: string; imageCID: string; imageURL: string }> {
    try {
        const formData = new FormData();

        // Add form fields
        formData.append('name', name);
        formData.append('description', description);

        // Add image file
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        } as any);

        console.log('Uploading to server:', SERVER_URL);

        const response = await fetch(`${SERVER_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY || '',
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();

        return {
            dataCID: result.dataCID,
            imageCID: result.imageCID,
            imageURL: result.imageURL,
        };
    } catch (error) {
        console.error('Error uploading data to IPFS:', error);
        throw new Error(`Failed to upload data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Retrieve JSON data from IPFS via server
 * @param cidString - CID string of the data to retrieve
 * @returns Retrieved JSON data
 */
export async function getJSON(cidString: string): Promise<any> {
    try {
        const response = await fetch(`${SERVER_URL}/api/data/${cidString}`, {
            headers: {
                'x-api-key': API_KEY || '',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Retrieval failed');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error retrieving JSON from IPFS:', error);
        throw new Error(`Failed to retrieve JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Upload generic JSON data to IPFS via server
 * @param data - JSON object to upload
 * @returns Object containing the data CID
 */
export async function uploadJSON(data: any): Promise<{ dataCID: string }> {
    try {
        const response = await fetch(`${SERVER_URL}/api/upload-json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY || '',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'JSON upload failed');
        }

        const result = await response.json();
        return {
            dataCID: result.dataCID,
        };
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error);
        throw new Error(`Failed to upload JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
