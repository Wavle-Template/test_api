import { Header } from '@nestjs/common';
import { Controller, Get, Inject, Post, Response } from '@nestjs/common';
import { Response as Res } from 'express';
import { SERVICE_MANAGE_STORE } from './service-manage.const';
import { OpenSourceModel } from './service-manage.model';
import { ServiceManageService } from './service-manage.service';
import { ServiceManageStore } from './service-manage.store';

@Controller('service-manage')
export class ServiceManageController {
    #serviceManageService: ServiceManageService;
    #store: ServiceManageStore;
    constructor(
        serviceManageService: ServiceManageService,
        @Inject(SERVICE_MANAGE_STORE) store: ServiceManageStore
    ) {
        this.#serviceManageService = serviceManageService;
        this.#store = store;
    }
    @Post("")
    @Get("")
    async serviceManage(@Response() res: Res) {
        return res.json(this.#store.getInfo());
    }

    @Get("policy")
    async policyInfo(@Response() res: Res) {
        return res.send(this.#store.getInfo().serviceTerms);
    }

    @Get("privacy")
    async privacyInfo(@Response() res: Res) {
        return res.send(this.#store.getInfo().personalProcessingPolicy);
    }

    @Get("opensource")
    async openSourceInfo(@Response() res: Res) {
        const list = this.#store.getInfo().openSource as unknown as OpenSourceModel[];
        let tBody = ``;
        list.forEach(item=>{
            tBody+=`
            <tr>
                <td>${item.name}</td>
                <td>${item.publisher}</td>
                <td>${item.licenseFileUrl}</td>
                <td>${item.licenses}</td>
                <td>${item.email}</td>
                <td>${item.repository}</td>
            </tr>
            `
        })
        res.header("content-type","text/html; charset=utf-8")
        return res.send(`
        <!DOCTYPE html>
<html xmlns:mso="urn:schemas-microsoft-com:office:office" xmlns:msdt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">
    <head>
    <meta charset="utf-8">
<!--[if gte mso 9]><xml>
<mso:CustomDocumentProperties>
<mso:display_urn_x003a_schemas-microsoft-com_x003a_office_x003a_office_x0023_Editor msdt:dt="string">&#49888; &#50976;&#46041;</mso:display_urn_x003a_schemas-microsoft-com_x003a_office_x003a_office_x0023_Editor>
<mso:display_urn_x003a_schemas-microsoft-com_x003a_office_x003a_office_x0023_Author msdt:dt="string">&#49888; &#50976;&#46041;</mso:display_urn_x003a_schemas-microsoft-com_x003a_office_x003a_office_x0023_Author>
<mso:Order msdt:dt="string">10600.0000000000</mso:Order>
<mso:ComplianceAssetId msdt:dt="string"></mso:ComplianceAssetId>
<mso:ContentTypeId msdt:dt="string">0x01010058C1BFB63EEAEB43902BC22C220BE5A6</mso:ContentTypeId>
<mso:_SourceUrl msdt:dt="string"></mso:_SourceUrl>
<mso:_SharedFileIndex msdt:dt="string"></mso:_SharedFileIndex>
<mso:xd_Signature msdt:dt="string"></mso:xd_Signature>
<mso:TemplateUrl msdt:dt="string"></mso:TemplateUrl>
<mso:xd_ProgID msdt:dt="string"></mso:xd_ProgID>
</mso:CustomDocumentProperties>
</xml><![endif]-->
<title>오픈소스 라이센스</title></head><body>
        <div>
            <h1>오픈소스 라이센스</h1>
            <br />
            <br />
            <div>
            <table>
                <thead>
                    <tr>
                        <th colspan="1">소스명</th>
                        <th colspan="1">게시자</th>
                        <th colspan="1">라이센스 URL</th>
                        <th colspan="1">라이센스 종류</th>
                        <th colspan="1">이메일</th>
                        <th colspan="1">저장소</th>
                    </tr>
                </thead>
                <tbody>
                    ${tBody}
                </tbody>
            </table>
            </div>
        </div>
    </body>
</html>
        `);
    }
}
