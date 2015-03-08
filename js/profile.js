var profileMod = angular.module('ProfileMod', ['ServiceMod', 'ngStorage', 'ionic', 'FriendService']);
profileMod.controller('ProfileCtrl',
        ['$scope', '$localStorage', 'toast', '$location', '$ionicLoading', 'friendHelper', '$stateParams', '$rootScope', '$timeout', 'wishlistHelper', '$ionicPopup', 'notifyHelper', '$ionicScrollDelegate', 'accountHelper',
            function ($scope, $localStorage, toast, $location, $ionicLoading, friendHelper, $stateParams, $rootScope, $timeout, wishlistHelper, $ionicPopup, notifyHelper, $ionicScrollDelegate, accountHelper) {
                var user_id = false;
                $scope.$on('logout_event', function () {
                    $location.path('/app/home');
                });
                if ($stateParams.user_id) {
                    user_id = $stateParams.user_id;
                    if (user_id === 'me') {
                        user_id = $localStorage.user.id;
                    }
                } else if ($localStorage.user.id) {
                    user_id = $localStorage.user.id;
                }
                $scope.user = false;
                $scope.myScoll = false;
                $scope.selected_class = '';
                $scope.friend_requests = [];

                $scope.pin_status = {
                    pin_page: 0,
                    showMore: false
                };

                $scope.getData = function (page) {
                    return friendHelper.loadMoreProfilePins(user_id, page);
                };

                var start_index = 0;
                $rootScope.$on('$viewContentLoaded', function (event) {
                    var path = $location.path();
                    //$scope.selected_class = 'wishlist';
                    path = path.replace('/me', '/' + user_id);
                    if (path === '/app/profile/' + user_id + '/mine') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'wishlist';
                        start_index = 0;
                    } else if (path === '/app/profile/' + user_id + '/followers') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'followers';
                        start_index = 4;
                    } else if (path === '/app/profile/' + user_id + '/following') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'following';
                        start_index = 5;
                    } else if (path === '/app/profile/' + user_id + '/pins') {
                        $scope.pin_status.showMore = false;
                        start_index = 6;
                        $scope.selected_class = 'pins';
                    } else if (path === '/app/profile/' + user_id + '/profile') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'profile';
                        start_index = 7;
                    } else if (path === '/app/profile/' + user_id + '/update') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'update';
                        start_index = 8;
                    } else if (path === '/app/profile/' + user_id + '/friends') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'friends';
                        start_index = 1;
                    } else if (path === '/app/profile/' + user_id + '/recommended') {
                        $scope.pin_status.showMore = false;
                        $scope.selected_class = 'recommended';
                        start_index = 2;
                    }
                    $ionicScrollDelegate.resize();
                });
                $scope.me = false;
                $scope.menu_update = function () {
                    $location.path('/app/profile/' + user_id + '/update');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_wishlist = function () {
                    $location.path('/app/profile/' + user_id + '/mine');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_followers = function () {
                    $location.path('/app/profile/' + user_id + '/followers');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_following = function () {
                    $location.path('/app/profile/' + user_id + '/following');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_pins = function () {
                    $location.path('/app/profile/' + user_id + '/pins');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_profile = function () {
                    $location.path('/app/profile/' + user_id + '/profile');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_friends = function () {
                    $location.path('/app/profile/' + user_id + '/friends');
                    $ionicScrollDelegate.resize();
                };
                $scope.menu_recommended = function () {
                    $location.path('/app/profile/' + user_id + '/recommended');
                    $ionicScrollDelegate.resize();
                };

                if (user_id) {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    var ajax = friendHelper.fullProfile(user_id, $localStorage.user.id);
                    ajax.then(function (data) {
                        $scope.is_following = data.is_following;
                        $scope.is_friend = data.is_friend;
                        $scope.friend_requests = data.friend_requests;

                        $scope.friend_request_count = 0;
                        if (data.friend_requests)
                        {
                            $scope.friend_request_count = data.friend_requests.length;
                        }

                        $scope.user = data;
                        if ($scope.user._id === $localStorage.user.id) {
                            $scope.me = true;
                            $localStorage.user.gender = data.gender;
                            $localStorage.user.picture = data.picture;
                            $localStorage.user.name = data.name;
                        }

                        $ionicLoading.hide();
                        $scope.$broadcast('user_info');

                        var width = 125;
                        if ($scope.me) {
                            width = width * 8;
                        } else {
                            width = width * 4;
                        }
                        angular.element(document.querySelector('#menu_scroller')).attr('style', 'width:' + width + 'px');
                        $timeout(function () {
                            var window_width = document.querySelector('.menu-content').clientWidth * 1;
                            var startX = 0;
                            if (start_index !== 0) {
                                startX = start_index * 125 - window_width;
                                if (startX < 0) {
                                    startX = 0;
                                }
                            }
                            $scope.myScroll = new IScroll('#menu_sliding', {scrollX: true, scrollY: false, eventPassthrough: true, preventDefault: false, tap: true, startX: startX * -1});
                        }, 50);

                    }, function () {
                        $ionicLoading.hide();
                    });

                } else {
                    toast.showShortBottom('You Need To Be Logged In To Access This Page');
                    $location.path('/app/signup');
                }

                var self = this;

                self.followUserID = function (user_id, type) {
                    return friendHelper.user_follow(user_id, type);
                };
                $scope.acceptFriendRequest = function (from_user_id) {
                    var ajax = friendHelper.acceptFriendRequest(from_user_id);
                    ajax.then(function () {
                        $scope.$broadcast('friend_request');
                        toast.showShortBottom('Friend Request Accepted');
                    });
                };
                $scope.declineFriendRequest = function (from_user_id) {
                    var ajax = friendHelper.declineFriendRequest(from_user_id);
                    ajax.then(function () {
                        $scope.friend_request_count--;
                        if ($scope.friend_request_count < 0) {
                            $scope.friend_request_count = 0;
                        }
                        $scope.$broadcast('friend_request');
                        toast.showShortBottom('Friend Request Declined');
                    });
                };
                var created_at = false;
                $scope.addFriend = function () {
                    var ajax = friendHelper.addFriend(user_id, $localStorage.user.id);
                    ajax.then(function (data) {
                        if (data.status === 'sent') {
                            $scope.is_friend = 2;
                            toast.showShortBottom('Friend Request Sent');
                        } else if (data.status === 'pending') {
                            created_at = data.date;

                            var old_time = new Date(created_at).getTime();
                            var now = new Date().getTime();
                            if (now - old_time > 1000 * 60 * 60 * 24) {
                                $ionicPopup.confirm({
                                    title: 'Friend Request',
                                    template: 'You have alredy sent Friend Request on "' + prettyDate(created_at) + "\". Click OK to remaind"
                                }).then(function (res) {
                                    if (res) {
                                        notifyHelper.sendAlert('user_' + user_id, {
                                            title: $localStorage.user.name + ' has sent you a friend request',
                                            meta: {
                                                type: 'add_friend',
                                                user: $localStorage.user
                                            }
                                        });
                                        toast.showShortBottom('Remainder Sent!');
                                    }
                                });
                            } else {
                                toast.showShortBottom('Your Friend Request Is Pending!');
                            }
                        } else if (data.status === 'declined') {
                            created_at = data.date;
                            $ionicPopup.alert({
                                title: 'Friend Request',
                                template: 'Your Friend Request Was Declined on "' + prettyDate(created_at) + "\" cannot send again!"
                            }).then(function (res) {
                            });

                        }
                    }, function () {
                        $scope.is_friend = 2;
                    });
                };
                $scope.followProfileUser = function () {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = self.followUserID(user_id);
                    ajax.then(function () {
                        toast.showShortBottom('Following Now!');
                        $scope.is_following = true;
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
                $scope.unFollowProfileUser = function () {
                    if ($scope.request_process) {
                        toast.showProgress();
                        return;
                    }
                    $scope.request_process = true;
                    var ajax = self.followUserID(user_id, 'remove');
                    ajax.then(function () {
                        toast.showShortBottom('Stopped Following Now!');
                        $scope.is_following = false;
                        $scope.request_process = false;
                    }, function () {
                        $scope.request_process = false;
                    });
                };
                $scope.status_edit = false;
                $scope.editStatus = function () {
                    $scope.status_edit = true;
                };
                $scope.updateStatus = function () {
                    if ($scope.user.status.length > 50) {
                        toast.showShortBottom('Should Be Less Than 50 Characters');
                    } else {
                        $scope.status_edit = false;
                        var ajax = accountHelper.updateStatus($scope.user.status);
                        ajax.then(function () {
                            toast.showShortBottom('Status Updated!');
                        }, function () {

                        });
                    }
                };
            }
        ]);