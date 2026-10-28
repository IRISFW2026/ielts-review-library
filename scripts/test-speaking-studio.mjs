import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html=readFileSync(new URL('../reviews/2026-10-23/speaking/mock/speaking-studio/index.html',import.meta.url),'utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function harness({tts=true,storage=new Map(),media=true}={}){
 let now=0,id=0,confirmation=true;const jobs=new Map(),elements=new Map(),spoken=[],downloads=[],blobs=[];
 function element(name){if(!elements.has(name))elements.set(name,{id:name,value:'',checked:['read-on','hint-on'].includes(name),disabled:false,textContent:'',innerHTML:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return []},getAttribute(k){return this[k]||null},load(){},pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()},scrollIntoView(){},focus(){}});return elements.get(name)}
 element('import-part').value='1';
 function later(fn,ms=0){const n=++id;jobs.set(n,{at:now+ms,fn});return n}
 function advance(ms){const until=now+ms;while(true){const next=[...jobs].filter(([,v])=>v.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;jobs.delete(next[0]);now=next[1].at;next[1].fn()}now=until}
 const speechSynthesis=tts?{speak(u){spoken.push(u)},cancel(){},getVoices(){return []},addEventListener(){}}:undefined;
 class Recorder{static isTypeSupported(){return true}constructor(){this.mimeType='audio/webm;codecs=opus';this.state='inactive'}start(){this.state='recording'}stop(){this.state='inactive';later(()=>{this.ondataavailable({data:new Blob(['test audio'],{type:this.mimeType})});this.onstop()},20)}}
 const context={console,Blob,URL,TextEncoder,Uint8Array,DataView,Date,Number,String,Math,Promise,performance:{now:()=>now},setTimeout:later,clearTimeout:n=>jobs.delete(n),requestAnimationFrame:()=>++id,cancelAnimationFrame(){},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},navigator:{mediaDevices:media?{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}:undefined,clipboard:{writeText:async()=>{}}},document:{getElementById:element,querySelectorAll:()=>[],body:{appendChild(){}},createElement(){return {style:{},click(){downloads.push(this.download)},remove(){}}}},MediaRecorder:Recorder,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},window:{speechSynthesis,SpeechSynthesisUtterance:tts?class{}:undefined,confirm:()=>true,scrollTo(){},addEventListener(){}}};
 context.URL=class extends URL{static createObjectURL(blob){blobs.push(blob);return 'blob:test-'+blobs.length}static revokeObjectURL(){}};
 context.window.confirm=()=>confirmation;
 vm.createContext(context);
 const hooks=`globalThis.api={parsePaper,stampDate,exportPrefix,audioName,reportName,getReport,previewImport,changePaper,startExam,startQuestion,finishQuestion,finishExam,stopQuestionAudio,renderResults,exportZip,restore,save,init,EXAMPLE, set(v){if('questions'in v)questions=v.questions;if('active'in v)active=v.active;if('onGoing'in v)onGoing=v.onGoing;if('raw'in v)raw=v.raw;if('sessionStartedAt'in v)sessionStartedAt=v.sessionStartedAt;if('sessionStamp'in v)sessionStamp=v.sessionStamp;if('recordingBlob'in v)recordingBlob=v.recordingBlob;if('audioDownloaded'in v)audioDownloaded=v.audioDownloaded},get(){return {questions,phase,onGoing,sessionStartedAt,sessionStamp,recordingBlob,audioFinalizing,active,recordingUrl}}};`;
 vm.runInContext(code.replace(/init\(\);\s*\}\)\(\);/,hooks+'})();'),context);
 return {api:context.api,element,spoken,advance,storage,downloads,blobs,setConfirm(value){confirmation=value}};
}

