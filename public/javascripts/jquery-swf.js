﻿	(function() {jQuery.swf = function(selector, options){	return new jQuery.swf.fn.init( selector, options );};jQuery.swf.fn = jQuery.swf.prototype = {	object_str: function(width, height){		return "<object id=\"jquery-swf-object-id\" classid=\"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\" codebase=\"http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0\" height=\""+ height +"\" width=\""+ width +"\">" +				"<param name=\"movie\" value=\"/javascripts/jquery.swf.swf\" />" +				"<param name=\"quality\" value=\"best\" />" +				"<param name=\"play\" value=\"true\" />" +				"<param name=\"allowScriptAccess\" value=\"always\" />" +				"<param name=\"swLiveConnect\" value=\"true\" />" +				"<embed swLiveConnect=\"true\" bgcolors=\"#000000\"  height=\""+ height +"\" allowScriptAccess=\"always\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" src=\"/javascripts/jquery.swf.swf\" type=\"application/x-shockwave-flash\" width=\""+ width +"\" quality=\"best\" play=\"true\"></embed>" +			"</object>";	},	init: function( selector, options ){				if( selector.nodeType ){			this[0] = selector;			return this;		}		else if(this[0]) return this;				var self = this;		var settings = jQuery.extend({			width: 350,			height: 50		}, options);				self.jq = $(selector);		if(self.jq.find("object").length == 0) 				self.jq.each(function(){ 				this.innerHTML = jQuery.swf.fn.object_str(settings.width, settings.height) 			});		self[0] = $.browser.mozilla ?  self.jq.find("embed").get(0) : self.jq.find("object").get(0);				var isready = function(){			if(self[0].call) self.ready(self[0]);			else window.setTimeout(isready, 100);		};				isready();		return self;	},	obj: function(name, class_name){		if(class_name) this[0].newClass(name, class_name);		this.obj_name = name;		return this;	},	call: function(func, params_0, params_1, params_2, params_3){		this.response = this[0].call(this.obj_name, func, params_0, params_1, params_2, params_3);		return this;	},	get: function(prop){		return this[0].get(this.obj_name, prop);	},	ready_funcs: [],	ready: function(func){		if(this[0].call && jQuery.isFunction(func)) func(this[0]);		else if(jQuery.isFunction(func)) jQuery.swf.fn.ready_funcs.push(func);		else if(func){			for(var i=0; i<jQuery.swf.fn.ready_funcs.length; i++) jQuery.swf.fn.ready_funcs[i]( func );		}		return this;	}	}jQuery.swf.fn.init.prototype = jQuery.swf.fn;})();