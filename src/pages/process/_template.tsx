import React, { useMemo, useState } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useLocation } from '@docusaurus/router';
import BpmnFromUrl from '../../components/BpmnFromUrl';
import BpmnViewer from '../../components/BpmnViewer';
import EditOnGitHub from '../../components/EditOnGitHub';

// Usage: copy this file to a concrete page like src/pages/process/role1/process-x.tsx
// Then adjust role/process and add your handbook doc.

type Props = {};

export default function RoleProcessTemplate(_props: Props) {
  const role = 'role1';
  const process = 'process-x';
  const bpmnRel = `/bpmn/${role}/${process}.bpmn`;
  const handbookRel = `/docs/handbook/${role}/${process}`;

  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);
  const initialEdit = urlParams.get('edit') === '1';
  const [editMode, setEditMode] = useState<boolean>(initialEdit);

  return (
    <Layout title={`${role} / ${process}`} description={`Process ${process} for ${role}`}>
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8">
            <div className="margin-bottom--sm" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <h2 style={{margin:0}}>BPMN Diagram</h2>
              <div>
                <label style={{display:'inline-flex',alignItems:'center',gap:8}}>
                  <input type="checkbox" checked={editMode} onChange={(e)=>setEditMode(e.target.checked)} />
                  Edit mode
                </label>
                <div className="margin-top--sm">
                  <EditOnGitHub bpmnRelPath={bpmnRel} handbookRelDoc={handbookRel} />
                </div>
              </div>
            </div>
            {editMode ? (
              <BpmnViewer xml={''} readOnly={false} showControls={true} height={600} />
            ) : (
              <BpmnFromUrl src={bpmnRel} height={600} />
            )}
          </div>
          <div className="col col--4">
            <h3>Handbook</h3>
            <p className="margin-bottom--sm">Context, steps, and guidance for this process.</p>
            <a className="button button--sm button--primary" href={useBaseUrl(handbookRel)}>Open handbook</a>
          </div>
        </div>
      </main>
    </Layout>
  );
}
