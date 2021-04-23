"use strict";

Plugins.upload = function(params, language) {
	return {
		create: function(data, callback, allData, server) {
			let div = $("<div>");
			let divs = $("<div>").addClass("buttons");
			if ((data !== undefined) && (data !== null)) {
				div.append($("<img>").attr("src", server.base + "/" + data.path));
				let button = $("<div>").addClass("button");
				let t = language.delete;
				i18n(button, t);
				divs.append(button);
				let warnTimeoutId = null;
				button.click(function() {
					if (warnTimeoutId !== null) {
						clearTimeout(warnTimeoutId);
						warnTimeoutId = null;
						callback(undefined);
					} else {
						i18n(button, language.confirm);
						warnTimeoutId = setTimeout(function() {
							warnTimeoutId = null;
							i18n(button, t);
						}, 1500);
					}
				});
				div.append(divs);
				return div;
			}

			let button = $("<div>").addClass("button");
			i18n(button, language.upload);
			divs.append(button);

			let percentDiv = $("<div>").addClass("percent");
			div.append(percentDiv);
			div.append(divs);

			button.click(function() {

				let uploadDirectory = "upload";
				let imageType = "jpeg";
				let jpegQuality = 0.9;
				let sizeLimit = 3000;
			
				let inputBlobHeap = new Heap();
				let nameHeap = new Heap();
				let imageHeap = new Heap();
				let orientationHeap = new Heap();
				let canvasHeap = new Heap();
				let outputBlobHeap = new Heap();
				let outputPathHeap = new Heap();
			
				percentDiv.text(0 + "%");

				try_(sequence_(
					UploadUtils.blobFromComputer(new Heap("image/*,application/pdf"), inputBlobHeap, nameHeap),
					do_(function() {
						if (nameHeap.get().toLowerCase().endsWith(".pdf")) {
							return new Async(function(finish) {
								let reader = new FileReader();
								reader.onload = function () {
									pdfjsLib.getDocument(reader.result).promise.then(function(pdf) {
										pdf.getPage(1).then(function(page) {
											let viewport = page.getViewport({ scale: 2 });
											let canvas = $("<canvas>")[0];
											let context = canvas.getContext("2d");
											canvas.height = viewport.height;
											canvas.width = viewport.width;
											//%% $("body").append($(canvas));
											page.render({
												canvasContext: context,
												viewport: viewport
											}).promise.then(function() {
												nameHeap.set(nameHeap.get() + ".jpg");
												let imageType = "jpeg";
												let jpegQuality = 0.9;
												try_(
													ImageUtils.canvasToBlob(new Heap(canvas), new Heap(imageType), new Heap(jpegQuality), inputBlobHeap))
												.res(finish).err(finish).run();
											});
										});
									});
								};
								reader.onerror = function(e) {
									console.log(e);
								};
								reader.readAsArrayBuffer(inputBlobHeap.get());
							});
						} else {
							return noop_();
						}
					}),
					ImageUtils.blobToImage(inputBlobHeap, imageHeap, orientationHeap),
			
					ImageUtils.imageToCanvas(
						ImageUtils.limitOp(ImageUtils.identityOp(), new Heap(sizeLimit), new Heap(sizeLimit)),
						imageHeap,
						orientationHeap,
						canvasHeap
					),
					ImageUtils.canvasToBlob(canvasHeap, new Heap(imageType), new Heap(jpegQuality), outputBlobHeap),
					UploadUtils.uploadBlob(server, new Heap(uploadDirectory), outputBlobHeap, nameHeap, {
						set: function(p) {
							percentDiv.text(Math.round(p * 100) + "%");
						}
					}, outputPathHeap)))
				
				.res(function() {
					callback({
						path: outputPathHeap.get()
					});
				})
				.run();
			});
			return div;
		},
		destroy: function() {
		}
	};
};
