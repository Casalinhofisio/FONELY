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
  if(a.customTemplateId||a.customMode){
    var currentTemplate=(d.assessmentTemplates||[]).find(function(x){return x.id===a.customTemplateId;});
    var t=normalizeTemplate(JSON.parse(JSON.stringify(a.customSnapshot||currentTemplate||{id:a.customTemplateId||uid(),name:a.customTemplateName||'Modelo personalizado',mode:a.customMode||'form',sections:[]})));
    var wCustom=modal(
      '<div class="assessment-v3-head"><div><small>AVALIAÇÃO PERSONALIZADA</small><h2>'+esc(a.customTemplateName||t.name)+'</h2><p>'+esc(pname(d,pid))+' · '+fmt(a.date)+(a.professional?' · '+esc(a.professional):'')+'</p></div><span>Meu modelo</span></div>'+
      customAssessmentRead(a)+
      section('Síntese / observações finais','FINALIZAÇÃO','<div class="assessment-custom-document-read">'+esc(a.summary||'—').replace(/\\n/g,'<br>')+'</div>',true)+
      '<div class="assessment-v3-actions"><button class="primary" data-edit-custom-assessment>Editar avaliação</button></div>'
    );
    wCustom.querySelector('[data-edit-custom-assessment]').onclick=function(){customAssessmentForm(pid,t,a);};
    return;
  }
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
  var n=host.querySelector('[data-new-assessment]');if(n)n.onclick=function(){chooseAssessmentType(pid);};
}
function renderPatientAssessments(pid){
  var d=load(),p=d.patients.find(function(x){return x.id===pid;});if(!p)return;
  close();
  var w=modal('<div class="assessment-v3-head"><div><small>PRONTUÁRIO · AVALIAÇÕES</small><h2>'+esc(p.name)+'</h2><p>Avaliações completas organizadas por data.</p></div><button class="primary" data-new-assessment>+ Nova avaliação</button></div>'+cardsForPatient(d,pid));
  bindAssessmentButtons(w,pid);
}

