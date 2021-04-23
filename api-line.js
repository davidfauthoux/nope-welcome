"use strict";

Plugins.line = function(params, language) {
	return {
		create: function(data, callback, allData) {
			let div = $("<div>");
			let input = $("<input>");
			if (data !== undefined) {
				input.val(data.value);
			}
			div.append(input);
			let divs = $("<div>").addClass("buttons");
			div.append(divs);
			let button = $("<div>").addClass("button");
			i18n(button, language.set);
			divs.append(button);
			button.click(function() {
				let v = input.val().trim();
				if (v === "") {
					return;
				}
				callback({
					value: v
				});
			});
			return div;
		},
		destroy: function() {
		}
	};
};
