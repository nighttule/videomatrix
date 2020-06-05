//server
const ws = new require('ws');
//////////////////////////////////////////
const primeNumberValency = 2000;

function findPrimeNumber() {
	let primeNumber = Math.floor(Math.random() * primeNumberValency) + primeNumberValency;
	let divider = 2;
	while (divider < primeNumberValency) {
		if (primeNumber > primeNumberValency) {
			primeNumber = findPrimeNumber();
		}
		if (primeNumber % divider == 0 && primeNumber > divider) {
			primeNumber++;
			divider = 1;
		}
		divider++;
	}
	
	return primeNumber; 
}

function gcd(eilerFunc, publicExponent) {
	let a = eilerFunc;
	let b = publicExponent;
	let reminders = [];
	let dividers = [];
	let x = [];
	let y = [];
    while (a != 0 && b != 0) {
        if (a > b) {
			dividers.push(Math.floor(a / b));
            a %= b;
			reminders.push(a);
		}
        else {
			dividers.push(Math.floor(b / a));
            b %= a;
			reminders.push(b);
		}
		x.push(0);
		y.push(0);
	}		
	
	x[reminders.length - 1] = 0;
	y[reminders.length - 1] = 1;
	
	for (let i = reminders.length - 2; i > -1; i--) {
		x[i] = y[i + 1];
		y[i] = x[i + 1] - y[i+1] * dividers[i];
	}
	
    return y[0] > 0 ? y[0] % eilerFunc : y[0] % eilerFunc + eilerFunc;
}

function getSecretExponent(eilerFunc, publicExponent) {
	let k = 1;
	let d = (k * eilerFunc + 1) % publicExponent;
	while (d != 0) {
		k++;
		d = (k * eilerFunc + 1) % publicExponent;
	}
	return (k * eilerFunc + 1) / publicExponent;
}

function getPublicExponent(eilerFunc) {
	let exps = [5, 7, 11, 17, 23 ];
	for (let e in exps) {
		console.log(e, eilerFunc % exps[e] != 0);
		if (eilerFunc % exps[e] != 0) {
			return exps[e];
		}
	}
}

function indexModuloMultiply(base, power, mod) {
	if (base >= mod || power >= mod)
		console.log('error, base or power > mod');
	let primitiveRoot = findPrimitiveRoot(mod);
	console.log('primitiveRoot ', primitiveRoot);
	let powReminder = [];
	let remPower = Array.from(Array(mod - 1), (_,x) => x);;
	for (let i = 0; i < mod - 1; i++) {
		powReminder[i] = primitiveRoot ** i % mod;
		remPower[primitiveRoot ** i % mod] = i;
	}
	console.log('powReminder ', powReminder);
	console.log('remPower ', remPower);
	let powerRes = (remPower[base] + remPower[power]) % (mod - 1);
	return powReminder[powerRes];
}

function findPrimitiveRoot(p) {
	let dividers = [];
	
	for (let d = 2; d < p / 2; d++) {
		if ((p - 1) % d == 0) {
			dividers.push(d);
		}
	}
	
	console.log(dividers);
	
	let r = 2;
	let isRoot = true;
	while (r < p) {
		for (let d = 0; d < dividers.length && isRoot; d++) {
		console.log('r ', r, 'dividers[d] ', dividers[d], ' } ', (r ** dividers[d] - 1) % p);
			if ((r ** dividers[d] - 1) % p == 0) {
				console.log('r ', r);
				r++;
				isRoot = false;
			}
		}
		if (isRoot) {
			break;
		}
		
		isRoot = true;
	}
	
	return r;
}

function mul(a, b, m){
	if (b == 1) {
		return a;
	}
	if (b % 2 == 0) {
		let t = mul(a, b / 2, m);
		return (2 * t) % m;
	}
	return (mul(a, b - 1, m) + a) % m;
}

function pows(a, b, m) {
	if (b < 0)
		b = m + b;
	if (b == 0)
		return 1;
	if (b % 2 == 0) {
		let t = pows(a, b / 2, m);
		return mul(t , t, m) % m;
	}
	return (mul(pows(a, b - 1, m), a, m)) % m;
}

