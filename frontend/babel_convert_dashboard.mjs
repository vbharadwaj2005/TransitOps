import fs from 'fs';
import path from 'path';
import babel from '@babel/core';

const srcDir = 'C:/Users/angel/OneDrive/Desktop/cooking/tasko-reference/components/dashboard';
const destDir = 'C:/Users/angel/OneDrive/Desktop/cooking/TransitOps/frontend/src/components/dashboard';

const components = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

components.forEach(comp => {
  const srcPath = path.join(srcDir, comp);
  let code = fs.readFileSync(srcPath, 'utf8');
  
  const result = babel.transformSync(code, {
    filename: srcPath,
    presets: [
      ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
    ],
    retainLines: false,
    generatorOpts: { retainLines: true }
  });
  
  let outCode = result.code;
  
  // Strip use client
  outCode = outCode.replace(/['"]use client['"];?\n?/g, '');
  
  // Replace next/link
  outCode = outCode.replace(/import\s+(?:type\s+)?Link\s+from\s+['"]next\/link['"];?/g, 'import { Link } from "react-router-dom";');
  
  // Strip any type imports leftover
  outCode = outCode.replace(/import\s+type\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\n?/g, '');
  outCode = outCode.replace(/import\s+{[^}]*type [^}]+}\s+from/g, match => match.replace(/,\s*type\s+\w+/g, '').replace(/type\s+\w+\s*,?/g, ''));

  const destPath = path.join(destDir, comp.replace('.tsx', '.jsx'));
  fs.writeFileSync(destPath, outCode);
  console.log('Babel Converted', comp);
});
