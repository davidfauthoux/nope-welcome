"use strict"

$(function() {
$.getJSON("data.json" , function(globalData) {
	let location = Server.location();

	console.log("LOCATION", location);
	let id = location.platform + "/superuser";

	let header = $("<div>").addClass("header");
	$("body").append(header);
	let body = $("<div>").addClass("body");
	$("body").append(body);
	let footer = $("<div>").addClass("footer");
	$("body").append(footer);
	let indexDiv = $("<div>").addClass("index").hide();
	$("body").append(indexDiv);

	let contentDiv = $("<div>").addClass("content");
	body.append(contentDiv);

	let users = {};
	let usersDiv = $("<div>").addClass("users");

	let setUserData = function(from, data, exposePasswordHashHeap) {
		let u = users[from];
		if (u === undefined) {
			u = {
				data: {},
				div: $("<div>").addClass("data"),
			};
			users[from] = u;
			let d = $("<div>").addClass("user").append($("<div>").addClass("title").text(from));

			d.click(function() {
				EncryptingServer.recover(new Heap(from), new Heap({
					subject: from,
					text: "<html>"
						+ "<body>"
						+ "{url}"
						+ "</body>"
						+ "</html>"
				}), new Heap(true))
					.err(function(e) {
						console.log("ERROR", e);
					}).run();
			});
			
			d.append(u.div);
			usersDiv.append(d);
		}
		for (let k in data) {
			if (k === "from") {
				continue;
			}
			if (k === "to") {
				continue;
			}
			u.data[k] = data[k];
		}
	};
	let updateUserDiv = function(from) {
		let div = users[from].div;
		let data = users[from].data;
		div.empty();
		for (let k in globalData) {
			if (globalData[k].type === "none") {
				continue;
			}
			let row = $("<div>").addClass("row");
			div.append(row);
			row.append($("<div>").addClass("key").text(k));
			let valueDiv = $("<div>").addClass("value");
			row.append(valueDiv);
			if (data[k] === undefined) {
				continue;
			}
			if (data[k] === null) {
				continue;
			}
			if (data[k].value !== undefined) {
				valueDiv.text(data[k].value);
				continue;
			}
			if (data[k].path !== undefined) {
				valueDiv.append($("<a>").addClass("value").attr("target", "_blank").attr("href", "/" + from + "/" + data[k].path).text("image"));
				continue;
			}
		}
	};
	let updateAllUserDivs = function() {
		for (let from in users) {
			updateUserDiv(from);
		}
	};

	let launch = function(password, exposePassword) {
		console.log("ID", id, password);

		let passwordHeap = new Heap(password);
		let passwordHashHeap = new Heap();
		let userIdHeap = new Heap(id);

		let exposePasswordHeap = new Heap(exposePassword);
		let exposePasswordHashHeap = new Heap();

		let userHeap = new Heap();
		sequence_(
			try_(sequence_(
					EncryptingServer.hash(exposePasswordHeap, exposePasswordHashHeap),
					do_(function() {
						if (DomUtils.windowUrlParameters()["clear"] !== undefined) {
							return EncryptingServer.clearUser(userIdHeap);
						} else {
							return noop_();
						}
					}),
					EncryptingServer.hash(passwordHeap, passwordHashHeap),
					EncryptingServer.loadUser(userIdHeap, passwordHashHeap, userHeap, new Heap(), exposePasswordHashHeap)))
				.catch_(function(e) {
					console.log("NEED TO CREATE", e);
					return sequence_(
						EncryptingServer.hash(passwordHeap, passwordHashHeap),
						EncryptingServer.newUser(userIdHeap, passwordHashHeap, userIdHeap),
						EncryptingServer.loadUser(userIdHeap, passwordHashHeap, userHeap, new Heap(), exposePasswordHashHeap));
				}),
			do_(function() {
				let user = userHeap.get();
				console.log(user);
				
				let server = new Server("/" + user.id);
				server = new EncryptingServer(user, server);

				let eventHeap = new Heap();
				return sequence_(
					while_(true_())
						.do_(try_(
							sequence_(
								Server.fullHistory(server, eventHeap),
								// sleep_(0.1),
								do_(function() {
									let r = eventHeap.get();
									console.log(r);
									
									if (r.old !== undefined) {
										for (let e of r.old) {
											console.log("OLD EVENT", e.from, e.data);
											setUserData(e.from, e.data, exposePasswordHashHeap);
										}
										updateAllUserDivs();
										return noop_();
									}

									if ((r.from === undefined) || (r.data === undefined)) {
										debugger;
									}

									console.log("EVENT", r.from, r.data);
									setUserData(r.from, r.data, exposePasswordHashHeap);
									updateUserDiv(r.from);

									return noop_();
								})))
							.catch_(function(e) {
								return sequence_(
									log_("ERROR", e),
									sleep_(5));
							})));
				})).run();
	};

	let passwordInput = $("<input>").attr("id", "password").attr("type", "password").attr("placeholder", "Password");
	let exposePasswordInput = $("<input>").attr("id", "exposepassword").attr("type", "password").attr("placeholder", "Expose password");
	let button = $("<div>").attr("id", "submit").addClass("button").text("Run").click(function() {
		let password = passwordInput.val();
		let exposePassword = exposePasswordInput.val();
		contentDiv.empty();
		contentDiv.append(usersDiv);
		launch(password, exposePassword);
	});

	contentDiv.append(passwordInput).append(exposePasswordInput).append($("<div>").addClass("buttons").append(button));
});
});
