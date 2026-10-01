import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { getStoreSettings } from "@/lib/admin/queries";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="How your store runs: contact, delivery, payment and returns."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
