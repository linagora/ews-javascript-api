import PropertyDefinition = require("../../../PropertyDefinitions/PropertyDefinition");
import PropertyDefinitionBase = require("../../../PropertyDefinitions/PropertyDefinitionBase");
import IndexedPropertyDefinition = require("../../../PropertyDefinitions/IndexedPropertyDefinition");
import PropertyDefinitionFlags = require("../../../Enumerations/PropertyDefinitionFlags");

import IOutParam = require("../../../Interfaces/IOutParam");
import altDict = require("../../../AltDictionary");
import StringPropertyDefinitionBaseDictionary = altDict.StringPropertyDefinitionBaseDictionary;
import PropDictionary = altDict.PropDictionary;

import ExtensionMethods = require("../../../ExtensionMethods");
import String = ExtensionMethods.stringFormatting;

import EwsUtilities = require("../../EwsUtilities");

class ServiceObjectSchema {
    //todo: fixing difficulties with following c# code.
    //using PropertyDefinitionDictionary = LazyMember < System.Collections.Generic.Dictionary<string, PropertyDefinitionBase>>;
    //using SchemaTypeList = LazyMember < System.Collections.Generic.List < System.Type>>;
    get FirstClassProperties(): PropertyDefinition[] { return this.firstClassProperties; }//System.Collections.Generic.List<PropertyDefinition>;
    get FirstClassSummaryProperties(): PropertyDefinition[] { return this.firstClassSummaryProperties; }//System.Collections.Generic.List<PropertyDefinition>;
    get IndexedProperties(): IndexedPropertyDefinition[] { return this.indexedProperties; }//System.Collections.Generic.List<IndexedPropertyDefinition>;
    private properties: StringPropertyDefinitionBaseDictionary<string, PropertyDefinition> = new StringPropertyDefinitionBaseDictionary<string, PropertyDefinition>();// System.Collections.Generic.Dictionary<TKey, TValue>;
    private visibleProperties: PropertyDefinition[] = [];//System.Collections.Generic.List<PropertyDefinition>;
    private firstClassProperties: PropertyDefinition[] = [];//System.Collections.Generic.List<PropertyDefinition>;
    private firstClassSummaryProperties: PropertyDefinition[] = [];//System.Collections.Generic.List<PropertyDefinition>;
    private indexedProperties: IndexedPropertyDefinition[] = [];//System.Collections.Generic.List<IndexedPropertyDefinition>;
    private static lockObject: any = {};
    private static allSchemaTypes: string[] = function () { //SchemaTypeList - LazyMember<T>; - using typenames[] temporarily
        var typeList: string[] = [];
        return typeList;
        typeList.push("AppointmentSchema");
        typeList.push("CalendarResponseObjectSchema");
        typeList.push("CancelMeetingMessageSchema");
        typeList.push("ContactGroupSchema");
        typeList.push("ContactSchema");
        typeList.push("ConversationSchema");
        typeList.push("EmailMessageSchema");
        typeList.push("FolderSchema");
        typeList.push("ItemSchema");
        typeList.push("MeetingMessageSchema");
        typeList.push("MeetingRequestSchema");
        typeList.push("MeetingCancellationSchema");
        typeList.push("MeetingResponseSchema");
        typeList.push("PostItemSchema");
        typeList.push("PostReplySchema");
        typeList.push("ResponseMessageSchema");
        typeList.push("ResponseObjectSchema");
        typeList.push("ServiceObjectSchema");
        typeList.push("SearchFolderSchema");
        typeList.push("TaskSchema");

        return typeList;
    } ();
    private static allSchemaProperties = function () {// string[] //LazyMember<T>;
        var propDefDictionary: StringPropertyDefinitionBaseDictionary<string, PropertyDefinitionBase> = new StringPropertyDefinitionBaseDictionary<string, PropertyDefinitionBase>();
        for (var item in ServiceObjectSchema.allSchemaTypes) {
            var type: string = item;
            ServiceObjectSchema.AddSchemaPropertiesToDictionary(type, propDefDictionary);
        }
        return propDefDictionary;
    } ();
    static ExtendedProperties: PropertyDefinition;

    constructor() {
        this.RegisterProperties();
    }


