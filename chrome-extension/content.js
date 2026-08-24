(()=>{
  const ROOT_ID='__led_som_turma_guard__';
  let timer=null;

  function ensureOverlay(){
    let host=document.getElementById(ROOT_ID);
    if(host)return host;
    host=document.createElement('div');
    host.id=ROOT_ID;
    host.style.cssText='position:fixed;inset:0;z-index:2147483647;display:none;pointer-events:all;';
    const shadow=host.attachShadow({mode:'closed'});
    shadow.innerHTML=`<style>
      *{box-sizing:border-box}.wrap{position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;text-align:center;padding:24px}.wrap.listen{background:#2563eb}.wrap.block{background:#991b1b}.icon{font-size:clamp(72px,12vw,150px);line-height:1}.title{font-size:clamp(56px,11vw,150px);font-weight:950;line-height:.9;margin:18px 0 16px;letter-spacing:-.04em;text-shadow:0 6px 24px #0002}.sub{font-size:clamp(28px,4vw,52px);font-weight:950}.room{position:absolute;top:20px;left:24px;font-size:clamp(18px,2.5vw,32px);font-weight:950;opacity:.95}.brand{position:absolute;right:22px;bottom:18px;font-size:13px;font-weight:800;opacity:.72}
    </style><div class="wrap"><div class="room"></div><div><div class="icon"></div><div class="title"></div><div class="sub"></div></div><div class="brand">LED • EMEF Dilermando Dias dos Santos</div></div>`;
    (document.documentElement||document.body).appendChild(host);
    host._els={wrap:shadow.querySelector('.wrap'),room:shadow.querySelector('.room'),icon:shadow.querySelector('.icon'),title:shadow.querySelector('.title'),sub:shadow.querySelector('.sub')};
    return host;
  }

  function render(control){
    const host=ensureOverlay(),e=host._els,state=control?.state||'OFF';
    if(state!=='LISTEN'&&state!=='BLOCK'){host.style.display='none';return}
    host.style.display='block';
    e.room.textContent=control.room?`🏫 ${control.room}`:'';
    if(state==='LISTEN'){
      e.wrap.className='wrap listen';e.icon.textContent='👂';e.title.textContent='OUVIR';e.sub.textContent='FIQUE ATENTO';
    }else{
      e.wrap.className='wrap block';e.icon.textContent='⛔';e.title.textContent='AULA PARADA';e.sub.textContent='OLHE PARA O PROFESSOR';
    }
  }

  function check(){
    if(document.visibilityState!=='visible')return;
    try{
      chrome.runtime.sendMessage({type:'LED_CHECK_CONTROL'},resp=>{
        if(chrome.runtime.lastError)return;
        if(resp?.ok)render(resp);
      });
    }catch(e){}
  }

  function start(){ensureOverlay();check();timer=setInterval(check,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
})();
