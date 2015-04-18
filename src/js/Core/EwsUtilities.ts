import LazyMember = require("./LazyMember");
import ServiceObject = require("./ServiceObjects/ServiceObject");
import ServiceObjectInfo = require("./ServiceObjects/ServiceObjectInfo");
import Item = require("./ServiceObjects/Items/Item");

import ExchangeService = require("./ExchangeService");

import DayOfTheWeek = require("../Enumerations/DayOfTheWeek");
import XmlNamespace = require("../Enumerations/XmlNamespace");
import ExchangeVersion = require("../Enumerations/ExchangeVersion");
import EnumToExchangeVersionMappingHelper = require("../Enumerations/EnumToExchangeVersionMappingHelper");
import WellKnownFolderName = require("../Enumerations/WellKnownFolderName");
import ItemTraversal = require("../Enumerations/ItemTraversal");
import ConversationQueryTraversal = require("../Enumerations/ConversationQueryTraversal");
import FileAsMapping = require("../Enumerations/FileAsMapping");

import ServiceVersionException = require("../Exceptions/ServiceVersionException");
import ISelfValidate = require("../Interfaces/ISelfValidate");

import ItemAttachment = require("../ComplexProperties/ItemAttachment");

import ExtensionMethods = require("../ExtensionMethods");
import String = ExtensionMethods.stringFormatting;

class EwsUtilities {

    //#region constants in c# - typescript static
    static XSFalse: string = "false";
    static XSTrue: string = "true";
    static EwsTypesNamespacePrefix: string = "t";
    static EwsMessagesNamespacePrefix: string = "m";
    static EwsErrorsNamespacePrefix: string = "e";
    static EwsSoapNamespacePrefix: string = "soap";
    static EwsXmlSchemaInstanceNamespacePrefix: string = "xsi";
    static PassportSoapFaultNamespacePrefix: string = "psf";
    static WSTrustFebruary2005NamespacePrefix: string = "wst";
    static WSAddressingNamespacePrefix: string = "wsa";
    static AutodiscoverSoapNamespacePrefix: string = "a";
    static WSSecurityUtilityNamespacePrefix: string = "wsu";
    static WSSecuritySecExtNamespacePrefix: string = "wsse";
    static EwsTypesNamespace: string = "http://schemas.microsoft.com/exchange/services/2006/types";
    static EwsMessagesNamespace: string = "http://schemas.microsoft.com/exchange/services/2006/messages";
    static EwsErrorsNamespace: string = "http://schemas.microsoft.com/exchange/services/2006/errors";
    static EwsSoapNamespace: string = "http://schemas.xmlsoap.org/soap/envelope/";
    static EwsSoap12Namespace: string = "http://www.w3.org/2003/05/soap-envelope";
    static EwsXmlSchemaInstanceNamespace: string = "http://www.w3.org/2001/XMLSchema-instance";
    static PassportSoapFaultNamespace: string = "http://schemas.microsoft.com/Passport/SoapServices/SOAPFault";
    static WSTrustFebruary2005Namespace: string = "http://schemas.xmlsoap.org/ws/2005/02/trust";
    static WSAddressingNamespace: string = "http://www.w3.org/2005/08/addressing";
    static AutodiscoverSoapNamespace: string = "http://schemas.microsoft.com/exchange/2010/Autodiscover";
    static WSSecurityUtilityNamespace: string = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd";
    static WSSecuritySecExtNamespace: string = "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd";

    /// <summary>
    /// Regular expression for legal domain names.
    /// </summary>
    static DomainRegex: string = "^[-a-zA-Z0-9_.]+$";
    //#endregion