function customQuestionTypes(){
  return [
    ['short','Texto curto'],
    ['long','Texto longo'],
    ['yesno','Sim / Não / Às vezes'],
    ['single','Escolha única'],
    ['multi','Múltipla escolha'],
    ['number','Número'],
    ['date','Data'],
    ['scale','Escala de 0 a 10']
  ];
}
function questionTypeLabel(type){
  var x=customQuestionTypes().find(function(i){return i[0]===type;});
  return x?x[1]:'Texto';
}
function newTemplateSection(){
  return {id:uid(),title:'Nova seção',questions:[]};
}
function newTemplateQuestion(){
  return {id:uid(),label:'Nova pergunta',type:'long',required:false,options:[]};
}
function normalizeTemplate(t){
  t=t||{};
  t.id=t.id||uid();
  t.name=t.name||'Meu modelo';
  t.description=t.description||'';
  t.mode=t.mode==='document'?'document':'form';
  t.sections=Array.isArray(t.sections)?t.sections:[newTemplateSection()];
  t.sections.forEach(function(sec){
    sec.id=sec.id||uid();sec.title=sec.title||'Seção';
    sec.questions=Array.isArray(sec.questions)?sec.questions:[];
    sec.questions.forEach(function(q){
      q.id=q.id||uid();q.label=q.label||'Pergunta';q.type=q.type||'long';q.required=!!q.required;
      q.options=Array.isArray(q.options)?q.options:[];
    });
  });
  t.documentBody=t.documentBody||'';
  t.attachment=t.attachment||null;
  return t;
}
function templateCards(d){
  var list=(d.assessmentTemplates||[]).slice().sort(function(a,b){return (b.updatedAt||'').localeCompare(a.updatedAt||'');});
  if(!list.length)return '<div class="assessment-template-empty"><b>Nenhum modelo personalizado ainda</b><span>Crie seu próprio formulário ou documento para reutilizar em qualquer paciente.</span></div>';
  return '<div class="assessment-template-list">'+list.map(function(t){
    t=normalizeTemplate(t);
    var count=t.sections.reduce(function(sum,sec){return sum+sec.questions.length;},0);
    return '<article class="assessment-template-card">'+
      '<div class="assessment-template-icon">'+(t.mode==='document'?'▤':'☷')+'</div>'+
      '<div class="assessment-template-main"><small>'+(t.mode==='document'?'MODO DOCUMENTO':'FORMULÁRIO PERSONALIZADO')+'</small><b>'+esc(t.name)+'</b><p>'+esc(t.description||'Modelo personalizado da profissional.')+'</p><span>'+(t.mode==='document'?'Texto livre'+(t.attachment?' · '+esc(t.attachment.name):''):count+' pergunta'+(count===1?'':'s'))+'</span></div>'+
      '<div class="assessment-template-actions"><button class="primary mini" data-template-use="'+t.id+'">Usar</button><button class="soft-btn mini" data-template-edit="'+t.id+'">Editar</button><button class="soft-btn mini" data-template-duplicate="'+t.id+'">Duplicar</button><button class="danger-btn mini" data-template-delete="'+t.id+'">Excluir</button></div>'+
    '</article>';
  }).join('')+'</div>';
}
function templateBuilderQuestion(q,si,qi){
  var typeOptions=customQuestionTypes().map(function(x){return '<option value="'+x[0]+'" '+(q.type===x[0]?'selected':'')+'>'+esc(x[1])+'</option>';}).join('');
  var needsOptions=(q.type==='single'||q.type==='multi');
  return '<div class="assessment-builder-question" data-builder-question="'+si+'|'+qi+'">'+
    '<div class="assessment-builder-drag">⋮⋮</div>'+
    '<div class="assessment-builder-question-main">'+
      '<input class="assessment-builder-question-label" data-builder-label value="'+esc(q.label)+'" placeholder="Digite a pergunta">'+
      '<div class="assessment-builder-question-settings">'+
        '<select data-builder-type>'+typeOptions+'</select>'+
        '<label class="builder-required"><input type="checkbox" data-builder-required '+(q.required?'checked':'')+'> Obrigatória</label>'+
        (needsOptions?'<input data-builder-options value="'+esc((q.options||[]).join(' | '))+'" placeholder="Opções separadas por |">':'')+
      '</div>'+
    '</div>'+
    '<div class="assessment-builder-question-actions"><button type="button" data-q-up title="Subir">↑</button><button type="button" data-q-down title="Descer">↓</button><button type="button" data-q-duplicate title="Duplicar">⧉</button><button type="button" data-q-delete title="Excluir">×</button></div>'+
  '</div>';
}
function templateBuilderSection(sec,si){
  return '<section class="assessment-builder-section" data-builder-section="'+si+'">'+
    '<div class="assessment-builder-section-head"><input data-builder-section-title value="'+esc(sec.title)+'" placeholder="Nome da seção"><div><button type="button" data-section-up>↑</button><button type="button" data-section-down>↓</button><button type="button" data-section-delete>Excluir seção</button></div></div>'+
    '<div class="assessment-builder-questions">'+
      sec.questions.map(function(q,qi){return templateBuilderQuestion(q,si,qi);}).join('')+
      (!sec.questions.length?'<div class="assessment-builder-empty">Nenhuma pergunta nesta seção.</div>':'')+
    '</div>'+
    '<button type="button" class="soft-btn assessment-builder-add-q" data-add-question="'+si+'">+ Adicionar pergunta</button>'+
  '</section>';
}
function builderContent(t){
  if(t.mode==='document'){
    return '<div class="assessment-document-builder">'+
      '<div class="assessment-v3-switch-note"><b>Modo Documento</b><span>Escreva um modelo livre para ser preenchido dentro do Fonely. Você também pode anexar um Word ou PDF como referência.</span></div>'+
      '<label>Conteúdo / modelo do documento<textarea data-builder-document placeholder="Escreva títulos, orientações e a estrutura do documento...">'+esc(t.documentBody||'')+'</textarea></label>'+
      '<div class="assessment-document-attachment">'+
        '<div><small>WORD / PDF DE REFERÊNCIA</small><b>'+(t.attachment?esc(t.attachment.name):'Nenhum arquivo anexado')+'</b><span>'+(t.attachment?'O arquivo fica privado na conta da profissional.':'DOC, DOCX ou PDF · até 10 MB')+'</span></div>'+
        '<div class="assessment-document-actions"><input type="file" data-builder-file accept=".doc,.docx,.pdf" hidden><button type="button" class="soft-btn" data-builder-file-btn>'+(t.attachment?'Trocar arquivo':'Anexar Word/PDF')+'</button>'+(t.attachment?'<button type="button" class="soft-btn" data-builder-file-open>Abrir</button><button type="button" class="danger-btn" data-builder-file-remove>Remover</button>':'')+'</div>'+
      '</div>'+
    '</div>';
  }
  return '<div class="assessment-builder-sections">'+
    t.sections.map(function(sec,si){return templateBuilderSection(sec,si);}).join('')+
    '<button type="button" class="soft-btn assessment-builder-add-section" data-add-section>+ Adicionar seção</button>'+
  '</div>';
}
function syncBuilderFromDOM(w,t){
  var name=w.querySelector('[data-template-name]'),desc=w.querySelector('[data-template-description]'),mode=w.querySelector('[data-template-mode]');
  if(name)t.name=name.value.trim();
  if(desc)t.description=desc.value.trim();
  if(mode)t.mode=mode.value;
  if(t.mode==='document'){
    var doc=w.querySelector('[data-builder-document]');if(doc)t.documentBody=doc.value;
    return t;
  }
  var sections=[];
  w.querySelectorAll('[data-builder-section]').forEach(function(secEl){
    var sec={id:(t.sections[Number(secEl.getAttribute('data-builder-section'))]||{}).id||uid(),title:(secEl.querySelector('[data-builder-section-title]')||{}).value||'Seção',questions:[]};
    secEl.querySelectorAll('[data-builder-question]').forEach(function(qEl){
      var parts=qEl.getAttribute('data-builder-question').split('|'),old=((t.sections[Number(parts[0])]||{}).questions||[])[Number(parts[1])]||{};
      var q={
        id:old.id||uid(),
        label:(qEl.querySelector('[data-builder-label]')||{}).value||'Pergunta',
        type:(qEl.querySelector('[data-builder-type]')||{}).value||'long',
        required:!!((qEl.querySelector('[data-builder-required]')||{}).checked),
        options:[]
      };
      var op=qEl.querySelector('[data-builder-options]');
      if(op)q.options=op.value.split('|').map(function(x){return x.trim();}).filter(Boolean);
      else q.options=Array.isArray(old.options)?old.options:[];
      sec.questions.push(q);
    });
    sections.push(sec);
  });
  if(sections.length)t.sections=sections;
  return t;
}
async function uploadTemplateFile(file,t,w){
  var cloud=window.FonelyCloud,sb=cloud&&cloud.supabase,user=cloud&&cloud.user;
  var msg=w.querySelector('[data-builder-message]');
  if(!sb||!user){msg.textContent='Não foi possível acessar o armazenamento do Fonely.';msg.className='assessment-builder-message error';return;}
  var ext=String(file.name||'').split('.').pop().toLowerCase();
  if(['doc','docx','pdf'].indexOf(ext)<0){msg.textContent='Use um arquivo Word (.doc/.docx) ou PDF.';msg.className='assessment-builder-message error';return;}
  if(file.size>10*1024*1024){msg.textContent='O arquivo pode ter no máximo 10 MB.';msg.className='assessment-builder-message error';return;}
  var mime=file.type||({'doc':'application/msword','docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','pdf':'application/pdf'}[ext]);
  var path=user.id+'/templates/'+t.id+'-'+Date.now()+'.'+ext;
  msg.textContent='Enviando arquivo...';msg.className='assessment-builder-message show';
  var up=await sb.storage.from('form-template-files').upload(path,file,{contentType:mime,upsert:false});
  if(up.error){msg.textContent='Não foi possível enviar o arquivo. '+up.error.message;msg.className='assessment-builder-message error';return;}
  if(t.attachment&&t.attachment.path)sb.storage.from('form-template-files').remove([t.attachment.path]).then(function(){});
  t.attachment={name:file.name,path:path,mime:mime,size:file.size};
  msg.textContent='Arquivo anexado.';msg.className='assessment-builder-message success';
}
async function openTemplateAttachment(t){
  var cloud=window.FonelyCloud,sb=cloud&&cloud.supabase;
  if(!sb||!t.attachment||!t.attachment.path)return;
  var r=await sb.storage.from('form-template-files').createSignedUrl(t.attachment.path,120);
  if(r.error){alert('Não foi possível abrir o arquivo agora.');return;}
  window.open(r.data.signedUrl,'_blank','noopener');
}
async function removeTemplateAttachment(t,w){
  if(!t.attachment)return;
  var cloud=window.FonelyCloud,sb=cloud&&cloud.supabase,path=t.attachment.path;
  t.attachment=null;
  if(sb&&path)await sb.storage.from('form-template-files').remove([path]);
}
function templateBuilder(existing){
  var d=load(),source=existing?JSON.parse(JSON.stringify(existing)):null;
  var t=normalizeTemplate(source||{id:uid(),name:'Meu modelo',description:'',mode:'form',sections:[newTemplateSection()],documentBody:'',attachment:null});
  var w=modal(
    '<div class="assessment-v3-head"><div><small>CONSTRUTOR PERSONALIZADO</small><h2>'+(existing?'Editar modelo':'Criar meu modelo')+'</h2><p>Monte a avaliação do seu jeito e reutilize depois em qualquer paciente.</p></div><span>Fonely Builder</span></div>'+
    '<div class="assessment-builder-top">'+
      '<label>Nome do modelo<input data-template-name value="'+esc(t.name)+'" placeholder="Ex.: Avaliação de linguagem da clínica"></label>'+
      '<label>Descrição<input data-template-description value="'+esc(t.description)+'" placeholder="Para que serve este modelo?"></label>'+
      '<label>Modo<select data-template-mode><option value="form" '+(t.mode==='form'?'selected':'')+'>Formulário</option><option value="document" '+(t.mode==='document'?'selected':'')+'>Documento</option></select></label>'+
    '</div>'+
    '<div data-builder-host>'+builderContent(t)+'</div>'+
    '<div class="assessment-builder-message" data-builder-message></div>'+
    '<div class="assessment-v3-actions"><button type="button" class="soft-btn" data-builder-cancel>Cancelar</button><button type="button" class="primary" data-builder-save>Salvar modelo</button></div>'
  );
  var host=w.querySelector('[data-builder-host]');
  function rerender(){host.innerHTML=builderContent(t);bindContent();}
  function bindContent(){
    w.querySelectorAll('[data-builder-type]').forEach(function(sel){sel.onchange=function(){syncBuilderFromDOM(w,t);rerender();};});
    w.querySelectorAll('[data-add-question]').forEach(function(btn){btn.onclick=function(){syncBuilderFromDOM(w,t);var si=Number(btn.getAttribute('data-add-question'));t.sections[si].questions.push(newTemplateQuestion());rerender();};});
    var addSec=w.querySelector('[data-add-section]');if(addSec)addSec.onclick=function(){syncBuilderFromDOM(w,t);t.sections.push(newTemplateSection());rerender();};
    w.querySelectorAll('[data-builder-question]').forEach(function(row){
      var parts=row.getAttribute('data-builder-question').split('|'),si=Number(parts[0]),qi=Number(parts[1]);
      var up=row.querySelector('[data-q-up]'),down=row.querySelector('[data-q-down]'),dup=row.querySelector('[data-q-duplicate]'),del=row.querySelector('[data-q-delete]');
      if(up)up.onclick=function(){syncBuilderFromDOM(w,t);if(qi>0){var x=t.sections[si].questions.splice(qi,1)[0];t.sections[si].questions.splice(qi-1,0,x);rerender();}};
      if(down)down.onclick=function(){syncBuilderFromDOM(w,t);if(qi<t.sections[si].questions.length-1){var x=t.sections[si].questions.splice(qi,1)[0];t.sections[si].questions.splice(qi+1,0,x);rerender();}};
      if(dup)dup.onclick=function(){syncBuilderFromDOM(w,t);var q=JSON.parse(JSON.stringify(t.sections[si].questions[qi]));q.id=uid();q.label=q.label+' (cópia)';t.sections[si].questions.splice(qi+1,0,q);rerender();};
      if(del)del.onclick=function(){syncBuilderFromDOM(w,t);t.sections[si].questions.splice(qi,1);rerender();};
    });
    w.querySelectorAll('[data-builder-section]').forEach(function(secEl){
      var si=Number(secEl.getAttribute('data-builder-section')),up=secEl.querySelector('[data-section-up]'),down=secEl.querySelector('[data-section-down]'),del=secEl.querySelector('[data-section-delete]');
      if(up)up.onclick=function(){syncBuilderFromDOM(w,t);if(si>0){var x=t.sections.splice(si,1)[0];t.sections.splice(si-1,0,x);rerender();}};
      if(down)down.onclick=function(){syncBuilderFromDOM(w,t);if(si<t.sections.length-1){var x=t.sections.splice(si,1)[0];t.sections.splice(si+1,0,x);rerender();}};
      if(del)del.onclick=function(){syncBuilderFromDOM(w,t);if(t.sections.length===1){alert('O formulário precisa ter pelo menos uma seção.');return;}t.sections.splice(si,1);rerender();};
    });
    var fileBtn=w.querySelector('[data-builder-file-btn]'),fileInput=w.querySelector('[data-builder-file]');
    if(fileBtn&&fileInput){fileBtn.onclick=function(){fileInput.click();};fileInput.onchange=async function(){if(fileInput.files&&fileInput.files[0]){syncBuilderFromDOM(w,t);await uploadTemplateFile(fileInput.files[0],t,w);rerender();}};}
    var open=w.querySelector('[data-builder-file-open]');if(open)open.onclick=function(){openTemplateAttachment(t);};
    var remove=w.querySelector('[data-builder-file-remove]');if(remove)remove.onclick=async function(){await removeTemplateAttachment(t,w);rerender();};
  }
  w.querySelector('[data-template-mode]').onchange=function(){var next=this.value;this.value=t.mode;syncBuilderFromDOM(w,t);t.mode=next;this.value=next;if(t.mode==='form'&&!t.sections.length)t.sections=[newTemplateSection()];rerender();};
  w.querySelector('[data-builder-cancel]').onclick=function(){w.remove();};
  w.querySelector('[data-builder-save]').onclick=function(){
    syncBuilderFromDOM(w,t);
    var msg=w.querySelector('[data-builder-message]');
    if(!t.name.trim()){msg.textContent='Dê um nome ao modelo.';msg.className='assessment-builder-message error';return;}
    if(t.mode==='form'){
      var qCount=t.sections.reduce(function(sum,sec){return sum+sec.questions.filter(function(q){return q.label.trim();}).length;},0);
      if(!qCount){msg.textContent='Adicione pelo menos uma pergunta ao formulário.';msg.className='assessment-builder-message error';return;}
    }else if(!t.documentBody.trim()&&!t.attachment){
      msg.textContent='Escreva o documento ou anexe um Word/PDF.';msg.className='assessment-builder-message error';return;
    }
    t.updatedAt=new Date().toISOString();if(!t.createdAt)t.createdAt=t.updatedAt;
    var data=load(),idx=data.assessmentTemplates.findIndex(function(x){return x.id===t.id;});
    if(idx>=0)data.assessmentTemplates[idx]=t;else data.assessmentTemplates.push(t);
    save(data);w.remove();mountPage(true);
  };
  bindContent();
}
function renderCustomQuestion(q,value){
  var req=q.required?' required':'',name='custom_'+q.id,label=esc(q.label)+(q.required?' *':'');
  if(q.type==='long')return '<label>'+label+'<textarea name="'+name+'"'+req+'>'+esc(value||'')+'</textarea></label>';
  if(q.type==='yesno')return '<label>'+label+'<select name="'+name+'"'+req+'><option value="">Selecione</option>'+selectOptions(['Sim','Não','Às vezes / parcialmente'],value||'')+'</select></label>';
  if(q.type==='single')return '<label>'+label+'<select name="'+name+'"'+req+'><option value="">Selecione</option>'+selectOptions(q.options||[],value||'')+'</select></label>';
  if(q.type==='multi'){
    var vals=Array.isArray(value)?value:[];
    return '<fieldset class="assessment-custom-multi"><legend>'+label+'</legend>'+(q.options||[]).map(function(op){return '<label><input type="checkbox" name="'+name+'" value="'+esc(op)+'" '+(vals.indexOf(op)>=0?'checked':'')+'> '+esc(op)+'</label>';}).join('')+'</fieldset>';
  }
  if(q.type==='number')return '<label>'+label+'<input type="number" name="'+name+'" value="'+esc(value||'')+'"'+req+'></label>';
  if(q.type==='date')return '<label>'+label+'<input type="date" name="'+name+'" value="'+esc(value||'')+'"'+req+'></label>';
  if(q.type==='scale')return '<label>'+label+'<select name="'+name+'"'+req+'><option value="">Selecione</option>'+selectOptions(['0','1','2','3','4','5','6','7','8','9','10'],String(value==null?'':value))+'</select></label>';
  return '<label>'+label+'<input name="'+name+'" value="'+esc(value||'')+'"'+req+'></label>';
}
function collectCustomAnswers(form,t){
  var out={};
  t.sections.forEach(function(sec){sec.questions.forEach(function(q){
    var name='custom_'+q.id;
    if(q.type==='multi')out[q.id]=[].slice.call(form.querySelectorAll('[name="'+name+'"]:checked')).map(function(x){return x.value;});
    else{var el=form.querySelector('[name="'+name+'"]');out[q.id]=el?el.value:'';}
  });});
  return out;
}
function customAssessmentForm(pid,t,existing){
  var d=load(),p=d.patients.find(function(x){return x.id===pid;});if(!p)return;
  t=normalizeTemplate(JSON.parse(JSON.stringify(t)));existing=existing||{};
  var snapshot=existing.customSnapshot||t,answers=existing.customAnswers||{};
  var body='';
  if(t.mode==='document'){
    body='<div class="assessment-v3-switch-note"><b>Modo Documento</b><span>Edite livremente o conteúdo abaixo. O resultado será salvo no prontuário do paciente.</span></div>'+
      (t.attachment?'<div class="assessment-custom-reference"><div><small>ANEXO DO MODELO</small><b>'+esc(t.attachment.name)+'</b></div><button type="button" class="soft-btn" data-custom-open-reference>Abrir referência</button></div>':'')+
      '<label>Documento<textarea class="assessment-custom-document" name="customDocument" required>'+esc(existing.customDocument||t.documentBody||'')+'</textarea></label>';
  }else{
    body=t.sections.map(function(sec,si){
      return section(sec.title,(si+1)+' · MODELO PERSONALIZADO','<div class="assessment-v3-grid">'+sec.questions.map(function(q){return renderCustomQuestion(q,answers[q.id]);}).join('')+'</div>',si===0);
    }).join('');
  }
  var w=modal(
    '<div class="assessment-v3-head"><div><small>AVALIAÇÃO PERSONALIZADA</small><h2>'+esc(t.name)+'</h2><p>'+esc(p.name)+' · modelo criado pela profissional</p></div><span>Meu modelo</span></div>'+
    '<form id="customAssessmentForm">'+
      '<div class="assessment-v3-top-grid"><label>Data<input type="date" name="date" value="'+esc(existing.date||today())+'" required></label><label>Profissional<input name="professional" value="'+esc(existing.professional||'')+'" placeholder="Nome da profissional"></label><label>Tipo<select name="kind">'+selectOptions(['Avaliação inicial','Reavaliação','Triagem','Avaliação complementar'],existing.kind||'Avaliação personalizada')+'</select></label></div>'+
      body+
      '<label>Síntese / observações finais<textarea name="summary" placeholder="Resumo clínico, principais achados e próximos passos...">'+esc(existing.summary||'')+'</textarea></label>'+
      '<div class="assessment-v3-actions"><button type="button" class="soft-btn" data-custom-cancel>Cancelar</button><button class="primary">Salvar no prontuário</button></div>'+
    '</form>'
  );
  var form=w.querySelector('#customAssessmentForm');
  var ref=w.querySelector('[data-custom-open-reference]');if(ref)ref.onclick=function(){openTemplateAttachment(t);};
  w.querySelector('[data-custom-cancel]').onclick=function(){w.remove();};
  form.onsubmit=function(e){
    e.preventDefault();
    var fd=new FormData(form);
    if(t.mode==='form'){
      var missing=[];
      t.sections.forEach(function(sec){sec.questions.forEach(function(q){
        if(!q.required)return;
        var name='custom_'+q.id;
        if(q.type==='multi'){
          if(!form.querySelector('[name="'+name+'"]:checked'))missing.push(q.label);
        }else{
          var el=form.querySelector('[name="'+name+'"]');if(!el||!String(el.value||'').trim())missing.push(q.label);
        }
      });});
      if(missing.length){alert('Preencha os campos obrigatórios: '+missing.join(', '));return;}
    }
    var obj={
      id:existing.id||uid(),patientId:pid,kind:fd.get('kind')||'Avaliação personalizada',date:fd.get('date'),professional:fd.get('professional'),
      mainArea:'Personalizada · '+t.name,customTemplateId:t.id,customTemplateName:t.name,customMode:t.mode,customSnapshot:snapshot,
      customAnswers:t.mode==='form'?collectCustomAnswers(form,t):{},customDocument:t.mode==='document'?fd.get('customDocument'):'',
      summary:fd.get('summary')||((t.mode==='document'?(fd.get('customDocument')||'').slice(0,180):'Modelo personalizado preenchido')),updatedAt:new Date().toISOString()
    };
    var data=load(),idx=data.assessments.findIndex(function(x){return x.id===obj.id;});if(idx>=0)data.assessments[idx]=obj;else data.assessments.push(obj);
    save(data);w.remove();renderPatientAssessments(pid);mountPage(true);
  };
}
function customAssessmentRead(a){
  var t=normalizeTemplate(a.customSnapshot||{}),answers=a.customAnswers||{};
  if(a.customMode==='document')return section(t.name,'DOCUMENTO PERSONALIZADO','<div class="assessment-custom-document-read">'+esc(a.customDocument||'—').replace(/\n/g,'<br>')+'</div>',true);
  return t.sections.map(function(sec,si){
    return section(sec.title,(si+1)+' · MODELO PERSONALIZADO','<div class="assessment-v3-read-grid">'+sec.questions.map(function(q){
      var v=answers[q.id],textVal=Array.isArray(v)?v.join(', '):(v||'—');
      return '<div><small>'+esc(q.label)+'</small><p>'+esc(textVal)+'</p></div>';
    }).join('')+'</div>',si===0);
  }).join('');
}
function chooseAssessmentType(pid){
  var d=load(),templates=d.assessmentTemplates||[];
  var w=modal(
    '<div class="assessment-v3-head"><div><small>NOVA AVALIAÇÃO</small><h2>Escolha o modelo</h2><p>Use a avaliação completa do Fonely ou um modelo criado pela profissional.</p></div></div>'+
    '<button class="assessment-model-choice fonely" data-use-fonely><div>◇</div><span><small>MODELO FONELY</small><b>Avaliação clínica completa</b><p>Parte geral + módulo específico por área.</p></span><strong>→</strong></button>'+
    '<div class="assessment-model-divider"><span>MEUS MODELOS</span></div>'+
    (templates.length?'<div class="assessment-model-choices">'+templates.map(function(t){return '<button class="assessment-model-choice" data-use-custom="'+t.id+'"><div>'+(t.mode==='document'?'▤':'☷')+'</div><span><small>'+(t.mode==='document'?'DOCUMENTO':'FORMULÁRIO')+'</small><b>'+esc(t.name)+'</b><p>'+esc(t.description||'Modelo personalizado')+'</p></span><strong>→</strong></button>';}).join('')+'</div>':'<div class="assessment-template-empty compact"><b>Você ainda não criou modelos</b><span>Crie um em Avaliações → Criar meu modelo.</span></div>')
  );
  w.querySelector('[data-use-fonely]').onclick=function(){assessmentForm(pid);};
  w.querySelectorAll('[data-use-custom]').forEach(function(btn){btn.onclick=function(){var id=btn.getAttribute('data-use-custom'),t=load().assessmentTemplates.find(function(x){return x.id===id;});if(t)customAssessmentForm(pid,t);};});
}
function choosePatientForTemplate(templateId){
  var d=load(),t=d.assessmentTemplates.find(function(x){return x.id===templateId;});if(!t)return;
  if(!d.patients.length){alert('Cadastre um paciente antes de usar este modelo.');return;}
  var w=modal('<div class="assessment-v3-head"><div><small>'+esc(t.name)+'</small><h2>Escolha o paciente</h2><p>O registro preenchido será salvo no prontuário.</p></div></div><label>Paciente<select id="assessmentPatientSelect">'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></label><div class="assessment-v3-actions"><button class="primary" data-continue-template>Continuar</button></div>');
  w.querySelector('[data-continue-template]').onclick=function(){customAssessmentForm(w.querySelector('#assessmentPatientSelect').value,t);};
}
function bindTemplateCards(host){
  host.querySelectorAll('[data-template-use]').forEach(function(btn){btn.onclick=function(){choosePatientForTemplate(btn.getAttribute('data-template-use'));};});
  host.querySelectorAll('[data-template-edit]').forEach(function(btn){btn.onclick=function(){var t=load().assessmentTemplates.find(function(x){return x.id===btn.getAttribute('data-template-edit');});if(t)templateBuilder(t);};});
  host.querySelectorAll('[data-template-duplicate]').forEach(function(btn){btn.onclick=function(){var data=load(),t=data.assessmentTemplates.find(function(x){return x.id===btn.getAttribute('data-template-duplicate');});if(!t)return;var copy=JSON.parse(JSON.stringify(t));copy.id=uid();copy.name=t.name+' (cópia)';copy.attachment=null;copy.createdAt=new Date().toISOString();copy.updatedAt=copy.createdAt;data.assessmentTemplates.push(copy);save(data);mountPage(true);};});
  host.querySelectorAll('[data-template-delete]').forEach(function(btn){btn.onclick=async function(){var data=load(),id=btn.getAttribute('data-template-delete'),t=data.assessmentTemplates.find(function(x){return x.id===id;});if(!t||!confirm('Excluir este modelo? As avaliações já preenchidas continuarão salvas.'))return;if(t.attachment&&t.attachment.path){var cloud=window.FonelyCloud;if(cloud&&cloud.supabase)await cloud.supabase.storage.from('form-template-files').remove([t.attachment.path]);}data.assessmentTemplates=data.assessmentTemplates.filter(function(x){return x.id!==id;});save(data);mountPage(true);};});
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
    '<div class="assessment-v3-page-hero"><div><small>AVALIAÇÃO CLÍNICA · FONELY</small><h2>Avaliação completa ou do seu jeito</h2><p>Use o modelo clínico do Fonely ou crie seus próprios formulários e documentos para reutilizar em qualquer paciente.</p></div><div class="assessment-v3-hero-actions"><button class="soft-btn" data-page-new-template>+ Criar meu modelo</button><button class="primary" data-page-new>+ Nova avaliação</button></div></div>'+
    '<div class="assessment-v3-stats"><div><b>'+total+'</b><span>Avaliações</span></div><div><b>'+re+'</b><span>Reavaliações</span></div><div><b>'+Object.keys(patients).length+'</b><span>Pacientes avaliados</span></div></div>'+
    '<article class="panel assessment-template-panel"><div class="panel-title"><div><small>PERSONALIZAÇÃO</small><h3>Meus modelos</h3></div><button class="soft-btn" data-page-new-template>+ Novo modelo</button></div>'+templateCards(d)+'</article>'+
    '<article class="panel assessment-v3-page-panel"><div class="panel-title"><h3>Histórico de avaliações</h3><select data-assessment-filter><option value="">Todos os pacientes</option>'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></div><div data-assessment-page-list>'+pageList(d,latest)+'</div></article>'+
  '</section>';
}
function choosePatient(){
  var d=load();if(!d.patients.length){alert('Cadastre um paciente antes de criar uma avaliação.');return;}
  var w=modal('<div class="assessment-v3-head"><div><small>NOVA AVALIAÇÃO</small><h2>Escolha o paciente</h2><p>Depois você escolhe o modelo que deseja usar.</p></div></div><label>Paciente<select id="assessmentPatientSelect">'+d.patients.map(function(p){return '<option value="'+p.id+'">'+esc(p.name)+'</option>';}).join('')+'</select></label><div class="assessment-v3-actions"><button class="primary" data-continue-assessment>Continuar</button></div>');
  w.querySelector('[data-continue-assessment]').onclick=function(){chooseAssessmentType(w.querySelector('#assessmentPatientSelect').value);};
}
function bindPageList(host){
  host.querySelectorAll('[data-page-open]').forEach(function(b){b.onclick=function(){var p=b.getAttribute('data-page-open').split('|');detail(p[0],p[1]);};});
}
function bindPage(host){
  var d=load(),newBtn=host.querySelector('[data-page-new]');if(newBtn)newBtn.onclick=choosePatient;
  host.querySelectorAll('[data-page-new-template]').forEach(function(btn){btn.onclick=function(){templateBuilder();};});
  bindTemplateCards(host);
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