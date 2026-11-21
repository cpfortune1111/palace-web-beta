async function settleWorker(registration){
 if(navigator.onLine)try{await registration.update()}catch{}
 const pending=registration.installing||registration.waiting;
 if(pending&&pending.state!=='activated')await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Update timed out. Please retry.')),90000);const check=()=>{if(pending.state==='activated'){clearTimeout(timeout);resolve()}else if(pending.state==='redundant'){clearTimeout(timeout);reject(Error('Update could not finish. Please retry.'))}};pending.addEventListener('statechange',check);check()});
 await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller||navigator.serviceWorker.controller.scriptURL!==registration.active?.scriptURL||navigator.serviceWorker.controller.state!=='activated')await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Update is ready. Please retry.')),30000);const check=()=>{if(navigator.serviceWorker.controller?.scriptURL===registration.active?.scriptURL){clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',check);resolve()}};navigator.serviceWorker.addEventListener('controllerchange',check);check()});
}
const status=document.querySelector('#status'),fill=document.querySelector('#fill'),retry=document.querySelector('#retry');
async function start(){retry.hidden=true;try{if(!isSecureContext||!navigator.serviceWorker||!crypto.subtle)throw Error('Please open this page over HTTPS in Safari or Chrome.');status.textContent='Opening Web beta 0.24.09…';fill.style.width='25%';const registration=await navigator.serviceWorker.register('./beta-worker-online.js',{scope:'./',updateViaCache:'none'});await settleWorker(registration);
 const ready=await new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Connection timed out. Please retry.'))},60000);channel.port1.onmessage=({data})=>{if(data.type==='ready'){clearTimeout(timer);channel.port1.close();resolve(data)}if(data.type==='error'){clearTimeout(timer);channel.port1.close();reject(Error(data.message))}};navigator.serviceWorker.controller.postMessage({type:'READY'},[channel.port2])});
 try{if(sessionStorage.getItem('palace-beta-online-build')!==ready.build){sessionStorage.removeItem('palace-load-rebuild-v2');sessionStorage.setItem('palace-beta-online-build',ready.build)}}catch{}
 fill.style.width='100%';location.replace('./app/game.html?build='+ready.build);
 }catch(error){status.textContent=error.message;retry.hidden=false}}
retry.onclick=start;start();
