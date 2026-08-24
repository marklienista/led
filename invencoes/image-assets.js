const INV_IMAGE_POS={
  q01:[0,0],q02:[1,0],q03:[2,0],q04:[3,0],q05:[4,0],
  q06:[0,1],q07:[1,1],q08:[2,1],q09:[3,1],q10:[4,1],
  q21:[0,2],q22:[1,2],q23:[2,2],q24:[3,2],q25:[4,2],
  q26:[0,3],q27:[1,3],q28:[2,3],q29:[3,3],q30:[4,3]
};

const INV_IMAGE_SPRITE='data:image/webp;base64,'+(window.INV_SPRITE_PARTS||[]).join('');
const INV_FALLBACK_VISUAL_SVG=visualSVG;

if(INV_IMAGE_SPRITE.length>100){
  document.documentElement.style.setProperty('--inv-image-sprite',`url("${INV_IMAGE_SPRITE}")`);
}

function escapeVisualLabel(text){
  return String(text||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderItemVisual(item){
  const pos=INV_IMAGE_POS[item.id];
  if(!pos||INV_IMAGE_SPRITE.length<=100)return INV_FALLBACK_VISUAL_SVG(item.visual);
  const x=pos[0]*25;
  const y=pos[1]*(100/3);
  return `<div class="item-photo" role="img" aria-label="${escapeVisualLabel(item.name)}" style="background-position:${x}% ${y}%"></div>`;
}

visualSVG=function(key){
  try{
    const item=session[index];
    if(item&&INV_IMAGE_POS[item.id])return renderItemVisual(item);
  }catch(e){}
  return INV_FALLBACK_VISUAL_SVG(key);
};
