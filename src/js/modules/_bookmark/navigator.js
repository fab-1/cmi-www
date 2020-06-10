
import intersection from "lodash/intersection";
import intersectionWith from "lodash/intersectionWith";
import range from "lodash/range";
import store from "store";
import scroll from "scroll-into-view";
import notify from "toastr";

import {shareByEmail} from "./shareByEmail";
import clipboard from "./clipboard";
import {getUserInfo} from "../_user/netlify";
import {getString, __lang} from "../_language/lang";

//const transcript = require("../_config/key");
//const bm_modal_store = "bm.www.modal";
//const bm_list_store = "bm.www.list";

//teaching specific constants
let teaching = {};

let shareEventListenerCreated = false;
let gPageKey;

function generateHorizontalList(listArray) {
  if (!listArray || listArray.length === 0) {
    return getString("annotate:m13");
  }

  return `
    <div class="ui horizontal bulleted list">
      ${listArray.map((item) => `
        <div class="item">
          <em>${typeof item === "object"? item.topic: item}</em>
        </div>
      `).join("")}
    </div>
  `;
}

/*
  generate html for annotation
  args: annotation - annotation object
        topics - filter array

  if topics.length > 0 then generate html only for
  annotations that have topics found in the filter array
*/
function generateAnnotation(annotation, topics = []) {
  let match;

  if (!annotation.topicList) {
    annotation.topicList = [];
  }

  //convert annotation topics list into string array
  let topicList = annotation.topicList.map((topic) => {
    if (typeof topic === "object") {
      return topic.value;
    }
    return topic;
  });

  if (topics.length > 0) {
    match = intersection(topicList, topics);
  }

  if (topics.length === 0 || match.length > 0) {
    return `
      <div class="item"> <!-- item: ${annotation.rangeStart}/${annotation.rangeEnd} -->
        <i class="right triangle icon"></i>
        <div class="content">
          <div class="header">
            ${generateHorizontalList(annotation.topicList)}
          </div>
          <div class="description">
            <a data-aid="${annotation.aid}" class="annotation-item" data-range="${annotation.rangeStart}/${annotation.rangeEnd}">
              ${annotation.Comment?annotation.Comment:getString("annotate:m7")}
            </a>
          </div>
        </div>
      </div> <!-- item: ${annotation.rangeStart}/${annotation.rangeEnd} -->
    `;
  }
  else {
    return `<!-- annotation filtered: ${topics.join(" ")} -->`;
  }
}

function generateBookmark(actualPid, bkmk, topics) {
  return `
    <div class="ui list">
      <div class="item">
        <i class="bookmark icon"></i>
        <div class="content">
          <div class="header">
            Paragraph: ${actualPid}
          </div>
          <div class="list">
            ${bkmk.map((annotation) => `
              ${generateAnnotation(annotation, topics)}
            `).join("")}
          </div>
        </div>
      </div>
    </div>
 `;
}

/*
  returns the url for the first annotation of the arg bookmark
  Note: deleted annotations are empty arrays so skip over them.
*/
function getBookmarkUrl(bookmarks, pageKey, pid) {
  let url;
  let bookmark = bookmarks[pageKey][pid];

  let selectedText = bookmark[0].selectedText;
  if (selectedText) {
    url = `${bookmark[0].selectedText.url}?bkmk=${bookmark[0].rangeStart}`;
  }
  else {
    //we have a bookmark with no selected text, have to get the url in another way
    url = `${teaching.url_prefix}${teaching.keyInfo.getUrl(pageKey)}?bkmk=${bookmark[0].rangeStart}`;
  }

  //console.log("url: %s", url);
  return url;
}

