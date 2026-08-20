const TOTAL=50;
const MAX_SCORE=1000;
const BAND_PLAN=[{band:1,count:17},{band:2,count:17},{band:3,count:16}];
const RANKING_KEY='inv_ranking_v1';
const SUPABASE_URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
const SUPABASE_KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
const SUPABASE_TABLE='invencoes_ranking';
let session=[],index=0,score=0,classHits=0,followHits=0,streak=0,bestStreak=0,stage=1,soundOn=true,playerName='';

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function show(id){['home','game','summary'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id))}
function cleanName(value){return value.trim().replace(/\s+/g,' ').slice(0,24)}
function normalizedName(value){return cleanName(value).toLocaleLowerCase('pt-BR')}

function buildSession(){
  let prev=[];try{prev=JSON.parse(localStorage.getItem('inv_prev')||'[]')}catch(e){}
  session=[];
  for(const plan of BAND_PLAN){
    const all=QUESTION_BANK.filter(x=>x.band===plan.band);
    const fresh=shuffle(all.filter(x=>!prev.includes(x.id)));
    const old=shuffle(all.filter(x=>prev.includes(x.id)));
    const chosen=[...fresh.slice(0,plan.count)];
    if(chosen.length<plan.count) chosen.push(...old.slice(0,plan.count-chosen.length));
    session.push(...chosen);
  }
  try{localStorage.setItem('inv_prev',JSON.stringify(session.map(x=>x.id)))}catch(e){}
}

function levelText(){return index<17?'Observe':index<34?'Pense na transformação':'Desafio de inventor'}

function render(){
 const item=session[index];stage=1;
 document.getElementById('roundText').textContent=`Item ${index+1} de ${TOTAL}`;
 document.getElementById('playerLabel').textContent=`👤 ${playerName}`;
 document.getElementById('scoreText').textContent=score;
 document.getElementById('progressBar').style.width=`${(index/TOTAL)*100}%`;
 document.getElementById('badge').textContent=levelText();
 document.getElementById('visual').innerHTML=visualSVG(item.visual);
 document.getElementById('itemName').textContent=item.name;
 document.getElementById('itemDesc').textContent=item.desc;
 document.getElementById('stageOne').classList.remove('hidden');
 document.getElementById('stageTwo').classList.add('hidden');
 document.getElementById('feedback').classList.add('hidden');
 document.getElementById('naturalBtn').classList.remove('locked');
 document.getElementById('inventionBtn').classList.remove('locked');
}

function tone(ok){
 if(!soundOn)return;
 try{
  const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();
  o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.value=ok?620:180;g.gain.value=.06;o.start();
  g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.18);o.stop(c.currentTime+.2)
 }catch(e){}
}

function classify(choice){
 if(stage!==1)return;stage=2;const item=session[index];const ok=choice===item.type;
 if(ok){score+=10;classHits++;streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0;
 tone(ok);document.getElementById('scoreText').textContent=score;
 document.getElementById('naturalBtn').classList.add('locked');document.getElementById('inventionBtn').classList.add('locked');
 const f=document.getElementById('feedback');f.className='feedback '+(ok?'good':'bad');f.classList.remove('hidden');
 document.getElementById('feedbackTitle').textContent=ok?'✅ Certo!':'Ihhhh 😢';
 document.getElementById('feedbackText').textContent=item.why;
 document.getElementById('nextBtn').textContent='Pergunta extra →';document.getElementById('nextBtn').onclick=showFollow;
}

function showFollow(){
 const item=session[index];document.getElementById('feedback').classList.add('hidden');document.getElementById('stageOne').classList.add('hidden');document.getElementById('stageTwo').classList.remove('hidden');
 document.getElementById('followQuestion').textContent=item.q;const box=document.getElementById('options');box.innerHTML='';
 shuffle(item.opts).forEach(opt=>{const b=document.createElement('button');b.className='option';b.textContent=opt;b.onclick=()=>answerFollow(opt);box.appendChild(b)});
}

function answerFollow(opt){
 if(stage!==2)return;stage=3;const item=session[index],ok=opt===item.ans;
 document.querySelectorAll('.option').forEach(x=>x.classList.add('locked'));
 if(ok){score+=10;followHits++;streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0;
 tone(ok);document.getElementById('scoreText').textContent=score;
 const f=document.getElementById('feedback');f.className='feedback '+(ok?'good':'bad');f.classList.remove('hidden');
 document.getElementById('feedbackTitle').textContent=ok?'⭐ Muito bem!':'Ihhhh 😢';
 document.getElementById('feedbackText').textContent=ok?item.ans:`A resposta é: ${item.ans}.`;
 document.getElementById('nextBtn').textContent=index===TOTAL-1?'Ver pontuação 🏆':'Próximo item →';document.getElementById('nextBtn').onclick=next;
}

function next(){index++;if(index>=TOTAL)return finish();render()}

function medalFor(points){
 if(points>950)return{key:'gold',icon:'🥇',title:'Medalha de ouro!',message:`Parabéns, ${playerName}! Você ganhou a medalha de ouro. Chame o professor!`};
 if(points>800)return{key:'silver',icon:'🥈',title:'Medalha de prata!',message:`Parabéns, ${playerName}! Você ganhou a medalha de prata. Chame o professor!`};
 if(points>600)return{key:'bronze',icon:'🥉',title:'Medalha de bronze!',message:`${playerName}, você ganhou a medalha de bronze. Jogue de novo e tente chegar à prata!`};
 return{key:'none',icon:'🎯',title:'Tente mais uma vez!',message:`${playerName}, jogue de novo e tente conquistar uma medalha!`};
}

function getLocalRanking(){
 try{
  const data=JSON.parse(localStorage.getItem(RANKING_KEY)||'[]');
  return Array.isArray(data)?data.filter(x=>x&&typeof x.name==='string'&&Number.isFinite(Number(x.score))):[];
 }catch(e){return[]}
}

function saveLocalRanking(){
 const ranking=getLocalRanking();
 const key=normalizedName(playerName);
 const pos=ranking.findIndex(x=>normalizedName(x.name)===key);
 const entry={name:playerName,score,updated:Date.now()};
 if(pos<0) ranking.push(entry);
 else if(score>Number(ranking[pos].score)) ranking[pos]=entry;
 ranking.sort((a,b)=>Number(b.score)-Number(a.score)||(a.updated||0)-(b.updated||0));
 try{localStorage.setItem(RANKING_KEY,JSON.stringify(ranking.slice(0,50)))}catch(e){}
}

async function saveOnlineScore(){
 const response=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,{
  method:'POST',
  headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},
  body:JSON.stringify({nome:playerName,pontos:score})
 });
 if(!response.ok)throw new Error(`Falha ao salvar ranking (${response.status})`);
}

