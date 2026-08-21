const TOTAL=50;
const MAX_SCORE=1000;
const BAND_PLAN=[{band:1,count:17},{band:2,count:17},{band:3,count:16}];
const PREV_KEY='util_prev_v1';
const LOCAL_RANK_KEY='util_ranking_v1';
const GAME_PREFIX='UTIL::';
const SUPABASE_URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
const SUPABASE_KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
const SUPABASE_TABLE='invencoes_ranking';
let session=[],index=0,score=0,functionHits=0,featureHits=0,streak=0,bestStreak=0,stage=1,soundOn=true;
let playerOne='',playerTwo='',teamName='';

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function show(id){['home','game','summary'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id))}
function cleanPerson(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,10)}
function cleanTeam(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,24)}
function norm(v){return cleanTeam(v).toLocaleLowerCase('pt-BR')}
function makeTeam(a,b){return[a,b].sort((x,y)=>x.localeCompare(y,'pt-BR',{sensitivity:'base'})).join(' + ')}

function buildSession(){
 let prev=[];try{prev=JSON.parse(localStorage.getItem(PREV_KEY)||'[]')}catch(e){}
 session=[];
 for(const plan of BAND_PLAN){
   const all=INVENTIONS.filter(x=>x.band===plan.band);
   const fresh=shuffle(all.filter(x=>!prev.includes(x.id)));
   const old=shuffle(all.filter(x=>prev.includes(x.id)));
   const chosen=fresh.slice(0,plan.count);
   if(chosen.length<plan.count)chosen.push(...old.slice(0,plan.count-chosen.length));
   session.push(...chosen);
 }
 try{localStorage.setItem(PREV_KEY,JSON.stringify(session.map(x=>x.id)))}catch(e){}
}
function badgeText(){return index<17?'Para que serve?':index<34?'O que faz funcionar?':'Aumentando capacidades'}
function roleText(){
 const reader=index%2===0?playerOne:playerTwo;
 const helper=index%2===0?playerTwo:playerOne;
 return `📖 ${reader} começa lendo. 🤝 ${helper} observa, dá uma ideia e ajuda a dupla a decidir.`;
}
function render(){
 const item=session[index];stage=1;
 document.getElementById('teamLabel').textContent=`👥 ${teamName}`;
 document.getElementById('roundText').textContent=`Item ${index+1} de ${TOTAL}`;
 document.getElementById('scoreText').textContent=score;
 document.getElementById('progressBar').style.width=`${(index/TOTAL)*100}%`;
 document.getElementById('badge').textContent=badgeText();
 document.getElementById('roleHint').textContent=roleText();
 document.getElementById('visual').innerHTML=visualSVG(item.visual);
 document.getElementById('itemName').textContent=item.name;
 document.getElementById('itemDesc').textContent=item.desc;
 document.getElementById('functionQuestion').textContent=index<17?'Para que esta invenção serve?':index<34?'Que problema ou tarefa esta invenção ajuda a resolver?':'Que capacidade esta invenção ajuda a aumentar ou melhorar?';
 document.getElementById('stageOne').classList.remove('hidden');
 document.getElementById('stageTwo').classList.add('hidden');
 document.getElementById('feedback').classList.add('hidden');
 renderOptions('functionOptions',item.fo,item.f,answerFunction);
}
function renderOptions(id,opts,answer,handler){
 const box=document.getElementById(id);box.innerHTML='';
 shuffle(opts).forEach(opt=>{const b=document.createElement('button');b.className='option';b.textContent=opt;b.onclick=()=>handler(opt,answer);box.appendChild(b)});
}
function tone(ok){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type='sine';o.frequency.value=ok?620:170;g.gain.value=.055;o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.18);o.stop(c.currentTime+.2)}catch(e){}}
function lockOptions(){document.querySelectorAll('.option').forEach(x=>x.classList.add('locked'))}
function feedback(ok,title,text,nextText,nextAction){
 const f=document.getElementById('feedback');f.className='feedback '+(ok?'good':'bad');f.classList.remove('hidden');
 document.getElementById('feedbackTitle').textContent=ok?title:'Ihhhh 😢';
 document.getElementById('feedbackText').textContent=text;
 const n=document.getElementById('nextBtn');n.textContent=nextText;n.onclick=nextAction;
}
function answerFunction(opt,answer){
 if(stage!==1)return;stage=2;const item=session[index],ok=opt===answer;lockOptions();
 if(ok){score+=10;functionHits++;streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0;tone(ok);document.getElementById('scoreText').textContent=score;
 feedback(ok,'✅ Isso! Para isso ela foi criada.',ok?`${item.name}: ${item.f}.`:`A função é: ${item.f}.`,'Agora descubram como →',showFeature);
}
function showFeature(){
 const item=session[index];document.getElementById('feedback').classList.add('hidden');document.getElementById('stageOne').classList.add('hidden');document.getElementById('stageTwo').classList.remove('hidden');
 document.getElementById('featureQuestion').textContent='O que ela tem ou faz que permite cumprir essa função?';
 renderOptions('featureOptions',item.po,item.p,answerFeature);
}
function answerFeature(opt,answer){
 if(stage!==2)return;stage=3;const item=session[index],ok=opt===answer;lockOptions();
 if(ok){score+=10;featureHits++;streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0;tone(ok);document.getElementById('scoreText').textContent=score;
 feedback(ok,'⭐ Boa dupla! Vocês ligaram a parte à função.',ok?item.why:`A pista principal é: ${item.p}. ${item.why}`,index===TOTAL-1?'Ver resultado 🏆':'Próxima invenção →',next);
}
function next(){index++;if(index>=TOTAL)return finish();render()}
function medalFor(points){
 if(points>950)return{icon:'🥇',title:'Medalha de ouro!',message:`Parabéns, ${teamName}! Vocês entenderam muito bem como função e características se ligam. Chamem o professor!`};
 if(points>800)return{icon:'🥈',title:'Medalha de prata!',message:`Muito bem, ${teamName}! Vocês fizeram ótimas relações entre problema, função e partes. Chamem o professor!`};
 if(points>600)return{icon:'🥉',title:'Medalha de bronze!',message:`Boa, ${teamName}! Vocês já descobriram muitas utilidades. Joguem de novo e tentem chegar à prata!`};
 return{icon:'🎯',title:'Tentem mais uma vez!',message:`${teamName}, conversem mais sobre para que cada coisa serve e como ela consegue fazer isso. Joguem de novo!`};
}
function getLocalRanking(){try{const d=JSON.parse(localStorage.getItem(LOCAL_RANK_KEY)||'[]');return Array.isArray(d)?d:[]}catch(e){return[]}}
function saveLocal(){
 const r=getLocalRanking(),key=norm(teamName),pos=r.findIndex(x=>norm(x.name)===key),entry={name:teamName,score,updated:Date.now()};
 if(pos<0)r.push(entry);else if(score>Number(r[pos].score))r[pos]=entry;
 r.sort((a,b)=>Number(b.score)-Number(a.score)||(a.updated||0)-(b.updated||0));try{localStorage.setItem(LOCAL_RANK_KEY,JSON.stringify(r.slice(0,50)))}catch(e){}
}
async function saveOnline(){
 const response=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({nome:GAME_PREFIX+teamName,pontos:score})});
 if(!response.ok)throw new Error(`ranking ${response.status}`);
}
function dedupe(rows){
 const best=new Map();for(const row of rows||[]){let name=String(row.nome||row.name||'');if(name.startsWith(GAME_PREFIX))name=name.slice(GAME_PREFIX.length);const points=Number(row.pontos??row.score);name=cleanTeam(name);if(!name||!Number.isFinite(points))continue;const key=norm(name),old=best.get(key);if(!old||points>old.score)best.set(key,{name,score:points,updated:row.criado_em||row.updated||0})}
 return[...best.values()].sort((a,b)=>b.score-a.score||String(a.updated).localeCompare(String(b.updated))).slice(0,10);
}
async function getOnlineRanking(){
 const url=`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=nome,pontos,criado_em&order=pontos.desc,criado_em.asc&limit=300`;
 const response=await fetch(url,{headers:{apikey:SUPABASE_KEY}});if(!response.ok)throw new Error(`ranking ${response.status}`);
 const rows=(await response.json()).filter(x=>String(x.nome||'').startsWith(GAME_PREFIX));return dedupe(rows);
}
function drawRanking(box,ranking,highlight='',offline=false){
 box.innerHTML='';if(!ranking.length){const e=document.createElement('div');e.className='rank-empty';e.textContent=offline?'Sem internet. Ainda não há pontuações neste computador.':'Ainda não há pontuações neste jogo.';box.appendChild(e);return}
 ranking.forEach((entry,i)=>{const row=document.createElement('div');row.className='rank-row';if(highlight&&norm(entry.name)===norm(highlight))row.classList.add('current');const p=document.createElement('span');p.className='rank-pos';p.textContent=`${i+1}º`;const n=document.createElement('span');n.className='rank-name';n.textContent=`${medalFor(entry.score).icon} ${entry.name}`;const s=document.createElement('span');s.className='rank-score';s.textContent=`${entry.score} pts`;row.append(p,n,s);box.appendChild(row)});
 if(offline){const note=document.createElement('div');note.className='rank-empty';note.textContent='Sem conexão: mostrando o ranking deste computador.';box.appendChild(note)}
}
async function renderRanking(target,highlight=''){
 const box=document.getElementById(target);if(!box)return;box.innerHTML='<div class="rank-empty">Carregando ranking...</div>';
 try{drawRanking(box,await getOnlineRanking(),highlight,false)}catch(e){drawRanking(box,dedupe(getLocalRanking().map(x=>({name:x.name,score:x.score,updated:x.updated}))),highlight,true)}
}
async function finish(){
 show('summary');const medal=medalFor(score);saveLocal();document.getElementById('medalIcon').textContent=medal.icon;document.getElementById('medalTitle').textContent=medal.title;document.getElementById('summaryMsg').textContent=medal.message;document.getElementById('finalScore').textContent=score;document.getElementById('functionHits').textContent=`${functionHits}/${TOTAL}`;document.getElementById('featureHits').textContent=`${featureHits}/${TOTAL}`;document.getElementById('bestStreak').textContent=bestStreak;document.getElementById('summaryRanking').innerHTML='<div class="rank-empty">Salvando pontuação...</div>';try{await saveOnline()}catch(e){}await renderRanking('summaryRanking',teamName)
}
function start(){
 const a=cleanPerson(document.getElementById('playerOne').value),b=cleanPerson(document.getElementById('playerTwo').value);if(!a||!b){document.getElementById('nameError').classList.remove('hidden');(!a?document.getElementById('playerOne'):document.getElementById('playerTwo')).focus();return}if(norm(a)===norm(b)){document.getElementById('nameError').textContent='Digite dois nomes diferentes.';document.getElementById('nameError').classList.remove('hidden');return}
 playerOne=a;playerTwo=b;teamName=makeTeam(a,b);document.getElementById('nameError').classList.add('hidden');document.getElementById('nameError').textContent='Digite os dois nomes para começar.';buildSession();index=0;score=0;functionHits=0;featureHits=0;streak=0;bestStreak=0;show('game');render();
}
function goHome(){document.getElementById('playerOne').value=playerOne;document.getElementById('playerTwo').value=playerTwo;renderRanking('homeRanking',teamName);show('home')}
document.getElementById('startBtn').onclick=start;document.getElementById('againBtn').onclick=start;document.getElementById('homeBtn').onclick=goHome;document.getElementById('soundBtn').onclick=()=>{soundOn=!soundOn;document.getElementById('soundBtn').textContent=soundOn?'🔊':'🔇'};document.getElementById('fullBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};document.getElementById('playerTwo').addEventListener('keydown',e=>{if(e.key==='Enter')start()});
renderRanking('homeRanking');
