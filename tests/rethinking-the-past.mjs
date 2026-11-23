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




const entry={id:'rethinking-the-past-1020'},h=harness(entry);
assert.equal(h.data.items.length,208);assert.equal(h.data.sentences.length,49);
assert.deepEqual([...new Set(h.data.sentences.map(x=>x.paragraph))],'ABCDEFGHI'.split(''));
assert.deepEqual('ABCDEFGHI'.split('').map(p=>h.data.sentences.filter(s=>s.paragraph===p).length),[3,4,7,7,8,6,4,7,3]);
const rebuilt='ABCDEFGHI'.split('').map(p=>h.data.sentences.filter(s=>s.paragraph===p).map(s=>s.en).join(' ')).join('\n\n')+'\n';
assert.equal(createHash('sha256').update(rebuilt).digest('hex'),'221a9cd359e6ef5e6d843dfd30b3455fdd28634bfc4a1304f2a087cc994f3ebe');
let previous=[0,0];
for(const item of h.data.items){
 assert.ok(item.stars>=1&&item.stars<=5);assert.ok(item.zh&&item.pos&&item.note);
 assert.equal(item.examples.length,1);const e=item.examples[0],s=h.data.sentences[e.number-1];
 assert.equal(e.en,s.en);assert.equal(e.zh,s.zh);assert.equal(e.source,'original');assert.equal(item.paragraph,s.paragraph);
 assert.equal(s.en.toLowerCase().indexOf(item.sourceTerm.toLowerCase()),item.sourceOffset);
 assert.ok(e.number>previous[0]||e.number===previous[0]&&item.sourceOffset>=previous[1]);previous=[e.number,item.sourceOffset];
 if(item.type==='word')assert.ok(item.ipa);
}
assert.equal(h.config.storageKey,'iris-rethinking-the-past-1020-v1');
assert.equal(h.run('PARAGRAPH_RANGE'),'A–I');
for(const stage of ['all','due','new','learning','mature'])assert.ok(h.element('app').innerHTML.includes('data-study-stage="'+stage+'"'));
const keyEvent=key=>({key,code:key===' '?'Space':key,target:{tagName:'BODY',closest(){return null}},preventDefault(){}});
for(const handler of h.events.keydown||[])handler(keyEvent('Enter'));
assert.equal(h.run('revealed'),true);assert.ok(h.element('app').innerHTML.includes('data-sentence-flag-toggle'));
for(const handler of h.events.keydown||[])handler(keyEvent(' '));assert.ok(h.spoken.length>0);
const first=h.run('current.id');
for(const handler of h.events.keydown||[])handler(keyEvent('3'));
assert.equal(h.run('state['+JSON.stringify(first)+'].level'),3);
h.run("studyStage='due';buildQueue()");assert.equal(h.run('current'),null);
h.run("studyStage='learning';buildQueue()");assert.equal(h.run('current.id'),first);
h.run("state[sentenceFlagKey(1)]={updated:1,removed:false,reasons:['structure'],note:'测试难点'};save();navigate('sentences')");
assert.equal((h.element('sentence-list').innerHTML.match(/class="paragraph-heading"/g)||[]).length,9);
assert.ok(h.element('sentence-collection').innerHTML.includes('已收集 1 句'));
const reloaded=harness(entry,{storage:h.storage,hash:'#sentences'});assert.equal(reloaded.run('sentenceFlagEntries().length'),1);
assert.equal(reloaded.run('state['+JSON.stringify(first)+'].level'),3);
for(const view of ['cards','library','sentences','quiz','settings']){h.run('navigate('+JSON.stringify(view)+')');assert.ok(h.element('app').innerHTML.length>50)}
h.run("navigate('library')");assert.ok(h.element('app').innerHTML.includes('A–I 段落与首次出现顺序'));
assert.ok(h.element('app').innerHTML.indexOf('data-library-id="past-001"')<h.element('app').innerHTML.indexOf('data-library-id="past-002"'));
h.run("libraryOrder='priority';render()");assert.ok(h.element('app').innerHTML.includes('按重要程度排列'));
assert.equal(h.data.questions.length,0);assert.ok(h.run('analysisPage()').includes('逐题答案和错因资料待补'));
assert.ok(!h.run('analysisPage()').includes('<details>'));
const catalog=JSON.parse(read('catalog.json')),added=catalog.entries.find(e=>e.id===entry.id);
assert.equal(added.date,'2026-10-20');assert.equal(added.kind,'模考');assert.ok(read('index.html').includes(added.url));
const page=read(added.path);assert.ok(page.includes('/ielts-review-library/index.html'));
assert.ok(page.includes('article-app.js?v=20261123-study-stage'));assert.ok(page.includes('rethinking-the-past-1020.jpg'));
assert.ok(!page.includes('saiga'));assert.equal((page.match(/<figure /g)||[]).length,2);
console.log('PASS: 208 ordered entries, 49 verbatim sentences, A–I, exact example mapping, latest stage filters, keyboard controls, shared difficulty markers, saved progress, image and catalog navigation.');
