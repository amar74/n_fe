import { generateZodClientFromOpenAPI, getHandlebars } from 'openapi-zod-client';
const hbs = getHandlebars();

hbs.registerHelper('customAlias', (path: string, method: string) => {
  const map: Record<string, string> = {};
  return map[`${method}:${path}`] || `${method}_${path}`.replace(/[\/:]/g, '_');
});

// Read OpenAPI URL from CLI args or env, fallback to local server
const argv = process.argv.slice(2);
let openApiUrl = process.env.OPENAPI_URL;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (!arg.startsWith('-') && !openApiUrl) {
    openApiUrl = arg;
    break;
  }
  if (arg === '--url' || arg === '-u') {
    openApiUrl = argv[i + 1];
    break;
  }
  const match = arg.match(/^--url=(.+)$/);
  if (match) {
    openApiUrl = match[1];
    break;
  }
}
openApiUrl = openApiUrl || 'http://127.0.0.1:8000/openapi.json';

const res = await fetch(openApiUrl);
const openApiDoc = await res.json(); // cast if you want: as unknown as OpenAPIObject


await generateZodClientFromOpenAPI({
  // @ts-ignore
  openApiDoc,
  distPath: './src/types/generated/',
  handlebars: hbs,
  options: {
    groupStrategy: 'tag-file',
    exportTypes: true,
    withAlias: true,
  }
});

// Post-generation fix: Remove problematic Zodios exports without baseURL
// These cause "pt is not a constructor" errors in production
console.log('\n🔧 Fixing generated files...');
const fs = await import('fs');
const path = await import('path');

const generatedDir = './src/types/generated/';
const files = fs.readdirSync(generatedDir).filter((f: string) => f.endsWith('.ts'));

let fixedCount = 0;
for (const file of files) {
  const filePath = path.join(generatedDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove lines like: export const SomeApi = new Zodios(endpoints);
  const originalContent = content;
  content = content.replace(/^export const \w+Api = new Zodios\(endpoints\);$/gm, '');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`  ✓ Fixed ${file}`);
  }
}

console.log(`✅ Fixed ${fixedCount} files to prevent constructor errors\n`);