// courses/volcano.js — 火山コース（3xスケール・幅28・降灰）

var Course = {
  id:   'volcano',
  name: '火山コース',
  laps:  3,
  nightMode: true,

  controlPoints: [
    [0,0],[135,0],[240,15],[315,60],[345,135],
    [324,210],[264,264],[186,285],[114,270],[54,225],
    [24,156],[45,90],[105,54],[180,45],[255,66],
    [300,126],[294,195],[246,240],[174,255],[90,234],
    [30,174],[15,105],[60,45],[144,15]
  ],
  trackWidth: 28,
  trackSegs:  240,

  startX:     0,
  startZ:     12,
  startAngle: Math.PI / 2,
  gateX:      3,

  skyColor: 0x2a0e08,
  fogColor: 0x3a1408,
  fogNear:  60,
  fogFar:   200,

  buildGround: function(scene) {
    var c=document.createElement('canvas');c.width=256;c.height=256;
    var x=c.getContext('2d');
    x.fillStyle='#1a0a04';x.fillRect(0,0,256,256);
    for(var i=0;i<3000;i++){
      var v=20+Math.floor(Math.random()*25);
      x.fillStyle='rgb('+(v+8)+','+v+','+(v-5)+')';
      x.fillRect(Math.random()*256,Math.random()*256,Math.random()*4+1,Math.random()*3+1);
    }
    var cracks=[[[20,30],[80,60],[140,45],[200,70]],[[10,120],[60,100],[120,130],[180,110]],[[30,200],[90,180],[150,210],[220,195]]];
    cracks.forEach(function(pts){
      var grad=x.createLinearGradient(pts[0][0],pts[0][1],pts[3][0],pts[3][1]);
      grad.addColorStop(0,'rgba(255,80,0,0)');grad.addColorStop(0.5,'rgba(255,120,0,0.6)');grad.addColorStop(1,'rgba(255,80,0,0)');
      x.strokeStyle=grad;x.lineWidth=2;
      x.beginPath();x.moveTo(pts[0][0],pts[0][1]);x.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);x.stroke();
    });
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(35,35);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(800,700),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2;gnd.position.set(172,-0.05,142);
    gnd.receiveShadow=true;scene.add(gnd);
  },

  itemBoxes: [
    [0.08,0,0],[0.18,8,0],[0.28,-8,0],
    [0.40,0,0],[0.52,8,0],[0.62,-8,0],
    [0.74,0,0],[0.86,8,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 15 },
    { startT: 0.08,  maxSpd: 17 },
    { startT: 0.12,  maxSpd: 14 }
  ],

  cpuColors: [
    [0xff4400, 0x882200],
    [0xff8800, 0x884400],
    [0xffaa00, 0x886600]
  ],

  buildScenery: function(scene) {
    var extras = { ashParticles:null, ashPos:null, lavaGlows:[], emberList:[] };
    var vx=172, vz=142;

    // 火山本体
    var vbody=new THREE.Mesh(new THREE.ConeGeometry(130,160,12),new THREE.MeshLambertMaterial({color:0x1e0a04}));
    vbody.position.set(vx,80,vz);vbody.castShadow=true;scene.add(vbody);
    var vmid=new THREE.Mesh(new THREE.ConeGeometry(80,100,12),new THREE.MeshLambertMaterial({color:0x2a1008}));
    vmid.position.set(vx,50,vz);scene.add(vmid);
    var crater=new THREE.Mesh(new THREE.CylinderGeometry(18,28,12,12),new THREE.MeshBasicMaterial({color:0xff4400}));
    crater.position.set(vx,162,vz);scene.add(crater);
    var lavaPool=new THREE.Mesh(new THREE.CircleGeometry(16,12),new THREE.MeshBasicMaterial({color:0xff6600}));
    lavaPool.rotation.x=-Math.PI/2;lavaPool.position.set(vx,168,vz);scene.add(lavaPool);
    var craterLight=new THREE.PointLight(0xff4400,4,280);
    craterLight.position.set(vx,168,vz);scene.add(craterLight);
    extras.lavaGlows.push(craterLight);

    // 溶岩流
    [[vx-38,vz+48,18,9],[vx+44,vz-28,14,7],[vx-48,vz-36,16,8],[vx+24,vz+52,20,10]].forEach(function(lf){
      var lm=new THREE.Mesh(new THREE.PlaneGeometry(lf[2]*2,lf[3]*2),new THREE.MeshBasicMaterial({color:0xff5500,transparent:true,opacity:0.85}));
      lm.rotation.x=-Math.PI/2;lm.position.set(lf[0],0.1,lf[1]);scene.add(lm);
      var lpl=new THREE.PointLight(0xff4400,1.5,40);
      lpl.position.set(lf[0],1,lf[1]);scene.add(lpl);
      extras.lavaGlows.push(lpl);
    });

    // 岩
    [[-45,55,10,7],[ 295,45,9,6.5],[-38,162,8,6],[288,170,10,7],
     [-36,230,9,6.5],[290,240,8,6],[62,-30,8,6],[62,330,9,6.5],
     [280,-28,8,6],[280,325,9,6.5]].forEach(function(r){
      var col=Math.random()<0.5?0x3a1a0a:0x2a1006;
      var rm=new THREE.Mesh(new THREE.DodecahedronGeometry(r[2],1),new THREE.MeshLambertMaterial({color:col}));
      rm.scale.y=r[3]/r[2];rm.position.set(r[0],r[3]/2,r[1]);
      rm.rotation.y=Math.random()*Math.PI;rm.castShadow=true;scene.add(rm);
    });

    // 降灰
    var ashCount=600,ashGeo=new THREE.BufferGeometry();
    var ashPosArr=new Float32Array(ashCount*3);
    for(var i=0;i<ashCount;i++){
      ashPosArr[i*3]  =(Math.random()-0.5)*380+172;
      ashPosArr[i*3+1]=Math.random()*50;
      ashPosArr[i*3+2]=(Math.random()-0.5)*320+142;
    }
    ashGeo.setAttribute('position',new THREE.BufferAttribute(ashPosArr,3));
    var ashMat=new THREE.PointsMaterial({color:0x553322,size:0.38,transparent:true,opacity:0.6});
    var ash=new THREE.Points(ashGeo,ashMat);
    scene.add(ash);
    extras.ashParticles=ash;
    extras.ashPos=ashPosArr;

    // 炎エンバー
    for(var j=0;j<10;j++){
      var angle=j/10*Math.PI*2;
      var ex=vx+Math.cos(angle)*24, ez=vz+Math.sin(angle)*24;
      var ember=new THREE.Mesh(new THREE.SphereGeometry(0.8,6,6),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:0.8}));
      ember.position.set(ex,168+Math.random()*8,ez);scene.add(ember);
      extras.emberList.push({mesh:ember,baseY:168,angle:angle,speed:0.05+Math.random()*0.05,phase:Math.random()*Math.PI*2});
    }

    // 補助ライト
    var r1=new THREE.DirectionalLight(0xff3300,1.0);r1.position.set(vx,120,vz);scene.add(r1);
    var r2=new THREE.DirectionalLight(0xff6600,0.6);r2.position.set(0,40,0);scene.add(r2);

    return extras;
  },

  animateScenery: function(extras, frm) {
    if(!extras)return;
    if(extras.ashParticles&&extras.ashPos){
      var pos=extras.ashPos;
      for(var i=0;i<pos.length/3;i++){
        pos[i*3]  +=Math.sin(frm*0.015+i*0.4)*0.10;
        pos[i*3+1]-=0.06+Math.random()*0.02;
        pos[i*3+2]+=Math.cos(frm*0.012+i*0.3)*0.08;
        if(pos[i*3+1]<0){pos[i*3+1]=44+Math.random()*8;pos[i*3]=(Math.random()-0.5)*380+172;pos[i*3+2]=(Math.random()-0.5)*320+142;}
      }
      extras.ashParticles.geometry.attributes.position.needsUpdate=true;
    }
    extras.lavaGlows.forEach(function(light,i){
      if(light.intensity!==undefined)light.intensity=light.intensity*0.95+(Math.sin(frm*0.08+i*1.2)*0.5+2.5)*0.05;
    });
    extras.emberList.forEach(function(e){
      e.phase+=e.speed;
      e.mesh.position.y=e.baseY+Math.sin(e.phase)*6+Math.random()*0.5;
      e.mesh.position.x+=Math.cos(e.angle)*0.06;
      e.mesh.position.z+=Math.sin(e.angle)*0.06;
      e.mesh.material.opacity=0.5+Math.sin(e.phase*1.5)*0.35;
      var dx=e.mesh.position.x-172,dz=e.mesh.position.z-142;
      if(dx*dx+dz*dz>2500){e.mesh.position.set(172+Math.cos(e.angle)*24,168,142+Math.sin(e.angle)*24);}
    });
  },

  buildFinish: function(scene) {
    var ftc=document.createElement('canvas');ftc.width=256;ftc.height=32;
    var ftx=ftc.getContext('2d');
    for(var i=0;i<16;i++){
      ftx.fillStyle=i%2===0?'#000':'#fff';ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle=i%2===0?'#fff':'#000';ftx.fillRect(i*16,16,16,16);
    }
    var fin=new THREE.Mesh(new THREE.PlaneGeometry(2.5,28),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)}));
    fin.rotation.x=-Math.PI/2;fin.position.set(4,0.06,0);scene.add(fin);
    [-15,15].forEach(function(sx){
      var pillar=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.5,14,8),new THREE.MeshLambertMaterial({color:0x2a1008}));
      pillar.position.set(sx,7,0);pillar.castShadow=true;scene.add(pillar);
      var glow=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.6,14.2,8),new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:0.25}));
      glow.position.set(sx,7,0);scene.add(glow);
      var top=new THREE.Mesh(new THREE.SphereGeometry(1.8,8,8),new THREE.MeshBasicMaterial({color:0xff5500}));
      top.position.set(sx,14.5,0);scene.add(top);
      var tl=new THREE.PointLight(0xff4400,2,30);tl.position.set(sx,15,0);scene.add(tl);
    });
  }
};
