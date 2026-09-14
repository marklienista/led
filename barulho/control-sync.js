(()=>{
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const body=typeof init?.body==='string'?init.body:'';
    if(body.includes('CTRL|'))return Promise.resolve(new Response('',{status:204,statusText:'No Content'}));
    return nativeFetch(input,init);
  };

  const core=document.createElement('script');
  core.src='control-core.js';
  core.onload=()=>{
    const profiles=document.createElement('script');
    profiles.src='profiles.js';
    document.head.appendChild(profiles);
  };
  document.head.appendChild(core);
})();
