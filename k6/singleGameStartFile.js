const fs = require('fs');
const path = require('path');

// Configuration
const maxVUs = 2; // Adjust this to match the maximum number of virtual users
const inputFilePrefix = 'gameStart'; // File prefix, e.g., validateTambola1.json
const outputFile = 'gameStart.json'; // Output consolidated file
const baseDir = __dirname; // Directory where the files are located (current directory)

// Consolidated data object
const consolidatedData = {};

const usersFilePath = path.join(__dirname, "players.json");
const usersData = fs.readFileSync(usersFilePath, 'utf8');
const players = JSON.parse(usersData);

// Read and consolidate files
for (let i = 1; i <= maxVUs; i++) {
  const fileName = `${inputFilePrefix}${players[i -1]}.json`;
  const filePath = path.join(baseDir, fileName);

  if (fs.existsSync(filePath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      consolidatedData[i.toString()] = fileData; // Use VU number as key (string)
    } catch (e) {
      console.error(`Error reading or parsing ${fileName}: ${e.message}`);
    }
  } else {
    console.warn(`File ${fileName} not found, skipping...`);
  }
}

// Write the consolidated data to a single file
try {
  fs.writeFileSync(outputFile, JSON.stringify(consolidatedData, null, 2), 'utf8');
  console.log(`Successfully consolidated data into ${outputFile}`);
} catch (e) {
  console.error(`Error writing ${outputFile}: ${e.message}`);
}