import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd();
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const engine=read('assets/reading-brassica/app.js');
function harness(entry,{storage=new Map(),hash='#cards',seed}={}) {
  const elements=new Map(),events={},spoken=[];
  const element=id=>{
    if(!elements.has(id)) elements.set(id,{id,style:{},dataset:{},value:'',innerHTML:'',textContent:'',hidden:false,
      classList:{toggle(){}},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},focus(){},scrollIntoView(){}});
    return elements.get(id);
  };
  const context={console,Date,Blob,URL,Set,Map,JSON,Number,Math,String,Object,
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    location:{hash},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,
    document:{getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,activeElement:{tagName:'BODY'},
      addEventListener(name,fn){(events[name]??=[]).push(fn)},createElement(){return {click(){},remove(){}}}},
    addEventListener(name,fn){(events['window:'+name]??=[]).push(fn)},
    speechSynthesis:{getVoices(){return [{voiceURI:'test',name:'Test English',lang:'en-GB',localService:true}]},cancel(){},speak(utterance){spoken.push(utterance.text)}},
    SpeechSynthesisUtterance:class{constructor(text){this.text=text}},
    KakapoCloudSync:{init(){},localChanged(){},settingsHTML(){return '<p>Private sync settings</p>'},bindSettings(){}}
  };
  context.window=context;
  vm.createContext(context);
  vm.runInContext(read('assets/reading-brassica/'+entry.id+'.js'),context);
  const config=context.READING_REVIEW_CONFIG;
  if(seed)storage.set(config.storageKey,JSON.stringify(seed));
  vm.runInContext(engine,context,{filename:'reading-brassica/app.js'});
  return {context,element,events,spoken,storage,config,data:context.READING_REVIEW_DATA,run:code=>vm.runInContext(code,context)};
}





const entry={id:'global-warming-in-new-zealand-1111'};
const seed={records:{'gwnz-001':{level:3,reps:4,intervalDays:7,due:Date.now()+86400000,updated:123},'__sentenceDifficulty__:22':{updated:124,removed:false,reasons:['structure'],note:'existing note'}}};
const h=harness(entry,{hash:'#library',seed});
assert.equal(h.config.storageKey,'iris-global-warming-new-zealand-1111-v1');assert.equal(h.config.storageFormat,'deck');
assert.equal(h.data.items.length,227);assert.equal(h.data.sentences.length,47);
assert.equal(createHash('sha256').update(JSON.stringify(h.data.sentences.map(s=>s.en))).digest('hex'),'4bc19e7b240b7a61fa7cb245fbacec78ad1363ad41c105cc900349cf43872552');
assert.equal(createHash('sha256').update(JSON.stringify(h.data.items.map(x=>[x.id,x.term,x.stars,x.type]))).digest('hex'),'973556bf786d0d542359a42e4eaa9789befb08cedf6b8d624a6fad98f2d89cc8');
const audit=JSON.parse(read('tests/gwnz-original-bindings.json'));
assert.equal(audit.length,227);
let original=0,without=0;
for(const row of audit){
 const x=h.data.items.find(x=>x.id===row.id);assert.equal(x.term,row.term);assert.equal(x.origin,row.origin);
 if(row.sentenceId){
  original++;assert.equal(x.examples.length,1);const e=x.examples[0],s=h.data.sentences[e.number-1];
  assert.equal(s.id,row.sentenceId);assert.equal(e.source,'original');assert.equal(e.en,s.en);assert.equal(e.zh,s.zh);assert.equal(e.paragraph,s.paragraph);
  assert.ok(s.en.includes(row.form));assert.equal(x.sourceId,s.id);assert.equal(x.paragraph,s.paragraph);
 }else{without++;assert.equal(x.examples.length,0);assert.equal(x.sourceId,null);assert.equal(x.paragraph,null);assert.notEqual(x.contextLabel,'本文义');}
 h.run(`current=DATA.items.find(x=>x.id===${JSON.stringify(x.id)});revealed=true;view='cards';render()`);
 const html=h.element('app').innerHTML;
 assert.equal((html.match(/class="example-item"/g)||[]).length,x.examples.length);
 assert.equal((html.match(/data-sentence-flag-toggle=/g)||[]).length,x.examples.length);
 assert.ok(!html.includes('example-source-supplemental'));
 assert.ok(html.includes('>'+x.contextLabel+'</span>'));
 if(x.examples.length){const e=x.examples[0];assert.ok(html.includes(h.run('escapeHTML('+JSON.stringify(e.en)+')')));assert.ok(html.includes('data-sentence-flag-toggle="'+e.number+'"'));}
}
assert.equal(original,168);assert.equal(without,59);
assert.equal(h.data.items.reduce((n,x)=>n+x.examples.filter(e=>e.source!=='original').length,0),0);
assert.deepEqual(Array.from(h.data.examples),[]);
const get=id=>h.data.items.find(x=>x.id===id);
assert.equal(get('gwnz-175').sourceId,'D5');assert.ok(get('gwnz-175').examples[0].en.includes('tough periods'));
for(const id of ['gwnz-021','gwnz-028','gwnz-034','gwnz-094','gwnz-140','gwnz-164','gwnz-227'])assert.equal(get(id).examples.length,0);
assert.equal(get('gwnz-034').contextLabel,'题目释义');assert.equal(get('gwnz-164').contextLabel,'题目释义');
assert.equal(get('gwnz-116').zh.split('；')[0],'测量指标');assert.equal(get('gwnz-031').zh.split('；')[0],'占……比例');
assert.equal(get('gwnz-134').zh.split('；')[0],'区段');
assert.equal(h.run("contextLabel({})"),'本文义','other decks retain their default label');
assert.equal(h.run("state['gwnz-001'].level"),3);assert.equal(h.run('sentenceFlagEntries().length'),1);
h.run("current=DATA.items[0];revealed=true;grade(4)");assert.equal(h.run("state['gwnz-001'].level"),4);
const reloaded=harness(entry,{storage:h.storage,hash:'#sentences'});assert.equal(reloaded.run("state['gwnz-001'].level"),4);assert.equal(reloaded.run('sentenceFlagEntries().length'),1);
assert.ok(reloaded.element('sentence-collection').innerHTML.includes('existing note'));
const page=read('reviews/2026-11-11/reading/exam/global-warming-in-new-zealand/index.html');assert.equal((page.match(/v=20261123-original-examples/g)||[]).length,2);
console.log('PASS: 227 rendered card backs; 168 exact original bindings; 59 unsupported bindings removed; no supplemental examples; correct labels/meanings; unchanged identity, source English and stored progress.');
