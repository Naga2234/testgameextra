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
const OUTFIT_PALETTES={
  male:{upper:'#4f81c7',lower:'#2f4f7d',cloak:'#123863',cloakTrim:'#0f2d55',shoes:'#2c3f5e',head:'#3a6ea5',headBand:'#1f2f57',accessory:'#f3b234'},
  female:{upper:'#f3aee2',lower:'#d16ec7',cloak:'#a056c7',cloakTrim:'#6f2d8d',shoes:'#b35ad4',head:'#e97dce',headBand:'#9d3b8e',accessory:'#f6b8d6'},
  other:{upper:'#5c9ed8',lower:'#3a6aa3',cloak:'#1f4e86',cloakTrim:'#12345a',shoes:'#2c3f5e',head:'#4c8fca',headBand:'#203d5c',accessory:'#f5ce6a'}
};
const DEFAULT_STAGE_SIZE={width:1100,height:460};

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
    drawStage();
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
      drawStage(); drawCharPreview(); sendAppearance();
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

// Stage rendering
const stage=document.getElementById("stage");
const charPreviewStage=document.getElementById("char-preview");
const CHARACTER_TEMPLATE=`
  <div class="character-shadow"></div>
  <div class="character-inner">
    <div class="character-head">
      <div class="character-hair-back"></div>
      <div class="character-face">
        <div class="character-eyebrows">
          <span class="character-eyebrow left"></span>
          <span class="character-eyebrow right"></span>
        </div>
        <div class="character-eyes">
          <span class="character-eye left"></span>
          <span class="character-eye right"></span>
        </div>
        <div class="character-mouth"></div>
      </div>
      <div class="character-hair"></div>
    </div>
    <div class="character-body">
      <div class="character-arm left"></div>
      <div class="character-arm right"></div>
      <div class="character-torso">
        <div class="character-underwear"></div>
      </div>
      <div class="character-leg left"></div>
      <div class="character-leg right"></div>
    </div>
  </div>`;
const stagePlayers=new Map();
let previewCharacter=null;
let mePos={name:username,x:520,y:340,equip:{},appearance:Object.assign({}, myAppearance),gender:myGender},
    others={};

const CHAT_BUBBLE_DURATION = 4200;

function showSpeechBubble(name, text){
  if(!text) return;
  const target = name===mePos.name ? mePos : others[name];
  if(!target) return;
  const nextBubble={
    text:String(text),
    expiresAt:Date.now()+CHAT_BUBBLE_DURATION,
    timeoutId:null
  };
  if(target.chat?.timeoutId){
    clearTimeout(target.chat.timeoutId);
  }
  target.chat=nextBubble;
  drawStage();
  nextBubble.timeoutId=setTimeout(()=>{
    if(target.chat===nextBubble){
      delete target.chat;
      drawStage();
    }
  },CHAT_BUBBLE_DURATION);
  if(target.chat){
    target.chat.timeoutId=nextBubble.timeoutId;
  }
}

