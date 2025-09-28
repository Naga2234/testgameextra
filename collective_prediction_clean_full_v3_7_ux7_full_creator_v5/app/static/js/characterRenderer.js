(function(global){
  if(!global) return;
  const avatar = global.AvatarDrawing || {};
  const drawHead = avatar.drawHead;
  const drawHair = avatar.drawHair;
  const drawExpression = avatar.drawExpression;
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

  function drawShadow(ctx, x, baselineY, scale){
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath();
    const offset = 4*scale;
    ctx.ellipse(x, baselineY + offset, 10*scale, 4*scale, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function drawUpperOutfit(ctx, palette, metrics, scale, options){
    const {torsoX, torsoY, torsoWidth, torsoHeight, centerX}=metrics;
    const {equip={}, gender='other'}=options || {};
    const hasEquip=!!equip.upper;
    const colors=palette.upper||{};
    const baseColor=colors.base||'#5c7ab2';
    const highlight=colors.highlight||baseColor;
    const shadow=colors.shadow||baseColor;
    ctx.save();
    const grad=ctx.createLinearGradient(torsoX, torsoY, torsoX, torsoY+torsoHeight);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.55, baseColor);
    grad.addColorStop(1, shadow);
    ctx.fillStyle=grad;
    ctx.beginPath();
    if(!hasEquip && gender==='female'){
      ctx.moveTo(torsoX-2*scale, torsoY+5*scale);
      ctx.quadraticCurveTo(centerX, torsoY-4*scale, torsoX+torsoWidth+2*scale, torsoY+5*scale);
      ctx.lineTo(torsoX+torsoWidth-5*scale, torsoY+torsoHeight-1*scale);
      ctx.quadraticCurveTo(centerX, torsoY+torsoHeight+5*scale, torsoX+5*scale, torsoY+torsoHeight-1*scale);
    }else{
      ctx.moveTo(torsoX-2*scale, torsoY+4*scale);
      ctx.quadraticCurveTo(centerX, torsoY-2*scale, torsoX+torsoWidth+2*scale, torsoY+4*scale);
      ctx.lineTo(torsoX+torsoWidth-3*scale, torsoY+torsoHeight-3*scale);
      ctx.quadraticCurveTo(centerX, torsoY+torsoHeight+1.5*scale, torsoX+3*scale, torsoY+torsoHeight-3*scale);
    }
    ctx.closePath();
    ctx.fill();

    if(colors.stroke){
      ctx.strokeStyle=colors.stroke;
      ctx.lineWidth=Math.max(1,1.2*scale);
      ctx.stroke();
    }

    if(colors.trim){
      const beltHeight=Math.max(1.6*scale, scale);
      const beltY=torsoY+torsoHeight*0.55;
      ctx.fillStyle=colors.trim;
      ctx.beginPath();
      ctx.moveTo(torsoX+4*scale, beltY);
      ctx.quadraticCurveTo(centerX, beltY+0.5*scale, torsoX+torsoWidth-4*scale, beltY);
      ctx.lineTo(torsoX+torsoWidth-5*scale, beltY+beltHeight);
      ctx.quadraticCurveTo(centerX, beltY+beltHeight+0.5*scale, torsoX+5*scale, beltY+beltHeight);
      ctx.closePath();
      ctx.fill();
    }

    if(colors.highlight && hasEquip){
      ctx.strokeStyle=colors.highlight;
      ctx.lineWidth=0.8*scale;
      ctx.beginPath();
      ctx.moveTo(centerX, torsoY+3*scale);
      ctx.lineTo(centerX, torsoY+torsoHeight-4*scale);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawLowerOutfit(ctx, palette, metrics, scale, options){
    const {torsoX, torsoWidth, hipY, kneeY, shoeTop, centerX}=metrics;
    const {equip={}, gender='other'}=options || {};
    const hasEquip=!!equip.lower;
    const colors=palette.lower||{};
    const baseColor=colors.base||'#4a668d';
    const highlight=colors.highlight||baseColor;
    const shadow=colors.shadow||baseColor;
    ctx.save();
    const grad=ctx.createLinearGradient(torsoX, hipY, torsoX, shoeTop);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.65, baseColor);
    grad.addColorStop(1, shadow);
    const drawTrim=()=>{
      if(!colors.trim) return;
      ctx.strokeStyle=colors.trim;
      ctx.lineWidth=0.8*scale;
      ctx.beginPath();
      ctx.moveTo(torsoX+4*scale, hipY+1.5*scale);
      ctx.quadraticCurveTo(centerX, hipY+4*scale, torsoX+torsoWidth-4*scale, hipY+1.5*scale);
      ctx.stroke();
    };

    if(!hasEquip && gender==='female'){
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.moveTo(torsoX+2*scale, hipY);
      ctx.quadraticCurveTo(centerX, hipY+6*scale, torsoX+torsoWidth-2*scale, hipY);
      ctx.lineTo(torsoX+torsoWidth+4*scale, shoeTop-1*scale);
      ctx.quadraticCurveTo(centerX, shoeTop+4*scale, torsoX-0.5*scale, shoeTop-1*scale);
      ctx.closePath();
      ctx.fill();
      if(colors.stroke){
        ctx.strokeStyle=colors.stroke;
        ctx.lineWidth=Math.max(1,1.1*scale);
        ctx.stroke();
      }
      drawTrim();
      ctx.restore();
      return;
    }

    const legInset=3*scale;
    const crotchWidth=4*scale;
    const legWidth=(torsoWidth-crotchWidth)/2;
    ctx.fillStyle=grad;

    ctx.beginPath();
    ctx.moveTo(torsoX+legInset, hipY);
    ctx.quadraticCurveTo(torsoX+legInset+legWidth*0.2, kneeY, torsoX+4*scale, shoeTop);
    ctx.lineTo(torsoX+12*scale, shoeTop);
    ctx.quadraticCurveTo(torsoX+legInset+legWidth*0.8, kneeY-2*scale, centerX-crotchWidth/2, hipY+2*scale);
    ctx.lineTo(centerX-crotchWidth/2, hipY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX+crotchWidth/2, hipY);
    ctx.lineTo(centerX+crotchWidth/2, hipY+2*scale);
    ctx.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.8, kneeY-2*scale, torsoX+torsoWidth-4*scale, shoeTop);
    ctx.lineTo(torsoX+torsoWidth-4*scale, shoeTop);
    ctx.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.2, kneeY, torsoX+torsoWidth-legInset, hipY);
    ctx.closePath();
    ctx.fill();

    if(colors.stroke){
      ctx.strokeStyle=colors.stroke;
      ctx.lineWidth=Math.max(1,1.05*scale);

      ctx.beginPath();
      ctx.moveTo(torsoX+legInset, hipY);
      ctx.quadraticCurveTo(torsoX+legInset+legWidth*0.2, kneeY, torsoX+4*scale, shoeTop);
      ctx.lineTo(torsoX+12*scale, shoeTop);
      ctx.quadraticCurveTo(torsoX+legInset+legWidth*0.8, kneeY-2*scale, centerX-crotchWidth/2, hipY+2*scale);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX+crotchWidth/2, hipY+2*scale);
      ctx.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.8, kneeY-2*scale, torsoX+torsoWidth-4*scale, shoeTop);
      ctx.lineTo(torsoX+torsoWidth-4*scale, shoeTop);
      ctx.quadraticCurveTo(torsoX+torsoWidth-legInset-legWidth*0.2, kneeY, torsoX+torsoWidth-legInset, hipY);
      ctx.stroke();
    }

    drawTrim();
    ctx.restore();
  }

  function drawAccessories(ctx, palette, metrics, scale, equip, phase){
    const {torsoX, torsoY, torsoWidth, torsoHeight, shoeTop, shoeHeight, footBaseline, centerX, headCy, headRadius}=metrics;
    const equipment = equip || {};
    const currentPhase = phase || 'front';
    if(currentPhase==='back' && equipment.cloak){
      const colors=palette.cloak||{};
      ctx.save();
      const grad=ctx.createLinearGradient(centerX, torsoY, centerX, footBaseline);
      grad.addColorStop(0, colors.highlight||colors.base||'#0f3460');
      grad.addColorStop(0.7, colors.base||'#0f3460');
      grad.addColorStop(1, colors.shadow||colors.edge||'#071f2a');
      ctx.fillStyle=grad;
      const topY=torsoY+2*scale;
      ctx.beginPath();
      ctx.moveTo(torsoX-5*scale, topY);
      ctx.quadraticCurveTo(centerX-6*scale, headCy+headRadius*0.6, torsoX-4*scale, footBaseline-2*scale);
      ctx.quadraticCurveTo(centerX, footBaseline+6*scale, torsoX+torsoWidth+4*scale, footBaseline-2*scale);
      ctx.quadraticCurveTo(centerX+6*scale, headCy+headRadius*0.6, torsoX+torsoWidth+5*scale, topY);
      ctx.closePath();
      ctx.fill();
      const edgeColor=colors.edge||colors.stroke;
      if(edgeColor){
        ctx.strokeStyle=edgeColor;
        ctx.lineWidth=Math.max(1,1.4*scale);
        ctx.stroke();
      }
      if(colors.lining){
        ctx.strokeStyle=colors.lining;
        ctx.lineWidth=0.9*scale;
        ctx.beginPath();
        ctx.moveTo(torsoX-3*scale, topY+2*scale);
        ctx.quadraticCurveTo(centerX-5*scale, headCy+headRadius*0.7, torsoX-2*scale, footBaseline-3*scale);
        ctx.moveTo(torsoX+torsoWidth+3*scale, topY+2*scale);
        ctx.quadraticCurveTo(centerX+5*scale, headCy+headRadius*0.7, torsoX+torsoWidth+2*scale, footBaseline-3*scale);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    if(currentPhase!=='front') return;

    const shoeColors=palette.shoes||{};
    ctx.save();
    const shoeGrad=ctx.createLinearGradient(centerX, shoeTop, centerX, shoeTop+shoeHeight);
    shoeGrad.addColorStop(0, shoeColors.highlight||shoeColors.base||'#666');
    shoeGrad.addColorStop(0.6, shoeColors.base||'#444');
    shoeGrad.addColorStop(1, shoeColors.shadow||shoeColors.trim||'#222');
    ctx.fillStyle=shoeGrad;
    const leftToe=torsoX+3*scale;
    const rightToe=torsoX+torsoWidth+5*scale;
    ctx.beginPath();
    ctx.moveTo(leftToe, shoeTop);
    ctx.quadraticCurveTo(leftToe-2*scale, shoeTop+shoeHeight*0.7, leftToe+2*scale, shoeTop+shoeHeight);
    ctx.lineTo(rightToe-2*scale, shoeTop+shoeHeight);
    ctx.quadraticCurveTo(rightToe+2*scale, shoeTop+shoeHeight*0.7, rightToe-2*scale, shoeTop);
    ctx.closePath();
    ctx.fill();
    if(shoeColors.stroke){
      ctx.strokeStyle=shoeColors.stroke;
      ctx.lineWidth=Math.max(1,1.2*scale);
      ctx.stroke();
    }
    if(shoeColors.trim){
      ctx.strokeStyle=shoeColors.trim;
      ctx.lineWidth=0.8*scale;
      ctx.beginPath();
      ctx.moveTo(leftToe+4*scale, shoeTop+shoeHeight*0.35);
      ctx.quadraticCurveTo(centerX, shoeTop+shoeHeight*0.15, rightToe-6*scale, shoeTop+shoeHeight*0.35);
      ctx.stroke();
    }
    ctx.restore();

    if(!equipment.accessory) return;

    const accColors=palette.accessory||{};
    const baseColor=accColors.base||'#f8b500';
    const highlight=accColors.highlight||baseColor;
    const shadow=accColors.shadow||accColors.stroke||baseColor;
    const chainColor=accColors.chain||highlight;
    const medallionRadius=3.4*scale;
    const chainTop=torsoY+2.5*scale;
    const chainBottom=torsoY+6.5*scale;
    ctx.save();
    ctx.strokeStyle=chainColor;
    ctx.lineWidth=Math.max(0.9*scale,0.7);
    ctx.beginPath();
    ctx.moveTo(centerX-6*scale, chainTop);
    ctx.quadraticCurveTo(centerX, chainBottom-2*scale, centerX+6*scale, chainTop);
    ctx.stroke();

    const radial=ctx.createRadialGradient(centerX, chainBottom, medallionRadius*0.2, centerX, chainBottom, medallionRadius);
    radial.addColorStop(0, highlight);
    radial.addColorStop(0.7, baseColor);
    radial.addColorStop(1, shadow);
    ctx.fillStyle=radial;
    ctx.beginPath();
    ctx.arc(centerX, chainBottom, medallionRadius, 0, Math.PI*2);
    ctx.fill();

    if(accColors.stroke){
      ctx.strokeStyle=accColors.stroke;
      ctx.lineWidth=Math.max(0.9*scale,0.6);
      ctx.stroke();
    }
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

    if(opts.shadow !== false){
      drawShadow(ctx, x, footBaseline, scale*0.9);
    }

    const shoulderY = torsoY + 4*scale;
    const handY = shoeTop - 1*scale;
    const hipY = torsoY + torsoHeight;
    const kneeY = hipY + (shoeTop - hipY) * 0.55;

    ctx.fillStyle = appearance.skin;

    const drawArm=(startX, endX)=>{
      const thickness = 2.4*scale;
      const elbowX = (startX + endX) / 2;
      const elbowY = shoulderY + (handY - shoulderY) * 0.45;
      ctx.beginPath();
      ctx.moveTo(startX - thickness, shoulderY);
      ctx.bezierCurveTo(elbowX - thickness * 0.8, elbowY, endX - thickness * 0.6, handY - thickness * 0.1, endX - thickness * 0.3, handY);
      ctx.lineTo(endX + thickness * 0.3, handY);
      ctx.bezierCurveTo(endX + thickness * 0.6, handY - thickness * 0.1, elbowX + thickness * 0.8, elbowY, startX + thickness, shoulderY);
      ctx.closePath();
      ctx.fill();
    };

    const drawLeg=(hipX, footX)=>{
      const thickness = 3*scale;
      const kneeX = (hipX + footX) / 2;
      ctx.beginPath();
      ctx.moveTo(hipX - thickness, hipY);
      ctx.quadraticCurveTo(kneeX - thickness * 0.8, kneeY, footX - thickness * 0.5, shoeTop);
      ctx.lineTo(footX + thickness * 0.5, shoeTop);
      ctx.quadraticCurveTo(kneeX + thickness * 0.8, kneeY, hipX + thickness, hipY);
      ctx.closePath();
      ctx.fill();
    };

    drawLeg(torsoX + 6*scale, torsoX + 5*scale);
    drawLeg(torsoX + torsoWidth - 6*scale, torsoX + torsoWidth - 5*scale);

    if(genderKey==='female'){
      ctx.beginPath();
      ctx.moveTo(torsoX, torsoY+2*scale);
      ctx.lineTo(torsoX+torsoWidth, torsoY+2*scale);
      ctx.lineTo(torsoX+torsoWidth-4*scale, torsoY+torsoHeight);
      ctx.lineTo(torsoX+4*scale, torsoY+torsoHeight);
      ctx.closePath();
      ctx.fill();
    }else{
      ctx.fillRect(torsoX, torsoY, torsoWidth, torsoHeight);
    }

    drawArm(torsoX + 3.5*scale, torsoX - 2*scale);
    drawArm(torsoX + torsoWidth - 3.5*scale, torsoX + torsoWidth + 2*scale);

    const defaultPreview = opts.preview || (!withName && scale >= (opts.previewScaleThreshold || 2.7));
    const headRadiusMultiplier = opts.headRadiusMultiplier != null ? opts.headRadiusMultiplier : (defaultPreview ? 12 : 6);
    const headRadius = headRadiusMultiplier * scale;
    const headCx = x;
    const headCy = baseY + 10*scale;
    const headTop = headCy - headRadius;
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
      centerX:x,
      headCx,
      headCy,
      headRadius
    };

    drawAccessories(ctx, palette, metrics, scale, equip, 'back');
    drawHead(ctx, headCx, headCy, headRadius, appearance.skin);
    drawLowerOutfit(ctx, palette, metrics, scale, {equip, gender:genderKey});
    drawUpperOutfit(ctx, palette, metrics, scale, {equip, gender:genderKey});
    drawAccessories(ctx, palette, metrics, scale, equip, 'front');
    const faceScale = headRadius / 36;
    const hairTop = headCy - (headRadius * 0.7);
    drawHair(ctx, appearance.style, appearance.hair, headCx, hairTop, faceScale);
    drawExpression(ctx, appearance.emotion, headCx, headCy, appearance.eyes, faceScale);

    if(equip.head){
      ctx.fillStyle="#e94560";
      const hatTop = headTop - 4*scale;
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
