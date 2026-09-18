(function(){
'use strict';
function svg(body,bg){
  var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="26" fill="'+(bg||'#fff7f2')+'"/>'+body+'</svg>';
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(s);
}
var stroke='stroke="#4a312b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
var icons={
 check:svg('<circle cx="60" cy="60" r="34" fill="#e8f4e7"/><path d="M42 61l12 12 25-29" '+stroke+'/>','#f6fbf5'),
 no:svg('<circle cx="60" cy="60" r="34" fill="#f8e7e4"/><path d="M45 45l30 30M75 45L45 75" '+stroke+'/>','#fff8f7'),
 plus:svg('<circle cx="60" cy="60" r="34" fill="#e9f1f8"/><path d="M60 41v38M41 60h38" '+stroke+'/>','#f7fbff'),
 stop:svg('<rect x="34" y="34" width="52" height="52" rx="13" fill="#f7dfd8"/><path d="M45 60h30" '+stroke+'/>'),
 help:svg('<circle cx="60" cy="60" r="35" fill="#ece7f7"/><path d="M50 49c2-10 22-12 24 0 2 10-11 11-11 20M62 82h.1" '+stroke+'/>','#faf8ff'),
 want:svg('<path d="M36 73c10-8 14-25 20-26 7-1 8 8 5 16 8-9 13-13 18-9 6 5 0 14-7 22-7 9-13 13-22 12-9-1-17-6-22-12z" fill="#f4d6cb" stroke="#4a312b" stroke-width="5" stroke-linejoin="round"/>'),
 dont:svg('<path d="M36 73c10-8 14-25 20-26 7-1 8 8 5 16 8-9 13-13 18-9 6 5 0 14-7 22-7 9-13 13-22 12-9-1-17-6-22-12z" fill="#f4d6cb" stroke="#4a312b" stroke-width="5"/><path d="M31 31l58 58" '+stroke+'/>','#fff8f7'),
 water:svg('<path d="M60 24c15 22 27 36 27 52a27 27 0 0 1-54 0c0-16 12-30 27-52z" fill="#bfe0f4" stroke="#4a312b" stroke-width="5"/><path d="M46 78c3 8 9 12 17 12" '+stroke+'/>','#f5fbff'),
 eat:svg('<ellipse cx="60" cy="69" rx="34" ry="20" fill="#f7e0b8" stroke="#4a312b" stroke-width="5"/><path d="M34 59c14 10 38 10 52 0M27 39v30M21 39v15M33 39v15M95 38c-8 11-8 22 0 31V38z" '+stroke+'/>','#fffaf1'),
 toilet:svg('<path d="M38 27h30v28H38z" fill="#e9f3f7" stroke="#4a312b" stroke-width="5"/><path d="M35 57h48c0 23-8 33-24 33S38 80 35 57z" fill="#f6fbfd" stroke="#4a312b" stroke-width="5"/><path d="M55 90h20" '+stroke+'/>','#f8fcfd'),
 bed:svg('<path d="M24 72h73v18M28 72V46h31c13 0 21 7 21 18v8M24 90v8M97 90v8" '+stroke+'/><rect x="32" y="51" width="22" height="14" rx="7" fill="#f1dccf"/>','#fff9f6'),
 pain:svg('<path d="M65 20L43 60h18l-7 40 26-50H61z" fill="#f4b6ad" stroke="#4a312b" stroke-width="5" stroke-linejoin="round"/>','#fff7f6'),
 person:svg('<circle cx="60" cy="39" r="17" fill="#f3cdbb" stroke="#4a312b" stroke-width="5"/><path d="M29 94c4-22 17-33 31-33s27 11 31 33" fill="#e9d8f2" stroke="#4a312b" stroke-width="5"/>'),
 man:svg('<circle cx="60" cy="39" r="17" fill="#d9b19c" stroke="#4a312b" stroke-width="5"/><path d="M29 94c4-22 17-33 31-33s27 11 31 33" fill="#bed8eb" stroke="#4a312b" stroke-width="5"/>','#f8fbfd'),
 family:svg('<circle cx="38" cy="43" r="12" fill="#f3cdbb" stroke="#4a312b" stroke-width="4"/><circle cx="78" cy="43" r="12" fill="#d9b19c" stroke="#4a312b" stroke-width="4"/><circle cx="59" cy="62" r="10" fill="#f1c6b3" stroke="#4a312b" stroke-width="4"/><path d="M20 94c2-17 10-27 18-27 7 0 11 5 14 12M100 94c-2-17-10-27-18-27-7 0-11 5-14 12M43 96c2-16 8-24 16-24s14 8 17 24" '+stroke+'/>','#fff9f5'),
 teacher:svg('<rect x="26" y="26" width="68" height="48" rx="8" fill="#dcebd8" stroke="#4a312b" stroke-width="5"/><circle cx="47" cy="81" r="10" fill="#f3cdbb" stroke="#4a312b" stroke-width="4"/><path d="M47 92v8M59 80l22-18M39 41h28M39 52h36" '+stroke+'/>','#f9fcf8'),
 happy:svg('<circle cx="60" cy="60" r="37" fill="#ffe39c" stroke="#4a312b" stroke-width="5"/><circle cx="47" cy="52" r="3" fill="#4a312b"/><circle cx="73" cy="52" r="3" fill="#4a312b"/><path d="M44 68c8 13 24 13 32 0" '+stroke+'/>','#fffaf0'),
 sad:svg('<circle cx="60" cy="60" r="37" fill="#dceaf6" stroke="#4a312b" stroke-width="5"/><circle cx="47" cy="52" r="3" fill="#4a312b"/><circle cx="73" cy="52" r="3" fill="#4a312b"/><path d="M45 77c8-11 22-11 30 0" '+stroke+'/><path d="M79 61c8 8 5 17-2 18-7-1-9-10 2-18z" fill="#82bce4"/>','#f7fbff'),
 angry:svg('<circle cx="60" cy="60" r="37" fill="#f3b6aa" stroke="#4a312b" stroke-width="5"/><path d="M41 48l14 5M79 48l-14 5M46 76c8-7 20-7 28 0" '+stroke+'/>','#fff7f6'),
 scared:svg('<circle cx="60" cy="60" r="37" fill="#e4ddf2" stroke="#4a312b" stroke-width="5"/><circle cx="47" cy="51" r="5" fill="#4a312b"/><circle cx="73" cy="51" r="5" fill="#4a312b"/><ellipse cx="60" cy="74" rx="8" ry="11" fill="#fff" stroke="#4a312b" stroke-width="4"/>','#faf9ff'),
 tired:svg('<circle cx="60" cy="60" r="37" fill="#ebe2d6" stroke="#4a312b" stroke-width="5"/><path d="M40 53h15M65 53h15M48 75h24" '+stroke+'/><path d="M82 27l7-7M91 38l10-2" '+stroke+'/>','#fcfaf7'),
 play:svg('<rect x="29" y="56" width="27" height="27" rx="5" fill="#f6c66f" stroke="#4a312b" stroke-width="5"/><circle cx="74" cy="72" r="16" fill="#a8d6c1" stroke="#4a312b" stroke-width="5"/><path d="M58 45l12-20 12 20z" fill="#d7c5ef" stroke="#4a312b" stroke-width="5"/>','#fffaf4'),
 school:svg('<path d="M24 49l36-22 36 22-36 22z" fill="#d9e7f3" stroke="#4a312b" stroke-width="5"/><path d="M34 65v28h52V65M52 93V76h16v17" '+stroke+'/>','#f7fbff'),
 house:svg('<path d="M22 58l38-33 38 33" '+stroke+'/><path d="M31 54v42h58V54M52 96V72h16v24" fill="#f3dfcf" stroke="#4a312b" stroke-width="5"/>','#fff9f4'),
 out:svg('<rect x="27" y="29" width="42" height="62" rx="5" fill="#e8dfd7" stroke="#4a312b" stroke-width="5"/><path d="M53 60h44M82 45l15 15-15 15" '+stroke+'/>','#fbfaf8'),
 music:svg('<path d="M51 30v47c0 10-19 13-23 3-4-11 12-18 23-11M51 40l35-10v41c0 10-18 13-22 3-4-11 11-18 22-11" '+stroke+'/>','#faf7ff'),
 ball:svg('<circle cx="60" cy="60" r="36" fill="#f7e8c7" stroke="#4a312b" stroke-width="5"/><path d="M60 24v72M24 60h72M35 35c15 15 35 15 50 0M35 85c15-15 35-15 50 0" '+stroke+'/>','#fffaf2'),
 device:svg('<rect x="37" y="21" width="46" height="78" rx="9" fill="#dbe6ea" stroke="#4a312b" stroke-width="5"/><path d="M52 89h16" '+stroke+'/>','#f8fbfc'),
 bread:svg('<path d="M27 55c0-20 18-31 33-23 15-8 34 3 34 23v33H27z" fill="#e8c18a" stroke="#4a312b" stroke-width="5"/><path d="M48 46l7 8M69 43l8 9" '+stroke+'/>','#fffaf1'),
 rice:svg('<path d="M31 65h58c0 18-11 29-29 29S31 83 31 65z" fill="#f3d4b3" stroke="#4a312b" stroke-width="5"/><path d="M40 62c6-16 34-16 40 0" fill="#fff" stroke="#4a312b" stroke-width="5"/>','#fffaf6'),
 beans:svg('<path d="M37 45c13-11 30 1 23 15-5 10-18 14-26 6-7-7-4-16 3-21zM67 60c12-9 27 2 20 15-5 9-17 12-24 5-7-6-3-15 4-20z" fill="#9f6654" stroke="#4a312b" stroke-width="5"/>','#fff8f5'),
 apple:svg('<path d="M60 44c-20-17-37 2-31 24 6 22 20 31 31 22 11 9 25 0 31-22 6-22-11-41-31-24z" fill="#e98f82" stroke="#4a312b" stroke-width="5"/><path d="M60 43c0-11 8-19 18-20M63 31c-7-8-15-7-19-4" '+stroke+'/>','#fff8f6'),
 milk:svg('<path d="M39 31h35l9 13v50H39z" fill="#f4f8fa" stroke="#4a312b" stroke-width="5"/><path d="M39 31l10-10h25v10M74 31v63M48 54h17" '+stroke+'/>','#f9fcfd'),
 juice:svg('<path d="M38 41h44l-5 53H43z" fill="#f5c67e" stroke="#4a312b" stroke-width="5"/><path d="M69 42l10-19M59 23h22" '+stroke+'/>','#fffaf2')
};
var C={core:'#fff6f0',needs:'#edf7fb',people:'#faf2f8',emotions:'#fff9e8',activities:'#f0f7ef',food:'#fff5e8'};
var cards=[
{id:'yes',label:'Sim',speech:'Sim',category:'Respostas',image:icons.check,color:C.core},
{id:'no',label:'Não',speech:'Não',category:'Respostas',image:icons.no,color:C.core},
{id:'more',label:'Mais',speech:'Mais',category:'Respostas',image:icons.plus,color:C.core},
{id:'finished',label:'Acabou',speech:'Acabou',category:'Respostas',image:icons.stop,color:C.core},
{id:'help',label:'Ajuda',speech:'Preciso de ajuda',category:'Respostas',image:icons.help,color:C.core},
{id:'want',label:'Quero',speech:'Quero',category:'Ações',image:icons.want,color:C.core},
{id:'dont-want',label:'Não quero',speech:'Não quero',category:'Ações',image:icons.dont,color:C.core},
{id:'water',label:'Água',speech:'Água',category:'Necessidades',image:icons.water,color:C.needs},
{id:'eat',label:'Comer',speech:'Quero comer',category:'Necessidades',image:icons.eat,color:C.needs},
{id:'toilet',label:'Banheiro',speech:'Quero ir ao banheiro',category:'Necessidades',image:icons.toilet,color:C.needs},
{id:'sleep',label:'Dormir',speech:'Quero dormir',category:'Necessidades',image:icons.bed,color:C.needs},
{id:'pain',label:'Dor',speech:'Estou com dor',category:'Necessidades',image:icons.pain,color:C.needs},
{id:'mom',label:'Mamãe',speech:'Mamãe',category:'Pessoas',image:icons.person,color:C.people},
{id:'dad',label:'Papai',speech:'Papai',category:'Pessoas',image:icons.man,color:C.people},
{id:'family',label:'Família',speech:'Família',category:'Pessoas',image:icons.family,color:C.people},
{id:'teacher',label:'Professora',speech:'Professora',category:'Pessoas',image:icons.teacher,color:C.people},
{id:'happy',label:'Feliz',speech:'Estou feliz',category:'Emoções',image:icons.happy,color:C.emotions},
{id:'sad',label:'Triste',speech:'Estou triste',category:'Emoções',image:icons.sad,color:C.emotions},
{id:'angry',label:'Bravo',speech:'Estou bravo',category:'Emoções',image:icons.angry,color:C.emotions},
{id:'afraid',label:'Medo',speech:'Estou com medo',category:'Emoções',image:icons.scared,color:C.emotions},
{id:'tired',label:'Cansado',speech:'Estou cansado',category:'Emoções',image:icons.tired,color:C.emotions},
{id:'play',label:'Brincar',speech:'Quero brincar',category:'Atividades',image:icons.play,color:C.activities},
{id:'school',label:'Escola',speech:'Escola',category:'Lugares',image:icons.school,color:C.activities},
{id:'home',label:'Casa',speech:'Casa',category:'Lugares',image:icons.house,color:C.activities},
{id:'go-out',label:'Sair',speech:'Quero sair',category:'Atividades',image:icons.out,color:C.activities},
{id:'music',label:'Música',speech:'Quero ouvir música',category:'Atividades',image:icons.music,color:C.activities},
{id:'ball',label:'Bola',speech:'Bola',category:'Atividades',image:icons.ball,color:C.activities},
{id:'phone',label:'Celular',speech:'Quero o celular',category:'Objetos',image:icons.device,color:C.activities},
{id:'bread',label:'Pão',speech:'Pão',category:'Alimentação',image:icons.bread,color:C.food},
{id:'rice',label:'Arroz',speech:'Arroz',category:'Alimentação',image:icons.rice,color:C.food},
{id:'beans',label:'Feijão',speech:'Feijão',category:'Alimentação',image:icons.beans,color:C.food},
{id:'fruit',label:'Fruta',speech:'Quero fruta',category:'Alimentação',image:icons.apple,color:C.food},
{id:'milk',label:'Leite',speech:'Leite',category:'Bebidas',image:icons.milk,color:C.food},
{id:'juice',label:'Suco',speech:'Suco',category:'Bebidas',image:icons.juice,color:C.food}
];
window.FonelyCAALibrary={
 cards:cards,
 categories:['Respostas','Ações','Necessidades','Pessoas','Emoções','Atividades','Lugares','Objetos','Alimentação','Bebidas'],
 byId:function(id){return cards.find(function(c){return c.id===id;})||null;},
 iconForCustom:function(){return icons.want;}
};
})();