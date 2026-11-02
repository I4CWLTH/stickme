// Stickme Story Director v3: converts plain-English prompts into visual scene direction.
(() => {
  const input = document.querySelector('#scriptInput');
  const generate = document.querySelector('#generateBtn');
  if (!input || !generate) return;

  function detectWorld(text='') {
    const t=text.toLowerCase();
    if (/boat|fishing|fish|lake|ocean|river|water|sea/.test(t)) return 'boat';
    if (/park|tree|outside|outdoor|grass/.test(t)) return 'park';
    if (/restaurant|dinner|pizza|table|food/.test(t)) return 'restaurant';
    if (/bedroom|house|home|living room/.test(t)) return 'home';
    return 'default';
  }

  function isPlainStory(text='') {
    return text.trim() && !/^\s*SCENE\s+\d+/mi.test(text) && !/^\s*[A-Z][A-Z0-9 _-]{1,20}:\s+/m.test(text);
  }

  function visualStory(text='') {
    const world=detectWorld(text);
    const t=text.trim();
    if(world==='boat') {
      return {
        title:'Fishing Boat', cast:['GUY'],
        beats:[
          {speaker:'DIRECTOR',text:'Guy settles into the boat and starts fishing.',action:'react'},
          {speaker:'DIRECTOR',text:'The fishing line suddenly goes tight.',action:'surprised'},
          {speaker:'DIRECTOR',text:'A huge fish yanks the rod and pulls him forward.',action:'angry'},
          {speaker:'DIRECTOR',text:'He loses his balance and falls overboard.',action:'fall'},
          {speaker:'DIRECTOR',text:'SPLASH! He disappears into the water.',action:'surprised'}
        ]
      };
    }
    return {title:t.slice(0,48)||'Generated Scene',cast:['CHARACTER'],beats:[{speaker:'DIRECTOR',text:t,action:inferAction(t)}]};
  }

  const originalParse = parseScript;
  parseScript = function(text) {
    if(!isPlainStory(text)) return originalParse(text);
    const s=visualStory(text);
    return [{
      title:s.title,
      cast:s.cast,
      dialogue:s.beats,
      sourcePrompt:text,
      duration:Math.max(10,s.beats.length*3.1)
    }];
  };

  function drawBoatScene(){
    const svg=document.querySelector('#cartoonStage');
    if(!svg) return;
    const cam=svg.querySelector('#cameraLayer');
    const scene=cam?.children?.[0];
    if(!scene) return;
    scene.innerHTML=`
      <defs>
        <linearGradient id="skyG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8fd8f5"/><stop offset="1" stop-color="#d8f2fb"/></linearGradient>
        <linearGradient id="waterG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2c9fc5"/><stop offset="1" stop-color="#166f99"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="960" height="310" fill="url(#skyG)"/>
      <circle cx="790" cy="85" r="42" fill="#ffd76a" opacity=".95"/>
      <path d="M0 250 Q120 225 230 252 T470 248 T710 250 T960 242 V330 H0Z" fill="#75bb9a" opacity=".8"/>
      <rect x="0" y="300" width="960" height="240" fill="url(#waterG)"/>
      <path d="M0 334 Q80 315 160 334 T320 334 T480 334 T640 334 T800 334 T960 334" fill="none" stroke="#bceafa" stroke-width="8" opacity=".7"/>
      <path d="M275 392 Q475 435 690 392 L630 478 Q470 510 320 478Z" fill="#a66740" stroke="#4a2b20" stroke-width="7"/>
      <path d="M316 414 Q475 447 646 414" fill="none" stroke="#d9a26f" stroke-width="7"/>
      <rect x="465" y="335" width="12" height="82" rx="6" fill="#513529"/>
      <path d="M471 340 Q590 265 760 270" fill="none" stroke="#222" stroke-width="6" stroke-linecap="round"/>
      <path d="M760 270 Q806 300 827 350" fill="none" stroke="#d8edf4" stroke-width="2.5"/>
      <path d="M822 349 q18 -8 28 7 q-8 16 -28 8 q-9 -8 0 -15Z" fill="#f0b44d" stroke="#26333a" stroke-width="4"/>
      <circle cx="842" cy="356" r="2.5" fill="#111"/>
      <path d="M850 357 l13 -8 l-3 16Z" fill="#f0b44d" stroke="#26333a" stroke-width="3"/>
    `;
    const engine=window.StickmeCartoonV2;
    if(engine?.state?.actors?.length){
      const a=engine.state.actors[0],b=engine.state.actors[1];
      a.x=465;a.homeX=465;a.y=415;a.dir=1;a.name='GUY';
      b.x=1200;b.homeX=1200;
    }
  }

  function applyWorld(){
    const world=detectWorld(input.value);
    if(world==='boat') setTimeout(drawBoatScene,120);
  }

  generate.addEventListener('click',applyWorld);

  const oldLoad = window.StickmeCartoonV2?.setScene;
  if(oldLoad && !window.StickmeCartoonV2._storyWrapped){
    window.StickmeCartoonV2._storyWrapped=true;
  }
})();
