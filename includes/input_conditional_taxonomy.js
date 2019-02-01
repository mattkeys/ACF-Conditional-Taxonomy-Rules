(function($){

	// a few helper functions copied from acf-input.js
	var parseString = function( val ){
		return val ? '' + val : '';
	};
	var isEqualTo = function( v1, v2 ){
		return ( parseString(v1).toLowerCase() === parseString(v2).toLowerCase() );
	};
	var inArray = function( v1, array ){

		// cast all values as string
		array = array.map(function(v2){
			return parseString(v2);
		});

		return (array.indexOf( v1 ) > -1);
	}

	// add our new conditional for matching against taxonomy IDs
	var TaxonomyEqualTo = acf.Condition.extend({
		type: 'taxonomyEqualTo',
		operator: '==',
		label: 'Selection Term ID equals',
		fieldTypes: [ 'taxonomy' ],
		match: function( rule, field ){
			var val = field.val();
			if ( val instanceof Array ) {
				return inArray( rule.value, val );
			} else {
				return isEqualTo( rule.value, val );
			}
		},
		choices: function( fieldObject ){
			return '<input type="number" />';
		}
	});

	acf.registerConditionType( TaxonomyEqualTo );

	var TaxonomyNotEqualTo = TaxonomyEqualTo.extend({
		type: 'taxonomyNotEqualTo',
		operator: '!=',
		label: "Selection Term ID not equal to",
		fieldTypes: ['taxonomy'],
		match: function (rule, field) {
			return !TaxonomyEqualTo.prototype.match.apply(this, arguments)
		},
		choices: function (fieldObject) {
			return '<input type="number" />';
		}
	});

	acf.registerConditionType(TaxonomyNotEqualTo);

})(jQuery);
