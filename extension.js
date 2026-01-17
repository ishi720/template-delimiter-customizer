const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

/**
 * 正規表現用にエスケープ
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 設定からデリミタを取得
 */
function getDelimiters() {
    const config = vscode.workspace.getConfiguration('smartyCustom');
    return {
        left: config.get('leftDelimiter', '{'),
        right: config.get('rightDelimiter', '}'),
        commentStart: config.get('commentStart', '{*'),
        commentEnd: config.get('commentEnd', '*}')
    };
}

/**
 * language-configuration.json を生成
 */
function generateLanguageConfig(delimiters) {
    return {
        "comments": {
            "blockComment": [delimiters.commentStart, delimiters.commentEnd]
        },
        "brackets": [
            [delimiters.left, delimiters.right],
            ["<", ">"],
            ["[", "]"],
            ["(", ")"],
            ["{", "}"]
        ],
        "autoClosingPairs": [
            { "open": delimiters.left, "close": delimiters.right },
            { "open": "[", "close": "]" },
            { "open": "(", "close": ")" },
            { "open": "{", "close": "}" },
            { "open": "\"", "close": "\"", "notIn": ["string"] },
            { "open": "'", "close": "'", "notIn": ["string"] },
            { "open": "<!--", "close": "-->" }
        ],
        "surroundingPairs": [
            [delimiters.left, delimiters.right],
            ["[", "]"],
            ["(", ")"],
            ["{", "}"],
            ["\"", "\""],
            ["'", "'"]
        ],
        "folding": {
            "markers": {
                "start": escapeRegex(delimiters.left) + "(if|foreach|for|while|section|literal|capture|function|block)",
                "end": escapeRegex(delimiters.left) + "/(if|foreach|for|while|section|literal|capture|function|block)" + escapeRegex(delimiters.right)
            }
        },
        "indentationRules": {
            "increaseIndentPattern": escapeRegex(delimiters.left) + "(if|foreach|for|while|section|literal|capture|function|block)[^}]*" + escapeRegex(delimiters.right),
            "decreaseIndentPattern": escapeRegex(delimiters.left) + "/(if|foreach|for|while|section|literal|capture|function|block)" + escapeRegex(delimiters.right)
        }
    };
}

/**
 * tmLanguage.json を生成
 */
