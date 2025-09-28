(function(global){
  if(!global) return;

  const DEFAULT_SHADOW_COLOR = '#c78d5b';

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

  function drawHair(ctx, style, color, cx, top, scale=1){
    if(!ctx || !color) return;
    const s = scale || 1;
    ctx.save();
    ctx.fillStyle = color;
    if(style === 'short'){
      ctx.fillRect(cx - 46*s, top - 6*s, 92*s, 24*s);
    }else if(style === 'fade'){
      ctx.fillRect(cx - 46*s, top, 92*s, 18*s);
      ctx.clearRect(cx - 46*s, top + 14*s, 92*s, 6*s);
    }else if(style === 'buzz'){
      ctx.fillRect(cx - 46*s, top + 4*s, 92*s, 12*s);
    }else if(style === 'undercut'){
      ctx.fillRect(cx - 46*s, top - 4*s, 92*s, 26*s);
      ctx.clearRect(cx - 46*s, top + 18*s, 92*s, 12*s);
    }else if(style === 'mohawk'){
      ctx.fillRect(cx - 8*s, top - 12*s, 16*s, 40*s);
    }else if(style === 'curly'){
      for(let i=0;i<12;i++){
        ctx.beginPath();
        ctx.arc(cx - 48*s + i*8*s, top + 10*s + (i%2?0:6*s), 8*s, 0, Math.PI*2);
        ctx.fill();
      }
    }else if(style === 'afro'){
      ctx.beginPath();
      ctx.arc(cx, top + 18*s, 48*s, 0, Math.PI*2);
      ctx.fill();
    }else if(style === 'ponytail'){
      ctx.fillRect(cx - 44*s, top, 88*s, 22*s);
      ctx.fillRect(cx + 36*s, top + 10*s, 14*s, 40*s);
    }else if(style === 'pixie'){
      ctx.fillRect(cx - 40*s, top - 2*s, 80*s, 18*s);
      ctx.clearRect(cx - 40*s, top + 12*s, 80*s, 10*s);
    }else if(style === 'bob'){
      ctx.beginPath();
      ctx.arc(cx, top + 26*s, 48*s, Math.PI, 0);
      ctx.fill();
    }else if(style === 'long'){
      ctx.fillRect(cx - 44*s, top, 88*s, 70*s);
    }else if(style === 'bun'){
      ctx.beginPath();
      ctx.arc(cx, top, 16*s, 0, Math.PI*2);
      ctx.fill();
      ctx.fillRect(cx - 44*s, top + 6*s, 88*s, 18*s);
    }else if(style === 'braids'){
      for(let i=0;i<4;i++){
        ctx.fillRect(cx - 36*s + i*18*s, top, 12*s, 56*s);
      }
    }else{
      ctx.fillRect(cx - 44*s, top, 88*s, 22*s);
    }
    ctx.restore();
  }

  function drawExpression(ctx, emotion, cx, cy, eyesColor, scale=1){
    if(!ctx) return;
    const s = scale || 1;
    ctx.save();
    const eyeDx = 12*s;
    const eyeR = 5*s;
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
    ctx.lineWidth = 3*s;
    const mouthY = cy + 16*s;
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
