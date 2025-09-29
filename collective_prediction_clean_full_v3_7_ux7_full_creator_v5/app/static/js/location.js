// Simple helper
async function api(url, method="GET", body=null){
  const opt={method};
  if(body instanceof FormData){ opt.body=body; }
  else if(body){ opt.headers={"Content-Type":"application/json"}; opt.body=JSON.stringify(body); }
  const r=await fetch(url,opt); return r.json();
}
const username=(new URL(location.href)).searchParams.get("username")||localStorage.getItem("cp_username")||"Гость";
let myGender=localStorage.getItem("cp_gender")||"other";
document.getElementById("u-name").textContent=username;
function updateGenderBadge(value){
  const ico=document.getElementById("u-gender");
  if(!ico) return;
  const g=value||myGender||"other";
  ico.textContent=g==="male"?"♂":(g==="female"?"♀":"⚧");
}
updateGenderBadge(myGender);

const EMOTIONS = [
  {value:'smile',label:'Улыбка',icon:'🙂'},
  {value:'neutral',label:'Спокойно',icon:'😐'},
  {value:'frown',label:'Серьёзный',icon:'😠'},
  {value:'surprised',label:'Удивлён',icon:'😯'},
  {value:'sleepy',label:'Сонный',icon:'😴'}
];
const HAIR_STYLES=['short','buzz','fade','undercut','mohawk','curly','afro','ponytail','pixie','bob','long','bun','braids'];
const VALID_HAIR_STYLES=new Set(HAIR_STYLES);
const VALID_EMOTIONS=new Set(EMOTIONS.map(e=>e.value));
const SLOT_KEYS=['head','upper','lower','cloak','shoes','accessory'];
const DEFAULT_APPEARANCE={skin:'#e6caa6',hair:'#2b2b2b',eyes:'#2b4c7e',style:'short',emotion:'smile'};

const ITEM_TYPE_LABELS = {
  head: 'Голова',
  upper: 'Верх',
  lower: 'Низ',
  cloak: 'Плащ',
  shoes: 'Обувь',
  accessory: 'Аксессуар'
};

const ITEM_VISUALS = {
  head:      {icon: '🎩', accent: '#6366f1', accentSoft: '#e0e7ff'},
  upper:     {icon: '🧥', accent: '#f97316', accentSoft: '#ffe7d1'},
  lower:     {icon: '👖', accent: '#2563eb', accentSoft: '#dbeafe'},
  cloak:     {icon: '🧙', accent: '#8b5cf6', accentSoft: '#ede9fe'},
  shoes:     {icon: '👢', accent: '#b91c1c', accentSoft: '#fee2e2'},
  accessory: {icon: '💍', accent: '#fbbf24', accentSoft: '#fef3c7'},
  default:   {icon: '🎁', accent: '#64748b', accentSoft: '#e2e8f0'}
};

function getItemVisual(type){
  return ITEM_VISUALS[type] || ITEM_VISUALS.default;
}


function createItemCard(item, options={}){
  const visuals = getItemVisual(item.type);
  const card=document.createElement('div');
  card.className='item';
  card.tabIndex=0;
  card.setAttribute('role', options.role || 'button');
  if(options.ariaPressed!==undefined){
    card.setAttribute('aria-pressed', options.ariaPressed ? 'true' : 'false');
  }
  const labelParts=[item.name];
  if(options.metaLabel){ labelParts.push(options.metaLabel); }
  card.setAttribute('aria-label', options.ariaLabel || labelParts.join(', '));
  card.style.setProperty('--item-accent', visuals.accent);
  card.style.setProperty('--item-accent-soft', visuals.accentSoft);
  const icon=document.createElement('div');
  icon.className='item-icon';
  icon.textContent=visuals.icon;
  const info=document.createElement('div');
  info.className='item-info';
  const name=document.createElement('div');
  name.className='item-name';
  name.textContent=item.name;
  info.appendChild(name);
  const meta=document.createElement('div');
  meta.className='item-meta';
  const metaParts = options.metaParts || [];
  metaParts.filter(Boolean).forEach(text=>{
    const span=document.createElement('span');
    span.textContent=text;
    meta.appendChild(span);
  });
  if(meta.childNodes.length){
    info.appendChild(meta);
  }
  card.appendChild(icon);
  card.appendChild(info);
  card.addEventListener('keydown', (ev)=>{
    if(ev.key==='Enter' || ev.key===' ' || ev.key==='Spacebar'){
      ev.preventDefault();
      card.click();
    }
  });
  return card;
}

