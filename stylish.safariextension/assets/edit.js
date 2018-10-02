var tpl1 =
    '<dl><dt>{H1}</dt><dd class="editor"><form id="{ID}" class="styleseditor"><p class="stitle"><label for="TITLE{ID}">Title:</label><input type="text" name="title" value="{TITLE}" id="TITLE{ID}"></p></form></dd></dl><p class="controls"><button class="add">Add section</button><button id="save" class="fr">Save Style</button></p>',
  tpl2 =
    '<fieldset><legend>Section #{NUM}</legend><p class="code"><label>CSS:</label><span class="errors"></span><textarea class="code" id="CSS{NUM}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea></p><p class="controls section"><button class="remove fr red">Delete section</button></p>{RULES}</fieldset>',
  tpl3 =
    '<p class="rule"><label>Applies to:</label><select name="apply"><option value="url">URL</option><option value="pre">URL prefix</option><option value="dom">Domain</option><option value="reg">Regexp</option><option value="global">Global</option></select><input name="rule" type="text" value="{RULE}"><button class="remove red">Delete</button><button class="add">Add rule</button></p>',
  datain,
  b,
  dl = document.location,
  id = dl.hash.substr(1),
  altKey = false,
  saved = true;

$(function() {
  navInit();
  var b = $("#content");

  $.fn.toggleAttr = function(a, b) {
    return this.each(function() {
      var t = $(this);
      b ? t.attr(a, a) : t.removeAttr(a);
    });
  };

  $(document).on("click", ".rule .add", function(event) {
    event.preventDefault();
    var b = $(this),
      p = b.parent(),
      n = parseInt($(".rule", p.parent()).length) + 1;
    p.after($(tpl3.replace(/\{RULE\}/g, "")));
    updateControls();
    saved = false;
    return false;
  });

  $(document).on("click", ".rule .remove", function(event) {
    event.preventDefault();
    var b = $(this),
      p = b.parent(),
      fs = p.parent(),
      f = $("form");
    if ($(".rule", fs).length > 1) p.remove();
    updateControls();
    if (!event.isTrigger) saved = false;
    return false;
  });

  $(document).on("change", ".rule select", function(event) {
    var s = $(this),
      p = s.parent(),
      i = $("input", p),
      v = s.val(),
      g = v == "global",
      iv = i.val(),
      o = i.attr("old");
    i.val(g ? "" : o).toggleAttr("disabled", g);
    if (!event.isTrigger) saved = false;
  });
  $(document).on("change", ".rule input", function(event) {
    var i = $(this),
      v = i.val();
    i.attr("old", v);
    if (!event.isTrigger) saved = false;
  });

  $(document).on("click", ".controls .add", function(event) {
    event.preventDefault();
    var slen = $(".styleseditor fieldset").length,
      stpl = tpl2.replace(/\{NUM\}/g, slen),
      rule = tpl3.replace(/\{NUM\}/g, slen).replace(/\{RULE\}/g, "");
    $(".styleseditor").append($(stpl.replace(/\{RULES\}/g, rule)));
    codemirror(document.getElementById("CSS" + slen));
    updateControls();
    if (!event.isTrigger) saved = false;
    return false;
  });

  $(document).on("click", ".controls .remove", function(event) {
    event.preventDefault();
    var b = $(this),
      section = b.parent().parent();
    section.remove();
    updateControls();
    if (!event.isTrigger) saved = false;
    return false;
  });

  $(document).on("click", "#save", function(event) {
    var data = {},
      id = $(this).val();
    data = {
      enabled: datain.enabled,
      name: $(".stitle input").val(),
      url: datain.url,
      updateUrl: datain.updateUrl,
      sections: []
    };

    $.each($(".styleseditor fieldset"), function(i, f) {
      var dom = [],
        reg = [],
        url = [],
        pre = [];
      $.each($(".rule", f), function(n, rule) {
        var type = $("select", rule).val(),
          val = $("input", rule).val();
        switch (type) {
          case "dom":
            dom.push(val);
            break;
          case "reg":
            reg.push(val);
            break;
          case "url":
            url.push(val);
            break;
          case "pre":
            pre.push(val);
            break;
        }
      });
      data.sections[i] = {
        code: $("textarea.code", f).val(),
        domains: dom,
        regexps: reg,
        urlPrefixes: pre,
        urls: url
      };
    });
    if (JSON.stringify(data).hashCode() != JSON.stringify(datain).hashCode()) {
      ping("saveStyle", { id: id, json: data });
    }
    saved = true;
    if (!event.altKey)
      window.location = safari.extension.baseURI + "manage.html";
  });

  $(document).on("click", "#back", function(event) {
    event.preventDefault();
    window.location = safari.extension.baseURI + "manage.html";
    return false;
  });

  if (id) {
    ping("editStyle", { id: id });
  } else {
    editStyle(false, {
      name: "New Style",
      sections: [
        {
          domains: [""],
          urls: [],
          urlPrefixes: [],
          regexps: [],
          code: ""
        }
      ],
      updateUrl: "",
      url: "",
      enabled: true
    });
  }
});

