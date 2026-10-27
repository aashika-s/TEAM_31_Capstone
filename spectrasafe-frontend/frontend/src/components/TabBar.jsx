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






// export default function TabBar({ items, active, onChange }) {
//   return (
//     <div className="w-60 flex-shrink-0 min-h-screen bg-bg-primary border-r border-border-tertiary flex flex-col py-6 px-3 sticky top-0">
//       <div className="px-3 mb-8">
//         <span className="text-lg font-semibold text-text-primary">SpectraSafe</span>
//       </div>
//       <div className="flex flex-col gap-1">
//         {items.map((item) => {
//           const isActive = item.key === active;
//           const Icon = item.icon;
//           return (
//             <button
//               key={item.key}
//               onClick={() => onChange(item.key)}
//               className={`flex items-center gap-3 px-3 py-2.5 rounded-app-md text-sm font-medium text-left transition-colors ${
//                 isActive
//                   ? "bg-accent-bg text-accent"
//                   : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
//               }`}
//             >
//               <Icon size={18} />
//               {item.label}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }









import { IconShieldCheck } from "@tabler/icons-react";
import { useAuth } from "../context/AuthContext";

function initials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TabBar({ items, active, onChange }) {
  const { user } = useAuth();

  return (
    <aside
      className="
        w-64
        flex-shrink-0
        min-h-screen
        bg-bg-primary
        border-r
        border-border-tertiary
        flex
        flex-col
        sticky
        top-0
        self-start
      "
    >
      {/* BRAND */}
      <div className="px-6 pt-6 pb-7">
        <div className="flex items-center gap-3">

          <div
            className="
              w-10
              h-10
              rounded-none
              bg-accent
              text-white
              flex
              items-center
              justify-center
              flex-shrink-0
            "
          >
            <IconShieldCheck
              size={22}
              stroke={1.8}
            />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[21px]
                leading-none
                font-semibold
                text-text-primary
                tracking-[-0.03em]
              "
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
              }}
            >
              SpectraSafe
            </p>

            <p className="text-[11px] text-text-secondary mt-1">
              Food Safety Intelligence
            </p>
          </div>

        </div>
      </div>

      {/* WORKSPACE */}
      <div className="px-3.5">

        <p className="px-2.5 mb-3 text-[12px] font-medium text-text-secondary">
          Workspace
        </p>

        <nav className="flex flex-col gap-1">

          {items.map((item) => {
            const isActive = item.key === active;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange(item.key)}
                className={`
                  relative
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  min-h-[44px]
                  text-left
                  border-none
                  cursor-pointer
                  transition-colors
                  duration-150
                  ${
                    isActive
                      ? "bg-accent-bg text-text-primary font-semibold"
                      : "bg-transparent text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }
                `}
              >

                {isActive && (
                  <span
                    className="
                      absolute
                      left-0
                      top-0
                      bottom-0
                      w-[3px]
                      bg-accent
                    "
                  />
                )}

                <Icon
                  size={19}
                  stroke={isActive ? 2 : 1.8}
                  className="flex-shrink-0"
                />

                <span className="text-[14px]">
                  {item.label}
                </span>

                {item.badge && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-accent" />
                )}

              </button>
            );
          })}

        </nav>
      </div>

      {/* USER / PROFILE */}
<div className="mt-auto border-t border-border-tertiary px-6 py-5">

  <button
    type="button"
    onClick={() => {
      const profileItem = items.find(
        (item) => item.key === "profile"
      );

      if (profileItem) {
        onChange("profile");
      }
    }}
    className="
      w-full
      flex
      items-center
      gap-3
      text-left
      bg-transparent
      border-none
      p-0
      cursor-pointer
      rounded-app-md
      hover:bg-bg-secondary
      transition-colors
      duration-150
    "
  >

    {/* AVATAR */}
    <div
      className="
        w-11
        h-11
        rounded-full
        bg-accent-bg
        text-accent-text
        flex
        items-center
        justify-center
        flex-shrink-0
        text-[13px]
        font-medium
      "
    >
      {initials(user?.name)}
    </div>

    {/* USER DETAILS */}
    <div className="min-w-0">
      <p className="text-[13px] font-semibold text-text-primary truncate">
        {user?.name || "User"}
      </p>

      <p className="text-[11px] text-text-secondary mt-0.5 truncate">
        {user?.organization || "SpectraSafe"}
      </p>
    </div>

  </button>
</div>
    </aside>
  );
}