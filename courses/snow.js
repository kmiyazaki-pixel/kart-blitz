// courses/snow.js — 雪山コース（3xスケール・幅28・吹雪）

var Course = {
  id:   'snow',
  name: '雪山コース',
  laps:  3,

  controlPoints: [
    [0,0],[105,0],[195,-15],[270,24],[315,84],
    [324,156],[294,216],[240,255],[174,270],[105,264],
    [36,240],[0,186],[-24,126],[-15,60],[24,24],
    [84,-15],[165,-30],[240,-6],[300,54],[324,132],
    [315,204],[264,252],[186,285],[96,288],[15,255],
    [-30,186],[-42,105],[-15,30]
  ],
  trackWidth: 28,
  trackSegs:  260,

  startX:     0,
  startZ:     12,
  startAngle: Math.PI / 2,
  gateX:      3,

  skyColor: 0x9ab8d4,
  fogColor: 0xc8dde8,
  fogNear:  80,
  fogFar:   240,

  buildGround: function(scene) {
    var c=document.createElement('canvas');c.width=256;c.height=256;
    var x=c.getContext('2d');
    x.fillStyle='#ddeeff';x.fillRect(0,0,256,256);
    for(var i=0;i<2000;i++){
      var v=215+Math.floor(Math.random()*40);
      x.fillStyle='rgb('+v+','+v+','+(v+5)+')';
      x.fillRect(Math.random()*256,Math.random()*256,Math.random()*4+1,Math.random()*3+1);
    }
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(38,38);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(800,700),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2;gnd.position.set(141,-0.05,129);
    gnd.receiveShadow=true;scene.add(gnd);
  },

  itemBoxes: [
    [0.08,0,0],[0.18,8,0],[0.28,-8,0],
    [0.40,0,0],[0.52,8,0],[0.62,-8,0],
    [0.74,0,0],[0.86,8,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 14 },
    { startT: 0.09,  maxSpd: 16 },
    { startT: 0.13,  maxSpd: 13 }
  ],

  cpuColors: [
    [0x4488ff, 0x224488],
    [0xaaddff, 0x446688],
    [0x88ccff, 0x335577]
  ],

  buildScenery: function(scene) {
    var extras = { snowParticles:null, snowPos:null };

    // 雪山
    [[-180,-50,65,38,0x8aaecc],[-188,215,55,32,0x7a9ebc],
     [380,-40,72,42,0x8aaecc],[385,240,62,36,0x7a9ebc],
     [120,-110,60,35,0x9ab8cc],[120,400,65,38,0x8aaecc]].forEach(function(m) {
      var body=new THREE.Mesh(new THREE.ConeGeometry(m[2],m[2]*1.4,9),new THREE.MeshLambertMaterial({color:m[4]}));
      body.position.set(m[0],m[2]*0.7,m[1]);body.castShadow=true;scene.add(body);
      var snow=new THREE.Mesh(new THREE.ConeGeometry(m[2]*0.55,m[2]*0.6,9),new THREE.MeshLambertMaterial({color:0xeef5ff}));
      snow.position.set(m[0],m[2]*1.12,m[1]);scene.add(snow);
      var snow2=new THREE.Mesh(new THREE.ConeGeometry(m[2]*0.32,m[2]*0.3,8),new THREE.MeshLambertMaterial({color:0xffffff}));
      snow2.position.set(m[0],m[2]*1.35,m[1]);scene.add(snow2);
    });

    // 雪をかぶった木
    [[-55,45],[-62,125],[-55,205],[310,30],[315,130],[308,205],
     [75,-70],[150,-72],[75,340],[150,342]].forEach(function(tp) {
      var s=0.9+Math.random()*0.4;
      var tk=new THREE.Mesh(new THREE.CylinderGeometry(0.4*s,0.8*s,5.5*s,7),new THREE.MeshLambertMaterial({color:0x3a2010}));
      tk.position.set(tp[0],2.75*s,tp[1]);tk.castShadow=true;scene.add(tk);
      [[6,9.5,0x1a4a1a],[4.8,12,0x224422],[3.4,14,0x2a542a],[2.2,16,0x326032]].forEach(function(f) {
        var cn=new THREE.Mesh(new THREE.ConeGeometry(f[0]*s,4.5*s,8),new THREE.MeshLambertMaterial({color:f[2]}));
        cn.position.set(tp[0],f[1]*s,tp[1]);cn.castShadow=true;scene.add(cn);
        var snc=new THREE.Mesh(new THREE.ConeGeometry(f[0]*s*0.85,1.2*s,8),new THREE.MeshLambertMaterial({color:0xeef5ff,transparent:true,opacity:0.85}));
        snc.position.set(tp[0],(f[1]+2.2)*s,tp[1]);scene.add(snc);
      });
    });

    // 雪だまり
    [[-30,85],[-32,168],[298,75],[296,175],[95,-35],[95,320]].forEach(function(sp) {
      var sm=new THREE.Mesh(new THREE.SphereGeometry(8,8,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xe8f0f8}));
      sm.position.set(sp[0],0,sp[1]);scene.add(sm);
    });

    // 吹雪
    var snowCount=700,snowGeo=new THREE.BufferGeometry();
    var snowPosArr=new Float32Array(snowCount*3);
    for(var i=0;i<snowCount;i++){
      snowPosArr[i*3]  =(Math.random()-0.5)*380+141;
      snowPosArr[i*3+1]=Math.random()*40;
      snowPosArr[i*3+2]=(Math.random()-0.5)*320+129;
    }
    snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPosArr,3));
    var snowMat=new THREE.PointsMaterial({color:0xeef5ff,size:0.28,transparent:true,opacity:0.75});
    var blizzard=new THREE.Points(snowGeo,snowMat);
    scene.add(blizzard);
    extras.snowParticles=blizzard;
    extras.snowPos=snowPosArr;

    // 雲
    var cMat=new THREE.MeshLambertMaterial({color:0xdde8f0,transparent:true,opacity:0.75});
    [[-120,60,-80,3],[ 80,58,-100,2.8],[240,62,-90,3.2],[380,58,-75,2.6]].forEach(function(cl) {
      var g=new THREE.Group();
      [[0,0,0,1.8],[2,0.4,0,1.4],[-1.8,0.3,0,1.3],[0.7,0.9,0,1.0]].forEach(function(sp) {
        var m=new THREE.Mesh(new THREE.SphereGeometry(sp[3]*cl[3],7,7),cMat);
        m.position.set(sp[0]*cl[3],sp[1]*cl[3],sp[2]*cl[3]);g.add(m);
      });
      g.position.set(cl[0],cl[1],cl[2]);scene.add(g);
    });

    return extras;
  },

  animateScenery: function(extras, frm) {
    if(!extras||!extras.snowParticles)return;
    var pos=extras.snowPos;
    for(var i=0;i<pos.length/3;i++){
      pos[i*3]  +=0.14+Math.sin(frm*0.018+i*0.5)*0.07;
      pos[i*3+1]-=0.10+Math.cos(frm*0.012+i*0.3)*0.04;
      pos[i*3+2]-=Math.sin(frm*0.01+i*0.4)*0.06;
      if(pos[i*3]>320){pos[i*3]=-80+Math.random()*15;}
      if(pos[i*3+1]<0){pos[i*3+1]=36+Math.random()*5;pos[i*3]=(Math.random()-0.5)*380+141;}
    }
    extras.snowParticles.geometry.attributes.position.needsUpdate=true;
    extras.snowParticles.material.opacity=0.55+Math.sin(frm*0.01)*0.2;
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
      var col=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.2,14,8),new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:0.85}));
      col.position.set(sx,7,0);scene.add(col);
      var cap=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,8),new THREE.MeshLambertMaterial({color:0xeef8ff}));
      cap.position.set(sx,14.5,0);scene.add(cap);
    });
    var beam=new THREE.Mesh(new THREE.BoxGeometry(32,0.8,0.8),new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:0.7}));
    beam.position.set(0,14.5,0);scene.add(beam);
  }
};
