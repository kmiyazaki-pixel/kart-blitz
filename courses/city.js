// courses/city.js — 夜の都市（3xスケール・幅28・雨）

var Course = {
  id:   'city',
  name: '夜の都市',
  laps:  5,
  nightMode: true,

  controlPoints: [
    [0,0],[210,0],[330,0],[390,36],[396,90],
    [354,138],[270,156],[180,156],[90,180],[30,225],
    [0,285],[-30,345],[-24,405],[30,444],[120,465],
    [240,465],[330,444],[384,405],[396,336],[360,285],
    [285,255],[210,246],[120,246],[54,210],[30,165],[24,105]
  ],
  trackWidth: 28,
  trackSegs:  260,

  startX:     0,
  startZ:     12,
  startAngle: Math.PI / 2,
  gateX:      3,

  skyColor:  0x0d1a2e,
  fogColor:  0x111e30,
  fogNear:   80,
  fogFar:    240,

  buildGround: function(scene) {
    var c=document.createElement('canvas');c.width=256;c.height=256;
    var x=c.getContext('2d');
    x.fillStyle='#141820';x.fillRect(0,0,256,256);
    for(var i=0;i<200;i++){
      var v=18+Math.floor(Math.random()*12);
      x.fillStyle='rgb('+v+','+v+','+(v+8)+')';
      x.fillRect(Math.random()*256,Math.random()*256,3,3);
    }
    ['#ff440033','#00ffcc22','#cc00ff22','#ffcc0033'].forEach(function(col,ci){
      x.fillStyle=col;x.fillRect(ci*64,0,30,256);
    });
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(35,35);
    var gnd=new THREE.Mesh(new THREE.PlaneGeometry(900,800),new THREE.MeshLambertMaterial({map:t}));
    gnd.rotation.x=-Math.PI/2;gnd.position.set(183,-0.05,232);
    gnd.receiveShadow=true;scene.add(gnd);
  },

  itemBoxes: [
    [0.06,0,0],[0.14,8,0],[0.22,-8,0],[0.30,0,0],
    [0.40,8,0],[0.50,-8,0],[0.60,0,0],
    [0.70,8,0],[0.80,-8,0],[0.90,0,0]
  ],

  cpus: [
    { startT: 0.04,  maxSpd: 18 },
    { startT: 0.08,  maxSpd: 20 },
    { startT: 0.12,  maxSpd: 17 }
  ],

  cpuColors: [
    [0xff6600, 0x882200],
    [0x00ffcc, 0x006644],
    [0xcc00ff, 0x550088]
  ],

  buildScenery: function(scene) {
    var extras = { rainParticles:null, rainPos:null, signs:[] };

    // ビル群
    [[-50,65,20,55,30,0x111622,0xff6600],[-55,150,16,38,24,0x0d1020,0x00ffcc],
     [-50,275,22,65,32,0x121520,0xcc00ff],[-52,390,18,45,26,0x101418,0xffcc00],
     [450,55,20,60,30,0x0d1018,0xff4466],[452,155,16,42,24,0x111622,0x44aaff],
     [448,280,22,70,32,0x0e1220,0x00ffcc],[450,395,18,50,26,0x121520,0xff6600],
     [80,525,22,48,28,0x0d1018,0xcc00ff],[200,528,24,62,30,0x111622,0xffcc00],
     [320,525,20,45,26,0x121520,0x44aaff]].forEach(function(b) {
      var bm=new THREE.Mesh(new THREE.BoxGeometry(b[2],b[3],b[4]),new THREE.MeshLambertMaterial({color:b[5]}));
      bm.position.set(b[0],b[3]/2,b[1]);bm.castShadow=true;scene.add(bm);
      var rl=new THREE.Mesh(new THREE.BoxGeometry(b[2]+0.8,1.2,b[4]+0.8),new THREE.MeshBasicMaterial({color:b[6],transparent:true,opacity:0.7}));
      rl.position.set(b[0],b[3]+0.6,b[1]);scene.add(rl);
      for(var wy=4;wy<b[3]-3;wy+=5){
        for(var wx=-b[2]/2+2;wx<b[2]/2;wx+=3.5){
          if(Math.random()<0.7){
            var win=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.5),new THREE.MeshBasicMaterial({color:b[6],transparent:true,opacity:0.45+Math.random()*0.4}));
            win.position.set(b[0]+wx,wy,b[1]+b[4]/2+0.08);scene.add(win);
          }
        }
      }
    });

    // 街灯（明るく・多め）
    [[10,30],[10,90],[10,155],[10,220],[10,300],[10,370],[10,430],
     [420,30],[420,90],[420,155],[420,220],[420,300],[420,370],[420,430],
     [100,490],[200,492],[300,490]].forEach(function(lp) {
      var pole=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.4,12,6),new THREE.MeshLambertMaterial({color:0x445566}));
      pole.position.set(lp[0],6,lp[1]);pole.castShadow=true;scene.add(pole);
      var lamp=new THREE.Mesh(new THREE.SphereGeometry(0.85,8,8),new THREE.MeshBasicMaterial({color:0xffeeaa}));
      lamp.position.set(lp[0],12.5,lp[1]);scene.add(lamp);
      var pl=new THREE.PointLight(0xffeeaa,2.8,40);
      pl.position.set(lp[0],12,lp[1]);scene.add(pl);
    });

    // ネオンサイン
    [[0,18,30,0xff4400,18,3.5],[396,20,50,0x00ffcc,16,3],
     [0,20,165,0xcc00ff,20,3.8],[396,18,175,0xffcc00,16,3],
     [183,18,490,0xff4466,24,3.5]].forEach(function(sg) {
      var sm=new THREE.Mesh(new THREE.BoxGeometry(sg[3],sg[4],0.4),new THREE.MeshBasicMaterial({color:sg[2],transparent:true,opacity:0.9}));
      sm.position.set(sg[0],sg[1],sg[5-1]||sg[1]);
      sm.position.set(sg[0],sg[1],sg[5]);
      scene.add(sm);
      extras.signs.push({mesh:sm,phase:Math.random()*Math.PI*2});
    });

    // 雨
    var rainCount=800,rainGeo=new THREE.BufferGeometry();
    var rainPos=new Float32Array(rainCount*3);
    for(var i=0;i<rainCount;i++){
      rainPos[i*3]  =(Math.random()-0.5)*400+183;
      rainPos[i*3+1]=Math.random()*50;
      rainPos[i*3+2]=(Math.random()-0.5)*360+232;
    }
    rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
    var rainMat=new THREE.PointsMaterial({color:0x8899bb,size:0.22,transparent:true,opacity:0.6});
    var rain=new THREE.Points(rainGeo,rainMat);
    scene.add(rain);
    extras.rainParticles=rain;
    extras.rainPos=rainPos;

    return extras;
  },

  animateScenery: function(extras, frm) {
    if(!extras)return;
    if(extras.rainParticles&&extras.rainPos){
      var pos=extras.rainPos;
      for(var i=0;i<pos.length/3;i++){
        pos[i*3]  -=0.06;
        pos[i*3+1]-=0.65;
        if(pos[i*3+1]<0){
          pos[i*3+1]=46+Math.random()*6;
          pos[i*3]  =(Math.random()-0.5)*400+183;
          pos[i*3+2]=(Math.random()-0.5)*360+232;
        }
      }
      extras.rainParticles.geometry.attributes.position.needsUpdate=true;
    }
    if(extras.signs){
      extras.signs.forEach(function(sg){
        sg.phase+=0.04;
        sg.mesh.material.opacity=0.6+Math.sin(sg.phase)*0.35;
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
    var fin=new THREE.Mesh(new THREE.PlaneGeometry(2.5,28),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(ftc)}));
    fin.rotation.x=-Math.PI/2;fin.position.set(4,0.06,0);scene.add(fin);
    var archMat=new THREE.MeshBasicMaterial({color:0x00ffcc,transparent:true,opacity:0.85});
    [-15,15].forEach(function(sx){
      var col=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,16,8),archMat);
      col.position.set(sx,8,0);scene.add(col);
      var pl=new THREE.PointLight(0x00ffcc,2,20);pl.position.set(sx,16,0);scene.add(pl);
    });
    var top=new THREE.Mesh(new THREE.BoxGeometry(32,0.8,0.8),archMat);
    top.position.set(0,16,0);scene.add(top);
  }
};
