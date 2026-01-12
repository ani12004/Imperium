import { getEconomy } from './utils/database.js';

(async () => {
    try {
        console.log("Testing getEconomy...");
        const user = await getEconomy('123456789');
        console.log("Result:", user);
        console.log("Success!");
    } catch (error) {
        console.error("Failed:", error);
    }
})();
