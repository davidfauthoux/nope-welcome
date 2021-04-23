"use strict";

Plugins.none = function(params, language) {
	return {
		create: function(data, callback, allData) {
			let divs = $("<div>").addClass("buttons");
			let button = $("<div>").addClass("button");
			i18n(button, language.continue);
			button.click(function() {
				callback("");
			});
			divs.append(button);
			return divs;
		},
		destroy: function() {
		}
	};
};
