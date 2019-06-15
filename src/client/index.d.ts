import { AxiosRequestConfig } from 'axios';
export declare const Store: (params: {
    apiSecret: string;
    axiosOptions?: AxiosRequestConfig | undefined;
    baseURL: string;
}) => {
    getCollections: (params: {
        user?: string | undefined;
        filter?: "latest" | "current" | undefined;
    }) => Promise<any>;
    addCollection: (params: {
        user: string;
        name: string;
    }) => Promise<{
        name: string;
    } | undefined>;
};
export default Store;
