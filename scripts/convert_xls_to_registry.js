const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '..', 'students data only.xls');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Columns (row index 1 is the header):
// 0: #
// 1: Registration Number
// 2: NIC or Passport no
// 3: Title
// 4: Full Name
// 5: Date of Birth
// 6: Gender
// 7: E-Mail Address
// 8: Contact No.

const titleMap = {
  'Mr.': 'MR',
  'Mr': 'MR',
  'MR': 'MR',
  'Ms.': 'MS',
  'Ms': 'MS',
  'MS': 'MS',
  'Miss.': 'MISS',
  'Miss': 'MISS',
  'MISS': 'MISS',
  'Mrs.': 'MRS',
  'Mrs': 'MRS',
  'MRS': 'MRS',
};

const registry = {};
let skipped = 0;
let processed = 0;

// Data rows start at index 2 (index 0 is empty, index 1 is header)
for (let i = 2; i < rows.length; i++) {
  const row = rows[i];
  if (!row || row.length === 0) continue;

  let regNo = row[1] ? String(row[1]).trim() : '';
  if (regNo.toUpperCase().includes('CANCELED')) regNo = '';
  const nic = row[2] ? String(row[2]).trim() : '';
  const rawTitle = row[3] ? String(row[3]).trim() : '';
  const fullName = row[4] ? String(row[4]).trim() : '';
  const email = row[7] ? String(row[7]).trim() : '';
  const phone = row[8] ? String(row[8]).trim() : '';

  if (!nic) {
    skipped++;
    continue;
  }

  // Map title
  const title = titleMap[rawTitle] || 'MR';

  // Try to derive nameWithInitials from fullName
  // Format: Take all words except last as initials, last word as surname
  let nameWithInitials = '';
  if (fullName) {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      nameWithInitials = parts[0];
    } else {
      const surname = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + '.').join(' ');
      nameWithInitials = `${initials} ${surname}`;
    }
  }

  // Try to extract intake from registration number
  let intake = '';
  if (regNo) {
    // Patterns like: BAA/2023-17A/WD-001 → 17A WD
    // SAB/BSc/2018/A/52 → A
    // GEN/INT11/STU NO013 → INT11
    // BSc/2024-18B/WE-026 → 18B WE
    const intakeMatch = regNo.match(/INT(\d+)/i);
    const batchMatch = regNo.match(/(\d+[A-Z])\/(W[DE])/i);
    const sabBatchMatch = regNo.match(/\/([A-Z])\/\d+$/);
    const moheMatch = regNo.match(/MOHE\/\d+\/([A-Z])\/\d+$/);

    if (moheMatch) {
      intake = `MOHE ${moheMatch[1]}`;
    } else if (intakeMatch) {
      intake = `INT${intakeMatch[1]}`;
    } else if (batchMatch) {
      intake = `${batchMatch[1]} ${batchMatch[2]}`;
    } else if (sabBatchMatch) {
      intake = sabBatchMatch[1];
    }
  }

  const newEntry = {
    title,
    fullName,
    nameWithInitials,
    email: email || '',
    sabRegistrationNo: regNo || '',
    phoneMobile: phone || '',
    phoneHome: '',
    permanentAddress: '',
    intake,
  };

  // If this NIC already exists, preserve the valid regNo if the new one is empty
  if (registry[nic]) {
    if (!newEntry.sabRegistrationNo && registry[nic].sabRegistrationNo) {
      newEntry.sabRegistrationNo = registry[nic].sabRegistrationNo;
    }
    if (!newEntry.intake && registry[nic].intake) {
      newEntry.intake = registry[nic].intake;
    }
    if (!newEntry.email && registry[nic].email) {
      newEntry.email = registry[nic].email;
    }
    if (!newEntry.phoneMobile && registry[nic].phoneMobile) {
      newEntry.phoneMobile = registry[nic].phoneMobile;
    }
  }

  registry[nic] = newEntry;

  processed++;
}

const outputPath = path.join(__dirname, '..', 'src', 'lib', 'students_registry.json');
fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf8');

console.log(`Done!`);
console.log(`  Processed: ${processed} students`);
console.log(`  Skipped (no NIC): ${skipped}`);
console.log(`  Output: ${outputPath}`);

// Show unique titles found in Excel for verification
const uniqueTitles = new Set();
for (let i = 2; i < rows.length; i++) {
  if (rows[i] && rows[i][3]) uniqueTitles.add(String(rows[i][3]).trim());
}
console.log(`  Unique titles in Excel: ${[...uniqueTitles].join(', ')}`);
