class FindFolderResponse extends ServiceResponse {
    Results: FindFoldersResults;
    private results: FindFoldersResults;
    private propertySet: PropertySet;
    CreateFolderInstance(service: ExchangeService, xmlElementName: string): Folder { throw new Error("Not implemented."); }
    ReadElementsFromJson(responseObject: JsonObject, service: ExchangeService): any { throw new Error("Not implemented."); }
    ReadElementsFromXml(reader: EwsServiceXmlReader): any { throw new Error("Not implemented."); }
}
export = FindFolderResponse;
//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;
