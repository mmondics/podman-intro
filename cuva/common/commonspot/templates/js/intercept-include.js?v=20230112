/*

EXTERNAL LINK INTERCEPT SCRIPT
- Interacts with links to add a modal window when an external link is clicked.
- The below runs onLoad and interacts with the A tags

How to include on page:

The following need to be included on your page for this script to work. If you include this script as well as the following, this intercept should automatically work.
- jquery-XX.js
- jquery-migrate-XX.js
- nps-bootstrap.min.js
- jquery.colorbox-min.js

Created By: Andy Reid
Original Date: October 15, 2010

Modifications;
DATE        NAME          DESC
5/12/2011   Andy Reid     Removed some weird references to usa.gov that were breaking the code
11/15/2011  Trevor Cole   Removed style modal and replaced with colorbox modal.
                          Added support to intercept mailto links with colorbox modal window if the class of the a tag is "colorbox-iframe"
5/21/2013   Andy Reid     Modified script to be less prone to error out when a user puts in a bad link. removed commented out code. backed up locally if you need it.
12/15/2014  Trevor Cole   Added a tooltip to a certain link (NPF) class to open a modal window to display a form.
3/31/2015   Joe Flowers   Switch to bootstrap modals for responsive design
06/15/2015  Paul Tsao     Added selector to handle href in image map
12/16/2015  Andy Reid     Added missing modal support and script note above
03/15/2017  Darrin Maule  Added Exception for Google Sites
09/26/2017  Trevor Cole   Added Exceptions for VideoJS Social Sharing links
10/12/2017  Darrin Maule  Resolved issue which kept the contact us modal from opening
01/28/2021  Andrew Mills  Added rsgsurvey.com to exception URL tests
01/29/2021  Andrew Mills  Added https://doimspp.sharepoint.com to exception URL tests
04/07/2021  Andrew Mills  Added https://teams.microsoft.com/l/ to exception URL tests
10/03/2022  Andrew Mills  Added https://play.google.com to exception URL tests
11/03/2022	Andrew Mills  Remove play.google.com from exception URL tests
*/

