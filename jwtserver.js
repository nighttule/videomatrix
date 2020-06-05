//server
const ws = new require('ws');
const mysql = new require('mysql');
const jwToken = new require('jsonwebtoken')
//////////////////////////////////////////

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
	constructor(id, userInfo, regTime) {
		this.id = id;
		this.login = userInfo.login;
		this.pass = userInfo.pass;
		this.regTime = regTime;
	}
}

function registerUser(db, user) {
	let con = mysql.createConnection({
	  host: "localhost",
	  user: "yourusername",
	  password: "yourpassword",
	  database: "usersInfo"
	});
	
	let jwt = createJWT(user);
	
	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected!");
	  let sql = "INSERT INTO Users (id, login, password, regTime, jwt) \
				VALUES ('$user.login', '$user.pass', '$user.regTime', '$jwt')";
	  
	  con.query(sql, function (err, result) {
		if (err) 
			throw err;
		console.log("1 record inserted");
	  });
	});
}

function createJWT(user) {
	const data =  {
      id: user.id,
      login: user.login,
      regTime: user.regTime
    };
	
	const signature = 'V1de0matr1xxx';
    const expiration = '6h';

    return jwToken.sign({ data, }, signature, { algorithm: 'RS256', expiresIn: expiration });
}

function getJWT(user) {
	let jwt;
	con.connect(function(err) {
	  if (err) 
		  throw err;
	  console.log("Connected!");
	  let sql = "SELECT jwt FROM Users WHERE login = '$user.login'";
	 
	  con.query(sql, function (err, result) {
		if (err) 
			throw err;
		jwt = result[0];
		console.log("get user jwt", jwt);
	  });
	});
	return jwt;
}

function refreshJWT(jwt) {
	if (isJWTValid) {
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

//server();

var con = mysql.createConnection({
	  host: "localhost",
	  user: "yourusername",
	  password: "yourpassword",
	  database: "usersInfo"
	});
	
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE Users (id INT AUTO-INCREMENT, login VARCHAR(255), password VARCHAR(255), regTime VARCHAR(255), jwt VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});