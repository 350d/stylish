$(function() {

	navInit();

	ping('analytics', {type:'screenview', title:'About'});
});

function ping(name,data) {
	safari.self.tab.dispatchMessage(name,data);
}

function log(e) {console.log(e)};
