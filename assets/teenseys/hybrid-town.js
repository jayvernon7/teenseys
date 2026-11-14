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

// MODULAR STORE KIT v1.4 — inspired by realistic outdoor shopping storefronts.
// Each store is assembled from re-usable architectural modules, not 2D façades.
function canvasLabel(text,subline,color="#fff6e9",accent="#be8bef"){
 const cv=document.createElement("canvas");cv.width=1024;cv.height=256;
 const cx=cv.getContext("2d");cx.fillStyle="#171a2a";cx.fillRect(0,0,1024,256);
 cx.fillStyle=accent;cx.fillRect(0,0,1024,8);
 cx.fillStyle=color;cx.textAlign="center";cx.font="bold 91px Arial, sans-serif";
 cx.fillText(text,512,139,940);
 cx.font="32px Arial, sans-serif";cx.fillStyle="#bbaacb";cx.fillText(subline,512,199,900);
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
 tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),4);return tex;
}
const facadeGlass=new THREE.MeshPhysicalMaterial({
 color:0xa2b6d4,roughness:.07,metalness:.09,transparent:true,opacity:.24,
 depthWrite:false,side:THREE.DoubleSide
});
const creamPanel=colorMaterial(0xd5c6b6,{roughness:.88});
const darkStone=colorMaterial(0x292b36,{roughness:.74});
const paleStone=colorMaterial(0xccc4bd,{roughness:.7});
const frameMetal=colorMaterial(0x171e2a,{roughness:.37,metalness:.53});
const warmGlassGlow=colorMaterial(0x9a7b6f,{emissive:0xaf7359,emissiveIntensity:.33});
const shopFloor=colorMaterial(0x9e8a7a,{roughness:.52});
function addMannequin(parent,x,z,shirt,pants){
 const skin=colorMaterial(0xc7b9a9),shirtMat=colorMaterial(shirt),pantMat=colorMaterial(pants);
 box(x,1.05,z,4.6,1.1,3.6,frameMetal,parent);
 box(x,4.1,z,1.2,5.4,1.2,darkStone,parent);
 box(x,10,z,4.1,8.2,2.7,shirtMat,parent);
 box(x-3.5,9.8,z,2,7.1,2.2,shirtMat,parent);
 box(x+3.5,9.8,z,2,7.1,2.2,shirtMat,parent);
 box(x-1.15,3.95,z,1.65,6,2,pantMat,parent);
 box(x+1.15,3.95,z,1.65,6,2,pantMat,parent);
 cyl(x,15.2,z,2.15,2.1,2,skin,9,parent);
}
function litBox(x,y,z,w,h,d,material,parent,glowColor=0xffc58d){
 box(x,y,z,w,h,d,material,parent,false);
 const bulb=new THREE.PointLight(glowColor,15,24,2);
 bulb.position.set(x,y-2,z-2);parent.add(bulb);
}
function storeWindow(parent,x,w,z,accent,tone){
 // Mannequins sit behind transparent real glass. Frame sections are modular.
 const sash=facadeGlass.clone();
 box(x,12.6,z,w,24,.16,sash,parent,false);
 box(x-w/2,12.8,z-.16,1.15,25,.7,frameMetal,parent);
 box(x+w/2,12.8,z-.16,1.15,25,.7,frameMetal,parent);
 box(x,1,z-.3,w,1.6,1,frameMetal,parent);
 box(x,24.6,z-.3,w,1.55,1,frameMetal,parent);
 box(x,14.7,z-.3,w,.48,.6,frameMetal,parent);
 box(x,12.7,z+3,w-1,23,.2,warmGlassGlow,parent,false);
 box(x,2,z+2,w-1,.8,5,paleStone,parent,false);
 addMannequin(parent,x-w*.21,z+1.2,tone,0x262b35);
 if(w>18)addMannequin(parent,x+w*.21,z+1.2,accent,0x4e4350);
}
function makeStoreTemplate({id,label,subtitle,x,z,width,height,tint,accent,poster}){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const half=width/2,front=-26,back=17;
 // Long body extends backwards and has real side depth.
 box(0,height*.52,back-2,width-1,height,40,colorMaterial(tint),g);
 box(0,height-.75,-2,width+2,1.6,45,frameMetal,g);
 box(0,height*.75,front+3,width-2,height*.43,4,creamPanel,g);
 box(0,height*.64,front+.6,width-2,5.3,4,paleStone,g);
 box(-half+3.5,height*.52,front-.7,7,height,7,darkStone,g);
 box(half-3.5,height*.52,front-.7,7,height,7,darkStone,g);
 // Reinforced store columns and horizontals like the reference.
 for(const xx of [-half+10,half-10])box(xx,height*.74,front-2.3,3.4,height*.45,4,frameMetal,g);
 box(0,29,front-3,width-15,4.7,2.4,darkStone,g);
 const leftW=(width-26)/2;
 const glassZ=front-4.6;
 storeWindow(g,-width*.29,leftW,glassZ,accent,0xd4c9c3);
 storeWindow(g,width*.29,leftW,glassZ,0xc1b8aa,accent);
 // Door vestibule: actual transparent glazing, metal mullions, handles.
 box(0,12.5,glassZ-1,15,24,.22,facadeGlass.clone(),g,false);
 for(const xx of [-7.8,0,7.8])box(xx,12.8,glassZ-1.4,.8,25,1,frameMetal,g);
 box(0,24.8,glassZ-1.5,17,1.6,1,frameMetal,g);
 box(-.9,11.2,glassZ-2.5,.7,6,1,creamPanel,g);
 box(.9,11.2,glassZ-2.5,.7,6,1,creamPanel,g);
 // Three awnings protrude, with underlighting and clean fascia edges.
 for(const xx of [-width*.29,0,width*.29]){
  const w=xx===0?20:leftW+5;
  box(xx,27,glassZ-5.3,w,1.1,11,paleStone,g);
  box(xx,26,glassZ-10,w,1.05,1.3,frameMetal,g);
  litBox(xx,25.5,glassZ-8,w*.78,.3,.75,mats.gold,g);
 }
 // Customizable store sign using a real 3D plane carrying a 2D brand texture.
 const tex=canvasLabel(label,subtitle,"#fff4e8",accent);
 const sign=new THREE.Mesh(
  new THREE.PlaneGeometry(width*.72,Math.min(18,height*.27)),
  new THREE.MeshBasicMaterial({map:tex,transparent:false,side:THREE.DoubleSide}));
 sign.position.set(0,height-10,front-4.3);g.add(sign);
 box(0,height-20,front-3,width*.77,1.6,1,frameMetal,g);
 // Modular horizontal top cornice and vertical detail bands.
 box(0,height+1,front-1,width+4,2.6,5,frameMetal,g);
 box(0,height-3,front+2,width+2,3,5,paleStone,g);
 for(const side of [-1,1])for(const yy of [height*.42,height*.68,height*.90])
  box(side*(half-3.5),yy,front-4,9,1.2,5,paleStone,g);
 // Sidewalk merchandising planters.
 for(const xx of [-half+9,half-9]){
  box(xx,2.7,glassZ-10,9,5.4,9,darkStone,g);
  cyl(xx,6.6,glassZ-10,5.7,5.1,4.8,mats.leaves,7,g);
 }
 // Exterior sconce lighting on the columns.
 for(const xx of [-half+4.2,half-4.2]){
  litBox(xx,28.5,front-5,2.6,6,1,mats.gold,g);
 }
 const frontLight=new THREE.PointLight(0xffba91,90,70,2);
 frontLight.position.set(0,20,front-17);g.add(frontLight);
 return {id,g,sign,tex};
}
const retailBuildings=[
 makeStoreTemplate({id:"threads",label:"THE THREADS SHOP",subtitle:"TEENSEYS' · FASHION & STREETWEAR",
   x:0,z:-5,width:94,height:58,tint:0x4e4954,accent:0x8a6ad4}),
 makeStoreTemplate({id:"sole",label:"SOLE HOUSE",subtitle:"SNEAKERS · NEW RELEASES",
   x:-89,z:-5,width:72,height:57,tint:0x535767,accent:0x9da7ca}),
 makeStoreTemplate({id:"cafe",label:"CORNER CAFÉ",subtitle:"COFFEE · PASTRIES · GOOD COMPANY",
   x:89,z:-5,width:72,height:56,tint:0x755f61,accent:0xb98a74})
];
// Hide the legacy Blockbench façade after 3D modular storefronts are ready;
// the original model source remains in the repository and can be re-used.

