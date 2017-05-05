var app = angular.module('ConnectFour', ['ngRoute', 'ngCookies', 'ngAnimate', 'ngMaterial']);

app.config(function($routeProvider) {
    $routeProvider.when('/dashboard', {
        templateUrl: './views/Dashboard/dashboard.html',
        controller: 'DashboardCtrl'
    });
    $routeProvider.when('/login', {
        templateUrl: './views/Login/login.html',
        controller: 'LoginCtrl'
    });
    $routeProvider.when('/', {
        templateUrl: './views/Home/home.html',
        controller: 'HomeCtrl'
    });
    $routeProvider.when('/register', {
        templateUrl: './views/Register/register.html',
        controller: 'RegisterCtrl'
    });
    $routeProvider.when('/game/:id', {
        templateUrl: './views/Game/game.html',
        controller: 'GameCtrl'
    });
    $routeProvider.when('/findGame', {
        templateUrl: './views/FindGame/findGame.html',
        controller: 'FindGameCtrl'
    });
    $routeProvider.when('/scores', {
        templateUrl: './views/Scores/scores.html',
        controller: 'ScoresCtrl'
    });
    $routeProvider.otherwise({
        redirectTo: '/login'
    });
});