define('flockn/assets', ["exports", "module"], function (exports, module) {
  "use strict";

  var Assets = {};

  module.exports = Assets;
});

define('flockn/audio', ["exports", "module"], function (exports, module) {
  "use strict";

  var Audio = {};

  Audio.play = function () {};

  module.exports = Audio;
});

define('flockn/base', ['exports', 'module', 'eventmap', 'gamebox', './audio', './group', './world'], function (exports, module, _eventmap, _gamebox, _audio, _group, _world) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _EventMap2 = _interopRequire(_eventmap);

  var _Audio = _interopRequire(_audio);

  var _Group = _interopRequire(_group);

  var _World = _interopRequire(_world);

  var objectIndex = 0;

  var prependMax = 10000;

  var numToIdString = function numToIdString(num) {
    var stringNum = num + '';

    if (num >= prependMax) {
      return stringNum;
    } else {
      var prependLength = (prependMax + '').length - stringNum.length;
      for (var i = 0; i < prependLength; i++) {
        stringNum = '0' + stringNum;
      }

      return stringNum;
    }
  };

  var Base = (function (_EventMap) {
    function Base() {
      var type = arguments[0] === undefined ? 'Base' : arguments[0];
      var descriptor = arguments[1] === undefined ? function () {} : arguments[1];

      _classCallCheck(this, Base);

      _EventMap.call(this);

      // Count up `objectIndex` and stringify it
      var currentObject = numToIdString(++objectIndex);

      this.type = type;

      var internalId = '' + this.type + '-' + Date.now() + '-' + currentObject;

      this.name = internalId;

      // The `id` property is read-only and returns the type and the stringified object index
      Object.defineProperty(this, 'id', {
        get: function get() {
          return internalId;
        },
        enumerable: true
      });

      // Save the descriptor
      this.descriptor = descriptor;

      // Create a new group for all children elements
      this.children = new _Group();

      // Add a queue: All addable elements will be pushed into the queue first and called after everything else in
      // the `descriptor` has been called
      this.queue = [];

      this.parent = null;

      // `Input` should be available in instances derived from `Base`
      this.input = _gamebox.Input;

      // As should `Audio`
      this.audio = _Audio;

      // Emit an event
      this.trigger('constructed');
    }

    _inherits(Base, _EventMap);

    Base.prototype.apply = function apply(data) {
      // TODO: Reflect if function check should be enforced here
      if (this.descriptor) {
        // If args is not an array or array-like, provide an empty one
        data = data || {};

        // Call the `descriptor` property with `args`

        debugger;

        // object, {data, World}
        this.descriptor.call(this, this, { data: data, World: _World });

        // Trigger an event
        this.trigger('execute');

        // TODO: Impose an order in the queue, such as:
        // (Game) -> Scene -> GameObject -> Behavior -> Model

        // TODO: Implement z-order
        this.queue.forEach(function (q) {
          q && q();
        });

        // Reset the queue
        this.queue = [];

        // Find a way to directly before and after events
        this.trigger('executed');
      }
    };

    Base.prototype.call = function call() {
      // Call `Base#apply` with the arguments object
      this.apply(arguments);
    };

    // Alias for `Base#call`

    Base.prototype.reset = function reset() {
      return this.call.apply(this, arguments);
    };

    Base.prototype.closest = function closest() {};

    Base.prototype.find = function find() {};

    Base.prototype.log = function log() {
      if (console && console.log) {
        var argArray = [].slice.call(arguments);

        // Log with `console.log`: Prepend the type and name
        argArray.unshift(':');
        argArray.unshift(this.name);
        argArray.unshift(this.type);

        return console.log.apply(console, argArray);
      }
    };

    return Base;
  })(_EventMap2);

  Base.queueOrder = ['Game', 'Scene', 'GameObject', 'Behavior', 'Model'];

  module.exports = Base;
});

define('flockn/behavior', ['exports', 'module', './base', './group', './mixins'], function (exports, module, _base, _group, _mixins) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _Base2 = _interopRequire(_base);

  var _Group = _interopRequire(_group);

  // Behaviors only provide logic. There is no rendering involved.
  // Behaviors can attach any number of behaviors to itself

  var Behavior = (function (_Base) {
    function Behavior(descriptor) {
      _classCallCheck(this, Behavior);

      _Base.call(this, 'Behavior', descriptor);

      // Reference to the game object itself
      this.gameObject = null;

      // Mix in `updateable`
      _mixins.updateable.call(this);
    }

    _inherits(Behavior, _Base);

    Behavior.prototype.addBehavior = function addBehavior() {
      // When a behavior is added, the reference to the game object is set
      this.queue.push(_mixins.addable(Behavior, this.children, function (child) {
        child.gameObject = this.gameObject;
      }).apply(this, arguments));
    };

    Behavior.prototype.removeBehavior = function removeBehavior() {};

    return Behavior;
  })(_Base2);

  _mixins.serializable(Behavior);

  module.exports = Behavior;
});

