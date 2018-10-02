version = getVersion();

function getVersion() {
  var keys = new DOMParser()
    .parseFromString(
      ajax("Info.plist", false).replace(/\r|\n|\t/gm, ""),
      "text/xml"
    )
    .getElementsByTagName("key");
  for (var i = 0; i < keys.length; i++) {
    //log(keys[i].textContent, keys[i].nextSibling.textContent);
    if (keys[i].textContent == "CFBundleVersion")
      return keys[i].nextSibling.textContent;
  }
}

function filterSection(href, section) {
  if (
    !section.urls.length &&
    !section.urlPrefixes.length &&
    !section.domains.length &&
    !section.regexps.length
  )
    return true;
  var found = false,
    currentDomains = getDomains(href);
  if (section.urls) {
    section.urls.forEach(function(url) {
      if (url == href) {
        found = true;
        return;
      }
    });
  }
  if (section.urlPrefixes && !found) {
    section.urlPrefixes.forEach(function(urlPrefix) {
      if (href && href.indexOf(urlPrefix) == 0) {
        found = true;
        return;
      }
    });
  }
  if (section.domains && !found) {
    section.domains.forEach(function(domain) {
      if (currentDomains.indexOf(domain) >= 0) {
        found = true;
        return;
      }
    });
  }
  if (section.regexps && !found) {
    section.regexps.forEach(function(regexp) {
      try {
        if (new RegExp(regexp).test(href)) {
          found = true;
          return;
        }
      } catch (error) {}
    });
  }
  return found ? true : false;
}

function getHost(url) {
  var a = document.createElement("a");
  a.href = url;
  return a.hostname.replace("www.", "");
}

function getDomains(url) {
  var d = getHost(url),
    domains = [d];
  while (d.indexOf(".") != -1) {
    d = d.substring(d.indexOf(".") + 1);
    domains.push(d);
  }
  return domains;
}

