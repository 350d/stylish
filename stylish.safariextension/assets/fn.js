version = '1.4.3';

DB = {
	set: function(name, data) {	
		localStorage.setItem(name,data);
	},
	get: function(name) {
		return localStorage.getItem(name);
	},
	delete: function(name) {
		localStorage.removeItem(name);
	},
	clear: function() {
		localStorage.clear();
	},
	size: function() {
		return localStorage.length;
	},
	key: function(i) {
		return localStorage.key(i);
	},
	check: function(name) {
		return !(localStorage.getItem(name) === null);
	}
}

function filterSection(href, section) {
	if (!section.urls && !section.urlPrefixes && !section.domains && !section.regexps) return true;
	var found = false,
		currentDomains = getDomains(href);
	if (section.urls) {
		section.urls.forEach(function(url) {
			if (url == href) {
				found = true;
				return;
			}
		});
	}
	if (section.urlPrefixes && !found) {
		section.urlPrefixes.forEach(function(urlPrefix) {
			if (href && href.indexOf(urlPrefix) == 0) {
				found = true;
				return;
			}
		});
	}
	if (section.domains && !found) {
		section.domains.forEach(function(domain) {
			if (currentDomains.indexOf(domain) >= 0) {
				found = true;
				return;
			}
		});
	}
	if (section.regexps && !found) {
		section.regexps.forEach(function(regexp) {
			if ((new RegExp(regexp)).test(href)) {
				found = true;
				return;
			}
		});
	}
	return found ? true : false;
}

function getHost(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.hostname.replace('www.','');
}

function getDomains(url) {
	var d = getHost(url),
		domains = [d];
	while (d.indexOf('.') != -1) {
		d = d.substring(d.indexOf('.') + 1);
		domains.push(d);
	}
	return domains;
}

function getDomain(url) {
	var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join(),
	parts = url.split('.');
	if (parts[0] === 'www' && parts[1] !== 'com') parts.shift();
	var ln = parts.length,
		i = ln,
		minLength = parts[parts.length-1].length,
		part;

	while(part = parts[--i]){
		if (i === 0 || i < ln-2 || part.length < minLength || TLDs.indexOf(part) < 0) return part;
	}
};

function pingAll(name, data) {
	safari.application.browserWindows.forEach(function(win) {
		win.tabs.forEach(function(tab) {
			if (tab.page) tab.page.dispatchMessage(name, data);
		})
	})
}

function navInit() {
	document.getElementById('version').innerHTML = version;
	$('#menu nav a').click(function(event) {
		event.preventDefault();
		var a = $(this), url = a.attr('rel');
		if (!a.hasClass('active')) window.location = safari.extension.baseURI + url + ".html";
		return false;
	})
};

JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};

String.prototype.hashCode = function() {
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash;
	}
	return hash;
}

function sortData(data,method) {
	return data.sort(function(a,b) {return b[method]-a[method]});
};

function log(l) {
	console.log(l);
};