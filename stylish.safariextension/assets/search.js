$(function() {
  navInit();

  var dl = document.location,
    hash = dl.hash.substr(1),
    w = window;

  getSearchResults(hash);

  initPopup();

  $(document).on("click", ".style-install", function() {
    var t = $(this)
        .attr("disabled", "disabled")
        .text("Downloading"),
      s = t.parent();
    id = t.attr("rel");
    s.addClass("busy");
    $.getJSON("https://userstyles.org/styles/chrome/" + id + ".json", function(
      json
    ) {
      t.text("Installed");
      s.removeClass("busy").addClass("installed");
      json.enabled = true;
      $.get("https://userstyles.org/styles/install/1?source=stylish-sf");
      ping("saveStyle", { id: id, json: json });
    });
  });

  $(document).on("click", ".pagination a", function(event) {
    event.preventDefault();
    var a = $(this),
      href = a.attr("href"),
      content = $("#searchresult dd");
    if (href != "NaN") {
      $("#searchresult").addClass("busy");

      $("body").animate({ scrollTop: 0 }, function() {
        content.slideUp(function() {
          content.empty().show();
          getSearchResults(hash, a.attr("href"));
        });
      });
    }
    return false;
  });

  $(document).on("change", "#ssearch", function() {
    hash = $(this).val();
    if (hash != "") getSearchResults(hash);
  });

  $(document).on("click", "#subcategory-list li", function() {
    hash = $(this).attr("tname");
    $("#ssearch")
      .val(hash)
      .trigger("change");
  });

  $(document).on("click", ".screenshot", function() {
    var i = $(this),
      src = i.attr("src").replace("_thumbnails", "s"),
      img = new Image(),
      w,
      h;
    $("#popup")
      .trigger("show")
      .append(
        $("<img>", { src: src, class: "after" })
        //$('<img>', {src: src.replace('_after','_before'), 'class':'before'}).on('error', function() {$(this).remove()})
      );
  });
});

function initPopup() {
  $("body").append(
    $("<div/>", { id: "popup" })
      .hide()
      .bind("hide", function() {
        $(this).fadeOut(function() {
          $(this).empty();
        });
      })
      .bind("show", function() {
        $(this).fadeIn();
      })
      .bind("click", function() {
        $(this).trigger("hide");
      })
  );

  $(document).keyup(function(e) {
    if (e.keyCode == 27) {
      $("#popup").trigger("hide");
    }
  });
}

function renderList(json, host) {
  $("#content dt input").val(host);
  var content = $("#searchresult dd").empty();
  // #main-article
  if (json.data.length) {
    content.append('<ul id="styles"/>');
    $.each(json.data, function(n, s) {
      var r = Math.round(s.rating * 1.666666);
      $("#styles", content).append(
        '<li class="style-brief" id="' +
          s.id +
          '"><div class="listing-left-info"><figure class="' +
          (s.screenshot_url ? "screenshot-thumbnail" : "no-screenshots") +
          '">' +
          (s.screenshot_url
            ? '<img src="' + s.screenshot_url + '" alt="" class="screenshot">'
            : "") +
          '</figure></div><article class="style-brief-text"><header>' +
          s.name +
          "</header><p>" +
          s.description +
          '</p><div class="style-brief-stats"><span class="ratio" title="Average rating: ' +
          s.rating +
          '">★★★★★<span style="width:' +
          (Math.round(s.rating * 2) / 2).toFixed(1) * 20 +
          '%">★★★★★</span></span></div><button class="style-install" rel="' +
          s.id +
          '">Install</button></article></li>'
      );
    });

    if (json.total_pages > 1) {
      content.append('<div class="pagination"/>');
      for (i = 1; i < json.total_pages; i++) {
        $(".pagination", content).append(
          '<a href="' +
            i +
            '" class="point ' +
            (i == json.current_page ? "active" : "") +
            '"/>'
        );
      }
    }

    /*

    $('.style-brief-text header a').each(function(n,a){
      var a = $(a), id = a.attr('href').split('/')[2];
      a.closest('.style-brief').attr('id', id);
    });

    $('a', content).each(function(n,a) {
      var a = $(a);
      if (a.hasClass('delete-link')) {
        a.closest('style-brief').attr('id',a.attr('href').replace('/styles/delete/',''));
      }
      a.not('.pagination a').replaceWith(a.html());
    });

    $('.style-brief-control-links, div[style="clear:left"], .ad').remove();
    $('.style-brief-stats').each(function() {
      var d = $(this), s = d.closest('article.style-brief'), a = s.attr('average-rating')*1,
        r = Math.round(a*1.666666);
      d.html(
        $('<span/>',{class:'ratio',html:'★★★★★',title:'Average rating: '+(r>0?r+'/5':'N/A')}).append(
          $('<span/>',{html:'★★★★★'}).css('width',r*20+'%')
        )
      );
    });

    imgSize();

    $('.style-brief').each(function() {
      var s = $(this).addClass('cln'), id = s.attr('id');
      s.append(
        $('<button/>',{text:'Install',rel:id, class:'style-install'})
      );
    });

    $('.style-brief').last().addClass('last-child');

    */

    //renderNav();

    ping("getInstalledStyles", "");
  } else {
    content.html("No styles found");
  }
}

