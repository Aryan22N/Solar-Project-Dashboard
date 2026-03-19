import ImageKit from "imagekit";
const ImageKitSDK = ImageKit;

const sanitize = (val) => {
    if (!val) return "";
    return val.replace(/^["']|["']$/g, '').trim();
};

const IK_PUBLIC_KEY = sanitize(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY);
const IK_PRIVATE_KEY = sanitize(process.env.IMAGEKIT_PRIVATE_KEY);
const IK_URL_ENDPOINT = sanitize(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT);

if (!IK_PUBLIC_KEY || !IK_PRIVATE_KEY || !IK_URL_ENDPOINT) {
    console.warn("⚠️ ImageKit environment variables are missing!");
}

export { IK_PUBLIC_KEY, IK_PRIVATE_KEY, IK_URL_ENDPOINT };

export const imagekit = new ImageKitSDK({
    publicKey: IK_PUBLIC_KEY,
    privateKey: IK_PRIVATE_KEY,
    urlEndpoint: IK_URL_ENDPOINT,
});