(function (window, $, NPS) {
  var exceptions = [
    window.location.hostname,
    '.gov',
    '.mil',
    '.si.edu',
    '.fed.us',
    'rsgsurvey.com',
    'teams.microsoft.com',
    'doimspp.sharepoint.com',
    'pvs.nupointsystems.com'
  ];

  function intercept(element) {
    // Get the HREF Destination
    var hrefVal = $(element).attr("href");
    // Get the Class (used to exclude vjs-share-*)
    var classVal = $(element).attr("class");

    // Check that we have an href
    if (
      (hrefVal != undefined && hrefVal != '' && hrefVal != '#' && hrefVal.length > 4) &&
      !(classVal != undefined && classVal.indexOf("vjs-share-") > -1)
    ){
      // Strip old intercept urls preemptively
      var hrefVal_strp = strip_old_intercepts( get_url_from_handlelink(hrefVal) );

      if (hrefVal != hrefVal_strp) {
        $(element).attr("href", hrefVal_strp);
      }
      hrefVal = hrefVal_strp;

      // String old intercept from the html of the element
      var hrefHTML = $(element).html();
      var hrefHTML_strp = strip_old_intercepts( get_url_from_handlelink(hrefHTML) );
      if (hrefHTML != hrefHTML_strp) {
        $(element).html(hrefHTML_strp);
      }

      // Get the href start value
      var startStrVal = hrefVal.substring(0, 7);
      var isProtocolAgnostic = hrefVal.substring(0, 2) == "//";

      // Check if we have a valid URL
      // CT Update: a valid url may be protocal agnostic and start with //

      if (isProtocolAgnostic || startStrVal == 'http://' || startStrVal == 'https:/' || hrefVal.indexOf("javascript:HandleLink") != -1) {
        // Get the HREF domain
        var hrefDomain = get_hostname_from_url(hrefVal);

        var domain_match = exceptions.filter(function (x) {
          // returns array of matching exceptions
          return hrefDomain.indexOf( x ) > -1;
        });           

        // Check if we are going to the NPF Modal First
        if (hrefVal.indexOf("http://join.nationalparks.org/news-and-updates") != -1) {
          // load in css for tooltips
          if (document.createStyleSheet){
            document.createStyleSheet('/ADF/thirdParty/jquery/ui/jquery-ui-1.9/css/sunny/jquery-ui.css');
            document.createStyleSheet('/common/commonspot/templates/css/npf-tooltip.css');
          } else {
            $("head").append("<link rel='stylesheet' href='/ADF/thirdParty/jquery/ui/jquery-ui-1.9/css/sunny/jquery-ui.css' type='text/css' media='screen' />");
            $("head").append("<link rel='stylesheet' href='/common/commonspot/templates/css/npf-tooltip.css' type='text/css' media='screen' />");
          }
          // Remove onClick bindings
          $(element).unbind('click');
          $(element).attr("onClick", "");

          $(element).attr("title", "This link will direct you to a non-government website that may have different privacy policies from those of the National Park Service.");

          if (typeof $.ui != 'undefined') {
            // $.ui loaded, let's do something!
            $('.npf-tooltip').tooltip({
              track: true,
              position: {
                my: "center bottom-20",
                at: "center top",
                using: function( position, feedback ) {
                  $( this ).css( position );
                  $( "<div>" )
                    .addClass( "arrow" )
                    .addClass( feedback.vertical )
                    .addClass( feedback.horizontal )
                    .appendTo( this );
                }
              }
            });
          } else {
            // We need to load $.ui first
            var url = '/ADF/thirdParty/jquery/ui/jquery-ui-1.9/js/jquery-ui-1.9.js';
            $.getScript( url ).done(function ( script, textStatus ) {
              $('.npf-tooltip').tooltip({
                track: true,
                position: {
                  my: "center bottom-20",
                  at: "center top",
                  using: function( position, feedback ) {
                    $( this ).css( position );
                    $( "<div>" )
                      .addClass( "arrow" )
                      .addClass( feedback.vertical )
                      .addClass( feedback.horizontal )
                      .appendTo( this );
                  }
                }
              });
            });
          }
        }
        
        // Check if we are leaving the domain
        else if ( domain_match.length == 0 ) {
          /* NOTE: we set the 7 second timeout for the redirect in the modal_intercept.cfm file */
          $(element).attr('data-bs-toggle', 'modal');
          $(element).attr('data-bs-target', '#myModal');
          
        }
      }
      
      // check if it is a redirected mailto - if so, apply bootstrap modal
      if (hrefVal.indexOf("/common/utilities/sendmail/sendemail.cfm") !=-1) {
        var me = element;
        $(element).attr('original-href', hrefVal);
        $(element).click(function (ev) {
          ev.preventDefault();
          if ($('#modal-contact-us').length > 0) {
            _setModalContactUsHeight = function($body) {
              $body = $('#modal-contact-us .modal-body');
              $body.css({
                height: 925
              });
            };

            var originalHREF = $(element).attr('original-href');
            var rdHref=originalHREF.replace("/sendmail/","/sendmail/");
            var contactUsModal = new bootstrap.Modal('#modal-contact-us');

            $("#modal-contact-us-iframe").attr('src',rdHref); //sets the value for the iFrame to point to

            $('#modal-contact-us').on('shown.bs.modal', function () { 
              /* set the height  when displayed */
              $body = $('#modal-contact-us .modal-body');
              $('#modal-contact-us .modal-body').css('z-index',999);
              _setModalContactUsHeight($body);
            }).on('hidden.bs.modal', function () {
              // show 'from scratch' every time iFrame opens
              contactUsModal.dispose();
            });

            contactUsModal.show();
          }
        });
      }
      
      // check if it is a redirected mailto and add the class iframe if it is
      if (hrefVal.indexOf("/customcf/audio_video/dspEmbeddedObject.cfm") !=-1){
        $(element).addClass('colorbox-iframe-av');
      }
      if (hrefVal.indexOf("http://join.nationalparks.org/news-and-updates") != -1){
        $(element).addClass('colorbox-iframe-npf');
      }
    }
  }

  function get_hostname_from_url(url) {
    url = get_url_from_handlelink(url);
    url_parse = url.match(/:\/\/(.[^/]+)/);
    if(url_parse){
      return url_parse[1];
    }else{
      return url;
    }
  }

  function get_url_from_handlelink(url) {
    // the CMS handles new windows with a "handlelink()" function
    if ( url.indexOf("javascript:HandleLink") != -1)  { 
      // pull url from cms window link
      var x = url.indexOf("CPNEWWIN:");
      var y = url.indexOf("'",x);
      url = url.substr(x,(y-x));
      var url_arr = url.split(",");
      url = url_arr[url_arr.length-1];
      url_arr = url.split("@");
      url = url_arr[url_arr.length-1];  
    }
    return url; 
  }

  function strip_old_intercepts(url) {
    var newUrl = url.replace("http://www.nps.gov/cgi-bin/intercept?","");
    newUrl = newUrl.replace("http://www.nps.gov/cgi-bin/intercept2?","");
    newUrl = newUrl.replace("http://www.nps.gov/cgi-bin/intercept3?","");
    newUrl = newUrl.replace("http://www.nps.gov/cgi-bin/intercept4?","");
    newUrl = newUrl.replace("http://home.nps.gov/applications/redirect/?sUrl=","");
    newUrl = newUrl.replace("http://www.nps.gov/applications/redirect/?sUrl=","");
    newUrl = newUrl.replace("/cgi-bin/intercept?","");
    newUrl = newUrl.replace("/cgi-bin/intercept2?","");
    newUrl = newUrl.replace("/cgi-bin/intercept3?","");
    newUrl = newUrl.replace("/cgi-bin/intercept4?","");
    newUrl = newUrl.replace("/applications/redirect/?sUrl=","");
    newUrl = newUrl.replace("/applications/redirect/?sUrl=","");
    return newUrl;
  }

  $(document).ready(function () {
    // Make sure we have the modal div ready. this is often already on our templates
    if ($("#myModal").length == 0) {
      $(document.body).append('<div id="myModal" class="modal refreshableModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"></div></div></div></div>');
    }

    // Loop over the anchor tags on the page
    $("a, area").each(function () {
      intercept(this);
    });

    /**
     * Expose the intercept function through the global NPS object
     * so that it can be run on dynamically-added elements later
     */
    if (typeof NPS.interceptExternalLinks === 'undefined') {
      NPS.interceptExternalLinks = intercept;
    }

    window.closeContactModal = function () {
      if ($('#modal-contact-us')) {
        var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-contact-us'));
        modal.hide();
      }
    };

    window.closeInterceptModal = function () {
      if ($('#myModal')) {
        var modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('myModal'));
        modal.hide();
      }
    };

    window.fixContactModalHeight = function (num) {
      if ($('#modal-contact-us .modal-body')) {
        $('#modal-contact-us .modal-body').css('height',num); 
      }
    };

    $('body').on('show.bs.modal', '#myModal', function (event) {
      var link = event.relatedTarget;
      var destURL = link.getAttribute('href');
      if (destURL) {
        /* NOTE: we set the 7 second timeout for the redirect in the modal_intercept.cfm file */
        var modalURL = "/common/commonspot/customcf/modals/modal_intercept.cfm?targetURL="+encodeURIComponent(destURL);
        $('#myModal .modal-body').load(modalURL);
      }
    });

    /* 
      whenever one of our bootstrap modals closes, this code runs
      Make sure not to put assign this event listener inside of the anchor loop above else it'll run hundreds of times
     */
    $('body').on('hidden.bs.modal', '#myModal', function () {
      /* dispose forces bootstrap modals to 'refresh' every time they load as if loading a new webpage
         Useful for instance if they open the contact modal, then the intercept modal ... or open-close-open a modal  */
      var modal = bootstrap.Modal.getOrCreateInstance(this);
      modal.dispose();

      //if they clicked to close the intercept modal, stop the timer that takes them offsite.  this timer would be created in modal_intercept.cfm
      if (window.interceptExitInterval) {
        clearInterval(window.interceptExitInterval);
      }
    });

    // open any tag with a class of "colorbox-iframe" in a colorbox iframe
    $('a.colorbox-iframe').colorbox({
      fixed: true,
      iframe: true,
      scrolling: true,
      transition: "none",
      title: "Contact Form",
      close: "close",
      width: "95%",
      height:"95%"
    });

    $('a.colorbox-iframe-npf').colorbox({
      fixed: true, 
      iframe: true, 
      transition: 'none', 
      title: 'National Park Foundation', 
      scrolling: true, 
      returnFocus: true, 
      trapFocus: true, 
      width: "650", 
      height: "640",  
      maxWidth: '95%', 
      maxHeight: '95%',  
      href: 'http://join.nationalparks.org/news-and-updates', 
      onOpen: function () {
        // close the tooltip!!!
        $('div[id^="ui-tooltip-"]:last').remove();
        // add event listener for postMessage
        // this is powerful mojo allowing a 3rd party site to send messages for us to act upon.
        // In this case, we are closing the modal, but we could just as easily resize it, chance it's source, etc.
        window.addEventListener('message', function(e) {
          if ( e.origin !== 'http://join.nationalparks.org' )
            return;
          console.log(e);
          if ( e.data == 'closeModal') {
            $.colorbox.close();
          } else {
            alert('invalid message');
          }
        }, false);
        return;
      }
    });
    /* Colorbox resize function */
    var resizeTimer;
    function resizeColorBox() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if ($('#cboxOverlay').is(':visible')) {
          $.colorbox.load(true);
        }
      }, 50);
    }
    // Resize Colorbox when resizing window or changing mobile device orientation
    // This was deliberately removed when we went responsive as it was causing 'jumping' on mobile devices
    //$(window).resize(resizeColorBox);
    //window.addEventListener("orientationchange", resizeColorBox, false);
  });
})(window, jQuery, NPS);
/*

EXTERNAL LINK INTERCEPT SCRIPT
- Interacts with links to add a modal window when an external link is clicked.
- The below runs onLoad and interacts with the A tags

How to include on page:

The following need to be included on your page for this script to work. If you include this script as well as the following, this intercept should automatically work.
- jquery-XX.js
- jquery-migrate-XX.js
- nps-bootstrap.min.js
- jquery.colorbox-min.js

Created By: Andy Reid
Original Date: October 15, 2010

Modifications;
DATE        NAME          DESC
5/12/2011   Andy Reid     Removed some weird references to usa.gov that were breaking the code
11/15/2011  Trevor Cole   Removed style modal and replaced with colorbox modal.
                          Added support to intercept mailto links with colorbox modal window if the class of the a tag is "colorbox-iframe"
5/21/2013   Andy Reid     Modified script to be less prone to error out when a user puts in a bad link. removed commented out code. backed up locally if you need it.
12/15/2014  Trevor Cole   Added a tooltip to a certain link (NPF) class to open a modal window to display a form.
3/31/2015   Joe Flowers   Switch to bootstrap modals for responsive design
06/15/2015  Paul Tsao     Added selector to handle href in image map
12/16/2015  Andy Reid     Added missing modal support and script note above
03/15/2017  Darrin Maule  Added Exception for Google Sites
09/26/2017  Trevor Cole   Added Exceptions for VideoJS Social Sharing links
10/12/2017  Darrin Maule  Resolved issue which kept the contact us modal from opening
01/28/2021  Andrew Mills  Added rsgsurvey.com to exception URL tests
01/29/2021  Andrew Mills  Added https://doimspp.sharepoint.com to exception URL tests
04/07/2021  Andrew Mills  Added https://teams.microsoft.com/l/ to exception URL tests
10/03/2022  Andrew Mills  Added https://play.google.com to exception URL tests
*/

