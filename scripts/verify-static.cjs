const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),site=path.join(root,'site');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk(site),errors=[];
const context=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(site,'data/catalog.js'),'utf8'),context);
const {resources}=context.window.LEARNING_HUB;
if(resources.some(r=>r.type==='paper')||files.some(f=>f.endsWith('.docx')))errors.push('Test papers must not be published on the student website');
if(new Set(resources.map(r=>r.id)).size!==resources.length)errors.push('Duplicate resource IDs');
for(const r of resources){
 const target=path.resolve(site,r.url.split(/[?#]/)[0]);
 if(!target.startsWith(site+path.sep)||!fs.existsSync(target))errors.push('Missing/unsafe resource: '+r.id);
 if(![9,10,11,12].includes(r.class)||!['notes','cards','mcqs','activities','practice','bank'].includes(r.type))errors.push('Invalid metadata: '+r.id);
}
for(const file of files.filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(file,'utf8');
 if(/the educators|daharki/i.test(html))errors.push('School branding remains in published HTML: '+file);
 if(!html.includes('name="viewport"'))errors.push('Missing viewport: '+file);
 for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
   const value=match[1];if(/^(?:[a-z]+:|#|\/\/)/i.test(value))continue;
   if(value.startsWith('/'))errors.push('Root-absolute path breaks project Pages: '+file+' '+value);
   const target=path.resolve(path.dirname(file),decodeURIComponent(value.split(/[?#]/)[0]));
   if(!fs.existsSync(target))errors.push('Broken local reference: '+file+' '+value);
 }
}
if(files.some(f=>/\.env|CMS_PASSWORD|Shahzad_CV|site-content\.json/.test(f)))errors.push('Unneeded portfolio server/private files in published site');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${resources.length} catalogue resources and ${files.length} published files; relative paths, local links and metadata verified.`);
