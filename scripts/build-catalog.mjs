import {readFile, writeFile, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const prefix = '/ielts-review-library/';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const load = name => readFile(path.join(root, name), 'utf8');
const originalCatalog = await load('catalog.json');
const catalog = JSON.parse(originalCatalog);
if (!Array.isArray(catalog.entries) || !catalog.entries.length) throw new Error('catalog.json requires entries');
const ids = new Set(), paths = new Set();
for (const entry of catalog.entries) {
  for (const key of ['id','date','skill','kind','en','zh','topic','description','path','dateBasis']) {
    if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`Missing ${key} in ${entry.id || 'entry'}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || new Date(entry.date+'T00:00:00Z').toISOString().slice(0,10) !== entry.date) throw new Error(`Invalid date: ${entry.id}`);
  if (!['阅读','听力','写作','口语'].includes(entry.skill)) throw new Error(`Invalid skill: ${entry.id}`);
  if (!Array.isArray(entry.tags) || !entry.tags.length || entry.tags.some(tag => typeof tag !== 'string' || !tag.trim())) throw new Error(`Invalid tags: ${entry.id}`);
  if (!entry.path.startsWith(`reviews/${entry.date}/`) || !entry.path.endsWith('/index.html') || entry.path.includes('..') || entry.path.includes('\\')) throw new Error(`Invalid canonical path: ${entry.id}`);
  if (ids.has(entry.id) || paths.has(entry.path)) throw new Error(`Duplicate entry: ${entry.id}`);
  ids.add(entry.id); paths.add(entry.path);
  await access(path.join(root, entry.path));
  entry.title = entry.displayTitle || `${entry.date.slice(5,7)}${entry.date.slice(8,10)}-${entry.skill}-${entry.kind}-${entry.en} ${entry.zh}`;
  entry.url = prefix + entry.path.slice(0, -10);
}
catalog.entries.sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
const entries = catalog.entries, latest = entries[0];
const originalHome = await load('index.html');
let home = originalHome;
if (!/const ENTRIES=.*?;\nconst SKILLPATH=/s.test(home)) throw new Error('Homepage catalog marker missing');
home = home.replace(/const ENTRIES=.*?;\nconst SKILLPATH=/s, () => 'const ENTRIES='+JSON.stringify(entries).replace(/</g,'\\u003c')+';\nconst SKILLPATH=');
home = home.replace(/(<button data-skill="([^"]+)">)[\s\S]*?<\/button>/g, (_, start, skill) => start+(skill==='all'?'全部':escape(skill))+' <em>'+(skill==='all'?entries.length:entries.filter(e=>e.skill===skill).length)+'</em></button>');
home = home.replace(/共\d+个独立专题/g, `共${entries.length}个独立专题`);
home = home.replace(/<a class="latest"[\s\S]*?<\/a>/, '<a class="latest" href="'+escape(latest.url)+'"><div><small>最近新增 · '+escape(latest.skill+latest.kind)+'</small><strong>'+escape(latest.title)+'</strong></div><span class="arrow" aria-hidden="true">↗</span></a>');
if (/^\d{4}-\d{2}-\d{2}$/.test(catalog.updated || '')) home = home.replace(/整理于 \d{4}\.\d{2}\.\d{2}/g, '整理于 '+catalog.updated.replaceAll('-','.'));
const originalReadme = await load('README.md');
if (!/## 复习目录\n[\s\S]*?\n## 更新约定/.test(originalReadme)) throw new Error('README directory marker missing');
const table = '## 复习目录\n\n| 日期 | 科目与题型 | 标准名称与链接 |\n|---|---|---|\n'+entries.map(e=>'| '+e.date+' | '+e.skill+' '+e.kind+' | ['+e.title.replaceAll('|','\\|')+'](https://irisfw2026.github.io'+e.url+') |').join('\n')+'\n\n## 更新约定';
const readme = originalReadme.replace(/## 复习目录\n[\s\S]*?\n## 更新约定/, () => table);
const outputs = new Map([['catalog.json',JSON.stringify(catalog,null,2)+'\n'],['index.html',home],['README.md',readme]]);
const stale = [];
for (const [name,value] of outputs) {
  const previous = name==='catalog.json'?originalCatalog:name==='index.html'?originalHome:originalReadme;
  if (previous !== value) {stale.push(name); if (!check) await writeFile(path.join(root,name),value);}
}
if (check && stale.length) {console.error('Catalog outputs need regeneration: '+stale.join(', '));process.exitCode=1;}
else console.log(`${check?'Checked':'Updated'} ${entries.length} topics; ${stale.length} file(s) ${check?'stale':'changed'}.`);

