const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'models');

// Get all model files
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

// Update each model file
modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the import
  content = content.replace(
    /const \{ createModelAdapter \} = require\('\.\.\/utils\/ModelAdapter'\);/g,
    "const createFirebaseAdapter = require('../utils/FirebaseAdapter');"
  );
  
  // Replace the model creation
  content = content.replace(
    /const (\w+) = createModelAdapter\('(\w+)', (\w+Schema)\);/g,
    "const $1 = createFirebaseAdapter('$2');"
  );
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

console.log('All models updated to use Firebase!');