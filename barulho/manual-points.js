(()=>{
  const URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
  const KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
  const TABLE='invencoes_ranking';
  const roomInput=document.getElementById('roomInput');
  const oldField=document.querySelector('.initial-points-field');
  if(!oldField||!roomInput)return;

  // O campo antigo não inicia mais a aula com pontos.
  oldField.className='field manual-points-field';
  oldField.innerHTML=`
    <label for="manualPoints">⭐ ADICIONAR PONTOS</label>
    <div class="manual-points-row">
      <input id="manualPoints" type="number" min="1" max="99" step="1" value="1" inputmode="numeric" aria-label="Quantidade de pontos para adicionar">
      <button id="manualPointsBtn" type="button">+ ADICIONAR</button>
    </div>
    <div id="manualPointsMsg" class="manual-points-msg" aria-live="polite"></div>`;

  const style=document.createElement('style');
  style.textContent=`
    .manual-points-field{max-width:none!important;margin-top:4px}
    .manual-points-row{display:grid;grid-template-columns:110px 1fr;gap:10px}
    .manual-points-row input{width:100%;padding:12px 10px;border:2px solid #cbd5e1;border-radius:16px;font-size:26px;font-weight:950;text-align:center}
    .manual-points-row button{border:0;border-radius:16px;background:#e2e8f0;color:#0f172a;font-weight:950;font-size:17px;padding:12px 16px;cursor:pointer}
    .manual-points-row button:disabled{opacity:.55;cursor:wait}
    .manual-points-msg{min-height:20px;margin-top:7px;font-size:13px;font-weight:900;color:#166534}
    @media(max-width:520px){.manual-points-row{grid-template-columns:90px 1fr}}
  `;
  document.head.appendChild(style);

  const input=document.getElementById('manualPoints');
  const button=document.getElementById('manualPointsBtn');
  const msg=document.getElementById('manualPointsMsg');

  function cleanRoom(v){return String(v||'').trim().toUpperCase().replace(/\|/g,'').replace(/\s+/g,' ').slice(0,12)}
  function points(){return Math.max(1,Math.min(99,Math.floor(Number(input?.value)||1)))}

  async function saveManual(room,value){
    const id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);
    const local={id:'M'+id,room,point:value,record:0,duration:0,quietPct:0,stops:0,ts:Date.now(),synced:true,manual:true};
    try{
      const rows=localSessions();rows.push(local);writeLocal(rows);
    }catch(e){}
    const nome=`R2M|${room}|${value}|${id.slice(-8)}`;
    const r=await fetch(`${URL}/rest/v1/${TABLE}`,{
      method:'POST',
      headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify({nome,pontos:value})
    });
    if(!r.ok)throw new Error('manual '+r.status);
  }

  button.addEventListener('click',async()=>{
    const room=cleanRoom(roomInput.value);
    if(!room){msg.style.color='#991b1b';msg.textContent='ESCOLHA A TURMA';roomInput.focus();return}
    const value=points();input.value=String(value);button.disabled=true;msg.style.color='#64748b';msg.textContent='SALVANDO...';
    try{
      await saveManual(room,value);
      msg.style.color='#166534';msg.textContent=`✅ +${value} PARA ${room}`;
      input.value='1';
    }catch(e){
      // A cópia local já foi mantida para o ranking deste computador.
      msg.style.color='#92400e';msg.textContent=`💾 +${value} PARA ${room} NESTE COMPUTADOR`;
      input.value='1';
    }finally{button.disabled=false}
  });

  // Inclui ajustes manuais no ranking online sem contá-los como aulas.
  onlineSessions=async function(){
    const q=new URLSearchParams({select:'nome,pontos,criado_em',nome:'like.R2*',order:'criado_em.desc',limit:'2000'});
    const r=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${q}`,{headers:{apikey:SUPABASE_KEY}});
    if(!r.ok)throw new Error('load '+r.status);
    return(await r.json()).map(row=>{
      const p=String(row.nome||'').split('|');
      if(p[0]==='R2'&&p.length>=4)return{room:sanitizeRoom(p[1]),point:Math.max(0,Number(p[2])||0),record:Number(p[3])||0,ts:row.criado_em||0,manual:false};
      if(p[0]==='R2M'&&p.length>=3)return{room:sanitizeRoom(p[1]),point:Math.max(0,Number(p[2])||0),record:0,ts:row.criado_em||0,manual:true};
      return null;
    }).filter(Boolean);
  };

  aggregate=function(rows){
    const map=new Map();
    for(const s of rows){
      if(!s.room)continue;
      const k=s.room.toUpperCase(),x=map.get(k)||{room:k,points:0,record:0,lessons:0,manualPoints:0};
      x.points+=Number(s.point)||0;
      x.record=Math.max(x.record,Number(s.record)||0);
      if(s.manual)x.manualPoints+=Number(s.point)||0;else x.lessons++;
      map.set(k,x);
    }
    return[...map.values()];
  };

  drawRows=function(id,rows,mode){
    const box=document.getElementById(id);box.innerHTML='';
    if(!rows.length){box.innerHTML='<div class="empty">SEM RESULTADOS</div>';return}
    rows.forEach((x,i)=>{
      const r=document.createElement('div');r.className='rank-row';
      const hint=x.lessons?`${x.lessons} aula${x.lessons===1?'':'s'}`:(x.manualPoints?'ajuste manual':'');
      r.innerHTML=`<div class="rank-pos">${i+1}º</div><div class="rank-room">${x.room}${hint?`<div class="hint">${hint}</div>`:''}</div><div class="rank-data">${mode==='points'?`${x.points} ⭐`:fmt(x.record*1000)}</div>`;
      box.appendChild(r);
    });
  };
})();