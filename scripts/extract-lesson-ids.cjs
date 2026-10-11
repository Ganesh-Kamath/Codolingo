const fs = require('fs');

const pathCourse = fs.readFileSync('src/curriculum/python/pythonCourse.ts', 'utf8');
const regex = /"lessons":\s*\[\s*\{\s*"id":\s*"([^"]+)"/g;
const ids = [];
let match;
while ((match = regex.exec(pathCourse)) !== null) {
  ids.push(match[1]);
}

console.log('Total lessons in pythonCourse.ts:', ids.length);
console.log('Unit 1 replacement lessons: 1.1 through 1.10');
console.log('First 20 IDs:', ids.slice(0, 20));

// Also let's check unit 1 lessons in pythonCourse.ts
const unit1Match = /"id":\s*"unit_01"[\s\S]*?"id":\s*"unit_02"/m.exec(pathCourse);
if (unit1Match) {
  const u1Ids = [];
  const u1Regex = /"lessons":\s*\[\s*\{\s*"id":\s*"([^"]+)"/g;
  let m;
  while ((m = u1Regex.exec(unit1Match[0])) !== null) {
    u1Ids.push(m[1]);
  }
  console.log('Unit 1 original IDs in pythonCourse:', u1Ids);
}
