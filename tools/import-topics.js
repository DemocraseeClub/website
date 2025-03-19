const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {v4: uuidv4} = require('uuid');

// Configuration
const CONFIG = {
    // Set this to false if your service account doesn't have Storage permissions
    useFirebaseStorage: false,
    // Your Firebase project ID
    projectId: 'democraseeclub', // Replace with your project ID
    // Firebase Storage bucket name (only needed if useFirebaseStorage is true)
    storageBucket: 'democraseeclub.appspot.com' // Replace with your bucket name
};

// Initialize Firebase Admin SDK
// Make sure to have your service account credentials in a file named serviceAccountKey.json
const serviceAccount = require('/Users/trackauthoritymusic/Developer/tmt/agenda-timer/keys/democrasee-f8173-firebase-adminsdk-fbsvc-d2127b8a0f.json');


// Initialize Firebase with or without storage
if (CONFIG.useFirebaseStorage) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: CONFIG.storageBucket
    });
} else {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
db.settings({ignoreUndefinedProperties: true});
const bucket = CONFIG.useFirebaseStorage ? admin.storage().bucket() : null;

// Helper function to handle file URLs - either upload to Firebase Storage or just return the original URL
async function processFileUrl(url, storagePath) {
    if (!url || url === false) {
        // Skip local file paths, boolean false, or empty urls
        return null;
    }

    if (url.startsWith('/') || !CONFIG.useFirebaseStorage) {
        // Just return the original URL if we're not using Firebase Storage
        return url;
    }

    try {
        console.log(`Downloading file from ${url}...`);
        const tempFilePath = path.join(__dirname, 'temp', uuidv4());

        // Ensure temp directory exists
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
            fs.mkdirSync(path.join(__dirname, 'temp'));
        }

        // Download the file
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        // Determine content type
        const contentType = response.headers['content-type'];

        // Create file stream
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                console.log(`File downloaded to ${tempFilePath}, uploading to Firebase Storage...`);

                try {
                    // Upload to Firebase Storage
                    const fileExtension = contentType ?
                        contentType.split('/').pop() :
                        path.extname(url).slice(1) || 'jpg';
                    const fileName = `${uuidv4()}.${fileExtension}`;
                    const filePath = `${storagePath}/${fileName}`;

                    await bucket.upload(tempFilePath, {
                        destination: filePath,
                        metadata: {
                            contentType: contentType,
                            metadata: {
                                firebaseStorageDownloadTokens: uuidv4()
                            }
                        }
                    });

                    // Get the public URL
                    const fileRef = bucket.file(filePath);
                    const [metadata] = await fileRef.getMetadata();
                    const downloadToken = metadata.metadata.firebaseStorageDownloadTokens;
                    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

                    // Clean up temp file
                    fs.unlinkSync(tempFilePath);

                    console.log(`File uploaded to Firebase Storage: ${downloadUrl}`);
                    resolve(downloadUrl);
                } catch (error) {
                    // Clean up temp file
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                    console.error('Error uploading to Storage:', error);
                    // Fall back to the original URL if upload fails
                    resolve(url);
                }
            });

            writer.on('error', (error) => {
                // Clean up temp file
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
                console.error('Error downloading file:', error);
                // Fall back to the original URL if download fails
                resolve(url);
            });
        });
    } catch (error) {
        console.error(`Error processing file from ${url}:`, error);
        // Fall back to the original URL if any error occurs
        return url;
    }
}

// Helper function to create or find a user
async function createOrFindTopics(topicData) {
    const topicsCollection = db.collection('topics');

    if (!topicData || !topicData.name) {
        console.warn("Missing topic data or name");
        return null;
    }

    const userPictureUrl = topicData.icon ? await processFileUrl(topicData.icon, 'topics') : null;

    // Check if user already exists
    const topicQuery = await topicsCollection.where('name', '==', topicData.name).get();
    let topicRef;

    const topicObj = {
        icon: topicData.name,
        photo: userPictureUrl
    }

    if (!topicQuery.empty) {
        topicRef = topicQuery.docs[0].ref;
        await topicRef.update(topicObj);
        console.log(`Found existing user: ${topicData.name} with ID: ${topicRef.id}`);

    } else {
        topicRef = await topicsCollection.add(topicObj);
        console.log(`Created user: ${topicData.name} with ID: ${topicRef.id}`);
    }
    return topicRef;
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide a path to the JSON file');
    console.log('Usage: node import-script.js <path-to-json-file>');
    process.exit(1);
}


// Function to import data from JSON files
async function importTopic(filePath) {
    try {
        // Read the rally data
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Importing data from ${filePath}...`);
        console.log('Data title:', data.name);

        for(let i in data) {
            await createOrFindTopics(data[i]);
        }

    } catch (error) {
        console.error('Error importing data:', error);
        return {success: false, error: error.message};
    }
}

// Run the import function
importTopic(args[0]).then((result) => {
    console.log('Import script execution finished', result);
    process.exit(0);
}).catch(error => {
    console.error('Import script failed:', error);
    process.exit(1);
});
