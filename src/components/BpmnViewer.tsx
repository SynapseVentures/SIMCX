import React, {useEffect, useRef} from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';

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

  return <div ref={containerRef} style={{width: '100%', height}} />;
}
