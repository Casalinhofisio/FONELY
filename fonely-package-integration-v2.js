(function(){
'use strict';
var KEY='fonely_clean_v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return {};}}
function save(d){localStorage.setItem(KEY,JSON.stringify(d));}
function isDone(status){return ['Concluído','Atendido','Realizado','Atendido / realizado'].indexOf(String(status||''))>=0;}
function normalizeDone(status){return isDone(status)?'Concluído':status;}
function byDateAsc(a,b){return ((a.date||'')+(a.time||'')).localeCompare((b.date||'')+(b.time||''));}
function reconcile(){
 var d=load(),changed=false;
 d.packages=Array.isArray(d.packages)?d.packages:[];
 d.appointments=Array.isArray(d.appointments)?d.appointments:[];
 var pkgById={};d.packages.forEach(function(p){pkgById[p.id]=p;});
 d.appointments.forEach(function(a){var n=normalizeDone(a.status);if(n!==a.status){a.status=n;changed=true;}});
 var used={};d.packages.forEach(function(p){used[p.id]=0;});
 d.appointments.forEach(function(a){if(isDone(a.status)&&a.packageId&&pkgById[a.packageId])used[a.packageId]=(used[a.packageId]||0)+1;});
 var ordered=d.appointments.slice().sort(byDateAsc);
 ordered.forEach(function(a){
   if(a.packageId||!a.patientId)return;
   var candidates=d.packages.filter(function(p){return p.patientId===a.patientId&&Number(p.sessions||0)>(used[p.id]||0);});
   if(!candidates.length)return;
   candidates.sort(function(x,y){return (y.startDate||'').localeCompare(x.startDate||'');});
   var dated=candidates.filter(function(p){return !p.startDate||!a.date||p.startDate<=a.date;});
   var pkg=(dated[0]||candidates[0]);
   if(pkg){a.packageId=pkg.id;changed=true;if(isDone(a.status))used[pkg.id]=(used[pkg.id]||0)+1;}
 });
 d.packages.forEach(function(p){
   var count=d.appointments.filter(function(a){return a.packageId===p.id&&isDone(a.status);}).length;
   var newStatus=count>=Number(p.sessions||0)?'Encerrado':'Ativo';
   if(Number(p.used||0)!==count){p.used=count;changed=true;}
   if(p.status!==newStatus){p.status=newStatus;changed=true;}
 });
 if(changed)save(d);
 return changed;
}
function activePackage(pid){var d=load(),pkgs=(d.packages||[]).filter(function(p){return p.patientId===pid&&p.status!=='Encerrado'&&Number(p.used||0)<Number(p.sessions||0);});pkgs.sort(function(a,b){return (b.startDate||'').localeCompare(a.startDate||'');});return pkgs[0]||null;}
function selectActivePackage(patientSelect,packageSelect){if(!patientSelect||!packageSelect)return;var pkg=activePackage(patientSelect.value);if(pkg){var opt=[].slice.call(packageSelect.options).find(function(o){return o.value===pkg.id;});if(opt)packageSelect.value=pkg.id;}}
function enhanceAppointmentForm(){var form=document.getElementById('appointmentForm');if(!form||form.dataset.packageEnhanced==='1')return;form.dataset.packageEnhanced='1';var patientSelect=document.getElementById('appointmentPatient'),packageSelect=document.getElementById('appointmentPackage');selectActivePackage(patientSelect,packageSelect);if(patientSelect){patientSelect.addEventListener('change',function(){setTimeout(function(){selectActivePackage(patientSelect,packageSelect);},0);});}if(packageSelect&&activePackage(patientSelect&&patientSelect.value)){var note=document.createElement('small');note.className='package-auto-note';note.textContent='Pacote ativo selecionado automaticamente. Ao marcar como atendido/realizado, 1 sessão será descontada.';packageSelect.parentNode.appendChild(note);}}
function enhanceStatus(){var select=document.getElementById('apStatus');if(!select||select.dataset.attendedEnhanced==='1')return;select.dataset.attendedEnhanced='1';[].slice.call(select.options).forEach(function(o){if(o.value==='Concluído'||o.textContent.trim()==='Concluído'){o.value='Concluído';o.textContent='Atendido / realizado';}});var note=document.createElement('small');note.className='package-auto-note';note.textContent='Salvar como Atendido / realizado dá baixa automática de 1 sessão no pacote do paciente.';select.parentNode.appendChild(note);}
function refreshIfNeeded(){setTimeout(function(){if(reconcile())location.reload();},80);}
function run(){enhanceAppointmentForm();enhanceStatus();}
var first=reconcile();
if(first){location.reload();return;}
new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',run);
document.addEventListener('click',function(e){if(e.target&&e.target.closest&&e.target.closest('#saveStatus'))refreshIfNeeded();});
document.addEventListener('submit',function(e){if(e.target&&['appointmentForm','editAppointmentForm','packageForm'].indexOf(e.target.id)>=0)refreshIfNeeded();});
setTimeout(run,100);setTimeout(run,500);
})();