// Simple helper
async function api(url, method="GET", body=null){
  const opt={method};
  if(body instanceof FormData){ opt.body=body; }
  else if(body){ opt.headers={"Content-Type":"application/json"}; opt.body=JSON.stringify(body); }
  const r=await fetch(url,opt); return r.json();
}
const username=(new URL(location.href)).searchParams.get("username")||localStorage.getItem("cp_username")||"Гость";
document.getElementById("u-name").textContent=username;
document.getElementById("u-gender").textContent=(localStorage.getItem("cp_gender")||"other")==="male"?"♂":((localStorage.getItem("cp_gender")||"other")==="female"?"♀":"⚧");

// ---- SCALE / FONT ----
const SCALE_SCENE = 2.4;
const SCALE_PREVIEW = 3.0;
const NAME_BASE_PX = 12;
const NAME_SCENE_PX = Math.round(NAME_BASE_PX * SCALE_SCENE) + 10;
const NAME_PREVIEW_PX = Math.round(NAME_BASE_PX * SCALE_PREVIEW) + 10;

// Coins
async function refreshMe(){
  const me=await api("/api/me?username="+encodeURIComponent(username));
  document.querySelectorAll("#coins").forEach(el=>el.textContent=me.coins);
}
let incomeTimerId=null, incomeSyncId=null, leftSec=300;
function renderIncomeTimer(){
  const el=document.getElementById("income-timer"); if(!el) return;
  const value=Math.max(0, Math.floor(leftSec));
  const m=String(Math.floor(value/60)).padStart(2,'0');
  const s=String(value%60).padStart(2,'0');
  el.textContent=`⏳ ${m}:${s}`;
}
async function syncIncomeLeft(){
  try{
    const j=await api("/api/income_left?username="+encodeURIComponent(username));
    if(typeof j.left==="number") leftSec = j.left;
    if(j.granted) await refreshMe();
  }catch(e){ /* ignore */ }
  renderIncomeTimer();
}
async function initIncomeTimer(){
  await syncIncomeLeft();
  if(incomeTimerId) clearInterval(incomeTimerId);
  incomeTimerId=setInterval(()=>{
    if(leftSec>0){
      leftSec--; renderIncomeTimer();
    }else{
      syncIncomeLeft();
    }
  },1000);
  if(incomeSyncId) clearInterval(incomeSyncId);
  incomeSyncId=setInterval(syncIncomeLeft,15000);
}

// Online overlay
async function loadOnline(){
  const d=await api("/api/online");
  const box=document.getElementById("online-overlay"); box.innerHTML="<b>Онлайн</b>";
  d.users.forEach(n=>{
    const el=document.createElement("div"); el.className="user";
    el.innerHTML=`<span class="dot"></span><span>${n}</span>`; box.appendChild(el);
  });
}
setInterval(loadOnline, 2000);

// Modals
const charModal=document.getElementById("char-modal");
const shopModal=document.getElementById("shop-modal");
document.getElementById("btn-character").addEventListener("click", async ()=>{ 
  charModal.hidden=false; drawCharPreview(); await initIncomeTimer(); 
});
document.getElementById("btn-shop").addEventListener("click", ()=>{ shopModal.hidden=false; loadShop(); });
document.getElementById("char-close").addEventListener("click", ()=>{ charModal.hidden=true; });
document.getElementById("shop-close").addEventListener("click", ()=>{ shopModal.hidden=true; });
[charModal,shopModal].forEach(m=>m.addEventListener("click",(e)=>{ if(e.target===m) m.hidden=true; }));

// Shop
async function loadShop(){
  const data=await api("/api/shop");
  const box=document.getElementById("shop"); box.innerHTML="";
  data.items.forEach(it=>{
    const d=document.createElement("div"); d.className="item"; d.innerHTML=`<b>${it.name}</b><br><small>${it.type}</small><br>${it.price} монет`;
    d.addEventListener("click", async ()=>{
      const f=new FormData(); f.append("item_id",it.id); f.append("username",username);
      const r=await fetch("/api/buy",{method:"POST",body:f}); const j=await r.json();
      if(!j.ok) return alert(j.error||"Ошибка");
      await refreshMe(); await loadInventory(); await refreshAvatar();
    });
    box.appendChild(d);
  });
}

