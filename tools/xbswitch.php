#!/usr/bin/php
<?php

error_reporting(0);
define('EOL',						PHP_EOL);
define('XBLOCK_TEST_START',			'{xblock:Test}');
define('XBLOCK_TEST_END',			'{/xblock:Test}');
define('XBLOCK_LIVE_START',			'{xblock:Live}');
define('XBLOCK_LIVE_END',			'{/xblock:Live}');

/* Usage; will be printed in case we don't have valid command line options. */
$txt_title = trim(<<<TXT_TITLE
xbswitch 0.1
(C) 2013, Michiel Sikma <michiel@sikma.org>

TXT_TITLE
);
$txt_usage = trim(<<<TXT_USAGE

Usage:
  xbswitch --to-test --in="input.html" [--out="output.html"] [--quiet]
  xbswitch --to-live --in="input.html" [--out="output.html"] [--quiet]
  xbswitch --help
TXT_USAGE
);

/* Input HTML example. */
$txt_help = trim(<<<TXT_HELP
Explanation:
  This program is used to switch an HTML file between testing resources
  (such as non-minified CSS and JS files) and live testing resources.
  You can use it after minifying your files to automatically rewrite
  your HTML to include only the new file links.

  The two sections--testing and live--are marked by the use of a tag
  called an 'xblock'. See the example below to see how to use it.
  This was originally built for Tumblr themes, so the syntax looks the same.

  One of either --to-test or --to-live is required. You'll most likely want
  to use --to-live, in order to delete the testing xblocks and uncomment
  the live xblocks. Either way, the xblocks will be removed from the document.
  
  Using --quiet prevents the script from showing a report afterwards.
  This report is not shown when outputting to stdout.
  
  An xblock needs to be on its own line, because the entire line is going
  to be removed. So the comment tags should naturally be on the same line.

Example input:
  <link rel="shortcut icon" href="favicon.ico" />
  <!-- {xblock:Test} -->
  <link rel="stylesheet" href="reset.css" type="text/css" />
  <link rel="stylesheet" href="layout.css" type="text/css" />
  <!-- {/xblock:Test} -->
  <!-- {xblock:Live}
  <link rel="stylesheet" href="everything.min.css" type="text/css" />
  {/xblock:Live} -->

  When testing this code, the 'live' section will be commented out, but after
  running xbswitch the 'test' section will have been completely removed, and
  the lines containing the 'live' xblocks will be removed (but its contents
  will be maintained). Thus all that's left will be an uncommented link
  to the minified CSS, in our example.
TXT_HELP
);

/* Parse the command line and retrieve the accepted options. */
$options = getopt('', array(
	'to-live',
	'to-test',
	'help',
	'quiet',
	'in:',
	'out::'
));

/* Check out to see what we got from the command line. */
$to_live = isset($options['to-live']);
$to_test = isset($options['to-test']);
$has_in = isset($options['in']);
$has_out = isset($options['out']);
$help = isset($options['help']);
$quiet = isset($options['quiet']);
$in = @$options['in'];
$out = @$options['out'];
$overwrite_out = false;
if ($has_out && is_file($out)) {
	$overwrite_out = true;
}

/* Print the help information in case requested. */
if ($help) {
	exit_help();
}
/* Ensure we're running via CLI. */
if (!defined('STDIN')) {
	exit_notice('Error: please run this program from the command line.', true, true);
}
/* Ensure we have either 'test' or 'live'. */
if (($to_live && $to_test)) {
	exit_notice('Error: use only one of either --to-live or --to-test.', true, true);
}
if (!$to_live && !$to_test) {
	exit_usage();
}
/* Ensure we have a valid input file. */
if (!$has_in) {
	exit_notice('Error: no input file.', true, true);
}

$file = file_get_contents($in);
if ($file === false) {
	exit_notice('Error: could not open input file.', true, false);
}
/* Unify the file's linebreaks. */
$file = preg_replace('~\R~u', EOL, $file);

/* Split the file up into lines. */
$lines = explode(EOL, $file);

/* Iterate through the lines, keeping track of whether we run into xblocks. */
$in_test_block = false;		// inside a {xblock:Test}
$on_test_line = false;		// the line containing the {xblock:Test}
$in_live_block = false;		// inside a {xblock:Live}
$on_live_line = false;		// the line containing the {xblock:Live}
$to_remove = array();
$remove_line = false;
foreach ($lines as $n => $line) {
	$remove_line = false;
	/* Check whether we've entered a block. */
	if (stripos($line, XBLOCK_TEST_START) !== false) {
		$in_test_block = true;
		$in_test_decl = true;
	}
	if (stripos($line, XBLOCK_LIVE_START) !== false) {
		$in_live_block = true;
		$in_live_decl = true;
	}
	/* Check whether we've exited a block. */
	if (stripos($line, XBLOCK_TEST_END) !== false) {
		$in_test_block = false;
		$in_test_decl = true;
	}
	if (stripos($line, XBLOCK_LIVE_END) !== false) {
		$in_live_block = false;
		$in_live_decl = true;
	}
	
	/* Check which lines we're going to remove. */
	if ($in_live_decl || $in_test_decl) {
		/* We always remove declarations. */
		$remove_line = true;
	}
	if ($in_test_block && $to_live) {
		/* Remove the lines inside test blocks when going to live. */
		$remove_line = true;
	}
	if ($in_live_block && $to_test) {
		/* Remove the lines inside live blocks when going to test. */
		$remove_line = true;
	}
	/* Add the line to the stack. */
	if ($remove_line) {
		$to_remove[] = $n;
	}
	/* A declaration is always only one line. */
	$in_test_decl = false;
	$in_live_decl = false;
}
/* Now remove the lines from the file array. */
foreach ($to_remove as $line) {
	unset($lines[$line]);
}

$output = implode(EOL, $lines);

/* Write the file to the specified output location. */
if ($has_out == false) {
	/* To stdout. */
	print($output);
	exit(0);
}
if ($has_out == true) {
	/* Write to a file. */
	// todo: add check to see if you can write
	file_put_contents($out, $output);
	$mode = $to_live ? 'live' : 'test';
	$deleted = $to_live ? 'test' : 'live';
	$report = array();
	$report[] = sprintf('Input:	   %s', $in);
	$report[] = sprintf('Output:   %s', $has_out ? $out : '<stdout>');
	$report[] = sprintf('Mode:	   %s', $mode);
	$report[] = '';
	$report[] = sprintf('Removed all xblock declarations and all contents of the %s blocks.', $deleted);
	$report[] = sprintf('Successfully wrote %d lines (removed %d lines from input file).', count($lines), count($to_remove));
	if ($overwrite_out) {
		$report[] = 'Overwrote the output file.';
	}
	$report = implode(EOL, $report);
	/* Check if we're suppressing output. */
	if ($quiet) {
		exit;
	}
	else {
		exit_notice($report, true, false, false, 0);
	}
}

/* ---------------------------------------------------------------------- */
function exit_usage()
{
	exit_notice('', true, true);
}
function exit_help()
{
	exit_notice('', true, true, true);
}
function exit_notice($reason='', $show_title=true, $show_usage=false, $show_help=false, $exit=1)
{
	global $txt_title;
	global $txt_usage;
	global $txt_help;
	
	$sections = array();
	if ($show_title) {
		$sections[] = $txt_title;
	}
	if ($show_usage) {
		$sections[] = $txt_usage;
	}
	if ($reason != '') {
		$sections[] = $reason;
	}
	if ($show_help) {
		$sections[] = $txt_help;
	}
	print(implode(EOL.EOL, $sections));
	print(EOL.EOL);
	exit($exit);
}