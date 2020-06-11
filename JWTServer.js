//server
const ws = new require('ws');
const mysql = new require('mysql');
const jwToken = new require('jsonwebtoken')
//////////////////////////////////////////

db = { host: 'localhost', 
	user: 'diana', 
	pass: '135PooK113VfQ', 
	name: 'usersInfo' 
	};

class RSAServer {
	constructor() {
		this.primeNumberValency = 2000;
		const [prNum1, prNum2] = [this.findPrimeNumber(), this.findPrimeNumber()];
		this.modulo = prNum1 * prNum2;
		this.eilerFunc = (prNum1 - 1) * (prNum2 - 1);
		this.publicExponent = this.getPublicExponent(this.eilerFunc);
		this.secretExponent = this.getSecretExponent(this.eilerFunc, this.publicExponent);
		
		console.log([prNum1, prNum2]);
		console.log('eiler func', this.eilerFunc);
		console.log('public key ', this.publicExponent);
		console.log('secret key ', this.secretExponent);
	}
	
	getPubKeyToJSON() {
		let publicKey = [this.publicExponent, this.modulo];
		return JSON.stringify(publicKey);
	}
	
	findPrimeNumber() {
		let primeNumber = Math.floor(Math.random() * primeNumberValency) + primeNumberValency;
		let divider = 2;
		while (divider < this.primeNumberValency) {
			if (primeNumber > 2 * this.primeNumberValency) {
				primeNumber = this.findPrimeNumber();
			}
			if (primeNumber % divider == 0 && primeNumber > divider) {
				primeNumber++;
				divider = 1;
			}
			divider++;
		}
		
		return primeNumber; 
	}
	
	getSecretExponent() {
		let a = this.eilerFunc;
		let b = this.publicExponent;
		let dividers = [];
		let x = [];
		let y = [];
		while (a != 0 && b != 0) {
			if (a > b) {
				dividers.push(Math.floor(a / b));
				a %= b;
			}
			else {
				dividers.push(Math.floor(b / a));
				b %= a;
			}
			x.push(0);
			y.push(0);
		}		
		
		x[dividers.length - 1] = 0;
		y[dividers.length - 1] = 1;
		
		for (let i = x.length - 2; i > -1; i--) {
			x[i] = y[i + 1];
			y[i] = x[i + 1] - y[i+1] * dividers[i];
		}
		
		return y[0] > 0 ? y[0] % this.eilerFunc : y[0] % this.eilerFunc + this.eilerFunc;
	}
	
	getPublicExponent() {
		let exps = [5, 7, 11, 17 ];
		for (let e in exps) {
			if (this.eilerFunc % exps[e] != 0) {
				return exps[e];
			}
		}
	}
	
	moduloMultiply(m, e, n) {
		if (e == 0) {
			return 1;
		}
		if (e % 2 == 0) {
			return this.moduloMultiply(m, (e / 2), n) ** 2 % n;
		}
		else {
			return (m * this.moduloMultiply(m, (e - 1), n)) % n;
		}
	}

	decodeMessage(msg) {
		let t = [];
		let decodedMessage = [];
		let decodedSymbol = 0;
		for (let m = 0; m < msg.length; m++) {
			let a = this.moduloMultiply(msg[m], this.secretExponent, this.modulo);
			t.push(a);
			if (m > 0) {
				decodedSymbol = (a - t[m - 1]) > 0 ? (a - t[m - 1]) % this.modulo : (a - t[m - 1]) % this.modulo + this.modulo;
				decodedMessage.push(String.fromCharCode(decodedSymbol));
			}
			else {
				decodedSymbol = a;
			}
		}
		
		return decodedMessage.join('');
	}
}

class User {
	constructor(userInfo, regTime) {
		this.login = userInfo.login;
		this.pass = userInfo.pass;
		this.regTime = regTime;
	}
}

function createJWT(id, user) {
	const data =  {
      id: id.toString(),
      login: user.login,
      regTime: user.regTime
    };
	
	const signature = "V1de0matr1xxx";
    const expiration = '6h';
    return jwToken.sign(data, signature, { algorithm: "HS256", expiresIn: expiration });
}

function getJWT(db, user) {
	let con = connectToDB(db);
	let sql = "SELECT jwt FROM Users WHERE login = '$user.login'";
	return doDBRequest[0];
}

function refreshJWT(db, jwt) {
	if (isJWTValid) {
		//TODO decode
		let newJWT;
		let login;
		let con = connectToDB(db);
		let sql = "INSERT INTO Users (jwt) VALUES ($newJWT) WHERE login = '$login'";
	}
	else {
		return null;
	}
	
}

function isJWTValid(jwt, signature) {
	try {
		jwt.verify(token, signature, function(err, decoded) {
			console.log(decoded.data) 
		});
		const { exp } = jwToken.decode(jwt);
		if (Date.now() >= exp * 1000) {
			return false;
		}
	  } 
	catch (err) {
		return false;
	}
}

function server() {
	const WebSocket = require('ws');
	const wss = new WebSocket.Server({ port: 3000 });

	let rsa = new RSAServer()

	wss.on('connection', function connection(ws) {
		ws.send(rsa.getPubKeyToJSON());
		console.log('Public key was sent: ', rsa.getPubKeyToJSON());
		
		let userInfo = 0; 
		
		ws.on('message', function incoming(message) {
			userInfo = JSON.parse(message);
			console.log('Received info: ', userInfo);
			data = rsa.decodeMessage(userInfo);
			console.log('Decoded data: ', data);
			ws.send(data);
		});
	});
}

class DBManager {
	constructor(db) {
		this.db = db;
		this.createDB();
		this.connection = this.connectToDB();
	}
	
	connectToDB() {
		return mysql.createConnection({
		  host: this.db.host,
		  user: this.db.user,
		  password: this.db.pass,
		  database: this.db.name
		});
	}
	
	createDB() {
		let con = mysql.createConnection({
			host: db.host,
			user: db.user,
			password: db.pass,
		});
		let sql = "CREATE DATABASE IF NOT EXISTS usersInfo";

		this.doDBRequest(sql);
	}

	doDBRequest(sql) {
		let res;
		let con = this.connection;
		
		return new Promise(data => {
			console.log('con', con);
			con.query(sql, function (error, result) { // change db->connection for your code
				if (error) {
					console.log('promise error', error);
				}
				try {
					console.log('result', result);
					data(result);
				} 
				catch (error) {
					data({});
				}
			});
		});
	}

	createTable() {
		let sql = "CREATE TABLE IF NOT EXISTS Users \
					(id INT(10) \
					AUTO_INCREMENT, \
					login VARCHAR(255), \
					password VARCHAR(255), \
					regTime VARCHAR(255), \
					jwt VARCHAR(255), \
					primary key (id))";
		this.doDBRequest(sql);
	}

	getTable() {
		let sql = "SELECT * from Users";
		this.doDBRequest(sql);
	}

	registerUser(user) {
		//let id = this.getTable();
		//console.log(id);
		let jwt = createJWT(2, user);
		let sql = `INSERT INTO Users (login, password, regTime, jwt)
					VALUES ('${user.login}', '${user.pass}', '${user.regTime}', '${jwt}')`; 
		console.log(jwt);			
		this.doDBRequest(sql);
	}
	
	deleteTable() {
		let sql = "DROP TABLE IF EXISTS Users";
		this.doDBRequest(sql);
	}
}

let dbm = new DBManager(db);
//dbm.createTable();
console.log('table', dbm.getTable());
//dbm.deleteTable();
//dbm.registerUser(new User({login: 'log', pass: 'pass' }, 'today'));
console.log('successfully')