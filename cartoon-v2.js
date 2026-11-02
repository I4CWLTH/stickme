(() => {
  const stage = document.querySelector('#previewStage');
  if (!stage) return;

  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.id='cartoonStage';
  svg.setAttribute('viewBox','0 0 960 540');
  svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  stage.prepend(svg);

  const sceneLayer=document.createElementNS(ns,'g');
  const actorLayer=document.createElementNS(ns,'g');
  svg.append(sceneLayer,actorLayer);

  const state={
    scene:'office',
    actors:[
      {id:'a',name:'MAYA',x:280,y:405,dir:1,action:'idle',t0:performance.now(),variant:'a'},
      {id:'b',name:'JORDAN',x:660,y:405,dir:-1,action:'idle',t0:performance.now(),variant:'b'}
    ]
  };

  function setScene(title=''){
    const t=title.toLowerCase();
    state.scene=/kitchen|break/.test(t)?'kitchen':/hall/.test(t)?'hallway':'office';
    renderBackground();
  }

  function renderBackground(){
    const wallA=state.scene==='hallway'?'#29434b':'#1f6868';
    const wallB=state.scene==='hallway'?'#1b333a':'#143d43';
    let stripes='';
    for(let i=0;i<12;i++) stripes+=`<rect x="${i*80}" y="0" width="40" height="350" fill="${i%2?wallA:wallB}"/>`;
    sceneLayer.innerHTML=`
      ${stripes}
      <rect x="0" y="350" width="960" height="190" class="floor"/>
      <rect x="0" y="340" width="960" height="15" class="trim"/>
      <g>
        <rect x="92" y="130" width="235" height="22" rx="4" fill="#bd7753" class="prop"/>
        <rect x="110" y="150" width="14" height="44" fill="#bd7753" class="prop"/>
        <rect x="292" y="150" width="14" height="44" fill="#bd7753" class="prop"/>
        <rect x="112" y="105" width="110" height="18" rx="6" fill="#e6d58b" class="prop"/>
        <rect x="112" y="88" width="110" height="17" rx="6" fill="#f5efe0" class="prop"/>
      </g>
      <g>
        <rect x="403" y="72" width="118" height="144" class="frame"/>
        <rect x="418" y="88" width="88" height="112" class="frame-inner"/>
        <text x="462" y="118" class="poster-title">BLOCK</text>
        <text x="462" y="134" class="poster-sub">BLAST</text>
        <rect x="442" y="154" width="40" height="16" rx="3" fill="#f39b21"/>
      </g>
      <g>
        <path d="M790 85 Q850 50 908 84 L908 305 L790 305 Z" class="door"/>
        <rect x="817" y="110" width="60" height="155" fill="#1c5e73" stroke="#17232a" stroke-width="4"/>
      </g>
      <g>
        <ellipse cx="475" cy="474" rx="245" ry="31" class="shadow"/>
        <path d="M330 392 L635 392 L675 470 L295 470 Z" class="desk-top"/>
        <rect x="355" y="470" width="255" height="40" class="desk-front"/>
        <path d="M565 320 Q640 330 650 410 L585 410 Q590 360 545 350 Z" class="chair"/>
      </g>`;
  }

  function actorSVG(a,now){
    const dt=(now-a.t0)/1000;
    const move=a.action==='walk'||a.action==='run';
    const speed=a.action==='run'?9:a.action==='walk'?5:2.2;
    const cyc=dt*speed;
    const leg=move?Math.sin(cyc)*34:0;
    const arm=move?-Math.sin(cyc)*28:(a.action==='talk'?Math.sin(cyc*1.5)*12:0);
    const bob=move?Math.abs(Math.sin(cyc))*9:(a.action==='idle'?Math.sin(dt*2.2)*2:Math.sin(dt*3)*3);
    const lean=a.action==='run'?8*a.dir:a.action==='angry'?6*a.dir:0;
    const headY=-132-bob;
    const hipY=-18-bob;
    const shoulderY=-91-bob;
    let handRX=58+arm,handRY=-48-bob,handLX=-58-arm,handLY=-48-bob;
    if(a.action==='point'){handRX=96*a.dir;handRY=-88-bob}
    if(a.action==='surprised'){handRX=66;handRY=-138-bob;handLX=-66;handLY=-138-bob}
    if(a.action==='react'){handRX=22;handRY=-121-bob}
    const lFootX=-28+leg,rFootX=28-leg;
    const eyeShift=a.dir*2;
    const mouth=a.action==='surprised'?`<ellipse cx="0" cy="${headY+18}" rx="8" ry="10" class="mouth-fill"/>`:a.action==='angry'?`<path d="M-12 ${headY+22} Q0 ${headY+10} 12 ${headY+22}" class="feature"/>`:`<path d="M-13 ${headY+12} Q0 ${headY+28} 13 ${headY+12}" class="feature"/>`;
    const brows=a.action==='angry'?`<path d="M-25 ${headY-16} l16 8 M25 ${headY-16} l-16 8" class="brow"/>`:'';
    const hair=a.variant==='a'?`<path d="M-39 ${headY-31} Q-20 ${headY-55} 4 ${headY-45} Q24 ${headY-54} 39 ${headY-29} M-7 ${headY-50} q-2 -18 8 -28 M20 ${headY-43} q16 -8 20 -20" class="hair"/>`:`<path d="M-40 ${headY-29} Q-18 ${headY-49} 8 ${headY-43} Q30 ${headY-40} 39 ${headY-24} M-5 ${headY-49} q7 -17 19 -23" class="hair"/>`;
    const speedLines=a.action==='run'?`<path d="M-105 -55 h-30 M-118 -30 h-24 M-108 -80 h-20" class="speedline"/>`:'';
    return `<g transform="translate(${a.x} ${a.y}) scale(${a.dir} 1) rotate(${lean})">
      <ellipse cx="0" cy="4" rx="52" ry="11" class="shadow"/>
      ${speedLines}
      <path d="M-8 ${hipY} Q${-16+leg*.35} 26 ${lFootX} 92" class="limb"/>
      <path d="M8 ${hipY} Q${16-leg*.35} 26 ${rFootX} 92" class="limb"/>
      <path d="M${lFootX-9} 92 q14 7 26 1 M${rFootX-5} 92 q14 7 26 0" class="feature"/>
      <path d="M-31 ${shoulderY} Q0 ${shoulderY-12} 31 ${shoulderY} L27 ${hipY+8} Q0 ${hipY+18} -27 ${hipY+8} Z" class="char-body"/>
      <path d="M-27 ${shoulderY+6} Q-46 ${-75-bob} ${handLX} ${handLY}" class="limb"/>
      <path d="M27 ${shoulderY+6} Q46 ${-75-bob} ${handRX} ${handRY}" class="limb"/>
      <circle cx="${handLX}" cy="${handLY}" r="8" class="hand"/>
      <circle cx="${handRX}" cy="${handRY}" r="8" class="hand"/>
      ${hair}
      <circle cx="0" cy="${headY}" r="49" class="char-head"/>
      <ellipse cx="${-17+eyeShift}" cy="${headY-5}" rx="5" ry="11" class="eye"/>
      <ellipse cx="${17+eyeShift}" cy="${headY-5}" rx="5" ry="11" class="eye"/>
      ${brows}${mouth}
    </g>`;
  }

  function renderActors(now){
    state.actors.forEach(a=>{
      if(a.action==='run'||a.action==='walk'){
        const speed=a.action==='run'?150:80;
        a.x += a.dir*speed/60;
        if(a.x>790){a.x=790;a.dir=-1}
        if(a.x<160){a.x=160;a.dir=1}
      }
    });
    actorLayer.innerHTML=state.actors.map(a=>actorSVG(a,now)).join('');
  }

  function setAction(actorId,action){
    const a=state.actors.find(x=>x.id===actorId); if(!a)return;
    a.action=action||'idle'; a.t0=performance.now();
  }
  function chooseActor(beat){
    const txt=(beat?.speaker||'').toUpperCase();
    const first=(document.querySelector('.person-a .name-tag')?.textContent||'').toUpperCase();
    const second=(document.querySelector('.person-b .name-tag')?.textContent||'').toUpperCase();
    if(txt&&txt===second)return 'b';
    if(txt&&txt===first)return 'a';
    const body=(beat?.text||'').toLowerCase();
    if(second&&body.includes(second.toLowerCase()))return 'b';
    return 'a';
  }

  const oldShowScene=window.showScene;
  if(typeof oldShowScene==='function') window.showScene=function(i){
    oldShowScene(i);
    try{setScene(window.scenes?.[i]?.title||'')}catch(_){setScene('')}
  };
  const oldAnimateBeat=window.animateBeat;
  if(typeof oldAnimateBeat==='function') window.animateBeat=function(beat,index=0){
    oldAnimateBeat(beat,index);
    state.actors.forEach(a=>{if(a.action!=='run'&&a.action!=='walk')a.action='idle'});
    const id=chooseActor(beat);
    const action=beat?.action||'react';
    setAction(id,action);
    const other=id==='a'?'b':'a';
    if(action!=='run'&&action!=='walk') setAction(other,'react');
  };

  renderBackground();
  function loop(now){renderActors(now);requestAnimationFrame(loop)}
  requestAnimationFrame(loop);
  window.StickmeCartoonV2={setAction,setScene,state};
})();
