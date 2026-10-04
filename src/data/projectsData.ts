export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Project {
  id: string;
  title: string;
  difficulty: ProjectDifficulty;
  shortDescription: string;
  whatYouAreBuilding: string;
  goal: string;
  requirements: string[];
  skills: string[];
  topics: string[];
  thinkingPoints: string[];
  extensions: string[];
  estimatedTime: string;
  language: string;
}

export const PROJECTS_DATA: Project[] = [
  // ==========================================
  // BEGINNER PROJECTS (10)
  // ==========================================
  {
    id: 'number_guessing_game',
    title: 'Number Guessing Game',
    difficulty: 'beginner',
    shortDescription: 'Build an interactive terminal game where the computer selects a secret number and guides the player to guess it.',
    whatYouAreBuilding: 'A classic command-line guessing game where the computer picks a random secret integer within a range, and the player submits guesses until they discover the number.',
    goal: 'Learn how to control program flow with loops, conditional branching, user input conversion, and the random module.',
    requirements: [
      'Generate a random secret integer between 1 and 100.',
      'Prompt the player to input their guess via the terminal.',
      'Check if the guess is too high, too low, or correct, and print helpful feedback.',
      'Track and display the total number of attempts taken when the player wins.',
      'Handle invalid non-numeric inputs gracefully without crashing.',
      'Allow the player to choose whether to play another round after winning.'
    ],
    skills: ['input', 'variables', 'conditions', 'loops', 'random'],
    topics: ['random.randint', 'while loops', 'if/elif/else statements', 'int() typecasting', 'try/except ValueError'],
    thinkingPoints: [
      'How will you structure the game loop so it keeps running until the correct guess, but can also terminate early if the player quits?',
      'What happens if a user types letters instead of numbers? How will your program intercept that error?',
      'Could you adjust the range dynamically based on player difficulty settings?'
    ],
    extensions: [
      'Add a maximum attempts limit (e.g., 7 guesses) to make it a challenge.',
      'Implement a "hot and cold" hint system based on how close the guess is.',
      'Track and save the player\'s high score (fewest guesses) across rounds.'
    ],
    estimatedTime: '25-35 mins',
    language: 'python'
  },
  {
    id: 'simple_calculator',
    title: 'Simple Calculator',
    difficulty: 'beginner',
    shortDescription: 'Build an interactive command-line calculator that performs arithmetic operations and handles edge cases safely.',
    whatYouAreBuilding: 'A command-line tool that accepts numbers and an operation from the user, computes the result, and loops continuously until the user chooses to exit.',
    goal: 'Practice writing modular functions, validating user inputs, and preventing runtime mathematical errors.',
    requirements: [
      'Support core arithmetic operations: addition (+), subtraction (-), multiplication (*), and division (/).',
      'Prompt the user to input two numbers and select an operator.',
      'Implement individual functions for each arithmetic calculation.',
      'Safely handle division by zero with a clean warning message rather than a ZeroDivisionError.',
      'Display formatted calculation results clearly.',
      'Provide an option to perform another calculation or exit.'
    ],
    skills: ['input', 'operators', 'conditions', 'functions'],
    topics: ['Function definition and return values', 'Floating-point conversion float()', 'ZeroDivisionError handling', 'Interactive while loops'],
    thinkingPoints: [
      'How will you organize your code so each mathematical operation is isolated and easy to test individually?',
      'How will you validate whether the user entered a valid arithmetic operator?',
      'How can you handle calculations with decimal numbers accurately?'
    ],
    extensions: [
      'Add advanced operations such as exponentiation (**), integer division (//), and modulo (%).',
      'Allow chaining calculations using the previous result as the first operand.',
      'Parse an entire expression string like "12 + 45" in one line.'
    ],
    estimatedTime: '30-40 mins',
    language: 'python'
  },
  {
    id: 'rock_paper_scissors',
    title: 'Rock Paper Scissors',
    difficulty: 'beginner',
    shortDescription: 'Build a game against an automated computer opponent complete with score tracking and round history.',
    whatYouAreBuilding: 'A terminal match game where the player competes against a randomized computer choice across multiple rounds.',
    goal: 'Master conditional logic structures, string normalization, and state tracking across game iterations.',
    requirements: [
      'Allow the player to input Rock, Paper, or Scissors (case-insensitive).',
      'Use the random module to generate the computer opponent\'s move.',
      'Determine the winner based on the standard rules: Rock crushes Scissors, Scissors cuts Paper, Paper covers Rock.',
      'Track wins, losses, and ties across multiple rounds.',
      'Display the current score after each round and announce the champion when the player exits.'
    ],
    skills: ['conditions', 'loops', 'random', 'strings'],
    topics: ['random.choice()', 'String methods (.lower(), .strip())', 'Compound boolean logic (and/or)', 'Score tracking variables'],
    thinkingPoints: [
      'How can you normalize user input so that "rock", "Rock", and " ROCK " are all recognized reliably?',
      'How can you design your decision logic cleanly without writing 9 repetitive if-statements?',
      'Could you store choices in a list or dictionary to streamline move validation?'
    ],
    extensions: [
      'Implement "Rock, Paper, Scissors, Lizard, Spock" rules.',
      'Create a "Best of 5" tournament mode that automatically crowns a winner when someone hits 3 wins.',
      'Give the computer a simple strategy that reacts to the player\'s previous move.'
    ],
    estimatedTime: '25-35 mins',
    language: 'python'
  },
  {
    id: 'password_generator',
    title: 'Password Generator',
    difficulty: 'beginner',
    shortDescription: 'Build a configurable password generator producing secure passwords based on user complexity requirements.',
    whatYouAreBuilding: 'A utility that prompts the user for desired password length and character sets, then builds a randomized password.',
    goal: 'Understand string manipulation, character pools, the random/secrets modules, and input parameter validation.',
    requirements: [
      'Ask the user for their desired password length (e.g., between 8 and 64 characters).',
      'Ask the user if they want to include: uppercase letters, lowercase letters, digits, and special symbols.',
      'Ensure the generated password contains at least one character from each selected pool.',
      'Shuffle the resulting characters so required characters do not appear in predictable positions.',
      'Display the generated password and provide a brief assessment of its strength.'
    ],
    skills: ['strings', 'random', 'loops', 'functions'],
    topics: ['string.ascii_letters, string.digits, string.punctuation', 'random.choice() and random.shuffle()', 'List to string joining with "".join()'],
    thinkingPoints: [
      'What happens if the user selects a length of 3 but requests uppercase, lowercase, numbers, and symbols? How will you handle conflicting parameters?',
      'Why is simply picking completely random characters from a combined string not guaranteed to satisfy "at least one of each"?',
      'How can you calculate a basic password strength score?'
    ],
    extensions: [
      'Generate a batch of multiple passwords at once (e.g., give 5 options).',
      'Add an option to generate memorable passphrase-style passwords (e.g. "correct-horse-battery-staple").',
      'Prevent ambiguous characters that look similar (like O and 0, l and 1).'
    ],
    estimatedTime: '30-45 mins',
    language: 'python'
  },
  {
    id: 'quiz_game',
    title: 'Quiz Game',
    difficulty: 'beginner',
    shortDescription: 'Build a terminal quiz runner that displays questions, scores answers, and delivers a performance summary.',
    whatYouAreBuilding: 'A multiple-choice or short-answer trivia game driven by structured question data.',
    goal: 'Practice working with composite data structures (lists of dictionaries), iteration, and score tracking.',
    requirements: [
      'Store a collection of questions, options, and correct answers using lists and dictionaries.',
      'Present questions one-by-one with lettered options (A, B, C, D).',
      'Accept user input, validate option choices, and evaluate correctness.',
      'Provide immediate feedback after each answer and track the total score.',
      'Display a final performance summary with total correct, percentage, and a grade rating at the end.'
    ],
    skills: ['lists', 'dictionaries', 'loops', 'conditions', 'scoring'],
    topics: ['Iterating over list of dictionaries', 'Dictionary key access', 'Enumeration enumerate()', 'Score percentage arithmetic'],
    thinkingPoints: [
      'How will you structure your question data so adding 20 more questions requires changing only data, not code?',
      'How will you handle case-insensitivity when the player types "a" vs "A"?',
      'How can you prevent IndexError if the user enters an option letter that doesn\'t exist?'
    ],
    extensions: [
      'Randomize the order of questions each time the game is played.',
      'Add a countdown timer or penalty for incorrect guesses.',
      'Group questions by category or difficulty level.'
    ],
    estimatedTime: '35-50 mins',
    language: 'python'
  },
  {
    id: 'todo_list',
    title: 'To-Do List',
    difficulty: 'beginner',
    shortDescription: 'Build an in-memory task manager CLI for adding, viewing, marking, and deleting daily tasks.',
    whatYouAreBuilding: 'A command-line task organizer where users can create tasks, mark them as completed, and remove finished items.',
    goal: 'Learn list manipulation, CRUD (Create, Read, Update, Delete) concepts in-memory, and menu-driven CLI loops.',
    requirements: [
      'Present a clear menu with options: View Tasks, Add Task, Complete Task, Delete Task, and Exit.',
      'Maintain task state (description and completion status).',
      'Display tasks with clean indicators (e.g., [✓] for completed, [ ] for pending).',
      'Allow users to select tasks by their displayed numerical index.',
      'Safely handle empty list states and invalid task numbers.'
    ],
    skills: ['lists', 'loops', 'functions', 'input'],
    topics: ['List indexing and slicing', 'Modifying list elements', 'del or .pop() for item removal', 'Formatted string representation'],
    thinkingPoints: [
      'How should each task be represented? A string, a tuple, or a dictionary?',
      'Remember that user-facing task numbers start at 1, while Python lists are 0-indexed. Where will you convert between them?',
      'What happens if a user tries to mark task #5 when only 2 tasks exist?'
    ],
    extensions: [
      'Add priority levels (High, Medium, Low) and allow filtering by priority.',
      'Add due dates and sort tasks by urgency.',
      'Implement an "undo" feature for accidental task deletions.'
    ],
    estimatedTime: '30-45 mins',
    language: 'python'
  },
  {
    id: 'contact_book',
    title: 'Contact Book',
    difficulty: 'beginner',
    shortDescription: 'Build an address book CLI for storing, searching, updating, and managing personal contact records.',
    whatYouAreBuilding: 'A personal directory application to manage contacts with names, phone numbers, and email addresses.',
    goal: 'Master dictionary operations, key-value lookups, data validation, and search algorithms.',
    requirements: [
      'Add a new contact with name, phone number, and email address.',
      'View all saved contacts formatted in a tidy table or structured card layout.',
      'Search for contacts by partial name (e.g., "alex" matches "Alexander").',
      'Update the phone number or email of an existing contact.',
      'Delete a contact with confirmation.',
      'Prevent duplicate contact names or prompt to overwrite.'
    ],
    skills: ['lists/dictionaries', 'functions', 'searching', 'updating data'],
    topics: ['Nested dictionaries or dictionary of dictionaries', 'Dictionary methods (.items(), .get(), .keys())', 'Substring searching with "in"'],
    thinkingPoints: [
      'Should contacts be stored in a dictionary keyed by name, or a list of contact dictionaries? What are the tradeoffs for search vs ordering?',
      'How will you validate that a phone number contains only digits or valid formatting?',
      'How will you handle case-insensitivity when searching contact names?'
    ],
    extensions: [
      'Add extra fields such as notes, address, or relationship tags.',
      'Export contacts to a formatted text summary.',
      'Sort contacts alphabetically by last name.'
    ],
    estimatedTime: '35-50 mins',
    language: 'python'
  },
  {
    id: 'expense_tracker',
    title: 'Expense Tracker',
    difficulty: 'beginner',
    shortDescription: 'Build a personal finance recording tool to log purchases, categorize spending, and inspect totals.',
    whatYouAreBuilding: 'A command-line expense logger where users can enter expenditures, assign categories, and generate spending summaries.',
    goal: 'Gain experience combining numeric calculations, category aggregation, and structured data records.',
    requirements: [
      'Add an expense with amount, category (e.g., Food, Transport, Utilities), and a brief note.',
      'View all recorded transactions with timestamps or sequential IDs.',
      'Calculate and display the total expenditure across all expenses.',
      'Compute spending totals grouped by category (e.g., Food: $140, Transport: $60).',
      'Validate that expense amounts are positive numeric values.'
    ],
    skills: ['lists/dictionaries', 'numbers', 'functions', 'basic file handling'],
    topics: ['Accumulator patterns with loops', 'Grouping and summing with dictionaries', 'Float formatting with f"{val:.2f}"', 'Input validation'],
    thinkingPoints: [
      'How will you handle category grouping if a user enters "food" vs "Food"?',
      'What data structure allows easy iteration while also preserving individual transaction details?',
      'How will your program respond if asked to display a summary when no expenses have been recorded yet?'
    ],
    extensions: [
      'Set monthly budget limits and alert the user when spending exceeds thresholds.',
      'Add date stamps for each expense and view spending by date range.',
      'Implement an ASCII bar chart showing relative spending per category.'
    ],
    estimatedTime: '40-55 mins',
    language: 'python'
  },
  {
    id: 'text_analyzer',
    title: 'Text Analyzer',
    difficulty: 'beginner',
    shortDescription: 'Build a linguistic inspector that analyzes text blocks to report word counts, character density, and frequencies.',
    whatYouAreBuilding: 'A text statistics utility that inspects user-provided paragraphs or articles to extract structural and lexical metrics.',
    goal: 'Master string parsing, punctuation sanitization, frequency mapping with dictionaries, and sorting.',
    requirements: [
      'Accept multi-line text input from the user.',
      'Count total words, total characters (including spaces), and characters excluding whitespace.',
      'Count total sentences (detecting periods, question marks, and exclamation marks).',
      'Calculate average word length and average sentence length.',
      'Find the top 5 most frequently used words, ignoring punctuation and casing.'
    ],
    skills: ['strings', 'loops', 'dictionaries', 'counting', 'functions'],
    topics: ['str.split() and str.strip()', 'string.punctuation removal', 'Dictionary frequency counter', 'sorted() with custom lambda keys'],
    thinkingPoints: [
      'How will you handle punctuation attached to words, such as "programming." vs "programming"?',
      'How should you define a sentence boundary without falsely splitting on abbreviations like "e.g." or "Dr."?',
      'How can you sort a frequency dictionary by value in descending order?'
    ],
    extensions: [
      'Filter out common stop words (e.g., "the", "is", "at", "which") to find meaningful keywords.',
      'Calculate reading difficulty scores like Flesch-Kincaid grade level.',
      'Search for specific word occurrences and highlight where they appear.'
    ],
    estimatedTime: '35-50 mins',
    language: 'python'
  },
  {
    id: 'unit_converter',
    title: 'Unit Converter',
    difficulty: 'beginner',
    shortDescription: 'Build a flexible multi-category unit converter for length, temperature, and weight with input verification.',
    whatYouAreBuilding: 'A CLI tool that allows users to pick a measurement category, select source and target units, and compute precise conversions.',
    goal: 'Learn clean architectural patterns for multi-path mathematical calculations and error-proof input validation.',
    requirements: [
      'Support at least three measurement domains: Length (km, m, miles, feet), Weight (kg, g, lbs, oz), and Temperature (C, F, K).',
      'Allow the user to select source unit, target unit, and numeric value.',
      'Perform mathematically accurate conversions with formatted output.',
      'Disallow physically impossible inputs (e.g., temperatures below Absolute Zero).',
      'Structure conversions cleanly using an intermediate reference unit to avoid combinatorial explosion.'
    ],
    skills: ['functions', 'conditions', 'arithmetic', 'input validation'],
    topics: ['Base-unit conversion pattern', 'Dictionary lookup tables for conversion factors', 'Domain-specific constraint validation', 'Floating-point rounding'],
    thinkingPoints: [
      'If you have 4 length units, writing separate formulas for every pair requires 12 functions. How does converting to a base unit (e.g. meters) reduce this to just 2 conversions per calculation?',
      'Why is temperature conversion different from length/weight (offset vs ratio)?',
      'How will you present clear error messages when a user inputs an unrecognized unit code?'
    ],
    extensions: [
      'Add data storage units (Bytes, KB, MB, GB, TB).',
      'Allow users to enter composite queries like "50 km to miles" in a single string.',
      'Support currency conversions with configurable exchange rates.'
    ],
    estimatedTime: '30-45 mins',
    language: 'python'
  },

  // ==========================================
  // INTERMEDIATE PROJECTS (10)
  // ==========================================
  {
    id: 'file_organizer',
    title: 'File Organizer',
    difficulty: 'intermediate',
    shortDescription: 'Build a file system organizer that classifies and sorts files into categorized folders by extension.',
    whatYouAreBuilding: 'A script that inspects a designated folder, categorizes unorganized files (e.g., Images, Code, Documents, Audio), and moves them into organized subfolders.',
    goal: 'Master Python file system operations, pathlib navigation, directory creation, and safe file manipulation.',
    requirements: [
      'Define category mapping rules (e.g., .jpg/.png -> Images, .pdf/.docx -> Documents, .py/.js -> Code).',
      'Scan a target directory for files without modifying subdirectories.',
      'Create destination category folders dynamically only if matching files exist.',
      'Move or organize files into their corresponding category folders.',
      'Handle name collisions safely (e.g. appending a counter if a file with the same name already exists).',
      'Provide a summary report of files moved per category.'
    ],
    skills: ['pathlib', 'files/directories', 'conditions', 'functions'],
    topics: ['pathlib.Path', 'shutil.move() and os.rename()', 'Path.is_file() and Path.suffix', 'Safe filename collision resolution'],
    thinkingPoints: [
      'How will you ensure the organizer script doesn\'t accidentally move itself or hidden system files (.DS_Store, desktop.ini)?',
      'Why is pathlib generally preferred over raw string manipulation for cross-platform file paths?',
      'How will you handle files with unknown or missing extensions?'
    ],
    extensions: [
      'Add a "Dry Run" mode that prints what would be moved without modifying actual files.',
      'Organize files by creation date (Year/Month) rather than extension.',
      'Implement an undo log that allows reversing an organization run.'
    ],
    estimatedTime: '45-60 mins',
    language: 'python'
  },
  {
    id: 'csv_data_analyzer',
    title: 'CSV Data Analyzer',
    difficulty: 'intermediate',
    shortDescription: 'Build a statistical data analysis CLI that parses CSV files and computes metrics without external libraries.',
    whatYouAreBuilding: 'A pure Python data analytics tool that reads structured CSV datasets, determines data types, and outputs descriptive statistics.',
    goal: 'Understand CSV file parsing, data type inference, statistical algorithms (mean, median, variance), and tabular reporting.',
    requirements: [
      'Read and parse CSV files handling commas within quotes properly.',
      'Detect column headers and automatically infer data types (numeric vs text).',
      'For numeric columns: calculate Count, Mean, Median, Min, Max, and Standard Deviation.',
      'For text columns: calculate Count, Unique values, and Most Frequent value.',
      'Allow users to filter rows based on numerical thresholds (e.g., "Age > 30").',
      'Output results in a clean aligned ASCII table format.'
    ],
    skills: ['CSV', 'lists', 'dictionaries', 'file handling', 'calculations'],
    topics: ['csv.reader and csv.DictReader', 'Type casting with fallback', 'Median calculation with sorting', 'String formatting for tabular alignment'],
    thinkingPoints: [
      'How will you handle missing or corrupt values (empty cells, "N/A") without crashing your calculations?',
      'How do you compute the median when the number of numeric elements is even vs odd?',
      'How can you process large datasets without storing every raw string in memory multiple times?'
    ],
    extensions: [
      'Export the calculated summary statistics to a new summary.csv file.',
      'Calculate correlation between two selected numeric columns.',
      'Add basic sorting of records by any specified column.'
    ],
    estimatedTime: '50-70 mins',
    language: 'python'
  },
  {
    id: 'inventory_management_system',
    title: 'Inventory Management System',
    difficulty: 'intermediate',
    shortDescription: 'Build a warehouse inventory system tracking stock levels, product SKUs, prices, and replenishment alerts.',
    whatYouAreBuilding: 'A commercial inventory tracker that maintains product records, manages stock adjustments, tracks low stock, and persists state.',
    goal: 'Practice structured domain modeling, robust validation, transaction integrity, and file-based state persistence.',
    requirements: [
      'Store products with SKU, name, quantity, unit cost, and reorder threshold.',
      'Support stock in (restocking) and stock out (sales/usage) operations with quantity validation.',
      'Prevent negative inventory quantities with clear error explanations.',
      'Generate low-stock warnings for items whose quantities fall below their threshold.',
      'Compute the total inventory valuation (sum of quantity * unit cost).',
      'Save inventory state to a JSON or CSV file and reload on startup.'
    ],
    skills: ['dictionaries', 'functions', 'file persistence', 'validation'],
    topics: ['json.dump() and json.load()', 'Data validation and sanitization', 'Dictionary comprehension', 'Safe file write patterns'],
    thinkingPoints: [
      'What happens if the application crashes mid-write? How can you save state safely?',
      'How can you ensure product SKUs are unique and case-standardized?',
      'How will you structure your code so business rules (e.g., cannot sell more than available) are decoupled from the CLI menu?'
    ],
    extensions: [
      'Maintain an append-only audit log of all stock movements with timestamps.',
      'Implement category filtering and search by SKU or name.',
      'Generate purchase order recommendations for all low-stock items.'
    ],
    estimatedTime: '55-75 mins',
    language: 'python'
  },
  {
    id: 'banking_cli',
    title: 'Banking CLI',
    difficulty: 'intermediate',
    shortDescription: 'Build an object-oriented banking simulator managing customer accounts, transactions, and overdraft rules.',
    whatYouAreBuilding: 'A banking domain application featuring account classes, encapsulation, transaction logs, and custom error handling.',
    goal: 'Master Object-Oriented Programming (OOP), class inheritance, instance methods, properties, and custom exceptions.',
    requirements: [
      'Create an `Account` base class with account number, owner name, balance, and transaction history.',
      'Implement methods: `deposit(amount)`, `withdraw(amount)`, and `get_statement()`.',
      'Create specialized account subclasses (e.g. `SavingsAccount` with interest, `CheckingAccount` with overdraft limit).',
      'Create custom exceptions like `InsufficientFundsError` and `InvalidTransactionError`.',
      'Maintain a timestamped transaction log for every successful balance change.'
    ],
    skills: ['OOP', 'classes', 'validation', 'transactions', 'exceptions'],
    topics: ['Class definitions and __init__', 'Inheritance and super()', 'Custom Exception subclasses', 'datetime.now() for transaction timestamps'],
    thinkingPoints: [
      'Why is raising a custom exception better than returning False or printing an error message inside the withdraw method?',
      'How should you protect the balance attribute from direct external mutation (encapsulation)?',
      'How does polymorphism allow your banking CLI to treat checking and savings accounts uniformly?'
    ],
    extensions: [
      'Implement inter-account transfers with atomic rollback if either debit or credit fails.',
      'Add PIN-based authentication before allowing account actions.',
      'Calculate and apply monthly interest across all savings accounts.'
    ],
    estimatedTime: '60-80 mins',
    language: 'python'
  },
  {
    id: 'library_management_system',
    title: 'Library Management System',
    difficulty: 'intermediate',
    shortDescription: 'Build an object-oriented catalog system that models books, members, checkout periods, and availability.',
    whatYouAreBuilding: 'A library management program coordinating book entities, patron memberships, checkouts, and overdue tracking.',
    goal: 'Practice multi-class object design, entity relationships, collections management, and domain modeling.',
    requirements: [
      'Model distinct classes: `Book` (ISBN, title, author, copies available), `Patron` (ID, name, borrowed books), and `Library`.',
      'Implement book checkout with validation (must have available copies, patron must not exceed max limit).',
      'Implement book returns and automatically update availability counts.',
      'Search catalog by title, author, or ISBN with partial keyword matching.',
      'Track checkout dates and report overdue items based on loan duration.'
    ],
    skills: ['OOP', 'collections', 'searching', 'file/database persistence'],
    topics: ['Object composition (Library has Books and Patrons)', 'List of objects filtering', 'Date comparisons with datetime.timedelta', 'String representations with __repr__ and __str__'],
    thinkingPoints: [
      'Should a Book know which Patron checked it out, or should the Library maintain a Loan record linking both? What are the tradeoffs?',
      'How will you handle multiple copies of the exact same book title?',
      'How can you serialize complex interconnected objects to a file for persistence?'
    ],
    extensions: [
      'Calculate late return fines ($0.50/day overdue).',
      'Implement a reservation/waitlist system when all copies of a book are checked out.',
      'Add librarian administration controls vs patron self-service modes.'
    ],
    estimatedTime: '60-85 mins',
    language: 'python'
  },
  {
    id: 'log_file_analyzer',
    title: 'Log File Analyzer',
    difficulty: 'intermediate',
    shortDescription: 'Build a server log analysis tool that parses web server logs to discover error trends, traffic peaks, and suspicious IPs.',
    whatYouAreBuilding: 'A system diagnostic CLI that ingests Common Log Format (CLF) or custom server logs and compiles an actionable intelligence report.',
    goal: 'Learn regular expression extraction, file streaming, frequency aggregation, and error pattern identification.',
    requirements: [
      'Parse standard log lines containing IP, timestamp, HTTP method, URL, status code, and bytes sent.',
      'Use regular expressions to extract structured fields reliably from raw log strings.',
      'Calculate total requests, total bandwidth transferred, and error rates (4xx and 5xx responses).',
      'Identify the top 5 most frequently requested URLs and top 5 most active client IP addresses.',
      'Detect spikes in failed authentication attempts (e.g. repeated 401/403 status codes).',
      'Output a clean executive summary report.'
    ],
    skills: ['file handling', 'strings', 'regex', 'dictionaries', 'statistics'],
    topics: ['re.compile() and re.match()', 'Named regex capture groups (?P<name>...)', 'Streaming files with for line in file', 'collections.Counter'],
    thinkingPoints: [
      'Why is reading a 2GB log file line-by-line using a generator much better than using .readlines()?',
      'How will you handle malformed log lines without aborting the entire analysis?',
      'What regular expression pattern accounts for varying quote characters and response code formats?'
    ],
    extensions: [
      'Identify potential brute-force attacks (e.g. >20 requests per minute from a single IP).',
      'Group traffic volume by hour of the day to identify peak usage windows.',
      'Export findings to a JSON incident report.'
    ],
    estimatedTime: '55-75 mins',
    language: 'python'
  },
  {
    id: 'markdown_text_statistics_tool',
    title: 'Markdown/Text Statistics Tool',
    difficulty: 'intermediate',
    shortDescription: 'Build a document analysis tool that parses Markdown files for heading outlines, link health, reading speed, and syntax distribution.',
    whatYouAreBuilding: 'A content linter and statistics CLI for technical writers and developers managing documentation.',
    goal: 'Practice regex parsing, recursive text pattern scanning, formatting validation, and document metric calculations.',
    requirements: [
      'Extract all Markdown headings (#, ##, ###) and generate an indented Table of Contents hierarchy.',
      'Count code blocks (fenced ``` blocks) vs prose paragraphs.',
      'Extract all hyperlinks and image references with their anchor text and URLs.',
      'Calculate estimated reading time based on an average reading speed (e.g. 200 words per minute).',
      'Flag structural issues such as skipped heading levels (e.g. jumping from # directly to ###).'
    ],
    skills: ['file handling', 'regex', 'text processing', 'functions'],
    topics: ['Multiline regex flags re.MULTILINE', 'Matching code fences with non-greedy patterns re.DOTALL', 'Hierarchical outline generation', 'String formatting'],
    thinkingPoints: [
      'How will you avoid matching `#` symbols that occur inside code blocks or comments?',
      'How can you parse both inline links [text](url) and reference links [text][id]?',
      'How will you calculate word count accurately when Markdown formatting tokens (*, _, `, #) are present?'
    ],
    extensions: [
      'Verify that all local anchor links (#heading-anchor) correspond to valid headings in the document.',
      'Check for empty or dead URL references.',
      'Output the generated Table of Contents directly back into the file.'
    ],
    estimatedTime: '50-70 mins',
    language: 'python'
  },
  {
    id: 'habit_tracker',
    title: 'Habit Tracker',
    difficulty: 'intermediate',
    shortDescription: 'Build a personal habit tracking tool that logs daily completions, tracks streaks, and calculates consistency percentages.',
    whatYouAreBuilding: 'A habit development assistant CLI that records daily rituals, visualizes consistency, and computes unbroken streaks.',
    goal: 'Master date arithmetic with datetime, historical sequence analysis, persistence, and consistency metrics.',
    requirements: [
      'Create and track custom habits (e.g., "30 min Coding", "Read Book", "Meditate").',
      'Log completions for today or retroactively for specific dates.',
      'Calculate the current unbroken streak of consecutive days for each habit.',
      'Calculate the all-time longest streak achieved.',
      'Display a 30-day visual consistency grid (using characters like ■ and □) for each habit.',
      'Persist all habit logs to file.'
    ],
    skills: ['dates', 'file handling', 'dictionaries', 'statistics'],
    topics: ['datetime.date and datetime.timedelta', 'Date parsing and formatting strptime/strftime', 'Streak calculation algorithms', 'JSON serialization of dates'],
    thinkingPoints: [
      'How will you determine if yesterday was completed to decide whether the current streak is still alive or reset to 0?',
      'What happens when a user logs multiple completions on the exact same calendar date?',
      'How do you store dates in JSON when JSON has no native Date data type?'
    ],
    extensions: [
      'Add habit frequencies (e.g. "5 days a week" or "weekdays only").',
      'Calculate monthly completion rates (e.g., 24/30 days = 80%).',
      'Provide motivational milestone notifications (e.g., 7-day, 30-day, 100-day badge alerts).'
    ],
    estimatedTime: '55-75 mins',
    language: 'python'
  },
  {
    id: 'command_line_journal',
    title: 'Command-Line Journal',
    difficulty: 'intermediate',
    shortDescription: 'Build a private timestamped personal diary and note-taking CLI with tagging, search, and export options.',
    whatYouAreBuilding: 'A personal productivity journal that enables quick note taking, entry categorization by tags, keyword retrieval, and text export.',
    goal: 'Understand timestamping, multi-criteria filtering, structured text persistence, and error-tolerant CLI design.',
    requirements: [
      'Create new journal entries with automatic date and time stamps.',
      'Allow tagging entries with multiple labels (e.g., #learning, #ideas, #bugs).',
      'Display entries in reverse chronological order with pagination.',
      'Search entry content by keyword or filter by specific tag.',
      'Edit or delete previous entries by their unique timestamp or ID.',
      'Persist entries cleanly to disk (individual files or single structured database/JSON).'
    ],
    skills: ['files', 'dates', 'searching', 'functions', 'error handling'],
    topics: ['datetime formatting', 'File I/O with UTF-8 encoding', 'Tag extraction with regex or string splitting', 'Safe update/delete operations'],
    thinkingPoints: [
      'Should each journal entry be stored in its own separate text/markdown file, or all together in one structured file? What are the implications for search speed vs file clutter?',
      'How will you handle multi-line entry bodies in a command-line interface?',
      'How will you protect user data from corruption during file writes?'
    ],
    extensions: [
      'Add simple password protection or XOR encryption for private entries.',
      'Generate a weekly or monthly summary report of journal activity.',
      'Export selected entries to a clean standalone Markdown document.'
    ],
    estimatedTime: '50-70 mins',
    language: 'python'
  },
  {
    id: 'flashcard_learning_app',
    title: 'Flashcard Learning App',
    difficulty: 'intermediate',
    shortDescription: 'Build a study tool with spaced-repetition principles that quizzes learners and prioritizes challenging cards.',
    whatYouAreBuilding: 'A flashcard study partner CLI that loads subject decks, tests recall, tracks mastery scores, and focuses on difficult questions.',
    goal: 'Master algorithm-based repetition weighting, randomized sampling, structured progress tracking, and deck serialization.',
    requirements: [
      'Create, view, and manage flashcard decks (front: prompt/question, back: answer).',
      'Run study sessions: show front, wait for user keypress, reveal back, and ask user to grade their recall (e.g., Easy, Hard, Forgot).',
      'Update card mastery levels based on user self-evaluation.',
      'Weight card selection so unmastered or difficult cards appear more frequently than mastered ones.',
      'Display session statistics: total cards reviewed, accuracy percentage, and mastery gains.',
      'Save deck state and progress to file.'
    ],
    skills: ['data structures', 'file handling', 'randomization', 'functions'],
    topics: ['random.choices() with weights', 'Leitner or simplified spaced repetition model', 'JSON serialization', 'Stateful card objects'],
    thinkingPoints: [
      'How will you mathematically weight cards so the learner isn\'t shown ONLY hard cards, but still reviews easy cards occasionally?',
      'How will you structure the card data so each card retains its review history and current box/level?',
      'How will you handle deck creation from a plain text or CSV file?'
    ],
    extensions: [
      'Support importing cards from Anki or CSV formats.',
      'Implement a "Cram Mode" that reviews all cards sequentially without affecting spaced-repetition schedules.',
      'Add reverse study mode (showing answer first, guessing the question).'
    ],
    estimatedTime: '60-80 mins',
    language: 'python'
  },

  // ==========================================
  // ADVANCED PROJECTS (10)
  // ==========================================
  {
    id: 'rest_api_client',
    title: 'REST API Client',
    difficulty: 'advanced',
    shortDescription: 'Build a command-line HTTP client library and CLI tool that interfaces with REST APIs with retries, caching, and auth.',
    whatYouAreBuilding: 'A modular API client tool that queries endpoints, manages HTTP verbs (GET, POST, PUT, DELETE), handles authentication tokens, and formats JSON outputs.',
    goal: 'Master network programming with urllib/requests, HTTP status protocol semantics, exponential backoff retries, and clean API abstraction.',
    requirements: [
      'Create a modular `ApiClient` class with generic methods for GET, POST, PUT, and DELETE.',
      'Support configurable base URLs, default headers (e.g., User-Agent, Authorization), and query parameters.',
      'Implement automatic retry logic with exponential backoff for transient HTTP errors (status 429, 500, 502, 503).',
      'Handle connection timeouts and network dropouts gracefully with descriptive error messages.',
      'Parse JSON responses and provide options for formatted pretty-printed terminal display or raw output.',
      'Demonstrate the client against a public API (such as JSONPlaceholder, GitHub API, or Open Library).'
    ],
    skills: ['HTTP requests', 'JSON', 'APIs', 'exceptions'],
    topics: ['urllib.request / requests', 'HTTP status code handling (2xx, 4xx, 5xx)', 'Exponential backoff with time.sleep()', 'Custom NetworkException hierarchy'],
    thinkingPoints: [
      'Why is it crucial to set explicit timeout values on every single network request?',
      'How should your client distinguish between a client error (e.g. 404 Not Found - do not retry) and a server error (e.g. 503 Service Unavailable - safe to retry)?',
      'How will you separate the reusable HTTP transport layer from domain-specific endpoint methods?'
    ],
    extensions: [
      'Add local response caching with TTL (Time To Live) headers to avoid redundant API hits.',
      'Implement Bearer token refresh logic when receiving a 401 Unauthorized status.',
      'Provide a CLI command mode (e.g. `python client.py get /users/1`).'
    ],
    estimatedTime: '75-100 mins',
    language: 'python'
  },
  {
    id: 'weather_cli',
    title: 'Weather CLI',
    difficulty: 'advanced',
    shortDescription: 'Build a weather terminal application that fetches real-time meteorological data and multi-day forecasts with local caching.',
    whatYouAreBuilding: 'A forecasting CLI that looks up cities worldwide, retrieves temperature, wind, humidity, and forecasts, and caches responses.',
    goal: 'Learn external API integration, JSON payload transformation, terminal visualization, and time-based cache invalidation.',
    requirements: [
      'Accept city or coordinate queries from the command line.',
      'Interface with a live weather API (e.g., Open-Meteo or OpenWeatherMap).',
      'Display current conditions: temperature, apparent temperature, relative humidity, wind speed, and weather condition description.',
      'Display a multi-day forecast table with daily highs, lows, and precipitation probabilities.',
      'Implement local caching (saving API responses with a 30-minute timestamp TTL) to prevent API rate limit exhaustion.',
      'Safely handle unknown city queries and API downtime.'
    ],
    skills: ['APIs', 'JSON', 'requests', 'error handling'],
    topics: ['Geocoding API coordinates', 'Datetime timestamp comparisons for cache TTL', 'JSON parsing and deep field extraction', 'Terminal formatting with ASCII weather icons'],
    thinkingPoints: [
      'How will you translate a city name like "Tokyo" into geographical coordinates (latitude/longitude) if required by the weather API?',
      'How will you structure your cache file so querying multiple different cities does not overwrite other cached data?',
      'What units system (Metric vs Imperial) will you support, and how will you allow the user to toggle between Celsius and Fahrenheit?'
    ],
    extensions: [
      'Add ASCII art weather symbols (☀️, 🌧️, ❄️, ⚡) corresponding to weather condition codes.',
      'Detect the user\'s approximate location automatically via IP lookup if no city is specified.',
      'Alert the user if extreme weather warnings or high precipitation is forecasted.'
    ],
    estimatedTime: '70-95 mins',
    language: 'python'
  },
  {
    id: 'web_scraper',
    title: 'Web Scraper',
    difficulty: 'advanced',
    shortDescription: 'Build a polite, resilient web scraper that extracts structured articles or catalog data and exports to JSON/CSV.',
    whatYouAreBuilding: 'A web data harvesting utility that fetches pages, parses HTML trees, extracts target data fields, handles pagination, and respects scraping etiquette.',
    goal: 'Understand HTTP scraping conventions, DOM tree traversal, pagination loops, rate-limiting, and error tolerance.',
    requirements: [
      'Fetch web pages using polite headers (e.g., custom User-Agent identifying the script).',
      'Extract structured entities (e.g. titles, prices, authors, links) from HTML elements.',
      'Implement multi-page pagination that follows "Next" links or incrementing page parameters.',
      'Enforce rate limiting (introducing delays between requests) to prevent server throttling.',
      'Handle missing fields or irregular DOM layouts on specific pages without terminating the run.',
      'Export collected records to structured JSON and CSV files.'
    ],
    skills: ['requests', 'HTML parsing', 'data extraction', 'files'],
    topics: ['HTML parsing with html.parser or BeautifulSoup', 'CSS selectors and XPath concepts', 'Rate limiting with time.sleep()', 'Robots.txt etiquette'],
    thinkingPoints: [
      'Why is hard-coding rigid element index paths (e.g. div > div:nth-child(3)) fragile compared to searching for descriptive class names or semantic tags?',
      'What precautions should you take if a website returns a CAPTCHA or 403 Forbidden response?',
      'How can you separate the HTML extraction logic from the storage layer so scraping a new website only requires swapping the extractor?'
    ],
    extensions: [
      'Parse the website\'s robots.txt file to verify scraping permission before fetching paths.',
      'Download and store associated images referenced in the extracted data.',
      'Track already-scraped URLs in a set to avoid circular link loops.'
    ],
    estimatedTime: '80-110 mins',
    language: 'python'
  },
  {
    id: 'sqlite_expense_manager',
    title: 'SQLite Expense Manager',
    difficulty: 'advanced',
    shortDescription: 'Build a relational database-backed financial management application with normalized tables and SQL queries.',
    whatYouAreBuilding: 'A database-driven personal finance system utilizing Python\'s built-in sqlite3 module to manage accounts, categories, and transactions with full SQL CRUD.',
    goal: 'Master relational schema design, SQL data definition, parameterized queries, table joins, transactions, and aggregate analytics.',
    requirements: [
      'Initialize an SQLite database with normalized tables: `categories` (id, name, budget) and `expenses` (id, amount, date, description, category_id).',
      'Implement full CRUD operations: Insert expense, View expenses, Update record, Delete record.',
      'Use parameterized SQL queries (? placeholders) to guarantee protection against SQL injection vulnerabilities.',
      'Write SQL queries with `JOIN` clauses to display human-readable category names alongside transaction records.',
      'Compute aggregate financial insights using SQL `SUM()`, `AVG()`, and `GROUP BY`.',
      'Implement database transactions with `commit` on success and `rollback` on error.'
    ],
    skills: ['SQLite', 'SQL', 'CRUD', 'Python', 'validation'],
    topics: ['sqlite3 module connection and cursor', 'DDL (CREATE TABLE, FOREIGN KEYS)', 'Parameterized queries to prevent SQL injection', 'Aggregate SQL queries (GROUP BY, HAVING)'],
    thinkingPoints: [
      'Why is executing raw SQL string concatenation `f"SELECT * FROM expenses WHERE id={user_input}"` dangerous?',
      'How do foreign keys maintain referential integrity when someone tries to delete a category that still has associated expenses?',
      'When should you use `cursor.fetchone()` versus `cursor.fetchall()`?'
    ],
    extensions: [
      'Implement month-over-month category budget variance reporting (actual spending vs category budget).',
      'Support automated database schema migrations (e.g. adding a new column without wiping existing data).',
      'Export SQL query results to CSV or JSON.'
    ],
    estimatedTime: '80-110 mins',
    language: 'python'
  },
  {
    id: 'personal_finance_dashboard',
    title: 'Personal Finance Dashboard',
    difficulty: 'advanced',
    shortDescription: 'Build a financial analytics engine that categorizes transactions, computes cash flow metrics, and renders ASCII visual charts.',
    whatYouAreBuilding: 'A complete financial reporting dashboard CLI that ingests transaction logs, computes financial health indicators, and renders visual ASCII charts in the terminal.',
    goal: 'Learn data transformation pipelines, trend analysis, statistical grouping, and creative terminal visualization without UI libraries.',
    requirements: [
      'Ingest transaction records containing Date, Amount, Type (Income vs Expense), and Category.',
      'Compute Net Cash Flow (Total Income minus Total Expenses) and overall Savings Rate percentage.',
      'Aggregate monthly expenditure trends over time.',
      'Render a dynamic ASCII horizontal bar chart representing category spending breakdown.',
      'Render a monthly trend comparison chart in the terminal.',
      'Identify top spending outliers and highlight discretionary vs essential expenditure.'
    ],
    skills: ['SQLite/CSV', 'dates', 'data processing', 'aggregation'],
    topics: ['Data transformation and pipeline design', 'ASCII chart rendering with scaled character widths', 'Date parsing and grouping by Year-Month', 'Financial metric calculations'],
    thinkingPoints: [
      'How will you scale ASCII bar lengths proportionally so that a $5,000 category and a $50 category both render sensibly within an 80-character terminal width?',
      'How will you handle recurring transactions versus one-off major purchases?',
      'What data structures will best support filtering transactions dynamically by arbitrary date ranges?'
    ],
    extensions: [
      'Calculate an emergency fund runway indicator (how many months current savings will last based on average monthly burn rate).',
      'Generate automated budget advice flags when any category increases by >25% compared to the prior month.',
      'Export a rich text or HTML financial summary report.'
    ],
    estimatedTime: '85-115 mins',
    language: 'python'
  },
  {
    id: 'multi_user_task_manager',
    title: 'Multi-User Task Manager',
    difficulty: 'advanced',
    shortDescription: 'Build a multi-user project coordination CLI with user authentication, password hashing, and role permissions.',
    whatYouAreBuilding: 'A secure team task tracking CLI where users register, authenticate securely, and manage collaborative tasks based on role permissions.',
    goal: 'Understand authentication security fundamentals (salting & hashing), role-based access control (RBAC), and relational entity management.',
    requirements: [
      'Implement user registration and login using secure password hashing with salt (using Python\'s `hashlib`).',
      'Enforce password complexity rules on registration.',
      'Model distinct user roles: `Admin` and `Member`.',
      'Allow users to create, assign, update, and close tasks with priority levels (Low, Medium, High, Urgent).',
      'Enforce authorization: regular members can only edit their own assigned tasks, while admins can reassign or delete any task.',
      'Persist users and task states securely to disk.'
    ],
    skills: ['OOP', 'persistence', 'authentication concepts', 'validation'],
    topics: ['hashlib.sha256 with salt', 'Role-Based Access Control (RBAC)', 'Session state management in CLI', 'Entity relationship modeling'],
    thinkingPoints: [
      'Why is storing passwords hashed with a salt strictly necessary even for small personal projects?',
      'How will you maintain the active user session in your CLI loop without requiring the password on every action?',
      'How do you prevent a regular user from tampering with admin flags when editing profile details?'
    ],
    extensions: [
      'Implement task comment threads allowing team members to post updates on specific tasks.',
      'Add task due date reminders and overdue notifications upon login.',
      'Implement an activity audit trail logging who changed what task status.'
    ],
    estimatedTime: '90-120 mins',
    language: 'python'
  },
  {
    id: 'concurrent_file_downloader',
    title: 'Concurrent File Downloader',
    difficulty: 'advanced',
    shortDescription: 'Build a multi-threaded download manager that fetches files concurrently with real-time status and thread pool management.',
    whatYouAreBuilding: 'A high-throughput file retrieval CLI that distributes a batch of download URLs across multiple worker threads to maximize download speed.',
    goal: 'Master concurrency fundamentals, thread pool execution, thread synchronization, race condition avoidance, and network error resilience.',
    requirements: [
      'Accept a list or file containing download URLs and target destinations.',
      'Manage concurrent downloads using `concurrent.futures.ThreadPoolExecutor` or `threading`.',
      'Configure worker pool size (e.g. 4 concurrent worker threads).',
      'Display real-time per-file status: Queued, Downloading, Completed, or Failed.',
      'Ensure thread-safe terminal printing to prevent corrupted or interleaved console text.',
      'Handle connection failures and timeouts for individual files without crashing remaining workers.',
      'Produce a completion summary detailing download times, total bytes fetched, and error logs.'
    ],
    skills: ['threading', 'networking', 'files', 'error handling'],
    topics: ['concurrent.futures.ThreadPoolExecutor', 'threading.Lock for synchronized stdout output', 'Streaming HTTP responses in chunks', 'Exception handling inside worker threads'],
    thinkingPoints: [
      'Why does simultaneous console printing from multiple threads cause garbled text, and how does a `threading.Lock()` fix it?',
      'Why are threads well-suited for network downloads (I/O-bound tasks) compared to CPU-heavy number crunching?',
      'How should you stream file downloads in chunks to avoid loading a 500MB file entirely into RAM before writing to disk?'
    ],
    extensions: [
      'Calculate and display live download speeds (e.g. KB/s or MB/s).',
      'Support pausing and resuming downloads using HTTP Range request headers.',
      'Add automatic retries for failed downloads before declaring final failure.'
    ],
    estimatedTime: '80-110 mins',
    language: 'python'
  },
  {
    id: 'async_api_data_collector',
    title: 'Async API Data Collector',
    difficulty: 'advanced',
    shortDescription: 'Build an asynchronous event-driven data aggregator that fetches and merges data from multiple endpoints concurrently.',
    whatYouAreBuilding: 'A high-concurrency data collection tool leveraging Python\'s asyncio to query dozens of simulated or real API endpoints simultaneously.',
    goal: 'Understand modern asynchronous Python, the asyncio event loop, coroutines (`async`/`await`), tasks, and non-blocking I/O.',
    requirements: [
      'Define asynchronous coroutine functions using `async def` and `await`.',
      'Fetch data from multiple API endpoints or simulated network resources concurrently using `asyncio.gather()` or task groups.',
      'Benchmark and contrast total execution time between synchronous sequential fetching versus asynchronous concurrent fetching.',
      'Implement per-request timeout handling using `asyncio.wait_for()`.',
      'Merge and deduplicate responses from all endpoints into a consolidated dataset.',
      'Handle individual endpoint exceptions cleanly without canceling unrelated concurrent tasks.'
    ],
    skills: ['asyncio', 'HTTP requests', 'concurrency', 'JSON'],
    topics: ['asyncio event loop mechanics', 'async def and await keywords', 'asyncio.gather() and return_exceptions=True', 'asyncio.sleep() for non-blocking latency simulation'],
    thinkingPoints: [
      'What is the fundamental difference between multi-threading (OS-scheduled preemptive multitasking) and asyncio (cooperative single-threaded concurrency)?',
      'Why will calling a synchronous blocking function (like time.sleep() or requests.get()) inside an async function freeze the entire event loop?',
      'How does `return_exceptions=True` in `asyncio.gather()` protect your batch from failing if one endpoint returns an error?'
    ],
    extensions: [
      'Implement an async rate limiter using `asyncio.Semaphore` to cap maximum simultaneous connections (e.g. max 5 concurrent requests).',
      'Process results as they complete using `asyncio.as_completed()` rather than waiting for all to finish.',
      'Export the aggregated metrics to a consolidated JSON reporting file.'
    ],
    estimatedTime: '85-115 mins',
    language: 'python'
  },
  {
    id: 'mini_search_engine',
    title: 'Mini Search Engine',
    difficulty: 'advanced',
    shortDescription: 'Build an in-memory document indexing and keyword search engine using inverted indexes and TF-IDF relevance scoring.',
    whatYouAreBuilding: 'A full-text information retrieval engine that ingests documents, constructs an inverted index, and returns ranked search results.',
    goal: 'Understand search engine architecture, tokenization, stop-word filtering, inverted index data structures, and relevance ranking algorithms.',
    requirements: [
      'Ingest a corpus of text documents or articles and assign unique document IDs.',
      'Build a text normalization pipeline: lowercasing, punctuation stripping, and stop-word removal.',
      'Construct an Inverted Index mapping normalized terms to lists of document IDs and occurrence frequencies.',
      'Support single-term queries and multi-word boolean queries (AND / OR search logic).',
      'Implement relevance scoring (such as Term Frequency or simplified TF-IDF) to rank more relevant documents higher.',
      'Display search results with document titles, relevance scores, and matching snippet highlights.'
    ],
    skills: ['text processing', 'indexing', 'dictionaries', 'algorithms'],
    topics: ['Inverted index data structure (dict of dicts or dict of sets)', 'Tokenization and normalization algorithms', 'Term Frequency (TF) and Inverse Document Frequency (IDF) concepts', 'Set intersections & unions for boolean queries'],
    thinkingPoints: [
      'Why is querying an inverted index O(1) per word compared to scanning every character of every document linearly on every search?',
      'How will you generate a contextual snippet around the matched keyword to show the user why the document matched?',
      'How do you calculate Inverse Document Frequency (IDF) so common words across all documents carry less weight than rare specific terms?'
    ],
    extensions: [
      'Implement basic word stemming (e.g. reducing "running", "runs", "ran" to a common root).',
      'Add support for exact phrase matching (e.g. "machine learning").',
      'Save the constructed index to disk to enable fast startup without re-indexing every document.'
    ],
    estimatedTime: '90-125 mins',
    language: 'python'
  },
  {
    id: 'full_cli_project_management_system',
    title: 'Full CLI Project Management System',
    difficulty: 'advanced',
    shortDescription: 'Build a modular project management platform with sprint milestones, Kanban boards, and unit tests.',
    whatYouAreBuilding: 'An architectural capstone CLI application modeling software development projects, milestones, sprints, and task boards with modular architecture.',
    goal: 'Synthesize OOP, architectural patterns (Separation of Concerns / MVC), data persistence, automated unit testing, and complex terminal UI layout.',
    requirements: [
      'Architect the system with strict separation of concerns into distinct modules (Models, Storage/Repository, Services, and CLI View).',
      'Support multiple projects containing milestones, sprints, and task items with assigned owners, estimates, and deadlines.',
      'Render a dynamic ASCII Kanban Board in the terminal with columns: To-Do, In-Progress, Review, and Done.',
      'Allow moving tasks across workflow columns with state validation.',
      'Persist all system state to structured JSON/SQLite storage.',
      'Include automated unit tests (using Python\'s `unittest` module) that test core business logic independently from the CLI view.'
    ],
    skills: ['OOP', 'files/database', 'authentication concepts', 'testing', 'modular design'],
    topics: ['Layered architecture (Models, Repositories, Controllers, Views)', 'unittest test cases and assertions', 'Dynamic ASCII column layout formatting', 'JSON serialization with custom object decoders'],
    thinkingPoints: [
      'How does separating your business logic from input/print calls make automated testing possible without human interaction?',
      'How will you design your classes so that adding a new task state (e.g. "Blocked") doesn\'t break your Kanban board renderer?',
      'How can you ensure that deleting a project cascades properly or warns the user about orphaned tasks?'
    ],
    extensions: [
      'Calculate sprint velocity and generate burndown metrics.',
      'Implement task search and multi-criteria filters (by assignee, by milestone, by priority).',
      'Export a project summary report in Markdown format.'
    ],
    estimatedTime: '100-140 mins',
    language: 'python'
  }
];