function getNextPageUrl(pos, pageList, filterList, bookmarks) {
  if (pos > pageList.length) {
    return Promise.resolve(null);
  }

  let found = false;
  let pagePos;
  let pid;

  outer: for(pagePos = pos; pagePos < pageList.length; pagePos++) {
    let pageMarks = bookmarks[pageList[pagePos]];
    for(pid in pageMarks) {
      for(let a = 0; a < pageMarks[pid].length; a++) {
        //no filter in effect
        if (!filterList || filterList.length === 0) {
          found = true;
          break outer;
        }
        else {
          //compare the filter topic (a) with bookmark topics ({value, topic})
          let match = intersectionWith(filterList, pageMarks[pid][a].topicList || [], (a,b) => {
            if (a === b.value) {
              return true;
            }
            return false;
          });
          if (match.length > 0) {
            found = true;
            break outer;
          }
        }
      }
    }
  }

  return new Promise((resolve) => {
    if (found) {
      let pageKey = pageList[pagePos];
      let url = getBookmarkUrl(bookmarks, pageKey, pid);

      //it's possible the url was not found so check for that
      if (url) {
        resolve(url);
      }
      else {
        resolve(null);
      }
    }
    else {
      //console.log("next url is null");
      resolve(null);
    }
  });
}

function getPrevPageUrl(pos, pageList, filterList, bookmarks) {
  if (pos < 0) {
    return Promise.resolve(null);
  }

  let found = false;
  let pagePos;
  let pid;

  outer: for(pagePos = pos; pagePos >= 0; pagePos--) {
    let pageMarks = bookmarks[pageList[pagePos]];
    for(pid in pageMarks) {
      for(let a = 0; a < pageMarks[pid].length; a++) {
        //no filter in effect
        if (!filterList || filterList.length === 0) {
          found = true;
          break outer;
        }
        else {
          let match = intersectionWith(filterList, pageMarks[pid][a].topicList || [], (a,b) => {
            if (a === b.value) {
              return true;
            }
            return false;
          });
          if (match.length > 0) {
            found = true;
            break outer;
          }
        }
      }
    }
  }

  return new Promise((resolve) => {
    if (found) {
      let pageKey = pageList[pagePos];
      let url = getBookmarkUrl(bookmarks, pageKey, pid);
      //console.log("prev url is %s", url);
      resolve(url);
    }
    else {
      //console.log("prev url is null");
      resolve(null);
    }
  });
}

function getNextPrevUrl(pageKey, bookmarks, bmModal) {
  let pages = Object.keys(bookmarks);
  let pos = pages.indexOf("lastFetchDate");
  let urls = {next: null, prev: null};

  if (pos > -1) {
    pages.splice(pos, 1);
  }

  pos = pages.indexOf(pageKey);
  if (pos === -1) {
    return Promise.reject("bookmark not found");
  }

  //console.log("current page: %s", pageKey);
  let nextPromise = getNextPageUrl(pos + 1, pages, bmModal["modal"].topics, bookmarks);
  let prevPromise = getPrevPageUrl(pos - 1, pages, bmModal["modal"].topics, bookmarks);

  return Promise.all([prevPromise, nextPromise]);
}

/*
  Given the postion (currentPos) in pageMarks of the current pid, find the previous
  one. Return the actualPid or null.

  Omit bookmarks that don't have at least one topic found in topics[]. If topics[]
  has no data then no filtering is done.

  args:
    currentPos - position in pageMarks of the current paragraph
    pageMarks - an array of paragraph keys with bookmarks
    pageBookmarks - bookmarks found on the page
    topics - an array of topics by which to filter bookmarks
*/
function getPreviousPid(currentPos, pageMarks, pageBookmarks, topics) {

  //there is no previous bookmark
  if (currentPos < 1) {
    return null;
  }

  //no filtering
  if (topics.length === 0) {
    return `p${(parseInt(pageMarks[currentPos - 1], 10) - 1).toString(10)}`;
  }
  else {
    //topic filtering - look through all previous paragraphs for the first one
    //containing an annotation found in topics[]
    for (let newPos = currentPos - 1; newPos >= 0; newPos--) {
      let bookmark = pageBookmarks[pageMarks[newPos]];
      for (let i = 0; i < bookmark.length; i++) {
        if (bookmark[i].topicList && bookmark[i].topicList.length > 0) {
          let inter = intersectionWith(bookmark[i].topicList, topics, (a,b) => {
            if (a.value === b) {
              return true;
            }
            return false;
          });
          if (inter.length > 0) {
            //we found a bookmark containing a topic in the topicList
            return `p${(parseInt(pageMarks[newPos], 10) - 1).toString(10)}`;
          }
        }
      }
    }

    //there are no remaining bookmarks with a topic in topics
    return null;
  }
}

