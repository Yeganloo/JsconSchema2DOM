//Schems definition
interface Schema{
  $id:string;
  $schema:string;
  $ref:string;
  title:string;
  description:string
  default:any;
  maximum:number;
  exclusiveMaximum:number;
  minimum:number;
  exclusiveMinimum:number;
  maxLength:number;
  minLength:number;
  pattern:string;
  additionalItems:Schema;
  items:Schema|Array<Schema>;
  maxItems:number;
  minItems:number;
  uniqueItems:boolean;
  contains:Schema;
  maxProperties:number;
  minProperties:number;
  additionalProperties:Schema;
  definitions:{[id:string]:Schema};
  properties:{[id:string]:Schema};
  patternProperties:{[id:string]:Schema};
  dependencies:{[id:string]:Schema|Array<string>}
  propertyNames:Schema;
  const:object;
  enum:Array<[string,number,{[id:string]:any}]>;
  enumNames:Array<string>;
  type:string|Array<string>;
  typeName:string;
  required:Array<string>|null;
  format:string;
  allOf:Array<Schema>;
  anyOf:Array<Schema>;
  oneOf:Array<Schema>;
  not:Schema;
}

//Dom Handlers interface
interface SchemaHandler{
  Signiture:Schema;
  Handler:Function;
}

//Settings class
class JsonSchema2DomSetting{
  Handlers:Array<SchemaHandler>=[];
  IdPrefix:string = "";
  CreateForm:boolean=false;
}

//Main Class
class JsonSchema2Dom {
  Settings:JsonSchema2DomSetting;
  constructor(settings:JsonSchema2DomSetting){
    if(settings != null){
      this.Settings = settings;
    }else{
      this.Settings = new JsonSchema2DomSetting();
    }
  }

  //Object Default Processor
  ObjectProcessor(self:JsonSchema2Dom,name:string,schema:Schema,required:boolean):Element{
    let el:Element;
    schema.title = schema.title || name || schema.typeName;
    if(schema.title!=null){
      el = document.createElement("fieldset");
      let lg:Element = document.createElement("legend");
      lg.textContent = schema.title;
      el.appendChild(lg);
    }else{
      el = document.createElement("div");
    }
    if(schema.properties!= null){
      //TODO async process
      for(let prop in schema.properties){
        el.appendChild(self.GetHandler(self,schema.properties[prop])(self,prop,schema.properties[prop],schema.required.indexOf(name) != -1));
      }
    }
    return el;
  }

  //Determine handler of a Schema
  GetHandler(self:JsonSchema2Dom,schema:Schema):Function{
    if(this.Settings.Handlers.length>0){
      //TODO Check Signiture to find DOM creator
    }else{
      if(schema.format!=null){
        return self.InputProcessor;
      }else{
        switch(schema.type){
          case "object":
          return self.ObjectProcessor;
          default:
          return self.InputProcessor;
        }
      }
    }
    return self.ObjectProcessor;
  }

  //
  InputProcessor(self:JsonSchema2Dom,name:string,schema:Schema,required:boolean):Element{
    let el:Element;
    el = document.createElement("input");
    el.setAttribute("id",self.Settings.IdPrefix + name);
    el.setAttribute("name",name);
    if(required){
      el.setAttribute("required","");
    }
    schema.title = schema.title || name || schema.typeName;
    if(schema.title != null){
      var lb = document.createElement("label");
      lb.textContent = schema.title;
      lb.appendChild(el);
      el = lb;
    }
    if(schema.description!=null){
      el.setAttribute("title",schema.description);
    }
    return el;
  }

  Parse(schema:Schema):Element{
    let Container:Element = this.GetHandler(this,schema)(this,null,schema,false);
    return Container;
  }


}
