// courses/volcano.js — 火山コース（溶岩エリア・降灰）

var Course = {
  id:   'volcano',
  name: '火山コース',
  laps:  3,

  // コース形状：火口を囲む8の字＋橋区間
  controlPoints: [
    [0,0],[45,0],[80,5],[105,20],[115,45],
    [108,70],[88,88],[62,95],[38,90],[18,75],
    [8,52],[15,30],[35,18],[60,15],[85,22],
    [100,42],[98,65],[82,80],[58,85],[30,78],
    [10,58],[5,35],[20,15],[48,5]
  ],
  trackWidth: 14,
  trackSegs:  240,

  startX:     2,
  startZ:     5,
  startAngle: Math.PI / 2,

  gateX: 3,

  // 火山の空（赤黒い）
  skyColor: 0x2a0e08,
  fogColor: 0x3a1408,
  fogNear:  55,
  fogFar:   170,
  nightMode: true,   // 太陽なし

  groundTex: null,   // buildGroundで上書き

  itemBoxes: [
    [0.08,0,0],[0.18,4,0],[0.28,-4,0],
    [0.40,0,0],[0.52,4,0],[0.62,-4,0],
    [0.74,0,0],[0.86,4,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 18 },
    { startT: 0.08,  maxSpd: 20 },
    { startT: 0.12,  maxSpd: 17 }
  ],

  cpuColors: [
    [0xff4400, 0x882200],
    [0xff8800, 0x884400],
    [0xffaa00, 0x886600]
  ],

  buildGround: function(scene) {
    var c=document.createElement('canvas'); c.width=256; c.height=256;
    var x=c.getContext('2d');
    // 暗い溶岩岩盤
    x.fillStyle='#1a0a04'; x.fillRect(0,0,256,256);
    for (var i=0;i<3000;i++) {
      var v=20+Math.floor(Math.random()*25);
      x.fillStyle='rgb('+(v+8)+','+v+','+(v-5)+')';
      x.fillRect(Math.random()*256,Math.random()*256,Math.random()*4+1,Math.random()*3+1);
    }
    // 溶岩の光る亀裂
    var cracks=[[[20,30],[80,60],[140,45],[200,70]],[[10,120],[60,100],[120,130],[180,110]],[[30,200],[90,180],[150,210],[220,195]]];
    cracks.forEach(function(pts) {
      var grad=x.createLinearGradient(pts[0][0],pts[0][1],pts[3][0],pts[3][1]);
      grad.addColorStop(0,'rgba(255,80,0,0)');
      grad.addColorStop(0.5,'rgba(255,120,0,0.6)');
      grad.addColorStop(1,'rgba(255,80,0,0)');
      x.strokeStyle=grad; x.lineWidth=2;
      x.beginPath(); x.moveTo(pts[0][0],pts[0][1]);
      x.bezierCurveTo(pts[1][0],pts[1][1],pts[2][0],pts[2][1],pts[3][0],pts[3][1]);
      x.stroke();
    });
    var t=new THREE.CanvasTexture(c);
    t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(35,35);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2; gnd.position.set(57,-0.05,48);
    gnd.receiveShadow=true; scene.add(gnd);
  },

  buildScenery: function(scene) {
    var extras = { ashParticles:null, ashPos:null, lavaGlows:[], emberList:[] };

    // ---- 火山本体 ----
    var volcanoX=58, volcanoZ=48;
    // 火山の山体
    var vbody=new THREE.Mesh(new THREE.ConeGeometry(55,70,12),new THREE.MeshLambertMaterial({color:0x1e0a04}));
    vbody.position.set(volcanoX,35,volcanoZ); vbody.castShadow=true; scene.add(vbody);
    // 中腹（やや明るい）
    var vmid=new THREE.Mesh(new THREE.ConeGeometry(35,45,12),new THREE.MeshLambertMaterial({color:0x2a1008}));
    vmid.position.set(volcanoX,22,volcanoZ); scene.add(vmid);
    // 火口（光る）
    var crater=new THREE.Mesh(new THREE.CylinderGeometry(8,12,5,12),new THREE.MeshBasicMaterial({color:0xff4400}));
    crater.position.set(volcanoX,70,volcanoZ); scene.add(crater);
    var lavaPool=new THREE.Mesh(new THREE.CircleGeometry(7,12),new THREE.MeshBasicMaterial({color:0xff6600}));
    lavaPool.rotation.x=-Math.PI/2; lavaPool.position.set(volcanoX,72.5,volcanoZ); scene.add(lavaPool);

    // 火口の光源
    var craterLight=new THREE.PointLight(0xff4400,3,120);
    craterLight.position.set(volcanoX,72,volcanoZ); scene.add(craterLight);
    extras.lavaGlows.push(craterLight);

    // ---- 溶岩流（コース外） ----
    var lavaFlows=[
      {x:volcanoX-15,z:volcanoZ+20,rx:8,rz:4,rot:0.4},
      {x:volcanoX+18,z:volcanoZ-12,rx:6,rz:3,rot:-0.3},
      {x:volcanoX-20,z:volcanoZ-15,rx:7,rz:3.5,rot:0.6},
      {x:volcanoX+10,z:volcanoZ+22,rx:9,rz:4,rot:-0.5}
    ];
    lavaFlows.forEach(function(lf) {
      var lm=new THREE.Mesh(new THREE.PlaneGeometry(lf.rx*2,lf.rz*2),new THREE.MeshBasicMaterial({color:0xff5500,transparent:true,opacity:0.85}));
      lm.rotation.x=-Math.PI/2; lm.rotation.z=lf.rot;
      lm.position.set(lf.x,0.1,lf.z); scene.add(lm);
      var lpl=new THREE.PointLight(0xff4400,1.2,18);
      lpl.position.set(lf.x,1,lf.z); scene.add(lpl);
      extras.lavaGlows.push(lpl);
    });

    // ---- 岩・溶岩岩 ----
    var rockData=[
      [-18,22,4,3],[120,18,3.5,2.8],[-15,65,3,2.4],[120,68,4,3.2],
      [-14,92,3.5,2.6],[118,90,3,2.4],[25,-12,3,2.2],[90,-10,3.5,2.8],
      [20,106,3,2.4],[88,108,3.5,2.8]
    ];
    rockData.forEach(function(r) {
      var col=Math.random()<0.5?0x3a1a0a:0x2a1006;
      var rm=new THREE.Mesh(new THREE.DodecahedronGeometry(r[2],1),new THREE.MeshLambertMaterial({color:col}));
      rm.scale.y=r[3]/r[2]; rm.position.set(r[0],r[3]/2,r[1]);
      rm.rotation.y=Math.random()*Math.PI; rm.castShadow=true; scene.add(rm);
      // 一部は溶岩で光る
      if (Math.random()<0.4) {
        var glow=new THREE.Mesh(new THREE.DodecahedronGeometry(r[2]*0.6,0),new THREE.MeshBasicMaterial({color:0xff3300,transparent:true,opacity:0.4}));
        glow.scale.y=r[3]/r[2]; glow.position.set(r[0],r[3]/2,r[1]); scene.add(glow);
      }
    });

    // ---- 溶岩の地割れ（地面の光る線） ----
    var crackLines=[
      [[volcanoX-30,0,volcanoZ+10],[volcanoX-40,0,volcanoZ+30]],
      [[volcanoX+25,0,volcanoZ-8],[volcanoX+38,0,volcanoZ-25]],
      [[volcanoX-25,0,volcanoZ-18],[volcanoX-35,0,volcanoZ-35]]
    ];
    crackLines.forEach(function(cl) {
      var pts=cl.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);});
      var curve=new THREE.LineCurve3(pts[0],pts[1]);
      var points=curve.getPoints(10);
      var geo=new THREE.BufferGeometry().setFromPoints(points);
      var mat=new THREE.LineBasicMaterial({color:0xff5500,transparent:true,opacity:0.7});
      scene.add(new THREE.Line(geo,mat));
      var lpl2=new THREE.PointLight(0xff4400,0.6,12);
      lpl2.position.set((cl[0][0]+cl[1][0])/2,0.5,(cl[0][2]+cl[1][2])/2); scene.add(lpl2);
    });

    // ---- 降灰パーティクル ----
    var ashCount=500;
    var ashGeo=new THREE.BufferGeometry();
    var ashPosArr=new Float32Array(ashCount*3);
    for (var i=0;i<ashCount;i++) {
      ashPosArr[i*3]  =(Math.random()-0.5)*160+57;
      ashPosArr[i*3+1]=Math.random()*40;
      ashPosArr[i*3+2]=(Math.random()-0.5)*160+48;
    }
    ashGeo.setAttribute('position',new THREE.BufferAttribute(ashPosArr,3));
    var ashMat=new THREE.PointsMaterial({color:0x553322,size:0.3,transparent:true,opacity:0.6});
    var ash=new THREE.Points(ashGeo,ashMat);
    scene.add(ash);
    extras.ashParticles=ash;
    extras.ashPos=ashPosArr;

    // ---- 炎エフェクト（火口周辺） ----
    for (var j=0;j<8;j++) {
      var angle=j/8*Math.PI*2;
      var ex=volcanoX+Math.cos(angle)*10, ez=volcanoZ+Math.sin(angle)*10;
      var ember=new THREE.Mesh(new THREE.SphereGeometry(0.4,6,6),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:0.8}));
      ember.position.set(ex,72+Math.random()*5,ez); scene.add(ember);
      extras.emberList.push({mesh:ember,baseY:72,angle:angle,speed:0.05+Math.random()*0.05,phase:Math.random()*Math.PI*2});
    }

    // ---- 環境光（赤い補助光） ----
    var redFill=new THREE.DirectionalLight(0xff3300,0.8);
    redFill.position.set(volcanoX,80,volcanoZ); scene.add(redFill);
    var redFill2=new THREE.DirectionalLight(0xff6600,0.5);
    redFill2.position.set(0,30,0); scene.add(redFill2);

    return extras;
  },

  animateScenery: function(extras, frm) {
    if (!extras) return;

    // 降灰
    if (extras.ashParticles && extras.ashPos) {
      var pos=extras.ashPos;
      for (var i=0;i<pos.length/3;i++) {
        pos[i*3]  +=Math.sin(frm*0.015+i*0.4)*0.08;
        pos[i*3+1]-=0.05+Math.random()*0.02;
        pos[i*3+2]+=Math.cos(frm*0.012+i*0.3)*0.06;
        if (pos[i*3+1]<0) {
          pos[i*3+1]=36+Math.random()*6;
          pos[i*3]=(Math.random()-0.5)*160+57;
          pos[i*3+2]=(Math.random()-0.5)*160+48;
        }
      }
      extras.ashParticles.geometry.attributes.position.needsUpdate=true;
    }

    // 溶岩の揺らぎ（光源のちらつき）
    extras.lavaGlows.forEach(function(light,i) {
      if (light.intensity!==undefined) {
        light.intensity=light.intensity*0.95+(Math.sin(frm*0.08+i*1.2)*0.5+2.5)*0.05;
      }
    });

    // 炎エンバー（浮遊）
    extras.emberList.forEach(function(e) {
      e.phase+=e.speed;
      e.mesh.position.y=e.baseY+Math.sin(e.phase)*3+Math.random()*0.5;
      e.mesh.position.x+=Math.cos(e.angle)*0.05;
      e.mesh.position.z+=Math.sin(e.angle)*0.05;
      e.mesh.material.opacity=0.5+Math.sin(e.phase*1.5)*0.35;
      // 離れすぎたらリセット
      var dx=e.mesh.position.x-58, dz=e.mesh.position.z-48;
      if (dx*dx+dz*dz>400) { e.mesh.position.set(58+Math.cos(e.angle)*10,72,48+Math.sin(e.angle)*10); }
    });
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
    // 溶岩石の柱
    [-8,8].forEach(function(sx) {
      var pillar=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.9,10,8),new THREE.MeshLambertMaterial({color:0x2a1008}));
      pillar.position.set(sx,5,0); pillar.castShadow=true; scene.add(pillar);
      var glow=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.95,10.2,8),new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:0.25}));
      glow.position.set(sx,5,0); scene.add(glow);
      var top=new THREE.Mesh(new THREE.SphereGeometry(1,8,8),new THREE.MeshBasicMaterial({color:0xff5500}));
      top.position.set(sx,10.5,0); scene.add(top);
      var topLight=new THREE.PointLight(0xff4400,1.5,15);
      topLight.position.set(sx,11,0); scene.add(topLight);
    });
  }
};
