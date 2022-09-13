import * as async from "../modules/async.js";
import * as i18n from "./i18n.js";
import * as image from "../modules/image.js";
import { uuid } from "../modules/uuid.js";
import { Server } from "../modules/server.js";
// jquery

let globalInput;
$(function() {
	globalInput = $("<input>").attr("type", "file").css({ position: "absolute", top: 0, left: 0, width: 0, height: 0, opacity: 0 });
	$("body").append(globalInput);
});

export default {
	upload: function(_params, language) {
		return {
			create: function(data, callback, allData) {
				let url = new URL(window.location.href);
				let server = new Server(url.protocol + "//" + url.host + "/" + allData.userId);

				let div = $("<div>");
				let divs = $("<div>").addClass("buttons");
				if ((data !== undefined) && (data !== null)) {
					div.append($("<img>").attr("src", "/" + allData.userId + "/" + data.path));
					let button = $("<div>").addClass("button");
					let t = language.delete;
					i18n._(button, t);
					divs.append(button);
					let warnTimeoutId = null;
					button.on("click", function() {
						if (warnTimeoutId !== null) {
							clearTimeout(warnTimeoutId);
							warnTimeoutId = null;
							callback(undefined);
						} else {
							i18n._(button, language.confirm);
							warnTimeoutId = setTimeout(function() {
								warnTimeoutId = null;
								i18n._(button, t);
							}, 1500);
						}
					});
					div.append(divs);
					return div;
				}

				let button = i18n._($("<div>").addClass("button"), language.upload);
				divs.append(button);

				let percentDiv = $("<div>").addClass("percent");
				div.append(percentDiv);
				div.append(divs);

				button.on("click", function() {
					let blobFromComputer = function(accepted) {
						return async.async_((finish, _error) => {
							let input = globalInput;
							input.attr("accept", accepted);
							input.on("change", function() {
								let f = input[0].files[0];
								if (f !== undefined) {
									finish(f);
								}

								input.off();
								input[0].value = null;
								return false;
							});
							input.trigger("click");
						});
					};

					percentDiv.text(0 + "%");

					let sizeLimit = 3000;
					let path = "upload/" + uuid() + ".jpg";

					async.run([
						blobFromComputer("image/*,application/pdf"),
						(blob) => {
							if (blob.name.toLowerCase().endsWith(".pdf")) {
								return async._([
									async.async_((finish, error) => {
										let reader = new FileReader();
										reader.onload = function () {
											//%% pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";
											pdfjsLib.getDocument(reader.result).promise.then(function(pdf) {
												pdf.getPage(1).then(function(page) {
													let viewport = page.getViewport({ scale: 2 });
													let canvas = $("<canvas>")[0];
													let context = canvas.getContext("2d");
													canvas.height = viewport.height;
													canvas.width = viewport.width;
													page.render({
														canvasContext: context,
														viewport: viewport
													}).promise.then(function() {
														finish(canvas);
													});
												});
											});
										};
										reader.onerror = function(e) {
											error(e);
										};
										reader.readAsArrayBuffer(blob);
									}),
									(canvas) => image.canvasToBlob(canvas, "jpeg", 0.9),
								]);
							} else {
								return blob;
							}
						},
						(blob) => image.blobToImage(blob),
						(img) => image.imageToCanvas(image.Op.limit(image.Op.identity(), sizeLimit, sizeLimit), img),
						(canvas) => image.canvasToBlob(canvas, "jpeg", 0.9),
						(blob) => server.upload(path, blob, (p) => percentDiv.text(Math.round(p * 100) + "%")),
						() => {
							callback({
								path: path
							});
						}
					]);
				});
				return div;
			},

			destroy: function() {
			},

			admin: (data, allData) => {
				if (data.path === undefined) {
					return undefined;
				}
				return "/" + allData.userId + "/" + data.path;
			},
		};
	},
};
