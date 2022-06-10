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

// import data from "./data.json" assert { type: "json" };
import { data } from "./data.json.js";

console.log(data);

let plugins = {};
for (let plugin of [ pluginNone, pluginStop, pluginLine, pluginDate, pluginText, pluginMultipleText, pluginChoice, pluginGenerate, pluginUpload ]) {
	for (let typeName in plugin) {
		plugins[typeName] = plugin[typeName];
	}
}

let postEvent = null;
let dataLanguage = data.language;
let userData = {};

let getInitialLanguage = () => {
	let initialLanguage = new URL(window.location.href).searchParams.get("l"); // "language"

	let navigatorLanguage = navigator.language;
	let dashIndex = navigatorLanguage.indexOf('-');
	if (dashIndex >= 0) {
		navigatorLanguage = navigatorLanguage.substring(0, dashIndex);
	}

	if (initialLanguage === null) {
		initialLanguage = "en";
		for (let l of availableLanguages) {
			if (l === navigatorLanguage) {
				initialLanguage = l;
				break;
			}
		}
	}
	return initialLanguage;
};

let getWindowHash = () => {
	if (window.location.hash === "") {
		return null;
	} else {
		return window.location.hash.substring("#".length);
	}
};
let setWindowHash = (hash) => {
	if (hash === null) {
		window.location.hash = "";
	} else {
		window.location.hash = "#" + hash;
	}
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

let contentDiv = $("<div>").addClass("content");
body.append(contentDiv);
contentDiv.append($("<div>").addClass("spinner").append($("<div>")).append($("<div>")).append($("<div>")).append($("<div>")));

let saving = i18n._($("<div>").addClass("saving"), dataLanguage.saving).addClass("hide");
header.append(saving);

/**********/
/* FLAGS  */
/**********/

let updateLanguage = (language) => {
	if (language !== undefined) {
		userData.language = language;
		i18n.update(userData.language);
		$(".language").removeClass("selected");
		$(".language-" + language).addClass("selected");
	} else {
		i18n.update(undefined);
	}
};

let availableLanguages = [ "en", "fr", "es", "it", "lt", "lv", "fi", "ru", "sv", "da", "ee" ];

let flagDiv = $("<div>").addClass("flags");
header.append(flagDiv);
for (let l of availableLanguages) {
	let d = $("<div>").addClass("language").addClass("language-" + l).append($("<img>").attr("src", "res/" + l + ".png"));
	d.on("click", () => {
		if (postEvent === null) {
			updateLanguage(l);
		} else {
			postEvent({
				language: l
			});
		}
	});
	flagDiv.append(d);
}

updateLanguage(getInitialLanguage());

/****************/
/* NAVIGATION   */
/****************/

let createForKey;

let overloadCreate = (createDestroy, d) => {
	return {
		create: (userData, callback, allData) => {
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
					backButton.on("click", () => {
						createForKey(back);
					});
					divs.append(backButton);
				}
				div.append(divs);
			}

			return div;
		},

		destroy: () => {
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

maySkipKey = (key) => {
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
findNextForKey = (key) => {
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
findPreviousForKey = (key) => {
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

let showIndex = () => {
	header.hide();
	footer.hide();
	body.hide();

	setWindowHash(null);

	indexDiv.empty();
	indexDiv.append($("<div>").addClass("close").on("click", () => {
		createForKey(currentKey);
	}));
	for (let k in data) {
		if (maySkipKey(k)) {
			continue;
		}
		let d = data[k];
		if (d.title !== undefined) {
			let div = i18n._($("<div>"), d.title).on("click", () => {
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
let hideIndex = () => {
	indexDiv.hide();		
	header.show();
	footer.show();
	body.show();
};

createForKey = (key) => {
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

	currentMappedDiv = mapped.create(userData[key], (update) => {
		currentMappedDiv.addClass("disabled");
		i18n.update(undefined); //TODO??

		let event = {};
		event[key] = (update === undefined) ? null : update;
		saving.removeClass("hide");
		body.addClass("fulldisabled");
		postEvent(event);
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

	setWindowHash(key);
};

let goBack = () => {
	let n = findPreviousForKey(currentKey);
	if (n !== null) {
		createForKey(n);
	} else {
		createForKey(currentKey);
	}
};
let goForward = () => {
	let n = findNextForKey(currentKey);
	if (n !== null) {
		createForKey(n);
	} else {
		createForKey(currentKey);
	}
};
footer.append(i18n._(backButton, dataLanguage.back).click(goBack));
footer.append(indexButton.click(showIndex));
footer.append(i18n._(forwardButton, dataLanguage.forward).click(goForward));

document.onkeydown = (e) => {
	if (document.activeElement.tagName.toLowerCase() === "input") {
		return;
	}
	if (document.activeElement.tagName.toLowerCase() === "textarea") {
		return;
	}
	switch (e.key) {
		case "ArrowLeft":
			goBack();
			break;
		case "ArrowRight":
			goForward();
			break;
		case "ArrowUp":
			break;
		case "ArrowDown":
			break;
	}
}

/****************/
/* DISCONNECT   */
/****************/

// if (unsecuredId === undefined) {
// 	let disconnectButton = i18n._($("<div>"), dataLanguage.disconnect);
// 	$("body").append($("<div>").addClass("disconnect").append(disconnectButton));
// 	disconnectButton.on("click", () => {
// 		async.run([
// 			() => {
// 				let userId;
// 				let item = localStorage.getItem(localStoreKey);
// 				if (item !== null) {
// 					userId = JSON.parse(item);
// 				} else {
// 					userId = null;
// 				}

// 				localStorage.removeItem(localStoreKey);

// 				if (userId !== null) {
// 					return encryptionServer.clearUser(userId);
// 				}
// 			},
// 			() => {
// 				window.location.href = "/" + platform + "/";
// 			}
// 		]);
// 	});
// }

// /****************/
// /* INIT         */
// /****************/

// let emailSubjectText = function() {
// 	return {
// 		subject: i18n.getText(dataLanguage.account.email.subject, true),
// 		text: "<html>"
// 			+ "<body style='background:white; color:black; font-size: 14px;'>"

// 			+ "<div style=''>"
// 			+ i18n.getText(dataLanguage.account.email.pleaseconfirm, true)
// 			+ "</div>"

// 			+ "<div style=''>"
// 			+ "<a href='{url}'>"
// 			+ i18n.getText(dataLanguage.account.email.clickhere, true)
// 			+ "</a>"
// 			+ "</div>"

// 			+ "<div style=''>"
// 			+ i18n.getText(dataLanguage.account.email.pastelink, true)
// 			+ "</div>"
// 			+ "<div style=''>"
// 			+ "{url}"
// 			+ "</div>"

// 			+ "<div style=''>"
// 			+ i18n.getText(dataLanguage.account.email.recoverycode, true)
// 			+ "</div>"
// 			+ "<div style='font-family: monospace; font-weight: bold; font-size: xx-large;'>"
// 			+ "{key}"
// 			+ "</div>"

// 			+ "<div style=''>"
// 			+ i18n.getText(dataLanguage.account.email.scanqrcode, true)
// 			+ "</div>"
// 			+ "<div style=''>"
// 			+ "<img src='https://api.qrserver.com/v1/create-qr-code/?data={url:uri_encoded}&size=100x100' alt='' title=''></img>"
// 			+ "</div>"

// 			+ "</body>"
// 			+ "</html>"
// 	};
// };

// let navigateDirectly = (d, finish) => {
// 	contentDiv.empty();
// 	saving.addClass("hide");
// 	body.removeClass("fulldisabled");

// 	let mapped;
// 	if (finish === undefined) {
// 		mapped = plugins["stop"](d, dataLanguage);
// 	} else {
// 		mapped = plugins["line"](d, dataLanguage);
// 	}
// 	mapped = overloadCreate(mapped, d);

// 	let createdDiv = mapped.create(undefined, (update) => {
// 		createdDiv.addClass("disabled");
// 		i18n.update(undefined); //TODO??

// 		saving.removeClass("hide");
// 		body.addClass("fulldisabled");

// 		if (finish !== undefined) {
// 			finish(update.value.replace(/\s/g, '').toLowerCase());
// 		}
// 	}, userData);
	
// 	contentDiv.append(createdDiv);
// };

export function willPostEvent(userId, postEventFunction) {
	userData.userId = userId;
	postEvent = postEventFunction;
}

export function handleEvent(event) {
	if (event.old !== undefined) {
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

		if (language !== null) {
			updateLanguage(language);
		}

		let hash = getWindowHash();
		if (hash !== null) {
			createForKey(hash);
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
	} else {
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
	}
}