    static AddSchemaPropertiesToDictionary(type: string /*System.Type*/, propDefDictionary: StringPropertyDefinitionBaseDictionary<string, PropertyDefinitionBase> /*System.Collections.Generic.Dictionary<TKey, TValue>*/): void {
        ServiceObjectSchema.ForeachPublicStaticPropertyFieldInType(
            type,
            (propertyDefinition: PropertyDefinition, fieldName: string) => {
                // Some property definitions descend from ServiceObjectPropertyDefinition but don't have
                // a Uri, like ExtendedProperties. Ignore them.
                if (!String.IsNullOrEmpty(propertyDefinition.Uri)) {
                    var existingPropertyDefinition: IOutParam<PropertyDefinitionBase> = { outValue: null };
                    if (propDefDictionary.tryGetValue(propertyDefinition.Uri, existingPropertyDefinition)) {
                        EwsUtilities.Assert(
                            existingPropertyDefinition == propertyDefinition,
                            "Schema.allSchemaProperties.delegate",
                            String.Format("There are at least two distinct property definitions with the following URI: {0}", propertyDefinition.Uri));
                    }
                    else {
                        propDefDictionary.add(propertyDefinition.Uri, propertyDefinition);

                        // The following is a "generic hack" to register properties that are not public and
                        // thus not returned by the above GetFields call. It is currently solely used to register
                        // the MeetingTimeZone property.
                        var associatedInternalProperties: PropertyDefinition[] = propertyDefinition.GetAssociatedInternalProperties();

                        for (var item in associatedInternalProperties) {
                            var associatedInternalProperty: PropertyDefinition = item;
                            propDefDictionary.add(associatedInternalProperty.Uri, associatedInternalProperty);
                        }
                    }
                }
            });
    }
    private static AddSchemaPropertyNamesToDictionary(type: string /*System.Type*/, propertyNameDictionary: PropDictionary<PropertyDefinition, string>  /*System.Collections.Generic.Dictionary<TKey, TValue>*/): void {
        ServiceObjectSchema.ForeachPublicStaticPropertyFieldInType(
            type,
            (propertyDefinition: PropertyDefinition, fieldName: string) =>
            { propertyNameDictionary.add(propertyDefinition, fieldName); });
    }
    static FindPropertyDefinition(uri: string): PropertyDefinitionBase {
        return ServiceObjectSchema.allSchemaProperties.get(uri);
    }
    static ForeachPublicStaticPropertyFieldInType(type: any /*System.Type*/, propFieldDelegate: (propertyDefinition: PropertyDefinition, fieldInfo: any /*FieldInfo*/) => void /*ServiceObjectSchema.PropertyFieldInfoDelegate*/): void {
        var keys = Object.keys(type);
        keys.forEach((s) => {
            if (typeof (type[s]) != "function" && type[s] instanceof (PropertyDefinition)) {
                var propertyDefinition = <PropertyDefinition> type[s];
                propFieldDelegate(propertyDefinition, s);
            }
        });
        //var staticfields = TypeSystem.GetObjectStaticPropertiesByClassName("Microsoft.Exchange.WebServices.Data." + type);

        //for (var field in staticfields) {
        //    if (fieldInfo.FieldType == typeof (PropertyDefinition) || fieldInfo.FieldType.IsSubclassOf(typeof (PropertyDefinition))) {
        //        PropertyDefinition propertyDefinition = (PropertyDefinition) fieldInfo.GetValue(null);
        //        propFieldDelegate(propertyDefinition, fieldInfo);
        //    }
        //}
    }
    GetEnumerator(): PropertyDefinition[] { return this.visibleProperties; }
    static InitializeSchemaPropertyNames(): void {
        //lock(lockObject)
        //{
        for (var item in ServiceObjectSchema.allSchemaTypes) {
            var type: string = item;
            ServiceObjectSchema.ForeachPublicStaticPropertyFieldInType(
                type,
                (propDef: PropertyDefinition, fieldName: string) => { propDef.Name = fieldName; });
        }
        //}
    }
    RegisterIndexedProperty(indexedProperty: IndexedPropertyDefinition): void { this.indexedProperties.push(indexedProperty); }
    RegisterInternalProperty(property: PropertyDefinition): void { this.RegisterProperty(property, true); }
    RegisterProperties(): void { /*virtual void for derived class to implement if needed*/ }
    //RegisterProperty(property: PropertyDefinition): any { throw new Error("Not implemented."); }
    RegisterProperty(property: PropertyDefinition, isInternal: boolean = false): void {
        this.properties.add(property.XmlElementName, property);

        if (!isInternal) {
            this.visibleProperties.push(property);
        }

        // If this property does not have to be requested explicitly, add
        // it to the list of firstClassProperties.
        if (!property.HasFlag(PropertyDefinitionFlags.MustBeExplicitlyLoaded)) {
            this.firstClassProperties.push(property);
        }

        // If this property can be found, add it to the list of firstClassSummaryProperties
        if (property.HasFlag(PropertyDefinitionFlags.CanFind)) {
            this.firstClassSummaryProperties.push(property);
        }
    }
    TryGetPropertyDefinition(xmlElementName: string, propertyDefinition: IOutParam<PropertyDefinition>): boolean {
        return this.properties.tryGetValue(xmlElementName, propertyDefinition);
    }
}

export = ServiceObjectSchema;




//module Microsoft.Exchange.WebServices.Data {
//}
//import _export = Microsoft.Exchange.WebServices.Data;
//export = _export;