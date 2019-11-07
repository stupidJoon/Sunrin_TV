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

    socket.on('getSessionCalles', (sessionId) => {
      socket.emit('sessionCalles', sessions[sessionId]['callee']);
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