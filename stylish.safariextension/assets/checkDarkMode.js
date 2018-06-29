/* Quick check to see if Dark Mode is enabled, and use the appropriate CSS if so.*/
safari.self.addEventListener('message', setDarkMode, false);

safari.self.tab.dispatchMessage('getDarkMode');


function setDarkMode(msg) {
    if (msg.name == 'isDarkMode') {
        var isDarkMode = msg.message;
        if (isDarkMode == "on") 
            $('head').append('<link rel="stylesheet" type="text/css" href="assets/dark-styles.css" media="all">');
        
    }
}