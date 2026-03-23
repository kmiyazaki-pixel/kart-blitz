// kart.js — 3D kart model builder

var KartBuilder = {
  make: function(bodyColor, cabinColor, accentColor) {
    accentColor = accentColor || 0x222222;
    var g = new THREE.Group();

    // Body
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.55, 3.8),
      new THREE.MeshLambertMaterial({ color: bodyColor })
    );
    body.position.y = 0.42; body.castShadow = true; g.add(body);

    // Cabin
    var cab = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.56, 1.9),
      new THREE.MeshLambertMaterial({ color: cabinColor })
    );
    cab.position.set(0, 1.0, -0.1); cab.castShadow = true; g.add(cab);

    // Windshield
    var ws = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.46),
      new THREE.MeshLambertMaterial({ color: 0x66aaff, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    ws.position.set(0, 1.0, 0.88); ws.rotation.x = -0.2; g.add(ws);

    // Spoiler
    var sp = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.1, 0.5),
      new THREE.MeshLambertMaterial({ color: bodyColor })
    );
    sp.position.set(0, 1.2, -1.75); g.add(sp);
    [-1.2, 1.2].forEach(function(sx) {
      var pt = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.46),
        new THREE.MeshLambertMaterial({ color: accentColor })
      );
      pt.position.set(sx, 0.92, -1.75); g.add(pt);
    });

    // Front bumper
    var fb = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.34, 0.24),
      new THREE.MeshLambertMaterial({ color: accentColor })
    );
    fb.position.set(0, 0.32, 1.98); g.add(fb);

    // Wheels
    [[1.38,0.44,1.55],[-1.38,0.44,1.55],[1.38,0.44,-1.55],[-1.38,0.44,-1.55]].forEach(function(wp) {
      var tire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.44, 0.44, 0.34, 10),
        new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
      );
      tire.rotation.z = Math.PI/2; tire.position.set(wp[0],wp[1],wp[2]); tire.castShadow = true; g.add(tire);

      var rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.36, 8),
        new THREE.MeshLambertMaterial({ color: 0xcccccc })
      );
      rim.rotation.z = Math.PI/2; rim.position.set(wp[0],wp[1],wp[2]); g.add(rim);

      var hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.38, 8),
        new THREE.MeshLambertMaterial({ color: 0xffcc00 })
      );
      hub.rotation.z = Math.PI/2; hub.position.set(wp[0],wp[1],wp[2]); g.add(hub);
    });

    // Headlights
    [[0.7,0.52,1.92],[-0.7,0.52,1.92]].forEach(function(lp) {
      var hl = new THREE.Mesh(new THREE.CircleGeometry(0.19,8), new THREE.MeshBasicMaterial({ color: 0xffffcc }));
      hl.position.set(lp[0],lp[1],lp[2]); g.add(hl);
    });

    // Tail lights
    [[0.8,0.5,-1.92],[-0.8,0.5,-1.92]].forEach(function(lp) {
      var tl = new THREE.Mesh(new THREE.CircleGeometry(0.16,8), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
      tl.position.set(lp[0],lp[1],lp[2]); tl.rotation.y = Math.PI; g.add(tl);
    });

    return g;
  }
};
