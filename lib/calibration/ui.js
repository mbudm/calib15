

	var calibUi = {
		
		isTracking:false,
		lastState:null,
		documentOffsetX : 0, // offset of HTML document origin from screen origin
		documentOffsetY : 0,
		
		/* Thresholds determined from example range:

		ymax: 0.190063223
		ymin: -0.167448059
		pmax: 0.989368975
		pmin: 0.504602909

		*/
		thresholdUp:0.63,
		thresholdDown:0.85,
		thresholdLeft:0.1,
		thresholdRight:-0.1,
		
		userUp:null,
		userDown:null,
		userRight:null,
		userLeft:null,
		
		uHeadClsUp:'calibDot--userHead-up',
		uHeadClsDown:'calibDot--userHead-down',
		uHeadClsLeft:'calibDot--userHead-left',
		uHeadClsRight:'calibDot--userHead-right',
		
		msgBaseCls:'calibDot--message',
		
		calibPoint:null, // the point that is sent as calibration data
		
		movingAverages: (function(){
			var ma = [5,10,15,20,25], maObj = [];
			for( var i = 0; i < ma.length; i++){
				maObj.push({ma:ma[i],yaw:null,pitch:null});
			}
			return maObj;
		})(), 

		setup : function() {
		  	console.log("alive");
			this.$calibInner = $('.calibDot--inner');
			this.dotRadius = $('.calibDot--inner').width() /2; 
			this.$userHead = $('.calibDot--userHead');
			this.$calibDot = $('.calibDot');
			this.$calibMessage = $('.calibDot--message');
			this.$calibMessageInner = $('.calibDot--message--inner .text');
			this.$gazeDot = $('.gazeDot');
			this.$debug =  $('.calibDebugger');
			
			this.updateCalibPoint();
			
			this.stores = {yaw:[],pitch:[],x:[],y:[]};
			this.log = [];
		},
		
		updateCalibPoint:function(t1,t2){
			var offset = this.$calibDot.offset(),
				w = this.$calibDot.width(),
				h = this.$calibDot.height();
		
			this.calibPoint = {
				xs: offset.left + (w/2), 
				ys: offset.top + (h/2), 
				t1: t1,
				t2: t2
			};
		},

		onApiState : function( state ) {
			if(!this.simMode){
				this.update(state);
			}
		},
		
		update:function(state){
			this.lastState = state;
			if(state.kvTrackingEnabled === 1){
				this.isTracking = true;
				this.$calibDot.show();
				
				this.$calibDot.addClass('calibDot-topleft');

				
				// positon the userhead marker( yellow dot)
				if(this.userUp === null){
					this.userUp = state.kvHeadPitch;
					this.userDown = state.kvHeadPitch;
					this.userRight = state.kvHeadYaw;
					this.userLeft = state.kvHeadYaw;
				}else{
					this.userUp = Math.max(state.kvHeadPitch, this.userUp);
					this.userDown = Math.min(state.kvHeadPitch, this.userDown);
					this.userLeft= Math.max(state.kvHeadYaw, this.userLeft);
					this.userRight = Math.min(state.kvHeadYaw, this.userRight);
				}
				
				// categorise pitch and yaw
				var removes = [];
				var adds = [];
				
				/* use?
				var pitchCat = this.categorisePitch(state.kvHeadPitch);
				var yawCat = this.categoriseYaw(state.kvHeadYaw);
				*/
				
				if(state.kvHeadPitch < this.thresholdUp){
					removes.push(this.uHeadClsDown);
					adds.push(this.uHeadClsUp);
				}else if(state.kvHeadPitch > this.thresholdDown){
					removes.push(this.uHeadClsUp);
					adds.push(this.uHeadClsDown);
				}else{
					removes.push(this.uHeadClsUp,this.uHeadClsDown);
				}
				if(state.kvHeadYaw < this.thresholdRight){
					removes.push(this.uHeadClsLeft);
					adds.push(this.uHeadClsRight);
				}else if(state.kvHeadYaw > this.thresholdLeft){
					removes.push(this.uHeadClsRight);
					adds.push(this.uHeadClsLeft);
				}else{
					removes.push(this.uHeadClsLeft,this.uHeadClsRight);
				}

				this.$userHead.removeClass(removes.join(' ')).addClass(adds.join(' '));
				
				
				// logs
				
				this.stores.yaw.push(state.kvHeadYaw);
				this.stores.pitch.push(state.kvHeadPitch);
				this.stores.x.push(state.kvTrackingScreenX);
				this.stores.y.push(state.kvTrackingScreenY);
				
				this.log.push({y:state.kvHeadYaw,p:state.kvHeadPitch,t:Date.now()}); //, state:state});
				
				
				//moving averages
				for(var i = 0; i < this.movingAverages.length; i++){
					if(this.log.length >= this.movingAverages[i].ma ){
						var maStartIdx = this.log.length - this.movingAverages[i].ma;
						var prevStartIdx = this.movingAverages[i].pitch == null ? null : maStartIdx - 1;
						this.movingAverages[i].pitch = prevStartIdx ? this.getArrayAverage(this.stores.pitch.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.pitch[this.stores.pitch.length - 1], this.stores.pitch[prevStartIdx], this.movingAverages[i].pitch, this.movingAverages[i].ma ) ;
						this.movingAverages[i].yaw = prevStartIdx ? this.getArrayAverage(this.stores.yaw.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.yaw[this.stores.yaw.length - 1], this.stores.yaw[prevStartIdx], this.movingAverages[i].yaw, this.movingAverages[i].ma ) ;
						this.movingAverages[i].x = prevStartIdx ? this.getArrayAverage(this.stores.x.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.x[this.stores.x.length - 1], this.stores.x[prevStartIdx], this.movingAverages[i].x, this.movingAverages[i].ma ) ;
						this.movingAverages[i].y = prevStartIdx ? this.getArrayAverage(this.stores.y.slice(maStartIdx)) : this.getAdjustedAverage(this.stores.y[this.stores.yaw.length - 1], this.stores.y[prevStartIdx], this.movingAverages[i].y, this.movingAverages[i].ma ) ;
					}else{
						break;
					}
				}
				
				
				// update the instructions
				if(this.instructionMode ){
					this.checkInstructions();
				}
				
				// update the gaze dot positon
				this.$gazeDot.css({'top': state.kvTrackingScreenY +'px', 'left':state.kvTrackingScreenX + 'px'});
				
				//debug
				
				this.$debug.val(JSON.stringify(this.movingAverages));
				
				
			}else{
				if(this.isTracking){
					this.$calibDot.hide();
			
					var debug = [];
					debug.push('ymax: '+ Math.max.apply(Math,xlabs.calib.ui.stores.yaw) );
					debug.push('ymin: '+ Math.min.apply(Math,xlabs.calib.ui.stores.yaw) );
					debug.push('pmax: '+ Math.max.apply(Math,xlabs.calib.ui.stores.pitch) );
					debug.push('pmin: '+ Math.min.apply(Math,xlabs.calib.ui.stores.pitch) );

					this.$debug.html('<p>'+debug.join('</p><p>')+'</p>');
					this.isTracking = false;
				}
			}
		},
		
		getGazeTrackingStatus:function(state){
			/*

			realtimeActive=1
			validationEnabled=1
			validationStatus=1
			validationExcessYaw=0
			validationNoFrames=0
			calibrationStatus=1 (if 2 then pose is not ideal)
			gazeAccuracy<=5 (larger values indicate lower accuracy)
			
			*/
		},
		
		simulateStart:function(){
			this.simstart = Date.now();
			this.simMode = true;
			this.simData = wholeState;
			this.simFps = this.simData[0].state.persistentUpdateFps;
			this.simDataIdx = 0;
			this.simulateTimeout()
		},
		
		simulateStop:function(){
			this.simMode = false;
		},
		
	    simulateTimeout : function() {
			var me = xlabs.calib.ui;
			var timeNow = Date.now();
			var timeElapsed = Math.max( 0, timeNow - me.simstart );
			if(me.simData[me.simDataIdx].t - me.simData[0].t <= timeElapsed){
				me.update(me.simData[me.simDataIdx].state);
				me.simDataIdx++;
			}
			if(me.simMode && me.simDataIdx < me.simData.length){
		      	setTimeout( me.simulateTimeout, 1000 / me.simFps );
			}
	    },
		
		checkInstructions:function(){
			var timeNow = Date.now();
			var timeElapsed = Math.max( 0, ( timeNow - this.instructions[this.instructionsIdx].start ) );
			if(timeElapsed > this.instructions[this.instructionsIdx].delay){
				if(!this.instructions[this.instructionsIdx].criteria){
					this.updateInstructions(timeNow);
					return true;
				}
				if(this.instructions[this.instructionsIdx].passTime){
					if(this.instructions[this.instructionsIdx].passTime <= timeNow){
						this.fireCriteriaSuccessEvent(this.instructions[this.instructionsIdx]);
						this.updateInstructions(timeNow);
					}
					return true;
				}
				if(this.passCriteria(this.instructions[this.instructionsIdx]) ){
					this.instructions[this.instructionsIdx].passTime = timeNow + this.instructions[this.instructionsIdx].criteria.delay ;
					this.$calibMessageInner.html(this.instructions[this.instructionsIdx].criteria.success);
					return true;
				}
				if( this.timedOut(this.instructions[this.instructionsIdx]) ){
					this.failsequence(this.instructions[this.instructionsIdx].criteria.failsequence);
					return true;
				}
			}
		},

		instructionsStart:function(){
			this.instructionMode = true;
			this.instructStart = Date.now();
			this.instructions = calibInstructions;
			this.instructionsIdx = 0;
			this.setUpInstructions();
		},
		updateInstructions:function(timeStamp){
			this.instructionsIdx++;
			if(this.instructionsIdx < this.instructions.length){
				this.setUpInstructions();
			}else{
				this.instructionMode = false;
			}
		},
		setUpInstructions:function(){
			var removes = this.instructionsIdx > 0 ? this.getMessageClasses(this.instructions[this.instructionsIdx - 1]) : [] ;
			var adds = this.getMessageClasses(this.instructions[this.instructionsIdx]);
			this.instructions[this.instructionsIdx].start = Date.now();
			this.$calibMessage.removeClass(removes.join(' ')).addClass(adds.join(' '));
			var height = this.$calibMessageInner.html(this.instructions[this.instructionsIdx].msg).height();
			this.adjustMessagePosition(height);
			
			//body class
			var removesBody = this.instructionsIdx > 0 ? this.getBodyClasses(this.instructions[this.instructionsIdx - 1]) : [] ;
			var addsBody = this.getBodyClasses(this.instructions[this.instructionsIdx]);
			$('body').removeClass(removesBody.join(' ')).addClass(addsBody.join(' '));
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
								console.log(this.instructionsIdx,instructionObj,'Pitch criteria passed',pitchCat);
								return true;
							}else{
								//console.log(this.instructionsIdx,instructionObj,'Criteria Fail PitchCat:'+pitchCat+' != '+instructionObj.criteria.direction+' ma'+instructionObj.criteria.ma+':'+this.movingAverages[instructionObj.criteria.ma].pitch+ ' thresholds up:'+this.thresholdUp+' down:'+this.thresholdDown );
							}
							break;
						case 'left':
						case 'right':
							var yawCat = this.categoriseYaw(this.movingAverages[instructionObj.criteria.ma].yaw);
							if(instructionObj.criteria.direction === yawCat){
								console.log(this.instructionsIdx,instructionObj,'Yaw criteria passed',yawCat);
								return true;
							}else{
								//console.log(this.instructionsIdx,instructionObj,'Criteria Fail YawCat:'+yawCat+' '+instructionObj.criteria.direction+' ma'+instructionObj.criteria.ma+':'+this.movingAverages[instructionObj.criteria.ma].yaw+ ' thresholds left:'+this.thresholdLeft+' right:'+this.thresholdRight );
							}
							break;
						}
					break;
				case 'calibrate':
					// check that the gaze x/y is within the threshold of the target
					if(this.gazeAccuracy(instructionObj.criteria.ma) <= instructionObj.criteria.threshold){
						console.log(this.instructionsIdx,instructionObj,'calibrate passed',this.gazeAccuracy(instructionObj.criteria.ma), instructionObj.criteria.threshold);
						return true;
					}
					break;
			}
			return false;
		},
		gazeAccuracy:function (ma){
		  var xs = 0;
		  var ys = 0;
 
		  xs = this.movingAverages[ma].x - this.calibPoint.xs;
		  xs = xs * xs;
 
		  ys = this.movingAverages[ma].y - this.calibPoint.ys;
		  ys = ys * ys;
 
		  return Math.sqrt( xs + ys );
		},
		timedOut:function(instructionObj){
			var now = Date.now();
			return (now - instructionObj.expire > instructionObj.start);
		},
		failsequence:function(seq){
			switch(seq){
				case 'directionFail':
					//debugger;
					console.log("failsequence", seq);
					break;
				case 'calibrateFail':
					//debugger;
					console.log("failsequence", seq);
					break;
			}
		},
		fireCriteriaSuccessEvent:function(instructionObj){
			switch(instructionObj.criteria.type){
				case 'direction':
					// send calibration data for the pass criteria duration and the success message period
					var passSample = (1000 / this.getFps())* this.movingAverages[instructionObj.criteria.ma].frames;
					this.updateCalibPoint( (instructionObj.passTime - passSample - instructionObj.criteria.delay ) , instructionObj.passTime );
					xlabs.calib.proxy.sendCalibrationData(this.calibPoint, true);
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
		getArrayAverage:function(arr, prevShiftVal, prevAvg){
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
		categorisePitch:function(pitch){
			var cat = "center";
			if(pitch < this.thresholdUp){
				cat = "up";
			}else if(pitch > this.thresholdDown){
				cat = "down";
			}
			return cat;
		},

		categoriseYaw:function(yaw){
			var cat = "center";
			if(yaw < this.thresholdRight){
				cat = "right";
			}else if(yaw > this.thresholdLeft){
				cat = "left";
			}
			return cat;
		},
		getFps:function(){
			return this.lastState && this.lastState.persistentUpdateFps ? this.lastState.persistentUpdateFps : 10 ;
		}
		
	};