export function createResidentSprites(){
 const atlasURLs=new WeakMap(),empty='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',side=2048,pad=2;
 let bank=new WeakMap(),owned=[],ready=false,misses=0,bytes=0,count=0,scale=1,bodyScale=1;
 const key=s=>[s.x,s.y,s.w,s.h].join(',');
 function copyTile(c,t,r){const x=r.sx,y=r.sy,w=r.sw,h=r.sh;c.drawImage(t,x,y);c.save();c.imageSmoothingEnabled=false;c.drawImage(t,0,0,1,h,x-pad,y,pad,h);c.drawImage(t,w-1,0,1,h,x+w,y,pad,h);c.drawImage(t,0,0,w,1,x,y-pad,w,pad);c.drawImage(t,0,h-1,w,1,x,y+h,w,pad);c.drawImage(t,0,0,1,1,x-pad,y-pad,pad,pad);c.drawImage(t,w-1,0,1,1,x+w,y-pad,pad,pad);c.drawImage(t,0,h-1,1,1,x-pad,y+h,pad,pad);c.drawImage(t,w-1,h-1,1,1,x+w,y+h,pad,pad);c.restore()}
 function clear(){ready=false;for(const b of owned)b.close();owned=[];bank=new WeakMap();bytes=count=misses=0}
 function plan(records){
  const pages=[],rows=[];
  for(const r of records){const factor=Math.min(r.priority?bodyScale:scale,(side-pad*2)/r.w,(side-pad*2)/r.h);r.sw=Math.max(1,Math.round(r.w*factor));r.sh=Math.max(1,Math.round(r.h*factor))}
  for(const r of [...records].sort((a,b)=>b.sh-a.sh||b.sw-a.sw)){
   const w=r.sw+pad*2,h=r.sh+pad*2;let best;
   for(const row of rows)if(row.h>=h&&side-row.x>=w&&(!best||side-row.x<side-best.x))best=row;
   if(!best){let p=pages.find(p=>side-p.height>=h);if(!p){p={index:pages.length,width:0,height:0,image:null};pages.push(p)}best={page:p,x:0,y:p.height,h};p.height+=h;rows.push(best)}
   r.page=best.page;r.sx=best.x+pad;r.sy=best.y+pad;best.x+=w;best.page.width=Math.max(best.page.width,best.x);
  }
  return pages;
 }
 async function prepare(entries,progress=()=>{}){
  clear();progress(0);const groups=new Map();for(const {source,sprite,priority=false}of entries){if(!source||!sprite||sprite.w<1||sprite.h<1)throw Error('Battle sprite source is missing');if(!groups.has(source))groups.set(source,new Map());const m=groups.get(source),id=key(sprite);m.set(id,{...sprite,priority:priority||m.get(id)?.priority})}
  const records=[...groups.values()].flatMap(m=>[...m.values()]),high=records.filter(s=>s.priority).reduce((n,s)=>n+s.w*s.h*4,0),low=records.filter(s=>!s.priority).reduce((n,s)=>n+s.w*s.h*4,0),mobile=matchMedia('(pointer:coarse)').matches,budget=(mobile?144:512)*1024*1024;
  bodyScale=Math.min(mobile?.75:1,Math.sqrt(budget*.65/Math.max(1,high)));scale=Math.min(bodyScale,Math.sqrt((budget-high*bodyScale*bodyScale)/Math.max(1,low)));
  const missing=[...groups.keys()].filter(s=>s._battleURL&&!s._battleBlob);let next=0,downloaded=0;await Promise.all(Array.from({length:Math.min(mobile?2:4,missing.length)},async()=>{while(next<missing.length){const source=missing[next++],response=await fetch(source._battleURL);if(!response.ok)throw Error('Battle atlas HTTP '+response.status);source._battleBlob=await response.blob();progress(.1*++downloaded/missing.length)}}));progress(.1);
  let pages;for(let i=0;i<12;i++){pages=plan(records);bytes=pages.reduce((n,p)=>n+p.width*p.height*4,0);if(bytes<=budget)break;const shrink=Math.min(.98,Math.sqrt(budget/bytes)*.98);scale*=shrink;bodyScale*=shrink}if(bytes>budget)throw Error('Battle atlas memory budget exceeded');
  const canvases=pages.map(p=>{const c=typeof OffscreenCanvas==='function'?new OffscreenCanvas(p.width,p.height):Object.assign(document.createElement('canvas'),{width:p.width,height:p.height});const ctx=c.getContext('2d');if(!ctx)throw Error('Battle atlas canvas unavailable');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';return {canvas:c,ctx}});let done=0;
  for(const [source,sprites]of groups){const blobURL=source._battleBlob?URL.createObjectURL(source._battleBlob):null;if(blobURL)source.src=blobURL;else if(atlasURLs.has(source)&&source.src===empty)source.src=atlasURLs.get(source);await source.decode?.();const atlas=await createImageBitmap(source),cache=new Map();bank.set(source,cache);
   try{const touched=new Set();for(const [id,r]of sprites){const tile=await createImageBitmap(atlas,r.x,r.y,r.w,r.h,{resizeWidth:r.sw,resizeHeight:r.sh,resizeQuality:'high'});try{copyTile(canvases[r.page.index].ctx,tile,r)}finally{tile.close()}touched.add(r.page.index);cache.set(id,r);count++;progress(.1+.85*++done/records.length);if(done%32===0)await new Promise(resolve=>setTimeout(resolve,0))}for(const i of touched){const committed=await createImageBitmap(canvases[i].canvas);committed.close()}}
   finally{atlas.close();if(source instanceof HTMLImageElement){if(!blobURL&&!atlasURLs.has(source))atlasURLs.set(source,source.src);source.src=empty;if(blobURL)URL.revokeObjectURL(blobURL);if(source._battleURL)source._battleBlob=null}}
  }
  for(const p of pages){const c=canvases[p.index].canvas;p.image=c.transferToImageBitmap?c.transferToImageBitmap():await createImageBitmap(c);owned.push(p.image);c.width=c.height=1}for(const r of records)r.image=r.page.image;ready=true;progress(1);
 }
 function get(source,sprite){const entry=source&&sprite&&bank.get(source)?.get(key(sprite));if(entry)return entry;if(!ready||!globalThis.__palaceBattleIsLive?.())return null;misses++;throw Error('Unprepared battle sprite '+(source?.src?.split('/').pop()||'no atlas')+' '+(sprite?key(sprite):'empty'))}
 function draw(ctx,entry,x,y,w=entry.w,h=entry.h){ctx.drawImage(entry.image,entry.sx,entry.sy,entry.sw,entry.sh,x,y,w,h)}
 function warm(contexts){for(const ctx of contexts){ctx.save();ctx.setTransform(1,0,0,1,0,0);for(const image of owned)ctx.drawImage(image,0,0,1,1);ctx.clearRect(0,0,1,1);ctx.restore()}}
 return {prepare,get,peek:(source,sprite)=>bank.get(source)?.get(key(sprite)),draw,clear,warm,snapshot:()=>({ready,count,texturePages:owned.length,decodedBytes:bytes,scale,bodyScale,misses})};
}
