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
let nickName;

let caller = [];
let callee;

socket.on('session_type', (sessionType) => {
  this.sessionType = sessionType;
  if (sessionType == 'caller') {
    $("#session_init").modal({ backdrop: 'static', keyboard: false });
  }
  else {
    let modal = $("#session_init_callee");
    if ($("#sessionNickNameForCallee").val() == '') {
      modal.modal({ backdrop: 'static', keyboard: false });
    }
    else {
      $("#saveModalConfigButtonForCallee").trigger('click');
    }
    startWebRTCForCallee();
  }
  console.log('My Session Type:', sessionType);
});
socket.on('sendChat', (chatData) => {
  $("#liveChatConatiner").prepend('<p id="liveChat"><span class="userName">' + chatData['nickName'] + ': </span>' + chatData['message'] + '</p>')
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
    console.log("Number Of Calle:", numberOfCallee);
    for (let i = 0; i < numberOfCallee; i++) {
      let pc = new RTCPeerConnection(RTC_CONFIGURATION);
      pc.addStream(mediaStream);
      pc.onicecandidate = (event) => {
        if (event.candidate != null) {
          socket.emit('sendCandidateToCallee', { index: i, candidate: event.candidate, sessionId: SESSION_ID });
          console.log('Candidate Sent:', { index: i, candidate: event.candidate });
        }
      };
      pc.createOffer().then((offer) => {
        return pc.setLocalDescription(offer);
      }).then(() => {
        socket.emit('sendOffer', { index: i, offer: pc.localDescription, sessionId: SESSION_ID });
      });
      caller.push(pc);
    }
  });
  socket.on('candidateToCaller', (candidateData) => {
    console.log('Candidate Received:', candidateData['candidate']);
    caller[candidateData['index']].addIceCandidate(candidateData['candidate']);
  });
  socket.on('answer', (answerData) => {
    console.log('Answer Recieved:', answerData['answer'], caller[answerData['index']]);
    caller[answerData['index']].setRemoteDescription(answerData['answer']);
  });
  socket.on('requestOffer', (indexOfCallee) => {
    socket.emit('titleAndDetailToCallee', { sessionId: SESSION_ID, title: $("#sessionTitleInput").val(), detail: $("#sessionDetailInput").val(), index: indexOfCallee });
    let pc = new RTCPeerConnection(RTC_CONFIGURATION);
    pc.addStream(mediaStream);
    pc.onicecandidate = (event) => {
      if (event.candidate != null) {
        socket.emit('sendCandidateToCallee', { index: indexOfCallee, candidate: event.candidate, sessionId: SESSION_ID });
        console.log('Candidate Sent:', { index: indexOfCallee, candidate: event.candidate });
      }
    };
    pc.createOffer().then((offer) => {
      return pc.setLocalDescription(offer);
    }).then(() => {
      socket.emit('sendOffer', { index: indexOfCallee, offer: pc.localDescription, sessionId: SESSION_ID });
    });
    caller.push(pc);
  });
  socket.on('calleeDisconnected', (indexOfCallee) => {
    caller.splice(indexOfCallee);
  });
  socket.emit('getNumberOfCallee', SESSION_ID);
}
function startWebRTCForCallee() {
  socket.on('callerActive', (isCallerActive) => {
    if (isCallerActive == true) {
      let pc = new RTCPeerConnection(RTC_CONFIGURATION);
      pc.onicecandidate = (event) => {
        if (event.candidate != null) {
          socket.emit('sendCandidateToCaller', { candidate: event.candidate, sessionId: SESSION_ID });
          console.log('Candidate Sent:', { candidate: event.candidate });
        }
      };
      pc.onaddstream = (event) => {
        $(".videoStreaming")[0].srcObject = event.stream;
        console.log("Stream Added:", event.stream);
      };
      socket.on('candidateToCallee', (candidate) => {
        console.log('Candidate Received:', candidate);
        pc.addIceCandidate(candidate);
      });
      socket.on('offer', (offer) => {
        console.log('Offer Recieved:', offer);
        pc.setRemoteDescription(offer);
        pc.createAnswer().then((answer) => {
          return pc.setLocalDescription(answer);
        }).then(() => {
          socket.emit('sendAnswer', { answer: pc.localDescription, sessionId: SESSION_ID });
        });
      });
      socket.on('callerDisconnected', () => {
        makeAlert('세션 주최자의 연결이 끊겼습니다');
      });
      socket.on('titleAndDetail', (titleAndDetail) => {
        $("#sessionTitle").text(titleAndDetail['title']);
        $("#sessionDetail").text(titleAndDetail['detail']);
      });
      socket.emit('requestOffer', SESSION_ID);
      callee = pc;
    }
    else {
      let pc = new RTCPeerConnection(RTC_CONFIGURATION);
      pc.onicecandidate = (event) => {
        if (event.candidate != null) {
          socket.emit('sendCandidateToCaller', { candidate: event.candidate, sessionId: SESSION_ID });
          console.log('Candidate Sent:', { candidate: event.candidate });
        }
      };
      pc.onaddstream = (event) => {
        $(".videoStreaming")[0].srcObject = event.stream;
        console.log("Stream Added:", event.stream);
      };
      socket.on('candidateToCallee', (candidate) => {
        console.log('Candidate Received:', candidate);
        pc.addIceCandidate(candidate);
      });
      socket.on('titleAndDetail', (titleAndDetail) => {
        $("#sessionTitle").text(titleAndDetail['title']);
        $("#sessionDetail").text(titleAndDetail['detail']);
      });
      socket.on('offer', (offer) => {
        console.log('Offer Recieved:', offer);
        pc.setRemoteDescription(offer);
        pc.createAnswer().then((answer) => {
          return pc.setLocalDescription(answer);
        }).then(() => {
          socket.emit('sendAnswer', { answer: pc.localDescription, sessionId: SESSION_ID });
        });
      });
      socket.on('callerDisconnected', () => {
        makeAlert('세션 주최자의 연결이 끊겼습니다');
      });
      callee = pc;
    }
  });
  socket.on('callerDisconnected', () => {
    callee = undefined;
  });
  socket.emit('isCallerActive', SESSION_ID);
}

