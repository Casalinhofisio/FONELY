(function(){
'use strict';
var KEY='fonely_caa_v1',token=new URLSearchParams(location.search).get('token')||'',state={category:'Todas',phrase:[],volumeOverride:null};
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{profiles:{}};}catch(e){return {profiles:{}};}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
function findProfile(d){var keys=Object.keys(d.profiles||{});for(var i=0;i<keys.length;i++){var p=d.profiles[keys[i]];if(p&&p.token===token)return p;}return null;}
function settings(p){var s=Object.assign({},p.published&&p.published.settings||p.settings||{});if(state.volumeOverride!=null)s.volume=state.volumeOverride;return s;}
function logEvent(p,event){var d=load(),live=findProfile(d);if(!live)return;live.usage=live.usage||[];live.usage.push(Object.assign({at:new Date().toISOString()},event));if(live.usage.length>5000)live.usage=live.usage.slice(-5000);save(d);}
function unavailable(title,text){document.body.innerHTML='<main class="cp-status"><div><h1>'+esc(title)+'</h1><p>'+esc(text)+'</p></div></main>';}
function render(){
  var d=load(),p=findProfile(d);
  if(!token){unavailable('Link inválido','Este endereço não contém uma prancha do Fonely CAA.');return;}
  if(!p||!p.enabled||!p.published){unavailable('Prancha indisponível','Esta prancha ainda não foi publicada ou foi desativada pelo profissional.');return;}
  var snap=p.published,cards=snap.cards||[],cats=['Todas'].concat(Array.from(new Set(cards.map(function(c){return c.category;})))),shown=state.category==='Todas'?cards:cards.filter(function(c){return c.category===state.category;}),baseVol=(snap.settings&&snap.settings.volume);if(baseVol==null)baseVol=.9;var vol=Math.round((state.volumeOverride==null?baseVol:state.volumeOverride)*100);
  document.body.innerHTML='<main class="cp-shell"><header class="cp-top"><div class="cp-brand">Fonely <span>CAA</span></div><div class="cp-spacer"></div><label class="cp-volume"><span>Volume</span><input id="cpVolume" type="range" min="0" max="100" value="'+vol+'"></label></header><section class="cp-sentence"><div class="cp-words">'+(state.phrase.length?state.phrase.map(function(c){return '<span class="cp-chip">'+esc(c.label)+'</span>';}).join(''):'<span class="cp-hint">Toque nos cartões para montar uma frase</span>')+'</div><button class="cp-btn" data-back aria-label="Apagar último">⌫</button><button class="cp-btn" data-clear>Limpar</button><button class="cp-btn primary" data-speak>🔊 Falar</button></section><nav class="cp-cats">'+cats.map(function(c){return '<button class="cp-cat '+(c===state.category?'active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</nav><section class="cp-board" style="--cols:'+Number((snap.settings||{}).columns||4)+'">'+shown.map(function(c){return '<button class="cp-card" data-card="'+esc(c.id)+'" style="background:'+esc(c.color||'#fff')+'"><img src="'+esc(c.image)+'" alt=""><b>'+esc(c.label)+'</b></button>';}).join('')+'</section></main>';
  bind(p);
}
function bind(p){
  document.body.onclick=function(e){
    var cardEl=e.target.closest('[data-card]');
    if(cardEl){
      var c=(p.published.cards||[]).find(function(x){return x.id===cardEl.getAttribute('data-card');});if(!c)return;
      cardEl.classList.add('active');setTimeout(function(){cardEl.classList.remove('active');},120);
      var s=settings(p);if(s.addToPhrase!==false)state.phrase.push(c);if(s.speakOnTap!==false&&window.FonelyCAASpeech)window.FonelyCAASpeech.speakCard(c,s);
      logEvent(p,{type:'card',cardId:c.id,label:c.label,category:c.category});render();return;
    }
    var cat=e.target.closest('[data-cat]');if(cat){state.category=cat.getAttribute('data-cat');render();return;}
    if(e.target.closest('[data-back]')){state.phrase.pop();render();return;}
    if(e.target.closest('[data-clear]')){state.phrase=[];render();return;}
    if(e.target.closest('[data-speak]')){
      var text=state.phrase.map(function(c){return c.label;}).join(' ').trim();if(text&&window.FonelyCAASpeech)window.FonelyCAASpeech.speak(text,settings(p));if(text)logEvent(p,{type:'phrase',text:text,cards:state.phrase.map(function(c){return c.id;})});return;
    }
  };
  var v=document.getElementById('cpVolume');if(v)v.oninput=function(){state.volumeOverride=Number(v.value)/100;};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();