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
let callees;

function makeAlert(msg) {
  $("#alertWrapper").empty();
  return '<div class="alert alert-warning alert-dismissible fade show w80 m-auto" id="formRequireAlert" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
}
function makeError(msg) {
  $("#alertWrapper").empty();
  return '<div class="alert alert-danger alert-dismissible fade show w80 m-auto" id="formRequireAlert" role="alert">' + msg + '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
}
function startWebRTC() {
  console.log("STARTWEBRTC")
  socket.on('sessionCalles', (callees) => {
    console.log(callees);
  });
  socket.emit('getSessionCalles', SESSION_ID);
}

socket.on('session_type', (sessionType) => {
  this.sessionType = sessionType;
  if (sessionType == 'caller') {
    $("#session_init").modal({ backdrop: 'static', keyboard: false });
  }
  console.log(sessionType);
});

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
      startWebRTC();
    }
  });
});