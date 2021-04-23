const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate();

const fs = require('fs');

let data = eval("(function() { " + fs.readFileSync("welcome/data.js", "utf8") + "; return data; })()");
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
	for (let target of [ "lt", "lv", "ru", "fi", "et", "sv", "da" ]) {
		let translations = (await translate.translate(texts, target))[0];

		let i = 0;
		for (let tt in tasks) {
			for (let a of tasks[tt]) {
				a["_" + target] = translations[i];
			}
			i++;
		}
	}
	
	let output = JSON.stringify(data, null, '\t');
	fs.writeFileSync("welcome/data.json", output, "utf8");	
})();
