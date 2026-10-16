const fs=require('fs'),path=require('path'),crypto=require('crypto');
const site=path.resolve(__dirname,'../site');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
let count=0;
for(const file of walk(site).filter(f=>f.endsWith('.html'))){
 const original=fs.readFileSync(file,'utf8');
 const html=original.replace(/((?:href|src)=["'])([^"']+\.(?:css|js))(?:\?[^"']*)?(["'])/g,(all,start,url,end)=>{
  if(/^(?:[a-z]+:|\/\/)/i.test(url))return all;
  const asset=path.resolve(path.dirname(file),url);
  if(!fs.existsSync(asset))throw Error('Missing asset '+url);
  const version=crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0,12);
  return start+url+'?v='+version+end;
 });
 if(html!==original){fs.writeFileSync(file,html);count++;}
}
console.log(`Versioned CSS and JavaScript references in ${count} pages.`);
