import {assetUrl} from './asset-paths.js?v=02362';
export function createMenuAudio(home,settings){
 const ambient=new Audio(),effects={},tracks={};ambient.loop=true;let context='',homeGain=0,homeTarget=0,ambientGain=0,ambientTarget=0;
 const names=['logo','select-mode','select-settings','btn-click','btn-back','acs-add','acs-minus','select'];
 const bootstrap=new Set(['logo','select-mode','select-settings','btn-click','btn-back','select']);
 const homeURL=home.src;home.removeAttribute('src');home.load();const homeJob=fetch(homeURL).then(r=>{if(!r.ok)throw Error('Home music HTTP '+r.status);return r.blob()}).then(blob=>{home.src=URL.createObjectURL(blob)});
 let fxContext;const fx=()=>fxContext??=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});for(const event of ['pointerdown','keydown'])addEventListener(event,()=>fx().resume().catch(()=>{}),{once:true,capture:true});
 const effectJobs=names.map(async name=>{const response=await fetch(assetUrl('./Data/Sound/'+(name==='select'?'btn-select.ogg':name+'.mp3'))+(bootstrap.has(name)?'?bootstrap=1':''));if(!response.ok)throw Error('Sound '+name);effects[name]=await fx().decodeAudioData(await response.arrayBuffer())});
 const trackJobs=['select','report'].map(async name=>{const response=await fetch(assetUrl('./Data/Sound/BGM-'+name+'.mp3'));if(!response.ok)throw Error('Music '+name);tracks[name==='select'?'selection':name]=URL.createObjectURL(await response.blob())});
 const ready=Promise.all([homeJob,...effectJobs.filter((_,i)=>bootstrap.has(names[i]))]),selectionReady=Promise.all([...effectJobs,...trackJobs]);selectionReady.catch(()=>{});
 function volume(){const options=settings(),gain=options.master*options.bgm/10000;home.volume=gain*homeGain;ambient.volume=gain*ambientGain}
 function play(track){track.play().catch(()=>{})}
 function effect(name){if(!effects[name])return;const ctx=fx(),options=settings();if(ctx.state!=='running')ctx.resume().catch(()=>{});const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=effects[name];gain.gain.value=options.master*options.sfx/10000;source.connect(gain);gain.connect(ctx.destination);source.onended=()=>{source.disconnect();gain.disconnect()};source.start()}
 function begin(next){if(context===next&&ambientTarget===1)return;ambient.pause();context=next;ambient.src=tracks[next];ambient.load();ambient.currentTime=0;ambientGain=0;ambientTarget=1;volume();play(ambient)}
 function step(seconds){const move=(value,target)=>value<target?Math.min(target,value+seconds*2):Math.max(target,value-seconds*2);homeGain=move(homeGain,homeTarget);ambientGain=move(ambientGain,ambientTarget);volume();if(!homeGain&&!homeTarget)home.pause();if(!ambientGain&&!ambientTarget)ambient.pause()}
 return {ready,selectionReady,silenceForBattle(){homeTarget=ambientTarget=homeGain=ambientGain=0;home.pause();ambient.pause();volume()},effect,volume,step,homeStart(){homeTarget=1;volume();if(home.paused)play(home)},fadeHomeOut(){homeTarget=0},beginSelection(){begin('selection')},beginReport(){begin('report')},fadeAmbientOut(){ambientTarget=0},retry(){if(homeTarget&&home.paused)play(home);if(ambientTarget&&ambient.paused)play(ambient)},snapshot:()=>({fxState:fxContext?.state,fxSounds:Object.keys(effects).length,homePaused:home.paused,ambientPaused:ambient.paused,context,homeGain,homeTarget,ambientGain,ambientTarget,time:ambient.currentTime})};
}

