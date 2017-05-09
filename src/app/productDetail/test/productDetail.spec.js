describe('Component: ProductDetail', function(){
    describe('Configuration: ProductViewConfig', function(){
            var stateParams;
        describe('State: Product',function(){
            var productState;
            beforeEach(inject(function($stateParams){
                productState = state.get('productDetail');
                stateParams = $stateParams;
                stateParams.productid = "MockProductID123";
                spyOn(oc.Me,'GetProduct');
            }));

            it('should resolve Product', function(){
                injector.invoke(productState.resolve.Product);
                expect(oc.Me.GetProduct).toHaveBeenCalledWith(stateParams.productid);
            });
        });
    });

    describe('Controller: ProductDetail', function(){
        var productDetailCtrl,
            lineItemHelpers;
        beforeEach(inject(function($controller, ocLineItems){
            lineItemHelpers = ocLineItems;
            productDetailCtrl = $controller('ProductDetailCtrl',{
                Product : mock.Product,
                CurrentOrder: mock.Order
            });

        }));

        describe('vm.addToCart', function(){
            beforeEach(function(){
                var defer =  q.defer();
                defer.resolve();
                spyOn(lineItemHelpers,'AddItem').and.returnValue(defer.promise);
                spyOn(toastrService, 'success');
                productDetailCtrl.addToCart();
            });
            it('should  call the ocLineItems AddItem method and display toastr', function(){
              expect(lineItemHelpers.AddItem).toHaveBeenCalledWith(mock.Order, mock.Product);
            });
            it('should call toastr when successful', function(){
                scope.$digest();
                expect(toastrService.success).toHaveBeenCalled();
            });
        });

        describe('vm.findPrice', function(){
            //set up like this for potential  addition of different quantities.
            it("finalPriceBreak should equal price of Pricebreak ", function(){
                var possibleQuantities= [2];
                productDetailCtrl.Product = {
                    PriceSchedule: {
                        PriceBreaks: [
                            {Price: '$0.00'}
                        ]
                    }
                };
                productDetailCtrl.finalPriceBreaks = {
                    Price: '$0.00'
                };
                for(var i = 0; i < possibleQuantities.length; i++){
                    productDetailCtrl.findPrice(possibleQuantities[i]);
                    expect(productDetailCtrl.finalPriceBreak.Price).toBe( productDetailCtrl.Product.PriceSchedule.PriceBreaks[i].Price );
                }

            })
        })
    });
});
