// Try to autoplay background music immediately, and fallback on first user interaction
function tryPlayMusic() {
    var audio = document.getElementById('bg-music');
    if (audio && audio.paused) {
        audio.play().catch(function(error) {
            console.log("Unable to play audio: ", error);
        });
    }
}

tryPlayMusic();
window.addEventListener('DOMContentLoaded', tryPlayMusic);
window.addEventListener('load', tryPlayMusic);

['click', 'touchstart', 'keydown'].forEach(function(eventName) {
    document.addEventListener(eventName, tryPlayMusic, { once: true });
});

/*
 * RequestAnimationFrame polyfill
 */
(function () {
  var b = 0;
  var c = ["ms", "moz", "webkit", "o"];
  for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
    window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[c[a] + "CancelAnimationFrame"] ||
      window[c[a] + "CancelRequestAnimationFrame"];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (h, e) {
      var d = new Date().getTime();
      var f = Math.max(0, 16 - (d - b));
      var g = window.setTimeout(function () {
        h(d + f);
      }, f);
      b = d + f;
      return g;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (d) {
      clearTimeout(d);
    };
  }
})();

/*
<<<<<<< HEAD
 * [COMMENTED OUT] Hình trái tim to (#pinkboard)
 *
var settings = {
  particles: {
    length: 500,
    duration: 2,
    velocity: 100,
    effect: -0.75,
    size: 30,
  },
};
// ... (Đã thu gọn phần trái tim to)
*/

/*
 * Floating "i love you" 3D Interactive Text Space (Tự xoay 360 độ bằng chuột / cảm ứng)
=======
 * General configuration for the outline heart effect (pinkboard)
 */
/*
var settings = {
  particles: {
    length: 500, // Maximum amount of particles
    duration: 2, // Particle duration in seconds
    velocity: 100, // Particle velocity in pixels/sec
    effect: -0.75, // Motion effect coefficient
    size: 30, // Particle size in pixels
  },
};


var Point = (function () {
  function Point(x, y) {
    this.x = typeof x !== "undefined" ? x : 0;
    this.y = typeof y !== "undefined" ? y : 0;
  }
  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };
  Point.prototype.length = function (length) {
    if (typeof length == "undefined")
      return Math.sqrt(this.x * this.x + this.y * this.y);
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };
  Point.prototype.normalize = function () {
    var length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };
  return Point;
})();

var Particle = (function () {
  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }
  Particle.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  };
  Particle.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };
  Particle.prototype.draw = function (context, image) {
    function ease(t) {
      return --t * t * t + 1;
    }
    var size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  };
  return Particle;
})();


var ParticlePool = (function () {
  var particles,
    firstActive = 0,
    firstFree = 0,
    duration = settings.particles.duration;

  function ParticlePool(length) {
    particles = new Array(length);
    for (var i = 0; i < particles.length; i++)
      particles[i] = new Particle();
  }
  ParticlePool.prototype.add = function (x, y, dx, dy) {
    particles[firstFree].initialize(x, y, dx, dy);
    firstFree++;
    if (firstFree == particles.length) firstFree = 0;
    if (firstActive == firstFree) firstActive++;
    if (firstActive == particles.length) firstActive = 0;
  };
  ParticlePool.prototype.update = function (deltaTime) {
    var i;
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].update(deltaTime);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].update(deltaTime);
      for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
    }
    while (
      particles[firstActive].age >= duration &&
      firstActive != firstFree
    ) {
      firstActive++;
      if (firstActive == particles.length) firstActive = 0;
    }
  };
  ParticlePool.prototype.draw = function (context, image) {
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].draw(context, image);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].draw(context, image);
      for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
    }
  };
  return ParticlePool;
})();

//Main heart effect handler (Pinkboard)
 
(function (canvas) {
  var context = canvas.getContext("2d"),
    particles = new ParticlePool(settings.particles.length),
    particleRate = settings.particles.length / settings.particles.duration,
    time;

  function pointOnHeart(t) {
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25
    );
  }

  var image = (function () {
    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");
    canvas.width = settings.particles.size;
    canvas.height = settings.particles.size;
    function to(t) {
      var point = pointOnHeart(t);
      point.x =
        settings.particles.size / 2 +
        (point.x * settings.particles.size) / 350;
      point.y =
        settings.particles.size / 2 -
        (point.y * settings.particles.size) / 350;
      return point;
    }
    context.beginPath();
    var t = -Math.PI;
    var point = to(t);
    context.moveTo(point.x, point.y);
    while (t < Math.PI) {
      t += 0.01;
      point = to(t);
      context.lineTo(point.x, point.y);
    }
    context.closePath();
    context.fillStyle = "#ea80b0";
    context.fill();
    var image = new Image();
    image.src = canvas.toDataURL();
    return image;
  })();

  function render() {
    requestAnimationFrame(render);
    var newTime = new Date().getTime() / 1000,
      deltaTime = newTime - (time || newTime);
    time = newTime;

    context.clearRect(0, 0, canvas.width, canvas.height);

    var amount = particleRate * deltaTime;
    for (var i = 0; i < amount; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      var dir = pos.clone().length(settings.particles.velocity);
      particles.add(
        canvas.width / 2 + pos.x,
        canvas.height / 2 - pos.y,
        dir.x,
        -dir.y
      );
    }

    particles.update(deltaTime);
    particles.draw(context, image);
  }

  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener("resize", onResize);

  setTimeout(function () {
    onResize();
    render();
  }, 10);
})(document.getElementById("pinkboard"));
*/
/*
 * Floating "i love you" text effect handler - more items, random appearance & half size (+5px font size)
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
 */
