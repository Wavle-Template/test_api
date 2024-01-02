import { ServiceManageEntity } from "./service-manage.entity";

export class ServiceManageStore {
    private info: ServiceManageEntity = null;

    getInfo() {
        if (this.info === null) throw new Error("NOT_EXIST_SERVICE_MANAGE_INFO")
        return { ...this.info }
    }
    setInfo(input: ServiceManageEntity){
        this.info = input;
    }
}