/*
  Given the postion (currentPos) in pageMarks of the current pid, find the next
  one. Return the actualPid or null.

  Omit bookmarks that don't have at least one topic found in topics[]. If topics[]
  has no data then no filtering is done.

  args:
    currentPos - position in pageMarks of the current paragraph
    pageMarks - an array of paragraph keys with bookmarks
    pageBookmarks - bookmarks found on the page
    topics - an array of topics by which to filter bookmarks
*/
function getNextPid(currentPos, pageMarks, pageBookmarks, topics) {

  //there is "no" next bookmark
  if ((currentPos + 1) === pageMarks.length) {
    return null;
  }

  //no filtering
  if (topics.length === 0) {
    return `p${(parseInt(pageMarks[currentPos + 1], 10) - 1).toString(10)}`;
  }
  else {
    //topic filtering - look through all previous paragraphs for the first one
    //containing an annotation found in topics[]
    for (let newPos = currentPos + 1; newPos < pageMarks.length; newPos++) {
      let bookmark = pageBookmarks[pageMarks[newPos]];
      for (let i = 0; i < bookmark.length; i++) {
        if (bookmark[i].topicList && bookmark[i].topicList.length > 0) {
          let inter = intersectionWith(bookmark[i].topicList, topics, (a,b) => {
            if (a.value === b) {
              return true;
            }
            return false;
          });
          if (inter.length > 0) {
            //we found a bookmark containing a topic in the topicList
            return `p${(parseInt(pageMarks[newPos], 10) - 1).toString(10)}`;
          }
        }
      }
    }

    //there are no remaining bookmarks with a topic in topics
    return null;
  }
}

/*
  args: pageKey - identifies the current page
        pid - paragraph id
        allBookmarks - an array of all bookmarks
        bmModal - contains topics for filtering
        whoCalled - when the function is called by a click handler the value is
                    either "previous" or "next". When "previous", a new value
                    for previous bookmark needs to be determind, ditto for "next"

  Note: the value of pid is the actual paragraph id and not the key which is pid + 1.
  Bookmark info is stored according to key so we increment the pid to access the data
*/
function getCurrentBookmark(pageKey, actualPid, allBookmarks, bmModal, whoCalled) {
  let pidKey;
  let topics = [];
  let filterTopics;

  if (bmModal["modal"].filter) {
    topics = bmModal["modal"].topics;
    filterTopics = generateHorizontalList(bmModal["modal"].fullTopic);
  }

  //convert pid to key in bookmark array
  pidKey = (parseInt(actualPid.substr(1), 10) + 1).toString(10);

  let paragraphBookmarks = allBookmarks[pageKey][pidKey];

  //the current bookmark (actualPid) does not exist
  //this would happen where url includes ?bkmk=p3 and p3 does not have a bookmark
  if (!paragraphBookmarks) {
    return false;
  }

  let html = generateBookmark(actualPid, paragraphBookmarks, topics);

  if (filterTopics) {
    $("#filter-topics-section").removeClass("hide");
    $(".bookmark-navigator-filter").html(filterTopics);
  }
  else {
    $("#filter-topics-section").addClass("hide");
  }

  $(".bookmark-navigator-header-book").text($("#book-title").text());
  $("#bookmark-content").html(html);

  //get links to next and previous bookmarks on the page
  let pageMarks = Object.keys(allBookmarks[pageKey]);
  let pos = pageMarks.indexOf(pidKey);

  //if topic filtering is enabled
  let prevActualPid;
  let nextActualPid;

  prevActualPid = getPreviousPid(pos, pageMarks, allBookmarks[pageKey], topics);
  nextActualPid = getNextPid(pos, pageMarks, allBookmarks[pageKey], topics);
  $(".bookmark-navigator .current-bookmark").attr("data-pid", `${actualPid}`);

  //console.log("prev: %s, next: %s", prevActualPid, nextActualPid);

  //set previous to inactive
  getString("action:prev", true).then((resp) => {
    if (!prevActualPid) {
      $(".bookmark-navigator .previous-bookmark").addClass("inactive");
      $(".bookmark-navigator .previous-bookmark").html(`<i class='up arrow icon'></i>${resp}`);
    }
    else {
      //add data-pid attribute to link for previous bkmk
      $(".bookmark-navigator .previous-bookmark").attr("data-pid", prevActualPid);
      $(".bookmark-navigator .previous-bookmark").removeClass("inactive");
      $(".bookmark-navigator .previous-bookmark").html(`<i class="up arrow icon"></i> ${resp} (${prevActualPid})`);
    }
  });

  getString("action:next", true).then((resp) => {
    if (!nextActualPid) {
      $(".bookmark-navigator .next-bookmark").addClass("inactive");
      $(".bookmark-navigator .next-bookmark").html(`<i class='down arrow icon'></i> ${resp}`);
    }
    else {
      //add data-pid attribute to link for next bkmk
      $(".bookmark-navigator .next-bookmark").attr("data-pid", nextActualPid);
      $(".bookmark-navigator .next-bookmark").removeClass("inactive");
      $(".bookmark-navigator .next-bookmark").html(`<i class="down arrow icon"></i> ${resp} (${nextActualPid})`);
    }
  });

  return true;
}

