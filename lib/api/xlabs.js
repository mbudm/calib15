var xLabs = ( xLabs || {} );
xLabs.api = {

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Variables
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  config : null,
  callbackReady : null,
  callbackState : null,

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Core API
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  getConfig : function( path ) {
    var value = this.getObjectProperty( this.config, path );
    //console.log( "getConfig( "+path+" = "+ value + " )" );
    return value;
  },

  setConfig : function( path, value ) {
    window.postMessage( { 
      target: "xLabs", 
      config: { 
        path: path, 
        value: value
      } 
    }, "*" );
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // JSON
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  getObjectProperty : function( object, path ) {
    if( ( object == undefined ) || ( object == null ) ) {
      return "";
    }
    //console.log( "Uril util"+path );
    var parts = path.split('.'),
        last = parts.pop(),
        l = parts.length,
        i = 1,
        current = parts[ 0 ];

    while( ( object = object[ current ] ) && i < l ) {
      current = parts[ i ];
      //console.log( "Util object: "+JSON.stringify( object ) );
      i++;
    }

    if( object ) {
      //console.log( "Util result: "+object[ last ] );
      return object[ last ];
    }
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Truth - data for gaze calibration. Basically you need to tell xLabs where the person is looking
  // at a particular time. 
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  setTruthEnabled : function( enabled ) {
    var value = "0";
    if( enabled ) {
      value = "1";
    } 
    this.setConfig( "truth.enabled", value );    
  },

  setTruthScreen : function( x, y ) {
    this.setConfig( "truth.x", x );    
    this.setConfig( "truth.y", y );    
  },

  calibrate : function( id ) {
    var request = "3p";
    if( id ) {
      request = id;
    }
    
    this.setConfig( "calibration.request", request );    
    console.log( "Calibrating..." );
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Time - in a compatible format.
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  getTimestamp : function() {
    // unified function to get suitable timestamps
    var dateTime = new Date();
    var timestamp = dateTime.getTime();
    return timestamp;
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Resolution
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  getDpi : function() {
    var dppx = window.devicePixelRatio ||
      (    window.matchMedia 
        && window.matchMedia( "(min-resolution: 2dppx), (-webkit-min-device-pixel-ratio: 1.5),(-moz-min-device-pixel-ratio: 1.5),(min-device-pixel-ratio: 1.5)" ).matches? 2 : 1 )
      || 1;

    var w = ( screen.width  * dppx );
    var h = ( screen.height * dppx );
    return this.calcDpi( w, h, 13.3, 'd' );
  },

  calcDpi : function( w, h, d, opt ) {
    // Calculate PPI/DPI
    // Source: http://dpi.lv/
    w>0 || (w=1);
    h>0 || (h=1);
    opt || (opt='d');
    var dpi = (opt=='d' ? Math.sqrt(w*w + h*h) : opt=='w' ? w : h) / d;
    return dpi>0 ? Math.round(dpi) : 0;
  }, 

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Coordinate conversion
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  documentOffset : function() {
    if( !this.documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var x = parseInt( this.getConfig( "browser.document.offset.x" ) );
    var y = parseInt( this.getConfig( "browser.document.offset.y" ) );
    return { x: x, y: y };
  },

  documentOffsetReady : function() {
    var ready = this.getConfig( "browser.document.offset.ready" );
    if( ready.localeCompare( "1" ) != 0 ) {
      return false;
    }
    return true;
  },

  scr2docX: function( screenX ) {
    if( !this.documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }

    var xOffset = this.getConfig( "browser.document.offset.x" );
    return screenX - window.screenX - xOffset;
  },

  scr2docY: function( screenY ) {
    if( !this.documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }

    var yOffset = this.getConfig( "browser.document.offset.y" );
    return screenY - window.screenY - yOffset;
  },

  scr2doc: function( screenX, screenY ) {
    return {
      x: this.scr2docX( screenX ),
      y: this.scr2docY( screenY )
    }
  },

  doc2scrX: function( documentX ) {
    if( !this.documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var xOffset = this.getConfig( "browser.document.offset.x" );
    return documentX + window.screenX + xOffset;
  },

  doc2scrY: function( documentY ) {
    if( !this.documentOffsetReady() ) {
      throw "Should not call scr2doc() unless mouse moved, i.e. browser.document.offset.ready == 1";
    }
    var yOffset = this.getConfig( "browser.document.offset.y" );
    return documentY + window.screenY + yOffset;
  },

  doc2scr: function( documentX, documentY ) {
    return {
      x: this.doc2scrX( documentX ),
      y: this.doc2scrY( documentY )
    }
  },

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // Setup
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  onApiState : function( config ) {
    this.config = config;
    if( this.callbackState != null ) {
      this.callbackState.call(this.callBackScope,config);
    }
  },

  onApiReady : function() {
    console.log( "xLabs API is ready." );
    if( this.callbackReady != null ) {
      this.callbackReady.call(this.callBackScope);
    }
  },

  setup : function(scope, callbackReady, callbackState) {
    this.callbackReady = callbackReady;
    this.callbackState = callbackState;
	this.callBackScope = scope;
	var me = this;
    // add event listeners
    document.addEventListener( "xLabsApiReady", function() {
      me.onApiReady();
    } );

    document.addEventListener( "xLabsApiState", function( event ) {
      me.onApiState( event.detail );
    } );
  }

};

// Usage: xLabs.api.setup( myCallbackFnReady, myCallbackFnState );

