(() => {
  const stage = document.querySelector('#previewStage');
  if (!stage) return;

  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.id='cartoonStage';
  svg.setAttribute('viewBox','0 0 960 540');
  svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  stage.prepend(svg);

  const cameraLayer=document.createElementNS(ns,'g');
  cameraLayer.id='cameraLayer';
  const sceneLayer=document.createElementNS(ns,'g');
  const actorLayer=document.createElementNS(ns,'g');
  cameraLayer.append(sceneLayer,actorLayer);
  svg.append(cameraLayer);

  const state={
    scene:'office',
    muted:false,
    camera:{x:0,y:0,scale:1,tx:0,ty:0,ts:1},
    actors:[
      {id:'a',name:'MAYA',x:275,y:405,homeX:275,dir:1,action:'idle',t0:performance.now(),variant:'a',speakingUntil:0,emotion:'neutral'},
      {id:'b',name:'JORDAN',x:680,y:405,homeX:680,dir:-1,action:'idle',t0:performance.now(),variant:'b',speakingUntil:0,emotion:'neutral'}
    ]
  };

  function setScene(title=''){
    const t=title.toLowerCase();
    state.scene=/kitchen|break/.test(t)?'kitchen':/hall/.test(t)?'hallway':'office';
    state.actors[0].x=275; state.actors[0].homeX=275; state.actors[0].dir=1;
    state.actors[1].x=680; state.actors[1].homeX=680; state.actors[1].dir=-1;
    setCamera('wide');
    renderBackground();
  }

  function renderBackground(){
    const hallway=state.scene==='hallway';
    const wallA=hallway?'#31535a':'#245f68';
    const wallB=hallway?'#243f47':'#183f48';
    let stripes='';
    for(let i=0;i<12;i++) stripes+=`<rect x="${i*80}" y="0" width="80" height="350" fill="${i%2?wallA:wallB}"/>`;
    sceneLayer.innerHTML=`
      ${stripes}
      <rect x="0" y="350" width="960" height="190" class="floor"/>
      <rect x="0" y="340" width="960" height="15" class="trim"/>
      <g class="set-dressing">
        <rect x="72" y="84" width="250" height="166" rx="4" class="window-frame"/>
        <rect x="87" y="99" width="220" height="136" rx="2" class="window-glass"/>
        <path d="M197 100 V235 M87 167 H307" class="window-bar"/>
      </g>
      <g class="poster-set">
        <rect x="414" y="76" width="130" height="160" class="frame"/>
        <rect x="429" y="91" width="100" height="130" class="frame-inner"/>
        <text x="479" y="128" class="poster-title">STICK</text>
        <text x="479" y="148" class="poster-sub">STUDIO</text>
        <circle cx="479" cy="180" r="17" fill="#f6c64b"/>
      </g>
      <g class="door-set">
        <path d="M786 82 Q850 48 916 83 L916 310 L786 310 Z" class="door"/>
        <rect x="818" y="112" width="66" height="158" fill="#245f73" stroke="#17232a" stroke-width="4"/>
        <circle cx="895" cy="198" r="6" fill="#f0ce75"/>
      </g>
      <g class="table-set">
        <ellipse cx="480" cy="482" rx="250" ry="30" class="shadow"/>
        <rect x="310" y="388" width="340" height="31" rx="8" class="desk-top"/>
        <rect x="342" y="418" width="18" height="94" class="desk-front"/>
        <rect x="600" y="418" width="18" height="94" class="desk-front"/>
      </g>`;
  }

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  function setCamera(mode, actorId){
    if(mode==='close'){
      const a=state.actors.find(x=>x.id===actorId)||state.actors[0];
      state.camera.ts=1.34;
      state.camera.tx=480-a.x*1.34;
      state.camera.ty=42;
    } else if(mode==='medium'){
      const a=state.actors.find(x=>x.id===actorId)||state.actors[0];
      state.camera.ts=1.16;
      state.camera.tx=480-a.x*1.16;
      state.camera.ty=18;
    } else {
      state.camera.ts=1;
      state.camera.tx=0;
      state.camera.ty=0;
    }
  }

  function facialMarkup(a,now,headY){
    const speaking=now<a.speakingUntil;
    const blink=Math.sin((now/1000)*1.35 + (a.id==='b'?1.6:0))>.965;
    const eyeH=blink?1.4:10;
    const eyeShift=a.dir*2.2;
    let mouth='';
    if(speaking){
      const open=.5+.5*Math.sin(now/72);
      mouth=`<ellipse cx="0" cy="${headY+18}" rx="${9+open*4}" ry="${5+open*7}" class="mouth-open"/>`;
    } else if(a.emotion==='angry'){
      mouth=`<path d="M-14 ${headY+23} Q0 ${headY+8} 14 ${headY+23}" class="feature"/>`;
    } else if(a.emotion==='surprised'){
      mouth=`<ellipse cx="0" cy="${headY+19}" rx="8" ry="11" class="mouth-open"/>`;
    } else if(a.emotion==='nervous'){
      mouth=`<path d="M-15 ${headY+18} Q-7 ${headY+10} 0 ${headY+18} Q7 ${headY+26} 15 ${headY+17}" class="feature"/>`;
    } else if(a.emotion==='thinking'){
      mouth=`<path d="M-10 ${headY+20} Q3 ${headY+15} 14 ${headY+18}" class="feature"/>`;
    } else {
      mouth=`<path d="M-15 ${headY+12} Q0 ${headY+28} 15 ${headY+12}" class="feature"/>`;
    }
    const brows=a.emotion==='angry'
      ?`<path d="M-27 ${headY-18} l18 9 M27 ${headY-18} l-18 9" class="brow"/>`
      :a.emotion==='nervous'
      ?`<path d="M-28 ${headY-14} Q-17 ${headY-23} -7 ${headY-17} M8 ${headY-17} Q18 ${headY-23} 28 ${headY-14}" class="brow"/>`
      :'';
    return `<ellipse cx="${-17+eyeShift}" cy="${headY-5}" rx="5" ry="${eyeH}" class="eye"/><ellipse cx="${17+eyeShift}" cy="${headY-5}" rx="5" ry="${eyeH}" class="eye"/>${brows}${mouth}`;
  }

  function handMarkup(x,y,flip=1,open=true){
    if(!open) return `<circle cx="${x}" cy="${y}" r="8" class="hand-fill"/>`;
    return `<g transform="translate(${x} ${y}) scale(${flip} 1)" class="cartoon-hand"><circle r="7" class="hand-palm"/><path d="M2 -2 l14 -8 M3 1 l16 0 M2 4 l13 9 M-1 5 l5 14" class="finger"/></g>`;
  }

  function actorSVG(a,now){
    const dt=(now-a.t0)/1000;
    const speaking=now<a.speakingUntil;
    const move=a.action==='walk'||a.action==='run';
    const speed=a.action==='run'?10:a.action==='walk'?6:2.25;
    const cyc=dt*speed;
    const stride=move?Math.sin(cyc)*32:0;
    const bounce=move?Math.abs(Math.sin(cyc))*9:Math.sin(dt*2.25)*2.2;
    const talkPulse=speaking?Math.sin(dt*9)*3:0;
    let bodyLean=0, bodyX=0, torsoSquash=1, headTilt=0;
    let leftHand={x:-58,y:-47,open:true}, rightHand={x:58,y:-47,open:true};
    let lElbow={x:-44,y:-70}, rElbow={x:44,y:-70};
    let lKnee={x:-20+stride*.45,y:36}, rKnee={x:20-stride*.45,y:36};
    let lFoot={x:-29+stride,y:94}, rFoot={x:29-stride,y:94};

    if(a.action==='point'||a.action==='angry'){
      bodyLean=8*a.dir; bodyX=5*a.dir;
      if(a.dir===1){rElbow={x:52,y:-82}; rightHand={x:108,y:-95,open:false};}
      else {lElbow={x:-52,y:-82}; leftHand={x:-108,y:-95,open:false};}
    }
    if(a.action==='react'){
      headTilt=-5*a.dir;
      if(a.dir===1){rightHand={x:28,y:-130,open:true};rElbow={x:38,y:-92};}
      else {leftHand={x:-28,y:-130,open:true};lElbow={x:-38,y:-92};}
    }
    if(a.action==='surprised'){
      bodyLean=-7*a.dir; torsoSquash=.98;
      leftHand={x:-70,y:-130,open:true}; rightHand={x:70,y:-130,open:true};
      lElbow={x:-53,y:-89}; rElbow={x:53,y:-89};
    }
    if(a.action==='dance'){
      leftHand={x:-63,y:-154,open:true};rightHand={x:63,y:-154,open:true};
      lElbow={x:-48,y:-108};rElbow={x:48,y:-108};bodyLean=Math.sin(cyc)*7;
    }
    if(speaking && !['angry','point','surprised','walk','run'].includes(a.action)){
      const g=Math.sin(dt*7)*12;
      if(a.dir===1){rightHand={x:62+g,y:-62-g*.25,open:true};rElbow={x:45,y:-79};}
      else {leftHand={x:-62-g,y:-62-g*.25,open:true};lElbow={x:-45,y:-79};}
    }

    const hipY=-16-bounce+talkPulse*.15;
    const shoulderY=-92-bounce;
    const headY=-141-bounce+talkPulse*.2;
    const outline=6.5;
    const hair=a.variant==='a'
      ?`<path d="M-43 ${headY-24} Q-29 ${headY-55} -4 ${headY-47} Q17 ${headY-60} 42 ${headY-28} M-10 ${headY-51} q-1 -22 12 -30 M17 ${headY-46} q16 -12 24 -24" class="hair"/>`
      :`<path d="M-42 ${headY-25} Q-20 ${headY-54} 8 ${headY-47} Q29 ${headY-49} 42 ${headY-26} M-6 ${headY-52} q9 -19 24 -24" class="hair"/>`;
    const cap=a.variant==='a'?`<path d="M-45 ${headY-31} Q-11 ${headY-57} 26 ${headY-39} L51 ${headY-29} Q9 ${headY-28} -45 ${headY-20} Z" class="hat"/>`:'';
    const motionLines=(a.action==='angry'||a.action==='surprised')?`<path d="M-78 ${headY-24} l-20 -10 M-81 ${headY-5} l-23 2 M76 ${headY-24} l21 -11" class="motion-line"/>`:'';

    return `<g class="actor actor-${a.id}" transform="translate(${a.x+bodyX} ${a.y}) scale(${a.dir} 1) rotate(${bodyLean})">
      <ellipse cx="0" cy="5" rx="54" ry="12" class="actor-shadow"/>
      ${motionLines}
      <path d="M-8 ${hipY} Q${lKnee.x} ${lKnee.y} ${lFoot.x} ${lFoot.y}" class="limb"/>
      <path d="M8 ${hipY} Q${rKnee.x} ${rKnee.y} ${rFoot.x} ${rFoot.y}" class="limb"/>
      <path d="M${lFoot.x-10} ${lFoot.y} Q${lFoot.x+6} ${lFoot.y+8} ${lFoot.x+24} ${lFoot.y+2}" class="feature"/>
      <path d="M${rFoot.x-8} ${rFoot.y} Q${rFoot.x+8} ${rFoot.y+8} ${rFoot.x+26} ${rFoot.y+1}" class="feature"/>
      <path d="M-34 ${shoulderY} Q0 ${shoulderY-13} 34 ${shoulderY} L31 ${hipY+7} Q0 ${hipY+20} -31 ${hipY+7} Z" class="char-body" transform="scale(1 ${torsoSquash})"/>
      <path d="M-29 ${shoulderY+7} Q${lElbow.x} ${lElbow.y} ${leftHand.x} ${leftHand.y}" class="limb arm-line"/>
      <path d="M29 ${shoulderY+7} Q${rElbow.x} ${rElbow.y} ${rightHand.x} ${rightHand.y}" class="limb arm-line"/>
      ${handMarkup(leftHand.x,leftHand.y,-1,leftHand.open)}${handMarkup(rightHand.x,rightHand.y,1,rightHand.open)}
      ${hair}${cap}
      <g transform="rotate(${headTilt} 0 ${headY})"><circle cx="0" cy="${headY}" r="51" class="char-head"/>${facialMarkup(a,now,headY)}</g>
    </g>`;
  }

  function renderActors(now){
    state.actors.forEach(a=>{
      if(a.action==='run'||a.action==='walk'){
        const speed=a.action==='run'?2.8:1.45;
        a.x += a.dir*speed;
        if(a.x>780){a.x=780;a.dir=-1}
        if(a.x<175){a.x=175;a.dir=1}
      } else if(a.action==='angry'||a.action==='point'){
        const other=state.actors.find(x=>x.id!==a.id);
        const desired=a.id==='a'?340:620;
        a.x=lerp(a.x,desired,.045);
        a.dir=other.x>a.x?1:-1;
      } else {
        a.x=lerp(a.x,a.homeX,.018);
      }
    });
    actorLayer.innerHTML=state.actors.map(a=>actorSVG(a,now)).join('');

    const c=state.camera;
    c.x=lerp(c.x,c.tx,.075); c.y=lerp(c.y,c.ty,.075); c.scale=lerp(c.scale,c.ts,.075);
    cameraLayer.setAttribute('transform',`translate(${c.x} ${c.y}) scale(${c.scale})`);
  }

  function setAction(actorId,action,text=''){
    const a=state.actors.find(x=>x.id===actorId); if(!a)return;
    a.action=action||'idle'; a.t0=performance.now();
    a.emotion=action==='angry'?'angry':action==='surprised'?'surprised':action==='react'?'thinking':'neutral';
    if(text){
      const words=text.trim().split(/\s+/).length;
      a.speakingUntil=performance.now()+Math.max(900,words*330);
    } else a.speakingUntil=0;
  }

  function chooseActor(beat){
    const txt=(beat?.speaker||'').toUpperCase();
    const first=(document.querySelector('.person-a .name-tag')?.textContent||'').toUpperCase();
    const second=(document.querySelector('.person-b .name-tag')?.textContent||'').toUpperCase();
    state.actors[0].name=first||'MAYA'; state.actors[1].name=second||'JORDAN';
    if(txt&&txt===second)return 'b';
    if(txt&&txt===first)return 'a';
    const body=(beat?.text||'').toLowerCase();
    if(second&&body.includes(second.toLowerCase()))return 'b';
    return 'a';
  }

  let voices=[];
  function loadVoices(){voices=window.speechSynthesis?.getVoices?.()||[]}
  loadVoices(); if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=loadVoices;
  function speakBeat(beat,actorId){
    if(state.muted||!window.speechSynthesis||beat?.speaker==='DIRECTOR'||!beat?.text)return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(beat.text);
    const english=voices.filter(v=>/^en[-_]/i.test(v.lang));
    if(english.length) u.voice=english[actorId==='a'?0:Math.min(1,english.length-1)];
    u.rate=1.03; u.pitch=actorId==='a'?1.08:.93; u.volume=.95;
    window.speechSynthesis.speak(u);
  }

  function directCamera(action,id,index){
    if(action==='angry'||action==='surprised'||action==='point') setCamera('close',id);
    else if(action==='walk'||action==='run') setCamera('wide');
    else setCamera(index%3===1?'medium':'wide',id);
  }

  const oldShowScene=window.showScene;
  if(typeof oldShowScene==='function') window.showScene=function(i){
    oldShowScene(i);
    try{setScene(window.scenes?.[i]?.title||'')}catch(_){setScene('')}
  };
  const oldAnimateBeat=window.animateBeat;
  if(typeof oldAnimateBeat==='function') window.animateBeat=function(beat,index=0){
    oldAnimateBeat(beat,index);
    const id=chooseActor(beat);
    const action=beat?.action||'react';
    const other=id==='a'?'b':'a';
    setAction(id,action,beat?.speaker==='DIRECTOR'?'':beat?.text||'');
    const listener=state.actors.find(x=>x.id===other);
    listener.action=action==='walk'||action==='run'?'idle':'react';
    listener.emotion=action==='angry'?'nervous':'thinking';
    listener.t0=performance.now();
    directCamera(action,id,index);
    speakBeat(beat,id);
  };

  // Preview sound toggle
  const playbar=document.querySelector('.playbar');
  if(playbar&&!document.querySelector('#soundToggle')){
    const btn=document.createElement('button');
    btn.id='soundToggle'; btn.className='sound-toggle'; btn.type='button'; btn.textContent='🔊'; btn.title='Toggle preview voices';
    btn.onclick=()=>{state.muted=!state.muted;btn.textContent=state.muted?'🔇':'🔊';if(state.muted&&window.speechSynthesis)window.speechSynthesis.cancel()};
    playbar.appendChild(btn);
  }

  renderBackground();
  function loop(now){renderActors(now);requestAnimationFrame(loop)}
  requestAnimationFrame(loop);
  window.StickmeCartoonV2={setAction,setScene,setCamera,state};
})();
