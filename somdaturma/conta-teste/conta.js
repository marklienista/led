/* SDT-ONLINE-001 — área adulta de teste, separada da versão coletiva.
   Só utiliza a chave publicável + JWT do Supabase Auth; jamais service_role.
   Nenhum código aqui pede microfone ou envia áudio. */
(()=>{
'use strict';
const PROJECT_URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
const TABLES={
 prefs:'som_turma_conta_preferencias',
 configs:'som_turma_conta_configuracoes',
 sessions:'som_turma_conta_sessoes',
 entitlement:'som_turma_conta_entitlements'
};
const el=id=>document.getElementById(id);
const loginSection=el('loginSection');
const loggedSection=el('loggedSection');
const privateSection=el('dados');
const forms=[el('authForm'),el('prefsForm'),el('configForm')];
let api=null;
let currentUser=null;
let stateSequence=0;
let savedPrefs='';
let savedConfig='';
const FIELDS=['periodo','pontosPeriodo','pontosMedalha','pontosTrabalho','semParada'];
const DEFAULT_CONFIG=[15,1,40,5,1];

function feedback(id,message,type='info'){
 const node=el(id);
 if(!node)return;
 node.textContent=message;
 node.className='feedback '+type;
}
function errorMessage(error){
 const message=(error&&error.message)||'Não foi possível concluir. Tente novamente.';
 return String(message).slice(0,200);
}
function accountId(){return currentUser?.id||null}
function configValues(){return FIELDS.map(id=>Number(el(id).value))}
function setConfig(values){
 FIELDS.forEach((id,i)=>{el(id).value=String(values[i])});
 savedConfig=JSON.stringify(configValues());
 el('saveConfig').disabled=true;
}
function prefsValues(){return {nome_exibicao:el('displayName').value.trim()||null,mostrar_dicas:el('showTips').checked}}
function setPrefs(prefs){
 el('displayName').value=prefs?.nome_exibicao||'';
 el('showTips').checked=prefs?.mostrar_dicas!==false;
 savedPrefs=JSON.stringify(prefsValues());
 el('savePrefs').disabled=true;
}
function onChange(){
 el('savePrefs').disabled=!accountId()||JSON.stringify(prefsValues())===savedPrefs;
 el('saveConfig').disabled=!accountId()||JSON.stringify(configValues())===savedConfig;
}
function setSignedOut(note='Entre com uma conta adulta para acessar os dados privados.'){
 currentUser=null;
 stateSequence++;
 loginSection.hidden=false;
 loggedSection.hidden=true;
 privateSection.hidden=true;
 el('loggedEmail').textContent='';
 el('sampleList').replaceChildren();
 setPrefs({nome_exibicao:null,mostrar_dicas:true});
 setConfig(DEFAULT_CONFIG);
 feedback('authStatus',note);
}
function showSession(user){
 currentUser=user;
 loginSection.hidden=true;
 loggedSection.hidden=false;
 privateSection.hidden=false;
 el('loggedEmail').textContent=user.email||'Conta autenticada';
 el('password').value='';
 feedback('authStatus','Conta autenticada.', 'good');
}

async function fetchPrefs(owner,seq){
 const {data,error}=await api.from(TABLES.prefs).select('nome_exibicao,mostrar_dicas').maybeSingle();
 if(seq!==stateSequence)return;
 if(error){feedback('prefsStatus','Não foi possível carregar preferências: '+errorMessage(error),'bad');return}
 setPrefs(data||{nome_exibicao:null,mostrar_dicas:true});
 feedback('prefsStatus',data?'Preferências privadas carregadas.':'Preferências padrão; ainda não salvas.', 'info');
}
async function fetchConfig(owner,seq){
 const {data,error}=await api.from(TABLES.configs)
  .select('periodo_seg,pontos_periodo,pontos_medalha,pontos_trabalho,pontos_sem_parada').maybeSingle();
 if(seq!==stateSequence)return;
 if(error){feedback('configStatus','Não foi possível carregar configurações: '+errorMessage(error),'bad');return}
 setConfig(data?[
  data.periodo_seg,data.pontos_periodo,data.pontos_medalha,data.pontos_trabalho,data.pontos_sem_parada
 ]:DEFAULT_CONFIG);
 feedback('configStatus',data?'Configurações privadas carregadas.':'Configuração padrão; ainda não salva.', 'info');
}
async function fetchEntitlement(owner,seq){
 let {data,error}=await api.from(TABLES.entitlement).select('plano,status,validade').maybeSingle();
 if(seq!==stateSequence)return;
 if(error){el('entitlementStatus').textContent='Não foi possível consultar o direito de acesso.';return}
 if(!data){
  const result=await api.from(TABLES.entitlement).insert({
   usuario_id:owner,plano:'free',status:'ativo',validade:null
  });
  if(seq!==stateSequence)return;
  if(result.error&&result.error.code!=='23505'){
   el('entitlementStatus').textContent='Não foi possível registrar o plano gratuito.';
   return;
  }
  ({data,error}=await api.from(TABLES.entitlement).select('plano,status,validade').maybeSingle());
  if(error||!data){el('entitlementStatus').textContent='Não foi possível consultar o direito de acesso.';return}
 }
 el('entitlementPlan').textContent=data.plano==='premium'?'Premium':'Free';
 el('entitlementStatus').textContent='Status: '+data.status+
  ' · validade: '+(data.validade?new Date(data.validade).toLocaleDateString('pt-BR'):'não definida');
}
async function fetchSamples(owner,seq){
 const {data,error}=await api.from(TABLES.sessions).select('criado_em,duracao_seg,pontos_foco,pontos_trabalho,paralizacoes,tipo')
  .order('criado_em',{ascending:false}).limit(6);
 if(seq!==stateSequence)return;
 const box=el('sampleList');
 box.replaceChildren();
 if(error){feedback('sampleStatus','Não foi possível ler os testes: '+errorMessage(error),'bad');return}
 if(!data?.length){
  const blank=document.createElement('p');
  blank.className='hint';
  blank.textContent='Ainda não há sessões fictícias nesta conta.';
  box.appendChild(blank);
  return;
 }
 data.forEach(row=>{
  const item=document.createElement('div');item.className='griditem sample';
  const timestamp=new Date(row.criado_em).toLocaleString('pt-BR');
  const total=Number(row.pontos_foco)+Number(row.pontos_trabalho);
  item.textContent='Teste fictício · '+timestamp+' · '+row.duracao_seg+' s · '+total+
    ' pontos · '+row.paralizacoes+' paralisações';
  box.appendChild(item);
 });
}
async function refreshAccount(session){
 const seq=++stateSequence;
 if(!session?.user){setSignedOut();return}
 const {data,error}=await api.auth.getUser();
 if(seq!==stateSequence)return;
 if(error||!data.user){setSignedOut('Sessão não validada. Entre novamente.');return}
 showSession(data.user);
 const owner=data.user.id;
 await Promise.all([
  fetchPrefs(owner,seq),fetchConfig(owner,seq),
  fetchEntitlement(owner,seq),fetchSamples(owner,seq)
 ]);
}
function setBusy(value){
 el('loginBtn').disabled=value;el('registerBtn').disabled=value;
}
async function login(event){
 event.preventDefault();
 if(!el('authForm').reportValidity())return;
 setBusy(true);
 feedback('authStatus','Entrando...');
 try{
  const {data,error}=await api.auth.signInWithPassword({
   email:el('email').value.trim(),password:el('password').value
  });
  if(error)throw error;
  await refreshAccount(data.session);
 }catch(err){feedback('authStatus',errorMessage(err),'bad')}
 finally{setBusy(false)}
}
async function register(){
 if(!el('authForm').reportValidity())return;
 setBusy(true);
 feedback('authStatus','Criando conta adulta...');
 try{
  const {data,error}=await api.auth.signUp({
   email:el('email').value.trim(),
   password:el('password').value,
   options:{emailRedirectTo:location.origin+location.pathname}
  });
  if(error)throw error;
  if(data.session){await refreshAccount(data.session)}
  else feedback('authStatus','Cadastro recebido. Confira seu e-mail para confirmar a conta antes de entrar.','good');
 }catch(err){feedback('authStatus',errorMessage(err),'bad')}
 finally{setBusy(false)}
}
async function logout(){
 el('logoutBtn').disabled=true;
 try{const {error}=await api.auth.signOut();if(error)throw error;setSignedOut('Você saiu da conta.')}
 catch(err){feedback('authStatus',errorMessage(err),'bad')}
 finally{el('logoutBtn').disabled=false}
}
async function savePrefs(event){
 event.preventDefault();
 if(!accountId()||!el('prefsForm').reportValidity())return;
 el('savePrefs').disabled=true;
 feedback('prefsStatus','Salvando...');
 const values=prefsValues();
 try{
  const {error}=await api.from(TABLES.prefs).upsert({
   usuario_id:accountId(),...values,atualizado_em:new Date().toISOString()
  },{onConflict:'usuario_id'});
  if(error)throw error;
  savedPrefs=JSON.stringify(values);
  feedback('prefsStatus','Preferências salvas nesta conta.','good');
 }catch(err){feedback('prefsStatus','Falha: '+errorMessage(err),'bad')}
 onChange();
}
async function saveConfig(event){
 event.preventDefault();
 if(!accountId()||!el('configForm').reportValidity())return;
 const values=configValues();
 if(values.some((n,i)=>!Number.isInteger(n)||
    n<([1,1,1,1,0][i])||n>([300,100,10000,100,100][i]))) {
  feedback('configStatus','Informe valores inteiros dentro dos limites.','bad');return;
 }
 el('saveConfig').disabled=true;
 feedback('configStatus','Salvando...');
 try{
  const {error}=await api.from(TABLES.configs).upsert({
   usuario_id:accountId(),
   periodo_seg:values[0],pontos_periodo:values[1],
   pontos_medalha:values[2],pontos_trabalho:values[3],
   pontos_sem_parada:values[4],atualizado_em:new Date().toISOString()
  },{onConflict:'usuario_id'});
  if(error)throw error;
  savedConfig=JSON.stringify(values);
  feedback('configStatus','Configurações salvas nesta conta.','good');
 }catch(err){feedback('configStatus','Falha: '+errorMessage(err),'bad')}
 onChange();
}
async function addSample(){
 if(!accountId())return;
 el('saveSample').disabled=true;
 feedback('sampleStatus','Registrando sessão fictícia...');
 try{
  const {error}=await api.from(TABLES.sessions).insert({
   usuario_id:accountId(),tipo:'teste',turma_ficticia:'TURMA TESTE',
   duracao_seg:60,pontos_foco:1,pontos_trabalho:5,paralizacoes:0
  });
  if(error)throw error;
  feedback('sampleStatus','Sessão fictícia salva de forma privada. Não alterou medalhas nem ranking.','good');
  await fetchSamples(accountId(),stateSequence);
 }catch(err){feedback('sampleStatus','Falha: '+errorMessage(err),'bad')}
 finally{el('saveSample').disabled=false}
}
function setup(){
 if(!window.supabase||typeof window.supabase.createClient!=='function'){
  feedback('authStatus','Autenticação indisponível: biblioteca não carregada. Experimente a aula gratuita pelo botão acima.','bad');
  setBusy(true);
  return;
 }
 api=window.supabase.createClient(PROJECT_URL,PUBLISHABLE_KEY,{
  auth:{storageKey:'som_turma_conta_teste_auth_v1',autoRefreshToken:true,
   persistSession:true,detectSessionInUrl:true}
 });
 el('authForm').addEventListener('submit',login);
 el('registerBtn').addEventListener('click',register);
 el('logoutBtn').addEventListener('click',logout);
 el('prefsForm').addEventListener('submit',savePrefs);
 el('configForm').addEventListener('submit',saveConfig);
 el('saveSample').addEventListener('click',addSample);
 ['displayName','showTips',...FIELDS].forEach(id=>el(id).addEventListener('input',onChange));
 el('showTips').addEventListener('change',onChange);
 api.auth.onAuthStateChange((event,session)=>{
  // Chamada remota adiada: evita deadlock dentro do callback de Auth.
  setTimeout(()=>{void refreshAccount(session)},0);
 });
 void api.auth.getSession().then(({data,error})=>{
  if(error){setSignedOut('Não foi possível recuperar a sessão anterior.');return}
  void refreshAccount(data.session);
 }).catch(()=>setSignedOut('Não foi possível recuperar a sessão anterior.'));
}
setup();
})();