import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/angel/OneDrive/Desktop/cooking/tasko-reference/components/ui';
const destDir = 'C:/Users/angel/OneDrive/Desktop/cooking/TransitOps/frontend/src/components/ui';

const components = [
  'button.tsx', 'card.tsx', 'badge.tsx', 'table.tsx', 'tabs.tsx', 
  'input.tsx', 'avatar.tsx', 'sidebar.tsx', 'sheet.tsx', 'tooltip.tsx', 
  'dropdown-menu.tsx', 'separator.tsx', 'skeleton.tsx'
];

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

function stripTypes(code) {
  // Strip use client
  code = code.replace(/["']use client["'];?\s*/g, '');

  // Regex to strip interface declarations
  code = code.replace(/export interface \w+(?: extends [^{]+)?\s*\{[^}]*\}/gs, '');
  code = code.replace(/interface \w+(?: extends [^{]+)?\s*\{[^}]*\}/gs, '');
  
  // Regex to strip type declarations
  code = code.replace(/export type \w+ = [^;]+;/gs, '');
  
  // Strip React.forwardRef<...> to React.forwardRef
  code = code.replace(/React\.forwardRef<[^>]+>\(/g, 'React.forwardRef(');
  
  // Strip parameter types e.g. ({ className }: CardProps) => ...
  code = code.replace(/:\s*[A-Z][a-zA-Z]+Props(?:\s*(?:<[^>]+>))?/g, '');
  code = code.replace(/:\s*React\.HTMLAttributes<[^>]+>/g, '');
  code = code.replace(/:\s*React\.ButtonHTMLAttributes<[^>]+>/g, '');
  code = code.replace(/:\s*React\.ComponentProps<[^>]+>/g, '');
  code = code.replace(/:\s*React\.ComponentPropsWithoutRef<[^>]+>/g, '');
  code = code.replace(/:\s*React\.ElementRef<[^>]+>/g, '');
  code = code.replace(/:\s*boolean/g, '');
  code = code.replace(/:\s*string/g, '');
  code = code.replace(/:\s*any/g, '');
  
  // Strip inline type definitions like `} & { ... }`
  code = code.replace(/\}\s*&\s*\{[^}]+\}/g, '}');
  code = code.replace(/:\s*\{[^}]+\}/g, '');
  code = code.replace(/:\s*\([^)]*\)\s*=>\s*[^,}]+/g, '');
  code = code.replace(/as React\.CSSProperties/g, '');
  
  // Strip generic types
  code = code.replace(/<[A-Za-z0-9]+(?:\s*\|\s*[A-Za-z0-9]+)*>/g, '');

  code = code.replace(/import Link from "next\/link"/g, 'import { Link } from "react-router-dom"');
  code = code.replace(/import \{ Link \} from "next\/link"/g, 'import { Link } from "react-router-dom"');
  
  return code;
}

components.forEach(comp => {
  const srcPath = path.join(srcDir, comp);
  if (!fs.existsSync(srcPath)) {
    console.log(`Skipping ${comp}, not found.`);
    return;
  }
  let content = fs.readFileSync(srcPath, 'utf8');
  content = stripTypes(content);
  
  const destPath = path.join(destDir, comp.replace('.tsx', '.jsx'));
  fs.writeFileSync(destPath, content);
  console.log('Converted', comp);
});
