/* THIS IS FOR PHONE SCREEN 

export default function TabBar({ items, active, onChange }) {
  // items: [{ key, label, icon: Component }]
  return (
    <div className="flex border-t border-border-tertiary py-2 pb-2.5 bg-bg-primary sticky bottom-0">
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 cursor-pointer bg-transparent border-none text-[10px] ${
              isActive ? "text-accent" : "text-text-tertiary"
            }`}
          >
            <Icon size={20} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

*/






export default function TabBar({ items, active, onChange }) {
  return (
    <div className="w-60 flex-shrink-0 min-h-screen bg-bg-primary border-r border-border-tertiary flex flex-col py-6 px-3 sticky top-0">
      <div className="px-3 mb-8">
        <span className="text-lg font-semibold text-text-primary">SpectraSafe</span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = item.key === active;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-app-md text-sm font-medium text-left transition-colors ${
                isActive
                  ? "bg-accent-bg text-accent"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}