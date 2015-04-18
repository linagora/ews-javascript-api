import ServiceResponse = require("./ServiceResponse");
import ServiceResult = require("../../Enumerations/ServiceResult");
import EwsUtilities = require("../EwsUtilities");

class ServiceResponseCollection<TResponse extends ServiceResponse> { // IEnumerable<TResponse> where TResponse : ServiceResponse
    get Count(): number { return this.responses.length; }
    //Item: TResponse;
    get OverallResult(): ServiceResult { return this.overallResult; }
    private responses: TResponse[] = [];// System.Collections.Generic.List<T>;
    private overallResult: ServiceResult = ServiceResult.Success;
    Add(response: TResponse): void {
        EwsUtilities.Assert(
            response != null,
            "EwsResponseList.Add",
            "response is null");

        if (response.Result > this.overallResult) {
            this.overallResult = response.Result;
        }

        this.responses.push(response);
    }
    GetEnumerator(): any { throw new Error("Not implemented."); }
    _propget(index: number) {
        if (index < 0 || index >= this.Count) {
            throw new Error("index out of range: " + index);// ArgumentOutOfRangeException("index", Strings.IndexIsOutOfRange);
        }

        return this.responses[index];
    }

}
export = ServiceResponseCollection;



//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;