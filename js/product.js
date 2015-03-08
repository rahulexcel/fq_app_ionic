var productMod = angular.module('ProductMod', ['ionic', 'ProductService', 'ServiceMod']);

productMod.controller('ProductCtrl',
        ['$scope', '$stateParams', 'productHelper', 'dataShare', 'toast', '$localStorage', '$timeout', '$location', '$rootScope', 'socialJs', 'timeStorage', '$ionicSlideBoxDelegate', 'ajaxRequest', 'CDN', '$ionicHistory',
            function ($scope, $stateParams, productHelper, dataShare, toast, $localStorage, $timeout, $location, $rootScope, socialJs, timeStorage, $ionicSlideBoxDelegate, ajaxRequest, CDN, $ionicHistory) {
                $scope.product_loading = true;
                $scope.product = false;
                $scope.variants = [];
                $scope.similar = [];
                $scope.myScroll = false;
                $scope.product_id = false;
                var cache_key = false;

                if (window.plugins && window.plugins.socialsharing) {
                    $scope.isMobile = true;

                    $scope.shareAll = function (product) {
                        window.plugins.socialsharing.share(product.name, null, product.img, product.desktop_href, function () {
                        }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.twitter = function (product) {
                        window.plugins.socialsharing.shareViaTwitter(
                                product.name, product.img, product.desktop_href, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                    $scope.whatsapp = function (product) {
                        window.plugins.socialsharing.shareViaWhatsApp(
                                product.name, product.img, product.desktop_href, function () {
                                }, function () {
                            toast.showShortBottom('Unable to Share');
                        });
                    };

                    $scope.facebook = function (product) {
                        if (window.cordova.platformId === "browser") {
                            if (!accountHelper.isFbInit()) {
                                facebookConnectPlugin.browserInit('765213543516434');
                                accountHelper.fbInit();
                            }
                        }
                        facebookConnectPlugin.showDialog({
                            method: 'share',
                            href: product.desktop_href,
                            message: product.name,
                            picture: product.img
                        }, function (data) {
                            console.log(data);
                        }, function (data) {
                            console.log(data);
                            toast.showShortBottom('Unable to Share');
                        });
                    };
                } else {
                    $scope.isMobile = false;
                    socialJs.addSocialJs();
                }
                $scope.viewWebsite = function (product) {
                    if (product.website_filter_key) {
                        var website = product.website;
                        var cat_id = product.cat_id;
                        var sub_cat_id = product.sub_cat_id;
                        var cat_name = product.cat_name;
                        var website_key = product.website_filter_key;

                        var category_data = {
                            cat_id: cat_id,
                            sub_cat_id: sub_cat_id,
                            name: cat_name,
                            page: 1,
                            search: "",
                            sortby: "popular",
                            title: cat_name,
                            filters: [{
                                    name: website,
                                    param: website_key
                                }]
                        };
                        $ionicHistory.clearCache();
                        timeStorage.set('category_' + cat_id + "_" + sub_cat_id, category_data, 0.1);
                        $location.path('/app/category/' + cat_id + '/' + sub_cat_id + '/' + cat_name);
                    }
                }
                $scope.viewBrand = function (product) {
                    var brand = product.brand;
                    var cat_id = product.cat_id;
                    var sub_cat_id = product.sub_cat_id;
                    var cat_name = product.cat_name;
                    var brand_key = product.brand_filter_key;

                    var category_data = {
                        cat_id: cat_id,
                        sub_cat_id: sub_cat_id,
                        name: cat_name,
                        page: 1,
                        search: "",
                        sortby: "popular",
                        title: cat_name,
                        filters: [{
                                name: brand,
                                param: brand_key
                            }]
                    };
                    console.log(category_data);
                    $ionicHistory.clearCache();
                    timeStorage.set('category_' + cat_id + "_" + sub_cat_id, category_data, 0.1);
                    $location.path('/app/category/' + cat_id + '/' + sub_cat_id + '/' + cat_name);
                };
                var self = this;
                self.fetch_latest_done = false;
                self.product_info_done = false;
                $scope.product_detail_loading = false;
                $scope.productInfo = function (force) {
                    if (self.product_info_done) {
                        return;
                    }
                    self.product_info_done = true;
                    var product_id = $scope.product_id;
                    var cache_key = 'product_' + product_id;
                    if (timeStorage.get(cache_key) && !force) {
                        var data = timeStorage.get(cache_key);
                        $scope.processProductData(data);
                        $ionicSlideBoxDelegate.update();
                        $scope.fetchLatest(data.product.org_href);
                    } else {
                        $scope.product_detail_loading = true;
                        var ajax = productHelper.fetchProduct(product_id);
                        ajax.then(function (data) {
                            console.log('latest product data');
                            console.log(data);
                            $scope.product_detail_loading = false;
                            timeStorage.set(cache_key, data, 1);
                            $scope.processProductData(data);
                            $ionicSlideBoxDelegate.update();
                            if (!self.fetch_latest_done)
                                $scope.fetchLatest(data.product.org_href);
                        }, function () {
                            $scope.$broadcast('scroll.refreshComplete');
                        });
                    }
                };
                $scope.fetchLatest = function (href) {
                    if (!href) {
                        return;
                    }
                    self.fetch_latest_done = true;
                    var ajax2 = productHelper.fetchLatest(href);
                    ajax2.then(function (data) {
                        var price = data.price;
                        var more_images = data.more_images;

                        price = Math.round(price);
                        if (price > 0)
                            $scope.product.price = price;
                        if (more_images && more_images.length > 0) {
                            $scope.product.more_images = more_images;
                        } else {
                        }
                        $ionicSlideBoxDelegate.update();
                    });
                };
                $scope.$on('$destory', function () {
                    $scope.myScroll.destroy();
                    $scope.myScroll = null;
                });
                $scope.processProductData = function (data) {
//                    var img = data.product.img;
                    var prod_id = data.product._id;
                    data.product.img = CDN.cdnize(ajaxRequest.url('v1/picture/images/' + prod_id));
                    $scope.product = data.product;
                    if (data.variants)
                        $scope.product.variants = data.variants;
                    if (data.similar)
                        $scope.product.similar = data.similar;
                    if (data.similar && data.similar.length > 0) {
                        console.log('initiazling iscroll');
                        if (data.similar.length > 0)
                            $timeout(function () {
                                angular.element(document.querySelector('.scroller_' + data.product._id)).attr('style', 'width:' + (data.similar.length * 160) + "px");
                                $scope.myScroll = new IScroll('.similar_' + data.product._id, {scrollX: true, scrollY: false, eventPassthrough: true, preventDefault: false, tap: true});
                            }, 100);
                    }
                    $scope.product_loading = false;
                    $scope.$broadcast('scroll.refreshComplete');
                };
                $scope.$on('search_product_event', function () {
                    var cat_id = $scope.product.cat_id;
                    var sub_cat_id = $scope.product.sub_cat_id;
                    var name = $scope.product.cat_name;
                    var text = $rootScope.search.text;
                    $location.path('/app/category/' + cat_id + "/" + sub_cat_id + "/" + name + "/" + text);
                });
                $scope.$on('product_open', function () {
                    var data = dataShare.getData();
                    console.log('product open event');
                    console.log(data);
                    $scope.product = data;
                    $scope.product_loading = false;
                    $scope.productInfo();
                    if (!self.fetch_latest_done)
                        $scope.fetchLatest(data.org_href);
                });
                $scope.buy = function (product) {
                    if (window.plugins) {
                        window.open(product.href, '_system');
                    } else {
                        window.open(product.href);
                    }
                };

                $scope.viewCategory = function (product) {
                    if (product.cat_id && product.sub_cat_id) {
                        $location.path('/app/category/' + product.cat_id + "/" + product.sub_cat_id + "/" + product.cat_name);
                    }
                };

                $scope.wishlist = function (product, $event) {
                    if (window.analytics) {
                        window.analytics.trackEvent('Pin', 'Product Page', $location.path());
                    }
                    $event.preventDefault();
                    $event.stopPropagation();
                    if ($localStorage.user.id) {
                        $scope.wishlist_product.item = false;
                        $scope.wishlist_product.new_item = false;
                        $scope.wishlist_product.product = product;
                        $scope.$parent.showWishlist();
                    } else {
                        if (!$localStorage.previous) {
                            $localStorage.previous = {};
                        }
                        $localStorage.previous.state = {
                            function: 'wishlist',
                            param: angular.copy($scope.product)
                        };
                        toast.showShortBottom('Login To Create Wishlist');
                        $location.path('/app/signup');
                    }
                };
                $scope.openProduct = function (product) {
                    var id = product._id;
                    console.log('open product ' + id);
                    if (!product.img) {
                        product.img = product.image;
                    }
                    dataShare.broadcastData(angular.copy(product), 'product_open');
                    $location.path('/app/product/' + id);
                };
                if ($stateParams.product_id) {
                    $scope.product_loading = true;
                    $scope.product = false;
                    $scope.variants = [];
                    $scope.similar = [];
                    $scope.myScroll = false;
                    var product_id = $stateParams.product_id;
                    $scope.product_id = product_id;
                    $scope.productInfo();
                }
            }
        ]);