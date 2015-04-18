import ExchangeService = require("./ExchangeService");
import XmlNamespace = require("../Enumerations/XmlNamespace");
import DelegateTypes = require("../Misc/DelegateTypes");
import ServiceObject = require("./ServiceObjects/ServiceObject");
import PropertySet = require("./PropertySet");
import ServiceLocalException = require("../Exceptions/ServiceLocalException");

import ExtensionMethods = require("../ExtensionMethods");
import String = ExtensionMethods.stringFormatting;


import EwsXmlReader = require("./EwsXmlReader");
class EwsServiceXmlReader extends EwsXmlReader {
    get Service(): ExchangeService { return this.service;}
    private service: ExchangeService;
    //#region Constructor
    constructor(rawXML: string, service: ExchangeService) {
        super(rawXML);
        this.service = service;
    }
    //#endregion
    ConvertStringToDateTime(dateTimeString: string): Date { throw new Error("Not implemented."); }
    ConvertStringToUnspecifiedDate(dateTimeString: string): Date { throw new Error("Not implemented."); }
    ReadElementValueAsDateTime(): Date { throw new Error("Not implemented."); }
    //ReadElementValueAsDateTime(xmlNamespace: XmlNamespace, localName: string): Date { throw new Error("Not implemented."); }
    ReadElementValueAsUnbiasedDateTimeScopedToServiceTimeZone(): Date { throw new Error("Not implemented."); }
    ReadElementValueAsUnspecifiedDate(): Date { throw new Error("Not implemented."); }
    //ReadServiceObjectsCollectionFromXml(collectionXmlNamespace: XmlNamespace, collectionXmlElementName: string, getObjectInstanceDelegate: GetObjectInstanceDelegate<T>, clearPropertyBag: boolean, requestedPropertySet: PropertySet, summaryPropertiesOnly: boolean): System.Collections.Generic.List<T> { throw new Error("Not implemented."); }
    //ReadServiceObjectsCollectionFromXml(collectionXmlElementName: string, getObjectInstanceDelegate: GetObjectInstanceDelegate<T>, clearPropertyBag: boolean, requestedPropertySet: PropertySet, summaryPropertiesOnly: boolean): System.Collections.Generic.List<T> { throw new Error("Not implemented."); }
    ReadServiceObjectsCollectionFromXml<TServiceObject extends ServiceObject>(collectionXmlElementName: string,
        getObjectInstanceDelegate: DelegateTypes.GetObjectInstanceDelegate<TServiceObject>,
        clearPropertyBag: boolean, requestedPropertySet: PropertySet, summaryPropertiesOnly: boolean,
        collectionXmlNamespace: XmlNamespace = XmlNamespace.Messages): TServiceObject[] /*System.Collections.Generic.List<T>*/ {

        // condensed both overload in one.

        //return this.ReadServiceObjectsCollectionFromXml<TServiceObject>(
        //    XmlNamespace.Messages,
        //    collectionXmlElementName,
        //    getObjectInstanceDelegate,
        //    clearPropertyBag,
        //    requestedPropertySet,
        //    summaryPropertiesOnly);

        var serviceObjects: TServiceObject[] = [];//new List<TServiceObject>();
        var serviceObject: TServiceObject = null;

        if (!this.IsElement(collectionXmlNamespace, collectionXmlElementName)) {
            this.ReadStartElement(collectionXmlNamespace, collectionXmlElementName);
        }

        if (!this.IsEmptyElement) {
            do {
                this.Read();

                //if (this.IsStartElement()) { //todo: test for specific startElement if possible - cant check that with javascript XML Node Walker
                serviceObject = getObjectInstanceDelegate(this.Service, this.LocalName);

                if (serviceObject == null) {
                    this.SkipCurrentElement();
                }
                else {
                    if (this.LocalName.toLowerCase() !== serviceObject.GetXmlElementName().toLowerCase()) {
                        throw new ServiceLocalException(
                            String.Format(
                                "The type of the object in the store ({0}) does not match that of the local object ({1}).",
                                this.LocalName,
                                serviceObject.GetXmlElementName()));
                    }

                    serviceObject.LoadFromXml(
                        this,
                        clearPropertyBag,
                        requestedPropertySet,
                        summaryPropertiesOnly);

                    serviceObjects.push(serviceObject);
                }
                //}
            }
            while (!this.HasRecursiveParent(/*collectionXmlNamespace, */collectionXmlElementName));
            this.SeekLast(); // to let next Read() parse right node.
        }

        return serviceObjects;

    }
}
export = EwsServiceXmlReader;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;