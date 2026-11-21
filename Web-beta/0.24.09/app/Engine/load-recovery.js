const key='palace-beta02409-online-load-recovery-v1',budgetKey='palace-beta02409-online-load-rebuild-v2';
export function readLoadRecovery(){try{const value=JSON.parse(sessionStorage.getItem(key));return normalizeRecovery(value)}catch{return null}}
export function saveLoadRecovery(value){try{sessionStorage.setItem(key,JSON.stringify({version:1,...value}));return true}catch{return false}}
export function clearLoadRecovery(){try{sessionStorage.removeItem(key);sessionStorage.removeItem(budgetKey)}catch{}}
export function rebuildPageOnce(){
 try{
  const attempts=Number(sessionStorage.getItem(budgetKey)||0);if(attempts>=3)throw Object.assign(Error('A page rebuild was already attempted. '+(navigator.onLine===false?'The connection is offline.':'The loading error persists.')),{code:'RECOVERY_LIMIT'});
  sessionStorage.setItem(budgetKey,String(attempts+1));
 }catch(error){if(error.code==='RECOVERY_LIMIT')throw error;throw Object.assign(Error('Automatic page recovery cannot save this session. '+error.message),{code:'RECOVERY_LIMIT'})}
 const entry=new URL('../../online.html',import.meta.url);entry.searchParams.set('retry',String(Date.now()));location.replace(entry.href);
}
let recoveryJob;export function requestLoadRecovery(){return recoveryJob??=(async()=>{globalThis.__palaceRecoveryInProgress=true;try{if(navigator.serviceWorker?.controller)await new Promise(resolve=>{const c=new MessageChannel(),timer=setTimeout(resolve,1500);c.port1.onmessage=()=>{clearTimeout(timer);c.port1.close();resolve()};navigator.serviceWorker.controller.postMessage({type:'RESET_LOAD'},[c.port2])});return await dispatchRecovery()}catch(e){recoveryJob=null;globalThis.__palaceRecoveryInProgress=false;throw e}})()}
function dispatchRecovery(){const detail={result:null},event=new CustomEvent('palace-load-retry',{cancelable:true,detail});window.dispatchEvent(event);return event.defaultPrevented?detail.result:rebuildPageOnce()}

export function resetLoadRecoveryBudget(){try{sessionStorage.removeItem(budgetKey)}catch{}}

export async function trimEncryptedCache(){if(!navigator.serviceWorker?.controller)return;await new Promise(resolve=>{const c=new MessageChannel(),timer=setTimeout(resolve,1500);c.port1.onmessage=()=>{clearTimeout(timer);c.port1.close();resolve()};navigator.serviceWorker.controller.postMessage({type:'TRIM'},[c.port2])})}

export function normalizeRecovery(value){
 if(value?.version!==1)return null;
 const home={version:1,phase:'home'},modes=['vs','watch','training','arcade'],roles=['SailorMoon','SailorJupiter','SailorVenus','SailorNeptune','SailorSaturn'];
 if(!['home','battle','selection','result'].includes(value.phase))return home;
 if(value.phase==='home')return value;
 if(!modes.includes(value.mode))return home;
 const pair=list=>Array.isArray(list)&&list.length===2&&list.every(c=>roles.includes(c));
 if(value.phase==='result')return value.result&&pair(value.players)?value:home;
 if(!value.choice||!pair(value.choice.players)||!Array.isArray(value.choice.command)||value.choice.command.length!==2)return {version:1,phase:'selection',mode:value.mode};
 if(value.phase==='battle'&&!['training','moon','swatheshia'].includes(value.choice.stage))return {version:1,phase:'selection',mode:value.mode};
 return value;
}
