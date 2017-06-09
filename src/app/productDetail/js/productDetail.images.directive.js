angular.module('orderCloud')
    .directive('ocProductImages', ocProductImages)
    .controller('ProductImagesModalCtrl', ProductImagesModalCtrl)
;

function ocProductImages() {
    return {
        scope: {
            product: '='
        },
        restrict: 'E',
        templateUrl: 'productDetail/templates/productDetail.images.html',
        controller: function($scope, $timeout, $uibModal) {
            var responsiveOpts = [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3
                    }
                },
                {
                    breakpoint: 425,
                    settings: {
                        slidesToShow: 2
                    }
                }
            ]
            var slickMainOpts = {
                arrows: false,
                infinite: false,
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true,
                asNavFor: '#ImageNav'
            };

            var slickNavOpts = {
                arrows: true,
                infinite: false,
                responsive: responsiveOpts,
                slidesToShow: 4,
                slidesToScroll: 1,
                focusOnSelect: true,
                asNavFor: '#ImageMain'
            };
            $scope.carouselLoading = $timeout(function() {
                var slickMain = $('#ImageMain');
                slickMain.slick(slickMainOpts);

                var slickNav = $('#ImageNav');
                slickNav.slick(slickNavOpts);
            }, 300);

            $scope.openImageModal = function(product, index) {
                return $uibModal.open({
                    animation: true,
                    backdrop: true,
                    templateUrl: 'productDetail/templates/productDetail.images.modal.html',
                    controller: 'ProductImagesModalCtrl',
                    controllerAs: 'productImagesModal',
                    size: 'carousel',
                    resolve: {
                        Product: function() {
                            return product; 
                        },
                        Index: function() {
                            return index;
                        }
                    }
                }).result;
            }
        }
    }
}

function ProductImagesModalCtrl(Product, Index, $uibModalInstance) {
    var vm = this;
    vm.product = Product;
    vm.index = Index;
    vm.images = vm.product.xp.Images;
    vm.activeImage = vm.product.xp.Images[vm.index].Large;
    vm.interval = null;
    vm.noWrap = false;

    vm.close = close;

    function close() {
        $uibModalInstance.dismiss();
    }
}