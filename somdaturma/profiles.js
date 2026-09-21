(()=>{
  const PROFILES=[
    {id:'dilermando',name:'EMEF Dilermando',passwordHash:'22ec5a1ec8c155e3aeee746421bacfdfe657893851ebf6e4c442afc657e59e96'}
  ];
  const SOM_TURMA_TABLE='som_turma_eventos';
  const CONFIG_TABLE='som_turma_configuracoes';
  const DEFAULT_SETTINGS={periodSeconds:15,periodPoints:1,medalPoints:40,workPoints:5,noStopPoints:1};

  let currentProfile=null;
  let experienceMode=false;
  let statsSeq=0;
  let settingsDirty=false;

  try{
    localStorage.removeItem('led_noise_sessions_v1');
    localStorage.removeItem('led_noise_sessions_v2');
  }catch(e){}

  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const body=typeof init?.body==='string'?init.body:'';
    if(body.includes('CTRL|'))return Promise.resolve(new Response('',{status:204,statusText:'No Content'}));
    return nativeFetch(input,init);
  };

  const setup=document.getElementById('setup');
  const setupPanel=setup?.querySelector('.panel');
  const roomInput=document.getElementById('roomInput');
  const roomField=roomInput?.closest('.field');
  const rankingBtn=document.getElementById('rankingBtn');
  const summaryRankingBtn=document.getElementById('summaryRankingBtn');
  const dbStatus=document.getElementById('dbStatus');
  const startBtn=document.getElementById('startBtn');
  const sensitivityInput=document.getElementById('sensitivity');
  const micField=sensitivityInput?.closest('.field');
  const legend=setupPanel?.querySelector('.legend');
  const micError=document.getElementById('micError');
  const setupActions=startBtn?.closest('.actions');
  const manualField=document.querySelector('.manual-points-field');
  const manualMsg=document.getElementById('manualPointsMsg');

  const css=document.createElement('style');
  css.textContent=`
    .profile-login{position:fixed;inset:0;z-index:1000;background:#eef2f7;overflow:auto;padding:22px 28px}
    .profile-login.hidden{display:none!important}
    .profile-login .public-shell{width:min(1320px,100%);min-height:calc(100vh - 44px);margin:auto;background:#fff;border:1px solid #dbe4ee;border-radius:28px;padding:30px;box-shadow:0 18px 50px #0f172a18;display:flex;flex-direction:column}
    .public-head{text-align:center;margin-bottom:24px}
    .public-head h1{font-size:clamp(44px,6vw,72px);line-height:1;margin:0 0 10px}
    .public-head p{margin:0 auto;max-width:760px;color:#64748b;font-weight:750;font-size:17px;line-height:1.45}
    .public-grid{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:18px;align-items:stretch;flex:1}
    .public-card{background:#f8fafc;border:1px solid #dbe4ee;border-radius:22px;padding:24px;min-width:0;display:flex;flex-direction:column}
    .public-card h2{font-size:24px;margin:0 0 18px}
    .public-card p{color:#64748b;line-height:1.45;margin:0 0 18px}
    .login-card select,.login-card input[type=password]{width:100%;padding:16px;border:2px solid #cbd5e1;border-radius:16px;font-size:21px;font-weight:900;background:#fff}
    .login-card select:focus,.login-card input[type=password]:focus{outline:3px solid #93c5fd;border-color:#2563eb}
    .login-card .field{margin-bottom:16px}
    .login-card .field label{font-size:16px}
    .login-card .actions{margin-top:auto}
    .login-card .actions .btn{flex:1;min-width:150px}
    .profile-login-error{min-height:22px;text-align:center;color:#991b1b;font-weight:900;margin-top:10px}
    .experience-btn{background:#e0f2fe!important;color:#0c4a6e!important}
    .resource-list{display:grid;gap:14px}
    .resource-link{display:block;text-decoration:none;color:#0f172a;background:#fff;border:1px solid #dbe4ee;border-radius:18px;padding:18px;transition:.15s}
    .resource-link:hover{transform:translateY(-1px);border-color:#94a3b8}
    .resource-link b{display:block;font-size:20px;margin-bottom:5px}
    .resource-link span{display:block;color:#64748b;font-size:14px;line-height:1.4}
    .resource-link .resource-action{margin-top:12px;font-size:12px;font-weight:950;color:#2563eb}
    .author-card{justify-content:space-between}
    .author-placeholder{min-height:250px;border:2px dashed #cbd5e1;border-radius:18px;display:grid;place-items:center;text-align:center;color:#94a3b8;font-weight:900;padding:24px}
    .public-footer{margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:12px;font-weight:800}
    @media(max-width:920px){
      .public-grid{grid-template-columns:1fr}
      .public-card{min-height:auto}
      .login-card{order:1}
      .resource-card{order:2}
      .author-card{order:3}
      .author-placeholder{min-height:140px}
    }
    @media(max-width:520px){.profile-login{padding:12px}.profile-login .public-shell{padding:18px;border-radius:22px}.public-card{padding:18px}.public-head h1{font-size:42px}}
    .setup{padding:18px 28px;place-items:start center}
    .setup .panel{width:min(1320px,100%);min-height:calc(100vh - 36px);padding:28px;display:flex;flex-direction:column}
    .setup .panel>h1{font-size:clamp(36px,5vw,58px);margin-bottom:22px}
    .setup-grid{display:grid;grid-template-columns:1.08fr .92fr 1fr;gap:18px;align-items:stretch;flex:1}
    .setup-card{background:#f8fafc;border:1px solid #dbe4ee;border-radius:22px;padding:22px;min-width:0;min-height:560px}
    .setup-card h2{margin:0 0 18px;font-size:23px}
    .profile-strip{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin:0 0 20px}
    .profile-name{font-size:22px;font-weight:950;color:#0f172a;line-height:1.15}
    .profile-exit{border:0;background:#e2e8f0;border-radius:12px;padding:8px 11px;font-size:12px;font-weight:900;color:#334155}
    .experience-note{background:#e0f2fe;border:1px solid #bae6fd;color:#0c4a6e;border-radius:14px;padding:10px 12px;text-align:center;font-weight:900;margin-bottom:16px;font-size:13px}
    .setup-card .field{margin-bottom:16px}
    .setup-card .field label{font-size:16px}
    .setup-card .field input[type=text]{font-size:25px;padding:14px}
    .turma-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:4px 0 16px}
    .turma-stat{background:#fff;border:1px solid #dbe4ee;border-radius:16px;padding:14px;text-align:center}
    .turma-stat b{display:block;font-size:28px;line-height:1.05}
    .turma-stat span{display:block;font-size:12px;font-weight:950;color:#64748b;margin-top:5px}
    .turma-points-progress{display:block;margin-top:6px;font-size:12px;font-weight:950;color:#64748b}
    .turma-next{grid-column:1/-1;text-align:center;font-size:12px;font-weight:900;color:#64748b;margin-top:-2px}
    .medal-wallet{grid-column:1/-1;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:14px;display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}
    .medal-wallet-value b{display:block;font-size:30px;line-height:1}
    .medal-wallet-value span{display:block;font-size:12px;font-weight:950;color:#9a3412;margin-top:5px}
    .use-medal-btn{border:0;border-radius:13px;background:#b45309;color:#fff;padding:11px 14px;font-weight:950;font-size:13px}
    .use-medal-btn:disabled{background:#d6d3d1;color:#78716c;cursor:default}
    .medal-use-note{grid-column:1/-1;font-size:11px;line-height:1.35;color:#78716c;font-weight:800}
    .medal-use-msg{grid-column:1/-1;min-height:16px;font-size:12px;font-weight:950;color:#166534}
    .manual-points-field{margin-top:0!important;margin-bottom:8px!important}
    .manual-points-row{grid-template-columns:76px 1fr 1fr!important}
    .manual-points-row input{font-size:22px!important;padding:10px 8px!important}
    .manual-points-row button{font-size:13px!important;padding:10px 8px!important;min-height:44px!important}
    .setup-card .actions{margin-top:18px;justify-content:flex-start}
    .setup-card .actions .btn{flex:1;min-width:120px}
    .setup-card #dbStatus{text-align:left;margin-top:12px}
    .levels-card .legend{display:grid!important;grid-template-columns:1fr!important;gap:12px;margin:0 0 24px}
    .levels-card .legend-item{padding:22px 12px;font-size:23px;min-height:78px;display:grid;place-items:center}
    .levels-card .field{margin:0}
    .levels-card .sensor-note{margin-top:8px}
    .config-list{display:grid;gap:14px}
    .config-item{display:grid;grid-template-columns:1fr 104px;gap:12px;align-items:center}
    .config-item label{font-weight:950;font-size:15px;line-height:1.2}
    .config-input-wrap{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center}
    .config-input-wrap input{width:100%;padding:11px 8px;border:2px solid #cbd5e1;border-radius:13px;font-size:21px;font-weight:950;text-align:center}
    .config-input-wrap span{font-size:12px;font-weight:900;color:#64748b}
    .config-save{width:100%;margin-top:18px;border:0;border-radius:14px;padding:13px 16px;background:#0f172a;color:#fff;font-weight:950;font-size:16px}
    .config-save:disabled{background:#cbd5e1;color:#64748b;cursor:default}
    .config-status{min-height:18px;margin-top:10px;font-size:12px;font-weight:900;color:#166534}
    .config-help{margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.45;color:#64748b}
    .online-footer{margin-top:auto!important;padding-top:16px;text-align:center!important;font-size:12px!important}
    @media(max-width:920px){
      .setup-grid{grid-template-columns:1fr}
      .setup-card{padding:18px}
    }
    @media(max-width:520px){
      .turma-summary{grid-template-columns:1fr 1fr}
      .config-item{grid-template-columns:1fr 96px}
      .manual-points-row{grid-template-columns:68px 1fr 1fr!important}
    }
  `;
  document.head.appendChild(css);

  const login=document.createElement('section');
  login.className='profile-login';
  login.innerHTML=`
    <div class="public-shell">
      <header class="public-head">
        <h1>Som da Turma</h1>
        <p>Uma referência visual para professor e turma perceberem e regularem coletivamente o ambiente sonoro durante as atividades.</p>
      </header>

      <div class="public-grid">
        <section class="public-card resource-card">
          <h2>Conheça a ferramenta</h2>
          <div class="resource-list">
            <a class="resource-link" href="manual/">
              <b>📖 Como usar</b>
              <span>Manual visual com a configuração da turma, os níveis de som, pontos, trabalhos e medalhas.</span>
              <span class="resource-action">ABRIR MANUAL →</span>
            </a>
            <a class="resource-link" href="possibilidades-pedagogicas/">
              <b>💡 Possibilidades pedagógicas</b>
              <span>Ideias para usar a ferramenta em diferentes atividades, construir combinados e dar sentido às medalhas.</span>
              <span class="resource-action">VER POSSIBILIDADES →</span>
            </a>
          </div>
        </section>

        <section class="public-card login-card">
          <h2>Entrar</h2>
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
            <button id="tryModeBtn" class="btn secondary experience-btn" type="button">EXPERIMENTAR SEM SALVAR</button>
          </div>
          <div id="schoolLoginError" class="profile-login-error" aria-live="polite"></div>
        </section>

        <section class="public-card author-card">
          <div>
            <h2>Autor</h2>
            <p>Espaço reservado para apresentar o projeto, sua criação e autoria.</p>
          </div>
          <div class="author-placeholder">EM BREVE</div>
        </section>
      </div>

      <footer class="public-footer">Som da Turma • ferramenta web para uso pedagógico</footer>
    </div>`;
  document.body.appendChild(login);
  setup?.classList.add('hidden');

  const strip=document.createElement('div');
  strip.className='profile-strip';
  strip.innerHTML='<div id="profileName" class="profile-name"></div><button id="profileExit" class="profile-exit" type="button">↩ TROCAR PERFIL</button>';
  const expNote=document.createElement('div');
  expNote.className='experience-note hidden';
  expNote.textContent='🧪 MODO EXPERIÊNCIA • SEM TURMA • NADA SERÁ SALVO';

  const turmaSummary=document.createElement('div');
  turmaSummary.className='turma-summary hidden';
  turmaSummary.innerHTML=`
    <div class="turma-stat"><b id="turmaPoints">0</b><span>⭐ PONTOS</span><small id="turmaPointsProgress" class="turma-points-progress"></small></div>
    <div class="turma-stat"><b id="turmaMedals">0</b><span>🏅 MEDALHAS CONQUISTADAS</span></div>
    <div class="medal-wallet">
      <div class="medal-wallet-value"><b id="turmaAvailable">0</b><span>🏅 DISPONÍVEIS PARA USAR</span></div>
      <button id="useMedalBtn" class="use-medal-btn" type="button" disabled>USAR 1 MEDALHA</button>
      <div id="medalUseNote" class="medal-use-note">Usar uma medalha não altera as conquistadas nem o ranking.</div>
      <div id="medalUseMsg" class="medal-use-msg" aria-live="polite"></div>
    </div>
    <div id="turmaNext" class="turma-next"></div>`;

  const configBox=document.createElement('div');
  configBox.innerHTML=`
    <div class="config-list">
      <div class="config-item">
        <label for="cfgPeriodSeconds">⏱ TEMPO DO PERÍODO</label>
        <div class="config-input-wrap"><input id="cfgPeriodSeconds" type="number" min="1" max="300" step="1"><span>s</span></div>
      </div>
      <div class="config-item">
        <label for="cfgPeriodPoints">⭐ PONTOS POR PERÍODO</label>
        <div class="config-input-wrap"><input id="cfgPeriodPoints" type="number" min="1" max="100" step="1"><span>pts</span></div>
      </div>
      <div class="config-item">
        <label for="cfgMedalPoints">🏅 PONTOS PARA MEDALHA</label>
        <div class="config-input-wrap"><input id="cfgMedalPoints" type="number" min="1" max="10000" step="1"><span>pts</span></div>
      </div>
      <div class="config-item">
        <label for="cfgWorkPoints">✅ PONTOS POR TRABALHO</label>
        <div class="config-input-wrap"><input id="cfgWorkPoints" type="number" min="1" max="100" step="1"><span>pts</span></div>
      </div>
      <div class="config-item">
        <label for="cfgNoStopPoints">🎯 AULA SEM PARALISAÇÃO</label>
        <div class="config-input-wrap"><input id="cfgNoStopPoints" type="number" min="0" max="100" step="1"><span>pts</span></div>
      </div>
    </div>
    <button id="saveConfigBtn" class="config-save" type="button" disabled>SALVAR CONFIGURAÇÕES</button>
    <div id="configStatus" class="config-status"></div>
    <div class="config-help">As configurações ficam salvas no perfil e valem também em outros computadores.</div>`;

  const setupGrid=document.createElement('div');
  setupGrid.className='setup-grid';
  const leftCard=document.createElement('div');
  leftCard.className='setup-card turma-card';
  const centerCard=document.createElement('div');
  centerCard.className='setup-card levels-card';
  const rightCard=document.createElement('div');
  rightCard.className='setup-card config-card';
  centerCard.innerHTML='<h2>NÍVEIS</h2>';
  rightCard.innerHTML='<h2>⚙️ CONFIGURAÇÕES</h2>';

  const mainTitle=setupPanel?.querySelector('h1');
  if(setupPanel&&mainTitle){
    mainTitle.after(setupGrid);
    setupGrid.append(leftCard,centerCard,rightCard);
    leftCard.append(strip,expNote);
    if(roomField)leftCard.append(roomField);
    leftCard.append(turmaSummary);
    if(manualField)leftCard.append(manualField);
    if(setupActions)leftCard.append(setupActions);
    if(legend)centerCard.append(legend);
    if(micField)centerCard.append(micField);
    if(micError)centerCard.append(micError);
    rightCard.append(configBox);
    if(dbStatus){dbStatus.classList.add('online-footer');setupPanel.append(dbStatus);}
  }

  const cfgPeriodSeconds=document.getElementById('cfgPeriodSeconds');
  const cfgPeriodPoints=document.getElementById('cfgPeriodPoints');
  const cfgMedalPoints=document.getElementById('cfgMedalPoints');
  const cfgWorkPoints=document.getElementById('cfgWorkPoints');
  const cfgNoStopPoints=document.getElementById('cfgNoStopPoints');
  const saveConfigBtn=document.getElementById('saveConfigBtn');
  const configStatus=document.getElementById('configStatus');
  const turmaPoints=document.getElementById('turmaPoints');
  const turmaPointsProgress=document.getElementById('turmaPointsProgress');
  const turmaMedals=document.getElementById('turmaMedals');
  const turmaAvailable=document.getElementById('turmaAvailable');
  const useMedalBtn=document.getElementById('useMedalBtn');
  const medalUseNote=document.getElementById('medalUseNote');
  const medalUseMsg=document.getElementById('medalUseMsg');
  const turmaNext=document.getElementById('turmaNext');

  async function sha256(text){
    const data=new TextEncoder().encode(text);
    const digest=await crypto.subtle.digest('SHA-256',data);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  function cleanRoom(v){return String(v||'').trim().toUpperCase().replace(/\|/g,'').replace(/\s+/g,' ').slice(0,12)}
  function localKey(){return currentProfile?`som_turma_v3_${currentProfile.id}`:''}
  function configLocalKey(){return currentProfile?`som_turma_config_${currentProfile.id}`:''}

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

  function toDbRow(s){
    return{
      perfil:currentProfile.id,
      turma:cleanRoom(s.room),
      tipo:s.medalUse?'medalha_usada':(s.manual?'ajuste':'sessao'),
      pontos:Number(s.point)||0,
      recorde_seg:Math.max(0,Number(s.record)||0),
      foco_pontos:Math.max(0,Number(s.focusPoints)||0),
      trabalho_pontos:Math.max(0,Number(s.workPoints)||0),
      bonus_sem_parada:Math.max(0,Number(s.noStopBonus)||0),
      medalhas_usadas:Math.max(0,Number(s.medalUse)||0),
      paradas:Math.max(0,Number(s.stops)||0),
      duracao_seg:Math.max(0,Number(s.duration)||0),
      silencio_pct:Math.max(0,Math.min(100,Number(s.quietPct)||0)),
      sessao_id:String(s.id)
    };
  }

  function fromDbRow(row){
    return{
      room:cleanRoom(row.turma),
      point:Number(row.pontos)||0,
      record:Math.max(0,Number(row.recorde_seg)||0),
      focusPoints:Math.max(0,Number(row.foco_pontos)||0),
      workPoints:Math.max(0,Number(row.trabalho_pontos)||0),
      noStopBonus:Math.max(0,Number(row.bonus_sem_parada)||0),
      medalUse:Math.max(0,Number(row.medalhas_usadas)||0),
      stops:Math.max(0,Number(row.paradas)||0),
      duration:Math.max(0,Number(row.duracao_seg)||0),
      quietPct:Math.max(0,Math.min(100,Number(row.silencio_pct)||0)),
      id:String(row.sessao_id||''),
      manual:row.tipo!=='sessao',
      ts:row.criado_em||0,
      synced:true
    };
  }

  async function scopedSaveOnline(s){
    if(experienceMode||!currentProfile)return;
    const q=new URLSearchParams({on_conflict:'perfil,sessao_id'});
    const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${SOM_TURMA_TABLE}?${q}`,{
      method:'POST',
      headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json','Prefer':'resolution=ignore-duplicates,return=minimal'},
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
      select:'perfil,turma,tipo,pontos,recorde_seg,foco_pontos,trabalho_pontos,bonus_sem_parada,medalhas_usadas,paradas,duracao_seg,silencio_pct,sessao_id,criado_em',
      perfil:`eq.${currentProfile.id}`,
      order:'criado_em.asc',
      limit:'5000'
    });
    const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${SOM_TURMA_TABLE}?${q}`,{headers:{apikey:SUPABASE_KEY}});
    if(!response.ok){
      let detail='';try{detail=(await response.text()).slice(0,160)}catch(e){}
      throw new Error(`HTTP ${response.status}${detail?' • '+detail:''}`);
    }
    return(await response.json()).map(fromDbRow);
  }

  localSessions=scopedLocalSessions;
  writeLocal=scopedWriteLocal;
  markSynced=scopedMarkSynced;
  saveOnline=scopedSaveOnline;
  onlineSessions=scopedOnlineSessions;

  async function syncProfile(){
    if(experienceMode||!currentProfile)return;
    for(const row of scopedLocalSessions().filter(x=>!x.synced)){
      await scopedSaveOnline(row);
      scopedMarkSynced(row.id);
    }
  }

  function normalizedSettings(x={}){
    return{
      periodSeconds:Math.max(1,Math.min(300,Math.floor(Number(x.periodSeconds??x.periodo_seg??15)||15))),
      periodPoints:Math.max(1,Math.min(100,Math.floor(Number(x.periodPoints??x.pontos_periodo??1)||1))),
      medalPoints:Math.max(1,Math.min(10000,Math.floor(Number(x.medalPoints??x.pontos_medalha??40)||40))),
      workPoints:Math.max(1,Math.min(100,Math.floor(Number(x.workPoints??x.pontos_trabalho??5)||5))),
      noStopPoints:Math.max(0,Math.min(100,Math.floor(Number(x.noStopPoints??x.pontos_sem_parada??1))))
    };
  }

  function applySettings(value){
    const s=normalizedSettings(value);
    window.SOM_TURMA_SETTINGS=window.SOM_TURMA_SETTINGS||{};
    Object.assign(window.SOM_TURMA_SETTINGS,s);
    if(cfgPeriodSeconds)cfgPeriodSeconds.value=String(s.periodSeconds);
    if(cfgPeriodPoints)cfgPeriodPoints.value=String(s.periodPoints);
    if(cfgMedalPoints)cfgMedalPoints.value=String(s.medalPoints);
    if(cfgWorkPoints)cfgWorkPoints.value=String(s.workPoints);
    if(cfgNoStopPoints)cfgNoStopPoints.value=String(s.noStopPoints);
    const workBtn=document.getElementById('workDoneBtn');
    if(workBtn)workBtn.textContent=`✅ TRABALHO +${s.workPoints}`;
    return s;
  }

  function localSettings(){
    if(!currentProfile)return DEFAULT_SETTINGS;
    try{return normalizedSettings(JSON.parse(localStorage.getItem(configLocalKey())||'{}'))}catch(e){return DEFAULT_SETTINGS}
  }

  function writeLocalSettings(s){
    if(!currentProfile)return;
    try{localStorage.setItem(configLocalKey(),JSON.stringify(normalizedSettings(s)))}catch(e){}
  }

  function setSettingsDirty(value){
    settingsDirty=!!value;
    if(saveConfigBtn)saveConfigBtn.disabled=!settingsDirty;
    if(settingsDirty&&configStatus){
      configStatus.textContent='ALTERAÇÕES NÃO SALVAS';
      configStatus.style.color='#92400e';
    }
  }

  async function saveSettings(){
    if(!settingsDirty&&!experienceMode)return;
    const s=applySettings({
      periodSeconds:cfgPeriodSeconds?.value,
      periodPoints:cfgPeriodPoints?.value,
      medalPoints:cfgMedalPoints?.value,
      workPoints:cfgWorkPoints?.value,
      noStopPoints:cfgNoStopPoints?.value
    });
    if(experienceMode||!currentProfile){
      if(configStatus)configStatus.textContent='🧪 CONFIGURAÇÃO DE TESTE • NÃO SALVA';
      setSettingsDirty(false);
      refreshTurmaStats();
      return;
    }
    writeLocalSettings(s);
    if(configStatus){configStatus.textContent='SALVANDO...';configStatus.style.color='#64748b'}
    const q=new URLSearchParams({on_conflict:'perfil'});
    try{
      const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${CONFIG_TABLE}?${q}`,{
        method:'POST',
        headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify({
          perfil:currentProfile.id,
          periodo_seg:s.periodSeconds,
          pontos_periodo:s.periodPoints,
          pontos_medalha:s.medalPoints,
          pontos_trabalho:s.workPoints,
          pontos_sem_parada:s.noStopPoints,
          atualizado_em:new Date().toISOString()
        })
      });
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      if(configStatus){configStatus.textContent='✅ CONFIGURAÇÕES SALVAS';configStatus.style.color='#166534'}
      setSettingsDirty(false);
    }catch(e){
      if(configStatus){configStatus.textContent='💾 SALVAS NESTE COMPUTADOR';configStatus.style.color='#92400e'}
      setSettingsDirty(false);
    }
    refreshTurmaStats();
  }

  async function loadSettings(){
    if(experienceMode||!currentProfile){
      applySettings(DEFAULT_SETTINGS);
      setSettingsDirty(false);
      if(configStatus)configStatus.textContent='🧪 ALTERAÇÕES NÃO SERÃO SALVAS';
      return;
    }
    applySettings(localSettings());
    try{
      const q=new URLSearchParams({select:'periodo_seg,pontos_periodo,pontos_medalha,pontos_trabalho,pontos_sem_parada',perfil:`eq.${currentProfile.id}`,limit:'1'});
      const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${CONFIG_TABLE}?${q}`,{headers:{apikey:SUPABASE_KEY}});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const rows=await response.json();
      if(rows[0]){
        const s=applySettings(rows[0]);
        writeLocalSettings(s);
        setSettingsDirty(false);
        if(configStatus){configStatus.textContent='✅ CONFIGURAÇÕES SALVAS';configStatus.style.color='#166534'}
      }else{
        applySettings(DEFAULT_SETTINGS);
        setSettingsDirty(true);
        await saveSettings();
      }
    }catch(e){
      setSettingsDirty(false);
      if(configStatus){configStatus.textContent='💾 CONFIGURAÇÕES DESTE COMPUTADOR';configStatus.style.color='#92400e'}
    }
  }

  async function probeOnline(){
    if(!currentProfile||experienceMode)return;
    if(dbStatus){dbStatus.textContent='● VERIFICANDO ONLINE...';dbStatus.className='status-note'}
    try{
      const response=await nativeFetch(`${SUPABASE_URL}/rest/v1/${SOM_TURMA_TABLE}?select=id&limit=1`,{headers:{apikey:SUPABASE_KEY}});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      await syncProfile();
      if(dbStatus){dbStatus.textContent=`● ONLINE • ${currentProfile.name}`;dbStatus.className='status-note online'}
    }catch(e){
      if(dbStatus){dbStatus.textContent=`● NESTE COMPUTADOR • ${currentProfile.name}`;dbStatus.className='status-note offline'}
    }
  }

  function timeValue(v){
    if(typeof v==='number')return v;
    const n=Date.parse(v||'');
    return Number.isFinite(n)?n:0;
  }

  function stateForRoom(rows,roomName){
    const target=Math.max(1,Number(window.SOM_TURMA_SETTINGS?.medalPoints)||40);
    let medals=0,points=0,used=0;
    const ordered=rows.filter(x=>cleanRoom(x.room)===roomName).sort((a,b)=>timeValue(a.ts)-timeValue(b.ts));
    for(const row of ordered){
      used+=Math.max(0,Number(row.medalUse)||0);
      const delta=Number(row.point)||0;
      if(delta>=0){
        points+=delta;
        while(points>=target){medals++;points-=target}
      }else points=Math.max(0,points+delta);
    }
    const available=Math.max(0,medals-used);
    return{medals,points,target,used,available};
  }

  async function refreshTurmaStats(){
    const seq=++statsSeq;
    const selected=cleanRoom(roomInput?.value);
    const showDetails=!experienceMode&&!!currentProfile&&!!selected;
    turmaSummary.classList.toggle('hidden',!showDetails);
    manualField?.classList.toggle('hidden',!showDetails);
    if(!showDetails)return;
    if(turmaPointsProgress)turmaPointsProgress.textContent='...';
    let rows=[];
    try{
      await syncProfile();
      rows=await scopedOnlineSessions();
      rows.push(...scopedLocalSessions().filter(x=>!x.synced));
    }catch(e){
      rows=scopedLocalSessions();
    }
    if(seq!==statsSeq)return;
    const state=stateForRoom(rows,selected);
    if(turmaPoints)turmaPoints.textContent=String(state.points);
    if(turmaPointsProgress)turmaPointsProgress.textContent=`${state.points}/${state.target}`;
    if(turmaMedals)turmaMedals.textContent=String(state.medals);
    if(turmaAvailable)turmaAvailable.textContent=String(state.available);
    if(useMedalBtn)useMedalBtn.disabled=state.available<=0;
    if(medalUseNote)medalUseNote.textContent=state.used
      ? `${state.used} já usada${state.used===1?'':'s'} • usar não altera as conquistadas nem o ranking.`
      : 'Usar uma medalha não altera as conquistadas nem o ranking.';
    if(turmaNext)turmaNext.textContent='';
  }

  async function useOneMedal(){
    const selected=cleanRoom(roomInput?.value);
    if(!selected||experienceMode||!currentProfile)return;
    useMedalBtn.disabled=true;
    if(medalUseMsg){medalUseMsg.textContent='VERIFICANDO...';medalUseMsg.style.color='#64748b'}
    let rows=[];
    try{
      await syncProfile();
      rows=await scopedOnlineSessions();
      rows.push(...scopedLocalSessions().filter(x=>!x.synced));
    }catch(e){
      rows=scopedLocalSessions();
    }
    const state=stateForRoom(rows,selected);
    if(state.available<=0){
      if(medalUseMsg){medalUseMsg.textContent='NENHUMA MEDALHA DISPONÍVEL';medalUseMsg.style.color='#92400e'}
      useMedalBtn.disabled=true;
      return;
    }
    const ok=window.confirm(`Usar 1 medalha da turma ${selected}?\n\nAs ${state.medals} medalha${state.medals===1?' conquistada':'s conquistadas'} e o ranking continuam iguais. Apenas as disponíveis para usar diminuem em 1.`);
    if(!ok){
      useMedalBtn.disabled=false;
      if(medalUseMsg)medalUseMsg.textContent='';
      return;
    }
    const event={
      id:'U'+sessionId(),
      room:selected,
      point:0,
      record:0,
      duration:0,
      quietPct:0,
      stops:0,
      ts:Date.now(),
      synced:false,
      manual:true,
      medalUse:1
    };
    const local=scopedLocalSessions();
    local.push(event);
    scopedWriteLocal(local);
    try{
      await scopedSaveOnline(event);
      scopedMarkSynced(event.id);
      if(medalUseMsg){medalUseMsg.textContent='✅ 1 MEDALHA USADA';medalUseMsg.style.color='#166534'}
    }catch(e){
      if(medalUseMsg){medalUseMsg.textContent='💾 USO REGISTRADO NESTE COMPUTADOR';medalUseMsg.style.color='#92400e'}
    }
    await refreshTurmaStats();
  }

  function applyUi(){
    const profileName=document.getElementById('profileName');
    if(profileName)profileName.textContent=experienceMode?'🧪 EXPERIÊNCIA':`🏫 ${currentProfile?.name||''}`;
    roomField?.classList.toggle('hidden',experienceMode);
    rankingBtn?.classList.toggle('hidden',experienceMode);
    summaryRankingBtn?.classList.toggle('hidden',experienceMode);
    expNote.classList.toggle('hidden',!experienceMode);
    if(startBtn)startBtn.textContent=experienceMode?'▶ COMEÇAR EXPERIÊNCIA':'▶ COMEÇAR';
    if(dbStatus){
      dbStatus.textContent=experienceMode?'🧪 NADA SERÁ SALVO':'● VERIFICANDO ONLINE...';
      dbStatus.className='status-note';
    }
    turmaSummary.classList.add('hidden');
    manualField?.classList.add('hidden');
    if(medalUseMsg)medalUseMsg.textContent='';
  }

  async function enter(profile){
    currentProfile=profile;experienceMode=false;
    login.classList.add('hidden');
    if(roomInput)roomInput.value='';
    applyUi();
    show('setup');
    await loadSettings();
    roomInput?.focus();
    probeOnline();
  }

  async function enterExperience(){
    currentProfile=null;experienceMode=true;
    login.classList.add('hidden');
    if(roomInput)roomInput.value='';
    applyUi();
    show('setup');
    await loadSettings();
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

  roomInput?.addEventListener('input',()=>{clearTimeout(roomInput._statsTimer);roomInput._statsTimer=setTimeout(refreshTurmaStats,180)});
  roomInput?.addEventListener('change',refreshTurmaStats);
  [cfgPeriodSeconds,cfgPeriodPoints,cfgMedalPoints,cfgWorkPoints,cfgNoStopPoints].forEach(input=>{
    input?.addEventListener('input',()=>setSettingsDirty(true));
  });
  saveConfigBtn?.addEventListener('click',saveSettings);
  useMedalBtn?.addEventListener('click',useOneMedal);

  if(manualMsg){
    new MutationObserver(()=>{if(manualMsg.textContent&&!manualMsg.textContent.includes('SALVANDO'))setTimeout(refreshTurmaStats,100)})
      .observe(manualMsg,{childList:true,subtree:true,characterData:true});
  }
  document.getElementById('backBtn')?.addEventListener('click',()=>setTimeout(refreshTurmaStats,50));

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
  document.getElementById('newBtn').addEventListener('click',()=>setTimeout(()=>{applyUi();refreshTurmaStats()},0));
})();