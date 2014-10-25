// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var userName = "";
var peer = null;
window.onload = function(){
  window.setInterval(whoIsOnline, 2000);
  $(".whoami-set-js").on("click", userOnline);
};


function userOnline(){
  var requestName = $(".whoami").val();
  if (requestName){
    //Save UserName for Future Usage
    userName = requestName;
    createPeerConnection(userName);
  } else {
    alert("Cool. No call for you though..");
  }

}

function whoIsOnline(res){
  $.get("/who-is-online?iam="+ userName, function(response){
    if (response !== ""){
      var $ul = $(".who-is-online").html("");
        response.forEach(function(item) {
          $ul.append("<li><a href='#' class='make-call-js'>"+ item + "</a></li>");
        });
      }
  });
}

function createPeerConnection(userName){
  peer = new Peer({
    key: 'PLACE_YOUR_KEY_IN_HERE',
    debug: 0,
    config: {
      'iceServers': [{
        url: 'stun:stun.l.google.com:19302'
      }
      ]
    }
  });

  peer.on('open', function() {
    $('#my-id').text(userName);
    mapNameToId(userName, peer.id, whoToCall);

  });
}

function mapNameToId(name, id, callback){
  $.post("/register-user", {userName: name, peerId: id}).done(callback);
}


function whoToCall(){
  setUpCall();
}

function setUpCall(){
  // Receiving a call
  peer.on('call', function(call) {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(window.localStream);
    step3(call);
  });
  peer.on('error', function(err) {
    alert(err.message);
    // Return to step 2 if error occurs
    step2();
  });

  // Click handlers setup
  $(function() {
    $(document.body).on("click", ".make-call-js", function() {
      // Initiate a call!
      $.get("/read-user?name="+$(this).text()).done(function(response){
        console.log("Found result:" + response);
        if (!response || response === "undefined" || response === ""){
          alert("User Could not be found, jah bless.");
          return false;
        }
        var call = peer.call(response, window.localStream);
        step3(call);
      });
    });

    $('#end-call').click(function() {
      window.existingCall.close();
      step2();
    });

    // Retry if getUserMedia fails
    $('#step1-retry').click(function() {
      $('#step1-error').hide();
      step1();
    });

    // Get things started
    step1();
  });

  function step1() {
    // Get audio/video stream
    navigator.getUserMedia({
      audio: true,
      video: false
    }, function(stream) {
      // Set your video displays
      $('#my-audio').prop('src', URL.createObjectURL(stream));

      window.localStream = stream;
      step2();
    }, function() {
      $('#step1-error').show();
    });
  }

  function step2() {
    $('#step1, #step3').hide();
  }

  function step3(call) {
    // Hang up on an existing call if present
    if(window.existingCall) {
      window.existingCall.close();
    }

    // Wait for stream on the call, then set peer video display
    call.on('stream', function(stream) {
      $('#their-audio').prop('src', URL.createObjectURL(stream));
    });

    // UI stuff
    window.existingCall = call;
    $('#their-id').text(call.peer);
    call.on('close', step2);
    $('#step3').show();
  }
}