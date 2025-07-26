import admin from 'firebase-admin';
import readline from 'readline';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, './serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'ima-gallery'
});

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createFirstAdmin() {
  console.log('🔥 Firebase Admin User Creation Script');
  console.log('=====================================\n');

  try {
    // Get admin details
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 chars): ');
    const name = await question('Enter admin full name: ');

    console.log('\nCreating admin user...');

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
      emailVerified: true
    });

    console.log(`✅ User created with UID: ${userRecord.uid}`);

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: email,
      name: name,
      role: 'admin',
      department: 'IT Administration',
      accessSuppliers: 'all',
      accessProducts: 'all',
      visibleFields: ['all'],
      preferences: {
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timezone: 'UTC',
        language: 'en'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);
    
    console.log('✅ Admin profile created in Firestore');
    console.log('\n🎉 Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Role: admin`);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

createFirstAdmin();
