"use strict";

let tool = "inspector";
let components = COMPONENT_MAPPING[tool].components;

for (let [key, value] of new URL(document.location).searchParams.entries()) {
  if (key === "tool" && COMPONENT_MAPPING[value]) {
    tool = value;
    components = COMPONENT_MAPPING[value].components;
  }
}

const pageTitle = `${tool} bug triage dashboard`;
document.querySelector("h1").textContent = pageTitle;
document.title = pageTitle;

var bugzilla = bz.createClient({url: "https://bugzilla.mozilla.org/bzapi"});

function searchForUntriagedBugs(cb) {
  var options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "ASSIGNED", "REOPENED", "UNCONFIRMED"],
    "include_fields": ["id", "summary", "assigned_to"],
    "priority": ["--"]
  };

  bugzilla.searchBugs(options, function(_, untriagedList) {
    searchForBugsBackForReTriage(function(backForTriageList) {
      cb(untriagedList.concat(backForTriageList));
    });
  });
}

function searchForBugsBackForReTriage(cb) {
  var options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "ASSIGNED", "REOPENED", "UNCONFIRMED"],
    "include_fields": ["id", "summary"],
    "whiteboard": "inspector-triage"
  };

  bugzilla.searchBugs(options, function(_, list) {
    cb(list);
  });
}

function searchForP1s(cb) {
  var options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "ASSIGNED", "REOPENED", "UNCONFIRMED"],
    "include_fields": ["id", "summary", "assigned_to", "whiteboard", "severity",
                       "last_change_time", "attachments"],
    "priority": ["P1"]
  };

  bugzilla.searchBugs(options, function(_, list) {
    // Filter out devtools.html bugs and enhancements
    cb(list.filter(function(bug) {
      return !bug.whiteboard.includes("devtools-html") &&
             bug.severity !== "enhancement";
    }));
  });
}

function searchForTopBugs(cb) {
  bugzilla.getBug(`top-${tool}-bugs`, function(_, bug) {
    var options = {
      "product": "DevTools",
      "component": components,
      "bug_status": ["NEW", "REOPENED"],
      "include_fields": ["id", "summary", "assigned_to"],
      "id": bug.depends_on
    };

    bugzilla.searchBugs(options, function(_, list) {
      cb(list);
    });
  });
}

function searchForTopIntermittents(cb) {
  var options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "REOPENED"],
    "include_fields": ["id", "summary", "priority", "assigned_to"],
    "priority": ["P1", "P2"],
    "keywords": ["intermittent-failure"]
  };

  bugzilla.searchBugs(options, function(_, list) {
    cb(list);
  });
}

function createBug(bug) {
  var el = createNode({
    tagName: "li",
    attributes: {
      "class": "bug separated",
      "data-id": bug.id
    }
  });

  var titleContainer = createNode({
    attributes: {"class": "bug-link"}
  });
  el.appendChild(titleContainer);

  if (bug.priority) {
    titleContainer.appendChild(createNode({
      tagName: "span",
      textContent: bug.priority,
      attributes: {
        "class": "priority"
      }
    }));
  }

  if (bug.assigned_to && bug.assigned_to.name !== "nobody") {
    titleContainer.appendChild(createNode({
      tagName: "span",
      textContent: bug.assigned_to.name,
      attributes: {
        "class": "assignee"
      }
    }));
  }

  titleContainer.appendChild(createNode({
    tagName: "a",
    textContent: bug.summary,
    attributes: {
      href: bug.id ? BUG_URL + bug.id : "#",
      target: bug.id ? "_blank" : ""
    }
  }));

  if (bug.id) {
    titleContainer.appendChild(createNode({
      tagName: "a",
      textContent: "#" + bug.id,
      attributes: {
        "class": "bug-number",
        "href": BUG_URL + bug.id,
        "target": "_blank"
      }
    }));
  }

  if (bug.attachments && bug.attachments.some(
      a => a.is_patch || a.content_type == "text/x-review-board-request")) {
    el.appendChild(createNode({
      attributes: {
        "class": "tag has-patch",
        "title": "This bug has a patch already attached"
      },
      textContent: "Patch Submitted"
    }));
  }

  if (bug.last_change_time && isInactive(bug)) {
    el.appendChild(createNode({
      attributes: {
        "class": "tag old-bug",
        "title": `This bug has been inactive for more than ${INACTIVE_AFTER} days`
      },
      textContent: "Inactive"
    }));
  }

  return el;
}

function createBugs(bugs, el) {
  let list = el.querySelector("ul");
  let header = el.querySelector("h2");

  list.classList.remove("loading");

  if (!bugs.length) {
    list.appendChild(createBug({
      summary: "No bugs found"
    }));
  } else {
    header.textContent += ` (${bugs.length} bugs)`;
  }

  bugs.forEach(function(bug) {
    list.appendChild(createBug(bug));
  });
}

searchForUntriagedBugs(function(bugs) {
  var el = document.querySelector(".untriaged");
  createBugs(bugs, el);
});

searchForP1s(function(bugs) {
  var el = document.querySelector(".P1s");
  createBugs(bugs, el);
});

searchForTopBugs(function(bugs) {
  var el = document.querySelector(".top-bugs");
  createBugs(bugs, el);
});

searchForTopIntermittents(function(bugs) {
  var el = document.querySelector(".intermittents");
  createBugs(bugs, el);
});
