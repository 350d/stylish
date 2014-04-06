$(function(){
	setInterval(checkimages,333);
});

function checkimages() {
	$('img').each(function(){
		var t = $(this), src = t.prop('src').replace('safari-extension','http');
		if (src.indexOf('.html')<0) {
			t.attr({
				src:src,
				fixed:true
			});
		}
	});
}
