/*
 * bring browser up to speed somewhat
 * NOTE: THESE PROTOTYPE METHODS ARE DUPLICATED IN util.js AND nondashboard-utils.js
 * 		KEEP THEM IDENTICAL
 */
if(!String.prototype.trim)
{
	String.prototype.trim = function()
	{
		var start = -1;
		var end = this.length;
		while(this.charCodeAt(--end) < 33);
		while(this.charCodeAt(++start) < 33);
		return this.slice(start, end + 1);
	};
}
if(!String.prototype.toBoolean)
{
	String.prototype.toBoolean = function()
	{
		switch(this.valueOf())
		{
			case "1":
				return true;
				break;
			case "0": case "": case "no": case "false":
			case "No": case "False": case "NO": case "FALSE":
				return false;
				break;
			default:
				return true;
		}
	};
}

if(!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(value, fromIndex)
	{
		var len = this.length;
		if(fromIndex == null)
			fromIndex = 0;
		else if(fromIndex < 0)
			fromIndex = Math.max(0, len + fromIndex);
		for(var i = fromIndex; i < len; i++)
		{
			if(this[i] === value)
				return i;
		}
		return -1;
	};
}

if (!Array.prototype.last)
{
	Array.prototype.last = function() {return this[this.length-1];}
}
var EventCache=function()
{
	var listEvents=[];
	return{
		listEvents: listEvents,
		add: function(node,sEventName,fHandler,bCapture)
		{
			listEvents.push(arguments);
		},

		flush: function()
		{
			var i, item;
			for(i=listEvents.length-1;i>=0;i=i-1)
			{
				item=listEvents[i];
				if(!item)
					continue;
				if(item[0].removeEventListener)
					item[0].removeEventListener(item[1],item[2],item[3]);
				var logical_type='';
				if(item[1].substring(0,2)!="on")
				{
					logical_type=item[1];
					item[1]="on"+item[1];
				}
				else
					logical_type=item[1].substring(2,event_name_without_on.length);
				if(typeof item[0].__eventHandlers!='undefined'&&typeof item[0].__eventHandlers[logical_type]!='undefined')
					item[0].__eventHandlers[logical_type]=null;
				if(item[0].detachEvent)
					item[0].detachEvent(item[1],item[2]);
				item[0][item[1]]=null;
			};
			listEvents=null;
		}
	}
}();

function flashMsg(msg, width, timeToKeep)
{
	var FLASH_MSG_ID = 'cs_flashMsg'; // id of html object that shows the msg
	var timeToKeep = typeof timeToKeep != 'undefined' ? timeToKeep : 5000;
	if(!width)
		var width = 200;
	var div = document.createElement('div');
	div.id = FLASH_MSG_ID;
	div.style.width = width + 'px';
	div.style.marginLeft = (-width / 2) + 'px'; // minus half the width, to center on pg
	div.className = 'cs_flashMsg';
	div.innerHTML = msg;
	div.onclick = close; // let user close it; probably not needed, but safe
	document.body.appendChild(div);
	setTimeout(close, timeToKeep); // kill msg after a while in case page isn't going to reload

	function close()
	{
		var div = document.getElementById(FLASH_MSG_ID);
		if(div)
			div.parentNode.removeChild(div);
	}
}

/* start functions used by lightbox */
function OnMouseDown(e)
{
	// IE is retarded and doesn't pass the event object
	if (e == null)
		e = window.event;
   if(typeof e.stopPropagation!='undefined')
      e.stopPropagation();
   else
      e.cancelBubble=true;
	// IE uses srcElement, others use target
	var target = e.target != null ? e.target : e.srcElement;
	if (_debug)
		_debug.innerHTML = target.className == 'drag'
		? 'draggable element clicked'
		: 'NON-draggable element clicked';
	target = getDraggableTarget(target);
	// for IE, left click == 1
	// for Firefox, left click == 0
	if ((e.button == 1 && window.event != null ||
		e.button == 0) && target)
	{
		// grab the mouse position
		_startX = e.clientX;
		_startY = e.clientY;

		// grab the clicked element's position
		_offsetX = ExtractNumber(target.style.left);
		_offsetY = ExtractNumber(target.style.top);

		// bring the clicked element to the front while it is being dragged
		_oldZIndex = target.style.zIndex;
		target.style.zIndex = 10000;

		// we need to access the element in OnMouseMove
		_dragElement = target;

		// tell our code to start moving the element with the mouse
		document.onmousemove = OnMouseMove;

		// cancel out any text selections
		document.body.focus();

		// prevent text selection in IE
		document.onselectstart = function () { return false; };
		// prevent IE from trying to drag an image
		target.ondragstart = function() { return false; };

		// prevent text selection (except IE)
		return false;
	}
}

function OnMouseUp(e)
{
	if (_dragElement != null)
	{
		_dragElement.style.zIndex = _oldZIndex;

		// we're done with these events until the next OnMouseDown
		document.onmousemove = null;
		document.onselectstart = null;
		_dragElement.ondragstart = null;

		// this is how we know we're not dragging
		_dragElement = null;
		if (_debug)
			_debug.innerHTML = 'mouse up';
	}
}

function OnMouseMove(e)
{
	if (e == null)
		var e = window.event;
   if(typeof e.stopPropagation!='undefined')
      e.stopPropagation();
   else
      e.cancelBubble=true;

	// this is the actual "drag code"
	_dragElement.style.left = (_offsetX + e.clientX - _startX) + 'px';
	_dragElement.style.top = (_offsetY + e.clientY - _startY) + 'px';
	if (_debug)
		_debug.innerHTML = '(' + _dragElement.style.left + ', ' + _dragElement.style.top + ')';
}

function ExtractNumber(value)
{
	var n = parseInt(value);

	return n == null || isNaN(n) ? 0 : n;
}

function getDraggableTarget(obj)
{
	if (obj.className && (obj.className).indexOf('drag') >= 0)
		return obj;
	if (obj.offsetParent)
	{
		while(obj=obj.offsetParent)
		{
			if (obj.className && (obj.className).indexOf('drag') >= 0)
				return obj;
		}
	}
	return null;
}
/* END functions used by lightbox */

// this function is duplicated in browser-all.js and util.js; if you change one, change the other!
function BrowserCheck()
{
	var b = navigator.appName.toString();
	var b_ver;
	var up = navigator.platform.toString();
	var ua = navigator.userAgent.toString().toLowerCase();
	var re_opera = /Opera.([0-9\.]*)/i;
	var re_msie = /MSIE.([0-9\.]*)/i;
	var re_gecko = /gecko/i;
	// IE11 user-agent string ------ mozilla/5.0 (windows nt 6.1; wow64; trident/7.0; slcc2; .net clr 2.0.50727; rv:11.0) like gecko
	var re_msie_11 = /rv:([0-9\.]*)/i;
	// mozilla/5.0 (macintosh; u; intel mac os x 10_6_7; en-us) applewebkit/533.20.25 (khtml, like gecko) version/5.0.4 safari/533.20.27
	var re_safari = /safari\/([\d\.]*)/i;
	var re_mozilla = /firefox\/([\d\.]*)/i;
	var re_chrome = /chrome\/([\d\.]*)/i;
	var ie_documentMode = 0;
	var browserType = {};
	var ie11 = !!ua.match(/trident.*rv[ :]*11\./);
	browserType.mozilla = browserType.ie = browserType.opera = r = false;
	browserType.version = (ua.match(/.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/) || [])[1];
	browserType.chrome = /chrome/.test(ua);
	browserType.safari = /webkit/.test(ua) && !/chrome/.test(ua);
	browserType.opera = /opera/.test(ua);
	browserType.ie = /msie/.test(ua) && !/opera/.test(ua);
	browserType.mozilla = /mozilla/.test(ua) && !/(compatible|webkit)/.test(ua) && !/trident/.test(ua);
	browserType.ie_documentMode = 0;
	if (ua.match(re_opera))
	{
	    r = ua.match(re_opera);
	    browserType.version = parseFloat(r[1]);
	}
	else if (ua.match(re_msie))
	{
	    r = ua.match(re_msie);
	    browserType.version = parseFloat(r[1]);
	    ie_documentMode = browserType.version;
	    if (browserType.version <= 7)
	    {
	        re_ver = /trident\/([\d\.]*)/i;
	        r = ua.match(re_ver);
	        // in IE compat mode, trident=4.0 (IE8), =5.0 (IE9), =6.0 (IE10) etc, i.e, version=trident+4.
	        if (r && parseFloat(r[1]) >= 4)
	        {
	            browserType.version = parseFloat(r[1]) + 4;
	            ie_documentMode = document.documentMode;
	        }
	    }
	}
	else if ((ua.match(re_msie_11) && /trident/.test(ua)) || ie11) // IE browser, version higher than 10
	{
		r = ua.match(re_msie_11);
		browserType.ie = true;
		browserType.mozilla = false;
		browserType.version = parseFloat(r[1]);
		ie_documentMode = browserType.version;
		re_ver = /trident\/([\d\.]*)/i;
		r = ua.match(re_ver);
		// in IE compat mode, trident=4.0 (IE8), =5.0 (IE9), =6.0 (IE10) etc, i.e, version=trident+4.
		if (r && parseFloat(r[1]) >= 4)
		{
		    browserType.version = parseFloat(r[1]) + 4;
		    ie_documentMode = document.documentMode;
		}
	}
	else if (browserType.safari && !browserType.chrome)
	{
	    re_ver = /version\/([\d\.]*)/i;
	    if (ua.match(re_ver))
	    {
	        r = ua.match(re_ver);
	        browserType.version = parseFloat(r[1]);
	    }
	}
	else if (browserType.chrome)
	{
	    b_ver = ua.match(re_chrome);
	    r = b_ver[1].split('.');
	    browserType.version = parseFloat(r[0]);
	}
	else if (ua.match(re_gecko))
	{
	    var re_gecko_version = /rv:\s*([0-9\.]+)/i;
	    r = ua.match(re_gecko_version);
	    browserType.version = parseFloat(r[1]);
	    if (ua.match(re_mozilla))
	    {
	        r = ua.match(re_mozilla);
	        browserType.version = parseFloat(r[1]);
	    }
	}
	else if (ua.match(re_mozilla))
	{
	    r = ua.match(re_mozilla);
	    browserType.version = parseFloat(r[1]);
	}
	browserType.windows = browserType.mac = browserType.linux = false;
	browserType.Platform = ua.match(/windows/i) ? "windows" : (ua.match(/linux/i) ? "linux" : (ua.match(/mac/i) ? "mac" : ua.match(/unix/i) ? "unix" : "unknown"));
	this[browserType.Platform] = true;
	browserType.v = browserType.version;
	browserType.valid = browserType.ie && browserType.v >= 6 || browserType.mozilla && browserType.v >= 1.4 || browserType.safari && browserType.v >= 5 || browserType.chrome && browserType.v >= 12;
	browserType.okToAuthor = (browserType.ie && browserType.v >= 8 && ie_documentMode >= 7) || browserType.mozilla && browserType.v >= 3.6 || browserType.safari && browserType.v >= 5 || browserType.chrome && browserType.v >= 12;
	browserType.ie_documentMode = ie_documentMode;
	if (browserType.safari && browserType.mac && browserType.mozilla)
		browserType.mozilla=false;
	return browserType;
};

