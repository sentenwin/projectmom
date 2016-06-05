angular.module('ionizer-chat.controllers', ['ionizer-chat.services', 'ionizer-chat.servicefirebase'])



.controller('AppCtrl', function($scope, $ionicModal, firebaseservice, $state, $cordovaCamera, $ionicSlideBoxDelegate, $localstorage) {

    // Initilaze Variables
    $scope.loggedUser = {};
    $scope.authUser = {};
    $scope.username = '';
    $scope.UserRole = $localstorage.get('role');
       $scope.user = {};
    $scope.defAvatar = 'img/avatars/avatar.png';


    firebaseservice.firebaseObj().onAuth(function(authData) {
        console.log(authData);

        if (authData) {
            console.log($scope.authUser);
            if (!$scope.authUser.hasOwnProperty('uid')) {
                console.log($scope.authUser.uid, 'No AuthUser yet');

                $scope.authUser = authData;
                firebaseservice.getPersonalInfoUID(authData)
                    .then(function(returnData) {
                        $scope.loggedUser = returnData;

                        console.log($scope.loggedUser);

                        $scope.loggedUser.$loaded().then(function(returnData) {
                            if (returnData.personalData.username) {
                                $scope.username = returnData.personalData.username;
                                $scope.UserRole = returnData.personalData.role;
                            } else if (returnData.personalData.first_name) {
                                $scope.username = returnData.personalData.first_name;
                                $scope.UserRole = returnData.personalData.role;
                            } else {
                                $scope.username = returnData.$id;
                                $scope.UserRole = returnData.personalData.role;
                            }
                            console.log('User type ' + $scope.UserRole);
                            $localstorage.set('role', $scope.UserRole );
                            $localstorage.set('userid', $scope.loggedUser.$id);

                        })


                    });
            } else {
                console.log($scope.authUser.uid, 'Udah ada nih');
            };

        } else {
            if (typeof $scope.loggedUser.$destroy === "function") {
                // safe to use the function
                $scope.loggedUser.$destroy();
            }
            $scope.authUser = {};
            $scope.username = '';
            $state.go('login');
        }
    });

    // Create the Intro modal
    $ionicModal.fromTemplateUrl('templates/intro.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modalIntro = modal;
        if ($localstorage.get('showTutorial') === 'true') {
            $scope.modalIntro.show();
        }
    });


    $scope.closeIntro = function() {
        $scope.modalIntro.hide();
    };


    $scope.showIntro = function() {
        $scope.modalIntro.show();
    };

    $scope.startApp = function() {
        $scope.modalIntro.hide();
    };

    $scope.next = function() {                                                                                                                                
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };

    // Initiate the show Tutorial Toggle from localStorage and the Save to local storage on Toggle Function
    if (typeof $localstorage.get('showTutorial') === "undefined") {
        $localstorage.set('showTutorial', true);
    };

    $scope.showTutorial = {
        checked: $localstorage.get('showTutorial') === 'true'
    };

    $scope.saveCheck = function() {
        $localstorage.set('showTutorial', $scope.showTutorial.checked);
    };

    $scope.IsAdmin = function(){
        var role = $scope.UserRole == "Admin"
        if (role) {
            console.log('He is Admin');
        } else {
            //console.log($scope.UserRole);
        }
    return $scope.UserRole == "Admin";
    }

    $scope.IsUser = function(){
        var role = $scope.UserRole == "GeneralUser"
        if (role) {
            console.log('He is GeneralUser');
        } else {
            //console.log($scope.UserRole);
        }
        return $scope.UserRole == "GeneralUser";
    }

   
    // Create the settings modal which is used for Profile Settings
    $ionicModal.fromTemplateUrl('templates/settings.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Create the avatar Modal which is used for Avatar changes
    $ionicModal.fromTemplateUrl('templates/avatar.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.avatarmodal = modal;
    });

    // Open the login modal
    $scope.showAvatar = function() {
        $scope.avatarmodal.show();
    };

    // The Logout BUtton
    $scope.logout = function() {
        firebaseservice.firebaseObj().unauth(firebaseservice.unAuthCallback());
        $localstorage.set('logged', false);
        $state.go('login');
    };

    // Triggered in the login modal to close it
    $scope.closeAvatar = function() {
        $scope.avatarmodal.hide();
    };

    // Open the login modal
    $scope.showSettings = function() {
        $scope.modal.show();
    };

    $scope.closeSettings = function() {
        $scope.modal.hide();
    };

    // Perform the save profile action when the user submits the form
    $scope.saveSettings = function() {

        $scope.loggedUser.$save().then(function() {
            console.log('Profile saved to Firebase!');
            $ionicPopup.alert({
              title: 'Confirmation Message',
              content: 'Profile Saved successfully!!!'
            }).then(function(res) {
              console.log('Test Alert Box');
            });

            if ($scope.loggedUser.username) {
                $scope.username = $scope.loggedUser.personalData.username;
            } else if ($scope.loggedUser.personalData.first_name) {
                $scope.username = $scope.loggedUser.personalData.first_name;
            } else {
                $scope.username = $scope.loggedUser.$id;
            }

        }).catch(function(error) {
            console.log('Error Saving!');
        });

        $scope.closeSettings();

    };


    // Getting the image
    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        console.log(imageName, name, trueOrigin);
        return trueOrigin;
    }

    // Get Image for Avatar
    $scope.getImage = function(cameraType) {

        if (cameraType == 'CAMERA') {
            var options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
            };
        } else {
            var options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
            };
        }


        $cordovaCamera.getPicture(options).then(function(imageData) {

            //onImageSuccess(imageData);

            firebaseservice.updatePersonalAvatar($scope.loggedUser.$id, imageData).then(
                function(returnData) {
                    console.log(returnData);
                    $scope.closeSettings();
                }
            )

            /*
            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
            }

            function copyFile(fileEntry) {
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;

                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                        fileEntry.copyTo(
                            fileSystem2,
                            newName,
                            onCopySuccess,
                            fail
                        );
                    },
                    fail);
            }

            function onCopySuccess(entry) {
                $scope.$apply(function() {
                    $scope.loggedUser.avatar = $scope.urlForImage(entry.nativeURL);
                    $localstorage.set('avatarLocal', $scope.loggedUser.avatar);
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            } */

        }, function(err) {
            console.log(err);
        });
    }

})

