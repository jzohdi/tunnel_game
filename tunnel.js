
/*
 *https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/
 */
function init(){
var Simple1DNoise = function() {
    var MAX_VERTICES = 256;
    var MAX_VERTICES_MASK = MAX_VERTICES -1;
    var amplitude = 1.0;
    var scale = 0.025;

    var r = [];

    for ( var i = 0; i < MAX_VERTICES; ++i ) {
        r.push(Math.random());
    }

    var getVal = function( x ){
        var scaledX = x * scale;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * ( 3 - 2 * t );

        /// Modulo using &
        var xMin = xFloor & MAX_VERTICES_MASK;
        var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;

        var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

        return y * amplitude;
    };

    /**
    * Linear interpolation function.
    * @param a The lower integer value
    * @param b The upper integer value
    * @param t The value between the two
    * @returns {number}
    */
    var lerp = function(a, b, t ) {
        return a * ( 1 - t ) + b * t;
    };

    // return the API
    return {
        getVal: getVal,
        setAmplitude: function(newAmplitude) {
            amplitude = newAmplitude;
        },
        setScale: function(newScale) {
            scale = newScale;
        }
    };
};
/*
 * End perlin documentation
 */

// Initiate canvas

var canvas = document.getElementById('map-canvas')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var rtime;
var timeout = false;
var delta = 300;

window.addEventListener("resize",function(){
  rtime = new Date();
  if(timeout === false){
    timeout = true;
    setTimeout(resizeEnd, delta);
  }
});

function resizeEnd(){
  if(new Date() - rtime < delta){
    setTimeout(resizeEnd, delta);
  } else {
    timeout = false;
    location.reload();
  }
};

var cb = canvas.getContext('2d');

// control width of tunnel for Ship

function scaleWidth(innerWidth){
  if (innerWidth > 1000){
    return [10, 200, 170]
  }
  else if (innerWidth > 800){
    return [6, 150, 120]
  }
  else if(innerWidth > 600){
    return [5, 120, 100]
  }
  else if (innerWidth > 500){
    return [5, 110, 100]
  }
  else if (innerWidth <= 500){
    return [5, 100, 90]
  }
}

console.log(innerWidth);
var scalers = scaleWidth(window.innerWidth)
var shipRadius = scalers[0];
var gap = scalers[1];
var gapWhenEasy = scalers[2];

// var center = innerWidth/2
var center;
var gravity = 2;
var howJagged = 10;
gameOver= false;
// var tunnelDifficulty = 200;
// var howFar = Math.trunc(20/gravity)
// console.log(Math.trunc(20/2.5))
// console.log(howFar)
// console.log(-20 + (Math.trunc(20/2.5)*2.5))

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getDeci(x) {
  return parseFloat(Number.parseFloat(x).toFixed(2));
}

function Ship(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
  // this.dy = -0.5;

  this.draw = function(){
      cb.beginPath();
      cb.arc(this.x, this.y, this.radius, 0.2, Math.PI * 2, false);
      cb.strokeStyle = 'red';
      cb.fillStyle = "black";
      cb.fill();
      cb.stroke();
  }
  this.moveLeft = function(){
    this.x -= 10;
  }
  this.moveRight = function(){
    this.x += 10;
  }
  this.update = function(){
    this.draw();
  }
}

function leftCollision(wallX, wallY, pointTwo) {
var userY = pointTwo.y;
var userX = pointTwo.x;
var minLength = pointTwo.radius**2;

if (((wallX - userX)**2 + (wallY - userY)**2
 < minLength) || ((wallX - userX)**2 + (wallY + 10 - userX)**2
 < minLength) || ((wallX - userX)**2 + (wallY + 20 - userX)**2
 < minLength) || (userX < wallX && (wallY + 20) >= (userY - 10) && wallY <= (userY + 10))){
//   return true;
// }
// if ((wallX - userX)**2 + (wallY + 10 - userX)**2 < minLength){
//   return true;
// }
// if ((wallX - userX)**2 + (wallY + 20 - userX)**2 < minLength){
//   return true;
// }
// if (userX < wallX && (wallY + 20) >= (userY - 10) && wallY <= (userY + 10)){
  return 'red';
}
  return 'black';
}

function LeftWall(length, dy, whenToPush){
  this.length = length;
  this.y = -18.0;
  this.dy = dy
  this.height = 20.0;
  this.whenToPush = whenToPush;

  this.draw = function(){
    if (((this.length - myShip.x)**2 + (this.y - myShip.y)**2
        < myShip.radius**2) || ((this.length - myShip.x)**2 + ((this.y + 20) - myShip.y)**2
            < myShip.radius**2) || (myShip.x < this.length && (this.y + 20) >= (myShip.y - 10) && this.y <= (myShip.y + 10))){
    cb.fillStyle = 'red';
    gameOver = true;
    }
    else {
      cb.fillStyle = 'black';
    }
    // cb.fillStyle = leftCollision(this.length, this.y, myShip)
    cb.fillRect(0, this.y, this.length, this.height)
  }

  this.update = function(){
    if (this.y > innerHeight + 20){
      this.dy = 0;
      leftArray.shift();
    }
    if (this.y == this.whenToPush){
      pushLeftWall();
    }

    // var thisNumL = parseInt(this.y.toFixed(2)) + parseInt(this.dy.toFixed(2));
    this.y = getDeci(getDeci(this.y) + getDeci(this.dy));
    this.draw();
  }
}

function RightWall(xEdge, dy, whenToPush){
  this.xEdge = xEdge;
  this.y = -18;
  this.dy = dy;
  this.height = 20;
  this.whenToPush = whenToPush;

  this.draw = function(){

    // TOdo function for if touching
    if (((this.xEdge - myShip.x)**2 + (this.y - myShip.y)**2
        < myShip.radius**2) || ((this.xEdge - myShip.x)**2 + ((this.y + 20) - myShip.y)**2
            < myShip.radius**2) || (myShip.x > this.xEdge && (this.y + 20) >= (myShip.y - 10) && this.y <= (myShip.y + 10))){
        cb.fillStyle = 'red';
        gameOver = true;
    }
    else {
      cb.fillStyle = 'black';
    }
    cb.fillRect(xEdge, this.y, innerWidth, this.height)
  }

  this.update = function(){
    if (this.y > innerHeight + 20){
      this.dy = 0
      rightArray.shift();
    }

    if (this.y == this.whenToPush){
      pushRightWall();
    }

    // var thisNumR = getDeci(this.y) + getDeci(this.dy);
    this.y = getDeci(getDeci(this.y) + getDeci(this.dy));
    this.draw();
  }
}

function ScoreBox(width, style, color){
  this.score = 0;
  this.x = 20;
  this.y = 20;
  this.color = color
  this.font = width + style;
  this.score = 0

  this.update = function(){

    cb.font = this.font;
    cb.fillStyle = this.color;
    cb.fillText("SCORE: " + this.score, this.x, this.y);
  }

}

function EndGame(){
  this.score = 0;
  this.x = window.innerWidth/5;
  this.y = window.innerHeight/3;
  this.size = innerWidth/11;
  this.message = "YOU LOST :(";
  this.message2 = "YOUR SCORE: ";
  this.update = function(){
    cb.font = this.size + "px Consolas";
    cb.fillStyle = "red";
    cb.fillText(this.message, this.x, this.y)
    cb.fillText(this.message2 + this.score, this.x - 70, this.y + this.size);
  }
}

function Restart(){
  this.x = window.innerWidth/3;
  this.y = window.innerHeight*0.80;
  this.size = innerWidth/15;
  this.message = "Restart?"
  this.update = function(){
    cb.font = this.size + "px Consolas";
    cb.fillStyle = 'green';
    cb.fillText(this.message, this.x, this.y)
  }
}
var score = new ScoreBox("20px ", "Consolas", "red")

function decideTunnelWidth(oldCenter, center){
  var diff = Math.abs(center - oldCenter)
  if (diff >= 13){
    var newGap = gapWhenEasy - 10 + 3.06 * diff;
    return newGap
  }
  else {
    return gapWhenEasy;
  }
}
// console.log(Math.trunc(20/1.5))
// var animationTimer = ;

var leftArray = []

var generator = new Simple1DNoise();
var xx = 0.10;

function pushLeftWall(){

  xx += 1;
  var oldCenter = center;
  var moveTunnel = generator.getVal(xx)*innerWidth
  if (moveTunnel > (gap/2) && moveTunnel < (innerWidth - (gap/2))){
    center = moveTunnel;
  }
  // console.log(center)
  gap = decideTunnelWidth(oldCenter, center);
  var whenToPushL = getDeci((-18 + (Math.trunc(18/gravity)*gravity)));
  var wallLength = getRndInteger(center - (gap/2) - howJagged,
                                center - (gap/2) + howJagged);
  leftArray.push(new LeftWall(wallLength, gravity, whenToPushL));

}

var rightArray = []
var gameTimer = 1;

function pushRightWall(){
  gameTimer += 1;
  if ( gameTimer % 100 == 0 && gravity <= 10.0){
    gravity += 0.1;
  }
  var whenToPushR = getDeci((-18 + (Math.trunc(18/gravity)*gravity)));
  // console.log(whenToPushR)
  var xStart = getRndInteger(center + (gap/2) + howJagged,
                            center + (gap/2) - howJagged);
  rightArray.push(new RightWall(xStart, gravity, whenToPushR));
}

var myShip = new Ship(innerWidth/2, innerHeight*0.66, shipRadius);

var device;
var touchPosition;

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    device = "mobile";
}
else{
  device = "desk"
}

