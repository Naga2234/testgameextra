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
    primary:'#3a6ea5',
    secondary:'#2e4f79',
    accent:'#1f2f57',
    palette:{
      upper:{
        base:'#4f81c7',
        highlight:'#7aa4dd',
        shadow:'#2b4f82',
        trim:'#1f2f57',
        stroke:'#15223a',
        equipped:{
          base:'#3a6ea5',
          highlight:'#5c8fd3',
          shadow:'#1f3b64',
          trim:'#0f2340',
          stroke:'#09162a'
        }
      },
      lower:{
        base:'#2f4f7d',
        highlight:'#4e6fa3',
        shadow:'#1f3658',
        trim:'#192a45',
        stroke:'#111c2f',
        equipped:{
          base:'#274875',
          highlight:'#4f77a5',
          shadow:'#162a47',
          trim:'#0d2039',
          stroke:'#091326'
        }
      },
      cloak:{
        base:'#123863',
        highlight:'#1f4e86',
        shadow:'#0b2542',
        edge:'#07192f',
        stroke:'#061021',
        lining:'#1e4b78',
        equipped:{
          base:'#0f3460',
          highlight:'#1b4d84',
          shadow:'#081d35',
          edge:'#061326',
          stroke:'#040b19',
          lining:'#255a8d'
        }
      },
      shoes:{
        base:'#2c3f5e',
        highlight:'#445a7c',
        shadow:'#1c2538',
        trim:'#152033',
        stroke:'#0c1422',
        equipped:{
          base:'#263b57',
          highlight:'#3c567c',
          shadow:'#151f30',
          trim:'#111b2c',
          stroke:'#070f1b'
        }
      },
      accessory:{
        base:'#f3b234',
        highlight:'#ffe38a',
        shadow:'#b57a0d',
        stroke:'#8a5a08',
        chain:'#f5ce6a',
        equipped:{
          base:'#f7be3c',
          highlight:'#ffe993',
          shadow:'#b88411',
          stroke:'#8d5f0a',
          chain:'#f8d87b'
        }
      }
    }
  },
  female:{
    primary:'#f19ad9',
    secondary:'#d16ec7',
    accent:'#ffd6ef',
    palette:{
      upper:{
        base:'#f3aee2',
        highlight:'#ffd0ef',
        shadow:'#d16ec7',
        trim:'#ffebf9',
        stroke:'#ba4ea8',
        equipped:{
          base:'#e97dce',
          highlight:'#ffb9e6',
          shadow:'#b34ea3',
          trim:'#ffe0f3',
          stroke:'#9d3b8e'
        }
      },
      lower:{
        base:'#d16ec7',
        highlight:'#e997da',
        shadow:'#a94f9f',
        trim:'#ffccf1',
        stroke:'#8a2f7e',
        equipped:{
          base:'#c35bb9',
          highlight:'#e18cd5',
          shadow:'#8f3d8f',
          trim:'#ffc2ea',
          stroke:'#7a2c73'
        }
      },
      cloak:{
        base:'#a056c7',
        highlight:'#c479e0',
        shadow:'#6f2d8d',
        edge:'#5b2374',
        stroke:'#46195b',
        lining:'#d59af0',
        equipped:{
          base:'#8e48b6',
          highlight:'#c67fe4',
          shadow:'#5d237d',
          edge:'#451861',
          stroke:'#34114a',
          lining:'#dca6f4'
        }
      },
      shoes:{
        base:'#b35ad4',
        highlight:'#d98df0',
        shadow:'#7e3a98',
        trim:'#f2c0ff',
        stroke:'#5e2873',
        equipped:{
          base:'#a349c5',
          highlight:'#d27ce8',
          shadow:'#6c2d8a',
          trim:'#f5c9ff',
          stroke:'#501f69'
        }
      },
      accessory:{
        base:'#f6b8d6',
        highlight:'#ffe1f1',
        shadow:'#c977a4',
        stroke:'#aa628a',
        chain:'#ffd9eb',
        equipped:{
          base:'#f7bfdc',
          highlight:'#ffe7f5',
          shadow:'#c977a4',
          stroke:'#b06694',
          chain:'#ffe3f3'
        }
      }
    }
  },
  other:{
    primary:'#4c8fca',
    secondary:'#3a6aa3',
    accent:'#9fd9ff',
    palette:{
      upper:{
        base:'#5c9ed8',
        highlight:'#88c1ee',
        shadow:'#376fa7',
        trim:'#a8ddff',
        stroke:'#28527c',
        equipped:{
          base:'#4c8fca',
          highlight:'#7ab3e3',
          shadow:'#2c5d8f',
          trim:'#b8e5ff',
          stroke:'#1d4266'
        }
      },
      lower:{
        base:'#3a6aa3',
        highlight:'#5a8cc3',
        shadow:'#254771',
        trim:'#7fb6e5',
        stroke:'#1b3a5e',
        equipped:{
          base:'#315c8f',
          highlight:'#5e8ec4',
          shadow:'#203a62',
          trim:'#8ac3f0',
          stroke:'#152d4c'
        }
      },
      cloak:{
        base:'#2d5d8f',
        highlight:'#4c81b3',
        shadow:'#1c3b60',
        edge:'#152d48',
        stroke:'#0f1f35',
        lining:'#6ca2d6',
        equipped:{
          base:'#285380',
          highlight:'#4d82b5',
          shadow:'#162f4f',
          edge:'#10233a',
          stroke:'#09192b',
          lining:'#75aee0'
        }
      },
      shoes:{
        base:'#34627f',
        highlight:'#4f7f99',
        shadow:'#223f54',
        trim:'#9bd4f5',
        stroke:'#122733',
        equipped:{
          base:'#2d5873',
          highlight:'#4c7c95',
          shadow:'#1a3446',
          trim:'#9bd4f5',
          stroke:'#0e1d28'
        }
      },
      accessory:{
        base:'#8dd6f7',
        highlight:'#c8f1ff',
        shadow:'#4c9bbe',
        stroke:'#3a7d98',
        chain:'#b6e7ff',
        equipped:{
          base:'#9ae0ff',
          highlight:'#d2f4ff',
          shadow:'#4c9bbe',
          stroke:'#3f89a6',
          chain:'#c3edff'
        }
      }
    }
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

function mergeOutfitPalette(basePalette, equip={}){
  const slots=['upper','lower','cloak','shoes','accessory'];
  const merged={};
  slots.forEach(slot=>{
    const slotPalette=(basePalette||{})[slot]||{};
    const {equipped, ...defaults}=slotPalette;
    merged[slot]=Object.assign({}, defaults, (equip && equip[slot] && equipped)?equipped:{});
  });
  return merged;
}

function drawUpperOutfit(ctx2, palette, metrics, scale, options={}){
  const {torsoX, torsoY, torsoWidth, torsoHeight, centerX}=metrics;
  const {equip={}, gender='other'}=options;
  const hasEquip=!!equip.upper;
  const colors=palette.upper||{};
  const baseColor=colors.base||'#5c7ab2';
  const highlight=colors.highlight||baseColor;
  const shadow=colors.shadow||baseColor;
  ctx2.save();
  const grad=ctx2.createLinearGradient(torsoX, torsoY, torsoX, torsoY+torsoHeight);
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1, shadow);
  ctx2.fillStyle=grad;
  ctx2.beginPath();
  if(!hasEquip && gender==='female'){
    ctx2.moveTo(torsoX-2*scale, torsoY+5*scale);
    ctx2.quadraticCurveTo(centerX, torsoY-4*scale, torsoX+torsoWidth+2*scale, torsoY+5*scale);
    ctx2.lineTo(torsoX+torsoWidth-5*scale, torsoY+torsoHeight-1*scale);
    ctx2.quadraticCurveTo(centerX, torsoY+torsoHeight+5*scale, torsoX+5*scale, torsoY+torsoHeight-1*scale);
  }else{
    ctx2.moveTo(torsoX-2*scale, torsoY+4*scale);
    ctx2.quadraticCurveTo(centerX, torsoY-2*scale, torsoX+torsoWidth+2*scale, torsoY+4*scale);
    ctx2.lineTo(torsoX+torsoWidth-3*scale, torsoY+torsoHeight-3*scale);
    ctx2.quadraticCurveTo(centerX, torsoY+torsoHeight+1.5*scale, torsoX+3*scale, torsoY+torsoHeight-3*scale);
  }
  ctx2.closePath();
  ctx2.fill();

  if(colors.stroke){
    ctx2.strokeStyle=colors.stroke;
    ctx2.lineWidth=Math.max(1,1.2*scale);
    ctx2.stroke();
  }

  if(colors.highlight && hasEquip){
    ctx2.strokeStyle=colors.highlight;
    ctx2.lineWidth=0.8*scale;
    ctx2.beginPath();
    ctx2.moveTo(centerX, torsoY+3*scale);
    ctx2.lineTo(centerX, torsoY+torsoHeight-4*scale);
    ctx2.stroke();
  }

  ctx2.restore();
}

