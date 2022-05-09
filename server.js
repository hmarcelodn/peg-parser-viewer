import peg from 'pegjs';
import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;
const defaultExpression = `
This is a test template
[if condition='1=1']Hello world![/if]
and it was already processed if you can see "Hello world!"
`;
const defaultGrammar = fs.readFileSync('./grammar.txt', 'utf-8');
const thlParser = peg.generate(defaultGrammar.toString());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

router.get('/', (req, res) => {
    res.render('pages/index', {
        data: {
            grammar: defaultGrammar.toString(),
            expression: defaultExpression,
            results: thlParser.parse(defaultExpression),
        },
    });
});

router.post('/', (req, res) => {
    const expression = req.body.expression;

    res.render('pages/index', {
        data: {
            grammar: defaultGrammar.toString(),
            expression: expression,
            results: thlParser.parse(expression),
        },
    });
});

app.use('/', router);

app.listen(port, () => {
    console.log(`PEG Web Parser Viewer listening on port ${port}`);
});
