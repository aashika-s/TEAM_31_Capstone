// import { useNavigate } from "react-router-dom";
// import { IconIdBadge2, IconMapPin, IconFileExport, IconLock } from "@tabler/icons-react";
// import TopBar from "../../components/TopBar";
// import { ScreenContent } from "../../components/Screen";
// import Card from "../../components/Card";
// import ListItem from "../../components/ListItem";
// import Avatar from "../../components/Avatar";
// import { ButtonOutline } from "../../components/Button";
// import { useAuth } from "../../context/AuthContext";

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// const SECTIONS = [
//   { key: "credentials", label: "Officer ID & credentials", icon: IconIdBadge2 },
//   { key: "zone", label: "Jurisdiction zone", icon: IconMapPin },
//   { key: "reports", label: "Reports & exports", icon: IconFileExport },
//   { key: "security", label: "Security & access", icon: IconLock },
// ];

// export default function FSSAIProfile() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <>
//       <TopBar title="Profile" />
//       <ScreenContent>
//         <Card>
//           <div className="flex items-center gap-3 mb-2">
//             <Avatar initials={initials(user?.name)} />
//             <div>
//               <p className="text-[15px] font-medium text-text-primary">{user?.name}</p>
//               <p className="text-xs text-text-secondary">{user?.organization || "No zone on file"}</p>
//             </div>
//           </div>
//           <span className="inline-block text-xs px-2.5 py-1 rounded-full border border-border-tertiary text-text-secondary">
//             FSSAI Official
//           </span>
//         </Card>

//         <Card>
//           {SECTIONS.map((s) => (
//             <ListItem
//               key={s.key}
//               icon={<s.icon size={16} />}
//               title={s.label}
//               onClick={() => navigate(`/fssai/profile/${s.key}`)}
//             />
//           ))}
//         </Card>

//         <ButtonOutline
//           onClick={() => {
//             logout();
//             navigate("/login");
//           }}
//           className="
//     w-full
//     px-4 py-2.5
//     rounded-app-md
//     bg-red-600
//     text-sm font-medium
//     text-black
//     hover:bg-red-700
//     transition-colors
//   "
//         >
//           Sign out
//         </ButtonOutline>
//       </ScreenContent>
//     </>
//   );
// }
















import { useNavigate } from "react-router-dom";
import {
  IconIdBadge2,
  IconMapPin,
  IconFileExport,
  IconLock,
  IconChevronRight,
  IconShieldCheck,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";

import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Avatar from "../../components/Avatar";
import { ButtonDanger } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

function initials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SECTIONS = [
  {
    key: "credentials",
    label: "Officer ID & credentials",
    description: "View your official identification and credentials",
    icon: IconIdBadge2,
  },
  {
    key: "zone",
    label: "Jurisdiction zone",
    description: "View your assigned jurisdiction and zone details",
    icon: IconMapPin,
  },
  {
    key: "reports",
    label: "Reports & exports",
    description: "Access reports and export-related settings",
    icon: IconFileExport,
  },
  {
    key: "security",
    label: "Security & access",
    description: "Manage your account security and access settings",
    icon: IconLock,
  },
];

export default function FSSAIProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="Profile" />

      <ScreenContent>
        <div className="max-w-[850px] mx-auto">

          {/* PROFILE HEADER */}
          <div className="relative overflow-hidden rounded-2xl bg-bg-primary border border-border-secondary shadow-[var(--shadow-card)] mb-5">
            <div className="h-1.5 bg-accent" />

            <div className="px-6 sm:px-7 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-[68px] h-[68px] rounded-2xl bg-accent-bg flex items-center justify-center ring-4 ring-bg-secondary">
                    <Avatar initials={initials(user?.name)} />
                  </div>

                  <div className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-accent border-[3px] border-bg-primary flex items-center justify-center">
                    <IconShieldCheck
                      size={11}
                      className="text-white"
                      stroke={2.5}
                    />
                  </div>
                </div>

                {/* User information */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[20px] font-bold tracking-[-0.02em] text-text-primary">
                      {user?.name || "FSSAI account"}
                    </h1>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-bg text-accent-text text-[10px] font-semibold">
                      <IconShieldCheck size={11} />
                      FSSAI Official
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary mt-1">
                    {user?.organization || "No zone on file"}
                  </p>

                  <p className="text-[11px] text-text-tertiary mt-2">
                    Manage your FSSAI official account and access preferences.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* ACCOUNT SETTINGS */}
          <div className="mb-5">
            <div className="mb-3 px-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Account settings
              </p>

              <h2 className="text-[17px] font-semibold text-text-primary mt-1">
                Manage your account
              </h2>

              <p className="text-xs text-text-secondary mt-1">
                Manage your credentials, jurisdiction, reports and security.
              </p>
            </div>

            <div className="bg-bg-primary border border-border-secondary rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
              {SECTIONS.map((section, index) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() =>
                      navigate(`/fssai/profile/${section.key}`)
                    }
                    className={`
                      w-full flex items-center gap-4 px-5 py-4 text-left
                      transition-all duration-150
                      hover:bg-bg-secondary group
                      ${
                        index !== SECTIONS.length - 1
                          ? "border-b border-border-tertiary"
                          : ""
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-accent-bg text-accent-text flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                      <Icon size={18} stroke={1.8} />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-accent-text transition-colors">
                        {section.label}
                      </p>

                      <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                        {section.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <IconChevronRight
                      size={17}
                      className="text-text-tertiary flex-shrink-0 group-hover:text-accent-text group-hover:translate-x-0.5 transition-all"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIGN OUT */}
          <div className="bg-bg-primary border border-border-secondary rounded-2xl p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-4">

              <div className="w-9 h-9 rounded-lg bg-fail-bg text-fail-text flex items-center justify-center">
                <IconLogout size={17} />
              </div>

              <div>
                <p className="text-sm font-semibold text-text-primary">
                  Sign out
                </p>

                <p className="text-[11px] text-text-secondary mt-0.5">
                  Sign out of your SpectraSafe account on this device.
                </p>
              </div>

            </div>

            <ButtonDanger
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="
                w-full
                !bg-fail-bg
                !text-fail-text
                !border-fail-text/20
                hover:!bg-[#B42318]
                hover:!text-white
                hover:!border-[#B42318]
              "
            >
              <IconLogout size={16} />
              Sign out
            </ButtonDanger>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <IconUser
              size={12}
              className="text-text-tertiary"
            />

            <p className="text-[10px] text-text-tertiary">
              Your account information is securely associated with your profile.
            </p>
          </div>

        </div>
      </ScreenContent>
    </>
  );
}