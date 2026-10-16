const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..'), workspace = path.resolve(root, '..');
const site = path.join(root, 'site'), portfolio = 'F:/My Portfolio/portfolio website/shahzad-portfolio';
const write = (relative, body) => {const target = path.join(root, relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body,'utf8');};
const copy = (source, relative) => {const target = path.join(root, relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);};
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const publicContent = JSON.parse(fs.readFileSync(path.join(portfolio,'data/site-content.json'),'utf8'));
copy(path.join(portfolio,'data/site-content.json'),'portfolio-reference/data/site-content.json');
for (const file of ['src/components/home-client.tsx','src/app/globals.css','src/app/page.tsx','package.json','README.md']) copy(path.join(portfolio,file),'portfolio-reference/'+file);
copy('F:/My Portfolio/future is here.png','site/assets/shahzad-header.png');
copy(path.join(workspace,'Educators-Master/assets/new-logo.png'),'site/assets/new-logo.png');
const profile = {bio:publicContent.site.bio,email:publicContent.site.email,linkedin:publicContent.site.linkedin,
 projects:publicContent.projects.slice(0,3).map(({title,summary,tag})=>({title,summary,tag}))};
write('site/data/profile.json',JSON.stringify(profile,null,2));
const resources = JSON.parse(fs.readFileSync(path.join(root,'content/resources.json'),'utf8'));
for (const r of resources) if(r.source) {
 copy(path.join(workspace,r.source),'site/'+r.url);
 if(r.type==='practice') {
  const target=path.join(site,r.url);
  let html=fs.readFileSync(target,'utf8');
  html=html.replace(/(<img\s+id="logo"\s+src=")[^"]+"/,'$1../../assets/logo.png"')
   .replaceAll('The Educators (Daharki Campus)','Shahzad’s Learning Hub').replaceAll('The Educators','Shahzad’s Learning Hub').replaceAll('Daharki campus branding','Personal hub branding');
  fs.writeFileSync(target,html,'utf8');
 }
}
const banks = {};
for (const [grade,id] of [['9th','ix-kinematics'],['10th','x-sound']]) {
 banks[id] = JSON.parse(fs.readFileSync(path.join(workspace,grade,'physics-mcq-bank/chapter-2-mcq-bank.json'),'utf8'));
 banks[id].school='Shahzad’s Learning Hub';
}
write('site/data/banks.js','window.MCQ_BANKS = '+JSON.stringify(banks)+';\n');
for (const [grade,title,slug] of [['11th','Kinematics','kinematics'],['12th','First Law of Thermodynamics','thermodynamics']]) {
 const context = vm.createContext({});
 vm.runInContext(fs.readFileSync(path.join(workspace,grade,'chapter-2-practice/content.js'),'utf8')+'\nthis.exported={NOTES,TOPICS};',context);
 const {NOTES,TOPICS} = context.exported;
 const classNumber = parseInt(grade);
 const blocks = NOTES.map((n,i)=>`<details class="note-block" id="note-${i+1}" open><summary>${String(i+1).padStart(2,'0')} ${esc(n.title)}</summary><div class="note-content">${n.html}</div></details>`).join('\n');
 const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>Class ${classNumber} ${esc(title)} Notes</title><link rel="icon" href="../../assets/logo.png"><link rel="stylesheet" href="../../styles.css"><script src="../../reader.js" defer></script></head><body><header class="site-header"><div class="container header-inner"><a class="brand" href="../../index.html"><img src="../../assets/logo.png" width="44" height="44" alt="Shahzad’s Learning Hub"></a><a href="../../chapter.html?class=${classNumber}&chapter=2&subject=Physics">← Class ${classNumber} resources</a></div></header><main class="reader"><p class="eyebrow">CLASS ${classNumber} · PHYSICS · CHAPTER 2</p><h1>${esc(title)} Notes</h1><p class="reader-intro">${NOTES.length} sections · Sindh Textbook Board</p><div class="reader-tools"><button class="button" data-expand>Expand all</button><button class="button" data-collapse>Collapse all</button><button class="button primary" data-print>Print notes</button><a class="button" href="../../viewer.html?resource=${classNumber===11?'xi':'xii'}-practice">Practise this chapter ↗</a></div>${blocks}<p class="reader-footer">Shahzad’s Learning Hub<br>Prepared by Sir Shahzad Gullab Bhatti</p></main></body></html>`;
 write(`site/materials/class-${classNumber}/${slug}-notes.html`,html);
}
const publicResources = resources.map(({source,...r})=>r);
write('site/data/catalog.js','window.LEARNING_HUB = '+JSON.stringify({profile,resources:publicResources},null,2)+';\n');
write('portfolio-reference/README.md',"# Portfolio reference copy\n\nCopied from F:/My Portfolio/portfolio website/shahzad-portfolio. Includes public content data and selected presentation source files. This local reference is excluded from Git and is not published. The student website adapts the profile biography, qualifications in home-client.tsx, first three research descriptions, and the supplied header artwork. The original portfolio remains untouched. Server CMS code, credentials, dependencies, build caches and CV files are not copied.\n");
console.log(`Synced ${resources.length} resources, 32 notes sections, two chapter pages, two MCQ banks and portfolio profile content.`);
require('./sync-chapter3.cjs');

require('./build-portfolio.cjs');

require('./build-study.cjs');
