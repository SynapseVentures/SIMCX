import React, {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BpmnViewer from './BpmnViewer';

type Props = {
  src: string; // path under /static, e.g., /bpmn/sample.bpmn
  height?: number | string;
};

export default function BpmnFromUrl({src, height = 500}: Props) {
  const url = useBaseUrl(src);
  const [xml, setXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setXml(null);
    setError(null);
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        return r.text();
      })
      .then(setXml)
      .catch((e) => setError(String(e)));
  }, [url]);

  if (error) return <div style={{color: 'var(--ifm-color-danger)'}}>Failed to load BPMN: {error}</div>;
  if (!xml) return <div>Loading diagram…</div>;
  return <BpmnViewer xml={xml} height={height} />;
}
