export interface LanguageDefinition {
  id: string;
  label: string;
  monacoLanguage: string;
  fileExtension: string;
  executionSupported: boolean;
  defaultFileName: string;
  starterTemplate: string;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  {
    id: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    fileExtension: '.py',
    executionSupported: true,
    defaultFileName: 'main.py',
    starterTemplate: `# Python Playground
# Write and execute any Python code freely

def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("World"))

# Try lists, loops, dictionary manipulations or custom logic:
numbers = [1, 2, 3, 4, 5]
squares = [n ** 2 for n in numbers]
print("Squares:", squares)
`
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    fileExtension: '.js',
    executionSupported: false,
    defaultFileName: 'index.js',
    starterTemplate: `// JavaScript (Coming soon)
console.log("JavaScript support is coming soon!");
`
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    monacoLanguage: 'typescript',
    fileExtension: '.ts',
    executionSupported: false,
    defaultFileName: 'index.ts',
    starterTemplate: `// TypeScript (Coming soon)
console.log("TypeScript support is coming soon!");
`
  },
  {
    id: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    fileExtension: '.cpp',
    executionSupported: false,
    defaultFileName: 'main.cpp',
    starterTemplate: `// C++ (Coming soon)
#include <iostream>

int main() {
    std::cout << "C++ support is coming soon!" << std::endl;
    return 0;
}
`
  }
];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES[0];

export function getLanguageById(id: string): LanguageDefinition {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || DEFAULT_LANGUAGE;
}
