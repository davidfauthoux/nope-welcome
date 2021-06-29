import * as i18n from "./i18n.js";
// jquery

export default {
	generate: function(params, language) {
		return {
			create: function(data, callback, allData) {
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
						if (block.icon !== undefined) {
							render.append($("<img>").addClass("image").attr("src", "res/" + block.icon + ".png"));
						}
						if (block.text !== undefined) {
							let replaceIn = function(tt, from, to) {
								let r = {};
								for (let kk in tt) {
									r[kk] = tt[kk].replace("{" + from + "}", to);
								}
								return r;
							};
							let t = block.text;
							// console.log(allData);
							for (let k in allData) {
								// console.log(k, allData[k]);
								if (allData[k] !== null) {
									// console.log("REPLACING", k, allData[k], t);
									t = replaceIn(t, k, allData[k].value);
								}
							}
							t = replaceIn(t, "today", new Date().toDateString());
							render.append(i18n._($("<div>").addClass("block"), t, true));
						}
						if (block.frame !== undefined) {
							render.append(i18n._($("<div>").addClass("frame"), block.frame, true));
						}
					}

					let doc = "<html><head><script src='../jquery.min.js'></script><style>body { width: 500px; margin: 0 auto; font-size: 14px; } img { display: block; margin: 30px auto; width: 300px; } .block { margin-bottom: 5px; text-align: justify; } .frame { width: 300px; margin: 10px auto; border: dotted 1px gray; height: 150px; padding: 5px; background: #eee; color: gray; } </style></head><body>" + render.html() + "<script>window.focus(); $(window).on('load', window.print); window.onafterprint = function(){ window.close(); };</script></body></html>";
					console.log("RENDER", doc);
					let w = window.open("", "_blank");
					w.document.write(doc);
					w.document.close();
				};

				let printButton = $("<a>").addClass("button"); // .addClass("secondary");
				i18n._(printButton, language.download);
				divs.append(printButton);
				printButton.on("click", function() {
					renderIt();
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
