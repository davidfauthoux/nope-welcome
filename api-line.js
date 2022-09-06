import * as i18n from "./i18n.js";
// jquery

export default {
	line: function(_params, language) {
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
				i18n._(button, language.set);
				divs.append(button);
				button.on("click", function() {
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
			},

			admin: (data, _allData) => {
				return $("<div>").text(data.value);
			},
		};
	},
};
