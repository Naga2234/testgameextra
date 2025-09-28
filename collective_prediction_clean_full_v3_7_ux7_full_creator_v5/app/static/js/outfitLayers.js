(function(global){
  if(!global) return;

  function toNumber(value, fallback){
    return (typeof value === 'number' && Number.isFinite(value)) ? value : fallback;
  }

  function getVariant(options, slot){
    if(!options) return null;
    const variants = options.styleVariants || options.layerVariants || {};
    return variants[slot] || null;
  }

  function variantValue(variant, key, fallback, scale){
    if(!variant || !Object.prototype.hasOwnProperty.call(variant, key)){
      return fallback;
    }
    const raw = variant[key];
    if(typeof raw === 'number'){
      return raw * scale;
    }
    if(typeof raw === 'function'){
      return raw(scale, fallback);
    }
    if(raw && typeof raw === 'object'){
      if(typeof raw.absolute === 'number'){
        return raw.absolute;
      }
      if(typeof raw.multiplier === 'number'){
        return raw.multiplier * scale;
      }
    }
    return fallback;
  }

  function normalizeGender(value){
    if(typeof value !== 'string'){
      return '';
    }
    return value.trim().toLowerCase();
  }

  function drawUpperLayer(shared){
    const {ctx, metrics, palette, scale, equip, gender, options} = shared;
    if(!ctx) return;
    const {centerX, torsoY, torsoHeight} = metrics;
    if(centerX == null || torsoY == null || torsoHeight == null) return;
    const contour = metrics.torsoContour || {};
    const neckBaseY = contour.neckBaseY != null ? contour.neckBaseY : torsoY;
    const shoulderY = contour.shoulderY != null ? contour.shoulderY : torsoY + 4*scale;
    const chestY = contour.chestY != null ? contour.chestY : torsoY + 8*scale;
    const waistY = contour.waistY != null ? contour.waistY : torsoY + torsoHeight*0.55;
    const hipY = (contour.hipY != null ? contour.hipY : torsoY + torsoHeight) - 1.1*scale;
    const neckHalf = contour.neckHalf != null ? contour.neckHalf : (metrics.torsoWidth || 20*scale)/2;
    const shoulderHalf = contour.shoulderHalf != null ? contour.shoulderHalf : neckHalf + 2*scale;
    const chestHalf = contour.chestHalf != null ? contour.chestHalf : shoulderHalf - 0.8*scale;
    const waistHalf = contour.waistHalf != null ? contour.waistHalf : chestHalf - 2.4*scale;
    const hipHalf = contour.hipHalf != null ? contour.hipHalf : waistHalf + 1.4*scale;
    const hasEquip = !!(equip && equip.upper);
    const colors = palette.upper || {};
    const baseColor = colors.base || '#5c7ab2';
    const highlight = colors.highlight || baseColor;
    const shadow = colors.shadow || baseColor;
    const variant = getVariant(options, 'upper');
    const collarDrop = variantValue(variant, 'collarDrop', hasEquip ? 0.45*scale : 0.2*scale, scale);
    const collarDip = variantValue(variant, 'collarDip', hasEquip ? 1.8*scale : 1.1*scale, scale);
    const outerOffset = variantValue(variant, 'outerOffset', hasEquip ? 1.6*scale : 0.9*scale, scale);
    const hemSpread = variantValue(variant, 'hemSpread', hasEquip ? 1.8*scale : 1.2*scale, scale);
    const waistEase = variantValue(variant, 'waistEase', hasEquip ? 0.6*scale : (gender === 'female' ? 0.4*scale : 0.1*scale), scale);
    ctx.save();
    const grad = ctx.createLinearGradient(centerX, neckBaseY - collarDip, centerX, hipY + 3*scale);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.55, baseColor);
    grad.addColorStop(1, shadow);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(centerX - neckHalf - outerOffset*0.4, neckBaseY - collarDrop);
    ctx.quadraticCurveTo(centerX - neckHalf*0.6, neckBaseY - collarDrop - collarDip, centerX, neckBaseY - collarDrop - collarDip*0.75);
    ctx.quadraticCurveTo(centerX + neckHalf*0.6, neckBaseY - collarDrop - collarDip, centerX + neckHalf + outerOffset*0.4, neckBaseY - collarDrop);
    ctx.quadraticCurveTo(centerX + shoulderHalf + outerOffset, shoulderY, centerX + chestHalf + outerOffset*0.5, chestY);
    ctx.quadraticCurveTo(centerX + waistHalf + waistEase, waistY + 0.4*scale, centerX + hipHalf + hemSpread, hipY);
    ctx.quadraticCurveTo(centerX, hipY + 0.8*scale, centerX - hipHalf - hemSpread, hipY);
    ctx.quadraticCurveTo(centerX - (waistHalf + waistEase), waistY + 0.4*scale, centerX - (chestHalf + outerOffset*0.5), chestY);
    ctx.quadraticCurveTo(centerX - (shoulderHalf + outerOffset), shoulderY, centerX - neckHalf - outerOffset*0.4, neckBaseY - collarDrop);
    ctx.closePath();
    ctx.fill();

    if(colors.stroke){
      const strokeWidth = Math.max(1, variantValue(variant, 'strokeWidth', 1.25*scale, scale));
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    const trimEnabled = !variant || variant.disableTrim !== true;
    if(colors.trim && trimEnabled){
      const beltHeight = Math.max(scale, variantValue(variant, 'beltHeight', 1.6*scale, scale));
      const beltYOffset = variantValue(variant, 'beltYOffset', 0.6*scale, scale);
      const beltY = waistY + beltYOffset;
      ctx.fillStyle = colors.trim;
      ctx.beginPath();
      ctx.moveTo(centerX - waistHalf - 0.8*scale, beltY);
      ctx.quadraticCurveTo(centerX, beltY + 0.4*scale, centerX + waistHalf + 0.8*scale, beltY);
      ctx.lineTo(centerX + waistHalf + 0.7*scale, beltY + beltHeight);
      ctx.quadraticCurveTo(centerX, beltY + beltHeight + 0.35*scale, centerX - waistHalf - 0.7*scale, beltY + beltHeight);
      ctx.closePath();
      ctx.fill();
    }

    const highlightEnabled = !variant || variant.disableHighlight !== true;
    if(colors.highlight && hasEquip && highlightEnabled){
      const seamOffset = variantValue(variant, 'highlightOffset', 0, scale);
      const highlightWidth = Math.max(0.6*scale, variantValue(variant, 'highlightWidth', 0.85*scale, scale));
      ctx.strokeStyle = colors.highlight;
      ctx.lineWidth = highlightWidth;
      ctx.beginPath();
      ctx.moveTo(centerX + seamOffset, neckBaseY - collarDrop - collarDip*0.5);
      ctx.quadraticCurveTo(centerX + seamOffset, waistY + 0.6*scale, centerX + seamOffset, hipY - 0.3*scale);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawUnderwearUpper(shared){
    const {ctx, metrics, palette, scale, equip, gender} = shared;
    if(!ctx) return;
    const normalizedGender = normalizeGender(gender);
    if(normalizedGender === 'male'){
      return;
    }
    if(equip && equip.upper){
      return;
    }
    const {centerX, torsoY, torsoHeight} = metrics;
    if(centerX == null || torsoY == null || torsoHeight == null) return;
    const contour = metrics.torsoContour || {};
    const neckBaseY = contour.neckBaseY != null ? contour.neckBaseY : torsoY;
    const chestY = contour.chestY != null ? contour.chestY : torsoY + 8*scale;
    const shoulderHalf = contour.shoulderHalf != null ? contour.shoulderHalf : (metrics.torsoWidth || 20*scale)/2 + 2*scale;
    const chestHalf = contour.chestHalf != null ? contour.chestHalf : shoulderHalf - 0.8*scale;
    const bustEase = contour.underwearBustEase != null ? contour.underwearBustEase : 1.2*scale;
    const bustDrop = contour.underwearBustDrop != null ? contour.underwearBustDrop : 4.6*scale;
    const strapDrop = contour.underwearStrapDrop != null ? contour.underwearStrapDrop : 1.6*scale;
    const underarmInset = contour.underwearUnderarmInset != null ? contour.underwearUnderarmInset : 1.8*scale;
    const bustBottom = chestY + bustDrop;
    const colors = palette.upperUnderwear || palette.upperUnder || palette.upper || {};
    const baseColor = colors.base || '#f1d5f7';
    const highlight = colors.highlight || '#fff5ff';
    const shadow = colors.shadow || '#d3b1e8';
    ctx.save();
    const grad = ctx.createLinearGradient(centerX, neckBaseY + strapDrop - 1.5*scale, centerX, bustBottom + 1.5*scale);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.65, baseColor);
    grad.addColorStop(1, shadow);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(centerX - shoulderHalf + underarmInset, neckBaseY + strapDrop);
    ctx.quadraticCurveTo(centerX - chestHalf*0.6, neckBaseY + strapDrop - scale*0.4, centerX, neckBaseY + strapDrop - scale*0.5);
    ctx.quadraticCurveTo(centerX + chestHalf*0.6, neckBaseY + strapDrop - scale*0.4, centerX + shoulderHalf - underarmInset, neckBaseY + strapDrop);
    ctx.quadraticCurveTo(centerX + chestHalf + bustEase*0.4, chestY + strapDrop*0.8, centerX + chestHalf - bustEase, bustBottom);
    ctx.quadraticCurveTo(centerX, bustBottom + 1.1*scale, centerX - (chestHalf - bustEase), bustBottom);
    ctx.quadraticCurveTo(centerX - chestHalf - bustEase*0.4, chestY + strapDrop*0.8, centerX - shoulderHalf + underarmInset, neckBaseY + strapDrop);
    ctx.closePath();
    ctx.fill();

    if(colors.trim){
      const trimWidth = colors.trimWidth != null ? colors.trimWidth : 0.7*scale;
      ctx.strokeStyle = colors.trim;
      ctx.lineWidth = Math.max(0.45*scale, trimWidth);
      ctx.beginPath();
      ctx.moveTo(centerX - shoulderHalf + underarmInset + 0.3*scale, neckBaseY + strapDrop + 0.1*scale);
      ctx.quadraticCurveTo(centerX - chestHalf*0.55, neckBaseY + strapDrop - scale*0.2, centerX, neckBaseY + strapDrop - scale*0.3);
      ctx.quadraticCurveTo(centerX + chestHalf*0.55, neckBaseY + strapDrop - scale*0.2, centerX + shoulderHalf - underarmInset - 0.3*scale, neckBaseY + strapDrop + 0.1*scale);
      ctx.stroke();
    }

    if(colors.highlight){
      const sheenOffset = colors.highlightOffset != null ? colors.highlightOffset : 1.4*scale;
      const sheenWidth = Math.max(0.45*scale, colors.highlightWidth != null ? colors.highlightWidth : 0.75*scale);
      ctx.strokeStyle = colors.highlight;
      ctx.lineWidth = sheenWidth;
      ctx.beginPath();
      ctx.moveTo(centerX - sheenOffset, chestY + strapDrop*0.6);
      ctx.quadraticCurveTo(centerX - sheenOffset*0.2, chestY + strapDrop*0.2, centerX - sheenOffset*0.1, bustBottom - 1.5*scale);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawLowerLayer(shared){
    const {ctx, metrics, palette, scale, equip, gender, options} = shared;
    if(!ctx) return;
    const {hipY, kneeY, shoeTop, centerX} = metrics;
    if(hipY == null || kneeY == null || shoeTop == null || centerX == null) return;
    const contour = metrics.torsoContour || {};
    const legProfiles = metrics.legs || {};
    const leftLeg = legProfiles.left;
    const rightLeg = legProfiles.right;
    const hasEquip = !!(equip && equip.lower);
    const wearingShoes = !!(equip && equip.shoes);
    const colors = palette.lower || {};
    const baseColor = colors.base || '#4a668d';
    const highlight = colors.highlight || baseColor;
    const shadow = colors.shadow || baseColor;
    const waistY = contour.waistY != null ? contour.waistY : (hipY - 6*scale);
    const hipTop = (contour.hipY != null ? contour.hipY : hipY) - 0.4*scale;
    const variant = getVariant(options, 'lower');
    ctx.save();
    const grad = ctx.createLinearGradient(centerX, waistY, centerX, shoeTop);
    grad.addColorStop(0, highlight);
    grad.addColorStop(0.65, baseColor);
    grad.addColorStop(1, shadow);

    const computeHemY = (leg)=>{
      if(!leg) return shoeTop;
      const ankle = leg.ankleY != null ? leg.ankleY : shoeTop;
      if(!wearingShoes && leg.footY != null){
        const footRise = Math.max(0, leg.footY - ankle);
        return ankle + footRise*0.55;
      }
      return ankle;
    };

    const adjustInnerX = (leg, inset)=>{
      if(!leg) return null;
      const base = (!wearingShoes && leg.footInnerX != null ? leg.footInnerX : leg.ankleInnerX);
      if(base == null) return null;
      return base - (leg.direction || 0) * inset;
    };

    const adjustOuterX = (leg, inset)=>{
      if(!leg) return null;
      const base = (!wearingShoes && leg.footOuterX != null ? leg.footOuterX : leg.ankleOuterX);
      if(base == null) return null;
      return base - (leg.direction || 0) * inset;
    };

    const fallback = ()=>{
      ctx.fillStyle = grad;
      const torsoX = metrics.torsoX != null ? metrics.torsoX : (centerX - (metrics.torsoWidth || 20*scale)/2);
      const torsoWidth = metrics.torsoWidth || 20*scale;
      const legInset = variantValue(variant, 'fallbackInset', 3*scale, scale);
      const crotchWidth = variantValue(variant, 'fallbackCrotch', 4*scale, scale);
      const legWidth = (torsoWidth - crotchWidth)/2;
      const leftHemY = computeHemY(leftLeg);
      const rightHemY = computeHemY(rightLeg);
      ctx.beginPath();
      ctx.moveTo(torsoX + legInset, hipY);
      ctx.quadraticCurveTo(torsoX + legInset + legWidth*0.2, kneeY, torsoX + 4*scale, leftHemY);
      ctx.lineTo(torsoX + 12*scale, rightHemY);
      ctx.quadraticCurveTo(torsoX + legInset + legWidth*0.8, kneeY - 2*scale, centerX - crotchWidth/2, hipY + 2*scale);
      ctx.lineTo(centerX - crotchWidth/2, hipY);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(centerX + crotchWidth/2, hipY);
      ctx.lineTo(centerX + crotchWidth/2, hipY + 2*scale);
      ctx.quadraticCurveTo(torsoX + torsoWidth - legInset - legWidth*0.8, kneeY - 2*scale, torsoX + torsoWidth - 4*scale, rightHemY);
      ctx.lineTo(torsoX + torsoWidth - 4*scale, rightHemY);
      ctx.quadraticCurveTo(torsoX + torsoWidth - legInset - legWidth*0.2, kneeY, torsoX + torsoWidth - legInset, hipY);
      ctx.closePath();
      ctx.fill();
    };

    if(!leftLeg || !rightLeg){
      fallback();
      ctx.restore();
      return;
    }

    ctx.fillStyle = grad;

    const allowSkirt = !hasEquip && gender === 'female' && (!variant || variant.forceSplit !== true);
    const leftHemY = computeHemY(leftLeg);
    const rightHemY = computeHemY(rightLeg);
    const leftFootBase = (!wearingShoes && leftLeg && leftLeg.footY != null) ? leftLeg.footY : leftHemY;
    const rightFootBase = (!wearingShoes && rightLeg && rightLeg.footY != null) ? rightLeg.footY : rightHemY;
    const hemAnchor = Math.max(leftFootBase, rightFootBase);
    if(allowSkirt){
      const flare = variantValue(variant, 'skirtFlare', 3.2*scale, scale);
      const hemDrop = variantValue(variant, 'skirtHem', 6.2*scale, scale);
      ctx.beginPath();
      ctx.moveTo(leftLeg.hipOuterX - 1.1*scale, hipTop);
      ctx.quadraticCurveTo(centerX, hipTop + 1.7*scale, rightLeg.hipOuterX + 1.1*scale, hipTop);
      ctx.quadraticCurveTo(rightLeg.ankleOuterX + flare, hemAnchor + hemDrop*0.56, centerX, hemAnchor + hemDrop);
      ctx.quadraticCurveTo(leftLeg.ankleOuterX - flare, hemAnchor + hemDrop*0.56, leftLeg.hipOuterX - 1.1*scale, hipTop);
      ctx.closePath();
      ctx.fill();
      if(colors.stroke){
        const strokeWidth = Math.max(1, variantValue(variant, 'skirtStrokeWidth', 1.1*scale, scale));
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
      if(colors.trim && (!variant || variant.disableTrim !== true)){
        ctx.strokeStyle = colors.trim;
        ctx.lineWidth = Math.max(0.6*scale, variantValue(variant, 'skirtTrimWidth', 0.85*scale, scale));
        ctx.beginPath();
        ctx.moveTo(leftLeg.hipOuterX - 0.8*scale, hipTop + 0.6*scale);
        ctx.quadraticCurveTo(centerX, hipTop + 2.2*scale, rightLeg.hipOuterX + 0.8*scale, hipTop + 0.6*scale);
        ctx.stroke();
      }
      ctx.restore();
      return;
    }

    const outerInset = variantValue(variant, 'outerInset', hasEquip ? 1.3*scale : 0.8*scale, scale);
    const seamInset = variantValue(variant, 'seamInset', hasEquip ? 1.1*scale : 0.7*scale, scale);
    ctx.beginPath();
    ctx.moveTo(leftLeg.hipOuterX - outerInset, hipTop);
    ctx.quadraticCurveTo(leftLeg.kneeOuterX - outerInset*0.4, kneeY + 0.2*scale, adjustOuterX(leftLeg, outerInset*0.15) || leftLeg.ankleOuterX - outerInset*0.1, leftHemY);
    ctx.lineTo(adjustInnerX(leftLeg, seamInset*0.4) || leftLeg.ankleInnerX + seamInset*0.4, leftHemY);
    ctx.quadraticCurveTo(leftLeg.kneeInnerX + seamInset*0.35, kneeY, centerX - seamInset*0.45, hipY - 0.2*scale);
    ctx.quadraticCurveTo(centerX, hipY + 0.5*scale, centerX + seamInset*0.45, hipY - 0.2*scale);
    ctx.quadraticCurveTo(rightLeg.kneeInnerX - seamInset*0.35, kneeY, adjustInnerX(rightLeg, seamInset*0.4) || rightLeg.ankleInnerX - seamInset*0.4, rightHemY);
    ctx.lineTo(adjustOuterX(rightLeg, outerInset*0.15) || rightLeg.ankleOuterX + outerInset*0.1, rightHemY);
    ctx.quadraticCurveTo(rightLeg.kneeOuterX + outerInset*0.4, kneeY + 0.2*scale, rightLeg.hipOuterX + outerInset, hipTop);
    ctx.quadraticCurveTo(centerX, hipTop + 1.4*scale, leftLeg.hipOuterX - outerInset, hipTop);
    ctx.closePath();
    ctx.fill();

    if(colors.stroke){
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = Math.max(1, variantValue(variant, 'strokeWidth', 1.05*scale, scale));
      ctx.stroke();
    }

    if(colors.trim && (!variant || variant.disableTrim !== true)){
      ctx.strokeStyle = colors.trim;
      ctx.lineWidth = Math.max(0.6*scale, variantValue(variant, 'trimWidth', 0.8*scale, scale));
      ctx.beginPath();
      const seamCurve = variantValue(variant, 'seamCurve', 0.8*scale, scale);
      ctx.moveTo(centerX, hipTop + 0.4*scale);
      ctx.quadraticCurveTo(centerX, hipY + seamCurve, centerX, shoeTop - 0.8*scale);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawCloakBack(shared){
    const {ctx, metrics, palette, scale, options} = shared;
    if(!ctx) return;
    const {torsoX, torsoY, torsoWidth, footBaseline, centerX, headCy, headRadius} = metrics;
    if(torsoX == null || torsoY == null || torsoWidth == null || footBaseline == null || centerX == null || headCy == null || headRadius == null) return;
    const colors = palette.cloak || {};
    const variant = getVariant(options, 'cloak');
    ctx.save();
    const grad = ctx.createLinearGradient(centerX, torsoY, centerX, footBaseline);
    grad.addColorStop(0, colors.highlight || colors.base || '#0f3460');
    grad.addColorStop(0.7, colors.base || '#0f3460');
    grad.addColorStop(1, colors.shadow || colors.edge || '#071f2a');
    ctx.fillStyle = grad;
    const shoulderDrop = variantValue(variant, 'shoulderDrop', 2*scale, scale);
    const sideSpread = variantValue(variant, 'sideSpread', 5*scale, scale);
    const flare = variantValue(variant, 'flare', 6*scale, scale);
    const hemRise = variantValue(variant, 'hemRise', -2*scale, scale);
    ctx.beginPath();
    ctx.moveTo(torsoX - sideSpread, torsoY + shoulderDrop);
    ctx.quadraticCurveTo(centerX - flare, headCy + headRadius*0.6, torsoX - sideSpread + 1*scale, footBaseline + hemRise);
    ctx.quadraticCurveTo(centerX, footBaseline + (hemRise >= 0 ? hemRise : 6*scale), torsoX + torsoWidth + sideSpread - 1*scale, footBaseline + hemRise);
    ctx.quadraticCurveTo(centerX + flare, headCy + headRadius*0.6, torsoX + torsoWidth + sideSpread, torsoY + shoulderDrop);
    ctx.closePath();
    ctx.fill();
    const edgeColor = colors.edge || colors.stroke;
    if(edgeColor){
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = Math.max(1, variantValue(variant, 'edgeWidth', 1.4*scale, scale));
      ctx.stroke();
    }
    if(colors.lining && (!variant || variant.disableLining !== true)){
      ctx.strokeStyle = colors.lining;
      ctx.lineWidth = Math.max(0.6*scale, variantValue(variant, 'liningWidth', 0.9*scale, scale));
      ctx.beginPath();
      const liningOffset = variantValue(variant, 'liningOffset', 2*scale, scale);
      ctx.moveTo(torsoX - sideSpread + liningOffset, torsoY + shoulderDrop + liningOffset);
      ctx.quadraticCurveTo(centerX - flare*0.8, headCy + headRadius*0.7, torsoX - sideSpread + liningOffset + 1*scale, footBaseline + hemRise - 1*scale);
      ctx.moveTo(torsoX + torsoWidth + sideSpread - liningOffset, torsoY + shoulderDrop + liningOffset);
      ctx.quadraticCurveTo(centerX + flare*0.8, headCy + headRadius*0.7, torsoX + torsoWidth + sideSpread - liningOffset - 1*scale, footBaseline + hemRise - 1*scale);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShoes(shared){
    const {ctx, metrics, palette, scale, options, equip} = shared;
    if(!ctx) return;
    const {torsoX, torsoWidth, shoeTop, shoeHeight, centerX} = metrics;
    if(torsoX == null || torsoWidth == null || shoeTop == null || shoeHeight == null || centerX == null) return;
    const legs = metrics.legs || {};
    const leftLeg = legs.left;
    const rightLeg = legs.right;
    const colors = palette.shoes || {};
    const variant = getVariant(options, 'shoes');
    ctx.save();
    const hasShoes = !!(equip && equip.shoes);
    const fallbackShoes = ()=>{
      const shoeGrad = ctx.createLinearGradient(centerX, shoeTop, centerX, shoeTop + shoeHeight);
      shoeGrad.addColorStop(0, colors.highlight || colors.base || '#666');
      shoeGrad.addColorStop(0.6, colors.base || '#444');
      shoeGrad.addColorStop(1, colors.shadow || colors.trim || '#222');
      ctx.fillStyle = shoeGrad;
      const toeOffset = variantValue(variant, 'toeOffset', 3*scale, scale);
      const rightToe = torsoX + torsoWidth + variantValue(variant, 'toeSpacing', 5*scale, scale);
      const leftToe = torsoX + toeOffset;
      const flare = variantValue(variant, 'toeFlare', 2*scale, scale);
      ctx.beginPath();
      ctx.moveTo(leftToe, shoeTop);
      ctx.quadraticCurveTo(leftToe - flare, shoeTop + shoeHeight*0.7, leftToe + flare, shoeTop + shoeHeight);
      ctx.lineTo(rightToe - flare, shoeTop + shoeHeight);
      ctx.quadraticCurveTo(rightToe + flare, shoeTop + shoeHeight*0.7, rightToe - flare, shoeTop);
      ctx.closePath();
      ctx.fill();
      if(colors.stroke){
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = Math.max(1, variantValue(variant, 'strokeWidth', 1.2*scale, scale));
        ctx.stroke();
      }
      if(colors.trim && (!variant || variant.disableTrim !== true)){
        ctx.strokeStyle = colors.trim;
        ctx.lineWidth = Math.max(0.5*scale, variantValue(variant, 'trimWidth', 0.8*scale, scale));
        ctx.beginPath();
        ctx.moveTo(leftToe + 4*scale, shoeTop + shoeHeight*0.35);
        ctx.quadraticCurveTo(centerX, shoeTop + shoeHeight*0.15, rightToe - 6*scale, shoeTop + shoeHeight*0.35);
        ctx.stroke();
      }
    };

    const drawShoe = (leg)=>{
      if(!leg) return;
      const ankleInnerX = leg.ankleInnerX;
      const ankleOuterX = leg.ankleOuterX;
      if(ankleInnerX == null || ankleOuterX == null) return;
      const ankleY = leg.ankleY != null ? leg.ankleY : shoeTop;
      const direction = leg.direction || ((ankleOuterX >= ankleInnerX) ? 1 : -1);
      const rawWidth = Math.abs(ankleOuterX - ankleInnerX);
      const footWidth = leg.footWidth != null ? leg.footWidth : Math.max(rawWidth, 1.8*scale);
      const shoeBottom = ankleY + shoeHeight;
      const footCenter = (ankleInnerX + ankleOuterX) / 2;
      const heelDepth = variantValue(variant, 'heelDepth', footWidth*0.45, scale);
      const outerCurve = variantValue(variant, 'outerCurve', footWidth*0.6, scale);
      const toeReach = variantValue(variant, 'toeReach', footWidth*0.95, scale);
      const soleDip = variantValue(variant, 'soleDip', shoeHeight*0.25, scale);
      const shoeGrad = ctx.createLinearGradient(footCenter, ankleY, footCenter, shoeBottom);
      shoeGrad.addColorStop(0, colors.highlight || colors.base || '#666');
      shoeGrad.addColorStop(0.6, colors.base || '#444');
      shoeGrad.addColorStop(1, colors.shadow || colors.trim || '#222');
      ctx.fillStyle = shoeGrad;
      ctx.beginPath();
      ctx.moveTo(ankleInnerX, ankleY);
      ctx.bezierCurveTo(ankleInnerX - direction*heelDepth*0.55, ankleY + shoeHeight*0.2, ankleInnerX - direction*heelDepth, shoeBottom - soleDip, ankleInnerX - direction*heelDepth*0.25, shoeBottom);
      ctx.bezierCurveTo(footCenter, shoeBottom + shoeHeight*0.35, ankleOuterX + direction*toeReach, shoeBottom - shoeHeight*0.1, ankleOuterX + direction*outerCurve, ankleY + shoeHeight*0.55);
      ctx.quadraticCurveTo(ankleOuterX + direction*footWidth*0.18, ankleY + shoeHeight*0.18, ankleOuterX, ankleY);
      ctx.closePath();
      ctx.fill();
      if(colors.stroke){
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = Math.max(1, variantValue(variant, 'strokeWidth', 1.2*scale, scale));
        ctx.stroke();
      }
      if(colors.trim && (!variant || variant.disableTrim !== true)){
        ctx.strokeStyle = colors.trim;
        ctx.lineWidth = Math.max(0.45*scale, variantValue(variant, 'trimWidth', 0.75*scale, scale));
        ctx.beginPath();
        ctx.moveTo(ankleInnerX - direction*heelDepth*0.2, ankleY + shoeHeight*0.35);
        ctx.quadraticCurveTo(footCenter, ankleY + shoeHeight*0.12, ankleOuterX + direction*outerCurve*0.55, ankleY + shoeHeight*0.4);
        ctx.stroke();
      }
    };

    const drawBareFoot = (leg)=>{
      if(!leg) return;
      const ankleInnerX = leg.ankleInnerX;
      const ankleOuterX = leg.ankleOuterX;
      const ankleY = leg.ankleY != null ? leg.ankleY : shoeTop;
      const footInnerX = leg.footInnerX != null ? leg.footInnerX : ankleInnerX;
      const footOuterX = leg.footOuterX != null ? leg.footOuterX : ankleOuterX;
      const footY = leg.footY != null ? leg.footY : (ankleY + shoeHeight*0.55);
      if(ankleInnerX == null || ankleOuterX == null || ankleY == null) return;
      const direction = leg.direction || ((ankleOuterX >= ankleInnerX) ? 1 : -1);
      const skinColors = leg.skinColors || {};
      const highlight = skinColors.highlight || skinColors.base || '#f6d7bc';
      const base = skinColors.base || '#f1c3a2';
      const shadow = skinColors.shadow || skinColors.base || '#d2a07e';
      const footMidX = (footInnerX + footOuterX)/2;
      const grad = ctx.createLinearGradient(footMidX, ankleY, footMidX, footY);
      grad.addColorStop(0, highlight);
      grad.addColorStop(0.55, base);
      grad.addColorStop(1, shadow);
      ctx.fillStyle = grad;
      const archY = ankleY + (footY - ankleY)*0.45;
      const ballY = ankleY + (footY - ankleY)*0.78;
      ctx.beginPath();
      ctx.moveTo(ankleInnerX, ankleY);
      ctx.quadraticCurveTo(footInnerX - direction*0.3*scale, archY, footInnerX - direction*0.15*scale, footY - 0.22*scale);
      ctx.quadraticCurveTo(footMidX, footY + 0.25*scale, footOuterX, ballY);
      ctx.quadraticCurveTo(footOuterX - direction*0.35*scale, ankleY + (footY - ankleY)*0.32, ankleOuterX, ankleY);
      ctx.closePath();
      ctx.fill();
      if(skinColors.highlight){
        ctx.save();
        ctx.strokeStyle = skinColors.highlight;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 0.45*scale;
        ctx.beginPath();
        ctx.moveTo(ankleInnerX - direction*0.18*scale, ankleY + (footY - ankleY)*0.42);
        ctx.quadraticCurveTo(footMidX, ankleY + (footY - ankleY)*0.3, ankleOuterX + direction*0.3*scale, ankleY + (footY - ankleY)*0.38);
        ctx.stroke();
        ctx.restore();
      }
    };

    if(!hasShoes){
      drawBareFoot(leftLeg);
      drawBareFoot(rightLeg);
      ctx.restore();
      return;
    }

    if(!leftLeg && !rightLeg){
      fallbackShoes();
    }else{
      drawShoe(leftLeg);
      drawShoe(rightLeg);
    }
    ctx.restore();
  }

  function drawAccessory(shared){
    const {ctx, metrics, palette, scale, equip, options} = shared;
    if(!ctx || !equip || !equip.accessory) return;
    const {torsoY, centerX} = metrics;
    if(torsoY == null || centerX == null) return;
    const colors = palette.accessory || {};
    const baseColor = colors.base || '#f8b500';
    const highlight = colors.highlight || baseColor;
    const shadow = colors.shadow || colors.stroke || baseColor;
    const chainColor = colors.chain || highlight;
    const variant = getVariant(options, 'accessory');
    const chainTop = torsoY + variantValue(variant, 'chainTopOffset', 2.5*scale, scale);
    const chainBottom = torsoY + variantValue(variant, 'chainBottomOffset', 6.5*scale, scale);
    const spread = variantValue(variant, 'chainSpread', 6*scale, scale);
    const medallionRadius = Math.max(scale, variantValue(variant, 'medallionRadius', 3.4*scale, scale));
    ctx.save();
    ctx.strokeStyle = chainColor;
    ctx.lineWidth = Math.max(0.6*scale, variantValue(variant, 'chainWidth', 0.9*scale, scale));
    ctx.beginPath();
    ctx.moveTo(centerX - spread, chainTop);
    ctx.quadraticCurveTo(centerX, chainBottom - 2*scale, centerX + spread, chainTop);
    ctx.stroke();

    const radial = ctx.createRadialGradient(centerX, chainBottom, medallionRadius*0.2, centerX, chainBottom, medallionRadius);
    radial.addColorStop(0, highlight);
    radial.addColorStop(0.7, baseColor);
    radial.addColorStop(1, shadow);
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(centerX, chainBottom, medallionRadius, 0, Math.PI*2);
    ctx.fill();

    if(colors.stroke){
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = Math.max(0.5*scale, variantValue(variant, 'medallionStrokeWidth', 0.9*scale, scale));
      ctx.stroke();
    }
    ctx.restore();
  }

  const DEFAULT_LAYER_CONFIG = {
    back: [
      {
        id: 'cloak-back',
        slot: 'cloak',
        order: 10,
        placement: 'underHair',
        condition: ({equip}) => !!(equip && equip.cloak),
        draw: drawCloakBack
      }
    ],
    front: [
      {
        id: 'lower-base',
        slot: 'lower',
        order: 10,
        placement: 'underHair',
        condition: () => true,
        draw: drawLowerLayer
      },
      {
        id: 'upper-underwear',
        slot: 'upper-underwear',
        order: 15,
        placement: 'underHair',
        condition: ({equip, gender}) => {
          const normalized = normalizeGender(gender);
          return normalized !== 'male' && !(equip && equip.upper);
        },
        draw: drawUnderwearUpper
      },
      {
        id: 'upper-base',
        slot: 'upper',
        order: 20,
        placement: 'underHair',
        condition: () => true,
        draw: drawUpperLayer
      },
      {
        id: 'shoe-base',
        slot: 'shoes',
        order: 30,
        placement: 'underHair',
        condition: () => true,
        draw: drawShoes
      },
      {
        id: 'necklace',
        slot: 'accessory',
        order: 40,
        placement: 'overHair',
        condition: ({equip}) => !!(equip && equip.accessory),
        draw: drawAccessory
      }
    ]
  };

  function normalizeLayers(config, phase){
    const layers = (config && config[phase]) ? config[phase] : [];
    return layers.slice().sort((a, b)=>toNumber(a.order, 0) - toNumber(b.order, 0));
  }

  function renderEquipmentLayers(ctx, metrics, equip, appearance, options){
    if(!ctx) return null;
    const opts = Object.assign({phase: 'front'}, options || {});
    const phase = opts.phase || 'front';
    const palette = opts.palette || {};
    const config = opts.layerConfig || DEFAULT_LAYER_CONFIG;
    const overrides = opts.layerOverrides || {};
    const scale = toNumber(opts.scale, 1);
    const shared = {
      ctx,
      metrics: metrics || {},
      equip: equip || {},
      appearance: appearance || {},
      palette,
      scale,
      gender: opts.gender || 'other',
      options: opts.options || opts,
      shadeColor: typeof opts.shadeColor === 'function' ? opts.shadeColor : null
    };
    const layers = normalizeLayers(config, phase);
    const deferred = [];
    layers.forEach(layer => {
      const layerId = layer.id || `${phase}-${layer.slot || 'layer'}`;
      const override = overrides[layerId] || (layer.slot ? overrides[layer.slot] : null) || null;
      if(override && override.enabled === false){
        return;
      }
      const condition = (override && typeof override.condition === 'function') ? override.condition : layer.condition;
      if(typeof condition === 'function' && condition(shared) === false){
        return;
      }
      const draw = (override && typeof override.draw === 'function') ? override.draw : layer.draw;
      if(typeof draw !== 'function'){
        return;
      }
      const placement = (override && override.placement) || layer.placement || 'underHair';
      const runner = ()=>draw(shared);
      if(placement === 'overHair'){
        deferred.push(runner);
      }else{
        runner();
      }
    });
    if(deferred.length){
      return {deferred};
    }
    return null;
  }

  global.AvatarOutfitLayers = Object.assign({}, global.AvatarOutfitLayers, {
    renderEquipmentLayers,
    DEFAULT_LAYER_CONFIG
  });
})(typeof window !== 'undefined' ? window : this);
