"use strict";
// Audio is explicitly resumed on a player gesture (including mobile Safari).
let audioVoices=0,audioPeak=0;
sound=(frequency=440,duration=.08,type="sine")=>{
 if(!meta.sound||audioVoices>=12)return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  ac??=new Audio();if(ac.state==='suspended')ac.resume().catch(()=>{});
  const oscillator=ac.createOscillator(),gainNode=ac.createGain();oscillator.type=type;
  oscillator.frequency.setValueAtTime(frequency,ac.currentTime);oscillator.frequency.exponentialRampToValueAtTime(Math.max(40,frequency*.7),ac.currentTime+duration);
  gainNode.gain.setValueAtTime(.0001,ac.currentTime);gainNode.gain.linearRampToValueAtTime(.09,ac.currentTime+.006);gainNode.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);
  oscillator.connect(gainNode).connect(ac.destination);audioVoices++;audioPeak=Math.max(audioPeak,audioVoices);
  oscillator.onended=()=>{audioVoices--;oscillator.disconnect();gainNode.disconnect()};oscillator.start();oscillator.stop(ac.currentTime+duration+.01);
 }catch(error){console.warn('Sound unavailable',error)}
};
const unlockAudio=()=>{if(meta.sound){try{ac??=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume().catch(()=>{})}catch(e){}}};
addEventListener('pointerdown',unlockAudio);addEventListener('keydown',unlockAudio);
E('soundBtn').insertAdjacentHTML('afterend','<button id="testSound">TEST SOUND</button>');
E('testSound').onclick=()=>{meta.sound=true;save();E('soundBtn').textContent='SOUND ON';sound(660,.28,'triangle');setTimeout(()=>sound(880,.25,'sine'),160);toast('Sound test: two notes · SOUND ON')};
const newPowers=[
 ['fleet','Comet Boots','Move speed +5% of base per rank.'],
 ['magnet','Fish Magnet','Fish attraction range +28 per rank.'],
 ['warp','Warp Engine','Dash recharge improves by 10% of base per rank.'],
 ['vitality','Nine Lives','Gain 18 maximum HP and heal 25 HP.'],
 ['orbit','Orbiting Bells','Unlock orbiting bells. Each rank adds 7 contact damage/sec; more bells at ranks 4 and 7.'],
 ['nova','Nova Purr','Every 6 seconds, pulse for 20 damage per rank in a growing radius.'],
 ['frost','Frost Whiskers','Slow nearby ordinary enemies by 4% per rank (Titans: 2%).'],
 ['drone','Fish Drone','A companion aims a shot at the closest enemy every 1.2 seconds for 7 damage per rank.'],
 ['dashwave','Warp Wake','Dashing releases a shockwave dealing 25 damage per rank.'],
 ['lucky','Starlight Study','Fish grant 6% extra XP per rank; score is unchanged.']
];
newPowers.forEach(([id,name,text])=>upgrades.push({id,name,text,apply:()=>{if(id==='vitality'){player.maxHp+=18;player.hp=Math.min(player.maxHp,player.hp+25)}}}));
const endlessPowers=[
 {id:'mastery',name:'Endless Power',text:'All attacks gain +3% base damage. Unlimited ranks.',endless:true,apply:()=>{}},
 {id:'endurance',name:'Endless Vitality',text:'Gain 8 maximum HP and heal 20 HP. Unlimited ranks.',endless:true,apply:()=>{player.maxHp+=8;player.hp=Math.min(player.maxHp,player.hp+20)}},
 {id:'recovery',name:'Endless Recovery',text:'Restore 30 HP and gain +0.15 HP/sec regeneration. Unlimited ranks.',endless:true,apply:()=>{player.hp=Math.min(player.maxHp,player.hp+30)}}
];
let novaClock=6,droneClock=1,novaFlash=0;
const powerReset=reset;reset=()=>{powerReset();for(const u of [...newPowers.map(p=>({id:p[0]})),...endlessPowers])player.upgradeLevels[u.id]=0;novaClock=6;droneClock=1;novaFlash=0;rebalance()};
const powerBalance=rebalance;rebalance=()=>{
 powerBalance();const u=player.upgradeLevels,m=1+.03*(u.mastery||0);player.damage*=m;player.shieldDamage*=m;
 player.move=230*(1+.05*(u.fleet||0));player.magnet=140+28*(u.magnet||0);player.dashMax=1.3/(1+.1*(u.warp||0));
};
gain=value=>{xp+=value*(1+.06*(player.upgradeLevels.lucky||0));score+=value*10;sound(680,.04);updateHud()};
const preciseHud=updateHud;updateHud=()=>{preciseHud();if(player)E('xpText').textContent='NEXT POWER: '+Math.floor(xp)+' / '+xpNeed};
function skillDamage(e,damage){if(e.dead||!running)return;e.hp-=damage*(1+.03*(player.upgradeLevels.mastery||0));if(e.hp<=0)defeatEnemy(e)}
function bells(){const rank=player.upgradeLevels.orbit||0;return Array.from({length:rank?1+Math.floor((rank-1)/3):0},(_,i)=>{const a=elapsed*2.5+i*Math.PI*2/(1+Math.floor((rank-1)/3));return{x:player.x+Math.cos(a)*62,y:player.y+Math.sin(a)*62}})}
const powerDash=dash;dash=()=>{const ready=running&&!paused&&player.dash<=0;powerDash();if(ready&&(player.upgradeLevels.dashwave||0)){enemies.forEach(e=>{if(Math.hypot(e.x-player.x,e.y-player.y)<135+e.r)skillDamage(e,25*player.upgradeLevels.dashwave)});novaFlash=.25;sound(210,.18,'sawtooth')}};
const powerUpdate=update;update=dt=>{
 const u=player.upgradeLevels;
 enemies.forEach(e=>{e.originalSpeed??=e.speed;e.speed=e.originalSpeed*(Math.hypot(e.x-player.x,e.y-player.y)<180?1-(u.frost||0)*(e.boss?.02:.04):1)});
 powerUpdate(dt);if(!running||paused)return;
 player.hp=Math.min(player.maxHp,player.hp+.15*(u.recovery||0)*dt);novaFlash=Math.max(0,novaFlash-dt);novaClock-=dt;droneClock-=dt;
 if(u.orbit){const positions=bells();enemies.forEach(e=>{if(positions.some(b=>Math.hypot(b.x-e.x,b.y-e.y)<e.r+10))skillDamage(e,7*u.orbit*dt)})}
 if(novaClock<=0){novaClock=6;if(u.nova){enemies.forEach(e=>{if(Math.hypot(e.x-player.x,e.y-player.y)<130+u.nova*10+e.r)skillDamage(e,20*u.nova)});novaFlash=.4;sound(260,.18,'triangle')}}
 if(droneClock<=0){droneClock=1.2;if(u.drone){const target=enemies.filter(e=>!e.dead).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))[0];if(target){const x=player.x+30,y=player.y-30,a=Math.atan2(target.y-y,target.x-x);bullets.push({x,y,vx:Math.cos(a)*570,vy:Math.sin(a)*570,r:5,damage:7*u.drone*(1+.03*(u.mastery||0)),pierce:0});sound(520,.06,'triangle')}}}
};
const bossNames=[
 ['Void Seed','Nebula Mantis','Eclipse Serpent'],['Crater Beetle','Iron Scorpion','Mercurial Wyrm'],['Sulfur Bloom','Acid Moth','Venus Hydra'],['Grove Guardian','Basil Stag','Gaia Treant'],['Rust Scarab','Canyon Crab','Crimson Phoenix'],['Storm Eye','Thunder Ray','Tempest Kraken'],['Ring Sentinel','Rosemary Harp','Saturn Crown'],['Ice Urchin','Frost Manta','Aurora Jellyfish'],['Abyss Shell','Tidal Trident','Ocean Leviathan']
];
const detailedSpawn=spawnTitan;spawnTitan=()=>{detailedSpawn();titan.title=bossNames[stageIndex][titan.rank-1];toast(titan.title.toUpperCase()+' · TITAN '+titan.rank+'/3')};
// Three distinct silhouettes per world: shell guardian, winged hunter, crowned serpent.
function titanArt(e){
 const c=ctx,r=e.r,p=planets[e.art],k=e.art;c.save();c.translate(e.x,e.y);c.lineWidth=3;c.strokeStyle=p.color;c.fillStyle=p.bg;
 if(e.rank===1){
  for(let i=0;i<6+k%4;i++){const a=i*Math.PI*2/(6+k%4);c.beginPath();c.moveTo(Math.cos(a)*r*.6,Math.sin(a)*r*.6);c.lineTo(Math.cos(a+.13)*r*1.25,Math.sin(a+.13)*r*1.25);c.lineTo(Math.cos(a+.3)*r*.65,Math.sin(a+.3)*r*.65);c.fill();c.stroke()}
  orb(c,0,0,r*.82,p.color);orb(c,0,0,r*.65,p.bg);
  for(let i=0;i<3+k%3;i++){const a=i*2.4;orb(c,Math.cos(a)*r*.42,Math.sin(a)*r*.42,r*.12,p.color)}
 }else if(e.rank===2){
  for(const side of [-1,1]){c.save();c.scale(side,1);c.beginPath();c.moveTo(0,-r*.45);c.bezierCurveTo(r*.7,-r*1.4,r*1.6,-r*.65,r*1.3,r*.5);c.lineTo(r*.65,r*.2);c.lineTo(r*.5,r*.8);c.lineTo(0,r*.55);c.fill();c.stroke();for(let j=0;j<3+k%4;j++){c.beginPath();c.moveTo(r*.2,0);c.lineTo(r*(.8+j*.09),r*(-.6+j*.22));c.stroke()}c.restore()}
  c.beginPath();c.ellipse(0,0,r*.38,r*.88,0,0,7);c.fillStyle=p.color;c.fill();
 }else{
  for(let i=7;i>=1;i--){const a=i*.7+elapsed*.9;orb(c,Math.sin(a)*r*.6,r*(.2+i*.14),r*(.4-i*.025),p.color);orb(c,Math.sin(a)*r*.6,r*(.2+i*.14),r*(.27-i*.018),p.bg)}
  for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*r*.35,-r*.45);c.lineTo(i*r*.8,-r*(1.15+(i===0?.3:0)));c.lineTo(i*r*.35+r*.18,-r*.35);c.fillStyle=p.color;c.fill()}
  orb(c,0,-r*.2,r*.63,p.color);orb(c,0,-r*.2,r*.46,p.bg);
 }
 // Planet-specific anatomy overlays make all 27 combinations recognizable.
 if(k===0){c.strokeStyle='#d999ff';for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,r*(.9+i*.12),elapsed+i,elapsed+i+1.3);c.stroke()}}
 if(k===1){for(let i=0;i<5;i++)orb(c,Math.sin(i*3)*r*.5,Math.cos(i*4)*r*.45,8,'#726b68')}
 if(k===2){c.strokeStyle='#e9eb7b';for(const side of [-1,1]){c.beginPath();c.moveTo(side*r*.3,-r*.3);c.quadraticCurveTo(side*r,-r*1.3,side*r*.75,-r*1.1);c.stroke();orb(c,side*r*.75,-r*1.1,7,'#faff9c')}}
 if(k===3){for(let i=0;i<5;i++){c.fillStyle='#63ed9b';c.beginPath();c.ellipse((i-2)*r*.3,-r*.65,r*.28,r*.1,i*.5,0,7);c.fill()}}
 if(k===4){c.strokeStyle='#ffca79';c.beginPath();c.moveTo(-r*.5,-r*.4);c.lineTo(0,-r*.1);c.lineTo(-r*.2,r*.2);c.lineTo(r*.5,r*.45);c.stroke()}
 if(k===5){c.strokeStyle='#fff0cc';for(const side of [-1,1]){c.beginPath();c.moveTo(side*r*.55,-r*.6);c.lineTo(side*r*.9,-r*.1);c.lineTo(side*r*.65,r*.1);c.lineTo(side*r,r*.6);c.stroke()}}
 if(k===6){c.beginPath();c.ellipse(0,0,r*1.5,r*.35,-.35,0,7);c.strokeStyle='#ffe9b5';c.lineWidth=7;c.stroke()}
 if(k===7){for(const side of [-1,1]){c.beginPath();c.moveTo(side*r*.5,r*.2);c.lineTo(side*r*.9,-r*.8);c.lineTo(side*r*.7,r*.6);c.fillStyle='#d6fdff';c.fill()}}
 if(k===8){for(let i=0;i<4;i++){c.beginPath();c.moveTo((i-1.5)*r*.3,r*.45);c.bezierCurveTo((i-2)*r*.4,r*1.1,(i-1)*r*.4,r*.8,(i-1.5)*r*.4,r*1.35);c.strokeStyle='#74bdff';c.stroke()}}
 for(const side of [-1,1]){orb(c,side*r*.23,-r*.12,8,'#fff5c9');orb(c,side*r*.23,-r*.1,4,'#172038')}c.restore();
}
const oldPlant=plant;plant=e=>{if(e.boss)titanArt(e);else oldPlant(e)};
function planetBackdrop(){
 if(!stageIndex)return;const c=ctx,p=stage(),x=width*.77,y=height*.35,r=Math.min(width,height)*.245;
 c.save();c.globalAlpha=.78;
 const colors=['','#b9aaa0','#e4b575','#3b82d6','#c76548','#c8a58a','#d8c494','#9bd7e0','#426bd4'];
 if(stageIndex===6||stageIndex===7){c.save();c.translate(x,y);c.rotate(stageIndex===7?1.05:-.35);c.strokeStyle=stageIndex===6?'#d6bd83':'#9bc6d2';c.lineWidth=r*.2;c.beginPath();c.ellipse(0,0,r*1.55,r*.45,0,0,7);c.stroke();c.restore()}
 orb(c,x,y,r,colors[stageIndex]);c.save();c.beginPath();c.arc(x,y,r,0,7);c.clip();
 if(stageIndex===1||stageIndex===4){for(let i=0;i<17;i++){const a=i*2.399,rr=r*Math.sqrt((i+.5)/18),cx=x+Math.cos(a)*rr,cy=y+Math.sin(a)*rr;orb(c,cx,cy,r*(.03+(i%4)*.015),stageIndex===1?'#7a746f':'#94432e');c.strokeStyle='#ffffff33';c.stroke()}if(stageIndex===4){c.fillStyle='#efe5d7';c.beginPath();c.ellipse(x,y-r*.96,r*.32,r*.1,0,0,7);c.fill()}}
 if([2,5,6,7,8].includes(stageIndex)){for(let i=-5;i<=5;i++){c.strokeStyle=stageIndex===8?(i%2?'#7197e8':'#254ea4'):stageIndex===7?(i%2?'#c5f2ed':'#77b6c4'):(i%2?'#f4d7ad':'#b78660');c.lineWidth=r*(stageIndex===5?.12:.07);c.beginPath();c.ellipse(x,y+i*r*.19,r*1.1,r*.08,.04,0,7);c.stroke()}}
 if(stageIndex===3){c.fillStyle='#68aa72';const lands=[[-.48,-.38,.32,.18,-.4],[-.3,.16,.15,.35,-.3],[.22,-.3,.38,.19,.2],[.12,.07,.19,.29,-.2],[.57,.42,.16,.1,.2]];lands.forEach(([dx,dy,rx,ry,a])=>{c.beginPath();c.ellipse(x+dx*r,y+dy*r,rx*r,ry*r,a,0,7);c.fill()});c.strokeStyle='#e6f4ff99';c.lineWidth=r*.045;for(let i=0;i<3;i++){c.beginPath();c.ellipse(x-r*.2,y+(i-1)*r*.5,r*.85,r*.12,-.15,0,2.6);c.stroke()}orb(c,x,y-r*1.05,r*.2,'#ebf7ff')}
 if(stageIndex===5){c.fillStyle='#ab5b45';c.beginPath();c.ellipse(x+r*.35,y+r*.32,r*.22,r*.1,-.12,0,7);c.fill()}
 if(stageIndex===8){c.fillStyle='#193b89';c.beginPath();c.ellipse(x-r*.25,y-r*.1,r*.18,r*.075,0,0,7);c.fill()}
 const shade=c.createLinearGradient(x-r,y,x+r,y);shade.addColorStop(0,'#ffffff20');shade.addColorStop(.5,'#00000000');shade.addColorStop(1,'#020619cc');c.fillStyle=shade;c.fillRect(x-r,y-r,r*2,r*2);c.restore();c.strokeStyle=p.color+'99';c.lineWidth=2;c.beginPath();c.arc(x,y,r,0,7);c.stroke();c.restore();
}
const effectsDraw=draw;draw=()=>{effectsDraw();if(!player)return;
 if(titan)E('bossHud').firstChild.textContent=(titan.title||bossNames[stageIndex][titan.rank-1])+' · '+titan.rank+'/3 ';
 bells().forEach(b=>{orb(ctx,b.x,b.y,9,'#ffe69b');orb(ctx,b.x,b.y+3,3,'#aa724c')});
 if(player.upgradeLevels.drone){orb(ctx,player.x+30,player.y-30,8,'#9ff3ff');ctx.fillStyle='#152447';ctx.fillRect(player.x+30,player.y-32,3,3)}
 if(player.upgradeLevels.frost){ctx.beginPath();ctx.arc(player.x,player.y,180,0,7);ctx.strokeStyle='#9eeeff25';ctx.lineWidth=2;ctx.stroke()}
 if(novaFlash>0){ctx.beginPath();ctx.arc(player.x,player.y,130+(player.upgradeLevels.nova||0)*10,0,7);ctx.strokeStyle='#fbe1ff';ctx.globalAlpha=novaFlash*2;ctx.lineWidth=5;ctx.stroke();ctx.globalAlpha=1}
};
