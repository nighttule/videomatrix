//client
class RSAClient {
	constructor(publicExponent, modulo) {
		this.publicExponent = publicExponent;
		this.modulo = modulo;
	}
	
	encodeMessage(msg) {
		let translateMessage = [Math.floor(Math.random() * 207  + 48)];
		msg.split('').forEach(c => 
			translateMessage.push((c.charCodeAt(0) + translateMessage[translateMessage.length - 1]) % this.modulo));
		
		let cipheredMessage = [];		
		for (let m in translateMessage) {
			cipheredMessage.push(translateMessage[m] ** this.publicExponent % this.modulo);
		}
		
		return cipheredMessage;
	}
	
	getJSONEncodedMessage(msg) {
		let encMsg = this.encodeMessage(msg);
		
		return JSON.stringify(encMsg);
	}
}

let user = {login: 'login', pass: 'password'};

const WebSocket = require('ws');
var socket = new WebSocket('ws://localhost:3000');

socket.onopen = function(event) {
  socket.send("rsa"); 
};

socket.onmessage = function(event) {
	console.log('recv', event.data);
	if (event.data.startsWith('rsa')) {
		let pubKey = JSON.parse(event.data.substring(3));
		let rsa = new RSAClient(pubKey[0], pubKey[1]);
		let userData = JSON.stringify(user);
		let encodedUserData = rsa.getJSONEncodedMessage(userdata);
		socket.send('usr' + encodedUserData);
	}
	if (event.data.startsWith('close')) {
		socket.close();
	}
}

// socket.on('message', function incoming(data) {
	// let pubKey = JSON.parse(data);
	// let rsa = new RSAClient(pubKey[0], pubKey[1]);
	
	// let userData = JSON.stringify(user);
	// let encodedUserData= rsa.getJSONEncodedMessage(userdata);
	
	// socket.send(encodedMsg);
// });