/*
  Setup the bookmark navigator for the page.
  arg: pid - paragraph id.
*/
function bookmarkManager(actualPid) {
  let sourceId = teaching.keyInfo.getSourceId();
  let pageKey = teaching.keyInfo.genPageKey().toString(10);
  let bmList = store.get(teaching.bm_list_store);
  let bmModal = store.get(teaching.bm_modal_store);

  if (bmList) {
    //store globally
    gPageKey = pageKey;

    //get previous and next url's
    getNextPrevUrl(pageKey, bmList, bmModal)
      .then((responses) => {
        //console.log("next/prev urls: ", responses);

        //set prev and next hrefs
        if (responses[0] !== null) {
          $(".bookmark-navigator .previous-page").attr({ "href": responses[0] });
        }
        else {
          $(".bookmark-navigator .previous-page").addClass("inactive").removeAttr("href");
        }
        if (responses[1] !== null) {
          $(".bookmark-navigator .next-page").attr({ "href": responses[1] });
        }
        else {
          $(".bookmark-navigator .next-page").addClass("inactive").removeAttr("href");
        }

        //identify current bookmark in navigator
        //returns false if actualPid does not contain a bookmark
        if (!getCurrentBookmark(pageKey, actualPid, bmList, bmModal, "both")) {
          notify.info(__lang`${"fragment:f1"} ${actualPid} ${"fragment:f2"}`);
          return;
        }

        //init navigator controls
        initClickListeners();

        //indicate bookmark navigator is active by adding class to ./transcript
        $(".transcript").addClass("bookmark-navigator-active");

        //show the navigator and scroll
        $(".bookmark-navigator-wrapper").removeClass("hide-bookmark-navigator");
        setTimeout(scrollIntoView, 250, actualPid, "bookmarkManager");
      })
      .catch((err) => {
        console.error(err);

        if (err === "bookmark not found") {
          notify.info(__lang`${"fragment:f1"} ${actualPid} ${"fragment:f2"}`);
        }
      });
  }
  else {
    console.log(teaching.bm_list_store);
  }
}

/*
  Update previous and next bookmark links on navigator.

  args:
    pid: the actual pid to display
    update: either "previous", or "next" depending on what click handler called the function
*/
function updateNavigator(pid, update) {
  //console.log("updateNavigator, pid: %s, update: %s", pid, update);
  let bmList = store.get(teaching.bm_list_store);
  let bmModal = store.get(teaching.bm_modal_store);
  getCurrentBookmark(gPageKey, pid, bmList, bmModal, update);
}

