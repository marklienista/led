const TOTAL=50;
const MAX_SCORE=1000;
const PREV_KEY='util_prev_v2';
const LOCAL_RANK_KEY='util_ranking_v2';
const SUPABASE_URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
const SUPABASE_KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
const SUPABASE_TABLE='invencoes_ranking';

const GRADE_CONFIG={
  2:{label:'2º ano',counts:{1:20,2:15,3:10,4:5},q1:'Para que serve?',q2:'O que ela tem que ajuda nisso?'},
  3:{label:'3º ano',counts:{1:16,2:15,3:12,4:7},q1:'Que tarefa ou problema ela ajuda a resolver?',q2:'Que parte ou característica faz isso acontecer?'},
  4:{label:'4º ano',counts:{1:14,2:14,3:13,4:9},q1:'Que tarefa ou problema esta invenção ajuda a resolver?',q2:'Que parte ou característica permite cumprir essa função?'},
  5:{label:'5º ano',counts:{1:10,2:15,3:15,4:10},q1:'Que necessidade ou capacidade humana esta invenção atende?',q2:'Qual característica é essencial para ela cumprir essa função?'}
};

let selectedYear=null,session=[],index=0,score=0,functionHits=0,featureHits=0,streak=0,bestStreak=0,stage=1,soundOn=true;
let playerOne='',playerTwo='',teamName='';

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function show(id){['year','home','game','summary'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id))}
function cleanPerson(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,9)}
function cleanTeam(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,21)}
function norm(v){return cleanTeam(v).toLocaleLowerCase('pt-BR')}
function makeTeam(a,b){return[a,b].sort((x,y)=>x.localeCompare(y,'pt-BR',{sensitivity:'base'})).join(' + ')}
function config(){return GRADE_CONFIG[selectedYear]}
function levelOf(item){const n=Number(String(item.id).replace(/\D/g,''));return n<=20?1:n<=35?2:n<=50?3:4}
function rankingPrefix(){return `U${selectedYear}|`}
function localRankKey(){return `${LOCAL_RANK_KEY}_${selectedYear}`}
function prevKey(){return `${PREV_KEY}_${selectedYear}`}

function applyYearUI(){
 const cfg=config();
 document.body.dataset.year=String(selectedYear);
 document.getElementById('headerYear').textContent=cfg.label;
 document.querySelectorAll('.year-label').forEach(el=>el.textContent=cfg.label);
}

function selectYear(year){
 selectedYear=Number(year);applyYearUI();
 playerOne='';playerTwo='';teamName='';
 document.getElementById('playerOne').value='';document.getElementById('playerTwo').value='';
 document.getElementById('nameError').classList.add('hidden');
 show('home');renderRanking('homeRanking');
}

function changeYear(){
 selectedYear=null;delete document.body.dataset.year;
 document.getElementById('headerYear').textContent='Escolha o ano';
 show('year');
}

function buildSession(){
 let prev=[];try{prev=JSON.parse(localStorage.getItem(prevKey())||'[]')}catch(e){}
 session=[];
 for(const level of [1,2,3,4]){
   const need=config().counts[level];
   const all=INVENTIONS.filter(x=>levelOf(x)===level);
   const fresh=shuffle(all.filter(x=>!prev.includes(x.id)));
   const old=shuffle(all.filter(x=>prev.includes(x.id)));
   const chosen=fresh.slice(0,need);
   if(chosen.length<need)chosen.push(...old.slice(0,need-chosen.length));
   session.push(...chosen);
 }
 try{localStorage.setItem(prevKey(),JSON.stringify(session.map(x=>x.id)))}catch(e){}
}

function roleText(){
 const reader=index%2===0?playerOne:playerTwo;
 const helper=index%2===0?playerTwo:playerOne;
 if(selectedYear===2)return `📖 ${reader} lê. 🤝 ${helper} ajuda. Conversem antes de clicar.`;
 return `📖 ${reader} começa lendo. 🤝 ${helper} observa, dá uma ideia e ajuda a dupla a decidir.`;
}