const colors = [
  "#eec996", "#8fb7d3", "#b7d4c6", "#c3bedd", "#f1d5e4",
  "#cae1d3", "#f3c89d", "#d0b0c3", "#819d53", "#c99294",
  "#cec884", "#ff8e70", "#e0a111", "#fffdf6", "#cbd7ac",
  "#e8c6c0", "#dc9898", "#ecc8ba"
];

var canvasText = document.getElementById("canvas");
var ctxText = canvasText.getContext("2d");

var ww = window.innerWidth;
var wh = window.innerHeight;
var hearts = [];
<<<<<<< HEAD

// Cấu hình không gian 3D dạng cầu bao quanh người xem
const totalHearts = 240;
const spaceRadius = 900;   // Bán kính vùng không gian 3D chứa các dòng chữ
var fov = 480;             // Tiêu cự camera (có thể zoom bằng con lăn chuột)

// Biến điều khiển góc xoay camera của người dùng
var rotX = 0;              // Góc ngẩng lên / cúi xuống
var rotY = 0;              // Góc quay trái / phải
var velRotX = 0;           // Vận tốc quán tính xoay X
var velRotY = 0.0015;      // Tự trôi rất nhẹ lúc mới mở, sau đó theo tay người dùng
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// --- Sự kiện kéo chuột trên máy tính ---
canvasText.addEventListener("mousedown", function (e) {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  velRotX = 0;
  velRotY = 0;
});

