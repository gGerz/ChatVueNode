let vueApp = new Vue({
  el: '#app',
  data () {
    return {
      isAuthStatus: false,
      username: localStorage.getItem('NodeVueChatAuthName') || '',
      currentUser: {},
      userList: [],
      socket: null,
      newMessage: '',
      messages: []
    }
  },
  methods: {
    setUsername () {
      this.currentUser.username = this.username
      localStorage.setItem('NodeVueChatAuthName', this.username)
      this.isAuthStatus = true
    },
    setAnonim () {
      this.isAuthStatus = true
    },
    logOut () {
      localStorage.removeItem('NodeVueChatAuthName')
      this.isAuthStatus = false
      this.username = ''
    },
    checkAuthStatus () {
      if (localStorage.getItem('NodeVueChatAuthName')){
        this.isAuthStatus = true
      } else {
        this.isAuthStatus = false
      }
    },

    sendMessage () {
      this.socket.emit('sendMessage', this.newMessage, this.username.length > 0 ? this.username : 'Аноним')
    }
  },

  created () {
    let self = this

    // подключаем сокет
    this.socket = io.connect()


    this.socket.on('addMessageInChat', function (message, username, date) {
      self.messages.unshift({
        user: username,
        message: message,
        date: date
      })
      self.newMessage = ''
    })

    this.socket.on('sendNotification', function (message, username) {
      if (self.username !== username){
        let notification = new Notification(`${username} оставил новое сообщение:`,
          { body: message, dir: 'auto', icon: 'icon.jpg' }
        );
      }
    })


    this.socket.on('addUserInList', function (user) {
      self.userList.push(self.username !== '' ? self.username : user)
    })

    this.socket.on('setUserList', function (userList) {
      console.log(userList)
      self.userList = userList

    })

    // Получаем инфу при заходе на страницу
    this.socket.on('connect', function (data) {
      self.socket.emit('storeClientInfo', localStorage.getItem('NodeVueChatAuthName') || 'Аноним');
    });

    // Получаем все необходимые данные от сервера
    this.socket.on('setData', function (userList, messageList) {
      self.userList = userList
      self.messages = messageList
    });


  },

  mounted () {
    this.checkAuthStatus()

    Notification.requestPermission(function(permission){

    });
  }
})