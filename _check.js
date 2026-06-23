const mammoth = require('mammoth');
const fs = require('fs');
mammoth.extractRawText({buffer: fs.readFileSync('sample EHR chart - abd pain cholelithiasis.docx')}).then(r => {
  const text = r.value;
  const todayIdx = text.toLowerCase().indexOf("today's nursing/triage note");
  const pmdIdx = text.toLowerCase().indexOf('pmd visit 3 months ago');
  console.log('=== TODAY NURSING NOTE ===');
  console.log(text.substring(todayIdx, pmdIdx));
  const pmdSection = text.substring(pmdIdx, pmdIdx + 1200);
  console.log('\n=== PMD VISIT ===');
  console.log(pmdSection);
  process.exit(0);
});
