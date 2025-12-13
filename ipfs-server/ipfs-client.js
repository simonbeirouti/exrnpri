import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { json } from '@helia/json';

/**
 * IPFS client using Helia (full Node.js implementation)
 */

let heliaInstance = null;
let fsInstance = null;
let jsonInstance = null;

/**
 * Initialize Helia instance
 */
export async function initializeHelia() {
    if (!heliaInstance) {
        console.log('Initializing Helia...');
        heliaInstance = await createHelia();
        fsInstance = unixfs(heliaInstance);
        jsonInstance = json(heliaInstance);
        console.log('Helia initialized successfully');
    }
    return heliaInstance;
}

/**
 * Upload image buffer to IPFS
 * @param {Buffer} buffer - Image buffer
 * @returns {Promise<string>} CID of uploaded image
 */
export async function uploadImage(buffer) {
    await initializeHelia();

    try {
        const cid = await fsInstance.addBytes(new Uint8Array(buffer));
        console.log('Image uploaded to IPFS:', cid.toString());
        return cid.toString();
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Upload JSON data to IPFS
 * @param {Object} data - JSON data to upload
 * @returns {Promise<string>} CID of uploaded JSON
 */
export async function uploadJSON(data) {
    await initializeHelia();

    try {
        const cid = await jsonInstance.add(data);
        console.log('JSON uploaded to IPFS:', cid.toString());
        return cid.toString();
    } catch (error) {
        console.error('Error uploading JSON:', error);
        throw error;
    }
}

/**
 * Retrieve JSON data from IPFS
 * @param {string} cidString - CID of the JSON data
 * @returns {Promise<Object>} Retrieved JSON data
 */
export async function getJSON(cidString) {
    await initializeHelia();

    try {
        const data = await jsonInstance.get(cidString);
        console.log('JSON retrieved from IPFS:', cidString);
        return data;
    } catch (error) {
        console.error('Error retrieving JSON:', error);
        throw error;
    }
}

/**
 * Retrieve image from IPFS
 * @param {string} cidString - CID of the image
 * @returns {Promise<Uint8Array>} Image data
 */
export async function getImage(cidString) {
    await initializeHelia();

    try {
        const chunks = [];
        for await (const chunk of fsInstance.cat(cidString)) {
            chunks.push(chunk);
        }

        // Concatenate all chunks into a single Uint8Array
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        console.log('Image retrieved from IPFS:', cidString);
        return result;
    } catch (error) {
        console.error('Error retrieving image:', error);
        throw error;
    }
}

/**
 * Get IPFS gateway URL
 * @param {string} cidString - CID
 * @returns {string} Gateway URL
 */
export function getGatewayURL(cidString) {
    const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
    return `${gateway}/${cidString}`;
}

/**
 * Shutdown Helia instance
 */
export async function shutdown() {
    if (heliaInstance) {
        console.log('Shutting down Helia...');
        await heliaInstance.stop();
        heliaInstance = null;
        fsInstance = null;
        jsonInstance = null;
        console.log('Helia shut down successfully');
    }
}
