let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (request, response) {
  response.sendFile(__dirname +'/index.html');
});

app.use(express.static('public'));

let clients = [];
let chatMessages = []

io.sockets.on('connection', function(socket){
  console.log('Пользователь зашел в беседу')


  socket.on('storeClientInfo', function (data) {
    var clientInfo = {};
    clientInfo.customId = data.customId;
    clientInfo.clientId = socket.id;
    clients.push(clientInfo);
    io.sockets.emit('addUserInList', clientInfo)
    io.sockets.emit('setData', clients, chatMessages)
  });

  socket.on('disconnect', function (data) {
    console.log("Пользователь вышел из беседы")
    for ( let i = 0; i < clients.length; i++ ){
      let client = clients[i];

      if(client.clientId === socket.id){
        clients.splice(i,1);
        io.sockets.emit('setUserList', clients)
        break;
      }
    }
  });

  socket.on('sendMessage', function (newMessage, username) {
    let newDate = new Date()
    let date = `${newDate.getMonth()}.${newDate.getDate()} ${newDate.getHours()}:${newDate.getMinutes()}`
    io.sockets.emit('addMessageInChat', newMessage, username, date)
    chatMessages.unshift({
      user: username,
      message: newMessage,
      date: date
    })
  });


});