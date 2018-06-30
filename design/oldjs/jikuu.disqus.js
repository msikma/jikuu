/**
 * @preserve Disqus widget code.
 * Cleaned up minified code.
 * TESTING
 */

var disqus_domain;
var disqus_shortname;

window["DISQUSWIDGETS"] = (function()
{
	/* Class object. */
	var disq_obj = {};
	
	/* Reference to the <head> (or <body> in case it's missing). */
	var head_element = document.getElementsByTagName("HEAD")[0] || document.body;
	
	/* Disqus nodes found in the document. */
	var disq_node_idx = 0;
	var disq_nodes = {};
	var disq_vars = {
		identifier: 1,
		url: 2,
		slug: 3
	};
	
	disq_obj.domain = "disqus.com";
	disq_obj.forum = "";
	
	disq_obj.getCount = function()
	{
		// Anchor dom elements.
		var anchors = document.getElementsByTagName("A"), anchor;
		
		// Anchor attributes and settings.
		var id, slug, type, value;
		var a;
		for (a = 0; a < anchors.length; a++) {
			// Check to see if this is a Disqus anchor.
			if (anchors[a].href.indexOf("#disqus_thread") >= 0) {
				anchor = anchors[a];
				type = void 0;
				value = void 0;
				
				if (anchor.hasAttribute) {
					id = anchor.hasAttribute("data-disqus-identifier");
					slug = anchor.hasAttribute("data-disqus-slug");
				}
				else {
					id = anchor.getAttribute("data-disqus-identifier") !== null;
					slug = anchor.getAttribute("data-disqus-slug") !== null;
				}
				
				if (id) {
					type = disq_vars.identifier;
					value = anchor.getAttribute("data-disqus-identifier");
				}
				else if (slug) {
					type = disq_vars.slug;
					value = anchor.getAttribute("data-disqus-slug");
				}
				else {
					type = disq_vars.url;
					value = anchor.href.replace("#disqus_thread", "");
				}
				
				disq_nodes[disq_node_idx++] = {
					element: anchor,
					type: type,
					value: value
				};
			}
		}
		
		// Run through the arguments and format them properly.
		var arg;
		var arg_list = [];
		for (arg in disq_nodes) {
			if (disq_nodes.hasOwnProperty(arg)) {
				arg_list.push(encodeURIComponent(arg)+"="+encodeURIComponent(disq_nodes[arg].type)+","+encodeURIComponent(disq_nodes[arg].value));
			}
		}
		
		// Create script elements and insert them into the head.
		// The arguments are split into chunks of 10.
		var script_el;
		var idx_from = 0;
		var idx_to = 10;
		for (arg = arg_list.slice(idx_from, idx_to); arg.length > 0;) {
			script_el = document.createElement("script");
			script_el.type = "text/javascript";
			script_el.async = true;
			script_el.src = document.location.protocol+"//"+disq_obj.forum+"."+disq_obj.domain+"/count-data.js?q=1&"+arg.join("&");
			head_element.appendChild(script_el);
			idx_from += 10;
			idx_to += 10;
			arg = arg_list.slice(idx_from, idx_to);
		}
	}
	
	/*
	 * Generate a comment/reaction count string and insert it into the dom.
	 */
	disq_obj.displayCount = function(items)
	{
		var item;
		var el;
		var plr_str;
		var count;
		
		var str_comments_0 = items.text.comments.zero;
		var str_comments_1 = items.text.comments.one;
		var str_comments_m = items.text.comments.multiple;
		
		var str_reactions_0 = items.text.reactions.zero;
		var str_reactions_1 = items.text.reactions.one;
		var str_reactions_m = items.text.reactions.multiple;
		
		var str_and = items.text.and;
		
		var a;
		for (a = 0; a < items.counts.length; a++) {
			if (item = items.counts[a], el = disq_nodes[item.uid]) {
				// Determine the correct singular/plural form for the comments.
				if (item.comments === 0) {
					plr_str = str_comments_0;		// zero comments
				}
				else if (item.comments == 1) {
					plr_str = str_comments_1;		// one comment
				}
				else {
					plr_str = str_comments_m;		// multiple comments
				}
				
				// Add the comment count to the string.
				count = plr_str.replace("{num}", item.comments);
				
				// Determine the correct singular/plural form for the reactions.
				if (item.reactions === 0) {
					plr_str = str_reactions_0;		// zero reactions
				}
				else if (item.reactions == 1) {
					plr_str = str_reactions_1;		// one reaction
				}
				else {
					plr_str = str_reactions_m;		// multiple reactions
				}
				
				// Add the reactions count to the string, if we're showing them.
				if (items.showReactions) {
					if (plr_str !== "") {
						count += " "+str_and+" "+plr_str.replace("{num}", item.reactions);
					}
				}
				
				// Save to the document.
				el.element.innerHTML = count;
			}
		}
	}
	return disq_obj;
})();

