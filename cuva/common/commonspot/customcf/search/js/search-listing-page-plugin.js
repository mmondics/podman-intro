
(function($){
    
    var SearchListing = function(element, options)
    {
    	
        var obj = this;
        var element = $(element);
        this.element = element; //make available to external fnctions
        
        var defaults = {
            searchURL: '',
            searchURLReady: '',
            collectionName: '',
            getMetaFields: '',
            perPage: '',
            startNum: '',
            keywords: '',
            filterQuery: '',
            usesDynamicNavigation: '',
            sort: '',
			extrasForm: '',
			extrasForm_keywordField: '',
			dataTransformJS: '',
			showSearchResultsLIOverride: '',
			runFunctionAfter: ''
        };
        		
        var config = $.extend(defaults, options || {});

	    this.runFunctionAfter = function() { }

	    this.makeSearchCall = function()
	    {

			if(config.keywords == ""){
				config.keywords = "*";
			} //solr requires * in Q field

			this.updateParsedURL();
			
			//convert url params to object to pass to the post
			var searchURLArr = config.searchURLReady.split("?");
			var searchURLQry = searchURLArr[1];	

			var searchURL = searchURLArr[0];	

			var searchObj = searchURLQry?JSON.parse('{"' + searchURLQry.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}',function(key, value) { return key===""?value:decodeURIComponent(encodeURIComponent(value)) }):{}

			//SOLR ONLY. DE-ESCAPE THINGS, SET RSP TYPE
			searchObj.fq = unescape(searchObj.fq);
			searchObj.wt = 'json';

			jQuery.ajax({
				type: "POST",				
				url: searchURL, 
	    		traditional: true,
				data: searchObj,
				dataType: "jsonp",
		   		jsonp: 'json.wrf',			
				success: function( data ) {
					obj.updateSearchResultsResponse(data);
				},
				error: function(xhr, error){
					console.debug(xhr); console.debug(error);
				}
			 });	

	    };
			
	    this.updateParsedURL = function()
	    {

			var fields = this.getSearchCallFields();

			jQuery.each(fields, function(k, v) {
				if(typeof v != "undefined"){
					config.searchURLReady = obj.updateURLParameter(config.searchURLReady,k,v);
				}
			});	
				
	    };	

	    this.getSearchCallFields = function()
	    {	

			var searchCallFields = new Object();
		
			searchCallFields.fq = config.filterQuery;
			searchCallFields.rows = config.perPage;
			searchCallFields.q = config.keywords;
			searchCallFields.start = config.startNum;
			searchCallFields.fl = config.getMetaFields;
			searchCallFields.sort = config.sort;

			return searchCallFields;

		}

	    this.updateSearchResultsCall = function(startrow)
	    {

			if (typeof startrow != "undefined") {
		
				jQuery(".result-count-select",element).hide();
				jQuery(".results .loadingResultsMsg",element).show();

				jQuery(".results ul",element).empty();	
				jQuery(".results .resultsPagination",element).empty();
				jQuery(".results .result-count",element).empty();
				
				config.startNum = startrow-1; //solr starts at 0

				this.makeSearchCall();
				
			}

		}
		
		this.updateSearchResultsResponse = function(rspContent)
		{

			var docResults = rspContent.response.docs;
			var startNum = parseInt(rspContent.response.start)+1;
			var numResults = parseInt(rspContent.response.numFound);						
			var endNum = parseInt(docResults.length) + startNum - 1;


			if(isNaN(numResults) || numResults == 0){	
				jQuery(".results ul",element).prepend("<p class='noResultsMsg'>There are no items that match this criteria.</p>");
				jQuery(".results .loadingResultsMsg",element).hide();			
			}else{
				
				jQuery.each(docResults, function (index, value) {
					obj.showSearchResultsLI(value);
				});

				obj.hideLongResults();

				jQuery(".results .info-micro-filter",element).show();
				
				jQuery(".results .result-count",element).html('<span>Showing results '+startNum+"-"+endNum+" of "+numResults+"</span>");
				
				if(parseInt(numResults) > 10){
					jQuery(".result-count-select",element).show();
				}
				
				jQuery(".resultsPaginationArea",element).html(obj.makePagination(startNum,config.perPage,numResults));
				
				jQuery(".results .loadingResultsMsg",element).hide();	
			
			}

			obj.runFunctionAfter();

		}	

		this.updateURLParameter = function(url, param, paramVal)
		{		
				
			var TheAnchor = null;
			var newAdditionalURL = "";
			var tempArray = url.split("?");
			var baseURL = tempArray[0];
			var additionalURL = tempArray[1];
			var temp = "";

			if (additionalURL) 
			{
				var tmpAnchor = additionalURL.split("#");
				var TheParams = tmpAnchor[0];
					TheAnchor = tmpAnchor[1];
				if(TheAnchor)
					additionalURL = TheParams;

				tempArray = additionalURL.split("&");

				for (i=0; i<tempArray.length; i++)
				{
					if(tempArray[i].split('=')[0] != param)
					{
						newAdditionalURL += temp + tempArray[i];
						temp = "&";
					}
				}        
			}
			else
			{
				var tmpAnchor = baseURL.split("#");
				var TheParams = tmpAnchor[0];
					TheAnchor  = tmpAnchor[1];

				if(TheParams)
					baseURL = TheParams;
			}

			if(TheAnchor)
				paramVal += "#" + TheAnchor;

			var rows_txt = temp + "" + param + "=" + paramVal;
			return baseURL + "?" + newAdditionalURL + rows_txt;
		}
			
		this.makePagination = function(startRow,maxRows,numRows)
		{			

			var numGroupsToShowInMiddle = 6;//should be even number			
			var numGroupings = Math.ceil(numRows / maxRows);	
			var thisGroupNum = Math.ceil(startRow / maxRows);
			
			if(numGroupsToShowInMiddle > 0){

				if(thisGroupNum > Math.floor(numGroupings/2)){
					//determine from the back
					var endGroupInMiddle = thisGroupNum + Math.floor(numGroupsToShowInMiddle/2);
					if(endGroupInMiddle >= (numGroupings-1)) endGroupInMiddle = numGroupings - 1;
					var startGroupInMiddle = endGroupInMiddle - numGroupsToShowInMiddle;
					if(startGroupInMiddle < 2) startGroupInMiddle = 2;
				}else{
					//determine from the front
					var startGroupInMiddle = thisGroupNum - Math.floor(numGroupsToShowInMiddle/2);
					if(startGroupInMiddle < 2) startGroupInMiddle = 2;
					var endGroupInMiddle = startGroupInMiddle + numGroupsToShowInMiddle;
					if(endGroupInMiddle >= (numGroupings-1)) endGroupInMiddle = numGroupings - 1;
				}
				
			}

			var paginationContent = "<div class=\"ResultsFooter\"><div class=\"container\"><div class=\"row\"><nav role=\"widget\" aria-label=\"Pagination\"><ul class=\"Pagination\">";
			
			if(numGroupings > 1){

				//PREV
				if(thisGroupNum > 1){
					paginationContent += "<li class=\"prev\"><a href=\"#\" startrow='"+(((thisGroupNum-2)*maxRows)+1)+"' data-track='{\"type\":\"event\",\"category\":\"PYV Component\",\"action\":\"Pagination\",\"label\":\"#url\"}' class=\"carrot-start\">Previous <span class=\"visuallyhidden\">page</span></a></li>";				
				}else{
					paginationContent += "<li class=\"prev active\"><a href=\"#\" data-track='{\"type\":\"event\",\"category\":\"PYV Component\",\"action\":\"Pagination\",\"label\":\"#url\"}' aria-disabled=\"true\" class=\"carrot-start\">Previous <span class=\"visuallyhidden\">page</span></a></li>";					
				}
				
				if(numGroupsToShowInMiddle > 0){	
				
					//FIRST
					paginationContent += obj.makePaginationLI(thisGroupNum,1,maxRows);
		
					//FIRST SPACER ELIPSES
					if(startGroupInMiddle > 2){
						paginationContent += "<li class=\"gap\">&hellip;</li>";
					}			
				
					//MIDDLE ITEMS
					for (g = startGroupInMiddle; g <= endGroupInMiddle; g++) { 
						paginationContent += obj.makePaginationLI(thisGroupNum,g,maxRows);
					}
		
					//END SPACER ELIPSES
					if(endGroupInMiddle < (numGroupings-1)){
						paginationContent += "<li class=\"gap\">&hellip;</li>";
					}
					
					//END
					paginationContent += obj.makePaginationLI(thisGroupNum,numGroupings,maxRows);
					
					//NEXT
					if(thisGroupNum < numGroupings){
						paginationContent += "<li class=\"next\"><a href=\"#\" startrow='"+(((thisGroupNum)*maxRows)+1)+"' data-track='{\"type\":\"event\",\"category\":\"PYV Component\",\"action\":\"Pagination\",\"label\":\"#url\"}' class=\"carrot-end\">Next <span class=\"visuallyhidden\">page</span></a></li>";		
					}else{
						paginationContent += "<li class=\"next active\"><a href=\"#\" data-track='{\"type\":\"event\",\"category\":\"PYV Component\",\"action\":\"Pagination\",\"label\":\"#url\"}' aria-disabled=\"true\" class=\"carrot-end\">Next <span class=\"visuallyhidden\">page</span></a></li>";								
					}			
				}

			}
		
			paginationContent += "</ul></nav><div class=\"ResultsFooter-links\"><a href=\"#main\" class=\"js-backtotop\">Back to top</a></div></div></div></div>";

			return paginationContent;
			
		}	
			
		this.makePaginationLI = function(activeGroupNum,liGroupNum,maxRows)
		{

			if(liGroupNum != activeGroupNum){
				return "<li><a href=\"#\" startrow='"+(((liGroupNum-1)*maxRows-1)+2)+"'><span class=\"visuallyhidden\">page</span>"+liGroupNum+"</a></li>";
			}else{
				return "<li class=\"active\"><a href=\"#\" data-track='{\"type\":\"event\",\"category\":\"PYV Component\",\"action\":\"Pagination\",\"label\":\"#url\"}' aria-disabled=\"true\"><span class=\"visuallyhidden\">You're currently on page</span>"+liGroupNum+"</a></li>";
			}
		
		}

		this.showSearchResultsLI = function(item)
		{

			var itemHTML = "";
			var meta = [];

			jQuery.each(item, function (index, value) {
				meta[index] = value;			
			});

			var url = meta["PageURL"];

			var metaFieldArr = config.getMetaFields.split(",");

			if(config.dataTransformJS.length > 0) eval(config.dataTransformJS);

			var metaHTML = "";
			for (var i = 0; i < metaFieldArr.length; i++) {
				var key = metaFieldArr[i];	
				if(key != "Image_URL" && key != "Image_Alt_Text" && key != "Sites_Item" && key != "Abstract" && key != "Title"  && key != "PageURL" && key != "csPageID" && key in meta){	
					if ( ( key != "Sites" ) || ( key == "Sites" && "Sites_Item" in meta && meta["Sites_Item"].length > 1 ) ){
						metaHTML += '<li' + (key == "Sites" ? ' class="ListingMeta-HideLongResults"' : '') + '><span class="ListingMeta-label">'+key.replace(/_/g, ' ')+':</span> <span class="ListingMeta-content">'+meta[key]+'</span></li>';	
					}
					
				}
			}
			if(metaHTML.length > 0) metaHTML = '<div class="col-md-4 order-md-1"><div class="ListingMeta"><ul>' + metaHTML + '</ul></div></div>';
				
			var imgHTML = "";
			if("Image_URL" in meta && meta["Image_URL"].length){
				if(meta["Image_URL"].toLowerCase().indexOf(".jpg") > 0){
					meta["Image_URL"] += "?maxwidth=200&quality=90"; //imageresizer
				}
				imgHTML = "<a href='"+url+"'><img src='"+meta["Image_URL"]+"' alt='"+meta["Image_Alt_Text"]+"' class='ListingResults-thumbnail' /></a>";
			}
					
			var sitesHTML = ""; //only show site if there is only one of them
			if("Sites_Item" in meta && meta["Sites_Item"].length == 1){
				sitesHTML = "<span class='ListingResults-subtitle'>"+meta["Sites_Item"][0]+"</span>";
				// metaHTML = ""; // we don't want to show sites markup on right side, so reset it
			}else if("Sites" in meta && meta["Sites"].length && meta["Sites"].split(",").length == 1){
				sitesHTML = "<span class='ListingResults-subtitle'>"+meta["Sites"]+"</span>";
			}//the else if can go away after 30 days to accomidate CDN holds. -aR 8/24/22

			var abstractHTML = "";
			if("Abstract" in meta && meta["Abstract"].length){
				abstractHTML = '<p class="ListingResults-description">'+ meta["Abstract"]+'</p>';
			}	

			itemHTML = '<li class="ListingList-item ListingResults-item"><div class="ListingEvent-header">'+sitesHTML+'<a href="'+url+'" class="ListingResults-titleLink"><h3 class="ListingResults-title">'+meta["Title"]+'</h3></a></div><div class="row">';
						
			if(metaHTML.length > 0){
				itemHTML += metaHTML + '<div class="col-md-8">';
			}else{
				itemHTML += '<div class="col-md-12">'; //no meta, make it full width
			}
		
			itemHTML += imgHTML + abstractHTML + "</div></div></li>";

			jQuery(".results ul.resultsUL",element).append(itemHTML);	
			
		}	
			
		this.hideLongResults = function()
		{

			var visibleLimit = 5;
			var visibleLimitSlack = 1; //this 'slack' makes it so you'll never have, for example, 1 record after the 'more' break

			//first split the applicable content into visible and invisible
			jQuery(".results li.ListingMeta-HideLongResults", element).each(function () {

				var metaContentArr = jQuery("span.ListingMeta-content", this).text().split(",");

				var metaVisibleArr = [];
				var metaHiddenArr = [];
				var metaResults = "";

				for (var i = 0; i < metaContentArr.length; i++) {
					if( i < visibleLimit || metaContentArr.length <= ( visibleLimit + visibleLimitSlack )  ){
						metaVisibleArr.push(metaContentArr[i]);
					}else{
						metaHiddenArr.push(metaContentArr[i]);
					}
				}

				metaResults += metaVisibleArr.join(",");
				if( metaHiddenArr.length ){
					metaResults += ", <span class='ListingMeta-content-hidden'>" + metaHiddenArr.join(",") + "</span>";
				}

				jQuery(".ListingMeta-content", this).html(metaResults);

			});

			//now, add show hide functionality content to hidden content
			jQuery("span.ListingMeta-content-hidden", element).each(function () {

				var containerHidden = jQuery(this);

				jQuery(this).html( "<span class='ListingMeta-content-hidden-text'>" + jQuery(this).html() + "</span>" );

				jQuery(this).append( " <a aria-expanded='false' style='cursor:pointer;'>more &raquo;</a>" );

				jQuery("span.ListingMeta-content-hidden-text", this).hide();

				//now, add show hide functionality to each anchor tag we created
				jQuery("a", this).click(function () {

					if( jQuery("span.ListingMeta-content-hidden-text", containerHidden).is(":visible")){
						jQuery("span.ListingMeta-content-hidden-text", containerHidden).hide();
						jQuery(this).html("more &raquo;");
					}else{
						jQuery("span.ListingMeta-content-hidden-text", containerHidden).show();
						jQuery(this).html("&laquo; less");
					}

				});
				
			});

		}	

		/* **** DEFAULT OVERRIDES **** */
		
		jQuery(".info-micro-filter #result-sort-form select",element).change(function() {
			config.sort = jQuery("#result-sort-form select[name=result-sortField] option:selected",element).val();
			obj.updateSearchResultsCall(1); 
			$('html, body').animate({
				scrollTop: $(element).offset().top
			}, 1000);			
								
		});					
		
		jQuery(".info-micro-filter #result-count-form select",element).change(function() {
			config.perPage = jQuery("#result-count-form select[name=result-maxRows] option:selected",element).val();
			obj.updateSearchResultsCall(1); 
			$('html, body').animate({
				scrollTop: $(element).offset().top
			}, 1000);			
			
		});	
		
		jQuery(".resultsPaginationArea",element).on("click", "a", function(e) {
			e.preventDefault();
			obj.updateSearchResultsCall($(this).attr("startrow")); 
			$('html, body').animate({
				scrollTop: $(element).offset().top
			}, 1000);			
			
		});
		
		if(config.extrasForm.length > 0){
			
			jQuery(config.extrasForm).submit(function(e) {
				e.preventDefault();
		
				if(config.extrasForm_keywordField.length > 0){
					config.keywords = jQuery(config.extrasForm+" "+config.extrasForm_keywordField).val();
				}

				obj.updateSearchResultsCall(1);		
				$('html, body').animate({
					scrollTop: $(element).offset().top
				}, 1000);			
		
			});			
				
		}
		
		obj.updateSearchResultsCall(1);
			
    };
        
    $.fn.extend({
        searchlisting: function(options)
        {			
            return this.each(function()
            {	
                if ($(this).data('searchlisting')) return;
                
                var searchlisting = new SearchListing(this, options);

				if(typeof options.showSearchResultsLIOverride !== 'undefined'){
					searchlisting.showSearchResultsLIOriginal = searchlisting.showSearchResultsLI;
					searchlisting.showSearchResultsLI = options.showSearchResultsLIOverride;	
				} 

				if(typeof options.runFunctionAfter !== 'undefined'){
					searchlisting.runFunctionAfterOriginal = searchlisting.runFunctionAfter;
					searchlisting.runFunctionAfter = options.runFunctionAfter;	
				} 				

                $(this).data('searchlisting', searchlisting);
            });
        }
    });

})(jQuery);
