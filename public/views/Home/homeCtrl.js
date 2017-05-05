app.controller('HomeCtrl',['$scope', '$http', '$location', "$cookies", function($scope, $http, $location, $cookies){
    //Vérifie si il y a bien un utilisateur connecté
    if($cookies.get("authenticate") == null){
        $location.path('/login')
    }else{
        $location.path('/dashboard')
    }
}]);
