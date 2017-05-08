describe('Component: Product Search', function(){
    describe('State: productSearchResults', function(){
        var productSearchState;
        beforeEach(function(){
            productSearchState = state.get('productSearchResults');
            spyOn(ocParametersService, 'Get');
            spyOn(oc.Me, 'ListProducts');
        });
        it('should resolve Parameters', function(){
            injector.invoke(productSearchState.resolve.Parameters);
            expect(ocParametersService.Get).toHaveBeenCalled();
        });
        it('should resolve ProductList', function(){
            parametersResolve.filters = {ParentID:'12'};
            injector.invoke(productSearchState.resolve.ProductList);
            expect(oc.Me.ListProducts).toHaveBeenCalled();
        });
    });
    describe('Controller: ProductSearchController', function(){
        var productSearchCtrl;
        beforeEach(inject(function($controller){
            productSearchCtrl = $controller('ProductSearchCtrl', {
                ocParameters: ocParametersService,
                $scope: scope,
                ProductList: {
                    Items:['product1', 'product2'],
                    Meta:{
                        ItemRange:[1, 3],
                        TotalCount: 50
                    }
                }
            });
            spyOn(state, 'go');
            spyOn(ocParametersService, 'Create');
        }));
        describe('filter', function(){
            it('should reload state and call ocParameters.Create with any parameters', function(){
                productSearchCtrl.filter(true);
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, true);
            });
        });
        describe('updateSort', function(){
            it('should reload page with value and sort order, if both are defined', function(){
                mock.Parameters.sortBy = '!ID';
                productSearchCtrl.updateSort('!ID');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
            it('should reload page with just value, if no order is defined', function(){
                mock.Parameters.sortBy = 'ID';
                productSearchCtrl.updateSort('ID');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
        });
        describe('updatePageSize', function(){
            it('should reload state with the new pageSize', function(){
                mock.Parameters.pageSize = '25';
                productSearchCtrl.updatePageSize('25');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, true);
            });
        });
        describe('pageChanged', function(){
            it('should reload state with the new page', function(){
                mock.Parameters.page = 'newPage';
                productSearchCtrl.pageChanged('newPage');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
        });
        describe('reverseSort', function(){
            it('should reload state with a reverse sort call', function(){
                mock.Parameters.sortBy = '!ID';
                productSearchCtrl.reverseSort();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
        });
    });
    describe('Component Directive: ordercloudProductSearch', function(){
        var productSearchComponentCtrl,
            catalogID
        ;
        beforeEach(inject(function($componentController, catalogid){
            catalogID = catalogid;
            productSearchComponentCtrl = $componentController('ordercloudProductSearch', {
                searchTerm: 'product1',
                maxProducts: 12
            });
            spyOn(state, 'go');
        }));
        describe('getSearchResults', function(){
            beforeEach(function(){
                var defer = q.defer();
                defer.resolve();
                spyOn(oc.Me, 'ListProducts').and.returnValue(defer.promise);
            });
            it('should call Me.ListProducts with given search term and max products', function(){
                mock.Parameters = {
                    catalogID: catalogID,
                    search: productSearchComponentCtrl.searchTerm,
                    page: 1,
                    pageSize: 5,
                    depth: 'all'
                };
                productSearchComponentCtrl.getSearchResults();
                expect(oc.Me.ListProducts).toHaveBeenCalledWith(mock.Parameters);
            });
            it('should default max products to five, if none is provided', function(){
                mock.Parameters = {
                    catalogID: catalogID,
                    search: productSearchComponentCtrl.searchTerm,
                    page: 1,
                    pageSize: 5,
                    depth: 'all'
                };
                productSearchComponentCtrl.getSearchResults();
                expect(oc.Me.ListProducts).toHaveBeenCalledWith(mock.Parameters);
            });
        });
        describe('onSelect', function(){
            it('should route user to productDetail state for the selected product id', function(){
                productSearchComponentCtrl.onSelect(12);
                expect(state.go).toHaveBeenCalledWith('productDetail', {productid:12});
            });
        });
        describe('onHardEnter', function(){
            it('should route user to search results page for the provided search term', function(){
                productSearchComponentCtrl.onHardEnter('bikes');
                expect(state.go).toHaveBeenCalledWith('productSearchResults', {searchTerm: 'bikes'});
            });
        });
    });
});