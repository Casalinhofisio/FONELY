(function(){
'use strict';
var ANNUAL=19990,MONTHLY=3990;
var TEAM={1:2990,3:4999,7:6999,10:7999};
function money(c){return (c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function sb(){return window.FonelyCloud&&window.FonelyCloud.supabase;}
async function quote(kind,qty,coupon){
 var client=sb();if(!client)throw new Error('Conta ainda não carregada.');
 var r=await client.rpc('billing_quote_v2',{p_kind:kind,p_team_seats:qty||0,p_coupon:coupon||null});
 if(r.error)throw r.error;return r.data;
}
async function order(kind,qty,coupon){
 var client=sb();if(!client)throw new Error('Conta ainda não carregada.');
 var r=await client.rpc('billing_create_order_v2',{p_kind:kind,p_team_seats:qty||0,p_coupon:coupon||null});
 if(r.error)throw r.error;return r.data;
}
function modal(){
 var old=document.getElementById('fonelyPlansOverlay');if(old)old.remove();
 var a=window.FonelyAccount||{},access=a.access||{},teamSeats=Number(access.team_member_limit||0);
 var w=document.createElement('div');w.id='fonelyPlansOverlay';w.className='fb-overlay';
 w.innerHTML='<div class="fb-panel"><div class="fb-head"><div><small>FONELY</small><h2>Escolha sua assinatura</h2><p>Escolha a opção que funciona melhor para você.</p></div><button data-fb-close>×</button></div>'+
 '<div class="fb-grid"><article class="fb-plan pro"><span>ANUAL NO PIX</span><h3>'+money(ANNUAL)+' <small>/ ano</small></h3><p>1 profissional · pagamento anual com desconto</p><ul><li>Agenda e pacientes</li><li>Prontuário, anamnese e avaliações</li><li>Evoluções, documentos e financeiro</li><li>Relatórios</li><li>Fonely CAA completo</li></ul><button data-kind="annual">Escolher anual</button></article>'+
 '<article class="fb-plan"><span>MENSAL</span><h3>'+money(MONTHLY)+' <small>/ mês</small></h3><p>Cobrança recorrente.</p><ul><li>Agenda, pacientes e prontuário</li><li>Avaliações, evoluções e documentos</li><li>Financeiro, relatórios e Fonely CAA</li><li>1 profissional</li></ul><button data-kind="monthly">Escolher mensal</button></article></div>'+
 '<div class="fb-team"><div class="fb-head"><div><small>EQUIPE · ADICIONAL ANUAL</small><h2>Leve sua clínica para o Fonely</h2><p>Adicione profissionais à sua clínica. A equipe trabalha com a mesma agenda e os mesmos pacientes, com acessos definidos pelo titular.</p></div></div><div class="fb-team-grid">'+
 [1,3,7,10].map(function(n){return '<button class="fb-team-option '+(teamSeats===n?'current':'')+'" data-team="'+n+'"><b>+'+n+' fono'+(n>1?'s':'')+'</b><span>'+money(TEAM[n])+' / ano</span><small>'+(n===1?'1 acesso para sua equipe':n+' acessos adicionais com desconto')+'</small></button>';}).join('')+
 '</div></div><div class="fb-coupon"><label>Cupom de desconto</label><div><input id="fbCoupon" placeholder="Digite seu cupom"><button id="fbApply">Aplicar</button></div><small id="fbCouponMsg">O desconto é calculado antes do pagamento.</small></div><div id="fbSummary" class="fb-summary"></div></div>';
 document.body.appendChild(w);w.querySelector('[data-fb-close]').onclick=function(){w.remove();};w.onclick=function(e){if(e.target===w)w.remove();};
 var selected=null,qty=0;
 async function show(kind,seats){selected=kind;qty=seats||0;var box=w.querySelector('#fbSummary'),coupon=w.querySelector('#fbCoupon').value.trim();box.innerHTML='<span>Calculando...</span>';
  try{var q=await quote(kind,qty,coupon);var label=kind==='team'?'Equipe · +'+qty+' fono'+(qty>1?'s':''):kind==='annual'?'Fonely anual':'Fonely mensal';box.innerHTML='<div><b>'+label+'</b><span>'+money(q.base_amount_cents)+(q.discount_cents?' − '+money(q.discount_cents)+' de desconto':'')+'</span></div><strong>'+money(q.amount_cents)+'</strong><button id="fbContinue">Continuar para pagamento</button>';box.querySelector('#fbContinue').onclick=async function(){var b=this;b.disabled=true;b.textContent='Preparando...';try{var o=await order(kind,qty,coupon);localStorage.setItem('fonely_pending_order',JSON.stringify(o));alert('Pedido preparado: '+money(o.amount_cents)+'. O acesso só será alterado após a confirmação do pagamento.');}catch(e){alert('Não foi possível preparar o pagamento.');}finally{b.disabled=false;b.textContent='Continuar para pagamento';}};}catch(e){box.innerHTML='<span class="error">Não foi possível calcular agora. Verifique o cupom e tente novamente.</span>';}}
 w.querySelectorAll('[data-kind]').forEach(function(b){b.onclick=function(){show(b.dataset.kind,0);};});
 w.querySelectorAll('[data-team]').forEach(function(b){b.onclick=function(){show('team',Number(b.dataset.team));};});
 w.querySelector('#fbApply').onclick=function(){if(selected)show(selected,qty);else w.querySelector('#fbCouponMsg').textContent='Escolha uma forma de assinatura ou um adicional de equipe.';};
}
function enhance(){var p=document.querySelector('#fonelyAccountOverlay .fe-account-actions');if(!p||p.querySelector('[data-fb-plans]'))return;var b=document.createElement('button');b.type='button';b.className='soft-btn';b.dataset.fbPlans='1';b.textContent='Assinatura e equipe';b.onclick=modal;p.insertBefore(b,p.firstChild);}
new MutationObserver(enhance).observe(document.documentElement,{childList:true,subtree:true});
window.FonelyBilling={open:modal,quote:quote,createOrder:order};
})();