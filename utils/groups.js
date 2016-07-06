(function() {
  var self = {
    init: function() {
      console.debug("groups: init");

      self._initSelf();
      self._initGroups();
    },

    _id: "groups",
    _togglerPrefix: "groups_",
    _queryAttributeName: "data-groups",
    _attributeSplitter: " ",
    _attributeName: "groups",
    _hierarchySplitter: "__",
    _toggleShortcut: "keydown.ctrl_h",
    _invertShortcut: "keydown.ctrl_i",

    _initSelf: function() {
      console.debug("groups: _initSelf");

      $("body").append($("<div>", {id:self._id}));

      $(document).bind(self._toggleShortcut, function() {
        $("#" + self._id).toggle();
        return false;
      });

      $(document).bind(self._invertShortcut, function() {
        $("#" + self._id).toggleClass("invert");
        return false;
      });
    },

    _initGroups: function() {
      console.debug("groups: _initGroups");

      self._render(
        self._determineHierarchy(
          self._determineGroups()));
    },

    _determineHierarchy: function(groups) {
      return _.groupBy(
        groups,
        function(group) {
          var allGroups = group.split(self._hierarchySplitter);
          return (allGroups.length === 1 ?
                  "root" :
                  allGroups[0]);
        });
    },

    _determineGroups: function() {
      return _.uniq(
        _.mapcat(
          $("[" + self._queryAttributeName + "]"),
          function(element) {
            return element.dataset[self._attributeName]
              .split(self._attributeSplitter);
          }));
    },

    _render: function(allGroups) {
      var renderer = function(groups) {
        var output = "";

        output += "<ul>";
        $(groups).each(function(x, group) {
          var id = group;
          var idParts = id.split(self._hierarchySplitter);
          var name = (idParts.length === 1 ? id : idParts[1]);

          output += "<li class='" + self._togglerPrefix + id + " active' >";
          output += "<a href='javascript:groups._toggle(\"" + id + "\");'>" + name + "</a>";
          if(allGroups[name]) {
            output += renderer(allGroups[name]);
          }
          output += "</li>";
        });
        output += "</ul>";
        return output;
      };

      $("#" + self._id).append(renderer(allGroups.root));
    },

    // TODO: Handle conflict toggle!
    _toggle: function(group) {
      console.debug("groups: _toggle", group);

      $("[" + self._queryAttributeName + "~=" + group + "]").toggle();
      $("." + self._togglerPrefix + group).toggleClass("active");
    }};

  self.init();
  groups = self;})();
