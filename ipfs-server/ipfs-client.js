import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';

/**
 * IPFS client using Helia (full Node.js implementation)
 */

let heliaInstance = null;
let fsInstance = null;

/**
 * Initialize Helia instance
 */
export async function initializeHelia() {
    if (!heliaInstance) {
        console.log('Initializing Helia...');
        heliaInstance = await createHelia();
        fsInstance = unixfs(heliaInstance);
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
        // Convert JSON to UTF-8 bytes for UnixFS storage
        const jsonString = JSON.stringify(data);
        const encoder = new TextEncoder();
        const bytes = encoder.encode(jsonString);

        const cid = await fsInstance.addBytes(bytes);
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
        // Retrieve bytes using UnixFS
        const chunks = [];
        for await (const chunk of fsInstance.cat(cidString)) {
            chunks.push(chunk);
        }

        // Concatenate all chunks
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        // Decode UTF-8 bytes to string and parse JSON
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(result);
        const data = JSON.parse(jsonString);

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
 * Shutdown Helia instance
 */
export async function shutdown() {
    if (heliaInstance) {
        console.log('Shutting down Helia...');
        await heliaInstance.stop();
        heliaInstance = null;
        fsInstance = null;
        console.log('Helia shut down successfully');
    }
}
