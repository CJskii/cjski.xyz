import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('article author structured identity links the approved X and GitHub profiles',async()=>{
 const page=await readFile(new URL('../blog/src/pages/[slug].astro',import.meta.url),'utf8');
 const match=page.match(/sameAs:\s*(\[[^\]]+\])/);
 assert.ok(match,'article author sameAs must be defined');
 const links=JSON.parse(match[1].replaceAll("'",'"'));
 assert.deepEqual(new Set(links),new Set(['https://x.com/cjski_','https://github.com/CJskii']));
});