// Inventory & equipped
let _inv=[];
async function loadInventory(){
  _inv=await api("/api/inventory?username="+encodeURIComponent(username));
  const box=document.getElementById("inventory"); box.innerHTML="";
  _inv.forEach(it=>{
    const d=document.createElement("div"); d.className="item"+(it.equipped?" equipped":"");
    d.textContent=`${it.name} (${it.type})`;
    d.addEventListener("click", async ()=>{
      const f=new FormData(); f.append("item_id",it.id); f.append("username",username);
      await fetch("/api/toggle_equip",{method:"POST",body:f});
      await refreshAvatar(); await loadInventory();
    });
    box.appendChild(d);
  });
  renderSlots(); renderEquipped();
}
function renderSlots(){
  const dict={}; _inv.forEach(i=>{ if(i.equipped) dict[i.type]=i.name; });
  document.querySelectorAll(".slot").forEach(s=>{
    const t=s.dataset.slot; s.textContent=dict[t]||s.getAttribute("data-label")||s.textContent;
    s.classList.toggle("active", !!dict[t]);
  });
}
document.addEventListener("click", async (e)=>{
  const s=e.target.closest(".slot"); if(!s) return;
  const t=s.dataset.slot; const it=_inv.find(i=>i.type===t && i.equipped); if(!it) return;
  const f=new FormData(); f.append("item_id", it.id); f.append("username", username);
  await fetch("/api/toggle_equip",{method:"POST", body:f});
  await refreshAvatar(); await loadInventory();
});
function renderEquipped(){
  const box=document.getElementById("equipped-list"); box.innerHTML="<h4>Надето</h4>";
  _inv.filter(i=>i.equipped).forEach(i=>{
    const pill=document.createElement("div"); pill.className="equip-pill"; pill.textContent=i.name+" ("+i.type+") — снять";
    pill.addEventListener("click", async ()=>{
      const f=new FormData(); f.append("item_id",i.id); f.append("username",username);
      await fetch("/api/toggle_equip",{method:"POST",body:f});
      await refreshAvatar(); await loadInventory();
    });
    box.appendChild(pill);
  });
}

