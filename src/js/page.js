/* eslint no-console: off */
import {storeInit} from "./modules/_util/store";

//common modules
import auth from "./modules/_user/netlify";
import {initStickyMenu, initAnimation} from "./modules/_page/startup";

import {bookmarkStart} from "./modules/_bookmark/start";
import search from "./modules/_search/search";
import toc from "./modules/_contents/toc";
import about from "./modules/_about/about";
import subscribe from "./modules/_forms/subscribe";

import {setLanguage} from "./modules/_language/lang";
import constants from "./constants";

$(() => {
  storeInit(constants);
  initStickyMenu();
  setLanguage(constants);

  bookmarkStart("page");
  search.initialize();
  auth.initialize();
  toc.initialize("page");
  about.initialize();

  //init subscribe form in footer
  subscribe.initialize();

  initAnimation(".card > a");
});
