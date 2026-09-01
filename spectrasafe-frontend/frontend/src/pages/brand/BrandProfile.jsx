import { useNavigate } from "react-router-dom";
import { IconBuildingStore, IconMapPin, IconBell, IconShieldLock } from "@tabler/icons-react";
import TopBar from "../../components/TopBar";
import { ScreenContent } from "../../components/Screen";
import Card from "../../components/Card";
import ListItem from "../../components/ListItem";
import Avatar from "../../components/Avatar";
import { ButtonOutline } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

const SECTIONS = [
  { key: "store", label: "Store details", icon: IconBuildingStore },
  { key: "location", label: "Location settings", icon: IconMapPin },
  { key: "notifications", label: "Notifications", icon: IconBell },
  { key: "privacy", label: "Data & privacy", icon: IconShieldLock },
];

export default function ShopProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <TopBar title="Profile" />
      <ScreenContent>
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <Avatar initials={initials(user?.name)} />
            <div>
              <p className="text-[15px] font-medium text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.organization || "No store details on file"}</p>
            </div>
          </div>
          <span className="inline-block text-xs px-2.5 py-1 rounded-full border border-border-tertiary text-text-secondary">
            Shopkeeper
          </span>
        </Card>

        <Card>
          {SECTIONS.map((s) => (
            <ListItem key={s.key} icon={<s.icon size={16} />} title={s.label} sub="Coming in a later phase" />
          ))}
        </Card>

        <ButtonOutline
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="
    w-full
    px-4 py-2.5
    rounded-app-md
    bg-red-600
    text-sm font-medium
    text-black
    hover:bg-red-700
    transition-colors
  "
        >
          Sign out
        </ButtonOutline>
      </ScreenContent>
    </>
  );
}