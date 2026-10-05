import SparkMD5 from 'spark-md5';

self.onmessage = async (e: MessageEvent) => {
    const { type, payload, algorithms, secret } = e.data;

    for (const algo of algorithms) {
        try {
            let result = '';
            if (type === 'file') {
                if (algo === 'MD5') {
                    result = await hashFileMD5(payload as File, secret);
                } else {
                    result = await hashFileSHA(payload as File, algo, secret);
                }
            } else {
                if (algo === 'MD5') {
                    result = hashTextMD5(payload as string, secret);
                } else {
                    result = await hashTextSHA(payload as string, algo, secret);
                }
            }
            self.postMessage({ algorithm: algo, hash: result });
        } catch (error) {
            self.postMessage({ algorithm: algo, error: (error as Error).message });
        }
    }
    self.postMessage({ done: true });
};

function hashTextMD5(text: string, secret?: string): string {
    if (secret) {
        return hmacMD5(text, secret);
    }
    return SparkMD5.hash(text);
}

async function hashFileMD5(file: File, secret?: string): Promise<string> {
    if (secret) {
        return hmacFileMD5(file, secret);
    }

    return new Promise((resolve, reject) => {
        const blobSlice = File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice;
        const chunkSize = 2097152;
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const spark = new SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();

        fileReader.onload = function (e) {
            spark.append(e.target?.result as ArrayBuffer);
            currentChunk++;
            if (currentChunk < chunks) {
                loadNext();
            } else {
                resolve(spark.end());
            }
        };

        fileReader.onerror = function () {
            reject('MD5 hashing failed');
        };

        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
    });
}

function hmacMD5(data: string, key: string): string {
    let k = key;
    if (k.length > 64) {
        k = hexToBinaryString(SparkMD5.hash(k));
    }
    if (k.length < 64) {
        k = k + String.fromCharCode(0).repeat(64 - k.length);
    }

    const ipad = Array(64).fill(0x36);
    const opad = Array(64).fill(0x5c);
    const kChars = k.split('').map(c => c.charCodeAt(0));
    const ipadKey = kChars.map((c, i) => c ^ ipad[i]).map(c => String.fromCharCode(c)).join('');
    const opadKey = kChars.map((c, i) => c ^ opad[i]).map(c => String.fromCharCode(c)).join('');
    const innerHash = SparkMD5.hashBinary(ipadKey + data);
    const innerHashBin = hexToBinaryString(innerHash);
    return SparkMD5.hashBinary(opadKey + innerHashBin);
}

function hexToBinaryString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

function hmacFileMD5(file: File, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let k = key;
        if (k.length > 64) {
            k = hexToBinaryString(SparkMD5.hash(k));
        }
        if (k.length < 64) {
            k = k + String.fromCharCode(0).repeat(64 - k.length);
        }

        const ipad = Array(64).fill(0x36);
        const opad = Array(64).fill(0x5c);
        const kChars = k.split('').map(c => c.charCodeAt(0));
        const ipadKey = kChars.map((c, i) => c ^ ipad[i]).map(c => String.fromCharCode(c)).join('');
        const opadKey = kChars.map((c, i) => c ^ opad[i]).map(c => String.fromCharCode(c)).join('');

        const blobSlice = File.prototype.slice || (File.prototype as any).mozSlice || (File.prototype as any).webkitSlice;
        const chunkSize = 2097152;
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const spark = new SparkMD5.ArrayBuffer();

        const ipadKeyBuffer = new Uint8Array(ipadKey.length);
        for (let i = 0; i < ipadKey.length; i++) ipadKeyBuffer[i] = ipadKey.charCodeAt(i);
        spark.append(ipadKeyBuffer.buffer);

        const fileReader = new FileReader();

        fileReader.onload = function (e) {
            spark.append(e.target?.result as ArrayBuffer);
            currentChunk++;
            if (currentChunk < chunks) {
                loadNext();
            } else {
                const innerHashHex = spark.end();
                const innerHashBin = hexToBinaryString(innerHashHex);
                resolve(SparkMD5.hashBinary(opadKey + innerHashBin));
            }
        };

        fileReader.onerror = function () {
            reject('MD5 HMAC hashing failed');
        };

        function loadNext() {
            const start = currentChunk * chunkSize;
            const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        }

        loadNext();
    });
}

async function hashTextSHA(text: string, algorithm: string, secret?: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    if (secret) {
        return hmacSHA(data, algorithm, secret);
    }

    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    return bufferToHex(hashBuffer);
}

async function hashFileSHA(file: File, algorithm: string, secret?: string): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    if (secret) {
        return hmacSHA(arrayBuffer, algorithm, secret);
    }

    const hashBuffer = await crypto.subtle.digest(algorithm, arrayBuffer);
    return bufferToHex(hashBuffer);
}

async function hmacSHA(data: BufferSource, algorithm: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, data);
    return bufferToHex(signature);
}

function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
