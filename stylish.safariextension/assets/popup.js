var DB = safari.extension.globalPage.contentWindow.DB;
$(function() {
	$('#find').live('click',function(event) {
		event.preventDefault();
		var url = safari.application.activeBrowserWindow.activeTab.url,
			host = getHost(url),
			newTab;
		if (host!='com.sobolev.stylish-5555L95H45') {
			newTab = safari.application.activeBrowserWindow.openTab();
			newTab.url = safari.extension.baseURI + "search.html#"+host;
		}
		return false;
	});

	$('#manage').live('click',function(event) {
		event.preventDefault();
		var newTab = safari.application.activeBrowserWindow.openTab();
		newTab.url = safari.extension.baseURI + "manage.html";
		return false;
	});

	$('#styleslist li').live('click', function(event) {
		event.preventDefault();
		var li = $(this),
			id = li.attr('id');
		var json = $.parseJSON(DB.get(id));
		json.enabled = !json.enabled;
		json.enabled ? pingAll("applyStyle",{"id":id}) : pingAll("removeStyle",{"id":id})
		DB.set(id,JSON.stringify(json));
		renderList();
		return false;
	});
	renderList();
	
});

function validate(event) {
	renderList();
};

function renderList() {
	if (DB.size()) {
		var list = $('#styleslist').empty(),
			url = safari.application.activeBrowserWindow.activeTab.url,
			empty = true;
		for (var i=0;i<DB.size();i++) {
			var id = DB.key(i);
				json = $.parseJSON(DB.get(id)),
				valid = json.sections.filter(function(section){return filterSection(url,section)});
			
			if (valid.length) {
				empty = false;
				list.append(
					$('<li/>',{id:id,text:json.name, 'class':(json.enabled?'on':'off')})
				);
			}
		}
		if (empty) {
			list.append(
				$('<li/>',{text:'No styles for this page...', 'class':'nostyles'})
			);
		}
		$('input[rel="on"]',list).attr('checked','checked');
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
	$.getJSON('http://www.google.com/uds/Gfeeds',
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