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

// ---- SCALE / FONT ----
const SCALE_SCENE = 2.4;
const SCALE_PREVIEW = 3.0;
const NAME_BASE_PX = 12;
const NAME_SCENE_PX = Math.round(NAME_BASE_PX * SCALE_SCENE);
const NAME_PREVIEW_PX = Math.round(NAME_BASE_PX * SCALE_PREVIEW) + 4;

const EMOTIONS = [
  {value:'smile',label:'Улыбка',icon:'🙂'},
  {value:'neutral',label:'Спокойно',icon:'😐'},
  {value:'frown',label:'Серьёзный',icon:'😠'},
  {value:'surprised',label:'Удивлён',icon:'😯'},
  {value:'sleepy',label:'Сонный',icon:'😴'}
];
const GENDER_OUTFITS={
  male:{
    primary:'#3c71b8',
    secondary:'#224169',
    accent:'#96c2ff',
    highlight:'#b7d7ff',
    shadow:'#15223b',
    outline:'#0d1628'
  },
  female:{
    primary:'#f4a6e2',
    secondary:'#c95bb8',
    accent:'#ffe3f7',
    highlight:'#ffdff4',
    shadow:'#8f2f8f',
    outline:'#5d1f63'
  },
  other:{
    primary:'#5a9fd6',
    secondary:'#356197',
    accent:'#b8e6ff',
    highlight:'#d3f1ff',
    shadow:'#1d3553',
    outline:'#16263e'
  }
};

const { drawHead, drawHair, drawExpression } = (window.AvatarDrawing || {});
const hasAvatarHelpers = typeof drawHead === 'function' && typeof drawHair === 'function' && typeof drawExpression === 'function';

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
  const base = Object.assign({}, {skin:'#e6caa6', hair:'#2b2b2b', eyes:'#2b4c7e', style:'short', emotion:'smile'}, app||{});
  if(!EMOTIONS.some(e=>e.value===base.emotion)) base.emotion='smile';
  return base;
}

let myAppearance = hydrateAppearance(storedAppearance);
function applyAppearanceTo(p){ p.appearance = hydrateAppearance(p.appearance); }

function drawShadowMini(ctx2, x, baselineY, scale){
  ctx2.save();
  ctx2.fillStyle='rgba(0,0,0,0.2)';
  ctx2.beginPath();
  const offset = 4*scale;
  ctx2.ellipse(x, baselineY + offset, 10*scale, 4*scale, 0, 0, Math.PI*2);
  ctx2.fill();
  ctx2.restore();
}

function mergeOutfitPalette(base, overrides={}){
  const palette = Object.assign({
    primary:'#6b7280',
    secondary:'#4b5563',
    accent:'#9ca3af',
    highlight:'#f3f4f6',
    shadow:'#111827',
    outline:'#1f2937'
  }, base||{});
  Object.assign(palette, overrides||{});
  if(!palette.highlight) palette.highlight=palette.accent;
  if(!palette.shadow) palette.shadow=palette.secondary;
  if(!palette.outline) palette.outline=palette.shadow;
  return palette;
}

const EQUIP_PALETTES={
  upper:mergeOutfitPalette(null,{
    primary:'#3a6ea5',
    secondary:'#2c4c7f',
    accent:'#84aaf0',
    highlight:'#6fa5ff',
    shadow:'#101d32',
    outline:'#0d1422'
  }),
  lower:mergeOutfitPalette(null,{
    primary:'#2e4f79',
    secondary:'#1f3657',
    accent:'#6f8fb8',
    highlight:'#4f78b6',
    shadow:'#0b1424',
    outline:'#0a111c'
  }),
  accessory:mergeOutfitPalette(null,{
    primary:'#f0ba5a',
    secondary:'#d8892a',
    accent:'#ffe5a4',
    highlight:'#fff1c9',
    shadow:'#a55617',
    outline:'#7a3c10'
  }),
  head:mergeOutfitPalette(null,{
    primary:'#e9656d',
    secondary:'#b43745',
    accent:'#ffd1d4',
    highlight:'#ffecf0',
    shadow:'#7a1f2c',
    outline:'#52111b'
  })
};

