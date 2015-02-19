var xLabs = ( xLabs || {} );
xLabs.calib = ( xLabs.calib || {} );
xLabs.calib.proxy = {
		debug:null,
		simulate:null,
		on:function(){
			if(!this.simulate){
				/*
				window.postMessage( {target:"xLabs", payload:{user:"calib2015dave"}},"*");
				window.postMessage( {target:"xLabs", payload:{calibrationClear:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{realtimeEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{trackingEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{pinpointEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{validationEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{gazeLoggingEnabled:1}}, "*" );
				if(this.debug){
					window.postMessage( {target:"xLabs", payload:{trackMouse:1}}, "*" );
				}
				*/
				xLabs.api.setConfig( "system.mode", "training" );
			}
		},
		off:function(){
			if(!this.simulate){
				/*
				window.postMessage( {target:"xLabs", payload:{realtimeEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{trackingEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{pinpointEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{gazeLoggingEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{validationEnabled:0}}, "*" );
				if(this.debug){
					window.postMessage( {target:"xLabs", payload:{trackMouse:0}}, "*" );
				}*/
				xLabs.api.setConfig( "system.mode", "off" );
			}
		},
		setCalibrationCapture:function(bool){
			if(!this.simulate){
				xLabs.setTruthEnabled( bool );
			}
		},
		
		/*
		@params
		* calibPoint ({t1: Time start, t2: Time stop, xs: Screen X, ys: Screen Y}) Valid gaze data
		*/
		sendCalibrationData:function(calibPoint){
			if(!this.simulate){
				xLabs.setTruthScreen( calibPoint.x, calibPoint.y );
			}
		},
		debugMode:function(bool){
			this.debug = bool
		},
		simMode:function(bool){
			this.simulate = bool
		}
	};