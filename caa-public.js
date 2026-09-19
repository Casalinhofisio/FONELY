(function(){
'use strict';
var KEY='fonely_caa_v1',token=new URLSearchParams(location.search).get('token')||'',state={category:'Todas',volumeOverride:null};
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{profiles:{}};}catch(e){return {profiles:{}};}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
function findProfile(d){var keys=Object.keys(d.profiles||{});for(var i=0;i<keys.length;i++){var p=d.profiles[keys[i]];if(p&&p.token===token)return p;}return null;}
function settings(p){var s=Object.assign({},p.published&&p.published.settings||p.settings||{});s.speakOnTap=true;s.addToPhrase=false;if(state.volumeOverride!=null)s.volume=state.volumeOverride;return s;}
function currentCard(card){var lib=window.FonelyCAALibrary&&window.FonelyCAALibrary.byId(card.id);if(!lib)return card;return Object.assign({},card,{label:lib.label,speech:lib.speech,category:lib.category,image:lib.image,color:lib.color});}
function logEvent(event){var d=load(),live=findProfile(d);if(!live)return;live.usage=live.usage||[];live.usage.push(Object.assign({at:new Date().toISOString()},event));if(live.usage.length>5000)live.usage=live.usage.slice(-5000);save(d);}
function unavailable(title,text){document.body.innerHTML='<main class="cp-status"><div><h1>'+esc(title)+'</h1><p>'+esc(text)+'</p></div></main>';}
function render(){
  var d=load(),p=findProfile(d);
  if(!token){unavailable('Link inválido','Este endereço não contém uma prancha do Fonely CAA.');return;}
  if(!p||!p.enabled||!p.published){unavailable('Prancha indisponível','Esta prancha ainda não foi publicada ou foi desativada pelo profissional.');return;}
  var snap=p.published,cards=(snap.cards||[]).map(currentCard),cats=['Todas'].concat(Array.from(new Set(cards.map(function(c){return c.category;})))),shown=state.category==='Todas'?cards:cards.filter(function(c){return c.category===state.category;}),baseVol=snap.settings&&snap.settings.volume;if(baseVol==null)baseVol=.9;var vol=Math.round((state.volumeOverride==null?baseVol:state.volumeOverride)*100),cols=Number((snap.settings||{}).columns||4);
  document.body.innerHTML='<main class="cp-shell"><header class="cp-top"><div><div class="cp-brand">Fonely <span>CAA</span></div><small>Toque em um cartão para falar</small></div><div class="cp-spacer"></div><label class="cp-volume"><span>Volume</span><input id="cpVolume" type="range" min="0" max="100" value="'+vol+'"></label></header><nav class="cp-cats">'+cats.map(function(c){return '<button class="cp-cat '+(c===state.category?'active':'')+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</nav><section class="cp-board" style="--cols:'+cols+'">'+shown.map(function(c){return '<button class="cp-card" data-card="'+esc(c.id)+'"><img src="'+esc(c.image)+'" alt=""><div class="cp-card-copy"><b>'+esc(c.label)+'</b><span>'+esc(c.speech||c.label)+'</span></div></button>';}).join('')+'</section><div id="cpSpoken" class="cp-spoken" aria-live="polite"></div></main>';
  bind(p,cards);
}
function bind(p,cards){
  document.body.onclick=function(e){
    var cardEl=e.target.closest('[data-card]');
    if(cardEl){
      var c=cards.find(function(x){return x.id===cardEl.getAttribute('data-card');});if(!c)return;
      cardEl.classList.add('active');setTimeout(function(){cardEl.classList.remove('active');},320);
      var spoken=document.getElementById('cpSpoken');if(spoken){spoken.textContent=c.speech||c.label;spoken.classList.add('show');setTimeout(function(){spoken.classList.remove('show');},1100);}
      if(window.FonelyCAASpeech)window.FonelyCAASpeech.speakCard(c,settings(p));
      logEvent({type:'card',cardId:c.id,label:c.label,speech:c.speech||c.label,category:c.category});return;
    }
    var cat=e.target.closest('[data-cat]');if(cat){state.category=cat.getAttribute('data-cat');render();return;}
  };
  var v=document.getElementById('cpVolume');if(v)v.oninput=function(){state.volumeOverride=Number(v.value)/100;};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();