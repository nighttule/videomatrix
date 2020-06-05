// SERVER

/*
1. обработка подключения клиента - логин-пароль
2. звпись регитрационной инфы
3. обработка залогинивания
4. выдача конфиденциальной инфы
*/

//import * as jwt from 'jsonwebtoken';
//import * as argon2 from 'argon2';

const usersDB = 'C://Users//BigBird//Desktop//users.txt';
const jwts = 'jwts.txt';
const fs = require('fs');
const WebSocket = require('ws');
var mysql = require('mysql');
//var mysql = require('mysql');


class User {
	constructor(login, pass) {
		this.login = login;
		this.pass = pass;

		this.registerUser()
	}
	
	registerUser() {
		//TODO1: write in DB
		//TODO2: hash log-pass
		let res = this.login + '|' + this.pass + '\n';
		fs.appendFile(usersDB, res, function (err) {
		  if (err) throw err;
		  console.log('Saved!');
		});
	}
	
}

class LogInfo {
	constructor(login, pass, time) {
		this.login = login;
		this.pass = pass;
		this.time = time;
	}
}

function isUserInDB(login) {
	let db = fs.readFileSync(usersDB, 'utf8');
	let result = db.match(login);
	if (result == null)
		return false;
	return true;
}

function isUserPasswordCorrect(pass) {
	let db = fs.readFileSync(usersDB, 'utf8');
	let result = db.match(login + '-' + '(.+)');
	if (res[1] == pass)
		return true;
	return false;
}

function generateJWT(user) {
	/*
	const data =  {
      name: user.name,
      email: user.email
    };
    const signature = 'MySuP3R_z3kr3t';
    const expiration = '6h';

    return jwt.sign({ data, }, signature, { expiresIn: expiration });
	*/
	
	return 'ha';
}

function setUpRSAConnection() {
	
}

function messageHandler(msg, socket) {
	
}


let clients = {};
let id = 0;

// WebSocket-сервер на порту 8081
let wss = new WebSocket.Server({ port: 3000 });
wss.on('connection', function(ws) {
	clients[id] = ws;
	console.log("new connection",id);

	ws.on('message', function(message) {
		console.log('recv', message);

		for (var key in clients) {
			messageHandler(message, clients[key]);
		}
	});

	ws.on('close', function() {
		console.log('соединение закрыто ' + id);
		delete clients[id];
	});
});