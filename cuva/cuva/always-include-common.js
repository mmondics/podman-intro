// always-include-common.js  Copyright 1998-2020 PaperThin, Inc. All rights reserved.

bName = navigator.appName;
bVer = parseInt(navigator.appVersion);

var bCanRollover=0
if (bName == "Netscape")
{
	if(bVer >= 3)
		bCanRollover=1;
}
else if (bName == "Microsoft Internet Explorer")
{
	if(bVer >= 4)
		bCanRollover=1;
}

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

function clearStatus()
{
	window.status = "";
}

function setStatbar(statbar)
{
// #22793 - no-op because browsers don't honor the assignment
//	var strStatbar=unescape(statbar);
//	window.status=strStatbar;
}

function onLoadComplete()
{
	if (menus_included == 1)
		document.onmouseover = document_mouseover;	// defined in menu_ie.js
}

function HandleLink(parentID,link,displaylink)
{
	// links are in one of the following formats:
	// 		cpe_60_0,CP___PAGEID=100
	// 		CPNEWWIN:WindowName^params@CP___
	// 			CPNEWWIN:child^top=110:left=130:ww=140:hh=150:tb=1:loc=1:dir=0:stat=1:mb=1:sb=1:rs=1@CP___PAGEID=3811,Adv-Search-2,1
	// displaylink is the server relative URL or fully qualified URL
	windowname = "";
	windowparams = "";

	// "CPNEWWIN:" & NewWindowName & "^" & params & "@" & linkStruct.LinkURL;
	pos = link.indexOf("CPNEWWIN:");
	if (pos != -1)
	{
		pos1 = link.indexOf ("^");
		windowname = link.substring (pos+9, pos1);
		pos2 = link.indexOf ("@");
		windowparams = link.substring (pos1 + 1, pos2);
		link = link.substring (pos2 + 1, link.length);
	}

	if (displaylink && displaylink != "")
	{
		if (windowname == "")
			window.location = displaylink;
		else
		{
			windowparams = FormatWindowParams(windowparams);
			window.open (displaylink, windowname, windowparams);
		}
	}
	else
	{
		targetLink = link;

		if (link.indexOf ("CP___") != -1)
		{
			httpPos = -1;
			commaPos = link.indexOf(",");
			if (commaPos != -1)
			{
				targetUrl = link.substr(commaPos + 1);
				if (targetUrl.indexOf("://") != -1 || targetUrl.indexOf("/") == 0)
				{
					httpPos = commaPos + 1;
				}
			}

			if (httpPos != -1)
			{
				targetLink = link.substr(httpPos);

				commaPos = targetLink.indexOf(",");
				if (commaPos != -1)
					targetLink = targetLink.substr(0, commaPos);
			}
			else
				targetLink = jsDlgLoader + "?CSRF_Token=" + top.commonspot.util.cookie.readCookie('CSRFTOKEN') + "&csModule=utilities/handle-link&thelink=" + link;

			if (windowname == "")
				window.location = targetLink;
			else
			{
				windowparams = FormatWindowParams(windowparams);
				window.open (targetLink, windowname, windowparams);
			}
		}
		else
		{
			//commaPos = link.indexOf(",");
			//if (commaPos != -1)
			// link = link.substr(0, commaPos);

			if (windowname == "")
				window.location = link;
			else
			{
				windowparams = FormatWindowParams(windowparams);
				window.open (link, windowname, windowparams);
			}
		}
	}
}

function doWindowOpen(href,name,params)
{
	if (params != '')
		window.open (href, name, params);
	else
		window.open (href, name);
}

// 	CPNEWWIN:child^top=110:left=130:ww=140:hh=150:tb=1:loc=1:dir=0:stat=1:mb=1:sb=1:rs=1@CP___PAGEID=3811,Adv-Search-2,1
function FormatWindowParams(windowparams)
{
	if (windowparams.indexOf(":loc=") != -1 || windowparams.indexOf(":ww=") != -1 || windowparams.indexOf(":hh=") != -1 ||
	    windowparams.indexOf(":left=") != -1 || windowparams.indexOf(":top=") != -1)
	{
		windowparams = substringReplace(windowparams,':left=',',left=');
		windowparams = substringReplace(windowparams,'left=','left=');
		windowparams = substringReplace(windowparams,':ww=',',width=');
		windowparams = substringReplace(windowparams,'ww=','width=');
		windowparams = substringReplace(windowparams,':hh=',',height=');
		windowparams = substringReplace(windowparams,'hh=','height=');
		windowparams = substringReplace(windowparams,':loc=',',location=');
		windowparams = substringReplace(windowparams,'loc=','location=');
		windowparams = substringReplace(windowparams,':dir=',',directories=');
		windowparams = substringReplace(windowparams,'dir=','directories=');
		windowparams = substringReplace(windowparams,':tb=',',toolbar=');
		windowparams = substringReplace(windowparams,'tb=','toolbar=');
		windowparams = substringReplace(windowparams,':stat=',',status=');
		windowparams = substringReplace(windowparams,':mb=',',menubar=');
		windowparams = substringReplace(windowparams,':sb=',',scrollbars=');
		windowparams = substringReplace(windowparams,':rs=',',resizable=');
	}
	return windowparams;
}


// reset scheduled elements
function clear_sched_element()
{
	evalCol = String(self.element_collection);
	var obj;
	if  (evalCol != 'undefined')
	{
		for(i=0;i<self.element_collection.length;i++)
		{
			sitem = self.element_collection[i];
			sp = 'sched_elements_' + sitem.ctrl + '_' + sitem.id;
			obj = document.getElementById(sp);
			if (obj)
				obj.style.display = sitem.display;
		}
	}
}

// handle scheduled element links
function show_sched_element(eid)
{
	evalCol = String(self.element_collection);
	dispFlag = false;

	if  (evalCol != 'undefined')
	{
		for(i=0;i<self.element_collection.length;i++)
		{

			sitem = self.element_collection[i];
			sp = 'sched_elements_' + sitem.ctrl + '_' + sitem.id;
			obj = document.getElementsByName(sp);

			if  (sitem.id == eid && obj != null)
			{

				dispFlag = true;
				if  (obj.length > 0)
				{
					for(z=0;z<obj.length;z++)
					{
						obj(z).style.display = 'block';
					}
				}
				else
				{
					obj = document.getElementById(sp)
							if(obj)
						obj.style.display = 'block';
				}

				for (j=0;j < self.element_collection.length;j++){
					if (sitem.ctrl == self.element_collection[j].ctrl && i != j){
						sp = 'sched_elements_' + self.element_collection[j].ctrl + '_' + self.element_collection[j].id;
						obj = document.getElementsByName(sp);

						if  (obj != null)
						{
							if  (obj.length > 0)
							{
								for(z=0;z<obj.length;z++)
								{
									obj(z).style.display = 'none';
								}
							}
							else
							{
								obj = document.getElementById(sp)
										if(obj)
									obj.style.display = 'none';
							}
						}
					}
				}
			}
		}
	}

	if  (!dispFlag)
		alert("You do not have access to the requested element.");
}
