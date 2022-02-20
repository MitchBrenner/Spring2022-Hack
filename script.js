let video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function(stream) {
        video.srcObject = stream;
    });

let img = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let cap = new cv.VideoCapture(video);

function processVideo() {
    cap.read(img);
    let h = video.height;
    let w = video.width;
    let center = new cv.Point(w/2,h/2);
    let color = new cv.Scalar(255, 0, 0, 255);
    cv.circle(img, center, 50, color);
    cv.imshow('canvasOutput', img);
    setTimeout(processVideo, 1000/60);
}

setTimeout(processVideo, 0);

/////////////////////////////////////////////////////////////////////////

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function onResults(results) {
    let x1 = null;
    let y1 = null;
    let x2 = null;
    let y2 = null;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
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
    }
    canvasCtx.restore();
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