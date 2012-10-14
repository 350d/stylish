version = '1.3.5';

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
			if (href.indexOf(urlPrefix) == 0) {
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

function log(l) {
	console.log(l);
};