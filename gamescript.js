/* TODO:
1) Draw enemy sprite in gimp
2) Background particle effects (stars passing by, hyper drive?)
3) AI/User missile programming 
4) sounds : var audio = new Audio('audio_file.mp3');audio.play();
*/

//Graphics Context
var canvas = document.getElementById("gameDisplay");
var g2d = canvas.getContext("2d");

//Global Variables
var x = 100;
var y = 100;
var playerSprite = new Image(50, 50);
var alienSprite = new Image(50, 50);
var missileSprite = new Image(11, 5);
var aliens = [];
var pressedKeys = [];
var trailCoords = [];
var missiles = [];
var backgroundRays = [];
var gameTime = 0; //in miliseconds
var interval = 10; //in miliseconds
var spriteSpeed = 0.3; //in pixels per second 
var spriteMissileDelay = 0;
var score = 0;
var health = 100;



//Initalization, KeyListenrs 
document.addEventListener('keydown', function (event) {
    pressedKeys[event.keyCode] = true;
    event.preventDefault();
}, false);

document.addEventListener('keyup', function (event) {
    pressedKeys[event.keyCode] = false;
    event.preventDefault();
}, false);

function init() {
    pressedKeys[255] = 0;
    for (var i = 0; i < pressedKeys.length; i++) pressedKeys[i] = false;
    window.setInterval(update, interval);
    playerSprite.src = "resources\\Sprite.png";
    alienSprite.src = "resources\\Alien.png";
    missileSprite.src = "resources\\Missile.png";
    initBackground();
}
init();

//Class declerations 
function Alien(num) {
    this.num = num;
    this.health = 3;
    this.x = 1000;
    this.y = Math.round(Math.random() * 925);
    this.xTrgt = Math.round(Math.random() * 600) + 400;
    this.yTrgt = Math.round(Math.random() * 800) + 100;
    this.slope = -1*((this.y - this.yTrgt) / (this.x - this.xTrgt)); //remove -1*
    this.yStart = this.y;
    this.width = 15;
    this.height = 15;
    this.sprite = alienSprite;
    this.setColor = () => "#" + (Math.floor(Math.random() * 16777214)).toString(16),
    this.color = this.setColor();
    this.isAlive = false,
    this.getHealth = function () {
        return this.health;
    };
    this.checkHit = function () {
        for (var i = 0; i < missiles.length; i++) {
            if (missiles[i].x == this.x && missiles[i].y == this.y) {
                alert("hit");
                aliens.splice(this.num, 1);
            }
        }
    };
    
    this.compute = function(x){
        x = 1000-x; //AHA! GET REKT YOU STUPID BACKWARDS COORDINATE SYSTEM THAT MAKES NO LOGICAL OR INTUTIVE SENSE!
        var cy= ((this.slope * x) + this.yStart); //^
        return cy;//925-y;
    }
    
    this.move = function () {
        //come in from right side of screen and move to designated point
 
        if (this.x > this.xTrgt) {
            this.x = this.x - 3;
            this.y = this.compute(this.x);

        }
        console.log("Sprite " + this.num + ": X: " + this.x + ", Y: " + this.y + ", Yint: " + this.yStart + ", M: " + this.slope);
    };

    this.fire = function () {
        //use player x/y coords to fire a missile at that point (not tracking ATM)
    };
}
function Point(mx, my) {
    this.x = mx;
    this.y = my;
}

function Missile(startx, starty, dir) { //true is forwad 
    this.damage = 1;
    this.x = startx;
    this.y = starty;
    this.sprite = missileSprite;
    this.width = 11;
    this.height = 5;
    this.dir = dir;
    this.speed = 10;
}

//Functions
var drawPoint = (x, y, w, h) => [x - 0.5 * w, y - 0.5 * h];

function manageAI() {

}

function newEnemy() {
    aliens.push(new Alien(aliens.length - 1));
}

function checkWalls() {
    if (x - 25 <= 0) x = 26; //x <= 10, x=11
    if (x + 25 >= 400) x = 374;

    if (y - 25 <= 0) y = 26; //y <= 10, y = 11
    if (y + 25 >= 925) y = 899; //(y >= 910) y = 909;

}

function addMissile(x, y, dir) {
    missiles.push(new Missile(x, y, dir));
}


