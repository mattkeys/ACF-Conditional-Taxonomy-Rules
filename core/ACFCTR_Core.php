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
	private $conditionals = array();

	public function init()
	{
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_script' ), 100 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_script' ), 100 );
	}

	public function enqueue_script()
	{
		if ( wp_script_is( 'acf-input', 'enqueued' ) ) {
			wp_enqueue_script( 'acf-input-conditional-taxonomy', ACFCTR_PUBLIC_PATH . 'includes/input_conditional_taxonomy.js', array( 'acf-input' ), '3.0.0', true );
		}
	}

}

add_action( 'plugins_loaded', array( new ACFCTR_Core, 'init' ) );
