{    
    function parseConditions(tree) {
      const results = [];
  
      if (tree?.predicates) {
        const operator = tree.op;
        const predicates = tree.predicates;
        let recursiveResult = false;
        let hasRecursion = false;
  
        for (let i = 0; i < predicates.length; i++) {
           const predicateExpressionNode = predicates[i];
     
           if (predicateExpressionNode.predicates) {
           	  hasRecursion = true;
              recursiveResult = parseConditions(predicates[i]);
           } else {
              const { lhs, rhs, op } = predicateExpressionNode;
              results.push(processCondition(lhs, rhs, op));                
           }
        }
  
        if (operator === '||') return results.some(r => r === true) || (hasRecursion ? recursiveResult: true);    
        return results.every(r => r === true) && (hasRecursion ? recursiveResult : true);
      }
  
     return processCondition(tree.lhs, tree.rhs, tree.op);
    }    
}

start = Code

Code = token:(Text / ConditionalBooleanStatement)*
 
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
    _ "[if condition='"
    conditional: OrCondition
    "']"
    body1: Code _
    '[else]'*
    body2: Code _
    '[/if]' _ {
      	return {
        	conditionalStatement: {conditional, body1, body2}
        }
    }

Value = val:(String / Number / Boolean / QuestionToken / VariableToken / ConstantToken)+ {
	return val.join('');
}

Text = token:([^\[\]\\] / Escape sequence:(
	"\\" { 
    	return "\\"; 
    } / 
    "[" { 
  		return "\x5b"; 
    } /
    "]" {
    	return "\x5d";
    })
    { 
    	return sequence; 
    })+ {
    	return token.join('')
    }

String = token:(_ '"' [ a-zA-Z0-9_=.,;:'\\|{}!@#\$%^&*()-_]* '"' _) { 
	return token[2].join('').toString();
}

Number = token:[0-9]+ {
	return parseFloat(token); 
}

Boolean = bool:("true" / "false") {
	if(bool === 'true') return true;
    return false;
}

VariableToken = "[v#" id:[0-9]+ "]" {
	return "[v#" + id.join('') + "]"
}

ConstantToken = "[c#" id:[0-9]+ "]" {
	return "[c#" + id.join('') + "]"
}

QuestionToken = "[q#" id:[0-9]+ "]" {
	return "[q#" + id.join('') + "]"
}

Operator = op:("=" / "!=" / ">" / "<" / ">=" / "<=" / "$=")+

Escape = "\\"

_ "whitespace" = [ \t\r\0]* 
