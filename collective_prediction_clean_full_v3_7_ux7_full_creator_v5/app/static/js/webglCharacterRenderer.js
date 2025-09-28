(function(global){
  if(!global) return;

  const THREE = global.THREE;
  const SUPPORT = !!THREE && (function(){
    try{
      const canvas=document.createElement('canvas');
      return !!(canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    }catch(err){
      return false;
    }
  })();

  if(!SUPPORT){
    global.WebGLCharacterRenderer = {
      isSupported: ()=>false,
      draw: ()=>null,
      dispose: ()=>{}
    };
    return;
  }

  const WHITE = new THREE.Color(0xffffff);
  const BLACK = new THREE.Color(0x000000);
  const records = new WeakMap();

  function parseColor(value, fallback){
    try{
      if(value instanceof THREE.Color){
        return value.clone();
      }
      if(typeof value === 'string'){
        return new THREE.Color(value);
      }
    }catch(err){ /* ignore */ }
    if(fallback instanceof THREE.Color){
      return fallback.clone();
    }
    if(typeof fallback === 'string'){
      try{ return new THREE.Color(fallback); }catch(err){ /* ignore */ }
    }
    return new THREE.Color(0xffffff);
  }

  function shade(color, amount){
    const clamped=Math.max(-1, Math.min(1, amount));
    const target=clamped>=0?WHITE:BLACK;
    return color.clone().lerp(target, Math.abs(clamped));
  }

  function setGradient(geometry, topColor, bottomColor){
    const position=geometry.getAttribute('position');
    if(!position) return;
    let minY=Infinity, maxY=-Infinity;
    for(let i=0;i<position.count;i++){
      const y=position.getY(i);
      if(y<minY) minY=y;
      if(y>maxY) maxY=y;
    }
    const range=maxY-minY || 1;
    const colors=new Float32Array(position.count*3);
    for(let i=0;i<position.count;i++){
      const y=position.getY(i);
      const t=(y-minY)/range;
      const color=bottomColor.clone().lerp(topColor, t);
      colors[i*3]=color.r;
      colors[i*3+1]=color.g;
      colors[i*3+2]=color.b;
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
  }

  function disposeMesh(mesh){
    if(mesh.material){ mesh.material.dispose(); }
    if(mesh.geometry){ mesh.geometry.dispose(); }
  }

  function ensureRecord(container, width, height, pixelRatio){
    let record=records.get(container);
    if(!record){
      const renderer=new THREE.WebGLRenderer({alpha:true, antialias:true});
      renderer.setClearColor(0x000000, 0);
      if(renderer.outputColorSpace){
        renderer.outputColorSpace=THREE.SRGBColorSpace;
      }else if(renderer.outputEncoding!==undefined){
        renderer.outputEncoding=THREE.sRGBEncoding;
      }
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled=false;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);

      const canvas=renderer.domElement;
      canvas.className='avatar-webgl-canvas';
      canvas.setAttribute('data-avatar-webgl','1');
      canvas.setAttribute('role','presentation');
      canvas.tabIndex=-1;
      container.appendChild(canvas);

      const scene=new THREE.Scene();
      const camera=new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,-500,500);
      camera.position.set(0,0,200);

      const root=new THREE.Group();
      scene.add(root);

      const ambient=new THREE.AmbientLight(0xffffff,0.9);
      scene.add(ambient);
      const keyLight=new THREE.DirectionalLight(0xffffff,0.85);
      keyLight.position.set(180,240,320);
      scene.add(keyLight);
      const rimLight=new THREE.DirectionalLight(0xcad6ff,0.55);
      rimLight.position.set(-220,140,260);
      scene.add(rimLight);

      const shadowGeo=new THREE.CircleGeometry(1,48);
      const shadowMat=new THREE.MeshBasicMaterial({color:0x0f172a,transparent:true,opacity:0.22});
      const shadow=new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x=-Math.PI/2;
      shadow.position.z=-40;
      root.add(shadow);

      const chat=document.createElement('div');
      chat.className='avatar-chat-bubble';
      container.appendChild(chat);
      const name=document.createElement('div');
      name.className='avatar-name-label';
      container.appendChild(name);

      record={container, renderer, scene, camera, root, shadow, parts:new Map(), width, height, pixelRatio, chat, name};
      records.set(container, record);
    }else{
      if(pixelRatio!==record.pixelRatio){
        record.renderer.setPixelRatio(pixelRatio);
        record.pixelRatio=pixelRatio;
      }
      if(width!==record.width || height!==record.height){
        record.renderer.setSize(width, height, false);
        record.camera.left=-width/2;
        record.camera.right=width/2;
        record.camera.top=height/2;
        record.camera.bottom=-height/2;
        record.camera.updateProjectionMatrix();
        record.width=width;
        record.height=height;
      }
    }
    container.style.width=`${width}px`;
    container.style.height=`${height}px`;
    record.renderer.domElement.style.width=`${width}px`;
    record.renderer.domElement.style.height=`${height}px`;
    record.chat.style.display='none';
    record.name.style.display='none';
    return record;
  }

  function ensureMesh(record, key, type){
    let mesh=record.parts.get(key);
    if(mesh && mesh.userData.type!==type){
      record.root.remove(mesh);
      disposeMesh(mesh);
      mesh=null;
    }
    if(!mesh){
      let geometry;
      if(type==='circle'){
        geometry=new THREE.CircleGeometry(1,48);
      }else{
        geometry=new THREE.PlaneGeometry(1,1,1,1);
      }
      const material=new THREE.MeshStandardMaterial({
        vertexColors:true,
        roughness:0.85,
        metalness:0.12,
        transparent:true
      });
      mesh=new THREE.Mesh(geometry, material);
      mesh.userData.type=type;
      record.root.add(mesh);
      record.parts.set(key, mesh);
    }
    return mesh;
  }

  function removeMesh(record, key){
    const mesh=record.parts.get(key);
    if(mesh){
      record.root.remove(mesh);
      disposeMesh(mesh);
      record.parts.delete(key);
    }
  }

  function resolveSlotPalette(palette, slot, fallbackHex){
    const raw=palette && palette[slot] ? palette[slot] : {};
    const base=parseColor(raw.base || fallbackHex || '#6b7aa1');
    return {
      base,
      highlight: raw.highlight ? parseColor(raw.highlight) : shade(base, 0.22),
      shadow: raw.shadow ? parseColor(raw.shadow) : shade(base, -0.28)
    };
  }

  function resolveSkinPalette(hex){
    const base=parseColor(hex || '#e6caa6');
    return {
      base,
      highlight: shade(base, 0.18),
      shadow: shade(base, -0.3)
    };
  }

  function resolveHairPalette(hex){
    const base=parseColor(hex || '#2b2b2b');
    return {
      base,
      highlight: shade(base, 0.28),
      shadow: shade(base, -0.32)
    };
  }

  function applyPalette(mesh, palette){
    if(!mesh || !palette) return;
    mesh.material.color.copy(palette.base);
    setGradient(mesh.geometry, palette.highlight || palette.base, palette.shadow || palette.base);
    mesh.material.needsUpdate=true;
  }

  function updateShadow(record, footY, legWidth){
    if(!record.shadow) return;
    record.shadow.position.y=footY - legWidth*0.08;
    record.shadow.scale.set(legWidth*0.7, legWidth*0.42, 1);
  }

  function updateOverlays(record, character, options){
    const withName=options.withName!==false && !!character.name;
    if(withName){
      record.name.textContent=character.name;
      record.name.style.display='block';
      record.name.style.color=options.nameColor || '#111827';
      record.name.style.fontWeight=options.nameFontWeight || '600';
      record.name.style.fontSize=options.nameFontPx?`${options.nameFontPx}px`:'';
      record.name.style.fontFamily=options.nameFontFamily || options.fontFamily || '';
    }else{
      record.name.style.display='none';
    }
    const chatState=(options.showChat!==false && character.chat && character.chat.text)?character.chat:null;
    if(chatState){
      record.chat.textContent=chatState.text;
      record.chat.style.display='block';
      record.chat.style.fontSize=options.chatFontPx?`${options.chatFontPx}px`:'';
      record.chat.style.fontFamily=options.chatFontFamily || options.fontFamily || '';
      if(options.chatScale && options.chatScale!==1){
        record.chat.style.transform=`translate(-50%,0) scale(${options.chatScale})`;
        record.chat.style.transformOrigin='top center';
      }else{
        record.chat.style.transform='';
        record.chat.style.transformOrigin='';
      }
      if(options.chatMaxWidth){
        record.chat.style.maxWidth=`${options.chatMaxWidth}px`;
      }else{
        record.chat.style.maxWidth='';
      }
    }else{
      record.chat.style.display='none';
    }
  }

  function updateCharacter(record, character, options){
    const appearance=character.appearance || {};
    const equip=character.equip || {};
    const gender=character.gender || 'other';
    const scale=options.scale!=null?options.scale:1;
    const width=record.width || 220;
    const height=record.height || 260;
    const baseScale=Math.min(width/220, height/260)*scale;

    const footY=-height/2 + 36*baseScale;
    const legHeight=96*baseScale;
    const legWidth=54*baseScale;
    const torsoHeight=92*baseScale;
    const torsoWidth=72*baseScale;
    const headRadius=36*baseScale;
    const hairHeight=headRadius*1.6;
    const hairWidth=headRadius*2.25;
    const shoeHeight=28*baseScale;

    const legCenterY=footY + legHeight/2;
    const torsoCenterY=footY + legHeight + torsoHeight/2;
    const headCenterY=torsoCenterY + torsoHeight/2 + headRadius*0.92;

    const outfits=global.CharacterRenderer && global.CharacterRenderer.outfits;
    const baseOutfit=outfits ? (outfits[gender] || outfits.other || {}) : {};
    const basePalette=baseOutfit.palette || {};
    const slotPalette=(global.CharacterRenderer && typeof global.CharacterRenderer.getPalette==='function')
      ? global.CharacterRenderer.getPalette(gender, equip)
      : {};

    const torsoPalette=resolveSlotPalette(slotPalette, 'upper', basePalette?.upper?.base);
    const legPalette=resolveSlotPalette(slotPalette, 'lower', basePalette?.lower?.base);
    const shoePalette=resolveSlotPalette(slotPalette, 'shoes', basePalette?.shoes?.base);
    const cloakPalette=resolveSlotPalette(slotPalette, 'cloak', basePalette?.cloak?.base);
    const accessoryPalette=resolveSlotPalette(slotPalette, 'accessory', basePalette?.accessory?.base);
    const skinPalette=resolveSkinPalette(appearance.skin);
    const hairPalette=resolveHairPalette(appearance.hair);

    const legs=ensureMesh(record, 'legs', 'rect');
    legs.position.set(0, legCenterY, 0);
    legs.scale.set(legWidth, legHeight, 1);
    legs.renderOrder=0;
    applyPalette(legs, legPalette);

    const torso=ensureMesh(record, 'torso', 'rect');
    torso.position.set(0, torsoCenterY, 10);
    torso.scale.set(torsoWidth, torsoHeight, 1);
    torso.renderOrder=2;
    applyPalette(torso, torsoPalette);

    const head=ensureMesh(record, 'head', 'circle');
    head.position.set(0, headCenterY, 20);
    head.scale.set(headRadius, headRadius, 1);
    head.renderOrder=4;
    applyPalette(head, skinPalette);

    const hairBack=ensureMesh(record, 'hairBack', 'rect');
    hairBack.position.set(0, headCenterY + headRadius*0.1, 15);
    hairBack.scale.set(hairWidth*1.05, hairHeight, 1);
    hairBack.renderOrder=3;
    applyPalette(hairBack, hairPalette);

    const hairFront=ensureMesh(record, 'hairFront', 'rect');
    hairFront.position.set(0, headCenterY + headRadius*0.05, 30);
    hairFront.scale.set(hairWidth, hairHeight*0.72, 1);
    hairFront.renderOrder=6;
    applyPalette(hairFront, hairPalette);

    if(equip.cloak){
      const cloakHeight=torsoHeight + legHeight*0.85;
      const cloak=ensureMesh(record, 'cloak', 'rect');
      cloak.position.set(0, torsoCenterY - legHeight*0.12, -10);
      cloak.scale.set(torsoWidth*1.4, cloakHeight, 1);
      cloak.renderOrder=-6;
      applyPalette(cloak, cloakPalette);
    }else{
      removeMesh(record, 'cloak');
    }

    if(equip.accessory){
      const accessory=ensureMesh(record, 'accessory', 'rect');
      accessory.position.set(0, torsoCenterY + torsoHeight*0.18, 35);
      accessory.scale.set(torsoWidth*0.48, torsoHeight*0.22, 1);
      accessory.renderOrder=8;
      applyPalette(accessory, accessoryPalette);
    }else{
      removeMesh(record, 'accessory');
    }

    const shoes=ensureMesh(record, 'shoes', 'rect');
    shoes.position.set(0, footY + shoeHeight/2 - baseScale*4, 5);
    shoes.scale.set(legWidth*1.12, shoeHeight, 1);
    shoes.renderOrder=1;
    applyPalette(shoes, shoePalette);

    updateShadow(record, footY, legWidth);
  }

  function draw(container, character, options={}){
    if(!container || !character) return null;
    const width=Number.isFinite(options.width)?options.width:(container.clientWidth||220);
    const height=Number.isFinite(options.height)?options.height:(container.clientHeight||260);
    const pixelRatio=Number.isFinite(options.pixelRatio)?options.pixelRatio:(global.devicePixelRatio||1);
    const record=ensureRecord(container, width, height, pixelRatio);
    if(!record) return null;
    updateCharacter(record, character, options);
    updateOverlays(record, character, options);
    record.renderer.render(record.scene, record.camera);
    return {mode:'webgl', record};
  }

  function dispose(container){
    const record=records.get(container);
    if(!record) return;
    record.parts.forEach(mesh=>disposeMesh(mesh));
    record.parts.clear();
    if(record.shadow){
      record.root.remove(record.shadow);
      disposeMesh(record.shadow);
    }
    if(record.renderer){
      record.renderer.dispose();
      if(record.renderer.domElement && record.renderer.domElement.parentNode===container){
        container.removeChild(record.renderer.domElement);
      }
    }
    if(record.chat && record.chat.parentNode===container){
      container.removeChild(record.chat);
    }
    if(record.name && record.name.parentNode===container){
      container.removeChild(record.name);
    }
    records.delete(container);
  }

  global.WebGLCharacterRenderer={
    isSupported: ()=>SUPPORT,
    draw,
    dispose
  };
})(typeof window!=='undefined'?window:this);
