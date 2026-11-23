import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd();
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function harness(entry,{storage=new Map(),hash='#cards',seed}={}) {
  const page=read(entry.path);const engine=read(page.match(/src="[^"]*(assets\/reading-brassica\/(?:app|article-app|water-hyacinth-app)\.js)/)[1]);
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





const catalog=JSON.parse(read('catalog.json')),audit=JSON.parse(read('tests/reading-original-bindings.json'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
let cards=0,quotes=0,without=0;
for(const topic of audit){
 const entry=catalog.entries.find(x=>x.id===topic.id),h=harness(entry,{hash:'#library'});
 for(const [key,value] of Object.entries(topic.config))assert.equal(h.config[key],value,topic.id+' config '+key);
 assert.equal(hash(h.data.items.map(x=>[x.id,x.term,x.type,x.stars])),topic.identityHash);
 assert.equal(hash(h.data.sentences),topic.sentenceHash);
 assert.equal(h.data.examples.length,0);assert.equal(h.data.items.length,topic.items.length);
 for(let i=0;i<topic.items.length;i++){
  const expected=topic.items[i],x=h.data.items[i];assert.equal(x.id,expected.id);assert.equal(x.term,expected.term);
  assert.equal(x.examples.length,expected.bindings.length,topic.id+' '+x.term);cards++;
  if(!x.examples.length){without++;assert.equal(x.sourceId,null);assert.equal(x.paragraph,null);assert.notEqual(expected.label,'本文义');}
  for(let j=0;j<x.examples.length;j++){
   const e=x.examples[j],b=expected.bindings[j],s=h.data.sentences[b.number-1];quotes++;
   assert.equal(e.source,'original');assert.equal(e.number,b.number);assert.equal(e.en,s.en);assert.equal(e.zh,s.zh);assert.equal(e.paragraph,s.paragraph);
   assert.ok(b.form&&s.en.includes(b.form),topic.id+' '+x.term+' quoted form');
   if(j===0){assert.equal(x.sourceId,s.id);assert.equal(x.paragraph,s.paragraph);assert.equal(x.originalBinding.form,b.form)}
  }
  h.run(`current=DATA.items.find(x=>x.id===${JSON.stringify(x.id)});revealed=true;view='cards';render()`);
  const html=h.element('app').innerHTML;
  assert.equal((html.match(/class="example-item"/g)||[]).length,Math.min(x.examples.length,3));
  assert.equal((html.match(/data-sentence-flag-toggle=/g)||[]).length,Math.min(x.examples.length,3));
  assert.ok(!html.includes('example-source-supplemental'));
  assert.ok(html.includes('>'+expected.label+'</span>'));
  for(const e of x.examples.slice(0,3)){
   assert.ok(html.includes(h.run('escapeHTML('+JSON.stringify(e.en)+')')));assert.ok(html.includes('data-sentence-flag-toggle="'+e.number+'"'));
  }
 }
 for(const view of ['library','sentences','quiz','settings']){h.run('navigate('+JSON.stringify(view)+')');assert.ok(h.element('app').innerHTML.length>50)}
 const first=h.data.items[0],flag=h.config.flagPrefix+'1';
 h.run('state['+JSON.stringify(first.id)+']={level:3,reps:4,due:Date.now()+86400000,intervalDays:7,updated:123};state['+JSON.stringify(flag)+']={updated:124,removed:false,reasons:["structure"],note:"existing difficulty note"};save()');
 const reloaded=harness(entry,{hash:'#sentences',storage:h.storage});assert.equal(reloaded.run('state['+JSON.stringify(first.id)+'].level'),3);assert.equal(reloaded.run('sentenceFlagEntries().length'),1);assert.ok(reloaded.element('sentence-collection').innerHTML.includes('existing difficulty note'));
 if(topic.id!=='global-warming-in-new-zealand-1111')assert.ok(read(entry.path).includes(topic.id+'.js?v=20261123-reading-originals'));
 console.log('PASS '+topic.id+' '+topic.items.length+' rendered cards; exact quotes, source labels, saved progress and difficulty notes.');
}
assert.equal(cards,4560);assert.equal(audit.length,22);
console.log(JSON.stringify({topics:audit.length,cards,originalQuotes:quotes,withoutOriginal:without,supplemental:0}));