define('flockn/constants/color', ["exports", "module"], function (exports, module) {
  "use strict";

  var colors = {
    aqua: {
      r: 0,
      g: 255,
      b: 255
    },
    black: {
      r: 0,
      g: 0,
      b: 0
    },
    blue: {
      r: 0,
      g: 0,
      b: 255
    },
    fuchsia: {
      r: 255,
      g: 0,
      b: 255
    },
    gray: {
      r: 128,
      g: 128,
      b: 128
    },
    green: {
      r: 0,
      g: 128,
      b: 0
    },
    lime: {
      r: 0,
      g: 255,
      b: 0
    },
    maroon: {
      r: 128,
      g: 0,
      b: 0
    },
    navy: {
      r: 0,
      g: 0,
      b: 128
    },
    olive: {
      r: 128,
      g: 128,
      b: 0
    },
    purple: {
      r: 128,
      g: 0,
      b: 128
    },
    red: {
      r: 255,
      g: 0,
      b: 0
    },
    silver: {
      r: 192,
      g: 192,
      b: 192
    },
    teal: {
      r: 0,
      g: 128,
      b: 128
    },
    white: {
      r: 255,
      g: 255,
      b: 255
    },
    yellow: {
      r: 255,
      g: 255,
      b: 0
    },
    transparent: {
      r: 0,
      g: 0,
      b: 0,
      a: 0
    }
  };

  module.exports = colors;
});

define('flockn/game', ['exports', 'module', 'gamebox', './base', './graphics', './scene', './types/color', './viewport', './mixins'], function (exports, module, _gamebox, _base, _graphics, _scene, _typesColor, _viewport, _mixins) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _Base2 = _interopRequire(_base);

  var _Graphics = _interopRequire(_graphics);

  var _Scene = _interopRequire(_scene);

  var _Color = _interopRequire(_typesColor);

  var _Viewport = _interopRequire(_viewport);

  var root = window;

  // Game is the entry point for all games made with flockn.
  // Any number of `Scene` instances can be attached to a `Game` instance

  var Game = (function (_Base) {
    function Game(descriptor) {
      var _this = this;

      _classCallCheck(this, Game);

      // Extend the `Base` class
      _Base.call(this, 'Game', descriptor);

      // `this.container` is a string, which is the id of the element.
      // If it's not given, it should create a new element. This should be handled by the renderer.
      this.container = null;

      // By default, the width and height of a `Game` instance will be as large as the inside of the browser window.
      this.width = root.innerWidth;
      this.height = root.innerHeight;
      this.color = new _Color(255, 255, 255);

      this.assetLoader = new _gamebox.AssetLoader();

      // Set the viewport object
      this.viewport = _Viewport;

      // `this.activeScene` is set to `null` by default, but will change to the instance of the scene
      // once a scene will be shown
      this.activeScene = null;

      // Trigger the graphics initializer
      this.on('execute', function () {
        console.log('eX');
        _Graphics.trigger('initialize', _this);
      });

      // A `Game` instance is the root element so the descriptor needs to be called directly,
      // because it won't be added to anywhere else
      this.call();

      // Mix in `renderable` and `updateable`
      _mixins.renderable.call(this);
      _mixins.updateable.call(this);

      // Bind the game loop to the `update` event
      _gamebox.Loop.on('update', function (dt) {
        // Deltatime should not be a millisecond value, but a second one.
        // It should be a value between 0 - 1
        _this.trigger('update', dt / 1000);
      });

      // Bind the game loop to the `render` event
      _gamebox.Loop.on('render', function () {
        _this.trigger('render');
      });

      // Add a `resize` event to each `Game` instance
      root.addEventListener('resize', function () {
        var newWidth = root.innerWidth;
        var newHeight = root.innerHeight;

        _this.trigger('resize', newWidth, newHeight);

        // Trigger resize event for the current scene
        var currentScene = _this.children.byName(_this.activeScene);

        if (currentScene) {
          currentScene.trigger('resize', root.innerWidth, root.innerHeight);
        }
      }, false);

      // Add an `orientationchange` event to each `Game` instance
      root.addEventListener('orientationchange', function () {
        _this.trigger('orientationchange');
      }, false);
    }

    _inherits(Game, _Base);

    Game.prototype.addScene = function addScene() {
      // When adding a scene, the dimension of scenes should be
      // exactly as large as the `Game` instance itself
      this.queue.push(_mixins.addable(_Scene, this.children, function (child) {
        child.width = this.width;
        child.height = this.height;
      }).apply(this, arguments));
    };

    Game.prototype.showScene = function showScene(name) {
      // TODO: Add transitions
      this.children.forEach(function (scene) {
        return scene.visible = false;
      });

      // Set the `activeScene` property
      this.activeScene = this.children.byName(name);
      this.activeScene.visible = true;

      if (this.activeScene) {
        this.activeScene.trigger('resize', root.innerWidth, root.innerHeight);

        // Trigger the `show` event
        this.trigger('show', name, this.children[this.activeScene]);
      }
    };

    Game.prototype.preload = function preload(assets) {
      this.assetLoader.assets = assets;

      return this.assetLoader;
    };

    Game.prototype.run = function run(name) {
      var _this2 = this;

      _Graphics.trigger('add', this);

      this.on('executed', function () {
        // Start the game loop
        _gamebox.Loop.run();

        if (!name) {
          // If there's only no name, take the first scene
          if (_this2.children.length >= 1) {
            name = _this2.children.first().name;
          }
        }

        // Show the scene if a parameter has been specified
        _this2.showScene(name);
      });
    };

    return Game;
  })(_Base2);

  _mixins.serializable(Game);

  module.exports = Game;
});

