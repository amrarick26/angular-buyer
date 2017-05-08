describe('Component: ProductBrowse', function(){
    //var productList,
    //    categoryList;
    //beforeEach(module(function($provide) {
    //    $provide.value('ProductList', {});
    //    $provide.value('CategoryList', {});
    //}));
    //beforeEach(function(ProductList, CategoryList){
    //    productList = ProductList;
    //    categoryList = CategoryList;
    //});

    describe('State: productBrowse', function(){
        var productBrowseState,
            catalogID;
        beforeEach(inject(function(catalogid){
            catalogID = catalogid;
            productBrowseState = state.get('productBrowse');
            spyOn(ocParametersService, 'Get').and.returnValue(null);
            spyOn(oc.Me, 'ListCategories').and.returnValue(null);
        }));
        it('should resolve Parameters', function(){
            injector.invoke(productBrowseState.resolve.Parameters);
            expect(ocParametersService.Get).toHaveBeenCalled();
        });
        it('should resolve CategoryList', function(){
            mock.Parameters = {
                page: 1,
                pageSize: 100,
                depth: 'all',
                catalogID: catalogID
            };
            injector.invoke(productBrowseState.resolve.CategoryList);
            expect(oc.Me.ListCategories).toHaveBeenCalledWith(mock.Parameters);
        });
    });
    fdescribe('State: productBrowse.products', function(){
        var productBrowseProductsState;
        beforeEach(function(){
            productBrowseProductsState = state.get('productBrowse.products');
            spyOn(ocParametersService, 'Get').and.returnValue(null);
            spyOn(oc.Me, 'ListProducts').and.returnValue(null);
        });
        it('should resolve Parameters', function(){
            injector.invoke(productBrowseProductsState.resolve.Parameters);
            expect(ocParametersService.Get).toHaveBeenCalled();
        });
        it('should resolve ProductList', function(){
            injector.invoke(productBrowseProductsState.resolve.ProductList);
            expect(oc.Me.ListProducts).toHaveBeenCalledWith(mock.Parameters);
        });
    });
    //describe('Controller: ProductViewCtrl', function(){
    //    var productViewCtrl;
    //    beforeEach(inject(function($state, $controller){
    //        productViewCtrl = $controller('ProductViewCtrl', {
    //            ProductList: productList,
    //            CategoryList: categoryList
    //        });
    //    }));
    //    describe('LoadMore', function(){
    //        beforeEach(function(){
    //            productViewCtrl.list = {
    //                Meta: {
    //                    Page: '',
    //                    PageSize: ''
    //                },
    //                Items: {}
    //            };
    //            productViewCtrl.productList = productList;
    //            productViewCtrl.categoryList = categoryList;
    //            spyOn(oc.Me, 'ListProducts').and.returnValue(null);
    //            productViewCtrl.loadMore();
    //        });
    //        it('should call the Me ListProducts method', function(){
    //            expect(oc.Me.ListProducts).toHaveBeenCalledWith(parameters.search, productViewCtrl.list.Meta.Page + 1, parameters.pageSize || productViewCtrl.list.Meta.PageSize, parameters.searchOn, parameters.sortBy, parameters.filters);
    //        });
    //    });
    //});
});