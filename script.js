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
 * - Press / tap screen to morph text into a 3D heart shape
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

// 3D space configuration
const totalHearts = 260;
const spaceRadius = 900;   // Radius of the 3D space containing floating text
var fov = 480;             // Camera focal length (adjustable with scroll wheel)

// Morph state: true when user presses/holds on the screen to form a heart
var isHeartMode = false;
var pointerDownX = 0;
var pointerDownY = 0;
var movedDistance = 0;

// Camera rotation state controlled by the user
var rotX = 0;              // Pitch angle (up / down)
var rotY = 0;              // Yaw angle (left / right)
var velRotX = 0;           // X-axis rotation inertia velocity
var velRotY = 0.0015;      // Gentle initial drift before user interaction
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// Compute a point on a 3D heart surface/volume
function getHeartPoint3D(scaleFactor) {
  var t = Math.random() * Math.PI * 2;
  // Slight depth variation for 3D volume
  var depthLayer = (Math.random() - 0.5) * 140;

  var hx = 16 * Math.pow(Math.sin(t), 3);
  var hy = -(
    13 * Math.cos(t) -
    5 * Math.cos(2 * t) -
    2 * Math.cos(3 * t) -
    Math.cos(4 * t)
  );

  // Fill slightly inside the heart contour so dense text forms a clear heart shape
  var fill = 0.72 + Math.random() * 0.28;

  return {
    x: hx * scaleFactor * fill,
    y: hy * scaleFactor * fill,
    z: depthLayer * fill
  };
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
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
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

  // Treat a quick press/click (without dragging) as toggling heart formation
  if (movedDistance < 8) {
    toggleHeartMode();
  }
});

// --- Touch drag & tap-to-heart events on mobile devices ---
canvasText.addEventListener("touchstart", function (e) {
  if (e.touches.length === 1) {
    isDragging = true;
    pointerDownX = e.touches[0].clientX;
    pointerDownY = e.touches[0].clientY;
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

function Heart3D() {
  this.initSpacePosition();
  this.x = this.spaceX;
  this.y = this.spaceY;
  this.z = this.spaceZ;
  this.baseSize = Math.random() * 11 + 13;
  this.colorIndex = Math.floor(Math.random() * colors.length);
  this.maxOpacity = Math.random() * 0.3 + 0.7;
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
    var heartScale = Math.min(ww, wh) * 0.022;
    var pt = getHeartPoint3D(heartScale);
    this.targetX = pt.x;
    this.targetY = pt.y;
    this.targetZ = pt.z;
  } else {
    this.initSpacePosition();
    this.targetX = this.spaceX;
    this.targetY = this.spaceY;
    this.targetZ = this.spaceZ;
  }
};

Heart3D.prototype.update = function () {
  if (isHeartMode) {
    // Smoothly morph text positions into the 3D heart shape
    this.x += (this.targetX - this.x) * 0.07;
    this.y += (this.targetY - this.y) * 0.07;
    this.z += (this.targetZ - this.z) * 0.07;
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

    this.x += (this.spaceX - this.x) * 0.05;
    this.y += (this.spaceY - this.y) * 0.05;
    this.z += (this.spaceZ - this.z) * 0.05;
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

  var sizeBoost = isHeartMode ? 0.78 : 1.0;
  var fontSize = Math.max(6, this.baseSize * scale * sizeBoost);

  ctxText.save();
  ctxText.globalAlpha = alpha;
  ctxText.font = `${fontSize}px "微软雅黑", sans-serif`;
  ctxText.fillStyle = colors[this.colorIndex];
  ctxText.textAlign = "center";
  ctxText.textBaseline = "middle";

  if (isHeartMode || scale > 0.75) {
    ctxText.shadowColor = colors[this.colorIndex];
    ctxText.shadowBlur = (isHeartMode ? 10 : 8) * scale;
  }

  ctxText.fillText("💗i love you💗", screenX, screenY);
  ctxText.restore();
};

function initTextCanvas() {
  canvasText.width = ww;
  canvasText.height = wh;
  hearts = [];
  for (var i = 0; i < totalHearts; i++) {
    hearts.push(new Heart3D());
  }
  requestAnimationFrame(renderTextCanvas);
}

function renderTextCanvas() {
  ctxText.clearRect(0, 0, ww, wh);

  // Apply smooth inertia after releasing pointer or touch
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
  if (isHeartMode) {
    for (var i = 0; i < hearts.length; i++) {
      hearts[i].updateTarget();
    }
  }
});
