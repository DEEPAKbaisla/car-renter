import UserManagement from "./_components/user-management";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings | RideOwn",
  description: "Manage users and settings for RideOwn",
};

const SettingsPage = () => {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage users and platform settings.
        </p>
      </div>
      <UserManagement />
    </div>
  );
};

export default SettingsPage;
