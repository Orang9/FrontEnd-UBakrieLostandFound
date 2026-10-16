import { useState } from 'react';

export function Tabs({ tabs, defaultTab = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultTab);
  const activeTab = tabs[activeIndex];

  return (
    <div>
      <div className="tabs-list" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`${tab.id}-tab`}
            className={`tab-button${activeIndex === index ? ' is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveIndex(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab && (
        <div
          id={`${activeTab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${activeTab.id}-tab`}
          className="tab-panel"
        >
          {activeTab.content}
        </div>
      )}
    </div>
  );
}
