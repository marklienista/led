const TOTAL=45;
const MAX_SCORE=TOTAL*20;
let session=[],index=0,score=0,classHits=0,followHits=0,streak=0,bestStreak=0,stage=1,soundOn=true;

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function show(id){['home','game','summary'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id))}
function buildSession(){
  let prev=[];try{prev=JSON.parse(localStorage.getItem('inv_prev')||'[]')}catch(e){}
  session=[];
  for(const band of [1,2,3]){
    const all=QUESTION_BANK.filter(x=>x.band===band);
    const fresh=shuffle(all.filter(x=>!prev.includes(x.id)));
    const old=shuffle(all.filter(x=>prev.includes(x.id)));
    session.push(...fresh.slice(0,15));
    if(session.filter(x=>x.band===band).length<15){
      const need=15-session.filter(x=>x.band===band).length;
      session.push(...old.slice(0,need));
    }
  }
  try{localStorage.setItem('inv_prev',JSON.stringify(session.map(x=>x.id)))}catch(e){}
}
function levelText(){return index<15?'Observe':index<30?'Pense na transformação':'Desafio de inventor'}
function render(){
 const item=session[index];stage=1;
 document.getElementById('roundText').textContent=`Item ${index+1} de ${TOTAL}`;
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
 document.getElementById('feedbackTitle').textContent=ok?'✅ Certo!':'🔎 Veja:';
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
 document.getElementById('feedbackTitle').textContent=ok?'⭐ Muito bem!':'💡 A resposta é:';
 document.getElementById('feedbackText').textContent=ok?item.ans:`${item.ans}.`;
 document.getElementById('nextBtn').textContent=index===TOTAL-1?'Ver pontuação 🏆':'Próximo item →';document.getElementById('nextBtn').onclick=next;
}
function next(){index++;if(index>=TOTAL)return finish();render()}
function finish(){
 show('summary');document.getElementById('finalScore').textContent=score;document.getElementById('maxScore').textContent=MAX_SCORE;
 document.getElementById('classHits').textContent=`${classHits}/${TOTAL}`;document.getElementById('followHits').textContent=`${followHits}/${TOTAL}`;document.getElementById('bestStreak').textContent=bestStreak;
 const p=score/MAX_SCORE;document.getElementById('summaryMsg').textContent=p>=.85?'Excelente! Você observou e pensou muito bem.':p>=.65?'Muito bem! Você aprendeu bastante.':'Boa tentativa! Jogue de novo e veja novos itens.';
}
function start(){buildSession();index=0;score=0;classHits=0;followHits=0;streak=0;bestStreak=0;show('game');render()}
document.getElementById('startBtn').onclick=start;document.getElementById('againBtn').onclick=start;document.getElementById('homeBtn').onclick=()=>show('home');
document.getElementById('naturalBtn').onclick=()=>classify('natural');document.getElementById('inventionBtn').onclick=()=>classify('invention');
document.getElementById('soundBtn').onclick=()=>{soundOn=!soundOn;document.getElementById('soundBtn').textContent=soundOn?'🔊':'🔇'};
document.getElementById('fullBtn').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
document.addEventListener('keydown',e=>{if(document.getElementById('game').classList.contains('hidden'))return;if(stage===1&&e.key.toLowerCase()==='n')classify('natural');if(stage===1&&e.key.toLowerCase()==='i')classify('invention')});