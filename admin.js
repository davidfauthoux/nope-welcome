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
	urls.val("");
	div.append(urls);
	let divs = $("<div>").addClass("buttons");
	div.append(divs);
	let button = $("<div>").addClass("button");
	i18n._(button, data.language.set);
	divs.append(button);
	div.append(divs);

	$("body").append(div);

	let tables = $("<div>").addClass("tables");
	let table = $("<div>").addClass("table");
	tables.append($("<div>").addClass("noscroll").append(table));
	let extraTable = $("<div>").addClass("table");
	tables.append($("<div>").addClass("scroll").append(extraTable));
	div.append(tables);
	
	let leftCells = ["firstname", "lastname", "jerseynumber"];
	let copyCells = [
		"jerseynumber", "jerseyanimal", "firstname", "lastname", "dateofbirth",
		"passportnumber", "passportissue", "passportexpiry", "nationality",
		"phone", "emails", "postaladdress",
	];
    let unexpected = {
        "passportback": "",
        "leftrighthanded": "left",
    };
    let unexpectedClass = {
        "leftrighthanded": "exception",
    };

	button.on("click", function() {
		let allDataToCopy = [];
		let allUrls = [];
		for (let line of urls.val().split('\n')) {
			line = line.trim();
			if (line !== "") {
				let i = line.indexOf('#');
				if (i >= 0) {
					line = line.substring(0, i);
				}
				allUrls.push(line);
			}
		}
		table.empty();
		extraTable.empty();
		{
			let row = $("<div>").addClass("row").addClass("header");
			let extraRow = $("<div>").addClass("row").addClass("header");
			{
				let cell = $("<div>").addClass("cell");
				cell.append($("<div>").text(""));
				row.append(cell);
			}
			{
				let cell = $("<div>").addClass("cell");
				cell.append($("<div>").text("[copy]").addClass("clickable").click(() => {
					let t = (["url"].concat(copyCells)).join(", ") + "\n";
					for (let dataToCopy of allDataToCopy) {
						if (dataToCopy !== null) {
							t += dataToCopy().join(", ") + "\n";
						}
					}
					navigator.clipboard.writeText(t);
				}));
				row.append(cell);
			}
			table.append(row);
			extraTable.append(extraRow);
			for (let k in data) {
				if (k.startsWith('_')) {
					continue;
				}
				let d = data[k];
				if (d.type !== undefined) {
					let p = plugins[d.type];
					let create = p(d, data.language).admin;
					if (create !== undefined) {
						let cell = $("<div>").addClass("cell").text(k);
						let usedRow;
						if (leftCells.includes(k)) {
							usedRow = row;
						} else {
							usedRow = extraRow;
						}
						usedRow.append(cell);
					}
				}
			}
		}
		let even = true;
		for (let u of allUrls) {
			let indexAllDataToCopy = allDataToCopy.length;
			allDataToCopy.push(null);
			let row = $("<div>").addClass("row").addClass(even ? "even" : "odd");
			let extraRow = $("<div>").addClass("row").addClass(even ? "even" : "odd");
			even = !even;
			table.append(row);
			extraTable.append(extraRow);
			let loadingCell = $("<div>").addClass("cell");
			loadingCell.append($("<div>").text("..."));
			extraRow.append(loadingCell);
			async.run(
				nope.launch(u),
				(history) => {
					if (history !== null) {
						let dataToCopy = () => null;
						{
							let cell = $("<div>").addClass("cell");
							cell.append($("<div>").text(history.userId).addClass("clickable").click(() => {
								window.open(u + "&admin=");
							}));
							row.append(cell);
						}
						{
							let cell = $("<div>").addClass("cell");
							cell.append($("<div>").text("[copy]").addClass("clickable").click(() => {
								navigator.clipboard.writeText(dataToCopy().join(", "));
							}));
							row.append(cell);
						}
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

								loadingCell.remove();
								for (let k in data) {
									if (k.startsWith('_')) {
										continue;
									}
									let d = data[k];
									if (d.type !== undefined) {
										let p = plugins[d.type];
										let dd = userData[k] || {};
										let create = p(d, data.language).admin;
										if (create !== undefined) {
											let cell = $("<div>").addClass("cell");
											let t = create(dd, userData);
											let inner;
                                            if ((t !== undefined) && t.startsWith('/')) {
                                                inner = $("<a>").attr("href", t).text("[open]");
                                            } else if (t === unexpected[k]) {
												inner = $("<div>").text(t || "---");
												cell.addClass(unexpectedClass[k] || "incomplete");
											} else {
												inner = $("<div>").text(t || "-");
											}
                                            cell.append(inner);
											let usedRow;
											if (leftCells.includes(k)) {
												usedRow = row;
											} else {
												usedRow = extraRow;
											}
											usedRow.append(cell);
										}
									}
								}
								dataToCopy = () => {
									let toCopy = [];
									toCopy.push(u);
									for (let k of copyCells) {
										console.log(k, data[k]);
										let d = data[k];
										if ((d !== undefined) && (d.type !== undefined)) {
											let p = plugins[d.type];
											let dd = userData[k];
											if (dd === undefined) {
												dd = {};
											}
											let create = p(d, data.language).admin;
											if (create !== undefined) {
												let t = create(dd, userData);
												if (t === undefined) {
													t = "xxx";
												}
												if (t.startsWith('+') || t.startsWith('=')) {
													t = "'" + t;
												}
												toCopy.push(t);
											}
										}
									}
									return toCopy;
								};
								allDataToCopy[indexAllDataToCopy] = dataToCopy;
							},
						];
					}
				},
			);
		}
	});
});
