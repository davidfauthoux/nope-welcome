import * as i18n from "./i18n.js";
// jquery

export default {
	signature: function(params, language) {
		let intervalId = undefined;
		let renderedLanguage = undefined;
		return {
			create: function(data, callback, allData) {
				let width = 250;
				let height = 200;
				
				let canvas = document.createElement("canvas");
				let scale = 2;
				canvas.width  = width * scale;
				canvas.height = height * scale;
				
				// canvas.style.background = "white";
				canvas.style.width = width + "px";
				canvas.style.height = height + "px";
				
				let renderIt = function() {
					renderedLanguage = i18n.get();

					let render = $("<div>").addClass("signaturerender");

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

								let replaceUnknown = function(tt, to) {
									let r = {};
									for (let kk in tt) {
										r[kk] = tt[kk].replace(/\{[a-z]+\}/g, to);
									}
									return r;
								};
								;

								t = replaceUnknown(t, "[" + i18n.getText(language.mustbefilled, true) + "]");
								d = i18n._($("<div>").addClass("block"), t, true);
							}
							if (block["frame" + suffix] !== undefined) {
								d = $("<div>").addClass("frame");
								let t = block["frame" + suffix];
								let td = i18n._($("<div>").addClass("inframe"), t, true);
								d.append(td);
								d.append($(canvas));
							}
							if (d !== null) {
								if (suffix !== "") {
									d.addClass(suffix);
								}
								render.append(d);
							}
						}
					}

					return render;
				};

				let div = $("<div>");
				let renderDiv = $("<div>");
				div.append(renderDiv);
				renderDiv.append(renderIt());

				let points = [];

				let context = canvas.getContext("2d");
				context.imageSmoothingEnabled = true;
				context.lineWidth = 2;
				context.strokeStyle = "black";
				
				let disableScroll = () => {
					document.body.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
				};
				let enableScroll = () => {
					document.body.removeEventListener("touchmove", (e) => e.preventDefault());
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
				let move = (e) => {
					if (dragging) {
						let rect = e.target.getBoundingClientRect();
						let x = e.clientX - rect.left; // x position within the element.
						let y = e.clientY - rect.top;  // y position within the element.
						x *= scale;
						y *= scale;
						points.push({x, y});
						context.lineTo(x, y);
						context.stroke();
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

				if (data !== undefined) {
					try {
						for (let p of data.value) {
							if (p === null) {
								context.beginPath();
							} else {
								points.push(p);
								context.lineTo(p.x, p.y);
								context.stroke();
							}
						}
					} catch (ee) { // TODO Remove when everyone is updated (no more upload like before)
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
				});

				button.on("click", function() {
					console.log(points);
					callback({
						value: points
					});
				});

				intervalId = setInterval(() => {
					if (renderedLanguage !== i18n.get()) {
						renderDiv.empty().append(renderIt());
					}
				}, 0.25 * 1000);

				return div;
			},

			destroy: function() {
				clearInterval(intervalId);
			}
		};
	},
};
