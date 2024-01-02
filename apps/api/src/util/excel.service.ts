import { Injectable } from "@nestjs/common";
import * as XLSX from 'xlsx'

/**
 * 엑셀 파일 생성을 위한 Service
 */
@Injectable()
export class ExcelService {

    /**
     * 
     * @param workbook workbook
     * @param opts 생성 옵션
     * @returns 기본적으로 buffer 데이터로 반환됨
     */
    public write(workbook: XLSX.WorkBook, opts?: XLSX.WritingOptions) {
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', ...opts })
    }

    /**
     * 
     * @param datas 엑셀 데이터
     * @returns XLSX.WorkSheet
     */
    public createWorkSheet(datas: { [key: string]: string }[]){
        return XLSX.utils.json_to_sheet(datas)
    }

    /**
     * 
     * @param datas 엑셀 데이터
     * @param book_name book 이름
     * @returns 엑셀파일 데이터 - 기본적으로 buffer
     */
    public exportDataToxlsx = (datas: { [key: string]: string }[], book_name: string) => {
        const worksheet = this.createWorkSheet(datas); // excel sheet하단의 worksheet에 해당
        const new_workbook = XLSX.utils.book_new(); // excel 파일에 해당

        XLSX.utils.book_append_sheet(new_workbook, worksheet, book_name); // excelsheet를 excel파일에 넣음
        // XLSX.writeFile(new_workbook, `${file_name}.xlsx`);
        return this.write(new_workbook)
    }

    /**
     * 
     * @param file 엑셀파일
     * @returns parse된 엑셀데이터
     */
    public importXlsxToData = (file: Express.Multer.File) => {
        const workBook = XLSX.read(file.buffer);
        const sheet = workBook.Sheets[workBook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        return data;
    }
}