import ImageKit from "imagekit";
import ImageKitNodeJS from "@imagekit/nodejs";

console.log("ImageKit (package imagekit):", ImageKit);
console.log("ImageKitNodeJS (package @imagekit/nodejs):", ImageKitNodeJS);

const ik1 = new ImageKit({
    publicKey: "test",
    privateKey: "test",
    urlEndpoint: "test"
});
console.log("ik1.deleteFile:", typeof ik1.deleteFile);

// Try ImageKitNodeJS if it's a constructor
if (typeof ImageKitNodeJS === 'function') {
    const ik2 = new ImageKitNodeJS({
        publicKey: "test",
        privateKey: "test",
        urlEndpoint: "test"
    });
    console.log("ik2.deleteFile:", typeof ik2.deleteFile);
}