function drawLowerOutfit(ctx2, palette, metrics, scale, options={}){
  const {torsoX, torsoWidth, hipY, kneeY, shoeTop, centerX}=metrics;
  const {equip={}, gender='other'}=options;
  const hasEquip=!!equip.lower;
  const colors=palette.lower||{};
  const baseColor=colors.base||'#4a668d';
  const highlight=colors.highlight||baseColor;
  const shadow=colors.shadow||baseColor;
  ctx2.save();
  const grad=ctx2.createLinearGradient(torsoX, hipY, torsoX, shoeTop);
  grad.addColorStop(0, highlight);
  grad.addColorStop(0.65, baseColor);
  grad.addColorStop(1, shadow);
  const drawTrim=()=>{
    if(!colors.trim) return;
    ctx2.strokeStyle=colors.trim;
    ctx2.lineWidth=0.8*scale;
    ctx2.beginPath();
    ctx2.moveTo(torsoX+4*scale, hipY+1.5*scale);
    ctx2.quadraticCurveTo(centerX, hipY+4*scale, torsoX+torsoWidth-4*scale, hipY+1.5*scale);
    ctx2.stroke();
  };

  if(!hasEquip && gender==='female'){
    ctx2.fillStyle=grad;
    ctx2.beginPath();
    ctx2.moveTo(torsoX+2*scale, hipY);
    ctx2.quadraticCurveTo(centerX, hipY+6*scale, torsoX+torsoWidth-2*scale, hipY);
    ctx2.lineTo(torsoX+torsoWidth+4*scale, shoeTop-1*scale);
    ctx2.quadraticCurveTo(centerX, shoeTop+4*scale, torsoX-0.5*scale, shoeTop-1*scale);
    ctx2.closePath();
    ctx2.fill();
    if(colors.stroke){
      ctx2.strokeStyle=colors.stroke;
      ctx2.lineWidth=Math.max(1,1.1*scale);
      ctx2.stroke();
    }
    drawTrim();
    ctx2.restore();
    return;
  }

  const legInset=3*scale;
  const crotchWidth=4*scale;
  const legWidth=(torsoWidth-crotchWidth)/2;
  ctx2.fillStyle=grad;

  // Left leg panel
  ctx2.beginPath();
  ctx2.moveTo(torsoX+legInset, hipY);
  ctx2.quadraticCurveTo(torsoX+legInset+legWidth*0.2, kneeY, torsoX+4*scale, shoeTop);
  ctx2.lineTo(torsoX+12*scale, shoeTop);
  ctx2.quadraticCurveTo(torsoX+legInset+legWidth*0.8, kneeY-2*scale, centerX-crotchWidth/2, hipY+2*scale);
  ctx2.lineTo(centerX-crotchWidth/2, hipY);
  ctx2.closePath();
  ctx2.fill();

  // Right leg panel
  ctx2.beginPath();
  ctx2.moveTo(centerX+crotchWidth/2, hipY);
  ctx2.lineTo(centerX+crotchWidth/2, hipY+2*scale);
  ctx2.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.8, kneeY-2*scale, torsoX+torsoWidth-4*scale, shoeTop);
  ctx2.lineTo(torsoX+torsoWidth-4*scale, shoeTop);
  ctx2.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.2, kneeY, torsoX+torsoWidth-legInset, hipY);
  ctx2.closePath();
  ctx2.fill();

  if(colors.stroke){
    ctx2.strokeStyle=colors.stroke;
    ctx2.lineWidth=Math.max(1,1.05*scale);

    ctx2.beginPath();
    ctx2.moveTo(torsoX+legInset, hipY);
    ctx2.quadraticCurveTo(torsoX+legInset+legWidth*0.2, kneeY, torsoX+4*scale, shoeTop);
    ctx2.lineTo(torsoX+12*scale, shoeTop);
    ctx2.quadraticCurveTo(torsoX+legInset+legWidth*0.8, kneeY-2*scale, centerX-crotchWidth/2, hipY+2*scale);
    ctx2.stroke();

    ctx2.beginPath();
    ctx2.moveTo(centerX+crotchWidth/2, hipY+2*scale);
    ctx2.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.8, kneeY-2*scale, torsoX+torsoWidth-4*scale, shoeTop);
    ctx2.lineTo(torsoX+torsoWidth-4*scale, shoeTop);
    ctx2.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.2, kneeY, torsoX+torsoWidth-legInset, hipY);
    ctx2.stroke();
  }

  drawTrim();
  ctx2.restore();
}

