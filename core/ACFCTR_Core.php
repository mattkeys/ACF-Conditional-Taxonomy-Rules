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
		add_filter( 'acf/validate_field/type=select', array( $this, 'conditional_taxonomy_select_args' ) );
		add_filter( 'acf/update_field', array( $this, 'check_empty_conditionals' ) );
	}

	public function enqueue_script()
	{
		if ( wp_script_is( 'acf-field-group', 'enqueued' ) ) {
			wp_enqueue_script( 'acf-field-group-conditional-taxonomy', ACFCTR_PUBLIC_PATH . 'includes/field_group_conditional_taxonomy.js', array( 'acf-field-group' ), false, true );
		}

		if ( wp_script_is( 'acf-input', 'enqueued' ) ) {
			wp_enqueue_script( 'acf-input-conditional-taxonomy', ACFCTR_PUBLIC_PATH . 'includes/input_conditional_taxonomy.js', array( 'acf-input' ), false, true );
		}
	}

	public function conditional_taxonomy_select_args( $field )
	{
		if ( ! isset( $field['class'] ) ) {
			return $field;
		}

		if ( 'conditional-rule-param' == $field['class'] ) {
			$this->conditionals[ $field['prefix'] ] = $field['value'];
		}

		if ( 'conditional-rule-value' == $field['class'] ) {
			$field['choices']		= $this->get_taxonomy_term( $field['value'], $field['prefix'] );
			$field['ui']			= true;
			$field['ajax']			= true;
		}

		return $field;
	}

	private function get_taxonomy_term( $value, $prefix, $choices = array() )
	{
		$field_key = isset( $this->conditionals[ $prefix ] ) ? $this->conditionals[ $prefix ] : false;
		
		if ( $field_key ) {
			$field_object = get_field_object( $field_key );
		}

		if ( isset( $field_object['taxonomy'] ) ) {
			$selected_term = get_term_by( 'id', $value, $field_object['taxonomy'] );

			if ( $selected_term ) {
				$choices = array(
					$selected_term->term_id => $selected_term->name
				);
			}
		}

		return $choices;
	}

	// For some reason with data-ui="1" on conditional fields, with no conditional rules set, the update will still get a null value on a conditional. Check for it and unset to avoid issues.
	public function check_empty_conditionals( $field )
	{
		if ( ! $field['conditional_logic'] || isset( $field['conditional_logic'][0][0]['field'] ) ) {
			return $field;
		}

		if ( isset( $field['conditional_logic'][0][0]['value'] ) ) {
			$field['conditional_logic'] = false;
		}

		return $field;
	}

}

add_action( 'plugins_loaded', array( new ACFCTR_Core, 'init' ) );
