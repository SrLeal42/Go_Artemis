import { useState } from 'react';

import AboutContent from './modals/AboutContent';
import TutorialContent from './modals/TutorialContent';
import DocsContent from './modals/DocsContent';

type TabId = 'about' | 'tutorial' | 'docs';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('tutorial');

  if (!isOpen) return null;

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        
        <button className="help-modal-close" onClick={onClose}>✕</button>

        {/* ── Abas ── */}
        <div className="help-tabs">
          {(['about', 'tutorial', 'docs'] as TabId[]).map((tab) => (
            <button
              key={tab}
              className={`help-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'about' && 'Sobre'}
              {tab === 'tutorial' && 'Tutorial'}
              {tab === 'docs' && 'Documentação'}
            </button>
          ))}
        </div>

        <div className="help-modal-body">
          {activeTab === 'about'    && <AboutContent />}
          {activeTab === 'tutorial' && <TutorialContent />}
          {activeTab === 'docs'     && <DocsContent />}
        </div>

      </div>
    </div>
  );
}
