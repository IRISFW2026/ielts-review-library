import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=await readFile(path.join(root,'assets/listening-cards-1102/data.js'),'utf8');
const app=await readFile(path.join(root,'assets/listening-cards-1102/cards.js'),'utf8');
const storage=new Map(),elements=new Map(),scheduled=[],spoken=[];
const element=id=>elements.get(id)||elements.set(id,{textContent:'',innerHTML:'',value:'',hidden:false,children:[],addEventListener(){},scrollIntoView(){},click(){}}).get(id);
const synthesis={cancel(){},getVoices:()=>[{voiceURI:'test-GB',name:'English UK',lang:'en-GB'}],speak:u=>spoken.push(u),addEventListener(){}};
const context={window:{speechSynthesis:synthesis,addEventListener(){}},document:{body:{dataset:{material:'station'}},getElementById:element,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({click(){}})},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},SpeechSynthesisUtterance:class{constructor(text){this.text=text}},setTimeout:fn=>{scheduled.push(fn);return scheduled.length},clearTimeout(){},URL,Blob,Date,console};
context.window.window=context.window;
vm.createContext(context);vm.runInContext(data,context);vm.runInContext('var LISTENING_CARDS_1102=window.LISTENING_CARDS_1102;',context);
vm.runInContext(app+`\nglobalThis.test={getCards:()=>DATA.cards,getQueue:()=>queue,getIndex:()=>index,getRecords:()=>records,flip,grade,filtered,speak,stop,validRecords,importProgress,setScope:s=>{scope=s;rebuild()},setType:t=>{type=t;rebuild()},setQuery:q=>{search=q;rebuild()},getSettings:()=>settings};`,context);
const t=context.test,cards=t.getCards();
assert.equal(cards.length,193);assert.equal(new Set(cards.map(c=>c.id)).size,193);
for(const c of cards){assert.ok(c.source.en&&c.source.zh,c.en);assert.equal(c.examples.length,4,c.en);assert.deepEqual(Array.from(c.examples,e=>e.skill),['听力','口语','阅读','写作']);for(const e of [...c.examples,...c.collocations])assert.ok(e.en.trim()&&e.zh.trim(),c.en);assert.ok(['word','phrase','collocation'].includes(c.type));}
assert.equal(t.getQueue().length,81);
assert.ok(!element('study').innerHTML.includes('听力材料原句'),'Back must not be present before reveal');
t.flip();assert.ok(element('study').innerHTML.includes('听力材料原句'));assert.ok(element('study').innerHTML.includes('听说读写拓展'));
const first=t.getQueue()[0];t.grade(4);assert.equal(t.getIndex(),1);assert.equal(t.getRecords()[first.id].level,4);assert.ok(t.getRecords()[first.id].due>Date.now());
t.setScope('mastered');assert.equal(t.getQueue().length,1);t.setScope('due');assert.equal(t.getQueue().length,0);t.setScope('all');t.setQuery('东南');assert.ok(t.getQueue().length>0);assert.ok(t.getQueue().some(c=>c.en==='southeast'));
t.setQuery('no-such-card-9898383');assert.equal(t.getQueue().length,0);t.setQuery('');t.setType('word');assert.ok(t.getQueue().every(c=>c.type==='word'));t.setType('all');
assert.throws(()=>t.validRecords({[first.id]:{level:9,due:0,reps:1}}));assert.throws(()=>t.validRecords({[first.id]:{level:2,due:-1,reps:1}}));assert.equal(Object.keys(t.validRecords({'unknown-card':{level:9}})).length,0);
// An older import must not overwrite a newer learning event.
const r={...t.getRecords()[first.id]};await t.importProgress({size:50,text:async()=>JSON.stringify({format:'iris-listening-cards-1102-v1',version:1,records:{[first.id]:{...r,level:1,lastSeen:r.lastSeen-1000}}})});assert.equal(t.getRecords()[first.id].level,4);
await t.importProgress({size:50,text:async()=>JSON.stringify({format:'iris-listening-cards-1102-v1',version:1,records:{[first.id]:{...r,level:2,lastSeen:r.lastSeen+1000}}})});assert.equal(t.getRecords()[first.id].level,2);
// Speech follows the selected rate, plays every requested segment, and cancels stale sequences.
t.speak(['First sentence.','Second sentence.'],false,1);assert.equal(spoken.at(-1).text,'First sentence.');assert.equal(spoken.at(-1).rate,.9);spoken.at(-1).onend();scheduled.pop()();assert.equal(spoken.at(-1).text,'Second sentence.');const old=spoken.at(-1);t.stop();const before=spoken.length;old.onend();assert.equal(spoken.length,before);t.speak('Slow sentence.',true,1);assert.equal(spoken.at(-1).rate,.7);
assert.ok(storage.has('iris-listening-cards-1102-v1'));
// Reload restores progress from the persisted payload.
const reloaded=JSON.parse(storage.get('iris-listening-cards-1102-v1'));assert.equal(reloaded.records[first.id].level,2);
console.log('PASS: 193 complete cards; reveal, grading, filters, persistence, import conflict handling, and speech queue cancellation.');
