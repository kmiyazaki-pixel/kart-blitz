// courses/desert.js — 砂漠コース（3xスケール・幅28・砂嵐）

var Course = {
  id:   'desert',
  name: '砂漠コース',
  laps:  3,

  // S字＋ヘアピン×3（3xスケール）周長約900
  controlPoints: [
    [0,0],[150,0],[255,30],[300,105],[270,195],
    [195,240],[120,240],[45,210],[0,150],
    [-30,75]
  ],
  trackWidth: 28,
  trackSegs:  200,

  startX:     0,
  startZ:     12,
  startAngle: Math.PI / 2,
  gateX:      3,

  skyColor: 0xd4843a,
  fogColor: 0xc8722a,
  fogNear:  100,
  fogFar:   280,

  buildGround: function(scene) {
    var c=document.createElement('canvas');c.width=256;c.height=256;
    var x=c.getContext('2d');
    x.fillStyle='#c8922a';x.fillRect(0,0,256,256);
    for(var i=0;i<5000;i++){
      var v=170+Math.floor(Math.random()*60),g2=Math.floor(v*0.65),b=Math.floor(v*0.25);
      x.fillStyle='rgb('+v+','+g2+','+b+')';
      x.fillRect(Math.random()*256,Math.random()*256,Math.random()*3+1,Math.random()*2+1);
    }
    for(var i=0;i<15;i++){
      var y2=Math.random()*256;
      x.strokeStyle='rgba(100,55,10,0.15)';x.lineWidth=Math.random()*3+1;
      x.beginPath();x.moveTo(0,y2);x.bezierCurveTo(64,y2-20,192,y2+20,256,y2);x.stroke();
    }
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(35,35);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(800,700),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2;gnd.position.set(135,-0.05,120);
    gnd.receiveShadow=true;scene.add(gnd);
  },

  itemBoxes: [
    [0.10,0,0],[0.22,8,0],[0.35,-8,0],
    [0.48,0,0],[0.60,8,0],[0.72,-8,0],[0.85,0,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 16 },
    { startT: 0.08,  maxSpd: 18 },
    { startT: 0.12,  maxSpd: 15 }
  ],

  cpuColors: [
    [0xff8800, 0x884400],
    [0xddcc00, 0x887700],
    [0xff4422, 0x882211]
  ],

  buildScenery: function(scene) {
    var extras = { sandParticles:null, sandPos:null };

    // 砂丘
    [[-80,75,45,15,10],[-85,180,55,18,12],[360,60,50,16,11],
     [355,180,58,20,13],[70,-55,40,13,9],[70,310,45,15,10]].forEach(function(d) {
      var dg=new THREE.Mesh(new THREE.SphereGeometry(d[2],10,6,0,Math.PI*2,0,Math.PI/2),
        new THREE.MeshLambertMaterial({color:0xc8882a}));
      dg.scale.set(1,d[3]/d[2],d[4]/d[2]);dg.position.set(d[0],0,d[1]);dg.castShadow=true;scene.add(dg);
    });

    // サボテン
    [[-55,50],[-58,150],[-52,220],[340,45],[342,150],[338,210],
     [80,-38],[80,295]].forEach(function(cp) {
      var g=new THREE.Group();
      var mat=new THREE.MeshLambertMaterial({color:0x2d7a2d});
      var trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.0,8,8),mat);
      trunk.position.y=4;g.add(trunk);
      var aL=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,4,8),mat);
      aL.rotation.z=-Math.PI/2.5;aL.position.set(-2.4,5.5,0);g.add(aL);
      var aLt=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,2.5,8),mat);
      aLt.position.set(-4.2,7,0);g.add(aLt);
      var aR=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,3.5,8),mat);
      aR.rotation.z=Math.PI/2.8;aR.position.set(2.2,4.5,0);g.add(aR);
      var aRt=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,2,8),mat);
      aRt.position.set(3.8,5.8,0);g.add(aRt);
      g.position.set(cp[0],0,cp[1]);g.rotation.y=Math.random()*Math.PI*2;scene.add(g);
    });

    // 岩
    [[-40,110,8,6],[330,110,9,7],[-38,220,7,5],[328,220,8,6],
     [100,-28,7,5],[100,280,8,6]].forEach(function(r) {
      var rm=new THREE.Mesh(new THREE.DodecahedronGeometry(r[2],1),new THREE.MeshLambertMaterial({color:0x8a6a3a}));
      rm.scale.y=r[3]/r[2];rm.position.set(r[0],r[3]/2,r[1]);
      rm.rotation.y=Math.random()*Math.PI;rm.castShadow=true;scene.add(rm);
    });

    // 砂岩の崖
    [[-130,120,16,50,80],[-132,60,12,40,55],[365,120,16,50,80],[363,60,12,40,55],
     [135,-85,80,40,16],[135,345,80,40,16]].forEach(function(cl) {
      var cm=new THREE.Mesh(new THREE.BoxGeometry(cl[2],cl[3],cl[4]),new THREE.MeshLambertMaterial({color:0xb07030}));
      cm.position.set(cl[0],cl[3]/2,cl[1]);cm.castShadow=true;scene.add(cm);
    });

    // 太陽
    var sunMesh=new THREE.Mesh(new THREE.SphereGeometry(18,16,16),new THREE.MeshBasicMaterial({color:0xffcc44,transparent:true,opacity:0.9}));
    sunMesh.position.set(500,120,-120);scene.add(sunMesh);
    var corona=new THREE.Mesh(new THREE.SphereGeometry(22,16,16),new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:0.3}));
    corona.position.set(500,120,-120);scene.add(corona);

    // 砂嵐パーティクル
    var sandCount=800,sandGeo=new THREE.BufferGeometry();
    var sandPos=new Float32Array(sandCount*3);
    for(var i=0;i<sandCount;i++){
      sandPos[i*3]  =(Math.random()-0.5)*350+135;
      sandPos[i*3+1]=Math.random()*30;
      sandPos[i*3+2]=(Math.random()-0.5)*280+120;
    }
    sandGeo.setAttribute('position',new THREE.BufferAttribute(sandPos,3));
    var sandMat=new THREE.PointsMaterial({color:0xd4a050,size:0.45,transparent:true,opacity:0.55});
    var sandStorm=new THREE.Points(sandGeo,sandMat);
    scene.add(sandStorm);
    extras.sandParticles=sandStorm;
    extras.sandPos=sandPos;

    return extras;
  },

  animateScenery: function(extras, frm) {
    if(!extras||!extras.sandParticles)return;
    var pos=extras.sandPos;
    for(var i=0;i<pos.length/3;i++){
      pos[i*3]  +=0.22+Math.sin(frm*0.02+i*0.3)*0.08;
      pos[i*3+1]+=(-0.06+Math.cos(frm*0.015+i*0.2)*0.04);
      pos[i*3+2]+=Math.sin(frm*0.01+i*0.4)*0.05;
      if(pos[i*3]>310){pos[i*3]=-40+Math.random()*20;}
      if(pos[i*3+1]<0){pos[i*3+1]=26+Math.random()*5;}
      if(pos[i*3+1]>32){pos[i*3+1]=Math.random()*3;}
    }
    extras.sandParticles.geometry.attributes.position.needsUpdate=true;
    extras.sandParticles.material.opacity=0.35+Math.sin(frm*0.008)*0.2;
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
    [-15,15].forEach(function(sx) {
      var pillar=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.5,14,8),new THREE.MeshLambertMaterial({color:0xb07030}));
      pillar.position.set(sx,7,0);pillar.castShadow=true;scene.add(pillar);
      var cap=new THREE.Mesh(new THREE.ConeGeometry(1.8,3,8),new THREE.MeshLambertMaterial({color:0x8a5020}));
      cap.position.set(sx,15.5,0);scene.add(cap);
    });
  }
};
