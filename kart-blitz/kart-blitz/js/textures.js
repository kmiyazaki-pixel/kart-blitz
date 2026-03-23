// textures.js — canvas-based texture generators

var Textures = {
  asphalt: function() {
    var c = document.createElement('canvas'); c.width = 256; c.height = 256;
    var x = c.getContext('2d');
    x.fillStyle = '#707070'; x.fillRect(0,0,256,256);
    for (var i = 0; i < 3000; i++) {
      var v = 80 + Math.floor(Math.random()*30);
      x.fillStyle = 'rgb('+v+','+v+','+v+')';
      x.beginPath(); x.arc(Math.random()*256, Math.random()*256, Math.random()*1.4, 0, Math.PI*2); x.fill();
    }
    x.strokeStyle = 'rgba(255,210,0,0.65)'; x.lineWidth = 5; x.setLineDash([18,18]);
    x.beginPath(); x.moveTo(128,0); x.lineTo(128,256); x.stroke(); x.setLineDash([]);
    x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 4;
    x.beginPath(); x.moveTo(20,0); x.lineTo(20,256); x.stroke();
    x.beginPath(); x.moveTo(236,0); x.lineTo(236,256); x.stroke();
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 80);
    return t;
  },

  grass: function() {
    var c = document.createElement('canvas'); c.width = 128; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = '#3a8a34'; x.fillRect(0,0,128,128);
    for (var i = 0; i < 1000; i++) {
      var v = 40 + Math.floor(Math.random()*40);
      x.fillStyle = 'rgb('+v+','+(v+48)+','+v+')';
      x.fillRect(Math.random()*128, Math.random()*128, 2, 3);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40);
    return t;
  },

  curb: function(segs) {
    var c = document.createElement('canvas'); c.width = 32; c.height = 128;
    var x = c.getContext('2d');
    for (var j = 0; j < 8; j++) {
      x.fillStyle = j%2===0 ? '#dd2222' : '#ffffff';
      x.fillRect(0, j*16, 32, 16);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, (segs||180)/6);
    return t;
  },

  checker: function() {
    var c = document.createElement('canvas'); c.width = 256; c.height = 32;
    var x = c.getContext('2d');
    for (var i = 0; i < 16; i++) {
      x.fillStyle = i%2===0 ? '#000' : '#fff'; x.fillRect(i*16, 0, 16, 16);
      x.fillStyle = i%2===0 ? '#fff' : '#000'; x.fillRect(i*16, 16, 16, 16);
    }
    return new THREE.CanvasTexture(c);
  },

  sand: function() {
    var c = document.createElement('canvas'); c.width = 128; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = '#d4b86a'; x.fillRect(0,0,128,128);
    for (var i = 0; i < 800; i++) {
      var v = 180 + Math.floor(Math.random()*40);
      x.fillStyle = 'rgb('+v+','+(v-20)+','+Math.floor(v*0.5)+')';
      x.fillRect(Math.random()*128, Math.random()*128, 2, 2);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40);
    return t;
  },

  snow: function() {
    var c = document.createElement('canvas'); c.width = 128; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = '#ddeeff'; x.fillRect(0,0,128,128);
    for (var i = 0; i < 600; i++) {
      var v = 220 + Math.floor(Math.random()*35);
      x.fillStyle = 'rgb('+v+','+v+','+v+')';
      x.fillRect(Math.random()*128, Math.random()*128, 2, 2);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40);
    return t;
  }
};
