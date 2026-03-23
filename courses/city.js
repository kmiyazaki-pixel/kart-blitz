// courses/city.js — 夜の高架都市（ネオクッパシティ風）

var Course = {
  id:   'city',
  name: '夜の都市',
  laps:  3,
  nightMode: true,

  // 高架ループ＋ヘアピン＋直線が混在するテクニカルコース
  controlPoints: [
    [0,0],[90,0],[180,0],[240,30],[255,90],
    [240,150],[195,180],[135,180],[90,165],[60,135],
    [45,90],[60,45],[105,30],[165,45],[210,90],
    [225,150],[210,195],[165,225],[105,225],[60,210],
    [15,180],[0,135],[-15,90],[0,45]
  ],
  trackWidth: 28,
  trackSegs:  240,

  startX:     0,
  startZ:     12,
  startAngle: Math.PI / 2,
  gateX:      3,

  skyColor:  0x04070f,
  fogColor:  0x080e1e,
  fogNear:   80,
  fogFar:    220,

  buildGround: function(scene) {
    // 濡れた暗い路面
    var c = document.createElement('canvas'); c.width=512; c.height=512;
    var x = c.getContext('2d');
    x.fillStyle='#0a0c14'; x.fillRect(0,0,512,512);
    // タイル目地
    for (var tx=0;tx<512;tx+=32) { x.strokeStyle='rgba(255,255,255,0.04)'; x.lineWidth=1; x.beginPath(); x.moveTo(tx,0); x.lineTo(tx,512); x.stroke(); }
    for (var tz=0;tz<512;tz+=32) { x.strokeStyle='rgba(255,255,255,0.04)'; x.lineWidth=1; x.beginPath(); x.moveTo(0,tz); x.lineTo(512,tz); x.stroke(); }
    // ネオン反射（水たまり）
    var cols=['#ff00aa','#00ffee','#aa00ff','#ff6600','#0066ff'];
    for (var i=0;i<80;i++){
      var px=Math.random()*512, py=Math.random()*512;
      var col=cols[Math.floor(Math.random()*cols.length)];
      var g=x.createRadialGradient(px,py,0,px,py,Math.random()*18+6);
      g.addColorStop(0,col.replace('#','rgba(').replace(/([0-9a-f]{2})/gi,function(m,_,o){return o<5?parseInt(m,16)+',':''})+'0.18)');
      g.addColorStop(0,col+'33');
      g.addColorStop(1,'transparent');
      x.fillStyle=g; x.fillRect(px-20,py-20,40,40);
    }
    var t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(30,30);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(900,800),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(120,-0.05,112);
    gnd.receiveShadow=true; scene.add(gnd);
  },

  itemBoxes: [
    [0.06,0,0],[0.15,8,0],[0.24,-8,0],[0.34,0,0],
    [0.44,8,0],[0.54,-8,0],[0.64,0,0],
    [0.74,8,0],[0.84,-8,0],[0.94,0,0]
  ],

  cpus: [
    { startT: 0.04, maxSpd: 48 },
    { startT: 0.08, maxSpd: 52 },
    { startT: 0.12, maxSpd: 46 }
  ],

  cpuColors: [
    [0xff0088, 0x880044],
    [0x00eeff, 0x006688],
    [0xaa00ff, 0x550088]
  ],

  buildScenery: function(scene) {
    var extras = { rainPos:null, rain:null, signs:[], screens:[] };

    // ============ ビル群 ============
    var buildings = [
      // [x, z, w, h, d, wallCol, neonCol]
      // 左側
      [-35, 30,  22, 80, 28, 0x080c18, 0xff0088],
      [-38, 90,  18, 55, 22, 0x06080f, 0x00eeff],
      [-35, 148, 24, 95, 30, 0x0a0c1a, 0xaa00ff],
      [-38, 210, 20, 65, 25, 0x080c18, 0xff6600],
      // 右側
      [290, 25,  24, 88, 30, 0x06080f, 0x00eeff],
      [292, 90,  20, 60, 24, 0x0a0c1a, 0xff0088],
      [288, 155, 26,105, 32, 0x080c18, 0xffcc00],
      [290, 220, 22, 72, 28, 0x06080f, 0xaa00ff],
      // 奥
      [50, -45,  28, 70, 22, 0x0a0c1a, 0xff0088],
      [130,-48,  32, 90, 26, 0x080c18, 0x00eeff],
      [210,-45,  26, 75, 22, 0x06080f, 0xaa00ff],
      // 手前
      [50, 268,  28, 68, 22, 0x0a0c1a, 0xffcc00],
      [130,272,  32, 85, 26, 0x080c18, 0xff0088],
      [210,268,  26, 72, 22, 0x06080f, 0x00eeff],
    ];

    buildings.forEach(function(b) {
      var bx=b[0],bz=b[1],bw=b[2],bh=b[3],bd=b[4],wc=b[5],nc=b[6];
      // 本体
      var bm=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),new THREE.MeshLambertMaterial({color:wc}));
      bm.position.set(bx,bh/2,bz); bm.castShadow=true; scene.add(bm);
      // 屋上ネオン帯
      var top=new THREE.Mesh(new THREE.BoxGeometry(bw+0.5,1.5,bd+0.5),new THREE.MeshBasicMaterial({color:nc,transparent:true,opacity:0.9}));
      top.position.set(bx,bh+0.75,bz); scene.add(top);
      var topLight=new THREE.PointLight(nc,1.2,50);
      topLight.position.set(bx,bh+2,bz); scene.add(topLight);
      // 窓
      for(var wy=4;wy<bh-3;wy+=5){
        for(var wx=-bw/2+2;wx<bw/2-1;wx+=3.5){
          if(Math.random()<0.72){
            var wop=0.4+Math.random()*0.5;
            var win=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.8),
              new THREE.MeshBasicMaterial({color:nc,transparent:true,opacity:wop}));
            win.position.set(bx+wx,wy,bz+bd/2+0.06); scene.add(win);
          }
        }
      }
    });

    // ============ 巨大ネオンスクリーン（ビルボード） ============
    var screenData=[
      {x:-28, y:30, z:60,  w:18, h:12, col:0xff0088, rY:Math.PI/2},
      {x:282, y:35, z:55,  w:18, h:12, col:0x00eeff, rY:-Math.PI/2},
      {x:-28, y:32, z:160, w:16, h:10, col:0xaa00ff, rY:Math.PI/2},
      {x:282, y:30, z:165, w:16, h:10, col:0xffcc00, rY:-Math.PI/2},
      {x:120, y:38, z:-38, w:24, h:14, col:0xff0088, rY:0},
      {x:120, y:35, z:262, w:22, h:13, col:0x00eeff, rY:Math.PI},
    ];
    screenData.forEach(function(sd){
      // フレーム
      var frame=new THREE.Mesh(new THREE.BoxGeometry(sd.w+1,sd.h+1,0.6),
        new THREE.MeshLambertMaterial({color:0x222233}));
      frame.position.set(sd.x,sd.y,sd.z); frame.rotation.y=sd.rY; scene.add(frame);
      // 画面
      var screen=new THREE.Mesh(new THREE.PlaneGeometry(sd.w,sd.h),
        new THREE.MeshBasicMaterial({color:sd.col,transparent:true,opacity:0.85}));
      screen.position.set(sd.x,sd.y,sd.z); screen.rotation.y=sd.rY;
      // 画面の少し手前に出す
      screen.position.x += Math.sin(sd.rY)*0.4;
      screen.position.z += Math.cos(sd.rY)*0.4;
      scene.add(screen);
      extras.screens.push({mesh:screen,phase:Math.random()*Math.PI*2,col:sd.col});
      // 光源
      var sl=new THREE.PointLight(sd.col,1.5,40);
      sl.position.set(sd.x,sd.y,sd.z); scene.add(sl);
    });

    // ============ 街灯（ネオン色） ============
    var lampColors=[0xff0088,0x00eeff,0xaa00ff,0xffcc00,0xff6600];
    var lampPos=[
      [12,25],[12,75],[12,130],[12,180],[12,225],
      [228,20],[228,75],[228,130],[228,185],[228,225],
      [60,-12],[120,-14],[180,-12],
      [60,238],[120,240],[180,238],
    ];
    lampPos.forEach(function(lp,li){
      var nc=lampColors[li%lampColors.length];
      var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,14,7),
        new THREE.MeshLambertMaterial({color:0x1a1a2a}));
      pole.position.set(lp[0],7,lp[1]); pole.castShadow=true; scene.add(pole);
      // アーム
      var arm=new THREE.Mesh(new THREE.BoxGeometry(4,0.3,0.3),
        new THREE.MeshLambertMaterial({color:0x1a1a2a}));
      arm.position.set(lp[0]+2,14,lp[1]); scene.add(arm);
      var lamp=new THREE.Mesh(new THREE.SphereGeometry(0.7,8,8),
        new THREE.MeshBasicMaterial({color:nc}));
      lamp.position.set(lp[0]+4,14,lp[1]); scene.add(lamp);
      var pl=new THREE.PointLight(nc,2.0,35);
      pl.position.set(lp[0]+4,13.5,lp[1]); scene.add(pl);
    });

    // ============ 高架橋の支柱 ============
    var pillarPos=[[60,20],[120,18],[180,20],[60,205],[120,207],[180,205]];
    pillarPos.forEach(function(pp){
      var pillar=new THREE.Mesh(new THREE.BoxGeometry(3,18,3),
        new THREE.MeshLambertMaterial({color:0x111122}));
      pillar.position.set(pp[0],9,pp[1]); pillar.castShadow=true; scene.add(pillar);
      // ネオン縁
      var edge=new THREE.Mesh(new THREE.BoxGeometry(3.3,0.4,3.3),
        new THREE.MeshBasicMaterial({color:0x0066ff,transparent:true,opacity:0.8}));
      edge.position.set(pp[0],18,pp[1]); scene.add(edge);
    });

    // ============ 遠景の高層ビルシルエット ============
    var farBlds=[
      [-80,60,20,120,30,0x03050c],[-85,140,16,90,24,0x040608],
      [320,50,22,135,28,0x03050c],[318,140,18,100,26,0x040608],
      [60,-80,30,110,24,0x03050c],[130,-82,26,140,22,0x040608],[200,-80,28,115,24,0x03050c],
      [60,310,30,105,24,0x03050c],[130,312,26,130,22,0x040608],[200,310,28,110,24,0x03050c],
    ];
    farBlds.forEach(function(fb){
      var fm=new THREE.Mesh(new THREE.BoxGeometry(fb[2],fb[3],fb[4]),
        new THREE.MeshLambertMaterial({color:fb[5]}));
      fm.position.set(fb[0],fb[3]/2,fb[1]); scene.add(fm);
      // 屋上赤いランプ
      var rl=new THREE.Mesh(new THREE.SphereGeometry(0.6,6,6),
        new THREE.MeshBasicMaterial({color:0xff2200,transparent:true,opacity:0.8}));
      rl.position.set(fb[0],fb[3]+0.8,fb[1]); scene.add(rl);
    });

    // ============ 豪雨パーティクル ============
    var rainCount=1200;
    var rainGeo=new THREE.BufferGeometry();
    var rainPos2=new Float32Array(rainCount*3);
    for(var i=0;i<rainCount;i++){
      rainPos2[i*3]  =(Math.random()-0.5)*440+120;
      rainPos2[i*3+1]=Math.random()*55;
      rainPos2[i*3+2]=(Math.random()-0.5)*380+112;
    }
    rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos2,3));
    var rainMat=new THREE.PointsMaterial({color:0x8899cc,size:0.18,transparent:true,opacity:0.55});
    var rain=new THREE.Points(rainGeo,rainMat);
    scene.add(rain);
    extras.rain=rain; extras.rainPos=rainPos2;

    // 霧雨ハロ（地面近くの光の散乱）
    var halos=[0xff0088,0x00eeff,0xaa00ff];
    [[15,1,40],[228,1,112],[120,1,-12]].forEach(function(hp,hi){
      var h=new THREE.Mesh(new THREE.PlaneGeometry(30,30),
        new THREE.MeshBasicMaterial({color:halos[hi],transparent:true,opacity:0.06,side:THREE.DoubleSide}));
      h.rotation.x=-Math.PI/2; h.position.set(hp[0],hp[1],hp[2]); scene.add(h);
    });

    return extras;
  },

  animateScenery: function(extras, frm) {
    if (!extras) return;

    // 豪雨
    if (extras.rain && extras.rainPos) {
      var pos=extras.rainPos;
      for(var i=0;i<pos.length/3;i++){
        pos[i*3]  -= 0.08;
        pos[i*3+1]-= 0.75 + Math.random()*0.2;
        if(pos[i*3+1]<-1){
          pos[i*3+1]=52+Math.random()*5;
          pos[i*3]  =(Math.random()-0.5)*440+120;
          pos[i*3+2]=(Math.random()-0.5)*380+112;
        }
      }
      extras.rain.geometry.attributes.position.needsUpdate=true;
    }

    // スクリーンのフリッカー＆色変化
    if (extras.screens) {
      extras.screens.forEach(function(sc){
        sc.phase += 0.035;
        sc.mesh.material.opacity = 0.65 + Math.sin(sc.phase)*0.2 + (Math.random()<0.02?Math.random()*0.3:0);
      });
    }
  },

  buildFinish: function(scene) {
    var ftc=document.createElement('canvas');ftc.width=256;ftc.height=32;
    var ftx=ftc.getContext('2d');
    for(var i=0;i<16;i++){
      ftx.fillStyle=i%2===0?'#000':'#fff';ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle=i%2===0?'#fff':'#000';ftx.fillRect(i*16,16,16,16);
    }
    var fin=new THREE.Mesh(new THREE.PlaneGeometry(2.5,28),
      new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)}));
    fin.rotation.x=-Math.PI/2; fin.position.set(4,0.06,0); scene.add(fin);

    // ネオンゲートアーチ（ピンク）
    var archMat=new THREE.MeshBasicMaterial({color:0xff0088,transparent:true,opacity:0.9});
    [-15,15].forEach(function(sx){
      var col=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,18,8),archMat);
      col.position.set(sx,9,0); scene.add(col);
      var glow=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.9,18,8),
        new THREE.MeshBasicMaterial({color:0xff0088,transparent:true,opacity:0.2}));
      glow.position.set(sx,9,0); scene.add(glow);
      var pl=new THREE.PointLight(0xff0088,3,25);
      pl.position.set(sx,18,0); scene.add(pl);
    });
    var beam=new THREE.Mesh(new THREE.BoxGeometry(32,0.8,0.8),archMat);
    beam.position.set(0,18,0); scene.add(beam);
    var beamGlow=new THREE.Mesh(new THREE.BoxGeometry(32,2,2),
      new THREE.MeshBasicMaterial({color:0xff0088,transparent:true,opacity:0.15}));
    beamGlow.position.set(0,18,0); scene.add(beamGlow);
  }
};
