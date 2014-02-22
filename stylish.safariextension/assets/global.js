var usss = 'http://userstyles.org/styles/browse/', href,
	w = window,
	page;
	
$.ajaxSetup({
    timeout: 10000,
    error: function(event, request, settings) {
		console.error('Ajax: ' + request);
	}
});

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
			pingAll('removeStyle', {"id":m.id});
		break;
		case 'enableStyle':
			enableStyle(m.id);
			pingAll('applyStyle', {"id":m.id});
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
					var json = $.parseJSON(DB.get(DB.key(i))),
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
			var json = $.parseJSON(DB.get(m.id)),
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
	var json = $.parseJSON(DB.get(id));
	json.enabled = false;
	DB.set(id,JSON.stringify(json));
}

function enableStyle(id) {
	var json = $.parseJSON(DB.get(id));
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
//		$.get('http://userstyles.org/styles/'+id+'?v='+Math.random(), function(html) {
			var styleurl = 'http://userstyles.org/styles/chrome/'+m.id+'.json?'+m.options;
			$.getJSON(styleurl,function(json) {
				saveData(m.id,json);
				pingAll('applyStyle', {"id":m.id});
			});
//		});
};

safari.application.addEventListener("message", pong, true);