$(document).ready(() => {
  $("#sessionCode").val(SESSION_ID);
  console.log('My Sesesion Id:', SESSION_ID);
  socket.emit('join_session', SESSION_ID);
  $("#sessionInputScreenSelectButton").click(() => {
    navigator.mediaDevices.getDisplayMedia({ audio: false, video: true }).then((stream) => {
      mediaStream = stream;
    }).catch((e) => {
      $("#alertWrapper").append(makeError(e + ' 에러가 발생했습니다. 다시 시도해주세요'));
    })
  });
  $("#saveModalConfigButton").click(() => {
    if ($("#sessionNickName").val().trim() == '') {
      $("#alertWrapper").append(makeAlert('세션에서 사용할 닉네임을 적어주세요!'));
    }
    else if ($("#sessionTitleInput").val().trim() == '') {
      $("#alertWrapper").append(makeAlert('세션 제목을 적어주세요!'));
    }
    else if ($("#sessionDetailInput").val().trim() == '') {
      $("#alertWrapper").append(makeAlert('세션 설명을 적어주세요!'));
    }
    else if (mediaStream == undefined) {
      $("#alertWrapper").append(makeAlert('세션 송출 화면을 선택해주세요!'));
    }
    else {
      $("#alertWrapper").empty();
      $("#session_init").modal('hide');
      $(".videoStreaming")[0].srcObject = mediaStream;
      $("#sessionTitle").text($("#sessionTitleInput").val());
      $("#sessionDetail").text($("#sessionDetailInput").val());
      nickName = $("#sessionNickName").val().trim();
      let isPublic = ($("#customRadio1").val());
      alert(isPublic);
      socket.emit('titleAndDetail', { sessionId: SESSION_ID, title: $("#sessionTitleInput").val(), detail: $("#sessionDetailInput").val() });
      startWebRTCForCaller();
    }
  });
  $("#saveModalConfigButtonForCallee").click(() => {
    if ($("#sessionNickNameForCallee").val().trim() == '') {
      $("#alertWrapper").append(makeAlert('세션에서 사용할 닉네임을 적어주세요!'));
    }
    else {
      $("#session_init_callee").modal('hide');
      nickName = $("#sessionNickNameForCallee").val().trim();
    }
  });
  $("#sendChat").click(() => {
    socket.emit('sendChat', { sessionId: SESSION_ID, nickName: nickName, message: $("#chatBox").val().trim() });
    $("#chatBox").val('');
  });
});