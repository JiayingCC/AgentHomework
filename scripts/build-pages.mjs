import {cp,mkdir,readFile,readdir,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'build/pages');
const current=path.join(root,'assignments/03-ink-and-wishes/site');

// Publish only Ink & Wishes website assets, never repository metadata or notes.
async function checkSource(folder){
  for(const entry of await readdir(folder,{withFileTypes:true})){
    if(entry.isSymbolicLink())throw new Error(`Website source contains a symlink: ${entry.name}`);
    if(entry.isDirectory())await checkSource(path.join(folder,entry.name));
  }
  return folder;
}
await checkSource(current);
await readFile(path.join(current,'index.html'));
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
await cp(current,output,{recursive:true});
await writeFile(path.join(output,'.nojekyll'),'');
const commit=process.env.GITHUB_SHA||'local-preview';
await writeFile(path.join(output,'deployment.json'),JSON.stringify({project:'Ink & Wishes',commit},null,2)+'\n');
console.log('Pages bundle ready: Ink & Wishes at /.');
