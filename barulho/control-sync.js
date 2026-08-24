(()=>{
  const URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
  const KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
  const TABLE='invencoes_ranking';

  function currentRoom(){
    const label=document.getElementById('roomLabel')?.textContent||'';
    const fromLabel=label.replace(/^\s*🏫\s*/,'').trim();
    const fromInput=(document.getElementById('roomInput')?.value||'').trim().toUpperCase();
    return (fromLabel||fromInput).replace(/\|/g,'').slice(0,12);
  }

  async function publish(state){
    const room=currentRoom();
    const nome=`CTRL|${Date.now()}|${state}|${room}`;
    try{
      await fetch(`${URL}/rest/v1/${TABLE}`,{
        method:'POST',
        headers:{apikey:KEY,'Content-Type':'application/json',Prefer:'return=minimal'},
        body:JSON.stringify({nome,pontos:0})
      });
    }catch(e){}
  }

  function wrap(name,after,before){
    const original=window[name];
    if(typeof original!=='function')return;
    window[name]=async function(...args){
      if(before)await before();
      const result=await original.apply(this,args);
      if(after)await after();
      return result;
    };
  }

  wrap('startLesson',()=>{
    const running=!document.getElementById('monitor')?.classList.contains('hidden');
    if(running)return publish('MONITOR');
  });
  wrap('togglePause',()=>publish(document.getElementById('monitor')?.classList.contains('state-listen')?'LISTEN':'MONITOR'));
  wrap('triggerStop',()=>{
    const stopped=!document.getElementById('stopOverlay')?.classList.contains('hidden');
    if(stopped)return publish('BLOCK');
  });
  wrap('releaseStop',()=>publish('MONITOR'));
  wrap('finishLesson',null,()=>publish('OFF'));
})();
