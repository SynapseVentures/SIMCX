import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import BpmnViewer from '@site/src/components/BpmnViewer';

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_0" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start"/>
  </bpmn:process>
</bpmn:definitions>`;

type Role = 'engineer' | 'analyst' | 'manager';

export default function RolesPage() {
  const [role, setRole] = useState<Role>('engineer');

  const description = useMemo(() => {
    switch (role) {
      case 'engineer':
        return 'Engineer view: technical details, APIs, and runbooks.';
      case 'analyst':
        return 'Analyst view: process steps, data lineage, and KPIs.';
      case 'manager':
        return 'Manager view: milestones, owners, and escalations.';
    }
  }, [role]);

  return (
    <Layout title="Role-based views" description="Toggle views and see BPMN diagrams">
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--3">
            <h3>Role</h3>
            <div className="button-group button-group--block">
              <button className={`button ${role==='engineer'?'button--primary':''}`} onClick={() => setRole('engineer')}>Engineer</button>
              <button className={`button ${role==='analyst'?'button--primary':''}`} onClick={() => setRole('analyst')}>Analyst</button>
              <button className={`button ${role==='manager'?'button--primary':''}`} onClick={() => setRole('manager')}>Manager</button>
            </div>
            <p className="margin-top--md">{description}</p>
          </div>
          <div className="col col--9">
            <h3>Process (BPMN)</h3>
            <BpmnViewer xml={sampleXml} height={420} />
          </div>
        </div>
      </main>
    </Layout>
  );
}
