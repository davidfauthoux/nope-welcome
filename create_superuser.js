//npm install esm
//node -r esm <file>.js

import * as async from "../modules/async.js";
import { Server } from "../modules/server.js";
import { EncryptionServer } from "../modules/encryption.js";

let args = {};
for (let a of process.argv) {
	if (a.startsWith("--")) {
		a = a.substring("--".length);
		let i = a.indexOf('=');
		let k = a.substring(0, i);
		let v = a.substring(i + 1);
		args[k] = v;
	}
}
Server.BASE = args.base; // "http://localhost:8086";
let password = args.password;
let exposePassword = password; //TODO

console.log("Server.BASE", Server.BASE);
console.log("password", password);

let platform = "welcome";

let globalUserId = "users/" + platform + "/superuser";


let passwordHash;
let exposePasswordHash;

let encryptionServer = new EncryptionServer();

async.run([
	EncryptionServer.hash(password),
	(hash) => passwordHash = hash,
	EncryptionServer.hash(exposePassword),
	(hash) => exposePasswordHash = hash,
	async.try_(new EncryptionServer().getPublicKey(globalUserId))
		.catch_((_e) => {
			return async._([
				encryptionServer.createNewUser(globalUserId, passwordHash, ""),
			]);
		})
		.finally_(encryptionServer.loadUser(globalUserId, passwordHash, undefined, exposePasswordHash)),
]);