define('flockn/gameobject', ['exports', 'module', './base', './behavior', './graphics', './group', './model', './serialize', './texture', './types', './mixins'], function (exports, module, _base, _behavior, _graphics, _group, _model, _serialize, _texture, _types, _mixins) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _Base2 = _interopRequire(_base);

  var _Behavior = _interopRequire(_behavior);

  var _Graphics = _interopRequire(_graphics);

  var _Group = _interopRequire(_group);

  var _Model = _interopRequire(_model);

  var _serialize2 = _interopRequire(_serialize);

  var _Texture = _interopRequire(_texture);

  var GameObject = (function (_Base) {
    function GameObject(descriptor) {
      var _this = this;

      _classCallCheck(this, GameObject);

      _Base.call(this, 'GameObject', descriptor);

      this.visible = true;

      this.position = new _types.Vector3();

      this.fitToTexture = true;

      // Create a new texture and bind it to the `texture` property
      this.texture = new _Texture();
      this.texture.parent = this;

      // Once the image is loaded, update width and height if `fitToTexture` is set
      this.texture.on('image-loaded', function () {
        if (_this.fitToTexture) {
          _this.width = _this.texture.image.width;
          _this.height = _this.texture.image.height;

          _this.origin.x = _this.width / 2;
          _this.origin.y = _this.height / 2;
        }

        // TODO: Evaluate if the Graphics trigger should only be in the texture
        _Graphics.trigger('texture-image-loaded', _this, _this.texture);
      });

      // Once the label is loaded, update width and height if `fitToTexture` is set
      this.texture.on('label-loaded', function () {
        if (_this.fitToTexture) {
          _this.width = _this.texture.label.width;
          _this.height = _this.texture.label.height;

          _this.origin.x = _this.width / 2;
          _this.origin.y = _this.height / 2;

          // TODO: Evaluate if the Graphics trigger should only be in the texture
          _Graphics.trigger('texture-label-loaded', _this, _this.texture);
        }
      });

      this.width = 0;
      this.height = 0;

      this.angle = 0;

      this.alpha = 1;

      this.scale = new _types.Vector2(1, 1);

      this.origin = new _types.Vector2(this.width / 2, this.width / 2);

      this.border = {
        width: 0,
        color: new _types.Color(),
        radius: 0
      };

      // Add default model
      var defaultModel = new _Model();
      defaultModel.name = 'default';

      this.addModel(defaultModel);

      // Mix in renderable and updateable
      _mixins.renderable.call(this);
      _mixins.updateable.call(this);
    }

    _inherits(GameObject, _Base);

    GameObject.prototype.bounds = function bounds() {
      // TODO: Also take care of scale
      // TODO: Also take care of rotation
      return new _types.Rect(this.position.x, this.position.y, this.width, this.height);
    };

    GameObject.prototype.addGameObject = function addGameObject() {
      // Add a game object to this game object
      this.queue.push(_mixins.addable(GameObject, this.children).apply(this, arguments));
    };

    GameObject.prototype.addBehavior = function addBehavior() {
      // Add a `Behavior` instance to the the game object and update the `gameObject` property
      this.queue.push(_mixins.addable(_Behavior, this.children, function (child) {
        child.gameObject = this;
      }).apply(this, arguments));
    };

    GameObject.prototype.addModel = function addModel() {
      // Add a `Model` instance to the game object
      this.queue.push(_mixins.addable(_Model, this.children).apply(this, arguments));
    };

    GameObject.prototype.removeGameObject = function removeGameObject() {};

    GameObject.prototype.removeBehavior = function removeBehavior() {};

    GameObject.prototype.removeModel = function removeModel() {};

    GameObject.prototype.data = function data(name) {
      if (!name) {
        return this.models.byName('default');
      } else {
        return this.models.byName(name);
      }
    };

    GameObject.prototype.animate = function animate(property, end, time, callback) {
      // TODO: Tweening does not work yet
      if (typeof this[property] === 'number') {
        var distance = end - this[property];
        var timeInS = time / 1000;

        var animateName = 'animate-' + Date.now();
        this.on(animateName, function (dt) {

          this.off(animateName);
        });
      }
    };

    GameObject.fromString = function fromString() {};

    _createClass(GameObject, [{
      key: 'left',
      get: function () {
        return this.position.x;
      },
      set: function (value) {
        this.position.x = value;
      }
    }, {
      key: 'top',
      get: function () {
        return this.position.y;
      },
      set: function (value) {
        this.position.y = value;
      }
    }, {
      key: 'right',
      get: function () {
        return this.parent.width - this.width - this.position.x;
      },
      set: function (value) {
        this.position.x = this.parent.width - this.width - value;
      }
    }, {
      key: 'bottom',
      get: function () {
        return this.parent.height - this.height - this.position.y;
      },
      set: function (value) {
        this.position.y = this.parent.height - this.height - value;
      }
    }]);

    return GameObject;
  })(_Base2);

  _mixins.serializable(GameObject);

  module.exports = GameObject;
});

