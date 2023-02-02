jQuery(document).ready(function() {

  // BAR 
  var rotators = [];
  var BAR = function(data) {
    var data = data;
    var timeOut;

    var slickConfig = {
      infinite: true,
      speed: 500,
      arrows: false,
      autoplay: true,
      autoplaySpeed: 7000,
      dots: true,
      fade: true,
      slide: 'li',
      pauseOnDotsHover: true,
      cssEase: 'linear',

      onBeforeChange: function() {
        var $this = jQuery(this);
        $this[0].$list.find('.sub').hide();
        clearTimer(timeOut);
      },
      onAfterChange: function() {
        var $this = jQuery(this);
        timeOut = setTimeout(function() {
          fadeIn($this, timeOut);
        }, 1000);
      }
    }

    function clearTimer(timeOut) {
      clearTimeout(timeOut);
      timeOut = null;
    }

    function fadeIn($this, interval) {
      $this[0].$list.find('.sub').fadeIn(600);
      clearTimer(timeOut);
    }

    var exports = {
      initialize: function(data) {
        this.$el = data.el;
        // Create Slick Rotator
        this.initRotator();
      },

      initRotator: function() {
        var $this = this.$el;

        if (this.$el.hasClass('-no-delay')) {
          slickConfig.onBeforeChange = null;
          slickConfig.onAfterChange = null;
        }
        var $viewAll = this.$el.find('li.viewAll').detach();
        this.$el.find('ul').slick(slickConfig);

        if ($viewAll) {
          jQuery($viewAll.html()).insertBefore($this.find('.slick-dots'));
        }
      }
    };

    exports.initialize(data);
    return exports;
  };

  jQuery('[data-fader]').each(function(index) {
    var $this = jQuery(this);
    rotators.push(new BAR({
      el: $this,
      index: index
    }));
  });

  // Photo Gallery, see NPSWSD 192
  var $lightbox = jQuery(".lightbox");

  // we must distinguish between image and caption links 
  // or else images get double-loaded into one gallery 
  if ($lightbox.length) {
	jQuery(".lightbox.captionlink").magnificPopup({
		type:'image',
		gallery:{
			enabled:true
		}   
	});
 
	jQuery(".lightbox.imagelink").magnificPopup({
		type:'image',
		gallery:{
			enabled:true
		}
	});
}

  // Readmore
  // NPSWSD-344 - STC - 8/28/2015: We were using both jTruncate and readmore.js on photo gallery descriptions, giving two separate more links.
  /*var $expandable = jQuery('.expandable');
  if ($expandable.length) {
    $expandable.readmore({
      collapsedHeight: 40,
      moreLink: '<span>&#8230;<span> <a href="#">more</a>',
      lessLink: '<a href="#">less</a>'
    });
  }*/

  // DatePicker
  var $dateRange = jQuery('.input-daterange');
  if ($dateRange.length) {
    $dateRange.datepicker({
      clearBtn: true,
      todayBtn: "linked",
      todayHighlight: true
    });
  }
    
});
