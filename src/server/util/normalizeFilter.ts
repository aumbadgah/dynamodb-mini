import * as express from 'express';
import isEmpty from 'lodash/isEmpty';

const filters = [
    {
        name: 'all',
    },
    {
        name: 'latest',
        default: true,
    },
    {
        name: 'current',
    },
];

const normalizeFilter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const defaultFilter = filters.find((filterConf) => filterConf.default || false);

    if (!defaultFilter) {
        throw new Error('Invalid collection query.filter configuration');
    }

    const isRequestedFilterValid = filters.some((filter) => filter.name === req.query.filter);

    if (isEmpty(req.query.filter) || !isRequestedFilterValid) {
        req.query.filter = defaultFilter.name;
    }

    next();
};

export default normalizeFilter;
