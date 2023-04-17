<?php
/**
 * =======================================
 * ACF Conditional Taxonomy Rules Core
 * =======================================
 *
 * 
 * @author Matt Keys <matt@mattkeys.me>
 */

class ACFCTR_Core
{

	public function init()
	{
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_script' ) );
		load_plugin_textdomain(
			'acf-conditional-taxonomy-rules',
			false,
			ACFCTR_DIRECTORY_NAME .'/languages/'
		);
	}

	public function enqueue_script()
	{
		wp_enqueue_script( 'acf-input-conditional-taxonomy', ACFCTR_PUBLIC_PATH . 'includes/input_conditional_taxonomy.js', array( 'acf-input' ), '3.0.0' );
		$localize = array(
			'term_id_equals'     => __('Selection Term ID equals', 'acf-conditional-taxonomy-rules'),
			'term_id_not_equal'  => __('Selection Term ID not equal to', 'acf-conditional-taxonomy-rules')
		);
		$localize = apply_filters('acfict_enqueue_localize', $localize);
		wp_localize_script('acf-input-conditional-taxonomy', 'acfict', $localize);
	}

}

add_action( 'plugins_loaded', array( new ACFCTR_Core, 'init' ) );