/*
  An annotation is selected and the user can choose from sharing options. This dialog
  is set up by adding the .selected-annotation class.

  It is cleared here thus removing the share dialog
*/
function clearSelectedAnnotation() {
  let selected = $(".selected-annotation");

  //remove dialog
  if (selected.length > 0) {
    $(".selected-annotation-wrapper > .header").remove();
    selected.unwrap().removeClass("selected-annotation");
    $(".bookmark-selected-text.show").removeClass("show");

    //clear text selection guard applied whey bookmark is edited
    // if .user exists then guard is user initiated and we don't clear it
    let guard = $("div.transcript.ui.disable-selection:not(.user)");
    if (guard.length > 0) {
      console.log("removing selection guard");
      guard.removeClass("disable-selection");
    }
  }
}

function scrollComplete(message, type) {
  console.log(`${message}: ${type}`);
}

function scrollIntoView(id, caller) {
  scroll(document.getElementById(id), {align: {top: 0.2}}, (type) => {
    scrollComplete(`scroll from bookmark navigator ${caller}(${id})`, type);
  });
}

/*
  Click handler for FB and email share dialog. This can be called from this
  module when the bookmark navigator is active or from annotate.js when
  the share button is clicked from the annotation edit dialog.
*/
export function initShareDialog(source) {

  if (shareEventListenerCreated) {
    return;
  }

  //console.log("initShareDialog(%s)", source);

  //share icon click handler
  $(".transcript").on("click", ".selected-annotation-wrapper .share-annotation", function(e) {
    e.preventDefault();
    let annotation = $(".selected-annotation-wrapper mark.show");
    let userInfo;
    let pid, aid, text;

    if ($(this).hasClass("close")) {
      clearSelectedAnnotation();
      return;
    }

    userInfo = getUserInfo();
    if (!userInfo) {
      notify.info(getString("annotate:m14"));
      return;
    }

    let url = $(".selected-annotation-wrapper i[data-clipboard-text]").attr("data-clipboard-text");

    //check for intermittent error in url
    let pos = url.indexOf("undefined");

    let channel;
    if ($(this).hasClass("facebook")) {
      channel = "facebook";
    }
    else if ($(this).hasClass("envelope")) {
      channel = "email";
    }
    else if ($(this).hasClass("linkify")) {
      if (pos > -1) {
        //Houston, we've got a problem
        notify.error(getString("error:e5"));
        return;
      }

      //work is already done
      channel = "clipboard";
      return;
    }

    pid = $(".selected-annotation-wrapper p").attr("id");

    //no highlighted text so grab the whole paragraph
    if (annotation.length === 0) {
      text = $(`#${pid}`).text().replace(/\n/," ");
    }
    else {
      text = annotation.text().replace(/\n/," ");
    }

    let srcTitle = $("#src-title").text();
    let bookTitle = $("#book-title").text();
    let citation = `~ ${srcTitle}: ${bookTitle}`;

    if (channel === "facebook") {
      if (pos > -1) {
        //Houston, we've got a problem
        notify.error(getString("error:e5"));
        return;
      }

      let options = {
        method: "share",
        hashtag: "#christmind",
        quote: `${text}\n${citation}`,
        href: url
      };
      FB.ui(options, function(){});
    }
    else if (channel === "email") {
      if (pos > -1) {
        //Houston, we've got a problem
        notify.error(getString("error:e5"));
        return;
      }
      shareByEmail(text, citation, url);
    }
  });

  shareEventListenerCreated = true;
}

