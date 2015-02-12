

	var calibUi = {
		
        documentOffsetX:0,
        documentOffsetY:0,
		
		screenWidth:null,
		screenHeight:null,
		
		currentCenter:{},
		
		yawProp:'kvHeadX',
		pitchProp:'kvHeadY',
		
		yawMaxProp:"left",
		yawMinProp:"right",
		pitchMaxProp:"down",
		pitchMinProp:"up",
		
		isTracking:false,
		lastState:null,
		documentOffsetX : 0, // offset of HTML document origin from screen origin
		documentOffsetY : 0,
		
		calibDotPositions: "calibDot-topleft calibDot-topright calibDot-bottomleft calibDot-bottomright calibDot-center", // for easy removal
		screenMessagePositions: "screenMessage-bottom", // for easy removal
		
		calibMessageClasses: "calibDot--message-up calibDot--message-right calibDot--message-down calibDot--message-left calibDot--message-center", // for easy removal
		
		calibDotMovingAverage:0, /* the ma index to use for rendering the calibDot */
		
		thresholds:null,
		
		limits:{},
		
		rawLimits:{},
		
		thresholds:{},
		
		snap:{},
		
		overExtend:{},
		
		overExtendProportion:0.05, //at this point, give feedback that the users has moved too much
		overExtendExagerateFactor:1.1, //just the visual distance errors are inflated
		scaleErrorLevel:1.03,//when the user head dot turns red
		thresholdProportion:0.3, //determines the thresholds from limits
		
		snapProportion:0.25, //snap point
		
		errorThreshold: 0.5, // level that gazeScore needs to be for calib data to be sent
		
		uHeadClsUp:'calibDot--userHead-up',
		uHeadClsDown:'calibDot--userHead-down',
		uHeadClsLeft:'calibDot--userHead-left',
		uHeadClsRight:'calibDot--userHead-right',
		
		msgBaseCls:'calibDot--message',
		
		calibPoint:null, // the point that is sent as calibration data
		
		movingAverages: (function(){
			var ma = [5,10,15,20,25], maObj = [];
			for( var i = 0; i < ma.length; i++){
				maObj.push({ma:ma[i],yaw:null,pitch:null,val:{d:null, b:null, f:null, r:null, u:null} } );
			}
			return maObj;
		})(), 
		
		videoUrl:"http://localhost:9523/video?",
		
		statusProperties:{"kvRealtimeActive":1,
				"kvValidationEnabled":1,
				"kvValidationStatus":1,
				"kvValidationExcessYaw":0,
				//"kvValidationErrors":"[]",
				"kvCalibrationStatus":1,
				"kvGazeAccuracyByPrediction":"<=5",
				"kvGazeAccuracyByRobustness":"<=5"},
		
		validationCheckErrors:['f'], // the only one we are worrying about for now (plus position)
		validationCheckThreshold:0.5,
		positionCheckThreshold:0.2, 
		validationErrors:['d', 'b', 'f', 'r', 'u'], // lowercase versions of what comes through in kvValidationErrrors
		
		feedbackStatusMessages:{ 
			f:[
				"I can see you. Hi beautiful! ",
				"Dude! I can't work out where your face is."
			],
			p:[
				"Your head is right in the middle of the screen, thanks.",
				"Can you make sure your head is in the center of the screen?"
			]
		},
		
		sequences:[], //TODO: Nest the instructions and sub instruction sequences, last is current. when complete pop() until none left. Sub sequences can call an end type method too if it all goes to pot.
		
		seqIndices:[],
		
		start : function(e,mainInstructions, subSequences){
			console.log(e, this);
			
	        this.documentOffsetX = e.screenX - e.clientX;
	        this.documentOffsetY = e.screenY - e.clientY;


			this.setup();
			xlabs.calib.proxy.on();
			
			this.instructionsStart(mainInstructions,subSequences);
			
			this.$btns.hide();
		},
		
		setup : function() {
		  	console.log("alive");
			this.$calibInner = $('.calibDot--inner');
			this.dotRadius = $('.calibDot--inner').width() /2; 
			this.$userHead = $('.calibDot--userHead');
			this.$calibDot = $('.calibDot');
			this.$calibMessage = $('.calibDot--message');
			this.$calibMessageInner = $('.calibDot--message--inner .text');
			this.$gazeDot = $('.gazeDot');
			this.$help = $('.help');
			
			
			this.$btns = $('button');
			
			this.$debuggers = $('.debuggers');
			this.$debug =  $('.calibDebugger');
			this.$statedebug =  $('.stateDebugger');
			
			this.$screenMessage = $('.screenMessage');
			
			this.updateCalibPoint();
			
			this.stores = {yaw:[],pitch:[],x:[],y:[], gazeScore:[], val:{d:[], b:[], f:[], r:[], u:[]}};
			this.log = [];
			
			this.setupFeedback();
			this.isSetup = true;
		},
		
		setupFeedback:function(){
			
			var me = this;

			this.$feedback = $('.feedback');

			this.$feedbackVideo = this.$feedback.find('.video--feed');
			this.$feedbackVideo.append('<img src="img/xlabs.png" alt="web cam stream"/>');
			this.$feedbackVideoImg = this.$feedbackVideo.find('img');
			this.$feedbackVideoImg.on('load',function(){
				me.feedbackImageLoading = false;
			})
			
			this.$feedbackMessages = this.$feedbackVideo.find('.feedback-messages');
		
		},
		
		updateCalibPoint:function(t1,t2){
			// just use the last userHead position for now. In the new extension we can send a more granular position history
			var headOffset = this.$userHead.offset(),
				w = this.$userHead.width(),
				h = this.$userHead.height();
		
			this.calibPoint = {
				xs: this.documentOffsetX + headOffset.left + (w/2), 
				ys: this.documentOffsetY + headOffset.top + (h/2), 
				t1: t1,
				t2: t2
			};
		},

		onApiState : function( state ) {
			if(!this.simMode && this.isSetup){
				this.update(state);
			}
		},
		
		isNumeric:function(val) {
		    return Number(parseFloat(val))==val;
		},
		
		/*  limits, thresholds etc - values for categorising user headX and headY */
		updateThresholds:function(){
			if(this.lastState.kvValidationExcessYaw === 1 || this.currentCenter.pitch === null){
				return false;
			}
			
			
			
			
			this.limits[this.yawMaxProp] = this.isNumeric(this.limits[this.yawMaxProp]) ? Math.max(this.lastState[this.yawProp], this.limits[this.yawMaxProp]): this.lastState[this.yawProp] ;
			this.limits[this.yawMinProp] = this.isNumeric(this.limits[this.yawMinProp]) ? Math.min(this.lastState[this.yawProp], this.limits[this.yawMinProp]): this.lastState[this.yawProp] ;
			
			var yawRange = this.getAxisRange('yaw');
			
			// store the actual pitch limits - if the suggested limits dont fit within these bounds then shift the range
			this.rawLimits[this.pitchMinProp] = this.isNumeric(this.rawLimits[this.pitchMinProp]) ? Math.min(this.lastState[this.pitchProp], this.rawLimits[this.pitchMinProp] ) : this.lastState[this.pitchProp] ;
			this.rawLimits[this.pitchMaxProp] = this.isNumeric(this.rawLimits[this.pitchMaxProp]) ? Math.max(this.lastState[this.pitchProp], this.rawLimits[this.pitchMaxProp]): this.lastState[this.pitchProp] ;
			
			// limit pitch to the same scale as yaw - because we have the excessYaw error to capture reasonable level of movement
			// we also capture pitch center as a guage of comfortable cnter pitch
			// but use the raw limit to make sure we dont set an impossible range
			this.limits[this.pitchMinProp] = Math.max(this.rawLimits[this.pitchMinProp], this.currentCenter.pitch - (yawRange / 2) );
			this.limits[this.pitchMaxProp] = Math.min(this.rawLimits[this.pitchMaxProp], this.currentCenter.pitch + (yawRange / 2) );
			
			

			var pitchRange = this.getAxisRange('pitch');
			
			this.thresholds[this.pitchMaxProp] = this.limits[this.pitchMaxProp] - (this.thresholdProportion * pitchRange );
			this.thresholds[this.pitchMinProp] = this.limits[this.pitchMinProp] + (this.thresholdProportion * pitchRange );
			this.thresholds[this.yawMaxProp] = this.limits[this.yawMaxProp] - (this.thresholdProportion * yawRange );
			this.thresholds[this.yawMinProp] = this.limits[this.yawMinProp] + (this.thresholdProportion * yawRange );
			
			this.snap[this.pitchMaxProp] = this.limits[this.pitchMaxProp] - (this.snapProportion * pitchRange );
			this.snap[this.pitchMinProp] = this.limits[this.pitchMinProp] + (this.snapProportion * pitchRange );
			this.snap[this.yawMaxProp] = this.limits[this.yawMaxProp] - (this.snapProportion * yawRange );
			this.snap[this.yawMinProp] = this.limits[this.yawMinProp] + (this.snapProportion * yawRange );
			
			this.overExtend[this.pitchMaxProp] = this.limits[this.pitchMaxProp] - (this.overExtendProportion * pitchRange );
			this.overExtend[this.pitchMinProp] = this.limits[this.pitchMinProp] + (this.overExtendProportion * pitchRange );
			this.overExtend[this.yawMaxProp] = this.limits[this.yawMaxProp] - (this.overExtendProportion * yawRange );
			this.overExtend[this.yawMinProp] = this.limits[this.yawMinProp] + (this.overExtendProportion * yawRange );
								
		},
		
		updateStores:function(){
			var state = this.lastState,
				trimStores = false ; //TODO: not working, messes up limits. this.stores.yaw.length > this.movingAverages[this.movingAverages.length - 1].ma ? true : false ;
			
			// stores
			this.stores.yaw.push(state[this.yawProp]);
			this.stores.pitch.push(state[this.pitchProp]);
			this.stores.x.push(state.kvTrackingScreenX);
			this.stores.y.push(state.kvTrackingScreenY);
			this.stores.gazeScore.push(this.getGazeTrackingStatus(state));
			
			if(trimStores){
				//improve performance only store what we need
				this.stores.yaw.shift();
				this.stores.pitch.shift();
				this.stores.x.shift();
				this.stores.y.shift();
				this.stores.gazeScore.shift();
			}

			
			var errs = this.parseValidationErrors(state.kvValidationErrors);
			for(var i = 0; i < this.validationErrors.length; i++){
				var val = errs[this.validationErrors[i]] ? 1 : 0 ;
				this.stores.val[this.validationErrors[i]].push(val);
				if(trimStores){
					this.stores.val[this.validationErrors[i]].shift();
				}
			}
		},
		
		parseValidationErrors:function(errors){
			var err = {};
			for(var i = 0; i < errors[0].length; i++){
				err[errors[0].charAt(i).toLowerCase()] = true;
			}
			return err;
		},
		
		updateMovingAverages:function(){
			var state = this.lastState;
			//moving averages
			for(var i = 0; i < this.movingAverages.length; i++){
				if(this.stores.pitch.length >= this.movingAverages[i].ma ){
					var maStartIdx = this.stores.pitch.length - this.movingAverages[i].ma;
					var prevStartIdx = this.movingAverages[i].pitch == null ? null : maStartIdx - 1;
					this.movingAverages[i].pitch = prevStartIdx ? this.getArrayAverage(this.stores.pitch.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.pitch[this.stores.pitch.length - 1], this.stores.pitch[prevStartIdx], this.movingAverages[i].pitch, this.movingAverages[i].ma ) ;
					this.movingAverages[i].yaw = prevStartIdx ? this.getArrayAverage(this.stores.yaw.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.yaw[this.stores.yaw.length - 1], this.stores.yaw[prevStartIdx], this.movingAverages[i].yaw, this.movingAverages[i].ma ) ;
					this.movingAverages[i].x = prevStartIdx ? this.getArrayAverage(this.stores.x.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.x[this.stores.x.length - 1], this.stores.x[prevStartIdx], this.movingAverages[i].x, this.movingAverages[i].ma ) ;
					this.movingAverages[i].y = prevStartIdx ? this.getArrayAverage(this.stores.y.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.y[this.stores.yaw.length - 1], this.stores.y[prevStartIdx], this.movingAverages[i].y, this.movingAverages[i].ma ) ;
				
					this.movingAverages[i].xmin = prevStartIdx ? this.getArrayVal('min',this.stores.x.slice(maStartIdx)) : Math.min(this.movingAverages[i].xmin, this.stores.x[this.stores.x.length - 1]) ;
					this.movingAverages[i].xmax = prevStartIdx ? this.getArrayVal('max',this.stores.y.slice(maStartIdx)) : Math.min(this.movingAverages[i].xmax, this.stores.x[this.stores.x.length - 1]) ;
					this.movingAverages[i].ymin = prevStartIdx ? this.getArrayVal('min',this.stores.x.slice(maStartIdx)) : Math.min(this.movingAverages[i].ymin, this.stores.x[this.stores.y.length - 1]) ;
					this.movingAverages[i].ymax = prevStartIdx ? this.getArrayVal('max',this.stores.y.slice(maStartIdx)) : Math.min(this.movingAverages[i].ymax, this.stores.x[this.stores.y.length - 1]) ;
					
					this.movingAverages[i].gazeScore = prevStartIdx ? this.getArrayAverage(this.stores.gazeScore.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.gazeScore[this.stores.yaw.length - 1], this.stores.gazeScore[prevStartIdx], this.movingAverages[i].gazeScore, this.movingAverages[i].ma ) ;
					
					
					//kvValidationErrors
					// d b f r u | dark, bright, face , face res, uneven 
					for(var v = 0; v < this.validationErrors.length; v++){
						var e =  this.validationErrors[v];
						this.movingAverages[i].val[e] = prevStartIdx ? this.getArrayAverage(this.stores.val[e].slice(maStartIdx)) : this.getAdjustedAverage(this.stores.val[e][this.stores.yaw.length - 1], this.stores.val[e][prevStartIdx], this.movingAverages[i].val[e], this.movingAverages[i].ma ) ;
						//if(this.movingAverages[i].val[e] > 0){
						//console.log(this.movingAverages[i].ma,e,this.movingAverages[i].val[e]);
						//}
					}
					
				}else{
					break;
				}
			}
		},

		getAxisRange:function(axis,prop){
			prop = ( prop || 'limits' );
			
			var max = this[prop][this[axis+'MaxProp']] ;
			var min = this[prop][this[axis+'MinProp']];
			return max - min; 
		},
		
		categorisePitch:function(pitch){
			var cat = "center";
			if(pitch <= this.thresholds[this.pitchMinProp]){
				cat = this.pitchMinProp;
			}else if(pitch >= this.thresholds[this.pitchMaxProp]){
				cat = this.pitchMaxProp;
			}
			return cat;
		},

		categoriseYaw:function(yaw){
			var cat = "center";
			if(yaw <= this.thresholds[this.yawMinProp]){
				cat = this.yawMinProp;
			}else if(yaw >= this.thresholds[this.yawMaxProp]){
				cat = this.yawMaxProp;
			}
			return cat;
		},

		positionUserHead:function(pitch,yaw){
			// categorise pitch and yaw
			var removes = [],
				adds = [],
				state = this.lastState,
				p = (pitch || this.movingAverages[this.calibDotMovingAverage].pitch  || this.lastState[this.pitchProp]),
				yw = (yaw || this.movingAverages[this.calibDotMovingAverage].yaw  || this.lastState[this.yawProp]);
				if(!this.isNumeric(p+yw)){
					this.$userHead.hide();
					return false;
				}
			
			var y = this.normaliseAxis('pitch',p),
				x = this.normaliseAxis('yaw',yw),
				r = ( this.$calibDot.width() - this.$userHead.width() )  /2,
				scale = Math.max( Math.abs(x),Math.abs(y) ),
				theta = Math.atan2(y,x),
				xc = Math.round(r + (Math.cos(theta) * (scale * r))),
				yc = Math.round(r - (Math.sin(theta) * (scale * r))),
				yPx = yc + 'px',
				xPx = xc+'px';
				
			//console.log({x:x,y:y,p:p,yw:yw,xc:xc,yc:yc})
			this.$userHead.css({bottom:yPx, right:xPx });
			if(scale > this.scaleErrorLevel){
				this.$userHead.addClass('error');
			}else{
				this.$userHead.removeClass('error');
			}

			this.$userHead.show();
		},
		/* convert to -1  to 1 */
		normaliseAxis:function(axis,val){
			var adjVal,
				maxProp = this[axis+'MaxProp'], 
				minProp = this[axis+'MinProp'],
				scale =1;
				
			//if the value is in the error range then cap it to the limit (TODO, Now that pitch is determined from the yaw range, track actual limits for pitch so it's not such a hard block?).
			if(val > this.overExtend[maxProp]){
				adjVal = Math.min( this.limits[maxProp] , val);
				scale = 1 * this.overExtendExagerateFactor;
			}else if(val < this.overExtend[minProp]){
				scale = 1 / this.overExtendExagerateFactor;
				adjVal = Math.max( this.limits[minProp] , val);
			}else if( val < this.snap[maxProp] && val > this.snap[minProp] ){
				//if the value is in the middle then leave it as is.
				adjVal = val;
			}else{
				//otherwise snap it the edge of the circle
				adjVal = val >= this.snap[maxProp] ? this.snap[maxProp] : this.snap[minProp] ;
			}
			
			var r = (  ( (adjVal - this.overExtend[minProp]) / this.getAxisRange(axis, 'overExtend') * 2 ) - 1  ) * scale ;
			//console.log(axis,val,adjVal,r);
			return  r;
		},
		
		updateErrorState:function(){
			if(this.movingAverages[0].gazeScore <= this.errorThreshold){
				//this.$userHead.addClass('error');
			}else{
				//this.$userHead.removeClass('error');
			}
		},
		
		update:function(state){
			
			this.lastState = state;
			if((this.simMode || state.kvRealtimeEnabled === 1 ) && state.kvTrackingEnabled === 1 ){
				//this.logState(state);
				if(!this.isTracking){
					this.isTracking = true;
					this.$calibDot.show();
				}

				this.updateThresholds();
			
				this.updateStores();
				
				this.updateMovingAverages();
				
				this.updateErrorState();
				
				// positon the userhead marker( yellow dot)
				this.positionUserHead();

				// update the instructions
				if(this.instructionMode ){
					this.checkInstructions();
				}
				
				// update the gaze dot positon
				this.updateGazeDotPosition();
				
				
				// update the instructions
				if(this.feedbackMode && state.kvRealtimeActive && !this.simMode){
					this.updateFeedback();
				}
				
				//console.log('gaze x/y',state.kvTrackingScreenY , state.kvTrackingScreenX);
				
				//debug
				//this.$debug.val("Centre:\n"+this.printMe(this.currentCenter)+"\n\nLimits:\n"+this.printMe(this.limits)+"\n\nRaw limits:\n"+this.printMe(this.rawLimits)+"\nMA:"+this.printMe(this.movingAverages));

				//this.$statedebug.val(this.printObj(state));
				
			}else{
				if(this.isTracking){
					this.$calibDot.hide();
			/*
					var debug = [];
					debug.push('ymax: '+ Math.max.apply(Math,xlabs.calib.ui.stores.yaw) );
					debug.push('ymin: '+ Math.min.apply(Math,xlabs.calib.ui.stores.yaw) );
					debug.push('pmax: '+ Math.max.apply(Math,xlabs.calib.ui.stores.pitch) );
					debug.push('pmin: '+ Math.min.apply(Math,xlabs.calib.ui.stores.pitch) );

					this.$debug.html('<p>'+debug.join('</p><p>')+'</p>');*/
					this.isTracking = false;
				}
			}
			
			

		},
		
		printMe:function(v){
			if(!v){
				return '';
			}
			var str = '';
			switch(v.constructor){
				case Object:
					for(var p in v){
						str += "\n"+p+": "+ this.printMe(v[p]);
					}
					break;
				case Array:
					for(var i = 0 ; i < v.length; i ++){
						str += "\n"+i+": "+this.printMe(v[i]);
					}
					break;
				default:
					str += v;
					break;
			}
			return str;
		},

		printObj:function(o, specificProps){
			var str = '';
			if(specificProps){
				for(var i = 0; i < specificProps.length; i++){
					str += "\n"+specificProps[i]+": "+o[specificProps[i]];
				}
			}else{
				for(var p in o){
					str += "\n"+p+": "+o[p];
				}
			}

			return str;
		},
		
		logState:function(data){
			
		    var slimData = {
		        "persistentUpdateFps": data.persistentUpdateFps,
		        "kvTrackingScreenX":  data.kvTrackingScreenX,
		        "kvTrackingScreenY":  data.kvTrackingScreenY,
		        "kvTrackingEnabled":  data.kvTrackingEnabled,
		        "kvRealtimeActive":  data.kvRealtimeActive,
		        "kvCalibrationStatus":  data.kvCalibrationStatus,
		        "kvValidationEnabled":  data.kvValidationEnabled,
		        "kvValidationStatus":  data.kvValidationStatus,
		        "kvValidationErrors":  data.kvValidationErrors,
		        "kvValidationRegions":  data.kvValidationRegions,
		        "kvValidationExcessYaw":  data.kvValidationExcessYaw,
		        "kvGazeAccuracyByPrediction":  data.kvGazeAccuracyByPrediction,
		        "kvGazeAccuracyByRobustness":  data.kvGazeAccuracyByRobustness,
		        "kvGazeAccuracyByRobustnessEnabled":  data.kvGazeAccuracyByRobustnessEnabled,
		        "kvHeadX":  data.kvHeadX,
		        "kvHeadY":  data.kvHeadY,
		        "kvHeadZ":  data.kvHeadZ,
		        "kvHeadRoll":  data.kvHeadRoll,
		        "kvHeadPitch":  data.kvHeadPitch,
		        "kvHeadYaw":  data.kvHeadYaw
		    }
			
            this.log.push(slimData); 
        },
		
		updateGazeDotPosition:function(){
			var x = this.lastState.kvTrackingScreenY - this.documentOffsetX;
			var y = this.lastState.kvTrackingScreenX - this.documentOffsetY;
			this.$gazeDot.css({'top': x+'px', 'left': y+ 'px'});
		},

		getGazeTrackingStatus:function(state){
			var sumStatus = 0;
			var len = 0;
			for(var prop in this.statusProperties){
				len++;
				switch(this.statusProperties[prop]){
					case 1:
					case 0:
						sumStatus += state[prop] === this.statusProperties[prop] ? 1 : 0 ;
						break;
					case '<=5':
						sumStatus += state[prop] <= 5 ? 1 : 0 ;
					break;
					case '[]':
						sumStatus += state[prop].length === 0 || state[prop][0] === "" ? 1 : 0 ;
					break;
				}
			}
			return sumStatus / len;
		},
		
		simulateStart:function(data,e,calibInstructions,seq){
			
			
			this.simstart = Date.now();
			this.simMode = true;
			this.simData = data;
			this.simFps = this.simData[0].persistentUpdateFps;
			this.simDataIdx = 0;
			
	        this.documentOffsetX = e.screenX - e.clientX;
	        this.documentOffsetY = e.screenY - e.clientY;
			this.setup();
			
			this.$btns.hide();
			this.instructionsStart(calibInstructions,seq);
			
			this.simulateTimeout();
		},
		
		simulateStop:function(){
			this.simMode = false;
		},
		
		simulateTimeout : function() {
			var me = xlabs.calib.ui;
			var timeNow = Date.now();
			var timeElapsed = Math.max( 0, timeNow - me.simstart );
			//if(me.simData[me.simDataIdx].t - me.simData[0].t <= timeElapsed){
				me.update(me.simData[me.simDataIdx]);
				me.simDataIdx++;
			//}
			if(me.simMode && me.simDataIdx < me.simData.length){
		      	setTimeout( me.simulateTimeout, 1000 / me.simFps );
			}
		},
		
		
		/* this is the hub of instruction changes - probably could be named more grandly */
		checkInstructions:function(){
			var instructionObj = this.getCurrentInstruction();
			
			if(!instructionObj){
				return false;
			}
			var timeNow = Date.now(),
				timeElapsed = Math.max( 0, ( timeNow - instructionObj.start ) );
				
				
			if(timeElapsed > instructionObj.delay){
				
				// change this to switch on type?
				if(instructionObj.task){
					//console.log("Task called", instructionObj.task.method, instructionObj);
					this[instructionObj.task.method](instructionObj.task.param);
					this.updateInstructions(timeNow);

					return true;
				}
				if(!instructionObj.criteria){
					//console.log("No criteria so move to next instruction", instructionObj);
					this.updateInstructions(timeNow);
					return true;
				}
				if(instructionObj.passTime){
					if(instructionObj.passTime <= timeNow){
						//console.log("Time passed for instruction (criteria delay)", instructionObj);
						this.fireCriteriaSuccessEvent(instructionObj);
						this.updateInstructions(timeNow);
					}
					return true;
				}
				if(this.passCriteria(instructionObj) ){
					//console.log("Criteria passed", instructionObj);
					instructionObj.passTime = timeNow + instructionObj.criteria.delay ;
					this.setInstructionMessage(instructionObj.criteria.success, instructionObj.msgTarget);
					return true;
				}
				if( this.timedOut(instructionObj) ){
					//console.log("Time out for instruction", instructionObj);
					this.addSequence(instructionObj.criteria.failsequence);
					return true;
				}
			}
		},

		instructionsStart:function(mainInstructions,subSequences){

			this.mainSequence = mainInstructions;
			this.subSequences = subSequences;
			
			this.instructionMode = true;
			this.instructStart = Date.now();
			
			// sequences stores the levels of threads - instructions is the base level
			this.addSequence(this.mainSequence);
		},

		addSequence:function(seq){
			console.log('addSequence',seq);
			var o = (typeof seq === "object" ? seq : this.subSequences[seq]);
			if(o){
				this.sequences.push(o);
				this.seqIndices.push(0);

				this.setUpInstructions();
			}else{
				console.error('Unknown instruction sequence: '+seq);
			}
		},
		getCurrentInstruction:function(){
			return this.getInstructions()[this.getInstructionIdx()];
		},
		
		getInstructions:function(){
			return this.sequences[this.sequences.length -1];
		},
		
		getInstructionIdx:function(){
			return this.seqIndices[this.seqIndices.length -1];
		},
		setInstructionIdx:function(n){
			this.seqIndices[this.seqIndices.length -1] = n;
		},
		incrementInstructionIdx:function(){
			this.seqIndices[this.seqIndices.length -1]++;
		},
		
		updateInstructions:function(){
			if(this.sequences.length > 0){
				this.incrementInstructionIdx();
				if(this.getInstructionIdx() < this.getInstructions().length){
					this.setUpInstructions();
				}else{
					this.sequences.pop();
					this.seqIndices.pop();
					this.updateInstructions();
				}
			}else{
				this.instructionMode = false;
				console.log("No more instructions in any sequences, all done here");
			}
		},
		
		setUpInstructions:function(){
			var instructionObj = this.getCurrentInstruction();
			
			instructionObj.start = Date.now();
			
			//msg
			if(instructionObj.msg && !instructionObj.msgSet){
				instructionObj.msgSet = true;
				this.setInstructionMessage(instructionObj.msg, instructionObj.msgTarget);
			}
			
			//default - calib message - is no to have msgTarget property
			if(!instructionObj.msgTarget){
				var adds = this.getMessageClasses(instructionObj);
				this.$calibMessage.removeClass(this.calibMessageClasses).addClass(adds.join(' '));
				this.adjustMessagePosition();
			}	
		},
		
		setInstructionMessage:function(msg, target){
			if(target === "screen"){
				this.setScreenMessage(msg);
			}else{
				this.$calibMessageInner.html(msg);
			}	
		},
		
		passCriteria:function(instructionObj){
			if(!instructionObj.criteria){
				return true;
			}
			switch(instructionObj.criteria.type){
				case 'direction':
					switch(instructionObj.criteria.direction){
						case 'up':
						case 'down':
							var pitchCat = this.categorisePitch(this.movingAverages[instructionObj.criteria.ma].pitch);
							if(instructionObj.criteria.direction === pitchCat){
								//console.log(this.getInstructionIdx(),instructionObj,'Pitch criteria passed',pitchCat);
								return true;
							}else{
								//console.log(this.getInstructionIdx(),instructionObj,'Criteria Fail PitchCat:'+pitchCat+' != '+instructionObj.criteria.direction+' ma'+instructionObj.criteria.ma+':'+this.movingAverages[instructionObj.criteria.ma].pitch+ ' thresholds up:'+this.thresholdUp+' down:'+this.thresholdDown );
							}
							break;
						case 'left':
						case 'right':
							var yawCat = this.categoriseYaw(this.movingAverages[instructionObj.criteria.ma].yaw);
							if(instructionObj.criteria.direction === yawCat){
								//console.log(this.getInstructionIdx(),instructionObj,'Yaw criteria passed',yawCat);
								return true;
							}else{
								//console.log(this.getInstructionIdx(),instructionObj,'Criteria Fail YawCat:'+yawCat+' '+instructionObj.criteria.direction+' ma'+instructionObj.criteria.ma+':'+this.movingAverages[instructionObj.criteria.ma].yaw+ ' thresholds left:'+this.thresholdLeft+' right:'+this.thresholdRight );
							}
							break;
						}
					break;
				case 'calibrate':
					// check that the gaze x/y is within the threshold of the target
					//console.log(this.getInstructionIdx(),instructionObj,'calibrate passed',this.gazeAccuracy(instructionObj.criteria.ma), instructionObj.criteria.threshold);
					
					if(this.gazeAccuracy(instructionObj.criteria.ma) <= instructionObj.criteria.threshold){
						return true;
					}
					break;
				case 'calibrate-basic':
					// check that the gaze x/y is within the threshold of the target
					if(this.gazeMovement(instructionObj.criteria.ma) >= instructionObj.criteria.threshold){
						//console.log(this.getInstructionIdx(),instructionObj,'calibrate basic passed',this.gazeMovement(instructionObj.criteria.ma), instructionObj.criteria.threshold);
						return true;
					}
					break;
				case 'environment':
					return this.checkEnvironment(instructionObj.criteria.ma);
					break;
			}
			return false;
		},
		
		gazeAccuracy:function (ma){
		  var xs = this.movingAverages[ma].x - this.calibPoint.xs;
		  var ys = this.movingAverages[ma].y - this.calibPoint.ys;		
		  return this.lineDistance(xs,ys);
		},
		
		gazeMovement:function(ma){
			var xs = this.movingAverages[ma].xmax - this.movingAverages[ma].xmin;
			var ys = this.movingAverages[ma].ymax - this.movingAverages[ma].ymin;		
			return this.lineDistance(xs,ys);
		},
		
		checkEnvironment:function(ma){
			
			var msgList = [];
			var overallStatus = true; // if one item is in error then return false
			//checks validation (currently just face is there )and centered
			for(var i = 0; i < this.validationCheckErrors.length; i++){
				
				if(this.movingAverages[ma].val[this.validationCheckErrors[i]] <= this.validationCheckThreshold ){
					msgList.push({type:this.validationCheckErrors[i], error:0});
				}else{
					msgList.push({type:this.validationCheckErrors[i], error:1});
					overallStatus = false;
				}
				//console.log(this.validationCheckErrors[i], ma, this.movingAverages, this.validationCheckThreshold, msgList[msgList.length - 1],overallStatus);
			}
		
			if(Math.abs(this.movingAverages[ma].yaw) <= this.positionCheckThreshold  && Math.abs(this.movingAverages[ma].pitch) <= this.positionCheckThreshold  ){
				msgList.push({type:'p', error:0});
			}else{
				msgList.push({type:'p', error:1});
				overallStatus = false;
			}
			console.log(this.movingAverages[ma].yaw, this.movingAverages[ma].pitch, this.positionCheckThreshold, msgList, overallStatus);
			
			//update the feedback status list
			this.updateFeedbackStatus(msgList);
			
			return overallStatus;
		},
		
		lineDistance:function(xs,ys){
		  xs = xs * xs;
		  ys = ys * ys;
		  return Math.sqrt( xs + ys );
		},
		
		timedOut:function(instructionObj){
			var now = Date.now();
			return (now - instructionObj.expire > instructionObj.start);
		},
		fireCriteriaSuccessEvent:function(instructionObj){
			switch(instructionObj.criteria.type){
				case 'direction':
					// also check the error level
					if(this.movingAverages[instructionObj.criteria.ma].gazeScore >= this.errorThreshold){
						// send calibration data for the pass criteria duration and the success message period
						var passSample = (1000 / this.getFps())* this.movingAverages[instructionObj.criteria.ma].ma;
						this.updateCalibPoint( (instructionObj.passTime - passSample - instructionObj.criteria.delay ) , instructionObj.passTime );
						xlabs.calib.proxy.sendCalibrationData(this.calibPoint, true);
					}else{
						console.log("didnt fire calib data because of error threshold",instructionObj, this.movingAverages[instructionObj.criteria.ma].gazeScore);
					}
					break;
				case 'calibrate':
					// move on to next dot
					console.log("calibrate success");
					break;
			}
		},
		getMessageClasses:function(instructionObj){
			var clsArr = [this.msgBaseCls];
			if(instructionObj.criteria && instructionObj.criteria.type === "direction"){
				clsArr.push( this.msgBaseCls+"-"+instructionObj.criteria.direction );
			}else{
				clsArr.push( this.msgBaseCls+"-center" );
			}
			return clsArr;
		},
		getBodyClasses:function(instructionObj){
			var clsArr = [];
			if(instructionObj.criteria){
				switch(instructionObj.criteria.type){
					case "calibrate":
					case "calibrate-basic":
						clsArr.push('gaze-active');
						break;
				}
			}
			return clsArr;
		},
		adjustMessagePosition:function(height){
			var h = height ? height : $('.calibDot--message-up .text').height() ;
			$('.calibDot--message-up .text').css({'top': -(h +7 )+'px', 'bottom':'auto'});
			h = height ? height : $('.calibDot--message-down .text').height() ;
			$('.calibDot--message-down .text').css({'bottom': -( h +7 )+'px', 'top':'auto'});
		},
		getArrayAverage:function(arr){
			var sum = 0;
			for( var i = 0; i < arr.length; i++ ){
			    sum += arr[i];
			}
			return sum / arr.length;
		},
		/* Save lots of loops and get the adjusted average */
		getAdjustedAverage:function(pushed, shifted, prevAvg, len){
			return prevAvg + ((shifted - pushed) / len);
		},

		getArrayVal:function(mathProp, arr){
			var val = arr[0];
			for( var i = 1; i < arr.length; i++ ){
			    val = Math[mathProp](val, arr[i]);
			}
			return val;
		},
		

		getFps:function(){
			return this.lastState && this.lastState.persistentUpdateFps ? this.lastState.persistentUpdateFps : 10 ;
		},
		
		/* feedback methods */
		updateFeedback:function(){
			if(!this.feedbackImageLoading){
				this.$feedbackVideoImg.attr('src',this.videoUrl + Math.random());
				this.feedbackImageLoading = true;
			}
		},
		
		updateFeedbackStatus:function(msgList){
			var $children = this.$feedbackMessages.children();
			for(var i = 0; i < msgList.length; i++){
				var add = msgList[i].error ? 'error' : '' ;
				var remove = msgList[i].error ? '' : 'error' ;
				if($children.length === 0){
					//add status items
					this.$feedbackMessages.append('<li class='+add+'>'+this.getFeedbackStatusMessage(msgList[i])+'</li>')
				}else{
					//update status items html
					$children.eq(i).html(this.getFeedbackStatusMessage(msgList[i])).removeClass(remove).addClass(add);
				}
			}
			/*
			console.log('fb status',
				this.movingAverages[this.getCurrentInstruction().criteria.ma].val.f,
				this.movingAverages[this.getCurrentInstruction().criteria.ma].x,
				this.movingAverages[this.getCurrentInstruction().criteria.ma].y,
				this.posThresholdX,
				this.posThresholdY
			);*/
		
		},
		getFeedbackStatusMessage:function(msgObj){
			return this.feedbackStatusMessages[msgObj.type][msgObj.error];
		},
		
		/* task methods  - used by an instruction with a task:{} config */
		setCalibPosition:function(param){
			this.$calibDot.removeClass(this.calibDotPositions).addClass('calibDot-'+param);
			this.$debuggers.removeClass(this.calibDotPositions).addClass('calibDot-'+param);
			this.setCalibVisible(true);
		},
		setCalibVisible:function(bool){
			if(bool){
				this.$calibDot.show();
				this.$screenMessage.hide();
			}else{
				this.$calibDot.hide();
			}
		},
		setScreenMessageVisible:function(bool){
			if(bool){
				this.$screenMessage.show();
				this.$calibDot.hide();
			}else{
				this.$screenMessage.hide();
			}
		},
		setScreenMessage:function(msg){
			this.setScreenMessageVisible(true);
			if(typeof msg === "object"){
				this.$screenMessage.removeClass(this.screenMessagePositions).addClass("screenMessage-"+msg.pos);
			}else{
				this.$screenMessage.removeClass(this.screenMessagePositions)
			}
			this.$screenMessage.html(msg);
		},
		setGazeDotVisible:function(bool){
			if(bool){
				this.$gazeDot.show();
			}else{
				this.$gazeDot.hide();
			}
		},
		captureCenter:function(ma){
			//store the y as the users natural center
			this.currentCenter.pitch = this.movingAverages[ma].pitch
			//this.currentCenter.yaw = this.getArrayAverage([	this.limits[this.yawMinProp] , this.limits[this.yawMaxProp]]);
		},
		showFeedback:function(bool){
			if(bool){
				this.$feedback.show();
				this.feedbackMode = true;
			}else{
				this.$feedback.hide();
				this.feedbackMode = false;
			}
		},
		showHelp:function(bool){
			if(bool){
				this.$help.show();
			}else{
				this.$help.hide();
			}
		},
		stopCalibration:function(){
			xlabs.calib.proxy.off();
			this.isSetup = false;
		}
	};