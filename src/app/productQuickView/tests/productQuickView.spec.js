describe('Component: Product Quick View', function() {
    var productQuickViewService,
        uibModalInstance = jasmine.createSpyObj('modalInstance', ['close', 'dismiss', 'result.then']);
    beforeEach(inject(function(ocProductQuickView) {
        productQuickViewService = ocProductQuickView;
    }));

    describe('Service: ocProductQuickView', function() {
        var uibModal;
        beforeEach(inject(function($uibModal) {
            uibModal = $uibModal;
        }));

        describe('Method: Open', function() {
            it('should open the modal for product quick view', function() {
                spyOn(uibModal, 'open').and.callThrough();
                productQuickViewService.Open();
                expect(uibModal.open).toHaveBeenCalledWith({
                    backdrop: 'static',
                    templateUrl: 'productQuickView/templates/productQuickView.modal.html',
                    controller: 'ProductQuickViewCtrl',
                    controllerAs: 'productQuickView',
                    size: 'lg',
                    animation: false,
                    resolve: {
                        SelectedProduct: jasmine.any(Function),
                        CurrentOrder: jasmine.any(Function)
                    }
                });
            })
        })
    });

    describe('Component Directive: ordercloudProductQuickView', function() {
        var productQuickViewComponentCtrl;
        beforeEach(inject(function($componentController) {
            productQuickViewComponentCtrl = $componentController('ordercloudProductQuickView', {});
        }));
        describe('quickView', function() {
            it('should call the Open method on ocProductQuickView service', function() {
                spyOn(productQuickViewService, 'Open').and.callThrough();
                productQuickViewComponentCtrl.quickView(mock.Order, mock.Product);
                expect(productQuickViewService.Open).toHaveBeenCalledWith(mock.Order, mock.Product);
            })
        })
    });

    describe('Controller: ProductQuickViewController', function() {
        var productQuickViewCtrl,
            lineItemsService;
        beforeEach(inject(function($controller, ocLineItems) {
            lineItemsService = ocLineItems;
            productQuickViewCtrl = $controller('ProductQuickViewCtrl', {
                $uibModalInstance: uibModalInstance,
                SelectedProduct: mock.Product,
                CurrentOrder: mock.Order,
                ocLineItems: lineItemsService
            })
        }));
        describe('addToCart', function() {
            beforeEach(function() {
                spyOn(lineItemsService, 'AddItem').and.callThrough;
                productQuickViewCtrl.addToCart();
            });
            it('should add line items to the current order', function() {
                expect(lineItemsService.AddItem).toHaveBeenCalledWith(CurrentOrder, SelectedProduct)
            });
            it('should call toastr success', function() {
                expect(toastr.success).toHaveBeenCalledWith('Product successfully added to your cart.');
            });
            it('should close the modal', function() {
                expect(uibModalInstance.close).toHaveBeenCalled();
            });
        });
        describe('cancel', function() {
            it('should dismiss the modal', function(){
                productQuickViewCtrl.cancel();
                expect(uibModalInstance.dismiss).toHaveBeenCalled();
            });
        });
    })
})