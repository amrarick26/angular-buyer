angular.module('orderCloud')
    .config(checkoutShippingConfig)
    .controller('CheckoutShippingCtrl', CheckoutShippingController);

function checkoutShippingConfig($stateProvider) {
    $stateProvider
        .state('checkout.shipping', {
            url: '/shipping',
            templateUrl: 'checkout/shipping/templates/checkout.shipping.tpl.html',
            controller: 'CheckoutShippingCtrl',
            controllerAs: 'checkoutShipping'
        });
}

function CheckoutShippingController($exceptionHandler, $rootScope, OrderCloud, CurrentOrder, CurrentUser, AddressSelectModal, ShippingRates, CheckoutConfig, rebateCode) {
    var vm = this;

    vm.rebateCode = rebateCode;
    vm.order = CurrentOrder;
    vm.user = CurrentUser;
    vm.changeShippingAddress = changeShippingAddress;
    vm.saveShipAddress = saveShipAddress;
    vm.shipperSelected = shipperSelected;
    vm.toggleShipping = toggleShipping;
    vm.initShippingRates = initShippingRates;
    vm.getShippingRates = getShippingRates;
    vm.analyzeShipments = analyzeShipments;

    function changeShippingAddress(order) {
        AddressSelectModal.Open('shipping', vm.user)
            .then(function(address) {
                if (address == 'create') {
                    vm.createAddress(order);
                } else {
                    order.ShippingAddressID = address.ID;
                    vm.saveShipAddress(order, address);
                }
            })
    }

    function saveShipAddress(order, address) {
        if (order && order.ShippingAddressID) {
            OrderCloud.Orders.Patch(order.ID, {ShippingAddressID: order.ShippingAddressID, xp: {CustomerNumber: address.CompanyName}})
                .then(function(updatedOrder) {
                    $rootScope.$broadcast('OC:OrderShipAddressUpdated', updatedOrder);
                    vm.getShippingRates(order);
                })
                .catch(function(ex){
                    $exceptionHandler(ex);
                });
        }
    }

    function initShippingRates(order) {
        if (CheckoutConfig.ShippingRates && order.ShippingAddressID) vm.getShippingRates(order);
    }

    function getShippingRates(order) {
        vm.shippersAreLoading = true;
        vm.shippersLoading = ShippingRates.GetRates(order)
            .then(function(shipments) {
                vm.shippersAreLoading = false;
                vm.shippingRates = shipments;
                vm.analyzeShipments(order);
            });
    }

    function analyzeShipments(order) {
        vm.shippingRates = ShippingRates.AnalyzeShipments(order, vm.shippingRates);
    }

    function shipperSelected(order) {
        ShippingRates.ManageShipments(order, vm.shippingRates)
            .then(function() {
                $rootScope.$broadcast('OC:UpdateOrder', order.ID);
            });
    }

    function toggleShipping(opt) {
        OrderCloud.Orders.Patch(vm.order.ID, {xp: {ExpeditedShipping: opt}})
            .then(function(updatedOrder) {
                $rootScope.$broadcast('OC:UpdateOrder', updatedOrder.ID);
            })
    }
}