function drawBeltLayer(ctx2, palette, metrics, scale, options={}){
  const anchors=metrics.anchors||{};
  const beltAnchor=anchors.belt;
  if(!beltAnchor) return;
  const colors=(palette.upper)||{};
  const beltColor=colors.trim;
  if(!beltColor) return;
  ctx2.save();
  ctx2.fillStyle=beltColor;
  ctx2.beginPath();
  ctx2.moveTo(beltAnchor.topLeft.x, beltAnchor.topLeft.y);
  ctx2.quadraticCurveTo(beltAnchor.topControl.x, beltAnchor.topControl.y, beltAnchor.topRight.x, beltAnchor.topRight.y);
  ctx2.lineTo(beltAnchor.bottomRight.x, beltAnchor.bottomRight.y);
  ctx2.quadraticCurveTo(beltAnchor.bottomControl.x, beltAnchor.bottomControl.y, beltAnchor.bottomLeft.x, beltAnchor.bottomLeft.y);
  ctx2.closePath();
  ctx2.fill();
  ctx2.restore();
}

function drawCloakLayer(ctx2, palette, metrics, scale, options={}){
  const equip=options.equip||{};
  if(!equip.cloak) return;
  const {torsoX, torsoY, torsoWidth, footBaseline, centerX, headCy, headRadius}=metrics;
  const colors=palette.cloak||{};
  ctx2.save();
  const grad=ctx2.createLinearGradient(centerX, torsoY, centerX, footBaseline);
  grad.addColorStop(0, colors.highlight||colors.base||'#0f3460');
  grad.addColorStop(0.7, colors.base||'#0f3460');
  grad.addColorStop(1, colors.shadow||colors.edge||'#071f2a');
  ctx2.fillStyle=grad;
  const topY=torsoY+2*scale;
  ctx2.beginPath();
  ctx2.moveTo(torsoX-5*scale, topY);
  ctx2.quadraticCurveTo(centerX-6*scale, headCy+headRadius*0.6, torsoX-4*scale, footBaseline-2*scale);
  ctx2.quadraticCurveTo(centerX, footBaseline+6*scale, torsoX+torsoWidth+4*scale, footBaseline-2*scale);
  ctx2.quadraticCurveTo(centerX+6*scale, headCy+headRadius*0.6, torsoX+torsoWidth+5*scale, topY);
  ctx2.closePath();
  ctx2.fill();
  const edgeColor=colors.edge||colors.stroke;
  if(edgeColor){
    ctx2.strokeStyle=edgeColor;
    ctx2.lineWidth=Math.max(1,1.4*scale);
    ctx2.stroke();
  }
  if(colors.lining){
    ctx2.strokeStyle=colors.lining;
    ctx2.lineWidth=0.9*scale;
    ctx2.beginPath();
    ctx2.moveTo(torsoX-3*scale, topY+2*scale);
    ctx2.quadraticCurveTo(centerX-5*scale, headCy+headRadius*0.7, torsoX-2*scale, footBaseline-3*scale);
    ctx2.moveTo(torsoX+torsoWidth+3*scale, topY+2*scale);
    ctx2.quadraticCurveTo(centerX+5*scale, headCy+headRadius*0.7, torsoX+torsoWidth+2*scale, footBaseline-3*scale);
    ctx2.stroke();
  }
  ctx2.restore();
}

