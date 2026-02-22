#!/usr/bin/env node

/**
 * Unicode and Special Character Cleaner
 * 
 * This script removes unwanted unicode and special characters from source files
 * while preserving essential code characters and skipping node_modules, build artifacts, etc.
 * 
 * Usage:
 *   node clean-unicode.js              # Dry run (preview only)
 *   node clean-unicode.js --fix        # Actually fix files
 *   node clean-unicode.js --backup     # Create backups before fixing
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  dryRun: !process.argv.includes('--fix'),
  createBackup: process.argv.includes('--backup'),
  
  // Directories to skip
  excludeDirs: [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'out',
    'coverage',
    '.expo',
    'android',
    'ios',
    'uploads',
    '.turbo',
    '.cache',
    'prisma/migrations'
  ],
  
  // File extensions to process
  includeExtensions: [
    '.js', '.jsx', '.ts', '.tsx',
    '.json', '.md', '.txt',
    '.css', '.scss', '.html',
    '.prisma', '.env.example',
    '.sh', '.yml', '.yaml'
  ],
  
  // Files to skip
  excludeFiles: [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.gitignore',
    'clean-unicode.js'
  ]
};

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  charactersRemoved: 0,
  errors: []
};

/**
 * Check if a character is an unwanted unicode or special character
 * Keep: alphanumeric, common punctuation, code symbols
 */
function isUnwantedCharacter(char) {
  const code = char.charCodeAt(0);
  
  // Keep ASCII printable characters (32-126)
  if (code >= 32 && code <= 126) return false;
  
  // Keep newlines, tabs, carriage returns
  if (code === 10 || code === 13 || code === 9) return false;
  
  // Keep common unicode quotes if they're being used intentionally
  // But flag them for review
  if (code === 8216 || code === 8217 || code === 8220 || code === 8221) {
    return 'review'; // Smart quotes - convert to regular quotes
  }
  
  // Everything else is unwanted
  return true;
}

/**
 * Clean content by removing/replacing unwanted characters
 */
function cleanContent(content, filename) {
  let cleaned = '';
  let modificationsCount = 0;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const unwanted = isUnwantedCharacter(char);
    
    if (unwanted === true) {
      // Remove completely unwanted characters
      modificationsCount++;
    } else if (unwanted === 'review') {
      // Convert smart quotes to regular quotes
      const code = char.charCodeAt(0);
      if (code === 8216 || code === 8217) {
        cleaned += "'"; // Single quote
      } else if (code === 8220 || code === 8221) {
        cleaned += '"'; // Double quote
      }
      modificationsCount++;
    } else {
      // Keep the character
      cleaned += char;
    }
  }
  
  return { cleaned, modificationsCount };
}

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
  const dirName = path.basename(dirPath);
  return config.excludeDirs.some(excluded => 
    dirName === excluded || dirPath.includes(`/${excluded}/`) || dirPath.includes(`\\${excluded}\\`)
  );
}

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Check if file is excluded
  if (config.excludeFiles.includes(fileName)) return false;
  
  // Check if extension is included
  if (!config.includeExtensions.includes(ext)) return false;
  
  return true;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesScanned++;
  
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Clean content
    const { cleaned, modificationsCount } = cleanContent(content, filePath);
    
    if (modificationsCount > 0) {
      stats.filesModified++;
      stats.charactersRemoved += modificationsCount;
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`📝 ${relativePath}`);
      console.log(`   ⚠️  Found ${modificationsCount} unwanted character(s)`);
      
      if (!config.dryRun) {
        // Create backup if requested
        if (config.createBackup) {
          const backupPath = `${filePath}.backup`;
          fs.writeFileSync(backupPath, content, 'utf8');
          console.log(`   💾 Backup created: ${path.basename(backupPath)}`);
        }
        
        // Write cleaned content
        fs.writeFileSync(filePath, cleaned, 'utf8');
        console.log(`   ✅ File cleaned`);
      } else {
        console.log(`   ℹ️  Would be cleaned (use --fix to apply)`);
      }
      console.log('');
    }
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldExcludeDir(fullPath)) {
          processDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        if (shouldProcessFile(fullPath)) {
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Unicode and Special Character Cleaner\n');
  console.log('Configuration:');
  console.log(`  Mode: ${config.dryRun ? '🔍 DRY RUN (preview only)' : '🔧 FIX MODE (will modify files)'}`);
  console.log(`  Backup: ${config.createBackup ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`  Excluded dirs: ${config.excludeDirs.join(', ')}`);
  console.log(`  Processing: ${config.includeExtensions.join(', ')}`);
  console.log('');
  
  if (config.dryRun) {
    console.log('💡 This is a DRY RUN. No files will be modified.');
    console.log('   Use --fix to actually clean files');
    console.log('   Use --backup to create backups before cleaning\n');
  }
  
  console.log('Scanning files...\n');
  
  // Start processing from current directory
  const startTime = Date.now();
  processDirectory(process.cwd());
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`Files scanned:      ${stats.filesScanned}`);
  console.log(`Files with issues:  ${stats.filesModified}`);
  console.log(`Characters removed: ${stats.charactersRemoved}`);
  console.log(`Errors:             ${stats.errors.length}`);
  console.log(`Duration:           ${duration}s`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(({ file, error }) => {
      console.log(`  ${file}: ${error}`);
    });
  }
  
  if (config.dryRun && stats.filesModified > 0) {
    console.log('\n💡 To apply these changes, run:');
    console.log('   node clean-unicode.js --fix');
    console.log('\n💡 To create backups before applying:');
    console.log('   node clean-unicode.js --fix --backup');
  } else if (!config.dryRun && stats.filesModified > 0) {
    console.log('\n✅ Files have been cleaned!');
    if (config.createBackup) {
      console.log('💾 Backups saved with .backup extension');
    }
  } else if (stats.filesModified === 0) {
    console.log('\n✨ No issues found! Your files are clean.');
  }
  
  console.log('');
}

// Run the script
main();