function imgSize() {
  $(".screenshot").each(function() {
    var i = $(this);
    i.on("load", function() {
      var src = i.prop("src"),
        img = new Image(),
        w,
        h,
        p;
      img.src = src;
      h = img.height;
      w = img.width;
      p = 145 / 83;
      if (w / h > p) {
        w = (w / h) * 83;
        h = 83;
      } else {
        w = 146;
        h = "auto";
      }
      i.css({
        left: (146 - w) / 2,
        top: (84 - h) / 2,
        height: h,
        width: w
      });
    });
  });
}

function renderNav() {
  $(".pagination a").each(function() {
    var a = $(this),
      href = a.attr("href");
    a.attr("href", href.split("?")[1].replace("page=", ""));
  });

  var nav = $(".pagination"),
    total = parseInt(
      nav
        .children()
        .last()
        .prev()
        .text()
    ),
    current = parseInt($(".current", nav).text()),
    next = parseInt($(".next_page", nav).attr("href")),
    prev = parseInt($(".prev_page", nav).attr("href"));
  content = $("#searchresult dd");
  //  console.log(total,current,next,prev);
  nav.empty().append($("<a/>", { href: prev, class: "prev" }));
  for (var i = 1; i <= total; i++) {
    var c = i == current;
    nav.append($("<a/>", { href: i, class: "point" + (c ? " active" : "") })); // ○
  }
  nav.append($("<a/>", { href: next, class: "next" }));

  //  nav.clone().prependTo(content);
}

function renderSitesList(json) {
  var content = $("#searchresult dd").empty();
  if (json.data.length) {
    content.append('<ul id="subcategory-list"/>');
    $.each(json.data, function(n, s) {
      $("ul", content).append(
        '<li tname="' +
          s.name +
          '" tcount="' +
          s.styles +
          '">' +
          s.name +
          "<i>" +
          s.styles +
          "</i></li>"
      );
    });
  }
}

function getSearchResults(host, page) {
  $("#searchresult").addClass("busy");
  if (host) {
    domain = getDomain(host);
    document.title = "userstyles for «" + host + "»";
    //    OLD STYLE
    //    var usss = 'https://userstyles.org/styles/browse/';
    //    var usss = 'https://userstyles.org/styles/browse/site?sort=popularity&search_terms=';
    var usss = "https://userstyles.org/api/v1/styles/subcategory?search=";
    $.getJSON(
      usss + domain + "&per_page=22&country=us&page=" + (page ? page : 1),
      function(json) {
        $("#searchresult").removeClass("busy");
        renderList(json, host);
      }
    );
  } else {
    document.title = "Search userstyles";
    var usss = "https://userstyles.org/api/v1/categories/site";
    $.getJSON(usss, function(json) {
      $("#searchresult").removeClass("busy");
      renderSitesList(json);
    });
  }
}

function log(l) {
  console.log(l);
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
      $(".style-brief").removeClass("installed");
      $.each(m, function(i, el) {
        $("#" + el.id).addClass("installed");
        $('button[rel="' + el.id + '"]')
          .attr("disabled", "disabled")
          .text("installed");
      });
      break;
  }
}

safari.self.addEventListener("message", pong, true);