function render(){
 const item=session[index];stage=1;
 document.getElementById('teamLabel').textContent=`👥 ${teamName}`;
 document.getElementById('roundText').textContent=`Item ${index+1} de ${TOTAL}`;
 document.getElementById('scoreText').textContent=score;
 document.getElementById('progressBar').style.width=`${(index/TOTAL)*100}%`;
 document.getElementById('visual').innerHTML=visualSVG(item.visual);
 document.getElementById('itemName').textContent=item.name;
 document.getElementById('itemDesc').textContent=item.desc;
 document.getElementById('roleHint').textContent=roleText();
 document.getElementById('functionQuestion').textContent=config().q1;
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
function showFeedback(ok,title,text,nextText,nextAction){
 const f=document.getElementById('feedback');f.className='feedback '+(ok?'good':'bad');f.classList.remove('hidden');
 document.getElementById('feedbackTitle').textContent=ok?title:'Ihhhh 😢';
 document.getElementById('feedbackText').textContent=text;
 const n=document.getElementById('nextBtn');n.textContent=nextText;n.onclick=nextAction;
}

function functionFeedback(item,ok){
 if(selectedYear===2)return ok?`Serve para: ${item.f}.`:`A resposta é: ${item.f}.`;
 if(selectedYear===5)return ok?`Função: ${item.f}. Pense na necessidade que ela atende.`:`A função correta é: ${item.f}.`;
 return ok?`${item.name}: ${item.f}.`:`A função é: ${item.f}.`;
}

function featureFeedback(item,ok){
 if(selectedYear===2)return ok?`${item.p}. Isso ajuda a invenção a fazer seu trabalho.`:`A resposta é: ${item.p}.`;
 if(selectedYear===5)return ok?`${item.why} Essa característica é importante para cumprir a função.`:`A característica principal é: ${item.p}. ${item.why}`;
 return ok?item.why:`A pista principal é: ${item.p}. ${item.why}`;
}

function answerFunction(opt,answer){
 if(stage!==1)return;stage=2;const item=session[index],ok=opt===answer;lockOptions();
 if(ok){score+=10;functionHits++;streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0;
 tone(ok);document.getElementById('scoreText').textContent=score;
 showFeedback(ok,'✅ Isso! Vocês descobriram a função.',functionFeedback(item,ok),'Agora descubram como →',showFeature);
}

function showFeature(){
 const item=session[index];document.getElementById('feedback').classList.add('hidden');document.getElementById('stageOne').classList.add('hidden');document.getElementById('stageTwo').classList.remove('hidden');
 document.getElementById('featureQuestion').textContent=config().q2;
 renderOptions('featureOptions',item.po,item.p,answerFeature);
}

function answerFeature(opt,answer){
 if(stage!==2)return;stage=3;const item=session[index],ok=opt===answer;lockOptions();
 if(ok){score+=10;featureHits++;streak++;bestStreak=Math.max(bestStreak,streak)}else streak=0;
 tone(ok);document.getElementById('scoreText').textContent=score;
 showFeedback(ok,'⭐ Boa dupla!',featureFeedback(item,ok),index===TOTAL-1?'Ver resultado 🏆':'Próxima invenção →',next);
}

function next(){index++;if(index>=TOTAL)return finish();render()}

function medalFor(points){
 if(points>950)return{icon:'🥇',title:'Medalha de ouro!',message:`Parabéns, ${teamName}! Vocês fizeram uma ótima investigação. Chamem o professor!`};
 if(points>800)return{icon:'🥈',title:'Medalha de prata!',message:`Muito bem, ${teamName}! Vocês relacionaram muito bem função e características. Chamem o professor!`};
 if(points>600)return{icon:'🥉',title:'Medalha de bronze!',message:`Boa, ${teamName}! Joguem de novo e tentem chegar à prata!`};
 return{icon:'🎯',title:'Tentem mais uma vez!',message:`${teamName}, conversem mais sobre para que cada invenção serve e como ela consegue fazer isso. Joguem de novo!`};
}

function getLocalRanking(){try{const d=JSON.parse(localStorage.getItem(localRankKey())||'[]');return Array.isArray(d)?d:[]}catch(e){return[]}}
function saveLocal(){
 const r=getLocalRanking(),key=norm(teamName),pos=r.findIndex(x=>norm(x.name)===key),entry={name:teamName,score,updated:Date.now()};
 if(pos<0)r.push(entry);else if(score>Number(r[pos].score))r[pos]=entry;
 r.sort((a,b)=>Number(b.score)-Number(a.score)||(a.updated||0)-(b.updated||0));
 try{localStorage.setItem(localRankKey(),JSON.stringify(r.slice(0,50)))}catch(e){}
}

async function saveOnline(){
 const storedName=rankingPrefix()+teamName;
 const response=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({nome:storedName,pontos:score})});
 if(!response.ok)throw new Error(`ranking ${response.status}`);
}

function dedupe(rows){
 const prefix=rankingPrefix(),best=new Map();
 for(const row of rows||[]){
   let name=String(row.nome||row.name||'');
   if(name.startsWith(prefix))name=name.slice(prefix.length);
   const points=Number(row.pontos??row.score);name=cleanTeam(name);
   if(!name||!Number.isFinite(points))continue;
   const key=norm(name),old=best.get(key);
   if(!old||points>old.score)best.set(key,{name,score:points,updated:row.criado_em||row.updated||0});
 }
 return[...best.values()].sort((a,b)=>b.score-a.score||String(a.updated).localeCompare(String(b.updated))).slice(0,10);
}

