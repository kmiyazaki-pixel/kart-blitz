// courses/city.js — ネオシティ（ネオクッパシティ風・夜・雨）

var Course = {
  id:   'city',
  name: 'ネオシティ',
  laps:  3,
  nightMode: true,

  // コース形状：長いストレート→ヘアピン→S字→高架ループ→急カーブ連続
  controlPoints: [
    // スタートストレート（長い直線）
    [0,0],[80,0],[160,0],[240,0],
    // 右大カーブ
    [300,15],[330,50],[325,90],
    // ヘアピン左
    [300,120],[260,140],[220,135],[190,115],
    // S字区間
    [170,85],[165,55],[185,30],[220,15],
    // 右ヘアピン折り返し
    [265,5],[305,-15],[330,20],[320,60],
    // 左大カーブ
    [295,100],[250,130],[200,148],[150,148],
    // 長い左ストレート
    [100,148],[50,148],[0,148],
    // 最終ヘアピン左
    [-40,140],[-65,110],[-60,75],[-30,55],
    // スタートラインへ戻る
    [0,30],[0,0]
  ],
  trackWidth: 30,
  trackSegs:  300,

  startX:     0,
  startZ:     14,
  startAngle: Math.PI / 2,
  gateX:      4,

  skyColor:  0x020510,
  fogColor:  0x080e1e,
  fogNear:   80,
  fogFar:    260,

  buildGround: function(scene) {
    // 濡れたアスファルト（反射あり）
    var c = document.createElement('canvas'); c.width=512; c.height=512;
    var x = c.getContext('2d');
    x.fillStyle = '#0d0f14'; x.fillRect(0,0,512,512);
    // タイルグリッド
    x.strokeStyle = 'rgba(255,255,255,0.03)'; x.lineWidth = 1;
    for(var i=0;i<512;i+=32){x.beginPath();x.moveTo(i,0);x.lineTo(i,512);x.stroke();}
    for(var j=0;j<512;j+=32){x.beginPath();x.moveTo(0,j);x.lineTo(512,j);x.stroke();}
    // ネオン反射
    var cols=['#ff00aa','#00ffee','#ff6600','#8800ff','#00ff44'];
    for(var i=0;i<120;i++){
      var col=cols[Math.floor(Math.random()*cols.length)];
      x.fillStyle=col.replace(')',',0.06)').replace('#','rgba(').replace(/([0-9a-f]{2})/gi,function(m,p,off){return off===0?parseInt(m,16)+',':off===2?parseInt(m,16)+',':off===4?parseInt(m,16):'';});
      // 手抜きせず直接rgba指定
    }
    // シンプルな光の筋
    ['rgba(255,0,150,0.05)','rgba(0,255,220,0.04)','rgba(255,100,0,0.04)'].forEach(function(col,ci){
      x.fillStyle=col; x.fillRect(ci*170,0,130,512);
    });
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(30,30);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(900,700),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(135,-0.05,74);
    gnd.receiveShadow=true; scene.add(gnd);
  },

  itemBoxes: [
    [0.05,0,0],[0.12,10,0],[0.20,-10,0],
    [0.30,0,0],[0.40,10,0],[0.50,-10,0],
    [0.60,0,0],[0.70,10,0],[0.80,-10,0],[0.90,0,0]
  ],

  cpus: [
    { startT:0.04, maxSpd:50 },
    { startT:0.08, maxSpd:52 },
    { startT:0.12, maxSpd:48 }
  ],

  cpuColors: [
    [0xff2200, 0x880800],
    [0x00eeff, 0x006677],
    [0xcc00ff, 0x550077]
  ],

  buildScenery: function(scene) {
    var extras = { rainPos:null, rainMesh:null, signs:[], lights:[] };

    // ===== 高層ビル群 =====
    var buildings = [
      // 左サイド（コース外側）
      {x:-80, z:15,  w:30, h:120, d:25, wall:0x0a0e18, win:0xff2288},
      {x:-85, z:60,  w:22, h:90,  d:20, wall:0x080c14, win:0x00eeff},
      {x:-80, z:100, w:28, h:150, d:24, wall:0x0a0e1c, win:0xff6600},
      {x:-82, z:140, w:24, h:80,  d:22, wall:0x08090f, win:0x8800ff},
      // 右サイド
      {x:390, z:15,  w:28, h:110, d:22, wall:0x0a0e18, win:0x00ff88},
      {x:392, z:65,  w:24, h:140, d:20, wall:0x080c14, win:0xff2288},
      {x:388, z:110, w:30, h:95,  d:26, wall:0x0a0e1c, win:0x00eeff},
      // 上側
      {x:80,  z:200, w:26, h:100, d:22, wall:0x08090f, win:0xff6600},
      {x:160, z:205, w:32, h:130, d:28, wall:0x0a0e18, win:0x8800ff},
      {x:250, z:202, w:24, h:110, d:20, wall:0x080c14, win:0x00ff88},
      // 下側
      {x:80,  z:-60, w:28, h:95,  d:24, wall:0x0a0e1c, win:0xff2288},
      {x:200, z:-58, w:24, h:120, d:22, wall:0x08090f, win:0x00eeff},
      {x:300, z:-55, w:30, h:85,  d:26, wall:0x0a0e18, win:0xff6600},
    ];

    buildings.forEach(function(b) {
      // ビル本体
      var bm = new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h,b.d),
        new THREE.MeshLambertMaterial({color:b.wall}));
      bm.position.set(b.x, b.h/2, b.z); bm.castShadow=true; scene.add(bm);

      // 屋上ネオンライン
      var roof = new THREE.Mesh(new THREE.BoxGeometry(b.w+1,1.5,b.d+1),
        new THREE.MeshBasicMaterial({color:b.win,transparent:true,opacity:0.85}));
      roof.position.set(b.x, b.h+0.75, b.z); scene.add(roof);
      var roofLight = new THREE.PointLight(b.win, 0.8, 60);
      roofLight.position.set(b.x, b.h+2, b.z); scene.add(roofLight);
      extras.lights.push(roofLight);

      // 窓（ランダム点灯）
      var floors = Math.floor(b.h/8);
      for(var fy=1; fy<floors; fy++){
        var rowY = fy*8 - b.h/2 + 4;
        var cols2 = Math.floor(b.w/5);
        for(var fc=0; fc<cols2; fc++){
          if(Math.random()<0.65){
            var wx = -b.w/2+2.5+fc*5;
            var win = new THREE.Mesh(new THREE.PlaneGeometry(2.5,3.5),
              new THREE.MeshBasicMaterial({color:b.win,transparent:true,opacity:0.35+Math.random()*0.45}));
            win.position.set(b.x+wx, b.h/2+rowY, b.z+b.d/2+0.1); scene.add(win);
          }
        }
      }
    });

    // ===== 街灯（コース沿いに密集） =====
    var lampPositions = [
      // スタートストレート沿い
      [15,20],[15,50],[15,80],[15,110],[15,130],
      [-15,20],[-15,50],[-15,80],[-15,110],[-15,130],
      // 右カーブ〜ヘアピン
      [290,10],[310,40],[320,75],[300,115],[265,145],
      // S字
      [175,40],[180,70],[200,130],
      // 左ストレート
      [50,165],[100,165],[150,165],[200,165],[250,165],
      [50,130],[100,130],[150,130],
    ];

    lampPositions.forEach(function(lp) {
      // ポール
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,14,6),
        new THREE.MeshLambertMaterial({color:0x334455}));
      pole.position.set(lp[0],7,lp[1]); pole.castShadow=true; scene.add(pole);
      // アーム
      var arm = new THREE.Mesh(new THREE.BoxGeometry(4,0.4,0.4),
        new THREE.MeshLambertMaterial({color:0x334455}));
      arm.position.set(lp[0]+2,13.8,lp[1]); scene.add(arm);
      // ランプ
      var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.9,8,8),
        new THREE.MeshBasicMaterial({color:0xffeebb}));
      lamp.position.set(lp[0]+4,13.5,lp[1]); scene.add(lamp);
      var pl = new THREE.PointLight(0xffeebb, 2.2, 45);
      pl.position.set(lp[0]+4,13,lp[1]); scene.add(pl);
      extras.lights.push(pl);
    });

    // ===== ネオン看板 =====
    var neonSigns = [
      {x:0,  y:22, z:-18, w:35, h:5,  col:0xff0088, rot:0},
      {x:330,y:25, z:35,  w:30, h:4.5,col:0x00ffee, rot:Math.PI/2},
      {x:180,y:20, z:-22, w:28, h:4,  col:0xff6600, rot:0},
      {x:-30,y:18, z:90,  w:25, h:4,  col:0x8800ff, rot:Math.PI/2},
      {x:130,y:22, z:165, w:32, h:4.5,col:0x00ff88, rot:0},
      {x:250,y:20, z:165, w:28, h:4,  col:0xff2288, rot:0},
    ];
    neonSigns.forEach(function(sg) {
      var sm = new THREE.Mesh(new THREE.BoxGeometry(sg.w,sg.h,0.6),
        new THREE.MeshBasicMaterial({color:sg.col,transparent:true,opacity:0.95}));
      sm.position.set(sg.x,sg.y,sg.z); sm.rotation.y=sg.rot; scene.add(sm);
      // 光源
      var sl = new THREE.PointLight(sg.col, 1.2, 35);
      sl.position.set(sg.x,sg.y+2,sg.z); scene.add(sl);
      extras.signs.push({mesh:sm, light:sl, phase:Math.random()*Math.PI*2});
    });

    // ===== 広告塔（大型スクリーン風） =====
    var screens = [
      {x:-60,z:75,  w:18,h:28,col:0x0044ff},
      {x:368,z:40,  w:18,h:28,col:0xff0044},
      {x:170,z:195, w:22,h:30,col:0x00ff88},
    ];
    screens.forEach(function(sc){
      // フレーム
      var frame = new THREE.Mesh(new THREE.BoxGeometry(sc.w+2,sc.h+2,1.5),
        new THREE.MeshLambertMaterial({color:0x111111}));
      frame.position.set(sc.x,sc.h/2+10,sc.z); scene.add(frame);
      // スクリーン
      var screen2 = new THREE.Mesh(new THREE.PlaneGeometry(sc.w,sc.h),
        new THREE.MeshBasicMaterial({color:sc.col,transparent:true,opacity:0.8}));
      screen2.position.set(sc.x,sc.h/2+10,sc.z+0.85); scene.add(screen2);
      extras.signs.push({mesh:screen2, light:null, phase:Math.random()*Math.PI*2, isScreen:true});
      var sl2=new THREE.PointLight(sc.col,1.0,50); sl2.position.set(sc.x,sc.h/2+10,sc.z+2); scene.add(sl2);
      extras.lights.push(sl2);
    });

    // ===== 路面の横断歩道・ライン =====
    // スタートストレートに横断歩道
    for(var ci=0;ci<8;ci++){
      var cw=new THREE.Mesh(new THREE.PlaneGeometry(3,30),
        new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.25}));
      cw.rotation.x=-Math.PI/2; cw.position.set(-10+ci*4.5,0.03,70); scene.add(cw);
    }

    // ===== 雨パーティクル =====
    var rainCount = 1000;
    var rainGeo = new THREE.BufferGeometry();
    var rPos = new Float32Array(rainCount*3);
    for(var i=0;i<rainCount;i++){
      rPos[i*3]   = (Math.random()-0.5)*380+135;
      rPos[i*3+1] = Math.random()*55;
      rPos[i*3+2] = (Math.random()-0.5)*300+74;
    }
    rainGeo.setAttribute('position',new THREE.BufferAttribute(rPos,3));
    var rainMat = new THREE.PointsMaterial({color:0x6699bb,size:0.2,transparent:true,opacity:0.55});
    var rain = new THREE.Points(rainGeo,rainMat);
    scene.add(rain);
    extras.rainPos = rPos;
    extras.rainMesh = rain;

    // ===== 遠景ビル（シルエット） =====
    [[-160,74,40,180,50],[380,74,40,160,50],[135,-120,180,140,40],[135,270,180,140,40]].forEach(function(fb){
      var fm=new THREE.Mesh(new THREE.BoxGeometry(fb[2],fb[3],fb[4]),
        new THREE.MeshLambertMaterial({color:0x04060a}));
      fm.position.set(fb[0],fb[3]/2,fb[1]); scene.add(fm);
      // ランダムな窓光
      for(var wf=0;wf<12;wf++){
        var wfc=['#ff0088','#00ffee','#ff6600','#8800ff'][Math.floor(Math.random()*4)];
        var wm=new THREE.Mesh(new THREE.PlaneGeometry(3,4),
          new THREE.MeshBasicMaterial({color:wfc,transparent:true,opacity:0.3+Math.random()*0.4}));
        wm.position.set(fb[0]+(Math.random()-0.5)*fb[2]*0.8,
          Math.random()*fb[3]*0.8-fb[3]*0.3, fb[1]+fb[4]/2+0.1); scene.add(wm);
      }
    });

    return extras;
  },

  animateScenery: function(extras, frm) {
    if(!extras) return;

    // 雨
    if(extras.rainPos && extras.rainMesh){
      var pos=extras.rainPos;
      for(var i=0;i<pos.length/3;i++){
        pos[i*3]   -= 0.08;
        pos[i*3+1] -= 0.75;
        if(pos[i*3+1]<0){
          pos[i*3+1]=50+Math.random()*8;
          pos[i*3]  =(Math.random()-0.5)*380+135;
          pos[i*3+2]=(Math.random()-0.5)*300+74;
        }
      }
      extras.rainMesh.geometry.attributes.position.needsUpdate=true;
    }

    // ネオン点滅
    if(extras.signs){
      extras.signs.forEach(function(sg,i){
        sg.phase += 0.03 + i*0.007;
        var op = sg.isScreen
          ? 0.5+Math.sin(sg.phase*0.4)*0.3           // スクリーンはゆっくり
          : 0.7+Math.sin(sg.phase)*0.28;              // 看板は早め点滅
        sg.mesh.material.opacity = op;
        if(sg.light) sg.light.intensity = 0.6+Math.sin(sg.phase)*0.6;
      });
    }

    // 屋上ライトのちらつき
    if(extras.lights && frm%8===0){
      extras.lights.forEach(function(l,i){
        if(l.intensity!==undefined && Math.random()<0.08)
          l.intensity = l.intensity * (0.7+Math.random()*0.6);
      });
    }
  },

  buildFinish: function(scene) {
    // チェッカーライン
    var ftc=document.createElement('canvas');ftc.width=256;ftc.height=32;
    var ftx=ftc.getContext('2d');
    for(var i=0;i<16;i++){
      ftx.fillStyle=i%2===0?'#000':'#fff';ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle=i%2===0?'#fff':'#000';ftx.fillRect(i*16,16,16,16);
    }
    var fin=new THREE.Mesh(new THREE.PlaneGeometry(3,30),
      new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)}));
    fin.rotation.x=-Math.PI/2; fin.position.set(5,0.06,0); scene.add(fin);

    // ゴールゲート（ネオンアーチ）
    var archColors=[0xff0088,0x00ffee];
    [-16,16].forEach(function(sx,ci){
      var col=archColors[ci];
      var pillar=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.9,18,8),
        new THREE.MeshLambertMaterial({color:0x111111}));
      pillar.position.set(sx,9,0); scene.add(pillar);
      // ネオン縁取り
      var neon=new THREE.Mesh(new THREE.CylinderGeometry(0.8,1.0,18.2,8),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.7,wireframe:true}));
      neon.position.set(sx,9,0); scene.add(neon);
      var pl=new THREE.PointLight(col,2.5,30); pl.position.set(sx,18,0); scene.add(pl);
    });
    // 上部ビーム
    var beam=new THREE.Mesh(new THREE.BoxGeometry(34,1.2,1.2),
      new THREE.MeshBasicMaterial({color:0x00ffee,transparent:true,opacity:0.85}));
    beam.position.set(0,18.2,0); scene.add(beam);
    var beamLight=new THREE.PointLight(0x00ffee,1.5,40);
    beamLight.position.set(0,19,0); scene.add(beamLight);

    // スタートライン横のバリア
    [-16,16].forEach(function(sx){
      for(var bi=0;bi<4;bi++){
        var bar=new THREE.Mesh(new THREE.BoxGeometry(1.5,2,4),
          new THREE.MeshLambertMaterial({color:bi%2===0?0xff2200:0xffffff}));
        bar.position.set(sx+(sx>0?2:-2),1,bi*5-8); scene.add(bar);
      }
    });
  }
};
