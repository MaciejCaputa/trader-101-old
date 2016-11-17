/**
 * @copyright Maciej Caputa
 */


//** IIE Funciton */
(function () {

  //** Typing strict JavaScript */
  'use strict';

  /** Firebase configuraiton and initialisation */
  firebase.initializeApp({
    apiKey: "AIzaSyDOI86ugqPhQf-xx13JoKsEBVohjbxHQXE",
    authDomain: "stock-market-1b03a.firebaseapp.com",
    databaseURL: "https://stock-market-1b03a.firebaseio.com",
    storageBucket: "stock-market-1b03a.appspot.com",
    messagingSenderId: "916245876277"
  });

  /** Angular configuration */
  const config = {
    updateInterval: 60000,
    googleBaseUrl: 'https://finance.google.com/finance/info',
    quandlBaseUrl: 'https://www.quandl.com/api/v3/datasets/GOOG/',
    quandlApiKey: 'gHKV9BzNmyAVyyaQNJGT'
  };

  angular
    /** Initialisation of Angular's module, ngResource is injected since it is needed to have access to $resource object.*/
    .module('app', ['ngResource', 'firebase'])

    /** Initialisation of Angular's controller, $scope is passed as default, $resource is used to query Google's finance API to get real time data, $http is used to query Quandl EOD to get historic data.*/
    .controller('ctrl', ['$scope', '$firebaseObject', '$resource', '$http', function($scope, $firebaseObject, $resource, $http) {

      let
        rootRef = firebase.database().ref(),
        ref = rootRef.child('currentUser'),
        syncObject = $firebaseObject(ref);

      $scope.currentUser = syncObject;
      syncObject.$bindTo($scope, "currentUser");

      $scope.currentUser = $firebaseObject(ref);

      // Uncomment only for testing purposes
      // syncObject.$loaded()
      //   .then(function(e) {
      //     $scope.currentUser = CURRENT_USER;
      //   })
      //  .catch(function(error) {
      //     console.error("Error:", error);
      //   });

      /**
       * Evaluates student's balance.
       * Adds the transaction to closed transactions.
       * Removes the transaction from open transactions.
       * Updates changes in the database.
       */
      $scope.sell = function(index) {
        $scope.currentUser.balance = parseInt($scope.currentUser.balance, 10 )
                                   + parseInt( $scope.currentUser.transactions.open[index].marketValue, 10 );
        $scope.currentUser.transactions.closed.push( $scope.currentUser.transactions.open[index] );
        $scope.currentUser.transactions.open.splice(index, 1);
        // TODO: Update the database
      };

      // Making NASDAQ and FTSE objects, which composite of companies codes and full names as key-value paris, available in Angular
      $scope.NASDAQ = NASDAQ;
      $scope.FTSE = FTSE;

      // Initialisation
      $scope.currentUser = CURRENT_USER;
      $scope.view = 'quotes';

      /**
       * Getting quotes for specific market.
       * @param {string} marketSymbol - symbol of a stock market
       * @returns {Array} Returns an array of objects representing quotes statisitcs of a company.
       */
      function getMarketQuotes( marketSymbol ) {
        let
        query = constructQuery( marketSymbol.toUpperCase() ),
            googleFinance = $resource( config.googleBaseUrl,
                                      { client:'ig', callback:'JSON_CALLBACK'},
                                      { get: { method:'JSONP', params:{ q: query }, isArray: true } });
        return googleFinance.get();
      }

      /**
       * Request to Google's finance API to get FTSE 100 and NASDAQ 100 stock quotes.
       */
      function getQuotes() {
        $scope.quotesFTSE = getMarketQuotes( 'FTSE' );
        $scope.quotesNASDAQ = getMarketQuotes( 'NASDAQ' );
      }

      // Initial request on page load.
      getQuotes();

      // Stock quotes are updated every minute.
      setInterval(function() {
        getQuotes();
      }, config.updateInterval);




      $scope.normaliseCompanyName = function( companyName ) {

        companyName = companyName.split(' ');
        for (let i = 0; i < companyName.length; i++) {
          companyName[i] = companyName[i][0].toUpperCase() + companyName[i].substring(1).toLowerCase();
        }

        return companyName.join(' ');
      };
      /**
       * Getting historic quotes for a specific company.
       * @param {string} company - symbol of a company
       * @returns {Array} array of two-element arrays of date and end of the day quote.
       */
      $scope.getCompany = function(company) {
        let collapse, market, url;

        // When choosing a company card its symbol is saved and time span is set to default to one year.
        if (company !== undefined) {
          $scope.currentCompany = company;
          $scope.timeSpan = 366;
        }

         // Choosing an appropriate collapse for uplled data.
        if ($scope.timeSpan > 366) {
          collapse = 'weekly';
          $scope.timeSpan = Math.floor( $scope.timeSpan / 7 );
        } else {
          collapse = 'daily';
        }

        // Getting a corresponding symbol of a market.
        market = NASDAQ[$scope.currentCompany] ? 'NASDAQ' : 'LON';

        // Creating a request url.
         url = `${config.quandlBaseUrl}${market}_${$scope.currentCompany}.json`;


        // Making request to Quandl's API to get end of the day historic data.
        $http({method: 'GET', url: url, params: {api_key: config.quandlApiKey, rows: $scope.timeSpan, column_index: 4, collapse: collapse }})
          .then( (response) => {

            // Making pull data from Quandl available as $scope.company variable.
            $scope.company = response.data.dataset;

            // Ensuring that chart is initalised only after $scope.company is initialised.
            setTimeout(function() {
              plotGraph( $scope.company.data );
            }, 0);

          }, (err) => {
            // In case of error print error response.
            console.error(err);
          });
        };

      // Making concat function available in Angular's scope.
      $scope.concat = function(arr1, arr2) {
        return [].concat(arr1, arr2);
      };

      // Reploting graph when windows is resized.
      $( window ).resize(function() {
       plotGraph( $scope.company.data );
      });

      $( window ).change(function() {
       plotGraph( $scope.company.data );
      });

      // Ensuring proper dimension of a canvas element.

      $( 'svg' ).resize(function() {
       plotGraph( $scope.company.data );
      });

      $( 'svg' ).change(function() {
       plotGraph( $scope.company.data );
      });

    }]);

    // Helper function to create combined queries to google's api.
  function constructQuery( market ) {
    let query = '', i = 0, key;
    for (key in window[ market ]) {
      if (i > 0) {
        query += ',';
      }
      i++;
      query += market + ':' + key;
    }
    return query;
  };

  /**
   * Plotting a graph of a historic data of a company on a canvas.
   * @param {Array} historicData - array of two-element arrays of date and end of the day quote.
   */
  function plotGraph( historicData ) {
    // Declaring and initialising chart's variables.

    $( '#visualisation').width( window.innerWidth );
    // canvas.width = window.innerWidth;

    let
      parseDate = d3.time.format("%Y-%m-%d").parse,
      margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = $( '#visualisation').width(),
      height = $( '#visualisation').height(),
      vis = d3.select("#visualisation"),
      xRange, yRange, xAxis, yAxis,
      lineData = [],
      lineFunc;

    // Creating points which will be plotted on a grpah.
    for (let i = historicData.length - 1; i > 0; i--) {
      lineData.push({
        'x': parseDate( historicData[i][0] ),
        'y': historicData[i][1]
      });
    }

    // Ensuring that canvas is empty.
    d3.selectAll("svg > *").remove();

    // Getting a range of horizontal axis.
    xRange = d3.time.scale()
      .domain([new Date(lineData[0].x), d3.time.day.offset(new Date(lineData[lineData.length - 1].x), 1)])
      .rangeRound([0, width - margin.left - margin.right]);

    // Getting a range of vertical axis.
    yRange = d3.scale.linear()
      .range([height - margin.top - margin.bottom, 0])
      .domain([d3.min(lineData, function (d) { return d.y; }), d3.max(lineData, function (d) { return d.y; }) ]);

    // Initialising x-axis to be of a date format.
    xAxis = d3.svg.axis()
      .scale(xRange)
      .tickSize(1)
      .tickFormat(d3.time.format('%d/%m/%Y'))
      .tickSubdivide(true);

    // Initialising y-axis
    yAxis = d3.svg.axis()
      .scale(yRange)
      .tickSize(5)
      .orient("left")
      .tickSubdivide(true);

    // Appending x-axis to a chart.
    vis.append("svg:g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
      .call(xAxis);

    // Appending y-axis to a chart.
    vis.append("svg:g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
      .call(yAxis);

    // Initialising the graph that is to be plotted.
    lineFunc = d3.svg.line()
      .x(function (d) { return xRange(d.x); })
      .y(function (d) { return yRange(d.y); });

    // Appending the graph to the cart.
    vis.append("svg:path")
      .attr("d", lineFunc(lineData))
      .attr("stroke", "#00796B")
      .attr("stroke-width", 2)
      .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
      .attr("fill", "none");
  }



})();


  var
    CURRENT_USER = {
      name: "Maciej Caputa",
      balance: "100000",
      avatar: "https://maciejcaputa.com/assets/images/thumbnail-face.jpg",
      transactions: {
        open: [
          {
            symbol: "AAPL",
            name: "Apple Inc.",
            price: {
              open: 113.05
            },
            shares: 90,
            date: ""
          },
          {
            symbol: "GOOGL",
            name: "Alphabet Inc Class A",
            price: {
              open: 801.23
            },
            shares: 12,
            date: ""
          },
          {
            symbol: "MSFT",
            name: "Microsoft Corp",
            price: {
              open: 57.96
            },
            shares: 175,
            date: ""
          }
        ],
        closed: [
          {
            symbol: "AMZN",
            name: "Amazon.com Inc.",
            price: {
              open: 737.61,
              close: 844.36
            },
            shares: 10,
            date: "",
          },
          {
            symbol: "NFLX",
            name: "Netflix Inc.",
            price: {
              open: 82.79,
              close: 106.28
            },
            shares: 100,
            date: "",
          },
        ]
      }
    },
    // --- FTSE 100 (UK) and NASDAQ 100 (USA) Companies---
    FTSE = { 'ADN': 'Aberdeen Asset Management', 'ADM': 'Admiral Group', 'AGK': 'Aggreko', 'AMEC': 'AMEC', 'AAL': 'Anglo American plc', 'ANTO': 'Antofagasta', 'ABF': 'Associated British Foods', 'AZN': 'AstraZeneca', 'AV': 'Aviva', 'BAB': 'Babcock International', 'BA': 'BAE Systems', 'BARC': 'Barclays', 'BLT': 'BHP Billiton', 'BP': 'BP', 'BTI': 'British American Tobacco', 'BLND': 'British Land Co', 'BSY': 'BSkyB', 'BT_A': 'BT Group', 'BNZL': 'Bunzl', 'BRBY': 'Burberry Group', 'CPI': 'Capita', 'CUK': 'Carnival plc', 'CNA': 'Centrica', 'CCH': 'Coca-Cola HBC AG', 'CPG': 'Compass Group', 'CRH': 'CRH plc', 'CRDA': 'Croda International', 'DGE': 'Diageo', 'EVR': 'Evraz', 'EXPN': 'Experian', 'FRES': 'Fresnillo plc', 'GFS': 'G4S', 'GKN': 'GKN', 'GSK': 'GlaxoSmithKline', 'GLEN': 'Glencore International', 'HMSO': 'Hammerson', 'HL': 'Hargreaves Lansdown', 'HSBA': 'HSBC', 'IMI': 'IMI plc', 'IMT': 'Imperial Tobacco Group', 'IHG': 'InterContinental Hotels Group', 'IAG': 'International Consolidated Airlines Group SA', 'ITRK': 'Intertek Group', 'ITV': 'ITV plc', 'SBRY': 'J Sainsbury plc', 'JMAT': 'Johnson Matthey', 'KGF': 'Kingfisher plc', 'LAND': 'Land Securities Group', 'LGEN': 'Legal & General', 'LLOY': 'Lloyds Banking Group', 'MKS': 'Marks & Spencer Group', 'MGGT': 'Meggitt', 'MRO': 'Melrose plc', 'MRW': 'Morrison Supermarkets', 'NG': 'National Grid plc', 'NXT': 'Next plc', 'OML': 'Old Mutual', 'PSO': 'Pearson plc', 'PFC': 'Petrofac', 'PRU': 'Prudential plc', 'RRS': 'Randgold Resources', 'RB': 'Reckitt Benckiser', 'REL': 'Reed Elsevier', 'RIO': 'Rio Tinto Group', 'RR': 'Rolls-Royce Group', 'RBS': 'Royal Bank of Scotland Group', 'RDSA': 'Royal Dutch Shell', 'RSA': 'RSA Insurance Group', 'SAB': 'SABMiller', 'SGE': 'Sage Group', 'SDR': 'Schroders', 'SRP': 'Serco', 'SVT': 'Severn Trent', 'SHPG': 'Shire plc', 'SNN': 'Smith & Nephew', 'SMIN': 'Smiths Group', 'SSE': 'SSE plc', 'STAN': 'Standard Chartered', 'SL': 'Standard Life', 'TATE': 'Tate & Lyle', 'TSCO': 'Tesco', 'TLW': 'Tullow Oil', 'ULVR': 'Unilever', 'UU': 'United Utilities', 'VED': 'Vedanta Resources', 'VOD': 'Vodafone Group', 'WEIR': 'Weir Group', 'WTB': 'Whitbread', 'WOS': 'Wolseley plc', 'WG_': 'Wood Group', 'WPP': 'WPP plc' },
    NASDAQ = { 'FOXA': '21ST CENTRY FOX A CM', 'FOX': '21ST CENTRY FOX B CM', 'ATVI': 'ACTIVISION BLIZZARD', 'ADBE': 'ADOBE SYSTEMS INC', 'AKAM': 'AKAMAI TECHNOLOGIES', 'ALXN': 'ALEXION PHARM INC', 'GOOGL': 'ALPHABET CL A CMN', 'GOOG': 'ALPHABET CL C CAP', 'AMZN': 'AMAZON.COM INC', 'AAL': 'AMERICAN AIRLINES GP', 'AMGN': 'AMGEN', 'ADI': 'ANALOG DEVICES CMN', 'AAPL': 'APPLE INC.', 'AMAT': 'APPLIED MATERIALS', 'ADSK': 'AUTODESK INC', 'ADP': 'AUTOMATIC DATA PROCS', 'AVGO': 'AVAGO TECHNOLOGIES L', 'BIDU': 'BAIDU INC.', 'BBBY': 'BED BATH & BEYOND', 'BIIB': 'BIOGEN INC CMN', 'BMRN': 'BIOMARIN PHARMACEUT', 'CHRW': 'C.H. ROBINSON WW', 'CA': 'CA INC', 'CELG': 'CELGENE CORP', 'CERN': 'CERNER CORP', 'CHTR': 'CHARTER COMMUNICATIO', 'CHKP': 'CHECK POINT SOFTWARE', 'CSCO': 'CISCO SYSTEMS INC', 'CTXS': 'CITRIX SYSTEMS INC', 'CTSH': 'COGNIZANT TECH SOL', 'CMCSA': 'COMCAST CORP A', 'COST': 'COSTCO WHOLESALE', 'DISCA': 'DISCOVERY COMM A', 'DISCK': 'DISCOVERY COMM INC', 'DISH': 'DISH NETWORK CORP', 'DLTR': 'DOLLAR TREE INC', 'EBAY': 'EBAY INC.', 'EA': 'ELECTRONIC ARTS INC', 'EXPD': 'EXPEDITORS INTL', 'ESRX': 'EXPRESS SCRIPTS', 'FB': 'FACEBOOK INC', 'FAST': 'FASTENAL CO', 'FISV': 'FISERV INC.', 'GRMN': 'GARMIN LTD', 'GILD': 'GILEAD SCIENCES INC', 'HSIC': 'HENRY SCHEIN INC.', 'ILMN': 'ILLUMINA INC.', 'INCY': 'INCYTE CORPORATION', 'INTC': 'INTEL CORP', 'INTU': 'INTUIT INC', 'ISRG': 'INTUITIVE SURG INC.', 'JD': 'JD.COM INC. ADS', 'KLAC': 'K L A-TENCOR CORP', 'GMCR': 'KEURIG GREEN MTN CMN', 'KHC': 'KRAFT HEINZ CO CMN', 'LRCX': 'LAM RESEARCH CORP', 'LBTYA': 'LIBERTY GLOBAL ORD A', 'LBTYK': 'LIBERTY GLOBAL ORD C', 'QVCA': 'LIBERTY INT QVC SR A', 'LILA': 'LIBERTY LILAC CL A', 'LILAK': 'LIBERTY LILAC CL C', 'LMCK': 'LIBERTY MEDIA C', 'LMCA': 'LIBERTY MEDIA SRS A', 'LVNTA': 'LIBERTY VNTRS SRS A', 'LLTC': 'LINEAR TECHNOLOGY', 'MAR': 'MARRIOT INT CL A', 'MAT': 'MATTEL INC', 'MU': 'MICRON TECHNOLOGY', 'MSFT': 'MICROSOFT CORP', 'MDLZ': 'MONDELEZ INTL CMN A', 'MNST': 'MONSTER BEVERAGE CP', 'MYL': 'MYLAN NV ORD SHS', 'NTAP': 'NETAPP INC.', 'NFLX': 'NETFLIX INC.', 'NVDA': 'NVIDIA CORPORATION', 'NXPI': 'NXP SEMICONDUCTORS', 'ORLY': 'O\'REILLY AUTOMOTIVE', 'PCAR': 'PACCAR INC.', 'PAYX': 'PAYCHEX INC.', 'QCOM': 'QUALCOMM INC', 'REGN': 'REGENERON PHARMACEUT', 'ROST': 'ROSS STORES INC.', 'SNDK': 'SANDISK CORPORATION', 'SBAC': 'SBA COMMUNICATIONS', 'STX': 'SEAGATE TECHNOLOGY', 'SIRI': 'SIRIUS XM HOLDINGS I', 'SWKS': 'SKYWORKS SOLUTIONS', 'SPLS': 'STAPLES INC.', 'SBUX': 'STARBUCKS CORP', 'SRCL': 'STERICYCLE INC.', 'SYMC': 'SYMANTEC CORPORATION', 'TSLA': 'TESLA MOTORS INC', 'TXN': 'TEXAS INSTRUMENTS', 'PCLN': 'THE PRICELINE GP CM', 'TSCO': 'TRACTOR SUPPLY CO', 'TRIP': 'TRIPADVISOR INC.', 'VRSK': 'VERISK ANALYTICS INC', 'VRTX': 'VERTEX PHARMACEUTIC', 'VIAB': 'VIACOM INC CL B', 'VIP': 'VIMPELCOM LTD', 'VOD': 'VODAFONE GRP PLC ADS', 'WBA': 'WALGREENS BTS ALN CM', 'WDC': 'WESTERN DIGITAL CP', 'WFM': 'WHOLE FOODS MARKET', 'WYNN': 'WYNN RESORTS LIMITED', 'XLNX': 'XILINX INC.', 'YHOO': 'YAHOO! INC.' };