const sceneLoaded=Promise.all(models.map(async m=>{
 const r=await fetch(m.path,{cache:"force-cache"});
 if(!r.ok)throw Error(m.path+" returned HTTP "+r.status);
 const data=await r.json();
 const meshCount=modelFromBlockbench(data,m); const legacy=scene.children.at(-1); if(legacy?.isGroup)legacy.visible=false; return {id:m.id,cubes:meshCount};
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
// Full 3D Threads Shop interior — shopping UI remains regular HTML for readability.
const shopScene=new THREE.Scene();
shopScene.background=new THREE.Color(0x29343a);
const shopCamera=new THREE.OrthographicCamera(-99,99,64,-64,.1,650);
shopCamera.position.set(0,105,95);shopCamera.lookAt(0,12,-75);
shopScene.add(new THREE.HemisphereLight(0xfff3dc,0x4b5154,2.3));
const shopAmbient=new THREE.DirectionalLight(0xffe7be,2.5);
shopAmbient.position.set(-30,85,30);shopScene.add(shopAmbient);
const shopMat={
 floor:colorMaterial(0xb8a18a,{roughness:.67}),
 wall:colorMaterial(0xe6dfd1,{roughness:.93}),
 trim:colorMaterial(0x263c42,{roughness:.55}),
 wood:colorMaterial(0x906a4f),
 warm:colorMaterial(0xefdbb9,{emissive:0xb48a57,emissiveIntensity:.24}),
 dark:colorMaterial(0x26323a),
 cream:colorMaterial(0xf5e9d2),
 slate:colorMaterial(0x798c91),
 gold:colorMaterial(0xc4a36b,{metalness:.2,roughness:.32})
};
const sr=(x,y,z,w,h,d,mat)=>box(x,y,z,w,h,d,mat,shopScene,false);
sr(0,-.65,-74,153,1.3,110,shopMat.floor);
const woodPanel=box(0,-.025,-74,151,.05,108,shopMat.floor,shopScene,false);
const floorCanvas=document.createElement("canvas");floorCanvas.width=floorCanvas.height=256;
const fc=floorCanvas.getContext("2d");fc.fillStyle="#b3a18b";fc.fillRect(0,0,256,256);
for(let y=0;y<256;y+=24)for(let x=(Math.floor(y/24)%2)*24;x<256;x+=48){
 fc.fillStyle="#907b6b";fc.fillRect(x,y,46,1);
 fc.fillStyle="#dfcdb4";fc.fillRect(x+2,y+2,2,18);
}
const floorTexture=new THREE.CanvasTexture(floorCanvas);floorTexture.colorSpace=THREE.SRGBColorSpace;
floorTexture.wrapS=floorTexture.wrapT=THREE.RepeatWrapping;floorTexture.repeat.set(3,3);
woodPanel.material=new THREE.MeshStandardMaterial({map:floorTexture,roughness:.68});
sr(0,24,-129,155,49,2,shopMat.wall);
sr(-77,24,-75,2,49,111,shopMat.wall);
sr(77,24,-75,2,49,111,shopMat.wall);
sr(0,46,-129,155,5,3,shopMat.trim);
for(let i=0;i<8;i++)sr(-69+i*20,40,-127,14,6,1.5,shopMat.slate);
for(let i=0;i<4;i++){
 const light=new THREE.PointLight(0xffe7b7,45,68,2);
 light.position.set(-53+i*36,40,-75);shopScene.add(light);
 sr(-53+i*36,42,-75,9,.7,7,shopMat.warm);
}
// Center brand on a rear three-dimensional sign.
const storeSignTex=canvasLabel("THE THREADS SHOP","EXPLORE · SHOP · BE YOU","#fff4e1","#a98cba");
const storeSign=new THREE.Mesh(new THREE.PlaneGeometry(91,25),
 new THREE.MeshBasicMaterial({map:storeSignTex}));
storeSign.position.set(0,31,-127.35);shopScene.add(storeSign);
// Backlit window-display mannequins and feature shelving.
for(const [x,shirt,pants] of [[-62,0xf4e6d1,0x34465b],[-44,0x323940,0x5b493e],
 [44,0xf2e0d3,0x4a4744],[62,0x9c849f,0x2e343b]]){
 const group=new THREE.Group();group.position.set(0,1.2,-119);shopScene.add(group);
 addMannequin(group,x,0,shirt,pants);
}
function shopRail(x,z,w,color=shopMat.trim){
 sr(x,10,z,w,1.6,1.6,color);
 for(const xx of [x-w/2+3,x+w/2-3])sr(xx,5.3,z,1.3,9,1.4,shopMat.gold);
 for(let i=0;i<Math.floor(w/7);i++){
  const xx=x-w/2+4+i*7;
  sr(xx,6.5,z+1.3,5,7.7,1.7,i%3===0?shopMat.cream:i%3===1?shopMat.dark:shopMat.slate);
  sr(xx,10.4,z+1.5,.9,1.2,.7,shopMat.gold);
 }
}
for(const x of [-70,70]){
 sr(x,12,-91,9,24,48,shopMat.wood);
 for(const z of [-112,-96,-80])shopRail(x,z,8);
}
const shopRacks=[
 {id:"white",x:4,y:5,w:3,h:2,color:"#f7f4e9"},
 {id:"black",x:10,y:5,w:3,h:2,color:"#252a34"},
 {id:"brown",x:16,y:5,w:3,h:2,color:"#8c6750"},
 {id:"hoodies",x:4,y:10,w:3,h:2,color:"#d6be9c"},
 {id:"pants",x:10,y:10,w:3,h:2,color:"#617188"},
 {id:"accessories",x:16,y:10,w:3,h:2,color:"#cda77b"}
];
const shopHitObjects=[];
const shopMapX=tileX=>(tileX-12)*6.5;
const shopMapZ=tileY=>-128+tileY*6.5;
for(const r of shopRacks){
 const x=shopMapX(r.x+r.w/2),z=shopMapZ(r.y+r.h/2);
 const g=new THREE.Group();g.position.set(x,0,z);shopScene.add(g);
 const mat=colorMaterial(r.color);
 box(0,1.2,0,16,2.2,9.6,shopMat.wood,g);
 box(0,3.2,0,17,1.2,10.5,shopMat.trim,g);
 box(0,9.6,0,16,1.15,1.2,shopMat.gold,g);
 for(const xx of [-7,7]){
  box(xx,6.5,0,1.1,10,.95,shopMat.trim,g);
 }
 for(const xx of [-4,0,4]){
  box(xx,6.8,1,3.4,7,4,mat,g);
 }
 const labelTexture=canvasLabel(r.id.toUpperCase(),"THE THREADS SHOP","#fff7e2","#9e87bc");
 const signMesh=new THREE.Mesh(new THREE.PlaneGeometry(18,4.5),
   new THREE.MeshBasicMaterial({map:labelTexture,side:THREE.DoubleSide}));
 signMesh.position.set(0,12.6,-.9);g.add(signMesh);
 g.traverse(obj=>{if(obj.isMesh){obj.userData.rackId=r.id;shopHitObjects.push(obj)}});
}
const register=sr(65,6.3,-104,18,13,9,shopMat.dark);
sr(65,13.3,-104,20,1.4,10,shopMat.wood);
sr(66,15.1,-104,8,3,3,shopMat.slate);
sr(0,.02,-28,32,.09,6,shopMat.dark);
const doorwayLabel=new THREE.Mesh(new THREE.PlaneGeometry(26,6),
 new THREE.MeshBasicMaterial({map:canvasLabel("EXIT","TO NIGHT PLAZA","#fff8e9","#ac97c4"),side:THREE.DoubleSide}));
doorwayLabel.position.set(0,19,-25);shopScene.add(doorwayLabel);
const cashier=makeBillboard(4);
cashier.sprite.position.set(shopMapX(21),.25,shopMapZ(5));
shopScene.add(cashier.sprite);
const rackRaycaster=new THREE.Raycaster();
const clickCoord=new THREE.Vector2();
gameCanvas.addEventListener("click",e=>{
 const state=window.teenseysTownState?.();
 if(!state?.started||state.mode!=="store"||state.activePanel!=="none")return;
 const rect=gameCanvas.getBoundingClientRect();
 clickCoord.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));
 rackRaycaster.setFromCamera(clickCoord,shopCamera);
 const hit=rackRaycaster.intersectObjects(shopHitObjects,false).find(v=>v.object.userData.rackId);
 if(!hit)return;
 e.preventDefault();e.stopImmediatePropagation();
 const id=hit.object.userData.rackId;
 const r=shopRacks.find(v=>v.id===id);
 const p=state.player;
 if(p&&r){
  const dx=Math.max(r.x-p.x,0,p.x-(r.x+r.w-1));
  const dy=Math.max(r.y-p.y,0,p.y-(r.y+r.h-1));
  if(dx+dy<=2)window.teenseysOpenRack?.(id);
  else window.teenseys3DToast?.("Walk closer to the "+id+" rack, then click again.");
 }
},true);


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
 const show=!!bridge?.started&&(bridge.mode==="town"||bridge.mode==="store");
 renderer.domElement.style.display=show?"block":"none";
 if(show){
  const inShop=bridge.mode==="store";
  const p=inShop?bridge.player:bridge.townPlayer;
  const dx=previousPX===null?0:p.x-previousPX,dy=previousPY===null?0:p.y-previousPY;
  const walking=Math.abs(dx)+Math.abs(dy)>.01;
  previousPX=p.x;previousPY=p.y;
  const sprite=sprites[Math.max(0,Math.min(5,bridge.character||0))];
  for(const s of sprites)s.sprite.visible=s===sprite;
  // Existing movement and E-to-enter logic remain in the shopping game.
  if(inShop)destination.set(shopMapX(p.x),.3,shopMapZ(p.y));
  else destination.set((p.x-480)*.27,.5,-54-(p.y-380)*.52);
  sprite.sprite.position.copy(destination);
  drawBillboard(sprite,p.dir,walking?Math.floor(time/130)%4:0);
  for(const npc of npcs){npc.data.sprite.visible=!inShop; npc.data.sprite.position.set(npc.x,.5,npc.z);
   if(!inShop)drawBillboard(npc.data,npc.dir,Math.floor(time/900)%4);}
  cashier.sprite.visible=inShop;
  if(inShop)drawBillboard(cashier,"down",0);
  if(sprite.sprite.parent!== (inShop?shopScene:scene)){
   sprite.sprite.parent?.remove(sprite.sprite);
   (inShop?shopScene:scene).add(sprite.sprite);
  }
  const pulse=1+Math.sin(time/320)*.12;
  for(let i=0;i<jets.length;i++)jets[i].scale.y=pulse+Math.sin(time/480+i)*.12;
  fountainGlow.intensity=85+Math.sin(time/500)*12;
  renderer.render(inShop?shopScene:scene,inShop?shopCamera:camera);
 }else{
  previousPX=null;previousPY=null;
 }
}
requestAnimationFrame(animate);
window.addEventListener("pagehide",()=>{running=false;renderer.dispose();for(const s of [...sprites,...npcs.map(n=>n.data),cashier])s.texture.dispose()},{once:true});
