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
 * [COMMENTED OUT] Large heart effect (#pinkboard)
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
// ... (Large heart effect commented out)
*/

/*
 * Floating "i love you" 3D Interactive Text Space
 * - Drag mouse or touch to rotate 360 degrees
 * - Press / tap screen to morph text into a full, overlapping 3D heart
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

// Balanced count for dense heart coverage and smooth frame rate
const totalHearts = 420;
const spaceRadius = 900;   // Radius of the 3D space containing floating text
var fov = 480;             // Camera focal length (adjustable with scroll wheel)

// Morph state: true to display the complete 3D heart by default
var isHeartMode = true;
var movedDistance = 0;

// Camera rotation state controlled by the user
var rotX = 0;              // Pitch angle (up / down)
var rotY = 0;              // Yaw angle (left / right)
var velRotX = 0;           // X-axis rotation inertia velocity
var velRotY = 0.0018;      // Gentle continuous drift for natural 3D depth
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// --- Arc-length parameterized 3D Heart Geometry ---
// Precomputed lookup table for uniform distribution along the parametric heart curve
const TABLE_SIZE = 720;
var heartCurvePts = [];
var cumArcLength = [0];
var totalPerimeter = 0;

(function initArcLengthTable() {
  for (var i = 0; i < TABLE_SIZE; i++) {
    var t = (i * 2 * Math.PI) / TABLE_SIZE;
    var x = 16 * Math.pow(Math.sin(t), 3);
    // Centered vertically around the geometric midpoint (mid-height is 2.54)
    var y = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    ) - 2.54;
    heartCurvePts.push({ x: x, y: y });
  }

  for (var i = 1; i < TABLE_SIZE; i++) {
    var dx = heartCurvePts[i].x - heartCurvePts[i - 1].x;
    var dy = heartCurvePts[i].y - heartCurvePts[i - 1].y;
    cumArcLength.push(cumArcLength[i - 1] + Math.hypot(dx, dy));
  }

  var lastDx = heartCurvePts[0].x - heartCurvePts[TABLE_SIZE - 1].x;
  var lastDy = heartCurvePts[0].y - heartCurvePts[TABLE_SIZE - 1].y;
  totalPerimeter = cumArcLength[TABLE_SIZE - 1] + Math.hypot(lastDx, lastDy);
})();

function getPointOnHeartByArcLength(u) {
  var target = (((u % 1.0) + 1.0) % 1.0) * totalPerimeter;
  var low = 0;
  var high = TABLE_SIZE - 1;
  while (low < high) {
    var mid = (low + high) >> 1;
    if (cumArcLength[mid] < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return heartCurvePts[low];
}

var heartTargetPositions = [];

function updateHeartTargets() {
  heartTargetPositions = [];
  var heartScale = Math.min(ww, wh) * 0.024;

  // Multi-layered nested concentric shell configuration (sums to exactly 420 items)
  // Perfectly balanced between razor-sharp outer contour and full 3D interior volume
  var layers = [
    { scale: 1.00, count: 140, zThick: 15 },
    { scale: 0.85, count: 105, zThick: 45 },
    { scale: 0.68, count: 80,  zThick: 65 },
    { scale: 0.50, count: 55,  zThick: 75 },
    { scale: 0.32, count: 30,  zThick: 60 },
    { scale: 0.16, count: 10,  zThick: 30 }
  ];

  for (var l = 0; l < layers.length; l++) {
    var layer = layers[l];
    var count = layer.count;
    var s = layer.scale;
    var zThick = layer.zThick;
    var offset = (l * 0.237) % 1.0;

    for (var i = 0; i < count; i++) {
      var u = (i + offset) / count;
      var pt = getPointOnHeartByArcLength(u);

      // Alternating front and back placement with volumetric depth
      var side = (i % 2 === 0) ? 1 : -1;
      var z = side * zThick * (0.65 + 0.35 * Math.random());

      // Subtle organic jitter to avoid an artificial wireframe appearance
      var jx = (Math.random() - 0.5) * 0.35;
      var jy = (Math.random() - 0.5) * 0.35;

      heartTargetPositions.push({
        x: (pt.x + jx) * heartScale * s,
        y: (pt.y + jy) * heartScale * s,
        z: z
      });
    }
  }
}

function toggleHeartMode() {
  isHeartMode = !isHeartMode;
  for (var i = 0; i < hearts.length; i++) {
    hearts[i].updateTarget();
  }
}

// --- Mouse drag & press-to-heart events on desktop ---
canvasText.addEventListener("mousedown", function (e) {
  isDragging = true;
  movedDistance = 0;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  velRotX = 0;
  velRotY = 0;
});

window.addEventListener("mousemove", function (e) {
  if (!isDragging) return;
  var dx = e.clientX - lastMouseX;
  var dy = e.clientY - lastMouseY;
  movedDistance += Math.hypot(dx, dy);

  velRotY = dx * 0.005;
  velRotX = dy * 0.005;
  rotY += velRotY;
  rotX += velRotX;

  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

window.addEventListener("mouseup", function () {
  if (!isDragging) return;
  isDragging = false;

  if (movedDistance < 8) {
    toggleHeartMode();
  }
});

// --- Touch drag & tap-to-heart events on mobile devices ---
canvasText.addEventListener("touchstart", function (e) {
  if (e.touches.length === 1) {
    isDragging = true;
    movedDistance = 0;
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
  movedDistance += Math.hypot(dx, dy);

  velRotY = dx * 0.006;
  velRotX = dy * 0.006;
  rotY += velRotY;
  rotX += velRotX;

  lastMouseX = e.touches[0].clientX;
  lastMouseY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener("touchend", function () {
  if (!isDragging) return;
  isDragging = false;

  if (movedDistance < 10) {
    toggleHeartMode();
  }
});

// --- Mouse wheel to zoom in / out ---
canvasText.addEventListener("wheel", function (e) {
  e.preventDefault();
  fov -= e.deltaY * 0.3;
  fov = Math.max(220, Math.min(900, fov));
}, { passive: false });

function Heart3D(index) {
  this.index = index;
  this.initSpacePosition();
  this.x = this.spaceX;
  this.y = this.spaceY;
  this.z = this.spaceZ;
  this.baseSize = Math.random() * 8 + 14;
  this.colorIndex = Math.floor(Math.random() * colors.length);
  this.maxOpacity = Math.random() * 0.2 + 0.8;
  this.updateTarget();
}

Heart3D.prototype.initSpacePosition = function () {
  // Distribute text evenly inside a 3D sphere around the center
  var u = Math.random();
  var v = Math.random();
  var theta = u * 2.0 * Math.PI;
  var phi = Math.acos(2.0 * v - 1.0);
  var r = Math.cbrt(Math.random()) * spaceRadius;

  this.spaceX = r * Math.sin(phi) * Math.cos(theta);
  this.spaceY = r * Math.sin(phi) * Math.sin(theta);
  this.spaceZ = r * Math.cos(phi);

  this.vx = (Math.random() - 0.5) * 0.5;
  this.vy = (Math.random() - 0.5) * 0.5;
  this.vz = (Math.random() - 0.5) * 0.5;
};

Heart3D.prototype.updateTarget = function () {
  if (isHeartMode) {
    if (heartTargetPositions[this.index]) {
      this.targetX = heartTargetPositions[this.index].x;
      this.targetY = heartTargetPositions[this.index].y;
      this.targetZ = heartTargetPositions[this.index].z;
    }
  } else {
    this.initSpacePosition();
    this.targetX = this.spaceX;
    this.targetY = this.spaceY;
    this.targetZ = this.spaceZ;
  }
};

Heart3D.prototype.update = function () {
  if (isHeartMode) {
    // Smooth, snappy morphing into the full heart shape
    this.x += (this.targetX - this.x) * 0.12;
    this.y += (this.targetY - this.y) * 0.12;
    this.z += (this.targetZ - this.z) * 0.12;
  } else {
    // Drift gently in 3D space
    this.spaceX += this.vx;
    this.spaceY += this.vy;
    this.spaceZ += this.vz;

    var dist = Math.sqrt(
      this.spaceX * this.spaceX +
      this.spaceY * this.spaceY +
      this.spaceZ * this.spaceZ
    );
    if (dist > spaceRadius) {
      this.vx = -this.vx;
      this.vy = -this.vy;
      this.vz = -this.vz;
    }

    this.x += (this.spaceX - this.x) * 0.08;
    this.y += (this.spaceY - this.y) * 0.08;
    this.z += (this.spaceZ - this.z) * 0.08;
  }
};

Heart3D.prototype.project = function (cosY, sinY, cosX, sinX) {
  // Rotate around Y axis (left / right)
  var x1 = this.x * cosY - this.z * sinY;
  var z1 = this.z * cosY + this.x * sinY;

  // Rotate around X axis (up / down)
  var y2 = this.y * cosX - z1 * sinX;
  var z2 = z1 * cosX + this.y * sinX;

  this.rx = x1;
  this.ry = y2;
  this.rz = z2;
};

Heart3D.prototype.draw = function () {
  // Skip items behind the camera plane
  if (this.rz <= -fov + 40) return;

  var scale = fov / (fov + this.rz);
  var screenX = ww / 2 + this.rx * scale;
  var screenY = wh / 2 + this.ry * scale;

  if (screenX < -250 || screenX > ww + 250 || screenY < -120 || screenY > wh + 120) {
    return;
  }

  var depthFactor = (spaceRadius - this.rz) / (spaceRadius * 2);
  var alpha = isHeartMode
    ? this.maxOpacity
    : Math.max(0.15, Math.min(1, depthFactor * 1.3)) * this.maxOpacity;

  // Clean, readable font scaling: clear text without overwhelming the silhouette
  var fontSize = isHeartMode
    ? Math.max(9, Math.min(15, this.baseSize * scale * 0.52))
    : Math.max(7, this.baseSize * scale);

  ctxText.save();
  ctxText.globalAlpha = alpha;
  ctxText.font = `${fontSize}px "微软雅黑", sans-serif`;
  ctxText.fillStyle = colors[this.colorIndex];
  ctxText.textAlign = "center";
  ctxText.textBaseline = "middle";

  if (scale > 0.8) {
    ctxText.shadowColor = colors[this.colorIndex];
    ctxText.shadowBlur = isHeartMode ? 3 : 6;
  }

  ctxText.fillText("💗i love you💗", screenX, screenY);
  ctxText.restore();
};

function initTextCanvas() {
  canvasText.width = ww;
  canvasText.height = wh;
  updateHeartTargets();
  hearts = [];
  for (var i = 0; i < totalHearts; i++) {
    hearts.push(new Heart3D(i));
  }
  requestAnimationFrame(renderTextCanvas);
}

function renderTextCanvas() {
  ctxText.clearRect(0, 0, ww, wh);

  // Apply smooth inertia after releasing pointer or touch, plus subtle auto-rotation
  if (!isDragging) {
    rotY += velRotY;
    rotX += velRotX;
    velRotY = (velRotY - 0.0016) * 0.95 + 0.0016;
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

  // Sort back-to-front by depth so closer text renders over farther text
  hearts.sort(function (a, b) {
    return b.rz - a.rz;
  });

  for (var i = 0; i < hearts.length; i++) {
    hearts[i].draw();
  }

  requestAnimationFrame(renderTextCanvas);
}

initTextCanvas();

// Update canvas dimensions on window resize
window.addEventListener("resize", function () {
  ww = window.innerWidth;
  wh = window.innerHeight;
  canvasText.width = ww;
  canvasText.height = wh;
  updateHeartTargets();
  if (isHeartMode) {
    for (var i = 0; i < hearts.length; i++) {
      hearts[i].updateTarget();
    }
  }
});
