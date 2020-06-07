
src="/socket.io/socket.io.js"
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

const WebSocket = require('ws');
var socket = new WebSocket('ws://localhost:3000');

let pubKey;

socket.on('message', function incoming(data) {
	pubKey = JSON.parse(data);
	console.log('Got public key: ', pubKey);
	
	let msg = 'here i am';
	console.log('Want to encode this msg: > %s <', msg);
	let rsa = new RSAClient(pubKey[0], pubKey[1]);
	let encodedMsg = rsa.getJSONEncodedMessage(msg);
	
	socket.send(encodedMsg);
});