.controller('LoginCtrl', function($scope, $rootScope, $firebaseAuth, firebaseservice,  $ionicPopup, $location, $state, $localstorage) {

    $scope.user = {};

    $scope.SignOther = function(provider) {

        firebaseservice.signOther(provider)
            .then(function(authData) {
                console.log("Authenticated successfully with payload:", authData);
                $state.go('app.about');
            }, function(error) {
                console.log("Login Failed!", error);
            });

    }

    $scope.SignIn = function(e) {
        e.preventDefault();
        $scope.usertype = {};
        var username = $scope.user.email;
        var password = $scope.user.password;

        firebaseservice.signIn(username, password)
            .then(function(authData) {
                console.log("Authenticated successfully with payload:", authData);

                firebaseservice.getPersonalInfoUID(authData)
                    .then(function(returnData) {

                        $scope.usertype = returnData;
                         $scope.usertype.$loaded().then(function(returnData) {
                            if (returnData.personalData.username) {
                                role = returnData.personalData.role;
                            } else if (returnData.personalData.first_name) {
                                role = returnData.personalData.role;
                            } else {
                                role = returnData.personalData.role;
                            }
                            console.log('User type ' + role);
                            $localstorage.set('role', role );
                            console.log('User role from firebase ' +role );
                            console.log('User role from localStorage '+ $localstorage.get('role'));                          

                        })                                               
                });

                $state.go('app.about');
            }, function(error) {
                $scope.regError = true;
                $scope.regErrorMessage = error.message;
                console.log("Login Failed!", error);

                 $ionicPopup.alert({
              title: 'Error Message',
              content:  $scope.regErrorMessage
            }).then(function(res) {
              console.log('Test Alert Box');
            });
            });

            $scope.user.email = null ;
            $scope.user.password = null;
    }
})


.controller('RegisterCtrl', function($scope, $state, firebaseservice, $ionicPopup) {

    $scope.regForm = {};
    $scope.user = {};
  $scope.clientSideList = [
    { text: "Admin", value: "Admin" },
    { text: "GeneralUser", value: "GeneralUser" }
   // { text: "ProUser", value: "ProUser" },
    //{ text: "ControlUser", value: "ControlUser" }
  ];
  $scope.data = {
    clientSide: 'ng'
  };
  
    $scope.SignUp = function() {

        var username = $scope.user.email;
        var password = $scope.user.password;
        var first_name = ' ';
        var last_name = ' ';
        var number = ' ';
         var address = ' ';
        var role = $scope.data.clientSide;


        console.log('User role ' + role);
        console.log($scope.user);

       firebaseservice.signUp(username, password, first_name, last_name, number, address, role )
            .then(function(authData) {
                console.log("User " + authData.uid + " created successfully!", authData);
            $ionicPopup.alert({
              title: 'User Added',
              content: 'User added successfully!!!'
            }).then(function(res) {
              console.log('Test Alert Box');
            });
               // $state.go('login');
            }, function(error) {
                $scope.regError = true;
                $scope.regErrorMessage = error.message;
                console.log("SignUp Failed!", error);
                            $ionicPopup.alert({
              title: 'Fail to add user',
              content: 'Not able to add try later!!!'
            }).then(function(res) {
              console.log('Test Alert Box');
            });
            });

           $scope.user.email = null;
           $scope.user.password = null;
          
    }

})

