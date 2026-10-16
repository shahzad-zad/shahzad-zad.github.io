const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),workspace=path.dirname(root),site=path.join(root,'site');
const catalogPath=path.join(site,'data/catalog.js'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(catalogPath,'utf8'),ctx);
const catalog=ctx.window.LEARNING_HUB;
catalog.resources=catalog.resources.filter(r=>!(r.chapter===3&&[11,12].includes(r.class)&&r.subject==='Physics'));
for(const grade of [11,12]){
 const source=path.join(workspace,grade+'th/chapter-3-practice'),dest=path.join(site,`materials/class-${grade}/chapter-3`);
 const data=JSON.parse(fs.readFileSync(path.join(source,'content.json'),'utf8'));
 fs.mkdirSync(dest,{recursive:true});
 for(const name of ['assets','docs'])fs.cpSync(path.join(source,name),path.join(dest,name),{recursive:true});
 let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
 html=html.replace('href="../../Chapter-3-Preparation/index.html"','href="../../../index.html"')
  .replace('href="../../Chapter-3-Preparation/index.html"',`href="../../../chapter.html?class=${grade}&amp;chapter=3&amp;subject=Physics"`)
  .replace('href="../../Chapter-3-Preparation/docs/entry-test-sources.md"','href="../../chapter-3-sources.md"');
 fs.writeFileSync(path.join(dest,'index.html'),html);
 const descriptions={notes:'Full chapter notes with worked examples and concept explanations.',cards:'Tap to flip each card and reveal the answer and explanation.',mcqs:'Choose a topic and difficulty, answer MCQs, and review explanations.',activities:'Explore concepts with interactive diagrams, controls and calculations.'};
 const counts={notes:`${data.notes.length} sections · Print available`,cards:`${data.cards.length} flip cards`,mcqs:`${data.mcqs.length} MCQs · Explanations included`,activities:'5 interactive activities'};
 for(const type of ['notes','cards','mcqs','activities'])catalog.resources.push({class:grade,subject:'Physics',chapter:3,format:'HTML',id:`class-${grade}-ch3-${type}`,title:data.title+' '+type[0].toUpperCase()+type.slice(1),type,description:descriptions[type],url:`materials/class-${grade}/chapter-3/index.html?view=${type}`,detail:counts[type]});
}
fs.copyFileSync(path.join(workspace,'Chapter-3-Preparation/docs/entry-test-sources.md'),path.join(site,'materials/chapter-3-sources.md'));
fs.writeFileSync(catalogPath,'window.LEARNING_HUB='+JSON.stringify(catalog,null,2)+';\n');
fs.writeFileSync(path.join(root,'content/resources.json'),JSON.stringify(catalog.resources,null,2)+'\n');
console.log('Synced both Chapter 3 pages and eight resource cards.');