if (device == "mobile"){
  // document.getElementById("deviceID").
  window.addEventListener("touchstart", function(e){

    touchPosition = e.touches[0].clientX;
  });
  window.addEventListener("touchmove", function(e){
    var movement = e.touches[0].pageX;
    var positionChange = movement - touchPosition;
    myShip.x += positionChange;
    touchPosition = movement;
  });
} else {
  window.addEventListener("mousemove", function(){
    myShip.x = event.clientX;
  })
}
// window.addEventListener(mouseOrTouch, function(e){
//     if (mouseOrTouch == "mousemove"){
//       myShip.x = event.clientX;
//     }
//     else {
//       var touch = e.touches[0]
//       myShip.x = touch.pageX;
//     }
// });

// Initiate first walls on left and right
pushLeftWall();
pushRightWall();

// console.log(rightArray[0])
var gameEnd = new EndGame()
var restart = new Restart();

function animate(){
  if (gameOver == false) {
    requestAnimationFrame(animate);
    cb.clearRect(0, 0, innerWidth, innerHeight);
    // console.log(rightArray[0].y)
    myShip.update();

    // console.log(noise.perlin2((Math.random()- 0.5), (Math.random() - 0.5))*100)
    for(var n = 0; n < rightArray.length; n++){
      rightArray[n].update();
    }
    for ( var i = 0; i < leftArray.length; i++){
      leftArray[i].update();
      // console.log(leftArray[rightArray.length - 1].y)
    }

    score.score += 1;
    score.update();

  }
  else if (gameOver == true){
    gameEnd.score = score.score;
    gameEnd.update();
    restart.update();
    if (device == "mobile"){
      window.addEventListener("click", function(){
        // console.log(event.clientX, event.clientY)
        // console.log(restart.size, restart.y, restart.x)
        var clickX = event.clientX;
        var clickY = event.clientY;
        if(clickX >= restart.x && clickX <= restart.x + (restart.size*5)){
          if (clickY >= restart.y - restart.size && clickY <= restart.y){
            location.reload();
          }
        }
      });
    } else {
        window.addEventListener("touchstart", function(e){
            var clickX = e.touches[0].clientX;
            var clickY = e.touches[0].clientY;
            if(clickX >= restart.x && clickX <= restart.x + (restart.size*5)){
              if (clickY >= restart.y - restart.size && clickY <= restart.y){
                location.reload();
              }
            }
        })
    }
  }
}

animate();
}

init();
