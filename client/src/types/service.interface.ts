export interface IComplexity {
    _id: string;
    name: string;
    price: number;
}

export interface IType {
    _id: string;
    name: string;
    price?: number;
    complexities?: IComplexity[];
}

export interface IService {
    _id: string;
    name: string;
    price?: number;
    complexities?: IComplexity[];
    types?: IType[];
    options?: boolean;
    inputs?: boolean;
    instruction?: string;
    disabledOptions?: string[];
}
