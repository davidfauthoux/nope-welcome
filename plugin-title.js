"use strict";

Plugins.titlePane = function(title, callback) {
	var div = $("<div>");
	var titleDiv = $("<div>").text(title);
	div.append(titleDiv);
	var button = $("<div>").text("Continue");
	div.append(button);
	button.click(function() {
		div.remove();
		callback();
	});
	mainDiv.append(div);
	return div;
};