function drawUpperOutfit(ctx2,{gender,colors,x,y,width,height,scale}){
  const palette = mergeOutfitPalette(colors);
  const shoulderExtra = (gender==='male'?3:2)*scale;
  const waistInset = (gender==='female'?5:2)*scale;
  const hemFlare = (gender==='female'?4:1.5)*scale;
  const waistY = y + height*0.55;
  const hemY = y + height - 2*scale;
  const left = x - shoulderExtra;
  const right = x + width + shoulderExtra;
  ctx2.save();
  const gradient=ctx2.createLinearGradient(left, y, right, hemY);
  gradient.addColorStop(0, palette.highlight);
  gradient.addColorStop(0.35, palette.primary);
  gradient.addColorStop(0.7, palette.secondary);
  gradient.addColorStop(1, palette.shadow);
  ctx2.fillStyle=gradient;
  ctx2.beginPath();
  ctx2.moveTo(left, y+4*scale);
  ctx2.quadraticCurveTo(left-1*scale, y+height*0.25, x-waistInset, waistY);
  ctx2.quadraticCurveTo(x-hemFlare, hemY, x+width*0.1, hemY);
  ctx2.lineTo(x+width-width*0.1, hemY);
  ctx2.quadraticCurveTo(x+width+hemFlare, hemY, x+width+waistInset, waistY);
  ctx2.quadraticCurveTo(right+1*scale, y+height*0.25, right, y+4*scale);
  ctx2.closePath();
  ctx2.fill();
  ctx2.lineWidth=Math.max(0.9*scale,0.8);
  ctx2.strokeStyle=palette.outline;
  ctx2.lineJoin='round';
  ctx2.stroke();

  // Waist detail
  ctx2.beginPath();
  ctx2.strokeStyle=palette.accent;
  ctx2.lineWidth=Math.max(1.2*scale,1);
  const beltY = waistY + 1.5*scale;
  ctx2.moveTo(x-waistInset+1*scale, beltY);
  ctx2.lineTo(x+width+waistInset-1*scale, beltY);
  ctx2.stroke();

  // Highlight glint
  ctx2.save();
  ctx2.globalAlpha=0.55;
  ctx2.fillStyle=palette.highlight;
  ctx2.beginPath();
  ctx2.moveTo(x+width*0.15, y+6*scale);
  ctx2.quadraticCurveTo(x+width*0.25, waistY-2*scale, x+width*0.3, hemY-4*scale);
  ctx2.quadraticCurveTo(x+width*0.2, hemY-3*scale, x+width*0.12, waistY-1*scale);
  ctx2.closePath();
  ctx2.fill();
  ctx2.restore();

  if(gender==='male'){
    ctx2.beginPath();
    ctx2.strokeStyle=palette.shadow;
    ctx2.lineWidth=Math.max(0.7*scale,0.6);
    ctx2.moveTo(x+width*0.5, y+5*scale);
    ctx2.quadraticCurveTo(x+width*0.52, waistY-2*scale, x+width*0.48, hemY-1.5*scale);
    ctx2.stroke();
  }

  ctx2.restore();
}

