export interface RTRRRequestModel {
    SID: number;
    ContactId: string;
    FirstCheckInDate: Date;
    DaysOfData: number;
    LOS: number;
    Occupancy: number;
    Properties: number[];
    Sources: string[];
    AllProperties: number[];
    AllSources: string[];
    EmailIds: string[];
    ContactName: string;
    Name: string;
    Currency: string;
    ReportSource: string;
    RTRRInSecond: number;
    IsILOSApplicable: boolean;
    IsOptimaTrial: boolean;
}