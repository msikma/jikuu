/*
 * Jikuu Tumblr Theme - Layout Code
 * Copyright (C) 2013, Michiel Sikma <mike@letsdeliver.com>
 * All Rights Reserved
 * Date: 2013-06-08
 *
 * @author Michiel Sikma
 *
// ==ClosureCompiler==
// @output_file_name jikuu.min.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// @externs_url http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.8.js
// ==/ClosureCompiler==
 *
 */

(function($)
{
	/**
	 * @namespace Jikuu theme layout code.
	 */
	window["Jikuu"] = {};
	
	/**
	 * Main layout code.
	 * jQuery objects are indicated by a $ variable name prefix.
	 *
	 * @static
	 */
	Jikuu["Main"] = (function()
	{
		var self = this;
		
		/* The Jikuu layout sections that can be decorated: */
		
		var $section_me;					// blog description section
		var $section_socmed;				// social media links list
		var $section_nav;					// primary navigation
		var $section_twitter;				// latest tweets
		var $section_contributors;			// blog contributors list
		var $section_following;				// followed blogs list
		var $section_pagenav;				// page archive navigation
		var $section_loader;				// dynamic loading indicator
		
		var $_post;							// an ordered array of posts
		
		var $container_posts;				// the outer posts container
		var $container_tmp;					// container for dynamic loading
		
		/* Other necessary items: */
		
		var $root;							// the outermost layout wrapper
		var $window;						// window/viewport object
		
		/*
		 * The posts are processed according to an algorithm that
		 * positions them in either the left or the right column.
		 * These columns are shown on the largest layout.
		 * Therefore we keep track of the height of both columns.
		 */
		var posts_col_left			= 0;	// left column height
		var posts_col_right			= 0;	// right column height
		var posts_processed			= {};	// object of processed posts
		
		/* Variables used for the sticky navigation menu. */
		
		var window_scroll_top;				// viewport vertical scroll amount
		var window_height;					// viewport height
		
		/* Default settings. */
		var defaults				= {
			use_endless_scrolling	: false,
			photoset_gutter_size	: "8px",
			/* Settings that can't be configured using user theme settings. */
			inf_scrolling_margin	: 300	// page load distance from bottom
		};
		var settings				= {};	// container for final settings
		
		/**
		 * Updates the window scroll amount and height variables.
		 */
		self.update_window_info = function()
		{
			window_scroll_top = $window.scrollTop();
			window_height = $window.height();
		}
		
		/**
		 * Binds the screen update triggers (to the scroll and resize events).
		 */
		self.init_update_trigger = function()
		{
			Jikuu.Debug["info"]("Jikuu::Main.init_update_trigger(): adding update callback to window object (scroll, resize)");
			$window.bind("scroll resize", function()
			{
				self.update_layout();
			});
		}
	
		/**
		 * Locates all usable elements on the page and creates jQuery objects
		 * out of them.
		 *
		 * @returns {boolean} true if successful, false if #root element could not be found.
		 */
		self.init_elements = function()
		{
			/* The browser window (used for binding update events). */
			$window = $(window);
		
			/* #root contains all theme-related markup. */
			$root = $("#root");
			if ($root[0]) {
				Jikuu.Debug["log"]("found #root element %o", [$root[0]]);
			}
			else {
				/* When using the Jikuu theme's own HTML, this should never occur. */
				Jikuu.Debug["error"]("Jikuu::Main.init_elements(): couldn't find root element");
				return false;
			}
		
			/* #header contains the title image or text, and the blue line. */
			$header = $("#header", $root);
			/* #title is the container for the title image or text. */
			$title = $("#title", $root);
		
			/* #content contains all posts and blog information. */
			$content = $("#content", $root);
		
			/* #content_sidebar contains all blog information and navigation sections. */
			$content_sidebar = $("#content_sidebar", $root);
			/* #section_me contains the blog description and user picture. */
			$section_me = $("#section_me", $root);
			/* #section_main_nav contains the main navigation, the search form
			 * and any links to custom pages. */
			$section_main_nav = $("#section_main_nav", $root);
			/* #form_search is the search form inside the main navigation. */
			$form_search = $("#form_search", $root);
			/* #section_twitter contains the user's tweets. */
			$section_twitter = $("#section_twitter", $root);
			/* #section_contributors contains a list of other blog members. */
			$section_contributors = $("#section_contributors", $root);
			/* #section_following contains a list of blogs the user follows. */
			$section_following = $("#section_following", $root);
		
			/* #content_main is the wrapper for the main content. */
			$content_main = $("#content_main", $root);
			/* #container_posts contains all posts (and nothing else). */
			$container_posts = $("#container_posts", $root);
			/* #container_nav contains the post navigation (links or a loading indicator). */
			$container_nav = $("#container_nav", $root);
			/* #loader_posts is the loading indicator that's used for infinite scrolling. */
			$loader_posts = $("#loader_posts", $root);
		
			return true;
		}
	
		/**
		 * Waits for all image downloads to commence (to the point where the
		 * image size is available) and then calls a callback.
		 * TODO: test this properly, and possibly remove it if unnecessary
		 */
		self.after_images_loaded = function($el, callback)
		{
			var a, z;
		
			/* List the amount of images we have. */
			var $_img = $("img", $el);
			var amount_total = $_img.length;
			var amount_preloaded = 0;
		
			function check_progress()
			{
				if (amount_preloaded >= amount_total) {
					callback.call();
				}
			}
		
			for (a = 0, z = $_img.length; a < z; ++a) {
				$img = $($_img[a]);
				$img.one("load", function()
				{
					amount_preloaded += 1;
					check_progress();
				})
				.each(function()
				{
					if (this.complete || $img.height() > 0) {
						$(this).trigger("load");
					}
				});
			}
		}
	
		/**
		 * Determines which page type we're currently viewing and then
		 * calls the appropriate functions.
		 * When on the index page, the posts loading and positioning code
		 * is loaded. When on a permalink page, TODO fix description
		 */
		self.init_page_layout = function()
		{
			if (page_type == "index") {
				/*
				 * Index pages: check post info and move them to
				 * the appropriate column.
				 */
				self.after_images_loaded($container_posts, function()
				{
					self.determine_post_positions();
					self.init_photoset_grids();
				});
			}
			else
			if (page_type == "permalink") {
				/* Permalink pages. */
				
			}
		}

		/**
		 * Lists all available posts and retrieves information on their size.
		 * FIXME: first make determine_post_sizes() and then positions
		 */
		self.determine_post_positions = function()
		{
			Jikuu.Debug["log"]("Determining post positions");
			$_post = $("> .post", $container_posts);
			Jikuu.Debug["log"]("Processing %i posts:", [$_post.length]);
			var processed, id, height, pull;
			for (var a = 0, z = $_post.length; a < z; ++a) {
				$post = $($_post[a]);
				id = $post.attr("data-id");
				processed = posts_processed[id];
				if (processed) {
					Jikuu.Debug["log"]("  Post %i is already processed (skipping)", [id]);
					continue;
				}
				height = $post.height();
				$post.removeClass("pull-left");
				$post.removeClass("pull-right");
				if (posts_col_left <= posts_col_right) {
					pull = "pull-left";
					posts_col_left += height;
				}
				else {
					pull = "pull-right";
					posts_col_right += height;
				}
				$post.addClass(pull);
				Jikuu.Debug["log"]("  Post %i has been set to %i", [id, pull]);
				posts_processed[id] = true;
				$post.attr("data-height", height);
			}
		}
	
		/**
		 * Empties out the post positioning cache in order to rebuild it from scratch.
		 */
		self.reset_posts = function()
		{
			posts_processed = {};
			posts_col_left = 0;
			posts_col_right = 0;
		}
	
		/**
		 * Finds and lists fixed elements.
		 */
		self.init_fixed_elements = function()
		{
			Jikuu.Debug["log"]("Initializing fixed elements");
			$_fix_toggle_item = $(".fix-toggle-item", $root);
			self.scan_fixed_elements();
		}
		
		// todo: necessary?
		self.scan_fixed_elements = function()
		{
			//Jikuu.Debug["log"]("Scanning fixed elements");
			$_fix_toggle_item.each(function(n, fix_toggle_item)
			{
				var $fix_toggle_item = $(fix_toggle_item);
				var $fix_gap = $("> .fix-gap", $fix_toggle_item);
				var $fix_content = $("> .fix-content", $fix_toggle_item);
				var $fix_padding = $("> .fix-padding", $fix_toggle_item);
				var p_top = parseInt($fix_padding.css("padding-top"), 10);
				var p_bottom = parseInt($fix_padding.css("padding-bottom"), 10);
				var height = $fix_content.height();
				//Jikuu.Debug["log"]("Element %o height: %d", [$fix_content[0], height]);
				$fix_gap.height(height+"px");
				var offset = $fix_toggle_item.offset().top;
				var toggled = $fix_toggle_item.hasClass("pmode");
				$.data(fix_toggle_item, "fixinfo_state", toggled);
				$.data(fix_toggle_item, "fixinfo", {
					$el: $fix_toggle_item,
					$ct: $fix_content,
					height: height,
					offset: offset,
					p_top: p_top,
					p_bottom: p_bottom
				});
			});
		}
	
		/**
		 * Checks the navigation menu and activates the correct button
		 * if necessary. (Tumblr doesn't set a server-side "active" class to
		 * the menu item where we currently are, so we have to do it with JS.)
		 */
		self.update_menu_items = function()
		{
			var curr_path = window.location.pathname;
			Jikuu.Debug["info"]("Jikuu::Main.update_menu_items(): Current page: %i", [curr_path]);
			$_menu_item = $("ul.nav > li", $section_main_nav);
			$_menu_item.each(function(n, menu_item)
			{
				$menu_item = $(menu_item);
				var $menu_a = $("> a", $menu_item);
				var menu_href = $menu_a.attr("href");
				if (menu_href == curr_path) {
					/* This is the current item. */
					Jikuu.Debug["log"]("Setting menu item %o to active", [menu_item]);
					$menu_item.addClass("active");
				}
			});
		}
		
		/**
		 * Activates the code needed to PHOTOSETS
		 * todo: fix so that processed ones are cached
		 */
		self.init_photoset_grids = function()
		{
			var $photoset_grid, id;
			var gutter = settings.photoset_gutter_size;
			for (var a = 0, z = $_post.length; a < z; ++a) {
				$post = $($_post[a]);
				if ($post.hasClass("photoset")) {
					$photoset_grid = $(".photoset-grid", $post);
					id = $photoset_grid.attr("data-id");
				
					$photoset_grid.photosetGrid({
						highresLinks: true,
						rel: id,
						gutter: gutter,
						onComplete: function()
						{
						}
					});
				}
			}
		}
	
		/**
		 * Detaches and reattached fixed elements such as the main navigation.
		 */
		self.update_fixed_elements = function()
		{
			var fix_toggle_item, data, fixed;
			var $el, $ct, height, offset, p_top, p_bottom;
			for (var a = 0, z = $_fix_toggle_item.length; a < z; ++a) {
				fix_toggle_item = $_fix_toggle_item[a];
				data = $.data(fix_toggle_item, "fixinfo");
				fixed = $.data(fix_toggle_item, "fixinfo_state");
				$el = data.$el;
				$ct = data.$ct;
				height = data.height;
				offset = data.offset;
				p_top = data.p_top;
				p_bottom = data.p_bottom;
				if (window_scroll_top > (offset - p_top)) {
					if (fixed == true) {
						continue;
					}
					$el.addClass("pmode");
					$ct.css({paddingTop: p_top+"px", paddingBottom: p_bottom+"px"});
					fixed = true;
				}
				else {
					if (fixed == false) {
						continue;
					}
					$el.removeClass("pmode");
					$ct.css({paddingTop: 0, paddingBottom: 0});
					fixed = false;
				}
				$.data(fix_toggle_item, "fixinfo_state", fixed);
			}
		}
		
		/**
		 * Updates the screen once.
		 */
		self.update_layout = function()
		{
			self.update_window_info();
			self.update_fixed_elements();
		}
		
		/**
		 * Initializes the user's settings and jumpstarts the code.
		 */
		self.__init__ = function(overrides)
		{
			/* Override default settings with user-supplied ones. */
			settings = defaults;
			for (var key in overrides) {
				settings[key] = overrides[key];
			}
		
			/* Version indicator. */
			Jikuu.Debug["info"]("Jikuu Tumblr Theme v%d.%d%s", [
				layout_version.major,
				layout_version.minor,
				layout_version.trunk == true ? " (trunk)" : ""
			]);
			Jikuu.Debug["info"]("© 2013, Michiel Sikma");
		
			Jikuu.Debug["info"]("Jikuu::Main.__init__(): initializing new Main instance");
		
			/* Initialize all relevant elements. */
			self.init_elements();
			/* Update the menu to highlight the currently active page. */
			self.update_menu_items();
			/* Initialize elements that become fixed on scroll. */
			self.init_fixed_elements();
			/* Initialize the event triggers that update the dynamic elements. */
			self.init_update_trigger();
			/* Initialize page-specific code. */
			self.init_page_layout();
		
			/* All done. Ready for action. */
			Jikuu.Debug["log"]("Done initializing instance");
		}
		self.__init__(overrides);
	})();
	
	/**
	 * Console debugging static function.
	 *
	 * @static
	 */
	Jikuu.Debug = (function()
	{
		var self = this;
		
		/* Global switch for allowing console logging to take place. */
		var permit_debug = true;
		
		/**
		 * Turns debugging on or off. When off, debug calls silently fail.
		 */
		self["permit_debugging"] = function(permit)
		{
			permit_debug = permit;
		}
		
		/**
		 * Info level log.
		 */
		self["info"] = function(str, vars)
		{
			return self["log"](str, vars, "info");
		}
		
		/**
		 * Warning level log.
		 */
		self["warn"] = function(str, vars)
		{
			return self["log"](str, vars, "warn");
		}
		
		/**
		 * Error level log.
		 */
		self["error"] = function(str, vars)
		{
			return self["log"](str, vars, "error");
		}
		
		/**
		 * Prints formatted messages to the console in case there's a console
		 * available. If there's no console, nothing happens.
		 * See the {@link http://getfirebug.com/logging|Firebug docs} for information on formatting log messages.
		 * 
		 * @param {string} str String to print to the console
		 * @param {Array} vars Variables to use for string formatting
		 * @param {string} [func="log"] Severity level of log
		 */
		self["log"] = function(str, vars, func)
		{
			if (permit_debug != true
			||  window.console == null) {
				return;
			}
		
			func = func == null ? "log" : func;
			vars = vars == null ? [] : vars;
			if (vars.constructor.toString().indexOf("Array") == -1) {
				vars = [vars];
			}
			vars.unshift(str);
			console[func].apply(console, vars);
		}
		
		return self;
	})();
	
	/**
	 * Handles dynamic content decoration as the page loads. Every dynamic
	 * item (page navigation, photosets, etc.) passes through here.
	 *
	 * @static
	 */
	Jikuu["Decorator"] = (function()
	{
		var self = this;
		
		/**
		 * Processes a single element.
		 *
		 * @param {string} selector Unique identifier of the element
		 */
		self["add"] = function(selector)
		{
			console.warn("decorated %i", selector);
		}
		
		return self;
	})();
})(jQuery);
