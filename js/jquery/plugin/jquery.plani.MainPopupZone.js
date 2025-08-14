/*----------------------------------------------------------------------------
 * Main Popup Zone
 * ---------------------------------------------------------------------------
 * Date      : 2011-02-08
 * Author    : PLANI Web Standardization Team (http://plani.co.kr/) kimkikwan
 * Including : bu
 * ---------------------------------------------------------------------------
 * USAGE
 * ---------------------------------------------------------------------------
 * 
 * ---------------------------------------------------------------------------
 * EXAMPLE
 * ---------------------------------------------------------------------------
 * 
 *----------------------------------------------------------------------------
 */
$.fn.MainPopupZone	= function (option)
{
	option = option || {};
	
	var element		= $(this);
	var interval	= null;
	var current		= 0;
	var delay		= option.delay ? option.delay : 3000;
	var banner		= $(element).children('div.popup').children('ul');
	var size		= parseInt($(banner).children('li').size());
	var is_focus	= false;
	var is_stop		= false;
	var context = option.context;
	
	if (size==1) { $(banner).css('overflow', 'hidden'); }
	if (size<2) { return; }

	$(banner).css('overflow', 'hidden').children('li').each(function(i)
	{
		if (i>0) { $(this).hide(); }

		$(this).children('a:first').focus(function()
		{
			is_focus	= true;
			clearInterval(interval);
		});

		$(this).children('a:first').mouseover(function()
		{
			clearInterval(interval);
		});

		$(this).children('a:first').blur(function()
		{
			is_focus	= false;
			interval	= setInterval(rotate, delay);
		});

		$(this).children('a:first').mouseout(function()
		{
			if (is_focus===true)
			{
				clearInterval(interval);	
			}
			else if(is_stop === true)
			{
				clearInterval(interval);
			}
			else
			{
				rotate();
				interval	= setInterval(rotate, delay);
			}
		});

	});
	
	var popupzone_functions	= '<ul class="btn-control">';
		popupzone_functions	+= '<li><a href="#popupzone" class="btn-play"><img src="' + context + '/images/custom/index/btn_play.gif" alt="play" /></a></li>';
		popupzone_functions	+= '<li><a href="#popupzone" class="btn-stop"><img src="' + context + '/images/custom/index/btn_stop.gif" alt="stop" /></a></li>';
		popupzone_functions	+= '</ul>';
		$(element).children('div.popup').before(popupzone_functions);

		$(element).children('ul.btn-control').find('a.btn-play').click(function()
		{
			is_stop		= false;
			interval	= setInterval(rotate, delay);
			return false;
		});

		$(element).children('ul.btn-control').find('a.btn-stop').click(function()
		{
			is_stop		= true;
			clearInterval(interval);
			return false;
		});

	var popupzone_numbers	= '<ul class="popup-navi">';
	var num_src_off	= context + '/images/custom/index/ic_default.gif';
	var num_src_on	= context + '/images/custom/index/ic_focus.gif';

		for(var i=0; i<size; i++)
		{
			var href	= '#' + $(banner).children('li:nth-child('+(i+1)+')').attr('id');
			var alt		= $(banner).children('li:nth-child('+(i+1)+')').find('img').attr('alt');

			var src		= num_src_off;

			if (i==0) { src	= num_src_on; }
			
			popupzone_numbers	+= '<li><a href="' + href + '"><img src="' + src + '" alt="' + alt + '" /></a></li>';
		}
		
		popupzone_numbers	+= '</ul>';

		$(element).children('div.popup').before(popupzone_numbers);
		$(element).children('ul.popup-navi').children('li').each(function(i)
		{
			var num	= i;

			$(this).click(function()
			{
				current	= num;
				$(banner).children('li').hide();
				$(banner).children('li:nth-child('+(current+1)+')').show();
				//$(banner).children('li:nth-child('+(current+1)+')').children('a:first').focus();
				clearInterval(interval);

				$(element).children('ul.popup-navi').children('li').find('img:first').attr('src', num_src_off);
				$(element).children('ul.popup-navi').children('li:nth-child('+(current+1)+')').find('img:first').attr('src', num_src_on);

				return false;
			});
		});

	var rotate	= function ()
	{
		current++;

		if (current>=size) { current = 0; }
		
		$(banner).children('li').hide();
		$(banner).children('li:nth-child('+(current+1)+')').show();

		$(element).children('ul.popup-navi').children('li').find('img:first').attr('src', num_src_off);
		$(element).children('ul.popup-navi').children('li:nth-child('+(current+1)+')').find('img:first').attr('src', num_src_on);
	};
	
	interval	= setInterval(rotate, delay);

};