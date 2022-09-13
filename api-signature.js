import * as i18n from "./i18n.js";
// jquery

export default {
	signature: function(params, language) {
		let intervalId = undefined;

		let renderIt = function(date, allData, usedLanguage) {
			console.log("RENDERING USING LANGUAGE: ", usedLanguage);

			let _i18n = (t) => t[usedLanguage] || t["en"];

			let render = $("<div>");

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
				let d = null;
				if (block["image"] !== undefined) {
					d = $("<img>").addClass("image").attr("src", window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + "/res/" + block["image"]);
				}
				if (block["text"] !== undefined) {
					let replaceIn = function(tt, from, to) {
						let r = {};
						for (let kk in tt) {
							r[kk] = tt[kk].replace("{" + from + "}", to);
						}
						return r;
					};
					let t = block["text"];
					// console.log(allData);
					for (let k in allData) {
						// console.log(k, allData[k]);
						if (allData[k] !== null) {
							// console.log("REPLACING", k, allData[k], t);
							t = replaceIn(t, k, allData[k].value);
						}
					}
					t = replaceIn(t, "today", (date === undefined) ? "/" : date);

					let replaceUnknown = function(tt, to) {
						let r = {};
						for (let kk in tt) {
							r[kk] = tt[kk].replace(/\{[a-z]+\}/g, to);
						}
						return r;
					};
					;

					t = replaceUnknown(t, "[" + _i18n(language.mustbefilled) + "]");
					d = $("<div>").addClass("block").html(_i18n(t)).addClass("i18n-simplified");
				}
				if (block["frame"] !== undefined) {
					d = $("<div>").addClass("frame");
					let t = block["frame"];
					let td = $("<div>").addClass("inframe").html(_i18n(t)).addClass("i18n-simplified");
					d.append(td);
					d.append($("<div>").addClass("canvas").attr("id", "canvas"));
				}
				if (d !== null) {
					render.append(d);
				}
			}

			return render.html();
		};

		let compare = (a, b) => {
			return a.replace(/\s/g, '') === b.replace(/\s/g, '');
		};

		return {
			create: function(data, callback, allData) {
				let width = 250;
				let height = 200;
				
				let canvas = document.createElement("canvas");
				let scale = 2;
				let gap = 2 * scale;
				canvas.width  = width * scale;
				canvas.height = height * scale;
				
				canvas.style.width = width + "px";
				canvas.style.height = height + "px";
				
				let div = $("<div>");
				let renderDiv = $("<div>").addClass("signaturerender");
				div.append(renderDiv);

				let date = undefined;
				let signature = undefined;
				let usedLanguage = allData.language;
				if (data !== undefined) {
					date = data.date;
					signature = data.signature;
					usedLanguage = data.language || allData.language;
				}
				if (date === undefined) {
					date = i18n.today();
				}

				let rendered = renderIt(date, allData, usedLanguage);
				if ((data !== undefined) && (data.document !== undefined) && !compare(data.document, rendered)) {
					console.log("INVALIDATING DOCUMENT, IT HAS CHANGED");
					console.log(data.document);
					console.log(rendered);
					signature = undefined;
					date = i18n.today();
					usedLanguage = allData.language;
					rendered = renderIt(date, allData, usedLanguage);
				}

				renderDiv.append(rendered);
				renderDiv.find("#canvas").append($(canvas));

				let points = [];

				let context = canvas.getContext("2d");
				context.imageSmoothingEnabled = true;
				context.lineWidth = 2;
				context.strokeStyle = "black";
				context.lineCap = "round";

				let preventDefault = (e) => e.preventDefault();
				let disableScroll = () => {
					document.body.addEventListener("touchmove", preventDefault, { passive: false });
				};
				let enableScroll = () => {
					document.body.removeEventListener("touchmove", preventDefault);
				};
				
				let dragging = false;
				let down = () => {
					context.beginPath();
					dragging = true;
					disableScroll();
					points.push(null);
				};
				let up = () => {
					if (dragging) {
						dragging = false;
						enableScroll();
					}
				};
				let last = null;
				let move = (e) => {
					if (dragging) {
						let rect = e.target.getBoundingClientRect();
						let x = e.clientX - rect.left; // x position within the element.
						let y = e.clientY - rect.top;  // y position within the element.
						x *= scale;
						y *= scale;
						if ((last === null) || ((Math.abs(last.x - x) + Math.abs(last.y - y)) > gap)) {
							last = {x, y};
							points.push(last);
							if (points.length === 1) {
								context.moveTo(points[points.length - 1].x, points[points.length - 1].y);
							} else if ((points.length % 2) === 0) {
								let xc = (points[points.length - 2].x + points[points.length - 1].x) / 2;
								let yc = (points[points.length - 2].y + points[points.length - 1].y) / 2;
								context.quadraticCurveTo(points[points.length - 2].x, points[points.length - 2].y, xc, yc);
								context.stroke();
							}
						}
					}
				};
				
				canvas.addEventListener("mousedown", down);
				document.addEventListener("mouseup", up);
				canvas.addEventListener("mousemove", move);
				
				canvas.addEventListener("touchstart", down);
				document.addEventListener("touchend", up);
				canvas.addEventListener("touchmove", (e) => {
					move({
						target: e.target,
						clientX: e.changedTouches[0].clientX,
						clientY: e.changedTouches[0].clientY,
					});
				});

				if (signature !== undefined) {
					for (let p of signature) {
						if (p === null) {
							context.beginPath();
						} else {
							points.push(p);
							context.lineTo(p.x, p.y);
							context.stroke();
						}
					}
				}

				let divs = $("<div>").addClass("buttons");
				div.append(divs);

				let eraseButton = $("<div>").addClass("button").addClass("secondary");
				i18n._(eraseButton, language.erase);
				divs.append(eraseButton);

				let button = $("<div>").addClass("button");
				i18n._(button, language.validate);
				divs.append(button);

				eraseButton.on("click", function() {
					context.clearRect(0, 0, canvas.width, canvas.height);
					points = [];
					date =  i18n.today();
					usedLanguage = allData.language;
					rendered = renderIt(date, allData, usedLanguage);
					renderDiv.empty().append(rendered);
					renderDiv.find("#canvas").append($(canvas));
				});

				button.on("click", function() {
					callback({
						signature: points,
						document: rendered,
						date: date,
						language: usedLanguage,
					});
				});

				return div;
			},

			destroy: function() {
				clearInterval(intervalId);
			},

			admin: (data, allData) => {
				let date = undefined;
				if (data !== undefined) {
					date = data.date;
				}
				if ((date !== undefined) && (data.document !== undefined)) {
					if (!compare(data.document, renderIt(date, allData, data.language || allData.language))) {
						date = undefined;
					}
				}
				return date;
			},
		};
	},
};
