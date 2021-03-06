{
    function processCondition(lhs, rhs, op) {
       switch (op) {
           case '<':
            return parseFloat(lhs) < parseFloat(rhs);
          case '>':
            return parseFloat(lhs) > parseFloat(rhs);
          case '>=':
            return parseFloat(lhs) >= parseFloat(rhs);
          case '<=':
            return parseFloat(lhs) <= parseFloat(rhs);
          case '$=':
            return lhs.includes(rhs);
          case '=':
            return lhs === rhs;
          case '!=':
            return lhs !== rhs;
          default:
            return false;
       }
    }
    
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

Code = token: (Text / ConditionalBooleanStatement)*{
	return token.join('');
}
 
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
    	const conditionalResult = parseConditions(conditional);
        if (conditionalResult) return body1;
        return body2;
    }

Value = val:(String / Number / Boolean)+ {
	return val.join('');
}

Text = [^\[\]\\] / Escape sequence:(
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

Operator = op:("=" / "!=" / ">" / "<" / ">=" / "<=" / "$=")+

Escape = "\\"

_ "whitespace" = [ \t\r\0]* 
