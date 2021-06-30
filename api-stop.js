// jquery

export default {
	stop: function(_params, _language) {
		return {
			create: function(_data, _callback, _allData) {
				return $("<div>");
			},

			destroy: function() {
			},
		};
	},
};
