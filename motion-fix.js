// Stickme spatial motion layer: makes movement verbs move characters through the scene.
if (typeof motionClasses !== 'undefined' && !motionClasses.includes('run')) motionClasses.push('run');

const baseInferAction = inferAction;
inferAction = function(text='') {
  const t = text.toLowerCase();
  if (/\b(run|runs|running|sprint|sprints|dash|dashes|race|races|chase|chases|around the room|across the room)\b/.test(t)) return 'run';
  if (/\b(walk|walks|walking|backs away|back away|step|steps|pace|paces|approach|approaches|leave|leaves|enters|exits)\b/.test(t)) return 'walk';
  return baseInferAction(text);
};

function cancelSpatialMotion(el) {
  if (!el) return;
  if (el._stickmeTravel) {
    try { el._stickmeTravel.cancel(); } catch (_) {}
    el._stickmeTravel = null;
  }
  el.style.transform = '';
}

const baseResetCharacter = resetCharacter;
resetCharacter = function(el) {
  cancelSpatialMotion(el);
  baseResetCharacter(el);
};

function spatialTravel(el, action) {
  if (!el || !window.Element || !el.animate) return;
  cancelSpatialMotion(el);
  const stage = document.querySelector('#previewStage');
  const stageWidth = stage ? stage.getBoundingClientRect().width : 700;
  const direction = el.classList.contains('person-b') ? -1 : 1;
  const far = Math.max(180, stageWidth * (action === 'run' ? .52 : .38));
  const mid = far * .55;
  const hop = action === 'run' ? -10 : -5;
  const duration = action === 'run' ? 2300 : 3600;
  const frames = action === 'run'
    ? [
        {transform:'translate(0,0) scaleX(1)'},
        {transform:`translate(${direction*mid}px,${hop}px) scaleX(1)`},
        {transform:`translate(${direction*far}px,0) scaleX(1)`},
        {transform:`translate(${direction*mid*.25}px,${hop}px) scaleX(-1)`},
        {transform:`translate(${-direction*mid*.45}px,0) scaleX(-1)`},
        {transform:'translate(0,0) scaleX(1)'}
      ]
    : [
        {transform:'translate(0,0)'},
        {transform:`translate(${direction*mid}px,${hop}px)`},
        {transform:`translate(${direction*far}px,0)`},
        {transform:`translate(${direction*mid}px,${hop}px)`},
        {transform:'translate(0,0)'}
      ];
  el._stickmeTravel = el.animate(frames,{duration,iterations:Infinity,easing:'ease-in-out'});
}

const baseAnimateBeat = animateBeat;
animateBeat = function(beat,index=0) {
  baseAnimateBeat(beat,index);
  const scene = scenes[activeScene];
  if (!scene || !beat) return;
  const target = actorFor(scene,beat,index);
  if (beat.action === 'run' || beat.action === 'walk') spatialTravel(target,beat.action);
};
