// Simple script to test if the build process can import course data
const { slugToCourseId, getAllCourseIds } = require('../src/lib/courseData.ts');

console.log('Testing course data import...');
console.log('Slug to Course ID mapping:', slugToCourseId);
console.log('All course IDs:', getAllCourseIds());

// Test specific slugs
console.log('Java slug mapping:', slugToCourseId['java']);
console.log('Python slug mapping:', slugToCourseId['python']);
console.log('Arduino slug mapping:', slugToCourseId['arduino']);