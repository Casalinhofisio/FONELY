(function(){
'use strict';

var KEY=window.FONELY_STORAGE_KEY||'fonely_clean_v1';

var AREAS=[
  'Linguagem',
  'Fala / Fonologia',
  'Motricidade Orofacial',
  'Voz',
  'Fluência',
  'Audição',
  'Disfagia',
  'CAA / Comunicação',
  'Fonoaudiologia geral',
  'Outro'
];

function load(){
  try{
    var d=JSON.parse(localStorage.getItem(KEY))||{};
    d.patients=Array.isArray(d.patients)?d.patients:[];
    d.assessments=Array.isArray(d.assessments)?d.assessments:[];
    d.assessmentTemplates=Array.isArray(d.assessmentTemplates)?d.assessmentTemplates:[];
    return d;
  }catch(e){return {patients:[],assessments:[],assessmentTemplates:[]};}
}
function save(d){
  localStorage.setItem(KEY,JSON.stringify(d));
  if(window.FonelyCloud)window.FonelyCloud.saveWorkspace(d);
}
function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fmt(s){if(!s)return '—';var p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12).toLocaleDateString('pt-BR');}
function pname(d,pid){var p=d.patients.find(function(x){return x.id===pid;});return p?p.name:'Paciente';}
function patientAge(p){
  if(!p||!p.birth)return '';
  var q=p.birth.split('-').map(Number),b=new Date(q[0],(q[1]||1)-1,q[2]||1,12),n=new Date(),a=n.getFullYear()-b.getFullYear(),m=n.getMonth()-b.getMonth();
  if(m<0||(m===0&&n.getDate()<b.getDate()))a--;
  return a>=0?a:'';
}
function stageFromPatient(p){
  var a=patientAge(p);
  if(a==='')return 'Infantil';
  if(a<=12)return 'Infantil';
  if(a<=17)return 'Adolescente';
  if(a<=59)return 'Adulto';
  return 'Idoso';
}
function close(){var x=document.getElementById('fonelyAssessmentModal');if(x)x.remove();}
function modal(html){
  close();
  var w=document.createElement('div');
  w.className='modal';
  w.id='fonelyAssessmentModal';
  w.innerHTML='<div class="modal-card assessment-v3-modal"><button class="close" data-assess-close>×</button>'+html+'</div>';
  document.body.appendChild(w);
  w.querySelector('[data-assess-close]').onclick=function(){w.remove();};
  w.onclick=function(e){if(e.target===w)w.remove();};
  return w;
}
function selectOptions(list,value){
  return list.map(function(x){return '<option '+(String(x)===String(value)?'selected':'')+'>'+esc(x)+'</option>';}).join('');
}
function field(name,label,placeholder,value){
  return '<label>'+esc(label)+'<textarea name="'+esc(name)+'" placeholder="'+esc(placeholder||'')+'">'+esc(value||'')+'</textarea></label>';
}
function shortField(name,label,placeholder,value){
  return '<label>'+esc(label)+'<input name="'+esc(name)+'" value="'+esc(value||'')+'" placeholder="'+esc(placeholder||'')+'"></label>';
}
function choice(name,label,opts,value){
  return '<label>'+esc(label)+'<select name="'+esc(name)+'">'+selectOptions(opts,value||opts[0])+'</select></label>';
}
function yesNo(name,label,value){
  return choice(name,label,['Não avaliado','Sim','Não','Às vezes / parcialmente'],value||'Não avaliado');
}
function section(title,subtitle,body,open){
  return '<details class="assessment-v3-section" '+(open?'open':'')+'><summary><span><small>'+esc(subtitle||'')+'</small><b>'+esc(title)+'</b></span><i>⌄</i></summary><div class="assessment-v3-section-body">'+body+'</div></details>';
}
function genericFields(current,stage){
  current=current||{};
  var pediatric=(stage==='Infantil'||stage==='Adolescente');
  var out='';

  out+=section('Motivo e contexto','1 · CONTEXTO CLÍNICO',
    '<div class="assessment-v3-grid">'+
      field('chiefComplaint','Queixa principal','Queixa relatada pelo paciente, família ou responsável.',current.chiefComplaint)+
      field('complaintHistory','Histórico da queixa','Quando começou, evolução, situações em que piora/melhora e impacto percebido.',current.complaintHistory)+
      field('familyConcern','O que mais preocupa hoje?','Principais preocupações do paciente/família e prioridades para o acompanhamento.',current.familyConcern)+
      field('strengths','Potencialidades / pontos fortes','Habilidades já presentes, interesses e facilitadores observados.',current.strengths)+
    '</div>',true);

  out+=section('Comunicação atual','2 · COMUNICAÇÃO FUNCIONAL',
    '<div class="assessment-v3-grid">'+
      choice('communicationMode','Forma principal de comunicação',['Não avaliado','Verbal','Não verbal','Gestos / apontar','CAA','Comunicação mista'],current.communicationMode)+
      yesNo('communicativeIntent','Demonstra intenção comunicativa?',current.communicativeIntent)+
      yesNo('respondsName','Responde quando chamado pelo nome?',current.respondsName)+
      yesNo('points','Aponta para pedir, mostrar ou compartilhar?',current.points)+
      yesNo('eyeContact','Mantém contato visual funcional?',current.eyeContact)+
      yesNo('takesTurns','Realiza trocas de turno?',current.takesTurns)+
      yesNo('initiates','Inicia comunicação espontaneamente?',current.initiates)+
      yesNo('repairs','Tenta reparar quando não é compreendido?',current.repairs)+
    '</div>'+
    field('communicationExamples','Exemplos de comunicação observados','Registre palavras, gestos, frases, vocalizações, símbolos ou situações relevantes.',current.communicationExamples)
  ,true);

  out+=section('Compreensão','3 · LINGUAGEM RECEPTIVA',
    '<div class="assessment-v3-grid">'+
      yesNo('understandsSimple','Compreende ordens simples?',current.understandsSimple)+
      yesNo('understandsTwoStep','Compreende ordens com duas etapas?',current.understandsTwoStep)+
      yesNo('understandsContext','Compreende instruções dentro da rotina?',current.understandsContext)+
      yesNo('understandsFamily','Compreende falas/perguntas de familiares?',current.understandsFamily)+
      yesNo('recognizesFamily','Reconhece e identifica familiares/pessoas conhecidas?',current.recognizesFamily)+
      yesNo('understandsWhoWhatWhere','Compreende perguntas “quem / o quê / onde”?',current.understandsWhoWhatWhere)+
      yesNo('understandsWhenWhyHow','Compreende perguntas “quando / por quê / como”?',current.understandsWhenWhyHow)+
      yesNo('understandsConcepts','Compreende conceitos de cor, tamanho, quantidade, espaço e tempo?',current.understandsConcepts)+
    '</div>'+
    field('receptiveExamples','Exemplos / nível de ajuda necessário','Dê exemplos do que compreende sozinho, com repetição, gesto ou pista visual.',current.receptiveExamples)
  ,true);

  out+=section('Expressão','4 · LINGUAGEM EXPRESSIVA',
    '<div class="assessment-v3-grid">'+
      choice('expressionLevel','Nível expressivo predominante',['Não avaliado','Vocalizações','Palavras isoladas','Combinações de 2–3 palavras','Frases simples','Frases complexas / narrativa'],current.expressionLevel)+
      yesNo('namesObjects','Nomeia objetos, pessoas e ações?',current.namesObjects)+
      yesNo('callsFamily','Usa nomes/termos para familiares (ex.: mamãe, papai)?',current.callsFamily)+
      yesNo('asksQuestions','Faz perguntas espontaneamente?',current.asksQuestions)+
      yesNo('answersQuestions','Responde perguntas adequadamente?',current.answersQuestions)+
      yesNo('usesPronouns','Usa pronomes adequadamente?',current.usesPronouns)+
      yesNo('usesVerbs','Usa verbos e flexões de forma funcional?',current.usesVerbs)+
      yesNo('tellsEvents','Conta acontecimentos / experiências?',current.tellsEvents)+
    '</div>'+
    field('expressiveExamples','Exemplos de fala / linguagem','Frases produzidas, vocabulário, organização sintática, narrativa e dificuldades observadas.',current.expressiveExamples)
  ,true);

  out+=section('Pragmática e interação','5 · COMUNICAÇÃO SOCIAL',
    '<div class="assessment-v3-grid">'+
      yesNo('jointAttention','Compartilha atenção / interesse com outra pessoa?',current.jointAttention)+
      yesNo('maintainsTopic','Mantém tema de conversa?',current.maintainsTopic)+
      yesNo('interactsChildren','Interage com pares / outras crianças?',current.interactsChildren)+
      yesNo('interactsAdults','Interage com adultos?',current.interactsAdults)+
      yesNo('comments','Comenta para compartilhar interesse, não apenas pedir?',current.comments)+
      yesNo('requests','Realiza pedidos de forma funcional?',current.requests)+
      yesNo('refuses','Consegue recusar / dizer “não quero”?',current.refuses)+
      yesNo('socialRules','Compreende regras sociais simples / contexto comunicativo?',current.socialRules)+
    '</div>'+
    field('pragmaticNotes','Observações pragmáticas','Iniciativa, reciprocidade, flexibilidade, turnos, manutenção de tópico e adequação ao contexto.',current.pragmaticNotes)
  ,false);

  out+=section('Fala e fluência','6 · PRODUÇÃO ORAL',
    '<div class="assessment-v3-grid">'+
      yesNo('speechSoundChanges','Apresenta trocas, omissões ou distorções de sons?',current.speechSoundChanges)+
      choice('intelligibility','Inteligibilidade geral',['Não avaliado','Boa','Levemente reduzida','Moderadamente reduzida','Muito reduzida'],current.intelligibility)+
      yesNo('echolalia','Há ecolalia?',current.echolalia)+
      yesNo('disfluency','Há gagueira / disfluência?',current.disfluency)+
    '</div>'+
    field('speechNotes','Exemplos de fala','Registre trocas, omissões, palavras/frases produzidas e situações de maior dificuldade.',current.speechNotes)
  ,false);

  out+=section('Atenção, cognição e brincadeira','7 · ASPECTOS ASSOCIADOS',
    '<div class="assessment-v3-grid">'+
      choice('attention','Atenção',['Não avaliado','Sustentada','Oscilante','Difícil de manter'],current.attention)+
      choice('memory','Memória funcional',['Não avaliado','Boa','Regular','Prejudicada'],current.memory)+
      yesNo('imitation','Imita ações, sons ou palavras?',current.imitation)+
      yesNo('symbolicPlay','Demonstra brincadeira simbólica / faz de conta?',current.symbolicPlay)+
      yesNo('creativityPlay','Demonstra criatividade nas brincadeiras?',current.creativityPlay)+
      yesNo('repetitiveBehaviors','Apresenta comportamentos repetitivos?',current.repetitiveBehaviors)+
      yesNo('restrictedInterests','Apresenta interesses restritos / fixações?',current.restrictedInterests)+
      yesNo('routineChanges','Apresenta dificuldade com mudanças na rotina?',current.routineChanges)+
    '</div>'+
    field('sensory','Sensibilidades sensoriais','Auditiva, visual, tátil, oral ou outras respostas sensoriais relevantes.',current.sensory)
  ,false);

  out+=section('Audição e percepção','8 · AUDIÇÃO',
    '<div class="assessment-v3-grid">'+
      yesNo('hearingTest','Já realizou exame de audição?',current.hearingTest)+
      yesNo('reactsSounds','Reage a sons ambientes?',current.reactsSounds)+
      yesNo('ignoresSounds','Parece ignorar sons / vozes?',current.ignoresSounds)+
      yesNo('soundSensitivity','Assusta-se ou incomoda-se facilmente com barulhos?',current.soundSensitivity)+
    '</div>'+
    shortField('hearingResult','Resultado / data do exame','Informe resultado, data ou encaminhamento, se houver.',current.hearingResult)+
    field('hearingNotes','Observações auditivas','Situações em que responde melhor/pior, necessidade de repetição ou outras observações.',current.hearingNotes)
  ,false);

  out+=section('Alimentação e funções orais','9 · ALIMENTAÇÃO / MOTRICIDADE',
    '<div class="assessment-v3-grid">'+
      yesNo('feedingSelectivity','Apresenta seletividade alimentar?',current.feedingSelectivity)+
      yesNo('suckingDifficulty','Teve / tem dificuldade de sucção?',current.suckingDifficulty)+
      yesNo('bottlePacifier','Usou mamadeira ou chupeta?',current.bottlePacifier)+
      yesNo('swallowDifficulty','Apresenta dificuldade para engolir ou engasgos?',current.swallowDifficulty)+
    '</div>'+
    field('foods','Alimentos preferidos / recusados','Consistências, grupos alimentares, alimentos aceitos e recusados.',current.foods)+
    field('oralFunctions','Mastigação e movimentos orais','Lateralidade mastigatória, língua, lábios, coordenação e observações funcionais.',current.oralFunctions)
  ,false);

  if(pediatric){
    out+=section('Desenvolvimento infantil','10 · HISTÓRICO DO DESENVOLVIMENTO',
      '<div class="assessment-v3-grid">'+
        shortField('firstWords','Idade das primeiras palavras','Ex.: 1 ano e 6 meses',current.firstWords)+
        choice('pregnancyPlanned','Gestação planejada?',['Não informado','Sim','Não'],current.pregnancyPlanned)+
        choice('prenatal','Realizou pré-natal?',['Não informado','Sim','Não'],current.prenatal)+
        shortField('birthType','Tipo de parto','Normal, cesárea, fórceps...',current.birthType)+
        shortField('gestationalWeeks','Semanas ao nascer','Ex.: 39 semanas',current.gestationalWeeks)+
        shortField('birthWeight','Peso ao nascer','Ex.: 3,250 kg',current.birthWeight)+
        choice('nicu','UTI / incubadora?',['Não informado','Sim','Não'],current.nicu)+
        shortField('walkingAge','Idade em que começou a andar','Ex.: 1 ano e 2 meses',current.walkingAge)+
      '</div>'+
      field('pregnancyEvents','Intercorrências na gestação / parto','Doenças, medicações, quedas, prematuridade, internações ou outras intercorrências.',current.pregnancyEvents)+
      field('motorMilestones','Marcos motores','Sustentação de cabeça, sentar, engatinhar, andar e outras observações.',current.motorMilestones)
    ,false);
  }

  out+=section('Família, rotina e acompanhamentos','11 · CONTEXTO FUNCIONAL',
    '<div class="assessment-v3-grid">'+
      shortField('livesWith','Com quem mora?','Família / cuidadores',current.livesWith)+
      shortField('siblings','Irmãos','Quantidade, idades e relação, se relevante.',current.siblings)+
      shortField('schoolWork','Escola / trabalho','Turma, ano, instituição ou contexto profissional.',current.schoolWork)+
      shortField('professionals','Profissionais envolvidos','Fono, psicologia, TO, psicopedagogia, neurologia...',current.professionals)+
    '</div>'+
    field('routine','Rotina diária','Sono, alimentação, brincadeiras, escola/trabalho, terapias e organização diária.',current.routine)+
    field('familyInteraction','Interação com a família','Participação em momentos familiares, comunicação e comportamentos observados em casa.',current.familyInteraction)+
    field('previousInterventions','Intervenções anteriores','Acompanhamentos prévios, tempo de terapia, abordagens e resultados percebidos.',current.previousInterventions)
  ,false);

  return out;
}

function areaSpecificFields(area,current){
  current=current||{};
  if(area==='Linguagem')return section('Avaliação específica de Linguagem','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_receptiveDepth','Compreensão detalhada','Ordens, perguntas, conceitos, inferências, ambiguidades e compreensão em contexto.',current.area_receptiveDepth)+
      field('area_expressiveDepth','Expressão detalhada','Vocabulário, morfossintaxe, elaboração frasal, narrativa e recuperação lexical.',current.area_expressiveDepth)+
      field('area_pragmaticsDepth','Pragmática','Funções comunicativas, reciprocidade, turnos, tópico, inferência social e adequação.',current.area_pragmaticsDepth)+
      field('area_narrative','Narrativa / discurso','Sequência temporal, coerência, coesão, personagens, causalidade e reconto.',current.area_narrative)+
    '</div>',true);

  if(area==='Fala / Fonologia')return section('Avaliação específica de Fala / Fonologia','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_inventory','Inventário / sons observados','Sons presentes e ausentes, posição silábica e contextos de ocorrência.',current.area_inventory)+
      field('area_processes','Processos fonológicos / padrões','Substituições, omissões, simplificações, distorções e consistência.',current.area_processes)+
      field('area_intelligibility','Inteligibilidade','Impacto na comunicação, interlocutores que compreendem e situações de dificuldade.',current.area_intelligibility)+
      field('area_stimulability','Estimulabilidade','Resposta a modelo, pistas auditivas, visuais e táteis.',current.area_stimulability)+
    '</div>',true);

  if(area==='Motricidade Orofacial')return section('Avaliação específica de Motricidade Orofacial','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_structures','Estruturas','Lábios, língua, bochechas, palato, mandíbula, dentição, postura e simetria.',current.area_structures)+
      field('area_mobility','Mobilidade / tônus / coordenação','Amplitude, força, tônus, velocidade, precisão e coordenação.',current.area_mobility)+
      field('area_functions','Funções estomatognáticas','Respiração, mastigação, deglutição, sucção e fala.',current.area_functions)+
      field('area_habits','Hábitos / fatores associados','Respiração oral, hábitos deletérios, postura, dor, desconforto e sono.',current.area_habits)+
    '</div>',true);

  if(area==='Voz')return section('Avaliação específica de Voz','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_voiceQuality','Qualidade vocal','Rugosidade, soprosidade, tensão, instabilidade, ressonância e impressão perceptiva.',current.area_voiceQuality)+
      field('area_voiceParams','Parâmetros vocais','Pitch, loudness, ataque, coordenação pneumofonoarticulatória e tempo máximo de fonação.',current.area_voiceParams)+
      field('area_voiceSymptoms','Sintomas','Fadiga, dor, esforço, falhas, pigarro, sensação de corpo estranho e variação diária.',current.area_voiceSymptoms)+
      field('area_voiceDemand','Demanda / hábitos vocais','Uso profissional, intensidade, tempo de fala, hidratação, abuso e ambiente.',current.area_voiceDemand)+
    '</div>',true);

  if(area==='Fluência')return section('Avaliação específica de Fluência','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_ruptures','Tipos de ruptura','Repetições, prolongamentos, bloqueios e frequência observada.',current.area_ruptures)+
      field('area_tension','Tensão e comportamentos associados','Esforço, movimentos secundários, evitação e estratégias utilizadas.',current.area_tension)+
      field('area_contexts','Contextos de maior / menor fluência','Interlocutores, tarefas, leitura, fala espontânea e situações emocionais.',current.area_contexts)+
      field('area_impact','Impacto funcional','Participação, autoestima, escola/trabalho, relações e percepção do paciente/família.',current.area_impact)+
    '</div>',true);

  if(area==='Audição')return section('Avaliação específica de Audição','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_hearingHistory','Histórico auditivo','Otites, exposição a ruído, triagens, antecedentes e queixas.',current.area_hearingHistory)+
      field('area_hearingTests','Exames disponíveis','Exames, datas, resultados e encaminhamentos.',current.area_hearingTests)+
      field('area_hearingFunction','Desempenho funcional','Detecção, localização, discriminação e compreensão em diferentes ambientes.',current.area_hearingFunction)+
      field('area_devices','Dispositivos','AASI, implante, FM ou outros recursos e seu uso funcional.',current.area_devices)+
    '</div>',true);

  if(area==='Disfagia')return section('Avaliação específica de Disfagia','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_route','Via / condição alimentar','Via de alimentação, consistências, utensílios, postura e nível de ajuda.',current.area_route)+
      field('area_oralPhase','Fase oral','Captação, vedamento, mastigação, propulsão, resíduos e tempo de refeição.',current.area_oralPhase)+
      field('area_signs','Sinais clínicos','Tosse, engasgo, voz molhada, desconforto, fadiga e alterações respiratórias.',current.area_signs)+
      field('area_safety','Segurança / funcionalidade','Adaptações, supervisão, orientações e necessidade de investigação instrumental.',current.area_safety)+
    '</div>',true);

  if(area==='CAA / Comunicação')return section('Avaliação específica de CAA','MÓDULO ESPECÍFICO',
    '<div class="assessment-v3-grid">'+
      field('area_functions','Funções comunicativas prioritárias','Pedir, recusar, comentar, responder, socializar, reparar e outras necessidades.',current.area_functions)+
      field('area_currentMeans','Meios atuais','Fala, gestos, vocalizações, apontar, símbolos, dispositivos e estratégias.',current.area_currentMeans)+
      field('area_access','Acesso','Toque direto, apontar, olhar, varredura, acesso motor e necessidade de adaptações.',current.area_access)+
      field('area_contexts','Parceiros / ambientes','Família, escola, clínica e situações em que a comunicação precisa funcionar.',current.area_contexts)+
    '</div>',true);

  if(area==='Fonoaudiologia geral'){
    return '<div class="assessment-v3-general-all">'+
      areaSpecificFields('Linguagem',current)+areaSpecificFields('Fala / Fonologia',current)+areaSpecificFields('Motricidade Orofacial',current)+areaSpecificFields('Voz',current)+areaSpecificFields('Fluência',current)+areaSpecificFields('Audição',current)+areaSpecificFields('Disfagia',current)+areaSpecificFields('CAA / Comunicação',current)+
    '</div>';
  }

  return section('Avaliação específica','MÓDULO ESPECÍFICO',
    field('area_other','Aspectos específicos','Registre os aspectos clínicos específicos desta avaliação.',current.area_other)
  ,true);
}

