//Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//Game loop 
let lastTime = 0;

// Player square
let pX = 50;
let pY = 500;
const pSize = 20;
let pVelX = 0;
let pVelY = 0;
let pColor = localStorage.getItem("color") || "teal";
const moveSpeed = 5;
const jumpStrength = 15;
const gravity = 0.8;
let airBorne = false;
let onPlatform = false;
let coyoteTimer = 0;      // Counts down after falling
const COYOTE_FRAMES = 10; // ~10 frames of coyote time
let isJumping = false;
let jumpHoldTime = 0;
const MAX_JUMP_HOLD = 10; // frames of extra lift
const INITIAL_JUMP = -7;
const HOLD_JUMP_BOOST = -0.7;
let landed = 1;
//Change to local storage later
let completedGame = true;

//Trail:
let trailPos = [];
const trailPosMax = 20;
let pTrails = [
  {x: pX, y: pY, size: 15, delay: 5, fade: 0.75,},
  {x: pX, y: pY, size: 10, delay: 10, fade: 0.5,},
  {x: pX, y: pY, size: 5, delay: 15, fade: 0.25,},
];



//Game state (Starting, Paused, Playing)
let deathCount = 0;
let gameState = "Starting"
// Levels
let currentLevel = 1;

// Platforms for each level
const level1Platforms = [
  { x: 50, y: 550, sizeWidth: 50, sizeHeight: 10, name: "p1"},
  { x: 200, y: 500, sizeWidth: 50, sizeHeight: 10, name: "p2" },
  { x: 250, y: 400, sizeWidth: 50, sizeHeight: 10, name: "p3" },
  { x: 150, y: 300, sizeWidth: 50, sizeHeight: 10, name: "p4" },
  { x: 300, y: 200, sizeWidth: 50, sizeHeight: 10, name: "p5" },
  { x: 350, y: 100, sizeWidth: 50, sizeHeight: 10, name: "p6" },
];

const level2Platforms = [
  { x: 50, y: 550, sizeWidth: 50, sizeHeight: 50, name: "c1" },
  { x: 250, y: 500, sizeWidth: 50, sizeHeight: 100, name: "c2" },
  { x: 400, y: 400, sizeWidth: 50, sizeHeight: 200, name: "c3" },
  { x: 400, y: 300, sizeWidth: 50, sizeHeight: 10, name: "p1" },
  { x: 100, y: 300, sizeWidth: 50, sizeHeight: 10, name: "p2" },
  { x: 250, y: 250, sizeWidth: 50, sizeHeight: 10, name: "p3" },
  { x: 50, y: 200, sizeWidth: 50, sizeHeight: 10, name: "p4" },
  { x: 25, y: 100, sizeWidth: 10, sizeHeight: 5, name: "sp5" },
];

const level3Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 10, name: "p1" },
  { x: 200, y: 500, sizeWidth: 20, sizeHeight: 10, name: "p2" },
  { x: 300, y: 400, sizeWidth: 20, sizeHeight: 10, name: "p3" },
  { x: 500, y: 350, sizeWidth: 20, sizeHeight: 10, name: "p4" },
  { x: 450, y: 225, sizeWidth: 20, sizeHeight: 10, name: "p5" },
  { x: 470, y: 100, sizeWidth: 20, sizeHeight: 10, name: "p6" },
];

const level4Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 10,  name: "p1" },
  { x: 0, y: 0 , sizeWidth: 20, sizeHeight: 600, name: "w1" },
  { x: 100, y: 40 , sizeWidth: 20, sizeHeight: 560, name: "w2" },
  { x: 0, y: 0 , sizeWidth: 575, sizeHeight: 10, name: "r2" },
  { x: 200, y: 10 , sizeWidth: 20, sizeHeight: 500, name: "w3" },
  { x: 20, y: 450, sizeWidth: 20, sizeHeight: 10, name: "p3"},
  { x: 80, y: 350, sizeWidth: 20, sizeHeight: 10, name: "p4" },
  { x: 20, y: 250, sizeWidth: 20, sizeHeight: 10, name: "p5" },
  { x: 80, y: 150, sizeWidth: 20, sizeHeight: 10, name: "p6" },
  { x: 120, y: 590, sizeWidth: 20, sizeHeight: 10, name: "p7" },
  { x: 200, y: 590, sizeWidth: 20, sizeHeight: 10, name: "p8" },
  { x: 220, y: 500, sizeWidth: 10, sizeHeight: 10, name: "p9" },
  { x: 220, y: 400, sizeWidth: 10, sizeHeight: 10, name: "p10" },
  { x: 400, y: 400, sizeWidth: 20, sizeHeight: 200, name: "w4" },
  { x: 400, y: 0, sizeWidth: 20, sizeHeight: 250, name: "w5" },
  { x: 420, y: 400, sizeWidth: 20, sizeHeight: 10, name: "p11" },
  { x: 500, y: 300, sizeWidth: 20, sizeHeight: 10, name: "p12" },
  { x: 420, y: 200, sizeWidth: 20, sizeHeight: 10, name: "p13" },
  { x: 580, y: 130, sizeWidth: 20, sizeHeight: 10, name: "p14" },
];

