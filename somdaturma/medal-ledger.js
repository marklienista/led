/* Som da Turma — regras de pontos e medalhas
   Registros anteriores à mudança de 28/10/2026 conservam as medalhas
   anteriormente atribuídas. Nos novos registros, os pontos só viram
   medalhas por ação explícita do professor (tipo medalha_trocada).
   Módulo sem rede, DOM, áudio ou persistência. */
(()=>{
  'use strict';
  const LEGACY_BEFORE=Date.parse('2026-10-28T17:52:11.350655Z');
  function cleanRoom(value){
    return String(value||'').trim().toUpperCase().replace(/\|/g,'').replace(/\s+/g,' ').slice(0,12);
  }
  function validTime(row){
    // Os IDs gerados no navegador começam pelo instante original em base36.
    // Assim, uma aula antiga enviada à nuvem depois mantém sua ordem histórica.
    const raw=String(row.id??row.sessao_id??'').replace(/^[MUT]/,'').slice(0,8);
    if(/^[a-z0-9]{8}$/i.test(raw)){
      const time=parseInt(raw,36);
      if(Number.isFinite(time)&&time>=1577836800000&&time<4102444800000)return time;
    }
    if(typeof row.ts==='number'&&Number.isFinite(row.ts))return row.ts;
    const parsed=Date.parse(row.ts||row.criado_em||'');
    return Number.isFinite(parsed)?parsed:0;
  }
  function targetValue(value){
    const n=Math.floor(Number(value));
    return Number.isFinite(n)&&n>=1&&n<=10000?n:40;
  }
  function calculate(rows,room,target){
    const chosen=cleanRoom(room);
    const goal=targetValue(target);
    const order=(Array.isArray(rows)?rows:[])
      .filter(row=>cleanRoom(row.room??row.turma)===chosen)
      .slice().sort((a,b)=>validTime(a)-validTime(b));
    let points=0,medals=0,used=0,lessons=0,record=0,conflicts=0,legacyMedals=0;
    for(const s of order){
      const delta=Number(s.point??s.pontos)||0;
      const redeem=s.medalConversion===true||s.tipo==='medalha_trocada';
      if(redeem){
        const cost=Math.abs(Math.trunc(delta));
        if(cost>=1&&cost<=10000&&delta<0&&points>=cost){
          points-=cost;
          medals+=1;
        }else{
          conflicts+=1; // Um evento inconsistente não concede medalha automática.
        }
      }else if(delta>=0){
        points+=delta;
        const at=validTime(s);
        if(at>0&&at<LEGACY_BEFORE){
          while(points>=goal){
            points-=goal;
            medals+=1;
            legacyMedals+=1;
          }
        }
      }else{
        points=Math.max(0,points+delta);
      }
      used+=Math.max(0,Number(s.medalUse??s.medalhas_usadas)||0);
      record=Math.max(record,Math.max(0,Number(s.record??s.recorde_seg)||0));
      if(!(s.manual||s.tipo==='ajuste'||s.tipo==='medalha_usada'||redeem))lessons++;
    }
    return{room:chosen,points,progress:points,target:goal,
      medals,used,available:Math.max(0,medals-used),
      remaining:Math.max(0,goal-points),canExchange:points>=goal,
      lessons,record,conflicts,legacyMedals};
  }
  function allRooms(rows,target){
    const names=[...new Set((Array.isArray(rows)?rows:[])
      .map(x=>cleanRoom(x.room??x.turma)).filter(Boolean))];
    return names.map(name=>calculate(rows,name,target));
  }
  window.SOM_TURMA_MEDAL_LEDGER=Object.freeze({calculate,allRooms,cleanRoom,legacyBefore:LEGACY_BEFORE});
})();