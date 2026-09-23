import {MAX_WORKS, validateWork} from './core.mjs';
let connection;
export function openStore() {
  if (connection) return connection;
  connection = new Promise((resolve,reject)=>{
    if (!globalThis.indexedDB) return reject(new Error('Saving is unavailable in this browser. Download your artwork instead.'));
    const request = indexedDB.open('ink-and-wishes',1);
    request.onupgradeneeded = ()=>request.result.createObjectStore('works',{keyPath:'id'});
    request.onsuccess = ()=>{const db=request.result; db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
    request.onerror = ()=>reject(new Error('Your browser could not open local storage. Your current drawing is still here.'));
    request.onblocked = ()=>reject(new Error('Close other Ink & Wishes tabs and try saving again.'));
  }).catch(error=>{connection=null;throw error;});
  return connection;
}
export async function listWorks() {
  const db=await openStore();
  return new Promise((resolve,reject)=>{const tx=db.transaction('works','readonly');const req=tx.objectStore('works').getAll();let rows;
    req.onsuccess=()=>{rows=req.result;};tx.oncomplete=()=>resolve(rows.sort((a,b)=>b.updatedAt-a.updatedAt));tx.onerror=()=>reject(new Error('Your collection could not be read. Try again.'));tx.onabort=()=>reject(new Error('Reading your collection was interrupted.'));
  });
}
export async function putWork(work,{replace=false}={}) {
  validateWork(work);const db=await openStore();
  return new Promise((resolve,reject)=>{
    let reason='The work could not be saved. Your current drawing is still available to download.';
    const tx=db.transaction('works','readwrite'),store=tx.objectStore('works');
    const request=store.getAll();request.onsuccess=()=>{
      const exists=request.result.some(w=>w.id===work.id);
      if(exists&&!replace){reason='This saved work changed. Confirm replacement before saving.';tx.abort();return;}
      if(!exists&&request.result.length>=MAX_WORKS){reason='Your collection has three works. Choose one to replace.';tx.abort();return;}
      store.put(work);
    };
    tx.oncomplete=()=>resolve(work);tx.onabort=()=>reject(new Error(reason));tx.onerror=()=>reject(new Error(reason));
  });
}
export async function removeWork(id) {
  const db=await openStore();return new Promise((resolve,reject)=>{const tx=db.transaction('works','readwrite');tx.objectStore('works').delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('This work could not be removed.'));tx.onabort=()=>reject(new Error('Removing this work was interrupted.'));});
}
