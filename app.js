const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const scriptInput=$('#scriptInput'),generateBtn=$('#generateBtn'),timeline=$('#timeline'),sceneCount=$('#sceneCount'),speech=$('#speech'),sceneTitle=$('#sceneTitle'),playBtn=$('#playBtn'),progress=$('#progress'),timecode=$('#timecode'),paywall=$('#paywall');
let scenes=[],activeScene=0,playing=false,timer=null,elapsed=0,total=0;
const demo=`SCENE 1 — Office Kitchen\nMAYA: Who keeps stealing my lunch?\nJORDAN: Maybe your sandwich chose freedom.\nMAYA: My sandwich had my NAME on it.\n\nSCENE 2 — Hallway\nJordan slowly backs away holding a suspicious brown bag.\nMAYA: Is that my lunch?\nJORDAN: This? No. This is... evidence.\n\nSCENE 3 — Break Room\nMaya opens the bag. It is full of celery.\nMAYA: You replaced my sandwich with CELERY?\nJORDAN: I was trying to help your cholesterol.`;
function esc(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function parseScript(text){
  const chunks=text.split(/(?=^SCENE\s+\d+)/gmi).map(x=>x.trim()).filter(Boolean);
  const src=chunks.length?chunks:[text.trim()];
  return src.filter(Boolean).map((chunk,i)=>{
    const lines=chunk.split(/\n+/).map(x=>x.trim()).filter(Boolean);
    const header=lines[0].match(/^SCENE\s+\d+\s*[—:-]?\s*(.*)$/i);
    const title=header?.[1]||`Scene ${i+1}`;
    const body=header?lines.slice(1):lines;
    const dialogue=body.map(line=>{const m=line.match(/^([A-Z][A-Z0-9 _-]{1,20}):\s*(.+)$/);return m?{speaker:m[1].trim(),text:m[2].trim()}:{speaker:'DIRECTOR',text:line}});
    return {title,dialogue,duration:Math.max(6,Math.min(28,dialogue.reduce((n,d)=>n+d.text.split(/\s+/).length*.32,3)))};
  })
}
function renderTimeline(){
  sceneCount.textContent=`${scenes.length} scene${scenes.length===1?'':'s'}`;
  if(!scenes.length){timeline.innerHTML='<div class="timeline-empty">Your generated scenes will appear here.</div>';return}
  timeline.innerHTML=scenes.map((s,i)=>`<div class="scene-card ${i===activeScene?'active':''}" data-i="${i}"><div class="thumb">${i%2?'🎬':'🎭'}</div><strong>${String(i+1).padStart(2,'0')} · ${esc(s.title)}</strong><small>${s.duration.toFixed(0)} sec · ${s.dialogue.length} beats</small></div>`).join('');
  $$('.scene-card').forEach(c=>c.onclick=()=>{activeScene=+c.dataset.i;renderTimeline();showScene(activeScene)});
}
function showScene(i){
  const s=scenes[i]; if(!s)return;
  sceneTitle.textContent=`SCENE ${i+1} · ${s.title.toUpperCase()}`;
  speech.textContent=s.dialogue[0]?.text||s.title;
  $$('.stick').forEach(x=>x.classList.remove('speaking'));
  $('.person-a').classList.add('speaking');
}
function generate(){
  scenes=parseScript(scriptInput.value);
  activeScene=0;elapsed=0;total=scenes.reduce((n,s)=>n+s.duration,0);
  renderTimeline();showScene(0);progress.style.width='0%';timecode.textContent=`00:00 / ${fmt(total)}`;
  generateBtn.textContent='Movie generated ✓';setTimeout(()=>generateBtn.textContent='Regenerate movie',1400);
}
function fmt(sec){sec=Math.max(0,Math.round(sec));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function stop(){playing=false;clearInterval(timer);playBtn.textContent='▶';$$('.stick').forEach(x=>x.classList.remove('speaking'))}
function play(){
  if(!scenes.length)return generate();
  if(playing)return stop();
  if(elapsed>=total)elapsed=0;
  playing=true;playBtn.textContent='❚❚';
  timer=setInterval(()=>{
    elapsed+=.2;progress.style.width=`${Math.min(100,elapsed/total*100)}%`;timecode.textContent=`${fmt(elapsed)} / ${fmt(total)}`;
    let acc=0,idx=0;for(let i=0;i<scenes.length;i++){acc+=scenes[i].duration;if(elapsed<=acc){idx=i;break}}
    if(idx!==activeScene){activeScene=idx;renderTimeline();showScene(idx)}
    const s=scenes[activeScene];if(s){const before=scenes.slice(0,activeScene).reduce((n,x)=>n+x.duration,0);const local=Math.max(0,elapsed-before);const beat=s.dialogue[Math.floor(local/Math.max(1,s.duration/s.dialogue.length))%s.dialogue.length];if(beat){speech.textContent=beat.text;$$('.stick').forEach(x=>x.classList.remove('speaking'));(beat.speaker==='DIRECTOR'?$('.person-a'):(Math.floor(local*2)%2?$('.person-b'):$('.person-a'))).classList.add('speaking')}}
    if(elapsed>=total)stop();
  },200)
}
scriptInput.addEventListener('input',()=>$('#charCount').textContent=`${scriptInput.value.length.toLocaleString()} characters`);
generateBtn.onclick=generate;playBtn.onclick=play;
$('#loadDemo').onclick=()=>{scriptInput.value=demo;scriptInput.dispatchEvent(new Event('input'));location.hash='studio';setTimeout(generate,250)};
$$('.format').forEach(b=>b.onclick=()=>{$$('.format').forEach(x=>x.classList.remove('active'));b.classList.add('active');const stage=$('#previewStage');stage.className='preview-stage '+({'16:9':'ratio-169','9:16':'ratio-916','1:1':'ratio-11'}[b.dataset.format])});
function openPaywall(){paywall.classList.remove('hidden')}$('#exportBtn').onclick=openPaywall;$('#buyBtn').onclick=openPaywall;$('#closeModal').onclick=()=>paywall.classList.add('hidden');paywall.onclick=e=>{if(e.target===paywall)paywall.classList.add('hidden')};
$('#checkoutBtn').onclick=()=>{alert('Stripe checkout will connect here next. The clean export remains locked until payment confirmation.');};
