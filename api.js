"use strict";

let i18nDefaultLanguage = "en";
let i18nLanguage = i18nDefaultLanguage;

let i18nGetText = function(text, simplified, forceUseLanguage) {
	if (text === undefined) {
		return "[?]";
	}
	if (text[i18nLanguage] !== undefined) {
		return text[i18nLanguage];
	} else if (text["_" + i18nLanguage] !== undefined) {
		if (simplified) {
			// return text["_" + i18nLanguage] + " [" + text[i18nDefaultLanguage] + "]";
			if (forceUseLanguage === true) {
				return text["_" + i18nLanguage];
			}
			return text[i18nDefaultLanguage];
		}
		return text["_" + i18nLanguage] + "<span class=\"translation\">" + text[i18nDefaultLanguage] + "</span>";
	} else if (text[i18nDefaultLanguage] !== undefined) {
		return text[i18nDefaultLanguage];
	} else {
		return text;
	}
};

let i18n = function(div, text, simplified) {
	div.addClass("i18n" + (simplified ? "-simplified" : ""));
	if (!simplified) {
		div.attr("data-text", JSON.stringify(text));
	}
	div.html(i18nGetText(text, simplified));
	return div;
};

let i18nUpdateAll = function() {
	$(".i18n").each(function() {
		let div = $(this);
		let text = JSON.parse(div.attr("data-text"));
		div.html(i18nGetText(text));
	});
	document.title = i18nGetText({
		en: "The Travel Team - Registration",
		fr: "The Travel Team - Dossier",
		es: "The Travel Team - Archivo",
		it: "The Travel Team - File",
	});
};

let Plugins = {};