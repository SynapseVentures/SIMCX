import React, {useEffect, useRef, useState} from 'react';
import Modeler from 'bpmn-js/lib/Modeler';
import Viewer from 'bpmn-js/lib/Viewer';
// Styles required for palette, context pad, and icons
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

type Props = {
  xml: string;
  height?: number | string;
  readOnly?: boolean; // default true => Viewer
  showControls?: boolean; // show Save XML/SVG when not readOnly
};

export default function BpmnViewer({xml, height = 500, readOnly = true, showControls = false}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Modeler | Viewer | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;
    // destroy previous
    instanceRef.current?.destroy();
    instanceRef.current = null;
    // create new instance depending on mode
    instanceRef.current = readOnly
      ? new (Viewer as any)({container: containerRef.current})
      : new (Modeler as any)({container: containerRef.current});
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [readOnly]);

  useEffect(() => {
    const m = instanceRef.current as any;
    if (!m) return;
    m.importXML(xml)
      .then(() => {
        const canvas: any = m.get('canvas');
        canvas.zoom('fit-viewport');
        setStatus("");
      })
      .catch((err: unknown) => {
        console.error('BPMN import error', err);
        setStatus('Load error');
      });
  }, [xml]);
  async function handleSaveXML() {
    try {
      const result = await (instanceRef.current as any)?.saveXML({format: true});
      const blob = new Blob([result.xml], {type: 'application/xml'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.bpmn';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Saved XML');
    } catch (e) {
      setStatus(`Save XML error`);
    }
  }

  async function handleSaveSVG() {
    try {
      const result = await (instanceRef.current as any)?.saveSVG();
      const blob = new Blob([result.svg], {type: 'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Saved SVG');
    } catch (e) {
      setStatus(`Save SVG error`);
    }
  }

  return (
    <div>
      {!readOnly && showControls && (
        <div className="margin-bottom--sm">
          <button className="button button--primary button--sm" onClick={handleSaveXML}>Save XML</button>
          <button className="button button--secondary button--sm margin-left--sm" onClick={handleSaveSVG}>Save SVG</button>
          {status && <span className="margin-left--sm">{status}</span>}
        </div>
      )}
      <div ref={containerRef} style={{width: '100%', height, border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 6}} />
    </div>
  );
}
