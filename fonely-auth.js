(async function(){
'use strict';

const SUPABASE_URL='https://apjmkstuffzgfhgcxhvt.supabase.co';
const SUPABASE_KEY='sb_publishable_5sMMkHGcwYcvsNltM2fWmw_m5Znd3z5';
const APP_URL='https://casalinhofisio.github.io/FONELY/';
const APP_SCRIPTS=[
  'app.js?v=11',
  'fonely-assessments-v2.js?v=2',
  'fonely-package-integration-v2.js?v=3',
  'fonely-full-edit-v1.js?v=2',
  'fonely-logo.js?v=5',
  'fonely-caa-library.js?v=2',
  'fonely-caa-speech.js?v=2',
  'fonely-caa.js?v=3'
];

let sb=null;
let appLoaded=false;
let appLoadPromise=null;
let authMounted=false;
let recoveryMode=/type=recovery/i.test(location.hash)||/type=recovery/i.test(location.search);

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
    '<header class="fe-top">'+
      '<img class="fe-logo" src="fonely-logo-official.svg" alt="Fonely">'+
      '<div class="fe-top-copy"><span>Plataforma para fonoaudiologia</span><b>Seu atendimento. Seu espaço.</b></div>'+
    '</header>'+
    '<main class="fe-main">'+
      '<section class="fe-hero">'+
        '<span class="fe-eyebrow">FONOAUDIOLOGIA EM UM SÓ LUGAR</span>'+
        '<h1>Menos sistema.<br><span>Mais clínica.</span></h1>'+
        '<p>Organize pacientes, agenda, avaliações, evoluções, documentos e financeiro em um espaço feito para a rotina fonoaudiológica.</p>'+
        '<div class="fe-feature-grid">'+
          '<div><i>01</i><b>Prontuário organizado</b><span>Histórico clínico centralizado por paciente.</span></div>'+
          '<div><i>02</i><b>Agenda inteligente</b><span>Sessões, pacotes e rotina diária conectados.</span></div>'+
          '<div><i>03</i><b>Avaliações de fono</b><span>Fluxos pensados para linguagem, fala e outras áreas.</span></div>'+
          '<div><i>04</i><b>Fonely CAA</b><span>Comunicação alternativa para quem realmente precisa.</span></div>'+
        '</div>'+
        '<div class="fe-product-preview">'+
          '<div class="fe-preview-head"><span></span><span></span><span></span><b>Fonely</b></div>'+
          '<div class="fe-preview-body">'+
            '<aside><i></i><i></i><i></i><i></i><i></i></aside>'+
            '<section><div class="fe-preview-title"></div><div class="fe-preview-cards"><i></i><i></i><i></i></div><div class="fe-preview-lines"><i></i><i></i><i></i><i></i></div></section>'+
          '</div>'+
        '</div>'+
      '</section>'+
      '<aside class="fe-card" id="feCard">'+
        '<div class="fe-card-brand"><img src="fonely-logo-official.svg" alt="Fonely"><span>ACESSO PROFISSIONAL</span></div>'+
        '<div class="fe-card-head"><h2 id="feTitle">Bem-vindo de volta</h2><p id="feSubtitle">Entre com seu e-mail e senha para acessar seu espaço.</p></div>'+
        '<div class="fe-tabs" id="feTabs"><button class="active" data-fe-tab="login">Entrar</button><button data-fe-tab="signup">Criar conta</button></div>'+
        '<form class="fe-form active" data-fe-form="login">'+
          '<label class="fe-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="seuemail@exemplo.com" required></label>'+
          '<label class="fe-field fe-password"><span>Senha</span><input type="password" name="password" autocomplete="current-password" placeholder="Sua senha" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
          '<div class="fe-forgot"><button type="button" data-fe-forgot>Esqueci minha senha</button></div>'+
          '<button class="fe-primary" type="submit">Entrar no Fonely</button>'+
        '</form>'+
        '<form class="fe-form" data-fe-form="signup">'+
          '<label class="fe-field"><span>Nome</span><input name="name" autocomplete="name" placeholder="Seu nome completo" required></label>'+
          '<label class="fe-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="voce@clinica.com" required></label>'+
          '<label class="fe-field fe-password"><span>Crie uma senha</span><input type="password" name="password" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" minlength="8" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
          '<label class="fe-field fe-password"><span>Repita a senha</span><input type="password" name="password2" autocomplete="new-password" placeholder="Digite a mesma senha" minlength="8" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
          '<button class="fe-primary" type="submit">Criar minha conta</button>'+
          '<p class="fe-helper">Depois do cadastro, enviaremos a confirmação para o seu e-mail.</p>'+
        '</form>'+
        '<div class="fe-reset" data-fe-reset>'+
          '<button class="fe-back" type="button" data-fe-back>← Voltar</button>'+
          '<h2>Recuperar acesso</h2><p>Digite seu e-mail para receber o link de redefinição de senha.</p>'+
          '<form data-fe-reset-form><label class="fe-field"><span>E-mail</span><input type="email" name="email" autocomplete="email" placeholder="seuemail@exemplo.com" required></label><button class="fe-primary">Enviar link</button></form>'+
        '</div>'+
        '<div class="fe-recovery" data-fe-recovery>'+
          '<h2>Criar nova senha</h2><p>Digite a nova senha duas vezes para concluir a recuperação.</p>'+
          '<form data-fe-recovery-form>'+
            '<label class="fe-field fe-password"><span>Nova senha</span><input type="password" name="password" autocomplete="new-password" minlength="8" placeholder="Mínimo de 8 caracteres" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
            '<label class="fe-field fe-password"><span>Repita a nova senha</span><input type="password" name="password2" autocomplete="new-password" minlength="8" placeholder="Digite novamente" required><button type="button" class="fe-show" data-fe-show>Mostrar</button></label>'+
            '<button class="fe-primary">Salvar nova senha</button>'+
          '</form>'+
        '</div>'+
        '<div class="fe-message" id="feMessage"></div>'+
        '<div class="fe-trust"><i></i><span>Conta protegida pelo Supabase Auth</span></div>'+
      '</aside>'+
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

async function prepareWorkspace(user){
  window.FONELY_USER_ID=user.id;
  window.FONELY_STORAGE_KEY='fonely_clean_v1_'+user.id;
  window.FONELY_CAA_KEY='fonely_caa_v1_'+user.id;
  window.FONELY_PLAN_KEY='fonely_plan_v1_'+user.id;

  var workspaceKey=window.FONELY_STORAGE_KEY;
  var localUserData=localStorage.getItem(workspaceKey);
  var legacy=localStorage.getItem('fonely_clean_v1');

  try{
    var result=await sb.from('workspace_state').select('data').eq('user_id',user.id).maybeSingle();
    if(result.error)throw result.error;
    if(result.data&&result.data.data&&Object.keys(result.data.data).length){
      localStorage.setItem(workspaceKey,JSON.stringify(result.data.data));
    }else if(localUserData){
      await sb.from('workspace_state').upsert({user_id:user.id,data:JSON.parse(localUserData),updated_at:new Date().toISOString()});
    }else if(legacy){
      var parsed=JSON.parse(legacy);
      localStorage.setItem(workspaceKey,legacy);
      await sb.from('workspace_state').upsert({user_id:user.id,data:parsed,updated_at:new Date().toISOString()});
    }
  }catch(e){
    console.warn('Fonely: não foi possível carregar a nuvem agora.',e);
  }

  var legacyCAA=localStorage.getItem('fonely_caa_v1');
  if(!localStorage.getItem(window.FONELY_CAA_KEY)&&legacyCAA)localStorage.setItem(window.FONELY_CAA_KEY,legacyCAA);

  try{
    var access=await sb.from('account_access').select('plan_tier,status').eq('user_id',user.id).maybeSingle();
    var tier=access.data&&access.data.plan_tier||'base';
    window.FONELY_PLAN_TIER=tier;
    localStorage.setItem(window.FONELY_PLAN_KEY,tier);
  }catch(e){
    window.FONELY_PLAN_TIER='base';
    localStorage.setItem(window.FONELY_PLAN_KEY,'base');
  }

  window.FonelyCloud={
    saveWorkspace:function(data){
      if(!sb||!user||!data)return;
      sb.from('workspace_state').upsert({
        user_id:user.id,
        data:data,
        updated_at:new Date().toISOString()
      }).then(function(r){if(r.error)console.warn('Fonely: falha ao sincronizar.',r.error);});
    },
    user:user,
    supabase:sb
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
  })();
  try{await appLoadPromise;}finally{if(!appLoaded)appLoadPromise=null;}
}

function mountAccount(user){
  function apply(){
    var a=document.querySelector('.account');
    if(!a)return false;
    a.querySelectorAll('.fe-app-user,.fe-app-exit').forEach(function(x){x.remove();});
    var info=document.createElement('div');
    info.className='fe-app-user';
    info.innerHTML='<small>'+esc(user.email||'')+'</small>';
    a.appendChild(info);
    var b=document.createElement('button');
    b.className='fe-app-exit';
    b.type='button';
    b.textContent='Sair';
    b.onclick=async function(){
      b.disabled=true;
      await sb.auth.signOut();
      location.replace(APP_URL);
    };
    a.appendChild(b);
    return true;
  }
  if(apply())return;
  var ob=new MutationObserver(function(){if(apply())ob.disconnect();});
  ob.observe(document.documentElement,{childList:true,subtree:true});
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