import * as i18n from "./i18n.js";
// jquery

export default {
	none: function(_params, language) {
		return {
			create: function(_data, callback, _allData) {
				let divs = $("<div>").addClass("buttons");
				let button = i18n._($("<div>").addClass("button"), language.continue);
				button.on("click", function() {
					callback("");
				});
				divs.append(button);
				return divs;
			},

			destroy: function() {
			},
		};
	},
};
