(function ($) {
  'use strict';

  // Make table of contents collapsible.
  $(function() {
    $('.contentTable').each(function() {
      var $wrapper = $(this);
      var $header = $wrapper.find('.tocHeader');
      var $content = $wrapper.find('.tocContent');

      var $icon = $('<i class="fa fa-arrow-up"></i>');
      $('<span class="tocToggle"></span>').append($icon).appendTo($header);

      $header.click(function() {
        $content.toggle(600);
        $icon.toggleClass('fa-arrow-up fa-arrow-down');
      });
    });
  });

  // Add inline previews for playground links.
  $(function() {
    var playgroundUrl = '//www.babylonjs-playground.com';
    var patternId = /\/#([A-Z0-9#]+?)$/;

    var $links = $('a[href*="' + escapeSelector(playgroundUrl + '/#')+ '"]');
    $links.each(function() {
      var matches, $toggle;
      if(matches = this.href.match(patternId)) {
        $toggle = $('<i class="fa fa-eye"></i>')
          .click(function() {
            createIframe(matches[1], this);
          });

        $(this).after(
          document.createTextNode(' - '), $toggle, '<br>',
         '<div class="iframeContainer"></div>'
        );
      }
    });

    /**
     * Escapes CSS selector values.
     * Source: https://stackoverflow.com/a/11846715/521868
     */
    function escapeSelector(selector) {
      return selector.replace(/([$%&()*+,./:;<=>?@\[\\\]^{|}~])/g, '\\$1');
    }
  });

  // Prevent scrolling in the parent window while inside an iframe.
  $(function() {

    // Toggles scrolling on the main window.
    var lockScroll = (function() {
      var locked = false, x, y, overflow;
      var $body = $('body');

      return {
        lock: function() {
          if(!locked) {
            x = window.scrollX;
            y = window.scrollY;
            overflow = $body.css('overflow');
            $body.css('overflow', 'hidden');
            locked = true;
          }
        },
        unlock: function() {
          if(locked) {
            $body.css('overflow', overflow);
            window.scrollTo(x, y);
            locked = false;
          }
        }
      };
    }());

    // Pins an element at its current position.
    var pinElement = (function() {
      var $overlay = $('<div></div>').css({
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'rgba(0,0,0,.7)',
        margin: 0,
        'z-index': 99998
      });

      function saveCss(el, props) {
        var copy = {}, $el = $(el), name;
        for(name in props) {
          if(props.hasOwnProperty(name)) {
            copy[name] = $el.css(name);
          }
        }
        $el.data('pinned-props', copy);
      }
      function restoreCss(el) {
        var $el = $(el);
        $el.css($el.data('pinned-props'));
        $el.data('pinned-props', null);
      }
      function isPinned(el) {
        return !!$(el).data('pinned-props');
      }

      return {
        pin: function (el) {
          if(!isPinned(el)) {
            var rect = el.getBoundingClientRect();
            var props = {
              left: rect.x + 'px',
              top: rect.y + 'px',
              width: rect.width + 'px',
              position: 'fixed',
              'z-index': 99999
            };
            saveCss(el, props);
            $(el).css(props);
            $overlay.appendTo('body');
          }
        },
        unpin: function(el) {
          if(isPinned(el)) {
            restoreCss(el);
            $overlay.detach();
          }
        }
      };
    }());

    var last;

    $(document).on('mouseover', function(e) {
      if(last === e.target) {
        return;
      }
      if(last) {
        pinElement.unpin(last);
        lockScroll.unlock();
        last = null;
      }
      else if(e.target.tagName === 'IFRAME') {
        last = e.target;
        pinElement.pin(last);
        lockScroll.lock();
      }
    });
  });

  /**
   * Creates an iframe containing the given playground.
   * The link element is used to retrieve the closest div below the link
   */
  function createIframe(playgroundId, link) {

    // By default, meta marked add the iframeContainer in the next paragraph...
    var iframeContainer = $(link).parent().next();
    if (! iframeContainer.hasClass('iframeContainer')) {
      // ...but sometimes not.
      iframeContainer = $(link).next().next();
    }

    iframeContainer.css('display', 'block');
    if (iframeContainer.children().length == 0) {
      var iframe = $("<iframe>").attr('src', '//www.babylonjs-playground.com/frame.html#'+playgroundId);
      iframeContainer.append(iframe);
    } else {
      iframeContainer.empty().css('display', 'none');
    }
  }

})(jQuery);