// Activate the Disqus code in case we have a domain.
(function()
{
	if (typeof disqus_domain != "undefined") {
		DISQUSWIDGETS.domain = disqus_domain;
	}
	DISQUSWIDGETS.forum = disqus_shortname;
	DISQUSWIDGETS.getCount();
})();

/*

Original minified code (pretty printed by Closure Compiler):



var DISQUSWIDGETS, disqus_domain, disqus_shortname;
typeof DISQUSWIDGETS == "undefined" && (DISQUSWIDGETS = function() {
  var c = {}, m = document.getElementsByTagName("HEAD")[0] || document.body, n = 0, h = {}, k = {identifier:1, url:2, slug:3};
  c.domain = "disqus.com";
  c.forum = "";
  c.getCount = function() {
	var a, b, l = [], e = 0, g = 10;
	b = document.getElementsByTagName("A");
	for(var f = 0;f < b.length;f++) {
	  if(b[f].href.indexOf("#disqus_thread") >= 0) {
		var d = b[f], i = void 0, j = void 0;
		(d.hasAttribute ? d.hasAttribute("data-disqus-identifier") : d.getAttribute("data-disqus-identifier") !== null) ? (i = k.identifier, j = d.getAttribute("data-disqus-identifier")) : (d.hasAttribute ? d.hasAttribute("data-disqus-slug") : d.getAttribute("data-disqus-slug") !== null) ? (i = k.slug, j = d.getAttribute("data-disqus-slug")) : (i = k.url, j = d.href.replace("#disqus_thread", ""));
		h[n++] = {element:d, type:i, value:j}
	  }
	}
	for(a in h) {
	  h.hasOwnProperty(a) && l.push(encodeURIComponent(a) + "=" + encodeURIComponent(h[a].type) + "," + encodeURIComponent(h[a].value))
	}
	for(a = l.slice(e, g);a.length > 0;) {
	  b = document.createElement("script"), b.type = "text/javascript", b.async = !0, b.src = document.location.protocol + "//" + c.forum + "." + c.domain + "/count-data.js?q=1&" + a.join("&"), m.appendChild(b), e += 10, g += 10, a = l.slice(e, g)
	}
  };
  c.displayCount = function(a) {
	for(var b, c, e, g, f = 0;f < a.counts.length;f++) {
	  if(b = a.counts[f], c = h[b.uid]) {
		e = b.comments === 0 ? a.text.comments.zero : b.comments == 1 ? a.text.comments.one : a.text.comments.multiple, g = e.replace("{num}", b.comments), a.showReactions && (e = b.reactions === 0 ? a.text.reactions.zero : b.reactions == 1 ? a.text.reactions.one : a.text.reactions.multiple, e !== "" && (g += " " + a.text.and + " " + e.replace("{num}", b.reactions))), c.element.innerHTML = g
	  }
	}
  };
  return c
}());
(function() {
  if(typeof disqus_domain != "undefined") {
	DISQUSWIDGETS.domain = disqus_domain
  }
  DISQUSWIDGETS.forum = disqus_shortname;
  DISQUSWIDGETS.getCount()
})();

*/