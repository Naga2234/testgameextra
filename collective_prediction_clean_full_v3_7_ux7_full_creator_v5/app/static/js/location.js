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
const NAME_SCENE_PX = Math.round(NAME_BASE_PX * SCALE_SCENE) + 10;
const NAME_PREVIEW_PX = Math.round(NAME_BASE_PX * SCALE_PREVIEW) + 10;

const EMOTIONS = [
  {value:'smile',label:'Улыбка',icon:'🙂'},
  {value:'neutral',label:'Спокойно',icon:'😐'},
  {value:'frown',label:'Серьёзный',icon:'😠'},
  {value:'surprised',label:'Удивлён',icon:'😯'},
  {value:'sleepy',label:'Сонный',icon:'😴'}
];
const GENDER_OUTFITS={
  male:{primary:'#3a6ea5',secondary:'#2e4f79',accent:'#1f2f57'},
  female:{primary:'#f19ad9',secondary:'#d16ec7',accent:'#ffd6ef'},
  other:{primary:'#4c8fca',secondary:'#3a6aa3',accent:'#9fd9ff'}
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
let emotionPanelLayoutRaf=null;

const SHOP_FILTER_KEY='cp_shop_filter';
const SHOP_CATEGORY_TYPES=['head','upper','lower','shoes','accessory'];
const shopState={all:[], byType:{}};
let currentShopFilter=(()=>{
  const stored=localStorage.getItem(SHOP_FILTER_KEY)||'all';
  if(stored==='all' || SHOP_CATEGORY_TYPES.includes(stored)) return stored;
  return 'all';
})();

function centerEmotionSelection(panel=emotionPanel){
  if(!panel) return;
  const selected=panel.querySelector('.emotion-btn[data-selected="1"]');
  if(!selected) return;
  const width=panel.clientWidth;
  if(width<=0) return;
  const maxScroll=Math.max(0, panel.scrollWidth-width);
  const target=selected.offsetLeft - (width-selected.offsetWidth)/2;
  const clamped=Math.max(0, Math.min(maxScroll, target));
  panel.scrollLeft=clamped;
}

function updateEmotionScrollHints(panel=emotionPanel){
  if(!panel) return;
  const width=panel.clientWidth;
  if(width<=0){
    panel.dataset.scrollLeft='0';
    panel.dataset.scrollRight='0';
    return;
  }
  const maxScroll=Math.max(0, panel.scrollWidth-width);
  if(maxScroll<=1){
    panel.dataset.scrollLeft='0';
    panel.dataset.scrollRight='0';
    return;
  }
  panel.dataset.scrollLeft=panel.scrollLeft>1?'1':'0';
  panel.dataset.scrollRight=panel.scrollLeft<maxScroll-1?'1':'0';
}

function scheduleEmotionPanelLayout(){
  if(!emotionPanel) return;
  if(emotionPanelLayoutRaf) cancelAnimationFrame(emotionPanelLayoutRaf);
  emotionPanelLayoutRaf=requestAnimationFrame(()=>{
    emotionPanelLayoutRaf=requestAnimationFrame(()=>{
      emotionPanelLayoutRaf=null;
      if(charModal?.hidden) return;
      centerEmotionSelection();
      updateEmotionScrollHints();
    });
  });
}

if(emotionPanel){
  emotionPanel.addEventListener('scroll', ()=>updateEmotionScrollHints(), {passive:true});
}

window.addEventListener('resize', ()=>{
  if(charModal?.hidden) return;
  scheduleEmotionPanelLayout();
});

document.getElementById("btn-character").addEventListener("click", async ()=>{
  charModal.hidden=false;
  renderEmotionPanel();
  drawCharPreview();
  scheduleEmotionPanelLayout();
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

function drawShadowMini(ctx2, x, y, scale){
  ctx2.save();
  ctx2.fillStyle='rgba(0,0,0,0.2)';
  ctx2.beginPath();
  ctx2.ellipse(x, y, 10*scale, 4*scale, 0, 0, Math.PI*2);
  ctx2.fill();
  ctx2.restore();
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
  const torsoX = bx+8*scale;
  const torsoY = by+20*scale;
  const torsoWidth = 20*scale;
  const torsoHeight = 28*scale;
  const hasUpper = !!(p.equip && p.equip.upper);
  const hasLower = !!(p.equip && p.equip.lower);

  drawShadowMini(ctx2, p.x, p.y+18*scale, scale*0.9);
  if(p.equip && p.equip.cloak){ ctx2.fillStyle="#0f3460"; ctx2.fillRect(bx+2*scale,by+12*scale,32*scale,36*scale); }

  ctx2.fillStyle=skin;
  if(genderKey==='female'){
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

  if(!hasUpper){
    if(genderKey==='female'){
      const grad=ctx2.createLinearGradient(torsoX, torsoY, torsoX, torsoY+torsoHeight);
      grad.addColorStop(0, outfit.primary);
      grad.addColorStop(1, outfit.secondary);
      ctx2.fillStyle=grad;
      ctx2.beginPath();
      ctx2.moveTo(torsoX-2*scale, torsoY+4*scale);
      ctx2.lineTo(torsoX+torsoWidth+2*scale, torsoY+4*scale);
      ctx2.lineTo(torsoX+torsoWidth-5*scale, torsoY+torsoHeight-2*scale);
      ctx2.lineTo(torsoX+5*scale, torsoY+torsoHeight-2*scale);
      ctx2.closePath();
      ctx2.fill();
      ctx2.fillStyle=outfit.accent;
      ctx2.fillRect(torsoX+2*scale, torsoY+torsoHeight*0.55, torsoWidth-4*scale, 2.6*scale);
      ctx2.fillStyle=outfit.primary;
      ctx2.beginPath();
      ctx2.ellipse(torsoX-1*scale, torsoY+8*scale, 3*scale, 5*scale, 0, 0, Math.PI*2);
      ctx2.ellipse(torsoX+torsoWidth+1*scale, torsoY+8*scale, 3*scale, 5*scale, 0, 0, Math.PI*2);
      ctx2.fill();
    }else{
      ctx2.fillStyle=outfit.primary;
      ctx2.fillRect(torsoX, torsoY+2*scale, torsoWidth, 13*scale);
      ctx2.fillStyle=outfit.accent;
      ctx2.fillRect(torsoX, torsoY+12*scale, torsoWidth, 2*scale);
    }
  }

  if(!hasLower){
    ctx2.fillStyle=outfit.secondary;
    if(genderKey==='female'){
      ctx2.fillRect(torsoX+4*scale, torsoY+torsoHeight-10*scale, torsoWidth-8*scale, 8*scale);
    }else{
      ctx2.fillRect(torsoX+1*scale, torsoY+14*scale, torsoWidth-2*scale, 12*scale);
    }
  }

  if(p.equip && p.equip.lower){ ctx2.fillStyle="#2e4f79"; ctx2.fillRect(bx+4*scale,by+24*scale,28*scale,16*scale); }
  if(p.equip && p.equip.upper){ ctx2.fillStyle="#3a6ea5"; ctx2.fillRect(bx+4*scale,by+18*scale,28*scale,16*scale); }

  if(p.equip && p.equip.shoes){
    ctx2.fillStyle="#263b57";
    ctx2.fillRect(bx+4*scale,by+40*scale,28*scale,6*scale);
  }else{
    const shoeColor = genderKey==='female' ? '#b373d6' : (genderKey==='other' ? '#326b86' : '#263b57');
    ctx2.fillStyle=shoeColor;
    ctx2.fillRect(bx+6*scale,by+40*scale,24*scale,5*scale);
  }

  const isLargePreview = !withName && scale >= SCALE_PREVIEW;
  const headRadius = (isLargePreview ? 12 : 6) * scale;
  const headCx = p.x;
  const headCy = by + 10*scale;
  drawHead(ctx2, headCx, headCy, headRadius, skin);
  const faceScale = headRadius / 36;
  const hairTop = headCy - (headRadius * (2/3));
  drawHair(ctx2, style, hair, headCx, hairTop, faceScale);
  drawExpression(ctx2, emotion, headCx, headCy, eyes, faceScale);
  if(p.equip && p.equip.head){ ctx2.fillStyle="#e94560"; ctx2.fillRect(bx+6*scale,by+0*scale,24*scale,4*scale); }
  if(p.equip && p.equip.accessory){ ctx2.fillStyle="#f8b500"; ctx2.beginPath(); ctx2.arc(p.x,by+26*scale,4*scale,0,Math.PI*2); ctx2.fill(); }

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
    ctx2.fillStyle="#111827"; ctx2.textAlign="center"; ctx2.font = `bold ${fontPx}px Inter,system-ui`; ctx2.fillText(p.name, p.x, by-18);
  }
}

function renderEmotionPanel(){
  const panel=emotionPanel;
  if(!panel) return;
  panel.innerHTML="";
  panel.dataset.scrollLeft='0';
  panel.dataset.scrollRight='0';
  const current=(mePos.appearance&&mePos.appearance.emotion)||'smile';
  EMOTIONS.forEach(em=>{
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='emotion-btn';
    btn.innerHTML=`<span class="emo-icon">${em.icon}</span><span>${em.label}</span>`;
    btn.dataset.val=em.value;
    btn.dataset.selected = em.value===current ? 1 : 0;
    btn.addEventListener('click', async ()=>{
      if(mePos.appearance?.emotion===em.value) return;
      panel.querySelectorAll('.emotion-btn').forEach(b=>b.dataset.selected=0);
      btn.dataset.selected=1;
      mePos.appearance = hydrateAppearance(Object.assign({}, mePos.appearance, {emotion: em.value}));
      myAppearance = Object.assign({}, mePos.appearance);
      localStorage.setItem('cp_appearance', JSON.stringify(myAppearance));
      drawStage(); drawCharPreview(); sendAppearance();
      try{ await persistAppearance(); }catch(e){ console.warn(e); }
      scheduleEmotionPanelLayout();
    });
    panel.appendChild(btn);
  });
  scheduleEmotionPanelLayout();
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
