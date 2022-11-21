/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.98
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */
define(["exports","./Matrix2-7dfd434a","./defaultValue-50f7432c","./Transforms-f305a473","./ComponentDatatype-9b23164a"],(function(t,n,e,a,i){"use strict";const r={};function s(t,n,e){const a=t+n;return i.CesiumMath.sign(t)!==i.CesiumMath.sign(n)&&Math.abs(a/Math.max(Math.abs(t),Math.abs(n)))<e?0:a}r.computeDiscriminant=function(t,n,e){return n*n-4*t*e},r.computeRealRoots=function(t,n,e){let a;if(0===t)return 0===n?[]:[-e/n];if(0===n){if(0===e)return[0,0];const n=Math.abs(e),r=Math.abs(t);if(n<r&&n/r<i.CesiumMath.EPSILON14)return[0,0];if(n>r&&r/n<i.CesiumMath.EPSILON14)return[];if(a=-e/t,a<0)return[];const s=Math.sqrt(a);return[-s,s]}if(0===e)return a=-n/t,a<0?[a,0]:[0,a];const r=s(n*n,-(4*t*e),i.CesiumMath.EPSILON14);if(r<0)return[];const o=-.5*s(n,i.CesiumMath.sign(n)*Math.sqrt(r),i.CesiumMath.EPSILON14);return n>0?[o/t,e/o]:[e/o,o/t]};var o=r;const c={};function u(t,n,e,a){const i=t,r=n/3,s=e/3,o=a,c=i*s,u=r*o,l=r*r,C=s*s,M=i*s-l,h=i*o-r*s,f=r*o-C,m=4*M*f-h*h;let d,g;if(m<0){let t,n,e;l*u>=c*C?(t=i,n=M,e=-2*r*M+i*h):(t=o,n=f,e=-o*h+2*s*f);const a=-(e<0?-1:1)*Math.abs(t)*Math.sqrt(-m);g=-e+a;const p=g/2,w=p<0?-Math.pow(-p,1/3):Math.pow(p,1/3),R=g===a?-w:-n/w;return d=n<=0?w+R:-e/(w*w+R*R+n),l*u>=c*C?[(d-r)/i]:[-o/(d+s)]}const p=M,w=-2*r*M+i*h,R=f,S=-o*h+2*s*f,O=Math.sqrt(m),x=Math.sqrt(3)/2;let y=Math.abs(Math.atan2(i*O,-w)/3);d=2*Math.sqrt(-p);let P=Math.cos(y);g=d*P;let N=d*(-P/2-x*Math.sin(y));const b=g+N>2*r?g-r:N-r,q=i,L=b/q;y=Math.abs(Math.atan2(o*O,-S)/3),d=2*Math.sqrt(-R),P=Math.cos(y),g=d*P,N=d*(-P/2-x*Math.sin(y));const I=-o,E=g+N<2*s?g+s:N+s,v=I/E,z=-b*E-q*I,T=(s*z-r*(b*I))/(-r*z+s*(q*E));return L<=T?L<=v?T<=v?[L,T,v]:[L,v,T]:[v,L,T]:L<=v?[T,L,v]:T<=v?[T,v,L]:[v,T,L]}c.computeDiscriminant=function(t,n,e,a){const i=n*n,r=e*e;return 18*t*n*e*a+i*r-27*(t*t)*(a*a)-4*(t*r*e+i*n*a)},c.computeRealRoots=function(t,n,e,a){let i,r;if(0===t)return o.computeRealRoots(n,e,a);if(0===n){if(0===e){if(0===a)return[0,0,0];r=-a/t;const n=r<0?-Math.pow(-r,1/3):Math.pow(r,1/3);return[n,n,n]}return 0===a?(i=o.computeRealRoots(t,0,e),0===i.Length?[0]:[i[0],0,i[1]]):u(t,0,e,a)}return 0===e?0===a?(r=-n/t,r<0?[r,0,0]:[0,0,r]):u(t,n,0,a):0===a?(i=o.computeRealRoots(t,n,e),0===i.length?[0]:i[1]<=0?[i[0],i[1],0]:i[0]>=0?[0,i[0],i[1]]:[i[0],0,i[1]]):u(t,n,e,a)};var l=c;const C={};function M(t,n,e,a){const r=t*t,s=n-3*r/8,c=e-n*t/2+r*t/8,u=a-e*t/4+n*r/16-3*r*r/256,C=l.computeRealRoots(1,2*s,s*s-4*u,-c*c);if(C.length>0){const n=-t/4,e=C[C.length-1];if(Math.abs(e)<i.CesiumMath.EPSILON14){const t=o.computeRealRoots(1,s,u);if(2===t.length){const e=t[0],a=t[1];let i;if(e>=0&&a>=0){const t=Math.sqrt(e),i=Math.sqrt(a);return[n-i,n-t,n+t,n+i]}if(e>=0&&a<0)return i=Math.sqrt(e),[n-i,n+i];if(e<0&&a>=0)return i=Math.sqrt(a),[n-i,n+i]}return[]}if(e>0){const t=Math.sqrt(e),a=(s+e-c/t)/2,i=(s+e+c/t)/2,r=o.computeRealRoots(1,t,a),u=o.computeRealRoots(1,-t,i);return 0!==r.length?(r[0]+=n,r[1]+=n,0!==u.length?(u[0]+=n,u[1]+=n,r[1]<=u[0]?[r[0],r[1],u[0],u[1]]:u[1]<=r[0]?[u[0],u[1],r[0],r[1]]:r[0]>=u[0]&&r[1]<=u[1]?[u[0],r[0],r[1],u[1]]:u[0]>=r[0]&&u[1]<=r[1]?[r[0],u[0],u[1],r[1]]:r[0]>u[0]&&r[0]<u[1]?[u[0],r[0],u[1],r[1]]:[r[0],u[0],r[1],u[1]]):r):0!==u.length?(u[0]+=n,u[1]+=n,u):[]}}return[]}function h(t,n,e,a){const r=t*t,s=-2*n,c=e*t+n*n-4*a,u=r*a-e*n*t+e*e,C=l.computeRealRoots(1,s,c,u);if(C.length>0){const s=C[0],c=n-s,u=c*c,l=t/2,M=c/2,h=u-4*a,f=u+4*Math.abs(a),m=r-4*s,d=r+4*Math.abs(s);let g,p,w,R,S,O;if(s<0||h*d<m*f){const n=Math.sqrt(m);g=n/2,p=0===n?0:(t*M-e)/n}else{const n=Math.sqrt(h);g=0===n?0:(t*M-e)/n,p=n/2}0===l&&0===g?(w=0,R=0):i.CesiumMath.sign(l)===i.CesiumMath.sign(g)?(w=l+g,R=s/w):(R=l-g,w=s/R),0===M&&0===p?(S=0,O=0):i.CesiumMath.sign(M)===i.CesiumMath.sign(p)?(S=M+p,O=a/S):(O=M-p,S=a/O);const x=o.computeRealRoots(1,w,S),y=o.computeRealRoots(1,R,O);if(0!==x.length)return 0!==y.length?x[1]<=y[0]?[x[0],x[1],y[0],y[1]]:y[1]<=x[0]?[y[0],y[1],x[0],x[1]]:x[0]>=y[0]&&x[1]<=y[1]?[y[0],x[0],x[1],y[1]]:y[0]>=x[0]&&y[1]<=x[1]?[x[0],y[0],y[1],x[1]]:x[0]>y[0]&&x[0]<y[1]?[y[0],x[0],y[1],x[1]]:[x[0],y[0],x[1],y[1]]:x;if(0!==y.length)return y}return[]}C.computeDiscriminant=function(t,n,e,a,i){const r=t*t,s=n*n,o=s*n,c=e*e,u=c*e,l=a*a,C=l*a,M=i*i;return s*c*l-4*o*C-4*t*u*l+18*t*n*e*C-27*r*l*l+256*(r*t)*(M*i)+i*(18*o*e*a-4*s*u+16*t*c*c-80*t*n*c*a-6*t*s*l+144*r*e*l)+M*(144*t*s*e-27*s*s-128*r*c-192*r*n*a)},C.computeRealRoots=function(t,n,e,a,r){if(Math.abs(t)<i.CesiumMath.EPSILON15)return l.computeRealRoots(n,e,a,r);const s=n/t,o=e/t,c=a/t,u=r/t;let C=s<0?1:0;switch(C+=o<0?C+1:C,C+=c<0?C+1:C,C+=u<0?C+1:C,C){case 0:case 3:case 4:case 6:case 7:case 9:case 10:case 12:case 13:case 14:case 15:return M(s,o,c,u);case 1:case 2:case 5:case 8:case 11:return h(s,o,c,u);default:return}};var f=C;function m(t,a){a=n.Cartesian3.clone(e.defaultValue(a,n.Cartesian3.ZERO)),n.Cartesian3.equals(a,n.Cartesian3.ZERO)||n.Cartesian3.normalize(a,a),this.origin=n.Cartesian3.clone(e.defaultValue(t,n.Cartesian3.ZERO)),this.direction=a}m.clone=function(t,a){if(e.defined(t))return e.defined(a)?(a.origin=n.Cartesian3.clone(t.origin),a.direction=n.Cartesian3.clone(t.direction),a):new m(t.origin,t.direction)},m.getPoint=function(t,a,i){return e.defined(i)||(i=new n.Cartesian3),i=n.Cartesian3.multiplyByScalar(t.direction,a,i),n.Cartesian3.add(t.origin,i,i)};const d={rayPlane:function(t,a,r){e.defined(r)||(r=new n.Cartesian3);const s=t.origin,o=t.direction,c=a.normal,u=n.Cartesian3.dot(c,o);if(Math.abs(u)<i.CesiumMath.EPSILON15)return;const l=(-a.distance-n.Cartesian3.dot(c,s))/u;return l<0?void 0:(r=n.Cartesian3.multiplyByScalar(o,l,r),n.Cartesian3.add(s,r,r))}},g=new n.Cartesian3,p=new n.Cartesian3,w=new n.Cartesian3,R=new n.Cartesian3,S=new n.Cartesian3;d.rayTriangleParametric=function(t,a,r,s,o){o=e.defaultValue(o,!1);const c=t.origin,u=t.direction,l=n.Cartesian3.subtract(r,a,g),C=n.Cartesian3.subtract(s,a,p),M=n.Cartesian3.cross(u,C,w),h=n.Cartesian3.dot(l,M);let f,m,d,O,x;if(o){if(h<i.CesiumMath.EPSILON6)return;if(f=n.Cartesian3.subtract(c,a,R),d=n.Cartesian3.dot(f,M),d<0||d>h)return;if(m=n.Cartesian3.cross(f,l,S),O=n.Cartesian3.dot(u,m),O<0||d+O>h)return;x=n.Cartesian3.dot(C,m)/h}else{if(Math.abs(h)<i.CesiumMath.EPSILON6)return;const t=1/h;if(f=n.Cartesian3.subtract(c,a,R),d=n.Cartesian3.dot(f,M)*t,d<0||d>1)return;if(m=n.Cartesian3.cross(f,l,S),O=n.Cartesian3.dot(u,m)*t,O<0||d+O>1)return;x=n.Cartesian3.dot(C,m)*t}return x},d.rayTriangle=function(t,a,i,r,s,o){const c=d.rayTriangleParametric(t,a,i,r,s);if(e.defined(c)&&!(c<0))return e.defined(o)||(o=new n.Cartesian3),n.Cartesian3.multiplyByScalar(t.direction,c,o),n.Cartesian3.add(t.origin,o,o)};const O=new m;d.lineSegmentTriangle=function(t,a,i,r,s,o,c){const u=O;n.Cartesian3.clone(t,u.origin),n.Cartesian3.subtract(a,t,u.direction),n.Cartesian3.normalize(u.direction,u.direction);const l=d.rayTriangleParametric(u,i,r,s,o);if(!(!e.defined(l)||l<0||l>n.Cartesian3.distance(t,a)))return e.defined(c)||(c=new n.Cartesian3),n.Cartesian3.multiplyByScalar(u.direction,l,c),n.Cartesian3.add(u.origin,c,c)};const x={root0:0,root1:0};function y(t,i,r){e.defined(r)||(r=new a.Interval);const s=t.origin,o=t.direction,c=i.center,u=i.radius*i.radius,l=n.Cartesian3.subtract(s,c,w),C=function(t,n,e,a){const i=n*n-4*t*e;if(i<0)return;if(i>0){const e=1/(2*t),r=Math.sqrt(i),s=(-n+r)*e,o=(-n-r)*e;return s<o?(a.root0=s,a.root1=o):(a.root0=o,a.root1=s),a}const r=-n/(2*t);return 0!==r?(a.root0=a.root1=r,a):void 0}(n.Cartesian3.dot(o,o),2*n.Cartesian3.dot(o,l),n.Cartesian3.magnitudeSquared(l)-u,x);if(e.defined(C))return r.start=C.root0,r.stop=C.root1,r}d.raySphere=function(t,n,a){if(a=y(t,n,a),e.defined(a)&&!(a.stop<0))return a.start=Math.max(a.start,0),a};const P=new m;d.lineSegmentSphere=function(t,a,i,r){const s=P;n.Cartesian3.clone(t,s.origin);const o=n.Cartesian3.subtract(a,t,s.direction),c=n.Cartesian3.magnitude(o);if(n.Cartesian3.normalize(o,o),r=y(s,i,r),!(!e.defined(r)||r.stop<0||r.start>c))return r.start=Math.max(r.start,0),r.stop=Math.min(r.stop,c),r};const N=new n.Cartesian3,b=new n.Cartesian3;function q(t,n,e){const a=t+n;return i.CesiumMath.sign(t)!==i.CesiumMath.sign(n)&&Math.abs(a/Math.max(Math.abs(t),Math.abs(n)))<e?0:a}d.rayEllipsoid=function(t,e){const i=e.oneOverRadii,r=n.Cartesian3.multiplyComponents(i,t.origin,N),s=n.Cartesian3.multiplyComponents(i,t.direction,b),o=n.Cartesian3.magnitudeSquared(r),c=n.Cartesian3.dot(r,s);let u,l,C,M,h;if(o>1){if(c>=0)return;const t=c*c;if(u=o-1,l=n.Cartesian3.magnitudeSquared(s),C=l*u,t<C)return;if(t>C){M=c*c-C,h=-c+Math.sqrt(M);const t=h/l,n=u/h;return t<n?new a.Interval(t,n):{start:n,stop:t}}const e=Math.sqrt(u/l);return new a.Interval(e,e)}return o<1?(u=o-1,l=n.Cartesian3.magnitudeSquared(s),C=l*u,M=c*c-C,h=-c+Math.sqrt(M),new a.Interval(0,h/l)):c<0?(l=n.Cartesian3.magnitudeSquared(s),new a.Interval(0,-c/l)):void 0};const L=new n.Cartesian3,I=new n.Cartesian3,E=new n.Cartesian3,v=new n.Cartesian3,z=new n.Cartesian3,T=new n.Matrix3,U=new n.Matrix3,W=new n.Matrix3,B=new n.Matrix3,V=new n.Matrix3,Z=new n.Matrix3,D=new n.Matrix3,A=new n.Cartesian3,F=new n.Cartesian3,G=new n.Cartographic;d.grazingAltitudeLocation=function(t,a){const r=t.origin,s=t.direction;if(!n.Cartesian3.equals(r,n.Cartesian3.ZERO)){const t=a.geodeticSurfaceNormal(r,L);if(n.Cartesian3.dot(s,t)>=0)return r}const c=e.defined(this.rayEllipsoid(t,a)),u=a.transformPositionToScaledSpace(s,L),l=n.Cartesian3.normalize(u,u),C=n.Cartesian3.mostOrthogonalAxis(u,v),M=n.Cartesian3.normalize(n.Cartesian3.cross(C,l,I),I),h=n.Cartesian3.normalize(n.Cartesian3.cross(l,M,E),E),m=T;m[0]=l.x,m[1]=l.y,m[2]=l.z,m[3]=M.x,m[4]=M.y,m[5]=M.z,m[6]=h.x,m[7]=h.y,m[8]=h.z;const d=n.Matrix3.transpose(m,U),g=n.Matrix3.fromScale(a.radii,W),p=n.Matrix3.fromScale(a.oneOverRadii,B),w=V;w[0]=0,w[1]=-s.z,w[2]=s.y,w[3]=s.z,w[4]=0,w[5]=-s.x,w[6]=-s.y,w[7]=s.x,w[8]=0;const R=n.Matrix3.multiply(n.Matrix3.multiply(d,p,Z),w,Z),S=n.Matrix3.multiply(n.Matrix3.multiply(R,g,D),m,D),O=n.Matrix3.multiplyByVector(R,r,z),x=function(t,e,a,r,s){const c=r*r,u=s*s,l=(t[n.Matrix3.COLUMN1ROW1]-t[n.Matrix3.COLUMN2ROW2])*u,C=s*(r*q(t[n.Matrix3.COLUMN1ROW0],t[n.Matrix3.COLUMN0ROW1],i.CesiumMath.EPSILON15)+e.y),M=t[n.Matrix3.COLUMN0ROW0]*c+t[n.Matrix3.COLUMN2ROW2]*u+r*e.x+a,h=u*q(t[n.Matrix3.COLUMN2ROW1],t[n.Matrix3.COLUMN1ROW2],i.CesiumMath.EPSILON15),m=s*(r*q(t[n.Matrix3.COLUMN2ROW0],t[n.Matrix3.COLUMN0ROW2])+e.z);let d;const g=[];if(0===m&&0===h){if(d=o.computeRealRoots(l,C,M),0===d.length)return g;const t=d[0],e=Math.sqrt(Math.max(1-t*t,0));if(g.push(new n.Cartesian3(r,s*t,s*-e)),g.push(new n.Cartesian3(r,s*t,s*e)),2===d.length){const t=d[1],e=Math.sqrt(Math.max(1-t*t,0));g.push(new n.Cartesian3(r,s*t,s*-e)),g.push(new n.Cartesian3(r,s*t,s*e))}return g}const p=m*m,w=h*h,R=m*h,S=l*l+w,O=2*(C*l+R),x=2*M*l+C*C-w+p,y=2*(M*C-R),P=M*M-p;if(0===S&&0===O&&0===x&&0===y)return g;d=f.computeRealRoots(S,O,x,y,P);const N=d.length;if(0===N)return g;for(let t=0;t<N;++t){const e=d[t],a=e*e,o=Math.max(1-a,0),c=Math.sqrt(o);let u;u=i.CesiumMath.sign(l)===i.CesiumMath.sign(M)?q(l*a+M,C*e,i.CesiumMath.EPSILON12):i.CesiumMath.sign(M)===i.CesiumMath.sign(C*e)?q(l*a,C*e+M,i.CesiumMath.EPSILON12):q(l*a+C*e,M,i.CesiumMath.EPSILON12);const f=u*q(h*e,m,i.CesiumMath.EPSILON15);f<0?g.push(new n.Cartesian3(r,s*e,s*c)):f>0?g.push(new n.Cartesian3(r,s*e,s*-c)):0!==c?(g.push(new n.Cartesian3(r,s*e,s*-c)),g.push(new n.Cartesian3(r,s*e,s*c)),++t):g.push(new n.Cartesian3(r,s*e,s*c))}return g}(S,n.Cartesian3.negate(O,L),0,0,1);let y,P;const N=x.length;if(N>0){let t=n.Cartesian3.clone(n.Cartesian3.ZERO,F),e=Number.NEGATIVE_INFINITY;for(let a=0;a<N;++a){y=n.Matrix3.multiplyByVector(g,n.Matrix3.multiplyByVector(m,x[a],A),A);const i=n.Cartesian3.normalize(n.Cartesian3.subtract(y,r,v),v),o=n.Cartesian3.dot(i,s);o>e&&(e=o,t=n.Cartesian3.clone(y,t))}const o=a.cartesianToCartographic(t,G);return e=i.CesiumMath.clamp(e,0,1),P=n.Cartesian3.magnitude(n.Cartesian3.subtract(t,r,v))*Math.sqrt(1-e*e),P=c?-P:P,o.height=P,a.cartographicToCartesian(o,new n.Cartesian3)}};const Y=new n.Cartesian3;d.lineSegmentPlane=function(t,a,r,s){e.defined(s)||(s=new n.Cartesian3);const o=n.Cartesian3.subtract(a,t,Y),c=r.normal,u=n.Cartesian3.dot(c,o);if(Math.abs(u)<i.CesiumMath.EPSILON6)return;const l=n.Cartesian3.dot(c,t),C=-(r.distance+l)/u;return C<0||C>1?void 0:(n.Cartesian3.multiplyByScalar(o,C,s),n.Cartesian3.add(t,s,s),s)},d.trianglePlaneIntersection=function(t,e,a,i){const r=i.normal,s=i.distance,o=n.Cartesian3.dot(r,t)+s<0,c=n.Cartesian3.dot(r,e)+s<0,u=n.Cartesian3.dot(r,a)+s<0;let l,C,M=0;if(M+=o?1:0,M+=c?1:0,M+=u?1:0,1!==M&&2!==M||(l=new n.Cartesian3,C=new n.Cartesian3),1===M){if(o)return d.lineSegmentPlane(t,e,i,l),d.lineSegmentPlane(t,a,i,C),{positions:[t,e,a,l,C],indices:[0,3,4,1,2,4,1,4,3]};if(c)return d.lineSegmentPlane(e,a,i,l),d.lineSegmentPlane(e,t,i,C),{positions:[t,e,a,l,C],indices:[1,3,4,2,0,4,2,4,3]};if(u)return d.lineSegmentPlane(a,t,i,l),d.lineSegmentPlane(a,e,i,C),{positions:[t,e,a,l,C],indices:[2,3,4,0,1,4,0,4,3]}}else if(2===M){if(!o)return d.lineSegmentPlane(e,t,i,l),d.lineSegmentPlane(a,t,i,C),{positions:[t,e,a,l,C],indices:[1,2,4,1,4,3,0,3,4]};if(!c)return d.lineSegmentPlane(a,e,i,l),d.lineSegmentPlane(t,e,i,C),{positions:[t,e,a,l,C],indices:[2,0,4,2,4,3,1,3,4]};if(!u)return d.lineSegmentPlane(t,a,i,l),d.lineSegmentPlane(e,a,i,C),{positions:[t,e,a,l,C],indices:[0,1,4,0,4,3,2,3,4]}}};var _=d;t.IntersectionTests=_,t.Ray=m}));
