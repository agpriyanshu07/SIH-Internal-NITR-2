import * as sat from 'satellite.js';
import fs from 'node:fs';
const T=process.argv[2];
const MU=398600.4418;
function parse(file,group){const L=fs.readFileSync(`${T}/${file}`,'utf8').split(/\r?\n/);const o=[];
for(let i=0;i+2<L.length;i+=3){const n=L[i].trim(),a=L[i+1],b=L[i+2];if(!/^1 /.test(a)||!/^2 /.test(b))continue;
try{const r=sat.twoline2satrec(a,b);if(r.error)continue;o.push({name:n,group,rec:r});}catch(e){}}return o;}
const sets=[['stations.txt','stations'],['cosmos_1408.txt','cosmos-1408-debris'],['iridium_33.txt','iridium-33-debris'],['cosmos_2251.txt','cosmos-2251-debris']];
let all=[];for(const [f,g] of sets){const s=parse(f,g);console.log(g,s.length);all=all.concat(s);}
console.log('TOTAL',all.length);
const periApo=(r)=>{const n=r.no/60;const a=Math.cbrt(MU/(n*n));return [a*(1-r.ecco),a*(1+r.ecco)];};
const pa=all.map(o=>periApo(o.rec));
const SCREEN=450;
let survive=0;const pairs=[];
for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){
 if(pa[i][0]-pa[j][1]>SCREEN||pa[j][0]-pa[i][1]>SCREEN)continue;survive++;pairs.push([i,j]);}
console.log('total pairs',all.length*(all.length-1)/2,'survivors',survive);
// timing: propagate all at 1440 steps
const start=new Date(Date.UTC(2024,10,17,23,5,0));
let t0=Date.now();const STEP=60,STEPS=1440;
let cand=new Map();
for(let k=0;k<STEPS;k++){
 const t=new Date(start.getTime()+k*STEP*1000);
 const pos=new Array(all.length);
 for(let i=0;i<all.length;i++){const pv=sat.propagate(all[i].rec,t);pos[i]=pv&&pv.position?pv.position:null;}
 for(const [i,j] of pairs){const A=pos[i],B=pos[j];if(!A||!B)continue;
  const dx=A.x-B.x,dy=A.y-B.y,dz=A.z-B.z;const d2=dx*dx+dy*dy+dz*dz;if(d2>SCREEN*SCREEN)continue;
  const d=Math.sqrt(d2);const key=i*100000+j;const p=cand.get(key);if(!p||d<p.d)cand.set(key,{i,j,d,t});}
}
console.log('elapsed ms',Date.Now===undefined?Date.now()-t0:Date.now()-t0,'candidates',cand.size);
const arr=[...cand.values()].sort((a,b)=>a.d-b.d).slice(0,10);
for(const c of arr)console.log(all[c.i].name,'X',all[c.j].name,c.d.toFixed(3),'km',c.t.toISOString());
