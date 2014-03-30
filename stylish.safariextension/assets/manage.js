$(function() {
	navInit();
	ping("getInstalledStyles",'');
});

var busy = false;

function ping(name,data) {
	safari.self.tab.dispatchMessage(name,data);
}
	
function pong(event) {
	var n = event.name,
		m = event.message,
		t = event.target;
	switch(n) {
		case 'setInstalledStyles':
			renderStylesList(m);
		break;
	}
}

function renderStylesList(m) {
	var content = $('#content'), list = $('<dl/>',{id:'styleslist'}).appendTo(content);
	$.each(m,function(i,el){
		el.enabled = $.parseJSON(el.json).enabled;
	});
	$.each(sortData(m,'enabled'), function(i,el) {

		var json = $.parseJSON(el.json), domains = $('<ul/>',{'class':'applies'}), custom = (el.id.length > 12);

			if (json.hidden) return;

			$.each(json.sections,function(i,el) {
				$.each(el.domains,function(i,el) {
					domains.append($('<li/>',{text:el}));
				});
				$.each(el.urlPrefixes,function(i,el) {
					domains.append($('<li/>',{text:el}));
				});
				$.each(el.urls,function(i,el) {
					domains.append($('<li/>',{text:el}));
				});
				$.each(el.regexps,function(i,el) {
					domains.append($('<li/>',{text:'Regexp', title:el}));
				});
			})
		domains.html(domains.children().slice(0,8));
		list.append(
			$('<dt/>',{id:el.id,text:json.name,'class':json.enabled?'enabled':'disabled'}).data('json',json).append(custom?$('<span/>',{'class':'badge',text:'Custom'}):$('<a/>',{'class':'badge userstyles',text:'Userstyles.org',href:'http://userstyles.org/styles/'+el.id,target:'_blank',title:'Link to original style'})),
			$('<dd/>',{rev:el.id,'class':(json.enabled?'enabled':'disabled')+(custom?' custom':'')}).append(
				domains,
				$('<button/>',{rel:el.id,text:'Edit','class':'edit'}),
				$('<button/>',{rel:el.id,text:'Delete','class':'delete red'}),
				$('<button/>',{rel:el.id,text:json.enabled?'Disable':'Enable','class':'toggle'}),
				$('<button/>',{rel:el.id,text:'Check Updates','class':'checkupdate'}),
				$('<button/>',{rel:el.id,text:'Update','class':'update'}).hide()
			)
		);
	});
	
	$('.toggle').click(function() {
		var b = $(this), s = b.text(), id = b.attr('rel');
		b.text( (s=='Enable')?'Disable':'Enable' );
		$('#'+id+', dd[rev="'+id+'"]').attr('class', s=='Disable'?'disabled':'enabled')
		ping(s.toLowerCase()+'Style', {"id":id});
		return false;
	})
	
	$('.delete').click(function() {
		var b = $(this), id = b.attr('rel');
		$('#'+id).add(b.parent()).fadeOut();
		ping('deleteStyle', {"id":id});
		return false;
	})
	
	$('.checkupdate').click(function() {
		if (busy) return;
		busy = true;

		var b = $(this), id = b.attr('rel'), json = $('#'+id).data('json'), delta, dd = $('dd[rev="'+id+'"]'), options = false,
			updateurl = json.hasOwnProperty('updateUrl')&&json.updateUrl!=null?json.updateUrl:'http://userstyles.org/styles/chrome/'+id+'.json';

		b.text('Checking...');
		$('span.busy, span.message',dd).remove();
		dd.append($('<span/>',{'class':'busy'}));
		$.getJSON(updateurl,function(data) {
			$('span.busy', dd).attr('class','message');
			data.enabled = true;
			if ( JSON.stringify(json).hashCode()!=JSON.stringify(data).hashCode() ) {
				b.hide().text('Check Updates').next().show();
				$('span.message',dd).text('Update available!');
				$('#'+id).data('newjson',data);
				busy = false;
			} else {
				$('span.message',dd).text('No updates found...');
				b.delay(4000).fadeIn(function() {
					busy = false;
					$(this).text('Check Updates');
					$('span.message',dd).remove();
				});
			}
		}).error(function(data){
		});

		return false;
	})
	
	$('.update').click(function() {
		var b = $(this), id = b.attr('rel'), json = $('#'+id).data('newjson'), dd = $('dd[rev="'+id+'"]');
		$('span.message',dd).remove();
		b.text('Updated!').delay(2000).fadeIn(function() {$(this).text('Update').hide().prev().show()});
		ping("saveStyle",{"id":id,"json":json});
	});
	
	$('.edit').click(function() {
		var b = $(this), id = b.attr('rel'), el = $('#'+id);
		window.location = safari.extension.baseURI + "edit.html#" + id;
	});
	
};

function log(l) {
	console.log(l);
}

safari.self.addEventListener("message", pong, true);