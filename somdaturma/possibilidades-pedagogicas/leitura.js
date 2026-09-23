/* Som da Turma — apresentação editorial. Não acessa áudio, perfis ou o banco. */
(()=>{
  'use strict';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const el=(tag,cls,html='')=>{const n=document.createElement(tag);if(cls)n.className=cls;n.innerHTML=html;return n;};
  const paths={
    sound:'<path d="M3 10v4m4-8v12m5-16v20m5-16v12m4-8v4"/>',
    talk:'<path d="M21 11a8 8 0 0 1-8 8H6l-4 3V11a8 8 0 0 1 8-8h3a8 8 0 0 1 8 8Z"/><path d="M7 10h9M7 14h6"/>',
    search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5M7 10.5h7m-3.5-3.5v7"/>',
    pencil:'<path d="m14 4 6 6M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15v6ZM4 15l5 5M13 21h8"/>',
    mic:'<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
    monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8m-4-5v5M6 12V9m4 3V7m4 5v-2m4 2V6"/>',
    book:'<path d="M12 5v16M12 5C8 2 4 2 2 3v16c4-1 7 0 10 2 3-2 6-3 10-2V3c-2-1-6-1-10 2Z"/>',
    group:'<circle cx="12" cy="7" r="3"/><path d="M6 22v-4a6 6 0 0 1 12 0v4M5 5a3 3 0 0 0 0 6m14-6a3 3 0 0 1 0 6M2 20v-3c0-2 1-3 3-4m17 7v-3c0-2-1-3-3-4"/>',
    chart:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h5M7 16h8"/>',
    code:'<rect x="8" y="2" width="8" height="5" rx="1"/><path d="M12 7v4M5 15l7-4 7 4-7 4-7-4Zm0 0H2v7h6m11-7h3v7h-6"/>',
    cloud:'<path d="M6 15a5 5 0 0 1-1-10 7 7 0 0 1 13 0 5 5 0 1 1 0 10M12 11v11m-4-4 4 4 4-4"/>',
    shield:'<path d="m12 2 9 4v6c0 5-6 9-9 10-3-1-9-5-9-10V6l9-4Zm-4 9 3 3 5-5"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    medal:'<path d="m5 2 3 7m11-7-3 7M9 2l3 5 3-5"/><circle cx="12" cy="15" r="7"/><path d="m12 11 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    heart:'<path d="M12 21 3 12C-2 5 7-1 12 6 17-1 26 5 21 12l-9 9Z"/>',
    room:'<path d="M3 21V3h18v18M3 12h18M12 3v9M8 21v-5h8v5"/>',
    pause:'<path d="M8 4v16M16 4v16"/>',
    flag:'<path d="M4 22V3c6-4 10 4 16 0v11c-6 4-10-4-16 0"/>'
  };
  const icon=(name,cls='')=>`<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.talk}</svg>`;
  const badge=name=>el('span','icon-badge',icon(name));
  const hero=$('.hero');
  if(!hero)return;

  // O texto original é movido, nunca substituído; as referências permanecem junto dele.
  const heroText=el('div','hero-copy');
  ['.eyebrow','h1','.lead'].forEach(s=>{const n=$(s,hero);if(n)heroText.append(n);});
  heroText.append(el('div','hero-actions','<a class="button primary" href="#atividades">Explorar atividades '+icon('arrow')+'</a><a class="text-link" href="#comecar">Começar em 20–25 min</a>'));
  const visual=el('div','hero-visual');
  visual.setAttribute('aria-label','Três ações possíveis: organizar, investigar e criar.');
  visual.innerHTML=`<div class="visual-caption">UM SINAL. MUITAS POSSIBILIDADES.</div>
    <div class="visual-signal"><span class="signal-icon">${icon('sound')}</span><span><small>O som da sala</small><strong>Um ponto de partida</strong></span><span class="signal-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
    <div class="visual-branches" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="visual-paths"><div>${icon('talk')}<b>Organizar</b><small>combinados</small></div><div>${icon('search')}<b>Investigar</b><small>perguntas</small></div><div>${icon('pencil')}<b>Criar</b><small>registros</small></div></div>
    <div class="visual-dialogue">${icon('group')}<span>Professor e turma<br><strong>interpretam juntos.</strong></span></div>`;
  const heroGrid=el('div','hero-grid');heroGrid.append(heroText,visual);hero.prepend(heroGrid);
  const intro=$('.intro-note',hero);if(intro)hero.append(intro);
  const quick=$('.quick',hero);
  if(quick){hero.after(quick);$$('a',quick).forEach((a,i)=>a.prepend(el('span','nav-number',String(i+1).padStart(2,'0'))));}

  const brief=el('section','brief');brief.setAttribute('aria-labelledby','brief-title');
  brief.innerHTML='<div class="brief-head"><span class="eyebrow">Para guardar</span><h2 id="brief-title">Em poucas palavras</h2></div>';
  const briefList=el('div','brief-list');
  [ ['talk','Pode ajudar<br><strong>a organizar.</strong>'],['eye','Não mede<br><strong>a atenção.</strong>'],['group','Não substitui<br><strong>o professor.</strong>'],['search','Pode virar<br><strong>investigação.</strong>'],['medal','Medalhas pedem<br><strong>mediação.</strong>'] ].forEach(([i,t])=>briefList.append(el('div','brief-item',icon(i)+'<p>'+t+'</p>')));
  brief.append(briefList);(quick||hero).after(brief);

  const sectionIcons={controle:'talk',curriculos:'book',atividades:'pencil',medalhas:'medal',inclusao:'group',avaliacao:'eye',comecar:'flag',referencias:'book'};
  Object.entries(sectionIcons).forEach(([id,i])=>{const s=document.getElementById(id);if(!s)return;const head=el('div','section-heading');head.append(badge(i));const copy=el('div','heading-copy');const num=$('.section-number',s),h=$('h2',s);if(num)copy.append(num);if(h)copy.append(h);head.append(copy);s.prepend(head);});

  const control=$('#controle');const readable=$('.readable',control);const paragraphs=readable?Array.from(readable.children):[];
  if(paragraphs.length===4){
    const deeper=el('details','deep-reading');deeper.innerHTML='<summary>'+icon('book')+'<span>Aprofundar: regulação, autoridade e escolhas da ferramenta</span><span class="chevron" aria-hidden="true">+</span></summary>';
    const deepBody=el('div','deep-body');
    ['A regulação é externa','Autoridade não é autoritarismo','Pessoas decidem; o desenho também importa'].forEach((t,i)=>{const part=el('div','deep-part');part.append(el('h3','',t),paragraphs[i+1]);deepBody.append(part);});deeper.append(deepBody);readable.after(deeper);
  }
  const central=$('.callout',control);if(central)central.classList.add('central-quote');
  $$('.grid-three .mini-card',control).forEach((c,i)=>{c.classList.add('path-card','tone-'+i);c.prepend(badge(['talk','group','search'][i]));});
  const sensor=$('.callout.blue',control);
  if(sensor){sensor.classList.add('sensor-callout');sensor.prepend(badge('mic'));}

  const flow=el('figure','meaning-flow');flow.innerHTML='<figcaption>Da leitura do microfone à decisão pedagógica</figcaption>';
  const flowSteps=el('div','flow-steps');
  [['mic','Microfone','capta o sinal'],['monitor','Programa','mostra a indicação'],['talk','Professor e turma','interpretam o contexto'],['check','Decisão','considera a atividade']].forEach(([i,t,s])=>flowSteps.append(el('div','flow-step',icon(i)+'<strong>'+t+'</strong><small>'+s+'</small>')));
  flow.append(flowSteps);if(sensor)sensor.after(flow);

  $$('#curriculos .mini-card').forEach((c,i)=>{c.classList.add('curriculum-card','tone-'+(i+1));c.prepend(el('div','card-kicker',icon(i?'room':'code')+'<span>'+(i?'REDE MUNICIPAL DE SÃO PAULO':'REFERÊNCIA NACIONAL')+'</span>'));});

  const data=[
    ['talk','Comparar fala e escuta e criar combinados com palavras, desenhos e símbolos.'],
    ['mic','Testar sons cotidianos e distinguir o dispositivo, o programa e a interpretação.'],
    ['chart','Registrar observações e perceber o que uma cor sozinha não explica.'],
    ['code','Representar regras, simular decisões e revisar instruções com a turma.'],
    ['cloud','Desenhar o caminho dos resultados e discutir os cuidados com os dados.'],
    ['pencil','Transformar descobertas em cartazes, apresentações ou áudios para compartilhar.']
  ];
  const activities=$$('details.activity');
  activities.forEach((a,i)=>{
    a.open=false;a.classList.add('tone-'+(i%3));
    const summary=$(':scope > summary',a),title=$('.activity-title',summary),num=$('.activity-number',summary);
    const art=el('span','activity-art',icon(data[i][0]));if(num)art.append(num);summary.prepend(art);
    if(title){
      const meta=$('small',title);if(meta){const parts=meta.textContent.split(' • ');meta.textContent='';meta.className='activity-meta';parts.forEach(part=>{const tag=document.createElement('span');tag.textContent=part;meta.append(tag);});}
      title.append(el('span','activity-abstract',data[i][1]));
      title.append(el('span','activity-cta','<span class="when-closed">Ver proposta</span><span class="when-open">Fechar proposta</span>'+icon('arrow')));
    }
    const body=$('.activity-body',a);if(!body)return;
    const prompt=$('.prompt',body);if(prompt)prompt.insertAdjacentHTML('afterbegin',icon('talk'));
    const steps=el('div','activity-steps');
    $$(':scope > p',body).filter(p=>p!==prompt).forEach((p,j)=>{p.classList.add('activity-step');const label=$('.label',p);if(label)label.insertAdjacentHTML('afterbegin',icon(j===0?'pencil':j===1?'chart':'eye'));if(j===2)p.classList.add('observe-step');steps.append(p);});
    if(prompt)prompt.after(steps);else body.prepend(steps);
    const curriculum=$('.curriculum',body);
    if(curriculum){const details=el('details','curriculum-details');details.innerHTML='<summary>'+icon('book')+'<span>Relações curriculares e fontes</span><span class="chevron" aria-hidden="true">+</span></summary>';curriculum.before(details);details.append(curriculum);}
  });
  const activityList=$('.activity-list');
  if(activityList){const toolbar=el('div','activity-toolbar','<span>Escolha uma proposta para abrir o passo a passo.</span><button class="outline-button" type="button" id="toggleActivities" aria-controls="atividade-1 atividade-2 atividade-3 atividade-4 atividade-5 atividade-6" aria-expanded="false">Abrir todas as atividades</button>');activityList.before(toolbar);}
  const toggle=$('#toggleActivities');
  function updateToggle(){if(!toggle)return;const all=activities.every(a=>a.open);toggle.textContent=all?'Fechar todas as atividades':'Abrir todas as atividades';toggle.setAttribute('aria-expanded',String(all));}
  if(toggle)toggle.addEventListener('click',()=>{const open=!activities.every(a=>a.open);activities.forEach(a=>a.open=open);updateToggle();});activities.forEach(a=>a.addEventListener('toggle',updateToggle));

  const medals=$('#medalhas');
  $$('.distinction > div',medals).forEach((c,i)=>c.prepend(badge(i?'group':'eye')));
  const practices=$$('.practice',medals);
  if(practices.length){const grid=el('div','practice-grid');practices[0].parentElement.before(grid);practices.forEach((p,i)=>{p.classList.add('practice-card');p.prepend(badge(['pencil','pause','check','medal'][i]));grid.append(p);});}
  const wallet=el('figure','wallet-example');wallet.innerHTML=`<figcaption>${icon('medal')}<span>Exemplo ilustrativo<strong>Usar não apaga a conquista.</strong></span></figcaption><div class="wallet-equation"><div><b>3</b><span>conquistadas</span></div><span class="math-sign" aria-hidden="true">−</span><div><b>1</b><span>usada</span></div><span class="math-sign" aria-hidden="true">=</span><div class="wallet-result"><b>2</b><span>disponíveis</span></div></div><p>No ranking, continuam <strong>3 medalhas conquistadas.</strong></p>`;
  const medalNote=$('.callout.warm',medals);if(medalNote)medalNote.before(wallet);
  $$('#inclusao .mini-card').forEach((c,i)=>c.prepend(badge(['group','heart','talk','room'][i])));
  $$('#avaliacao .mini-card').forEach((c,i)=>c.prepend(badge(['search','group','pencil'][i])));
  $$('.sequence article').forEach((c,i)=>{c.prepend(el('span','sequence-index',String(i+1).padStart(2,'0')));});

  // As âncoras abrem qualquer bloco recolhido que contenha o destino.
  function revealHash(hash,scroll=false){
    if(!hash||hash==='#')return;
    let id;try{id=decodeURIComponent(hash.slice(1));}catch(_){return;}
    const target=document.getElementById(id);if(!target)return;
    for(let p=target;p;p=p.parentElement){if(p.tagName==='DETAILS')p.open=true;}
    if(scroll)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
  document.addEventListener('click',e=>{const link=e.target.closest('a[href^="#"]');if(link)revealHash(link.getAttribute('href'));});
  window.addEventListener('hashchange',()=>revealHash(location.hash,true));revealHash(location.hash,true);

  const sections=$$('main > section.section');
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting);if(!visible.length)return;const id=visible[0].target.id;$$('.quick a').forEach(a=>{const match=a.hash==='#'+id;if(match)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});},{rootMargin:'-12% 0px -62% 0px'});sections.forEach(s=>observer.observe(s));}
  let printState=[];
  window.addEventListener('beforeprint',()=>{printState=$$('details').map(n=>[n,n.open]);printState.forEach(([n])=>n.open=true);});
  window.addEventListener('afterprint',()=>{printState.forEach(([n,open])=>n.open=open);});
  $('#printPage')?.addEventListener('click',()=>window.print());
  document.body.classList.add('reading-ready');
})();