const level5Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 10, name: "p1" },
  { x: 30, y: 450, sizeWidth: 20, sizeHeight: 10, name: "p2" },
  { x: 150, y: 300, sizeWidth: 30, sizeHeight: 10, name: "p3" },
  { x: 180, y: 320, sizeWidth: 30, sizeHeight: 10, name: "p4" },
  //Staircase
  { x: 210, y: 340, sizeWidth: 30, sizeHeight: 10, name: "s1" },
  { x: 240, y: 360, sizeWidth: 30, sizeHeight: 10, name: "s2" },
  { x: 270, y: 380, sizeWidth: 30, sizeHeight: 10, name: "s3" },
  { x: 300, y: 400, sizeWidth: 30, sizeHeight: 10, name: "s4" },
  { x: 330, y: 420, sizeWidth: 30, sizeHeight: 10, name: "s5" },
  { x: 360, y: 440, sizeWidth: 30, sizeHeight: 10, name: "s6" },
  { x: 390, y: 460, sizeWidth: 30, sizeHeight: 10, name: "s7" },
  { x: 420, y: 480, sizeWidth: 30, sizeHeight: 10, name: "s8" },

  { x: 450, y: 550, sizeWidth: 30, sizeHeight: 10, name: "p5" },
  //second staircase
  { x: 250, y: 140, sizeWidth: 30, sizeHeight: 10, name: "s9" },
  { x: 280, y: 160, sizeWidth: 30, sizeHeight: 10, name: "s10" },
  { x: 310, y: 180, sizeWidth: 30, sizeHeight: 10, name: "s11" },
  { x: 340, y: 200, sizeWidth: 30, sizeHeight: 10, name: "s12" },
  { x: 370, y: 220, sizeWidth: 30, sizeHeight: 10, name: "s13" },
  { x: 400, y: 240, sizeWidth: 30, sizeHeight: 10, name: "s14" },
  { x: 430, y: 260, sizeWidth: 30, sizeHeight: 10, name: "s15" },
  { x: 460, y: 280, sizeWidth: 30, sizeHeight: 10, name: "s16" },

  { x: 490, y: 350, sizeWidth: 30, sizeHeight: 10, name: "p6" },
];

const level6Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 50, name: "c1" },
  { x: 230, y: 450, sizeWidth: 20, sizeHeight: 150, name: "c2" },
  { x: 380, y: 450, sizeWidth: 20, sizeHeight: 150, name: "c3" },
  { x: 550, y: 350, sizeWidth: 20, sizeHeight: 250, name: "c4" },
  { x: 570, y: 250, sizeWidth: 20, sizeHeight: 350, name: "c5" },
  { x: 50, y: 0, sizeWidth: 550, sizeHeight: 10, name: "r1" },
  { x: 0, y: 250, sizeWidth: 520, sizeHeight: 10, name: "lp1" },
  { x: 510, y: 130, sizeWidth: 10, sizeHeight: 120, name: "w1" },
  { x: 490, y: 130, sizeWidth: 20, sizeHeight: 10, name: "p1" },
  { x: 510, y: 10, sizeWidth: 10, sizeHeight: 100, name: "w2" },
  { x: 310, y: 50, sizeWidth: 10, sizeHeight: 200, name: "w3" },
  { x: 30, y: 130, sizeWidth: 20, sizeHeight: 10, name: "p2" },
];
const level7Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 10, name: "p1" },
  
]

const lastLevelPlatforms = [
  { x: 0, y: 520, sizeWidth: 600, sizeHeight: 30, name: "b1" },
];

// Keys pressed 
const keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);
enterPressedLastFrame = false;

//Collision detection
function isColliding(pX, pY, pSize, platform) {
  return (
    pX < platform.x + platform.sizeWidth &&
    pX + pSize > platform.x &&
    pY < platform.y + platform.sizeHeight &&
    pY + pSize > platform.y
  );
}

//Pause function
function handlePause() {
  if (keys["Enter"] && !enterPressedLastFrame) {
    if (gameState === "Playing") gameState = "Paused";
    else if (gameState === "Paused") gameState = "Playing";
    else if (gameState === "Starting") gameState = "Playing";
  }
  enterPressedLastFrame = keys["Enter"];
}

