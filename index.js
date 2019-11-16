let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (request, response) {
  response.sendFile(__dirname +'/index.html');
});

let clients = [];

io.sockets.on('connection', function(socket){
  console.log('Пользователь зашел в беседу')


  socket.on('storeClientInfo', function (data) {
    var clientInfo = {};
    clientInfo.customId = data.customId;
    clientInfo.clientId = socket.id;
    clients.push(clientInfo);
    io.sockets.emit('addUserInList', clientInfo)
  });

  socket.on('disconnect', function (data) {
    console.log("Пользователь вышел из беседы")
    for ( let i = 0; i < clients.length; i++ ){
      let client = clients[i];

      if(client.clientId === socket.id){
        clients.splice(i,1);
        break;
      }
    }
  });

  socket.on('sendMessage', function (newMessage) {
    io.sockets.emit('addMessageInChat', newMessage)
  });


});