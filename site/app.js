 'use strict';
const $=id=>document.getElementById(id),resources=window.LEARNING_HUB.resources;
const params=new URLSearchParams(location.search),grade=Number(params.get('class'));
const chapterView=document.body.dataset.view==='chapter',chapter=Number(params.get('chapter')),subject=params.get('subject')||'Physics';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kinds={notes:'Notes',cards:'Cards',mcqs:'MCQs',activities:'Activities'};
const allItems=resources.filter(r=>r.class===grade);
const items=chapterView?allItems.filter(r=>r.chapter===chapter&&r.subject===subject):allItems;
const groups=new Map();
allItems.forEach(r=>{const key=r.subject+'|'+r.chapter;if(!groups.has(key))groups.set(key,{chapter:r.chapter,subject:r.subject,items:[]});groups.get(key).items.push(r);});
const chapters=[...groups.values()].sort((a,b)=>a.chapter-b.chapter||a.subject.localeCompare(b.subject));
const chapterName=g=>(g.items.find(r=>r.type==='notes')||g.items[0]).title.replace(/\s+(?:Notes|Cards|MCQs|Practice|MCQ Bank)$/,'');
if(![9,10,11,12].includes(grade)||(chapterView&&!items.length)){
 $('class-title').textContent=chapterView?'Chapter unavailable':'Choose a class';$('class-intro').textContent='Return to Classes to choose an available chapter.';$('class-search').hidden=true;
}else{
 const selected=chapters.find(g=>g.chapter===chapter&&g.subject===subject);
 document.title=(chapterView?`Class ${grade} Chapter ${chapter}`:`Class ${grade}`)+' | Shahzad’s Learning Hub';
 $('class-title').textContent=chapterView?`Chapter ${chapter}: ${chapterName(selected)}`:`Class ${grade}`;
 $('class-intro').textContent=chapterView?`Class ${grade} · ${subject}`:'Choose a chapter';
 $('search').placeholder=chapterView?'Search this chapter…':`Search within Class ${grade}…`;
 $('search').value=params.get('q')||'';
 if(chapterView){$('back-class').href=`class.html?class=${grade}`;$('back-class').textContent=`← Class ${grade}`;}
 function render(update=true){
  const query=$('search').value.trim().toLowerCase();
  const matches=r=>`${r.title} ${r.subject} chapter ${r.chapter} ${r.description} ${r.detail}`.toLowerCase().includes(query);
  if(chapterView){
   const filtered=items.filter(matches).sort((a,b)=>['notes','cards','mcqs','activities'].indexOf(a.type)-['notes','cards','mcqs','activities'].indexOf(b.type));
   $('class-sections').innerHTML=`<div class="resource-grid chapter-resources">${filtered.map(r=>{
    const href=r.type==='practice'?`viewer.html?resource=${encodeURIComponent(r.id)}`:r.url;
    return `<article class="resource-card"><div class="resource-meta"><span>${kinds[r.type]}</span></div><h2>${esc(r.title)}</h2><p>${esc(r.description)}</p><div class="resource-bottom"><span>${esc(r.detail)}</span><a href="${esc(href)}">${r.type==='notes'?'Read notes':r.type==='cards'?'Open cards':r.type==='activities'?'Explore activities':'Practise MCQs'} ↗</a></div></article>`;
   }).join('')}</div>`;
   $('empty-state').hidden=filtered.length>0;$('resource-count').textContent=`${filtered.length} resource${filtered.length===1?'':'s'}`;
  }else{
   const filtered=chapters.filter(g=>g.items.some(matches));
   $('class-sections').innerHTML=`<div class="class-grid chapter-grid">${filtered.map(g=>{
    const p=new URLSearchParams({class:String(grade),chapter:String(g.chapter),subject:g.subject});
    const formats=[...new Set(g.items.map(r=>kinds[r.type]))].join(' · ');
    return `<a class="class-card chapter-card" href="chapter.html?${esc(p)}" data-chapter="${g.chapter}"><span class="class-card-top">${esc(g.subject)} <span aria-hidden="true">↗</span></span><strong>Chapter <span>${String(g.chapter).padStart(2,'0')}</span></strong><span class="class-card-bottom">${esc(chapterName(g))}<small>${esc(formats)}</small></span></a>`;
   }).join('')}</div>`;
   $('empty-state').hidden=filtered.length>0;$('resource-count').textContent=`${filtered.length} chapter${filtered.length===1?'':'s'}`;
  }
  if(update){const p=new URLSearchParams({class:String(grade)});if(chapterView){p.set('chapter',String(chapter));p.set('subject',subject);}if(query)p.set('q',$('search').value.trim());history.replaceState(null,'',location.pathname+'?'+p);}
 }
 $('class-search').addEventListener('submit',e=>e.preventDefault());$('search').addEventListener('input',()=>render());
 $('empty-reset').addEventListener('click',()=>{$('search').value='';render();$('search').focus();});
 window.addEventListener('popstate',()=>{$('search').value=new URLSearchParams(location.search).get('q')||'';render(false);});render(false);
}
