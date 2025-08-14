/*----------------------------------------------------------------------------
 * Plugin	: jquery.plani.scroller.js
 * ---------------------------------------------------------------------------
 * Author	: (주)플랜아이 http://plani.co.kr
 * ---------------------------------------------------------------------------
 * Usage	:
 * ---------------------------------------------------------------------------

	<div id="banner-link">
		<div class="wrapper">
			<ul class="bannerlink">
				<li><a href="http://www.oecd.org" title="OECD 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink1.gif" alt="OECD" /></a></li>
				<li><a href="http://oecd.mofat.go.kr" title="주 OECD 대표부 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink2.gif" alt="주 OECD 대표부" /></a></li>
				<li><a href="http://www.stepi.re.kr" title="STEPI 과학기술정책연구원 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink9.gif" alt="STEPI 과학기술정책연구원" /></a></li>
				<li><a href="http://www.mest.go.kr" title="교육과학기술부 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink3.gif" alt="교육과학기술부" /></a></li>
				<li><a href="http://www.now.go.kr" title="S&amp;T GPS : 과학기술정책 정보 시스템 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink4.gif" alt="S&amp;T GPS : 과학기술정책 정보 시스템" /></a></li>
				<li><a href="http://www.kribb.re.kr" title="KRIBB 한국생명공학연구원 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink5.gif" alt="KRIBB 한국생명공학연구원" /></a></li>
				<li><a href="http://www.kist.re.kr" title="KIST 한국과학기술연구원 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink6.gif" alt="KIST 한국과학기술연구원" /></a></li>
				<li><a href="http://www.kosef.re.kr" title="KOSEF 한국과학재단 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink7.gif" alt="KOSEF 한국과학재단" /></a></li>
				<li><a href="http://www.kistep.re.kr" title="KISETP 한국과학기술기획평가원 새창으로 열기" target="_blank"><img src="/images/ad_bannerlink8.gif" alt="KISETP 한국과학기술기획평가원" /></a></li>
			</ul>
		</div>
	</div>

	<script type="text/javascript">
	//<![CDATA[
	jQuery(function($)
	{
		try
		{
			$('div#banner-link').Scroller
			({
				'target'	: 'ul.bannerlink',
				'display'	: 4,
				'direction'	: 'x',
				'buttons'	:
				{
					'prev'	: {'class':'btn_prev', 'id':'btn_prev', 'src':'/images/btn_prev.gif', 'alt':'이전', 'title':'이전 관련기관 보기'},
					'next'	: {'class':'btn_next', 'id':'btn_next', 'src':'/images/btn_next.gif', 'alt':'다음', 'title':'다음 관련기관 보기'}
				}
			});
		}
		catch (e) { }
	});
	//]]>
	</script>

 * ---------------------------------------------------------------------------
 * History
 * ---------------------------------------------------------------------------
 * 2012-01-29(pigcos)	: 최초작성
 * ---------------------------------------------------------------------------
 * 2012-01-30(pigcos)	: 좌우 롤링 이벤트, 이전 다음 버튼 이벤트 작성
 * -------------------------------------------------------------------------*/

