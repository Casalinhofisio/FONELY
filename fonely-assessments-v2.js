(function(){
'use strict';
var KEY=window.FONELY_STORAGE_KEY||'fonely_clean_v1';
var DOMAIN_DEFS=[
  ['language','Comunicação e linguagem','Compreensão, expressão, pragmática e funcionalidade comunicativa.'],
  ['speech','Fala e fonologia','Inteligibilidade, produção dos sons, processos fonológicos e articulação.'],
  ['oral','Motricidade orofacial','Estruturas, mobilidade, funções orais e coordenação.'],
  ['voice','Voz','Qualidade vocal, uso da voz, resistência e percepção do paciente.'],
  ['fluency','Fluência','Ritmo, continuidade da fala, rupturas e impacto funcional.'],
  ['hearing','Audição e percepção','Histórico, exames, respostas auditivas e impacto funcional.'],
  ['swallowing','Disfagia e alimentação','Segurança, eficiência, sinais clínicos e funcionalidade da alimentação.'],
  ['caa','CAA e comunicação funcional','Meios de comunicação, acesso, símbolos, parceiros e contextos de uso.']
];
var AREA_DOMAIN_MAP={
  'Linguagem':['language','hearing'],
  'Fala / Fonologia':['speech','oral','hearing'],
  'Motricidade Orofacial':['oral','speech','swallowing'],
  'Voz':['voice','oral'],
  'Fluência':['fluency','language'],
  'Audição':['hearing','language'],
  'Disfagia':['swallowing','oral'],
  'CAA / Comunicação':['caa','language'],
  'Fonoaudiologia geral':['language','speech','oral','voice','fluency','hearing','swallowing','caa'],
  'Outro':['language','speech','oral','voice','fluency','hearing','swallowing','caa']
};
function load(){try{var d=JSON.parse(localStorage.getItem(KEY))||{};d.patients=Array.isArray(d.patients)?d.patients:[];d.assessments=Array.isArray(d.assessments)?d.assessments:[];return d;}catch(e){return {patients:[],assessments:[]};}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d));if(window.FonelyCloud)window.FonelyCloud.saveWorkspace(d);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fmt(s){if(!s)return '—';var p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12).toLocaleDateString('pt-BR');}
function pname(d,pid){var p=d.patients.find(function(x){return x.id===pid;});return p?p.name:'Paciente';}
function normalize(a){a.domains=a.domains||{};DOMAIN_DEFS.forEach(function(def){if(!a.domains[def[0]])a.domains[def[0]]={status:'Não avaliado',note:''};});return a;}
function statusClass(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');}
function close(id){var x=document.getElementById(id||'fonelyAssessmentModal');if(x)x.remove();}
function modal(html){close();var w=document.createElement('div');w.className='modal';w.id='fonelyAssessmentModal';w.innerHTML='<div class="modal-card assessment-modal"><button class="close" data-assess-close>×</button>'+html+'</div>';document.body.appendChild(w);w.querySelector('[data-assess-close]').onclick=function(){w.remove();};w.onclick=function(e){if(e.target===w)w.remove();};return w;}
function options(selected){return ['Não avaliado','Dentro do esperado','Atenção','Alterado'].map(function(x){return '<option '+(selected===x?'selected':'')+'>'+x+'</option>';}).join('');}
function domainForm(def,current){current=current||{status:'Não avaliado',note:''};return '<section class="assessment-domain" data-domain-key="'+def[0]+'"><div class="assessment-domain-head"><div><b>'+esc(def[1])+'</b><span>'+esc(def[2])+'</span></div><select name="status_'+def[0]+'">'+options(current.status)+'</select></div><textarea name="note_'+def[0]+'" placeholder="Achados, respostas, exemplos clínicos e observações...">'+esc(current.note||'')+'</textarea></section>';}
function areaField(key,label,placeholder,current,type){
  current=current||{};
  var value=esc(current[key]||''),attrs=' data-area-detail="'+esc(key)+'" data-area-label="'+esc(label)+'"';
  if(type==='short')return '<label>'+esc(label)+'<input'+attrs+' name="area_'+esc(key)+'" value="'+value+'" placeholder="'+esc(placeholder||'')+'"></label>';
  return '<label>'+esc(label)+'<textarea'+attrs+' name="area_'+esc(key)+'" placeholder="'+esc(placeholder||'')+'">'+value+'</textarea></label>';
}
function areaSpecificFields(area,current){
  current=current||{};
  if(area==='Linguagem')return '<div class="assessment-specific-grid">'+
    areaField('receptive','Compreensão / linguagem receptiva','Ordens, perguntas, conceitos, vocabulário receptivo e compreensão funcional.',current)+
    areaField('expressive','Expressão / linguagem expressiva','Vocabulário, frases, morfossintaxe, narrativa e elaboração verbal.',current)+
    areaField('pragmatics','Pragmática e interação','Intenção comunicativa, turnos, iniciativa, manutenção de tópico e funções comunicativas.',current)+
    areaField('communication','Recursos de comunicação','Fala, gestos, apoios visuais, CAA e estratégias utilizadas.',current)+'</div>';
  if(area==='Fala / Fonologia')return '<div class="assessment-specific-grid">'+
    areaField('intelligibility','Inteligibilidade da fala','Com quem é compreendido, em quais contextos e grau de impacto funcional.',current)+
    areaField('speechSounds','Produção dos sons da fala','Trocas, omissões, distorções, inventário fonético e exemplos observados.',current)+
    areaField('processes','Processos fonológicos / padrões','Padrões produtivos e não produtivos, consistência e contextos.',current)+
    areaField('stimulability','Estimulabilidade e pistas','Resposta a modelo, pistas visuais, táteis ou auditivas.',current)+'</div>';
  if(area==='Motricidade Orofacial')return '<div class="assessment-specific-grid">'+
    areaField('structures','Estruturas orofaciais','Lábios, língua, bochechas, palato, mandíbula, dentição e postura.',current)+
    areaField('mobility','Mobilidade, tônus e coordenação','Amplitude, força, tônus, precisão e coordenação dos movimentos.',current)+
    areaField('functions','Funções estomatognáticas','Respiração, mastigação, deglutição, sucção e fala.',current)+
    areaField('habits','Hábitos orais / fatores associados','Hábitos, postura habitual, dor, desconforto e fatores funcionais.',current)+'</div>';
  if(area==='Voz')return '<div class="assessment-specific-grid">'+
    areaField('quality','Qualidade vocal','Rugosidade, soprosidade, tensão, instabilidade e percepção geral.',current)+
    areaField('parameters','Parâmetros vocais','Pitch, loudness, ataque vocal, ressonância e coordenação pneumofonoarticulatória.',current)+
    areaField('symptoms','Sintomas e queixas','Fadiga, dor, esforço, falhas, pigarro, perda de extensão e variação ao longo do dia.',current)+
    areaField('habits','Hábitos e demanda vocal','Uso profissional, hidratação, abuso vocal e fatores ambientais.',current)+'</div>';
  if(area==='Fluência')return '<div class="assessment-specific-grid">'+
    areaField('ruptures','Tipos de rupturas / disfluências','Repetições, prolongamentos, bloqueios e outras rupturas observadas.',current)+
    areaField('tension','Tensão e comportamentos associados','Esforço, movimentos associados, evitação e reações observadas.',current)+
    areaField('situations','Situações de maior e menor fluência','Contextos, interlocutores e tarefas que modificam a fluência.',current)+
    areaField('impact','Impacto funcional / emocional','Participação, escola, trabalho, relações e percepção do paciente/família.',current)+'</div>';
  if(area==='Audição')return '<div class="assessment-specific-grid">'+
    areaField('history','Histórico auditivo','Queixas, otites, exposição a ruído, triagens, exames e antecedentes.',current)+
    areaField('responses','Respostas auditivas funcionais','Detecção, localização, discriminação e compreensão em diferentes ambientes.',current)+
    areaField('tests','Exames / resultados disponíveis','Registre exames, datas, achados e encaminhamentos já realizados.',current)+
    areaField('devices','Tecnologia / dispositivos','AASI, implante, sistema FM e uso funcional, quando aplicável.',current)+'</div>';
  if(area==='Disfagia')return '<div class="assessment-specific-grid">'+
    areaField('feedingRoute','Via e condição alimentar atual','Via de alimentação, consistências, utensílios, postura e nível de ajuda.',current)+
    areaField('oralPhase','Fase oral / eficiência','Captação, vedamento, mastigação, propulsão, resíduos e tempo de refeição.',current)+
    areaField('clinicalSigns','Sinais clínicos durante a deglutição','Tosse, engasgo, voz molhada, desconforto, fadiga e alterações respiratórias.',current)+
    areaField('safety','Segurança e funcionalidade','Adaptações, supervisão, orientações e necessidade de investigação instrumental.',current)+'</div>';
  if(area==='CAA / Comunicação')return '<div class="assessment-specific-grid">'+
    areaField('functions','Funções comunicativas','Pedir, recusar, comentar, responder, socializar e outras funções prioritárias.',current)+
    areaField('currentMeans','Meios atuais de comunicação','Fala, gestos, vocalizações, apontar, símbolos, dispositivos e estratégias.',current)+
    areaField('access','Forma de acesso','Toque direto, apontar, varredura, olhar, acesso motor e necessidade de adaptações.',current)+
    areaField('contexts','Parceiros e contextos','Família, escola, clínica e situações em que o recurso precisa funcionar.',current)+'</div>';
  return '<div class="assessment-specific-grid">'+areaField('specific','Aspectos específicos desta avaliação','Registre os achados específicos que não cabem nos campos anteriores.',current)+'</div>';
}
function applyAssessmentArea(form,area,current){
  var allowed=AREA_DOMAIN_MAP[area]||AREA_DOMAIN_MAP['Outro'];
  form.querySelectorAll('[data-domain-key]').forEach(function(section){
    section.hidden=allowed.indexOf(section.getAttribute('data-domain-key'))<0;
  });
  var title=form.querySelector('[data-area-specific-title]');
  if(title)title.textContent=area==='Fonoaudiologia geral'?'Detalhamento geral':'Detalhamento · '+area;
  var host=form.querySelector('[data-area-specific]');
  if(host)host.innerHTML=areaSpecificFields(area,current||{});
}
function collectAreaDetails(form){
  var out={};
  form.querySelectorAll('[data-area-detail]').forEach(function(el){out[el.getAttribute('data-area-detail')]=el.value;});
  return out;
}
function readAreaDetails(a){
  var details=a&&a.areaDetails||{},keys=Object.keys(details);
  if(!keys.length)return '';
  return '<section class="assessment-read-block"><small>DETALHAMENTO DA ÁREA</small><div class="assessment-area-read">'+keys.map(function(k){var label=k.replace(/([A-Z])/g,' $1').replace(/^./,function(c){return c.toUpperCase();});return '<div><b>'+esc(label)+'</b><p>'+esc(details[k]||'—')+'</p></div>';}).join('')+'</div></section>';
}
function assessmentForm(pid,existing){
  var d=load(),p=d.patients.find(function(x){return x.id===pid;});if(!p)return;
  existing=existing?normalize(existing):normalize({domains:{}});
  var selectedArea=existing.mainArea||p.area||'Linguagem';
  if(!AREA_DOMAIN_MAP[selectedArea])selectedArea='Linguagem';
  var areaOptions=['Linguagem','Fala / Fonologia','Motricidade Orofacial','Voz','Fluência','Audição','Disfagia','CAA / Comunicação','Fonoaudiologia geral','Outro'];
  var w=modal('<div class="assessment-kicker">AVALIAÇÃO FONOAUDIOLÓGICA</div><div class="assessment-title"><div><h2>'+esc(existing.id?'Editar avaliação':'Nova avaliação')+'</h2><p>'+esc(p.name)+' · o formulário muda conforme a área escolhida</p></div><span class="assessment-brand-chip">Fonely Clínico</span></div><form id="fonelyAssessmentForm"><div class="assessment-form-grid"><label>Tipo<select name="kind"><option '+(existing.kind==='Avaliação inicial'?'selected':'')+'>Avaliação inicial</option><option '+(existing.kind==='Reavaliação'?'selected':'')+'>Reavaliação</option><option '+(existing.kind==='Triagem'?'selected':'')+'>Triagem</option><option '+(existing.kind==='Avaliação complementar'?'selected':'')+'>Avaliação complementar</option></select></label><label>Data<input type="date" name="date" value="'+esc(existing.date||today())+'" required></label><label>Profissional<input name="professional" value="'+esc(existing.professional||'')+'" placeholder="Nome do profissional"></label><label>Foco principal<select name="mainArea" id="assessmentMainArea">'+areaOptions.map(function(x){return '<option '+(selectedArea===x?'selected':'')+'>'+x+'</option>';}).join('')+'</select></label></div><label>Motivo e contexto da avaliação<textarea name="context" placeholder="Demanda principal, encaminhamento, contexto familiar/escolar/profissional e objetivo desta avaliação...">'+esc(existing.context||existing.summary||'')+'</textarea></label><div class="assessment-section-heading"><div><small>ÁREA SELECIONADA</small><h3 data-area-specific-title>Detalhamento · '+esc(selectedArea)+'</h3></div><p>Os campos abaixo mudam automaticamente quando você troca o foco principal.</p></div><div data-area-specific></div><div class="assessment-section-heading"><div><small>MAPA CLÍNICO</small><h3>Domínios relacionados</h3></div><p>Apenas os domínios relacionados à área escolhida ficam visíveis.</p></div>'+DOMAIN_DEFS.map(function(def){return domainForm(def,existing.domains[def[0]]);}).join('')+'<div class="assessment-form-grid bottom"><label>Instrumentos / protocolos utilizados<textarea name="protocols" placeholder="Registre o nome do protocolo, instrumento ou procedimento utilizado.">'+esc(existing.protocols||existing.protocol||'')+'</textarea></label><label>Condições da avaliação<textarea name="conditions" placeholder="Participação, ambiente, necessidade de apoio, intercorrências...">'+esc(existing.conditions||'')+'</textarea></label></div><label>Síntese dos achados<textarea name="conclusion" required placeholder="Integre os principais achados clínicos...">'+esc(existing.conclusion||existing.summary||'')+'</textarea></label><label>Plano após a avaliação<textarea name="plan" placeholder="Objetivos, orientações, necessidade de terapia, reavaliação, encaminhamentos...">'+esc(existing.plan||'')+'</textarea></label><div class="assessment-actions"><button type="button" class="soft-btn" data-assess-cancel>Cancelar</button><button class="primary">Salvar avaliação</button></div></form>');
  var form=w.querySelector('#fonelyAssessmentForm'),areaSelect=form.querySelector('#assessmentMainArea'),drafts={};
  drafts[selectedArea]=existing.areaDetails||{};
  applyAssessmentArea(form,selectedArea,drafts[selectedArea]);
  areaSelect.onchange=function(){
    var previous=selectedArea;
    drafts[previous]=collectAreaDetails(form);
    selectedArea=this.value;
    applyAssessmentArea(form,selectedArea,drafts[selectedArea]||{});
  };
  w.querySelector('[data-assess-cancel]').onclick=function(){w.remove();};
  form.onsubmit=function(e){
    e.preventDefault();var f=new FormData(form),domains={};
    DOMAIN_DEFS.forEach(function(def){domains[def[0]]={status:f.get('status_'+def[0])||'Não avaliado',note:f.get('note_'+def[0])||''};});
    var areaDetails=collectAreaDetails(form);
    var obj={id:existing.id||uid(),patientId:pid,kind:f.get('kind'),date:f.get('date'),professional:f.get('professional'),mainArea:f.get('mainArea'),context:f.get('context'),protocols:f.get('protocols'),conditions:f.get('conditions'),domains:domains,areaDetails:areaDetails,conclusion:f.get('conclusion'),summary:f.get('conclusion'),plan:f.get('plan'),updatedAt:new Date().toISOString()};
    var idx=d.assessments.findIndex(function(x){return x.id===obj.id;});if(idx>=0)d.assessments[idx]=obj;else d.assessments.push(obj);
    save(d);w.remove();renderPatientAssessments(pid);mountPage(true);
  };
}
function domainBadges(a){a=normalize(a);return DOMAIN_DEFS.map(function(def){var st=a.domains[def[0]].status;return '<span class="assessment-badge '+statusClass(st)+'"><i></i>'+esc(def[1])+': '+esc(st)+'</span>';}).join('');}
function detail(pid,aid){var d=load(),a=d.assessments.find(function(x){return x.id===aid;});if(!a)return;a=normalize(a);var w=modal('<div class="assessment-kicker">REGISTRO DE AVALIAÇÃO</div><div class="assessment-title"><div><h2>'+esc(a.kind||'Avaliação')+'</h2><p>'+esc(pname(d,pid))+' · '+fmt(a.date)+(a.professional?' · '+esc(a.professional):'')+'</p></div><span class="assessment-brand-chip">'+esc(a.mainArea||'Geral')+'</span></div><section class="assessment-read-block"><small>MOTIVO E CONTEXTO</small><p>'+esc(a.context||'—')+'</p></section>'+readAreaDetails(a)+'<div class="assessment-read-domains">'+DOMAIN_DEFS.map(function(def){var x=a.domains[def[0]];return '<article><div><b>'+esc(def[1])+'</b><span class="assessment-state '+statusClass(x.status)+'">'+esc(x.status)+'</span></div><p>'+esc(x.note||'Sem observações registradas.')+'</p></article>';}).join('')+'</div><div class="assessment-read-grid"><section class="assessment-read-block"><small>INSTRUMENTOS / PROTOCOLOS</small><p>'+esc(a.protocols||'—')+'</p></section><section class="assessment-read-block"><small>CONDIÇÕES DA AVALIAÇÃO</small><p>'+esc(a.conditions||'—')+'</p></section></div><section class="assessment-read-block highlight"><small>SÍNTESE DOS ACHADOS</small><p>'+esc(a.conclusion||a.summary||'—')+'</p></section><section class="assessment-read-block"><small>PLANO APÓS A AVALIAÇÃO</small><p>'+esc(a.plan||'—')+'</p></section><div class="assessment-actions"><button class="soft-btn" data-compare-one>Comparar avaliações</button><button class="primary" data-edit-assessment>Editar</button></div>');w.querySelector('[data-edit-assessment]').onclick=function(){assessmentForm(pid,a);};w.querySelector('[data-compare-one]').onclick=function(){compare(pid);};}
function compare(pid){var d=load(),list=d.assessments.filter(function(x){return x.patientId===pid;}).sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});if(list.length<2){alert('Registre pelo menos duas avaliações deste paciente para comparar.');return;}var left=normalize(list[1]),right=normalize(list[0]);var w=modal('<div class="assessment-kicker">COMPARAÇÃO CLÍNICA</div><div class="assessment-title"><div><h2>Evolução entre avaliações</h2><p>'+esc(pname(d,pid))+'</p></div><span class="assessment-brand-chip">'+fmt(left.date)+' → '+fmt(right.date)+'</span></div><div class="compare-head"><div><small>AVALIAÇÃO ANTERIOR</small><b>'+esc(left.kind||'Avaliação')+'</b><span>'+fmt(left.date)+'</span></div><div><small>AVALIAÇÃO MAIS RECENTE</small><b>'+esc(right.kind||'Avaliação')+'</b><span>'+fmt(right.date)+'</span></div></div><div class="compare-domains">'+DOMAIN_DEFS.map(function(def){var a=left.domains[def[0]],b=right.domains[def[0]];return '<article><h4>'+esc(def[1])+'</h4><div><section><span class="assessment-state '+statusClass(a.status)+'">'+esc(a.status)+'</span><p>'+esc(a.note||'Sem observações.')+'</p></section><strong>→</strong><section><span class="assessment-state '+statusClass(b.status)+'">'+esc(b.status)+'</span><p>'+esc(b.note||'Sem observações.')+'</p></section></div></article>';}).join('')+'</div><div class="compare-summary"><section><small>SÍNTESE ANTERIOR</small><p>'+esc(left.conclusion||left.summary||'—')+'</p></section><section><small>SÍNTESE ATUAL</small><p>'+esc(right.conclusion||right.summary||'—')+'</p></section></div>');}
function cardsForPatient(d,pid){var list=d.assessments.filter(function(x){return x.patientId===pid;}).sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});if(!list.length)return '<div class="assessment-empty"><b>Nenhuma avaliação registrada</b><span>Crie a primeira avaliação para iniciar a linha de acompanhamento.</span></div>';return '<div class="assessment-timeline">'+list.map(function(a,i){a=normalize(a);return '<article class="assessment-card"><div class="assessment-card-top"><div><small>'+esc(a.kind||'Avaliação')+'</small><h3>'+fmt(a.date)+' · '+esc(a.mainArea||'Geral')+'</h3><p>'+esc(a.conclusion||a.summary||'Sem síntese registrada.')+'</p></div><span class="assessment-index">'+String(list.length-i).padStart(2,'0')+'</span></div><div class="assessment-badges">'+domainBadges(a)+'</div><div class="assessment-card-actions"><button class="soft-btn" data-assessment-view="'+a.id+'">Ver avaliação</button>'+(list.length>1?'<button class="soft-btn" data-assessment-compare>Comparar</button>':'')+'</div></article>';}).join('')+'</div>';}
function bindAssessmentButtons(host,pid){host.querySelectorAll('[data-assessment-view]').forEach(function(b){b.onclick=function(){detail(pid,b.getAttribute('data-assessment-view'));};});host.querySelectorAll('[data-assessment-compare]').forEach(function(b){b.onclick=function(){compare(pid);};});var n=host.querySelector('[data-new-assessment]');if(n)n.onclick=function(){assessmentForm(pid);};}
function renderPatientAssessments(pid){var d=load(),p=d.patients.find(function(x){return x.id===pid;});if(!p)return;close();var w=modal('<div class="assessment-kicker">PRONTUÁRIO · AVALIAÇÕES</div><div class="assessment-title"><div><h2>'+esc(p.name)+'</h2><p>Avaliações organizadas em linha do tempo, com comparação entre datas.</p></div><button class="primary" data-new-assessment>+ Nova avaliação</button></div>'+cardsForPatient(d,pid));bindAssessmentButtons(w,pid);}
function pageHTML(){var d=load(),total=d.assessments.length,re=d.assessments.filter(function(x){return x.kind==='Reavaliação';}).length,patients={};d.assessments.forEach(function(x){patients[x.patientId]=1;});var latest=d.assessments.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});return '<section class="fonely-assessment-v2"><div class="assessment-page-hero"><div><small>AVALIAÇÃO CLÍNICA · FONELY</small><h2>Mapa clínico que acompanha a evolução</h2><p>Registre achados por domínio, documente sua síntese e compare avaliações do mesmo paciente sem depender de formulários genéricos.</p></div><button class="primary" data-page-new>+ Nova avaliação</button></div><div class="assessment-stats"><div><b>'+total+'</b><span>Avaliações registradas</span></div><div><b>'+re+'</b><span>Reavaliações</span></div><div><b>'+Object.keys(patients).length+'</b><span>Pacientes avaliados</span></div></div><article class="panel assessment-page-panel"><div class="panel-title"><h3>Histórico de avaliações</h3><select data-assessment-filter><option value="">Todos os pacientes</option>'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></div><div data-assessment-page-list>'+pageList(d,latest)+'</div></article></section>';}
function pageList(d,list){if(!list.length)return '<div class="assessment-empty"><b>Nenhuma avaliação registrada</b><span>Comece selecionando um paciente e criando uma avaliação.</span></div>';return '<div class="assessment-page-list">'+list.map(function(a){return '<button data-page-open="'+a.patientId+'|'+a.id+'"><div class="assessment-page-icon">◇</div><div><small>'+esc(a.kind||'Avaliação')+' · '+fmt(a.date)+'</small><b>'+esc(pname(d,a.patientId))+'</b><span>'+esc(a.mainArea||a.area||'Geral')+' · '+esc(a.conclusion||a.summary||'Sem síntese')+'</span></div><strong>→</strong></button>';}).join('')+'</div>';}
function choosePatient(){var d=load();if(!d.patients.length){alert('Cadastre um paciente antes de criar uma avaliação.');return;}var w=modal('<div class="assessment-kicker">NOVA AVALIAÇÃO</div><h2>Escolha o paciente</h2><p>O registro ficará salvo na linha do tempo clínica deste paciente.</p><label>Paciente<select id="assessmentPatientSelect">'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></label><div class="assessment-actions"><button class="primary" data-continue-assessment>Continuar</button></div>');w.querySelector('[data-continue-assessment]').onclick=function(){assessmentForm(w.querySelector('#assessmentPatientSelect').value);};}
function bindPage(host){var d=load();host.querySelector('[data-page-new]').onclick=choosePatient;var filter=host.querySelector('[data-assessment-filter]');filter.onchange=function(){var list=d.assessments.filter(function(a){return !filter.value||a.patientId===filter.value;}).sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});host.querySelector('[data-assessment-page-list]').innerHTML=pageList(d,list);bindPageList(host);};bindPageList(host);}
function bindPageList(host){host.querySelectorAll('[data-page-open]').forEach(function(b){b.onclick=function(){var p=b.getAttribute('data-page-open').split('|');detail(p[0],p[1]);};});}
function mountPage(force){var h1=[].slice.call(document.querySelectorAll('h1')).find(function(x){return x.textContent.trim()==='Avaliações';});if(!h1)return;var main=h1.closest('main');if(!main)return;var old=main.querySelector('.fonely-assessment-v2');if(old&&!force)return;if(old)old.remove();[].slice.call(main.children).forEach(function(x){if(x.tagName!=='HEADER')x.remove();});var host=document.createElement('div');host.innerHTML=pageHTML();main.appendChild(host.firstElementChild);bindPage(main.querySelector('.fonely-assessment-v2'));}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-parea="assess"]');if(!b)return;var head=b.closest('.layout')&&document.querySelector('.patient-head h2');if(!head)return;var d=load(),p=d.patients.find(function(x){return x.name===head.textContent.trim();});if(!p)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();renderPatientAssessments(p.id);},true);
var obs=new MutationObserver(function(){mountPage(false);});obs.observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',function(){mountPage(false);});setTimeout(function(){mountPage(false);},100);setTimeout(function(){mountPage(false);},500);
})();