function formatItemType(type){
  return ITEM_TYPE_LABELS[type] || type;
}

// Coins
async function refreshMe(){
  const me=await api("/api/me?username="+encodeURIComponent(username));
  document.querySelectorAll(".coins-amount").forEach(el=>el.textContent=me.coins);
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
const shopCategoriesPanel=document.getElementById("shop-categories");
const emotionPanel=document.getElementById("emotion-panel");

const SHOP_FILTER_KEY='cp_shop_filter';
const SHOP_CATEGORY_TYPES=['head','upper','lower','shoes','accessory'];
const shopState={all:[], byType:{}};
let currentShopFilter=(()=>{
  const stored=localStorage.getItem(SHOP_FILTER_KEY)||'all';
  if(stored==='all' || SHOP_CATEGORY_TYPES.includes(stored)) return stored;
  return 'all';
})();

document.getElementById("btn-character").addEventListener("click", async ()=>{
  charModal.hidden=false;
  renderEmotionPanel();
  drawCharPreview();
  await initIncomeTimer();
});
document.getElementById("btn-shop").addEventListener("click", ()=>{ shopModal.hidden=false; loadShop(); });
document.getElementById("char-close").addEventListener("click", ()=>{ charModal.hidden=true; });
document.getElementById("shop-close").addEventListener("click", ()=>{ shopModal.hidden=true; });
[charModal,shopModal].forEach(m=>m.addEventListener("click",(e)=>{ if(e.target===m) m.hidden=true; }));

function updateShopCategoryActive(){
  if(!shopCategoriesPanel) return;
  shopCategoriesPanel.querySelectorAll('[data-type]').forEach(btn=>{
    const type=btn.dataset.type||'all';
    const isActive=type===currentShopFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive?'true':'false');
  });
}

function getShopItemsForCurrentFilter(){
  if(currentShopFilter==='all') return shopState.all;
  return shopState.byType[currentShopFilter]||[];
}

function renderShopItems(){
  const box=document.getElementById("shop");
  if(!box) return;
  box.innerHTML="";
  const items=getShopItemsForCurrentFilter();
  if(!items.length){
    const empty=document.createElement('div');
    empty.className='shop-empty';
    empty.textContent='В этой категории пока нет товаров.';
    box.appendChild(empty);
    return;
  }
  items.forEach(it=>{
    const typeLabel=formatItemType(it.type);
    const metaParts=[typeLabel, `${it.price} монет`];
    const ariaLabel=`${it.name}, ${typeLabel}. Цена: ${it.price} монет`;
    const card=createItemCard(it,{metaParts, metaLabel:`${typeLabel}, ${it.price} монет`, ariaLabel});
    card.addEventListener("click", async ()=>{
      const f=new FormData(); f.append("item_id",it.id); f.append("username",username);
      const r=await fetch("/api/buy",{method:"POST",body:f}); const j=await r.json();
      if(!j.ok) return alert(j.error||"Ошибка");
      await refreshMe(); await loadInventory(); await refreshAvatar();
      await loadShop();
    });
    box.appendChild(card);
  });
}

if(shopCategoriesPanel){
  shopCategoriesPanel.querySelectorAll('button').forEach(btn=>{
    btn.type='button';
    btn.setAttribute('aria-pressed','false');
  });
  shopCategoriesPanel.addEventListener('click', (ev)=>{
    const btn=ev.target.closest('[data-type]');
    if(!btn || !shopCategoriesPanel.contains(btn)) return;
    const type=btn.dataset.type||'all';
    if(type===currentShopFilter) return;
    currentShopFilter=type;
    localStorage.setItem(SHOP_FILTER_KEY, currentShopFilter);
    updateShopCategoryActive();
    renderShopItems();
  });
  updateShopCategoryActive();
}

