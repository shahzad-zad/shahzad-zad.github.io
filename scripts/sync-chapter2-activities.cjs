const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),workspace=path.dirname(root),site=path.join(root,'site'),source=path.join(workspace,'Chapter-2-Activities');
const {html}=require(path.join(source,'scripts/build.cjs'));
const dest=path.join(site,'materials/chapter-2-activities');fs.mkdirSync(dest,{recursive:true});
for(const file of ['app.js','styles.css','thermo-apparatus.js'])fs.copyFileSync(path.join(source,'assets',file),path.join(dest,file));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(site,'data/catalog.js'),'utf8'),context);const catalog=context.window.LEARNING_HUB;
catalog.resources=catalog.resources.filter(r=>!(r.chapter===2&&[11,12].includes(r.class)&&r.type==='activities'));
for(const grade of [11,12]){
 const dir=path.join(site,`materials/class-${grade}/chapter-2`);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'activities.html'),html(grade,true));
 catalog.resources.push({class:grade,subject:'Physics',chapter:2,format:'HTML',id:`class-${grade}-ch2-activities`,title:(grade===11?'Kinematics':'First Law of Thermodynamics')+' Activities',type:'activities',description:grade===11?'Build concepts with vectors, motion graphs, free fall, projectiles and relative velocity.':'Explore energy balance, piston processes, PV paths, calorimetry and heat capacities.',url:`materials/class-${grade}/chapter-2/activities.html`,detail:(grade===11?6:5)+' interactive activities'});
}
fs.writeFileSync(path.join(site,'data/catalog.js'),'window.LEARNING_HUB='+JSON.stringify(catalog,null,2)+';\n');fs.writeFileSync(path.join(root,'content/resources.json'),JSON.stringify(catalog.resources,null,2)+'\n');
console.log('Synced Chapter 2 activities for Classes 11 and 12.');
