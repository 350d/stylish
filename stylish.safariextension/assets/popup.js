var DB = safari.extension.globalPage.contentWindow.DB;

document.addEventListener('click', events, false);
document.addEventListener('DOMContentLoaded',f);

function f() {
	renderList();
};

function events(event) {
	var t = event.target || event.srcElement,
		c = t.className;
	if (c.match(/style/)) {
		event.preventDefault();
		var id = t.id,
			json = JSON.parse(DB.get(id));
		pingAll((json.enabled = !json.enabled)?"enableStyle":"disableStyle",{"id":id})
		DB.set(id,JSON.stringify(json));
		t.className = 'style ani ' + (c.match(/off/)?'on':'off');
		//renderList();
		return false;
	}
	if (t.id == 'find') {
		event.preventDefault();
		var url = safari.application.activeBrowserWindow.activeTab.url,
			host = getHost(url),
			newTab;
		if (host!='com.sobolev.stylish-5555L95H45') {
			newTab = safari.application.activeBrowserWindow.openTab();
			newTab.url = safari.extension.baseURI + "search.html#"+host;
		}
		safari.self.hide();
		return false;
	}
	if (t.id == 'manage') {
		event.preventDefault();
		var newTab = safari.application.activeBrowserWindow.openTab();
		newTab.url = safari.extension.baseURI + "manage.html";
		safari.self.hide();
		return false;
	}
};

function validate(event) {
	renderList();
};

function renderList() {
	if (DB.size()) {
		var url = safari.application.activeBrowserWindow.activeTab.url,
			html = '';
		for (var i=0;i<DB.size();i++) {
			var id = DB.key(i);
				json = JSON.parse(DB.get(id)),
				valid = json.sections.filter(function(section){return filterSection(url,section)});
			if (valid.length && !json.hidden) {
				html += '<li id="'+id+'" class="style ani '+(json.enabled?'on':'off')+'">'+json.name+'</li>';
			}
		}
		if (html=='') html = '<li class="style nostyles ani">No styles for this page...</li>';
		g('styleslist').innerHTML = html;
	}
};

function ping(name, data) {
	safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(name,data);
};

function pingAll(name, data) {
	safari.application.browserWindows.forEach(function(win) {
		win.tabs.forEach(function(tab) {
			if (tab.page) tab.page.dispatchMessage(name, data);
		})
	})
}

function pong(event) {
	var n = event.name,
		m = event.message,
		t = event.target;
	switch(n) {
		case 'styleAdded':
			renderList();
		break;
		case 'styleUpdated':
			renderList();
		break;
	}
};

safari.application.addEventListener("validate", validate, false);
safari.application.addEventListener("message", pong, true);

function log(l) {
	safari.extension.globalPage.contentWindow.log(l);
};

function getRSS(url) {
	getJSON('http://www.google.com/uds/Gfeeds',
		{
			context: 0,
			num: 10,
			hl: 'en',
			output: 'json',
			v: '1.0',
			nocache: 0,
			q: usss+val
		},function(json) {
			log(json);
		}
	)
}