describe('Component: Checkout Confirmation', function() {

    fdescribe('State: confirmation', function() {
        var confirmationState,
            direction,
            orderID;
        beforeEach(inject(function() {
            confirmationState = state.get('confirmation');
            orderPayments = {
                Items: [{CreditCardID: 'mockCC_ID'}, {SpendingAccountID: 'mockSA_ID'}]
            };
            direction = 'outgoing';

            var submittedOrderDefer = q.defer();
            submittedOrderDefer.resolve(orderID);
            spyOn(oc.Orders, 'Get').and.returnValue(submittedOrderDefer.promise);


            spyOn(oc.Me, 'GetAddress').and.returnValue(dummyPromise);
            spyOn(oc.Orders, 'ListPromotions').and.returnValue(dummyPromise);

            var paymentsDefer = q.defer();
            paymentsDefer.resolve(orderPayments);
            spyOn(oc.Payments, 'List').and.returnValue(paymentsDefer.promise);
            spyOn(oc.Me, 'GetCreditCard').and.returnValue(dummyPromise);
            spyOn(oc.Me, 'GetSpendingAccount').and.returnValue(dummyPromise);

            var lineItemListDefer = q.defer();
            lineItemListDefer.resolve(mock.LineItems.Items);
            spyOn(oc.LineItems, 'List').and.returnValue(lineItemListDefer.promise);
        }));
        it('should call Me.Get for submitted order', function() {
            injector.invoke(confirmationState.resolve.SubmittedOrder);
            expect(oc.Orders.Get).toHaveBeenCalledWith(direction, orderID);
        });
        it('should call Me.GetAddress for ShippingAddressID', function() {
            injector.invoke(confirmationState.resolve.OrderShipAddress);
            expect(oc.Me.GetAddress).toHaveBeenCalledWith(mock.SubmittedOrder.ShippingAddressID);
        });
        it('should call Orders.ListPromotions', function() {
            injector.invoke(confirmationState.resolve.OrderPromotions);
            expect(oc.Orders.ListPromotions).toHaveBeenCalledWith(direction, mock.Order.ID);
        });
        it('should call Me.GetAddress for BillingAddressID', function() {
            injector.invoke(confirmationState.resolve.OrderBillingAddress);
            expect(oc.Me.GetAddress).toHaveBeenCalledWith(mock.SubmittedOrder.BillingAddressID);
        });
        it('should call Payments.List', function() {
            injector.invoke(confirmationState.resolve.OrderPayments);
            expect(oc.Payments.List).toHaveBeenCalledWith(direction, mock.SubmittedOrder.ID);
        });
        it('should call Me.GetCreditCard for first payment', function() {
            injector.invoke(confirmationState.resolve.OrderPayments);
            scope.$digest();
            expect(oc.Me.GetCreditCard).toHaveBeenCalledWith(orderPayments.Items[0].CreditCardID);
        });
        it('should call Me.GetSpendingAccount for second payment', function() {
            injector.invoke(confirmationState.resolve.OrderPayments);
            scope.$digest();
            expect(oc.Me.GetSpendingAccount).toHaveBeenCalledWith(orderPayments.Items[1].SpendingAccountID);
        });
        it('should call LineItems.List', function(){
            var parameters = {
                pageSize: 100
            };
            injector.invoke(confirmationState.resolve.LineItemsList);
            expect(oc.LineItems.List).toHaveBeenCalledWith(direction, mock.SubmittedOrder.ID, parameters);
        });
    });

    describe('Controller: ConfirmationCtrl', function(){
        var confirmCtrl,
            SubmittedOrder = 'FAKE_ORDER',
            OrderShipAddress = 'FAKE_SHIP_ADDRESS',
            OrderPromotions = {Items: 'FAKE_PROMOTIONS'},
            OrderBillingAddress = 'FAKE_BILL_ADDRESS',
            OrderPayments = {Items: 'FAKE_PAYMENTS'},
            LineItemsList = 'FAKE_LINE_ITEMS';
        beforeEach(inject(function($controller) {
            confirmCtrl = $controller('CheckoutConfirmationCtrl', {
                SubmittedOrder: SubmittedOrder,
                OrderShipAddress: OrderShipAddress,
                OrderPromotions: OrderPromotions,
                OrderBillingAddress: OrderBillingAddress,
                OrderPayments: OrderPayments,
                LineItemsList: LineItemsList
            });
        }));
        it ('should initialize the resolves into the controller view model', function() {
            expect(confirmCtrl.order).toBe(SubmittedOrder);
            expect(confirmCtrl.shippingAddress).toBe(OrderShipAddress);
            expect(confirmCtrl.promotions).toBe('FAKE_PROMOTIONS');
            expect(confirmCtrl.billingAddress).toBe(OrderBillingAddress);
            expect(confirmCtrl.payments).toBe('FAKE_PAYMENTS');
            expect(confirmCtrl.lineItems).toBe(LineItemsList);
        });
    });
});