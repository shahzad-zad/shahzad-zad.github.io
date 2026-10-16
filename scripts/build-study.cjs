const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),workspace=path.dirname(root),site=path.join(root,'site');
const write=(file,body)=>{const p=path.join(site,file);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body,'utf8');};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const junior=JSON.parse(fs.readFileSync(path.join(root,'content/junior-notes.json'),'utf8'));
const study={},resources=[];
for(const [grade,prefix,title,slug] of [[9,'ix','Kinematics','kinematics'],[10,'x','Sound','sound'],[11,'xi','Kinematics','kinematics'],[12,'xii','First Law of Thermodynamics','thermodynamics']]){
 let mcqs,cards,notes,topics;
 if(grade<11){
  const bank=JSON.parse(fs.readFileSync(path.join(workspace,grade===9?'9th':'10th','physics-mcq-bank/chapter-2-mcq-bank.json'),'utf8'));
  mcqs=bank.questions.map(q=>({...q,explanation:q.solution}));
  cards=mcqs.map(q=>({id:q.id+'-card',topic:q.topic,prompt:q.prompt,answer:q.answer,explanation:q.explanation}));
  notes=junior[String(grade)];topics=[...new Set(mcqs.map(q=>q.topic))].map(t=>({id:t,name:t}));
 }else{
  const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(workspace,grade+'th/chapter-2-practice/content.js'),'utf8')+'\nthis.data={NOTES,QUESTIONS,TOPICS};',context);
  const data=context.data;mcqs=data.QUESTIONS.filter(q=>q.type==='mcq');cards=data.QUESTIONS.filter(q=>q.type!=='mcq');notes=data.NOTES;topics=data.TOPICS;
 }
 study[grade]={title,chapter:2,mcqs,cards,topics};
 const base={class:grade,subject:'Physics',chapter:2,format:'HTML'};
 const coverage={9:'Motion, velocity, acceleration, graphs, equations of motion and free fall.',10:'Sound waves, frequency, pitch, echoes, ultrasound and SONAR.',11:'Vectors, motion graphs, equations of motion and projectiles.',12:'Heat, work, internal energy, thermodynamic processes and heat capacities.'};
 resources.push({...base,id:prefix+'-notes',title:title+' Notes',type:'notes',description:coverage[grade]+' Definitions and worked examples.',url:`materials/class-${grade}/${slug}-notes.html`,detail:`${notes.length} sections · Print available`});
 resources.push({...base,id:prefix+'-cards',title:title+' Cards',type:'cards',description:'Tap a card to flip it and reveal the answer and explanation.',url:`study.html?class=${grade}&chapter=2&mode=cards`,detail:`${cards.length} flip cards`});
 resources.push({...base,id:prefix+'-mcqs',title:title+' MCQs',type:'mcqs',description:'Select an answer and learn from the explanation. Practise the whole chapter or choose a topic.',url:`study.html?class=${grade}&chapter=2&mode=mcqs`,detail:`${mcqs.length} MCQs · Explanations included`});
 if(grade<11){
  const blocks=notes.map((n,i)=>`<details class="note-block" open><summary>${String(i+1).padStart(2,'0')} ${esc(n.title)}</summary><div class="note-content">${n.html}</div></details>`).join('');
  write(`materials/class-${grade}/${slug}-notes.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Class ${grade} ${esc(title)} Notes</title><link rel="icon" href="../../assets/new-logo.png"><link rel="stylesheet" href="../../styles.css"><script src="../../reader.js" defer></script></head><body><header class="site-header"><div class="container header-inner"><a href="../../index.html" class="brand"><img src="../../assets/new-logo.png" alt="Shahzad’s Learning Hub" width="64" height="64"><span class="brand-title">Shahzad’s Learning Hub</span></a><a href="../../chapter.html?class=${grade}&chapter=2&subject=Physics">← Chapter 2</a></div></header><main class="reader"><p class="eyebrow">CLASS ${grade} · PHYSICS · CHAPTER 2</p><h1>${esc(title)} Notes</h1><p class="reader-intro">Full chapter revision · ${notes.length} sections</p><div class="reader-tools"><button class="button" data-expand>Expand all</button><button class="button" data-collapse>Collapse all</button><button class="button" data-print>Print notes</button><a class="button primary" href="../../study.html?class=${grade}&chapter=2&mode=cards">Cards ↗</a><a class="button" href="../../study.html?class=${grade}&chapter=2&mode=mcqs">MCQs ↗</a></div>${blocks}<p class="reader-footer">Prepared by Sir Shahzad Gullab Bhatti · Shahzad’s Learning Hub</p></main></body></html>`);
 }
}
write('data/study-data.js','window.STUDY_DATA='+JSON.stringify(study)+';\n');
const catalogPath=path.join(site,'data/catalog.js');let catalog={};const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(catalogPath,'utf8'),context);catalog=context.window.LEARNING_HUB;catalog.resources=resources;
write('data/catalog.js','window.LEARNING_HUB='+JSON.stringify(catalog,null,2)+';\n');
fs.writeFileSync(path.join(root,'content/resources.json'),JSON.stringify(resources,null,2)+'\n','utf8');
// Preserve old links as redirects into the new practice screens, without an exam screen.
for(const grade of [11,12])write(`materials/class-${grade}/chapter-2-practice.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=../../study.html?class=${grade}&chapter=2&mode=cards"><title>Chapter practice</title></head><body><a href="../../study.html?class=${grade}&chapter=2&mode=cards">Open chapter cards</a></body></html>`);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
for(const p of walk(site).filter(p=>p.endsWith('.html'))){
 let html=fs.readFileSync(p,'utf8').replaceAll('assets/logo.png','assets/new-logo.png');
 html=html.replace(/<a\b[^>]*class="brand"[^>]*>[^]*?<\/a>/g,anchor=>anchor.includes('class="brand-title"')?anchor:anchor.replace(/(<img\b[^>]*>)/,'$1<span class="brand-title">Shahzad’s Learning Hub</span>'));
 html=html.replace(/<a class="button" href="\.\.\/\.\.\/viewer\.html\?resource=(xi|xii)-practice">[^<]*<\/a>/g,(_,id)=>`<a class="button" href="../../study.html?class=${id==='xi'?11:12}&chapter=2&mode=cards">Cards ↗</a><a class="button" href="../../study.html?class=${id==='xi'?11:12}&chapter=2&mode=mcqs">MCQs ↗</a>`);
 fs.writeFileSync(p,html,'utf8');
}
const oldLogo=path.join(site,'assets/logo.png');if(fs.existsSync(oldLogo))fs.unlinkSync(oldLogo);
console.log('Built full Notes, Cards and MCQs for all four prepared chapters: '+resources.length+' chapter sections.');
require('./sync-chapter3.cjs');