// Random
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//Jump function

function handleJump() {
  const jumpPressed = keys["Space"] || keys["ArrowUp"] || keys["KeyW"];

  // Start jump (coyote time check optional)
  if (jumpPressed && (onPlatform || coyoteTimer > 0) ) {
    pVelY = INITIAL_JUMP;
    isJumping = true;
    jumpHoldTime = 0;
  }

  // Continue jump while holding button
  if (isJumping && jumpPressed) {
    if (jumpHoldTime < MAX_JUMP_HOLD) {
      pVelY += HOLD_JUMP_BOOST; // add extra upward lift
      jumpHoldTime ++;
      landed = 1;
    }
  }

  // Release = stop boosting  
  if (!jumpPressed) {
    isJumping = false;
  }
}

//Color picker
function chooseColor() {
  if (keys["Digit1"]) pColor = "teal";
  if (keys["Digit2"]) pColor = "tomato";
  if (keys["Digit3"]) pColor = "deepskyblue";
  if (keys["Digit4"]) pColor = "seagreen";
  if (keys["Digit5"]) pColor = "yellow";
  if (keys["Digit6"] && completedGame) pColor = "purple";
  if (keys["Digit7"] && completedGame) pColor = "gold";
  if (keys["Digit8"] && completedGame) pColor = "white";
  if (keys["Digit9"] && completedGame) pColor = "black";
  if (keys["Digit0"] && completedGame) pColor = "turquoise";
  if (keys["Tab"]) pColor = "indigo";
}

//Trailing function
function handleTrail() {
  trailPos.push({ x: pX, y: pY });
  if (trailPos.length > trailPosMax) {
    trailPos.shift();
  }
  for (let t of pTrails) {
    const index = trailPos.length - t.delay;

    // Only update if we have enough history
    if (index >= 0 && trailPos[index]) {
      t.x = trailPos[index].x;
      t.y = trailPos[index].y;
    }
  }
}

//Particle code
let pParticles = [];
function spawnLandingParticles(x, y, count) {
  pParticles = [];
  for (let i = 0; i < count; i++) {
    const maxLife = 20
    pParticles.push({
      parX: x + getRandomInt(20),
      parY: y + 20,
      size: getRandomInt(5),
      speedX: (Math.random() - 0.5) * 10,  // random spread
      speedY: (Math.random() - 0.5) * 10,
      life: maxLife, // frames to live
      maxLife: maxLife
    });
  }
}

//Death animation
let dParticles = [];
function death(x, y, cooldown) {
  dParticles = [];
  for (let i = 0; i < cooldown; i++) {
    const maxLife = 20
    pVelY = 0;
    dParticles.push({
      parX: x,
      parY: y,
      size: getRandomInt(10) + 5,
      speedX: (Math.random() - 0.5) * 10,  // random spread
      speedY: (Math.random() - 0.5) * 10,
      life: maxLife, // frames to live
      maxLife: maxLife
    });
    deathCount++;
    pX = 50;
    pY = 500;
    pVelY = 0;
    airBorne = true;
  }
  deathCount++;
    pX = 50;
    pY = 500;
    pVelY = 0;
    airBorne = true;
}

