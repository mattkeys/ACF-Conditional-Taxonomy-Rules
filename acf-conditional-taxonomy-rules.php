<?php
/*
Plugin Name: ACF Conditional Taxonomy Rules
Description: Allow conditional rules to use 'taxonomy' field types
Version: 2.0.0
Author: mattkeys
Author URI: http://mattkeys.me
License: GPL2
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

// Path to this file
if ( ! defined( 'ACFCTR_PLUGIN_FILE' ) ) {
	define( 'ACFCTR_PLUGIN_FILE', __FILE__ );
}

// Path to the plugin's directory
if ( ! defined( 'ACFCTR_DIRECTORY' ) ) {
	define( 'ACFCTR_DIRECTORY', dirname( __FILE__ ) );
}

// Publicly Accessible path
if ( ! defined( 'ACFCTR_PUBLIC_PATH' ) ) {
	define( 'ACFCTR_PUBLIC_PATH', plugin_dir_url( __FILE__ ) );
}

// Load the plugin
require_once 'core/ACFCTR_Core.php';
