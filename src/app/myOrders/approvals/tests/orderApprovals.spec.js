describe('Component: orderApprovals', function() {

    var _ocApprovals,
        uibModalInstance;
    beforeEach(inject(function(ocApprovals) {
        _ocApprovals = ocApprovals;
        uibModalInstance = jasmine.createSpyObj('modalInstance', ['close', 'dismiss', 'result.then']);
    }));

    describe('State: orderDetail.approvals', function() {
        var orderApprovalsState;
        beforeEach(inject(function($stateParams) {
            mock.Order.ID = $stateParams.orderid;
            mock.Buyer.ID = $stateParams.buyerid;
            orderApprovalsState = state.get('orderDetail.approvals');

            var mockUserList = {Meta: 'mockMeta', Items: [{Username: 'test1', ID: 1}, {Username: 'test2', ID: 2}]};
            var defer = q.defer();
            defer.resolve(mockUserList);
            
            spyOn(_ocApprovals, 'List');
            spyOn(oc.Orders, 'ListEligibleApprovers').and.returnValue(defer.promise);
        }));
        it('should resolve OrderApprovals', function(){
            injector.invoke(orderApprovalsState.resolve.OrderApprovals);
            expect(_ocApprovals.List).toHaveBeenCalledWith(mock.Order.ID, mock.Buyer.ID, 1, 100);
        });
        it('should resolve CanApprove', function() {
            injector.invoke(orderApprovalsState.resolve.CanApprove);
            expect(oc.Orders.ListEligibleApprovers).toHaveBeenCalledWith(mock.Parameters);
        });
    });

    describe('Controller: OrderApprovalsCtrl', function(){
        var orderApprovalsCtrl,
            mockMeta,
            mockResponse,
            orderID,
            buyerID
        ;
        beforeEach(inject(function($controller){
            mockMeta = {Page: 2, PageSize: 15};
            mockResponse = {Items: [{ApprovalRuleID: 'Approval2', Status: 'Declined'}, {ApprovalRuleID: 'Approval3', Status: 'Pending'}], Meta: mockMeta};

            orderApprovalsCtrl = $controller('OrderApprovalsCtrl', {
                OrderApprovals: {Meta: {Page: 1, PageSize: 12}, Items: [{ApprovalRuleID: 'Approval1', Status: 'Approved'}] },
                CanApprove: true
            });

            var defer = q.defer();
            defer.resolve(mockResponse);
            spyOn(_ocApprovals, 'List').and.returnValue(defer.promise);
            spyOn(_ocApprovals, 'UpdateApprovalStatus');
        }));
        describe('vm.pageChanged', function(){
            it('should update results with page from vm.list.Meta.Page', function(){
                orderApprovalsCtrl.pageChanged();
                expect(_ocApprovals.List).toHaveBeenCalledWith(orderID, buyerID, 1, 12);
                scope.$digest();
                expect(orderApprovalsCtrl.list).toEqual(mockResponse);
            });
        });
        describe('vm.loadMore', function(){
            it('should concatenate next page of results with current list items', function(){
                var nextPage = orderApprovalsCtrl.list.Meta.Page + 1;
                orderApprovalsCtrl.loadMore();
                expect(_ocApprovals.List).toHaveBeenCalledWith(orderID, buyerID, nextPage, 12);
                scope.$digest();
                expect(orderApprovalsCtrl.list.Meta.Page).toBe(nextPage);
                expect(orderApprovalsCtrl.list.Items).toEqual([{ApprovalRuleID: 'Approval1', Status: 'Approved'}, {ApprovalRuleID: 'Approval2', Status: 'Declined'}, {ApprovalRuleID: 'Approval3', Status: 'Pending'}]);
            });
        });

        describe('vm.updateApprovalStatus', function(){
            it('should call ocApprovals.UpdateApprovalStatus', function(){
                var intent = 'Approve';
                orderApprovalsCtrl.updateApprovalStatus(intent);
                expect(_ocApprovals.UpdateApprovalStatus).toHaveBeenCalledWith(orderID, intent);
            });
        });
    });

    describe('Controller: OrderApprovalsModalCtrl', function(){
        var approvalModalCtrl;
        beforeEach(inject(function($controller, $stateParams, $exceptionHandler){
            var intent = 'Approve',
                orderID = 'testOrderID',
                exceptionHandler = $exceptionHandler,
                defer = q.defer();
            approvalModalCtrl = $controller('ApprovalModalCtrl', {
                Intent: intent,
                OrderID: orderID,
                $exceptionHandler: exceptionHandler,
                $uibModalInstance: uibModalInstance
            });
            defer.resolve();
            spyOn(toastrService, 'success');
            spyOn(oc.Orders, 'Approve').and.returnValue(defer.promise);
            spyOn(oc.Orders, 'Decline').and.returnValue(defer.promise);
        }));

        describe('vm.cancel', function(){
            it('should dismiss modal', function(){
                approvalModalCtrl.cancel();
                expect(uibModalInstance.dismiss).toHaveBeenCalled();
            });
        });

        describe('vm.submit', function(){
            it('should call OrderCloudSDK.Orders.Submit if intent is set to "Submit"', function(){
                approvalModalCtrl.intent = 'Approve';
                approvalModalCtrl.orderID = 'testOrderID';
                var direction = 'outgoing',
                    comments = null;
                approvalModalCtrl.submit(); 
                expect(oc.Orders.Approve).toHaveBeenCalledWith(direction, approvalModalCtrl.orderID, {comments: comments});
            });
            it('should call OrderCloudSDK.Orders.Decline if intent is set to "Decline"', function(){
                approvalModalCtrl.intent = 'Decline';
                approvalModalCtrl.orderID = 'testOrderID';
                var direction = 'outgoing',
                    comments = null;
                approvalModalCtrl.submit();
                expect(oc.Orders.Decline).toHaveBeenCalledWith(direction, approvalModalCtrl.orderID, {comments: comments});
            });
            it('should allow user to enter comments when approving', function(){
                approvalModalCtrl.intent = 'Approve';
                approvalModalCtrl.orderID = 'testOrderID';
                var direction = 'outgoing',
                    comments = null;
                approvalModalCtrl.submit(); 
                expect(oc.Orders.Approve).toHaveBeenCalledWith(direction, approvalModalCtrl.orderID, {comments: comments});
            });
            it('should allow user to enter comments when declining', function(){
                approvalModalCtrl.intent = 'Decline';
                approvalModalCtrl.orderID = 'testOrderID';
                var direction = 'outgoing',
                    comments = null;
                approvalModalCtrl.submit(); 
                expect(oc.Orders.Decline).toHaveBeenCalledWith(direction, approvalModalCtrl.orderID, {comments: comments});
            });
        });
    });

    describe('Service: ocApprovals', function() {
        var uibModal,
            page,
            pageSize,
            IDs,
            buyerID;
        beforeEach(inject(function($uibModal) {
            uibModal = $uibModal;
        }));
        it('should define methods', function(){
            expect(_ocApprovals.List).toBeDefined();
            expect(_ocApprovals.List).toEqual(jasmine.any(Function));
        });
        describe('Method: List', function() {
            beforeEach(function() {
                var defer = q.defer();
                defer.resolve();
                spyOn(oc.Orders, 'ListApprovals').and.returnValue(defer.promise);
                spyOn(oc.UserGroups, 'List');
                spyOn(oc.Users, 'List');
                spyOn(oc.ApprovalRules, 'List');
            });
            it('should get a list of approvals from the order', function() {
                var direction = 'outgoing',
                    orderID,
                    params = {
                        page: page,
                        pageSize: pageSize,
                        sortBy: 'Status'
                    };
                _ocApprovals.List();
                expect(oc.Orders.ListApprovals).toHaveBeenCalledWith(direction, orderID, params);
            });
            it('should get a list of user groups based on ApprovingGroupIDs returned from oc.Orders.ListApprovals', function() {
                _ocApprovals.List();
                var params = {
                    page: 1,
                    pageSize: 100,
                    filters: {
                        ID: IDs
                    }
                };
                expect(oc.UserGroups.List).toHaveBeenCalledWith(buyerID, params);
            })
        });
        describe('Method: UpdateApprovalStatus', function() {
            it('should open the modal to update the approval status', function() {
                spyOn(uibModal, 'open').and.callThrough();
                _ocApprovals.UpdateApprovalStatus();
                expect(uibModal.open).toHaveBeenCalledWith({
                    templateUrl: 'orders/orderApprovals/templates/approve.modal.html',
                    controller: 'ApprovalModalCtrl',
                    controllerAs: 'approvalModal',
                    size: 'md',
                    resolve: {
                        OrderID: jasmine.any(Function),
                        Intent: jasmine.any(Function)
                    }
                })
            });
        })
    });
});