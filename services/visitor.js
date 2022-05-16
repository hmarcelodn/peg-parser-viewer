export class THLVisitor {
    interpret(text) {
        try {
          const ast = this.parser.parse(text.toString());
          return this.visitAst(ast);
        } catch (e) {
          throw new HttpException(
            400,
            `Line ${e.location.start.line}, column ${e.location.start.column}, ${e.message}`,
          )
        }
      }
    
    questionToken = {
        getGlobalRegex: () => /\[q#([0-9]+)\]/g,
        getConditionParamRegex: () => /q#([0-9]+)/g,
    };
    
    variableToken = {
        getGlobalRegex: () => /\[v#([0-9]+)\]/g,
        getConditionParamRegex: () => /v#([0-9]+)/g,
    };
      
    constantToken = {
        getGlobalRegex: () => /\[c#([0-9]+)\]/g,
        getConditionParamRegex: () => /c#([0-9]+)/g,
    };
    
    replaceQuestionTokens() {
        return 'Question1'
    }
    
    replaceVariables(text, variables, re = this.variableToken.getGlobalRegex()) {
        return text ? 'Variable1' : '';
    }
      
    replaceConstants(text, constants, re = this.constantToken.getGlobalRegex()) {
        return text ? 'Constant1' : '';
    }
    
    replaceDynamicTokens(value) {
        if (this.questionToken.getGlobalRegex().test(value)) {
            return this.replaceQuestionTokens(value, this.answers, this.questions);
        }

        if (this.questionToken.getConditionParamRegex().test(value)) {
            return this.replaceQuestionTokens(value, this.answers, this.questions, this.questionToken.getConditionParamRegex());
        }

        if (this.variableToken.getGlobalRegex().test(value)) {
            return this.replaceVariables(value, this.variables);
        }        

        if (this.variableToken.getConditionParamRegex().test(value)) {
            return this.replaceVariables(value, this.variables, this.variableToken.getConditionParamRegex());
        }

        if (this.constantToken.getGlobalRegex().test(value)) {
            return this.replaceConstants(value, this.constants);
        }

        if (this.constantToken.getConditionParamRegex().test(value)) {
            return this.replaceConstants(value, this.constants, this.constantToken.getConditionParamRegex());
        }

        return value;
    }
    
    evaluateConditionTerm(lhs, rhs, op) {
        console.log('valid', lhs, rhs, parseFloat(lhs) < parseFloat(rhs))

        lhs = this.replaceDynamicTokens(lhs);
        rhs = this.replaceDynamicTokens(rhs);
        
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
            return lhs.trim().includes(rhs.trim());
          case '=':
            return lhs.trim() === rhs.trim();
          case '!=':
            return lhs.trim() !== rhs.trim();
          default:
            return false;
        }
    }
    
    visitBooleanExpressions(tree) {
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
                recursiveResult = this.visitBooleanExpressions(predicates[i]);
             } else {
                const { lhs, rhs, op } = predicateExpressionNode;
                results.push(this.evaluateConditionTerm(lhs, rhs, op));                
             }
          }
    
          if (operator === '||') {
            return results.some(r => r === true) || (hasRecursion ? recursiveResult: true);
          }
          return results.every(r => r === true) && (hasRecursion ? recursiveResult : true);
        }
    
        return this.evaluateConditionTerm(tree.lhs, tree.rhs, tree.op);
      }
    
    visitAst(ast) {
        let template = '';
    
        if (ast.length) {
          template = ast.reduce((acc, node) => {
            if (typeof node === 'string') {
              acc += this.replaceDynamicTokens(node);
            }
    
            if (typeof node === 'object') {
              const { conditionalStatement } = node;
              const { conditional, body1, body2 } = conditionalStatement;
              const result = this.visitBooleanExpressions(conditional);
              
              if (result) {
                acc += this.visitAst(body1);
              } else {
                acc += this.visitAst(body2);
              }
            }
    
            return acc;
          }, '');
        }
    
        return template;
    }
}