const fs = require('fs');
const path = require('path');

const sampleFiles = [
  'src/curriculum/python/content/unit_01/1.1_what_is_programming.json',
  'src/curriculum/python/content/unit_01/1.4_the_print_function.json',
  'src/curriculum/python/content/unit_02/2.1_variables.json',
  'src/curriculum/python/content/unit_02/2.2_variable_naming_rules.json',
  'src/curriculum/python/content/unit_03/3.1_arithmetic_operators.json',
  'src/curriculum/python/content/unit_04/4.1_the_input_function.json',
  'src/curriculum/python/content/unit_05/5.1_the_if_statement.json',
  'src/curriculum/python/content/unit_06/6.1_introduction_to_loops.json',
  'src/curriculum/python/content/unit_06/6.8_project_number_guessing_game.json'
];

for (const f of sampleFiles) {
  if (!fs.existsSync(f)) {
    console.log('Missing:', f);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log('\n======================================================');
  console.log('FILE:', f);
  console.log('Title:', data.title, '| Objectives:', data.learning_objectives);
  console.log('Total items:', data.items?.length);
  
  // Count items with explanations, hints, misconceptions
  let emptyExplanations = 0;
  let genericExplanations = 0;
  let missingHints = 0;
  let solutionInHint = 0;
  let itemsWithMentalModels = 0;
  let itemsWithProgressiveHints = 0;

  for (const item of data.items) {
    const exp = (item.explanation || '').trim();
    if (!exp) emptyExplanations++;
    if (exp.includes('This exercise tests') || exp.includes('Mastering these rules') || exp.length < 25) {
      genericExplanations++;
    }
    const h = (item.hint || '').trim();
    if (!h) missingHints++;
    if (item.solution_code && h && h.includes(item.solution_code.trim())) solutionInHint++;
    if (item.mental_model || item.mentalModel) itemsWithMentalModels++;
    if (item.progressive_hints || item.progressiveHints) itemsWithProgressiveHints++;
  }

  console.log('Stats:');
  console.log(`  Empty explanations: ${emptyExplanations}`);
  console.log(`  Generic/short explanations: ${genericExplanations}`);
  console.log(`  Missing hints: ${missingHints}`);
  console.log(`  Solution leaked in hint: ${solutionInHint}`);
  console.log(`  Items with mental models: ${itemsWithMentalModels}`);
  console.log(`  Items with progressive hints: ${itemsWithProgressiveHints}`);

  // Sample items
  console.log('\n  -- Sample Item 1 (type: ' + data.items[0]?.type + ') --');
  console.log('  Prompt/Content:', (data.items[0]?.prompt || data.items[0]?.content || '').slice(0, 150).replace(/\n/g, ' '));
  console.log('  Explanation:', (data.items[0]?.explanation || '').slice(0, 150).replace(/\n/g, ' '));
  console.log('  Hint:', data.items[0]?.hint);

  const writeOrFix = data.items.find(i => i.type === 'write_the_code' || i.type === 'fix_the_code');
  if (writeOrFix) {
    console.log('\n  -- Sample Code Item (' + writeOrFix.id + ', type: ' + writeOrFix.type + ') --');
    console.log('  Prompt:', (writeOrFix.prompt || '').slice(0, 120).replace(/\n/g, ' '));
    console.log('  Starter:', (writeOrFix.starter_code || '').replace(/\n/g, '\\n'));
    console.log('  Solution:', (writeOrFix.solution_code || '').replace(/\n/g, '\\n'));
    console.log('  Hint:', writeOrFix.hint);
    console.log('  Explanation:', (writeOrFix.explanation || '').slice(0, 150).replace(/\n/g, ' '));
  }
}