// ---- Appearance (colors + hairstyle) ----
let myAppearance = {};
function applyAppearanceTo(p){ p.appearance = myAppearance; }
function drawMiniOn(ctx2, p, scale=SCALE_SCENE, withName=true){
  const app = p.appearance || {};
  const skin = app.skin || "#e6caa6";
  const hair = app.hair || "#2b2b2b";
  const eyes = app.eyes || "#2b4c7e";
  const style = app.style || "short";

  const bx=p.x-18*scale, by=p.y-24*scale;
  // cloak if any
  if(p.equip && p.equip.cloak){ ctx2.fillStyle="#0f3460"; ctx2.fillRect(bx+2*scale,by+12*scale,32*scale,36*scale); }
  if(p.equip && p.equip.lower){ ctx2.fillStyle="#2e4f79"; ctx2.fillRect(bx+4*scale,by+24*scale,28*scale,16*scale); }
  if(p.equip && p.equip.upper){ ctx2.fillStyle="#3a6ea5"; ctx2.fillRect(bx+4*scale,by+18*scale,28*scale,16*scale); }
  // body
  ctx2.fillStyle=skin; ctx2.fillRect(bx+8*scale,by+20*scale,20*scale,28*scale);
  // shoes
  if(p.equip && p.equip.shoes){ ctx2.fillStyle="#263b57"; ctx2.fillRect(bx+4*scale,by+40*scale,28*scale,6*scale); }
  // head
  ctx2.fillStyle=skin; ctx2.fillRect(bx+12*scale,by+4*scale,12*scale,12*scale);
  // hair
  ctx2.fillStyle=hair;
  if(style==="short"){ ctx2.fillRect(bx+10*scale,by+2*scale,16*scale,6*scale); }
  else if(style==="fade"){ ctx2.fillRect(bx+10*scale,by+3*scale,16*scale,5*scale); }
  else if(style==="buzz"){ ctx2.fillRect(bx+10*scale,by+4*scale,16*scale,4*scale); }
  else if(style==="undercut"){ ctx2.fillRect(bx+8*scale,by+1*scale,20*scale,6*scale); ctx2.clearRect(bx+8*scale,by+7*scale,20*scale,2*scale); }
  else if(style==="mohawk"){ ctx2.fillRect(bx+18*scale,by-2*scale,4*scale,12*scale); }
  else if(style==="curly"){ for(let i=0;i<5;i++){ ctx2.beginPath(); ctx2.arc(p.x-10*scale+i*4*scale, by+6*scale+(i%2?0:1*scale), 3*scale, 0, Math.PI*2); ctx2.fill(); } }
  else if(style==="afro"){ ctx2.beginPath(); ctx2.arc(p.x, by+6*scale, 8*scale, 0, Math.PI*2); ctx2.fill(); }
  else if(style==="ponytail"){ ctx2.fillRect(bx+10*scale,by+2*scale,16*scale,6*scale); ctx2.fillRect(bx+24*scale,by+6*scale,4*scale,10*scale); }
  else if(style==="pixie"){ ctx2.fillRect(bx+10*scale,by+2*scale,16*scale,5*scale); }
  else if(style==="bob"){ ctx2.beginPath(); ctx2.arc(p.x, by+10*scale, 10*scale, Math.PI, 0); ctx2.fill(); }
  else if(style==="long"){ ctx2.fillRect(bx+8*scale,by+0*scale,20*scale,18*scale); }
  else if(style==="bun"){ ctx2.beginPath(); ctx2.arc(p.x, by+2*scale, 3*scale, 0, Math.PI*2); ctx2.fill(); ctx2.fillRect(bx+10*scale,by+2*scale,16*scale,5*scale); }
  else if(style==="braids"){ for(let i=0;i<3;i++){ ctx2.fillRect(bx+12*scale+i*4*scale, by+2*scale, 3*scale, 12*scale); } }
  else { ctx2.fillRect(bx+10*scale,by+2*scale,16*scale,6*scale); }
// eyes
  ctx2.fillStyle=eyes; ctx2.fillRect(bx+14*scale,by+8*scale,2*scale,2*scale); ctx2.fillRect(bx+18*scale,by+8*scale,2*scale,2*scale);
  // hat from equip
  if(p.equip && p.equip.head){ ctx2.fillStyle="#e94560"; ctx2.fillRect(bx+6*scale,by+0*scale,24*scale,4*scale); }
  // accessory
  if(p.equip && p.equip.accessory){ ctx2.fillStyle="#f8b500"; ctx2.beginPath(); ctx2.arc(p.x,by+26*scale,4*scale,0,Math.PI*2); ctx2.fill(); }

  if(withName){
    const fontPx = (scale===SCALE_PREVIEW ? NAME_PREVIEW_PX : NAME_SCENE_PX);
    ctx2.fillStyle="#111827"; ctx2.textAlign="center"; ctx2.font = `bold ${fontPx}px Inter,system-ui`; ctx2.fillText(p.name, p.x, by-18);
  }
}

// Stage rendering
const stage=document.getElementById("stage"), ctx=stage.getContext("2d");
const charCanvas=document.getElementById("char-canvas"), cctx=charCanvas.getContext("2d");
let mePos={name:username,x:520,y:340,equip:{},appearance:(()=>{try{return JSON.parse(localStorage.getItem('cp_appearance')||'{}')}catch(e){return {}}})()||{}},
    others={};

function drawStage(){
  ctx.clearRect(0,0,stage.width,stage.height);
  ctx.fillStyle="#d4e6ff"; ctx.fillRect(0,stage.height-100,stage.width,100);
  drawMiniOn(ctx, mePos, SCALE_SCENE, true);
  Object.values(others).forEach(p=>drawMiniOn(ctx, p, SCALE_SCENE, true));
}
function drawCharPreview(){
  cctx.clearRect(0,0,charCanvas.width,charCanvas.height);
  const p={name:username,x:charCanvas.width/2,y:charCanvas.height/2+40,equip:mePos.equip,appearance:mePos.appearance};
  drawMiniOn(cctx, p, SCALE_PREVIEW, false);
}
document.getElementById("go-left").addEventListener("click", ()=>{ mePos.x=Math.max(40, mePos.x-30); sendMove(); drawStage(); });
document.getElementById("go-right").addEventListener("click", ()=>{ mePos.x=Math.min(stage.width-40, mePos.x+30); sendMove(); drawStage(); });

