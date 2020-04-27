/* eslint-disable */
(function () {
  var chatSocket = io('/chat');
  var clicked = false;
  var timer = null;

  function animateScroll() {
    var container = $('#containerMessages');
    if (!clicked)
      container.animate({ "scrollTop": $('#containerMessages')[0].scrollHeight }, "fast");
  }

  function isEmptyObject(obj) {
    var name;
    for (name in obj) {
      return false;
    }
    return true;
  }

  function strip(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  function getMessages() {
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/chatroom/messages',
      success: function (response) {
        if (response.messages) {
          response.messages.reverse()
            .map(function (message) {
              updateFeed(message, 'prepend');
            });
        }

        chatSocket.on('chat', function (message) {
          message = JSON.parse(message);
          updateFeed(message, 'append');
          animateScroll();
        })
      }
    })
  }

  function updateFeed(message, where) {
    // keep only last 50 messages
    $('#chatMsgs p').slice(0, -49).detach()
    var messageType = 'bg-light text-dark';
    var messageNameHtml = '<strong>' + message.name + ': </strong> ';
    var messageTime = ' <small class="ml-4 font-italic"> ' + message.time + '</small>';

    if (message.type === 'bot') {
      messageType = 'alert-warning text-center';
      messageTime = '';
    }
    if (['bot'].indexOf(message.type) === -1 && user === message.name) {
      messageNameHtml = '';
      messageType = 'alert-success text-right';
      messageTime = ' <small class="ml-4 font-italic"> ' + message.time + '</small>';
    }

    var newMessage = '<p class="col-md-12 ' + messageType + '">' + messageNameHtml + strip(message.message) + messageTime + '</p>';
    // append if is a new created message, prepend if adding messages on login
    if (where === 'append') {
      $('#chatMsgs').append(newMessage);
    } else if (where === 'prepend') {
      $('#chatMsgs').prepend(newMessage);
    }
  }

  $('#containerMessages').on({
    mousedown: function () {
      clicked = true;
      $('#containerMessages').stop(true, true);
    },
    scroll: function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        clicked = false;
      }, 2000);
    }
  });

  $(document).ready(function () {
    chatSocket.emit('loginUser', user);
    chatSocket.on('updateUsers', function (usersOnline) {
      $('#chatUsers').html('');
      if (!isEmptyObject(usersOnline)) {
        $.each(usersOnline, function (key, val) {
          $('#chatUsers').append('<p class="col-md-12 alert-info">' + key + '</p>');
        })
      }
    });
    getMessages();
    animateScroll();

    $('#chatForm').on('submit', function (e) {
      e.preventDefault();

      var data = $('#chatForm').serialize();

      $.ajax({
        type: 'POST',
        url: '/chatroom/messages',
        processData: false,
        data: data,
        timeout: 1500,
        success: function () {
          $('#message').val('');
        },
        error: function () {
          location.reload();
        }
      });
    });
  })
})();
