import fs from 'fs';
import path from 'path';

const dir = 'C:\\Air\\Enfoque-Tecnol-gico\\src\\components';
const files = [
  'MisionDiagnostico.tsx',
  'MisionVolcan.tsx',
  'MisionInundacion.tsx',
  'MisionSismo.tsx',
  'MisionEvacuacion.tsx',
  'Quiz.tsx'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find where we do the Math.max and set the new level
  // It handles the format from my previous fix.
  // In Quiz: const nivelSugerido = niveles[tipo];
  // In Mision: const nuevoNivel = Math.max(nivelActual, 2); (where 2 is the level)

  if (file === 'Quiz.tsx') {
    const search = `    const nuevoNivel = Math.max(nivelActual, nivelSugerido);\n\n    localStorage.setItem('agenteNivel', nuevoNivel.toString());`;
    const replace = `    const nuevoNivel = Math.max(nivelActual, nivelSugerido);\n\n    if (nivelSugerido > nivelActual) {\n      localStorage.setItem('justLeveledUp', nuevoNivel.toString());\n    }\n\n    localStorage.setItem('agenteNivel', nuevoNivel.toString());`;
    content = content.replace(search, replace);
  } else {
    // For Mision components
    // Example: const nuevoNivel = Math.max(nivelActual, 2);
    const searchRegex = /const nuevoNivel = Math\.max\(nivelActual, (\d+)\);\n\s*localStorage\.setItem\('agenteNivel', nuevoNivel\.toString\(\)\);/;
    content = content.replace(searchRegex, (match, p1) => {
      return `const nuevoNivel = Math.max(nivelActual, ${p1});\n    if (${p1} > nivelActual) {\n      localStorage.setItem('justLeveledUp', nuevoNivel.toString());\n    }\n    localStorage.setItem('agenteNivel', nuevoNivel.toString());`;
    });
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
