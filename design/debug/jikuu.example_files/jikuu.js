/*
 * Jikuu Tumblr Theme - jQuery Code
 * Copyright (C) 2012, Michiel Sikma <mike@letsdeliver.com>
 * All Rights Reserved
 * Date: 2012/10/21
 *
 * @author Michiel Sikma
 */

$(function()
{
    /* The basics. */
    var $window = $(window);
    var $document = $(document);
    var $root = $("#root");
        
    /* Grab some exported Tumblr theme variables. */
    var settings = window.JikuuSettings;
    
    /* Some other settings, either static or determined by the HTML. */
    settings.use_endless_scrolling = $root.hasClass("endless");
    settings.newpage_margin = 300;  /* Distance for new page load. */
    settings.search_mods = true;    /* Whether to use search modifications. */
    settings.loader_speed = 70;     /* Speed in ms for animated loader image. */
    settings.loader_size = 16;      /* Size in pixels of loader image. */
    settings.loader_frames = 5;     /* Amount of frames in loader image. */
    
    /* Prefix to use for AJAX calls. */
    var url_prefix = window.location.pathname;
    /* Add trailing slash, except if we're on the root. */
    if (url_prefix != "/") {
        url_prefix += "/";
    }
    var $sidebar = $(".subwrapper.sidebar", $root);
    
    if (settings.search_mods) {
        /*
         * Some minor modifications to the search form.
         * When initiating a search, we'll replace the magnifying glass
         * with a loader image. This loader image is animated by changing
         * its background-position.
         */
        var $search = $(".section.search", $sidebar);
        var $search_header = $("h3", $search);
        search_label = $search_header.text();
        var $search_form = $("form", $search);
        var $search_icon = $(".sub", $search_form);
        $search_form.submit(function()
        {
            $search.addClass("loading");
            /* Still execute the search normally. */
            return true;
        });
        /* The timer performing the background-position modification. */
        var search_bg_pos = 0;
        var search_bg_frame = 0;
        var search_timer = setInterval(function()
        {
            search_bg_frame += 1;
            search_bg_pos -= settings.loader_size;
            if (search_bg_frame > settings.loader_frames) {
                search_bg_frame = 0;
                search_bg_pos = 0;
            }
            $search_icon.css({backgroundPosition: search_bg_pos+"px 0"});
        }, settings.loader_speed);
    }
    
    /* First, check if we can even navigate on this page. */
    var can_scroll = $(".subwrapper.nav", $root).length > 0;
    if (settings.use_endless_scrolling && can_scroll) {
        var is_loading = false;
        var error = false;
        var end = false;
        var page_n = 1;
        
        /* First, hide the regular navigation. */
        var $nav = $(".subwrapper.nav", $root);
        var $jumppag = $(".jumppag", $nav);
        $jumppag.hide();
        
        /* Set up the loader. */
        var $loader = $(".loader", $nav);
        var $loader_error = $(".error", $loader);
        var $loader_done = $(".done", $loader);
        var $loader_icon = $(".inner", $loader);
        var loader_bg_pos = 0;
        var loader_bg_frame = 0;
        var loader_timer = setInterval(function()
        {
            loader_bg_frame += 1;
            loader_bg_pos -= settings.loader_size;
            if (loader_bg_frame > settings.loader_frames) {
                loader_bg_frame = 0;
                loader_bg_pos = 0;
            }
            if (end == false) {
                $loader_icon.css({backgroundPosition: loader_bg_pos+"px 0"});
            }
        }, settings.loader_speed);
        
        /* Create a temporary container. */
        var $tmp_container = $("<div id=\"tmp_container\"></div>").appendTo($root);
        var $post_container = $("#post_container");
        
        /* As soon as the user scrolls within range, load the next page. */
        $document.bind("scroll", function()
        {
            var scroll_position = $window.scrollTop();
            var document_height = $document.height();
            var viewport_height = $window.height();
            if (scroll_position - (document_height - viewport_height) >= -settings.newpage_margin && is_loading == false && error == false && end == false) {
                page_n += 1;
                is_loading = true;
                $loader.css({visibility: "visible"});
                $loader.removeClass("error");
                $loader_error.text("");
                var url = url_prefix+"page/"+page_n+" #post_container > .post";
                $tmp_container.load(url, function(response, status, xhr)
                {
                    is_loading = false;
                    $loader.css({visibility: "hidden"});
                    if (status == "error") {
                        $loader.addClass("error");
                        $loader_error.text("Couldn't load next page.");
                        error = true;
                    }
                    $posts = $(".post", this);
                    if ($posts.length == 0) {
                        /* We've reached the end. */
                        end = true;
                        $loader.css({visibility: "visible"});
                        $loader_done.show();
                    }
                    
                    $posts.appendTo($post_container);
                    $tmp_container.empty();
                    
                    /*
                     * Now execute all scripts in the posts HTML.
                     * We use a bit of a hack for this because jQuery
                     * strips out the <script> tags as soon as you make a
                     * more specific jQuery object
                     * (e.g. $(response).find("#post_container") won't work).
                     *
                     * So instead we match the entire posts section manually
                     * using a regex and then iterate over the script tags.
                     */
                    var posts_html = response.match(/<\!-- jikuu_post_container start -->(.|\s)*?<\!-- jikuu_post_container end -->/mi);
                    $(posts_html[0]).filter("script").each(function()
                    {
                        /* Evaluate every script in the global namespace. */
                        $.globalEval(this.text || this.textContent || this.innerHTML || "");
                    });
                    
                    /*
                     * In case we're using Google Analytics,
                     * report this page load.
                     */
                    if (typeof window._gaq != 'undefined') {
                        _gaq.push(['_trackPageview', url]);
                    }
                });
            }
        });
    }
});
