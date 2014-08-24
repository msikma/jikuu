#!/usr/bin/make -f
#
# Jikuu Tumblr Theme - Build Script
# (C) 2014, Michiel Sikma <mike@letsdeliver.com>

title     = jikuu
rev       = `git rev-list HEAD --count`
author		= Michiel Sikma <michiel@sikma.org>
website		= http:\/\/google\.com\/

# Used for copyright notices
curr_year = $(shell date +%Y)
curr_date = $(shell date +%Y-%m-%d\ %H:%M:%S)

# Base URLs (without trailing slash)
url_test  = http:\/\/michiel\/tumblr_themes
url_live  = http:\/\/tumblr\.demandfiles\.com

# Directories
base_dir  = $(shell dirname "${BASH_SOURCE[0]}")/
dir_scss  = $(base_dir)static/scss/
dir_js    = $(base_dir)static/js/
dir_tools = $(base_dir)tools/
dir_build = $(base_dir)build/

has_sass	= $(shell which sass)

# Color sequences
echo_cyan_b   = "\033[1;36m"
echo_green    = "\033[0;32m"
echo_purple   = "\033[0;35m"
echo_yellow   = "\033[0;33m"
echo_yellow_b = "\033[1;33m"
echo_end      = "\033[0m"

.PHONY: jikuu clean css

all: css js html copyright archive

html: $(dir_build)jikuu.tumblr.html
css: $(dir_build)jikuu.min.css
js: $(dir_build)jikuu.min.js
copyright: $(dir_build)COPYRIGHT
archive: $(dir_build)build-$(title)-$(rev).tbz

$(dir_build)build-$(title)-$(rev).tbz:
	@echo $(rev)
	@echo "a" > "$(dir_build)
	cp x x
	@echo $(echo_purple)"Creating release archive..."$(echo_end)
	rm -f "$(base_dir)build/"*.tbz
	tar -c "$(dir_build)" | bzip2 > "$(dir_build)build-$(title)-$(rev).tbz"
	@echo $(echo_yellow)"Release archive created as "$(echo_yellow_b)"$(dir_build)build-$(title)-$(rev).tbz"$(echo_yellow)"."$(echo_end)

$(dir_build)COPYRIGHT:
	cp $(base_dir)COPYRIGHT $(dir_build)COPYRIGHT

$(dir_build)jikuu.tumblr.html:
	@echo $(echo_purple)"Putting together HTML..."$(echo_end)
	@echo $(echo_green)"Removing development content from the HTML"$(echo_end)
	php "$(dir_tools)xbswitch.php" \
    --to-live \
    --quiet \
    --in="$(base_dir)jikuu.tumblr.html" \
    --out="$(base_dir)build/jikuu.tumblr.html"
	@echo $(echo_green)"Performing string replacements"$(echo_end)
	for f in "$(base_dir)build/"*.html; do \
    if [ ! -f $f ]; then \
        continue; \
    fi; \
    sed "s/{{AUTHOR}}/$(author)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{WEBSITE}}/$(website)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{BUILD_DATE}}/$(curr_date)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{COPYRIGHT_YEAR}}/$(curr_year)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/$(url_test)/$(url_live)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
  done

$(dir_build)jikuu.min.css:
	@echo $(echo_purple)"Building CSS..."$(echo_end)
	@# check if sass exists
	@command -v sass >/dev/null 2>&1 || \
	  echo $(echo_yellow)"Jikuu requires "$(echo_yellow_b)"sass"$(echo_yellow)" to be built. See <http://sass-lang.com/> for install instructions."$(echo_end); \
	mkdir -p "$(base_dir)build"
	sass --style compressed $(dir_scss)jikuu.scss $@

$(dir_build)jikuu.min.js:
	@echo $(echo_purple)"Building JS..."$(echo_end)
	mkdir -p "$(base_dir)build/tmp"
	java -jar "$(dir_tools)vendor/closure-compiler.jar" \
    --js "$(dir_js)jikuu.js" \
    --js_output_file "$(base_dir)build/tmp/jikuu.min.js" \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --warning_level QUIET
	java -jar "$(base_dir)$(dir_tools)vendor/closure-compiler.jar" \
    --js "$(dir_js)moment/moment.js" \
    --js "$(dir_js)moment/langs/"* \
    --js_output_file "$(dir_build)tmp/moment.min.js" \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --warning_level QUIET
	@echo $(echo_green)"Combining files"$(echo_end)
	cat "$(dir_js)zepto/zepto.min.js" \
    "$(dir_build)tmp/moment.min.js" \
    "$(dir_build)tmp/jikuu.min.js" > \
    $@
	@echo $(echo_green)"Removing temp files"$(echo_end)
	rm -rf "$(base_dir)build/tmp"
	@echo $(echo_green)"Performing string replacements"$(echo_end)
	for f in "$(base_dir)build/"*.js; do \
    if [ ! -f $f ]; then \
        continue; \
    fi; \
    sed "s/{{AUTHOR}}/$(author)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{WEBSITE}}/$(website)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{BUILD_DATE}}/$(curr_date)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{COPYRIGHT_YEAR}}/$(curr_year)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/$(url_test)/$(url_live)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
  done

