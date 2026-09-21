(()=>{
  const DATA_PREFIX='SD3';
  const PROFILES=[
    {id:'dilermando',name:'EMEF Dilermando',passwordHash:'22ec5a1ec8c155e3aeee746421bacfdfe657893851ebf6e4c442afc657e59e96'}
  ];

  let currentProfile=null;
  let experienceMode=false;

  // Remove apenas caches das versões antigas do Som da Turma.
  try{
    localStorage.removeItem('led_noise_sessions_v1');
    localStorage.removeItem('led_noise_sessions_v2');
  }catch(e){}

  // A conexão Windows ficou fora desta etapa. Não grava comandos CTRL no banco.
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const body=typeof init?.body==='string'?init.body:'';
    if(body.includes('CTRL|'))return Promise.resolve(new Response('',{status:204,statusText:'No Content'}));
    return nativeFetch(input,init);
  };

  const setup=document.getElementById('setup');
  const roomInput=document.getElementById('roomInput');
  const roomField=roomInput?.closest('.field');
  const rankingBtn=document.getElementById('rankingBtn');
  const summaryRankingBtn=document.getElementById('summaryRankingBtn');
  const dbStatus=document.getElementById('dbStatus');
  const startBtn=document.getElementById('startBtn');

  const css=document.createElement('style');
  css.textContent=`
    .profile-login{position:fixed;inset:0;z-index:1000;background:#eef2f7;display:grid;place-items:center;padding:28px}
    .profile-login.hidden{display:none!important}
    .profile-login .panel{width:min(620px,100%)}
    .profile-login select,.profile-login input[type=password]{width:100%;padding:17px;border:2px solid #cbd5e1;border-radius:16px;font-size:22px;font-weight:900;background:#fff}
    .profile-login select:focus,.profile-login input[type=password]:focus{outline:3px solid #93c5fd;border-color:#2563eb}
    .profile-login-error{min-height:22px;text-align:center;color:#991b1b;font-weight:900;margin-top:10px}
    .experience-btn{background:#e0f2fe!important;color:#0c4a6e!important}
    .profile-strip{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:-4px 0 18px}
    .profile-name{font-size:14px;font-weight:950;color:#475569}
    .profile-exit{border:0;background:#e2e8f0;border-radius:12px;padding:8px 11px;font-size:13px;font-weight:900;color:#334155}
    .experience-note{background:#e0f2fe;border:1px solid #bae6fd;color:#0c4a6e;border-radius:14px;padding:11px 14px;text-align:center;font-weight:900;margin-bottom:16px}
  `;
  document.head.appendChild(css);

  const login=document.createElement('section');
  login.className='profile-login';
  login.innerHTML=`
    <div class="panel">
      <h1>🔇 Som da Turma</h1>
      <div class="field">
        <label for="schoolProfile">🏫 PERFIL</label>
        <select id="schoolProfile">${PROFILES.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
      </div>
      <div class="field">
        <label for="schoolPassword">🔐 SENHA</label>
        <input id="schoolPassword" type="password" autocomplete="current-password" placeholder="SENHA">
      </div>
      <div class="actions">
        <button id="schoolLoginBtn" class="btn primary" type="button">ENTRAR</button>
        <button id="tryModeBtn" class="btn secondary experience-btn" type="button">🧪 EXPERIMENTAR SEM SALVAR</button>
      </div>
      <div id="schoolLoginError" class="profile-login-error" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(login);
  setup?.classList.add('hidden');

  const strip=document.createElement('div');
  strip.className='profile-strip';
  strip.innerHTML='<div id="profileName" class="profile-name"></div><button id="profileExit" class="profile-exit" type="button">↩ TROCAR PERFIL</button>';
  setup?.querySelector('.panel')?.prepend(strip);
  const expNote=document.createElement('div');
  expNote.className='experience-note hidden';
  expNote.textContent='🧪 MODO EXPERIÊNCIA • SEM TURMA • NADA SERÁ SALVO';
  strip.after(expNote);

  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const digest=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function localKey(){return currentProfile?`som_turma_v3_${currentProfile.id}`:''}
  function scopedLocalSessions(){
    if(experienceMode||!currentProfile)return[];
    try{const rows=JSON.parse(localStorage.getItem(localKey())||'[]');return Array.isArray(rows)?rows:[]}catch(e){return[]}
  }
  function scopedWriteLocal(rows){
    if(experienceMode||!currentProfile)return;
    try{localStorage.setItem(localKey(),JSON.stringify(rows.slice(-800)))}catch(e){}
  }
  function scopedMarkSynced(id){
    const rows=scopedLocalSessions();
    const row=rows.find(x=>x.id===id);
    if(row){row.synced=true;scopedWriteLocal(rows)}
  }
  function cleanRoom(v){return String(v||'').trim().toUpperCase().replace(/\|/g,'').replace(/\s+/g,' ').slice(0,12)}

  const SOM_TURMA_TABLE='som_turma_eventos';

  function encode(s){
    const profile=currentProfile?.id||'';
    if(s.manual)return `${DATA_PREFIX}|${profile}|M|${cleanRoom(s.room)}|${Number(s.point)||0}|${String(s.id).slice(-10)}`;
    return `${DATA_PREFIX}|${profile}|S|${cleanRoom(s.room)}|${Math.max(0,Number(s.point)||0)}|${Math.max(0,Number(s.record)||0)}|${Math.max(0,Number(s.focusPoints)||0)}|${Math.max(0,Number(s.workPoints)||0)}|${String(s.id).slice(-10)}`;
  }

  function toDbRow(s){
    return {
      perfil:currentProfile.id,
      turma:cleanRoom(s.room),
      tipo:s.manual?'ajuste':'sessao',
      pontos:Number(s.point)||0,
      recorde_seg:Math.max(0,Number(s.record)||0),
      foco_pontos:Math.max(0,Number(s.focusPoints)||0),
      trabalho_pontos:Math.max(0,Number(s.workPoints)||0),
      paradas:Math.max(0,Number(s.stops)||0),
      duracao_seg:Math.max(0,Number(s.duration)||0),
      silencio_pct:Math.max(0,Math.min(100,Number(s.quietPct)||0)),
      sessao_id:String(s.id)
    };
  }

  function fromDbRow(row){
    return {
      room:cleanRoom(row.turma),
      point:Number(row.pontos)||0,
      record:Math.max(0,Number(row.recorde_seg)||0),
      focusPoints:Math.max(0,Number(row.foco_pontos)||0),
      workPoints:Math.max(0,Number(row.trabalho_pontos)||0),
      stops:Math.max(0,Number(row.paradas)||0),
      duration:Math.max(0,Number(row.duracao_seg)||0),
      quietPct:Math.max(0,Math.min(100,Number(row.silencio_pct)||0)),
      id:String(row.sessao_id||''),
      manual:row.tipo==='ajuste',
      ts:row.criado_em||0,
      synced:true
    };
  }

  async function scopedSaveOnline(s){
    if(experienceMode||!currentProfile)return;
    const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${SOM_TURMA_TABLE}`,{
      method:'POST',
      headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify(toDbRow(s))
    });
    if(!response.ok){
      let detail='';try{detail=(await response.text()).slice(0,160)}catch(e){}
      if(dbStatus){dbStatus.textContent=`● ERRO ONLINE • ${response.status}`;dbStatus.className='status-note offline'}
      throw new Error(`HTTP ${response.status}${detail?' • '+detail:''}`);
    }
    if(dbStatus){dbStatus.textContent=`● ONLINE • ${currentProfile.name}`;dbStatus.className='status-note online'}
  }

  async function scopedOnlineSessions(){
    if(experienceMode||!currentProfile)return[];
    const q=new URLSearchParams({
      select:'perfil,turma,tipo,pontos,recorde_seg,foco_pontos,trabalho_pontos,paradas,duracao_seg,silencio_pct,sessao_id,criado_em',
      perfil:`eq.${currentProfile.id}`,
      order:'criado_em.asc',
      limit:'5000'
    });
    const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${SOM_TURMA_TABLE}?${q}`,{headers:{'apikey':SUPABASE_KEY}});
    if(!response.ok){
      let detail='';try{detail=(await response.text()).slice(0,160)}catch(e){}
      throw new Error(`HTTP ${response.status}${detail?' • '+detail:''}`);
    }
    return (await response.json()).map(fromDbRow);
  }
  // A lógica principal consulta estas funções dinamicamente.
  localSessions=scopedLocalSessions;
  writeLocal=scopedWriteLocal;
  markSynced=scopedMarkSynced;
  encodedName=encode;
  saveOnline=scopedSaveOnline;
  onlineSessions=scopedOnlineSessions;

  async function syncProfile(){
    if(experienceMode||!currentProfile)return;
    for(const row of scopedLocalSessions().filter(x=>!x.synced)){
      await scopedSaveOnline(row);
      scopedMarkSynced(row.id);
    }
  }

  async function probeOnline(){
    if(!currentProfile||experienceMode)return;
    if(dbStatus){dbStatus.textContent='● VERIFICANDO ONLINE...';dbStatus.className='status-note'}
    try{
      const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${SOM_TURMA_TABLE}?select=id&limit=1`,{headers:{'apikey':SUPABASE_KEY}});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      await syncProfile();
      if(dbStatus){dbStatus.textContent=`● ONLINE • ${currentProfile.name}`;dbStatus.className='status-note online'}
    }catch(e){
      if(dbStatus){dbStatus.textContent=`● NESTE COMPUTADOR • ${currentProfile.name}`;dbStatus.className='status-note offline'}
    }
  }

  function applyUi(){
    const manual=document.querySelector('.manual-points-field');
    roomField?.classList.toggle('hidden',experienceMode);
    manual?.classList.toggle('hidden',experienceMode);
    rankingBtn?.classList.toggle('hidden',experienceMode);
    summaryRankingBtn?.classList.toggle('hidden',experienceMode);
    expNote.classList.toggle('hidden',!experienceMode);
    document.getElementById('profileName').textContent=experienceMode?'🧪 EXPERIÊNCIA':`🏫 ${currentProfile?.name||''}`;
    if(startBtn)startBtn.textContent=experienceMode?'▶ COMEÇAR EXPERIÊNCIA':'▶ COMEÇAR';
    if(dbStatus){dbStatus.textContent=experienceMode?'🧪 NADA SERÁ SALVO':'● VERIFICANDO ONLINE...';dbStatus.className='status-note'}
  }

  function enter(profile){
    currentProfile=profile;experienceMode=false;
    login.classList.add('hidden');if(roomInput)roomInput.value='';applyUi();show('setup');roomInput?.focus();probeOnline();
  }
  function enterExperience(){
    currentProfile=null;experienceMode=true;
    login.classList.add('hidden');if(roomInput)roomInput.value='';applyUi();show('setup');
  }
  function exitProfile(){
    if(active)return;
    currentProfile=null;experienceMode=false;
    Object.values(els).forEach(el=>el.classList.add('hidden'));
    login.classList.remove('hidden');
    document.getElementById('schoolPassword').value='';
    document.getElementById('schoolLoginError').textContent='';
  }

  document.getElementById('schoolLoginBtn').onclick=async()=>{
    const id=document.getElementById('schoolProfile').value;
    const pwdHash=await sha256(document.getElementById('schoolPassword').value);
    const profile=PROFILES.find(p=>p.id===id&&p.passwordHash===pwdHash);
    if(!profile){document.getElementById('schoolLoginError').textContent='PERFIL OU SENHA INCORRETOS';return}
    enter(profile);
  };
  document.getElementById('schoolPassword').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('schoolLoginBtn').click()});
  document.getElementById('tryModeBtn').onclick=enterExperience;
  document.getElementById('profileExit').onclick=exitProfile;

  // Modo experiência: usa a atividade completa, sem turma e sem persistência.
  const enhancedStart=startLesson;
  startLesson=async function(){
    let previous='';
    if(experienceMode&&roomInput){previous=roomInput.value;roomInput.value='EXPERIÊNCIA'}
    await enhancedStart();
    if(experienceMode&&roomInput)roomInput.value=previous;
    if(experienceMode&&active){room='EXPERIÊNCIA';document.getElementById('roomLabel').textContent='🧪 EXPERIÊNCIA'}
  };
  document.getElementById('startBtn').onclick=startLesson;

  const enhancedFinish=finishLesson;
  finishLesson=async function(){
    await enhancedFinish();
    if(experienceMode){
      document.getElementById('summaryRoom').textContent='🧪 EXPERIÊNCIA';
      document.getElementById('resultText').textContent='MODO EXPERIÊNCIA • RESULTADO NÃO SALVO';
      const s=document.getElementById('saveStatus');s.textContent='🧪 NÃO SALVO';s.className='status-note';
    }
  };
  document.getElementById('finishBtn').onclick=finishLesson;
  document.getElementById('finishBlockedBtn').onclick=finishLesson;
  document.getElementById('newBtn').addEventListener('click',()=>setTimeout(applyUi,0));
})();