function getDomain(url) {
  var TLDs = [
      "ac",
      "ad",
      "ae",
      "aero",
      "af",
      "ag",
      "ai",
      "al",
      "am",
      "an",
      "ao",
      "aq",
      "ar",
      "arpa",
      "as",
      "asia",
      "at",
      "au",
      "aw",
      "ax",
      "az",
      "ba",
      "bb",
      "bd",
      "be",
      "bf",
      "bg",
      "bh",
      "bi",
      "biz",
      "bj",
      "bm",
      "bn",
      "bo",
      "br",
      "bs",
      "bt",
      "bv",
      "bw",
      "by",
      "bz",
      "ca",
      "cat",
      "cc",
      "cd",
      "cf",
      "cg",
      "ch",
      "ci",
      "ck",
      "cl",
      "cm",
      "cn",
      "co",
      "com",
      "coop",
      "cr",
      "cu",
      "cv",
      "cx",
      "cy",
      "cz",
      "de",
      "dj",
      "dk",
      "dm",
      "do",
      "dz",
      "ec",
      "edu",
      "ee",
      "eg",
      "er",
      "es",
      "et",
      "eu",
      "fi",
      "fj",
      "fk",
      "fm",
      "fo",
      "fr",
      "ga",
      "gb",
      "gd",
      "ge",
      "gf",
      "gg",
      "gh",
      "gi",
      "gl",
      "gm",
      "gn",
      "gov",
      "gp",
      "gq",
      "gr",
      "gs",
      "gt",
      "gu",
      "gw",
      "gy",
      "hk",
      "hm",
      "hn",
      "hr",
      "ht",
      "hu",
      "id",
      "ie",
      "il",
      "im",
      "in",
      "info",
      "int",
      "io",
      "iq",
      "ir",
      "is",
      "it",
      "je",
      "jm",
      "jo",
      "jobs",
      "jp",
      "ke",
      "kg",
      "kh",
      "ki",
      "km",
      "kn",
      "kp",
      "kr",
      "kw",
      "ky",
      "kz",
      "la",
      "lb",
      "lc",
      "li",
      "lk",
      "lr",
      "ls",
      "lt",
      "lu",
      "lv",
      "ly",
      "ma",
      "mc",
      "md",
      "me",
      "mg",
      "mh",
      "mil",
      "mk",
      "ml",
      "mm",
      "mn",
      "mo",
      "mobi",
      "mp",
      "mq",
      "mr",
      "ms",
      "mt",
      "mu",
      "museum",
      "mv",
      "mw",
      "mx",
      "my",
      "mz",
      "na",
      "name",
      "nc",
      "ne",
      "net",
      "nf",
      "ng",
      "ni",
      "nl",
      "no",
      "np",
      "nr",
      "nu",
      "nz",
      "om",
      "org",
      "pa",
      "pe",
      "pf",
      "pg",
      "ph",
      "pk",
      "pl",
      "pm",
      "pn",
      "pr",
      "pro",
      "ps",
      "pt",
      "pw",
      "py",
      "qa",
      "re",
      "ro",
      "rs",
      "ru",
      "rw",
      "sa",
      "sb",
      "sc",
      "sd",
      "se",
      "sg",
      "sh",
      "si",
      "sj",
      "sk",
      "sl",
      "sm",
      "sn",
      "so",
      "sr",
      "st",
      "su",
      "sv",
      "sy",
      "sz",
      "tc",
      "td",
      "tel",
      "tf",
      "tg",
      "th",
      "tj",
      "tk",
      "tl",
      "tm",
      "tn",
      "to",
      "tp",
      "tr",
      "travel",
      "tt",
      "tv",
      "tw",
      "tz",
      "ua",
      "ug",
      "uk",
      "us",
      "uy",
      "uz",
      "va",
      "vc",
      "ve",
      "vg",
      "vi",
      "vn",
      "vu",
      "wf",
      "ws",
      "xn--0zwm56d",
      "xn--11b5bs3a9aj6g",
      "xn--3e0b707e",
      "xn--45brj9c",
      "xn--80akhbyknj4f",
      "xn--90a3ac",
      "xn--9t4b11yi5a",
      "xn--clchc0ea0b2g2a9gcd",
      "xn--deba0ad",
      "xn--fiqs8s",
      "xn--fiqz9s",
      "xn--fpcrj9c3d",
      "xn--fzc2c9e2c",
      "xn--g6w251d",
      "xn--gecrj9c",
      "xn--h2brj9c",
      "xn--hgbk6aj7f53bba",
      "xn--hlcj6aya9esc7a",
      "xn--j6w193g",
      "xn--jxalpdlp",
      "xn--kgbechtv",
      "xn--kprw13d",
      "xn--kpry57d",
      "xn--lgbbat1ad8j",
      "xn--mgbaam7a8h",
      "xn--mgbayh7gpa",
      "xn--mgbbh1a71e",
      "xn--mgbc0a9azcg",
      "xn--mgberp4a5d4ar",
      "xn--o3cw4h",
      "xn--ogbpf8fl",
      "xn--p1ai",
      "xn--pgbs0dh",
      "xn--s9brj9c",
      "xn--wgbh1c",
      "xn--wgbl6a",
      "xn--xkc2al3hye2a",
      "xn--xkc2dl3a5ee0h",
      "xn--yfro4i67o",
      "xn--ygbi2ammx",
      "xn--zckzah",
      "xxx",
      "ye",
      "yt",
      "za",
      "zm",
      "zw"
    ].join(),
    parts = url.split(".");
  if (parts[0] === "www" && parts[1] !== "com") parts.shift();
  var ln = parts.length,
    i = ln,
    minLength = parts[parts.length - 1].length,
    part;

  while ((part = parts[--i])) {
    if (
      i === 0 ||
      i < ln - 2 ||
      part.length < minLength ||
      TLDs.indexOf(part) < 0
    )
      return part;
  }
}