function collectNamed(form,prefix){
  var out={};
  form.querySelectorAll('[name]').forEach(function(el){
    if(!prefix||el.name.indexOf(prefix)===0)out[el.name]=el.value;
  });
  return out;
}
function normalize(a){
  a=a||{};
  a.general=a.general||{};
  a.areaDetails=a.areaDetails||{};
  if(!a.conclusion&&a.summary)a.conclusion=a.summary;
  return a;
}

function assessmentForm(pid,existing){
  var d=load(),p=d.patients.find(function(x){return x.id===pid;});if(!p)return;
  existing=normalize(existing||{});
  var stage=existing.stage||stageFromPatient(p);
  var area=existing.mainArea||p.area||'Linguagem';
  if(AREAS.indexOf(area)<0)area='Linguagem';

  var w=modal(
    '<div class="assessment-v3-head">'+
      '<div><small>AVALIAÇÃO FONOAUDIOLÓGICA</small><h2>'+esc(existing.id?'Editar avaliação':'Nova avaliação')+'</h2><p>'+esc(p.name)+(patientAge(p)!==''?' · '+patientAge(p)+' anos':'')+' · formulário clínico completo</p></div>'+
      '<span>Fonely Clínico</span>'+
    '</div>'+
    '<form id="assessmentV3Form">'+
      '<div class="assessment-v3-top-grid">'+
        '<label>Tipo<select name="kind">'+selectOptions(['Avaliação inicial','Reavaliação','Triagem','Avaliação complementar'],existing.kind||'Avaliação inicial')+'</select></label>'+
        '<label>Data<input type="date" name="date" value="'+esc(existing.date||today())+'" required></label>'+
        '<label>Profissional<input name="professional" value="'+esc(existing.professional||'')+'" placeholder="Nome da profissional"></label>'+
        '<label>Perfil<select name="stage" id="assessmentStage">'+selectOptions(['Infantil','Adolescente','Adulto','Idoso'],stage)+'</select></label>'+
        '<label class="assessment-v3-area-select">Foco principal<select name="mainArea" id="assessmentMainArea">'+selectOptions(AREAS,area)+'</select></label>'+
        '<label>Protocolo / instrumento<input name="protocols" value="'+esc(existing.protocols||existing.protocol||'')+'" placeholder="Nome do protocolo, escala ou procedimento"></label>'+
      '</div>'+
      '<div class="assessment-v3-switch-note"><b>A avaliação muda conforme a área.</b><span>As perguntas gerais permanecem e o módulo específico abaixo é trocado automaticamente.</span></div>'+
      '<div id="assessmentGeneric">'+genericFields(existing.general,stage)+'</div>'+
      '<div class="assessment-v3-specific-title"><small>FOCO PRINCIPAL</small><h3 id="assessmentAreaTitle">'+esc(area)+'</h3></div>'+
      '<div id="assessmentAreaSpecific">'+areaSpecificFields(area,existing.areaDetails)+'</div>'+
      section('Síntese e plano clínico','FINALIZAÇÃO',
        '<div class="assessment-v3-grid">'+
          field('conditions','Condições da avaliação','Participação, ambiente, necessidade de apoio, intercorrências e limitações do registro.',existing.conditions)+
          field('conclusion','Síntese dos achados','Integre os principais achados clínicos desta avaliação.',existing.conclusion)+
          field('goals','Objetivos terapêuticos iniciais','Prioridades e metas clínicas iniciais.',existing.goals)+
          field('plan','Conduta / próximos passos','Terapia, frequência, reavaliação, encaminhamentos e próximos passos.',existing.plan)+
          field('guidance','Orientações ao paciente / família','Orientações realizadas ao final da avaliação.',existing.guidance)+
          field('referrals','Encaminhamentos','Outros profissionais, exames ou avaliações complementares, se necessário.',existing.referrals)+
        '</div>',true)+
      '<div class="assessment-v3-actions"><button type="button" class="soft-btn" data-assess-cancel>Cancelar</button><button class="primary">Salvar avaliação completa</button></div>'+
    '</form>'
  );

  var form=w.querySelector('#assessmentV3Form');
  var stageSelect=form.querySelector('#assessmentStage');
  var areaSelect=form.querySelector('#assessmentMainArea');
  var genericHost=form.querySelector('#assessmentGeneric');
  var areaHost=form.querySelector('#assessmentAreaSpecific');
  var areaTitle=form.querySelector('#assessmentAreaTitle');
  var generalDraft=Object.assign({},existing.general||{});
  var areaDrafts={};
  areaDrafts[area]=Object.assign({},existing.areaDetails||{});
  var currentArea=area;

  stageSelect.onchange=function(){
    generalDraft=collectNamed(genericHost);
    genericHost.innerHTML=genericFields(generalDraft,this.value);
  };

  areaSelect.onchange=function(){
    areaDrafts[currentArea]=collectNamed(areaHost,'area_');
    currentArea=this.value;
    areaTitle.textContent=currentArea;
    areaHost.innerHTML=areaSpecificFields(currentArea,areaDrafts[currentArea]||{});
  };

  w.querySelector('[data-assess-cancel]').onclick=function(){w.remove();};

  form.onsubmit=function(e){
    e.preventDefault();
    var fd=new FormData(form);
    generalDraft=collectNamed(genericHost);
    areaDrafts[currentArea]=collectNamed(areaHost,'area_');

    var obj={
      id:existing.id||uid(),
      patientId:pid,
      kind:fd.get('kind'),
      date:fd.get('date'),
      professional:fd.get('professional'),
      stage:fd.get('stage'),
      mainArea:fd.get('mainArea'),
      protocols:fd.get('protocols'),
      general:generalDraft,
      areaDetails:areaDrafts[currentArea]||{},
      conditions:fd.get('conditions'),
      conclusion:fd.get('conclusion'),
      summary:fd.get('conclusion'),
      goals:fd.get('goals'),
      plan:fd.get('plan'),
      guidance:fd.get('guidance'),
      referrals:fd.get('referrals'),
      updatedAt:new Date().toISOString()
    };

    var idx=d.assessments.findIndex(function(x){return x.id===obj.id;});
    if(idx>=0)d.assessments[idx]=obj;else d.assessments.push(obj);
    save(d);
    w.remove();
    renderPatientAssessments(pid);
    mountPage(true);
  };
}

