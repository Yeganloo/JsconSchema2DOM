class Schema{
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

class Setting{
  Handlers:{[id:string]:Function}={};
  constructor(handlers:{[id:string]:Function}){
    this.Handlers["title"] = function(title:string){
        if(title != null){
        let container:Element = document.createElement("fieldset");
        let lg:Element = document.createElement("legend");
        lg.textContent = title;
        container.appendChild(lg);
        return container;
      }
    }

    this.Handlers["properties"] = function(properties:Array<Schema>,container:Element,required:Array<string>){
      if(required == null){
        required = [];
      }
      for(var prop in properties){
        let el:Element;
        if(properties[prop].format == null){
          switch(properties[prop].type){
            case "string":
            case ["string","null"]:
            default:
              if(properties[prop].maxLength == null || properties[prop].maxLength <= 150){
                el = document.createElement("input");
              }else{
                el = document.createElement("textarea");
              }

              el.setAttribute("type","text");
              if(properties[prop].pattern!=null){
                el.setAttribute("pattern",properties[prop].pattern);
              }
            break;
            case "number":
            case "integer":
              el = document.createElement("input");
              el.setAttribute("type","number");
            break;
            case "object":
            continue;

          }
        }else{
          switch(properties[prop].format){
            case "email":
              el = document.createElement("input");
              el.setAttribute("type","email");
            break;
            default:
              el = document.createElement("input");
              el.setAttribute("type","text");
              if(properties[prop].pattern!=null){
                el.setAttribute("pattern",properties[prop].pattern);
            }
          }
        }
        el.setAttribute("name",prop);
        if(required.indexOf(prop) != -1){
          el.setAttribute("required","");
        }
        container.appendChild(el);

      }
    }

    if(handlers != null)
      for(var id in handlers){
        this.Handlers[id] = handlers[id];
      }
  }
}

class JsonSchema2Dom {
  Settings:Setting;
  constructor(settings:Setting){
    if(settings != null){
      this.Settings = settings;
    }else{
      this.Settings = new Setting(null);
    }

  }

  Parse(schema:Schema):Element{
    let Container:Element = this.Settings.Handlers["title"](schema.title);
    this.Settings.Handlers["properties"](schema.properties,Container,schema.required);
    return Container;
  }


}
