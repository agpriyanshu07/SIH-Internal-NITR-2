const v0=Math.PI,E0=v0*2,C2=v0/180,U3=1440,D3=398600.8,G0=6378.135,Z0=60/Math.sqrt(G0*G0*G0/D3),T2=G0*Z0/60,B3=1/Z0,k0=.001082616,M3=-253881e-11,s3=-165597e-11,$0=M3/k0,c2=2/3,N2=1440/(2*v0);function Q2(S,O){const o=[31,S%4===0?29:28,31,30,31,30,31,31,30,31,30,31],t=Math.floor(O);let D=1,B=0;for(;t>B+o[D-1]&&D<12;)B+=o[D-1],D+=1;const s=D,i=t-B;let M=(O-t)*24;const c=Math.floor(M);M=(M-c)*60;const E=Math.floor(M),U=(M-E)*60;return{mon:s,day:i,hr:c,minute:E,sec:U}}function H2(S,O,o,t,D,B,s=0){return 367*S-Math.floor(7*(S+Math.floor((O+9)/12))*.25)+Math.floor(275*O/9)+o+17210135e-1+((s/6e4+B/60+D)/60+t)/24}function P2(S,O,o,t,D,B,s=0){if(S instanceof Date){const i=S;return H2(i.getUTCFullYear(),i.getUTCMonth()+1,i.getUTCDate(),i.getUTCHours(),i.getUTCMinutes(),i.getUTCSeconds(),i.getUTCMilliseconds())}return H2(S,O,o,t,D,B,s)}function E3(S,O){const o=S-24150195e-1,t=o/365.25;let D=1900+Math.floor(t),B=Math.floor((D-1901)*.25),s=o-((D-1900)*365+B)+1e-11;s<1&&(D-=1,B=Math.floor((D-1901)*.25),s=o-((D-1900)*365+B));const i=Q2(D,s),{mon:M,day:c,hr:E,minute:U}=i,e=i.sec-864e-9;return new Date(Date.UTC(D,M-1,c,E,U,Math.floor(e)))}function b2(S,O){const{e3:o,ee2:t,peo:D,pgho:B,pho:s,pinco:i,plo:M,se2:c,se3:E,sgh2:U,sgh3:e,sgh4:d,sh2:R,sh3:m,si2:T,si3:x,sl2:y,sl3:N,sl4:G,t:a,xgh2:C,xgh3:I,xgh4:u,xh2:P,xh3:g,xi2:z,xi3:h,xl2:k,xl3:v,xl4:$,zmol:p,zmos:B0}=S,{init:W,opsmode:j}=O;let{ep:e0,inclp:n0,nodep:V,argpp:S0,mp:Q}=O,l,A,t0,w,a0,b,p0,o0,U0,F,Y,D0,K,L,X,f,H,q,O0,Z,_;const d0=119459e-10,c0=.01675,C0=.00015835218,M0=.0549;_=B0+d0*a,W==="y"&&(_=B0),Z=_+2*c0*Math.sin(_),H=Math.sin(Z),F=.5*H*H-.25,Y=-.5*H*Math.cos(Z);const R0=c*F+E*Y,g0=T*F+x*Y,n=y*F+N*Y+G*H,m0=U*F+e*Y+d*H,I0=R*F+m*Y;_=p+C0*a,W==="y"&&(_=p),Z=_+2*M0*Math.sin(_),H=Math.sin(Z),F=.5*H*H-.25,Y=-.5*H*Math.cos(Z);const P0=t*F+o*Y,z0=z*F+h*Y,y0=k*F+v*Y+$*H,i0=C*F+I*Y+u*H,X0=P*F+g*Y;return D0=R0+P0,X=g0+z0,f=n+y0,K=m0+i0,L=I0+X0,W==="n"&&(D0-=D,X-=i,f-=M,K-=B,L-=s,n0+=X,e0+=D0,w=Math.sin(n0),t0=Math.cos(n0),n0>=.2?(L/=w,K-=t0*L,S0+=K,V+=L,Q+=f):(b=Math.sin(V),a0=Math.cos(V),l=w*b,A=w*a0,p0=L*a0+X*t0*b,o0=-L*b+X*t0*a0,l+=p0,A+=o0,V%=E0,V<0&&j==="a"&&(V+=E0),q=Q+S0+t0*V,U0=f+K-X*V*w,q+=U0,O0=V,V=Math.atan2(l,A),V<0&&j==="a"&&(V+=E0),Math.abs(O0-V)>v0&&(V<O0?V+=E0:V-=E0),Q+=f,S0=q-Q-t0*V)),{ep:e0,inclp:n0,nodep:V,argpp:S0,mp:Q}}function e3(S){const{epoch:O,ep:o,argpp:t,tc:D,inclp:B,nodep:s,np:i}=S;let M,c,E,U,e,d,R,m,T,x,y,N,G,a,C,I,u,P,g,z,h,k,v,$,p,B0,W,j,e0,n0,V,S0,Q,l,A,t0,w,a0,b,p0,o0,U0,F,Y,D0,K,L,X,f,H,q,O0,Z,_,d0,c0,C0,M0,R0,g0,n,m0,I0;const P0=.01675,z0=.0549,y0=29864797e-13,i0=47968065e-14,X0=.39785416,K0=.91744867,l0=.1945905,q0=-.98088458,H0=i,r0=o,L0=Math.sin(s),Y0=Math.cos(s),T0=Math.sin(t),F0=Math.cos(t),N0=Math.sin(B),r=Math.cos(B),h0=r0*r0,f0=1-h0,Q0=Math.sqrt(f0),J=0,U2=0,S2=0,D2=0,B2=0,b0=O+18261.5+D/1440,V0=(4.523602-.00092422029*b0)%E0,A0=Math.sin(V0),W0=Math.cos(V0),O2=.91375164-.03568096*W0,t2=Math.sqrt(1-O2*O2),x0=.089683511*A0/t2,u0=Math.sqrt(1-x0*x0),s0=5.8351514+.001944368*b0;let j0=.39785416*A0/t2;const d2=u0*W0+.91744867*x0*A0;j0=Math.atan2(j0,d2),j0+=s0-V0;const I2=Math.cos(j0),A2=Math.sin(j0);z=l0,h=q0,$=K0,p=X0,k=Y0,v=L0,y=y0;const a2=1/H0;let M2=0;for(;M2<2;)M2+=1,M=z*k+h*$*v,E=-h*k+z*$*v,R=-z*v+h*$*k,m=h*p,T=h*v+z*$*k,x=z*p,c=r*R+N0*m,U=r*T+N0*x,e=-N0*R+r*m,d=-N0*T+r*x,N=M*F0+c*T0,G=E*F0+U*T0,a=-M*T0+c*F0,C=-E*T0+U*F0,I=e*T0,u=d*T0,P=e*F0,g=d*F0,n=12*N*N-3*a*a,m0=24*N*G-6*a*C,I0=12*G*G-3*C*C,O0=3*(M*M+c*c)+n*h0,Z=6*(M*E+c*U)+m0*h0,_=3*(E*E+U*U)+I0*h0,d0=-6*M*e+h0*(-24*N*P-6*a*I),c0=-6*(M*d+E*e)+h0*(-24*(G*P+N*g)+-6*(a*u+C*I)),C0=-6*E*d+h0*(-24*G*g-6*C*u),M0=6*c*e+h0*(24*N*I-6*a*P),R0=6*(U*e+c*d)+h0*(24*(G*I+N*u)-6*(C*P+a*g)),g0=6*U*d+h0*(24*G*u-6*C*g),O0=O0+O0+f0*n,Z=Z+Z+f0*m0,_=_+_+f0*I0,L=y*a2,K=-.5*L/Q0,X=L*Q0,D0=-15*r0*X,f=N*a+G*C,H=G*a+N*C,q=G*C-N*a,M2===1&&(B0=D0,W=K,j=L,e0=X,n0=f,V=H,S0=q,Q=O0,l=Z,A=_,t0=d0,w=c0,a0=C0,b=M0,p0=R0,o0=g0,U0=n,F=m0,Y=I0,z=I2,h=A2,$=O2,p=t2,k=u0*Y0+x0*L0,v=L0*u0-Y0*x0,y=i0);const s2=(4.7199672+(.2299715*b0-s0))%E0,m2=(6.2565837+.017201977*b0)%E0,h2=2*B0*V,w0=2*B0*S0,_0=2*W*w,p2=2*W*(a0-t0),r2=-2*j*l,R2=-2*j*(A-Q),f2=-2*j*(-21-9*h0)*P0,o2=2*e0*F,x2=2*e0*(Y-U0),u2=-18*e0*P0,E2=-2*W*p0,i2=-2*W*(o0-b),e2=2*D0*H,g2=2*D0*q,z2=2*K*c0,w2=2*K*(C0-d0),_2=-2*L*Z,k2=-2*L*(_-O0),$2=-2*L*(-21-9*h0)*z0,n3=2*X*m0,S3=2*X*(I0-n),O3=-18*X*z0,t3=-2*K*R0,o3=-2*K*(g0-M0);return{snodm:L0,cnodm:Y0,sinim:N0,cosim:r,sinomm:T0,cosomm:F0,day:b0,e3:g2,ee2:e2,em:r0,emsq:h0,gam:s0,peo:J,pgho:D2,pho:B2,pinco:U2,plo:S2,rtemsq:Q0,se2:h2,se3:w0,sgh2:o2,sgh3:x2,sgh4:u2,sh2:E2,sh3:i2,si2:_0,si3:p2,sl2:r2,sl3:R2,sl4:f2,s1:D0,s2:K,s3:L,s4:X,s5:f,s6:H,s7:q,ss1:B0,ss2:W,ss3:j,ss4:e0,ss5:n0,ss6:V,ss7:S0,sz1:Q,sz2:l,sz3:A,sz11:t0,sz12:w,sz13:a0,sz21:b,sz22:p0,sz23:o0,sz31:U0,sz32:F,sz33:Y,xgh2:n3,xgh3:S3,xgh4:O3,xh2:t3,xh3:o3,xi2:z2,xi3:w2,xl2:_2,xl3:k2,xl4:$2,nm:H0,z1:O0,z2:Z,z3:_,z11:d0,z12:c0,z13:C0,z21:M0,z22:R0,z23:g0,z31:n,z32:m0,z33:I0,zmol:s2,zmos:m2}}function C3(S){const{cosim:O,argpo:o,s1:t,s2:D,s3:B,s4:s,s5:i,sinim:M,ss1:c,ss2:E,ss3:U,ss4:e,ss5:d,sz1:R,sz3:m,sz11:T,sz13:x,sz21:y,sz23:N,sz31:G,sz33:a,t:C,tc:I,gsto:u,mo:P,mdot:g,no:z,nodeo:h,nodedot:k,xpidot:v,z1:$,z3:p,z11:B0,z13:W,z21:j,z23:e0,z31:n0,z33:V,ecco:S0,eccsq:Q}=S;let{emsq:l,em:A,argpm:t0,inclm:w,mm:a0,nm:b,nodem:p0,irez:o0,atime:U0,d2201:F,d2211:Y,d3210:D0,d3222:K,d4410:L,d4422:X,d5220:f,d5232:H,d5421:q,d5433:O0,dedt:Z,didt:_,dmdt:d0,dnodt:c0,domdt:C0,del1:M0,del2:R0,del3:g0,xfact:n,xlamo:m0,xli:I0,xni:P0}=S,z0,y0,i0,X0,K0,l0,q0,H0,r0,L0,Y0,T0,F0,N0,r,h0,f0,Q0,J,U2,S2,D2,B2,b0,V0,A0,W0,O2,t2,x0,u0,s0;const j0=17891679e-13,d2=21460748e-13,I2=22123015e-14,A2=17891679e-13,a2=73636953e-16,M2=21765803e-16,s2=.0043752690880113,m2=37393792e-14,h2=11428639e-14,w0=.00015835218,_0=119459e-10;o0=0,b<.0052359877&&b>.0034906585&&(o0=1),b>=.00826&&b<=.00924&&A>=.5&&(o0=2);const p2=c*_0*d,r2=E*_0*(T+x),R2=-_0*U*(R+m-14-6*l),f2=e*_0*(G+a-6);let o2=-_0*E*(y+N);(w<.052359877||w>v0-.052359877)&&(o2=0),M!==0&&(o2/=M);const x2=f2-O*o2;Z=p2+t*w0*i,_=r2+D*w0*(B0+W),d0=R2-w0*B*($+p-14-6*l);const u2=s*w0*(n0+V-6);let E2=-w0*D*(j+e0);(w<.052359877||w>v0-.052359877)&&(E2=0),C0=x2+u2,c0=o2,M!==0&&(C0-=O/M*E2,c0+=E2/M);const i2=0,e2=(u+I*s2)%E0;if(A+=Z*C,w+=_*C,t0+=C0*C,p0+=c0*C,a0+=d0*C,o0!==0){if(x0=(b/Z0)**c2,o0===2){u0=O*O;const g2=A;A=S0;const z2=l;l=Q,s0=A*l,N0=-.306-(A-.64)*.44,A<=.65?(r=3.616-13.247*A+16.29*l,f0=-19.302+117.39*A-228.419*l+156.591*s0,Q0=-18.9068+109.7927*A-214.6334*l+146.5816*s0,J=-41.122+242.694*A-471.094*l+313.953*s0,U2=-146.407+841.88*A-1629.014*l+1083.435*s0,S2=-532.114+3017.977*A-5740.032*l+3708.276*s0):(r=-72.099+331.819*A-508.738*l+266.724*s0,f0=-346.844+1582.851*A-2415.925*l+1246.113*s0,Q0=-342.585+1554.908*A-2366.899*l+1215.972*s0,J=-1052.797+4758.686*A-7193.992*l+3651.957*s0,U2=-3581.69+16178.11*A-24462.77*l+12422.52*s0,A>.715?S2=-5149.66+29936.92*A-54087.36*l+31324.56*s0:S2=1464.74-4664.75*A+3763.64*l),A<.7?(b0=-919.2277+4988.61*A-9064.77*l+5542.21*s0,D2=-822.71072+4568.6173*A-8491.4146*l+5337.524*s0,B2=-853.666+4690.25*A-8624.77*l+5341.4*s0):(b0=-37995.78+161616.52*A-229838.2*l+109377.94*s0,D2=-51752.104+218913.95*A-309468.16*l+146349.42*s0,B2=-40023.88+170470.89*A-242699.48*l+115605.82*s0),V0=M*M,z0=.75*(1+2*O+u0),y0=1.5*V0,X0=1.875*M*(1-2*O-3*u0),K0=-1.875*M*(1+2*O-3*u0),q0=35*V0*z0,H0=39.375*V0*V0,r0=9.84375*M*(V0*(1-2*O-5*u0)+.33333333*(-2+4*O+6*u0)),L0=M*(4.92187512*V0*(-2-4*O+10*u0)+6.56250012*(1+2*O-3*u0)),Y0=29.53125*M*(2-8*O+u0*(-12+8*O+10*u0)),T0=29.53125*M*(-2-8*O+u0*(12+8*O-10*u0)),O2=b*b,t2=x0*x0,W0=3*O2*t2,A0=W0*A2,F=A0*z0*N0,Y=A0*y0*r,W0*=x0,A0=W0*m2,D0=A0*X0*f0,K=A0*K0*Q0,W0*=x0,A0=2*W0*a2,L=A0*q0*J,X=A0*H0*U2,W0*=x0,A0=W0*h2,f=A0*r0*S2,H=A0*L0*B2,A0=2*W0*M2,q=A0*Y0*D2,O0=A0*T0*b0,m0=(P+h+h-(e2+e2))%E0,n=g+d0+2*(k+c0-s2)-z,A=g2,l=z2}o0===1&&(F0=1+l*(-2.5+.8125*l),f0=1+2*l,h0=1+l*(-6+6.60937*l),z0=.75*(1+O)*(1+O),i0=.9375*M*M*(1+3*O)-.75*(1+O),l0=1+O,l0=1.875*l0*l0*l0,M0=3*b*b*x0*x0,R0=2*M0*z0*F0*j0,g0=3*M0*l0*h0*I2*x0,M0=M0*i0*f0*d2*x0,m0=(P+h+o-e2)%E0,n=g+v+d0+C0+c0-(z+s2)),I0=m0,P0=z,U0=0,b=z+i2}return{em:A,argpm:t0,inclm:w,mm:a0,nm:b,nodem:p0,irez:o0,atime:U0,d2201:F,d2211:Y,d3210:D0,d3222:K,d4410:L,d4422:X,d5220:f,d5232:H,d5421:q,d5433:O0,dedt:Z,didt:_,dmdt:d0,dndt:i2,dnodt:c0,domdt:C0,del1:M0,del2:R0,del3:g0,xfact:n,xlamo:m0,xli:I0,xni:P0}}function W2(S){const O=(S-2451545)/36525;let o=-62e-7*O*O*O+.093104*O*O+(876600*3600+8640184812866e-6)*O+67310.54841;return o=o*C2/240%E0,o<0&&(o+=E0),o}function c3(S,O,o,t,D,B,s){return S instanceof Date?W2(P2(S)):W2(S)}function i3(S){const{ecco:O,epoch:o,inclo:t,opsmode:D}=S;let{no:B}=S;const s=O*O,i=1-s,M=Math.sqrt(i),c=Math.cos(t),E=c*c,U=(Z0/B)**c2,e=.75*k0*(3*E-1)/(M*i);let d=e/(U*U);const R=U*(1-d*d-d*(1/3+134*d*d/81));d=e/(R*R),B/=1+d;const m=(Z0/B)**c2,T=Math.sin(t),x=m*i,y=1-5*E,N=-y-E-E,G=1/m,a=x*x,C=m*(1-O),I="n";let u;if(D==="a"){const P=o-7305,g=Math.floor(P+1e-8),z=P-g,h=.017202791694070362,k=1.7321343856509375,v=5075514194322695e-30,$=h+E0;u=(k+h*g+$*z+P*P*v)%E0,u<0&&(u+=E0)}else u=c3(o+24332815e-1);return{no:B,method:I,ainv:G,ao:m,con41:N,con42:y,cosio:c,cosio2:E,eccsq:s,omeosq:i,posq:a,rp:C,rteosq:M,sinio:T,gsto:u}}function l3(S){const{irez:O,d2201:o,d2211:t,d3210:D,d3222:B,d4410:s,d4422:i,d5220:M,d5232:c,d5421:E,d5433:U,dedt:e,del1:d,del2:R,del3:m,didt:T,dmdt:x,dnodt:y,domdt:N,argpo:G,argpdot:a,t:C,tc:I,gsto:u,xfact:P,xlamo:g,no:z}=S;let{atime:h,em:k,argpm:v,inclm:$,xli:p,mm:B0,xni:W,nodem:j,nm:e0}=S;const n0=.13130908,V=2.8843198,S0=.37448087,Q=5.7686396,l=.95240898,A=1.8014998,t0=1.050833,w=4.4108898,a0=.0043752690880113,b=720,p0=-720,o0=259200;let U0,F,Y,D0,K,L,X,f,H=0,q=0;const O0=(u+I*a0)%E0;if(k+=e*C,$+=T*C,v+=N*C,j+=y*C,B0+=x*C,O!==0){(h===0||C*h<=0||Math.abs(C)<Math.abs(h))&&(h=0,W=z,p=g),C>0?U0=b:U0=p0;let Z=381;for(;Z===381;)O!==2?(X=d*Math.sin(p-n0)+R*Math.sin(2*(p-V))+m*Math.sin(3*(p-S0)),K=W+P,L=d*Math.cos(p-n0)+2*R*Math.cos(2*(p-V))+3*m*Math.cos(3*(p-S0)),L*=K):(f=G+a*h,Y=f+f,F=p+p,X=o*Math.sin(Y+p-Q)+t*Math.sin(p-Q)+D*Math.sin(f+p-l)+B*Math.sin(-f+p-l)+s*Math.sin(Y+F-A)+i*Math.sin(F-A)+M*Math.sin(f+p-t0)+c*Math.sin(-f+p-t0)+E*Math.sin(f+F-w)+U*Math.sin(-f+F-w),K=W+P,L=o*Math.cos(Y+p-Q)+t*Math.cos(p-Q)+D*Math.cos(f+p-l)+B*Math.cos(-f+p-l)+M*Math.cos(f+p-t0)+c*Math.cos(-f+p-t0)+2*(s*Math.cos(Y+F-A)+i*Math.cos(F-A)+E*Math.cos(f+F-w)+U*Math.cos(-f+F-w)),L*=K),Math.abs(C-h)>=b?Z=381:(q=C-h,Z=0),Z===381&&(p+=K*U0+X*o0,W+=X*U0+L*o0,h+=U0);e0=W+X*q+L*q*q*.5,D0=p+K*q+X*q*q*.5,O!==1?(B0=D0-2*j+2*O0,H=e0-z):(B0=D0-j-v+O0,H=e0-z),e0=z+H}return{atime:h,em:k,argpm:v,inclm:$,xli:p,mm:B0,xni:W,nodem:j,dndt:H,nm:e0}}var J0;(function(S){S[S.None=0]="None",S[S.MeanEccentricityOutOfRange=1]="MeanEccentricityOutOfRange",S[S.MeanMotionBelowZero=2]="MeanMotionBelowZero",S[S.PerturbedEccentricityOutOfRange=3]="PerturbedEccentricityOutOfRange",S[S.SemiLatusRectumBelowZero=4]="SemiLatusRectumBelowZero",S[S.Decayed=6]="Decayed"})(J0||(J0={}));function Z2(S,O){let o,t,D,B,s,i,M,c,E,U,e,d,R,m,T,x,y,N,G,a,C,I,u,P,g,z,h;S.t=O,S.error=J0.None;const v=S.mo+S.mdot*S.t,$=S.argpo+S.argpdot*S.t,p=S.nodeo+S.nodedot*S.t;E=$,C=v;const B0=S.t*S.t;if(u=p+S.nodecf*B0,y=1-S.cc1*S.t,N=S.bstar*S.cc4*S.t,G=S.t2cof*B0,S.isimp!==1){M=S.omgcof*S.t;const r0=1+S.eta*Math.cos(v);i=S.xmcof*(r0*r0*r0-S.delmo),x=M+i,C=v+x,E=$-x,d=B0*S.t,R=d*S.t,y=y-S.d2*B0-S.d3*d-S.d4*R,N+=S.bstar*S.cc5*(Math.sin(C)-S.sinmao),G=G+S.t3cof*d+R*(S.t4cof+S.t*S.t5cof)}S.tempa=y,I=S.no;let W=S.ecco;if(a=S.inclo,S.method==="d"){m=S.t;const r0={irez:S.irez,d2201:S.d2201,d2211:S.d2211,d3210:S.d3210,d3222:S.d3222,d4410:S.d4410,d4422:S.d4422,d5220:S.d5220,d5232:S.d5232,d5421:S.d5421,d5433:S.d5433,dedt:S.dedt,del1:S.del1,del2:S.del2,del3:S.del3,didt:S.didt,dmdt:S.dmdt,dnodt:S.dnodt,domdt:S.domdt,argpo:S.argpo,argpdot:S.argpdot,t:S.t,tc:m,gsto:S.gsto,xfact:S.xfact,xlamo:S.xlamo,no:S.no,atime:S.atime,em:W,argpm:E,inclm:a,xli:S.xli,mm:C,xni:S.xni,nodem:u,nm:I};({em:W,argpm:E,inclm:a,mm:C,nodem:u,nm:I}=l3(r0))}if(I<=0)return S.error=J0.MeanMotionBelowZero,null;const j=(Z0/I)**c2*y*y;if(I=Z0/j**1.5,W-=N,W>=1||W<-.001)return S.error=J0.MeanEccentricityOutOfRange,null;W<1e-6&&(W=1e-6),C+=S.no*G,g=C+E+u,u%=E0,E%=E0,g%=E0,C=(g-E-u)%E0;const e0={am:j,em:W,im:a,Om:u,om:E,mm:C,nm:I},n0=Math.sin(a),V=Math.cos(a);let S0=W;if(P=a,U=E,h=u,z=C,B=n0,D=V,S.method==="d"){const r0={inclo:S.inclo,init:"n",ep:S0,inclp:P,nodep:h,argpp:U,mp:z,opsmode:S.operationmode},L0=b2(S,r0);if({ep:S0,nodep:h,argpp:U,mp:z}=L0,P=L0.inclp,P<0&&(P=-P,h+=v0,U-=v0),S0<0||S0>1)return S.error=J0.PerturbedEccentricityOutOfRange,null}S.method==="d"&&(B=Math.sin(P),D=Math.cos(P),S.aycof=-.5*$0*B,Math.abs(D+1)>15e-13?S.xlcof=-.25*$0*B*(3+5*D)/(1+D):S.xlcof=-.25*$0*B*(3+5*D)/15e-13);const Q=S0*Math.cos(U);x=1/(j*(1-S0*S0));const l=S0*Math.sin(U)+x*S.aycof,t0=(z+U+h+x*S.xlcof*Q-h)%E0;c=t0,T=9999.9;let w=1;for(;Math.abs(T)>=1e-12&&w<=10;)t=Math.sin(c),o=Math.cos(c),T=1-o*Q-t*l,T=(t0-l*o+Q*t-c)/T,Math.abs(T)>=.95&&(T>0?T=.95:T=-.95),c+=T,w+=1;const a0=Q*o+l*t,b=Q*t-l*o,p0=Q*Q+l*l,o0=j*(1-p0);if(o0<0)return S.error=J0.SemiLatusRectumBelowZero,null;const U0=j*(1-a0),F=Math.sqrt(j)*b/U0,Y=Math.sqrt(o0)/U0,D0=Math.sqrt(1-p0);x=b/(1+D0);const K=j/U0*(t-l-Q*x),L=j/U0*(o-Q+l*x);e=Math.atan2(K,L);const X=(L+L)*K,f=1-2*K*K;x=1/o0;const H=.5*k0*x,q=H*x;S.method==="d"&&(s=D*D,S.con41=3*s-1,S.x1mth2=1-s,S.x7thm1=7*s-1);const O0=U0*(1-1.5*q*D0*S.con41)+.5*H*S.x1mth2*f;if(O0<1)return S.error=J0.Decayed,null;e-=.25*q*S.x7thm1*X;const Z=h+1.5*q*D*X,_=P+1.5*q*D*B*f,d0=F-I*H*S.x1mth2*X/Z0,c0=Y+I*H*(S.x1mth2*f+1.5*S.con41)/Z0,C0=Math.sin(e),M0=Math.cos(e),R0=Math.sin(Z),g0=Math.cos(Z),n=Math.sin(_),m0=Math.cos(_),I0=-R0*m0,P0=g0*m0,z0=I0*C0+g0*M0,y0=P0*C0+R0*M0,i0=n*C0,X0=I0*M0-g0*C0,K0=P0*M0-R0*C0,l0=n*M0,q0={x:O0*z0*G0,y:O0*y0*G0,z:O0*i0*G0},H0={x:(d0*z0+c0*X0)*T2,y:(d0*y0+c0*K0)*T2,z:(d0*i0+c0*l0)*T2};return{position:q0,velocity:H0,meanElements:e0}}function d3(S,O){const{opsmode:o,epoch:t,xbstar:D,xecco:B,xargpo:s,xinclo:i,xmo:M,xno:c,xnodeo:E}=O;let U,e,d,R,m,T,x,y,N,G,a,C,I,u,P,g,z,h,k,v,$,p,B0,W,j,e0,n0,V,S0,Q,l,A,t0,w,a0,b,p0,o0,U0,F,Y,D0,K,L,X,f,H,q,O0,Z,_,d0,c0,C0,M0,R0;const g0=15e-13,n=S;n.isimp=0,n.method="n",n.aycof=0,n.con41=0,n.cc1=0,n.cc4=0,n.cc5=0,n.d2=0,n.d3=0,n.d4=0,n.delmo=0,n.eta=0,n.argpdot=0,n.omgcof=0,n.sinmao=0,n.t=0,n.t2cof=0,n.t3cof=0,n.t4cof=0,n.t5cof=0,n.x1mth2=0,n.x7thm1=0,n.mdot=0,n.nodedot=0,n.xlcof=0,n.xmcof=0,n.nodecf=0,n.irez=0,n.d2201=0,n.d2211=0,n.d3210=0,n.d3222=0,n.d4410=0,n.d4422=0,n.d5220=0,n.d5232=0,n.d5421=0,n.d5433=0,n.dedt=0,n.del1=0,n.del2=0,n.del3=0,n.didt=0,n.dmdt=0,n.dnodt=0,n.domdt=0,n.e3=0,n.ee2=0,n.peo=0,n.pgho=0,n.pho=0,n.pinco=0,n.plo=0,n.se2=0,n.se3=0,n.sgh2=0,n.sgh3=0,n.sgh4=0,n.sh2=0,n.sh3=0,n.si2=0,n.si3=0,n.sl2=0,n.sl3=0,n.sl4=0,n.gsto=0,n.xfact=0,n.xgh2=0,n.xgh3=0,n.xgh4=0,n.xh2=0,n.xh3=0,n.xi2=0,n.xi3=0,n.xl2=0,n.xl3=0,n.xl4=0,n.xlamo=0,n.zmol=0,n.zmos=0,n.atime=0,n.xli=0,n.xni=0,n.bstar=D,n.ecco=B,n.argpo=s,n.inclo=i,n.mo=M,n.no=c,n.nokozai=c,n.nodeo=E,n.operationmode=o;const m0=78/G0+1,I0=42/G0,P0=I0*I0*I0*I0;n.init="y",n.t=0;const z0={ecco:n.ecco,epoch:t,inclo:n.inclo,no:n.no,method:n.method,opsmode:n.operationmode},y0=i3(z0),{ao:i0,con42:X0,cosio:K0,cosio2:l0,eccsq:q0,omeosq:H0,posq:r0,rp:L0,rteosq:Y0,sinio:T0}=y0;if(n.no=y0.no,n.con41=y0.con41,n.gsto=y0.gsto,n.a=(n.no*B3)**(-2/3),n.alta=n.a*(1+n.ecco)-1,n.altp=n.a*(1-n.ecco)-1,n.error=0,H0>=0||n.no>=0){if(n.isimp=0,L0<220/G0+1&&(n.isimp=1),n0=m0,$=P0,h=(L0-1)*G0,h<156){n0=h-78,h<98&&(n0=20);const N0=(120-n0)/G0;$=N0*N0*N0*N0,n0=n0/G0+1}k=1/r0,f=1/(i0-n0),n.eta=i0*n.ecco*f,C=n.eta*n.eta,a=n.ecco*n.eta,v=Math.abs(1-C),T=$*f**4,x=T/v**3.5,R=x*n.no*(i0*(1+1.5*C+a*(4+C))+.375*k0*f/v*n.con41*(8+3*C*(8+C))),n.cc1=n.bstar*R,m=0,n.ecco>1e-4&&(m=-2*T*f*$0*n.no*T0/n.ecco),n.x1mth2=1-l0,n.cc4=2*n.no*x*i0*H0*(n.eta*(2+.5*C)+n.ecco*(.5+2*C)-k0*f/(i0*v)*(-3*n.con41*(1-2*a+C*(1.5-.5*a))+.75*n.x1mth2*(2*C-a*(1+C))*Math.cos(2*n.argpo))),n.cc5=2*x*i0*H0*(1+2.75*(C+a)+a*C),y=l0*l0,K=1.5*k0*k*n.no,L=.5*K*k0*k,X=-.46875*s3*k*k*n.no,n.mdot=n.no+.5*K*Y0*n.con41+.0625*L*Y0*(13-78*l0+137*y),n.argpdot=-.5*K*X0+.0625*L*(7-114*l0+395*y)+X*(3-36*l0+49*y),q=-K*K0,n.nodedot=q+(.5*L*(4-19*l0)+2*X*(3-7*l0))*K0,H=n.argpdot+n.nodedot,n.omgcof=n.bstar*m*Math.cos(n.argpo),n.xmcof=0,n.ecco>1e-4&&(n.xmcof=-c2*T*n.bstar/a),n.nodecf=3.5*H0*q*n.cc1,n.t2cof=1.5*n.cc1,Math.abs(K0+1)>15e-13?n.xlcof=-.25*$0*T0*(3+5*K0)/(1+K0):n.xlcof=-.25*$0*T0*(3+5*K0)/g0,n.aycof=-.5*$0*T0;const F0=1+n.eta*Math.cos(n.mo);if(n.delmo=F0*F0*F0,n.sinmao=Math.sin(n.mo),n.x7thm1=7*l0-1,2*v0/n.no>=225){n.method="d",n.isimp=1,Y=0,P=n.inclo;const N0={epoch:t,ep:n.ecco,argpp:n.argpo,tc:Y,inclp:n.inclo,nodep:n.nodeo,np:n.no,e3:n.e3,ee2:n.ee2,peo:n.peo,pgho:n.pgho,pho:n.pho,pinco:n.pinco,plo:n.plo,se2:n.se2,se3:n.se3,sgh2:n.sgh2,sgh3:n.sgh3,sgh4:n.sgh4,sh2:n.sh2,sh3:n.sh3,si2:n.si2,si3:n.si3,sl2:n.sl2,sl3:n.sl3,sl4:n.sl4,xgh2:n.xgh2,xgh3:n.xgh3,xgh4:n.xgh4,xh2:n.xh2,xh3:n.xh3,xi2:n.xi2,xi3:n.xi3,xl2:n.xl2,xl3:n.xl3,xl4:n.xl4,zmol:n.zmol,zmos:n.zmos},r=e3(N0);n.e3=r.e3,n.ee2=r.ee2,n.peo=r.peo,n.pgho=r.pgho,n.pho=r.pho,n.pinco=r.pinco,n.plo=r.plo,n.se2=r.se2,n.se3=r.se3,n.sgh2=r.sgh2,n.sgh3=r.sgh3,n.sgh4=r.sgh4,n.sh2=r.sh2,n.sh3=r.sh3,n.si2=r.si2,n.si3=r.si3,n.sl2=r.sl2,n.sl3=r.sl3,n.sl4=r.sl4,{sinim:e,cosim:U,em:N,emsq:G,s1:p,s2:B0,s3:W,s4:j,s5:e0,ss1:V,ss2:S0,ss3:Q,ss4:l,ss5:A,sz1:t0,sz3:w,sz11:a0,sz13:b,sz21:p0,sz23:o0,sz31:U0,sz33:F}=r,n.xgh2=r.xgh2,n.xgh3=r.xgh3,n.xgh4=r.xgh4,n.xh2=r.xh2,n.xh3=r.xh3,n.xi2=r.xi2,n.xi3=r.xi3,n.xl2=r.xl2,n.xl3=r.xl3,n.xl4=r.xl4,n.zmol=r.zmol,n.zmos=r.zmos,{nm:z,z1:O0,z3:Z,z11:_,z13:d0,z21:c0,z23:C0,z31:M0,z33:R0}=r;const h0={init:n.init,ep:n.ecco,inclp:n.inclo,nodep:n.nodeo,argpp:n.argpo,mp:n.mo,opsmode:n.operationmode},f0=b2(n,h0);n.ecco=f0.ep,n.inclo=f0.inclp,n.nodeo=f0.nodep,n.argpo=f0.argpp,n.mo=f0.mp,I=0,u=0,g=0;const Q0={cosim:U,emsq:G,argpo:n.argpo,s1:p,s2:B0,s3:W,s4:j,s5:e0,sinim:e,ss1:V,ss2:S0,ss3:Q,ss4:l,ss5:A,sz1:t0,sz3:w,sz11:a0,sz13:b,sz21:p0,sz23:o0,sz31:U0,sz33:F,t:n.t,tc:Y,gsto:n.gsto,mo:n.mo,mdot:n.mdot,no:n.no,nodeo:n.nodeo,nodedot:n.nodedot,xpidot:H,z1:O0,z3:Z,z11:_,z13:d0,z21:c0,z23:C0,z31:M0,z33:R0,ecco:n.ecco,eccsq:q0,em:N,argpm:I,inclm:P,mm:g,nm:z,nodem:u,irez:n.irez,atime:n.atime,d2201:n.d2201,d2211:n.d2211,d3210:n.d3210,d3222:n.d3222,d4410:n.d4410,d4422:n.d4422,d5220:n.d5220,d5232:n.d5232,d5421:n.d5421,d5433:n.d5433,dedt:n.dedt,didt:n.didt,dmdt:n.dmdt,dnodt:n.dnodt,domdt:n.domdt,del1:n.del1,del2:n.del2,del3:n.del3,xfact:n.xfact,xlamo:n.xlamo,xli:n.xli,xni:n.xni},J=C3(Q0);n.irez=J.irez,n.atime=J.atime,n.d2201=J.d2201,n.d2211=J.d2211,n.d3210=J.d3210,n.d3222=J.d3222,n.d4410=J.d4410,n.d4422=J.d4422,n.d5220=J.d5220,n.d5232=J.d5232,n.d5421=J.d5421,n.d5433=J.d5433,n.dedt=J.dedt,n.didt=J.didt,n.dmdt=J.dmdt,n.dnodt=J.dnodt,n.domdt=J.domdt,n.del1=J.del1,n.del2=J.del2,n.del3=J.del3,n.xfact=J.xfact,n.xlamo=J.xlamo,n.xli=J.xli,n.xni=J.xni}n.isimp!==1&&(d=n.cc1*n.cc1,n.d2=4*i0*f*d,D0=n.d2*f*n.cc1/3,n.d3=(17*i0+n0)*D0,n.d4=.5*D0*i0*f*(221*i0+31*n0)*n.cc1,n.t3cof=n.d2+2*d,n.t4cof=.25*(3*n.d3+n.cc1*(12*n.d2+10*d)),n.t5cof=.2*(3*n.d4+12*n.cc1*n.d3+6*n.d2*n.d2+15*d*(2*n.d2+d)))}Z2(n,0),n.init="n"}function I3(S,O){d3(S,{opsmode:O,satn:S.satnum,epoch:S.jdsatepoch-24332815e-1,xbstar:S.bstar,xecco:S.ecco,xargpo:S.argpo,xinclo:S.inclo,xmo:S.mo,xno:S.no,xnodeo:S.nodeo})}function A3(S,O){const o="i",D=S.substring(2,7),B=parseInt(S.substring(18,20),10),s=parseFloat(S.substring(20,32));let i=parseFloat(S.substring(33,43)),M=parseFloat(`${S.substring(44,45)}.${S.substring(45,50)}E${S.substring(50,52)}`);const c=parseFloat(`${S.substring(53,54)}.${S.substring(54,59)}E${S.substring(59,61)}`),E=parseFloat(O.substring(8,16))*C2,U=parseFloat(O.substring(17,25))*C2,e=parseFloat(`.${O.substring(26,33).replace(/\s/g,"0")}`),d=parseFloat(O.substring(34,42))*C2,R=parseFloat(O.substring(43,51))*C2,m=parseFloat(O.substring(52,63))/N2;i/=N2*1440,M/=N2*1440*1440;const T=B<57?B+2e3:B+1900,x=Q2(T,s),{mon:y,day:N,hr:G,minute:a,sec:C}=x,I=P2(T,y,N,G,a,C),u={error:0,satnum:D,epochyr:B,epochdays:s,ndot:i,nddot:M,bstar:c,inclo:E,nodeo:U,ecco:e,argpo:d,mo:R,no:m,jdsatepoch:I};return I3(u,o),u}const a3=S=>S.tempa<=0;function n2(S,...O){const o=O.at(-1),t=typeof o=="object"&&!(o instanceof Date)?o:void 0,D=t?O.slice(0,-1):O,s=(P2(...D)-S.jdsatepoch)*U3,i=Z2(S,s);return t!=null&&t.communityDecayCheckEnabled&&i&&a3(S)?(S.error=J0.Decayed,null):i}const y2=6378.137,V2=398600.4418,m3={stations:"ISS / CSS PARTNERS","cosmos-1408-debris":"CIS (ASAT DEBRIS)","iridium-33-debris":"US (DERELICT)","cosmos-2251-debris":"CIS (DERELICT)"};function h3(S){return/\bDEB\b/.test(S)?"DEBRIS":/\bR\/B\b/.test(S)?"ROCKET BODY":"PAYLOAD"}function p3(S){return S==="DEBRIS"?"SMALL":"LARGE"}function r3(S){const O=S.slice(9,17).trim(),o=Number(O.slice(0,2));return{intl:O,launchYear:o<57?2e3+o:1900+o}}function R3(S,O){var D;const o=[];for(const{group:B,text:s}of S){const i=s.split(/\r?\n/);for(let M=0;M+2<i.length;M+=3){const c=(D=i[M])==null?void 0:D.trim(),E=i[M+1],U=i[M+2];if(!c||!(E!=null&&E.startsWith("1 "))||!(U!=null&&U.startsWith("2 ")))continue;let e;try{e=A3(E,U)}catch{continue}if(e.error!==J0.None)continue;const d=e.no/60,R=Math.cbrt(V2/(d*d)),m=e.ecco,T=h3(c),{intl:x,launchYear:y}=r3(E),N=E3(e.jdsatepoch).getTime();o.push({group:B,rec:e,object:{norad:Number(e.satnum),name:c,type:T,op:m3[B]??B.toUpperCase(),intl:x,launch:String(y),alt:Math.round(R-y2),apogee:Math.round(R*(1+m)-y2),perigee:Math.round(R*(1-m)-y2),ecc:+m.toFixed(7),incl:+(e.inclo*180/Math.PI).toFixed(4),raan:+(e.nodeo*180/Math.PI).toFixed(4),argp:+(e.argpo*180/Math.PI).toFixed(4),ma:+(e.mo*180/Math.PI).toFixed(4),period:+(2*Math.PI*Math.sqrt(R*R*R/V2)/60).toFixed(2),rcs:p3(T),age:+((O-N)/864e5).toFixed(2),tle:[E,U]}})}}const t=new Set;return o.filter(B=>t.has(B.object.norad)?!1:(t.add(B.object.norad),!0))}var f3=`ISS (ZARYA)             
1 25544U 98067A   24322.09401066  .00019103  00000+0  34302-3 0  9997
2 25544  51.6410 277.8367 0007583 226.0535 235.5529 15.49882713482266
CSS (TIANHE)            
1 48274U 21035A   24322.14739064  .00030668  00000+0  39070-3 0  9997
2 48274  41.4674 230.2924 0003405 320.7952  39.2639 15.58656254203021
ISS (NAUKA)             
1 49044U 21066A   24321.23759159  .00018961  00000+0  34096-3 0  9998
2 49044  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912481690
CSS (WENTIAN)           
1 53239U 22085A   24321.25033238  .00037560  00000+0  47827-3 0  9998
2 53239  41.4676 235.7337 0003553 317.2999  42.7563 15.58593819124398
CSS (MENGTIAN)          
1 54216U 22143A   24321.25033238  .00037560  00000+0  47827-3 0  9999
2 54216  41.4676 235.7337 0003553 317.2999  42.7563 15.58593819112896
TIANZHOU-7              
1 58811U 24013A   24321.19921897  .00055838  00000+0  64415-3 0  9992
2 58811  41.4693 235.9483 0011156 312.8207 157.6134 15.60978638202939
PROGRESS-MS 27          
1 59913U 24103A   24321.23759159  .00018961  00000+0  34096-3 0  9999
2 59913  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912 26477
CYGNUS NG-21            
1 60378U 24139A   24321.23759159  .00018961  00000+0  34096-3 0  9995
2 60378  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912481693
PROGRESS-MS 28          
1 60450U 24145A   24321.23759159  .00018961  00000+0  34096-3 0  9993
2 60450  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912 14315
SOYUZ-MS 26             
1 61043U 24162A   24321.23759159  .00018961  00000+0  34096-3 0  9991
2 61043  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912481233
CREW DRAGON 9           
1 61447U 24178A   24321.23759159  .00018961  00000+0  34096-3 0  9996
2 61447  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912  6638
SHENZHOU-19 (SZ-19)     
1 61683U 24194A   24321.25033238  .00037560  00000+0  47827-3 0  9993
2 61683  41.4676 235.7337 0003553 317.2999  42.7563 15.58593819202768
DRAGON CRS-31           
1 61791U 24200A   24321.23759159  .00018961  00000+0  34096-3 0  9994
2 61791  51.6393 282.0820 0007412 224.1527 135.8870 15.49848912  1130
TIANZHOU-8              
1 61983U 24211A   24319.84059492  .00045616  00000+0  58175-3 0  9997
2 61983  41.4673 244.2846 0003881 313.7517  46.2999 15.58483552    06
`,x3=`COSMOS 1408 DEB         
1 49527U 82092Q   24322.15674400  .00088452  00000+0  48919-2 0  9997
2 49527  82.3689 229.4541 0242850 306.6997  51.2124 14.91788479157537
COSMOS 1408 DEB         
1 49537U 82092AA  24321.46703937  .00035814  00000+0  10608-2 0  9997
2 49537  82.5444 142.2833 0090995 247.3536 111.8062 15.30602041165061
COSMOS 1408 DEB         
1 49539U 82092AC  24321.72501323  .00728394  00000+0  12577-1 0  9991
2 49539  82.1468 202.6278 0107070 333.3895  26.1876 15.42656604157425
COSMOS 1408 DEB         
1 49619U 82092DL  24322.03606981  .00112506  00000+0  34938-2 0  9999
2 49619  81.9281 164.6760 0164118 330.1813  29.0141 15.20784528157675
COSMOS 1408 DEB         
1 50032U 82092RU  24321.41122380  .00008331  00000+0  20315-3 0  9992
2 50032  82.5640  98.0764 0017283 185.7047 174.4006 15.40547048165680
COSMOS 1408 DEB         
1 50058U 82092SW  24321.47832049  .00020994  00000+0  45086-3 0  9997
2 50058  82.6133 112.3458 0026439  96.8607 263.5651 15.44167134167308
COSMOS 1408 DEB         
1 50351U 82092ABM 24321.22991231  .00151298  00000+0  26111-2 0  9994
2 50351  82.5071 144.1654 0078633 267.0178  92.2071 15.47033926164699
COSMOS 1408 DEB         
1 50404U 82092ADS 24321.79109620  .00068822  00000+0  59249-2 0  9996
2 50404  82.2367 236.7529 0368487  42.5407 320.3719 14.56832451153952
COSMOS 1408 DEB         
1 50621U 82092ALR 24321.48009479  .00021742  00000+0  55054-3 0  9995
2 50621  82.5742 115.6325 0042313 136.3519 224.1086 15.38651973161995
COSMOS 1408 DEB         
1 50689U 82092APM 24321.77977757  .00088090  00000+0  72686-3 0  9993
2 50689  82.5064  84.3593 0025248  20.8712 339.3574 15.69599161162294
COSMOS 1408 DEB         
1 51184U 82092AZJ 24321.37926305  .00057673  00000+0  63073-3 0  9996
2 51184  82.4876  81.1271 0013810  31.3933 328.8147 15.62965182160152
COSMOS 1408 DEB         
1 51435U 82092BKH 24322.14646155  .00084037  00000+0  10596-2 0  9998
2 51435  82.5455 113.0886 0032483 148.7021 211.6178 15.58645042157671
COSMOS 1408 DEB         
1 52066U 82092BUU 24321.80942436  .00080686  00000+0  21336-2 0  9992
2 52066  82.5085 151.4565 0104076 302.8182  56.3069 15.32682183149606
`,u3=`IRIDIUM 33              
1 24946U 97051C   24321.48036608  .00000609  00000+0  20856-3 0  9992
2 24946  86.3901 232.2691 0009864  59.2703 300.9463 14.34648817422258
IRIDIUM 33 DEB          
1 33773U 97051L   24321.45104577  .00002273  00000+0  68851-3 0  9994
2 33773  86.4052 226.0943 0012373  18.2597 341.9045 14.41873247827110
IRIDIUM 33 DEB          
1 33775U 97051N   24321.48622541  .00002211  00000+0  70161-3 0  9994
2 33775  86.3697 216.2234 0015739  23.8050 149.5845 14.39558122825178
IRIDIUM 33 DEB          
1 33776U 97051P   24321.81133865  .00002131  00000+0  71030-3 0  9995
2 33776  86.4059 244.6639 0016634  46.4996   7.0628 14.37105701824749
IRIDIUM 33 DEB          
1 33777U 97051Q   24321.96684459  .00005504  00000+0  13791-2 0  9998
2 33777  86.3846 204.5006 0009953 128.0465 232.1640 14.51241677828658
IRIDIUM 33 DEB          
1 33850U 97051T   24321.78655837  .00002619  00000+0  82008-3 0  9990
2 33850  86.3470 197.9778 0012951  27.0430  16.2345 14.40293171825245
IRIDIUM 33 DEB          
1 33853U 97051W   24321.81640314  .00003625  00000+0  21316-2 0  9993
2 33853  86.0007 160.8599 0220105 354.0492  16.9930 13.96453428798940
IRIDIUM 33 DEB          
1 33859U 97051AC  24322.02406853  .00025759  00000+0  36890-2 0  9996
2 33859  86.3345 184.3271 0032900 306.6541  53.1654 14.76086270827107
IRIDIUM 33 DEB          
1 33860U 97051AD  24321.65707236  .00010186  00000+0  21497-2 0  9990
2 33860  86.3907 199.1455 0007959 229.9160 189.5886 14.59294449830140
IRIDIUM 33 DEB          
1 33862U 97051AF  24321.75367330  .00012454  00000+0  25137-2 0  9995
2 33862  86.4152 208.7728 0056888 331.2877  95.7770 14.60318567830984
IRIDIUM 33 DEB          
1 33864U 97051AH  24322.16386902  .00061736  00000+0  62483-2 0  9991
2 33864  86.2667 103.3391 0008791  10.2482 162.6265 14.90641960832622
IRIDIUM 33 DEB          
1 33866U 97051AK  24321.36465045  .00005638  00000+0  23998-2 0  9997
2 33866  86.3002 258.1121 0113142 336.6401 151.7181 14.21658874812474
IRIDIUM 33 DEB          
1 33867U 97051AL  24321.31989155  .00026205  00000+0  27357-2 0  9992
2 33867  86.4064 175.1503 0019588   9.4628 350.6963 14.89457931836166
IRIDIUM 33 DEB          
1 33870U 97051AP  24321.50312678  .00005236  00000+0  15649-2 0  9999
2 33870  86.3798 225.4143 0024153  43.8642  79.1355 14.42629966824976
IRIDIUM 33 DEB          
1 33874U 97051AT  24321.40896120  .00058285  00000+0  85918-2 0  9999
2 33874  86.2811 185.5628 0018510 210.1346 323.5452 14.74923634822010
IRIDIUM 33 DEB          
1 33881U 97051BA  24321.64957264  .00015165  00000+0  43544-2 0  9999
2 33881  86.3875 275.1511 0066117  38.1367 135.0854 14.43508274818341
IRIDIUM 33 DEB          
1 33884U 97051BD  24321.69471122  .00011595  00000+0  21478-2 0  9996
2 33884  86.3711 184.9787 0010726 231.2576 195.3443 14.65193418831036
IRIDIUM 33 DEB          
1 33886U 97051BF  24321.49357819  .00001199  00000+0  41109-3 0  9995
2 33886  86.3864 231.6797 0016427  85.3173  88.7675 14.35313155824407
IRIDIUM 33 DEB          
1 33887U 97051BG  24321.13276212  .00000946  00000+0  31495-3 0  9990
2 33887  86.3078 172.0106 0008456  83.3472  35.4144 14.36615874825416
IRIDIUM 33 DEB          
1 33953U 97051BN  24321.99183812  .00006771  00000+0  17326-2 0  9999
2 33953  86.3923 222.4992 0019801 336.7309  34.5853 14.50182686826786
IRIDIUM 33 DEB          
1 33959U 97051BU  24322.15913758  .00175898  00000+0  16275-1 0  9992
2 33959  86.3610 226.2867 0042814  94.4497 266.1624 14.92946518822934
IRIDIUM 33 DEB          
1 33960U 97051BV  24322.18720212  .00019865  00000+0  34214-2 0  9993
2 33960  86.2645 111.0344 0003976 351.2780 181.8376 14.68451314831169
IRIDIUM 33 DEB          
1 33965U 97051CA  24322.06698401  .00141153  00000+0  72432-2 0  9999
2 33965  86.3433 161.6008 0009148   1.2792 358.8470 15.15862172833287
IRIDIUM 33 DEB          
1 33966U 97051CB  24321.48221970  .00003950  00000+0  10814-2 0  9996
2 33966  86.3976 213.4887 0010279  71.7661 102.1981 14.46963442828045
IRIDIUM 33 DEB          
1 34071U 97051CE  24321.15358159  .00004071  00000+0  11263-2 0  9992
2 34071  86.3504 187.5866 0007846 351.3720   8.7346 14.46478578826671
IRIDIUM 33 DEB          
1 34077U 97051CL  24321.79608698  .00012402  00000+0  28306-2 0  9997
2 34077  86.3929 222.3528 0009432 287.7197 141.7084 14.55672979826290
IRIDIUM 33 DEB          
1 34079U 97051CN  24321.63940075  .00016229  00000+0  27326-2 0  9992
2 34079  86.3848 184.5999 0005458 267.4342 146.0838 14.69459566832106
IRIDIUM 33 DEB          
1 34086U 97051CV  24321.89578888  .00086617  00000+0  73695-2 0  9995
2 34086  86.3697 206.1858 0005119 352.4926 131.9977 14.97389782828428
IRIDIUM 33 DEB          
1 34088U 97051CX  24321.46234985  .00022616  00000+0  37748-2 0  9995
2 34088  86.3969 207.1589 0007670 122.2864  50.7467 14.69811556829805
IRIDIUM 33 DEB          
1 34091U 97051DA  24321.25007941  .00036087  00000+0  76613-2 0  9997
2 34091  86.3594 242.0295 0044648 219.7421 140.0515 14.58308990821183
IRIDIUM 33 DEB          
1 34097U 97051DG  24321.61824727  .00005316  00000+0  19675-2 0  9998
2 34097  86.2021 173.4243 0086056 190.0911 169.8559 14.30136427815822
IRIDIUM 33 DEB          
1 34102U 97051DM  24321.90759576  .00145356  00000+0  14633-1 0  9993
2 34102  86.3470 275.6515 0055767  65.2428 355.9625 14.89285234817353
IRIDIUM 33 DEB          
1 34106U 97051DR  24322.06239208  .00041862  00000+0  38852-2 0  9997
2 34106  86.3379 155.2429 0004418 181.5650 302.0407 14.94218898833377
IRIDIUM 33 DEB          
1 34107U 97051DS  24322.05691418  .00087641  00000+0  57229-2 0  9996
2 34107  86.3785 162.3514 0003428 124.3441   0.5656 15.07432764834446
IRIDIUM 33 DEB          
1 34145U 97051DY  24321.24377987  .00005800  00000+0  18795-2 0  9992
2 34145  86.2128 146.3080 0056741 302.0058  57.5633 14.37925989820027
IRIDIUM 33 DEB          
1 34146U 97051DZ  24321.55857008  .00005383  00000+0  15274-2 0  9999
2 34146  86.2846 162.0405 0032071  85.3914 304.2344 14.45011515824578
IRIDIUM 33 DEB          
1 34159U 97051EN  24321.68024908  .00002191  00000+0  73040-3 0  9992
2 34159  86.3560 214.6618 0030158 125.8788 234.5217 14.36911188823397
IRIDIUM 33 DEB          
1 34350U 97051ES  24321.68133116  .00002049  00000+0  59562-3 0  9992
2 34350  86.3311 172.2353 0022014   0.9432  70.6952 14.43733761826463
IRIDIUM 33 DEB          
1 34366U 97051FJ  24322.17197796  .00006958  00000+0  18395-2 0  9999
2 34366  86.3743 218.3385 0024458  15.8516 137.0890 14.48569350825169
IRIDIUM 33 DEB          
1 34375U 97051FT  24321.03424062  .00002379  00000+0  11230-2 0  9996
2 34375  86.4308 340.5600 0101816 291.4327  96.5996 14.16759416811633
IRIDIUM 33 DEB          
1 34376U 97051FU  24321.81338483  .00007933  00000+0  19076-2 0  9991
2 34376  86.3059 180.8601 0032836  57.4305 303.0064 14.52908085824727
IRIDIUM 33 DEB          
1 34486U 97051GB  24321.39762204  .00020533  00000+0  30285-2 0  9994
2 34486  86.4054 189.4771 0016647  61.8647 111.5250 14.75123964832489
IRIDIUM 33 DEB          
1 34487U 97051GC  24321.37754471  .00001308  00000+0  38856-3 0  9992
2 34487  86.3473 180.6957 0031159 348.3090 185.4514 14.42276151826211
IRIDIUM 33 DEB          
1 34488U 97051GD  24321.47470076  .00032348  00000+0  38537-2 0  9993
2 34488  86.3342 131.5034 0017570 345.2463  14.8245 14.84066324834747
IRIDIUM 33 DEB          
1 34492U 97051GH  24321.47940094  .00010833  00000+0  45839-2 0  9998
2 34492  86.4865 130.8862 0231508  46.4313   8.0657 14.12007418795240
IRIDIUM 33 DEB          
1 34497U 97051GN  24321.72941894  .00002616  00000+0  10631-2 0  9992
2 34497  86.2831 219.0312 0083383 154.7214 261.4736 14.25353646814421
IRIDIUM 33 DEB          
1 34503U 97051GU  24321.86651432  .00032184  00000+0  21917-2 0  9993
2 34503  86.2989  94.6815 0006008 150.8935 209.2637 15.06127815836100
IRIDIUM 33 DEB          
1 34508U 97051GZ  24322.11694662  .00006927  00000+0  24029-2 0  9992
2 34508  86.3707 267.5561 0071203  14.2940 346.0248 14.34048802817016
IRIDIUM 33 DEB          
1 34521U 97051HN  24321.11050851  .00015143  00000+0  33908-2 0  9998
2 34521  86.3849 201.9807 0004515 118.2490 241.9174 14.56576468827571
IRIDIUM 33 DEB          
1 34525U 97051HS  24321.17652328  .00003082  00000+0  94883-3 0  9994
2 34525  86.3783 213.6520 0003532 335.1097 176.9411 14.41238479824440
IRIDIUM 33 DEB          
1 34529U 97051HW  24322.11740503  .00000680  00000+0  21023-3 0  9993
2 34529  86.3697 201.7498 0007393  57.6708 302.5206 14.39861152825766
IRIDIUM 33 DEB          
1 34538U 97051JF  24321.07293147  .00005840  00000+0  18619-2 0  9993
2 34538  86.2792 176.6024 0036608 168.9199 342.3070 14.39263224821153
IRIDIUM 33 DEB          
1 34540U 97051JH  24321.71904488  .00011382  00000+0  20799-2 0  9994
2 34540  86.3148 124.9250 0022084  84.3762 287.3099 14.65678228833121
IRIDIUM 33 DEB          
1 34648U 97051JZ  24321.28452571  .00013519  00000+0  71610-2 0  9998
2 34648  86.4060  78.7363 0200774  82.8366 279.5592 14.03794813795121
IRIDIUM 33 DEB          
1 34651U 97051KC  24320.37669157  .00020636  00000+0  87617-2 0  9993
2 34651  86.2837 306.6120 0164640  19.9945 340.7591 14.18168733803171
IRIDIUM 33 DEB          
1 34652U 97051KD  24322.03931140  .00005669  00000+0  12516-2 0  9998
2 34652  86.3334 153.2460 0030800 178.5469 308.6173 14.56886204829372
IRIDIUM 33 DEB          
1 34690U 97051KM  24321.47143212  .00004940  00000+0  12284-2 0  9995
2 34690  86.3849 206.5305 0008350 250.5425 283.5653 14.51598737824323
IRIDIUM 33 DEB          
1 34693U 97051KQ  24321.47166406  .00032040  00000+0  38951-2 0  9999
2 34693  86.3249 129.8184 0017812 356.0705  70.0135 14.83225648831064
IRIDIUM 33 DEB          
1 34696U 97051KT  24321.69493873  .00025372  00000+0  71831-2 0  9991
2 34696  86.1992 205.7652 0104698  38.8912  15.1559 14.42236913810405
IRIDIUM 33 DEB          
1 34702U 97051KZ  24321.30406039  .00069292  00000+0  56434-2 0  9996
2 34702  86.2935  84.3076 0022123 204.6014 155.4164 14.98996416835724
IRIDIUM 33 DEB          
1 34765U 97051LJ  24320.45646979  .00002661  00000+0  85872-3 0  9995
2 34765  86.3441 200.7953 0018988  69.7061 104.2501 14.38763590819694
IRIDIUM 33 DEB          
1 34775U 97051LU  24321.16340948  .00048874  00000+0  67724-2 0  9993
2 34775  86.3630 202.6911 0013344 192.8220 295.7714 14.77683111825081
IRIDIUM 33 DEB          
1 34833U 97051MH  24321.24499569  .00006479  00000+0  17158-2 0  9992
2 34833  86.3985 219.1063 0020373 336.3911 153.0715 14.48539544820396
IRIDIUM 33 DEB          
1 34870U 97051MQ  24321.46805559  .00013777  00000+0  24873-2 0  9998
2 34870  86.3128 131.8450 0022918 105.5761 283.9022 14.66204384832750
IRIDIUM 33 DEB          
1 34896U 97051MY  24321.28376453  .00008107  00000+0  16546-2 0  9991
2 34896  86.3305 141.4521 0030944 114.8952   5.9574 14.60521262818933
IRIDIUM 33 DEB          
1 34926U 97051NF  24322.10718128  .00013753  00000+0  43103-2 0  9998
2 34926  86.1514 186.5587 0115778 142.8673   9.5184 14.36717461808677
IRIDIUM 33 DEB          
1 34928U 97051NH  24319.84225810  .00033987  00000+0  35434-2 0  9997
2 34928  86.3889 158.4369 0020164 295.8806  64.0341 14.89470074603345
IRIDIUM 33 DEB          
1 34985U 97051NR  24321.72165462  .00002606  00000+0  82103-3 0  9996
2 34985  86.3740 223.2768 0024744  74.3009 346.2995 14.39872038815730
IRIDIUM 33 DEB          
1 35051U 97051NX  24317.90939334  .00004480  00000+0  12871-2 0  9999
2 35051  86.3300 180.5289 0008179 333.7050  26.3735 14.44679887813696
IRIDIUM 33 DEB          
1 35052U 97051NY  24321.41312627  .00001161  00000+0  37990-3 0  9994
2 35052  86.3354 188.0784 0009734 291.9108  68.1054 14.37691087818923
IRIDIUM 33 DEB          
1 35080U 97051PF  24319.50217981  .00019621  00000+0  49693-2 0  9991
2 35080  86.2225 233.4557 0123686  80.3018 281.2129 14.46247798639351
IRIDIUM 33 DEB          
1 35296U 97051PL  24317.19475211  .00161600  00000+0  94058-2 0  9995
2 35296  86.2855 127.4227 0009802 293.3492  66.6715 15.11245846 21211
IRIDIUM 33 DEB          
1 35297U 97051PM  24320.50919832  .00005350  00000+0  16088-2 0  9993
2 35297  86.3882 229.6657 0017855  14.2841 345.8860 14.42412513647666
IRIDIUM 33 DEB          
1 35299U 97051PP  24321.64752303  .00005372  00000+0  17913-2 0  9991
2 35299  86.2959 202.7867 0056967 311.0792  77.7254 14.36499272808204
IRIDIUM 33 DEB          
1 35480U 97051QA  24319.37962493  .00004062  00000+0  11155-2 0  9990
2 35480  86.3631 194.9859 0014171 346.0907  13.9903 14.46793136813378
IRIDIUM 33 DEB          
1 35484U 97051QE  24320.35119513  .00025064  00000+0  37207-2 0  9992
2 35484  86.3718 172.6112 0032968  79.7521 280.7412 14.74546285821324
IRIDIUM 33 DEB          
1 35488U 97051QJ  24321.40073042  .00012534  00000+0  19654-2 0  9993
2 35488  86.3279 119.7669 0031935 329.8563  30.0815 14.72237678824931
IRIDIUM 33 DEB          
1 35616U 97051QN  24320.85627805  .00019328  00000+0  32918-2 0  9992
2 35616  86.3600 162.7866 0014193 106.2090 254.0687 14.68886382817954
IRIDIUM 33 DEB          
1 35618U 97051QQ  24321.32378137  .00003425  00000+0  87950-3 0  9996
2 35618  86.3427 164.3084 0028053 248.1503 111.6717 14.49777971815365
IRIDIUM 33 DEB          
1 35620U 97051QS  24321.88122431  .00011135  00000+0  40019-2 0  9995
2 35620  86.3906  20.5915 0169114  85.3841 276.6643 14.26037513788608
IRIDIUM 33 DEB          
1 35622U 97051QU  24320.64343299  .00044937  00000+0  68599-2 0  9996
2 35622  86.2083  90.8729 0019518 236.6626 134.5145 14.73479868816844
IRIDIUM 33 DEB          
1 35628U 97051RA  24320.94206439  .00014064  00000+0  29650-2 0  9992
2 35628  86.3631 182.6533 0012137 227.6530 132.3653 14.59319929813759
IRIDIUM 33 DEB          
1 35631U 97051RD  24320.61912958  .00002357  00000+0  65947-3 0  9992
2 35631  86.3714 189.5682 0017642 354.5782  34.9031 14.45701074818114
IRIDIUM 33 DEB          
1 35632U 97051RE  24320.69120496  .00143855  00000+0  18546-1 0  9999
2 35632  86.4123 304.0254 0065098  48.0130 312.6609 14.78776611801124
IRIDIUM 33 DEB          
1 35680U 97051RJ  24321.91589853  .00008878  00000+0  40274-2 0  9993
2 35680  86.1129 193.5555 0175054  78.7081 295.4682 14.13972946789519
IRIDIUM 33 DEB          
1 35744U 97051RX  24320.95141966  .00013769  00000+0  26421-2 0  9999
2 35744  86.3307 141.4175 0026615 105.3071 255.1085 14.63413527815851
IRIDIUM 33 DEB          
1 35749U 97051SC  24315.59199304  .00844978  00000+0  19768-1 0  9996
2 35749  86.3716 162.2794 0010063  34.3986 325.7917 15.39716805813185
IRIDIUM 33 DEB          
1 35797U 97051SF  24320.25356626  .00017959  00000+0  30154-2 0  9994
2 35797  86.3400 148.3908 0017966  92.4197 267.9076 14.69477291815492
IRIDIUM 33 DEB          
1 35806U 97051SQ  24317.93181484  .00008417  00000+0  21095-2 0  9997
2 35806  86.3629 193.6237 0014068 327.4612  32.5725 14.51243347805857
IRIDIUM 33 DEB          
1 35809U 97051ST  24321.28871844  .00013278  00000+0  24781-2 0  9995
2 35809  86.3332 152.0817 0016310 155.8878 204.3102 14.64808116810548
IRIDIUM 33 DEB          
1 35846U 97051SW  24320.17054739  .00004542  00000+0  14122-2 0  9991
2 35846  86.3807 225.9150 0021334  38.0650 322.2052 14.40714315800777
IRIDIUM 33 DEB          
1 35848U 97051SY  24320.92356692  .00020578  00000+0  36637-2 0  9991
2 35848  86.3976 190.6554 0011343 121.5445 238.6879 14.66939085805055
IRIDIUM 33 DEB          
1 35850U 97051TA  24320.33127625  .00015167  00000+0  26841-2 0  9995
2 35850  86.3555 161.1159 0014042 120.8843 239.3754 14.67200384655796
IRIDIUM 33 DEB          
1 35911U 97051TU  24320.85015480  .00043178  00000+0  75832-2 0  9992
2 35911  86.2215 165.1810 0055876 325.4149  34.3434 14.66441633812466
IRIDIUM 33 DEB          
1 35915U 97051TY  24318.83116230  .00016366  00000+0  28591-2 0  9995
2 35915  86.3519 161.0888 0016435 128.3553 231.9141 14.67747706 22818
IRIDIUM 33 DEB          
1 35918U 97051UB  24321.55879837  .00007989  00000+0  22094-2 0  9993
2 35918  86.4052 242.9305 0031041  41.5836  80.9233 14.46315420797978
IRIDIUM 33 DEB          
1 35929U 97051UN  24321.25507832  .00023409  00000+0  31436-2 0  9990
2 35929  86.3411 134.5618 0021757 344.0347  16.0185 14.79041878819488
IRIDIUM 33 DEB          
1 36011U 97051US  24312.47415088  .00006007  00000+0  19256-2 0  9999
2 36011  86.3458 206.9717 0021422  97.0838  75.7260 14.39251462796865
IRIDIUM 33 DEB          
1 36012U 97051UT  24320.13684745  .00012675  00000+0  54841-2 0  9997
2 36012  86.4471 104.2802 0241624  60.2398 302.2583 14.09818751599389
IRIDIUM 33 DEB          
1 36019U 97051VA  24321.82854060  .00289031  00000+0  85566-2 0  9990
2 36019  86.3704 163.5595 0008847  28.2072 342.8659 15.33677012808122
IRIDIUM 33 DEB          
1 36028U 97051VK  24321.21328298  .00021743  00000+0  31107-2 0  9998
2 36028  86.3281 127.9691 0024758 358.6193   1.4953 14.76308563813103
IRIDIUM 33 DEB          
1 36080U 97051VM  24318.88120656  .00004036  00000+0  11779-2 0  9992
2 36080  86.3243 179.1717 0019426  35.5832 324.6660 14.43795097417251
IRIDIUM 33 DEB          
1 36083U 97051VQ  24315.42362736  .00008543  00000+0  26481-2 0  9992
2 36083  86.3503 204.8026 0029619  96.8853 263.5717 14.40808044797237
IRIDIUM 33 DEB          
1 36390U 97051VU  24313.20539349  .00025073  00000+0  46433-2 0  9999
2 36390  86.2960 121.2307 0037574 105.3747 255.1622 14.64739316603931
IRIDIUM 33 DEB          
1 36483U 97051VZ  24319.01095309  .00004712  00000+0  13936-2 0  9999
2 36483  86.3847 220.5877 0010190  13.0735 347.0728 14.43260877594611
IRIDIUM 33 DEB          
1 36487U 97051WD  24298.36094732  .00071586  00000+0  14737-1 0  9998
2 36487  86.3742 332.3552 0085394 175.0371 185.1706 14.57841369635859
IRIDIUM 33 DEB          
1 36490U 97051WG  24321.07161370  .00018574  00000+0  34993-2 0  9995
2 36490  86.3729 185.4294 0003854   3.8214 356.3028 14.64454070807287
IRIDIUM 33 DEB          
1 36493U 97051WK  24318.91449629  .00009337  00000+0  20390-2 0  9996
2 36493  86.3636 185.5887 0010465 253.6743 106.3315 14.57707628687655
IRIDIUM 33 DEB          
1 37548U 97051XH  24313.46402476  .00017037  00000+0  47462-2 0  9997
2 37548  86.3582 216.3302 0029208  85.3703 275.0835 14.45995156801306
IRIDIUM 33 DEB          
1 37550U 97051XK  24321.38184054  .00010304  00000+0  21826-2 0  9995
2 37550  86.3848 196.1768 0005303  34.2016 325.9535 14.59137400806071
IRIDIUM 33 DEB          
1 37562U 97051XX  24319.47905788  .00008333  00000+0  21032-2 0  9998
2 37562  86.3797 214.2235 0027900 354.7032 179.3794 14.50728522806141
IRIDIUM 33 DEB          
1 37565U 97051YA  24321.33874958  .00003764  00000+0  99309-3 0  9999
2 37565  86.3527 179.6711 0012486 320.3923  39.6367 14.48700963796158
IRIDIUM 33 DEB          
1 38017U 97051YD  24321.27493797  .00026577  00000+0  86669-2 0  9994
2 38017  86.3406 334.0827 0131764 307.9690  50.9660 14.33673363713771
IRIDIUM 33 DEB          
1 38020U 97051YG  24311.87268852  .00753574  00000+0  48114-1 0  9991
2 38020  86.2399 271.7529 0059678  60.1073 300.6071 15.04632615784398
IRIDIUM 33 DEB          
1 38022U 97051YJ  24316.91435016  .00006985  00000+0  22902-2 0  9996
2 38022  86.2801 189.1208 0047790 268.2890  91.2833 14.37631087634990
IRIDIUM 33 DEB          
1 38028U 97051YQ  24319.31956125  .00003055  00000+0  87828-3 0  9992
2 38028  86.3299 171.0112 0028983 353.5933   6.4893 14.44329057598128
IRIDIUM 33 DEB          
1 38228U 97051ZC  24320.47292973  .00002139  00000+0  86655-3 0  9996
2 38228  86.3004 214.9618 0066230  15.3133 108.1428 14.26140739791884
IRIDIUM 33 DEB          
1 38236U 97051ZL  24314.80182168  .00141717  00000+0  19019-1 0  9993
2 38236  86.2468 149.3464 0039382  99.1188 261.4490 14.78020347558370
IRIDIUM 33 DEB          
1 38241U 97051ZR  24320.35016122  .00005614  00000+0  14152-2 0  9991
2 38241  86.3256 163.1674 0002221 331.9814  28.1271 14.50992613545021
IRIDIUM 33 DEB          
1 38469U 97051ZW  24319.09299965  .00212254  00000+0  22194-1 0  9994
2 38469  86.2460 249.8081 0051343 340.9389  18.9913 14.87567659554229
IRIDIUM 33 DEB          
1 38474U 97051AAB 24315.91577809  .00008853  00000+0  23841-2 0  9992
2 38474  86.3464 182.5416 0026527 337.1636  22.8386 14.47676600806405
IRIDIUM 33 DEB          
1 38477U 97051AAE 24315.09186608  .00036230  00000+0  29584-1 0  9996
2 38477  86.4072 251.6412 0422319 302.9794  53.1420 13.54985939712814
IRIDIUM 33 DEB          
1 39777U 97051AAJ 24320.40674144  .00012441  00000+0  34766-2 0  9995
2 39777  85.9647   4.0216 0072686  61.3020 299.5461 14.44544490544949
IRIDIUM 33 DEB          
1 39778U 97051AAK 24321.45628146  .00006680  00000+0  17335-2 0  9994
2 39778  86.3843 212.3669 0005581 263.8463  96.2105 14.49622554577383
IRIDIUM 33 DEB          
1 39781U 97051AAN 24321.53806539  .00018770  00000+0  87695-2 0  9990
2 39781  86.3684  57.9960 0198085  69.9209 303.6015 14.10426095666814
IRIDIUM 33 DEB          
1 39783U 97051AAQ 24311.67826559  .00102640  00000+0  16987-1 0  9995
2 39783  86.1599  92.1032 0034639 147.3803 225.1699 14.69327846663029
IRIDIUM 33 DEB          
1 40996U 97051ABJ 24320.37576104  .00025631  00000+0  40347-2 0  9990
2 40996  86.3702 180.9178 0013007 358.1713 175.5481 14.72322667566692
IRIDIUM 33 DEB          
1 46734U 97051ABR 24306.92286301  .00010816  00000+0  35364-2 0  9990
2 46734  86.2696 180.4406 0041697 226.1395 145.5285 14.37947560571695
IRIDIUM 33 DEB          
1 46965U 97051ABX 24321.51439705  .00005879  00000+0  13292-2 0  9995
2 46965  86.3389 153.6081 0019689 207.5490 182.1841 14.55969348565659
IRIDIUM 33 DEB          
1 46971U 97051ACD 24307.35559112  .00041944  00000+0  63187-2 0  9994
2 46971  86.3438 159.8326 0011519 282.3744 256.8978 14.74153598582111
IRIDIUM 33 DEB          
1 46974U 97051ACG 24319.14927487  .00021186  00000+0  71975-2 0  9991
2 46974  86.3090 275.3911 0114641  39.7798 321.1732 14.32846440518476
IRIDIUM 33 DEB          
1 46979U 97051ACM 24317.04619498  .00038291  00000+0  76057-2 0  9994
2 46979  86.3491 227.7061 0042660 163.3770 196.8852 14.61382919295973
`,g3=`COSMOS 2251             
1 22675U 93036A   24321.41582668  .00000237  00000+0  95792-4 0  9992
2 22675  74.0381 310.7863 0023856 132.5844 227.7326 14.33026073642006
COSMOS 2251 DEB         
1 33757U 93036E   24321.24369073  .00000204  00000+0  84939-4 0  9994
2 33757  74.0356 318.2245 0013708  68.7804 303.2837 14.32429981823900
COSMOS 2251 DEB         
1 33758U 93036F   24321.79001427  .00006020  00000+0  16408-2 0  9997
2 33758  74.0309 229.2484 0016496  30.8305  39.9233 14.47513919826949
COSMOS 2251 DEB         
1 33759U 93036G   24321.70599524  .00044629  00000+0  39216-2 0  9998
2 33759  74.0057  52.6881 0014389 338.8400 171.6813 14.96259416832505
COSMOS 2251 DEB         
1 33760U 93036H   24321.26203536  .00000629  00000+0  22837-3 0  9990
2 33760  74.0307 279.7298 0019272 118.2102 348.3291 14.35282445825072
COSMOS 2251 DEB         
1 33761U 93036J   24321.92770891  .00002362  00000+0  74415-3 0  9992
2 33761  74.0370 256.3412 0021544  75.5280 351.2188 14.40768816826110
COSMOS 2251 DEB         
1 33762U 93036K   24321.29994479  .00000296  00000+0  11628-3 0  9994
2 33762  74.0402 305.5713 0014091 108.3776 314.4905 14.33475445824382
COSMOS 2251 DEB         
1 33764U 93036M   24321.35612134  .00002344  00000+0  77742-3 0  9993
2 33764  74.0338 274.7263 0024203 330.1216 149.3249 14.38228109825384
COSMOS 2251 DEB         
1 33765U 93036N   24321.72659476  .00032429  00000+0  33179-2 0  9997
2 33765  74.0155 246.0982 0103053  80.5403 326.3985 14.86470975837725
COSMOS 2251 DEB         
1 33766U 93036P   24321.19233108  .00002548  00000+0  91635-3 0  9990
2 33766  74.1856 125.0539 0065285  79.2374 281.6118 14.33072479821324
COSMOS 2251 DEB         
1 33768U 93036R   24321.44729064  .00000615  00000+0  56542-3 0  9992
2 33768  74.0665 131.1769 0368775  15.8814  23.1478 13.57958732779893
COSMOS 2251 DEB         
1 33779U 93036U   24322.12306416  .00006411  00000+0  13627-2 0  9998
2 33779  74.0471 202.0694 0020698 334.7666 176.3071 14.59123867828141
COSMOS 2251 DEB         
1 33782U 93036X   24320.97744549  .00003376  00000+0  11028-2 0  9996
2 33782  74.0330 281.2582 0019230  85.2240 337.6983 14.38849531824881
COSMOS 2251 DEB         
1 33784U 93036Z   24321.91606377  .00037640  00000+0  28422-2 0  9996
2 33784  74.1743 254.2574 0037823 209.9811 216.6087 15.01648089841561
COSMOS 2251 DEB         
1 33785U 93036AA  24321.46083785  .00019788  00000+0  41503-2 0  9997
2 33785  73.8717 101.0928 0023779 125.8513 289.9624 14.59454638827854
COSMOS 2251 DEB         
1 33789U 93036AE  24322.18885101  .00001995  00000+0  13419-2 0  9999
2 33789  74.0672  29.8091 0243221 236.0907 152.3766 13.87959800796820
COSMOS 2251 DEB         
1 33791U 93036AG  24321.63939846  .00002790  00000+0  88394-3 0  9996
2 33791  74.1777  36.2583 0032878 338.5571 145.4160 14.40230455824187
COSMOS 2251 DEB         
1 33792U 93036AH  24321.29311782  .00002412  00000+0  23668-2 0  9995
2 33792  73.9009 250.1175 0430983  24.6734 139.8577 13.44880429771770
COSMOS 2251 DEB         
1 33793U 93036AJ  24320.97958716  .00003105  00000+0  12771-2 0  9997
2 33793  73.9808 140.8189 0080257  19.3217 107.4362 14.25626634816195
COSMOS 2251 DEB         
1 33795U 93036AL  24321.57280419  .00017774  00000+0  19244-2 0  9993
2 33795  74.0363 147.2221 0049748 337.5634  86.1028 14.87306600841760
COSMOS 2251 DEB         
1 33797U 93036AN  24321.26266727  .00005502  00000+0  12428-2 0  9990
2 33797  74.0503  57.4869 0066123 246.0500 143.7573 14.55134777832854
COSMOS 2251 DEB         
1 33798U 93036AP  24321.91386155  .00000689  00000+0  19968-3 0  9999
2 33798  74.0277 143.4873 0092478 359.9628 123.4665 14.43908238829650
COSMOS 2251 DEB         
1 33799U 93036AQ  24321.75772883  .00020752  00000+0  38513-2 0  9998
2 33799  74.0369 123.4655 0034448 297.3490  74.3677 14.64785382830648
COSMOS 2251 DEB         
1 33805U 93036AW  24321.14445534  .00003041  00000+0  67491-3 0  9999
2 33805  74.0315 335.4406 0064496 262.2617  97.1220 14.56252452835239
COSMOS 2251 DEB         
1 33811U 93036BC  24322.18414929  .00015369  00000+0  16702-2 0  9999
2 33811  73.8467  21.5883 0040984 193.1682 185.2631 14.87480577841757
COSMOS 2251 DEB         
1 33813U 93036BE  24321.21614098  .00042737  00000+0  27707-2 0  9999
2 33813  74.0375  17.9590 0043401 185.8711 236.1501 15.07110943845893
COSMOS 2251 DEB         
1 33815U 93036BG  24321.91685826  .00026421  00000+0  43921-2 0  9993
2 33815  73.9743 240.9123 0029022  61.8096  18.0386 14.69729105825589
COSMOS 2251 DEB         
1 33816U 93036BH  24322.18303856  .00001352  00000+0  99545-3 0  9994
2 33816  73.8983  46.9987 0266654 133.6399 228.7178 13.80923336792862
COSMOS 2251 DEB         
1 33817U 93036BJ  24322.14061465  .00094165  00000+0  41209-2 0  9995
2 33817  74.0367 108.4452 0015693 298.6658  61.2962 15.21478697843644
COSMOS 2251 DEB         
1 33818U 93036BK  24322.05098330  .00022732  00000+0  24862-2 0  9994
2 33818  74.0886 237.2883 0043853 335.1192  36.3922 14.87054539840067
COSMOS 2251 DEB         
1 33819U 93036BL  24321.14787678  .00003840  00000+0  14318-2 0  9998
2 33819  74.1808 197.0177 0093479 168.5396 314.3731 14.29868423818934
COSMOS 2251 DEB         
1 33821U 93036BN  24321.71314159  .00026221  00000+0  17065-2 0  9994
2 33821  74.0437 236.3073 0080037  18.1750  25.7934 15.05204933850698
COSMOS 2251 DEB         
1 33822U 93036BP  24320.99212749  .00005967  00000+0  30234-2 0  9993
2 33822  74.0753 163.5220 0161778 307.3716 207.2573 14.09701423805260
COSMOS 2251 DEB         
1 33823U 93036BQ  24321.71928612  .00001690  00000+0  10049-2 0  9999
2 33823  73.8103 113.8847 0212999 306.5050  62.8516 13.97577925801503
COSMOS 2251 DEB         
1 33824U 93036BR  24321.96416689  .00266944  00000+0  60962-2 0  9997
2 33824  73.9888 139.5098 0016965 354.7949 126.9607 15.41619007841523
COSMOS 2251 DEB         
1 33825U 93036BS  24321.75413986  .00008621  00000+0  16389-2 0  9992
2 33825  73.9893  63.7367 0094244 124.4222 359.7062 14.61414816831554
COSMOS 2251 DEB         
1 33826U 93036BT  24321.47814228  .00004991  00000+0  13981-2 0  9997
2 33826  74.0664  61.1125 0092640 208.4444 229.3165 14.43819412821055
COSMOS 2251 DEB         
1 33828U 93036BV  24321.93546303  .00002789  00000+0  84667-3 0  9999
2 33828  74.0483 243.8092 0028103  54.8107  18.2038 14.42412809826811
COSMOS 2251 DEB         
1 33830U 93036BX  24322.15990556  .00007375  00000+0  12114-2 0  9993
2 33830  74.0351 272.2732 0046112 136.8162 235.5617 14.70087245837640
COSMOS 2251 DEB         
1 33832U 93036BZ  24322.04066471  .00008778  00000+0  20993-2 0  9995
2 33832  74.0577 231.5943 0026911 359.5853  12.4060 14.53487957827479
COSMOS 2251 DEB         
1 33834U 93036CB  24321.43262880  .00068399  00000+0  41066-2 0  9990
2 33834  74.0556  89.9494 0023728 251.1070 165.2023 15.10330033844229
COSMOS 2251 DEB         
1 33835U 93036CC  24321.56407633  .00007826  00000+0  17068-2 0  9995
2 33835  74.0573 126.4336 0061814 281.0913 142.1867 14.56832760830955
COSMOS 2251 DEB         
1 33836U 93036CD  24321.41566042  .00013364  00000+0  22157-2 0  9999
2 33836  74.0002 305.6011 0031516 258.2500 254.0160 14.69934733835757
COSMOS 2251 DEB         
1 33837U 93036CE  24321.40808388  .00002090  00000+0  55025-3 0  9996
2 33837  74.0145  71.6423 0035176  26.4871 333.8077 14.49335462831734
COSMOS 2251 DEB         
1 33838U 93036CF  24321.04053708  .00003040  00000+0  84753-3 0  9991
2 33838  74.0371 162.3929 0027078  20.0581 102.0849 14.46517008829011
COSMOS 2251 DEB         
1 33839U 93036CG  24321.52985688  .00002675  00000+0  50472-3 0  9990
2 33839  74.0410 237.2099 0085644  90.1903  82.1644 14.62643412838709
COSMOS 2251 DEB         
1 33841U 93036CJ  24321.29651948  .00001431  00000+0  49047-3 0  9991
2 33841  74.0376 278.3199 0019285  99.0241  67.0090 14.37010780824891
COSMOS 2251 DEB         
1 33842U 93036CK  24321.14979173  .00002596  00000+0  79908-3 0  9991
2 33842  74.0350 225.8077 0046453  70.1868 290.4287 14.41364980826923
COSMOS 2251 DEB         
1 33843U 93036CL  24322.07358689  .00129253  00000+0  46234-2 0  9993
2 33843  73.9619 312.8318 0061898 203.9377 155.8944 15.26383540834702
COSMOS 2251 DEB         
1 33844U 93036CM  24321.22452420  .00002621  00000+0  96716-3 0  9998
2 33844  74.0695  46.8404 0048506 169.4378 219.7655 14.32318848821178
COSMOS 2251 DEB         
1 33848U 93036CR  24321.19036920  .00005728  00000+0  18014-2 0  9996
2 33848  74.0343   4.0550 0043599 162.1354 253.9762 14.40100376821860
COSMOS 2251 DEB         
1 33890U 93036CT  24322.18167274  .00041003  00000+0  37589-2 0  9994
2 33890  74.0008 293.9448 0020764 179.5442 180.5764 14.94535242836304
COSMOS 2251 DEB         
1 33892U 93036CV  24320.46985817  .00004978  00000+0  21375-2 0  9992
2 33892  73.8039  96.6679 0116872 197.7803 228.5777 14.21376266813772
COSMOS 2251 DEB         
1 33894U 93036CX  24321.23404774  .00001317  00000+0  13846-2 0  9996
2 33894  73.7650 233.8085 0583292 208.7474 148.0289 13.19193324755406
COSMOS 2251 DEB         
1 33896U 93036CZ  24321.80322037  .00001973  00000+0  91437-3 0  9993
2 33896  73.7665 145.4139 0129504  26.4572 346.1251 14.17099099812269
COSMOS 2251 DEB         
1 33899U 93036DC  24321.78273244  .00008298  00000+0  18222-2 0  9995
2 33899  74.0539 109.8493 0064143 273.4003 204.4278 14.56412142831439
COSMOS 2251 DEB         
1 33900U 93036DD  24322.14915939  .00003417  00000+0  77425-3 0  9992
2 33900  74.0220  22.6194 0051851 270.9172 116.7684 14.55683198833573
COSMOS 2251 DEB         
1 33901U 93036DE  24321.47552241  .00025728  00000+0  28496-2 0  9993
2 33901  73.7745 136.0347 0067252 337.9192  21.9091 14.85566819836564
COSMOS 2251 DEB         
1 33905U 93036DJ  24321.03417767  .00004976  00000+0  17860-2 0  9997
2 33905  73.8866 320.4293 0062717 287.3556 130.9164 14.33041592820716
COSMOS 2251 DEB         
1 33906U 93036DK  24321.19060171  .00011205  00000+0  29519-2 0  9995
2 33906  74.0334 340.8701 0035866 112.5898 320.8606 14.48694317823206
COSMOS 2251 DEB         
1 33907U 93036DL  24321.63424240  .00009636  00000+0  38444-2 0  9998
2 33907  74.0728  20.8090 0123906 177.3334 305.8310 14.24480135809986
COSMOS 2251 DEB         
1 33908U 93036DM  24321.66421749  .00006165  00000+0  31462-2 0  9990
2 33908  73.8408 177.5091 0233364 272.3304  85.1130 14.02789162799853
COSMOS 2251 DEB         
1 33911U 93036DQ  24321.72785807  .00013593  00000+0  26702-2 0  9993
2 33911  74.0968 196.3558 0017861 241.5900 176.2429 14.62588625829528
COSMOS 2251 DEB         
1 33912U 93036DR  24321.16880914  .00006359  00000+0  17063-2 0  9999
2 33912  74.0368 205.4540 0010487  17.1739 147.5141 14.48294245827560
COSMOS 2251 DEB         
1 33913U 93036DS  24321.18907736  .00003630  00000+0  10103-2 0  9991
2 33913  74.0352 195.9495 0048741  35.0406 100.9934 14.46044450827922
COSMOS 2251 DEB         
1 33914U 93036DT  24321.22238935  .00000958  00000+0  78306-3 0  9995
2 33914  74.0884 300.0521 0304926 133.8605 240.1437 13.71329844787133
COSMOS 2251 DEB         
1 33915U 93036DU  24321.20050484  .00003384  00000+0  11558-2 0  9996
2 33915  74.0466  30.7582 0109495 219.7986 170.7541 14.33398438821445
COSMOS 2251 DEB         
1 33916U 93036DV  24321.48607024  .00000905  00000+0  75158-3 0  9998
2 33916  74.0512 323.1214 0327252 221.8873 296.8137 13.68055704785893
COSMOS 2251 DEB         
1 33917U 93036DW  24321.68702520  .00005556  00000+0  43952-2 0  9991
2 33917  74.1098  42.9313 0339749 236.1598 120.6756 13.67960268784010
COSMOS 2251 DEB         
1 33919U 93036DY  24322.04878364  .00114719  00000+0  58946-2 0  9995
2 33919  74.0218 322.2414 0001252  28.6300 331.4964 15.15900065836151
COSMOS 2251 DEB         
1 33920U 93036DZ  24321.03729530  .00015333  00000+0  39103-2 0  9991
2 33920  74.0645 318.3160 0038092  64.0337 296.4740 14.50124219824614
COSMOS 2251 DEB         
1 33922U 93036EB  24321.80520448  .00002605  00000+0  71413-3 0  9994
2 33922  74.0473 159.7103 0022959   6.7985   5.0048 14.47459304829595
COSMOS 2251 DEB         
1 33924U 93036ED  24321.39836723  .00000788  00000+0  77327-3 0  9996
2 33924  73.9132 178.8516 0406181 285.8463  69.8229 13.49461622774978
COSMOS 2251 DEB         
1 33928U 93036EH  24321.28883936  .00002150  00000+0  59616-3 0  9992
2 33928  73.9276  68.9083 0061231  89.2320 271.5853 14.46083506829830
COSMOS 2251 DEB         
1 33930U 93036EK  24321.92147854  .00054187  00000+0  53497-2 0  9995
2 33930  74.0075 128.6708 0007056 158.7431 319.9089 14.91654190830181
COSMOS 2251 DEB         
1 33931U 93036EL  24321.47021018  .00044335  00000+0  32906-2 0  9995
2 33931  74.0095 353.0119 0115161 180.4690 179.6409 14.97618127834086
COSMOS 2251 DEB         
1 33932U 93036EM  24321.29497487  .00002440  00000+0  82422-3 0  9993
2 33932  74.0337 317.0221 0035311 133.3245 227.0862 14.37097935823712
COSMOS 2251 DEB         
1 33933U 93036EN  24321.27560828  .00002167  00000+0  78778-3 0  9997
2 33933  74.0918  53.0403 0072294 163.5443 196.8080 14.32369144821771
COSMOS 2251 DEB         
1 33934U 93036EP  24321.74853771  .00006262  00000+0  14713-2 0  9990
2 33934  74.0375 123.0807 0017326 341.3013  18.7511 14.54527975830637
COSMOS 2251 DEB         
1 33935U 93036EQ  24322.07827357  .00357233  00000+0  65695-2 0  9991
2 33935  73.9714 191.3568 0025463 128.4722 231.8779 15.47492159839481
COSMOS 2251 DEB         
1 33936U 93036ER  24321.72289054  .00006103  00000+0  13759-2 0  9990
2 33936  74.0211  62.6200 0031673 311.8271  48.0189 14.56245188832186
COSMOS 2251 DEB         
1 33938U 93036ET  24321.19591597  .00003472  00000+0  10085-2 0  9996
2 33938  74.0477 217.0720 0015419  35.6968  82.8758 14.44622732827418
COSMOS 2251 DEB         
1 33939U 93036EU  24321.48337951  .00028737  00000+0  46749-2 0  9998
2 33939  74.0159 138.7718 0006248 299.6970  60.3579 14.70926255829664
COSMOS 2251 DEB         
1 33940U 93036EV  24320.99422437  .00008861  00000+0  21232-2 0  9995
2 33940  74.0413 166.6178 0012040 340.4538 141.8185 14.53570622828909
COSMOS 2251 DEB         
1 33942U 93036EX  24322.12528775  .00001220  00000+0  41815-3 0  9998
2 33942  74.0355 273.7870 0019069  97.0355 275.7230 14.37142500825429
COSMOS 2251 DEB         
1 33944U 93036EZ  24321.11114325  .00001568  00000+0  50693-3 0  9999
2 33944  74.0392 308.8445 0114296 145.7889 289.2729 14.36222027824032
COSMOS 2251 DEB         
1 33945U 93036FA  24321.09966741  .00000840  00000+0  30866-3 0  9996
2 33945  74.0283 303.6466 0021664 129.7351 230.5714 14.34123844824005
COSMOS 2251 DEB         
1 33948U 93036FD  24321.24776082  .00001040  00000+0  37337-3 0  9996
2 33948  74.0344 303.0888 0022074 119.2837 241.0525 14.34963030824069
COSMOS 2251 DEB         
1 33971U 93036FE  24321.35037553  .00001922  00000+0  63486-3 0  9990
2 33971  74.0257 256.5130 0017273  96.6318  48.3394 14.38611343825106
COSMOS 2251 DEB         
1 33972U 93036FF  24321.38156017  .00008758  00000+0  30232-2 0  9997
2 33972  73.9959 188.7058 0134904  87.4869  84.7359 14.30921924814822
COSMOS 2251 DEB         
1 33973U 93036FG  24322.17413510  .00000761  00000+0  22427-3 0  9994
2 33973  74.0068 111.7986 0046351  23.0098 150.0818 14.44744788829672
COSMOS 2251 DEB         
1 33975U 93036FJ  24321.38465665  .00002247  00000+0  13246-2 0  9995
2 33975  73.8048  51.8622 0194279 251.3562 106.6389 13.99544842803697
COSMOS 2251 DEB         
1 33980U 93036FP  24321.80448920  .00006214  00000+0  14444-2 0  9992
2 33980  74.0235  82.3997 0032248 321.1515 163.0443 14.54802109831312
COSMOS 2251 DEB         
1 33982U 93036FR  24322.18607897  .00003504  00000+0  74202-3 0  9994
2 33982  74.0737  22.6240 0077817 171.7011 208.9593 14.57722558834668
COSMOS 2251 DEB         
1 33983U 93036FS  24321.25203159  .00002953  00000+0  79465-3 0  9998
2 33983  74.0497 161.1187 0021323   0.3433  72.0002 14.48314396829562
COSMOS 2251 DEB         
1 33984U 93036FT  24321.22633385  .00007954  00000+0  16193-2 0  9998
2 33984  74.0133  20.1271 0029022 311.2516 122.1475 14.60911920833373
COSMOS 2251 DEB         
1 33986U 93036FV  24322.07798446  .00003185  00000+0  99952-3 0  9991
2 33986  74.0364 306.8790 0040625 120.0924 354.6226 14.40478297824494
COSMOS 2251 DEB         
1 33989U 93036FY  24321.27871959  .00205012  00000+0  65541-2 0  9995
2 33989  73.9940 158.2613 0019876  90.5801 269.7680 15.31334774840802
COSMOS 2251 DEB         
1 33990U 93036FZ  24321.80428855  .00000696  00000+0  68265-3 0  9997
2 33990  73.9286 193.2093 0409690 286.2319 154.4968 13.49221432774755
COSMOS 2251 DEB         
1 33992U 93036GB  24321.62061892  .00007138  00000+0  14114-2 0  9994
2 33992  74.0269   9.4491 0059460 228.5815 255.4644 14.61401639834075
COSMOS 2251 DEB         
1 33994U 93036GD  24321.10082762  .00000673  00000+0  21795-3 0  9999
2 33994  74.0431 194.9324 0022119  67.6975  82.7677 14.40788364827780
COSMOS 2251 DEB         
1 33995U 93036GE  24320.69422851  .00006776  00000+0  24805-2 0  9994
2 33995  74.0619 115.1463 0063651 227.8198 131.7538 14.31921592819011
COSMOS 2251 DEB         
1 33999U 93036GJ  24322.04409992  .00014353  00000+0  22594-2 0  9993
2 33999  73.9260 283.0831 0059249 267.4158  92.0229 14.71335219834981
COSMOS 2251 DEB         
1 34001U 93036GL  24321.29088176  .00001227  00000+0  42681-3 0  9997
2 34001  74.0377 281.0252 0018787 102.7383  18.4124 14.36407131825244
COSMOS 2251 DEB         
1 34003U 93036GN  24322.12757237  .00003352  00000+0  23312-2 0  9993
2 34003  74.0783 221.3795 0281990  65.0885 297.9263 13.81693499790299
COSMOS 2251 DEB         
1 34004U 93036GP  24321.09504284  .00009683  00000+0  28196-2 0  9999
2 34004  74.0360 324.8439 0031062  73.8155 286.6417 14.44006585823663
COSMOS 2251 DEB         
1 34005U 93036GQ  24321.18086520  .00000758  00000+0  24955-3 0  9992
2 34005  74.0457 216.8319 0019339  74.2758  46.2711 14.39809181827427
COSMOS 2251 DEB         
1 34006U 93036GR  24320.10294899  .00026259  00000+0  44227-2 0  9991
2 34006  74.0635 197.6853 0013864 262.7511 247.6983 14.69371489828532
COSMOS 2251 DEB         
1 34007U 93036GS  24321.22331577  .00007283  00000+0  14867-2 0  9994
2 34007  74.0238  18.0156 0051784 252.2401 107.3109 14.60225053833555
COSMOS 2251 DEB         
1 34008U 93036GT  24321.25889258  .00000588  00000+0  22490-3 0  9995
2 34008  74.0334 325.7536 0022560  56.2464 315.7309 14.32735593823576
COSMOS 2251 DEB         
1 34009U 93036GU  24321.20679183  .00000670  00000+0  25467-3 0  9994
2 34009  74.0364 332.1928 0026671 141.2886 298.7686 14.32741185823377
COSMOS 2251 DEB         
1 34010U 93036GV  24321.46541951  .00032282  00000+0  40979-2 0  9993
2 34010  74.0164 356.6384 0016777 251.7638 108.1713 14.81437692834378
COSMOS 2251 DEB         
1 34011U 93036GW  24322.07759433  .00002673  00000+0  87458-3 0  9993
2 34011  74.0172 333.3898 0037768 155.6908 204.6039 14.38572128823103
COSMOS 2251 DEB         
1 34014U 93036GZ  24321.69972428  .00008086  00000+0  14441-2 0  9999
2 34014  74.0190 319.8356 0043236 203.9968 277.7120 14.66468363835600
COSMOS 2251 DEB         
1 34015U 93036HA  24321.68660723  .00008586  00000+0  20144-2 0  9993
2 34015  74.0260 183.2802 0023228  16.1191  40.2929 14.54445598828377
COSMOS 2251 DEB         
1 34018U 93036HD  24321.48926498  .00001161  00000+0  86801-3 0  9993
2 34018  73.8801  34.8241 0265086 142.8130 231.2790 13.80398214792789
COSMOS 2251 DEB         
1 34019U 93036HE  24321.28223939  .00004564  00000+0  16924-2 0  9990
2 34019  73.9588  49.2540 0065718 314.9722  68.0850 14.31318767819149
COSMOS 2251 DEB         
1 34021U 93036HG  24321.26861090  .00002738  00000+0  74375-3 0  9993
2 34021  74.0361 143.7988 0020325  23.5326 149.8798 14.47907629829594
COSMOS 2251 DEB         
1 34022U 93036HH  24321.29752041  .00001543  00000+0  51643-3 0  9998
2 34022  74.0535 271.6225 0021012  76.7134  73.5615 14.38082739825665
COSMOS 2251 DEB         
1 34023U 93036HJ  24321.27836931  .00002233  00000+0  72699-3 0  9999
2 34023  74.0258 255.5208 0017090  90.5945  61.5112 14.39239877825796
COSMOS 2251 DEB         
1 34024U 93036HK  24321.11671507  .00001171  00000+0  42135-3 0  9991
2 34024  74.0452 313.4447 0019888 105.3681 326.8253 14.34735437824061
COSMOS 2251 DEB         
1 34026U 93036HM  24321.25364701  .00001224  00000+0  10269-2 0  9994
2 34026  73.7652 267.5084 0353990 197.1404 293.4717 13.63917551781914
COSMOS 2251 DEB         
1 34028U 93036HP  24321.24347716  .00001059  00000+0  12202-2 0  9997
2 34028  73.8823 227.3260 0546427  70.4253  84.3924 13.20126842758404
COSMOS 2251 DEB         
1 34031U 93036HS  24321.71733851  .00006658  00000+0  15822-2 0  9993
2 34031  74.0143 159.4219 0024740  14.1140 106.2305 14.53886779828868
COSMOS 2251 DEB         
1 34032U 93036HT  24321.93620942  .00077084  00000+0  59704-2 0  9992
2 34032  74.0121 130.6283 0008621 316.5533 169.0865 15.00993204830071
COSMOS 2251 DEB         
1 34033U 93036HU  24321.01018947  .00149983  00000+0  12727-1 0  9999
2 34033  73.9853 172.5790 0015549 237.3664 240.2180 14.97002363827892
COSMOS 2251 DEB         
1 34035U 93036HW  24321.53584944  .00007666  00000+0  21468-2 0  9997
2 34035  74.0685   1.4551 0044036 106.1005  23.0846 14.45653542823143
COSMOS 2251 DEB         
1 34036U 93036HX  24321.42842697  .00025979  00000+0  44228-2 0  9994
2 34036  74.0331 202.0362 0022154 348.9829  11.0853 14.68801148827914
COSMOS 2251 DEB         
1 34037U 93036HY  24321.75493514  .00002999  00000+0  10882-2 0  9997
2 34037  74.0544  45.1207 0054789 193.8806 166.0842 14.32918687821287
COSMOS 2251 DEB         
1 34040U 93036JB  24321.13951807  .00003428  00000+0  27689-2 0  9998
2 34040  73.9590 352.0900 0344466  23.0369 338.5778 13.66401763782460
COSMOS 2251 DEB         
1 34045U 93036JG  24321.27115833  .00000481  00000+0  18182-3 0  9994
2 34045  74.0375 306.9522 0025458 129.9770 242.2105 14.33742117824227
COSMOS 2251 DEB         
1 34046U 93036JH  24322.12370529  .00007150  00000+0  21113-2 0  9992
2 34046  74.0421  17.1598 0084036 200.3227 180.3534 14.41628441822073
COSMOS 2251 DEB         
1 34050U 93036JM  24321.81753913  .00001252  00000+0  77803-3 0  9999
2 34050  74.0876 319.9988 0217662 118.9752 306.4485 13.94915377799992
COSMOS 2251 DEB         
1 34053U 93036JQ  24321.61659518  .00000768  00000+0  72764-3 0  9998
2 34053  73.8423 152.1623 0425765   5.9584 354.6356 13.48467326774435
COSMOS 2251 DEB         
1 34054U 93036JR  24322.06086380  .00038442  00000+0  33929-2 0  9999
2 34054  74.0216 303.3957 0010461 159.0021 266.7870 14.96164194836387
COSMOS 2251 DEB         
1 34056U 93036JT  24321.43623153  .00005111  00000+0  23536-2 0  9996
2 34056  74.0634  54.1555 0130382 198.4447 244.2151 14.16926960808787
COSMOS 2251 DEB         
1 34057U 93036JU  24321.84452843  .00047075  00000+0  48408-2 0  9998
2 34057  74.0217 351.4364 0014804 233.6159 299.3647 14.90003303834462
COSMOS 2251 DEB         
1 34058U 93036JV  24321.50784394  .00001473  00000+0  13637-2 0  9999
2 34058  73.9348  91.9588 0377219 161.4093 281.4745 13.55427531778536
COSMOS 2251 DEB         
1 34059U 93036JW  24322.10794437  .00004547  00000+0  11997-2 0  9998
2 34059  74.0404 201.1722 0018457  13.8630 136.3296 14.49128818827927
COSMOS 2251 DEB         
1 34061U 93036JY  24321.29190756  .00002269  00000+0  74116-3 0  9996
2 34061  74.0397 266.2904 0018908  82.9025  67.2909 14.39055785825462
COSMOS 2251 DEB         
1 34062U 93036JZ  24321.72609078  .00014038  00000+0  24788-2 0  9993
2 34062  74.0326 178.6018 0095263 357.9343  68.0716 14.64509383828446
COSMOS 2251 DEB         
1 34064U 93036KB  24321.33095692  .00003514  00000+0  11139-2 0  9996
2 34064  74.0329 275.9518 0020345  81.3214  69.6836 14.40308444825166
COSMOS 2251 DEB         
1 34065U 93036KC  24321.30625418  .00001061  00000+0  36326-3 0  9990
2 34065  74.0354 258.8068 0015139  97.3653  57.2496 14.37425409825795
COSMOS 2251 DEB         
1 34070U 93036KH  24321.61899007  .00013705  00000+0  26634-2 0  9995
2 34070  74.0043 156.5929 0025586   7.5627  49.1059 14.62968444828761
COSMOS 2251 DEB         
1 34114U 93036KK  24321.33610811  .00016897  00000+0  45699-2 0  9994
2 34114  74.0639  60.2636 0051561 159.0228 256.7974 14.46951121821221
COSMOS 2251 DEB         
1 34115U 93036KL  24321.31138047  .00013062  00000+0  21252-2 0  9999
2 34115  74.0101 288.6683 0036267 216.3789 143.4918 14.70654598836567
COSMOS 2251 DEB         
1 34116U 93036KM  24321.40840297  .00005207  00000+0  13735-2 0  9996
2 34116  74.0433 198.9216 0011524   8.8365 164.5275 14.49160396828244
COSMOS 2251 DEB         
1 34117U 93036KN  24321.80500586  .00003267  00000+0  10755-2 0  9998
2 34117  74.0410 344.8537 0056986 161.0972 199.2316 14.37649489825278
COSMOS 2251 DEB         
1 34118U 93036KP  24321.22738781  .00024016  00000+0  32761-2 0  9991
2 34118  73.9586 310.4152 0088200 236.8962 134.0292 14.75871712833656
COSMOS 2251 DEB         
1 34120U 93036KR  24321.68638567  .00000836  00000+0  52381-3 0  9990
2 34120  73.9912 173.2629 0183529  86.4264 337.0166 13.98004513805295
COSMOS 2251 DEB         
1 34121U 93036KS  24321.52136097  .00002925  00000+0  18995-2 0  9998
2 34121  73.9963  46.2686 0245649 335.7677  34.3435 13.89340584797066
COSMOS 2251 DEB         
1 34122U 93036KT  24321.94192233  .00009118  00000+0  18885-2 0  9998
2 34122  74.0373 146.5574 0095184 143.4388 339.3328 14.57510762829815
COSMOS 2251 DEB         
1 34126U 93036KX  24322.08891155  .00060039  00000+0  31869-2 0  9993
2 34126  73.9899  56.8513 0037259 341.2109  77.4287 15.14429666843810
COSMOS 2251 DEB         
1 34127U 93036KY  24321.61193073  .00007494  00000+0  29042-2 0  9992
2 34127  74.1837  27.7556 0126609 335.4510 147.9135 14.25817550812173
COSMOS 2251 DEB         
1 34128U 93036KZ  24322.10151998  .00021318  00000+0  29036-2 0  9992
2 34128  74.0097 358.7065 0045079 226.8207 163.7411 14.77948894833843
COSMOS 2251 DEB         
1 34129U 93036LA  24321.57783262  .00012140  00000+0  21504-2 0  9993
2 34129  74.0418  19.8007 0037794 209.8161 150.0856 14.66890412833726
COSMOS 2251 DEB         
1 34136U 93036LH  24321.78573128  .00005854  00000+0  79975-3 0  9992
2 34136  74.0209  91.2088 0094541 313.5366 117.8726 14.75723462842624
COSMOS 2251 DEB         
1 34139U 93036LL  24321.89824543  .00008010  00000+0  19946-2 0  9995
2 34139  74.0332 274.7163 0044786  85.2788 338.8974 14.51213967824777
COSMOS 2251 DEB         
1 34141U 93036LN  24322.18578578  .00009032  00000+0  26727-2 0  9995
2 34141  74.0152  38.9061 0056953 222.6957 164.1426 14.42577088820473
COSMOS 2251 DEB         
1 34270U 93036LQ  24321.44700395  .00003333  00000+0  66880-3 0  9993
2 34270  74.0126 338.4955 0053786 230.7862 128.8523 14.61200231833713
COSMOS 2251 DEB         
1 34271U 93036LR  24322.19056911  .00013309  00000+0  28586-2 0  9999
2 34271  74.0271 231.1506 0020988  18.7866 131.4395 14.58479435825226
COSMOS 2251 DEB         
1 34273U 93036LT  24321.70516840  .00007318  00000+0  16619-2 0  9996
2 34273  74.0367 112.3193 0016350 332.1048  39.5195 14.56085057829354
COSMOS 2251 DEB         
1 34274U 93036LU  24321.78563031  .00009434  00000+0  20411-2 0  9995
2 34274  74.0062  98.1296 0026089 339.6205 135.8985 14.58138878829730
COSMOS 2251 DEB         
1 34275U 93036LV  24321.43991748  .00070673  00000+0  73201-2 0  9996
2 34275  74.0188  81.4305 0008340   3.9185 356.2060 14.89618197830572
COSMOS 2251 DEB         
1 34276U 93036LW  24321.67982043  .00005717  00000+0  13745-2 0  9995
2 34276  74.0240 106.7737 0024384 346.4841  25.1638 14.53379963829209
COSMOS 2251 DEB         
1 34297U 93036MT  24322.18301458  .00000699  00000+0  24866-3 0  9991
2 34297  74.0473 281.1407 0015900  90.7474 281.4192 14.36112865824863
COSMOS 2251 DEB         
1 34299U 93036MV  24321.42261597  .00039563  00000+0  36099-2 0  9990
2 34299  74.0122  68.5082 0121743 262.4608  96.2730 14.89353588831070
COSMOS 2251 DEB         
1 34300U 93036MW  24322.13178987  .00045255  00000+0  40664-2 0  9990
2 34300  74.0046 105.5169 0063867 310.8361  48.7294 14.93891086829903
COSMOS 2251 DEB         
1 34301U 93036MX  24321.19813109  .00024876  00000+0  45730-2 0  9993
2 34301  74.0141 213.1990 0016549  12.2336 147.6298 14.65468394826279
COSMOS 2251 DEB         
1 34302U 93036MY  24320.71030950  .00004322  00000+0  14373-2 0  9999
2 34302  74.1792 119.2819 0082656  85.3067 287.5507 14.36020217820865
COSMOS 2251 DEB         
1 34303U 93036MZ  24321.40685846  .00008705  00000+0  20373-2 0  9993
2 34303  74.0077 306.0540 0151683 180.2438 298.2097 14.47870632823022
COSMOS 2251 DEB         
1 34304U 93036NA  24321.73160416  .00003945  00000+0  12963-2 0  9998
2 34304  74.0141 121.3273 0137918 351.8682  19.0963 14.33327613817034
COSMOS 2251 DEB         
1 34307U 93036ND  24321.91830054  .00001420  00000+0  13087-2 0  9997
2 34307  74.0549 219.6742 0395733 135.2356 351.7006 13.53192267775880
COSMOS 2251 DEB         
1 34313U 93036NK  24321.57751395  .00030297  00000+0  39161-2 0  9991
2 34313  73.9935  19.1443 0035075 270.3506  89.3651 14.80358865832190
COSMOS 2251 DEB         
1 34314U 93036NL  24322.15181634  .00001855  00000+0  90183-3 0  9990
2 34314  74.0059 284.6958 0105042 121.0807 252.8956 14.16075690811393
COSMOS 2251 DEB         
1 34316U 93036NN  24321.24561167  .00015248  00000+0  22785-2 0  9997
2 34316  74.0736  31.0928 0012576 263.7171  96.2570 14.74709550834036
COSMOS 2251 DEB         
1 34317U 93036NP  24321.46057602  .00000983  00000+0  85369-3 0  9994
2 34317  73.9240 319.5203 0338356  22.8268 128.4624 13.64174276783213
COSMOS 2251 DEB         
1 34321U 93036NT  24321.71421807  .00003074  00000+0  84236-3 0  9995
2 34321  74.0290 169.6931 0015217  34.1049  34.6775 14.47494084828431
COSMOS 2251 DEB         
1 34323U 93036NV  24321.68848368  .00012788  00000+0  24756-2 0  9990
2 34323  73.9582 163.0440 0076213 299.0200 130.2686 14.61504336827196
COSMOS 2251 DEB         
1 34325U 93036NX  24321.81128694  .00005039  00000+0  28199-2 0  9996
2 34325  73.8721 160.1532 0198504 251.4315 118.8488 14.01507450800679
COSMOS 2251 DEB         
1 34327U 93036NZ  24321.50601839  .00015692  00000+0  21913-2 0  9994
2 34327  74.0013 228.5604 0040666 146.3158  26.8051 14.77083433837698
COSMOS 2251 DEB         
1 34330U 93036PC  24321.49528847  .00236739  00000+0  10457-1 0  9990
2 34330  74.0006 335.4755 0009324 311.2837 206.7999 15.20555213834924
COSMOS 2251 DEB         
1 34340U 93036PN  24321.27384618  .00003641  00000+0  26716-2 0  9993
2 34340  74.0785 241.1671 0289728  80.4308  80.1635 13.77970086788721
COSMOS 2251 DEB         
1 34342U 93036PQ  24322.10835127  .00037917  00000+0  25404-2 0  9990
2 34342  74.1605 230.0416 0050979 290.7760 181.6958 15.05633148841803
COSMOS 2251 DEB         
1 34343U 93036PR  24321.54018469  .00013483  00000+0  27779-2 0  9999
2 34343  74.0221 123.1637 0025465 136.1494 286.3837 14.60319907830185
COSMOS 2251 DEB         
1 34344U 93036PS  24321.41032802  .00005239  00000+0  25220-2 0  9992
2 34344  73.9772  86.7746 0163982 356.9056  58.4699 14.12194823805623
COSMOS 2251 DEB         
1 34346U 93036PU  24320.93883211  .00002743  00000+0  16172-2 0  9991
2 34346  73.9955 270.9228 0214910 175.6511 255.1115 13.97454608799320
COSMOS 2251 DEB         
1 34383U 93036PY  24321.59346986  .00026680  00000+0  35510-2 0  9991
2 34383  74.0313   4.8476 0011768 274.9553 212.3000 14.79542131832949
COSMOS 2251 DEB         
1 34386U 93036QB  24321.96177765  .00232148  00000+0  92109-2 0  9997
2 34386  74.0019  29.7469 0021792 334.8651 198.4124 15.24069773831639
COSMOS 2251 DEB         
1 34387U 93036QC  24321.16075681  .00003133  00000+0  94661-3 0  9990
2 34387  74.0425 218.9798 0037887  53.3417  96.6790 14.42395608825328
COSMOS 2251 DEB         
1 34388U 93036QD  24321.79766895  .00005073  00000+0  14288-2 0  9995
2 34388  74.0418 234.5762 0012843  14.7770  50.0678 14.46010884825002
COSMOS 2251 DEB         
1 34389U 93036QE  24321.27989949  .00002606  00000+0  83276-3 0  9999
2 34389  74.0199 254.8527 0028221 105.1133  46.6929 14.39926527823749
COSMOS 2251 DEB         
1 34390U 93036QF  24321.48098682  .00038142  00000+0  39132-2 0  9994
2 34390  74.0799 343.7941 0038470  60.9815  67.6634 14.89683095834166
COSMOS 2251 DEB         
1 34396U 93036QM  24321.61539257  .00012510  00000+0  24884-2 0  9992
2 34396  74.0332 160.9834 0008921 307.1694 109.0461 14.62115451826622
COSMOS 2251 DEB         
1 34400U 93036QR  24321.48961142  .00033170  00000+0  29638-2 0  9992
2 34400  73.9926 121.0070 0041203  16.3774 343.8730 14.95102338840464
COSMOS 2251 DEB         
1 34401U 93036QS  24321.47462355  .00067194  00000+0  54537-2 0  9993
2 34401  74.0313 339.7532 0019642 138.9733 335.5359 14.99134946835245
COSMOS 2251 DEB         
1 34409U 93036RA  24321.30064456  .00001516  00000+0  33007-3 0  9999
2 34409  74.0637 329.6216 0080853 147.5854 224.8059 14.56835304834909
COSMOS 2251 DEB         
1 34410U 93036RB  24321.85929523  .00025193  00000+0  25821-2 0  9997
2 34410  73.7581 353.8397 0045708 273.4051 260.2574 14.89590004839948
COSMOS 2251 DEB         
1 34412U 93036RD  24321.03204825  .00008316  00000+0  19938-2 0  9990
2 34412  73.9502 338.3032 0202185 162.2941 198.5400 14.41869718819944
COSMOS 2251 DEB         
1 34413U 93036RE  24321.27196010  .00006661  00000+0  27160-2 0  9990
2 34413  74.0323 253.8197 0093274  64.8633  85.7958 14.25210999815453
COSMOS 2251 DEB         
1 34420U 93036RM  24321.27458147  .00001648  00000+0  27587-3 0  9994
2 34420  74.0320 140.3704 0108364   0.6489  54.2703 14.66875015840274
COSMOS 2251 DEB         
1 34425U 93036RS  24321.74625137  .00009229  00000+0  20195-2 0  9996
2 34425  74.0246  81.6338 0028299 302.7524  57.0913 14.57587969830484
COSMOS 2251 DEB         
1 34428U 93036RV  24321.39059132  .00075632  00000+0  67192-2 0  9995
2 34428  74.0217  51.0082 0012828 258.9836 176.3111 14.95659583831717
COSMOS 2251 DEB         
1 34429U 93036RW  24321.90177147  .00025116  00000+0  27465-2 0  9991
2 34429  73.9987 254.1037 0028350 147.6701 272.9930 14.87454583836607
COSMOS 2251 DEB         
1 34430U 93036RX  24322.10946886  .00001825  00000+0  59789-3 0  9996
2 34430  74.0515 303.2891 0060293 112.4818 248.2735 14.38096665823641
COSMOS 2251 DEB         
1 34431U 93036RY  24321.02536613  .00002853  00000+0  11527-2 0  9999
2 34431  74.0755 163.3367 0070363 246.9476 112.4243 14.26982737815517
COSMOS 2251 DEB         
1 34432U 93036RZ  24321.07309788  .00005119  00000+0  29279-2 0  9997
2 34432  73.8314  71.5980 0186803 223.9009 311.1116 14.01391987801944
COSMOS 2251 DEB         
1 34433U 93036SA  24320.86555682  .00005147  00000+0  26247-2 0  9993
2 34433  74.0172 127.1655 0160601 352.5615   7.3141 14.09494803804211
COSMOS 2251 DEB         
1 34434U 93036SB  24321.47562648  .00004957  00000+0  31684-2 0  9991
2 34434  74.0626 312.6325 0296488 180.6696 342.6832 13.84300676785679
COSMOS 2251 DEB         
1 34442U 93036SK  24321.75577466  .00046791  00000+0  33963-2 0  9999
2 34442  74.0004 134.1161 0036073   6.5117 353.6532 15.03134979840494
COSMOS 2251 DEB         
1 34446U 93036SP  24321.37347447  .00001180  00000+0  31565-3 0  9995
2 34446  74.0420  70.8355 0052588 304.9645  54.6582 14.48646124830525
COSMOS 2251 DEB         
1 34449U 93036SS  24321.44930288  .00026499  00000+0  41662-2 0  9995
2 34449  74.0399 125.1411 0039918 281.1139 109.0960 14.71911344828916
COSMOS 2251 DEB         
1 34451U 93036SU  24321.92708514  .00018220  00000+0  28728-2 0  9997
2 34451  74.0535 141.2279 0039382 279.0006  80.6710 14.71877066828678
COSMOS 2251 DEB         
1 34452U 93036SV  24321.95678521  .00014130  00000+0  11065-2 0  9997
2 34452  74.0401 263.3980 0082283  86.4972 342.2282 14.98340842848361
COSMOS 2251 DEB         
1 34453U 93036SW  24321.72068382  .00024069  00000+0  31868-2 0  9996
2 34453  74.1560 175.4650 0035443 139.5263 331.6175 14.79388544830291
COSMOS 2251 DEB         
1 34454U 93036SX  24322.12410286  .00001303  00000+0  43703-3 0  9994
2 34454  74.0580 276.5590 0034120  78.7466 281.7519 14.37907087824641
COSMOS 2251 DEB         
1 34457U 93036TA  24321.67441154  .00055500  00000+0  37425-2 0  9995
2 34457  73.9842 176.2253 0048833  50.5875  10.4783 15.05383650838569
COSMOS 2251 DEB         
1 34458U 93036TB  24321.44389198  .00164215  00000+0  94918-2 0  9994
2 34458  74.0093  57.8496 0015312 341.2601 146.8779 15.11354569831236
COSMOS 2251 DEB         
1 34459U 93036TC  24321.44558287  .00001587  00000+0  93900-3 0  9995
2 34459  74.0796 209.9255 0192655  13.9195 346.7142 13.99641529802442
COSMOS 2251 DEB         
1 34464U 93036TH  24321.36566497  .00026026  00000+0  25883-2 0  9993
2 34464  74.0098 163.4532 0035473  61.0028 354.3800 14.91098688839584
COSMOS 2251 DEB         
1 34465U 93036TJ  24321.68930473  .00514140  00000+0  13329-1 0  9998
2 34465  74.0354  49.3866 0006361 340.9090  19.1876 15.36835870832421
COSMOS 2251 DEB         
1 34468U 93036TM  24321.46529400  .00001756  00000+0  48072-3 0  9990
2 34468  74.0124 129.4799 0077000   8.3183 351.9230 14.46202280828520
COSMOS 2251 DEB         
1 34472U 93036TR  24321.42709900  .00006143  00000+0  48028-2 0  9991
2 34472  74.0864  20.9911 0337535 241.9846 114.6749 13.68828978784172
COSMOS 2251 DEB         
1 34473U 93036TS  24321.82657331  .00044533  00000+0  50524-2 0  9995
2 34473  74.0139 117.3717 0004103 231.9100 249.3452 14.86098187830268
COSMOS 2251 DEB         
1 34474U 93036TT  24321.24737648  .00004865  00000+0  26153-2 0  9997
2 34474  74.0775 287.9003 0205467  97.9040 325.4599 14.02912957800113
COSMOS 2251 DEB         
1 34476U 93036TV  24321.17434687  .00012192  00000+0  81992-2 0  9992
2 34476  74.0081  19.6100 0340509 322.7371  35.0550 13.76097924782383
COSMOS 2251 DEB         
1 34477U 93036TW  24321.17237733  .00005312  00000+0  12422-2 0  9994
2 34477  73.9797  93.5158 0081499  11.7262  42.1617 14.52855536829307
COSMOS 2251 DEB         
1 34478U 93036TX  24321.38570812  .00030831  00000+0  40156-2 0  9995
2 34478  74.0536  73.0587 0068042  28.2827  46.0458 14.78835642831986
COSMOS 2251 DEB         
1 34481U 93036UA  24322.06271649  .00002683  00000+0  10098-2 0  9997
2 34481  73.9827  48.1346 0074245 309.4697 107.0890 14.30469517819063
COSMOS 2251 DEB         
1 34482U 93036UB  24321.88340083  .00014431  00000+0  31253-2 0  9996
2 34482  74.0422 253.6585 0052532  52.8452   4.3052 14.57355003825179
COSMOS 2251 DEB         
1 34544U 93036UE  24320.91363135  .00002324  00000+0  21585-2 0  9996
2 34544  73.9147 118.0114 0386669 218.9400 299.5582 13.53820289775775
COSMOS 2251 DEB         
1 34546U 93036UG  24321.65968145  .00004449  00000+0  13396-2 0  9993
2 34546  74.0330 256.9777 0020252  68.3931   1.1550 14.42743311824236
COSMOS 2251 DEB         
1 34547U 93036UH  24320.77096806  .00014185  00000+0  28240-2 0  9994
2 34547  74.0472 137.8049 0023843 317.1455  42.7853 14.61895548827723
COSMOS 2251 DEB         
1 34550U 93036UL  24321.66696160  .00219776  00000+0  14393-1 0  9992
2 34550  73.9583  58.1248 0075686 330.5651  29.1284 15.04307158817159
COSMOS 2251 DEB         
1 34552U 93036UN  24322.16480597  .00190608  00000+0  91997-2 0  9993
2 34552  74.0049 104.3211 0009506 344.3086 188.9328 15.17697422828310
COSMOS 2251 DEB         
1 34553U 93036UP  24321.18256029  .00008695  00000+0  21622-2 0  9998
2 34553  74.0284 213.5778 0020345  25.8415  99.9082 14.51746722824010
COSMOS 2251 DEB         
1 34554U 93036UQ  24320.94838487  .00002428  00000+0  82915-3 0  9997
2 34554  74.0382 299.8097 0021645 102.9215 288.6829 14.36777080821264
COSMOS 2251 DEB         
1 34556U 93036US  24321.65364306  .00013969  00000+0  26898-2 0  9991
2 34556  74.0209 165.2125 0011530 326.1100  98.2144 14.63548850826257
COSMOS 2251 DEB         
1 34560U 93036UW  24321.67718946  .00012619  00000+0  25944-2 0  9993
2 34560  74.0214 177.2134 0018583 355.7455  61.3909 14.60527578825707
COSMOS 2251 DEB         
1 34561U 93036UX  24322.09985456  .00121334  00000+0  60660-2 0  9992
2 34561  74.0047 341.0429 0005129 268.4808  91.5800 15.16824905832130
COSMOS 2251 DEB         
1 34563U 93036UZ  24321.13132510  .00004104  00000+0  11975-2 0  9993
2 34563  74.0400 213.7400 0012493  43.9075  79.0731 14.44373349825387
COSMOS 2251 DEB         
1 34564U 93036VA  24321.25383285  .00001751  00000+0  56752-3 0  9992
2 34564  74.0343 241.7755 0017602  85.0677  71.9086 14.39625379823705
COSMOS 2251 DEB         
1 34567U 93036VD  24321.91046111  .00000754  00000+0  33357-3 0  9990
2 34567  74.0399 139.8939 0075116 307.0633 168.8006 14.23421902816623
COSMOS 2251 DEB         
1 34569U 93036VF  24321.41374821  .00002351  00000+0  92676-3 0  9993
2 34569  73.9916 184.7519 0161129 102.6742 318.4464 14.22801004814129
COSMOS 2251 DEB         
1 34570U 93036VG  24321.06837234  .00001940  00000+0  11680-2 0  9996
2 34570  73.9590 178.8387 0193744 143.8059   8.2557 13.98482372801221
COSMOS 2251 DEB         
1 34571U 93036VH  24321.07508767  .00015091  00000+0  46970-2 0  9996
2 34571  74.0444 191.2959 0076084 324.0262  35.5783 14.39287612816385
COSMOS 2251 DEB         
1 34572U 93036VJ  24319.51450550  .00011551  00000+0  34920-2 0  9998
2 34572  74.0130 130.0958 0074907 299.4521 121.6841 14.40807807816954
COSMOS 2251 DEB         
1 34574U 93036VL  24321.78208330  .00013511  00000+0  25076-2 0  9999
2 34574  74.0725  76.4842 0075873 204.1473 281.4832 14.63385649830516
COSMOS 2251 DEB         
1 34576U 93036VN  24321.27751473  .00004987  00000+0  12549-2 0  9994
2 34576  74.0348 157.7119 0007576  27.7787  86.6665 14.51435078827784
COSMOS 2251 DEB         
1 34577U 93036VP  24322.10763848  .00028851  00000+0  29168-2 0  9998
2 34577  74.0284 258.7480 0019654 144.2238 216.0265 14.90749021836451
COSMOS 2251 DEB         
1 34579U 93036VR  24321.56670243  .00003146  00000+0  93543-3 0  9994
2 34579  74.0552 231.1557 0026286  37.5096  25.3599 14.43388157825508
COSMOS 2251 DEB         
1 34582U 93036VU  24321.58164473  .00003620  00000+0  11210-2 0  9990
2 34582  74.0196 278.5025 0048982 126.4622 234.1063 14.40856005823087
COSMOS 2251 DEB         
1 34588U 93036WA  24321.66326326  .00002999  00000+0  95407-3 0  9991
2 34588  74.0434 271.9954 0017131  62.8453 351.8967 14.40224532823391
COSMOS 2251 DEB         
1 34589U 93036WB  24322.10580292  .00000992  00000+0  70001-3 0  9990
2 34589  73.9267   1.1675 0253370  21.1064   8.7990 13.84976631794022
COSMOS 2251 DEB         
1 34590U 93036WC  24321.12710969  .00001354  00000+0  31714-3 0  9990
2 34590  74.0444 342.9479 0070899 212.9054 204.5690 14.54059107834276
COSMOS 2251 DEB         
1 34609U 93036WE  24320.48572333  .00002812  00000+0  12088-2 0  9992
2 34609  73.7338 102.4205 0149104  24.4014  43.3550 14.19349403810617
COSMOS 2251 DEB         
1 34610U 93036WF  24320.46163201  .00004865  00000+0  26452-2 0  9992
2 34610  74.0215 228.5479 0187714  88.9224 273.3410 14.03937625800483
COSMOS 2251 DEB         
1 34611U 93036WG  24320.27595200  .00009142  00000+0  18624-2 0  9995
2 34611  74.0550 135.4130 0027855 283.2380 134.5544 14.60875132826423
COSMOS 2251 DEB         
1 34613U 93036WJ  24319.91231554  .00005382  00000+0  22600-2 0  9996
2 34613  73.9653 269.6754 0119038 188.8416 231.0483 14.22342631809061
COSMOS 2251 DEB         
1 34614U 93036WK  24322.05950564  .00012460  00000+0  60868-2 0  9998
2 34614  73.8808 321.8937 0215915  32.2586  23.9132 14.06603661793176
COSMOS 2251 DEB         
1 34615U 93036WL  24321.42401255  .00001024  00000+0  96717-3 0  9994
2 34615  74.0045 201.2845 0402472 188.5254 346.5825 13.51389681775260
COSMOS 2251 DEB         
1 34619U 93036WQ  24320.73011756  .00003403  00000+0  62794-3 0  9995
2 34619  74.0469 232.3053 0095050  68.2617 292.8634 14.62964756835620
COSMOS 2251 DEB         
1 34620U 93036WR  24321.14573111  .00023629  00000+0  73044-2 0  9992
2 34620  74.0566 227.5745 0092188   1.6851 358.4595 14.38758524811732
COSMOS 2251 DEB         
1 34622U 93036WT  24321.95956309  .00003075  00000+0  13819-2 0  9994
2 34622  74.0417 286.9432 0108491 104.4156 314.3363 14.19681960809195
COSMOS 2251 DEB         
1 34626U 93036WX  24321.45421465  .00008774  00000+0  15946-2 0  9997
2 34626  74.0527   1.1697 0030201 201.1127 273.9798 14.65984411834094
COSMOS 2251 DEB         
1 34634U 93036XF  24321.69875100  .00003500  00000+0  83019-3 0  9990
2 34634  74.0551  54.2224 0048117 261.4518 249.4847 14.53655984831663
COSMOS 2251 DEB         
1 34635U 93036XG  24321.46556678  .00012830  00000+0  26082-2 0  9994
2 34635  74.0473 102.6878 0034772 274.6506 153.9992 14.60763566829611
COSMOS 2251 DEB         
1 34637U 93036XJ  24321.92968240  .00005672  00000+0  12849-2 0  9991
2 34637  74.0495 123.9115 0055618 294.0451 188.2651 14.55388773828905
COSMOS 2251 DEB         
1 34641U 93036XN  24321.47664191  .00007902  00000+0  21373-2 0  9994
2 34641  73.8392 105.4278 0018133 101.0385 325.9714 14.47801455825985
COSMOS 2251 DEB         
1 34642U 93036XP  24321.98746745  .00002418  00000+0  14492-2 0  9998
2 34642  74.0047 295.3723 0216102 201.4289 219.7702 13.96579672798795
COSMOS 2251 DEB         
1 34671U 93036XR  24321.02063326  .00013969  00000+0  30378-2 0  9996
2 34671  74.0296 165.4925 0013669 340.4475 170.5143 14.57980888825694
COSMOS 2251 DEB         
1 34672U 93036XS  24320.72028062  .00001659  00000+0  58359-3 0  9994
2 34672  74.0334 305.3852 0022841 117.9922  55.2818 14.35523896595508
COSMOS 2251 DEB         
1 34674U 93036XU  24322.07315386  .00099471  00000+0  42846-2 0  9996
2 34674  73.9581 196.0055 0041384 221.1553 138.6523 15.21327191835921
COSMOS 2251 DEB         
1 34675U 93036XV  24292.88779543  .00113581  00000+0  10164-1 0  9997
2 34675  74.0163  99.6744 0007218 253.9171 106.1218 14.95195479825797
COSMOS 2251 DEB         
1 34678U 93036XY  24321.26796788  .00000114  00000+0  54036-4 0  9991
2 34678  74.0381 357.3399 0024703 144.8858 335.5883 14.29968551817838
COSMOS 2251 DEB         
1 34680U 93036YA  24321.28635873  .00007077  00000+0  16496-2 0  9994
2 34680  74.0440 154.2153 0007519 344.2910 188.9419 14.54938664826228
COSMOS 2251 DEB         
1 34681U 93036YB  24321.49016485  .00012865  00000+0  20083-2 0  9998
2 34681  74.0674 337.6247 0026684 146.5404 333.6938 14.72662586835035
COSMOS 2251 DEB         
1 34682U 93036YC  24321.66306223  .00006213  00000+0  14514-2 0  9992
2 34682  74.0396 105.5772 0020451 333.0468  38.2382 14.54762547829897
COSMOS 2251 DEB         
1 34683U 93036YD  24321.44961539  .00008573  00000+0  18739-2 0  9990
2 34683  74.0299 120.9755 0021871 329.9329  60.5290 14.57751100826887
COSMOS 2251 DEB         
1 34685U 93036YF  24321.41548271  .00006124  00000+0  15030-2 0  9994
2 34685  74.0309 170.1505 0014962   9.0837  57.5762 14.52508293828918
COSMOS 2251 DEB         
1 34689U 93036YK  24321.63834192  .00009157  00000+0  50705-2 0  9999
2 34689  74.1060 179.8320 0247674 344.4612  75.6888 13.97029915789501
COSMOS 2251 DEB         
1 34721U 93036YP  24321.61017657  .00005212  00000+0  31690-2 0  9993
2 34721  73.9229 283.5300 0228899 300.1304 175.8529 13.94290438796924
COSMOS 2251 DEB         
1 34722U 93036YQ  24321.68687583  .00003922  00000+0  19340-2 0  9996
2 34722  73.8894 312.3164 0173725 313.2414 164.2764 14.10277612807288
COSMOS 2251 DEB         
1 34724U 93036YS  24294.92217639  .00180548  00000+0  23069-1 0  9997
2 34724  74.0117 247.6937 0076607 100.6908 260.2906 14.78318821795548
COSMOS 2251 DEB         
1 34726U 93036YU  24321.15150036  .00004866  00000+0  10764-2 0  9999
2 34726  74.0312  11.8720 0047302 260.9517  98.6292 14.56799535827946
COSMOS 2251 DEB         
1 34728U 93036YW  24320.64100771  .00007909  00000+0  14318-2 0  9995
2 34728  74.0187 291.1076 0045948 191.6585 168.3525 14.65790317831234
COSMOS 2251 DEB         
1 34729U 93036YX  24321.27563569  .00019656  00000+0  33209-2 0  9996
2 34729  74.0249  45.7898 0022258 278.0572 142.3999 14.69195395826818
COSMOS 2251 DEB         
1 34732U 93036ZA  24321.15550109  .00001138  00000+0  31963-3 0  9995
2 34732  74.0443 104.5783 0040053 351.4061 181.8862 14.46654573824792
COSMOS 2251 DEB         
1 34736U 93036ZE  24322.17924457  .00033497  00000+0  45608-2 0  9996
2 34736  74.0215 113.5796 0004425 292.6261 240.8864 14.78566362826162
COSMOS 2251 DEB         
1 34738U 93036ZG  24321.95758988  .00001413  00000+0  40799-3 0  9997
2 34738  74.0148 152.9137 0046961  33.2775  90.0581 14.44897195822391
COSMOS 2251 DEB         
1 34750U 93036ZU  24321.17578411  .00013258  00000+0  30493-2 0  9995
2 34750  74.1129 223.8205 0044666 281.4488 229.3463 14.54834497825225
COSMOS 2251 DEB         
1 34752U 93036ZW  24321.57432264  .00016941  00000+0  18113-2 0  9993
2 34752  74.0176  68.9182 0066044 301.4918  57.9819 14.87126812840122
COSMOS 2251 DEB         
1 34754U 93036ZY  24321.22600934  .00001484  00000+0  48108-3 0  9992
2 34754  74.0322 231.3645 0028402  85.2785  68.9115 14.39602683824970
COSMOS 2251 DEB         
1 34755U 93036ZZ  24320.45078348  .00001157  00000+0  11107-2 0  9990
2 34755  73.9269 199.9581 0411049 292.7312 245.9122 13.49417912772292
COSMOS 2251 DEB         
1 34756U 93036AAA 24320.61347129  .00002416  00000+0  19592-2 0  9990
2 34756  74.0063  28.3492 0351977 346.0266  13.1294 13.65416493780652
COSMOS 2251 DEB         
1 34758U 93036AAC 24321.96636528  .00002551  00000+0  22259-2 0  9999
2 34758  74.1069 207.8920 0388165  61.8408 302.1347 13.56773109776464
COSMOS 2251 DEB         
1 34760U 93036AAE 24321.93856456  .00002186  00000+0  10262-2 0  9998
2 34760  74.0633 279.0971 0096305  67.4205 349.9343 14.18221933811770
COSMOS 2251 DEB         
1 34761U 93036AAF 24321.15594999  .00003129  00000+0  10811-2 0  9992
2 34761  74.0311   3.2763 0036594 137.0284 223.3738 14.35825626820248
COSMOS 2251 DEB         
1 34784U 93036AAM 24321.07543371  .00005849  00000+0  12582-2 0  9994
2 34784  74.0095 352.4247 0055233 258.1265 101.3702 14.57777478828219
COSMOS 2251 DEB         
1 34788U 93036AAR 24321.30606325  .00057113  00000+0  19864-2 0  9994
2 34788  73.9671  71.9554 0067805 295.4169  64.0023 15.27226797854480
COSMOS 2251 DEB         
1 34789U 93036AAS 24321.66053764  .00310679  00000+0  16599-1 0  9997
2 34789  74.1699 165.5922 0043809  89.4174 338.9628 15.12787547817840
COSMOS 2251 DEB         
1 34790U 93036AAT 24320.73655532  .00003463  00000+0  14774-2 0  9991
2 34790  74.0550 228.5186 0100787  25.4028   5.1784 14.22725448809946
COSMOS 2251 DEB         
1 34792U 93036AAV 24320.80317257  .00007766  00000+0  19633-2 0  9999
2 34792  74.0208 190.9613 0012293  18.6489 101.2847 14.51069043819543
COSMOS 2251 DEB         
1 34793U 93036AAW 24321.59311550  .00001416  00000+0  47289-3 0  9992
2 34793  74.0040 252.4955 0051219 141.1362 274.1785 14.37651326817582
COSMOS 2251 DEB         
1 34796U 93036AAZ 24321.20700406  .00005197  00000+0  13845-2 0  9995
2 34796  74.0342 228.7170 0103245  68.0837  86.8209 14.45569491823638
COSMOS 2251 DEB         
1 34797U 93036ABA 24319.40871073  .00008812  00000+0  28853-2 0  9996
2 34797  73.9787 109.4989 0081681 312.9802  46.4521 14.36673837817536
COSMOS 2251 DEB         
1 34813U 93036ABC 24320.20734748  .00008720  00000+0  77907-2 0  9994
2 34813  73.9340  41.9245 0453028 149.2953 213.5523 13.46276547763649
COSMOS 2251 DEB         
1 34814U 93036ABD 24320.30322404  .00005222  00000+0  18390-2 0  9993
2 34814  73.8965 331.7401 0060318 299.4409  71.8564 14.34055653817018
COSMOS 2251 DEB         
1 34815U 93036ABE 24321.70141357  .00009520  00000+0  14987-2 0  9998
2 34815  74.0445 285.6034 0062573  98.0005 262.8273 14.71271274829207
COSMOS 2251 DEB         
1 34816U 93036ABF 24320.27292003  .00003406  00000+0  30254-2 0  9997
2 34816  73.8920  62.9919 0376587 198.1436 192.8335 13.57310927774565
COSMOS 2251 DEB         
1 34818U 93036ABH 24321.39687977  .00001458  00000+0  50826-3 0  9994
2 34818  74.0353 296.0650 0023239 112.0505  40.4605 14.36076330817670
COSMOS 2251 DEB         
1 34819U 93036ABJ 24321.63866057  .00008230  00000+0  18596-2 0  9992
2 34819  74.0225 170.3251 0017461 358.7971  57.9539 14.56280319826367
COSMOS 2251 DEB         
1 34823U 93036ABN 24320.86833314  .00005293  00000+0  11146-2 0  9991
2 34823  74.0406 122.2772 0163372 305.3889  53.2101 14.51673312826881
COSMOS 2251 DEB         
1 34845U 93036ABP 24320.90823803  .00002135  00000+0  62244-3 0  9990
2 34845  74.0253 159.0816 0021166  55.9225 304.3937 14.44617516823271
COSMOS 2251 DEB         
1 34846U 93036ABQ 24322.05664831  .00004659  00000+0  13718-2 0  9997
2 34846  74.0326 270.5657 0024717  75.0369 285.3522 14.43753853817570
COSMOS 2251 DEB         
1 34847U 93036ABR 24320.16842315  .00071042  00000+0  24994-2 0  9991
2 34847  74.0108 113.5806 0049782 267.7951  91.7549 15.27806208621620
COSMOS 2251 DEB         
1 34852U 93036ABW 24321.57749780  .00000763  00000+0  26824-3 0  9992
2 34852  74.0322 262.1398 0015191 106.1177 254.1650 14.36539926819169
COSMOS 2251 DEB         
1 34854U 93036ABY 24322.02388093  .00005740  00000+0  89516-3 0  9998
2 34854  74.0319 201.5343 0070576  53.5402 307.2246 14.71447622833064
COSMOS 2251 DEB         
1 34856U 93036ACA 24321.60412323  .00015822  00000+0  17512-2 0  9995
2 34856  74.0024 156.5544 0051819  32.0710  24.1589 14.86359387832738
COSMOS 2251 DEB         
1 34857U 93036ACB 24321.48861365  .00005631  00000+0  12957-2 0  9991
2 34857  74.0172 130.3902 0072808 349.0770  41.5344 14.53990749822186
COSMOS 2251 DEB         
1 34859U 93036ACD 24321.22593913  .00027630  00000+0  37492-2 0  9990
2 34859  74.0371  48.8284 0012331 307.8734  80.9766 14.78712322825108
COSMOS 2251 DEB         
1 34861U 93036ACF 24322.19402985  .00018283  00000+0  26574-2 0  9991
2 34861  74.0208 111.6712 0010089 281.3085 251.5088 14.75885890822971
COSMOS 2251 DEB         
1 34874U 93036ACM 24321.01743147  .00007563  00000+0  26949-2 0  9998
2 34874  74.0415  71.6692 0053709 194.9228 285.2919 14.33571464814253
COSMOS 2251 DEB         
1 34875U 93036ACN 24321.68246406  .00002462  00000+0  68501-3 0  9992
2 34875  74.0449 169.8247 0015301  29.7743  38.0338 14.46864328821097
COSMOS 2251 DEB         
1 34878U 93036ACR 24320.38129782  .00002145  00000+0  21323-2 0  9996
2 34878  73.9646 309.4498 0438631   8.5388  56.9975 13.43210439760027
COSMOS 2251 DEB         
1 34882U 93036ACV 24321.87586772  .00001504  00000+0  30188-3 0  9990
2 34882  74.0487 252.2719 0083296 120.9155 240.0234 14.60413324831753
COSMOS 2251 DEB         
1 34883U 93036ACW 24319.26807033  .00014850  00000+0  46494-2 0  9991
2 34883  74.2070  67.5816 0124373   3.1914 357.0003 14.36294499809320
COSMOS 2251 DEB         
1 34884U 93036ACX 24321.47357667  .00025176  00000+0  41957-2 0  9993
2 34884  74.0235 108.1248 0009518 305.0674 111.0402 14.69879426820210
COSMOS 2251 DEB         
1 34885U 93036ACY 24321.77502858  .00004311  00000+0  11624-2 0  9997
2 34885  74.0332 197.4105 0014626  17.1313  48.7814 14.48141935818190
COSMOS 2251 DEB         
1 34886U 93036ACZ 24320.29118452  .00032654  00000+0  22915-2 0  9993
2 34886  73.9662 285.4791 0065363 207.9638 151.8034 15.03269888838627
COSMOS 2251 DEB         
1 34907U 93036ADC 24321.45647019  .00038464  00000+0  53977-2 0  9999
2 34907  74.0026 125.6699 0003666 288.3498 102.4866 14.77246472821917
COSMOS 2251 DEB         
1 34908U 93036ADD 24320.44309524  .00003410  00000+0  11861-2 0  9993
2 34908  74.0621  23.4915 0040261 141.6183 230.4406 14.35370913816467
COSMOS 2251 DEB         
1 34909U 93036ADE 24321.70429234  .00004792  00000+0  69518-3 0  9992
2 34909  74.0134 122.8650 0091234 356.5468   3.5062 14.73474067835999
COSMOS 2251 DEB         
1 34910U 93036ADF 24321.10750491  .00002056  00000+0  21161-2 0  9992
2 34910  73.8781 359.0449 0470506 184.8050 207.6992 13.36886347762891
COSMOS 2251 DEB         
1 34911U 93036ADG 24321.31167127  .00001284  00000+0  26983-3 0  9994
2 34911  74.0410 270.2571 0084140 136.9327  13.6074 14.58465456828780
COSMOS 2251 DEB         
1 34912U 93036ADH 24321.48036588  .00338750  00000+0  67624-2 0  9996
2 34912  74.1433 118.8263 0022890  87.7159 272.6672 15.45235718839283
COSMOS 2251 DEB         
1 34913U 93036ADJ 24321.63511426  .00000259  00000+0  10102-3 0  9993
2 34913  74.0273 279.1506 0020095 128.3421  44.9325 14.34454233818649
COSMOS 2251 DEB         
1 34914U 93036ADK 24320.88910161  .00112810  00000+0  58886-2 0  9996
2 34914  73.9800 178.8954 0078382 184.2080 175.8465 15.12717693832969
COSMOS 2251 DEB         
1 34918U 93036ADP 24319.77017542  .00010839  00000+0  26954-2 0  9996
2 34918  74.0735 338.2373 0037033  39.6542  75.7939 14.51407405596132
COSMOS 2251 DEB         
1 34920U 93036ADR 24321.61889112  .00068590  00000+0  73111-2 0  9999
2 34920  74.0113  83.2698 0005792 355.7988   4.3143 14.88482367825517
COSMOS 2251 DEB         
1 34924U 93036ADV 24321.71572384  .00006647  00000+0  15020-2 0  9994
2 34924  74.0410 112.8513 0060656 296.1079  75.3735 14.55287204820309
COSMOS 2251 DEB         
1 34944U 93036ADX 24320.13928061  .00002356  00000+0  10183-2 0  9996
2 34944  73.7495 219.3163 0225462 130.7095 231.3873 14.12235895585366
COSMOS 2251 DEB         
1 34946U 93036ADZ 24319.82983765  .00005257  00000+0  11142-2 0  9993
2 34946  74.0263  13.0161 0055059 249.5465 109.9783 14.58500019824735
COSMOS 2251 DEB         
1 34948U 93036AEB 24321.69988644  .00084007  00000+0  78145-2 0  9990
2 34948  74.0030 111.9132 0004124 313.9224  57.5011 14.93850922822898
COSMOS 2251 DEB         
1 34949U 93036AEC 24321.88230557  .00003315  00000+0  52305-3 0  9999
2 34949  74.0181 151.2116 0083819  34.9117 325.7510 14.70467314833748
COSMOS 2251 DEB         
1 34951U 93036AEE 24321.24726049  .00038248  00000+0  31422-2 0  9997
2 34951  74.0038 142.6375 0036254  16.9005 343.3379 14.98473917829111
COSMOS 2251 DEB         
1 34953U 93036AEG 24321.72553187  .00010102  00000+0  19199-2 0  9999
2 34953  74.0966  58.5853 0061976 158.6821 327.9549 14.62997818824684
COSMOS 2251 DEB         
1 34954U 93036AEH 24319.06674148  .00070229  00000+0  79326-2 0  9999
2 34954  73.9824  80.0226 0017925 331.5975  28.4225 14.86006473821637
COSMOS 2251 DEB         
1 34955U 93036AEJ 24317.75528998  .00012150  00000+0  11289-2 0  9998
2 34955  74.0404 324.3889 0088885 141.7870 218.9660 14.91413664841418
COSMOS 2251 DEB         
1 34958U 93036AEM 24321.08381847  .00065300  00000+0  25422-2 0  9991
2 34958  74.0063  86.0630 0076712 273.1336  86.1087 15.22937492842392
COSMOS 2251 DEB         
1 34962U 93036AER 24322.07612345  .00002304  00000+0  67406-3 0  9990
2 34962  74.0310 202.0497 0017623  51.7506 308.5234 14.44462667820658
COSMOS 2251 DEB         
1 34963U 93036AES 24320.53667379  .00008312  00000+0  23407-2 0  9994
2 34963  74.1758  51.4600 0048224 354.7996   5.2654 14.45253029811229
COSMOS 2251 DEB         
1 34964U 93036AET 24319.31310972  .00005000  00000+0  29172-2 0  9999
2 34964  73.9727 310.7622 0222729 253.1077 104.5528 13.97061358789768
COSMOS 2251 DEB         
1 34965U 93036AEU 24321.49389893  .00002018  00000+0  55709-3 0  9992
2 34965  74.0510 140.1479 0026252   3.8690 356.2667 14.47231193822456
COSMOS 2251 DEB         
1 34967U 93036AEW 24320.56458691  .00004883  00000+0  14962-2 0  9991
2 34967  73.9978 263.9889 0039985 146.3531 214.0176 14.41514215816224
COSMOS 2251 DEB         
1 34968U 93036AEX 24321.23495267  .00001409  00000+0  29463-3 0  9991
2 34968  74.0389 272.8414 0087124 134.1519 226.6853 14.58426137827681
COSMOS 2251 DEB         
1 34969U 93036AEY 24319.86260173  .00002135  00000+0  79252-3 0  9992
2 34969  74.0177  20.4661 0077132 246.2494 113.0553 14.31162898595144
COSMOS 2251 DEB         
1 34971U 93036AFA 24318.35159815  .00002500  00000+0  57348-3 0  9996
2 34971  73.9789 314.4189 0073231 272.3411 153.2575 14.54470825604362
COSMOS 2251 DEB         
1 34972U 93036AFB 24319.45290236  .00011654  00000+0  22710-2 0  9996
2 34972  73.9879  92.2093 0044172 344.1193  82.1835 14.62459037819789
COSMOS 2251 DEB         
1 34976U 93036AFF 24320.84502471  .00008323  00000+0  14123-2 0  9990
2 34976  74.0604 348.6851 0050220 142.0189  30.9782 14.68496375825031
COSMOS 2251 DEB         
1 34977U 93036AFG 24316.32476445  .01779482  00000+0  22710-1 0  9992
2 34977  73.9759  80.1545 0023780 332.1966  27.7976 15.55829063820355
COSMOS 2251 DEB         
1 34979U 93036AFJ 24321.41239448  .00011349  00000+0  18204-2 0  9994
2 34979  74.0418 312.1926 0053952 135.1759 225.3790 14.70761425824567
COSMOS 2251 DEB         
1 34989U 93036AFM 24322.09190630  .00028088  00000+0  31144-2 0  9995
2 34989  74.0084 323.3298 0015951 220.1377 139.8625 14.87069775822753
COSMOS 2251 DEB         
1 34990U 93036AFN 24320.52862496  .00003499  00000+0  11004-2 0  9991
2 34990  74.0461 257.5829 0014836  58.2502 302.0097 14.40756658818207
COSMOS 2251 DEB         
1 34997U 93036AFV 24320.73728717  .00011157  00000+0  33577-2 0  9997
2 34997  73.8816 326.1517 0104831  19.6540 340.8606 14.39502647650924
COSMOS 2251 DEB         
1 34998U 93036AFW 24320.37657277  .00003707  00000+0  10299-2 0  9998
2 34998  74.0117 175.7065 0020586  56.4458 117.5357 14.46698548817403
COSMOS 2251 DEB         
1 35000U 93036AFY 24320.35695420  .00045021  00000+0  46282-2 0  9999
2 35000  74.0271 294.3696 0038466 112.1089 248.4184 14.89558148825750
COSMOS 2251 DEB         
1 35012U 93036AFZ 24320.86818767  .00001082  00000+0  30651-3 0  9992
2 35012  74.0180 122.7463 0081602 357.1251   2.9425 14.44841274819008
COSMOS 2251 DEB         
1 35014U 93036AGB 24321.60137597  .00015250  00000+0  28951-2 0  9993
2 35014  73.9772  83.5507 0021749 302.1562  57.7495 14.64061203823704
COSMOS 2251 DEB         
1 35015U 93036AGC 24321.55864476  .00004954  00000+0  14287-2 0  9997
2 35015  73.9476 247.6029 0081232 204.8780 328.9799 14.43004021816536
COSMOS 2251 DEB         
1 35016U 93036AGD 24318.24081343  .00003799  00000+0  12798-2 0  9995
2 35016  73.9302 301.6587 0117922 302.4399  67.8440 14.33529836811398
COSMOS 2251 DEB         
1 35018U 93036AGF 24321.18430232  .00002194  00000+0  17825-2 0  9993
2 35018  73.9801  33.8760 0354219  22.2253 339.3788 13.65044517778384
COSMOS 2251 DEB         
1 35020U 93036AGH 24320.18761845  .00002227  00000+0  42715-3 0  9996
2 35020  74.0505 230.2860 0091680  86.4101 274.7545 14.61682235825005
COSMOS 2251 DEB         
1 35022U 93036AGK 24320.35293441  .00004485  00000+0  96323-3 0  9991
2 35022  74.0290 350.7303 0052002 287.4804  72.0680 14.58047444534184
COSMOS 2251 DEB         
1 35023U 93036AGL 24321.32227102  .00020586  00000+0  27239-2 0  9990
2 35023  74.0429 272.2686 0042822  95.4341  55.3498 14.79243469824757
COSMOS 2251 DEB         
1 35025U 93036AGN 24322.13111611  .00004589  00000+0  73627-3 0  9997
2 35025  73.9378 106.4604 0088297 110.0466 251.0237 14.69364736829601
COSMOS 2251 DEB         
1 35026U 93036AGP 24319.35498339  .00000676  00000+0  16258-3 0  9993
2 35026  74.0466 341.2200 0084407 195.6822 176.9120 14.53239799824285
COSMOS 2251 DEB         
1 35028U 93036AGR 24320.68652975  .00000882  00000+0  19778-3 0  9990
2 35028  74.0370 294.6709 0083878 169.0031   3.4364 14.56003269825788
COSMOS 2251 DEB         
1 35031U 93036AGU 24321.17562812  .00001224  00000+0  41579-3 0  9994
2 35031  74.0400 260.3203 0017631  93.7930 266.5240 14.37608914596552
COSMOS 2251 DEB         
1 35032U 93036AGV 24321.49309153  .00007466  00000+0  17274-2 0  9995
2 35032  73.8554  38.0451 0075741 326.0516  44.9389 14.53538296819916
COSMOS 2251 DEB         
1 35033U 93036AGW 24320.38062106  .00004842  00000+0  13158-2 0  9999
2 35033  74.0305 193.2049 0013510  34.4362 325.7670 14.47743408602421
COSMOS 2251 DEB         
1 35037U 93036AHA 24322.04761868  .00028819  00000+0  28609-2 0  9996
2 35037  73.9934 234.7070 0028836 142.2564 218.0648 14.91311235828286
COSMOS 2251 DEB         
1 35038U 93036AHB 24321.24141105  .00007692  00000+0  33360-2 0  9990
2 35038  74.1108  23.9624 0111377 110.5112 308.9553 14.21059458799983
COSMOS 2251 DEB         
1 35043U 93036AHG 24321.60659886  .00018296  00000+0  37924-2 0  9998
2 35043  73.9604  82.7257 0143060  19.6919 340.9687 14.53899035807702
COSMOS 2251 DEB         
1 35045U 93036AHJ 24320.46331004  .00001782  00000+0  10779-2 0  9993
2 35045  73.7227  24.8070 0186311 325.3525  33.5580 13.99029848791546
COSMOS 2251 DEB         
1 35060U 93036AHP 24317.52009158  .00003334  00000+0  10601-2 0  9994
2 35060  74.0385 255.7138 0016620  81.9119 278.3921 14.40219958816143
COSMOS 2251 DEB         
1 35061U 93036AHQ 24320.79989100  .00007450  00000+0  14298-2 0  9991
2 35061  74.0479 340.0841 0043395 197.5195 162.4479 14.63265032828327
COSMOS 2251 DEB         
1 35062U 93036AHR 24318.60269812  .00011953  00000+0  52993-2 0  9997
2 35062  74.0839  77.6483 0135907 176.3659 183.8507 14.18297865799532
COSMOS 2251 DEB         
1 35065U 93036AHU 24320.93919319  .00003719  00000+0  10976-2 0  9999
2 35065  74.0248 204.7107 0018878  66.7969 293.5174 14.43797187817785
COSMOS 2251 DEB         
1 35071U 93036AJA 24320.54368652  .00016471  00000+0  14901-2 0  9992
2 35071  73.9407 253.6132 0087063 245.0008 114.2114 14.92514803616625
COSMOS 2251 DEB         
1 35073U 93036AJC 24320.49369463  .00030135  00000+0  42845-2 0  9990
2 35073  74.0116  34.6357 0023244 264.6888  95.1634 14.76572727825049
COSMOS 2251 DEB         
1 35280U 93036AJJ 24320.85707802  .00048009  00000+0  63346-2 0  9991
2 35280  74.0231 150.4563 0028017 336.0941  23.8932 14.79526011818511
COSMOS 2251 DEB         
1 35281U 93036AJK 24321.65410550  .00188565  00000+0  89234-2 0  9998
2 35281  73.9815 309.8396 0013276 308.1281  51.8718 15.18361643824499
COSMOS 2251 DEB         
1 35284U 93036AJN 24322.12407370  .00000953  00000+0  32543-3 0  9996
2 35284  74.0498 263.3019 0015211  80.2493 290.9426 14.37651361816538
COSMOS 2251 DEB         
1 35287U 93036AJR 24320.88779814  .00001012  00000+0  35757-3 0  9992
2 35287  74.0300 275.9268 0016756 113.5176 277.8877 14.35865689812674
COSMOS 2251 DEB         
1 35288U 93036AJS 24321.61043389  .00008220  00000+0  17411-2 0  9990
2 35288  73.9546  48.4108 0044217   6.6797 353.4947 14.58746624822442
COSMOS 2251 DEB         
1 35290U 93036AJU 24320.15605433  .00020759  00000+0  37784-2 0  9991
2 35290  74.0089 106.2286 0007474 329.8193  30.2544 14.66022951821758
COSMOS 2251 DEB         
1 35432U 93036AKA 24320.62578991  .00027829  00000+0  38932-2 0  9990
2 35432  74.0373  88.4306 0003704  16.9696 343.1602 14.77461308817368
COSMOS 2251 DEB         
1 35433U 93036AKB 24320.37972372  .00001288  00000+0  47019-3 0  9992
2 35433  74.0342 336.8752 0025485 131.6184 289.6894 14.33864496809553
COSMOS 2251 DEB         
1 35434U 93036AKC 24321.35052775  .00003200  00000+0  13534-2 0  9998
2 35434  74.0416 199.0935 0088739   3.7187 356.4598 14.23802583810252
COSMOS 2251 DEB         
1 35435U 93036AKD 24321.27450957  .00017501  00000+0  33257-2 0  9997
2 35435  74.0148 146.0626 0013600 337.3455 195.9335 14.64083692817803
COSMOS 2251 DEB         
1 35439U 93036AKH 24321.08684453  .00004252  00000+0  27034-2 0  9995
2 35439  74.0203  84.1804 0251510 340.5171 194.9996 13.89685669785134
COSMOS 2251 DEB         
1 35440U 93036AKJ 24320.53924700  .00006035  00000+0  10806-2 0  9998
2 35440  74.0191 245.6627 0072144 126.8025 233.9793 14.65330325825670
COSMOS 2251 DEB         
1 35441U 93036AKK 24320.28428359  .00016720  00000+0  39431-2 0  9997
2 35441  74.1376 320.7420 0047150 320.7996  38.9754 14.53549563817083
COSMOS 2251 DEB         
1 35442U 93036AKL 24320.92968510  .00022238  00000+0  39647-2 0  9997
2 35442  74.0307 146.3113 0004197 265.4799  94.5891 14.66943107817264
COSMOS 2251 DEB         
1 35443U 93036AKM 24318.87308696  .00046815  00000+0  75683-2 0  9999
2 35443  74.0041  29.0349 0142225 272.6456  85.8439 14.64527911810536
COSMOS 2251 DEB         
1 35445U 93036AKP 24318.01853786  .00008230  00000+0  17657-2 0  9998
2 35445  74.0392 327.7697 0161181 156.0888 204.7871 14.50916769816623
COSMOS 2251 DEB         
1 35446U 93036AKQ 24321.75983260  .00000805  00000+0  19063-3 0  9999
2 35446  74.0467 337.1044 0076847 196.0247 163.8485 14.54006440823382
COSMOS 2251 DEB         
1 35448U 93036AKS 24318.42274750  .00005438  00000+0  14131-2 0  9995
2 35448  73.9039 118.7435 0010487  14.2881 345.8573 14.49871318816703
COSMOS 2251 DEB         
1 35451U 93036AKV 24320.11863980  .00026695  00000+0  17716-2 0  9997
2 35451  73.9358 209.5599 0070406 191.3288 168.6321 15.05083741614443
COSMOS 2251 DEB         
1 35453U 93036AKX 24309.96872279  .00010857  00000+0  37051-2 0  9997
2 35453  74.0240  42.0261 0068761 269.6928  89.6345 14.35131271804346
COSMOS 2251 DEB         
1 35455U 93036AKZ 24320.96003619  .00008397  00000+0  22674-2 0  9997
2 35455  74.0293 307.6136 0106437 150.2583 210.4684 14.44624063808768
COSMOS 2251 DEB         
1 35456U 93036ALA 24317.30367214  .00015245  00000+0  31537-2 0  9994
2 35456  73.9655 161.2582 0081225 102.3308 258.6964 14.58230419600878
COSMOS 2251 DEB         
1 35459U 93036ALD 24321.96456346  .00001154  00000+0  40247-3 0  9992
2 35459  73.8730 193.0632 0018079 219.3930 140.5908 14.36416322810460
COSMOS 2251 DEB         
1 35462U 93036ALG 24321.19416936  .00009248  00000+0  37733-2 0  9999
2 35462  74.0401 257.7848 0090295  27.0998 333.4819 14.25253178607933
COSMOS 2251 DEB         
1 35464U 93036ALJ 24321.28446108  .00121304  00000+0  54179-2 0  9996
2 35464  73.9893 151.6621 0020364  58.4919 114.5433 15.20577001518188
COSMOS 2251 DEB         
1 35465U 93036ALK 24316.96898559  .00004167  00000+0  12339-2 0  9996
2 35465  74.0015 214.1636 0064667 109.7027 251.1120 14.42471810815312
COSMOS 2251 DEB         
1 35469U 93036ALP 24321.54919410  .00000956  00000+0  24887-3 0  9994
2 35469  74.0201  38.8530 0079029 288.5669  70.6918 14.49205594825145
COSMOS 2251 DEB         
1 35475U 93036ALV 24320.92733412  .00019911  00000+0  42178-2 0  9991
2 35475  74.0278 199.5333 0024670   9.7251 350.4386 14.58984015819080
COSMOS 2251 DEB         
1 35476U 93036ALW 24320.45520549  .00022672  00000+0  43610-2 0  9995
2 35476  73.9807 104.1164 0019547 189.5594 227.2987 14.63417754821230
COSMOS 2251 DEB         
1 35580U 93036ALX 24319.86391141  .00006153  00000+0  42629-2 0  9993
2 35580  73.9027 125.6180 0286595 205.7221 152.9416 13.81240194568266
COSMOS 2251 DEB         
1 35583U 93036AMA 24318.76243743  .00002032  00000+0  18782-2 0  9993
2 35583  73.9179 129.9446 0386521 227.5223 129.2620 13.54174321770765
COSMOS 2251 DEB         
1 35584U 93036AMB 24321.20511195  .00265873  00000+0  21032-1 0  9991
2 35584  74.0547 244.6556 0023057 298.1430  61.7427 14.98983846800050
COSMOS 2251 DEB         
1 35585U 93036AMC 24320.66879050  .00005790  00000+0  43948-2 0  9999
2 35585  73.9730 281.8886 0318062 274.4295 263.5834 13.72787337586773
COSMOS 2251 DEB         
1 35586U 93036AMD 24320.45195402  .00000918  00000+0  86032-3 0  9998
2 35586  74.0207 210.5288 0406865 167.4318   5.6791 13.51264078550818
COSMOS 2251 DEB         
1 35587U 93036AME 24321.11639056  .00003484  00000+0  54601-3 0  9999
2 35587  74.0028 100.0351 0104751  24.1690 336.4342 14.69438692605896
COSMOS 2251 DEB         
1 35592U 93036AMK 24321.63660585  .00104958  00000+0  24814-2 0  9993
2 35592  73.9993  88.5288 0047363 301.6849  57.9744 15.40175111842904
COSMOS 2251 DEB         
1 35593U 93036AML 24321.12486245  .00008118  00000+0  34163-2 0  9996
2 35593  74.0853 272.0129 0104895  17.1340 343.3302 14.22951941794893
COSMOS 2251 DEB         
1 35594U 93036AMM 24322.01491076  .00009449  00000+0  13889-2 0  9994
2 35594  73.8106 168.9194 0039335 353.6449   6.4218 14.75042415826503
COSMOS 2251 DEB         
1 35602U 93036AMV 24321.37865505  .00018625  00000+0  73048-3 0  9994
2 35602  73.9992 293.6611 0118149 105.1342  44.5608 15.19364286841897
COSMOS 2251 DEB         
1 35605U 93036AMY 24318.56674583  .00037807  00000+0  51396-2 0  9992
2 35605  73.8933  63.9781 0067115  75.0415 285.8176 14.77037445818736
COSMOS 2251 DEB         
1 35606U 93036AMZ 24321.27795343  .00000584  00000+0  59848-3 0  9996
2 35606  73.8080 274.1631 0458014 181.0612 178.9565 13.40257339557930
COSMOS 2251 DEB         
1 35611U 93036ANE 24320.70612937  .00020222  00000+0  41956-2 0  9997
2 35611  74.0248 216.1546 0026801  27.2289 333.0275 14.59896318815422
COSMOS 2251 DEB         
1 35614U 93036ANH 24321.79639345  .00008283  00000+0  16087-2 0  9992
2 35614  73.9631   2.2220 0087692 306.6328  52.6796 14.60858488821118
COSMOS 2251 DEB         
1 35643U 93036ANJ 24319.49583916  .00256172  00000+0  83187-2 0  9997
2 35643  73.9846 233.0965 0026210 139.5195 220.7964 15.30480061824666
COSMOS 2251 DEB         
1 35645U 93036ANL 24319.37641714  .00009912  00000+0  31427-2 0  9995
2 35645  73.9663 100.5749 0077911 345.8435  14.0533 14.38390479811006
COSMOS 2251 DEB         
1 35646U 93036ANM 24320.77666058  .00000966  00000+0  97804-3 0  9992
2 35646  73.8707 317.5656 0459157 134.4397  35.7714 13.39837032766064
COSMOS 2251 DEB         
1 35647U 93036ANN 24321.37514837  .00004170  00000+0  12934-2 0  9998
2 35647  74.0231 301.1028 0046789 139.6144 220.8501 14.40793801808709
COSMOS 2251 DEB         
1 35650U 93036ANR 24320.28543064  .00023493  00000+0  39228-2 0  9999
2 35650  74.0516  67.6813 0019823 241.8371 147.8752 14.69708931818957
COSMOS 2251 DEB         
1 35660U 93036APB 24320.29082515  .00003082  00000+0  83704-3 0  9991
2 35660  74.0401 148.8380 0017833  33.7231 139.3347 14.47890724601868
COSMOS 2251 DEB         
1 35661U 93036APC 24320.76145009  .00010773  00000+0  13445-2 0  9991
2 35661  74.0140 136.4408 0101982 340.3589  19.3668 14.78802987820588
COSMOS 2251 DEB         
1 35663U 93036APE 24314.86827012  .00025114  00000+0  54693-2 0  9993
2 35663  74.0231 167.0827 0007665 338.5932  21.4910 14.57830050810447
COSMOS 2251 DEB         
1 35667U 93036APJ 24321.27753138  .00006974  00000+0  16320-2 0  9995
2 35667  74.0580 163.3361 0022039 321.5882  38.3710 14.54629010650994
COSMOS 2251 DEB         
1 35668U 93036APK 24321.22714423  .00003076  00000+0  58735-3 0  9992
2 35668  74.0458 251.0291 0083271  97.8169 263.2461 14.62158406819211
COSMOS 2251 DEB         
1 35669U 93036APL 24319.02575455  .00002631  00000+0  23167-2 0  9994
2 35669  73.8631  81.0127 0391878 260.7459  94.9141 13.55918534767504
COSMOS 2251 DEB         
1 35670U 93036APM 24321.79319939  .00017045  00000+0  22078-2 0  9991
2 35670  73.8971 130.3367 0046672 182.1971 177.9008 14.80054241820185
COSMOS 2251 DEB         
1 35671U 93036APN 24320.36036453  .00001697  00000+0  46578-3 0  9999
2 35671  74.0176  94.4907 0041190   1.9514  27.8140 14.47349075810844
COSMOS 2251 DEB         
1 35672U 93036APP 24321.50380358  .00316809  00000+0  95865-2 0  9999
2 35672  74.0318 246.3105 0012638 117.8806   0.1299 15.32731958819991
COSMOS 2251 DEB         
1 35674U 93036APR 24322.06245404  .00005588  00000+0  14193-2 0  9999
2 35674  74.0623 330.7755 0102412 117.4710 243.6907 14.47834776805364
COSMOS 2251 DEB         
1 35701U 93036APW 24312.51195284  .00005612  00000+0  40221-2 0  9998
2 35701  74.0055 254.0545 0298119 189.0462 170.5221 13.78144928782231
COSMOS 2251 DEB         
1 35703U 93036APY 24320.67270269  .00015350  00000+0  18277-2 0  9999
2 35703  74.0451 102.7007 0077683 278.1253  81.1118 14.82182685836997
COSMOS 2251 DEB         
1 35705U 93036AQA 24317.31840378  .00019421  00000+0  43989-2 0  9993
2 35705  74.2869 164.3529 0041000 236.9530 122.7694 14.55563192801383
COSMOS 2251 DEB         
1 35706U 93036AQB 24320.80918790  .00001866  00000+0  15767-2 0  9993
2 35706  73.8901 349.6426 0343995 110.7916 253.0405 13.64332218567137
COSMOS 2251 DEB         
1 35711U 93036AQG 24319.55230888  .00002892  00000+0  55279-3 0  9997
2 35711  74.0470 253.9542 0085392  96.6626 264.4269 14.62042633820210
COSMOS 2251 DEB         
1 35716U 93036AQM 24322.17544498  .00000926  00000+0  19191-3 0  9998
2 35716  73.9961 221.1282 0090393 157.8952 353.5675 14.59216599820878
COSMOS 2251 DEB         
1 35717U 93036AQN 24318.99814369  .00006017  00000+0  20876-2 0  9999
2 35717  74.1618 215.3936 0084848 184.5575 175.4816 14.33746036797987
COSMOS 2251 DEB         
1 35718U 93036AQP 24318.86296918  .00012194  00000+0  25722-2 0  9998
2 35718  74.0349 167.0400 0013601 314.3302  45.6747 14.59409070600747
COSMOS 2251 DEB         
1 35721U 93036AQS 24320.34731722  .00006702  00000+0  23158-2 0  9994
2 35721  73.9517 177.5085 0155841  50.0748 311.3975 14.29324145799462
COSMOS 2251 DEB         
1 35724U 93036AQV 24320.76537915  .00002688  00000+0  59284-3 0  9990
2 35724  74.0349 327.8691 0062794 221.4750 138.1640 14.56662771818189
COSMOS 2251 DEB         
1 35726U 93036AQX 24317.37280768  .00285862  00000+0  79844-2 0  9996
2 35726  74.0213 190.8544 0012699 113.1668 247.0877 15.35401288608439
COSMOS 2251 DEB         
1 35729U 93036ARA 24319.16452723  .00041331  00000+0  39391-2 0  9994
2 35729  74.0224 259.2140 0021029 153.5163 267.4565 14.92993202822804
COSMOS 2251 DEB         
1 35759U 93036ARD 24321.48715420  .00003355  00000+0  63487-3 0  9999
2 35759  74.0399 247.3106 0077935 106.7618 254.2118 14.62806945828372
COSMOS 2251 DEB         
1 35771U 93036ARR 24321.91223488  .00023169  00000+0  11520-1 0  9993
2 35771  74.1651 271.0780 0259048 310.2575  47.6159 14.01032512781406
COSMOS 2251 DEB         
1 35773U 93036ART 24320.15457063  .00005652  00000+0  12031-2 0  9994
2 35773  74.0114  11.7660 0052284 268.3067  91.2108 14.58372922819808
COSMOS 2251 DEB         
1 35775U 93036ARV 24311.40510301  .01040839  00000+0  15350-1 0  9992
2 35775  73.9960 199.3739 0024380 142.9409 217.3495 15.52413024825137
COSMOS 2251 DEB         
1 35777U 93036ARX 24320.19918351  .00000568  00000+0  58597-3 0  9993
2 35777  73.7700 229.5405 0453430 182.2008 333.0887 13.40609880744222
COSMOS 2251 DEB         
1 35784U 93036ASE 24320.14294255  .00002568  00000+0  68194-3 0  9992
2 35784  74.0382 106.1529 0042811 332.7042  27.1867 14.48620362600186
COSMOS 2251 DEB         
1 35786U 93036ASG 24320.58489678  .00012232  00000+0  25376-2 0  9990
2 35786  74.0177  76.9536 0040819 303.0184  56.7061 14.59701502822623
COSMOS 2251 DEB         
1 35789U 93036ASK 24320.32511788  .00000795  00000+0  28141-3 0  9998
2 35789  74.0376 284.4287 0046979 122.1216 238.4509 14.35539322555953
COSMOS 2251 DEB         
1 35793U 93036ASP 24321.67030274  .00017261  00000+0  31433-2 0  9991
2 35793  74.0443 101.4292 0007127 298.0081  73.3858 14.66038442819847
COSMOS 2251 DEB         
1 35796U 93036ASS 24310.98235804  .00053853  00000+0  86106-2 0  9996
2 35796  74.0006 199.8729 0022319  49.2922 311.0183 14.71344296658781
COSMOS 2251 DEB         
1 35824U 93036ASW 24319.41487644  .00003564  00000+0  23940-2 0  9997
2 35824  73.8478   3.8998 0256362 159.8424 201.3054 13.86342617787722
COSMOS 2251 DEB         
1 35829U 93036ATB 24320.77138781  .00021333  00000+0  41097-2 0  9995
2 35829  74.0291 139.5914 0008981 304.7529  55.2792 14.63459626820141
COSMOS 2251 DEB         
1 35830U 93036ATC 24316.56658552  .00007108  00000+0  31332-2 0  9997
2 35830  73.8617 265.1206 0127843 309.7348  49.2583 14.19258213790423
COSMOS 2251 DEB         
1 35834U 93036ATG 24318.68986932  .00001101  00000+0  57512-3 0  9998
2 35834  73.9322 285.5043 0110825 167.7954   5.3428 14.12503872606988
COSMOS 2251 DEB         
1 35835U 93036ATH 24317.98798799  .00003586  00000+0  24498-2 0  9998
2 35835  74.0673 211.1365 0297425  83.6057 279.8842 13.80825006562466
COSMOS 2251 DEB         
1 35836U 93036ATJ 24321.93621704  .00010311  00000+0  21562-2 0  9993
2 35836  74.0400 205.6044 0029645   5.2716 354.8755 14.59618322818319
COSMOS 2251 DEB         
1 35837U 93036ATK 24319.24511781  .00013308  00000+0  98146-2 0  9999
2 35837  73.7229 139.6058 0440125 115.6527  54.3261 13.57768262526228
COSMOS 2251 DEB         
1 35839U 93036ATM 24321.22220270  .00040158  00000+0  42199-2 0  9992
2 35839  74.2355  43.2127 0029798 329.9894  60.1852 14.88927927826560
COSMOS 2251 DEB         
1 35840U 93036ATN 24320.85201685  .00010440  00000+0  36003-2 0  9999
2 35840  73.9325 161.3656 0128348 148.1166 212.7836 14.31400082796691
COSMOS 2251 DEB         
1 35883U 93036ATW 24320.64081058  .00002737  00000+0  69333-3 0  9996
2 35883  74.0249  86.8956 0086501 311.5647  59.3317 14.49154380814161
COSMOS 2251 DEB         
1 35885U 93036ATY 24320.20786233  .00001968  00000+0  67831-3 0  9993
2 35885  74.0277 296.9750 0022383 117.8573 242.4851 14.36431844808264
COSMOS 2251 DEB         
1 35888U 93036AUB 24321.87878242  .00003144  00000+0  70883-3 0  9991
2 35888  74.0365  19.3863 0053168 250.4598 109.0819 14.55919866806595
COSMOS 2251 DEB         
1 35890U 93036AUD 24318.60457284  .00011417  00000+0  29405-2 0  9995
2 35890  73.9390 271.5825 0059933 127.4537 233.2096 14.49073190795853
COSMOS 2251 DEB         
1 35891U 93036AUE 24321.34442364  .00027155  00000+0  16687-2 0  9998
2 35891  73.9933 195.4798 0078060  67.3689 293.5733 15.07396245823192
COSMOS 2251 DEB         
1 35893U 93036AUG 24321.21113371  .00071599  00000+0  70239-2 0  9993
2 35893  73.6328 241.5655 0039479 147.5337 212.8284 14.91237326601810
COSMOS 2251 DEB         
1 35895U 93036AUJ 24320.66706962  .00003816  00000+0  22128-2 0  9998
2 35895  74.0473 306.4795 0206952 137.0930 224.6562 13.98928340535241
COSMOS 2251 DEB         
1 35898U 93036AUM 24319.39697354  .00012210  00000+0  12813-2 0  9991
2 35898  73.9975   7.4619 0095765 252.5602 118.1082 14.86186999822572
COSMOS 2251 DEB         
1 35901U 93036AUQ 24319.14008855  .00033861  00000+0  49537-2 0  9999
2 35901  74.0242  91.3930 0006297 297.9961 235.6364 14.75490647803491
COSMOS 2251 DEB         
1 35902U 93036AUR 24306.27729046  .00013049  00000+0  54177-2 0  9994
2 35902  73.9847 250.5507 0104400  97.8780 263.4231 14.23575262553383
COSMOS 2251 DEB         
1 35903U 93036AUS 24320.24853759  .00110505  00000+0  38930-2 0  9991
2 35903  74.0464 312.6845 0030640  79.9415 280.5241 15.28330857614717
COSMOS 2251 DEB         
1 35905U 93036AUU 24321.26572356  .00009846  00000+0  89675-3 0  9995
2 35905  74.0333 280.9936 0101137 106.1078 255.1268 14.91360850827314
COSMOS 2251 DEB         
1 35959U 93036AUZ 24321.22788142  .00000634  00000+0  23704-3 0  9999
2 35959  74.0314 308.5728 0021249 128.8762 231.4290 14.33715956793168
COSMOS 2251 DEB         
1 35961U 93036AVB 24319.29549112  .00004513  00000+0  24928-2 0  9996
2 35961  73.9291 174.7787 0196744 187.6963 172.1143 14.02361112571596
COSMOS 2251 DEB         
1 35970U 93036AVL 24318.14968923  .00064728  00000+0  57316-2 0  9995
2 35970  74.0259 269.5491 0018676 126.2422 234.0492 14.95782549809371
COSMOS 2251 DEB         
1 35974U 93036AVQ 24319.39815139  .00039431  00000+0  39438-2 0  9995
2 35974  74.0219   8.5598 0008664 294.3152  65.7125 14.91220536603084
COSMOS 2251 DEB         
1 35975U 93036AVR 24317.74163563  .00005518  00000+0  23142-2 0  9994
2 35975  74.0521 321.2554 0115294 138.7857 222.2067 14.22622688584765
COSMOS 2251 DEB         
1 35979U 93036AVV 24320.34868631  .00010416  00000+0  17582-2 0  9990
2 35979  74.0128 282.2632 0065055 156.2964 353.7633 14.68116288828616
COSMOS 2251 DEB         
1 35980U 93036AVW 24321.80913335  .00007476  00000+0  17971-2 0  9990
2 35980  73.9154 149.6107 0060402   9.1023 351.1217 14.52394329798164
COSMOS 2251 DEB         
1 35982U 93036AVY 24321.15450821  .00006706  00000+0  13733-2 0  9993
2 35982  74.0602  14.7406 0067956 185.6667 174.3739 14.59488085804460
COSMOS 2251 DEB         
1 35989U 93036AWF 24320.59544233  .00001545  00000+0  53555-3 0  9991
2 35989  74.0377 284.5448 0020761 106.4036 253.9401 14.36344570816269
COSMOS 2251 DEB         
1 35993U 93036AWK 24320.40091835  .00007760  00000+0  15844-2 0  9994
2 35993  74.0196   6.3272 0034255 291.2868  68.4642 14.60685375805999
COSMOS 2251 DEB         
1 35996U 93036AWN 24321.89884193  .00010443  00000+0  76241-3 0  9999
2 35996  74.0170 184.1454 0106469  18.1213 342.3720 14.99241064823084
COSMOS 2251 DEB         
1 35997U 93036AWP 24320.41081193  .00005225  00000+0  14092-2 0  9993
2 35997  74.0471 203.5068 0014927  14.3437 345.8143 14.48063676651989
COSMOS 2251 DEB         
1 36002U 93036AWU 24321.94394539  .00058347  00000+0  30457-2 0  9997
2 36002  74.0005  34.2729 0038282 282.4523  77.2389 15.14994560827439
COSMOS 2251 DEB         
1 36005U 93036AWX 24321.13512672  .00001496  00000+0  41332-3 0  9999
2 36005  74.0265 106.2482 0062476 338.1794  21.6704 14.46494719819202
COSMOS 2251 DEB         
1 36046U 93036AXH 24317.74661244  .00005822  00000+0  11426-2 0  9993
2 36046  74.0146 315.5793 0061056 203.5751 330.8270 14.61733992582246
COSMOS 2251 DEB         
1 36047U 93036AXJ 24321.55836783  .00026133  00000+0  38208-2 0  9995
2 36047  74.0411  31.4867 0010915 246.1825 113.8205 14.75553127826480
COSMOS 2251 DEB         
1 36048U 93036AXK 24320.73067277  .00001876  00000+0  64052-3 0  9993
2 36048  74.0563 299.7041 0024995  90.6938  82.3641 14.36881345798690
COSMOS 2251 DEB         
1 36049U 93036AXL 24320.94299431  .00010481  00000+0  23841-2 0  9998
2 36049  74.0380 146.2392 0012131 326.6341  33.4056 14.55967215799883
COSMOS 2251 DEB         
1 36050U 93036AXM 24322.12582795  .00009900  00000+0  86843-3 0  9996
2 36050  74.0331 264.6559 0100082  88.8139 272.4508 14.92877526830278
COSMOS 2251 DEB         
1 36052U 93036AXP 24321.28676556  .00052574  00000+0  65114-2 0  9995
2 36052  74.0188  68.5656 0007018 310.9364  49.1205 14.82406476806843
COSMOS 2251 DEB         
1 36053U 93036AXQ 24320.30102587  .00009637  00000+0  24940-2 0  9990
2 36053  73.8748 181.6373 0038944 210.4662 149.4235 14.49508699817418
COSMOS 2251 DEB         
1 36055U 93036AXS 24322.00667555  .00094395  00000+0  11006-1 0  9995
2 36055  74.0090 170.9094 0064862  15.2589 345.0524 14.83167026775614
COSMOS 2251 DEB         
1 36058U 93036AXV 24315.04952751  .00015001  00000+0  34031-2 0  9990
2 36058  74.0249  69.5319 0049451 301.2459  58.3864 14.55308222824639
COSMOS 2251 DEB         
1 36060U 93036AXX 24319.04226112  .00002461  00000+0  77927-3 0  9990
2 36060  74.0308 243.9347 0013687  80.4377 279.8325 14.40579798794162
COSMOS 2251 DEB         
1 36061U 93036AXY 24314.88910090  .00004210  00000+0  15442-2 0  9990
2 36061  74.0268   7.4206 0039049 193.5930 166.4173 14.32655627815305
COSMOS 2251 DEB         
1 36064U 93036AYB 24293.24006804  .00048263  00000+0  74003-2 0  9992
2 36064  73.8293 118.5207 0046155 108.5609 252.0584 14.72651774594511
COSMOS 2251 DEB         
1 36071U 93036AYJ 24322.08996406  .00077257  00000+0  67736-2 0  9991
2 36071  74.0093  87.0508 0008565 302.7237  57.3121 14.96200023817987
COSMOS 2251 DEB         
1 36073U 93036AYL 24318.73636115  .00001419  00000+0  51422-3 0  9991
2 36073  74.0323 324.4243 0023538 133.1887 227.1237 14.34175384795289
COSMOS 2251 DEB         
1 36074U 93036AYM 24315.85646778  .00011839  00000+0  37418-2 0  9993
2 36074  73.9957 358.1162 0045990 187.6978 172.3477 14.39635878805256
COSMOS 2251 DEB         
1 36366U 93036AYT 24315.57826155  .00020333  00000+0  78094-2 0  9999
2 36366  74.0692 275.1478 0092700  41.5235 319.2907 14.28038631807367
COSMOS 2251 DEB         
1 36367U 93036AYU 24321.83488820  .00003265  00000+0  22305-2 0  9998
2 36367  74.1011 169.8294 0267960 336.9909  21.9389 13.84256041773721
COSMOS 2251 DEB         
1 36369U 93036AYW 24322.12083210  .00010521  00000+0  20332-2 0  9998
2 36369  74.0349 106.7342 0016665 294.5670  65.3760 14.63393751802634
COSMOS 2251 DEB         
1 36379U 93036AZG 24320.72293689  .00001789  00000+0  62895-3 0  9993
2 36379  74.0120 307.1076 0046464 171.7595   1.7366 14.35054019592020
COSMOS 2251 DEB         
1 36384U 93036AZM 24321.62569587  .00221730  00000+0  98211-2 0  9992
2 36384  74.0008  31.5182 0020611 338.5295  21.5035 15.20393630814551
COSMOS 2251 DEB         
1 36385U 93036AZN 24321.08338795  .00019049  00000+0  32147-2 0  9992
2 36385  73.9771 193.1479 0169632 101.6093 260.4168 14.60304833793606
COSMOS 2251 DEB         
1 36420U 93036AZT 24320.15950877  .00001117  00000+0  39029-3 0  9994
2 36420  74.0372 276.8804 0016955 105.6474 266.1054 14.36331677793990
COSMOS 2251 DEB         
1 36424U 93036AZX 24316.65426859  .00055939  00000+0  90185-2 0  9996
2 36424  74.1854 188.6750 0068315 108.3919 252.4697 14.69579120782320
COSMOS 2251 DEB         
1 36430U 93036BAD 24318.04888155  .00002028  00000+0  80930-3 0  9998
2 36430  73.9982 104.2743 0099344 344.8716  14.9464 14.26486989589264
COSMOS 2251 DEB         
1 36437U 93036BAL 24318.06460036  .00015306  00000+0  30958-2 0  9998
2 36437  73.9312  79.0498 0026530  31.3080 328.9658 14.61119626602666
COSMOS 2251 DEB         
1 36439U 93036BAN 24311.26106684  .00006850  00000+0  64897-2 0  9994
2 36439  73.9726 316.7429 0433934   6.7408 353.9275 13.45992462751017
COSMOS 2251 DEB         
1 36441U 93036BAQ 24318.63370526  .00015225  00000+0  10857-2 0  9996
2 36441  73.8384  83.9374 0129918 267.2774  91.3535 14.97923669812184
COSMOS 2251 DEB         
1 36451U 93036BBA 24321.31081613  .00004500  00000+0  19117-2 0  9994
2 36451  73.9575 316.3729 0193443 224.8681 133.6686 14.16013297787732
COSMOS 2251 DEB         
1 36453U 93036BBC 24318.36963238  .00006732  00000+0  17580-2 0  9990
2 36453  73.9267 178.7447 0076821 169.9672   3.5849 14.47852521787492
COSMOS 2251 DEB         
1 36459U 93036BBJ 24318.35388428  .00008488  00000+0  35562-2 0  9997
2 36459  74.0529 349.7826 0124294 187.5358 172.3925 14.22016431 22674
COSMOS 2251 DEB         
1 36470U 93036BBV 24319.29725271  .00026072  00000+0  36828-2 0  9990
2 36470  73.8537 331.1919 0044518 243.7968 115.8625 14.76382037602325
COSMOS 2251 DEB         
1 36528U 93036BCN 24314.88646492  .00010357  00000+0  40076-2 0  9990
2 36528  74.0160 148.8239 0087977 292.1810  67.0020 14.28035162784657
COSMOS 2251 DEB         
1 36531U 93036BCR 24301.66703030  .00059218  00000+0  25128-1 0  9997
2 36531  74.0991  28.5278 0185421 151.8364 209.2962 14.16156416762821
COSMOS 2251 DEB         
1 36533U 93036BCT 24320.88132187  .00003609  00000+0  96799-3 0  9990
2 36533  74.0109 130.4981 0049817  13.4118 346.8351 14.47787366788091
COSMOS 2251 DEB         
1 36539U 93036BCZ 24321.78892082  .00006119  00000+0  14063-2 0  9995
2 36539  74.0253  78.8469 0030646 318.1984  41.6838 14.55365412782625
COSMOS 2251 DEB         
1 36540U 93036BDA 24320.64686682  .00009749  00000+0  23851-2 0  9995
2 36540  74.0325 204.0125 0015505   8.3885 351.7532 14.52543608803042
COSMOS 2251 DEB         
1 36550U 93036BDL 24318.32941293  .00003260  00000+0  13505-2 0  9997
2 36550  74.0465 185.1979 0080175 330.7771  28.8901 14.25249343789724
COSMOS 2251 DEB         
1 36551U 93036BDM 24316.68613273  .00038317  00000+0  43229-2 0  9996
2 36551  73.8920  99.7000 0067719 135.6782 224.9847 14.84704288805104
COSMOS 2251 DEB         
1 36557U 93036BDT 24320.34194337  .00017867  00000+0  35239-2 0  9994
2 36557  73.9836 170.7134 0028672  54.0289 306.3530 14.62193617791445
COSMOS 2251 DEB         
1 36558U 93036BDU 24318.89660837  .00005768  00000+0  14555-2 0  9990
2 36558  74.0454 177.9960 0013057   1.7365 358.3839 14.51224499795461
COSMOS 2251 DEB         
1 36614U 93036BEC 24317.96777509  .00011140  00000+0  26644-2 0  9998
2 36614  74.0263 205.1467 0016735  11.7923 348.3627 14.53569215805102
COSMOS 2251 DEB         
1 36622U 93036BEL 24320.98814935  .00009557  00000+0  14903-2 0  9992
2 36622  74.0164 190.7672 0073150  65.2573 295.6188 14.71196052609784
COSMOS 2251 DEB         
1 36625U 93036BEP 24320.80620104  .00208987  00000+0  62507-2 0  9990
2 36625  73.8536 351.9370 0017940  26.4397 333.7718 15.33481192 33359
COSMOS 2251 DEB         
1 36626U 93036BEQ 24320.20534403  .00075050  00000+0  16402-2 0  9997
2 36626  74.0065 298.7578 0062990  64.2252 296.5438 15.41698173623160
COSMOS 2251 DEB         
1 36632U 93036BEW 24320.65939546  .00005458  00000+0  17204-2 0  9996
2 36632  74.0021 300.5737 0033045 146.9963 213.3264 14.40240990595647
COSMOS 2251 DEB         
1 37084U 93036BFE 24321.04174018  .00017809  00000+0  14996-2 0  9995
2 37084  74.0314 234.9039 0109245  59.2832 301.9058 14.93600954604044
COSMOS 2251 DEB         
1 37085U 93036BFF 24319.30011083  .00029596  00000+0  21718-2 0  9990
2 37085  73.9716 322.5679 0058118 251.9321 107.5530 15.01990213611660
COSMOS 2251 DEB         
1 37089U 93036BFK 24317.83824217  .00011635  00000+0  30206-2 0  9998
2 37089  74.0420 165.0426 0157954   4.0553 356.1840 14.42539741778928
COSMOS 2251 DEB         
1 37093U 93036BFP 24314.82904255  .00101099  00000+0  57218-2 0  9996
2 37093  74.0083 213.8058 0075863 194.3970 165.5063 15.10095401794434
COSMOS 2251 DEB         
1 37094U 93036BFQ 24320.71834301  .00008187  00000+0  27772-2 0  9992
2 37094  74.1093 118.2122 0088336 188.8386 171.1217 14.34624211788771
COSMOS 2251 DEB         
1 37095U 93036BFR 24321.79622834  .00004355  00000+0  24758-2 0  9992
2 37095  73.8471 157.2207 0200307 287.0800  70.8479 14.00577797794830
COSMOS 2251 DEB         
1 37101U 93036BFX 24320.18449121  .00009329  00000+0  19876-2 0  9999
2 37101  74.0362 125.4196 0049584 310.9140  48.7735 14.58288865599352
COSMOS 2251 DEB         
1 37108U 93036BGE 24318.08633529  .00008998  00000+0  28816-2 0  9994
2 37108  74.0467  88.6922 0099786 263.1851  95.7941 14.36832573798291
COSMOS 2251 DEB         
1 37126U 93036BGY 24318.96017644  .00002685  00000+0  39250-3 0  9997
2 37126  73.9560  44.7437 0126875  14.4617 346.0129 14.70867133 23046
COSMOS 2251 DEB         
1 37132U 93036BHE 24320.17987126  .00011105  00000+0  18253-2 0  9997
2 37132  74.0053 281.7466 0045984 180.9697 179.1393 14.69971088566318
COSMOS 2251 DEB         
1 37270U 93036BHJ 24321.21270309  .00011961  00000+0  99516-2 0  9995
2 37270  73.9359 252.9324 0413092 339.7988  18.7172 13.55530415717542
COSMOS 2251 DEB         
1 37277U 93036BHR 24304.28157445  .00121945  00000+0  12148-1 0  9994
2 37277  74.0176 143.9270 0007903 241.5042 118.5345 14.90881502770139
COSMOS 2251 DEB         
1 37280U 93036BHU 24319.46867652  .00006695  00000+0  31032-2 0  9990
2 37280  74.0349  38.2150 0140801 259.0123  99.5154 14.15813162517507
COSMOS 2251 DEB         
1 37284U 93036BHY 24311.29081458  .00004538  00000+0  22871-2 0  9994
2 37284  74.0227 145.4795 0173321  28.5998 146.2116 14.09117637749393
COSMOS 2251 DEB         
1 37295U 93036BJK 24319.42484949  .00005457  00000+0  10859-2 0  9995
2 37295  74.0086 317.8506 0050191 236.0417 123.5974 14.61513269765504
COSMOS 2251 DEB         
1 37305U 93036BJV 24320.66582685  .00004698  00000+0  16733-2 0  9994
2 37305  73.8709 296.6112 0051828 331.6113  28.2215 14.33790168612420
COSMOS 2251 DEB         
1 37312U 93036BKC 24320.68702438  .00003927  00000+0  11533-2 0  9991
2 37312  74.0325 214.9041 0017034  54.6121 305.6625 14.44025960805009
COSMOS 2251 DEB         
1 37316U 93036BKG 24321.32735226  .00029822  00000+0  44813-2 0  9997
2 37316  74.0282  77.6059 0046443 260.2107  99.3819 14.73646347803788
COSMOS 2251 DEB         
1 37320U 93036BKL 24320.58656434  .00012835  00000+0  20247-2 0  9993
2 37320  74.0493 264.5827 0050263  95.5333 265.1574 14.71589513806820
COSMOS 2251 DEB         
1 37326U 93036BKS 24315.88716179  .00009703  00000+0  20452-2 0  9997
2 37326  74.0289  12.6528 0060998 242.7051 116.7894 14.58373456798848
COSMOS 2251 DEB         
1 37327U 93036BKT 24310.99786397  .00129707  00000+0  13403-1 0  9998
2 37327  74.0183  48.3968 0017292 280.8068  79.1167 14.89280934 22652
COSMOS 2251 DEB         
1 37330U 93036BKW 24320.28826898  .00003773  00000+0  81489-3 0  9991
2 37330  74.0180 323.2243 0061829 268.4707  90.9374 14.57508115806460
COSMOS 2251 DEB         
1 37331U 93036BKX 24319.57539366  .00003909  00000+0  14070-2 0  9995
2 37331  74.0771  65.8921 0057123 182.5241 177.5632 14.33140465791231
COSMOS 2251 DEB         
1 37336U 93036BLC 24317.05616958  .00000554  00000+0  21303-3 0  9995
2 37336  74.0410 333.4381 0029224 151.4203 208.8557 14.32499336594535
COSMOS 2251 DEB         
1 37340U 93036BLG 24318.17521914  .00001569  00000+0  54568-3 0  9997
2 37340  74.0245 282.6920 0016957 119.1206 241.1646 14.36205562784016
COSMOS 2251 DEB         
1 37483U 93036BLL 24321.24101905  .00001471  00000+0  42927-3 0  9999
2 37483  73.9728 153.1805 0093572  90.4418 270.7461 14.42451832596324
COSMOS 2251 DEB         
1 37484U 93036BLM 24317.51444126  .00006305  00000+0  20471-2 0  9990
2 37484  73.8205 228.6690 0041615 336.5510 196.9929 14.38575574596886
COSMOS 2251 DEB         
1 37486U 93036BLP 24319.16489860  .00005386  00000+0  24528-2 0  9994
2 37486  73.7023 102.6731 0250558  28.5387 143.8197 14.06635494769524
COSMOS 2251 DEB         
1 37487U 93036BLQ 24321.10154999  .00030462  00000+0  62100-2 0  9995
2 37487  73.9202 238.2798 0039800 167.3790 192.8382 14.60331731754879
COSMOS 2251 DEB         
1 37491U 93036BLU 24321.44379098  .00002775  00000+0  20780-2 0  9990
2 37491  73.9078 209.2109 0320865 276.1282  80.3373 13.73439121751310
COSMOS 2251 DEB         
1 37496U 93036BLZ 24302.04879879  .00064214  00000+0  93287-2 0  9990
2 37496  73.9563  58.8779 0097052 168.3708 191.9740 14.72407651599296
COSMOS 2251 DEB         
1 37499U 93036BMC 24318.73720809  .00001134  00000+0  41550-3 0  9993
2 37499  74.0370 323.1989 0026999 139.6904 220.6256 14.33780167794998
COSMOS 2251 DEB         
1 37500U 93036BMD 24321.55173190  .00044709  00000+0  68006-3 0  9995
2 37500  73.9551  24.6353 0095809 293.4432  65.6729 15.49080966836907
COSMOS 2251 DEB         
1 37515U 93036BMU 24318.30874194  .00051437  00000+0  76941-2 0  9994
2 37515  74.1402 329.0645 0062771 314.0947  45.5069 14.73083928798582
COSMOS 2251 DEB         
1 37528U 93036BNH 24318.23161303  .00003392  00000+0  90935-3 0  9998
2 37528  74.0370 142.4301 0020608  27.0859 333.1371 14.48438274802118
COSMOS 2251 DEB         
1 37530U 93036BNK 24321.32776593  .00001092  00000+0  40092-3 0  9992
2 37530  74.0362 330.0770 0025611 132.1417 240.8355 14.33733145796199
COSMOS 2251 DEB         
1 37532U 93036BNM 24319.49126618  .00001703  00000+0  53312-3 0  9994
2 37532  74.0520 223.9894 0014237  64.4258 108.9786 14.41383247792478
COSMOS 2251 DEB         
1 37533U 93036BNN 24318.33211218  .00005435  00000+0  27834-2 0  9993
2 37533  74.0638 165.6148 0164105 317.6073  41.2480 14.08989533573594
COSMOS 2251 DEB         
1 37535U 93036BNQ 24321.44658046  .00006438  00000+0  15087-2 0  9996
2 37535  74.0255  96.7553 0030709 329.8394  98.7862 14.54442667796263
COSMOS 2251 DEB         
1 37537U 93036BNS 24321.57765239  .00001227  00000+0  41921-3 0  9993
2 37537  74.0128 265.6241 0051047 141.0632 219.4215 14.36678449794140
COSMOS 2251 DEB         
1 37538U 93036BNT 24321.54268925  .00063271  00000+0  50634-2 0  9998
2 37538  74.0049 268.9534 0021280 142.5162 217.7513 14.99673132774811
COSMOS 2251 DEB         
1 37546U 93036BPB 24321.19797042  .00019076  00000+0  35386-2 0  9996
2 37546  74.0219 141.7650 0006113 283.8417  76.2071 14.65196088601219
COSMOS 2251 DEB         
1 37547U 93036BPC 24317.50820150  .00250331  00000+0  11313-1 0  9998
2 37547  74.0180 243.6188 0019265 149.3965 210.8360 15.19590195803084
COSMOS 2251 DEB         
1 37959U 93036BPJ 24321.11110986  .00008014  00000+0  18412-2 0  9993
2 37959  74.0122  81.2085 0063177 318.2960 215.3807 14.54372577746859
COSMOS 2251 DEB         
1 37960U 93036BPK 24320.26819154  .00002605  00000+0  12040-2 0  9994
2 37960  74.0604 153.7128 0254796 265.9445  91.2535 14.05715652718864
COSMOS 2251 DEB         
1 37961U 93036BPL 24320.97947775  .00007642  00000+0  18257-2 0  9996
2 37961  74.0420 159.4828 0043712 338.0030  21.9254 14.53201042743645
COSMOS 2251 DEB         
1 37966U 93036BPR 24317.65595942  .00033440  00000+0  42565-2 0  9991
2 37966  73.9862 310.7093 0021000 272.7825  87.0948 14.81258839794361
COSMOS 2251 DEB         
1 37967U 93036BPS 24320.92054259  .00007946  00000+0  24148-2 0  9996
2 37967  74.0147 140.0977 0163799  12.4891 348.0242 14.34766136591048
COSMOS 2251 DEB         
1 37968U 93036BPT 24316.84292246  .00015655  00000+0  14734-2 0  9999
2 37968  74.0074 351.8817 0098105 212.4532 147.0595 14.90233541543018
COSMOS 2251 DEB         
1 37971U 93036BPW 24321.57606244  .00012004  00000+0  35780-2 0  9995
2 37971  73.9971  52.8554 0079196 281.8802  77.3481 14.41295689783439
COSMOS 2251 DEB         
1 37975U 93036BQA 24320.42041030  .00018813  00000+0  37291-2 0  9991
2 37975  74.0117   3.1493 0122899  88.3247 273.1990 14.57478103639915
COSMOS 2251 DEB         
1 37977U 93036BQC 24318.76428196  .00077031  00000+0  76906-2 0  9992
2 37977  73.9635 134.0998 0016308  20.6196 339.5640 14.90988163 27327
COSMOS 2251 DEB         
1 37978U 93036BQD 24308.46669900  .00088361  00000+0  78411-2 0  9990
2 37978  74.0618 216.8257 0046284 341.0642  18.8818 14.94877190 22577
COSMOS 2251 DEB         
1 37985U 93036BQL 24321.21951567  .00000304  00000+0  11496-3 0  9991
2 37985  74.0245 264.2592 0020452 125.9965 234.3087 14.35290913592994
COSMOS 2251 DEB         
1 37988U 93036BQP 24320.68683340  .00016145  00000+0  30538-2 0  9992
2 37988  74.0652  58.2978 0070701 202.2381 157.5717 14.62751669176502
COSMOS 2251 DEB         
1 37993U 93036BQU 24320.33830549  .00010084  00000+0  24054-2 0  9997
2 37993  74.0253 192.6884 0023930  18.0768 342.1240 14.53625893596023
COSMOS 2251 DEB         
1 37994U 93036BQV 24321.33695119  .00002260  00000+0  74862-3 0  9991
2 37994  74.0362 277.7895 0021598  97.4014 262.9596 14.38322461714523
COSMOS 2251 DEB         
1 37998U 93036BQZ 24313.59766055  .00009020  00000+0  26906-2 0  9998
2 37998  74.0389 257.8552 0018104  73.1168 287.1972 14.43038815799135
COSMOS 2251 DEB         
1 38001U 93036BRC 24316.91384183  .00011315  00000+0  16971-2 0  9992
2 38001  74.0049 188.9819 0070947  78.0622 294.1965 14.72937790787933
COSMOS 2251 DEB         
1 38004U 93036BRF 24300.78744350  .00042711  00000+0  54487-2 0  9997
2 38004  74.0437 126.6846 0006616 217.1032 142.9688 14.81238172597130
COSMOS 2251 DEB         
1 38006U 93036BRH 24321.94305631  .00009132  00000+0  29285-2 0  9993
2 38006  73.8582  51.2483 0081182  76.7012 284.3177 14.37704727774101
COSMOS 2251 DEB         
1 38054U 93036BRL 24321.40695531  .00004799  00000+0  42565-2 0  9998
2 38054  73.9600 184.3325 0366643 238.8592 300.9482 13.58581250676427
COSMOS 2251 DEB         
1 38060U 93036BRS 24318.30347999  .00004568  00000+0  91585-3 0  9993
2 38060  74.0442 330.6955 0061050 180.7352 179.3735 14.60843859661982
COSMOS 2251 DEB         
1 38062U 93036BRU 24318.86743470  .00022066  00000+0  31797-2 0  9991
2 38062  74.0175 354.2436 0020685 244.2795 289.8128 14.76105472571813
COSMOS 2251 DEB         
1 38064U 93036BRW 24321.78516100  .00004744  00000+0  11586-2 0  9993
2 38064  74.0231 144.1395 0050487 358.9839   1.1211 14.52104775718318
COSMOS 2251 DEB         
1 38065U 93036BRX 24322.09577898  .00923256  00000+0  13409-1 0  9993
2 38065  73.9940  51.7051 0028830 339.4019  20.6030 15.52615077692675
COSMOS 2251 DEB         
1 38067U 93036BRZ 24321.71153355  .00002793  00000+0  57914-3 0  9996
2 38067  74.0176 301.7818 0073291 188.6682 344.6745 14.59014660741887
COSMOS 2251 DEB         
1 38068U 93036BSA 24320.95607058  .00001657  00000+0  58799-3 0  9996
2 38068  74.0222 307.6263 0024675 135.0670 225.2485 14.35056997700472
COSMOS 2251 DEB         
1 38190U 93036BSE 24298.94691780  .00049880  00000+0  63043-2 0  9997
2 38190  74.0367 116.6222 0006716 213.7070 146.3681 14.81578723689604
COSMOS 2251 DEB         
1 38197U 93036BSM 24321.59327673  .00022800  00000+0  44323-2 0  9992
2 38197  73.9455  33.8440 0175602 357.9324   2.1089 14.53645771800280
COSMOS 2251 DEB         
1 38199U 93036BSP 24320.43740183  .00001597  00000+0  12768-2 0  9999
2 38199  73.9551 346.2586 0372842 350.1393   9.2537 13.63719662556710
COSMOS 2251 DEB         
1 38208U 93036BSY 24321.17774486  .00031259  00000+0  55752-2 0  9993
2 38208  74.0118 126.1664 0007697 322.2022 155.1139 14.66834519703150
COSMOS 2251 DEB         
1 38212U 93036BTC 24320.85815604  .00006630  00000+0  93257-3 0  9998
2 38212  74.0544 123.0590 0100803 292.9825  66.0738 14.74060171755289
COSMOS 2251 DEB         
1 38213U 93036BTD 24299.74444751  .00100776  00000+0  92528-2 0  9998
2 38213  74.0293 101.7937 0004845 171.8615 188.2648 14.94266571544108
COSMOS 2251 DEB         
1 38220U 93036BTL 24321.43638721  .00026954  00000+0  43966-2 0  9997
2 38220  74.0214 122.1941 0004991 272.5603  87.4997 14.70827856796940
COSMOS 2251 DEB         
1 38479U 93036BTP 24320.32718927  .00008496  00000+0  29945-2 0  9999
2 38479  74.0085 185.5636 0092773  27.5548  93.1961 14.32500835590565
COSMOS 2251 DEB         
1 38481U 93036BTR 24319.30921781  .00004732  00000+0  29420-2 0  9999
2 38481  73.9349 326.2269 0239564 345.2038  14.2159 13.92067540764821
COSMOS 2251 DEB         
1 38483U 93036BTT 24320.43412395  .00005364  00000+0  20994-2 0  9992
2 38483  74.2640 352.3644 0118568 216.4077 142.8968 14.25915405578806
COSMOS 2251 DEB         
1 38485U 93036BTV 24320.49900326  .00042345  00000+0  41091-2 0  9997
2 38485  74.0045 233.9442 0027597 125.5955 234.7805 14.92150292119622
COSMOS 2251 DEB         
1 38486U 93036BTW 24320.54187238  .00020610  00000+0  43870-2 0  9991
2 38486  73.9486 244.6374 0036543 119.4766  54.3326 14.58526242699188
COSMOS 2251 DEB         
1 38487U 93036BTX 24322.14290552  .00017353  00000+0  17366-2 0  9995
2 38487  73.9924 113.7836 0050707  14.2939 345.9662 14.90431194741803
COSMOS 2251 DEB         
1 39109U 93036BTY 24320.61334568  .00007027  00000+0  12354-2 0  9992
2 39109  74.0474 263.6289 0060912 109.9569  62.6406 14.66584622686708
COSMOS 2251 DEB         
1 39110U 93036BTZ 24316.70922875  .00007814  00000+0  12302-2 0  9990
2 39110  73.9578 114.3222 0100134  80.3058 292.2673 14.69285058654995
COSMOS 2251 DEB         
1 39111U 93036BUA 24320.15136014  .00038630  00000+0  56035-2 0  9998
2 39111  74.0256 110.5772 0010811 272.7559  87.2377 14.75795675 32894
COSMOS 2251 DEB         
1 39546U 93036BUC 24320.39704417  .00017031  00000+0  22351-2 0  9990
2 39546  74.0000 198.5787 0054547  97.9298 262.8074 14.79219997586099
COSMOS 2251 DEB         
1 39547U 93036BUD 24316.13869075  .00065254  00000+0  96618-2 0  9997
2 39547  74.0086  91.1754 0010420 296.9159 241.7839 14.74729754581255
COSMOS 2251 DEB         
1 39552U 93036BUJ 24321.40838477  .00200189  00000+0  64734-2 0  9993
2 39552  73.9970 188.8957 0025035 126.6297  46.3939 15.30878855703054
COSMOS 2251 DEB         
1 39553U 93036BUK 24316.69818934  .00002474  00000+0  14734-2 0  9997
2 39553  74.0291 294.8483 0209024 161.4858 199.4031 13.97529435700796
COSMOS 2251 DEB         
1 39554U 93036BUL 24322.03549306  .00023134  00000+0  29274-2 0  9998
2 39554  74.0264 333.0012 0013080 238.5950 154.6134 14.81683789585464
COSMOS 2251 DEB         
1 39583U 93036BUN 24320.16197661  .00008160  00000+0  17695-2 0  9991
2 39583  73.9339 276.3752 0156248 118.3110 243.3915 14.50900110728811
COSMOS 2251 DEB         
1 39585U 93036BUQ 24320.28843591  .00002327  00000+0  50599-3 0  9996
2 39585  74.0414 327.5625 0068558 190.5490 169.4241 14.57146654568012
COSMOS 2251 DEB         
1 39586U 93036BUR 24317.98903211  .00002333  00000+0  10525-2 0  9997
2 39586  74.0096 216.2987 0101248  82.6473 289.9080 14.20012833553665
COSMOS 2251 DEB         
1 39591U 93036BUW 24320.57948103  .00003613  00000+0  11450-2 0  9991
2 39591  74.0243 253.3637 0028121 104.8048  68.5202 14.40189645 16571
COSMOS 2251 DEB         
1 40218U 93036BUX 24318.09089795  .00003199  00000+0  10205-2 0  9992
2 40218  74.0322 259.3606 0014599  83.0829 277.1986 14.40081779531778
COSMOS 2251 DEB         
1 40223U 93036BVC 24319.31247356  .00025615  00000+0  40665-2 0  9993
2 40223  73.9490 155.6612 0027030  63.0412 110.1587 14.71788085535295
COSMOS 2251 DEB         
1 40224U 93036BVD 24321.30929310  .00081971  00000+0  58336-2 0  9994
2 40224  73.9848 269.7833 0067561 299.9492 211.4091 15.02364961541465
COSMOS 2251 DEB         
1 40228U 93036BVH 24321.18409872  .00002988  00000+0  95918-3 0  9999
2 40228  74.0553 263.7077 0022137  64.3250 358.3920 14.39729862532831
COSMOS 2251 DEB         
1 40230U 93036BVK 24319.06568465  .00005771  00000+0  16252-2 0  9996
2 40230  74.0491 243.1758 0017895  36.0840 335.7629 14.45934323707206
COSMOS 2251 DEB         
1 40233U 93036BVN 24321.47791944  .00007767  00000+0  18668-2 0  9997
2 40233  73.9506 129.1532 0051227 292.5236  67.0507 14.52702648699775
COSMOS 2251 DEB         
1 40236U 93036BVR 24293.70309052  .00005336  00000+0  57947-2 0  9992
2 40236  73.5376  83.4476 0542403   2.0786 358.2378 13.23188478480789
COSMOS 2251 DEB         
1 40237U 93036BVS 24317.72046005  .00023638  00000+0  36724-2 0  9993
2 40237  74.0382 115.7000 0002695 186.0685 185.4399 14.72987500580333
COSMOS 2251 DEB         
1 40238U 93036BVT 24320.23008225  .00006852  00000+0  70493-2 0  9996
2 40238  73.9868 305.6294 0560555 352.4672   6.8244 13.23099762488404
COSMOS 2251 DEB         
1 40239U 93036BVU 24320.24775689  .00003245  00000+0  64978-3 0  9998
2 40239  74.0312 306.2681 0087792 158.5732 213.8714 14.59771972538797
COSMOS 2251 DEB         
1 40792U 93036BVV 24318.63922493  .00011490  00000+0  23470-2 0  9991
2 40792  74.0503  84.4549 0020267 292.1868  79.1756 14.60820901713399
COSMOS 2251 DEB         
1 40793U 93036BVW 24313.82240827  .00002568  00000+0  13256-2 0  9999
2 40793  73.9779 144.0784 0219198  27.2886 333.9564 14.03918945626436
COSMOS 2251 DEB         
1 40794U 93036BVX 24319.32684234  .00025647  00000+0  43768-2 0  9999
2 40794  73.9849 181.8195 0021059  45.3360  75.5816 14.68713314561043
COSMOS 2251 DEB         
1 40796U 93036BVZ 24320.35841729  .00010270  00000+0  15021-2 0  9997
2 40796  74.0179 194.0712 0062062  70.7867  48.0724 14.74435032703593
COSMOS 2251 DEB         
1 40797U 93036BWA 24314.95139163  .00034387  00000+0  26623-2 0  9994
2 40797  73.9299 195.8624 0092108 203.7178 167.6240 14.97939127676356
COSMOS 2251 DEB         
1 40798U 93036BWB 24300.07878262  .00109714  00000+0  10434-1 0  9992
2 40798  74.0265  62.8170 0006659  43.3270 316.8435 14.92813758531932
COSMOS 2251 DEB         
1 40799U 93036BWC 24321.84674275  .00007580  00000+0  65865-3 0  9997
2 40799  73.9272 170.9822 0130816 146.0156 214.9494 14.90709873741397
COSMOS 2251 DEB         
1 40802U 93036BWF 24321.91972496  .00005637  00000+0  86411-3 0  9997
2 40802  74.0428 196.7711 0067572  36.7192 323.8580 14.72327783586459
COSMOS 2251 DEB         
1 40803U 93036BWG 24320.57600091  .00003098  00000+0  79786-3 0  9994
2 40803  74.0159  70.6367 0033989  20.1667 340.0827 14.50189930530648
COSMOS 2251 DEB         
1 40808U 93036BWM 24321.04854564  .00014460  00000+0  31089-2 0  9996
2 40808  74.0456 176.6463 0011191 310.5833 200.0910 14.58517920578898
COSMOS 2251 DEB         
1 40810U 93036BWP 24320.11886961  .00006439  00000+0  15052-2 0  9991
2 40810  74.0374 100.2825 0020305 345.4868  14.5709 14.54721983559656
COSMOS 2251 DEB         
1 46271U 93036BWT 24318.66774133  .00002849  00000+0  73600-3 0  9997
2 46271  74.0485  98.6283 0042608 316.3164  43.4626 14.49877681789273
COSMOS 2251 DEB         
1 46430U 93036BWU 24319.43710250  .00009525  00000+0  26665-2 0  9996
2 46430  73.9182  17.5865 0115284  20.4714 340.1005 14.42334226739924
COSMOS 2251 DEB         
1 46432U 93036BWW 24318.91040831  .00001679  00000+0  17377-2 0  9993
2 46432  73.8751  11.4635 0476438 195.8448 339.8853 13.35886832617058
COSMOS 2251 DEB         
1 47045U 93036BWZ 24320.30943079  .00000513  00000+0  17531-3 0  9995
2 47045  74.0574 151.8124 0028881  30.3185 143.3360 14.38559111 21616
COSMOS 2251 DEB         
1 47048U 93036BXC 24319.34718883  .00011046  00000+0  27258-2 0  9992
2 47048  73.9815 339.6461 0154554 259.6584 110.5961 14.45176457539928
COSMOS 2251 DEB         
1 47051U 93036BXF 24316.68470028  .00003627  00000+0  29704-2 0  9990
2 47051  74.1006 109.9004 0348471 315.7242  54.4219 13.65187773635255
COSMOS 2251 DEB         
1 47052U 93036BXG 24317.84318277  .00001846  00000+0  65074-3 0  9999
2 47052  74.0504 343.6264 0059209 157.8096  15.4972 14.34505476561244
COSMOS 2251 DEB         
1 47053U 93036BXH 24318.87407854  .00002792  00000+0  23958-2 0  9999
2 47053  74.0572 170.7973 0384119  70.9473 304.4262 13.58149971235386
COSMOS 2251 DEB         
1 47059U 93036BXP 24314.79770619  .00120172  00000+0  15073-1 0  9995
2 47059  73.9924 320.9407 0027121 235.0304 298.6725 14.81216206 23562
COSMOS 2251 DEB         
1 47061U 93036BXR 24321.29535593  .00033846  00000+0  38999-2 0  9995
2 47061  74.0085 271.0952 0042529 242.3762 269.3864 14.84885314585044
COSMOS 2251 DEB         
1 47062U 93036BXS 24313.95009046  .00004723  00000+0  36759-2 0  9993
2 47062  74.0854  14.9508 0329452 233.1084 309.2569 13.70134655501366
COSMOS 2251 DEB         
1 47068U 93036BXY 24319.05791188  .00006874  00000+0  18291-2 0  9991
2 47068  74.0274 224.5965 0017793  47.5774 312.6887 14.48613331560465
COSMOS 2251 DEB         
1 47070U 93036BYA 24321.65835337  .00083934  00000+0  75311-2 0  9996
2 47070  74.0541  96.2613 0014586 202.5165 169.0702 14.95204049582821
COSMOS 2251 DEB         
1 47073U 93036BYD 24319.28145474  .00001652  00000+0  94778-3 0  9997
2 47073  74.0840 165.8670 0164200 299.3381  59.1437 14.03613123548388
COSMOS 2251 DEB         
1 47074U 93036BYE 24320.72893152  .00010863  00000+0  37644-2 0  9994
2 47074  74.0911 302.6910 0149089  71.8969  99.9416 14.29619256 27246
COSMOS 2251 DEB         
1 53093U 93036BYP 24321.08925266  .00006875  00000+0  22408-2 0  9994
2 53093  74.0364 305.7387 0018480 129.2914 230.9883 14.38744483120864
`;const z3="2024-11-17T23:05:00Z";var T3={capturedAtUtc:z3};const v2=Date.parse(T3.capturedAtUtc),N3=[{group:"stations",text:f3},{group:"cosmos-1408-debris",text:x3},{group:"iridium-33-debris",text:u3},{group:"cosmos-2251-debris",text:g3}],l2=R3(N3,v2),q2=l2.map(S=>S.object);new Map(l2.map(S=>[S.object.norad,S]));q2.reduce((S,O)=>({...S,[O.type]:S[O.type]+1}),{PAYLOAD:0,"ROCKET BODY":0,DEBRIS:0});l2.reduce((S,O)=>({...S,[O.group]:(S[O.group]??0)+1}),{});q2.length;const X2={LARGE:.05,MEDIUM:.034,SMALL:.02},Y2={LARGE:.05,MEDIUM:.15,SMALL:.35};function y3(S,O){return .9+.055*(S.age+O.age)+Y2[S.rcs]+Y2[O.rcs]}function L3(S,O,o){const t=2*o*o;return O*O/t*Math.exp(-(S*S)/t)}function L2(S,O,o){const t=n2(S,o),D=n2(O,o);if(!(t!=null&&t.position)||!t.velocity||!(D!=null&&D.position)||!D.velocity)return null;const B=t.position.x-D.position.x,s=t.position.y-D.position.y,i=t.position.z-D.position.z,M=t.velocity.x-D.velocity.x,c=t.velocity.y-D.velocity.y,E=t.velocity.z-D.velocity.z,U=Math.sqrt(B*B+s*s+i*i);return U===0?{rate:0,range:0}:{rate:(B*M+s*c+i*E)/U,range:U}}function F3(S,O,o,t=90){const D=d=>new Date(o+d*1e3);let B=-t,s=t;const i=L2(S,O,D(B)),M=L2(S,O,D(s));if(!i||!M||!(i.rate<0&&M.rate>0))return null;for(let d=0;d<24;d++){const R=(B+s)/2,m=L2(S,O,D(R));if(!m)return null;m.rate<0?B=R:s=R}const c=o+(B+s)/2*1e3,E=new Date(c),U=n2(S,E),e=n2(O,E);return!(U!=null&&U.position)||!U.velocity||!(e!=null&&e.position)||!e.velocity?null:{tca:c,missKm:Math.hypot(U.position.x-e.position.x,U.position.y-e.position.y,U.position.z-e.position.z),relvKms:Math.hypot(U.velocity.x-e.velocity.x,U.velocity.y-e.velocity.y,U.velocity.z-e.velocity.z)}}function K3(S,O,o,t,D){const B=[];for(let s=0;s<D;s++){const i=-t+s/(D-1)*t*2,M=new Date(o+i*6e4),c=n2(S,M),E=n2(O,M);!(c!=null&&c.position)||!(E!=null&&E.position)||B.push({t:i,sep:Math.hypot(c.position.x-E.position.x,c.position.y-E.position.y,c.position.z-E.position.z)})}return B}const G3=398600.4418,G2=60,F2=15*G2/2,P3=100;function H3(S){const O=S.no/60,o=Math.cbrt(G3/(O*O));return[o*(1-S.ecco),o*(1+S.ecco)]}function W3(S,{start:O,hours:o,onProgress:t}){const D=Date.now(),B=Math.round(o*3600/G2),s=S.length,i=s*(s-1)/2,M=S.map(H3),c=[],E=[];for(let I=0;I<s;I++)for(let u=I+1;u<s;u++)M[I][0]-M[u][1]>F2||M[u][0]-M[I][1]>F2||(c.push(I),E.push(u));const U=c.length,e=new Float64Array(U).fill(1/0),d=new Float64Array(U).fill(0),R=new Float64Array(U),m=new Float64Array(s),T=new Float64Array(s),x=new Float64Array(s),y=new Uint8Array(s);let N=0;const G=O.getTime();for(let I=0;I<B;I++){const u=G+I*G2*1e3,P=new Date(u);for(let g=0;g<s;g++){const z=n2(S[g],P);N++,z!=null&&z.position?(m[g]=z.position.x,T[g]=z.position.y,x[g]=z.position.z,y[g]=1):y[g]=0}for(let g=0;g<U;g++){const z=c[g],h=E[g];if(!y[z]||!y[h])continue;const k=m[z]-m[h],v=T[z]-T[h],$=x[z]-x[h],p=Math.sqrt(k*k+v*v+$*$);p<e[g]&&(e[g]=p,R[g]=u),p>d[g]&&(d[g]=p)}t&&!(I&15)&&t(I/B)}t==null||t(1);const a=[];let C=0;for(let I=0;I<U;I++)if(!(e[I]>F2)){if(d[I]<P3){C++;continue}a.push({i:c[I],j:E[I],d:e[I],t:R[I]})}return{candidates:a,cascade:{objects:s,totalPairs:i,afterRadialFilter:U,candidates:a.length,coOrbiting:C,propagations:N,steps:B,elapsedMs:Date.now()-D}}}function j2(S){return S>=.001?"CRITICAL":S>=1e-4?"HIGH":S>=1e-5?"MEDIUM":S>=1e-7?"LOW":"NOMINAL"}const V3={NOMINAL:[2,24],LOW:[25,49],MEDIUM:[50,69],HIGH:[70,89],CRITICAL:[90,99]},X3={NOMINAL:[1e-12,1e-7],LOW:[1e-7,1e-5],MEDIUM:[1e-5,1e-4],HIGH:[1e-4,.001],CRITICAL:[.001,.1]},K2=S=>Math.max(0,Math.min(1,S)),Y3=.7,J3=.2,Q3=.1;function b3({pc:S,relv:O,maxAge:o}){const t=j2(S),[D,B]=V3[t],[s,i]=X3[t],M=K2((Math.log10(Math.max(S,s))-Math.log10(s))/(Math.log10(i)-Math.log10(s))),c=K2((O-1.5)/(15-1.5)),E=K2(o/7),U=Y3*M+J3*c+Q3*E;return Math.round(D+U*(B-D))}const J2=25,Z3=40,v3=121,q3=(S,O)=>`CJ-${String(Math.min(S,O)).padStart(5,"0")}-${String(Math.max(S,O)).padStart(5,"0")}`;function j3(S,{start:O,hours:o,onProgress:t,includeSeparation:D=!0}){const B=S.map(U=>U.rec),{candidates:s,cascade:i}=W3(B,{start:O,hours:o,onProgress:U=>t==null?void 0:t(U,"screen")}),M=[];let c=0,E=0;for(let U=0;U<s.length;U++){const e=s[U],d=S[e.i].object,R=S[e.j].object,m=F3(B[e.i],B[e.j],e.t,90);if(!m){c++;continue}if(m.missKm>J2){E++;continue}const T=Math.max(d.age,R.age),x=y3(d,R),y=X2[d.rcs]+X2[R.rcs],N=L3(m.missKm,y,x),G=+m.missKm.toFixed(3),a=+m.relvKms.toFixed(3);M.push({id:q3(d.norad,R.norad),a:d.norad,b:R.norad,tca:m.tca,tcaMin:+((m.tca-O.getTime())/6e4).toFixed(2),miss:G,relv:a,pc:N,sev:j2(N),score:b3({pc:N,relv:a,maxAge:T}),maxAge:+T.toFixed(2),sigma:+x.toFixed(2),separation:D?K3(B[e.i],B[e.j],m.tca,Z3,v3):[]}),U&63||t==null||t(U/s.length,"refine")}return t==null||t(1,"refine"),M.sort((U,e)=>U.tca-e.tca),{conjunctions:M,cascade:{...i,events:M.length,unbracketed:c,beyondGate:E,gateKm:J2,horizonHours:o,startUtc:O.toISOString()}}}self.onmessage=S=>{const O=o=>self.postMessage(o);try{const{conjunctions:o,cascade:t}=j3(l2,{start:new Date(v2),hours:S.data.hours,includeSeparation:!1,onProgress:(D,B)=>O({kind:"progress",stage:B,fraction:D})});O({kind:"done",conjunctions:o,cascade:t})}catch(o){O({kind:"error",message:o instanceof Error?o.message:String(o)})}};