async function getOnlineRanking(){
 const prefix=rankingPrefix();
 const url=`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=nome,pontos,criado_em&order=pontos.desc,criado_em.asc&limit=500`;
 const response=await fetch(url,{headers:{apikey:SUPABASE_KEY}});if(!response.ok)throw new Error(`ranking ${response.status}`);
 const rows=(await response.json()).filter(x=>String(x.nome||'').startsWith(prefix));return dedupe(rows);
}

function drawRanking(box,ranking,highlight='',offline=false){
 box.innerHTML='';
 if(!ranking.length){const e=document.createElement('div');e.className='rank-empty';e.textContent=offline?'Sem internet. Ainda não há pontuações neste computador.':'Ainda não há pontuações neste ano.';box.appendChild(e);return}
 ranking.forEach((entry,i)=>{
   const row=document.createElement('div');row.className='rank-row';if(highlight&&norm(entry.name)===norm(highlight))row.classList.add('current');
   const p=document.createElement('span');p.className='rank-pos';p.textContent=`${i+1}º`;
   const n=document.createElement('span');n.className='rank-name';n.textContent=`${medalFor(entry.score).icon} ${entry.name}`;
   const s=document.createElement('span');s.className='rank-score';s.textContent=`${entry.score} pts`;
   row.append(p,n,s);box.appendChild(row);
 });
 if(offline){const note=document.createElement('div');note.className='rank-empty';note.textContent='Sem conexão: mostrando o ranking deste computador.';box.appendChild(note)}
}

async function renderRanking(target,highlight=''){
 const box=document.getElementById(target);if(!box||!selectedYear)return;
 box.innerHTML='<div class="rank-empty">Carregando ranking...</div>';
 try{drawRanking(box,await getOnlineRanking(),highlight,false)}catch(e){drawRanking(box,dedupe(getLocalRanking().map(x=>({name:x.name,score:x.score,updated:x.updated}))),highlight,true)}
}

async function finish(){
 show('summary');const medal=medalFor(score);saveLocal();
 document.getElementById('medalIcon').textContent=medal.icon;document.getElementById('medalTitle').textContent=medal.title;document.getElementById('summaryMsg').textContent=medal.message;
 document.getElementById('finalScore').textContent=score;document.getElementById('functionHits').textContent=`${functionHits}/${TOTAL}`;document.getElementById('featureHits').textContent=`${featureHits}/${TOTAL}`;document.getElementById('bestStreak').textContent=bestStreak;
 document.getElementById('summaryRanking').innerHTML='<div class="rank-empty">Salvando pontuação...</div>';
 try{await saveOnline()}catch(e){}
 await renderRanking('summaryRanking',teamName);
}

function start(){
 if(!selectedYear)return changeYear();
 const a=cleanPerson(document.getElementById('playerOne').value),b=cleanPerson(document.getElementById('playerTwo').value),error=document.getElementById('nameError');
 if(!a||!b){error.textContent='Digite os dois nomes para começar.';error.classList.remove('hidden');(!a?document.getElementById('playerOne'):document.getElementById('playerTwo')).focus();return}
 if(norm(a)===norm(b)){error.textContent='Digite dois nomes diferentes.';error.classList.remove('hidden');return}
 playerOne=a;playerTwo=b;teamName=makeTeam(a,b);error.classList.add('hidden');
 buildSession();index=0;score=0;functionHits=0;featureHits=0;streak=0;bestStreak=0;show('game');render();
}

function goHome(){
 document.getElementById('playerOne').value=playerOne;document.getElementById('playerTwo').value=playerTwo;
 show('home');renderRanking('homeRanking',teamName);
}

document.querySelectorAll('.year-choice').forEach(btn=>btn.onclick=()=>selectYear(btn.dataset.year));
document.getElementById('startBtn').onclick=start;
document.getElementById('againBtn').onclick=start;
document.getElementById('homeBtn').onclick=goHome;
document.getElementById('changeYearBtn').onclick=changeYear;
document.getElementById('summaryYearBtn').onclick=changeYear;
document.getElementById('soundBtn').onclick=()=>{soundOn=!soundOn;document.getElementById('soundBtn').textContent=soundOn?'🔊':'🔇'};
document.getElementById('fullBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
document.getElementById('playerTwo').addEventListener('keydown',e=>{if(e.key==='Enter')start()});
show('year');
