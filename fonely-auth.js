(async function(){
'use strict';

const SUPABASE_URL='https://apjmkstuffzgfhgcxhvt.supabase.co';
const SUPABASE_KEY='sb_publishable_5sMMkHGcwYcvsNltM2fWmw_m5Znd3z5';
const APP_URL='https://casalinhofisio.github.io/FONELY/';
const APP_SCRIPTS=[
  'app.js?v=15',
  'fonely-assessments-v2.js?v=6',
  'fonely-package-integration-v2.js?v=3',
  'fonely-full-edit-v1.js?v=2',
  'fonely-logo.js?v=5',
  'fonely-caa-library.js?v=3',
  'fonely-caa-speech.js?v=3',
  'fonely-caa.js?v=6'
];

let sb=null;
let appLoaded=false;
let appLoadPromise=null;
let authMounted=false;
let recoveryMode=/type=recovery/i.test(location.hash)||/type=recovery/i.test(location.search);
let inviteMode=/team_invite=1/i.test(location.search)||/type=invite/i.test(location.hash)||/type=invite/i.test(location.search);

function esc(v){
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function loadScript(src){
  return new Promise(function(resolve,reject){
    if(document.querySelector('script[data-fonely-app="'+src+'"]')){resolve();return;}
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.dataset.fonelyApp=src;
    s.onload=resolve;
    s.onerror=reject;
    document.body.appendChild(s);
  });
}

async function ensureSupabase(){
  if(window.supabase)return;
  await new Promise(function(resolve,reject){
    var s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
}

function authHTML(){
  return '<div class="fe-shell">'+
    '<main class="fe-frame">'+
      '<section class="fe-brand-side">'+
        '<div class="fe-brand-top">'+
          '<img class="fe-logo" src="fonely-logo-official.svg" alt="Fonely">'+
          '<span>SISTEMA PARA FONOAUDIÓLOGOS</span>'+
        '</div>'+
        '<div class="fe-hero">'+
          '<span class="fe-eyebrow">CLÍNICA ORGANIZADA, SEM COMPLICAÇÃO</span>'+
          '<h1>Seu consultório,<br><em>mais leve.</em></h1>'+
          '<p>Uma rotina mais simples para acompanhar pacientes, organizar a agenda e registrar cada evolução com clareza.</p>'+
          '<div class="fe-benefits">'+
            '<div><i>01</i><span><b>Pacientes</b><small>Prontuário e histórico em um só lugar.</small></span></div>'+
            '<div><i>02</i><span><b>Agenda</b><small>Atendimentos e recorrências organizados.</small></span></div>'+
            '<div><i>03</i><span><b>Avaliações</b><small>Fluxos pensados para fonoaudiologia.</small></span></div>'+
          '</div>'+
        '</div>'+
        '<div class="fe-product-card">'+
          '<div class="fe-product-top"><div><small>FONELY</small><b>Visão do dia</b></div><span>Hoje</span></div>'+
          '<div class="fe-product-stats"><div><small>Atendimentos</small><b>5</b></div><div><small>Próximos</small><b>3</b></div><div><small>Avaliações</small><b>2</b></div></div>'+
          '<div class="fe-product-row"><i></i><span><b>Agenda organizada</b><small>Seus próximos horários em destaque</small></span><strong>→</strong></div>'+
          '<div class="fe-product-row"><i></i><span><b>Prontuário conectado</b><small>Avaliações e evoluções por paciente</small></span><strong>→</strong></div>'+
        '</div>'+
        '<div class="fe-brand-note">Mais escuta para mais conquistas.</div>'+
      '</section>'+
      '<section class="fe-auth-side">'+
        '<aside class="fe-card" id="feCard">'+
          '<div class="fe-auth-brand"><img src="fonely-logo-official.svg" alt="Fonely"></div>'+
          '<div class="fe-card-head"><span class="fe-auth-kicker">ACESSO PROFISSIONAL</span><h2 id="feTitle">Bem-vindo de volta</h2><p id="feSubtitle">Entre para acessar seu espaço no Fonely.</p></div>'+
          '<div class="fe-tabs" id="feTabs"><button class="active" data-fe-tab="login">Entrar</button><button data-fe-tab="signup">Criar conta</button></div>'+
          '<form class="fe-form active" data-fe-form="login">'+
            '<label class="fe-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="seuemail@exemplo.com" required></label>'+
            '<label class="fe-field fe-password"><span>Senha</span><input type="password" name="password" autocomplete="current-password" placeholder="Digite sua senha" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
            '<div class="fe-forgot"><button type="button" data-fe-forgot>Esqueci minha senha</button></div>'+
            '<button class="fe-primary" type="submit">Entrar no Fonely</button>'+
          '</form>'+
          '<form class="fe-form" data-fe-form="signup">'+
            '<label class="fe-field"><span>Nome completo</span><input name="name" autocomplete="name" placeholder="Seu nome completo" required></label>'+
            '<label class="fe-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="voce@clinica.com" required></label>'+
            '<label class="fe-field fe-password"><span>Crie uma senha</span><input type="password" name="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" minlength="8" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
            '<label class="fe-field fe-password"><span>Repita a senha</span><input type="password" name="password2" autocomplete="new-password" placeholder="Digite a mesma senha" minlength="8" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
            '<button class="fe-primary" type="submit">Criar minha conta</button>'+
            '<p class="fe-helper">Você receberá um e-mail para confirmar seu cadastro.</p>'+
          '</form>'+
          '<div class="fe-reset" data-fe-reset>'+
            '<button class="fe-back" type="button" data-fe-back>← Voltar</button>'+
            '<span class="fe-auth-kicker">RECUPERAR ACESSO</span><h2>Esqueceu sua senha?</h2><p>Digite seu e-mail e enviaremos um link seguro para criar uma nova senha.</p>'+
            '<form data-fe-reset-form><label class="fe-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="seuemail@exemplo.com" required></label><button class="fe-primary">Enviar link</button></form>'+
          '</div>'+
          '<div class="fe-recovery" data-fe-recovery>'+
            '<span class="fe-auth-kicker">NOVA SENHA</span><h2>Criar nova senha</h2><p>Digite a nova senha duas vezes para concluir a recuperação.</p>'+
            '<form data-fe-recovery-form>'+
              '<label class="fe-field fe-password"><span>Nova senha</span><input type="password" name="password" autocomplete="new-password" minlength="8" placeholder="Mínimo de 8 caracteres" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
              '<label class="fe-field fe-password"><span>Repita a nova senha</span><input type="password" name="password2" autocomplete="new-password" minlength="8" placeholder="Digite novamente" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
              '<button class="fe-primary">Salvar nova senha</button>'+
            '</form>'+
          '</div>'+
          '<div class="fe-message" id="feMessage"></div>'+
          '<div class="fe-trust"><i></i><span>Seus dados protegidos e vinculados à sua conta</span></div>'+
        '</aside>'+
      '</section>'+
    '</main>'+
  '</div>';
}
function mountAuth(){
  var old=document.getElementById('fonelyEntry');
  if(old)old.remove();
  var w=document.createElement('div');
  w.id='fonelyEntry';
  w.innerHTML=authHTML();
  document.body.appendChild(w);
  document.body.classList.add('fonely-entry-open');
  authMounted=true;
  bindAuth(w);
}

function setMessage(text,type){
  var n=document.getElementById('feMessage');
  if(!n)return;
  n.className='fe-message show '+(type||'info');
  n.textContent=text;
}

function clearMessage(){
  var n=document.getElementById('feMessage');
  if(!n)return;
  n.className='fe-message';
  n.textContent='';
}

function setTab(mode){
  var w=document.getElementById('fonelyEntry');
  if(!w)return;
  recoveryMode=false;
  w.querySelector('[data-fe-reset]').classList.remove('active');
  w.querySelector('[data-fe-recovery]').classList.remove('active');
  w.querySelector('#feTabs').style.display='grid';
  w.querySelectorAll('[data-fe-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.feTab===mode);});
  w.querySelectorAll('[data-fe-form]').forEach(function(f){f.classList.toggle('active',f.dataset.feForm===mode);});
  w.querySelector('#feTitle').textContent=mode==='signup'?'Crie seu espaço no Fonely':'Bem-vindo de volta';
  w.querySelector('#feSubtitle').textContent=mode==='signup'?'Cadastre-se com e-mail e senha. Depois confirme seu e-mail.':'Entre com seu e-mail e senha para acessar seu espaço.';
  clearMessage();
}

function showReset(email){
  var w=document.getElementById('fonelyEntry');
  if(!w)return;
  w.querySelectorAll('[data-fe-form]').forEach(function(f){f.classList.remove('active');});
  w.querySelector('[data-fe-reset]').classList.add('active');
  w.querySelector('[data-fe-recovery]').classList.remove('active');
  w.querySelector('#feTabs').style.display='none';
  w.querySelector('#feTitle').textContent='Recuperar acesso';
  w.querySelector('#feSubtitle').textContent='Vamos enviar um link seguro para seu e-mail.';
  var input=w.querySelector('[data-fe-reset-form] input[name="email"]');
  if(input&&email)input.value=email;
  clearMessage();
}

function showRecovery(){
  recoveryMode=true;
  if(!authMounted)mountAuth();
  var w=document.getElementById('fonelyEntry');
  if(!w)return;
  w.querySelectorAll('[data-fe-form]').forEach(function(f){f.classList.remove('active');});
  w.querySelector('[data-fe-reset]').classList.remove('active');
  w.querySelector('[data-fe-recovery]').classList.add('active');
  w.querySelector('#feTabs').style.display='none';
  w.querySelector('#feTitle').textContent='Nova senha';
  w.querySelector('#feSubtitle').textContent='Finalize a recuperação da sua conta Fonely.';
  clearMessage();
}

function friendlyError(err){
  var m=String(err&&err.message||err||'');
  if(/Invalid login credentials/i.test(m))return 'E-mail ou senha incorretos.';
  if(/Email not confirmed/i.test(m))return 'Seu e-mail ainda não foi confirmado. Abra o e-mail do Fonely e confirme sua conta.';
  if(/already registered|already been registered|User already registered/i.test(m))return 'Esse e-mail já está cadastrado. Tente entrar ou recuperar a senha.';
  if(/Password should be at least/i.test(m))return 'A senha precisa ter pelo menos 8 caracteres.';
  if(/rate limit/i.test(m))return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  return 'Não foi possível continuar. '+m;
}

function accountDate(value){
  if(!value)return 'Sem vencimento';
  try{return new Date(value).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});}catch(e){return '—';}
}
function accountPlanLabel(tier){return tier==='pro'?'Fonely Pro':'Fonely Básico';}
function accountStatusLabel(status){
  return {active:'Ativo',trialing:'Período de teste',past_due:'Pagamento pendente',inactive:'Inativo'}[status]||'Ativo';
}
function accountStatusClass(status){
  return status==='active'?'ok':status==='trialing'?'trial':status==='past_due'?'warn':'off';
}
function updateProfileAvatarUI(url,name){
  document.querySelectorAll('.top-account-avatar').forEach(function(box){
    box.classList.remove('fallback');
    box.innerHTML='<img data-profile-avatar src="'+esc(url)+'" alt="'+esc(name||'Profissional')+'">';
  });
  var photo=document.querySelector('.fe-account-photo');
  if(photo){photo.classList.remove('fallback');photo.innerHTML='<img src="'+esc(url)+'" alt="'+esc(name||'Profissional')+'"><span class="fe-account-photo-edit">Alterar</span>';}
}
function restoreProfileAvatarFallback(name){
  var initial=(name||'F').charAt(0).toUpperCase();
  document.querySelectorAll('.top-account-avatar').forEach(function(box){
    box.classList.add('fallback');
    box.textContent=initial;
  });
  var photo=document.querySelector('.fe-account-photo');
  if(photo){photo.classList.add('fallback');photo.innerHTML=esc(initial)+'<span class="fe-account-photo-edit">Adicionar foto</span>';}
}
function oldAvatarStoragePath(url){
  var marker='/storage/v1/object/public/profile-avatars/';
  var i=String(url||'').indexOf(marker);
  return i>=0?decodeURIComponent(String(url).slice(i+marker.length).split('?')[0]):'';
}
async function uploadProfileAvatar(file,button,msg){
  var account=window.FonelyAccount||{},profile=account.profile||{},user=account.user||{};
  var name=profile.full_name||String(user.email||'Profissional').split('@')[0]||'Profissional';
  if(!file)return;
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)){msg.className='fe-account-message show error';msg.textContent='Use uma foto JPG, PNG ou WebP.';return;}
  if(file.size>5*1024*1024){msg.className='fe-account-message show error';msg.textContent='A foto pode ter no máximo 5 MB.';return;}

  var previous=profile.avatar_url||'';
  var preview=URL.createObjectURL(file);
  updateProfileAvatarUI(preview,name);
  button.disabled=true;
  button.textContent='Salvando foto...';
  msg.className='fe-account-message show';
  msg.textContent='Enviando sua foto...';

  try{
    var ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
    var path=user.id+'/avatar-'+Date.now()+'.'+ext;
    var up=await sb.storage.from('profile-avatars').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
    if(up.error)throw up.error;
    var pub=sb.storage.from('profile-avatars').getPublicUrl(path);
    var publicUrl=pub.data&&pub.data.publicUrl;
    if(!publicUrl)throw new Error('Não foi possível obter a URL da foto.');
    var saved=await sb.from('profiles').update({avatar_url:publicUrl,updated_at:new Date().toISOString()}).eq('id',user.id);
    if(saved.error)throw saved.error;

    profile.avatar_url=publicUrl;
    window.FonelyAccount.profile=profile;
    updateProfileAvatarUI(publicUrl,name);
    var oldPath=oldAvatarStoragePath(previous);
    if(oldPath&&oldPath!==path)sb.storage.from('profile-avatars').remove([oldPath]).then(function(){});
    msg.className='fe-account-message show success';
    msg.textContent='Foto atualizada.';
  }catch(err){
    if(previous)updateProfileAvatarUI(previous,name);
    else restoreProfileAvatarFallback(name);
    msg.className='fe-account-message show error';
    msg.textContent='Não foi possível salvar a foto. '+String(err&&err.message||err||'');
  }finally{
    URL.revokeObjectURL(preview);
    button.disabled=false;
    button.textContent='Alterar foto';
  }
}
function clearTeamLocalCache(){
  var a=window.FonelyAccount||{},t=a.team||{},u=a.user||{};
  if(t.isOwner===false&&t.ownerId){
    localStorage.removeItem('fonely_clean_v1_'+t.ownerId);
    localStorage.removeItem('fonely_caa_v1_'+t.ownerId);
    localStorage.removeItem('fonely_plan_v1_'+t.ownerId);
    if(u.id)localStorage.removeItem('fonely_last_team_owner_'+u.id);
  }
}
function openAccountPanel(){
  var account=window.FonelyAccount||{},profile=account.profile||{},access=account.access||{},user=account.user||{},team=account.team||{};
  var isTeamMember=team.isOwner===false;
  var old=document.getElementById('fonelyAccountOverlay');if(old)old.remove();
  var expiry=access.status==='trialing'&&access.trial_ends_at?access.trial_ends_at:access.plan_ends_at;
  var validity=expiry?accountDate(expiry):(access.plan_tier==='base'?'Sem vencimento':'Sem data definida');
  var name=profile.full_name||String(user.email||'Profissional').split('@')[0]||'Profissional';
  var joined=profile.created_at?accountDate(profile.created_at):'—';
  var initial=(name||'F').charAt(0).toUpperCase();
  var photo=profile.avatar_url
    ?'<div class="fe-account-photo"><img src="'+esc(profile.avatar_url)+'" alt="'+esc(name)+'"><span class="fe-account-photo-edit">Alterar</span></div>'
    :'<div class="fe-account-photo fallback">'+esc(initial)+'<span class="fe-account-photo-edit">Adicionar foto</span></div>';
  var planBlock=isTeamMember
    ?'<div class="fe-account-plan"><div><span>ACESSO À CLÍNICA</span><b>'+esc(team.role||'Profissional')+'</b></div><mark class="ok">Sem cobrança individual</mark></div>'
    :'<div class="fe-account-plan"><div><span>PLANO ATUAL</span><b>'+esc(accountPlanLabel(access.plan_tier))+'</b></div><mark class="'+accountStatusClass(access.status)+'">'+esc(accountStatusLabel(access.status))+'</mark></div>';
  var grid=isTeamMember
    ?'<div class="fe-account-grid">'+
       '<div><small>VÍNCULO</small><b>Membro da equipe</b></div>'+
       '<div><small>MEMBRO DESDE</small><b>'+esc(joined)+'</b></div>'+
       '<div><small>ACESSO AO CAA</small><b>'+(access.plan_tier==='pro'?'Liberado pela clínica':'Conforme o plano da clínica')+'</b></div>'+
       '<div><small>FINANCEIRO GERAL</small><b>'+(team.permissions&&team.permissions.finance?'Liberado pela proprietária':'Sem acesso')+'</b></div>'+
      '</div>'
    :'<div class="fe-account-grid">'+
       '<div><small>VALIDADE / RENOVAÇÃO</small><b>'+esc(validity)+'</b></div>'+
       '<div><small>MEMBRO DESDE</small><b>'+esc(joined)+'</b></div>'+
       '<div><small>ACESSO AO CAA</small><b>'+(access.plan_tier==='pro'?'Liberado':'Somente no Pro')+'</b></div>'+
       '<div><small>CANCELAMENTO</small><b>'+(access.cancel_at_period_end?'Ao fim do período':'Nenhum agendado')+'</b></div>'+
      '</div>';
  var w=document.createElement('div');w.id='fonelyAccountOverlay';w.className='fe-account-overlay';
  w.innerHTML='<div class="fe-account-panel">'+
    '<div class="fe-account-top"><div class="fe-account-identity">'+photo+'<div><small>MINHA CONTA</small><h2>'+esc(name)+'</h2><p>'+esc(user.email||profile.email||'')+'</p><button type="button" class="fe-photo-button" data-account-photo>Alterar foto</button><input type="file" accept="image/jpeg,image/png,image/webp" data-account-photo-input hidden></div></div><button type="button" data-account-close>×</button></div>'+
    planBlock+grid+
    '<div class="fe-account-actions"><button type="button" class="soft-btn" data-account-password>Alterar senha</button><button type="button" class="fe-account-logout" data-account-logout>Sair da conta</button></div>'+
    '<div class="fe-account-message" data-account-message></div>'+
  '</div>';
  document.body.appendChild(w);
  w.querySelector('[data-account-close]').onclick=function(){w.remove();};
  w.onclick=function(e){if(e.target===w)w.remove();};

  var photoButton=w.querySelector('[data-account-photo]'),photoInput=w.querySelector('[data-account-photo-input]'),msg=w.querySelector('[data-account-message]');
  photoButton.onclick=function(){photoInput.click();};
  w.querySelector('.fe-account-photo').onclick=function(){photoInput.click();};
  photoInput.onchange=function(){if(photoInput.files&&photoInput.files[0])uploadProfileAvatar(photoInput.files[0],photoButton,msg);};

  var logout=w.querySelector('[data-account-logout]');
  logout.onclick=async function(){logout.disabled=true;logout.textContent='Saindo...';clearTeamLocalCache();await sb.auth.signOut();location.replace(APP_URL);};
  var pass=w.querySelector('[data-account-password]');
  pass.onclick=async function(){
    pass.disabled=true;pass.textContent='Enviando...';
    try{
      var email=user.email||profile.email;
      if(!email)throw new Error('E-mail da conta não encontrado.');
      var result=await sb.auth.resetPasswordForEmail(email,{redirectTo:APP_URL});
      if(result.error)throw result.error;
      msg.className='fe-account-message show success';msg.textContent='Enviei o link para alterar a senha no seu e-mail.';
    }catch(err){
      msg.className='fe-account-message show error';msg.textContent=friendlyError(err);
    }finally{pass.disabled=false;pass.textContent='Alterar senha';}
  };
}
window.FonelyAccountUI={open:openAccountPanel};

async function prepareWorkspace(user){
  window.FONELY_USER_ID=user.id;

  var membership=null;
  try{
    var mr=await sb.from('clinic_members')
      .select('id,owner_id,user_id,email,name,role,permissions,status,invited_at,accepted_at,created_at')
      .eq('user_id',user.id).eq('status','active')
      .order('created_at',{ascending:true}).limit(1);
    if(!mr.error&&mr.data&&mr.data.length)membership=mr.data[0];
  }catch(e){console.warn('Fonely: não foi possível verificar o vínculo da equipe.',e);}

  var isOwner=!membership;
  var workspaceOwnerId=membership?membership.owner_id:user.id;
  var defaultPermissions={patients:true,agenda:true,assessments:true,evolutions:true,documents:true,caa:true,finance:false,reports:false,manage_team:false};
  var permissions=isOwner
    ?{patients:true,agenda:true,assessments:true,evolutions:true,documents:true,caa:true,finance:true,reports:true,manage_team:true}
    :Object.assign({},defaultPermissions,membership.permissions||{});
  var teamContext={
    isOwner:isOwner,
    ownerId:workspaceOwnerId,
    memberId:membership&&membership.id||null,
    name:membership&&membership.name||'',
    role:membership&&membership.role||'Proprietário',
    permissions:permissions
  };

  var lastTeamKey='fonely_last_team_owner_'+user.id;
  var previousTeamOwner=localStorage.getItem(lastTeamKey);
  if(isOwner&&previousTeamOwner&&previousTeamOwner!==user.id){
    localStorage.removeItem('fonely_clean_v1_'+previousTeamOwner);
    localStorage.removeItem('fonely_caa_v1_'+previousTeamOwner);
    localStorage.removeItem('fonely_plan_v1_'+previousTeamOwner);
    localStorage.removeItem(lastTeamKey);
  }
  if(!isOwner)localStorage.setItem(lastTeamKey,workspaceOwnerId);

  window.FONELY_WORKSPACE_OWNER_ID=workspaceOwnerId;
  window.FONELY_STORAGE_KEY='fonely_clean_v1_'+workspaceOwnerId;
  window.FONELY_CAA_KEY='fonely_caa_v1_'+workspaceOwnerId;
  window.FONELY_PLAN_KEY='fonely_plan_v1_'+workspaceOwnerId;

  var workspaceKey=window.FONELY_STORAGE_KEY;
  var localUserData=localStorage.getItem(workspaceKey);
  var legacy=localStorage.getItem('fonely_clean_v1');

  try{
    if(isOwner){
      var result=await sb.from('workspace_state').select('data').eq('user_id',workspaceOwnerId).maybeSingle();
      if(result.error)throw result.error;
      if(result.data&&result.data.data&&Object.keys(result.data.data).length){
        localStorage.setItem(workspaceKey,JSON.stringify(result.data.data));
      }else if(localUserData){
        await sb.from('workspace_state').upsert({user_id:workspaceOwnerId,data:JSON.parse(localUserData),updated_at:new Date().toISOString()});
      }else if(legacy){
        var parsed=JSON.parse(legacy);
        localStorage.setItem(workspaceKey,legacy);
        await sb.from('workspace_state').upsert({user_id:workspaceOwnerId,data:parsed,updated_at:new Date().toISOString()});
      }
    }else{
      var cloudLoad=await sb.functions.invoke('team-workspace',{body:{action:'load'}});
      if(cloudLoad.error)throw cloudLoad.error;
      if(cloudLoad.data&&cloudLoad.data.data){
        localStorage.setItem(workspaceKey,JSON.stringify(cloudLoad.data.data));
        if(cloudLoad.data.member){
          membership.name=cloudLoad.data.member.name||membership.name;
          membership.role=cloudLoad.data.member.role||membership.role;
          membership.permissions=cloudLoad.data.member.permissions||membership.permissions;
          teamContext.role=membership.role;
          teamContext.permissions=Object.assign({},defaultPermissions,membership.permissions||{});
        }
      }
    }
  }catch(e){
    console.warn('Fonely: não foi possível carregar o espaço compartilhado agora.',e);
  }

  var legacyCAA=localStorage.getItem('fonely_caa_v1');
  if(isOwner&&!localStorage.getItem(window.FONELY_CAA_KEY)&&legacyCAA)localStorage.setItem(window.FONELY_CAA_KEY,legacyCAA);

  var profileData={full_name:(user.user_metadata&&user.user_metadata.full_name)||'',email:user.email,avatar_url:'',created_at:user.created_at};
  var accessData={plan_tier:'base',status:'active',plan_started_at:null,plan_ends_at:null,trial_ends_at:null,cancel_at_period_end:false,team_member_limit:0};
  try{
    var accountResults=await Promise.all([
      sb.from('profiles').select('full_name,email,avatar_url,created_at,updated_at').eq('id',user.id).maybeSingle(),
      sb.from('account_access').select('plan_tier,status,plan_started_at,plan_ends_at,trial_ends_at,cancel_at_period_end,team_member_limit,created_at,updated_at').eq('user_id',workspaceOwnerId).maybeSingle()
    ]);
    if(accountResults[0].data)profileData=Object.assign(profileData,accountResults[0].data);
    if(accountResults[1].data)accessData=Object.assign(accessData,accountResults[1].data);
  }catch(e){
    console.warn('Fonely: não foi possível carregar os dados da conta.',e);
  }

  var teamMembers=[];
  if(isOwner||teamContext.permissions.manage_team){
    try{
      var tr=await sb.from('clinic_members')
        .select('id,owner_id,user_id,email,name,role,permissions,status,invited_at,accepted_at,last_active_at,created_at,updated_at')
        .eq('owner_id',workspaceOwnerId).eq('status','active')
        .order('created_at',{ascending:true});
      if(!tr.error&&tr.data)teamMembers=tr.data;
    }catch(e){console.warn('Fonely: não foi possível carregar a equipe.',e);}
  }

  window.FONELY_PLAN_TIER=accessData.plan_tier||'base';
  localStorage.setItem(window.FONELY_PLAN_KEY,window.FONELY_PLAN_TIER);
  window.FonelyTeamMembers=teamMembers;
  window.FonelyAccount={user:user,profile:profileData,access:accessData,team:teamContext};

  window.FonelyCloud={
    saveWorkspace:function(data){
      if(!sb||!user||!data)return;
      if(isOwner){
        sb.from('workspace_state').upsert({
          user_id:workspaceOwnerId,
          data:data,
          updated_at:new Date().toISOString()
        }).then(function(r){if(r.error)console.warn('Fonely: falha ao sincronizar.',r.error);});
      }else{
        sb.functions.invoke('team-workspace',{body:{action:'save',data:data}})
          .then(function(r){if(r.error)console.warn('Fonely: falha ao sincronizar espaço da equipe.',r.error);});
      }
    },
    user:user,
    workspaceOwnerId:workspaceOwnerId,
    isOwner:isOwner,
    permissions:teamContext.permissions,
    supabase:sb
  };
}
function showTeamInviteSetup(){
  if(!inviteMode||document.getElementById('fonelyTeamInviteSetup'))return;
  var account=window.FonelyAccount||{},team=account.team||{};
  if(team.isOwner!==false){inviteMode=false;return;}
  var w=document.createElement('div');
  w.id='fonelyTeamInviteSetup';
  w.className='fe-account-overlay';
  w.innerHTML='<div class="fe-account-panel">'+
    '<div class="fe-account-top"><div><small class="fe-auth-kicker">CONVITE ACEITO</small><h2>Crie sua senha</h2><p>Seu acesso à equipe do Fonely já está ativo. Crie uma senha para entrar depois com seu e-mail.</p></div></div>'+
    '<form data-team-invite-password>'+
      '<label class="fe-field"><span>Nova senha</span><input type="password" name="password" minlength="8" autocomplete="new-password" required></label>'+
      '<label class="fe-field"><span>Repita a senha</span><input type="password" name="password2" minlength="8" autocomplete="new-password" required></label>'+
      '<button class="fe-primary" type="submit">Salvar senha e entrar</button>'+
    '</form>'+
    '<div class="fe-account-message" data-team-invite-message></div>'+
  '</div>';
  document.body.appendChild(w);
  var form=w.querySelector('[data-team-invite-password]'),msg=w.querySelector('[data-team-invite-message]');
  form.onsubmit=async function(e){
    e.preventDefault();
    var fd=new FormData(form),p=String(fd.get('password')||''),p2=String(fd.get('password2')||''),btn=form.querySelector('button');
    if(p.length<8){msg.className='fe-account-message show error';msg.textContent='A senha precisa ter pelo menos 8 caracteres.';return;}
    if(p!==p2){msg.className='fe-account-message show error';msg.textContent='As duas senhas precisam ser iguais.';return;}
    btn.disabled=true;btn.textContent='Salvando...';
    var r=await sb.auth.updateUser({password:p});
    if(r.error){msg.className='fe-account-message show error';msg.textContent=friendlyError(r.error);btn.disabled=false;btn.textContent='Salvar senha e entrar';return;}
    inviteMode=false;
    if(history.replaceState)history.replaceState({},document.title,APP_URL);
    w.remove();
  };
}

async function loadApp(user){
  if(appLoaded)return;
  if(appLoadPromise)return appLoadPromise;
  appLoadPromise=(async function(){
    await prepareWorkspace(user);
    var entry=document.getElementById('fonelyEntry');
    if(entry)entry.remove();
    document.body.classList.remove('fonely-entry-open');
    for(var i=0;i<APP_SCRIPTS.length;i++)await loadScript(APP_SCRIPTS[i]);
    appLoaded=true;
    mountAccount(user);
    if(inviteMode)setTimeout(showTeamInviteSetup,80);
  })();
  try{await appLoadPromise;}finally{if(!appLoaded)appLoadPromise=null;}
}
function mountAccount(user){
  var button=document.getElementById('accountMenu');
  if(button&&window.FonelyAccountUI)button.onclick=function(){window.FonelyAccountUI.open();};
}

function bindAuth(w){
  w.querySelectorAll('[data-fe-tab]').forEach(function(b){b.onclick=function(){setTab(b.dataset.feTab);};});
  w.querySelectorAll('[data-fe-show]').forEach(function(b){
    b.onclick=function(){
      var input=b.parentElement.querySelector('input');
      input.type=input.type==='password'?'text':'password';
      b.textContent=input.type==='password'?'Mostrar':'Ocultar';
    };
  });

  var login=w.querySelector('[data-fe-form="login"]');
  login.onsubmit=async function(e){
    e.preventDefault();clearMessage();
    var fd=new FormData(login),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||'');
    var btn=login.querySelector('.fe-primary');btn.disabled=true;btn.textContent='Entrando...';
    try{
      var r=await sb.auth.signInWithPassword({email:email,password:password});
      if(r.error)throw r.error;
      await loadApp(r.data.user);
    }catch(err){setMessage(friendlyError(err),'error');}
    finally{btn.disabled=false;btn.textContent='Entrar no Fonely';}
  };

  var signup=w.querySelector('[data-fe-form="signup"]');
  signup.onsubmit=async function(e){
    e.preventDefault();clearMessage();
    var fd=new FormData(signup),name=String(fd.get('name')||'').trim(),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||''),password2=String(fd.get('password2')||'');
    if(password.length<8){setMessage('A senha precisa ter pelo menos 8 caracteres.','error');return;}
    if(password!==password2){setMessage('As duas senhas precisam ser iguais.','error');return;}
    var btn=signup.querySelector('.fe-primary');btn.disabled=true;btn.textContent='Criando conta...';
    try{
      var r=await sb.auth.signUp({
        email:email,
        password:password,
        options:{
          data:{name:name,full_name:name},
          emailRedirectTo:APP_URL
        }
      });
      if(r.error)throw r.error;
      if(r.data&&r.data.session)await sb.auth.signOut();
      setTab('login');
      var loginEmail=w.querySelector('[data-fe-form="login"] input[name="email"]');
      if(loginEmail)loginEmail.value=email;
      setMessage('Conta criada! Confira seu e-mail e confirme o cadastro. Depois, volte aqui e entre normalmente.','success');
    }catch(err){setMessage(friendlyError(err),'error');}
    finally{btn.disabled=false;btn.textContent='Criar minha conta';}
  };

  var forgot=w.querySelector('[data-fe-forgot]');
  forgot.onclick=function(){
    var email=w.querySelector('[data-fe-form="login"] input[name="email"]').value;
    showReset(email);
  };

  w.querySelector('[data-fe-back]').onclick=function(){setTab('login');};

  var reset=w.querySelector('[data-fe-reset-form]');
  reset.onsubmit=async function(e){
    e.preventDefault();clearMessage();
    var email=String(new FormData(reset).get('email')||'').trim();
    var btn=reset.querySelector('.fe-primary');btn.disabled=true;btn.textContent='Enviando...';
    try{
      var r=await sb.auth.resetPasswordForEmail(email,{redirectTo:APP_URL});
      if(r.error)throw r.error;
      setMessage('Link enviado. Abra o e-mail do Fonely para criar uma nova senha.','success');
    }catch(err){setMessage(friendlyError(err),'error');}
    finally{btn.disabled=false;btn.textContent='Enviar link';}
  };

  var recovery=w.querySelector('[data-fe-recovery-form]');
  recovery.onsubmit=async function(e){
    e.preventDefault();clearMessage();
    var fd=new FormData(recovery),p=String(fd.get('password')||''),p2=String(fd.get('password2')||'');
    if(p.length<8){setMessage('A nova senha precisa ter pelo menos 8 caracteres.','error');return;}
    if(p!==p2){setMessage('As duas senhas precisam ser iguais.','error');return;}
    var btn=recovery.querySelector('.fe-primary');btn.disabled=true;btn.textContent='Salvando...';
    try{
      var r=await sb.auth.updateUser({password:p});
      if(r.error)throw r.error;
      await sb.auth.signOut();
      recoveryMode=false;
      setTab('login');
      setMessage('Senha alterada com sucesso. Entre novamente com sua nova senha.','success');
      if(history.replaceState)history.replaceState({},document.title,APP_URL);
    }catch(err){setMessage(friendlyError(err),'error');}
    finally{btn.disabled=false;btn.textContent='Salvar nova senha';}
  };
}

try{
  await ensureSupabase();
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  window.fonelySupabase=sb;

  sb.auth.onAuthStateChange(function(event,session){
    if(event==='PASSWORD_RECOVERY'){
      recoveryMode=true;
      showRecovery();
      return;
    }
    if(event==='SIGNED_OUT'&&!recoveryMode){
      clearTeamLocalCache();
      appLoaded=false;
      mountAuth();
      setTab('login');
      return;
    }
    if(event==='SIGNED_IN'&&session&&session.user&&!recoveryMode){
      loadApp(session.user);
    }
  });

  var sessionResult=await sb.auth.getSession();
  if(recoveryMode){
    showRecovery();
  }else if(sessionResult.data&&sessionResult.data.session){
    await loadApp(sessionResult.data.session.user);
  }else{
    mountAuth();
  }
}catch(err){
  console.error(err);
  mountAuth();
  setMessage('Não foi possível conectar ao servidor do Fonely agora. Atualize a página e tente novamente.','error');
}
})();