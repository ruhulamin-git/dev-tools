declare module 'spark-md5' {
    interface State {
        buff: Uint8Array;
        length: number;
        hash: number[];
    }

    class ArrayBufferClass {
        constructor();
        append(arr: globalThis.ArrayBuffer): ArrayBufferClass;
        end(raw?: boolean): string;
        reset(): ArrayBufferClass;
        getState(): State;
        setState(state: State): ArrayBufferClass;
        destroy(): void;
    }

    class SparkMD5 {
        static hash(str: string, raw?: boolean): string;
        static hashBinary(content: string, raw?: boolean): string;
        static ArrayBuffer: typeof ArrayBufferClass;

        constructor();
        append(str: string): SparkMD5;
        appendBinary(contents: string): SparkMD5;
        end(raw?: boolean): string;
        reset(): SparkMD5;
        getState(): State;
        setState(state: State): SparkMD5;
        destroy(): void;
    }

    export default SparkMD5;
}
