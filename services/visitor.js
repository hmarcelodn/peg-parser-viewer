export class THLVisitor {
    tokenize(value) {
        // If question, get value
        if (/\[q#[0-9]+\]/.test(value)) {
            return "Test Question"
        }

        if (/\[v#[0-9]+\]/.test(value)) {
            return "Test Variable"
        }        

        if (/\[c#[0-9]+\]/.test(value)) {
            return "Test Constant"
        }

        return value;
    }

    compare(lhs, rhs, op) {
        lhs = this.tokenize(lhs);
        rhs = this.tokenize(rhs);
        
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

    visit(ast) {
        let template = '';

        if (ast.length) {
            template = ast.reduce((acc, node) => {
                if (typeof node === 'string') {
                    acc += node;
                }

                if (typeof node === 'object') {
                    const { conditionalStatement } = node;
                    const { conditional, body1, body2 } = conditionalStatement;
                    const { lhs, rhs, op } = conditional;
                    const result = this.compare(lhs, rhs, op);
                    
                    if (result) {
                        acc += this.visit(body1);
                    } else {
                        acc += this.visit(body2);
                    }
                }

                return acc;
            }, '');
        }

        return template;
    }
}