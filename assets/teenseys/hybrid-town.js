import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

/*
 * Teenseys' hybrid scene v1.7
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
renderer.toneMappingExposure=1.12;
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
const hemi=new THREE.HemisphereLight(0xb4bfdf,0x332b41,1.55);
scene.add(hemi);
const moon=new THREE.DirectionalLight(0xa3b1de,1.6);
moon.position.set(-85,125,-60);
moon.castShadow=true;
moon.shadow.mapSize.set(1024,1024);
moon.shadow.camera.left=-180;moon.shadow.camera.right=180;
moon.shadow.camera.top=150;moon.shadow.camera.bottom=-150;
scene.add(moon);
const warm=new THREE.DirectionalLight(0xffc9a1,.94);warm.position.set(40,90,80);scene.add(warm);
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
// Clear backdrop: no extra placeholder buildings while the new shop is planned.
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
// Inset metallic rim, lit ripples, and tiered water in the central plaza.
const fountainRimMat=colorMaterial(0xbcb1c3,{metalness:.48,roughness:.3});
for(const [radius,y,opacity] of [[21.3,2.6,.75],[17.5,2.85,.36],[12.3,3,.47]]){
 const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.36,9,64),
  new THREE.MeshStandardMaterial({color:radius>20?0xf1d6de:0x7cddf6,
   transparent:true,opacity,emissive:radius>20?0x6f647b:0x1d9ec7,emissiveIntensity:.6}));
 ring.rotation.x=Math.PI/2;ring.position.y=y;fountain.add(ring);
}
for(const radius of [6.5,3.9]){
 const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,.7,8,32),fountainRimMat);
 ring.rotation.x=Math.PI/2;ring.position.y=5.3;fountain.add(ring);
}
const jets=[];
for(let i=0;i<9;i++){
 const angle=2*Math.PI*i/9,rad=i===0?0:10;
 const jet=cyl(Math.cos(angle)*rad,5.9,Math.sin(angle)*rad,.55,.9,4.8,mats.teal,8,fountain);
 jets.push(jet);
}
const fountainGlow=new THREE.PointLight(0x4bdcff,66,66,2);
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

function architectureTexture(type,base,secondary){
 const c=document.createElement("canvas");c.width=c.height=512;
 const g=c.getContext("2d");g.fillStyle=base;g.fillRect(0,0,512,512);
 if(type==="brick"){
  for(let row=0;row<17;row++)for(let col=-1;col<7;col++){
   const x=col*104+(row%2)*52,y=row*31;
   g.fillStyle=secondary;g.globalAlpha=.12+Math.abs((row*17+col*7)%8-4)*.023;
   g.fillRect(x+2,y+3,100,26);g.globalAlpha=1;
   g.fillStyle="#171d24";g.globalAlpha=.27;
   g.fillRect(x,y,104,2);g.fillRect(x,y,2,31);g.globalAlpha=1;
   g.fillStyle="#fff5e9";g.globalAlpha=.08;g.fillRect(x+4,y+4,95,2);g.globalAlpha=1;
  }
 }else{
  for(let y=0;y<512;y+=44){g.fillStyle="#29303b";g.globalAlpha=.15;g.fillRect(0,y,512,2);g.globalAlpha=1;}
  for(let i=0;i<700;i++){const x=(i*137)%512,y=(i*79)%512;
    g.fillStyle=i%2?"#fffaf0":"#2b2a3b";g.globalAlpha=.045;g.fillRect(x,y,9,4);}
  g.globalAlpha=1;
 }
 const t=new THREE.CanvasTexture(c);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;
 t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
}
const facadeTextures={
 charcoal:architectureTexture("brick","#68616e","#aaa1b0"),
 blue:architectureTexture("brick","#5b6472","#a1b6c5"),
 clay:architectureTexture("brick","#9e7772","#d2a48e"),
 stone:architectureTexture("stone","#ddd1c2","#f7e3ce")
};
const facadeMats={
 brick:new THREE.MeshStandardMaterial({map:facadeTextures.charcoal,roughness:.95}),
 blue:new THREE.MeshStandardMaterial({map:facadeTextures.blue,roughness:.95}),
 clay:new THREE.MeshStandardMaterial({map:facadeTextures.clay,roughness:.94}),
 stone:new THREE.MeshStandardMaterial({map:facadeTextures.stone,roughness:.81}),
 metal:colorMaterial(0x252b35,{roughness:.37,metalness:.56}),
 interior:colorMaterial(0xc4ab98,{roughness:.85}),
 oak:colorMaterial(0x9e8069,{roughness:.56}),
 display:colorMaterial(0xe0cbaf,{roughness:.72}),
 accent:colorMaterial(0x9c759e,{metalness:.22,roughness:.46}),
 lamp:colorMaterial(0xffd4a6,{emissive:0xffa760,emissiveIntensity:.92})
};
const facadeGlass=new THREE.MeshPhysicalMaterial({
 color:0xc2d4df,roughness:.1,metalness:0,transparent:true,opacity:.19,
 depthWrite:false,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.06
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
 const m=facadeMats,metal=m.metal;
 // Transparent glass sits in FRONT of a hollow, furnished display recess.
 box(x,12.7,z,w,24,.13,facadeGlass,parent,false);
 box(x,12.5,z+21,w-2,24,.5,m.interior,parent,false);
 box(x,1.1,z+11,w-2,2,23,m.oak,parent,false);
 box(x,1.8,z+8,w-5,2.5,13,m.display,parent,false);
 // The storefront's storefront window framing is fully three-dimensional.
 for(const xx of [x-w/2,x+w/2])box(xx,12.7,z-.2,1.25,25,.85,metal,parent);
 for(const yy of [.75,14.5,25])box(x,yy,z-.3,w+.9,1,.85,metal,parent);
 box(x,12.7,z-.4,.85,24,.8,metal,parent);
 // Hanging showroom lights and simple merchandise displays behind the pane.
 box(x,23,z+11,w-3,.5,6,m.lamp,parent,false);
 box(x,12,z+19,w-8,.75,3,m.oak,parent,false);
 box(x,7,z+19,w-8,.75,3,m.oak,parent,false);
 for(let i=0;i<Math.floor(w/9);i++){
  box(x-w/2+6+i*9,8.8,z+19,5,3.2,3,i%2?m.accent:m.display,parent,false);
 }
 addMannequin(parent,x-w*.22,z+5,tone,0x2a3039);
 if(w>18)addMannequin(parent,x+w*.22,z+5,accent,0x483e47);
}
function makeStoreTemplate({id,label,subtitle,x,z,width,height,tint,accent}){
 const g=new THREE.Group();g.name=id+"-retail";g.position.set(x,0,z);scene.add(g);
 const m=facadeMats,half=width/2,front=-26,windowZ=-30,back=17;
 const brick=id==="threads"?m.brick:id==="sole"?m.blue:m.clay;
 const bayW=(width-26)/2,bayX=width*.29;
 // Hollow architecture means glass windows genuinely reveal interior displays.
 box(0,height-11,-3,width,22,45,brick,g);
 box(0,height*.51,back,width-3,height,2.5,m.interior,g);
 box(-half+2.4,height*.50,-3,4.8,height,42,brick,g);
 box(half-2.4,height*.50,-3,4.8,height,42,brick,g);
 box(0,.4,-5,width-2,.8,45,m.oak,g);
 box(0,27,0,width-8,1,34,m.stone,g);
 // Upper architectural mass, parapet, cornice, projecting limestone bands.
 box(0,height-18,front+.8,width-8,26,3,brick,g);
 for(const [yy,ww,dep,h] of [[height+1,width+4,6,2.8],[height-4,width+1,5,2.7],[height-30,width+1,5,2.6]]){
  box(0,yy,front,ww,h,dep,m.stone,g);
 }
 box(0,height+3,front+2,width+6,1.2,7,m.metal,g);
 // Individual reinforced storefront piers with capitals and plinths.
 for(const xx of [-half+3.6,-width*.115,width*.115,half-3.6]){
  box(xx,15,front-2.6,4.6,30,5,brick,g);
  box(xx,29,front-3.1,6.2,2.2,5.4,m.stone,g);
  box(xx,2.7,front-3.2,6.1,5.4,5.4,m.stone,g);
 }
 // Actual showroom: windows are panes in open bays, not opaque printed wall panels.
 storeWindow(g,-bayX,bayW,windowZ,accent,0xe9d6c8);
 storeWindow(g,bayX,bayW,windowZ,0xe9dac9,accent);
 box(0,12.5,windowZ-1,15,24,.14,facadeGlass,g,false);
 for(const xx of [-7.8,0,7.8])box(xx,12.5,windowZ-1.3,.8,25,.9,m.metal,g);
 box(0,25.1,windowZ-1.3,16.8,1.2,1,m.metal,g);
 box(0,.8,windowZ-1.3,16.8,1.5,1,m.metal,g);
 for(const xx of [-1.3,1.3])box(xx,11,windowZ-2,.6,5,1,m.stone,g,false);
 box(0,.19,windowZ-8,17,.38,10,m.metal,g,false);
 // Inner wall and shelving visible through double door.
 box(0,13,7,23,24,.7,m.interior,g,false);
 for(const xx of [-10,10]){
  box(xx,7,-3,3,14,4,m.metal,g,false);
  box(xx,7,0,2,6,3,m.accent,g,false);
 }
 for(const xx of [-bayX,0,bayX]){
  const ww=xx===0?20:bayW+2;
  box(xx,27,windowZ-5.5,ww,1.4,13,m.stone,g);
  box(xx,26.1,windowZ-11.5,ww,.7,1.5,m.metal,g);
  box(xx,26,windowZ-7,ww-3,.18,5,m.lamp,g,false);
 }
 const tex=canvasLabel(label,subtitle,"#fff6eb",
   typeof accent==="number"?"#"+accent.toString(16).padStart(6,"0"):accent);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(width*.74,Math.min(18,height*.26)),
   new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
 sign.position.set(0,height-16,front-1.1);g.add(sign);
 box(0,height-25,front,width*.78,.8,2,m.stone,g);
 // Boutique center tower, sneaker stepped parapet, cafe period cornice.
 if(id==="threads"){
  box(0,height+3.5,front+2,width*.38,5.5,7,brick,g);
  box(0,height+6.5,front+2,width*.42,.9,7,m.stone,g);
 }else if(id==="sole"){
  for(const xx of [-half*.5,half*.5])box(xx,height+2.5,front+2,9,4.8,6,m.metal,g);
 }else{
  for(let i=0;i<6;i++)box(-half+12+i*(width-24)/5,height+1.2,front+1,3.5,2.5,4,m.stone,g);
 }
 for(const xx of [-half+8,half-8]){
  box(xx,27,windowZ-2,2,5.5,1.4,m.lamp,g,false);
  box(xx,2.1,windowZ-13,8.5,4.2,8,m.metal,g);
  cyl(xx,6.1,windowZ-13,5,4.5,5,mats.leaves,8,g);
 }
 // A modest number of physically motivated sources keeps performance predictable.
 const insideLight=new THREE.PointLight(0xffd4ae,36,62,2);
 insideLight.position.set(0,20,front+12);g.add(insideLight);
 const entranceLight=new THREE.PointLight(0xffc79d,30,60,2);
 entranceLight.position.set(0,27,windowZ-10);g.add(entranceLight);
 return {id,g,sign,tex};
}
// One unified flagship shopping building replaces all three earlier retail exteriors.
// Teenseys' plaza is deliberately cleared for a completely new building design.
// Keep the 3D paving, lighting, trees, planters, fountain, camera and 2D shoppers.
// Building templates remain defined above for future use, but NO storefront is placed.
const retailBuildings=[];
if(statusBadge)statusBadge.textContent="OPEN PLAZA · NEW BUILDING COMING";
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
shopScene.add(new THREE.HemisphereLight(0xfff3de,0x4d4853,1.65));
const shopAmbient=new THREE.DirectionalLight(0xffead2,1.9);
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
woodPanel.material=new THREE.MeshStandardMaterial({map:floorTexture,roughness:.6});
sr(0,24,-129,155,49,2,shopMat.wall);
sr(-77,24,-75,2,49,111,shopMat.wall);
sr(77,24,-75,2,49,111,shopMat.wall);
sr(0,46,-129,155,5,3,shopMat.trim);
for(let i=0;i<8;i++)sr(-69+i*20,40,-127,14,6,1.5,shopMat.slate);
for(let i=0;i<4;i++){
 const light=new THREE.PointLight(0xffe7b7,29,57,2);
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
  fountainGlow.intensity=66+Math.sin(time/650)*7;
  renderer.render(inShop?shopScene:scene,inShop?shopCamera:camera);
 }else{
  previousPX=null;previousPY=null;
 }
}
window.teenseys3DReady=true;
requestAnimationFrame(animate);
window.addEventListener("pagehide",()=>{running=false;renderer.dispose();for(const s of [...sprites,...npcs.map(n=>n.data),cashier])s.texture.dispose()},{once:true});
