const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'tmp/browser-qa');fs.mkdirSync(out,{recursive:true});
const profile=path.join(out,'chrome-'+Date.now());
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const base=process.argv[2]||'http://127.0.0.1:8767/';
(async()=>{let ws;const log=[];try{
 const portFile=path.join(profile,'DevToolsActivePort');for(let i=0;i<100&&!fs.existsSync(portFile);i++)await sleep(100);
 const port=fs.readFileSync(portFile,'utf8').split('\n')[0];
 const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
 ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let id=0;const pending=new Map(),errors=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+' '+(m.params.exceptionDetails.exception?.description||''));if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||'Evaluation failed');return result.result.value;};
 const wait=async expression=>{for(let i=0;i<500;i++){if(await evaluate(expression))return;await sleep(40);}throw Error('Timed out: '+expression);};
 const go=async relative=>{await send('Page.navigate',{url:new URL(relative,base).href});await wait("document.readyState==='complete'");await sleep(120);};
 const assert=async(expression,label)=>{if(!await evaluate(expression))throw Error(label);log.push('PASS: '+label);};
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
 for(const size of [{name:'laptop',w:1440,h:1000},{name:'tablet',w:768,h:1024},{name:'mobile',w:390,h:844},{name:'small-mobile',w:320,h:900}]){
   await send('Emulation.setDeviceMetricsOverride',{width:size.w,height:size.h,deviceScaleFactor:1,mobile:size.w<800});await go('index.html');
   await assert(`innerWidth===${size.w}&&document.documentElement.scrollWidth<=innerWidth`,size.name+' home fits viewport');
   await assert("document.querySelectorAll('.class-card').length===4&&!document.getElementById('library')&&!document.querySelector('input[type=search]')",size.name+' home has class cards without a global resource library');
   await assert("new Set([...document.querySelectorAll('.class-card em')].map(e=>getComputedStyle(e).color)).size===1",size.name+' class labels share one colour');
   await assert("!/the educators|daharki|start here|YOUR TEACHER/.test(document.body.textContent)",size.name+' removed school branding and teacher caption');
   await assert('[...document.images].every(i=>i.complete&&i.naturalWidth>0)',size.name+' personal logo and header image load');
   await assert("document.querySelectorAll('.brand-title').length===1&&document.querySelector('.teacher-picture-link').getAttribute('href')==='portfolio.html'",size.name+' picture opens separate portfolio');await shot('home-'+size.name);
   await evaluate("document.querySelector('.teacher-picture-link').focus()");await sleep(250);
   await wait("Number(getComputedStyle(document.querySelector('.picture-tooltip')).opacity)>.99");
   await assert("document.activeElement===document.querySelector('.teacher-picture-link')",size.name+' About your teacher tooltip works on keyboard focus');
   for(const grade of [9,10,11,12]){
     await go('class.html?class='+grade);
     await assert(`document.querySelectorAll('.chapter-card').length===${grade>=11?2:1}&&document.querySelectorAll('.resource-card').length===0&&document.getElementById('class-title').textContent==='Class ${grade}'`,size.name+' class '+grade+' opens chapter cards');
     await assert('document.documentElement.scrollWidth<=innerWidth',size.name+' class '+grade+' fits viewport');
     await assert("getComputedStyle(document.querySelector('.chapter-card')).display==='grid'&&[...document.querySelectorAll('.chapter-card')].every(c=>c.scrollWidth<=c.clientWidth)",size.name+' chapter cards stack without clipped content');
     if(grade===11)await shot('class-'+size.name);
     const href=await evaluate("document.querySelector('.chapter-card').getAttribute('href')");await go(href);
     await assert(`document.querySelectorAll('.resource-card').length===3&&document.getElementById('class-title').textContent.startsWith('Chapter 2:')`,size.name+' class '+grade+' chapter opens relevant resource cards');
     await assert('document.documentElement.scrollWidth<=innerWidth',size.name+' chapter '+grade+' fits viewport');
     if(grade===11)await shot('chapter-'+size.name);
     if(grade>=11){
       await go(`chapter.html?class=${grade}&chapter=3&subject=Physics`);
       await assert("document.querySelectorAll('.resource-card').length===4&&document.body.textContent.includes('Activities')",size.name+' Chapter 3 has all four sections');
       await assert("[...document.querySelectorAll('.resource-bottom a')].map(a=>new URL(a.href).searchParams.get('view')).join(',')==='notes,cards,mcqs,activities'",'Chapter 3 cards link to matching modes');
       await assert('document.documentElement.scrollWidth<=innerWidth',size.name+' Chapter 3 section cards fit');
     }
   }
 }
 await go('class.html?class=11');
 await evaluate("document.getElementById('search').value='projectiles';document.getElementById('search').dispatchEvent(new Event('input'))");
 await assert("document.querySelectorAll('.chapter-card').length===1&&document.body.textContent.includes('Kinematics')",'search is scoped to selected class');
 await evaluate("document.getElementById('search').value='zzzznoresource';document.getElementById('search').dispatchEvent(new Event('input'))");
 await assert("!document.getElementById('empty-state').hidden&&document.querySelectorAll('.resource-card').length===0",'class search empty state');
 await evaluate("document.getElementById('empty-reset').click()");
 await assert("document.querySelectorAll('.chapter-card').length===2",'clear search keeps selected class');
 await go('class.html?class=12&q=heat');await assert("document.querySelectorAll('.chapter-card').length===1",'bookmarked class search restores');
 await go('chapter.html?class=11&chapter=2&subject=Physics&q=projectiles');await assert("document.querySelectorAll('.resource-card').length===1",'chapter search filters resource cards');
 await go('chapter.html?class=11&chapter=99');await assert("document.getElementById('class-search').hidden",'invalid chapter handled');
 await go('class.html?class=invalid');await assert("document.getElementById('class-search').hidden",'invalid class handled');
 await go('portfolio.html');
 await assert("document.querySelectorAll('.portfolio-project').length===9&&document.title.includes('Portfolio')",'separate portfolio contains all 9 original projects');
 await assert('document.documentElement.scrollWidth<=innerWidth','portfolio fits 320px');await shot('portfolio-mobile');
 await evaluate("document.querySelector('.portfolio-project details').open=true");
 await assert("document.querySelector('.portfolio-project details').open",'portfolio project details expand');
 await go('bank.html?id=ix-kinematics');
 await assert("document.querySelectorAll('.bank-question').length===50&&document.querySelectorAll('details[open]').length===0",'Class 9 bank has 50 questions with initially hidden answers');
 await evaluate("document.querySelector('[data-expand]').click()");
 await assert("document.querySelectorAll('details[open]').length===50",'bank reveal all');
 await evaluate("document.querySelector('[data-collapse]').click()");
 await assert("document.querySelectorAll('details[open]').length===0",'bank hide all');
 await assert('document.documentElement.scrollWidth<=innerWidth','Class 9 bank fits 320px');await shot('bank-mobile');
 await go('bank.html?id=x-sound');await assert("document.querySelectorAll('.bank-question').length===50",'Class 10 bank has 50 questions');
 for(const grade of [9,10,11,12]){
   const slug=grade===10?'sound':grade===12?'thermodynamics':'kinematics';
   await go(`materials/class-${grade}/${slug}-notes.html`);
   await assert("document.querySelectorAll('.note-block').length===16",`Class ${grade} complete notes`);
   await assert('document.documentElement.scrollWidth<=innerWidth',`Class ${grade} notes fit 320px`);await shot('notes-'+grade+'-mobile');
   await evaluate("document.querySelector('[data-collapse]').click()");await assert("document.querySelectorAll('details[open]').length===0",`Class ${grade} collapse notes`);
   await evaluate("dispatchEvent(new Event('beforeprint'))");await assert("document.querySelectorAll('details[open]').length===16",`Class ${grade} print expands notes`);
   await evaluate("dispatchEvent(new Event('afterprint'))");await assert("document.querySelectorAll('details[open]').length===0",`Class ${grade} restores collapsed state after print`);
   await go(`study.html?class=${grade}&chapter=2&mode=cards`);
   await wait("!!document.getElementById('study-card')");
   await evaluate("document.getElementById('study-card').click()");
   await assert("document.getElementById('study-card').classList.contains('is-flipped')&&!document.getElementById('study-next').hidden",`Class ${grade} card flips with Next available`);
   await assert('document.documentElement.scrollWidth<=innerWidth',`Class ${grade} cards fit 320px`);await sleep(650);await shot('cards-'+grade+'-mobile');
   await evaluate("document.getElementById('study-next').click()");
   await assert("document.getElementById('study-position').textContent.startsWith('2 of')",`Class ${grade} Next advances flipped card`);
   await go(`study.html?class=${grade}&chapter=2&mode=mcqs`);
   await wait("document.querySelectorAll('.study-option').length===4");
   await evaluate(`document.querySelectorAll('.study-option')[window.STUDY_DATA[${grade}].mcqs[0].correct].click()`);
   await assert("document.getElementById('study-feedback').classList.contains('correct')&&!document.getElementById('study-feedback').hidden",`Class ${grade} correct answer reveals explanation`);
   await evaluate("document.getElementById('study-next').click()");
   await evaluate(`document.querySelectorAll('.study-option')[(window.STUDY_DATA[${grade}].mcqs[1].correct+1)%4].click()`);
   await assert("document.getElementById('study-feedback').classList.contains('incorrect')&&document.getElementById('study-feedback').classList.contains('animate')",`Class ${grade} wrong answer animates with explanation`);
   await assert('document.documentElement.scrollWidth<=innerWidth',`Class ${grade} MCQs fit 320px`);await shot('mcqs-'+grade+'-mobile');
   await evaluate("const topic=document.getElementById('study-topic');topic.selectedIndex=1;topic.dispatchEvent(new Event('change'))");
   await assert("document.getElementById('study-position').textContent.startsWith('1 of')",`Class ${grade} topic filter works`);
   await assert("![...document.querySelectorAll('button,a')].some(b=>b.textContent.trim()==='Test')",`Class ${grade} no Test screen`);
 }
 await go('viewer.html?resource=invalid');await assert("document.getElementById('chapter-frame').hidden&&document.getElementById('viewer-message').textContent.includes('unavailable')",'invalid viewer ID handled');
 await go('bank.html?id=__proto__');await assert("document.getElementById('bank-intro').textContent.includes('unavailable')",'invalid bank ID handled');
 if(errors.length)throw Error('Browser errors: '+errors.join('\n'));
 log.push('PASS: no JavaScript exceptions');
 fs.writeFileSync(path.join(out,'results.txt'),log.join('\n'));console.log(log.join('\n'));
 await send('Browser.close');
 }finally{if(ws)ws.close();chrome.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
