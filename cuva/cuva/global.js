// adding to allow % sign in alerts
function decodeURIComponentSafe(s) { 
    if (!s) {
        return s;
    }
    return decodeURIComponent(s.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
}  

var NPS = NPS || {};

NPS.display = {
    
  /**
   * Setting up breadcrumbs on page
   */
  populateBreadcrumbs: function(breadcrumbsArr) {

      if(breadcrumbsArr === undefined) {
        breadcrumbsArr = NPS.display.recurseBreadcrumbs(jQuery("#npsNav ul li.isCurrentPage"));   
      } 

      var i;
      if(breadcrumbsArr.length >= 1){
        //show it
        jQuery("ol.Breadcrumbs").show();

        var sectionHomeA = jQuery("#GlobalNav ul li:first:contains('Home') a"); 
        var navTypeTitle = jQuery("#GlobalNav h2.GlobalNav__SectionHeading:first").text().trim();

        //figure out "home" title
        if (typeof navTypeTitle !== 'undefined' && navTypeTitle != '' && navTypeTitle != 'Explore This Park') {
          var sectionHomeTitle = navTypeTitle;
        }else{
          var sectionHomeTitle = jQuery(sectionHomeA).html();
        }      

        //loop items and add
        for (i = 0; i <= breadcrumbsArr.length; i++) {  
          if(i < breadcrumbsArr.length){
            if(i == 0 && sectionHomeTitle != "Home" && sectionHomeTitle != "Park Home" && breadcrumbsArr[i].indexOf("> Home <") > -1){
              jQuery("ol.Breadcrumbs").append("<li>"+breadcrumbsArr[i].replace("Home", sectionHomeTitle)+"</li>"); //if it's home on the first item, replace it with the section home title
            }else{
              jQuery("ol.Breadcrumbs").append("<li>"+breadcrumbsArr[i]+"</li>");  
            }             
          }
        }   
    
        jQuery("ol.Breadcrumbs li:last").addClass("active").text(jQuery("ol.Breadcrumbs li:last a").text());

        //manually add home
        if(jQuery(sectionHomeA).html() && breadcrumbsArr[0].indexOf(jQuery(sectionHomeA).attr('href')) == -1 &&
      breadcrumbsArr[0].indexOf( 'Home' ) == -1 ){
          jQuery("ol.Breadcrumbs").prepend('<li><a href="'+jQuery(sectionHomeA).attr('href')+'">'+sectionHomeTitle+'</a></li>');
        }else if(!jQuery(sectionHomeA).html() && navTypeTitle == 'Explore This Park' && jQuery("a.Hero-title").html()){  // if park and can't find 'home', make a guess
          jQuery("ol.Breadcrumbs").prepend('<li><a href="' + jQuery("a.Hero-title").attr("href") + '">'+NPS.utility.getTranslation('Park Home')+'</a></li>');
        }
        
        jQuery("ol.Breadcrumbs").prepend('<li><a href="/">NPS.gov</a></li>');         
      } 
  },

  /**
   * Help with setting up breadcrumbs on page
   */
  recurseBreadcrumbs: function(thisLI,linkArray) {  
    if(linkArray === undefined) {
      linkArray = [];
    }   
    if(jQuery(thisLI).html()){
      //reverse follow tree starting where li class='isCurrentPage'
      linkArray.unshift(jQuery("a",thisLI)[0].outerHTML); 
      directParent = jQuery(thisLI).parent("ul").parent("li.has-sub");

      if(directParent.length > 0){    
        linkArray = NPS.display.recurseBreadcrumbs(directParent,linkArray);
      }
    } 
    return linkArray;
  },  
  /**
   * Wraps the dt and dd pair in each dl with a class of wrapper with a div
   */
  wrapdldt: function() {
    jQuery('.wrapped dt').each(function() {
      var jQuerycurElement = jQuery(this);
      var jQueryselection = jQuery(this);

      while (jQuerycurElement.next().is('dd')) {
        jQuerycurElement = jQuerycurElement.next();
        jQueryselection.push(jQuerycurElement[0]);
      }

      jQueryselection.wrapAll('<div class="dl-wrapper">');
    });
  },
  /**
   * Setting up results show / hide functionality
   */
  showHide: function() {
    jQuery('.show-hide a').click(function() {
      if (jQuery(this).hasClass('read-more')) {
        jQuery(this).removeClass('read-more').addClass('read-less').text('Read Less');
        jQuery(this).parent().next().show();
      } else {
        jQuery(this).removeClass('read-less').addClass('read-more').text('Read More');
        jQuery(this).parent().next().hide();
      }
    });
  },
  /**
   * Setting up tabs functionality - relies on jQuery ui
   */
  tabsSetup: function() {
    if (jQuery('.list-nav li').length) {
      jQuery('.list-nav li:not(:first-child)').hide();
      jQuery('.list-nav li:first-child').addClass('active');
      jQuery('.list-nav li a').click(function() {
        var jQuerythis = jQuery(this);
        var jQuerylist = jQuery(this).parent().parent();

        if (jQuerythis.parent().siblings(':visible').length === 0) {
          jQuerythis.parent().siblings().show();
        } else {
          jQuerythis.parent().siblings().removeClass('active').end().addClass('active');

          var move = jQuery(this).parent().detach();
          move.prependTo(jQuerylist);
          move = null;
          jQuerythis.parent().siblings().hide();
        }
      });
    }

    if (jQuery('.content-viewer').length) {
      jQuery( '.content-viewer').tabs();
    }

    if (jQuery('.tabbed').length) {
      jQuery('.tabbed').tabs();
    }
  },
  /**
   * Show and hide global alert message
   */
  alert: function() {
    if ((jQuery('#content-alert').length) && (jQuery('.alert-toggle').length)) {
      jQuery('#content-alert').hide();
      jQuery('.alert-toggle').click(function() {
        if (jQuery('#content-alert').is(':visible')) {
          jQuery('#content-alert').hide();
          jQuery('#alert-toggle')[0].innerHTML = NPS.utility.getTranslation("Show Alerts") + ' &raquo;';
        } else{
          jQuery('#content-alert').show();
          jQuery('#alert-toggle')[0].innerHTML = NPS.utility.getTranslation("Hide Alerts") + ' &raquo;';
        }
      });
    }
  },
  /**
   * Show and hide transcript controls
   */
  transcriptControls: function() {
    if (jQuery('.transcript-control').length) {
      jQuery('.transcript-control a').click(function() {
        var transcript = jQuery(this).parent().next('.transcript');
        var jQueryfact = jQuery('.adjusted-for-fact .fact');

        if (transcript.is(':visible')) {
          if (NPS.utility.getIeVersion() === 7) {
            jQueryfact.hide();
          }

          transcript.hide();
          jQuery(this).parent().removeClass('close').addClass('open');

          if (NPS.utility.getIeVersion() === 7) {
            jQueryfact.show();
          }
        } else {
          if (NPS.utility.getIeVersion() === 7) {
            jQueryfact.hide();
          }

          transcript.show();
          jQuery(this).parent()
            .removeClass('open')
            .addClass('close');

          if (NPS.utility.getIeVersion() === 7) {
            jQueryfact.show();
          }
        }
      });
    }
  },
  /**
   * hide and show full field trips
   */
  resultAlert: function() {
    if (jQuery('#micro-filter-check').length) {
      jQuery('#micro-filter-check').change(function() {
        if (jQuery('#micro-filter-check').is(':checked')) {
          jQuery("#display-list-view li").has(".alert-box").show();
        } else{
          jQuery("#display-list-view li").has(".alert-box").hide();
        }
      });
    }
  },
  
  
  /**
   * Add show-hide buttons to reviews
   */
  reviewShow: function(){
    if(jQuery('.content .review-body').length) {
      jQuery('.review-body').hide();
      jQuery('.review-body').before('<div class="show-hide"><a class="read-more" href="javascript:;">Read More</a></div>');
      this.showHide();
    }
  },
  /**
   * Login/Logout/Siteadmin links only when in cms
   */  
  showAdminTools: function( user_id ) {
  
  url = window.location.pathname;
  filename = url.replace(/^.*[\\\/]/, '');  
  
  if ( (window.location.hostname.indexOf( 'cms.nps.doi.net' ) > -1 || window.location.hostname.indexOf( 'cms.nps.gov' ) > -1 || window.location.hostname.indexOf( 'cmstest.nps.gov' ) > -1 || window.location.hostname.indexOf( 'cmstraining.nps.gov' ) > -1) && filename != 'index_parklist.htm') {
  
    html = '<div class="container"><div class="row"><div class="col-sm-12">';
    
    if ( user_id > 0 ) {
      html += '<a class="logout" href="logout.cfm"><strong>CMS Logout</strong></a> |'; 
      html += '<a class="siteadmin" href="/siteadmin/index.htm"><strong>Site Admin</strong></a>';
    }
    else {
      html += '<a class="login" href="login.cfm"><strong>CMS Login</strong></a>';
    }
    
    html += '</div></div></div>';
    
    jQuery( '#adminTools' ).html( html );
  }
  
  },
  /**
   * Show Anniversary Banner
   */    
  displayAnniversaryBanner: function() {
  if ( jQuery( '#anniversary_banner' ).length != 0 ) {
    
    
    site_code = jQuery( '#anniversary_banner' ).data( 'sitecode' );
    site_type = jQuery( '#anniversary_banner' ).data( 'sitetype' );
    
    if ( site_type == 'park' || site_type == 'subject' ) {
      
      jsonSrc = '/' + site_code + '/anniversary_banner_' + site_code + '.json';
      
      if ( location.href.indexOf('/locations/dc/') > -1 ) {
        //Special case for /locations/dc/ having a site code that does not match URL
        jsonSrc = '/locations/dc/anniversary_banner_' + site_code + '.json';
        
      } else if ( location.href.indexOf('/locations/') > -1 ) {
        
        jsonSrc = '/locations' + jsonSrc;       
        
      } else if ( site_type == 'subject' ) {
        
        jsonSrc = '/subjects' + jsonSrc;
        
      } 

      jQuery( '#anniversary_banner' ).delegate( '.js-dismiss', 'click', function( event ) {
        
        document.cookie = 'anniversaryBannerDismiss' + site_code + '=1; expires=0; path=/';
        jQuery( '#anniversary_banner' ).hide();
        
      });
      
      // check for the cookie
      var ca = document.cookie.split(';');
      var abAuto = 1;
      
      for ( var ci = 0; ci < ca.length; ci++ ) {
      
        var c = ca[ ci ];
        while ( c.charAt(0) == ' ' ) c = c.substring( 1 );
        if ( c.indexOf( 'anniversaryBannerDismiss' + site_code + '=' ) != -1 ) {
          abAuto = 0;
        }
        
      }
      
      try {
        
        jQuery.ajax({
          type: 'GET',
          url: jsonSrc, 
          dataType: 'json',
          success: function( data ) {

            if ( undefined !== data.title ) {
              
              if ( data.title.length && abAuto == 1 ) {
                
                html = '';
                html += '<div class="container">';
                html += '<div class="AnniversaryBanner-content">';
                html += '<a href="' + data.ctaURL + '">';
                html += '<div class="AnniversaryBanner-left"><img src="' + data.imgSrc + '" alt="' + data.imgAlt +'"></div>';
                html += '<div class="AnniversaryBanner-center">';
                html += '<h2 class="AnniversaryBanner-title">' + data.title + '</h2>';
                html += '<span class="AnniversaryBanner-cta carrot-end">' + data.ctaText + '</span>';
                html += '</div>';
                html += '</a>';
                html += '<div class="AnniversaryBanner-right">';
                html += '<button class="js-dismiss" data-close=".AnniversaryBanner">';
                html += '<i class="fa fa-times-circle" aria-hidden="true"></i>';
                html += '<span class="text"> '+NPS.utility.getTranslation("Dismiss")+'<span class="visuallyhidden">'+NPS.utility.getTranslation("Promotion")+'</span></span>';
                html += '</button>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                
                jQuery( '#anniversary_banner' ).append( html );
              }
            
            }
            
          },
          error: function() { 
            // do nothing 
          }
        });
      }   
      catch ( err ) {
        // do nothing
      }
    }
  }
  },

  outputNav: function (rootSubsiteID, currentURL, mode, absolute) {
    var siteJSONURL = (absolute ? "https://www.nps.gov" : "") + "/customcf/nps_nav/site_json.cfm";
    var params = { rootsubsiteid: rootSubsiteID };

    if (mode !== "read") {
      params.mode = "author";
    }

    jQuery.getJSON(siteJSONURL, params, function( data ) {
      var urlRoot = data.r;
      var parkHeaderList = NPS.display.outputNavLevel(data.p, urlRoot, currentURL, 1, 4);
      var globalHeaderList = NPS.display.outputMobileNavLevel(data.p, urlRoot, currentURL);
      jQuery("#LocalNav").html(parkHeaderList.innerHTML);
      jQuery("#GlobalNavListLocal").html(globalHeaderList.innerHTML); 

      if(jQuery("#SiteIndexNav ul").length){
        var siteIndexList = NPS.display.outputNavLevel(data.p, urlRoot, currentURL);
        jQuery("#SiteIndexNav ul").html(siteIndexList.innerHTML);
      }  
      
      // Now call breadcrumbs
      NPS.display.populateBreadcrumbs(); // From global.js

      // Hide "Park Home" links
      jQuery("#LocalNav-desktop-nav ul:first-child > li:first-child a:contains('Park Home')").parent().hide();
      jQuery("#GlobalNavListLocal > li:first-child a:contains('Park Home')").parent().hide();

      if (!jQuery("#GlobalNavListLocal > li:first-child a:contains('Park Home')").length) {
        // Change "Explore This Park" to "Explore This Site" on non-parks
        jQuery("h2.GlobalNav__SectionHeading").text(NPS.utility.getTranslation("Explore This Site"));
      }

      jQuery(".GlobalNav__SectionHeading--green").removeAttr('hidden');
      jQuery("#GlobalNavListLocal").removeAttr('hidden');

      // hide hidden items (we used them for breadcrumbs and don't need them any more)
      jQuery("#LocalNav-desktop-nav li.isHidden, #GlobalNavListLocal li.isHidden").remove();
      jQuery("#LocalNav-desktop-nav ul:not(:has(li)), #GlobalNavListLocal ul:not(:has(li))").parent().removeClass("has-sub").find("a").removeClass("has-sub"); //remove adjacent has-sub classes before removing empty ul
      jQuery("#LocalNav-desktop-nav ul:not(:has(li)), #GlobalNavListLocal ul:not(:has(li))").remove(); //kill ul container, if empty     

      //setup content
      jQuery("ul#LocalNav > li > a").wrap("<div class='top-lvl-item-container'>").wrap("<div class='top-lvl-item'>");

      //from app-late
      //turn on smart menus
      jQuery("#Subject-header").length > 0 ? jQuery("#LocalNav").smartmenus({
        subIndicators: 1,
		subIndicatorsPos: 'append',
        subIndicatorsText: "",
        subMenusSubOffsetX: 0,
        subMenusSubOffsetY: 0,
        subMenusMaxWidth: 200,
        mainMenuSubOffsetX: 0,
        mainMenuSubOffsetY: 0,
        keepInViewport: true 
        }) : jQuery("#LocalNav").smartmenus({
            subIndicators: 1,
			subIndicatorsPos: 'append',
            subIndicatorsText: "",
            subMenusSubOffsetX: 0,
            subMenusSubOffsetY: 0,
            subMenusMaxWidth: 200,
            mainMenuSubOffsetX: 0,
            mainMenuSubOffsetY: 0,
            keepInViewport: false 
          })
        , jQuery("#LocalNav").smartmenus("keyboardSetHotkey", 123, "shiftKey")

        if(mode != 'read'){
          // Add icons and messaging to action items
          //adapted from render.cfc, remove it from there?
          jQuery("#LocalNav a.isNotActive").attr("title","Add Page").append('<img class="navHelperImg" src="/ADF/apps/nps_nav/images/inactive.png" alt="Page Is Not Active" title="Page Is Not Active" />');
          jQuery("#LocalNav a.isHidden").append('<img class="navHelperImg" src="/ADF/apps/nps_nav/images/lightbulb_off.png" alt="Page Is Not Active" title="Page Is Hidden On Nav" />');
          jQuery("#LocalNav a.doesnotexist-addenabled").append('<img class="navHelperImg" src="/ADF/apps/nps_nav/images/page_white_add.png" alt="Create Page" title="Create Page" />').attr("title","Create Page");
          jQuery("#LocalNav a.doesnotexist-adddisabled").append('<img class="navHelperImg" src="/ADF/apps/nps_nav/images/page_white_add_grayed.png" alt="Create Page Disabled" title="Create Page Disabled At This Level - Click For Details" />').attr("title","Create Page Disabled At This Level - Click For Details");
        }

      jQuery("ul#LocalNav > li:nth-child(1)").trigger('click'); //overcoming weird bug where the nav doesnt expand until after the first mouseenter and mouseexit
    });
  },

  outputMobileNavLevel: function (itemData, urlRoot, currentURL, level) {
    if (level === undefined) {
      level = 1;
    }

    var list = document.createElement("ul");

    itemData.forEach(function (val, i) {
      var listItem = document.createElement("li");
      var anchor = document.createElement("a");
      var anchorClass = level > 1 ? "GlobalNav__Submenu__Link" : "GlobalNav__Link";
      var href = (val.u.indexOf("javascript") !== -1)
        ? val.u.replace(/'/g, "&quot;")
        : urlRoot + val.u;

      if (val.c !== undefined && val.c.length > 0) {
        anchorClass = anchorClass + " " + val.c;
      }

      if (val.u.indexOf("javascript:addPageCallback") !== -1) {
        anchorClass = anchorClass + " navLink-" + val.u.split(",")[5].replace(/'/g, "").trim();
      }

      anchor.setAttribute("class", anchorClass);
      anchor.setAttribute("href", href);
      anchor.textContent = val.t;

      // Don't recurse deeper than four levels
      if ("p" in val && level < 4) {
        var button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "GlobalNav__SubmenuToggle");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#GlobalNavLocal" + level + "Item" + i + "Sub");
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute("aria-controls", "GlobalNavLocal" + level + "Item" + i + "Sub");

        var buttonText = document.createElement("span");
        buttonText.setAttribute("class", "visually-hidden");
        buttonText.textContent = "Toggle submenu for " + val.t;
        button.appendChild(buttonText);

        var splitButton = document.createElement("div");
        splitButton.setAttribute("class", "GlobalNav__SplitButton");
        splitButton.appendChild(anchor);
        splitButton.appendChild(button);
        listItem.appendChild(splitButton);

        var subList = NPS.display.outputMobileNavLevel(val.p, urlRoot, currentURL, level + 1);
        subList.setAttribute("id", "GlobalNavLocal" + level + "Item" + i + "Sub");
        subList.setAttribute("class", "GlobalNav__Submenu collapse");
        subList.setAttribute("aria-label", val.t + " submenu");
        listItem.appendChild(subList);
      } else {
        listItem.appendChild(anchor);
      }

      list.appendChild(listItem);
    });

    return list;
  },

  outputNavLevel: function (itemData, urlRoot, currentURL, level, maxLevel) {
    if (level === undefined) {
      level = 1;
    }

    var list = document.createElement("ul");

    itemData.forEach(function (val, i) {
      var listItem = document.createElement('li');
      var anchor = document.createElement('a');

      // Check if this is the current page
      if (currentURL == (urlRoot + val.u)) {
        if (val.c === undefined) {
          val.c = "isCurrentPage";
        } else if (typeof val.c === "string" && val.c.indexOf("isCurrentPage") === -1) {
          val.c = val.c + " isCurrentPage";
        }
      }

      if (val.u.indexOf("javascript:addPageCallback") !== -1) {
        if (!"c" in val) {
          val.c = "";
        }

        val.c = val.c + " navLink-" + val.u.split(",")[5].replace(/'/g, "").trim();
      }

      if ("c" in val) {
        listItem.setAttribute("class", val.c);
        anchor.setAttribute("class", val.c);
      }

      var href = (val.u.indexOf("javascript") !== -1)
        ? val.u.replace(/'/g, "&quot;")
        : urlRoot + val.u;

      anchor.setAttribute("href", href);
      anchor.textContent = val.t;
      listItem.appendChild(anchor);

      if (
        "p" in val &&
        (
          !Number.isInteger(maxLevel) ||
          (Number.isInteger(maxLevel) && level < maxLevel)
        )
      ) {
        listItem.appendChild(NPS.display.outputNavLevel(val.p, urlRoot, currentURL, level + 1, maxLevel));
      }

      list.appendChild(listItem);
    });

    return list;
  }
};
NPS.forms = {
  /**
   * Add placeholder support for older browsers
   */
  placeholder: function() {
    jQuery('[placeholder]').focus(function() {
      var input = jQuery(this);

      if (input.val() === input.attr('placeholder')) {
        input.val('');
        input.removeClass('placeholder');
      }
    }).blur(function() {
      var input = jQuery(this);

      if (input.val() === '' || input.val() === input.attr('placeholder')) {
        input.addClass('placeholder');
        input.val(input.attr('placeholder'));
      }
    }).blur().parents('form').submit(function() {
      jQuery(this).find('[placeholder]').each(function() {
        var input = jQuery(this);

        if (input.val() === input.attr('placeholder')) {
          input.val('');
        }
      });
    });
  },
  /**
   * Submit drop down on click
   */
  searchDropdown: function() {
    jQuery('#park-query').change(function() {
      if (!!jQuery(this).val()) window.location = jQuery(this).val();
      jQuery('#find_park_form').attr('action', jQuery(this).val());
    });
    jQuery('#subject-query').change(function() {
      if (!!jQuery(this).val()) window.location = jQuery(this).val();
    });
  },
  /**
   * submit sort by
   */
  sortBySubmit: function() {
    if(jQuery('.sort-by #sort-by-select').length) {
      jQuery('.sort-by #sort-by-select').change(function(){
        jQuery('.sort-by').submit();
      });
    }
  },
  /**
   * Live search
   */
  liveSearch: function(){
    jQuery('#global-search input').keyup(function() { 
      var searchVal = jQuery('#global-search input').val();
      //get url
      var url = document.location.href;
      //split url
      var urlparts = url.split('/');
      //get the park
      var park = urlparts[3];
      var siteLimit = '';
      //ensure that the park is 4 letters long
      if(park.length == 4){
        var siteLimit = 'www.nps.gov/' + park;
      }

      // added 2013-07-06 for orgs and subject site limits for search
      if(park === 'subjects'){
        var siteLimit = 'www.nps.gov/subjects/' +  urlparts[4];
      }
      if(park === 'orgs'){
        var siteLimit = 'www.nps.gov/orgs/' +  urlparts[4];
      }
      
      var subsites = window.location.pathname.split('/');
      var searchTextGuidance = 'this site';
        
      if (subsites[1] == 'subjects') {
        searchTextGuidance = 'this site';
      } else if (subsites[1] == 'teachers') {
        searchTextGuidance = 'this site';
      }
      
      searchTextGuidance = NPS.utility.getTranslation(searchTextGuidance);

      jQuery('#result1')[0].innerHTML = '<a href="/search/index.htm?query=' + searchVal + '&sitelimit=' + siteLimit + '">' + searchVal + ' ' + searchTextGuidance + '</a>';
      jQuery('#result2')[0].innerHTML = '<a href="/search/index.htm?query=' + searchVal + '">' + searchVal + ' in NPS.gov</a>';
      jQuery('#search-results-container').show();
      jQuery.ajax({
        data:{
          q: searchVal
        },
        dataType: 'jsonp',
        url: 'http://search.usa.gov/sayt?aid=' + NPS.utility.params.saytId,
        success: function(suggestions) {
          if (suggestions.length !== 0) {
            var i = 0;
            //generate suggestions html
            var html = jQuery('<ul>');
            //var html = '<p>Suggestions</p><ul>';
            jQuery.each(suggestions, function(index, suggestion) {
              if(i < 3){
                //debug here
                html.append(jQuery('<li>').append(jQuery('<a>').attr('href', '/search/index.htm?query=' + suggestion).text(suggestion)));
              }
              i++;
            });
            html = jQuery('<p>').text('Suggestions').append(html);
            jQuery('#search-results #suggestions').empty().html(html);
          }

          if (window.location.href.split('/').length - 1 === 3) {
            jQuery('#result1').hide();
          }
        },
        error: function() {
          jQuery('#search-results #suggestions').empty();
        }
      });
    });
  }
};
NPS.gallery = {
  /**
  * tool tip
  */
  tooltip: function() { 
    if(jQuery('.tooltip').length) {
      xOffset = 10;
      yOffset = 20; 
      jQuery('.tooltip img').hover(function(e) {
        //set empty title attribute for IE7
        if(NPS.utility.getIeVersion() < 8){
          jQuery(this).attr('title','');
        }
        jQuery('#tooltip').remove();
        var text = jQuery(this).attr('alt');
        if(text != undefined && text != '') {
          jQuery('body').append('<p id="tooltip">'+ jQuery(this).attr('alt') +'</p>');
          jQuery('#tooltip')
            .css('top',(e.pageY - xOffset) + 'px')
            .css('left',(e.pageX + yOffset) + 'px')
            .show();  
        }
        },
      function() {
        this.title = this.t;    
        jQuery('#tooltip').remove();
        }); 
      jQuery('.tooltip img').mousemove(function(e) {
        jQuery('#tooltip')
          .css('top',(e.pageY - xOffset) + 'px')
          .css('left',(e.pageX + yOffset) + 'px');
      });
    }
    if(jQuery('.gallery-content-tooltip').length) {
      jQuery('.gallery-content-tooltip img').mouseenter(function(e) {
        //set empty title attribute for IE7
        if(NPS.utility.getIeVersion() < 8){
          jQuery(this).attr('title','');
        }
        jQuery('.gallery-tooltip').hide();
        var tooltip = jQuery(this).parents('.image').children('.gallery-tooltip');
        if(tooltip.length && !tooltip.is(':visible')){
          tooltip.show();
        }
        else{
          var text = jQuery(this).attr('alt');
          if(text != undefined && text != '') {
            jQuery(this).parents('.image').append(jQuery('<div>').addClass('gallery-tooltip').append(jQuery('<div>').addClass('gallery-tooltip-arrow')).append(jQuery('<p>').text(text))).show();
          }
        }
        });
        jQuery('.gallery-content-tooltip img').mouseout(function(e) {
          jQuery(this).parents('.image').children('.gallery-tooltip').hide();
        });
    } 
  },
  /**
   * photo gallery setup
   */
  photoGallery: function() {
    if(jQuery('.gallery-views').length) {
      var buildControl = jQuery('<div id="gallery-controls"><ul class="view-controls"><li class="active"><a href="#" class="list-view">List View</a></li><li><a href="#" class="grid-view">Grid View</a></li></ul></div>');
      jQuery('.gallery-views #gallery-top').append(buildControl);
      NPS.gallery.galleryControls();
    }
    jQuery('#photo-gallery .description h3 a').click(function(e) {
      e.preventDefault();
      //simulate lightbox click
      jQuery(this).parent().parent().prev().children('a').click();
    });
  },
  /**
   * switch between grid and list view
   */
  galleryControls: function() {
    jQuery('.list-view, .grid-view').click(function(e){
      e.preventDefault();
      var jQuerythis = jQuery(this);
      if(!jQuerythis.parent().hasClass('active')){
        jQuerythis.parent().addClass('active');
        jQuerythis.parent().prev().removeClass('active');
        jQuerythis.parent().next().removeClass('active');
        if(jQuery('#gallery-content').hasClass('list')){
          jQuery('#gallery-content').removeClass('list').addClass('grid');
        }
        else if(jQuery('#gallery-content').hasClass('grid')){
          jQuery('#gallery-content').removeClass('grid').addClass('list');
        }
      }
    });
  }
};
NPS.lightbox = {
  lightboxTitle: function(title, currentArray, currentIndex, currentOpts) {
    var index = (currentIndex + 1);
    var html = jQuery('<div>').addClass('clearfix');
    var disablePrev = '', disableNext = '';
    if (currentArray.length > 1) {
      if(index == 1) {
        disablePrev = 'disable';
      }
        if(index == currentArray.length) {
          disableNext = 'disable'
        }
        //create next and previous buttons
        html.append(jQuery('<span>').attr('id','fancybox-prev').append(jQuery('<a>').addClass(disablePrev).attr('href','javascript:jQuery.fancybox.prev();').text('Previous')))
        .append(jQuery('<span>').attr('id','fancybox-next').append(jQuery('<a>').addClass(disableNext).attr('href','javascript:jQuery.fancybox.next();').text('Previous')))
      }
      var altText = jQuery(currentArray[currentIndex]).children().attr('alt');
      var linkText = jQuery(currentArray[currentIndex]).text();
      if(altText != undefined && altText != '') {
        title = altText;
      }
      else if(linkText != undefined && linkText != '') {
        title = linkText;
      }
      html.append(jQuery('<div>').attr('id','fancybox-description').append(jQuery('<p>').text(title)));
    return html;
  },
  /**
  * lightbox gallery
  */
  lightbox: function() {
    if (jQuery('a[data-rel="gallery1"]').length) {
      jQuery('a[data-rel="gallery1"]').fancybox({
        'titlePosition': 'inside',
        'titleFormat': NPS.lightbox.lightboxTitle
      });
    }

    //photo gallery
    if (jQuery('#photo-gallery #gallery-content .image').length) {
      jQuery('#photo-gallery #gallery-content .image a').fancybox({
        'titlePosition': 'inside',
        'titleFormat': NPS.lightbox.lightboxTitle
      });
    }

    //slideshow
    if (jQuery('#gallery-listing .slideshow').length) {
      jQuery('#gallery-listing .view-slideshow').click(function() {
        //remove relationship groupings
        jQuery('#photo-galleries .slideshow li a').attr('rel','');
        //add relationship grouping to this slideshow group
        jQuery(this).parent().next().children('li').children('a').attr('rel','gallery-slideshow');
        jQuery('a[rel="gallery-slideshow"]').fancybox({
          'titlePosition': 'inside',
          'titleFormat': NPS.lightbox.lightboxTitle
        });
        //simulate click to start lightbox
        jQuery(this).parent().next().children('li:first').children('a').click();
      });
    }
  },
  eventDetails: function(){
    if(jQuery('.results .show-event').length) {
      jQuery('.results .show-event').click(function(event) {
        jQuerythis = jQuery(this);

        if (!jQuerythis.hasClass('is-fancy')){
          //stop event
          event.preventDefault();
          //add is-fancy class to link
          jQuerythis.addClass('is-fancy');
          //add print link
          jQuery(this).parents('.wrapper').next().children().append(
            jQuery('<a>').attr('href','#').addClass('print-event ir').text('Print')
          );
          //get event details content + add width/height, hide title, no transition, cleanup on close 
          jQuerythis.fancybox({
            'content': jQuery(this).parents('.wrapper').next().children().css('width','475'),
            'titleShow': false,
            'transitionIn': 'none',
            'transitionOut': 'none',
            'onComplete': function() {
              //add print style sheet
              jQuery('<link rel="stylesheet" media="print" id="print-event" href="../global/css/event-details-print.css"/>').appendTo('head');
              //add print click event
              jQuery('#fancybox-content .print-event').click(function(e) {
                e.preventDefault();
                window.print();
                return false;
              });
            },
            'onCleanup': function() {
              //remove print style sheet
              jQuery('#print-event').remove();
            }
          });

          //continue event
          jQuerythis.trigger(event)
        }
      });
      jQuery('.results .show-event-trigger').click(function(event) {
        event.preventDefault();
        jQuerythis = jQuery(this);
        jQuerythis.parent('h3').siblings('.wrapper').find('.show-event').click();
      });
    }
  },
  /**
   * iframe for rate button
   */
  rateBtn: function () {
    var height = 805;

    //ie 7 height
  /* removed for RD
    if (NPS.utility.getIeVersion() < 8) {
      height = 855;
    }

    if (jQuery('.rate-btn').length) {
      jQuery('.rate-btn').fancybox({
        'width': 598,
        'height': height,
        'autoScale': false,
        'type': 'iframe'
      });
    }
  */
  }
};

NPS.modals = {
  _setModalParkMapHeight: function($body) {
    $body.css({
      height: jQuery(window).height() - 85
    });
  },
  init: function() {
    var me = this;

    if (jQuery('#modal-park-map')) {
      var $body = jQuery('#modal-park-map .modal-body'),
        $iframe = jQuery('#modal-park-map-iframe'),
        loaded = false;

      jQuery('#modal-park-map').modal({
        show: false
      });
      jQuery(window).resize(function() {
        me._setModalParkMapHeight($body);
      });
      jQuery('#modal-park-map').on('show.bs.modal shown.bs.modal', function() {
        if (!loaded) {
          $iframe.attr('src', $iframe.attr('data-src'));
          loaded = true;
        }

        me._setModalParkMapHeight($body);
      });
    
    //this function attached to the window allows the interior iFrame close using 'esc' key even when it has focus
      window.closeMapModal=function() {
        if (jQuery('#modal-park-map')) {
          jQuery('#modal-park-map').modal('hide');
        }
      };
    
    }
  }
};



NPS.newContent = {
  addPrintLink: function() {
    jQuery('.addthis_toolbox')
      .before(jQuery('<li>')
      .addClass('print')
      .append(jQuery('<a>')
        .attr('href','javascript:void(0);')
        .text('print')
      ));
    jQuery('.print a').click(function() {
      window.print();
      return false;
    });
  },
  // Simple function that adds the double right brackets to the links with the .more class.
  moreLinks: function () {
    if (NPS.utility.getIeVersion() < 8) {
      var $this = jQuery(this);

      jQuery('.more').each(function() {
        $this[0].innerHTML = $this.text() + '&nbsp;&raquo;';
      });
      jQuery('.back').each(function() {
        $this = jQuery(this);
        $this[0].innerHTML = '&laquo;&nbsp;' + $this.text();
      });
    }
  },
  // Twitter.
  getTweets: function (username, tweetNum, container) {
    if (container && container.length) {
      container.append(jQuery('<span>').addClass('loading'));

      jQuery.getJSON('http://twitter.com/statuses/user_timeline.json?screen_name=' + username + '&count=' + tweetNum + '&callback=?', function(data) {
        var tweet = data[0].text;

        tweet = tweet.replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig, function(url) {
          return '<a href="' + url + '">'+url+'</a>';
        }).replace(/B@([_a-z0-9]+)/ig, function(reply) {
          return  reply.charAt(0)+'<a href="http://twitter.com/' + reply.substring(1) + '">' + reply.substring(1) + '</a>';
        });
        container
          .empty()
          .append(jQuery('<p>').append(tweet));
      });
    } 
  }
};

NPS.text = {
  // Resizes the container to the width of the child image.
  resizeToImage: function() {
    if (jQuery('.resize-to-image img').length) {
      jQuery.each(jQuery('.resize-to-image'), function(index, val) {
        $this = jQuery(this);

        $this.children('img').load(function() {
          $this.width($this.children('img').width());
        });
      });
    }
  },
  // Update text controls.
  textSizes: function() {
    var self = this;

    jQuery('.utils .text-sizes a').click(function() {
      var activeSize = jQuery('.utils .text-sizes .active').parent().attr('class'),
        size = jQuery(this).parent().attr('class');

      jQuery('.utils .text-sizes a').removeClass('active');
      jQuery(this).addClass('active');
      self.textResize(activeSize, size);

      if (jQuery('.carousel-list').length) {
        NPS.cycle.setCycleHeight('.carousel-list .row');
      }
    });
  },
  // Resize text by - or + 2 pixels.
  textResize: function(activeSize, size) {
    var value = 0;

    switch (activeSize) {
    case 'large':
      switch (size) {
      case 'medium':
        value = -2;
        break;
      case 'small':
        value = -4;
        break;
      }
      break;
    case 'medium':
      switch (size) {
      case 'large':
        value = 2;
        break;
      case 'small':
        value = -2;
        break;
      }
      break;
    case 'small':
      switch (size) {
      case 'medium':
        value = 2;
        break;
      case 'large':
        value = 4;
        break;
      }
      break;
    }

    jQuery.each(NPS.utility.params.resize, function(index, elementType) {
      jQuery(elementType).each(function() {
        var $this = jQuery(this);

        if (!$this.parents('.bap').length && !$this.parents('.navbar').length) {
          $this.css('font-size', (parseInt(jQuery.trim($this.css('font-size').replace('px', '')), 10) + value) + 'px');
        }
      });
    });
  }
};
NPS.utility = {
  // Global parameters.
  params: {
    resize : [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'ol',
      'ul',
      'dt',
      'dd'
    ],
    preloadChrome: [
      ['/common/commonspot/templates/images/chrome/bg/results.png'],
      ['/common/commonspot/templates/images/chrome/bg/results-bottom.png'],
      ['/common/commonspot/templates/images/chrome/bg/results-top.png'],
      ['/common/commonspot/templates/images/chrome/bg/nav-dd-edges.png']
    ],
    saytId: '277',
    translationCache: [],
    translationLanguageTags: '',      
    translationSiteLanguageTag: 'en-us',    
    translationSeedLanguageTag: 'en-us'
  },
  // Detect versions of IE.
  getIeVersion: function() {
    if (this.ieVersion === 'undefined') {
      var div = document.createElement('div'),
        all = div.getElementsByTagName('i'),
        v = 3,
        undef;

      while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
      );

      if (v > 4) {
        this.ieVersion = v;
      } else {
        this.ieVersion = NaN;
      }
    }
    return this.ieVersion;
  },
  // Checks to see if a value is an integer.
  isInt: function(value) {
    if ((parseFloat(value) === parseInt(value, 10)) && !isNaN(value)) {
      return true;
    } else {
      return false;
    }
  },
  pageSetups: function(value) {
    jQuery('#site-map-container').hide();
    jQuery('#sm-control a').removeClass('expanded');
    jQuery('.content-container .utils').css('visibility', 'visible');
    jQuery('.search-control input[type=submit]').hide();
    jQuery('html').removeClass('no-js').addClass('js');
  },
  // Image preload.
  preload: function(arrayOfImages) {
    jQuery(arrayOfImages).each(function() {
      jQuery('<img/>')[0].src = this;
    });
  },
  initTranslation: function() {
    var languageTagList = ['de-de','fr-ca','es-es','zh-hans','ru-ru'];
    var languageTagListLength = languageTagList.length;
    var bAltLangSite = false;
    for (var i = 0; i < languageTagListLength; i++) {
      if(window.location.href.indexOf(languageTagList[i]) > -1) {
        bAltLangSite = true;
        i = languageTagListLength;
      }
    }
    if ( bAltLangSite ) {
      jQuery.ajax({
        url: "/customcf/translation/translationJSON.cfm",
        dataType: 'json',
        async: false,
        success: function(data) {
          NPS.utility.params.translationCache = data.translationCache;
          NPS.utility.params.translationLanguageTags = data.languageTagList;
          if((typeof commonspot.csPage.subsiteRoot != 'undefined') && (commonspot.csPage.subsiteRoot != "/")){
            if(NPS.utility.params.translationLanguageTags.indexOf(commonspot.csPage.subsiteRoot.split("/")[1]) >= 0){
              NPS.utility.params.translationSiteLanguageTag = commonspot.csPage.subsiteRoot.split("/")[1];
            }
          } 
          //NPS.utility.params.translationSiteLanguageTag = "es-es"; //REMOVE THIS AFTER TESTING -AR
        }
      });
    }
  },
  getTranslation:function(txt,languageTag){ 
    if(Object.keys(NPS.utility.params.translationCache).length < 1) NPS.utility.initTranslation();  
    if (typeof languageTag === 'undefined') languageTag = NPS.utility.params.translationSiteLanguageTag;
    if(languageTag != NPS.utility.params.translationSeedLanguageTag){
      txt = jQuery('<div />').html(txt).text(); //unescape html
      if(txt in NPS.utility.params.translationCache && languageTag in NPS.utility.params.translationCache[txt]){
        txt = NPS.utility.params.translationCache[txt][languageTag];
        txt = jQuery('<div />').text(txt).html(); //escape html
        /*return "&#8482; " + txt;
      }else{
        return "&#9524; " + txt;//UPDATE THIS WHEN DONE*/
      }
    } 
    return txt; 
  }
};

NPS.loadPlugins = function() {
  jQuery.fn.mousehold = function(timeout, f) {
    if (timeout && typeof timeout === 'function') {
      f = timeout;
      timeout = 100;
    }

    if (f && typeof f === 'function') {
      var fireStep = 0,
        timer = 0;

      return this.each(function() {
        function clearMousehold() {
          clearInterval(timer);

          if (fireStep === 1) {
            f.call(this, 1);
          }

          fireStep = 0;
        }

        jQuery(this)
          .mousedown(function() {
            var ctr = 0,
              t = this;

            fireStep = 1;
            timer = setInterval(function() {
              ctr++;
              f.call(t, ctr);
              fireStep = 2;
            }, timeout);
          })
          .mouseout(clearMousehold)
          .mouseup(clearMousehold);
      });
    }
  };

  
  jQuery.fn.slidebox = function() {
    var slidebox = this,
      open = false,
      originalPosition = slidebox.css('right'),
      boxAnimations;

    if (Modernizr.cssanimations) {
      boxAnimations = {
        open: function() {
          slidebox.addClass('open');
        },
        close: function() {
          slidebox.removeClass('open');
        }
      };
    } else {
      boxAnimations = {
        open: function() {
          slidebox.animate({
            right: '10px'
          }, 300);
        },
        close: function() {
          slidebox.stop(true).animate({
            right: originalPosition
          }, 100);
        }
      };
    }

    jQuery(window).scroll(function() {
      var distanceTop = jQuery('#content-bottom').offset().top - jQuery(window).height() - 80;

      if (jQuery(window).scrollTop() > distanceTop) {
        if (!open) {
          open = true;
          boxAnimations.open();
        }
      } else {
        open = false;
        boxAnimations.close();
      }
    });
    slidebox.find('.close').click(function() {
      jQuery(this).parent().parent().remove();
    });
  };
  /** 
   * jQuery split a list into multiple rows or columns
   *   Usage: 
   *     jQuery(".dropdown ul").splitList(3);
   *     jQuery(".dropdown ul").splitList(3, { wrapClass: "div_class_name" });
   *     jQuery(".dropdown ul").splitList(3, { splitInto: "div_class_name" });
   */
  jQuery.fn.splitList = function(n, options) {
    settings = jQuery.extend({
      wrapClass: false,
      splitInto: 'cols'
    }, options);

    return this.each(function(){
      var intoCols = (settings.splitInto === 'cols'),
        w = '<div' + (settings.wrapClass ? ' class="' + settings.wrapClass + '"' : '' ) + '></div>';

      jQuerylis = jQuery(this).find('> li');
      jQueryinc = intoCols ? parseInt((jQuerylis.length/n) + (jQuerylis.length % n > 0 ), 10) : n;

      for (var i = 0; i < (intoCols ? n : Math.ceil(jQuerylis.length/n)); i++) {
        jQuerylis.slice(jQueryinc*i, jQueryinc*(i+1)).wrapAll(w);
      }
    });
  };

};

NPS.outdatedModal = {
  display:function() {
    if (document.all && !window.atob && jQuery('#outdated-browser').length) {
      var s='';
      s+='<div class="modal-dialog" role="document" aria-labelledby="myModalLabel">';
      s+='<div class="modal-content">';
      s+='<div class="modal-header">';
      s+='<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>';
      s+='<h4 class="modal-title" id="myModalLabel">Did you know that your Internet browser is out of date?</h4>';
      s+='</div>';
      s+='<div class="modal-body">';
      s+='<p>To ensure that all features of NPS.gov work as they\'re supposed to, please upgrade to the latest version of one of these web browsers. Just click on one of the icons to go to the download page for that browser.</p>';
      s+='<ul class="browser-links">';
      s+='<li class="browser-link"><a href="https://www.google.com/chrome/"><div class="chrome"></div>Chrome</a></li>';
      s+='<li class="browser-link"><a href="https://www.mozilla.org/en-US/firefox/"><div class="firefox"></div>Firefox</a></li>';
      s+='<li class="browser-link"><a href="http://windows.microsoft.com/en-us/internet-explorer/download-ie"><div class="internet-explorer"></div>Internet Explorer</a></li>';
      s+='<li class="browser-link"><a href="https://www.apple.com/safari/"><div class="safari"></div>Safari</a></li>';
      s+='<li class="browser-link"><a href="https://www.opera.com/"><div class="opera"></div>Opera</a></li>';
      s+='</ul>';
      s+='<p style="font-size: 11px;">';
      s+='Special note for Internet Explorer users: This site will only be fully functional on version 11 with compatibility mode turned off. If you\'re using version 11 and seeing this message, compatibility is turned on in your browser. If you need compatibility mode turned on to use other sites or applications, you\'ll need to use another browser to see the full NPS.gov site.</p>';
      s+='<p><a data-dismiss="modal" aria-label="Close" href="javascript:;">Close This Window</a> *<br/><div style="font-size:10px">* By closing this window, you acknowledge that your experience on this website may be degraded.</div></p>';
      s+='</div>';
      s+='</div>';
      s+='</div>';
      jQuery('#outdated-browser').html(s).modal();
    }
  }
}

NPS.globalNav = {
  display: function (featureData) {
    var globalNavContainer = document.getElementById("GlobalNavCollapse");
    if (!globalNavContainer) return;

    jQuery.getJSON("/common/commonspot/templates/jsondata/headerData.json", function (data) {
      /* check for dismiss cookie */
      var ca = document.cookie.split(';');
      var promoDismissed = 0;

      for (var ci = 0; ci < ca.length; ci++) {
        var c = ca[ ci ];
        while ( c.charAt(0) == " " ) c = c.substring( 1 );
        if ( c.indexOf( "promoDismissed=" ) != -1 ) {
          promoDismissed = 1;
        }
      }

      /* render standard global nav */
      var languageNotice = globalNavContainer.querySelector(".GlobalNav__LanguageInfo");

      if (
        commonspot !== undefined &&
        commonspot.csPage !== undefined &&
        commonspot.csPage.subsiteRoot !== undefined &&
        NPS.utility.params.translationLanguageTags.indexOf(commonspot.csPage.subsiteRoot.split("/")[1]) > 0
      ) {
        var languageNotice = globalNavContainer.querySelector(".GlobalNav__LanguageInfo");
        languageNotice.textContent = NPS.utility.getTranslation("These links provide information in English only.");
      } else if (languageNotice) {
        languageNotice.remove();
      }

      var navSections = data.navigation;
      var globalNavList = document.getElementById("GlobalNavList");

      navSections.forEach(function (navSection, i) {
        var listItem = document.createElement("li");
        var splitButton = document.createElement("div");
        splitButton.setAttribute("class", "GlobalNav__SplitButton");

        var anchor = document.createElement("a");
        anchor.setAttribute("href", navSection.link);
        anchor.setAttribute("class", "GlobalNav__Link");
        anchor.textContent = NPS.utility.getTranslation(navSection.title);
        splitButton.appendChild(anchor);

        var button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("class", "GlobalNav__SubmenuToggle");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", "#GlobalNavItem" + i + "Sub");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", "GlobalNavItem" + i + "Sub");

        var buttonText = document.createElement("span");
        buttonText.setAttribute("class", "visually-hidden");
        buttonText.textContent = NPS.utility.getTranslation("Toggle submenu for " + navSection.title);
        button.appendChild(buttonText);
        splitButton.appendChild(button);

        var subList = document.createElement("ul");
        subList.setAttribute("id", "GlobalNavItem" + i + "Sub");
        subList.setAttribute("class", "GlobalNav__Submenu collapse");
        subList.setAttribute("aria-label", NPS.utility.getTranslation(navSection.title + " submenu"));

        navSection.children.forEach(function (child) {
          var listItem2 = document.createElement("li");
          var anchor2 = document.createElement("a");
          anchor2.setAttribute("href", child.link);
          anchor2.setAttribute("class", "GlobalNav__Submenu__Link");
          anchor2.textContent = NPS.utility.getTranslation(child.title);
          listItem2.appendChild(anchor2);
          subList.appendChild(listItem2);
        });

        listItem.appendChild(splitButton);
        listItem.appendChild(subList);
        globalNavList.appendChild(listItem);
      });

      /*  First let's do the dynamic pieces of the global Nav */
      if (NPS.utility.params.translationSiteLanguageTag == "en-us") { //only show for english sites
        var d = data.globalNavFeature;

        var globalNavFeature = document.createElement("li");
        globalNavFeature.setAttribute("class", "GlobalNav__Feature");

        var globalNavFeatureAnchor = document.createElement("a");
        globalNavFeatureAnchor.setAttribute("class", "GlobalNav__Feature__Link");
        globalNavFeatureAnchor.setAttribute("href", d.link);

        var globalNavFeatureImage = document.createElement("img");
        globalNavFeatureImage.setAttribute("src", d.imgSrc);
        globalNavFeatureImage.setAttribute("alt", "");
        globalNavFeatureAnchor.appendChild(globalNavFeatureImage);

        if (d.subtext.length > 0) {
          var globalNavFeatureSubtext = document.createElement("h3");
          globalNavFeatureSubtext.textContent = NPS.utility.getTranslation(d.subtext);
          globalNavFeatureAnchor.appendChild(globalNavFeatureSubtext);
        }

        var globalNavFeatureCTA = document.createElement("p");
        globalNavFeatureCTA.textContent = NPS.utility.getTranslation(d.callToActionText);
        globalNavFeatureAnchor.appendChild(globalNavFeatureCTA);

        globalNavFeature.appendChild(globalNavFeatureAnchor);
        globalNavList.appendChild(globalNavFeature);
      }

      /*** hide blue bar if there is no park menu ***/
      if (jQuery("#GlobalNavListLocal li > a").length === 0) {
        jQuery("#GlobalNavList .GlobalNav__SectionHeading--blue").css("border-top","none");
      }
    });
  },
  setPromoCookie: function() {
    document.cookie = 'promoDismissed=1; expires=0; path=/';
  }
}

/* Global Alert Message for entire NPS Website */
NPS.globalAlert = {

  display:function() {    
    
    var s = document.getElementById('__topdoc__');
    if (!s) return;

    var alertDiv = document.createElement('div');   
    alertDiv.className = 'ShutdownBanner';
    
    var bannerContent = '';
  /*
    bannerContent += '<style type="text/css"> .ShutdownBanner { background-color: #AC652F; color: #FFFFFF } .ShutdownBanner__Description a { color: #000000; text-decoration: underline; } ';
    bannerContent += ' .ShutdownBanner__Description a:link { color: #000000; text-decoration: underline; } ';
    bannerContent += ' .ShutdownBanner__Description a:visited { color: #000000; text-decoration: underline; } </style>';
    bannerContent += '<div class="container"><div class="row"><div class="ShutdownBanner__Icon col-xs-1">';
    bannerContent += '<svg width="30px" height="30px" viewBox="0 0 30 30" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    bannerContent += '<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">';
    bannerContent += '<g id="HomePages-1" transform="translate(-338.000000, -34.000000)" fill="#FFFFFF">';
    bannerContent += '<g id="report" transform="translate(338.000000, 34.000000)">';
    bannerContent += '<path d="M21.0497238,0 L8.78453039,0 L0,8.68611111 L0,20.9777778 L8.78453039,29.5 L21.2154696,29.5 L30,20.8138889 L30,8.68611111 L21.0497238,0 L21.0497238,0 Z M14.9171271,23.4361111 C13.7569061,23.4361111 12.7624309,22.4527778 12.7624309,21.3055556 C12.7624309,20.1583333 13.7569061,19.175 14.9171271,19.175 C16.0773481,19.175 17.0718232,20.1583333 17.0718232,21.3055556 C17.0718232,22.4527778 16.0773481,23.4361111 14.9171271,23.4361111 L14.9171271,23.4361111 Z M16.5745856,16.3888889 L13.2596685,16.3888889 L13.2596685,6.55555556 L16.5745856,6.55555556 L16.5745856,16.3888889 L16.5745856,16.3888889 Z" id="Shape"></path>';
    bannerContent += '</g></g></g></svg>';
    bannerContent += '</div><div class="col-xs-10">';
    bannerContent += '<h4 class="ShutdownBanner__Heading">COVID-19 Response</h2>';
    bannerContent += '<div class="ShutdownBanner__Description">Mask requirements vary by park, based on CDC\'s <a href="https://www.cdc.gov/coronavirus/2019-ncov/your-health/covid-by-county.html">COVID-19 Community Level tool</a>. Please check the <a href="https://www.nps.gov/findapark/index.htm">park website</a> before visiting. Additional details are available at <a href="https://www.nps.gov/aboutus/news/public-health-update.htm">www.nps.gov/coronavirus</a>. </div>';
    bannerContent += '</div></div></div>';
    
    alertDiv.innerHTML = bannerContent;
    
    s.parentNode.insertBefore( alertDiv, s );
  */
  }
  
}


/* ErrorHandler for logging JS errors in Google Analytics */
/* TESTING: DO NOT DEPLOY TO PROD AT THIS TIME */
NPS.errorHandler = {
  
  init: function(){
    // preserve any previously assigned error handlers
    NPS.errorHandler.prevErrHandler = window.error;
    window.onerror = NPS.errorHandler.handleError;
  },
  
  handleError: function(msg, url, lineNo, columnNo, error){

    // if browser supports error object stack, use that instead of less helpful/more generic message
    if (error) msg = error.stack;
    
    // per https://developers.google.com/analytics/devguides/collection/analyticsjs/exceptions
    if (typeof gas === "function") {
      gas('send', 'exception', {
        'exDescription': msg,
        'exFatal': false
      });
    }
    
    // if there was a previous error handler defined, let's get it back in action now.
    if (typeof NPS.errorHandler.prevErrHandler === "function"){
      NPS.errorHandler.prevErrHandler(msg, url, lineNo, columnNo, error); 
    }
  },
  
  remove: function() {
    window.onerror = NPS.errorHandler.prevErrHandler;
  }
};

// NPS.errorHandler.init();
/* End of ErrorHandler Testing Block */


jQuery(document).ready(function() {
    
  /*
  NPS.utility.pageSetups();

  if (jQuery('#search-results-container').length) {
    NPS.utility.preload(NPS.utility.params.preloadChrome);
  }

  NPS.loadPlugins();
  NPS.text.resizeToImage();

  if (navigator.userAgent.toLowerCase().indexOf('chrome') >= 0) {
    jQuery('#global-search').attr('autocomplete', 'off'); 
  }

  NPS.display.wrapdldt();
  NPS.display.reviewShow();
  NPS.display.resultAlert();
  NPS.display.tabsSetup();
  NPS.display.alert();
  NPS.text.textSizes();
  NPS.newContent.webcamLink();
  NPS.newContent.moreLinks();
  NPS.newContent.getTweets("CivilWarReportr", 1, jQuery('#tweet'));
  NPS.newContent.addPrintLink();
  NPS.forms.searchDropdown();
  NPS.forms.liveSearch();
  NPS.forms.placeholder();
  NPS.forms.sortBySubmit();
  NPS.lightbox.lightbox();
  NPS.lightbox.rateBtn();
  NPS.lightbox.eventDetails();
  //NPS.modals.init();
  NPS.gallery.tooltip();
  NPS.gallery.photoGallery();
 
  if (jQuery('#slidebox').length) {
    jQuery('#slidebox').slidebox();
  }

  if (jQuery('#alert-box').text() === '') {
    jQuery('#alert-box').text('There are park alerts in effect.');
  }
  */
  NPS.display.transcriptControls();

  NPS.display.displayAnniversaryBanner();
  
  NPS.globalNav.display();

  NPS.outdatedModal.display();
  
  //NPS.globalAlert.display();
    
    if (window.location.href.indexOf("subjects/undergroundrailroad") > -1) {
        setTimeout(function (){
            jQuery('a[href^="/subjects/undergroundrailroad/grants.htm"]').each(function(){
                var newUrl = jQuery(this).attr('href');
                jQuery(this).attr("href","/orgs/1205/resources.htm"); 
            });
        }, 1000);
    }
    
    // Translate date of "Last Updated:" line on Spanish sites
    if (window.location.href.indexOf("es-es") > -1) {
        var date_last_mod_text = jQuery("p:contains('Última actualización:')").text();
        date_last_mod_text = date_last_mod_text.replace(",","");
        var res = date_last_mod_text.split(" ");
        var arrayLength = res.length;
        var new_date_last_mod = res[0]+" "+res[1]+" "+res[3]+" de "+NPS.utility.getTranslation(res[2])+" del "+res[4];
        jQuery("p:contains('Última actualización:')").text(new_date_last_mod);
    }
    
    // Added attributes for 508 compliance
    jQuery("table.CS_Layout_Table").attr("role","presentation");
 
    //temporarily adding crazyegg monitoring to specific pages. this should be removed soon. WD-405. -aR 12/17/2021
    const crazyEggUrls = [
      "/index.htm",
      "/findapark/index.htm",
      "/state/ca/index.htm",
      "/planyourvisit/index.htm",
      "/planyourvisit/event-search.htm",
      "/learnandexplore/explore-by-topic.htm", 
      "/subjects/trails/index.htm",
      "/stli/index.htm",
      "/yose/index.htm",
      "/subjects/bears/safety.htm",
      "/findapark/advanced-search.htm"
    ];

    if( crazyEggUrls.includes( window.location.pathname ) ){ 
      let script = document.createElement("script");
      script.src = "//script.crazyegg.com/pages/scripts/0090/6260.js";
      script.async = true;
      document.head.appendChild(script);
    }

});