function drawLowerOutfit(ctx2,{gender,colors,x,y,width,height,scale}){
  const palette = mergeOutfitPalette(colors);
  const hemY = y + height;
  const left = x;
  const right = x + width;
  ctx2.save();
  const gradient=ctx2.createLinearGradient(left, y, left, hemY);
  gradient.addColorStop(0, palette.highlight);
  gradient.addColorStop(0.4, palette.primary);
  gradient.addColorStop(0.75, palette.secondary);
  gradient.addColorStop(1, palette.shadow);
  ctx2.fillStyle=gradient;
  ctx2.beginPath();
  if(gender==='female'){
    ctx2.moveTo(left+2*scale, y);
    ctx2.quadraticCurveTo(left-1*scale, y+height*0.45, left+3*scale, hemY);
    ctx2.lineTo(right-3*scale, hemY);
    ctx2.quadraticCurveTo(right+1*scale, y+height*0.45, right-2*scale, y);
  }else{
    const crotchY = hemY-1.5*scale;
    const innerInset = 4*scale;
    ctx2.moveTo(left+2*scale, y);
    ctx2.quadraticCurveTo(left+1*scale, y+height*0.25, left+innerInset, crotchY);
    ctx2.quadraticCurveTo(left+innerInset+1*scale, hemY, left+innerInset+3*scale, hemY);
    ctx2.lineTo(right-innerInset-3*scale, hemY);
    ctx2.quadraticCurveTo(right-innerInset-1*scale, hemY, right-innerInset, crotchY);
    ctx2.quadraticCurveTo(right-1*scale, y+height*0.25, right-2*scale, y);
  }
  ctx2.closePath();
  ctx2.fill();
  ctx2.lineWidth=Math.max(0.9*scale,0.8);
  ctx2.strokeStyle=palette.outline;
  ctx2.lineJoin='round';
  ctx2.stroke();

  ctx2.beginPath();
  ctx2.strokeStyle=palette.accent;
  ctx2.lineWidth=Math.max(0.8*scale,0.6);
  if(gender==='female'){
    const pleatCount=3;
    for(let i=1;i<=pleatCount;i++){
      const t=i/(pleatCount+1);
      const px=left+t*(width);
      ctx2.moveTo(px, y+2*scale);
      ctx2.lineTo(px, hemY-2*scale);
    }
  }else{
    const seamX = left + width/2;
    ctx2.moveTo(seamX, y+1.5*scale);
    ctx2.lineTo(seamX, hemY-2*scale);
    ctx2.moveTo(seamX-3*scale, y+4*scale);
    ctx2.quadraticCurveTo(seamX-2*scale, y+height*0.4, seamX-2.5*scale, y+height*0.7);
    ctx2.moveTo(seamX+3*scale, y+4*scale);
    ctx2.quadraticCurveTo(seamX+2*scale, y+height*0.4, seamX+2.5*scale, y+height*0.7);
  }
  ctx2.stroke();

  // sheen
  ctx2.save();
  ctx2.globalAlpha=0.4;
  ctx2.fillStyle=palette.highlight;
  ctx2.beginPath();
  ctx2.ellipse(left+width*0.3, y+height*0.35, width*0.18, 4*scale, 0, 0, Math.PI*2);
  ctx2.fill();
  ctx2.restore();

  ctx2.restore();
}

