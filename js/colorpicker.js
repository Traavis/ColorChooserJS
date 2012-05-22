/*
$.addPicker({
	width,
	height,
	targetProperty,
	change: callback(color){},
	exit: callback(color){}
});
*/

(function( $ ) {
	$.fn.addPicker = function(args) {
  
	
		var settings = $.extend( {
		  'size'  : 300,
		  'targetProperty' : 'backgroundColor',
		  'change' : function(r,g,b, hex) {},
		  'mode' : 'dynamic', // static
		  'color' : '#ff0000'
		}, args);
		
		settings.size -= 15; // correction for sidebars
		
		
		var $this = $(this);
		
		// auxilary functions
		var drawColorBox = function(ctx, color) {
			var whiteg = ctx.createLinearGradient(0,0,settings.size,0);  
			whiteg.addColorStop(0, 'rgba(255,255,255,100)');   
			whiteg.addColorStop(1, 'rgba(255,255,255,0)'); 
			
			var blackg = ctx.createLinearGradient(0,0,0,settings.size);  
			blackg.addColorStop(1, 'rgba(0,0,0,100)');   
			blackg.addColorStop(0, 'rgba(0,0,0,0)'); 
			
			ctx.fillStyle = color;
			ctx.fillRect(0,0,settings.size,settings.size);

			ctx.fillStyle = whiteg;
			ctx.fillRect(0,0,settings.size,settings.size);

			ctx.fillStyle = blackg;
			ctx.fillRect(0,0,settings.size,settings.size);
		}
		var drawSideBox = function(ctx) {
			var raing = ctx.createLinearGradient(0,0,0,settings.size);  
			raing.addColorStop(0, 'rgb(255,0,0)');  
			raing.addColorStop(5/6, 'rgb(255,255,0)'); 
			raing.addColorStop(4/6, 'rgb(0,255,0)'); 
			raing.addColorStop(3/6, 'rgb(0,255,255)'); 
			raing.addColorStop(2/6, 'rgb(0,0,255)'); 
			raing.addColorStop(1/6, 'rgb(255,0,255)'); 
			raing.addColorStop(1, 'rgb(254,0,0)'); 
		  // assign gradients to fill and stroke styles  
			ctx.fillStyle = raing;  
			ctx.fillRect(0,0,15,settings.size);  
		}		
		var toHex = function(dec) {
			if(dec >= 250) dec = 255;
			if(dec <= 5) dec = 0;
			var s = dec.toString(16);
			
			if(s.length == 1) s = "0" + s;
			return s;
		}

		return this.each(function() {      

			var downSide = false;
			var downBase = false;
			
			var target = this;
			target.colorDiv = $('<div class="colorDiv">\
					<canvas class="co_base" width="'+settings.size+'" height="'+settings.size+'"></canvas>\
					<canvas class="co_side" width="15" height="'+settings.size+'"></canvas>\
					#<input class="hexVal" type="text" size="7" maxlength="7"/>\
					r<input class="redVal" type="text" size="1" maxlength="3"/>\
					g<input class="greenVal" type="text" size="1" maxlength="3"/>\
					b<input class="blueVal" type="text" size="1" maxlength="3"/>\
					<button class="closeButton">X</button>\
					<div class="sideCursor"></div>\
					<div class="baseCursor"></div>\
				</div>');

			target.colorDiv.css( {
				'width' : settings.size + 15 +'px',
				'position' : 'absolute',
				'top' : $(target).offset().top,
				'left' : $(target).offset().left + $(target).outerWidth(),
				'overflow' : 'hidden',
				'zIndex' : 99
			});
			
			$(document.body).append( target.colorDiv );
			drawColorBox( target.colorDiv.find('.co_base').get(0).getContext('2d'), settings.color );
			drawSideBox( target.colorDiv.find('.co_side').get(0).getContext('2d') );
			target.colorDiv.find('.hexVal').val( settings.color.substring(1) );

			var updateSide = function(evt) {
				evt.preventDefault();
				if(downSide) {
					
					var posY = evt.clientY + $(window).scrollTop() - target.colorDiv.offset().top;
					if(posY < 0) posY = 0; if(posY > settings.size) posY = settings.size-1;
					target.colorDiv.find('.sideCursor').css({
						'top' : posY,
						'left' : settings.size + 1
					});
					
					var ctx = target.colorDiv.find('.co_side').get(0).getContext('2d');
					var d = ctx.getImageData(2, posY, 1, 1).data;
					var col = "rgb("+d[0]+","+d[1]+","+d[2]+")";
					drawColorBox( target.colorDiv.find('.co_base').get(0).getContext('2d'), col );
					updateTarget();
				}
				
				
			}
		
			var updateBase = function(evt) {
				evt.preventDefault();
				if(downBase) {
					
					var posY = evt.clientY + $(window).scrollTop() - target.colorDiv.offset().top;
					var posX = evt.clientX + $(window).scrollLeft() - target.colorDiv.offset().left;
					if(posX < 0) posX = 0; 
					if(posX > settings.size-1) posX = settings.size-1;
					if(posY < 0) posY = 0; if(posY > settings.size-1) posY = settings.size-1;
					
					console.log('x: ' + posX + ' y: ' + posY + ' xcord: ' + target.colorDiv.offset().left + ' ycord: ' + target.colorDiv.offset().top);
			
					target.colorDiv.find('.baseCursor').css({
						'top' : posY - 3,
						'left' : posX - 3
					});
					
					updateTarget();
				}
			}

			var updateTarget = function() {
					
					
					
					var cursorX = target.colorDiv.find('.baseCursor').offset().left - target.colorDiv.offset().left + 3;
					var cursorY = target.colorDiv.find('.baseCursor').offset().top - target.colorDiv.offset().top + 3;
					
					var ctx = target.colorDiv.find('.co_base').get(0).getContext('2d');
					var d = ctx.getImageData(cursorX, cursorY, 1, 1).data;
					var col = "rgb("+d[0]+","+d[1]+","+d[2]+")";
					$(target).css(settings.targetProperty, col);	

					target.colorDiv.find('.redVal').val( d[0]);
					target.colorDiv.find('.greenVal').val( d[1]);
					target.colorDiv.find('.blueVal').val( d[2]);
					
					var thex = '#' + toHex(d[0]) + toHex(d[1]) + toHex(d[2]);
					target.colorDiv.find('.hexVal').val( toHex(d[0]) + toHex(d[1]) + toHex(d[2]) ); 
					$(target).attr('value', thex);
					
					
					// run the callback function
					settings.change(d[0], d[1], d[2], thex);
			}
		
		
			target.colorDiv.find('.co_side').mousedown( function() {
				downSide = true;
			});
			target.colorDiv.find('.co_base').mousedown( function() {
				downBase = true;
			});		
			target.colorDiv.find('.sideCursor').mousedown( function() {
				downSide = true;
			});
			target.colorDiv.find('.baseCursor').mousedown( function() {
				downBase = true;
			});					
			target.colorDiv.find('.co_side').mousedown(updateSide);
			$(document).mousemove(updateSide);
			
			target.colorDiv.find('.co_base').mousedown(updateBase);
			//target.colorDiv.find('.co_base').mousemove(updateBase);	
			
			$(document).mousemove(updateBase);	

			target.colorDiv.find('.co_base').get(0).addEventListener('touchmove', function(evt) {
				//evt.preventDefault();
				evt.clientX = evt.touches[0].pageX;
				evt.clientY = evt.touches[0].pageY;
				updateBase(evt);
			},false);
			
			$(document).mouseup( function() {
				downSide = false;
				downBase = false;
			});			
			
			if(settings.mode == 'dynamic') {
				$(target).click(function() {
					if( target.colorDiv.css('display') == 'block' ) {
						target.colorDiv.css({'display' :'none'});
						
					} else {
						target.colorDiv.css('display','block');
					}
				});
				
				target.colorDiv.find('.closeButton').click(function() {
					target.colorDiv.css({'display' :'none'});
				});
			}
			else if(settings.mode == 'static') {
				$(target).append(target.colorDiv);
				target.colorDiv.css({
						'display':'block',
						'position':'relative',
						'top' : 0,
						'left' : 0
					});
				target.colorDiv.find('.closeButton').css({'display':'none'});
			}

		});
	
	};
})(jQuery);