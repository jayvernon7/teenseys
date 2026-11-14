import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

/*
 * Teenseys' hybrid scene v1.3
 * Actual 3D: environment, architecture, plaza, fountain, lighting.
 * 2D: pixel character sprite sheets drawn on camera-facing planes.
 * The existing shopping/store UI and 2D boutique engine stay untouched.
 */
const gameWrap=document.getElementById("gameWrap");
const gameCanvas=document.getElementById("game");
const statusBadge=document.getElementById("hybridSceneBadge");
if(!gameWrap||!gameCanvas)throw Error("Teenseys game canvas unavailable.");
const renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(960,600,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.35;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.className="teenseys-3d-canvas";
renderer.domElement.setAttribute("aria-hidden","true");
renderer.domElement.style.cssText="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;image-rendering:auto;";
gameWrap.insertBefore(renderer.domElement,gameWrap.querySelector(".hud"));
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x111329);
scene.fog=new THREE.FogExp2(0x18132d,0.0021);
const camera=new THREE.OrthographicCamera(-148,148,92.5,-92.5,0.1,1000);
camera.position.set(0,114,-183);
camera.lookAt(0,17,-67);
const clock=new THREE.Clock();
const hemi=new THREE.HemisphereLight(0x9799ff,0x302333,2.05);
scene.add(hemi);
const moon=new THREE.DirectionalLight(0x8d9dff,2.1);
moon.position.set(-85,125,-60);
moon.castShadow=true;
moon.shadow.mapSize.set(1024,1024);
moon.shadow.camera.left=-180;moon.shadow.camera.right=180;
moon.shadow.camera.top=150;moon.shadow.camera.bottom=-150;
scene.add(moon);
const warm=new THREE.DirectionalLight(0xffc38f,1.6);warm.position.set(40,90,80);scene.add(warm);
const colorMaterial=(color,extras={})=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.08,...extras});
const mats={
 pavement:colorMaterial(0x7c657e,{roughness:.35,metalness:.13}),
 dark:colorMaterial(0x2d2c47),brick:colorMaterial(0x65536b),
 grass:colorMaterial(0x274e46),wood:colorMaterial(0x946c61),
 teal:colorMaterial(0x55cbd7,{metalness:.25,roughness:.2,emissive:0x0b647a,emissiveIntensity:1.1}),
 water:colorMaterial(0x3caed3,{metalness:.45,roughness:.12,emissive:0x1a85c4,emissiveIntensity:.8}),
 white:colorMaterial(0xeacdd1),gold:colorMaterial(0xffd1a1,{emissive:0xffa15c,emissiveIntensity:.8}),
 neon:colorMaterial(0xce78ff,{emissive:0xaa44fa,emissiveIntensity:2}),
 leaves:colorMaterial(0x34876d),pink:colorMaterial(0xba6b9f),
 flowers:colorMaterial(0xf3a3db,{emissive:0x8a2f72,emissiveIntensity:.2})
};
function box(x,y,z,w,h,d,material,parent=scene,shadow=true){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);mesh.castShadow=shadow;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function cyl(x,y,z,top,bottom,h,material,segments=24,parent=scene){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,h,segments),material);
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
const pavementCanvas=document.createElement("canvas");
pavementCanvas.width=pavementCanvas.height=512;
const pc=pavementCanvas.getContext("2d");
pc.fillStyle="#74637a";pc.fillRect(0,0,512,512);
for(let j=0;j<16;j++)for(let i=0;i<16;i++){
 const x=i*32+(j%2)*16,y=j*32;
 pc.fillStyle=(i+j)%5===0?"#8a7087":(i+j)%3===0?"#7f6981":"#6d5b74";
 pc.fillRect(x+2,y+2,29,29);
 pc.fillStyle="#493f61";pc.fillRect(x,y,32,1);
 pc.fillStyle="#b59eb0";pc.globalAlpha=.23;pc.fillRect(x+3,y+3,27,2);pc.globalAlpha=1;
}
const pavingTex=new THREE.CanvasTexture(pavementCanvas);
pavingTex.wrapS=pavingTex.wrapT=THREE.RepeatWrapping;
pavingTex.repeat.set(4,3);pavingTex.colorSpace=THREE.SRGBColorSpace;
pavingTex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);
const paving=new THREE.Mesh(new THREE.PlaneGeometry(340,255),
 new THREE.MeshStandardMaterial({map:pavingTex,roughness:.33,metalness:.12}));
