const mammoth = require('mammoth');

mammoth.extractRawText({ path: 'sample EHR chart - abd pain cholelithiasis.docx' })
  .then(result => {
    console.log(result.value);
  })
  .catch(err => {
    console.error(err);
  });
