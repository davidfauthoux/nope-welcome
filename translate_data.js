const fs = require('fs');

const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate({
	projectId: "davfxx",
	credentials: JSON.parse(fs.readFileSync("google-credentials.json", "utf8"))
});

let data = eval("(function() { " + fs.readFileSync("data.js", "utf8") + "; return data; })()");
// console.log(data);

let tasks = {};
let browse = function(o) {
	if (typeof o === "string") {
		return;
	}

	if (typeof o === Array) {
		for (let v of o) {
			browse(v);
		}
		return;
	}

	for (let k in o) {
		if (k === "en") {
			if (tasks[o[k]] === undefined) {
				tasks[o[k]] = [];
			}
			tasks[o[k]].push(o);
		}
		browse(o[k]);
	}
};
browse(data);

let texts = [];
for (let t in tasks) {
	texts.push(t);
}

(async function() {
	for (let target of [ "lt", "lv", "ru", "fi", "sv", "da", "et:ee" ]) {
		let countryCode = target;
		let k = target.indexOf(':');
		if (k >= 0) {
			countryCode = target.substring(k + 1);
			target = target.substring(0, k);
		}

		let translations = [];
		let ii = 0;
		while (ii < texts.length) {
			let textParts = [];
			for (let kk = ii; kk < texts.length; kk++) {
				textParts.push(texts[kk]);
				if (textParts.length === 100) {
					break;
				}
			}
			translations = translations.concat((await translate.translate(textParts, target))[0]);
			ii += textParts.length;
		}

		let i = 0;
		for (let tt in tasks) {
			for (let a of tasks[tt]) {
				a["_" + countryCode] = translations[i];
			}
			i++;
		}
	}
	
	let output = JSON.stringify(data, null, '\t');
	fs.writeFileSync("data.json", output, "utf8");	
})();
