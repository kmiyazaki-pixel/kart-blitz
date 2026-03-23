// courses/snow.js — 雪山コース（凍った路面・吹雪）

var Course = {
  id:   'snow',
  name: '雪山コース',
  laps:  3,

  // コース形状：山を登って下る螺旋気味のコース
  controlPoints: [
    [0,0],[35,0],[65,-5],[90,8],[105,28],
    [108,52],[98,72],[80,85],[58,90],[35,88],
    [12,80],[0,62],[-8,42],[-5,20],[8,8],
    [28,-5],[55,-10],[80,-2],[100,18],[108,44],
    [105,68],[88,84],[62,95],[32,96],[5,85],
    [-10,62],[-14,35],[-5,10]
  ],
  trackWidth: 14,
  trackSegs:  260,

  startX:     2,
  startZ:     5,
  startAngle: Math.PI / 2,

  gateX: 3,

  // 雪の空
  skyColor: 0x9ab8d4,
  fogColor: 0xc8dde8,
  fogNear:  50,
  fogFar:   180,

  groundTex: 'snow',

  // 凍結路面：コース上は滑りやすい（dragを弱める）
  iceMode: true,

  itemBoxes: [
    [0.08,0,0],[0.18,4,0],[0.28,-4,0],
    [0.38,0,0],[0.48,4,0],[0.58,-4,0],
    [0.68,0,0],[0.78,4,0],[0.88,-4,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 17 },
    { startT: 0.08,  maxSpd: 19 },
    { startT: 0.12,  maxSpd: 16 }
  ],

  cpuColors: [
    [0x4488ff, 0x224488],
    [0xaaddff, 0x446688],
    [0x88ccff, 0x335577]
  ],

  buildGround: function(scene) {
    var c = document.createElement('canvas'); c.width=256; c.height=256;
    var x = c.getContext('2d');
    x.fillStyle='#ddeeff'; x.fillRect(0,0,256,256);
    for (var i=0;i<2000;i++) {
      var v = 215+Math.floor(Math.random()*40);
      x.fillStyle='rgb('+v+','+v+','+(v+5)+')';
      x.fillRect(Math.random()*256,Math.random()*256,Math.random()*4+1,Math.random()*3+1);
    }
    // 雪の影（薄い青）
    for (var i=0;i<300;i++) {
      x.fillStyle='rgba(150,180,220,0.15)';
      x.beginPath();
      x.ellipse(Math.random()*256,Math.random()*256,Math.random()*20+5,Math.random()*10+3,Math.random()*Math.PI,0,Math.PI*2);
      x.fill();
    }
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(38,38);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(47,-0.05,43);
    gnd.receiveShadow=true; scene.add(gnd);
  },

  buildScenery: function(scene) {
    var extras = { snowParticles:null, snowPos:null };

    // ---- 雪山（背景） ----
    var mtnData = [
      [-70,-20, 80,50,0x8aaecc],[-75,50,  70,44,0x7a9ebc],[-65,100, 85,52,0x8aaecc],
      [155,-15, 75,48,0x7a9ebc],[158,55,  80,50,0x8aaecc],[152,105, 70,44,0x7a9ebc],
      [45,-60,  65,40,0x9ab8cc],[45,160,  70,44,0x8aaecc]
    ];
    mtnData.forEach(function(m) {
      var body=new THREE.Mesh(new THREE.ConeGeometry(m[2],m[2]*1.4,9),new THREE.MeshLambertMaterial({color:m[4]}));
      body.position.set(m[0],m[2]*0.7,m[1]); body.castShadow=true; scene.add(body);
      // 雪帽子（大きめ）
      var snow=new THREE.Mesh(new THREE.ConeGeometry(m[2]*0.55,m[2]*0.6,9),new THREE.MeshLambertMaterial({color:0xeef5ff}));
      snow.position.set(m[0],m[2]*1.12,m[1]); scene.add(snow);
      // 2段目の雪
      var snow2=new THREE.Mesh(new THREE.ConeGeometry(m[2]*0.32,m[2]*0.3,8),new THREE.MeshLambertMaterial({color:0xffffff}));
      snow2.position.set(m[0],m[2]*1.35,m[1]); scene.add(snow2);
    });

    // ---- 雪をかぶった木 ----
    var treePos=[
      [-22,18],[-25,48],[-20,80],[-22,108],
      [118,12],[120,48],[118,78],[116,108],
      [30,-28],[60,-30],[30,132],[60,135]
    ];
    treePos.forEach(function(tp) {
      var s=0.9+Math.random()*0.4;
      var tk=new THREE.Mesh(new THREE.CylinderGeometry(0.18*s,0.32*s,2.5*s,7),new THREE.MeshLambertMaterial({color:0x3a2010}));
      tk.position.set(tp[0],1.25*s,tp[1]); tk.castShadow=true; scene.add(tk);
      // 葉（雪で白っぽい）
      [[2.6,3.8,0x1a4a1a],[2.0,5.0,0x224422],[1.4,6.0,0x2a542a],[0.9,6.9,0x326032]].forEach(function(f) {
        var cn=new THREE.Mesh(new THREE.ConeGeometry(f[0]*s,1.8*s,8),new THREE.MeshLambertMaterial({color:f[2]}));
        cn.position.set(tp[0],f[1]*s,tp[1]); cn.castShadow=true; scene.add(cn);
        // 雪の積もり
        var snc=new THREE.Mesh(new THREE.ConeGeometry(f[0]*s*0.85,0.5*s,8),new THREE.MeshLambertMaterial({color:0xeef5ff,transparent:true,opacity:0.85}));
        snc.position.set(tp[0],(f[1]+0.9)*s,tp[1]); scene.add(snc);
      });
    });

    // ---- 氷柱（コース脇） ----
    var iciclePos=[[-14,28],[-14,58],[-13,88],[112,22],[112,58],[112,90],[22,-18],[22,128]];
    iciclePos.forEach(function(ip) {
      for (var j=0;j<4;j++) {
        var h=1.5+Math.random()*2.5;
        var ic=new THREE.Mesh(
          new THREE.ConeGeometry(0.25,h,6),
          new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:0.8})
        );
        ic.rotation.x=Math.PI; // 逆さにする
        ic.position.set(ip[0]+j*0.8-1.2, h/2+4, ip[1]+Math.random()*1.5-0.75);
        scene.add(ic);
      }
      // 氷柱の台（雪の棚）
      var shelf=new THREE.Mesh(new THREE.BoxGeometry(4,0.5,1.5),new THREE.MeshLambertMaterial({color:0xddeeff}));
      shelf.position.set(ip[0]+1,4,ip[1]); scene.add(shelf);
    });

    // ---- 雪だまり（コース脇の盛り上がり） ----
    var snowmoundPos=[[-10,35],[-12,65],[110,30],[110,70],[28,-12],[28,122]];
    snowmoundPos.forEach(function(sp) {
      var sm=new THREE.Mesh(
        new THREE.SphereGeometry(3.5,8,6,0,Math.PI*2,0,Math.PI/2),
        new THREE.MeshLambertMaterial({color:0xe8f0f8})
      );
      sm.position.set(sp[0],0,sp[1]); scene.add(sm);
    });

    // ---- 吹雪パーティクル ----
    var snowCount=700;
    var snowGeo=new THREE.BufferGeometry();
    var snowPosArr=new Float32Array(snowCount*3);
    for (var i=0;i<snowCount;i++) {
      snowPosArr[i*3]  =(Math.random()-0.5)*160+47;
      snowPosArr[i*3+1]=Math.random()*35;
      snowPosArr[i*3+2]=(Math.random()-0.5)*160+43;
    }
    snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPosArr,3));
    var snowMat=new THREE.PointsMaterial({color:0xeef5ff,size:0.22,transparent:true,opacity:0.75});
    var blizzard=new THREE.Points(snowGeo,snowMat);
    scene.add(blizzard);
    extras.snowParticles=blizzard;
    extras.snowPos=snowPosArr;

    // ---- 空を薄暗く（雲） ----
    var cloudMat=new THREE.MeshLambertMaterial({color:0xdde8f0,transparent:true,opacity:0.75});
    [[-40,60,-35,3],[30,58,-40,2.8],[90,62,-38,3.2],[150,58,-32,2.6],[-10,64,-50,2.4]].forEach(function(cl) {
      var g=new THREE.Group();
      [[0,0,0,1.8],[2,0.4,0,1.4],[-1.8,0.3,0,1.3],[0.7,0.9,0,1.0]].forEach(function(sp) {
        var m=new THREE.Mesh(new THREE.SphereGeometry(sp[3]*cl[3],7,7),cloudMat);
        m.position.set(sp[0]*cl[3],sp[1]*cl[3],sp[2]*cl[3]); g.add(m);
      });
      g.position.set(cl[0],cl[1],cl[2]); scene.add(g);
    });

    return extras;
  },

  animateScenery: function(extras, frm) {
    if (!extras) return;
    if (extras.snowParticles && extras.snowPos) {
      var pos=extras.snowPos;
      for (var i=0;i<pos.length/3;i++) {
        // 吹雪：横に流れながら落ちる
        pos[i*3]  += 0.12+Math.sin(frm*0.018+i*0.5)*0.06;
        pos[i*3+1]-= 0.08+Math.cos(frm*0.012+i*0.3)*0.03;
        pos[i*3+2]-= Math.sin(frm*0.01+i*0.4)*0.05;
        if (pos[i*3]>127)  { pos[i*3]=-33+Math.random()*10; }
        if (pos[i*3+1]<0)  { pos[i*3+1]=32+Math.random()*5; pos[i*3]=(Math.random()-0.5)*160+47; }
      }
      extras.snowParticles.geometry.attributes.position.needsUpdate=true;
      extras.snowParticles.material.opacity=0.55+Math.sin(frm*0.01)*0.2;
    }
  },

  buildFinish: function(scene) {
    var ftc=document.createElement('canvas');ftc.width=256;ftc.height=32;
    var ftx=ftc.getContext('2d');
    for(var i=0;i<16;i++){
      ftx.fillStyle=i%2===0?'#000':'#fff';ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle=i%2===0?'#fff':'#000';ftx.fillRect(i*16,16,16,16);
    }
    var fin=new THREE.Mesh(new THREE.PlaneGeometry(2.5,14),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)}));
    fin.rotation.x=-Math.PI/2; fin.position.set(4,0.06,0); scene.add(fin);
    // 雪のゲート（青白い氷の柱）
    [-8,8].forEach(function(sx) {
      var col=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.7,10,8),new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:0.85}));
      col.position.set(sx,5,0); scene.add(col);
      var cap=new THREE.Mesh(new THREE.SphereGeometry(0.9,8,8),new THREE.MeshLambertMaterial({color:0xeef8ff}));
      cap.position.set(sx,10.5,0); scene.add(cap);
    });
    var beam=new THREE.Mesh(new THREE.BoxGeometry(18,0.5,0.5),new THREE.MeshLambertMaterial({color:0xaaddff,transparent:true,opacity:0.7}));
    beam.position.set(0,10.5,0); scene.add(beam);
  }
};
