var exports = module.exports = {};

let sessions = {};

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
      console.log('\nSession:', session_id, '\nCaller:', sessions[session_id]['caller'].id, 'Callee:', sessions[session_id]['callee'].length);
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
      sessions[candidateData['sessionId']]['caller'].emit('candidateToCaller', { index: sessions[candidateData['sessionId']]['callee'].findIndex((element) => { return element == socket; }), candidate: candidateData['candidate']});
    });

    socket.on('sendOffer', (offerData) => {
      console.log('Send Offer:', offerData['offer']);
      sessions[offerData['sessionId']]['callee'][offerData['index']].emit('offer', offerData['offer']);
    });

    socket.on('sendAnswer', (answerData) => {
      console.log('Send Answer:', answerData['answer']);
      sessions[answerData['sessionId']]['caller'].emit('answer', { index: sessions[answerData['sessionId']]['callee'].findIndex((element) => { return element == socket; }), answer: answerData['answer'] });
    });

    socket.on('disconnect', () => {
      Object.keys(sessions).forEach((value1, index) => {
        if (sessions[value1]['caller'] == socket) {
          sessions[value1] = undefined;
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