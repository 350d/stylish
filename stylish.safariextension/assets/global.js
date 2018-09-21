var DB = {
  set: function(name, data) {
    safari.extension.settings.setItem(name, data);
    return;
  },
  get: function(name) {
    return safari.extension.settings.getItem(name);
  },
  delete: function(name) {
    safari.extension.settings.removeItem(name);
    return;
  },
  clear: function() {
    safari.extension.settings.clear();
    return;
  },
  size: function() {
    return Object.keys(safari.extension.settings).length;
  },
  key: function(i) {
    return Object.keys(safari.extension.settings)[i];
  },
  check: function(name) {
    return !(DB.get(name) === null);
  },
  upgrade: function() {
    var name,
      value,
      dbversion = DB.check("dbversion") ? DB.get("dbversion") : 1;

    if (dbversion < 3) {
      // v2
      // moving from localStorage to safari.extension.settings

      for (name in localStorage) {
        value = localStorage.getItem(name);
        if (!(value === null)) DB.set(name, value);
      }
      localStorage.clear();

      // v3
      // remove old json stringify method

      for (id in safari.extension.settings) {
        if (skip_items.indexOf(id) < 0 && typeof DB.get(id) == "string") {
          DB.set(id, JSON.parse(DB.get(id)));
        }

        DB.set("dbversion", 3);
      }

      DB.set("settings", default_settings);
    }

    return;
  }
};

var usss = "https://userstyles.org/styles/browse/",
  href,
  w = window,
  page,
  skip_items = ["uuid", "settings", "dbversion", "ad"],
  default_settings = {
    context: "on",
    minify: "on",
    tracking: "on"
  },
  settings;

DB.upgrade();

settings = loadSettings(); // safari.extension.settings.settings

function ping(event, name, data) {
  if ((page = event.target.page)) {
    page.dispatchMessage(name, data);
  }
}

function pong(event) {
  var n = event.name,
    t = event.target,
    m = event.message,
    l;
  switch (n) {
    case "installStyle":
      installStyle(m);
      break;
    case "saveStyle":
      saveData(m.id, m.json);
      if (!m.import) pingAll("applyStyle", { id: m.id });
      break;
    case "disableStyle":
      disableStyle(m.id);
      pingAll("disableStyle", { id: m.id });
      break;
    case "enableStyle":
      enableStyle(m.id);
      pingAll("enableStyle", { id: m.id });
      break;
    case "updateStyle":
      updateStyle(m.id, m.json);
      pingAll("updateStyle", { id: m.id, css: m.json });
      break;
    case "editStyle":
      pingAll("editStyle", { id: m.id, json: DB.get(m.id) });
      break;
    case "deleteStyle":
      deleteStyle(m.id);
      pingAll("removeStyle", { id: m.id });
      break;
    case "submitStyle":
      submitStyle(m.id);
      break;
    case "getInstalledStyles":
      if ((l = DB.size())) {
        var list = [];
        for (var i = 0; i < l; i++) {
          var id = DB.key(i);

          if (skip_items.indexOf(id) < 0) {
            list.push({ id: id, json: DB.get(id) });
          }
        }
        ping(event, "setInstalledStyles", list);
      }
      break;
    case "checkInstall":
      ping(event, "checkInstall", DB.size() ? DB.check(m.sid) : false);
      break;
    case "getStyles":
      ping(event, "updateSettings", settings);
      if ((l = DB.size())) {
        for (var i = 0; i < l; i++) {
          var id = DB.key(i);
          if (skip_items.indexOf(id) < 0) {
            var json = DB.get(id),
              id = DB.key(i),
              filter,
              css;
            if (json.enabled) {
              if (
                (filter = json.sections.filter(function(section) {
                  return filterSection(m.url, section);
                }))
              ) {
                if (
                  (css = filter
                    .map(function(section) {
                      return section.code;
                    })
                    .join("\n"))
                ) {
                  ping(event, "injectStyle", {
                    css: css,
                    id: id,
                    location: m.url,
                    sign: m.sign
                  });
                }
              }
            }
          }
        }
      }
      break;
    case "applyStyle":
      var json = DB.get(m.id),
        filter,
        css;
      if (json.enabled) {
        if (
          (filter = json.sections.filter(function(section) {
            return filterSection(m.href, section);
          }))
        ) {
          if (
            (css = filter
              .map(function(section) {
                return section.code;
              })
              .join("\n"))
          ) {
            ping(event, "injectStyle", {
              css: css,
              id: m.id,
              location: m.href,
              sign: m.sign
            });
          }
        }
      }
      break;
    case "badge":
      safari.extension.settings.unreadMessages = m;
      safari.extension.toolbarItems[0].badge = m;
      break;
    case "error":
      error(m);
      break;
    case "saveSettings":
      saveSettings(m);
      break;
    case "loadSettings":
      ping(event, "loadSettings", settings);
      break;
  }
}

