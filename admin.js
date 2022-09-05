import * as nope from "../book/nope.js";
import * as async from "../modules/async.js";
// jquery

import * as i18n from "./i18n.js";

import pluginNone from "./api-none.js";
import pluginStop from "./api-stop.js";
import pluginLine from "./api-line.js";
import pluginDate from "./api-date.js";
import pluginText from "./api-text.js";
import pluginMultipleText from "./api-multipletext.js";
import pluginChoice from "./api-choice.js";
import pluginGenerate from "./api-generate.js";
import pluginUpload from "./api-upload.js";
import pluginSignature from "./api-signature.js";

// import data from "./data.json" assert { type: "json" };
import { data } from "./data.json.js";

console.log(data);

let plugins = {};
for (let plugin of [ pluginNone, pluginStop, pluginLine, pluginDate, pluginText, pluginMultipleText, pluginChoice, pluginGenerate, pluginUpload, pluginSignature ]) {
	for (let typeName in plugin) {
		plugins[typeName] = plugin[typeName];
	}
}

$(function() {
	let div = $("<div>").addClass("admin");
	let urls = $("<textarea>");
	urls.val("http://localhost:8880/welcome/?u=savelij2011&p=1298729872498742#presentation\n" +
		"http://localhost:8880/welcome/?u=adrians2011&p=127868741638196871681#presentation\n" +
		"http://localhost:8880/welcome/?u=emils2011&p=93873987741638196871681#presentation\n" +
		"http://localhost:8880/welcome/?u=kristians2011&p=130893793793873987#presentation\n" +
		"http://localhost:8880/welcome/?u=regnars2011&p=12980868741638196871681#presentation\n" +
		"http://localhost:8880/welcome/?u=sohan2012&p=113990871398749#presentation\n" +
		"http://localhost:8880/welcome/?u=kristofers2012&p=1129879137987413#presentation\n" +
		"http://localhost:8880/welcome/?u=sasha2011&p=123368741638196871681#presentation\n" +
		"http://localhost:8880/welcome/?u=kristupas2011&p=19872393632987623897#presentation\n");
	div.append(urls);
	let divs = $("<div>").addClass("buttons");
	div.append(divs);
	let button = $("<div>").addClass("button");
	i18n._(button, data.language.set);
	divs.append(button);
	div.append(divs);

	$("body").append(div);

	let table = $("<div>").addClass("table");
	div.append(table);
	
	button.on("click", function() {
		let allUrls = [];
		for (let line of urls.val().split('\n')) {
			line = line.trim();
			if (line !== "") {
				allUrls.push(line);
			}
		}
		table.empty();
		{
			let row = $("<div>").addClass("row");
			for (let k in data) {
				let d = data[k];
				if (d.type !== undefined) {
					let p = plugins[d.type];
					let create = p(d, data.language).admin;
					if (create !== undefined) {
						let cell = $("<div>").addClass("cell").text(k);
						row.append(cell);
					}
				}
			}
			table.append(row);
		}
		for (let u of allUrls) {
			let row = $("<div>").addClass("row");
			table.append(row);
			async.run(
				nope.launch(u),
				(history) => {
					if (history !== null) {
						console.log(history.userId);
						return [
							history.history(),
							_ => console.log("EVENT", _),
							event => {
								delete event.from;
								delete event.to;
								let userData = {};
								userData.userId = history.userId;
								for (let e of event.old) {
									for (let k in e) {
										if (k === "language") {
											//
										} else {
											userData[k] = e[k];
										}
									}
								}

								for (let k in data) {
									let d = data[k];
									if (d.type !== undefined) {
										let p = plugins[d.type];
										let dd = userData[k];
										if (dd === undefined) {
											dd = {};
										}
										let create = p(d, data.language).admin;
										if (create !== undefined) {
											let cell = $("<div>").addClass("cell");
											cell.append(create(dd, userData));
											row.append(cell);
										}
									}
								}
							},
						];
					}
				},
			);
		}
	});
});
