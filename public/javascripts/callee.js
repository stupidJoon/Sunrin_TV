const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com'
    }
  ]
};

var socket = io.connect('https://sunrintv.kro.kr');
var callee = new RTCPeerConnection(RTC_CONFIGURATION);

// make eventlistener when caller send candidate
socket.on('candidate', (candidate) => {
  console.log('Candidate Received:', candidate);
  callee.addIceCandidate(candidate);
});
// make eventlistener when caller send offer
socket.on('offer', (offer) => {
  console.log('Offer Received:', offer);
  callee.setRemoteDescription(offer);
  callee.createAnswer().then((answer) => {
    return callee.setLocalDescription(answer);
  }).then(() => {
    socket.emit('answer', { answer: callee.localDescription });
  });
});

function startWebRTC() {
  // make eventlistener when stream add
  callee.onaddstream = (event) => {
    $("#screen")[0].srcObject = event.stream;
  };
  // make eventlistener when ice candidate
  callee.onicecandidate = (event) => {
    if (event.candidate != null) {
      socket.emit('candidate', { candidate: event.candidate });
      console.log('Candidate Sent:', event.candidate);
    }
  };
}

$(document).ready(() => {
  // send socket that i'm callee 
  socket.emit('join', 'callee');
  // start WebRTC connection
  startWebRTC()
});
