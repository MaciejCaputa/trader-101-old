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





describe('Async', function() {



  var bindings;
  var ctrl;
  var $componentController;
  var originalTimeout;
  var ApiCompanyQuotes;



  beforeEach(module('app'));

  beforeEach(inject(function(_$componentController_, _ApiCompanyQuotes_) {
    $componentController = _$componentController_;
    ApiCompanyQuotes = _ApiCompanyQuotes_;

  }));

  beforeEach(function() {
    bindings = {symbol: 'APPL'};
    ctrl = $componentController('traderCompany', null, bindings);
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  beforeEach(function(done) {

    console.log(ApiCompanyQuotes);
    ApiCompanyQuotes.get(ctrl.symbol, ctrl.timeSpan)
      .then(response => {
        console.log(response);
        console.log(response);
        console.log(response);
        ctrl.company = response;
      });

      done();
  });

  beforeEach(function(done) {


    setTimeout(function () {
      console.log('Timeout Ends');
      console.log(ctrl);
      console.log(ctrl.company);
      done();
    }, 5000);
  });


  it('should expose a `hero` object', function(done) {
    // Here we are passing actual bindings to the component


    // To Be Defined
    expect(ctrl.symbol).toBeDefined();
    expect(ctrl.timeSpan).toBeDefined();
    expect(ctrl.getCompany).toBeDefined();
    expect(ctrl.company).toBeDefined();

    // To Be
    expect(ctrl.symbol).toBe('APPL');
    expect(ctrl.timeSpan).toBe(366);


    done();
  });



  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

});
