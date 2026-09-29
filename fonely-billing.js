(function(){
'use strict';
var PRICES={base:29700,pro:39700};
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
  var old=document.getElementById('fonelyPlansOverlay');if(old)old.remove();
  var a=account(),tier=(a.access&&a.access.plan_tier)||'base';
  var w=document.createElement('div');w.id='fonelyPlansOverlay';w.className='fb-overlay';
  w.innerHTML='<div class="fb-panel"><div class="fb-head"><div><small>PLANOS FONELY</small><h2>Escolha seu acesso anual</h2><p>Você pode começar no Básico e migrar para o Pro quando quiser pagando apenas a diferença.</p></div><button data-fb-close>×</button></div>'+
  '<div class="fb-grid">'+
  '<article class="fb-plan '+(tier==='base'?'current':'')+'"><span>BÁSICO</span><h3>'+money(PRICES.base)+' <small>/ ano</small></h3><p>1 profissional.</p><ul><li>Agenda</li><li>Pacientes e prontuário</li><li>Anamnese</li><li>Avaliações e evoluções</li><li>Documentos e financeiro</li><li>Relatórios</li></ul><button data-plan="base" '+(tier==='base'?'disabled':'')+'>'+(tier==='base'?'Plano atual':'Escolher Básico')+'</button></article>'+
  '<article class="fb-plan pro '+(tier==='pro'?'current':'')+'"><span>PRO</span><h3>'+money(PRICES.pro)+' <small>/ ano</small></h3><p>Inclui recursos avançados.</p><ul><li>Tudo do Básico</li><li>Fonely CAA completo</li><li>Link da prancha para a família</li><li>Protocolos/modelos avançados</li><li>Titular + 1 profissional incluso</li></ul><button data-plan="pro" '+(tier==='pro'?'disabled':'')+'>'+(tier==='pro'?'Plano atual':tier==='base'?'Fazer upgrade por '+money(10000):'Escolher Pro')+'</button></article>'+
  '</div><div class="fb-coupon"><label>Cupom de desconto</label><div><input id="fbCoupon" placeholder="Digite seu cupom"><button id="fbApply">Aplicar</button></div><small id="fbCouponMsg">O desconto é calculado antes do pagamento.</small></div>'+
  '<div id="fbSummary" class="fb-summary"></div></div>';
  document.body.appendChild(w);
  w.querySelector('[data-fb-close]').onclick=function(){w.remove();};
  w.onclick=function(e){if(e.target===w)w.remove();};
  var selected=null;
  async function showQuote(plan){
    selected=plan;var box=w.querySelector('#fbSummary'),coupon=w.querySelector('#fbCoupon').value.trim();
    box.innerHTML='<span>Calculando...</span>';
    try{var q=await quote(plan,coupon);box.innerHTML='<div><b>'+((q.kind==='upgrade')?'Upgrade para Pro':'Plano '+(plan==='pro'?'Pro':'Básico'))+'</b><span>'+money(q.base_amount_cents)+(q.discount_cents?' − '+money(q.discount_cents)+' de desconto':'')+'</span></div><strong>'+money(q.amount_cents)+'</strong><button id="fbContinue">Continuar para pagamento</button>';box.querySelector('#fbContinue').onclick=async function(){var b=this;b.disabled=true;b.textContent='Preparando...';try{var o=await order(plan,coupon);localStorage.setItem('fonely_pending_order',JSON.stringify(o));alert('Pedido preparado: '+money(o.amount_cents)+'. A abertura automática do checkout será ligada quando a URL definitiva da InfinitePay/domínio estiver configurada.');}catch(err){alert(/invalid coupon/i.test(String(err.message))?'Cupom inválido ou expirado.':'Não foi possível preparar o pagamento.');}finally{b.disabled=false;b.textContent='Continuar para pagamento';}};}catch(err){box.innerHTML='<span class="error">'+(/invalid coupon/i.test(String(err.message))?'Cupom inválido, expirado ou não aplicável a este plano.':'Não foi possível calcular agora.')+'</span>';}
  }
  w.querySelectorAll('[data-plan]').forEach(function(b){b.onclick=function(){showQuote(b.dataset.plan);};});
  w.querySelector('#fbApply').onclick=function(){if(selected)showQuote(selected);else w.querySelector('#fbCouponMsg').textContent='Escolha Básico ou Pro para aplicar o cupom.';};
}
function enhance(){
  var p=document.querySelector('#fonelyAccountOverlay .fe-account-actions');if(!p||p.querySelector('[data-fb-plans]'))return;
  var b=document.createElement('button');b.type='button';b.className='soft-btn';b.dataset.fbPlans='1';b.textContent='Ver planos e upgrade';b.onclick=modal;p.insertBefore(b,p.firstChild);
}
new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
window.FonelyBilling={open:modal,quote:quote,createOrder:order};
})();
