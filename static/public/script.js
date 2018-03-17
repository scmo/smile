var facerecognition = () => {
  const button = document.querySelector('#screenshot-button');
  const img = document.querySelector('#screenshot-img');
  const video = document.querySelector('#screenshot-video');

  const canvas = document.createElement('canvas');
  const constraints = {
  video: true
  };

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

