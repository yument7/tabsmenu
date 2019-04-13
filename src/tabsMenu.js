(function (factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jqurey')) :
		typeof define === 'function' && define.amd ? define(['jquery'], factory) :
		factory(jQuery);
}(function ($) {
	$.fn.tabsMenu = function (options) {
		var defaults = {
			fixed_tab: {
				status: true,
				text: "Dashboard",
				icon: "",
				src: ""
			},
			prev_btn: {
				text: "",
				icon: "fa fa-backward",
			},
			back_btn: {
				text: "",
				icon: "fa fa-forward",
			},
			close_btns: false,
			theme: "default",
			kind: "",
			activeKind: ".active",
			tabsCallback: function (opt) {
				console.log(opt);
			}
		};

		$.extend(true, defaults, options);

		var cbOptions = {
			index: "",
			current: "",
			active: ""
		};

		var _this = $(this);
		var kind = defaults.kind;
		var activeKind = defaults.activeKind;
		var tabsCallback = defaults.tabsCallback;

		init();

		// init load tabs		
		function init() {
			var prev_btn_node = '<button class="roll-nav roll-left J_tabLeft"><i class="' + defaults.prev_btn.icon + '"></i></button>';

			var back_btn_node = '<button class="roll-nav roll-right J_tabRight"><i class="' + defaults.back_btn.icon + '"></i></button>';

			var menutabs_node = '<nav class="nav-bar J_menuTabs"><div class="page-tabs"><div class="page-tabs-content"></div></div></nav>';

			_this.append(prev_btn_node);
			_this.append(menutabs_node);
			_this.append(back_btn_node);

			// fixed tab
			var fixed_status = defaults.fixed_tab.status;
			if (fixed_status) {
				var fixed_tab_node = '<a href="javascript:;" class="active J_menuTab fixed-tab" data-src="' + defaults.fixed_tab.src + '" data-index="0">';
				var icon_node = '';
				if (defaults.fixed_tab.icon) {
					icon_node = '<i class="' + defaults.fixed_tab.icon + ' icon"></i>';
				}
				fixed_tab_node += icon_node;
				fixed_tab_node += defaults.fixed_tab.text + '</a>';
				_this.find(".page-tabs-content").append(fixed_tab_node);
			}

			// close button
			if (defaults.close_btns) {
				var closeNode = '<div class="roll-nav roll-close J_tabClose"><ul class="tabs-close"><li><a href="javascript:;" class="cartbtn-switcher">关闭操作<i class="fa fa-caret-down"></i></a>' +
					'<dl class="tabs-close-child"><dd class="J_tabCloseAll"><a>关闭全部选项卡</a></dd><dd class="J_tabCloseOther"><a>关闭其他选项卡</a></dd></dl></li></ul></div>';
				_this.append(closeNode);
				var cnWidth = _this.find('.J_tabClose').width();
				console.log(cnWidth);
				_this.find(".J_tabRight").css("right", cnWidth);
			}
		}

		// the judge of tree menu
		if (kind) {
			// add the attribute of index to item
			$(kind).each(function (k) {
				if (!$(this).attr("data-index")) {
					var index = defaults.fixed_tab.status ? k + 1 : k;
					$(this).attr("data-index", index);
				}
			});

			// add the event of click on item
			$(kind).on("click", triggerItemEvent);
		}

		// add the event of click on tab
		_this.off("click", ".J_menuTab").on("click", ".J_menuTab", triggerTabEvent);

		// add the event of click on tab's close button 
		$(".J_menuTabs").on("click", ".J_menuTab i", triggerCloseEvent);

		// add the event of click on prev button
		$(".J_tabLeft").off("click").on("click", triggerPrevEvent);

		// add the event of click on next button
		$(".J_tabRight").off("click").on("click", triggerNextEvent);

		// add the event of click on close tab
		$(".cartbtn-switcher").off("click").on("click", triggerCloseTabs);

		// add the event of click on close all btn
		$(".J_tabCloseAll").on("click", triggerCloseAll);

		// add the event of click on close all other btn
		$(".J_tabCloseOther").on("click", triggerCloseOther);

		// trigger the item of tree menu
		function triggerItemEvent(event) {
			event.preventDefault();
			var src = $(this).attr("href"),
				index = $(this).data("index"),
				text = $.trim($(this).text()),
				icon_nodes = $(this).find("i"),
				tab_exsit = true;

			cbOptions.index = index;
			cbOptions.current = src;

			if (src == undefined || $.trim(src).length == 0) {
				return;
			}

			$(".J_menuTab").each(function () {
				if ($(this).data("index") == index && !$(this).hasClass("active")) {
					var prev_src = $(this).parent().find(".J_menuTab.active").data("src");
					$(this).addClass("active").siblings(".J_menuTab").removeClass("active");
					dealWidth($(this));

					// 
					cbOptions.active = prev_src;
					tabsCallback(cbOptions);

					tab_exsit = false;
					return false;
				}
				if ($(this).data("index") == index && $(this).hasClass("active")) {
					// call the function of callback
					cbOptions.active = src;
					tabsCallback(cbOptions);

					tab_exsit = false;
					return false;
				}
			});

			if (tab_exsit) {
				var new_tab = '<a href="javascript:;" class="active J_menuTab" data-src="' + src + '" data-index="' + index + '">';
				if (icon_nodes[0]) {
					var icon_node = icon_nodes.first();
					var clas = icon_node.attr("class");
					var icon_tab = '<i class="' + clas + ' icon"></i>';
					new_tab += icon_tab;
				}
				new_tab += text + ' <i class="fa fa-close"></i></a>';

				$(".J_menuTab").removeClass("active");
				$(".J_menuTabs .page-tabs-content").append(new_tab);
				dealWidth($(".J_menuTab.active"));

				// call the function of callback
				tabsCallback(cbOptions);
			}

			itemActived(index);
			return false;
		}

		// trigger the tabs
		function triggerTabEvent() {
			var self = $(this);
			var current_src = self.data("src"),
				index = self.data("index");

			cbOptions.index = index;
			cbOptions.current = current_src;

			if (!self.hasClass("active")) {
				cbOptions.active = self.siblings(".J_menuTab.active").data("src");

				self.addClass("active").siblings(".J_menuTab").removeClass("active");
				dealWidth(this);

				// call the function of callback
				tabsCallback(cbOptions);
			}

			itemActived(index);
		}

		// response the selected item of the tree menu 
		function itemActived(index) {
			if (index) {
				var current = $(kind + '[data-index="' + index + '"]');
				$(kind).removeClass(activeKind);
				current.addClass(activeKind);
			}
		}

		// trigger the button of previous
		function triggerPrevEvent() {
			var prev = $(".J_menuTab.active").prev();
			var src;
			if (prev.length) {
				prev.addClass("active").siblings().removeClass("active");
				src = prev.data("src");
			} else {
				$(".J_menuTab:last").addClass("active").siblings().removeClass("active");
				src = $(".J_menuTab:last").data("src");
			}

			dealWidth($(".J_menuTab.active"));

			cbOptions.current = src;
			// call the function of callback
			tabsCallback(cbOptions);
		}

		// trigger the button of next 
		function triggerNextEvent() {
			var next = $(".J_menuTab.active").next();
			var src;
			if (next.length) {
				next.addClass("active").siblings().removeClass("active");
				src = next.data("src");
			} else {
				$(".J_menuTab:first").addClass("active").siblings().removeClass("active");
				src = $(".J_menuTab:first").data("src");
			}

			dealWidth($(".J_menuTab.active"));

			cbOptions.current = src;
			// call the function of callback
			tabsCallback(cbOptions);
		}

		// close the tab of selected
		function triggerCloseEvent() {
			var selfa = $(this).parents(".J_menuTab");
			var src = selfa.data("src");

			if (selfa.hasClass("active")) {

				cbOptions.active = src;

				if (selfa.next(".J_menuTab").length) {
					var next_src = selfa.next().data("src");
					var next_index = selfa.next().data("index");
					selfa.next().addClass("active");
					selfa.remove();
					itemActived(next_index);

					cbOptions.index = next_index;
					cbOptions.current = next_src;
					// call the function of callback
					tabsCallback(cbOptions);
				}
				if (selfa.prev().length) {
					var prev_src = selfa.prev().data("src");
					var prev_index = selfa.prev().data("index");
					selfa.prev().addClass("active");
					selfa.remove();
					itemActived(prev_index);

					cbOptions.index = prev_index;
					cbOptions.current = prev_src;
					// call the function of callback
					tabsCallback(cbOptions);
				}
			} else {
				selfa.remove();
				dealWidth($(".J_menuTab.active"));
			}

			return false;
		}

		// toggle the closetabs show or hide
		function triggerCloseTabs() {
			$(this).find("i.fa").toggleClass("fa-caret-down").toggleClass("fa-caret-left");
			$(this).next().toggleClass("show-hide");
		}

		// close all tabs
		function triggerCloseAll() {
			if (defaults.fixed_tab.status) {
				$(".page-tabs-content").children("[data-index]").not(":first").each(function () {
					$(this).remove();
				});
				var firstObject = $(".page-tabs-content").children("[data-index]:first");
				firstObject.addClass("active");
				cbOptions.current = firstObject.data("src");
				cbOptions.index = firstObject.data("index");
				tabsCallback(cbOptions);
			} else {
				$(".page-tabs-content").children("[data-index]").each(function () {
					$(this).remove();
				});
				tabsCallback(cbOptions);
			}
			$(".cartbtn-switcher").trigger("click");
		}

		// close all tabs expect the tab of actived
		function triggerCloseOther() {
			if (defaults.fixed_tab.status) {
				$(".page-tabs-content").children("[data-index]").not(":first").not(".active").each(function () {
					$(this).remove();
				});
			} else {
				$(".page-tabs-content").children("[data-index]").not(".active").each(function () {
					$(this).remove();
				});
			}
			$(".cartbtn-switcher").trigger("click");
		}

		// deal with the width beyond of the sence
		function dealWidth(that) {
			var otherWh = getWidth(_this.children().not(".J_menuTabs"));
			var firstWh = $(".J_menuTab:first").outerWidth();
			var tabsWh = _this.outerWidth(false) - otherWh - firstWh;
			var prevWh = getWidth($(that).prevAll()) - firstWh;
			var mlWh = parseInt($(".page-tabs-content").css("margin-left"));
			var actWh = $(that).outerWidth(true);
			var overWh = mlWh;
			var isOverMlFlag = (prevWh + actWh - tabsWh) > 0;
			var isOverMrFlag = (prevWh + mlWh - firstWh) < 0;
			if ($(that).index() == 0) {
				overWh = firstWh;
			} else {
				if (isOverMlFlag) {
					overWh = firstWh - (prevWh + actWh - tabsWh);
					var widths = 0 - firstWh;
					$(".J_menuTab").not(that).each(function () {
						widths += $(this).outerWidth(true);
						if (widths > (firstWh - overWh)) {
							overWh = firstWh - widths;
							return false;
						}
					});
				} else if (isOverMrFlag) {
					overWh = firstWh - prevWh;
				} else {
					overWh = mlWh;
				}
			}
			$(".page-tabs-content").animate({
				marginLeft: overWh + "px"
			}, "fast");
		}

		// get the width of element
		function getWidth(thats) {
			var widths = 0;
			$(thats).each(function () {
				widths += $(this).outerWidth(true);
			});
			return widths;
		}

		return this;
	}

}));