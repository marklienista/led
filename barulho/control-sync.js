(()=>{
  const URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
  const KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
  const TABLE='invencoes_ranking';
  let lastSent='';
  let pending=null;

  // Faixa ampliada: no máximo, o medidor reage a sons bem mais baixos.
  // Mantém o mesmo controle 0–100 para a interface continuar simples.
  try{
    thresholds=function(){
      const f=1.65-(Math.max(0,Math.min(100,sensitivity))/100)*1.35;
      return{quiet:.028*f,loud:.082*f};
    };
    setSensitivity(70);
  }catch(e){}

  // O modo OUVIR só começa após 5 segundos contínuos de silêncio.
  // Enquanto espera, o som continua sendo lido apenas para essa contagem:
  // não altera ponto, recorde nem percentual de silêncio da aula.
  const pauseBtn=document.getElementById('pauseBtn');
  const monitor=document.getElementById('monitor');
  const title=document.getElementById('stateTitle');
  const subtitle=document.getElementById('stateSubtitle');
  const meter=document.getElementById('meterFill');
  let waitingForSilence=false;
  let waitRaf=0;
  let waitLast=0;
  let waitQuietMs=0;
  let waitSmooth=0;

  const style=document.createElement('style');
  style.textContent=`
    .monitor.listen-wait .state-copy h2{font-size:clamp(40px,7vw,88px);letter-spacing:-.025em}
    .monitor.listen-wait .state-copy p{font-size:clamp(110px,20vw,260px);line-height:.82;margin-top:36px;font-variant-numeric:tabular-nums}
  `;
  document.head.appendChild(style);

  function setPauseLabel(){
    if(!pauseBtn)return;
    if(waitingForSilence)pauseBtn.textContent='✕ CANCELAR';
    else if(paused)pauseBtn.textContent='▶ VOLTAR';
    else pauseBtn.textContent='👂 OUVIR';
  }

  function readRms(){
    if(!analyser||!dataArray)return 1;
    analyser.getByteTimeDomainData(dataArray);
    let sum=0;
    for(let i=0;i<dataArray.length;i++){
      const x=(dataArray[i]-128)/128;
      sum+=x*x;
    }
    return Math.sqrt(sum/dataArray.length);
  }

  function showWaiting(){
    paint('listen');
    monitor?.classList.add('listen-wait');
    if(title)title.textContent='AGUARDANDO SILÊNCIO';
    if(subtitle)subtitle.textContent=String(Math.min(5,Math.floor(waitQuietMs/1000)));
    if(meter)meter.style.width='0%';
    setPauseLabel();
  }

  function finishWaiting(){
    waitingForSilence=false;
    cancelAnimationFrame(waitRaf);
    monitor?.classList.remove('listen-wait');
    currentState='listen';
    paint('listen');
    if(meter)meter.style.width='0%';
    setPauseLabel();
  }

  function resumeNormal(){
    waitingForSilence=false;
    cancelAnimationFrame(waitRaf);
    monitor?.classList.remove('listen-wait');
    paused=false;
    const now=performance.now();
    unlockGraceUntil=now+1500;
    nonQuietSince=0;
    loudSince=0;
    smoothed=0;
    currentState='quiet';
    quietStreakStart=now;
    paint('quiet');
    if(meter)meter.style.width='0%';
    setPauseLabel();
  }

  function waitLoop(now){
    if(!waitingForSilence||!active||blocked)return;
    waitRaf=requestAnimationFrame(waitLoop);
    const delta=Math.min(100,Math.max(0,now-waitLast));
    waitLast=now;
    const rms=readRms();
    waitSmooth=waitSmooth*.72+rms*.28;
    const quietLimit=thresholds().quiet;
    const isQuiet=waitSmooth<quietLimit;

    if(isQuiet)waitQuietMs+=delta;
    else waitQuietMs=0;

    if(subtitle)subtitle.textContent=String(Math.min(5,Math.floor(waitQuietMs/1000)));
    if(meter){
      const pct=isQuiet?Math.min(100,(waitQuietMs/5000)*100):0;
      meter.style.width=pct+'%';
    }

    if(waitQuietMs>=5000)finishWaiting();
  }

  function beginWaiting(){
    if(!active||blocked)return;
    const now=performance.now();
    if(currentState==='quiet')endQuietStreak(now);
    paused=true;
    waitingForSilence=true;
    nonQuietSince=0;
    loudSince=0;
    waitQuietMs=0;
    waitSmooth=0;
    waitLast=now;
    currentState='listen';
    document.getElementById('settingsPanel')?.classList.add('hidden');
    showWaiting();
    cancelAnimationFrame(waitRaf);
    waitRaf=requestAnimationFrame(waitLoop);
  }

  if(pauseBtn){
    pauseBtn.onclick=()=>{
      if(!active||blocked)return;
      if(waitingForSilence||paused)resumeNormal();
      else beginWaiting();
    };
    setPauseLabel();
  }

  function currentRoom(){
    const label=document.getElementById('roomLabel')?.textContent||'';
    const fromLabel=label.replace(/^\s*🏫\s*/,'').trim();
    const fromInput=(document.getElementById('roomInput')?.value||'').trim().toUpperCase();
    return (fromLabel||fromInput).replace(/\|/g,'').slice(0,12);
  }

  function logicalState(){
    const stop=document.getElementById('stopOverlay');
    const summary=document.getElementById('summary');
    if(stop&&!stop.classList.contains('hidden'))return 'BLOCK';
    if(monitor&&!monitor.classList.contains('hidden')){
      if(monitor.classList.contains('state-listen'))return 'LISTEN';
      return 'MONITOR';
    }
    if(summary&&!summary.classList.contains('hidden'))return 'OFF';
    return 'OFF';
  }

  async function publish(state){
    const room=currentRoom();
    const key=`${state}|${room}`;
    if(key===lastSent)return;
    lastSent=key;
    const nome=`CTRL|${Date.now()}|${state}|${room}`;
    try{
      await fetch(`${URL}/rest/v1/${TABLE}`,{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
        body:JSON.stringify({nome,pontos:0})
      });
    }catch(e){lastSent=''}
  }

  function syncSoon(){
    clearTimeout(pending);
    pending=setTimeout(()=>{
      if(monitor&&!monitor.classList.contains('hidden')&&!paused&&!waitingForSilence)setPauseLabel();
      publish(logicalState());
    },80);
  }

  const ids=['monitor','stopOverlay','summary','setup'];
  const observer=new MutationObserver(syncSoon);
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el)observer.observe(el,{attributes:true,attributeFilter:['class']});
  });
  document.getElementById('roomInput')?.addEventListener('change',()=>{lastSent='';syncSoon()});
  syncSoon();
})();
