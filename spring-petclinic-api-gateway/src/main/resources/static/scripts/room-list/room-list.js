'use strict';

angular.module('roomList', ['ui.router'])
    .config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('rooms', {
                parent: 'app',
                url: '/rooms',
                template: '<room-list></room-list>'
            })
    }]);