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
function normalized(settings){
  settings=settings||{};
  return {
    volume:Math.max(0,Math.min(1,Number(settings.volume==null?0.9:settings.volume))),
    rate:Math.max(0.5,Math.min(1.6,Number(settings.rate||0.95)))
  };
}
function speak(text,settings){
  if(!text)return Promise.resolve(false);
  if(!synth||typeof SpeechSynthesisUtterance==='undefined')return Promise.resolve(false);
  synth.cancel();
  var n=normalized(settings);
  return new Promise(function(resolve){
    var u=new SpeechSynthesisUtterance(text);
    var v=pick(settings||{});if(v)u.voice=v;
    u.lang=(v&&v.lang)||'pt-BR';
    u.volume=n.volume;u.rate=n.rate;u.pitch=1;
    u.onend=function(){resolve(true);};u.onerror=function(){resolve(false);};
    synth.speak(u);
  });
}
function playAudio(dataUrl,settings){
  if(!dataUrl)return Promise.resolve(false);
  var n=normalized(settings);
  return new Promise(function(resolve){
    var a=new Audio(dataUrl);a.volume=n.volume;
    a.onended=function(){resolve(true);};a.onerror=function(){resolve(false);};
    a.play().then(function(){}).catch(function(){resolve(false);});
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