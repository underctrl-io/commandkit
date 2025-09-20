# @commandkit/queue

Service agnostic message queue api for commandkit

## Installation

```bash
npm install @commandkit/queue
```

## Usage

### Driver configuration

#### `@discordjs/brokers`

First you need to install the dependencies:

```bash
npm install @discordjs/brokers ioredis
```

```typescript
import Redis from 'ioredis';
import { PubSubRedisBroker } from '@discordjs/brokers';
import { RedisPubSubDriver } from '@commandkit/queue/discordjs';
import { setDriver } from '@commandkit/queue';

const broker = new PubSubRedisBroker(new Redis());
const driver = new RedisPubSubDriver(broker);

setDriver(driver);
```

### Example of sending and receiving a message

```typescript
import { send, receive } from '@commandkit/queue';

// publisher
await send('topic', { message: 'Hello World!' });

// subscriber
await receive('topic', (m) => {
    console.log(m.message); // "Hello World!"
});
```

## Documentation
https://commandkit.dev/docs/next/api-reference/queue
