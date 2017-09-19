(function($){

	var initial_param 		= false,
		initial_value 		= false,
		initial_value_label	= false;

	acf.add_action( 'before_duplicate', function( $el ) {
		var select2 = $( '.conditional-rule-value', $el );
		acf.select2.destroy( select2 );
	});

	acf.add_action( 'after_duplicate', function( $el, $el2 ) {
		var select2 = $( '.conditional-rule-value', $el );
		var args = acf.get_data( select2 );
		var $trigger	= $el.find('.conditional-rule-param');
		var field_key	= $trigger.val();

		args = acf.parse_args(args, {
			pagination	: 1,
			ajax_action	: 'acf/fields/taxonomy/query',
			key			: field_key,
		});

		acf.select2.init( select2, args );	
	});

	acf.field_group.conditional_logic_with_taxonomy = acf.model.extend({
		
		actions: {
			'open_field 0':				'get_initial_values',
			'open_field 20':			'render_field',
			'change_field_label 20':	'render_fields',
			'change_field_type 20':		'render_fields'
		},
		
		events: {
			'change .conditional-rule-param':	'change_param'
		},
		
		get_initial_values: function( $tr, triggers ) {

			var $param		= $tr.find('.conditional-rule-param');
			var $value		= $tr.find('.conditional-rule-value');

			initial_param 		= $param.val();
			initial_value 		= $value.val();
			initial_value_label = $( 'option:selected', $value ).text();
		},


		/*
		*  render_fields
		*
		*  description
		*
		*  @type	function
		*  @date	19/08/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		render_fields: function(){
			
			var self = this;
			
			$('.acf-field-object.open').each(function(){
					
				self.render_field( $(this) );
				
			});	
			
		},
		
		
		/*
		*  render_field
		*
		*  This function will render the conditional logic fields for a given field
		*
		*  @type	function
		*  @date	8/04/2014
		*  @since	5.0.0
		*
		*  @param	$field
		*  @return	n/a
		*/
		
		render_field: function( $field ){
			// reference
			var self = this;
			
			
			// vars
			var key			= $field.attr('data-key'),
				$ancestors	= $field.parents('.acf-field-list'),
				$tr			= $field.find('.acf-field[data-name="conditional_logic"]:last');
				
			
			// choices
			var choices	= [];
			
			
			// loop over ancestors
			$.each( $ancestors, function( i ){
				
				// vars
				var group = (i == 0) ? acf._e('sibling_fields') : acf._e('parent_fields');
				
				
				// loop over fields
				$(this).children('.acf-field-object').each(function(){
					
					// vars
					var $this_field	= $(this),
						this_key	= $this_field.attr('data-key'),
						this_type	= $this_field.attr('data-type'),
						this_label	= $this_field.find('.field-label:first').val();
					
					
					// validate
					if( $.inArray(this_type, ['taxonomy', 'select', 'checkbox', 'true_false', 'radio']) === -1 ) {
						
						return;
						
					} else if( this_key == key ) {
						
						return;
						
					}

					
					// add this field to available triggers
					choices.push({
						value:	this_key,
						label:	this_label,
						group:	group
					});
					
				});
				
			});
				
			
			// empty?
			if( !choices.length ) {
				
				choices.push({
					value: '',
					label: acf._e('no_fields')
				});
				
			}
			
			
			// create select fields
			$tr.find('.rule').each(function(){
				
				self.render_rule( $(this), choices );
				
			});
			
		},
		
		
		/*
		*  populate_triggers
		*
		*  description
		*
		*  @type	function
		*  @date	22/08/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		render_rule: function( $tr, triggers ) {

			// vars
			var $trigger	= $tr.find('.conditional-rule-param'),
				$value		= $tr.find('.conditional-rule-value');

			// populate triggers
			if( triggers ) {

				$trigger.val( initial_param );
				acf.render_select( $trigger, triggers );
				
			}
			
			
			// vars
			var $field		= $('.acf-field-object[data-key="' + $trigger.val() + '"]'),
				field_type	= $field.attr('data-type'),
				field_key	= $trigger.val(),
				choices		= [];

			// populate choices
			if( field_type == "true_false" ) {
				
				choices.push({
					'value': 1,
					'label': acf._e('checked')
				});
			
			// taxonomy
			} else if( field_type == "taxonomy" ) {
				if ( initial_value ) {
					choices.push({
						'value': initial_value,
						'label': initial_value_label
					});
				} else {
					choices.push({
						'value': '',
						'label': acf._e('select')
					});
				}

			// select				
			} else if( field_type == "select" || field_type == "checkbox" || field_type == "radio" ) {
				
				// vars
				var lines = $field.find('.acf-field[data-name="choices"] textarea').val().split("\n");	
				
				$.each(lines, function(i, line){
					
					// explode
					line = line.split(':');
					
					
					// default label to value
					line[1] = line[1] || line[0];
					
					
					// append					
					choices.push({
						'value': $.trim( line[0] ),
						'label': $.trim( line[1] )
					});
					
				});
				
				
				// allow null
				var $allow_null = $field.find('.acf-field[data-name="allow_null"]');
				
				if( $allow_null.exists() ) {
					
					if( $allow_null.find('input:checked').val() == '1' ) {
						
						choices.unshift({
							'value': '',
							'label': acf._e('null')
						});
						
					}
					
				}
				
			}
			
			
			// update select
			$value.val( initial_value );
			acf.render_select( $value, choices );

			if( field_type == "taxonomy" ) {
				var args = acf.get_data( $value );

				args = acf.parse_args(args, {
					pagination	: 1,
					ajax_action	: 'acf/fields/taxonomy/query',
					key			: field_key,
				});

				acf.select2.init( $value, args );	
			} else {
				acf.select2.destroy( $value );
			}
			
		},

		/*
		*  change_trigger
		*
		*  This function is triggered by changing a 'Conditional Logic' trigger
		*
		*  @type	function
		*  @date	8/04/2014
		*  @since	5.0.0
		*
		*  @param	$select
		*  @return	n/a
		*/
		
		change_param: function( e ){
			// vars
			var $rule = e.$el.closest('.rule');
			
			
			// render		
			this.render_rule( $rule );
			
		}
		
	});

})(jQuery);