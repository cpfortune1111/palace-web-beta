import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';

// Local GLB coordinates: retained when the authored ocean/fog meshes are removed.
export function createMoonEnvironment(model,oceanTemplate){
 model.updateMatrixWorld(true);
 const hidden=[],oceanBounds=new THREE.Box3(),inverse=model.matrixWorld.clone().invert();
 model.traverse(node=>{if(!node.isMesh)return;if(/ocean|^fog(?:[ ._]|$)|^mist(?:[ ._]|$)/i.test(node.name)){if(/ocean/i.test(node.name)){node.geometry.computeBoundingBox();oceanBounds.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld).applyMatrix4(inverse))}node.visible=false;hidden.push(node.name)}});
 if(oceanBounds.isEmpty())oceanBounds.set(new THREE.Vector3(-279,-3,-199.4),new THREE.Vector3(279,-3,-21.2));
 const size=oceanBounds.getSize(new THREE.Vector3()),center=oceanBounds.getCenter(new THREE.Vector3()),group=new THREE.Group();group.name='MoonScriptEnvironment';model.add(group);
 const ocean=oceanTemplate.clone();ocean.name='MoonTitleOcean';ocean.geometry=ocean.geometry.clone();ocean.geometry.computeBoundingBox();const source=ocean.geometry.boundingBox,sourceSize=source.getSize(new THREE.Vector3()),sourceCenter=source.getCenter(new THREE.Vector3());ocean.geometry.translate(-sourceCenter.x,-sourceCenter.y,-sourceCenter.z);ocean.position.copy(center);ocean.quaternion.identity();ocean.scale.set(size.x/Math.max(sourceSize.x,.001),1,size.z/Math.max(sourceSize.z,.001));
 ocean.material=(Array.isArray(ocean.material)?ocean.material:[ocean.material]).map(m=>{const c=m.clone();c.side=THREE.FrontSide;c.depthWrite=false;return c});if(!Array.isArray(oceanTemplate.material))ocean.material=ocean.material[0];group.add(ocean);
 const shader={...Reflector.ReflectorShader,uniforms:{...Reflector.ReflectorShader.uniforms,time:{value:0}},fragmentShader:`uniform sampler2D tDiffuse;uniform float time;varying vec4 vUv;
 void main(){vec2 uv=vUv.xy/vUv.w;uv.x+=sin(uv.y*180.0+time*1.3)*0.0012;uv.y+=sin(uv.x*110.0-time)*0.0005;vec2 blur=vec2(2.0/1024.0,2.0/576.0);vec3 reflected=texture2D(tDiffuse,uv).rgb*0.4;reflected+=(texture2D(tDiffuse,uv+vec2(blur.x,0.0)).rgb+texture2D(tDiffuse,uv-vec2(blur.x,0.0)).rgb+texture2D(tDiffuse,uv+vec2(0.0,blur.y)).rgb+texture2D(tDiffuse,uv-vec2(0.0,blur.y)).rgb)*0.15;gl_FragColor=vec4(reflected*vec3(0.55,0.65,0.75),0.42);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`};
 const reflection=new Reflector(new THREE.PlaneGeometry(size.x,size.z),{textureWidth:matchMedia('(pointer:coarse)').matches?512:1024,textureHeight:matchMedia('(pointer:coarse)').matches?288:576,multisample:0,clipBias:.001,shader});reflection.name='MoonOceanReflection';reflection.rotation.x=-Math.PI/2;reflection.position.copy(center);reflection.position.y+=.002;reflection.material.transparent=true;reflection.material.depthWrite=false;reflection.renderOrder=100;group.add(reflection);
 const reflect=reflection.onBeforeRender;reflection.onBeforeRender=function(renderer,scene,camera){const visible=ocean.visible;ocean.visible=false;try{reflect.call(this,renderer,scene,camera)}finally{ocean.visible=visible}};
 // One procedural band across the shore, rather than a gradient on each fog sprite.
 const fogMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0},density:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float density;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){float n=noise(vec2(vUv.x*24.0-time*.035,vUv.y*3.0))+noise(vec2(vUv.x*57.0+time*.02,vUv.y*7.0))*.35;float edge=exp(-pow((vUv.y-.5)*4.5+(n-.65)*.65,2.0))*smoothstep(0.0,.12,vUv.y)*smoothstep(0.0,.12,1.0-vUv.y);float sides=smoothstep(0.0,.08,vUv.x)*smoothstep(0.0,.08,1.0-vUv.x);float a=pow(edge,1.5)*sides*(.28+n*.24)*density;gl_FragColor=vec4(vec3(1.0),a);
 #include <colorspace_fragment>
 }`});
 const fog=new THREE.Mesh(new THREE.PlaneGeometry(size.x*1.5,16),fogMaterial);fog.name='MoonCoastWhiteMist';fog.position.set(center.x,-2.5,-162);fog.renderOrder=110;group.add(fog);
 const haze=new THREE.Mesh(new THREE.PlaneGeometry(size.x*1.5,8),fogMaterial.clone());haze.name='MoonSeaWhiteMist';haze.material.uniforms.density.value=.45;haze.position.set(center.x,-2.8,-151);haze.renderOrder=109;group.add(haze);
 let time=0;return {update:dt=>{time+=dt;reflection.material.uniforms.time.value=time;fogMaterial.uniforms.time.value=time;haze.material.uniforms.time.value=time},snapshot:()=>({hidden,ocean:true,reflection:true,proceduralFog:true,time,shoreZ:fog.position.z,reflectionSize:[reflection.getRenderTarget().width,reflection.getRenderTarget().height]})};
}

export function createMoonShadow(){
 const cache=[null,null];
 const draw=function(context,index,source,sprite,frame,x,ground,facing,scale,height,drawFighter){
  let entry=cache[index];if(entry?.source!==source){const factor=Math.min(1,192/Math.max(sprite.w,sprite.h)),pad=5,raw=document.createElement('canvas'),out=document.createElement('canvas');raw.width=out.width=Math.ceil(sprite.w*factor)+pad*2;raw.height=out.height=Math.ceil(sprite.h*factor)+pad*2;const a=raw.getContext('2d');a.drawImage(source.image,source.sx,source.sy,source.sw,source.sh,pad,pad,sprite.w*factor,sprite.h*factor);a.globalCompositeOperation='source-in';a.fillStyle='#181327';a.fillRect(0,0,raw.width,raw.height);const b=out.getContext('2d');b.filter='blur(1.5px)';b.drawImage(raw,0,0);raw.width=raw.height=1;entry=cache[index]={source,image:out,sx:0,sy:0,sw:out.width,sh:out.height,w:out.width/factor,h:out.height/factor,sprite:{...sprite,w:out.width/factor,h:out.height/factor,axisX:sprite.axisX+pad/factor,axisY:sprite.axisY+pad/factor}}}
  context.save();context.globalAlpha=.26*Math.max(.25,1-Math.abs(height)/900);context.translate(0,ground);context.scale(1,-.18);drawFighter(context,entry,entry.sprite,frame,x+Math.min(40,Math.abs(height)*.08)*scale,0,facing,scale);context.restore();
 };
 draw.clear=()=>{for(let i=0;i<cache.length;i++){const canvas=cache[i]?.image;if(canvas)canvas.width=canvas.height=1;cache[i]=null}};return draw;
}
