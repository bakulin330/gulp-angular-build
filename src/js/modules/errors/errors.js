angular.module("app.errors", [])
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state("errors-list", {
            url: "/errors/list",
            templateUrl: "modules/errors/errors.list.html",
            controller: "errorsCtrl as errors"
        })
    }])
    .controller("errorsCtrl", ["$scope", function ($scope) {
        this.test = 1;
    }]);