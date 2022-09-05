import * as i18n from "./i18n.js";
// jquery

export default {
	choice: function(params, _language) {
		return {
			create: function(data, callback, _allData) {
				let divs = $("<div>").addClass("options");
				for (let t in params.options) {
					let div = $("<div>");
					divs.append(div);
					if ((data !== undefined) && (data.value === t)) {
						div.addClass("checked");
					}
					div.append($("<img>").attr("src", "res/" + t + ".png"));
					div.append(i18n._($("<div>"), params.options[t]));
					div.on("click", function() {
						callback({
							value: t
						});
					});
				}
				return divs;
			},

			destroy: function() {
			},

			admin: (data, _allData) => {
				return $("<div>").text(data.value);
			},
		};
	},
};
