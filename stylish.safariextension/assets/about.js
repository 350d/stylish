$(function() {
  navInit();
});

function ping(name, data) {
  safari.self.tab.dispatchMessage(name, data);
}

function log(e) {
  console.log(e);
}
