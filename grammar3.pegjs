start = Code

Code = token:(
	Text / 
    QuestionToken / 
    VariableToken / 
    ConstantToken / 
    UnderlineToken / 
    TocToken /
    HighlightToken /
    ConditionalBooleanStatement
)*
 
OrCondition = head:AndCondition tail:(_ '||' _ AndCondition)+ {
   const accum = [{...head}];
   tail.reduce((accumulated, element) => {
   accumulated.push(element[3]);
   return accumulated;
 }, accum);

	return { op: '||', predicates: accum };
} / AndCondition
  
AndCondition = head:ConditionStatement tail:(_ '&&' _ ConditionStatement)+ {
  const accum = [{...head}];
  tail.reduce((accumulated, element) => {
    accumulated.push(element[3]);
    return accumulated;
  }, accum);

  return { op: '&&', predicates: accum };
} / ConditionStatement

ConditionStatement = 
	lhs:Value 
    operator:Operator 
    rhs:Value {
		return {op: operator.join(''), lhs, rhs}
	}
    
ConditionalBooleanStatement
    =
    _ "[" _ "if condition='"
    conditional: OrCondition
    "'" _ "]"
    body1: Code _
    '[else]'*
    body2: Code _
    '[/if]' _ {
      	return {
        	conditionalStatement: {conditional, body1, body2}
        }
    }

Value = val:(
    FunctionToken /
    ParamQuestionToken / 
    ParamConstantToken / 
    ParamVariableToken /
    QuestionToken / 
    ConstantToken / 
    VariableToken /
    Number / 
    Boolean /
    String 
)+ {
	return val.join('');
}

Text = token:([^\[\]\\] / Escape sequence:(
	"\\" { 
    	return "\x5c"; 
    } / 
    "[" { 
  		return "\x5b"; 
    } /
    "]" {
    	return "\x5d";
    } /
    "n" {
    	return "\x5C\x6E";
    } /
    "t" {
    	return "\x5C\x74";
    } /    
    "\"" {
    	return "\x22"
    })
    { 
    	return sequence; 
    })+ {
    	return token.join('')
    }

String = token:(_ '"' [ a-zA-Z0-9_=.,;:'\\|{}!@#\$%^&*()-_§><]* '"' _) { 
	return token[2].join('').toString();
} / [a-zA-Z \/,()-]

Number = token:[0-9]+ {
	return token.join('');
}

Boolean = bool:("true" / "false") {
	if(bool === 'true') return true;
    return false;
}

VariableToken = "[v#" id:[0-9]+ "]" {
	return "[v#" + id.join('') + "]";
}

ConstantToken = "[c#" id:[0-9]+ "]" {
	return "[c#" + id.join('') + "]";
}

QuestionToken = "[q#" id:[0-9]+ "]" {
	return "[q#" + id.join('') + "]";
}

ParamQuestionToken = "q#" id:[0-9]+ {
	return "q#" + id.join('')
}

ParamConstantToken = "c#" id:[0-9]+ {
	return "c#" + id.join('');
}

ParamVariableToken = "v#" id:[0-9]+ {
	return "v#" + id.join('');
}

UnderlineToken = "[u]" / "[/u]"

TocToken = "[toc]"

FunctionToken = ft:AllFunctionTokens"("q:QuestionToken")" {
	return ft + "(" + q + ")";
}

AllFunctionTokens = 
	"$a_an" /
    "$the_noun" /
    "$capitalize" /
    "$possessive" /
    "$lower_case" /
    "$get_address_city" /
    "$get_address_state" /
    "$get_address_street" /
    "$get_address_street_extra" /
    "$get_address_zip" /
    "$get_contact_title" /
    "$get_contact_email" /
    "$get_contact_firstname" /
    "$get_contact_lastname" /
    "$get_contact_phone"

HighlightToken = "[highlight]" / "[/highlight]"

Operator = op:("=" / "!=" / ">" / "<" / ">=" / "<=" / "$=")+

Escape = "\\"+

_ "whitespace" = [ \t\r\n\0]* 
