export async function validateType(req, res, next) {
    const { type } = req.params;

    if (!(type === 'income' || type == 'expense')) {
        res.status(422).send('Parâmetros inválidos!');
        return;
    }

    res.locals.type = type;
    next();
}