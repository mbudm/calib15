	var calibProxy = {
		debug:null,
		simulate:null,
		on:function(){
			if(!this.simulate){
				window.postMessage( {target:"xLabs", payload:{user:"calib2015dave"}},"*");
				window.postMessage( {target:"xLabs", payload:{calibrationClear:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{realtimeEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{trackingEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{pinpointEnabled:1}}, "*" );
				window.postMessage( {target:"xLabs", payload:{gazeLoggingEnabled:1}}, "*" );
				if(this.debug){
					window.postMessage( {target:"xLabs", payload:{trackMouse:1}}, "*" );
				}
			}
		},
		off:function(){
			if(!this.simulate){
				window.postMessage( {target:"xLabs", payload:{realtimeEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{trackingEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{pinpointEnabled:0}}, "*" );
				window.postMessage( {target:"xLabs", payload:{gazeLoggingEnabled:0}}, "*" );
				if(this.debug){
					window.postMessage( {target:"xLabs", payload:{trackMouse:0}}, "*" );
				}
			}
		},
		calibrate:function(){
			if(!this.simulate){
				window.postMessage( {target:"xLabs", payload:{calibrationRequested:1}}, "*" );
			}
		},
		/*
		@params
		* calibPoint ({t1: Time start, t2: Time stop, xs: Screen X, ys: Screen Y}) Valid gaze data
		*/
		sendCalibrationData:function(calibPoint, calibrate){
			if(!this.simulate){
				$.ajax({
					type: "POST",
					url: "http://xlabs:9522/servlets/click",
					data: calibPoint
				});
				if(calibrate){
					//TODO: good to attach to succes callback
					this.calibrate();
				}
			}
		},
		debugMode:function(bool){
			this.debug = bool
		},
		simMode:function(bool){
			this.simulate = bool
		}
	};