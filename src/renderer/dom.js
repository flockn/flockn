udefine(['root', '../graphics', '../graphics/rootelement'], function(root, Graphics, createRootElement) {
  'use strict';

  var pixelize = function(num) {
    return num + 'px';
  };

  var unpixelize = function(str) {
    return parseFloat(str) || 0;
  };

  Graphics.renderer = 'DOM';

  var rootElement = null;

  Graphics.on('initialize', function(Game) {
    rootElement = createRootElement.call(Game, 'div', function(rootElement) {
      rootElement.style.backgroundColor = this.color;
      rootElement.style.overflow = 'hidden';
    });
  });

  Graphics.on('add', function(obj) {
    var elementId = obj.id.toLowerCase();

    // Remove previous elements of the same id
    if (document.getElementById(elementId) != null) {
      (function() {
        var parentId = obj.parent.id.toLowerCase();

        var parentElem = document.getElementById(parentId);
        parentElem.removeChild(document.getElementId(elementId));
      })();
    }

    var parent = obj.parent;

    var parentElem = (function() {
      if ((parent && parent.isRoot) || parent == null) {
        return rootElement;
      } else {
        var parentId = obj.parent.id.toLowerCase();
        var element = document.getElementById(parentId);
        if (element == null) {
          return rootElement;
        } else {
          return element;
        }
      }
    })();

    var element = document.createElement('div');
    element.id = elementId;
    element.className = [obj.type.toLowerCase(), obj.name.toLowerCase()].join(' ');
    element.style.position = 'absolute';

    switch (obj.type) {
    case 'Scene':
      element.style.width = pixelize(obj.parent.width);
      element.style.height = pixelize(obj.parent.height);
      break;
    case 'GameObject':
      element.style.left = pixelize(obj.x);
      element.style.top = pixelize(obj.y);
      element.style.width = pixelize(obj.width);
      element.style.height = pixelize(obj.height);
      
      // TODO: Normalize events
      root.addEventListener('click', function(evt) {
      	obj.trigger('click', evt);
      }, true);
      
      root.addEventListener('mousedown', function(evt) {
      	obj.trigger('mousedown', evt);
      }, true);
      
      root.addEventListener('mouseup', function(evt) {
      	obj.trigger('mouseup', evt);
      }, true);
      
      root.addEventListener('mouseenter', function(evt) {
      	obj.trigger('mouseenter', evt);
      }, true);
      
      root.addEventListener('mouseleave', function(evt) {
      	obj.trigger('mouseleave', evt);
      }, true);
      
      root.addEventListener('mouseover', function(evt) {
      	obj.trigger('mouseover', evt);
      }, true);
      break;
    default:
      break;
    }

    parentElem.appendChild(element);
  });

  Graphics.on('texture-loaded', function(obj, texture) {
    var element = document.getElementById(obj.id.toLowerCase());

    if (element != null) {
      element.style.backgroundImage = 'url(' + texture.filename + ')';
      element.style.width = pixelize(obj.width);
      element.style.height = pixelize(obj.height);
    }
  });

  Graphics.on('render', function(obj) {
    // Update element attributes
    var element = document.getElementById(obj.id.toLowerCase());

    if (element != null) {
      switch (obj.type) {
      case 'GameObject':
        var elemVisible = element.style.display === 'block';

        if (elemVisible !== obj.visible) {
          element.style.display = (obj.visible) ? 'block' : 'hidden';
        }

        if (!elemVisible) {
          return;
        }

        var elemX = unpixelize(element.style.left);
        var elemY = unpixelize(element.style.top);
        var elemWidth = unpixelize(element.style.width);
        var elemHeight = unpixelize(element.style.height);

        if (elemX !== obj.x) {
          element.style.left = pixelize(obj.x);
        }

        if (elemY !== obj.y) {
          element.style.top = pixelize(obj.y);
        }

        if (elemWidth !== obj.width) {
          element.style.width = pixelize(obj.width);
        }

        if (elemHeight !== obj.height) {
          element.style.height = pixelize(obj.height);
        }

        if (obj.angle) {
          element.style.transform = element.style.mozTransform = element.style.webkitTransform = 'rotate(' + obj.angle + 'deg)';
        }

        if (obj.alpha !== 1) {
          element.style.opacity = obj.alpha;
        }

        // Set background color
        if (!obj.texture.filename) {
          element.style.backgroundColor = obj.texture.color;
        } else {
          if (obj.texture.offset.x !== 0) {
            element.style.backgroundPositionX = obj.texture.offset.x * (-1) + 'px';
          }

          if (obj.texture.offset.y !== 0) {
            element.style.backgroundPositionY = obj.texture.offset.y * (-1) + 'px';
          }
        }

        break;
      case 'Scene':
        var elemVisibleStyle = element.style.display;

        if (obj.parent.activeScene !== obj.name) {
          if (elemVisibleStyle !== 'hidden') {
            element.style.display = 'hidden';
          }
        } else {
          if (elemVisibleStyle !== 'block') {
            element.style.display = 'block';
          }
        }
        break;
      default:
        break;
      }

    }

  });

  return Graphics;

});