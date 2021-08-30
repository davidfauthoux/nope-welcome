// import * as credentials from './google-credentials.json'; 

const {Translate} = require("@google-cloud/translate").v2;
const translate = new Translate({
	projectId: "davfxx",
	credentials:{
		"type": "service_account",
		"project_id": "davfxx",
		"private_key_id": "a6771b3701cfd70838a5f08a6512d8d4d00c856a",
		"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDExxWYc6DOJbXV\nJZT4JSn3shkc1Y5KjJbGkZnPVmxOv4IGRdskbS7Eu/7QxhcCMf57VXYvf/gJcPJw\npsaHi+i4J/gmnwiTzHruJ193Mim+kCPN0w8Zq9I/fKF+wGzX27kmHVb+L94h/5hU\nueVr8UwWQitmCQLkZK6BojMsA9+A5nTfH5eON+YsCtptNQdGk8DkYrbSB84ijQyU\nwu60h22Fpht5karEo81lE90OauOGmJuQX+yOP60jyg0EQJ1U2SBUEyWjCJnI0OqF\neRTj27DRTn7PsRn8AGjgd6bbkDNfzo2zGLu0CvMn6hQg2xKd5nXUzIwUeUi8Yr29\n1QGRTc7nAgMBAAECggEAPJ5L08wDBJ5vVnseWhcwx4JQ5CYRkHug0wj1hf7MnLG4\nP3BzotQTrT1wsSXk3qNCDwJzxww3/8iQlw15aTY7eceuVU92l/lNAWKVsSV94JuM\nvBJBu5nHyhD9uwtSPGkOr2QocWOTnYuchLVDrK4Hz2+Q6PzrrCor6/lopC2JQ66w\nl2NTVVbi1knV6WL6J9DQVTbwICggaGZ4hPSlX4GT5jNr3pHm1VULG8L4hDRfy9gL\nOLV9aCzeMw8T7TOnRbx2UmyVz/1885aQaF6fkUwHCP7SxN9pnK+k+lDS/A6+0aYX\n1LdqZ7KuYZZkH2ctq00G73seMJf/Hk0fUT2YQDDaaQKBgQDgt682MCr4GauBGDtF\nKSpD0AjMs2PhRyw3xDfNKjWVdiri82mWwW3WUrP7a5KeEZ4SdrwGhKS7hkyOXquf\nhD+ngWAUJ4V3gWON0sFUIEojB+Dd5VhaZE4uqcnPJlUXjKhKUh8F49apuphIbyNE\n0r3MkLDcS2HiiGhlFbD5Kz75qwKBgQDgK7NZDa5Iba/AWwNGMbaiBDf3JBovn8Hz\nI+NeQESjh4H9uehA9fYqZBJm6klKKJUoIBXd0zQtzxQvohMts/IXy7oAWCF40foW\nMnuZWt+fGFA56xEwI/lEF4oBL6/OTlAnBAOS50F15JrTEGJjqspK19Gc/0V7jXv0\nh5EGfJbbtQKBgBcXCKvauy+PA65aHQz4M92P7LeL30FwnLyGLu2n3qWi5Lk5JapV\n6cFR8ihtXz1athFTnfJVgs+59vfSBnR3lErT4llvzij/ZIlYFIFeZ/+9eX+TZ0ay\nc84bqB7e43NuAoTQd1uVk6MRB0C6Grehp9rzKxkXrdEnDwMD/ZE8vlXNAoGAZNLC\n43bHwEO1HGrS2itZ3RzQnxNZw7my3cxyYt29AV/dE2UeFLmLch14OVl+hSAjldx4\neUCY41GT3qiiv5eDdzhl++mnhFPMi1dBSAQbN88TpjkXjfNgFUQRCd+MztliK2oe\nwV/JjWC4Ud24ouMaAPd4i4g0lBFaguzGSYiXwVECgYEA0bYvGEQDdtsq2fM4W7cm\nYRFy0E3dD09lcFpxVUT0GPpHhY2CBjgrEHiPb8PPc14cLli7xQzzfsVRUcIn1qIh\n8NdWI+4FIpLtoWOCNN7Mc5+aETVbDru/DtQSPihoVpKtXX7eRBOjJEbORNxt3WtG\nxDAjQ5RyEthy9DZRpJc7HyA=\n-----END PRIVATE KEY-----\n",
		"client_email": "starting-account-7vvyxh2vte7n@davfxx.iam.gserviceaccount.com",
		"client_id": "108037464044761107573",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/starting-account-7vvyxh2vte7n%40davfxx.iam.gserviceaccount.com"
	  }
});

const fs = require('fs');

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
