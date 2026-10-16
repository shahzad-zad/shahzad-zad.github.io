const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'tmp/chapter3-browser-qa');fs.mkdirSync(out,{recursive:true});
const profile=path.join(out,'chrome-'+Date.now());
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const base=process.argv[2]||'http://127.0.0.1:8768/';
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
 const assert=async(expression,label)=>{if(!await evaluate(expression))throw Error(label+' | '+await evaluate("JSON.stringify({position:document.getElementById('position')?.textContent,review:document.getElementById('review')?.value,storage:localStorage.getItem('shahzad-ch3-class11-v1')})"));log.push('PASS: '+label);};
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});

 const click=async selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
 const change=async(id,value)=>evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(id)});e.value=${JSON.stringify(String(value))};e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 const mode=async view=>click(`[data-view="${view}"]`);
 const fit=label=>assert('document.documentElement.scrollWidth<=innerWidth',label);
 const close=(a,b)=>Math.abs(a-b)<1e-7;
 for(const size of [{name:'laptop',w:1440,h:1000},{name:'tablet',w:768,h:1024},{name:'mobile',w:390,h:844},{name:'small-mobile',w:320,h:900}]){
 await send('Emulation.setDeviceMetricsOverride',{width:size.w,height:size.h,deviceScaleFactor:1,mobile:size.w<800});
 await go('index.html');await fit(size.name+' chapter chooser fits');
 for(const grade of [11,12]){
  await go(`materials/class-${grade}/chapter-3/index.html?view=notes`);
  await wait("!!window.CHAPTER_APP&&!!document.querySelector('.note-body p')");
  await click('#clear-filters');await click('#clear-answers');await fit(size.name+' class '+grade+' notes fit');
  await assert(`document.querySelectorAll('.note').length===${grade===11?29:32}`,'complete notes class '+grade);
  await assert("document.querySelectorAll('.mode-nav button').length===4&&!document.querySelector('.note-body').textContent.includes('\\u003c')",'notes render as HTML and all four modes exist');
  await assert('[...document.images].every(i=>i.complete&&i.naturalWidth>0)','logo loads');
  await change('search','zzzz-no-result');await assert("document.querySelectorAll('.note').length===0",'note search empty state');await change('search','');
  await click('#collapse-notes');await evaluate("dispatchEvent(new Event('beforeprint'))");await assert("[...document.querySelectorAll('.note')].every(n=>n.open)",'print expands notes');await evaluate("dispatchEvent(new Event('afterprint'))");
  await assert("[...document.querySelectorAll('.note')].every(n=>!n.open)",'print restores closed notes');
  await shot(`notes-${grade}-${size.name}`);
  await mode('mcqs');await click('#clear-filters');await click('#clear-answers');
  await evaluate("document.querySelectorAll('.option')[window.CHAPTER_DATA.mcqs[0].correct].click()");
  await assert("document.getElementById('feedback').classList.contains('correct')&&document.querySelectorAll('.option:disabled').length===4",'correct MCQ feedback and locked choices');
  await click('#next');await evaluate("document.querySelectorAll('.option')[(window.CHAPTER_DATA.mcqs[1].correct+1)%4].click()");
  await assert("document.getElementById('feedback').classList.contains('incorrect')&&document.getElementById('feedback').textContent.length>40",'wrong MCQ feedback includes explanation');
  await fit(size.name+' class '+grade+' MCQs fit');await sleep(350);await shot(`mcqs-${grade}-${size.name}`);
  if(await evaluate("document.getElementById('bookmark').getAttribute('aria-pressed')==='false'"))await click('#bookmark');await change('review','saved');await assert("document.getElementById('position').textContent.startsWith('1 of 1')",'saved question filter');
  await change('review','wrong');await assert("document.getElementById('position').textContent.startsWith('1 of 1')",'incorrect answer filter');
  await click('#clear-filters');await change('format','Numerical');await assert("document.querySelector('.tag').nextElementSibling.textContent==='Numerical'",'question format filter');await click('#clear-filters');
  await mode('cards');await click('#flip');await sleep(650);
  await assert("document.getElementById('flip').classList.contains('flipped')&&!document.getElementById('next').hidden",'card flips and Next remains available');
  await fit(size.name+' class '+grade+' cards fit');await shot(`cards-${grade}-${size.name}`);await click('#next');
  await assert("document.getElementById('position').textContent.startsWith('2 of')",'Next advances flipped card');
  await mode('activities');
  const ids=grade===11?['force','impulse','collision','incline','pairs']:['engine','carnot','fridge','mixing','entropy'];
  for(const id of ids){await evaluate(`window.LABS.open('${id}')`);await fit(size.name+' lab '+id+' fits');await assert("!!document.querySelector('#lab-diagram svg')&&document.querySelectorAll('[data-choice]').length>=2",'lab '+id+' diagram and prediction available');if(size.name==='laptop'||size.name==='small-mobile')await shot(`${id}-${size.name}`);}
 }
 }
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await go('materials/class-11/chapter-3/index.html?view=activities');
 await evaluate("window.LABS.open('force')");await change('lab-force',16);await assert("window.LABS.lastResults.acceleration===0&&!window.LABS.lastResults.sliding",'static friction threshold');await change('lab-force',17);await assert("Math.abs(window.LABS.lastResults.acceleration-1.05)<1e-9",'sliding force calculation');
 await evaluate("window.LABS.open('impulse')");await change('lab-shape','triangle');await assert("window.LABS.lastResults.impulse===10&&window.LABS.lastResults.deltaVelocity===5",'triangle impulse area');await change('lab-shape','trapezoid');await assert("window.LABS.lastResults.impulse===15",'trapezoid impulse area');
 await evaluate("window.LABS.open('collision')");await assert("Math.abs(window.LABS.lastResults.v1+1.2)<1e-9&&Math.abs(window.LABS.lastResults.v2-4.8)<1e-9&&Math.abs(window.LABS.lastResults.kineticBefore-window.LABS.lastResults.kineticAfter)<1e-9",'elastic collision conserves momentum and kinetic energy');await change('lab-e',0);await assert("window.LABS.lastResults.v1===2.4&&window.LABS.lastResults.v2===2.4&&Math.abs(window.LABS.lastResults.pBefore-window.LABS.lastResults.pAfter)<1e-9",'perfectly inelastic collision');await change('lab-u1',-6);await assert("document.getElementById('play-collision').disabled",'non-approaching bodies not animated as a collision');
 await evaluate("window.LABS.open('incline')");await assert("!window.LABS.lastResults.sliding",'incline held below repose angle');await change('lab-angle',45);await assert("Math.abs(window.LABS.lastResults.acceleration-10*(Math.sin(Math.PI/4)-.32*Math.cos(Math.PI/4)))<1e-9",'incline acceleration calculation');
 await go('materials/class-12/chapter-3/index.html?view=activities');
 await evaluate("window.LABS.open('engine')");await assert("window.LABS.lastResults.work===400&&window.LABS.lastResults.Qc===600&&window.LABS.lastResults.possible",'engine energy balance and Carnot ceiling');await change('lab-eff',70);await assert("!window.LABS.lastResults.possible&&window.LABS.lastResults.entropyUniverse<0",'impossible engine flagged');
 await evaluate("window.LABS.open('carnot')");await assert("Math.abs(window.LABS.lastResults.Qh-.1*8.31*600*Math.log(2))<1e-8&&window.LABS.lastResults.efficiency===.5",'Carnot heat and efficiency');await click('[data-stage="1"]');await assert("window.LABS.lastResults.stageHeat===0&&Math.abs(window.LABS.lastResults.stageDeltaU+623.25)<1e-8&&Math.abs(window.LABS.lastResults.stageWork-623.25)<1e-8",'adiabatic Carnot stage signs and balance');
 await evaluate("window.LABS.open('fridge')");await assert("window.LABS.lastResults.cop===6&&window.LABS.lastResults.copHeatPump===7&&window.LABS.lastResults.possible",'fridge COP and heat-pump relation');await change('lab-work',50);await assert("!window.LABS.lastResults.possible",'impossible refrigerator flagged');
 await evaluate("window.LABS.open('mixing')");await assert("Math.abs(window.LABS.lastResults.finalCelsius-50)<1e-9&&window.LABS.lastResults.entropyHot<0&&window.LABS.lastResults.entropyCold>0&&window.LABS.lastResults.entropyTotal>0&&Math.abs(window.LABS.lastResults.heatHot+window.LABS.lastResults.heatCold)<1e-7",'mixing energy and entropy ledger');
 await evaluate("window.LABS.open('entropy')");const S=await evaluate('window.LABS.lastResults.entropyGas');await assert("window.LABS.lastResults.entropyUniverse===0&&window.LABS.lastResults.heat>0",'reversible entropy balance');await change('lab-path','free');await assert(`window.LABS.lastResults.heat===0&&window.LABS.lastResults.work===0&&Math.abs(window.LABS.lastResults.entropyGas-${S})<1e-9&&window.LABS.lastResults.entropyUniverse>0`,'free expansion entropy differs from actual Q over T');
 for(const [grade,slug]of [[11,'dynamics'],[12,'second-law-thermodynamics']]){
  const url=`file:///F:/Teaching/Educator/${grade}th/chapter-3-practice/chapter-3-${slug}.html?view=cards`;
  await send('Page.navigate',{url});await wait("document.readyState==='complete'&&!!document.getElementById('flip')");await assert('document.images[0].naturalWidth>0','standalone file logo embedded');await click('#flip');await assert("document.getElementById('flip').classList.contains('flipped')",'standalone works offline');
 }
 if(errors.length)throw Error(errors.join('\n'));
 log.push('PASS: no JavaScript exceptions');fs.writeFileSync(path.join(out,'results.txt'),log.join('\n'));console.log(log.join('\n'));await send('Browser.close');
 }finally{if(ws)ws.close();chrome.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