//Graphics
function initBackground() {
    var flag = true;
    for (var y = 0; y < 925; y += 32) { //y+=16
        flag = !flag;
        var startx = 1000;
        if (flag == true) startx = 1070;
        else startx = 1025;

        for (var x = startx; x > 0; x -= 70) {
            backgroundRays.push(new Point(x, y));
        }


    }
}

function paintBackground() {
    for (var i = 0; i < backgroundRays.length; i++) {
        backgroundRays[i].x--;
        if (backgroundRays[i].x + 40 <= 0) {
            if (backgroundRays[i].y % 16 == 0) { //here, 16
                backgroundRays[i].x = 1025;
            }
            else backgroundRays[i].x = 1070;
        }
        g2d.fillStyle = "#FFFFFF";
        g2d.fillRect(backgroundRays[i].x, backgroundRays[i].y, 40, 2);
    }


}

function drawPath(i) {
    g2d.beginPath();
    g2d.lineWidth="3";
    g2d.strokeStyle = "#14fe14";
    var sy = aliens[i].compute(1000);
    var ey = aliens[i].compute(aliens[i].xTrgt); //remvove +25
    g2d.moveTo(1000, sy);
    g2d.lineTo(aliens[i].xTrgt, ey);
    g2d.stroke();
    console.log("Sprite " + aliens[i].num + ": X: " + aliens[i].x + ", Y: " + aliens[i].y + ", Yint: " + aliens[i].yStart + ", M: " + aliens[i].slope + ", xTrgt: " + aliens[i].xTrgt + ", yTrgt "+ aliens[i].yTrgt +  ", CY: " + ey);

}

function paintTrail() {
    g2d.fillStyle = "#14fe14";
    for (var i = 0; i < trailCoords.length; i++) {
        g2d.fillRect(trailCoords[i].x - 1, trailCoords[i].y - 1, 3, 3);
    }
}

function drawScoreboard() {
    g2d.fillStyle = "#640000";
    g2d.fillRect(0, 0, 120, 65);
    g2d.font = "20px Arial";
    g2d.fillStyle = "#FFFFFF"
    g2d.fillText("Score: " + score, 10, 30);
    g2d.fillText("Health: " + health, 10, 50);
}

function paint() {
    paintBackground();
    paintTrail();
    drawScoreboard();
    var spriteLoc = drawPoint(x, y, 50, 50);
    g2d.drawImage(playerSprite, spriteLoc[0], spriteLoc[1]);
    for (var i = 0; i < aliens.length; i++) {
        var current = aliens[i];
        var alienLoc = drawPoint(current.x, current.y, current.width, current.height);
        g2d.fillStyle = current.color;
        g2d.drawImage(alienSprite, alienLoc[0], alienLoc[1]);
        drawPath(i);
    }

    for (var i = 0; i < missiles.length; i++) {
        var missileLoc = drawPoint(missiles[i].x, missiles[i].y, 11, 5);
        g2d.drawImage(missiles[i].sprite, missileLoc[0], missileLoc[1]);
    }

}

//Key Handling 
function keyHandler() {
    if (pressedKeys[37] == true) {
        x -= spriteSpeed * interval;
    }
    if (pressedKeys[39] == true) {
        x += spriteSpeed * interval;
    }
    if (pressedKeys[38] == true) {
        y -= spriteSpeed * interval;
    }
    if (pressedKeys[40] == true) {
        y += spriteSpeed * interval;
    }
    if (pressedKeys[32] == true && spriteMissileDelay >= 100) {
        spriteMissileDelay = 0;
        addMissile(this.x, this.y + 20, true);
        addMissile(this.x, this.y - 20, true);
    }
}

//Update subroutine(s)

function updateMissiles() {
    for (var i = 0; i < missiles.length; i++) {
        if (missiles[i].x >= 1000 || missiles[i].x <= 0) missiles.splice(i, 1);
        else if (missiles[i].dir == true) missiles[i].x += missiles[i].speed;
        else missiles[i].x -= missiles[i].speed;
    }
}

function update() {
    gameTime += interval;
    spriteMissileDelay += 10;
    trailCoords.push(new Point(x, y));
    if (trailCoords.length >= 20) trailCoords.splice(0, 5);
    checkWalls();
    keyHandler();
    updateMissiles();
    for (var i = 0; i < aliens.length; i++) {
        aliens[i].checkHit();
        aliens[i].move();

    }
    if (aliens.length <= 1) for (var i = 0; i < 5; i++) aliens.push(new Alien(aliens.length));
    g2d.clearRect(0, 0, canvas.width, canvas.height);
    paint();

}