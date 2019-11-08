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
const SESSION_ID = location.href.split('/')[4];
const socket = io.connect('');

let sessionType;
let mediaStream;

socket.on('session_type', (sessionType) => {
  this.sessionType = sessionType;
  if (sessionType == 'caller') {
    $("#session_init").modal({ backdrop: 'static', keyboard: false });
  }
  else {
    startWebRTCForCallee();
  }
  console.log(sessionType);
});
socket.on('candidate', (data) => {
  console.log('Received Sent:', data['candidate']);
  callers[data['id']].addIceCandidate(data['candidate']);
});
socket.on('answer', (data) => {
  console.log('Answer Recieved:', data);
  callers[data['id']].setRemoteDescription(data['answer']);
});

function makeAlert(msg) {
  $("#alertWrapper").empty();
  return '<div class="alert alert-warning alert-dismissible fade show w80 m-auto" id="formRequireAlert" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
}
function makeError(msg) {
  $("#alertWrapper").empty();
  return '<div class="alert alert-danger alert-dismissible fade show w80 m-auto" id="formRequireAlert" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
}
function startWebRTCForCaller() {
  socket.on('numberOfCallee', (numberOfCallee) => {
    for (let i = 0; i < numberOfCallee; i++) {
      let pc = new RTCPeerConnection(RTC_CONFIGURATION);
      pc.addStream(mediaStream);
      pc.onicecandidate = (event) => {
        if (event.candidate != null) {
          socket.emit('sendCandidate', { index: i, candidate: event.candidate, sessionId: SESSION_ID });
          console.log('Candidate Sent:', { index: i, candidate: event.candidate });
        }
      };
    }
  });
  socket.emit('getNumberOfCallee', null);
}
function startWebRTCForCallee() {
  let pc = new RTCPeerConnection(RTC_CONFIGURATION);
  socket.on('candidate', (candidate) => {
    console.log('Candidate Received:', candidate);
    callee.addIceCandidate(candidate);
  })
}

$(document).ready(() => {
  console.log(SESSION_ID);
  socket.emit('join_session', SESSION_ID);
  $("#sessionInputScreenSelectButton").click(() => {
    navigator.mediaDevices.getDisplayMedia({ audio: false, video: true }).then((mediaStream) => {
      this.mediaStream = mediaStream;
    }).catch((e) => {
      $("#alertWrapper").append(makeError(e + ' 에러가 발생했습니다. 다시 시도해주세요'));
    })
  });
  $("#saveModalConfigButton").click(() => {
    if ($("#sessionTitle").val().trim() == '') {
      $("#alertWrapper").append(makeAlert('세션 제목을 적어주세요!'));
    }
    else if ($("#sessionDetail").val().trim() == '') {
      $("#alertWrapper").append(makeAlert('세션 설명을 적어주세요!'));
    }
    else if (this.mediaStream == undefined) {
      $("#alertWrapper").append(makeAlert('세션 송출 화면을 선택해주세요!'));
    }
    else {
      $("#alertWrapper").empty();
      $("#session_init").modal('hide');
      $(".videoStreaming").srcObject = mediaStream;
      startWebRTCForCaller();
    }
  });
});