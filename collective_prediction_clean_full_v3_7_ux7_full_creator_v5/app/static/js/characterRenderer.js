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

  const DEG2RAD = Math.PI / 180;
  const RIG_DEFAULT_PATH = '/static/js/rig/characterRig.json';
  const RIG_STATE = { data: null, loaded: false, loading: null };
  const RIG_BONE_CHAINS = {
    leftArm: ['leftUpperArm', 'leftLowerArm', 'leftHand'],
    rightArm: ['rightUpperArm', 'rightLowerArm', 'rightHand'],
    leftLeg: ['leftUpperLeg', 'leftLowerLeg', 'leftFoot'],
    rightLeg: ['rightUpperLeg', 'rightLowerLeg', 'rightFoot']
  };

  const EMOTION_TO_POSE = {
    smile: 'idle',
    neutral: 'idle',
    frown: 'emotion_frown',
    surprised: 'emotion_surprised',
    sleepy: 'emotion_sleepy'
  };

  const VECTOR_RUNTIME = { promise: null, library: null };
  const VECTOR_INSTANCES = new WeakMap();

  function normalizeRigData(raw){
    if(!raw || !Array.isArray(raw.bones)) return null;
    const boneMap = new Map();
    raw.bones.forEach(bone=>{
      if(bone && bone.id){
        boneMap.set(bone.id, Object.assign({}, bone));
      }
    });
    const constraintMap = new Map();
    (raw.constraints || []).forEach(cons=>{
      if(cons && cons.bone){
        constraintMap.set(cons.bone, Object.assign({}, cons));
      }
    });
    return Object.assign({}, raw, {
      bonesMap: boneMap,
      constraintsMap: constraintMap,
      poses: Object.assign({}, raw.poses || {}),
      animations: Object.assign({}, raw.animations || {})
    });
  }

  function ensureRigLoaded(path){
    if(RIG_STATE.loaded && RIG_STATE.data){
      return Promise.resolve(RIG_STATE.data);
    }
    if(RIG_STATE.loading){
      return RIG_STATE.loading;
    }
    if(typeof fetch !== 'function'){
      return Promise.reject(new Error('fetch unavailable for rig loading'));
    }
    const targetPath = path || RIG_DEFAULT_PATH;
    RIG_STATE.loading = fetch(targetPath, { cache: 'force-cache' }).then(resp=>{
      if(!resp.ok){
        throw new Error(`Failed to load rig definition: ${resp.status}`);
      }
      return resp.json();
    }).then(json=>{
      const normalized = normalizeRigData(json);
      if(!normalized){
        throw new Error('Rig definition is invalid');
      }
      RIG_STATE.data = normalized;
      RIG_STATE.loaded = true;
      return normalized;
    }).catch(err=>{
      console.error('[CharacterRenderer] Unable to load rig', err);
      RIG_STATE.data = null;
      RIG_STATE.loaded = false;
      RIG_STATE.loading = null;
      throw err;
    });
    return RIG_STATE.loading;
  }

  function hasRigLoaded(){
    return !!(RIG_STATE.loaded && RIG_STATE.data);
  }

  function getRig(){
    return RIG_STATE.data;
  }

  function ensureVectorLibrary(){
    if(typeof global.Two === 'function'){
      VECTOR_RUNTIME.library = global.Two;
      return Promise.resolve(global.Two);
    }
    if(VECTOR_RUNTIME.promise){
      return VECTOR_RUNTIME.promise;
    }
    if(typeof document === 'undefined'){
      return Promise.reject(new Error('Two.js unavailable in current environment'));
    }
    VECTOR_RUNTIME.promise = new Promise((resolve, reject)=>{
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/two.js/0.8.10/two.min.js';
      script.async = true;
      script.onload = ()=>{
        if(typeof global.Two === 'function'){
          VECTOR_RUNTIME.library = global.Two;
          resolve(global.Two);
        }else{
          reject(new Error('Two.js failed to initialize'));
        }
      };
      script.onerror = err=>{
        VECTOR_RUNTIME.promise = null;
        reject(err);
      };
      document.head.appendChild(script);
    });
    return VECTOR_RUNTIME.promise;
  }

  function getPoseByName(rig, poseName){
    if(!rig) return null;
    if(poseName && rig.poses && rig.poses[poseName]){
      return rig.poses[poseName];
    }
    return rig.poses ? rig.poses.idle : null;
  }

  function blendValues(a, b, t){
    return (a == null ? 0 : a) * (1 - t) + (b == null ? 0 : b) * t;
  }

  function blendPose(rig, poseA, poseB, t){
    if(!poseA) return poseB;
    if(!poseB) return poseA;
    const bones = {};
    const seen = new Set();
    const collect = pose=>{
      if(!pose || !pose.bones) return;
      Object.keys(pose.bones).forEach(id=>seen.add(id));
    };
    collect(poseA);
    collect(poseB);
    seen.forEach(id=>{
      const a = poseA.bones ? poseA.bones[id] : null;
      const b = poseB.bones ? poseB.bones[id] : null;
      const rotation = blendValues(a && a.rotation, b && b.rotation, t);
      const lengthMultiplier = blendValues(
        a && a.lengthMultiplier != null ? a.lengthMultiplier : 1,
        b && b.lengthMultiplier != null ? b.lengthMultiplier : 1,
        t
      );
      bones[id] = {
        rotation,
        lengthMultiplier
      };
    });
    const rootOffsetX = blendValues(
      poseA.root && poseA.root.offset && poseA.root.offset.x,
      poseB.root && poseB.root.offset && poseB.root.offset.x,
      t
    );
    const rootOffsetY = blendValues(
      poseA.root && poseA.root.offset && poseA.root.offset.y,
      poseB.root && poseB.root.offset && poseB.root.offset.y,
      t
    );
    const rootRotation = blendValues(
      poseA.root && poseA.root.rotation,
      poseB.root && poseB.root.rotation,
      t
    );
    const base = Object.assign({}, poseA, poseB);
    base.bones = bones;
    base.root = base.root || {};
    base.root.offset = {
      x: rootOffsetX,
      y: rootOffsetY
    };
    if(Number.isFinite(rootRotation)){
      base.root.rotation = rootRotation;
    }
    return base;
  }

  function sampleAnimationPose(rig, animation, now, playback){
    if(!rig || !animation){
      return getPoseByName(rig, 'idle');
    }
    const frames = animation.frames || [];
    if(frames.length === 0){
      return getPoseByName(rig, animation.pose) || getPoseByName(rig, 'idle');
    }
    const duration = Math.max(1, animation.duration || 1000);
    const start = playback && Number.isFinite(playback.startedAt) ? playback.startedAt : now;
    let elapsed = now - start;
    if(!animation.loop && elapsed >= duration){
      const lastPose = frames[frames.length - 1];
      return getPoseByName(rig, lastPose.pose) || getPoseByName(rig, 'idle');
    }
    if(duration <= 0){
      const first = frames[0];
      return getPoseByName(rig, first.pose) || getPoseByName(rig, 'idle');
    }
    if(animation.loop){
      elapsed = elapsed % duration;
    }else if(elapsed < 0){
      elapsed = 0;
    }
    const norm = Math.max(0, Math.min(1, elapsed / duration));
    let currentIndex = 0;
    let nextIndex = 0;
    for(let i=0;i<frames.length;i+=1){
      const frame = frames[i];
      const next = frames[(i+1)%frames.length];
      const frameTime = Math.max(0, Math.min(1, frame.time != null ? frame.time : i / frames.length));
      const nextTime = Math.max(0, Math.min(1, next.time != null ? next.time : (i+1) / frames.length));
      if(norm >= frameTime && norm <= nextTime){
        currentIndex = i;
        nextIndex = (i+1) % frames.length;
        break;
      }
      if(i === frames.length - 1){
        currentIndex = i;
        nextIndex = animation.loop ? 0 : i;
      }
    }
    const currentFrame = frames[currentIndex];
    const nextFrame = frames[nextIndex];
    const currentPose = getPoseByName(rig, currentFrame.pose) || getPoseByName(rig, 'idle');
    if(!nextFrame || nextIndex === currentIndex){
      return currentPose;
    }
    const currentTime = Math.max(0, Math.min(1, currentFrame.time != null ? currentFrame.time : currentIndex / frames.length));
    const nextTime = Math.max(0, Math.min(1, nextFrame.time != null ? nextFrame.time : nextIndex / frames.length));
    const span = (nextTime - currentTime) || 1;
    let localT = (norm - currentTime) / span;
    if(!Number.isFinite(localT)) localT = 0;
    localT = Math.max(0, Math.min(1, localT));
    const nextPose = getPoseByName(rig, nextFrame.pose) || currentPose;
    return blendPose(rig, currentPose, nextPose, localT);
  }

  function resolveRigPose(rig, playback, now){
    if(!rig){
      return null;
    }
    const state = playback || {};
    const requestedPose = state.pose && rig.poses ? rig.poses[state.pose] : null;
    const baseEmotionPose = state.emotionPose && rig.poses ? rig.poses[state.emotionPose] : null;
    const basePose = requestedPose || baseEmotionPose || getPoseByName(rig, 'idle');
    if(state.animation){
      const animName = state.animation.name || state.animation;
      let key = animName;
      if(state.animation.direction){
        const withDirection = `${animName}_${state.animation.direction}`;
        if(rig.animations && rig.animations[withDirection]){
          key = withDirection;
        }
      }
      const animation = rig.animations ? rig.animations[key] || rig.animations[animName] : null;
      const sampled = sampleAnimationPose(rig, animation, now, state.animation);
      if(basePose && sampled){
        return blendPose(rig, basePose, sampled, state.animation.weight != null ? state.animation.weight : 1);
      }
      return sampled || basePose;
    }
    if(state.pose && !requestedPose && rig.poses && rig.poses[state.pose]){
      return rig.poses[state.pose];
    }
    return basePose;
  }

  function clampRotation(rig, boneId, rotation){
    if(!rig || !rig.constraintsMap) return rotation;
    const constraint = rig.constraintsMap.get(boneId);
    if(!constraint) return rotation;
    let result = rotation;
    if(Number.isFinite(constraint.min)){
      result = Math.max(constraint.min, result);
    }
    if(Number.isFinite(constraint.max)){
      result = Math.min(constraint.max, result);
    }
    return result;
  }

  function computeChainSegments(rig, chainName, anchor, pose, scale){
    if(!rig || !rig.bonesMap || !pose) return [];
    const ids = RIG_BONE_CHAINS[chainName];
    if(!ids) return [];
    const segments = [];
    let cursorX = anchor.x;
    let cursorY = anchor.y;
    ids.forEach(id=>{
      const bone = rig.bonesMap.get(id);
      if(!bone) return;
      const poseBone = pose.bones ? pose.bones[id] : null;
      const lengthMultiplier = poseBone && poseBone.lengthMultiplier != null ? poseBone.lengthMultiplier : 1;
      const length = (bone.length || 0) * scale * lengthMultiplier;
      const restRotation = bone.restRotation || 0;
      const poseRotation = poseBone && poseBone.rotation != null ? poseBone.rotation : 0;
      const rotation = clampRotation(rig, id, restRotation + poseRotation);
      const rotationRad = rotation * DEG2RAD;
      const dx = Math.sin(rotationRad) * length;
      const dy = Math.cos(rotationRad) * length;
      const endX = cursorX + dx;
      const endY = cursorY + dy;
      segments.push({
        id,
        startX: cursorX,
        startY: cursorY,
        endX,
        endY,
        rotation,
        rotationRad,
        length,
        definition: bone,
        pose: poseBone || {}
      });
      cursorX = endX;
      cursorY = endY;
    });
    return segments;
  }

  function createCapsulePath(length, radiusStart, radiusEnd, options){
    const path = new Path2D();
    const top = Math.max(0.1, radiusStart);
    const bottom = Math.max(0.1, radiusEnd);
    const easing = options && options.curve != null ? options.curve : 0.55;
    const controlTop = length * Math.max(0.2, Math.min(0.8, easing));
    const controlBottom = length * Math.max(0.2, Math.min(0.8, 1 - easing));
    path.moveTo(-top, 0);
    path.quadraticCurveTo(-top, controlTop * 0.4, -bottom, length - controlBottom);
    path.quadraticCurveTo(-bottom, length, 0, length + bottom);
    path.quadraticCurveTo(bottom, length, bottom, length - controlBottom);
    path.quadraticCurveTo(top, controlTop * 0.4, top, 0);
    path.quadraticCurveTo(0, -top * 0.6, -top, 0);
    path.closePath();
    return path;
  }

  function createFootPath(length, shape, scale){
    const innerWidth = (shape && shape.innerWidth != null ? shape.innerWidth : 1.6) * scale;
    const outerWidth = (shape && shape.outerWidth != null ? shape.outerWidth : 2.4) * scale;
    const toeLength = (shape && shape.toeLength != null ? shape.toeLength : length) * scale;
    const height = (shape && shape.height != null ? shape.height : 2.2) * scale;
    const ankleWidth = (shape && shape.ankleWidth != null ? shape.ankleWidth : 1.2) * scale;
    const path = new Path2D();
    const heelDepth = Math.max(0.2 * scale, height * 0.35);
    const toeHeight = height * 0.75;
    const toeReach = Math.max(length, toeLength);
    path.moveTo(-ankleWidth, 0);
    path.lineTo(ankleWidth, 0);
    path.lineTo(outerWidth, height * 0.35);
    path.quadraticCurveTo(outerWidth + toeReach * 0.6, toeHeight, outerWidth, height);
    path.lineTo(-innerWidth, height);
    path.quadraticCurveTo(-innerWidth - heelDepth * 0.6, height * 0.55, -innerWidth, height * 0.2);
    path.closePath();
    return path;
  }

  function drawCapsuleSegment(ctx, segment, colors, scale){
    if(!segment || !colors) return null;
    const shape = segment.definition && segment.definition.shape || {};
    const radiusStart = Math.max(0.1, (shape.radiusStart != null ? shape.radiusStart : shape.radius || 3.6) * scale);
    const radiusEnd = Math.max(0.1, (shape.radiusEnd != null ? shape.radiusEnd : shape.radius || radiusStart) * scale);
    const path = createCapsulePath(segment.length, radiusStart, radiusEnd, shape);
    ctx.save();
    ctx.translate(segment.startX, segment.startY);
    ctx.rotate(segment.rotationRad);
    const grad = ctx.createLinearGradient(0, 0, 0, segment.length);
    grad.addColorStop(0, colors.highlight);
    grad.addColorStop(0.55, colors.base);
    grad.addColorStop(1, colors.shadow);
    ctx.fillStyle = grad;
    ctx.fill(path);
    if(colors.deepShadow){
      ctx.strokeStyle = colors.deepShadow;
      ctx.globalAlpha = 0.68;
      ctx.lineWidth = Math.max(0.45 * scale, (shape.stroke || 0.6) * scale);
      ctx.stroke(path);
    }
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = colors.highlight;
    ctx.lineWidth = Math.max(0.3 * scale, (shape.highlight || 0.3) * scale);
    ctx.beginPath();
    ctx.moveTo(-radiusStart * 0.45, segment.length * 0.1);
    ctx.quadraticCurveTo(-radiusEnd * 0.3, segment.length * 0.55, -radiusEnd * 0.1, segment.length * 0.95);
    ctx.stroke();
    ctx.restore();
    return {
      radiusStart,
      radiusEnd
    };
  }

  function drawFootSegment(ctx, segment, colors, scale){
    const shape = segment.definition && segment.definition.shape || {};
    const path = createFootPath(segment.length, shape, scale);
    ctx.save();
    ctx.translate(segment.startX, segment.startY);
    ctx.rotate(segment.rotationRad);
    const grad = ctx.createLinearGradient(0, 0, 0, Math.max(1, (shape.height || 2.4) * scale));
    grad.addColorStop(0, colors.highlight);
    grad.addColorStop(0.6, colors.base);
    grad.addColorStop(1, colors.shadow);
    ctx.fillStyle = grad;
    ctx.fill(path);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = colors.shadow;
    ctx.lineWidth = Math.max(0.35 * scale, (shape.stroke || 0.45) * scale);
    ctx.stroke(path);
    ctx.restore();
  }

  function segmentsToArmMetrics(segments){
    if(!segments || segments.length === 0) return null;
    const first = segments[0];
    const last = segments[segments.length - 1];
    const elbowSegment = segments[1] || last;
    const direction = last.endX >= first.startX ? 1 : -1;
    return {
      direction,
      shoulderX: first.startX,
      shoulderY: first.startY,
      elbowX: elbowSegment.startX,
      elbowY: elbowSegment.startY,
      wristX: last.endX,
      wristY: last.endY
    };
  }

  function segmentsToLegMetrics(segments, colors, scale){
    if(!segments || segments.length === 0) return null;
    const thigh = segments[0];
    const shin = segments[1] || thigh;
    const foot = segments[2] || shin;
    const shapeThigh = thigh.definition && thigh.definition.shape || {};
    const shapeShin = shin.definition && shin.definition.shape || {};
    const shapeFoot = foot.definition && foot.definition.shape || {};
    const direction = foot.endX >= thigh.startX ? 1 : -1;
    const hipRadiusOuter = Math.abs((shapeThigh.outerRadius != null ? shapeThigh.outerRadius : shapeThigh.radiusStart || 5) * scale);
    const hipRadiusInner = Math.abs((shapeThigh.innerRadius != null ? shapeThigh.innerRadius : shapeThigh.radiusEnd || 3.8) * scale);
    const kneeRadiusOuter = Math.abs((shapeShin.outerRadius != null ? shapeShin.outerRadius : shapeShin.radiusStart || 3) * scale);
    const kneeRadiusInner = Math.abs((shapeShin.innerRadius != null ? shapeShin.innerRadius : shapeShin.radiusEnd || 2.3) * scale);
    const ankleWidth = Math.abs((shapeFoot.ankleWidth != null ? shapeFoot.ankleWidth : 1.4) * scale);
    const footInnerWidth = Math.abs((shapeFoot.innerWidth != null ? shapeFoot.innerWidth : 1.8) * scale);
    const footOuterWidth = Math.abs((shapeFoot.outerWidth != null ? shapeFoot.outerWidth : 2.6) * scale);
    const footHeight = Math.abs((shapeFoot.height != null ? shapeFoot.height : 2.4) * scale);
    const footToe = Math.abs((shapeFoot.toeLength != null ? shapeFoot.toeLength : 3.4) * scale);
    const ankleInnerX = shin.endX - direction * ankleWidth;
    const ankleOuterX = shin.endX + direction * ankleWidth;
    const footInnerX = shin.endX - direction * (footInnerWidth + 0.2 * scale);
    const footOuterX = shin.endX + direction * (footOuterWidth + footToe * 0.2);
    const footY = shin.endY + footHeight;
    return {
      direction,
      hipX: thigh.startX,
      hipY: thigh.startY,
      hipCapY: thigh.startY,
      hipInnerX: thigh.startX - direction * hipRadiusInner,
      hipOuterX: thigh.startX + direction * hipRadiusOuter,
      kneeX: shin.startX,
      kneeY: shin.startY,
      kneeInnerX: shin.startX - direction * kneeRadiusInner,
      kneeOuterX: shin.startX + direction * kneeRadiusOuter,
      ankleX: shin.endX,
      ankleY: shin.endY,
      ankleInnerX,
      ankleOuterX,
      footInnerX,
      footOuterX,
      footY,
      skinColors: colors
    };
  }

  function renderArmChain(ctx, segments, skinColors, scale){
    if(!segments) return null;
    segments.forEach(segment=>{
      drawCapsuleSegment(ctx, segment, skinColors, scale);
    });
    const metrics = segmentsToArmMetrics(segments);
    if(metrics){
      ctx.save();
      ctx.strokeStyle = skinColors.deepShadow;
      ctx.globalAlpha = 0.65;
      ctx.lineWidth = Math.max(0.45 * scale, 0.9);
      ctx.beginPath();
      const elbow = segments[1];
      const wrist = segments[segments.length - 1];
      if(elbow && wrist){
        ctx.moveTo(elbow.startX, elbow.startY);
        ctx.quadraticCurveTo(
          elbow.endX + (metrics.direction * 0.6 * scale),
          elbow.endY + 0.4 * scale,
          wrist.endX + (metrics.direction * 0.8 * scale),
          wrist.endY - 0.2 * scale
        );
        ctx.stroke();
      }
      ctx.restore();
    }
    return metrics;
  }

  function renderLegChain(ctx, segments, skinColors, scale, drawFoot){
    if(!segments) return null;
    const thigh = segments[0];
    const shin = segments[1];
    const foot = segments[2];
    if(thigh){
      drawCapsuleSegment(ctx, thigh, skinColors, scale);
    }
    if(shin){
      drawCapsuleSegment(ctx, shin, skinColors, scale);
    }
    if(foot && drawFoot !== false){
      drawFootSegment(ctx, foot, skinColors, scale);
    }
    const metrics = segmentsToLegMetrics(segments, skinColors, scale);
    if(metrics){
      ctx.save();
      ctx.strokeStyle = skinColors.deepShadow;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = Math.max(0.55 * scale, 1);
      ctx.beginPath();
      ctx.moveTo(metrics.hipOuterX, metrics.hipCapY + 0.4 * scale);
      ctx.quadraticCurveTo(
        metrics.kneeOuterX,
        metrics.kneeY + 0.25 * scale,
        metrics.ankleOuterX - metrics.direction * 0.4 * scale,
        metrics.ankleY - 0.35 * scale
      );
      ctx.stroke();
      ctx.restore();
    }
    return metrics;
  }

  function buildRigLayout(charState, appearance, equip, opts, scale, withName, x, y, genderKey){
    const rigData = getRig();
    if(!rigData){
      if(!RIG_STATE.loading){
        ensureRigLoaded().catch(()=>{});
      }
      return null;
    }
    const defaultPreview = opts.preview || (!withName && scale >= (opts.previewScaleThreshold || 2.7));
    const now = Date.now();
    const baseEmotionPose = EMOTION_TO_POSE[appearance.emotion] || 'idle';
    const poseState = Object.assign({ emotionPose: baseEmotionPose }, charState.rig || {});
    if(!poseState.emotionPose){
      poseState.emotionPose = baseEmotionPose;
    }
    const activePose = resolveRigPose(rigData, poseState, now) || getPoseByName(rigData, 'idle');
    const rootOffset = activePose && activePose.root && activePose.root.offset ? activePose.root.offset : {x:0, y:0};
    const offsetX = (rootOffset.x || 0) * scale;
    const offsetY = (rootOffset.y || 0) * scale;
    const baseX = x - 18*scale + offsetX;
    const baseY = y - 24*scale + offsetY;
    const shoeTop = baseY + 40*scale;
    const shoeHeight = equip.shoes ? 6*scale : 5*scale;
    const footBaseline = shoeTop + shoeHeight;
    const torsoX = baseX + 8*scale;
    const torsoY = baseY + 20*scale;
    const torsoWidth = 20*scale;
    const torsoHeight = 28*scale;
    const centerX = x + offsetX;
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
    const skinColors={
      highlight:skinHighlight,
      base:appearance.skin,
      shadow:skinShadow,
      deepShadow:skinDeepShadow
    };
    const armAnchors={
      left:{x:torsoX + 3.5*scale, y:shoulderY},
      right:{x:torsoX + torsoWidth - 3.5*scale, y:shoulderY}
    };
    const legAnchors={
      left:{x:torsoX + 6*scale, y:hipSurfaceY},
      right:{x:torsoX + torsoWidth - 6*scale, y:hipSurfaceY}
    };
    const leftLegSegments = computeChainSegments(rigData, 'leftLeg', legAnchors.left, activePose, scale);
    const rightLegSegments = computeChainSegments(rigData, 'rightLeg', legAnchors.right, activePose, scale);
    const leftArmSegments = computeChainSegments(rigData, 'leftArm', armAnchors.left, activePose, scale);
    const rightArmSegments = computeChainSegments(rigData, 'rightArm', armAnchors.right, activePose, scale);
    const drawBareFoot = !(equip && equip.shoes);
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
    return {
      rigData,
      poseState,
      activePose,
      timestamp: now,
      baseX,
      baseY,
      shoeTop,
      shoeHeight,
      footBaseline,
      torsoX,
      torsoY,
      torsoWidth,
      torsoHeight,
      centerX,
      defaultPreview,
      headRadius,
      headCx,
      headCy,
      headTop,
      faceScale,
      hairTop,
      neckBaseY,
      neckTopY,
      neckHalf,
      shoulderY,
      chestY,
      waistY,
      hipY,
      hipSurfaceY,
      handY,
      kneeY,
      skinColors,
      shoulderHalf,
      chestHalf,
      waistHalf,
      hipHalf,
      torsoContour,
      leftLegSegments,
      rightLegSegments,
      leftArmSegments,
      rightArmSegments,
      drawBareFoot,
      offsetX,
      offsetY
    };
  }

  if(typeof fetch === 'function'){
    ensureRigLoaded().catch(()=>{});
  }

  function renderRigVector(canvas, character, options){
    if(!canvas) return Promise.resolve(null);
    const opts = Object.assign({
      scale: 1,
      withName: true,
      preview: false,
      showChat: true
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
    const layout = buildRigLayout(charState, appearance, equip, opts, scale, withName, x, y, genderKey);
    if(!layout){
      return Promise.resolve(null);
    }
    return ensureVectorLibrary().then(TwoLib=>{
      if(!TwoLib) return null;
      const ctx = canvas.getContext('2d');
      if(ctx){
        if(typeof ctx.resetTransform === 'function'){
          ctx.resetTransform();
        }else if(typeof ctx.setTransform === 'function'){
          ctx.setTransform(1,0,0,1,0,0);
        }
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
      let instance = VECTOR_INSTANCES.get(canvas);
      let two = instance && instance.two;
      if(!two){
        const params = {
          type: TwoLib.Types.canvas,
          width: canvas.width,
          height: canvas.height,
          domElement: canvas
        };
        two = new TwoLib(params);
        VECTOR_INSTANCES.set(canvas, { two });
      }else{
        while(two.scene.children.length){
          two.scene.remove(two.scene.children[0]);
        }
      }
      const limbSegments = [];
      limbSegments.push(...layout.leftLegSegments, ...layout.rightLegSegments, ...layout.leftArmSegments, ...layout.rightArmSegments);
      limbSegments.forEach(segment=>{
        const dx = segment.endX - segment.startX;
        const dy = segment.endY - segment.startY;
        const length = Math.sqrt(dx*dx + dy*dy) || segment.length || 1;
        const shape = segment.definition && segment.definition.shape || {};
        const thickness = Math.max(2, (shape.radiusStart != null ? shape.radiusStart : 3) * scale * 2);
        const midX = (segment.startX + segment.endX)/2;
        const midY = (segment.startY + segment.endY)/2;
        const rect = two.makeRoundedRectangle(midX, midY, thickness, length, thickness * 0.35);
        rect.rotation = Math.atan2(segment.endX - segment.startX, segment.endY - segment.startY);
        rect.fill = layout.skinColors.base;
        rect.stroke = layout.skinColors.shadow;
        rect.linewidth = Math.max(0.5, thickness * 0.18);
      });
      two.update();

      if(!ctx) return layout;

      const leftLegProfile = segmentsToLegMetrics(layout.leftLegSegments, layout.skinColors, scale);
      const rightLegProfile = segmentsToLegMetrics(layout.rightLegSegments, layout.skinColors, scale);
      const leftArmProfile = segmentsToArmMetrics(layout.leftArmSegments);
      const rightArmProfile = segmentsToArmMetrics(layout.rightArmSegments);

      const metrics={
        torsoX: layout.torsoX,
        torsoY: layout.torsoY,
        torsoWidth: layout.torsoWidth,
        torsoHeight: layout.torsoHeight,
        hipY: layout.hipY,
        kneeY: layout.kneeY,
        shoeTop: layout.shoeTop,
        shoeHeight: layout.shoeHeight,
        footBaseline: layout.footBaseline,
        centerX: layout.centerX,
        headCx: layout.headCx,
        headCy: layout.headCy,
        headRadius: layout.headRadius,
        torsoContour: layout.torsoContour,
        legs:{left:leftLegProfile, right:rightLegProfile},
        neck:{top:layout.neckTopY, base:layout.neckBaseY, width:layout.neckHalf*2},
        arms:{left:leftArmProfile, right:rightArmProfile},
        rig:{
          pose: layout.activePose,
          playback: Object.assign({}, layout.poseState),
          timestamp: layout.timestamp,
          segments:{
            leftArm: layout.leftArmSegments,
            rightArm: layout.rightArmSegments,
            leftLeg: layout.leftLegSegments,
            rightLeg: layout.rightLegSegments
          }
        }
      };

      const skinHighlight=layout.skinColors.highlight;
      const skinShadow=layout.skinColors.shadow;
      const skinDeepShadow=layout.skinColors.deepShadow;
      const centerX = layout.centerX;
      const neckHalf = layout.neckHalf;
      const neckBaseY = layout.neckBaseY;
      const neckTopY = layout.neckTopY;
      const shoulderY = layout.shoulderY;
      const chestY = layout.chestY;
      const waistY = layout.waistY;
      const hipSurfaceY = layout.hipSurfaceY;
      const hipY = layout.hipY;
      const shoulderHalf = layout.shoulderHalf;
      const chestHalf = layout.chestHalf;
      const waistHalf = layout.waistHalf;
      const hipHalf = layout.hipHalf;
      const torsoContour = layout.torsoContour;

      const neckGrad=ctx.createLinearGradient(centerX, neckTopY, centerX, neckBaseY + 0.8*scale);
      neckGrad.addColorStop(0, skinHighlight);
      neckGrad.addColorStop(0.55, layout.skinColors.base);
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
      torsoGrad.addColorStop(0.55, layout.skinColors.base);
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
      drawHair(ctx, appearance.style, appearance.hair, layout.headCx, layout.hairTop, layout.faceScale, 'back');
      ctx.restore();
      drawHead(ctx, layout.headCx, layout.headCy, layout.headRadius, appearance.skin);

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
      drawHair(ctx, appearance.style, appearance.hair, layout.headCx, layout.hairTop, layout.faceScale, 'front');
      ctx.restore();
      if(deferredFrontLayers && Array.isArray(deferredFrontLayers.deferred)){
        deferredFrontLayers.deferred.forEach(fn=>{ if(typeof fn === 'function'){ fn(); } });
      }
      drawExpression(ctx, appearance.emotion, layout.headCx, layout.headCy, appearance.eyes, layout.faceScale);

      if(equip.head){
        ctx.fillStyle="#e94560";
        const hatTop = layout.headTop - 3*scale;
        ctx.fillRect(layout.headCx - layout.headRadius, hatTop, layout.headRadius * 2, 4*scale);
      }

      if(withName){
        const nowTs=Date.now();
        const chat = (charState.chat && charState.chat.text && (!charState.chat.expiresAt || charState.chat.expiresAt>nowTs)) ? charState.chat : null;
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
            if(!words.length){ lines.push(''); return; }
            let current='';
            words.forEach(word=>{
              const attempt=current?`${current} ${word}`:word;
              if(ctx.measureText(attempt).width<=maxWidth||!current){ current=attempt; }
              else{ lines.push(current); current=word; }
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
          const bubbleBottomTarget=layout.headTop-4*bubbleScale;
          const bubbleY=Math.max(12, bubbleBottomTarget-pointerHeight-bubbleHeight);
          const bubbleX=layout.centerX-bubbleWidth/2;
          const bubbleBottom=bubbleY+bubbleHeight;
          const pointerTipY=layout.headTop-2*bubbleScale;
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
          ctx.moveTo(layout.centerX-pointerHalfWidth, bubbleBottom);
          ctx.lineTo(layout.centerX+pointerHalfWidth, bubbleBottom);
          ctx.lineTo(layout.centerX, Math.max(pointerTipY, bubbleBottom+pointerHeight/2));
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle="#f9fafb";
          let textY=bubbleY+paddingY+fontPx;
          lines.forEach(line=>{
            ctx.fillText(line, layout.centerX, textY);
            textY+=lineHeight;
          });
          ctx.restore();
        }
        const fontPx = opts.nameFontPx != null ? opts.nameFontPx : Math.round(12*scale);
        ctx.fillStyle=opts.nameColor || '#111827';
        ctx.textAlign='center';
        ctx.font = `${opts.nameFontWeight} ${fontPx}px ${opts.nameFontFamily || opts.fontFamily}`;
        if(charState.name){
          ctx.fillText(charState.name, layout.centerX, layout.baseY-18);
        }
      }
      return metrics;
    }).catch(err=>{
      console.error('[CharacterRenderer] Vector render failed', err);
      return null;
    });
  }

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
      if(!equip || !equip[slot]){
        merged[slot]={};
        return;
      }
      merged[slot]=Object.assign({}, defaults, equipped||{});
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

    const layout = buildRigLayout(charState, appearance, equip, opts, scale, withName, x, y, genderKey);
    if(!layout){
      return null;
    }
    const {
      rigData,
      poseState,
      activePose,
      timestamp: rigTimestamp,
      baseX,
      baseY,
      shoeTop,
      shoeHeight,
      footBaseline,
      torsoX,
      torsoY,
      torsoWidth,
      torsoHeight,
      centerX,
      defaultPreview,
      headRadius,
      headCx,
      headCy,
      headTop,
      faceScale,
      hairTop,
      neckBaseY,
      neckTopY,
      neckHalf,
      shoulderY,
      chestY,
      waistY,
      hipY,
      hipSurfaceY,
      kneeY,
      skinColors,
      shoulderHalf,
      chestHalf,
      waistHalf,
      hipHalf,
      torsoContour,
      leftLegSegments,
      rightLegSegments,
      leftArmSegments,
      rightArmSegments,
      drawBareFoot
    } = layout;

    if(opts.shadow !== false){
      drawShadow(ctx, centerX, footBaseline, scale*0.9);
    }

    const leftLegProfile = renderLegChain(ctx, leftLegSegments, skinColors, scale, drawBareFoot);
    const rightLegProfile = renderLegChain(ctx, rightLegSegments, skinColors, scale, drawBareFoot);

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

    const leftArmProfile=renderArmChain(ctx, leftArmSegments, skinColors, scale);
    const rightArmProfile=renderArmChain(ctx, rightArmSegments, skinColors, scale);
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
      arms:{left:leftArmProfile, right:rightArmProfile},
      rig:{
        pose: activePose,
        playback: Object.assign({}, poseState),
        timestamp: rigTimestamp,
        segments:{
          leftArm:leftArmSegments,
          rightArm:rightArmSegments,
          leftLeg:leftLegSegments,
          rightLeg:rightLegSegments
        }
      }
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
        const bubbleX=centerX-bubbleWidth/2;
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
        ctx.moveTo(centerX-pointerHalfWidth, bubbleBottom);
        ctx.lineTo(centerX+pointerHalfWidth, bubbleBottom);
        ctx.lineTo(centerX, Math.max(pointerTipY, bubbleBottom+pointerHeight/2));
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle="#f9fafb";
        let textY=bubbleY+paddingY+fontPx;
        lines.forEach(line=>{
          ctx.fillText(line, centerX, textY);
          textY+=lineHeight;
        });
        ctx.restore();
      }
      const fontPx = opts.nameFontPx != null ? opts.nameFontPx : Math.round(12*scale);
      ctx.fillStyle=opts.nameColor || '#111827';
      ctx.textAlign='center';
      ctx.font = `${opts.nameFontWeight} ${fontPx}px ${opts.nameFontFamily || opts.fontFamily}`;
      if(charState.name){
        ctx.fillText(charState.name, centerX, baseY-18);
      }
    }

    return metrics;
  }

  global.CharacterRenderer = {
    isReady: ()=>hasHelpers && hasRigLoaded(),
    draw: drawCharacter,
    drawVector: renderRigVector,
    ensureRigLoaded,
    hasRigLoaded,
    normalizeAppearance,
    mergePalette: mergeOutfitPalette,
    getOutfit,
    getPalette,
    outfits: GENDER_OUTFITS,
    defaultAppearance: Object.assign({}, DEFAULT_APPEARANCE)
  };
})(typeof window !== 'undefined' ? window : this);
