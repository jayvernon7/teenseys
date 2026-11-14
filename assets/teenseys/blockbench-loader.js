// Teenseys' editable Blockbench project loader.
// Converts a .bbmodel's individually textured, rotated cubes to material-batched
// Three.js geometry. Preserves source UV rectangles, signs and transparent glass.
export async function loadBlockbench({THREE,url,hideGroups=[]}){
 const response=await fetch(url,{cache:"force-cache"});
 if(!response.ok)throw new Error("Unable to load boutique model: HTTP "+response.status);
 const model=await response.json();
 if(!Array.isArray(model.elements)||!Array.isArray(model.textures))throw new Error("Invalid Blockbench model data");
 const loader=new THREE.TextureLoader();
 const textures=model.textures.map(t=>{
  const texture=loader.load(t.source);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.LinearFilter;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.anisotropy=4;
  return texture;
 });
 const materials=model.textures.map((t,i)=>{
  const name=t.name.toUpperCase();
  const glass=/TRANSLUCENT.*GLASS|ENTRY_GLASS/.test(name);
  const mesh=/PERFORATED_MESH/.test(name);
  const glowing=/WARM_LED|WARM_LIGHT|STORE_SIGN|REAR_SIGN|CHECKOUT_SIGN/.test(name);
  const params={
   map:textures[i],side:THREE.DoubleSide,transparent:glass||mesh,
   depthWrite:!(glass||mesh),
   roughness:glass?.14:mesh?.62:.78,
   metalness:glass?.06:/STEEL|METAL|BRASS|GRAPHITE/.test(name)?.45:.06
  };
  if(glowing){params.emissive=new THREE.Color(0x655349);params.emissiveMap=textures[i];params.emissiveIntensity=.3;}
  return glass?new THREE.MeshPhysicalMaterial({...params,clearcoat:.7,clearcoatRoughness:.1})
   :new THREE.MeshStandardMaterial(params);
 });
 const groups=model.groups||[];
 const uidToGroup=new Map();
 for(let g=0;g<(model.outliner||[]).length;g++){
  const record=model.outliner[g];
  if(record?.uuid){
   const name=groups.find(k=>k.uuid===record.uuid)?.name||"Group "+g;
   for(const uid of record.children||[])if(typeof uid==="string")uidToGroup.set(uid,name);
  }
 }
 const root=new THREE.Group();
 root.name=model.name||"Blockbench building";
 const collection=new Map();
 const FACE_ORDER=["east","west","up","down","south","north"];
 const v=new THREE.Vector3(),center=new THREE.Vector3(),pivot=new THREE.Vector3();
 let elementCount=0;
 for(const e of model.elements){
  if(e.type!=="cube"||e.visibility===false||e.export===false)continue;
  const groupName=uidToGroup.get(e.uuid)||"Uncategorized";
  if(hideGroups.some(n=>groupName.includes(n)))continue;
  const [x,y,z]=e.from,[X,Y,Z]=e.to;
  const dx=Math.max(.001,Math.abs(X-x)),dy=Math.max(.001,Math.abs(Y-y)),dz=Math.max(.001,Math.abs(Z-z));
  const cube=new THREE.BoxGeometry(dx,dy,dz).toNonIndexed();
  const uv=cube.getAttribute("uv"),pos=cube.getAttribute("position"),nor=cube.getAttribute("normal");
  center.set((x+X)/2,(y+Y)/2,(z+Z)/2);
  pivot.set(...(e.origin||center.toArray()));
  const rot=e.rotation||[0,0,0];
  const euler=new THREE.Euler(...rot.map(a=>THREE.MathUtils.degToRad(a)),"XYZ");
  for(let side=0;side<6;side++){
   const face=e.faces?.[FACE_ORDER[side]];
   const idx=Number(face?.texture);
   if(!face||!Number.isInteger(idx)||idx<0||idx>=textures.length)continue;
   const key=groupName+"|"+idx;
   if(!collection.has(key))collection.set(key,{groupName,idx,positions:[],uvs:[],normals:[]});
   const dest=collection.get(key);
   const uvRect=face.uv||[0,0,model.textures[idx].width,model.textures[idx].height];
   const tw=model.textures[idx].width||256,th=model.textures[idx].height||256;
   for(let k=side*6;k<side*6+6;k++){
    v.set(pos.getX(k),pos.getY(k),pos.getZ(k)).add(center).sub(pivot).applyEuler(euler).add(pivot);
    dest.positions.push(v.x,v.y,v.z);
    v.set(nor.getX(k),nor.getY(k),nor.getZ(k)).applyEuler(euler);
    dest.normals.push(v.x,v.y,v.z);
    const u0=uv.getX(k),v0=uv.getY(k);
    dest.uvs.push((uvRect[0]+(uvRect[2]-uvRect[0])*u0)/tw,
      1-(uvRect[1]+(uvRect[3]-uvRect[1])*(1-v0))/th);
   }
  }
  elementCount++;cube.dispose();
 }
 const groupsByName=new Map();
 for(const item of collection.values()){
  if(!groupsByName.has(item.groupName)){
   const g=new THREE.Group();g.name=item.groupName;groupsByName.set(item.groupName,g);root.add(g);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(item.positions,3));
  geometry.setAttribute("normal",new THREE.Float32BufferAttribute(item.normals,3));
  geometry.setAttribute("uv",new THREE.Float32BufferAttribute(item.uvs,2));
  const mesh=new THREE.Mesh(geometry,materials[item.idx]);
  mesh.name=item.groupName+" / "+model.textures[item.idx].name;
  mesh.receiveShadow=true;
  mesh.castShadow=false;
  groupsByName.get(item.groupName).add(mesh);
 }
 return {root,source:model,elementCount,meshCount:collection.size,groupsByName,textures,materials};
}
