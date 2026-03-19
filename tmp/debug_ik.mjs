import { imagekit } from "../lib/imagekit.js";

function getAllMethods(obj) {
    let methods = new Set();
    while (obj = Object.getPrototypeOf(obj)) {
        let keys = Object.getOwnPropertyNames(obj);
        keys.forEach(k => {
            if (typeof obj[k] === 'function') methods.add(k);
        });
    }
    return Array.from(methods);
}

console.log("All methods on imagekit instance:", JSON.stringify(getAllMethods(imagekit)));
console.log("imagekit is instance of ImageKit?", "deleteFile" in imagekit);