(function($)
{
	$.debug	= function (message, trace)
	{
		if (typeof window.console!='undefined' && typeof window.console.log!='undefined')
		{
			console.log(message);
			if (trace==true) { console.trace(message); }
		}
	};

	$.fn.Scroller	= function (options)
	{
		var settings	= $.extend
		(
			{
				display		: 1,
				delay		: 1000,
				pause		: 1000,
				direction	: 'x',
				buttons		: {}
			},
			options
		);

		settings.direction	= $.inArray(settings.direction, ['x', 'y'])!=-1 ? settings.direction : 'x';
		settings.target		= settings.target ? $(settings.target) : $(this).children(':first');

		var interval			= null;
		var animate_start_time	= 0;
		var animate_run_time	= 0;
		var is_mouse_over		= false;
		var is_focus			= false;

		var flow		= 1;
		var pass_delay	= false;

		if ($(settings.target).children().size()<=settings.display) { return; }

		$(this).find('#banner_area_list').css({'overflow':'hidden'});
		$(settings.target).css({'position':'absolute', 'top':0, 'left':0, 'width':'1000%'});

		var is_play	= true;

		var setButtons	= function (options)
		{
			var prev	= $(settings.buttons.prev);
			var next	= $(settings.buttons.next);
			var stop	= $(settings.buttons.stop);
			var start	= $(settings.buttons.play);
//			if (settings.buttons.prev=='undefined') { return; }
//			if (settings.buttons.prev.classname=='undefined') { return; }
//			if (settings.buttons.prev.id=='undefined') { return; }
//			if (settings.buttons.prev.src=='undefined') { return; }
//			if (settings.buttons.prev.alt=='undefined') { return; }
//			if (settings.buttons.prev.title=='undefined') { return; }
//
//			if (settings.buttons.next=='undefined') { return; }
//			if (settings.buttons.next.classname=='undefined') { return; }
//			if (settings.buttons.prev.id=='undefined') { return; }
//			if (settings.buttons.next.src=='undefined') { return; }
//			if (settings.buttons.next.alt=='undefined') { return; }
//			if (settings.buttons.next.title=='undefined') { return; }
//
//			var prev	= $('<p class="' + settings.buttons.prev.classname + '" id="' + settings.buttons.next.classname + '">'
//						+ '<a href="/" title="' + settings.buttons.prev.title + '">'
//						+ '<img src="' + settings.buttons.prev.src + '" alt="' + settings.buttons.prev.alt + '" />'
//						+ '</a>'
//						+ '</p>');
//
//						$(settings.target).parent().before(prev);
//
//			var next	= $('<p class="' + settings.buttons.next.classname + '" id="' + settings.buttons.next.classname + '">'
//						+ '<a href="/" title="' + settings.buttons.next.title + '">'
//						+ '<img src="' + settings.buttons.next.src + '" alt="' + settings.buttons.next.alt + '" />'
//						+ '</a>'
//						+ '</p>');
//						
//						$(prev).after(next);

			$(prev).click(function ()
			{
				flow	= 2;
				pass_delay	= true;

				$(settings.target).stop(true);
				clearTimeout(interval);
				action();

				return false;
			});
			
			$(next).click(function ()
			{
				flow	= 1
				pass_delay	= true;

				$(settings.target).stop(true);
				clearTimeout(interval);
				action();
				
				return false;
			});

			$(stop).click(function ()
			{
				is_play	= false;
				pass_delay	= true;

				$(settings.target).stop(true);
				clearTimeout(interval);
				action();
				clearTimeout(interval);
				
				return false;
			});
			
			$(start).click(function ()
			{
				if (is_play==false)
				{
					is_play	= true;
					action();
				}
				
				return false;
				
			});

		};

		setButtons(settings.buttons);

		$(settings.target).children().each(function (i)
		{
			$(this).find('a').live
			(
				'mouseover mouseout focusin focusout',
				function (e)
				{
					if (e.type=='mouseover')
					{
						is_mouse_over	= true;
						clearTimeout(interval);
						$(settings.target).stop();
					}

					if (e.type=='mouseout')
					{
						if (is_focus==false) { interval	= setTimeout(action, settings.delay); }
					}

					if (e.type=='focusin')
					{
						is_focus	= true;
						clearTimeout(interval);
						$(settings.target).stop();
					}

					if (e.type=='focusout')
					{
						is_focus	= false;
						interval	= setTimeout(action, settings.delay);
					}
				}
			);

		});

		var action	= function ()
		{
			var move		= flow==1 ? parseInt($(settings.target).children(':first').width(), 10)*-1 : 10;
			var delay_time	= parseInt(settings.delay, 10);

			if ((pass_delay==true || is_mouse_over==true) && animate_run_time>0)
			{
				if (delay_time-animate_run_time>0)
				{
					delay_time		= parseInt(settings.delay, 10)-parseInt(animate_run_time, 10);
				}
	
				is_mouse_over	= false;
			}

			if (pass_delay==true)
			{
				delay_time	= 0;
				pass_delay	= false;
			}

			$(settings.target).animate
			(
				{'left':move},
				{
					duration	: delay_time,
					complete	: function ()
					{
						if (flow==1)
						{
							$(this).css({'left':0}).append($(this).children(':first'));
						}
						else
						{
							$(this).css({'left':(parseInt($(settings.target).children(':last').width(), 10)*-1)-15}).children(':first').before($(this).children(':last'));
						}

						animate_start_time	= 0;

						interval	= setTimeout(action, parseInt(settings.delay, 10)+parseInt(settings.pause, 10));

					},
					step		: function (now, fx)
					{
						if (animate_start_time==0) { animate_start_time	= parseInt(new Date().getTime(), 10); }
						animate_run_time	= parseInt(new Date().getTime(), 10)-parseInt(animate_start_time, 10);
					}
				}
			);
		};

		interval	= setTimeout(action, settings.delay);
	};

})(jQuery);