function dedupeRanking(rows){
 const best=new Map();
 for(const row of rows||[]){
  const name=cleanName(row.nome||row.name||'');
  const points=Number(row.pontos??row.score);
  if(!name||!Number.isFinite(points))continue;
  const key=normalizedName(name);
  const existing=best.get(key);
  if(!existing||points>existing.score)best.set(key,{name,score:points,updated:row.criado_em||row.updated||0});
 }
 return [...best.values()].sort((a,b)=>b.score-a.score||String(a.updated).localeCompare(String(b.updated))).slice(0,10);
}

async function getOnlineRanking(){
 const url=`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=nome,pontos,criado_em&order=pontos.desc,criado_em.asc&limit=200`;
 const response=await fetch(url,{headers:{'apikey':SUPABASE_KEY}});
 if(!response.ok)throw new Error(`Falha ao carregar ranking (${response.status})`);
 return dedupeRanking(await response.json());
}

function drawRanking(box,ranking,highlight='',offline=false){
 box.innerHTML='';
 if(!ranking.length){
  const empty=document.createElement('div');empty.className='rank-empty';empty.textContent=offline?'Sem internet. Ainda não há pontuações neste computador.':'Ainda não há pontuações no ranking.';box.appendChild(empty);return;
 }
 ranking.forEach((entry,i)=>{
  const row=document.createElement('div');row.className='rank-row';
  if(highlight&&normalizedName(entry.name)===normalizedName(highlight))row.classList.add('current');
  const p=document.createElement('span');p.className='rank-pos';p.textContent=`${i+1}º`;
  const n=document.createElement('span');n.className='rank-name';n.textContent=`${medalFor(Number(entry.score)).icon} ${entry.name}`;
  const s=document.createElement('span');s.className='rank-score';s.textContent=`${entry.score} pts`;
  row.append(p,n,s);box.appendChild(row);
 });
 if(offline){const note=document.createElement('div');note.className='rank-empty';note.textContent='Sem conexão: mostrando o ranking deste computador.';box.appendChild(note)}
}

async function renderRanking(targetId,highlight=''){
 const box=document.getElementById(targetId);if(!box)return;
 box.innerHTML='<div class="rank-empty">Carregando ranking...</div>';
 try{
  const online=await getOnlineRanking();
  drawRanking(box,online,highlight,false);
 }catch(e){
  const local=dedupeRanking(getLocalRanking().map(x=>({nome:x.name,pontos:x.score,criado_em:x.updated})));
  drawRanking(box,local,highlight,true);
 }
}

async function finish(){
 show('summary');
 const medal=medalFor(score);
 saveLocalRanking();
 document.getElementById('medalIcon').textContent=medal.icon;
 document.getElementById('medalTitle').textContent=medal.title;
 document.getElementById('summaryMsg').textContent=medal.message;
 document.getElementById('finalScore').textContent=score;document.getElementById('maxScore').textContent=MAX_SCORE;
 document.getElementById('classHits').textContent=`${classHits}/${TOTAL}`;document.getElementById('followHits').textContent=`${followHits}/${TOTAL}`;document.getElementById('bestStreak').textContent=bestStreak;
 const box=document.getElementById('summaryRanking');box.innerHTML='<div class="rank-empty">Salvando pontuação...</div>';
 try{await saveOnlineScore()}catch(e){}
 await renderRanking('summaryRanking',playerName);
}

function start(){
 const input=document.getElementById('playerName');
 const name=cleanName(input.value||playerName);
 if(!name){document.getElementById('nameError').classList.remove('hidden');input.focus();return}
 playerName=name;input.value=playerName;document.getElementById('nameError').classList.add('hidden');
 buildSession();index=0;score=0;classHits=0;followHits=0;streak=0;bestStreak=0;show('game');render();
}

function goHome(){document.getElementById('playerName').value=playerName;renderRanking('homeRanking',playerName);show('home')}

document.getElementById('startBtn').onclick=start;
document.getElementById('againBtn').onclick=start;
document.getElementById('homeBtn').onclick=goHome;
document.getElementById('naturalBtn').onclick=()=>classify('natural');
document.getElementById('inventionBtn').onclick=()=>classify('invention');
document.getElementById('soundBtn').onclick=()=>{soundOn=!soundOn;document.getElementById('soundBtn').textContent=soundOn?'🔊':'🔇'};
document.getElementById('fullBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
document.getElementById('playerName').addEventListener('keydown',e=>{if(e.key==='Enter')start()});
document.addEventListener('keydown',e=>{if(document.getElementById('game').classList.contains('hidden'))return;if(stage===1&&e.key.toLowerCase()==='n')classify('natural');if(stage===1&&e.key.toLowerCase()==='i')classify('invention')});

renderRanking('homeRanking');