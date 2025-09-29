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

  function replaceGeometry(mesh, geometry){
    if(!mesh || !geometry) return;
    if(mesh.geometry){
      mesh.geometry.dispose();
    }
    mesh.geometry=geometry;
  }

  function baseLowerSeamInset(hasEquip, unit){
    return (hasEquip ? 1.1 : 0.7) * unit;
  }

  function normalizeGender(value){
    return typeof value==='string'?value.trim().toLowerCase():'';
  }

  function applyCachedOverlays(record){
    if(!record || !record.lastCharacter || !record.lastOptions) return;
    updateOverlays(record, record.lastCharacter, record.lastOptions);
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

      record={
        container,
        renderer,
        scene,
        camera,
        root,
        shadow,
        parts:new Map(),
        width,
        height,
        pixelRatio,
        chat,
        name,
        nameVisible:false,
        nameHover:false,
        nameClickTimer:null
      };

      record.pointerEnterHandler=()=>{
        record.nameHover=true;
        record.nameVisible=true;
        if(record.nameClickTimer){
          clearTimeout(record.nameClickTimer);
          record.nameClickTimer=null;
        }
        applyCachedOverlays(record);
      };
      record.pointerLeaveHandler=()=>{
        record.nameHover=false;
        record.nameVisible=false;
        if(record.nameClickTimer){
          clearTimeout(record.nameClickTimer);
          record.nameClickTimer=null;
        }
        applyCachedOverlays(record);
      };
      record.clickHandler=()=>{
        record.nameVisible=true;
        applyCachedOverlays(record);
        if(record.nameClickTimer){
          clearTimeout(record.nameClickTimer);
        }
        record.nameClickTimer=setTimeout(()=>{
          record.nameClickTimer=null;
          if(record.nameHover) return;
          record.nameVisible=false;
          applyCachedOverlays(record);
        }, 1600);
      };

      container.addEventListener('pointerenter', record.pointerEnterHandler);
      container.addEventListener('pointerleave', record.pointerLeaveHandler);
      container.addEventListener('click', record.clickHandler);
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
    const resolved={
      base,
      highlight: raw.highlight ? parseColor(raw.highlight) : shade(base, 0.22),
      shadow: raw.shadow ? parseColor(raw.shadow) : shade(base, -0.28)
    };
    if(raw.trim){
      resolved.trim=parseColor(raw.trim);
    }
    if(raw.edge){
      resolved.edge=parseColor(raw.edge);
    }
    if(raw.detail){
      resolved.detail=parseColor(raw.detail);
    }
    if(raw.accent){
      resolved.accent=parseColor(raw.accent);
    }
    return resolved;
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

  function tintPalette(palette, amount){
    if(!palette) return palette;
    const base=palette.base ? shade(palette.base, amount) : undefined;
    const highlight=palette.highlight ? shade(palette.highlight, amount*0.5) : undefined;
    const shadow=palette.shadow ? shade(palette.shadow, amount) : undefined;
    return {
      base: base || palette.base,
      highlight: highlight || palette.highlight,
      shadow: shadow || palette.shadow
    };
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
      record.name.style.color=options.nameColor || '#111827';
      record.name.style.fontWeight=options.nameFontWeight || '600';
      const fontSize=options.nameFontPx || 12;
      record.name.style.fontSize=`${fontSize}px`;
      record.name.style.fontFamily=options.nameFontFamily || options.fontFamily || '';
      record.name.style.display=record.nameVisible?'block':'none';
    }else{
      record.nameVisible=false;
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

    const torsoTopY=torsoCenterY + torsoHeight/2;
    const torsoBottomY=torsoCenterY - torsoHeight/2;
    const shoulderTopY=torsoTopY - baseScale*6;
    const wristY=torsoBottomY + baseScale*10;
    const armSpan=shoulderTopY - wristY;
    const upperArmHeight=armSpan*0.5;
    const forearmHeight=armSpan*0.32;
    const handHeight=Math.max(armSpan - upperArmHeight - forearmHeight, baseScale*10);
    const armWidth=torsoWidth*0.32;
    const forearmWidth=armWidth*0.94;
    const handWidth=armWidth*1.05;
    const shoulderOffsetX=torsoWidth/2 + armWidth*0.55;

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

    const hasUpperEquip=!!equip.upper;
    const hasLowerEquip=!!equip.lower;
    const normalizedGender=normalizeGender(gender);

    const contourUnit=torsoWidth/20;
    const torsoTopWorld=torsoCenterY + torsoHeight/2;
    const torsoBottomWorld=torsoCenterY - torsoHeight/2;
    const toTorsoLocalY=(value)=>value - torsoCenterY;

    const neckBaseWorld=torsoTopWorld;
    const shoulderWorld=torsoTopWorld - 4*contourUnit;
    const chestWorld=torsoTopWorld - 8*contourUnit;
    const waistWorld=torsoTopWorld - torsoHeight*0.55;
    const hipWorld=torsoBottomWorld + 1.1*contourUnit;

    const neckHalf=torsoWidth/2;
    const shoulderHalf=neckHalf + 2*contourUnit;
    const chestHalf=shoulderHalf - 0.8*contourUnit;
    const waistHalf=chestHalf - 2.4*contourUnit;
    const hipHalf=waistHalf + 1.4*contourUnit;

    const collarDrop=(hasUpperEquip?0.45:0.2)*contourUnit;
    const collarDip=(hasUpperEquip?1.8:1.1)*contourUnit;
    const outerOffset=(hasUpperEquip?1.6:0.9)*contourUnit;
    const hemSpread=(hasUpperEquip?1.8:1.2)*contourUnit;
    const waistEase=(hasUpperEquip?0.6:(normalizedGender==='female'?0.4:0.1))*contourUnit;

    const upperShape=new THREE.Shape();
    upperShape.moveTo(-neckHalf - outerOffset*0.4, toTorsoLocalY(neckBaseWorld) - collarDrop);
    upperShape.quadraticCurveTo(-neckHalf*0.6, toTorsoLocalY(neckBaseWorld) - collarDrop - collarDip, 0, toTorsoLocalY(neckBaseWorld) - collarDrop - collarDip*0.75);
    upperShape.quadraticCurveTo(neckHalf*0.6, toTorsoLocalY(neckBaseWorld) - collarDrop - collarDip, neckHalf + outerOffset*0.4, toTorsoLocalY(neckBaseWorld) - collarDrop);
    upperShape.quadraticCurveTo(shoulderHalf + outerOffset, toTorsoLocalY(shoulderWorld), chestHalf + outerOffset*0.5, toTorsoLocalY(chestWorld));
    upperShape.quadraticCurveTo(waistHalf + waistEase, toTorsoLocalY(waistWorld) - 0.4*contourUnit, hipHalf + hemSpread, toTorsoLocalY(hipWorld));
    upperShape.quadraticCurveTo(0, toTorsoLocalY(hipWorld) - 0.8*contourUnit, -(hipHalf + hemSpread), toTorsoLocalY(hipWorld));
    upperShape.quadraticCurveTo(-(waistHalf + waistEase), toTorsoLocalY(waistWorld) - 0.4*contourUnit, -(chestHalf + outerOffset*0.5), toTorsoLocalY(chestWorld));
    upperShape.quadraticCurveTo(-(shoulderHalf + outerOffset), toTorsoLocalY(shoulderWorld), -(neckHalf + outerOffset*0.4), toTorsoLocalY(neckBaseWorld) - collarDrop);
    upperShape.closePath();

    const torso=ensureMesh(record, 'torso', 'shape');
    replaceGeometry(torso, new THREE.ShapeGeometry(upperShape, 48));
    torso.position.set(0, torsoCenterY, 10);
    torso.scale.set(1,1,1);
    torso.renderOrder=2;
    applyPalette(torso, torsoPalette);

    const beltColor=torsoPalette.trim || torsoPalette.edge;
    if(beltColor){
      const beltHeight=Math.max(contourUnit, 1.6*contourUnit);
      const beltYOffset=0.6*contourUnit;
      const beltYWorld=waistWorld - beltYOffset;
      const beltBottomWorld=beltYWorld - beltHeight;
      const beltShape=new THREE.Shape();
      beltShape.moveTo(-(waistHalf + 0.8*contourUnit), toTorsoLocalY(beltYWorld));
      beltShape.quadraticCurveTo(0, toTorsoLocalY(beltYWorld) - 0.4*contourUnit, waistHalf + 0.8*contourUnit, toTorsoLocalY(beltYWorld));
      beltShape.lineTo(waistHalf + 0.7*contourUnit, toTorsoLocalY(beltBottomWorld));
      beltShape.quadraticCurveTo(0, toTorsoLocalY(beltBottomWorld) - 0.35*contourUnit, -(waistHalf + 0.7*contourUnit), toTorsoLocalY(beltBottomWorld));
      beltShape.closePath();
      const beltMesh=ensureMesh(record, 'torsoBelt', 'shape');
      replaceGeometry(beltMesh, new THREE.ShapeGeometry(beltShape, 24));
      beltMesh.position.set(0, torsoCenterY, 11);
      beltMesh.scale.set(1,1,1);
      beltMesh.renderOrder=2.4;
      beltMesh.material.color.copy(beltColor);
      setGradient(beltMesh.geometry, shade(beltColor, 0.18), shade(beltColor, -0.12));
      beltMesh.material.needsUpdate=true;
    }else{
      removeMesh(record, 'torsoBelt');
    }

    if(torsoPalette.highlight && hasUpperEquip){
      const seamOffset=0;
      const highlightWidth=Math.max(0.6*contourUnit, 0.85*contourUnit);
      const seamTop=toTorsoLocalY(neckBaseWorld) - collarDrop - collarDip*0.5;
      const seamBottom=toTorsoLocalY(hipWorld + 0.3*contourUnit);
      const halfHighlight=highlightWidth/2;
      const highlightShape=new THREE.Shape();
      highlightShape.moveTo(seamOffset - halfHighlight, seamTop);
      highlightShape.lineTo(seamOffset + halfHighlight, seamTop);
      highlightShape.lineTo(seamOffset + halfHighlight, seamBottom);
      highlightShape.lineTo(seamOffset - halfHighlight, seamBottom);
      highlightShape.closePath();
      const highlightMesh=ensureMesh(record, 'torsoHighlight', 'shape');
      replaceGeometry(highlightMesh, new THREE.ShapeGeometry(highlightShape, 4));
      highlightMesh.position.set(0, torsoCenterY, 12);
      highlightMesh.scale.set(1,1,1);
      highlightMesh.renderOrder=2.6;
      highlightMesh.material.color.copy(torsoPalette.highlight);
      setGradient(highlightMesh.geometry, torsoPalette.highlight, torsoPalette.highlight);
      highlightMesh.material.needsUpdate=true;
    }else{
      removeMesh(record, 'torsoHighlight');
    }

    const legUnit=contourUnit;
    const hipTopWorld=hipWorld + 0.4*legUnit;
    const kneeWorld=hipWorld - (hipWorld - (footY + shoeHeight))*0.55;
    const hemWorld=(footY + shoeHeight) - 0.3*legUnit;
    const toLegLocalY=(value)=>value - legCenterY;

    const hipOuter=Math.min(hipHalf + (hasLowerEquip?1.3:0.8)*legUnit, legWidth/2 + 0.9*legUnit);
    const hipInner=baseLowerSeamInset(hasLowerEquip, legUnit)*0.45;
    const kneeOuter=Math.max(legWidth/2 - 1.2*legUnit, hipOuter - 2.2*legUnit);
    const kneeInner=baseLowerSeamInset(hasLowerEquip, legUnit)*0.35;
    const ankleOuter=Math.max(legWidth/2 - 1.4*legUnit, kneeOuter - 1.6*legUnit);
    const ankleInner=baseLowerSeamInset(hasLowerEquip, legUnit)*0.18;
    const hemInset=hasLowerEquip?0.4*legUnit:0.25*legUnit;
    const seamRise=0.5*legUnit;

    const lowerShape=new THREE.Shape();
    lowerShape.moveTo(-(hipOuter), toLegLocalY(hipTopWorld));
    lowerShape.quadraticCurveTo(-(kneeOuter), toLegLocalY(kneeWorld + 0.2*legUnit), -(ankleOuter), toLegLocalY(hemWorld));
    lowerShape.lineTo(-(ankleInner + hemInset), toLegLocalY(hemWorld));
    lowerShape.quadraticCurveTo(-kneeInner, toLegLocalY(kneeWorld), -hipInner, toLegLocalY(hipWorld - 0.2*legUnit));
    lowerShape.quadraticCurveTo(0, toLegLocalY(hipWorld - seamRise), hipInner, toLegLocalY(hipWorld - 0.2*legUnit));
    lowerShape.quadraticCurveTo(kneeInner, toLegLocalY(kneeWorld), ankleInner + hemInset, toLegLocalY(hemWorld));
    lowerShape.lineTo(ankleOuter, toLegLocalY(hemWorld));
    lowerShape.quadraticCurveTo(kneeOuter, toLegLocalY(kneeWorld + 0.2*legUnit), hipOuter, toLegLocalY(hipTopWorld));
    lowerShape.quadraticCurveTo(0, toLegLocalY(hipTopWorld - 1.4*legUnit), -hipOuter, toLegLocalY(hipTopWorld));
    lowerShape.closePath();

    const legs=ensureMesh(record, 'legs', 'shape');
    replaceGeometry(legs, new THREE.ShapeGeometry(lowerShape, 48));
    legs.position.set(0, legCenterY, 0);
    legs.scale.set(1,1,1);
    legs.renderOrder=0;
    applyPalette(legs, legPalette);

    const legSeamColor=legPalette.highlight || legPalette.trim;
    if(legSeamColor){
      const seamWidth=Math.max(0.5*legUnit, 0.8*legUnit);
      const seamHalf=seamWidth/2;
      const seamTop=toLegLocalY(hipWorld - 0.2*legUnit);
      const seamBottom=toLegLocalY((footY + shoeHeight) - 0.8*legUnit);
      const seamShape=new THREE.Shape();
      seamShape.moveTo(-seamHalf, seamTop);
      seamShape.lineTo(seamHalf, seamTop);
      seamShape.lineTo(seamHalf, seamBottom);
      seamShape.lineTo(-seamHalf, seamBottom);
      seamShape.closePath();
      const seamMesh=ensureMesh(record, 'legSeam', 'shape');
      replaceGeometry(seamMesh, new THREE.ShapeGeometry(seamShape, 4));
      seamMesh.position.set(0, legCenterY, 1);
      seamMesh.scale.set(1,1,1);
      seamMesh.renderOrder=0.6;
      seamMesh.material.color.copy(legSeamColor);
      setGradient(seamMesh.geometry, legSeamColor, shade(legSeamColor, -0.25));
      seamMesh.material.needsUpdate=true;
    }else{
      removeMesh(record, 'legSeam');
    }

    const cuffColor=legPalette.trim || legPalette.edge;
    if(cuffColor){
      const cuffHeight=Math.max(0.8*legUnit, 1.3*legUnit);
      const cuffTop=toLegLocalY((footY + shoeHeight) - 0.45*legUnit);
      const cuffBottom=cuffTop - cuffHeight;
      const cuffShape=new THREE.Shape();
      const cuffWidth=legWidth/2 - 0.4*legUnit;
      cuffShape.moveTo(-cuffWidth, cuffTop);
      cuffShape.lineTo(cuffWidth, cuffTop);
      cuffShape.lineTo(cuffWidth, cuffBottom);
      cuffShape.lineTo(-cuffWidth, cuffBottom);
      cuffShape.closePath();
      const cuffMesh=ensureMesh(record, 'legCuff', 'shape');
      replaceGeometry(cuffMesh, new THREE.ShapeGeometry(cuffShape, 4));
      cuffMesh.position.set(0, legCenterY, 0.8);
      cuffMesh.scale.set(1,1,1);
      cuffMesh.renderOrder=0.4;
      cuffMesh.material.color.copy(cuffColor);
      setGradient(cuffMesh.geometry, shade(cuffColor, 0.14), shade(cuffColor, -0.16));
      cuffMesh.material.needsUpdate=true;
    }else{
      removeMesh(record, 'legCuff');
    }

    const head=ensureMesh(record, 'head', 'circle');
    head.position.set(0, headCenterY, 20);
    head.scale.set(headRadius, headRadius, 1);
    head.renderOrder=4;
    applyPalette(head, skinPalette);

    const leftUpperArm=ensureMesh(record, 'armLeftUpper', 'rect');
    leftUpperArm.position.set(-shoulderOffsetX, shoulderTopY - upperArmHeight/2, 12);
    leftUpperArm.scale.set(armWidth, upperArmHeight, 1);
    leftUpperArm.renderOrder=3;
    applyPalette(leftUpperArm, skinPalette);

    const rightUpperArm=ensureMesh(record, 'armRightUpper', 'rect');
    rightUpperArm.position.set(shoulderOffsetX, shoulderTopY - upperArmHeight/2, 12);
    rightUpperArm.scale.set(armWidth, upperArmHeight, 1);
    rightUpperArm.renderOrder=3;
    applyPalette(rightUpperArm, skinPalette);

    const leftForearm=ensureMesh(record, 'armLeftFore', 'rect');
    const leftForearmCenterY=shoulderTopY - upperArmHeight - forearmHeight/2;
    leftForearm.position.set(-shoulderOffsetX + baseScale*1.5, leftForearmCenterY, 13);
    leftForearm.scale.set(forearmWidth, forearmHeight, 1);
    leftForearm.renderOrder=3.5;
    applyPalette(leftForearm, skinPalette);

    const rightForearm=ensureMesh(record, 'armRightFore', 'rect');
    const rightForearmCenterY=shoulderTopY - upperArmHeight - forearmHeight/2;
    rightForearm.position.set(shoulderOffsetX - baseScale*1.5, rightForearmCenterY, 13);
    rightForearm.scale.set(forearmWidth, forearmHeight, 1);
    rightForearm.renderOrder=3.5;
    applyPalette(rightForearm, skinPalette);

    const handPalette=tintPalette(skinPalette, -0.08);

    const leftHand=ensureMesh(record, 'armLeftHand', 'rect');
    const leftHandCenterY=leftForearmCenterY - forearmHeight/2 - handHeight/2;
    leftHand.position.set(-shoulderOffsetX + baseScale*1.2, leftHandCenterY, 14);
    leftHand.scale.set(handWidth, handHeight, 1);
    leftHand.renderOrder=4.5;
    applyPalette(leftHand, handPalette);

    const rightHand=ensureMesh(record, 'armRightHand', 'rect');
    const rightHandCenterY=rightForearmCenterY - forearmHeight/2 - handHeight/2;
    rightHand.position.set(shoulderOffsetX - baseScale*1.2, rightHandCenterY, 14);
    rightHand.scale.set(handWidth, handHeight, 1);
    rightHand.renderOrder=4.5;
    applyPalette(rightHand, handPalette);

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
    record.lastCharacter=character;
    record.lastOptions=options;
    updateCharacter(record, character, options);
    updateOverlays(record, character, options);
    record.renderer.render(record.scene, record.camera);
    return {mode:'webgl', record};
  }

  function dispose(container){
    const record=records.get(container);
    if(!record) return;
    if(record.nameClickTimer){
      clearTimeout(record.nameClickTimer);
      record.nameClickTimer=null;
    }
    if(record.pointerEnterHandler){
      container.removeEventListener('pointerenter', record.pointerEnterHandler);
    }
    if(record.pointerLeaveHandler){
      container.removeEventListener('pointerleave', record.pointerLeaveHandler);
    }
    if(record.clickHandler){
      container.removeEventListener('click', record.clickHandler);
    }
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