function drawShoesLayer(ctx2, palette, metrics, scale){
  const anchors=metrics.anchors||{};
  const feet=anchors.feet;
  if(!feet) return;
  const colors=palette.shoes||{};
  ctx2.save();
  const shoeGrad=ctx2.createLinearGradient(metrics.centerX, feet.topLeft.y, metrics.centerX, feet.bottomY);
  shoeGrad.addColorStop(0, colors.highlight||colors.base||'#666');
  shoeGrad.addColorStop(0.6, colors.base||'#444');
  shoeGrad.addColorStop(1, colors.shadow||colors.trim||'#222');
  ctx2.fillStyle=shoeGrad;
  ctx2.beginPath();
  ctx2.moveTo(feet.topLeft.x, feet.topLeft.y);
  ctx2.quadraticCurveTo(feet.controlLeft.x, feet.controlLeft.y, feet.bottomLeft.x, feet.bottomLeft.y);
  ctx2.lineTo(feet.bottomRight.x, feet.bottomRight.y);
  ctx2.quadraticCurveTo(feet.controlRight.x, feet.controlRight.y, feet.topRight.x, feet.topRight.y);
  ctx2.closePath();
  ctx2.fill();
  if(colors.stroke){
    ctx2.strokeStyle=colors.stroke;
    ctx2.lineWidth=Math.max(1,1.2*scale);
    ctx2.stroke();
  }
  if(colors.trim){
    ctx2.strokeStyle=colors.trim;
    ctx2.lineWidth=0.8*scale;
    ctx2.beginPath();
    ctx2.moveTo(feet.trimStart.x, feet.trimStart.y);
    ctx2.quadraticCurveTo(feet.trimControl.x, feet.trimControl.y, feet.trimEnd.x, feet.trimEnd.y);
    ctx2.stroke();
  }
  ctx2.restore();
}

