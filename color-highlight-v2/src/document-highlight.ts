import * as vscode from 'vscode';
import { findScssVars } from './strategies/scss-vars.js';
import { findLessVars } from './strategies/less-vars.js';
import { findStylVars } from './strategies/styl-vars.js';
import { findCssVars } from './strategies/css-vars.js';
import { findColorFunctionsInText } from './strategies/functions.js';
import { findRgbNoFn } from './strategies/rgbWithoutFunction.js';
import { findHslNoFn } from './strategies/hslWithoutFunction.js';
import { findHexARGB, findHexRGBA } from './strategies/hex.js';
import { findHwb } from './strategies/hwb.js';
import { findWords } from './strategies/words.js';
import { DecorationMap } from './lib/decoration-map.js';

export { DecorationMap };

const colorWordsLanguages = ['css', 'scss', 'sass', 'less', 'stylus'];

export class DocumentHighlight {
    private disposed: boolean = false;
    private document: vscode.TextDocument;
    private strategies: any[] = [];
    private decorations: DecorationMap;
    // Debounce timer
    private debounceTimer: NodeJS.Timeout | null = null;
    private listener: vscode.Disposable;

    constructor(document: vscode.TextDocument, viewConfig: any) {
        this.document = document;

        this.strategies = [findColorFunctionsInText, findHwb];

        if (viewConfig.useARGB == true) {
            this.strategies.push(findHexARGB);
        } else {
            this.strategies.push(findHexRGBA);
        }

        if (colorWordsLanguages.indexOf(document.languageId) > -1 || viewConfig.matchWords) {
            this.strategies.push(findWords);
        }

        if (viewConfig.matchRgbWithNoFunction) {
            let isValid = false;

            if (viewConfig.rgbWithNoFunctionLanguages.indexOf('*') > -1) {
                isValid = true;
            }

            if (viewConfig.rgbWithNoFunctionLanguages.indexOf(document.languageId) > -1) {
                isValid = true;
            }

            if (viewConfig.rgbWithNoFunctionLanguages.indexOf(`!${document.languageId}`) > -1) {
                isValid = false;
            }

            if (isValid) this.strategies.push(findRgbNoFn);
        }

        if (viewConfig.matchHslWithNoFunction) {
            let isValid = false;

            if (viewConfig.hslWithNoFunctionLanguages.indexOf('*') > -1) {
                isValid = true;
            }

            if (viewConfig.hslWithNoFunctionLanguages.indexOf(document.languageId) > -1) {
                isValid = true;
            }

            if (viewConfig.hslWithNoFunctionLanguages.indexOf(`!${document.languageId}`) > -1) {
                isValid = false;
            }

            if (isValid) this.strategies.push(findHslNoFn);
        }

        switch (document.languageId) {
            case 'css':
                this.strategies.push(findCssVars);
                break;
            case 'less':
                this.strategies.push(findLessVars);
                break;
            case 'stylus':
                this.strategies.push(findStylVars);
                break;
            case 'sass':
            case 'scss':
                this.strategies.push((text: string) => findScssVars(text, {
                    data: text,
                    cwd: '',
                    extensions: ['.scss', '.sass'],
                    includePaths: viewConfig.sass?.includePaths || []
                }));
                break;
        }

        this.decorations = new DecorationMap({
            markRuler: viewConfig.markRuler ?? false,
            markerType: viewConfig.markerType ?? 'background',
        });
        this.listener = vscode.workspace.onDidChangeTextDocument(({ document }) => this.onUpdate(document));
    }

    /**
     * Trigger an immediate highlight scan for the current document.
     * Call this right after constructing the instance to populate decorations
     * without waiting for the first text-change event.
     */
    public trigger(): void {
        this.onUpdate(this.document);
    }

    private onUpdate(document: vscode.TextDocument = this.document) {
        if (this.disposed || this.document.uri.toString() !== document.uri.toString()) {
            return;
        }

        const text = this.document.getText();
        const version = this.document.version.toString();

        // 🧠 INTELIGENTE DEBOUNCE APLICADO AQUÍ
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Se usa un intervalo de 150ms para evitar cuellos de botella en la compilación de promesas de regex.
        this.debounceTimer = setTimeout(() => {
            if (this.disposed) return;
            this.updateRangeDebounced(text, version);
        }, 150);
    }

    private async updateRangeDebounced(text: string, version: string) {
        try {
            // Ejecutamos las expresiones regulares y mapeos solo despues de que teclea
            const result = await Promise.all(this.strategies.map(fn => fn(text)));

            const actualVersion = this.document.version.toString();
            if (actualVersion !== version) {
                return;
            }

            const flattened = concatAll(result);
            const colorRanges = groupByColor(flattened);

            if (this.disposed) {
                return false;
            }

            const updateStack: any = {};
            this.decorations.keys().forEach((color: string) => {
                updateStack[color] = [];
            });

            for (const color in colorRanges) {
                updateStack[color] = colorRanges[color].map((item: any) => {
                    return new vscode.Range(
                        this.document.positionAt(item.start),
                        this.document.positionAt(item.end)
                    );
                });
            }

            for (const color in updateStack) {
                const decoration = this.decorations.get(color);

                vscode.window.visibleTextEditors
                    .filter(({ document }) => document.uri === this.document.uri)
                    .forEach(editor => editor.setDecorations(decoration, updateStack[color]));
            }
        } catch (error) {
            console.error('[Color Highlight Core] Error applying decorations:', error);
        }
    }

    public dispose() {
        this.disposed = true;
        this.decorations.dispose();
        this.listener.dispose();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
}

function groupByColor(results: any[]) {
    return results.reduce((collection, item) => {
        if (!collection[item.color]) {
            collection[item.color] = [];
        }
        collection[item.color].push(item);
        return collection;
    }, {});
}

function concatAll(arr: any[]) {
    return arr.reduce((result, item) => result.concat(item), []);
}
