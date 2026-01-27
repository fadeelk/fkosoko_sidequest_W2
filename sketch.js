// Y-position of the floor (ground level)
let floorY3;

// Player character (soft, animated blob — IN LOVE 💗)
let blob3 = {
  // Position (centre of the blob)
  x: 80,
  y: 0,

  // Visual properties
  r: 26,
  points: 48,
  wobble: 7,
  wobbleFreq: 0.9,

  // Time values for breathing / heartbeat
  t: 0,
  tSpeed: 0.01,

  // Physics: velocity
  vx: 0,
  vy: 0,

  // Movement tuning
  accel: 0.55,
  maxRun: 4.0,
  gravity: 0.65,
  jumpV: -11.0,

  // State
  onGround: false,

  // Friction
  frictionAir: 0.995,
  frictionGround: 0.88,
};

// Platforms
let platforms = [];

// Floating love hearts 💕
let hearts = [];

function setup() {
  createCanvas(640, 360);

  floorY3 = height - 36;

  noStroke();
  textFont("sans-serif");
  textSize(14);

  platforms = [
    { x: 0, y: floorY3, w: width, h: height - floorY3 },
    { x: 120, y: floorY3 - 70, w: 120, h: 12 },
    { x: 300, y: floorY3 - 120, w: 90, h: 12 },
    { x: 440, y: floorY3 - 180, w: 130, h: 12 },
    { x: 520, y: floorY3 - 70, w: 90, h: 12 },
  ];

  blob3.y = floorY3 - blob3.r - 1;
}

function draw() {
  background(240);

  // Draw platforms
  fill(200);
  for (const p of platforms) {
    rect(p.x, p.y, p.w, p.h);
  }

  // Input
  let move = 0;
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) move -= 1;
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) move += 1;
  blob3.vx += blob3.accel * move;

  // Friction + clamp
  blob3.vx *= blob3.onGround ? blob3.frictionGround : blob3.frictionAir;
  blob3.vx = constrain(blob3.vx, -blob3.maxRun, blob3.maxRun);

  // Gravity
  blob3.vy += blob3.gravity;

  // Collision box
  let box = {
    x: blob3.x - blob3.r,
    y: blob3.y - blob3.r,
    w: blob3.r * 2,
    h: blob3.r * 2,
  };

  // Horizontal movement
  box.x += blob3.vx;
  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vx > 0) box.x = s.x - box.w;
      else if (blob3.vx < 0) box.x = s.x + s.w;
      blob3.vx = 0;
    }
  }

  // Vertical movement
  box.y += blob3.vy;
  blob3.onGround = false;

  for (const s of platforms) {
    if (overlap(box, s)) {
      if (blob3.vy > 0) {
        box.y = s.y - box.h;
        blob3.vy = 0;
        blob3.onGround = true;
      } else if (blob3.vy < 0) {
        box.y = s.y + s.h;
        blob3.vy = 0;
      }
    }
  }

  blob3.x = box.x + box.w / 2;
  blob3.y = box.y + box.h / 2;
  blob3.x = constrain(blob3.x, blob3.r, width - blob3.r);

  // Draw blob 💗
  blob3.t += blob3.tSpeed;
  drawBlobCircle(blob3);

  // Spawn floating hearts
  if (random() < 0.02) {
    hearts.push({
      x: blob3.x + random(-10, 10),
      y: blob3.y - blob3.r,
      vy: random(-0.3, -0.6),
      life: 120,
    });
  }

  // Draw hearts
  for (let i = hearts.length - 1; i >= 0; i--) {
    let h = hearts[i];
    fill(255, 120, 160, map(h.life, 0, 120, 0, 180));
    text("♥", h.x, h.y);
    h.y += h.vy;
    h.life--;
    if (h.life <= 0) hearts.splice(i, 1);
  }

  // HUD
  fill(0);
  text("Move: A/D or ←/→  •  Jump: Space/W/↑", 10, 18);
}

// AABB collision check
function overlap(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// Love blob renderer 💕
function drawBlobCircle(b) {
  const pulse = sin(b.t * 2) * 2; // heartbeat

  fill(255, 105, 180); // soft pink

  beginShape();
  for (let i = 0; i < b.points; i++) {
    const a = (i / b.points) * TAU;

    const n = noise(
      cos(a) * b.wobbleFreq + 100,
      sin(a) * b.wobbleFreq + 100,
      b.t,
    );

    const r = b.r + pulse + map(n, 0, 1, -b.wobble * 0.6, b.wobble * 0.6);

    vertex(b.x + cos(a) * r, b.y + sin(a) * r * 0.95);
  }
  endShape(CLOSE);
}

// Jump
function keyPressed() {
  if (
    (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) &&
    blob3.onGround
  ) {
    blob3.vy = blob3.jumpV;
    blob3.onGround = false;
  }
}
