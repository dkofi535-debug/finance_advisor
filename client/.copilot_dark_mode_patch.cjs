const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Dashboard.jsx',
  'src/pages/Transactions.jsx',
  'src/pages/Budgets.jsx',
  'src/pages/Savings.jsx',
  'src/pages/Reports.jsx',
  'src/components/layout.jsx',
];

const replacements = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-950',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-800',
  'border-slate-200': 'border-slate-200 dark:border-slate-800',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'text-slate-900': 'text-slate-900 dark:text-slate-100',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'bg-blue-50': 'bg-blue-50 dark:bg-slate-900',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-slate-900',
  'bg-red-50': 'bg-red-50 dark:bg-slate-950',
  'bg-green-50': 'bg-green-50 dark:bg-slate-950',
  'bg-gray-50': 'bg-gray-50 dark:bg-slate-800',
  'bg-gray-100': 'bg-gray-100 dark:bg-slate-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-slate-800',
  'border-gray-200': 'border-gray-200 dark:border-slate-700',
  'border-gray-100': 'border-gray-100 dark:border-slate-800',
  'border-gray-300': 'border-gray-300 dark:border-slate-700',
  'text-gray-900': 'text-gray-900 dark:text-slate-100',
  'text-gray-700': 'text-gray-700 dark:text-slate-300',
  'text-gray-600': 'text-gray-600 dark:text-slate-400',
  'text-gray-500': 'text-gray-500 dark:text-slate-400',
  'bg-red-100': 'bg-red-100 dark:bg-red-900',
  'bg-green-100': 'bg-green-100 dark:bg-emerald-900',
  'bg-blue-100': 'bg-blue-100 dark:bg-slate-800',
  'bg-emerald-100': 'bg-emerald-100 dark:bg-slate-800',
  'bg-sky-50': 'bg-sky-50 dark:bg-slate-900',
  'bg-indigo-600': 'bg-indigo-600 dark:bg-indigo-500',
  'bg-purple-600': 'bg-purple-600 dark:bg-purple-500',
  'hover:bg-gray-50': 'hover:bg-gray-50 dark:hover:bg-slate-800',
  'hover:bg-slate-50': 'hover:bg-slate-50 dark:hover:bg-slate-800',
  'hover:bg-blue-100': 'hover:bg-blue-100 dark:hover:bg-slate-800',
  'border-blue-100': 'border-blue-100 dark:border-blue-900',
  'border-emerald-100': 'border-emerald-100 dark:border-emerald-900',
};

for (const relativePath of files) {
  const filePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`file not found: ${relativePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  for (const [search, replace] of Object.entries(replacements)) {
    updatedContent = updatedContent.split(search).join(replace);
  }

  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`updated ${relativePath}`);
  }
}

const cssPath = path.join(__dirname, 'src', 'index.css');
const cssContent = `@import "tailwindcss";

:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;
}

html {
  background: #f8fafc;
}

.dark html {
  background: #0f172a;
}

body {
  min-height: 100vh;
  background: inherit;
  color: inherit;
}
`;
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('updated src/index.css');
