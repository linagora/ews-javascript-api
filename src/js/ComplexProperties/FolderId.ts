import EwsUtilities = require("../Core/EwsUtilities");
import EwsServiceXmlWriter = require("../Core/EwsServiceXmlWriter");
import XmlAttributeNames = require("../Core/XmlAttributeNames");
import XmlElementNames = require("../Core/XmlElementNames");

import ExtensionMethods = require("../ExtensionMethods");
import String = ExtensionMethods.stringFormatting;

import WellKnownFolderName = require("../Enumerations/WellKnownFolderName");
import ExchangeVersion = require("../Enumerations/ExchangeVersion");
import EnumToExchangeVersionMappingHelper = require("../Enumerations/EnumToExchangeVersionMappingHelper");

import Mailbox = require("./Mailbox");

import ServiceId = require("./ServiceId");
 class FolderId extends ServiceId {
    get FolderName(): WellKnownFolderName { return this.folderName; }
    get Mailbox(): Mailbox { return this.mailbox; }
    public get IsValid(): boolean {

        if (this.FolderName) {
            return (this.Mailbox == null) || this.Mailbox.IsValid;
        }
        else {
            return super.IsValidProxy();
        }
    }

    private folderName: WellKnownFolderName;
    private mailbox: Mailbox;

    constructor(uniqueId?: string, folderName?: WellKnownFolderName, mailbox?: Mailbox) {
        super(uniqueId);

        this.mailbox = mailbox;
        this.folderName = folderName;
    }
    Equals(obj: any): boolean {
        if (this === obj) {
            return true;
        }
        else {
            var other: FolderId = obj;

            if (!(other instanceof FolderId)) {
                return false;
            }
            else if (this.FolderName) {
                if (other.FolderName && this.FolderName === other.FolderName) {
                    if (this.Mailbox != null) {
                        return this.Mailbox.Equals(other.Mailbox);
                    }
                    else if (other.Mailbox == null) {
                        return true;
                    }
                }
            }
            else if (super.Equals(other)) {
                return true;
            }

            return false;
        }
    }
    //GetHashCode(): number { throw new Error("Not implemented."); }
    GetXmlElementName(): string { return this.FolderName ? XmlElementNames.DistinguishedFolderId : XmlElementNames.FolderId; }
    //InternalToJson(service: ExchangeService): any { throw new Error("Not implemented."); }
    ToString(): string {
        if (this.IsValid) {
            if (this.FolderName) {
                if ((this.mailbox != null) && this.mailbox.IsValid) {
                    return String.Format("{0} ({1})", WellKnownFolderName[this.folderName], this.Mailbox.ToString());
                }
                else {
                    return WellKnownFolderName[this.FolderName];
                }
            }
            else {
                return super.ToString();
            }
        }
        else {
            return "";
        }
    }
    Validate(version?: ExchangeVersion): void {
        if (version) {
            // The FolderName property is a WellKnownFolderName, an enumeration type. If the property
            // is set, make sure that the value is valid for the request version.
            if (this.FolderName) {
                EwsUtilities.ValidateEnumVersionValue(EnumToExchangeVersionMappingHelper.WellKnownFolderName, this.FolderName, version);
            }
        }
        else {
            super.Validate();
        }
    }
    WriteAttributesToXml(writer: EwsServiceXmlWriter): void {
        if (this.FolderName) {
            writer.WriteAttributeValue(null, XmlAttributeNames.Id, WellKnownFolderName[this.FolderName].toLowerCase());

            if (this.Mailbox != null) {
                this.Mailbox.WriteToXml(writer, XmlElementNames.Mailbox);
            }
        }
        else {
            super.WriteAttributesToXml(writer);
        }
    }
}

 export = FolderId;




//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