function createCharacterElement(){
  const wrapper=document.createElement('div');
  wrapper.className='character';
  wrapper.innerHTML=CHARACTER_TEMPLATE;
  return wrapper;
}
function createStagePlayerElement(name,{withName=true,withBubble=true}={}){
  const container=document.createElement('div');
  container.className='stage-player';
  container.dataset.name=name;
  let bubble=null;
  if(withBubble){
    bubble=document.createElement('div');
    bubble.className='speech-bubble';
    bubble.hidden=true;
    container.appendChild(bubble);
  }
  const characterEl=createCharacterElement();
  container.appendChild(characterEl);
  let nameEl=null;
  if(withName){
    nameEl=document.createElement('div');
    nameEl.className='character-name';
    nameEl.textContent=name;
    container.appendChild(nameEl);
  }
  return {container, bubble, characterEl, nameEl};
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
function getOutfitPalette(gender){
  return OUTFIT_PALETTES[gender] || OUTFIT_PALETTES.other;
}
function getStageBounds(){
  return {
    width:stage?.clientWidth||DEFAULT_STAGE_SIZE.width,
    height:stage?.clientHeight||DEFAULT_STAGE_SIZE.height
  };
}
function applyCharacterToElement(el, info){
  if(!el) return;
  const gender=(info.gender||myGender||'other');
  const appearance=hydrateAppearance(info.appearance);
  el.dataset.gender=gender;
  el.dataset.emotion=appearance.emotion;
  el.dataset.style=appearance.style;
  el.style.setProperty('--skin', normalizeHexColor(appearance.skin, DEFAULT_APPEARANCE.skin));
  el.style.setProperty('--hair', normalizeHexColor(appearance.hair, DEFAULT_APPEARANCE.hair));
  el.style.setProperty('--eyes', normalizeHexColor(appearance.eyes, DEFAULT_APPEARANCE.eyes));
  const palette=getOutfitPalette(gender);
  el.style.setProperty('--upper-color', palette.upper);
  el.style.setProperty('--lower-color', palette.lower);
  el.style.setProperty('--cloak-color', palette.cloak);
  el.style.setProperty('--cloak-trim', palette.cloakTrim);
  el.style.setProperty('--shoe-color', palette.shoes);
  el.style.setProperty('--headwear-color', palette.head);
  el.style.setProperty('--headwear-band', palette.headBand);
  el.style.setProperty('--accessory-color', palette.accessory);
  const equip=info.equip||{};
  const underwearColor=equip.lower?palette.lower:'#6aa2ff';
  el.style.setProperty('--underwear', underwearColor);
  SLOT_KEYS.forEach(slot=>{
    el.classList.toggle(`has-${slot}`, !!equip[slot]);
  });
}
function updateStagePlayer(player, isMe){
  if(!stage || !player || !player.name) return;
  let entry=stagePlayers.get(player.name);
  if(!entry){
    entry=createStagePlayerElement(player.name);
    stage.appendChild(entry.container);
    stagePlayers.set(player.name, entry);
  }
  entry.container.dataset.name=player.name;
  entry.container.classList.toggle('me', !!isMe);
  if(entry.nameEl){
    entry.nameEl.textContent=player.name;
  }
  applyCharacterToElement(entry.characterEl, player);
  const bounds=getStageBounds();
  const rawX=Number.isFinite(player.x)?player.x:bounds.width/2;
  const rawY=Number.isFinite(player.y)?player.y:bounds.height-120;
  const clampedX=Math.max(40, Math.min(bounds.width-40, rawX));
  const clampedY=Math.max(120, Math.min(bounds.height-20, rawY));
  entry.container.style.left=`${clampedX}px`;
  entry.container.style.top=`${clampedY}px`;
  entry.container.style.zIndex=String(1000+Math.round(clampedY));
  if(entry.bubble){
    if(player.chat?.text){
      entry.bubble.textContent=player.chat.text;
      entry.bubble.hidden=false;
    }else{
      entry.bubble.hidden=true;
    }
  }
}
function drawStage(){
  if(!stage) return;
  clampMyPosition();
  const active=new Set();
  if(mePos?.name){
    updateStagePlayer(mePos, true);
    active.add(mePos.name);
  }
  Object.values(others).forEach(p=>{
    if(p?.name){
      updateStagePlayer(p, false);
      active.add(p.name);
    }
  });
  const toRemove=[];
  stagePlayers.forEach((entry,name)=>{
    if(!active.has(name)){
      if(entry?.container?.parentNode===stage){
        stage.removeChild(entry.container);
      }
      toRemove.push(name);
    }
  });
  toRemove.forEach(name=>stagePlayers.delete(name));
}
function drawCharPreview(){
  if(!charPreviewStage) return;
  if(!previewCharacter){
    previewCharacter=createStagePlayerElement(mePos.name,{withName:false,withBubble:false});
    previewCharacter.container.classList.add('me');
    charPreviewStage.appendChild(previewCharacter.container);
  }
  applyCharacterToElement(previewCharacter.characterEl, mePos);
}
function clampMyPosition(){
  const bounds=getStageBounds();
  mePos.x=Math.max(40, Math.min(bounds.width-40, mePos.x));
  mePos.y=Math.max(120, Math.min(bounds.height-20, mePos.y));
}
const goLeftBtn=document.getElementById("go-left");
if(goLeftBtn){
  goLeftBtn.addEventListener("click", ()=>{
    mePos.x=Math.max(40, mePos.x-30);
    clampMyPosition();
    sendMove();
    drawStage();
  });
}
const goRightBtn=document.getElementById("go-right");
if(goRightBtn){
  goRightBtn.addEventListener("click", ()=>{
    mePos.x=Math.min(getStageBounds().width-40, mePos.x+30);
    clampMyPosition();
    sendMove();
    drawStage();
  });
}
if(stage){
  window.addEventListener('resize', ()=>{ clampMyPosition(); drawStage(); });
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
    if(d.type==="chat"){ addMsg(`${d.name}: ${d.msg}`); showSpeechBubble(d.name, d.msg); }
    else if(d.type==="snapshot"){
      if(d.me){
        mePos.x=d.me.x; mePos.y=d.me.y; mePos.equip=d.me.equip||{};
        mePos.appearance = hydrateAppearance(d.me.appearance || mePos.appearance);
        myAppearance = Object.assign({}, mePos.appearance);
        localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
        if(typeof d.me.gender === 'string'){
          mePos.gender = d.me.gender;
          myGender = d.me.gender;
          localStorage.setItem('cp_gender', myGender);
          updateGenderBadge(myGender);
        }
        renderEmotionPanel();
      }
      const prevOthers=others;
      const seen=new Set();
      others={};
      (d.players||[]).forEach(p=>{
        if(p.name===mePos.name) return;
        const existing=prevOthers?.[p.name];
        if(existing){
          existing.x=p.x;
          existing.y=p.y;
          existing.equip=p.equip||{};
          existing.appearance=hydrateAppearance(p.appearance);
          existing.gender=p.gender||existing.gender||'other';
          others[p.name]=existing;
        }else{
          others[p.name]={name:p.name,x:p.x,y:p.y,equip:p.equip||{},appearance:hydrateAppearance(p.appearance),gender:p.gender||'other'};
        }
        seen.add(p.name);
      });
      if(prevOthers){
        Object.entries(prevOthers).forEach(([name, info])=>{
          if(!seen.has(name) && info?.chat?.timeoutId){
            clearTimeout(info.chat.timeoutId);
          }
        });
      }
      drawStage(); drawCharPreview();
    }
    else if(d.type==="move"){ if(d.name===mePos.name) return; (others[d.name] ||= {name:d.name,x:d.x,y:d.y,equip:{},appearance:hydrateAppearance({}),gender:'other'}); others[d.name].x=d.x; others[d.name].y=d.y; drawStage(); }
    else if(d.type==="state"){ if(d.name===mePos.name) return; (others[d.name] ||= {name:d.name,x:520,y:340,equip:{},appearance:hydrateAppearance({}),gender:'other'}); others[d.name].equip=d.equip||{}; if(d.appearance) others[d.name].appearance=hydrateAppearance(d.appearance); if(typeof d.gender==='string') others[d.name].gender=d.gender; drawStage(); }
    else if(d.type==="appearance"){ if(d.name===mePos.name){ mePos.appearance=hydrateAppearance(d.appearance||mePos.appearance); myAppearance=Object.assign({}, mePos.appearance); localStorage.setItem('cp_appearance', JSON.stringify(myAppearance)); if(typeof d.gender==='string'){ mePos.gender=d.gender; myGender=d.gender; localStorage.setItem('cp_gender', myGender); updateGenderBadge(myGender); } renderEmotionPanel(); drawStage(); drawCharPreview(); return; } (others[d.name] ||= {name:d.name,x:520,y:340,equip:{},appearance:hydrateAppearance({}),gender:'other'}); others[d.name].appearance=hydrateAppearance(d.appearance); if(typeof d.gender==='string') others[d.name].gender=d.gender; drawStage(); }
    else if(d.type==="coins"){ if(d.name===mePos.name){ refreshMe(); } }
    else if(d.type==="system"){ sys(d.text); loadOnline(); }
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
  await refreshMe(); await loadOnline(); await loadInventory(); await refreshAvatar(); drawStage(); connectWS();
})();
