angular.module("app.home", [])
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("home", {
            url: "/home",
            templateUrl: "modules/home/home.tpl.html",
            controller: "homeCtrl as home"
        })
    }])
    .controller("homeCtrl", ["$scope", function ($scope) {
        this.test = 1;
    }]);