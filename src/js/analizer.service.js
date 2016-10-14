angular
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
      console.error('analizer does not except "'+eventName+'" as an event.  Please use one of these ('+EVENTS.join(',')+')');
      return;
    }
    if (listeners[eventName].indexOf(callback) > -1) {
      console.error('you have already registered this function');
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
    })
  }







  // --- Service -------------------

  function getService() {
    var service = {
      on: provider.on,
      off: provider.off,
      emit: provider.emit,
      trackPageViews: provider.trackPageViews,
      setCustomData: provider.setCustomData,
      setUser: provider.setUser
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
