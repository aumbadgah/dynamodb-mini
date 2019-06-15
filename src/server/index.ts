import config from './config';
import app from './server';
import db from './db';

db.init().then(() => {
    app.listen(config.PORT, () => {
        console.log(`Store API listening in port ${config.PORT}`);
    });
});
