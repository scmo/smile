var canvasfacetracker, context, tracker;

window.onload = function() {
  canvasfacetracker = document.getElementById('canvasfacetracker');
  context = canvasfacetracker.getContext('2d');
  
}


$( document ).ready(function() {
 

var facerecognition = () => {
  const button = document.querySelector('#screenshot-button');
  const img = document.querySelector('#screenshot-img');
  const video = document.querySelector('#screenshot-video');

  const canvas = document.createElement('canvas');
  const constraints = {
  video: true
  };

  tracker = new tracking.ObjectTracker('face');
  canvasfacetracker = document.getElementById('canvasfacetracker');
  context = canvasfacetracker.getContext('2d');

  tracker.setInitialScale(4);
  tracker.setStepSize(1);
  tracker.setEdgesDensity(0.1);
  tracking.track('#screenshot-video', tracker, { camera: true });
  tracker.on('track', function(event) {
    context.clearRect(0, 0, canvasfacetracker.width, canvasfacetracker.height);
    event.data.forEach(function(rect) {
      context.strokeStyle = '#a64ceb';
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = '11px Helvetica';
      context.fillStyle = "#fff";
      context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
      context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });
  });
  // var gui = new dat.GUI();
  // gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
  // gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
  // gui.add(tracker, 'stepSize', 1, 5).step(0.1);




  function handleSuccess(stream) {
    video.srcObject = stream;
  }

  function handleError(error) {
    console.error('Reeeejected!', error);
  }

  var imageCounter = 0;
  var imageCapturing = true;

  setInterval(function() {
      if(imageCapturing == true && imageCounter < 5) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          // Other browsers will fall back to image/png
         
          console.log(canvas.toDataURL('image/webp'));

          face = canvas.toDataURL('image/jpeg', 1)
          console.log('face')
          if(face.length < 10) {
              return
          }
          $.ajax({
            type: "POST",
            url: "https://localhost:3000/faceimage",
            data: { 
                imgBase64: face
            }
          }).done(function(o) {
          console.log('saved'); 
          // If you want the file to be visible in the browser 
          // - please modify the callback in javascript. All you
          // need is to return the url to the file, you just saved 
          // and than put the image in your browser.

          if (img != null){
            img.src = canvas.toDataURL('image/webp');
          }
          });
          
          imageCounter++;
          console.log(imageCounter);
      } 
  }, 800);

  // button.onclick = video.onclick = function() {
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   canvas.getContext('2d').drawImage(video, 0, 0);
  //   // Other browsers will fall back to image/png
  //   img.src = canvas.toDataURL('image/webp');
  // };

  navigator.mediaDevices.getUserMedia(constraints).
  then(handleSuccess).catch(handleError);
};


window.onload = function() {

};


$( "#method-smile" ).click(function() {
    $(".off").hide();
    $(".amount").show( 0, function() {
      // show complete.
      setTimeout( function(){
        $(".amount").hide();
        $(".webcam").show(0, function(){
            // starting taking images from webcam
            facerecognition();
          }
        );
      }, 2000);
      
    });
  });

var socket = io();
socket.on('notify', function(msg){
    console.log('message: ' + msg);
});

/*
  data.recognized = true | false
  data.name
*/
socket.on('confirmFace', function(data){
    console.log('person: ' + data.name);
});



});