function drawAccessoryLayer(ctx2, palette, metrics, scale, options={}){
  const equip=options.equip||{};
  const accColors=palette.accessory||{};
  if(equip.accessory){
    const baseColor=accColors.base||'#f8b500';
    const highlight=accColors.highlight||baseColor;
    const shadow=accColors.shadow||accColors.stroke||baseColor;
    const chainColor=accColors.chain||highlight;
    const medallionRadius=3.4*scale;
    const chainTop=metrics.torsoY+2.5*scale;
    const chainBottom=metrics.torsoY+6.5*scale;
    ctx2.save();
    ctx2.strokeStyle=chainColor;
    ctx2.lineWidth=Math.max(0.9*scale,0.7);
    ctx2.beginPath();
    ctx2.moveTo(metrics.centerX-6*scale, chainTop);
    ctx2.quadraticCurveTo(metrics.centerX, chainBottom-2*scale, metrics.centerX+6*scale, chainTop);
    ctx2.stroke();

    const radial=ctx2.createRadialGradient(metrics.centerX, chainBottom, medallionRadius*0.2, metrics.centerX, chainBottom, medallionRadius);
    radial.addColorStop(0, highlight);
    radial.addColorStop(0.7, baseColor);
    radial.addColorStop(1, shadow);
    ctx2.fillStyle=radial;
    ctx2.beginPath();
    ctx2.arc(metrics.centerX, chainBottom, medallionRadius, 0, Math.PI*2);
    ctx2.fill();

    if(accColors.stroke){
      ctx2.strokeStyle=accColors.stroke;
      ctx2.lineWidth=Math.max(0.9*scale,0.6);
      ctx2.stroke();
    }
    ctx2.restore();
  }

  if(equip.head){
    const hatTop=metrics.headCy-metrics.headRadius-4*scale;
    ctx2.save();
    ctx2.fillStyle=accColors.shadow||'#e94560';
    ctx2.fillRect(metrics.headCx-metrics.headRadius, hatTop, metrics.headRadius*2, 4*scale);
    ctx2.restore();
  }
}

