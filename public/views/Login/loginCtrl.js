app.controller('LoginCtrl',['$scope', '$http', '$location', '$cookies', function($scope, $http, $location, $cookies){
    //Vérifie si il y a bien un utilisateur connecté
    if($cookies.getObject("authenticate") == null){
        $location.path('/login')
    }else{
        $location.path('/dashboard')
    }

    $scope.error = false;

    //infos de l'utilisateur connecté
    if($cookies.getObject("saveConnect")){
        $scope.saveConnect = true;
        $scope.user = $cookies.getObject("saveConnect");
    }

    //Inscription
    $scope.signUp = function(){
        $location.path('/register');
    };

    //Connexion
    $scope.signIn = function(){
        if($scope.saveConnect == true){
            $cookies.putObject("saveConnect", $scope.user);
        }
        $http.post('users/signin', $scope.user).success(function(data, status){
            $cookies.putObject("authenticate", data.user);
            $location.path('/');
        }).catch(function(data, status){
            $scope.error=true;
        });
    }
}]);
