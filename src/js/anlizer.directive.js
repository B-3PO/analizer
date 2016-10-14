angular
  .module('analyzer')
  .directive('analyzer', analyzerDirective);


/*@ngInject*/
function analyzerDirective($analyzerUtil, $analyzer, $parse, $q, $rootScope) {
  var directive = {
    restrict: 'A',
    compile: compile
  };
  return directive;



  function compile(tElement, tAttrs) {
    var onCompleteParse;
    var isOnComplete = tAttrs.analyzerOnComplete !== undefined;
    var isOnResolve = tAttrs.analyzerOnResolve !== undefined;
    var isOnReject = tAttrs.analyzerOnReject !== undefined;

    // get ngClick function parser
    if ((isOnComplete || isOnResolve || isOnReject) && tAttrs.ngClick !== undefined) {
      onCompleteParse = $parse(tAttrs.ngClick);
      tAttrs.$set('ngClick', undefined);
    }


    return function postLink(scope, element, attrs) {
      var label = tAttrs.analyzerLabel || $analyzerUtil.getLabel(element);
      var action = tAttrs.analyzerAction || 'click';
      var type = tAttrs.analyzerCategory || $analyzerUtil.getElementType(element);
      if ($analyzerUtil.isClickType(type)) { trackClick(); }

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

          $analyzer.emit('click', {
            clickEvent: ev,
            type: type,
            label: label,
            category: type,
            action: action
          });
        });
      }


      // if `analyzerOnComplete` attr exists and ngClick exists then look for promise to complete from click method call
      function waitForComplete(promise, type, label) {
        $q.when(promise)
          .then(function() {
            if (isOnComplete || isOnResolve) {
              $analyzer.emit('onComplete', {
                type: type,
                label: label,
                category: type,
                action: 'onComplete'
              });
            }
          })
          .catch(function () {
            if (isOnComplete || isOnReject) {
              $analyzer.emit('onCompleteError', {
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