function drawHandLayer(ctx2, metrics, options={}, side='left'){
  const anchors=metrics.anchors||{};
  const handAnchor=side==='right'?anchors.handR:anchors.handL;
  if(!handAnchor) return;
  const skinColor=options.skin;
  if(!skinColor) return;
  ctx2.save();
  ctx2.fillStyle=skinColor;
  const thickness=handAnchor.thickness;
  const shoulder=handAnchor.shoulder;
  const elbow=handAnchor.elbow;
  const hand=handAnchor.hand;
  ctx2.beginPath();
  ctx2.moveTo(shoulder.x-thickness, shoulder.y);
  ctx2.bezierCurveTo(elbow.x-thickness*0.8, elbow.y, hand.x-thickness*0.6, hand.y-thickness*0.1, hand.x-thickness*0.3, hand.y);
  ctx2.lineTo(hand.x+thickness*0.3, hand.y);
  ctx2.bezierCurveTo(hand.x+thickness*0.6, hand.y-thickness*0.1, elbow.x+thickness*0.8, elbow.y, shoulder.x+thickness, shoulder.y);
  ctx2.closePath();
  ctx2.fill();
  ctx2.restore();
}

function drawFxLayer(ctx2, metrics, options={}){
  const equip=options.equip||{};
  const fx=equip.fx;
  if(!fx) return;
  ctx2.save();
  const radius=(metrics.headRadius||10)*1.2;
  const color=fx.color||'rgba(255,255,255,0.35)';
  ctx2.strokeStyle=color;
  ctx2.lineWidth=Math.max(1, 1.2*(options.scale||1));
  ctx2.beginPath();
  ctx2.arc(metrics.centerX, metrics.headCy, radius, 0, Math.PI*2);
  ctx2.stroke();
  ctx2.restore();
}

function mirrorAnchorX(target, centerX){
  if(!target || typeof target!=='object') return;
  if(Object.prototype.hasOwnProperty.call(target,'x') && typeof target.x==='number'){
    target.x=centerX-(target.x-centerX);
  }
  Object.values(target).forEach(value=>{
    if(value && typeof value==='object'){
      mirrorAnchorX(value, centerX);
    }
  });
}

