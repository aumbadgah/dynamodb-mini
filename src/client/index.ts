import { URL } from 'url';
import axios, { AxiosRequestConfig } from 'axios';
import lodashGet from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';

import Collection, { CollectionRawType } from './collection.class';

export const Store = (params: {
    apiSecret: string,
    axiosOptions?: AxiosRequestConfig,
    baseURL: string,
}) => {
    const {
        apiSecret,
        baseURL,
    } = params;

    if (isEmpty(apiSecret)) {
        throw new Error('Missing a required parameter \'apiSecret\'');
    }
    if (isEmpty(baseURL)) {
        throw new Error('Missing a required parameter \'baseURL\'');
    }

    const url = new URL('api', baseURL);

    let axiosOptions = {
        baseURL: url.toString(),
    };

    if (params.axiosOptions) {
        axiosOptions = merge({}, params.axiosOptions, axiosOptions);
    }

    const api = axios.create(axiosOptions);
    api.defaults.headers.common['x-api-key'] = apiSecret;

    const createCollection = (params: {
        user: string;
        name: string;
    }) => api
        .post(`/user/${params.user}/collection`, {
            name: params.name,
        })
        .catch((error) => {
            throw new Error(error);
        });

    const getCollections = async (params: {
        user?: string,
        filter?: 'current' | 'latest',
    }) => {
        const user = lodashGet(params, 'user', '');
        const filter = lodashGet(params, 'filter', 'latest');
        let path;

        if (isEmpty(user)) {
            path = '/collection';
        } else {
            path = `/user/${user}/collection`;
        }

        return api
            .get(path, {
                params: {
                    filter,
                },
            })
            .then((response) => response.data)
            .then((rawCollections) => rawCollections.map((collectionRaw: CollectionRawType) => new Collection({
                api,
                collectionRaw,
            })))
            .catch((error) => {
                if (lodashGet(error, 'response.status') === 404) {
                    return null;
                }
                throw new Error(error);
            });
    }

    const addCollection = async (params: {
        user: string;
        name: string;
    }) => {
        const {
            user,
            name,
        } = params;
        let collections: Array<{
            name: string;
        }>;

        collections = await getCollections({ user });

        if (!isEmpty(collections)) {
            if (collections.some((c) => c.name === name)) {
                return await collections.find((c) => c.name === name);
            }
        }

        await createCollection({ user, name });

        collections = await getCollections({ user });

        if (!isEmpty(collections)) {
            return await collections.find((c) => c.name === name);
        }

        return Promise.reject();
    };

    return {
        getCollections,
        addCollection,
    };
};

export default Store;
