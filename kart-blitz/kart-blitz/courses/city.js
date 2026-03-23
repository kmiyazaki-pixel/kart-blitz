// courses/city.js — 夜の都市コース（ネオン・雨エフェクト）

var Course = {
  id:   'city',
  name: '夜の都市',
  laps:  5,
  nightMode: true,   // 太陽なし・暗い環境光

  // コース形状：長い直線＋タイトなヘアピンカーブ
  controlPoints: [
    [0,0],[70,0],[110,0],[130,12],[132,30],
    [118,46],[90,52],[60,52],[30,60],[10,75],
    [0,95],[-10,115],[-8,135],[10,148],
    [40,155],[80,155],[110,148],[128,135],
    [132,112],[120,95],[95,85],[70,82],
    [40,82],[18,70],[10,55],[8,35]
  ],
  trackWidth: 16,
  trackSegs:  240,

  startX:     4,
  startZ:     6,
  startAngle: Math.PI / 2,  // +X方向（直線スタート）

  gateX: 3,

  // 夜空
  skyColor:  0x050810,
  fogColor:  0x0a1020,
  fogNear:   60,
  fogFar:    200,

  groundTex: 'asphalt',   // 都市なのでアスファルト地面

  itemBoxes: [
    [0.08,0,0],[0.18,4,0],[0.28,-4,0],
    [0.40,0,0],[0.52,4,0],[0.62,-4,0],
    [0.74,0,0],[0.86,4,0],[0.94,-4,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 22 },
    { startT: 0.08,  maxSpd: 24 },
    { startT: 0.12,  maxSpd: 20 }
  ],

  cpuColors: [
    [0xff6600, 0x882200],
    [0x00ffcc, 0x006644],
    [0xcc00ff, 0x550088]
  ],

  // ---- 地面テクスチャを上書き（濡れた夜のアスファルト） ----
  buildGround: function(scene) {
    var c = document.createElement('canvas'); c.width=256; c.height=256;
    var x = c.getContext('2d');
    x.fillStyle='#111318'; x.fillRect(0,0,256,256);
    // 反射っぽいランダム光
    for (var i=0;i<400;i++) {
      var px2=Math.random()*256, py=Math.random()*256;
      var alpha=Math.random()*0.12;
      var cols=['#ff4400','#00ffcc','#cc00ff','#ffcc00','#4488ff'];
      x.fillStyle=cols[Math.floor(Math.random()*cols.length)].replace(')',','+alpha+')').replace('#','rgba(').replace(/([0-9a-f]{2})/gi,function(m,p,o){return o===0?parseInt(m,16)+',':o===2?parseInt(m,16)+',':o===4?parseInt(m,16):'';});
      x.beginPath(); x.arc(px2,py,Math.random()*3+1,0,Math.PI*2); x.fill();
    }
    // シンプルに塗り直し
    x.fillStyle='#141820'; x.fillRect(0,0,256,256);
    for (var i=0;i<200;i++) {
      var v=18+Math.floor(Math.random()*12);
      x.fillStyle='rgb('+v+','+v+','+(v+8)+')';
      x.fillRect(Math.random()*256,Math.random()*256,3,3);
    }
    // ネオン反射筋
    ['#ff440033','#00ffcc22','#cc00ff22','#ffcc0033'].forEach(function(col,ci) {
      x.fillStyle=col;
      x.fillRect(ci*64, 0, 30, 256);
    });
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(35,35);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(65,-0.05,78);
    gnd.receiveShadow=true; scene.add(gnd);
  },

  buildScenery: function(scene) {
    var extras = { rainParticles:[], neonLights:[], signs:[] };

    // ---- 建物 ----
    var buildings = [
      // [x, z, w, h, d, wallColor, windowColor]
      [-18, 25, 14, 45, 12, 0x111622, 0xff6600],
      [-22, 55, 10, 30, 10, 0x0d1020, 0x00ffcc],
      [-18, 90, 16, 55, 14, 0x121520, 0xcc00ff],
      [-20, 130,12, 38, 11, 0x101418, 0xffcc00],
      [155, 20, 14, 50, 12, 0x0d1018, 0xff4466],
      [158, 60, 10, 35, 10, 0x111622, 0x44aaff],
      [155, 100,16, 60, 14, 0x0e1220, 0x00ffcc],
      [155, 140,12, 42, 11, 0x121520, 0xff6600],
      [30,  170,14, 40, 12, 0x0d1018, 0xcc00ff],
      [75,  172,16, 55, 13, 0x111622, 0xffcc00],
      [115, 170,12, 35, 11, 0x121520, 0x44aaff],
    ];

    buildings.forEach(function(b) {
      var x=b[0],z=b[1],w=b[2],h=b[3],d=b[4],wc=b[5],winC=b[6];
      // 本体
      var bm=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:wc}));
      bm.position.set(x,h/2,z); bm.castShadow=true; scene.add(bm);
      // 屋上ライト
      var roofLight=new THREE.Mesh(new THREE.BoxGeometry(w+0.5,0.8,d+0.5),new THREE.MeshBasicMaterial({color:winC,transparent:true,opacity:0.7}));
      roofLight.position.set(x,h+0.4,z); scene.add(roofLight);
      extras.neonLights.push(roofLight);
      // 窓
      for(var wy=3;wy<h-2;wy+=4){
        for(var wx=-w/2+1.5;wx<w/2;wx+=3){
          if(Math.random()<0.75){
            var win=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.8),new THREE.MeshBasicMaterial({color:winC,transparent:true,opacity:0.5+Math.random()*0.4}));
            win.position.set(x+wx,wy,z+d/2+0.05); scene.add(win);
          }
        }
      }
    });

    // ---- 街灯 ----
    var lightPositions=[[5,12],[5,30],[5,50],[140,15],[140,40],[140,65],[-5,100],[-5,130],[25,162],[60,163],[100,162]];
    lightPositions.forEach(function(lp) {
      // ポール
      var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,8,6),new THREE.MeshLambertMaterial({color:0x445566}));
      pole.position.set(lp[0],4,lp[1]); pole.castShadow=true; scene.add(pole);
      // ランプ
      var lamp=new THREE.Mesh(new THREE.SphereGeometry(0.55,8,8),new THREE.MeshBasicMaterial({color:0xffeeaa}));
      lamp.position.set(lp[0],8.2,lp[1]); scene.add(lamp);
      // 光源
      var pl=new THREE.PointLight(0xffeeaa,0.8,22);
      pl.position.set(lp[0],8,lp[1]); scene.add(pl);
      extras.neonLights.push(lamp);
    });

    // ---- ネオンサイン（横断幕） ----
    var signs=[
      {x:0,  y:12, z:20,  col:0xff4400, w:12, h:2.5},
      {x:132,y:14, z:35,  col:0x00ffcc, w:10, h:2.2},
      {x:0,  y:16, z:110, col:0xcc00ff, w:14, h:3},
      {x:132,y:12, z:120, col:0xffcc00, w:10, h:2.2},
      {x:65, y:14, z:165, col:0xff4466, w:16, h:2.5},
    ];
    signs.forEach(function(sg) {
      var sm=new THREE.Mesh(new THREE.BoxGeometry(sg.w,sg.h,0.3),new THREE.MeshBasicMaterial({color:sg.col,transparent:true,opacity:0.9}));
      sm.position.set(sg.x,sg.y,sg.z); scene.add(sm);
      extras.signs.push({mesh:sm,baseOpacity:0.9,phase:Math.random()*Math.PI*2});
    });

    // ---- 雨パーティクル ----
    var rainCount=600;
    var rainGeo=new THREE.BufferGeometry();
    var rainPos=new Float32Array(rainCount*3);
    for(var i=0;i<rainCount;i++){
      rainPos[i*3]  =(Math.random()-0.5)*160+65;
      rainPos[i*3+1]=Math.random()*40;
      rainPos[i*3+2]=(Math.random()-0.5)*160+78;
    }
    rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
    var rainMat=new THREE.PointsMaterial({color:0x8899bb,size:0.18,transparent:true,opacity:0.6});
    var rain=new THREE.Points(rainGeo,rainMat);
    scene.add(rain);
    extras.rain=rain;
    extras.rainPos=rainPos;

    // ---- 遠景ビル（シルエット） ----
    var farBuildings=[[-50,30,20,70,25],[-55,100,16,55,20],[-50,150,22,80,28],[180,30,18,65,22],[182,100,14,50,18],[178,150,20,75,26],[30,-20,18,60,22],[70,-22,14,45,18],[110,-20,20,70,24]];
    farBuildings.forEach(function(fb){
      var fm=new THREE.Mesh(new THREE.BoxGeometry(fb[2],fb[3],fb[4]),new THREE.MeshLambertMaterial({color:0x060a14}));
      fm.position.set(fb[0],fb[3]/2,fb[1]); scene.add(fm);
      // 屋上に小さい赤いランプ
      var rl=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,6),new THREE.MeshBasicMaterial({color:0xff2200}));
      rl.position.set(fb[0],fb[3]+0.5,fb[1]); scene.add(rl);
      extras.neonLights.push(rl);
    });

    return extras;
  },

  animateScenery: function(extras, frm) {
    if(!extras) return;

    // 雨を落とす
    if(extras.rain && extras.rainPos){
      var pos=extras.rainPos;
      for(var i=0;i<pos.length/3;i++){
        pos[i*3+1]-=0.55;
        pos[i*3]  -=0.05; // 斜め雨
        if(pos[i*3+1]<0){
          pos[i*3+1]=38+Math.random()*4;
          pos[i*3]  =(Math.random()-0.5)*160+65;
          pos[i*3+2]=(Math.random()-0.5)*160+78;
        }
      }
      extras.rain.geometry.attributes.position.needsUpdate=true;
    }

    // ネオンサインの点滅
    if(extras.signs){
      extras.signs.forEach(function(sg){
        sg.phase+=0.04;
        sg.mesh.material.opacity=0.6+Math.sin(sg.phase)*0.35;
      });
    }
  },

  buildFinish: function(scene) {
    // チェッカーフラッグ（ネオン縁付き）
    var ftc=document.createElement('canvas');ftc.width=256;ftc.height=32;
    var ftx=ftc.getContext('2d');
    for(var i=0;i<16;i++){
      ftx.fillStyle=i%2===0?'#000':'#fff';ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle=i%2===0?'#fff':'#000';ftx.fillRect(i*16,16,16,16);
    }
    var fin=new THREE.Mesh(new THREE.PlaneGeometry(2.5,16),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)}));
    fin.rotation.x=-Math.PI/2;fin.position.set(4,0.06,0);scene.add(fin);

    // ゴールゲートのネオンアーチ
    var archMat=new THREE.MeshBasicMaterial({color:0x00ffcc,transparent:true,opacity:0.85});
    var archL=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,12,8),archMat);
    archL.position.set(-9,6,0);scene.add(archL);
    var archR=archL.clone();archR.position.set(9,6,0);scene.add(archR);
    var archTop=new THREE.Mesh(new THREE.BoxGeometry(18,0.5,0.5),archMat);
    archTop.position.set(0,12,0);scene.add(archTop);
  }
};
