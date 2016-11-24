describe('component: Company', function() {
  var $componentController;

  beforeEach(module('app'));
  beforeEach(inject(function(_$componentController_) {
    $componentController = _$componentController_;
  }));


  it('should expose a `hero` object', function() {
    // Here we are passing actual bindings to the component
    var bindings = {symbol: 'APPL'};
    var ctrl = $componentController('traderCompany', null, bindings);

    // To Be Defined
    expect(ctrl.symbol).toBeDefined();
    expect(ctrl.timeSpan).toBeDefined();
    expect(ctrl.getCompany).toBeDefined();

    // To Be
    expect(ctrl.symbol).toBe('APPL');
    expect(ctrl.timeSpan).toBe(366);

  });
});
