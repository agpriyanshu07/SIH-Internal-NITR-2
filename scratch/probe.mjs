import * as sat from 'satellite.js';
const MU=398600.4418, RE=6378.137;
const meanMotion=(alt)=>{const a=RE+alt;return 86400/(2*Math.PI*Math.sqrt(a*a*a/MU));};
function checksum(l){let s=0;for(const c of l){if(c>='0'&&c<='9')s+=+c;else if(c==='-')s+=1;}return s%10;}
function epochField(age,now){const d=new Date(now-age*86400000);const yy=String(d.getUTCFullYear()%100).padStart(2,'0');
const doy=Math.floor((d.getTime()-Date.UTC(d.getUTCFullYear(),0,0))/86400000);
const frac=(d.getUTCHours()*3600+d.getUTCMinutes()*60+d.getUTCSeconds())/86400;
return yy+(doy+frac).toFixed(8).padStart(12,'0');}
function synth(o,now){const id=String(o.norad).padStart(5,'0');
const l1=`1 ${id}U ${o.intl.padEnd(8,' ')} ${epochField(o.age,now)}  .00002182  00000-0  12345-4 0  999`;
const revs=20000+(o.norad%9000);
const l2=`2 ${id} ${o.incl.toFixed(4).padStart(8,' ')} ${o.raan.toFixed(4).padStart(8,' ')} ${Math.round(o.ecc*1e7).toString().padStart(7,'0')} ${o.argp.toFixed(4).padStart(8,' ')} ${o.ma.toFixed(4).padStart(8,' ')} ${meanMotion(o.alt).toFixed(8).padStart(11,' ')}${String(revs).padStart(5,' ')}`;
return [l1+checksum(l1), l2+checksum(l2)];}
const EPOCH_NOW=Date.UTC(2026,7,21,14,32,7);
const iss={norad:25544,intl:'98067A',alt:421,ecc:0.0006703,incl:51.6416,raan:247.4627,argp:130.5360,ma:325.0288,age:1.8};
const [l1,l2]=synth(iss,EPOCH_NOW);
console.log('L1:['+l1+'] len='+l1.length);
console.log('L2:['+l2+'] len='+l2.length);
const rec=sat.twoline2satrec(l1,l2);
console.log('satnum',rec.satnum,'err',rec.error,'no',rec.no,'ecco',rec.ecco,'inclo',rec.inclo);
const pv=sat.propagate(rec,new Date(EPOCH_NOW));
console.log('pv',pv && pv.position);
if(pv&&pv.position){const p=pv.position;const r=Math.hypot(p.x,p.y,p.z);console.log('radius',r.toFixed(1),'alt',(r-RE).toFixed(1));}