function initClickListeners() {
  //previous bookmark
  $(".bookmark-navigator .previous-bookmark").on("click", function(e) {
    e.preventDefault();
    clearSelectedAnnotation();

    let actualPid = $(this).attr("data-pid");
    scroll(document.getElementById(actualPid), {align: {top: 0.2}}, (type) => {
      scrollComplete(`bookmark navigator previous-bookmark(${actualPid})`, type);
    });
    updateNavigator(actualPid, "previous");
  });

  $(".bookmark-navigator .next-bookmark").on("click", function(e) {
    e.preventDefault();
    clearSelectedAnnotation();

    let actualPid = $(this).attr("data-pid");
    scroll(document.getElementById(actualPid), {align: {top: 0.2}}, (type) => {
      scrollComplete(`bookmark navigator next-bookmark(${actualPid})`, type);
    });
    updateNavigator(actualPid, "next");
  });

  $(".bookmark-navigator .current-bookmark").on("click", function(e) {
    e.preventDefault();

    let actualPid = $(this).attr("data-pid");
    scroll(document.getElementById(actualPid), {align: {top: 0.2}}, (type) => {
      scrollComplete(`bookmark navigator current-bookmark(${actualPid})`, type);
    });
  });

  $(".bookmark-navigator .close-window").on("click", function(e) {
    e.preventDefault();
    clearSelectedAnnotation();

    $(".bookmark-navigator-wrapper").addClass("hide-bookmark-navigator");
    $(".transcript").removeClass("bookmark-navigator-active");
  });

  //highlights an annotation by wrapping it in a segment
  $(".bookmark-navigator").on("click", ".annotation-item", function(e) {
    e.preventDefault();
    clearSelectedAnnotation();

    let userInfo = getUserInfo();
    if (!userInfo) {
      userInfo = {userId: "xxx"};
    }

    //this is the annotation-id on the bookmark in the navigator
    let annotation_id = $(this).attr("data-aid");
    let aid;

    let dataRange = $(this).attr("data-range");
    let rangeArray = dataRange.split("/");

    let pid = rangeArray[0];

    //get the aid from the highlight if it exists, won't exist for note level bookmark
    if (annotation_id !== "undefined") {
      aid = $(`[data-annotation-id='${annotation_id}']`).attr("data-aid");
      $(`[data-annotation-id="${aid}"]`).addClass("show");
    }
    else {
      //this is a note level bookmark, get aid from the pid
      aid = $(`#${pid} > span.pnum`).attr("data-aid");
    }

    let url = `https://${location.hostname}${location.pathname}?as=${pid}:${aid}:${userInfo.userId}`;

    let numericRange = rangeArray.map((r) => parseInt(r.substr(1),10));
    let annotationRange = range(numericRange[0], numericRange[1] + 1);
    let header;

    if (userInfo.userId === "xxx") {
      header = `
        <h4 class="ui header">
          <i title="${getString("annotate:m11")}" class="red window close outline small icon"></i>
          <div class="content">
            ${$(this).text()}
          </div>
        </h4>
      `;
    }
    else {
      header = __lang`
        <h4 class="ui header">
          <i title="${"action:fbshare"}" class="share-annotation facebook small icon"></i>
          <i title="${"action:emailshare"}" class="share-annotation envelope outline small icon"></i>
          <i data-clipboard-text="${url}" title="${"action:cp2clip"}" class="share-annotation linkify small icon"></i>
          <div class="content">
            ${$(this).text()}
          </div>
        </h4>
      `;
    }

    for (let i = 0; i < annotationRange.length; i++) {
      $(`#p${annotationRange[i]}`).addClass("selected-annotation");
    }

    $(".selected-annotation").wrapAll("<div class='selected-annotation-wrapper ui raised segment'></div>");
    $(".selected-annotation-wrapper").prepend(header);

    if (userInfo.userId !== "xxx") {
      clipboard.register(".share-annotation.linkify");
    }
  });

  //init click events for FB and email sharing
  initShareDialog("bookmark/navigator.js");
}


/*
  User clicked a bookmark link in the bookmark list modal.

  Initialize the bookmark navigator so they can follow the list of bookmarks
*/
export function initNavigator(actualPid, constants) {
  teaching = constants;
  bookmarkManager(actualPid);
}
