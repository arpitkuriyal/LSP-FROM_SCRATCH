import { RequestMessage } from "../../server";
import { documents, TextDocumentIdentifier } from "../../documents";
import { Position } from "../../types";
import * as fs from "fs";
import log from "../../log";

const words = fs.readFileSync("/usr/share/dict/words").toString().split("\n");
type CompletionItem = {
  label: string;
};
interface CompletionList {
  isIncomplete: boolean;
  items: CompletionItem[];
}

interface TextDocumentPositionParams {
  textDocument: TextDocumentIdentifier;
  position: Position;
}
export interface CompletionParams extends TextDocumentPositionParams {}
export const completion = (message: RequestMessage): CompletionList | null => {
  const params = message.params as CompletionParams;
  const content = documents.get(params.textDocument.uri);
  if (!content) {
    return null;
  }
  const currentLine = content.split("\n")[params.position.line];
  const lineUntilCursor = currentLine.slice(0, params.position.character);
  const currentPrefix = lineUntilCursor.replace(/.*[\W ](.*?)/, "$1");
  const items = words
    .filter((word) => {
      return word.startsWith(currentPrefix);
    })
    .slice(0, 1000)
    .map((word) => {
      return { label: word };
    });
    log.write({
      completion:{
        currentLine,
        lineUntilCursor,
        currentPrefix
      }
    })
  return {
    isIncomplete: true,
    items,
  };
};