import { loadCommandList } from './utils/commandListLoader.js';

try {
    const categories = loadCommandList();
    console.log("Categories Strings:", [...categories.keys()]);
    console.log("Category Count:", categories.size);
    if (categories.size === 0) {
        console.error("Categories are empty!");
    }
} catch (error) {
    console.error("Error loading commands:", error);
}
