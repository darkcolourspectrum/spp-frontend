interface StudioTabsProps {
  activeTab: 'classrooms' | 'settings';
  onTabChange: (tab: 'classrooms' | 'settings') => void;
}

const StudioTabs = ({ activeTab, onTabChange }: StudioTabsProps) => {
  return (
    <div className="studio-tabs">
      <button
        className={`tab-button ${activeTab === 'classrooms' ? 'active' : ''}`}
        onClick={() => onTabChange('classrooms')}
      >
        Кабинеты
      </button>
      <button
        className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        Настройки
      </button>
    </div>
  );
};

export default StudioTabs;