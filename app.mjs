import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const userId = process.env.USER_ID;
const userSecret = process.env.USER_SECRET;
const apiKey = process.env.API_KEY;
const localFilePath = process.env.LOCAL_FILE_PATH;
const callbackURL = process.env.CALLBACK_URL;

function getFileContentBase64(filePath) {
    const fileContent = fs.readFileSync(filePath);
    return fileContent.toString('base64');
}

async function authenticate() {
    console.log('Starting authentication...');
    const url = 'https://api.res418.com/services/oauth2/token';
    const postData = JSON.stringify({ userId, userSecret });

    try {
        const response = await axios.post(url, postData, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('Authentication successful');
        return response.data.access_token;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

async function scanFile(accessToken, fileContentBase64) {
    console.log('Initiating file scan...');
    const url = 'https://api.res418.com/filesecure/standard/single/scan';
    const data = {
        fileContent: fileContentBase64,
        metadata: {
            fileName: localFilePath.split('/').pop(),
            contentType: "text/plain", // Update this as per the file type
            callbackUrl: callbackURL,
            fileId: "file123", // Update as needed
            origin: "user-upload",
            originId: "origin123", // Update as needed
            companyName: "ExampleCompany",
            requestingUser: "user@example.com",
            fileOwnerUser: "owner@example.com"
        },
        admin: {
            email: "admin@example.com"
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'x-api-key': apiKey,
                'x-access-token': accessToken
            },
            maxBodyLength: Infinity
        });

        console.log('File scan initiated successfully:', response.data);
    } catch (error) {
        console.error('Error initiating file scan:', error);
        throw error;
    }
}

async function main() {
    try {
        const accessToken = await authenticate();
        const fileContentBase64 = getFileContentBase64(localFilePath);
        await scanFile(accessToken, fileContentBase64);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
