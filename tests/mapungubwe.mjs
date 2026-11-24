import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd();
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const engine=read('assets/reading-brassica/article-app.js');
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




const entry={id:'mapungubwe-1124'},h=harness(entry);
assert.equal(h.data.items.length,207);assert.equal(h.data.sentences.length,36);assert.equal(h.data.examples.length,0);
assert.deepEqual([...new Set(h.data.sentences.map(s=>s.paragraph))],['导语',...'ABCDEFG']);
assert.deepEqual(['导语',...'ABCDEFG'].map(p=>h.data.sentences.filter(s=>s.paragraph===p).length),[1,5,6,5,4,6,6,3]);
const rebuilt=['导语',...'ABCDEFG'].map(p=>h.data.sentences.filter(s=>s.paragraph===p).map(s=>s.en).join(' ')).join('\n\n')+'\n';
assert.equal(createHash('sha256').update(rebuilt).digest('hex'),'3a78a1644cc06bfc42865e338d5b9c8a8352fac893d77a7ebde12046b6c57c2b');
assert.equal(h.run('PARAGRAPH_RANGE'),'A–G');assert.equal(h.config.storageKey,'iris-mapungubwe-1124-v1');
let previous=[0,0];
for(const x of h.data.items){
 assert.ok(x.zh&&x.pos&&x.note);assert.ok(x.stars>=1&&x.stars<=5);assert.equal(x.examples.length,1);
 const e=x.examples[0],s=h.data.sentences[e.number-1];
 assert.equal(e.source,'original');assert.equal(e.en,s.en);assert.equal(e.zh,s.zh);assert.equal(e.paragraph,s.paragraph);assert.equal(x.sourceId,s.id);assert.equal(x.paragraph,s.paragraph);
 assert.equal(s.en.indexOf(x.sourceTerm),x.sourceOffset);assert.equal(x.originalBinding.form,x.sourceTerm);assert.equal(x.originalBinding.sentenceId,s.id);
 assert.ok(e.number>previous[0]||e.number===previous[0]&&x.sourceOffset>=previous[1],x.term);previous=[e.number,x.sourceOffset];
 h.run(`current=DATA.items.find(x=>x.id===${JSON.stringify(x.id)});revealed=true;view='cards';render()`);
 const html=h.element('app').innerHTML;assert.equal((html.match(/class="example-item"/g)||[]).length,1);assert.ok(!html.includes('example-source-supplemental'));assert.ok(html.includes('data-sentence-flag-toggle="'+e.number+'"'));
 assert.ok(html.includes(h.run('escapeHTML('+JSON.stringify(s.en)+')')));assert.ok(!html.includes('class="ipa" lang="en-GB">//'));
}
const get=term=>h.data.items.find(x=>x.term===term);
for(const [term,number] of [['occupation',10],['complex',10],['socket',14],['remains',18],['vessel',23],['stamps',23],['sheet',29],['currency',33]])assert.equal(get(term).examples[0].number,number,term);
assert.ok(get('finds').pos.includes('名词'));assert.ok(get('some + 数字').audioTerm);assert.equal(get('c. 1150').audioTerm,'circa eleven fifty');
for(const view of ['cards','library','sentences','quiz','settings']){h.run('navigate('+JSON.stringify(view)+')');assert.ok(h.element('app').innerHTML.length>50)}
h.run("navigate('sentences')");assert.equal((h.element('sentence-list').innerHTML.match(/class="paragraph-heading"/g)||[]).length,8);
assert.ok(!h.element('app').innerHTML.includes('<h2>Mapungubwe</h2>'));assert.ok(!h.run('analysisPage()').includes('<details>'));assert.ok(h.run('analysisPage()').includes('逐题答案和错因资料待补'));
h.run("view='cards';current=DATA.items[0];revealed=false;render()");
const keyEvent=key=>({key,code:key===' '?'Space':key,target:{tagName:'BODY',closest(){return null}},preventDefault(){}});
for(const f of h.events.keydown||[])f(keyEvent('Enter'));assert.equal(h.run('revealed'),true);
for(const f of h.events.keydown||[])f(keyEvent(' '));assert.equal(h.spoken.at(-1),h.data.sentences[0].en);
for(const f of h.events.keydown||[])f(keyEvent('3'));assert.equal(h.run("state['map-001'].level"),3);
h.run("state[sentenceFlagKey(14)]={updated:124,removed:false,reasons:['structure'],note:'我的台阶孔槽难点'};save();navigate('sentences')");
assert.ok(h.element('sentence-collection').innerHTML.includes('我的台阶孔槽难点'));assert.ok(h.element('sentence-collection').innerHTML.includes('sockets for the steps'));
const r=harness(entry,{storage:h.storage,hash:'#sentences'});assert.equal(r.run("state['map-001'].level"),3);assert.equal(r.run('sentenceFlagEntries().length'),1);
for(const stage of ['all','due','new','learning','mature'])assert.ok(h.run('studyStageControls()').includes('data-study-stage="'+stage+'"'));
h.run("studyStage='due';buildQueue()");assert.equal(h.run('current'),null);
h.run("studyStage='learning';buildQueue()");assert.equal(h.run('current.id'),'map-001');
const catalog=JSON.parse(read('catalog.json')),c=catalog.entries.find(x=>x.id===entry.id);assert.equal(c.date,'2026-11-24');assert.ok(c.dateBasis.includes('未标注'));assert.ok(read('index.html').includes(c.url));assert.ok(read('README.md').includes(c.url));
const page=read(c.path);assert.ok(page.includes('article-app.js?v=20261124-mapungubwe'));assert.ok(page.includes('/ielts-review-library/index.html'));assert.equal((page.match(/<figure /g)||[]).length,2);assert.ok(page.includes('mapungubwe-1124.jpg'));assert.ok(!page.includes('1020'));
console.log('PASS: 207 rendered cards, 36 verbatim original sentences, separate introduction and A–G, exact examples/translations, keyboard controls, stage filters, difficulty-note persistence, image attribution and catalog links.');
