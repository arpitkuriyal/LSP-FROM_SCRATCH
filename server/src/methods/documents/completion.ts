import { RequestMessage } from "../../server";

type completionItems={
    label:string
}
interface completionList{
    incomplete:boolean;
    items:completionItems[]
}
export const completion=(message:RequestMessage):completionList=>{
    return {
        incomplete:false,
        items:[{label:"hello"},{label:"world"}]
    }
}