(function(){
'use strict';
var PRICES={annual_pix:19990,monthly:3990};
function money(c){return (c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function sb(){return window.FonelyCloud&&window.FonelyCloud.supabase;}
function account(){return window.FonelyAccount||{};}
async function quote(plan,coupon){
  var client=sb(); if(!client)throw new Error('Conta ainda não carregada.');
  var r=await client.rpc('billing_quote',{p_to_plan:plan,p_coupon:coupon||null});
  if(r.error)throw r.error; return r.data;
}
async function order(plan,coupon){
  var client=sb(); if(!client)throw new Error('Conta ainda não carregada.');
  var r=await client.rpc('billing_create_order',{p_to_plan:plan,p_coupon:coupon||null});
  if(r.error)throw r.error; return r.data;
}
function modal(){
  var accountOverlay=document.getElementById('fonelyAccountOverlay');if(accountOverlay){accountOverlay.style.display='none';accountOverlay.remove();}
  var old=document.getElementById('fonelyPlansOverlay');if(old)old.remove();
  var w=document.createElement('div');w.id='fonelyPlansOverlay';w.className='fb-overlay';
  w.innerHTML='<div class="fb-panel"><div class="fb-head"><div><small>FONELY COMPLETO</small><h2>Escolha como pagar</h2><p>Todos os recursos do Fonely estão incluídos. Equipe é contratada separadamente.</p></div><button data-fb-close>×</button></div>'+
  '<div class="fb-grid">'+
  '<article class="fb-plan"><span>ANUAL NO PIX</span><h3>'+money(PRICES.annual_pix)+' <small>/ ano</small></h3><p>Pagamento único para 1 ano de acesso completo.</p><ul><li>Agenda e pacientes</li><li>Avaliações e evoluções</li><li>Documentos e financeiro</li><li>Relatórios</li><li>Fonely CAA completo</li></ul><button data-payment="annual_pix">Escolher anual no Pix</button></article>'+
  '<article class="fb-plan pro"><span>MENSAL RECORRENTE</span><h3>'+money(PRICES.monthly)+' <small>/ mês</small></h3><p>Cobrança recorrente mensal, com os mesmos recursos.</p><ul><li>Todos os recursos liberados</li><li>CAA completo</li><li>Sem diferença de funcionalidades</li><li>Equipe contratada à parte</li></ul><button data-payment="monthly">Escolher mensal</button></article>'+
  '</div><div id="fbSummary" class="fb-summary"></div></div>';
  document.body.appendChild(w);
  w.querySelector('[data-fb-close]').onclick=function(){w.remove();};
  w.onclick=function(e){if(e.target===w)w.remove();};
  w.querySelectorAll('[data-payment]').forEach(function(b){b.onclick=function(){
    var kind=b.dataset.payment,amount=PRICES[kind],box=w.querySelector('#fbSummary');
    box.innerHTML='<div><b>'+(kind==='annual_pix'?'Fonely completo · anual no Pix':'Fonely completo · mensal recorrente')+'</b><span>'+(kind==='annual_pix'?'1 ano de acesso':'Cobrança mensal recorrente')+'</span></div><strong>'+money(amount)+'</strong><button id="fbContinue">Continuar para pagamento</button>';
    box.querySelector('#fbContinue').onclick=function(){localStorage.setItem('fonely_selected_payment',kind);alert('Forma de pagamento selecionada. O checkout será aberto quando a integração de pagamento estiver configurada para esta opção.');};
  };});
}
function enhance(){}
window.FonelyBilling={open:modal,quote:quote,createOrder:order};
})();
