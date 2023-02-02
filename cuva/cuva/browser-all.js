//var connections = [];

function renderResourceTag(fileName, fileType, resourceLoaderURL)
{
	if (!window.cs_resourcesLoaded)
		window.cs_resourcesLoaded = {};
	if (!window.cs_resourcesLoaded[fileName])
	{
		window.cs_resourcesLoaded[fileName] = true;
		var scriptURL = (resourceLoaderURL !== '') && (fileName.indexOf(',') > 0 || fileName.indexOf('*') >= 0) // if we can combine or minify, and have resource loader, use it
			? resourceLoaderURL + fileName // HIGH: this won't work if we can't combine and multiple files are passed in, so loadDashboardFiles() doesn't do that
			: fileName;
		var oScript = document.createElement(fileType);
		switch (fileType)
		{
			case 'script':
				oScript.src = scriptURL;
				document.getElementsByTagName('HEAD').item(0).appendChild(oScript);
				break;
			case 'link':
				oScript.type = 'text/css';
				oScript.href = scriptURL;
				oScript.rel = 'stylesheet';
				document.getElementsByTagName('HEAD').item(0).appendChild(oScript);
				break;
		}
	}
}

function loadNonDashboardFiles()
{
	var filesToLoad = [];
	filesToLoad.push({fileName: '*/commonspot/dashboard/css/buttons.css', fileType: 'link', fileID: 'buttons_css'});
	filesToLoad.push({fileName: '*/commonspot/javascript/lightbox/lightbox.css', fileType: 'link', fileID: 'cs_lightbox_css'});
	filesToLoad.push({fileName: '*/commonspot/javascript/util.js', fileType: 'script', fileID: 'cs_util_js'}); // 	must load before lightbox!
	filesToLoad.push({fileName: '*/commonspot/javascript/lightbox/lightbox.js', fileType: 'script', fileID: 'cs_lightbox_js'});
	// used to load overrides.js and window_ref.js here, but those are done by resource infrastructure now
	//filesToLoad.push({fileName: '*/commonspot/javascript/lightbox/overrides.js', fileType: 'script', fileID: 'cs_overrides'});
	//filesToLoad.push({fileName: '/commonspot/javascript/lightbox/window_ref.js', fileType: 'script', fileID: 'cs_windowref'});
	loadDashboardFiles(filesToLoad);
}

function loadDashboardFiles(arrFiles)
{
	if (typeof window.jsSiteResourceSettings === 'undefined') // shouldn't happen, should honor site combine/minify settings
	{
		if (console && console.log)
			console.log('[loadDashboardFiles] window.jsSiteResourceSettings is not defined'); // really do want to complain here, this isn't debug code
		window.jsSiteResourceSettings = {canCombine: false, canMinify: false};
	}
	if (typeof arrFiles === 'undefined') // arrFiles is optional
		arrFiles = []; // used to load overrides.js and window_ref.js here, but those are done by resource infrastructure now

	var count = arrFiles.length,
		resourceLoaderURL = (typeof jsSiteResourceLoader === 'string') ? jsSiteResourceLoader : '',
		typedFiles = {},
		file, i;

	for (i = 0; i < count; i++)
	{
		file = arrFiles[i];
		if (!window.jsSiteResourceSettings.canMinify && file.fileName.substr(0, 1) === '*' && resourceLoaderURL !== '')
			file.fileName = file.fileName.substr(1); // can't minify, strip invoking '*'
		if (!window.jsSiteResourceSettings.canCombine || resourceLoaderURL === '')
			renderResourceTag(file.fileName, file.fileType, resourceLoaderURL); // can't combine, just render single tag
		else // can combine, collect by file type
		{
			if (!typedFiles[file.fileType])
				typedFiles[file.fileType] = [];
			typedFiles[file.fileType].push(file.fileName);
		}
	}

	for (fileType in typedFiles)
	{
		if (typedFiles.hasOwnProperty(fileType))
			renderResourceTag(typedFiles[fileType].join(','), fileType, resourceLoaderURL);
	}
}


function setUpComplete()
{
	if ((top.commonspot && top.commonspot.lightbox) || (parent.commonspot && parent.commonspot.lightbox))
		return true;
	else
		return false;
}

