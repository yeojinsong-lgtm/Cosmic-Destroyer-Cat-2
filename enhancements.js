"use strict";
const E=id=>document.getElementById(id), style=document.createElement("style");
style.textContent=`
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.pbtn{position:fixed;right:18px;bottom:18px;z-index:8}.screen{z-index:10}.mission{padding:12px;border:1px solid #53669e;border-radius:14px;background:#0b1028;color:#e7edff}.mission b,.token{color:#ffe36f}.bossbar{height:14px;margin:9px 0;border:2px solid #ffdc71;border-radius:10px;background:#241027;overflow:hidden}.bossfill{height:100%;background:linear-gradient(90deg,#ff4f8b,#ffe36f)}.toast2{position:fixed;z-index:30;left:50%;top:22%;transform:translate(-50%,-50%);padding:14px 22px;border:2px solid #fff0a0;border-radius:16px;background:#30205aee;color:#fff0a0;font-size:20px;font-weight:900;opacity:0;pointer-events:none}.toast2.show{animation:pop 1.6s ease both}@keyframes pop{15%,70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-90%) scale(.9)}}`;
document.head.append(style);
E("start").innerHTML='<div class="panel"><h1>Cosmic Destroyer Cat</h1><div class="mission"><b>MISSION</b> · 5분간 생존한 뒤 보이드 타이탄을 처치하세요.<br>파편을 모아 레벨업하고 매번 새로운 우주 파워를 선택하세요.</div><p>이동: WASD / 방향키 · 워프 대시: SPACE · 자동 공격 · ESC: 일시정지</p><div class="token">★ STAR TOKENS <span id="tokens">0</span></div><div class="row"><button id="go2">미션 시작</button><button id="soundBtn">SOUND ON</button></div></div>';
document.body.insertAdjacentHTML("beforeend",'<button id="pauseBtn" class="pbtn hidden">MENU</button><div id="pauseMenu" class="screen hidden"><div class="panel"><h1>PAUSED</h1><p>전투가 안전하게 정지되었습니다.</p><div class="row"><button id="resumeBtn">계속하기</button><button id="restartBtn">다시 시작</button><button id="lobbyBtn">로비로</button></div></div></div><div id="bossHud" class="fashion-status hidden" style="top:105px;width:min(420px,70vw)">VOID TITAN<div class="bossbar"><div id="bossFill" class="bossfill"></div></div></div><div id="toast2" class="toast2"></div>');
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
  E("pauseBtn").classList.add("hidden");E("bossHud").classList.add("hidden");E("result").innerHTML="<b>MISSION COMPLETE!</b><br>보이드 타이탄을 격파했습니다.<br>생존 5분 · 레벨 <b>"+level+"</b> · 점수 <b>"+score+"</b><br><span class='token'>★ +"+reward+" STAR TOKENS</span>";
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
    ctx.fillText(titan?"FINAL BOSS":"TITAN ARRIVAL "+m+":"+s,width/2,125);ctx.restore()
  }
};
E("tokens").textContent=meta.tokens;