window.addEventListener("mousemove", function (e) {
  if (!isDragging) return;
  var dx = e.clientX - lastMouseX;
  var dy = e.clientY - lastMouseY;

  velRotY = dx * 0.005;
  velRotX = dy * 0.005;
  rotY += velRotY;
  rotX += velRotX;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

window.addEventListener("mouseup", function () {
  isDragging = false;
});

// --- Sự kiện vuốt cảm ứng trên điện thoại ---
canvasText.addEventListener("touchstart", function (e) {
  if (e.touches.length === 1) {
    isDragging = true;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    velRotX = 0;
    velRotY = 0;
  }
}, { passive: false });

window.addEventListener("touchmove", function (e) {
  if (!isDragging || e.touches.length !== 1) return;
  var dx = e.touches[0].clientX - lastMouseX;
  var dy = e.touches[0].clientY - lastMouseY;

  velRotY = dx * 0.006;
  velRotX = dy * 0.006;
  rotY += velRotY;
  rotX += velRotX;

  lastMouseX = e.touches[0].clientX;
  lastMouseY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener("touchend", function () {
  isDragging = false;
});

// --- Lăn chuột để phóng to / thu nhỏ tầm nhìn ---
canvasText.addEventListener("wheel", function (e) {
  e.preventDefault();
  fov -= e.deltaY * 0.3;
  fov = Math.max(220, Math.min(900, fov));
}, { passive: false });

function Heart3D() {
  this.reset();
=======
const totalHearts = 250;

function Heart() {
  this.width = 236.9;
  this.height = 204.3;
  this.reset(true);
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
}

Heart3D.prototype.reset = function () {
  // Phân bố đều chữ trong khối cầu 3D xung quanh tâm để quay hướng nào cũng thấy
  var u = Math.random();
  var v = Math.random();
  var theta = u * 2.0 * Math.PI;
  var phi = Math.acos(2.0 * v - 1.0);
  var r = Math.cbrt(Math.random()) * spaceRadius;

  this.x = r * Math.sin(phi) * Math.cos(theta);
  this.y = r * Math.sin(phi) * Math.sin(theta);
  this.z = r * Math.cos(phi);

  // Tốc độ trôi nhẹ trong không gian
  this.vx = (Math.random() - 0.5) * 0.6;
  this.vy = (Math.random() - 0.5) * 0.6;
  this.vz = (Math.random() - 0.5) * 0.6;

  this.baseSize = Math.random() * 12 + 14;
  this.colorIndex = Math.floor(Math.random() * colors.length);
<<<<<<< HEAD
  this.maxOpacity = Math.random() * 0.35 + 0.65;
=======
  this.vel = {
    x: (Math.random() - 0.5) * 4,
    y: (Math.random() - 0.5) * 4,
  };
  this.targetScale = Math.random() * 0.075 + 0.01;
  this.scale = initial ? this.targetScale * Math.random() : 0.005;
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
};

Heart3D.prototype.update = function () {
  this.x += this.vx;
  this.y += this.vy;
  this.z += this.vz;

<<<<<<< HEAD
  // Giữ chữ luôn nằm gọn trong bán kính không gian 3D
  var dist = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  if (dist > spaceRadius) {
    this.vx = -this.vx;
    this.vy = -this.vy;
    this.vz = -this.vz;
  }
};

Heart3D.prototype.project = function (cosY, sinY, cosX, sinX) {
  // Xoay quanh trục Y (trái/phải)
  var x1 = this.x * cosY - this.z * sinY;
  var z1 = this.z * cosY + this.x * sinY;

  // Xoay quanh trục X (lên/xuống)
  var y2 = this.y * cosX - z1 * sinX;
  var z2 = z1 * cosX + this.y * sinX;

  this.rx = x1;
  this.ry = y2;
  this.rz = z2;
};

Heart3D.prototype.draw = function () {
  // Bỏ qua các chữ nằm phía sau lưng camera
  if (this.rz <= -fov + 40) return;

  var scale = fov / (fov + this.rz);
  var screenX = ww / 2 + this.rx * scale;
  var screenY = wh / 2 + this.ry * scale;

  if (screenX < -250 || screenX > ww + 250 || screenY < -120 || screenY > wh + 120) {
    return;
  }

  // Tính độ rõ nét dựa theo khoảng cách tới mắt người xem
  var depthFactor = (spaceRadius - this.rz) / (spaceRadius * 2);
  var alpha = Math.max(0.15, Math.min(1, depthFactor * 1.3)) * this.maxOpacity;
  var fontSize = Math.max(7, this.baseSize * scale);

=======
  this.scale += (this.targetScale - this.scale) * 0.02;
  if (
    this.x - this.width > ww ||
    this.x + this.width < 0 ||
    this.y - this.height > wh ||
    this.y + this.height < 0
  ) {
    this.reset(false);
  }
};

Heart.prototype.draw = function (i) {
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
  ctxText.save();
  ctxText.globalAlpha = alpha;
  ctxText.font = `${fontSize}px "微软雅黑", sans-serif`;
  ctxText.fillStyle = colors[this.colorIndex];
<<<<<<< HEAD
  ctxText.textAlign = "center";
  ctxText.textBaseline = "middle";

  if (scale > 0.75) {
    ctxText.shadowColor = colors[this.colorIndex];
    ctxText.shadowBlur = 8 * scale;
  }

  ctxText.fillText("💗i love you💗", screenX, screenY);
=======
  ctxText.fillText(
    "💗i love you💗",
    this.x - this.width * 0.5,
    this.y - this.height * 0.5,
    this.width,
    this.height
  );
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
  ctxText.restore();
};

function initTextCanvas() {
  canvasText.width = ww;
  canvasText.height = wh;
  hearts = [];
<<<<<<< HEAD
  for (var i = 0; i < totalHearts; i++) {
    hearts.push(new Heart3D());
=======
  requestAnimationFrame(renderTextCanvas);
  for (var i = 0; i < totalHearts; i++) {
    hearts.push(new Heart());
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
  }
  requestAnimationFrame(renderTextCanvas);
}

function renderTextCanvas() {
  ctxText.clearRect(0, 0, ww, wh);

  // Áp dụng quán tính trượt mượt khi người dùng thả chuột/tay
  if (!isDragging) {
    rotY += velRotY;
    rotX += velRotX;
    velRotY *= 0.94;
    velRotX *= 0.94;
  }

  var cosY = Math.cos(rotY);
  var sinY = Math.sin(rotY);
  var cosX = Math.cos(rotX);
  var sinX = Math.sin(rotX);

  for (var i = 0; i < hearts.length; i++) {
    hearts[i].update();
    hearts[i].project(cosY, sinY, cosX, sinX);
  }

  // Sắp xếp theo chiều sâu sau khi xoay để chữ gần luôn đè lên chữ xa
  hearts.sort(function (a, b) {
    return b.rz - a.rz;
  });

  for (var i = 0; i < hearts.length; i++) {
    hearts[i].draw();
  }

  requestAnimationFrame(renderTextCanvas);
}

initTextCanvas();

window.addEventListener("resize", function () {
  ww = window.innerWidth;
  wh = window.innerHeight;
  canvasText.width = ww;
  canvasText.height = wh;
<<<<<<< HEAD
});
=======
});
>>>>>>> c3a918c0878bd76974f81b59704671c4c474277f
