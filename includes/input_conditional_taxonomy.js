(function($){

	acf.conditional_logic_with_taxonomy = acf.model.extend({
		actions: {
			'ready 20':	'render',
			'change 20': 'change'
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
			this.renderFields( $targets );
			
			
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
		
		change: function( $input ){
			
			// vars
			var $trigger = acf.get_field_wrap($input);
			var key = $trigger.data('key');
			var trigger = acf.conditional_logic.getTrigger(key);
			
			// bail early if this field is not a trigger
			if( !trigger ) return false;
			
			// loop
			for( var target in trigger ) {
				
				// get target(s)
				var $targets = acf.conditional_logic.findTarget( $trigger, target );
				
				// render
				this.renderFields( $targets );
				
			}
			
			// action for 3rd party customization
			acf.do_action('refresh', this.$parent);
		},
		
		
		/*
		*  renderFields
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
		
		renderFields: function( $targets ) {
		
			// reference
			var self = this;
			
			
			// loop over targets and render them			
			$targets.each(function(){
					
				self.renderField( $(this) );
				
			});
			
		},
		
		
		/*
		*  renderField
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
		
		renderField : function( $target ){
			// vars
			var visibility = false;
			var key = $target.data('key');
			var condition = acf.conditional_logic.getCondition( key );
			
			
			// bail early if this field does not contain any conditional logic
			if( !condition ) return false;

			for( var i = 0; i < condition.length; i++ ) {
				// vars
				var group = condition[i],
					match_group	= true;
				
				// loop
				for( var k = 0; k < group.length; k++ ) {
					
					// vars
					var rule = group[k];
					
					// get trigger for rule
					var $trigger = acf.conditional_logic.findTarget( $target, rule.field );
					
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
				
				acf.conditional_logic.showField( $target );					
			
			} else {
				
				acf.conditional_logic.hideField( $target );
			
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