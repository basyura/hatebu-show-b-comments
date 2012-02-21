// ==UserScript==
// @name           hatebu-show-b-comments
// @namespace      hatebu@basyura.org
// @description    show hatebu comments
// @resource       jquery    http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js 
// @include        http://b.hatena.ne.jp/basyura/
// ==/UserScript==

(function (w) {

(function() { 
  var head   = document.getElementsByTagName('head')[0]; 
  var script = document.createElement('script');
  script.type = 'text/javascript'; 
  var jQuery   = GM_getResourceText('jquery');
  //var jQueryUI = GM_getResourceText('jqueryui'); 
  //script.innerHTML = jQuery + jQueryUI;
  script.innerHTML = jQuery;
  head.appendChild(script); 
  $ = w.$; 
})();
   
const JSON_API_URL = "http://b.hatena.ne.jp/entry/json/";
const TORIGGER_KEY = "m";
const REMOVE_KEY   = "M";
const ID_COMMENT   = "#hatena_bookmark_comment";
const ID_CONTENTS  = "#hatena_bookmark_comment";
const CONTENTS_WIDTH_RATE    = 0.8;
const CONTENTS_HEIGHT_RATE   = 0.6;
const CONTENTS_SCROLL_HEIGHT = 40;
       
    w.addEventListener('keypress', function(e) {
        var key = String.fromCharCode(e.charCode)
        if (key != TORIGGER_KEY && key != REMOVE_KEY) {
          removeComment();
          return true;
        }
        if(isExistComment()) {
           var comment  = appendComment();
           var contents = getSingleNodeValue(comment , ".//div[@id='" + ID_CONTENTS + "']");
            if(contents.scrollHeight <= contents.scrollTop + getContentsHeight()) {
                removeComment();
            }
            if (key == TORIGGER_KEY) {
              contents.scrollTop += CONTENTS_SCROLL_HEIGHT;
            }
            else {
              contents.scrollTop -= CONTENTS_SCROLL_HEIGHT;
            }
        }
        else {
            appendComment().innerHTML = createComment({"title":"loading ...","count":-1,"bookmarks":[]});
            showComments(w.Hatena.Bookmark.Navigator.instance.getCurrentElement().childNodes[3].href);
        }
        return true;
    },true);
// private methods
function showComments(link) {
    var opt = {
        method: 'GET',
        url: JSON_API_URL + link,
        onload: function(res){
            if(!isExistComment()) {
                return;
            }
            var text = "(" + res.responseText +")";
            var bm = text == "(null)" ? {"title":"no comment" , "count":-1,"bookmarks":[]} : eval(text);
            appendComment().innerHTML = createComment(bm);
        },
        onerror: function(res){
        },
    }
    window.setTimeout(GM_xmlhttpRequest, 0, opt);
}
function removeComment() {
  $(ID_COMMENT).remove();
}
function isExistComment() {
  return $(ID_COMMENT).size() != 0
}
function appendComment() {
  /* TODO : use jQuery
    var comment = $(ID_COMMENT);
    if(comment.size() == 0) {
        comment = $("<div/>");
        comment.attr("id"     , ID_COMMENT)
               .attr("align"  , "center");
               .css("position", "absolute")
               .css("width"   , "100%")
               .css("top"     , $(document.documentElement).scrollTop() + 50 + "px;")
        $(body).appendChild(comment);
    }
    return comment;
   */
    var comment = document.getElementById("hatena_bookmark_comment");
    if(comment == null) {
        comment = document.createElement("div");
        comment.setAttribute("id"    , "hatena_bookmark_comment");
        comment.setAttribute("style" , "position:absolute;width:100%;top:" + (document.documentElement.scrollTop + 50 ) + "px;");
        comment.setAttribute("align" , "center");
        document.body.appendChild(comment);
    }
    return comment;
}
function createComment(bm) {
    var bookmarks = bm.bookmarks.reverse();
    var buf = [];
    buf.push("<div style='width:" + getContentsWidth() + "px;border:1px solid #2C6EBD;border-radius:5px 5px 5px 5px;padding:2px;background-color:#2C6EBD;'>");
    buf.push("<div style='color:#ffffff;padding:5px;' align='left'>");
    buf.push("&nbsp;" + bm.title);
    buf.push("&nbsp;&nbsp;");
    if(bm.count > 0) {
      buf.push("<span style='background-color:#FFCCCC;color:#FF0000;font-size:10pt;padding:2px;border-radius:5px 5px 5px 5px;'>");
        buf.push(bm.count + " users");
        buf.push("</span>");
    }
    buf.push("</div>");
    buf.push("<div id='" + ID_CONTENTS + "' style='");
    buf.push("height:" + getContentsHeight() + "px;");
    buf.push("overflow-y:auto;");
    buf.push("background-color:#f0f0f0;");
    buf.push("border:3px solid #2C6EBD;");
    buf.push("font-size:10pt;");
    buf.push("' align='center'>");
    buf.push("<div style='width:95%;padding:3px;' align='left'>");
    for(var i = 0 ; i < bookmarks.length ; i++) {
        var b = bookmarks[i];
        if(b.comment == "") {
            continue;
        }
        buf.push("<img src='http://www.hatena.ne.jp/users/ba/" + b.user + "/profile_s.gif'>");
        buf.push("&nbsp;");
        buf.push("<span style='color:blue;'>" + b.user + "</span>");
        buf.push("&nbsp;" + b.comment + "&nbsp;" + b.timestamp);
        buf.push("<hr style='color:#c9f6ff;'>");
    }
    buf.push("</div>");
    buf.push("</div>");
    buf.push("</div>");
    return buf.join("");
}
function getSingleNodeValue(base , reg) {
    return document.evaluate(
                         reg ,
                         base ,
                         null ,
                         XPathResult.FIRST_ORDERED_NODE_TYPE ,
                         null).singleNodeValue;
}
function getContentsHeight() {
   return Math.floor(w.innerHeight * CONTENTS_HEIGHT_RATE);
}
function getContentsWidth() {
   return Math.floor(w.innerWidth  * CONTENTS_WIDTH_RATE);
}
})(this.unsafeWindow || this);
