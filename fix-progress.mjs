import fs from 'fs';
import path from 'path';

const dir = 'C:\\Air\\Enfoque-Tecnol-gico\\src\\components';
const misiones = [
  { file: 'MisionDiagnostico.tsx', nivel: 2 },
  { file: 'MisionVolcan.tsx', nivel: 3 },
  { file: 'MisionInundacion.tsx', nivel: 4 },
  { file: 'MisionSismo.tsx', nivel: 5 },
  { file: 'MisionEvacuacion.tsx', nivel: 6 }
];

misiones.forEach(({ file, nivel }) => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Buscar localStorage.setItem('agenteNivel', 'X');
  const findStr1 = `localStorage.setItem('agenteNivel', '${nivel}');`;
  const replaceStr1 = `const nivelActual = Number(localStorage.getItem('agenteNivel') || '1');\n    const nuevoNivel = Math.max(nivelActual, ${nivel});\n    localStorage.setItem('agenteNivel', nuevoNivel.toString());`;

  // Buscar nivel: X, en el update de supabase
  const findStr2 = `nivel: ${nivel},`;
  const replaceStr2 = `nivel: nuevoNivel,`;

  if (content.includes(findStr1)) {
    content = content.replace(findStr1, replaceStr1);
    content = content.replace(findStr2, replaceStr2);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
