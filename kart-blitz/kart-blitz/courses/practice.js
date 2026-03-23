// courses/practice.js — 練習コース（シンプルな楕円）

var Course = {
  id:   'practice',
  name: '練習コース',
  laps:  3,

  // Track spline control points [x, z]
  controlPoints: [
    [0,0],[50,0],[78,12],[88,36],[78,60],
    [50,72],[0,72],[-26,60],[-36,36],[-26,12]
  ],
  trackWidth: 14,
  trackSegs:  180,

  // Player start
  startX:     0,
  startZ:     4,
  startAngle: Math.PI/2,   // facing +X

  // Lap gate — crossing x=3 going right, near z=0
  gateX: 3,

  // Sky & fog
  skyColor: 0x55aaee,
  fogColor: 0x88ccee,
  fogNear:  100,
  fogFar:   260,

  // Ground texture key (from Textures object)
  groundTex: 'grass',
  groundColor: null,   // optional flat color override

  // Item box positions [trackT, offsetX, offsetZ]
  itemBoxes: [
    [0.14,0,0],[0.27,3,0],[0.4,-3,0],
    [0.53,0,0],[0.65,3,0],[0.78,-2,0],[0.9,0,0]
  ],

  // CPU opponents [startT, maxSpeed]
  cpus: [
    { startT: 0.045, maxSpd: 17 },
    { startT: 0.090, maxSpd: 18.5 },
    { startT: 0.135, maxSpd: 16 }
  ],

  // CPU kart colors [body, cabin]
  cpuColors: [
    [0xffcc00, 0x885500],
    [0x00bbff, 0x004488],
    [0x22dd44, 0x115522]
  ],

  // Called once to build scenery into scene
  buildScenery: function(scene) {
    // Mountains
    var mtnData = [
      [-85,-18,62,36,0x7a9e80],[-88,82,50,28,0x6a8e70],
      [148,-10,68,40,0x8aae8e],[150,90,56,32,0x7a9e7e],
      [25,168,46,30,0x6a8e70],[25,-82,42,26,0x80a090]
    ];
    mtnData.forEach(function(a) {
      var m = new THREE.Mesh(new THREE.ConeGeometry(a[3],a[2],8), new THREE.MeshLambertMaterial({color:a[4]}));
      m.position.set(a[0],a[2]/2,a[1]); m.castShadow=true; scene.add(m);
      var sn = new THREE.Mesh(new THREE.ConeGeometry(a[3]*0.3,a[2]*0.25,8), new THREE.MeshLambertMaterial({color:0xeef5ff}));
      sn.position.set(a[0],a[2]*0.88,a[1]); scene.add(sn);
    });

    // Trees
    var treePos = [
      [-22,18],[-28,52],[-17,74],[108,8],[110,53],[108,70],
      [-22,-8],[-31,88],[108,-3],[50,-14],[50,95],[-52,36],[126,36]
    ];
    treePos.forEach(function(p) {
      var s = 0.85 + Math.random()*0.5;
      var tk = new THREE.Mesh(new THREE.CylinderGeometry(0.2*s,0.36*s,2.6*s,7), new THREE.MeshLambertMaterial({color:0x5a2e1a}));
      tk.position.set(p[0],1.3*s,p[1]); tk.castShadow=true; scene.add(tk);
      [[2.8,4.2,0x1e7a1e],[2.2,5.4,0x28a028],[1.6,6.4,0x32c032],[1.0,7.2,0x3cdd3c]].forEach(function(f) {
        var cn = new THREE.Mesh(new THREE.ConeGeometry(f[0]*s,2.0*s,8), new THREE.MeshLambertMaterial({color:f[2]}));
        cn.position.set(p[0],f[1]*s,p[1]); cn.castShadow=true; scene.add(cn);
      });
    });

    // Clouds
    var cloudData = [[-60,55,-38,2.2],[-15,60,-48,1.8],[78,54,-44,2.6],[128,52,-40,2.0],[165,56,-36,2.3]];
    var clouds = [];
    cloudData.forEach(function(c) {
      var g = new THREE.Group();
      var mat = new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:0.9});
      [[0,0,0,1.8],[2.1,0.4,0,1.4],[-1.9,0.3,0,1.3],[0.8,0.9,0,1.0]].forEach(function(sp) {
        var m = new THREE.Mesh(new THREE.SphereGeometry(sp[3]*c[3],7,7),mat);
        m.position.set(sp[0]*c[3],sp[1]*c[3],sp[2]*c[3]); g.add(m);
      });
      g.position.set(c[0],c[1],c[2]); scene.add(g);
      clouds.push({g:g, spd:0.007+Math.random()*0.006});
    });
    return { clouds: clouds };
  },

  // Called every frame for course-specific animation
  animateScenery: function(extras) {
    if (extras && extras.clouds) {
      extras.clouds.forEach(function(c) {
        c.g.position.x += c.spd;
        if (c.g.position.x > 170) c.g.position.x = -130;
      });
    }
  },

  // Finish line mesh
  buildFinish: function(scene) {
    var ftc = document.createElement('canvas'); ftc.width=256; ftc.height=32;
    var ftx = ftc.getContext('2d');
    for (var i=0;i<16;i++) {
      ftx.fillStyle=i%2===0?'#000':'#fff'; ftx.fillRect(i*16,0,16,16);
      ftx.fillStyle=i%2===0?'#fff':'#000'; ftx.fillRect(i*16,16,16,16);
    }
    var fin = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 14),
      new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)})
    );
    fin.rotation.x = -Math.PI/2;
    fin.position.set(4, 0.06, 0);
    scene.add(fin);
  }
};
