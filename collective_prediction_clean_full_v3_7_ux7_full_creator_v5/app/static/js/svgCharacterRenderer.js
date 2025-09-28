(function(global){
  if(!global) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const XLINK_NS = 'http://www.w3.org/1999/xlink';
  const META_URL = '/static/svg/layers.json';
  const INTERNAL_KEY = '__svgAvatarState__';

  const state = {
    ready: false,
    loading: null,
    metadata: null,
    assets: new Map(),
    pending: new Map(),
    idCounter: 0
  };

  function isCanvasContext(value){
    return value && typeof value === 'object' && typeof value.canvas === 'object' && typeof value.beginPath === 'function';
  }

  function shadeColor(hex, amount){
    if(typeof hex !== 'string'){ return hex; }
    const match = hex.trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
    if(!match){ return hex; }
    let raw = match[1];
    if(raw.length === 3){ raw = raw.split('').map(ch=>ch+ch).join(''); }
    const clamp=v=>Math.max(0, Math.min(255, v));
    let r=parseInt(raw.slice(0,2),16);
    let g=parseInt(raw.slice(2,4),16);
    let b=parseInt(raw.slice(4,6),16);
    const apply=(channel)=>{
      if(amount>=0){ return clamp(Math.round(channel + (255-channel)*amount)); }
      return clamp(Math.round(channel + channel*amount));
    };
    r=apply(r); g=apply(g); b=apply(b);
    const toHex=v=>v.toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function fetchJSON(url){
    return fetch(url).then(resp=>{
      if(!resp.ok){ throw new Error(`Unable to load ${url}: ${resp.status}`); }
      return resp.json();
    });
  }

  async function loadAsset(file){
    if(state.assets.has(file)){
      const cached = state.assets.get(file);
      if(cached && typeof cached.then === 'function'){
        return cached;
      }
      return cached;
    }
    const promise = fetch(`/static/svg/${file}`).then(resp=>{
      if(!resp.ok){ throw new Error(`Unable to load /static/svg/${file}`); }
      return resp.text();
    }).then(text=>{
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svgEl = doc.documentElement;
      const attrs = Array.from(svgEl.attributes)
        .filter(attr=>!/^xmlns/i.test(attr.name) && attr.name !== 'viewBox')
        .map(attr=>[attr.name, attr.value]);
      const asset = {
        viewBox: svgEl.getAttribute('viewBox') || null,
        attrs,
        inner: svgEl.innerHTML || ''
      };
      state.assets.set(file, asset);
      return asset;
    }).catch(err=>{
      console.error('[SVGCharacterRenderer] Failed to load asset', file, err);
      throw err;
    });
    state.assets.set(file, promise);
    return promise;
  }

  async function ensureMetadata(){
    if(state.ready){ return state.metadata; }
    if(state.loading){ return state.loading; }
    state.loading = fetchJSON(META_URL).then(async meta=>{
      state.metadata = meta || {};
      const layers = Array.isArray(meta?.layers) ? meta.layers : [];
      const uniqueFiles = Array.from(new Set(layers.map(layer=>layer.file).filter(Boolean)));
      await Promise.all(uniqueFiles.map(loadAsset));
      state.ready = true;
      state.loading = null;
      flushPending();
      return state.metadata;
    }).catch(err=>{
      state.loading = null;
      console.error('[SVGCharacterRenderer] Failed to load metadata', err);
      throw err;
    });
    return state.loading;
  }

  function flushPending(){
    if(!state.ready) return;
    const tasks = Array.from(state.pending.values());
    state.pending.clear();
    tasks.forEach(task=>{
      try{
        renderToContainer(task.container, task.character, task.options);
      }catch(err){
        console.error('[SVGCharacterRenderer] Failed to render pending avatar', err);
      }
    });
  }

  function ensureElements(container, options){
    if(!container) return null;
    let record = container[INTERNAL_KEY];
    if(!record){
      const svg = container.querySelector('svg[data-avatar-svg]') || document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('data-avatar-svg', '1');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('role', 'presentation');
      svg.setAttribute('tabindex', '-1');
      if(!svg.parentNode){
        container.appendChild(svg);
      }
      const defs = svg.querySelector('defs[data-avatar-defs]') || document.createElementNS(SVG_NS, 'defs');
      defs.setAttribute('data-avatar-defs', '1');
      if(!defs.parentNode){ svg.appendChild(defs); }
      let layerRoot = svg.querySelector('g[data-avatar-layers]');
      if(!layerRoot){
        layerRoot = document.createElementNS(SVG_NS, 'g');
        layerRoot.setAttribute('data-avatar-layers', '1');
        svg.appendChild(layerRoot);
      }
      let chat = container.querySelector('.avatar-chat-bubble');
      if(!chat){
        chat = document.createElement('div');
        chat.className = 'avatar-chat-bubble';
        container.appendChild(chat);
      }
      let name = container.querySelector('.avatar-name-label');
      if(!name){
        name = document.createElement('div');
        name.className = 'avatar-name-label';
        container.appendChild(name);
      }
      record = {
        container,
        svg,
        defs,
        layerRoot,
        chat,
        name,
        id: `svgAvatar-${++state.idCounter}`
      };
      container[INTERNAL_KEY] = record;
    }
    if(options && Number.isFinite(options.width) && Number.isFinite(options.height)){
      const width = Math.max(1, Math.round(options.width));
      const height = Math.max(1, Math.round(options.height));
      record.svg.setAttribute('width', width);
      record.svg.setAttribute('height', height);
      record.container.style.width = `${width}px`;
      record.container.style.height = `${height}px`;
    }
    return record;
  }

  function normalizeAppearance(character){
    const fallback = (global.CharacterRenderer && typeof global.CharacterRenderer.normalizeAppearance === 'function')
      ? global.CharacterRenderer.normalizeAppearance(character?.appearance)
      : Object.assign({skin:'#e6caa6', hair:'#2b2b2b', eyes:'#2b4c7e', style:'short', emotion:'smile'}, character?.appearance || {});
    return fallback;
  }

  function getPalette(gender, equip, options){
    if(options && options.palette){ return options.palette; }
    if(global.CharacterRenderer && typeof global.CharacterRenderer.getPalette === 'function'){
      return global.CharacterRenderer.getPalette(gender, equip);
    }
    return {};
  }

  function applyPalette(record, appearance, palette){
    const style = record.svg.style;
    const set = (key, value)=>{
      if(value != null){ style.setProperty(key, value); }
    };
    set('--skin-base', appearance.skin);
    set('--skin-highlight', shadeColor(appearance.skin, 0.16));
    set('--skin-shadow', shadeColor(appearance.skin, -0.22));
    set('--hair-base', appearance.hair);
    set('--hair-highlight', shadeColor(appearance.hair, 0.2));
    set('--hair-shadow', shadeColor(appearance.hair, -0.25));
    set('--eye-base', appearance.eyes);
    set('--eye-highlight', shadeColor(appearance.eyes, 0.25));
    set('--eye-white', '#ffffff');
    set('--mouth-base', shadeColor(appearance.skin, -0.35));
    set('--shadow-fill', 'rgba(15,23,42,0.18)');

    const slots = ['upper','lower','cloak','shoes','accessory'];
    slots.forEach(slot=>{
      const colors = palette[slot] || {};
      const base = colors.base || '#d1d5db';
      set(`--${slot}-base`, base);
      set(`--${slot}-highlight`, colors.highlight || shadeColor(base, 0.18));
      set(`--${slot}-shadow`, colors.shadow || shadeColor(base, -0.18));
      if(colors.trim) set(`--${slot}-trim`, colors.trim);
      if(colors.stroke) set(`--${slot}-stroke`, colors.stroke);
      if(colors.edge) set(`--${slot}-edge`, colors.edge);
      if(colors.lining) set(`--${slot}-lining`, colors.lining);
      if(colors.chain) set(`--${slot}-chain`, colors.chain);
    });

    const headBase = palette.upper?.trim || '#6b4bcf';
    set('--head-base', headBase);
    set('--head-crown', palette.upper?.base || '#8d6ff1');
    set('--head-highlight', palette.upper?.highlight || shadeColor(headBase, 0.25));
    set('--head-stroke', palette.upper?.stroke || '#4a2fa3');
  }

  function shouldIncludeLayer(layer, appearance, equip, options){
    if(!layer){ return false; }
    if(options?.shadow === false && layer.slot === 'shadow'){ return false; }
    const cond = layer.conditions || {};
    if(cond.equip && !equip?.[cond.equip]){ return false; }
    if(cond.notEquip && equip?.[cond.notEquip]){ return false; }
    if(Array.isArray(layer.styles) && layer.styles.length){
      if(!layer.styles.includes(appearance.style)){ return false; }
    }
    if(Array.isArray(layer.emotions) && layer.emotions.length){
      if(!layer.emotions.includes(appearance.emotion)){ return false; }
    }
    return true;
  }

  function collectLayers(metadata, appearance, equip, options){
    const layers = Array.isArray(metadata?.layers) ? metadata.layers : [];
    const selected = [];
    const hairFallback = [];
    const expressionFallback = [];

    layers.forEach(layer=>{
      if(layer.slot === 'hair'){
        if(Array.isArray(layer.styles) && layer.styles.includes(appearance.style)){
          selected.push(layer);
        }else if(layer.fallback){
          hairFallback.push(layer);
        }
        return;
      }
      if(layer.slot === 'expression'){
        if(Array.isArray(layer.emotions) && layer.emotions.includes(appearance.emotion)){
          selected.push(layer);
        }else if(layer.fallback){
          expressionFallback.push(layer);
        }
        return;
      }
      if(shouldIncludeLayer(layer, appearance, equip, options)){
        selected.push(layer);
      }
    });

    if(!selected.some(layer=>layer.slot === 'hair')){
      const fallbackId = metadata?.defaults?.hair;
      const fallback = hairFallback[0] || layers.find(layer=>layer.id === fallbackId);
      if(fallback){ selected.push(fallback); }
    }

    if(!selected.some(layer=>layer.slot === 'expression')){
      const fallbackId = metadata?.defaults?.expression;
      const fallback = expressionFallback[0] || layers.find(layer=>layer.id === fallbackId);
      if(fallback){ selected.push(fallback); }
    }

    return selected.sort((a,b)=>{
      const az = Number.isFinite(a.z) ? a.z : 0;
      const bz = Number.isFinite(b.z) ? b.z : 0;
      return az - bz;
    });
  }

  function ensureSymbol(record, layer){
    const asset = state.assets.get(layer.file);
    if(!asset || typeof asset.then === 'function'){ return null; }
    const id = `${record.id}-${layer.id}`;
    let symbol = record.defs.querySelector(`#${id}`);
    if(!symbol){
      symbol = document.createElementNS(SVG_NS, 'symbol');
      symbol.setAttribute('id', id);
      const viewBox = asset.viewBox || state.metadata?.viewBox;
      if(viewBox){ symbol.setAttribute('viewBox', viewBox); }
      if(Array.isArray(asset.attrs)){
        asset.attrs.forEach(([name,value])=>symbol.setAttribute(name, value));
      }
      symbol.innerHTML = asset.inner || '';
      record.defs.appendChild(symbol);
    }
    return id;
  }

  function applyLayers(record, layers){
    while(record.layerRoot.firstChild){
      record.layerRoot.removeChild(record.layerRoot.firstChild);
    }
    layers.forEach(layer=>{
      const symbolId = ensureSymbol(record, layer);
      if(!symbolId) return;
      const use = document.createElementNS(SVG_NS, 'use');
      use.setAttributeNS(XLINK_NS, 'href', `#${symbolId}`);
      use.setAttribute('data-layer-id', layer.id);
      record.layerRoot.appendChild(use);
    });
  }

  function updateOverlays(record, character, options){
    const withName = options?.withName !== false;
    if(withName && character?.name){
      record.name.textContent = character.name;
      record.name.style.display = 'block';
      record.name.style.fontFamily = options?.nameFontFamily || options?.fontFamily || 'Inter,system-ui';
      const size = options?.nameFontPx != null ? options.nameFontPx : 16;
      record.name.style.fontSize = `${size}px`;
      record.name.style.fontWeight = options?.nameFontWeight || '600';
      record.name.style.color = options?.nameColor || '#111827';
    }else{
      record.name.textContent = '';
      record.name.style.display = 'none';
    }

    const showChat = options?.showChat !== false;
    const chat = character?.chat;
    const hasChat = showChat && chat && chat.text && (!chat.expiresAt || chat.expiresAt > Date.now());
    if(hasChat){
      record.chat.textContent = String(chat.text);
      record.chat.style.display = 'block';
      record.chat.style.fontFamily = options?.chatFontFamily || options?.fontFamily || 'Inter,system-ui';
      const chatSize = options?.chatFontPx != null ? options.chatFontPx : 14;
      record.chat.style.fontSize = `${chatSize}px`;
      if(options?.chatMaxWidth){
        record.chat.style.maxWidth = `${options.chatMaxWidth}px`;
      }else{
        record.chat.style.maxWidth = '180px';
      }
    }else{
      record.chat.textContent = '';
      record.chat.style.display = 'none';
    }
  }

  function renderToContainer(container, character, options){
    if(!state.ready || !state.metadata){ return null; }
    const record = ensureElements(container, options);
    if(!record){ return null; }
    const appearance = normalizeAppearance(character || {});
    const equip = Object.assign({}, character?.equip || {});
    const gender = options?.gender || character?.gender || 'other';
    const palette = getPalette(gender, equip, options);
    applyPalette(record, appearance, palette || {});
    const layers = collectLayers(state.metadata, appearance, equip, options || {});
    if(state.metadata?.viewBox){
      record.svg.setAttribute('viewBox', state.metadata.viewBox);
    }
    applyLayers(record, layers);
    updateOverlays(record, character || {}, options || {});
    return {
      mode: 'svg',
      layers: layers.map(layer=>layer.id)
    };
  }

  function draw(target, character, options){
    if(isCanvasContext(target)){
      if(global.CharacterRenderer && typeof global.CharacterRenderer.draw === 'function'){
        return global.CharacterRenderer.draw(target, character, options || {});
      }
      return null;
    }
    const container = (target && target.nodeType === 1) ? target : null;
    if(!container){ return null; }
    ensureMetadata();
    if(!state.ready){
      state.pending.set(container, {container, character: Object.assign({}, character || {}), options: Object.assign({}, options || {})});
      return null;
    }
    return renderToContainer(container, character || {}, options || {});
  }

  global.SVGCharacterRenderer = {
    draw,
    isReady: ()=>state.ready,
    preload: ensureMetadata,
    metadata: ()=>state.metadata
  };

  ensureMetadata().catch(()=>{/* ignore initial load errors here */});
})(typeof window !== 'undefined' ? window : this);
