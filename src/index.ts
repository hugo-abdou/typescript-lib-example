import axios, { AxiosInstance } from "axios";
import XLSX from "xlsx";
const mimeTypes: string[] = [
    "text/plain",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
];
export default class Client {
    private key?: string;
    private httpRequest?: AxiosInstance;
    private data?: object;
    private url: string = "/check";

    constructor(key?: string) {
        if (key) {
            this.key = key;
            this.httpRequest = axios.create({
                baseURL: "http://emailvirefly.test/",
                headers: {
                    Authorization: `Bearer ${this.key}`,
                },
            });
        }
    }

    setHttpDriver(driver: AxiosInstance) {
        this.httpRequest = driver;
    }

    send() {
        if (this.httpRequest) {
            return this.httpRequest?.post(this.url, this.data);
        }
        const errorMessage = this.key
            ? "the http driver is not loaded"
            : "please make your key is valid";
        throw new Error(errorMessage);
    }
    verifyOne(email: string) {
        this.data = { email };
        this.url = "/api/email/validate/one";
        return this;
    }

    async verifyFile(file: File) {
        const form = new FormData();
        const result = await this.processFile(file);
        form.append("name", result.name);
        form.append("length", result.length.toString());
        form.append("file", result.file);

        this.data = form;
        this.url = "/api/validate/bulk";
        return this;
    }

    async processFile(file: File) {
        if (!mimeTypes.includes(file.type))
            throw new Error(
                `file type ${file.name} is not supported please make sure your file is one of this file types (.txt,.csv,.xlsx,xls)`
            );
        let result: { file: File; name: string; length: number };
        try {
            const data = await file.arrayBuffer();
            const wb = XLSX.read(data);
            var json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

            var blob = new Blob([JSON.stringify(json)], {
                type: "application/json",
            });
            let fileName: any = file.name.split(".");
            fileName.pop();
            fileName = fileName.join(".");
            result = {
                length: json.length,
                name: fileName,
                file: new File([blob], `${fileName}.json`, {
                    type: "application/json",
                }),
            };
            return result;
        } catch (error) {
            throw error;
        }
    }

    getFileDetails(id: number) {
        if (this.httpRequest) {
            return this.httpRequest?.get(`/api/files/${id}/details`);
        }
        const errorMessage = this.key
            ? "the http driver is not loaded"
            : "please make your key is valid";
        throw new Error(errorMessage);
    }

    getData() {
        return this.data;
    }
}
