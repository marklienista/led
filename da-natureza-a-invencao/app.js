const TOTAL_MISSIONS=20,MAX_SCORE=1000;
const SUPABASE_URL='https://eyfmhnlzduoobdmwexmc.supabase.co';
const SUPABASE_KEY='sb_publishable_as-eMTlem4cWd29PVNFAhg_uVLIqZKu';
const SUPABASE_TABLE='invencoes_ranking';
const GRADE_PLAN={3:{1:6,2:6,3:5,4:3},5:{1:3,2:5,3:6,4:6}};
let selectedYear=null,playerOne='',playerTwo='',teamName='',session=[],missionIndex=0,score=0,totalMistakes=0,perfectMissions=0,missionMistakes=0,placed=[],selectedPiece=null,soundOn=true;

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function show(id){['year','home','game','summary'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id))}
function clean(v){return String(v||'').trim().replace(/\s+/g,' ').slice(0,9)}
function norm(v){return String(v||'').toLocaleLowerCase('pt-BR')}
function makeTeam(a,b){return[a,b].sort((x,y)=>x.localeCompare(y,'pt-BR',{sensitivity:'base'})).join(' + ')}
function prefix(){return `N${selectedYear}|`}
function localKey(){return `chain_rank_${selectedYear}`}
function applyYear(){document.body.dataset.year=String(selectedYear);document.getElementById('headerYear').textContent=`${selectedYear}º ano`;document.querySelectorAll('.year-label').forEach(x=>x.textContent=`${selectedYear}º ano`)}
function selectYear(y){selectedYear=Number(y);applyYear();playerOne=playerTwo=teamName='';document.getElementById('playerOne').value='';document.getElementById('playerTwo').value='';show('home');renderRanking('homeRanking')}
function changeYear(){selectedYear=null;delete document.body.dataset.year;document.getElementById('headerYear').textContent='Escolha o ano';show('year')}

