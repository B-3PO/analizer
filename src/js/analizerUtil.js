angular
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
