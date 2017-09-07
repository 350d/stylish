$(function() {

	navInit();

	ping('analytics', {type:'screenview', title:'About'});
})

function log(e) {console.log(e)};
