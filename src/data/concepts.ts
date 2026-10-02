import { Concept } from '../types';

export const CONCEPTS: Record<string, Concept> = {
  'py_syntax': {
    id: 'py_syntax',
    name: 'Python Syntax & Print',
    category: 'Foundations',
    description: 'Basic statement structure, case sensitivity, and printing to standard output.',
    masteryPercentage: 90,
  },
  'py_variables': {
    id: 'py_variables',
    name: 'Variables & Data Types',
    category: 'Foundations',
    description: 'Declaring identifiers, storing strings, integers, floats, and reassigning values.',
    masteryPercentage: 85,
  },
  'py_comparison': {
    id: 'py_comparison',
    name: 'Comparison Operators',
    category: 'Foundations',
    description: 'Evaluating equality (== vs =), relational comparisons (<, >, <=, >=, !=).',
    masteryPercentage: 60, // Marked as lower to showcase "Needs Attention" / Mistake Bank!
  },
  'py_conditionals': {
    id: 'py_conditionals',
    name: 'Conditional Branching',
    category: 'Control Flow',
    description: 'Structuring execution paths with if, elif, else, and indentation blocks.',
    masteryPercentage: 70,
  },
  'py_loops': {
    id: 'py_loops',
    name: 'Loops & Iteration',
    category: 'Control Flow',
    description: 'Iterating over sequences with for-in loops and handling range-based counts.',
    masteryPercentage: 65,
  },
  'py_functions': {
    id: 'py_functions',
    name: 'Functions & Return Values',
    category: 'Functions',
    description: 'Encapsulating reusable logic with def, accepting parameters, and returning data.',
    masteryPercentage: 80,
  },
  'js_fundamentals': {
    id: 'js_fundamentals',
    name: 'JavaScript Fundamentals',
    category: 'Web',
    description: 'Variables with const/let, console.log, functions, and modern ES6 syntax.',
    masteryPercentage: 35,
  },
  'dsa_arrays': {
    id: 'dsa_arrays',
    name: 'Arrays & Dynamic Lists',
    category: 'Data Structures',
    description: 'Contiguous memory layout, indexing complexity, and pointer traversals.',
    masteryPercentage: 20,
  },
};