clean:
	@echo $(echo_green)"Removing previous build"$(echo_end)
	rm -rf "$(dir_build)"

jikuu:
	@echo $(echo_cyan_b)"Jikuu Tumblr Theme - Build Script"$(echo_end)
	cp z z
	@#
	@# remove previous build
	@#
	@echo $(echo_green)"Emptying ./build directory and removing previous build.tbz"$(echo_end)
	mkdir -p "$(base_dir)build"
	rm -rf "$(base_dir)build/"*
	mkdir "$(base_dir)build/tmp"
	rm -f "$(base_dir)build.tbz" &> /dev/null
	@#
	@# to preserve the YUI style licenses, perform a replacement
	@# on our source files to turn them into closure-style licenses
	@#
	cp "$(base_dir)$(dir_js)"*.js "$(base_dir)build/tmp/"
	for f in "$(base_dir)build/tmp/"*.js; do \
    if [ ! -f $f ]; then \
        continue; \
    fi; \
    sed "s/\/\*!/\/** @preserve/g" "$$f" > "$$f.tmp"; \
    mv "$$f.tmp" "$$f"; \
  done
	@echo $(echo_green)"Processing and minifying the theme files:"$(echo_end)
	@#
	@# javascript pass
	@#
	@echo $(echo_purple)"  Compiling Javascript..."$(echo_end)
	java -jar "$(base_dir)$(dir_tools)closure-compiler.jar" \
    --js "$(base_dir)build/tmp/jquery.photoset-grid.js" \
    --js "$(base_dir)build/tmp/jikuu.disqus.js" \
    --js "$(base_dir)build/tmp/jikuu.js" \
    --js_output_file "$(base_dir)build/tmp/jikuu.min.js" \
    --compilation_level ADVANCED_OPTIMIZATIONS \
    --warning_level QUIET
	java -jar "$(base_dir)$(dir_tools)closure-compiler.jar" \
    --js "$(base_dir)$(dir_js)moment-with-langs.min.js" \
    --js_output_file "$(base_dir)build/tmp/moment.min.js" \
    --compilation_level SIMPLE_OPTIMIZATIONS \
    --warning_level QUIET
	@#
	@# css pass
	@#
	@echo $(echo_purple)"  Compiling CSS..."$(echo_end)
	java -jar "$(base_dir)$(dir_tools)yuicompressor-2.4.7.jar" \
    "$(base_dir)$(dir_css)"*.css \
    -o "$(base_dir)build/jikuu.min.css" \
    --line-break 1000 \
    --charset utf8 \
    --type css > /dev/null
	@#
	@# png pass
	@#
	@echo $(echo_purple)"  Crushing PNG..."$(echo_end)
	"$(base_dir)$(dir_tools)pngcrush" \
    -d build \
    -brute \
    -l 9 \
    -q \
    -text b author "Michiel Sikma" \
    -text b copyright "(C) $(curr_year)" \
    "$(base_dir)$(dir_css)jikuu.png"
	@#
	@# combine jQuery and the other JS files into one
	@#
	@echo $(echo_green)"Adding minified jQuery to the Javascript"$(echo_end)
	cat "$(base_dir)js/jquery.min.js" \
    "$(base_dir)build/tmp/moment.min.js" \
    "$(base_dir)build/tmp/jikuu.min.js" > \
    "$(base_dir)build/jikuu.min.js"
	@#
	@# remove the testing css/js blocks from the HTML
	@#
	@echo $(echo_green)"Removing development content from the HTML"$(echo_end)
	php "$(base_dir)tools/xbswitch.php" \
    --to-live \
    --quiet \
    --in="$(base_dir)jikuu.tumblr.html" \
    --out="$(base_dir)build/jikuu.tumblr.html"
	@#
	@# all files that don't need any special processing
	@# 
	cp "$(base_dir)COPYRIGHT" "$(base_dir)build/"
	@#
	@# perform some string replacements on the output
	@#
	echo $(echo_green)"Performing string replacements"$(echo_end)
	for f in "$(base_dir)build/"*.css \
  "$(base_dir)build/"*.js \
  "$(base_dir)build/"*.html; do \
    if [ ! -f $f ]; then \
        continue; \
    fi; \
    sed "s/{{BUILD_DATE}}/$(curr_date)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/{{COPYRIGHT_YEAR}}/$(curr_year)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
    sed "s/$(url_test)/$(url_live)/g" "$$f" > "$$f.tmp" && mv "$$f.tmp" "$$f"; \
  done
	@#
	@# spill on you table; clean it up
	@#
	@echo $(echo_green)"Cleaning up"$(echo_end)
	rm -rf "$(base_dir)build/tmp"
	@#
	@# create an archive, too
	@#
	@echo $(echo_green)"Creating archive"$(echo_end)
	@#
	@# remove OSX's .DS_Store garbage
	@#
	rm -f "$(base_dir)build/.DS_Store" &> /dev/null
	tar -c "$(base_dir)build" | bzip2 > "$(base_dir)build-$(vendor)-$(title)-$(rev).tbz"
	@echo $(echo_yellow_b)"Build complete. The files are in ./build/ and a build-$(vendor)-$(title)-$(rev).tbz archive has been created."$(echo_end)
