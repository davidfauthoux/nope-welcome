"use strict";

$(function() {
$.getJSON("data.json" , function(data) {
	let location = Server.location();

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

	let userFrom = null;
	let server = null;
	let superuserUser = location.platform + "/superuser";
	let superuserServer = new Server("/" + superuserUser);
	superuserServer = new EncryptingServer(null, superuserServer);

	let dataLanguage = data.language;

	let userData = {};

	let stack = function(toStack, callback) {
		toStack.from = userFrom;
		toStack.to = userFrom;
		console.log("STACKING", superuserUser, userFrom, toStack);
		sequence_(
			server.stack(new Heap({
				to: superuserUser,
				from: userFrom,
				data: toStack
			})),
			server.stack(new Heap(toStack)),
		).res(function() {
			if (callback !== undefined) {
				callback();
			}
		}).run();
	};

	let flagDiv = $("<div>").addClass("flags");
	for (let l of [ "en", "fr", "es", "it", "lt", "lv", "fi", "ru" ]) {
		let d = $("<div>").addClass("language").addClass("language-" + l).append($("<img>").attr("src", "res/" + l + ".png"));
		d.click(function() {
			if (server === null) {
				updateLanguage(l);
			} else {
				stack({
					language: l
				});
			}
		});
		flagDiv.append(d);
	}

	let saving = i18n($("<div>").addClass("saving"), dataLanguage.saving).addClass("hide");
	header.append(saving);
	header.append(flagDiv);

	let updateLanguage = function(language) {
		userData.language = language;
		i18nLanguage = userData.language;
		i18nUpdateAll();
		$(".language").removeClass("selected");
		$(".language-" + language).addClass("selected");
	};

	let createForKey;

	let overloadCreate = function(mapped, d) {
		let f = mapped.create;
		mapped.create = function(userData, callback, allData) {
			let div = $("<div>").addClass(d.type);
			if (d.title !== undefined) {
				div.append(i18n($("<div>").addClass("title"), d.title));
			}
			if (d.icon !== undefined) {
				div.append($("<img>").addClass("image").attr("src", "res/" + d.icon + ".png"));
			}
			if (d.text !== undefined) {
				div.append(i18n($("<div>").addClass("description"), d.text));
			}
			div.append(f(userData, callback, allData, server).addClass("sub"));
			if (d.example !== undefined) {
				let exampleDiv = $("<div>").addClass("example");
				exampleDiv.append(i18n($("<div>"), dataLanguage.example));
				exampleDiv.append(i18n($("<div>"), d.example));
				div.append(exampleDiv);
			}

			if (d.back !== undefined) {
				let divs = $("<div>").addClass("buttons");
				for (let back in d.back) {
					let backButton = $("<div>").addClass("button").addClass("secondary");
					i18n(backButton, d.back[back]);
					backButton.click(function() {
						createForKey(back);
					});
					divs.append(backButton);
				}
				div.append(divs);
			}

			return div;
		};
	};

	let localStoreKey = location.platform + "/default";

	let reload = function() {
		let url = location.url + "/" + location.platform + "/";
		console.log(url);
		window.location.href = url;
	};

	let disconnectButton = i18n($("<div>"), dataLanguage.disconnect);
	$("body").append($("<div>").addClass("disconnect").append(disconnectButton));
	disconnectButton.click(function() {
		sequence_(
			localClear_(localStoreKey),
			if_(not_(equals_(new Heap(userFrom), undefined))).then_(EncryptingServer.clearUser(new Heap(userFrom))),
			block_(reload))
		.run();
	});

	let initEverything = function(runWhenLoaded) {
		let windowParams = {
			recover: null,
			supervise: undefined,
			id: null,
		};
		(function() {
			let windowUrlParameters = DomUtils.windowUrlParameters();

			let recover = windowUrlParameters["recover"];
			if (recover !== undefined) {
				windowParams.recover = recover[0];
			}

			let supervise = windowUrlParameters["supervise"];
			if (supervise !== undefined) {
				windowParams.supervise = true;
			}

			let id = windowUrlParameters["id"];
			if (id !== undefined) {
				windowParams.id = id[0];
			}
		})();
		// console.log(windowParams);

		let emailHeap = new Heap();
		let userIdHeap = new Heap();
		let publicKeyHeap = new Heap();
		let passwordHeap = new Heap();
		let passwordHashHeap = new Heap();
		let userHeap = new Heap();

		let emailHtml = {
			get: function() {
				return {
					subject: i18nGetText(dataLanguage.account.email.subject, true),
					text: "<html>"
						+ "<body style='background:white; color:black; font-size: 14px;'>"

						+ "<div style=''>"
						+ i18nGetText(dataLanguage.account.email.pleaseconfirm, true)
						+ "</div>"

						+ "<div style=''>"
						+ "<a href='{url}'>"
						+ i18nGetText(dataLanguage.account.email.clickhere, true)
						+ "</a>"
						+ "</div>"

						+ "<div style=''>"
						+ i18nGetText(dataLanguage.account.email.pastelink, true)
						+ "</div>"
						+ "<div style=''>"
						+ "{url}"
						+ "</div>"

						+ "</body>"
						+ "</html>"
				};
			}
		};

		let createBlock = function(d, finish) {
			saving.addClass("hide");
			body.removeClass("fulldisabled");

			let mapped = (finish === undefined) ? {
				create: function(_data, _callback) {
					return $("<div>");
				}
			} : Plugins.line(d, dataLanguage);
			overloadCreate(mapped, d);

			let createdDiv = mapped.create(undefined, function(update) {
				createdDiv.addClass("disabled");
				i18nUpdateAll();

				saving.removeClass("hide");
				body.addClass("fulldisabled");

				if (finish !== undefined) {
					setTimeout(function() {
						emailHeap.set(update.value.toLowerCase());
						finish();
					}, 100);
				}
			}, userData);
			contentDiv.empty().append(createdDiv);
		};

		updateLanguage(i18nLanguage);

		if (windowParams.recover !== null) {
			userIdHeap.set(windowParams.id);
			sequence_(
				localClear_(localStoreKey),
				try_(EncryptingServer.validate(userIdHeap, new Heap(windowParams.recover), emailHtml, new Heap(), new Heap(), new Heap(windowParams.supervise)))
					.catch_(function(e) {
						console.log(e);
						return sequence_(
							new Async(function(_finish) {
								createBlock(dataLanguage.account.failed);
							}),
							localClear_(localStoreKey),
							new Async(function(_finish) {
								setTimeout(finish, 3 * 1000);
							}));
					}),
				localSave_(localStoreKey, userIdHeap),
				block_(reload))
			.run();
			return;
		}
	
		sequence_(
			localLoad_(localStoreKey, userIdHeap),
			if_(equals_(userIdHeap, undefined))
				.then_(sequence_(
					new Async(function(finish) {
						createBlock(dataLanguage.account.create, finish);
					}),
					block_(function() {
						userIdHeap.set(location.platform + "/" + emailHeap.get());
					}),
					try_(EncryptingServer.loadPublicKey(userIdHeap, publicKeyHeap)).catch_(function(_e) { return noop_(); }),
					if_(equals_(publicKeyHeap, null))
						.then_(sequence_(
							EncryptingServer.hash(passwordHeap, passwordHashHeap),
							EncryptingServer.newUser(userIdHeap, passwordHashHeap, emailHeap, emailHtml),
							EncryptingServer.loadUser(userIdHeap, passwordHashHeap, userHeap),
							localSave_(localStoreKey, userIdHeap),
							EncryptingServer.recover(userIdHeap, emailHtml, new Heap(windowParams.supervise)),
							new Async(function(_finish) {
								createBlock(dataLanguage.account.created);
							})))
						.else_(sequence_(
							EncryptingServer.recover(userIdHeap, emailHtml, new Heap(windowParams.supervise)),
							new Async(function(_finish) {
								createBlock(dataLanguage.account.recovery);
							})))))
				.else_(sequence_(
					EncryptingServer.hash(passwordHeap, passwordHashHeap),
					EncryptingServer.loadUser(userIdHeap, passwordHashHeap, userHeap),
					block_(function() {
						userData["email"] = userIdHeap.get().substring(userIdHeap.get().indexOf('/') + 1);
						runWhenLoaded(userIdHeap.get(), userHeap.get());
					})
					/*%%
					new Async(function(_finish) {
						createBlock({
							title: "Account OK",
							text: "Account loaded",
							type: "text",
						});
					})
					*/)))
		.run();
	};


	let runEverything = function(userId, userForEncryption) {
		// userForEncryption = undefined; // Remove to encrypt

		userFrom = userId;
		server = new Server("/" + userId);
		if (userForEncryption !== undefined) {
			server = new EncryptingServer(userForEncryption, server);
		}
	
		let maySkipKey;
		let findNextForKey;
		let findPreviousForKey;

		let map = {};
		for (let k in data) {
			let d = data[k];
			if (d.type === "none") {
				map[k] = Plugins.none(d, dataLanguage);
			} else if (d.type === "line") {
				map[k] = Plugins.line(d, dataLanguage);
			} else if (d.type === "date") {
				map[k] = Plugins.date(d, dataLanguage);
			} else if (d.type === "text") {
				map[k] = Plugins.text(d, dataLanguage);
			} else if (d.type === "multipletext") {
				map[k] = Plugins.multipletext(d, dataLanguage);
			} else if (d.type === "choice") {
				map[k] = Plugins.choice(d, dataLanguage);
			} else if (d.type === "upload") {
				map[k] = Plugins.upload(d, dataLanguage);
			} else if (d.type === "generate") {
				map[k] = Plugins.generate(d, dataLanguage);
			} else {
				continue;
				/*
				console.log("INVALID", k, d.type);
				map[k] = Plugins.none(d, dataLanguage);
				*/
			}

			overloadCreate(map[k], d);
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
			indexDiv.append($("<div>").addClass("close").click(function() {
				createForKey(currentKey);
			}));
			for (let k in data) {
				if (maySkipKey(k)) {
					continue;
				}
				let d = data[k];
				if (d.title !== undefined) {
					let div = i18n($("<div>"), d.title).click(function() {
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
				i18nUpdateAll();

				let event = {};
				event[key] = (update === undefined) ? null : update;
				saving.removeClass("hide");
				body.addClass("fulldisabled");
				setTimeout(function() {
					stack(event);
				}, 100);
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

		footer.append(i18n(backButton, dataLanguage.back).click(function() {
			let n = findPreviousForKey(currentKey);
			if (n !== null) {
				createForKey(n);
			} else {
				createForKey(currentKey);
			}
		}));
		footer.append(indexButton.click(showIndex));
		footer.append(i18n(forwardButton, dataLanguage.forward).click(function() {
			let n = findNextForKey(currentKey);
			if (n !== null) {
				createForKey(n);
			} else {
				createForKey(currentKey);
			}
		}));

		updateLanguage(i18nLanguage);

		let eventHeap = new Heap();
		while_(true_())
			.do_(try_(
				sequence_(
					Server.fullHistory(server, eventHeap),
					// sleep_(0.1),
					do_(function() {
						let event = eventHeap.get();

						let cleanEvent = function(ee) {
							delete ee.secure;
							delete ee.signed;
							delete ee.offset;
							delete ee.nonce;
							delete ee.from;
							delete ee.to;
						};

						cleanEvent(event);
						console.log(event);

						if (event.old !== undefined) {
							let language = null;
							for (let e of event.old) {
								cleanEvent(e);

								for (let k in e) {
									if (k === "language") {
										language = e[k];
									} else {
										userData[k] = e[k];
									}
								}
							}

							console.log("HASH", window.location.hash);
							if (window.location.hash !== "") {
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
								createForKey(last);
							}

							if (language !== null) {
								updateLanguage(language);
							}
						} else {
							for (let k in event) {
								if (k === "language") {
									updateLanguage(event[k]);
								} else {
									userData[k] = event[k];
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
						}
						return noop_();
					})))
				.catch_(function(e) {
					return sequence_(
						log_("ERROR", e),
						sleep_(5));
				}))
		.run();
	};

	initEverything(runEverything);
});
});