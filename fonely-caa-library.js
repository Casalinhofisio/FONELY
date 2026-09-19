(function(){
'use strict';
function svg(body,bg,floor){
  bg=bg||'#fffaf6';floor=floor||'#f3ece7';
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 160" role="img">'+
  '<rect width="220" height="160" rx="24" fill="'+bg+'"/>'+
  '<path d="M0 118h220v42H0z" fill="'+floor+'"/>'+
  '<path d="M0 118h220" stroke="#e2d8d1" stroke-width="2"/>'+body+'</svg>';
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(s);
}
function P(x,y,shirt,skin,pose,scale){
  scale=scale||1; skin=skin||'#e3b39a'; shirt=shirt||'#9fc8d9';
  var arms='';
  if(pose==='up') arms='<path d="M-15 48L-27 25M15 48l20 2" />';
  else if(pose==='reach') arms='<path d="M-15 48l-19 10M15 48l29-7" />';
  else if(pose==='open') arms='<path d="M-15 48l-24 6M15 48l24 6" />';
  else if(pose==='stop') arms='<path d="M-15 48l-20 12M15 48l21-25" /><circle cx="38" cy="21" r="6" fill="'+skin+'"/>';
  else if(pose==='drink') arms='<path d="M-15 48l-17 10M15 48l18-18 8 9" />';
  else if(pose==='eat') arms='<path d="M-15 48l-17 10M15 48l20-16 10 4" />';
  else if(pose==='point') arms='<path d="M-15 48l-20 10M15 48l31-8" />';
  else arms='<path d="M-15 48l-19 16M15 48l19 16" />';
  return '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="#4a3730" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+
  '<circle cx="0" cy="18" r="15" fill="'+skin+'"/>'+
  '<path d="M-14 12q14-16 28 0" fill="#5c443b"/>'+
  '<rect x="-18" y="35" width="36" height="43" rx="14" fill="'+shirt+'"/>'+
  arms+'<path d="M-8 78l-7 30M8 78l7 30" />'+
  '</g>';
}
function speechBadge(x,y,textColor,bg,symbol){
  return '<g transform="translate('+x+' '+y+')"><rect x="0" y="0" width="40" height="30" rx="12" fill="'+bg+'" stroke="#4a3730" stroke-width="3"/><path d="M8 30l-4 9 12-7" fill="'+bg+'" stroke="#4a3730" stroke-width="3"/>'+symbol+'</g>';
}
var art={
  yes:svg(P(92,28,'#a9d6b5','#e2b399','open',.9)+speechBadge(145,25,'','#e4f4e8','<path d="M10 15l8 8 14-17" fill="none" stroke="#467957" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'),'#f8fcf8','#eef5ee'),
  no:svg(P(92,28,'#e8b2aa','#d9a589','stop',.9)+speechBadge(145,25,'','#f8e7e5','<path d="M11 8l18 14M29 8L11 22" fill="none" stroke="#a14d45" stroke-width="5" stroke-linecap="round"/>'),'#fff9f8','#f5eeee'),
  more:svg(P(86,30,'#adc9e8','#e3b49c','point',.88)+'<g transform="translate(135 69)"><ellipse cx="26" cy="18" rx="31" ry="14" fill="#fff" stroke="#4a3730" stroke-width="4"/><circle cx="10" cy="15" r="6" fill="#efb269"/><circle cx="26" cy="18" r="6" fill="#8bc2a1"/><circle cx="41" cy="14" r="6" fill="#ef8e82"/></g>'+speechBadge(155,25,'','#e7f1fb','<path d="M20 7v16M12 15h16" stroke="#527ca3" stroke-width="5" stroke-linecap="round"/>'),'#f7fbff','#edf3f8'),
  finished:svg(P(72,30,'#ddc9ae','#e3b49c','open',.88)+'<g transform="translate(123 71)"><ellipse cx="31" cy="18" rx="34" ry="15" fill="#fff" stroke="#4a3730" stroke-width="4"/><path d="M12 18h38" stroke="#c6b6ab" stroke-width="3"/></g>'+speechBadge(153,25,'','#f5e9e5','<path d="M11 15h18" stroke="#9a655a" stroke-width="5" stroke-linecap="round"/>'),'#fffaf7','#f4ede8'),
  help:svg(P(72,30,'#c9b7e8','#e0ad94','up',.88)+P(148,38,'#a7d4c1','#d19c82','reach',.78)+'<path d="M103 82c15-10 29-13 41-10" fill="none" stroke="#6d5a52" stroke-width="3" stroke-dasharray="4 5"/>','#fbf9ff','#f1edf8'),
  want:svg(P(72,30,'#f0c19b','#dfac91','reach',.88)+'<g transform="translate(132 72)"><rect x="0" y="0" width="50" height="32" rx="9" fill="#d5ebf7" stroke="#4a3730" stroke-width="4"/><circle cx="25" cy="16" r="7" fill="#77b6d7"/></g><path d="M111 71c11-10 20-11 28-8" fill="none" stroke="#c76d52" stroke-width="4" stroke-dasharray="5 5"/>','#fffaf7','#f5eee9'),
  dont:svg(P(73,30,'#e8b7aa','#dda88e','stop',.88)+'<g transform="translate(135 72)"><ellipse cx="25" cy="14" rx="28" ry="13" fill="#fff" stroke="#4a3730" stroke-width="4"/><circle cx="25" cy="14" r="7" fill="#f0b56f"/></g><path d="M126 62l52 41" stroke="#a84d45" stroke-width="6" stroke-linecap="round"/>','#fff9f8','#f5eeee'),
  water:svg(P(74,27,'#9ecfe7','#dfac92','drink',.9)+'<g transform="translate(126 54)"><path d="M4 20h30l-3 36H7z" fill="#d9f0fb" stroke="#4a3730" stroke-width="4"/><path d="M8 36h22" stroke="#77b7d8" stroke-width="8"/><rect x="39" y="12" width="18" height="46" rx="6" fill="#a9d7ee" stroke="#4a3730" stroke-width="4"/><path d="M43 8h10v8H43z" fill="#6faed0"/></g>','#f5fbff','#eaf4f8'),
  eat:svg(P(68,24,'#efc58f','#dfab90','eat',.88)+'<g transform="translate(111 75)"><rect x="0" y="25" width="76" height="8" rx="4" fill="#a97b61"/><ellipse cx="37" cy="16" rx="27" ry="11" fill="#fff" stroke="#4a3730" stroke-width="4"/><circle cx="27" cy="15" r="7" fill="#8fc3a4"/><circle cx="43" cy="14" r="7" fill="#efb66f"/><path d="M66 3v27M61 3v10M71 3v10" stroke="#4a3730" stroke-width="3" stroke-linecap="round"/></g>','#fffaf4','#f2e8da'),
  toilet:svg('<g transform="translate(23 30)"><rect x="0" y="0" width="62" height="65" rx="9" fill="#e9f5fa" stroke="#4a3730" stroke-width="4"/><rect x="10" y="10" width="42" height="22" rx="5" fill="#bfe2f1"/><path d="M9 47h43c0 20-9 31-22 31S10 67 9 47z" fill="#fff" stroke="#4a3730" stroke-width="4"/></g>'+P(145,35,'#b9d8c2','#dda88f','point',.8)+'<path d="M95 43h25" stroke="#86b6c9" stroke-width="4" stroke-dasharray="5 5"/>','#f8fcfd','#edf4f5'),
  sleep:svg('<g transform="translate(25 55)"><rect x="0" y="18" width="112" height="42" rx="8" fill="#e9d7c9" stroke="#4a3730" stroke-width="4"/><rect x="8" y="5" width="44" height="24" rx="10" fill="#fff7ef" stroke="#4a3730" stroke-width="4"/><circle cx="31" cy="20" r="10" fill="#dfad94"/><path d="M44 22h52" stroke="#9dbed1" stroke-width="18" stroke-linecap="round"/></g><path d="M157 42c10-10 22-9 29 1-12-2-20 3-24 13 2-7 0-11-5-14z" fill="#d8c8ef" stroke="#4a3730" stroke-width="3"/><path d="M170 66h16M176 78h13" stroke="#8d76b0" stroke-width="3" stroke-linecap="round"/>','#fbf9ff','#f0ebf3'),
  pain:svg(P(91,25,'#e8c0aa','#dfaa8f','open',.9)+'<circle cx="109" cy="79" r="16" fill="#f6bbb0" opacity=".9"/><path d="M106 64l7 11-8 6 9 13" fill="none" stroke="#b74c44" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M144 40c12 7 18 18 17 32" fill="none" stroke="#dc8076" stroke-width="4" stroke-dasharray="5 5"/>','#fff8f7','#f5ece9'),
  mom:svg(P(110,24,'#dcb4d8','#e3b29a','open',1)+'<path d="M94 36q16-22 32 0" fill="#704c3f" stroke="#4a3730" stroke-width="3"/><circle cx="80" cy="96" r="8" fill="#f2d3c3"/><circle cx="140" cy="96" r="8" fill="#f2d3c3"/>','#fff9fc','#f5edf3'),
  dad:svg(P(110,24,'#9fbfdf','#d7a187','open',1)+'<path d="M95 37q15-18 30 0" fill="#5a433a" stroke="#4a3730" stroke-width="3"/>','#f8fbff','#edf3f8'),
  family:svg(P(62,37,'#dcb4d8','#e3b29a','open',.72)+P(111,34,'#9fbfdf','#d7a187','open',.78)+P(156,55,'#f3c894','#e8b79f','open',.58)+'<path d="M44 112q68 18 129 0" fill="none" stroke="#d7b9a9" stroke-width="5" stroke-linecap="round"/>','#fffaf9','#f5ece7'),
  teacher:svg('<g transform="translate(20 23)"><rect x="0" y="0" width="96" height="67" rx="9" fill="#dcebd8" stroke="#4a3730" stroke-width="4"/><path d="M16 18h48M16 33h63M16 48h38" stroke="#6f946f" stroke-width="4" stroke-linecap="round"/></g>'+P(154,30,'#e9b9a2','#dda98f','point',.82)+'<path d="M125 67l20-9" stroke="#4a3730" stroke-width="4"/>','#f9fcf8','#eef5ec'),
  happy:svg(P(110,27,'#f2c56f','#e0ac92','open',.96)+'<path d="M101 45q9 9 18 0" fill="none" stroke="#4a3730" stroke-width="3" stroke-linecap="round"/><path d="M48 43l7-10M172 42l7-10M54 73H39M166 73h15" stroke="#efc34c" stroke-width="5" stroke-linecap="round"/>','#fffaf0','#f7edc9'),
  sad:svg(P(110,27,'#a9c9e7','#e0ac92','open',.96)+'<path d="M101 51q9-8 18 0" fill="none" stroke="#4a3730" stroke-width="3"/><path d="M128 46c7 8 4 17-2 18-7-2-8-10 2-18z" fill="#75b7df"/>','#f7fbff','#edf3f8'),
  angry:svg(P(110,27,'#e89f94','#dda88e','open',.96)+'<path d="M96 39l10 4M124 39l-10 4M100 54q10-7 20 0" fill="none" stroke="#4a3730" stroke-width="3" stroke-linecap="round"/><path d="M55 38l12 10M165 38l-12 10" stroke="#d56d62" stroke-width="5" stroke-linecap="round"/>','#fff8f7','#f5ece9'),
  afraid:svg(P(110,27,'#c8b8e6','#e0ac92','open',.96)+'<ellipse cx="104" cy="44" rx="3" ry="5" fill="#4a3730"/><ellipse cx="116" cy="44" rx="3" ry="5" fill="#4a3730"/><ellipse cx="110" cy="56" rx="5" ry="7" fill="#fff" stroke="#4a3730" stroke-width="2"/><path d="M56 46l-8-13M164 46l8-13" stroke="#8b76ac" stroke-width="4" stroke-linecap="round"/>','#faf9ff','#f1eef8'),
  tired:svg(P(110,27,'#cfc3b5','#e0ac92','open',.96)+'<path d="M98 44h9M113 44h9M102 55h16" stroke="#4a3730" stroke-width="3" stroke-linecap="round"/><path d="M153 29h14M158 18h17M166 7h14" stroke="#a88e7f" stroke-width="4" stroke-linecap="round"/>','#fcfaf7','#f1ece5'),
  play:svg(P(70,36,'#f0c17c','#dfab91','reach',.74)+'<g transform="translate(111 67)"><rect x="0" y="17" width="28" height="28" rx="5" fill="#f2c45f" stroke="#4a3730" stroke-width="4"/><circle cx="52" cy="31" r="17" fill="#9bd0bb" stroke="#4a3730" stroke-width="4"/><path d="M26 11l13-18 13 18z" fill="#c8b9e8" stroke="#4a3730" stroke-width="4"/></g>','#fffaf4','#f4eddf'),
  school:svg('<path d="M42 62l68-38 68 38-68 37z" fill="#c9dded" stroke="#4a3730" stroke-width="4"/><path d="M58 78v44h104V78M96 122V92h28v30" fill="#f8f3e8" stroke="#4a3730" stroke-width="4"/><rect x="72" y="87" width="16" height="17" fill="#9ec3dc"/><rect x="134" y="87" width="16" height="17" fill="#9ec3dc"/><path d="M173 45v26" stroke="#4a3730" stroke-width="4"/><path d="M173 45l20 9-20 8z" fill="#d87e72" stroke="#4a3730" stroke-width="3"/>','#f7fbff','#eaf1f4'),
  home:svg('<path d="M43 78l67-56 67 56" fill="#efc9b2" stroke="#4a3730" stroke-width="4"/><path d="M56 72v54h108V72" fill="#f6e2d3" stroke="#4a3730" stroke-width="4"/><rect x="96" y="91" width="28" height="35" rx="4" fill="#b58a73"/><rect x="69" y="86" width="20" height="20" fill="#bfe0ed" stroke="#4a3730" stroke-width="3"/><rect x="132" y="86" width="20" height="20" fill="#bfe0ed" stroke="#4a3730" stroke-width="3"/>','#fff9f5','#f3e9e1'),
  out:svg(P(73,33,'#aad0bd','#dfab91','point',.78)+'<g transform="translate(119 32)"><rect x="0" y="0" width="54" height="84" rx="7" fill="#eadfd8" stroke="#4a3730" stroke-width="4"/><rect x="12" y="14" width="30" height="56" rx="4" fill="#fbfaf8"/><circle cx="42" cy="42" r="3" fill="#4a3730"/></g><path d="M158 72h37M181 57l14 15-14 15" fill="none" stroke="#c76d52" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>','#fbfaf8','#f2ece7'),
  music:svg(P(70,38,'#c8b9e7','#dfab91','open',.72)+'<g transform="translate(124 31)" stroke="#4a3730" stroke-width="4" fill="none"><path d="M22 0v57c0 10-18 12-21 3-4-10 11-17 21-10M22 11l43-10v45c0 10-18 12-21 3-4-10 11-17 21-10"/></g><path d="M146 104q20 15 39 0" fill="none" stroke="#9d80bc" stroke-width="4" stroke-dasharray="4 5"/>','#faf8ff','#f0edf7'),
  ball:svg(P(68,41,'#a9cde2','#dfab91','reach',.7)+'<g transform="translate(130 70)"><circle cx="28" cy="28" r="27" fill="#f2d08c" stroke="#4a3730" stroke-width="4"/><path d="M28 1v54M1 28h54M9 9c12 12 26 12 38 0M9 47c12-12 26-12 38 0" fill="none" stroke="#4a3730" stroke-width="3"/></g>','#fffaf3','#f3ece0'),
  device:svg(P(70,39,'#a9d2c0','#dfab91','reach',.7)+'<g transform="translate(129 37)"><rect x="0" y="0" width="48" height="82" rx="9" fill="#dce7ec" stroke="#4a3730" stroke-width="4"/><rect x="7" y="10" width="34" height="54" rx="4" fill="#b8d9e7"/><circle cx="24" cy="73" r="3" fill="#4a3730"/></g>','#f8fbfc','#edf2f3'),
  bread:svg('<g transform="translate(37 47)"><path d="M0 34C0 11 25-2 48 8c23-10 49 3 49 26v45H0z" fill="#e8bd82" stroke="#4a3730" stroke-width="4"/><path d="M26 24l10 12M53 20l10 12" stroke="#fff0cf" stroke-width="6" stroke-linecap="round"/></g>'+P(160,46,'#b9d5c0','#dfa98f','point',.65),'#fffaf1','#f3e8d8'),
  rice:svg(P(68,42,'#a9cce2','#dfab91','point',.68)+'<g transform="translate(120 63)"><path d="M0 27h68c0 28-13 42-34 42S3 55 0 27z" fill="#f0d4b4" stroke="#4a3730" stroke-width="4"/><path d="M8 24c9-24 44-24 52 0" fill="#fff" stroke="#4a3730" stroke-width="4"/><path d="M18 16l5 4M31 11l4 5M44 14l5 4" stroke="#d9d0c8" stroke-width="3"/></g>','#fffaf7','#f2e9de'),
  beans:svg(P(68,42,'#d3b1a6','#dfab91','point',.68)+'<g transform="translate(119 62)"><ellipse cx="36" cy="35" rx="35" ry="23" fill="#fff" stroke="#4a3730" stroke-width="4"/><path d="M14 31c12-13 27-2 21 10-5 8-17 9-22 2-4-5-3-9 1-12zM41 22c12-10 25 2 18 12-5 8-16 8-20 2-4-5-3-10 2-14z" fill="#9b6551" stroke="#4a3730" stroke-width="3"/></g>','#fff8f5','#f0e5df'),
  fruit:svg(P(68,42,'#bdd3a6','#dfab91','point',.68)+'<g transform="translate(120 60)"><circle cx="24" cy="35" r="20" fill="#e78378" stroke="#4a3730" stroke-width="4"/><path d="M24 15c0-9 7-16 16-18M27 6c-7-6-14-5-18-1" fill="none" stroke="#4a3730" stroke-width="3"/><path d="M52 18c18 1 26 20 16 34-10 13-27 10-32-4 13-4 20-14 16-30z" fill="#f1c96d" stroke="#4a3730" stroke-width="4"/></g>','#fff9f2','#f3eadc'),
  milk:svg(P(68,42,'#b7cfea','#dfab91','point',.68)+'<g transform="translate(128 47)"><path d="M0 17h45l10 13v67H0z" fill="#f7fbfd" stroke="#4a3730" stroke-width="4"/><path d="M0 17L14 1h31v16M45 17v80" fill="none" stroke="#4a3730" stroke-width="4"/><path d="M10 48h26" stroke="#9ec8dc" stroke-width="9"/></g>','#f9fcfd','#edf3f5'),
  juice:svg(P(68,42,'#e8c08d','#dfab91','point',.68)+'<g transform="translate(127 50)"><path d="M0 20h50l-6 70H7z" fill="#f3c674" stroke="#4a3730" stroke-width="4"/><path d="M34 21L46 0M28 0h21" fill="none" stroke="#4a3730" stroke-width="4"/><circle cx="24" cy="54" r="11" fill="#f09a64"/></g>','#fffaf2','#f3e9da')
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