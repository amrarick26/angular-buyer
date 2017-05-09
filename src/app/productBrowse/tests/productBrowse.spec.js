describe('Component: ProductBrowse', function(){

    var productBrowseService;
    beforeEach(inject(function(ocProductBrowse) {
        productBrowseService = ocProductBrowse;
    }));

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
    describe('State: productBrowse.products', function(){
        var productBrowseProductsState,
            currentUser;
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
            currentUser = mock.User;
            injector.invoke(productBrowseProductsState.resolve.ProductList);
            expect(oc.Me.ListProducts).toHaveBeenCalledWith(mock.Parameters);
        });
    });
    describe('Controller: ProductBrowseCtrl', function() {
        var productBrowseCtrl,
            categoryList,
            categoryTree;
        beforeEach(inject(function($controller) {
            productBrowseCtrl = $controller('ProductBrowseCtrl', {
                treeConfig: {

                },
                CategoryList: categoryList,
                CategoryTree: categoryTree
            })
        }));
        describe('vm.treeConfig.selectNode', function() {
            var node;
            beforeEach(function() {
                node = {
                    ID: 'testID'
                };
                spyOn(state, 'go');
                productBrowseCtrl.treeConfig.selectNode(node);
            });
            it('should go to productBrowse.products state with categoryid', function() {
                expect(state.go).toHaveBeenCalledWith('productBrowse.products', {categoryid: node.ID, page: ''});
            })
        });
        describe('vm.openCategoryModal', function() {
            beforeEach(function() {
                var defer =  q.defer();
                defer.resolve();
                spyOn(productBrowseService, 'OpenCategoryModal').and.returnValue(defer.promise);
                spyOn(state, 'go');
                productBrowseCtrl.openCategoryModal();
            });
            it('should call the ocProductBrowse service OpenCategoryModal method', function() {
                expect(productBrowseService.OpenCategoryModal).toHaveBeenCalledWith(productBrowseCtrl.treeConfig);
            });
            it('should go to productBrowse.products state with categoryid', function() {
                scope.$digest();
                expect(state.go).toHaveBeenCalledWith('productBrowse.products', {categoryid: mock.Category.ID, page: ''});
            })
        })
    });
    describe('Controller: ProductViewCtrl', function() {
        var productViewCtrl;
        beforeEach(inject(function($state, $controller) {
            var defer =  q.defer();
            defer.resolve();
            productViewCtrl = $controller('ProductViewCtrl', {
                ProductList: {
                    Items:['product1', 'product2'],
                    Meta:{
                        ItemRange:[1, 3],
                        TotalCount: 50,
                        Page: 1
                    }
                },
                CategoryList: {
                    Items: ['category1', 'category2'],
                    Meta: {
                        ItemRange: [1, 3],
                        TotalCount: 5
                    }
                }
            });
            spyOn(state, 'go');
            spyOn(ocParametersService, 'Create');
            spyOn(oc.Me, 'ListProducts').and.returnValue(defer.promise);
        }));
        describe('vm.filter', function() {
            it('should call the Me ListProducts method', function() {
                productViewCtrl.filter(true);
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, true);
            });
        });
        describe('vm.updateSort', function() {
            it('should reload page with value and sort order, if both are defined', function() {
                mock.Parameters.sortBy = '!ID';
                productViewCtrl.updateSort('!ID');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
            it('should reload page with just value, if no order is defined', function() {
                mock.Parameters.sortBy = 'ID';
                productViewCtrl.updateSort('ID');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
        });
        describe('vm.reverseSort', function() {
            it('should reload state with a reverse sort call', function() {
                mock.Parameters.sortBy = '!ID';
                productViewCtrl.reverseSort();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
        });
        describe('vm.pageChanged', function() {
            it('should reload the state with the incremented page parameter', function() {
                mock.Parameters.page = 'newPage';
                productViewCtrl.pageChanged('newPage');
                expect(state.go).toHaveBeenCalled();
                expect(ocParametersService.Create).toHaveBeenCalledWith(mock.Parameters, false);
            });
        });
        describe('vm.loadMore', function() {
            it('should load the next page of results with all the same parameters', function() {
                mock.Parameters.page = 1;
                productViewCtrl.loadMore();
                expect(oc.Me.ListProducts).toHaveBeenCalledWith(mock.Parameters);
            })
        })
    });
    describe('Service: ocProductBrowse', function() {
        var uibModal;
        beforeEach(inject(function($uibModal) {
            uibModal = $uibModal;
        }));

        describe('Method: OpenCategoryModal', function() {
            it('should open the modal for the mobile view category modal', function() {
                spyOn(uibModal, 'open').and.callThrough();
                productBrowseService.OpenCategoryModal();
                expect(uibModal.open).toHaveBeenCalledWith({
                    animation: true,
                    backdrop:'static',
                    templateUrl: 'productBrowse/templates/mobileCategory.modal.html',
                    controller: 'MobileCategoryModalCtrl',
                    controllerAs: 'mobileCategoryModal',
                    size: '-full-screen',
                    resolve: {
                        TreeConfig: jasmine.any(Function)
                        }
                    });
            })
        })
    })
});