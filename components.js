"use strict";

var COMPONENT_MAPPING = {
  "inspector": {
    label: "Inspector",
    components: ["Inspector",
                 "Inspector: Animations",
                 "Inspector: Changes",
                 "Inspector: Computed",
                 "Inspector: Fonts",
                 "Inspector: Layout",
                 "Inspector: Rules",
                 "Style Editor",
                 "Responsive Design Mode"]
  },
  "console": {
    label: "Web Console",
    components: ["Console"]
  },
  "debugger": {
    label: "JS Debugger",
    components: ["Debugger"]
  },
  "network": {
    label: "Network Monitor",
    components: ["Netmonitor"]
  },
  "perf": {
    label: "Performance Tools",
    components: ["Memory",
                 "Performance Tools (Profiler/Timeline)"]
  },
  "jsonviewer": {
    label: "JSON Viewer",
    components: ["JSON Viewer"]
  },
  "storage": {
    label: "Storage Inspector",
    components: ["Storage Inspector"]
  },
  "dom": {
    label: "DOM Panel",
    components: ["DOM"]
  },
  "responsive": {
    label: "Responsive Mode",
    components: ["Responsive Design Mode"]
  },
  "aboutdebugging": {
    label: "about:debugging",
    components: ["about:debugging"]
  },
  "scratchpad": {
    label: "Scratchpad",
    components: ["Scratchpad"]
  },
  "audio": {
    label: "Web Audio Editor",
    components: ["Web Audio Editor"]
  },
  "canvas": {
    label: "Canvas & WebGL",
    components: ["Canvas Debugger",
                 "WebGL Shader Editor"]
  },
  "webide": {
    label: "WebIDE",
    components: ["WebIDE"]
  },
  "main": {
    label: "Shared, Framework, Untriaged",
    components: ["General",
                 "Framework",
                 "Object Inspector",
                 "Source Editor",
                 "Shared Components"]
  },
};

/**
 * Get a list of bugzilla component names given a list of COMPONENT_MAPPING
 * keys.
 * @param {Array} keys A list of keys as found in the COMPONENT_MAPPING object.
 * If instead of an array, the special string "all" is passed, then all
 * components are returned.
 * @return {Array} A list of bugzilla component names for these keys.
 */
function getBugzillaComponents(keys) {
  if (!keys) {
    return [];
  }

  if (keys === "all") {
    keys = Object.keys(COMPONENT_MAPPING);
  }

  var components = [];
  for (var i = 0; i < keys.length; i++) {
    var component = COMPONENT_MAPPING[keys[i]];
    if (component) {
      components = components.concat(component.components);
    }
  }
  return components;
}
