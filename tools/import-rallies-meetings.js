const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {DateTime} = require('luxon');
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

function parseCustomDate(dateStr) {
    const date = DateTime.fromFormat("October 18th, 2020 11:00am", "MMMM d'th', yyyy h:mma");
    return date.toJSDate();
}

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
async function createOrFindUser(userData) {
    const usersCollection = db.collection('users');

    if (!userData || !userData.name) {
        console.warn("Missing user data or name");
        return null;
    }

    const userPictureUrl = userData.img ? await processFileUrl(userData.img, 'pictures') : null;

    // Check if user already exists
    const userQuery = await usersCollection.where('displayName', '==', userData.name).get();
    let userRef;

    if (!userQuery.empty) {
        userRef = userQuery.docs[0].ref;
        console.log(`Found existing user: ${userData.name} with ID: ${userRef.id}`);
    } else {
        userRef = await usersCollection.add({
            displayName: userData.name,
            picture: userPictureUrl,
            bio: userData.tagline || '',
            email: `${userData.name.toLowerCase().replace(/\s+/g, '.')}@example.com`, // Dummy email
            roles: userData.roles || [], // Default role for users
        });
        console.log(`Created user: ${userData.name} with ID: ${userRef.id}`);
    }

    return userRef;
}

// Helper function to create or find a term in a taxonomy
async function createOrFindTerm(collection, name) {
    if (!name) {
        console.warn(`Missing term name for collection ${collection}`);
        return null;
    }

    const termCollection = db.collection(collection);

    // Check if term already exists
    const termQuery = await termCollection.where('name', '==', name).get();
    let termRef;

    if (!termQuery.empty) {
        termRef = termQuery.docs[0].ref;
        console.log(`Found existing ${collection} term: ${name} with ID: ${termRef.id}`);
    } else {
        termRef = await termCollection.add({
            name: name,
            description: `${name} ${collection.replace(/_/g, ' ')}`,
        });
        console.log(`Created ${collection} term: ${name} with ID: ${termRef.id}`);
    }

    return termRef;
}

// Helper function to create or find multiple terms
async function createOrFindMultipleTerms(collection, names) {
    const refs = [];

    if (names && Array.isArray(names)) {
        for (const name of names) {
            const ref = await createOrFindTerm(collection, name);
            if (ref) refs.push(ref);
        }
    }

    return refs;
}

