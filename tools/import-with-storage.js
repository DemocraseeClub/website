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
    if (!url || url === false || url.startsWith('/')) {
        // Skip local file paths, boolean false, or empty urls
        return null;
    }

    if (!CONFIG.useFirebaseStorage) {
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

// Function to import data from JSON files
async function importData(filePath) {
    try {
        // Read the rally data
        const rallyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Importing data from ${filePath}...`);
        console.log('Rally title:', rallyData.title);

        // Process files if using Firebase Storage
        const profileImageUrl = await processFileUrl(rallyData.profile, 'rally_picture');
        const promoVideoUrl = await processFileUrl(rallyData.videofile, 'promo_video');

        // 1. Create or update users first (for author, hosts, speakers)
        const usersCollection = db.collection('users');

        // Add the author user
        const authorUser = rallyData.author[0];
        const authorPictureUrl = await processFileUrl(authorUser.img, 'pictures');

        // Check if author already exists
        let authorRef;
        const authorQuery = await usersCollection.where('displayName', '==', authorUser.name).get();
        if (!authorQuery.empty) {
            authorRef = authorQuery.docs[0].ref;
            console.log(`Found existing author: ${authorUser.name} with ID: ${authorRef.id}`);
        } else {
            authorRef = await usersCollection.add({
                displayName: authorUser.name,
                picture: authorPictureUrl,
                email: `${authorUser.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Dummy email
                roles: ['editor'], // Default role for authors
            });
            console.log(`Created author: ${authorUser.name} with ID: ${authorRef.id}`);
        }

        // Add host users
        const hostRefs = [];
        for (const host of rallyData.hosts) {
            const hostPictureUrl = await processFileUrl(host.img, 'pictures');

            // Check if host already exists
            const hostQuery = await usersCollection.where('displayName', '==', host.name).get();
            let hostRef;

            if (!hostQuery.empty) {
                hostRef = hostQuery.docs[0].ref;
                console.log(`Found existing host: ${host.name} with ID: ${hostRef.id}`);
            } else {
                hostRef = await usersCollection.add({
                    displayName: host.name,
                    picture: hostPictureUrl,
                    bio: host.tagline,
                    email: `${host.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Dummy email
                    roles: ['editor'], // Default role for hosts
                });
                console.log(`Created host: ${host.name} with ID: ${hostRef.id}`);
            }
            hostRefs.push(hostRef);
        }

        // Add speaker users
        const speakerRefs = [];
        if (rallyData.speakers && Array.isArray(rallyData.speakers)) {
            for (const speaker of rallyData.speakers) {
                const speakerPictureUrl = speaker.img !== false ?
                    await processFileUrl(speaker.img, 'pictures') : null;

                // Check if speaker already exists
                const speakerQuery = await usersCollection.where('displayName', '==', speaker.name).get();
                let speakerRef;

                if (!speakerQuery.empty) {
                    speakerRef = speakerQuery.docs[0].ref;
                    console.log(`Found existing speaker: ${speaker.name} with ID: ${speakerRef.id}`);
                } else {
                    speakerRef = await usersCollection.add({
                        displayName: speaker.name,
                        bio: speaker.tagline,
                        picture: speakerPictureUrl,
                        email: `${speaker.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Dummy email
                    });
                    console.log(`Created speaker: ${speaker.name} with ID: ${speakerRef.id}`);
                }
                speakerRefs.push(speakerRef);
            }
        }


        // 2. Create topics
        const topicsCollection = db.collection('topics');
        const topicRefs = [];
        if (rallyData.topics && Array.isArray(rallyData.topics)) {
            for (const topicName of rallyData.topics) {
                // Check if topic already exists
                const topicQuery = await topicsCollection.where('name', '==', topicName).get();
                let topicRef;

                if (!topicQuery.empty) {
                    topicRef = topicQuery.docs[0].ref;
                    console.log(`Found existing topic: ${topicName} with ID: ${topicRef.id}`);
                } else {
                    topicRef = await topicsCollection.add({
                        name: topicName,
                    });
                    console.log(`Created topic: ${topicName} with ID: ${topicRef.id}`);
                }
                topicRefs.push(topicRef);
            }
        }

        // 3. Create stakeholders
        const stakeholdersCollection = db.collection('stakeholders');
        const stakeholderRefs = [];
        if (rallyData.stakeholders && Array.isArray(rallyData.stakeholders)) {
            for (const stakeholderName of rallyData.stakeholders) {
                // Check if stakeholder already exists
                const stakeholderQuery = await stakeholdersCollection.where('name', '==', stakeholderName).get();
                let stakeholderRef;

                if (!stakeholderQuery.empty) {
                    stakeholderRef = stakeholderQuery.docs[0].ref;
                    console.log(`Found existing stakeholder: ${stakeholderName} with ID: ${stakeholderRef.id}`);
                } else {
                    stakeholderRef = await stakeholdersCollection.add({
                        name: stakeholderName,
                    });
                    console.log(`Created stakeholder: ${stakeholderName} with ID: ${stakeholderRef.id}`);
                }
                stakeholderRefs.push(stakeholderRef);
            }
        }

        // 4. Create wise_democracy items
        const wiseCollection = db.collection('wise_democracy');
        const wiseRefs = [];
        if (rallyData.wisedemo && Array.isArray(rallyData.wisedemo)) {
            for (const wiseName of rallyData.wisedemo) {
                // Check if wise democracy item already exists
                const wiseQuery = await wiseCollection.where('name', '==', wiseName).get();
                let wiseRef;

                if (!wiseQuery.empty) {
                    wiseRef = wiseQuery.docs[0].ref;
                    console.log(`Found existing wise democracy item: ${wiseName} with ID: ${wiseRef.id}`);
                } else {
                    wiseRef = await wiseCollection.add({
                        name: wiseName,
                        description: `${wiseName} principle of wise democracy`,
                    });
                    console.log(`Created wise democracy item: ${wiseName} with ID: ${wiseRef.id}`);
                }
                wiseRefs.push(wiseRef);
            }
        }

        // 5. Create city
        const citiesCollection = db.collection('cities');
        let cityRef;
        // Check if the city already exists
        if (!rallyData.city) {
            console.warn("NO CITY LISTED!")
        } else {
            const cityQuerySnapshot = await citiesCollection.where('name', '==', rallyData.city).get();
            if (cityQuerySnapshot.empty) {
                cityRef = await citiesCollection.add({
                    name: rallyData.city,
                });
                console.log(`Created city: ${rallyData.city} with ID: ${cityRef.id}`);
            } else {
                cityRef = cityQuerySnapshot.docs[0].ref;
                console.log(`Found existing city: ${rallyData.city} with ID: ${cityRef.id}`);
            }
        }


        // 6. Create meeting type
        const meetingTypesCollection = db.collection('meeting_types');
        let meetingTypeRef;
        if (!rallyData.type) {
            console.warn("NO CITY LISTED!")
        } else {
            // Check if the meeting type already exists
            const typeQuerySnapshot = await meetingTypesCollection.where('type', '==', rallyData.type).get();
            if (typeQuerySnapshot.empty) {
                meetingTypeRef = await meetingTypesCollection.add({
                    type: rallyData.type,
                });
                console.log(`Created meeting type: ${rallyData.type} with ID: ${meetingTypeRef.id}`);
            } else {
                meetingTypeRef = typeQuerySnapshot.docs[0].ref;
                console.log(`Found existing meeting type: ${rallyData.type} with ID: ${meetingTypeRef.id}`);
            }
        }

        // 7. Process research_json
        const researchItems = [];
        if (rallyData.research_json) {
            for (const research of rallyData.research_json) {
                const researchImageUrl = await processFileUrl(research.img, 'research_images');

                researchItems.push({
                    ...research,
                    img: researchImageUrl
                });
            }
        }

        // 8. Now create the rally
        const ralliesCollection = db.collection('rallies');

        // Check if rally already exists
        const rallyQuery = await ralliesCollection.where('title', '==', rallyData.title).get();
        let rallyRef;

        if (!rallyQuery.empty) {
            rallyRef = rallyQuery.docs[0].ref;
            console.log(`Found existing rally: ${rallyData.title} with ID: ${rallyRef.id}`);

            // Update the rally
            await rallyRef.update({
                author: authorRef,
                title: rallyData.title,
                description: rallyData.desc,
                summary: '',
                picture: profileImageUrl || null,
                promo_video: promoVideoUrl || null,
                topics: topicRefs,
                wise_demo: wiseRefs,
                stakeholders: stakeholderRefs,
                research: JSON.stringify(researchItems),
            });
            console.log(`Updated rally: ${rallyData.title}`);
        } else {
            rallyRef = await ralliesCollection.add({
                author: authorRef,
                title: rallyData.title,
                description: rallyData.desc,
                summary: '',
                picture: profileImageUrl || null,
                promo_video: promoVideoUrl || null,
                topics: topicRefs,
                wise_demo: wiseRefs,
                stakeholders: stakeholderRefs,
                research: JSON.stringify(researchItems),
            });
            console.log(`Created rally: ${rallyData.title} with ID: ${rallyRef.id}`);
        }

        // 9. Finally, create the meeting as a subcollection of the rally
        const meetingsCollection = rallyRef.collection('meetings');

        // Format the agenda JSON
        const agendaJSON = JSON.stringify(rallyData.lineItems || []);

        // Parse start date - assuming it's in a parseable format
        let startDate = new Date();
        if (rallyData.start === 'tomorrow') {
            startDate.setDate(startDate.getDate() + 1);
            startDate.setHours(10, 0, 0, 0); // Set it to 10 AM
        } else if (rallyData.start) {
            startDate = new Date(rallyData.start);
        }

        // End date is start date + duration (from the agenda)
        const totalDurationSeconds = !rallyData.lineItems ? 0 : rallyData.lineItems.reduce((total, item) => total + (parseInt(item.seconds) || 0), 0);
        const endDate = new Date(startDate.getTime() + (totalDurationSeconds * 1000));

        // Check if meeting already exists
        const meetingQuery = await meetingsCollection.where('title', '==', rallyData.title).get();
        let meetingRef;

        if (!meetingQuery.empty) {
            meetingRef = meetingQuery.docs[0].ref;
            console.log(`Found existing meeting: ${rallyData.title} with ID: ${meetingRef.id}`);

            // Update the meeting
            await meetingRef.update({
                author: authorRef,
                title: rallyData.title,
                city: cityRef,
                meeting_type: meetingTypeRef,
                speakers: speakerRefs,
                moderators: [hostRefs[0]], // Using the first host as moderator
                postal_address: '',
                meeting_link: rallyData.meetinglink || '',
                start_end_times: {
                    date_start: admin.firestore.Timestamp.fromDate(startDate),
                    date_end: admin.firestore.Timestamp.fromDate(endDate),
                },
                agenda: agendaJSON,
                duration: Math.ceil(totalDurationSeconds / 60), // Converting to minutes
            });
            console.log(`Updated meeting: ${rallyData.title}`);
        } else {
            meetingRef = await meetingsCollection.add({
                author: authorRef,
                title: rallyData.title,
                city: cityRef,
                meeting_type: meetingTypeRef,
                speakers: speakerRefs,
                moderators: [hostRefs[0]], // Using the first host as moderator
                postal_address: '',
                meeting_link: rallyData.meetinglink || '',
                start_end_times: {
                    date_start: admin.firestore.Timestamp.fromDate(startDate),
                    date_end: admin.firestore.Timestamp.fromDate(endDate),
                },
                agenda: agendaJSON,
                duration: Math.ceil(totalDurationSeconds / 60), // Converting to minutes
            });
            console.log(`Created meeting: ${rallyData.title} with ID: ${meetingRef.id}`);
        }

        console.log('Data import completed successfully!');
        return {success: true, rallyId: rallyRef.id, meetingId: meetingRef.id};
    } catch (error) {
        console.error('Error importing data:', error);
        return {success: false, error: error.message};
    }
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Please provide a path to the JSON file');
    console.log('Usage: node import-script.js <path-to-json-file>');
    process.exit(1);
}

// Run the import function
importData(args[0]).then((result) => {
    console.log('Import script execution finished', result);
    process.exit(0);
}).catch(error => {
    console.error('Import script failed:', error);
    process.exit(1);
});