function loadSettings(option_name) {
  var obj = DB.get("settings");
  for (var name in obj) {
    if (!obj.hasOwnProperty(name)) obj[name] = default_settings[name];
  }
  return !option_name ? obj : obj[option_name];
}

function saveSettings(m) {
  var obj = {};
  m.forEach(function(option) {
    obj[option.name] = option.value;
  });
  DB.set("settings", obj);
  settings = obj;
}

function command(event) {
  var name = event.command;
  switch (name) {
    case "findmore":
      findMore();
      break;
  }
}

function disableStyle(id) {
  var json = DB.get(id);
  json.enabled = false;
  DB.set(id, json);
}

function enableStyle(id) {
  var json = DB.get(id);
  json.enabled = true;
  DB.set(id, json);
}

function updateStyle(id, data) {
  DB.set(id, data);
}

function deleteStyle(id) {
  DB.delete(id);
}

function submitStyle(id) {
  var json = DB.get(id),
    token;
  //log(json);

  var css = "@namespace url(http://www.w3.org/1999/xhtml);";

  //get('https://userstyles.org/styles/new', null, function(html) {
  get("https://userstyles.org/styles/71868/edit", null, function(html) {
    token = html.match(/authenticity_token" value="(.*?)" \/>/)[1];
    //log(token);

    var id = 71868;

    //post('https://userstyles.org/styles/create',{
    post(
      "https://userstyles.org/styles/update",
      {
        utf8: "✓",
        authenticity_token: token,
        "style[short_description]": "Short description",
        "style[long_description]": "Long description",
        //'style[additional_info]': '',
        "style[style_code_attributes][id]": id,
        "style[style_code_attributes][code]": css,
        //'style[screenshot_url_override]': '',
        "style[screenshot_type_preference]": "auto",
        //'new_screenshot_description_1': '',
        //'new_screenshot_description_2': '',
        //'new_screenshot_description_3': '',
        //'new_screenshot_description_4': '',
        //'new_screenshot_description_5': '',
        //'style[pledgie_id]': '',
        //'style[license]': '',
        _method: "put",
        "style[id]": id,
        commit: "Save"
      },
      function(data) {
        //log(data);
      },
      true
    );
  });
}

function getStyles(url, page) {}

function manageStyles() {}

function findMore() {
  var url = safari.application.activeBrowserWindow.activeTab.url,
    host = getHost(url);
  if (host != "com.sobolev.stylish-5555L95H45") {
    safari.application.activeBrowserWindow.openTab().url =
      safari.extension.baseURI + "search.html#" + host;
  }
}

function saveData(id, json) {
  json.enabled = json.hasOwnProperty("enabled") ? json.enabled : true;
  DB.set(id, json);
}

function getHost(url) {
  var a = document.createElement("a"),
    host;
  a.href = url;
  host = a.hostname.replace("www.", "");
  return host;
}

function installStyle(m) {
  var styleurl = "https://userstyles.org/styles/chrome/" + m.id + ".json";
  getJSON(styleurl, m.options, function(json) {
    saveData(m.id, json);
    pingAll("applyStyle", { id: m.id });
    pingAll("updateListing", { id: m.id });
  });
}

function log(e) {
  //pingAll('log',e);
  console.log(e);
}

window.onerror = function(message, url, line) {
  error({ message: message, url: url, line: line });
  return true;
};

function error(m) {
  console.error(message);
}

safari.application.addEventListener("message", pong, true);
safari.application.addEventListener("command", command, false);
safari.application.addEventListener("contextmenu", contextmenu, false);
safari.application.addEventListener("validate", validate, false);

function validate(event) {
  if (event.command == "findmore") {
    event.target.disabled = settings.context != "on";
  }
  return true;
}
function contextmenu(event) {
  //  log(event);
  //  if (event.userInfo === "IMG") {
  //    event.contextMenu.appendContextMenuItem("enlarge", "Enlarge Item");
  //  }
}
