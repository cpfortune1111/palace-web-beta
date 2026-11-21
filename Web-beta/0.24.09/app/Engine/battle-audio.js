// Decode before battle. Playback never starts a download or a first-use decode.
export function createBattleAudio(){
 let context,decodeCount=0,playCount=0,lateResumes=0;const buffers=new Map();
 for(const event of ['pointerdown','keydown'])addEventListener(event,()=>audioContext().resume().catch(()=>{}),{once:true,capture:true});
 const key=url=>new URL(url,location.href).href;
 function audioContext(){return context??=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'})}
 async function prepare(urls,progress=()=>{}){
  const unique=[...new Set(urls.map(key))];let completed=0,next=0;for(const url of buffers.keys())if(!unique.includes(url))buffers.delete(url);progress(0);audioContext().resume().catch(()=>{});
  await Promise.all(Array.from({length:Math.min(matchMedia('(pointer:coarse)').matches?2:6,unique.length)},async()=>{
   while(next<unique.length){const url=unique[next++];if(!buffers.has(url)){
    const response=await fetch(url);if(!response.ok)throw Error('Battle audio HTTP '+response.status+': '+url);
    const buffer=await audioContext().decodeAudioData(await response.arrayBuffer());decodeCount++;buffers.set(url,buffer);
   }progress(++completed/unique.length)}
  }));for(const url of buffers.keys())if(!unique.includes(url))buffers.delete(url);progress(1);
 }
 function create(url){
  const buffer=buffers.get(key(url));if(!buffer)throw Error('Battle sound was not prepared: '+url);
  const handle=new EventTarget(),ctx=audioContext();let source,gain,volume=1;
  Object.defineProperties(handle,{volume:{get:()=>volume,set:value=>{volume=value;if(gain)gain.gain.value=value}},paused:{get:()=>!source},ended:{get:()=>!source}});
  handle.pause=()=>{if(source){source.onended=null;source.stop();source.disconnect();gain.disconnect();source=null;handle.dispatchEvent(new Event('ended'))}};
  handle.play=async()=>{playCount++;if(ctx.state!=='running'){lateResumes++;await ctx.resume()}handle.pause();gain=ctx.createGain();gain.gain.value=volume;gain.connect(ctx.destination);source=ctx.createBufferSource();source.buffer=buffer;source.connect(gain);source.onended=()=>{source=null;gain.disconnect();handle.dispatchEvent(new Event('ended'))};source.start()};
  return handle;
 }
 return {prepare,create,running:()=>context?.state==='running',resume:()=>audioContext().resume(),snapshot:()=>({sounds:buffers.size,decodedBytes:[...buffers.values()].reduce((n,b)=>n+b.length*b.numberOfChannels*4,0),state:context?.state,baseLatency:context?.baseLatency,outputLatency:context?.outputLatency,decodeCount,playCount,lateResumes})};
}
