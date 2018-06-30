#!/usr/bin/env bash

# Jikuu Tumblr Theme - Build Script
# (C) 2013, Michiel Sikma <mike@letsdeliver.com>

base_dir=`dirname "${BASH_SOURCE[0]}"`
curr_year=`date +%Y`
curr_date=`date +%Y-%m-%d\ %H:%M:%S`

# these should be without trailing slash
base_url_testing="http:\/\/michiel\/tumblr_themes"
base_url_live="http:\/\/michiel\/tumblr_themes"
#base_url_live="http:\/\/tumblr\.demandfiles\.com"

# ----------------------------------------------------------------------

echo -e "\033[1;36mJikuu Tumblr Theme - Build Script\033[0m"

# remove previous build
echo -e "\033[0;32mEmptying $base_dir/build directory and removing previous build.tbz\033[0m"
mkdir -p "$base_dir/build"
rm -rf "$base_dir/build/"*
mkdir "$base_dir/build/tmp"
rm "$base_dir/build.tbz" &> /dev/null

# to preserve the YUI style licenses, perform a replacement
# on our source files to turn them into closure-style licenses
cp "$base_dir/js/"*.js "$base_dir/build/tmp/"
for f in "$base_dir/build/tmp/"*.js; do
  if [ ! -f $f ]; then
    continue
  fi
  sed "s/\/\*!/\/** @preserve/g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done

echo -e "\033[0;32mProcessing and minifying the theme files:\033[0m"

# javascript pass
echo -e "\033[0;35m  Compiling Javascript...\033[0m"

java -jar "$base_dir/tools/closure-compiler.jar" \
  --js "$base_dir/build/tmp/jquery.photoset-grid.js" \
  --js "$base_dir/build/tmp/jikuu.disqus.js" \
  --js "$base_dir/build/tmp/jikuu.js" \
  --js_output_file "$base_dir/build/tmp/jikuu.min.js" \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --warning_level QUIET
#  --formatting pretty_print \

java -jar "$base_dir/tools/closure-compiler.jar" \
  --js "$base_dir/js/moment-with-langs.min.js" \
  --js_output_file "$base_dir/build/tmp/moment.min.js" \
  --compilation_level SIMPLE_OPTIMIZATIONS \
  --warning_level QUIET

# css pass
echo -e "\033[0;35m  Compiling CSS...\033[0m"

java -jar "$base_dir/tools/yuicompressor-2.4.7.jar" \
  "$base_dir/css/"*.css \
  -o "$base_dir/build/jikuu.min.css" \
  --line-break 1000 \
  --charset utf8 \
  --type css > /dev/null

# png pass
echo -e "\033[0;35m  Crushing PNG...\033[0m"
"$base_dir/tools/pngcrush" \
  -d build \
  -brute \
  -l 9 \
  -q \
  -text b author "Michiel Sikma" \
  -text b copyright "(C) $curr_year" \
  "$base_dir/css/jikuu.png"

# combine jQuery and the other JS files into one
echo -e "\033[0;32mAdding minified jQuery to the Javascript\033[0m"
cat "$base_dir/js/jquery.min.js" "$base_dir/build/tmp/moment.min.js" "$base_dir/build/tmp/jikuu.min.js" > "$base_dir/build/jikuu.min.js"

# remove the testing css/js from the HTML
echo -e "\033[0;32mRemoving development content from the HTML\033[0m"
php "$base_dir/tools/xbswitch.php" \
  --to-live \
  --quiet \
  --in="$base_dir/jikuu.tumblr.html" \
  --out="$base_dir/build/jikuu.tumblr.html"

# all files that don't need any special processing
cp "$base_dir/COPYRIGHT" "$base_dir/build/"

# perform some string replacements on the output
echo -e "\033[0;32mPerforming string replacements\033[0m"
for f in "$base_dir/build/"*.css \
         "$base_dir/build/"*.js \
         "$base_dir/build/"*.html; do
  if [ ! -f $f ]; then
    continue
  fi
  sed "s/{{BUILD_DATE}}/$curr_date/g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  sed "s/{{COPYRIGHT_YEAR}}/$curr_year/g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
  sed "s/$base_url_testing/$base_url_live/g" "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done

# spill on you table; clean it up
echo -e "\033[0;32mCleaning up\033[0m"
rm -rf "$base_dir/build/tmp"

# create an archive, too
echo -e "\033[0;32mCreating archive\033[0m"
rm "$base_dir/build/.DS_Store" &> /dev/null
tar -c "$base_dir/build" | bzip2 > "$base_dir/build.tbz"

echo -e "\033[1;33mBuild complete. The files are in $base_dir/build/ and a build.tbz archive has been created.\033[0m"