define('flockn/graphics', ['exports', 'module', 'eventmap'], function (exports, module, _eventmap) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _EventMap = _interopRequire(_eventmap);

  // `Graphics` is an instance of an `EventMap`
  var Graphics = new _EventMap();

  // Special property `renderer` can be modified, but not deleted
  Object.defineProperty(Graphics, 'renderer', {
    value: null,
    writable: true,
    enumerable: true
  });

  module.exports = Graphics;
});

define('flockn/graphics/rootelement', ['exports', 'module'], function (exports, module) {
  'use strict';

  var createRootElement = function createRootElement(elementName, extraFn) {
    // Sets the container name: If none is given, set the id of the object.
    // If a `#` is prepended to the string, cut it off
    var containerName = (function () {
      if (this.container == null) {
        this.container = this.id;
        return this.container;
      } else {
        if (this.container.indexOf('#') === 0) {
          return this.container.slice(1);
        }
      }
    }).call(this);

    // Set the dimensions of the object. If none are given, it should be the inside of the browser's window
    this.width = this.width || window.innerWidth;
    this.height = this.height || window.innerHeight;

    // Try to get the HTML element by using `containerName`
    var rootElement = document.getElementById(containerName);

    // If nothing was found, create the element
    if (rootElement == null) {
      var element = document.createElement(elementName);
      element.id = containerName.toLowerCase();
      document.body.appendChild(element);

      rootElement = element;
    }

    rootElement.className = [this.type.toLowerCase(), this.name.toLowerCase()].join(' ');

    // Set the dimensions of the `rootElement`
    rootElement.style.position = 'absolute';
    rootElement.style.width = this.width + 'px';
    rootElement.style.height = this.height + 'px';

    // Allow some extra functionality to happen here.
    // It should be called on the same context and the
    // `rootElement` is passed in as a parameter
    extraFn.call(this, rootElement);

    // Center the element if it's smaller than the inside of the browser's window
    if (this.width < window.innerWidth) {
      rootElement.style.left = '50%';
      rootElement.style.marginLeft = this.width * -0.5 + 'px';
    }

    if (this.height < window.innerHeight) {
      rootElement.style.top = '50%';
      rootElement.style.marginTop = this.width * -0.5 + 'px';
    }

    // Return the element, in case someone wants to meddle with it
    return rootElement;
  };

  module.exports = createRootElement;
});

