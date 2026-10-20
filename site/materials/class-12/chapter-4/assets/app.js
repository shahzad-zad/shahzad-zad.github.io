'use strict';
(()=>{
 const data=window.CHAPTER_DATA,$=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=`shahzad-ch${data.chapter}-class${data.class}-v1`,allIds=new Set(data.mcqs.map(q=>q.id));
 let state={answers:{},bookmarks:[],view:'notes',topic:'all',difficulty:'all',format:'all',scope:'all',review:'all',search:'',shuffle:false,order:[],index:0},cardsIndex=0,filtered=[];
 try{const p=JSON.parse(localStorage.getItem(key));if(p&&typeof p==='object'){
  for(const [id,n]of Object.entries(p.answers||{}))if(allIds.has(id)&&Number.isInteger(n)&&n>=0&&n<4)state.answers[id]=n;
  state.bookmarks=Array.isArray(p.bookmarks)?p.bookmarks.filter(id=>allIds.has(id)):[];
  for(const name of ['view','topic','difficulty','format','scope','review','search'])if(typeof p[name]==='string')state[name]=p[name];
  state.shuffle=p.shuffle===true;state.order=Array.isArray(p.order)?[...new Set(p.order.filter(id=>allIds.has(id)))]:[];state.index=Number.isInteger(p.index)&&p.index>=0?p.index:0;
 }}catch{}
 const url=new URLSearchParams(location.search);if(url.has('view'))state.view=url.get('view');if(url.has('topic'))state.topic=url.get('topic');
 if(!['notes','mcqs','cards','activities'].includes(state.view))state.view='notes';if(!data.topics.some(t=>t.id===state.topic))state.topic='all';
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
 const topicName=id=>data.topics.find(t=>t.id===id)?.name||id;
 $('topic').innerHTML='<option value="all">All topics</option>'+data.topics.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
 const formats=[...new Set(data.mcqs.map(q=>q.format))];$('format').innerHTML='<option value="all">All question types</option>'+formats.map(f=>`<option>${esc(f)}</option>`).join('');
 for(const id of ['topic','difficulty','format','scope','review']){$(id).value=state[id];if(!$(id).value){$(id).value='all';state[id]='all';}}
 $('search').value=state.search;$('shuffle').checked=state.shuffle;
 function matches(q){const query=state.search.toLowerCase().trim();return(state.topic==='all'||q.topic===state.topic)&&(!query||`${q.prompt||q.title} ${q.html||''} ${q.options?.join(' ')||''} ${topicName(q.topic)}`.toLowerCase().includes(query));}
 function ordered(arr){if(!state.shuffle)return arr;const ids=new Set(arr.map(q=>q.id));let order=state.order.filter(id=>ids.has(id));for(const q of arr)if(!order.includes(q.id))order.push(q.id);return order.map(id=>arr.find(q=>q.id===id));}
 function countProgress(){const done=Object.keys(state.answers).length,correct=data.mcqs.filter(q=>state.answers[q.id]===q.correct).length;$('progress-label').textContent=`${done} of ${data.mcqs.length} answered · ${correct} correct`;}
 function source(q){return q.source?`<p><a href="${esc(q.source.url)}" target="_blank" rel="noopener noreferrer">${esc(q.source.exam||'Official sample')} · ${esc(q.source.locator||'Source')}</a> · Adapted wording or values</p>`:'';}
 function feedback(q,n,animate=false){const f=$('feedback'),right=n===q.correct;f.hidden=false;f.className=`feedback ${right?'correct':'incorrect'}${animate?' animate':''}`;f.innerHTML=`<strong>${right?'Correct':'Not quite'}</strong><p><strong>${'ABCD'[q.correct]}) ${esc(q.answer)}</strong></p><p>${esc(q.explanation)}</p>${source(q)}`;document.querySelectorAll('.option').forEach((b,i)=>{b.disabled=true;b.setAttribute('aria-pressed',String(i===n));if(i===q.correct)b.classList.add('right');if(i===n&&!right)b.classList.add('wrong');});}
 function renderQuestion(){
  $('feedback').hidden=true;const card=state.view==='cards';let i=card?cardsIndex:state.index;
  if(!filtered.length){$('question').innerHTML='<div class="empty"><h2>No matching questions</h2><p>Try another topic or clear the filters.</p></div>';$('question-meta').innerHTML='';$('study-controls').hidden=true;$('position').textContent='0 questions';$('study-progress').value=0;return;}
  i=Math.min(i,filtered.length-1);if(card)cardsIndex=i;else state.index=i;const q=filtered[i];
  $('study-controls').hidden=false;$('previous').disabled=i===0;$('position').textContent=`${i+1} of ${filtered.length} · ${topicName(q.topic)}`;$('study-progress').max=filtered.length;$('study-progress').value=i+1;
  $('question-meta').innerHTML=[q.difficulty,q.format,q.scope==='Extension'?'Entry-test extension':null,q.origin==='Adapted from official sample'?'Official sample adaptation':null].filter(Boolean).map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  $('bookmark').hidden=card;$('bookmark').textContent=state.bookmarks.includes(q.id)?'★ Saved':'☆ Save';$('bookmark').setAttribute('aria-pressed',String(state.bookmarks.includes(q.id)));
  if(card){
   $('question').style.setProperty('--accent',['#6ee7b7','#8cb8ff','#f5d782','#c4b5fd'][i%4]);
   $('question').innerHTML=`<button class="flip" id="flip" aria-label="${esc(q.prompt)}. Tap to reveal"><span class="flip-inner"><span class="face front"><strong>${esc(q.prompt)}</strong><small>Tap or click to flip</small></span><span class="face back" aria-hidden="true"><strong>${esc(q.answer)}</strong><span>${esc(q.explanation)}</span><small>Tap or click to flip back</small></span></span></button>`;
   $('flip').onclick=()=>{const on=$('flip').classList.toggle('flipped');$('flip').setAttribute('aria-label',on?`Answer: ${q.answer}. ${q.explanation}`:`${q.prompt}. Tap to reveal`);$('flip').querySelector('.front').setAttribute('aria-hidden',String(on));$('flip').querySelector('.back').setAttribute('aria-hidden',String(!on));};
  }else{
   $('question').innerHTML=`<article class="question-panel"><h2>${esc(q.prompt)}</h2><div class="options" role="group" aria-label="Answer choices">${q.options.map((o,j)=>`<button class="option" aria-pressed="false"><span>${'ABCD'[j]}</span>${esc(o)}</button>`).join('')}</div></article>`;
   document.querySelectorAll('.option').forEach((b,j)=>b.onclick=()=>{state.answers[q.id]=j;save();feedback(q,j,true);countProgress();});
   if(Number.isInteger(state.answers[q.id]))feedback(q,state.answers[q.id]);
  }save();
 }
 function render(){
  document.body.classList.toggle('activities-mode',state.view==='activities');
  if(state.view!=='activities')window.LABS.stop();
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===state.view)));
  for(const view of ['notes','study','activities'])$(view+'-view').hidden=view!==(state.view==='mcqs'||state.view==='cards'?'study':state.view);
  $('toolbar').hidden=state.view==='activities';$('toolbar').dataset.mode=state.view;document.querySelector('.summary-row').hidden=state.view!=='mcqs';$('toolbar-secondary').hidden=!['mcqs','cards'].includes(state.view);document.querySelectorAll('[data-mcq-filter]').forEach(e=>e.hidden=state.view!=='mcqs');$('search').placeholder=state.view==='notes'?'Search notes and topics…':'Search questions and topics…';countProgress();
  if(state.view==='notes'){
   const notes=data.notes.filter(matches);$('notes-list').innerHTML=notes.length?notes.map((n,i)=>`<details class="note"${i===0?' open':''}><summary>${esc(n.title)}</summary><div class="note-body">${n.html}</div></details>`).join(''):'<div class="empty">No matching notes. Clear the search or choose another topic.</div>';
   $('notes-count').textContent=`${notes.length} sections`;
   document.querySelectorAll('[data-activity]').forEach(b=>b.onclick=()=>{switchView('activities');window.LABS.open(b.dataset.activity);$('activities-view').scrollIntoView({block:'start',behavior:'instant'});});
  }else if(state.view==='activities'){window.LABS.show();}
  else{
   filtered=state.view==='cards'?data.cards.filter(matches):ordered(data.mcqs.filter(q=>matches(q)&&(state.difficulty==='all'||q.difficulty===state.difficulty)&&(state.format==='all'||q.format===state.format)&&(state.scope==='all'||q.scope===state.scope)&&(state.review==='all'||state.review==='wrong'&&Number.isInteger(state.answers[q.id])&&state.answers[q.id]!==q.correct||state.review==='saved'&&state.bookmarks.includes(q.id)||state.review==='unanswered'&&!Number.isInteger(state.answers[q.id]))));renderQuestion();
  }save();
 }
 function switchView(view){state.view=view;state.index=0;cardsIndex=0;render();try{const p=new URLSearchParams({view});history.replaceState(null,'',location.pathname+'?'+p);}catch{}}
 document.querySelectorAll('[data-view]').forEach((b,i)=>{b.onclick=()=>switchView(b.dataset.view);b.onkeydown=e=>{const tabs=[...document.querySelectorAll('[data-view]')];let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();tabs[n].focus();switchView(tabs[n].dataset.view);};});
 for(const id of ['topic','difficulty','format','scope','review'])$(id).onchange=()=>{state[id]=$(id).value;state.index=0;cardsIndex=0;render();};
 $('search').oninput=()=>{state.search=$('search').value;state.index=0;cardsIndex=0;render();};
 $('shuffle').onchange=()=>{state.shuffle=$('shuffle').checked;state.order=data.mcqs.map(q=>q.id);for(let i=state.order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.order[i],state.order[j]]=[state.order[j],state.order[i]];}state.index=0;render();};
 $('clear-filters').onclick=()=>{for(const id of ['topic','difficulty','format','scope','review'])state[id]=$(id).value='all';state.search=$('search').value='';state.index=cardsIndex=0;render();};
 $('clear-answers').onclick=()=>{state.answers={};state.index=0;state.review=$('review').value='all';render();};
 $('next').onclick=()=>{if(!filtered.length)return;if(state.view==='cards')cardsIndex=(cardsIndex+1)%filtered.length;else state.index=(state.index+1)%filtered.length;renderQuestion();$('question').scrollIntoView({block:'start',behavior:'instant'});};
 $('previous').onclick=()=>{if(state.view==='cards')cardsIndex=Math.max(0,cardsIndex-1);else state.index=Math.max(0,state.index-1);renderQuestion();};
 $('bookmark').onclick=()=>{const q=filtered[state.index];if(!q)return;state.bookmarks=state.bookmarks.includes(q.id)?state.bookmarks.filter(id=>id!==q.id):[...state.bookmarks,q.id];save();if(state.review==='saved'){render();return;}$('bookmark').textContent=state.bookmarks.includes(q.id)?'★ Saved':'☆ Save';$('bookmark').setAttribute('aria-pressed',String(state.bookmarks.includes(q.id)));};
 $('expand-notes').onclick=()=>document.querySelectorAll('.note').forEach(n=>n.open=true);$('collapse-notes').onclick=()=>document.querySelectorAll('.note').forEach(n=>n.open=false);$('print-notes').onclick=()=>print();
 let beforePrint=[];addEventListener('beforeprint',()=>{beforePrint=[...document.querySelectorAll('.note')].map(n=>n.open);document.querySelectorAll('.note').forEach(n=>n.open=true);});addEventListener('afterprint',()=>document.querySelectorAll('.note').forEach((n,i)=>n.open=beforePrint[i]??false));
 window.CHAPTER_APP={switchView,render};render();
})();

if(new URLSearchParams(location.search).get("view")==="activities"){const lab=new URLSearchParams(location.search).get("lab");if(lab)window.LABS.open(lab);}