function pingAll(name, data) {
  safari.application.browserWindows.forEach(function(win) {
    win.tabs.forEach(function(tab) {
      if (tab.page) tab.page.dispatchMessage(name, data);
    });
  });
}

function navInit() {
  var path = window.location.pathname,
    name = path.substring(path.lastIndexOf("/") + 1),
    arrow =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M238.3 373l84.5-96c1-1.3 1.4-2.8 2.3-4 1.3-1.8 2.4-3.4 3-5.4 1-2 1.4-4 1.8-6.2.4-2 .7-3.7.7-5.6 0-2.2-.4-4.3-.8-6.5-.4-1.8-.8-3.6-1.4-5.4-1-2.3-2-4-3.4-6-1-1-1-2.5-2-3.6l-85.4-95.8c-11.7-13.2-32-14.4-45.2-2.6-13.2 12-14.4 32-2.6 45.3L256 256l-65.8 75c-11.7 13-10.4 33.4 3 45 13.2 11.7 33.4 10.4 45-3z" /></svg>';
  document.getElementById("version").innerHTML = version;
  $("#menu").append(
    '<nav><ul><li><a href="search.html">Search' +
      arrow +
      '</a></li><li><a href="manage.html">Manage' +
      arrow +
      '</a></li><li><a href="edit.html">Edit' +
      arrow +
      '</a></li><li><a href="settings.html">Settings' +
      arrow +
      '</a></li><li><a href="about.html">About' +
      arrow +
      "</a></li></ul></nav>"
  );
  $('#menu a[href="' + name + '"]')
    .addClass("active")
    .click(function() {
      return false;
    });
}

String.prototype.hashCode = function() {
  var hash = 0;
  if (this.length == 0) return hash;
  for (i = 0; i < this.length; i++) {
    char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

function sortData(data, method) {
  return data.sort(function(a, b) {
    return b[method] - a[method];
  });
}
function sortDataJson(data, prop) {
  return data.sort(function(a, b) {
    if (a.json[prop] < b.json[prop]) return -1;
    if (a.json[prop] > b.json[prop]) return 1;
    return 0;
  });
}

function ajax(url, async, callback, json, parameters, post) {
  var xmlhttp = new XMLHttpRequest(),
    url = url + (post ? "" : parameters ? "?" + param(parameters) : "");
  xmlhttp.open(post ? "POST" : "GET", url, async);
  xmlhttp.send(post ? param(parameters) : null);
  if (async) {
    xmlhttp.onreadystatechange = function() {
      if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        callback(
          json ? JSON.parse(xmlhttp.responseText) : xmlhttp.responseText
        );
      }
    };
  } else {
    return xmlhttp.responseText;
  }
}

function getJSON(url, parameters, callback) {
  ajax(url, true, callback, true, parameters, false);
}

function get(url, parameters, callback) {
  ajax(url, true, callback, false, parameters, false);
}

function post(url, parameters, callback) {
  ajax(url, true, callback, false, parameters, true);
}

function param(obj) {
  return obj
    ? Object.keys(obj)
        .map(function(key) {
          return key + "=" + encodeURIComponent(obj[key]);
        })
        .join("&")
    : "";
}

function sanitizeHTML(html) {
  html = html
    .replace(/<script/g, "<textarea")
    .replace(/<\/script>/g, "</textarea>")
    .replace(/<link/g, "<br")
    .replace(/<\/link/g, "</br")
    .replace(/img alt="Good"/g, "hr")
    .replace(/img alt="OK"/g, "hr")
    .replace(/img alt="Bad"/g, "hr")
    .replace(/img class="style-warning-icon"/g, "hr")
    .replace(/onclick/g, "data-x")
    .replace(/onerror/g, "data-y");
  return html;
}

function check_nested(obj) {
  var args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
}

window.onerror = function(message, url, line) {
  error({ message: message, url: url, line: line });
  return true;
};

function error(m) {
  console.error(message);
}

function log(l) {
  console.log(l);
}
