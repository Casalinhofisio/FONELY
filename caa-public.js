(function(){
'use strict';
var API='https://apjmkstuffzgfhgcxhvt.supabase.co/functions/v1/caa-public-board';
var token=new URLSearchParams(location.search).get('token')||'';
var CACHE_KEY='fonely_caa_offline_'+token;
var USAGE_KEY='fonely_caa_usage_'+token;
var state={category:'Todas',volumeOverride:null,board:null,offline:false,installPrompt:null};

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function cached(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'null');}catch(e){return null;}}
function cacheBoard(board){try{localStorage.setItem(CACHE_KEY,JSON.stringify(board));}catch(e){}}
function cacheAACImages(board){
  try{
    var cards=board&&board.snapshot&&board.snapshot.cards||[];
    if(!('caches' in window)||!cards.length)return;
    caches.open('fonely-caa-images-v1').then(function(cache){
      cards.forEach(function(c){
        var url=String(c&&c.image||'');
        if(!/^https:\/\//i.test(url))return;
        cache.match(url).then(function(hit){
          if(hit)return;
          fetch(url,{mode:'no-cors',cache:'force-cache'}).then(function(resp){cache.put(url,resp).catch(function(){});}).catch(function(){});
        });
      });
    }).catch(function(){});
  }catch(e){}
}
function logEvent(event){try{var a=JSON.parse(localStorage.getItem(USAGE_KEY)||'[]');a.push(Object.assign({at:new Date().toISOString()},event));if(a.length>2000)a=a.slice(-2000);localStorage.setItem(USAGE_KEY,JSON.stringify(a));}catch(e){}}
function settings(snap){var s=Object.assign({},snap&&snap.settings||{});s.speakOnTap=true;s.addToPhrase=false;if(state.volumeOverride!=null)s.volume=state.volumeOverride;return s;}
function unavailable(title,text){document.body.innerHTML='<main class="cp-status"><div><h1>'+esc(title)+'</h1><p>'+esc(text)+'</p></div></main>';}
function networkBadge(){return '<div class="cp-network '+(state.offline?'offline':'online')+'">'+(state.offline?'Disponível offline':'Sincronizado')+'</div>';}
function isStandalone(){return window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent);}
function installButton(){
  if(isStandalone())return '';
  return '<button class="cp-install" data-install-caa>Adicionar à tela inicial</button>';
}
function showIOSInstall(){
  var old=document.getElementById('cpInstallHelp');if(old)old.remove();
  var d=document.createElement('div');d.id='cpInstallHelp';d.className='cp-install-help';
  d.innerHTML='<div><button data-install-close>×</button><b>Colocar o Fonely CAA na Tela de Início</b><p>No iPhone/iPad: toque em <strong>Compartilhar</strong> no Safari e depois em <strong>Adicionar à Tela de Início</strong>.</p><small>Depois é só tocar no ícone Fonely CAA, como um aplicativo. A prancha já carregada continua disponível offline.</small></div>';
  document.body.appendChild(d);d.onclick=function(e){if(e.target.closest('[data-install-close]')||e.target===d)d.remove();};
}
async function installCAA(){
  if(state.installPrompt){state.installPrompt.prompt();try{await state.installPrompt.userChoice;}catch(e){}state.installPrompt=null;return;}
  if(isIOS()){showIOSInstall();return;}
  alert('No menu do navegador, escolha “Adicionar à tela inicial” ou “Instalar app”.');
}

