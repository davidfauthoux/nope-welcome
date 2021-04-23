"use strict";

Plugins.choice = function(params, language) {
	return {
		create: function(data, callback, allData) {
			let divs = $("<div>").addClass("options");
			for (let t in params.options) {
				let div = $("<div>");
				divs.append(div);
				if ((data !== undefined) && (data.value === t)) {
					div.addClass("checked");
				}
				div.append($("<img>").attr("src", "res/" + t + ".png"));
				div.append(i18n($("<div>"), params.options[t]));
				div.click(function() {
					callback({
						value: t
					});
				});
			}
			return divs;
		},
		destroy: function() {
		}
	};
};