// Function to create or update a meeting
async function createOrUpdateMeeting(rallyRef, meetingData) {
    if (!meetingData || !meetingData.title) {
        console.warn("Missing meeting data or title");
        return null;
    }

    console.log(`Processing meeting: ${meetingData.title}`);

    // Process meeting metadata
    const meetingsCollection = rallyRef.collection('meetings');

    // Find or create author/hosts/speakers
    let authorRef = null;
    if (meetingData.author && Array.isArray(meetingData.author) && meetingData.author.length > 0) {
        authorRef = await createOrFindUser(meetingData.author[0]);
    }

    // Process hosts
    const hostRefs = [];
    if (meetingData.hosts && Array.isArray(meetingData.hosts)) {
        for (const host of meetingData.hosts) {
            const hostRef = await createOrFindUser(host);
            if (hostRef) hostRefs.push(hostRef);
        }
    }

    // Process speakers
    const speakerRefs = [];
    if (meetingData.speakers && Array.isArray(meetingData.speakers)) {
        for (const speaker of meetingData.speakers) {
            const speakerRef = await createOrFindUser(speaker);
            if (speakerRef) speakerRefs.push(speakerRef);
        }
    }

    // Create or find city
    let cityRef = null;
    if (meetingData.city) {
        // TODO: handle Oakland - LA, CA as both Oakland, CA and Los Angeles, CA
        cityRef = await createOrFindTerm('cities', meetingData.city);
    }

    // Create or find meeting type
    let meetingTypeRef = null;
    if (meetingData.type) {
        meetingTypeRef = await createOrFindTerm('meeting_types', meetingData.type);
    }

    // Format the agenda JSON if it exists
    let agendaItems = [];
    if (meetingData.lineItems && Array.isArray(meetingData.lineItems)) {
        // Ensure all seconds values are properly formatted as integers
        agendaItems = meetingData.lineItems.map(item => ({
            ...item,
            seconds: item.seconds ? item.seconds : 0,
            countdown: item.countdown ? item.countdown : 0
        }));
    }
    const agendaJSON = JSON.stringify(agendaItems);

    // Parse start date
    let startDate = new Date();
    if (meetingData.start === 'tomorrow') {
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(10, 0, 0, 0); // Set it to 10 AM
    } else if (meetingData.start) {
        if (meetingData.start.indexOf(" - ") > -1) {
            startDate = parseCustomDate(meetingData.start.split(' - ')[0]);
        } else {
            startDate = parseCustomDate(meetingData.start);
        }
    }

    // End date is start date + duration (from the agenda)
    const totalDurationSeconds = !meetingData.lineItems ? 0 : meetingData.lineItems.reduce((total, item) => total + (item.seconds || 0), 0);
    const endDate = new Date(startDate.getTime() + (totalDurationSeconds * 1000));

    // Check if meeting already exists
    const meetingQuery = await meetingsCollection.where('title', '==', meetingData.title).get();
    let meetingRef;

    const meetingObject = {
        title: meetingData.title,
        city: cityRef,
        meeting_type: meetingTypeRef,
        speakers: speakerRefs,
        moderators: hostRefs.length > 0 ? [hostRefs[0]] : [], // Using the first host as moderator
        postal_address: meetingData.postal_address || '',
        meeting_link: meetingData.meetinglink || meetingData.meeting_link || '',
        start_end_times: {
            date_start: admin.firestore.Timestamp.fromDate(startDate),
            date_end: admin.firestore.Timestamp.fromDate(endDate),
        },
        rallyRef: rallyRef,
        agenda: agendaJSON,
        duration: totalDurationSeconds
    };

    // Add author if available
    if (authorRef) {
        meetingObject.author = authorRef;
    }

    if (!meetingQuery.empty) {
        meetingRef = meetingQuery.docs[0].ref;
        console.log(`Found existing meeting: ${meetingData.title} with ID: ${meetingRef.id}`);

        // Update the meeting
        await meetingRef.update(meetingObject);
        console.log(`Updated meeting: ${meetingData.title}`);
    } else {
        meetingRef = await meetingsCollection.add(meetingObject);
        console.log(`Created meeting: ${meetingData.title} with ID: ${meetingRef.id}`);
    }

    return meetingRef;
}

// Function to import data from JSON files
async function importData(filePath) {
    try {
        // Read the rally data
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        console.log(`Importing data from ${filePath}...`);
        console.log('Data title:', data.title);

        // Determine if this is a rally with meetings or a standalone meeting
        const isRally = data.meetings;

        if (isRally) {
            // This is a rally data file (like index.json)
            return importRally(data);
        } else {
            // This is a meeting data file (like how-to-get-things-built-day-1.json)
            return importStandaloneMeeting(data);
        }
    } catch (error) {
        console.error('Error importing data:', error);
        return {success: false, error: error.message};
    }
}

