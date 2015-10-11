/**
 * @preserve Jikuu Tumblr Theme - Layout Code
 * Copyright (C) {{COPYRIGHT_YEAR}}, Michiel Sikma <mike@letsdeliver.com>
 * All Rights Reserved
 * Build date: {{BUILD_DATE}}
 */
/** 
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
	/*
	 * In order to use Moment.js in any namespace,
	 * we link it with the window object.
	 */
	window["moment"] = moment;
	
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
		var $section_twitter_content;		// tweets html container
		var $section_contributors;			// blog contributors list
		var $section_following;				// followed blogs list
		var $section_pagenav;				// page archive navigation
		var $section_loader;				// dynamic loading indicator
		
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
		var _post;							// an ordered array of posts
		var posts_processed			= {};	// list of processed post IDs
		var posts_col_left			= 0;	// left column height
		var posts_col_right			= 0;	// right column height
		
		/* Variables used for the sticky navigation menu. */
		
		var window_scroll_top;				// viewport vertical scroll amount
		var window_height;					// viewport height
		
		/* Other variables. */
		var twitter_content;				// html content for Twitter section
		var moment;							// Moment instance
		
		/* Default settings. */
		var layout_defaults			= {
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
			$window = $(window);
			$window.bind("scroll resize", function()
			{
				self.update_layout();
			});
		}
		
		/**
		 * Empties out the post processing cache
		 * in order to rebuild it from scratch.
		 */
		self.reset_posts = function()
		{
			Jikuu.Debug["info"]("Jikuu::Main.reset_posts(): resetting post processing cache");
			posts_processed = {};
			posts_col_left = 0;
			posts_col_right = 0;
		}
		
		/**
		 * Creates the Twitter section.
		 *
		 * @param {Object} item_info Item information and jQuery object
		 */
		self.add_twitter_section = function(item_info)
		{
			/* Has the Twitter section been decorated yet? */
			if ($section_twitter) {
				return false;
			}
			$section_twitter = item_info.$item;
			$section_twitter_content = $("> div.twitter-container", $section_twitter);
			self.check_twitter_status();
		}
		
		/**
		 * Updates the Twitter section content.
		 *
		 * @param {Object} tweets Twitter statuses as returned by the API
		 */
		self["add_tweets"] = function(tweets)
		{
			Jikuu.Debug["log"]("processing Twitter API content");
			var html = tweets.output_html;
			
			/*
			 * Save the HTML, then check whether we can add it yet.
			 * if we can't, we'll add it as soon as the section arrives.
			 */
			twitter_content = html;
			
			self.check_twitter_status();
		}
		
		/**
		 * Checks whether we can already add tweets to the Twitter section.
		 */
		self.check_twitter_status = function()
		{
			/*
			 * Only add the content if we have a decorated section
			 * and a non-null Twitter HTML content variable.
			 */
			if ($section_twitter && twitter_content != null) {
				Jikuu.Main["update_twitter_section"](twitter_content);
			}
		}
		
		self.update_twitter_section = function(html)
		{
			Jikuu.Debug["log"]("adding Twitter HTML content to the section");
			$section_twitter_content.html(html);
		}
		
		/**
		 * Turns a link into an HTML anchor. Used by the Twitter section.
		 *
		 * @param {string} url A URL
		 */
		self._anchor_url = function(url)
		{
			return '<a href="'+url+'">'+url+'</a>';
		}
		
		/**
		 * Turns a Twitter @-mention into a reply link HTML anchor.
		 *
		 * @param {string} reply An @-mention from the content of a tweet
		 */
		self._reply_link = function(reply)
		{
			return reply.charAt(0)+'<a href="http://twitter.com/'+reply.substring(1)+'">'+reply.substring(1)+'</a>';
		}
		
		/**
		 * Generates an HTML string out of a tweet object from the API.
		 *
		 * @param {Object} tweet A tweet object as given by the API
		 */
		self._get_tweet_html = function(tweet)
		{
			var id, status, username, rel_time, html;
			id = tweet.id_str;
			status = tweet.text
				.replace(/((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, self._anchor_url)
				.replace(/\B@([_a-z0-9]+)/ig, self._reply_link);
			username = tweet.user.screen_name;
			rel_time = self._get_rel_time(tweet.created_at);
			
			html = (
				'<li class="tweet">'+
				'	<span class="status">'+status+'</span> <a class="rel-time" href="http://twitter.com/'+username+'/statuses/'+id+'">'+rel_time+'</a>'+
				'</li>'
			);
			
			return html;
		}
		
		/**
		 * Creates the loader section.
		 *
		 * @param {Object} item_info Item information and jQuery object
		 */
		self.add_loader_section = function(item_info)
		{
			/* Did we already create the section? */
			if ($section_loader) {
				return false;
			}
			$section_loader = item_info.$item;
			var txt_loading = Jikuu.Settings.i18n.strings.loading;
			var txt_no_more_posts = Jikuu.Settings.i18n.strings.no_more_posts;
			var inner_html = (
				'<div class="inner">'+txt_loading+'</div>'+
				'<div class="msg error"></div>'+
				'<div class="msg done">'+txt_no_more_posts+'</div>'
			);
			$section_loader.html(inner_html);
		}
		
		/**
		 * Adds a section to the layout.
		 *
		 * @param {Object} item_info Item information and jQuery object
		 */
		self.add_section = function(item_info)
		{
			if (item_info.section_type == "loader") {
				self.add_loader_section(item_info);
			}
			if (item_info.section_type == "twitter") {
				self.add_twitter_section(item_info);
			}
		}
		
		/**
		 * Adds a post to the layout.
		 *
		 * @param {Object} item_info Item information and jQuery object
		 */
		self.add_post = function(item_info)
		{
			console.warn("add post %o", item_info);
		}
		
		/**
		 * Adds a container to the layout.
		 *
		 * @param {Object} item_info Item information and jQuery object
		 */
		self.add_container = function(item_info)
		{
			console.warn("add container %o", item_info);
		}
		
		/**
		 * Initializes Moment for relative time formatting.
		 */
		self.init_moment = function()
		{
			var moment = window["moment"];
			var a = moment.unix(1318781876);
						console.log(a.fromNow());
		}
		
		/**
		 * Checks the navigation menu and activates the correct button
		 * if necessary. (Tumblr doesn't set a server-side "active" class to
		 * the menu item where we currently are, so we have to do it with JS.)
		 */
		self.___________update_menu_items = function()
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
		self._____________init_photoset_grids = function()
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
		self.____________update_fixed_elements = function()
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
		 * Updates information about the viewport, then runs through all
		 * layout update jobs and performs them one by one.
		 */
		self.update_layout = function()
		{
			self.update_window_info();
		}
		
		/**
		 * Takes in the current request's settings and page information
		 * and merges them with the defaults.
		 */
		self.configure = function(user_settings)
		{
			/* Override default settings with user-supplied ones. */
			settings = user_settings;
			settings.layout = layout_defaults;
			for (var key in user_settings.layout) {
				settings.layout[key] = user_settings.layout[key];
			}
			
			/* Save a copy. */
			Jikuu.Settings = settings;
			
			/* Print the layout version. */
			self.print_version(settings.version);
		}
		
		/**
		 * Prints the current version of the layout and the copyright.
		 */
		self.print_version = function(layout_version)
		{
			Jikuu.Debug["info"]("Jikuu Tumblr Theme v%d.%d%s", [
				layout_version.major,
				layout_version.minor,
				layout_version.trunk == true ? " (trunk)" : ""
			]);
			Jikuu.Debug["info"]("© 2013, Michiel Sikma <mike@letsdeliver.com>");
		}
		
		/**
		 * Initializes the user's settings and jumpstarts the code.
		 */
		self.__init__ = function()
		{
			/* Initialize the triggers that update the layout. */
			self.init_update_trigger();
			/* Initialize Moment for localized relative time formatting. */
			self.init_moment();
		}
		self.__init__();
		
		return self;
	})();
	
	/**
	 * Console debugging function.
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
		 * @param {string} selector Element selector
		 */
		self["add"] = function(selector)
		{
			Jikuu.Debug["info"]("Jikuu::Decorator.add(): processing selector \"%i\"", [selector]);
			
			var item_info = self.get_item_info(selector);
			if (item_info == null) {
				return;
			}
			
			if (item_info.is_section) {
				Jikuu.Main.add_section(item_info);
			}
			if (item_info.is_post) {
				Jikuu.Main.add_post(item_info);
			}
			if (item_info.is_container) {
				Jikuu.Main.add_container(item_info);
			}
		}
		
		/**
		 * Creates a jQuery object out of an item selector and retrieves
		 * information about its purpose.
		 *
		 * @param {string} selector Element selector
		 */
		self.get_item_info = function(selector)
		{
			var $item = $(selector);
			
			/* We can only decorate one element at a time. */
			if ($item.length > 1) {
				Jikuu.Debug["error"]("Jikuu::Decorator.get_item_info(): selector \"%i\" contained multiple node matches; needs to be one", [selector]);
				return;
			}
			
			var item_info = {
				is_section: false,
				is_post: false,
				is_container: false,
				section_type: null,
				post_id: null,
				container_type: null
			};
			
			/* Is this a section? */
			var name = selector.slice(1);
			var bits = name.split("_");
			if (bits[0] == "section") {
				item_info.is_section = true;
				item_info.section_type = bits[1];
			}
			/* Is this a post? */
			if (bits[0] == "post") {
				item_info.is_post = true;
				item_info.post_id = bits[1];
			}
			/* Is this a container? */
			if (bits[0] == "container") {
				item_info.is_container = true;
				item_info.container_type = bits[1];
			}
			
			/* Save the jQuery object. */
			item_info.$item = $item;
			
			return item_info;
		}
		
		return self;
	})();
})(jQuery);
