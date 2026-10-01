import * as T from '../../vendor/three/three.module.js';
import {SIZE} from './model.js';
import {poses} from './motion.js';
export function pageTextMatrix(project,w,h){
 const tl=project(SIZE.w-.32,.65,-.06),tr=project(.32,.65,-.06);
 const scale=Math.hypot(tr.x-tl.x,tr.y-tl.y)/w,cx=(tl.x+tr.x)/2,cy=project(SIZE.w/2,0,-.06).y;
 return [(tr.x-tl.x)/w,(tr.y-tl.y)/w,0,scale,cx-w*scale/2,cy-h*scale/2];
}
export function bookCamera(camera,width,height,pose){
 const aspect=width/height,span=Math.max(4.95,(3.9+2.35*pose.spread)/aspect);
 Object.assign(camera,{left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2});
 camera.position.set(pose.look+1.15,2.4,16);camera.lookAt(pose.look,0,0);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
}
// The same projection is available before the book is visible.
export function endingTextMatrix(width,height,w,h){
 const camera=new T.OrthographicCamera(-4,4,3,-3,.1,80),root=new T.Group(),rig=new T.Group();
 root.rotation.y=poses.ending.turn;root.position.z=poses.ending.lift;rig.position.x=-SIZE.w/2;root.add(rig);root.updateMatrixWorld(true);bookCamera(camera,width,height,poses.ending);
 return pageTextMatrix((x,y,z)=>{const v=new T.Vector3(x,y,z);rig.localToWorld(v);v.project(camera);return {x:(v.x+1)*width/2,y:(1-v.y)*height/2};},w,h);
}
