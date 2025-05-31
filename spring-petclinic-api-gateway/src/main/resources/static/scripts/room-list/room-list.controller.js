'use strict';

angular.module('roomList')
    .controller('RoomListController', ['$http', function ($http) {
        var self = this;

        $http.get('api/room/rooms').then(function (resp) {
            self.roomList = resp.data;
        });
    }]);
