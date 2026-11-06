import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=p=>readFile(new URL(p,root),'utf8');
const data=await read('assets/listening-review-1106/data.js');
const cards=await read('assets/listening-review-1106/cards.js');
const review=await read('assets/listening-review-1106/review.js');
const storage=new Map();
function boot(material){
 const elements=new Map(),events=new Map(),tabs=new Map();
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'',hidden:false,children:[],files:[],dataset:{},addEventListener(type,cb){events.set(id+':'+type,cb)},scrollIntoView(){},click(){},setAttribute(){},classList:{toggle(){}}});return elements.get(id)};
 for(const t of ['quiz','sentences','cards'])tabs.set(t,element('tab-'+t));
 const document={body:{dataset:{material}},getElementById:element,querySelectorAll:()=>[],querySelector:s=>tabs.get(s.match(/data-study-tab="(.*?)"/)?.[1]),addEventListener(type,cb){const k='document:'+type;events.set(k,[...(events.get(k)||[]),cb])},createElement:()=>({click(){}})};
 const context={window:{addEventListener(){},speechSynthesis:{cancel(){},getVoices:()=>[],speak(){},addEventListener(){}}},document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},history:{replaceState(){}},location:{hash:''},setTimeout:()=>0,clearTimeout(){},URL,Blob,Date,console,SpeechSynthesisUtterance:class{constructor(text){this.text=text}}};
 vm.createContext(context);vm.runInContext(data,context);vm.runInContext(cards,context);vm.runInContext(review,context);
 return {element,events,context,D:context.window.LISTENING_REVIEW_1106,input(n,value){events.get('quiz-form:input')({target:{name:'q'+n,value}})},submit(){events.get('quiz-form:submit')({preventDefault(){}})},click(id){for(const cb of events.get('document:click')||[])cb({target:{closest:()=>element(id)}})}};
}
for(const [material,slug,total,sentenceCount] of [['seahorses','the-seahorses',22,16],['organic','organic-farming',26,42]]){
 let b=boot(material),q=b.D.questions[material];
 assert.equal(b.element('quiz-rows').innerHTML.match(/class="question"/g).length,7);
 assert.equal(b.element('sentence-progress').textContent,'0 / '+sentenceCount);
 assert.equal(b.element('total').textContent,total);
 for(const c of b.D.cards.filter(c=>c.material===material)){
  assert.equal(c.examples.length,4);assert.ok(c.source.en&&c.source.zh);assert.ok(c.collocations.length);
  for(const e of c.examples)assert.ok(e.en&&e.zh);assert.ok(b.D.sentences[material].some(s=>s.en===c.source.en));
 }
 for(const item of q.filter(x=>x.wrong))b.input(item.n,item.n===36&&material==='organic'?'10 percent':item.answer);
 b.submit();assert.match(b.element('quiz-score').textContent,/7\/7/);assert.equal(b.element('retry-missed').hidden,true);
 assert.equal(JSON.parse(storage.get('iris-listening-review-1106-'+material+'-v1')).history.length,1);
 b.submit();assert.equal(JSON.parse(storage.get('iris-listening-review-1106-'+material+'-v1')).history.length,1,'Duplicate submit must not add duplicate history');
 b=boot(material);assert.equal(b.element('latest-score').textContent,'7 / 7');
 b.input(35,'wrong');b.submit();assert.match(b.element('quiz-score').textContent,/6\/7/);assert.match(b.element('feedback-35').innerHTML,/首次/);
 b.events.get('retry-missed:click')();assert.equal(b.element('quiz-rows').innerHTML.match(/class="question"/g).length,1);assert.ok(b.element('quiz-rows').innerHTML.includes('question-35'));
 b.input(35,material==='organic'?'POTATOES':' SHRIMP ');b.submit();assert.match(b.element('quiz-score').textContent,/1\/1/);
 b.events.get('quiz-scope:change')({target:{value:'all'}});assert.equal(b.element('quiz-rows').innerHTML.match(/class="question"/g).length,10);
 b.events.get('sentence-list:change')({target:{dataset:{seen:material+'-s1'},checked:true}});assert.equal(b.element('sentence-progress').textContent,'1 / '+sentenceCount);
 b=boot(material);assert.equal(b.element('sentence-progress').textContent,'1 / '+sentenceCount);
 const html=await read('reviews/2026-11-06/listening/exam/'+slug+'/index.html');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length,'IDs must be unique');
 for(const required of ['quiz-panel','sentences-panel','cards-panel','voice','export','import-file'])assert.ok(ids.includes(required));
 assert.ok(html.includes('/ielts-review-library/index.html'));
 console.log('PASS',material,'grading; number/spelling normalization; one-missed retry; all-questions mode; history/draft/sentence persistence; complete cards; HTML structure; both scripts in one context');
}
const b=boot('organic');assert.equal(new Set(b.D.cards.map(c=>c.id)).size,48);
console.log('PASS 48 unique complete flashcards; original records independently preserved.');
