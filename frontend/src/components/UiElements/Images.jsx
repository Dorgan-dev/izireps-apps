import PageBreadcrumb from "../common/PageBreadCrumb";
import ResponsiveImage from "../ui/images/ResponsiveImage";
import TwoColumnImageGrid from "../ui/images/TwoColumnImageGrid";
import ThreeColumnImageGrid from "../ui/images/ThreeColumnImageGrid";
import ComponentCard from "../common/ComponentCard";
import PageMeta from "../common/PageMeta";

export default function Images() {
  return (
    <>
      <PageMeta
        title="React.js Images Dashboard | IZIReps - React.js Admin Dashboard Template"
        description="This is React.js Images page for IZIReps - React.js Tailwind CSS Admin Dashboard Template"
      />

      <PageBreadcrumb pageTitle="Images" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Responsive image">
          <ResponsiveImage />
        </ComponentCard>
        <ComponentCard title="Image in 2 Grid">
          <TwoColumnImageGrid />
        </ComponentCard>
        <ComponentCard title="Image in 3 Grid">
          <ThreeColumnImageGrid />
        </ComponentCard>
      </div>
    </>
  );
}