test('parses original nine questions, unnumbered sections, single-Part lines and numbered cues',()=>{
 const {api}=harness();const original=api.parsePaper(api.EXAMPLE);assert.equal(original.length,9);assert.equal(original[4].cues.length,4);
 const p=api.parsePaper('Part 1\r\nSinging\r\nDo you like singing?\r\nWhy do people sing?\r\nPart 2\r\nDescribe a place\r\nYou should say:\r\n1. Where it is\r\n2. Who you went with\r\nAnd explain why you liked it\r\nPart 3\r\nHow do cities change?');
 assert.deepEqual(Array.from(p,q=>q.part),[1,1,2,3]);assert.equal(p[0].topic,'Singing');assert.equal(p[2].cues.length,3);assert.deepEqual(Array.from(p,q=>q.id),[1,2,3,4]);
 assert.equal(api.parsePaper('Talk about your job\nTell me about your hometown',3).length,2);
 assert.equal(api.parsePaper('What should governments do?\nHow can people help?',3)[0].part,3);
 assert.equal(api.parsePaper('Describe a person\nWho they are\nWhy you admire them',2)[0].cues.length,2);
 assert.equal(api.parsePaper('1) Do you work?\n2、 Do you study?').length,2);
});
test('session filenames survive a later export and restore, and AI brief includes dynamic questions and Word request',()=>{
 const h=harness();const date='2026-10-28T10:30:25.000Z';const stamp=h.api.stampDate(new Date(date));h.api.set({questions:h.api.parsePaper('Do you work?\nDo you study?'),sessionStartedAt:date,sessionStamp:stamp});h.api.save();
 const oldName=h.api.reportName();h.advance(86400000);assert.equal(h.api.reportName(),oldName);assert.match(oldName,/1028-2026-\d{6}-口语模考-AI复盘.txt/);
 const next=harness({storage:h.storage});next.api.restore();assert.equal(next.api.reportName(),oldName);const report=next.api.getReport();assert.match(report,/题目数：2/);assert.match(report,/Word 文档/);assert.match(report,/未实际听到音频时不评价发音/);assert.match(report,/7 分水平/);
});
test('each Part opens with one introduction, waits three seconds, then speaks questions before timing',()=>{
 const h=harness();h.api.set({questions:h.api.parsePaper('Part 1\nDo you work?\nDo you study?\nPart 2\nDescribe a place\nWhere it is'),onGoing:true});h.api.startQuestion();assert.equal(h.spoken.length,1);assert.match(h.spoken[0].text,/begin Part 1/);assert.equal(h.api.get().phase,'intro');h.spoken[0].onend();h.advance(2999);assert.equal(h.spoken.length,1);h.advance(1);assert.equal(h.spoken.length,2);assert.equal(h.spoken[1].text,'Do you work?');assert.equal(h.api.get().phase,'reading');h.spoken[1].onend();assert.equal(h.api.get().phase,'answer');
 h.api.finishQuestion(true);h.advance(600);assert.equal(h.spoken.length,3);assert.equal(h.spoken[2].text,'Do you study?');h.spoken[2].onend();h.api.finishQuestion(true);h.advance(600);assert.match(h.spoken[3].text,/Part 2/);h.spoken[3].onend();h.advance(3000);assert.match(h.spoken[4].text,/Describe a place/);
});
test('stopping during introduction cancels pending question and failed speech offers manual continuation',()=>{
 const h=harness();h.api.set({questions:h.api.parsePaper('Do you work?'),onGoing:true});h.api.startQuestion();h.spoken[0].onend();h.api.finishExam();h.advance(4000);assert.equal(h.spoken.length,1);assert.equal(h.api.get().onGoing,false);
 const f=harness({tts:false});f.api.init();f.api.set({questions:f.api.parsePaper('Do you work?'),onGoing:true});f.api.startQuestion();assert.match(f.element('exam-status').textContent,/播报不可用/);f.element('begin-answer-btn').onclick();f.advance(2999);assert.equal(f.api.get().phase,'intro');f.advance(1);assert.equal(f.api.get().phase,'reading');assert.match(f.element('exam-status').textContent,/不支持语音朗读/);
});
test('recording finalization waits for final audio chunk, enables download, ZIP holds only audio and brief',async()=>{
 const h=harness();h.api.init();await h.api.startExam();assert.equal(h.api.get().onGoing,true);h.api.finishExam();assert.equal(h.api.get().audioFinalizing,true);assert.equal(h.element('download-audio-btn').disabled,true);h.advance(20);assert.ok(h.api.get().recordingBlob.size);assert.equal(h.api.get().audioFinalizing,false);assert.equal(h.element('download-audio-btn').disabled,false);
 assert.match(h.api.audioName(),/^\d{4}-\d{4}-\d{6}-口语模考-录音.webm$/);assert.equal(h.api.audioName().split('-口语模考')[0],h.api.reportName().split('-口语模考')[0]);await h.api.exportZip();assert.match(h.downloads.at(-1),/-复盘.zip$/);
 const zip=new DataView(await h.blobs.at(-1).arrayBuffer());assert.equal(zip.getUint16(zip.byteLength-22+10,true),2);
});
test('importing replacement questions respects an unsaved recording and a draft is never silently ignored',async()=>{
 const h=harness();h.api.init();h.element('paper-input').value='Why do people travel?\nHow can cities improve?';await h.api.startExam();assert.equal(h.api.get().onGoing,false);assert.equal(h.api.get().questions.length,2);await h.api.startExam();assert.equal(h.api.get().onGoing,true);h.api.finishExam();h.advance(20);
 h.api.set({audioDownloaded:false});h.element('paper-input').value='Do you enjoy singing?';const count=h.api.get().questions.length;
 h.setConfirm(false);h.api.changePaper();assert.equal(h.api.get().questions.length,count);assert.ok(h.api.get().recordingBlob.size);
 h.setConfirm(true);h.api.changePaper();assert.equal(h.api.get().questions.length,1);assert.equal(h.api.get().recordingBlob,null);
});
test('rapid repeated start does not open duplicate recording requests',async()=>{
 const h=harness();h.api.init();const start=h.api.startExam();assert.equal(h.element('start-btn').disabled,true);await h.api.startExam();await start;assert.equal(h.spoken.length,1);
 h.api.finishExam();h.advance(20);assert.ok(h.api.get().recordingBlob.size);
});
test('Part 2 preparation starts after question speech and can advance to the answer',async()=>{
 const h=harness();h.api.init();const paper='Part 2\nDescribe a place\nWhere it is';h.element('paper-input').value=paper;h.api.changePaper();h.element('prep-on').checked=true;await h.api.startExam();h.spoken[0].onend();h.advance(3000);h.spoken[1].onend();assert.equal(h.api.get().phase,'prepare');h.element('skip-btn').onclick();assert.equal(h.api.get().phase,'answer');h.api.finishQuestion(true);h.advance(450);h.advance(20);assert.ok(h.api.get().recordingBlob.size);assert.notEqual(h.api.get().questions[0].prepEndAt,null);
});
