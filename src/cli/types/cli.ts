/**
 * CLI模块类型定义
 */

// 简化的VSCode类型定义，避免依赖实际的vscode模块
interface ExtensionContext {
  globalState: {
    get: (key: string) => any;
    update: (key: string, value: any) => Promise<void>;
    keys: () => string[];
    setKeysForSync: (keys: string[]) => void;
  };
  workspaceState: {
    get: (key: string) => any;
    update: (key: string, value: any) => Promise<void>;
    keys: () => string[];
  };
  subscriptions: any[];
  extensionPath: string;
  extensionUri: any;
  environmentVariableCollection: any;
  storageUri?: any;
  globalStorageUri: any;
  logUri: any;
  extensionMode: number;
  secrets: any;
  extension?: any;
}

interface OutputChannel {
  name: string;
  append: (value: string) => void;
  appendLine: (value: string) => void;
  clear: () => void;
  show: () => void;
  hide: () => void;
  dispose: () => void;
}

interface WorkspaceFolder {
  uri: any;
  name: string;
  index: number;
}

export interface CLIContext {
  extensionContext: ExtensionContext;
  outputChannel: OutputChannel;
  workspaceFolder?: WorkspaceFolder;
}

export interface CLIResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface TaskCreationOptions {
  action: string;
  options: Record<string, any>;
  cwd: string;
  mode: 'cli' | 'gui';
}

export interface CommandDefinition {
  name: string;
  description: string;
  options: CommandOption[];
  handler: (args: any) => Promise<CLIResult>;
}

export interface CommandOption {
  flags: string;
  description: string;
  required?: boolean;
  defaultValue?: any;
}

export interface ParsedArguments {
  command: string;
  args: string[];
  options: Record<string, any>;
}