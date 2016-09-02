angular.module("home", [])
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("home", {
            url: "/home",
            templateUrl: "home/home.tpl.html",
            controller: "homeCtrl as home"
        })
    }])
    .controller("homeCtrl", ["$scope", function ($scope) {
        this.test = 2;
    }]);