function newCenteredWindow(name, url, width, height, windowFeatures)
{
	var left = (screen.availWidth - width) / 2;
	var top = ((screen.availHeight - height) / 2) - 20; // a bit above center
	if(!windowFeatures)
		windowFeatures = 'toolbar=no,menubar=no,location=no,scrollbars,resizable';
	windowFeatures += ',top=' + top + ',left=' + left + ',width=' + width + ',height=' + height;
	newWindow(name, url, windowFeatures);
}
function submitFormToNewWindow(windowName, loader, csModule, args)
{
	var form, fldName;
	form = document.createElement('form');
	form.target = windowName;
	form.action = loader;
	form.method = 'post';
	//form.enctype = 'multipart/form-data'; // NEEDSWORK: we may need to do this for UTF8???
	form.style.display = 'none';
	createField(form, 'csModule', csModule);
	for(fldName in args)
		createField(form, fldName, args[fldName]);
	document.body.appendChild(form);
	var win = openEmptyLightBox(null, null, windowName);
	form.target = win;
	form.submit();
	document.body.removeChild(form);

	function createField(form, name, value)
	{
		var fld = document.createElement('input');
		fld.type = 'hidden';
		fld.name = name;
		fld.value = value;
		form.appendChild(fld);
	}
}
function AskClearCache (workUrl)
{
	newWindow('clearcache', workUrl);
}
function setSelectedAudience(id)
{
	newWindow('SetAudience',jsDlgLoader + '?CSRF_Token=' + top.commonspot.util.cookie.readCookie('CSRFTOKEN') + '&csModule=utilities/set-audience&amp;target='+id);
}
function doDisplayOptionsMenu(dlgloader,pageid,event)
{
	var thisMenu = document.getElementById("DisplayOptionsMenu");
	calcMenuPos ("DisplayOptionsMenu",event);
	stopEvent(event);
}
function doRolesMenu(dlgloader,pageid,event)
{
	var thisMenu = document.getElementById("RolesMenu");
	calcMenuPos ("RolesMenu",event);
	stopEvent(event);
}
function doPageManagementMenu(dlgloader,pageid,event)
{
	var thisMenu = document.getElementById("PageManagementMenu");
	calcMenuPos ("PageManagementMenu",event);
	stopEvent(event);
}
function toggleState (value, name)
{
	document.styleSheets[0].addRule(".cls" + name, (value) ? "display:block;" : "display:none;");
	document.cookie = name + "=" + value;
}
function toggleDesc (value, name)
{
	document.getElementById("id" + name).style.display =  (value) ? "block" : "none";
	document.getElementById("id" + name + "img").src =  (value) ? "/commonspot/images/arrow-right.gif" : "/commonspot/images/arrow.gif";
	document.cookie = name + "=" + value;
}
function stopEvent(event)
{
	if(event.preventDefault)
	{
		event.preventDefault();
		event.stopPropagation();
	}
	else
	{
		event.returnValue = false;
		event.cancelBubble = true;
	}
}
function canRollover(browserVersion)
{
	var agent = navigator.userAgent.toLowerCase();
	var isMoz = agent.match('mozilla') && agent.match('gecko');
	var minVers = isMoz ? 3 : 4;
	return (browserVersion >= minVers) ? 1 : 0;
}

var bVer = parseInt(navigator.appVersion);
var bCanRollover = canRollover(bVer);

function ImageSet(imgID,newTarget)
{
	if (bCanRollover)
	{
		document[imgID].src=newTarget;
		
		// Display picture tag if webP is enabled, else display img tag
		if( document.getElementsByName(imgID + "_webP").length > 0 )
		{
			var imgURLArr = newTarget.split('.');
			document.getElementsByName(imgID + "_webP")[0].srcset = imgURLArr[0] + '.webp';
		}
	}
}

// Error handler to handle the case when the webp image is missing
function onErrorRenderImg(obj)
{
	if (bCanRollover)
		obj.previousElementSibling.srcset = '';
	
	obj.removeAttribute("onerror");
}

