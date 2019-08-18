const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

//Set thuc muc views
app.set('views', './views');
app.set('view engine', 'ejs');

// tro toi thu muc public
app.use(express.static('public'));

//Phan tich code trong phan body.
app.use(express.urlencoded({extended: true}));

const rooms = {};

app.get('/', function(req, res){
    res.render('index', {rooms: rooms});
});

app.post('/room', function(req, res){
    if(rooms[req.body.room] != null) return res.redirect('/');
    //add protoype for rooms => {'p1' : {users: {'absdfsf324234c' : 'aaaa'} }}
    rooms[req.body.room] = {users: {}};
    res.redirect(req.body.room);
    io.emit('room-created', req.body.room);
});

app.get('/:room', function(req, res){
    
    //Check room not exists then return home
    if(!rooms[req.params.room]) return res.redirect('/');
    res.render('room', {roomName: req.params.room});

    //req.params.room lay tu phan head (url)
    //req.body lay tu phan body (POST)
    

});

io.on('connection', socket => {
    socket.on('new-user', (room,name) => {
        
        //join room
        socket.join(room);
        //{ p1: { users: { 'pKTwRgiRAHI-t8AeAAAF': 'Tuan' } } }
        rooms[room].users[socket.id] = name;

        //broadcast send all client to room expect sender
        socket.to(room).broadcast.emit('user-connected', name);

        //send all client in room including sender.
        io.in(room).emit('user-online', rooms, room);
    });

    socket.on('send-message', (room, msg) =>{
        //event show-mes send to client with two param (msg, username send)
        socket.to(room).broadcast.emit('show-mes', {msg: msg, name: rooms[room].users[socket.id]});
    });
    
    socket.on('disconnect', () => {
        //get room of user
        for(room in rooms){
            if(rooms[room].users[socket.id] != null){
                socket.to(room).broadcast.emit('user-disconnect', rooms[room].users[socket.id]);
                delete rooms[room].users[socket.id];
                io.in(room).emit('user-online', rooms, room);
            }
        }
    });
});

server.listen(8000);