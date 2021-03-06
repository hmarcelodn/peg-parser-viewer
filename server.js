import peg from 'pegjs';
import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import { THLVisitor  } from './services/visitor';

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const defaultExpression = `
This is a test template ([q#1]) ([v#1]) ([c#1])
[if condition='[q#1]="Test Question"']Worked Questions[/if]
[if condition='[v#1]="Test Variable"']Worked Variables[/if]
[if condition='[c#1]="Test Constant"']Worked Constants[/if]
[if condition='1=1']Worked numbers[else]Worked numbers better![/if]
[if condition='"abc"="abc"']Worked letters![else]Worked letters better![/if]
[if condition='true=false']Worked booleans![else]Worked booleans better![/if]
[if condition='true=true'][if condition='true=true'][if condition='true=true']Nested[/if][/if][/if]
and its closing
`;
const defaultGrammar = fs.readFileSync('./grammar3.pegjs', 'utf-8');
const thlParser = peg.generate(defaultGrammar.toString());
const thlVisitor = new THLVisitor();

app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '900mb'}));
app.use(bodyParser.urlencoded({limit: '900mb', extended: true}));

router.get('/', (req, res) => {
    let parserError = '';
    let template = '';

    try {
        const thlAst = thlParser.parse(defaultExpression);
        template = thlVisitor.visitAst(thlAst);
    } catch(e) {
        parserError = `Line ${e.location.start.line}, column ${e.location.start.column}, ${e.message}`;
    }

    res.render('pages/index', {
        data: {
            expression: defaultExpression,
            results: template,
            parserError,
        },
    });
});

router.post('/', (req, res) => {
    let parserError = '';
    let template = '';

    try {
        const thlAst = thlParser.parse(req.body.expression);
        template = thlVisitor.visitAst(thlAst);
    } catch(e) {
        parserError = `Line ${e.location.start.line}, column ${e.location.start.column}, ${e.message}`;
    }

    res.render('pages/index', {
        data: {
            expression: req.body.expression,
            results: template,
            parserError,
        },
    });
});

app.use('/', router);

app.listen(port, () => {
    console.log(`PEG Web Parser Viewer listening on port ${port}`);
});