function generateTmLanguage(delimiters) {
    const leftEsc = escapeRegex(delimiters.left);
    const rightEsc = escapeRegex(delimiters.right);
    const commentStartEsc = escapeRegex(delimiters.commentStart);
    const commentEndEsc = escapeRegex(delimiters.commentEnd);

    return {
        "$schema": "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
        "name": "Smarty Custom Delimiter",
        "scopeName": "text.html.smarty-custom",
        "patterns": [
            { "include": "#smarty-comment" },
            { "include": "#smarty-literal" },
            { "include": "#smarty-block" },
            { "include": "#smarty-tag" },
            { "include": "text.html.basic" }
        ],
        "repository": {
            "smarty-comment": {
                "name": "comment.block.smarty",
                "begin": commentStartEsc,
                "end": commentEndEsc,
                "captures": {
                    "0": { "name": "punctuation.definition.comment.smarty" }
                }
            },
            "smarty-literal": {
                "name": "meta.literal.smarty",
                "begin": leftEsc + "literal" + rightEsc,
                "end": leftEsc + "/literal" + rightEsc,
                "beginCaptures": {
                    "0": { "name": "keyword.control.smarty" }
                },
                "endCaptures": {
                    "0": { "name": "keyword.control.smarty" }
                }
            },
            "smarty-block": {
                "name": "meta.tag.smarty",
                "begin": "(" + leftEsc + ")(/?)\\s*(if|elseif|else|foreach|for|while|section|sectionelse|capture|function|block|strip|nocache|setfilter)",
                "end": "(" + rightEsc + ")",
                "beginCaptures": {
                    "1": { "name": "punctuation.section.embedded.begin.smarty" },
                    "2": { "name": "keyword.control.smarty" },
                    "3": { "name": "keyword.control.smarty" }
                },
                "endCaptures": {
                    "1": { "name": "punctuation.section.embedded.end.smarty" }
                },
                "patterns": [
                    { "include": "#smarty-expression" }
                ]
            },
            "smarty-tag": {
                "name": "meta.tag.smarty",
                "begin": "(" + leftEsc + ")",
                "end": "(" + rightEsc + ")",
                "beginCaptures": {
                    "1": { "name": "punctuation.section.embedded.begin.smarty" }
                },
                "endCaptures": {
                    "1": { "name": "punctuation.section.embedded.end.smarty" }
                },
                "patterns": [
                    { "include": "#smarty-expression" }
                ]
            },
            "smarty-expression": {
                "patterns": [
                    { "include": "#smarty-variable" },
                    { "include": "#smarty-function" },
                    { "include": "#smarty-modifier" },
                    { "include": "#smarty-string" },
                    { "include": "#smarty-number" },
                    { "include": "#smarty-operator" },
                    { "include": "#smarty-parameter" }
                ]
            },
            "smarty-variable": {
                "patterns": [
                    {
                        "name": "variable.other.smarty",
                        "match": "\\$[a-zA-Z_][a-zA-Z0-9_]*"
                    },
                    {
                        "name": "variable.other.member.smarty",
                        "match": "(?<=\\.|->)[a-zA-Z_][a-zA-Z0-9_]*"
                    }
                ]
            },
            "smarty-function": {
                "name": "support.function.built-in.smarty",
                "match": "\\b(include|assign|append|config_load|debug|extends|insert|ldelim|rdelim|math|counter|cycle|eval|fetch|html_checkboxes|html_image|html_options|html_radios|html_select_date|html_select_time|html_table|mailto|popup|popup_init|spacify|textformat)\\b"
            },
            "smarty-modifier": {
                "name": "support.function.modifier.smarty",
                "match": "\\|[a-zA-Z_][a-zA-Z0-9_]*"
            },
            "smarty-string": {
                "patterns": [
                    {
                        "name": "string.quoted.double.smarty",
                        "begin": "\"",
                        "end": "\"",
                        "patterns": [
                            { "include": "#smarty-variable" },
                            {
                                "name": "constant.character.escape.smarty",
                                "match": "\\\\."
                            }
                        ]
                    },
                    {
                        "name": "string.quoted.single.smarty",
                        "begin": "'",
                        "end": "'",
                        "patterns": [
                            {
                                "name": "constant.character.escape.smarty",
                                "match": "\\\\."
                            }
                        ]
                    }
                ]
            },
            "smarty-number": {
                "name": "constant.numeric.smarty",
                "match": "\\b[0-9]+(\\.[0-9]+)?\\b"
            },
            "smarty-operator": {
                "name": "keyword.operator.smarty",
                "match": "(===?|!==?|<=?|>=?|&&|\\|\\||\\+|-|\\*|/|%|\\b(eq|ne|neq|gt|lt|ge|gte|le|lte|not|mod|and|or)\\b)"
            },
            "smarty-parameter": {
                "name": "variable.parameter.smarty",
                "match": "\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*=)"
            }
        }
    };
}

/**
 * 設定ファイルを書き出し
 */
function writeConfigFiles(context) {
    const delimiters = getDelimiters();
    const extensionPath = context.extensionPath;

    // language-configuration.json
    const langConfigPath = path.join(extensionPath, 'language-configuration.json');
    const langConfig = generateLanguageConfig(delimiters);
    fs.writeFileSync(langConfigPath, JSON.stringify(langConfig, null, 2));

    // syntaxes/smarty.tmLanguage.json
    const tmLanguagePath = path.join(extensionPath, 'syntaxes', 'smarty.tmLanguage.json');
    const tmLanguage = generateTmLanguage(delimiters);
    fs.writeFileSync(tmLanguagePath, JSON.stringify(tmLanguage, null, 2));

    return delimiters;
}

/**
 * 拡張機能アクティベート
 */
function activate(context) {
    console.log('Smarty Custom Delimiter is now active');

    // 初回起動時に設定ファイルを生成
    try {
        const delimiters = writeConfigFiles(context);
        console.log(`Delimiters: ${delimiters.left} ... ${delimiters.right}`);
    } catch (e) {
        console.error('Failed to write config files:', e);
    }

    // コマンド登録: 手動でデリミタを適用
    const applyCommand = vscode.commands.registerCommand('smartyCustom.applyDelimiters', async () => {
        try {
            writeConfigFiles(context);
            const action = await vscode.window.showInformationMessage(
                'Delimiters updated. Reload window to apply changes.',
                'Reload Now'
            );
            if (action === 'Reload Now') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        } catch (e) {
            vscode.window.showErrorMessage('Failed to update delimiters: ' + e.message);
        }
    });

    // 設定変更を監視
    const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('smartyCustom')) {
            vscode.window.showInformationMessage(
                'Smarty delimiter settings changed. Run "Smarty: Apply Custom Delimiters" command to apply.',
                'Apply Now'
            ).then(action => {
                if (action === 'Apply Now') {
                    vscode.commands.executeCommand('smartyCustom.applyDelimiters');
                }
            });
        }
    });

    context.subscriptions.push(applyCommand, configWatcher);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
