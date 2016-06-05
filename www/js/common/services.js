angular.module('ionizer-chat.services', [])

.factory('APIFunctions', ['utility', function(utility) {

    var getPropByString = utility.getPropByString;

    return {
        // function to create URL for API Call
        makeURL: function(settings) {

            var returnData = {};
            returnData.URL = settings.URL.baseURL();
            returnData.params = {};

            for (var element in settings.URL.params) {
                if (settings.URL.params.hasOwnProperty(element)) {
                    returnData.params[element] = settings.URL.params[element]();
                }
            }

            return returnData;
        },
        // prepare the Return Data based on the Settings
        prepareData: function(data, settings) {

            if (settings.Type == 'detail') {

                if (!getPropByString(data, settings.API_DataProperty) || getPropByString(data, settings.API_DataProperty).length == 0) {
                    var originalData = data;
                } else {
                    var originalData = getPropByString(data, settings.API_DataProperty)
                }

                var returnData = {};
                var originalData = getPropByString(data, settings.API_DataProperty)
                var fullData = data

                for (var element in settings.returnElements) {
                    if (settings.returnElements.hasOwnProperty(element)) {
                        returnData[element] = settings.returnElements[element](originalData,fullData);
                    }
                }

            } else {
                var returnData = [];
                var originalData = getPropByString(data, settings.API_DataProperty)
                var fullData = data

                for (var i = 0; i < originalData.length; i++) {
                    returnData[i] = {};
                    for (var element in settings.returnElements) {
                        if (settings.returnElements.hasOwnProperty(element)) {
                            returnData[i][element] = settings.returnElements[element](originalData[i],fullData);
                        }
                    }
                }
            }

            return returnData;
        }
    }
}])

.factory('utility', [ function() {

    return {
        readyCheckBoxes: function(checkboxes, cacheStorage) {
            for (var i = 0; i < cacheStorage.length; i++) {
                checkboxes[cacheStorage[i]] = true;
            }
        },
        saveCheckBoxes: function(checkboxes, scopeData, cacheStorage, cacheObjects) {
            var tempData = cacheStorage;
            var tempObjData = cacheObjects;
            var responseObject = {};


            for (var i = 0; i < scopeData.length; i++) {
                if (tempData.indexOf(scopeData[i].API_ID) > -1) {
                    tempObjData.splice(tempData.indexOf(scopeData[i].API_ID), 1);
                    tempData.splice(tempData.indexOf(scopeData[i].API_ID), 1);
                }
                if (checkboxes[scopeData[i].API_ID]) {
                    tempObjData.push(scopeData[i]);
                    tempData.push(scopeData[i].API_ID);
                }
            }

            responseObject.data = tempData;
            responseObject.dataObject = tempObjData;

            return responseObject;
        },
        partition: function(input, size) {
            var newArr = [];
            for (var i = 0; i < input.length; i += size) {
                newArr.push(input.slice(i, i + size));
            }
            return newArr;
        },
        getPropByString: function(obj, propString) {
            // function to get a specific part of the return object

            if (!propString)
                return obj;

            var prop, props = propString.split('.');

            for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
                prop = props[i];

                var candidate = obj[prop];
                if (candidate !== undefined) {
                    obj = candidate;
                } else {
                    break;
                }
            }
            return obj[props[i]];
        }
    }
}])

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = angular.toJson(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '[]');
        },
        destroy: function(key) {
            $window.localStorage.removeItem(key);
        },
        log: function(key, defaultValue) {
            console.log($window.localStorage[key] || defaultValue);
        },
        logObject: function(key) {
            console.log(JSON.parse($window.localStorage[key] || '{}'));
        }
    }
}])

