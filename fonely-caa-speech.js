(function(){
'use strict';
var synth=window.speechSynthesis;
var voices=[];
function refresh(){voices=synth?synth.getVoices().filter(function(v){return /^pt/i.test(v.lang)||!v.lang;}):[];return voices;}
if(synth){refresh();synth.onvoiceschanged=refresh;}
function pick(settings){
  refresh();
  if(!voices.length)return null;
  var name=settings&&settings.voiceName;
  return voices.find(function(v){return v.name===name;})||voices.find(function(v){return /^pt-BR/i.test(v.lang);})||voices[0];
}
function speak(text,settings){
  settings=settings||{};
  if(!text)return Promise.resolve(false);
  if(!synth||typeof SpeechSynthesisUtterance==='undefined')return Promise.resolve(false);
  synth.cancel();
  return new Promise(function(resolve){
    var u=new SpeechSynthesisUtterance(text);
    var v=pick(settings);if(v)u.voice=v;
    u.lang=(v&&v.lang)||'pt-BR';
    u.volume=Math.max(0,Math.min(1,Number(settings.volume==null?0.9:settings.volume)));
    u.rate=Math.max(.5,Math.min(1.6,Number(settings.rate||.95)));
    u.pitch=1;
    u.onend=function(){resolve(true);};
    u.onerror=function(){resolve(false);};
    synth.speak(u);
  });
}
function playAudio(dataUrl,settings){
  if(!dataUrl)return Promise.resolve(false);
  return new Promise(function(resolve){
    var a=new Audio(dataUrl);
    a.volume=Math.max(0,Math.min(1,Number(settings&&settings.volume==null?.9:settings.volume)));
    a.onended=function(){resolve(true);};
    a.onerror=function(){resolve(false);};
    a.play().catch(function(){resolve(false);});
  });
}
async function speakCard(card,settings){
  if(card&&card.audioData){
    var ok=await playAudio(card.audioData,settings||{});
    if(ok)return true;
  }
  return speak(card&&(card.speech||card.label),settings||{});
}
window.FonelyCAASpeech={
  refresh:refresh,
  voices:function(){return refresh().map(function(v){return {name:v.name,lang:v.lang,default:v.default};});},
  speak:speak,
  speakCard:speakCard,
  cancel:function(){if(synth)synth.cancel();}
};
})();