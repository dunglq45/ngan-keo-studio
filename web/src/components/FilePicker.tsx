import React, {useState} from 'react';

/** Nút chọn file: tự tải lên và báo lỗi tại chỗ */
export const FilePicker: React.FC<{
  accept: string;
  upload: (file: File) => Promise<string>;
  onUploaded: (path: string) => void;
  className?: string;
  children: React.ReactNode;
}> = ({accept, upload, onUploaded, className, children}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onUploaded(await upload(file));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className={className} aria-busy={busy}>
      {busy ? <span className="muted">Đang tải lên…</span> : children}
      <input type="file" accept={accept} onChange={onChange} className="visually-hidden" />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
};
