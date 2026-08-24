/* Evita pistas visuais nas alternativas: a resposta correta não deve ser sistematicamente a mais longa. */
(function(){
  const FUNCTION_EXPANSIONS={
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
    'Medir distância':'Medir a distância entre dois pontos',
    'Proteger os pés':'Proteger os pés durante uma caminhada',
    'Fazer sombra':'Fazer sombra para bloquear parte da luz do Sol',
    'Fazer chover':'Fazer a chuva cair sobre um lugar',
    'Carregar caixas':'Carregar caixas de um lugar para outro',
    'Aumentar a chuva':'Aumentar a quantidade de chuva que cai',
    'Virar uma planta':'Transformar o objeto em uma planta viva',
    'Produzir luz':'Produzir luz para clarear um ambiente',
    'Fazer luz':'Produzir luz para clarear um ambiente',
    'Ajudar a voar':'Ajudar uma pessoa a voar pelo céu',
    'Ajudar a cortar madeira':'Ajudar a cortar madeira em pedaços',
    'Carregar peso':'Carregar objetos pesados por um caminho',
    'Melhorar a audição':'Ajudar uma pessoa a ouvir melhor os sons',
    'Aumentar a velocidade do carro':'Fazer o carro se mover com mais velocidade',
    'Fazer a bicicleta voar':'Fazer a bicicleta sair do chão e voar',
    'Cortar cordas':'Cortar cordas em pedaços menores'
  };

  const FEATURE_EXPANSIONS={
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
    'Uma rede':'Uma rede feita de vários fios ligados',
    'Cerdas':'Muitas cerdas pequenas e flexíveis'
  };

  function expand(text,kind){
    const map=kind==='function'?FUNCTION_EXPANSIONS:FEATURE_EXPANSIONS;
    return map[text]||text;
  }

  function addContext(text,kind,variant){
    if(kind==='function'){
      const endings=[' durante uma tarefa do dia a dia',' quando alguém precisa usar o objeto',' em uma situação comum do cotidiano'];
      return text+endings[variant%endings.length];
    }
    const endings=[' durante o funcionamento do objeto',' como uma parte usada durante a tarefa',' presente na estrutura do objeto'];
    return text+endings[variant%endings.length];
  }

  function balance(answer,options,kind){
    const wrong=(options||[]).filter(x=>x!==answer).map(x=>expand(x,kind));
    const target=answer.length;
    for(let i=0;i<wrong.length;i++){
      let guard=0;
      while(wrong[i].length<target*0.72&&guard<2){
        wrong[i]=addContext(wrong[i],kind,i+guard);
        guard++;
      }
    }
    const longest=Math.max(...wrong.map(x=>x.length));
    if(longest<target&&wrong.length){
      let index=wrong.findIndex(x=>x.length===longest);
      let guard=0;
      while(wrong[index].length<target&&guard<2){
        wrong[index]=addContext(wrong[index],kind,index+guard+1);
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

  // Diagnóstico para desenvolvimento: lista apenas casos em que a correta ainda é muito maior.
  const warnings=[];
  INVENTIONS.forEach(item=>{
    [['f','fo'],['p','po']].forEach(([answerKey,optionsKey])=>{
      const answer=item[answerKey];
      const wrong=item[optionsKey].filter(x=>x!==answer);
      const maxWrong=Math.max(...wrong.map(x=>x.length));
      if(answer.length>maxWrong*1.12)warnings.push(`${item.id}:${answerKey}`);
    });
  });
  if(warnings.length)console.warn('LED: alternativas ainda desequilibradas',warnings);
})();
