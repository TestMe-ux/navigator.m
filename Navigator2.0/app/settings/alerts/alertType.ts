import { useState } from "react";

// types.ts
export interface CompSet {
    propertyID: number;
    name: string;
    hmid?: number;
}

export interface Channel {
    cid: number;
    name: string;
}
export interface AlertUpdate {
    alertType: string;
    alerID: string;
    field: string;
    status: boolean,
    CreatedBy: number
}

export interface AlertUI {
    id: number;
    type: string;           // "ADR" | "Parity" | "OTA Ranking"
    rule: string;
    createdBy: string;
    createdOn: string;
    status: boolean;
    AlertID: string;
    Action?: string | null
}