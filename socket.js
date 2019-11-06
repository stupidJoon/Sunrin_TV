var exports = module.exports = {};

let caller;
let callee = [];

function webRTC(io) {
  io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);
    socket.on('join', (room) => {
      if (room == 'caller') {
        socket.join(room);
        caller = socket;
      }
      else if (room == 'callee') {
        socket.join(room);
        callee.push(socket);
      }
      else {
        throw new Error('Neither Caller and Callee');
      }
      console.log(socket.id, 'is', room);
    });
    socket.on('getNumberOfCallee', () => {
      socket.emit('numberOfCallee', callee.length);
    });
    socket.on('candidate', (data) => {
      if (socket == caller) {
        callee[data['id']].emit('candidate', data['candidate']);
      }
      else if (callee.includes(socket)) {
        caller.emit('candidate', { id: callee.indexOf(socket), candidate: data['candidate'] });
      }
    });
    socket.on('offer', (data) => {
      callee[data['id']].emit('offer', data['offer']);
    });
    socket.on('answer', (data) => {
      caller.emit('answer', { id: callee.indexOf(socket), answer: data['answer']});
    });
    socket.on('disconnect', () => {
      if (socket == caller) {
        caller = null;
      }
      else if (callee.includes(socket)) {
        callee.splice(callee.indexOf(socket), 1);
      }
    });
  });
}

module.exports.on = (io) => {
  webRTC(io)
}