(function(){
'use strict';
var APP_KEY=window.FONELY_STORAGE_KEY||'fonely_clean_v1',CAA_KEY=window.FONELY_CAA_KEY||'fonely_caa_v1',PLAN_KEY=window.FONELY_PLAN_KEY||'fonely_plan_v1';
var CAA_UI_KEY='fonely_caa_ui_v1_'+String(window.FONELY_WORKSPACE_OWNER_ID||window.FONELY_USER_ID||CAA_KEY);
var manager={patientId:null,tab:'board',search:'',category:'Todas',previewCategory:'Todas',customImage:null,customAudio:null,recording:false,recorder:null,chunks:[],draggingId:null,restoring:false};
function loadCAAUI(){try{return JSON.parse(localStorage.getItem(CAA_UI_KEY)||'null');}catch(e){return null;}}
function saveCAAUI(mode){try{localStorage.setItem(CAA_UI_KEY,JSON.stringify({open:true,mode:mode||'manager',patientId:manager.patientId||null,tab:manager.tab||'board'}));}catch(e){}}
function clearCAAUI(){try{localStorage.removeItem(CAA_UI_KEY);}catch(e){}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function id(){return (crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);}
function token(){var a=new Uint8Array(18);if(crypto&&crypto.getRandomValues)crypto.getRandomValues(a);else for(var i=0;i<a.length;i++)a[i]=Math.floor(Math.random()*256);return Array.from(a).map(function(x){return x.toString(16).padStart(2,'0');}).join('');}
function appData(){try{return JSON.parse(localStorage.getItem(APP_KEY))||{patients:[]};}catch(e){return {patients:[]};}}
function caaData(){try{var d=JSON.parse(localStorage.getItem(CAA_KEY))||{profiles:{}};if(!d.profiles)d.profiles={};return d;}catch(e){return {profiles:{}};}}
function saveCAA(d){localStorage.setItem(CAA_KEY,JSON.stringify(d));}
function cloud(){return window.FonelyCloud||{};}
async function syncPublishedBoard(p){
  var c=cloud(),sb=c.supabase;if(!sb||!p||!p.published)return;
  var ownerId=c.workspaceOwnerId||window.FONELY_WORKSPACE_OWNER_ID||(c.user&&c.user.id);
  if(!ownerId)return;
  var row={token:p.token,owner_id:ownerId,patient_id:String(p.patientId||''),enabled:!!p.enabled,snapshot:p.published,published_at:p.published.publishedAt||new Date().toISOString(),updated_at:new Date().toISOString()};
  var r=await sb.from('caa_public_boards').upsert(row,{onConflict:'token'});
  if(r.error)throw r.error;
}
function plan(){return localStorage.getItem(PLAN_KEY)||window.FONELY_PLAN_TIER||'base';}
function isPro(){return plan()==='pro';}
function canUseCAA(){var a=window.FonelyAccount||{},t=a.team||{};return t.isOwner!==false||!t.permissions||t.permissions.caa!==false;}
function patient(pid){return (appData().patients||[]).find(function(p){return p.id===pid;})||null;}
function profile(pid){return caaData().profiles[pid]||null;}
function defaultSettings(){return {volume:.9,rate:.95,voiceName:'',voicePreference:'auto',speakOnTap:true,addToPhrase:false,columns:4,cardSize:'normal'};}
function activate(pid){
  if(!canUseCAA()||!isPro())return false;
  var d=caaData();if(d.profiles[pid]){d.profiles[pid].enabled=true;saveCAA(d);return true;}
  d.profiles[pid]={id:id(),patientId:pid,enabled:true,token:token(),draft:['yes','no','more','finished','help','want','dont-want','water','eat','toilet','pain','play'],customCards:[],settings:defaultSettings(),versions:[],usage:[],published:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  saveCAA(d);return true;
}
function updateProfile(pid,fn){var d=caaData(),p=d.profiles[pid];if(!p)return null;fn(p);p.updatedAt=new Date().toISOString();saveCAA(d);return p;}
function allCards(p){
  p=p||{};
  var overrides=p.cardOverrides||{};
  var base=(window.FonelyCAALibrary?window.FonelyCAALibrary.cards:[]).map(function(c){
    return Object.assign({},c,overrides[c.id]||{});
  });
  return base.concat(p.customCards||[]);
}
function cardById(p,cid){return allCards(p).find(function(c){return c.id===cid;})||null;}
function draftCards(p){return (p.draft||[]).map(function(cid){return cardById(p,cid);}).filter(Boolean);}
function dateTime(v){try{return new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});}catch(e){return '—';}}
function shareUrl(p){var base=location.href.split('?')[0].replace(/[^/]*$/,'');return base+'caa.html?token='+encodeURIComponent(p.token);}
function patientFromView(){var h=document.querySelector('.patient-head h2');if(!h)return null;var name=h.textContent.trim();return (appData().patients||[]).find(function(p){return String(p.name||'').trim()===name})||null;}
function inject(){
  if(!canUseCAA())return;
  var p=patientFromView(),grid=document.querySelector('.clinical-grid');
  if(p&&grid&&!grid.querySelector('[data-caa-entry]')){
    var pr=profile(p.id),b=document.createElement('button');b.className='clinical caa-card-trigger';b.setAttribute('data-caa-entry',p.id);
    b.innerHTML='<span class="caa-pro-badge">PRO</span><i style="font-style:normal;font-weight:900">CAA</i><b>Fonely CAA</b><span>'+(pr&&pr.enabled?'Prancha, voz, histórico e compartilhamento':'Ativar comunicação aumentativa para este paciente')+'</span>';
    b.onclick=function(){if(!profile(p.id)){if(!activate(p.id)){openLocked(p.id);return;}}openManager(p.id);};
    grid.appendChild(b);
  }
  var nav=document.querySelector('.layout aside nav'),d=caaData(),active=Object.keys(d.profiles).some(function(k){return d.profiles[k]&&d.profiles[k].enabled;});
  if(nav&&active&&!nav.querySelector('[data-caa-menu]')){
    var n=document.createElement('button');n.setAttribute('data-caa-menu','1');n.innerHTML='<i>◉</i>Fonely CAA <em>PRO</em>';n.onclick=openCAAList;nav.insertBefore(n,nav.lastElementChild||null);
  }
  var remembered=loadCAAUI();
  if(!manager.restoring&&remembered&&remembered.open&&!document.getElementById('fonelyCAAOverlay')){
    if(remembered.mode==='manager'&&p&&remembered.patientId===p.id&&profile(p.id)){
      manager.restoring=true;
      setTimeout(function(){manager.restoring=false;if(!document.getElementById('fonelyCAAOverlay'))openManager(p.id,true);},0);
    }else if(remembered.mode==='list'&&nav&&active){
      manager.restoring=true;
      setTimeout(function(){manager.restoring=false;if(!document.getElementById('fonelyCAAOverlay'))openCAAList(true);},0);
    }
  }
}
function openLocked(pid){
  var p=patient(pid),w=document.createElement('div');w.className='caa-overlay';w.id='fonelyCAAOverlay';
  w.innerHTML='<div class="caa-shell"><div class="caa-topbar"><button class="caa-btn" data-caa-close>← Voltar</button><div class="grow"><h2>Fonely CAA</h2><p>'+esc(p&&p.name||'Paciente')+'</p></div><span class="caa-pro-badge">PRO</span></div><div class="caa-panel" style="margin-top:18px"><div class="caa-locked"><h3>Recurso exclusivo do Fonely Pro</h3><p>O CAA fica disponível apenas para contas Pro. Nenhum dado do paciente é alterado enquanto o recurso estiver bloqueado.</p></div></div></div>';
  document.body.appendChild(w);w.querySelector('[data-caa-close]').onclick=function(){w.remove();};
}
function openCAAList(restoring){saveCAAUI('list');
  if(!canUseCAA())return;
  var d=caaData(),aps=appData(),rows=Object.keys(d.profiles).filter(function(k){return d.profiles[k].enabled;}).map(function(k){var p=(aps.patients||[]).find(function(x){return x.id===k}),pr=d.profiles[k];return p?'<button class="patient" data-open-caa="'+esc(k)+'"><div class="avatar">'+esc((p.name||'?').charAt(0))+'</div><div><b>'+esc(p.name)+'</b><span>'+(pr.published?'Prancha publicada · '+(pr.published.cards||[]).length+' cartões':'CAA ativo · aguardando publicação')+'</span></div><strong>→</strong></button>':'';}).join('');
  var w=document.createElement('div');w.className='caa-overlay';w.id='fonelyCAAOverlay';w.innerHTML='<div class="caa-shell"><div class="caa-topbar"><button class="caa-btn" data-caa-close>← Voltar</button><div class="grow"><h2>Fonely CAA</h2><p>Pacientes com comunicação aumentativa ativada</p></div><span class="caa-pro-badge">PRO</span></div><div class="caa-panel" style="margin-top:18px">'+(rows?'<div class="patient-list">'+rows+'</div>':'<div class="caa-empty"><b>Nenhum CAA ativo</b><span>Ative pelo prontuário de um paciente.</span></div>')+'</div></div>';
  document.body.appendChild(w);w.onclick=function(e){var b=e.target.closest('[data-open-caa]');if(b){w.remove();openManager(b.getAttribute('data-open-caa'));}if(e.target.closest('[data-caa-close]')){clearCAAUI();w.remove();}};
}
function openManager(pid,restoring){var remembered=loadCAAUI();manager.patientId=pid;manager.tab=restoring&&remembered&&remembered.patientId===pid?(remembered.tab||'board'):'board';manager.previewCategory='Todas';updateProfile(pid,function(x){x.settings=x.settings||defaultSettings();x.settings.speakOnTap=true;x.settings.addToPhrase=false;});saveCAAUI('manager');renderManager();}
function tabs(){return [['board','Prancha'],['library','Biblioteca'],['custom','Personalizar'],['history','Histórico'],['usage','Uso'],['share','Compartilhar']];}
function renderManager(){
  var p=profile(manager.patientId),pt=patient(manager.patientId);if(!p)return;
  var old=document.getElementById('fonelyCAAOverlay');if(old)old.remove();
  var w=document.createElement('div');w.className='caa-overlay';w.id='fonelyCAAOverlay';
  w.innerHTML='<div class="caa-shell"><div class="caa-topbar"><button class="caa-btn" data-caa-close>← Voltar</button><div class="grow"><h2>Fonely CAA · '+esc(pt&&pt.name||'Paciente')+'</h2><p>'+(p.published?'Publicado '+dateTime(p.published.publishedAt):'Em configuração · ainda não publicado')+'</p></div><span class="caa-pro-badge">PRO</span><button class="caa-btn primary" data-caa-publish>Publicar prancha</button></div><div class="caa-tabs">'+tabs().map(function(t){return '<button data-caa-tab="'+t[0]+'" class="'+(manager.tab===t[0]?'active':'')+'">'+t[1]+'</button>';}).join('')+'</div><div id="caaBody">'+renderTab(p)+'</div><div class="caa-symbol-credit">Pictogramas padrão: <a href="https://mulberrysymbols.org/" target="_blank" rel="noopener">Mulberry Symbols</a> · CC BY-SA 4.0</div></div>';
  document.body.appendChild(w);saveCAAUI('manager');bindManager(w,p);
}
function renderTab(p){
  if(manager.tab==='library')return renderLibrary(p);
  if(manager.tab==='custom')return renderCustom(p);
  if(manager.tab==='history')return renderHistory(p);
  if(manager.tab==='usage')return renderUsage(p);
  if(manager.tab==='share')return renderShare(p);
  return renderBoardTab(p);
}
function renderBoardTab(p){
  var cards=draftCards(p),list=cards.length?cards.map(function(c){
    var recorded=c.audioData?'<span class="caa-audio-badge">Voz gravada</span>':'';
    return '<div class="caa-board-row" data-drag-card="'+esc(c.id)+'"><img src="'+esc(c.image)+'" alt=""><div class="caa-drag-main" data-drag-handle="'+esc(c.id)+'"><b>'+esc(c.label)+' '+recorded+'</b><small>'+esc(c.category)+' · fala: '+esc(c.speech||c.label)+'</small><em>⋮⋮ Segure e arraste para reorganizar</em></div><div class="caa-row-actions"><button class="caa-edit-card" data-edit-card="'+esc(c.id)+'">Editar</button><button data-remove="'+esc(c.id)+'" aria-label="Remover">×</button></div></div>';
  }).join(''):'<div class="caa-empty"><b>Prancha vazia</b><span>Escolha cartões na Biblioteca.</span></div>';
  return '<div class="caa-grid-2"><section class="caa-panel"><h3>Cartões da prancha</h3><p>Segure um cartão pelo nome e arraste para onde quiser. Toque em “Editar” para trocar imagem, frase, voz ou gravar a própria voz.</p><div class="caa-board-list">'+list+'</div></section><section class="caa-panel"><h3>Prévia</h3><p>Teste a comunicação antes de publicar.</p><div class="caa-public-preview">'+communicatorHTML(p,{cards:cards,settings:p.settings},true)+'</div></section></div>';
}
function renderLibrary(p){
  var cards=allCards(p).filter(function(c){var q=(manager.search||'').toLowerCase();return (!q||String(c.label+' '+c.category).toLowerCase().includes(q))&&(manager.category==='Todas'||c.category===manager.category);});
  var cats=['Todas'].concat(Array.from(new Set(allCards(p).map(function(c){return c.category;}))));
  return '<section class="caa-panel"><h3>Biblioteca de comunicação</h3><p>Imagem própria, palavra embaixo e áudio. Clique para adicionar ou remover da prancha.</p><div class="caa-library-tools"><input id="caaSearch" value="'+esc(manager.search)+'" placeholder="Buscar palavra"><select id="caaCategory">'+cats.map(function(c){return '<option '+(c===manager.category?'selected':'')+'>'+esc(c)+'</option>';}).join('')+'</select><span class="caa-pro-badge">'+(p.draft||[]).length+' SELECIONADOS</span></div><div class="caa-library">'+cards.map(function(c){var sel=(p.draft||[]).indexOf(c.id)>=0;return '<button class="caa-lib-card '+(sel?'selected':'')+'" data-toggle-card="'+c.id+'" style="background:'+esc(c.color||'#fff')+'"><span class="caa-check">'+(sel?'✓':'+')+'</span><img src="'+esc(c.image)+'" alt=""><b>'+esc(c.label)+'</b><small>'+esc(c.category)+'</small></button>';}).join('')+'</div></section>';
}
function renderCustom(p){
  var voices=window.FonelyCAASpeech?window.FonelyCAASpeech.voices():[];
  var pref=p.settings.voicePreference||'auto';
  return '<div class="caa-grid-2"><section class="caa-panel"><h3>Voz e comportamento</h3><p>Escolha uma voz padrão para este paciente. As vozes disponíveis dependem do aparelho usado pela família.</p><div class="caa-settings">'+
    '<div class="caa-setting"><label>Tipo de voz</label><select id="caaVoicePreference"><option value="auto" '+(pref==='auto'?'selected':'')+'>Automática</option><option value="female" '+(pref==='female'?'selected':'')+'>Feminina</option><option value="male" '+(pref==='male'?'selected':'')+'>Masculina</option></select><small>O Fonely tenta usar uma voz compatível disponível no aparelho.</small></div>'+
    '<div class="caa-setting"><label>Voz específica do aparelho</label><select id="caaVoice"><option value="">Usar o tipo escolhido acima</option>'+voices.map(function(v){var g=v.gender==='female'?' · feminina':v.gender==='male'?' · masculina':'';return '<option value="'+esc(v.name)+'" '+(p.settings.voiceName===v.name?'selected':'')+'>'+esc(v.name)+' · '+esc(v.lang)+g+'</option>';}).join('')+'</select><button class="caa-btn" style="margin-top:8px" data-test-voice>Ouvir teste</button></div>'+
    '<div class="caa-setting"><label>Volume <b id="volLabel">'+Math.round((p.settings.volume||0)*100)+'%</b></label><input id="caaVolume" type="range" min="0" max="100" value="'+Math.round((p.settings.volume||0)*100)+'"></div>'+
    '<div class="caa-setting"><label>Velocidade <b id="rateLabel">'+Number(p.settings.rate||.95).toFixed(2)+'x</b></label><input id="caaRate" type="range" min="50" max="160" value="'+Math.round((p.settings.rate||.95)*100)+'"></div>'+
    '<div class="caa-setting caa-direct-mode"><label>Modo de comunicação</label><b>Toque e fala</b><span>Ao tocar no cartão, a voz sai imediatamente.</span></div>'+
    '<div class="caa-setting"><label>Colunas da prancha</label><select id="caaColumns">'+[2,3,4,5,6].map(function(n){return '<option '+(Number(p.settings.columns)===n?'selected':'')+'>'+n+'</option>';}).join('')+'</select></div>'+
  '</div></section><section class="caa-panel"><h3>Criar cartão personalizado</h3><p>Use uma foto da família, do cachorro, de um objeto real ou qualquer imagem própria. Você também pode gravar a voz.</p><form id="caaCustomForm" class="caa-custom-form"><label>Imagem / foto<input id="caaCustomImage" type="file" accept="image/*"></label><div class="caa-image-preview">'+(manager.customImage?'<img src="'+esc(manager.customImage)+'" alt="">':'<span>Imagem</span>')+'</div><label>Nome do cartão<input name="label" required placeholder="Ex.: Mamãe"></label><label>O que será falado<input name="speech" placeholder="Ex.: Quero a mamãe"></label><label>Categoria<select name="category">'+window.FonelyCAALibrary.categories.map(function(c){return '<option>'+esc(c)+'</option>';}).join('')+'<option>Personalizados</option></select></label><div class="caa-record-line"><button type="button" class="caa-btn" data-record-audio>'+(manager.recording?'Parar gravação':'Gravar minha voz')+'</button> '+(manager.customAudio?'<span class="caa-pro-badge">ÁUDIO GRAVADO</span>':'')+'</div><button class="caa-btn primary">Adicionar à biblioteca</button></form></section></div>';
}
function renderHistory(p){
  var v=(p.versions||[]).slice().reverse();
  return '<section class="caa-panel"><h3>Histórico da prancha</h3><p>Cada publicação cria uma versão preservada.</p><div class="caa-history">'+(v.length?v.map(function(x){return '<div class="caa-history-item"><b>Versão '+x.version+' · '+dateTime(x.publishedAt)+'</b><span>'+x.cards.length+' cartões · '+esc(x.summary||'Prancha publicada')+'</span></div>';}).join(''):'<div class="caa-empty"><b>Nenhuma versão publicada</b><span>A primeira publicação aparecerá aqui.</span></div>')+'</div></section>';
}
function renderUsage(p){
  var u=p.usage||[],today=new Date().toISOString().slice(0,10),tu=u.filter(function(e){return String(e.at||'').slice(0,10)===today}),taps=tu.filter(function(e){return e.type==='card';}),counts={},cats={};taps.forEach(function(e){counts[e.label]=(counts[e.label]||0)+1;cats[e.category]=(cats[e.category]||0)+1;});var top=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];}).slice(0,8),recent=taps.slice(-10).reverse();
  return '<section class="caa-panel"><h3>Uso de hoje</h3><p>Dados descritivos da comunicação. A interpretação clínica continua sendo do profissional.</p><div class="caa-stats"><div class="caa-stat"><small>TOQUES</small><b>'+taps.length+'</b></div><div class="caa-stat"><small>PALAVRAS DIFERENTES</small><b>'+Object.keys(counts).length+'</b></div><div class="caa-stat"><small>CATEGORIAS USADAS</small><b>'+Object.keys(cats).length+'</b></div><div class="caa-stat"><small>TOTAL REGISTRADO</small><b>'+u.length+'</b></div></div><div class="caa-grid-2"><div><h3>Mais utilizados</h3><div class="caa-history">'+(top.length?top.map(function(k){return '<div class="caa-history-item"><b>'+esc(k)+'</b><span>'+counts[k]+' uso'+(counts[k]===1?'':'s')+'</span></div>';}).join(''):'<div class="caa-empty"><b>Sem uso registrado hoje</b></div>')+'</div></div><div><h3>Falas recentes</h3><div class="caa-history">'+(recent.length?recent.map(function(e){return '<div class="caa-history-item"><b>'+esc(e.speech||e.label)+'</b><span>'+esc(e.label)+' · '+dateTime(e.at)+'</span></div>';}).join(''):'<div class="caa-empty"><b>Nenhuma fala registrada</b></div>')+'</div></div></div></section>';
}
function renderShare(p){
  var url=shareUrl(p);
  return '<section class="caa-panel"><h3>Compartilhar com o paciente</h3><p>O link abre somente a prancha publicada. O paciente não acessa o Fonely profissional.</p><div class="caa-share">'+(p.published?'<div class="caa-linkbox"><input id="caaShareLink" readonly value="'+esc(url)+'"><button class="caa-btn primary" data-copy-link>Copiar link</button><a class="caa-btn" href="'+esc(url)+'" target="_blank">Abrir prancha</a></div>':'<div class="caa-locked"><h3>Publique a prancha primeiro</h3><p>Depois da primeira publicação, o link será liberado e continuará o mesmo nas próximas atualizações.</p></div>')+'<div><button class="caa-btn '+(p.enabled?'danger':'primary')+'" data-toggle-enabled>'+(p.enabled?'Desativar CAA':'Reativar CAA')+'</button></div></div></section>';
}
function communicatorHTML(p,snapshot,preview){
  var cards=snapshot.cards||[],cats=['Todas'].concat(Array.from(new Set(cards.map(function(c){return c.category;})))),cat=preview?manager.previewCategory:'Todas',shown=cat==='Todas'?cards:cards.filter(function(c){return c.category===cat}),cols=Number((snapshot.settings||{}).columns||4);
  return '<div class="caa-preview-note"><b>Toque para falar</b><span>Cada cartão reproduz a fala imediatamente.</span></div><div class="caa-categories">'+cats.map(function(c){return '<button class="caa-category '+(c===cat?'active':'')+'" data-preview-cat="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div><div class="caa-board" style="--caa-cols:'+cols+'">'+shown.map(function(c){return '<button class="caa-comm-card" data-preview-card="'+esc(c.id)+'"><img src="'+esc(c.image)+'" alt=""><b>'+esc(c.label)+'</b><small>'+esc(c.speech||c.label)+'</small></button>';}).join('')+'</div>';
}
async function publish(pid){
  var p=profile(pid);if(!p||!isPro())return;
  var cards=draftCards(p).map(function(c){return JSON.parse(JSON.stringify(c));}),now=new Date().toISOString(),ver=(p.versions||[]).length+1,snap={version:ver,visualVersion:4,publishedAt:now,cards:cards,settings:JSON.parse(JSON.stringify(p.settings||defaultSettings()))};
  p=updateProfile(pid,function(x){x.published=snap;x.versions=x.versions||[];x.versions.push({version:ver,publishedAt:now,cards:cards,settings:snap.settings,summary:'Prancha publicada'});});
  try{
    await syncPublishedBoard(p);
    manager.tab='share';renderManager();
  }catch(err){
    alert('A prancha ficou salva no Fonely, mas não foi possível atualizar o link da família agora. Conecte-se à internet e publique novamente.');
  }
}
function saveCardCustomization(cid,patch){
  return updateProfile(manager.patientId,function(x){
    x.cardOverrides=x.cardOverrides||{};
    var custom=(x.customCards||[]).find(function(c){return c.id===cid;});
    patch.fonelyCustomized=true;
    if(custom)Object.assign(custom,patch);
    else x.cardOverrides[cid]=Object.assign({},x.cardOverrides[cid]||{},patch);
  });
}
function resetCardCustomization(cid){
  updateProfile(manager.patientId,function(x){if(x.cardOverrides)delete x.cardOverrides[cid];});
}
function readImageFile(file,done){
  if(!file)return;
  if(!/^image\//.test(file.type)){alert('Escolha uma imagem válida.');return;}
  if(file.size>6*1024*1024){alert('A imagem pode ter no máximo 6 MB.');return;}
  var r=new FileReader();r.onload=function(){done(r.result);};r.readAsDataURL(file);
}
function openCardEditor(cid){
  var p=profile(manager.patientId),card=cardById(p,cid);if(!card)return;
  var custom=!!card.custom,voices=window.FonelyCAASpeech?window.FonelyCAASpeech.voices():[];
  var image=card.image,audioData=card.audioData||null,recorder=null,chunks=[],stream=null;
  var old=document.getElementById('caaCardEditor');if(old)old.remove();
  var box=document.createElement('div');box.id='caaCardEditor';box.className='caa-card-editor-overlay';
  function voiceOpts(){
    return '<option value="">Usar voz padrão da prancha</option>'+voices.map(function(v){return '<option value="'+esc(v.name)+'" '+(card.voiceName===v.name?'selected':'')+'>'+esc(v.name)+' · '+esc(v.lang)+'</option>';}).join('');
  }
  box.innerHTML='<div class="caa-card-editor"><div class="caa-card-editor-head"><div><small>PERSONALIZAR CARTÃO</small><h2>'+esc(card.label)+'</h2></div><button type="button" data-editor-close>×</button></div>'+
    '<form id="caaCardEditorForm"><div class="caa-editor-layout"><div><div class="caa-editor-image" data-editor-preview><img src="'+esc(image)+'" alt=""></div><div class="caa-editor-photo-actions"><label class="caa-btn">Escolher foto<input type="file" accept="image/*" data-editor-image hidden></label><label class="caa-btn">Tirar foto<input type="file" accept="image/*" capture="environment" data-editor-camera hidden></label></div></div>'+
    '<div class="caa-custom-form"><label>Nome que aparece<input name="label" required value="'+esc(card.label)+'"></label><label>Frase falada<input name="speech" value="'+esc(card.speech||card.label)+'"></label><label>Categoria<select name="category">'+window.FonelyCAALibrary.categories.concat(['Personalizados']).map(function(c){return '<option '+(c===card.category?'selected':'')+'>'+esc(c)+'</option>';}).join('')+'</select></label>'+
    '<div class="two"><label>Tipo de voz<select name="voicePreference"><option value="">Padrão da prancha</option><option value="auto" '+(card.voicePreference==='auto'?'selected':'')+'>Automática</option><option value="female" '+(card.voicePreference==='female'?'selected':'')+'>Feminina</option><option value="male" '+(card.voicePreference==='male'?'selected':'')+'>Masculina</option></select></label><label>Voz específica<select name="voiceName">'+voiceOpts()+'</select></label></div>'+
    '<div class="caa-editor-audio"><b>Voz gravada</b><span>'+(audioData?'Já existe uma gravação neste cartão.':'Sem gravação. Se gravar, ela terá prioridade sobre a voz automática.')+'</span><div><button type="button" class="caa-btn" data-editor-record>'+(audioData?'Gravar novamente':'Gravar minha voz')+'</button> <button type="button" class="caa-btn" data-editor-listen '+(audioData?'':'disabled')+'>Ouvir</button> <button type="button" class="caa-btn danger" data-editor-clear-audio '+(audioData?'':'disabled')+'>Remover áudio</button></div></div>'+
    '</div></div><div class="caa-editor-footer">'+(!custom?'<button type="button" class="caa-btn" data-editor-reset>Restaurar cartão padrão</button>':'<span></span>')+'<div><button type="button" class="caa-btn" data-editor-close>Cancelar</button> <button class="caa-btn primary">Salvar cartão</button></div></div></form></div>';
  document.body.appendChild(box);
  function refreshPreview(){var pvw=box.querySelector('[data-editor-preview] img');if(pvw)pvw.src=image;}
  function refreshAudio(){
    var listen=box.querySelector('[data-editor-listen]'),clear=box.querySelector('[data-editor-clear-audio]'),rec=box.querySelector('[data-editor-record]'),span=box.querySelector('.caa-editor-audio span');
    if(listen)listen.disabled=!audioData;if(clear)clear.disabled=!audioData;
    if(rec&&!manager.editRecording)rec.textContent=audioData?'Gravar novamente':'Gravar minha voz';
    if(span)span.textContent=audioData?'Gravação pronta para este cartão.':'Sem gravação. Se gravar, ela terá prioridade sobre a voz automática.';
  }
  box.onclick=function(e){
    if(e.target.closest('[data-editor-close]')){if(recorder&&recorder.state==='recording')recorder.stop();if(stream)stream.getTracks().forEach(function(t){t.stop();});box.remove();return;}
    if(e.target.closest('[data-editor-listen]')&&audioData){var f=new FormData(box.querySelector('form'));window.FonelyCAASpeech&&window.FonelyCAASpeech.speakCard({label:f.get('label'),speech:f.get('speech'),audioData:audioData,voiceName:f.get('voiceName'),voicePreference:f.get('voicePreference')},p.settings);return;}
    if(e.target.closest('[data-editor-clear-audio]')){audioData=null;refreshAudio();return;}
    if(e.target.closest('[data-editor-reset]')){if(confirm('Restaurar imagem, nome, frase e voz originais deste cartão?')){resetCardCustomization(cid);box.remove();renderManager();}return;}
    var rb=e.target.closest('[data-editor-record]');
    if(rb){
      if(recorder&&recorder.state==='recording'){recorder.stop();rb.textContent='Salvando gravação...';return;}
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){alert('O microfone não está disponível neste aparelho.');return;}
      navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
        stream=st;chunks=[];recorder=new MediaRecorder(st);
        recorder.ondataavailable=function(ev){if(ev.data.size)chunks.push(ev.data);};
        recorder.onstop=function(){var blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'}),fr=new FileReader();fr.onload=function(){audioData=fr.result;stream.getTracks().forEach(function(t){t.stop();});stream=null;recorder=null;refreshAudio();};fr.readAsDataURL(blob);};
        recorder.start();rb.textContent='Parar gravação';
      }).catch(function(){alert('Não foi possível acessar o microfone.');});
      return;
    }
  };
  [box.querySelector('[data-editor-image]'),box.querySelector('[data-editor-camera]')].forEach(function(inp){if(inp)inp.onchange=function(){readImageFile(inp.files&&inp.files[0],function(v){image=v;refreshPreview();});};});
  box.querySelector('#caaCardEditorForm').onsubmit=function(e){
    e.preventDefault();var f=new FormData(e.target);
    saveCardCustomization(cid,{label:String(f.get('label')||card.label).trim(),speech:String(f.get('speech')||f.get('label')||card.label).trim(),category:String(f.get('category')||card.category),image:image,audioData:audioData,voiceName:String(f.get('voiceName')||''),voicePreference:String(f.get('voicePreference')||'')});
    box.remove();renderManager();
  };
}
function bindBoardDrag(w){
  var list=w.querySelector('.caa-board-list');if(!list)return;
  var active=null,startX=0,startY=0,moved=false;
  list.querySelectorAll('[data-drag-handle]').forEach(function(handle){
    handle.onpointerdown=function(e){
      if(e.button!=null&&e.button!==0)return;
      var row=handle.closest('[data-drag-card]');if(!row)return;
      active=row;startX=e.clientX;startY=e.clientY;moved=false;
      manager.draggingId=row.getAttribute('data-drag-card');
      row.classList.add('drag-ready');
      handle.setPointerCapture&&handle.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    handle.onpointermove=function(e){
      if(!active)return;
      if(!moved&&Math.hypot(e.clientX-startX,e.clientY-startY)<8)return;
      moved=true;active.classList.add('dragging');active.classList.remove('drag-ready');
      var hit=document.elementFromPoint(e.clientX,e.clientY),target=hit&&hit.closest('[data-drag-card]');
      if(!target||target===active||target.parentNode!==list)return;
      var rect=target.getBoundingClientRect();
      if(e.clientY<rect.top+rect.height/2)list.insertBefore(active,target);
      else list.insertBefore(active,target.nextSibling);
    };
    handle.onpointerup=handle.onpointercancel=function(){
      if(!active)return;
      active.classList.remove('dragging','drag-ready');
      if(moved){
        var order=Array.from(list.querySelectorAll('[data-drag-card]')).map(function(x){return x.getAttribute('data-drag-card');});
        updateProfile(manager.patientId,function(x){x.draft=order;});
        setTimeout(renderManager,40);
      }
      active=null;manager.draggingId=null;
    };
  });
}
function bindManager(w,p){
  w.onclick=function(e){
    var t=e.target.closest('[data-caa-tab]');if(t){manager.tab=t.getAttribute('data-caa-tab');saveCAAUI('manager');renderManager();return;}
    if(e.target.closest('[data-caa-close]')){clearCAAUI();w.remove();inject();return;}
    if(e.target.closest('[data-caa-publish]')){publish(manager.patientId);return;}
    var tog=e.target.closest('[data-toggle-card]');if(tog){var cid=tog.getAttribute('data-toggle-card');updateProfile(manager.patientId,function(x){x.draft=x.draft||[];var i=x.draft.indexOf(cid);if(i>=0)x.draft.splice(i,1);else x.draft.push(cid);});renderManager();return;}
    var rm=e.target.closest('[data-remove]');if(rm){var rid=rm.getAttribute('data-remove');updateProfile(manager.patientId,function(x){x.draft=(x.draft||[]).filter(function(v){return v!==rid;});});renderManager();return;}
    var edit=e.target.closest('[data-edit-card]');if(edit){openCardEditor(edit.getAttribute('data-edit-card'));return;}
    var pc=e.target.closest('[data-preview-card]');if(pc){var c=cardById(profile(manager.patientId),pc.getAttribute('data-preview-card'));if(c){pc.classList.add('is-speaking');setTimeout(function(){pc.classList.remove('is-speaking');},350);var pr=profile(manager.patientId);if(window.FonelyCAASpeech)window.FonelyCAASpeech.speakCard(c,pr.settings);}return;}
    var cat=e.target.closest('[data-preview-cat]');if(cat){manager.previewCategory=cat.getAttribute('data-preview-cat');renderManager();return;}
    if(e.target.closest('[data-test-voice]')){window.FonelyCAASpeech&&window.FonelyCAASpeech.speak('Olá. Esta é a voz selecionada para o Fonely CAA.',profile(manager.patientId).settings);return;}
    if(e.target.closest('[data-copy-link]')){var inp=w.querySelector('#caaShareLink');if(inp){navigator.clipboard&&navigator.clipboard.writeText(inp.value);e.target.textContent='Copiado ✓';}return;}
    if(e.target.closest('[data-toggle-enabled]')){var changed=updateProfile(manager.patientId,function(x){x.enabled=!x.enabled;});if(changed&&changed.published)syncPublishedBoard(changed).catch(function(){});renderManager();return;}
    if(e.target.closest('[data-record-audio]')){toggleRecording();return;}
  };
  var s=w.querySelector('#caaSearch');if(s)s.oninput=function(){manager.search=s.value;renderManager();};
  var c=w.querySelector('#caaCategory');if(c)c.onchange=function(){manager.category=c.value;renderManager();};
  function setting(id,key,transform){var el=w.querySelector(id);if(el)el.oninput=el.onchange=function(){updateProfile(manager.patientId,function(x){x.settings[key]=transform?transform(el):el.value;});if(id==='#caaVolume'){var l=w.querySelector('#volLabel');if(l)l.textContent=el.value+'%';}if(id==='#caaRate'){var r=w.querySelector('#rateLabel');if(r)r.textContent=(Number(el.value)/100).toFixed(2)+'x';}};}
  setting('#caaVolume','volume',function(el){return Number(el.value)/100;});setting('#caaRate','rate',function(el){return Number(el.value)/100;});setting('#caaVoicePreference','voicePreference');setting('#caaVoice','voiceName');setting('#caaColumns','columns',function(el){return Number(el.value);});
  var img=w.querySelector('#caaCustomImage');if(img)img.onchange=function(){var f=img.files&&img.files[0];if(!f)return;var r=new FileReader();r.onload=function(){manager.customImage=r.result;renderManager();};r.readAsDataURL(f);};
  bindBoardDrag(w);
  var form=w.querySelector('#caaCustomForm');if(form)form.onsubmit=function(e){e.preventDefault();var fd=new FormData(form),label=String(fd.get('label')||'').trim();if(!label)return;var cc={id:'custom-'+id(),label:label,speech:String(fd.get('speech')||label),category:String(fd.get('category')||'Personalizados'),image:manager.customImage||window.FonelyCAALibrary.iconForCustom(),audioData:manager.customAudio||null,color:'#fff8f4',custom:true};updateProfile(manager.patientId,function(x){x.customCards=x.customCards||[];x.customCards.push(cc);x.draft=x.draft||[];x.draft.push(cc.id);});manager.customImage=null;manager.customAudio=null;manager.tab='board';renderManager();};
}
async function toggleRecording(){
  if(manager.recording&&manager.recorder){manager.recorder.stop();manager.recording=false;renderManager();return;}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){alert('Gravação de áudio não disponível neste dispositivo.');return;}
  try{var stream=await navigator.mediaDevices.getUserMedia({audio:true});manager.chunks=[];var rec=new MediaRecorder(stream);manager.recorder=rec;rec.ondataavailable=function(e){if(e.data.size)manager.chunks.push(e.data);};rec.onstop=function(){var blob=new Blob(manager.chunks,{type:rec.mimeType||'audio/webm'}),r=new FileReader();r.onload=function(){manager.customAudio=r.result;stream.getTracks().forEach(function(t){t.stop();});renderManager();};r.readAsDataURL(blob);};rec.start();manager.recording=true;renderManager();}catch(e){alert('Não foi possível acessar o microfone.');}
}
window.FonelyCAA={open:openManager,activate:activate,setPlan:function(v){if(v==='base'||v==='pro'){localStorage.setItem(PLAN_KEY,v);location.reload();}},data:caaData};
new MutationObserver(inject).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject);else inject();
})();