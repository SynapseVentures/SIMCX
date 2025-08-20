import React, { useEffect, useMemo, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useLocation } from '@docusaurus/router';
import BpmnFromUrl from '../../components/BpmnFromUrl';
import BpmnViewer from '../../components/BpmnViewer';
import EditOnGitHub from '../../components/EditOnGitHub';
import GitHubSettingsForm from '../../components/GitHubSettingsForm';
import { getFile, loadSettings, putFile } from '../../utils/githubClient';

// Usage: copy this file to a concrete page like src/pages/process/role1/process-x.tsx
// Then adjust role/process and add your handbook doc.

type Props = {};

export default function RoleProcessTemplate(_props: Props) {
  const role = 'role1';
  const process = 'process-x';
  const bpmnRel = `/bpmn/${role}/${process}.bpmn`;
  const handbookRel = `/docs/handbook/${role}/${process}`;
  const handbookPath = `npm/airbus-knowledge/docs/handbook/${role}/${process}.md`;
  const bpmnPath = `npm/airbus-knowledge/static/bpmn/${role}/${process}.bpmn`;

  const { search } = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(search), [search]);
  const initialEdit = urlParams.get('edit') === '1';
  const [editMode, setEditMode] = useState<boolean>(initialEdit);
  const [showSettings, setShowSettings] = useState(false);
  const [md, setMd] = useState<string>('');
  const [mdSha, setMdSha] = useState<string | undefined>(undefined);
  const [mdStatus, setMdStatus] = useState<string>('');
  const [bpmnXml, setBpmnXml] = useState<string>('');
  const [bpmnSha, setBpmnSha] = useState<string | undefined>(undefined);
  const [bpmnStatus, setBpmnStatus] = useState<string>('');

  // Load current handbook Markdown on first toggle into edit mode
  useEffect(() => {
    (async () => {
      if (!editMode) return;
      try {
        const settings = loadSettings();
        if (!settings) return;
        const f = await getFile(settings, handbookPath, settings.branch);
        if (f.content) setMd(f.content);
        if (f.sha) setMdSha(f.sha);
      } catch (e) {
        setMdStatus(`Load error: ${String(e)}`);
      }
    })();
  }, [editMode]);

  // In edit mode, we’ll start with a blank BPMN unless we load from GitHub
  // Offer a Load button to fetch current XML from GitHub.
  async function handleLoadBpmn() {
    try {
      const settings = loadSettings();
      if (!settings) {
        setBpmnStatus('Please configure GitHub settings first');
        setShowSettings(true);
        return;
      }
      const f = await getFile(settings, bpmnPath, settings.branch);
      if (f.content) setBpmnXml(f.content);
      if (f.sha) setBpmnSha(f.sha);
      setBpmnStatus('Loaded from GitHub');
    } catch (e) {
      setBpmnStatus(`Load error: ${String(e)}`);
    }
  }

  async function handleSaveBpmn() {
    try {
      const settings = loadSettings();
      if (!settings) {
        setBpmnStatus('Please configure GitHub settings first');
        setShowSettings(true);
        return;
      }
      // Extract XML from the editor instance by querying the child component via DOM
      // Simpler approach: rely on local state bpmnXml if provided; otherwise, no-op
      if (!bpmnXml) {
        setBpmnStatus('No XML loaded to save');
        return;
      }
      const result = await putFile(
        settings,
        bpmnPath,
        bpmnXml,
        `chore: update BPMN for ${role}/${process}`,
        bpmnSha,
      );
      setBpmnSha(result.sha);
      setBpmnStatus('Saved to GitHub');
    } catch (e) {
      setBpmnStatus(`Save error: ${String(e)}`);
    }
  }

  async function handleSaveMd() {
    try {
      const settings = loadSettings();
      if (!settings) {
        setMdStatus('Please configure GitHub settings first');
        setShowSettings(true);
        return;
      }
      const result = await putFile(
        settings,
        handbookPath,
        md,
        `docs(handbook): update ${role}/${process}`,
        mdSha,
      );
      setMdSha(result.sha);
      setMdStatus('Saved to GitHub');
    } catch (e) {
      setMdStatus(`Save error: ${String(e)}`);
    }
  }

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
              <div>
                <div className="margin-bottom--sm" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                  <button className="button button--sm" onClick={handleLoadBpmn}>Load from GitHub</button>
                  <button className="button button--sm button--primary" onClick={handleSaveBpmn}>Save to GitHub</button>
                  <button className="button button--sm" onClick={()=>setShowSettings(true)}>Settings</button>
                  {bpmnStatus && <span>{bpmnStatus}</span>}
                </div>
                <BpmnViewer xml={bpmnXml || ''} readOnly={false} showControls={true} height={600} />
              </div>
            ) : (
              <BpmnFromUrl src={bpmnRel} height={600} />
            )}
          </div>
          <div className="col col--4">
            <h3>Handbook</h3>
            {!editMode && (
              <>
                <p className="margin-bottom--sm">Context, steps, and guidance for this process.</p>
                <a className="button button--sm button--primary" href={useBaseUrl(handbookRel)}>Open handbook</a>
              </>
            )}
            {editMode && (
              <div>
                <div className="margin-bottom--sm" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                  <button className="button button--sm button--primary" onClick={handleSaveMd}>Save Handbook</button>
                  <button className="button button--sm" onClick={()=>setShowSettings(true)}>Settings</button>
                  {mdStatus && <span>{mdStatus}</span>}
                </div>
                <textarea
                  value={md}
                  onChange={(e)=>setMd(e.target.value)}
                  rows={24}
                  style={{width:'100%'}}
                  placeholder={`# ${process} Handbook\n\nWrite markdown here...`}
                />
              </div>
            )}
          </div>
        </div>
        {showSettings && (
          <div className="margin-top--lg" style={{borderTop:'1px solid var(--ifm-color-emphasis-200)', paddingTop:12}}>
            <h3>GitHub Settings</h3>
            <GitHubSettingsForm />
            <p className="margin-top--sm">Provide a GitHub token with contents:read,write on the target repo/branch to enable saving edits directly from this page.</p>
            <button className="button button--sm" onClick={()=>setShowSettings(false)}>Close</button>
          </div>
        )}
      </main>
    </Layout>
  );
}