define('flockn/group', ['exports', 'module', 'gamebox', './serialize'], function (exports, module, _gamebox, _serialize) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _serialize2 = _interopRequire(_serialize);

  var unidentified = 'untitled';
  var unidentifiedCounter = 0;

  var Group = (function () {
    function Group() {
      _classCallCheck(this, Group);

      this.length = 0;

      this.ids = {};
      this.tags = {};
      this.names = {};
      this.types = {};
    }

    Group.prototype.push = function push(obj) {
      var _this = this;

      var name = obj.name;
      var tags = obj.tags;
      var id = obj.id;

      name = name || unidentified + unidentifiedCounter++;
      id = id || unidentified + unidentifiedCounter++;
      tags = tags || [];

      if (this.ids[id] != null || this.names[name] != null) {
        _gamebox.Log.w('An object with the name ' + name + ' or id ' + id + ' already exists');
        return;
      }

      var currentLength = Object.keys(this.ids);
      this.ids[id] = obj;

      Object.keys(this.tags).forEach(function (tag) {
        _this.tags[tag] = _this.tags[tag] || [];
        _this.tags[tag].push(currentLength);
      });

      this.names[name] = this.length;

      if (obj.type != null) {
        this.types[obj.type] = this.types[obj.type] || [];
        this.types[obj.type].push(currentLength);
      }

      this.length = this.values().length;
      return this.length;
    };

    Group.prototype.pop = function pop() {
      var ids = Object.keys(this.ids);

      for (var i = ids.length, j = 0; j > i; i--) {
        var obj = this.ids[ids[i]];

        if (obj != null) {
          this.remove(i);
          return obj;
        }
      }
    };

    Group.prototype.values = function values() {
      var _this2 = this;

      return Object.keys(this.ids).filter(function (id) {
        return id != null;
      }).map(function (id) {
        return _this2.ids[id];
      });
    };

    Group.prototype.all = function all(filter) {
      var objects = [];

      var recurse = (function (_recurse) {
        function recurse(_x) {
          return _recurse.apply(this, arguments);
        }

        recurse.toString = function () {
          return _recurse.toString();
        };

        return recurse;
      })(function (group) {
        group.forEach(function (obj) {
          if (filter) {
            if (filter(obj)) {
              objects.push(obj);
            }
          } else {
            objects.push(obj);
          }

          if (obj.children && obj.children instanceof Group) {
            recurse(obj.children);
          }
        });
      });

      recurse(this);

      return objects;
    };

    Group.prototype.forEach = function forEach(callback) {
      this.values().forEach(function (obj) {
        return callback(obj);
      });
    };

    Group.prototype.map = function map(callback) {
      var mappedArray = new Group();

      this.forEach(function (obj) {
        return mappedArray.push(callback(obj));
      });

      return mappedArray;
    };

    Group.prototype.filter = function filter(callback) {
      var filteredArray = new Group();

      this.forEach(function (obj) {
        if (callback(obj)) {
          filteredArray.push(obj);
        }
      });

      return filteredArray;
    };

    Group.prototype.byType = function byType(type) {
      var _this3 = this;

      return this.types[type].map(function (index) {
        return _this3[index];
      });
    };

    Group.prototype.byName = function byName(name) {
      var index = this.names[name];

      return this.ids[Object.keys(this.ids)[index]];
    };

    Group.prototype.byTag = function byTag(tag) {
      var _this4 = this;

      return this.tags[tag].map(function (index) {
        return _this4[index];
      });
    };

    Group.prototype.first = function first() {
      return this.values()[0];
    };

    Group.prototype.last = function last() {
      var values = this.values();

      return values[values.length - 1];
    };

    Group.prototype.find = function find(selector) {};

    Group.prototype.toJSON = function toJSON() {
      return this.values().map(function (child) {
        if (child.toJSON && typeof child === 'function') {
          return child.toJSON();
        } else {
          return child;
        }
      });
    };

    Group.prototype.toString = function toString() {
      return _serialize2.toString(this.toJSON());
    };

    Group.fromJSON = function fromJSON(arr) {
      var group = new Group();

      arr.forEach(function (obj) {
        return group.push(obj);
      });

      return group;
    };

    Group.fromString = function fromString(str) {
      return Group.fromJSON(JSON.parse(str));
    };

    Group.prototype.remove = function remove(index) {
      var _this5 = this;

      var id = Object.keys(ids)[index];

      var obj = this.ids[id];

      if (obj == null) {
        _gamebox.Log.w('Object at ' + index + ' does not exist');
      }

      var name = obj.name;
      var tags = obj.tags;

      this.ids[id] = null;
      this.names[name] = null;

      this.tags.forEach(function (tag) {
        var position = tag.indexOf(index);

        if (position >= 0) {
          if (tag.length === 1) {
            _this5.tags[tag] = [];
          } else {
            _this5.tags[tag].splice(position, 1);
          }
        }
      });

      this.length = all().length;
    };

    Group.prototype.removeByName = function removeByName(name) {
      var index = this.names[name];
      this.remove(index);
    };

    Group.prototype.removeByTag = function removeByTag(tags) {
      var _this6 = this;

      if (!Array.isArray(tags)) {
        tags = [tags];
      }

      tags.forEach(function (tag) {
        _this6.tags[tag].forEach(function (index) {
          return _this6.remove(index);
        });
        _this6.tags = [];
      });
    };

    return Group;
  })();

  module.exports = Group;
});

// TODO: There needs to be a parser here

define('flockn', ['exports', 'module', './game', './gameobject', './scene', './behavior', './renderer'], function (exports, module, _game, _gameobject, _scene, _behavior, _renderer) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _Game = _interopRequire(_game);

  var _GameObject = _interopRequire(_gameobject);

  var _Scene = _interopRequire(_scene);

  var _Behavior = _interopRequire(_behavior);

  var _Renderer = _interopRequire(_renderer);

  var flockn = function flockn(descriptor) {
    return new _Game(descriptor);
  };

  // TODO: Comtemplate if this should be a property
  flockn.setRenderer = function (name) {
    _Renderer.use(name);
  };

  module.exports = flockn;
});

define('flockn/input/mouse', ['exports', '../types'], function (exports, _types) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var events = ['click', 'mousedown', 'mouseup', 'mouseover'];

  var absolutePosition = function absolutePosition(event, rootElement) {
    return new _types.Vector2(event.pageX - rootElement.offsetLeft, event.pageY - rootElement.offsetTop);
  };

  var relativePosition = function relativePosition(event, rootElement, offset) {
    // Normalize offset
    var offsetVector = Object.hasOwnProperty.call(offset, 'x') && Object.hasOwnProperty.call(offset, 'y') ? offset : new _types.Vector2(offset.left, offset.top);

    return absolutePosition(event, rootElement).subtract(offsetVector);
  };

  exports.events = events;
  exports.absolutePosition = absolutePosition;
  exports.relativePosition = relativePosition;
});
// These are things that might be moved into freezedev/gameboard

