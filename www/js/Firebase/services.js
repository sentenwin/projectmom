angular.module('ionizer-chat.servicefirebase', ['ionizer-chat.services'])
    .value('FIREBASE_REF', 'https://smappalpha.firebaseIO.com')

.factory('firebaseservice', function($firebase, $firebaseAuth, FIREBASE_REF, $q, $firebaseArray, $firebaseObject) {


    var firebaseObj = new Firebase(FIREBASE_REF);
    var refUsers = new Firebase(FIREBASE_REF + "/users");
    var refUserMappings = new Firebase(FIREBASE_REF + "/userMappings");

    var refRooms = new Firebase(FIREBASE_REF + "/rooms");
    var refSlots = new Firebase(FIREBASE_REF + "/parkingSlots");
      var refSchemes = new Firebase(FIREBASE_REF + "/schemes");
       var refCheckup = new Firebase(FIREBASE_REF + "/checkupdata");
    var loginObj = $firebaseAuth(firebaseObj);
    var auth = {};
    //var checkupdata = {};
    var defAvatar = 'img/avatars/avatar.png';

    var createUser = function(authData, provider) {

        var deferred = $q.defer();

        switch (provider) {

            case 'password':

                var objPersonal = {
                    email: authData.password.email,
                    first_name:authData.password.first_name,
                    last_name: authData.password.last_name,
                    number: authData.password.number,
                    address: authData.password.address,
                    role: authData.password.role
                };
                var objUserMappings = {
                    password: authData.uid
                };
                 
                console.log("Creating new user");
                console.log(objPersonal);

                break;

            case 'twitter':

                var objPersonal = {
                    first_name: authData.twitter.displayName,
                    avatar: authData.twitter.cachedUserProfile.profile_image_url_https
                };
                var objUserMappings = {
                    twitter: authData.uid
                };

                break;

            case 'facebook':

                var objPersonal = {
                    first_name: authData.facebook.cachedUserProfile.first_name,
                    last_name: authData.facebook.cachedUserProfile.last_name,
                    email: authData.facebook.email,
                    avatar: authData.facebook.cachedUserProfile.picture.data.url
                };
                var objUserMappings = {
                    facebook: authData.uid
                };

                break;

            case 'google':

                var objPersonal = {
                    first_name: authData.google.cachedUserProfile.given_name,
                    last_name: authData.google.cachedUserProfile.family_name,
                    email: authData.google.email,
                    avatar: authData.google.cachedUserProfile.picture
                };
                var objUserMappings = {
                    google: authData.uid
                };

                break;

        }

        var newPostRef = refUsers.push({
            personalData: objPersonal,
            userMappings: objUserMappings,
           // checkupdata: objcheckup
        });

        console.log(objPersonal, objUserMappings);

        refUserMappings.child(authData.uid).set({
            user: newPostRef.key()
        }, function(error) {
            if (error) {
                console.log('Create User failed');
            } else {
                console.log('Create User succeeded');
            }
        });

        var auth = {
            avatar: objPersonal.avatar,
            first_name: objPersonal.first_name,
            user_id: newPostRef.key()
        };

        deferred.resolve(auth);

        return deferred.promise;
    }

    var getPersonalInfo = function(user_id) {

        var deferred = $q.defer();

        refUsers.child(user_id).child('personalData').once("value", function(snap) {
            deferred.resolve(snap.val());
        }, function(errorObject) {
            deferred.reject("The read failed: " + errorObject.code);
        });

        return deferred.promise;
    }

    return {
        firebaseObj: function() {
            return firebaseObj;
        },
        loginObj: function() {
            return loginObj;
        },
        signOther: function(provider) {

            var deferred = $q.defer();

            firebaseObj.authWithOAuthPopup(provider, function(error, authData) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(authData);
                }
            }, {
                scope: "email"
            });

            return deferred.promise;
        },
        linkOther: function(provider, user_id) {

            var deferred = $q.defer();
            var userMapping = {};

            firebaseObj.authWithOAuthPopup(provider, function(error, authData) {
                if (error) {
                    deferred.reject(error);
                } else {

                    // Should check in future if Account was already used before
                    refUserMappings.child(authData.uid).once('value', function(snap) {
                        if (snap.val()) {
                            deferred.reject('Already Linked to Another Account!');
                        } else {
                            refUserMappings.child(authData.uid).set({
                                user: user_id
                            });

                            userMapping[provider] = authData.uid;
                            console.log(userMapping);

                            refUsers.child(user_id).child("userMappings").update(userMapping);

                            deferred.resolve(authData);
                        }
                    });
                }
            }, {
                scope: "email"
            });

            return deferred.promise;
        },
        unlinkOther: function(provider, validateSocial, user_id) {

            var deferred = $q.defer();
            var userMapping = {};

            refUserMappings.child(validateSocial).remove(function(error) {
                if (error) {
                    deferred.reject(error);
                } else {

                    refUsers.child(user_id).child("userMappings").child(provider).remove(function(error) {
                        if (error) {
                            deferred.reject(error);
                        } else {
                            deferred.resolve("Unlink Success");
                        }
                    })
                }
            });

            return deferred.promise;
        },
        signIn: function(user, password) {

            var deferred = $q.defer();
            var provider = '';

            firebaseObj.authWithPassword({
                email: user,
                password: password
            }, function(error, authData) {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(authData);
                }
            });

            return deferred.promise;
        },
        signUp: function(user, password, first_name, last_name, number, address, role) {

            var deferred = $q.defer();
            var provider = "password";

            loginObj.$createUser({
                email: user,
                password: password
            }).then(function(authData) {
                console.log('createUser done', authData);

                authData.password = {
                    email: user, 
                    first_name: first_name,
                    last_name: last_name,
                    number: number,
                    address: address,
                    role: role
                };

                createUser(authData, provider)
                    .then(function(returnData) {
                        console.log('User Created with:', returnData);
                    });

                deferred.resolve(authData);
            }).catch(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },
        forgot: function(user) {

            var deferred = $q.defer();

            loginObj.$resetPassword({
                email: user
            }).then(function() {
                deferred.resolve();
            }).catch(function(error) {
                deferred.reject(error);
            });

            return deferred.promise;
        },
        unAuthCallback: function() {

        },
        authDataCallback: function(authData) {
            if (authData) {
                console.log("Checking from Callback: User " + authData.uid + " is logged in with " + authData.provider);

                refUserMappings.child(authData.uid).once("value", function(snap) {
                    console.log(snap.val());

                    getPersonalInfo(snap.val().user).then(
                        function(returnData) {
                            auth.user = returnData.first_name;
                            auth.avatar = returnData.avatar;
                        }
                    );

                });

            } else {
                auth.user = null;
                auth.avatar = defAvatar;
                console.log("User is logged out");
            }

        },
        getPersonalInfo: function(user_id) {

            var deferred = $q.defer();

            getPersonalInfo(user_id).then(
                function(returnData) {
                    deferred.resolve(returnData);
                },
                function(error) {
                    deferred.reject(error);
                }
            );

            return deferred.promise;
        },
        getPersonalInfoUID: function(authData) {

            var deferred = $q.defer();

            refUserMappings.child(authData.uid).once('value', function(snap) {
                if (snap.val()) {

                    deferred.resolve($firebaseObject(refUsers.child(snap.val().user)));

                } else {
                    // No User Data yet, create the User
                    console.log('No User Data yet, Create User');
                    createUser(authData, authData.provider)
                        .then(function(returnData) {
                            console.log('User Created with:', returnData);
                            deferred.resolve($firebaseObject(refUserMappings.child(returnData.user_id)));
                        });
                }
            });

            return deferred.promise;
        },
        getSocial: function(user_id) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('userMappings').once("value", function(snap) {
                console.log(snap.val());
                deferred.resolve(snap.val());
            }, function(errorObject) {
                deferred.reject("The read failed: " + errorObject.code);
            });

            return deferred.promise;
        },
        updatePersonalInfo: function(user_id, personalData) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('personalData').update({
                first_name: personalData.first_name,
                last_name: personalData.last_name,
                email: personalData.email,
                username: personalData.username
            }, function(error) {
                if (error) {
                    deferred.reject("Data could not be saved." + error);
                } else {
                    deferred.resolve("Data saved successfully.");
                }
            });

            return deferred.promise;
        },
         updateCheckupInfo: function(user_id, personalData) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('personalData').update({
                first_name: personalData.first_name,
                last_name: personalData.last_name,
                email: personalData.email,
                username: personalData.username,

            }, function(error) {
                if (error) {
                    deferred.reject("Data could not be saved." + error);
                } else {
                    deferred.resolve("Data saved successfully.");
                }
            });

            return deferred.promise;
        },
        updatePersonalAvatar: function(user_id, imageData) {

            var deferred = $q.defer();

            refUsers.child(user_id).child('personalData').update({
                avatar_personal: imageData
            }, function(error) {
                if (error) {
                    deferred.reject("Data could not be saved." + error);
                } else {
                    deferred.resolve("Data saved successfully.");
                }
            });

            return deferred.promise;
        },
        storeInformation: function(provider) {
            switch (provider) {
                case 'password':
                    return authData.password.email.replace(/@.*/, '');
                case 'twitter':
                    return authData.twitter.cachedUserProfile.profile_image_url_https;
                case 'facebook':

                    return authData.facebook.cachedUserProfile.picture.data.url;
                case 'google':
                    return authData.google.cachedUserProfile.picture;
            }

        },
        chatRoom: function(roomId) {

            var deferred = $q.defer();

            var refChats = new Firebase(FIREBASE_REF + "/rooms/" + roomId + "/chat");

            deferred.resolve(refChats);

            return deferred.promise;
        },
        chatRoomArray: function(roomId) {

            var refChats = new Firebase(FIREBASE_REF + "/rooms/" + roomId + "/chat");

            return $firebaseArray(refChats);
        },
        getUser: function(userId) {

             var deferred = $q.defer();

            refUsers.child(userId).child('personalData').once("value", function(snap) {
                console.log("Successfully got the personalData");
                console.log(snap.val());
                deferred.resolve(snap.val());
            }, function(errorObject) {
                deferred.reject("The read failed: " + errorObject.code);
            });

            return deferred.promise;
        },

  /*   setUser: function(user_id, userdetail, checkupData, checkupdetail, checkupdate) {
     var deferred = $q.defer();
    // var refusercheckup = new Firebase(FIREBASE_REF + "/users/" + user_id + "/checkupData");

          
           /*  var checkupdata = {
                 checkupdate: userdetail.checkupdate,
                checkupdetail: userdetail.checkupdetail,
                checkupid: userdetail.checkupid
             };*/

          //   Array.prototype.push.apply(personalData, checkupdata);
           // checkupdata.$save();
      //        var checkupdatas = $firebaseArray(refUsers);
             // var checkupdatas =    refUsers.child(user_id).child('usercheckup').$add()({
   /*     refCheckup.$push()({
                 checkupdate: userdetail.checkupdate,
                checkupdetail: userdetail.checkupdetail,
                checkupid: userdetail.checkupid
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("checkupdata could not be saved." + errorObject);
                } else {
                    deferred.resolve("checkupdata saved successfully.");
                }
            });
  deferred.resolve(refusercheckup);
          
            return deferred.promise;

        },*/

  /*      createcheckup: function(checkupid , checkupdate, userdetail, checkupdetail, user_id) {

            var deferred = $q.defer();
              var refusercheckup = new Firebase(FIREBASE_REF + "/users/" + user_id + "/checkupData");

            refusercheckup.push({
               checkupdate: userdetail.checkupdate,
                checkupdetail: userdetail.checkupdetail,
                checkupid: userdetail.checkupid
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("Room could not be saved." + errorObject);
                } else {
                    deferred.resolve("Room saved successfully.");
                }
            });

            return deferred.promise;
        },*/

 setUser: function( checkup) {
             var deferred = $q.defer();9
             refCheckup.push({
                Date: checkup.date,
                Detail: checkup.detail,
                UserId: checkup.userId
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("checkupdata could not be saved." + errorObject);
                } else {
                    deferred.resolve("checkupdata saved successfully.");
                }
            });

           
            return deferred.promise;

        },

        roomList: function() {
            return $firebaseArray(refRooms);
        },
        userList: function() {
            return $firebaseArray(refUsers);
        },


        aboutus: function() {
         aboutpage = [
            {
                "name": "About SaveMom",
                "description": "A digital medical assistant for pregnant ladies,  It makes simple and easy for them to get the right treatment at right time, ",
            },
              {
                "name": "SaveMom Provides",
                "description": "Continuous checkup tracking, Arrange free pick up to hospitals, Health food Tips, Create awareness about Govt. schemes. ",
            }

        ];
            return aboutpage;

        },

        abouttrimester: function() {
         about = [
                 
            {
                "name": "About Trimester",
                "description": "A normal, full-term pregnancy can range from 37-42 weeks and is divided into three trimesters, counting from the first day of your last normal period. what's happening with you and your baby in these three stages",
            }

        ];
            return about;

        },

        getgrowthpage: function() {
         growth = [
                 {      
                    id: 0,
                    title1: " First trimester (week 1-week 12)",
                    title2: " Week 1",
                    Img:'img/bg/w1.jpg',
                    data: " Week 1 is actually your menstrual period, but because your due date is calculated from the first day of your last period, it counts as part of your 40‑week pregnancy."
                  },
                {
                    id: 1,
                    title1: null,
                    title2: " Week 2",
                    Img:'img/bg/w2.jpg',
                    data: "The end of this week is when you're most likely to conceive — this is the midpoint of a typical menstrual cycle, when ovulation happens and conditions are most favorable for fertilization of an egg by sperm."
                 },
                {
                    id: 2,
                    title1: null,
                    title2: "Week 3",
                    Img:'img/bg/w3.jpg',
                    data: "The rapidly dividing fertilized egg will look like a tiny ball when it reaches the uterus, and is then called a morula."
                   },
                     {
                    id: 3,
                    title1: null,
                    title2: " Week 4",
                    Img:'img/bg/w4.jpg',
                   data: "Your baby, or embryo, has two layers of cells — the epiblast and the hypoblast — that will develop into organs and body parts. Also developing are the amnion and the yolk sac. The embryo secretes a hormone to prevent your body from shedding the endometrium from your uterus — thus stopping menstruation."
                    },
                     {
                    id: 4,
                    title1: null,
                    title2: " Week 5",
                    Img:'img/bg/w5.jpg',
                     data: "The embryo begins to form a distinct shape that includes the neural tube, which will become the spinal cord and brain."
                   },
                     {
                    id: 5,
                    title1: null,
                    title2: " Week 6",
                    Img:'img/bg/w6.jpg',
                    data: "The heart will begin to beat about this time, and the beginnings of the digestive and respiratory systems are forming, as are small buds that will grow into arms and legs."
                    },
                     {
                    id: 6,
                    title1: null,
                    title2: " Week 7",
                    Img:'img/bg/w7.jpg',
                    data: "The umbilical cord has formed, and the mouth, nostrils, ears, and eyes are some of the facial features that become more defined this week. The arm bud now has a hand on the end of it, which looks like a tiny paddle."
                      },
                     {
                    id: 7,
                    title1: null,
                    title2: " Week 8",
                    Img:'img/bg/w8.jpg',
                    data: "The buds that will become your baby's genitals appear, although they haven't developed into either male or female organs. Symptoms such as a missed period, nausea, extreme fatigue, or tight clothes may make the reality of pregnancy hit home."
                    },
                    {
                    id: 8,
                    title1: null,
                    title2: " Week 9",
                    Img:'img/bg/w9.jpg',
                    data: "Your baby measures about 0.6 to 0.7 inches from crown to rump and weighs around 0.1 ounces. Your baby may make some first moves as muscles develop, but you won't feel them for several more weeks."
                    },
                     {
                    id: 9,
                    title1: null,
                    title2: " Week 10",
                    Img:'img/bg/w10.jpg',
                    data: "All vital organs have been formed and are starting to work together. Congenital abnormalities are unlikely to develop after week 10."
                 },
                {
                    id: 10,
                    title1: null,
                    title2: " Week 11",
                    Img:'img/bg/w11.jpg',
                    data: "If you saw a picture of your baby now, you'd think you had a genius on your hands — the baby's head accounts for about half of the body length!"
                  },
                     {
                    id: 11,
                    title1: null,
                    title2: " Week 12",
                    Img:'img/bg/w12.jpg',
                    data: "The end of this week is when you're most likely to conceive — this is the midpoint of a typical menstrual cycle, when ovulation happens and conditions are most favorable for fertilization of an egg by sperm."
                     },
                     {
                    id: 12,
                    title1: null,
                    title2: " Week 13",
                    Img:'img/bg/w13.jpg',
                    data: "As you begin the second trimester, your baby may be able to put a thumb in his or her mouth although the sucking muscles aren't completely developed yet."
                     },
                     {
                    id: 13,
                    title1: null,
                    title2: " Week 14",
                    Img:'img/bg/w14.jpg',
                    data: "Some fine hairs, called lanugo, have developed on your baby's face. This soft colorless hair protects the skin and will eventually cover most of your baby's body until it is shed just before delivery."
                     },
                     {
                    id: 14,
                    title1: null,
                    title2: " Week 15",
                    Img:'img/bg/w15.jpg',
                    data: "Muscle development continues, and your baby is probably making lots of movements with his or her head, mouth, arms, wrists, hands, legs, and feet."
                     },
                     {
                    id: 15,
                    title1: null,
                    title2: " Week 16",
                    Img:'img/bg/w16.jpg',
                    data: "Your baby can hold his or her head erect, and facial muscles now allow for a variety of expressions, such as squinting and frowning."
                     },
                        {
                    id: 16,
                    title1: null,
                    title2: " Week 17",
                    Img:'img/bg/w17.jpg',
                    data: "Your baby is still very tiny, reaching about 5.1 inches from crown to rump and weighing about 4.9 ounces this week."
                     },
                        {
                    id: 17,
                    title1: null,
                    title2: " Week 18",
                    Img:'img/bg/w18.jpg',
                    data: "Your baby's bones had been developing but were still soft. This week, they begin to harden, or ossify."
                     },
                        {
                    id: 18,
                    title1: null,
                    title2: " Week 19",
                    Img:'img/bg/w19.jpg',
                    data: "A waxy substance called vernix caseosa is covering your baby to help protect the delicate skin from becoming chapped or scratched."
                     },
                        {
                    id: 19,
                    title1: null,
                    title2: " Week 20",
                    Img:'img/bg/w20.jpg',
                    data: "You're now halfway through your pregnancy and possibly feeling your baby's first movements, which may begin between weeks 18 and 20."
                     },
                        {
                    id: 20,
                    title1: null,
                    title2: " Week 21",
                    Img:'img/bg/w21.jpg',
                    data: "The intestines are developed enough that small amounts of sugars can be absorbed from the fluid your baby swallows and passed through the digestive system to the large bowel."
                     },
                        {
                    id: 21,
                    title1: null,
                    title2: " Week 22",
                    Img:'img/bg/w22.jpg',
                    data: "Brain and nerve endings are formed enough so that the fetus can feel touch, while you might be feeling irregular, painless Braxton Hicks contractions, which aren't dangerous."
                     },
                        {
                    id: 22,
                    title1: null,
                    title2: " Week 23",
                    Img:'img/bg/w23.jpg',
                    data: "You may feel more forceful movements — your baby's daily workout routine includes moving the muscles in the fingers, toes, arms, and legs."
                     },
                        {
                    id: 23,
                    title1: null,
                    title2: " Week 24",
                    Img:'img/bg/w24.jpg',
                    data: "Inner‑ear development means your baby may be able to tell when he or she is upside down or right side up while floating and making movements in the amniotic fluid."
                     },
                        {
                    id: 24,
                    title1: null,
                    title2: " Week 25",
                    Img:'img/bg/w25.jpg',
                    data: "Your baby's hearing has developed to the point where he or she may now be able to hear your voice."
                     },
                        {
                    id: 25,
                    title1: null,
                    title2: " Week 26",
                    Img:'img/bg/w26.jpg',
                    data: "Your baby now weighs a little less than 2 pounds and measures about 9 inches from crown to rump."
                     },
                        {
                    id: 26,
                    title1: null,
                    title2: " Week 27",
                    Img:'img/bg/w27.jpg',
                    data: "This first week of the third trimester, your baby looks similar to what he or she will look like at birth, except thinner and smaller."
                     },
                        {
                    id: 27,
                    title1: null,
                    title2: " Week 28",
                    Img:'img/bg/w28.jpg',
                    data: "Your health care provider may tell you whether your baby is headfirst or feet‑ or bottom‑first (called breech position). Don't worry if your baby is in the breech position right now — most babies will switch positions on their own."
                     },
                        {
                    id: 28,
                    title1: null,
                    title2: " Week 29",
                    Img:'img/bg/w29.jpg',
                    data: "Your active baby's first few flutters of movement have given way to hard jabs and kicks that may take your breath away."
                     },
                        {
                    id: 29,
                    title1: null,
                    title2: " Week 30",
                    Img:'img/bg/w30.jpg',
                    data: "Your baby continues to gain weight and layers of fat that make the baby look less wrinkly and will provide warmth after birth."
                     },
                        {
                    id: 30,
                    title1: null,
                    title2: " Week 31",
                    Img:'img/bg/w31.jpg',
                    data: "Your baby urinates about 2 cups of pee a day into the amniotic fluid. By now, the milk glands in your breasts may have started to make colostrum, the milk that will feed the baby in the first few days if you decide to breastfeed."
                     },
                        {
                    id: 31,
                    title1: null,
                    title2: " Week 32",
                    Img:'img/bg/w32.jpg',
                    data: "At about 4 pounds and 11.4 inches from crown to rump, your baby would have an excellent chance of survival outside the womb if you delivered now."
                     },
                        {
                    id: 32,
                    title1: null,
                    title2: " Week 33",
                    Img:'img/bg/w33.jpg',
                    data: "Your baby sleeps much of the time and even experiences the rapid eye movement (REM) stage, the sleep stage during which our most vivid dreams happen."
                     },
                        {
                    id: 33,
                    title1: null,
                    title2: " Week 34",
                    Img:'img/bg/w34.jpg',
                    data: "Your baby is probably in position for delivery — your health care provider can tell you if your baby is positioned head‑ or bottom‑first."
                     },
                        {
                    id: 34,
                    title1: null,
                    title2: " Week 35",
                    Img:'img/bg/w35.jpg',
                    data: "Because of increasing size, your baby is now cramped and restricted inside the uterus. Fetal movements may decrease, but feel stronger and more forceful."
                     },
                        {
                    id: 35,
                    title1: null,
                    title2: " Week 36",
                    Img:'img/bg/w36.jpg',
                    data: "Fat on your baby's cheeks and powerful sucking muscles contribute to your baby's full face. Your appetite may return because the baby has dropped down into your pelvis, and is no longer putting as much pressure on your stomach and intestines."
                     },
                        {
                    id: 36,
                    title1: null,
                    title2: " Week 37",
                    Img:'img/bg/w37.jpg',
                    data: "This week, your baby is considered full‑term. If shown a bright light, your baby may turn toward it in your uterus."
                     },
                        {
                    id: 37,
                    title1: null,
                    title2: " Week 38",
                    Img:'img/bg/w38.jpg',
                    data: "Because your baby is engaged in your pelvis, your bladder is extremely compressed, making frequent bathroom trips a necessity."
                     },
                      {
                    id: 38,
                    title1: null,
                    title2: " Week 39",
                    Img:'img/bg/w39.jpg',
                    data: "Braxton Hicks contractions (also called false labor) may become more pronounced. These may be as uncomfortable and strong as true labor contractions but do not become regular and do not increase in frequency or intensity as true contractions do."
                     },

                      {
                    id: 39,
                    title1: null,
                    title2: " Week 40",
                    Img:'img/bg/w40.jpg',
                    data: "A baby born at 40 weeks weighs, on average, 7 pounds, 4 ounces and measures about 20 inches from head to toe."
                     },

               

        ];
            return growth;

        },   

         getgrowth: function(a) {
          
      for (var i = 0; i < growth.length; i++) {
        if (growth[i].id === parseInt(a)) {
          return growth[i];
        }
      }
      return null;
        },  

           getTrimester: function() {
         trimester = [
                   
                    {
                    id: 0,
                    title1: "First trimester",
                    title2: "week 1-week 12",
                    Img: "img/baby.jpg",
                    data: "During the first trimester your body undergoes many changes. Hormonal changes affect almost every organ system in your body. These changes can trigger symptoms even in the very first weeks of pregnancy. Your period stopping is a clear sign that you are pregnant. Other changes may include:",
                    data1: null, 
                    data2:"Extreme tiredness, Tender, Swollen breasts. Your nipples might also stick out, Cravings or distaste for certain foods,  Mood swings, Constipation(trouble having bowel movements), Need to pass urine more often, Mood swings, Heartburn, Weight gain or loss.",
            data3: "As your body changes, you might need to make changes to your daily routine, such as going to bed earlier or eating frequent, small meals. Fortunately, most of these discomforts will go away as your pregnancy progresses. And some women might not feel any discomfort at all! If you have been pregnant before, you might feel differently this time around. Just as each woman is different, so is each pregnancy."

                     },
                      {
                    id: 1,
                    title1: "Second trimester ",
                    title2: "week 13-week 28",
                   Img: "img/baby1.jpg",
                    data: "Most women find the second trimester of pregnancy easier than the first. But it is just as important to stay informed about your pregnancy during these months.",
                     data1: "You might notice that symptoms like nausea and fatigue are going away. But other new, more noticeable changes to your body are now happening. Your abdomen will expand as the baby continues to grow. And before this trimester is over, you will feel your baby beginning to move! As your body changes to make room for your growing baby, you may have:",                     
                   data2: "Body aches, such as back, abdomen, groin, or thigh pain, Stretch marks on your abdomen, breasts, thighs, or buttocks,  Darkening of the skin around your nipples,  Patches of darker skin, usually over the cheeks, forehead, nose, or upper lip. Patches often match on both sides of the face. This is sometimes called the mask of pregnancy. Numb or tingling hands, called carpal tunnel syndrome. Swelling of the ankles, fingers, and face. (If you notice any sudden or extreme swelling or if you gain a lot of weight really quickly, call your doctor right away. This could be a sign of preeclampsia.",
                    data3: null

                     },
                     {
                    id: 2,
                    title1: "Third trimester",
                   title2: "week 13-week 28",
                   Img: "img/baby2.jpg",
                    data: "You're in the home stretch! Some of the same discomforts you had in your second trimester will continue. Plus, many women find breathing difficult and notice they have to go to the bathroom even more often. This is because the baby is getting bigger and it is putting more pressure on your organs. Don't worry, your baby is fine and these problems will lessen once you give birth.",
                     data1: " Some new body changes you might notice in the third trimester include:",
                     data2: "Shortness of breath ,  Heartburn , Swelling of the ankles, fingers, and face. (If you notice any sudden or extreme swelling or if you gain a lot of weight really quickly, call your doctor right away. This could be a sign of preeclampsia. Hemorrhoids, Tender breasts, which may leak a watery pre-milk called colostrum (kuh-LOSS-struhm), Your belly button may stick out, The baby dropping, or moving lower in your abdomen",          
                     data3: "As you near your due date, your cervix becomes thinner and softer (called effacing). This is a normal, natural process that helps the birth canal (vagina) to open during the birthing process. Your doctor will check your progress with a vaginal exam as you near your due date. Get excited — the final countdown has begun!"

                     }
        ];
            return trimester;

        },


      /*  getTrimester: function() {
         trimester = [
                   
                    {
                    id: 0,
                    title1: "First trimester",
                     title2: "week 1-week 12",
                     Img: "img/baby.jpg",
                    data: "During the first trimester your body undergoes many changes. Hormonal changes affect almost every organ system in your body. These changes can trigger symptoms even in the very first weeks of pregnancy. Your period stopping is a clear sign that you are pregnant. Other changes may include:",
                     data1: null, 
                     subcontent: [  
                                {
                                   data2: "Extreme tiredness"
                                },
                                 {
                                   data2: "Tender, swollen breasts. Your nipples might also stick out"
                                },
                                 {
                                   data2: "Cravings or distaste for certain foods"
                                },
                                 {
                                   data2: "Mood swings"
                                },
                                 {
                                   data2: "Constipation (trouble having bowel movements)"
                                },
                                 {
                                   data2: "Need to pass urine more often"
                                },
                                 {
                                   data2: "Mood swings"
                                },
                                 {
                                   data2: "Heartburn"
                                },
                                 {
                                   data2: "Weight gain or loss"
                                }

                                ],
            data3: "As your body changes, you might need to make changes to your daily routine, such as going to bed earlier or eating frequent, small meals. Fortunately, most of these discomforts will go away as your pregnancy progresses. And some women might not feel any discomfort at all! If you have been pregnant before, you might feel differently this time around. Just as each woman is different, so is each pregnancy."

                     },
                      {
                    id: 1,
                    title1: "Second trimester ",
                    title2: "week 13-week 28",
                   Img: "img/baby1.jpg",
                    data: "Most women find the second trimester of pregnancy easier than the first. But it is just as important to stay informed about your pregnancy during these months.",
                     data1: "You might notice that symptoms like nausea and fatigue are going away. But other new, more noticeable changes to your body are now happening. Your abdomen will expand as the baby continues to grow. And before this trimester is over, you will feel your baby beginning to move! As your body changes to make room for your growing baby, you may have:",                     
                     subcontent: [  
                               
                                 {
                                   data2: "Body aches, such as back, abdomen, groin, or thigh pain"
                                },
                                 {
                                   data2: "Stretch marks on your abdomen, breasts, thighs, or buttocks"
                                },
                                 {
                                   data2: "Darkening of the skin around your nipples"
                                },
                                 {
                                   data2: "Patches of darker skin, usually over the cheeks, forehead, nose, or upper lip. Patches often match on both sides of the face. This is sometimes called the mask of pregnancy."
                                },
                                 {
                                   data2: "Numb or tingling hands, called carpal tunnel syndrome"
                                },
                                 {
                                   data2: "Swelling of the ankles, fingers, and face. (If you notice any sudden or extreme swelling or if you gain a lot of weight really quickly, call your doctor right away. This could be a sign of preeclampsia.)"
                                }

                                ],
data3: null

                     },
                     {
                    id: 2,
                    title1: "Third trimester",
                   title2: "week 13-week 28",
                   Img: "img/baby2.jpg",
                    data: "You're in the home stretch! Some of the same discomforts you had in your second trimester will continue. Plus, many women find breathing difficult and notice they have to go to the bathroom even more often. This is because the baby is getting bigger and it is putting more pressure on your organs. Don't worry, your baby is fine and these problems will lessen once you give birth.",
                     data1: " Some new body changes you might notice in the third trimester include:",
                     subcontent: [  
                                {
                                   data2: "Shortness of breath"
                                },
                                 {
                                   data2: "Heartburn"
                                },
                                 {
                                   data2: "Swelling of the ankles, fingers, and face. (If you notice any sudden or extreme swelling or if you gain a lot of weight really quickly, call your doctor right away. This could be a sign of preeclampsia.)"
                                },
                                 {
                                   data2: "Hemorrhoids"
                                },
                                 {
                                   data2: "Tender breasts, which may leak a watery pre-milk called colostrum (kuh-LOSS-struhm)"
                                },
                                 {
                                   data2: "Your belly button may stick out"
                                },
                                 {
                                   data2: "The baby dropping, or moving lower in your abdomen"
                                }

                                ],
            data3: "As you near your due date, your cervix becomes thinner and softer (called effacing). This is a normal, natural process that helps the birth canal (vagina) to open during the birthing process. Your doctor will check your progress with a vaginal exam as you near your due date. Get excited — the final countdown has begun!"

                     }
        ];
            return trimester;

        }, */
        getTips : function(){
            tips = [
       {
         Img: "img/heart.jpg",
         tips: "Take healthy food. Peace of mind."
       },
       {
           Img: 'img/danger.jpg',
            tips: "You should not eat Pine apple and  more jaggery during pregnancy"
         },

        {
           Img: 'img/apple.jpg',
            tips: "Take 1 apple pieces, some rose, saffron, cardamom and honey. Mix with all. Eat it, 30 days continuous."
         },
          {
          Img: 'img/clove.jpg',
          tips: "If you  drink the “clove with water” then vomit problem will be reduced."
        },
        {
          Img: 'img/coffee.jpg',
          tips: "If you eat the “coffee bean” ( Boil the cumin with water, Mix it with butter)  then excess saliva will be reduced"
         },
         {
          Img: 'img/drum.jpg',
          tips: "If you drink the “leaves of drumstick and coriander” (Boil the both with water. Drink it 2 times per day)then pain during delivery will be less. "
         },
         {
          Img: 'img/honey.jpg',
          tips: "If you eat apple, rose petals, saffron, cardamom with honey (Take 1 teaspoon  each and mix it with honey Eat continuously at least for one month) then there will be a normal delivery"
         },
         {
          Img: 'img/berry1.jpg',
          tips: "If you eat “gooseberry” during pregnancy then baby will be healthy."
         },
         {
          Img: 'img/mango.jpg',
          tips: "If you eat “mango” during  pregnancy  then baby will be healthy and it cures the hand trembling in mother’s"
         },
         {
          Img: 'img/berry.jpg',
          tips: "If You eat “gooseberry,drumstick,radish “ during pregnancy then swelling be will reduced."
         },
         {
          Img: 'img/pear.jpg',
          tips: "If we eat “Pear Fruit”  during pregnancy then baby will be well growth"
         }
                ];

                 return tips;
                    },

      /*  getTips: function() {
         tips = [
                   
                    {
                    id: 0,
                    title: "During pregnancy",
                    method1: [{
                             description: "Resource of Normal Human Childbirth is a health care profession in which providers offer care to childbearing women during pregnancy and birth, and during the postpartum period. They also care for the newborn and assist the mother with breastfeeding.",
                             Causes: "Body Weakness, Unhealthy food.",
                             Symptoms: "Tiredness, Weakness",
                            Diagnosis: "Take healthy food. Peace of mind.",
                            Ingredients: "Apple. Rose. Honey. Saffron. Cardamom",
                            Procedure: "Take 1 apple pieces, some rose, saffron, cardamom and honey. Mix with all. Eat it, 30 days continuous"
                            
                     }],
                     method2: null,
                 },
                        {
                    id: 1,
                    title: "vomit problem",
                      method1: [{
                             description: "If we drink the “clove with water” then vomit problem will be cured for pregnant ladies.",
                             Causes: null,
                             Symptoms: "Vomit, Dyspepsia",
                            Diagnosis: null,
                            Ingredients: "Clove.",
                            Procedure: "Boil the clove with water."
                     }],
                      method2: [{
                     
                             description: "If we drink the “clove with water” then vomit problem will be cured for pregnant ladies.",
                             Causes: null,
                             Symptoms: "Vomit, Dyspepsia",
                            Diagnosis: null,
                            Ingredients: "Rice flake.",
                            Procedure: "Boil the rice flake with water."
                     }]
                 },

                    {
                    id: 2,
                    title: "Pain during delivery",
                     method1: [{
                             description: "If we eat the “coffee bean” then excess saliva will be reduced for pregnant ladies.",
                             Causes: "Body Weakness, Unhealthy food.",
                             Symptoms: "Excess saliva.",
                            Diagnosis: null,
                            Ingredients: "Coffee bean.",
                            Procedure: "Boil the cumin with water, Mix it with butter."
                     }],
                        method2: [{
                             description: "If we drink the “leaves of drumstick and coriander” then pain during delivery will be less. ",
                             Causes: null,
                             Symptoms: "During pregnancy",
                            Diagnosis: null,
                            Ingredients: "Leaves of drumstick, Coriander.",
                            Procedure: "Take 1 cup of leaves of drumstick. Take 21/2 teaspoon of coriander. Boil the both with water. Drink it 2 times per day. "
                     }]
                 },
                        {
                    id: 3,
                     title: "Excess saliva will be reduced",
                     method1: [{
                             description: "If we eat the “coffee bean” then excess saliva will be reduced for pregnant ladies.",
                             Causes: null,
                             Symptoms: "Excess saliva.",
                            Diagnosis: null,
                            Ingredients: "Coffee bean.",
                            Procedure: "Eat often coffee bean."
                     }],
                      method2: null,
               
                 },
                       {
                    id: 4,
                    title: "Normal Delivery",
                     method1: [{
                     description: "If we eat apple, rose petals, saffron, cardamom with honey then there will be a normal delivery.",
                     Causes: null,
                     Symptoms: null,
                    Diagnosis: null,
                    Ingredients: "Apple, Rose petals, Saffron, Cardamom.",
                    Procedure: "Take 1 teaspoon rose petals. Tale ½ apples. Take 1 teaspoon of saffron. Take 2 almonds. Mix it with honey Eat continuously at least for one month. "
                     }],
                       method2: null,
                 },

                     {
                    id: 5,
                    title: "Babies Health",
                     method1: [{
                     description: "If we eat “gooseberry” during pregnancy then baby will be healthy." ,
                     Causes: null,
                     Symptoms: null,
                    Diagnosis: null,
                    Ingredients: "Gooseberry.",
                    Procedure: "Eat gooseberry often. "
                     }],
                        method2: [{
                     description: "If we eat “mango” during  pregnancy  then baby will be healthy and it cures the hand trembling in mother’s." ,
                     Causes: null,
                     Symptoms: "Tremble of hand and leg. Healthy body",
                    Diagnosis: null,
                    Ingredients: "Mango.#sthash.F0Em155x.dpuf.",
                    Procedure: "Eat mango often during pregnancy "
                     }]
                 },
                  {
                    id: 6,
                    title: "Mother’s Health",
                     method1: [{
                     description: "We should not eat Pine apple and  more jaggery during pregnancy" ,
                     Causes: null,
                     Symptoms: null,
                    Diagnosis: null,
                    Ingredients: "Pine apple. Jaggery.",
                    Procedure: "We should not eat pine apple and more jaggery during pregnancy."
                     }], 
                      method2: null,
                 },

                  {
                    id: 7,
                    title: "To get strength",
                     method1: [{
                     description: "If we eat “withana somnifera with honey” during pregnancy then body will be strengthened." ,
                     Causes: null,
                     Symptoms: "Feel tiredness.",
                    Diagnosis: null,
                    Ingredients: "Withana somnifera. Honey.",
                    Procedure: "Grind the withana somnifera. Boil withana somnifera with water. Filter the decoction. Mix the filtered decoction with honey. Drink 2 times per day. "
                     }],
                       method2: null,
                 },

                 {
                    id: 8,
                    title: "Reduce Swelling",
                     method1: [{
                     description: "If we eat “gooseberry,drumstick,radish “ during pregnancy then swelling be will reduced.",
                     Causes: null,
                     Symptoms: "Pain on leg, Pain on hand.",
                    Diagnosis: null,
                    Ingredients: "Gooseberry. Drumstick. Radish.",
                    Procedure: "Eat often the gooseberry, drumstick, radish."
                     }],
                       method2: null,
                 },

                  {
                    id: 9,
                    title: "Babies Growth",
                     method1: [{
                     description: "If we eat “Pear”  during pregnancy then baby will be well growth.",
                     Causes: null,
                     Symptoms: "Lack of growth.",
                    Diagnosis: null,
                    Ingredients: "Pear Fruit.",
                    Procedure: "Eat pear  fruit often."
                     }],
                       method2: null,
                 }
 ];
            return tips;

        },

         getTipsdata: function(g) {
          
      for (var i = 0; i < tips.length; i++) {
        if (tips[i].id === parseInt(g)) {
          return tips[i];
        }
      }
      return null;
        }, */

        getTrimesterdata: function(x) {
          
      for (var i = 0; i < trimester.length; i++) {
        if (trimester[i].id === parseInt(x)) {
          return trimester[i];
        }
      }
      return null;
        }, 

        createRoom: function(room) {

            var deferred = $q.defer();

            refRooms.push({
                name: room.name,
                description: room.desc
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("Room could not be saved." + errorObject);
                } else {
                    deferred.resolve("Room saved successfully.");
                }
            });

            return deferred.promise;
        },




          createSlot: function(slot) {

            var deferred = $q.defer();

            refSlots.update({
                company: slot.company,
                total: slot.total, 
                available: slot.available,
                booked: slot.booked,
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("Slot could not be saved." + errorObject);
                } else {
                    deferred.resolve("Slot saved successfully.");
                }
            });

            return deferred.promise;
        } ,

        createScheme: function(schemes) {

            var deferred = $q.defer();

      //  var schemes = refSchemes.push({
               

            refSchemes.push({
                name: schemes.name,
                benefit: schemes.benefit
            }, function(errorObject) {
                if (errorObject) {
                    deferred.reject("Scheme could not be saved." + errorObject);
                } else {
                    deferred.resolve("Scheme saved successfully.");
                }
            });

            return deferred.promise;
        } ,

        getScheme: function() {
            return $firebaseObject(refSchemes);
        } ,


        getCheckup: function() {
            return $firebaseArray(refCheckup);
        } ,

        getAllBooking: function() {
            var refbooking = new Firebase(FIREBASE_REF + "/parkingSlots/booked");

            return $firebaseArray(refbooking);
        }    
    }
});