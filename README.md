# DynamoDB-mini

## Description

Multiple parallel data storages with only two AWS DynamoDB tables.

All collections and entries in them are versioned, and you have easy access to the full history of any collection or entry. Currently only soft-delete is supported.

![High-level diagram](/docs/dynamodb-mini.diagram.png)

DynamoDB-mini has an opinionated key structure that separates stored data by following properties
* *application*, [defined in api keys](env/api-keys.test.json)
* *user*, username or ID as parameter from client, see below
* *collection*, collection name as parameter from client, see below

Ideal use case:
* Requirement for multiple data collections, whether it's due to multiple applications, users or user collections
* Requirement for easy versioning of data
* Low overall traffic, or generally no desire to pay for read and write capacity per table
* Occasional burst traffic, with read and write capacity of only two tables serving multiple traffic sources simultaneously

## Basic usage

Create a file `api-keys.json` for your API keys

```
[
    {
        "application": "test-app",
        "key": "my-api-key"
    }
]
```

Run server with your AWS credentials and mount `api-keys.json`

```
docker run \
    -d \
    --env AWS_ACCESS_KEY_ID=my-aws-access-key \
    --env AWS_SECRET_ACCESS_KEY=my-aws-secret-access-key \
    --env AWS_REGION=eu-central-1 \
    --volume $(pwd)/api-keys.json:/app/env/api-keys.json \
    --publish 3000:3000 \
    --name dynamodb-mini-server \
    aumbadgah/dynamodb-mini-server:latest
```

Define client

```
import dynamomini from 'dynamodb-mini'

const store = dynamomini({
    apiSecret: 'my-api-key',
    axiosOptions: {
        timeout: 60000,
    },
    baseURL: 'http://localhost:3000',
});
```

Save and fetch data

```
const collection = store.create('user-1', {
    name: 'posts',
});

collection.add({
    name: 'post-3888288822',
    value: {
        body: 'om my gosh',
        bg: {
            img: 'pic.png',
        },
        happinessIndex: 9,
    },
});

const user1Collections = store.getByUser('user-1');

const allCollections = store.get();
```

## Server

#### Run local development server

Create `env/secrets.env` file with your AWS credentials

```
AWS_ACCESS_KEY_ID=my-access-key-id
AWS_SECRET_ACCESS_KEY=my-secret-access-key
```

Run local environment

`docker-compose up`

### Environment variables

#### DEBUG
Default value `false`

#### PORT
Default value `3000`

#### AWS_ACCESS_KEY_ID
Required, see [aws-sdk docs for setting credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html)

Make sure this user has permissions to read and write to DynamoDB tables, and if necessary, to create tables.

#### AWS_SECRET_ACCESS_KEY
Required, see [aws-sdk docs for setting credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html)

#### AWS_SESSION_TOKEN
Optional, see [aws-sdk docs for setting credentials](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html)

#### AWS_REGION
Required, see
- [aws-sdk docs for setting region](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-region.html)
- [aws-sdk docs for setting global config](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/global-config-object.html)

#### AWS_DYNAMODB_CONSISTENT_READ
Default value `true`

Choose between `true` for consistency, or `false` for faster operations. See [AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html) for more information on read consistency.

#### AWS_DYNAMODB_READ_CAPACITY_UNITS
Default value `1`

Only has effect if the table does **not** already exist.

