function $_(selecter){if(typeof selecter!="string"){return selecter;}try{return document.getElementById(selecter);}catch(ex){return null;}};
function formatBytes(bytes) {var s = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'];var e = Math.floor(Math.log(bytes)/Math.log(1024));return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];}
if (typeof(SWFUpload) === "function") {
	SWFUpload.handler = {};
	SWFUpload.prototype.removeAllFiles = function(){this.cancelUploadAll(true);};
	SWFUpload.prototype.requeueAll = function(){if(this.Status().count<=0)return;this.requeueUploadAll();};
	SWFUpload.prototype.Status=function(){return this.callFlash("Status");},
	SWFUpload.prototype.startUploadFiles=function(){if(this.Status().busy)return;if(this.Status().queued>0){this.setButtonDisabled();this.startUpload();}else {if(typeof StartErrorCallBack=="function")StartErrorCallBack();	}},
	SWFUpload.prototype.initSettings = (function (oldInitSettings) {
		return function () {
			if (typeof(oldInitSettings) === "function") {
				oldInitSettings.call(this, []);
			}
			this.handlerSettings={};
			this.ensureDefault = function (settingName, defaultValue) {
				this.settings[settingName] = (this.settings[settingName] == undefined) ? defaultValue : this.settings[settingName];
			};
			this.ensureDefault("bind_id", "moswf");
			this.ensureDefault("list_class", "filelist");
			this.ensureDefault("process_bar_class", "process_bar");
			this.ensureDefault("info_bar_class", "info_bar");
			this.ensureDefault("auto", false);
			delete this.ensureDefault;
			this.handlerSettings.totalBytes=0;
			this.handlerSettings.uploadTotalBytes=0;
			this.handlerSettings.uploadFileBytes=0;
			this.handlerSettings.bind=$_(this.settings["bind_id"]);
			if(this.handlerSettings.bind==null)return;
			this.handlerSettings.user_file_queued_handler = this.settings.file_queued_handler;
			this.handlerSettings.user_file_queue_error_handler = this.settings.file_queue_error_handler;
			this.handlerSettings.user_upload_start_handler = this.settings.upload_start_handler;
			this.handlerSettings.user_upload_error_handler = this.settings.upload_error_handler;
			this.handlerSettings.user_upload_progress_handler = this.settings.upload_progress_handler;
			this.handlerSettings.user_upload_success_handler = this.settings.upload_success_handler;
			this.handlerSettings.user_upload_complete_handler = this.settings.upload_complete_handler;
			this.handlerSettings.debug_handler= this.settings.debug_handler;
			
			this.settings.file_queued_handler = SWFUpload.handler.fileQueuedHandler;
			this.settings.file_queue_error_handler = SWFUpload.handler.fileQueueErrorHandler;
			this.settings.upload_start_handler = SWFUpload.handler.uploadStartHandler;
			this.settings.upload_error_handler = SWFUpload.handler.uploadErrorHandler;
			this.settings.upload_progress_handler = SWFUpload.handler.uploadProgressHandler;
			this.settings.upload_success_handler = SWFUpload.handler.uploadSuccessHandler;
			this.settings.upload_complete_handler = SWFUpload.handler.uploadCompleteHandler;
			this.settings.file_dialog_complete_handler = SWFUpload.handler.fileDialogComplete;
			this.settings.debug_handler = SWFUpload.handler.debug;
		};
	})(SWFUpload.prototype.initSettings);
	SWFUpload.handler.debug = function(msg){
		alert(msg);
	};
	SWFUpload.handler.fileQueuedHandler = function (file) {
		this.handlerSettings.totalBytes+=file.size;
		if(this.handlerSettings.bind==null)return;
		if($_(file.id)==null){
			var o = this.handlerSettings.bind;
			var list = document.createElement("div");
			list.className = this.settings["list_class"];
			list.id=file.id;
			o.appendChild(list);
			
			var processbar = document.createElement("div");
			processbar.id="b_" + file.id;
			processbar.className = this.settings["process_bar_class"];
			list.appendChild(processbar);
			
			var infobar = document.createElement("div");
			infobar.className = this.settings["info_bar_class"];
			infobar.id ="i_" + file.id;
			infobar.innerHTML= file.name + " <span id=\"p_" + file.id + "\">等待上传。[<a href=\"javascript:void(0)\" onclick=\"SWFUpload.instances['" + this.movieName + "'].removeOne('" + file.id + "');\">取消</a>]</span>";
			list.appendChild(infobar);
		}else{
			$_("b_" + file.id).style.width=0;
			$_("i_" + file.id).innerHTML=file.name + " <span id=\"p_" + file.id + "\">等待上传。[<a href=\"javascript:void(0)\" onclick=\"SWFUpload.instances['" + this.movieName + "'].removeOne('" + file.id + "');\">[取消]</a>]</span>";
		}
		if(typeof QueuedCallBack=="function"){
			$_("p_" + file.id).innerHTML= QueuedCallBack.apply(this,[file]);
		}
		if (typeof this.handlerSettings.user_file_queued_handler === "function") return this.handlerSettings.user_file_queued_handler.call(this, file);
	};
	
	SWFUpload.handler.fileQueueErrorHandler = function (file, errorCode, message) {
		var errorName='';
		switch (errorCode)
		{
			case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
				errorName = "只能同时上传 "+this.settings.file_upload_limit+" 个文件";
				break;
			case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
				errorName = "选择的文件超过了当前大小限制："+this.settings.file_size_limit;
				break;
			case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
				errorName = "零大小文件";
				break;
			case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
				errorName = "文件扩展名必需为："+this.settings.file_types_description+" ("+this.settings.file_types+")";
				break;
			default:
				errorName = "未知错误";
				break;
		}
		if(typeof QueueErrorCallBack=="function")QueueErrorCallBack(file,errorName,message);
		if (typeof this.handlerSettings.user_file_queue_error_handler === "function") return this.handlerSettings.user_file_queue_error_handler.call(this, file, errorCode, message);
	};
	SWFUpload.handler.fileDialogComplete = function(){
		if(this.settings["auto"] && this.Status().queued>0)this.startUploadFiles();
	};
	SWFUpload.handler.uploadStartHandler = function (file) {
		if(typeof StartCallBack=="function")$_("p_" + file.id).innerHTML=StartCallBack();
		if (typeof this.handlerSettings.user_upload_start_handler === "function") return this.handlerSettings.user_upload_start_handler.call(this, file);
	};
	
	SWFUpload.handler.uploadErrorHandler = function (file, errorCode, message) {
		//if(file.filestatus==-5)return;
		if(errorCode==SWFUpload.UPLOAD_ERROR.FILE_CANCELLED){
			if(typeof CancelledCallBack=="function")$_("p_" + file.id).innerHTML=CancelledCallBack.apply(this,[file.id]);
		}else{
			if(typeof FailedCallBack=="function")$_("p_" + file.id).innerHTML=FailedCallBack.apply(this,[message]);
		}
		if (typeof this.handlerSettings.user_upload_error_handler === "function") return this.handlerSettings.user_upload_error_handler.call(this, file, errorCode, message);
	};
	SWFUpload.handler.uploadProgressHandler = function (file, bytesComplete, bytesTotal) {
		this.handlerSettings.uploadTotalBytes=this.handlerSettings.uploadFileBytes+bytesComplete;
		var txt = (bytesComplete/bytesTotal)*100;
		txt = txt.toFixed(2);
		$_("b_" + file.id).style.width=txt+"%";
		$_("p_" + file.id).innerHTML=txt+"%";
		if(txt!="100.00" && typeof ProcessCallBack=="function")$_("p_" + file.id).innerHTML=ProcessCallBack(bytesComplete,bytesTotal);
		if(txt=="100.00" && typeof SavingCallBack=="function")$_("p_" + file.id).innerHTML=SavingCallBack();
		if (typeof this.handlerSettings.user_upload_progress_handler === "function") return this.handlerSettings.user_upload_progress_handler.call(this, file, bytesComplete, bytesTotal);
	};
	
	SWFUpload.handler.uploadSuccessHandler = function (file, serverData) {
		if(typeof SuccessCallBack=="function")$_("p_" + file.id).innerHTML=SuccessCallBack.apply(this,[file,serverData]);
		this.handlerSettings.uploadFileBytes+=file.size;
		if (typeof this.handlerSettings.user_upload_success_handler === "function") return this.handlerSettings.user_upload_success_handler.call(this, file, serverData);
	};
	SWFUpload.handler.uploadCompleteHandler = function (file) {
		if(this.Status().queued>0){
			this.startUpload();
		}else{
			this.setButtonDisabled(false);
		}
		if (typeof this.handlerSettings.user_upload_complete_handler === "function") return this.handlerSettings.user_upload_complete_handler.call(this, file);
	};
	function HandlerInit(Setting){var set_={flash_url : "swfupload/swfupload.swf",upload_url: Setting["upload_url"],file_post_name : Setting["file_post_name"],charset:Setting["charset"],post_params: {},file_types : Setting["file_types"],file_types_description : Setting["file_types_description"],file_size_limit : Setting["file_size_limit"],file_upload_limit : Setting["file_upload_limit"],file_queue_limit:0,custom_settings : {},button_append : Setting["button_append"],button_action:Setting["button_action"],button_width: Setting["button_width"],button_height: Setting["button_height"],button_window_mode:Setting["button_window_mode"],button_cursor: Setting["button_cursor"],button_image_url:Setting["button_image_url"],button_text: Setting["button_text"],button_text_style:Setting["button_text_style"],button_text_left_padding: Setting["button_text_left_padding"],bind_id: Setting["bind_id"],list_class: Setting["list_class"],process_bar_class: Setting["process_bar_class"],info_bar_class: Setting["info_bar_class"],auto: Setting["auto"],debug: false};for(var i in Setting){set_[i] = 	Setting[i];}return new SWFUpload(set_);}
}