function keyLabel(k){
  var map={
    chiefComplaint:'Queixa principal',complaintHistory:'Histórico da queixa',familyConcern:'Principal preocupação',
    communicationMode:'Forma de comunicação',communicativeIntent:'Intenção comunicativa',respondsName:'Resposta ao nome',
    points:'Apontar',eyeContact:'Contato visual',takesTurns:'Trocas de turno',understandsSimple:'Ordens simples',
    understandsTwoStep:'Ordens de duas etapas',understandsFamily:'Compreensão da família',
    understandsWhoWhatWhere:'Perguntas quem/o quê/onde',understandsWhenWhyHow:'Perguntas quando/por quê/como',
    expressionLevel:'Nível expressivo',namesObjects:'Nomeação',callsFamily:'Nomes de familiares',asksQuestions:'Faz perguntas',
    answersQuestions:'Responde perguntas',echolalia:'Ecolalia',disfluency:'Disfluência'
  };
  if(map[k])return map[k];
  return k.replace(/^area_/,'').replace(/([A-Z])/g,' $1').replace(/^./,function(c){return c.toUpperCase();});
}
function readMap(obj){
  obj=obj||{};
  var keys=Object.keys(obj).filter(function(k){return String(obj[k]||'').trim()!=='';});
  if(!keys.length)return '<p class="assessment-v3-empty-read">Sem informações registradas.</p>';
  return '<div class="assessment-v3-read-grid">'+keys.map(function(k){return '<div><small>'+esc(keyLabel(k))+'</small><p>'+esc(obj[k])+'</p></div>';}).join('')+'</div>';
}

