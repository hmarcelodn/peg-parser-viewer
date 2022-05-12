import peg from 'pegjs';
import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import { THLVisitor  } from './services/visitor';

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const defaultExpression = `
This is a test template
[if condition='[q#1]="Test Question"']Worked Questions[/if]
[if condition='[v#1]="Test Variable"']Worked Variables[/if]
[if condition='[c#1]="Test Constant"']Worked Constants[/if]
[if condition='1=1']Worked numbers[else]Worked numbers better![/if]
[if condition='"abc"="abc"']Worked letters![else]Worked letters better![/if]
[if condition='true=false']Worked booleans![else]Worked booleans better![/if]
[if condition='true=true'][if condition='true=true'][if condition='true=true']Nested[/if][/if][/if]
and its closing
`;
const defaultGrammar = fs.readFileSync('./grammar2.pegjs', 'utf-8');
const thlParser = peg.generate(defaultGrammar.toString());
const thlVisitor = new THLVisitor();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

router.get('/', (req, res) => {
    const thlAst = thlParser.parse(defaultExpression);
    const template = thlVisitor.visit(thlAst);

    res.render('pages/index', {
        data: {
            expression: defaultExpression,
            results: template,
        },
    });
});

router.post('/', (req, res) => {
    const thlAst = thlParser.parse(req.body.expression);
    const template = thlVisitor.visit(thlAst);

    res.render('pages/index', {
        data: {
            expression: req.body.expression,
            results: template,
        },
    });
});

app.use('/', router);

app.listen(port, () => {
    console.log(`PEG Web Parser Viewer listening on port ${port}`);
});
