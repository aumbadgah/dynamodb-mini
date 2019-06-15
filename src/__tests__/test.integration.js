import head from 'lodash/head';
import tail from 'lodash/tail';
import get from 'lodash/get';
import randomstring from 'randomstring';
import uniqBy from 'lodash/uniqBy';

import dynamomini from '../client/index';

jest.setTimeout(120000);

const baseURL = process.env.DYNAMODB_MINI_API;

const apiSecret = 'my-api-key';

const destroyRecursive = async (collections) => {
    const collection = head(collections);

    if (!collection) {
        return Promise.resolve();
    }

    await collection.destroy();

    return destroyRecursive(tail(collections));
};

const validateCollection = (collection, options) => {
    const user = get(options, 'meta.user', 'test-user');
    const name = get(options, 'name', null);

    expect(collection.meta.application).toEqual('test-app');
    expect(collection.meta.user).toEqual(expect.stringContaining(user));
    expect(collection.meta.collection).toBeDefined();
    expect(collection.meta.version).toBeDefined();

    if (name) {
        expect(collection.name).toEqual(name);
    }
};

describe('client', async () => {
    let store;

    const cleanupOldCollections = async (user) => {
        const oldCollections = await store.getCollections({
            user,
        });
        if (oldCollections) {
            await destroyRecursive(oldCollections);
        }
    };

    const cleanupOldCollectionsAllRecursive = async (collections) => {
        const first = head(collections);
        if (!first) {
            return Promise.resolve();
        }
        await first.destroy();
        return cleanupOldCollectionsAllRecursive(tail(collections));
    };

    const cleanupOldCollectionsAll = async () => {
        const collections = await store.getCollections();
        return cleanupOldCollectionsAllRecursive(collections);
    };

    describe('init', async () => {
        test('should return a store', async () => {
            store = dynamomini({
                apiSecret,
                axiosOptions: {
                    timeout: 60000,
                },
                baseURL,
            });

            expect(store.getCollections).toBeDefined();
            expect(store.addCollection).toBeDefined();
        });
    });

    describe('store.addCollection', async () => {
        test('should create a valid collection', async () => {
            const user = 'test-user-1';
            const name = 'messages';

            await cleanupOldCollections(user);

            const collection1 = await store.addCollection({
                user,
                name,
            });
            validateCollection(collection1, {
                name,
            });
            expect(collection1.meta.user).toEqual(user);
            expect(collection1.deletedAt).toBeNull();

            const collection2 = await store.addCollection({
                user,
                name,
            });
            validateCollection(collection2, {
                name,
            });
            expect(collection2.meta.user).toEqual(user);
            expect(collection2.deletedAt).toBeNull();
        });
    });

    describe('store.getCollections', async () => {
        const name = 'messages';
        const testUsers = [
            'test-user-1',
            'test-user-2',
            'test-user-3',
            'test-user-4',
        ];

        test('should return all collections for all the users of an application', async () => {
            let collections;

            await cleanupOldCollectionsAll();

            collections = await store.getCollections();
            expect(collections.length).toEqual(0);

            const collection1 = await store.addCollection({
                user: 'test-user-1',
                name,
            });
            collections = await store.getCollections();
            expect(collections.length).toEqual(1);

            const collection2 = await store.addCollection({
                user: 'test-user-2',
                name,
            });
            collections = await store.getCollections();
            expect(collections.length).toEqual(2);

            collections.forEach((collection) => {
                validateCollection(collection, {
                    name,
                });
                expect(collection.deletedAt).toBeNull();
            });

            await collection1.destroy();
            collections = await store.getCollections();
            expect(collections.length).toEqual(1);

            collections.forEach((collection) => {
                validateCollection(collection, {
                    name,
                });
                expect(collection.deletedAt).toBeNull();
            });

            uniqBy(collections, 'meta.collection');

            await collection2.destroy();
            collections = await store.getCollections();
            expect(collections.length).toEqual(0);
        });

        test('same, should include deleted collections', async () => {
            let collections;

            await cleanupOldCollectionsAll(testUsers);

            collections = await store.getCollections();
            expect(collections.length).toBeGreaterThanOrEqual(0);

            const collection1 = await store.addCollection({
                user: 'test-user-1',
                name: 'posts',
            });
            collections = await store.getCollections({
                filter: 'current',
            });
            expect(collections.length).toBeGreaterThanOrEqual(1);

            const collection2 = await store.addCollection({
                user: 'test-user-2',
                name: 'messages',
            });
            collections = await store.getCollections({
                filter: 'current',
            });
            expect(collections.length).toBeGreaterThanOrEqual(2);

            collections.forEach((collection) => {
                validateCollection(collection);
                expect(collection.deletedAt).toBeNull();
            });

            await collection1.destroy();
            collections = await store.getCollections({
                filter: 'current',
            });
            expect(collections.length).toBeGreaterThanOrEqual(2);

            collections.forEach((collection) => {
                validateCollection(collection);
                expect(collection.deletedAt).toBeNull();
            });

            uniqBy(collections, 'meta.collection');

            await collection2.destroy();
            collections = await store.getCollections({
                filter: 'current',
            });
            expect(collections.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('store.getCollections single user', async () => {
        test('should return latest versions of all non-deleted collections for a single user', async () => {
            const user = 'test-user-3';
            let collections;

            await cleanupOldCollections(user);

            collections = await store.getCollections({
                user,
            });

            expect(collections.length).toEqual(0);

            await store.addCollection({
                user,
                name: 'foo',
            });

            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(1);

            const collection2 = await store.addCollection({
                user,
                name: 'bar',
            });

            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(2);

            collections.forEach((collection) => {
                validateCollection(collection);
                expect(collection.deletedAt).toBeNull();
                expect(collection.meta.user).toEqual(user);
            });

            uniqBy(collections, 'meta.collection');

            await collection2.destroy();
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(1);
        });
        test('same, with deleted collections included', async () => {
            const slug = randomstring.generate(7);
            const user = `test-user-${slug}`;

            let collections;

            await cleanupOldCollections(user);
            collections = await store.getCollections({
                filter: 'current',
                user,
            });

            expect(collections.length).toBeGreaterThanOrEqual(0);

            await store.addCollection({
                user,
                name: 'foo',
            });

            collections = await store.getCollections({
                filter: 'current',
                user,
            });
            expect(collections.length).toBeGreaterThanOrEqual(1);

            const collection2 = await store.addCollection({
                user,
                name: 'bar',
            });

            collections = await store.getCollections({
                filter: 'current',
                user,
            });
            expect(collections.length).toBeGreaterThanOrEqual(2);

            collections.forEach((collection) => {
                validateCollection(collection);
                expect(collection.deletedAt).toBeNull();
                expect(collection.meta.user).toEqual(user);
            });

            uniqBy(collections, 'meta.collection');

            await collection2.destroy();
            collections = await store.getCollections({
                filter: 'current',
                user,
            });
            expect(collections.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('collection.getEntry', async () => {
        test('should return latest versions of all non-deleted entries', async () => {
            const user = 'test-user-4';
            const name = 'messages';

            let entries;

            await cleanupOldCollections(user);

            const collection = await store.addCollection({
                user,
                name,
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(0);

            const first = await collection.addEntry({
                name: 'first message',
                value: {
                    body: 'foo',
                    public: false,
                },
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(1);

            const second = await collection.addEntry({
                name: 'second message',
                value: {
                    body: 'bar',
                    public: true,
                    something: 'else',
                },
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(2);

            await collection.addEntry({
                name: 'third message',
                value: {
                    body: 'canyon treats',
                    was: 'ist',
                },
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(3);

            await second.destroy();

            entries = await collection.getEntries();
            expect(entries.length).toEqual(2);

            await first.destroy();

            entries = await collection.getEntries();
            expect(entries.length).toEqual(1);
        });

        test('same, should respect current filter', async () => {
            const user = 'test-user-4';
            const name = 'messages';

            let entries;

            await cleanupOldCollections(user);

            const collection = await store.addCollection({
                user,
                name,
            });

            entries = await collection.getEntries({
                filter: 'current',
            });
            expect(entries.length).toBeGreaterThanOrEqual(0);

            const first = await collection.addEntry({
                name: 'first message',
                value: {
                    body: 'foo',
                    public: false,
                },
            });

            entries = await collection.getEntries({
                filter: 'current',
            });
            expect(entries.length).toBeGreaterThanOrEqual(1);

            const second = await collection.addEntry({
                name: 'second message',
                value: {
                    body: 'bar',
                    public: true,
                    something: 'else',
                },
            });

            entries = await collection.getEntries({
                filter: 'current',
            });
            expect(entries.length).toBeGreaterThanOrEqual(2);

            await collection.addEntry({
                name: 'third message',
                value: {
                    body: 'canyon treats',
                    was: 'ist',
                },
            });

            entries = await collection.getEntries({
                filter: 'current',
            });
            expect(entries.length).toBeGreaterThanOrEqual(3);

            await second.destroy();

            entries = await collection.getEntries({
                filter: 'current',
            });
            expect(entries.length).toBeGreaterThanOrEqual(3);

            await first.destroy();

            entries = await collection.getEntries({
                filter: 'current',
            });
            expect(entries.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('collection.addEntry', async () => {
        test('should add entry into collection', async () => {
            const user = 'test-user-1';
            const name = 'happyThoughts';

            const entry1Contents = {
                name: 'cows are nice',
                value: {
                    body: 'they say moo',
                    arms: false,
                },
            };
            const entry2Contents = {
                name: 'chickens are nice',
                value: {
                    body: 'they say meow',
                    arms: true,
                },
            };

            const validateEntry = (entry, contents) => {
                expect(entry.name).toEqual(contents.name);
                expect(entry.value.body).toEqual(contents.value.body);
                expect(entry.value.arms).toEqual(contents.value.arms);
            };

            let entries;

            await cleanupOldCollections(user);

            const collection = await store.addCollection({
                user,
                name,
            });
            expect(collection.addEntry).toBeDefined();
            entries = await collection.getEntries();
            expect(entries.length).toEqual(0);

            const entry1 = await collection.addEntry({
                name: entry1Contents.name,
                value: entry1Contents.value,
            });
            validateEntry(entry1, {
                name: entry1Contents.name,
                value: entry1Contents.value,
            });
            entries = await collection.getEntries();
            expect(entries.length).toEqual(1);

            const entry2 = await collection.addEntry({
                name: entry2Contents.name,
                value: entry2Contents.value,
            });
            validateEntry(entry2, {
                name: entry2Contents.name,
                value: entry2Contents.value,
            });
            entries = await collection.getEntries();
            expect(entries.length).toEqual(2);
        });
    });

    describe('collection.update', async () => {
        test('should update collection', async () => {
            const user = 'test-user-7';
            const collection1name = 'buu-yah';
            const collection2name = 'buu-ugh';

            const collection1 = await store.addCollection({
                user,
                name: collection1name,
            });

            validateCollection(collection1, {
                user,
                name: collection1name,
            });
            const collection2 = await store.addCollection({
                user,
                name: collection2name,
            });
            validateCollection(collection2, {
                user,
                name: collection2name,
            });

            await collection1.update({
                name: 'boo-hoo',
            });

            validateCollection(collection1, {
                user,
                name: 'boo-hoo',
            });
            validateCollection(collection2, {
                user,
                name: collection2name,
            });
        });
    });

    describe('collection.destroy', async () => {
        test('should destroy collection', async () => {
            const user = 'test-user-6';
            const collection1name = 'kittie-pics';
            const collection2name = 'puppy-pics';
            const collection3name = 'goat-pics';

            let collections;

            await cleanupOldCollections(user);
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(0);

            const collection1 = await store.addCollection({
                user,
                name: collection1name,
            });
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(1);

            const collection2 = await store.addCollection({
                user,
                name: collection2name,
            });
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(2);

            await collection1.destroy();
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(1);

            collections.forEach((c) => {
                expect(c.name).toBeDefined();
                expect(c.name).not.toEqual(collection1name);
            });

            const collection3 = await store.addCollection({
                user,
                name: collection3name,
            });
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(2);

            await collection3.destroy();
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(1);

            collections.forEach((c) => {
                expect(c.name).toBeDefined();
                expect(c.name).not.toEqual(collection3name);
            });

            await collection2.destroy();
            collections = await store.getCollections({
                user,
            });
            expect(collections.length).toEqual(0);
        });
    });

    describe('entry.update', async () => {
        test('should update entry', async () => {
            const user = 'test-user-7';
            const e1name = 'harpies';
            const e2name = 'herpes';

            const collection = await store.addCollection({
                user,
                name: 'words',
            });

            const entry1 = await collection.addEntry({
                name: e1name,
                value: {
                    key: 'value',
                },
            });

            const entry2 = await collection.addEntry({
                name: e2name,
                value: {
                    key: 'value',
                },
            });

            await entry1.update({
                name: 'boo-hoo',
                value: entry1.value,
            });

            expect(entry1.name).toEqual('boo-hoo');
            expect(entry1.value.key).toBeDefined();
            expect(entry1.value.key).toEqual('value');

            await entry2.update({
                name: 'super-serial',
                value: {
                    something: 'else',
                },
            });

            expect(entry2.name).toEqual('super-serial');
            expect(entry2.value.key).toBeUndefined();
            expect(entry2.value.something).toBeDefined();
            expect(entry2.value.something).toEqual('else');
        });
    });

    describe('entry.destroy', async () => {
        test('should destroy entry', async () => {
            const user = 'test-user-7';

            const e1name = 'schnee 1';
            const e2name = 'schnee 2';
            const e3name = 'schnee 3';

            let entries;

            await cleanupOldCollections(user);

            const collection = await store.addCollection({
                user,
                name: 'schnees',
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(0);

            const entry1 = await collection.addEntry({
                name: e1name,
                value: {
                    keyOne: 'valueOne',
                },
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(1);

            const entry2 = await collection.addEntry({
                name: e2name,
                value: {
                    keyTwo: 'valueTwo',
                },
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(2);

            await entry1.destroy();

            entries = await collection.getEntries();
            expect(entries.length).toEqual(1);
            entries.forEach((e) => {
                expect(e.name).toBeDefined();
                expect(e.name).not.toEqual(e1name);
            });

            const entry3 = await collection.addEntry({
                name: e3name,
                value: {
                    keyThree: 'valueThree',
                },
            });

            entries = await collection.getEntries();
            expect(entries.length).toEqual(2);

            await entry3.destroy();

            entries = await collection.getEntries();
            expect(entries.length).toEqual(1);
            entries.forEach((e) => {
                expect(e.name).toBeDefined();
                expect(e.name).not.toEqual(e3name);
            });

            await entry2.destroy();

            entries = await collection.getEntries();
            expect(entries.length).toEqual(0);
        });
    });
});
