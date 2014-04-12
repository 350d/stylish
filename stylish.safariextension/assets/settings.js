var loggedin = false,
	stylishjson = {},
	busy = false;

ping('getInstalledStyles','');

$(function() {

	navInit();
	
	toggleLoginForm(false,true);
	form = $('#logoutform');
	$('.loginform').addClass('busy');

	$.get('https://userstyles.org/login',function(html) {
		form = $('#logoutform');
		$('.loginform').removeClass('busy');
		var user = getUserInfo(html);
		toggleLoginForm(!user.loggedin,user.loggedin);
		if (user.loggedin) updateInfo(user);
	})
	
	$('#loginform').submit(function() {
		var name = $('#login').val(),
			pass = $('#password').val(),
			form = $(this);
		$('.loginform').addClass('busy');	
		$.post('https://userstyles.org/login/authenticate_normal',{login:name,password:pass,remember:true},function(html) {
			var user = getUserInfo(html);
			toggleLoginForm(!user.loggedin,user.loggedin);
			$('.loginform').removeClass('busy');
			if (user.loggedin) updateInfo(user);
		})
		return false;
	})
	
	$('#logoutform').submit(function() {
		var form = $(this);
		$('.loginform').addClass('busy');
		$.get('https://userstyles.org/logout',function(html) {
			var user = getUserInfo(html+'password-login');
			toggleLoginForm(!user.loggedin,user.loggedin);
			$('.loginform').removeClass('busy');
			updateInfo();
		})
		return false;
	});
	
	$('#jsonfile')
		.change(function(data) {
			$('.importexportform').addClass('busy');
			var timestamp = (new Date()).getTime();
			$('#jsontextarea').val('');
			$('#timestamp').val(timestamp);
			$('#importexport').iframer({
				onComplete: function() {
					$.getJSON('http://sobolev.us/stylish/export.php',{timestamp:timestamp},function(json) {
						$.each(json.data, function(n,e) {
							ping('saveStyle',{"import":true,"id":e.id,"json":$.parseJSON(e.json)});
						});
						$('.importexportform').removeClass('busy');
					});
				}
			});
		})
		.hover(
			function() {$('#import').addClass('hover')},
			function() {$('#import').removeClass('hover')}
		);
	
	$('#export').click(function(data) {
		$('.importexportform').addClass('busy');
		$('#jsontextarea').val(JSON.stringify(stylishjson));
		$('#importexport').iframer().delay(2000).show(function() {
			$('.importexportform').removeClass('busy')
		});
	});
	
	var dbkey = 'lTgjafl34YA=|97NKxhx3Xhniq36M1hMxzlFlDJjKI/jceqNtlXQLOw==',
		client = new Dropbox.Client({
			key: dbkey,
			sandbox: true
		}),
		dbform = $('#dropbox').show(),
		dbsync = $('#sync').hide(),
		dblink = $('#link').show(),
		dbunlink = $('#unlink').hide();

	client.authDriver(new Dropbox.Drivers.Popup({
		rememberUser: true,
	    receiverUrl: 'http://sobolev.us/stylish/oauth.html'
	}));
	
	client.authenticate({interactive: false}, function(error, client) {
		if (client.isAuthenticated() && !error) {
			dblink.hide();
			dbsync.show();
			dbunlink.show();
		} else {
			dblink.show();
		}
		return false;
	});
		
	dblink.click(function() {
		
		var dropboxstyle = {"hidden":true,"enabled":true,"name":"Dropbox","url":"","updateUrl":"","sections":[{"code":"body {\n\tbackground:red;\n}","domains":[],"regexps":[],"urlPrefixes":["https://www.dropbox.com/1/oauth/authorize?oauth_callback="],"urls":[]}]};
		
		ping("saveStyle",{"id":"dropbox","json":dropboxstyle});
		
		client.authenticate(function(error, client) {
			if (!error) {
				dblink.hide();
				dbsync.show();
				dbunlink.show();
				ping('deleteStyle', {"id":"dropbox"});
			}
		});
		return false;
	});	
	dbsync.click(function() {
		client.readdir("/", function(error, entries) {
			var i = $.inArray('stylish.json',entries);
			if (i > -1) {
				client.readFile('stylish.json', function(error, data) {
					log(data);
				});
			} else {
				client.writeFile("stylish.json", '{"test":4}', function(error, stat) {
					log(stat.versionTag);
				});
			}
		});
		return false;
	});
	
	dbunlink.click(function() {
		ping('deleteStyle', {"id":"dropbox"});
		client.signOut(function() {
			dblink.show();
			dbsync.hide();
			dbunlink.hide();
		});
		return false;
	});

});

$.fn.extend({
	iframer: function(options) {
		options = $.extend({},{ src:'null.html',id: 'iframer-'+(new Date()).getTime(), onComplete:function(){}},options);
		var iframe = $('<iframe/>',{seamless:true,name:options.id,id:options.id}).hide().load(function() {
				iframe.load(function() {
					//options.onComplete(iframe.contents().find('body').html());
					form.removeAttr('target');
					options.onComplete();
				}).delay(10000).hide(function() {
					iframe.remove();
				});
			}),
			form = $(this);
		form.append(iframe).attr('target', options.id).submit();
		return form;
	}
});


function updateInfo(user) {
	//log(user);
	var i = $('.userinfo');
	if (!user) {
		i.empty();
	} else {
		i.append(
			'Name: '+user.name
		);
		if (user.styles.length) {
			i.append('<ul/>');
			$.each(user.styles, function(n,s) {
				$('ul',i).append('<li>- '+s.name+'</li>');
			})
		}
	}
};

function toggleLoginForm(f1,f2) {
	$('#loginform').toggle(f1);
	$('#logoutform').toggle(f2);
};

function updateStylesInfo(list) {
	//var content = $('#content'), list = $('<dl/>',{id:'stylesstatus'}).appendTo(content);
	//log(m)
	stylishjson = {"data":list};
};

function getUserInfo(html) {
	var user = {}, trs;
	user.loggedin = (html.indexOf('password-login') < 0);
	if (user.loggedin) {
		user.id = $('a[href^="/users/edit_login_methods/"]',html).attr('href').split('/')[3];
		user.name = unescape($('a[href*="/messages/add/"]',html).attr('href').split('/')[5]);
		if (trs = $('.author-styles tbody tr[class!="style-warnings"]', html)) {
			user.styles = [];
			$.each(trs,function(n,tr) {
				var tds = $('td', tr),
					style = {};
				if (tds.length) {
					if ($(tds[0]).hasClass('obsolete')) return;
					style.name = $('a',tds[0]).text();
					style.installs = parseFloat($(tds[3]).text().replace(',',''));
					style.url = $('a',tds[0]).prop('href');
					style.id = style.url.split('/')[2];
					user.styles.push(style);
				}
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

function ping(name,data) {safari.self.tab.dispatchMessage(name,data)};safari.self.addEventListener("message", pong, true);