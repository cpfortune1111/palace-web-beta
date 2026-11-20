async function settleWorker(registration){
 if(navigator.onLine)try{await registration.update()}catch{}
 const pending=registration.installing||registration.waiting;
 if(pending&&pending.state!=='activated')await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Update timed out. Please retry.')),90000);const check=()=>{if(pending.state==='activated'){clearTimeout(timeout);resolve()}else if(pending.state==='redundant'){clearTimeout(timeout);reject(Error('Update could not finish. Please retry.'))}};pending.addEventListener('statechange',check);check()});
 await navigator.serviceWorker.ready;
 if(!navigator.serviceWorker.controller||navigator.serviceWorker.controller.state!=='activated')await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
}
const status=document.querySelector('#status'),fill=document.querySelector('#fill'),retry=document.querySelector('#retry');
async function start(){retry.hidden=true;try{if(!isSecureContext||!navigator.serviceWorker||!crypto.subtle)throw Error('Please open this page over HTTPS in Safari or Chrome.');const registration=await navigator.serviceWorker.register('./beta-worker.js',{scope:'./',updateViaCache:'none'});await settleWorker(registration);navigator.storage?.persist?.().catch(()=>{});
 await new Promise((resolve,reject)=>{const channel=new MessageChannel();let timeout;const reset=()=>{clearTimeout(timeout);timeout=setTimeout(()=>reject(Error('Download timed out. Please retry.')),60000)};reset();channel.port1.onmessage=({data})=>{reset();if(data.type==='progress'){const p=Math.round(data.loaded/Math.max(1,data.total)*100);fill.style.width=p+'%';status.textContent=`Preparing Web beta 0.24.09 · ${p}%`}if(data.type==='ready'){clearTimeout(timeout);channel.port1.close();resolve()}if(data.type==='error'){clearTimeout(timeout);channel.port1.close();reject(Error(data.message))}};navigator.serviceWorker.controller.postMessage({type:'PREPARE'},[channel.port2])});status.textContent='Ready · offline resources saved';location.replace('./app/game.html');
 }catch(error){status.textContent=error.message;retry.hidden=false}}
retry.onclick=start;start();
