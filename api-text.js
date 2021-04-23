"use strict";

Plugins.text = function(params, language) {
	return {
		create: function(data, callback, allData) {
			let div = $("<div>");
			let predefined = $("<div>").addClass("predefined");
			div.append(predefined);
			if (params.predefined !== undefined) {
				console.log("PREDEFINED", params.predefined, allData);
				i18n(predefined, allData[params.predefined]);
			}
			let input = $("<textarea>");
			if (params.filled !== undefined) {
				input.val(i18nGetText(params.filled));
			}
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
				if (params.predefined === undefined) {
					if (v === "") {
						return;
					}
				}
				callback({
					value: v
				});
			});
			if (params.default !== undefined) {
				let defaultButton = $("<div>").addClass("button").addClass("secondary");
				i18n(defaultButton, params.default);
				divs.append(defaultButton);
				defaultButton.click(function() {
					callback({
						value: i18nGetText(params.default, true, true)
					});
				});
			}
			return div;
		},
		destroy: function() {
		}
	};
};
