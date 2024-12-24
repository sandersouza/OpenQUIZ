function highlightJSON(json) {
    const jsonStr = JSON.stringify(json, null, 2); // Formata o JSON com indentação
    return jsonStr.replace(
        /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(\.\d+)?([eE][+-]?\d+)?)/g,
        (match) => {
            let cls = "number"; // Classe padrão é número
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = "key"; // Chave JSON
                } else {
                    cls = "string"; // String JSON
                }
            } else if (/true|false/.test(match)) {
                cls = "boolean"; // Booleanos
            } else if (/null/.test(match)) {
                cls = "null"; // Null
            }
            return `<span class="${cls}">${match}</span>`;
        }
    );
}
