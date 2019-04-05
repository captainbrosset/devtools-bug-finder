"use strict";

let TOOL = "inspector";
let components = COMPONENT_MAPPING[TOOL].components;

for (const [key, value] of new URL(document.location).searchParams.entries()) {
  if (key === "tool" && COMPONENT_MAPPING[value]) {
    TOOL = value;
    components = COMPONENT_MAPPING[value].components;
  }
}

const pageTitle = `${TOOL} bug triage dashboard`;

document.querySelector("h1").textContent = pageTitle;
document.title = pageTitle;

const bugzilla = bz.createClient({url: "https://bugzilla.mozilla.org/bzapi"});

function searchForUntriagedBugs(cb) {
  const options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "ASSIGNED", "REOPENED", "UNCONFIRMED"],
    "include_fields": ["id", "summary", "assigned_to", "attachments"],
    "priority": ["--"],
    "type": ["defect", "task"]
  };

  bugzilla.searchBugs(options, (_, untriagedList) => cb(untriagedList));
}

function searchForP1s(cb) {
  const options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "ASSIGNED", "REOPENED", "UNCONFIRMED"],
    "include_fields": ["id", "summary", "assigned_to", "whiteboard",
                       "last_change_time", "attachments"],
    "priority": ["P1"],
    "type": ["defect", "task"]
  };

  bugzilla.searchBugs(options, (_, p1List) => cb(p1List));
}

function searchForInspectorDTQBugs(cb) {
  const options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "ASSIGNED", "REOPENED"],
    "include_fields": ["id", "summary", "assigned_to", "priority", "whiteboard",
                       "attachments"],
    "whiteboard": ["[dt-q"]
  };

  bugzilla.searchBugs(options, (_, dtqList) => cb(dtqList));
}

function searchForTopBugs(cb) {
  // The inspector/style-editor/rdm team started using a new whiteboard for tracking top
  // quality bugs: [dt-q]. So if tool is inspector, let's look for that instead.
  if (TOOL === "inspector") {
    searchForInspectorDTQBugs(cb);
  } else {
    bugzilla.getBug(`top-${TOOL}-bugs`, (_, bug) => {
      if (!bug) {
        cb([]);
      }

      const options = {
        "product": "DevTools",
        "component": components,
        "bug_status": ["NEW", "ASSIGNED", "REOPENED"],
        "include_fields": ["id", "summary", "assigned_to", "attachments"],
        "id": bug.depends_on
      };

      bugzilla.searchBugs(options, (_, topList) => cb(topList));
    });
  }
}

function searchForTopIntermittents(cb) {
  const options = {
    "product": "DevTools",
    "component": components,
    "bug_status": ["NEW", "REOPENED"],
    "include_fields": ["id", "summary", "assigned_to", "whiteboard"],
    "whiteboard": ["[stockwell needswork]"],
    "keywords": ["intermittent-failure"]
  };

  bugzilla.searchBugs(options, (_, intermittentList) => cb(intermittentList));
}

function createBug(bug) {
  const el = createNode({
    tagName: "li",
    attributes: {
      "class": "bug separated",
      "data-id": bug.id
    }
  });

  const titleContainer = createNode({
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

  const isPatch = a => a.is_patch || a.content_type == "text/x-phabricator-request";

  if (bug.attachments && bug.attachments.some(isPatch)) {
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
  const list = el.querySelector("ul");
  const header = el.querySelector("h2");

  list.classList.remove("loading");

  if (!bugs.length) {
    list.appendChild(createBug({
      summary: "No bugs found"
    }));
  } else {
    header.textContent += ` (${bugs.length} bugs)`;
  }

  bugs.forEach(bug => list.appendChild(createBug(bug)));
}

searchForUntriagedBugs(bugs => {
  const el = document.querySelector(".untriaged");
  createBugs(bugs, el);
});

searchForP1s(bugs => {
  const el = document.querySelector(".P1s");
  createBugs(bugs, el);
});

searchForTopBugs(bugs => {
  const el = document.querySelector(".top-bugs");
  createBugs(bugs, el);
});

searchForTopIntermittents(bugs => {
  const el = document.querySelector(".intermittents");
  createBugs(bugs, el);
});
