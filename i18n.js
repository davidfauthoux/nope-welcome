// jquery

let fallbackLanguage = "en";
let language = fallbackLanguage;

export function getText(text, simplified, forceUseLanguage) {
	if (text === undefined) {
		return "[?]";
	}
	if (text[language] !== undefined) {
		return text[language];
	} else if (text["_" + language] !== undefined) {
		if (simplified) {
			// return text["_" + language] + " [" + text[fallbackLanguage] + "]";
			if (forceUseLanguage === true) {
				return text["_" + language];
			}
			return text[fallbackLanguage];
		}
		return text["_" + language] + "<span class=\"translation\">" + text[fallbackLanguage] + "</span>";
	} else if (text[fallbackLanguage] !== undefined) {
		return text[fallbackLanguage];
	} else {
		return text;
	}
}

export function _(div, text, simplified) {
	div.addClass("i18n" + (simplified ? "-simplified" : ""));
	if (!simplified) {
		div.attr("data-text", JSON.stringify(text));
	}
	div.html(getText(text, simplified));
	return div;
}

export function update(l) {
	if (l !== undefined) {
		language = l;
	}
	$(".i18n").each(function() {
		let div = $(this);
		let text = JSON.parse(div.attr("data-text"));
		div.html(getText(text));
	});
	document.title = getText({ //TODO
		en: "The Travel Team - Registration",
		fr: "The Travel Team - Dossier",
		es: "The Travel Team - Archivo",
		it: "The Travel Team - File",
	});
}

export function today(date) {
	let d;
	if (date === undefined) {
		d = new Date();
	} else {
		d = new Date(date);
	}
	return d.toLocaleDateString(language, { year: "numeric", month: "long", day: "numeric" });
}