function removeDuplicateParams(qParams)
{
	var nParams = '';
	var qParams = qParams.replace('&amp;', '&');
	var fLtr = qParams.substr(0,1);
	if (fLtr == '&')
		nParams = fLtr;
	else if (fLtr == '?')
	{
		nParams = fLtr;
		qParams = qParams.replace('?', '');
	}
	var qArr = qParams.split('&');
	var cArr = '';
	for (var i=0; i<qArr.length; i++)
	{
		cArr = qArr[i].split('=');
		if (cArr[0] == '')
			continue;
		if (nParams.toLowerCase().indexOf(cArr[0].toLowerCase()) == -1)
		{
			if (cArr.length == 2)
				nParams = nParams + cArr[0] + '=' + cArr[1] + '&';
			else if (cArr.length == 1)
				nParams = nParams + cArr[0] + '=&';
		}
		else
			alert('Multiple instances of ' + cArr[0] + ' argument found in the URL query parameter.');
	}
	return nParams;
}
// make sure we have our namespace
// must be called AFTER code to relocate if not in dashboard, if that's used
var commonspot = window.commonspot || parent.commonspot || {};

/**
 * commonspot.util: utility package
 */
if(typeof commonspot.util == 'undefined')
{
	commonspot.util = {};

	commonspot.util.browser = BrowserCheck();
	commonspot.util.removeDuplicateParams = removeDuplicateParams;
	commonspot.util.checkDashboard = function()
	{
		return (typeof(commonspot.lview) != 'undefined');
	}

	commonspot.util.getQueryParams = function(str)
	{
		var str = typeof str != 'undefined' ? str : decodeURI(window.location.search);
		str = str.replace('?','');
		var strArr = str.split('&');
		var o = {};
		strArr.forEach(function(e){
			eArr = e.split('=');
			if (eArr.length == 1)
				eArr[1] = '';
			o[eArr[0]] = unescape(eArr[1]);
		});
		return o;
	}

	/**
	 * Encode string properly for html charactor
	 * @return string
	 */
	commonspot.util.encodeString = function(str)
	{
		var regExp = /&amp;#39;|&amp;amp;|&amp;nbsp;|&lt;br \/&gt;&lt;br \/&gt;/;

		if (str && str.search(regExp) != -1)
		{
			str = str.replace(/&amp;amp;/, '&amp;');
			str = str.replace(/&amp;#39;/, '&#39;');
			str = str.replace(/&amp;nbsp;/, '&nbsp;');
			str = str.replace(/&lt;br \/&gt;&lt;br \/&gt;/, ' ');
		}

		return str;
	};

	/**
	 * Escape special XML characters with the equivalent entities
	 * @return string
	 */
	commonspot.util.encodeXmlEntities = function(str)
	{
		if(str && str.search(/[&<>"]/) != -1)
		{
			str = str.replace(/&/g, '&amp;');
			str = str.replace(/</g, '&lt;');
			str = str.replace(/>/g, '&gt;');
			str = str.replace(/"/g, '&quot;');
		}
		// dmerrill 3/12/09: don't know why we do this, not xml spec
		return encodeURIComponent(str);
	};

	/**
	 * format a std commonspot date (yyyy-mm-dd hh:mm:ss) for display as a date only
	 * default format is yyyy-mm-dd
	 * if USFormat is true, returns it as mm/dd/yyyy
	 */
	commonspot.util.formatCSDate = function(csDateStr, USFormat)
	{
	   if(!csDateStr)
	      return;
		if(USFormat)
		{
			var aDateParts = csDateStr.split(/[- :]/);
			if(aDateParts.length < 3)
				throw("[formatCSDate(USFormat)] invalid date: " + csDateStr);
			return aDateParts[1] + "/" + aDateParts[2] + "/" + aDateParts[0];
		}
		return csDateStr.substr(0, 10);
	};

	/**
	 * for ea passed field in passed object, creates a new field w orig fld value converted to std date format
	 * @param row (object): object to process
	 * 		it's assumed to contain each of the fields in dateFieldsList, ea w date data
	 * @param dateFieldsList (string): comma-delimited list of fields to process
	 * @param fieldNameSuffix (string): appended to end of processed fld name to create name of formated fld
	 * 	if not passed, '_display' is used
	 * 	to overwrite orig fld w formatted version, pass ''
	 */
	commonspot.util.formatCSDateFields = function(obj, dateFieldsList, fieldNameSuffix)
	{
		if(!fieldNameSuffix)
			fieldNameSuffix = '_display';
		var aDateFlds = dateFieldsList.split(',');
		for(var i = 0; i < aDateFlds.length; i++)
			obj[aDateFlds[i] + fieldNameSuffix] = commonspot.util.formatCSDate(obj[aDateFlds[i]]);
	};


	/*
	 * @return object: returns an object with values from url hash, interpreted as query string format
	 */
	commonspot.util.getHashArgs = function()
	{
		var argStr = document.location.hash.replace(/^#+/, ''); // strip all leading #

		if (argStr.length == 0)
			return null;	// no arguments, nothing to return

		var qstring = window.location.search;
		var qmPos = argStr.indexOf('?');
		var args;

		if (qmPos < 0)
		{
			argStr = argStr.replace(/%3f/i,'?');
			qmPos = argStr.indexOf('?');
		}

		if (qmPos >= 0)
		{
			qstring = argStr.substr(qmPos);
			argStr = argStr.substr(0, qmPos);
			args = JSON.parse('{"' + decodeURI(argStr).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		}
		else
			args = JSON.parse('{"' + decodeURI(argStr).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		args.qstring = qstring;
		if (args.mode)
			args.mode = args.mode.toLowerCase();
		return args;
	};

	commonspot.util.getObjFieldLCase = function(obj, name)
	{
		if (name)
			return obj[name.toLowerCase()];
		else
			return null;
	};

	// return true if any item in permissionNeededList is in permissionList
	commonspot.util.hasAnyPermission = function(permissionNeededList, permissionList)
	{
		if( (!permissionNeededList) || (!permissionList) )
			return false;

		aPermsNeeded = permissionNeededList.toLowerCase().split(',');
		aPermsYouHave = permissionList.toLowerCase().split(',');

		for(var i = 0; i < aPermsNeeded.length; i++)
		{
			if(aPermsYouHave.indexOf(aPermsNeeded[i]) != -1)
				return true;
		}
		return false;
	};


	/*
	 * returns true if passed array or object has members
	 */
	commonspot.util.hasMembers = function(obj)
	{
		for(var f in obj)
		{
			try
			{
				if(obj.hasOwnProperty(f))
					return true;
			}
			catch(e)
			{
				return false;
			}
		}
		return false;
	};

	/**
	 * Return boolean (true/false) as per the permission.
	 */
	commonspot.util.hasPermission = function(permission, permissionList)
	{
		if( ! permissionList )
			return false;

		permissionList = ',' + permissionList.toLowerCase() + ',';
		return (permissionList.indexOf(',' + permission.toLowerCase() + ',') != -1)
	};

	/*
	 * adds members of src to dest, returning dest
	 * overwrites existing members if overwrite is true
	 * ignores prototype members of either src or dest
	 * 	means it won't copy from src prototype, and it will overwrite dest prototype members
	 */
	commonspot.util.merge = function(dest, src, overwrite, lcaseDestField)
	{
		var destFld;
		for(var fld in src)
		{
			destFld = lcaseDestField ? fld.toLowerCase() : fld;
		   if(src.hasOwnProperty(fld) && (overwrite || (!dest.hasOwnProperty(destFld)) || dest[destFld] === null))
		      dest[destFld] = src[fld];
		}
		return dest;
	};

	/*
	 * pads passed value to a minimum of len chars; no effect if it's already that long or more
	 */
	commonspot.util.pad = function (val, len)
	{
		val = String(val);
		len = len || 2;
		while (val.length < len) val = "0" + val;
		return val;
	};

	/**
	 * commonspot.util.plural
	 * returns a string with passed count, a space, and count-appropriate form of noun
	 * @see \cs\devdocs\javascript-function-docs.js
	 */
	commonspot.util.plural = function(count, noun, specialPlural, specialZero)
	{
		switch(count)
		{
			case 0:
				return count + " " + (specialZero || specialPlural || (noun + "s"));
				break;
			case 1:
				return count + " " + noun;
				break;
			default:
				return count + " " + (specialPlural || (noun + "s"));
		}
	};

	commonspot.util.setOptions = function(dest, src)
	{
		for(var fld in src)
			dest[fld] = src[fld];
	};


	/*
	 * converts a date, or a string parsable as one, to commonspot's std yyyy-mm-dd hh:mm:ss format
	 * rtns commonspot.err.INVALID_DATE_TOKEN if not a valid date
	 */
	commonspot.util.toCSDateFormat = function(date)
	{
		date = new Date(date); // applies Date.parse if necessary
		if(isNaN(date))
			return commonspot.err.INVALID_DATE_TOKEN;
		return	date.getFullYear() + "-" +
					commonspot.util.pad((date.getMonth() + 1)) + "-" +
					commonspot.util.pad(date.getDay()) + " " +
					commonspot.util.pad(date.getHours()) + ":" +
					commonspot.util.pad(date.getMinutes()) + ":" +
					commonspot.util.pad(date.getSeconds());
	};

	/**
	 * Return true if a given object is an array
	 * @return boolean
	 * technique used in the next few functions is known as the Miller Device; see here:
	 * 	http://blog.360.yahoo.com/blog-TBPekxc1dLNy5DOloPfzVvFIVOWMB0li?p=916
	 * obj.constructor === Array and similar fails in multi-window/multi-frame environment
	 */
	commonspot.util.isArray = function(obj)
	{
		return obj && Object.prototype.toString.apply(obj) === "[object Array]";
	};
	commonspot.util.isDate = function(obj)
	{
		return obj && (Object.prototype.toString.apply(obj) === "[object Date]");
	}
	commonspot.util.isValidDate = function(obj)
	{
		return obj && commonspot.util.isDate(obj) && !(isNaN(obj));
	}
	commonspot.util.getObjectClass = function(obj)
	{
		var classStr = Object.prototype.toString.apply(obj); // "[object Array]", "[object String]", etc
		return classStr.substring(8, classStr.length - 1); // "Array", "String", etc
	};
	commonspot.util.arrayTest = function(_this, item, from)
	{
	   //return cs_utility.array.arrayIndexOf(_this,item,from)!=-1;
	   return _this.indexOf(item, from)!=-1;
	};

	/**
	 * given an array of objects and the name of a keyFld, returns an object...
	 * ...whose keys are the values in keyFld and whose values are the corresponding objects
	 * @param objArr (array): array of objects to examine
	 * @param keyFld (string): name of fld to look for in each object; values become keys in result object
	 */
	commonspot.util.objectArrayToObject = function(objArr, keyFld)
	{
		var i, keyValue;
		var obj = {};
		for(var i = 0; i < objArr.length; i++)
		{
			keyValue = objArr[i][keyFld];
			if(typeof keyValue != 'undefined')
				obj[keyValue] = objArr[i];
		}
		return obj;
	};

	/**
	 * returns a new object that's a by-value copy of passed one
	 * USAGE: foo = new commonspot.util.cloneObject(someObject);
	 */
	commonspot.util.cloneObject = function (obj)
	{
		for (i in obj)
			this[i] = obj[i];
	};

	/**
	 * Return a random integer-like string
	 */
	commonspot.util.generateRandomInt = function()
	{
		var crypto = window.crypto || window.msCrypto;
		var array;
		if (crypto)
			array = new Uint32Array(1);
		else
		{
			array = [0];
			crypto =
			{
				getRandomValues: function(array)
				{
					for (var i = 0; i < array.length; i++)
						array[i] = Math.floor(Math.random() * 256);
					return array;
				}
			};
		}
		var rand = crypto.getRandomValues(array);
		return Date.now() + '' + rand[0];
	};
	commonspot.util.getFileSizeHtml = function(fileSize, precision)
	{
		precision = (typeof precision === 'undefined') ? 0 : precision;
		var pos = 0;
		if (fileSize == 0)
			return '';
		while ( fileSize >= 1024 )
		{
			pos++;
			fileSize = fileSize / 1024;
		}
		return fileSize.toFixed(precision) + ' ' + commonspot.util.getFileSizeHtml.sizes[pos];
	};
	commonspot.util.getFileSizeHtml.sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];

	commonspot.util.calcPreviewImgProp = function(origWidth, origHeight, maxWidth, maxHeight)
	{
		var isScaled = false;
		var newW = origWidth;
		var newH = origHeight;

		if ((origWidth >= maxWidth) || (origHeight >= maxHeight))
		{
			var ratioW = maxWidth / origWidth;
			var ratioH = maxHeight / origHeight;
			var ratio = Math.min(ratioW,ratioH);

			newW = Math.max(Math.round(origWidth * ratio), 1);
			newH = Math.max(Math.round(origHeight * ratio), 1);

			isScaled = true;
		}

		var imgProp = {width: newW,
							height: newH,
							isScaled: isScaled}

		return imgProp;
	};

	/*
	 * rtns html dump of passed obj
	 */
	commonspot.util.getDumpHTML = function(obj, caption)
	{
		var html = "";
		if(obj == undefined)
			html = "Object is undefined."
		else if(obj == null)
			html = "Object is null."
		else if(typeof obj == "function")
			html = "[function]";
		else if(typeof obj !== "object" || commonspot.util.isDate(obj))
			html = escape(obj.toString());
		else if(commonspot.util.isArray(obj))
		{
			var getDumpHTML = commonspot.util.getDumpHTML;
			var len = obj.length;
			html = '<table class="dumpTable">';
			if(caption)
				html += "<caption>" + caption +"</caption>";
			for(var i = 0; i < len; i++)
				html += "<tr><td>" + i + "</td><td>" + getDumpHTML(obj[i]) + "</td></tr>";
			html += "</table>";
		}
		else // object
		{
			var getDumpHTML = commonspot.util.getDumpHTML;
			html = '<table class="dumpTable">';
			if(caption)
				html += "<caption>" + caption +"</caption>";
			for(var key in obj)
				html += "<tr><td>" + key + "</td><td>" + getDumpHTML(obj[key]) + "</td></tr>";
			html += "</table>";
		}
		return html;
	};

	commonspot.util.repeatString = function(str, count)
	{
		var t = "";
		for(var i = 1; i <= count; i++)
			t += str;
		return t;
	};

	commonspot.util.jsSafe = function(str) // escape same chars as cf's JSStringFormat function
	{
		return str.replace(/(['"\\\b\t\n\f\r])/g, function(chr){return "\\" + commonspot.util.jsSafe.chars[chr.charCodeAt(0)];})
	};
	commonspot.util.jsSafe.chars =
	{
	     8: "b",	// backspace
	     9: "t",	// tab
	    10: "n",	// newline
	    12: "f",	// formfeed
	    13: "r",	// carriage return
	    34: '"',	// dbl quote
	    39: "'",	// single quote
	    92: "\\"	// backslash
	};

	// returns str with tokens in the form {key} replaced by the value of data[key]
	// if key isn't found in data, returns original token
	// key can contain only alphanumeric characters and underscores
	commonspot.util.replaceTokens = function(str, data)
	{
		return str.replace
		(
			/{(\w+)}/g,
			function(fullMatch, key) // key is portion of match inside (), ie inside {} within str
			{
				return (typeof data[key] === "undefined") ? fullMatch : data[key];
			}
		);
	};


	commonspot.util.hasContributorUI = function()
	{
		if (typeof commonspot.clientUI != 'undefined' &&
						typeof commonspot.dialog != 'undefined'  &&
						typeof commonspot.dialog.server != 'undefined' &&
						typeof commonspot.admin != 'undefined')
			return true;
		else
			return false;
	};
	/**
	 * commonspot.util.cookie: package for cookie-related utilities
	 */
	commonspot.util.cookie = {};

	commonspot.util.cookie.createCookie = function(name,value,days,hours,minutes)
	{
		var date = new Date();
		if (minutes > 0)
		{
			date.setTime(date.getTime()+(minutes*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		if (hours > 0)
		{
			date.setHours(date.getHours() + hours);
			var expires = "; expires=" + date.toGMTString();
		}
		if (days > 0)
		{
			date.setTime(date.getTime() + (days*24*60*60*1000));
			var expires = "; expires=" + date.toGMTString();
		}
		else
			var expires = "";

		if( document.location.protocol == 'https:' )
		{
			document.cookie = name + "=" + value + expires + "; path=/; SameSite=None; Secure;";
		}
		else
		{
			document.cookie = name + "=" + value + expires + "; path=/; SameSite=Strict;";
		}
	};

	commonspot.util.cookie.readCookie = function(name)
	{
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i=0; i < ca.length; i++)
		{
			var c = ca[i];
			while (c.charAt(0) == ' ')
			{
				c = c.substring(1,c.length);
			}
			if (c.indexOf(nameEQ) == 0)
			{
				return c.substring(nameEQ.length,c.length);
			}
		}
		return null;
	};

	commonspot.util.cookie.eraseCookie = function(name)
	{
		commonspot.util.cookie.createCookie(name,"",-1);
	};

	/**
	 * commonspot.util.dom: package for dom-related utilities
	 */
	commonspot.util.dom = {};

	/*
	encapsulation of dom createElement
	objType, objID, objClass, objTitle, objHTML, objParent, objOnClick, objRefBefore, objRefAfter
	*/
	commonspot.util.dom.addToDom = function(args)
	{
		var dom = document.createElement(args.objType);
		if (args.objID)
			dom.id = args.objID;
		if (args.objTitle)
			dom.title = args.objTitle;
		if (args.objClass)
			dom.className = args.objClass;
		if (args.objHTML)
			dom.innerHTML = args.objHTML;

		if (typeof args.objRefBefore == 'object')
		{
			args.objRefBefore.before(dom);
		}
		else if (args.objRefAfter){} // not implemented
		else if (args.objParent)
			args.objParent.appendChild(dom);
		if (args.objOnClick)
			(dom).addEventListener("click", args.objOnClick);
		return dom;
	}
	/**
	 * commonspot.util.dom.getWinScrollSize: returns actual content size of given window;
	 * @param win (object): window object. if not supplied returns value for current window
	 * @return {width, height}
	 */
	commonspot.util.dom.getWinScrollSize = function()
	{
		var sWidth=0, sHeight=0;
		var winSize = commonspot.util.dom.getWinSize();
		var win = self;
		if (win.document.body.clientHeight)
		{
			sHeight = win.document.body.clientHeight;
			sWidth = win.document.body.clientWidth;
		}
		else if (win.document.height)
		{
			sHeight = win.document.height;
			sWidth = win.document.width;
		}
		return {width: Math.max(sWidth,winSize.width), height: Math.max(sHeight,winSize.height)};
	};

	/**
	 * commonspot.util.dom.getWinSize: returns inner size of current window; from PPK
	 * @return {width, height}
	 */
	commonspot.util.dom.getWinSize = function()
	{
		var width, height;
		if (self.innerHeight) // all except Explorer
		{
			width = self.innerWidth;
			height = self.innerHeight;
		}
		else if (document.documentElement && document.documentElement.clientHeight) // Explorer 6 Strict Mode
		{
			width = document.documentElement.clientWidth;
			height = document.documentElement.clientHeight;
		}
		else if (document.body) // other Explorers
		{
			width = document.body.clientWidth;
			height = document.body.clientHeight;
		}
		return {width: width, height: height};
	};

	/**
	 * removes all child nodes from passed obj
	 * needed because IE won't directly set innerHTML of some tags
	 *
	 * @param obj (object): object to remove all children from
	 */
	commonspot.util.dom.removeAllChildren = function(obj)
	{
		while(obj.firstChild)
			obj.removeChild(obj.firstChild);
	};

	/**
	 * finds tag w requested name further up in dom hierarchy from passed obj
	 *
	 * @param obj (dom node): object to find an ancestor of
	 * @param tagName (string): tag name to find
	 * 	not case sensitive
	 * 	won't find body or anything above there; those are singletons w simpler ways to find them
	 * @param level (int, optional): if passed, return level'th matching ancestor, not just first one
	 */
	commonspot.util.dom.getAncestorTag = function(obj, tagName, level)
	{
		if(!obj || !obj.parentNode)
			return null;

		tagName = tagName.toUpperCase();
		if(typeof level == 'undefined')
			level = 1;

		var tag = obj.parentNode;
		var curLevel = 0;

		while((tag.nodeName != tagName || curLevel < level) && tag.parentNode && tag.parentNode.nodeName != 'BODY')
		{
			tag = tag.parentNode;
			if(tag.nodeName == tagName)
				curLevel++;
		}

		if(tag.nodeName != tagName || curLevel < level)
			tag = null;
		return tag;
	};

	/**
	 * returns elements w passed className inside element w passed id.
	 * homegrown because Prototype 1.5's getElementsBySelector seems broken in IE7.
	 * @param id (string): id of element to look inside
	 * @param className (string): className to look for
	 * @param tagName (string, optional): if passed, looks only at tags w this name
	 * @param getAll (boolean, optional): if true, return array of all found elements, otherwise, return first one
	 */
	commonspot.util.dom.getChildrenByClassName = function(id, className, tagName, getAll)
	{
		var results = [];
		var classMatchRegex = new RegExp("(^|\\s)" + className + "(\\s|$)");
		var tags = document.getElementById(id).getElementsByTagName(tagName || '*');
		for(var i = 0; i < tags.length; i++)
		{
			if(tags[i].className == className || tags[i].className.match(classMatchRegex))
			{
				if(getAll)
					results.push(tags[i]);
				else
					return tags[i];
			}
		}
		// if looking for single element and found none, rtn null; w/o this, rtns an empty array
		// when geAll=true we always rtn an array
		// when it's not, rtn a dom object, or something analogous to "no dom object", and tests false if you do if(domObj)
		if((!getAll) && (results.length === 0))
			return null;
		return results;
	};


	commonspot.util.dom.getElementsByClassName = function(searchClass,node,tag)
	{
		if ( node == null )
			node = document;
		if ( tag == null )
			tag = '*';
		var classElements = new Array();
		try
		{
			classElements = node.getElementsByClassName(searchClass);
		}
		catch (e)
		{
			var els = node.getElementsByTagName(tag);
			var elsLen = els.length;
			var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
			classElements = new Array();
			for (i = 0, j = 0; i < elsLen; i++)
			{
				if ( pattern.test(els[i].className) )
				{
				        classElements[j] = els[i];
				        j++;
				}
			}
		}
		return classElements;
	};

	/*
	* get all editable fields of the form
	*/
	commonspot.util.dom.findAllFields = function(iform,includeHidden) {
		var arr = [];
		var elements = iform.elements;
		var element;
		var omitList = 'button,submit,reset';
		var includeHidden = (typeof includeHidden != 'undefined') ? includeHidden : 1;
		if (includeHidden != 1)
			omitList += ',hidden';
		for (var i=0; i<elements.length; i++)
		{
			element = elements[i];
			// get rid of bad apples first
			if((omitList).indexOf(element.type)>=0)
				continue;
			if (element.disabled || element.readOnly)
				continue;
			arr.push(element);
		}

		return arr;
	};

	/*
	* activate all editable fields of the form
	*/
	commonspot.util.dom.activateAllFields = function(iform) {
		var elements = commonspot.util.dom.findAllFields(iform);
		var curFld;

		for (var i=0; i< elements.length; i++)
		{
			try
			{
				curFld = eval(iform + '.' + elements[i]);
				if (curFld)
				{
					if (curFld.activate)
						curFld.activate();
					else
						curFld.focus();
				}
			}
			catch (ex) {}
		}
	};

	/*
	* Finds the first editable, non-disabled, non-hidden form field excluding buttons to set focus.
	* Takes a form as single argument.
	* This is an enhanced version of prototype's "findFirstElement" function
	*/
	commonspot.util.dom.findFirstEditableField = function(iform) {
		var firstByIndex = null;

		var elements = commonspot.util.dom.findAllFields(iform);
		try
		{
			if (elements.findAll)
			{
				firstByIndex = elements.findAll(function(element)
				{
				  return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
				}).sortBy(function(element) { return element.tabIndex }).first();
			}
		}
		catch(e){}
		return firstByIndex ? firstByIndex : arr[0];
  	};

	/**
	 * commonspot.util.css: package for event-related utilities
	 * we only need this addEvent function so adding it here instead of importing event package of prototype
	 */


	commonspot.util.event = {};

	/**
	*	Irons out the IE and FF differences. Ideally we should use W3C model addEventListener,
	*	ie, when IE agrees with it
	*/
	commonspot.util.event.addEvent = function( dObj, type, fn )
	{
		if (dObj.addEventListener)
		{
			dObj.addEventListener( type, fn, false );
			//EventCache.add(dObj, type, fn, 1);
		}
		else if (dObj.attachEvent)
		{
			dObj["e"+type+fn] = fn;
			dObj[type+fn] = function()
			{
				dObj["e"+type+fn]( window.event );
			}
			dObj.attachEvent( "on"+type, dObj[type+fn] );
			EventCache.add(dObj, type, fn, 1);
		}
		else
		{
			dObj["on"+type] = dObj["e"+type+fn];
		}
	};

	/**
	 * commonspot.util.css: package for css-related utilities
	 */
	commonspot.util.css = {};

	commonspot.util.css.addRemoveClassNameByIDs = function(objIDsList, className, add, cw)
	{
		var cw = cw || top.commonspot.lightbox.stack.last().getWindow();

		if( !cw || !cw.cs$ )
			return;

		var objIDs = objIDsList.split(",");
		cs$.map(objIDs, function(item, index) {
			i = '#' + item;
			elem = cw.cs$(i);
			if(elem.length === 0)
				throw new Error("[addRemoveClassNameByIDs] Element with ID '" + item + "' can't be found.");
			else if(add)
				elem.addClass(className);
			else
				elem.removeClass(className);
		});
	};


	/**
	 * commonspot.util.css.showHideCSSClass: shows or hides a css class
	 */
	commonspot.util.css.showHideCSSClass = function(show, stylesheetID, targetClass)
	{
		var display = show ? '' : 'none';
		commonspot.util.css.setStyleRuleProperty(stylesheetID, targetClass, 'display', display);
	};

	/**
	*
	*/
	commonspot.util.css.setHideForMenusForAllFrames = function(stylesheetID, targetClass, propertyName, value, win)
	{
		var cWin;
		var win = win ? win : window;
		var arrayWindows = [];
		var iFrames = win.document.getElementsByTagName('iframe');
		for (var i =0; i<iFrames.length; i++)
		{
			cWin = iFrames[i].contentWindow;
			try
			{
				if (cWin && cWin.document)
					arrayWindows[i] = cWin;
			}
			catch(e){};
		}

		if (win.document)
			arrayWindows[iFrames.length] = win;
		for (i=0; i<arrayWindows.length; i++)
		{
			commonspot.util.css.setStyleRuleProperty(stylesheetID, targetClass, propertyName, value, arrayWindows[i]);
		}
	};




	/**
	 * commonspot.util.css.setStyleRuleProperty: sets a requested property of a stylesheet class
	 */
	commonspot.util.css.setStyleRuleProperty = function(stylesheetID, targetClass, propertyName, value, win)
	{
	 	// note that propertyNames need to use their js-style names, ie, 'whiteSpace', not 'white-space'
		var cssRules, ruleIndex;
		var doc = win ? win.document : document;
		var ss = doc.getElementById(stylesheetID);
		if(!ss)
			return;
		if(Object.keys(ss).length) // IE
		{
			ss = doc.styleSheets[stylesheetID];
			cssRules = doc.styleSheets[stylesheetID].rules;
		}
		else // Firefox
		{
			cssRules = ss.sheet.cssRules;
		}
		ruleIndex = getCSSRuleIndex(cssRules, '.' + targetClass);
		if(ruleIndex != null)
		{
			cssRules[ruleIndex].style[propertyName] = value;
		}
		return;

		function getCSSRuleIndex(cssRules, selectorText)
		{
			for(var i = 0; i < cssRules.length; i++)
			{
				if(cssRules[i].selectorText == selectorText)
				{
					return i;
				}
			}
			return null;
		}
	};

	commonspot.util.css.hideForMenus = function(hide)
	{
		var prop=hide ? 'hidden' : 'visible';
		commonspot.util.css.setStyleRuleProperty('cs_maincss','cpHideForMenus','visibility',prop);
		commonspot.util.css.setStyleRuleProperty('cs_maincss','cpMenuSafe','visibility',prop);
	};

	/*
	 * shows or hides any number of passed elements, passed as objects or as IDs
	 * elements argument can be:
	 * 	- an elementID string, comma delimited for multiple
	 * 	- an object containing html elements or strings
	 *		- an array containing html elements or string elementIDs
	 * note:
	 * 	showHideElements works by modifying inline style
	 * 	showHideElementsUsingCSSClass does the same thing by adding or removing a css class;
	 * 		it's a better choice for table rows
	 * 	copies of these functions in util.js work on objects in the top frame, regardless of where they're called from
	 * 	copies of them in nondashboard-util.js work on local window
	 */
	commonspot.util.css.showHideElements = function(show, elements, dspType)
	{
		if(!dspType)
			dspType = 'block';
		var display = show == true ? dspType : 'none';
		var targets;
		if(typeof elements == 'string')
			targets = elements.split(',');
		else
			targets = elements;

		cs$.each(targets, function()
		{
			cs$(this).css({'display':display});
		});
	};

	// see comments above for showHideElements
	commonspot.util.css.showHideElementsUsingCSSClass = function(show, elements)
	{
		var targets = (typeof elements == 'string') ? elements.split(',') : elements;
		cs$.each(targets, function(){
			if (show == true)
				cs$('#'+this).removeClass('showHideElements_hide');
			else
				cs$('#'+this).addClass('showHideElements_hide');
		});
	};


	/*
	 * disables any number of passed elements, passed as objects or as IDs
	 * 	does visual change w css class 'disabled'; set that up to look right for the look of each kind of item
	 *		does actual disabling by stashing item's onclick in onclickDisabled custom property, nulling onclick
	 *		also sets item's disabled property
	 *			if neither of those to methods applies (disabled parent item etc), code will need to check some other way
	 */
	commonspot.util.css.enableDisableElements = function(enable, elements)
	{
		if(enable)
			elements.each(function(index,elem)
				{
					cs$(elem).removeClass('disabled');
					elem.onclick = elem.onclickDisabled ? elem.onclickDisabled : elem.onclick;
					elem.onmouseover = elem.onmouseoverDisabled ? elem.onmouseoverDisabled : elem.onmouseover;
					elem.disabled = false;
				});
		else
			elements.each(function(index,elem)
				{
					cs$(elem).addClass('disabled');
					elem.onclickDisabled = elem.onclick ? elem.onclick : elem.onclickDisabled;
					elem.onmouseoverDisabled = elem.onmouseover ? elem.onmouseover : elem.onmouseoverDisabled;
					elem.onclick = null;
					elem.onmouseover = null;
					elem.disabled = true;
				});
	};


	commonspot.util.css.showFromMenuFields = function(visibleMenuClassList, fieldsList, dspType)
	{
	   if(!dspType)
	      dspType = 'block';
		var fld, show, selector;
		var aFields = fieldsList.split(',');
	   var aData = visibleMenuClassList.split(',');

		for(var i = 0; i < aFields.length; i++)
		{
			fld = aFields[i];

	      show = commonspot.util.arrayTest(aData,fld,0) ? 1 : 0;

			selector = '.cs_' + fld + '_hide';
			commonspot.util.css.showHideElements(show, cs$(selector), dspType)
		}
	};

	commonspot.util.css.enableFromMenuFields = function(enabledMenuClassList, fieldsList, dspType)
	{
	   if(!dspType)
	      dspType = 'block';
		var fld, enable, selector;
		var aFields = fieldsList.split(',');
	   var aData = enabledMenuClassList.split(',');
		for(var i = 0; i < aFields.length; i++)
		{
			fld = aFields[i];

	      enable = commonspot.util.arrayTest(aData,fld,0) ? 1 : 0;

			selector = '.cs_' + fld + '_disable';
			commonspot.util.css.enableDisableElements(enable, cs$(selector))
		}


	};

	commonspot.util.css.removeClass = function(el, className)
	{
		if (!(el && el.className))
		{
			return;
		}
		var cls = el.className.split(" ");
		var ar = new Array();
		for (var i = cls.length; i > 0;)
		{
			if (cls[--i] != className)
			{
				ar[ar.length] = cls[i];
			}
		}
		el.className = ar.join(" ");
	};

	commonspot.util.css.addClass = function(el, className)
	{
		commonspot.util.css.removeClass(el, className);
		el.className += " " + className;
	};

	/**
	 * display effects package
	 */
	commonspot.util.effects = {};

	/**
	 * commonspot.util.effects.blindLeft: like scriptaculous BlindUp, but to left
	 */
	commonspot.util.effects.blindLeft = function(element) {
	  element = cs$(element);
	  element.makeClipping();
	  return new Effect.Scale(element, 0,
	    Object.extend({ scaleContent: false,
	      scaleX: true,
	      scaleY: false,
	      restoreAfterFinish: true,
	      afterFinishInternal: function(effect) {
	        effect.element.hide().undoClipping();
	      }
	    }, arguments[1] || {})
	  );
	};

	/**
	 * commonspot.util.effects.blindRight: like scriptaculous BlindDown, but from left
	 */
	commonspot.util.effects.blindRight = function(element) {
	  element = cs$(element);
	  var elementDimensions = element.getDimensions();
	  return new Effect.Scale(element, 100, Object.extend({
	    scaleContent: false,
	    scaleX: true,
	    scaleY: false,
	    scaleFrom: 0,
	    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
	    restoreAfterFinish: true,
	    afterSetup: function(effect) {
	      effect.element.makeClipping().setStyle({width: '0px'}).show();
	    },
	    afterFinishInternal: function(effect) {
	      effect.element.undoClipping();
	    }
	  }, arguments[1] || {}));
	};


	/**
	 * commonspot.util.menus: package for operating menus
	 */
	commonspot.util.menus = {};

	/*
	 * checks or unchecks passed menu item
	 * requires css class 'checked', with check image as background
	 * item should have class 'checkableMenuItem' applied always, for correct spacing
	 */
	commonspot.util.menus.checkItem = function(checked, item)
	{
		if (typeof item == 'string')
			var element = cs$('#' + item);
		else
			var element = cs$(item);
		if(!element.length)
			{}
		else if(checked)
			element.addClass('checkedMenuItem');
		else
			element.removeClass('checkedMenuItem');
	};



	/**
	 * change StyleRule.
	 * Currently the property is hardcoded for display:block.
	 * We have to make it dynamic . so that it can set any property.
	 */
	commonspot.util.css.changeStyleRule = function(document, sheetTitle, className, propertyName, value)
	{
		var rules = commonspot.util.css.getStyleSheetByTitle(document, sheetTitle).rules;

		for (i=0; i< rules.length; i++)
		{
			if (rules[i].selectorText.toLowerCase() == className.toLowerCase())
			{
				rules[i].style.display = value;
				break;
			}
		}
	};

	/**
	 * Get Stylesheet By Title.
	 */
	commonspot.util.css.getStyleSheetByTitle = function(doc, sheetTitle)
	{
		var sheet = null;
		var rules = null;
		var thisTitle = null;

		if (doc.styleSheets.length > 0)
		{
			for (i = 0; i< doc.styleSheets.length; i++)
			{
				thisTitle = doc.styleSheets[i].title ? doc.styleSheets[i].title : null;
				if ( thisTitle && thisTitle.toLowerCase()  == sheetTitle)
				{
					sheet = doc.styleSheets[i];
					rules = sheet.cssRules? sheet.cssRules: sheet.rules;
					break;
				}
			}
		}

		return {sheet: sheet, rules: rules};
	};


	/*
	 * xml utilities
	 */
	commonspot.util.xml = {};

	/**
	 * Serialize object's properties into XML tags
	 * @param obj (any type ex function I think) required
	 * @param nodeName (string) optional
	 * 	if not passed, defaults to 'struct' for structs, and 'array' for arrays
	 * 	for other types, no root node is rendered unless nodeName is passed, in which case it's used
	 * array containers have a 'class="array"' attribute to tell the server side that it's an array
	 * empty structs have a 'class="struct"' attribute for the same reason
	 * array item nodes are always <item> tags
	 * array example:
	 * 	<foo class="array"><item>hello</item><item>world</item></foo>
	 * @return an XML string
	 */
	 /*
		test code:
var UNDEFINED;
tests =
[
	"asdf & <qwer>",
	new Date(),
	new Date("not a valid date"),
	{a:1,b:2},
	{a:1,b:2,c:{aa:11,bb:22,cc:{aaa:111,bbb:222}}},
	[1,2],
	[1,2,"asdf & <qwer>",{aa:11,bb:22}],
	[1,2,[33,44,[555,666]]],
	{a:1,b:2,c:[33,44,[555,666,{aa:77,bb:88,cc:[1,2]}]]},
	{a:1,b:'foo',c:'',d:[],e:{}},
	["one element array"],
	{a:1,b:2,c:["one element array"]},
	function(){},
	{a:1,b:2,c:function(){}},
	UNDEFINED,
	null,
	{lastName: UNDEFINED, firstName: null, birthday: new Date('not a valid date')}
];
for(var i = 0; i < tests.length; i++)
{
	console.log(i, "TEST OBJ:", tests[i]);
	console.log(i, commonspot.util.xml.objectToXml(tests[i]));
	console.log(i, commonspot.util.xml.objectToXml(tests[i], "data"));
}
commonspot.util.xml.objectToXml(x);
	 */

	commonspot.util.xml.objectToXml = function(obj, nodeName)
	{
		var xml = '';
		var _nodeName = nodeName;

		var type = typeof obj;
		if(obj === undefined)
			type = 'undefined';
		else if(obj == null)
			type = 'null';
		else if(type !== 'object')
			{}
		else if(commonspot.util.isArray(obj))
			type = 'array';
		else if(commonspot.util.isDate(obj))
			type = 'date';

		switch (type)
		{
			case 'number':
			case 'boolean':
				xml = obj;
				break;

			case 'string':
				xml = commonspot.util.xml.encodeEntities(obj);
				break;

			case 'date':
				if(isNaN(obj))
				{
					xml = commonspot.err.INVALID_DATE_TOKEN;
					nodeClass = 'exception';
				}
				else
				{
					xml = commonspot.util.toCSDateFormat(obj);
					if(xml === commonspot.err.INVALID_DATE_TOKEN)
						nodeClass = 'exception';
				}
				break;

			case 'array':
				_nodeName = _nodeName ? _nodeName : 'array';
				var nodeClass = 'array';
				var objectToXml = commonspot.util.xml.objectToXml; // local, will bang on it
				var len = obj.length;
				for(var i = 0; i < len; i++)
					xml += objectToXml(obj[i], 'item');
				break;

			case 'object':
				_nodeName = _nodeName ? _nodeName : 'struct';
				nodeClass = 'struct';
				var objectToXml = commonspot.util.xml.objectToXml; // local, will bang on it
				for(var key in obj)
				{
					xml += objectToXml(obj[key], key);
					nodeClass = ''; // dont' need to put a class on it if it has children
				}
				break;

			case 'null':
				xml = "";
//				xml = commonspot.err.NULL_VALUE_TOKEN;
//				nodeClass = 'exception';
				break;

			case 'undefined':
				xml = commonspot.err.UNDEFINED_VALUE_TOKEN;
				nodeClass = 'exception';
				break;

			default:
				xml = commonspot.err.UNSUPPORTED_TYPE_TOKEN.replace('</', ': ' + typeof obj + '</');
				nodeClass = 'exception';
		}

		if(_nodeName)
			xml = '<' + _nodeName + (nodeClass ? ' class="' + nodeClass + '"' : '') + '>' + xml + '</' + _nodeName + '>';
		return xml;
	};

	/**
	 * returns a javascript object analguous to a passed xml node
	 * @param node (xml node): node to process
	 * @param skip (string || object):
	 * 	can be a comma delimited list of dot-path items to omit, ie, "item.data,item.status.data.cmd"
	 * 		no extra whitespace!!!
	 * 	can also be a struct w those dot-path items as keys and any value that evals as true in a boolean test
	 * 	NOT xpath etc, ie, no wildcards, just simple exact match to passed skip paths
	 * 	this is recursive, and passed string gets converted to a more efficient struct, which then gets passed on
	 * @param path (string || null):
	 * 	DO NOT PASS THIS. calls itself recursively, passing this internally to support @param skip
	 * @return (object): js object representing pass xml node
	 *
	 * somewhat specialized for commonspot use
	 * 	doesn't create or examine attributes, with one exception:
	 * 	attribute 'class' is used to know if a container is an array, but not applied to result
	 */
	commonspot.util.xml.nodeToObject = function(node, skip, path)
	{
		if(!node)
			return null;

		if(!skip)
			skip = {};
		else if(typeof skip === "string")
		{	// passed value is a string, convert to struct for efficient existance testing
			var aSkip = skip.split(",");
			skip = {};
			for(var i = 0; i < aSkip.length; i++)
			   skip[aSkip[i]] = true;
		}

		// if no path, make it "", and if it's not "", put a "." on end
		path = path || "";
		path = (path === "") ? path : (path + ".");

		var obj = {};
		var child, typeClass, isArray, isStruct, hasChildNodes, tagName, childObj, childPath, nodeAtrs, dataType, csItemKey;

		nodeAtrs = commonspot.util.xml.getNodeAttributes(node);
		if(commonspot.util.xml.nodeHasValue(node)) // node has a value, use it
		{
			dataType = (nodeAtrs && nodeAtrs["type"]) ? nodeAtrs["type"].toLowerCase() : null; // we honor 'type' attribute
			try
			{
				child = node.firstChild;
				switch(child.nodeType)
				{
					case 3: // TEXT_NODE
					case 4: // CDATA_SECTION_NODE
						obj = child.data;
						if(dataType === "bool")
							obj = obj.toBoolean();
						else if(dataType === "int")
						{
							obj = parseInt(obj);
							obj = isNaN(obj) ? 0 : obj;
						}
						/* dmerrill 9/4/09: works, not used, yet, maybe never
						else if(dataType === "float")
						{
							obj = parseFloat(obj);
							obj = isNaN(obj) ? 0 : obj;
						}*/
						else if(child.nodeType == 3) // TEXT_NODE
							obj = commonspot.util.xml.encodeEntities(obj);
						break;
				}
			} catch (e) {}
		}
		else // no value
		{
			hasChildNodes = (node.childNodes && node.childNodes.length > 0);
			isArray = isStruct = false;
			if(nodeAtrs)
			{
				isArray = (nodeAtrs["class"] === "array");
				isStruct = (nodeAtrs["class"] === "struct");
			}
			if(!(isArray || isStruct))
				isStruct = hasChildNodes; // it's a struct if it isn't an array and has child nodes
			obj = isArray ? [] : isStruct ? {} : "";

			if(!hasChildNodes) // no value, no children
				return obj;

			child = node.firstChild;
			while(child)
			{
				tagName = child.nodeName;
				if(tagName === 'cs_item')
				{
					csItemKey = commonspot.util.xml.getNodeAttribute(child, 'key');
					tagName = csItemKey || tagName;
				}
				childPath = path + tagName;
				if(child.nodeType == 1 && !skip[childPath]) // Node.ELEMENT_NODE and not skipped path
				{
					childObj = commonspot.util.xml.nodeToObject(child, skip, childPath);
					if(isArray)
						obj.push(childObj);
					else
						obj[tagName] = childObj;
				}
				child = child.nextSibling;
			}
		}
		return obj;
	};

	commonspot.util.xml.getNodeAttribute = function(node, attributeName)
	{
		if((!node.attributes) || node.attributes.length === 0)
			return null;
		attributeName = attributeName ? attributeName.toLowerCase() : null;
		for(var i = 0; i < node.attributes.length; i++)
		{
			if(node.attributes[i].name && (node.attributes[i].name.toLowerCase() == attributeName))
				return node.attributes[i].value;
		}
		return null;
	};

	commonspot.util.xml.getNodeAttributes = function(node)
	{
		if((!node.attributes) || node.attributes.length === 0)
			return null;
		var atrs = node.attributes;
		var result = {};
		for(var i = 0; i < atrs.length; i++)
		{
			if (atrs[i].name)
				result[atrs[i].name.toLowerCase()] = atrs[i].value;
		}
		return result;
	};

	commonspot.util.xml.nodeHasValue = function(node)
	{
		if (node)
		{
			var child = node.firstChild;
			// 3 = Node.TEXT_NODE, 4 = CDATA_SECTION_NODE
			if (child && child.nextSibling == null && (child.nodeType == 3 || child.nodeType == 4))
				return true;
		}
		return false;
	};

	/**
	 * Unescapes special chars that the commonspot serializer escapes
	 * @return string
	 */
	commonspot.util.xml.decodeEntities = function(str)
	{
		if(str && (str.length >= 4) && str.search(/&lt;|&gt;|&quot;|&amp;/) != -1)
		{
			str = str.replace(/&lt;/gi, '<');
			str = str.replace(/&gt;/gi, '>');
			str = str.replace(/&quot;/gi, '"');
			str = str.replace(/&amp;/gi, '&');
		}
		return str;
	};

	commonspot.util.xml.encodeEntities = function(str)
	{
		if (str && str.search(/[&<>"]/) != -1)
		{
			str = str.replace(/&/g, '&amp;');
			str = str.replace(/</g, '&lt;');
			str = str.replace(/>/g, '&gt;');
			str = str.replace(/"/g, '&quot;');
		}
		return str;
	};

} // End: commonspot.util



/*
 * Error managment tools
 */
if(!commonspot.err) // commonspot.err not built yet
{
	// NAMESPACE
	commonspot.err = {};

	// CONSTANTS
	commonspot.err.COMMAND_REFUSAL_ERROR_CODE = 409;
	commonspot.err.AUTHORING_DISABLED_ERROR_CODE = 503;
	commonspot.err.INTERNAL_ERROR_CODE = 560;

	commonspot.err.INCOMPLETE_RETURN_VALUE_EXCEPTION = 'CSIncompleteReturnValueException';

	commonspot.err.HTTP_ERROR_MSG = 'Failed to get command response, server reported a communication error.';
	commonspot.err.FATAL_COMMAND_COLLECTION_ERROR_MSG = 'We\'re sorry, an error has occurred.';
	commonspot.err.EMPTY_COLLECTION_MSG = 'The command collection is empty and cannot be sent.';
	commonspot.err.EMPTY_RESPONSE_MSG = 'The server response is empty and cannot be processed.';
	commonspot.err.COMMAND_HANDLER_ERROR_MSG_START = 'JavaScript error in command response handler.';
	commonspot.err.UNMAPPED_FIELD_ERROR_MSG_START = '';
	commonspot.err.MISSING_DATASET_ERROR_MSG = 'Unable to locate dataset';
	commonspot.err.REQUIRED_MSG = "This field is required.";

	commonspot.err.MAPPED_FIELD_ERROR_MSGS_HEADER = 'Please correct the following:';
	commonspot.err.INTERNAL_ERROR_MSGS_HEADER = 'We\'re sorry, an internal error has occurred.';

	commonspot.err.FIELD_ERROR_CSS_CLASS = 'CommonSpotFieldError';
	commonspot.err.INVALID_VALUE_PREFIX = "{!INVALID_VALUE_PREFIX!}";

	commonspot.err.NULL_VALUE_TOKEN = '<message>Attempt to pass a null value.</message>';
	commonspot.err.UNDEFINED_VALUE_TOKEN = '<message>Attempt to pass an undefined value.</message>';
	commonspot.err.UNSUPPORTED_TYPE_TOKEN = '<message>Attempt to pass an unsupported type.</message>';
	commonspot.err.INVALID_DATE_TOKEN = '<message>Attempt to pass an invalid date.</message>';

	// STATIC METHODS
	/*
	 * rtns passed msg w INVALID_VALUE_PREFIX prepended
	 * point is that it's recognized by ErrorCollection.checkFieldValue as an invalid value
	 * for an example, see advanced-search.js:
	 * 	getOwner() rtns a msg built w commonspot.err.invalidMsg() if it's invalid
	 * 	collectFormArgs() creates a new commonspot.err.ErrorCollection
	 * 		then checks each collected value with the collection's checkFieldValue() method
	 * 		it then calls the collection's displayErrors() method to show them, and bails if that rtns true (were rrs)
	 */

	commonspot.err.invalidMsg = function(msg)
	{
		return commonspot.err.INVALID_VALUE_PREFIX + msg;
	};

	/*
	 * clears field error styling off all fields that might get it if they fail
	 * relevant fields are ones whose highlightIDs are in passed fieldErrorMap or are values in errorCodeMap
	 * always operates on topmost lightbox window, regardless of where it's called from
	 */
	commonspot.err.clearFieldErrorDisplay = function(fieldErrorMap, errorCodeMap, fieldErrorContext)
	{
		var cw = commonspot.err.getFieldErrorContextWindow(fieldErrorContext);
		var highlightIDs;
		for(var fld in fieldErrorMap)
		{
			highlightIDs = fieldErrorMap[fld].highlightIDs;
			if(highlightIDs)
				commonspot.util.css.addRemoveClassNameByIDs(highlightIDs, commonspot.err.FIELD_ERROR_CSS_CLASS, false, cw);
		}
		for(var code in errorCodeMap)
		{
			highlightIDs = errorCodeMap[code].highlightIDs;
			if(highlightIDs) // should exist, friendlyName and highlightIDs are reason for map to exist
				commonspot.util.css.addRemoveClassNameByIDs(highlightIDs, commonspot.err.FIELD_ERROR_CSS_CLASS, false, cw);
		}
	};

	commonspot.err.getFieldErrorContextWindow = function(fieldErrorContext)
	{
		var cw;
		switch(fieldErrorContext) // may need more cases in here some day
		{
			case 'admin':
				cw = commonspot.lightbox.getAdminWindow();
				break;
			default:
				cw = top.commonspot.lightbox.getCurrentWindow();
		}

		return cw;
	};

	// CLASSES

	/*
	 * ErrorCollection class, holds and displays error objects
	 */
	commonspot.err.ErrorCollection = function ()
	{
		this.errors = [];
		return this;
	};

	/*
	 * adds passed errorObject to this collection
	 * object must support render() method
	 * 	TODO: explain that more
	 */
	commonspot.err.ErrorCollection.prototype.addError = function(errorObject)
	{
		this.errors.push(errorObject);
	};

	/**
	 * checks passed value, if it starts w INVALID_PREFIX, it's an error, and rest of it is error msg
	 * 	so, add corresponding FieldError object to this ErrorCollection, and rtn true
	 * otherwise, it's not an error, clear its error appearance, and rtn false
	 * can also validate the value here, but mostly we validate on the server side, so in general, don't
	 *
	 * @param value (any) required: value to check
	 * @param friendlyName (string) optional: name to call it in user alerts
	 * @param highlightID (string) optional: id of dom element to hilight if invalid
	 * @param validator (string or function) optional:
	 * 	if passed, it's used to process the value first
	 * 	can be the name of a std validator, in commonspot.err.validators namespace...
	 * 		...or a reference to (not the name of) a custom function
	 * 	validator functions should return passed value if it's valid, else commonspot.err.invalidMsg("Some message")
	 */
	commonspot.err.ErrorCollection.prototype.checkFieldValue = function(value, friendlyName, highlightID, validator)
	{
		if(typeof validator === "string")
			validator = commonspot.err.validators[validator];
		if(typeof validator === "function")
			value = validator(value);

		var lightboxWindow = top.commonspot.lightbox.getCurrentWindow();
		if((typeof value === "string") && (value.substr(0, commonspot.err.INVALID_VALUE_PREFIX.length) == commonspot.err.INVALID_VALUE_PREFIX))
		{
			if(highlightID && highlightID != "")
				lightboxWindow.cs$(highlightID).addClass(commonspot.err.FIELD_ERROR_CSS_CLASS);
			var msg = value.substr(commonspot.err.INVALID_VALUE_PREFIX.length);
			var fieldError = new commonspot.err.FieldError(msg, friendlyName, highlightID);
			this.addError(fieldError);
			return true;
		}
		else if(highlightID && highlightID != "")
		{
			lightboxWindow.cs$(highlightID).removeClass(commonspot.err.FIELD_ERROR_CSS_CLASS);
			return false;
		}
	};

	/*
	 * if collection contains errors, displays them and rtns true, else rtns false
	 * TODO: explain more about responsibilities of objects in its error collection, and how instances of them get created
	 */
	commonspot.err.ErrorCollection.prototype.displayErrors = function(fieldErrorContext)
	{
		if(this.errors.length > 0)
		{
			var contextWindow = fieldErrorContext
					? commonspot.err.getFieldErrorContextWindow(fieldErrorContext)
					: top.commonspot.lightbox.getCurrentWindow();
			var fieldMsgs = "";
			var userMsgs = "";
			var internalMsgs = "";
			var msgs;
			for(var i = 0; i < this.errors.length; i++)
			{
				msgs = this.errors[i].render(contextWindow);
				if(msgs.field && msgs.field !== "")
					fieldMsgs += msgs.field;
				if(msgs.user && msgs.user !== "")
					userMsgs += msgs.user;
				if(msgs.internal && msgs.internal !== "")
					internalMsgs += msgs.internal;
			}
			var msg = "";
			if(userMsgs !== "")
				msg += userMsgs;
			if(fieldMsgs !== "")
				msg += "<h2>" + commonspot.err.MAPPED_FIELD_ERROR_MSGS_HEADER + "</h2><dl>" + fieldMsgs + "</dl>";
			if(internalMsgs !== "")
				msg += "<h2>" + commonspot.err.INTERNAL_ERROR_MSGS_HEADER + "</h2><dl>" + internalMsgs + "</dl>";
			commonspot.dialog.client.alert(msg);
		}
		return (this.errors.length > 0); // boolean == hasErrors
	};


	/*
	 * Helper function.  Checks if the passed value is empty. If so sets an invalidMsg and checks the field Value
	 */
	commonspot.err.ErrorCollection.prototype.setErrorIfEmpty = function(value, friendlyName, highlightID, msg)
	{
		if(value == "")
		{
			if(typeof(msg) == "undefined")
				msg = commonspot.err.REQUIRED_MSG;
			value = commonspot.err.invalidMsg(msg);
			this.checkFieldValue(value, friendlyName, highlightID);
		}
	};

	/*
	 * CmdError class, represents a server-side error running a cmd
	 * TODO: write this, document fieldErrors and fieldErrorMap members better
	 * fieldErrors
	 * 	errortype:
	 * 	message:
	 * 	fieldtype:
	 * 	passedtype:
	 * fieldErrorMap
	 * 	struct, keyed by the lcase argument name on the server side.
	 * 	for each field, value is a struct containing...
	 * 		friendlyName:
	 * 		highlightIDs:
	 * 		position:
	 */
	commonspot.err.CmdError = function(responseStatus, fieldErrorMap, errorCodeMap)
	{
		this.cmd = responseStatus.cmd;
		this.code = responseStatus.code;
		this.reasonCode = responseStatus.reasoncode;
		this.text = responseStatus.text;
		this.hasFieldErrors = responseStatus.hasFieldErrors;
		if(responseStatus.data)
		{
			this.exceptionType = responseStatus.data.exceptiontype;
			this.fieldErrors = responseStatus.data.fielderrors;
		}
		this.fieldErrorMap = fieldErrorMap;
		this.errorCodeMap = errorCodeMap;
					//console.log("CmdError.this", this);
		return this;
	};

	/*
	 * visually indicate field errors when applicable, and rtn struct w error msgs:
	 * 	.field: user-fixable data problems
	 * 	.user: other expected exception alerts
	 * 	.internal: unexpected internal error (cf crash, unmapped field errors, etc)
	 */
	commonspot.err.CmdError.prototype.render = function(contextWindow)
	{
		var map, fieldName, highlightIDs, position;
		var msgs = {field: "", user: "", internal: ""};
		var orderedFieldMsgs = [];
		var unorderedFieldMsgs = [];
		if (this.hasFieldErrors)
		{	// cmd refusal with field errors user can fix (if we have a mapping for the fld), typically validation
			if (this.fieldErrorMap)
			{
				// fieldErrorMap entries have position only if added to cmd collection via a Command obj; want to fill in the rest using order added to the map
				// find highest position spec'd in map
				position = -1;
				for (fieldName in this.fieldErrorMap)
				{
					if (typeof this.fieldErrorMap[fieldName].position !== 'undefined')
						position = this.fieldErrorMap[fieldName].position;
				}
				// starting one higher than highest existing position, number all unnumbered ones, in order defined in map
				position++;
				for (fieldName in this.fieldErrorMap)
				{
					if (typeof this.fieldErrorMap[fieldName].position === 'undefined')
						this.fieldErrorMap[fieldName].position = position++;
				}
			}
			for (var fld in this.fieldErrors)
			{
				if (!this.fieldErrors.hasOwnProperty(fld)) // skip prototype extended methods
					continue;
				// if error is a string, not an object, it's an internal exception; so far, that's only INCOMPLETE_RETURN_VALUE_EXCEPTION
				if (typeof this.fieldErrors[fld] === 'string')
				{
					msgs.internal += '<dt>' + this.errorSource(this.cmd, fld) + '</dt><dd>' + encodeURI(this.fieldErrors[fld]) + '</dd>';
				}
				else if (this.fieldErrorMap && this.fieldErrorMap[fld]) // have a mapping for this fld -- user-entered data they can change
				{
					map = this.fieldErrorMap[fld];
					fieldName = map.friendlyName || fld;
					highlightIDs = map.highlightIDs;
					position = map.position;
					if(highlightIDs)
						commonspot.util.css.addRemoveClassNameByIDs(highlightIDs, commonspot.err.FIELD_ERROR_CSS_CLASS, true, contextWindow);
					msg = (this.fieldErrors[fld].errortype == "empty") ? commonspot.err.REQUIRED_MSG : this.fieldErrors[fld].message;
					msg = '<dt title="Data type: ' + this.fieldErrors[fld].fieldtype + '">' + fieldName + '</dt><dd>' + encodeURI(msg) + '</dd>';
					if (typeof position !== 'undefined' && typeof orderedFieldMsgs[position] === 'undefined')
						orderedFieldMsgs[position] = msg;
					else // shouldn't happen I think, but don't want to die if there's a way it can
						unorderedFieldMsgs.push(msg);
				}
				else // no mapping for this fld, not something user can fix -- internal error or missing or incorrect map
					msgs.internal += '<dt title="Data type: ' + this.fieldErrors[fld].fieldtype + '">' + this.errorSource(this.cmd, fld) + '</dt><dd>' + commonspot.err.UNMAPPED_FIELD_ERROR_MSG_START + this.fieldErrors[fld].message + '</dd>';
			}
		}
		else if (this.code === commonspot.err.COMMAND_REFUSAL_ERROR_CODE) // non-field cmd refusal
		{
			map = this.errorCodeMap ? this.errorCodeMap.getForCode(this.reasonCode) : null;
			if(map) // have specs for this reasonCode, alert like a field error and highlight requested flds
			{
				commonspot.util.css.addRemoveClassNameByIDs(map.highlightIDs, commonspot.err.FIELD_ERROR_CSS_CLASS, true, contextWindow);
				msg = '<dt>' + map.itemTitle + '</dt><dd>' + encodeURI(this.text) + '</dd>';
				unorderedFieldMsgs.push(msg);
			}
			else
				msgs.user += '<p>' + encodeURI(this.text) + '</p>';
		}
		else if (this.code === commonspot.err.AUTHORING_DISABLED_ERROR_CODE) // authoring is disabled, just say it
			msgs.user += '<p>' + encodeURI(this.text) + '</p>';
		else // non-field internal error
			msgs.internal += '<dt>' + this.errorSource(this.cmd) + '</dt><dd>' + this.text + '</dd>';

		msgs.field = orderedFieldMsgs.join("") + unorderedFieldMsgs.join(""); // concat ordered msgs, ones w no position at end
		return msgs;
	};

	commonspot.err.CmdError.prototype.errorSource = function(cmd, fld)
	{
		switch(this.exceptionType)
		{
			case "CSIncompleteReturnValueException":
				return cmd + ", " + "field '" + fld + "' in return value:";
			default:
				return (fld ? cmd + "." + fld : cmd);
		}
	};


	/*
	 * CmdHandlerError class, represents a client-side js error in a cmd response handler
	 */
	commonspot.err.CmdHandlerError = function(cmd, error)
	{
		this.cmd = cmd;
		this.text = escape(error.toString());
		return this;
	};

	/*
	 * visually indicate field errors when applicable, which won't happen, and...
	 * rtn struct w error msgs:
	 * 	.field: user-fixable data problems; null
	 * 	.user: other expected exception; null
	 * 	.internal: unexpected internal error; error text
	 */
	commonspot.err.CmdHandlerError.prototype.render = function(lightboxWindow)
	{
		var msgs =
		{
			field: "",
			user: "",
			internal: "<dt>" + this.cmd + "</dt><dd>" + commonspot.err.COMMAND_HANDLER_ERROR_MSG_START + "<br />" + encodeURI(this.text) + "</dd>"
		};
		return msgs;
	};

	/*
	 * FieldError class, represents a client-side validation error specific to some field
	 */
	commonspot.err.FieldError = function(msg, friendlyName, highlightIDs)
	{
		this.msg = msg;
		this.friendlyName = friendlyName;
		this.highlightIDs = highlightIDs;
		return this;
	};

	/*
	 * visually indicate field errors when applicable, which won't happen, and...
	 * rtn struct w error msgs:
	 * 	.field: user-fixable data problems; null
	 * 	.user: other expected exception; null
	 * 	.internal: unexpected internal error; error text
	 */
	commonspot.err.FieldError.prototype.render = function(lightboxWindow)
	{
		if(this.highlightIDs && this.highlightIDs != "")
			lightboxWindow.cs$
				.apply(lightboxWindow, this.highlightIDs.split(","))
				.addClass(commonspot.err.FIELD_ERROR_CSS_CLASS);
		var msgs =
		{
			field: "<dt>" + this.friendlyName + "</dt><dd>" + encodeURI(this.msg) + "</dd>",
			user: "",
			internal: ""
		};
		return msgs;
	};

	/*
	* ErrorCodeMap class, represents a mapping of error codes to error item titles and highlightIDs
	* use to handle non-validation errors (cmd refusal) as a field error when it's a known code
	* constructor args let you create first mapping immediately; call addCode to add more if needed
	*/
	commonspot.err.ErrorCodeMap = function(code, itemTitle, highlightIDs)
	{
		this.map = {};
		if(code)
			this.addCode(code, itemTitle, highlightIDs);
		return this;
	};

	commonspot.err.ErrorCodeMap.prototype.addCode = function(code, itemTitle, highlightIDs)
	{
		this.map[code] = {itemTitle: itemTitle, highlightIDs: highlightIDs};
	};

	commonspot.err.ErrorCodeMap.prototype.getForCode = function(code)
	{
		return this.map[code];
	};

	/*
	 * namspace for client-side value validators
	 * shouldn't be many of these, most validation is server-side
	 * validators should return passed value if it's valid, else commonspot.err.invalidMsg("Some message")
	 * validators are used by ErrorCollection.checkFieldValue, so far
	 * you can pass checkFieldValue the name of a std validator, or a reference to (not the name of) a custom function
	 */
	commonspot.err.validators = {};

	commonspot.err.validators.required = function(value)
	{
		if(value == "") // assumes value has been trimmed, as by commonspotLocal.util.getValue
			value = commonspot.err.invalidMsg(commonspot.err.REQUIRED_MSG);
		return value;
	};

} // commonspot.err not built yet

var pop;
function openTestPopup()
{
	pop = window.open("/commonspot/dhtmledit/blank.html", "new_window_123", 'width=1,height=1,scrollbars=no,menubar=no,status=no,toolbar=no,top=' + window.screen.height + ',left=' + window.screen.width + ',resizable=no');
}

function hasPopupBlocker()
{
	try
	{
		if (!pop ||
					pop.closed ||
					pop.closed == "undefined" ||
					pop == "undefined" ||
					parseInt(pop.innerWidth) == 0)
		{
			pop && pop.close();
			return true;
		}
		else
		{
			pop && pop.close();
			return false;
		}
	}
	catch(e)
	{
		return true;
	}
}

commonspot.util.menusearch = {};


commonspot.util.menusearch.showMessage = function(msg,eraseCookie)
{
	var eraseCookie = typeof eraseCookie != 'undefined' ? eraseCookie : 0;

	if (eraseCookie == 1)
		commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// erase any old cookie
	commonspot.dialog.client.alert(msg, {title: 'Action Search Error'});
	commonspot.util.menusearch.closeMenuHelpDialog();
}

commonspot.util.menusearch.navigateTo = function (mode)
{
	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	switch (mode)
	{
		case 'subsite_admin':
			if (locationInfo.subsiteid > 0)
				commonspot.clientUI.state.location.resetByGivenSubsiteURL(locationInfo.subsiteurl, locationInfo.subsiteid);
			else
				commonspot.util.menusearch.showMessage('Please select a site.',1);
			break;
		case 'site_admin':
			if (locationInfo.siteid > 0)
			{
				var hash = commonspot.clientUI.state.mode.urlHash.modeQueryString(mode, locationInfo.siteurl);
				var win = (window.top || window.self);
				var siteInfo = win.location.href.split('/');
				var host = siteInfo[2];
				var newHash = siteInfo[0] + '//'+ host + '/commonspot/dashboard/index.html#' + hash;
				win.location.href = newHash;
				// top.location.reload(true);
				// commonspot.clientUI.state.mode.urlHash.setModeAndPageFromHash();
				commonspot.clientUI.state.mode.set(mode, false, null, true);
			}
			else
				commonspot.util.menusearch.showMessage('Please select a site.', 1);
			break;

		default:
			commonspot.clientUI.state.mode.set(mode, false, null, true);
	}

}

commonspot.util.menusearch.clickTopLevelMenu = function(obj)
{
	//  {'mode':'site_admin','panelID':'propertiesPanel','panelIndex':1,'menuID':'cs_sa_generalsettings','method':'clickSecondLevelMenu'};
	var mode = typeof obj.mode ? obj.mode : '';
	var panelID = typeof obj.panelID ? obj.panelID : '';
	var panelIndex = typeof obj.panelIndex ? obj.panelIndex : 9999;

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (mode != '' && mode !== modeInfo.mode)
	{
		var o = {'method':'clickTopLevelMenu','mode':mode,'panelID':panelID,'panelIndex':panelIndex};

		var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie

		// first read the cookie we may have already something there
		var odata = commonspot.util.cookie.readCookie('cs_menuSearchAction');

		// at this point if there is some data in this, it should be a string with | seprator
		if (odata)
		{
			var odataArr = odata.split('|');
			if (odataArr.length == 1)
				ndata = ndata + '|' + odata;
		}
		commonspot.util.cookie.eraseCookie('cs_menuSearchAction');
		commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);
		commonspot.util.menusearch.navigateTo(mode);
		return;
	}

	var win = (window.top || window.self);
	if (modeInfo.contentframe != '')
		win = win.document.getElementById(modeInfo.contentframe).contentWindow;

	setTimeout(function(){
		var accordianNode = win.document.getElementsByClassName('CollapsiblePanelGroup')[0];
		var accordianID = accordianNode.id;
		var accordianObj = win[accordianID];

		if (accordianObj)
		{
			var panelIndex = accordianObj.getIndexFromId(panelID);

			if (panelIndex >= 0)
			{
				// first close all open panels
				accordianObj.closeAllPanels();

				// open the panel we need
				accordianObj.openPanel(panelIndex);
			}
			else
				commonspot.util.menusearch.showMessage('Panel is not enabled');
		}
		else
			commonspot.util.menusearch.showMessage("Feature not enabled or you don't have permissions to access this feature", 0);
	}, 1500);

}

commonspot.util.menusearch.clickSecondLevelMenu = function(obj)
{
	//  {'mode':'site_admin','panelID':'propertiesPanel','panelIndex':1,'menuID':'cs_sa_generalsettings','method':'clickSecondLevelMenu'};

	var mode = typeof obj.mode ? obj.mode : '';
	var menuID = typeof obj.menuID ? obj.menuID : '';
	var panelID = typeof obj.panelID ? obj.panelID : '';
	var panelIndex = typeof obj.panelIndex ? obj.panelIndex : 9999;

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (panelID != '')	// if we have a valid panelID and panelIndex, need to first open the panel
	{
		if (mode != '' && mode !== modeInfo.mode)	// if requested mode is not same as current mode, first switch mode
		{
			var o = {'method':'clickSecondLevelMenu','mode':mode,'panelID':panelID,'panelIndex':panelIndex,'menuID':menuID};

			var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie
			commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// first erase any old cookie

			commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);	// write the cookie
		}

		commonspot.util.menusearch.clickTopLevelMenu(obj);	// call function to click on the panel
	}


	commonspot.util.menusearch.doMenuClick(menuID);
}

commonspot.util.menusearch.doMenuClick = function(menuID)
{
	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];
	var win = window.top || window.self;
	var doc = win.document;
	if (modeInfo.contentframe != '')
	{
		win = win.document.getElementById(modeInfo.contentframe).contentWindow;
		doc = win.document;
	}


	commonspot.util.menusearch.closeMenuHelpDialog();

	setTimeout(function() {
		var ele = win.document.getElementById(menuID);
		if (ele)
		{
			ele = cs$(ele);
			if (ele.height() > 0 && ele.width() > 0)
				ele.click();
			else
				commonspot.util.menusearch.showMessage("Feature not enabled or you don't have permissions to access this feature");
		}
		else
			commonspot.util.menusearch.showMessage('Feature not enabled');
	},1500);

}
commonspot.util.menusearch.clickOnSectionLink = function(obj)
{
	//  {'mode':'user_admin','linkID':'',','method':'clickSecondLevelMenu'};

	var mode = typeof obj.mode ? obj.mode : '';
	var linkID = typeof obj.linkID ? obj.linkID : '';

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (mode != '' && mode !== modeInfo.mode)
	{
		var o = {'method':'clickOnSectionLink','mode':mode,'linkID':linkID};

		var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie

		commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// first erase any old cookie

		commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);	// write the cookie

		commonspot.util.menusearch.navigateTo(mode);
		return;
	}

	var win = top;
	if (modeInfo.contentframe != '')
		win = top.document.getElementById(modeInfo.contentframe).contentWindow;


	setTimeout(function() {
		var ele = win.document.getElementById(linkID);
		if (ele)
		{
			if (cs$(ele).is(':visible'))
			{
				commonspot.util.menusearch.closeMenuHelpDialog();
				// detect if this clickable
				if (ele.hasAttribute('onclick') || ele.hasAttribute('href'))
					ele.click();
				else
				{
					ele = ele.children[0];
					if (ele.hasAttribute('onclick') || ele.hasAttribute('href'))
						ele.click();
					else
						commonspot.util.menusearch.showMessage("No dialog to show");
				}
			}
			else
				commonspot.util.menusearch.showMessage("Feature not enabled or you don't have permissions to access this feature");
		}
		else
			commonspot.util.menusearch.showMessage('Feature not enabled');
	},1500);
}

commonspot.util.menusearch.clickLviewPanel = function(obj)
{
		// 'panelname':panelName,'mode':'lview','method':'clickLviewPanel'
	var mode = typeof obj.mode ? obj.mode : '';
	var panelname = typeof obj.panelname ? obj.panelname : '';

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (modeInfo.currenturl != '' && modeInfo.currenturl != '/commonspot/admin/')
	{
		if (('author,read,edit,approve').indexOf(modeInfo.mode) < 0)
		{
			var o = {'method':'clickLviewPanel','mode':mode,'panelname':panelname};

			var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie

			commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// first erase any old cookie

			commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);	// write the cookie

			commonspot.util.menusearch.navigateTo(mode);
			return;
		}

		var lviewInfo = commonspot.data.uiState.lview.left;
		if (lviewInfo.isOpen != 1)
			commonspot.lview.left.displayManager.showHide();

		setTimeout(function() {
			var panelParent = top.document.getElementById('left_panel_footer');
			if (panelParent)
			{
				var panel = panelParent.querySelector('[title="' + panelname + '"]');
				if (!panel)
				{
					panelParent = top.document.getElementById('left_panel_tabs');
					if (panelParent)
						panel = panelParent.querySelector('[title="' + panelname + '"]');
				}
				if (panel)
				{
					commonspot.util.menusearch.closeMenuHelpDialog();
					panel.click();
				}
			}
			else
			{
				setTimeout(function() {
					commonspot.util.menusearch.clickLviewPanel({'mode':mode,'panelname':panelname,'method':'clickLviewPanel'});
				},50);
			}
		},1500);
	}
	else
		commonspot.util.menusearch.showMessage('No page context');

}

commonspot.util.menusearch.clickLviewPanelLink = function(obj)
{
	//  {'mode':'user_admin','linkID':'',','method':'clickSecondLevelMenu'};

	var mode = typeof obj.mode ? obj.mode : '';
	var linkID = typeof obj.linkID ? obj.linkID : '';

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (modeInfo.currenturl != '' && modeInfo.currenturl != '/commonspot/admin/')
	{
		if (('author,read,edit,approve').indexOf(modeInfo.mode) < 0)
		{
			var o = {'method':'clickLviewPanelLink','mode':mode,'linkID':linkID};

			var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie

			commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// first erase any old cookie

			commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);	// write the cookie

			commonspot.util.menusearch.navigateTo(mode);
			return;
		}

		var lviewInfo = commonspot.data.uiState.lview.left;
		if (lviewInfo.isOpen != 1)
			commonspot.lview.left.displayManager.showHide();

		commonspot.lightbox.closeCurrent();
		setTimeout(function() {

			var ele = window.cs$(linkID);
			if (ele)
			{
				var eleDimensions = ele.getDimensions();
				if (eleDimensions['height'] > 0 && eleDimensions['width'] > 0)
				{
					commonspot.util.menusearch.closeMenuHelpDialog();
					ele.click();
				}
				else
					commonspot.util.menusearch.showMessage("Feature not enabled or you don't have permissions to access this feature");
			}
			else
				commonspot.util.menusearch.showMessage('Feature not enabled');
		},1500);
	}
	else
		commonspot.util.menusearch.showMessage('No page context');
}

commonspot.util.menusearch.showMyCSPanel = function(obj)
{
	var mode = typeof obj.mode ? obj.mode : '';
	var panelID = typeof obj.panelID ? obj.panelID : '';

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (mode != '' && mode !== modeInfo.mode)
	{
		var o = {'method':'showMyCSPanel','mode':mode,'panelID':panelID};

		var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie

		commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// first erase any old cookie

		commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);	// write the cookie

		commonspot.util.menusearch.navigateTo(mode);
		return;
	}

	var ele_header = window.document.getElementById(panelID + '_header');
	var eleDimensions = ele_header.getDimensions();
	if (ele_header && eleDimensions['width'] > 0 && eleDimensions['height'] > 0 && window.document.getElementById(panelID).style.display != 'none')
	{
		var img_indicator_src = ele_header.siblings()[0].getAttribute('src');

		commonspot.util.menusearch.closeMenuHelpDialog();
		if (img_indicator_src.indexOf('arrow_down_white.gif') < 0)
			ele_header.click();
	}
	else
		commonspot.util.menusearch.showMessage('Panel is not enabled');
}

commonspot.util.menusearch.clickPageMenuLink = function(obj)
{
	//  {'mode':'author','linkID':'',','method':'clickSecondLevelMenu'};
	var mode = typeof obj.mode ? obj.mode : '';
	var linkID = typeof obj.linkID ? obj.linkID : '';
	var itemID = typeof obj.itemID ? obj.itemID : '';
	var pageMode = typeof obj.pagemode ? obj.pagemode : 'read';
	var state = typeof obj.state ? obj.state : 0;

	var locationInfo = commonspot.data.uiState.dsLocation.getData()[0];
	var modeInfo = commonspot.data.uiState.dsMode.getData()[0];

	if (modeInfo.currenturl != '' && modeInfo.currenturl != '/commonspot/admin/')
	{
		if (mode != '' && mode !== modeInfo.baseMode)
		{
			var o = {'method':'clickPageMenuLink', 'mode':mode, 'linkID':linkID, 'pagemode':pageMode, 'state':state, 'itemID':itemID};

			var ndata = JSON.stringify(o);	// save off method to call and args as jsong string in cookie

			commonspot.util.cookie.eraseCookie('cs_menuSearchAction');		// first erase any old cookie

			commonspot.util.cookie.createCookie('cs_menuSearchAction',ndata,0,0,2);	// write the cookie

			commonspot.util.menusearch.navigateTo(mode);
			return;
		}

		if (modeInfo.mode != pageMode)
		{
			commonspot.util.menusearch.showMessage('You need to be in ' + pageMode + ' mode for this action.');
		}
		else
		{
			setTimeout(function() {
				var ele = top.cs$('#'+linkID);
				if (ele.length)
				{
					if (ele.height() > 0 && ele.width() > 0)
					{
						commonspot.util.menusearch.closeMenuHelpDialog();
						ele.click();
						var eleMenuID = linkID.replace('_btn','_menu');
						var item = cs$('#'+eleMenuID).find('#'+itemID);

						if (item.length)
						{
							item = top.cs$(item[0]);
							if (item.height() > 0 && item.width() > 0)
								item.click();
						}
					}
					else
						commonspot.util.menusearch.showMessage("Feature not enabled or you don't have permissions to access this feature");
				}
				else
					commonspot.util.menusearch.showMessage('Feature not enabled');
			},1500);
		}
	}
	else
		commonspot.util.menusearch.showMessage('No page context');

}

commonspot.util.menusearch.closeMenuHelpDialog = function()
{
	var stack = commonspot.lightbox.stack;
	for (var i=0; i<stack.length; i++)
	{
		var curDlg = commonspot.lightbox.stack[i];
		var win = curDlg.getWindow();
		if (win.name == 'menusearchdialog')
			curDlg.close();
	}
};
commonspot.util.menusearch.processNavigationToCookie = {};
commonspot.util.menusearch.processNavigationToCookie.onDataChanged = function(dataset)
{
	/* function to write cookie with info about function to call after page load */
	//commonspot.util.cookie.createCookie('cs_menuSearchAction', data);
	var data = commonspot.util.cookie.readCookie('cs_menuSearchAction');
	if (data)
	{
		var dataArr = data.split('|');
		commonspot.util.cookie.eraseCookie('cs_menuSearchAction');

		setTimeout(function()
		{
			dataArr.forEach(function(command) {
				var o = JSON.parse(command);
				var methodToCall = o.method;
				setTimeout(function(){
					commonspot.util.menusearch[methodToCall](o);
				},1500);
			});
		},1500);
	}
}

function getElementsJSONFromDOM(frameID,parentNodeID,matchClass,parentClass,siblingClass,toplevelTag, textAsTitle)
{
		// top.document.getElementById('admin_iframe').contentDocument.getElementById('subsiteAdminCollapsiblePanel')

	/* usage:

		to get all menu options from site-admin
		getElementsJSONFromDOM('admin_iframe','left_panel', '', 'CollapsiblePanel', 'CollapsiblePanelTab', 'Site Administration');

		to get all menu headers from site-admin
		getElementsJSONFromDOM('admin_iframe','left_panel', 'CollapsiblePanelTab', '', '', 'Site Administration');

		to get all page menu items
		getElementsJSONFromDOM('','pageCommonMenu', '', '', '', 'Page Menu', true);

		to get all lview panels
		getElementsJSONFromDOM('', 'left_panel_footer', 'footer_icon');
	*/
	var doc = top.document;
	if (frameID)
		doc = top.document.getElementById(frameID).contentDocument;
	var root = doc.getElementById(parentNodeID);

	if (matchClass != '')
		var itemsArr = root.getElementsByClassName(matchClass);
	else
		var itemsArr = root.getElementsByTagName('a');
	// debugger;
	var items = Array.from(itemsArr);
	var jsonArr = [];
	var textAsTitle = typeof textAsTitle != 'undefined' ? textAsTitle : false;

	var results = items.filter(function( obj )
	{
		// debugger;
		title = obj.getAttribute('title');
		if (title)
			title = title.trim();
		id = obj.getAttribute('id');
		if (!id)
		{
			e = obj.closest('[id]');		// returns closest parent with attribute id
			id = e.getAttribute('id');
		}
		txt = obj.innerText;
		if (txt)
			txt = txt.toString().trim().replace(/(\r\n|\n|\r)/g,"");

		if (textAsTitle == true && !title)
			title = txt;
		if (title && title != '' && txt && txt != '')
		{
			if (parentClass != '')
			{
				pEle = obj.closest('.' + parentClass);
				if (pEle)
				{
					if (siblingClass != '')
					{
						pEle = pEle.getElementsByClassName(siblingClass);
						if (pEle && pEle.length == 1)
						{
							pTxt = pEle[0].innerText;
							if (pTxt)
								pTxt = pTxt.toString().trim().replace(/(\r\n|\n|\r)/g,"");
							if (pTxt != '')
								txt = pTxt + ' > ' + txt;
						}
					}
					else
					{
						pTxt = pEle.innerText;
						if (pTxt)
							pTxt = pTxt.toString().trim().replace(/(\r\n|\n|\r)/g,"");
						if (pTxt != '')
							txt = pTxt + ' > ' + txt;
					}
				}
			}
			if (toplevelTag && toplevelTag != '')
				txt = toplevelTag + ' > ' + txt;

			jsonArr.push({'title': title, 'id': id, 'name': txt});
			return obj;
		}
	});
	jsonArr = JSON.stringify(jsonArr, null, 4);
	return jsonArr;
}
