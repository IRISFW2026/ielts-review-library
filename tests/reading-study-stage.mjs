import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function harness(engine) {
 const elements=new Map(),storage=new Map(),events={};
 const element=id=>{
  if(!elements.has(id))elements.set(id,{style:{},dataset:{},value:'',innerHTML:'',textContent:'',classList:{toggle(){}},focus(){}});
  return elements.get(id);
 };
 const ids=['new-today','new-fresh','new-extra','learning-due','learning-future','mature-due','mature-future','legacy-due'];
 const items=ids.map((id,i)=>({id,term:id,type:i===4?'phrase':'word',stars:i===6?4:5,zh:'测试',pos:'n.',ipa:'test',paragraph:'A',sourceOrder:i,examples:[]}));
 const context={console,Date,Blob,URL,JSON,Math,Number,String,Object,Map,Set,
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  location:{hash:'#library'},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,
  document:{getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,activeElement:{tagName:'BODY'},addEventListener(name,fn){events[name]=fn}},
  addEventListener(){},READING_REVIEW_CONFIG:{storageKey:'stage-test',storageFormat:'flat',flagPrefix:'flag:',title:'Test'},
  READING_REVIEW_DATA:{items,sentences:[{en:'Test.',zh:'测试。',paragraph:'A'}],questions:[]}};
 context.window=context;vm.createContext(context);
 vm.runInContext(fs.readFileSync(new URL('../assets/reading-brassica/'+engine,import.meta.url),'utf8'),context);
 const run=code=>vm.runInContext(code,context);
 run(`state={
  'new-today':{level:0,startedDay:dayKey()},
  'learning-due':{level:2,intervalDays:20.9,due:Date.now()-1},
  'learning-future':{level:3,intervalDays:4,due:Date.now()+DAY},
  'mature-due':{level:4,intervalDays:21,due:Date.now()-1},
  'mature-future':{level:4,intervalDays:45,due:Date.now()+DAY},
  'legacy-due':{level:1,intervalDays:0}
 };settings.daily=2;view='cards';savedRecords=copyRecords(state);`);
 storage.set('stage-test',run('JSON.stringify(state)'));
 const candidates=stage=>JSON.parse(run(`studyStage=${JSON.stringify(stage)};JSON.stringify(candidates().map(x=>x.id))`));
 const sorted=values=>[...values].sort();
 assert.deepEqual(JSON.parse(run('JSON.stringify(studyStageCounts())')),{all:8,due:3,new:3,learning:3,mature:2});
 assert.deepEqual(sorted(candidates('due')),['learning-due','legacy-due','mature-due']);
 assert.deepEqual(sorted(candidates('learning')),['learning-due','learning-future','legacy-due']);
 assert.deepEqual(sorted(candidates('mature')),['mature-due','mature-future']);
 assert.deepEqual(candidates('new'),['new-today','new-fresh']);
 run("scope='all'");
 assert.equal(candidates('all').length,8);
 assert.deepEqual(candidates('new'),['new-today','new-fresh'],'new-only always respects daily quota');
 assert.deepEqual(sorted(candidates('due')),['learning-due','legacy-due','mature-due'],'due-only excludes all new and future words');
 run("kind='phrase';starFilter='5'");
 assert.deepEqual(candidates('learning'),['learning-future']);
 assert.equal(candidates('due').length,0);
 run("buildQueue()");assert.equal(run('current'),null);
 assert.ok(element('app').innerHTML.includes('当前筛选下没有到期复习词条'));
 assert.ok(!element('app').innerHTML.includes('id="early"'),'empty state cannot escape selected stage silently');
 run("kind='all';starFilter='4'");assert.deepEqual(candidates('mature'),['mature-future']);
 run("starFilter='all';studyStage='mature';buildQueue();revealed=true;grade(1)");
 assert.equal(run("state['mature-due'].level"),1);
 assert.ok(candidates('learning').includes('mature-due'));
 assert.ok(!candidates('mature').includes('mature-due'));
 run("studyStage='new';buildQueue();revealed=true;grade(3)");
 assert.equal(run("state['new-today'].level"),3);
 assert.ok(!candidates('new').includes('new-today'));
 assert.ok(candidates('learning').includes('new-today'));
 run("settings.daily=1;studyStage='new';buildQueue()");
 assert.equal(run('current'),null);assert.ok(element('app').innerHTML.includes('今日新词额度已用完'));
 run("studyStage='mature';render()");
 assert.ok(element('app').innerHTML.includes('aria-pressed="true"'));
 assert.ok(element('app').innerHTML.includes('data-study-stage="mature"'));
 assert.ok(element('stats').innerHTML.includes('<b>1</b><span>长间隔复习</span>'));
 assert.equal(JSON.parse(storage.get('stage-test'))['new-today'].level,3,'grading persists to existing storage');
 return engine;
}
for(const engine of ['app.js','article-app.js','water-hyacinth-app.js'])console.log('PASS',harness(engine));
console.log('Verified stage boundaries, due/new separation, daily limits, combined filters, empty states, grading transitions and saved progress.');
