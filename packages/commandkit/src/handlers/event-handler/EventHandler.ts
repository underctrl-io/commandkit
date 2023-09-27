import type { EventHandlerOptions, EventHandlerData } from './typings';
import { getFilePaths, getFolderPaths } from '../../utils/get-paths';
import { toFileURL } from '../../utils/resolve-file-url';
import colors from '../../utils/colors';

export class EventHandler {
    #data: EventHandlerData;

    constructor({ ...options }: EventHandlerOptions) {
        this.#data = {
            ...options,
            events: [],
        };
    }

    async init() {
        await this.#buildEvents();
        this.#registerEvents();
    }

    async #buildEvents() {
        const eventFolderPaths = getFolderPaths(this.#data.eventsPath);

        for (const eventFolderPath of eventFolderPaths) {
            const eventName = eventFolderPath
                .replace(/\\\\|\\/g, '/')
                .split('/')
                .pop() as string;

            const eventFilePaths = getFilePaths(eventFolderPath, true).filter(
                (path) => path.endsWith('.js') || path.endsWith('.ts'),
            );

            const eventObj = {
                name: eventName,
                functions: [] as Function[],
            };

            this.#data.events.push(eventObj);

            for (const eventFilePath of eventFilePaths) {
                const modulePath = toFileURL(eventFilePath);

                let eventFunction = (await import(modulePath)).default;

                if (eventFunction?.default) {
                    eventFunction = eventFunction.default;
                }

                const compactFilePath = eventFilePath.split(process.cwd())[1] || eventFilePath;

                if (typeof eventFunction !== 'function') {
                    console.log(
                        colors.yellow(
                            `⏩ Ignoring: Event ${compactFilePath} does not export a function.`,
                        ),
                    );
                    continue;
                }

                eventObj.functions.push(eventFunction);
            }
        }
    }

    #registerEvents() {
        const client = this.#data.client;
        const handler = this.#data.commandKitInstance;

        for (const eventObj of this.#data.events) {
            client.on(eventObj.name, async (...params) => {
                for (const eventFunction of eventObj.functions) {
                    const stopEventLoop = await eventFunction(...params, client, handler);

                    if (stopEventLoop) {
                        break;
                    }
                }
            });
        }
    }

    get events() {
        return this.#data.events;
    }
}
