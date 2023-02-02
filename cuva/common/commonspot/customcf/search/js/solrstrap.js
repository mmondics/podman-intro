/*

  SOLRSTRAP v0.3
  https://github.com/fergiemcdowall/solrstrap

  This code has been heavily modified to suit our needs. These changes and additions have
  been noted with comments starting noting "NPS".

  It behooves us to keep SOLRSTRAP version up to date, however we need to fold our changes
  into the new version.

*/

//var HITSPERPAGE = 20; //NPS moved to calling page

/*var HL = true;
var HL_FL = 'text, title';
var HL_SIMPLE_PRE = '<em>';
var HL_SIMPLE_POST = '</em>';
var HL_SNIPPETS = 3;*/

var HL = false; //NPS edited
var HL_FL = ''; //NPS edited (note: passing <em> and other html via URL causes XSS alarms to go off)

var AUTOSEARCH_DELAY = 0;

//when the page is loaded- do this
  jQuery(document).ready(function() {
    jQuery('#solrstrap-hits').append('<div offset="0"></div>');
    jQuery('#solrstrap-searchbox').attr('value', getURLParam('q'));

    jQuery('#solrstrap-searchbox').focus();
    //when the searchbox is typed- do this
    //jQuery('#solrstrap-searchbox').keyup(keyuphandler);// NPS TURNED OFF
    //jQuery('form.navbar-search').submit(handle_submit);// NPS REPLACED
    jQuery('div.search-form form').submit(function(e) {
        e.preventDefault(); 
        jQuery('#search-results').hide();
        jQuery('#noResultsMsg').hide();        
        jQuery('#searchingMsg').show();
        handle_submit();      
        return false;
      }
    );// NPS added

    jQuery(window).bind('hashchange', hashchange);

    //jQuery('#solrstrap-searchbox').bind("change", querychange);//NPS TURNED OFF
    hashchange();

    gasTerm = '';
    if(getURLParam('q')) gasTerm += getURLParam('q');
    if(getURLParamArray('fq').length > 0) gasTerm += ' ' + getURLParam('fq');
    gasNotify(gasTerm);

  });

  //jquery plugin allows resultsets to be painted onto any div.
  (function( jQuery ){
    jQuery.fn.loadSolrResults = function(q, fq, offset) {
      jQuery(this).getSolrResults(q, fq, offset);
    };
  })( jQuery );


  //jquery plugin allows autoloading of next results when scrolling.
  (function( jQuery ){
    jQuery.fn.loadSolrResultsWhenVisible = function(q, fq, offset) {
      elem = this;

      jQuery(window).scroll(function(event){
        if (isScrolledIntoView(elem) && !jQuery(elem).attr('loaded')) {

          q = getURLParam('q'); //NPS:AR Added. Seems to be an issue with var scope
          fq = getURLParamArray('fq'); //NPS:AR Added. Seems to be an issue with var scope

          //dont instantsearch and autoload at the same time
          /*if (jQuery('#solrstrap-searchbox').val() != getURLParam('q')) {*/
          if (jQuery('#solrstrap-searchbox').val() != getURLParam('q') && !(jQuery('#solrstrap-searchbox').val() == '' && typeof(getURLParam('q')) == 'undefined' )) { //AR NPS added additional condition
             handle_submit();
          }
          jQuery(elem).attr('loaded', true);

          jQuery(elem).getSolrResults(q, fq, offset);

          jQuery(window).unbind('scroll');
        }
      });
    };
  })( jQuery );

  //jquery plugin for takling to solr
  (function( jQuery ){
    var TEMPLATES = {
    'hitTemplate':Handlebars.compile(jQuery("#hit-template").html()),
    'summaryTemplate':Handlebars.compile(jQuery("#result-summary-template").html()),
    'navTemplate':Handlebars.compile(jQuery("#nav-template").html()),
    'chosenNavTemplate':Handlebars.compile(jQuery("#chosen-nav-template").html())
    };
    Handlebars.registerHelper('facet_displayname', function(facetname) {
      return((FACETS_TITLES && FACETS_TITLES.hasOwnProperty(facetname)) ?
         FACETS_TITLES[facetname] : facetname);
      });
    Handlebars.registerHelper('facet_unescapetext', function(val,facetname) {

        //TODO THIS IS A MESS!!!
        var unval = val.replace(' TO ', ',');

        if(!jQuery.isEmptyObject(FACETS_INTERVALS) && facetname in FACETS_INTERVALS && unval in FACETS_INTERVALS[facetname]['intervals']) {
          return jQuery("<div/>").html(FACETS_INTERVALS[facetname]['intervals'][unval]).text();
        }else{
          return jQuery("<div/>").html(val).text();
        }

      }); // NPS ADDED    
    Handlebars.registerHelper('facet_numberformat', function(val) {
      return(val.toLocaleString());
      }); // NPS ADDED 

    jQuery.fn.getSolrResults = function(q, fq, offset) {

      var rs = this;
      jQuery(rs).parent().css({ opacity: 0.5 });
      jQuery.ajax({url:SERVERROOT,
      dataType: 'jsonp',
      data: buildSearchParams(q, fq, offset), 
      traditional: true,
      jsonp: 'json.wrf',
      success: 
    function(result){

      //only redraw hits if there are new hits available
      if (result.response.docs.length > 0) {
        if (offset == 0) {
          rs.empty();
          //strapline that tells you how many hits you got
          rs.append(TEMPLATES.summaryTemplate({totalresults: result.response.numFound.toLocaleString(), query: q}));
          rs.siblings().remove();
        }
        //draw the individual hits
        for (var i = 0; i < result.response.docs.length; i++) {

          result.response.docs[i] = transformResults(result.response.docs[i]); // NPS added

          var title = normalize_ws(get_maybe_highlit(result, i, HITTITLE));
          var text = normalize_ws(get_maybe_highlit(result, i, HITBODY));
          var teaser = normalize_ws(get_maybe_highlit(result, i, HITTEASER));
          var link = result.response.docs[i][HITLINK];
            
          var hit_data = {title: title, text: text};

          if (teaser) {
            hit_data['teaser'] = teaser;
          }
          if (link) {
            hit_data['link'] = link;
          }

          var meta = "";
          for (var m in HITMETA) {
            var meta_field = HITMETA[m];
            var meta_field_data = normalize_ws(get_maybe_highlit(result, i, meta_field));
            if(meta_field_data){
              if(m>0) meta += " | ";
              meta += "<span>"+meta_field.replace(/_/g, ' ')+":</span> "+meta_field_data;
            }
          }
          hit_data['meta'] = meta;

          var thumb = normalize_ws(get_maybe_highlit(result, i, HITTHUMB));
          if (thumb) {
            hit_data['thumb'] = thumb;
          }

          /* START NPS CHANGES */

          jQuery('#search-results').show();   
          jQuery('#noResultsMsg').hide(); 

          if( 'Sites_Item' in result.response.docs[i] ){
            var sites = result.response.docs[i]['Sites_Item'];
            if(sites && sites.length == 1){ // only show if there 1 site
              hit_data['site'] = normalize_ws(sites[0]); 
            }          
          }else if( 'Sites' in result.response.docs[i] ){
            var sites = normalize_ws(get_maybe_highlit(result, i, "Sites"));
            if(sites.split(",").length == 1){ // only show if there 1 site
              hit_data['site'] = sites; 
            }            
          }//the else if can go away after 30 days to accomidate CDN holds. -aR 8/24/22

          if(hit_data['meta'].length){
            hit_data['meta'] = "<ul><li>" + hit_data['meta'].replace(/\|/g, '</li><li>') + "</li></ul>"; 
          }

          if(hit_data['thumb'] && hit_data['thumb'].toLowerCase().indexOf(".jpg") > 0){
            hit_data['thumb'] += "?maxwidth=200&quality=90"; //imageresizer
          }

           /* END NPS CHANGES */

          rs.append(TEMPLATES.hitTemplate(hit_data));
        }

        jQuery(rs).parent().css({ opacity: 1 });

        //if more results to come- set up the autoload div
        if ((+HITSPERPAGE+offset) < +result.response.numFound) {
          var nextDiv = document.createElement('div');
          jQuery(nextDiv).attr('offset', +HITSPERPAGE+offset);
          rs.parent().append(nextDiv);
          jQuery(nextDiv).loadSolrResultsWhenVisible(q, fq, +HITSPERPAGE+offset);
        }
        //facets
        jQuery('#solrstrap-facets').empty();

        //chosen facets
        if (fq.length > 0) {
          var fqobjs = [];
          for (var i = 0; i < fq.length; i++) {
            var m = fq[i].match(/^([^:]+):(.*)/);
            if (m && m[1] != "Date_Released") { //NPS added
            fqobjs.push({'name': m[1], 'value': m[2]});
            }
          }
          if (fqobjs.length > 0) jQuery('#solrstrap-facets').append(TEMPLATES.chosenNavTemplate(fqobjs)); // NPS ADDED CONDITIONAL
        }

        //available facets
        for (var k in result.facet_counts.facet_fields) {
          if (result.facet_counts.facet_fields[k].length > 0) {
            jQuery('#solrstrap-facets')
              .append(TEMPLATES.navTemplate({
                 title: k,
                 navs: makeNavsSensible(result.facet_counts.facet_fields[k])}));
          }
        }

        /* NPS START */
        for (var k in result.facet_counts.facet_intervals) {
          if (!jQuery.isEmptyObject(result.facet_counts.facet_intervals[k])) {
            jQuery('#solrstrap-facets')
              .append(TEMPLATES.navTemplate({
                 title: k,
                 navs: cleanseNavsInterval(result.facet_counts.facet_intervals[k])}));          
          }
        }
        /* NPS END */

        //jQuery('div.facet > a').click(add_nav);// NPS removed
        //jQuery('div.chosen-facet > a').click(del_nav);// NPS removed 
        jQuery('div.facet a').click(add_nav); // NPS removed direct descendant selector because i use UL
        jQuery('div.chosen-facet a').click(del_nav); // NPS removed direct descendant selector because i use UL

        // START NPS
        jQuery("div.facet", "#solrstrap-facets").each(function() {
          jQuery(this).limitFacetsInit(); 
        });

        jQuery('#sort-by-select').change(function(e) {
          add_sort(e);
        });

        sortVal = getURLParam('sort');
        if(sortVal) jQuery("#sort-by-select").val(sortVal);

        jQuery('#search-results').show();    

        transformResultsAfter();         

        // END NPS

      } else { /* ADDED NPS */

        jQuery('#noResultsMsg').show(); 
        
        //jQuery("#searchApp-search .container").html('<p class="noResultsMsg">No results match your search query. Please try again.</p>');
        //jQuery(rs).parent().css({ opacity: 1 });

      }

      jQuery('#searchingMsg').hide(); //AR:NPSAD
  
    }});
    };
  })( jQuery );

  //translates the ropey solr facet format to a more sensible map structure
  function makeNavsSensible (navs) {
    var newNav = {};
    for (var i = 0; i < navs.length; i+=2) {
      newNav[navs[i]] = navs[i + 1];      
    }
    return newNav;
  }

  /* NPS START */
  function cleanseNavsInterval (navs) {
    var newNav = {};
    for (var k in navs) {
      newNav[k.replace(',', ' TO ')] = navs[k];
    }  
    return newNav;
  }
  /* NPS END */

  //utility function for grabbling URLs
  function getURLParam(name) {
    var ret = jQuery.bbq.getState(name);
    return ret;
  }

  //function to generate an array of URL parameters, where there are likely to be several params with the same key
  function getURLParamArray(name) {
    var ret =  jQuery.bbq.getState(name) || [];
    if (typeof(ret) == 'string')
      ret = [ret];
    return ret;
  }

  //utility function that checks to see if an element is onscreen
  function isScrolledIntoView(elem) {
    var docViewTop = jQuery(window).scrollTop();
    var docViewBottom = docViewTop + jQuery(window).height();
    var elemTop = jQuery(elem).offset().top;
    var elemBottom = elemTop + jQuery(elem).height();
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }

  function buildSearchParams(q, fq, offset) {
 
    if(typeof q !== 'undefined' && q.length > 0 && q != "*") q = cleanseUserEntry(q); // AR NPS ADDED. Cleans the baddies like XSS out of the input

    if(typeof q == 'undefined' || q.length < 1) q = "*"; //if no text, just get everything (NPS aR)

    var ret = { 
    'rows': HITSPERPAGE,
    'wt': 'json',
    'q': q,
    'sort': getURLParam('sort'), // NPS - Added
    'start': offset
    }
    if (FACETS.length > 0) {
      ret['facet'] = 'true';
      ret['facet.mincount'] = '1';
      ret['facet.limit'] = '-1'; // NPS - Changed from 20, this is handled with the limiter script
      ret['facet.sort'] = 'count', // NPS - Added
      ret['facet.method'] = 'enum',// NPS - Added
      ret['facet.field'] = FACETS;
    }

    /* START NPS */
    if (!jQuery.isEmptyObject(FACETS_INTERVALS) > 0) {
      for (var key in FACETS_INTERVALS){
        ret['facet.interval'] = key;
        ret['f.'+key+'.facet.interval.set'] = [];
        for (var key2 in FACETS_INTERVALS[key]["intervals"]){
          ret['f.'+key+'.facet.interval.set'].push(key2);
        }
      }
    }
    /* END NPS */

    if (fq.length > 0) {
      /* NPS START */
     /* for (var i = 0; i < fq.length; i++) {
        fq[i] = fq[i].replace('\"[','[').replace(']\"',']')
      }*/
      /* NPS END */
      ret['fq'] = fq;

    }
    if (HL_FL) {
      ret['hl'] = 'true';
      ret['hl.fl'] = HL_FL;
      ret['hl.simple.pre'] = HL_SIMPLE_PRE;
      ret['hl.simple.post'] = HL_SIMPLE_POST;
      ret['hl.snippets'] = HL_SNIPPETS;
    }

    return ret;
  }

  //optionally convert a string array to a string, by concatenation
  function array_as_string(array_or_string)
  {
    var ret = '';
    if (typeof(array_or_string) == 'string') {
      ret = array_or_string;
    }
    else if (typeof(array_or_string) == 'object' 
       && array_or_string.hasOwnProperty('length') 
       && array_or_string.length > 0) {
      ret = array_or_string.join(" ... ");
    }
    return ret;
  }

  //normalize a string with respect to whitespace:
  //1) Remove all leadsing and trailing whitespace
  //2) Replace all runs of tab, space and &nbsp; with a single space
  function normalize_ws(string) 
  {
    return string.replace(/^\s+/, '')
      .replace(/\s+jQuery/, '')
      .replace(/(?: |\t|&nbsp;|&#xa0;|\xa0)+/g, ' '); 
  }


  //get field from result for document i, optionally replacing with
  //highlit version
  function get_maybe_highlit(result, i, field) 
  {
    var res = result.response.docs[i][field];
    if (HL) {
      var id = result.response.docs[i][HITID];
      var hl_map = result.highlighting[id];
      /*if (hl_map.hasOwnProperty(field)) {
  res = hl_map[field];
      }*/
    }

    return array_as_string(res);
  }

  //handler for navigator selection
  function add_nav(event) 
  {

    var whence = event.target;
    //var navname = jQuery(whence).closest("div.facet").children("span.nav-title").data("facetname");// NPS CHANGED
    var navname = jQuery(whence).closest("div.facet").children("div.nav-title").data("facetname");// NPS CHANGED    
    //var navvalue = jQuery(whence).text();// NPS CHANGED 
    var navvalue = jQuery(whence).data("facetkey");// NPS CHANGED 

    //var newnav = navname + ':"' + navvalue.replace(/([\\\"])/g, "\\jQuery1") + '"';// NPS REPLACED BELOW
    /* NPS START */
    if(navvalue.indexOf("[") == 0){
      var newnav = navname + ':' + navvalue.replace(/([\\\"])/g, "\\jQuery1"); // if something like [0 TO 10], don't wrap in quote
    }else{
      var newnav = navname + ':"' + navvalue.replace(/([\\\"])/g, "\\jQuery1") + '"';
    }
    /* NPS END */


    var fq = getURLParamArray("fq");

    // check if it already exists...
    var existing = jQuery.grep(fq, function(elt, idx) {
       return elt === newnav;
    });

    if (existing.length === 0) {
      fq.push(newnav);
      jQuery.bbq.pushState({'fq': fq});
    }

    scrollToTopOfSearch(); // NPS ADDED
    gasNotify(newnav); //NPS ADDED

    return false;
  }

  //handler for navigator de-selection
  function del_nav(event) 
  {
    var whence = event.target;
    if (jQuery(whence).hasClass("close")) {
      whence = jQuery(whence).next();
    }
    // var filter = jQuery(whence).text();
    var filter = jQuery(whence).data("filter");    
    var fq = getURLParamArray("fq");

    fq = jQuery.grep(fq, function(elt, idx) {
      return elt === filter;
      }, true);

      jQuery.bbq.pushState({"fq": fq});

      scrollToTopOfSearch(); // NPS ADDED

      return false;

  }

  function hashchange(event)
  {
      jQuery('#solrstrap-hits div[offset="0"]').loadSolrResults(getURLParam('q'), getURLParamArray('fq'), 0);
  }

  function handle_submit(event)
  {
    var q = jQuery.trim(jQuery('#solrstrap-searchbox').val());

    if (q !== '') { //AR:NPS if they entered text, select the "relevance" sort
      var sort = getURLParamArray("sort");
      var sort_select = "score desc"; 
      sort.push(sort_select);
      jQuery.bbq.pushState({'sort': sort_select})
    }

    /*if (q !== '') { //AR NPS: Removed this so users can enter no data */
      jQuery.bbq.removeState("fq");
      jQuery.bbq.removeState("q");
      jQuery.bbq.pushState({'q': q});

      gasNotify(q);// AR NPS ADDED
    /*}*/
    return false;
  }

  var querychange = handle_submit;

  var timeoutid;
  function keyuphandler()
  {
    if (timeoutid) {
      window.clearTimeout(timeoutid);
    }
    timeoutid = window.setTimeout(maybe_autosearch, AUTOSEARCH_DELAY);
  }

  function maybe_autosearch()
  {
    if (timeoutid) {
      window.clearTimeout(timeoutid);
    }
    var q = jQuery.trim(jQuery('#solrstrap-searchbox').val());
    if ((q.length > 3 || q.length == 0) && q !== getURLParam("q")) { // NPS AR: Added option for val to be ""
      jQuery('#solrstrap-hits div[offset="0"]').loadSolrResults(q, [], 0);
    }
    else {
      // jQuery('#solrstrap-hits').css({ opacity: 0.5 });
    }
  }


  /* NPS START */

  //handler for navigator selection
  function add_sort(event) 
  {
    var sort = getURLParamArray("sort");
    var sort_select = jQuery('#sort-by-select').val();
    sort.push(sort_select);
    jQuery.bbq.pushState({'sort': sort_select});
  }

  // limitFacets limits the number of facets shown and adds search functionality to the full list of facets
  jQuery.fn.limitFacetsInit = function(options) {

    var settings = jQuery.extend({
      triggerSearchCount: 10
    }, options);

    var e = jQuery(this);

    //activate limitFacets
    jQuery(e).limitFacets();

    if(jQuery("li", e).length >= settings.triggerSearchCount){

      jQuery("ul", e).before(
        jQuery('<div/>', {
          "class": "facetSearchArea"
        }).hide()
      );

      jQuery("ul", e).before(
        jQuery('<div/>', {
          "class": "facetSearchOpenIcon",
          "click": function() {
            jQuery(".facetSearchArea", e).show(); 
            jQuery(".facetSearchOpenIcon", e).hide();  
            jQuery(".facetSearchArea input", e).focus();         
          }
        })
      );

      jQuery('.facetSearchArea', e).append(
        jQuery('<input/>', {
          "type": "text",
          "placeholder": "Start Typing...",
          "keyup": function() {

            var keyVal = jQuery(this).val().trim();

            if(keyVal.length){
              jQuery("li", e).each(function() {
                 if (jQuery(this).text().toLowerCase().indexOf(keyVal.toLowerCase()) != -1){
                    jQuery(this).show();
                  }else{
                    jQuery(this).hide();
                }
              });
            }else{
              jQuery(e).limitFacets(); //reset
            }      
          }
        })
      );

      jQuery('.facetSearchArea', e).append(
        jQuery('<div/>', {
          "class": "facetSearchCloseIcon",
          "text": "X",
          "click": function() {
            jQuery(".facetSearchArea", e).hide(); 

            jQuery(".facetSearchArea input", e).val(''); 
            jQuery(".facetSearchOpenIcon", e).show();

            jQuery(e).limitFacets(); //reset
          }
        })
      );
   
    }

  };

  jQuery.fn.limitFacets = function(options) {

    var settings = jQuery.extend({
      numLimit: 10,
      numExpand: 20
    }, options);

    var e = jQuery(this);

    jQuery(".limitMore", e).remove();

    var itemNum = 0;
    jQuery("li", e).each(function() {

      itemNum++;

      if(itemNum >= settings.numLimit) {
        jQuery(this).hide();      
      }else{
        jQuery(this).show();
      }

    });

    if(itemNum > settings.numLimit){
      jQuery("ul", e).append('<li class="limitMore"><a>Show More ...</a></li>');

      jQuery("li.limitMore a", e).click(function() {
        jQuery(e).limitFacets({numLimit:(settings.numLimit+settings.numExpand)});
      });

    }

  };

  function cleanseUserEntry(q){
    var container = document.createElement('div');
    var text = document.createTextNode(q);
    container.appendChild(text);
    return container.innerHTML;
  }

  function scrollToTopOfSearch(){
    jQuery('html, body').animate({
        scrollTop: jQuery('#solrstrap-searchbox').offset().top - 20
    }, 600);
  }

  function gasNotify(term){
    // google analytics
    term = jQuery.trim(term);
    if(term.length == 0) term = "*";
    gas('send', 'event', 'SOLR Searches', SEARCHTITLE, term, 0, false); // notify of event
    gas('send', 'pageview', window.location.href.replace(window.location.origin,''), ''); // notify of pageview (url without host info)
  }

  /* NPS END  */