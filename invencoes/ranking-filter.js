// Mantém o ranking de "Invenções e Natureza" separado dos demais jogos e ferramentas.
getOnlineRanking = async function(){
  const url=`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=nome,pontos,criado_em&order=pontos.desc,criado_em.asc&limit=300`;
  const response=await fetch(url,{headers:{'apikey':SUPABASE_KEY}});
  if(!response.ok)throw new Error(`Falha ao carregar ranking (${response.status})`);
  const rows=(await response.json()).filter(row=>{
    const name=String(row.nome||'');
    return !name.includes('::') && !name.startsWith('R|');
  });
  return dedupeRanking(rows);
};
renderRanking('homeRanking');