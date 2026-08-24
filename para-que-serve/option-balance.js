/*
  Evita pistas visuais nas alternativas.
  A resposta correta não deve ser reconhecível por ser sistematicamente
  a maior, a menor ou a única escrita com mais detalhes.
*/
(function(){
  const FUNCTION_MEDIUM={
    'Cortar papel':'Cortar folhas de papel',
    'Medir as horas':'Medir as horas do dia',
    'Medir horas':'Medir as horas do dia',
    'Iluminar':'Iluminar um lugar',
    'Iluminar um quarto':'Iluminar um quarto escuro',
    'Guardar água':'Guardar água em um recipiente',
    'Guardar líquidos':'Guardar líquidos em um recipiente',
    'Guardar comida':'Guardar alimentos para depois',
    'Guardar alimentos':'Guardar alimentos para depois',
    'Fazer comida':'Preparar uma refeição',
    'Cozinhar':'Cozinhar uma refeição',
    'Voar':'Voar pelo céu',
    'Medir o tempo':'Medir a passagem do tempo',
    'Marcar as horas':'Marcar as horas do dia',
    'Cortar madeira':'Cortar pedaços de madeira',
    'Cortar tecido':'Cortar pedaços de tecido',
    'Cortar comida':'Cortar alimentos em pedaços',
    'Proteger da chuva':'Proteger alguém da chuva',
    'Transportar pessoas':'Transportar pessoas pelo caminho',
    'Medir a temperatura':'Medir se algo está quente ou frio',
    'Medir temperatura':'Medir se algo está quente ou frio',
    'Medir distância':'Medir a distância entre dois pontos',
    'Proteger os pés':'Proteger os pés ao caminhar',
    'Fazer sombra':'Fazer sombra contra o Sol',
    'Fazer chover':'Fazer a chuva cair',
    'Carregar caixas':'Carregar caixas pelo caminho',
    'Aumentar a chuva':'Aumentar a quantidade de chuva',
    'Virar uma planta':'Virar uma planta viva',
    'Produzir luz':'Produzir luz no ambiente',
    'Fazer luz':'Produzir luz no ambiente',
    'Ajudar a voar':'Ajudar alguém a voar',
    'Ajudar a cortar madeira':'Ajudar a cortar pedaços de madeira',
    'Carregar peso':'Carregar objetos pesados',
    'Melhorar a audição':'Ajudar alguém a ouvir melhor',
    'Aumentar a velocidade do carro':'Fazer o carro andar mais rápido',
    'Fazer a bicicleta voar':'Fazer a bicicleta voar pelo ar',
    'Cortar cordas':'Cortar cordas em pedaços'
  };

  const FUNCTION_LONG={
    'Cortar papel':'Cortar folhas de papel em pedaços menores',
    'Medir as horas':'Medir a passagem das horas ao longo do dia',
    'Medir horas':'Medir a passagem das horas ao longo do dia',
    'Iluminar':'Iluminar um lugar quando está escuro',
    'Iluminar um quarto':'Iluminar um quarto quando está escuro',
    'Guardar água':'Guardar água para usar em outro momento',
    'Guardar líquidos':'Guardar líquidos para usar em outro momento',
    'Guardar comida':'Guardar alimentos para usar mais tarde',
    'Guardar alimentos':'Guardar alimentos para usar mais tarde',
    'Fazer comida':'Preparar alimentos para uma refeição',
    'Cozinhar':'Preparar alimentos para uma refeição',
    'Voar':'Levar uma pessoa pelo ar de um lugar a outro',
    'Medir o tempo':'Medir a passagem do tempo ao longo do dia',
    'Marcar as horas':'Marcar a passagem das horas ao longo do dia',
    'Cortar madeira':'Cortar pedaços de madeira para uma tarefa',
    'Cortar tecido':'Cortar pedaços de tecido para uma tarefa',
    'Cortar comida':'Cortar alimentos em pedaços menores',
    'Proteger da chuva':'Proteger uma pessoa enquanto a chuva cai',
    'Transportar pessoas':'Transportar pessoas de um lugar para outro',
    'Medir a temperatura':'Medir se alguma coisa está quente ou fria',
    'Medir temperatura':'Medir se alguma coisa está quente ou fria',
    'Medir distância':'Medir a distância entre dois lugares',
    'Proteger os pés':'Proteger os pés durante uma caminhada',
    'Fazer sombra':'Fazer sombra para bloquear parte da luz do Sol',
    'Fazer chover':'Fazer a chuva cair sobre um lugar',
    'Carregar caixas':'Carregar caixas de um lugar para outro',
    'Aumentar a chuva':'Aumentar a quantidade de chuva que cai',
    'Virar uma planta':'Transformar o objeto em uma planta viva',
    'Produzir luz':'Produzir luz para clarear um ambiente',
    'Fazer luz':'Produzir luz para clarear um ambiente',
    'Ajudar a voar':'Ajudar uma pessoa a voar pelo céu',
    'Ajudar a cortar madeira':'Ajudar a cortar madeira em pedaços menores',
    'Carregar peso':'Carregar objetos pesados por um caminho',
    'Melhorar a audição':'Ajudar uma pessoa a ouvir melhor os sons',
    'Aumentar a velocidade do carro':'Fazer o carro se mover com mais velocidade',
    'Fazer a bicicleta voar':'Fazer a bicicleta sair do chão e voar',
    'Cortar cordas':'Cortar cordas em pedaços menores'
  };

  const FEATURE_MEDIUM={
    'Uma roda':'Uma roda que gira',
    'Duas rodas':'Duas rodas que giram',
    'Rodas':'Rodas que giram',
    'Uma lâmina':'Uma lâmina afiada',
    'Duas lâminas':'Duas lâminas afiadas',
    'Lâminas':'Lâminas afiadas',
    'Um mostrador':'Um mostrador com números',
    'Asas':'Asas largas',
    'Duas asas':'Duas asas largas',
    'Uma asa':'Uma asa larga',
    'Uma tela':'Uma tela com imagens',
    'Um motor':'Um motor que gira',
    'Uma hélice':'Uma hélice que gira',
    'Uma tampa':'Uma tampa que fecha',
    'Uma lente':'Uma lente transparente',
    'Uma lente curva':'Uma lente curva transparente',
    'Uma lente grande':'Uma lente grande e transparente',
    'Uma roda pequena':'Uma pequena roda que gira',
    'Uma ponta afiada':'Uma ponta fina e afiada',
    'Uma tampa e uma alça':'Uma tampa e uma alça para carregar',
    'Tampa e alça':'Uma tampa e uma alça',
    'Papel e tinta':'Papel marcado com tinta',
    'Um encosto':'Um encosto firme',
    'Folhas de papel':'Várias folhas de papel',
    'Uma rede':'Uma rede feita de fios',
    'Um tecido grosso':'Um tecido grosso e resistente',
    'Cerdas e cabo':'Cerdas presas a um cabo',
    'Raízes e folhas':'Raízes e folhas de uma planta',
    'Pétalas':'Pétalas de uma flor',
    'Lâminas e cerdas':'Lâminas junto de cerdas',
    'Asas e penas':'Asas cobertas por penas',
    'Penas e asas':'Penas cobrindo duas asas',
    'Uma roda dentada':'Uma roda com vários dentes',
    'Pés de mesa':'Pés firmes de uma mesa',
    'Uma lente e uma tela':'Uma lente diante de uma tela',
    'Rodas e pedais':'Rodas ligadas a pedais',
    'Lâminas e cola':'Lâminas junto de cola',
    'Cerdas':'Muitas cerdas pequenas'
  };

  const FEATURE_LONG={
    'Uma roda':'Uma roda que gira sobre o chão',
    'Duas rodas':'Duas rodas que giram sobre o chão',
    'Rodas':'Rodas que giram e ajudam no movimento',
    'Uma lâmina':'Uma lâmina afiada usada para fazer cortes',
    'Duas lâminas':'Duas lâminas que passam uma pela outra',
    'Lâminas':'Lâminas afiadas usadas para fazer cortes',
    'Um mostrador':'Um mostrador que apresenta informações',
    'Asas':'Duas asas largas que se movem pelo ar',
    'Duas asas':'Duas asas largas que se movem pelo ar',
    'Uma asa':'Uma asa larga que se movimenta pelo ar',
    'Uma tela':'Uma tela que mostra imagens e informações',
    'Um motor':'Um motor que produz movimento no objeto',
    'Uma hélice':'Uma hélice que gira e empurra o ar',
    'Uma tampa':'Uma tampa que fecha a abertura do objeto',
    'Uma lente':'Uma lente transparente que muda a passagem da luz',
    'Uma lente curva':'Uma lente curva que muda a passagem da luz',
    'Uma lente grande':'Uma lente grande e transparente diante dos olhos',
    'Uma roda pequena':'Uma roda pequena que gira sobre o chão',
    'Uma ponta afiada':'Uma ponta afiada usada para perfurar materiais',
    'Uma tampa e uma alça':'Uma tampa para fechar e uma alça para carregar',
    'Tampa e alça':'Uma tampa para fechar e uma alça para carregar',
    'Papel e tinta':'Papel com marcas feitas usando tinta',
    'Um encosto':'Um encosto firme usado para apoiar as costas',
    'Folhas de papel':'Várias folhas de papel presas umas às outras',
    'Uma rede':'Uma rede formada por muitos fios ligados',
    'Um tecido grosso':'Um tecido grosso que cobre uma superfície',
    'Cerdas e cabo':'Cerdas presas a um cabo usado para segurar',
    'Raízes e folhas':'Raízes no solo e folhas que recebem a luz',
    'Pétalas':'Pétalas coloridas ao redor de uma flor',
    'Lâminas e cerdas':'Lâminas e cerdas presas à mesma estrutura',
    'Asas e penas':'Asas cobertas por penas leves e flexíveis',
    'Penas e asas':'Asas cobertas por penas leves e flexíveis',
    'Uma roda dentada':'Uma roda dentada que gira junto com outras peças',
    'Pés de mesa':'Pés firmes que sustentam uma superfície',
    'Uma lente e uma tela':'Uma lente transparente e uma tela para imagens',
    'Rodas e pedais':'Rodas e pedais que transformam força em movimento',
    'Lâminas e cola':'Lâminas e cola presas ao mesmo objeto',
    'Cerdas':'Muitas cerdas pequenas e flexíveis'
  };

  function mapsFor(kind){
    return kind==='function'
      ? [FUNCTION_MEDIUM,FUNCTION_LONG]
      : [FEATURE_MEDIUM,FEATURE_LONG];
  }

  function closestVersion(text,target,kind){
    const [medium,long]=mapsFor(kind);
    const candidates=[text,medium[text],long[text]].filter(Boolean);
    return candidates.reduce((best,current)=>
      Math.abs(current.length-target)<Math.abs(best.length-target)?current:best
    ,candidates[0]);
  }

  function addSmallContext(text,kind,variant){
    const endings=kind==='function'
      ? [' no dia a dia',' durante o uso',' em uma tarefa']
      : [' no objeto',' durante o uso',' na estrutura'];
    return text+endings[variant%endings.length];
  }

  function balance(answer,options,kind){
    const target=answer.length;
    const originals=(options||[]).filter(x=>x!==answer);
    const wrong=originals.map(x=>closestVersion(x,target,kind));

    // Nenhum distrator deve ficar dramaticamente menor que a correta.
    for(let i=0;i<wrong.length;i++){
      let guard=0;
      while(wrong[i].length<target*0.70&&guard<2){
        wrong[i]=addSmallContext(wrong[i],kind,i+guard);
        guard++;
      }
    }

    // Se a correta ainda for a única maior, aproximamos um dos distratores.
    if(wrong.length){
      let index=wrong.reduce((best,iValue,i)=>
        wrong[best].length>=iValue.length?best:i
      ,0);
      let guard=0;
      while(wrong[index].length<target*0.94&&guard<2){
        wrong[index]=addSmallContext(wrong[index],kind,index+guard+1);
        guard++;
      }
    }

    return [answer,...wrong];
  }

  if(typeof INVENTIONS==='undefined')return;

  INVENTIONS.forEach(item=>{
    item.fo=balance(item.f,item.fo,'function');
    item.po=balance(item.p,item.po,'feature');
  });

  // Diagnóstico de desenvolvimento para novos itens do banco.
  const warnings=[];
  INVENTIONS.forEach(item=>{
    [['f','fo'],['p','po']].forEach(([answerKey,optionsKey])=>{
      const answer=item[answerKey];
      const wrong=item[optionsKey].filter(x=>x!==answer);
      const lengths=[answer.length,...wrong.map(x=>x.length)];
      const max=Math.max(...lengths),min=Math.min(...lengths);
      if(answer.length===max&&answer.length>Math.max(...wrong.map(x=>x.length))*1.12)
        warnings.push(`${item.id}:${answerKey}:correta-muito-longa`);
      if(answer.length===min&&Math.min(...wrong.map(x=>x.length))>answer.length*1.35)
        warnings.push(`${item.id}:${answerKey}:correta-muito-curta`);
    });
  });
  if(warnings.length)console.warn('LED: revisar equilíbrio visual das alternativas',warnings);
})();
