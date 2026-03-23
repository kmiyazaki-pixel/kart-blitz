// engine.js — shared game engine (physics, camera, HUD, item system)

var Engine = (function() {

  // ---- Catmull-Rom spline ----
  function catmull(cps, t) {
    var n = cps.length, i = Math.floor(t * n);
    var p0=cps[(i-1+n)%n], p1=cps[i%n], p2=cps[(i+1)%n], p3=cps[(i+2)%n];
    var u=(t*n)-i, u2=u*u, u3=u2*u;
    return [
      0.5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
      0.5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)
    ];
  }

  // Pre-bake track center points for fast distance queries
  function bakeTrack(cps, segs) {
    var pts = [];
    for (var i = 0; i <= segs; i++) {
      var r = catmull(cps, i/segs);
      pts.push({ x: r[0], z: r[1] });
    }
    return pts;
  }

  function nearestDist(pts, x, z) {
    var best = 999999;
    for (var i = 0; i < pts.length; i++) {
      var dx=x-pts[i].x, dz=z-pts[i].z, d=dx*dx+dz*dz;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }

  // 最近傍トラック点を返す（境界押し戻し用）
  function nearestPoint(pts, x, z) {
    var best=999999, bx=pts[0].x, bz=pts[0].z;
    for (var i = 0; i < pts.length; i++) {
      var dx=x-pts[i].x, dz=z-pts[i].z, d=dx*dx+dz*dz;
      if (d < best) { best=d; bx=pts[i].x; bz=pts[i].z; }
    }
    return { x: bx, z: bz };
  }

  function nearestT(cps, segs, x, z) {
    var best=999999, bt=0;
    for (var i = 0; i < segs; i++) {
      var r=catmull(cps, i/segs), dx=x-r[0], dz=z-r[1], d=dx*dx+dz*dz;
      if (d < best) { best=d; bt=i/segs; }
    }
    return bt;
  }

  // ---- Road mesh builder ----
  function buildRoad(scene, tpts, tw, asphaltTex) {
    var segs = tpts.length - 1;
    var rv=[], ruv=[], ri=[];
    for (var i = 0; i < segs; i++) {
      var p0=tpts[i], p1=tpts[(i+1)%segs];
      var dx=p1.x-p0.x, dz=p1.z-p0.z, len=Math.sqrt(dx*dx+dz*dz);
      var nx=-dz/len, nz=dx/len, hw=tw/2, b=i*4;
      rv.push(p0.x-nx*hw,0.02,p0.z-nz*hw, p0.x+nx*hw,0.02,p0.z+nz*hw,
              p1.x-nx*hw,0.02,p1.z-nz*hw, p1.x+nx*hw,0.02,p1.z+nz*hw);
      var u0=i/segs*80, u1=(i+1)/segs*80;
      ruv.push(0,u0, 1,u0, 0,u1, 1,u1);
      ri.push(b,b+1,b+2, b+1,b+3,b+2);
    }
    var rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute(rv,3));
    rg.setAttribute('uv', new THREE.Float32BufferAttribute(ruv,2));
    rg.setIndex(ri); rg.computeVertexNormals();
    var mesh = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ map: asphaltTex }));
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  function buildCurbs(scene, tpts, tw, curbTex) {
    [1, -1].forEach(function(side) {
      var segs = tpts.length - 1;
      var cv=[], ci=[];
      for (var i = 0; i < segs; i++) {
        var p0=tpts[i], p1=tpts[(i+1)%segs];
        var dx=p1.x-p0.x, dz=p1.z-p0.z, len=Math.sqrt(dx*dx+dz*dz);
        var nx=-dz/len*side, nz=dx/len*side, hw=tw/2, cw=1.1, b=i*4;
        cv.push(p0.x+nx*hw,    0.04,p0.z+nz*hw,
                p0.x+nx*(hw+cw),0.04,p0.z+nz*(hw+cw),
                p1.x+nx*hw,    0.04,p1.z+nz*hw,
                p1.x+nx*(hw+cw),0.04,p1.z+nz*(hw+cw));
        ci.push(b,b+1,b+2, b+1,b+3,b+2);
      }
      var cg = new THREE.BufferGeometry();
      cg.setAttribute('position', new THREE.Float32BufferAttribute(cv,3));
      cg.setIndex(ci); cg.computeVertexNormals();
      scene.add(new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ map: curbTex })));
    });
  }

  // ---- Item boxes ----
  var ITYPES  = ['banana','shell','star','red'];
  var IEMOJI  = { banana:'🍌', shell:'🐢', star:'⭐', red:'🔴' };
  var ICOLORS = { banana:0xffee00, shell:0x009900, star:0xffcc00, red:0xff2200 };

  function buildItemBoxes(scene, cps, positions) {
    var boxes = [];
    positions.forEach(function(tp) {
      var r = catmull(cps, tp[0]);
      var g = new THREE.Group();
      var bx = new THREE.Mesh(
        new THREE.BoxGeometry(1.5,1.5,1.5),
        new THREE.MeshLambertMaterial({ color:0xffdd00, emissive:0x886600, emissiveIntensity:0.5 })
      );
      bx.castShadow = true; g.add(bx);
      var wf = new THREE.Mesh(
        new THREE.BoxGeometry(1.8,1.8,1.8),
        new THREE.MeshBasicMaterial({ color:0xffffaa, transparent:true, opacity:0.15, wireframe:true })
      );
      g.add(wf);
      g.position.set(r[0]+(tp[1]||0), 1.0, r[1]+(tp[2]||0));
      scene.add(g);
      boxes.push({ g:g, wf:wf, col:false, resp:0, type:ITYPES[Math.floor(Math.random()*4)] });
    });
    return boxes;
  }

  // ---- Exhaust particles ----
  function ExhaustSystem(scene) {
    this.list = [];
    this.scene = scene;
  }
  ExhaustSystem.prototype.spawn = function(x, z, col) {
    if (this.list.length > 60) return;
    var m = new THREE.Mesh(
      new THREE.SphereGeometry(0.16,4,4),
      new THREE.MeshBasicMaterial({ color:col||0xbbbbbb, transparent:true, opacity:0.5 })
    );
    m.position.set(x, 0.5, z);
    this.scene.add(m);
    this.list.push({ mesh:m, life:20, vx:(Math.random()-0.5)*0.12, vz:(Math.random()-0.5)*0.12, vy:0.04 });
  };
  ExhaustSystem.prototype.update = function(dt) {
    for (var i = this.list.length-1; i >= 0; i--) {
      var e = this.list[i]; e.life -= dt*28;
      e.mesh.position.x += e.vx; e.mesh.position.y += e.vy; e.mesh.position.z += e.vz;
      e.mesh.material.opacity = Math.max(0, e.life/20*0.5);
      e.mesh.scale.setScalar(1+(1-e.life/20)*1.6);
      if (e.life <= 0) { this.scene.remove(e.mesh); this.list.splice(i,1); }
    }
  };

  // ---- Minimap ----
  function drawMinimap(ctx, cps, segs, playerX, playerZ, cpuStates) {
    ctx.clearRect(0,0,100,100);
    ctx.fillStyle='rgba(0,0,20,0.7)'; ctx.fillRect(0,0,100,100);

    // Compute track bounds for scaling
    var minX=999,maxX=-999,minZ=999,maxZ=-999;
    for (var i=0;i<=segs;i++) {
      var r=catmull(cps,i/segs);
      if(r[0]<minX)minX=r[0]; if(r[0]>maxX)maxX=r[0];
      if(r[1]<minZ)minZ=r[1]; if(r[1]>maxZ)maxZ=r[1];
    }
    var rangeX=maxX-minX||1, rangeZ=maxZ-minZ||1;
    var scale=Math.min(90/rangeX, 90/rangeZ);
    var offX=(100-rangeX*scale)/2, offZ=(100-rangeZ*scale)/2;
    function tm(x,z) { return [(x-minX)*scale+offX, (z-minZ)*scale+offZ]; }

    ctx.strokeStyle='#555'; ctx.lineWidth=6; ctx.beginPath();
    for (var i=0;i<=segs;i++) { var r=catmull(cps,i/segs),m=tm(r[0],r[1]); i===0?ctx.moveTo(m[0],m[1]):ctx.lineTo(m[0],m[1]); }
    ctx.closePath(); ctx.stroke();
    ctx.strokeStyle='#888'; ctx.lineWidth=2; ctx.beginPath();
    for (var i=0;i<=segs;i++) { var r=catmull(cps,i/segs),m=tm(r[0],r[1]); i===0?ctx.moveTo(m[0],m[1]):ctx.lineTo(m[0],m[1]); }
    ctx.closePath(); ctx.stroke();

    var cpuColors=['#ffcc00','#00ccff','#33ee55'];
    cpuStates.forEach(function(c,i) {
      var m=tm(c.px,c.pz); ctx.fillStyle=cpuColors[i]; ctx.beginPath(); ctx.arc(m[0],m[1],3,0,Math.PI*2); ctx.fill();
    });

    var pm=tm(playerX,playerZ);
    ctx.fillStyle='#ff3333'; ctx.beginPath(); ctx.arc(pm[0],pm[1],5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke();
  }

  // ---- Player controller ----
  function PlayerController(config) {
    this.px    = config.startX || 0;
    this.pz    = config.startZ || 0;
    this.angle = config.startAngle || Math.PI/2;
    this.vx = 0; this.vz = 0;
    this.lap   = 1;
    this.item  = null;
    this.spinT = 0;
    this.starT = 0;
    this.locked = true;
    this.tw        = config.trackWidth  || 28;
    this.MAXSPD    = config.maxSpeed    || 55;
    this.ACC       = config.accel       || 180;
    this.TURN      = config.turnSpeed   || 2.5;
    this.DRAG_ROAD = config.dragRoad    || 1.2;
    this.DRAG_GRASS= config.dragGrass   || 5.0;
    this.TLAPS     = config.laps        || 3;
    this.gateX     = config.gateX      || 3;
    this.gatePredicate = config.gatePredicate || null;
    this._prevX    = this.px;
    this.finished  = false;
  }

  PlayerController.prototype.update = function(dt, keys, tpts) {
    if (this.locked) return { spd:0, lt:false, rt:false, up:false };
    var up = keys['ArrowUp']  ||keys['w']||keys['W'];
    var dn = keys['ArrowDown']||keys['s']||keys['S'];
    var lt = keys['ArrowLeft']||keys['a']||keys['A'];
    var rt = keys['ArrowRight']||keys['d']||keys['D'];

    if (this.starT > 0) this.starT -= dt;
    var cmax = this.starT > 0 ? this.MAXSPD*1.45 : this.MAXSPD;
    var distOff = nearestDist(tpts, this.px, this.pz);
    var onRoad  = distOff < this.tw / 2;
    var drag    = onRoad ? this.DRAG_ROAD : this.DRAG_GRASS;
    var spd     = Math.sqrt(this.vx*this.vx + this.vz*this.vz);

    if (this.spinT > 0) {
      this.spinT -= dt;
      this.vx *= Math.exp(-7*dt); this.vz *= Math.exp(-7*dt);
      this.angle += 5*dt;
    } else {
      if (lt) this.angle += this.TURN*dt*(Math.min(spd,this.MAXSPD)/this.MAXSPD*0.75+0.25);
      if (rt) this.angle -= this.TURN*dt*(Math.min(spd,this.MAXSPD)/this.MAXSPD*0.75+0.25);
      if (up) {
        this.vx += Math.sin(this.angle)*this.ACC*dt;
        this.vz += Math.cos(this.angle)*this.ACC*dt;
        var s2=Math.sqrt(this.vx*this.vx+this.vz*this.vz);
        if(s2>cmax){this.vx=this.vx/s2*cmax;this.vz=this.vz/s2*cmax;}
      } else if (dn) {
        this.vx -= Math.sin(this.angle)*55*dt;
        this.vz -= Math.cos(this.angle)*55*dt;
        var s2=Math.sqrt(this.vx*this.vx+this.vz*this.vz);
        if(s2>this.MAXSPD*0.3){this.vx=this.vx/s2*this.MAXSPD*0.3;this.vz=this.vz/s2*this.MAXSPD*0.3;}
      }
    }

    this.vx *= Math.exp(-drag*dt);
    this.vz *= Math.exp(-drag*dt);

    this._prevX = this.px;
    this.px += this.vx*dt;
    this.pz += this.vz*dt;

    // ---- トラック境界の強制（コース外に出たら押し戻す） ----
    var distAfter = nearestDist(tpts, this.px, this.pz);
    var wall = this.tw / 2 + 1;
    if (distAfter > wall) {
      var np = nearestPoint(tpts, this.px, this.pz);
      var pushX = np.x - this.px, pushZ = np.z - this.pz;
      var plen  = Math.sqrt(pushX*pushX + pushZ*pushZ);
      if (plen > 0) {
        var excess = distAfter - wall;
        var force  = Math.min(excess * 14, 90);
        this.vx += pushX/plen * force * dt;
        this.vz += pushZ/plen * force * dt;
        this.vx *= Math.exp(-5*dt);
        this.vz *= Math.exp(-5*dt);
        // 大きくはみ出た場合は位置も直接補正
        if (distAfter > wall + 5) {
          this.px += pushX/plen * (distAfter - wall - 5) * 0.35;
          this.pz += pushZ/plen * (distAfter - wall - 5) * 0.35;
        }
      }
    }

    return { spd:spd, lt:lt, rt:rt, up:up };
  };

  PlayerController.prototype.checkGate = function() {
    if (this.gatePredicate) return this.gatePredicate(this.px, this._prevX, this.pz);
    return this._prevX < this.gateX && this.px >= this.gateX && Math.abs(this.pz) < this.tw/2 + 4;
  };

  PlayerController.prototype.hit = function() {
    this.vx *= 0.2; this.vz *= 0.2; this.spinT = 1.5;
  };

  // ---- CPU controller ----
  function CpuController(cps, startT, maxSpd) {
    var r=catmull(cps,startT), r2=catmull(cps,startT+0.01);
    this.px=r[0]; this.pz=r[1];
    this.angle=Math.atan2(r2[0]-r[0], r2[1]-r[1]);
    this.vx=0; this.vz=0;
    this.tgt=startT+0.02;
    this.lap=1;
    this.locked=true;
    this.maxSpd=maxSpd||45;
    this.cps=cps;
  }

  CpuController.prototype.update = function(dt, tpts, tw) {
    if (this.locked) return;

    // 現在地から最も近いトラックT値を毎フレーム再計算して迷子を防ぐ
    var closestT = 0, closestD = 999999;
    var n = this.cps.length;
    // 前回tgtの前後だけ探索（全探索は重いので±0.25の範囲）
    var searchRange = 80;
    var baseSeg = Math.floor(this.tgt * 200);
    for (var si = -10; si <= searchRange; si++) {
      var ti = ((baseSeg + si) % 200 + 200) % 200;
      var r = catmull(this.cps, ti / 200);
      var dx = this.px - r[0], dz = this.pz - r[1];
      var d = dx*dx + dz*dz;
      if (d < closestD) { closestD = d; closestT = ti / 200; }
    }

    // 先読み: 現在地から一定距離先のトラックポイントを目標にする
    var lookahead = 0.025 + Math.min(Math.sqrt(this.vx*this.vx+this.vz*this.vz)/this.maxSpd, 1) * 0.02;
    this.tgt = (closestT + lookahead) % 1;

    var tgt = catmull(this.cps, this.tgt);
    var tdx = tgt[0] - this.px, tdz = tgt[1] - this.pz;

    // 向きをターゲット方向に合わせる（強めに）
    var ta = Math.atan2(tdx, tdz);
    var diff = ta - this.angle;
    while (diff >  Math.PI) diff -= Math.PI*2;
    while (diff < -Math.PI) diff += Math.PI*2;
    this.angle += diff * Math.min(dt * 6.0, 1);

    // 加速（常にフルスロットル）
    var spd = Math.sqrt(this.vx*this.vx + this.vz*this.vz);
    if (spd < this.maxSpd) {
      this.vx += Math.sin(this.angle) * this.maxSpd * 5.0 * dt;
      this.vz += Math.cos(this.angle) * this.maxSpd * 5.0 * dt;
    }
    // 速度上限
    var cv = Math.sqrt(this.vx*this.vx + this.vz*this.vz);
    if (cv > this.maxSpd) { this.vx = this.vx/cv*this.maxSpd; this.vz = this.vz/cv*this.maxSpd; }

    // 摩擦
    this.vx *= Math.exp(-1.2*dt);
    this.vz *= Math.exp(-1.2*dt);

    this.px += this.vx*dt;
    this.pz += this.vz*dt;

    // コース境界の強制（プレイヤーと同じロジック）
    if (tpts && tw) {
      var distAfter = nearestDist(tpts, this.px, this.pz);
      var wall = tw / 2 + 1;
      if (distAfter > wall) {
        var np = nearestPoint(tpts, this.px, this.pz);
        var pushX = np.x - this.px, pushZ = np.z - this.pz;
        var plen = Math.sqrt(pushX*pushX + pushZ*pushZ);
        if (plen > 0) {
          var excess = distAfter - wall;
          this.vx += pushX/plen * Math.min(excess*16, 100) * dt;
          this.vz += pushZ/plen * Math.min(excess*16, 100) * dt;
          this.vx *= Math.exp(-5*dt);
          this.vz *= Math.exp(-5*dt);
          if (distAfter > wall + 4) {
            this.px += pushX/plen * (distAfter - wall - 4) * 0.4;
            this.pz += pushZ/plen * (distAfter - wall - 4) * 0.4;
          }
        }
      }
    }
  };

  // ---- Public API ----
  return {
    catmull:       catmull,
    bakeTrack:     bakeTrack,
    nearestDist:   nearestDist,
    nearestPoint:  nearestPoint,
    nearestT:      nearestT,
    buildRoad:     buildRoad,
    buildCurbs:    buildCurbs,
    buildItemBoxes:buildItemBoxes,
    ExhaustSystem: ExhaustSystem,
    PlayerController: PlayerController,
    CpuController:    CpuController,
    drawMinimap:   drawMinimap,
    ITYPES:  ITYPES,
    IEMOJI:  IEMOJI,
    ICOLORS: ICOLORS
  };
})();
