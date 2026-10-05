export type HashResult = {
    algorithm: string;
    hash: string;
    loading: boolean;
    error?: string;
};

export type InputType = 'text' | 'file';
