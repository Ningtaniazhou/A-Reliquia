import * as T from '../../vendor/three/three.module.js';
// Parametric hardcover, XY is the page plane; Z is thickness. All hinges are local Y axes.
export const SIZE={w:2.8,h:4,t:.28,flap:1.7};
export async function createBook(){
 const {w,h,t,flap}=SIZE,root=new T.Group();root.name='BookTurn';
 const rig=new T.Group();rig.name='Binding';rig.position.x=-w/2;root.add(rig);
 const textures=[];
 function texture(draw,width=1024,height=1024){const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);return tex;}
 // Deterministic woven cloth and paper fibres, generated from the material definition.
 let seed=431;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 const cloth=texture((c,w,h)=>{c.fillStyle='#17483d';c.fillRect(0,0,w,h);for(let i=0;i<42000;i++){c.fillStyle=random()>.5?'#ffffff0d':'#00000015';c.fillRect(random()*w,random()*h,1,3);}for(let x=0;x<w;x+=3){c.fillStyle='#ffffff04';c.fillRect(x,0,1,h);}});
 const paper=texture((c,w,h)=>{c.fillStyle='#eee6d2';c.fillRect(0,0,w,h);for(let i=0;i<26000;i++){c.fillStyle=random()>.5?'#fff6':'#71634b09';c.fillRect(random()*w,random()*h,random()*2+1,1);}});
 const edges=texture((c,w,h)=>{c.fillStyle='#d8ccb0';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=7){c.fillStyle=y%3?'#bdb092':'#eee4cb';c.fillRect(0,y,w,1+random());}},512,1024);
 const sideEdges=edges.clone();sideEdges.center.set(.5,.5);sideEdges.rotation=Math.PI/2;textures.push(sideEdges);const edgeSide=new T.MeshStandardMaterial({map:sideEdges,roughness:1});
 const green=new T.MeshStandardMaterial({map:cloth,roughness:.83}),cream=new T.MeshStandardMaterial({map:paper,roughness:.94}),edge=new T.MeshStandardMaterial({map:edges,roughness:1}),gold=new T.MeshStandardMaterial({color:'#bda16b',metalness:.5,roughness:.46});
 function box(name,parent,width,height,depth,x=0,y=0,z=0,mat=green){let geometry;if(name==='FrontBoard'||name==='BackBoard'){const shape=new T.Shape();shape.moveTo(-width/2,-height/2);shape.lineTo(width/2,-height/2);shape.lineTo(width/2,height/2);shape.lineTo(-width/2,height/2);shape.closePath();geometry=new T.ExtrudeGeometry(shape,{depth:depth-.018,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.009,bevelThickness:.009});geometry.translate(0,0,-(depth-.018)/2);}else geometry=new T.BoxGeometry(width,height,depth);const m=new T.Mesh(geometry,mat);m.name=name;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function sheet(name,parent,width,height,x,z,mat=cream){const mesh=new T.Mesh(new T.PlaneGeometry(width,height),mat);mesh.name=name;mesh.position.set(x,0,z);mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function border(parent,z){for(const inset of [.15,.19]){const width=w-inset*2,height=h-inset*2;box('GiltRule',parent,width,.009,.003,w/2,height/2,z,gold);box('GiltRule',parent,width,.009,.003,w/2,-height/2,z,gold);box('GiltRule',parent,.009,height,.003,inset,0,z,gold);box('GiltRule',parent,.009,height,.003,w-inset,0,z,gold);}}
 const back=new T.Group();back.name='BackCoverHinge';back.position.z=-.034;rig.add(back);
 box('BackBoard',back,w+.04,h+.05,.055,w/2);sheet('RearEndpaper',back,w-.13,h-.13,w/2,.029);border(back,-.03);
 const block=box('PageBlock',rig,w-.12,h-.12,t,w/2+.012,0,t/2,[edgeSide,edgeSide,edge,edge,cream,cream]);
 // A thin last leaf has its own hinge and is retained in the exported model.
 const lastLeaf=new T.Group();lastLeaf.name='LastLeafHinge';lastLeaf.position.z=t+.007;rig.add(lastLeaf);sheet('LastPage',lastLeaf,w-.12,h-.12,w/2,t*.005,new T.MeshStandardMaterial({map:paper,side:T.DoubleSide,roughness:1}));
 const front=new T.Group();front.name='FrontCoverHinge';front.position.z=t+.063;rig.add(front);
 box('FrontBoard',front,w+.04,h+.05,.055,w/2);sheet('FrontEndpaper',front,w-.13,h-.13,w/2,-.029).rotation.y=Math.PI;border(front,.030);
 // Flap folds under the front cover. The cream printed side faces down while folded.
 const fold=new T.Group();fold.name='FrontFlapHinge';fold.position.set(w,0,-.033);front.add(fold);
 box('FrontFlapPaper',fold,flap,h+.068,.008,-flap/2,0,0,cream);
 const backFold=new T.Group();backFold.name='RearFlapHinge';backFold.position.set(w,0,.052);back.add(backFold);
 box('RearFlapPaper',backFold,flap,h+.068,.012,-flap/2,0,0,cream);
 box('RearFlapFoldEdge',backFold,.012,h+.068,.006,-flap,0,.008,new T.MeshStandardMaterial({color:0xb8ab8f,roughness:1}));
 // Curved spine joins both boards; raised sewing bands keep the silhouette recognisable.
 const spine=new T.Mesh(new T.CylinderGeometry((t+.1)/2,(t+.1)/2,h+.045,24,1,false,0,Math.PI),green);spine.name='RoundedSpine';spine.rotation.z=0;spine.rotation.y=Math.PI;spine.position.set(.01,0,t/2);rig.add(spine);spine.castShadow=true;
 for(const y of [-1.55,-1.38,1.38,1.55]){const ring=new T.Mesh(new T.CylinderGeometry((t+.113)/2,(t+.113)/2,.025,24,1,false,0,Math.PI),gold);ring.rotation.y=Math.PI;ring.position.set(.008,y,t/2);rig.add(ring);}
 const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=new URL('../../assets/cover-parcel.webp',import.meta.url).href;});
 const coverArt=texture((c,cw,ch)=>{c.clearRect(0,0,cw,ch);c.fillStyle='#e6ce92';c.textAlign='center';c.font='34px "Songti SC",serif';c.fillText('埃萨·德·凯罗斯',cw/2,145);c.font='100px "Songti SC",serif';c.fillText('圣遗物',cw/2,300);c.font='25px Georgia,serif';c.fillText('A RELÍQUIA',cw/2,363);c.save();c.beginPath();c.moveTo(180,1115);c.lineTo(180,650);c.bezierCurveTo(180,365,844,365,844,650);c.lineTo(844,1115);c.closePath();c.clip();const ratio=Math.max(664/image.width,680/image.height);c.drawImage(image,512-image.width*ratio/2,785-image.height*ratio/2,image.width*ratio,image.height*ratio);c.restore();c.strokeStyle='#bca36d';c.lineWidth=3;c.beginPath();c.moveTo(180,1115);c.lineTo(180,650);c.bezierCurveTo(180,365,844,365,844,650);c.lineTo(844,1115);c.closePath();c.stroke();},1024,1463);
 const art=sheet('FrontCoverArtwork',front,w-.1,h-.1,w/2,.032,new T.MeshStandardMaterial({map:coverArt,transparent:true,roughness:.8,depthWrite:false}));
 root.userData={title:'圣遗物 · 前后护封书本',units:'relative',version:1,hinges:'FrontCoverHinge, FrontFlapHinge, BackCoverHinge, RearFlapHinge, LastLeafHinge',text:'Runtime copy is separate from geometry; cover lettering is generated from editable source.'};
 return {root,rig,front,back,fold,backFold,block,lastLeaf,art,textures};
}