paving.rotation.x=-Math.PI/2;paving.position.set(0,-.23,-65);
paving.receiveShadow=true;scene.add(paving);
// A pedestrian shopping mall, with raised planters along both aisles.
for(const x of [-151,151]){
 box(x,.15,-74,17,.6,205,mats.dark);
 box(x,0.85,-74,14,1.5,201,mats.grass);
}
for(const x of [-145,145])for(const z of [-20,-92,-150]){
 box(x,1.3,z,15,2.6,12,mats.brick);
 box(x,2.7,z,13,.45,10,mats.grass);
 for(let k=0;k<6;k++){
  cyl(x-5+k*2,3.3+((k%2)*.5),z+((k%3)-1)*2,1.8,1.2,2.4,k%3?mats.leaves:mats.pink,6);
 }
}
// Simple 3D nighttime skyline behind the shopping plaza.
const skylineMat=[0x232441,0x303052,0x28223c,0x362747].map(c=>colorMaterial(c,{roughness:1}));
const windowMat=colorMaterial(0xf2b887,{emissive:0xd58c52,emissiveIntensity:.65});
for(let i=0;i<31;i++){
 const x=-225+i*15.5,hh=30+(i*27)%72;
 const building=box(x,hh/2,-8,12,hh,15,skylineMat[i%4],scene,false);
 building.castShadow=false;
 for(let y=12;y<hh-7;y+=10)for(let wx=-4;wx<=4;wx+=8){
  if((i+y+wx)%4!==0)box(x+wx,y,-16.4,3,5,.65,windowMat,scene,false);
 }
}
// Decor for three dimensions rather than flat compositing.
function makeTree(x,z,blossom=false){
 cyl(x,8,z,1.8,2.4,16,mats.wood,8);
 const leaf=blossom?mats.pink:mats.leaves;
 for(const [ox,oy,oz,r] of [[-7,19,0,10],[5,24,-2,11],[1,18,6,9],[-2,29,0,8]]){
 const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),leaf);
 mesh.position.set(x+ox,oy,z+oz);mesh.castShadow=true;scene.add(mesh);
 }
 if(blossom)for(let i=0;i<6;i++){
 const a=i*Math.PI/3;
 const p=new THREE.Mesh(new THREE.IcosahedronGeometry(2,0),mats.flowers);
 p.position.set(x+Math.cos(a)*9,22+(i%3)*5,z+Math.sin(a)*8);scene.add(p);
 }
}
makeTree(-139,-112,true);makeTree(137,-114,false);
makeTree(-135,-40,false);makeTree(140,-42,true);
function makeLamp(x,z){
 cyl(x,9,z,.65,.9,18,mats.dark,8);
 box(x,18.8,z,4,2,4,mats.gold);
 box(x,22,z,6,4.2,6,mats.dark);
 box(x,24.8,z,7,1.4,7,mats.white);
 const l=new THREE.PointLight(0xffb58c,60,54,2);
 l.position.set(x,19,z);scene.add(l);
}
for(const x of [-120,120])for(const z of [-64,-139])makeLamp(x,z);
function makeBench(x,z){
 box(x,3.2,z,19,2,5,mats.wood);
 box(x,6.5,z+2,19,6,1.8,mats.wood);
 for(const xx of [x-7,x+7])box(xx,1.4,z,1.6,3,5,mats.dark);
}
makeBench(-109,-123);makeBench(106,-126);
for(const [x,z,color] of [[0,-65,0xb960ff],[-91,-58,0x89b8ff],[91,-58,0xffb575]]){
 const lamp=new THREE.PointLight(color,100,95,1.5);
 lamp.position.set(x,20,z);scene.add(lamp);
}
const fountain=new THREE.Group();fountain.position.set(0,0,-99);scene.add(fountain);
cyl(0,1.1,0,22,23,2.2,mats.white,48,fountain);
cyl(0,2.2,0,20.2,20.2,.55,mats.water,48,fountain);
cyl(0,3.3,0,7,9,2.1,mats.brick,24,fountain);
cyl(0,5.5,0,3,4,2.6,mats.white,20,fountain);
const jets=[];
for(let i=0;i<9;i++){
 const angle=2*Math.PI*i/9,rad=i===0?0:10;
 const jet=cyl(Math.cos(angle)*rad,5.9,Math.sin(angle)*rad,.55,.9,4.8,mats.teal,8,fountain);
 jets.push(jet);
}
const fountainGlow=new THREE.PointLight(0x4bdcff,85,75,2);
fountainGlow.position.set(0,8,-99);scene.add(fountainGlow);
function makeFlowers(x,z){
 box(x,1.4,z,17,2.8,7,mats.brick);
 for(let i=0;i<8;i++){
  const xx=x-7+i*2, zz=z+(i%3-1)*2;
  cyl(xx,3.7,zz,1.7,1.3,2.4,mats.leaves,6);
  if(i%2)box(xx,5,zz,1.7,1.7,1.7,mats.flowers);
 }
}
makeFlowers(-61,-70);makeFlowers(61,-72);
makeFlowers(-95,-146);makeFlowers(98,-145);
const models=[
 {id:"threads",path:"assets/teenseys/night/threads-source.bbmodel",x:0,z:-30,sx:1,sy:1,sz:1},
 {id:"sole",path:"assets/teenseys/night/sole-house-source.bbmodel",x:-91,z:-30,sx:1.53,sy:1.06,sz:1.2},
 {id:"cafe",path:"assets/teenseys/night/corner-cafe-source.bbmodel",x:91,z:-30,sx:1.53,sy:1.06,sz:1.2}
];
const textureLoader=new THREE.TextureLoader();
function loadTexture(modelTexture){
 const source=modelTexture.source;
 if(!source)return null;
 const tex=textureLoader.load(source);
 tex.colorSpace=THREE.SRGBColorSpace;
 tex.magFilter=THREE.NearestFilter;
 tex.minFilter=THREE.LinearMipmapLinearFilter;
 return tex;
}
function modelFromBlockbench(data,position){
 const group=new THREE.Group();
 const textures=(data.textures||[]).map(loadTexture);
 const materials=(data.textures||[]).map((t,i)=>{
  const name=t.name.toLowerCase();
  const glass=name.includes("glass");
  const light=/neon|store_sign|amber|warm_window|crown/.test(name);
  return new THREE.MeshStandardMaterial({
   map:textures[i],side:THREE.DoubleSide,roughness:glass?.16:.78,
   metalness:glass?.23:.06,transparent:glass,opacity:glass?.71:1,
   emissive:light?new THREE.Color(0xc8a3ff):new THREE.Color(0),
   emissiveIntensity:light?.42:0,
   depthWrite:!glass
  });
 });
 const hidden=new THREE.MeshStandardMaterial({visible:false});
 const faceOrder=["east","west","up","down","south","north"];
 let count=0;
 for(const e of data.elements||[]){
  if(e.type!=="cube"||e.visibility===false||e.export===false)continue;
  const [x,y,z]=e.from,[X,Y,Z]=e.to;
  const width=Math.max(.001,X-x),height=Math.max(.001,Y-y),depth=Math.max(.001,Z-z);
  const geo=new THREE.BoxGeometry(width,height,depth);
  const faces=faceOrder.map(k=>{
   const f=e.faces?.[k],i=f?Number(f.texture):-1;
   return Number.isInteger(i)&&materials[i]?materials[i]:hidden;
  });
  const mesh=new THREE.Mesh(geo,faces);
  mesh.position.set((x+X)/2,(y+Y)/2,(z+Z)/2);
  // Blockbench cube origins and rotations are available, but this kit uses unrotated cubes.
  if(e.rotation?.some(r=>Math.abs(r)>0.01)){
   const origin=e.origin||[(x+X)/2,(y+Y)/2,(z+Z)/2];
   mesh.position.set(mesh.position.x-origin[0],mesh.position.y-origin[1],mesh.position.z-origin[2]);
   const pivot=new THREE.Group();pivot.position.set(...origin);
   pivot.rotation.set(...e.rotation.map(v=>THREE.MathUtils.degToRad(v)),'XYZ');pivot.add(mesh);
   group.add(pivot);
  }else group.add(mesh);
  mesh.castShadow=false;mesh.receiveShadow=true;
  count++;
 }
 group.position.set(position.x,0,position.z);
 group.scale.set(position.sx,position.sy,position.sz);
 scene.add(group);
 return count;
}
const sceneLoaded=Promise.all(models.map(async m=>{
 const r=await fetch(m.path,{cache:"force-cache"});
 if(!r.ok)throw Error(m.path+" returned HTTP "+r.status);
 const data=await r.json();
 return {id:m.id,cubes:modelFromBlockbench(data,m)};
}));
sceneLoaded.then(items=>{
 if(statusBadge)statusBadge.textContent="3D ENVIRONMENT · 2D CHARACTERS";
 console.info("Teenseys' 3D buildings loaded",items);
}).catch(error=>{
 console.error("Unable to load a Blockbench building",error);
 if(statusBadge)statusBadge.textContent="3D LOADING ISSUE";
});
// All visitors and the controllable character remain 2D billboard sprites.
function makeBillboard(index,w=10,h=15){
 const cvs=document.createElement("canvas");cvs.width=32;cvs.height=44;
 const cc=cvs.getContext("2d");cc.imageSmoothingEnabled=false;
 const texture=new THREE.CanvasTexture(cvs);
 texture.magFilter=THREE.NearestFilter;
 texture.minFilter=THREE.NearestFilter;
 texture.colorSpace=THREE.SRGBColorSpace;
 const mat=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false});
 const sprite=new THREE.Sprite(mat);
 sprite.scale.set(w,h,1);
 sprite.center.set(.5,0);
 sprite.position.y=.3;
 scene.add(sprite);
 const img=new Image();
 img.src="assets/teenseys/avatars/shopper-"+(index+1)+".svg";
 return {index,img,sprite,cc,texture,lastFrame:-1,lastDirection:-1};
}
const sprites=Array.from({length:6},(_,i)=>makeBillboard(i));
const npcs=[{data:makeBillboard(1),x:-96,z:-118,dir:"right"},{data:makeBillboard(4),x:94,z:-132,dir:"left"}];
let wasTown=false;
let previousPX=null,previousPY=null;
function drawBillboard(o,direction,frame){
 const dirIndex={down:0,left:1,right:2,up:3}[direction]??0;
 if(o.lastFrame===frame&&o.lastDirection===dirIndex)return;
 o.lastFrame=frame;o.lastDirection=dirIndex;
 const ctx=o.cc;ctx.clearRect(0,0,32,44);
 if(o.img.complete&&o.img.naturalWidth){
  ctx.drawImage(o.img,(frame%4)*32,dirIndex*44,32,44,0,0,32,44);
 }else{
  ctx.fillStyle="#29343f";ctx.fillRect(9,7,14,13);
  ctx.fillStyle="#c49378";ctx.fillRect(11,12,10,9);
  ctx.fillStyle="#e2e0ed";ctx.fillRect(9,23,14,13);
  ctx.fillStyle="#334153";ctx.fillRect(10,35,5,8);ctx.fillRect(18,35,5,8);
 }
 o.texture.needsUpdate=true;
}
for(const s of [...sprites,...npcs.map(n=>n.data)])s.img.onload=()=>{s.lastFrame=-1;};
const destination=new THREE.Vector3();
let running=true;
function animate(time){
 if(!running)return;
 requestAnimationFrame(animate);
 const bridge=window.teenseysTownState?.();
 const show=!!bridge?.started&&bridge.mode==="town";
 renderer.domElement.style.display=show?"block":"none";
 if(show){
  const p=bridge.townPlayer;
  const dx=previousPX===null?0:p.x-previousPX,dy=previousPY===null?0:p.y-previousPY;
  const walking=Math.abs(dx)+Math.abs(dy)>.01;
  previousPX=p.x;previousPY=p.y;
  const sprite=sprites[Math.max(0,Math.min(5,bridge.character||0))];
  for(const s of sprites)s.sprite.visible=s===sprite;
  // Existing movement and E-to-enter logic remain in the shopping game.
  destination.set((p.x-480)*.27,.5,-54-(p.y-380)*.52);
  sprite.sprite.position.copy(destination);
  drawBillboard(sprite,p.dir,walking?Math.floor(time/130)%4:0);
  for(const npc of npcs){npc.data.sprite.visible=true;npc.data.sprite.position.set(npc.x,.5,npc.z);
   drawBillboard(npc.data,npc.dir,Math.floor(time/900)%4);}
  const pulse=1+Math.sin(time/320)*.12;
  for(let i=0;i<jets.length;i++)jets[i].scale.y=pulse+Math.sin(time/480+i)*.12;
  fountainGlow.intensity=85+Math.sin(time/500)*12;
  renderer.render(scene,camera);
 }else{
  previousPX=null;previousPY=null;
 }
}
requestAnimationFrame(animate);
window.addEventListener("pagehide",()=>{running=false;renderer.dispose();for(const s of [...sprites,...npcs.map(n=>n.data)])s.texture.dispose()},{once:true});
