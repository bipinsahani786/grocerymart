const fs = require('fs');
const path = require('path');

// Models and their valid relations based on schema.prisma
const validRelations = {
  User: ['ownerProfile', 'vehicles', 'parkings', 'bookings', 'walletTxns', 'payouts', 'raisedDisputes', 'reviews', 'subscriptions'],
  OwnerProfile: ['user'],
  Vehicle: ['user'],
  Parking: ['user', 'slots', 'pricingRules', 'bookings', 'customAddons'],
  ParkingSlot: ['parking'],
  PricingRule: ['parking'],
  Booking: ['user', 'parking', 'disputes', 'addonBookings', 'reviews'],
  WalletTxn: ['user'],
  Payout: ['user'],
  Dispute: ['booking', 'raisedBy'],
  SystemSetting: [],
  CustomAddon: ['parking', 'bookings'],
  AddonBooking: ['booking', 'customAddon'],
  Review: ['booking', 'reviewer'],
  Subscription: ['user']
};

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if(file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });
  return arrayOfFiles;
}

const srcFiles = getAllFiles(path.join(__dirname, '../src'));

console.log("Analyzing includes...");
const regex = /prisma\.([a-zA-Z]+)\.(findUnique|findFirst|findMany|create|update)[^{]*{[\s\S]*?include:\s*{([^}]+)}/g;

let issuesFound = 0;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const model = match[1];
    const modelName = model.charAt(0).toUpperCase() + model.slice(1);
    const includeBlock = match[3];
    
    // Naive extraction of keys (e.g. `slots: true`, `user: { ... }`)
    const keys = includeBlock.match(/([a-zA-Z0-9_]+)\s*:/g);
    if (keys && validRelations[modelName]) {
      keys.forEach(k => {
        const keyName = k.replace(':', '').trim();
        if (keyName === 'where' || keyName === 'select' || keyName === 'include' || keyName === 'orderBy') return;
        
        if (!validRelations[modelName].includes(keyName)) {
           console.log(`Potential Issue in ${file}`);
           console.log(`Model: ${modelName}, Invalid Relation: '${keyName}'`);
           issuesFound++;
        }
      });
    }
  }
});

console.log(`Analysis complete. Issues found: ${issuesFound}`);
