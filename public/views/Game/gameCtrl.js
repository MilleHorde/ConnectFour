app.controller('GameCtrl', ['$scope', '$http', '$location', '$cookies', '$mdSidenav', '$mdToast', '$routeParams', function ($scope, $http, $location, $cookies, $mdSidenav, $mdToast, $routeParams) {
    //Vérifie si il y a bien un utilisateur connecté
    if ($cookies.getObject("authenticate") == null) {
        $location.path('/login')
    }

    //Infos du user
    $scope.user = $cookies.getObject("authenticate");

    //infos de la partie
    $scope.infos = "Initialisation...";

    //true si c'est le tour de l'adversaire
    $scope.turnOpponent = true;

    var socket = io();

    //Permet au joueur arrivant sur la vue de se connecter sur la partie correspondant sur le serveur
    socket.emit('joinGame', {
        room: $routeParams.id,
        nickname: $scope.user.nickname,
        userId: $scope.user._id
    });

    //lors de la définition de chacun des joueurs
    socket.on('youAre', function (data) {
        $scope.user.player = data.player;
        $scope.user.game = {};
        $scope.user.game.hash = data.hash;
        $scope.infos = "En attente de votre adversaire"
    })

    //au lancement de la partie
    socket.on('start', function (data) {
        $scope.user.game.players = [data.p1, data.p2];
        if (data.startPlayer == $scope.user.player) {
            $scope.turnOpponent = false;
            $scope.infos = "C'est votre tour"
        }else{
            $scope.infos = "C'est le tour de votre adversaire"
        }
    })

    //stipule au serveur le mouvement souhaité
    $scope.move = function (col) {
        socket.emit('move', {
            col: col
        })
    }

    //redirige vers le path en coupant la socket
    $scope.goto = function(path){
        socket.close();
        $location.path(path);
    }

    //se declenche dès qu'un mouvement a été fait par un joueur sur le serveur
    socket.on('playerMove', function (data) {
        $scope.board[data.newMove.row][data.newMove.col] = data.player;
        if(data.turn != $scope.user.player){
            $scope.infos = "Vous venez de déposer un jeton dans la colonne "+ (data.newMove.col + 1)+" | En attente du tour de votre adversaire";
            $scope.turnOpponent = true;
        }else{
            $scope.infos = $scope.user.game.players[($scope.user.player == 1) ? 1 : 0]+" vient de déposer un jeton dans la colonne "+ (data.newMove.col + 1)+" | C'est à vous!";
            $scope.turnOpponent = false;
        }
    })

    //si un joueur est déclaré vainqueur
    socket.on('winner', function (data) {
        if (data.winner == $scope.user.player) {
            alert('Bravo, vous avez battu ' + $scope.user.game.players[($scope.user.player == 1) ? 1 : 0] + " en " + data.moves + " de coups")
            var again = confirm('Souhaitez-vous affirmer votre suprématie? (Les 2 joueurs doivent accepter le challenge)');
        } else {
            alert('Désolé, vous avez été battu par ' + $scope.user.game.players[($scope.user.player == 1) ? 1 : 0] + " en " + data.moves + " de coups")
            var again = confirm('Souhaitez-vous réessayer de gagner? (Les 2 joueurs doivent accepter le challenge)');
        }

        if(again){
            socket.emit('playAgain');
        }else{
            $scope.goto('/dashboard');
        }
    })

    //si les deux joueurs veulent rejouer, ils sont rediriger vers la nouvelle partie
    socket.on("againGame", function(id){
        $scope.goto('/game/'+id);
    })

    //si la totalité du board est remplie sans vainqueur
    socket.on('reset', function () {
        $scope.board = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];
    });

    //si l'autre joueur quitte la partie
    socket.on('leavePlayer', function(){
        alert("Le joueur opposé a quitté la partie, la partie est donc terminé et ne sera pas comptabilisé.");
        $location.path('/dashboard');
    })

    $scope.toggleSidenav = function () {
        $mdSidenav('left').toggle()
    };

    //initialisation du board
    $scope.board = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];

    //gère la déconnexion
    $scope.disconnect = function(path){
        $cookies.remove('authenticate');
        $scope.goto(path);
    }

    //gère le changement de couleur des cellules sur le hover
    $scope.changeColor = function (classSelected, change) {
        var elements = angular.element(document.getElementsByClassName(classSelected));

        for (var i = 0; i < elements.length; i++) {
            if (change) {
                angular.element(elements[i].querySelector('.cells:not(.p1):not(.p2)')).addClass('hover');
            } else {
                angular.element(elements[i].querySelector('.cells:not(.p1):not(.p2)')).removeClass('hover');
            }
        }
    };

    //génère l'id qui définira une partie
    $scope.generateId = function(){
        return $scope.user._id + Date.now();
    }

    //redirige vers la nouvelle partie
    $scope.goToNewGame = function(id){
        $location.path('/game/'+id)
    }
}]);