function drawAccessories(ctx2,{phase='body',p,colors,scale,torsoX,torsoY,torsoWidth,torsoHeight,gender,headCx,headCy,headRadius}){
  const palette = mergeOutfitPalette(colors);
  if(phase==='body'){
    ctx2.save();
    const chestY = torsoY + torsoHeight*0.45;
    const glow=ctx2.createRadialGradient(headCx, chestY, 2*scale, headCx, chestY, torsoWidth);
    glow.addColorStop(0, palette.highlight);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2.globalAlpha=0.55;
    ctx2.fillStyle=glow;
    ctx2.beginPath();
    ctx2.ellipse(headCx, chestY, torsoWidth*0.35, 5*scale, 0, 0, Math.PI*2);
    ctx2.fill();
    ctx2.restore();

    if(p.equip && p.equip.accessory){
      ctx2.save();
      const bagWidth=8*scale;
      const bagHeight=10*scale;
      const bagX=torsoX+torsoWidth-3*scale;
      const bagY=torsoY+torsoHeight*0.55;
      const bagGrad=ctx2.createLinearGradient(bagX, bagY, bagX, bagY+bagHeight);
      bagGrad.addColorStop(0, palette.highlight);
      bagGrad.addColorStop(0.5, palette.primary);
      bagGrad.addColorStop(1, palette.shadow);
      ctx2.fillStyle=bagGrad;
      ctx2.beginPath();
      ctx2.moveTo(bagX, bagY+2*scale);
      ctx2.quadraticCurveTo(bagX, bagY, bagX+2*scale, bagY);
      ctx2.lineTo(bagX+bagWidth-2*scale, bagY);
      ctx2.quadraticCurveTo(bagX+bagWidth, bagY, bagX+bagWidth, bagY+2*scale);
      ctx2.lineTo(bagX+bagWidth, bagY+bagHeight-2*scale);
      ctx2.quadraticCurveTo(bagX+bagWidth, bagY+bagHeight, bagX+bagWidth-2*scale, bagY+bagHeight);
      ctx2.lineTo(bagX+2*scale, bagY+bagHeight);
      ctx2.quadraticCurveTo(bagX, bagY+bagHeight, bagX, bagY+bagHeight-2*scale);
      ctx2.closePath();
      ctx2.fill();
      ctx2.lineWidth=Math.max(0.9*scale,0.7);
      ctx2.strokeStyle=palette.outline;
      ctx2.stroke();
      // strap
      ctx2.beginPath();
      ctx2.strokeStyle=palette.secondary;
      ctx2.lineWidth=Math.max(1.1*scale,0.9);
      ctx2.moveTo(bagX+bagWidth-1.5*scale, bagY+0.8*scale);
      ctx2.quadraticCurveTo(headCx+torsoWidth*0.25, torsoY+4*scale, headCx-0.3*headRadius, torsoY-1*scale);
      ctx2.stroke();
      // bag highlight
      ctx2.save();
      ctx2.globalAlpha=0.5;
      ctx2.fillStyle=palette.accent;
      ctx2.beginPath();
      ctx2.ellipse(bagX+bagWidth/2, bagY+bagHeight/2, bagWidth*0.3, 2.5*scale, 0, 0, Math.PI*2);
      ctx2.fill();
      ctx2.restore();
      ctx2.restore();
    }else{
      const adornY = torsoY + torsoHeight*0.6;
      ctx2.save();
      ctx2.strokeStyle=palette.accent;
      ctx2.lineWidth=Math.max(1.1*scale,0.9);
      ctx2.beginPath();
      if(gender==='female'){
        ctx2.moveTo(torsoX+torsoWidth*0.25, adornY);
        ctx2.quadraticCurveTo(headCx, adornY-2*scale, torsoX+torsoWidth*0.75, adornY);
      }else{
        ctx2.moveTo(torsoX+torsoWidth*0.3, adornY);
        ctx2.lineTo(torsoX+torsoWidth*0.7, adornY);
      }
      ctx2.stroke();
      ctx2.restore();
    }
  }else if(phase==='head'){
    if(p.equip && p.equip.head){
      ctx2.save();
      const brimY=headCy-headRadius*0.6;
      const brimGrad=ctx2.createLinearGradient(headCx-headRadius, brimY-2*scale, headCx+headRadius, brimY+3*scale);
      brimGrad.addColorStop(0, palette.shadow);
      brimGrad.addColorStop(0.5, palette.primary);
      brimGrad.addColorStop(1, palette.highlight);
      ctx2.fillStyle=brimGrad;
      ctx2.beginPath();
      ctx2.ellipse(headCx, brimY, headRadius*1.2, headRadius*0.35, 0, 0, Math.PI*2);
      ctx2.fill();
      ctx2.lineWidth=Math.max(0.8*scale,0.7);
      ctx2.strokeStyle=palette.outline;
      ctx2.stroke();

      const crownHeight=headRadius*0.9;
      const crownWidth=headRadius*1.1;
      const crownY=brimY-crownHeight+1*scale;
      ctx2.beginPath();
      ctx2.moveTo(headCx-crownWidth, crownY+crownHeight);
      ctx2.quadraticCurveTo(headCx-crownWidth*0.9, crownY, headCx, crownY);
      ctx2.quadraticCurveTo(headCx+crownWidth*0.9, crownY, headCx+crownWidth, crownY+crownHeight);
      ctx2.closePath();
      const crownGrad=ctx2.createLinearGradient(headCx-crownWidth, crownY, headCx+crownWidth, crownY+crownHeight);
      crownGrad.addColorStop(0, palette.primary);
      crownGrad.addColorStop(0.6, palette.secondary);
      crownGrad.addColorStop(1, palette.shadow);
      ctx2.fillStyle=crownGrad;
      ctx2.fill();
      ctx2.lineWidth=Math.max(0.9*scale,0.8);
      ctx2.strokeStyle=palette.outline;
      ctx2.stroke();

      ctx2.save();
      ctx2.globalAlpha=0.4;
      ctx2.fillStyle=palette.accent;
      ctx2.beginPath();
      ctx2.ellipse(headCx, crownY+crownHeight*0.4, crownWidth*0.4, headRadius*0.25, 0, 0, Math.PI*2);
      ctx2.fill();
      ctx2.restore();
      ctx2.restore();
    }
  }
}

