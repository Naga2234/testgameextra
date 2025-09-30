(function(global){
  if(!global) return;

  const DEFAULT_SHADOW_COLOR = '#c78d5b';

  function adjustColor(hex, amount){
    if(typeof hex !== 'string') return hex;
    const value = hex.trim();
    const match = value.match(/^#?([a-f\d]{3}|[a-f\d]{6})$/i);
    if(!match){
      return hex;
    }
    let raw = match[1];
    if(raw.length === 3){
      raw = raw.split('').map(ch=>ch+ch).join('');
    }
    const num = parseInt(raw, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    const clamp = v => Math.max(0, Math.min(255, v));
    r = clamp(r + amount);
    g = clamp(g + amount);
    b = clamp(b + amount);
    return `#${((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1)}`;
  }

  function drawHead(ctx, cx, cy, radius, skinColor, options={}){
    if(!ctx || !skinColor || !isFinite(radius) || radius <= 0) return;
    const shadowColor = options.shadowColor || DEFAULT_SHADOW_COLOR;
    ctx.save();
    const grad = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius * 0.85);
    grad.addColorStop(0, skinColor);
    grad.addColorStop(1, shadowColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHair(ctx, style, color, cx, hairlineY, scale=1, layer='both'){
    if(!ctx || !color) return;
    const s = scale || 1;
    const headRadius = 36 * s;
    const baseColor = color;
    const highlightTone = adjustColor(color, 48);
    const sheenTone = adjustColor(color, 86);
    const shadowTone = adjustColor(color, -36);
    const deepShadow = adjustColor(color, -68);
    const thicknessMap = {
      short: 3.4,
      fade: 3.0,
      buzz: 2.6,
      undercut: 3.2,
      mohawk: 3.8,
      curly: 3.2,
      afro: 3.6,
      ponytail: 3.0,
      pixie: 3.2,
      bob: 3.4,
      long: 3.0,
      bun: 3.2,
      braids: 3.0
    };
    const thickness = (thicknessMap[style] || 3.2) * s;

    const layerKey = layer === 'front' ? 'front' : layer === 'back' ? 'back' : 'both';
    const shouldRender = part => layerKey === 'both' || layerKey === part;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = deepShadow;
    ctx.lineWidth = thickness;

    function fillHairPath(pathBuilder, bounds, options={}){
      const opts = Object.assign({highlight: true, stroke: true}, options);
      const top = bounds.top;
      const bottom = bounds.bottom;
      const left = bounds.left;
      const right = bounds.right;

      ctx.save();
      ctx.beginPath();
      pathBuilder(ctx);
      if(opts.closePath !== false){
        ctx.closePath();
      }

      const grad = ctx.createLinearGradient(cx, top, cx, bottom);
      grad.addColorStop(0, highlightTone);
      grad.addColorStop(0.45, baseColor);
      grad.addColorStop(1, shadowTone);
      ctx.fillStyle = grad;
      ctx.fill();

      if(thickness > 0 && opts.stroke !== false){
        ctx.stroke();
      }

      if(opts.highlight){
        ctx.save();
        ctx.clip();
        const highlightShift = opts.highlightShift != null ? opts.highlightShift : 0.18;
        const highlightWidth = opts.highlightWidth != null ? opts.highlightWidth : 0.25;
        const highlightAlpha = opts.highlightAlpha != null ? opts.highlightAlpha : 0.3;
        const highlightGrad = ctx.createLinearGradient(
          left + (right - left) * highlightShift,
          top,
          left + (right - left) * (highlightShift + highlightWidth),
          bottom
        );
        highlightGrad.addColorStop(0, sheenTone);
        highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = highlightAlpha;
        ctx.fillStyle = highlightGrad;
        ctx.fillRect(left - thickness, top - thickness, (right - left) + thickness * 2, (bottom - top) + thickness * 2);
        ctx.restore();
      }

      ctx.restore();
    }

    function drawCap(widthMul, dropMul, crownMul=0.7, cheekMul=0.4){
      const width = headRadius * widthMul;
      const topY = hairlineY - headRadius * crownMul;
      const lower = hairlineY + headRadius * Math.max(dropMul, 0.3);
      const side = hairlineY + headRadius * dropMul;
      const left = cx - width / 2;
      const right = cx + width / 2;
      fillHairPath(ctx=>{
        ctx.moveTo(left, lower);
        ctx.bezierCurveTo(left - width * 0.14, hairlineY + headRadius * cheekMul, cx - width * 0.6, topY + headRadius * 0.22, cx, topY);
        ctx.bezierCurveTo(cx + width * 0.6, topY + headRadius * 0.22, right + width * 0.14, hairlineY + headRadius * cheekMul, right, lower);
        ctx.quadraticCurveTo(right - width * 0.1, side, cx, side + headRadius * 0.12);
        ctx.quadraticCurveTo(left + width * 0.1, side, left, lower);
      }, {top: topY, bottom: side + headRadius * 0.14, left, right});
    }

    function drawFringeSegments(count, lengthMul, sweepMul=0.35, options={}){
      const length = headRadius * lengthMul;
      const width = headRadius * 1.18;
      const segWidth = width / Math.max(1, count);
      const startX = cx - width / 2;
      for(let i=0;i<count;i++){
        const segLeft = startX + i * segWidth;
        const segRight = segLeft + segWidth;
        const peak = hairlineY + length;
        fillHairPath(ctx=>{
          ctx.moveTo(segLeft, hairlineY);
          const midX = segLeft + segWidth / 2;
          ctx.quadraticCurveTo(midX, peak, segRight, hairlineY);
          ctx.quadraticCurveTo(midX, hairlineY - length * sweepMul, segLeft, hairlineY);
        }, {top: hairlineY - length * sweepMul, bottom: peak, left: segLeft, right: segRight}, Object.assign({highlightAlpha:0.2, highlightWidth:0.18}, options));
      }
    }

    function drawTail(offsetMul, lengthMul, widthMul, options={}){
      const startY = hairlineY + headRadius * 0.28;
      const length = headRadius * lengthMul;
      const width = headRadius * widthMul;
      const tailCx = cx + headRadius * offsetMul;
      const left = tailCx - width / 2;
      const right = tailCx + width / 2;
      const bottom = startY + length;
      fillHairPath(ctx=>{
        ctx.moveTo(left, startY);
        ctx.bezierCurveTo(left - width * 0.4, startY + length * 0.25, tailCx - width * 0.3, startY + length * 0.75, tailCx, bottom);
        ctx.bezierCurveTo(tailCx + width * 0.3, startY + length * 0.75, right + width * 0.4, startY + length * 0.25, right, startY);
      }, {top: startY, bottom, left, right}, Object.assign({highlightAlpha:0.22, highlightShift:0.25}, options));
    }

    function drawShavedBand(heightMul, widthMul, alpha, tint){
      const width = headRadius * widthMul;
      const topY = hairlineY + headRadius * 0.08;
      const bottomY = hairlineY + headRadius * (0.08 + heightMul);
      const left = cx - width / 2;
      const right = cx + width / 2;
      const topTone = adjustColor(color, (tint || 0) + 28);
      const bottomTone = adjustColor(color, tint || 0);
      ctx.save();
      const grad = ctx.createLinearGradient(cx, topY, cx, bottomY);
      grad.addColorStop(0, topTone);
      grad.addColorStop(1, bottomTone);
      ctx.fillStyle = grad;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(left, topY);
      ctx.bezierCurveTo(left - width * 0.08, topY + (bottomY - topY) * 0.4, left - width * 0.04, bottomY - (bottomY - topY) * 0.15, left + width * 0.12, bottomY);
      ctx.quadraticCurveTo(cx, bottomY + headRadius * 0.08, right - width * 0.12, bottomY);
      ctx.bezierCurveTo(right + width * 0.04, bottomY - (bottomY - topY) * 0.15, right + width * 0.08, topY + (bottomY - topY) * 0.4, right, topY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function renderShavedBand(heightMul, widthMul, alpha, tint){
      if(shouldRender('front')){
        drawShavedBand(heightMul, widthMul, alpha, tint);
        return true;
      }
      if(shouldRender('back')){
        drawShavedBand(heightMul, widthMul, alpha, tint);
        return true;
      }
      return false;
    }

    function drawCurlRow(count, radiusMul, offsetMul, options={}){
      const radius = headRadius * radiusMul;
      const startX = cx - headRadius * 1.1;
      const span = headRadius * 2.2;
      const step = count > 1 ? span / (count - 1) : 0;
      const centerY = hairlineY + headRadius * offsetMul;
      for(let i=0;i<count;i++){
        const centerX = startX + step * i;
        fillHairPath(ctx=>{
          ctx.moveTo(centerX - radius, centerY);
          ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
          ctx.arc(centerX, centerY + radius * 0.7, radius * 0.78, 0, Math.PI, true);
        }, {top: centerY - radius, bottom: centerY + radius * 1.75, left: centerX - radius, right: centerX + radius}, Object.assign({highlightAlpha:0.24, highlightShift:0.2}, options));
      }
    }

    function drawMohawk(widthMul, heightMul){
      const width = headRadius * widthMul;
      const topY = hairlineY - headRadius * heightMul;
      const bottom = hairlineY + headRadius * 0.95;
      const left = cx - width / 2;
      const right = cx + width / 2;
      fillHairPath(ctx=>{
        ctx.moveTo(left, hairlineY + headRadius * 0.12);
        ctx.quadraticCurveTo(cx - width * 0.7, hairlineY - headRadius * 0.12, cx - width * 0.3, topY);
        ctx.quadraticCurveTo(cx, topY - headRadius * 0.08, cx + width * 0.3, topY);
        ctx.quadraticCurveTo(cx + width * 0.7, hairlineY - headRadius * 0.12, right, hairlineY + headRadius * 0.12);
        ctx.lineTo(right, bottom);
        ctx.quadraticCurveTo(cx, bottom + headRadius * 0.1, left, bottom);
      }, {top: topY - headRadius * 0.08, bottom: bottom + headRadius * 0.1, left: left - width * 0.2, right: right + width * 0.2}, {highlightShift:0.33, highlightWidth:0.2});
    }

    function drawBun(radiusMul, offsetMul){
      const bunRadius = headRadius * radiusMul;
      const centerX = cx + headRadius * offsetMul;
      const centerY = hairlineY - headRadius * 0.58;
      fillHairPath(ctx=>{
        ctx.arc(centerX, centerY, bunRadius, 0, Math.PI * 2, false);
      }, {top: centerY - bunRadius, bottom: centerY + bunRadius, left: centerX - bunRadius, right: centerX + bunRadius}, {highlightAlpha:0.26, highlightShift:0.28, highlightWidth:0.2});
    }

    function drawAfro(radiusMul){
      const radius = headRadius * radiusMul;
      const centerY = hairlineY - headRadius * 0.12;
      const left = cx - radius;
      const right = cx + radius;
      const bottom = hairlineY + headRadius * 1.2;
      fillHairPath(ctx=>{
        ctx.moveTo(left + radius * 0.05, hairlineY + headRadius * 0.82);
        ctx.quadraticCurveTo(left - radius * 0.22, hairlineY + headRadius * 0.3, cx - radius * 0.78, centerY - radius * 0.08);
        ctx.arc(cx, centerY, radius, Math.PI * 1.08, Math.PI * -0.08, false);
        ctx.quadraticCurveTo(right + radius * 0.22, hairlineY + headRadius * 0.3, right - radius * 0.05, hairlineY + headRadius * 0.82);
        ctx.quadraticCurveTo(cx + radius * 0.55, hairlineY + headRadius * 1.26, cx, bottom + headRadius * 0.14);
        ctx.quadraticCurveTo(cx - radius * 0.55, hairlineY + headRadius * 1.26, left + radius * 0.05, hairlineY + headRadius * 0.82);
      }, {top: centerY - radius, bottom: bottom + headRadius * 0.14, left, right}, {highlightAlpha:0.25, highlightShift:0.26, highlightWidth:0.22});
    }

    function drawBraidChain(offsetMul, segmentCount, radiusMul, spacingMul){
      const baseX = cx + headRadius * offsetMul;
      const startY = hairlineY + headRadius * 0.32;
      for(let i=0;i<segmentCount;i++){
        const radius = Math.max(headRadius * 0.08, headRadius * (radiusMul - i * 0.02));
        const centerY = startY + headRadius * spacingMul * i;
        fillHairPath(ctx=>{
          ctx.arc(baseX, centerY, radius, 0, Math.PI * 2, false);
        }, {top: centerY - radius, bottom: centerY + radius, left: baseX - radius, right: baseX + radius}, {highlightAlpha:0.22, highlightShift:0.24, highlightWidth:0.18});
      }
    }

    switch(style){
      case 'short':
        if(shouldRender('back')){
          drawCap(1.65, 0.58, 0.62, 0.36);
        }
        if(shouldRender('front')){
          drawFringeSegments(3, 0.32, 0.28);
        }
        break;
      case 'fade':
        if(shouldRender('back')){
          drawCap(1.7, 0.5, 0.58, 0.34);
        }
        renderShavedBand(0.48, 2.1, 0.75, -60);
        if(shouldRender('front')){
          drawFringeSegments(2, 0.27, 0.22, {highlightAlpha:0.16});
        }
        break;
      case 'buzz':
        if(shouldRender('back')){
          drawCap(1.55, 0.38, 0.48, 0.28);
        }
        renderShavedBand(0.32, 1.9, 0.7, -54);
        break;
      case 'undercut':
        if(shouldRender('back')){
          drawCap(1.82, 0.66, 0.6, 0.4);
        }
        renderShavedBand(0.6, 2.2, 0.82, -68);
        if(shouldRender('front')){
          drawFringeSegments(2, 0.3, 0.3, {highlightAlpha:0.2});
        }
        break;
      case 'mohawk':
        if(shouldRender('back')){
          drawMohawk(0.9, 1.15);
        }
        renderShavedBand(0.62, 2.4, 0.65, -70);
        break;
      case 'curly':
        if(shouldRender('back')){
          drawCap(1.75, 0.62, 0.68, 0.42);
        }
        if(shouldRender('front')){
          drawCurlRow(6, 0.18, 0.68);
          drawCurlRow(5, 0.16, 0.92, {highlightAlpha:0.18});
        }
        break;
      case 'afro':
        if(shouldRender('back')){
          drawAfro(1.32);
        }
        break;
      case 'ponytail':
        if(shouldRender('back')){
          drawTail(0, 2.05, 0.68, {highlightAlpha:0.18});
          drawCap(1.68, 0.6, 0.64, 0.36);
        }
        if(shouldRender('front')){
          drawFringeSegments(2, 0.28, 0.24, {highlightAlpha:0.18});
        }
        break;
      case 'pixie':
        if(shouldRender('back')){
          drawCap(1.6, 0.5, 0.56, 0.32);
        }
        if(shouldRender('front')){
          drawFringeSegments(4, 0.38, 0.42, {highlightShift:0.28, highlightAlpha:0.24});
        }
        break;
      case 'bob':
        if(shouldRender('back')){
          drawCap(1.88, 0.98, 0.62, 0.52);
        }
        if(shouldRender('front')){
          drawFringeSegments(4, 0.3, 0.3, {highlightAlpha:0.2});
        }
        break;
      case 'long':
        if(shouldRender('back')){
          drawTail(-0.92, 2.4, 0.52, {highlightAlpha:0.18});
          drawTail(0.92, 2.4, 0.52, {highlightAlpha:0.18, highlightShift:0.32});
          drawCap(1.9, 1.18, 0.66, 0.52);
        }
        if(shouldRender('front')){
          drawFringeSegments(3, 0.34, 0.28, {highlightAlpha:0.2});
        }
        break;
      case 'bun':
        if(shouldRender('back')){
          drawCap(1.7, 0.58, 0.62, 0.36);
          drawBun(0.38, 0);
        }
        if(shouldRender('front')){
          drawFringeSegments(2, 0.26, 0.24, {highlightAlpha:0.18});
        }
        break;
      case 'braids':
        if(shouldRender('back')){
          drawCap(1.78, 0.62, 0.66, 0.44);
          drawBraidChain(-0.72, 4, 0.18, 0.42);
          drawBraidChain(0.72, 4, 0.18, 0.42);
        }
        break;
      default:
        if(shouldRender('back')){
          drawCap(1.72, 0.6, 0.64, 0.4);
        }
        if(shouldRender('front')){
          drawFringeSegments(2, 0.28, 0.25, {highlightAlpha:0.18});
        }
        break;
    }

    ctx.restore();
  }

  const FACE_CONFIG = {
    neutral:{
      eyeSpacing:13,
      eye:{width:6.4,height:5.6,offsetY:-0.2},
      iris:{offsetY:-0.6,scale:0.92},
      pupil:{scale:0.78,offsetY:-0.1},
      highlight:{x:-2.2,y:-2,scale:0.85,opacity:0.92},
      lids:{
        upper:{offset:-6.2,peak:-10.6,opacity:0.58,strokeOpacity:0.45,padding:2.2},
        lower:{offset:3.6,peak:2.4,opacity:0.28,strokeOpacity:0.24,padding:2}
      },
      brow:{baseLift:10,outerLift:-2,innerLift:1.2,arch:-5.2,thickness:3.6,highlightOpacity:0.42,width:20},
      mouth:{type:'soft',width:24,height:8.2,offset:18,thickness:3.6,highlightWidth:16,highlightOffset:3.2,highlightOpacity:0.34},
      blush:{offsetX:22,offsetY:22,radiusX:11,radiusY:5.2,opacity:0.26}
    },
    smile:{
      eyeSpacing:13,
      eye:{width:6.1,height:4.6,offsetY:-0.3},
      iris:{offsetY:-0.8,scale:0.86},
      pupil:{scale:0.68,offsetY:-0.2},
      highlight:{x:-2.6,y:-2.6,scale:0.78,opacity:0.84},
      lids:{
        upper:{offset:-4.4,peak:-7.6,opacity:0.9,strokeOpacity:0.58,padding:2.4},
        lower:{offset:3.2,peak:1.8,opacity:0.42,strokeOpacity:0.3,padding:2.2}
      },
      brow:{baseLift:12,outerLift:-6,innerLift:-2.4,arch:-8,thickness:3.4,highlightOpacity:0.48,width:20},
      mouth:{type:'smile',width:28,height:11.6,offset:16,thickness:4.2,highlightWidth:20,highlightOffset:4.2,highlightOpacity:0.55},
      blush:{offsetX:23,offsetY:24,radiusX:12,radiusY:5.6,opacity:0.42}
    },
    frown:{
      eyeSpacing:12.4,
      eye:{width:6.3,height:4.8,offsetY:0.2},
      iris:{offsetY:0.2,scale:0.82},
      pupil:{scale:0.66,offsetY:0.1},
      highlight:{x:-2,y:-1.2,scale:0.68,opacity:0.75},
      lids:{
        upper:{offset:-2.2,peak:-3.8,opacity:0.82,strokeOpacity:0.52,padding:2},
        lower:{offset:3.2,peak:2,opacity:0.3,strokeOpacity:0.26,padding:1.8}
      },
      brow:{baseLift:9,outerLift:-1.2,innerLift:4.8,arch:1.6,thickness:4,highlightOpacity:0.24,width:20},
      mouth:{type:'frown',width:22,height:8.8,offset:20,thickness:3.6,highlightWidth:14,highlightOffset:4.2,highlightOpacity:0.2},
      blush:{offsetX:21,offsetY:23,radiusX:10,radiusY:4.6,opacity:0.18}
    },
    surprised:{
      eyeSpacing:13.4,
      eye:{width:6.8,height:6.8,offsetY:-0.8},
      iris:{offsetY:-0.2,scale:0.92},
      pupil:{scale:0.7,offsetY:0},
      highlight:{x:-2.6,y:-3.2,scale:1,opacity:0.95},
      lids:{
        upper:{offset:-6.8,peak:-11.4,opacity:0.42,strokeOpacity:0.28,padding:2.6},
        lower:{offset:5.2,peak:3.2,opacity:0.28,strokeOpacity:0.24,padding:2.4}
      },
      brow:{baseLift:13,outerLift:-10,innerLift:-8.4,arch:-10,thickness:3.2,highlightOpacity:0.6,width:20},
      mouth:{type:'open',width:11,height:12,offset:18,thickness:4.4,highlightWidth:9,highlightOffset:5.2,highlightOpacity:0.58,fillOpacity:0.2},
      blush:{offsetX:22,offsetY:24,radiusX:11,radiusY:5.4,opacity:0.24}
    },
    sleepy:{
      eyeSpacing:13,
      eye:{closed:true,closedWidth:12,closedThickness:3.6,closedArc:2.6,closedOffsetY:0},
      highlight:{x:-2.2,y:-2.2,scale:0.6,opacity:0.45,radius:0.9},
      brow:{baseLift:8,outerLift:2.8,innerLift:4.2,arch:0.4,thickness:3.2,highlightOpacity:0.3,width:18},
      mouth:{type:'line',width:20,height:0,offset:20,thickness:3.6,highlightWidth:14,highlightOffset:2.6,highlightOpacity:0.4},
      blush:{offsetX:21,offsetY:25,radiusX:10.5,radiusY:4.8,opacity:0.34}
    }
  };

  function drawExpression(ctx, emotion, cx, cy, palette, scale=1){
    if(!ctx) return;
    const config = FACE_CONFIG[emotion] || FACE_CONFIG.neutral;
    const s = scale || 1;
    const baseSkin = palette && palette.skin ? palette.skin : '#f1c7a3';
    const baseEyes = palette && palette.eyes ? palette.eyes : '#274472';
    const baseBrows = palette && palette.brows ? palette.brows : (palette && palette.hair ? palette.hair : '#1f2937');
    const colors = {
      skin: baseSkin,
      skinShadow: palette && palette.skinShadow ? palette.skinShadow : adjustColor(baseSkin, -36),
      lids: palette && (palette.lids || palette.lidColor) ? (palette.lids || palette.lidColor) : adjustColor(baseSkin, 18),
      lidShadow: palette && palette.lidShadow ? palette.lidShadow : adjustColor(baseSkin, -42),
      eyes: baseEyes,
      eyeHighlight: palette && palette.eyeHighlight ? palette.eyeHighlight : adjustColor(baseEyes, 72),
      eyeShadow: palette && palette.eyeShadow ? palette.eyeShadow : adjustColor(baseEyes, -64),
      sclera: palette && palette.sclera ? palette.sclera : '#ffffff',
      brows: baseBrows,
      browHighlight: palette && palette.browHighlight ? palette.browHighlight : adjustColor(baseBrows, 56),
      mouth: palette && palette.mouth ? palette.mouth : '#d45a60',
      mouthSoft: palette && palette.mouthSoft ? palette.mouthSoft : adjustColor(palette && palette.mouth ? palette.mouth : '#d45a60', 60),
      blush: palette && palette.blush ? palette.blush : 'rgba(255,154,174,0.32)'
    };
    ctx.save();
    const headRadius = 36 * s;
    const baseEyeSpacing = (config.eyeSpacing != null ? config.eyeSpacing : 13) * s;
    const baseEyeWidth = 6.4;
    const baseEyeHeight = 5.6;
    const eyeBaseY = cy - 12 * s + ((config.eye && config.eye.baseOffset) || 0) * s;
    const browBaseY = eyeBaseY - ((config.brow && config.brow.baseLift) || 10) * s;
    const mouthBaseY = cy + ((config.mouth && config.mouth.offset) || 18) * s;
    const blushBaseY = cy + ((config.blush && config.blush.offsetY) || 22) * s;
    const blushOffsetX = ((config.blush && config.blush.offsetX) || 22) * s;

    function renderUpperLid(lidCfg, width, height){
      if(!lidCfg) return;
      const offset = (lidCfg.offset || 0) * s;
      const peak = (lidCfg.peak || -6) * s;
      const padding = (lidCfg.padding != null ? lidCfg.padding : 2) * s;
      ctx.beginPath();
      ctx.moveTo(-width - padding, -height + offset);
      ctx.quadraticCurveTo(0, -height + peak, width + padding, -height + offset);
      ctx.lineTo(width + padding, -height - height*0.9);
      ctx.lineTo(-width - padding, -height - height*0.9);
      ctx.closePath();
      const fillOpacity = lidCfg.opacity != null ? lidCfg.opacity : 0.6;
      if(fillOpacity>0){
        ctx.globalAlpha = fillOpacity;
        ctx.fillStyle = colors.lids;
        ctx.fill();
      }
      const strokeOpacity = lidCfg.strokeOpacity != null ? lidCfg.strokeOpacity : fillOpacity*0.6;
      if(strokeOpacity>0){
        ctx.globalAlpha = strokeOpacity;
        ctx.lineWidth = (lidCfg.strokeWidth || 0.8) * s;
        ctx.strokeStyle = colors.lidShadow;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function renderLowerLid(lidCfg, width, height){
      if(!lidCfg) return;
      const offset = (lidCfg.offset || 0) * s;
      const peak = (lidCfg.peak || 4) * s;
      const padding = (lidCfg.padding != null ? lidCfg.padding : 2) * s;
      ctx.beginPath();
      ctx.moveTo(-width - padding, height - offset);
      ctx.quadraticCurveTo(0, height - peak, width + padding, height - offset);
      ctx.lineTo(width + padding, height + height*0.8);
      ctx.lineTo(-width - padding, height + height*0.8);
      ctx.closePath();
      const fillOpacity = lidCfg.opacity != null ? lidCfg.opacity : 0.35;
      if(fillOpacity>0){
        ctx.globalAlpha = fillOpacity;
        ctx.fillStyle = colors.lids;
        ctx.fill();
      }
      const strokeOpacity = lidCfg.strokeOpacity != null ? lidCfg.strokeOpacity : fillOpacity*0.65;
      if(strokeOpacity>0){
        ctx.globalAlpha = strokeOpacity;
        ctx.lineWidth = (lidCfg.strokeWidth || 0.7) * s;
        ctx.strokeStyle = colors.lidShadow;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function renderEye(side){
      const sign = side === 'left' ? -1 : 1;
      const spacing = baseEyeSpacing;
      const centerX = cx + sign * spacing;
      const eyeCfg = config.eye || {};
      if(eyeCfg.closed){
        const closedWidth = (eyeCfg.closedWidth || 12) * s;
        const lineY = eyeBaseY + (eyeCfg.closedOffsetY || 0) * s;
        const arc = (eyeCfg.closedArc || 2.6) * s;
        const thickness = (eyeCfg.closedThickness || 3.6) * s;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = colors.lidShadow;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(centerX - closedWidth, lineY);
        ctx.quadraticCurveTo(centerX, lineY + arc, centerX + closedWidth, lineY);
        ctx.stroke();
        ctx.strokeStyle = colors.lids;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = Math.max(1, thickness - 1.2*s);
        ctx.beginPath();
        ctx.moveTo(centerX - closedWidth, lineY);
        ctx.quadraticCurveTo(centerX, lineY + arc, centerX + closedWidth, lineY);
        ctx.stroke();
        ctx.globalAlpha = 1;
        const closedHighlight = config.highlight || eyeCfg.highlight;
        if(closedHighlight){
          const hx = centerX + (closedHighlight.x || -2.2) * s;
          const hy = lineY + (closedHighlight.y || -2.2) * s;
          const hr = (closedHighlight.radius || 0.9) * s;
          ctx.globalAlpha = closedHighlight.opacity != null ? closedHighlight.opacity : 0.45;
          ctx.beginPath();
          ctx.arc(hx, hy, hr, 0, Math.PI*2);
          ctx.fillStyle = colors.eyeHighlight;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.restore();
        return;
      }

      const width = (eyeCfg.width || baseEyeWidth) * s;
      const height = Math.max(1.8*s, (eyeCfg.height || baseEyeHeight) * s);
      const centerY = eyeBaseY + (eyeCfg.offsetY || 0) * s;
      const rotation = (eyeCfg.rotate || 0) * (Math.PI/180) * (eyeCfg.rotateMirror === false ? 1 : sign);
      ctx.save();
      ctx.translate(centerX, centerY);
      if(rotation) ctx.rotate(rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, width, height, 0, 0, Math.PI*2);
      ctx.fillStyle = colors.sclera;
      ctx.fill();
      ctx.lineWidth = 1.3 * s;
      ctx.strokeStyle = colors.skinShadow;
      ctx.stroke();

      const irisCfg = config.iris || {};
      const irisScaleX = irisCfg.scaleX != null ? irisCfg.scaleX : (irisCfg.scale != null ? irisCfg.scale : 0.62);
      const irisScaleY = irisCfg.scaleY != null ? irisCfg.scaleY : (irisCfg.scale != null ? irisCfg.scale : 0.62);
      const irisRx = width * irisScaleX;
      const irisRy = height * irisScaleY;
      const irisOffsetY = (irisCfg.offsetY || 0) * s;
      ctx.beginPath();
      ctx.ellipse(0, irisOffsetY, irisRx, irisRy, 0, 0, Math.PI*2);
      const irisGrad = ctx.createRadialGradient(-irisRx*0.4, -irisRy*0.4, irisRx*0.1, 0, irisOffsetY, Math.max(irisRx, irisRy));
      irisGrad.addColorStop(0, adjustColor(colors.eyes, 55));
      irisGrad.addColorStop(1, colors.eyes);
      ctx.fillStyle = irisGrad;
      ctx.fill();

      const pupilCfg = config.pupil || {};
      const pupilScale = pupilCfg.scale != null ? pupilCfg.scale : 0.6;
      const pupilR = Math.min(irisRx, irisRy) * pupilScale;
      const pupilOffsetY = irisOffsetY + (pupilCfg.offsetY || 0) * s;
      ctx.beginPath();
      ctx.ellipse(0, pupilOffsetY, pupilR, pupilR, 0, 0, Math.PI*2);
      ctx.fillStyle = colors.eyeShadow;
      ctx.fill();

      const highlightCfg = config.highlight || {};
      if(highlightCfg.opacity !== 0){
        const highlightOpacity = highlightCfg.opacity != null ? highlightCfg.opacity : 0.9;
        if(highlightOpacity>0){
          const hx = (highlightCfg.x || -width*0.35);
          const hy = (highlightCfg.y || -height*0.55);
          const highlightScale = highlightCfg.scale != null ? highlightCfg.scale : 0.8;
          const highlightRx = width * 0.45 * highlightScale;
          const highlightRy = height * 0.45 * highlightScale;
          ctx.globalAlpha = highlightOpacity;
          ctx.beginPath();
          ctx.ellipse(hx, hy, highlightRx, highlightRy, 0, 0, Math.PI*2);
          ctx.fillStyle = colors.eyeHighlight;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      const lidsCfg = config.lids || {};
      if(lidsCfg.upper){
        renderUpperLid(lidsCfg.upper, width, height);
      }
      if(lidsCfg.lower){
        renderLowerLid(lidsCfg.lower, width, height);
      }
      ctx.restore();
    }

    function renderBrows(){
      if(!config.brow) return;
      const browCfg = config.brow;
      const browWidth = (browCfg.width || 20) * s;
      const thickness = (browCfg.thickness || 3.6) * s;
      const highlightWidth = (browCfg.highlightWidth || thickness * 0.45);
      const highlightOpacity = browCfg.highlightOpacity != null ? browCfg.highlightOpacity : 0.45;
      ['left','right'].forEach(side=>{
        const sign = side === 'left' ? -1 : 1;
        const outerLift = (side === 'left' ? (browCfg.outerLift != null ? browCfg.outerLift : 0) : (browCfg.outerLiftRight != null ? browCfg.outerLiftRight : (browCfg.outerLift != null ? browCfg.outerLift : 0))) * s;
        const innerLift = (side === 'left' ? (browCfg.innerLift != null ? browCfg.innerLift : 0) : (browCfg.innerLiftRight != null ? browCfg.innerLiftRight : (browCfg.innerLift != null ? browCfg.innerLift : 0))) * s;
        const arch = (side === 'left' ? (browCfg.archLeft != null ? browCfg.archLeft : browCfg.arch) : (browCfg.archRight != null ? browCfg.archRight : browCfg.arch)) || 0;
        const spacing = baseEyeSpacing;
        const startX = cx + sign * (spacing + browWidth/2);
        const endX = cx + sign * (spacing - browWidth/2);
        const controlX = cx + sign * spacing * (browCfg.controlX != null ? browCfg.controlX : 0.2);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, browBaseY + outerLift);
        ctx.quadraticCurveTo(controlX, browBaseY + arch * s, endX, browBaseY + innerLift);
        ctx.strokeStyle = colors.brows;
        ctx.lineWidth = thickness;
        ctx.stroke();
        if(highlightOpacity>0){
          ctx.globalAlpha = highlightOpacity;
          ctx.lineWidth = highlightWidth;
          ctx.strokeStyle = colors.browHighlight;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      });
    }

    function renderMouth(){
      const mouthCfg = config.mouth || {};
      const width = (mouthCfg.width || 24) * s;
      const height = (mouthCfg.height || 8) * s;
      const thickness = (mouthCfg.thickness || 3.6) * s;
      const type = mouthCfg.type || 'soft';
      const highlightWidth = (mouthCfg.highlightWidth || width * 0.6);
      const highlightOffset = (mouthCfg.highlightOffset || 3) * s;
      const highlightOpacity = mouthCfg.highlightOpacity != null ? mouthCfg.highlightOpacity : (type === 'open' ? 0.55 : 0.35);
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = colors.mouth;
      ctx.lineWidth = thickness;
      if(type === 'frown'){
        ctx.beginPath();
        ctx.moveTo(cx - width, mouthBaseY);
        ctx.quadraticCurveTo(cx, mouthBaseY - height, cx + width, mouthBaseY);
        ctx.stroke();
      }else if(type === 'smile'){
        ctx.beginPath();
        ctx.moveTo(cx - width, mouthBaseY);
        ctx.quadraticCurveTo(cx, mouthBaseY + height, cx + width, mouthBaseY);
        ctx.stroke();
      }else if(type === 'line'){
        ctx.beginPath();
        ctx.moveTo(cx - width, mouthBaseY);
        ctx.lineTo(cx + width, mouthBaseY);
        ctx.stroke();
      }else if(type === 'open'){
        ctx.beginPath();
        ctx.ellipse(cx, mouthBaseY, width, height, 0, 0, Math.PI*2);
        ctx.stroke();
        const fillOpacity = mouthCfg.fillOpacity != null ? mouthCfg.fillOpacity : 0.2;
        if(fillOpacity>0){
          ctx.globalAlpha = fillOpacity;
          ctx.fillStyle = colors.mouth;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }else{
        ctx.beginPath();
        ctx.moveTo(cx - width, mouthBaseY);
        ctx.quadraticCurveTo(cx, mouthBaseY + height, cx + width, mouthBaseY);
        ctx.stroke();
      }

      if(highlightOpacity>0){
        ctx.globalAlpha = highlightOpacity;
        ctx.strokeStyle = colors.mouthSoft;
        ctx.lineWidth = Math.max(1, (mouthCfg.highlightThickness || thickness * 0.45));
        if(type === 'open'){
          ctx.beginPath();
          ctx.ellipse(cx, mouthBaseY + highlightOffset, width * 0.6, height * 0.45, 0, 0, Math.PI);
          ctx.stroke();
        }else if(type === 'line'){
          ctx.beginPath();
          ctx.moveTo(cx - width * 0.6, mouthBaseY + highlightOffset);
          ctx.lineTo(cx + width * 0.6, mouthBaseY + highlightOffset);
          ctx.stroke();
        }else{
          ctx.beginPath();
          ctx.moveTo(cx - highlightWidth, mouthBaseY + highlightOffset);
          ctx.quadraticCurveTo(cx, mouthBaseY + highlightOffset + height * 0.35, cx + highlightWidth, mouthBaseY + highlightOffset);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    function renderBlush(){
      if(!config.blush) return;
      const blushCfg = config.blush;
      const radiusX = (blushCfg.radiusX || 11) * s;
      const radiusY = (blushCfg.radiusY || 5) * s;
      const opacity = blushCfg.opacity != null ? blushCfg.opacity : 0.24;
      if(opacity<=0) return;
      ctx.save();
      ctx.fillStyle = colors.blush;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.ellipse(cx - blushOffsetX, blushBaseY, radiusX, radiusY, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + blushOffsetX, blushBaseY, radiusX, radiusY, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }

    renderEye('left');
    renderEye('right');
    renderBrows();
    renderMouth();
    renderBlush();

    ctx.restore();
  }

  global.AvatarDrawing = {
    drawHead,
    drawHair,
    drawExpression
  };
})(typeof window !== 'undefined' ? window : this);
