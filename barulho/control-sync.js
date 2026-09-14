(()=>{
  const core=document.createElement('script');
  core.src='control-core.js';
  core.onload=()=>{
    const profiles=document.createElement('script');
    profiles.src='profiles.js';
    document.head.appendChild(profiles);
  };
  document.head.appendChild(core);
})();
