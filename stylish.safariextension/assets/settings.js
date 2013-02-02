var loggedin = false;

$(function() {
	
	navInit();
	ping('getInstalledStyles','');
	
	toggleLoginForm(false,true);
	form = $('#logoutform').addClass('busy');

	$.get('http://userstyles.org/login',function(html) {
		form = $('#logoutform').removeClass('busy');
		var user = getUserInfo(html);
		toggleLoginForm(!user.loggedin,user.loggedin);
	})
	
	$('#loginform').submit(function() {
		var name = $('#login').val(),
			pass = $('#password').val(),
			form = $(this).addClass('busy');	
		$.post('http://userstyles.org/login/authenticate_normal',{login:name,password:pass,remember:true},function(html) {
			var user = getUserInfo(html);
			toggleLoginForm(!user.loggedin,user.loggedin);
			form.removeClass('busy');
		})
		return false;
	})
	
	$('#logoutform').submit(function() {
		var form = $(this).addClass('busy');
		$.get('http://userstyles.org/logout',function(html) {
			var user = getUserInfo(html+'password-login');
			toggleLoginForm(!user.loggedin,user.loggedin);
			form.removeClass('busy');
		})
		return false;
	})

	
})

function toggleLoginForm(f1,f2) {
	$('#loginform').toggle(f1);
	$('#logoutform').toggle(f2);
};

function updateStylesInfo(m) {
	var content = $('#content'), list = $('<dl/>',{id:'stylesstatus'}).appendTo(content);
	log(m)
};

function ping(name,data) {
	//safari.self.tab.dispatchMessage(name,data);
}

function getUserInfo(html) {
	var user = {}, trs, tds, style = {};
	user.loggedin = (html.indexOf('password-login') < 0);
	if (user.loggedin) {
		user.id = $('a[href^="/users/edit_password/"]',html).attr('href').split('/')[3];
		user.name = unescape($('a[href*="/messages/add/"]',html).attr('href').split('/')[5]);
		if (trs = $('.author-styles tbody tr', html)) {
			user.styles = [];
			$.each(trs,function(n,tr) {
				tds = $('td', tr);
				if ($(tds[0]).hasClass('obsolete')) return;
				style.name = $(tds[0]).text();
				style.installs = parseFloat($(tds[3]).text().replace(',',''));
				style.url = $(tds[0]).find('a').attr('href');
				style.id = style.url.split('/')[2];
				user.styles.push(style);
			})
		}
	}
	return user;
};

function pong(event) {
	var n = event.name,
		m = event.message,
		t = event.target;
	switch(n) {
		case 'setInstalledStyles':
			updateStylesInfo(m);
		break;
	}
}

function log(e) {console.log(e)};

//safari.self.addEventListener("message", pong, true);
