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

let socket = io.connect('https://sunrintv.kro.kr');
let callee = new RTCPeerConnection(RTC_CONFIGURATION);

socket.on('candidate', (candidate) => {
  console.log('Candidate Received:', candidate);
  callee.addIceCandidate(candidate);
});
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
  callee.onaddstream = (event) => {
    $("#screen")[0].srcObject = event.stream;
    console.log("Stream Added:", event.stream);
  };
  callee.onicecandidate = (event) => {
    if (event.candidate != null) {
      socket.emit('candidate', { candidate: event.candidate });
      console.log('Candidate Sent:', event.candidate);
    }
  };
  callee.oniceconnectionstatechange = () => {
    if (callee.iceConnectionState === "disconnected") {
      callee.close();
    }
  };
}

$(document).ready(() => {
  $("#screen")[0].oncanplay = () => {
    $("#screen")[0].play();
  }
  socket.emit('join', 'callee');
  startWebRTC()
});
