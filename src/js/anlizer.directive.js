angular
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
