"use strict";
const E=id=>document.getElementById(id), style=document.createElement("style");
style.textContent=`
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.pbtn{position:fixed;right:18px;bottom:18px;z-index:8}.screen{z-index:10}.mission{padding:12px;border:1px solid #53669e;border-radius:14px;background:#0b1028;color:#e7edff}.mission b,.token{color:#ffe36f}.bossbar{height:14px;margin:9px 0;border:2px solid #ffdc71;border-radius:10px;background:#241027;overflow:hidden}.bossfill{height:100%;background:linear-gradient(90deg,#ff4f8b,#ffe36f)}.toast2{position:fixed;z-index:30;left:50%;top:22%;transform:translate(-50%,-50%);padding:14px 22px;border:2px solid #fff0a0;border-radius:16px;background:#30205aee;color:#fff0a0;font-size:20px;font-weight:900;opacity:0;pointer-events:none}.toast2.show{animation:pop 1.6s ease both}@keyframes pop{15%,70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-90%) scale(.9)}}`;
document.head.append(style);
E("start").innerHTML='<div class="panel"><h1>Cosmic Destroyer Cat</h1><div class="mission"><b>MISSION</b> · Survive for 5 minutes, then defeat the Void Titan.<br>Collect shards, level up, and choose a new cosmic power each time.</div><p>Move: WASD / Arrow Keys · Warp Dash: SPACE · Auto Attack · Pause: ESC</p><div class="token">★ STAR TOKENS <span id="tokens">0</span></div><div class="row"><button id="go2">START MISSION</button><button id="soundBtn">SOUND ON</button></div></div>';
document.body.insertAdjacentHTML("beforeend",'<button id="pauseBtn" class="pbtn hidden">MENU</button><div id="pauseMenu" class="screen hidden"><div class="panel"><h1>PAUSED</h1><p>Your mission is safely paused.</p><div class="row"><button id="resumeBtn">RESUME</button><button id="restartBtn">RESTART</button><button id="lobbyBtn">LOBBY</button></div></div></div><div id="bossHud" class="fashion-status hidden" style="top:105px;width:min(420px,70vw)">VOID TITAN<div class="bossbar"><div id="bossFill" class="bossfill"></div></div></div><div id="toast2" class="toast2"></div>');
let meta={tokens:0,sound:true};try{Object.assign(meta,JSON.parse(localStorage.getItem("cosmicCatMeta3")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("cosmicCatMeta3",JSON.stringify(meta))}catch(e){}};
let ac;
function sound(f=440,d=.06,type="sine"){if(!meta.sound)return;try{ac??=new AudioContext();let o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.035,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+d);o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function toast(msg){let t=E("toast2");t.textContent=msg;t.classList.remove("show");void t.offsetWidth;t.classList.add("show")}
function toggle(){if(!running)return;paused=!paused;E("pauseMenu").classList.toggle("hidden",!paused);if(!paused){last=performance.now();sound(520)}}
function lobby(){running=false;paused=false;["pauseMenu","over","bossHud"].forEach(id=>E(id).classList.add("hidden"));E("pauseBtn").classList.add("hidden");E("start").classList.remove("hidden");E("tokens").textContent=meta.tokens;draw()}
E("go2").onclick=()=>{begin();E("pauseBtn").classList.remove("hidden")};
E("pauseBtn").onclick=toggle;E("resumeBtn").onclick=toggle;E("restartBtn").onclick=()=>{E("pauseMenu").classList.add("hidden");begin()};E("lobbyBtn").onclick=lobby;
E("soundBtn").onclick=()=>{meta.sound=!meta.sound;save();E("soundBtn").textContent=meta.sound?"SOUND ON":"SOUND OFF";sound(600)};
E("soundBtn").textContent=meta.sound?"SOUND ON":"SOUND OFF";
addEventListener("keydown",e=>{if(e.code==="Escape")toggle()});
const oldBegin=begin;begin=()=>{oldBegin();E("pauseBtn").classList.remove("hidden");E("bossHud").classList.add("hidden");sound(620,.12,"triangle")};
const oldGain=gain;gain=v=>{oldGain(v);sound(720,.035)};
const oldDefeat=defeatEnemy;defeatEnemy=(enemy,allow=true)=>{const wasBoss=enemy.boss&&!enemy.dead;if(!enemy.dead)sound(wasBoss?100:260,.04,"triangle");oldDefeat(enemy,allow);if(wasBoss)victory()};
let titan=null,missionWon=false;
function spawnTitan(){
  titan={x:width/2,y:-80,r:58,hp:4200,maxHp:4200,speed:31,damage:32,color:"#ff477d",value:60,kind:2,boss:true,dead:false};
  enemies.push(titan);E("bossHud").classList.remove("hidden");toast("⚠ VOID TITAN INBOUND");sound(90,.7,"sawtooth")
}
const baseAddEnemy=addEnemy;
addEnemy=()=>{
  if(elapsed>=300){if(!titan&&!missionWon)spawnTitan();return}
  const a=Math.random()*Math.PI*2,d=Math.max(width,height)*.7,w=Math.min(4,Math.floor(elapsed/60));
  const data=[
    {r:11,h:22,s:68,d:10,c:"#ff578a",v:1},
    {r:16,h:48,s:50,d:15,c:"#ffa148",v:2},
    {r:12,h:58,s:105,d:12,c:"#55efc4",v:3},
    {r:25,h:150,s:35,d:23,c:"#9867ff",v:6},
    {r:21,h:125,s:60,d:20,c:"#ff4fd8",v:5}
  ][Math.floor(Math.random()*(w+1))];
  enemies.push({x:player.x+Math.cos(a)*d,y:player.y+Math.sin(a)*d,r:data.r,hp:data.h*(1+elapsed/180),speed:data.s+elapsed*.1,damage:data.d,color:data.c,value:data.v,kind:Math.min(w,2),dead:false})
};
function victory(){
  if(missionWon)return;missionWon=true;running=false;score+=5000;best=Math.max(best,score);let reward=15+Math.floor(level/5);meta.tokens+=reward;save();
  E("pauseBtn").classList.add("hidden");E("bossHud").classList.add("hidden");E("result").innerHTML="<b>MISSION COMPLETE!</b><br>The Void Titan has been destroyed!<br>Survived 5 minutes · Level <b>"+level+"</b> · Score <b>"+score+"</b><br><span class='token'>★ +"+reward+" STAR TOKENS</span>";
  E("over").querySelector("h1").textContent="VICTORY";E("over").classList.remove("hidden");sound(880,.8,"triangle")
}
const baseUpdate=update;
update=dt=>{
  baseUpdate(dt);
  if(titan&&!titan.dead){
    E("bossFill").style.width=Math.max(0,titan.hp/titan.maxHp*100)+"%";
    if(titan.hp<=0){titan.dead=true;victory()}
  }
};
const baseReset=reset;reset=()=>{baseReset();titan=null;missionWon=false};
const baseEnd=endGame;endGame=()=>{
  if(missionWon)return;
  let reward=Math.max(2,Math.floor(score/800));meta.tokens+=reward;save();baseEnd();
  E("over").querySelector("h1").textContent="MISSION LOST";E("result").innerHTML+="<br><span class='token'>★ +"+reward+" STAR TOKENS</span>";E("pauseBtn").classList.add("hidden")
};
const baseDraw=draw;draw=()=>{
  baseDraw();
  if(running&&!paused){
    ctx.save();ctx.textAlign="center";ctx.font="900 14px system-ui";ctx.fillStyle="#ffe36f";ctx.shadowBlur=12;ctx.shadowColor="#ff7b45";
    const remain=Math.max(0,300-elapsed),m=Math.floor(remain/60),s=String(Math.floor(remain%60)).padStart(2,"0");
    ctx.fillText(titan?"FINAL BOSS":"TITAN "+m+":"+s,width/2,Math.min(height-90,155));ctx.restore()
  }
};
E("tokens").textContent=meta.tokens;




/* Lobby, hangar, responsive HUD, and movement safety */
Object.assign(meta,{
  owned:Array.isArray(meta.owned)?meta.owned:["blue","space","star"],
  skin:meta.skin||"blue",theme:meta.theme||"space",effect:meta.effect||"star"
});
const catalog=[
  {id:"blue",type:"skin",name:"Starlight Blue",cost:0,icon:"🐱"},
  {id:"gold",type:"skin",name:"Solar Gold",cost:12,icon:"😺"},
  {id:"void",type:"skin",name:"Void Royal",cost:22,icon:"🐈‍⬛"},
  {id:"tiger",type:"skin",name:"Nebula Tiger",cost:32,icon:"🐯"},
  {id:"space",type:"theme",name:"Deep Space",cost:0,icon:"🌌"},
  {id:"pink",type:"theme",name:"Pink Nebula",cost:18,icon:"💜"},
  {id:"aurora",type:"theme",name:"Aurora Deck",cost:28,icon:"🌈"},
  {id:"star",type:"effect",name:"Starlight Trail",cost:0,icon:"✨"},
  {id:"heart",type:"effect",name:"Heart Blaster",cost:15,icon:"💖"},
  {id:"prism",type:"effect",name:"Prism Power",cost:30,icon:"💫"}
];
style.textContent+=`
.lobby-room{position:relative;height:210px;margin:18px 0;border:2px solid #7784bb;border-radius:22px;background:radial-gradient(circle at 50% 35%,#354382,#111735);overflow:hidden;box-shadow:inset 0 0 40px #090d24}.lobby-cat{position:absolute;left:50%;bottom:35px;transform:translateX(-50%);font-size:72px;filter:drop-shadow(0 0 18px #76efff)}.lobby-stars{position:absolute;inset:0;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:29px 29px;opacity:.35}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.item{padding:14px;border:1px solid #6374aa;border-radius:14px;background:#101633}.item .icon{font-size:35px}.tabs{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}#shop{overflow-y:auto;padding:25px 0}#shop .panel{margin:auto}@media(max-width:600px){.grid{grid-template-columns:1fr}.fashion-status{top:105px!important}.help{bottom:8px;font-size:11px;padding:0 90px}.pbtn{bottom:12px}}`;
E("start").innerHTML='<div class="panel"><h1>Cosmic Destroyer Cat</h1><div class="token">★ STAR TOKENS <span id="tokens">0</span></div><div id="lobbyRoom" class="lobby-room"><div class="lobby-stars"></div><div id="lobbyCat" class="lobby-cat">🐱</div></div><div class="mission"><b>MISSION</b> · Survive for 5 minutes, then defeat the Void Titan.<br>Collect shards, level up, and build a different cosmic loadout every run.</div><p>Move: WASD / Arrow Keys · Warp Dash: SPACE · Auto Attack · Pause: ESC</p><div class="row"><button id="go2">START MISSION</button><button id="shopBtn">COSMIC SHOP</button><button id="soundBtn">SOUND ON</button></div></div>';
document.body.insertAdjacentHTML("beforeend",'<div id="shop" class="screen hidden"><div class="panel"><h1>COSMIC SHOP</h1><div class="token">★ STAR TOKENS <span id="shopTokens">0</span></div><p>Collect permanent cosmetics. Purchased items stay unlocked.</p><div class="tabs"><button data-tab="skin">CAT SKINS</button><button data-tab="theme">SHIP THEMES</button><button data-tab="effect">SHOT EFFECTS</button></div><div id="shopGrid" class="grid"></div><div class="row"><button id="shopBack">BACK TO LOBBY</button><button id="shopPlay">START MISSION</button></div></div></div>');
function renderLobby(){
  E("tokens").textContent=meta.tokens;
  const item=catalog.find(x=>x.id===meta.skin)||catalog[0];E("lobbyCat").textContent=item.icon;
  const colors={space:"radial-gradient(circle at 50% 35%,#354382,#111735)",pink:"radial-gradient(circle at 50% 35%,#803b78,#221334)",aurora:"radial-gradient(circle at 50% 35%,#2b8a79,#10253c)"};
  E("lobbyRoom").style.background=colors[meta.theme]||colors.space
}
function renderShop(type="skin"){
  E("shopTokens").textContent=meta.tokens;
  E("shopGrid").innerHTML=catalog.filter(x=>x.type===type).map(x=>{const owned=meta.owned.includes(x.id),active=meta[x.type]===x.id;return '<div class="item"><div class="icon">'+x.icon+'</div><b>'+x.name+'</b><p>'+(owned?(active?"EQUIPPED":"OWNED"):"★ "+x.cost)+'</p><button data-buy="'+x.id+'" '+(active?"disabled":"")+'>'+(active?"EQUIPPED":owned?"EQUIP":"BUY")+'</button></div>'}).join("");
  document.querySelectorAll("[data-buy]").forEach(button=>button.onclick=()=>{const item=catalog.find(x=>x.id===button.dataset.buy);if(!meta.owned.includes(item.id)){if(meta.tokens<item.cost){toast("NOT ENOUGH STAR TOKENS");return}meta.tokens-=item.cost;meta.owned.push(item.id)}meta[item.type]=item.id;save();renderShop(type);renderLobby();sound(760,.12,"triangle")})
}
document.querySelectorAll("[data-tab]").forEach(button=>button.onclick=()=>renderShop(button.dataset.tab));
E("shopBtn").onclick=()=>{E("start").classList.add("hidden");E("shop").classList.remove("hidden");E("shop").scrollTop=0;renderShop()};
E("shopBack").onclick=()=>{E("shop").classList.add("hidden");E("start").classList.remove("hidden");renderLobby()};
E("shopPlay").onclick=()=>{E("shop").classList.add("hidden");begin()};
E("go2").onclick=()=>begin();
E("soundBtn").onclick=()=>{meta.sound=!meta.sound;save();E("soundBtn").textContent=meta.sound?"SOUND ON":"SOUND OFF";if(meta.sound)sound(600)};
E("soundBtn").textContent=meta.sound?"SOUND ON":"SOUND OFF";
const safeDash=dash;dash=()=>{safeDash();if(player){player.x=Math.max(player.r,Math.min(width-player.r,player.x));player.y=Math.max(player.r,Math.min(height-player.r,player.y))}};
const englishHud=updateHud;updateHud=()=>{englishHud();if(!player)return;const stage=Math.min(20,Math.floor(level/5));E("fashionStatus").textContent=stage?"FASHION "+stage+" / 20 · "+fashionItems[stage-1]:"FASHION 0 / 20 · Next unlock: LV.5"};
const englishFashion=showFashionUnlock;showFashionUnlock=stage=>{englishFashion(stage);E("fashionDetail").textContent=stage===20?"LV.100 · COSMIC FASHION COMPLETE!":"LV."+(stage*5)+" · FASHION "+stage+" / 20"};
const lobbyBase=lobby;lobby=()=>{lobbyBase();E("shop").classList.add("hidden");renderLobby()};
E("lobbyBtn").onclick=lobby;

/* Game-over actions use the enhanced mission and lobby state. */
const oldRetryButton=E("retry"),retryButton=oldRetryButton.cloneNode(true);
oldRetryButton.replaceWith(retryButton);
retryButton.textContent="TRY AGAIN";
retryButton.onclick=()=>{E("upgrade").classList.add("hidden");E("shop").classList.add("hidden");begin()};
const gameOverLobby=document.createElement("button");
gameOverLobby.id="gameOverLobby";gameOverLobby.textContent="LOBBY";
retryButton.parentNode.insertBefore(gameOverLobby,retryButton.nextSibling);
gameOverLobby.style.marginLeft="10px";
gameOverLobby.onclick=()=>{E("upgrade").classList.add("hidden");lobby()};
renderLobby();