.controller('ForgotCtrl', function($scope, $firebaseAuth, $state, firebaseservice,  $ionicPopup) {

    $scope.forgotForm = {};
    $scope.user = {};

    $scope.Forgot = function() {

        var email = $scope.user.email;

        firebaseservice.forgot(email)
            .then(function() {
                console.log("Email Sent!");
                $state.go('login');
            }, function(error) {
                $scope.regError = true;
                $scope.regErrorMessage = error.message;
                console.log("Forgot Password Failed!", error);

                 $ionicPopup.alert({
              title: 'Error Message',
              content:  $scope.regErrorMessage
            }).then(function(res) {
              console.log('Test Alert Box');
            });

            });
    }

})

.controller('UserCtrl', ['$scope', '$state', '$stateParams', 'firebaseservice', function($scope, $timeout, firebaseservice,  $stateParams){
    console.log('Requested user details');
   $scope.userdetails = firebaseservice.userList().getRecord($stateParams.userId);  
   console.log($scope.userdetails);

}])

.controller('TabsPageController', ['$scope', '$state', function($scope, $state) {}])

.controller('HomeCtrl', function($scope, $timeout, firebaseservice, $ionicModal, $stateParams, $ionicPopup, $localstorage) {

    $scope.room = {};
    $scope.rooms = firebaseservice.roomList();
    $scope.alluser = firebaseservice.userList();
    $scope.userdetails = firebaseservice.userList();
   // $scope.slot = firebaseservice.getSlot();
   // $scope.slot.booked = [{slotId:'OP-01', userId:' ', vechile:'KA-1234', stiming:' ', etiming:' ', booked:false}];
    //$scope.slot.available = ' '; 
    /*$scope.slot.cars = [
                          {slotId:'OP-01', userId:' ', vechile:'KA-1234', stiming:' ', etiming:' ', booked:false}
                            ];*/

    console.log('Showing all the user details');
    console.log($scope.alluser);
    // Create the settings modal which is used for Chat Room Settings
    $ionicModal.fromTemplateUrl('templates/Chat/newRoom.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // Open the login modal
    $scope.showNewRoom = function() {
        $scope.modal.show();

    };

    $scope.closeNewRoom = function() {
        $scope.modal.hide();
    };

    // Perform the save profile action when the user submits the form
    $scope.saveNewRoom = function() {
        console.log('Saving Settings', $scope.profile);

        firebaseservice.createRoom($scope.room).then(
            function(returnData) {
                console.log(returnData);
                $scope.closeNewRoom();
            }
        )
    };
     // Perform the save profile action when the user submits the form



    function showMessage(title, content) {

            $ionicPopup.alert({
              title: title,
              content: content
            }).then(function(res) {
              console.log('Test Alert Box');
            });
    };

  

})

.controller('AboutCtrl', function($scope, $timeout, firebaseservice, $ionicModal) {

    $scope.aboutus = {};
    console.log("Hi i am in aboutctrl");
    $scope.aboutus = firebaseservice.aboutus();


})
.controller('TipsCtrl', function($scope, $timeout, firebaseservice, $ionicModal, $stateParams) {

    $scope.healthtips = {};
   // $scope.trimesters = {};
     // $scope.trimester = {};
    console.log("Hi i am in growthctrl");
   
    $scope.healthtips = firebaseservice.getTips();

 //    $scope.tips = firebaseservice.getTipsdata($stateParams.tipsid);


})


.controller('GrowthCtrl', function($scope, $timeout, firebaseservice, $ionicModal, $stateParams) {

    $scope.babygrowth = {};
   // $scope.trimesters = {};
     // $scope.trimester = {};
    console.log("Hi i am in growthctrl");
   
    $scope.babygrowth = firebaseservice.getgrowthpage();

     $scope.growth = firebaseservice.getgrowth($stateParams.growthid);

          $scope.trimesters = firebaseservice.getTrimester();

     $scope.trimester = firebaseservice.getTrimesterdata($stateParams.trimesterid);

       $scope.about = firebaseservice.abouttrimester();



})

.controller('SchemeCtrl', function($scope, $timeout, firebaseservice, $ionicModal, $ionicPopup, $state) {

    $scope.schemes = {};
    console.log("Hi i am in SchemeCtrl");
      
    $scope.gscheme = firebaseservice.getScheme();
    console.log("scheme", $scope.gscheme);

    $scope.schemes.name =  $scope.schemes.name;
    $scope.schemes.benefit =  $scope.schemes.benefit;  
    $scope.addScheme = function(schemes) {       
        console.log('Saving Schemes', $scope.schemes);
        firebaseservice.createScheme($scope.schemes).then(
            function(returnData) {
                console.log(returnData);
               // showMessage(' Schemes Added')
                $ionicPopup.alert({
              title: 'Scheme Added',
              content: 'Scheme added successfully!!!'
            }).then(function(res) {
              console.log('Test Alert Box');
            });

           // $state.go('app.schemes');
             $scope.schemes.name =  " ";
   $scope.schemes.benefit =  " "; 
            }
        )
    };
  


})
.controller('UserCtrl',['$scope', '$ionicActionSheet', '$state', '$stateParams', 'firebaseservice', '$ionicScrollDelegate', '$timeout',  function($scope, $ionicActionSheet, $state, $stateParams, firebaseservice, $ionicScrollDelegate, $timeout) {
    console.log("Hi i am in userctrl");


    $scope.checkupdata = firebaseservice.getCheckup();
    console.log("checkupdata", $scope.checkupdata);

     console.log('i am getting user details');
    $scope.userdetails = firebaseservice.getUser($stateParams.roomId); 
    console.log("userdetails", $scope.userdetails);


   // Get Chat Data
    firebaseservice.getUser($stateParams.roomId)
        .then(function(returnData) {
            $scope.userdetails = returnData;
        });
  $scope.checkup = {};
  $scope.checkupdetails = function(checkup) {
        //console.log('i am getting  user checkup details');
       // $scope.user = {};
   console.log('i am getting  user checkup details');
   $scope.userdetails = firebaseservice.getUser($stateParams.roomId);
   console.log(' userdetails', $scope.userdetails);  

 $scope.checkup.date =   $scope.checkup.date;
 $scope.checkup.detail =  $scope.checkup.detail;
 $scope.checkup.userId =   $stateParams.roomId;
  //$scope.checkup.username =  $scope.user.personalData.first_name; 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   $stateParams.roomId;

 console.log(' CheckupDate', $scope.checkup);
  firebaseservice.setUser($scope.checkup)
        .then(function(returnData) {
             console.log('usercheckup detail updated');
             console.log(returnData);
                   // showMessage("Slot Booking Confirmation", "You slot booked Successfully slot ID "+item.slotid);
                }
            )

    };



}])
.controller('CheckupCtrl',['$scope', '$ionicActionSheet', '$state', '$stateParams', 'firebaseservice', '$ionicScrollDelegate', '$timeout',  function($scope, $ionicActionSheet, $state, $stateParams, firebaseservice, $ionicScrollDelegate, $timeout) {
    console.log("Hi i am in checkupctrl");


    $scope.checkupdata = firebaseservice.getCheckup();
    console.log("checkupdata", $scope.checkupdata);

  /*   console.log('i am getting user details');
    $scope.userdetails = firebaseservice.getUser($stateParams.roomId); 
    console.log("userdetails", $scope.userdetails);


   // Get Chat Data
    firebaseservice.getUser($stateParams.roomId)
        .then(function(returnData) {
            $scope.userdetails = returnData;
        });*/
  $scope.checkup = {};
  $scope.checkupdetails = function(checkup) {
        //console.log('i am getting  user checkup details');
       // $scope.user = {};
   console.log('i am getting  user checkup details');
   $scope.userdetails = firebaseservice.getUser($stateParams.roomId);
   console.log(' userdetails', $scope.userdetails);  

 $scope.checkup.date =   $scope.checkup.date;
 $scope.checkup.detail =  $scope.checkup.detail;
 $scope.checkup.userId =   $stateParams.roomId;
  //$scope.checkup.username =  $scope.user.personalData.first_name; 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   $stateParams.roomId;

 console.log(' CheckupDate', $scope.checkup);
  firebaseservice.setUser($scope.checkup)
        .then(function(returnData) {
             console.log('usercheckup detail updated');
             console.log(returnData);
                   // showMessage("Slot Booking Confirmation", "You slot booked Successfully slot ID "+item.slotid);
                }
            )

    };



}])


.controller('RoomCtrl', ['$scope', '$ionicActionSheet', '$state', '$stateParams', 'firebaseservice', '$ionicScrollDelegate', '$timeout',  function($scope, $ionicActionSheet, $state, $stateParams, firebaseservice, $ionicScrollDelegate, $timeout) {

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    $scope.newMessage = "";
    $scope.chatUser = [];
    $scope.chats = firebaseservice.chatRoomArray($stateParams.roomId);

   
    $scope.chats.$watch(function(event) {
        //console.log($scope.chats);

        for (var i = 0; i < $scope.chats.length; i++) {

            var findMe = $scope.chats[i].created_by;

            if (!$scope.chatUser[findMe]) {

                //Put a Default Image of something
                $scope.chatUser[findMe] = {
                    avatar: $scope.defAvatar,
                    avatar_personal: ''
                };

                firebaseservice.getPersonalInfo(findMe)
                    .then(function(returnData) {

                        if (!returnData) {
                            $scope.chatUser[findMe] = {
                                avatar: $scope.defAvatar,
                                avatar_personal: ''
                            };
                        } else {
                            console.log(returnData);
                            if (!returnData.avatar) {
                                $scope.chatUser[findMe].avatar = $scope.defAvatar;
                            } else {
                                $scope.chatUser[findMe].avatar = returnData.avatar;
                            }

                            if (!returnData.avatar_personal) {
                                $scope.chatUser[findMe].avatar_personal = '';
                            } else {
                                $scope.chatUser[findMe].avatar_personal = returnData.avatar_personal;
                            }

                            console.log($scope.chatUser[findMe]);
                        }
                    })
            }
        }

        $timeout(function() {
            scrollBottom();
        }, 1000);



    });
   $scope.IsAdmin = function(){
        var role = $scope.UserRole == "Admin"
        if (role) {
            console.log('He is Admin');
        } else {
            //console.log($scope.UserRole);
        }
    return $scope.UserRole == "Admin";
    }




    var scrollBottom = function() {
        // Resize and then scroll to the bottom
        $ionicScrollDelegate.resize();
        $timeout(function() {
            $ionicScrollDelegate.scrollBottom();
            console.log('scrolled');
        });

    };

    $scope.submitAddMessage = function() {

        console.log($scope.loggedUser.$id, $scope.username, this.newMessage);

        $scope.chatObj.push({
            created_by: $scope.loggedUser.$id,
            username: $scope.username,
            content: this.newMessage,
            created_at: Firebase.ServerValue.TIMESTAMP
        });
        this.newMessage = "";
        //scrollBottom();
    };


    // Get Chat Data
    firebaseservice.chatRoom($stateParams.roomId)
        .then(function(returnData) {
            $scope.chatObj = returnData;
        })
        .finally(function() {
            $timeout(function() {
                scrollBottom();
            }, 5000);
        });

    // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
        console.log('keepKeyboardOpen');
        txtInput.one('blur', function() {
            console.log('textarea blur, focus back on it');
            txtInput[0].focus();
        });
    }

    $scope.onMessageHold = function(e, itemIndex, message) {
        console.log('onMessageHold');
        console.log('message: ' + JSON.stringify(message, null, 2));

        $ionicActionSheet.show({
            buttons: [{
                text: 'Copy Text'
            }, {
                text: 'Delete Message'
            }],
            buttonClicked: function(index) {

                switch (index) {
                    case 0: // Copy Text
                        //cordova.plugins.clipboard.copy(message.text);

                        break;
                    case 1: // Delete
                        // no server side secrets here :~)
                        $scope.messages.splice(itemIndex, 1);
                        $timeout(function() {
                            viewScroll.resize();
                        }, 0);

                        break;
                }

                return true;
            }
        });
    };

    // TO DO
    $scope.viewProfile = function(msg) {
        if (msg.created_by === $scope.loggedUser.$id) {
            // go to your profile
            console.log('should go to my Profile!');
        } else {
            // go to other users profile
            console.log('should go to other user Profile!');
        }
    };

    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function(e, ta) {
        console.log('taResize');
        if (!ta) return;

        var taHeight = ta[0].offsetHeight;
        console.log('taHeight: ' + taHeight);

        if (!footerBar) return;

        var newFooterHeight = taHeight + 10;
        newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

        footerBar.style.height = newFooterHeight + 'px';
        scroller.style.bottom = newFooterHeight + 'px';
    });

}])


// fitlers
.filter('nl2br', ['$filter',
    function($filter) {
        return function(data) {
            if (!data) return data;
            return data.replace(/\n\r?/g, '<br />');
        };
    }
])

function onProfilePicError(ele) {
    //this.ele.src = ''; // set a fallback
    //$scope.defAvatar
    console.log(this.ele);
}

// configure moment relative time
moment.locale('en', {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%d sec",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
    }
});