function detail(pid,aid){
  var d=load(),a=d.assessments.find(function(x){return x.id===aid;});if(!a)return;
  a=normalize(a);
  var w=modal(
    '<div class="assessment-v3-head"><div><small>REGISTRO DE AVALIAÇÃO</small><h2>'+esc(a.kind||'Avaliação')+'</h2><p>'+esc(pname(d,pid))+' · '+fmt(a.date)+(a.professional?' · '+esc(a.professional):'')+'</p></div><span>'+esc(a.mainArea||a.area||'Geral')+'</span></div>'+
    section('Informações gerais','REGISTRO',readMap(a.general),true)+
    section('Módulo específico · '+(a.mainArea||a.area||'Geral'),'ÁREA CLÍNICA',readMap(a.areaDetails),true)+
    section('Síntese e plano','FINALIZAÇÃO',
      '<div class="assessment-v3-read-grid">'+
        '<div><small>Condições</small><p>'+esc(a.conditions||'—')+'</p></div>'+
        '<div><small>Síntese</small><p>'+esc(a.conclusion||a.summary||'—')+'</p></div>'+
        '<div><small>Objetivos</small><p>'+esc(a.goals||'—')+'</p></div>'+
        '<div><small>Conduta</small><p>'+esc(a.plan||'—')+'</p></div>'+
        '<div><small>Orientações</small><p>'+esc(a.guidance||'—')+'</p></div>'+
        '<div><small>Encaminhamentos</small><p>'+esc(a.referrals||'—')+'</p></div>'+
      '</div>',true)+
    '<div class="assessment-v3-actions"><button class="primary" data-edit-assessment>Editar avaliação</button></div>'
  );
  w.querySelector('[data-edit-assessment]').onclick=function(){assessmentForm(pid,a);};
}

