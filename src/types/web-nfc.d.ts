interface NDEFRecordInit { recordType: string; data?: string; }
interface NDEFMessageInit { records: NDEFRecordInit[]; }
interface NDEFReader extends EventTarget { write(message: NDEFMessageInit, options?: { overwrite?: boolean }): Promise<void>; scan(options?: { signal?: AbortSignal }): Promise<void>; }
declare var NDEFReader: { prototype: NDEFReader; new(): NDEFReader };
