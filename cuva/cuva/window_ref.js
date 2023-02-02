/*
JavaScript routines to resolve references for windows inside lightbox
*/

getOpener = function(ignoreOpenerProperty)
{
	if ((self != top) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
	{
		var win = top.commonspot.lightbox.getOpenerWindow(ignoreOpenerProperty);
		if (win)
			return win;
		else
		{
			if (top.commonspot.lightbox.stack.length <= 1)
				return top;
		}	
	}
	else
	{
		return self.opener;
	}
};

getOpenerWithIFrame = function(iFrameID)
{
	var wnd = getOpener();
	var obj = wnd.document.getElementById(iFrameID);
	if (obj)
	{
		return obj.contentWindow;
	}
	return getOpener();
};

getWindowWithFrame = function (FrameName)
{
	var stackLen = 0;
	var wn = null;
	if ((self != top) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
		stackLen = top.commonspot.lightbox.stack.length;
	for (var i=stackLen-1; i>=0; i--)
	{
		wn = top.commonspot.lightbox.stack[i].getWindow();
		if (wn)
		{
			try
			{
				if (typeof wn.frames[FrameName] != 'undefined')
					return wn.frames[FrameName].window
			}catch(e){}		
		}
	}	
	return wn;
};

getRTEopener = function (FrameName)
{
	alert('use getRTEObject instead.');
};

getRTEObject = function(FrameName, checkFrames, closeHigherWindows)
{
	// Grab the window object out of the RTE's iframe
	checkFrames = (typeof checkFrames == 'undefined') ? true : checkFrames;
	FrameName = (typeof FrameName == 'undefined') ? 'WebEdit' : FrameName;
	var fr = null;
	var wn = null;
	var rteObj = null;
	var stackLen = 0;
	var fWn = null;
	if ((self != top) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
		stackLen = top.commonspot.lightbox.stack.length;
	for (var i=stackLen-1; i>=0; i--)
	{
		wn = top.commonspot.lightbox.stack[i].getWindow();
		if (wn)
		{
			if (checkFrames)
			{
				for (j=0; j<wn.frames.length; j++)
				{
					try
					{
						fWn = wn.frames[j];
						if (fWn)
						{
							if (typeof fWn['CKEDITOR'] != 'undefined')
							{
								rteObj = fWn['CKEDITOR'].instances[FrameName];
								break;
							}	
							else if (typeof fWn.CKEDITOR != 'undefined')
							{
								rteObj = fWn.CKEDITOR.instances[FrameName];
								break;
							}
						}
					}catch(e){}
				}
			}
			try
			{
				if (typeof wn['CKEDITOR'] != 'undefined')
				{
					rteObj = wn['CKEDITOR'].instances[FrameName];
					break;
				}	
				else if (typeof wn.CKEDITOR != 'undefined')
				{
					rteObj = wn.CKEDITOR.instances[FrameName];
					break;
				}
			}catch(e){}
		}	
	}
	if (!rteObj)
	{
		wn = top;
		if (checkFrames)
		{
			for (j=0; j<wn.frames.length; j++)
			{
				try
				{
					fWn = wn.frames[j];
					if (typeof fWn['CKEDITOR'] != 'undefined')
					{
						rteObj = fWn['CKEDITOR'].instances[FrameName];
						break;
					}	
					else if (typeof fWn.CKEDITOR != 'undefined')
					{
						rteObj = fWn.CKEDITOR.instances[FrameName];
						break;
					}
				}catch(e){}
			}
		}
		try
		{
			if (typeof wn['CKEDITOR'] != 'undefined')
				rteObj = wn['CKEDITOR'].instances[FrameName];
			else if (typeof wn.CKEDITOR != 'undefined')
				rteObj = wn.CKEDITOR.instances[FrameName];	
		}catch(e){}		
	}
	
	if (rteObj && closeHigherWindows && top.commonspot.lightbox)
		top.commonspot.lightbox.closeChildDlgsFromPosition(i);

	return rteObj;
};

hasLightbox = function()
{
	return ((top != self) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'));
};

var cleanHTMLWnd;
var spellcheckerWnd;
getCleanHTMLTarget = function(dlgLoader)
{
	var url = dlgLoader ? dlgLoader + '?CSRF_Token=' + top.commonspot.util.cookie.readCookie('CSRFTOKEN') + '&csModule=/commonspot/dhtmledit/clean_dhtml_fields' : '/commonspot/dhtmledit/clean_dhtml_fields.cfm';

	if((top != self) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
	{
		var frName;
		for (var i=0; i<top.commonspot.lightbox.stack.length; i++)
		{
			frName = top.commonspot.lightbox.stack[i].getFrameName();
			if (frName == 'cleanHTML')
				return frName;
		}	
		var lightboxTarget = openEmptyLightBox(url, null, 'cleanHTML');
		return top.commonspot.lightbox.getFrameName();
	}
	else
	{
		if (!cleanHTMLWnd || cleanHTMLWnd.closed)
			cleanHTMLWnd = newWindow( 'cleanHTML', url);
		return 'cleanHTML';	
	}
};

getSpellCheckTarget = function(dlgLoader)
{
	var url = dlgLoader ? dlgLoader + '?CSRF_Token=' + top.commonspot.util.cookie.readCookie('CSRFTOKEN') + '&csModule=/commonspot/spellchk/introscreen' : '/commonspot/spellchk/introscreen.cfm';

	if((top != self) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
	{
		// Open an empty lightbox
		var frName;
		for (var i=0; i<top.commonspot.lightbox.stack.length; i++)
		{
			frName = top.commonspot.lightbox.stack[i].getFrameName();
			if (frName == 'spellchecker')
				return frName;
		}	
		var lightboxTarget = openEmptyLightBox(url, null, 'spellchecker');
		return top.commonspot.lightbox.getFrameName();
	}
	else
	{
		if (!spellcheckerWnd || spellcheckerWnd.closed)
			spellcheckerWnd = newWindow( 'spellchecker', url);
		return 'spellchecker';	
	}
};

closeEmptyChildDialogs = function(frameNameList)
{
	frameNameList = frameNameList ? frameNameList : 'cleanHTML,spellchecker';
	if ((top != self) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
	{
		var win;
		for (var i=top.commonspot.lightbox.stack.length-1; i>=0; i--)
		{
			win = top.commonspot.lightbox.stack[i];
			frName = win.getFrameName();
			if (frameNameList.indexOf(frName) >= 0)
				win.close();
		}
	}	
};

closeCleanHTMLWindows = function()
{
	closeEmptyChildDialogs('cleanHTML');
	/*
	if (self.children)
	{
		for(i=0;i<self.children.length;i++)
			self.children[i].close();
	}
	*/
};

getCSModuleField = function(thisForm)
{
	var fld = null;
	var update = 0;
	if (typeof thisForm.CSMODULE != 'undefined')
	{
		fld = thisForm.CSMODULE;
		update = 1;
	}	
	else if (typeof thisForm.csModule != 'undefined')
		fld = thisForm.csModule;
	else if (typeof thisForm.csmodule != 'undefined')
	{
		fld = thisForm.csmodule;
		update = 1;
	}	
	if (update)
		fld.setAttribute('name', 'csModule');	
	return fld;	
};

closeSpellCheckWindows = function()
{
	closeEmptyChildDialogs('spellchecker');
};

openEmptyLightBox = function(url, hideClose, name, customOverlayMsg)
{
	var lightboxTarget;	
	url = url ? url : null;
	hideClose = hideClose ? hideClose : null;
	name = name ? name : null;
	customOverlayMsg = customOverlayMsg ? customOverlayMsg : null;
	// If we are inside a lightbox
	if ((top != self) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
	{
		// Open an empty lightbox
		top.commonspot.lightbox.openDialog(url, hideClose, name, customOverlayMsg, null, null, true);
		
		lightboxTarget = top.commonspot.lightbox.getFrameName();
		// Form's target now must be the lightbox, not a new window
		return lightboxTarget;
	}
};

// returns contentWindow of admin-frame
getAdminWindow = function()
{
	var win = null;
	if ((top != self) && (typeof(top.commonspot)!= 'undefined') && (typeof(top.commonspot.lightbox)!= 'undefined'))
		win = top.commonspot.lightbox.getAdminWindow();
	return win;	
};


	/**
	 * Generic alert to user.
	 * see commonspot.dialog.client.showHTMLDialog for supported options
	 * msg can be text, or can be an array, in which case it'll be rendered as an html list
	 */
if ((top != self) && (typeof(top.commonspot)!== 'undefined') && (typeof(top.commonspot.lightbox)!== 'undefined'))
{
	if (typeof top.commonspot.dialog === 'undefined')
		top.commonspot.dialog = {};
	if (typeof top.commonspot.dialog.client === 'undefined')
	{
		top.commonspot.dialog.client = {};

		top.commonspot.dialog.client.alert = function(msg, options)
		{
			var html;
			if(msg.constructor == String)
				html = msg;
			else // assumed to be an array
			{
				if(msg.length === 1)
					html = msg[0];
				else
				{
					html = "<ul>";
					for(var i = 0; i < msg.length; i++)
						html += "<li>" + msg[i] + "</li>";
					html += "</ul>";
				}
			}
			html = html.replace(/\n/g, '<br />');
			top.commonspot.dialog.client.showHTMLDialog(html, options, 'alert');
		};

		/*
		 * create a lightboxed dlg containing the passed html
		 */
		top.commonspot.dialog.client.showHTMLDialog = function(html, options, dialogType)
		{
			options = options || {};
			var defaultOptions =
			{
				title: "CommonSpot Message",
				subtitle: "",
				helpId: "",
				width: 500,
				height: 600,
				style: '',
				useDefaultStyles: true,
				maximize: false,
				hideClose: false,
				hideHelp: true,
				hideReload: true
			};
			top.commonspot.util.merge(options, defaultOptions);

			dialogType = dialogType || 'dialog';

			var style = options.style;
			if(options.useDefaultStyles)
				style = top.commonspot.dialog.client.getHTMLDialogDefaultStyles() + style;

			html = top.commonspot.dialog.client.getHTMLDialogHTML(html, style, options.title, options);

			// openDialog(url, hideClose, name, customOverlayMsg, dialogType, opener, hideHelp)
			var dlgObj = top.commonspot.lightbox.openDialog("about:blank", options.hideClose, null, top.commonspot.lightbox.NO_OVERLAY_MSG, dialogType, null, options.hideClose, options.hideReload);
			var lightboxWindow = dlgObj.getWindow();
			lightboxWindow.document.write(html);
			lightboxWindow.document.close();

			top.commonspot.lightbox.initCurrent
			(
				options.width,
				options.height,
				{
					title: options.title, subtitle: options.subtitle, helpId: options.helpId,
					close: options.close, reload: options.reload, maximize: options.maximize
				},
				'',
				true
			);

			var dt = lightboxWindow.document.getElementById("dialogContainer");
			var w = Math.max(dt.clientWidth + 30, 350);
			var h = Math.max(dt.clientHeight, 70) - ((options.hideClose && !options.customButtons) ? 30 : 0);
			top.commonspot.lightbox.resizeCurrent(w, h);
			// first wanted this to autosize, to measure it, but now want it full width so close btn is far right
			lightboxWindow.document.getElementById("dialogContainer").style.width = "100%";
		};

		top.commonspot.dialog.client.getHTMLDialogDefaultStyles = function()
		{
			var style =
	'body {font-family: Verdana,Arial,Helvetica,sans-serif; margin: 0; overflow: scroll; text-decoration: none; font-size: 11px;}\n\
	a:active {text-decoration: underline; color: #1D2661;}\n\
	a:hover {text-decoration: underline;color: #003366;}\n\
	a {color: #1D2661;text-decoration: underline;}\n\
	a:visited {	text-decoration: underline;color: #1D2661;}\n\
	#content {margin: 15px 11px; overflow: auto; font-size: 11px;}\n\
	#innerdialogContainer {background-color:#F0F0F0;border-bottom:1px solid #999999;border-top:1px solid #999999;margin-top:10px;}\n\
	#htmlDlgTableCell h2 {font-size: 11px; margin: 15px 0 8px;}\n\
	#htmlDlgTableCell h2:first-child {margin-top: 0;}\n\
	#htmlDlgTableCell p {margin: 0 0 8px; padding: 0;}\n\
	#htmlDlgTableCell ul {margin: 0 0 1em 1em; padding: 0;}\n\
	#htmlDlgTableCell li {margin: 5px;}\n\
	#htmlDlgTableCell dl {margin: 0 0 1em;}\n\
	#htmlDlgTableCell dt {color: #013466; font-weight: bold; margin: 5px 0 0;}\n\
	#htmlDlgTableCell dd {margin: 0 0 0 1.5em;}\n\
	#dialogContainer #dialogFooter {display: block; font-weight: bold; height: 28px; line-height: 28px; margin: 5px 0 0; padding: 0 1px; text-align: right; font-size: 11px;}\n\
	#htmlDlgTableCell .dumpTable caption {font-size: 8pt; font-weight: bold;}\n\
	#htmlDlgTableCell .dumpTable td {border: 1px solid #ccc; font-size: 8pt; padding: 1px;}\n\
	';
			return style;
		};

		top.commonspot.dialog.client.getHTMLDialogHTML = function(alertHTML, styleHTML, title, options)
		{
			var btnHTML = '';
			var linkID, linkClass, linkOnClick, linkObj, linkAccessKey, linkText;
			var accessKeyHTML = '';
			btnHTML += options.hideClose ? '' : '<a id="closeButton" accesskey="C" href="javascript:;" onclick="top.commonspot.lightbox.closeCurrent()">Close</a>';
			if (options.customButtons)
			{
				for (var i=0; i<options.customButtons.length; i++)
				{
					linkObj = options.customButtons[i];
					linkID = linkObj.id ? linkObj.id : 'okButton';
					linkOnClick = linkObj.onclick ? linkObj.onclick : '';
					linkText = linkObj.linkText ? linkObj.linkText : '';
					if (linkObj.accessKey)
						accessKeyHTML = ' accesskey="' + linkObj.accessKey + '"';
					if (linkOnClick != '' && linkID != '' && linkText != '')
						btnHTML += '<a id="' + linkID + '"' + accessKeyHTML + ' href="javascript:;" onclick="' + linkOnClick + '">' + linkText + '</a>';
				}
			}
			var html =
				'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
				'<html>' +
				'<head>' +
					'<link href="/commonspot/dashboard/css/dialog.css" rel="stylesheet" type="text/css" id="dialogcss" />' +
					'<style>' + styleHTML + '</style>' +
					(title ? '<title>' + title + '</title>' : '') +
				'</head>' +
				'<body>' +
					'<table id="dialogContainer">' +
						'<tr><td>' +
							'<table id="innerdialogContainer" width="100%">' +
								'<tr>' +
									'<td id="htmlDlgTableCell">' +
										'<div id="content">' + alertHTML + '</div>' +
									'</td>' +
								'</tr>' +
							'</table>' +
						'</td></tr>' +
						'<tr><td>' +
							'<div id="dialogFooter">' +
								btnHTML +
							'</div>' +
						'</td></tr>' +
					'</table>' +
				'</body>' +
				'</html>';
			return html;
		};
	}
}	 

function checkOrSelectLinkVisibleInDOMFromRowData(row, action)
{
	return checkOrSelectLinkVisibleInDOMFromLinkData(row.linktype, row.url, row.linktargetid, action);
}

function checkOrSelectLinkVisibleInDOMFromLinkData(linkType, URL, linkTargetID, action)
{
	if( parent.window.Dashboard )
	{
		var win_obj = parent.window.Lview.frame.dom().contentWindow;
		var doc_obj = win_obj.document;
	}
	else
	{
		var win_obj = getOpener();
		var doc_obj = win_obj.document;
	}

	var argText = '';

	var type = linkType;
	if (URL == '' || type == 10)
	{
		argText = linkTargetID;
		argText = argText.toString();
	}
	else
	{
		argText = URL;
		var argArray = argText.split(':');

		if( argArray.length == 2 && argArray[1].trim() == linkTargetID )
		{
			argText = linkTargetID;
			argText = argText.toString();
		}
	}

	var imageType = 0;
	var attrib = 'href';

	if (type == 1 || type == 2 || type == 7 || type == 8 || type == 9 || type == 4 || type == 5 || type == 6 || type == 10 || type == 13)
	{
		var aDivs = doc_obj.getElementsByTagName("A");
		var iDivs = doc_obj.getElementsByTagName("IMG");
	}

	if (type == 4 || type == 5 || type == 6)
		imageType = 1;

	if (type == 10) 	// Popup menu
	{
		argText = "CP_MENU:" + argText;
	}

	if (type == 1 || type == 13) 	// delete CS Page
	{
		var isNotNumeric = isNaN(argText);
		if(! isNotNumeric)
		{
			argText = "CP___PAGEID_" + argText;
			attrib = 'class';
		}
	}

	if( action != 'clear' ) // For select or count, clear the selections
	{
		//Reset all...  OPTIMIZE this by storing dom id's
		if( typeof aDivs != 'undefined' && aDivs.length > 0 )
		{
			for ( i=0; i < aDivs.length; i++)
			{
				if ( aDivs[i].style )
					cs$(aDivs[i]).css({background : ''});
			}
		}

		if( typeof iDivs != 'undefined' && iDivs.length > 0 )
		{
			for ( i=0; i < iDivs.length; i++)
			{
				if ( iDivs[i].style )
					iDivs[i].style.border='';
			}
		}
	}

	if (imageType == 1)
	{
		aDivs = iDivs;
		attrib = 'src';
	}

	var selectCount = 0;
	var linkFound = 0;
	var thisHREF = '';

	if( typeof aDivs != 'undefined' && aDivs.length > 0 )
	{
		for ( i=0; i < aDivs.length; i++ )
		{
			thisHREF = aDivs[i].getAttribute(attrib);
			/*console.log(aDivs[i]);
				alert(argText);alert(thisHREF);
				alert(argText.indexOf(thisHREF));*/
			if ((thisHREF != null)
					&& (thisHREF != 'javascript:;')
					&& ((thisHREF.search('^'+argText) > -1)
							|| (thisHREF.search('@'+argText) > -1)
							|| ((argText.indexOf(thisHREF) >= 0) && (thisHREF.slice(-1) != '/'))
							|| (thisHREF.indexOf(argText) == 0 && thisHREF.length == argText.length)))
			{
				if( action == 'check' ) // action = check, so we just need to see if we found it in dom or not and return
				{
					linkFound = 1;
					break;
				}
				else if( action == 'count' )  // action = count, we need to get count
				{
					selectCount++;
				}
				else  // action = select, we need to select the link here
				{
					var editBig = 0;
					for ( x=0; x < aDivs[i].attributes.length; x++ )
					{
						if (aDivs[i].attributes[x].value.search('edit-big') != -1)
						{
							editBig = 1;
							break;
						}
					}

					if (editBig == 0)
					{
						if (imageType == 0)
						{
							cs$(aDivs[i]).css({'background-color':'yellow','color':'black'});
						}
						else
						{
							cs$(aDivs[i]).css({border :'double yellow'});
						}

						selectCount++;
					}
					else
					{
						x = i - 1;
						if (x > -1)
						{
							cs$(aDivs[x]).css({'background-color':'yellow'});
							selectCount++;
						}
					}

					//Scroll to the first item found
					if (selectCount >= 1)
					{
						aDivs[i].scrollIntoView(false);
						win_obj.scrollBy(-2000,0);
					}
					else
					{
						if (imageType == 0)
							alert( 'Could not locate the link.\n\nThe link may not be visible due to scheduling or the containing element is no longer rendered.' );
						else
							alert( 'Could not locate the image.\n\nThe image may not be visible due to scheduling or the containing element is no longer rendered.' );
					}
				}
			}
		}
	}

	// If action is check then return the linkFound variable, if action si count, then return selectCount variable else do actions for select
	if( action == 'check' )
		return linkFound;
	else if( action == 'count' )
		return selectCount;
	else
	{
		if(!window.parent.Dashboard)
			win_obj.focus();
		else
			CloseWindow();
	}
}