    static BuildVersion: string;
    private static serviceObjectInfo: LazyMember<ServiceObjectInfo> = new LazyMember<ServiceObjectInfo>(
        () => {
            return new ServiceObjectInfo();
        });
    //private static buildVersion: LazyMember<T>;
    private static enumVersionDictionaries: LazyMember<EnumToExhcangeVersionDelegateDictionary> = new LazyMember<EnumToExhcangeVersionDelegateDictionary>(
        () => {
            var e2evnh = EnumToExchangeVersionMappingHelper;
            var dict: EnumToExhcangeVersionDelegateDictionary = {};
            dict[e2evnh[e2evnh.WellKnownFolderName]] = EwsUtilities.BuildEnumDict(e2evnh.WellKnownFolderName);
            dict[e2evnh[e2evnh.ItemTraversal]] = EwsUtilities.BuildEnumDict(e2evnh.ItemTraversal);
            dict[e2evnh[e2evnh.ConversationQueryTraversal]] = EwsUtilities.BuildEnumDict(e2evnh.ConversationQueryTraversal);
            dict[e2evnh[e2evnh.FileAsMapping]] = EwsUtilities.BuildEnumDict(e2evnh.FileAsMapping);
            dict[e2evnh[e2evnh.EventType]] = EwsUtilities.BuildEnumDict(e2evnh.EventType);
            dict[e2evnh[e2evnh.MeetingRequestsDeliveryScope]] = EwsUtilities.BuildEnumDict(e2evnh.MeetingRequestsDeliveryScope);
            dict[e2evnh[e2evnh.ViewFilter]] = EwsUtilities.BuildEnumDict(e2evnh.ViewFilter);
            return dict;
        });
    //private static schemaToEnumDictionaries: LazyMember<T>;
    //private static enumToSchemaDictionaries: LazyMember<T>;
    //private static typeNameToShortNameMap: LazyMember<T>;
    static Assert(condition: boolean, caller: string, message: string): any {
        if (!condition)
            console.log(String.Format("[{0}] {1}", caller, message));

    }
    static BoolToXSBool(value: boolean): string { throw new Error("Not implemented."); }
    //static BuildEnumDict(enumType: System.Type): System.Collections.Generic.Dictionary<TKey, TValue>{ throw new Error("Not implemented.");}
    //deviation - need to work with static data for enum to exchange version dict, there is no Attribute type system in javascript.
    static BuildEnumDict(enumType: EnumToExchangeVersionMappingHelper): EnumVersionDelegate {
        var enumDelegate = (value) => { return ExchangeVersion.Exchange2007_SP1 };
        switch (enumType) {
            //TODO: fix numbering to named enum value if possible
            case EnumToExchangeVersionMappingHelper.WellKnownFolderName:
                enumDelegate = (value) => {
                    var enumVersion = ExchangeVersion.Exchange2007_SP1;
                    if (value <= 15) //<= WellKnownFolderName.VoiceMail
                        enumVersion = ExchangeVersion.Exchange2007_SP1;
                    else if (value >= 16 && value <= 26) //>= RecoverableItemsRoot && <= ArchiveRecoverableItemsPurges
                        enumVersion = ExchangeVersion.Exchange2010_SP1;
                    else if (value >= 27 && value <= 34) //>= SyncIssues && <= ToDoSearch
                        enumVersion = ExchangeVersion.Exchange2013;
                    else
                        enumVersion = ExchangeVersion.Exchange_Version_Not_Updated;

                    return enumVersion;
                };
                break;
            case EnumToExchangeVersionMappingHelper.ItemTraversal:
                enumDelegate = (value) => {
                    if (value <= 1) //<= ItemTraversal.SoftDeleted
                        return ExchangeVersion.Exchange2007_SP1;
                    else if(value ==2) // === Associated
                        return ExchangeVersion.Exchange2010;

                    return ExchangeVersion.Exchange_Version_Not_Updated;
                };
                break;
            case EnumToExchangeVersionMappingHelper.ConversationQueryTraversal:
                enumDelegate = (value) => {
                    if (value <= 1) //<= ConversationQueryTraversal.Deep
                        return ExchangeVersion.Exchange2013;
                    return ExchangeVersion.Exchange_Version_Not_Updated;
                };
                break;
            case EnumToExchangeVersionMappingHelper.FileAsMapping:
                enumDelegate = (value) => {
                    if (value <= 12) //<= FileAsMapping.SurnameSpaceGivenName
                        return ExchangeVersion.Exchange2007_SP1;
                    else if (value >= 13 && value <= 17) // >= DisplayName && <=Empty
                        return ExchangeVersion.Exchange2010;

                    return ExchangeVersion.Exchange_Version_Not_Updated;
                };
                break;
            case EnumToExchangeVersionMappingHelper.EventType:
                enumDelegate = (value) => {
                    if (value <= 6) //<= EventType.Created
                        return ExchangeVersion.Exchange2007_SP1;
                    else if (value == 7) // == FreeBusyChanged
                        return ExchangeVersion.Exchange2010_SP1;

                    return ExchangeVersion.Exchange_Version_Not_Updated;
                };
                break;
            case EnumToExchangeVersionMappingHelper.MeetingRequestsDeliveryScope:
                enumDelegate = (value) => {
                    if (value <= 2) //<= MeetingRequestsDeliveryScope.DelegatesAndSendInformationToMe
                        return ExchangeVersion.Exchange2007_SP1;
                    else if (value == 3) // == NoForward
                        return ExchangeVersion.Exchange2010_SP1;

                    return ExchangeVersion.Exchange_Version_Not_Updated;
                };
                break;
            case EnumToExchangeVersionMappingHelper.ViewFilter:
                enumDelegate = (value) => {
                    if (value <= 10) //<=ViewFilter.SuggestionsDelete
                        return ExchangeVersion.Exchange2013;

                    return ExchangeVersion.Exchange_Version_Not_Updated;
                };
                break;
            default:
                throw new Error("no mapping available for this enumtype" + EnumToExchangeVersionMappingHelper[enumType]);
        }

        return enumDelegate;
    }
    private static GetExchangeVersionFromEnumDelegate(enumType: EnumToExchangeVersionMappingHelper, enumValue: number): ExchangeVersion {
        var delegate = this.enumVersionDictionaries.Member[EnumToExchangeVersionMappingHelper[enumType]];
        if (delegate && typeof delegate === 'function')
        {
            try {
                return delegate(enumValue);
            }
            catch(ex){}
        }

        return ExchangeVersion.Exchange2007_SP1;
    }
    //static BuildEnumToSchemaDict(enumType: System.Type): System.Collections.Generic.Dictionary<TKey, TValue>{ throw new Error("Not implemented.");}
    //static BuildSchemaToEnumDict(enumType: System.Type): System.Collections.Generic.Dictionary<TKey, TValue>{ throw new Error("Not implemented.");}
    //static ConvertTime(dateTime: Date, sourceTimeZone: System.TimeZoneInfo, destinationTimeZone: System.TimeZoneInfo): Date{ throw new Error("Not implemented.");}
    //static CopyStream(source: System.IO.Stream, target: System.IO.Stream): any{ throw new Error("Not implemented.");}
    static CountMatchingChars(str: string, charPredicate: any): number { throw new Error("Not implemented."); }
    static CreateEwsObjectFromXmlElementName<TServiceObject extends ServiceObject>(service: ExchangeService, xmlElementName: string): TServiceObject {
        //var itemClass = TypeSystem.GetObjectByClassName("Microsoft.Exchange.WebServices.Data." + xmlElementName
        debugger;

        var creationDelegate = EwsUtilities.serviceObjectInfo.Member.ServiceObjectConstructorsWithServiceParam[xmlElementName];

        if (creationDelegate) {
            return creationDelegate(service);
        }
        else return null;

        //var itemClass = EwsUtilities.serviceObjectInfo.Member.XmlElementNameToServiceObjectClassMap[xmlElementName];
        //if (itemClass) {
        //    //return new itemClass(service);

        //    creationDelegate: CreateServiceObjectWithServiceParam;


        //    //if (EwsUtilities.serviceObjectInfo.Member.ServiceObjectConstructorsWithServiceParam.TryGetValue(itemClass, out creationDelegate)) {
        //    //    return (TServiceObject)creationDelegate(service);
        //    //}
        //    //else {
        //    //    throw new ArgumentException(Strings.NoAppropriateConstructorForItemClass);
        //    //}
        //}
        //else {
        //    return null; //default(TServiceObject);
        //}
    }
    //static CreateItemFromItemClass(itemAttachment: ItemAttachment, itemClass: System.Type, isNew: boolean): Item{ throw new Error("Not implemented.");}
    static CreateItemFromXmlElementName(itemAttachment: ItemAttachment, xmlElementName: string): Item { throw new Error("Not implemented."); }
    static DateTimeToXSDate(date: Date): string { throw new Error("Not implemented."); }
    static DateTimeToXSDateTime(dateTime: Date): string { throw new Error("Not implemented."); }
    static DomainFromEmailAddress(emailAddress: string): string {
        var emailAddressParts: string[]  = emailAddress.split('@');

        if (emailAddressParts.length != 2 || String.IsNullOrEmpty(emailAddressParts[1])) {
            throw new Error("invalid email address"/*Strings.InvalidEmailAddress*/);
        }

        return emailAddressParts[1];
    }
    static EwsToSystemDayOfWeek(dayOfTheWeek: DayOfTheWeek): System.DayOfWeek /*todo: fix system enums here*/ { throw new Error("Not implemented."); }
    //static FindFirstItemOfType(items: System.Collections.Generic.IEnumerable<Item>): any{ throw new Error("Not implemented.");}
    //static ForEach(collection: System.Collections.Generic.IEnumerable<T>, action: any): any{ throw new Error("Not implemented.");}
    //static FormatHttpHeaders(headers: System.Net.WebHeaderCollection): string{ throw new Error("Not implemented.");}
    //static FormatHttpHeaders(sb: any, headers: System.Net.WebHeaderCollection): any{ throw new Error("Not implemented.");}
    //static FormatHttpRequestHeaders(request: IEwsHttpWebRequest): string{ throw new Error("Not implemented.");}
    //static FormatHttpRequestHeaders(request: any): string{ throw new Error("Not implemented.");}
    static FormatHttpResponseHeaders(response:any /*IEwsHttpWebResponse*/): string { throw new Error("Not implemented."); }
    static FormatLogMessage(entryKind: string, logEntry: string): string { throw new Error("Not implemented."); }
    static FormatLogMessageWithXmlContent(entryKind: string, memoryStream: any): string { throw new Error("Not implemented."); }
    static GetEnumeratedObjectAt(objects: any, index: number): any { throw new Error("Not implemented."); }
    static GetEnumeratedObjectCount(objects: any): number { throw new Error("Not implemented."); }
    //static GetEnumSchemaName(enumType: System.Type, enumName: string): string{ throw new Error("Not implemented.");}
    //static GetEnumVersion(enumType: System.Type, enumName: string): ExchangeVersion{ throw new Error("Not implemented.");}
    //static GetItemTypeFromXmlElementName(xmlElementName: string): System.Type{ throw new Error("Not implemented.");}
    static GetNamespaceFromUri(namespaceUri: string): XmlNamespace {
        switch (namespaceUri) {
            case this.EwsErrorsNamespace:
                return XmlNamespace.Errors;
            case this.EwsTypesNamespace:
                return XmlNamespace.Types;
            case this.EwsMessagesNamespace:
                return XmlNamespace.Messages;
            case this.EwsSoapNamespace:
                return XmlNamespace.Soap;
            case this.EwsSoap12Namespace:
                return XmlNamespace.Soap12;
            case this.EwsXmlSchemaInstanceNamespace:
                return XmlNamespace.XmlSchemaInstance;
            case this.PassportSoapFaultNamespace:
                return XmlNamespace.PassportSoapFault;
            case this.WSTrustFebruary2005Namespace:
                return XmlNamespace.WSTrustFebruary2005;
            case this.WSAddressingNamespace:
                return XmlNamespace.WSAddressing;
            default:
                return XmlNamespace.NotSpecified;
        }
    }
    static GetNamespacePrefix(xmlNamespace: XmlNamespace): string {
        switch (xmlNamespace) {
            case XmlNamespace.Types:
                return EwsUtilities.EwsTypesNamespacePrefix;
            case XmlNamespace.Messages:
                return EwsUtilities.EwsMessagesNamespacePrefix;
            case XmlNamespace.Errors:
                return EwsUtilities.EwsErrorsNamespacePrefix;
            case XmlNamespace.Soap:
            case XmlNamespace.Soap12:
                return EwsUtilities.EwsSoapNamespacePrefix;
            case XmlNamespace.XmlSchemaInstance:
                return EwsUtilities.EwsXmlSchemaInstanceNamespacePrefix;
            case XmlNamespace.PassportSoapFault:
                return EwsUtilities.PassportSoapFaultNamespacePrefix;
            case XmlNamespace.WSTrustFebruary2005:
                return EwsUtilities.WSTrustFebruary2005NamespacePrefix;
            case XmlNamespace.WSAddressing:
                return EwsUtilities.WSAddressingNamespacePrefix;
            case XmlNamespace.Autodiscover:
                return EwsUtilities.AutodiscoverSoapNamespacePrefix;
            default:
                return "";
        }
    }
    static GetNamespaceUri(xmlNamespace: XmlNamespace): string {
        switch (xmlNamespace) {
            case XmlNamespace.Types:
                return EwsUtilities.EwsTypesNamespace;
            case XmlNamespace.Messages:
                return EwsUtilities.EwsMessagesNamespace;
            case XmlNamespace.Errors:
                return EwsUtilities.EwsErrorsNamespace;
            case XmlNamespace.Soap:
                return EwsUtilities.EwsSoapNamespace;
            case XmlNamespace.Soap12:
                return EwsUtilities.EwsSoap12Namespace;
            case XmlNamespace.XmlSchemaInstance:
                return EwsUtilities.EwsXmlSchemaInstanceNamespace;
            case XmlNamespace.PassportSoapFault:
                return EwsUtilities.PassportSoapFaultNamespace;
            case XmlNamespace.WSTrustFebruary2005:
                return EwsUtilities.WSTrustFebruary2005Namespace;
            case XmlNamespace.WSAddressing:
                return EwsUtilities.WSAddressingNamespace;
            case XmlNamespace.Autodiscover:
                return EwsUtilities.AutodiscoverSoapNamespace;
            default:
                return "";
        }
    }
    //static GetPrintableTypeName(type: System.Type): string{ throw new Error("Not implemented.");}
    //static GetSimplifiedTypeName(typeName: string): string{ throw new Error("Not implemented.");}
    //static IsLocalTimeZone(timeZone: System.TimeZoneInfo): boolean{ throw new Error("Not implemented.");}
    //static Parse(value: string): any{ throw new Error("Not implemented.");}
    //static ParseAsUnbiasedDatetimescopedToServicetimeZone(dateString: string, service: ExchangeService): Date{ throw new Error("Not implemented.");}
    //static ParseEnumValueList(list: System.Collections.Generic.IList<T>, value: string, separators: any): any{ throw new Error("Not implemented.");}
    //static SerializeEnum(value: any): string{ throw new Error("Not implemented.");}
    //static SystemToEwsDayOfTheWeek(dayOfWeek: System.DayOfWeek): DayOfTheWeek{ throw new Error("Not implemented.");}
    //static TimeSpanToXSDuration(timeSpan: System.TimeSpan): string{ throw new Error("Not implemented.");}
    //static TimeSpanToXSTime(timeSpan: System.TimeSpan): string{ throw new Error("Not implemented.");}
    //static TrueForAll(collection: System.Collections.Generic.IEnumerable<T>, predicate: any): boolean{ throw new Error("Not implemented.");}
    static ValidateClassVersion(service: ExchangeService, minimumServerVersion: ExchangeVersion, className: string): any { throw new Error("Not implemented."); }
    static ValidateDomainNameAllowNull(domainName: string, paramName: string): void {

        //todo: validate domain names per ews managed api

        //if (domainName != null) {
        //    Regex regex = new Regex(DomainRegex);

        //    if (!regex.IsMatch(domainName)) {
        //        throw new ArgumentException(string.Format(Strings.InvalidDomainName, domainName), paramName);
        //    }
        //}
    }
    static ValidateEnumVersionValue(enumType: EnumToExchangeVersionMappingHelper,enumValue: number, requestVersion: ExchangeVersion): void {
        var enumVersion = this.GetExchangeVersionFromEnumDelegate(enumType, enumValue);
        if (requestVersion < enumVersion) {
            throw new ServiceVersionException(
                String.Format(
                    "Enum value incompatible with requested version. Folder: {0}, Type: {1}, minimum version: {2}",//Strings.EnumValueIncompatibleWithRequestVersion,
                    enumValue,
                    //WellKnownFolderName[folderEnum],
                    EnumToExchangeVersionMappingHelper[enumType],
                    ExchangeVersion[enumVersion]));
        }
        //////EwsUtilities.ValidateEnumVersionValue(this.FolderName, version); - alternate validation using next line
    //////todo: move to ewsutilities - done
    ////export class ExchangeVersionValidator {
    ////    static ValidateWellKnownFolderName(folderEnum: WellKnownFolderName, requestedVersion: ExchangeVersion): void {
    ////        var enumVersion = ExchangeVersion.Exchange2007_SP1;
    ////        if (folderEnum <= 15) enumVersion = ExchangeVersion.Exchange2007_SP1;
    ////        else if (folderEnum >= 16 && folderEnum <= 26) enumVersion = ExchangeVersion.Exchange2010_SP1;
    ////        else if (folderEnum >= 27 && folderEnum <= 34) enumVersion = ExchangeVersion.Exchange2013;
    ////        else enumVersion = ExchangeVersion.Exchange2013;

    ////        if (requestedVersion < enumVersion) {
    ////            throw new ServiceVersionException(
    ////                string.Format(
    ////                    "Enum value incompatible with requested version. Folder: {0}, Type: {1}, minimum version: {2}",//Strings.EnumValueIncompatibleWithRequestVersion,
    ////                    WellKnownFolderName[folderEnum],
    ////                    "WellKnownFolderName",
    ////                    ExchangeVersion[enumVersion]));
    ////        }
    ////    }
    ////}
    }
    static ValidateMethodVersion(service: ExchangeService, minimumServerVersion: ExchangeVersion, methodName: string): any { throw new Error("Not implemented."); }
    static ValidateNonBlankStringParam(param: string, paramName: string): any { throw new Error("Not implemented."); }
    static ValidateNonBlankStringParamAllowNull(param: string, paramName: string): void {
        if (param != null) {
            debugger; //todo: implement this somehow
            // Non-empty string has at least one character which is *not* a whitespace character
            //if (param.length == param.CountMatchingChars((c) => Char.IsWhiteSpace(c))) {
            //    throw new ArgumentException(Strings.ArgumentIsBlankString, paramName);
            //}
        }
    }
    static ValidateParam(param: any, paramName: string): void {
        var isValid = false;

        if (typeof (param) == "string") {
            isValid = !String.IsNullOrEmpty(param);
        }
        else {
            isValid = param != null && typeof (param) !== 'undefined';
        }

        if (!isValid) {
            throw new Error("parameter null exception: " + paramName);// ArgumentNullException(paramName);
        }

        EwsUtilities.ValidateParamAllowNull(param, paramName);
    }
    static ValidateParamAllowNull(param: any, paramName: string): void {
        var selfValidate: ISelfValidate = param;

        if (selfValidate.Validate) {
            try {
                selfValidate.Validate();
            }
            catch (e) {
                throw new Error(" validation failed for parameter:" + paramName + ". Error: " + JSON.stringify(e));
                //ArgumentException(
                //    Strings.ValidationFailed,
                //    paramName,
                //    e);
            }
        }

        var ewsObject: ServiceObject = param;

        if (ewsObject instanceof ServiceObject) {
            if (ewsObject.IsNew) {
                throw new Error("object does not have Id, parameter:" + paramName);// ArgumentException(Strings.ObjectDoesNotHaveId, paramName);
            }
        }
    }
    static ValidateParamCollection(collection: any, paramName: string): any { throw new Error("Not implemented."); }
    static ValidatePropertyVersion(service: ExchangeService, minimumServerVersion: ExchangeVersion, propertyName: string): void { throw new Error("Not implemented."); }
    static ValidateServiceObjectVersion(serviceObject: ServiceObject, requestVersion: ExchangeVersion): any { throw new Error("Not implemented."); }
    //static WriteTraceStartElement(writer: System.Xml.XmlWriter, traceTag: string, includeVersion: boolean): any{ throw new Error("Not implemented.");}
    //static XSDurationToTimeSpan(xsDuration: string): System.TimeSpan{ throw new Error("Not implemented.");}
}
export = EwsUtilities;




interface EnumToExhcangeVersionDelegateDictionary {
    [index: string]: EnumVersionDelegate;
}

interface EnumVersionDelegate {
    (value: number): ExchangeVersion;
}


//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;