function cardsForPatient(d,pid){
  var list=d.assessments.filter(function(x){return x.patientId===pid;}).sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
  if(!list.length)return '<div class="assessment-v3-empty"><b>Nenhuma avaliação registrada</b><span>Crie a primeira avaliação completa deste paciente.</span></div>';
  return '<div class="assessment-v3-timeline">'+list.map(function(a){
    return '<button class="assessment-v3-card" data-assessment-view="'+a.id+'"><div><small>'+esc(a.kind||'Avaliação')+' · '+fmt(a.date)+'</small><b>'+esc(a.mainArea||a.area||'Geral')+'</b><p>'+esc(a.conclusion||a.summary||'Sem síntese registrada.')+'</p></div><strong>→</strong></button>';
  }).join('')+'</div>';
}
function bindAssessmentButtons(host,pid){
  host.querySelectorAll('[data-assessment-view]').forEach(function(b){b.onclick=function(){detail(pid,b.getAttribute('data-assessment-view'));};});
  var n=host.querySelector('[data-new-assessment]');if(n)n.onclick=function(){assessmentForm(pid);};
}
function renderPatientAssessments(pid){
  var d=load(),p=d.patients.find(function(x){return x.id===pid;});if(!p)return;
  close();
  var w=modal('<div class="assessment-v3-head"><div><small>PRONTUÁRIO · AVALIAÇÕES</small><h2>'+esc(p.name)+'</h2><p>Avaliações completas organizadas por data.</p></div><button class="primary" data-new-assessment>+ Nova avaliação</button></div>'+cardsForPatient(d,pid));
  bindAssessmentButtons(w,pid);
}

