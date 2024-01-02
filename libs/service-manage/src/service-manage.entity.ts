import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity } from "typeorm";


@Entity({ name: "service_manages" })
export class ServiceManageEntity extends DefaultEntity{
    @Column({ nullable: true })
    representativeName?: string;

    @Column({ nullable: true })
    businessLicense?: string;

    @Column({ nullable: true })
    companyAddress?: string;

    @Column({ nullable: true })
    serviceTerms?: string;

    @Column({ nullable: true })
    refundTerms?: string;

    @Column({ nullable: true })
    marketingTerms?: string;

    @Column({ nullable: true })
    personalProcessingPolicy?: string;

    @Column("jsonb",{ nullable: true })
    openSource?: Record<string, unknown>;
;
}