See limits for capacity units in [AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#default-limits-throughput-capacity-modes)

#### AWS_DYNAMODB_WRITE_CAPACITY_UNITS
Default value `1`

Only has effect if the table does **not** already exist.

See limits for capacity units in [AWS docs](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#default-limits-throughput-capacity-modes)

#### AWS_DYNAMODB_RETRY_BASE_DELAY
DynamoDB client retry delay for retryable errors. The base number of milliseconds to use in the exponential backoff for operation retries, defaults to 50ms. See [AWS docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html) for details.

#### TABLE_NAME_COLLECTIONS
Default value `dynamomini.collections`

#### TABLE_NAME_ENTRIES
Default value `dynamomini.entries`


## Client

#### Basic usage

Install package

```
npm install dynamodb-mini
```

Instantiate dynamodb-mini client

```
import dynamomini from 'dynamodb-mini'

const store = dynamomini({
    apiSecret: 'my-secret-api-key',
    baseURL: 'http://localhost:3000/api',
});
```

Store and fetch data

```
const collection = store.create('user-1', {
    name: 'posts',
});

collection.add({
    name: 'post-3888288822',
    value: {
        body: 'om my gosh',
        bg: {
            img: 'pic.png',
        },
        happinessIndex: 9,
    },
});

const user1Collections = store.getByUser('user-1');

const allCollections = store.get();
```

#### dynamomini(options)

Create a dynamodb-mini store client

```
import dynamomini from 'dynamodb-mini'

const store = dynamomini({
    apiSecret: 'my-api-key',
    baseURL: 'http://localhost:3000',
});
```

##### options.apiSecret
String, required

Your application's secret API key, that should be listed in the `api-keys.json` file.

##### options.baseURL
String, required

URL to your `dynamodb-mini` server

##### options.axiosOptions
See [Axios Request Config](https://github.com/axios/axios#request-config) docs for details.

Notice that DynamoDB-mini extends on the `options.axiosOptions.baseURL` value.

#### store.create(user, options)
Create a collection for the user.

This is safe to execute even if the collection for the user already exists.

```
store.create('39993922388', {
    name: 'subscriptions',
});
```

##### user
String, required

Username or user ID, without spaces, prefer lowercase

##### options.name
String, required

Name of the collection, without spaces, prefer lowercase

#### store.get(options)
Get all collections for all the users of your application

```
store.get();
```

##### options.filter
String, default value `latest`

`latest` Return latest non-deleted collections

`current` Return all latest collection versions, including deleted collections

#### store.getByUser(user, options)
Get all collections in your application for a specific user

```
const collections = await store.getByUser('iliketurtles');
```

##### user
String, required

ID or username of the user, without spaces, prefer lowercase. For example a Facebook OAuth user ID

##### options.filter
String, default value `latest`

`latest` Return latest non-deleted collections

`current` Return all latest collection versions, including deleted collections

#### collection.get(options)

Get the latest versions of all entries in the collection

```
const collections = await store.getByUser('iliketurtles');
const collection = collections.find(c => c.name === 'options');
const entries = await collection.get();
```

Returns an array of entry objects

##### options.filter
String, default value `latest`

`latest` Return latest non-deleted entries

`current` Return all latest entries, including deleted ones

#### collection.fetchEntry(entry, options)

Get the latest version of an entry in the collection

```
const collections = await store.getByUser('iliketurtles');
const collection = collections.find(c => c.name === 'options');
const entry = await collection.fetchEntry('feature-toggles');
```

Returns an entry object

##### entry
String, required

Unique name or ID of the entry in the collection, without spaces, prefer lowercase

##### options.filter
String, default value `latest`

`latest` Return latest non-deleted entries

`current` Return all latest entries, including deleted ones

#### collection.add(options)
Create a new entry into a collection.

```
const collection = store.create('my-other-username', {
    name: 'posts',
});

collection.add({
    name: '3888288822-my-post-name',
    value: {
        body: {
            ...
        },
        bg: {
            img: '...',
        },
        happinessIndex: 9,
    },
});
```

##### options.value
Object, required

Data property of the entry.

##### options.name
String, required

Name of the new entry, without spaces, prefer lowercase

#### collection.update(options)
Rename the collection instance.

Affects the single collection only, not all collections with identical name.

```
let collections = await store.get();
collections = collections.filter(c => c.name === 'temp-collection');

const collection = collections.pop();
await collection.update({
    name: 'new-feature-collection',
});
```

##### options.name
String, required

New name of the collection, without spaces, prefer lowercase

#### collection.destroy()
Soft-delete the collection for the user.

The collection will still be accessible by setting the query filter option to `current`

```
const collections = await store.getByUser('iliketurtles');
const collection = collections.find(c => c.name === 'temp-collection');

collection.destroy();

// only includes non-deleted collections of the user
store.getByUser('iliketurtles');

// includes the latest, freshly deleted version of the collection
store.getByUser('iliketurtles', {
    filter: 'current',
});
```

#### entry.update(options)
Update a single entry's name and data content

```
const collections = await store.getByUser('iliketurtles');
const collection = collections.find(c => c.name === 'options');

const entry = await collection.fetchEntry('temp-toggles');

await entry.update({
    name: 'feature-toggles',
    value: {
        ...
    },
});
```

##### options.name
String, default's to the old name

New name of the entry, without spaces, prefer lowercase

##### options.value
Object, default's to the old value

New data property of the entry.

#### entry.destroy()
Soft-delete the entry in the collection.

```
const collections = await store.getByUser('iliketurtles');
const collection = collections.find(c => c.name === 'options');

const entry = await collection.fetchEntry('temp-toggles');
const entry.destroy();
```
