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

  function drawExpression(ctx, emotion, cx, cy, eyesColor, scale=1){
    if(!ctx) return;
    const s = scale || 1;
    ctx.save();
    const eyeDx = 12 * s;
    const eyeR = 5 * s;
    ctx.fillStyle = eyesColor || '#1e1e1e';
    if(emotion === 'surprised'){
      ctx.beginPath(); ctx.arc(cx-eyeDx, cy, eyeR, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+eyeDx, cy, eyeR, 0, Math.PI*2); ctx.fill();
    }else if(emotion === 'sleepy'){
      ctx.fillRect(cx-eyeDx-eyeR, cy-1*s, eyeR*2, 2*s);
      ctx.fillRect(cx+eyeDx-eyeR, cy-1*s, eyeR*2, 2*s);
    }else if(emotion === 'frown'){
      ctx.beginPath(); ctx.ellipse(cx-eyeDx, cy, eyeR+2*s, eyeR-2*s, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+eyeDx, cy, eyeR+2*s, eyeR-2*s, 0, 0, Math.PI*2); ctx.fill();
    }else{
      ctx.beginPath(); ctx.arc(cx-eyeDx, cy, eyeR, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+eyeDx, cy, eyeR, 0, Math.PI*2); ctx.fill();
    }
    ctx.strokeStyle = '#3b2a1b';
    ctx.lineWidth = 3 * s;
    const mouthY = cy + 16 * s;
    if(emotion === 'smile'){
      ctx.beginPath(); ctx.arc(cx, mouthY, 16*s, 0, Math.PI); ctx.stroke();
    }else if(emotion === 'frown'){
      ctx.beginPath(); ctx.arc(cx, mouthY+10*s, 16*s, Math.PI, 0); ctx.stroke();
    }else if(emotion === 'surprised'){
      ctx.beginPath(); ctx.arc(cx, mouthY+2*s, 8*s, 0, Math.PI*2); ctx.stroke();
    }else if(emotion === 'sleepy'){
      ctx.beginPath(); ctx.moveTo(cx-10*s, mouthY); ctx.lineTo(cx+10*s, mouthY); ctx.stroke();
    }else{
      ctx.beginPath(); ctx.moveTo(cx-12*s, mouthY); ctx.lineTo(cx+12*s, mouthY); ctx.stroke();
    }
    ctx.restore();
  }

  global.AvatarDrawing = {
    drawHead,
    drawHair,
    drawExpression
  };
})(typeof window !== 'undefined' ? window : this);
