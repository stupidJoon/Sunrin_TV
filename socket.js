var exports = module.exports = {};

let nsp = { };

module.exports.on = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);
    socket.on('disconnected', () => {
      console.log('Socket Disconnected', socket.id);
    });
  });
}