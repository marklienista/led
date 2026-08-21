/* Base comum dos jogos do LED: proteção de navegação e estado do ranking. */
(function(){
  function injectStyles(){
    if(document.getElementById('led-base-styles')) return;
    const style=document.createElement('style');
    style.id='led-base-styles';
    style.textContent=`
      .led-db-status{position:fixed;right:14px;bottom:12px;z-index:9999;padding:6px 9px;border-radius:999px;background:#0b1322dd;border:1px solid #40516d;color:#aebbd0;font:700 12px/1.2 Arial,Helvetica,sans-serif;box-shadow:0 4px 16px #0004;pointer-events:none;opacity:.9}
      .led-db-status.online{color:#bbf7d0;border-color:#22c55e66}
      .led-db-status.local{color:#fde68a;border-color:#fbbf2466}
      .led-db-status.checking{color:#cbd5e1}
      @media(max-width:700px){.led-db-status{right:8px;bottom:8px;font-size:10px;padding:5px 7px}}
    `;
    document.head.appendChild(style);
  }

  function makeStatus(){
    let el=document.getElementById('ledDbStatus');
    if(el) return el;
    el=document.createElement('div');
    el.id='ledDbStatus';
    el.className='led-db-status checking';
    el.textContent='● verificando ranking';
    el.setAttribute('aria-live','polite');
    document.body.appendChild(el);
    return el;
  }

  function setStatus(mode){
    const el=makeStatus();
    el.className='led-db-status '+mode;
    if(mode==='online') el.textContent='● ranking online';
    else if(mode==='local') el.textContent='● ranking local';
    else el.textContent='● verificando ranking';
  }

  async function checkDatabaseConnection(){
    if(typeof SUPABASE_URL==='undefined'||typeof SUPABASE_KEY==='undefined'||typeof SUPABASE_TABLE==='undefined'){
      setStatus('local');
      return false;
    }
    if(!navigator.onLine){setStatus('local');return false;}
    setStatus('checking');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),3500);
    try{
      const url=`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id&limit=1`;
      const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:controller.signal,cache:'no-store'});
      clearTimeout(timer);
      if(!response.ok) throw new Error('ranking indisponível');
      setStatus('online');
      return true;
    }catch(e){
      clearTimeout(timer);
      setStatus('local');
      return false;
    }
  }

  function protectGameHome(){
    const button=document.querySelector('.game-home-button');
    if(!button) return;
    button.removeAttribute('onclick');
    button.onclick=null;
    button.addEventListener('click',function(){
      const ok=window.confirm('Voltar ao início? O progresso desta partida será perdido.');
      if(!ok) return;
      if(typeof changeYear==='function') changeYear();
      else if(typeof goHome==='function') goHome();
    });
  }

  injectStyles();
  makeStatus();
  protectGameHome();
  checkDatabaseConnection();

  const start=document.getElementById('startBtn');
  if(start) start.addEventListener('click',checkDatabaseConnection,{capture:true});
  window.addEventListener('online',checkDatabaseConnection);
  window.addEventListener('offline',()=>setStatus('local'));
  window.LEDGameBase={checkDatabaseConnection};
})();
