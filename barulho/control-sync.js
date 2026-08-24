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

  function currentRoom(){
    const label=document.getElementById('roomLabel')?.textContent||'';
    const fromLabel=label.replace(/^\s*🏫\s*/,'').trim();
    const fromInput=(document.getElementById('roomInput')?.value||'').trim().toUpperCase();
    return (fromLabel||fromInput).replace(/\|/g,'').slice(0,12);
  }

  function logicalState(){
    const stop=document.getElementById('stopOverlay');
    const monitor=document.getElementById('monitor');
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
    pending=setTimeout(()=>publish(logicalState()),80);
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