function pageList(d,list){
  if(!list.length)return '<div class="assessment-v3-empty"><b>Nenhuma avaliação registrada</b><span>Comece selecionando um paciente e criando uma avaliação.</span></div>';
  return '<div class="assessment-v3-page-list">'+list.map(function(a){
    return '<button data-page-open="'+a.patientId+'|'+a.id+'"><div class="assessment-v3-page-icon">◇</div><div><small>'+esc(a.kind||'Avaliação')+' · '+fmt(a.date)+'</small><b>'+esc(pname(d,a.patientId))+'</b><span>'+esc(a.mainArea||a.area||'Geral')+' · '+esc(a.conclusion||a.summary||'Sem síntese')+'</span></div><strong>→</strong></button>';
  }).join('')+'</div>';
}
function pageHTML(){
  var d=load(),total=d.assessments.length,re=d.assessments.filter(function(x){return x.kind==='Reavaliação';}).length,patients={};
  d.assessments.forEach(function(x){patients[x.patientId]=1;});
  var latest=d.assessments.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
  return '<section class="fonely-assessment-v3">'+
    '<div class="assessment-v3-page-hero"><div><small>AVALIAÇÃO CLÍNICA · FONELY</small><h2>Avaliação completa e adaptada à área</h2><p>A parte geral investiga comunicação, compreensão, expressão, família, rotina, audição e desenvolvimento. O módulo específico muda conforme o foco principal.</p></div><button class="primary" data-page-new>+ Nova avaliação</button></div>'+
    '<div class="assessment-v3-stats"><div><b>'+total+'</b><span>Avaliações</span></div><div><b>'+re+'</b><span>Reavaliações</span></div><div><b>'+Object.keys(patients).length+'</b><span>Pacientes avaliados</span></div></div>'+
    '<article class="panel assessment-v3-page-panel"><div class="panel-title"><h3>Histórico de avaliações</h3><select data-assessment-filter><option value="">Todos os pacientes</option>'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></div><div data-assessment-page-list>'+pageList(d,latest)+'</div></article>'+
  '</section>';
}
function choosePatient(){
  var d=load();if(!d.patients.length){alert('Cadastre um paciente antes de criar uma avaliação.');return;}
  var w=modal('<div class="assessment-v3-head"><div><small>NOVA AVALIAÇÃO</small><h2>Escolha o paciente</h2><p>O registro será salvo no prontuário clínico.</p></div></div><label>Paciente<select id="assessmentPatientSelect">'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></label><div class="assessment-v3-actions"><button class="primary" data-continue-assessment>Continuar</button></div>');
  w.querySelector('[data-continue-assessment]').onclick=function(){assessmentForm(w.querySelector('#assessmentPatientSelect').value);};
}
function bindPageList(host){
  host.querySelectorAll('[data-page-open]').forEach(function(b){b.onclick=function(){var p=b.getAttribute('data-page-open').split('|');detail(p[0],p[1]);};});
}
function bindPage(host){
  var d=load(),newBtn=host.querySelector('[data-page-new]');if(newBtn)newBtn.onclick=choosePatient;
  var filter=host.querySelector('[data-assessment-filter]');
  if(filter)filter.onchange=function(){
    var list=d.assessments.filter(function(a){return !filter.value||a.patientId===filter.value;}).sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    host.querySelector('[data-assessment-page-list]').innerHTML=pageList(d,list);bindPageList(host);
  };
  bindPageList(host);
}
function mountPage(force){
  var h1=[].slice.call(document.querySelectorAll('h1')).find(function(x){return x.textContent.trim()==='Avaliações';});
  if(!h1)return;
  var main=h1.closest('main');if(!main)return;
  var old=main.querySelector('.fonely-assessment-v3');if(old&&!force)return;
  var old2=main.querySelector('.fonely-assessment-v2');if(old2)old2.remove();
  if(old)old.remove();
  [].slice.call(main.children).forEach(function(x){if(x.tagName!=='HEADER')x.remove();});
  var host=document.createElement('div');host.innerHTML=pageHTML();main.appendChild(host.firstElementChild);
  bindPage(main.querySelector('.fonely-assessment-v3'));
}

document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('[data-parea="assess"]');if(!b)return;
  var head=b.closest('.layout')&&document.querySelector('.patient-head h2');if(!head)return;
  var d=load(),p=d.patients.find(function(x){return x.name===head.textContent.trim();});if(!p)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();renderPatientAssessments(p.id);
},true);

var obs=new MutationObserver(function(){mountPage(false);});
obs.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){mountPage(false);});
setTimeout(function(){mountPage(false);},120);
setTimeout(function(){mountPage(false);},500);

})();