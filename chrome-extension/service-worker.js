const SUPABASE_URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
const SUPABASE_KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
const SUPABASE_TABLE='invencoes_ranking';
const MAX_AGE_MS=2*60*60*1000;
let cache={at:0,value:{state:'OFF',room:'',ts:0}};

function parseControl(name,created){
  const parts=String(name||'').split('|');
  if(parts[0]!=='CTRL'||parts.length<4)return {state:'OFF',room:'',ts:0};
  const ts=Number(parts[1])||Date.parse(created)||0;
  const state=['MONITOR','LISTEN','BLOCK','OFF'].includes(parts[2])?parts[2]:'OFF';
  const room=String(parts[3]||'').slice(0,12);
  if(!ts||Date.now()-ts>MAX_AGE_MS)return {state:'OFF',room:'',ts};
  return {state,room,ts};
}

async function loadControl(){
  const now=Date.now();
  if(now-cache.at<500)return cache.value;
  const q=new URLSearchParams({select:'nome,criado_em',nome:'like.CTRL|*',order:'criado_em.desc',limit:'1'});
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?${q}`,{headers:{apikey:SUPABASE_KEY}});
  if(!r.ok)throw new Error(`controle ${r.status}`);
  const rows=await r.json();
  const value=rows.length?parseControl(rows[0].nome,rows[0].criado_em):{state:'OFF',room:'',ts:0};
  cache={at:now,value};
  return value;
}

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
  if(msg?.type!=='LED_CHECK_CONTROL')return;
  loadControl().then(v=>sendResponse({ok:true,...v})).catch(()=>sendResponse({ok:false,state:'OFF',room:'',ts:0}));
  return true;
});