// Function to import a rally with multiple meetings
async function importRally(rallyData) {
    try {
        // Process files if using Firebase Storage
        const profileImageUrl = await processFileUrl(rallyData.profile, 'rally_picture');
        const promoVideoUrl = await processFileUrl(rallyData.videofile, 'promo_video');

        // Create or find author user
        let authorRef = null;
        if (rallyData.author && Array.isArray(rallyData.author) && rallyData.author.length > 0) {
            authorRef = await createOrFindUser(rallyData.author[0]);
        }

        // Add host users
        const hostRefs = [];
        if (rallyData.hosts && Array.isArray(rallyData.hosts)) {
            for (const host of rallyData.hosts) {
                const hostRef = await createOrFindUser(host);
                if (hostRef) hostRefs.push(hostRef);
            }
        }

        // Process taxonomy terms
        const topicRefs = await createOrFindMultipleTerms('topics', rallyData.topics);
        const stakeholderRefs = await createOrFindMultipleTerms('stakeholders', rallyData.stakeholders);
        const wiseRefs = await createOrFindMultipleTerms('wise_democracy', rallyData.wisedemo);

        // Create or find city
        let cityRef = null;
        if (rallyData.city) {
            cityRef = await createOrFindTerm('cities', rallyData.city);
        }

        // Process research_json
        const researchItems = [];
        if (rallyData.research_json && Array.isArray(rallyData.research_json)) {
            for (const research of rallyData.research_json) {
                const researchImageUrl = await processFileUrl(research.img, 'research_images');

                researchItems.push({
                    ...research,
                    img: researchImageUrl
                });
            }
        }

        // Create or update the rally
        const ralliesCollection = db.collection('rallies');

        // Check if rally already exists
        const rallyQuery = await ralliesCollection.where('title', '==', rallyData.title).get();
        let rallyRef;

        if (!rallyQuery.empty) {
            rallyRef = rallyQuery.docs[0].ref;
            console.log(`Found existing rally: ${rallyData.title} with ID: ${rallyRef.id}`);

            // Update the rally
            await rallyRef.update({
                title: rallyData.title,
                description: rallyData.desc,
                summary: rallyData.summary || '',
                picture: profileImageUrl || null,
                promo_video: promoVideoUrl || null,
                topics: topicRefs,
                wise_demo: wiseRefs,
                stakeholders: stakeholderRefs,
                research: JSON.stringify(researchItems),
                city: cityRef,
            });

            // Add author if available
            if (authorRef) {
                await rallyRef.update({author: authorRef});
            }

            console.log(`Updated rally: ${rallyData.title}`);
        } else {
            const rallyObject = {
                title: rallyData.title,
                description: rallyData.desc,
                summary: rallyData.summary || '',
                picture: profileImageUrl || null,
                promo_video: promoVideoUrl || null,
                topics: topicRefs,
                wise_demo: wiseRefs,
                stakeholders: stakeholderRefs,
                research: JSON.stringify(researchItems),
                city: cityRef,
            };

            // Add author if available
            if (authorRef) {
                rallyObject.author = authorRef;
            }

            rallyRef = await ralliesCollection.add(rallyObject);
            console.log(`Created rally: ${rallyData.title} with ID: ${rallyRef.id}`);
        }

        // Process meetings if they exist
        const meetingRefs = [];
        if (rallyData.meetings && Array.isArray(rallyData.meetings)) {
            for (const meetingData of rallyData.meetings) {
                // Ensure meeting has title from rally if not specified
                if (meetingData.lineItems) {
                    const meetingRef = await createOrUpdateMeeting(rallyRef, meetingData);
                    if (meetingRef) meetingRefs.push(meetingRef);
                }
            }
        }

        console.log('Rally data import completed successfully!');
        return {
            success: true,
            rallyId: rallyRef.id,
            meetingCount: meetingRefs.length,
            meetingIds: meetingRefs.map(ref => ref.id)
        };
    } catch (error) {
        console.error('Error importing rally:', error);
        return {success: false, error: error.message};
    }
}

// Function to import a standalone meeting
async function importStandaloneMeeting(meetingData) {
    try {
        // First, we need to determine which rally this meeting belongs to
        // We'll use the title to match with an existing rally, or create a new one

        const rallyTitle = meetingData.rally_title || meetingData.title.split(' - ')[0] || meetingData.title;

        const ralliesCollection = db.collection('rallies');
        const rallyQuery = await ralliesCollection.where('title', '==', rallyTitle).get();

        let rallyRef;
        if (!rallyQuery.empty) {
            rallyRef = rallyQuery.docs[0].ref;
            console.log(`Found existing rally: ${rallyTitle} with ID: ${rallyRef.id}`);
        } else {
            // Create a basic rally
            const profileImageUrl = await processFileUrl(meetingData.profile, 'rally_picture');

            rallyRef = await ralliesCollection.add({
                title: rallyTitle,
                description: meetingData.desc,
                summary: '',
                picture: profileImageUrl || null,
                promo_video: null,
                topics: [],
                wise_demo: [],
                stakeholders: [],
                research: '[]',
            });
            console.log(`Created new rally: ${rallyTitle} with ID: ${rallyRef.id}`);
        }

        // Now create or update the meeting
        const meetingRef = await createOrUpdateMeeting(rallyRef, meetingData);

        console.log('Standalone meeting import completed successfully!');
        return {
            success: true,
            rallyId: rallyRef.id,
            meetingId: meetingRef.id
        };
    } catch (error) {
        console.error('Error importing standalone meeting:', error);
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
