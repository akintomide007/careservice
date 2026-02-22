# Unicode and Special Character Cleaner Guide

A safe, automated tool to remove unwanted unicode and special characters from your project files while preserving code functionality.

##  What It Does

- **Removes**: Zero-width spaces, invisible characters, exotic unicode
- **Converts**: Smart quotes (", ") to regular quotes (", ')
- **Preserves**: All essential code characters, newlines, tabs
- **Skips**: node_modules, build artifacts, binary files

##  Quick Start

### 1. Preview Changes (Recommended First)
```bash
node clean-unicode.js
```
This shows what would be changed WITHOUT modifying files.

### 2. Clean Files
```bash
node clean-unicode.js --fix
```
This actually modifies the files.

### 3. Clean with Backups (Safest)
```bash
node clean-unicode.js --fix --backup
```
Creates `.backup` files before modifying originals.

##  Command Options

| Command | Description |
|---------|-------------|
| `node clean-unicode.js` | **Dry run** - Preview only, no changes |
| `node clean-unicode.js --fix` | **Fix mode** - Actually clean files |
| `node clean-unicode.js --backup` | Create backups (use with --fix) |
| `node clean-unicode.js --fix --backup` | **Safest** - Fix and backup |

##  Safety Features

### Automatically Skipped

**Directories:**
- `node_modules/` - Dependencies
- `.git/` - Version control
- `.next/`, `dist/`, `build/`, `out/` - Build outputs
- `coverage/`, `.expo/` - Generated files
- `android/`, `ios/` - Native mobile code
- `uploads/` - User content
- `prisma/migrations/` - Database migrations

**Files:**
- `package-lock.json` - Lock files
- `yarn.lock`, `pnpm-lock.yaml`
- Binary files (images, videos, etc.)

### Processed Files

Only these extensions are cleaned:
- Code: `.js`, `.jsx`, `.ts`, `.tsx`
- Styles: `.css`, `.scss`
- Markup: `.html`, `.md`
- Config: `.json`, `.yml`, `.yaml`, `.prisma`
- Scripts: `.sh`
- Docs: `.txt`, `.md`

##  Example Output

```
 Unicode and Special Character Cleaner

Configuration:
  Mode:  DRY RUN (preview only)
  Backup:  Disabled
  Excluded dirs: node_modules, .git, .next, dist, build...
  Processing: .js, .jsx, .ts, .tsx, .json, .md...

 This is a DRY RUN. No files will be modified.
   Use --fix to actually clean files
   Use --backup to create backups before cleaning

Scanning files...

 backend/src/utils/helpers.ts
     Found 3 unwanted character(s)
     Would be cleaned (use --fix to apply)

 README.md
     Found 12 unwanted character(s)
     Would be cleaned (use --fix to apply)

============================================================
 Summary
============================================================
Files scanned:      245
Files with issues:  2
Characters removed: 15
Errors:             0
Duration:           0.34s

 To apply these changes, run:
   node clean-unicode.js --fix

 To create backups before applying:
   node clean-unicode.js --fix --backup
```

##  What Gets Removed/Converted

### Removed Completely
- Zero-width spaces (U+200B)
- Non-breaking spaces (U+00A0) 
- Invisible characters
- Control characters (except tab, newline)
- Exotic unicode symbols not used in code

### Converted to Standard Characters
- Smart single quotes (' ')  Regular single quotes (')
- Smart double quotes (" ")  Regular double quotes (")

### Preserved
- ASCII printable characters (32-126): `A-Z a-z 0-9 !@#$%^&*()` etc.
- Newlines (`\n`)
- Tabs (`\t`)
- Carriage returns (`\r`)

##  Common Use Cases

### Case 1: After Copying from Word/Google Docs
```bash
# Preview what needs cleaning
node clean-unicode.js

# Clean the files
node clean-unicode.js --fix --backup
```

### Case 2: Fix Smart Quotes in Code
```bash
# Convert all smart quotes to regular quotes
node clean-unicode.js --fix
```

### Case 3: Remove Invisible Characters
```bash
# Remove zero-width spaces and other invisible characters
node clean-unicode.js --fix --backup
```

### Case 4: Before Committing to Git
```bash
# Check for any unicode issues
node clean-unicode.js

# If issues found, clean them
node clean-unicode.js --fix
git add .
git commit -m "Clean unicode characters"
```

##  Important Notes

### When to Use
-  After copying code from documents
-  When seeing weird spacing issues
-  Before deploying to production
-  When code looks fine but won't compile

### When NOT to Use
-  On files with intentional unicode (multilingual content)
-  On user-generated content
-  On binary files (handled automatically anyway)

### Best Practices
1. **Always run dry-run first** to preview changes
2. **Use --backup** if you're unsure
3. **Commit to git** before running with --fix
4. **Review the changes** after cleaning
5. **Test your code** after cleaning

##  Customization

To modify what gets cleaned, edit `clean-unicode.js`:

```javascript
// Add more directories to skip
excludeDirs: [
  'node_modules',
  'your-custom-dir'
]

// Add more file extensions to process
includeExtensions: [
  '.js', '.ts',
  '.your-extension'
]

// Add files to skip
excludeFiles: [
  'package-lock.json',
  'your-file.js'
]
```

##  Troubleshooting

### "Permission denied"
```bash
# Make script executable
chmod +x clean-unicode.js
```

### "No such file or directory"
```bash
# Run from project root directory
cd /path/to/your/project
node clean-unicode.js
```

### Too many files being scanned
```bash
# Add directories to excludeDirs in the script
# Or run from a specific subdirectory
cd backend
node ../clean-unicode.js --fix
```

### Files still have issues after cleaning
```bash
# Check if file is in excludeFiles list
# Or if extension is not in includeExtensions list
```

##  Restore from Backups

If you used `--backup` and need to restore:

```bash
# Restore a single file
mv file.js.backup file.js

# Restore all backups in current directory
find . -name "*.backup" -exec sh -c 'mv "$1" "${1%.backup}"' _ {} \;

# Delete all backups
find . -name "*.backup" -delete
```

##  Safety Checklist

Before running `--fix`:

- [ ] Run dry-run first (`node clean-unicode.js`)
- [ ] Review the files that will be changed
- [ ] Commit current changes to git
- [ ] Use `--backup` flag if unsure
- [ ] Test after cleaning

##  Statistics

After running, you'll see:
- **Files scanned**: Total files checked
- **Files with issues**: Files that need/needed cleaning
- **Characters removed**: Total unwanted characters found
- **Errors**: Any files that couldn't be processed
- **Duration**: How long it took

##  Getting Help

If you encounter issues:

1. Check this guide
2. Run with dry-run to see what would change
3. Review the error messages in terminal
4. Check if files are in excluded lists
5. Make sure you're in the project root directory

##  Examples

### Example 1: Full Project Cleanup
```bash
# Step 1: See what needs cleaning
node clean-unicode.js

# Step 2: Create backups and clean
node clean-unicode.js --fix --backup

# Step 3: Test your application
npm run dev

# Step 4: If all good, remove backups
find . -name "*.backup" -delete
```

### Example 2: Specific Directory
```bash
# Clean only backend
cd backend
node ../clean-unicode.js --fix

# Clean only frontend
cd web-dashboard
node ../clean-unicode.js --fix
```

### Example 3: After Pasting from Web
```bash
# Just pasted code from Stack Overflow or docs
node clean-unicode.js            # Check it
node clean-unicode.js --fix      # Clean it
npm run dev                      # Test it
```

---

##  Summary

This tool helps maintain clean, standard ASCII code by:
- Removing invisible unicode characters
- Converting smart quotes to regular quotes  
- Preserving all essential code characters
- Safely skipping dependencies and build artifacts

**Remember: Always run dry-run first!**

```bash
node clean-unicode.js              # Preview
node clean-unicode.js --fix        # Clean
node clean-unicode.js --fix --backup  # Safe clean
```

---

**Questions?** Check the troubleshooting section or review the script configuration.
