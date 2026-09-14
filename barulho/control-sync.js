(()=>{
  const URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
  const KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
  const TABLE='invencoes_ranking';
  const DATA_PREFIX='SD3';
  const POINT_MS=15000;
  const MEDAL_POINTS=40;
  const WORK_POINTS=5;

  // Perfis são propositalmente simples. Novas escolas entram apenas nesta lista.
  const PROFILES=[
    {id:'dilermando',name:'EMEF Dilermando',password:'Diler123'}
  ];

  const roomInput=document.getElementById('roomInput');
  const sensitivityInput=document.getElementById('sensitivity');
  const sensitivityLive=document.getElementById('sensitivityLive');
  const pauseBtn=document.getElementById('pauseBtn');
  const monitor=document.getElementById('monitor');
  const title=document.getElementById('stateTitle');
  const subtitle=document.getElementById('stateSubtitle');
  const meter=document.getElementById('meterFill');
  const releaseBtn=document.getElementById('releaseBtn');
  const setupSection=document.getElementById('setup');
  const rankingBtn=document.getElementById('rankingBtn');
  const summaryRankingBtn=document.getElementById('summaryRankingBtn');
  const dbStatus=document.getElementById('dbStatus');
  const roomField=roomInput?.closest('.field');

  let currentProfile=null;
  let experienceMode=false;
  let lessonFocusPoints=0;
  let lessonWorkPoints=0;
  let silenceForPointMs=0;
  let focusFlashUntil=0;
  let lastWorkClick=0;
  let waitingForSilence=false;
  let waitRaf=0,waitLast=0,waitQuietMs=0,waitSmooth=0;
  let pendingStopSilenceMs=0;

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
    .login-screen{position:fixed;inset:0;z-index:100;background:#eef2f7;display:grid;place-items:center;padding:28px}
    .login-screen.hidden{display:none!important}
    .login-panel{width:min(620px,100%)}
    .login-panel select,.login-panel input[type=password]{width:100%;padding:17px;border:2px solid #cbd5e1;border-radius:16px;font-size:22px;font-weight:900;background:#fff}
    .login-panel select:focus,.login-panel input[type=password]:focus{outline:3px solid #93c5fd;border-color:#2563eb}
    .login-error{min-height:22px;text-align:center;color:#991b1b;font-weight:900;margin-top:10px}
    .experience-btn{background:#e0f2fe!important;color:#0c4a6e!important}
    .profile-strip{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:-4px 0 18px}
    .profile-name{font-size:14px;font-weight:950;color:#475569}
    .profile-exit{border:0;background:#e2e8f0;border-radius:12px;padding:8px 11px;font-size:13px;font-weight:900;color:#334155}
    .experience-note{background:#e0f2fe;border:1px solid #bae6fd;color:#0c4a6e;border-radius:14px;padding:11px 14px;text-align:center;font-weight:900;margin-bottom:16px}
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

  // LOGIN ---------------------------------------------------------------
  const login=document.createElement('section');
  login.id='loginScreen';
  login.className='login-screen';
  login.innerHTML=`
    <div class="panel login-panel">
      <h1>🔇 Som da Turma</h1>
      <div class="field">
        <label for="profileSelect">🏫 PERFIL</label>
        <select id="profileSelect">${PROFILES.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="profilePassword">🔐 SENHA</label>
        <input id="profilePassword" type="password" autocomplete="current-password" placeholder="SENHA">
      </div>
      <div class="actions">
        <button id="loginBtn" class="btn primary" type="button">ENTRAR</button>
        <button id="experienceBtn" class="btn secondary experience-btn" type="button">🧪 EXPERIMENTAR SEM SALVAR</button>
      </div>
      <div id="loginError" class="login-error" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(login);
  setupSection?.classList.add('hidden');

  const setupPanel=setupSection?.querySelector('.panel');
  const profileStrip=document.createElement('div');
  profileStrip.className='profile-strip';
  profileStrip.innerHTML='<div id="activeProfileName" class="profile-name"></div><button id="profileExitBtn" class="profile-exit" type="button">↩ TROCAR PERFIL</button>';
  setupPanel?.prepend(profileStrip);
  const activeProfileName=document.getElementById('activeProfileName');
  const profileExitBtn=document.getElementById('profileExitBtn');

  const experienceNote=document.createElement('div');
  experienceNote.className='experience-note hidden';
  experienceNote.textContent='🧪 MODO EXPERIÊNCIA • SEM TURMA • NADA SERÁ SALVO';
  profileStrip?.after(experienceNote);

  function openLogin(){
    if(active)return;
    currentProfile=null;
    experienceMode=false;
    Object.values(els).forEach(el=>el.classList.add('hidden'));
    login.classList.remove('hidden');
    const pwd=document.getElementById('profilePassword');
    if(pwd)pwd.value='';
    document.getElementById('loginError').textContent='';
  }

  function applyModeUi(){
    roomField?.classList.toggle('hidden',experienceMode);
    manualField?.classList.toggle('hidden',experienceMode);
    rankingBtn?.classList.toggle('hidden',experienceMode);
    summaryRankingBtn?.classList.toggle('hidden',experienceMode);
    experienceNote.classList.toggle('hidden',!experienceMode);
    if(activeProfileName)activeProfileName.textContent=experienceMode?'🧪 EXPERIÊNCIA':`🏫 ${currentProfile?.name||''}`;
    const startBtn=document.getElementById('startBtn');
    if(startBtn)startBtn.textContent=experienceMode?'▶ COMEÇAR EXPERIÊNCIA':'▶ COMEÇAR';
    if(dbStatus){
      dbStatus.textContent=experienceMode?'🧪 NADA SERÁ SALVO':'● VERIFICANDO ONLINE...';
      dbStatus.className='status-note';
    }
  }

  function enterProfile(profile){
    currentProfile=profile;
    experienceMode=false;
    login.classList.add('hidden');
    if(roomInput)roomInput.value='';
    applyModeUi();
    show('setup');
    roomInput?.focus();
    probeOnline();
  }

  function enterExperience(){
    currentProfile=null;
    experienceMode=true;
    login.classList.add('hidden');
    if(roomInput)roomInput.value='';
    applyModeUi();
    show('setup');
  }

  document.getElementById('loginBtn').onclick=()=>{
    const id=document.getElementById('profileSelect').value;
    const pwd=document.getElementById('profilePassword').value;
    const profile=PROFILES.find(p=>p.id===id&&p.password===pwd);
    if(!profile){document.getElementById('loginError').textContent='PERFIL OU SENHA INCORRETOS';return}
    enterProfile(profile);
  };
  document.getElementById('profilePassword').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('loginBtn').click()});
  document.getElementById('experienceBtn').onclick=enterExperience;
  profileExitBtn.onclick=openLogin;

  // INTERFACE -----------------------------------------------------------
  document.querySelector('.legend-item.perfect')?.remove();
  const quietLegend=document.querySelector('.legend-item.quiet');
  const talkLegend=document.querySelector('.legend-item.talk');
  if(quietLegend)quietLegend.textContent='🧠 FOCO TOTAL';
  if(talkLegend)talkLegend.textContent='💬 CONVERSA';

  const micField=sensitivityInput?.closest('.field');
  if(micField&&!micField.querySelector('.sensor-note')){
    const note=document.createElement('div');
    note.className='sensor-note';
    note.textContent='NÍVEL RELATIVO DE SOM • NÃO MEDE dB';
    micField.appendChild(note);
  }

  const manualField=document.createElement('div');
  manualField.className='field manual-points-field';
  manualField.innerHTML=`
    <label for="manualPoints">⭐ AJUSTAR PONTOS</label>
    <div class="manual-points-row">
      <input id="manualPoints" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" aria-label="Quantidade de pontos">
      <button id="manualAddBtn" type="button">+ ADICIONAR</button>
      <button id="manualRemoveBtn" class="remove" type="button">− REMOVER</button>
    </div>
    <div id="manualPointsMsg" class="manual-points-msg" aria-live="polite"></div>`;
  roomField?.after(manualField);
  const manualInput=document.getElementById('manualPoints');
  const manualAddBtn=document.getElementById('manualAddBtn');
  const manualRemoveBtn=document.getElementById('manualRemoveBtn');
  const manualMsg=document.getElementById('manualPointsMsg');

  const focusProgress=document.createElement('div');
  focusProgress.className='focus-progress';
  focusProgress.innerHTML='<div class="focus-track"><div class="focus-fill"></div></div><div class="focus-label">🧠 0 / 15</div>';
  const meterShell=monitor?.querySelector('.meter-shell');
  meterShell?.after(focusProgress);
  const focusFill=focusProgress.querySelector('.focus-fill');
  const focusLabel=focusProgress.querySelector('.focus-label');

  const toolsGroup=monitor?.querySelector('.teacher-tools > div:last-child');
  const workDoneBtn=document.createElement('button');
  workDoneBtn.id='workDoneBtn';
  workDoneBtn.className='mini work-done';
  workDoneBtn.type='button';
  workDoneBtn.textContent=`✅ TRABALHO +${WORK_POINTS}`;
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
  const stopText=document.querySelector('#stopOverlay .stop-card p');
  if(stopTitle)stopTitle.textContent='VAMOS REORGANIZAR O SOM';
  if(stopText)stopText.textContent='O SOM PASSOU DO COMBINADO';
  const stopCountPill=document.getElementById('stopCount')?.closest('.pill');
  if(stopCountPill)stopCountPill.style.display='none';

  const rankingScreen=document.getElementById('ranking');
  rankingScreen?.classList.add('ranking-medals');
  const rankingTitle=rankingScreen?.querySelector('.rank-head h1');
  if(rankingTitle)rankingTitle.textContent='🏅 MEDALHAS DE MÉRITO';
  const pointsCard=document.getElementById('pointsRanking')?.closest('.rank-card');
  if(pointsCard){const h=pointsCard.querySelector('h2');if(h)h.textContent='🏅 CONQUISTAS DAS TURMAS'}
  const recordsCard=document.getElementById('recordRanking')?.closest('.rank-card');
  recordsCard?.classList.add('records-card');
  if(rankingBtn)rankingBtn.textContent='🏅 MEDALHAS';
  if(summaryRankingBtn)summaryRankingBtn.textContent='🏅 MEDALHAS';

  function cleanRoom(v){return String(v||'').trim().toUpperCase().replace(/\|/g,'').replace(/\s+/g,' ').slice(0,12)}
  function lessonPoints(){return lessonFocusPoints+lessonWorkPoints}

  function pointText(){
    const box=document.getElementById('pointLive');
    if(box)box.textContent=`⭐ PONTOS DA AULA: ${lessonPoints()}`;
  }

  function updateFocusProgress(now=performance.now()){
    if(!focusFill||!focusLabel)return;
    if(now<focusFlashUntil){
      focusProgress.classList.add('earned');
      focusFill.style.width='100%';
      focusLabel.textContent='⭐ 15 / 15';
      return;
    }
    focusProgress.classList.remove('earned');
    const sec=Math.min(15,Math.floor(silenceForPointMs/1000));
    focusFill.style.width=Math.min(100,(silenceForPointMs/POINT_MS)*100)+'%';
    focusLabel.textContent=`🧠 ${sec} / 15`;
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

  // AULA ---------------------------------------------------------------
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
    for(let i=0;i<dataArray.length;i++){const x=(dataArray[i]-128)/128;sum+=x*x}
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
      if(silenceForPointMs>=POINT_MS){
        lessonFocusPoints++;
        silenceForPointMs-=POINT_MS;
        focusFlashUntil=now+650;
        pointText();pulsePoints();
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
    document.getElementById('stopRoom').textContent=experienceMode?'EXPERIÊNCIA':room;
    document.getElementById('stopOverlay').classList.remove('hidden');
  };

  function turmaNoise(){
    if(!blocked)return;
    stops++;
    lessonFocusPoints=0;
    silenceForPointMs=0;
    pointText();updateFocusProgress();releaseStop();
  }

  function externalNoise(){
    if(!blocked)return;
    silenceForPointMs=pendingStopSilenceMs;
    pointText();updateFocusProgress();releaseStop();
  }
  if(releaseBtn)releaseBtn.onclick=turmaNoise;
  if(externalBtn)externalBtn.onclick=externalNoise;

  workDoneBtn.onclick=()=>{
    if(!active||blocked)return;
    const now=performance.now();
    if(now-lastWorkClick<800)return;
    lastWorkClick=now;
    lessonWorkPoints+=WORK_POINTS;
    pointText();pulsePoints();
    workDoneBtn.textContent=`✅ +${WORK_POINTS} PONTOS!`;
    setTimeout(()=>workDoneBtn.textContent=`✅ TRABALHO +${WORK_POINTS}`,850);
  };

  const baseStartLesson=startLesson;
  startLesson=async function(){
    lessonFocusPoints=0;lessonWorkPoints=0;silenceForPointMs=0;focusFlashUntil=0;
    let original='';
    if(experienceMode&&roomInput){original=roomInput.value;roomInput.value='EXPERIÊNCIA'}
    await baseStartLesson();
    if(experienceMode&&roomInput)roomInput.value=original;
    if(active){
      if(experienceMode){room='EXPERIÊNCIA';document.getElementById('roomLabel').textContent='🧪 EXPERIÊNCIA'}
      pointText();updateFocusProgress();setPauseLabel();
    }
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
    for(let i=0;i<dataArray.length;i++){const x=(dataArray[i]-128)/128;sum+=x*x}
    return Math.sqrt(sum/dataArray.length);
  }

  function showWaiting(){
    paint('listen');monitor?.classList.add('listen-wait');
    if(title)title.textContent='AGUARDANDO SILÊNCIO';
    if(subtitle)subtitle.textContent=String(Math.min(5,Math.floor(waitQuietMs/1000)));
    if(meter)meter.style.width='0%';
    setPauseLabel();
  }

  function finishWaiting(){
    waitingForSilence=false;cancelAnimationFrame(waitRaf);monitor?.classList.remove('listen-wait');
    currentState='listen';paint('listen');if(meter)meter.style.width='0%';setPauseLabel();
  }

  function resumeNormal(){
    waitingForSilence=false;cancelAnimationFrame(waitRaf);monitor?.classList.remove('listen-wait');paused=false;
    const now=performance.now();
    unlockGraceUntil=now+1500;nonQuietSince=0;loudSince=0;smoothed=0;currentState='quiet';quietStreakStart=now;
    paint('quiet');if(meter)meter.style.width='0%';setPauseLabel();pointText();updateFocusProgress();
  }

  function waitLoop(now){
    if(!waitingForSilence||!active||blocked)return;
    waitRaf=requestAnimationFrame(waitLoop);
    const delta=Math.min(100,Math.max(0,now-waitLast));waitLast=now;
    const rms=readRms();waitSmooth=waitSmooth*.72+rms*.28;
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
    silenceForPointMs=0;focusFlashUntil=0;paused=true;waitingForSilence=true;
    nonQuietSince=0;loudSince=0;waitQuietMs=0;waitSmooth=0;waitLast=now;currentState='listen';
    document.getElementById('settingsPanel')?.classList.add('hidden');
    showWaiting();pointText();updateFocusProgress();cancelAnimationFrame(waitRaf);waitRaf=requestAnimationFrame(waitLoop);
  }

  pauseBtn.onclick=()=>{
    if(!active||blocked)return;
    if(waitingForSilence||paused)resumeNormal();else beginWaiting();
  };
  setPauseLabel();

  // DADOS --------------------------------------------------------------
  function localKey(){return currentProfile?`som_turma_v3_${currentProfile.id}`:''}
  function localRows(){
    if(experienceMode||!currentProfile)return[];
    try{const rows=JSON.parse(localStorage.getItem(localKey())||'[]');return Array.isArray(rows)?rows:[]}catch(e){return[]}
  }
  function writeLocal(rows){
    if(experienceMode||!currentProfile)return;
    try{localStorage.setItem(localKey(),JSON.stringify(rows.slice(-800)))}catch(e){}
  }
  function markLocalSynced(id){
    const rows=localRows();
    const row=rows.find(x=>x.id===id);
    if(row){row.synced=true;writeLocal(rows)}
  }

  function encodeRow(s){
    const profile=currentProfile?.id||'';
    if(s.manual)return`${DATA_PREFIX}|${profile}|M|${s.room}|${s.point}|${String(s.id).slice(-10)}`;
    return`${DATA_PREFIX}|${profile}|S|${s.room}|${s.point}|${Math.max(0,Math.floor(s.record||0))}|${Math.max(0,Math.floor(s.focusPoints||0))}|${Math.max(0,Math.floor(s.workPoints||0))}|${String(s.id).slice(-10)}`;
  }

  async function saveOnlineRecord(s){
    if(experienceMode||!currentProfile)return;
    const encoded=encodeRow(s);
    const response=await fetch(`${URL}/rest/v1/${TABLE}`,{
      method:'POST',
      headers:{'apikey':KEY,'Content-Type':'application/json','Prefer':'return=representation'},
      body:JSON.stringify({nome:encoded,pontos:s.manual?0:Math.max(0,Number(s.point)||0)})
    });
    const text=await response.text();
    if(!response.ok)throw new Error(`HTTP ${response.status}${text?` • ${text.slice(0,140)}`:''}`);
    if(text){
      try{
        const rows=JSON.parse(text);
        if(Array.isArray(rows)&&rows.length&&String(rows[0].nome||'')!==encoded)throw new Error('confirmação divergente');
      }catch(e){if(e.message==='confirmação divergente')throw e}
    }
  }

  function parseOnlineRow(row){
    const p=String(row.nome||'').split('|');
    if(p[0]!==DATA_PREFIX||p[1]!==currentProfile?.id)return null;
    if(p[2]==='S'&&p.length>=9){
      return{id:p[8],room:cleanRoom(p[3]),point:Math.max(0,Number(p[4])||0),record:Math.max(0,Number(p[5])||0),focusPoints:Math.max(0,Number(p[6])||0),workPoints:Math.max(0,Number(p[7])||0),manual:false,ts:row.criado_em||0,synced:true};
    }
    if(p[2]==='M'&&p.length>=6){
      return{id:p[5],room:cleanRoom(p[3]),point:Number(p[4])||0,record:0,manual:true,ts:row.criado_em||0,synced:true};
    }
    return null;
  }

  async function onlineRows(){
    if(!currentProfile||experienceMode)return[];
    // Sem filtro LIKE: usa a mesma leitura simples que já funciona nos jogos e filtra por perfil no cliente.
    const url=`${URL}/rest/v1/${TABLE}?select=nome,pontos,criado_em&order=criado_em.asc&limit=5000`;
    const response=await fetch(url,{headers:{'apikey':KEY}});
    const text=await response.text();
    if(!response.ok)throw new Error(`HTTP ${response.status}${text?` • ${text.slice(0,140)}`:''}`);
    let raw=[];
    try{raw=JSON.parse(text)}catch(e){throw new Error('resposta online inválida')}
    return raw.map(parseOnlineRow).filter(Boolean);
  }

  async function syncPending(){
    if(experienceMode||!currentProfile)return;
    for(const s of localRows().filter(x=>!x.synced)){
      try{await saveOnlineRecord(s);markLocalSynced(s.id)}catch(e){throw e}
    }
  }

  async function probeOnline(){
    if(experienceMode||!currentProfile)return;
    if(dbStatus){dbStatus.textContent='● VERIFICANDO ONLINE...';dbStatus.className='status-note'}
    try{
      const r=await fetch(`${URL}/rest/v1/${TABLE}?select=nome&limit=1`,{headers:{'apikey':KEY}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      await syncPending();
      if(dbStatus){dbStatus.textContent=`● ONLINE • ${currentProfile.name}`;dbStatus.className='status-note online'}
    }catch(e){
      if(dbStatus){dbStatus.textContent=`● NESTE COMPUTADOR • ${currentProfile.name}`;dbStatus.className='status-note offline'}
    }
  }

  function timeValue(v){if(typeof v==='number')return v;const n=Date.parse(v||'');return Number.isFinite(n)?n:0}
  function medalStates(rows){
    const map=new Map();
    const ordered=[...rows].sort((a,b)=>timeValue(a.ts)-timeValue(b.ts));
    for(const s of ordered){
      if(!s.room)continue;
      const k=s.room.toUpperCase();
      const x=map.get(k)||{room:k,medals:0,progress:0,record:0,lessons:0};
      const delta=Number(s.point)||0;
      if(delta>=0){x.progress+=delta;while(x.progress>=MEDAL_POINTS){x.medals++;x.progress-=MEDAL_POINTS}}
      else x.progress=Math.max(0,x.progress+delta);
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
      const r=document.createElement('div');r.className='rank-row';
      r.innerHTML=`<div class="rank-pos">${i+1}º</div><div class="rank-room">${x.room}<div class="hint">${x.progress}/${MEDAL_POINTS} para a próxima</div></div><div class="rank-data medal-data"><b>🏅 ${x.medals}</b><span>${x.progress} pontos</span></div>`;
      box.appendChild(r);
    });
  }

  renderRanking=async function(){
    if(experienceMode||!currentProfile)return;
    show('ranking');
    const status=document.getElementById('rankStatus');
    status.textContent='...';
    let rows=[];
    try{
      await syncPending();
      rows=await onlineRows();
      const pending=localRows().filter(x=>!x.synced);
      rows.push(...pending);
      status.textContent=`● ONLINE • ${currentProfile.name}`;
      status.className='status-note online';
    }catch(e){
      rows=localRows();
      status.textContent='● NESTE COMPUTADOR';
      status.className='status-note offline';
    }
    const states=medalStates(rows).sort((a,b)=>b.medals-a.medals||b.progress-a.progress||a.room.localeCompare(b.room,'pt-BR'));
    drawMedals(states);
  };
  rankingBtn.onclick=renderRanking;
  summaryRankingBtn.onclick=renderRanking;

  async function currentProgressFor(roomName){
    let rows=[];
    try{await syncPending();rows=await onlineRows();rows.push(...localRows().filter(x=>!x.synced))}
    catch(e){rows=localRows()}
    const found=medalStates(rows).find(x=>x.room===roomName);
    return found?found.progress:0;
  }

  async function adjustManual(sign){
    if(experienceMode||!currentProfile)return;
    const r=cleanRoom(roomInput?.value);
    if(!r){manualMsg.style.color='#991b1b';manualMsg.textContent='ESCOLHA A TURMA';roomInput?.focus();return}
    let value=Math.max(1,Math.min(99,Math.floor(Number(manualInput?.value)||1));
    if(manualInput)manualInput.value=String(value);
    manualAddBtn.disabled=true;manualRemoveBtn.disabled=true;manualMsg.style.color='#64748b';manualMsg.textContent='SALVANDO...';
    if(sign<0){
      const progress=await currentProgressFor(r);
      if(progress<=0){manualMsg.style.color='#92400e';manualMsg.textContent=`${r} NÃO TEM PONTOS SOLTOS PARA REMOVER`;manualAddBtn.disabled=false;manualRemoveBtn.disabled=false;return}
      value=Math.min(value,progress);
    }
    const s={id:'M'+sessionId(),room:r,point:sign*value,record:0,ts:Date.now(),synced:false,manual:true};
    const rows=localRows();rows.push(s);writeLocal(rows);
    try{
      await saveOnlineRecord(s);markLocalSynced(s.id);
      manualMsg.style.color='#166534';manualMsg.textContent=sign>0?`✅ +${value} PARA ${r}`:`✅ −${value} DE ${r}`;
      if(dbStatus){dbStatus.textContent=`● ONLINE • ${currentProfile.name}`;dbStatus.className='status-note online'}
    }catch(e){
      manualMsg.style.color='#92400e';manualMsg.textContent=sign>0?`💾 +${value} PARA ${r} • SINCRONIZA DEPOIS`:`💾 −${value} DE ${r} • SINCRONIZA DEPOIS`;
      if(dbStatus){dbStatus.textContent='● NESTE COMPUTADOR';dbStatus.className='status-note offline'}
    }finally{manualAddBtn.disabled=false;manualRemoveBtn.disabled=false;if(manualInput)manualInput.value='1'}
  }
  manualAddBtn.onclick=()=>adjustManual(1);
  manualRemoveBtn.onclick=()=>adjustManual(-1);

  // ENCERRAMENTO -------------------------------------------------------
  finishLesson=async function(){
    if(!active)return;
    const now=performance.now();
    if(!paused&&!blocked&&currentState==='quiet')endQuietStreak(now);
    const duration=now-startAt;
    const endedRoom=experienceMode?'EXPERIÊNCIA':room;
    stopAudio();
    document.getElementById('stopOverlay').classList.add('hidden');
    blocked=false;paused=false;waitingForSilence=false;cancelAnimationFrame(waitRaf);monitor?.classList.remove('listen-wait');
    if(document.fullscreenElement)document.exitFullscreen?.();

    const record=Math.round(maxQuietMs/1000);
    const quietPct=measuredMs?Math.min(100,Math.round(quietMs/measuredMs*100)):0;
    const total=lessonPoints();

    document.getElementById('summaryRoom').textContent=experienceMode?'🧪 EXPERIÊNCIA':'🏫 '+endedRoom;
    const banner=document.getElementById('resultBanner');
    banner.className='result-banner '+(total?'win':'no-point');
    document.getElementById('resultTitle').textContent=total?`⭐ ${total} PONTO${total===1?'':'S'}!`:(stops?'0 PONTOS':'FIM DA AULA');
    document.getElementById('resultText').textContent=experienceMode?'MODO EXPERIÊNCIA • RESULTADO NÃO SALVO':total?(stops?'VOCÊS SE REORGANIZARAM!':'PARABÉNS, TURMA!'):(stops?'VAMOS RECOMEÇAR!':'VAMOS CONQUISTAR PONTOS NA PRÓXIMA!');
    document.getElementById('summaryRecord').textContent=fmt(record*1000);
    document.getElementById('summaryQuiet').textContent=quietPct+'%';
    document.getElementById('summaryStops').textContent=stops;
    document.getElementById('summaryDuration').textContent=fmt(duration);

    if(roomInput)roomInput.value='';
    room='';document.getElementById('roomLabel').textContent='Turma';
    show('summary');

    const saveStatus=document.getElementById('saveStatus');
    if(experienceMode){
      saveStatus.textContent='🧪 NÃO SALVO';saveStatus.className='status-note';
      return;
    }

    const s={id:sessionId(),room:endedRoom,point:total,record,duration:Math.round(duration/1000),quietPct,stops,ts:Date.now(),synced:false,manual:false,focusPoints:lessonFocusPoints,workPoints:lessonWorkPoints};
    const rows=localRows();rows.push(s);writeLocal(rows);
    saveStatus.textContent='SALVANDO ONLINE...';saveStatus.className='status-note';
    try{
      await saveOnlineRecord(s);markLocalSynced(s.id);
      saveStatus.textContent='✅ SALVO ONLINE';saveStatus.className='status-note online';
    }catch(e){
      saveStatus.textContent='💾 SALVO NESTE COMPUTADOR • SINCRONIZA DEPOIS';saveStatus.className='status-note offline';
    }
  };
  document.getElementById('finishBtn').onclick=finishLesson;
  document.getElementById('finishBlockedBtn').onclick=finishLesson;
  document.getElementById('newBtn').onclick=()=>{if(roomInput)roomInput.value='';show('setup');applyModeUi();if(!experienceMode)roomInput?.focus()};
})();