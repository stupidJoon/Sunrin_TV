var exports = module.exports = {};

let sessions = {};

function getIndexOfCallee(sessionId, callee) {
  return sessions[sessionId]['callee'].findIndex((element) => { return element == callee; })
}

module.exports.on = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);
    
    socket.on('join_session', (session_id) => {
      if (sessions[session_id] == undefined) {
        sessions[session_id] = { 'caller': socket, 'callee': [] };
        socket.emit('session_type', 'caller');
      }
      else {
        sessions[session_id]['callee'].push(socket);
        socket.emit('session_type', 'callee');
      }
      console.log('\nSession:', session_id, '\nCaller:', (sessions[session_id]['caller'] != undefined) ? sessions[session_id]['caller'].id : null, 'Callee:', sessions[session_id]['callee'].length);
    });

    socket.on('getNumberOfCallee', (sessionId) => {
      console.log('Number Of Calle:', sessions[sessionId]['callee'].length)
      socket.emit('numberOfCallee', sessions[sessionId]['callee'].length);
    });

    socket.on('sendCandidateToCallee', (candidateData) => {
      console.log('Send Candidate To Callee:', candidateData['candidate']);
      sessions[candidateData['sessionId']]['callee'][candidateData['index']].emit('candidateToCallee', candidateData['candidate']);
    });

    socket.on('sendCandidateToCaller', (candidateData) => {
      console.log('Send Candidate To Caller:', candidateData['candidate']);
      sessions[candidateData['sessionId']]['caller'].emit('candidateToCaller', { index: getIndexOfCallee(candidateData['sessionId'], socket), candidate: candidateData['candidate']});
    });

    socket.on('sendOffer', (offerData) => {
      console.log('Send Offer:', offerData['offer']);
      sessions[offerData['sessionId']]['callee'][offerData['index']].emit('offer', offerData['offer']);
    });

    socket.on('sendAnswer', (answerData) => {
      console.log('Send Answer:', answerData['answer']);
      sessions[answerData['sessionId']]['caller'].emit('answer', { index: getIndexOfCallee(answerData['sessionId'], socket), answer: answerData['answer'] });
    });

    socket.on('isCallerActive', (sessionId) => {
      socket.emit('callerActive', sessions[sessionId]['caller'] != undefined);
    });

    socket.on('requestOffer', (sessionId) => {
      sessions[sessionId]['caller'].emit('requestOffer', getIndexOfCallee(sessionId, socket));
    });

    socket.on('disconnect', () => {
      Object.keys(sessions).forEach((value1, index) => {
        if (sessions[value1]['caller'] == socket) {
          sessions[value1]['caller'] = undefined;
        }
        else {
          sessions[value1]['callee'].forEach((value2, index) => {
            if (value2 == socket) {
              sessions[value1]['callee'].splice(index);
            }
          });
        }
      });
      console.log('Socket Disconnected', socket.id);
    });

  });
}