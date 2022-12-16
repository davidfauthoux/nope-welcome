import * as i18n from "./i18n.js";
// jquery

export default {
	text: function(params, language) {
		return {
			create: function(data, callback, allData) {
				let div = $("<div>");
				let predefined = $("<div>").addClass("predefined");
				div.append(predefined);
				if (params.predefined !== undefined) {
					console.log("PREDEFINED", params.predefined, allData);
					if (allData[params.predefined] !== undefined) {
						// i18n._(predefined, allData[params.predefined]);
						predefined.text(allData[params.predefined]);
					}
				}
				let input = $("<textarea>");
				if (params.filled !== undefined) {
					input.val(i18n.getText(params.filled));
				}
				if (data !== undefined) {
					input.val(data.value);
				}
				div.append(input);
				let divs = $("<div>").addClass("buttons");
				div.append(divs);
				let button = i18n._($("<div>").addClass("button"), language.set);
				divs.append(button);
				button.on("click", function() {
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
					let defaultButton = i18n._($("<div>").addClass("button").addClass("secondary"), params.default);
					divs.append(defaultButton);
					defaultButton.on("click", function() {
						callback({
							value: i18n.getText(params.default, true, true)
						});
					});
				}
				return div;
			},
			
			destroy: function() {
			},

			admin: (data, _allData) => {
				if (data.value === undefined) {
					return undefined;
				}
				return data.value.replace(/,/g, ";").replace(/\n/g, "; ").replace(/\s+/g, ' ');
			},
		};
	},
};