define('flockn/mixins/addable', ['exports', 'module', '../graphics'], function (exports, module, _graphics) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _Graphics = _interopRequire(_graphics);

  var addable = function addable(Factory, groupInstance, extraFn) {

    var adder = function adder(child) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      // I have decided against letting anything other through than functions and instance references
      // I feel that it more complexity than it tried to solve and I had to handle some edge cases
      // and more thorough type checking

      if (!(child instanceof Factory)) {
        if (typeof child !== 'function') {
          throw new Error('A child has to be a function');
        }

        child = new Factory(child);
      }

      groupInstance.push(child);
      child.parent = this;

      if (extraFn) {
        extraFn.call(this, child);
      }

      _Graphics.trigger('add', child);

      // Only call apply if it's available. Models for example don't have one
      if (child.apply) {
        child.apply(args);
      }

      child.trigger('add', child, args);
    };

    return function () {
      var args = [].slice.call(arguments);
      args.unshift(this);

      return adder.bind.apply(adder, args);
    };
  };

  module.exports = addable;
});

define('flockn/mixins', ['exports', './addable', './renderable', './updateable', './serializable'], function (exports, _addable, _renderable, _updateable, _serializable) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _addable2 = _interopRequire(_addable);

  var _renderable2 = _interopRequire(_renderable);

  var _updateable2 = _interopRequire(_updateable);

  var _serializable2 = _interopRequire(_serializable);

  exports.addable = _addable2;
  exports.renderable = _renderable2;
  exports.updateable = _updateable2;
  exports.serializable = _serializable2;
});

define('flockn/mixins/renderable', ['exports', 'module', '../utils/checkforflag', '../graphics'], function (exports, module, _utilsCheckforflag, _graphics) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _checkForFlag = _interopRequire(_utilsCheckforflag);

  var _Graphics = _interopRequire(_graphics);

  var isVisible = _checkForFlag('visible');

  var renderable = function renderable() {
    var _this = this;

    this.on('render', function () {
      // Only render if element is visible
      if (!isVisible.call(_this)) {
        return;
      }

      // Emit `render` event on the `Graphics` object
      _Graphics.trigger('render', _this);

      // Render all children elements
      _this.children.forEach(function (child) {
        return child.trigger('render');
      });
    });
  };

  module.exports = renderable;
});

define('flockn/mixins/serializable', ['exports', 'module', '../serialize'], function (exports, module, _serialize) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _serialize2 = _interopRequire(_serialize);

  var serializable = function serializable(Factory) {
    Factory.prototype.toJSON = function () {
      return _serialize2.toJSON(this);
    };

    Factory.prototype.toString = function () {
      return _serialize2.toString(this);
    };
  };

  module.exports = serializable;
});

define('flockn/mixins/updateable', ['exports', 'module', '../utils/checkforflag'], function (exports, module, _utilsCheckforflag) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _checkForFlag = _interopRequire(_utilsCheckforflag);

  var isStatic = _checkForFlag('static');

  // TODO: This is not completely how I want it be as it only sets the children as static and not the element itself
  // TODO: Evaluate if it's a good idea if static elements shouldn't be able to interact with - similar to PIXI's
  //  interactive property
  var updatable = function updateable() {
    var _this = this;

    // Update all children
    this.on('update', function (dt) {
      if (!isStatic.call(_this)) {
        return;
      }

      _this.children.forEach(function (child) {
        if (child.update) {
          child.trigger('update', dt);
        }
      });
    });
  };

  module.exports = updatable;
});

define('flockn/model', ['exports', 'module', 'eventmap', './mixins'], function (exports, module, _eventmap, _mixins) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _EventMap2 = _interopRequire(_eventmap);

  var Model = (function (_EventMap) {
    function Model() {
      _classCallCheck(this, Model);

      _EventMap.call(this);

      // Store attribute data
      this.data = {};
    }

    _inherits(Model, _EventMap);

    Model.prototype.get = function get(name) {
      // Get an attribute if it exists
      if (Object.hasOwnProperty.call(this.data, name)) {
        return this.data[name];
      }
    };

    Model.prototype.set = function set(name, value) {
      // Set or add an attribute
      this.data[name] = value;
      // Trigger the `change` event with `name` and `value` as its parameters
      this.trigger('change', name, value);
    };

    Model.prototype.bind = function bind() {};

    Model.prototype.has = function has(name) {
      return Object.hasOwnProperty.call(this.data, name);
    };

    return Model;
  })(_EventMap2);

  _mixins.serializable(Model);

  module.exports = Model;
});

