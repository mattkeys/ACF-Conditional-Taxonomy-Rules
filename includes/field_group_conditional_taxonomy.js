(function($){

	var selections			= [],
		conditional_fields	= [],
		label				= false;

	acf.add_action( 'before_duplicate', function( $el ) {
		var select2 = $( '.conditional-rule-value', $el );
		acf.select2.destroy( select2 );
	});

	acf.add_action( 'after_duplicate', function( $el, $el2 ) {
		var select2 = $( '.conditional-rule-value', $el ),
			args = acf.get_data( select2 ),
			$trigger	= $el.find('.conditional-rule-param'),
			field_key	= $trigger.val();

		args = acf.parse_args(args, {
			pagination	: 1,
			ajax_action	: 'acf/fields/taxonomy/query',
			key			: field_key,
		});

		acf.select2.init( select2, args );	
	});

	acf.field_group.conditional_logic_with_taxonomy = acf.model.extend( {

		actions: {
			'open_field 0':				'get_initial_values',
			'open_field 20':			'render_field',
			'change_field_label 20':	'render_fields',
			'change_field_type 20':		'render_fields'
		},

		events: {
			'change .conditional-rule-param':	'change_param',
			'change .conditional-rule-value':	'change_value'
		},

		get_initial_values: function( $field ) {
			var key					= $field.attr('data-key'),
				$ancestors			= $field.parents('.acf-field-list'),
				conditional_fields	= [];

			$.each( $ancestors, function( i ) {
				$( this ).children('.acf-field-object').each( function() {
					var $this_field	= $( this ),
						this_key	= $this_field.attr('data-key'),
						this_type	= $this_field.attr('data-type');

					if ( 'taxonomy' == this_type && ! label ) {
						label = $this_field.find('.field-label:first').val();
					}

					if ( this_key !== key ) {
						conditional_fields.push( this_key );
					}
				});
			});

			var $params = $field.find('.conditional-rule-param');

			if ( $params.length ) {
				selections[ key ] = [];

				$params.each( function( index, param ) {
					var	param_selected = $( param ).val();

					if ( $.inArray( param_selected, conditional_fields ) !== -1 ) {
						var group			= $( param ).closest('.rule-group').data('id'),
							rule			= $( param ).closest('.rule'),
							rule_id			= $( rule ).data('id'),
							field_type		= $('.acf-field-object[data-key="' + param_selected + '"]').data('type');

						if ( 'taxonomy' == field_type ) {
							value_field		= $( '.conditional-rule-value', rule );
							value_values	= acf.select2.get_value( value_field );
						} else {
							value_parent	= $( '.value', rule );
							value_field		= $( 'input[type="hidden"]', value_parent );
							value			= $( value_field ).val();
							value_values	= [{ id: value, text: value }];
						}

						if ( 'undefined' === typeof value_values[0] ) {
							return true;
						}

						if ( ! ( group in selections[ key ] ) ) {
							selections[ key ][ group ] = [];
						}

						selections[ key ][ group ][ rule_id ] = [];
						selections[ key ][ group ][ rule_id ]['param'] = $( param ).val();
						selections[ key ][ group ][ rule_id ]['value'] = value_values[0].id;
						selections[ key ][ group ][ rule_id ]['label'] = value_values[0].text;
						selections[ key ][ group ][ rule_id ]['taxonomy_label'] = label;
					}
				});
			}
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
		
		render_fields: function() {

			var self = this;

			$('.acf-field-object.open').each(function(){

				self.render_field( $(this) );

			});	

		},
		
		
		/*
		*  render_field
		*
		*  Come back around after ACF renders the rules and add back in Taxonomy rules it removed
		*/
		
		render_field: function( $field ) {
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

				self.rerender_rule( $(this), choices );

			});

		},


		/*
		*  rerender_rule
		*
		*  Come back around after ACF renders the rules and add back in Taxonomy rules it removed
		*/

		rerender_rule: function( $tr, triggers ) {
			var $trigger	= $tr.find('.conditional-rule-param'),
				$value		= $tr.find('.conditional-rule-value'),
				key			= $tr.closest('.acf-field-object').data('key'),
				group		= $( $tr ).closest('.rule-group').data('id'),
				rule_id		= $( $tr ).closest('.rule').data('id');

				$value.val( selections[ key ][ group ][rule_id]['value'] );

			// populate triggers
			if ( triggers ) {
				if ( key in selections && group in selections[ key ] && rule_id in selections[ key ][ group ] ) {
					var param			= selections[ key ][ group ][ rule_id ]['param'],
						taxonomy_label	= selections[ key ][ group ][ rule_id ]['taxonomy_label'],
						selected_value	= selections[ key ][ group ][ rule_id ]['value'];
						selected_label	= selections[ key ][ group ][ rule_id ]['label'];

					// Force back in our selected option, then select it
					$trigger.append( $('<option>', { value: param, text: taxonomy_label } ) );
					$trigger.val( param );
				}

				acf.render_select( $trigger, triggers );
			}

			var $field		= $('.acf-field-object[data-key="' + $trigger.val() + '"]'),
				field_type	= $field.attr('data-type'),
				field_key	= $trigger.val(),
				choices		= [];

			// populate choices
			if ( field_type == "true_false" ) {

				choices.push({
					'value': 1,
					'label': acf._e('checked')
				});

			} else if ( field_type == "select" || field_type == "checkbox" || field_type == "radio" ) {

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
				
			} else if ( 'taxonomy' == field_type ) {
				if ( key in selections && group in selections[ key ] && rule_id in selections[ key ][ group ] ) {
					choices.push({
						'value': selections[ key ][ group ][ rule_id ]['value'],
						'label': selections[ key ][ group ][ rule_id ]['label']
					});
				} else {
					choices.push({
						'value': '',
						'label': acf._e('select')
					});
				}
			}

			if ( 'taxonomy' == field_type ) {
				if ( key in selections && group in selections[ key ] && rule_id in selections[ key ][ group ] ) {
					// Force back in our selected option, then select it
					$value.append( $('<option>', { value: selected_value, text: selected_label } ) );
					$value.val( selected_value );
				}

				acf.render_select( $value, choices );

				var args = acf.get_data( $value );

				args = acf.parse_args( args, {
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

		change_param: function( e ) {
			// vars
			var $rule = e.$el.closest('.rule');

			// render		
			this.rerender_rule( $rule );
		},

		change_value: function ( e ) {
			var $rule	= e.$el.closest('.rule'),
				new_val	= $( '.conditional-rule-value', $rule ).val();

			value_parent	= $( '.value', $rule );
			value_field		= $( 'input[type="hidden"]', value_parent );
			
			$( value_field ).val( new_val );
		}

	});

})(jQuery);