(function (window, $, NPS) {
  var exceptions = [
    window.location.hostname,
    '.gov',
    '.mil',
    '.si.edu',
    '.fed.us',
    'rsgsurvey.com',
    'teams.microsoft.com',
    'doimspp.sharepoint.com',
    'pvs.nupointsystems.com',
    'play.google.com'
  ];

  function intercept(element) {
    // Get the HREF Destination
    var hrefVal = $(element).attr("href");
    // Get the Class (used to exclude vjs-share-*)
    var classVal = $(element).attr("class");

    // Check that we have an href
    if (
      (hrefVal != undefined && hrefVal != '' && hrefVal != '#' && hrefVal.length > 4) &&
      !(classVal != undefined && classVal.indexOf("vjs-share-") > -1)
    ){
      // Strip old intercept urls preemptively
      var hrefVal_strp = strip_old_intercepts( get_url_from_handlelink(hrefVal) );

      if (hrefVal != hrefVal_strp) {
        $(element).attr("href", hrefVal_strp);
      }
      hrefVal = hrefVal_strp;

      // String old intercept from the html of the element
      var hrefHTML = $(element).html();
      var hrefHTML_strp = strip_old_intercepts( get_url_from_handlelink(hrefHTML) );
      if (hrefHTML != hrefHTML_strp) {
        $(element).html(hrefHTML_strp);
      }

      // Get the href start value
      var startStrVal = hrefVal.substring(0, 7);
      var isProtocolAgnostic = hrefVal.substring(0, 2) == "//";

      // Check if we have a valid URL
      // CT Update: a valid url may be protocal agnostic and start with //

      if (isProtocolAgnostic || startStrVal == 'http://' || startStrVal == 'https:/' || hrefVal.indexOf("javascript:HandleLink") != -1) {
        // Get the HREF domain
        var hrefDomain = get_hostname_from_url(hrefVal);

        var domain_match = exceptions.filter(function (x) {
          // returns array of matching exceptions
          return hrefDomain.indexOf( x ) > -1;
        });           

        // Check if we are going to the NPF Modal First
        if (hrefVal.indexOf("http://join.nationalparks.org/news-and-updates") != -1) {
          // load in css for tooltips
          if (document.createStyleSheet){
            document.createStyleSheet('/ADF/thirdParty/jquery/ui/jquery-ui-1.9/css/sunny/jquery-ui.css');
            document.createStyleSheet('/common/commonspot/templates/css/npf-tooltip.css');
          } else {
            $("head").append("<link rel='stylesheet' href='/ADF/thirdParty/jquery/ui/jquery-ui-1.9/css/sunny/jquery-ui.css' type='text/css' media='screen' />");
            $("head").append("<link rel='stylesheet' href='/common/commonspot/templates/css/npf-tooltip.css' type='text/css' media='screen' />");
          }
          // Remove onClick bindings
          $(element).unbind('click');
          $(element).attr("onClick", "");

          $(element).attr("title", "This link will direct you to a non-government website that may have different privacy policies from those of the National Park Service.");

          if (typeof $.ui != 'undefined') {
            // $.ui loaded, let's do something!
            $('.npf-tooltip').tooltip({
              track: true,
              position: {
                my: "center bottom-20",
                at: "center top",
                using: function( position, feedback ) {
                  $( this ).css( position );
                  $( "<div>" )
                    .addClass( "arrow" )
                    .addClass( feedback.vertical )
                    .addClass( feedback.horizontal )
                    .appendTo( this );
                }
              }
            });
          } else {
            // We need to load $.ui first
            var url = '/ADF/thirdParty/jquery/ui/jquery-ui-1.9/js/jquery-ui-1.9.js';
            $.getScript( url ).done(function ( script, textStatus ) {
              $('.npf-tooltip').tooltip({
                track: true,
                position: {
                  my: "center bottom-20",
                  at: "center top",
                  using: function( position, feedback ) {
                    $( this ).css( position );
                    $( "<div>" )
                      .addClass( "arrow" )
                      .addClass( feedback.vertical )
                      .addClass( feedback.horizontal )
                      .appendTo( this );
                  }
                }
              });
            });
          }
        }
        
        // Check if we are leaving the domain
        else if ( domain_match.length == 0 ) {
          /* NOTE: we set the 7 second timeout for the redirect in the modal_intercept.cfm file */
          var destURL = $(element).attr("href");
          destURL="/common/commonspot/customcf/modals/modal_intercept.cfm?targetURL="+encodeURIComponent(destURL); 

          // open exit message
          $(element).attr('data-toggle','modal');
          $(element).attr('data-target','#myModal');
          $(element).attr('data-remote',destURL);
        }
      }
      
      // check if it is a redirected mailto - if so, apply bootstrap modal
      if (hrefVal.indexOf("/common/utilities/sendmail/sendemail.cfm") !=-1) {
        var me = element;
        $(element).attr('original-href', hrefVal);
        $(element).click(function (ev) {
          ev.preventDefault();
          if ($('#modal-contact-us').length > 0) {
            _setModalContactUsHeight = function($body) {
              $body = $('#modal-contact-us .modal-body');
              $body.css({
                height: 925
              });
            };

            var originalHREF = $(element).attr('original-href');
            var rdHref=originalHREF.replace("/sendmail/","/sendmail/");
            $("#modal-contact-us-iframe").attr('src',rdHref); //sets the value for the iFrame to point to
            $('#modal-contact-us').on('shown.bs.modal', function () { 
              /* set the height  when displayed */
              $body = $('#modal-contact-us .modal-body');
              $('#modal-contact-us .modal-body').css('z-index',999);
              _setModalContactUsHeight($body);
            }).on('hidden.bs.modal', function () {
                // show 'from scratch' every time iFrame opens
                $(element).removeData('bs.modal');
            }).modal({
              // open our modal
              show: true
            });
          }
        });
      }
      
      // check if it is a redirected mailto and add the class iframe if it is
      if (hrefVal.indexOf("/customcf/audio_video/dspEmbeddedObject.cfm") !=-1){
        $(element).addClass('colorbox-iframe-av');
      }
      if (hrefVal.indexOf("http://join.nationalparks.org/news-and-updates") != -1){
        $(element).addClass('colorbox-iframe-npf');
      }
    }
  }

  function get_hostname_from_url(url) {
    url = get_url_from_handlelink(url);
    url_parse = url.match(/:\/\/(.[^/]+)/);
    if(url_parse){
      return url_parse[1];
    }else{
      return url;
    }
  }

  function get_url_from_handlelink(url) {
    // the CMS handles new windows with a "handlelink()" function
    if ( url.indexOf("javascript:HandleLink") != -1)  { 
      // pull url from cms window link
      var x = url.indexOf("CPNEWWIN:");
      var y = url.indexOf("'",x);
      url = url.substr(x,(y-x));
      var url_arr = url.split(",");
      url = url_arr[url_arr.length-1];
      url_arr = url.split("@");
      url = url_arr[url_arr.length-1];  
    }
    return url; 
  }

  function strip_old_intercepts(url) {
    var newUrl = url.replace("http://www.nps.gov/cgi-bin/intercept?","");
    newUrl = newUrl.replace("http://www.nps.gov/cgi-bin/intercept2?","");
    newUrl = newUrl.replace("http://www.nps.gov/cgi-bin/intercept3?","");
    newUrl = newUrl.replace("http://www.nps.gov/cgi-bin/intercept4?","");
    newUrl = newUrl.replace("http://home.nps.gov/applications/redirect/?sUrl=","");
    newUrl = newUrl.replace("http://www.nps.gov/applications/redirect/?sUrl=","");
    newUrl = newUrl.replace("/cgi-bin/intercept?","");
    newUrl = newUrl.replace("/cgi-bin/intercept2?","");
    newUrl = newUrl.replace("/cgi-bin/intercept3?","");
    newUrl = newUrl.replace("/cgi-bin/intercept4?","");
    newUrl = newUrl.replace("/applications/redirect/?sUrl=","");
    newUrl = newUrl.replace("/applications/redirect/?sUrl=","");
    return newUrl;
  }

  $(document).ready(function () {
    // Make sure we have the modal div ready. this is often already on our templates
    if ($("#myModal").length == 0) {
      $(document.body).append('<div id="myModal" class="modal refreshableModal"><div class="modal-dialog"><div class="modal-content"></div></div></div>');
    }

    // Loop over the anchor tags on the page
    $("a, area").each(function () {
      intercept(this);
    });

    /**
     * Expose the intercept function through the global NPS object
     * so that it can be run on dynamically-added elements later
     */
    if (typeof NPS.interceptExternalLinks === 'undefined') {
      NPS.interceptExternalLinks = intercept;
    }

    window.closeContactModal = function () {
      if ($('#modal-contact-us')) {
        $('#modal-contact-us').modal('hide');
      }
    };

    window.closeInterceptModal = function () {
      if ($('#myModal')) {
        $('#myModal').modal('hide');
      }
    };

    window.fixContactModalHeight = function (num) {
      if ($('#modal-contact-us .modal-body')) {
        $('#modal-contact-us .modal-body').css('height',num); 
      }
    };

    /* 
      whenever one of our bootstrap modals closes, this code runs
      Make sure not to put assign this event listener inside of the anchor loop above else it'll run hundreds of times
     */
    $('body').on('hidden.bs.modal', '#myModal', function () {
      /* removeData forces bootstrap modals to 'refresh' every time they load as if loading a new webpage
         Useful for instance if they open the contact modal, then the intercept modal ... or open-close-open a modal  */
      $(this).removeData('bs.modal');

      //if they clicked to close the intercept modal, stop the timer that takes them offsite.  this timer would be created in modal_intercept.cfm
      if (window.interceptExitInterval) {
        clearInterval(window.interceptExitInterval);
      }
    });

    // open any tag with a class of "colorbox-iframe" in a colorbox iframe
    $('a.colorbox-iframe').colorbox({
      fixed: true,
      iframe: true,
      scrolling: true,
      transition: "none",
      title: "Contact Form",
      close: "close",
      width: "95%",
      height:"95%"
    });

    $('a.colorbox-iframe-npf').colorbox({
      fixed: true, 
      iframe: true, 
      transition: 'none', 
      title: 'National Park Foundation', 
      scrolling: true, 
      returnFocus: true, 
      trapFocus: true, 
      width: "650", 
      height: "640",  
      maxWidth: '95%', 
      maxHeight: '95%',  
      href: 'http://join.nationalparks.org/news-and-updates', 
      onOpen: function () {
        // close the tooltip!!!
        $('div[id^="ui-tooltip-"]:last').remove();
        // add event listener for postMessage
        // this is powerful mojo allowing a 3rd party site to send messages for us to act upon.
        // In this case, we are closing the modal, but we could just as easily resize it, chance it's source, etc.
        window.addEventListener('message', function(e) {
          if ( e.origin !== 'http://join.nationalparks.org' )
            return;
          console.log(e);
          if ( e.data == 'closeModal') {
            $.colorbox.close();
          } else {
            alert('invalid message');
          }
        }, false);
        return;
      }
    });
    /* Colorbox resize function */
    var resizeTimer;
    function resizeColorBox() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if ($('#cboxOverlay').is(':visible')) {
          $.colorbox.load(true);
        }
      }, 50);
    }
    // Resize Colorbox when resizing window or changing mobile device orientation
    // This was deliberately removed when we went responsive as it was causing 'jumping' on mobile devices
    //$(window).resize(resizeColorBox);
    //window.addEventListener("orientationchange", resizeColorBox, false);
  });
})(window, jQuery, NPS);
