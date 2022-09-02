import * as i18n from "./i18n.js";
// jquery

export default {
	generate: function(params, language) {
		return {
			create: function(_data, callback, allData) {
				let div = $("<div>");
				let divs = $("<div>").addClass("buttons");

				// let percentDiv = $("<div>").addClass("percent");
				// let rendering = false;

				let renderIt = function() {
					// percentDiv.text(0 + "%");

					let render = $("<div>").addClass("render");

					for (let block of params.generate) {
						let skipped = false;
						if (block.if !== undefined) {
							for (let kk in block.if) {
								if ((allData[kk] !== undefined) && (block.if[kk] !== allData[kk].value)) {
									skipped = true;
								}
							}
						}
						if (skipped) {
							continue;
						}
						for (let suffix of [ "", "_small", "_medium", "_large", "_tab" ]) {
							let d = null;
							if (block["image" + suffix] !== undefined) {
								d = $("<img>").addClass("image").attr("src", window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + "/res/" + block["image" + suffix]);
							}
							if (block["text" + suffix] !== undefined) {
								let replaceIn = function(tt, from, to) {
									let r = {};
									for (let kk in tt) {
										r[kk] = tt[kk].replace("{" + from + "}", to);
									}
									return r;
								};
								let t = block["text" + suffix];
								// console.log(allData);
								for (let k in allData) {
									// console.log(k, allData[k]);
									if (allData[k] !== null) {
										// console.log("REPLACING", k, allData[k], t);
										t = replaceIn(t, k, allData[k].value);
									}
								}
								t = replaceIn(t, "today", i18n.today());
								d = i18n._($("<div>").addClass("block"), t, true);
							}
							if (block["frame" + suffix] !== undefined) {
								d = $("<div>").addClass("frame");
							}
							if (d !== null) {
								if (suffix !== "") {
									d.addClass(suffix);
								}
								render.append(d);
							}
						}
					}

					let doc = "<html>\n"
					+ "<head>\n"
						+ "<style>\n"
							+ "body { width: 500px; margin: 0 auto; font-size: 14px; }\n"
							+ "img { display: block; margin: 30px auto; width: 300px; }\n"
							+ "img._small { width: 50px; margin: 0; }\n"
							+ "img._medium { width: 150px; margin: 0; }\n"
							+ "img._large { width: 300px; margin: 0; }\n"
							+ ".block { margin-bottom: 5px; text-align: justify; }\n"
							+ ".block._tab { font-style:italic; margin-bottom: 30px; margin-top: 20px; }\n"
							+ ".frame { width: 300px; margin: 10px auto; border: dotted 1px gray; height: 150px; padding: 5px; background: #eee; color: gray; }\n"
						+ "</style>\n"
					+ "</head>\n"
					+ "<body>\n"
						+ render.html()
						+ "\n"
						// + "<script>\n"
						// 	+ "window.focus();\n"
						// 	+ "window.onload = function() { console.log('PRINTING'); window.print(); };\n"
						// + "</script>\n"
					+ "</body>\n"
					+ "</html>\n";
					console.log("RENDER", doc);

					// var iframe = $("<iframe>").css("width", "0").css("height", "0").css("overflow", "hidden");
					// iframe.attr("src", "data:text/html;charset=utf-8," + encodeURIComponent(doc));
					// $("body").append(iframe);

					return doc;
				};

				let printButton = $("<a>").addClass("button"); // .addClass("secondary");
				i18n._(printButton, language.download);
				divs.append(printButton);
				printButton.on("click", function() {
					let w = window.open("");
			        w.document.write(renderIt());
					// renderIt();
					return false;
				});
				let continueButton = i18n._($("<div>").addClass("button").addClass("secondary"), language.continue);
				divs.append(continueButton);
				continueButton.on("click", function() {
					callback("");
				});

				// div.append(percentDiv);
				div.append(divs);
				return div;
			},

			destroy: function() {
			}
		};
	},
};
