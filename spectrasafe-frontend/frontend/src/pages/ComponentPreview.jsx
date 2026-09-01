import { useState } from "react";
import {
  IconHome, IconCamera, IconStack, IconHistory, IconUser,
  IconCircleCheck, IconAlertTriangle, IconCircleX, IconDownload,
} from "@tabler/icons-react";
import Screen, { ScreenContent } from "../components/Screen";
import TopBar from "../components/TopBar";
import TabBar from "../components/TabBar";
import Card, { CardTitle, CardSub } from "../components/Card";
import Pill from "../components/Pill";
import Avatar from "../components/Avatar";
import MetricRow from "../components/MetricRow";
import ListItem from "../components/ListItem";
import SectionLabel from "../components/SectionLabel";
import ScanBox from "../components/ScanBox";
import ProgressBar from "../components/ProgressBar";
import { ButtonPrimary, ButtonOutline } from "../components/Button";

const TABS = [
  { key: "home", label: "Home", icon: IconHome },
  { key: "scan", label: "Scan", icon: IconCamera },
  { key: "batch", label: "Batch", icon: IconStack },
  { key: "history", label: "History", icon: IconHistory },
  { key: "profile", label: "Profile", icon: IconUser },
];

// Every value below is placeholder content for visually checking the
// component library against the wireframe -- none of it comes from the
// API. Real data wiring happens in phase 3 (Shopkeeper: Home -> Scan ->
// Result).
export default function ComponentPreview() {
  const [tab, setTab] = useState("home");

  return (
    <Screen
      tabBar={<TabBar items={TABS} active={tab} onChange={setTab} />}
    >
      <TopBar
        title="Component preview"
        right={<Avatar initials="SK" />}
      />
      <ScreenContent>
        <p className="text-xs text-text-secondary mb-3.5">
          Phase 1 deliverable — every shared component, composed once, checked against the wireframe's tokens.
        </p>

        <MetricRow
          metrics={[
            { value: 47, label: "Scans today" },
            { value: 3, label: "Flagged", color: "var(--color-fail-text)" },
          ]}
        />

        <ScanBox onClick={() => {}} />

        <div className="flex gap-2 mb-3">
          <Pill status="COMPLIANT">Pass</Pill>
          <Pill status="NEEDS_REVIEW">Warn</Pill>
          <Pill status="NON_COMPLIANT">Fail</Pill>
          <Pill status="NOT_REGISTERED">Info</Pill>
          <Pill variant="purple">Brand</Pill>
        </div>

        <SectionLabel>Recent scans</SectionLabel>
        <Card>
          <ListItem
            icon={<IconCircleCheck size={16} />}
            iconColor="green"
            title="Lays Classic Chips"
            sub="Compliant · 2 min ago"
            right={<Pill status="COMPLIANT">Pass</Pill>}
            onClick={() => {}}
          />
          <ListItem
            icon={<IconAlertTriangle size={16} />}
            iconColor="amber"
            title="Amul Butter 100g"
            sub="1 allergen issue · 15 min ago"
            right={<Pill status="NEEDS_REVIEW">Warn</Pill>}
            onClick={() => {}}
          />
          <ListItem
            icon={<IconCircleX size={16} />}
            iconColor="red"
            title="Unknown Brand Juice"
            sub="Non-compliant · 1 hr ago"
            right={<Pill status="NON_COMPLIANT">Fail</Pill>}
            onClick={() => {}}
          />
        </Card>

        <SectionLabel>Compliance score example</SectionLabel>
        <Card>
          <CardTitle>FSSAI</CardTitle>
          <ProgressBar value={92} variant="pass" />
          <CardSub className="mt-3">EU 1169</CardSub>
          <ProgressBar value={78} variant="warn" />
          <CardSub className="mt-3">Canada CFIA</CardSub>
          <ProgressBar value={40} variant="fail" />
        </Card>

        <ButtonPrimary>
          <IconDownload size={16} className="inline mr-1 -mt-0.5" />
          Primary button
        </ButtonPrimary>
        <ButtonOutline>Outline button</ButtonOutline>
      </ScreenContent>
    </Screen>
  );
}
