const socket = io.connect('http://localhost:8000/');
const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageContent = document.getElementById('message-content');

if(messageForm){
    //Create dialog input user
    const name = prompt("What's your name?");
    appendMessage('You joined');
    socket.emit('new-user', roomName, name);
    
    //Submit form message
    messageForm.addEventListener('submit', e => {
        //Ngan submit nua
        e.preventDefault();

        msg = messageInput.value;
        appendMessage(`You: ${msg}`);
        socket.emit('send-message',roomName, msg);
        messageInput.value = "";
    });
}
//event user-conneted
socket.on('user-connected', name => {
    appendMessage(`${name} connected!`);
});

//event user-disconnect
socket.on('user-disconnect', name => {
    appendMessage(`<strong> ${name}</strong> disconnected `);
});

//event show-message
socket.on('show-mes', (data) => {
    appendMessage(`<strong> ${data.name}</strong>: ${data.msg}`);
});

socket.on('user-online', (rooms,room) =>{
    appendUserOnline(rooms, room);
});


socket.on('room-created', room => {
    
    //create tag p with text = room
    roomName = document.createElement("p");
    roomName.innerText = room;

    //create tag a with link = /room and text = join
    roomLink = document.createElement("a");
    roomLink.innerText = "join";
    roomLink.href = `/${room}`;

    //append link and roomname
    roomContainer.append(roomName);
    roomContainer.append(roomLink);
});


//appendmessage
function appendMessage(msg){
    var content = "<p>"+ msg + "</p>";
    if("You joined" == msg) content = "<p style = 'background: #777676; display: inline-table; color: white; padding: 7px;'>"+ msg + "</p>";

    $("#message-content").append(content);
}

function appendUserOnline(rooms, room){
    $("#message-right").empty();
    for(x in rooms){
        if(x == room){
            let user = "";
            let arr_user = Object.values(rooms[x].users);
            for(i = 0; i< arr_user.length; i ++) $("#message-right").append("<p>" + arr_user[i]+" Online</p>");
        }
    }
}