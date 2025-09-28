(function(global){
  if(!global) return;

  const DATA_URL = '/static/data/anchors.json';
  let anchorsData = null;
  let loadPromise = null;
  const readyQueue = [];

  function normalizeAnchor(anchor){
    if(!anchor) return {x:0,y:0,width:0,height:0,pivotX:0,pivotY:0,scale:1,rotation:0,offsetX:0,offsetY:0};
    const safe = Object.assign({}, anchor);
    safe.x = Number(safe.x) || 0;
    safe.y = Number(safe.y) || 0;
    safe.width = Number(safe.width) || 0;
    safe.height = Number(safe.height) || 0;
    safe.pivotX = Number(safe.pivotX) || 0;
    safe.pivotY = Number(safe.pivotY) || 0;
    safe.scale = safe.scale != null ? Number(safe.scale) || 1 : 1;
    safe.rotation = safe.rotation != null ? Number(safe.rotation) || 0 : 0;
    safe.offsetX = Number(safe.offsetX) || 0;
    safe.offsetY = Number(safe.offsetY) || 0;
    return safe;
  }

  function normalizeData(raw){
    const slots = {};
    if(raw && raw.slots && typeof raw.slots === 'object'){
      Object.keys(raw.slots).forEach(key=>{
        slots[key] = normalizeAnchor(raw.slots[key]);
      });
    }
    return {
      body: raw && typeof raw.body === 'object' ? Object.assign({}, raw.body) : {},
      slots
    };
  }

  function resolveQueue(){
    if(!readyQueue.length) return;
    const list = readyQueue.splice(0);
    list.forEach(cb=>{ try{ cb(anchorsData); }catch(e){ console.error(e); } });
  }

  function loadAnchors(){
    if(loadPromise) return loadPromise;
    loadPromise = fetch(DATA_URL, {cache: 'no-cache'})
      .then(resp=>{
        if(!resp.ok) throw new Error('Failed to load anchors.json');
        return resp.json();
      })
      .then(data=>{
        anchorsData = normalizeData(data);
        resolveQueue();
        return anchorsData;
      })
      .catch(err=>{
        console.error('[CharacterRenderer] unable to load anchors', err);
        loadPromise = null;
        throw err;
      });
    return loadPromise;
  }

  function ensureAnchors(){
    if(!anchorsData) throw new Error('CharacterRenderer anchors are not ready');
    return anchorsData;
  }

  function getAnchor(slot){
    const data = ensureAnchors();
    if(!slot) return null;
    const key = String(slot);
    const base = data.slots[key];
    return base ? Object.assign({}, base) : null;
  }

  function applyAnchor(slot, options){
    options = options || {};
    const data = ensureAnchors();
    const base = typeof slot === 'string' ? data.slots[slot] : slot;
    if(!base) return null;

    const originX = Number(options.originX) || 0;
    const originY = Number(options.originY) || 0;
    const extraOffsetX = Number(options.offsetX) || 0;
    const extraOffsetY = Number(options.offsetY) || 0;
    const worldScale = options.worldScale == null ? 1 : Number(options.worldScale) || 1;
    const slotScale = (base.scale || 1) * (options.scale == null ? 1 : Number(options.scale) || 1);
    const unit = worldScale * slotScale;
    const rotation = (base.rotation || 0) + (options.rotation == null ? 0 : Number(options.rotation) || 0);
    const flipX = !!options.flipX;
    const dpr = options.devicePixelRatio == null ? (global.devicePixelRatio || 1) : Number(options.devicePixelRatio) || 1;

    const pivotX = base.pivotX || 0;
    const pivotY = base.pivotY || 0;
    const widthBase = base.width || 0;
    const heightBase = base.height || 0;

    const pivotWorldX = (base.x + base.offsetX + extraOffsetX) * worldScale + originX;
    const pivotWorldY = (base.y + base.offsetY + extraOffsetY) * worldScale + originY;
    const topLeftWorldX = pivotWorldX - pivotX * unit;
    const topLeftWorldY = pivotWorldY - pivotY * unit;

    const sx = unit * dpr * (flipX ? -1 : 1);
    const sy = unit * dpr;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const a = cos * sx;
    const b = sin * sx;
    const c = -sin * sy;
    const d = cos * sy;
    const tx = pivotWorldX * dpr;
    const ty = pivotWorldY * dpr;
    const e = tx - (a * pivotX + c * pivotY);
    const f = ty - (b * pivotX + d * pivotY);

    return {
      slot: typeof slot === 'string' ? slot : null,
      originX,
      originY,
      unit,
      rotation,
      flipX,
      devicePixelRatio: dpr,
      topLeft: {x: topLeftWorldX, y: topLeftWorldY},
      pivot: {x: pivotWorldX, y: pivotWorldY},
      baseWidth: widthBase,
      baseHeight: heightBase,
      basePivot: {x: pivotX, y: pivotY},
      width: widthBase * unit,
      height: heightBase * unit,
      matrix: {a, b, c, d, e, f},
      applyToContext(ctx){
        if(!ctx || typeof ctx.setTransform !== 'function') return;
        ctx.setTransform(a, b, c, d, e, f);
      }
    };
  }

  function withPlacement(ctx, placement, draw){
    if(!ctx || !placement || typeof draw !== 'function') return;
    ctx.save();
    placement.applyToContext(ctx);
    try{
      draw(ctx, placement);
    }finally{
      ctx.restore();
    }
  }

  function isReady(){
    return !!anchorsData;
  }

  function whenReady(cb){
    if(typeof cb === 'function'){
      if(anchorsData){
        cb(anchorsData);
      }else{
        readyQueue.push(cb);
      }
    }
    return loadAnchors();
  }

  // start loading immediately
  loadAnchors().catch(()=>{});

  global.CharacterRenderer = {
    loadAnchors,
    whenReady,
    isReady,
    getAnchor,
    applyAnchor,
    withPlacement,
    get anchors(){ return anchorsData; }
  };
})(typeof window !== 'undefined' ? window : this);