// Shop
async function loadShop(){
  const data=await api("/api/shop");
  shopState.all=Array.isArray(data.items)?data.items.slice():[];
  shopState.byType=shopState.all.reduce((acc,it)=>{
    const key=it.type||'unknown';
    if(!acc[key]) acc[key]=[];
    acc[key].push(it);
    return acc;
  },{});
  if(currentShopFilter!=='all' && !getShopItemsForCurrentFilter().length){
    currentShopFilter='all';
    localStorage.setItem(SHOP_FILTER_KEY, currentShopFilter);
  }
  updateShopCategoryActive();
  renderShopItems();
}

// Inventory & equipped
let _inv=[];
async function loadInventory(){
  _inv=await api("/api/inventory?username="+encodeURIComponent(username));
  const box=document.getElementById("inventory"); box.innerHTML="";
  _inv.forEach(it=>{
    const typeLabel=formatItemType(it.type);
    const metaParts=[typeLabel, it.equipped?"Надето":"В рюкзаке"];
    const card=createItemCard(it,{
      metaParts,
      metaLabel:`${typeLabel}, ${it.equipped?"надето":"в рюкзаке"}`,
      ariaPressed:it.equipped
    });
    if(it.equipped) card.classList.add('equipped');
    card.addEventListener("click", async ()=>{
      const f=new FormData(); f.append("item_id",it.id); f.append("username",username);
      await fetch("/api/toggle_equip",{method:"POST",body:f});
      await refreshAvatar(); await loadInventory();
    });
    box.appendChild(card);
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
const storedAppearance = (()=>{ try{ return JSON.parse(localStorage.getItem('cp_appearance')||'{}'); }catch(e){ return {}; } })();

function hydrateAppearance(app){
  const base=Object.assign({}, DEFAULT_APPEARANCE, app||{});
  base.skin=normalizeHexColor(base.skin, DEFAULT_APPEARANCE.skin);
  base.hair=normalizeHexColor(base.hair, DEFAULT_APPEARANCE.hair);
  base.eyes=normalizeHexColor(base.eyes, DEFAULT_APPEARANCE.eyes);
  base.emotion=VALID_EMOTIONS.has(base.emotion)?base.emotion:DEFAULT_APPEARANCE.emotion;
  base.style=VALID_HAIR_STYLES.has(base.style)?base.style:DEFAULT_APPEARANCE.style;
  return base;
}

let myAppearance = hydrateAppearance(storedAppearance);

function renderEmotionPanel(){
  const select=emotionPanel;
  if(!select) return;
  const current=(mePos.appearance&&mePos.appearance.emotion)||'smile';
  select.innerHTML="";
  EMOTIONS.forEach(em=>{
    const option=document.createElement('option');
    option.value=em.value;
    option.textContent=`${em.icon} ${em.label}`;
    select.appendChild(option);
  });
  select.value=current;
  if(select.value!==current){
    const fallback=EMOTIONS[0]?.value || 'smile';
    select.value=fallback;
    mePos.appearance = hydrateAppearance(Object.assign({}, mePos.appearance, {emotion: select.value || 'smile'}));
    myAppearance = Object.assign({}, mePos.appearance);
    localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
    renderLocationCharacter();
    drawCharPreview();
    sendAppearance();
    persistAppearance().catch(e=>console.warn(e));
  }
  if(select.dataset.bound!=="1"){
    select.addEventListener('change', async ()=>{
      const next=select.value || 'smile';
      if(mePos.appearance?.emotion===next) return;
      mePos.appearance = hydrateAppearance(Object.assign({}, mePos.appearance, {emotion: next}));
      myAppearance = Object.assign({}, mePos.appearance);
      localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
      renderLocationCharacter();
      drawCharPreview();
      sendAppearance();
      try{ await persistAppearance(); }catch(e){ console.warn(e); }
    });
    select.dataset.bound="1";
  }
}

async function persistAppearance(){
  const app = hydrateAppearance(mePos.appearance);
  const f=new FormData();
  f.append('username', username);
  f.append('skin', app.skin);
  f.append('hair', app.hair);
  f.append('eyes', app.eyes);
  f.append('style', app.style);
  f.append('emotion', app.emotion);
  await fetch('/api/appearance/save',{method:'POST', body:f});
}

const DEFAULT_POSITION_X=520;
const DEFAULT_POSITION_Y=340;
const MOVE_STEP=40;

let mePos={name:username,x:DEFAULT_POSITION_X,y:DEFAULT_POSITION_Y,equip:{},appearance:Object.assign({}, myAppearance),gender:myGender};

const locationCharacterEl=document.getElementById('location-character');
const charPreviewCharacterEl=document.getElementById('char-preview-character');
const locationBubbleEl=document.getElementById('location-bubble');

const moveLeftButton=document.querySelector('[data-action="move-left"]');
const moveRightButton=document.querySelector('[data-action="move-right"]');

function getCurrentCharacterX(){
  return typeof mePos.x==='number'?mePos.x:DEFAULT_POSITION_X;
}

function getStageMetrics(){
  if(!locationCharacterEl) return null;
  const stage=locationCharacterEl.closest('.character-stage');
  if(!stage) return null;
  const stageWidth=stage.clientWidth||stage.offsetWidth||0;
  const charWidth=locationCharacterEl.offsetWidth||0;
  if(stageWidth<=0||charWidth<=0){
    const fallbackRange=240;
    return {minX:DEFAULT_POSITION_X-fallbackRange,maxX:DEFAULT_POSITION_X+fallbackRange};
  }
  const halfRange=Math.max(0,(stageWidth-charWidth)/2);
  return {minX:DEFAULT_POSITION_X-halfRange,maxX:DEFAULT_POSITION_X+halfRange};
}

function applyCharacterPosition(){
  if(!locationCharacterEl) return;
  const currentX=getCurrentCharacterX();
  const offsetX=currentX-DEFAULT_POSITION_X;
  locationCharacterEl.style.setProperty('--translate-x', `${offsetX}px`);
  locationCharacterEl.dataset.positionX=String(Math.round(currentX));
}

function updateMovementButtons(metrics){
  const bounds=metrics===undefined?getStageMetrics():metrics;
  const hasStage=!!(bounds && locationCharacterEl);
  [moveLeftButton,moveRightButton].forEach(btn=>{
    if(!btn) return;
    if(!hasStage){
      btn.hidden=true;
      btn.disabled=true;
      return;
    }
    btn.hidden=false;
    btn.disabled=false;
  });
  if(!hasStage||!bounds) return;
  const currentX=getCurrentCharacterX();
  const tolerance=0.5;
  if(moveLeftButton){
    moveLeftButton.disabled=currentX<=bounds.minX+tolerance;
  }
  if(moveRightButton){
    moveRightButton.disabled=currentX>=bounds.maxX-tolerance;
  }
}

function moveCharacterBy(delta){
  if(typeof delta!=='number'||!Number.isFinite(delta)){
    return false;
  }
  const bounds=getStageMetrics();
  if(!bounds){
    updateMovementButtons(bounds);
    return false;
  }
  const prevX=getCurrentCharacterX();
  const nextX=Math.round(Math.min(bounds.maxX, Math.max(bounds.minX, prevX+delta)));
  if(nextX===prevX){
    updateMovementButtons(bounds);
    return false;
  }
  mePos.x=nextX;
  applyCharacterPosition();
  updateMovementButtons(bounds);
  return true;
}

function handleCharacterMovement(event){
  if(!event||event.defaultPrevented) return;
  if(event.metaKey||event.ctrlKey||event.altKey) return;
  let delta=0;
  if(event.key==='ArrowLeft'||event.key==='a'||event.key==='A'){
    delta=-MOVE_STEP;
  }else if(event.key==='ArrowRight'||event.key==='d'||event.key==='D'){
    delta=MOVE_STEP;
  }else{
    return;
  }
  const active=document.activeElement;
  if(active){
    const tag=active.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||active.isContentEditable){
      return;
    }
  }
  event.preventDefault();
  if(moveCharacterBy(delta)){
    sendMove();
  }
}

function bindMoveButton(btn, delta){
  if(!btn) return;
  btn.type='button';
  let pointerTriggered=false;
  const trigger=()=>{
    if(moveCharacterBy(delta)){
      sendMove();
    }
  };
  btn.addEventListener('click',()=>{
    if(pointerTriggered){
      pointerTriggered=false;
      return;
    }
    trigger();
  });
  if(window.PointerEvent){
    btn.addEventListener('pointerdown',event=>{
      if(typeof event.button==='number' && event.button!==0) return;
      pointerTriggered=true;
      trigger();
    });
    btn.addEventListener('pointerup',()=>{
      if(!pointerTriggered) return;
      setTimeout(()=>{ pointerTriggered=false; },0);
    });
    btn.addEventListener('pointercancel',()=>{ pointerTriggered=false; });
  }
}

bindMoveButton(moveLeftButton, -MOVE_STEP);
bindMoveButton(moveRightButton, MOVE_STEP);
window.addEventListener('keydown', handleCharacterMovement);
window.addEventListener('resize', ()=>updateMovementButtons());

applyCharacterPosition();
updateMovementButtons();

const CHAT_BUBBLE_DURATION = 4200;
let bubbleTimeoutId=null;

function showSpeechBubble(name, text){
  if(!locationBubbleEl) return;
  if(name!==mePos.name){
    return;
  }
  const message=String(text||'').trim();
  if(!message){
    locationBubbleEl.hidden=true;
    return;
  }
  locationBubbleEl.textContent=message;
  locationBubbleEl.hidden=false;
  if(bubbleTimeoutId){
    clearTimeout(bubbleTimeoutId);
  }
  bubbleTimeoutId=setTimeout(()=>{
    locationBubbleEl.hidden=true;
    bubbleTimeoutId=null;
  }, CHAT_BUBBLE_DURATION);
}

function normalizeHexColor(value, fallback){
  if(typeof value!=='string') return fallback;
  const match=value.trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
  if(!match) return fallback;
  let raw=match[1];
  if(raw.length===3){
    raw=raw.split('').map(ch=>ch+ch).join('');
  }
  return `#${raw.toLowerCase()}`;
}
function applyAppearanceToElement(el, appearance, gender){
  if(!el) return null;
  const normalized=hydrateAppearance(appearance);
  const genderClass=(gender==='male'||gender==='female')?gender:'other';
  el.dataset.gender=genderClass;
  el.dataset.style=normalized.style;
  el.dataset.emotion=normalized.emotion;
  el.classList.toggle('male', genderClass==='male');
  el.classList.toggle('female', genderClass==='female');
  el.classList.toggle('other', genderClass==='other');
  el.style.setProperty('--skin', normalized.skin);
  el.style.setProperty('--hair', normalized.hair);
  el.style.setProperty('--eyes', normalized.eyes);
  const underwearColor = genderClass==='female' ? '#f472b6' : genderClass==='other' ? '#7c3aed' : '#6aa2ff';
  const mouthColor = genderClass==='female' ? '#e76d7c' : genderClass==='other' ? '#f59e0b' : '#d45a60';
  el.style.setProperty('--underwear', underwearColor);
  el.style.setProperty('--mouth-color', mouthColor);
  return normalized;
}

function renderLocationCharacter(){
  if(!locationCharacterEl) return;
  const normalized=applyAppearanceToElement(locationCharacterEl, mePos.appearance, mePos.gender);
  if(normalized){
    mePos.appearance = Object.assign({}, normalized);
  }
  applyCharacterPosition();
  updateMovementButtons();
}

function drawCharPreview(){
  if(!charPreviewCharacterEl) return;
  applyAppearanceToElement(charPreviewCharacterEl, mePos.appearance, mePos.gender);
}

async function refreshAvatar(){
  const st=await api("/api/avatar_state?username="+encodeURIComponent(username));
  mePos.equip = st.slots || {};
  const normalized = hydrateAppearance(st.appearance || mePos.appearance || {});
  mePos.appearance = Object.assign({}, normalized);
  myAppearance = Object.assign({}, normalized);
  localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
  if(typeof st.gender === 'string'){
    mePos.gender = st.gender;
    myGender = st.gender;
    localStorage.setItem('cp_gender', myGender);
    updateGenderBadge(myGender);
  }
  renderEmotionPanel();
  renderLocationCharacter();
  drawCharPreview();
  sendState();
  sendAppearance();
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
    if(d.type==="chat"){
      addMsg(`${d.name}: ${d.msg}`);
      showSpeechBubble(d.name, d.msg);
    }
    else if(d.type==="snapshot"){
      if(d.me){
        mePos.x=d.me.x;
        mePos.y=d.me.y;
        mePos.equip=d.me.equip||{};
        if(d.me.appearance){
          mePos.appearance=hydrateAppearance(d.me.appearance);
          myAppearance=Object.assign({}, mePos.appearance);
          localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
        }
        if(typeof d.me.gender==='string'){
          mePos.gender=d.me.gender;
          myGender=d.me.gender;
          localStorage.setItem('cp_gender', myGender);
          updateGenderBadge(myGender);
        }
        renderEmotionPanel();
        renderLocationCharacter();
        drawCharPreview();
      }
    }
    else if(d.type==="state" || d.type==="appearance"){
      if(d.name===mePos.name){
        if(d.appearance){
          mePos.appearance=hydrateAppearance(d.appearance);
          myAppearance=Object.assign({}, mePos.appearance);
          localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
          renderEmotionPanel();
          renderLocationCharacter();
          drawCharPreview();
        }
        if(typeof d.gender==='string'){
          mePos.gender=d.gender;
          myGender=d.gender;
          localStorage.setItem('cp_gender', myGender);
          updateGenderBadge(myGender);
        }
      }
    }
    else if(d.type==="coins"){
      if(d.name===mePos.name){
        refreshMe();
      }
    }
    else if(d.type==="system"){
      sys(d.text);
      loadOnline();
    }
  }catch(e){ console.error(e); } };
}
function sendPresence(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"presence", name:mePos.name})); }
function sendLeave(){ try{ if(ws?.readyState===1) ws.send(JSON.stringify({type:"leave", name:mePos.name})); }catch(e){} }
window.addEventListener("beforeunload", sendLeave);
function sendChat(){ const t=(input.value||"").trim(); if(!t) return; if(ws?.readyState!==1){ sys("нет соединения"); return; } ws.send(JSON.stringify({type:"chat", name:mePos.name, msg:t})); showSpeechBubble(mePos.name, t); input.value=""; }
btn.addEventListener("click", sendChat); input.addEventListener("keypress",(e)=>{ if(e.key==="Enter") sendChat(); });
function sendMove(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"move", name:mePos.name, x:mePos.x, y:mePos.y})); }
function sendState(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"state", name:mePos.name, equip:mePos.equip||{}, appearance: hydrateAppearance(mePos.appearance)})); }
function sendAppearance(){ if(ws?.readyState===1) ws.send(JSON.stringify({type:"appearance", name:mePos.name, appearance:hydrateAppearance(mePos.appearance)})); }

// Coins button in modal
document.addEventListener("click",(e)=>{ if(e.target && e.target.id==="claim") claimCoins(); });

// Init: fetch appearance if stored
(async function(){
  try{
    const ap = await api("/api/appearance?username="+encodeURIComponent(username));
    if(ap){
      myAppearance = hydrateAppearance(ap);
      mePos.appearance = Object.assign({}, myAppearance);
      localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
    }
  }catch(e){
    mePos.appearance = Object.assign({}, myAppearance);
  }
  renderEmotionPanel();
  renderLocationCharacter();
  drawCharPreview();
  await refreshMe();
  await loadOnline();
  await loadInventory();
  await refreshAvatar();
  connectWS();
})();
