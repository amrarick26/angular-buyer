angular.module('orderCloud')
    .config(ProductConfig)
    .controller('ProductDetailCtrl', ProductDetailController)
;

function ProductConfig($stateProvider) {
    $stateProvider
        .state('productDetail', {
            parent: 'base',
            url: '/product/:productid',
            templateUrl: 'productDetail/templates/productDetail.tpl.html',
            controller: 'ProductDetailCtrl',
            controllerAs: 'productDetail',
            resolve: {
                Product: function ($stateParams, OrderCloudSDK) {
                    return OrderCloudSDK.Me.GetProduct($stateParams.productid);
                }
            }
        });
}


function ProductDetailController($exceptionHandler, Product, CurrentOrder, ocLineItems, toastr) {
    var vm = this;
    vm.item = Product;
    vm.finalPriceBreak = null;

    vm.addToCart = function() {
        ocLineItems.AddItem(CurrentOrder, vm.item)
            .then(function(){
                toastr.success('Product added to cart', 'Success')
            })
            .catch(function(error){
               $exceptionHandler(error);
            });
    };

    vm.findPrice = function(qty){
        angular.forEach(vm.item.PriceSchedule.PriceBreaks, function(priceBreak) {
            if (priceBreak.Quantity <= qty)
                vm.finalPriceBreak = angular.copy(priceBreak);
        });

        return vm.finalPriceBreak.Price * qty;
    };
}