function decodeMessage(msg, secretExponent, modulo) {
	let t = [];
	let decodedMessage = [];
	let decodedSymbol = 0;
	for (let m = 0; m < msg.length; m++) {
		let a = pows(msg[m], secretExponent, modulo);
		console.log(a);
		t.push(a);
		if (m > 0)
			decodedSymbol = (a - t[m - 1]) > 0 ? (a - t[m - 1]) % modulo : (a - t[m - 1]) % modulo + modulo;
		else
			decodedSymbol = a;
		decodedMessage.push(String.fromCharCode(decodedSymbol));
	}
	
	return t;
}
//////////////////////////////////////////////////////////////////

function rsa(cipheredMessage) {
	//const [prNum1, prNum2] = [findPrimeNumber(), findPrimeNumber()];
	const [prNum1, prNum2] = [ 3181, 2729 ] ;
	const modulo = prNum1 * prNum2;
	const eilerFunc = (prNum1 - 1) * (prNum2 - 1);
	//const publicExponent = getPublicExponent(eilerFunc);
	const publicExponent = 7;
	//const secretExponent = getSecretExponent(eilerFunc, publicExponent);
	const secretExponent = gcd(eilerFunc, publicExponent);
	//const publicKey = [publicExponent, modulo];

	console.log([prNum1, prNum2]);
	console.log('eiler func', eilerFunc);
	console.log('public key ', publicExponent);
	console.log('secret key ', secretExponent);
	
	return decodeMessage(cipheredMessage, secretExponent, modulo);
}

//let cipheredMessage =  [ 2605859, 8680527, 164288, 6723231,  3997213, 6935674, 5859425];
//console.log(RSA(cipheredMessage));

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


function server() {
	const WebSocket = require('ws');
	const wss = new WebSocket.Server({ port: 3000 });

	let rsa = new RSAServer()

	wss.on('connection', function connection(ws) {
		ws.send(rsa.getPubKeyToJSON());
		console.log('Public key was sent: ', rsa.getPubKeyToJSON());
		
		let data = 0; 
		
		ws.on('message', function incoming(message) {
			data = JSON.parse(message);
			console.log('Received data: ', data);
			data = rsa.decodeMessage(data);
			console.log('Decoded data: ', data);
			ws.send(data);
		});
	});
}

function my(m, e, n) {
	console.log('m', m, '|', 'e', e, '| n', n);
	let binE = [];
	(e >>> 0).toString(2).split('').forEach(c => binE.push(Number(c)));
	console.log(binE);
	let reminders = [m];
	let res = m ** binE[binE.length - 1];
	console.log('r ** binEi = * %d ** %d', reminders[0], binE[binE.length - 1]);
	for (let i = 1; i < binE.length; i++) {
		reminders[i] = reminders[i - 1] ** 2 % n;
		res *= reminders[i] ** binE[binE.length - i - 1];
		console.log('* r ** binEi = * %d ** %d', reminders[i], binE[binE.length - i - 1]);
		console.log('res', res);
	}
	
	console.log(reminders);
	
	return res % n;
}

function my1(m, e, n) {
	let eIsPrime = false;
	
	while (!eIsPrime) {
		eIsPrime = true;
		
		let prev = m;
		while (Math.abs(m) > n / 2) {
			m = m > 0 ? m - n : m + n;
			console.log(prev, m);
			if (Math.abs(prev) < Math.abs(m)) {
				m = prev;
				break;
			}
			prev = m;
		}
		
		console.log('m', m);
		
		let divider = 1; 
		for (let d = 2; d < e / 2; d++) {
			if (e % d == 0) {
				divider = d;
				eIsPrime = false;
				break;
			}
		}
		console.log(m, divider);
		
		if (eIsPrime)
			divider = 1;
		
		m = m ** divider;
		e = e / divider;
		
		console.log(m, e);
	}
	
	return m ** e % n;
}

function my2(m, e, n) {
	let reminder = m % n;
	for (let i = 1; i < e; i++) {
		reminder = reminder * m % n;
	}
	
	return reminder;
}

function expMod(m, e, n) {
	if (e == 0) {
		return 1;
	}
	if (e % 2 == 0) {
		let res = expMod(m, (e / 2), n) ** 2 % n;
		return res;
	}
	else {
		let res = (m * expMod(m, (e - 1), n)) % n;
		return res;
	}
}

//server();
console.log(expMod(5, 12, 7))