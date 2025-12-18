type TabType = 'classrooms' | 'schedule' | 'settings';

interface StudioTabsProps {
  activeTab: TabType;
  availableTabs: TabType[];
  onTabChange: (tab: TabType) => void;
}

const TAB_LABELS: Record<TabType, string> = {
  classrooms: 'Кабинеты',
  schedule: 'Расписание',
  settings: 'Настройки',
};

const StudioTabs = ({ activeTab, availableTabs, onTabChange }: StudioTabsProps) => {
  return (
    <div className="studio-tabs">
      {availableTabs.map((tab) => (
        <button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
};

export default StudioTabs;