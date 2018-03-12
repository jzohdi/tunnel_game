
/*
 *https://www.michaelbromley.co.uk/blog/simple-1d-noise-in-javascript/
 */
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

window.addEventListener("resize",function(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

var cb = canvas.getContext('2d');

// control width of tunnel for Ship

var gap = 200;
// var center = innerWidth/2
var center;
var gravity = 2.0;
var howJagged = 10;
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

function Ship(x, y){
  this.x = x;
  this.y = y;
  this.radius = 10;
  // this.dy = -0.5;

  this.draw = function(){
      cb.beginPath();
      cb.arc(this.x, this.y, this.radius, 0.2, Math.PI * 2, false);
      cb.strokeStyle = 'red';
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
    }
    else {
      cb.fillStyle = 'black';
    }
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

// console.log(Math.trunc(20/1.5))
// var animationTimer = ;

var leftArray = []

var generator = new Simple1DNoise();
var xx = 0.10;

function pushLeftWall(){

  xx += 1;

  var moveTunnel = generator.getVal(xx)*innerWidth
  if (moveTunnel > (gap/2) && moveTunnel < (innerWidth - (gap/2))){
    center = moveTunnel;
  }
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

var myShip = new Ship(innerWidth/2, innerHeight*0.66);

window.addEventListener("mousemove", function(){
    myShip.x = event.clientX
});

// Initiate first walls on left and right
pushLeftWall();
pushRightWall();

console.log(rightArray[0])

function animate(){
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

}

animate();
