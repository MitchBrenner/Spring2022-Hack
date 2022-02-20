'use strict';

let video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
    });

let x1 = null;
let y1 = null;
let x2 = null;
let y2 = null;

let running = false;

// container for all active particles
let objects = []

// particle speed
let speed = 5 // pixels per second
let spawnInterval = 2  // seconds

// timing parameters (in milliseconds)
let pTimeSpawn = Date.now();
let pTimeDiff = Date.now();
let pTimeCount = Date.now();
let cTime = Date.now();

// bookkeeping
let goals = 0
let timeRemaining = 60 // seconds

function initialize() {
    running = false;

    // container for all active particles
    objects = []

    // particle speed
    speed = 5 // pixels per second
    spawnInterval = 2  // seconds

    // timing parameters (in milliseconds)
    pTimeSpawn = Date.now();
    pTimeDiff = Date.now();
    pTimeCount = Date.now();
    cTime = Date.now();

    // bookkeeping
    goals = 0
    timeRemaining = 60 // seconds
}

function processVideo() {
    running = true;

    const red = new cv.Scalar(255, 0, 0, 255);
    const green = new cv.Scalar(0, 255, 0, 255);
    const blue = new cv.Scalar(0, 0, 255, 255);

    // video parameters
    let h = video.height;
    let w = video.width;

    const HAND_RADIUS = 30 // pixels
    const GOAL_RADIUS = 50 // pixels
    const GOAL_INSET = 10  // pixels
    const DIFF_INC = 5     // seconds

    // setup background
    let img = new cv.Mat(h, w, cv.CV_8UC4, [0, 0, 0, 255]);

    // setup goals
    let g1 = new cv.Point(GOAL_INSET,parseInt(h/2));
    let g1x = GOAL_INSET;
    let g1y = parseInt(h/2);
    cv.circle(img, g1, GOAL_RADIUS, blue, cv.FILLED, 2)
    let g2 = new cv.Point(w - GOAL_INSET,parseInt(h/2));
    let g2x = w - GOAL_INSET;
    let g2y = parseInt(h/2);
    cv.circle(img, g2, GOAL_RADIUS, blue, cv.FILLED, 2)

    // spawn hand portals
    if(x1 && x2 && y1 && y2) {
        let c1 = new cv.Point(parseInt(w*x1),parseInt(h*y1));
        let c2 = new cv.Point(parseInt(w*x2),parseInt(h*y2));
        cv.circle(img, c1, 30, green, cv.FILLED);
        cv.circle(img, c2, 30, green, cv.FILLED);
    }

    for(let i=0; i<objects.length; i++) { 
        let obj = objects[i];

        obj[0] = [parseInt(obj[0][0] + obj[1][0]*speed), parseInt(obj[0][1] + obj[1][1]*speed)];

        if(obj[0][0] > w || obj[0][0] < 0 || obj[0][1] > h || obj[0][1] < 0){
            objects.splice(i);
            i--;
            continue;
        }
    
        if(Math.hypot(g1x - obj[0][0], g1y - obj[0][1]) < GOAL_RADIUS
           || Math.hypot(g2x - obj[0][0], g2y - obj[0][1]) < GOAL_RADIUS){
            objects.splice(i);
            i--;
            goals += 1;
            continue;
        }

        cv.circle(img, new cv.Point(obj[0][0], obj[0][1]), 5, red, cv.FILLED, 2);

        if(x1 && x2 && y1 && y2) {
            if(Math.hypot(x1*w - obj[0][0], y1*h - obj[0][1]) < HAND_RADIUS && obj[2] === 1) {
                console.log("collision");
                obj[0] = [parseInt(obj[0][0] - x1*w + x2*w), parseInt(obj[0][1] - h*y1 + h*y2)];
                obj[2] = 0;
            } else if(Math.hypot(x2*w - obj[0][0], y2*h - obj[0][1]) < HAND_RADIUS && obj[2] === 1) {
                console.log("collision");
                obj[0] = [parseInt(obj[0][0] - w*x2 + w*x1), parseInt(obj[0][1] - h*y2 + h*y1)];
                obj[2] = 0;
            } else if(!(obj[2] === 1)
                && Math.hypot(x1*w - obj[0][0], y1*h - obj[0][1]) > 2*HAND_RADIUS 
                && Math.hypot(x2*w - obj[0][0], y2*h - obj[0][1]) > 2*HAND_RADIUS) {
                obj[2] = 1;
            }
        }
        else
            obj[2] = 0;
    }

    // create new objects
    cTime = Date.now()
    if(cTime - pTimeSpawn > spawnInterval*1000) {
        pTimeSpawn = cTime

        let yVel = 2*(Math.random() - 0.5) * h / Math.hypot(w,h);
        let xVel = Math.sqrt(1 - yVel*yVel);
        let sign = Math.random() - 0.5;
        if(sign > 0)
            xVel = xVel;
        else
            xVel = -xVel;

        let xPos = 0;
        if(xVel < 0)
            xPos = w;
        else
            xPos = 0;

        let yPos = 0;
        if(yVel < 0)
            yPos = h;
        else
            yPos = 0;

        objects.push([[xPos, yPos], [xVel, yVel], 1])
    }

    if(cTime - pTimeDiff > DIFF_INC*1000) {
        speed += 1
        spawnInterval -= 0.1
        pTimeDiff = cTime
    }
    
    if(cTime - pTimeCount > 1*1000) {
        timeRemaining -= 1
        pTimeCount = cTime
    }

    cv.flip(img, img, 1);

    cv.putText(img, goals.toString(), new cv.Point(30,50), cv.FONT_HERSHEY_COMPLEX, 1, blue, 2)
    cv.putText(img, timeRemaining.toString(), new cv.Point(w - 70,50), cv.FONT_HERSHEY_COMPLEX, 1, green, 2)

    cv.imshow('canvasOutput', img);

    if(timeRemaining > 0) {
        setTimeout(processVideo, 1);
    } else {
        running = false;
    }
}

function playclicked() {
    if(!running) {
        setTimeout(processVideo, 0);
    } else {
        initialize();
    }
}

/////////////////////////////////////////////////////////////////////////

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
    if (results.multiHandLandmarks) {
        if(results.multiHandLandmarks.length == 2) {
            x1 = (results.multiHandLandmarks[0][0].x 
                + results.multiHandLandmarks[0][5].x 
                + results.multiHandLandmarks[0][17].x) / 3;
            y1 = (results.multiHandLandmarks[0][0].y 
                + results.multiHandLandmarks[0][5].y 
                + results.multiHandLandmarks[0][17].y) / 3;
            x2 = (results.multiHandLandmarks[1][0].x 
                + results.multiHandLandmarks[1][5].x 
                + results.multiHandLandmarks[1][17].x) / 3;
            y2 = (results.multiHandLandmarks[1][0].y 
                + results.multiHandLandmarks[1][5].y 
                + results.multiHandLandmarks[1][17].y) / 3;
        }
        else {
            x1 = null;
            y1 = null;
            x2 = null;
            y2 = null;
        }
    }
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 720,
  height: 560
});

camera.start();