const fs = require('fs');
const path = require('path');

console.log('Checking Firebase configuration...\n');

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
const envPath = path.resolve(__dirname, '../.env');

let hasConfig = false;

// Check for service account key file
if (fs.existsSync(serviceAccountPath)) {
  try {
    const keyFile = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (keyFile.type === 'service_account' && keyFile.project_id) {
      console.log('✅ Found serviceAccountKey.json');
      console.log(`   Project ID: ${keyFile.project_id}`);
      hasConfig = true;
    } else {
      console.log('⚠️  serviceAccountKey.json exists but appears invalid');
    }
  } catch (error) {
    console.log('⚠️  serviceAccountKey.json exists but could not be parsed');
  }
} else {
  console.log('❌ serviceAccountKey.json not found');
  console.log('   Expected location: ' + serviceAccountPath);
}

// Check for .env file
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('FIREBASE_SERVICE_ACCOUNT_JSON') || 
      envContent.includes('FIREBASE_CLIENT_EMAIL')) {
    console.log('\n✅ Found .env file with Firebase configuration');
    hasConfig = true;
  } else {
    console.log('\n⚠️  .env file exists but no Firebase configuration found');
  }
} else {
  console.log('\n❌ .env file not found');
  console.log('   Expected location: ' + envPath);
}

// Check environment variables
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || 
    (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)) {
  console.log('\n✅ Firebase environment variables are set');
  hasConfig = true;
}

if (!hasConfig) {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('Firebase is not configured. Follow these steps:\n');
  console.log('STEP 1: Get Firebase Service Account Key');
  console.log('  1. Go to: https://console.firebase.google.com/');
  console.log('  2. Select or create a project');
  console.log('  3. Click gear icon → Project Settings');
  console.log('  4. Go to "Service Accounts" tab');
  console.log('  5. Click "Generate New Private Key"');
  console.log('  6. Save the downloaded JSON file\n');
  console.log('STEP 2: Place the key file');
  console.log('  Save it as: NodeBackend/serviceAccountKey.json');
  console.log('  Full path: ' + serviceAccountPath + '\n');
  console.log('STEP 3: Run the seed script again');
  console.log('  npm run seed:firestore\n');
  console.log('═══════════════════════════════════════════════════════════');
  process.exit(1);
} else {
  console.log('\n✅ Firebase appears to be configured correctly!');
  console.log('You can now run: npm run seed:firestore');
  process.exit(0);
}

