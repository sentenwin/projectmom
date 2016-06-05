angular.module('ionizer-chat.firebaseController', ['ionizer-chat.services'])

.controller('profilePersonalCtrl', function($scope, firebaseservice,  $state) {

$scope.editSettings = function() {
    console.log('editing profile setting');
    $state.go('app.profile.personal');
}

    // Perform the save profile action when the user submits the form
    $scope.saveSettings = function() {

        $scope.loggedUser.$save().then(function() {
            console.log('Profile saved to Firebase!');
        }).catch(function(error) {
            console.log('Error Saving!');
        });

    };
})

.controller('profileSocialCtrl', function($scope, firebaseservice, $state) {

    $scope.social = {};
    $scope.socialreturn = {};

    $scope.social.facebook = "Checking Facebook Link Status ...";
    $scope.social.twitter = "Checking Twitter Link Status ...";
    $scope.social.google = "Checking Google Link Status ...";

    $scope.getSocial = function() {
        firebaseservice.getSocial($scope.loggedUser.$id).then(
            function(returnData) {
                console.log(returnData);
                $scope.socialreturn = returnData;

                $scope.social.facebook = "Link Facebook Account";
                $scope.social.twitter = "Link Twitter Account";
                $scope.social.google = "Link Google Account";

                if (returnData.facebook !== undefined) {
                    $scope.social.facebook = "Unlink Facebook Account";
                }
                if (returnData.twitter !== undefined) {
                    $scope.social.twitter = "Unlink Twitter Account";
                }
                if (returnData.google !== undefined) {
                    $scope.social.google = "Unlink Google Account";
                }
            }
        );
    };


    $scope.SignOther = function(provider) {

        validateSocial = eval("$scope.socialreturn." + provider);
        console.log(validateSocial);

        if (validateSocial) {
            firebaseservice.unlinkOther(provider, validateSocial,$scope.loggedUser.$id)
                .then(function(authData) {
                    $scope.getSocial();
                    console.log("Account Unlinking Success:", authData);
                }, function(error) {
                    console.log("Account Unlinking Failed!", error);
                });
        } else {
            firebaseservice.linkOther(provider,$scope.loggedUser.$id)
                .then(function(authData) {
                    $scope.getSocial();
                    console.log("Account Linking Success:", authData);
                }, function(error) {
                    console.log("Account Linking Failed!", error);
                });
        }

        //showPopup()showAlert()

    }

    // Send to Home if loggedUser has not been set yet
    if(!$scope.loggedUser.$id) {
        console.log('loggedUser not loaded, sent home');
        $state.go('app.home');
    } else {
        $scope.getSocial();    
    }    

});
