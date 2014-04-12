var usss = 'https://userstyles.org/styles/browse/', href,
	w = window,
	page;

function ping(event, name, data) {
	if ( page = event.target.page) {
		page.dispatchMessage(name, data);
	}
}

function pong(event) {
	var n = event.name,
		t = event.target,
		m = event.message,
		l;
		
	switch(n) {
		case 'installStyle':
			installStyle(m);
		break;
		case 'saveStyle':
			saveData(m.id,m.json);
			if (!m.import) pingAll('applyStyle', {"id":m.id});
		break;
		case 'disableStyle':
			disableStyle(m.id);
			pingAll('disableStyle', {"id":m.id});
		break;
		case 'enableStyle':
			enableStyle(m.id);
			pingAll('enableStyle', {"id":m.id});
		break;
		case 'updateStyle':
			updateStyle(m.id, m.json);
			pingAll('updateStyle', {"id":m.id,"css":m.json});
		break;
		case 'editStyle':
			pingAll('editStyle', {"id":m.id,"json":DB.get(m.id)});
		break;
		case 'deleteStyle':
			deleteStyle(m.id);
			pingAll('removeStyle', {"id":m.id});
		break;
		case 'getInstalledStyles':
			if (l = DB.size()) {
				var list = [];
				for (var i=0;i<l;i++) {
					list.push(
						{'id':DB.key(i),'json':DB.get(DB.key(i))}
					);
				}
				ping(event, 'setInstalledStyles', list);
			}
		break;
		case 'checkInstall':
			if (l = DB.size()) {
				ping(event, 'checkInstall', DB.check(m));
			}
		break;
		case 'getStyles':
			if (l = DB.size()) {
				for (var i=0;i<l;i++) {
					var json = JSON.parse(DB.get(DB.key(i))),
						id = DB.key(i),
						filter, css;
					if (json.enabled) {
						if (filter = json.sections.filter(function(section) { return filterSection(m,section)})) {
							if (css = filter.map(function(section) {return section.code;}).join("\n")) {
								ping(event, 'injectStyle', {"css":css, "id":id, "location":m});
							}
						}
					}
				}
			}
		break;
		case 'applyStyle':
			var json = JSON.parse(DB.get(m.id)),
				filter, css;
			if (json.enabled) {
				if (filter = json.sections.filter(function(section) { return filterSection(m.href,section)})) {
					if (css = filter.map(function(section) {return section.code;}).join("\n")) {
						ping(event, 'injectStyle', {"css":css, "id":m.id, "location":m.href});
					}
				}
			}
		break;
		case 'badge':
			safari.extension.settings.unreadMessages = m;
			safari.extension.toolbarItems[0].badge = m;
		break;
	}
}

function disableStyle(id) {
	var json = JSON.parse(DB.get(id));
	json.enabled = false;
	DB.set(id,JSON.stringify(json));
}

function enableStyle(id) {
	var json = JSON.parse(DB.get(id));
	json.enabled = true;
	DB.set(id,JSON.stringify(json));	
}

function updateStyle(id,data) {
	DB.set(id,JSON.stringify(data));
}

function deleteStyle(id) {
	DB.delete(id);
}

function getStyles(url, page) {

}

function manageStyles() {

}

function saveData(id,data) {
	data.enabled = true;
	DB.set(id,JSON.stringify(data));
}

function getHost(url) {
    var a = document.createElement('a'), host;
    a.href = url;
	host = a.hostname.replace('www.','');
    return host;
}

function installStyle(m) {
	var styleurl = 'https://userstyles.org/styles/chrome/'+m.id+'.json?'+m.options;
	getJSON(styleurl,function(json) {
		saveData(m.id,json);
		pingAll('applyStyle', {"id":m.id});
		pingAll('updateListing', {"id":m.id});
	});
};

function log(e) {
	pingAll('log',e);
};

safari.application.addEventListener("message", pong, true);