function drawMiniOn(ctx2, p, scale=SCALE_SCENE, withName=true){
  if(!hasAvatarHelpers) return;
  const app = hydrateAppearance(p.appearance);
  const genderKey = p.gender || (p.name===username ? (mePos.gender || myGender) : null) || myGender || 'other';
  const outfit = GENDER_OUTFITS[genderKey] || GENDER_OUTFITS.other;
  const skin = app.skin;
  const hair = app.hair;
  const eyes = app.eyes;
  const style = app.style;
  const emotion = app.emotion;

  const bx=p.x-18*scale, by=p.y-24*scale;
  const shoeTop = by + 40*scale;
  const shoeHeight = (p.equip && p.equip.shoes) ? 6*scale : 5*scale;
  const footBaseline = shoeTop + shoeHeight;
  const torsoX = bx+8*scale;
  const torsoY = by+20*scale;
  const torsoWidth = 20*scale;
  const torsoHeight = 28*scale;
  const hasUpper = !!(p.equip && p.equip.upper);
  const hasLower = !!(p.equip && p.equip.lower);
  const lowerX = torsoX-3*scale;
  const lowerY = torsoY+torsoHeight-6*scale;
  const lowerWidth = torsoWidth+6*scale;
  const lowerHeight = 16*scale;

  const isLargePreview = !withName && scale >= SCALE_PREVIEW;
  const headRadius = (isLargePreview ? 12 : 6) * scale;
  const headCx = p.x;
  const headCy = by + 10*scale;

  drawShadowMini(ctx2, p.x, footBaseline, scale*0.9);

  if(p.equip && p.equip.cloak){
    ctx2.save();
    const cloakGrad=ctx2.createLinearGradient(bx, by+12*scale, bx, by+48*scale);
    cloakGrad.addColorStop(0, 'rgba(13,32,64,0.95)');
    cloakGrad.addColorStop(0.6, '#0f3460');
    cloakGrad.addColorStop(1, '#182a47');
    ctx2.fillStyle=cloakGrad;
    ctx2.beginPath();
    ctx2.moveTo(bx+4*scale, by+14*scale);
    ctx2.quadraticCurveTo(bx-2*scale, by+32*scale, bx+6*scale, by+46*scale);
    ctx2.lineTo(bx+30*scale, by+46*scale);
    ctx2.quadraticCurveTo(bx+38*scale, by+32*scale, bx+32*scale, by+14*scale);
    ctx2.closePath();
    ctx2.fill();
    ctx2.lineWidth=Math.max(0.9*scale,0.8);
    ctx2.strokeStyle='rgba(8,18,36,0.85)';
    ctx2.stroke();
    ctx2.restore();
  }

  ctx2.fillStyle=skin;
  if(genderKey==='female'){
    ctx2.beginPath();
    ctx2.moveTo(torsoX+1*scale, torsoY+2*scale);
    ctx2.quadraticCurveTo(torsoX+torsoWidth*0.15, torsoY-2*scale, torsoX+torsoWidth*0.35, torsoY+4*scale);
    ctx2.quadraticCurveTo(torsoX+torsoWidth*0.5, torsoY+torsoHeight*0.2, torsoX+torsoWidth*0.38, torsoY+torsoHeight*0.45);
    ctx2.quadraticCurveTo(torsoX+torsoWidth*0.3, torsoY+torsoHeight-2*scale, torsoX+torsoWidth*0.4, torsoY+torsoHeight);
    ctx2.lineTo(torsoX+torsoWidth*0.6, torsoY+torsoHeight);
    ctx2.quadraticCurveTo(torsoX+torsoWidth*0.7, torsoY+torsoHeight-2*scale, torsoX+torsoWidth*0.62, torsoY+torsoHeight*0.45);
    ctx2.quadraticCurveTo(torsoX+torsoWidth*0.5, torsoY+torsoHeight*0.2, torsoX+torsoWidth*0.65, torsoY+4*scale);
    ctx2.quadraticCurveTo(torsoX+torsoWidth*0.85, torsoY-2*scale, torsoX+torsoWidth-1*scale, torsoY+2*scale);
    ctx2.closePath();
    ctx2.fill();
  }else{
    ctx2.beginPath();
    ctx2.moveTo(torsoX-1*scale, torsoY+3*scale);
    ctx2.quadraticCurveTo(torsoX-2*scale, torsoY+torsoHeight*0.25, torsoX+1.5*scale, torsoY+torsoHeight-2*scale);
    ctx2.lineTo(torsoX+torsoWidth-1.5*scale, torsoY+torsoHeight-2*scale);
    ctx2.quadraticCurveTo(torsoX+torsoWidth+2*scale, torsoY+torsoHeight*0.25, torsoX+torsoWidth+1*scale, torsoY+3*scale);
    ctx2.closePath();
    ctx2.fill();
  }

  const upperPalette = hasUpper ? EQUIP_PALETTES.upper : outfit;
  drawUpperOutfit(ctx2, {
    gender: genderKey,
    colors: upperPalette,
    x: torsoX,
    y: torsoY,
    width: torsoWidth,
    height: torsoHeight,
    scale
  });

  const lowerPalette = hasLower ? EQUIP_PALETTES.lower : mergeOutfitPalette(outfit, {primary: outfit.secondary});
  drawLowerOutfit(ctx2, {
    gender: genderKey,
    colors: lowerPalette,
    x: lowerX,
    y: lowerY,
    width: lowerWidth,
    height: lowerHeight,
    scale
  });

  drawAccessories(ctx2, {
    phase: 'body',
    p,
    colors: hasUpper ? EQUIP_PALETTES.accessory : outfit,
    scale,
    torsoX,
    torsoY,
    torsoWidth,
    torsoHeight,
    gender: genderKey,
    headCx,
    headCy,
    headRadius
  });

  if(p.equip && p.equip.shoes){
    const grad=ctx2.createLinearGradient(bx+4*scale, shoeTop, bx+4*scale, shoeTop+shoeHeight);
    grad.addColorStop(0, '#31486c');
    grad.addColorStop(0.6, '#1f2f4a');
    grad.addColorStop(1, '#0f172a');
    ctx2.fillStyle=grad;
    ctx2.beginPath();
    ctx2.moveTo(bx+4*scale, shoeTop);
    ctx2.lineTo(bx+32*scale, shoeTop);
    ctx2.quadraticCurveTo(bx+33*scale, shoeTop+shoeHeight/2, bx+32*scale, shoeTop+shoeHeight);
    ctx2.lineTo(bx+4*scale, shoeTop+shoeHeight);
    ctx2.quadraticCurveTo(bx+3*scale, shoeTop+shoeHeight/2, bx+4*scale, shoeTop);
    ctx2.closePath();
    ctx2.fill();
  }else{
    const shoeColor = genderKey==='female' ? '#b373d6' : (genderKey==='other' ? '#326b86' : '#263b57');
    const grad=ctx2.createLinearGradient(bx+6*scale, shoeTop, bx+6*scale, shoeTop+shoeHeight);
    grad.addColorStop(0, shoeColor);
    grad.addColorStop(1, '#111827');
    ctx2.fillStyle=grad;
    ctx2.beginPath();
    ctx2.moveTo(bx+6*scale, shoeTop);
    ctx2.lineTo(bx+30*scale, shoeTop);
    ctx2.quadraticCurveTo(bx+31*scale, shoeTop+shoeHeight/2, bx+30*scale, shoeTop+shoeHeight);
    ctx2.lineTo(bx+6*scale, shoeTop+shoeHeight);
    ctx2.quadraticCurveTo(bx+5*scale, shoeTop+shoeHeight/2, bx+6*scale, shoeTop);
    ctx2.closePath();
    ctx2.fill();
  }

  drawHead(ctx2, headCx, headCy, headRadius, skin);
  const faceScale = headRadius / 36;
  const hairTop = headCy - (headRadius * 0.7);
  drawHair(ctx2, style, hair, headCx, hairTop, faceScale);
  drawExpression(ctx2, emotion, headCx, headCy, eyes, faceScale);

  drawAccessories(ctx2, {
    phase: 'head',
    p,
    colors: EQUIP_PALETTES.head,
    scale,
    torsoX,
    torsoY,
    torsoWidth,
    torsoHeight,
    gender: genderKey,
    headCx,
    headCy,
    headRadius
  });

  if(withName){
    const now=Date.now();
    const chat=(p.chat && p.chat.text && (!p.chat.expiresAt || p.chat.expiresAt>now)) ? p.chat : null;
    if(chat){
      const bubbleScale=Math.max(1, scale);
      const fontPx=Math.max(12, Math.round(11*bubbleScale));
      const lineHeight=fontPx+Math.round(4*bubbleScale);
      const maxWidth=160*bubbleScale;
      ctx2.save();
      ctx2.font=`500 ${fontPx}px Inter,system-ui`;
      ctx2.textAlign="center";
      const rawLines=String(chat.text).split(/\n/);
      const lines=[];
      rawLines.forEach(segment=>{
        const words=segment.split(/\s+/).filter(Boolean);
        if(!words.length){
          lines.push("");
          return;
        }
        let current="";
        words.forEach(word=>{
          const attempt=current?`${current} ${word}`:word;
          if(ctx2.measureText(attempt).width<=maxWidth||!current){
            current=attempt;
          }else{
            lines.push(current);
            current=word;
          }
        });
        if(current){ lines.push(current); }
      });
      if(lines.length===0){ lines.push(String(chat.text)); }
      const textWidth=Math.max(...lines.map(line=>ctx2.measureText(line).width));
      const paddingX=8*bubbleScale;
      const paddingY=6*bubbleScale;
      const bubbleWidth=textWidth+paddingX*2;
      const bubbleHeight=lines.length*lineHeight+paddingY*2;
      const pointerHeight=10*bubbleScale;
      const pointerHalfWidth=8*bubbleScale;
      const headTop=headCy-headRadius;
      const bubbleBottomTarget=headTop-4*bubbleScale;
      const bubbleY=Math.max(12, bubbleBottomTarget-pointerHeight-bubbleHeight);
      const bubbleX=p.x-bubbleWidth/2;
      const bubbleBottom=bubbleY+bubbleHeight;
      const pointerTipY=headTop-2*bubbleScale;
      ctx2.fillStyle="rgba(17,24,39,0.92)";
      ctx2.beginPath();
      const r=10*bubbleScale;
      ctx2.moveTo(bubbleX+r, bubbleY);
      ctx2.lineTo(bubbleX+bubbleWidth-r, bubbleY);
      ctx2.quadraticCurveTo(bubbleX+bubbleWidth, bubbleY, bubbleX+bubbleWidth, bubbleY+r);
      ctx2.lineTo(bubbleX+bubbleWidth, bubbleBottom-r);
      ctx2.quadraticCurveTo(bubbleX+bubbleWidth, bubbleBottom, bubbleX+bubbleWidth-r, bubbleBottom);
      ctx2.lineTo(bubbleX+r, bubbleBottom);
      ctx2.quadraticCurveTo(bubbleX, bubbleBottom, bubbleX, bubbleBottom-r);
      ctx2.lineTo(bubbleX, bubbleY+r);
      ctx2.quadraticCurveTo(bubbleX, bubbleY, bubbleX+r, bubbleY);
      ctx2.closePath();
      ctx2.fill();
      ctx2.beginPath();
      ctx2.moveTo(p.x-pointerHalfWidth, bubbleBottom);
      ctx2.lineTo(p.x+pointerHalfWidth, bubbleBottom);
      ctx2.lineTo(p.x, Math.max(pointerTipY, bubbleBottom+pointerHeight/2));
      ctx2.closePath();
      ctx2.fill();
      ctx2.fillStyle="#f9fafb";
      let textY=bubbleY+paddingY+fontPx;
      lines.forEach(line=>{
        ctx2.fillText(line, p.x, textY);
        textY+=lineHeight;
      });
      ctx2.restore();
    }
    const fontPx = (scale===SCALE_PREVIEW ? NAME_PREVIEW_PX : NAME_SCENE_PX);
    ctx2.fillStyle="#111827"; ctx2.textAlign="center"; ctx2.font = `500 ${fontPx}px Inter,system-ui`; ctx2.fillText(p.name, p.x, by-18);
  }
}

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
const stage=document.getElementById("stage"), ctx=stage.getContext("2d");
const charCanvas=document.getElementById("char-canvas"), cctx=charCanvas.getContext("2d");
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

function drawStage(){
  ctx.clearRect(0,0,stage.width,stage.height);
  ctx.fillStyle="#d4e6ff"; ctx.fillRect(0,stage.height-100,stage.width,100);
  drawMiniOn(ctx, mePos, SCALE_SCENE, true);
  Object.values(others).forEach(p=>drawMiniOn(ctx, p, SCALE_SCENE, true));
}
function drawCharPreview(){
  cctx.clearRect(0,0,charCanvas.width,charCanvas.height);
  const p={name:username,x:charCanvas.width/2,y:charCanvas.height/2+40,equip:mePos.equip,appearance:mePos.appearance,gender:mePos.gender||myGender};
  drawMiniOn(cctx, p, SCALE_PREVIEW, false);
}
document.getElementById("go-left").addEventListener("click", ()=>{ mePos.x=Math.max(40, mePos.x-30); sendMove(); drawStage(); });
document.getElementById("go-right").addEventListener("click", ()=>{ mePos.x=Math.min(stage.width-40, mePos.x+30); sendMove(); drawStage(); });

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
