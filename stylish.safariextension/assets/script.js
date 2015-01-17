var d = document,
	dl = d.location,
	w = window;

if (typeof(safari) == 'object') {
	ping('getStyles',dl.href);
	safari.self.addEventListener("message", pong, false);
	d.addEventListener("stylishInstall", function(event) {pong(event);},false);
	d.addEventListener("stylishUpdate", function(event) {pong(event);},false);
	d.addEventListener('DOMContentLoaded',function(){
		if (getMeta('stylish-id-url')) userstyles();
	});
}

function injectStyle(css,id) {
	if (!dl.host) return;
//	if (w != w.top) return;
	removeStyle(id);
	var regex_timer = /\?timer=(.\d)/gi,
		regex_rnd = /\?rnd=(.\d)/gi,
		time = (new Date()).getTime(),
		timer = function(s,n) {return '?timer='+Math.floor(time/(1000*parseInt(n)))}, // Cahche images for 10 minutes
		rnd = '?rnd='+Math.random(),
		style = d.createElement('style');
	style.setAttribute('id', '' + id);
	style.style.display = 'none !important';
	style.setAttribute('type', 'text/css');
	css = minify_css(css);
	style.innerText = css.replace(regex_timer,timer).replace(regex_rnd,rnd);
	(d.head || d.documentElement).appendChild(style, null);
}

function removeStyle(id) {
	if (e = d.getElementById(''+id)) e.parentNode.removeChild(e);
}

function ping(name, data) {
	safari.self.tab.dispatchMessage(name, data);
}
 
function pong(event) {
	var n = event.name,
		t = event.target,
		m = event.message,
		type = event.type,
		metaid = getMeta('stylish-id-url')?getMeta('stylish-id-url').replace(/^https?:\/\/userstyles.org\/styles\//,''):false;
	switch(n) {
		case 'injectStyle':
			if (m.location == dl.href) injectStyle(m.css,m.id);
		break;
		case 'removeStyle':
			removeStyle(m.id);
			if (m.id == metaid) sendEvent('styleCanBeInstalled');
		break;
		case 'disableStyle':
			removeStyle(m.id);
		break;
		case 'enableStyle':
			ping('applyStyle',{'id':m.id, 'href':dl.href});
		break;
		case 'updateStyle':
			ping('applyStyle',{'id':m.id, 'href':dl.href});
		break;
		case 'checkInstall':
			log(m);
			sendEvent(m?'styleAlreadyInstalled':'styleCanBeInstalled');
		break;
		case 'applyStyle':
			ping('applyStyle',{'id':m.id, 'href':dl.href});
			if (metaid && m.id && m.id == metaid) sendEvent('styleAlreadyInstalled');
		break;
		case 'log':
			console.log('Global: ',m);
		break;
	}
	switch(type) {
		case 'stylishInstall':
			stylishInstallGlobal(metaid);
		break;
		case 'stylishUpdate':
			stylishUpdateGlobal(metaid);
		break;
	}
}

function stylishInstallGlobal(id) {
	ping('installStyle',{id:id,options:getOptions()});
};
function stylishUpdateGlobal(id) {
	ping('installStyle',{id:id,options:getOptions()});
};
function getOptions() {
	var form, new_form = d.createElement('form'), i, options = '';
	if (form = d.getElementById('style-settings')) {
		var old_selects = form.getElementsByTagName('select'),
			new_selects = new_form.getElementsByTagName('select');
		new_form.appendChild(form.cloneNode(true))
		for (i in old_selects) new_selects[i].selectedIndex = old_selects[i].selectedIndex;
		options = serialize(new_form);
	}
	return options;
}

function loadScript(src, async) {
	var script = d.createElement('script');
	script.type = 'text/javascript';
	script.src = src;
	if (async) script.async = true;
	d.getElementsByTagName('head')[0].appendChild(script);
};
function loadStyle(src) {
	var link = document.createElement('link');
	link.type = 'text/css';
	link.rel = 'stylesheet';
	link.href = src;
	document.getElementsByTagName('head')[0].appendChild(link);
};

function log(l) {
	console.log('injected: ',l);
};

function userstyles() {
	var sid = getMeta('stylish-id-url').replace(/^https?:\/\/userstyles.org\/styles\//,'');
	ping('checkInstall',sid);
};

function sendEvent(name) {
	var event = d.createEvent("Events");
	event.initEvent(name, false, false, d.defaultView, null);
	d.dispatchEvent(event);
};

function getMeta(name) {
	var m = d.getElementsByTagName('link');
	for (var i in m) {
		if (m[i].rel == name) {
			return m[i].href;
		}
	}
	return false;
}

function serialize(form) {
	var i, j, el, q = [], n, v, t, elements, options;
	function add_value(name, value) {
		q.push(name+'='+value);
	}
	if (!form || !form.nodeName || form.nodeName.toLowerCase() !== 'form') throw 'You must supply a form element';
	elements = form.elements;
	for (i in elements) {
		if (typeof(el = elements[i]) !== 'object' || el.disabled) continue;
		n = el.name;
		v = el.value;
		t = el.type;
		switch (el.nodeName.toLowerCase()) {
			case 'input':
				switch (t) {
					case 'checkbox':
					case 'radio':
						if (el.checked) add_value(n,v);
					break;
					case 'reset':
					break;
					default:
						add_value(n,v);
					break;
				}
			break;
			case 'textarea':
				add_value(n,v);
			break;
			case 'select':
				switch(t) {
					case 'select-one':
						add_value(n,v);
					break;
					case 'select-multiple':
						options = el.options;
						for (j in options) if (options[j].selected) add_value(n, options[j].value);
					break;
				}
			break;
			case 'button':
				switch (t) {
					case 'reset':
					case 'submit':
					case 'button':
						add_value(n,v);
					break;
				}
			break;
		}
	}
	return q.join('&');
}

function minify_css(css){
	var patterns = [
			[ '\\/\\*.*?\\*\/',''],
			[ '\\s+',' ']
		];
	patterns.map(function(pattern){
		css = css.replace(new RegExp(pattern[0],"g"),pattern[1]);
	});
	return css.trim();
}