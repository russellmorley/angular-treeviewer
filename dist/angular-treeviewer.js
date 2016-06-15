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
                        normalizeWords:   '=?normalizeWords'
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
                            if (thing instanceof Array && thing.length === 0) {
                                return;
                            }

                            thing._childrenVisible = !thing._childrenVisible;
                            thing._iconClass = thing._childrenVisible ? scope.openIconClass : scope.closeIconClass;
                        };

                        scope.setControls = function(thing) {
                            if (typeof thing === 'object') {
                                if (typeof thing._iconClass === 'undefined') {
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
                                    return "expanded-item-with-icon";
                                } else {
                                    return "expanded-item-without-icon";
                                }
                            } else {
                                if (typeof thing !== 'object') {
                                    return "root-item-without-icon";
                                }
                            }
                        };

                        scope.search = "";

                        scope.$watch('search', function (val) {
                            if (!scope.flattenedTree || scope.flattenedTree.length == 0) {
                                scope.flattenedTree = [];
                                flatten(scope.fullTree, scope.flattenedTree);
                            }
                            scope.displayTree = val.length > 0 ? scope.flattenedTree : scope.fullTree;
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
                                for (var key in parent) {
                                    if (parent[key] && typeof parent[key] === 'string') {
                                        par += key + ": " + parent[key] + '; ';
                                    }
                                }
                                var str = par;
                                if (arr.indexOf(str) == -1) {
                                    arr.push(str);
                                }
                                return;
                            } else {
                                return;
                            }
                        }

                        function removeEmptyValues(node) {
                            if(node && node instanceof Array) {
                                var newArray = [];
                                node.forEach(function(val, idx, array) {
                                    /*jshint unused: false*/    
                                    var newVal = removeEmptyValues(val);
                                    if (newVal) {
                                        newArray.push(newVal);
                                    }   
                                });
                                if (newArray.length > 0) {
                                    return newArray;
                                } else {
                                    return null;
                                }
                            } else if (node && typeof node === 'object') {
                                var newObj = {};
                                Object.getOwnPropertyNames(node).forEach(function(key, idx, array) {
                                    /*jshint unused: false*/   
                                    var newVal = removeEmptyValues(node[key]);
                                    if (newVal) {
                                        newObj[key] = newVal;
                                    }
                                });
                                return newObj;
                            } else {
                                if (node && ((typeof node === 'string' && node.length > 0) || (typeof node === 'boolean') || (typeof node === 'number'))) {
                                    return node;
                                } else {
                                    return null;
                                }
                            }
                        }

                        if (scope.removeEmptyValues) {
                            scope.fullTree = removeEmptyValues(scope.fullTree);
                        }

                        function normalizeWords(node) {
                            if(node && node instanceof Array) {
                                var newArr = [];
                                node.forEach(function(val, idx, array) {
                                    /*jshint unused: false*/    
                                    newArr.push(normalizeWords(val));
                                });
                                return newArr;
                            } else if (node && typeof node === 'object') {
                                var newObj = {};
                                Object.getOwnPropertyNames(node).forEach(function(key, idx, array) {
                                    /*jshint unused: false*/  
                                    //first replace all underscores in string with a blank
                                    var newKey = key.replace(/_/gi, function(txt) {
                                        return ' ';
                                    }); 
                                    //normalize to first letter cap, rest lower for all words in the string.
                                    newKey = newKey.replace(/\w\S*/g, function(txt) {
                                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                    });
                                    newObj[newKey] = normalizeWords(node[key]); 
                                });
                                return newObj;
                            } else if (typeof node === 'string') {
                                return node.replace(/\w\S*/g, function(txt) {
                                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                                });
                            } else {
                                return node;
                            }
                        }

                        if (scope.normalizeWords) {
                            scope.fullTree = normalizeWords(scope.fullTree);
                        }
                    },
                    template: '<script type="text/ng-template" id="node_renderer.html"><span ng-if="setControls(value)" ><span ng-click="toggleControls(value)" ng-if="showLabel(key)" ><span ng-class="value._iconClass"></span> <label class="key" ng-if="isString(key)">{{key}}</label><label class="delimiter" ng-if="isString(key) && isPrimitive(value)">: </label><label class="value" ng-if="isPrimitive(value)">{{value}}</label><label ng-if="isObject(value)">&nbsp;</label></span><div ng-if="value._childrenVisible"><div ng-repeat="(key, value) in value" ng-include="\'node_renderer.html\'" ng-class="getRepeatClass(value, false)"></div></div></span><\/script><div><input class="search-box"  ng-model="search" id="inputIcon" type="text" /> <i ng-class="searchIconClass"></i></div><strong  ng-show="search.length > 0" class="search-count">Matching results: {{ (displayTree|filter:search).length }}</strong><br><br><div ng-repeat="(key, value) in displayTree | filter:search" ng-include="\'node_renderer.html\'" ng-class="getRepeatClass(value, true)"></div>'
                }; //return
            } //function
        ] 
    ); //angular          
})();
