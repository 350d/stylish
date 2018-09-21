var loggedin = false,
  stylishjson = {},
  busy = false;

ping("getInstalledStyles", "");

$(function() {
  navInit();

  ping("loadSettings");

  $("#content input, #content select, #content textarea").on(
    "change update",
    function() {
      var form = $("#content form"),
        data = form.serializeArray();

      data = data.concat(
        $("input[type=checkbox]:not(:checked)", form)
          .map(function() {
            return { name: this.name, value: "off" };
          })
          .get()
      );
      ping("saveSettings", data);
    }
  );

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

  $("#jsonfile")
    .change(function(data) {
      var reader = new FileReader(),
        file = data.srcElement
          ? data.srcElement.files[0]
          : data.currentTarget.files[0];

      reader.onload = function(e) {
        try {
          json = $.parseJSON(e.target.result);
          $.each(json.data, function(n, e) {
            ping("saveStyle", {
              import: true,
              id: e.id,
              json: typeof e.json == "object" ? e.json : JSON.parse(e.json)
            });
          });
        } catch (e) {
          alert("Wrong file format!");
        }
        $(".importexportform").removeClass("busy");
      };

      reader.readAsText(file);
      $(".importexportform").addClass("busy");
    })
    .hover(
      function() {
        $("#import").addClass("hover");
      },
      function() {
        $("#import").removeClass("hover");
      }
    );

  $("#export").click(function(data) {
    $(".importexportform").addClass("busy");
    var uri_content =
      "data:application/octet-stream," +
      encodeURIComponent(JSON.stringify(stylishjson, null, "\t"));
    $("#export").attr({
      href: uri_content
    });
    $(".importexportform").removeClass("busy");
  });
});

function updateInfo(user) {
  //log(user);
  var i = $(".userinfo");
  if (!user) {
    i.empty();
  } else {
    i.append("Name: " + user.name);
    if (user.styles.length) {
      i.append("<ul/>");
      $.each(user.styles, function(n, s) {
        $("ul", i).append("<li>- " + s.name + "</li>");
      });
    }
  }
}

function toggleLoginForm(f1, f2) {
  $("#loginform").toggleClass("hide", !f1);
  $("#logoutform").toggleClass("hide", !f2);
}

function updateStylesInfo(list) {
  //var content = $('#content'), list = $('<dl/>',{id:'stylesstatus'}).appendTo(content);
  //log(m)
  stylishjson = { data: list };
}

function getUserInfo(html) {
  var user = {},
    trs;
  user.loggedin = html.indexOf("password-login") < 0;
  if (user.loggedin) {
    user.id = $("article.style-brief", html)
      .eq(0)
      .attr("author-id");
    user.name = unescape(
      $('a[href*="/messages/add/"]', html)
        .attr("href")
        .split("/")[5]
    );
    if ((trs = $('.author-styles tbody tr[class!="style-warnings"]', html))) {
      user.styles = [];
      $.each(trs, function(n, tr) {
        var tds = $("td", tr),
          style = {};
        if (tds.length) {
          if ($(tds[0]).hasClass("obsolete")) return;
          style.name = $("a", tds[0]).text();
          style.installs = parseFloat(
            $(tds[3])
              .text()
              .replace(",", "")
          );
          style.url = $("a", tds[0]).prop("href");
          style.id = style.url.split("/")[2];
          user.styles.push(style);
        }
      });
    }
  }
  return user;
}

function pong(event) {
  var n = event.name,
    m = event.message,
    t = event.target;
  switch (n) {
    case "setInstalledStyles":
      updateStylesInfo(m);
      break;
    case "loadSettings":
      $.each(m, function(name, value) {
        var input = $('input[name="' + name + '"]');
        if (input.length) {
          var type = input.get(0).type;
          switch (type) {
            case "checkbox":
              if (value == "on") {
                input.attr({ checked: "checked" });
              } else {
                input.removeAttr("checked");
              }
              break;
            case "input":
            case "select":
            case "textarea":
              input.val(value);
              break;
          }
        }
      });
      break;
  }
}

function log(e) {
  console.log(e);
}

function ping(name, data) {
  safari.self.tab.dispatchMessage(name, data);
}

safari.self.addEventListener("message", pong, true);
