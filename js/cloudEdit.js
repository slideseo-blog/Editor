$(document).ready(function() {
  "use strict";
  // Globals
  // ---
  // For buildOutput() creation:
  var use_Autoprefixer = false;
  var use_Less = false;
  // var use_Sass = false;
  var use_Modernizr = false;
  var use_Normalize = false;

  // Toggle Text Areas from Displaying
  $("#htmlToggle").on("click", function(el) {
    el.preventDefault();
    closeWindow(this, "html");
  });
  $("#cssToggle").on("click", function(el) {
    el.preventDefault();
    closeWindow(this, "css");
  });
  $("#jsToggle").on("click", function(el) {
    el.preventDefault();
    closeWindow(this, "js");
  });
  $("#consoleToggle").on("click", function(el) {
    el.preventDefault();
    $(this).toggleClass("btn-hidden");
    $(".console").toggle();
  });
  $("#previewToggle, #iframeClose").on("click", function(el) {
    el.preventDefault();
    $("#previewToggle").toggleClass("btn-hidden");
    $(".preview, html, body, section, #iframeLabel, #iframeClose").toggleClass("modal-open");
  });

  // On toggling an editor pane resize remaining and toggle button class
  function closeWindow(el, name) {
    var count = numberOfWindows();
    if (count > 1 || $(el).hasClass("btn-hidden")) {
      $(el).toggleClass("btn-hidden");
      $(".window." + name).toggle();
      resizeWindow();
    } else {
      alert("You Must Have at least one Editor open");
    }
  }

  // Resize panes based upon number currently toggled ON
  function resizeWindow() {
    var count = numberOfWindows();
    var win = $(".window");
    if (count === 3 || count === 0) {
      win.css("width", "33%");
    } else if (count === 2) {
      win.css("width", "49.5%");
    } else if (count === 1) {
      win.css("width", "100%");
    }
  }

  // Return the number of editor panes displayed
  function numberOfWindows() {
    var count = 3;
    var items = $(".window");
    items.each(function(el) {
      if ($(items[el]).css("display") === "none") count -= 1;
    });
    return count;
  }

  // Used by preview and download to compile editor panes and "Imports" into valid html
  function buildOutput(consoleJS) {
    var contents = {
      html: htmlField.getValue(),
      style: cssField.getValue(),
      js: jsField.getValue()
    };

    // String to hold elements to build HTML output
    var html = '';
    html += '<html lang="en">\n';
    html += '<head>\n';
    html += '<meta charset="UTF-8">\n';
    if (use_Normalize) {
      html += '<link href="http://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.1/normalize.min.css" rel="stylesheet">\n'
    }
    if (use_Less) {
      html += '<style type="text/less">\n';
    } else {
      html += '<style type="text/css">\n';
    }
    if (use_Autoprefixer) {
      html += autoprefixer({ cascade: true }).process(contents.style).css;
    } else {
      html += contents.style;
    }
    html += '\n</style>\n';
    html += '<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>\n';
    if (use_Modernizr) {
      html += '<script src="http://cdnjs.cloudflare.com/ajax/libs/modernizr/2.7.1/modernizr.min.js"></script>\n';
    }
    if (use_Less) {
      html += '<script src="http://cdnjs.cloudflare.com/ajax/libs/less.js/1.7.0/less.min.js"></script>\n';
    }
    html += '</head>\n';
    html += '<body>\n';
    html += contents.html;
    // true if previewing in the preview pane; false if called by download function.
    if (consoleJS) {
      html += '<script src="js/console.min.js"></script>\n';
    }
    html += '\n<script>\n';
    html += contents.js;
    html += '\n</script>\n';
    html += '</body>\n';
    html += '</html>';

    return html;
  }

  // Publish output from HTML, CSS, and JS textareas in the iframe below
  // when "Run" button clicked.
  $("#run").on("click", function(el) {
    el.preventDefault();

    // pass true as we want the pseudo console.js script
    var textToWrite = buildOutput(true);

    (document.getElementById("iframe").contentWindow.document).write(textToWrite);
    (document.getElementById("iframe").contentWindow.document).close();
  });

  // Download HTML/CSS/JS
  // Source: http://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
  $("#download").on("click", function() {

    var $download = $("#download")[0];
    // pass false as we don't want the pseudo console.js script
    var textToWrite = buildOutput(false);
    var textFileAsBlob = new Blob([textToWrite], {type: "text/plain"});
    var fileNameToSaveAs = "index.html";

    $download.download = fileNameToSaveAs;

    if (typeof window.webkitURL === "function") {
      // Chrome
      $download.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      // Firefox
      $download.href = window.URL.createObjectURL(textFileAsBlob);
    }
  });

  // Clear editors with "Clear" button
  $("#clear").on("click", function() {
    htmlField.setValue("<!-- Do not place html/head/body tags here.\n" +
      "Insert the tags as would normally be used in your\n" +
      "body element. <script> tags ARE allowed, though\n" +
      "they're best placed at the end of your HTML -->\n");
    htmlField.clearSelection();
    cssField.setValue("");
    jsField.setValue("");
    $("#console").empty();
    sessionStorage.clear();
    (document.getElementById("iframe").contentWindow.document).write("");
    (document.getElementById("iframe").contentWindow.document).close();
  });

  // ContextMenu
  // This is going to get VERY unruly!
  (function() {
    $.contextMenu({
      selector: ".windowGroup",
      "items": {
        "imports": {
          "name": "Imports",
          "items": {
            "plaincss": {
              "name":"Plain CSS [Default]",
              "type": "radio",
              "radio": "css",
              "value": "plaincss",
              "selected": true
            },
            "autoprefixer": {
              "name": "Autoprefixer",
              "type": "radio",
              "radio": "css",
              "value": "autoprefixer",
              "selected": false
            },
            "less": {
              "name": "Less CSS",
              "type": "radio",
              "radio": "css",
              "value": "less",
              "selected": false
            },
            /*
             * "sass": {
             *   "name": "Sass CSS",
             *   "type": "radio",
             *   "radio": "css",
             *   "value": "sass",
             *   "selected": false
             * },
             */
            "normalize": {
              "name": "Normalize CSS",
              "type": "checkbox",
              "selected": false
            },
            "modernizr": {
              "name": "Modernizr",
              "type": "checkbox",
              "selected": false
            }
          }
        },
        "themes": {
          "name": "Themes",
          "items": {
            "light": {
              "name": "Light",
              "items": {
                "chrome": {
                  "name": "Chrome",
                  "callback": function() {
                    updateTheme("chrome");
                  }
                },
                "dreamweaver": {
                  "name": "Dreamweaver",
                  "callback": function() {
                    updateTheme("dreamweaver");
                  }
                },
                "dawn": {
                  "name": "Dawn",
                  "callback": function() {
                    updateTheme("dawn");
                  }
                },
                "tomorrow": {
                  "name": "Tomorow",
                  "callback": function() {
                    updateTheme("tomorrow");
                  }
                },
                "xcode": {
                  "name": "XCode",
                  "callback": function() {
                    updateTheme("xcode");
                  }
                },
                "kuroir": {
                  "name": "Kuroir",
                  "callback": function() {
                    updateTheme("kuroir");
                  }
                },
                "katzenmilch": {
                  "name": "KatzenMilch",
                  "callback": function() {
                    updateTheme("katzenmilch");
                  }
                }
              }
            },
            "dark": {
              "name": "Dark",
              "items": {
                "ambiance": {
                  "name": "Ambiance",
                  "callback": function() {
                    updateTheme("ambiance");
                  }
                },
                "cloudsmidnight": {
                  "name": "Clouds Midight",
                  "callback": function() {
                    updateTheme("clouds_midnight");
                  }
                },
                "idlefingers": {
                  "name": "Idle Fingers",
                  "callback": function() {
                    updateTheme("idle_fingers");
                  }
                },
                "merbivore": {
                  "name": "Merbivore",
                  "callback": function() {
                    updateTheme("merbivore");
                  }
                },
                "merbivoresoft": {
                  "name": "Merbivore Soft",
                  "callback": function() {
                    updateTheme("merbivore_soft");
                  }
                },
                "monokai": {
                  "name": "Monokai",
                  "callback": function() {
                    updateTheme("monokai");
                  }
                },
                "tomorrownight": {
                  "name": "Tomorrow Night",
                  "callback": function() {
                    updateTheme("tomorrow_night");
                  }
                },
                "twilight": {
                  "name": "Twilight",
                  "callback": function() {
                    updateTheme("twilight");
                  }
                }
              }
            },
            "default": {
              "name": "Default",
              "callback": function() {
                updateTheme("chrome");
              }
            }
          }
        }
      },
      events: {
        show: function(opt) {
          // this is the trigger element
          var $this = this;
          // import states from data store
          $.contextMenu.setInputValues(opt, $this.data());
          // this basically fills the input commands from an object
          // like {name: "foo", yesno: true, radio: "3", …}
        },
        hide: function(opt) {
          // this is the trigger element
          var $this = this;
          // export states to data store
          $.contextMenu.getInputValues(opt, $this.data());
          // this basically dumps the input commands' values to an object
          // like {name: "foo", yesno: true, radio: "3", …}
        }
      }
    });
  })();

  // Get checkbox values from context-menu-input-*
  // and update "global" variables in order to build
  // preview window
  $("input[name*='context-menu-input']").on("click", function() {
    var val = $(this).val();
    if (val) {
      switch (val) {
        case "plaincss":
          use_Autoprefixer = false;
          use_Less = false;
          // use_Sass = false;
          break;
        case "autoprefixer":
          use_Autoprefixer = true;
          use_Less = false;
          // use_Sass = false;
          break;
        case "less":
          use_Less = true;
          // use_Sass = false;
          use_Autoprefixer = false;
          break;
        /*
         * case "sass":
         *   use_Sass = true;
         *   use_Less = false;
         *   use_Autoprefixer = false;
         *   break;
         */
      }
    } else {
      var checked = $(this).is(":checked");
      var item = event.target.name; //$(this)[0].name;
      switch (item) {
        case "context-menu-input-modernizr":
          use_Modernizr = checked;
          break;
        case "context-menu-input-normalize":
          use_Normalize = checked;
          break;
      }
    }
  });

  // Apply theme and save to localStorage
  function updateTheme(theme) {
    theme = "ace/theme/" + theme;
    htmlField.setTheme(theme);
    cssField.setTheme(theme);
    jsField.setTheme(theme);
    consoleField.setTheme(theme);
    localStorage.setItem("theme", theme);
  }

  // right click on console to clear;
  $(".console").on("contextmenu", function(el) {
    el.preventDefault();
    consoleField.setValue("");
  });

  // Detect a user leaving a page and display a message
  window.onbeforeunload = function (e) {
    // If we haven't been passed the event get the window.event
    e = e || window.event;
    var message = "Your current session will be lost..";
    // For IE6-8 and Firefox prior to version 4
    if (e) e.returnValue = message;
    // For Chrome, Safari, IE8+ and Opera 12+
    return message;
  };

});
