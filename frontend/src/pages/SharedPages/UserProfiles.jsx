import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import UserSecurityCard from "../../components/UserProfile/UserSecurityCard";
import UserDangerZone from "../../components/UserProfile/UserDangerZone";
import PageMeta from "../../components/common/PageMeta";
import { useAuthStore } from "../../store/authStore";

export default function UserProfiles() {
  const { user } = useAuthStore();
  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <PageBreadcrumb items={[{ label: "Profile", path: "/user-profiles" }]} />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserInfoCard user={user} />
          <UserSecurityCard />
          <UserDangerZone />
        </div>
      </div>
    </>
  );
}
