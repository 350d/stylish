var usss = 'https://userstyles.org/styles/browse/', href,
	w = window,
	page;

analytics({type:'screenview',title:'Global'});

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
		case 'submitStyle':
			submitStyle(m.id);
		break;
		case 'getInstalledStyles':
			if (l = DB.size()) {
				var list = [];
				for (var i=0;i<l;i++) {

					var id = DB.key(i);

					if (id != 'uuid') {
						list.push(
							{'id':id,'json':DB.get(id)}
						);
					}
				}
				ping(event, 'setInstalledStyles', list);
			}
		break;
		case 'checkInstall':
			ping(event, 'checkInstall', DB.size()?DB.check(m):false);
		break;
		case 'getStyles':
			if (l = DB.size()) {
				for (var i=0;i<l;i++) {
					var id = DB.key(i);
					if (id != 'uuid') {
						var json = JSON.parse(DB.get(id)),
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

function command(event) {
	log(event);
	var name = event.command;
	switch(name){
		case 'findmore':
			findMore();
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

function submitStyle(id) {
	var json = JSON.parse(DB.get(id)), token;
	log(json);

	var css = '@namespace url(http://www.w3.org/1999/xhtml);@-moz-document domain("facebook.com") {body {}}';

	//get('https://userstyles.org/styles/new', null, function(html) {
	get('https://userstyles.org/styles/71868/edit', null, function(html) {
		
		token = html.match(/authenticity_token" value="(.*?)" \/>/)[1];
		log(token);

		var id = 71868;

		//post('https://userstyles.org/styles/create',{
		post('https://userstyles.org/styles/update',{
			
			'utf8': '✓',
			'authenticity_token': token,
			'style[short_description]': 'Short description',
			'style[long_description]': 'Long description',
			//'style[additional_info]': '',
			'style[style_code_attributes][id]': id,
			'style[style_code_attributes][code]': css,
			//'style[screenshot_url_override]': '',
			'style[screenshot_type_preference]': 'auto',
			//'new_screenshot_description_1': '',
			//'new_screenshot_description_2': '',
			//'new_screenshot_description_3': '',
			//'new_screenshot_description_4': '',
			//'new_screenshot_description_5': '',
			//'style[pledgie_id]': '',
			//'style[license]': '',
			'_method': 'put',
			'style[id]': id,
			'commit': 'Save'
		},function(data){
			//log(data);
		}, true);
	});

}

function getStyles(url, page) {

}

function manageStyles() {

}

function findMore() {
	var url = safari.application.activeBrowserWindow.activeTab.url,
		host = getHost(url),
		newTab;
	if (host!='com.sobolev.stylish-5555L95H45') {
		newTab = safari.application.activeBrowserWindow.openTab();
		newTab.url = safari.extension.baseURI + "search.html#"+host;
	}
};

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
	var styleurl = 'https://userstyles.org/styles/chrome/'+m.id+'.json';
	getJSON(styleurl, m.options, function(json) {
		saveData(m.id,json);
		pingAll('applyStyle', {"id":m.id});
		pingAll('updateListing', {"id":m.id});
	});
};

function log(e) {
	//pingAll('log',e);
	console.log(e);
};

safari.application.addEventListener("message", pong, true);
safari.application.addEventListener("command", command, false);