//Updater
function update(delta) {
  handlePause();
  if (gameState !== "Playing") return;

  // remove dead particles
  pParticles = pParticles.filter(p => p.life > 0);

  // Horizontal movement
  if (keys["ArrowLeft"] || keys["KeyA"]) pVelX = -moveSpeed;
  else if (keys["ArrowRight"] || keys["KeyD"]) pVelX = moveSpeed;
  else pVelX = 0;

  // Jump
  handleJump();
  handleTrail();

  // Apply gravity
  pVelY += gravity * delta;

  // Apply movement
  pX += pVelX * delta;
  pY += pVelY * delta;

  const platforms = getCurrentPlatforms();

  onPlatform = false; // reset every frame before checking platforms

  // Collision with platforms
  for (let platform of platforms) {
    if (isColliding(pX, pY, pSize, platform)) {
      let overlapX = Math.min(
        pX + pSize - platform.x,
        platform.x + platform.sizeWidth - pX
      );
      let overlapY = Math.min(
        pY + pSize - platform.y,
        platform.y + platform.sizeHeight - pY
      );
  
      if (overlapX < overlapY) {
        // Horizontal collision
        if (pX + pSize / 2 < platform.x + platform.sizeWidth / 2) {
          pX = platform.x - pSize;
        } else {
          pX = platform.x + platform.sizeWidth;
        }
        pVelX = 0;
      } else {
        // Vertical collision
        if (pVelY >= 0 && pY + pSize > platform.y && pY < platform.y) {
          // Land on top
          pY = platform.y - pSize;
          pVelY = 0;
          onPlatform = true;     //landed
          coyoteTimer = COYOTE_FRAMES; //reset coyote time
          if (landed > 0) {
            spawnLandingParticles(pX, pY, 20)
            landed --;
          }
        } else {
          // Hit bottom of platform
          pY = platform.y + platform.sizeHeight;
          pVelY = 0;
        }
      }
    }
  }

  // Update airborne state
  airBorne = !onPlatform;

  //Coyote timer:
  if (!onPlatform) {
    if (coyoteTimer > 0) {
      coyoteTimer--; // countdown after leaving a platform
    }
  }

  //Particles
  for (let particle of pParticles) {
    particle.parX += particle.speedX;
    particle.parY += particle.speedY;
    particle.life--;
  }

  // Death check
  if (pY > canvas.height) {
    death(pX, pY, 60)
  }

  // Switch levels (example: reach top of screen)
  if (pY <= 0) {
    if (currentLevel < 20) {
    currentLevel++;
    pX = 50;
    pY = 500;
    pVelX = 0;
    pVelY = 0;
    }
  }
  
  //color swap (see if they like it)
  if (currentLevel === 1) {
    chooseColor()
  } else localStorage.setItem("color", pColor);
}
//Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Player
  ctx.fillStyle = pColor;
  ctx.fillRect(pX, pY, pSize, pSize);

  for (let t of pTrails) {
    ctx.fillStyle = pColor;
    ctx.globalAlpha = t.fade;
    ctx.fillRect(t.x, t.y, t.size, t.size); 
  }
  ctx.globalAlpha = 1;

  //Platforms
  ctx.fillStyle = "black";
  const platforms = getCurrentPlatforms();  
  for (let platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.sizeWidth, platform.sizeHeight);
  }

  //Debug (delete later)
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.fillText("x: " + pX, 10, 60);
  ctx.fillText("y: " + pY, 10, 80);
  ctx.textAlign = "center";
  for (let p of platforms) {
    ctx.fillText(p.name, p.x + p.sizeWidth /2, p.y + p.sizeHeight /2)
  }

  // Death counter
  ctx.textAlign = "left";
  ctx.fillStyle = "red";
  ctx.font = "20px Arial";
  ctx.fillText("Deaths: " + deathCount, 10, 20);

  // Level indicator
  ctx.fillStyle = "blue";
  ctx.fillText("Level " + currentLevel, 10, 40);
  //level 5 text
  if (currentLevel === 5) {
  ctx.fillStyle = "white";
  ctx.fillText("Bugs as intentional game design. Heck Yeah!", 200, 550);
  }
  //level 7 text
  if (currentLevel === 20) {
  ctx.fillStyle = "white";
  ctx.font = "60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Well Played", 300, 360);
  ctx.font = "20px Arial";
  ctx.fillText("Game by The Wind's Webber", 300, 550);
  }
  //Particle appearances
  for (let particle of pParticles) {
    ctx.fillStyle = "black";
    ctx.globalAlpha = particle.life / particle.maxLife; // fade out
    ctx.fillRect(particle.parX, particle.parY, particle.size, particle.size);
  }
  for (let particle of dParticles) {
    ctx.fillStyle = pColor;
    ctx.globalAlpha = particle.life / particle.maxLife; // fade out
    ctx.fillRect(particle.parX, particle.parY, particle.size, particle.size);
  }
  ctx.globalAlpha = 1;
  
  if (gameState === "Paused") {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
      ctx.textAlign = "center";
    ctx.font = "60px Arial";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press Enter to Resume", canvas.width / 2, canvas.height / 2 + 50);
  }
  if (gameState === "Starting") {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Platformania", canvas.width / 2, canvas.height / 2);
    ctx.font = "30px Arial";
    ctx.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2 + 50);
  }
}

//Level checker

function getCurrentPlatforms() {
  if (currentLevel === 1) return level1Platforms;
  if (currentLevel === 2) return level2Platforms;
  if (currentLevel === 3) return level3Platforms;
  if (currentLevel === 4) return level4Platforms;
  if (currentLevel === 5) return level5Platforms;
  if (currentLevel === 6) return level6Platforms;
  if (currentLevel === 7) return level7Platforms;
  return []; // fallback
}

//Game loop
function gameLoop(timestamp) {
  let delta = (timestamp - lastTime) / 16.67;  
  // delta = 1.0 at 60fps
  // <1 on faster machines, >1 on slower machines

  lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
