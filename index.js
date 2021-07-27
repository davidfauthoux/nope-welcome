import * as async from "../modules/async.js";
import { Server, history } from "../modules/server.js";
import { EncryptionServer } from "../modules/encryption.js";
import * as i18n from "./i18n.js";
// jquery

import pluginNone from "./api-none.js";
import pluginStop from "./api-stop.js";
import pluginLine from "./api-line.js";
import pluginDate from "./api-date.js";
import pluginText from "./api-text.js";
import pluginMultipleText from "./api-multipletext.js";
import pluginChoice from "./api-choice.js";
import pluginGenerate from "./api-generate.js";
import pluginUpload from "./api-upload.js";

let plugins = {};
for (let plugin of [ pluginNone, pluginStop, pluginLine, pluginDate, pluginText, pluginMultipleText, pluginChoice, pluginGenerate, pluginUpload ]) {
	for (let typeName in plugin) {
		plugins[typeName] = plugin[typeName];
	}
}

let platform = "welcome";
let userRoot = "users/" + platform + "/";
let recoverUrlBase = platform + "/";

$(function() {
async.run([
new Server("/" + platform).download("data.json"),
(dataContents) => JSON.parse(dataContents),
(data) => {
// $.getJSON("data.json" , function(data) {
	console.log(data);

	let dataLanguage = data.language;
	let userData = {};
	let localStoreKey = platform + "/default";

	userData.platform = platform;

	let windowParams = (function() {
		let u = window.location.search;
		let i = u.indexOf('?');
		if (i < 0) {
			return {};
		}
		u = u.substring(i + 1);
		let p = {};
		for (let kv of u.split(/&/g)) {
			let s = kv.trim().split(/=/g);
			let key;
			let value;
			if (s.length === 1) {
				key = s;
				value = "";
			} else {
				key = decodeURIComponent(s[0]);
				value = decodeURIComponent(s[1]);
			}
			p[key] = value;
			// let values = p[key];
			// if (values === undefined) {
			// 	values = [];
			// 	p[key] = values;
			// }
			// values.push(value);
		}
		return p;
	})();

	let recoverKey = windowParams["recover"];
	let recoverUserId = windowParams["id"];
	let supervise = windowParams["supervise"] !== undefined;

	let forceUserId = windowParams["force-id"];
	let forcePasswordHash = windowParams["force-hash"];
	let forceExposePassword = windowParams["force-expose"];

	let unsecuredId = windowParams["u"];

	/****************/
	/* SERVER       */
	/****************/

	let encryptionServer = new EncryptionServer();
	let superuserUser = userRoot + "superuser";

	let stack = function(toStack) {
		console.log("STACKING", toStack);
		let userId = encryptionServer.user.id;
		async.run([
			encryptionServer.stack({
				to: superuserUser,
				from: userId,
				data: toStack // Possible to do the following to generate data on-the-go: data: () => toStack
			}),
			() => {
				toStack.from = userId;
				toStack.to = userId;
			},
			() => encryptionServer.stack(toStack),
		]);
	};

	/**********/
	/* HEADER */
	/**********/

	let header = $("<div>").addClass("header");
	$("body").append(header);
	let body = $("<div>").addClass("body");
	$("body").append(body);
	let footer = $("<div>").addClass("footer");
	$("body").append(footer);
	let indexDiv = $("<div>").addClass("index").hide();
	$("body").append(indexDiv);

	let spinner = function() {
		return $("<div>").addClass("spinner").append($("<div>")).append($("<div>")).append($("<div>")).append($("<div>"));
	};

	let contentDiv = $("<div>").addClass("content");
	body.append(contentDiv);
	contentDiv.append(spinner());

	let saving = i18n._($("<div>").addClass("saving"), dataLanguage.saving).addClass("hide");
	header.append(saving);

	/**********/
	/* FLAGS  */
	/**********/

	let updateLanguage = function(language) {
		if (language !== undefined) {
			userData.language = language;
			i18n.update(userData.language);
			$(".language").removeClass("selected");
			$(".language-" + language).addClass("selected");
		} else {
			i18n.update(undefined);
		}
	};

	let availableLanguages = [ "en", "fr", "es", "it", "lt", "lv", "fi", "ru" ];

	let flagDiv = $("<div>").addClass("flags");
	header.append(flagDiv);
	for (let l of availableLanguages) {
		let d = $("<div>").addClass("language").addClass("language-" + l).append($("<img>").attr("src", "res/" + l + ".png"));
		d.on("click", function() {
			if (encryptionServer.user === undefined) {
				updateLanguage(l);
			} else {
				stack({
					language: l
				});
			}
		});
		flagDiv.append(d);
	}

	let navigatorLanguage = navigator.language;
	let dashIndex = navigatorLanguage.indexOf('-');
	if (dashIndex >= 0) {
		navigatorLanguage = navigatorLanguage.substring(0, dashIndex);
	}
	console.log("navigator.language", navigatorLanguage);

	let initialLanguage = windowParams["language"];
	if (initialLanguage === undefined) {
		initialLanguage = "en";
		for (let l of availableLanguages) {
			if (l === navigatorLanguage) {
				initialLanguage = l;
				break;
			}
		}
	}
	updateLanguage(initialLanguage);

	/****************/
	/* NAVIGATION   */
	/****************/

	let createForKey;

	let overloadCreate = function(createDestroy, d) {
		return {
			create: function(userData, callback, allData) {
				let div = $("<div>").addClass(d.type);
				if (d.title !== undefined) {
					div.append(i18n._($("<div>").addClass("title"), d.title));
				}
				if (d.icon !== undefined) {
					div.append($("<img>").addClass("image").attr("src", "res/" + d.icon + ".png"));
				}
				if (d.text !== undefined) {
					div.append(i18n._($("<div>").addClass("description"), d.text));
				}
				div.append(createDestroy.create(userData, callback, allData).addClass("sub"));
				if (d.example !== undefined) {
					let exampleDiv = $("<div>").addClass("example");
					exampleDiv.append(i18n._($("<div>"), dataLanguage.example));
					exampleDiv.append(i18n._($("<div>"), d.example));
					div.append(exampleDiv);
				}
	
				if (d.back !== undefined) {
					let divs = $("<div>").addClass("buttons");
					for (let back in d.back) {
						let backButton = $("<div>").addClass("button").addClass("secondary");
						i18n._(backButton, d.back[back]);
						backButton.on("click", function() {
							createForKey(back);
						});
						divs.append(backButton);
					}
					div.append(divs);
				}
	
				return div;
			},

			destroy: function() {
				createDestroy.destroy();
			},
		};
	};


	let maySkipKey;
	let findNextForKey;
	let findPreviousForKey;

	let map = {};
	for (let k in data) {
		let d = data[k];
		if (d.type !== undefined) {
			let p = plugins[d.type];
			if (p === undefined) {
				console.log("MISSING PLUGIN", d.type);
			} else {
				map[k] = overloadCreate(p(d, dataLanguage), d);
			}
		}
	}

	let backButton = $("<div>").addClass("back");
	let indexButton = $("<div>").addClass("menu").append($("<div>"));
	let forwardButton = $("<div>").addClass("forward");
	backButton.addClass("disabled");
	forwardButton.addClass("disabled");

	let currentKey = null;
	let currentMapped = null;
	let currentMappedDiv = null;

	maySkipKey = function(key) {
		if (data[key].type === undefined) {
			return true;
		}
		if (data[key].if !== undefined) {
			for (let kk in data[key].if) {
				if ((userData[kk] !== undefined) && (data[key].if[kk] !== userData[kk].value)) {
					return true;
				}
			}
		}
		return false;
	}
	findNextForKey = function(key) {
		let found = false;
		for (let k in data) {
			if (k === key) {
				found = true;
			} else {
				if (maySkipKey(k)) {
					continue;
				}
				if (found) {
					console.log("NEXT", key, k);
					return k;
				}
			}
		}
		return null;
	};
	findPreviousForKey = function(key) {
		let previous = null;
		for (let k in data) {
			if (k === key) {
				break;
			}
			if (maySkipKey(k)) {
				continue;
			}
			previous = k;
		}
		console.log("PREVIOUS", key, previous);
		return previous;
	};

	let showIndex = function() {
		header.hide();
		footer.hide();
		body.hide();

		window.location.hash = "";

		indexDiv.empty();
		indexDiv.append($("<div>").addClass("close").on("click", function() {
			createForKey(currentKey);
		}));
		for (let k in data) {
			if (maySkipKey(k)) {
				continue;
			}
			let d = data[k];
			if (d.title !== undefined) {
				let div = i18n._($("<div>"), d.title).on("click", function() {
					createForKey(k);
				});
				if (userData[k] !== undefined) {
					div.addClass("filled");
				}
				indexDiv.append(div);
			}
		}	
		indexDiv.show();
	};
	let hideIndex = function() {
		indexDiv.hide();		
		header.show();
		footer.show();
		body.show();
	};

	createForKey = function(key) {
		saving.addClass("hide");
		body.removeClass("fulldisabled");

		showIndex();

		console.log("KEY", key);
		if (key === null) {
			return;
		}
		let mapped = map[key];
		if (currentMapped !== null) {
			currentMappedDiv.remove();
			currentMapped.destroy();
			currentMappedDiv = null;
			currentMapped = null;
			currentKey = null;

			backButton.addClass("disabled");
			forwardButton.addClass("disabled");
		}
		if (mapped === undefined) {
			return; //TODO Error panel
		}

		hideIndex();

		currentMappedDiv = mapped.create(userData[key], function(update) {
			currentMappedDiv.addClass("disabled");
			i18n.update(undefined); //TODO??

			let event = {};
			event[key] = (update === undefined) ? null : update;
			saving.removeClass("hide");
			body.addClass("fulldisabled");
			stack(event);
		}, userData);

		currentMapped = mapped;
		currentKey = key;
		contentDiv.empty().append(currentMappedDiv);

		backButton.removeClass("disabled");
		forwardButton.removeClass("disabled");
		for (let k in data) {
			if (k === key) {
				backButton.addClass("disabled");
				break;
			}
			break;
		}
		let last = null;
		for (let k in data) {
			last = k;
		}
		if (last === key) {
			forwardButton.addClass("disabled");
		}

		window.location.hash = "#" + key;
	};

	footer.append(i18n._(backButton, dataLanguage.back).click(function() {
		let n = findPreviousForKey(currentKey);
		if (n !== null) {
			createForKey(n);
		} else {
			createForKey(currentKey);
		}
	}));
	footer.append(indexButton.click(showIndex));
	footer.append(i18n._(forwardButton, dataLanguage.forward).click(function() {
		let n = findNextForKey(currentKey);
		if (n !== null) {
			createForKey(n);
		} else {
			createForKey(currentKey);
		}
	}));

	/****************/
	/* DISCONNECT   */
	/****************/

	if (unsecuredId === undefined) {
		let disconnectButton = i18n._($("<div>"), dataLanguage.disconnect);
		$("body").append($("<div>").addClass("disconnect").append(disconnectButton));
		disconnectButton.on("click", function() {
			async.run([
				() => {
					let userId;
					let item = localStorage.getItem(localStoreKey);
					if (item !== null) {
						userId = JSON.parse(item);
					} else {
						userId = null;
					}

					localStorage.removeItem(localStoreKey);

					if (userId !== null) {
						return encryptionServer.clearUser(userId);
					}
				},
				() => {
					window.location.href = "/" + platform + "/";
				}
			]);
		});
	}

	/****************/
	/* INIT         */
	/****************/

	let emailSubjectText = function() {
		return {
			subject: i18n.getText(dataLanguage.account.email.subject, true),
			text: "<html>"
				+ "<body style='background:white; color:black; font-size: 14px;'>"

				+ "<div style=''>"
				+ i18n.getText(dataLanguage.account.email.pleaseconfirm, true)
				+ "</div>"

				+ "<div style=''>"
				+ "<a href='{url}'>"
				+ i18n.getText(dataLanguage.account.email.clickhere, true)
				+ "</a>"
				+ "</div>"

				+ "<div style=''>"
				+ i18n.getText(dataLanguage.account.email.pastelink, true)
				+ "</div>"
				+ "<div style=''>"
				+ "{url}"
				+ "</div>"

				+ "</body>"
				+ "</html>"
		};
	};

	let navigateDirectly = function(d, finish) {
		contentDiv.empty();
		saving.addClass("hide");
		body.removeClass("fulldisabled");

		let mapped;
		if (finish === undefined) {
			mapped = plugins["stop"](d, dataLanguage);
		} else {
			mapped = plugins["line"](d, dataLanguage);
		}
		mapped = overloadCreate(mapped, d);

		let createdDiv = mapped.create(undefined, function(update) {
			createdDiv.addClass("disabled");
			i18n.update(undefined); //TODO??

			saving.removeClass("hide");
			body.addClass("fulldisabled");

			if (finish !== undefined) {
				finish(update.value.replace(/\s/g, '').toLowerCase());
			}
		}, userData);
		
		contentDiv.append(createdDiv);
	};

	async.run([
		// Recover user
		() => {
			if ((forceUserId !== undefined) && (forcePasswordHash !== undefined) && (forceExposePassword !== undefined)) {
				console.log("FORCING", forceUserId, forcePasswordHash, forceExposePassword);
				return async._([
					encryptionServer.clearUser(forceUserId),
					EncryptionServer.hash(forceExposePassword),
					(exposePasswordHash) => encryptionServer.loadUser(forceUserId, forcePasswordHash, undefined, exposePasswordHash),
					() => {
						localStorage.setItem(localStoreKey, JSON.stringify(forceUserId));
						window.history.replaceState(undefined, document.title, "/" + platform + "/");
					},
				]);
			}
			if (recoverKey !== undefined) {
				return async.try_([
						() => encryptionServer.validateUser(recoverUserId, recoverKey, undefined, supervise),
						() => {
							localStorage.setItem(localStoreKey, JSON.stringify(recoverUserId));
							window.history.replaceState(undefined, document.title, "/" + platform + "/");
						},
					]).catch_((_e) => async.async_((_finish, _error) => navigateDirectly(dataLanguage.account.failed)));
			}
		},

		// Load user
		() => {
			let userId;
			let item = localStorage.getItem(localStoreKey);
			if (item !== null) {
				userId = JSON.parse(item);
			} else {
				userId = null;
			}

			console.log("USER", userId);

			if (unsecuredId !== undefined) {
				let passwordHash;
				userId = userRoot + unsecuredId;
				encryptionServer.useVault = false;
				userData.userId = userId;
				return async._([
					EncryptionServer.hash(unsecuredId),
					(hash) => passwordHash = hash,
					async.try_([
						() => encryptionServer.getPublicKey(userId),
						(publicKey) => { console.log("USER PUBLIC KEY", publicKey); },
					]).catch_((_e) => [
						encryptionServer.createNewUser(userId, passwordHash, ""),
					]),
					encryptionServer.loadUser(userId, undefined, undefined, undefined),
				]);
			}

			if (userId === null) {
				let passwordHash;
				let emailAddress;
				return async._([
					EncryptionServer.generateRandom(),
					(password) => EncryptionServer.hash(password),
					(hash) => passwordHash = hash,
					async.async_((finish, _error) => navigateDirectly(dataLanguage.account.create, finish)),
					(address) => {
						emailAddress = address;
						userId = userRoot + emailAddress;
					},
					async.try_([
						() => encryptionServer.getPublicKey(userId),
						(publicKey) => { console.log("USER PUBLIC KEY", publicKey); },
						() => encryptionServer.recoverUser(userId, recoverUrlBase, emailSubjectText(), userData.language, supervise),
						async.async_((_finish, _error) => navigateDirectly(dataLanguage.account.recovery)),
					]).catch_((_e) => [
						encryptionServer.createNewUser(userId, passwordHash, emailAddress),
						encryptionServer.recoverUser(userId, recoverUrlBase, emailSubjectText(), userData.language, supervise),
						async.async_((_finish, _error) => navigateDirectly(dataLanguage.account.created)),
					]),
				]);
			}
			
			userData.email = userId.substring(userRoot.length);
			userData.userId = userId;
			return encryptionServer.loadUser(userId, undefined, undefined, undefined);
		},

		() => {
			let eventHistory = history(encryptionServer);
			return async._([
				// First event in history is an event.old
				eventHistory,
				(event) => {
					delete event.from;
					delete event.to;
					console.log("OLD", event);
					let language = null;
					for (let e of event.old) {
						for (let k in e) {
							if (k === "language") {
								language = e[k];
							} else {
								userData[k] = e[k];
							}
						}
					}
					console.log("LANGUAGE", language);
					return language;
				},

				// Init navigation
				(language) => {
					if (language !== null) {
						updateLanguage(language);
					}

					if (window.location.hash !== "") {
						console.log("HASH", window.location.hash);
						createForKey(window.location.hash.substring("#".length));
					} else {
						let last = null;
						for (let k in data) {
							if (maySkipKey(k)) {
								continue;
							}
							if (userData[k] === undefined) {
								console.log("NOT YET DEFINED", k);
								last = k;
								break;
							}
						}
						console.log("LAST", last);
						createForKey(last);
					}
				},

				// Load events
				async.while_(() => true).do_([
					eventHistory,
					(event) => {
						delete event.from;
						delete event.to;
						console.log("EVENT", event);

						for (let k in event) {
							let eventData = event[k];
							if (k === "language") {
								updateLanguage(eventData);
							} else {
								userData[k] = eventData;
								if (userData[k] !== null) {
									let n = findNextForKey(k);
									if (n !== null) {
										createForKey(n);
									} else {
										createForKey(k);
									}
								} else {
									createForKey(k);
								}
							}
						}
					},
				]),
			]);
		},
	]);
},
]);
});