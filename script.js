// Automatically play background music when the user interacts with the page (click/touch)
document.addEventListener('click', function() {
    var audio = document.getElementById('bg-music');
    if (audio && audio.paused) {
        audio.play().catch(function(error) {
            console.log("Unable to play audio: ", error);
        });
    }
}, { once: true }); // Run only on the first click

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
 * Floating "i love you" text effect handler & fixed canvas blur issue on resize
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

function Heart() {
  this.x = Math.random() * ww;
  this.y = Math.random() * wh;
  this.opacity = Math.random() * 0.5 + 0.5;
  this.vel = {
    x: (Math.random() - 0.5) * 4,
    y: (Math.random() - 0.5) * 4,
  };
  this.targetScale = Math.random() * 0.15 + 0.02;
  this.scale = this.targetScale * Math.random();
  this.width = 473.8;
  this.height = 408.6;
}

Heart.prototype.update = function () {
  this.x += this.vel.x;
  this.y += this.vel.y;

  this.scale += (this.targetScale - this.scale) * 0.01;
  if (this.x - this.width > ww || this.x + this.width < 0) {
    this.scale = 0;
    this.x = Math.random() * ww;
  }
  if (this.y - this.height > wh || this.y + this.height < 0) {
    this.scale = 0;
    this.y = Math.random() * wh;
  }
};

Heart.prototype.draw = function (i) {
  ctxText.globalAlpha = this.opacity;
  ctxText.font = `${180 * this.scale}px "微软雅黑"`;
  ctxText.fillStyle = colors[i % 18];
  ctxText.fillText(
    "💗i love you💗",
    this.x - this.width * 0.5,
    this.y - this.height * 0.5,
    this.width,
    this.height
  );
};

function initTextCanvas() {
  canvasText.width = ww;
  canvasText.height = wh;
  requestAnimationFrame(renderTextCanvas);
  for (var i = 0; i < 100; i++) {
    hearts.push(new Heart());
  }
}

function renderTextCanvas() {
  ctxText.clearRect(0, 0, ww, wh);
  for (var i = 0; i < hearts.length; i++) {
    hearts[i].update();
    hearts[i].draw(i);
  }
  requestAnimationFrame(renderTextCanvas);
}

initTextCanvas();

// Listen to window resize event to accurately update canvas dimensions and prevent blur
window.addEventListener("resize", function () {
  ww = window.innerWidth;
  wh = window.innerHeight;
  canvasText.width = ww;
  canvasText.height = wh;
});


/*
 * Music playlist modal controller and track selection handler
 */
const musicBtn = document.getElementById("music-btn");
const musicModal = document.getElementById("music-modal");
const closeModal = document.getElementById("close-modal");
const playlistItems = document.querySelectorAll("#playlist li");
const audioPlayer = document.getElementById("bg-music");

// Open music playlist modal when clicking the button
if (musicBtn && musicModal) {
  musicBtn.addEventListener("click", function () {
    musicModal.style.display = "block";
  });
}

// Close music playlist modal when clicking the close (X) button
if (closeModal && musicModal) {
  closeModal.addEventListener("click", function () {
    musicModal.style.display = "none";
  });
}

// Close modal when clicking outside the modal content area
if (musicModal) {
  window.addEventListener("click", function (event) {
    if (event.target == musicModal) {
      musicModal.style.display = "none";
    }
  });
}

// Select and play a track from the playlist
if (playlistItems.length > 0 && audioPlayer) {
  playlistItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const src = this.getAttribute("data-src");
      audioPlayer.src = src;
      audioPlayer.play().catch(function(error) {
          console.log("Unable to play audio: ", error);
      });
      if (musicModal) {
        musicModal.style.display = "none"; // Close modal after selection
      }
    });
  });
}