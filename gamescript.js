/* TODO:
1) Draw enemy sprite in gimp
2) Background particle effects (stars passing by, hyper drive?)
3) AI/User missile programming 
4) sounds : var audio = new Audio('audio_file.mp3');audio.play();
*/

//Graphics Context
var canvas = document.getElementById("gameDisplay");
var g2d = canvas.getContext("2d");
var width = 1000;
var height = 925;

//Global Variables
var x = 100;
var y = 100;
var aliens = [];
var pressedKeys = [];
var trailCoords = [];
var missiles = [];
var backgroundRays = [];
var bosses = [];
var gameTime = 0; //in miliseconds
var interval = 10; //in miliseconds
var spriteSpeed = 0.3; //in pixels per second 
var spriteMissileDelay = 0;
var score = 0;
var health = 100;
var uniqueID = 0;
var level = 0;

//Sprites/Visuals
var playerSprite = new Image(50, 50);
var alienSprites = [];
var missileSprite = new Image(11, 5);

//Sounds
var laser;



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

    laser = new Audio("resources\\Sounds\\laserblast.wav");


    playerSprite.src = "resources\\Sprites\\Sprite.png";
    missileSprite.src = "resources\\Sprites\\Missile.png";
    for (var i = 0; i < 2; i++) {
        alienSprites[i] = new Image(50, 50);
        alienSprites[i].src = "resources\\Sprites\\Aliens\\Alien" + i + ".png";
    }
    initBackground();
}
init();

//Class declerations 
function Alien(uniqueID, type, health, damage, score) {
    this.uniqueID = uniqueID;
    this.type = type;
    this.health = health;
    this.damage = damage;
    this.score = score;
    this.x = width;
    this.y = Math.round(Math.random() * height);
    this.theta = (Math.random() * 180) - 90;
    this.totalLength = Math.round((Math.random() * 500) + 100);
    this.currentLength = 0;
    this.yStart = this.y;
    this.width = 50;
    this.height = 50;
    this.sprite = alienSprites[type];
    this.lastHit = 0;
    this.startHealth = health;
    this.damageIntensity = 0;
    this.damagedEffect = false;
    this.getHealth = function () {
        return this.health;
    };

    this.intersects = function (x, y, w, h) {
        var flag = true;
        if (!(y >= this.y - 25 && y <= this.y + 25)) flag = false;
        if (!(x >= this.x - 25 && x/*typo, y*/ <= this.x + 25)) flag = false; //Caught ya!
        return flag;
    }

    this.checkHit = function () {
        if (gameTime - this.lastHit >= 500) {
            for (var i = 0; i < missiles.length; i++) {
                if (this.intersects(missiles[i].x, missiles[i].y, 11, 5) && missiles[i].dir == true) {
                    this.health--;
                    this.lastHit = gameTime;
                    console.log(this.uniqueID);
                    missiles.splice(i, 1); //could have adverse effects 
                    if (this.health <= 0) {
                        score += this.score;
                        aliens = aliens.filter(function (i) { return (i.uniqueID != this.uniqueID) }.bind(this));
                    }
                    
                    if(this.health < this.startHealth) {
                        this.damagedEffect = true;
                        this.damageIntensity++;
                    } 
                }

            }
        }
    };

    this.calc = function (hyp, theta) { //add 180 to theta for coordinate switch or multiply by -1
        theta = -1 * theta;
        var x = width - (Math.cos(toRadians(theta)) * hyp);
        var y = ((Math.sin(toRadians(theta)) * hyp) + this.yStart);
        return [x, y];
    }

    this.move = function () {
        //come in from right side of screen and move to designated point
        if (this.calc(this.totalLength, this.theta)[1] >= height - 25 || this.calc(this.totalLength, this.theta)[1] <= 25) {
            this.theta = this.theta * -1;
        }

        if (this.currentLength <= this.totalLength) {
            this.currentLength += 1;
            this.x = this.calc(this.currentLength, this.theta)[0];
            this.y = this.calc(this.currentLength, this.theta)[1];

        }


    };

    this.fire = function () {
        //use player x/y coords to fire a missile at that point (not tracking ATM), diagonal fire using same trig as movement
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

//Random Functions
var drawPoint = (x, y, w, h) => [x - 0.5 * w, y - 0.5 * h];

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function checkWalls() {
    if (x - 25 <= 0) x = 26;
    if (x + 25 >= 400) x = 374;

    if (y - 25 <= 0) y = 26;
    if (y + 25 >= height) y = height - 25 - 1;

}

function addMissile(x, y, dir) {
    missiles.push(new Missile(x, y, dir));
}


function initBackground() {
    var flag = true;
    for (var y = 0; y < height; y += 32) {
        flag = !flag;
        var startx = width;
        if (flag == true) startx = 1070;
        else startx = 1025;

        for (var x = startx; x > 0; x -= 70) {
            backgroundRays.push(new Point(x, y));
        }


    }
}


//Graphics
function paintDamageEffect(current) {
    if(this.gameTime%10 == 0) {
        g2d.beginPath();
        g2d.arc(current.x, current.y, 35, 0, toRadians(360));
        //g2d.strokeStyle = "#14fe14";
        g2d.fillStyle = "rgba(100, 3, 3, 0.5)";
        //g2d.stroke();
        g2d.fill();
    }
}

function paintBackground() {
    for (var i = 0; i < backgroundRays.length; i++) {
        backgroundRays[i].x--;
        if (backgroundRays[i].x + 40 <= 0) {
            if (backgroundRays[i].y % 16 == 0) {
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
    g2d.lineWidth = "3";
    g2d.strokeStyle = "#14fe14";
    g2d.moveTo(width, aliens[i].yStart);
    var pt = new Point(aliens[i].calc(aliens[i].totalLength, aliens[i].theta)[0], aliens[i].calc(aliens[i].totalLength, aliens[i].theta)[1]);
    g2d.lineTo(pt.x, pt.y);
    g2d.stroke();
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
        g2d.drawImage(current.sprite, alienLoc[0], alienLoc[1]);
        //   drawPath(i);
        if(current.damagedEffect == true)  paintDamageEffect(current);
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
    if (pressedKeys[32] == true && spriteMissileDelay >= 400) {
        spriteMissileDelay = 0;
        addMissile(this.x, this.y + 20, true);
        addMissile(this.x, this.y - 20, true);
        laser.play();
    }
    if (pressedKeys[32] == false) {
        laser.pause();
        laser.currentTime = 0;
    }
}

//Update subroutine(s)

function updateMissiles() {
    missiles = missiles.filter(function (i) { return !(i.x > 1100 || i.x < -100) });
    for (var i = 0; i < missiles.length; i++) {
        if (missiles[i].dir == true) missiles[i].x += missiles[i].speed;
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
        aliens[i].move();
        aliens[i].checkHit();

    }


    if (aliens.length == 0 && bosses.length == 0) {
        level++;
        progressionManager(level);
        console.log(aliens);
    }


    g2d.clearRect(0, 0, canvas.width, canvas.height);
    paint();

}


//Progression Manager:
function progressionManager(level) {
    switch (level) {
        case 1:
            alert("Level 1");
            spawn(5, 0, 1, 1, 1);
            break;
        case 2:
            alert("Level 2");
            spawn(5, 0, 1, 2, 2);
            spawn(5, 1, 2, 2, 2);
            break;
        case 3:
            alert("Level 3");
            break;
    }
}

function spawn(amount, type, health, damage, score) {
    for (var i = 0; i < amount; i++) {
        aliens.push(new Alien(uniqueID, type, health, damage, score));
        uniqueID++;
    }
};

function miniboss() {

}
