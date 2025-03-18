const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Directory containing JSON files to import
  dataDir: '../public/json',
  // Import script path
  importScriptPath: 'import-with-storage.js',
  // File extensions to process
  fileExtensions: ['.json'],
  // Enable/disable recursive directory scanning
  recursive: true,
  // Log level: 'minimal', 'normal', 'verbose'
  logLevel: 'normal',
  // Number of files to process in parallel (0 for sequential)
  concurrency: 0,
  // Timeout in milliseconds for each import (0 for no timeout)
  timeout: 300000 // 5 minutes
};

// Function to find all files recursively
function findAllFiles(dir, extensions = CONFIG.fileExtensions, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (CONFIG.recursive && stat.isDirectory()) {
      // Recursively search directories
      findAllFiles(filePath, extensions, results);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      // Add file if it matches the extension
      results.push(filePath);
    }
  }

  return results;
}

// Function to import a single file
function importFile(filePath) {
  if (CONFIG.logLevel !== 'minimal') {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`Processing ${filePath}...`);
    console.log(`${'-'.repeat(80)}`);
  }

  try {
    const command = `node ${CONFIG.importScriptPath} "${filePath}"`;
    const options = {
      stdio: CONFIG.logLevel === 'verbose' ? 'inherit' : 'pipe',
      timeout: CONFIG.timeout || undefined
    };

    const output = execSync(command, options);

    if (CONFIG.logLevel !== 'minimal' && output) {
      console.log(output.toString());
    }

    console.log(`✅ Successfully processed: ${path.basename(filePath)}`);
    return { success: true, file: filePath };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return { success: false, file: filePath, error: error.message };
  }
}

// Function to import files in sequence
async function importFilesSequentially(files) {
  const results = {
    success: [],
    failed: []
  };

  console.log(`Found ${files.length} files to process sequentially.`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`[${i + 1}/${files.length}] Processing file: ${file}`);

    const result = importFile(file);

    if (result.success) {
      results.success.push(file);
    } else {
      results.failed.push({ file, error: result.error });
    }
  }

  return results;
}

// Function to import files in parallel
async function importFilesInParallel(files, concurrency) {
  const results = {
    success: [],
    failed: []
  };

  console.log(`Found ${files.length} files to process with concurrency of ${concurrency}.`);

  // Process files in batches
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);

    console.log(`Processing batch ${Math.floor(i / concurrency) + 1}/${Math.ceil(files.length / concurrency)} (${batch.length} files)`);

    const promises = batch.map(file => {
      return new Promise(resolve => {
        try {
          const result = importFile(file);
          if (result.success) {
            results.success.push(file);
          } else {
            results.failed.push({ file, error: result.error });
          }
          resolve();
        } catch (error) {
          results.failed.push({ file, error: error.message });
          resolve();
        }
      });
    });

    await Promise.all(promises);
  }

  return results;
}

// Main function to process all files
async function processAllFiles() {
  try {
    // Validate data directory
    if (!fs.existsSync(CONFIG.dataDir)) {
      console.error(`Data directory '${CONFIG.dataDir}' does not exist.`);
      process.exit(1);
    }

    // Find all files to process
    const files = findAllFiles(CONFIG.dataDir);

    if (files.length === 0) {
      console.log(`No files with extensions ${CONFIG.fileExtensions.join(', ')} found in ${CONFIG.dataDir}`);
      process.exit(0);
    }

    // Sort files for consistent processing order
    files.sort();

    // Process files according to concurrency settings
    let results;
    if (CONFIG.concurrency > 1) {
      results = await importFilesInParallel(files, CONFIG.concurrency);
    } else {
      results = await importFilesSequentially(files);
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total files processed: ${files.length}`);
    console.log(`Successful imports: ${results.success.length}`);
    console.log(`Failed imports: ${results.failed.length}`);

    if (results.failed.length > 0) {
      console.log('\nFailed files:');
      results.failed.forEach(({ file, error }) => {
        console.log(`- ${file}: ${error}`);
      });
    }

    return results;
  } catch (error) {
    console.error('Error processing files:', error);
    process.exit(1);
  }
}

// Check command line arguments for custom data directory
const args = process.argv.slice(2);
if (args.length > 0) {
  CONFIG.dataDir = args[0];
}

// Run the script
console.log(`Starting batch import from ${CONFIG.dataDir}`);
console.log(`Recursive mode: ${CONFIG.recursive ? 'enabled' : 'disabled'}`);

processAllFiles()
  .then(results => {
    if (results.failed.length === 0) {
      console.log('\nAll files processed successfully!');
      process.exit(0);
    } else {
      console.error('\nSome imports failed. Check the logs for details.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Batch import failed:', error);
    process.exit(1);
  });