define('flockn/scene', ['exports', 'module', './base', './gameobject', './mixins'], function (exports, module, _base, _gameobject, _mixins) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _Base2 = _interopRequire(_base);

  var _GameObject = _interopRequire(_gameobject);

  // A `Scene` instance is a layer for `GameObject` instances.
  // Any number of game objects can be added to a scene. Only one scene should be visible at the same time, depending
  // on what was set in the `activeScene` property of a `Game` instance.

  var Scene = (function (_Base) {
    function Scene(descriptor) {
      _classCallCheck(this, Scene);

      _Base.call(this, 'Scene', descriptor);

      this.visible = true;

      // Mix in `renderable` and `updateable`
      _mixins.renderable.call(this);
      _mixins.updateable.call(this);
    }

    _inherits(Scene, _Base);

    Scene.prototype.addGameObject = function addGameObject() {
      // Allow game objects to be added to scenes
      this.queue.push(_mixins.addable(_GameObject, this.children).apply(this, arguments));
    };

    return Scene;
  })(_Base2);

  _mixins.serializable(Scene);

  module.exports = Scene;
});

define('flockn/selector', ["exports", "module"], function (exports, module) {
  "use strict";

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var Selector = (function () {
    function Selector(selectorString) {
      _classCallCheck(this, Selector);
    }

    Selector.prototype.parse = function parse() {};

    return Selector;
  })();

  module.exports = Selector;
});

define('flockn/serialize', ['exports', 'module', 'eventmap'], function (exports, module, _eventmap) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _EventMap = _interopRequire(_eventmap);

  var serialize = {};

  serialize.json = {};

  serialize.json.filter = ['id', 'parent', 'audio', 'input', 'world', 'assetLoader'];
  serialize.json.defaultReplacer = [];

  serialize.json.defaultReplacer.push(function (key, value) {
    if (key === 'events' && value instanceof _EventMap) {
      value = value.serialize();
    }

    return value;
  });

  serialize.json.defaultReplacer.push(function (key, value) {
    // Convert image to Base64
    if (value instanceof Image) {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.height = this.height;
      canvas.width = this.width;
      context.drawImage(this.data, 0, 0);
      var dataURL = canvas.toDataURL('image/png');
      canvas = null;

      value = {
        data: dataURL,
        type: 'image/png'
      };
    }

    return value;
  });

  serialize.json.defaultReplacer.push(function (key, value) {
    if (value === null) {
      return value;
    }

    if (value.toJSON && typeof value.toJSON === 'function') {
      value = value.toJSON();
    }

    return value;
  });

  serialize.json.defaultReplacer.push(function (key, value) {
    // Functions are not allowed expect for the descriptor
    if (typeof value !== 'function') {
      return value;
    } else {
      if (key === 'descriptor') {
        return value;
      }
    }
  });

  serialize.toJSON = function (obj, replacer) {
    var clonedObj = {};

    var replacers = [].concat.apply([], [serialize.json.defaultReplacer, replacer]);

    for (var key in obj) {
      (function (key, value) {
        if (!Object.hasOwnProperty.call(obj, key)) {
          return;
        }

        if (serialize.json.filter.indexOf(key) >= 0) {
          return;
        }

        for (var i = 0, j = replacers.length; i < j; i++) {
          (function (rep) {
            if (rep) {
              value = rep.call(obj, key, value);
            }
          })(replacers[i]);
        }

        if (typeof value !== 'undefined') {
          clonedObj[key] = value;
        }
      })(key, obj[key]);
    }

    return clonedObj;
  };

  serialize.toString = function (obj) {
    return JSON.stringify(serialize.toJSON(obj), function (key, value) {
      // Functions that are still left should be stringified

      if (typeof value === 'function') {
        value = value.toString();
      }

      return value;
    });
  };

  module.exports = serialize;
});

define('flockn/texture/image', ['exports', 'module', '../types', '../mixins/serializable'], function (exports, module, _types, _mixinsSerializable) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _serializable = _interopRequire(_mixinsSerializable);

  var TextureImage = (function () {
    function TextureImage(texture) {
      _classCallCheck(this, TextureImage);

      // The default values for `image`
      this.color = _types.Color.transparent();
      this.drawable = false;
      this.offset = new _types.Vector2(0, 0);
      this.data = null;
      this.width = 0;
      this.height = 0;

      var filename = '';

      Object.defineProperty(this, 'filename', {
        get: function get() {
          return filename;
        },
        set: function set(value) {
          var _this = this;

          filename = value;

          // TODO: Most of this should already be handled by the preloader
          var img = new Image();
          img.src = filename;

          img.onload = function () {
            _this.data = img;
            _this.width = img.width;
            _this.height = img.height;
            _this.drawable = true;

            texture.trigger('image-loaded');
          };
        },
        enumerable: true
      });
    }

    TextureImage.prototype.toJSON = function toJSON() {
      return serialize.toJSON(this);
    };

    TextureImage.prototype.toString = function toString() {
      return serialize.toString(this);
    };

    return TextureImage;
  })();

  _serializable(TextureImage);

  module.exports = TextureImage;
});

