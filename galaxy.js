"use strict";
// Solar expedition: shared data drives stage selection, encounters and artwork.
const planets=[
 {name:"Cosmic",color:"#8885ff",bg:"#191641",difficulty:1,titan:"Void Basilisk",shape:0},
 {name:"Mercury",color:"#c2aea0",bg:"#302723",difficulty:1.12,titan:"Crater Citron",shape:1},
 {name:"Venus",color:"#ffd27e",bg:"#39251c",difficulty:1.25,titan:"Sulfur Sage",shape:2},
 {name:"Earth",color:"#64e2ad",bg:"#10352e",difficulty:1.4,titan:"Gaia Grove",shape:3},
 {name:"Mars",color:"#ff866b",bg:"#3b1824",difficulty:1.58,titan:"Blood Orange",shape:4},
 {name:"Jupiter",color:"#eebc8d",bg:"#32253b",difficulty:1.78,titan:"Storm Pomelo",shape:5},
 {name:"Saturn",color:"#ffe7a2",bg:"#302b40",difficulty:2,titan:"Ring Rosemary",shape:6},
 {name:"Uranus",color:"#93efff",bg:"#15323e",difficulty:2.25,titan:"Frost Mint",shape:7},
 {name:"Neptune",color:"#769eff",bg:"#131e4a",difficulty:2.55,titan:"Abyss Thyme",shape:8}
];
const cats=[
 {id:"blue",name:"Starlight",color:"#76efff",mark:0,cost:0},
 {id:"gold",name:"Solar King",color:"#ffcf65",mark:1,cost:12},
 {id:"void",name:"Midnight",color:"#9d87dc",mark:2,cost:22},
 {id:"tiger",name:"Comet Tiger",color:"#ffa66e",mark:3,cost:32},
 {id:"calico",name:"Calico Captain",color:"#fff0d4",mark:4,cost:18},
 {id:"mint",name:"Mint Scout",color:"#8bf1bd",mark:5,cost:25},
 {id:"rose",name:"Rose Pilot",color:"#ffafd5",mark:6,cost:30},
 {id:"snow",name:"Snow Astronaut",color:"#eef6ff",mark:7,cost:38},
 {id:"pirate",name:"Captain Whisker",color:"#bdc4de",mark:8,cost:45},
 {id:"alien",name:"Orbit Visitor",color:"#bdff78",mark:9,cost:55}
];
let stageIndex=0,titansDefeated=0,hazards=[],attackClock=0,burstClock=0,runPaid=false,particles=[];
meta.clears=Array.isArray(meta.clears)?meta.clears:[];
meta.tokens=Number.isFinite(meta.tokens)?Math.max(0,Math.floor(meta.tokens)):0;
const stage=()=>planets[stageIndex];
style.textContent+=`
 .panel{max-height:94dvh;overflow:auto;padding:24px}h1{font-size:clamp(30px,6vw,54px)}
 .stage-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:14px 0}.stage-grid button{font-size:13px;padding:9px}.stage-grid small{display:block;color:#bdc9e7;margin-top:3px}.stage-grid .selected{background:#394776;border-color:#8df5ff;box-shadow:0 0 12px #76efff44}
 .lobby-room{height:100px;margin:12px 0}.lobby-cat{bottom:5px}.preview{width:84px;height:84px;display:block;margin:auto}.hud{font-size:13px}.mission{font-size:13px}.help{font-size:12px}.fashion-status{top:78px;font-size:11px}#bossHud{top:112px!important}button:focus-visible{outline:3px solid #fff29a;outline-offset:3px}button:disabled{opacity:.55;cursor:default}#touch{position:fixed;bottom:50px;left:18px;z-index:9;display:none;gap:5px;grid-template-columns:repeat(3,44px)}#touch button{padding:12px;touch-action:none;background:#26304bcc}#dashTouch{position:fixed;right:16px;bottom:78px;z-index:9;touch-action:none;display:none}@media(pointer:coarse){#touch{display:grid}#dashTouch{display:block}.help{display:none}}@media(max-width:600px){.grid{grid-template-columns:repeat(2,1fr)}.panel{padding:16px}.xp-panel{top:50px}.fashion-status{top:82px!important}.lobby-room{height:80px}}
`;
E("start").querySelector("h1").textContent="Cosmic Destroyer Cat 2";
E("start").querySelector(".mission").innerHTML='<b>THE SOLAR EXPEDITION</b><br>Collect fish to level up. Auto-fire targets the closest enemy.<br>Defeat three Titans arriving at 5:00, 10:00 and 15:00 to win.<br>Fish give XP and score; Star Tokens buy permanent cosmetics.';
E("lobbyCat").innerHTML='<canvas id="catPreview" class="preview" width="100" height="100"></canvas>';
E("lobbyRoom").insertAdjacentHTML("afterend",'<div id="stageGrid" class="stage-grid"></div><div id="stageInfo" class="mission"></div>');
document.querySelector(".help").textContent="WASD / Arrows: move · SPACE: dash · ESC: pause · Auto-fire";
document.querySelector(".hud").firstElementChild.innerHTML='HP <span id="hp"></span>';
document.querySelector(".hud").lastElementChild.innerHTML='Score <span id="score">0</span> · Best <span id="best">0</span><br>Level <span id="level">1</span> · <span id="time">0:00</span>';
document.body.insertAdjacentHTML("beforeend",'<div id="touch"><span></span><button data-key="ArrowUp" aria-label="Move up">▲</button><span></span><button data-key="ArrowLeft" aria-label="Move left">◀</button><button data-key="ArrowDown" aria-label="Move down">▼</button><button data-key="ArrowRight" aria-label="Move right">▶</button></div><button id="dashTouch">DASH</button>');
document.querySelectorAll("[data-key]").forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys[b.dataset.key]=false});
E("dashTouch").onpointerdown=e=>{e.preventDefault();dash()};
addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)&&running)e.preventDefault()});
addEventListener("blur",()=>{Object.keys(keys).forEach(k=>keys[k]=false);if(running&&!paused)toggle()});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running&&!paused)toggle()});
function catArt(c,x,y,size,cat){
 c.save();c.translate(x,y);c.scale(size/16,size/16);c.lineWidth=1.5;c.strokeStyle="#1b2442";c.fillStyle=cat.color;
 c.beginPath();c.moveTo(-12,-4);c.lineTo(-11,-18);c.lineTo(-3,-11);c.quadraticCurveTo(0,-13,4,-11);c.lineTo(12,-18);c.lineTo(12,-3);c.bezierCurveTo(20,17,-20,17,-12,-4);c.fill();c.stroke();
 c.fillStyle="#ff94ba";c.beginPath();c.moveTo(-9,-13);c.lineTo(-8,-6);c.lineTo(-4,-9);c.fill();c.beginPath();c.moveTo(9,-13);c.lineTo(8,-6);c.lineTo(5,-9);c.fill();
 c.fillStyle=cat.mark===2?"#ffe588":"#172345";
 c.fillRect(-7,-2,3,5);c.fillRect(4,-2,3,5);c.fillStyle="#ee719c";c.fillRect(-2,4,4,3);
 c.strokeStyle="#e7f8ff";c.beginPath();for(const s of [-1,1]){c.moveTo(s*8,5);c.lineTo(s*18,2);c.moveTo(s*8,7);c.lineTo(s*18,9)}c.stroke();
 c.fillStyle="#263152";
 if(cat.mark===1){c.fillStyle="#fff090";c.beginPath();c.moveTo(-9,-15);c.lineTo(-10,-24);c.lineTo(-4,-20);c.lineTo(0,-27);c.lineTo(4,-20);c.lineTo(10,-24);c.lineTo(9,-15);c.fill()}
 if(cat.mark===3){for(let i=-1;i<=1;i++)c.fillRect(i*6-1,-10,2,6)}
 if(cat.mark===4){c.fillStyle="#c78346";c.beginPath();c.ellipse(-7,-5,5,5,0,0,7);c.fill()}
 if(cat.mark===5||cat.mark===6){c.fillStyle=cat.mark===5?"#2b9472":"#e64e9c";c.beginPath();c.moveTo(-10,10);c.lineTo(0,14);c.lineTo(10,10);c.lineTo(9,17);c.lineTo(0,14);c.lineTo(-9,17);c.fill()}
 if(cat.mark===7){c.strokeStyle="#b5f5ff";c.beginPath();c.arc(0,-2,22,0,7);c.stroke()}
 if(cat.mark===8){c.fillRect(2,-4,8,7);c.beginPath();c.moveTo(-12,-9);c.lineTo(12,6);c.strokeStyle="#263152";c.stroke()}
 if(cat.mark===9){c.strokeStyle=cat.color;c.beginPath();c.moveTo(0,-11);c.lineTo(0,-24);c.stroke();c.beginPath();c.arc(0,-25,3,0,7);c.fillStyle="#ff7fcf";c.fill()}
 c.restore();
}
renderLobby=()=>{
 E("tokens").textContent=meta.tokens;
 const preview=E("catPreview");preview.getContext("2d").clearRect(0,0,100,100);catArt(preview.getContext("2d"),50,55,27,cats.find(c=>c.id===meta.skin)||cats[0]);
 E("lobbyRoom").style.background=`radial-gradient(circle,${meta.theme==='pink'?'#713c70':meta.theme==='aurora'?'#237868':stage().bg},#0b1024)`;
 E("stageGrid").innerHTML=planets.map((p,i)=>`<button data-stage="${i}" class="${i===stageIndex?'selected':''}" aria-pressed="${i===stageIndex}">${p.name}${meta.clears.includes(i)?' ✓':''}<small>Difficulty ${i+1}/9</small></button>`).join("");
 document.querySelectorAll("[data-stage]").forEach(b=>b.onclick=()=>{stageIndex=Number(b.dataset.stage);renderLobby();sound(400+stageIndex*40)});
 E("stageInfo").textContent=`${stage().titan} · Enemy strength ×${stage().difficulty} · Three increasingly powerful forms`;
};
cats.forEach(c=>{const old=catalog.find(x=>x.id===c.id);if(old)Object.assign(old,{name:c.name,cost:c.cost});else catalog.push({...c,type:"skin",icon:""})});
const previousShop=renderShop;
renderShop=(type="skin")=>{previousShop(type);if(type==="skin")document.querySelectorAll("#shopGrid .item").forEach((item,i)=>{const c=cats.find(c=>c.id===catalog.filter(x=>x.type==="skin")[i].id);item.querySelector(".icon").innerHTML='<canvas class="preview" width="100" height="100"></canvas>';catArt(item.querySelector("canvas").getContext("2d"),50,55,27,c)})};
function rebalance(){
 const u=player.upgradeLevels;
 player.count=1+u.blasters;player.damage=18*(1+.24*u.meteor)*(1+.20*u.blasters)/player.count;
 player.rate=.5/(1+.22*u.rapid);player.regenInterval=10/(1+1.8*u.healing);
 player.shieldLevel=u.butler;player.shieldRadius=u.butler?65+u.butler*9:0;player.shieldDamage=18*u.butler;
}
const descriptions={blasters:"Add a spread shot; total volley damage +20% of base (shared between shots).",meteor:"Volley damage +24% of base. No exponential stacking.",rapid:"Fire rate +22% of base.",healing:"Heal 30 HP, gain 12 max HP and regenerate faster.",butler:"Aura gains 18 damage/sec and 9 range; first rank unlocks the aura."};
upgrades.forEach(u=>{u.text=descriptions[u.id];u.apply=()=>{if(u.id==="healing"){player.maxHp+=12;player.hp=Math.min(player.maxHp,player.hp+30)}}});
showUpgrade=()=>{
 if(!running)return;paused=true;E("pauseMenu").classList.add("hidden");const choices=upgrades.filter(u=>player.upgradeLevels[u.id]<8).sort(()=>Math.random()-.5).slice(0,3);
 if(!choices.length){player.hp=Math.min(player.maxHp,player.hp+20);paused=false;return}
 E("cards").innerHTML="";choices.forEach(u=>{const b=document.createElement("button");b.className="card";b.innerHTML=`<b>${u.name}</b><small>Rank ${player.upgradeLevels[u.id]+1} / 8</small>${u.text}`;b.onclick=()=>{u.apply();player.upgradeLevels[u.id]++;rebalance();E("upgrade").classList.add("hidden");paused=false;last=performance.now();sound(960,.16,"triangle");updateHud()};E("cards").append(b)});E("upgrade").classList.remove("hidden");sound(800,.15);
};
gain=v=>{xp+=v;score+=v*10;sound(680,.025);updateHud()};
const balancedReset=reset;reset=()=>{balancedReset();titansDefeated=0;hazards=[];particles=[];attackClock=4;burstClock=0;runPaid=false;rebalance();E("upgrade").classList.add("hidden");E("pauseMenu").classList.add("hidden")};
toggle=()=>{if(!running||!E("upgrade").classList.contains("hidden"))return;paused=!paused;E("pauseMenu").classList.toggle("hidden",!paused);last=performance.now()};
E("pauseBtn").onclick=E("resumeBtn").onclick=toggle;
const dashWithSound=dash;dash=()=>{if(running&&!paused&&player.dash<=0)sound(180,.13,"triangle");dashWithSound()};
const solarFire=fire;fire=()=>{solarFire();if(enemies.length&&elapsed-burstClock>.12){sound(340,.025,"triangle");burstClock=elapsed}};
addEnemy=()=>{
 if(enemies.length>110)return;
 const kind=Math.floor(Math.random()*Math.min(5,2+Math.floor(elapsed/90))),angle=Math.random()*Math.PI*2,d=Math.max(width,height)*.6;
 const growth=(1+elapsed/420)*stage().difficulty;
 enemies.push({x:player.x+Math.cos(angle)*d,y:player.y+Math.sin(angle)*d,r:[13,16,12,22,18][kind],hp:[28,45,24,105,65][kind]*growth,speed:[57,43,92,30,62][kind]*(1+stageIndex*.045)+Math.min(35,elapsed*.025),damage:[10,14,9,20,15][kind]*(1+stageIndex*.07),kind:kind%3,art:kind,value:[2,3,2,7,4][kind],dead:false});
};
spawnTitan=()=>{
 const rank=titansDefeated+1,hp=(2300+rank*1600)*stage().difficulty;
 titan={x:width/2,y:-85,r:48+rank*9,hp,maxHp:hp,speed:23+rank*5+stageIndex,damage:25+rank*5,kind:2,art:stage().shape,value:60,boss:true,dead:false,rank};
 enemies.push(titan);attackClock=3;E("bossHud").classList.remove("hidden");toast(`${stage().titan.toUpperCase()} · FORM ${rank}/3`);sound(85,.7,"sawtooth");
};
function finish(win){
 if(runPaid)return;runPaid=true;missionWon=win;running=false;paused=false;score+=win?5000*(stageIndex+1):0;best=Math.max(best,score);
 const reward=Math.floor(elapsed/60)+titansDefeated*8+(win?25+stageIndex*5:0);meta.tokens+=reward;if(win&&!meta.clears.includes(stageIndex))meta.clears.push(stageIndex);save();try{localStorage.setItem("starBest",best)}catch(e){}
 ["upgrade","pauseMenu","bossHud","pauseBtn"].forEach(id=>E(id).classList.add("hidden"));E("over").querySelector("h1").textContent=win?"STAGE COMPLETE":"MISSION LOST";
 E("result").innerHTML=`${stage().name} · ${titansDefeated}/3 Titans defeated<br>Time ${Math.floor(elapsed/60)}:${String(Math.floor(elapsed%60)).padStart(2,'0')} · Level ${level}<br>Score ${score} · Best ${best}<br><span class="token">★ +${reward} Star Tokens</span><br><small>Earn 1 token per minute, 8 per Titan, plus a stage victory bonus.</small>`;E("over").classList.remove("hidden");sound(win?880:140,.6,"triangle");
}
victory=()=>finish(true);endGame=()=>finish(false);
defeatEnemy=(enemy,allow=true)=>{
 if(enemy.dead||!running)return;enemy.dead=true;for(let i=0;i<8;i++)particles.push({x:enemy.x,y:enemy.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,life:.5,color:stage().color});
 if(enemy.boss){titansDefeated++;hazards=[];titan=null;E("bossHud").classList.add("hidden");player.hp=Math.min(player.maxHp,player.hp+40);if(titansDefeated===3){victory();return}toast(`TITAN ${titansDefeated}/3 DEFEATED · +40 HP`);sound(650,.3,"triangle")}
 gems.push({x:enemy.x,y:enemy.y,value:enemy.value,kind:enemy.kind,type:"shard"});
 if(allow&&!enemy.boss&&Math.random()<.025)gems.push({x:enemy.x+10,y:enemy.y,type:"churu",kind:0,value:0});
};
churuBlast=()=>{enemies.forEach(e=>{if(e.x<0||e.x>width||e.y<0||e.y>height)return;if(e.boss){e.hp-=e.maxHp*.06;if(e.hp<=0)defeatEnemy(e,false)}else defeatEnemy(e,false)});sound(160,.3,"sawtooth");toast("CHURU BURST · Titans take 6% damage")};
// Use the original simulation once; the earlier single-Titan wrapper is superseded.
update=dt=>{
 const hpBefore=player.hp;baseUpdate(dt);if(player.hp<hpBefore)sound(110,.1,"triangle");if(!running)return;
 if(!titan&&elapsed>=(titansDefeated+1)*300)spawnTitan();
 if(titan&&!titan.dead){
  attackClock-=dt;if(attackClock<=0){attackClock=Math.max(1.5,4-titan.rank*.4-stageIndex*.12);const count=6+titan.rank*2+stageIndex,offset=elapsed*.3;
   for(let i=0;i<count;i++){const a=offset+i*Math.PI*2/count;hazards.push({x:titan.x,y:titan.y,vx:Math.cos(a)*(75+stageIndex*8),vy:Math.sin(a)*(75+stageIndex*8),r:6,life:9,delay:.65})}
   if(stageIndex%3===1)hazards.push({x:player.x,y:player.y,r:40+5*titan.rank,life:1.5,delay:1,vx:0,vy:0,zone:true});
   if(stageIndex%3===2){const a=Math.atan2(player.y-titan.y,player.x-titan.x);for(let j=-1;j<=1;j++)hazards.push({x:titan.x,y:titan.y,vx:Math.cos(a+j*.2)*160,vy:Math.sin(a+j*.2)*160,r:8,life:7,delay:.8})}
  }
  E("bossHud").firstChild.textContent=`${stage().titan} · ${titan.rank}/3 `;E("bossFill").style.width=Math.max(0,titan.hp/titan.maxHp*100)+"%";
 }
 hazards.forEach(h=>{h.delay-=dt;h.life-=dt;if(h.delay>0)return;h.x+=h.vx*dt;h.y+=h.vy*dt;if(player.invincible<=0&&Math.hypot(h.x-player.x,h.y-player.y)<h.r+player.r){player.hp-=18+stageIndex*2;player.invincible=.8;sound(110,.1,"triangle");if(player.hp<=0)endGame()}});hazards=hazards.filter(h=>h.life>0&&h.x>-100&&h.x<width+100&&h.y>-100&&h.y<height+100);
 particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt});particles=particles.filter(p=>p.life>0).slice(-160);
 if(gems.length>350){const excess=gems.splice(0,gems.length-300);const value=excess.reduce((n,g)=>n+(g.value||0),0);gems.push({x:width/2,y:height/2,value,kind:2,type:"shard"})}
 if(running&&xp>=xpNeed){xp-=xpNeed;level++;xpNeed=Math.min(160,Math.ceil(xpNeed*1.15));if(level%5===0&&level<=100)showFashionUnlock(level/5);showUpgrade()}
 updateHud();
};
const solarHud=updateHud;updateHud=()=>{solarHud();if(!player)return;const next=Math.max(0,(titansDefeated+1)*300-elapsed);E("fashionStatus").textContent=`${stage().name} · Titans ${titansDefeated}/3 · ${titan?'TITAN ACTIVE':'Next '+Math.floor(next/60)+':'+String(Math.floor(next%60)).padStart(2,'0')} · Dash ${player.dash>0?player.dash.toFixed(1)+'s':'READY'}`};
function orb(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()}
function plant(e){
 ctx.save();ctx.translate(e.x,e.y);const r=e.r;
 if(e.boss){ctx.rotate(Math.sin(elapsed)*.08);ctx.strokeStyle=stage().color;ctx.lineWidth=3;for(let i=0;i<5+e.art;i++){const a=i*Math.PI*2/(5+e.art)+elapsed*.15;ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.9,Math.sin(a)*r*.9,r*.5,r*.16,a,0,7);ctx.stroke()}if(e.art===6){ctx.beginPath();ctx.ellipse(0,0,r*1.65,r*.5,-.4,0,7);ctx.stroke()}}
 if(!e.boss&&e.art>=2){ctx.strokeStyle="#397f57";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,r);ctx.lineTo(0,-r);ctx.stroke();for(let i=0;i<4;i++){ctx.fillStyle=["#89d992","#6dddb7","#b6d980"][e.art%3];ctx.beginPath();ctx.ellipse((i%2?1:-1)*r*.35,-r*.65+i*r*.4,r*.6,r*.27,i%2?-.5:.5,0,7);ctx.fill()}}
 else{orb(ctx,0,0,r,e.boss?stage().color:e.art===0?"#ffac48":"#e4ed67");orb(ctx,0,0,r*.82,e.boss?stage().bg:"#ffe8aa");ctx.strokeStyle=e.boss?stage().color:"#f4a13e";ctx.lineWidth=e.boss?4:2;for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.74,Math.sin(a)*r*.74);ctx.stroke()}ctx.fillStyle="#70d58c";ctx.beginPath();ctx.ellipse(r*.3,-r,r*.4,r*.15,-.4,0,7);ctx.fill()}
 orb(ctx,-r*.3,-2,e.boss?6:2,"#fff");orb(ctx,r*.3,-2,e.boss?6:2,"#fff");orb(ctx,-r*.3,0,e.boss?3:1,"#182137");orb(ctx,r*.3,0,e.boss?3:1,"#182137");ctx.restore();
}
draw=()=>{
 const bg=ctx.createRadialGradient(width*.5,height*.4,0,width*.5,height*.4,Math.max(width,height));bg.addColorStop(0,stage().bg);bg.addColorStop(1,"#060917");ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
 ctx.save();ctx.globalAlpha=.15;const px=width*.8,py=height*.3,pr=Math.min(width,height)*.28;orb(ctx,px,py,pr,stage().color);ctx.strokeStyle=stage().color;ctx.lineWidth=3;
 if(stageIndex===6||stageIndex===7){for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(px,py,pr*(1.3+i*.07),pr*.32,stageIndex===7?1.2:-.4,0,7);ctx.stroke()}}
 if([2,5,8].includes(stageIndex)){ctx.save();ctx.beginPath();ctx.arc(px,py,pr,0,7);ctx.clip();for(let i=-3;i<=3;i++){ctx.fillStyle=i%2?"#211f42":"#e3bfa2";ctx.fillRect(px-pr,py+i*pr*.25,pr*2,pr*.1)}ctx.restore()}
 if([1,4].includes(stageIndex)){for(let i=0;i<7;i++)orb(ctx,px+Math.sin(i*5)*pr*.6,py+Math.cos(i*3)*pr*.6,pr*(.08+i*.009),"#413344")}
 if(stageIndex===3){for(let i=0;i<6;i++){ctx.fillStyle="#6dbfa2";ctx.beginPath();ctx.ellipse(px+Math.sin(i*4)*pr*.5,py+Math.cos(i*3)*pr*.6,pr*.28,pr*.15,i,0,7);ctx.fill()}}ctx.restore();
 stars.forEach(s=>{ctx.fillStyle="#c7d9ef";ctx.fillRect(s.x*width,(s.y*height+elapsed*3)%height,s.r,s.r)});if(!player)return;
 gems.forEach(g=>{ctx.save();ctx.translate(g.x,g.y);if(g.type==="churu"){ctx.fillStyle="#ff8cc7";ctx.fillRect(-5,-12,10,24);ctx.fillStyle="#fff1d6";ctx.fillRect(-6,-12,12,4)}else{const n=5+(g.kind||0)*2;ctx.fillStyle=["#78e8ff","#ffe393","#d3afff"][g.kind||0];ctx.beginPath();ctx.ellipse(0,0,n*1.3,n*.7,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(-n,0);ctx.lineTo(-n*2,-n*.7);ctx.lineTo(-n*2,n*.7);ctx.fill();orb(ctx,n*.65,-1,1,"#172342")}ctx.restore()});
 bullets.forEach(b=>{orb(ctx,b.x,b.y,b.r,meta.effect==='heart'?"#ff9acb":meta.effect==='prism'?`hsl(${elapsed*100%360} 90% 80%)`:"#e1ffff")});
 enemies.filter(e=>!e.dead).forEach(plant);
 hazards.forEach(h=>{ctx.save();ctx.globalAlpha=h.delay>0?.3:.85;orb(ctx,h.x,h.y,h.r,h.delay>0?"#ffe8a3":"#ff7395");ctx.strokeStyle="#fff0cb";ctx.lineWidth=2;ctx.stroke();ctx.restore()});
 particles.forEach(p=>{ctx.globalAlpha=p.life*2;orb(ctx,p.x,p.y,3,p.color)});ctx.globalAlpha=1;
 if(player.shieldLevel){ctx.beginPath();ctx.arc(player.x,player.y,player.shieldRadius,0,7);ctx.strokeStyle="#8cffe17a";ctx.lineWidth=2;ctx.stroke()}
 ctx.save();ctx.globalAlpha=player.invincible>0?.55:1;catArt(ctx,player.x,player.y,16,cats.find(c=>c.id===meta.skin)||cats[0]);ctx.restore();
 ctx.save();ctx.translate(player.x,player.y);drawCatAccessories(Math.min(20,Math.floor(level/5)));ctx.restore();ctx.fillStyle="#291f3e";ctx.fillRect(player.x-24,player.y+25,48,5);ctx.fillStyle="#89f6b1";ctx.fillRect(player.x-24,player.y+25,48*Math.max(0,player.hp/player.maxHp),5);
};
E("shop").querySelector("p").textContent="Spend Star Tokens to buy and equip 10 cats, ship themes and shot colors. Cats are cosmetic: every character has equal stats.";
renderLobby();draw();