function createCharacterAnchors(metrics, scale, options={}){
  const {torsoX, torsoWidth, torsoY, torsoHeight, shoeTop, shoeHeight, centerX}=metrics;
  const shoulderY=options.shoulderY!=null?options.shoulderY:torsoY+4*scale;
  const handY=options.handY!=null?options.handY:shoeTop-1*scale;
  const beltHeight=Math.max(1.6*scale, scale);
  const beltY=torsoY+torsoHeight*0.55;
  const leftTop=torsoX+3*scale;
  const rightToe=torsoX+torsoWidth+5*scale;
  const anchors={
    belt:{
      topLeft:{x:torsoX+4*scale, y:beltY},
      topControl:{x:centerX, y:beltY+0.5*scale},
      topRight:{x:torsoX+torsoWidth-4*scale, y:beltY},
      bottomRight:{x:torsoX+torsoWidth-5*scale, y:beltY+beltHeight},
      bottomControl:{x:centerX, y:beltY+beltHeight+0.5*scale},
      bottomLeft:{x:torsoX+5*scale, y:beltY+beltHeight}
    },
    handL:{
      shoulder:{x:torsoX+3.5*scale, y:shoulderY},
      elbow:{x:(torsoX+3.5*scale+torsoX-2*scale)/2, y:shoulderY+(handY-shoulderY)*0.45},
      hand:{x:torsoX-2*scale, y:handY},
      thickness:2.4*scale
    },
    handR:{
      shoulder:{x:torsoX+torsoWidth-3.5*scale, y:shoulderY},
      elbow:{x:(torsoX+torsoWidth-3.5*scale+torsoX+torsoWidth+2*scale)/2, y:shoulderY+(handY-shoulderY)*0.45},
      hand:{x:torsoX+torsoWidth+2*scale, y:handY},
      thickness:2.4*scale
    },
    feet:{
      topLeft:{x:leftTop, y:shoeTop},
      controlLeft:{x:leftTop-2*scale, y:shoeTop+shoeHeight*0.7},
      bottomLeft:{x:leftTop+2*scale, y:shoeTop+shoeHeight},
      bottomRight:{x:rightToe-2*scale, y:shoeTop+shoeHeight},
      controlRight:{x:rightToe+2*scale, y:shoeTop+shoeHeight*0.7},
      topRight:{x:rightToe-2*scale, y:shoeTop},
      bottomY:shoeTop+shoeHeight,
      trimStart:{x:leftTop+4*scale, y:shoeTop+shoeHeight*0.35},
      trimEnd:{x:rightToe-6*scale, y:shoeTop+shoeHeight*0.35},
      trimControl:{x:centerX, y:shoeTop+shoeHeight*0.15}
    }
  };
  if(options.flipX){
    mirrorAnchorX(anchors, centerX);
  }
  return anchors;
}

function drawBodyBase(ctx2, metrics, options={}){
  const skin=options.skin;
  if(!skin) return;
  const scale=options.scale||1;
  const gender=options.gender||'other';
  const {torsoX, torsoY, torsoWidth, torsoHeight, hipY, kneeY, shoeTop}=metrics;
  ctx2.save();
  ctx2.fillStyle=skin;
  const drawLeg=(hipX, footX)=>{
    const thickness=3*scale;
    const kneeX=(hipX+footX)/2;
    ctx2.beginPath();
    ctx2.moveTo(hipX-thickness, hipY);
    ctx2.quadraticCurveTo(kneeX-thickness*0.8, kneeY, footX-thickness*0.5, shoeTop);
    ctx2.lineTo(footX+thickness*0.5, shoeTop);
    ctx2.quadraticCurveTo(kneeX+thickness*0.8, kneeY, hipX+thickness, hipY);
    ctx2.closePath();
    ctx2.fill();
  };
  drawLeg(torsoX+6*scale, torsoX+5*scale);
  drawLeg(torsoX+torsoWidth-6*scale, torsoX+torsoWidth-5*scale);
  if(gender==='female'){
    ctx2.beginPath();
    ctx2.moveTo(torsoX, torsoY+2*scale);
    ctx2.lineTo(torsoX+torsoWidth, torsoY+2*scale);
    ctx2.lineTo(torsoX+torsoWidth-4*scale, torsoY+torsoHeight);
    ctx2.lineTo(torsoX+4*scale, torsoY+torsoHeight);
    ctx2.closePath();
    ctx2.fill();
  }else{
    ctx2.fillRect(torsoX, torsoY, torsoWidth, torsoHeight);
  }
  ctx2.restore();
}

