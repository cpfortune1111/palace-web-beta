export function createResidentSprites(){
 let bank=new WeakMap(),owned=[],ready=false,misses=0,bytes=0,count=0,scale=1,bodyScale=1;
 const key=s=>[s.x,s.y,s.w,s.h].join(',');
 function clear(){ready=false;for(const b of owned)b.close();owned=[];bank=new WeakMap();bytes=count=misses=0}
 async function prepare(entries,progress=()=>{}){clear();const groups=new Map();for(const {source,sprite,priority=false} of entries){if(!source||!sprite||sprite.w<1||sprite.h<1)throw Error('Battle sprite source is missing');if(!groups.has(source))groups.set(source,new Map());groups.get(source).set(key(sprite),{...sprite,priority:priority||groups.get(source).get(key(sprite))?.priority})}
 const sprites=[...groups.values()].flatMap(m=>[...m.values()]),high=sprites.filter(s=>s.priority).reduce((n,s)=>n+s.w*s.h*4,0),low=sprites.filter(s=>!s.priority).reduce((n,s)=>n+s.w*s.h*4,0),mobile=matchMedia('(pointer:coarse)').matches,budget=(mobile?144:512)*1024*1024;bodyScale=Math.min(mobile?.75:1,Math.sqrt(budget*.65/Math.max(1,high)));scale=Math.min(bodyScale,Math.sqrt((budget-high*bodyScale*bodyScale)/Math.max(1,low)));let done=0;const total=[...groups.values()].reduce((n,m)=>n+m.size,0);progress(0);
 let scratch=typeof OffscreenCanvas==='function'?new OffscreenCanvas(1,1):document.createElement('canvas'),copy=scratch.getContext('2d');if(!copy){scratch=document.createElement('canvas');copy=scratch.getContext('2d')}
 for(const [source,sprites] of groups){await source.decode?.();const atlas=await createImageBitmap(source);const cache=new Map();bank.set(source,cache);try{for(const [id,s] of sprites){const w=Math.max(1,Math.round(s.w*(s.priority?bodyScale:scale))),h=Math.max(1,Math.round(s.h*(s.priority?bodyScale:scale)));scratch.width=w;scratch.height=h;copy.imageSmoothingEnabled=true;copy.imageSmoothingQuality='high';copy.drawImage(atlas,s.x,s.y,s.w,s.h,0,0,w,h);const image=scratch.transferToImageBitmap?scratch.transferToImageBitmap():await createImageBitmap(scratch);owned.push(image);cache.set(id,{image,w:s.w,h:s.h});bytes+=w*h*4;count++;progress(++done/total);if(done%16===0)await new Promise(r=>setTimeout(r,0))}}finally{atlas.close()}}
 scratch.width=scratch.height=1;ready=true;progress(1)
 }
 function get(source,sprite){const entry=source&&sprite&&bank.get(source)?.get(key(sprite));if(entry)return entry;if(!ready||!globalThis.__palaceBattleIsLive?.())return null;misses++;throw Error('Unprepared battle sprite '+(source?.src?.split('/').pop()||'no atlas')+' '+(sprite?key(sprite):'empty'))}
 function draw(ctx,entry,x,y,w=entry.w,h=entry.h){ctx.drawImage(entry.image,x,y,w,h)}
 function warm(contexts){for(const ctx of contexts){ctx.save();ctx.setTransform(1,0,0,1,0,0);for(const image of owned)ctx.drawImage(image,0,0,1,1);ctx.getImageData(0,0,1,1);ctx.clearRect(0,0,1,1);ctx.restore()}}
 return {prepare,get,draw,clear,warm,snapshot:()=>({ready,count,decodedBytes:bytes,scale,bodyScale,misses})};
}
