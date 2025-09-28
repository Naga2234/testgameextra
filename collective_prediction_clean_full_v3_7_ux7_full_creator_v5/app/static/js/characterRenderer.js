(function(global){
  if(!global) return;
  const avatar = global.AvatarDrawing || {};
  const drawHead = avatar.drawHead;
  const drawHair = avatar.drawHair;
  const drawExpression = avatar.drawExpression;
  const outfitLayers = global.AvatarOutfitLayers || {};
  const renderEquipmentLayers = typeof outfitLayers.renderEquipmentLayers === 'function'
    ? outfitLayers.renderEquipmentLayers
    : null;
  const hasHelpers = typeof drawHead === 'function' && typeof drawHair === 'function' && typeof drawExpression === 'function';

  const EMOTIONS = ['smile','neutral','frown','surprised','sleepy'];
  const DEFAULT_APPEARANCE = {
    skin: '#e6caa6',
    hair: '#2b2b2b',
    eyes: '#2b4c7e',
    style: 'short',
    emotion: 'smile'
  };

  const GENDER_OUTFITS = {
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
          trim:'#264d73',
          stroke:'#1b3854',
          equipped:{
            base:'#4c8fca',
            highlight:'#73b3ef',
            shadow:'#2c5f8f',
            trim:'#203d5c',
            stroke:'#15263c'
          }
        },
        lower:{
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
        cloak:{
          base:'#28507a',
          highlight:'#3e6e9d',
          shadow:'#1a3450',
          edge:'#13263b',
          stroke:'#0d1b2b',
          lining:'#4f81a8',
          equipped:{
            base:'#23496e',
            highlight:'#3c6c99',
            shadow:'#152c43',
            edge:'#101f31',
            stroke:'#0b1724',
            lining:'#4f81a8'
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

  function normalizeAppearance(raw){
    const base = Object.assign({}, DEFAULT_APPEARANCE, raw || {});
    if(!EMOTIONS.includes(base.emotion)){
      base.emotion = DEFAULT_APPEARANCE.emotion;
    }
    return base;
  }

  function mergeOutfitPalette(basePalette, equip){
    const slots=['upper','lower','cloak','shoes','accessory'];
    const merged={};
    slots.forEach(slot=>{
      const slotPalette=(basePalette||{})[slot]||{};
      const {equipped, ...defaults}=slotPalette;
      merged[slot]=Object.assign({}, defaults, (equip && equip[slot] && equipped)?equipped:{});
    });
    return merged;
  }

  function getOutfit(gender){
    return GENDER_OUTFITS[gender] || GENDER_OUTFITS.other;
  }

  function getPalette(gender, equip){
    const base=(getOutfit(gender)||{}).palette || {};
    return mergeOutfitPalette(base, equip || {});
  }

  function normalizeHexColor(value){
    if(typeof value !== 'string') return null;
    const match=value.trim().match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
    if(!match) return null;
    let raw=match[1];
    if(raw.length===3){
      raw=raw.split('').map(ch=>ch+ch).join('');
    }
    return raw.toLowerCase();
  }

  function shadeColor(hex, amount){
    const normalized=normalizeHexColor(hex);
    if(!normalized || !Number.isFinite(amount)) return hex;
    const clamp=v=>Math.max(0, Math.min(255, v));
    let r=parseInt(normalized.slice(0,2),16);
    let g=parseInt(normalized.slice(2,4),16);
    let b=parseInt(normalized.slice(4,6),16);
    const apply=(channel)=>{
      if(amount>=0){
        return clamp(Math.round(channel + (255-channel)*amount));
      }
      return clamp(Math.round(channel + channel*amount));
    };
    r=apply(r);
    g=apply(g);
    b=apply(b);
    const toHex=v=>v.toString(16).padStart(2,'0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function drawShadow(ctx, x, baselineY, scale){
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();
    const offset = 4*scale;
    ctx.ellipse(x, baselineY + offset, 10*scale, 4*scale, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawCharacter(ctx, character, options){
    if(!ctx || !hasHelpers) return null;
    const opts = Object.assign({
      scale: 1,
      withName: true,
      preview: false,
      showChat: true,
      shadow: true,
      fontFamily: 'Inter,system-ui',
      nameFontWeight: 500
    }, options || {});
    const scale = Number.isFinite(opts.scale) ? opts.scale : 1;
    const withName = opts.withName !== false;
    const charState = character || {};
    const x = Number.isFinite(charState.x) ? charState.x : 0;
    const y = Number.isFinite(charState.y) ? charState.y : 0;
    const genderKey = (opts.gender || charState.gender || 'other');
    const equip = Object.assign({}, charState.equip || {}, opts.equip || {});
    const appearance = normalizeAppearance(charState.appearance);
    const palette = opts.palette || getPalette(genderKey, equip);

    const baseX = x - 18*scale;
    const baseY = y - 24*scale;
    const shoeTop = baseY + 40*scale;
    const shoeHeight = equip.shoes ? 6*scale : 5*scale;
    const footBaseline = shoeTop + shoeHeight;
    const torsoX = baseX + 8*scale;
    const torsoY = baseY + 20*scale;
    const torsoWidth = 20*scale;
    const torsoHeight = 28*scale;
    const centerX = x;
    const defaultPreview = opts.preview || (!withName && scale >= (opts.previewScaleThreshold || 2.7));
    const headRadiusMultiplier = opts.headRadiusMultiplier != null ? opts.headRadiusMultiplier : (defaultPreview ? 12 : 6.5);
    const headRadius = headRadiusMultiplier * scale;
    const headCx = centerX;
    const headCy = torsoY - headRadius - 1.2*scale;
    const headTop = headCy - headRadius;
    const faceScale = headRadius / 36;
    const hairTop = headCy - (headRadius * 0.82);
    const rawNeckTop = headCy + headRadius - Math.max(2.4*scale, headRadius*0.24);
    const neckBaseY = torsoY + 1.6*scale;
    const neckTopY = Math.min(rawNeckTop, neckBaseY - 0.8*scale);
    const neckWidth = Math.max(6*scale, headRadius*0.78);
    const neckHalf = neckWidth/2;

    if(opts.shadow !== false){
      drawShadow(ctx, x, footBaseline, scale*0.9);
    }

    const shoulderY = torsoY + 4*scale;
    const chestY = torsoY + 9*scale;
    const waistY = torsoY + torsoHeight*0.55;
    const hipY = torsoY + torsoHeight;
    const hipSurfaceY = hipY - 0.6*scale;
    const handY = shoeTop - 1*scale;
    const kneeY = hipY + (shoeTop - hipY) * 0.55;

    const skinHighlight=shadeColor(appearance.skin, 0.16);
    const skinShadow=shadeColor(appearance.skin, -0.22);
    const skinDeepShadow=shadeColor(appearance.skin, -0.32);

    const drawArm=(startX, endX)=>{
      const direction=endX>=startX?1:-1;
      const elbowX=startX+(endX-startX)*0.58;
      const elbowY=shoulderY+(handY-shoulderY)*0.44;
      const wristY=handY-0.3*scale;
      const upperWidth=3.4*scale;
      const forearmWidth=2.6*scale;
      const wristWidth=1.8*scale;
      const grad=ctx.createLinearGradient(startX, shoulderY, endX, handY);
      grad.addColorStop(0, skinHighlight);
      grad.addColorStop(0.45, appearance.skin);
      grad.addColorStop(1, skinShadow);
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.moveTo(startX - direction*upperWidth*0.35, shoulderY - 0.2*scale);
      ctx.quadraticCurveTo(startX - direction*upperWidth, shoulderY + 2.8*scale, elbowX - direction*forearmWidth*0.75, elbowY);
      ctx.quadraticCurveTo(endX - direction*wristWidth*1.1, wristY, endX - direction*wristWidth*0.85, handY);
      ctx.quadraticCurveTo(endX + direction*wristWidth*0.85, handY, endX + direction*wristWidth*1.1, wristY);
      ctx.quadraticCurveTo(elbowX + direction*forearmWidth*0.75, elbowY, startX + direction*upperWidth, shoulderY + 2.8*scale);
      ctx.quadraticCurveTo(startX + direction*upperWidth*0.4, shoulderY - 0.35*scale, startX - direction*upperWidth*0.35, shoulderY - 0.2*scale);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.strokeStyle=direction>0?skinShadow:skinHighlight;
      ctx.lineWidth=0.7*scale;
      ctx.beginPath();
      ctx.moveTo(elbowX + direction*forearmWidth*0.65, elbowY + 0.25*scale);
      ctx.quadraticCurveTo(endX + direction*wristWidth, wristY + 0.4*scale, endX + direction*wristWidth*0.85, handY - 0.15*scale);
      ctx.stroke();
      ctx.strokeStyle=skinHighlight;
      ctx.globalAlpha=0.55;
      ctx.beginPath();
      ctx.moveTo(startX - direction*upperWidth*0.45, shoulderY + 0.9*scale);
      ctx.quadraticCurveTo(elbowX - direction*forearmWidth*0.85, elbowY, endX - direction*wristWidth*1.05, wristY + 0.25*scale);
      ctx.stroke();
      ctx.restore();
      return {
        direction,
        shoulderX:startX,
        shoulderY,
        elbowX,
        elbowY,
        wristX:endX,
        wristY:handY
      };
    };

    const drawLeg=(hipX, footX)=>{
      const direction=footX>=hipX?1:-1;
      const thighOuter=3.9*scale;
      const thighInner=2.6*scale;
      const kneeOuter=2.8*scale;
      const kneeInner=1.9*scale;
      const kneeX=hipX+(footX-hipX)*0.52;
      const hipCapY=hipSurfaceY;
      const ankleY=shoeTop;
      const innerHipX=hipX - direction*thighInner;
      const outerHipX=hipX + direction*thighOuter;
      const kneeInnerX=kneeX - direction*kneeInner;
      const kneeOuterX=kneeX + direction*kneeOuter;
      const ankleInnerX=footX - direction*1.35*scale;
      const ankleOuterX=footX + direction*1.9*scale;
      const grad=ctx.createLinearGradient(hipX, hipCapY-0.4*scale, hipX, ankleY);
      grad.addColorStop(0, skinHighlight);
      grad.addColorStop(0.5, appearance.skin);
      grad.addColorStop(1, skinShadow);
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.moveTo(innerHipX, hipCapY);
      ctx.quadraticCurveTo(hipX - direction*thighInner*0.5, hipY + 1.6*scale, kneeInnerX, kneeY);
      ctx.quadraticCurveTo(ankleInnerX - direction*0.3*scale, ankleY - 1.3*scale, ankleInnerX, ankleY);
      ctx.lineTo(ankleOuterX, ankleY);
      ctx.quadraticCurveTo(ankleOuterX - direction*0.35*scale, ankleY - 1.25*scale, kneeOuterX, kneeY - 0.2*scale);
      ctx.quadraticCurveTo(hipX + direction*thighOuter*0.95, hipY + 1.4*scale, outerHipX, hipCapY);
      ctx.quadraticCurveTo(hipX + direction*thighInner*0.2, hipCapY - 0.8*scale, innerHipX, hipCapY);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.strokeStyle=skinDeepShadow;
      ctx.lineWidth=0.9*scale;
      ctx.beginPath();
      ctx.moveTo(outerHipX, hipCapY + 0.4*scale);
      ctx.quadraticCurveTo(kneeOuterX, kneeY + 0.25*scale, ankleOuterX - direction*0.45*scale, ankleY - 0.4*scale);
      ctx.stroke();
      ctx.strokeStyle=skinHighlight;
      ctx.globalAlpha=0.5;
      ctx.beginPath();
      ctx.moveTo(innerHipX + direction*0.4*scale, hipCapY + 0.3*scale);
      ctx.quadraticCurveTo(kneeInnerX, kneeY + 0.6*scale, ankleInnerX + direction*0.25*scale, ankleY - 0.4*scale);
      ctx.stroke();
      ctx.restore();
      return {
        direction,
        hipX,
        hipY,
        hipCapY,
        hipInnerX:innerHipX,
        hipOuterX:outerHipX,
        kneeX,
        kneeY,
        kneeInnerX,
        kneeOuterX,
        ankleX:footX,
        ankleY,
        ankleInnerX,
        ankleOuterX
      };
    };

    const leftLegProfile=drawLeg(torsoX + 6*scale, torsoX + 5*scale);
    const rightLegProfile=drawLeg(torsoX + torsoWidth - 6*scale, torsoX + torsoWidth - 5*scale);

    const shoulderHalf=torsoWidth/2 + (genderKey==='male'?2.6:2.3)*scale;
    const chestHalf=shoulderHalf - 0.9*scale;
    const waistHalf=Math.max(4.2*scale, torsoWidth/2 - (genderKey==='female'?4.6:3.4)*scale);
    const hipHalf=Math.max(waistHalf + (genderKey==='female'?1.7:1.3)*scale, torsoWidth/2 - (genderKey==='female'?0.8:1.4)*scale);

    const torsoContour={
      neckTopY,
      neckBaseY,
      neckHalf,
      shoulderY,
      shoulderHalf,
      chestY,
      chestHalf,
      waistY,
      waistHalf,
      hipY:hipSurfaceY,
      hipHalf
    };

    const neckGrad=ctx.createLinearGradient(centerX, neckTopY, centerX, neckBaseY + 0.8*scale);
    neckGrad.addColorStop(0, skinHighlight);
    neckGrad.addColorStop(0.55, appearance.skin);
    neckGrad.addColorStop(1, skinShadow);
    ctx.fillStyle=neckGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - neckHalf*0.85, neckTopY);
    ctx.quadraticCurveTo(centerX - neckHalf, neckBaseY - 0.5*scale, centerX - neckHalf*0.55, neckBaseY);
    ctx.lineTo(centerX + neckHalf*0.55, neckBaseY);
    ctx.quadraticCurveTo(centerX + neckHalf, neckTopY + 0.25*scale, centerX + neckHalf*0.85, neckTopY);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.strokeStyle=skinShadow;
    ctx.lineWidth=0.7*scale;
    ctx.globalAlpha=0.6;
    ctx.beginPath();
    ctx.moveTo(centerX - neckHalf*0.38, neckTopY + 0.35*scale);
    ctx.lineTo(centerX - neckHalf*0.24, neckBaseY - 0.35*scale);
    ctx.moveTo(centerX + neckHalf*0.38, neckTopY + 0.35*scale);
    ctx.lineTo(centerX + neckHalf*0.24, neckBaseY - 0.35*scale);
    ctx.stroke();
    ctx.restore();

    const torsoGrad=ctx.createLinearGradient(centerX, neckBaseY, centerX, hipSurfaceY + 1.6*scale);
    torsoGrad.addColorStop(0, skinHighlight);
    torsoGrad.addColorStop(0.55, appearance.skin);
    torsoGrad.addColorStop(1, skinShadow);
    ctx.fillStyle=torsoGrad;
    ctx.beginPath();
    ctx.moveTo(centerX - neckHalf, neckBaseY);
    ctx.quadraticCurveTo(centerX - shoulderHalf, shoulderY - 0.8*scale, centerX - chestHalf, chestY);
    ctx.quadraticCurveTo(centerX - waistHalf, waistY, centerX - hipHalf, hipSurfaceY);
    ctx.quadraticCurveTo(centerX - hipHalf + 0.8*scale, hipSurfaceY + 1.6*scale, centerX - hipHalf + 0.4*scale, hipY);
    ctx.lineTo(centerX + hipHalf - 0.4*scale, hipY);
    ctx.quadraticCurveTo(centerX + hipHalf - 0.8*scale, hipSurfaceY + 1.6*scale, centerX + hipHalf, hipSurfaceY);
    ctx.quadraticCurveTo(centerX + waistHalf, waistY, centerX + chestHalf, chestY);
    ctx.quadraticCurveTo(centerX + shoulderHalf, shoulderY - 0.8*scale, centerX + neckHalf, neckBaseY);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.strokeStyle=skinDeepShadow;
    ctx.lineWidth=0.9*scale;
    ctx.beginPath();
    ctx.moveTo(centerX + chestHalf*0.85, chestY + 0.4*scale);
    ctx.quadraticCurveTo(centerX + waistHalf*0.9, waistY + 0.8*scale, centerX + hipHalf*0.85, hipSurfaceY + 1.3*scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - chestHalf*0.85, chestY + 0.4*scale);
    ctx.quadraticCurveTo(centerX - waistHalf*0.9, waistY + 0.8*scale, centerX - hipHalf*0.85, hipSurfaceY + 1.3*scale);
    ctx.stroke();
    ctx.strokeStyle=skinHighlight;
    ctx.globalAlpha=0.52;
    ctx.beginPath();
    ctx.moveTo(centerX, chestY - 0.4*scale);
    ctx.quadraticCurveTo(centerX - 0.2*scale, waistY + 0.4*scale, centerX, hipSurfaceY + 0.9*scale);
    ctx.stroke();
    ctx.restore();

    const leftArmProfile=drawArm(torsoX + 3.5*scale, torsoX - 2*scale);
    const rightArmProfile=drawArm(torsoX + torsoWidth - 3.5*scale, torsoX + torsoWidth + 2*scale);
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
      centerX,
      headCx,
      headCy,
      headRadius,
      torsoContour,
      legs:{left:leftLegProfile, right:rightLegProfile},
      neck:{top:neckTopY, base:neckBaseY, width:neckHalf*2},
      arms:{left:leftArmProfile, right:rightArmProfile}
    };

    if(renderEquipmentLayers){
      renderEquipmentLayers(ctx, metrics, equip, appearance, {
        phase: 'back',
        palette,
        scale,
        gender: genderKey,
        shadeColor,
        options: opts
      });
    }
    ctx.save();
    drawHair(ctx, appearance.style, appearance.hair, headCx, hairTop, faceScale, 'back');
    ctx.restore();
    drawHead(ctx, headCx, headCy, headRadius, appearance.skin);
    let deferredFrontLayers = null;
    if(renderEquipmentLayers){
      deferredFrontLayers = renderEquipmentLayers(ctx, metrics, equip, appearance, {
        phase: 'front',
        palette,
        scale,
        gender: genderKey,
        shadeColor,
        options: opts
      });
    }
    ctx.save();
    drawHair(ctx, appearance.style, appearance.hair, headCx, hairTop, faceScale, 'front');
    ctx.restore();
    if(deferredFrontLayers && Array.isArray(deferredFrontLayers.deferred)){
      deferredFrontLayers.deferred.forEach(fn=>{
        if(typeof fn === 'function'){
          fn();
        }
      });
    }
    drawExpression(ctx, appearance.emotion, headCx, headCy, appearance.eyes, faceScale);

    if(equip.head){
      ctx.fillStyle="#e94560";
      const hatTop = headTop - 3*scale;
      ctx.fillRect(headCx - headRadius, hatTop, headRadius * 2, 4*scale);
    }

    if(withName){
      const now=Date.now();
      const chat = (charState.chat && charState.chat.text && (!charState.chat.expiresAt || charState.chat.expiresAt>now)) ? charState.chat : null;
      if(chat && opts.showChat !== false){
        const bubbleScale=Math.max(1, opts.chatScale != null ? opts.chatScale : scale);
        const fontPx=opts.chatFontPx != null ? opts.chatFontPx : Math.max(12, Math.round(11*bubbleScale));
        const lineHeight=fontPx+Math.round(4*bubbleScale);
        const maxWidth=opts.chatMaxWidth != null ? opts.chatMaxWidth : 160*bubbleScale;
        ctx.save();
        ctx.font=`500 ${fontPx}px ${opts.chatFontFamily || opts.fontFamily}`;
        ctx.textAlign="center";
        const rawLines=String(chat.text).split(/\n/);
        const lines=[];
        rawLines.forEach(segment=>{
          const words=segment.split(/\s+/).filter(Boolean);
          if(!words.length){
            lines.push('');
            return;
          }
          let current='';
          words.forEach(word=>{
            const attempt=current?`${current} ${word}`:word;
            if(ctx.measureText(attempt).width<=maxWidth||!current){
              current=attempt;
            }else{
              lines.push(current);
              current=word;
            }
          });
          if(current){ lines.push(current); }
        });
        if(lines.length===0){ lines.push(String(chat.text)); }
        const textWidth=Math.max(...lines.map(line=>ctx.measureText(line).width));
        const paddingX=8*bubbleScale;
        const paddingY=6*bubbleScale;
        const bubbleWidth=textWidth+paddingX*2;
        const bubbleHeight=lines.length*lineHeight+paddingY*2;
        const pointerHeight=10*bubbleScale;
        const pointerHalfWidth=8*bubbleScale;
        const bubbleBottomTarget=headTop-4*bubbleScale;
        const bubbleY=Math.max(12, bubbleBottomTarget-pointerHeight-bubbleHeight);
        const bubbleX=x-bubbleWidth/2;
        const bubbleBottom=bubbleY+bubbleHeight;
        const pointerTipY=headTop-2*bubbleScale;
        ctx.fillStyle="rgba(17,24,39,0.92)";
        ctx.beginPath();
        const r=10*bubbleScale;
        ctx.moveTo(bubbleX+r, bubbleY);
        ctx.lineTo(bubbleX+bubbleWidth-r, bubbleY);
        ctx.quadraticCurveTo(bubbleX+bubbleWidth, bubbleY, bubbleX+bubbleWidth, bubbleY+r);
        ctx.lineTo(bubbleX+bubbleWidth, bubbleBottom-r);
        ctx.quadraticCurveTo(bubbleX+bubbleWidth, bubbleBottom, bubbleX+bubbleWidth-r, bubbleBottom);
        ctx.lineTo(bubbleX+r, bubbleBottom);
        ctx.quadraticCurveTo(bubbleX, bubbleBottom, bubbleX, bubbleBottom-r);
        ctx.lineTo(bubbleX, bubbleY+r);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX+r, bubbleY);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x-pointerHalfWidth, bubbleBottom);
        ctx.lineTo(x+pointerHalfWidth, bubbleBottom);
        ctx.lineTo(x, Math.max(pointerTipY, bubbleBottom+pointerHeight/2));
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#f9fafb";
        let textY=bubbleY+paddingY+fontPx;
        lines.forEach(line=>{
          ctx.fillText(line, x, textY);
          textY+=lineHeight;
        });
        ctx.restore();
      }
      const fontPx = opts.nameFontPx != null ? opts.nameFontPx : Math.round(12*scale);
      ctx.fillStyle=opts.nameColor || '#111827';
      ctx.textAlign='center';
      ctx.font = `${opts.nameFontWeight} ${fontPx}px ${opts.nameFontFamily || opts.fontFamily}`;
      if(charState.name){
        ctx.fillText(charState.name, x, baseY-18);
      }
    }

    return metrics;
  }

  global.CharacterRenderer = {
    isReady: ()=>hasHelpers,
    draw: drawCharacter,
    normalizeAppearance,
    mergePalette: mergeOutfitPalette,
    getOutfit,
    getPalette,
    outfits: GENDER_OUTFITS,
    defaultAppearance: Object.assign({}, DEFAULT_APPEARANCE)
  };
})(typeof window !== 'undefined' ? window : this);