function characterRenderer(ctx2, metrics, options={}){
  if(!ctx2) return;
  const pipeline=['background','shadow','back','bodyBase','legs','feet','torso','belt','handL','head','hair','eyes','accessories','handR','fx'];
  const palette=options.palette||{};
  const equip=options.equip||{};
  const scale=options.scale||1;
  const faceScale=metrics.faceScale!=null?metrics.faceScale:(metrics.headRadius||36)/36;
  const hairlineY=metrics.hairlineY!=null?metrics.hairlineY:metrics.headCy-(metrics.headRadius*0.7);
  const handlers={
    background:()=>{
      if(typeof options.backgroundRenderer==='function'){
        options.backgroundRenderer(ctx2, metrics, options);
      }
    },
    shadow:()=>drawShadowMini(ctx2, metrics.centerX, metrics.footBaseline, scale*0.9),
    back:()=>drawCloakLayer(ctx2, palette, metrics, scale, options),
    bodyBase:()=>drawBodyBase(ctx2, metrics, {skin:options.skin, gender:options.gender, scale}),
    legs:()=>drawLowerOutfit(ctx2, palette, metrics, scale, {equip, gender:options.gender}),
    feet:()=>drawShoesLayer(ctx2, palette, metrics, scale),
    torso:()=>drawUpperOutfit(ctx2, palette, metrics, scale, {equip, gender:options.gender}),
    belt:()=>drawBeltLayer(ctx2, palette, metrics, scale, options),
    handL:()=>drawHandLayer(ctx2, metrics, {skin:options.skin}, 'left'),
    head:()=>drawHead(ctx2, metrics.headCx, metrics.headCy, metrics.headRadius, options.skin),
    hair:()=>drawHair(ctx2, options.style, options.hair, metrics.headCx, hairlineY, faceScale),
    eyes:()=>drawExpression(ctx2, options.emotion, metrics.headCx, metrics.headCy, options.eyes, faceScale),
    accessories:()=>drawAccessoryLayer(ctx2, palette, metrics, scale, options),
    handR:()=>drawHandLayer(ctx2, metrics, {skin:options.skin}, 'right'),
    fx:()=>drawFxLayer(ctx2, metrics, options)
  };
  pipeline.forEach(layerId=>{
    const handler=handlers[layerId];
    if(typeof handler==='function'){
      handler();
    }
  });
}

function drawMiniOn(ctx2, p, scale=SCALE_SCENE, withName=true){
  if(!hasAvatarHelpers) return;
  const app = hydrateAppearance(p.appearance);
  const genderKey = p.gender || (p.name===username ? (mePos.gender || myGender) : null) || myGender || 'other';
  const outfit = GENDER_OUTFITS[genderKey] || GENDER_OUTFITS.other;
  const equip = p.equip || {};
  const basePalette=(outfit && outfit.palette) || (GENDER_OUTFITS.other && GENDER_OUTFITS.other.palette) || {};
  const outfitPalette=mergeOutfitPalette(basePalette, equip);
  const skin = app.skin;
  const hair = app.hair;
  const eyes = app.eyes;
  const style = app.style;
  const emotion = app.emotion;

  const bx=p.x-18*scale, by=p.y-24*scale;
  const shoeTop = by + 40*scale;
  const shoeHeight = equip.shoes ? 6*scale : 5*scale;
  const footBaseline = shoeTop + shoeHeight;
  const torsoX = bx+8*scale;
  const torsoY = by+20*scale;
  const torsoWidth = 20*scale;
  const torsoHeight = 28*scale;

  const shoulderY = torsoY + 4*scale;
  const handY = shoeTop - 1*scale;
  const hipY = torsoY + torsoHeight;
  const kneeY = hipY + (shoeTop - hipY) * 0.55;

  const isLargePreview = !withName && scale >= SCALE_PREVIEW;
  const headRadius = (isLargePreview ? 12 : 6) * scale;
  const headCx = p.x;
  const headCy = by + 10*scale;
  const metrics={
    torsoX,
    torsoY,
    torsoWidth,
    torsoHeight,
    hipY,
    kneeY,
    shoeTop,
    shoeHeight,
    footBaseline,
    centerX:p.x,
    headCx,
    headCy,
    headRadius
  };

  metrics.faceScale = headRadius / 36;
  metrics.hairlineY = headCy - (headRadius * 0.7);
  metrics.shoulderY = shoulderY;
  metrics.handY = handY;
  metrics.anchors = createCharacterAnchors(metrics, scale, {shoulderY, handY, flipX: !!p.flipX});

  characterRenderer(ctx2, metrics, {
    skin,
    hair,
    eyes,
    style,
    emotion,
    palette: outfitPalette,
    equip,
    gender: genderKey,
    scale,
    flipX: !!p.flipX
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
