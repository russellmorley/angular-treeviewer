/**!
 * AngularJS treeviewer directive.
 * @author Russell Morley <russell@compass-point.net>
 * @version 0.1.0
 */

/* global angular */

(function () {
    'use strict';

    angular.module('angularTreeviewer', []).directive(
        'angularTreeviewer',
        [
            '$window',
            '$timeout',
            '$log',
            '$parse',
            function($window, $timeout, $log, $parse) {
                return {
                    restrict: 'A',
                    scope: {
                        fullTree:                       '=fullTree',
                        openIconClass:                  '=?openIconClass',
                        closeIconClass:                 '=?closeIconClass',
                        emptyIconClass:                 '=?emptyIconClass',
                        groupIconClass:                 '=?groupIconClass',
                        searchIconClass:                '=?searchIconClass',
                        removeEmptyValues:              '=?removeEmptyValues',
                        normalizeWords:                 '=?normalizeWords',
                        startContracted:                '=?startContracted'
                    },
                    link: function(scope, element, attrs, ngModel) {
                        scope.isString = function(thing) {
                            return angular.isString(thing);
                        };

                        scope.isPrimitive = function(thing) {
                            return angular.isString(thing) || angular.isNumber(thing) || (typeof thing === 'boolean');
                        };

                        scope.isObject = function(thing) {
                            return angular.isObject(thing);
                        };

                        scope.toggleControls = function(thing) {
                            if  (
                                    !thing //null, undefined, false, 0, '', NaN
                                    || (typeof thing !== 'object') //boolean, number, string, symbol, function
                                    || (thing instanceof Array && thing.length === 0) //zero length array
                                ) {
                                return;
                            }
                            // if: non-null object or array with a size greater than zero. 
                            thing._childrenVisible = !thing._childrenVisible;
                            thing._iconClass = thing._childrenVisible ? scope.openIconClass : scope.closeIconClass;
                        };

                        scope.setControls = function(thing) {
                            if (typeof thing === 'object') {
                                if (thing && typeof thing._iconClass === 'undefined') {
                                    if (thing instanceof Array && thing.length === 0) {
                                        thing._iconClass = scope.emptyIconClass;
                                    } else {
                                        thing._iconClass = scope.closeIconClass;
                                    }
                                }
                                if (thing instanceof Array) {
                                    for (var i = 0; i < thing.length; i++) {
                                        if (typeof thing[i] === 'object') {
                                            thing[i]._childrenVisible = true;
                                            thing[i]._iconClass = scope.groupIconClass;
                                        }
                                    }
                                }
                            }
                            return true;
                        };
                        scope.showLabel = function(thing) {
                            return thing !== '_childrenVisible' && thing !== '_iconClass';
                        };

                        scope.getRepeatClass = function(thing, isRoot) {
                            if (!isRoot) {
                                if (typeof thing === 'object') {
                                    return 'expanded-item-with-icon';
                                } else {
                                    return 'expanded-item-without-icon';
                                }
                            } else {
                                if (typeof thing !== 'object') {
                                    return 'root-item-without-icon';
                                }
                            }
                        };

                        scope.search = '';

                        scope.$watch('search', function (val) {
                            if (!scope.flattenedTree || scope.flattenedTree.length == 0) {
                                scope.flattenedTree = [];
                                flatten(scope.heirarchicalTree, scope.flattenedTree);
                            }
                            scope.displayTree = val.length > 0 ? scope.flattenedTree : scope.heirarchicalTree;
                        });

                        scope.$watch('fullTree', function (val) {
                            scope.search = ''; //reset search
                            scope.flattenedTree = null; //clear flattened tree
                            scope.heirarchicalTree = preProcessTree(val, scope.removeEmptyValues, scope.normalizeWords, scope.startContracted, scope.openIconClass);
                            scope.displayTree = scope.heirarchicalTree;
                        });

                        function flatten(node, arr, val, parent) {
                            if(node && node instanceof Array) {
                                node.forEach(function(val, idx, array) {
                                    /*jshint unused: false*/    
                                    flatten(val, arr);
                                });
                                return;
                            } else if (node && typeof node === 'object') {
                                Object.getOwnPropertyNames(node).forEach(function(val, idx, array) {
                                    /*jshint unused: false*/    
                                    flatten(node[val], arr, val, node);
                                });
                                return;
                            } else if (node && ((typeof node === 'string') || (typeof node === 'boolean') || (typeof node === 'number')) && val) {
                                var par = '';
                                Object.getOwnPropertyNames(parent).forEach(function(key, idx, array) {
                                    if (parent[key] && typeof parent[key] === 'string') {
                                        if (key !== '_childrenVisible' && key !== '_iconClass' && key !=='$$hashKey') {
                                            par += key + ': ' + parent[key] + '; ';
                                        }
                                    }
                                });
                                var str = par;
                                if (arr.indexOf(str) === -1) {
                                    arr.push(str);
                                }
                                return;
                            } else {
                                return;
                            }
                        }

                        function preProcessTree(node, removeEmptyValues, normalizeWords, startContracted, openIconClass) {
                            if(node && node instanceof Array) {
                                var newArray = [];
                                node.forEach(function(val, idx, array) {
                                    /*jshint unused: false*/    
                                    var newVal = preProcessTree(val, removeEmptyValues, normalizeWords, startContracted, openIconClass);
                                    if (!removeEmptyValues || newVal) {
                                        newArray.push(newVal);
                                    }   
                                });
                                if (!removeEmptyValues || newArray.length > 0) {
                                    if (!startContracted) {
                                        newArray._childrenVisible = true;
                                        newArray._iconClass = openIconClass;
                                    }
                                    return newArray;
                                } else {
                                    return null;
                                }
                            } else if (node && typeof node === 'object') {
                                var nodeProperties = Object.getOwnPropertyNames(node);
                                /*
                                    XML to JSON converts XML arrays specified as:
                                        <e> <a>text</a> <a>text</a> </e>	
                                    to:
                                        "e": { "a": ["text", "text"] }
                                    When "a" is the only property of its object we would rather have the
                                    following for display (because "a" doesn't contain any meaningful information
                                    for the user):
                                        "e": ["text", "text"]
                                    This conditional converts the former to the latter for 
                                    cases where "a" is the only property of its object.
                                 */
                                if (nodeProperties.length === 1 && node[nodeProperties[0]] instanceof Array) {
                                    return preProcessTree(node[nodeProperties[0]], removeEmptyValues, normalizeWords, startContracted, openIconClass);
                                }
                                var newObj = {};
                                nodeProperties.forEach(function(key, idx, array) {
                                    /*jshint unused: false*/   
                                    var newKey = key;
                                    if (normalizeWords) {
                                        //first replace all underscores in string with a blank
                                        newKey = key.replace(/_/gi, function(txt) {
                                            return ' ';
                                        }); 
                                        //normalize to first letter cap, rest lower for all words in the string.
                                        newKey = newKey.replace(/\w\S*/g, function(txt) {
                                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                        });
                                    }
                                    var newVal = preProcessTree(node[key], removeEmptyValues, normalizeWords, startContracted, openIconClass);
                                    if (!removeEmptyValues || newVal) {
                                        newObj[newKey] = newVal;
                                    }
                                });
                                if (!startContracted) {
                                    newObj._childrenVisible = true;
                                    newObj._iconClass = openIconClass;
                                }
                                return newObj;
                            } else {
                                if (node && ((typeof node === 'string' && node.length > 0) || (typeof node === 'boolean') || (typeof node === 'number'))) {

                                    if (normalizeWords && typeof node === 'string') {
                                        return node.replace(/\w\S*/g, function(txt) {
                                            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                        });
                                    }
                                    return node;
                                } else {
                                    return null;
                                }
                            }
                        }
                    },
                    template: '<script type="text/ng-template" id="node_renderer.html"><span ng-if="setControls(value)" ><span ng-click="toggleControls(value)" ng-if="showLabel(key)" ><span ng-class="value._iconClass"></span> <label class="key" ng-if="isString(key)">{{key}}</label><label class="delimiter" ng-if="isString(key) && isPrimitive(value)">: </label><label class="value" ng-if="isPrimitive(value)">{{value}}</label><label ng-if="isObject(value)">&nbsp;</label></span><div ng-if="value._childrenVisible"><div ng-repeat="(key, value) in value" ng-include="\'node_renderer.html\'" ng-class="getRepeatClass(value, false)"></div></div></span><\/script><div><input class="search-box"  ng-model="search" id="inputIcon" type="text" /> <i ng-class="searchIconClass"></i></div><strong  ng-show="search.length > 0" class="search-count">Matching results: {{ (displayTree|filter:search).length }}</strong><br><br><div ng-repeat="(key, value) in displayTree | filter:search" ng-include="\'node_renderer.html\'" ng-class="getRepeatClass(value, true)"></div>'
                }; //return
            } //function
        ] 
    ); //angular          
})();
