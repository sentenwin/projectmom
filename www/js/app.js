angular.module('ionizer-chat', ['ionic', 'ngCordova', 'firebase', 'monospaced.elastic', 'angularMoment', 'ionizer-chat.controllers', 'ionizer-chat.services', 'ionizer-chat.firebaseController', 'ionizer-chat.servicefirebase'])


/*.run(function($ionicPlatform, firebaseservice, $state, $rootScope, $localstorage) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });

    $rootScope.$on('loading:show', function() {
          $ionicLoading.show({template: '<ion-spinner icon="spiral"/>'})
        })

        $rootScope.$on('loading:hide', function() {
          $ionicLoading.hide()
        });

})*/
.run(function($ionicPlatform, firebaseservice, $state, $rootScope, $localstorage) {

    $ionicPlatform.registerBackButtonAction(function (event) {
    if($state.current.name == "app.about" || $state.current.name == "login" || $state.current.name == "normallogin"){
      navigator.app.exitApp();
    }
     else {
      navigator.app.backHistory();
    }
    
  }, 100);

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });

    $rootScope.$on('loading:show', function() {
          $ionicLoading.show({template: '<ion-spinner icon="spiral"/>'})
        })

        $rootScope.$on('loading:hide', function() {
          $ionicLoading.hide()
        });

})


.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('normallogin', {
        url: '/normallogin',
        templateUrl: 'templates/auth/normallogin.html',
        controller: 'LoginCtrl'
    })
    .state('login', {
        url: '/login',
        templateUrl: 'templates/auth/normallogin.html',
        controller: 'LoginCtrl'
    })
    .state('register', {
        url: '/register',
        templateUrl: 'templates/auth/register.html',
        controller: 'RegisterCtrl'
    })

    .state('forgot', {
        url: '/forgot',
        templateUrl: 'templates/auth/forgot.html',
        controller: 'ForgotCtrl'
    })

    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })

    .state('app.pregnancyweek', {
        url: '/pregnancyweek',
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/dashboard/pregnancyweek.html'
              //  controller: 'TabsPageController'
            }
        }
    })

    .state('app.pregnancyweek.growth', {
        url: '/growth',
        views: {
            'tab-growth': {
                templateUrl: 'templates/growth.html',
                controller: 'GrowthCtrl'
            }
        }
    })


    .state('app.profile', {
        url: '/profile',
        abstract: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/Profile/profile-personal.html',
                controller: 'TabsPageController'
            }
        }
    })


    .state('app.profile.personal', {
        url: '/personal',
        views: {
            'tab-personal': {
                templateUrl: 'templates/Profile/profile-personal.html',
                controller: 'profilePersonalCtrl'
            }
        }
    })

    .state('app.profile.social', {
        url: '/social',
        views: {
            'tab-social': {
                templateUrl: 'templates/Profile/profile-social.html',
                controller: 'profileSocialCtrl'
            }
        }
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/Chat/home.html",
                controller: 'HomeCtrl'
            }
        }
    })


    .state('app.userchat', {
        url: "/userchat",
        views: {
            'menuContent': {
                templateUrl: "templates/Chat/userchat.html",
                controller: 'HomeCtrl'
            }
        }
    })

    .state('app.showalluser', {
        url: "/showalluser",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/showalluser.html",
                controller: 'HomeCtrl'
            }
        }
    })

     .state('app.tips', {
        url: "/tips",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/tips.html",
                controller: 'TipsCtrl'
            }
        }
    })
        .state('app.viewscheme', {
        url: "/viewscheme",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/viewscheme.html",
                controller: 'SchemeCtrl'
            }
        }
    })

        .state('app.viewcheckup', {
        url: "/viewcheckup",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/viewcheckup.html",
                controller: 'CheckupCtrl'
            }
        }
    })

    .state('app.about', {
        url: "/about",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/about.html",
                controller: 'AboutCtrl'
            }
        }
    })

      .state('app.growth', {
        url: "/growth",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/growth.html",
                controller: 'GrowthCtrl'
            }
        }
    })
      .state('app.trimester', {
        url: "/trimester",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/trimester.html",
                controller: 'GrowthCtrl'
            }
        }
    })

       .state('app.babygrowth', {
        url: "/growth/:growthid",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/babygrowth.html",
                controller: 'GrowthCtrl'
            }
        }
    })

        .state('app.tipsdetail', {
        url: "/tips/:tipsid",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/tipsdetail.html",
                controller: 'TipsCtrl'
            }
        }
    })

     .state('app.trimesterdetail', {
        url: "/trimester/:trimesterid",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/trimesterdetail.html",
                controller: 'GrowthCtrl'
            }
        }
    })  

    .state('app.adduser', {
        url: "/adduser",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/adduser.html",
                controller: 'RegisterCtrl'
            }
        }
    })    
    
     .state('app.myprofile', {
        url: "/myprofile",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/myprofile.html",
                controller: 'profilePersonalCtrl'
            }
        }
    })   
     
      .state('app.schemes', {
        url: "/schemes",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/schemes.html",
                controller: 'SchemeCtrl'
            }
        }
    }) 
     
       
     .state('app.showuser', {
        url: "/user/:roomId",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard/showuser.html",
                controller: 'UserCtrl'
            }
        }
    })        
    .state('app.room', {
        url: "/room/:roomId",
        views: {
            'menuContent': {
                templateUrl: "templates/Chat/room.html",
                controller: 'RoomCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/about');

});
