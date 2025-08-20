import React, {useEffect, useRef} from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
// Styles required for palette, context pad, and icons
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';

type Props = {
  xml: string;
  height?: number | string;
};

export default function BpmnViewer({xml, height = 500}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<BpmnJS | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    modelerRef.current = new BpmnJS({container: containerRef.current});
    return () => {
      modelerRef.current?.destroy();
      modelerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const m = modelerRef.current;
    if (!m) return;
    m.importXML(xml)
      .then(() => {
        const canvas: any = m.get('canvas');
        canvas.zoom('fit-viewport');
      })
      .catch((err: unknown) => console.error('BPMN import error', err));
  }, [xml]);

  return <div ref={containerRef} style={{width: '100%', height, border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 6}} />;
}
