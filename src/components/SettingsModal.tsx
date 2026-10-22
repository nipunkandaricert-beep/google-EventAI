import { useId, useState } from "react";
import { Modal } from "./primitives";

interface Props {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  remember: boolean;
  usingProxy: boolean;
  onSave: (key: string, remember: boolean) => void;
}

export function SettingsModal({ open, onClose, apiKey, remember, usingProxy, onSave }: Props) {
  const id = useId();
  const [key, setKey] = useState(apiKey);
  const [keep, setKeep] = useState(remember);
  const finish = (k: string, r: boolean) => {
    onSave(k, r);
    onClose();
  };
  return (
    <Modal open={open} title="Gemini settings" onClose={onClose}>
      {usingProxy ? (
        <p className="muted mt-3 text-sm">
          This deployment calls Gemini through a server-side proxy, so no key is needed in the browser.
        </p>
      ) : (
        <>
          <p className="muted mt-3 text-sm">
            Paste a Google AI Studio key to enable AI-written plans. It is kept in memory only and sent straight to
            Google. Anyone with access to this browser tab could read it, so use a restricted, low-quota key, and use a
            proxy for public deployments.
          </p>
          <label htmlFor={`${id}-k`} className="mt-4 block text-sm font-semibold">
            Gemini API key
          </label>
          <input
            id={`${id}-k`}
            type="password"
            autoComplete="off"
            spellCheck={false}
            className="input mt-1"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
            Remember for this browser tab only
          </label>
        </>
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        {!usingProxy && (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => finish("", false)}>
              Clear key
            </button>
            <button type="button" className="btn btn-primary" onClick={() => finish(key, keep)}>
              Save
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
