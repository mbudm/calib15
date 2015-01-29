	var calibProxy = {
		debug:null,
		on:function(){
			window.postMessage( {target:"xLabs", payload:{user:"calib2015"}},"*");
			window.postMessage( {target:"xLabs", payload:{calibrationClear:null}}, "*" );
			window.postMessage( {target:"xLabs", payload:{realtimeEnabled:1}}, "*" );
			window.postMessage( {target:"xLabs", payload:{trackingEnabled:1}}, "*" );
			window.postMessage( {target:"xLabs", payload:{pinpointEnabled:1}}, "*" );
			window.postMessage( {target:"xLabs", payload:{gazeLoggingEnabled:1}}, "*" );
			if(this.debug){
				window.postMessage( {target:"xLabs", payload:{trackMouse:1}}, "*" );
			}
		},
		off:function(){
			window.postMessage( {target:"xLabs", payload:{realtimeEnabled:0}}, "*" );
			window.postMessage( {target:"xLabs", payload:{trackingEnabled:0}}, "*" );
			window.postMessage( {target:"xLabs", payload:{pinpointEnabled:0}}, "*" );
			window.postMessage( {target:"xLabs", payload:{gazeLoggingEnabled:0}}, "*" );
			if(this.debug){
				window.postMessage( {target:"xLabs", payload:{trackMouse:0}}, "*" );
			}
		},
		calibrate:function(){
			window.postMessage( {target:"xLabs", payload:{calibrationRequested:1}}, "*" );
		},
		/*
		@params
		* calibPoint ({t1: Time start, t2: Time stop, xs: Screen X, ys: Screen Y}) Valid gaze data
		*/
		sendCalibrationData:function(calibPoint){
			$.ajax({
			  type: "POST",
			  url: "http:///xlabs:9522/servlets/click",
			  data: calibPoint
			});
		},
		debugMode:function(bool){
			this.debug = bool
		}
	};