function updateControls() {
  $(".rule input").trigger("change");
  $(".controls .remove").toggleAttr(
    "disabled",
    $(".styleseditor fieldset").length == 1
  );
  $(".rule .remove").toggleAttr("disabled", false);
  $(".styleseditor fieldset").each(function() {
    var r = $(".rule .remove", $(this));
    if (r.length == 1) r.eq(0).attr("disabled", true);
  });
  $(".rule select").trigger("change");
}

function editStyle(id, json) {
  if ($("#content").hasClass("inprogress")) return;
  var h1 = id ? "Edit style" : "Edit new style";
  id = id ? id : new Date().getTime();
  datain = json;
  var html = $(
      tpl1
        .replace(/\{TITLE\}/g, json.name)
        .replace(/\{ID\}/g, id)
        .replace(/\{H1\}/g, h1)
    ),
    stpl = "",
    b = $("#content");
  b.append(html);
  $.each(json.sections, function(i1, section) {
    stpl = tpl2.replace(/\{NUM\}/g, i1);
    var rules1 = "",
      rules2 = "",
      rules3 = "",
      rules4 = "";
    $.each(section.urls, function(i2, rule) {
      rules1 += tpl3.replace(/\{NUM\}/g, i2).replace(/\{RULE\}/g, rule);
    });
    $.each(section.urlPrefixes, function(i2, rule) {
      rules2 += tpl3.replace(/\{NUM\}/g, i2).replace(/\{RULE\}/g, rule);
    });
    $.each(section.domains, function(i2, rule) {
      rules3 += tpl3.replace(/\{NUM\}/g, i2).replace(/\{RULE\}/g, rule);
    });
    $.each(section.regexps, function(i2, rule) {
      rules4 += tpl3.replace(/\{NUM\}/g, i2).replace(/\{RULE\}/g, rule);
    });
    rules1 = rules1.replace(/value=\"url\"/g, 'value="url" selected');
    rules2 = rules2.replace(/value=\"pre\"/g, 'value="pre" selected');
    rules3 = rules3.replace(/value=\"dom\"/g, 'value="dom" selected');
    rules4 = rules4.replace(/value=\"reg\"/g, 'value="reg" selected');

    if (!(rules1 + rules2 + rules3 + rules4).length) {
      rules1 = tpl3
        .replace(/\{NUM\}/g, 0)
        .replace(/\{RULE\}/g, "")
        .replace(/value=\"global\"/g, 'value="global" selected');
    }

    $(".styleseditor").append(
      $(stpl.replace(/\{RULES\}/g, rules1 + rules2 + rules3 + rules4))
    );
    $(".styleseditor textarea")
      .last()
      .val(section.code);
  });
  $("#save").val(id);
  $("#content").addClass("inprogress");

  $("textarea.code").each(function(n, textarea) {
    codemirror(textarea);
  });

  updateControls();
}

$(window)
  .keydown(function(event) {
    if (event.altKey) {
      altKey = true;
      $("#save").html("Quick Save");
    }
  })
  .keyup(function(event) {
    if (!event.altKey) {
      altKey = false;
      $("#save").html("Save Style");
    }
  });

window.onbeforeunload = function(e) {
  if (e && !saved) return "Some changes are not saved!";
};

function codemirror(textarea) {
  var editor = CodeMirror.fromTextArea(textarea, {
      mode: "css",
      indentWithTabs: true,
      lineWrapping: true,
      styleActiveLine: true,
      matchBrackets: true,
      inputStyle: "contenteditable"
    }),
    doc = editor.getDoc(),
    errors = [],
    errorslabel = $(textarea).prev(".errors");

  editor.setSize(
    null,
    Math.min(Math.max(8, textarea.value.split("\n").length), 36) * 18 + 8
  );
  emmetCodeMirror(editor);
  emmetCodeMirror.emmet.preferences.define(
    "css.autoInsertVendorPrefixes",
    false
  );

  csslint();

  editor.on("change", function(event) {
    saved = false;
    editor.save();
    editor.setSize(
      null,
      Math.min(Math.max(8, textarea.value.split("\n").length), 36) * 18 + 8
    );

    csslint();
  });
  editor.on("cursorActivity", csslint);

  function csslint() {
    var lint = CSSLint.verify(textarea.value);

    if (lint.messages) {
      var newerrors = [];

      $.each(lint.messages, function(n, message) {
        if (message.type == "error") newerrors.push(message.line);
      });

      if (newerrors.length) {
        errorslabel
          .text(
            "⚠️ " +
              newerrors.length +
              " Error" +
              (newerrors.length > 1 ? "s" : "")
          )
          .show();
        clearerrors();
        $.each(newerrors, function(n, line) {
          doc.addLineClass(line - 1, "text", "csserror");
        });
      } else {
        errorslabel.hide();
        clearerrors();
      }

      errors = newerrors;
    }
  }

  function clearerrors() {
    $.each(errors, function(n, line) {
      doc.removeLineClass(line - 1, "text", "csserror");
    });
  }
}

function ping(name, data) {
  safari.self.tab.dispatchMessage(name, data);
}

function pong(event) {
  var n = event.name,
    m = event.message,
    t = event.target;
  switch (n) {
    case "setInstalledStyles":
      renderStylesList(m);
      break;
    case "editStyle":
      editStyle(m.id, m.json);
      break;
  }
}

function log(l) {
  console.log(l);
}

safari.self.addEventListener("message", pong, true);
