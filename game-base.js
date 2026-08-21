/* Base comum dos jogos do LED: proteção de navegação e estado do ranking. */
(function(){
  let lastDiagnostic='Ainda não foi feito nenhum teste.';

  function injectStyles(){
    if(document.getElementById('led-base-styles')) return;
    const style=document.createElement('style');
    style.id='led-base-styles';
    style.textContent=`
      .led-db-status{position:fixed;right:14px;bottom:12px;z-index:9999;padding:6px 9px;border-radius:999px;background:#0b1322dd;border:1px solid #40516d;color:#aebbd0;font:700 12px/1.2 Arial,Helvetica,sans-serif;box-shadow:0 4px 16px #0004;opacity:.9;cursor:pointer;user-select:none}
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
    el.title='Clique para ver o diagnóstico da conexão.';
    el.addEventListener('click',()=>window.alert(lastDiagnostic));
    document.body.appendChild(el);
    return el;
  }

  function setStatus(mode,detail=''){
    const el=makeStatus();
    el.className='led-db-status '+mode;
    if(mode==='online') el.textContent='● ranking online';
    else if(mode==='local') el.textContent='● ranking local';
    else el.textContent='● verificando ranking';
    if(detail) lastDiagnostic=detail;
  }

  async function checkDatabaseConnection(){
    if(typeof SUPABASE_URL==='undefined'||typeof SUPABASE_KEY==='undefined'||typeof SUPABASE_TABLE==='undefined'){
      setStatus('local','Ranking local: configuração do Supabase não foi encontrada no jogo.');
      return false;
    }
    if(!navigator.onLine){
      setStatus('local','Ranking local: este computador está sem conexão com a internet.');
      return false;
    }
    setStatus('checking','Testando conexão com o banco de dados...');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),5000);
    try{
      const url=`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id&limit=1`;
      const response=await fetch(url,{headers:{apikey:SUPABASE_KEY},signal:controller.signal,cache:'no-store'});
      const body=await response.text();
      clearTimeout(timer);
      if(!response.ok){
        setStatus('local',`Ranking local: o Supabase respondeu HTTP ${response.status}. ${body.slice(0,180)}`);
        return false;
      }
      setStatus('online','Ranking online: conexão com o Supabase e leitura da tabela funcionando.');
      return true;
    }catch(e){
      clearTimeout(timer);
      const detail=e&&e.name==='AbortError'
        ?'Ranking local: o teste do banco demorou mais de 5 segundos e foi interrompido.'
        :`Ranking local: falha de conexão com o Supabase. ${e&&e.message?e.message:''}`;
      setStatus('local',detail);
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
  window.addEventListener('offline',()=>setStatus('local','Ranking local: este computador ficou sem conexão com a internet.'));
  window.LEDGameBase={checkDatabaseConnection};
})();