async function refreshAvatar(){
  const st=await api("/api/avatar_state?username="+encodeURIComponent(username));
  mePos.equip = st.slots || {}; 
  mePos.appearance = st.appearance || mePos.appearance || {};
  drawStage(); drawCharPreview(); sendState(); sendAppearance();
}

// WS chat & presence
let ws, wsTimer; const log=document.getElementById("chat-log"), input=document.getElementById("msg"), btn=document.getElementById("send");
function addMsg(text, cls=""){ const d=document.createElement("div"); if(cls) d.className=cls; d.textContent=text; log.appendChild(d); log.scrollTop=log.scrollHeight; }
function sys(m){ addMsg(m,"muted"); }
function connectWS(){
  try{ if(ws && (ws.readyState===0||ws.readyState===1)) return; }catch{}
  const url=(location.protocol==="https:"?"wss":"ws")+"://"+location.host+"/ws";
  ws=new WebSocket(url);
  ws.onopen=()=>{ sys("соединение установлено"); sendPresence(); sendState(); sendMove(); sendAppearance(); };
  ws.onclose=()=>{ sys("соединение потеряно, переподключаюсь..."); clearTimeout(wsTimer); wsTimer=setTimeout(connectWS,1200); };
  ws.onmessage=(ev)=>{ try{
    const d=JSON.parse(ev.data);
    if(d.type==="chat"){ addMsg(`${d.name}: ${d.msg}`); }
    else if(d.type==="snapshot"){
      // позиция «я» с сервера (чтобы не дублироваться и синхронизировать)
      if(d.me){ mePos.x=d.me.x; mePos.y=d.me.y; mePos.equip=d.me.equip||{}; mePos.appearance=d.me.appearance||mePos.appearance||{}; }
      others={}; (d.players||[]).forEach(p=>{ if(p.name===mePos.name) return; others[p.name]={name:p.name,x:p.x,y:p.y,equip:p.equip||{},appearance:p.appearance||{}}; });
      drawStage();
    }
    else if(d.type==="move"){ if(d.name===mePos.name) return; (others[d.name] ||= {name:d.name,x:d.x,y:d.y,equip:{},appearance:{}}); others[d.name].x=d.x; others[d.name].y=d.y; drawStage(); }
    else if(d.type==="state"){ if(d.name===mePos.name) return; (others[d.name] ||= {name:d.name,x:520,y:340,equip:{},appearance:{}}); others[d.name].equip=d.equip||{}; drawStage(); }
    else if(d.type==="appearance"){ if(d.name===mePos.name) return; (others[d.name] ||= {name:d.name,x:520,y:340,equip:{},appearance:{}}); others[d.name].appearance=d.appearance||{}; drawStage(); }
    else if(d.type==="coins"){ if(d.name===mePos.name){ refreshMe(); } }
    else if(d.type==="system"){ sys(d.text); loadOnline(); }
  }catch(e){ console.error(e); } };
}
function sendPresence(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"presence", name:mePos.name})); }
function sendLeave(){ try{ if(ws?.readyState===1) ws.send(JSON.stringify({type:"leave", name:mePos.name})); }catch(e){} }
window.addEventListener("beforeunload", sendLeave);
function sendChat(){ const t=(input.value||"").trim(); if(!t) return; if(ws?.readyState!==1){ sys("нет соединения"); return; } ws.send(JSON.stringify({type:"chat", name:mePos.name, msg:t})); input.value=""; }
btn.addEventListener("click", sendChat); input.addEventListener("keypress",(e)=>{ if(e.key==="Enter") sendChat(); });
function sendMove(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"move", name:mePos.name, x:mePos.x, y:mePos.y})); }
function sendState(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"state", name:mePos.name, equip:mePos.equip||{}, appearance: mePos.appearance||{}})); }
function sendAppearance(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"appearance", name:mePos.name, appearance:mePos.appearance||{}})); }

// Coins button in modal
document.addEventListener("click",(e)=>{ if(e.target && e.target.id==="claim") claimCoins(); });

// Init: fetch appearance if stored
(async function(){
  try{
    const ap = await api("/api/appearance?username="+encodeURIComponent(username));
    myAppearance = ap || JSON.parse(localStorage.getItem("cp_appearance")||"{}") || {};
    mePos.appearance = myAppearance;
  }catch(e){}
  await refreshMe(); await loadOnline(); await loadInventory(); await refreshAvatar(); drawStage(); connectWS();
})(); 
