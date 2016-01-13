var loggedin = false,
	stylishjson = {},
	busy = false;

ping('getInstalledStyles','');

$(function() {

	navInit();

	analytics({type:'screenview',title:'Settings'});
	
/*

	toggleLoginForm(false,true);
	form = $('#logoutform');
	$('.loginform').addClass('busy');

	$.get('https://userstyles.org/login',function(html) {
		html = sanitizeHTML(html);
		form = $('#logoutform');
		$('.loginform').removeClass('busy');
		var user = getUserInfo(html);
		toggleLoginForm(!user.loggedin,user.loggedin);
		if (user.loggedin) updateInfo(user);
	});
	
	$('#loginform').submit(function() {
		var name = $('#login').val(),
			pass = $('#password').val(),
			token = $('input[name="authenticity_token"]').val(),
			form = $(this);
		$('.loginform').addClass('busy');	
		$.post('https://userstyles.org/login/authenticate_normal',{
			login:name,
			password:pass,
			remember:'true',
			authenticity_token:token,
			view:'password',
			utf8: '✓'
		},function(html) {
			html = sanitizeHTML(html);
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

*/
	
	$('#jsonfile')
		.change(function(data) {
			
			log(data);
			
			var reader = new FileReader(),
				file = data.srcElement ? data.srcElement.files[0] : data.currentTarget.files[0];
			
			reader.onload = function(e){
				try {
					json = $.parseJSON(e.target.result);
					$.each(json.data, function(n,e) {
						ping('saveStyle',{"import":true,"id":e.id,"json":$.parseJSON(e.json)});
					});
					$('.importexportform').removeClass('busy');
				} catch(e) {
					alert('Wrong file format');
				}
			}
			
			reader.readAsText(file);
			$('.importexportform').addClass('busy');

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
});

$.fn.extend({
	iframer: function(options) {
		options = $.extend({},{ src:'null.html', id: 'iframer-'+(new Date()).getTime(), onComplete:function(){}},options);
		var iframe = $('<iframe/>',{seamless:true,name:options.id,id:options.id}).hide(),
			form = $(this).append(iframe).attr('target', options.id).submit();
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
	$('#loginform').toggleClass('hide',!f1);
	$('#logoutform').toggleClass('hide',!f2);
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
		user.id = $('article.style-brief',html).eq(0).attr('author-id');
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