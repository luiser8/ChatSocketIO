    var socket = io()
    socket.on("chat", addChat)
    $(() => {
        getChats()

        $("#send").click(() => {
            var chatMessage = {
                name: $("#txtName").val(), chat: $("#txtMessage").val()
            }
            postChat(chatMessage)
            $("#txtMessage").val('')
            $("#txtMessage").focus()
        })
    })

    function postChat(chat) {
        $.post("http://192.168.59.50:3020/add", chat)
    }

    function getChats() {
        $.get("/chats", (chats) => {
            chats.forEach(addChat)
        })
    }

    function addChat(chatObj) {
        $("#messages").prepend(`<div class='panel panel-default'>
                                    <div class='panel-heading'>
                                    <h4>${chatObj.name} </h4>
                                </div>
                                    <div class='panel-body'>
                                        <span>${chatObj.chat}</span> <a class='pull-right' href='/delete?id=${chatObj._id}'><i class="fa fa-trash fa-2x" aria-hidden="true"></i></a>
                                    </div>
                                </div>`);
    }