(function(){"use strict";angular.module('analizer', []);
}());
(function(){"use strict";
anailzerRun.$inject = ["$analizer", "$rootScope"];angular
  .module('analizer')
  .provider('$analizer', analizerProvider)
  .run(anailzerRun);


var EVENTS = [
  'click',
  'url',
  'onComplete',
  'onCompleteError',
  'setCustomData',
  'setUser',
  'timing'
];


function analizerProvider() {
  var listeners = {};
  EVENTS.forEach(function (key) {
    listeners[key] = [];
  });

  var provider = {
    trackPageViews: true,
    on: on,
    off: off,
    emit: emit,
    setUser: setUser,
    setCustomData: setCustomData,
    sendTiming: sendTiming,
    $get: getService
  };
  return provider;


  function on(eventName, callback) {
    if (EVENTS.indexOf(eventName) === -1) {
      void 0;
      return;
    }
    if (listeners[eventName].indexOf(callback) > -1) {
      void 0;
      return;
    }

    listeners[eventName].push(callback);
  }

  function off(eventName, callback) {
    if (callback) {
      var index = listeners[eventName].indexOf(callback) || -1;
      if (index > -1) { listeners[eventName].splice(index); }
    } else {
      listeners[eventName] = [];
    }
  }

  function emit(eventName, data) {
    (listeners[eventName] || []).forEach(function (cb) {
      cb(data);
    });
  }


  function setCustomData(name, value) {
    emit('setCustomData', {
      name: name,
      value: value
    });
  }

  function setUser(user) {
    emit('setUser', user);
  }


  function sendTiming(category, label, milliseconds) {
    emit('timing', {
      category: category,
      label: label,
      milliseconds: milliseconds
    });
  }







  // --- Service -------------------

  function getService() {
    var service = {
      on: provider.on,
      off: provider.off,
      emit: provider.emit,
      trackPageViews: provider.trackPageViews,
      setCustomData: provider.setCustomData,
      setUser: provider.setUser,
      sendTiming: provider.sendTiming
    };
    return service;


    function watchRoutes() {
      if (service.trackPageViews === false) { return; }

      $rootScope.$on('$locationChangeSuccess', function (event, current) {
        var relativeUrl = current.replace(window.location.origin, '');
        pageTrack(relativeUrl);
      });
    }
  }
}


/*@ngInject*/
function anailzerRun($analizer, $rootScope) {
  if ($analizer.trackPageViews === false) { return; }

  $rootScope.$on('$locationChangeSuccess', function (event, current) {
    var relativeUrl = current.replace(window.location.origin, '');
    $analizer.emit('url', {
      origin: window.location.origin,
      relative: relativeUrl,
      absolute: current
    });
  });
}
}());
(function(){"use strict";angular
  .module('analizer')
  .factory('$analizerUtil', analizerUtil);


var ELEMENT_TYPE = {
  a: 'anchor',
  button: 'button'
};

var INPUT_TYPES = {
  checkbox: 'checkbox',
  button: 'button',
  submit: 'submit-button'
};

var CLICK_TYPES = {
  anchor: 'anchor',
  button: 'button',
  checkbox: 'checkbox',
  'submit-button': 'submit-button'
};



function analizerUtil() {
  var service = {
    getElementType: getElementType,
    isClickType: isClickType,
    getLabel: getLabel
  };
  return service;



  function isClickType(type) {
    return CLICK_TYPES[type] !== undefined;
  }


  function getElementType(element) {
    var type;

    // check role attributer first
    var role = element.attr('role');

    type = CLICK_TYPES[type];
    if (type) { return; }

    type = INPUT_TYPES[type];
    if (type) { return; }

    type = ELEMENT_TYPE[type];
    if (type) { return; }


    // check nodeName
    var nodeName = element[0].nodeName.toLowerCase();
    type = ELEMENT_TYPE[nodeName];
    if (type) { return type; }


    // check input type attribute
    if (nodeName === 'input') {
      type = INPUT_TYPES[element.attr('type')];
      if (type) { return type; }
      else {
        type = element.attr('type');
        return type ? 'input:'+element.attr('type') : 'input';
      }
    }

    return undefined;
  }





  function getLabel(element) {
    var label;
    var labelEl;

    if (element[0].nodeName.toLowerCase() === 'input') {
      var inputType = element.attr('type');

      // inputs with type button and submit have there label in the `value` attr
      if (inputType === 'button' || inputType === 'submit') {
        return filterElementText(element.attr('value'));
      }

      // find label by `for` attr if name attr exists on input
      var name = element.attr('name');
      if (name) {
        labelEl = element.parent()[0].querySelector('[for='+name+']');
        if (labelEl && labelEl.nodeName.toLowerCase() === 'label') {
          return filterElementText(labelEl.textContent);
        }
      }

      // try to find label Element
      if (!labelEl) {
        // label above
        labelEl = previousElementSibling(element[0]);
        if (labelEl && labelEl.nodeName.toLowerCase() === 'label') {
          return filterElementText(labelEl.textContent);
        }

        // label below
        labelEl = nextElementSibling(element[0]);
        if (labelEl && labelEl.nodeName.toLowerCase() === 'label') {
          return filterElementText(labelEl.textContent);
        }

        // parent
        labelEl = element.parent();
        if (labelEl[0].nodeName.toLowerCase() === 'label') {
           return filterElementText(labelEl.text());
        }
      }
    }

    // check for immediate text inside the element
    Array.prototype.slice.call(element[0].children).forEach(function (node) {
      if (node.nodeType === 3) { // text node
        label = filterElementText(node.textContent);
      }
    });

    // check for nested span with text
    if (!label) {
      var span = element[0].querySelector('span');
      if (span && span.textContent) {
        label = filterElementText(span.textContent);
      }
    }

    return label;
  }

  function filterElementText(text) {
    text = text.replace(/^\s+|\s+$/g, '');
    return text === '' ? undefined : text;
  }

  // find fisrt none text node
  function previousElementSibling(elem) {
    do {
      elem = elem.previousSibling;
    } while (elem && elem.nodeType !== 1); // 1 = element node
    return elem;
  }

  // find fisrt none text node
  function nextElementSibling(elem) {
    do {
      elem = elem.nextSibling;
    } while (elem && elem.nodeType !== 1); // 1 = element node
    return elem;
  }
}
}());
(function(){"use strict";
analizerDirective.$inject = ["$analizerUtil", "$analizer", "$parse", "$q", "$rootScope"];angular
  .module('analizer')
  .directive('analizer', analizerDirective);


/*@ngInject*/
function analizerDirective($analizerUtil, $analizer, $parse, $q, $rootScope) {
  var directive = {
    restrict: 'A',
    compile: compile
  };
  return directive;



  function compile(tElement, tAttrs) {
    var onCompleteParse;
    var isOnComplete = tAttrs.analizerOnComplete !== undefined;
    var isOnResolve = tAttrs.analizerOnResolve !== undefined;
    var isOnReject = tAttrs.analizerOnReject !== undefined;

    // get ngClick function parser
    if ((isOnComplete || isOnResolve || isOnReject) && tAttrs.ngClick !== undefined) {
      onCompleteParse = $parse(tAttrs.ngClick);
      tAttrs.$set('ngClick', undefined);
    }


    return function postLink(scope, element, attrs) {
      var label = tAttrs.analizerLabel || $analizerUtil.getLabel(element);
      var action = tAttrs.analizerAction || 'click';
      var type = tAttrs.analizerCategory || $analizerUtil.getElementType(element);
      if ($analizerUtil.isClickType(type)) { trackClick(); }

      function trackClick() {
        element.on('click', function (ev) {
          var callback = function() {
            waitForComplete(onCompleteParse(scope, {$event: ev}), type, label);
          };

          // call ngClick function inside of a digest cycle
          if ($rootScope.$$phase) {
            scope.$evalAsync(callback);
          } else {
            scope.$apply(callback);
          }

          $analizer.emit('click', {
            clickEvent: ev,
            type: type,
            label: label,
            category: type,
            action: action
          });
        });
      }


      // if `analizerOnComplete` attr exists and ngClick exists then look for promise to complete from click method call
      function waitForComplete(promise, type, label) {
        $q.when(promise)
          .then(function() {
            if (isOnComplete || isOnResolve) {
              $analizer.emit('onComplete', {
                type: type,
                label: label,
                category: type,
                action: 'onComplete'
              });
            }
          })
          .catch(function () {
            if (isOnComplete || isOnReject) {
              $analizer.emit('onCompleteError', {
                type: type,
                label: label,
                category: type,
                action: 'onCompleteError'
              });
            }
          });
      }
    };
  }
}
}());
(function(){"use strict";
configGa.$inject = ["$analizerProvider"];angular
  .module('analizer.ga', ['analizer'])
  .config(configGa);


/*@ngInject*/
function configGa($analizerProvider) {
  var dispatcher = getDispatcher();
  var demensions = [];

  $analizerProvider.on('url', function (data) {
    if ($analizerProvider.trackPageViews === false) { return; }
    // set page for all calls
    dispatcher({
      command: 'set',
      page: data.relative
    });

    // pageview event
    dispatcher({
      hitType: 'pageview',
      page: data.relative
    });
  });

  $analizerProvider.on('click', function (data) {
    dispatcher({
      hitType: 'event',
      eventCategory: data.type,
      eventAction: data.action,
      eventLabel: data.label
    });
  });

  $analizerProvider.on('onComplete', function (data) {
    dispatcher({
      hitType: 'event',
      eventCategory: data.type,
      eventAction: data.action,
      eventLabel: data.label
    });
  });

  $analizerProvider.on('onCompleteError', function (data) {
    dispatcher({
      hitType: 'event',
      eventCategory: data.type,
      eventAction: data.action,
      eventLabel: data.label
    });
  });

  $analizerProvider.on('setCustomData', function (data) {
    var obj = {};
    obj[data.name] = data.value.toString();
    dispatcher(angular.extend({command: 'set'}, obj));
  });


  $analizerProvider.on('setUser', function (user) {
    dispatcher(angular.extend({command: 'set'}, {
      userId: user.toString()
    }));
  });

  $analizerProvider.on('timing', function (data) {
    dispatcher({
      hitType: 'timing',
      timingCategory: data.category,
      timingVar: data.label,
      timingValue: data.milliseconds
    });
  });
}


function getDispatcher() {
  if (typeof ga !== 'function') {
    void 0;
    return angular.noop;
  }

  return function(config) {
    var command = config.command || 'send';
    delete config.command;
    ga(command, config);
  };
}
}());