import React, { useEffect, useState } from 'react';
import { GitHubSettings, loadSettings, saveSettings } from '../utils/githubClient';

export default function GitHubSettingsForm() {
  const [settings, setSettings] = useState<GitHubSettings | null>({
    owner: 'SynapseVentures',
    repo: 'SIMCX',
    branch: 'main',
    token: '',
  });
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const s = loadSettings();
    if (s) setSettings(s);
  }, []);

  function update<K extends keyof GitHubSettings>(key: K, value: GitHubSettings[K]) {
  setSettings(prev => ({...(prev as GitHubSettings), [key]: value}));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
  saveSettings(settings as GitHubSettings);
    setSaved('Saved');
    setTimeout(() => setSaved(''), 1500);
  }

  return (
    <form onSubmit={handleSave} style={{display:'grid', gap:8}}>
      <div style={{display:'grid', gap:4}}>
        <label>Owner</label>
        <input value={settings.owner} onChange={(e)=>update('owner', e.target.value)} required />
      </div>
      <div style={{display:'grid', gap:4}}>
        <label>Repo</label>
        <input value={settings.repo} onChange={(e)=>update('repo', e.target.value)} required />
      </div>
      <div style={{display:'grid', gap:4}}>
        <label>Branch</label>
        <input value={settings.branch} onChange={(e)=>update('branch', e.target.value)} required />
      </div>
      <div style={{display:'grid', gap:4}}>
        <label>GitHub Token (contents:read,write)</label>
        <input type="password" value={settings.token} onChange={(e)=>update('token', e.target.value)} placeholder="ghp_..." />
      </div>
      <div>
        <button className="button button--sm button--primary" type="submit">Save</button>
        {saved && <span className="margin-left--sm">{saved}</span>}
      </div>
    </form>
  );
}
