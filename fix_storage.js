const fs = require('fs');

// Read the storage file
const content = fs.readFileSync('server/storage.ts', 'utf8');

// Find the first occurrence of "export class DatabaseStorage"
const firstClassIndex = content.indexOf('export class DatabaseStorage');
const secondClassIndex = content.indexOf('export class DatabaseStorage', firstClassIndex + 1);

if (secondClassIndex > -1) {
  // Find the end of the interface declaration before the duplicate
  const interfaceEnd = content.lastIndexOf('}', secondClassIndex);
  
  // Remove everything from the duplicate class onwards and add the export at the end
  const fixedContent = content.substring(0, interfaceEnd + 1) + '\n\nexport const storage = new DatabaseStorage();\n';
  
  fs.writeFileSync('server/storage.ts', fixedContent);
  console.log('Fixed duplicate DatabaseStorage class');
} else {
  console.log('No duplicate class found');
}