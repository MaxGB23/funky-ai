/**
 * extension.ts — Color Highlight v2 Entry Point
 *
 * Wires vscode.workspace.getConfiguration('colorHighlight') with the
 * DocumentHighlight lifecycle. One DocumentHighlight instance per open
 * document, disposed and recreated when configuration changes.
 */

import * as vscode from 'vscode';
import { DocumentHighlight } from './document-highlight.js';

// ---------------------------------------------------------------------------
// Config key namespace (matches contributes.configuration in package.json)
// ---------------------------------------------------------------------------
const CONFIG_SECTION = 'colorHighlight';

// ---------------------------------------------------------------------------
// Helper: read clean ViewConfig from VS Code workspace settings
// ---------------------------------------------------------------------------
function readViewConfig(): Record<string, unknown> {
    const cfg = vscode.workspace.getConfiguration(CONFIG_SECTION);

    return {
        markerType:                cfg.get<string>('markerType', 'background'),
        markRuler:                 cfg.get<boolean>('markRuler', false),
        useARGB:                   cfg.get<boolean>('useARGB', false),
        matchWords:                cfg.get<boolean>('matchWords', false),
        matchRgbWithNoFunction:    cfg.get<boolean>('matchRgbWithNoFunction', false),
        rgbWithNoFunctionLanguages: cfg.get<string[]>('rgbWithNoFunctionLanguages', []),
        matchHslWithNoFunction:    cfg.get<boolean>('matchHslWithNoFunction', false),
        hslWithNoFunctionLanguages: cfg.get<string[]>('hslWithNoFunctionLanguages', []),
        sass: {
            includePaths: cfg.get<string[]>('sass.includePaths', []),
        },
    };
}

// ---------------------------------------------------------------------------
// Instance registry
// ---------------------------------------------------------------------------
/** color → DocumentHighlight instance, one per unique document URI */
const instanceMap = new Map<string, DocumentHighlight>();

function getDocumentKey(document: vscode.TextDocument): string {
    return document.uri.toString();
}

// ---------------------------------------------------------------------------
// Lifecycle helpers
// ---------------------------------------------------------------------------

function createForDocument(document: vscode.TextDocument, viewConfig: Record<string, unknown>): void {
    const key = getDocumentKey(document);

    // Avoid duplicate instances
    if (instanceMap.has(key)) {
        return;
    }

    const instance = new DocumentHighlight(document, viewConfig);
    instanceMap.set(key, instance);
    // Trigger an immediate scan so decorations appear without waiting for the
    // first onDidChangeTextDocument event.
    instance.trigger();
}

function disposeDocument(document: vscode.TextDocument): void {
    const key = getDocumentKey(document);
    const instance = instanceMap.get(key);
    if (instance) {
        instance.dispose();
        instanceMap.delete(key);
    }
}

function disposeAll(): void {
    instanceMap.forEach((instance) => instance.dispose());
    instanceMap.clear();
}

function recreateAll(viewConfig: Record<string, unknown>): void {
    // We need to keep track of which documents were open before disposing
    const openDocuments = [...instanceMap.keys()].map((uriStr) => {
        return vscode.workspace.textDocuments.find(
            (doc) => doc.uri.toString() === uriStr
        );
    }).filter((doc): doc is vscode.TextDocument => doc !== undefined);

    disposeAll();

    for (const doc of openDocuments) {
        createForDocument(doc, viewConfig);
    }
}

// ---------------------------------------------------------------------------
// Activate
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext): void {
    let viewConfig = readViewConfig();

    // ── Bootstrap: highlight already-open documents ──────────────────────
    for (const document of vscode.workspace.textDocuments) {
        createForDocument(document, viewConfig);
    }

    // ── React to new documents being opened ─────────────────────────────
    const onDidOpen = vscode.workspace.onDidOpenTextDocument((document) => {
        createForDocument(document, viewConfig);
    });

    // ── React to documents being closed ─────────────────────────────────
    const onDidClose = vscode.workspace.onDidCloseTextDocument((document) => {
        disposeDocument(document);
    });

    // ── React to configuration changes ──────────────────────────────────
    const onConfigChange = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration(CONFIG_SECTION)) {
            viewConfig = readViewConfig();
            // Recreate all instances so they pick up the new config
            recreateAll(viewConfig);
        }
    });

    context.subscriptions.push(onDidOpen, onDidClose, onConfigChange);
}

// ---------------------------------------------------------------------------
// Deactivate
// ---------------------------------------------------------------------------

export function deactivate(): void {
    disposeAll();
}
