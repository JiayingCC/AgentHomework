import {mkdir, copyFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'assignments/02-mindplay/site');
const destination = path.resolve(process.argv[2] || path.join(root, 'docs'));
await mkdir(destination, {recursive: true});
for (const file of ['index.html', 'style.css', 'app.mjs', 'core.mjs', 'learning.mjs', 'favicon.svg']) {
  await copyFile(path.join(source, file), path.join(destination, file));
}
await writeFile(path.join(destination, '.nojekyll'), '');
console.log(`Exported the six website files and .nojekyll to ${destination}`);
