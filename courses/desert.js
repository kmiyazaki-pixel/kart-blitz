// courses/desert.js — 砂漠コース（急カーブ・砂嵐）

var Course = {
  id:   'desert',
  name: '砂漠コース',
  laps:  3,

  // コース形状：広いS字＋タイトなヘアピン連続
  controlPoints: [
    [0,0],[40,0],[75,-8],[100,5],[110,25],
    [100,45],[75,55],[55,65],[45,85],[55,105],
    [80,118],[110,115],[130,100],[135,75],
    [125,50],[110,35],[105,15],[115,-5],
    [135,-15],[150,0],[155,25],[145,50],
    [130,70],[115,90],[100,110],[80,130],
    [50,140],[20,135],[0,120],[-15,95],
    [-18,65],[-10,40]
  ],
  trackWidth: 15,
  trackSegs:  280,

  startX:     2,
  startZ:     5,
  startAngle: Math.PI / 2,

  gateX: 3,

  // 砂漠の空
  skyColor: 0xd4843a,
  fogColor: 0xc8722a,
  fogNear:  70,
  fogFar:   200,

  groundTex: 'sand',

  itemBoxes: [
    [0.07,0,0],[0.15,4,0],[0.24,-4,0],
    [0.33,0,0],[0.42,4,0],[0.52,-4,0],
    [0.61,0,0],[0.70,4,0],[0.80,-4,0],
    [0.90,0,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 19 },
    { startT: 0.08,  maxSpd: 21 },
    { startT: 0.12,  maxSpd: 18 }
  ],

  cpuColors: [
    [0xff8800, 0x884400],
    [0xddcc00, 0x887700],
    [0xff4422, 0x882211]
  ],

  // 砂漠専用地面（砂テクスチャ）
  buildGround: function(scene) {
    var c = document.createElement('canvas'); c.width=256; c.height=256;
    var x = c.getContext('2d');
    // ベース砂色
    x.fillStyle='#c8922a'; x.fillRect(0,0,256,256);
    // 砂のノイズ
    for (var i=0;i<5000;i++) {
      var v = 170 + Math.floor(Math.random()*60);
      var g = Math.floor(v*0.65);
      var b = Math.floor(v*0.25);
      x.fillStyle='rgb('+v+','+g+','+b+')';
      x.fillRect(Math.random()*256, Math.random()*256, Math.random()*3+1, Math.random()*2+1);
    }
    // 砂丘の影筋
    for (var i=0;i<15;i++) {
      var y2 = Math.random()*256;
      x.strokeStyle='rgba(100,55,10,0.15)';
      x.lineWidth = Math.random()*3+1;
      x.beginPath(); x.moveTo(0,y2); x.bezierCurveTo(64,y2-20,192,y2+20,256,y2); x.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(38,38);
    var gnd = new THREE.Mesh(new THREE.PlaneGeometry(600,600), new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x = -Math.PI/2; gnd.position.set(65,-0.05,65);
    gnd.receiveShadow = true; scene.add(gnd);
  },

  buildScenery: function(scene) {
    var extras = { sandParticles: null, sandPos: null, dunes: [], cacti: [] };

    // ---- 砂丘 ----
    var duneData = [
      [-30,30,  18,6,4],[-35,70,  22,7,5],[-30,110, 16,5,4],[-28,140, 20,6,5],
      [175,20,  20,7,5],[178,60,  24,8,6],[172,100, 18,6,4],[170,135, 22,7,5],
      [30,-25,  16,5,4],[80,-28,  20,6,5],[130,-22, 18,5,4],
      [20,158,  18,6,4],[70,162,  22,7,5],[120,158, 16,5,4]
    ];
    duneData.forEach(function(d) {
      // 砂丘本体
      var dg = new THREE.Mesh(
        new THREE.SphereGeometry(d[2], 10, 6, 0, Math.PI*2, 0, Math.PI/2),
        new THREE.MeshLambertMaterial({color:0xc8882a})
      );
      dg.scale.set(1, d[3]/d[2], d[4]/d[2]);
      dg.position.set(d[0], 0, d[1]);
      dg.castShadow = true; scene.add(dg);
      extras.dunes.push(dg);
      // 影側（少し暗い）
      var ds = new THREE.Mesh(
        new THREE.SphereGeometry(d[2]*0.9, 8, 5, Math.PI*0.3, Math.PI*0.8, 0, Math.PI/2),
        new THREE.MeshLambertMaterial({color:0x9a6018, transparent:true, opacity:0.5})
      );
      ds.scale.set(1, d[3]/d[2], d[4]/d[2]);
      ds.position.set(d[0]+d[2]*0.2, 0.1, d[1]+d[2]*0.1);
      scene.add(ds);
    });

    // ---- サボテン ----
    var cactusPos = [
      [-20,20],[-22,55],[-18,90],[-20,130],
      [165,18],[167,55],[163,95],[165,130],
      [35,-18],[80,-20],[125,-18],
      [25,155],[70,158],[115,155]
    ];
    cactusPos.forEach(function(cp) {
      var group = new THREE.Group();
      var mat = new THREE.MeshLambertMaterial({color:0x2d7a2d});
      // 幹
      var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,5,8), mat);
      trunk.position.y = 2.5; group.add(trunk);
      // 左腕
      var armL = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,2.5,8), mat);
      armL.rotation.z = -Math.PI/2.5; armL.position.set(-1.5,3.5,0); group.add(armL);
      var armLTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,1.5,8), mat);
      armLTop.position.set(-2.6,4.5,0); group.add(armLTop);
      // 右腕
      var armR = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,2,8), mat);
      armR.rotation.z = Math.PI/2.8; armR.position.set(1.4,2.8,0); group.add(armR);
      var armRTop = new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,1.2,8), mat);
      armRTop.position.set(2.4,3.6,0); group.add(armRTop);

      group.position.set(cp[0], 0, cp[1]);
      group.rotation.y = Math.random() * Math.PI * 2;
      group.castShadow = true;
      scene.add(group);
      extras.cacti.push(group);
    });

    // ---- 岩 ----
    var rockData = [
      [-15,40, 3.5,2.5,3],[170,40, 4,3,3.5],[-12,100, 2.8,2,2.5],
      [168,100,3.2,2.4,3],[40,-15,3,2.2,2.8],[100,-15,2.8,2,2.5],
      [45,160, 3.5,2.5,3],[100,160,3,2.2,2.8]
    ];
    rockData.forEach(function(r) {
      var rm = new THREE.Mesh(
        new THREE.DodecahedronGeometry(r[2], 1),
        new THREE.MeshLambertMaterial({color:0x8a6a3a})
      );
      rm.scale.set(1, r[3]/r[2], r[4]/r[2]);
      rm.position.set(r[0], r[3]/2, r[1]);
      rm.rotation.y = Math.random()*Math.PI;
      rm.castShadow = true; scene.add(rm);
    });

    // ---- 遠景：砂岩の崖 ----
    var cliffData = [
      [-55,65, 8,25,40],[-58,20, 6,20,30],[-52,110,10,30,45],
      [195,65, 8,25,40],[198,20, 6,20,30],[192,110,10,30,45],
      [65,-50, 40,20,8],[65,185, 40,20,8]
    ];
    cliffData.forEach(function(cl) {
      var cm = new THREE.Mesh(
        new THREE.BoxGeometry(cl[2],cl[3],cl[4]),
        new THREE.MeshLambertMaterial({color:0xb07030})
      );
      cm.position.set(cl[0], cl[3]/2, cl[1]);
      cm.castShadow = true; scene.add(cm);
      // 崖の段差
      var cm2 = new THREE.Mesh(
        new THREE.BoxGeometry(cl[2]*0.7, cl[3]*0.4, cl[4]*0.8),
        new THREE.MeshLambertMaterial({color:0xc88040})
      );
      cm2.position.set(cl[0], cl[3]*0.9, cl[1]);
      scene.add(cm2);
    });

    // ---- 砂嵐パーティクル ----
    var sandCount = 800;
    var sandGeo = new THREE.BufferGeometry();
    var sandPos = new Float32Array(sandCount * 3);
    for (var i = 0; i < sandCount; i++) {
      sandPos[i*3]   = (Math.random()-0.5)*180 + 65;
      sandPos[i*3+1] = Math.random() * 25;
      sandPos[i*3+2] = (Math.random()-0.5)*180 + 65;
    }
    sandGeo.setAttribute('position', new THREE.BufferAttribute(sandPos, 3));
    var sandMat = new THREE.PointsMaterial({color:0xd4a050, size:0.35, transparent:true, opacity:0.55});
    var sandStorm = new THREE.Points(sandGeo, sandMat);
    scene.add(sandStorm);
    extras.sandParticles = sandStorm;
    extras.sandPos = sandPos;

    // ---- 太陽（大きく・低め） ----
    var sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(12, 16, 16),
      new THREE.MeshBasicMaterial({color:0xffcc44, transparent:true, opacity:0.9})
    );
    sunMesh.position.set(200, 60, -60); scene.add(sunMesh);
    // 太陽のコロナ
    var corona = new THREE.Mesh(
      new THREE.SphereGeometry(15, 16, 16),
      new THREE.MeshBasicMaterial({color:0xff8800, transparent:true, opacity:0.3})
    );
    corona.position.set(200, 60, -60); scene.add(corona);

    return extras;
  },

  animateScenery: function(extras, frm) {
    if (!extras) return;
    // 砂嵐を風に乗せて流す
    if (extras.sandParticles && extras.sandPos) {
      var pos = extras.sandPos;
      var windX = 0.18, windY = -0.04;
      for (var i = 0; i < pos.length/3; i++) {
        pos[i*3]   += windX + Math.sin(frm*0.02 + i*0.3)*0.06;
        pos[i*3+1] += windY + Math.cos(frm*0.015 + i*0.2)*0.03;
        pos[i*3+2] += Math.sin(frm*0.01 + i*0.4)*0.04;
        // 範囲外に出たらリセット
        if (pos[i*3] > 155)  { pos[i*3] = -25 + Math.random()*20; }
        if (pos[i*3+1] < 0)  { pos[i*3+1] = 22 + Math.random()*5; }
        if (pos[i*3+1] > 26) { pos[i*3+1] = Math.random()*3; }
      }
      extras.sandParticles.geometry.attributes.position.needsUpdate = true;
      // 砂嵐の密度を波打たせる
      extras.sandParticles.material.opacity = 0.35 + Math.sin(frm*0.008)*0.2;
    }
  },

  buildFinish: function(scene) {
    var ftc = document.createElement('canvas'); ftc.width=256; ftc.height=32;
    var ftx = ftc.getContext('2d');
    for (var i=0;i<16;i++) {
      ftx.fillStyle = i%2===0?'#000':'#fff'; ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle = i%2===0?'#fff':'#000'; ftx.fillRect(i*16,16,16,16);
    }
    var fin = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 15),
      new THREE.MeshLambertMaterial({map: new THREE.CanvasTexture(ftc)})
    );
    fin.rotation.x = -Math.PI/2; fin.position.set(4, 0.06, 0);
    scene.add(fin);

    // スタートゲート（砂漠風の石柱）
    [-8, 8].forEach(function(sx) {
      var pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8,1.0,10,8),
        new THREE.MeshLambertMaterial({color:0xb07030})
      );
      pillar.position.set(sx, 5, 0); pillar.castShadow = true; scene.add(pillar);
      var cap = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 2, 8),
        new THREE.MeshLambertMaterial({color:0x8a5020})
      );
      cap.position.set(sx, 11, 0); scene.add(cap);
    });
  }
};
