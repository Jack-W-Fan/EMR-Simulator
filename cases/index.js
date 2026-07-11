const cardiology = require('./cardiology');
const pulmonology = require('./pulmonology');
const endocrinology = require('./endocrinology');
const gastroenterology = require('./gastroenterology');
const neurology = require('./neurology');

module.exports = [
  ...cardiology,
  ...pulmonology,
  ...endocrinology,
  ...gastroenterology,
  ...neurology,
];
