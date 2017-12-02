( function( $ ) {

	var selections = [];

	acf.add_action( 'before_duplicate', function( $el ) {
		var $select2 = $( '.conditional-rule-value.select2-hidden-accessible', $el );

		if ( $select2.length ) {
			acf.select2.destroy( $select2 );
		}
	});

	acf.add_action( 'after_duplicate', function( $el, $el2 ) {
		var $param 		= $( '.conditional-rule-param', $el ),
			$value 		= $( '.conditional-rule-value', $el ),
			param_val	= $param.val(),
			param_type	= $('.acf-field-object[data-key="' + param_val + '"]').data('type');

		if ( 'taxonomy' == param_type ) {
			var args = acf.get_data( $value );

			args = acf.parse_args(args, {
				pagination	: 1,
				ajax_action	: 'acf/fields/taxonomy/query',
				key			: param_val,
			});

			acf.select2.init( $value, args );
		}
	});

	acf.field_group.conditional_logic_with_taxonomy = acf.model.extend( {

		actions: {
			'open_field 0':				'get_initial_values',
			'open_field 15':			'add_taxonomy_params',
			// 'change_field_label 20':	'add_taxonomy_params',
			// 'change_field_type 20':	'add_taxonomy_params',
			'open_field 20':			'update_values'
		},

		events: {
			'change .conditional-rule-param':	'change_param',
			'change .conditional-rule-value':	'change_value'
		},

		get_initial_values: function( $field ) {
			var $conditional_toggle	= $( '.conditional-toggle', $field ),
				$params 			= $( '.conditional-rule-param', $field ),
				key					= $field.data('key');

			if ( ! $conditional_toggle.is(':checked') ) {
				return true;
			}

			selections[ key ] = [];

			$params.each( function( index, param ) {
				var $param			= $( param ),
					param_val		= $param.val(),
					param_label		= $('.acf-field-object[data-key="' + param_val + '"]').find('.field-label:first').val(),
					param_type		= $('.acf-field-object[data-key="' + param_val + '"]').data('type'),
					group			= $param.closest('.rule-group').data('id'),
					$rule			= $param.closest('.rule'),
					rule_id			= $rule.data('id');

				if ( '' == param_val ) {
					return true;
				}

				if ( 'taxonomy' == param_type ) {
					value_field		= $( '.conditional-rule-value', $rule );
					value_values	= acf.select2.get_value( value_field );
				} else {
					value_parent	= $( '.value', $rule );
					value			= $( 'input[type="hidden"]', value_parent ).val();
					value_values	= [{ id: value, text: value }];
				}

				if ( ! ( group in selections[ key ] ) ) {
					selections[ key ][ group ] = [];
				}

				selections[ key ][ group ][ rule_id ] = [];
				selections[ key ][ group ][ rule_id ]['param_type'] = param_type;
				selections[ key ][ group ][ rule_id ]['param_val'] = param_val;
				selections[ key ][ group ][ rule_id ]['param_label'] = param_label;
				selections[ key ][ group ][ rule_id ]['value_val'] = value_values[0].id;
				selections[ key ][ group ][ rule_id ]['value_label'] = value_values[0].text;
			});
		},
		
		update_values: function( $field ) {
			var $params = $( '.conditional-rule-param', $field ),
				key		= $field.data('key');

			$params.each( function( index, param ) {
				var	$param		= $( param ),
					param_val	= $param.val(),
					param_type	= $('.acf-field-object[data-key="' + param_val + '"]').data('type'),
					group		= $param.closest('.rule-group').data('id'),
					$rule		= $param.closest('.rule'),
					$value		= $( '.conditional-rule-value', $rule ),
					rule_id		= $rule.data('id'),
					choices		= [];

				if ( ( key in selections ) && ( group in selections[ key ] ) && ( rule_id in selections[ key ][ group ] ) ) {
					var param_type 	= selections[ key ][ group ][ rule_id ]['param_type'],
						param_val 	= selections[ key ][ group ][ rule_id ]['param_val'],
						param_label	= selections[ key ][ group ][ rule_id ]['param_label'],
						value_val	= selections[ key ][ group ][ rule_id ]['value_val'],
						value_label	= selections[ key ][ group ][ rule_id ]['value_label'];

					if ( 'taxonomy' == param_type ) {
						choices.push({
							value: value_val,
							label: value_label
						});

						acf.render_select( $value, choices );

						var args = acf.get_data( $value );

						args = acf.parse_args( args, {
							pagination	: 1,
							ajax_action	: 'acf/fields/taxonomy/query',
							key			: param_val,
						});

						acf.select2.init( $value, args );
					}

					$param.val( param_val );
					$value.val( value_val );
				} else {
					if ( 'taxonomy' == param_type ) {
						var args = acf.get_data( $value );

						args = acf.parse_args( args, {
							pagination	: 1,
							ajax_action	: 'acf/fields/taxonomy/query',
							key			: param_val,
						});

						acf.select2.init( $value, args );
					}
				}
			});
		},

		add_taxonomy_params: function( $field ) {
			var self		= this,
				key			= $field.attr('data-key'),
				$ancestors	= $field.parents('.acf-field-list'),
				$tr			= $field.find('.acf-field[data-name="conditional_logic"]:last'),
				choices		= [];

			$.each( $ancestors, function( i ) {
				var group = ( i == 0 ) ? acf._e('sibling_fields') : acf._e('parent_fields');

				$( this ).children('.acf-field-object').each( function() {
					var $this_field	= $(this),
						this_key	= $this_field.attr('data-key'),
						this_type	= $this_field.attr('data-type'),
						this_label	= $this_field.find('.field-label:first').val();

					if ( $.inArray( this_type, ['taxonomy', 'select', 'checkbox', 'true_false', 'radio'] ) === -1 ) {
						return;
					} else if ( this_key == key ) {
						return;
					}

					choices.push({
						value:	this_key,
						label:	this_label,
						group:	group
					});
				});
			});

			if ( ! choices.length ) {
				choices.push({
					value: '',
					label: acf._e('no_fields')
				});
			}

			$tr.find('.rule').each( function() {
				var $param 		= $( '.conditional-rule-param', this ),
					$value 		= $( '.conditional-rule-value', this );

				acf.render_select( $param, choices );
			});
		},

		change_param: function ( e ) {
			var $rule		= e.$el.closest('.rule'),
				$param		= $( '.conditional-rule-param', $rule ),
				$value		= $( '.conditional-rule-value', $rule ),
				param_val	= $param.val(),
				param_type	= $('.acf-field-object[data-key="' + param_val + '"]').data('type');

			if ( 'taxonomy' == param_type ) {
				var args = acf.get_data( $value );

				args = acf.parse_args( args, {
					pagination	: 1,
					ajax_action	: 'acf/fields/taxonomy/query',
					key			: param_val,
				});

				acf.select2.init( $value, args );
			} else {
				if ( $value.hasClass('select2-hidden-accessible') ) {
					acf.select2.destroy( $value );
				}
			}
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