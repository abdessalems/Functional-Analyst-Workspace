import * as React from "react";

/**
 * Small, dependency-free tokenisers for the three languages the workspace has
 * to display: SQL, JSON and PlantUML. They emit spans with `tok-*` classes that
 * are themed in `globals.css`, so highlighting works in both colour schemes.
 */

type Token = { text: string; className?: string };

const SQL_KEYWORDS = new Set(
  `SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER FULL ON GROUP BY HAVING ORDER ASC DESC INSERT INTO
   VALUES UPDATE SET DELETE CREATE TABLE VIEW INDEX ALTER DROP AND OR NOT IN EXISTS BETWEEN LIKE IS
   NULL AS CASE WHEN THEN ELSE END WITH UNION ALL DISTINCT LIMIT FETCH FIRST ROWS ONLY OVER PARTITION
   WITHIN INTERVAL DATE TIMESTAMP TRUNC COUNT SUM AVG MIN MAX ROUND CAST PERCENTILE_CONT SYSTIMESTAMP
   HOUR SECOND MINUTE DAY`
    .split(/\s+/)
    .filter(Boolean),
);

export function highlightSql(code: string): React.ReactNode {
  const tokens: Token[] = [];
  const pattern =
    /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_$.]*)|(\s+)|([^\s])/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    const [text, comment, str, num, word] = match;
    if (comment) tokens.push({ text, className: "tok-comment" });
    else if (str) tokens.push({ text, className: "tok-string" });
    else if (num) tokens.push({ text, className: "tok-number" });
    else if (word) {
      tokens.push(
        SQL_KEYWORDS.has(word.toUpperCase())
          ? { text, className: "tok-keyword" }
          : { text },
      );
    } else tokens.push({ text });
  }

  return renderTokens(tokens);
}

export function highlightJson(code: string): React.ReactNode {
  const tokens: Token[] = [];
  // Every alternative consumes at least one character, so the loop always advances.
  const pattern =
    /("(?:\\.|[^"\\])*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b|(\s+)|([^\s])/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    const [text, str, colon, num, literal] = match;
    if (str) {
      tokens.push({ text: str, className: colon ? "tok-key" : "tok-string" });
      if (colon) tokens.push({ text: colon });
    } else if (num) tokens.push({ text, className: "tok-number" });
    else if (literal) tokens.push({ text, className: "tok-boolean" });
    else tokens.push({ text });
  }

  return renderTokens(tokens);
}

const PLANTUML_KEYWORDS =
  /^(@startuml|@enduml|actor|participant|usecase|rectangle|package|database|cloud|component|start|stop|if|else|elseif|endif|activate|deactivate|autonumber|skinparam|left|right|to|direction|state)\b/i;

export function highlightPlantUml(code: string): React.ReactNode {
  return code.split("\n").map((line, index) => {
    const trimmed = line.trimStart();
    let className: string | undefined;

    if (trimmed.startsWith("'") || trimmed.startsWith("//")) className = "tok-comment";
    else if (PLANTUML_KEYWORDS.test(trimmed)) className = "tok-keyword";
    else if (/-{1,2}>|\.{2}>|<-{1,2}/.test(trimmed)) className = "tok-operator";

    return (
      <span key={index} className={className}>
        {line}
        {"\n"}
      </span>
    );
  });
}

function renderTokens(tokens: Token[]): React.ReactNode {
  return tokens.map((token, index) =>
    token.className ? (
      <span key={index} className={token.className}>
        {token.text}
      </span>
    ) : (
      <React.Fragment key={index}>{token.text}</React.Fragment>
    ),
  );
}
