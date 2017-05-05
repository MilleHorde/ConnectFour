app.controller('RegisterCtrl', ['$scope', '$http', '$location', '$cookies', function ($scope, $http, $location, $cookies) {
    //Vérifie si il y a bien un utilisateur connecté
    if ($cookies.getObject("authenticate") != null) {
        $location.path('/dashboard')
    }

    //Connexion
    $scope.signIn = function () {
        $location.path('/login')
    };

    //Inscription
    $scope.signUp = function () {
        $scope.user.wingslabs=[$scope.WL];
        $http.post('/users/signup', $scope.user).success(function (data, status) {
            $cookies.putObject("authenticate",data.user);
            id = data.user.id;
            $location.path('/');
        }).catch(function (data, status) {
            $scope.error = true;
        });
    };
}]);
