var canvasfacetracker, context, tracker;

window.onload = function() {
  canvasfacetracker = document.getElementById('canvasfacetracker');
  context = canvasfacetracker.getContext('2d');
  
}

var socket = io();

$( document ).ready(function() {

  var imageCapturing = true;

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


  setInterval(function() {
     
      if(imageCapturing == true && imageCounter < 15) {
        console.log('imageCapturing:' + imageCapturing);
        console.log('imageCounter:' + imageCounter);

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          // Other browsers will fall back to image/png
         
          // console.log(canvas.toDataURL('image/webp'));

          face = canvas.toDataURL('image/jpeg', 1)
         
          if(face.length < 10) {
              return
          }

          $.ajax({
            type: "POST",
            url: "/faceimage",
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
  }, 2000);

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




/*
  data.recognized = true | false
  data.name
*/
var faceIsDedected = false;

socket.on('confirmFace', function(dataPerson){
  console.log(dataPerson)
  if(dataPerson.recognized == false) {
    $('.dedectface').html('Face not recognized.');
    //change color
    $('.dedectface').css("border-color", "#4CAF4F");
    $('.dedectface').css("background-color", "#4CAF4F");
    $('.dedectface').css("color", "#fff");
    $('.dedectface').css("padding-right", "8px");
    imageCapturing = false;
    
    setTimeout(function () {
      turnOffCamera()
      $(".webcam").hide()
      $(".off").show();
    }, 2000);
    
    return
  }

  if (faceIsDedected == false) {

      faceIsDedected = true;
      imageCapturing = false;
     

      // change text of dedectface
      $('.dedectface').html(`${dataPerson.name} recognized!`);

      //change color
      $('.dedectface').css("border-color", "#4CAF4F");
      $('.dedectface').css("background-color", "#4CAF4F");
      $('.dedectface').css("color", "#fff");
      $('.dedectface').css("padding-right", "8px");

      setTimeout( function(){
        $('.dedectface').css("background-color", "none");
        $('.color').css("color", "#4CAF4F");
        $('.dedectface').html('Confirm payment with personal face gesture');
       
      }, 2000);
    }

    // $('.success').show(0, function(){
    //   $('.dedectface').hide()
    // });
});

socket.on('confirmPurchase', function(data){
    console.log('purchase confirmed!');
    turnOffCamera()
    $('.paymentconfirm').show(0, function(){
      setInterval(function() {
        
        $(".confirmnimg").hide();

      },1000);
    });

});

function turnOffCamera(){
  var video = document.querySelector('#screenshot-video');
  video.pause(); 
  video.srcObject.getVideoTracks()[0].stop();
}

});

