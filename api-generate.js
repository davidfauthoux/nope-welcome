"use strict";

Plugins.generate = function(params, language) {
	return {
		create: function(data, callback, allData, server) {
			let div = $("<div>");
			let divs = $("<div>").addClass("buttons");

			// let percentDiv = $("<div>").addClass("percent");
			let rendering = false;

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
							for (let kk in tt) {
								tt[kk] = tt[kk].replace("{" + from + "}", to);
							}
							return tt;
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
						render.append(i18n($("<div>").addClass("block"), t, true));
					}
					if (block.frame !== undefined) {
						render.append(i18n($("<div>").addClass("frame"), block.frame, true));
					}
				}

				var w = window.open("", '_blank');
				w.document.write("<html><head><style>body { width: 500px; margin: 0 auto; font-size: 14px; } img { display: block; margin: 30px auto; width: 300px; } .block { margin-bottom: 5px; text-align: justify; } .frame { width: 300px; margin: 10px auto; border: dotted 1px gray; height: 150px; padding: 5px; background: #eee; color: gray; } </style></head><body>" + render.html() + "<script>window.print();</script></body></html>");
				w.document.close(); 

				// let cut = $("<div>");
				// cut.css("position", "absolute");
				// cut.css("top", "0");
				// cut.css("left", "0");
				// cut.css("overflow", "scroll");
				// cut.css("width", "0");
				// cut.css("height", "0");
				// cut.append(render);
				// $("body").prepend(cut);

				// window.scrollTo(0, 0);
				// html2canvas(render[0]).then(function(canvas) { // Will not be updated according to language if flag clicked
				// 	cut.remove();

				// 	let uploadDirectory = "upload";
				// 	let imageType = "jpeg";
				// 	let jpegQuality = 0.9;
				
				// 	let nameHeap = new Heap("generated.jpg");
				// 	let outputBlobHeap = new Heap();
				// 	let outputPathHeap = new Heap();
				
				// 	try_(sequence_(
				// 		ImageUtils.canvasToBlob(new Heap(canvas), new Heap(imageType), new Heap(jpegQuality), outputBlobHeap),
				// 		UploadUtils.uploadBlob(server, new Heap(uploadDirectory), outputBlobHeap, nameHeap, {
				// 			set: function(p) {
				// 				percentDiv.text(Math.round(p * 100) + "%");
				// 			}
				// 		}, outputPathHeap)))
				// 	.res(function() {
				// 		rendering = false;
				// 		printButton.off("click");
				// 		printButton.attr("download", "").attr("href", server.base + "/" + outputPathHeap.get()).attr("target", "_blank");
				// 		setTimeout(function() {
				// 			printButton[0].click();
				// 		}, 0);
				// 	}).run();
				// });
			};

			let printButton = $("<a>").addClass("button"); // .addClass("secondary");
			i18n(printButton, language.download);
			divs.append(printButton);
			printButton.click(function() {
				if (printButton.attr("href") !== undefined) {
					console.log("CLICK", printButton.attr("href"));
					return true;
				}
				if (rendering) {
					return;
				}
				rendering = true;
				renderIt();
				return false;
			});
			let continueButton = $("<div>").addClass("button").addClass("secondary");
			i18n(continueButton, language.continue);
			divs.append(continueButton);
			continueButton.click(function() {
				callback("");
			});

			// div.append(percentDiv);
			div.append(divs);
			return div;
		},
		destroy: function() {
		}
	};
};
