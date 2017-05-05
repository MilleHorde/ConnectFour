app.controller('FindGameCtrl', ['$scope', '$http', '$location', '$cookies', '$mdSidenav', '$interval', function ($scope, $http, $location, $cookies, $mdSidenav, $interval) {
    //Vérifie si il y a bien un utilisateur connecté
    if ($cookies.getObject("authenticate") == null) {
        $location.path('/login')
    }

    //infos de l'utilisateur connecté
    $scope.user = $cookies.getObject("authenticate");

    $scope.toggleSidenav = function () {
        $mdSidenav('left').toggle()
    };

    //Charge les parties en attentes de joueurs trouvés
    $scope.found = [];

    $scope.loadFound = function(){
        $http.post('/users/waitingGame', {})
            .success(function(data, status){
                $scope.found = data.games;
            })
    }

    //redirige vers la partie en attente de joueur
    $scope.joinGame = function(id){
        $location.path('/game/'+id);
    }

    //recharge les parties en attentes toutes les 1500ms
    $scope.timer = $interval($scope.loadFound, 1500);

    //Stop le timer
    $scope.stop = function(){
        $interval.cancel($scope.timer);
    }

    //redirige vers le path
    $scope.goto = function(path){
        $scope.stop();
        $location.path(path);
    }

    //initialise les valeurs nécessaires
    $scope.init = function(){
        $scope.loadFound();
    }

    //gère la déconnexion
    $scope.disconnect = function(path){
        $cookies.remove('authenticate');
        $location.path(path);
    }
}]);