function buildSession(){
 session=[];
 for(const level of [1,2,3,4]){
  const all=shuffle(MISSION_BANK.filter(x=>x.level===level));
  session.push(...all.slice(0,GRADE_PLAN[selectedYear][level]));
 }
}
function currentSteps(m){return selectedYear===3?m.simple:m.advanced}
function roleText(){
 const mover=missionIndex%2===0?playerOne:playerTwo,helper=missionIndex%2===0?playerTwo:playerOne;
 return `🖱️ ${mover} movimenta as peças. 💬 ${helper} observa e ajuda a decidir. Na próxima missão, vocês trocam.`;
}
function allCandidateCards(m){
 const steps=currentSteps(m),used=new Set([...steps.map(x=>x.label),m.target.label]);
 const count=Math.min(3,Math.max(0,m.level-1));
 const candidates=[];
 for(const other of MISSION_BANK){
  const arr=selectedYear===3?other.simple:other.advanced;
  for(const c of arr)if(!used.has(c.label)&&!candidates.some(x=>x.label===c.label))candidates.push(c);
 }
 return shuffle(candidates).slice(0,count);
}
function renderMission(){
 const m=session[missionIndex],steps=currentSteps(m);missionMistakes=0;placed=new Array(steps.length).fill(false);selectedPiece=null;
 document.getElementById('teamLabel').textContent=`👥 ${teamName}`;document.getElementById('roundText').textContent=`Missão ${missionIndex+1} de ${TOTAL_MISSIONS}`;document.getElementById('scoreText').textContent=score;document.getElementById('progressBar').style.width=`${(missionIndex/TOTAL_MISSIONS)*100}%`;
 document.getElementById('targetName').textContent=m.target.label;document.getElementById('missionNote').textContent=m.note;document.getElementById('targetVisual').innerHTML=renderCardArt(m.target);document.getElementById('roleHint').textContent=roleText();
 document.getElementById('missionFeedback').className='mission-feedback hidden';document.getElementById('nextMissionBtn').classList.add('hidden');
 const chain=document.getElementById('chain');chain.innerHTML='';
 steps.forEach((s,i)=>{
   const wrap=document.createElement('div');wrap.className='slot-wrap';
   const slot=document.createElement('div');slot.className='slot';slot.dataset.index=i;slot.innerHTML=`<small>${selectedYear===3?(i===0?'Da natureza':'Material'):(i===0?'Recurso natural':i===1?'Material obtido':'Transformação')}</small><strong>Coloque uma peça</strong>`;
   slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('ready')});slot.addEventListener('dragleave',()=>slot.classList.remove('ready'));slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('ready');placePiece(e.dataTransfer.getData('text/plain'),i)});slot.onclick=()=>{if(selectedPiece)placePiece(selectedPiece,i)};
   wrap.appendChild(slot);const arrow=document.createElement('div');arrow.className='arrow';arrow.textContent='→';wrap.appendChild(arrow);chain.appendChild(wrap);
 });
 const target=document.createElement('div');target.className='fixed-target';target.innerHTML=`<small>Feito por pessoas</small><div class="mini-art">${renderCardArt(m.target)}</div><strong>${m.target.label}</strong>`;chain.appendChild(target);
 const pieces=shuffle([...steps,...allCandidateCards(m)]);const bank=document.getElementById('bank');bank.innerHTML='';
 pieces.forEach((card,i)=>{const p=document.createElement('button');p.className='piece';p.draggable=true;p.dataset.label=card.label;p.innerHTML=`<div class="mini-art">${renderCardArt(card)}</div><strong>${card.label}</strong>`;p.ondragstart=e=>{p.classList.add('dragging');e.dataTransfer.setData('text/plain',card.label)};p.ondragend=()=>p.classList.remove('dragging');p.onclick=()=>selectPiece(card.label,p);bank.appendChild(p)});
}
function selectPiece(label,el){document.querySelectorAll('.piece').forEach(x=>x.classList.remove('selected'));selectedPiece=label;el.classList.add('selected')}
function findPiece(label){return [...document.querySelectorAll('.piece')].find(x=>x.dataset.label===label)}
function placePiece(label,index){
 if(!label||placed[index])return;const m=session[missionIndex],steps=currentSteps(m),expected=steps[index],feedback=document.getElementById('missionFeedback');
 if(label===expected.label){
  placed[index]=true;const slot=document.querySelector(`.slot[data-index="${index}"]`);slot.className='slot correct';slot.innerHTML=`<small>${selectedYear===3?(index===0?'Da natureza':'Material'):(index===0?'Recurso natural':index===1?'Material obtido':'Transformação')}</small><div class="mini-art">${renderCardArt(expected)}</div><strong>${expected.label}</strong>`;
  const piece=findPiece(label);if(piece)piece.remove();selectedPiece=null;tone(true);
  if(placed.every(Boolean))completeMission();else{feedback.className='mission-feedback good';feedback.textContent='Boa! Essa peça faz parte do caminho.'}
 }else{
  missionMistakes++;totalMistakes++;selectedPiece=null;document.querySelectorAll('.piece').forEach(x=>x.classList.remove('selected'));tone(false);feedback.className='mission-feedback bad';feedback.textContent='Ihhhh 😢 Essa peça não completa esse pedaço do caminho. Tentem outra.';
 }
}
function completeMission(){
 const gained=Math.max(20,50-missionMistakes*10);score+=gained;if(missionMistakes===0)perfectMissions++;document.getElementById('scoreText').textContent=score;
 const f=document.getElementById('missionFeedback');f.className='mission-feedback good';f.textContent=`Caminho completo! +${gained} pontos.`;
 const n=document.getElementById('nextMissionBtn');n.textContent=missionIndex===TOTAL_MISSIONS-1?'Ver resultado 🏆':'Próxima missão →';n.classList.remove('hidden');n.onclick=nextMission;
}
function nextMission(){missionIndex++;if(missionIndex>=TOTAL_MISSIONS)return finish();renderMission()}
function tone(ok){if(!soundOn)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=ok?620:170;g.gain.value=.05;o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.16);o.stop(c.currentTime+.18)}catch(e){}}
function medalFor(points){if(points>950)return{icon:'🥇',title:'Medalha de ouro!',msg:`Parabéns, ${teamName}! Vocês construíram quase todos os caminhos sem erros. Chamem o professor!`};if(points>800)return{icon:'🥈',title:'Medalha de prata!',msg:`Muito bem, ${teamName}! Vocês entenderam muitas transformações. Chamem o professor!`};if(points>600)return{icon:'🥉',title:'Medalha de bronze!',msg:`Boa, ${teamName}! Joguem outra vez e tentem montar os caminhos com menos tentativas.`};return{icon:'🎯',title:'Tentem novamente!',msg:`${teamName}, conversem sobre de onde vêm os materiais e tentem outra vez.`}}
function getLocal(){try{return JSON.parse(localStorage.getItem(localKey())||'[]')}catch(e){return[]}}
function saveLocal(){const r=getLocal(),k=norm(teamName),i=r.findIndex(x=>norm(x.name)===k),e={name:teamName,score,updated:Date.now()};if(i<0)r.push(e);else if(score>r[i].score)r[i]=e;r.sort((a,b)=>b.score-a.score);localStorage.setItem(localKey(),JSON.stringify(r.slice(0,50)))}
async function saveOnline(){const response=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({nome:prefix()+teamName,pontos:score})});if(!response.ok)throw new Error('ranking')}
function dedupe(rows){const best=new Map();for(const row of rows||[]){let name=String(row.nome||row.name||'');if(name.startsWith(prefix()))name=name.slice(prefix().length);const pts=Number(row.pontos??row.score);if(!name||!Number.isFinite(pts))continue;const k=norm(name),old=best.get(k);if(!old||pts>old.score)best.set(k,{name,score:pts,updated:row.criado_em||row.updated||0})}return[...best.values()].sort((a,b)=>b.score-a.score||String(a.updated).localeCompare(String(b.updated))).slice(0,10)}
async function getOnline(){const response=await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=nome,pontos,criado_em&order=pontos.desc,criado_em.asc&limit=500`,{headers:{apikey:SUPABASE_KEY}});if(!response.ok)throw new Error('ranking');return dedupe((await response.json()).filter(x=>String(x.nome||'').startsWith(prefix())))}
function drawRanking(box,r,highlight='',offline=false){box.innerHTML='';if(!r.length){box.innerHTML=`<div class="rank-empty">${offline?'Ranking local ainda vazio.':'Ainda não há pontuações neste ano.'}</div>`;return}r.forEach((e,i)=>{const row=document.createElement('div');row.className='rank-row'+(highlight&&norm(e.name)===norm(highlight)?' current':'');row.innerHTML=`<span class="rank-pos">${i+1}º</span><span class="rank-name">${medalFor(e.score).icon} ${e.name}</span><span class="rank-score">${e.score} pts</span>`;box.appendChild(row)});if(offline)box.insertAdjacentHTML('beforeend','<div class="rank-empty">Sem conexão: mostrando este computador.</div>')}
async function renderRanking(id,highlight=''){const box=document.getElementById(id);if(!box||!selectedYear)return;box.innerHTML='<div class="rank-empty">Carregando ranking...</div>';try{drawRanking(box,await getOnline(),highlight,false)}catch(e){drawRanking(box,dedupe(getLocal().map(x=>({name:x.name,score:x.score,updated:x.updated}))),highlight,true)}}
async function finish(){show('summary');saveLocal();const m=medalFor(score);document.getElementById('medalIcon').textContent=m.icon;document.getElementById('medalTitle').textContent=m.title;document.getElementById('summaryMsg').textContent=m.msg;document.getElementById('finalScore').textContent=score;document.getElementById('perfectMissions').textContent=`${perfectMissions}/20`;document.getElementById('totalMistakes').textContent=totalMistakes;try{await saveOnline()}catch(e){}await renderRanking('summaryRanking',teamName)}
function start(){const a=clean(document.getElementById('playerOne').value),b=clean(document.getElementById('playerTwo').value),err=document.getElementById('nameError');if(!a||!b){err.textContent='Digite os dois nomes para começar.';err.classList.remove('hidden');return}if(norm(a)===norm(b)){err.textContent='Digite dois nomes diferentes.';err.classList.remove('hidden');return}playerOne=a;playerTwo=b;teamName=makeTeam(a,b);err.classList.add('hidden');buildSession();missionIndex=0;score=0;totalMistakes=0;perfectMissions=0;show('game');renderMission()}
function goHome(){document.getElementById('playerOne').value=playerOne;document.getElementById('playerTwo').value=playerTwo;show('home');renderRanking('homeRanking',teamName)}
document.querySelectorAll('.year-choice').forEach(b=>b.onclick=()=>selectYear(b.dataset.year));document.getElementById('startBtn').onclick=start;document.getElementById('changeYearBtn').onclick=changeYear;document.getElementById('summaryYearBtn').onclick=changeYear;document.getElementById('againBtn').onclick=start;document.getElementById('homeBtn').onclick=goHome;document.getElementById('soundBtn').onclick=()=>{soundOn=!soundOn;document.getElementById('soundBtn').textContent=soundOn?'🔊':'🔇'};document.getElementById('fullBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};document.getElementById('playerTwo').addEventListener('keydown',e=>{if(e.key==='Enter')start()});show('year');