(()=>{
  const URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
  const KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
  const TABLE='invencoes_ranking';
  const SCORE_PREFIX='R2|';
  const MANUAL_PREFIX='R2M|';
  const LOCAL_V2='led_noise_sessions_v2';
  const SETTINGS=window.SOM_TURMA_SETTINGS||(window.SOM_TURMA_SETTINGS={periodSeconds:15,periodPoints:1,medalPoints:40,workPoints:5,noStopPoints:1});
  function periodMs(){return Math.max(1,Math.min(300,Number(SETTINGS.periodSeconds)||15))*1000}
  function periodPoints(){return Math.max(1,Math.min(100,Math.floor(Number(SETTINGS.periodPoints)||1)))}
  function medalTarget(){return Math.max(1,Math.min(10000,Math.floor(Number(SETTINGS.medalPoints)||40)))}
  function workPoints(){return Math.max(1,Math.min(100,Math.floor(Number(SETTINGS.workPoints)||5)))}
  function noStopPoints(){const n=Number(SETTINGS.noStopPoints);return Math.max(0,Math.min(100,Math.floor(Number.isFinite(n)?n:1)))}

  const roomInput=document.getElementById('roomInput');
  const sensitivityInput=document.getElementById('sensitivity');
  const sensitivityLive=document.getElementById('sensitivityLive');
  const pauseBtn=document.getElementById('pauseBtn');
  const monitor=document.getElementById('monitor');
  const title=document.getElementById('stateTitle');
  const subtitle=document.getElementById('stateSubtitle');
  const meter=document.getElementById('meterFill');
  const releaseBtn=document.getElementById('releaseBtn');

  if(roomInput)roomInput.placeholder='TURMA';
  if(sensitivityInput)sensitivityInput.value='90';
  if(sensitivityLive)sensitivityLive.value='90';

  thresholds=function(){
    const f=1.65-(Math.max(0,Math.min(100,sensitivity))/100)*1.35;
    return{quiet:.028*f,loud:.082*f};
  };
  setSensitivity(90);

  const style=document.createElement('style');
  style.textContent=`
    .legend{grid-template-columns:repeat(4,1fr)}
    .monitor.listen-wait .state-copy h2{font-size:clamp(40px,7vw,88px);letter-spacing:-.025em}
    .monitor.listen-wait .state-copy p{font-size:clamp(110px,20vw,260px);line-height:.82;margin-top:36px;font-variant-numeric:tabular-nums}
    .manual-points-field{max-width:none;margin-top:2px}
    .manual-points-row{display:grid;grid-template-columns:100px 1fr 1fr;gap:10px}
    .manual-points-row input{width:100%;padding:12px 10px;border:2px solid #cbd5e1;border-radius:16px;font-size:26px;font-weight:950;text-align:center}
    .manual-points-row button{border:0;border-radius:16px;background:#e2e8f0;color:#0f172a;font-weight:950;font-size:16px;padding:12px 14px;cursor:pointer;min-height:48px}
    .manual-points-row .remove{background:#fee2e2;color:#991b1b}
    .manual-points-row button:disabled{opacity:.55;cursor:wait}
    .manual-points-msg{min-height:20px;margin-top:7px;font-size:13px;font-weight:900;color:#166534}
    .focus-progress{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;opacity:.9}
    .focus-track{height:10px;border-radius:999px;background:#ffffff35;border:1px solid #ffffff60;overflow:hidden}
    .focus-fill{height:100%;width:0;background:#fff;border-radius:999px;transition:width .1s linear}
    .focus-label{font-size:14px;font-weight:950;font-variant-numeric:tabular-nums;min-width:68px;text-align:right}
    .focus-progress.earned .focus-track{background:#ffffff66}
    .focus-progress.earned .focus-fill{box-shadow:0 0 16px #fff}
    .focus-progress.earned .focus-label{transform:scale(1.08)}
    .work-done{background:#ffffff2c!important;border-color:#ffffffaa!important}
    .point-live.point-pop{animation:pointPop .45s ease}
    @keyframes pointPop{0%{transform:scale(1)}45%{transform:scale(1.12)}100%{transform:scale(1)}}
    .stop-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
    .stop-actions .external-noise{background:#e0f2fe!important;color:#0c4a6e!important}
    .ranking-medals .rank-grid{grid-template-columns:1fr}
    .ranking-medals .rank-card.records-card{display:none}
    .medal-data{display:grid;justify-items:end;gap:2px}
    .medal-data b{font-size:21px}
    .medal-data span{font-size:12px;color:#64748b}
    .sensor-note{font-size:11px;color:#64748b;text-align:center;margin-top:8px;font-weight:700}
    @media(max-width:760px){.legend{grid-template-columns:1fr 1fr}.manual-points-row{grid-template-columns:80px 1fr 1fr}.manual-points-row button{font-size:14px;padding:10px 8px}.focus-label{font-size:12px;min-width:58px}}
  `;
  document.head.appendChild(style);

  document.querySelector('.legend-item.perfect')?.remove();
  const quietLegend=document.querySelector('.legend-item.quiet');
  if(quietLegend)quietLegend.textContent='🧠 FOCO TOTAL';
  const talkLegend=document.querySelector('.legend-item.talk');
  if(talkLegend)talkLegend.textContent='💬 CONVERSA';

  const micField=sensitivityInput?.closest('.field');
  if(micField&&!micField.querySelector('.sensor-note')){
    const note=document.createElement('div');
    note.className='sensor-note';
    note.textContent='NÍVEL RELATIVO DE SOM • NÃO MEDE dB';
    micField.appendChild(note);
  }

  const oldManual=document.querySelector('.manual-points-field');
  if(oldManual)oldManual.remove();
  const manualField=document.createElement('div');
  manualField.className='field manual-points-field';
  manualField.innerHTML=`
    <label for="manualPoints">⭐ AJUSTAR PONTOS DA TURMA</label>
    <div class="manual-points-row">
      <input id="manualPoints" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" aria-label="Quantidade de pontos">
      <button id="manualAddBtn" type="button">+ ADICIONAR</button>
      <button id="manualRemoveBtn" class="remove" type="button">− REMOVER</button>
    </div>
    <div id="manualPointsMsg" class="manual-points-msg" aria-live="polite"></div>`;
  roomInput?.closest('.field')?.after(manualField);
  const manualInput=document.getElementById('manualPoints');
  const manualAddBtn=document.getElementById('manualAddBtn');
  const manualRemoveBtn=document.getElementById('manualRemoveBtn');
  const manualMsg=document.getElementById('manualPointsMsg');

  const oldFocusProgress=document.querySelector('.focus-progress');
  if(oldFocusProgress)oldFocusProgress.remove();
  const focusProgress=document.createElement('div');
  focusProgress.className='focus-progress';
  focusProgress.innerHTML=`<div class="focus-track"><div class="focus-fill"></div></div><div class="focus-label">🧠 0 / ${Math.floor(periodMs()/1000)}</div>`;
  const meterShell=monitor?.querySelector('.meter-shell');
  meterShell?.after(focusProgress);
  const focusFill=focusProgress.querySelector('.focus-fill');
  const focusLabel=focusProgress.querySelector('.focus-label');

  const toolsGroup=monitor?.querySelector('.teacher-tools > div:last-child');
  document.getElementById('workDoneBtn')?.remove();
  const workDoneBtn=document.createElement('button');
  workDoneBtn.id='workDoneBtn';
  workDoneBtn.className='mini work-done';
  workDoneBtn.type='button';
  workDoneBtn.textContent=`✅ TRABALHO +${workPoints()}`;
  toolsGroup?.prepend(workDoneBtn,document.createTextNode(' '));

  let externalBtn=document.getElementById('externalNoiseBtn');
  if(!externalBtn){
    externalBtn=document.createElement('button');
    externalBtn.id='externalNoiseBtn';
    externalBtn.className='btn external-noise';
    externalBtn.type='button';
    externalBtn.textContent='🌎 SOM EXTERNO — CONTINUAR';
    const wrap=document.createElement('div');
    wrap.className='stop-actions';
    releaseBtn?.parentNode?.insertBefore(wrap,releaseBtn);
    if(releaseBtn)wrap.appendChild(releaseBtn);
    wrap.appendChild(externalBtn);
  }
  if(releaseBtn)releaseBtn.textContent='🔊 SOM DA TURMA — RECOMEÇAR';
  const stopTitle=document.querySelector('#stopOverlay .stop-card h2');
  if(stopTitle)stopTitle.textContent='VAMOS REORGANIZAR O SOM';
  const stopText=document.querySelector('#stopOverlay .stop-card p');
  if(stopText)stopText.textContent='O SOM FICOU MUITO ALTO';
  const stopCountPill=document.getElementById('stopCount')?.closest('.pill');
  if(stopCountPill)stopCountPill.style.display='none';

  const rankingScreen=document.getElementById('ranking');
  rankingScreen?.classList.add('ranking-medals');
  const rankingTitle=rankingScreen?.querySelector('.rank-head h1');
  if(rankingTitle)rankingTitle.textContent='🏅 MEDALHAS DE MÉRITO';
  const pointsCard=document.getElementById('pointsRanking')?.closest('.rank-card');
  if(pointsCard){
    const h=pointsCard.querySelector('h2');
    if(h)h.textContent='🏅 CONQUISTAS DAS TURMAS';
  }
  const recordsCard=document.getElementById('recordRanking')?.closest('.rank-card');
  recordsCard?.classList.add('records-card');
  const rankingBtn=document.getElementById('rankingBtn');
  const summaryRankingBtn=document.getElementById('summaryRankingBtn');
  if(rankingBtn)rankingBtn.textContent='🏅 MEDALHAS';
  if(summaryRankingBtn)summaryRankingBtn.textContent='🏅 MEDALHAS';

  let lessonFocusPoints=0;
  let lessonWorkPoints=0;
  let silenceForPointMs=0;
  let focusFlashUntil=0;
  let lastWorkClick=0;
  let waitingForSilence=false;
  let waitRaf=0,waitLast=0,waitQuietMs=0,waitSmooth=0;
  let lastSent='',pending=null;
  let pendingStopSilenceMs=0;

  function cleanRoom(v){return String(v||'').trim().toUpperCase().replace(/\|/g,'').replace(/\s+/g,' ').slice(0,12)}
  function lessonPoints(){return lessonFocusPoints+lessonWorkPoints}
  function pointText(){
    const box=document.getElementById('pointLive');
    if(!box)return;
    box.textContent=`⭐ PONTOS DA AULA: ${lessonPoints()}`;
  }
  function updateFocusProgress(now=performance.now()){
    if(!focusFill||!focusLabel)return;
    if(now<focusFlashUntil){
      focusProgress.classList.add('earned');
      focusFill.style.width='100%';
      const maxSec=Math.floor(periodMs()/1000);
      focusLabel.textContent=`⭐ ${maxSec} / ${maxSec}`;
      return;
    }
    focusProgress.classList.remove('earned');
    const maxSec=Math.floor(periodMs()/1000);
    const sec=Math.min(maxSec,Math.floor(silenceForPointMs/1000));
    focusFill.style.width=Math.min(100,(silenceForPointMs/periodMs())*100)+'%';
    focusLabel.textContent=`🧠 ${sec} / ${maxSec}`;
  }
  function pulsePoints(){
    const box=document.getElementById('pointLive');
    if(!box)return;
    box.classList.remove('point-pop');
    void box.offsetWidth;
    box.classList.add('point-pop');
  }

  paint=function(state){
    const m=els.monitor,sub=document.getElementById('stateSubtitle'),ttl=document.getElementById('stateTitle');
    m.classList.remove('state-quiet','state-talk','state-loud','state-listen','state-perfect');
    m.classList.add('state-'+state);
    if(state==='quiet'){ttl.textContent='🧠 FOCO TOTAL';sub.textContent='ÓTIMO PARA CONCENTRAR'}
    if(state==='talk'){ttl.textContent='💬 CONVERSA';sub.textContent='CUIDE DO VOLUME'}
    if(state==='loud'){ttl.textContent='🔊 MUITO ALTO';sub.textContent='VAMOS DIMINUIR O SOM'}
    if(state==='listen'){ttl.textContent='👂 OUVIR';sub.textContent='FIQUE ATENTO'}
  };

  loop=function(now){
    if(!active)return;
    raf=requestAnimationFrame(loop);
    document.getElementById('timer').textContent=fmt(now-startAt);
    const delta=Math.min(100,Math.max(0,now-lastFrame));
    lastFrame=now;
    if(blocked||paused){updateFocusProgress(now);return}

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
    const next=smoothed<t.quiet?'quiet':smoothed<t.loud?'talk':'loud';
    const wasSilent=currentState==='quiet';
    const isSilent=next==='quiet';

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
      if(silenceForPointMs>=periodMs()){
        lessonFocusPoints+=periodPoints();
        silenceForPointMs-=periodMs();
        focusFlashUntil=now+650;
        pointText();
        pulsePoints();
      }
    }else{
      silenceForPointMs=0;
      if(next==='loud'){
        if(!loudSince)loudSince=now;
        if(now>unlockGraceUntil&&now-loudSince>900)triggerStop();
      }else loudSince=0;
    }

    updateFocusProgress(now);
    pointText();
    document.getElementById('liveRecord').textContent=fmt(maxQuietMs);
  };

  triggerStop=function(){
    if(blocked||paused)return;
    blocked=true;
    pendingStopSilenceMs=silenceForPointMs;
    endQuietStreak();
    beep();
    document.getElementById('stopRoom').textContent=room;
    document.getElementById('stopOverlay').classList.remove('hidden');
  };

  function turmaNoise(){
    if(!blocked)return;
    stops++;
    lessonFocusPoints=0;
    silenceForPointMs=0;
    pointText();
    updateFocusProgress();
    releaseStop();
  }
  function externalNoise(){
    if(!blocked)return;
    silenceForPointMs=pendingStopSilenceMs;
    pointText();
    updateFocusProgress();
    releaseStop();
  }
  if(releaseBtn)releaseBtn.onclick=turmaNoise;
  if(externalBtn)externalBtn.onclick=externalNoise;

  if(workDoneBtn){
    workDoneBtn.onclick=()=>{
      if(!active||blocked)return;
      const now=performance.now();
      if(now-lastWorkClick<800)return;
      lastWorkClick=now;
      lessonWorkPoints+=workPoints();
      pointText();
      pulsePoints();
      workDoneBtn.textContent=`✅ +${workPoints()} PONTOS!`;
      setTimeout(()=>{if(workDoneBtn)workDoneBtn.textContent=`✅ TRABALHO +${workPoints()}`},850);
    };
  }

  const baseStartLesson=startLesson;
  startLesson=async function(){
    lessonFocusPoints=0;
    lessonWorkPoints=0;
    silenceForPointMs=0;
    focusFlashUntil=0;
    await baseStartLesson();
    if(active){pointText();updateFocusProgress();setPauseLabel()}
  };
  document.getElementById('startBtn').onclick=startLesson;

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
    nonQuietSince=0;loudSince=0;smoothed=0;
    currentState='quiet';quietStreakStart=now;
    paint('quiet');
    if(meter)meter.style.width='0%';
    setPauseLabel();
    pointText();
    updateFocusProgress();
  }

  function waitLoop(now){
    if(!waitingForSilence||!active||blocked)return;
    waitRaf=requestAnimationFrame(waitLoop);
    const delta=Math.min(100,Math.max(0,now-waitLast));
    waitLast=now;
    const rms=readRms();
    waitSmooth=waitSmooth*.72+rms*.28;
    const isQuiet=waitSmooth<thresholds().quiet;
    if(isQuiet)waitQuietMs+=delta;else waitQuietMs=0;
    if(subtitle)subtitle.textContent=String(Math.min(5,Math.floor(waitQuietMs/1000)));
    if(meter)meter.style.width=(isQuiet?Math.min(100,(waitQuietMs/5000)*100):0)+'%';
    if(waitQuietMs>=5000)finishWaiting();
  }

  function beginWaiting(){
    if(!active||blocked)return;
    const now=performance.now();
    if(currentState==='quiet')endQuietStreak(now);
    silenceForPointMs=0;
    focusFlashUntil=0;
    paused=true;waitingForSilence=true;
    nonQuietSince=0;loudSince=0;waitQuietMs=0;waitSmooth=0;waitLast=now;
    currentState='listen';
    document.getElementById('settingsPanel')?.classList.add('hidden');
    showWaiting();pointText();updateFocusProgress();
    cancelAnimationFrame(waitRaf);
    waitRaf=requestAnimationFrame(waitLoop);
  }

  if(pauseBtn){
    pauseBtn.onclick=()=>{
      if(!active||blocked)return;
      if(waitingForSilence||paused)resumeNormal();else beginWaiting();
    };
    setPauseLabel();
  }

  localSessions=function(){
    try{const x=JSON.parse(localStorage.getItem(LOCAL_V2)||'[]');return Array.isArray(x)?x:[]}
    catch(e){return[]}
  };
  writeLocal=function(rows){try{localStorage.setItem(LOCAL_V2,JSON.stringify(rows.slice(-500)))}catch(e){}};

  encodedName=function(s){
    if(s.manual)return`${MANUAL_PREFIX}${s.room}|${s.point}|${String(s.id).slice(-8)}`;
    return`${SCORE_PREFIX}${s.room}|${s.point}|${Math.max(0,Math.floor(s.record))}|${String(s.id).slice(-8)}`;
  };

  saveOnline=async function(s){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,{
      method:'POST',
      headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify({nome:encodedName(s),pontos:s.manual?0:s.point})
    });
    if(!r.ok)throw new Error('save '+r.status);
  };

  onlineSessions=async function(){
    const q=new URLSearchParams({select:'nome,pontos,criado_em',nome:'like.R2*',order:'criado_em.asc',limit:'2000'});
    const r=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${q}`,{headers:{apikey:SUPABASE_KEY}});
    if(!r.ok)throw new Error('load '+r.status);
    return(await r.json()).map(row=>{
      const p=String(row.nome||'').split('|');
      if(p[0]==='R2'&&p.length>=4)return{room:sanitizeRoom(p[1]),point:Math.max(0,Number(p[2])||0),record:Number(p[3])||0,ts:row.criado_em||0,manual:false};
      if(p[0]==='R2M'&&p.length>=3)return{room:sanitizeRoom(p[1]),point:Number(p[2])||0,record:0,ts:row.criado_em||0,manual:true};
      return null;
    }).filter(Boolean);
  };

  function timeValue(v){
    if(typeof v==='number')return v;
    const n=Date.parse(v||'');
    return Number.isFinite(n)?n:0;
  }

  function medalStates(rows){
    const map=new Map();
    const ordered=[...rows].sort((a,b)=>timeValue(a.ts)-timeValue(b.ts));
    for(const s of ordered){
      if(!s.room)continue;
      const k=s.room.toUpperCase();
      const x=map.get(k)||{room:k,medals:0,progress:0,record:0,lessons:0};
      const delta=Number(s.point)||0;
      if(delta>=0){
        x.progress+=delta;
        while(x.progress>=medalTarget()){x.medals++;x.progress-=medalTarget()}
      }else{
        x.progress=Math.max(0,x.progress+delta);
      }
      x.record=Math.max(x.record,Number(s.record)||0);
      if(!s.manual)x.lessons++;
      map.set(k,x);
    }
    return[...map.values()];
  }

  function drawMedals(rows){
    const box=document.getElementById('pointsRanking');
    if(!box)return;
    box.innerHTML='';
    if(!rows.length){box.innerHTML='<div class="empty">SEM RESULTADOS</div>';return}
    rows.forEach((x,i)=>{
      const r=document.createElement('div');
      r.className='rank-row';
      r.innerHTML=`<div class="rank-pos">${i+1}º</div><div class="rank-room">${x.room}<div class="hint">${x.progress}/${medalTarget()} para a próxima</div></div><div class="rank-data medal-data"><b>🏅 ${x.medals}</b><span>${x.progress} pontos</span></div>`;
      box.appendChild(r);
    });
  }

  async function syncPendingV2(){
    for(const s of localSessions().filter(x=>!x.synced)){
      try{await saveOnline(s);markSynced(s.id)}catch(e){break}
    }
  }

  renderRanking=async function(){
    show('ranking');
    const status=document.getElementById('rankStatus');
    status.textContent='...';
    let rows;
    try{
      await syncPendingV2();
      rows=await onlineSessions();
      status.textContent='● ONLINE';
      status.className='status-note online';
    }catch(e){
      rows=localSessions();
      status.textContent='● NESTE COMPUTADOR';
      status.className='status-note offline';
    }
    const states=medalStates(rows).sort((a,b)=>b.medals-a.medals||b.progress-a.progress||a.room.localeCompare(b.room,'pt-BR'));
    drawMedals(states);
  };
  if(rankingBtn)rankingBtn.onclick=renderRanking;
  if(summaryRankingBtn)summaryRankingBtn.onclick=renderRanking;

  async function currentProgressFor(roomName){
    try{
      const rows=await onlineSessions();
      const found=medalStates(rows).find(x=>x.room===roomName);
      return found?found.progress:0;
    }catch(e){
      const found=medalStates(localSessions()).find(x=>x.room===roomName);
      return found?found.progress:0;
    }
  }

  async function adjustManual(sign){
    const r=cleanRoom(roomInput?.value);
    if(!r){manualMsg.style.color='#991b1b';manualMsg.textContent='ESCOLHA A TURMA';roomInput?.focus();return}
    let value=Math.max(1,Math.min(99,Math.floor(Number(manualInput?.value)||1)));
    if(manualInput)manualInput.value=String(value);

    manualAddBtn.disabled=true;
    manualRemoveBtn.disabled=true;
    manualMsg.style.color='#64748b';
    manualMsg.textContent='SALVANDO...';

    if(sign<0){
      const progress=await currentProgressFor(r);
      if(progress<=0){
        manualMsg.style.color='#92400e';manualMsg.textContent=`${r} NÃO TEM PONTOS SOLTOS PARA REMOVER`;
        manualAddBtn.disabled=false;manualRemoveBtn.disabled=false;
        return;
      }
      value=Math.min(value,progress);
    }

    const delta=sign*value;
    const s={id:'M'+sessionId(),room:r,point:delta,record:0,duration:0,quietPct:0,stops:0,ts:Date.now(),synced:false,manual:true};
    const rows=localSessions();rows.push(s);writeLocal(rows);

    try{
      await saveOnline(s);markSynced(s.id);
      manualMsg.style.color='#166534';
      manualMsg.textContent=sign>0?`✅ +${value} PARA ${r}`:`✅ −${value} DE ${r}`;
    }catch(e){
      manualMsg.style.color='#92400e';
      manualMsg.textContent=sign>0?`💾 +${value} PARA ${r} NESTE COMPUTADOR`:`💾 −${value} DE ${r} NESTE COMPUTADOR`;
    }finally{
      manualAddBtn.disabled=false;manualRemoveBtn.disabled=false;
      if(manualInput)manualInput.value='1';
    }
  }

  if(manualAddBtn)manualAddBtn.onclick=()=>adjustManual(1);
  if(manualRemoveBtn)manualRemoveBtn.onclick=()=>adjustManual(-1);

  finishLesson=async function(){
    if(!active)return;
    const now=performance.now();
    if(!paused&&!blocked&&currentState==='quiet')endQuietStreak(now);
    const duration=now-startAt,endedRoom=room;
    stopAudio();
    document.getElementById('stopOverlay').classList.add('hidden');
    blocked=false;paused=false;waitingForSilence=false;
    cancelAnimationFrame(waitRaf);monitor?.classList.remove('listen-wait');
    if(document.fullscreenElement)document.exitFullscreen?.();

    const record=Math.round(maxQuietMs/1000);
    const quietPct=measuredMs?Math.min(100,Math.round(quietMs/measuredMs*100)):0;
    const noStopBonus=stops===0?noStopPoints():0;
    const total=lessonPoints()+noStopBonus;
    const s={id:sessionId(),room:endedRoom,point:total,record,duration:Math.round(duration/1000),quietPct,stops,ts:Date.now(),synced:false,manual:false,focusPoints:lessonFocusPoints,workPoints:lessonWorkPoints,noStopBonus};
    const rows=localSessions();rows.push(s);writeLocal(rows);

    document.getElementById('summaryRoom').textContent='🏫 '+endedRoom;
    const banner=document.getElementById('resultBanner');
    banner.className='result-banner '+(total?'win':'no-point');
    document.getElementById('resultTitle').textContent=total?`⭐ ${total} PONTO${total===1?'':'S'}!`:(stops?'⛔ 0 PONTOS':'FIM DA AULA');
    document.getElementById('resultText').textContent=total?(stops?'VOCÊS SE REORGANIZARAM!':(noStopBonus?'🎯 +'+noStopBonus+' POR AULA SEM PARALISAÇÃO':'PARABÉNS, TURMA!')):(stops?'VAMOS RECOMEÇAR!':'VAMOS CONQUISTAR PONTOS NA PRÓXIMA!');
    document.getElementById('summaryRecord').textContent=fmt(record*1000);
    document.getElementById('summaryQuiet').textContent=quietPct+'%';
    document.getElementById('summaryStops').textContent=stops;
    document.getElementById('summaryDuration').textContent=fmt(duration);

    if(roomInput)roomInput.value='';
    room='';document.getElementById('roomLabel').textContent='Turma';
    show('summary');
    document.getElementById('saveStatus').textContent='SALVANDO...';
    try{await saveOnline(s);markSynced(s.id);document.getElementById('saveStatus').textContent='✅ SALVO';document.getElementById('saveStatus').className='status-note online'}
    catch(e){document.getElementById('saveStatus').textContent='💾 SALVO NESTE COMPUTADOR';document.getElementById('saveStatus').className='status-note offline'}
  };
  document.getElementById('finishBtn').onclick=finishLesson;
  document.getElementById('finishBlockedBtn').onclick=finishLesson;
  document.getElementById('newBtn').onclick=()=>{if(roomInput)roomInput.value='';show('setup');roomInput?.focus()};

  function currentRoom(){
    const setupVisible=!document.getElementById('setup')?.classList.contains('hidden');
    const fromInput=(roomInput?.value||'').trim().toUpperCase();
    const label=document.getElementById('roomLabel')?.textContent||'';
    const fromLabel=label.replace(/^\s*🏫\s*/,'').trim();
    return(setupVisible?fromInput:(fromLabel||fromInput)).replace(/\|/g,'').slice(0,12);
  }
  function logicalState(){
    const stop=document.getElementById('stopOverlay'),summary=document.getElementById('summary');
    if(stop&&!stop.classList.contains('hidden'))return'BLOCK';
    if(monitor&&!monitor.classList.contains('hidden'))return monitor.classList.contains('state-listen')?'LISTEN':'MONITOR';
    if(summary&&!summary.classList.contains('hidden'))return'OFF';
    return'OFF';
  }
  async function publish(state){
    const r=currentRoom(),k=`${state}|${r}`;
    if(k===lastSent)return;lastSent=k;
    try{
      await fetch(`${URL}/rest/v1/${TABLE}`,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({nome:`CTRL|${Date.now()}|${state}|${r}`,pontos:0})});
    }catch(e){lastSent=''}
  }
  function syncSoon(){clearTimeout(pending);pending=setTimeout(()=>publish(logicalState()),80)}
  const observer=new MutationObserver(syncSoon);
  ['monitor','stopOverlay','summary','setup'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{attributes:true,attributeFilter:['class']})});
  roomInput?.addEventListener('change',()=>{lastSent='';syncSoon()});
  syncSoon();
})();
