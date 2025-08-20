import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  githubBase?: string; // override base repo URL if needed
  bpmnRelPath?: string; // e.g. /bpmn/role1/process-x.bpmn
  handbookRelDoc?: string; // e.g. /docs/handbook/role1/process-x
};

// Renders small buttons that deep-link to GitHub's web editor for relevant assets.
// For docs pages, Docusaurus already adds Edit links; this complements for BPMN/static assets.
export default function EditOnGitHub({
  githubBase = 'https://github.com/SynapseVentures/SIMCX',
  bpmnRelPath,
  handbookRelDoc,
}: Props) {
  const baseUrl = useBaseUrl('/'); // ensures base path awareness when building links

  // We host BPMN under static/bpmn; map rel like /bpmn/role1/process-x.bpmn -> npm/airbus-knowledge/static/bpmn/role1/process-x.bpmn
  const bpmnEditUrl = bpmnRelPath
    ? `${githubBase}/edit/main/npm/airbus-knowledge/static${bpmnRelPath}`
    : undefined;

  // Docs are under docs/; handbookRelDoc like /docs/handbook/role1/process-x -> docs/handbook/role1/process-x.md
  const handbookEditUrl = handbookRelDoc
    ? `${githubBase}/edit/main/npm/airbus-knowledge/docs${handbookRelDoc.replace('/docs', '')}.md`
    : undefined;

  return (
    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
      {bpmnEditUrl && (
        <a
          className="button button--sm button--secondary"
          href={bpmnEditUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit BPMN on GitHub
        </a>
      )}
      {handbookEditUrl && (
        <a
          className="button button--sm button--secondary"
          href={handbookEditUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit Handbook on GitHub
        </a>
      )}
    </div>
  );
}
