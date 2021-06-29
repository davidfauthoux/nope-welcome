import * as i18n from "./i18n.js";
// jquery

export default {
	multipletext: function(params, language) {
		return {
			create: function(data, callback, allData) {
				let div = $("<div>");

				let dataList = [];
				if (data !== undefined) {
					for (let d of data.values) {
						dataList.push(d);
					}
				}
				dataList.push(undefined);

				let inputs = [];
				for (let d of dataList) {
					let predefined = $("<div>").addClass("predefined");
					div.append(predefined);
					if (params.predefined !== undefined) {
						console.log("PREDEFINED", params.predefined, allData);
						i18n._(predefined, allData[params.predefined]);
					}
					let input = $("<textarea>");
					if (d !== undefined) {
						input.val(d);
					}
					div.append(input);

					inputs.push(input);
				}

				let divs = $("<div>").addClass("buttons");
				div.append(divs);
				let button = i18n._($("<div>").addClass("button"), language.send);
				divs.append(button);
				button.on("click", function() {
					let values = [];
					for (let input of inputs) {
						let v = input.val().trim();
						if (v === "") {
							continue;
						}
						values.push(v);
					}
					callback({
						values: values
					});
				});
				return div;
			},
			
			destroy: function() {
			}
		};
	},
};
