app.controller('DashboardCtrl', ['$scope', '$http', '$location', '$cookies', '$mdSidenav', '$mdToast', function ($scope, $http, $location, $cookies, $mdSidenav, $mdToast) {
    //Vérifie si il y a bien un utilisateur connecté
    if ($cookies.getObject("authenticate") == null) {
        $location.path('/login')
    }

    //infos de l'utilisateur connecté
    $scope.user = $cookies.getObject("authenticate");

    $scope.toggleSidenav = function () {
        $mdSidenav('left').toggle()
    };
    //gère la déconnexion
    $scope.disconnect = function(path){
        $cookies.remove('authenticate');
        $location.path(path);
    }

    //génère l'id qui définira une partie
    $scope.generateId = function(){
        return $scope.user._id + Date.now();
    }

    //redirige vers la nouvelle partie
    $scope.goToNewGame = function(id){
        $location.path('/game/'+id)
    }

    $scope.goToWaitGame = function(){
        $location.path('/findGame')
    }
}]);