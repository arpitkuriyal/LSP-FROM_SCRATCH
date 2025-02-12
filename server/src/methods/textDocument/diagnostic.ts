import { NotificationMessage, RequestMessage } from "../../server";
import { Range } from "../../types"; 
import { documents, TextDocumentIdentifier } from "../../documents";
import log from "../../log";
import { spellingSuggestions } from "../../spellingSuggestions";
namespace DiagnosticSeverity{
    export const Error:1=1
    export const Warning:2=2;
    export const Information:3=3;
    export const Hint:4=4
}
interface DocumentDiagnosticsParams{
    textDocument:TextDocumentIdentifier
}
type DiagnosticSeverity=1|2|3|4;

interface SpellingSuggestionData {
  wordSuggestions: string[];
  type: "spelling-suggestion";
}
export interface Diagnostic {
    range:Range;
    severity:DiagnosticSeverity;
    source:"LSP_From_scratch";
    message:string;
    data:SpellingSuggestionData
}
interface FullDocumentDiagnosticReport{
    kind:"full",
    items:Diagnostic[]
}
export const diagnostic = (
    message: RequestMessage
  ): FullDocumentDiagnosticReport | null => {
    const params = message.params as DocumentDiagnosticsParams;
    const content = documents.get(params.textDocument.uri);
    if (!content) {
      return null;
    }
    const wordsInDocument = content.split(/\W/);
    const items: Diagnostic[] = [];
    const lines = content.split("\n");
    const invalidWordsAndSuggestions:Record<string,string[]>=spellingSuggestions(content); 
    log.write({spellingSuggestions: invalidWordsAndSuggestions})
    Object.keys(invalidWordsAndSuggestions).forEach((invalidWord) => {
      const regex = new RegExp(`\\b${invalidWord}\\b`, "g");
      const wordSuggestions=invalidWordsAndSuggestions[invalidWord];
      const message=wordSuggestions.length?`${invalidWord}isn't in our dictionary. Did you means :${wordSuggestions.join(", ")}`: `${invalidWord} isn't in our dictionary.`;
      lines.forEach((line, lineNumber) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          items.push({
            source: "LSP_From_scratch",
            severity: DiagnosticSeverity.Error,
            range: {
              start: { line: lineNumber, character: match.index },
              end: {
                line: lineNumber,
                character: match.index + invalidWord.length,
              },
            },
            message,
            data: {
              wordSuggestions,
              type: "spelling-suggestion",
            },
          });
        }
      });
    });
    return {
      kind: "full",
      items,
    };
  };