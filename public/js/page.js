/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"page": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/public/js";
/******/
/******/ 	var jsonpArray = window["webpackJsonp"] = window["webpackJsonp"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([2,"vendors~page~profile~transcript","page~profile~transcript"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/js/modules/_forms/subscribe.js":
/*!********************************************!*\
  !*** ./src/js/modules/_forms/subscribe.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var toastr__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! toastr */ "./node_modules/toastr/toastr.js");
/* harmony import */ var toastr__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(toastr__WEBPACK_IMPORTED_MODULE_0__);
/*
  Set up submit handler for contact forms
*/


function createSubmitHandler($form) {
  //submit handler
  $form.submit(function (e) {
    e.preventDefault(); //console.log("submit pressed");

    let $form = $(this);
    let formData = $form.form("get values");
    let validationError = false; //form validation

    if (formData.name.trim().length === 0) {
      toastr__WEBPACK_IMPORTED_MODULE_0___default.a.warning("Please enter your name.");
      validationError = true;
    }

    if (formData.email.trim().length === 0) {
      toastr__WEBPACK_IMPORTED_MODULE_0___default.a.warning("Please enter your email address.");
      validationError = true;
    }

    if (validationError) {
      return false;
    } //disable submit button


    $("[name='cmi-subscribe'] > button").addClass("disabled"); //send to netlify

    $.post($form.attr("action"), $form.serialize()).done(function () {
      toastr__WEBPACK_IMPORTED_MODULE_0___default.a.success("Success!");
      $form.form("clear");
      $("[name='cmi-subscribe'] > button").removeClass("disabled");
    }).fail(function () {
      toastr__WEBPACK_IMPORTED_MODULE_0___default.a.error("Sorry, there was a failure to communicate!");
      $("[name='cmi-subscribe'] > button").removeClass("disabled");
    });
  });
}

/* harmony default export */ __webpack_exports__["default"] = ({
  initialize: function () {
    let $form = $(".subscribe.form");

    if ($form.length > 0) {
      createSubmitHandler($form);
    }
  }
});

/***/ }),

/***/ "./src/js/page.js":
/*!************************!*\
  !*** ./src/js/page.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_util_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/_util/store */ "./src/js/modules/_util/store.js");
/* harmony import */ var _modules_user_netlify__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/_user/netlify */ "./src/js/modules/_user/netlify.js");
/* harmony import */ var _modules_page_startup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/_page/startup */ "./src/js/modules/_page/startup.js");
/* harmony import */ var _modules_bookmark_start__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./modules/_bookmark/start */ "./src/js/modules/_bookmark/start.js");
/* harmony import */ var _modules_search_search__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modules/_search/search */ "./src/js/modules/_search/search.js");
/* harmony import */ var _modules_contents_toc__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./modules/_contents/toc */ "./src/js/modules/_contents/toc.js");
/* harmony import */ var _modules_about_about__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./modules/_about/about */ "./src/js/modules/_about/about.js");
/* harmony import */ var _modules_forms_subscribe__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./modules/_forms/subscribe */ "./src/js/modules/_forms/subscribe.js");
/* harmony import */ var _modules_language_lang__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./modules/_language/lang */ "./src/js/modules/_language/lang.js");
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./constants */ "./src/js/constants.js");
/* eslint no-console: off */
 //import "../vendor/semantic/semantic.min.js";
//import "../../public/vendor/semantic/semantic.js";
//common modules










$(() => {
  Object(_modules_util_store__WEBPACK_IMPORTED_MODULE_0__["storeInit"])(_constants__WEBPACK_IMPORTED_MODULE_9__["default"]);
  Object(_modules_page_startup__WEBPACK_IMPORTED_MODULE_2__["initStickyMenu"])();
  Object(_modules_language_lang__WEBPACK_IMPORTED_MODULE_8__["setLanguage"])(_constants__WEBPACK_IMPORTED_MODULE_9__["default"]);
  Object(_modules_bookmark_start__WEBPACK_IMPORTED_MODULE_3__["bookmarkStart"])("page");
  _modules_search_search__WEBPACK_IMPORTED_MODULE_4__["default"].initialize();
  _modules_user_netlify__WEBPACK_IMPORTED_MODULE_1__["default"].initialize();
  _modules_contents_toc__WEBPACK_IMPORTED_MODULE_5__["default"].initialize("page");
  _modules_about_about__WEBPACK_IMPORTED_MODULE_6__["default"].initialize(); //init subscribe form in footer

  _modules_forms_subscribe__WEBPACK_IMPORTED_MODULE_7__["default"].initialize();
  Object(_modules_page_startup__WEBPACK_IMPORTED_MODULE_2__["initAnimation"])(".card > a");
});

/***/ }),

/***/ 2:
/*!******************************!*\
  !*** multi ./src/js/page.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/js/page.js */"./src/js/page.js");


/***/ })

/******/ });
//# sourceMappingURL=page.js.map