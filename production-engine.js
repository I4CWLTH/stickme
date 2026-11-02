(() => {
  const state = new WeakMap();
  const clips = {
    idle:{speed:1,travel:0}, talk:{speed:1.7,travel:0}, react:{speed:1.1,travel:0},
    point:{speed:1,travel:0}, surprised:{speed:1.2,travel:0}, angry:{speed:2,travel:0},
    walk:{speed:1.6,travel:.34}, run:{speed:3.2,travel:.62}, dance:{speed:2.5,travel:0}, fall:{speed:1,travel:0}
  };

  function ensure(el){
    if(!state.has(el)) state.set(el,{action:'idle',started:performance.now(),x:el.classList.contains('person-b')?.72:.14,dir:el.classList.contains('person-b')?-1:1,name:el.classList.contains('person-b')?'b':'a'});
    return state.get(el);
  }

  function p(x,y){ return `${x.toFixed(1)} ${y.toFixed(1)}` }
  function limb(a,b,c){return `<path d="M${p(...a)} Q${p(...b)} ${p(...c)}" class="pe-limb"/>`}
  function face(cx,cy,expr,variant){
    const mouth = expr==='surprised' ? `<ellipse cx="${cx}" cy="${cy+16}" rx="8" ry="9" class="pe-line pe-white"/>` : expr==='angry' ? `<path d="M${cx-12} ${cy+19} Q${cx} ${cy+8} ${cx+12} ${cy+19}" class="pe-line"/>` : `<path d="M${cx-14} ${cy+11} Q${cx} ${cy+25} ${cx+14} ${cy+11}" class="pe-line"/>`;
    const brows = expr==='angry' ? `<path d="M${cx-23} ${cy-15} l15 7 M${cx+23} ${cy-15} l-15 7" class="pe-line"/>` : '';
    const hair = variant==='a' ? `<path d="M${cx-34} ${cy-25} Q${cx-15} ${cy-48} ${cx+8} ${cy-38} Q${cx+28} ${cy-44} ${cx+38} ${cy-23}" class="pe-hair"/>` : `<path d="M${cx-35} ${cy-23} Q${cx-10} ${cy-43} ${cx+14} ${cy-35} Q${cx+32} ${cy-34} ${cx+38} ${cy-20}" class="pe-hair"/>`;
    return `${hair}<circle cx="${cx}" cy="${cy}" r="39" class="pe-head"/><ellipse cx="${cx-13}" cy="${cy-5}" rx="4" ry="6" class="pe-eye"/><ellipse cx="${cx+13}" cy="${cy-5}" rx="4" ry="6" class="pe-eye"/>${brows}${mouth}`;
  }

  function render(el, now){
    const s=ensure(el), clip=clips[s.action]||clips.idle, t=((now-s.started)/1000)*clip.speed;
    const cycle=t*Math.PI*2;
    const isMove=s.action==='walk'||s.action==='run';
    const amp=s.action==='run'?30:22;
    const bounce=isMove?Math.abs(Math.sin(cycle))* (s.action==='run'?9:5): (s.action==='talk'?Math.sin(cycle)*3:Math.sin(cycle*.5)*2);
    const hipX=110, hipY=182-bounce, shoulderY=119-bounce, headY=78-bounce;
    let legSwing=isMove?Math.sin(cycle)*amp:0, armSwing=isMove?-legSwing*.85:0;
    if(s.action==='dance'){legSwing=Math.sin(cycle)*18;armSwing=Math.sin(cycle)*55}
    const expr=s.action==='angry'?'angry':s.action==='surprised'?'surprised':'smile';
    const lK=[90+legSwing*.35,220-bounce], rK=[130-legSwing*.35,220-bounce];
    const lF=[78+legSwing,276-bounce], rF=[142-legSwing,276-bounce];
    const lE=[75+armSwing*.45,152-bounce], rE=[145-armSwing*.45,152-bounce];
    let lH=[62+armSwing,194-bounce], rH=[158-armSwing,194-bounce];
    if(s.action==='point'){rH=[205,132-bounce];rE=[164,132-bounce]}
    if(s.action==='talk'){rH=[174,117-bounce];rE=[150,137-bounce]}
    if(s.action==='react'){rH=[121,103-bounce];rE=[143,137-bounce]}
    if(s.action==='surprised'){lH=[48,91-bounce];rH=[172,91-bounce];lE=[71,122-bounce];rE=[149,122-bounce]}
    if(s.action==='angry'){rH=[201,104-bounce];rE=[160,127-bounce]}

    const svg=el.querySelector('.puppet');
    if(svg){
      svg.setAttribute('viewBox','0 0 220 300');
      svg.innerHTML=`<g>${limb([98,hipY],lK,lF)}${limb([122,hipY],rK,rF)}<path d="M78 ${shoulderY} Q110 ${shoulderY-13} 142 ${shoulderY} L137 ${hipY+3} Q110 ${hipY+18} 83 ${hipY+3} Z" class="pe-body"/>${limb([84,shoulderY+8],lE,lH)}${limb([136,shoulderY+8],rE,rH)}<circle cx="${lH[0]}" cy="${lH[1]}" r="7" class="pe-hand"/><circle cx="${rH[0]}" cy="${rH[1]}" r="7" class="pe-hand"/>${face(110,headY,expr,s.name)}<path d="M${lF[0]-9} ${lF[1]} q14 8 30 1 M${rF[0]-3} ${rF[1]} q14 8 29 0" class="pe-line"/></g>`;
    }

    if(isMove){
      const stage=document.querySelector('#previewStage');
      const w=stage?.getBoundingClientRect().width||700;
      const travel=clip.travel;
      const phase=(Math.sin(t*.75)+1)/2;
      const base=s.name==='b'?.58:.07;
      const span=travel*(w/Math.max(w,700));
      s.x=base+span*phase;
      el.style.left=`${Math.max(2,Math.min(75,s.x*100))}%`;
      el.style.right='auto';
      const movingRight=Math.cos(t*.75)>=0;
      el.style.setProperty('--pe-flip',movingRight?1:-1);
    }
  }

  function tick(now){
    document.querySelectorAll('.character').forEach(el=>render(el,now));
    requestAnimationFrame(tick);
  }

  function setAction(el, action){
    const s=ensure(el); s.action=clips[action]?action:'idle'; s.started=performance.now();
  }

  const oldAnimate=window.animateBeat;
  if(typeof oldAnimate==='function'){
    window.animateBeat=function(beat,index=0){
      oldAnimate(beat,index);
      const scene=window.scenes?.[window.activeScene];
      if(!scene||!beat)return;
      const target=window.actorFor(scene,beat,index);
      document.querySelectorAll('.character').forEach(el=>setAction(el,'idle'));
      setAction(target,beat.action||'react');
      const other=target===document.querySelector('.person-a')?document.querySelector('.person-b'):document.querySelector('.person-a');
      if(beat.speaker!=='DIRECTOR' && other) setAction(other,'react');
    }
  }

  window.StickmeProductionEngine={setAction,clips};
  requestAnimationFrame(tick);
})();