define('flockn/texture', ['exports', 'module', '../types', 'eventmap', './image', './label', '../mixins/serializable'], function (exports, module, _types, _eventmap, _image, _label, _mixinsSerializable) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _EventMap2 = _interopRequire(_eventmap);

  var _TextureImage = _interopRequire(_image);

  var _TextureLabel = _interopRequire(_label);

  var _serializable = _interopRequire(_mixinsSerializable);

  var Texture = (function (_EventMap) {
    function Texture() {
      var _this = this;

      _classCallCheck(this, Texture);

      _EventMap.call(this);

      // Set up dimensions
      this.width = 0;
      this.height = 0;

      // Set parent property
      this.parent = null;

      this.image = new _TextureImage(this);
      this.label = new _TextureLabel(this);

      this.backgroundColor = _types.Color.transparent();

      // TODO: What to do when there is both an image and a label
      this.on('image-loaded', function () {
        _this.width = _this.image.width;
        _this.height = _this.image.height;
      });

      this.on('label-loaded', function () {
        _this.width = _this.label.width;
        _this.height = _this.label.height;
      });
    }

    _inherits(Texture, _EventMap);

    return Texture;
  })(_EventMap2);

  _serializable(Texture);

  module.exports = Texture;
});

define('flockn/texture/label', ['exports', 'module', '../types', '../mixins/serializable'], function (exports, module, _types, _mixinsSerializable) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _serializable = _interopRequire(_mixinsSerializable);

  var TextureLabel = function TextureLabel(texture) {
    _classCallCheck(this, TextureLabel);

    // Default value for `label`
    this.drawable = false;
    this.font = {
      size: 10,
      name: 'Arial',
      color: _types.Color.black(),
      decoration: []
    };

    this.align = {
      x: 'center',
      y: 'center'
    };
    this.width = 0;
    this.height = 0;

    var text = '';

    Object.defineProperty(this, 'text', {
      get: function get() {
        return text;
      },
      set: function set(value) {
        text = value;

        // Calculate the size of the label and update the dimensions
        // TODO: This should be handled somewhere else, but I'm not sure where
        var tmpElem = document.createElement('div');
        tmpElem.innerText = text;
        tmpElem.style.position = 'absolute';
        tmpElem.style.left = '-9999px';
        tmpElem.style.top = '-9999px';
        tmpElem.style.fontSize = this.font.size + 'px';
        tmpElem.style.fontFamily = this.font.name;
        tmpElem.style.color = this.font.color;

        this.font.decoration.forEach(function (decoration) {
          switch (decoration) {
            case 'bold':
              tmpElem.style.fontWeight = 'bold';
              break;
            case 'italic':
              tmpElem.style.fontStyle = 'italic';
              break;
            case 'underline':
              tmpElem.style.textDecoration = 'underline';
              break;
            default:
              break;
          }
        });

        document.body.appendChild(tmpElem);

        this.width = tmpElem.clientWidth;
        this.height = tmpElem.clientHeight;
        this.drawable = true;

        document.body.removeChild(tmpElem);

        texture.trigger('label-loaded');
      }
    });
  };

  _serializable(TextureLabel);

  module.exports = TextureLabel;
});

define('flockn/types/color', ['exports', 'module', 'gamebox', '../constants/color'], function (exports, module, _gamebox, _constantsColor) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _colorConstants = _interopRequire(_constantsColor);

  var Color = _gamebox.Types.Color;
  var clamp = _gamebox.Math.clamp;

  for (var colorName in _colorConstants) {
    var colorValue = _colorConstants[colorName];

    (function (colorName, colorValue) {
      Color[colorName] = function () {
        var col = new Color(colorValue.r, colorValue.g, colorValue.b, colorValue.a);
        col.name = colorName;
        return col;
      };
    })(colorName, colorValue);
  }

  module.exports = Color;
});

define('flockn/types', ['exports', 'module', './color', 'gamebox'], function (exports, module, _color, _gamebox) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _Color = _interopRequire(_color);

  _gamebox.Types.Color = _Color;

  module.exports = _gamebox.Types;
});

define('flockn/utils/checkforflag', ["exports", "module"], function (exports, module) {
  "use strict";

  var checkForFlag = function checkForFlag(property) {
    return function (obj) {
      obj = obj || this;

      var hasFlag = Object.hasOwnProperty.call(obj, property);

      if (hasFlag) {
        return obj[property];
      } else {
        return true;
      }
    };
  };

  module.exports = checkForFlag;
});

define('flockn/viewport', ['exports', 'module'], function (exports, module) {
  'use strict';

  var Viewport = {};

  Viewport.scale = {};
  Viewport.scale.mode = 'scaleToFit';
  Viewport.scale.x = 1;
  Viewport.scale.y = 1;

  Viewport.width = 800;
  Viewport.height = 600;

  module.exports = Viewport;
});

define('flockn/world', ['exports', 'module', './model'], function (exports, module, _model) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _Model = _interopRequire(_model);

  // `World` is an instance of a model
  var world = new _Model();

  module.exports = world;
});
