(function() {
  var self = {
    init: function() {
      console.debug("groups: init");

      self._initSelf();
      self._initGroups();
      self._applyPersistState();
    },

    _id: "groups",
    _prefix: "groups_",
    _queryAttributeName: "data-groups",
    _queryAttributeTogglerName: "data-group",
    _attributeSplitter: " ",
    _attributeName: "groups",
    _attributeTogglerName: "group",
    _hierarchySplitter: "__",
    _toggleShortcut: "keydown.ctrl_h",
    _invertShortcut: "keydown.ctrl_i",

    _initSelf: function() {
      console.debug("groups: _initSelf");

      $("body").append($("<div>", {id:self._id}));

      $(document).bind(self._toggleShortcut, function() {
        $("#" + self._id).toggle();
        self._updatePersistState({"self-hidden": $("#" + self._id).is(":hidden")})
        return false;
      });

      $(document).bind(self._invertShortcut, function() {
        $("#" + self._id).toggleClass("invert");
        self._updatePersistState({"self-invert": $("#" + self._id).hasClass("invert")})
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

          output += "<li class='" + self._prefix + id + " active' >";
          output += "<a " + self._queryAttributeTogglerName + "=\"" + id + "\" href='javascript:groups._toggle(\"" + id + "\");'>" + name + "</a>";
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
    _toggle: function(group, state) {
      console.debug("groups: _toggle", group);

      var persistState = {"groups-hidden":{}};
      state = (state == undefined ?
               $("." + self._prefix + group).hasClass("active") :
               state);

      if(state){$("[" + self._queryAttributeName + "~=" + group + "]").hide();}
      else{$("[" + self._queryAttributeName + "~=" + group + "]").show();}
      $("." + self._prefix + group).toggleClass("active", !state);

      persistState["groups-hidden"][group] = state;
      self._updatePersistState(persistState);

      $("." + self._prefix + group + "> ul > li > a") .each(function() {
        self._toggle(this.dataset[self._attributeTogglerName], state);
      });
    },

    _applyPersistState: function() {
      console.debug("groups: _applyPersistState");

      var state = Cookies.getJSON(self._id) || {};
      if(state["self-hidden"]){$("#" + self._id).hide();}
      $("#" + self._id).toggleClass("invert", state["self-invert"]);

      var groupsHidden = state["groups-hidden"];
      for(var group in groupsHidden) {
        self._toggle(group, groupsHidden[group]);
      }
    },

    _updatePersistState: function(state) {
      console.debug("groups: _updatePersistState");

      Cookies.set(
        self._id,
        $.extend(
          true,
          (Cookies.getJSON(self._id) || {}),
          state));
    }};

  self.init();
  groups = self;})();
