//CLIENT

/*
1. подключение к серверу
2. регистрация
3. запрос аут информации
*/ 
const WebSocket = require('ws');
var socket = new WebSocket('ws://localhost:3000');


socket.on('message', function incoming(data) {	
	let msg = 'here i am';
	console.log('Want to encode this msg: > %s <', msg);
	
	socket.send('rsa');
});

// показать сообщение в div#subscribe


// socket.on('message', function incoming(data) {
	// if (data.startsWith('!on')) {
		// socket.send('log|pass');
		// console.log('login and password was sent')
	// }

	
	// if (data.startsWith('!jwt')) {
		// console.log(data);
		// socket.close();
	// }
	
	// if (data.startsWith('wait')) {
	// }
	
// });

socket.send('rsa');