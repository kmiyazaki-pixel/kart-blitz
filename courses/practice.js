// courses/practice.js — 練習コース（3xスケール・幅28）
// CPS×3: 周長約920 / MAXSPD18 ≈ 51秒/周

var Course = {
  id:   'practice',
  name: '練習コース',
  laps:  3,

  controlPoints: [
    [0,0],[150,0],[234,36],[264,108],
    [234,180],[150,216],[0,216],
    [-78,180],[-108,108],[-78,36]
  ],
  trackWidth: 28,
  trackSegs:  200,

  startX:     0,
  startZ:     12,
  startAngle: Math.PI / 2,
  gateX:      3,

  skyColor: 0x55aaee,
  fogColor: 0x88ccee,
  fogNear:  120,
  fogFar:   320,

  groundTex: 'grass',

  itemBoxes: [
    [0.12,0,0],[0.25,8,0],[0.37,-8,0],
    [0.50,0,0],[0.62,8,0],[0.75,-8,0],[0.88,0,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 15 },
    { startT: 0.08,  maxSpd: 17 },
    { startT: 0.12,  maxSpd: 14 }
  ],

  cpuColors: [
    [0xffcc00, 0x885500],
    [0x00bbff, 0x004488],
    [0x22dd44, 0x115522]
  ],

  buildGround: function(scene) {
    var t = Textures.grass();
    var gnd = new THREE.Mesh(new THREE.PlaneGeometry(800,700),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(78,-0.05,108);
    gnd.receiveShadow=true; scene.add(gnd);
  },

  buildScenery: function(scene) {
    var extras = { clouds: [] };

    [[-220,-50,65,38,0x7a9e80],[-225,220,52,30,0x6a8e70],
     [390,-30,72,42,0x8aae8e],[395,240,60,34,0x7a9e7e],
     [70,440,50,32,0x6a8e70],[70,-220,44,28,0x80a090]].forEach(function(a) {
      var m=new THREE.Mesh(new THREE.ConeGeometry(a[3],a[2],9),new THREE.MeshLambertMaterial({color:a[4]}));
      m.position.set(a[0],a[2]/2,a[1]);m.castShadow=true;scene.add(m);
      var sn=new THREE.Mesh(new THREE.ConeGeometry(a[3]*0.3,a[2]*0.25,8),new THREE.MeshLambertMaterial({color:0xeef5ff}));
      sn.position.set(a[0],a[2]*0.88,a[1]);scene.add(sn);
    });

    [[-60,50],[-75,140],[-50,200],[280,22],[290,140],[280,190],
     [-60,-20],[-80,240],[280,-8],[130,-38],[130,255],[-140,108],[340,108]].forEach(function(p) {
      var s=0.85+Math.random()*0.5;
      var tk=new THREE.Mesh(new THREE.CylinderGeometry(0.5*s,0.9*s,6.5*s,7),new THREE.MeshLambertMaterial({color:0x5a2e1a}));
      tk.position.set(p[0],3.25*s,p[1]);tk.castShadow=true;scene.add(tk);
      [[7,11,0x1e7a1e],[5.5,13.5,0x28a028],[4,16,0x32c032],[2.5,18,0x3cdd3c]].forEach(function(f) {
        var cn=new THREE.Mesh(new THREE.ConeGeometry(f[0]*s,5*s,8),new THREE.MeshLambertMaterial({color:f[2]}));
        cn.position.set(p[0],f[1]*s,p[1]);cn.castShadow=true;scene.add(cn);
      });
    });

    [[-150,55,-90,2.2],[-50,60,-120,1.8],[200,54,-110,2.8],
     [330,52,-100,2.1],[420,57,-90,2.4]].forEach(function(c) {
      var g=new THREE.Group();
      var mat=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.9});
      [[0,0,0,1.8],[2.1,0.4,0,1.4],[-1.9,0.3,0,1.3],[0.8,0.9,0,1.0]].forEach(function(sp) {
        var m=new THREE.Mesh(new THREE.SphereGeometry(sp[3]*c[3],7,7),mat);
        m.position.set(sp[0]*c[3],sp[1]*c[3],sp[2]*c[3]);g.add(m);
      });
      g.position.set(c[0],c[1],c[2]);scene.add(g);
      extras.clouds.push({g:g,spd:0.007+Math.random()*0.006});
    });

    return extras;
  },

  animateScenery: function(extras) {
    if (!extras || !extras.clouds) return;
    extras.clouds.forEach(function(c) {
      c.g.position.x += c.spd;
      if (c.g.position.x > 450) c.g.position.x = -200;
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
    [-15,15].forEach(function(sx) {
      var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,10,7),new THREE.MeshLambertMaterial({color:0x888888}));
      pole.position.set(sx,5,0);pole.castShadow=true;scene.add(pole);
    });
  }
};
