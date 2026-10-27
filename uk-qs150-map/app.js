/* Iris Atlas — dependency-free static application. */
(() => {
  'use strict';
  const schools = window.SCHOOLS;
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const STORAGE = 'iris-uk-atlas-v1';
  const validIds = new Set(schools.map(s => s.id));
  let storageAvailable = true;
  function cleanSaved(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid backup');
    const ids = a => Array.isArray(a) ? [...new Set(a.filter(id => validIds.has(id)))] : [];
    const notes = {};
    for (const id of validIds) if (typeof value.notes?.[id] === 'string') notes[id] = value.notes[id].slice(0, 3000);
    return {favorites:ids(value.favorites), compare:ids(value.compare).slice(0,3), notes, year:['2027','2028'].includes(value.year) ? value.year : '2027'};
  }
  let saved = cleanSaved({});
  try { const raw = localStorage.getItem(STORAGE); if (raw) saved = cleanSaved(JSON.parse(raw)); } catch { storageAvailable = false; }
  const params = new URLSearchParams(location.search);
  if (['2027','2028'].includes(params.get('year'))) saved.year = params.get('year');
  const state = {level:'全部', region:'全部', query:'', sort:'rank', favoritesOnly:false, active:validIds.has(params.get('school')) ? params.get('school') : 'sheffield'};
  let toastTimer;
  function toast(text) { $('toast').textContent = text; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').hidden = true, 3200); }
  function persist() {
    try { localStorage.setItem(STORAGE, JSON.stringify(saved)); }
    catch { storageAvailable = false; toast('浏览器无法保存；请导出备份保留当前记录。'); }
  }
  function updateURL() {
    const url = new URL(location.href);
    if (state.active) url.searchParams.set('school', state.active); else url.searchParams.delete('school');
    url.searchParams.set('year', saved.year);
    try { history.replaceState(null, '', url); } catch { /* Local file previews may disallow History API. */ }
  }
  function visible() {
    const q = state.query.toLowerCase().trim();
    const list = schools.filter(s => (state.level === '全部' || s.level === state.level) && (state.region === '全部' || s.region === state.region) && (!state.favoritesOnly || saved.favorites.includes(s.id)) && (!q || [s.name,s.en,s.city,s.program,s.focus,s.region,s.initials].join(' ').toLowerCase().includes(q)));
    return list.sort((a,b) => state.sort === 'cost' ? a.costMin-b.costMin || a.rank-b.rank : state.sort === 'name' ? a.en.localeCompare(b.en) : a.rank-b.rank);
  }
  const levelClass = s => s.level === '主申' ? 'main' : s.level === '备选' ? 'backup' : '';
  function renderList() {
    const list = visible();
    $('resultCount').textContent = list.length;
    $('listSummary').textContent = `${list.length} 所院校 · ${list.filter(s => s.rank<=100).length} 所世界前 100`;
    $('schoolList').innerHTML = list.length ? list.map(s => `<article class="school-card ${state.active===s.id?'active':''}" data-id="${s.id}"><button class="school-select" data-select="${s.id}" aria-pressed="${state.active===s.id}" aria-label="查看${s.name}详情"><span class="rank-square"><small>QS 2027</small>${s.qs}</span><span><span class="school-title">${s.name}</span><span class="school-en">${s.en}</span></span></button><button class="star-button ${saved.favorites.includes(s.id)?'saved':''}" data-favorite="${s.id}" aria-label="${saved.favorites.includes(s.id)?'取消收藏':'收藏'}${s.name}" aria-pressed="${saved.favorites.includes(s.id)}">${saved.favorites.includes(s.id)?'★':'☆'}</button><div class="card-tags"><span class="level ${levelClass(s)}">${s.level}</span><span>${s.city}</span></div></article>`).join('') : `<div class="empty"><b>${state.favoritesOnly?'还没有匹配的收藏':'没有找到匹配的院校'}</b><p>试试其他关键词或重置筛选。<br>点击学校旁的 ☆ 即可收藏。</p><button class="outline-button" data-reset>重置筛选</button></div>`;
    $('favoriteCount').textContent = saved.favorites.length;
    $('favoritesBtn').classList.toggle('active', state.favoritesOnly);
    $('favoritesBtn').setAttribute('aria-pressed', state.favoritesOnly);
    $('exploreBtn').classList.toggle('active', !state.favoritesOnly);
    $('exportBtn').disabled = !list.length;
    document.querySelectorAll('[data-level]').forEach(b => {b.classList.toggle('active', b.dataset.level===state.level);b.setAttribute('aria-pressed', b.dataset.level===state.level);});
  }
  function renderDetail() {
    const s = schools.find(s => s.id === state.active);
    if (!s) {
      $('detailPanel').innerHTML = '<div class="empty"><b>选择一所学校</b><p>点击列表或地图标记，在这里查看院校详情。</p></div>';
      return;
    }
    const favorite = saved.favorites.includes(s.id), compare = saved.compare.includes(s.id);
    const sheffield = s.id==='sheffield' ? '<p class="micro">另可比较：<a href="https://sheffield.ac.uk/postgraduate/taught/courses/2027/international-marketing-and-management-msc" target="_blank" rel="noopener noreferrer">International Marketing and Management MSc（2027 官方页面）↗</a></p>' : '';
    $('detailPanel').innerHTML = `<div class="detail-overline"><span>SCHOOL IN FOCUS</span><span>${String(schools.indexOf(s)+1).padStart(2,'0')} / 08</span></div><div class="detail-monogram" aria-hidden="true">${s.initials}</div><h2>${s.name}</h2><p class="detail-en">${s.en}</p><div class="detail-location">⌖ ${s.city} · ${s.region}</div><div class="detail-metrics"><div><small>QS 世界大学排名 2027</small><strong>${s.qs}</strong></div><div><small>旧版申请分组</small><span class="level ${levelClass(s)}">${s.level}</span></div></div><section class="detail-section"><div class="section-caption">原版关注专业 <span class="tiny-badge">当年招生待核验</span></div><p class="program">${s.program}</p>${sheffield}</section><section class="detail-section"><div class="section-caption">旧版总预算参考 <span class="tiny-badge">原 2028 估算</span></div><p class="budget">¥ ${s.costMin}–${s.costMax} <span style="font:12px sans-serif">万</span></p><p class="micro">未核验明细；切换入学年不会自动更新这笔估算。</p></section><section class="detail-section"><div class="check-box"><b>下一步，重点看什么？</b>${s.check}</div></section><div class="detail-links"><a href="${s.website}" target="_blank" rel="noopener noreferrer">学校官网 ↗</a><a href="https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=14/${s.lat}/${s.lng}" target="_blank" rel="noopener noreferrer">查看周边 ↗</a></div><a class="verified-link" href="${s.rankSource}" target="_blank" rel="noopener noreferrer">✓ 排名来源 · 核验 ${s.rankVerified} ↗</a><div class="detail-actions"><button class="outline-button" id="detailFavorite" aria-pressed="${favorite}">${favorite?'★ 已收藏':'☆ 收藏院校'}</button><button class="solid-button" id="detailCompare" aria-pressed="${compare}">${compare?'✓ 已加入对比':'＋ 加入对比'}</button></div><label for="schoolNotes" class="notes-label">我的笔记 <span class="micro">· 仅保存在当前浏览器</span></label><textarea id="schoolNotes" class="notes" maxlength="3000" placeholder="记下想核对的问题、课程偏好……">${escapeHTML(saved.notes[s.id]||'')}</textarea><p class="micro" id="noteStatus">${storageAvailable?'输入后自动保存；跨设备请使用备份。':'浏览器保存不可用，请导出备份。'}</p>`;
    $('detailFavorite').onclick = () => toggleFavorite(s.id);
    $('detailCompare').onclick = () => toggleCompare(s.id);
    $('schoolNotes').oninput = e => { saved.notes[s.id] = e.target.value; persist(); $('noteStatus').textContent = storageAvailable ? '已保存在当前浏览器。' : '保存不可用，请导出备份。'; };
  }
  // A local vector map works without third-party scripts, fonts or map tiles.
  const svgNS='http://www.w3.org/2000/svg';
  const mercator = lat => Math.log(Math.tan(Math.PI/4+lat*Math.PI/360));
  const project = s => [(s.lng+11)*63, (mercator(60)-mercator(s.lat))*3609];
  const offsets = {birmingham:[-238,16],leeds:[22,-42],glasgow:[-238,-45],sheffield:[22,27],southampton:[22,-24],exeter:[-238,-16],liverpool:[-238,-54],newcastle:[22,-42]};
  function renderMap() {
    const list = visible(), order=[...list.filter(s=>s.id!==state.active),...list.filter(s=>s.id===state.active)];
    $('mapMarkers').innerHTML = order.map(s => {
      const [x,y] = project(s), [dx,dy] = offsets[s.id], lx=x+dx, ly=y+dy;
      const active=s.id===state.active;
      const endX=dx<0?lx+220:lx;
      return `<g class="map-marker ${active?'active':''}" data-select="${s.id}" role="button" tabindex="0" aria-label="${s.name}，QS ${s.qs}，查看详情" aria-pressed="${active}"><title>${s.name} · ${s.city}</title><path class="leader" d="M${x},${y}L${endX},${ly+25}"/><circle class="halo" cx="${x}" cy="${y}" r="${active?16:0}"/><circle class="location" cx="${x}" cy="${y}" r="${active?6:4}"/><rect x="${lx}" y="${ly}" width="220" height="50" rx="9"/><text x="${lx+12}" y="${ly+32}">${s.name}</text><text class="rank" x="${lx+208}" y="${ly+32}" text-anchor="end">${s.qs}</text></g>`;
    }).join('');
  }
  function selectSchool(id) {
    if (!validIds.has(id)) return;
    state.active = id; renderList(); renderDetail(); renderMap(); updateURL();
    if (window.matchMedia('(max-width:680px)').matches) $('detailPanel').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
  }
  function renderAll() {
    const list = visible();
    if (!list.some(s => s.id===state.active)) state.active = list[0]?.id || null;
    renderList(); renderDetail(); renderMap(); renderCompareBar(); updateURL();
  }
  function toggleFavorite(id) {
    const index=saved.favorites.indexOf(id);
    if(index<0) saved.favorites.push(id); else saved.favorites.splice(index,1);
    persist(); renderAll();
    toast(index<0?'已收藏，记录保存在当前浏览器。':'已取消收藏。');
  }
  function toggleCompare(id) {
    const index=saved.compare.indexOf(id);
    if (index<0 && saved.compare.length>=3) return toast('最多对比 3 所，请先移除一所。');
    if(index<0) saved.compare.push(id); else saved.compare.splice(index,1);
    persist(); renderCompareBar(); renderDetail();
  }
  function renderCompareBar() {
    $('compareBar').hidden=!saved.compare.length;
    $('compareCount').textContent=saved.compare.length;
    $('compareNames').textContent=saved.compare.map(id=>schools.find(s=>s.id===id).name.replace('大学','')).join(' · ');
    $('openCompare').disabled=saved.compare.length<2;
    $('openCompare').title=saved.compare.length<2?'再选择一所即可比较':'';
  }
  function showCompare() {
    const list=saved.compare.map(id=>schools.find(s=>s.id===id));
    if(list.length<2)return;
    const rows=[['QS 2027',s=>`${s.qs}<br><a href="${s.rankSource}" target="_blank" rel="noopener noreferrer">排名来源 ↗</a>`],['城市 / 地区',s=>`${s.city}<br><small>${s.region}</small>`],['旧版分组',s=>`${s.level}<br><small>未重新评估录取难度</small>`],['原版关注专业',s=>`${s.program}<br><small>当年招生待核验</small>`],['旧版总预算',s=>`¥ ${s.costMin}–${s.costMax} 万<br><small>原 2028 估算，未核验明细</small>`],['重点核对',s=>s.check],['我的笔记',s=>escapeHTML(saved.notes[s.id]||'暂无笔记').replace(/\n/g,'<br>')],['官方入口',s=>`<a href="${s.website}" target="_blank" rel="noopener noreferrer">学校官网 ↗</a>`]];
    $('compareContent').innerHTML=`<div class="compare-scroll" tabindex="0" aria-label="院校对比表，可横向滚动"><table class="compare-table"><caption class="micro" style="text-align:left;margin-bottom:12px">计划 ${saved.year} 入学 · 排名固定为 QS 2027；费用仍为旧版 2028 估算。</caption><thead><tr><th scope="col">比较维度</th>${list.map(s=>`<th scope="col">${s.name}<br><small>${s.en}</small><br><button class="text-button" data-remove-compare="${s.id}">移除 ×</button></th>`).join('')}</tr></thead><tbody>${rows.map(([label,fn])=>`<tr><th scope="row">${label}</th>${list.map(s=>`<td>${fn(s)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if(!$('compareDialog').open)$('compareDialog').showModal();
  }
  function reset() { state.level='全部';state.region='全部';state.query='';state.sort='rank';state.favoritesOnly=false;$('search').value='';$('region').value='全部';$('sort').value='rank';renderAll(); }
  $('schoolList').addEventListener('click', e => {
    const favorite=e.target.closest('[data-favorite]'), school=e.target.closest('[data-select]');
    if(favorite)toggleFavorite(favorite.dataset.favorite);else if(school)selectSchool(school.dataset.select);else if(e.target.closest('[data-reset]'))reset();
  });
  $('mapMarkers').addEventListener('click', e => { const m=e.target.closest('[data-select]');if(m)selectSchool(m.dataset.select); });
  $('mapMarkers').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){const m=e.target.closest('[data-select]');if(m){e.preventDefault();selectSchool(m.dataset.select);$('mapMarkers').querySelector(`[data-select="${m.dataset.select}"]`)?.focus();}}});
  $('search').addEventListener('input',e=>{state.query=e.target.value;renderAll();});
  $('region').onchange=e=>{state.region=e.target.value;renderAll();};
  $('sort').onchange=e=>{state.sort=e.target.value;renderAll();};
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.level=b.dataset.level;renderAll();});
  $('resetBtn').onclick=reset;
  $('favoritesBtn').onclick=()=>{state.favoritesOnly=true;renderAll();};
  $('exploreBtn').onclick=()=>{state.favoritesOnly=false;renderAll();};
  $('entryYear').value=saved.year;
  $('entryYear').onchange=e=>{saved.year=e.target.value;persist();updateURL();toast(`计划入学年已改为 ${saved.year}；费用仍为旧版估算。`);};
  $('clearCompare').onclick=()=>{saved.compare=[];persist();renderCompareBar();renderDetail();};
  $('openCompare').onclick=showCompare;
  $('closeCompare').onclick=()=>$('compareDialog').close();
  $('compareDialog').addEventListener('click',e=>{const b=e.target.closest('[data-remove-compare]');if(b){toggleCompare(b.dataset.removeCompare);if(saved.compare.length>=2)showCompare();else $('compareDialog').close();}});
  const download = (content,name,type) => {const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);};
  $('exportBtn').onclick=()=>{
    const rows=[['学校','英文名','城市','地区','QS年份','QS排名','计划入学年','原版分组（未重评）','原版专业（待核验）','旧版2028预算下限（万元）','旧版2028预算上限（万元）','已收藏','我的笔记','排名来源','学校官网'],...visible().map(s=>[s.name,s.en,s.city,s.region,2027,s.qs,saved.year,s.level,s.program,s.costMin,s.costMax,saved.favorites.includes(s.id)?'是':'否',saved.notes[s.id]||'',s.rankSource,s.website])];
    const cell=v=>'"'+String(v).replace(/^[=+\-@\t\r]/,"'$&").replace(/"/g,'""')+'"';
    download('\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),`Iris-UK-Atlas-${saved.year}.csv`,'text/csv;charset=utf-8');
    toast('已导出当前筛选结果（含笔记）。');
  };
  $('backupBtn').onclick=()=>download(JSON.stringify({app:'iris-uk-atlas',version:1,exportedAt:new Date().toISOString(),...saved},null,2),'Iris-Atlas-Backup.json','application/json');
  $('importBtn').onclick=()=>$('importFile').click();
  $('importFile').onchange=async e=>{
    const f=e.target.files[0];if(!f)return;
    try{
      if(f.size>250000)throw new Error('too big');
      const value=JSON.parse(await f.text());if(value.app!=='iris-uk-atlas'||value.version!==1)throw new Error('wrong format');
      const imported=cleanSaved(value);
      saved.favorites=[...new Set([...saved.favorites,...imported.favorites])];
      saved.compare=[...new Set([...saved.compare,...imported.compare])].slice(0,3);
      // Merge notes without silently replacing current writing.
      for(const [id,note] of Object.entries(imported.notes)){
        const existing=saved.notes[id]||'';
        if(!existing)saved.notes[id]=note;
        else if(note&&note!==existing&&!existing.includes(note))saved.notes[id]=(existing+'\n\n— 导入的笔记 —\n'+note).slice(0,3000);
      }
      persist();renderAll();toast('收藏与笔记已合并；当前入学年保持不变。');
    }catch{toast('导入失败，请选择 Iris Atlas 导出的 JSON 备份。');}
    e.target.value='';
  };
  // Zoom and pointer pan in map coordinates; reset always restores the overview.
  let view={x:0,y:0,w:920,h:1110};
  const paintView=()=>$('atlasMap').setAttribute('viewBox',`${view.x} ${view.y} ${view.w} ${view.h}`);
  function zoom(factor){const nw=Math.min(1380,Math.max(270,view.w*factor)),nh=nw*1110/920;view={x:view.x+(view.w-nw)/2,y:view.y+(view.h-nh)/2,w:nw,h:nh};paintView();}
  $('zoomIn').onclick=()=>zoom(.8);$('zoomOut').onclick=()=>zoom(1.25);
  $('fitMap').onclick=()=>{view={x:0,y:0,w:920,h:1110};paintView();};
  let drag=null;
  $('atlasMap').addEventListener('pointerdown',e=>{
    if(e.target.closest('[data-select]')||e.pointerType==='touch')return;
    const m=$('atlasMap').getScreenCTM();if(!m)return;
    drag={x:e.clientX,y:e.clientY,vx:view.x,vy:view.y,scale:m.a,id:e.pointerId};
    $('atlasMap').setPointerCapture(e.pointerId);$('atlasMap').classList.add('dragging');
  });
  $('atlasMap').addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;view.x=drag.vx-(e.clientX-drag.x)/drag.scale;view.y=drag.vy-(e.clientY-drag.y)/drag.scale;paintView();});
  function endDrag(){drag=null;$('atlasMap').classList.remove('dragging');}
  $('atlasMap').addEventListener('pointerup',endDrag);$('atlasMap').addEventListener('pointercancel',endDrag);
  $('atlasMap').addEventListener('keydown',e=>{if(e.target!==$('atlasMap'))return;const moves={ArrowLeft:[-40,0],ArrowRight:[40,0],ArrowUp:[0,-40],ArrowDown:[0,40]};if(moves[e.key]){e.preventDefault();view.x+=moves[e.key][0];view.y+=moves[e.key][1];paintView();}else if(['+','='].includes(e.key)){e.preventDefault();zoom(.8);}else if(e.key==='-'){e.preventDefault();zoom(1.25);}else if(e.key==='Home'){e.preventDefault();$('fitMap').click();}});
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if($('mapCanvas').parentElement.requestFullscreen)await $('mapCanvas').parentElement.requestFullscreen();else toast('当前浏览器不支持全屏，可以使用地图缩放。');}catch{toast('当前浏览器未开启全屏，可以使用地图缩放。');}};
  renderAll();
  if(!storageAvailable)toast('浏览器保存不可用，仍可浏览、对比和导出备份。');
})();
