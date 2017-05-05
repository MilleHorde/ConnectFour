app.controller('ScoresCtrl', ['$scope', '$http', '$location', '$cookies', '$mdSidenav', '$mdToast', function ($scope, $http, $location, $cookies, $mdSidenav, $mdToast) {
    //Vérifie si il y a bien un utilisateur connecté
    if ($cookies.getObject("authenticate") == null) {
        $location.path('/login')
    }

    //infos de l'utilisateur connecté
    $scope.user = $cookies.getObject("authenticate");

    $scope.toggleSidenav = function () {
        $mdSidenav('left').toggle()
    };

    //Charge les infos sur les parties terminées
    $scope.games = [];

    $scope.loadGames = function(){
        $http.post('/users/scores', {access_token: $scope.user.access_token})
            .success(function(data, status){
                $scope.games = data.games;
            })
    }

    //gère la déconnexion
    $scope.disconnect = function(path){
        $cookies.remove('authenticate');
        $location.path(path);
    }
}]);