import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BpmnJS from 'bpmn-js/lib/Modeler';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

function download(filename: string, content: string, type = 'text/xml') {
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BpmnEditorPage() {
  const defaultUrl = useBaseUrl('/bpmn/sample.bpmn');
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnJS | null>(null);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!containerRef.current) return;
    modelerRef.current = new BpmnJS({container: containerRef.current});
    // Load default
    fetch(defaultUrl)
      .then((r) => r.text())
      .then((xml) => modelerRef.current?.importXML(xml))
      .then(() => setStatus('Loaded sample.bpmn'))
      .catch((e) => setStatus(`Load error: ${String(e)}`));
    return () => modelerRef.current?.destroy();
  }, [defaultUrl]);

  async function handleSaveXML() {
    try {
      const result = await (modelerRef.current as any).saveXML({format: true});
      download('diagram.bpmn', result.xml, 'application/xml');
    } catch (e) {
      setStatus(`Save XML error: ${String(e)}`);
    }
  }

  async function handleSaveSVG() {
    try {
      const result = await (modelerRef.current as any).saveSVG();
      download('diagram.svg', result.svg, 'image/svg+xml');
    } catch (e) {
      setStatus(`Save SVG error: ${String(e)}`);
    }
  }

  async function handleOpenFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await (modelerRef.current as any).importXML(text);
      setStatus(`Opened: ${file.name}`);
    } catch (e) {
      setStatus(`Open error: ${String(e)}`);
    }
  }

  return (
    <Layout title="BPMN Editor" description="View, edit, and export BPMN diagrams">
      <main className="container margin-vert--lg">
        <div className="margin-bottom--md">
          <input type="file" accept=".bpmn,.xml" onChange={handleOpenFile} />
          <button className="button button--primary margin-left--sm" onClick={handleSaveXML}>Save XML</button>
          <button className="button button--secondary margin-left--sm" onClick={handleSaveSVG}>Save SVG</button>
          <span className="margin-left--md">{status}</span>
        </div>
        <div ref={containerRef} style={{height: 600, border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 6}} />
      </main>
    </Layout>
  );
}
