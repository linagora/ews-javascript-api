/// <reference path="../../scripts/typings/winjs/winjs.d.ts" />

import SoapFaultDetails = require("../../Misc/SoapFaultDetails");
import EwsXmlReader = require("../../Core/EwsXmlReader");
import EwsServiceXmlWriter = require("../../Core/EwsServiceXmlWriter");
import XmlElementNames = require("../../Core/XmlElementNames");
import XmlNamespace = require("../../Enumerations/XmlNamespace");
import EwsUtilities = require("../../Core/EwsUtilities");
import ExchangeServerInfo = require("../../Core/ExchangeServerInfo");

import AutodiscoverErrorCode = require("../../Enumerations/AutodiscoverErrorCode");
import ExchangeVersion = require("../../Enumerations/ExchangeVersion");

import AutodiscoverService = require("../AutodiscoverService");
import AutodiscoverResponse = require("../Responses/AutodiscoverResponse");
import ServiceResponse = require("../../Core/Responses/ServiceResponse");
import ServiceResponseException = require("../../Exceptions/ServiceResponseException");

var WinJS = require('winjs');


class AutodiscoverRequest {

    get Service(): AutodiscoverService {
        return this.service;
    }
    get Url(): string { //System.Uri;
        return this.url;
    }

    private service: AutodiscoverService;
    private url: string;//System.Uri;

    constructor(service: AutodiscoverService, url: string) {
        this.service = service;
        this.url = url;
    }

