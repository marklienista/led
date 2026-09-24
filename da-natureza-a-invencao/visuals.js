const CHAIN_SPRITE='data:image/webp;base64,'+(window.CHAIN_SPRITE_PARTS||[]).join('');
const CHAIN_SPRITE_POS={
  tree:[0,0],bicycle:[1,0],rock:[2,0],pencil:[3,0],cloud:[4,0],
  umbrella:[0,1],butterfly:[1,1],clock:[2,1],river:[3,1],scissors:[4,1],
  bread:[0,2],honey:[1,2],notebook:[2,2],sand:[3,2],bottle:[4,2],
  cotton:[0,3],shirt:[1,3],cheese:[2,3],egg:[3,3],table:[4,3]
};
if(CHAIN_SPRITE.length>100){
  document.documentElement.style.setProperty('--sprite',`url("${CHAIN_SPRITE}")`);
}
function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}
function renderCardArt(card,cls=''){
  const pos=card&&card.visual?CHAIN_SPRITE_POS[card.visual]:null;
  if(pos&&CHAIN_SPRITE.length>100){
    const x=pos[0]*25;
    const y=pos[1]*(100/3);
    return `<div class="art sprite-art ${cls}" role="img" aria-label="${esc(card.label)}" style="background-position:${x}% ${y}%"></div>`;
  }
  return `<div class="art emoji-art ${cls}" role="img" aria-label="${esc(card&&card.label)}">${card&&card.emoji?card.emoji:'🔧'}</div>`;
}