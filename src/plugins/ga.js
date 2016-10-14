angular
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
    console.error('Error: neither Classic nor Universal Analytics detected at bootstrap. Angulartics-GA will ignore all commands!');
    return angular.noop;
  }

  return function(config) {
    var command = config.command || 'send';
    delete config.command;
    ga(command, config);
  };
}