function gotoDiffLang(langID)
{
	workUrl = 'loader.cfm?CSRF_Token=' + top.commonspot.util.cookie.readCookie('CSRFTOKEN') + '&csModule=controls/linkcommon/goto-difflang&amp;langid=' + langID;
	window.location=workUrl+'&amp;pageid='+js_gvPageID;
}
var doRefresh = true;
function refreshParent()
{
	if ( self.opener && doRefresh )
	{
		self.opener.location.reload();
	}
	self.close;
}

function getFrameWindow(frameID,frameName)
{
	if (frameID)
		return window.document.getElementById(frameID).contentWindow;

	var frames = window.frames;
	for (var i=0; i<frames.length; i++)
	{
		if (frames[i].name == frameName)
			return frames[i];
	}
	return null;
}

function setEditorModeToWYSIWYG(frameName,fieldname,formname,populateFieldFromEditor)
{
	var editorInstance = CKEDITOR.instances[fieldname];

	/*
		this doesn't populate the associated field w the value from the editor, which the 2-RTE case (text around image) needs
		in the single RTE case, field value after setMode() is the old value, not the editor result
		saving a single RTE does work, so something else must be updating the field, but but whatever mechanism that is, it doesn't work for 2 RTEs...
	*/
	if (editorInstance && editorInstance.setMode)
		editorInstance.setMode('wysiwyg');

	// ...so do it here if requested, which doSubmit() in tb-simplewithcaption.cfm does in the 2-RTE case
	if (populateFieldFromEditor)
	{
		var data = '';
		if (editorInstance && editorInstance.getData)
			data = editorInstance.getData();
		if (!formname)
			formname = "dlgform";
		var tb = eval ('document.' + formname + "." + fieldname);
		tb.value = data;
	}
}

function glblLinkHandler(lobj, attr, val)
{
	lobj.style[attr]=val;
}
// we should replace tons of diff. instances of form validation codes with this one to make
// sure we do not have diff. implementations for the same task.
function stringTrim(_this,str)
{
   if(!str) str = _this;
   return str.replace(/^\s*/,"").replace(/\s*$/,"");
}

function substringReplace(source,pattern,replacement)
{
	var pos = 0;
	var target="";
	while ((pos = source.indexOf(pattern)) != (-1))
	{
		target = target + source.substring(0,pos) + replacement;
		source = source.substring(pos+pattern.length);
		pos = source.indexOf(pattern);
	}
	return (target + source);
}
function cs_decodeURI(res)
{
	try
	{
		return decodeURI(res);
	}
	catch(e)
	{
		return res;
	}
}
function cs_encodeURI(res)
{
	try
	{
		var res = cs_decodeURI(res);
	}
	catch(e){}
	return encodeURI(res);
}
function unescapeHTML(msg)
{
	var msg = msg.replace(/<\/?[^>]+>/gi, '');
	return msg.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"');
}

function setCommonspot()
{
	if (typeof commonspot != 'undefined' && typeof top.commonspot == 'undefined')
		top.commonspot = commonspot;
}

function checkPopupBlocked(poppedWindow)
{
	var wnd = newWindow('testWnd', poppedWindow, 'Testing new window', true, 'width=1,height=1,scrollbars=no,menubar=no,status=no,toolbar=no,top=' + window.screen.height + ',left=' + window.screen.width + ',resizable=no');
	return hasPopupBlocker(wnd);
}

function hasPopupBlocker(wnd)
{
	var result = true;

	try
	 {
		if (typeof wnd == 'undefined')
		{
			// Safari with popup blocker... leaves the popup window handle undefined
			result = false;
		}
		else if (wnd && wnd.closed)
		{
			// This happens if the user opens and closes the client window...
			// Confusing because the handle is still available, but it's in a "closed" state.
			// We're not saying that the window is not being blocked, we're just saying
			// that the window has been closed before the test could be run.
			result = true;
		}
		else if (wnd && wnd.test)
		{
			// This is the actual test. The client window should be fine.
			result = true;
		}
		else
		{
			// Else we'll assume the window is not OK
			result = false;
		}
 		wnd.close();
	}
	 catch (e){}

	return result;
}

var last = function last()
{
	return this[this.length - 1];
}

var each = function each(iterator)
{
	for (var i = 0, length = this.length; i < length; i++)
	  iterator(this[i]);
}
if (!Array.last)
{
	Array.prototype.last = last;
	Array.prototype.each = each;
}