    private CreateRedirectionResponse(httpWebResponse: any /*IEwsHttpWebResponse*/): AutodiscoverResponse {
        //string location = httpWebResponse.Headers[System.Net.HttpResponseHeader.Location];
        //    if (!string.IsNullOrEmpty(location)) {
        //        try {
        //            Uri redirectionUri = new Uri(this.Url, location);
        //            if ((redirectionUri.Scheme == Uri.UriSchemeHttp) || (redirectionUri.Scheme == Uri.UriSchemeHttps)) {
        //                AutodiscoverResponse response = this.CreateServiceResponse();
        //                response.ErrorCode = AutodiscoverErrorCode.RedirectUrl;
        //                response.RedirectionUrl = redirectionUri;
        //                return response;
        //            }

        //            this.Service.TraceMessage(
        //                TraceFlags.AutodiscoverConfiguration,
        //                string.Format("Invalid redirection URL '{0}' returned by Autodiscover service.", redirectionUri));
        //        }
        //        catch (UriFormatException) {
        //            this.Service.TraceMessage(
        //                TraceFlags.AutodiscoverConfiguration,
        //                string.Format("Invalid redirection location '{0}' returned by Autodiscover service.", location));
        //        }
        //    }
        //    else {
        //        this.Service.TraceMessage(
        //            TraceFlags.AutodiscoverConfiguration,
        //            "Redirection response returned by Autodiscover service without redirection location.");
        //    }

        return null;
    }
    CreateServiceResponse(): AutodiscoverResponse { throw new Error("Not implemented."); }
    GetRequestXmlElementName(): string { throw new Error("Not implemented."); }
    GetResponseStream(response: any /*IEwsHttpWebResponse*/): any { //System.IO.Stream{
        //string contentEncoding = response.ContentEncoding;
        //Stream responseStream = response.GetResponseStream();

        //if (contentEncoding.ToLowerInvariant().Contains("gzip")) {
        //    return new GZipStream(responseStream, CompressionMode.Decompress);
        //}
        //else if (contentEncoding.ToLowerInvariant().Contains("deflate")) {
        //    return new DeflateStream(responseStream, CompressionMode.Decompress);
        //}
        //else {
        //    return responseStream;
        //}
    }
    GetResponseXmlElementName(): string { throw new Error("Not implemented."); }
    GetWsAddressingActionName(): string { throw new Error("Not implemented."); }
    InternalExecute(): WinJS.Promise<AutodiscoverResponse> {
        var writer = new EwsServiceXmlWriter();
        this.WriteSoapRequest(this.url, writer);

        if (!this.service && !this.Service.Credentials && (!this.Service.Credentials.UserName || this.service.Credentials.Password))
            throw new Error("missing credential");

        //var cred = "Basic " + btoa(this.Service.Credentials.UserName + ":" + this.Service.Credentials.Password);
        var cc = writer.GetXML();
        var xhrOptions: WinJS.IXHROptions = {
            type: "POST",
            data: cc,
            //url: "https://pod51045.outlook.com/autodiscover/autodiscover.svc",
            url: this.url,
            //headers: { "Content-Type": "text/xml", "Authorization": cred },
            headers: { "Content-Type": "text/xml" },
            //customRequestInitializer: function (x) {
            //    var m = x;
            //}
        };
        this.service.Credentials.PrepareWebRequest(xhrOptions);
        return new WinJS.Promise((successDelegate, errorDelegate, progressDelegate) => {
            WinJS.xhr(xhrOptions)
                .then((xhrResponse: XMLHttpRequest) => {
                var ewsXmlReader = new EwsXmlReader(xhrResponse.responseText || xhrResponse.response);
                var util = require('util');
                //console.log(util.inspect(xhrResponse.response, { showHidden: false, depth: null, colors: true }));
                //console.log(util.inspect(ewsXmlReader.JObject, { showHidden: false, depth: null, colors: true }));
                if (xhrResponse.status == 200) {

                    //ewsXmlReader.Read();
                    //if (ewsXmlReader.NodeType == Node.DOCUMENT_NODE /*System.Xml.XmlNodeType.Document*/) {
                    //    ewsXmlReader.ReadStartElement(XmlNamespace.Soap, XmlElementNames.SOAPEnvelopeElementName);
                    //}
                    //else if ((ewsXmlReader.NodeType != Node.ELEMENT_NODE /*System.Xml.XmlNodeType.Element*/) || (ewsXmlReader.LocalName != XmlElementNames.SOAPEnvelopeElementName) || (ewsXmlReader.NamespaceUri != EwsUtilities.GetNamespaceUri(XmlNamespace.Soap))) {
                    //    throw new Error("Invalid autodiscover service response");//Strings.InvalidAutodiscoverServiceResponse);
                    //}

                    this.ReadSoapHeaders(ewsXmlReader);

                    var response: AutodiscoverResponse = this.ReadSoapBody(ewsXmlReader);

                    //ewsXmlReader.ReadEndElement(XmlNamespace.Soap, XmlElementNames.SOAPEnvelopeElementName);

                    if (response.ErrorCode == AutodiscoverErrorCode.NoError) {
                        //todo: passon to successDelegate
                        //return response;
                    }
                    else {
                        throw new Error("response error " + response.ErrorCode + response.ErrorMessage);// new AutodiscoverResponseException(response.ErrorCode, response.ErrorMessage);
                    }

                }
                else {
                    console.log("status !== 200" + xhrResponse);
                    console.log(util.inspect(xhrResponse.response, { showHidden: false, depth: null, colors: true }));
                    console.log(util.inspect(ewsXmlReader.JsonObject, { showHidden: false, depth: null, colors: true }));

                }

                if (successDelegate)
                    successDelegate(response || xhrResponse.responseText || xhrResponse.response);

            },(resperr: XMLHttpRequest) => {
                    //var ewsXmlReader = new EwsXmlReader(resperr.responseText || resperr.response);
                    //var util = require('util');
                    //console.log("request error");
                    //console.log(util.inspect(resperr, { showHidden: false, depth: null, colors: true }));
                    ////console.log(util.inspect(resperr.response, { showHidden: false, depth: null, colors: true }));
                    //console.log(util.inspect(ewsXmlReader.JsonObject, { showHidden: false, depth: null, colors: true }));
                    var exception;
                    try {
                        this.ProcessWebException(resperr);
                    }
                    catch (exc) {
                        exception = exc;
                    }
                    if (errorDelegate) errorDelegate(exception || resperr.responseText || resperr.response);
                });
        });

    }
    static IsRedirectionResponse(httpWebResponse: XMLHttpRequest): boolean {
        return (httpWebResponse.status == 302 /*System.Net.HttpStatusCode.Redirect*/) ||
            (httpWebResponse.status == 301 /*System.Net.HttpStatusCode.Moved*/) ||
            (httpWebResponse.status == 307 /*System.Net.HttpStatusCode.RedirectKeepVerb*/) ||
            (httpWebResponse.status == 303 /*System.Net.HttpStatusCode.RedirectMethod*/);
    }
    LoadFromXml(reader: EwsXmlReader): AutodiscoverResponse {
        var elementName = this.GetResponseXmlElementName();
        reader.ReadStartElement(XmlNamespace.Autodiscover, elementName);
        var response = this.CreateServiceResponse();
        response.LoadFromXml(reader, elementName);
        return response;
    }
    LoadFromObject(obj: any): AutodiscoverResponse {
        var elementName = this.GetResponseXmlElementName();
        obj = obj.Body[elementName];
        var response = this.CreateServiceResponse();
        response.LoadFromJson(obj[XmlElementNames.Response]);
        return response;
    }


