"use strict";

// Name of devtools mozilla staff.
var STAFF = [
  "pbrosset", "vporof", "jlong", "poirot.alex", "bgrinstead", "nfitzgerald", "jdescottes",
  "odvarko", "clarkbw", "jlaster", "gl", "lclark", "mratcliffe", "gtatum", "jwalker",
  "past", "paul", "dcamp", "jimb", "dtownsend", "yzenevich", "erahm", "kumar.mcmillan",
  "npang", "amarchesini", "dbaron", "bzbarsky", "winter2718", "terrence", "mvonbriesen",
  "bkelly", "matt.woodrow", "fscholz", "efaustbmo", "ydelendik", "francesco.lodolo",
  "jyeh", "philipp", "schung", "evan", "lgreco", "gkrizsanits", "birtles", "myk",
  "pascalc", "mats", "gbrown", "mstriemer", "sole", "padenot", "aryx.bugmail",
  "nchevobbe", "dakatsuka", "jwatt", "rhelmer", "mrbkap", "mstange", "bhsu", "ckerschb",
  "ystartsev", "dwalsh", "jteh", "emilio", "dao+bmo", "standard8", "jaws", "mconley",
  "kmag", "mantaroh", "rcaliman", "davidwalsh83", "bbirtles", "nicolas.b.pierron",
  "bhackett1024", "mcroud", "balbeza", "bwerth", "ogasidlo", "mgoodwin", "spenades",
  "mtigley", "canaltinova"
];

// URL prefix to open a bug in bugzilla.
var BUG_URL = "https://bugzilla.mozilla.org/show_bug.cgi?id=";

// URL prefix to open a bug list.
var BUG_LIST_URL = "https://bugzilla.mozilla.org/buglist.cgi?bug_id=";

// URL prefix to open a bugzilla profile.
var PROFILE_URL = "https://bugzilla.mozilla.org/user_profile?login=";

var ATTACHMENT_URL = "https://bugzilla.mozilla.org/attachment.cgi?id=";

// Whiteboard flag for good first bugs.
var GOOD_FIRST_BUG_KEYWORD = "good-first-bug";

// How many days do we wait until considering an assigned bug as unassigned.
var INACTIVE_AFTER = 25;
