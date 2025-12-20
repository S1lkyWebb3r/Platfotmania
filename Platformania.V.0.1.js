//Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//Game loop 
let lastTime = 0;

//Autosplitter
let runActive = false;
let runStartTime = 0;
let runTime = 0;
let speedrunMode = false;

let splits = [];
let lastSplitLevel = null;

function now() {
  return performance.now();
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor(ms % 1000);

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${millis
    .toString()
    .padStart(3, "0")}`;
}


//Music
let audio = false
const music = new Audio("Audio/PlatformerSong.mp3");
music.loop = true;
music.volume = 0.4;

const landingSound = new Audio("Audio/impactWood_medium_003.ogg");
landingSound.volume = 0.2;

window.addEventListener("keydown", () => {
  landingSound.play(); 
  landingSound.pause();
  landingSound.currentTime = 0;
}, { once: true });

// Player square
let pX = 50;
let pY = 500;
let spawnX = 50;
let spawnY = 500;
const pWidth = 20;
let pHeight = 20;
let crouching = false;
const STAND_HEIGHT = 20;
const CROUCH_HEIGHT = 15;
let pVelX = 0;
let friction = 2.5; 
let pVelY = 0;
let pColor = localStorage.getItem("color") || "teal";
let hardcoreMode = (pColor === "darkred");
let hue = 0;
let rainbowObtained = localStorage.getItem("rainbowObtained") === "true";
let rainbowMode = false;
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
const JUMPER_INITIAL_Y = -12;     // stronger than normal jump
const JUMPER_HOLD_BOOST = -0.9;   // stronger hold
const MAX_JUMPER_HOLD = 10;       // frames
let currentJumpType = "normal";
//Change to local storage later
let completedGame = localStorage.getItem("completion") || false;

//Trail:
let trailPos = [];
const trailPosMax = 20;
let pTrails = [
  {x: pX, y: pY, size: 15, delay: 2, fade: 0.75,},
  {x: pX, y: pY, size: 13, delay: 4, fade: 0.65,},
  {x: pX, y: pY, size: 11, delay: 6, fade: 0.55,},
  {x: pX, y: pY, size: 9, delay: 8, fade: 0.45,},
  {x: pX, y: pY, size: 7, delay: 10, fade: 0.35,},
  {x: pX, y: pY, size: 5, delay: 12, fade: 0.25,},
];

//Fps
let fps = 0;
let fpsTimer = 0;
let framesThisSecond = 0;

//Game state (Starting, Paused, Playing)
let deathCount = 0;
let gameState = "Starting"
let deathTimer = 0;
//Activity detection
window.addEventListener("blur", (event) => {
  gameState = "Paused";
}, true);


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
  { x: 40, y: 550, sizeWidth: 30, sizeHeight: 10, name: "p1" },
  { x: 190, y: 500, sizeWidth: 30, sizeHeight: 10, name: "p2" },
  { x: 290, y: 400, sizeWidth: 30, sizeHeight: 10, name: "p3" },
  { x: 490, y: 350, sizeWidth: 30, sizeHeight: 10, name: "p4" },
  { x: 440, y: 225, sizeWidth: 30, sizeHeight: 10, name: "p5" },
  { x: 460, y: 100, sizeWidth: 30, sizeHeight: 10, name: "p6" },
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
  { x: 200, y: 590, sizeWidth: 30, sizeHeight: 10, name: "p8" },
  { x: 220, y: 500, sizeWidth: 10, sizeHeight: 10, name: "p9" },
  { x: 220, y: 400, sizeWidth: 10, sizeHeight: 10, name: "p10" },
  { x: 400, y: 400, sizeWidth: 20, sizeHeight: 200, name: "w4" },
  { x: 400, y: 0, sizeWidth: 20, sizeHeight: 250, name: "w5" },
  { x: 420, y: 400, sizeWidth: 20, sizeHeight: 10, name: "p11" },
  { x: 490, y: 300, sizeWidth: 30, sizeHeight: 10, name: "p12" },
  { x: 420, y: 200, sizeWidth: 20, sizeHeight: 10, name: "p13" },
  { x: 580, y: 130, sizeWidth: 20, sizeHeight: 10, name: "p14" },
];

const level5Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 10, name: "p1" },
  { x: 30, y: 450, sizeWidth: 20, sizeHeight: 10, name: "p2" },
  { x: 50, y: 350, sizeWidth: 20, sizeHeight: 10, name: "p2.5" },
  { x: 150, y: 300, sizeWidth: 30, sizeHeight: 10, name: "s0.3" },

  //Staircase
  { x: 210, y: 340, sizeWidth: 30, sizeHeight: 10, name: "s1" },
  { x: 270, y: 380, sizeWidth: 30, sizeHeight: 10, name: "s3" },
  { x: 330, y: 420, sizeWidth: 30, sizeHeight: 10, name: "s5" },
  { x: 390, y: 460, sizeWidth: 30, sizeHeight: 10, name: "s7" },

  { x: 450, y: 550, sizeWidth: 30, sizeHeight: 10, name: "p5" },
  //second staircase
  { x: 250, y: 140, sizeWidth: 30, sizeHeight: 10, name: "s9" },
  { x: 310, y: 180, sizeWidth: 30, sizeHeight: 10, name: "s11" },
  { x: 370, y: 220, sizeWidth: 30, sizeHeight: 10, name: "s13" },
  { x: 430, y: 260, sizeWidth: 30, sizeHeight: 10, name: "s15" },

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
  { x: 510, y: 10, sizeWidth: 10, sizeHeight: 90, name: "w2" },
  { x: 310, y: 50, sizeWidth: 10, sizeHeight: 200, name: "w3" },
  { x: 30, y: 130, sizeWidth: 20, sizeHeight: 10, name: "p2" },
];

const level7Platforms = [
  { x: 40, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c1" },
  { x: 190, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c2" },
  { x: 340, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c3" },
  { x: 490, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c4" },
  { x: 490, y: 410, sizeWidth: 30, sizeHeight: 10, name: "p5" },
  { x: 340, y: 360, sizeWidth: 30, sizeHeight: 10, name: "p6" },
  { x: 190, y: 360, sizeWidth: 30, sizeHeight: 10, name: "p7" },
  { x: 40, y: 360, sizeWidth: 30, sizeHeight: 10, name: "p8" },
  { x: 40, y: 220, sizeWidth: 30, sizeHeight: 10, name: "p9" },
  { x: 340, y: 200, sizeWidth: 30, sizeHeight: 10, name: "p10" },
  { x: 190, y: 200, sizeWidth: 30, sizeHeight: 10, name: "p11" },
  { x: 490, y: 150, sizeWidth: 30, sizeHeight: 10, name: "p12" },

]

const level8Platforms = [
  { x: 40, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c1" },
  { x: 10, y: 430, sizeWidth: 30, sizeHeight: 170, name: "c2" },
  { x: 0, y: 330, sizeWidth: 10, sizeHeight: 270, name: "c3" }, 
  { x: 230, y: 550, sizeWidth: 70, sizeHeight: 50, name: "c4" }, 
  { x: 430, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c5" }, 
  { x: 570, y: 410, sizeWidth: 30, sizeHeight: 190, name: "c6" },
  { x: 340, y: 380, sizeWidth: 30, sizeHeight: 10, name: "p1" },  
  { x: 520, y: 240, sizeWidth: 30, sizeHeight: 10, name: "p2" },  
  { x: 340, y: 100, sizeWidth: 30, sizeHeight: 10, name: "p3" },
];

const level9Platforms = [
  { x: 0, y: 550, sizeWidth: 600, sizeHeight: 50, name: "p1" },
  { x: 550, y: 450, sizeWidth: 30, sizeHeight: 10, name: "p2"},
  { x: 0, y: 350, sizeWidth: 550, sizeHeight: 10, name: "p3"},
  { x: 580, y: 350, sizeWidth: 20, sizeHeight: 10, name: "p4"},
  { x: 0, y: 225, sizeWidth: 20, sizeHeight: 10, name: "p5"},
  { x: 30, y: 150, sizeWidth: 20, sizeHeight: 10, name: "p6"},
  { x: 50, y: 0, sizeWidth: 550, sizeHeight: 10, name: "r1" },
];

const level10Platforms = [
  { x: 0, y: 0, sizeWidth: 10, sizeHeight: 600, name: "w1" },
  { x: 590, y: 0, sizeWidth: 10, sizeHeight: 600, name: "w1" },
  { x: 0, y: 530, sizeWidth: 600, sizeHeight: 70, name: "b1" },
  { x: 0, y: 430, sizeWidth: 560, sizeHeight: 10, name: "p1" },
  { x: 40, y: 330, sizeWidth: 560, sizeHeight: 10, name: "p2" },
  { x: 0, y: 230, sizeWidth: 560, sizeHeight: 10, name: "p3" },
  { x: 40, y: 130, sizeWidth: 560, sizeHeight: 10, name: "p4" },
  { x: 0, y: 0, sizeWidth: 560, sizeHeight: 10, name: "r1" },
];

const level11Platforms = [
  { x: 50, y: 550, sizeWidth: 50, sizeHeight: 10, name: "p1"},
  { x: 200, y: 500, sizeWidth: 50, sizeHeight: 10, name: "p2" },
  { x: 250, y: 400, sizeWidth: 50, sizeHeight: 10, name: "p3" },
  { x: 150, y: 300, sizeWidth: 50, sizeHeight: 10, name: "p4" },
  { x: 300, y: 200, sizeWidth: 50, sizeHeight: 10, name: "p5" },
  { x: 350, y: 100, sizeWidth: 50, sizeHeight: 10, name: "p6" },
];

const level12Platforms = [
  { x: 40, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c1" },
  { x: 255, y: 0, sizeWidth: 10, sizeHeight: 600, name: "w1" },
  { x: 0, y: 0, sizeWidth: 575, sizeHeight: 10, name: "r2" },
  { x: 340, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c2" },
  { x: 200, y: 450, sizeWidth: 30, sizeHeight: 10, name: "p1" },
  { x: 225, y: 325, sizeWidth: 70, sizeHeight: 10, name: "p2" },
  { x: 150, y: 225, sizeWidth: 30, sizeHeight: 10, name: "p3" },
  { x: 75, y: 125, sizeWidth: 30, sizeHeight: 10, name: "p4" },
  { x: 265, y: 450, sizeWidth: 10, sizeHeight: 10, name: "p5" },
  { x: 375, y: 325, sizeWidth: 30, sizeHeight: 10, name: "p6" },
  { x: 570, y: 325, sizeWidth: 30, sizeHeight: 10, name: "p7" },
  { x: 265, y: 100, sizeWidth: 30, sizeHeight: 10, name: "p8" },
  { x: 370, y: 100, sizeWidth: 30, sizeHeight: 10, name: "p9" },
  { x: 470, y: 100, sizeWidth: 30, sizeHeight: 10, name: "p10" },
  { x: 570, y: 100, sizeWidth: 30, sizeHeight: 10, name: "p11" },
];

const level13Platforms = [
  { x: 275, y: 550, sizeWidth: 50, sizeHeight: 10, name: "p1"},
  { x: 275, y: 450, sizeWidth: 50, sizeHeight: 10, name: "p2"},
  { x: 275, y: 350, sizeWidth: 50, sizeHeight: 10, name: "p3"},
  { x: 275, y: 250, sizeWidth: 50, sizeHeight: 10, name: "p4"},
  { x: 275, y: 150, sizeWidth: 50, sizeHeight: 10, name: "p5"},
  { x: 275, y: 150, sizeWidth: 50, sizeHeight: 10, name: "p6"},
];

const level14Platforms = [
  { x: 50, y: 550, sizeWidth: 20, sizeHeight: 10, name: "p1" },
  { x: 0, y: 0, sizeWidth: 50, sizeHeight: 600, name: "w1" },
  { x: 0, y: 0, sizeWidth: 570, sizeHeight: 10, name: "r1" },
  //first wall
  { x: 50, y: 425, sizeWidth: 10, sizeHeight: 10, name: "p2" },
  { x: 50, y: 300, sizeWidth: 10, sizeHeight: 10, name: "p3" },
  { x: 50, y: 175, sizeWidth: 10, sizeHeight: 10, name: "p4" },
  //Wall on left side
  { x: 100, y: 0, sizeWidth: 10, sizeHeight: 600, name: "w2" },
  { x: 110, y: 550, sizeWidth: 10, sizeHeight: 10, name: "p5" },
  { x: 110, y: 300, sizeWidth: 10, sizeHeight: 10, name: "p8" },
  //Separator
  { x: 250, y: 0, sizeWidth: 10, sizeHeight: 600, name: "w3" },
  //Wall on right side
  { x: 400, y: 30, sizeWidth: 10, sizeHeight: 570, name: "w4" },
  { x: 390, y: 175, sizeWidth: 10, sizeHeight: 10, name: "p6" },
  { x: 390, y: 425, sizeWidth: 10, sizeHeight: 10, name: "p7" },
];

const level15Platforms = [
  { x: 40, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c1" },
  { x: 0, y: 100, sizeWidth: 600, sizeHeight: 5, name: "r1" },
];

const level16Platforms = [
  { x: 0, y: 0, sizeWidth: 10, sizeHeight: 600, name: "w1" },
  { x: 0, y: 0, sizeWidth: 440, sizeHeight: 10, name: "r1" },
  { x: 470, y: 0, sizeWidth: 130, sizeHeight: 10, name: "r2" },
];

const level17Platforms = [
  { x: 40, y: 550, sizeWidth: 30, sizeHeight: 50, name: "c1" },
  { x: 130, y: 450, sizeWidth: 30, sizeHeight: 10, name: "p1"},
  { x: 200, y: 550, sizeWidth: 30, sizeHeight: 10, name: "p2"},
  { x: 270, y: 450, sizeWidth: 30, sizeHeight: 10, name: "p3"},
  { x: 410, y: 570, sizeWidth: 30, sizeHeight: 10, name: "p4"},
  { x: 450, y: 450, sizeWidth: 30, sizeHeight: 10, name: "p5"},
  { x: 360, y: 365, sizeWidth: 30, sizeHeight: 10, name: "p6"},
  { x: 425, y: 225, sizeWidth: 30, sizeHeight: 10, name: "p7"},
  { x: 325, y: 140, sizeWidth: 50, sizeHeight: 10, name: "kaizo1"},
  { x: 250, y: 225, sizeWidth: 30, sizeHeight: 10, name: "p8"},
  { x: 125, y: 140, sizeWidth: 65, sizeHeight: 10, name: "kaizo2"},
  { x: 90, y: 225, sizeWidth: 30, sizeHeight: 10, name: "p9"},
];

const level18Platforms = [
  { x: 40, y: 550, sizeWidth: 60, sizeHeight: 50, name: "c1" },
  { x: 150, y: 350, sizeWidth: 10, sizeHeight: 250, name: "c2" },
  { x: 300, y: 350, sizeWidth: 10, sizeHeight: 250, name: "c3" },
  { x: 500, y: 570, sizeWidth: 25, sizeHeight: 30, name: "c4" },
  { x: 120, y: 200, sizeWidth: 30, sizeHeight: 30, name: "p1" },
  { x: 0, y: 0, sizeWidth: 560, sizeHeight: 10, name: "r1" },
  { x: 170, y: 0, sizeWidth: 10, sizeHeight: 200, name: "w1" },
  { x: 495, y: 0, sizeWidth: 5, sizeHeight: 300, name: "w2" },
  { x: 495, y: 300, sizeWidth: 105, sizeHeight: 10, name: "p2" },
];

const level19Platforms = [
 { x: 0, y: 550, sizeWidth: 150, sizeHeight: 50, name: "p1" },
];
const level1925Platforms = [
 { x: 0, y: 550, sizeWidth: 150, sizeHeight: 50, name: "p1" },
];

const level195Platforms = [
 { x: 0, y: 550, sizeWidth: 150, sizeHeight: 50, name: "p1" },
];
const level1975Platforms = [
 { x: 0, y: 550, sizeWidth: 150, sizeHeight: 50, name: "p1" },
];

const lastLevelPlatforms = [
  { x: 0, y: 520, sizeWidth: 600, sizeHeight: 80, name: "b1" },
];

let objects = [
  //Testing
  {x: 250, y: 550, sizeWidth: 10, sizeHeight: 10, type: "enemy", color: "red", level: 0},
  {x: 100, y: 100, sizeWidth: 10, sizeHeight: 10, type: "switch", color: "blue", level: 0},
  {x: 200, y: 200, sizeWidth: 10, sizeHeight: 10, type: "door", color: "green", level: 0, open: false},
  {x: 270, y: 380, speedX: 0, speedY: 2, interval: 40, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 0, dir: 1, tick: 0},
  {x: 280, y: 430, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "mediumblue", level: 0, landX: 300, landY: 200},
  {x: 300, y: 200, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumblue", level: 0},
  {x: 280, y: 430, sizeWidth: 20, sizeHeight: 20, type:  "invTeleporter", color: "mediumspringgreen", level: 0, landX: 400, landY: 400},
  {x: 225, y: 490, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 0, accelX: -30, },

  //Level 5
  //first staircase
  {x: 180, y: 320, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 240, y: 360, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 300, y: 400, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 360, y: 440, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 420, y: 480, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  //second staircase
  {x: 280, y: 160, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 340, y: 200, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 400, y: 240, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},
  {x: 460, y: 280, sizeWidth: 30, sizeHeight: 10, type: "enemy", color: "red", level: 5},

  //Level 7
  {x: 100, y: 450, sizeWidth: 40, sizeHeight: 150, type: "enemy", color: "red", level: 7},
  {x: 250, y: 450, sizeWidth: 40, sizeHeight: 150, type: "enemy", color: "red", level: 7},
  {x: 400, y: 450, sizeWidth: 40, sizeHeight: 150, type: "enemy", color: "red", level: 7},
  //second row
  {x: 100, y: 100, sizeWidth: 40, sizeHeight: 130, type: "enemy", color: "red", level: 7},
  {x: 250, y: 100, sizeWidth: 40, sizeHeight: 130, type: "enemy", color: "red", level: 7},
  {x: 400, y: 100, sizeWidth: 40, sizeHeight: 130, type: "enemy", color: "red", level: 7},

  //Level 8
  //First jump
  {x: 120, y: 200, sizeWidth: 10, sizeHeight: 450, type: "enemy", color: "red", level: 8},
  {x: 180, y: 290, sizeWidth: 10, sizeHeight: 350, type: "enemy", color: "red", level: 8},
  //Second jump
  {x: 340, y: 520, sizeWidth: 10, sizeHeight: 140, type: "enemy", color: "red", level: 8},
  //Third Jump
  {x: 490, y: 470, sizeWidth: 10, sizeHeight: 190, type: "enemy", color: "red", level: 8},
  //Walls
  {x: 330, y: 0, sizeWidth: 10, sizeHeight: 390, type: "enemy", color: "red", level: 8},
  {x: 550, y: 0, sizeWidth: 10, sizeHeight: 250, type: "enemy", color: "red", level: 8},

  //Level 9
  {x: 25, y: 450, sizeWidth: 15, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 70, y: 450, sizeWidth: 105, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 25, y: 225, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 25, y: 0, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},

  {x: 225, y: 450, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 225, y: 225, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 225, y: 0, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},

  {x: 425, y: 450, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 425, y: 225, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  {x: 425, y: 0, sizeWidth: 150, sizeHeight: 150, type: "enemy", color: "red", level: 17},
  //Checkpoint
  {x: 280, y: 430, sizeWidth: 10, sizeHeight: 10, type:  "checkpoint", color: "green", level: 17, spawnX: 275, spawnY: 430},
  {x: 380, y: 345, sizeWidth: 10, sizeHeight: 10, type:  "checkpoint", color: "green", level: 17, spawnX: 375, spawnY: 345},
  //Rainbow 
  {x: 100, y: 205, sizeWidth: 10, sizeHeight: 10, type:  "rainbow", color: "fuchsia", level: 17},

  //Level 10
  {spawnX: 0, spawnY: 450, x: 0, y: 450, speedX: 5, speedY: 0, interval: 110, inInterval: 110, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 9, dir: 1, inDir: 1, tick: 0},
  {spawnX: 550, spawnY: 500, x: 550, y: 500, speedX: 5, speedY: 0, interval: 116, inInterval: 116, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 9, dir: -1, inDir: -1, tick: 0},
  {spawnX: 0, spawnY: 10, x: 0, y: 10, speedX: 5, speedY: 5, interval: 35, inInterval: 35, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 9, dir: 1, inDir: 1, tick: 0},
  {spawnX: 0, spawnY: 300, x: 0, y: 300, speedX: 5, speedY: -5, interval: 35, inInterval: 35, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 9, dir: 1, inDir: 1, tick: 0},
  {spawnX: 450, spawnY: 10, x: 450, y: 10, speedX: -5, speedY: 5, interval: 35, inInterval: 35, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 9, dir: 1, inDir: 1, tick: 0},
  {spawnX: 450, spawnY: 300, x: 450, y: 300, speedX: -5, speedY: -5, interval: 35, inInterval: 35, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 9, dir: 1, inDir: 1, tick: 0},

  //Level 11 
  {spawnX: -300, spawnY: 0, x: -300, y: 0, speedX: 2, speedY: 0, interval: 150, inInterval: 150, sizeWidth: 300, sizeHeight: 600, type: "mEnemy", color: "red", level: 11, dir: 1, inDir: 1, tick: 0},
  {spawnX: 300, spawnY: 0, x: 300, y: 0, speedX: 2, speedY: 0, interval: 150, inInterval: 150, sizeWidth: 300, sizeHeight: 600, type: "mEnemy", color: "red", level: 11, dir: 1, inDir: 1, tick: 0},

  //Level 12
  {x: 40, y: 50, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 12, landX: 345, landY: 500},
  {x: 345, y: 500, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 12},
  {spawnX: 0, spawnY: 600, x: 0, y: 600, speedX: 0, speedY: 0.5, interval: 1200, inInterval: 1200, sizeWidth: 600, sizeHeight: 10, type: "mEnemy", color: "red", level: 12, dir: -1, inDir: -1, tick: 0},
  {x: 570, y: 200, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "mediumblue", level: 12, landX: 265, landY: 10},
  {x: 265, y: 10, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumblue", level: 12},

  //Level 13
  {x: 50, y: 570, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 13, landX: 290, landY: 530},
  {x: 290, y: 530, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 13},
  {spawnX: -300, spawnY: 0, x: -300, y: 0, speedX: 1.5, speedY: 0, interval: 200, inInterval: 200, sizeWidth: 300, sizeHeight: 600, type: "mEnemy", color: "red", level: 13, dir: 1, inDir: 1, tick: 0},
  {spawnX: 600, spawnY: 0, x: 600, y: 0, speedX: 1.5, speedY: 0, interval: 200, inInterval: 200, sizeWidth: 300, sizeHeight: 600, type: "mEnemy", color: "red", level: 13, dir: -1, inDir: -1, tick: 0},

  //Level 14
  {x: 50, y: 10, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 14, landX: 165, landY: 525},
  {x: 165, y: 525, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 14},
  {x: 165, y: 425, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "mediumblue", level: 14, landX: 315, landY: 425},
  {x: 315, y: 425, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumblue", level: 14},
  {x: 315, y: 325, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 14, landX: 165, landY: 325},
  {x: 165, y: 325, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 14},
  {x: 165, y: 225, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "mediumblue", level: 14, landX: 315, landY: 225},
  {x: 315, y: 225, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumblue", level: 14},
  //moving enemy
  {spawnX: 0, spawnY: 550, x: 0, y: 550, speedX: 3, speedY: 0, interval: 200, inInterval: 200, sizeWidth: 50, sizeHeight: 10, type: "mEnemy", color: "red", level: 14, dir: 1, inDir: 1, tick: 0},
  {spawnX: 550, spawnY: 425, x: 0, y: 425, speedX: -3, speedY: 0, interval: 200, inInterval: 200, sizeWidth: 50, sizeHeight: 10, type: "mEnemy", color: "red", level: 14, dir: 1, inDir: 1, tick: 0},
  {spawnX: 0, spawnY: 300, x: 0, y: 300, speedX: 3, speedY: 0, interval: 200, inInterval: 200, sizeWidth: 50, sizeHeight: 10, type: "mEnemy", color: "red", level: 14, dir: 1, inDir: 1, tick: 0},
  {spawnX: 550, spawnY: 175, x: 0, y: 175, speedX: -3, speedY: 0, interval: 200, inInterval: 200, sizeWidth: 50, sizeHeight: 10, type: "mEnemy", color: "red", level: 14, dir: 1, inDir: 1, tick: 0},
  {x: 410, y: 570, sizeWidth: 20, sizeHeight: 20, type:  "invTeleporter", color: "mediumspringgreen", level: 14, landX: 580, landY: 500},
  {x: 580, y: 500, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumspringgreen", level: 14},

  //Level 15
  {x: 50, y: 400, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 15, landX: 50, landY: 250},
  {x: 50, y: 250, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 15},
  {x: 80, y: 400, sizeWidth: 20, sizeHeight: 20, type:  "invTeleporter", color: "mediumspringgreen", level: 15, landX: 80, landY: 250},
  {x: 80, y: 250, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumspringgreen", level: 15},

  //Level 16
  {x: 50, y: 520, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 16, accelX: -30, },
  {x: 10, y: 450, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 16, accelX: 0, },
  {x: 10, y: 300, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 16, accelX: 0, },
  {x: 10, y: 150, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 16, accelX: 0, },
  {x: 10, y: 10, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 16, landX: 145, landY: 300},
  {x: 145, y: 300, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 16},
  {x: 250, y: 550, sizeWidth: 20, sizeHeight: 20, type:  "invTeleporter", color: "mediumspringgreen", level: 16, landX: 450, landY: 250},
  {x: 450, y: 250, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumspringgreen", level: 16},

  //Level 17
  {spawnX: 350, spawnY: 600, x: 350, y: 600, speedX: 0, speedY: -4, interval: 150, inInterval: 150, sizeWidth: 250, sizeHeight: 10, type: "mEnemy", color: "red", level: 10, dir: 1, inDir: 1, tick: 0},
  {spawnX: 0, spawnY: 0, x: 0, y: 0, speedX: 0, speedY: 4, interval: 150, inInterval: 150, sizeWidth: 250, sizeHeight: 10, type: "mEnemy", color: "red", level: 10, dir: 1, inDir: 1, tick: 0},
  {spawnX: 600, spawnY: 600, x: 600, y: 600, speedX: -2, speedY: -2, interval: 300, inInterval: 300, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 10, dir: 1, inDir: 1, tick: 0},
  {spawnX: 0, spawnY: 600, x: 0, y: 600, speedX: 1.8, speedY: -2, interval: 300, inInterval: 300, sizeWidth: 50, sizeHeight: 50, type: "mEnemy", color: "red", level: 10, dir: 1, inDir: 1, tick: 0},

  //Level 18
  //Jumpers
  {x: 75, y: 540, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 18, accelX: 0, },
  {x: 500, y: 560, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 18, accelX: 0, },
  {x: 150, y: 205, sizeWidth: 10, sizeHeight: 25, type: "jumper", color: "brown", level: 18, accelX: 60, },
  {x: 575, y: 150, sizeWidth: 25, sizeHeight: 10, type: "jumper", color: "brown", level: 18, accelX: 0, },
  //Portals
  {x: 160, y: 580, sizeWidth: 20, sizeHeight: 20, type:  "invTeleporter", color: "mediumspringgreen", level: 18, landX: 250, landY: 550},
  {x: 250, y: 550, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumspringgreen", level: 18},
  {x: 350, y: 300, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "orange", level: 18, landX: 380, landY: 570},
  {x: 380, y: 570, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "orange", level: 18},
  {x: 580, y: 310, sizeWidth: 20, sizeHeight: 20, type:  "teleporter", color: "mediumblue", level: 18, landX: 0, landY: 10},
  {x: 0, y: 10, sizeWidth: 20, sizeHeight: 20, type:  "exit", color: "mediumblue", level: 18},
  //Enemies
  {x: 150, y: 270, sizeWidth: 30, sizeHeight: 30, type: "enemy", color: "red", level: 18},
  {x: 250, y: 400, sizeWidth: 30, sizeHeight: 30, type: "enemy", color: "red", level: 18},
  {x: 220, y: 350, sizeWidth: 30, sizeHeight: 30, type: "enemy", color: "red", level: 18},
  {x: 190, y: 300, sizeWidth: 30, sizeHeight: 30, type: "enemy", color: "red", level: 18},
  {x: 450, y: 300, sizeWidth: 30, sizeHeight: 30, type: "enemy", color: "red", level: 18},
  {x: 400, y: 350, sizeWidth: 30, sizeHeight: 30, type: "enemy", color: "red", level: 18},
];

// Keys pressed 
const keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);
let enterPressedLastFrame = false;
let lWasPressed = false;

//joycon support:
let joycon = null;  

window.addEventListener("gamepadconnected", (e) => {
    joycon = navigator.getGamepads()[e.gamepad.index];
    console.log("Joy-Con connected:", joycon.id);
});

window.addEventListener("gamepaddisconnected", () => {
    joycon = null;
});

function getGamepadByIndex(index) {
    return navigator.getGamepads
        ? [...navigator.getGamepads()].filter(g => g && g.index === index)[0]
        : null;
}


// Read Joy-Con state each frame
function readJoyConInput() {
    if (!joycon) return;

    joycon = getGamepadByIndex(joycon.index);
    if (!joycon) return;

    // Left stick horizontal (Joy-Con)
    const stickX = joycon.axes[0];  // -1 = left, +1 = right

    // A button (jump)
    const btnA = joycon.buttons[0].pressed;

    // Convert stick input into your movement variables
    if (stickX < -0.3) {
        keys["JOY_LEFT"] = true;
        keys["JOY_RIGHT"] = false;
    } else if (stickX > 0.3) {
        keys["JOY_RIGHT"] = true;
        keys["JOY_LEFT"] = false;
    } else {
        keys["JOY_LEFT"] = false;
        keys["JOY_RIGHT"] = false;
    }

    // Jump button
    keys["JOY_JUMP"] = btnA;
}


//Collision detection
function aabb(aX, aY, aW, aH, bX, bY, bW, bH) {
  return (
    aX < bX + bW &&
    aX + aW > bX &&
    aY < bY + bH &&
    aY + aH > bY
  );
}

//Pause function
function handlePause() {
  if (keys["Enter"] && !enterPressedLastFrame) {
    if (gameState === "Playing") gameState = "Paused";
    else if (gameState === "Paused") gameState = "Playing";
    else if (gameState === "Starting"){
      if (audio)music.play();
      gameState = "Playing";
      if (speedrunMode) {
      runActive = true;
      runStartTime = now();
      runTime = 0;
      splits = [];
      lastSplitLevel = currentLevel;
      }
    }
  }
  enterPressedLastFrame = keys["Enter"];
}

// Random
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function handleJump() {
  const jumpPressed = keys["Space"] || keys["ArrowUp"] || keys["KeyW"] || keys["JOY_JUMP"];

  // Start jump
  if (jumpPressed && (onPlatform || coyoteTimer > 0)) {
    pVelY = INITIAL_JUMP;
    isJumping = true;
    jumpHoldTime = 0;
    landed = 1;
    currentJumpType = "normal";
  }


  if (isJumping && jumpPressed) {
    const maxHold = currentJumpType === "jumper"
      ? MAX_JUMPER_HOLD
      : MAX_JUMP_HOLD;

    const holdForce = currentJumpType === "jumper"
      ? JUMPER_HOLD_BOOST
      : HOLD_JUMP_BOOST;

    if (jumpHoldTime < maxHold) {
      pVelY += holdForce;
      jumpHoldTime++;
    }
  }


  // Stop giving jump boost when player releases jump
  if (!jumpPressed) {
    isJumping = false;
  }
}

//Crouch helper: 
function canStandUp(platforms) {
  for (let p of platforms) {
    if (aabb(pX, pY - (STAND_HEIGHT - CROUCH_HEIGHT), pWidth, STAND_HEIGHT, p.x, p.y, p.sizeWidth, p.sizeHeight)) {
      return false;
    }
  }
  return true;
}


//Color picker
function chooseColor() {
  if (keys["Digit1"]) pColor = "teal";
  if (keys["Digit2"]) pColor = "tomato";
  if (keys["Digit3"]) pColor = "darkblue";
  if (keys["Digit4"]) pColor = "seagreen";
  if (keys["Digit5"]) pColor = "yellow";
  if (keys["Digit6"] && completedGame) pColor = "purple";
  if (keys["Digit7"] && completedGame) pColor = "fuchsia";
  if (keys["Digit8"] && completedGame) pColor = "white";
  if (keys["Digit9"] && completedGame) pColor = "black";
  if (keys["Digit0"] && completedGame) pColor = "darkseagreen";
  if (keys["KeyP"]) pColor = "indigo";
  if (keys["KeyH"]&& completedGame){ 
    pColor = "darkred"
    hardcoreMode = true;
  };
  if (pColor !== "darkred" && hardcoreMode) hardcoreMode = false;
  if (keys["KeyR"] && rainbowObtained) {
  rainbowMode = true;
} else if (
  keys["Digit1"] || keys["Digit2"] || keys["Digit3"] ||
  keys["Digit4"] || keys["Digit5"] || keys["Digit6"] ||
  keys["Digit7"] || keys["Digit8"] || keys["Digit9"] ||
  keys["Digit0"] || keys["KeyP"] || keys["KeyH"]
) {
  rainbowMode = false;
}

}

//level changer
function chooseLevel() {
  if (completedGame) {
  if (gameState === "Starting") {
    if (keys["KeyL"] && !lWasPressed) {
      if (currentLevel === 19) {
        currentLevel = 19.25;
      } else if (currentLevel === 19.25) {
        currentLevel = 19.5;
      } else if (currentLevel === 19.5) {
        currentLevel = 19.75;
      } else if (currentLevel === 19.75) {
        currentLevel = 20;
      } else {
        currentLevel++;
      }
  
      lWasPressed = true;
    }

    if (!keys["KeyL"]) {
      lWasPressed = false;
    }

    if (currentLevel > 20){ 
      currentLevel = 1;
      SpawnX = 50;
      spawnY = 500;
      pX = spawnX;
      pY = spawnY;
      pVelX = 0;
      pVelY = 0;
      for(let o of objects){
        if (o.type === "mEnemy" && o.spawnX && o.spawnY){
          o.x = o.spawnX;
          o.y = o.spawnY;
          o.interval = o.inInterval;
          o.tick = 0;
          o.dir = o.inDir;
        }
      }
    }
    }
  }
}

//Speedrun starter
function startRun() {
  if (gameState === "Starting" && keys["KeyS"] || gameState === "Paused" && keys["Key S"] && currentLevel === 1) {
    speedrunMode = true;
  }
}


//Splitter
function split(level) {
  splits.push({
    level,
    time: runTime
  });
  lastSplitLevel = level;
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
      t.x = trailPos[index].x + (pWidth - t.size) / 2;
      t.y = trailPos[index].y + (pHeight - t.size) / 2;
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
function death(x, y, count, delta) {
  dParticles = [];
  for (let i = 0; i < count; i++) {
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
  }
  if (hardcoreMode){
    deathCount = 0;
    spawnX = 50;
    spawnY = 500;
    gameState = "Dead";
    deathTimer = 30 * delta;
    //Reset run
    runActive = false;
    splits = []; 
  } else {
  gameState = "Dead";
  deathTimer = 30 * delta;
  }
}

function handleObject(o, delta) {
  if (o.level !== currentLevel) return;
  // Enemy
  if (o.type === "enemy") {
    death(pX, pY, 60, delta);
    return;
  };
  if (o.type === "mEnemy") {
    death(pX, pY, 60, delta);
    return;
  };

  //Checkpoint
  if (o.type === "checkpoint"){
    spawnX = o.spawnX;
    spawnY = o.spawnY;
    o.color = pColor;
    return;
  };

  //Teleportal
  if (o.type === "teleporter"){
    pX = o.landX; 
    pY = o.landY;
    return;
  };

  //Inverse Teleportal
  if (o.type === "invTeleporter"){
    pX = o.landX; 
    pY = o.landY;
    pVelX *= -1;
    pVelY *= -1;
    return;
  }

  if (o.type === "jumper") {
    if (acceleratedThisFrame) return;
    acceleratedThisFrame = true;

  // Reset vertical motion so the jump feels punchy
    if (pVelY > 0) pVelY = 0;

    // Apply launch
    pVelY = JUMPER_INITIAL_Y;
    pVelX = o.accelX; // directional push (can be 0)

    isJumping = true;
    jumpHoldTime = 0;
    currentJumpType = "jumper";

    onPlatform = false;
    coyoteTimer = 0;

    return;
  }


  //Exit
  if (o.type === "exit"){
    return;
  };

  //Rainbow
  if (o.type === "rainbow"){
    localStorage.setItem("rainbowObtained", "true");
    rainbowObtained = true;
    return;
  }
}

//Updater
function update(delta) {
  readJoyConInput();

  if (gameState === "Dead") {
    // Update particles only
    dParticles = dParticles.filter(d => d.life > 0);
    for (let d of dParticles) {
      d.parX += d.speedX;
      d.parY += d.speedY;
      d.life--;
    }
  
    deathTimer--;
  
    // Respawn when timer ends
    if (deathTimer <= 0 && hardcoreMode) {
      pX = 50;
      pY = 500;
      spawnX = 50;
      spawnY = 500;
      deathCount = 0;
      pVelX = 0;
      pVelY = 0;
      currentLevel = 1;
      for(let o of objects){
        if (o.type === "mEnemy"){
          o.x = o.spawnX;
          o.y = o.spawnY;
          o.interval = o.inInterval;
          o.tick = 0;
          o.dir = o.inDir;
        }
      }
      
      if (speedrunMode) {
      runActive = true;
      runStartTime = now();
      runTime = 0;
      splits = [];
      lastSplitLevel = currentLevel;
      }

    } else if (deathTimer <= 0) {
      pX = spawnX;
      pY = spawnY;
      deathCount++;
      pVelX = 0;
      pVelY = 0;
      for(let o of objects){
        if (o.type === "mEnemy"){
          o.x = o.spawnX;
          o.y = o.spawnY;
          o.interval = o.inInterval;
          o.tick = 0;
          o.dir = o.inDir;
        }
      }
      gameState = "Playing";
    }
  }

  chooseLevel();
  startRun();
  handlePause();

  if (gameState !== "Playing") return;

  if (runActive && gameState === "Playing") {
    runTime = now() - runStartTime;
  }


  // remove dead particles
  pParticles = pParticles.filter(p => p.life > 0);

  const platforms = getCurrentPlatforms();

  // Horizontal movement
  if (keys["ArrowLeft"] && !crouching || keys["KeyA"] && !crouching || keys["JOY_LEFT"] && !crouching) pVelX = -moveSpeed;
  else if (keys["ArrowRight"] && !crouching || keys["KeyD"] && !crouching || keys["JOY_RIGHT"] && !crouching) pVelX = moveSpeed;
  else if (pVelX > 0) pVelX -= friction * delta;
  else if (pVelX < 0) pVelX += friction * delta;

  if (keys["ArrowDown"] || keys["KeyS"]) {
    if (!crouching) {
        // entering crouch → shrink from the top
        pY += STAND_HEIGHT - CROUCH_HEIGHT;
        pHeight = CROUCH_HEIGHT;
        crouching = true;
    }
  } else {
    if (crouching && canStandUp(platforms)) {
      // leaving crouch → grow upward, NOT downward
      pY -= STAND_HEIGHT - CROUCH_HEIGHT;
      pHeight = STAND_HEIGHT;
      crouching = false;
    }
  }

  // Jump
  handleJump();
  handleTrail();

  // Keep player inside canvas
  if (pX < 0) pX = 0;
  if (pX + pWidth > canvas.width) pX = canvas.width - pWidth;

  onPlatform = false; // reset every frame before checking platforms
  acceleratedThisFrame = false;


  //Enemy movement
  for (let o of objects) {
  if (o.type === "mEnemy" && o.level === currentLevel) {

    // Move enemy
    o.x += o.speedX * o.dir;
    o.y += o.speedY * o.dir;

    // Count steps
    o.tick++;

    // Flip after interval steps
    if (o.tick >= o.interval) {
      o.dir *= -1;     // reverse direction
      o.tick = 0;      // reset counter
    }
  }
}


  // ---- Horizontal Movement ----
pX += pVelX * delta;

for (let platform of platforms) {
  if (aabb(pX, pY, pWidth, pHeight, platform.x, platform.y, platform.sizeWidth, platform.sizeHeight)) {

    // Moving right: hit left side
    if (pVelX > 0) {
      pX = platform.x - pWidth;
    }
    // Moving left: hit right side
    else if (pVelX < 0) {
      pX = platform.x + platform.sizeWidth;
    }

    pVelX = 0;
  }
}

// ---- Vertical Movement ----
pVelY += gravity * delta;

let nextY = pY + pVelY * delta;
let landedThisFrame = false;

for (let platform of platforms) {

  // Recompute AABB using nextY
  if (!aabb(pX, nextY, pWidth, pHeight, platform.x, platform.y, platform.sizeWidth, platform.sizeHeight)) 
    continue;

  // --- LANDING (top collision) ---
  if (pVelY > 0 && (pY + pHeight) <= platform.y && (nextY + pHeight) >= platform.y) {

    // Correct position
    nextY = platform.y - pHeight;

    if (landed === 1) {
      spawnLandingParticles(pX, nextY, Math.round(pVelY * 1.5));
      if (audio) {
      landingSound.currentTime = 0;
      landingSound.play();
    }
    }

    pVelY = 0;
    landedThisFrame = true;
    landed--;
    onPlatform = true;
    coyoteTimer = COYOTE_FRAMES;
    continue;
  }

  // --- HEAD HIT (bottom collision) ---
  if (pVelY < 0 && pY >= platform.y + platform.sizeHeight && nextY <= platform.y + platform.sizeHeight) {

    nextY = platform.y + platform.sizeHeight;
    pVelY = 0;
    isJumping = false;
    continue;
  }
}

pY = nextY;

// Update platform state
if (!landedThisFrame) onPlatform = false;
airBorne = !onPlatform;

// Coyote timer
if (!onPlatform && coyoteTimer > 0) coyoteTimer--;


  //Particles
  for (let particle of pParticles) {
    particle.parX += particle.speedX;
    particle.parY += particle.speedY;
    particle.life--;
  }


  // Death check
  if (pY > canvas.height) {
    death(pX, pY, 60, delta)
  }

  // Switch levels (example: reach top of screen)
  if (pY <= 0) {
    if (currentLevel < 20) {
      if (currentLevel === 19) {
        currentLevel = 19.25;
      } else if (currentLevel === 19.25) {
        currentLevel = 19.5;
      } else if (currentLevel === 19.5) {
        currentLevel = 19.75;
      } else if (currentLevel === 19.75) {
        currentLevel = 20;
        completedGame = true;
        localStorage.setItem("completion", completedGame)
        split(20);
        runActive = false;
      } else {
        currentLevel++;
      }
      spawnX = 50;
      spawnY = 500;
      pX = spawnX;
      pY = spawnY;
      pVelX = 0;
      pVelY = 0;
      for(let o of objects){
        if (o.type === "mEnemy" && o.spawnX && o.spawnY){
          o.x = o.spawnX;
          o.y = o.spawnY;
          o.interval = o.inInterval;
          o.tick = 0;
          o.dir = o.inDir;
        }
      }

      if (currentLevel !== lastSplitLevel) {
        split(currentLevel);
      }
    }
  }

  //Collision of objects
  for (let o of objects) {
    if (aabb(pX, pY, pWidth, pHeight, o.x, o.y, o.sizeWidth, o.sizeHeight)) {
      handleObject(o, delta);
    }
  }

  hue = (hue + 1) % 360;

  if (rainbowMode) {
    pColor = `hsl(${hue}, 100%, 50%)`;
  }


  //color swap (see if they like it)
  if (currentLevel === 1) {
    chooseColor();
  } else if (!rainbowMode) {
  localStorage.setItem("color", pColor);
  }


}


//Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Player
  if (gameState !== "Dead"){
    ctx.fillStyle = pColor;
    ctx.fillRect(pX, pY, pWidth, pHeight);

    for (let t of pTrails) {
      ctx.fillStyle = pColor;
      ctx.globalAlpha = t.fade;
      ctx.fillRect(t.x, t.y, t.size, t.size); 
    }
    ctx.globalAlpha = 1;
  }

  //objects
  const currentObjects = getCurrentObjects();
  for (let o of currentObjects) {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.sizeWidth, o.sizeHeight);
  }

  //Platforms
  ctx.fillStyle = "black";
  const platforms = getCurrentPlatforms();  
  for (let platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.sizeWidth, platform.sizeHeight);
  }

  //Debug 
  if (pColor === "indigo") {
    ctx.textAlign = "left"; 
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("x: " + pX.toFixed(2), 10, 60);
    ctx.fillText("y: " + pY.toFixed(2), 10, 80);
    ctx.fillText("fps: " + fps, 10, 100);
    ctx.fillText("Coyote: " + coyoteTimer, 10, 120);
    ctx.fillText("velY: " + pVelY.toFixed(2), 10, 140);
    ctx.fillText("velX: " + pVelX.toFixed(2), 10, 160);
  

    ctx.textAlign = "center";
    for (let p of platforms) {
      ctx.fillText(p.name, p.x + p.sizeWidth /2, p.y + p.sizeHeight /2)
    }
  }

  // Death counter
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  if (hardcoreMode){
    ctx.fillText("Modo Hardcore", 10, 20);
  } else ctx.fillText("Muertes: " + deathCount, 10, 20);

  // Level indicator
  ctx.fillStyle = "white";
  ctx.fillText("Nivel " + currentLevel, 10, 40);
  //Level 1
  if (currentLevel === 1) {
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText("WASD o Flechas", 380, 300);
    ctx.fillText("No caigas", 380, 320);
    ctx.fillText("Ves hacia arriba ^", 380, 340);
    if (completedGame) {
      ctx.fillText("H para modo Hardcore", 380, 360);
      ctx.fillText("1-9 para colores nuevos", 380, 380);
      if (rainbowObtained) ctx.fillText("R para color Arcoiris", 380, 400);
    } else {
      ctx.fillText("1-5 para cambiar color", 380, 360);
    }
  }

  if (currentLevel === 5) {
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText("Rojo te mata", 110, 550);
  }

  if (currentLevel === 6) {
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "20px Arial";
    ctx.fillText("Coyote", 340, 140);
  }

  //Easter egg text
  if (currentLevel === 6 && pX === 550 && pY === 330 && pColor === "black") {
    ctx.fillStyle = "white";
    ctx.fillText("¿Donde estan?", 200, 550);
  }

  if (currentLevel === 14) {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Verde invierte", 430, 300);
  }


  //Level 15 text
  if (currentLevel === 15) {
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "60px Arial";
    ctx.fillText("XLR8R", 300, 70);
  }
  
  //Last level text
  if (currentLevel === 20) {
  ctx.fillStyle = "white";
  ctx.font = "60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Bien Jugado", 300, 360);
  ctx.font = "20px Arial";
  ctx.fillText("Has desbloqueado nuevos colores y modo Hardcore.", 300, 420);
  ctx.fillText("Prueba Speedrunear en speedrun.com/nombre", 300, 440);
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

  if (speedrunMode) {
    //Speedrun timer
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.textAlign = "right";

  ctx.fillText(
    runActive ? formatTime(runTime) : formatTime(runTime),
    canvas.width - 10,
    25
  );

  ctx.textAlign = "right";
  ctx.font = "14px Arial";
  let y = 50;

  for (let i = 0; i < splits.length; i++) {
    const s = splits[i];
    ctx.fillText(
      `Lv ${s.level}: ${formatTime(s.time)}`,
      590,
      y
    );
    y += 14;
  }
  }

  
  if (gameState === "Paused") {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
      ctx.textAlign = "center";
    ctx.font = "60px Arial";
    ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2);
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Enter para volver", canvas.width / 2, canvas.height / 2 + 50);
    if (currentLevel === 20 ) {
      ctx.fillText("Refresh para continuar" , canvas.width / 2, canvas.height / 2 + 100);
    }
    if (currentLevel === 1){ 
      ctx.fillText("S para modo speedrunner", canvas.width / 2, canvas.height / 2 + 100);
    }
  }
  if (gameState === "Starting") {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Platformania", canvas.width / 2, canvas.height / 2);
    ctx.font = "30px Arial";
    ctx.fillText("Enter para empezar", canvas.width / 2, canvas.height / 2 + 50);
    if (completedGame) {
      ctx.fillText("L para siguiente nivel: "+ currentLevel, canvas.width / 2, canvas.height / 2 + 100);
      ctx.fillText("S para modo speedrunner", canvas.width / 2, canvas.height / 2 + 150);
    }
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
  if (currentLevel === 8) return level8Platforms;
  if (currentLevel === 9) return level9Platforms;
  if (currentLevel === 10) return level10Platforms;
  if (currentLevel === 11) return level11Platforms;
  if (currentLevel === 12) return level12Platforms;
  if (currentLevel === 13) return level13Platforms;
  if (currentLevel === 14) return level14Platforms;
  if (currentLevel === 15) return level15Platforms;
  if (currentLevel === 16) return level16Platforms;
  if (currentLevel === 17) return level17Platforms;
  if (currentLevel === 18) return level18Platforms;
  if (currentLevel === 19) return level19Platforms;
  if (currentLevel === 19.25) return level1925Platforms;
  if (currentLevel === 19.5) return level195Platforms;
  if (currentLevel === 19.75) return level1975Platforms;
  if (currentLevel === 20) return lastLevelPlatforms;
  return []; // fallback
}

function getCurrentObjects() {
  return objects.filter(o => o.level === currentLevel);
}

let accumulator = 0;
const step = 1000 / 60; // fixed 60 FPS update

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    let delta = timestamp - lastTime;
    lastTime = timestamp;

    // FPS counter (optional)
    framesThisSecond++;
    fpsTimer += delta;
    if (fpsTimer >= 1000) {
        fps = framesThisSecond;
        framesThisSecond = 0;
        fpsTimer = 0;
    }

    // -------- FIXED UPDATE LOOP (always 60 fps physics) --------
    // prevent huge delta causing spiral of death
    if (delta > 100) delta = 100;

    accumulator += delta;

    // each step = 1/60s
    while (accumulator >= step) {
        update(1);    // use delta = 1 (your physics already expect this)
        accumulator -= step;
    }

    // -------- DRAW (may run at 40 fps, 30 fps, whatever) --------
    draw();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

