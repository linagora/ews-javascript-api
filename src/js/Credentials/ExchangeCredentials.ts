import ExtensionMethods = require("../ExtensionMethods");

class ExchangeCredentials {
    //NeedSignature: boolean;
    static WsSecurityPathSuffix: string = "/wssecurity";

    constructor(public UserName: string, public Password: string) {

    }

    AdjustUrl(url: string /*System.Uri*/): string /*System.Uri*/ { return ExchangeCredentials.GetUriWithoutSuffix(url); }
    EmitExtraSoapHeaderNamespaceAliases(writer: any /*System.Xml.XmlWriter*/): void { /*implemented by derived classes*/ }
    static GetUriWithoutSuffix(url: string/*System.Uri*/): string /*System.Uri*/ {
        var index = url.toUpperCase().indexOf(/*WSSecurityBasedCredentials*/ExchangeCredentials.WsSecurityPathSuffix.toUpperCase());//, StringComparison.OrdinalIgnoreCase);
        if (index != -1) {
            return url.substring(0, index);
        }

        return url;
    }
    //PreAuthenticate(): any{ throw new Error("Not implemented.");}
    PrepareWebRequest(request: WinJS.IXHROptions /*IEwsHttpWebRequest*/): void {
        request.headers["Authorization"] = "Basic " + ExtensionMethods.btoa(this.UserName + ":" + this.Password);
    }
    SerializeExtraSoapHeaders(writer: any /*System.Xml.XmlWriter*/, webMethodName: string): void { /*implemented by derived classes*/ }
    //SerializeWSSecurityHeaders(writer: System.Xml.XmlWriter): any{ throw new Error("Not implemented.");}
    //Sign(memoryStream: any): any{ throw new Error("Not implemented.");}
}

export = ExchangeCredentials;


//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;