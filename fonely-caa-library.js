(function(){
'use strict';

function svg(body,bg,accent){
  bg=bg||'#fffaf6';accent=accent||'#f1ded4';
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160" role="img">'+
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+bg+'"/><stop offset="1" stop-color="'+accent+'"/></linearGradient></defs>'+
    '<rect width="220" height="160" rx="30" fill="url(#g)"/>'+
    '<circle cx="110" cy="78" r="58" fill="#fff" opacity=".78"/>'+
    body+
    '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(s);
}
function stroke(path,fill){
  return '<path d="'+path+'" fill="'+(fill||'none')+'" stroke="#49382f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
}
function face(mood,hair,shirt){
  var mouth=mood==='happy'
    ?'<path d="M88 88q22 24 44 0" fill="none" stroke="#49382f" stroke-width="7" stroke-linecap="round"/>'
    :mood==='sad'
      ?'<path d="M91 103q19-19 38 0" fill="none" stroke="#49382f" stroke-width="7" stroke-linecap="round"/>'
      :mood==='angry'
        ?'<path d="M91 103q19-15 38 0" fill="none" stroke="#49382f" stroke-width="7" stroke-linecap="round"/><path d="M86 71l15 5M134 71l-15 5" stroke="#49382f" stroke-width="6" stroke-linecap="round"/>'
        :mood==='afraid'
          ?'<ellipse cx="110" cy="98" rx="10" ry="14" fill="#fff" stroke="#49382f" stroke-width="6"/>'
          :mood==='tired'
            ?'<path d="M84 76h18M118 76h18M94 99h32" stroke="#49382f" stroke-width="6" stroke-linecap="round"/>'
            :'<path d="M98 96h24" stroke="#49382f" stroke-width="6" stroke-linecap="round"/>';
  return '<g>'+
    '<circle cx="110" cy="79" r="44" fill="#f2c6aa" stroke="#49382f" stroke-width="7"/>'+
    '<path d="M70 69q8-42 40-42t40 42q-20-20-39-18-19-4-41 18z" fill="'+(hair||'#6f5146')+'" stroke="#49382f" stroke-width="7" stroke-linejoin="round"/>'+
    '<circle cx="94" cy="79" r="4.5" fill="#49382f"/><circle cx="126" cy="79" r="4.5" fill="#49382f"/>'+mouth+
    '<path d="M59 153q4-42 51-42t51 42" fill="'+(shirt||'#d58c70')+'" stroke="#49382f" stroke-width="7"/>'+
  '</g>';
}
function person(kind){
  if(kind==='mom')return face('neutral','#6b473b','#d7a7c7');
  if(kind==='dad')return face('neutral','#4f4039','#9cb9d9');
  if(kind==='teacher')return face('happy','#704b3e','#ecc2a9');
  return face('neutral','#6b4a3e','#b8cbe5');
}
function familyIcon(){
  return '<g stroke="#49382f" stroke-width="6">'+
    '<circle cx="73" cy="66" r="25" fill="#f2c6aa"/><path d="M48 61q8-25 25-25t25 25" fill="#6b473b"/>'+
    '<circle cx="147" cy="66" r="25" fill="#e0ad91"/><path d="M122 61q8-24 25-24t25 24" fill="#4f4039"/>'+
    '<circle cx="110" cy="104" r="20" fill="#f3c9ad"/><path d="M90 99q7-19 20-19t20 19" fill="#8a614e"/>'+
    '<path d="M33 153q3-47 40-47t40 47M107 153q3-47 40-47t40 47M77 153q3-32 33-32t33 32" fill="none" stroke-linecap="round"/>'+
    '</g>';
}
function emotion(mood){return face(mood,'#6a4a3e',mood==='happy'?'#f3c45f':mood==='sad'?'#9fc0df':mood==='angry'?'#e79b8d':mood==='afraid'?'#bba8dc':'#c9bcae');}

var art={
  yes:svg('<circle cx="110" cy="80" r="46" fill="#dff1e4" stroke="#49382f" stroke-width="7"/>'+stroke('M84 80l18 18 35-42','#fff'),'#f7fcf8','#e5f3e8'),
  no:svg('<circle cx="110" cy="80" r="46" fill="#f8dfdb" stroke="#49382f" stroke-width="7"/>'+stroke('M88 58l44 44M132 58l-44 44'),'#fff8f7','#f4e2de'),
  more:svg('<circle cx="110" cy="80" r="46" fill="#e3eefb" stroke="#49382f" stroke-width="7"/>'+stroke('M110 51v58M81 80h58'),'#f6fbff','#e0ebf7'),
  finished:svg('<g><ellipse cx="110" cy="92" rx="57" ry="25" fill="#fff" stroke="#49382f" stroke-width="7"/><path d="M70 92h80" stroke="#c8b7ad" stroke-width="7" stroke-linecap="round"/><path d="M83 52h54" stroke="#49382f" stroke-width="7" stroke-linecap="round"/></g>','#fffaf7','#f2e6df'),
  help:svg('<g><circle cx="86" cy="72" r="29" fill="#f2c6aa" stroke="#49382f" stroke-width="7"/><path d="M58 140q4-43 31-43t31 43" fill="#b9a7dc" stroke="#49382f" stroke-width="7"/><path d="M118 94l24-18 13 16 17-30" fill="none" stroke="#49382f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="172" cy="55" r="8" fill="#d58c70"/></g>','#fbf8ff','#eee9f8'),
  want:svg('<g><path d="M69 101c17-21 34-28 52-20l29 12" fill="none" stroke="#49382f" stroke-width="12" stroke-linecap="round"/><rect x="119" y="45" width="55" height="55" rx="13" fill="#d9ecf6" stroke="#49382f" stroke-width="7"/><circle cx="147" cy="72" r="10" fill="#76b5d6"/></g>','#fffaf7','#f1e6dd'),
  dont:svg('<g><rect x="75" y="52" width="70" height="58" rx="14" fill="#fff" stroke="#49382f" stroke-width="7"/><circle cx="110" cy="81" r="15" fill="#f0b66f"/><path d="M64 45l92 74" stroke="#a85047" stroke-width="10" stroke-linecap="round"/></g>','#fff8f7','#f4e1df'),
  water:svg('<g><path d="M74 44h72l-8 78H82z" fill="#dff3fb" stroke="#49382f" stroke-width="7"/><path d="M82 83h56" stroke="#7fc0df" stroke-width="18"/><path d="M94 40h32" stroke="#49382f" stroke-width="7" stroke-linecap="round"/></g>','#f5fbff','#e4f1f8'),
  eat:svg('<g><ellipse cx="110" cy="91" rx="52" ry="28" fill="#fff" stroke="#49382f" stroke-width="7"/><circle cx="95" cy="90" r="11" fill="#8fc3a4"/><circle cx="121" cy="88" r="11" fill="#efb66f"/><path d="M61 48v75M52 48v22M70 48v22M159 48v75" stroke="#49382f" stroke-width="6" stroke-linecap="round"/></g>','#fffaf4','#f4ebd9'),
  toilet:svg('<g><rect x="72" y="39" width="76" height="38" rx="10" fill="#d9edf6" stroke="#49382f" stroke-width="7"/><path d="M76 83h68c0 30-11 49-34 49S80 113 76 83z" fill="#fff" stroke="#49382f" stroke-width="7"/></g>','#f7fcfd','#e5f2f5'),
  sleep:svg('<g><path d="M48 100h124v30H48z" fill="#d8c7b7" stroke="#49382f" stroke-width="7"/><rect x="54" y="74" width="49" height="27" rx="13" fill="#fff" stroke="#49382f" stroke-width="7"/><path d="M104 99h57" stroke="#9cbcd0" stroke-width="22" stroke-linecap="round"/><path d="M154 45c14-17 31-15 39 0-16-3-26 4-30 19 1-8-2-14-9-19z" fill="#c9b7e5" stroke="#49382f" stroke-width="6"/></g>','#fbf9ff','#eee9f5'),
  pain:svg('<g><path d="M76 59c20-23 48-23 68 0 20 23 14 57-34 76-48-19-54-53-34-76z" fill="#f4b9ae" stroke="#49382f" stroke-width="7"/><path d="M111 52l-12 29 20 9-15 31" fill="none" stroke="#b64943" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>','#fff8f7','#f5e7e3'),
  mom:svg(person('mom'),'#fff8fc','#f2e6ef'),
  dad:svg(person('dad'),'#f7fbff','#e3edf7'),
  family:svg(familyIcon(),'#fffaf9','#f4e8e1'),
  teacher:svg(person('teacher')+'<path d="M34 43h54v42H34z" fill="#deecd7" stroke="#49382f" stroke-width="6"/><path d="M44 56h34M44 68h26" stroke="#71956e" stroke-width="5" stroke-linecap="round"/>','#f9fcf8','#e8f1e5'),
  happy:svg(emotion('happy'),'#fffaf0','#f7edc9'),
  sad:svg(emotion('sad'),'#f7fbff','#e6eff8'),
  angry:svg(emotion('angry'),'#fff8f7','#f4e3e0'),
  afraid:svg(emotion('afraid'),'#faf8ff','#eee9f8'),
  tired:svg(emotion('tired'),'#fcfaf7','#efe9e1'),
  play:svg('<g><rect x="55" y="80" width="42" height="42" rx="8" fill="#f2c45f" stroke="#49382f" stroke-width="7"/><circle cx="145" cy="100" r="27" fill="#9bd0bb" stroke="#49382f" stroke-width="7"/><path d="M102 74l24-35 24 35z" fill="#c8b9e8" stroke="#49382f" stroke-width="7"/></g>','#fffaf4','#f2eadc'),
  school:svg('<g><path d="M46 76l64-40 64 40-64 35z" fill="#c9dded" stroke="#49382f" stroke-width="7"/><path d="M62 90v42h96V90M95 132v-29h30v29" fill="#f8f3e8" stroke="#49382f" stroke-width="7"/></g>','#f7fbff','#e7f0f5'),
  home:svg('<g><path d="M50 83l60-52 60 52" fill="#efc9b2" stroke="#49382f" stroke-width="7"/><path d="M65 78v53h90V78" fill="#f6e2d3" stroke="#49382f" stroke-width="7"/><rect x="96" y="98" width="28" height="33" rx="5" fill="#b48a72"/></g>','#fff9f5','#f3e7df'),
  out:svg('<g><rect x="68" y="37" width="70" height="91" rx="10" fill="#efe5df" stroke="#49382f" stroke-width="7"/><path d="M93 82h91M163 62l21 20-21 20" fill="none" stroke="#c76d52" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>','#fbfaf8','#f0e9e4'),
  music:svg('<g><path d="M91 43v62c0 17-31 20-35 5-5-17 20-27 35-13M91 58l64-15v50c0 17-31 20-35 5-5-17 20-27 35-13" fill="none" stroke="#49382f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g>','#faf8ff','#eee9f7'),
  ball:svg('<g><circle cx="110" cy="82" r="50" fill="#f2d08c" stroke="#49382f" stroke-width="7"/><path d="M110 32v100M60 82h100M75 46c22 24 48 24 70 0M75 118c22-24 48-24 70 0" fill="none" stroke="#49382f" stroke-width="6"/></g>','#fffaf3','#f3e9d8'),
  device:svg('<g><rect x="78" y="29" width="64" height="105" rx="15" fill="#dce7ec" stroke="#49382f" stroke-width="7"/><rect x="87" y="42" width="46" height="69" rx="6" fill="#b8d9e7"/><circle cx="110" cy="123" r="5" fill="#49382f"/></g>','#f8fbfc','#e8f0f3'),
  bread:svg('<g><path d="M61 102V70c0-28 22-45 49-34 27-11 49 6 49 34v32z" fill="#e8bd82" stroke="#49382f" stroke-width="7"/><path d="M87 57l13 15M116 53l13 15" stroke="#fff0cf" stroke-width="8" stroke-linecap="round"/></g>','#fffaf1','#f2e7d5'),
  rice:svg('<g><path d="M61 88h98c0 34-18 51-49 51S65 122 61 88z" fill="#efd2b3" stroke="#49382f" stroke-width="7"/><path d="M72 84c12-35 65-35 76 0" fill="#fff" stroke="#49382f" stroke-width="7"/><path d="M91 72l6 6M108 66l5 7M127 72l6 6" stroke="#d6cdc4" stroke-width="5" stroke-linecap="round"/></g>','#fffaf7','#f2e8dc'),
  beans:svg('<g><ellipse cx="110" cy="95" rx="55" ry="34" fill="#fff" stroke="#49382f" stroke-width="7"/><path d="M80 90c15-18 35-3 27 12-7 12-24 12-30 3-5-7-4-11 3-15zM119 74c16-14 34 3 24 16-7 11-22 11-27 2-4-6-3-12 3-18z" fill="#9b6551" stroke="#49382f" stroke-width="5"/></g>','#fff8f5','#f0e4dc'),
  fruit:svg('<g><circle cx="88" cy="94" r="32" fill="#e78378" stroke="#49382f" stroke-width="7"/><path d="M88 62c0-13 11-24 24-26M92 51c-11-9-20-7-27-1" fill="none" stroke="#49382f" stroke-width="6" stroke-linecap="round"/><path d="M140 57c27 2 39 29 25 50-14 19-39 14-48-6 19-7 29-21 23-44z" fill="#f1c96d" stroke="#49382f" stroke-width="7"/></g>','#fff9f2','#f4ead8'),
  milk:svg('<g><path d="M78 55h65l12 17v65H78z" fill="#f7fbfd" stroke="#49382f" stroke-width="7"/><path d="M78 55l18-22h47v22M143 55v82" fill="none" stroke="#49382f" stroke-width="7"/><path d="M91 92h36" stroke="#9ec8dc" stroke-width="12"/></g>','#f9fcfd','#e8f1f5'),
  juice:svg('<g><path d="M76 61h68l-8 71H84z" fill="#f3c674" stroke="#49382f" stroke-width="7"/><path d="M124 63l16-31M115 32h31" fill="none" stroke="#49382f" stroke-width="7" stroke-linecap="round"/><circle cx="110" cy="95" r="16" fill="#f09a64"/></g>','#fffaf2','#f3e8d6')
};

var C={core:'#fffdfa',needs:'#f9fdff',people:'#fffafd',emotions:'#fffcf4',activities:'#fbfdf9',food:'#fffaf4'};
var cards=[
{id:'yes',label:'Sim',speech:'Sim',category:'Respostas',image:art.yes,color:C.core},
{id:'no',label:'Não',speech:'Não',category:'Respostas',image:art.no,color:C.core},
{id:'more',label:'Mais',speech:'Quero mais',category:'Respostas',image:art.more,color:C.core},
{id:'finished',label:'Acabou',speech:'Acabou',category:'Respostas',image:art.finished,color:C.core},
{id:'help',label:'Ajuda',speech:'Preciso de ajuda',category:'Respostas',image:art.help,color:C.core},
{id:'want',label:'Quero',speech:'Quero',category:'Ações',image:art.want,color:C.core},
{id:'dont-want',label:'Não quero',speech:'Não quero',category:'Ações',image:art.dont,color:C.core},
{id:'water',label:'Água',speech:'Quero água',category:'Necessidades',image:art.water,color:C.needs},
{id:'eat',label:'Comer',speech:'Quero comer',category:'Necessidades',image:art.eat,color:C.needs},
{id:'toilet',label:'Banheiro',speech:'Quero ir ao banheiro',category:'Necessidades',image:art.toilet,color:C.needs},
{id:'sleep',label:'Dormir',speech:'Quero dormir',category:'Necessidades',image:art.sleep,color:C.needs},
{id:'pain',label:'Dor',speech:'Estou com dor',category:'Necessidades',image:art.pain,color:C.needs},
{id:'mom',label:'Mamãe',speech:'Quero a mamãe',category:'Pessoas',image:art.mom,color:C.people},
{id:'dad',label:'Papai',speech:'Quero o papai',category:'Pessoas',image:art.dad,color:C.people},
{id:'family',label:'Família',speech:'Quero minha família',category:'Pessoas',image:art.family,color:C.people},
{id:'teacher',label:'Professora',speech:'Quero a professora',category:'Pessoas',image:art.teacher,color:C.people},
{id:'happy',label:'Feliz',speech:'Estou feliz',category:'Emoções',image:art.happy,color:C.emotions},
{id:'sad',label:'Triste',speech:'Estou triste',category:'Emoções',image:art.sad,color:C.emotions},
{id:'angry',label:'Bravo',speech:'Estou bravo',category:'Emoções',image:art.angry,color:C.emotions},
{id:'afraid',label:'Medo',speech:'Estou com medo',category:'Emoções',image:art.afraid,color:C.emotions},
{id:'tired',label:'Cansado',speech:'Estou cansado',category:'Emoções',image:art.tired,color:C.emotions},
{id:'play',label:'Brincar',speech:'Quero brincar',category:'Atividades',image:art.play,color:C.activities},
{id:'school',label:'Escola',speech:'Quero ir para a escola',category:'Lugares',image:art.school,color:C.activities},
{id:'home',label:'Casa',speech:'Quero ir para casa',category:'Lugares',image:art.home,color:C.activities},
{id:'go-out',label:'Sair',speech:'Quero sair',category:'Atividades',image:art.out,color:C.activities},
{id:'music',label:'Música',speech:'Quero ouvir música',category:'Atividades',image:art.music,color:C.activities},
{id:'ball',label:'Bola',speech:'Quero brincar com a bola',category:'Atividades',image:art.ball,color:C.activities},
{id:'phone',label:'Celular',speech:'Quero o celular',category:'Objetos',image:art.device,color:C.activities},
{id:'bread',label:'Pão',speech:'Quero pão',category:'Alimentação',image:art.bread,color:C.food},
{id:'rice',label:'Arroz',speech:'Quero arroz',category:'Alimentação',image:art.rice,color:C.food},
{id:'beans',label:'Feijão',speech:'Quero feijão',category:'Alimentação',image:art.beans,color:C.food},
{id:'fruit',label:'Fruta',speech:'Quero fruta',category:'Alimentação',image:art.fruit,color:C.food},
{id:'milk',label:'Leite',speech:'Quero leite',category:'Bebidas',image:art.milk,color:C.food},
{id:'juice',label:'Suco',speech:'Quero suco',category:'Bebidas',image:art.juice,color:C.food}
];
window.FonelyCAALibrary={
  cards:cards,
  categories:['Respostas','Ações','Necessidades','Pessoas','Emoções','Atividades','Lugares','Objetos','Alimentação','Bebidas'],
  byId:function(id){return cards.find(function(c){return c.id===id;})||null;},
  iconForCustom:function(){return art.want;}
};
})();