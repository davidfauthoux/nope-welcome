"use strict";

Plugins.upload = function(title, attachUpload, callback, inputId, setValue) {
	var div = $("<div>");
	var titleDiv = $("<div>").text(title);
	div.append(titleDiv);
	if (inputId !== undefined) {
		titleDiv.attr("id", inputId);
	}
	if (setValue !== undefined) {
		var image = $("<img>").attr("src", setValue);
		div.append(image);
		var button = $("<div>").text("Delete");
		div.append(button);
		button.click(function() {
			div.remove();
			callback(undefined);
		});
	} else {
		attachUpload(titleDiv, function(percent) {
			console.log(percent);
		}, function(e) {
			console.log("ERROR", e);
		}, function(path) {
			console.log("PATH", path);
			titleDiv.remove();
			var image = $("<img>").attr("src", path);
			div.append(image);
			var refuse = $("<div>").text("Delete");
			div.append(refuse);
			refuse.click(function() {
				div.remove();
				callback(undefined);
			});
			var button = $("<div>").text("Continue");
			div.append(button);
			button.click(function() {
				div.remove();
				callback(path);
			});
		});
	}
	mainDiv.append(div);
	return div;
};
