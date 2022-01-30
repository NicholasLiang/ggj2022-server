const WebSocketServer = require('ws').WebSocketServer;

const wss = new WebSocketServer({ port: process.env.PORT || 3000 });

var client_n = 0;
var rooms = [];
var room_n = 0;

var enc = new TextEncoder(); // always utf-8

wss.on('connection', function connection(ws) {
    ws.on('open', function open() {
    });

    ws.on('message', function incoming(message) {
        // console.log('received: %s', message);

        const msg = message.toString().split('/');

        switch (msg[0]) {
            case 'Request Client ID':
                ws.send(enc.encode('You are client/' + client_n));
                client_n += 1;

                break;
            case 'Request Room List':
                // console.log('get room list');
                // console.log(rooms);

                message = 'Room Request/'

                rooms.forEach((room) => {
                    message += room.name + "/";
                });

                ws.send(enc.encode(message));

                break;
            case 'Create Room':
                // console.log('creating room ' + msg[1] + " id: " + msg[2]);

                newRoom = { id: room_n, name: msg[1], red: parseInt(msg[2]), blue: -1, full: false, data: {}};
                rooms.push(newRoom);
                room_n += 1;

                ws.send(enc.encode('You are in room/' + newRoom.id));

                break;
            case 'Join Room':
                // console.log('joining room ' + msg[1] + " id: " + msg[2]);

                var roomid = parseInt(msg[1]);

                if (rooms[roomid].full)
                {
                    ws.send(enc.encode('Room is full'));
                    break;
                }

                rooms[roomid].blue = parseInt(msg[2]);
                rooms[roomid].full = true;

                // console.log(rooms[roomid]);

                ws.send(enc.encode('You are in room/' + msg[1]));
                break;
            case 'Start Room':
                // console.log('start game!');

                var roomid = parseInt(msg[1]);
                var clientId = parseInt(msg[2]);

                if (rooms[roomid].red == clientId)
                {
                    ws.send(enc.encode("You are Red"));
                } else {
                    ws.send(enc.encode("You are Blue"));
                }
                break;
            case 'Init Room Data':
                // console.log('Initialing Room Data');
                var roomid = parseInt(msg[1]);

                var newRoomData = {
                    red_pos_x: 0,
                    red_pos_y: 0,
                    red_velo_x: 0,
                    red_animationState: 0,
                    blue_pos_x: 0,
                    blue_pos_y: 0,
                    blue_velo_x: 0,
                    blue_animationState: 0,
                }

                rooms[roomid].data = newRoomData;
                break;


            case 'Request Room Data':
                // console.log('Sending Room Data');
                var roomid = parseInt(msg[1]);

                message = "Game Data/"

                Object.entries(rooms[roomid].data).forEach(([key, value]) => {
                    // console.log(key, value);
                    message += value + "/";
                });

                message += "finished";

                ws.send(enc.encode(message));

                break;
            case 'Send Local Data':
                // console.log('receiving Room Data');

                var roomid = parseInt(msg[1]);
                var clientid = parseInt(msg[2]);
                var isRed = parseInt(msg[3]);

                if (isRed) {
                    rooms[roomid].data.red_pos_x = parseFloat(msg[4]);
                    rooms[roomid].data.red_pos_y = parseFloat(msg[5]);
                    rooms[roomid].data.red_velo_x = parseFloat(msg[6]);
                    rooms[roomid].data.red_animationState = parseFloat(msg[7]);
                } else {
                    rooms[roomid].data.blue_pos_x = parseFloat(msg[4]);
                    rooms[roomid].data.blue_pos_y = parseFloat(msg[5]);
                    rooms[roomid].data.blue_velo_x = parseFloat(msg[6]);
                    rooms[roomid].data.blue_animationState = parseFloat(msg[7]);
                }
                break;
                // console.log(rooms[roomid].data);
            case "Make a bullet":
                console.log('received: %s', message);

                var roomid = parseInt(msg[1]);
                var direction = parseInt(msg[2]);
                var x = parseInt(msg[3]);
                var y = parseInt(msg[4]);
                var z = parseInt(msg[5]);

                message = "Shoot a bullet/" + rooms[roomid].red + "/" + rooms[roomid].blue + "/" + direction + "/" + x + "/" + y + "/" + z;

                wss.clients.forEach((client) => {
                    client.send(enc.encode(message));
                });

                break;
            case "You have dead":
                console.log("dead event");
                var roomid = parseInt(msg[1]);

                message = "Dead Event/" + rooms[roomid].red + "/" + rooms[roomid].blue;

                wss.clients.forEach((client) => {
                    client.send(enc.encode(message));
                });
                
                break;

            default:
                break;
        }
        
    });

    ws.on('close', function close() {
        console.log('disconnected');
    });

});

// var broadcastMessage = "hi";

// setInterval(() => {
//     wss.clients.forEach((client) => {
//         client.send(broadcastMessage);
//     });
// }, 100);