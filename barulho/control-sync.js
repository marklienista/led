(()=>{
  const URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
  const KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
  const TABLE='invencoes_ranking';
  const SCORE_PREFIX='R2|';
  const LOCAL_V2='led_noise_sessions_v2';
  const POINT_MS=15000;
  let lastSent='';
  let pending=null;

  const roomInput=document.getElementById('roomInput');
  const sensitivityInput=document.getElementById('sensitivity');
  const sensitivityLive=document.getElementById('sensitivityLive');
  if(roomInput)roomInput.placeholder='TURMA';
  if(sensitivityInput)sensitivityInput.value='90';
  if(sensitivityLive)sensitivityLive.value='90';

  // Campo simples para o professor restaurar/atribuir pontos antes de iniciar a aula.
  const initialPointsField=document.createElement('div');
  initialPointsField.className='field initial-points-field';
  initialPointsField.innerHTML='<label for="initialPoints">⭐ PONTOS</label><input id="initialPoints" type="number" min="0" max="99" step="1" value="0" inputmode="numeric" aria-label="Pontos iniciais">';
  roomInput?.closest('.field')?.after(initialPointsField);
  const initialPointsInput=document.getElementById('initialPoints');

  function readInitialPoints(){
    const n=Math.floor(Number(initialPointsInput?.value)||0);
    return Math.max(0,Math.min(99,n));
  }

  thresholds=function(){
    const f=1.65-(Math.max(0,Math.min(100,sensitivity))/100)*1.35;
    const quiet=.028*f;
    return{perfect:quiet*.28,quiet,loud:.082*f};
  };
  setSensitivity(90);

  const style=document.createElement('style');
  style.textContent=`
    :root{--perfect:#7c3aed}
    .monitor.state-perfect{background:var(--perfect)}
    .legend{grid-template-columns:repeat(5,1fr)}
    .legend-item.perfect{background:var(--perfect)}
    .meter-shell{background:linear-gradient(90deg,#c4b5fd 0 6%,#ffffff45 6% 100%)}
    .monitor.listen-wait .state-copy h2{font-size:clamp(40px,7vw,88px);letter-spacing:-.025em}
    .monitor.listen-wait .state-copy p{font-size:clamp(110px,20vw,260px);line-height:.82;margin-top:36px;font-variant-numeric:tabular-nums}
    .initial-points-field{max-width:180px}
    .initial-points-field input{width:100%;padding:12px 14px;border:2px solid #cbd5e1;border-radius:16px;font-size:28px;font-weight:950;text-align:center}
    .initial-points-field input:focus{outline:3px solid #93c5fd;border-color:#2563eb}
    @media(max-width:760px){.legend{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);
  const legend=document.querySelector('.legend');
  if(legend&&!legend.querySelector('.perfect')){
    const item=document.createElement('div');
    item.className='legend-item perfect';
    item.textContent='✨ PERFEITO';
    legend.prepend(item);
  }

  let lessonPoints=0;
  let silenceForPointMs=0;

  function pointText(){
    const box=document.getElementById('pointLive');
    if(!box)return;
    const remaining=Math.max(0,Math.ceil((POINT_MS-silenceForPointMs)/1000));
    box.textContent=`⭐ PONTOS: ${lessonPoints}  •  +1 EM ${remaining}s`;
  }

  paint=function(state){
    const m=els.monitor,title=document.getElementById('stateTitle'),sub=document.getElementById('stateSubtitle');
    m.classList.remove('state-perfect','state-quiet','state-talk','state-loud','state-listen');
    m.classList.add('state-'+state);
    if(state==='perfect'){title.textContent='✨ PERFEITO';sub.textContent='TOTAL SILÊNCIO'}
    if(state==='quiet'){title.textContent='🤫 SILÊNCIO';sub.textContent='MUITO BEM!'}
    if(state==='talk'){title.textContent='💬 CONVERSA';sub.textContent='MAIS BAIXO'}
    if(state==='loud'){title.textContent='🔊 MUITO ALTO';sub.textContent='ABAIXE O SOM!'}
    if(state==='listen'){title.textContent='👂 OUVIR';sub.textContent='FIQUE ATENTO'}
  };

  loop=function(now){
    if(!active)return;
    raf=requestAnimationFrame(loop);
    document.getElementById('timer').textContent=fmt(now-startAt);
    const delta=Math.min(100,Math.max(0,now-lastFrame));
    lastFrame=now;
    if(blocked||paused)return;

    measuredMs+=delta;
    analyser.getByteTimeDomainData(dataArray);
    let sum=0;
    for(let i=0;i<dataArray.length;i++){
      const x=(dataArray[i]-128)/128;
      sum+=x*x;
    }
    const rms=Math.sqrt(sum/dataArray.length);
    smoothed=smoothed*.82+rms*.18;
    const t=thresholds();
    const next=smoothed<t.perfect?'perfect':smoothed<t.quiet?'quiet':smoothed<t.loud?'talk':'loud';
    const wasSilent=currentState==='perfect'||currentState==='quiet';
    const isSilent=next==='perfect'||next==='quiet';

    if(next!==currentState){
      if(wasSilent&&!isSilent)endQuietStreak(now);
      if(!wasSilent&&isSilent)quietStreakStart=now;
      currentState=next;
      paint(next);
    }

    document.getElementById('meterFill').style.width=levelPercent()+'%';

    if(isSilent){
      quietMs+=delta;
      if(!quietStreakStart)quietStreakStart=now;
      maxQuietMs=Math.max(maxQuietMs,now-quietStreakStart);
      loudSince=0;
      silenceForPointMs+=delta;
      while(silenceForPointMs>=POINT_MS){
        lessonPoints++;
        silenceForPointMs-=POINT_MS;
      }
    }else{
      silenceForPointMs=0;
      if(next==='loud'){
        if(!loudSince)loudSince=now;
        if(now>unlockGraceUntil&&now-loudSince>900)triggerStop();
      }else loudSince=0;
    }

    pointText();
    document.getElementById('liveRecord').textContent=fmt(maxQuietMs);
  };

  // AULA PARADA apaga os pontos conquistados até então.
  // Depois de continuar, a turma pode voltar a conquistar pontos normalmente.
  triggerStop=function(){
    if(blocked||paused)return;
    blocked=true;
    stops++;
    lessonPoints=0;
    silenceForPointMs=0;
    endQuietStreak();
    beep();
    pointText();
    document.getElementById('stopRoom').textContent=room;
    document.getElementById('stopCount').textContent=stops;
    document.getElementById('stopOverlay').classList.remove('hidden');
  };

  const baseStartLesson=startLesson;
  startLesson=async function(){
    lessonPoints=readInitialPoints();
    silenceForPointMs=0;
    await baseStartLesson();
    if(active)pointText();
  };
  document.getElementById('startBtn').onclick=startLesson;

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
    pointText();
  }

  function waitLoop(now){
    if(!waitingForSilence||!active||blocked)return;
    waitRaf=requestAnimationFrame(waitLoop);
    const delta=Math.min(100,Math.max(0,now-waitLast));
    waitLast=now;
    const rms=readRms();
    waitSmooth=waitSmooth*.72+rms*.28;
    const isQuiet=waitSmooth<thresholds().quiet;
    if(isQuiet)waitQuietMs+=delta;
    else waitQuietMs=0;
    if(subtitle)subtitle.textContent=String(Math.min(5,Math.floor(waitQuietMs/1000)));
    if(meter)meter.style.width=(isQuiet?Math.min(100,(waitQuietMs/5000)*100):0)+'%';
    if(waitQuietMs>=5000)finishWaiting();
  }

  function beginWaiting(){
    if(!active||blocked)return;
    const now=performance.now();
    if(currentState==='perfect'||currentState==='quiet')endQuietStreak(now);
    silenceForPointMs=0;
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
    pointText();
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

  localSessions=function(){
    try{const x=JSON.parse(localStorage.getItem(LOCAL_V2)||'[]');return Array.isArray(x)?x:[]}
    catch(e){return[]}
  };
  writeLocal=function(rows){try{localStorage.setItem(LOCAL_V2,JSON.stringify(rows.slice(-500)))}catch(e){}};
  encodedName=function(s){return`${SCORE_PREFIX}${s.room}|${s.point}|${Math.max(0,Math.floor(s.record))}|${String(s.id).slice(-8)}`};
  onlineSessions=async function(){
    const q=new URLSearchParams({select:'nome,pontos,criado_em',nome:'like.R2|*',order:'criado_em.desc',limit:'2000'});
    const r=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${q}`,{headers:{apikey:SUPABASE_KEY}});
    if(!r.ok)throw new Error('load '+r.status);
    return(await r.json()).map(row=>{
      const p=String(row.nome||'').split('|');
      return p[0]==='R2'&&p.length>=4?{room:sanitizeRoom(p[1]),point:Math.max(0,Number(p[2])||0),record:Number(p[3])||0,ts:row.criado_em||0}:null;
    }).filter(Boolean);
  };

  finishLesson=async function(){
    if(!active)return;
    const now=performance.now();
    if(!paused&&!blocked&&(currentState==='perfect'||currentState==='quiet'))endQuietStreak(now);
    const duration=now-startAt;
    const endedRoom=room;
    stopAudio();
    document.getElementById('stopOverlay').classList.add('hidden');
    blocked=false;
    paused=false;
    waitingForSilence=false;
    cancelAnimationFrame(waitRaf);
    monitor?.classList.remove('listen-wait');
    if(document.fullscreenElement)document.exitFullscreen?.();

    const record=Math.round(maxQuietMs/1000);
    const quietPct=measuredMs?Math.min(100,Math.round(quietMs/measuredMs*100)):0;
    const point=lessonPoints;
    const s={id:sessionId(),room:endedRoom,point,record,duration:Math.round(duration/1000),quietPct,stops,ts:Date.now(),synced:false};
    const rows=localSessions();rows.push(s);writeLocal(rows);

    document.getElementById('summaryRoom').textContent='🏫 '+endedRoom;
    const banner=document.getElementById('resultBanner');
    banner.className='result-banner '+(point?'win':'no-point');
    document.getElementById('resultTitle').textContent=point?`⭐ ${point} PONTO${point===1?'':'S'}!`:(stops?'⛔ 0 PONTOS':'FIM DA AULA');
    document.getElementById('resultText').textContent=point?(stops?'VOCÊS RECUPERARAM OS PONTOS!':'PARABÉNS, TURMA!'):(stops?'VAMOS RECOMEÇAR!':'VAMOS CONQUISTAR PONTOS NA PRÓXIMA!');
    document.getElementById('summaryRecord').textContent=fmt(record*1000);
    document.getElementById('summaryQuiet').textContent=quietPct+'%';
    document.getElementById('summaryStops').textContent=stops;
    document.getElementById('summaryDuration').textContent=fmt(duration);

    if(roomInput)roomInput.value='';
    if(initialPointsInput)initialPointsInput.value='0';
    room='';
    document.getElementById('roomLabel').textContent='Turma';

    show('summary');
    document.getElementById('saveStatus').textContent='SALVANDO...';
    try{
      await saveOnline(s);markSynced(s.id);
      document.getElementById('saveStatus').textContent='✅ SALVO';
      document.getElementById('saveStatus').className='status-note online';
    }catch(e){
      document.getElementById('saveStatus').textContent='💾 SALVO NESTE COMPUTADOR';
      document.getElementById('saveStatus').className='status-note offline';
    }
  };
  document.getElementById('finishBtn').onclick=finishLesson;
  document.getElementById('finishBlockedBtn').onclick=finishLesson;
  document.getElementById('newBtn').onclick=()=>{
    if(roomInput)roomInput.value='';
    if(initialPointsInput)initialPointsInput.value='0';
    show('setup');
    roomInput?.focus();
  };

  function currentRoom(){
    const setupVisible=!document.getElementById('setup')?.classList.contains('hidden');
    const fromInput=(roomInput?.value||'').trim().toUpperCase();
    const label=document.getElementById('roomLabel')?.textContent||'';
    const fromLabel=label.replace(/^\s*🏫\s*/,'').trim();
    return (setupVisible?fromInput:(fromLabel||fromInput)).replace(/\|/g,'').slice(0,12);
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
    const r=currentRoom();
    const key=`${state}|${r}`;
    if(key===lastSent)return;
    lastSent=key;
    const nome=`CTRL|${Date.now()}|${state}|${r}`;
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
    pending=setTimeout(()=>publish(logicalState()),80);
  }

  const ids=['monitor','stopOverlay','summary','setup'];
  const observer=new MutationObserver(syncSoon);
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(el)observer.observe(el,{attributes:true,attributeFilter:['class']});
  });
  roomInput?.addEventListener('change',()=>{lastSent='';syncSoon()});
  syncSoon();
})();