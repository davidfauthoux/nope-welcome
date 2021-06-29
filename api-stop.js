import * as i18n from "./i18n.js";
// jquery

export default {
	stop: function(params, language) {
		return {
			create: function(data, callback, allData) {
				return $("<div>");
			},

			destroy: function() {
			},
		};
	},
};