async function fetchBoard(){
  if(!token)throw new Error('Link inválido');
  var ctrl=new AbortController(),timer=setTimeout(function(){ctrl.abort();},8000);
  try{
    var r=await fetch(API+'?token='+encodeURIComponent(token),{cache:'no-store',signal:ctrl.signal});
    var d=await r.json().catch(function(){return {};});
    if(!r.ok||!d.board)throw new Error(d.error||'Prancha indisponível');
    cacheBoard(d.board);
    cacheAACImages(d.board);
    state.board=d.board;state.offline=false;
    return d.board;
  }finally{clearTimeout(timer);}
}
function render(){
  var board=state.board,snap=board&&board.snapshot;
  if(!token){unavailable('Link inválido','Este endereço não contém uma prancha do Fonely CAA.');return;}
  if(!board||!board.enabled||!snap){unavailable('Prancha indisponível','Abra este link uma vez com internet para preparar o uso offline.');return;}
  var cards=(snap.cards||[]).map(function(c){
    if(Number(snap.visualVersion||0)>=4||c.fonelyCustomized||c.custom)return c;
    var fresh=window.FonelyCAALibrary&&window.FonelyCAALibrary.byId(c.id);
    return fresh?Object.assign({},c,{image:fresh.image,color:fresh.color}):c;
  }),cats=['Todas'].concat(Array.from(new Set(cards.map(function(c){return c.category;})))),shown=state.category==='Todas'?cards:cards.filter(function(c){return c.category===state.category;}),baseVol=snap.settings&&snap.settings.volume;if(baseVol==null)baseVol=.9;var vol=Math.round((state.volumeOverride==null?baseVol:state.volumeOverride)*100),cols=Number((snap.settings||{}).columns||4);
  document.body.innerHTML='<main class="cp-shell"><header class="cp-top"><div><div class="cp-brand">Fonely <span>CAA</span></div><small>Toque em um cartão para falar</small></div><div class="cp-spacer"></div>'+installButton()+networkBadge()+'<label class="cp-volume"><span>Volume</span><input id="cpVolume" type="range" min="0" max="100" value="'+vol+'"></label></header><nav class="cp-cats">'+cats.map(function(c){return '<button class="cp-cat '+(c===state.category?'active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</nav><section class="cp-board" style="--cols:'+cols+'">'+shown.map(function(c){return '<button class="cp-card" data-card="'+esc(c.id)+'"><img src="'+esc(c.image)+'" alt=""><div class="cp-card-copy"><b>'+esc(c.label)+'</b><span>'+esc(c.speech||c.label)+'</span></div></button>';}).join('')+'</section><footer class="cp-symbol-credit">Pictogramas padrão: <a href="https://mulberrysymbols.org/" target="_blank" rel="noopener">Mulberry Symbols</a> · CC BY-SA 4.0</footer><div id="cpSpoken" class="cp-spoken" aria-live="polite"></div></main>';
  bind(cards,snap);
}
function bind(cards,snap){
  document.body.onclick=function(e){
    if(e.target.closest('[data-install-caa]')){installCAA();return;}
    var cardEl=e.target.closest('[data-card]');
    if(cardEl){
      var c=cards.find(function(x){return x.id===cardEl.getAttribute('data-card');});if(!c)return;
      cardEl.classList.add('active');setTimeout(function(){cardEl.classList.remove('active');},320);
      var spoken=document.getElementById('cpSpoken');if(spoken){spoken.textContent=c.speech||c.label;spoken.classList.add('show');setTimeout(function(){spoken.classList.remove('show');},1100);}
      if(window.FonelyCAASpeech)window.FonelyCAASpeech.speakCard(c,settings(snap));
      logEvent({type:'card',cardId:c.id,label:c.label,speech:c.speech||c.label,category:c.category,offline:!navigator.onLine});return;
    }
    var cat=e.target.closest('[data-cat]');if(cat){state.category=cat.getAttribute('data-cat');render();return;}
  };
  var v=document.getElementById('cpVolume');if(v)v.oninput=function(){state.volumeOverride=Number(v.value)/100;};
}
async function sync(){
  try{await fetchBoard();render();}
  catch(e){var c=cached();if(c){state.board=c;state.offline=true;render();}else unavailable('Primeiro acesso precisa de internet','Abra este link uma vez conectado à internet. Depois a prancha ficará disponível offline neste aparelho.');}
}
function registerOffline(){
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./caa-sw.js',{scope:'./'}).catch(function(){});
}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();state.installPrompt=e;});
window.addEventListener('appinstalled',function(){state.installPrompt=null;});
window.addEventListener('online',function(){sync();});
window.addEventListener('offline',function(){state.offline=true;if(state.board)render();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){registerOffline();sync();});else{registerOffline();sync();}
})();