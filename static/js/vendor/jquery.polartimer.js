(function($) {

  $.fn.polartimer = function(method) {
    // Method calling logic
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' + method + ' does not exist on jQuery.polartimer');
    }
  };

  let methods = {
    init : function(options) {
      let state = {
        timerSeconds : 10,
        callback : function() {
        },
        color : '#CCC',
        opacity : 1
      };
      state = $.extend(state, options);

      return this.each(function() {
        let $this = $(this);
        let data = $this.data('polartimer');
        if (! data) {
          $this.addClass('polartimer');
          $this.height($this.width());
          state.timer = null;
          state.timerCurrent = 0;
          state.pi2 = Math.PI * 2;
          state.piOver2 = Math.PI / 2;
          state.width = $this.width();
          state.height = $this.height();
          if (Snap) {
            state.paper = Snap(state.width, state.height);
            state.paper.node.style = 'overflow: hidden; position: relative;';
            $($this).append(state.paper.node);
          }
          $this.data('polartimer', state);
        }
      });
    },

    stopWatch : function() {
      return this.each(function() {
        let data = $(this).data('polartimer');
        if (data) {
          let seconds = (data.timerFinish - (new Date().getTime())) / 1000;
          if(seconds <= 0) {
            clearInterval(data.timer);
            $(this).polartimer('drawTimer', 100);
            data.callback();
          }
          else {
            let percent = 100 - ((seconds / (data.timerSeconds)) * 100);
            $(this).polartimer('drawTimer', percent);
          }
        }
      });
    },

    drawTimer : function(percent) {
      return this.each(function() {
        $this = $(this);
        let data = $this.data('polartimer');
        if (data) {
          let w = data.width;
          let cx = w / 2;

          data.paper.clear();

          if (percent == 100) {
            data.paper.circle(cx, cx, cx).attr({
              fill : data.color,
              stroke : 'none',
              opacity : data.opacity
            });
          }
          else {
            let theta = data.pi2 * percent / 100 - data.piOver2;
            let x1 = Math.cos(theta) * cx + cx;
            let y1 = Math.sin(theta) * cx + cx;

            let longArcFlag = (percent <= 50) ? 0 : 1;

            let path = "M" + cx + "," + cx + " L" + cx + ",0 ";
            path += "A" + cx + "," + cx + " 0 " + longArcFlag + ",1 " + x1 + "," + y1 + " ";
            path += "L" + cx + "," + cx + "z";

            let frame = data.paper.path(path);
            frame.attr({
              fill : data.color,
              stroke : 'none',
              opacity : data.opacity
            });
          }
        }
      });
    },

    start : function(percent) {
      return this.each(function() {
        let data = $(this).data('polartimer');
        if (data) {
          if (percent < 0 || !percent) percent = 0;
          if (percent > 100) percent = 100;
          clearInterval(data.timer);
          data.resumeSeconds = null; // clears paused state
          data.timerFinish = new Date().getTime() + (data.timerSeconds * 1000) * (1 - percent / 100);
          $(this).polartimer('drawTimer', percent);
          let id = $this.attr('id');
          data.timer = (! id || id === "") ?
            setInterval("$this.polartimer('stopWatch')", 50) :
            setInterval("$('#"+id+"').polartimer('stopWatch')", 50);
        }
      });
    },

    pause : function() {
      return this.each(function() {
        let data = $(this).data('polartimer');
        if (data && ! data.resumeSeconds) {
          data.resumeSeconds = (data.timerFinish - (new Date().getTime())) / 1000;
          clearInterval(data.timer);
        }
      });
    },

    resume : function() {
      return this.each(function() {
        let data = $(this).data('polartimer');
        if (data && data.resumeSeconds) {
          clearInterval(data.timer);
          data.timerFinish = new Date().getTime() + (data.resumeSeconds * 1000);
          $(this).polartimer('drawTimer', 100 * (data.timerSeconds - data.resumeSeconds) / data.timerSeconds);
          data.resumeSeconds = null;
          let id = $this.attr('id');
          data.timer = (! id || id === "") ?
            setInterval("$this.polartimer('stopWatch')", 50) :
            setInterval("$('#"+id+"').polartimer('stopWatch')", 50);
        }
      });
    },

    reset : function() {
      return this.each(function() {
        let data = $(this).data('polartimer');
        if (data) {
          clearInterval(data.timer);
          data.resumeSeconds = null; // clears paused state
          $(this).polartimer('drawTimer', 0);
        }
      });
    },

    destroy : function() {
      return this.each(function() {
        let $this = $(this);
        let data = $this.data('polartimer');
        if (data) {
          clearInterval(data.timer);
          data.paper.remove();
          $this.removeData('polartimer');
        }
      });
    }

  };
})(jQuery);
