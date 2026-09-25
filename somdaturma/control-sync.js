(()=>{
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init={})=>{
    const body=typeof init?.body==='string'?init.body:'';
    if(body.includes('CTRL|'))return Promise.resolve(new Response('',{status:204,statusText:'No Content'}));
    return nativeFetch(input,init);
  };

  const core=document.createElement('script');
  core.src='control-core.js?v=20260921-12';
  core.onload=()=>{
    const loadProfiles=()=>{
      const profiles=document.createElement('script');
      profiles.src='profiles.js?v=20260921-12';
      document.head.appendChild(profiles);
    };
    const microphone=document.createElement('script');
    microphone.src='microphone.js?v=20260925-1';
    microphone.onload=loadProfiles;
    microphone.onerror=()=>{
      console.warn('Não foi possível carregar o ajuste numérico do microfone. Recarregue a página.');
      loadProfiles();
    };
    document.head.appendChild(microphone);
  };
  document.head.appendChild(core);
})();