    ProcessWebException(webException: XMLHttpRequest): void {
        if (webException.response) {
            //IEwsHttpWebResponse httpWebResponse = this.Service.HttpWebRequestFactory.CreateExceptionResponse(webException);
            var soapFaultDetails: SoapFaultDetails = null;

            if (webException.status == 500 /*System.Net.HttpStatusCode.InternalServerError*/) {
                // If tracing is enabled, we read the entire response into a MemoryStream so that we
                // can pass it along to the ITraceListener. Then we parse the response from the
                // MemoryStream.
                //if (this.Service.IsTraceEnabledFor(TraceFlags.AutodiscoverRequest)) {
                //using(MemoryStream memoryStream = new MemoryStream())
                //{
                //    using(Stream serviceResponseStream = AutodiscoverRequest.GetResponseStream(httpWebResponse))
                //    {
                //        // Copy response to in-memory stream and reset position to start.
                //        EwsUtilities.CopyStream(serviceResponseStream, memoryStream);
                //        memoryStream.Position = 0;
                //    }

                //todo implement tracing to base class.
                //this.Service.TraceResponse(httpWebResponse, memoryStream);

                //var reader = new EwsXmlReader(webException.responseText);
                //soapFaultDetails = this.ReadSoapFault(reader);
                //}
                //}
                //else {
                //    using(Stream stream = AutodiscoverRequest.GetResponseStream(httpWebResponse))
                //    {
                //        EwsXmlReader reader = new EwsXmlReader(stream);
                //        soapFaultDetails = this.ReadSoapFault(reader);
                //    }
                //}
                var reader = new EwsXmlReader(webException.responseText || webException.response);
                soapFaultDetails = this.ReadSoapFault(reader);

                if (soapFaultDetails) {
                    //todo: implement soap fault error throw
                    throw new ServiceResponseException(new ServiceResponse(soapFaultDetails));
                }
            }
            else {
                //todo: fix this
                this.Service.ProcessHttpErrorResponse(webException, webException);
            }
        }
    }
    ReadServerVersionInfo(reader: EwsXmlReader): ExchangeServerInfo {
        var serverInfo = new ExchangeServerInfo();
        do {
            reader.Read();
            switch (reader.LocalName) {
                case XmlElementNames.MajorVersion:
                    serverInfo.MajorVersion = +(reader.ReadElementValue());
                    break;
                case XmlElementNames.MinorVersion:
                    serverInfo.MinorVersion = +(reader.ReadElementValue());
                    break;
                case XmlElementNames.MajorBuildNumber:
                    serverInfo.MajorBuildNumber = +(reader.ReadElementValue());
                    break;
                case XmlElementNames.MinorBuildNumber:
                    serverInfo.MinorBuildNumber = +(reader.ReadElementValue());
                    break;
                case XmlElementNames.Version:
                    serverInfo.VersionString = reader.ReadElementValue();
                    break;
                default:
                    break;
            }

        }
        while (reader.ParentNode.localName === XmlElementNames.ServerVersionInfo);
        //while (!reader.IsEndElement(XmlNamespace.Autodiscover, XmlElementNames.ServerVersionInfo));

        return serverInfo;
    }
    ReadSoapBody(reader: EwsXmlReader): AutodiscoverResponse {
        var responses = this.LoadFromObject(reader.JsonObject);
        return responses

        reader.ReadStartElement(XmlNamespace.Soap, XmlElementNames.SOAPBodyElementName);
        var responses = this.LoadFromXml(reader);
        //reader.ReadEndElement(XmlNamespace.Soap, XmlElementNames.SOAPBodyElementName);
        return responses;
    }
    ReadSoapFault(reader: EwsXmlReader): SoapFaultDetails {
        var soapFaultDetails: SoapFaultDetails = undefined;
        if (reader.JsonObject && reader.JsonObject[XmlElementNames.SOAPBodyElementName])
        {
            var obj = reader.JsonObject[XmlElementNames.SOAPBodyElementName];
            if(obj[XmlElementNames.SOAPFaultElementName])
                soapFaultDetails = SoapFaultDetails.ParseFromJson(obj[XmlElementNames.SOAPFaultElementName]);
        }

        return soapFaultDetails;
        //skipped xml section, using Json only.
        //////try {
        //////    // WCF may not generate an XML declaration.
        //////    reader.Read();
        //////    //if (reader.NodeType == Node.  System.Xml.XmlNodeType.XmlDeclaration) {
        //////    //    reader.Read();
        //////    //}

        //////    if (reader.LocalName != XmlElementNames.SOAPEnvelopeElementName) {
        //////        return soapFaultDetails;
        //////    }

        //////    // Get the namespace URI from the envelope element and use it for the rest of the parsing.
        //////    // If it's not 1.1 or 1.2, we can't continue.
        //////    var soapNamespace: XmlNamespace = EwsUtilities.GetNamespaceFromUri(reader.NamespaceUri);
        //////    if (soapNamespace == XmlNamespace.NotSpecified) {
        //////        return soapFaultDetails;
        //////    }

        //////    reader.Read();

        //////    // Skip SOAP header.
        //////    if (reader.IsElement(soapNamespace, XmlElementNames.SOAPHeaderElementName)) {
        //////        do {
        //////            reader.Read();
        //////        }
        //////        while (reader.HasRecursiveParent(XmlElementNames.SOAPHeaderElementName));

        //////        // Queue up the next read
        //////        //reader.Read(); - no need with nodeiterator/treewalker as the node is already a body Node
        //////    }

        //////    // Parse the fault element contained within the SOAP body.
        //////    if (reader.IsElement(soapNamespace, XmlElementNames.SOAPBodyElementName)) {
        //////        do {
        //////            reader.Read();

        //////            // Parse Fault element
        //////            if (reader.IsElement(soapNamespace, XmlElementNames.SOAPFaultElementName)) {
        //////                soapFaultDetails = SoapFaultDetails.Parse(reader, soapNamespace);
        //////            }
        //////        }
        //////        while (reader.HasRecursiveParent(XmlElementNames.SOAPBodyElementName));
        //////    }
        //////}
        //////catch (XmlException) {
        //////    // If response doesn't contain a valid SOAP fault, just ignore exception and
        //////    // return null for SOAP fault details.
        //////}

        //////return soapFaultDetails;
    }
    ReadSoapHeader(reader: EwsXmlReader): void {
        // Is this the ServerVersionInfo?
        if (reader.IsElement(XmlNamespace.Autodiscover, XmlElementNames.ServerVersionInfo)) {
            this.service.ServerInfo = this.ReadServerVersionInfo(reader);
        }
    }
    ReadSoapHeaders(reader: EwsXmlReader): void {

        this.service.ServerInfo = reader.JsonObject.Header.ServerVersionInfo;
        //return;
        //reader.ReadStartElement(XmlNamespace.Soap, XmlElementNames.SOAPHeaderElementName);
        //do {
        //    reader.Read();

        //    this.ReadSoapHeader(reader);
        //}
        //while (reader.HasRecursiveParent(XmlElementNames.SOAPHeaderElementName));
    }
    Validate(): void {
        //this.Service.Validate();
    }
    WriteAttributesToXml(writer: EwsServiceXmlWriter): any { throw new Error("Not implemented. overridden"); }
    WriteBodyToXml(writer: EwsServiceXmlWriter): void {
        writer.WriteStartElement(XmlNamespace.Autodiscover, this.GetRequestXmlElementName());
        this.WriteAttributesToXml(writer);
        this.WriteElementsToXml(writer);

        writer.WriteEndElement(); // m:this.GetXmlElementName()
    }
    WriteElementsToXml(writer: EwsServiceXmlWriter): any { throw new Error("Not implemented. overridden"); }
    WriteExtraCustomSoapHeadersToXml(writer: EwsServiceXmlWriter): void { }
    WriteSoapRequest(requestUrl: string, //System.Uri,
        writer: EwsServiceXmlWriter): void {

        writer.WriteStartElement(XmlNamespace.Soap, XmlElementNames.SOAPEnvelopeElementName);
        writer.WriteAttributeValue("xmlns", EwsUtilities.AutodiscoverSoapNamespacePrefix, EwsUtilities.AutodiscoverSoapNamespace);
        writer.WriteAttributeValue("xmlns", EwsUtilities.WSAddressingNamespacePrefix, EwsUtilities.WSAddressingNamespace);
        writer.WriteAttributeValue("xmlns", EwsUtilities.EwsXmlSchemaInstanceNamespacePrefix, EwsUtilities.EwsXmlSchemaInstanceNamespace);
        if (writer.RequireWSSecurityUtilityNamespace) {
            writer.WriteAttributeValue("xmlns", EwsUtilities.WSSecurityUtilityNamespacePrefix, EwsUtilities.WSSecurityUtilityNamespace);
        }

        writer.WriteStartElement(XmlNamespace.Soap, XmlElementNames.SOAPHeaderElementName);

        //if (this.Service.Credentials != null) {
        //    this.Service.Credentials.EmitExtraSoapHeaderNamespaceAliases(writer.InternalWriter);
        //}

        writer.WriteElementValue(
            XmlNamespace.Autodiscover,
            XmlElementNames.RequestedServerVersion, //LocalName
            XmlElementNames.RequestedServerVersion, // displayName
            ExchangeVersion[this.Service.RequestedServerVersion]
            );

        writer.WriteElementValue(
            XmlNamespace.WSAddressing,
            XmlElementNames.Action,
            XmlElementNames.Action,
            this.GetWsAddressingActionName());

        writer.WriteElementValue(
            XmlNamespace.WSAddressing,
            XmlElementNames.To,
            XmlElementNames.To,
            requestUrl);//.AbsoluteUri);

        this.WriteExtraCustomSoapHeadersToXml(writer);

        //if (this.Service.Credentials != null) {
        //    this.Service.Credentials.SerializeWSSecurityHeaders(writer.InternalWriter);
        //}

        //this.Service.DoOnSerializeCustomSoapHeaders(writer.InternalWriter);

        writer.WriteEndElement(); // soap:Header

        writer.WriteStartElement(XmlNamespace.Soap, XmlElementNames.SOAPBodyElementName);

        this.WriteBodyToXml(writer);

        writer.WriteEndElement(); // soap:Body
        writer.WriteEndElement(); // soap:Envelope
        writer.Flush();
    }
}

export = AutodiscoverRequest;


//module Microsoft.Exchange.WebServices.Autodiscover {
//}
//import _export = Microsoft.Exchange.WebServices.Autodiscover;
//export = _export;