(function($){

	acf.conditional_logic_with_taxonomy = acf.model.extend({
		actions: {
			'ready 20':	'render',
		},
		
		events: {
			'change .acf-field-taxonomy select': 	'change',
			'change .acf-field-taxonomy input': 	'change'
		},

		/*
		*  render
		*
		*  This function will render all fields
		*
		*  @type	function
		*  @date	22/05/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		render: function( $el ){
			
			// debug
			// console.log('conditional_logic.render(%o)', $el);
			
			
			// defaults
			$el = $el || false;
			
			
			// get targets
			var $targets = acf.get_fields( '', $el, true );
			
			
			// render fields
			this.render_fields( $targets );
			
			
			// action for 3rd party customization
			acf.do_action('refresh', $el);
			
		},
		
		
		/*
		*  change
		*
		*  This function is called when an input is changed and will render any fields which are considered targets of this trigger
		*
		*  @type	function
		*  @date	22/05/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		change: function( e ){
			
			// debug
			// console.log( 'conditional_logic.change(%o)', $input );
			
			
			// vars
			var $input = e.$el,
				$field = acf.get_field_wrap( $input ),
				key = $field.data('key');

			// bail early if this field does not trigger any actions
			if( typeof acf.conditional_logic.triggers[key] === 'undefined' ) {
				
				return false;
				
			}
			
			
			// vars
			$parent = $field.parent();
			
			
			// update visibility
			for( var i in acf.conditional_logic.triggers[ key ] ) {
				
				// get the target key
				var target_key = acf.conditional_logic.triggers[ key ][ i ];
				
				
				// get targets
				var $targets = acf.get_fields(target_key, $parent, true);
				
				
				// render
				this.render_fields( $targets );
				
			}
			
			
			// action for 3rd party customization
			acf.do_action('refresh', $parent);
			
		},
		
		
		/*
		*  render_fields
		*
		*  This function will render a selection of fields
		*
		*  @type	function
		*  @date	22/05/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		render_fields: function( $targets ) {
		
			// reference
			var self = this;
			
			
			// loop over targets and render them			
			$targets.each(function(){
					
				self.render_field( $(this) );
				
			});
			
		},
		
		
		/*
		*  render_field
		*
		*  This function will render a field
		*
		*  @type	function
		*  @date	22/05/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		render_field : function( $target ){
			
			// vars
			var key = $target.data('key');
			
			
			// bail early if this field does not contain any conditional logic
			if( typeof acf.conditional_logic.items[ key ] === 'undefined' ) {
				
				return false;
				
			}
			
			
			// vars
			var visibility = false;
			
			
			// debug
			//console.log( 'conditional_logic.render_field(%o)', $field );
			
			
			// get conditional logic
			var groups = acf.conditional_logic.items[ key ];
			
			
			// calculate visibility
			for( var i = 0; i < groups.length; i++ ) {
				
				// vars
				var group = groups[i],
					match_group	= true;
				
				for( var k = 0; k < group.length; k++ ) {
					
					// vars
					var rule = group[k];
					
					
					// get trigger for rule
					var $trigger = acf.conditional_logic.get_trigger( $target, rule.field );
					
					
					// break if rule did not validate
					if( !this.calculate(rule, $trigger, $target) ) {
						
						match_group = false;
						break;
						
					}
										
				}
				
				
				// set visibility if rule group did validate
				if( match_group ) {
					
					visibility = true;
					break;
					
				}
				
			}
			
			
			// hide / show field
			if( visibility ) {
				
				acf.conditional_logic.show_field( $target );					
			
			} else {
				
				acf.conditional_logic.hide_field( $target );
			
			}
			
		},

		
		/*
		*  calculate
		*
		*  This function will calculate if a rule matches based on the $trigger
		*
		*  @type	function
		*  @date	22/05/2015
		*  @since	5.2.3
		*
		*  @param	$post_id (int)
		*  @return	$post_id (int)
		*/
		
		calculate : function( rule, $trigger, $target ){
			
			// bail early if $trigger could not be found
			if( !$trigger || !$target ) return false;
			
			
			// debug
			//console.log( 'calculate(%o, %o, %o)', rule, $trigger, $target);
			
			
			// vars
			var match = false,
				type = $trigger.data('type');

			// input with :checked
			if( type == 'true_false' || type == 'checkbox' || type == 'radio' ) {
				
				match = acf.conditional_logic.calculate_checkbox( rule, $trigger );
	        
				
			} else if( type == 'select' ) {
				
				match = acf.conditional_logic.calculate_select( rule, $trigger );
								
			} else if( type == 'taxonomy' ) {
				if ( $( '[data-type="checkbox"], [data-type="radio"]', $trigger ).length ) {
					match = acf.conditional_logic.calculate_checkbox( rule, $trigger );
				} else {
					match = acf.conditional_logic.calculate_select( rule, $trigger );
				}
								
			}
			
			
			// reverse if 'not equal to'
			if( rule.operator === "!=" ) {
				
				match = !match;
					
			}
	        
			
			// return
			return match;
			
		}
		
	});

})(jQuery);