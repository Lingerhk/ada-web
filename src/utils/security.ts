
export const base32Encode = (arrayBuffer: ArrayBufferLike) => {
    const base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    let bits = 0;
    let value = 0;

    for (const byte of new Uint8Array(arrayBuffer)) {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5) {
            result += base32[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        result += base32[(value << (5 - bits)) & 31];
    }

    return result;
};

export const generateSecret = (length = 16) => {
    const randomBytes = new Uint8Array(length);
    window.crypto.getRandomValues(randomBytes);

    return base32Encode(randomBytes.buffer).substring(0, length);
};

export const generateTotp = (secret: string, username: string, issuer: string = 'ADAWebManage', alg: string = 'SHA1', digits: number = 6) => {
    return `otpauth://totp/${username}?secret=${secret}&issuer=${issuer}&algorithm=${alg}&digits=${digits}&period=30`
}