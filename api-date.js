import * as i18n from "./i18n.js";
// jquery

export default {
	date: function(params, language) {
		return {
			create: function(data, callback, allData) {
				let div = $("<div>");
				let input = $("<input>");
				if (data !== undefined) {
					input.val(data.value);
				}
				let divs = $("<div>").addClass("buttons");
				let validateButton = i18n._($("<div>").addClass("button"), language.validate);
				let setButton = i18n._($("<div>").addClass("button"), language.set);
				let explanation = $("<div>").addClass("explanation");
				divs.append(validateButton);
				divs.append(setButton);
				input.on("input", function() {
					validateButton.show();
					setButton.hide();
					explanation.text("").removeClass("invalid").removeClass("check");
				});
				validateButton.show();
				setButton.hide();
				let date = null;
				validateButton.on("click", function() {
					let v = input.val().trim();
					if (v === "") {
						return;
					}

					let year;
					let month;
					let day;

					explanation.text("").removeClass("invalid").removeClass("check");

					let s = [];
					for (let ss of v.split(/[^0-9]/g)) {
						ss = ss.trim();
						if (ss === "") {
							continue;
						}
						s.push(ss);
					}
					//%% console.log(s);
					if (s.length === 2) {
						s.push(new Date().getFullYear());
					}
					if (s.length !== 3) {
						i18n._(explanation.addClass("invalid"), language.invaliddate);
						return;
					} else {
						try {
							let a = parseInt(s[0]);
							let b = parseInt(s[1]);
							let c = parseInt(s[2]);
							if (a > 31) {
								year = a;
								month = b;
								day = c;
								if (month > 12) {
									month = c;
									day = b;
								}
							} else if (c > 31) {
								year = c;
								month = b;
								day = a;
								if (month > 12) {
									month = a;
									day = b;
								}
							} else {
								throw "invalid";
							}
							if (year < 1900) {
								year += 1900;
							}
						} catch (e) {
							i18n._(explanation.addClass("invalid"), language.invaliddate);
							return;
						}
					}

					date = year + "/" + ((month < 10) ? "0" : "") + month + "/" + ((day < 10) ? "0" : "") + day;
					explanation.addClass("valid").text(new Date(date).toDateString());

					validateButton.hide();
					setButton.show();
				});
				setButton.on("click", function() {
					callback({
						value: date
					});
				});

				div.append(input);
				div.append(explanation);
				div.append(divs);
				return div;
			},

			destroy: function() {
			}
		};
	},
};
